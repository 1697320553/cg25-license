/**
 * Netlify Functions 版本 - 卡密验证服务器
 * 
 * 部署位置：netlify/functions/api.js
 * 需要 netlify.toml 配置路由
 */

const crypto = require('crypto');

const SECRET = process.env.SECRET;
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const VERSION = 0x01;
const PRODUCT_ID = [0xC6, 0x25];

// ========== Upstash Redis 操作（纯 fetch）==========
async function redisGet(key) {
    const res = await fetch(`${UPSTASH_URL}/get/${key}`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    });
    const data = await res.json();
    return data.result;
}

async function redisSet(key, value) {
    // Upstash REST API 的 set 需要用 POST，body 里传 value
    await fetch(`${UPSTASH_URL}/set/${key}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
        body: value
    });
}

// ========== 卡密验证 ==========
function verifyKey(keyStr) {
    const cleaned = keyStr.replace(/[\s\-_]/g, '').toUpperCase();
    if (!cleaned.startsWith('CG25')) return { valid: false, reason: '格式错误' };
    
    const hex = cleaned.substring(4).toLowerCase();
    if (hex.length !== 32 || !/^[0-9a-f]+$/.test(hex)) {
        return { valid: false, reason: '格式错误' };
    }
    
    const keyBytes = Buffer.from(hex, 'hex');
    if (keyBytes[0] !== VERSION) return { valid: false, reason: '版本不匹配' };
    if (keyBytes[1] !== PRODUCT_ID[0] || keyBytes[2] !== PRODUCT_ID[1]) {
        return { valid: false, reason: '产品标识不匹配' };
    }
    
    const payload = keyBytes.subarray(0, 9);
    const signature = keyBytes.subarray(9, 16);
    
    const hmac = crypto.createHmac('sha256', Buffer.from(SECRET, 'utf-8'));
    hmac.update(payload);
    const expectedSig = hmac.digest().subarray(0, 7);
    
    try {
        if (!crypto.timingSafeEqual(signature, expectedSig)) {
            return { valid: false, reason: '卡密无效' };
        }
    } catch {
        return { valid: false, reason: '卡密无效' };
    }
    
    return { valid: true, hex: cleaned };
}

// ========== 设备指纹哈希 ==========
function hashDeviceFingerprint(fp) {
    return crypto.createHash('sha256').update(fp + '||salt').digest('hex');
}

// ========== Netlify Handler ==========
exports.handler = async (event, context) => {
    const method = event.httpMethod;
    const path = event.path; // /.netlify/functions/api/status 或 /api/status
    
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };
    
    if (method === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }
    
    // Parse body
    let body = {};
    if (event.body) {
        try {
            body = JSON.parse(event.body);
        } catch {}
    }
    
    // ---- GET /api/status ----
    if (method === 'GET' && path.endsWith('/status')) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                status: 'running',
                redis: !!UPSTASH_URL,
                secret: !!SECRET,
            })
        };
    }
    
    // ---- POST /api/activate ----
    if (method === 'POST' && path.endsWith('/activate')) {
        if (!SECRET) {
            return { statusCode: 500, headers, body: JSON.stringify({ code: 500, message: '服务器未配置 SECRET' }) };
        }
        if (!UPSTASH_URL) {
            return { statusCode: 500, headers, body: JSON.stringify({ code: 500, message: '服务器未配置 Redis' }) };
        }
        
        const { key, deviceId } = body;
        if (!key || !deviceId) {
            return { statusCode: 400, headers, body: JSON.stringify({ code: 400, message: '缺少参数' }) };
        }
        
        const verifyResult = verifyKey(key);
        if (!verifyResult.valid) {
            return { statusCode: 400, headers, body: JSON.stringify({ code: 400, message: verifyResult.reason }) };
        }
        
        const deviceHash = hashDeviceFingerprint(deviceId);
        const normalizedKey = verifyResult.hex;
        
        const boundDevice = await redisGet(`bind:${normalizedKey}`);
        
        if (boundDevice && boundDevice !== deviceHash) {
            return {
                statusCode: 403, headers,
                body: JSON.stringify({ code: 403, message: '此卡密已在其他设备上激活' })
            };
        }
        
        if (boundDevice === deviceHash) {
            return {
                statusCode: 200, headers,
                body: JSON.stringify({ code: 200, message: '已激活', status: 'already_activated' })
            };
        }
        
        await redisSet(`bind:${normalizedKey}`, deviceHash);
        await redisSet(`device:${deviceHash}`, normalizedKey);
        
        console.log(`[激活] ${normalizedKey.slice(0, 12)}... → ${deviceHash.slice(0, 16)}...`);
        return {
            statusCode: 200, headers,
            body: JSON.stringify({ code: 200, message: '激活成功', status: 'activated' })
        };
    }
    
    // ---- POST /api/check ----
    if (method === 'POST' && path.endsWith('/check')) {
        if (!SECRET) {
            return { statusCode: 500, headers, body: JSON.stringify({ code: 500, message: '服务器未配置 SECRET' }) };
        }
        if (!UPSTASH_URL) {
            return { statusCode: 500, headers, body: JSON.stringify({ code: 500, message: '服务器未配置 Redis' }) };
        }
        
        const { deviceId } = body;
        if (!deviceId) {
            return { statusCode: 400, headers, body: JSON.stringify({ code: 400, message: '缺少参数' }) };
        }
        
        const deviceHash = hashDeviceFingerprint(deviceId);
        const boundKey = await redisGet(`device:${deviceHash}`);
        
        if (boundKey) {
            return { statusCode: 200, headers, body: JSON.stringify({ code: 200, message: '已激活', status: 'active' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify({ code: 200, message: '未激活', status: 'inactive' }) };
    }
    
    return { statusCode: 404, headers, body: JSON.stringify({ code: 404, message: 'Not Found' }) };
};
