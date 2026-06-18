/**
 * Netlify Functions v3 - 卡密验证服务器
 * 
 * v3 更新：
 * - 硬件指纹（hwFingerprint）支持浏览器重装后恢复绑定
 * - 吊销功能（/revoke）管理员一键禁用卡密
 * - bind:* 存储 JSON 格式，支持 status 字段
 * 
 * 部署位置：netlify/functions/api.js
 * 新增环境变量：ADMIN_KEY（管理密钥，用于吊销卡密）
 */

const crypto = require('crypto');

const SECRET = process.env.SECRET;
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const ADMIN_KEY = process.env.ADMIN_KEY || '';
const VERSION = 0x01;
const PRODUCT_ID = [0xC6, 0x25];

// ========== Upstash Redis 操作 ==========
async function redisGet(key) {
    const res = await fetch(`${UPSTASH_URL}/get/${key}`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    });
    const data = await res.json();
    return data.result;
}

async function redisSet(key, value) {
    await fetch(`${UPSTASH_URL}/set/${key}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
        body: value
    });
}

async function redisDel(key) {
    await fetch(`${UPSTASH_URL}/del/${key}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    });
}

// ========== 哈希 ==========
function hashId(id) {
    return crypto.createHash('sha256').update(id + '||salt').digest('hex');
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

// ========== 解析 bind 数据（兼容旧格式）==========
function parseBindData(raw) {
    if (!raw) return null;
    try {
        var d = JSON.parse(raw);
        if (typeof d === 'string') return { deviceHash: d, hwFp: null, status: 'active' };
        return d;
    } catch(e) {
        return { deviceHash: raw, hwFp: null, status: 'active' };
    }
}

// ========== Netlify Handler ==========
exports.handler = async (event, context) => {
    const method = event.httpMethod;
    const path = event.path;
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };
    
    if (method === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }
    
    let body = {};
    if (event.body) {
        try { body = JSON.parse(event.body); } catch {}
    }
    
    // ---- GET /api/status ----
    if (method === 'GET' && path.endsWith('/status')) {
        return {
            statusCode: 200, headers,
            body: JSON.stringify({
                status: 'running',
                redis: !!UPSTASH_URL,
                secret: !!SECRET,
                adminKey: !!ADMIN_KEY
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
        
        const { key, deviceId, hwFingerprint } = body;
        if (!key || !deviceId) {
            return { statusCode: 400, headers, body: JSON.stringify({ code: 400, message: '缺少参数' }) };
        }
        
        const verifyResult = verifyKey(key);
        if (!verifyResult.valid) {
            return { statusCode: 400, headers, body: JSON.stringify({ code: 400, message: verifyResult.reason }) };
        }
        
        const deviceHash = hashId(deviceId);
        const hwFp = hwFingerprint ? hashId(hwFingerprint) : null;
        const normalizedKey = verifyResult.hex;
        
        const raw = await redisGet(`bind:${normalizedKey}`);
        const bindData = parseBindData(raw);
        
        if (bindData) {
            if (bindData.status === 'revoked') {
                return { statusCode: 403, headers, body: JSON.stringify({ code: 403, message: '该卡密已被禁用' }) };
            }
            if (bindData.deviceHash !== deviceHash) {
                // v2→v3 迁移：旧格式无 hwFp，允许更新绑定
                if (!bindData.hwFp && hwFp) {
                    await redisDel(`device:${bindData.deviceHash}`);
                } else {
                    return { statusCode: 403, headers, body: JSON.stringify({ code: 403, message: '此卡密已在其他设备上激活' }) };
                }
            } else {
                // 补充 hwFp
                if (!bindData.hwFp && hwFp) {
                    bindData.hwFp = hwFp;
                    await redisSet(`bind:${normalizedKey}`, JSON.stringify(bindData));
                    await redisSet(`hwfp:${hwFp}`, deviceHash);
                }
                return { statusCode: 200, headers, body: JSON.stringify({ code: 200, message: '已激活', status: 'already_activated' }) };
            }
        }
        
        const newBind = JSON.stringify({ deviceHash, hwFp, status: 'active' });
        await redisSet(`bind:${normalizedKey}`, newBind);
        await redisSet(`device:${deviceHash}`, normalizedKey);
        if (hwFp) await redisSet(`hwfp:${hwFp}`, deviceHash);
        
        console.log(`[激活] ${normalizedKey.slice(0, 12)}... → ${deviceHash.slice(0, 16)}...`);
        return { statusCode: 200, headers, body: JSON.stringify({ code: 200, message: '激活成功', status: 'activated' }) };
    }
    
    // ---- POST /api/check ----
    if (method === 'POST' && path.endsWith('/check')) {
        if (!SECRET) {
            return { statusCode: 500, headers, body: JSON.stringify({ code: 500, message: '服务器未配置 SECRET' }) };
        }
        if (!UPSTASH_URL) {
            return { statusCode: 500, headers, body: JSON.stringify({ code: 500, message: '服务器未配置 Redis' }) };
        }
        
        const { deviceId, hwFingerprint } = body;
        if (!deviceId) {
            return { statusCode: 400, headers, body: JSON.stringify({ code: 400, message: '缺少参数' }) };
        }
        
        let deviceHash = hashId(deviceId);
        let boundKey = await redisGet(`device:${deviceHash}`);
        let recovered = false;
        
        if (!boundKey && hwFingerprint) {
            const hwFp = hashId(hwFingerprint);
            const recoveredHash = await redisGet(`hwfp:${hwFp}`);
            if (recoveredHash) {
                deviceHash = recoveredHash;
                boundKey = await redisGet(`device:${deviceHash}`);
                recovered = true;
            }
        }
        
        if (boundKey) {
            const raw = await redisGet(`bind:${boundKey}`);
            const bindData = parseBindData(raw);
            
            if (bindData && bindData.status === 'revoked') {
                return { statusCode: 200, headers, body: JSON.stringify({ code: 401, message: '卡密已被禁用', status: 'revoked' }) };
            }
            
            return {
                statusCode: 200, headers,
                body: JSON.stringify({ code: 200, message: '已激活', status: 'active', deviceHash, recovered })
            };
        }
        
        return { statusCode: 200, headers, body: JSON.stringify({ code: 200, message: '未激活', status: 'inactive' }) };
    }
    
    // ---- POST /api/revoke ----
    if (method === 'POST' && path.endsWith('/revoke')) {
        if (!ADMIN_KEY) {
            return { statusCode: 500, headers, body: JSON.stringify({ code: 500, message: '未配置 ADMIN_KEY' }) };
        }
        
        const { adminKey, cardKey } = body;
        if (!adminKey || !cardKey) {
            return { statusCode: 400, headers, body: JSON.stringify({ code: 400, message: '缺少参数' }) };
        }
        if (adminKey !== ADMIN_KEY) {
            return { statusCode: 403, headers, body: JSON.stringify({ code: 403, message: '管理密钥错误' }) };
        }
        
        const cleaned = cardKey.replace(/[\s\-_]/g, '').toUpperCase();
        const raw = await redisGet(`bind:${cleaned}`);
        
        if (!raw) {
            return { statusCode: 404, headers, body: JSON.stringify({ code: 404, message: '未找到该卡密的绑定记录' }) };
        }
        
        const bindData = parseBindData(raw);
        
        if (bindData.status === 'revoked') {
            return { statusCode: 200, headers, body: JSON.stringify({ code: 200, message: '该卡密已被禁用', status: 'already_revoked' }) };
        }
        
        bindData.status = 'revoked';
        await redisSet(`bind:${cleaned}`, JSON.stringify(bindData));
        
        console.log(`[吊销] ${cleaned.slice(0, 12)}...`);
        return { statusCode: 200, headers, body: JSON.stringify({ code: 200, message: '卡密已禁用', status: 'revoked' }) };
    }
    
    // ---- POST /api/unbind ---- (删除绑定，卡密可重新激活到新设备)
    if (method === 'POST' && path.endsWith('/unbind')) {
        if (!ADMIN_KEY) {
            return { statusCode: 500, headers, body: JSON.stringify({ code: 500, message: '未配置 ADMIN_KEY' }) };
        }
        
        const { adminKey, cardKey } = body;
        if (!adminKey || !cardKey) {
            return { statusCode: 400, headers, body: JSON.stringify({ code: 400, message: '缺少参数' }) };
        }
        if (adminKey !== ADMIN_KEY) {
            return { statusCode: 403, headers, body: JSON.stringify({ code: 403, message: '管理密钥错误' }) };
        }
        
        const cleaned = cardKey.replace(/[\s\-_]/g, '').toUpperCase();
        const raw = await redisGet(`bind:${cleaned}`);
        
        if (!raw) {
            return { statusCode: 404, headers, body: JSON.stringify({ code: 404, message: '未找到该卡密的绑定记录' }) };
        }
        
        const bindData = parseBindData(raw);
        
        // 删除 device 索引
        if (bindData.deviceHash) await redisDel(`device:${bindData.deviceHash}`);
        // 删除 hwfp 索引
        if (bindData.hwFp) await redisDel(`hwfp:${bindData.hwFp}`);
        // 删除 bind 记录
        await redisDel(`bind:${cleaned}`);
        
        console.log(`[解绑] ${cleaned.slice(0, 12)}...`);
        return { statusCode: 200, headers, body: JSON.stringify({ code: 200, message: '卡密已解绑，可在新设备上重新激活' }) };
    }
    
    // ---- POST /api/restore ---- (恢复已吊销的卡密)
    if (method === 'POST' && path.endsWith('/restore')) {
        if (!ADMIN_KEY) {
            return { statusCode: 500, headers, body: JSON.stringify({ code: 500, message: '未配置 ADMIN_KEY' }) };
        }
        
        const { adminKey, cardKey } = body;
        if (!adminKey || !cardKey) {
            return { statusCode: 400, headers, body: JSON.stringify({ code: 400, message: '缺少参数' }) };
        }
        if (adminKey !== ADMIN_KEY) {
            return { statusCode: 403, headers, body: JSON.stringify({ code: 403, message: '管理密钥错误' }) };
        }
        
        const cleaned = cardKey.replace(/[\s\-_]/g, '').toUpperCase();
        const raw = await redisGet(`bind:${cleaned}`);
        
        if (!raw) {
            return { statusCode: 404, headers, body: JSON.stringify({ code: 404, message: '未找到该卡密的绑定记录' }) };
        }
        
        const bindData = parseBindData(raw);
        
        if (bindData.status !== 'revoked') {
            return { statusCode: 200, headers, body: JSON.stringify({ code: 200, message: '该卡密未被吊销，无需恢复' }) };
        }
        
        bindData.status = 'active';
        await redisSet(`bind:${cleaned}`, JSON.stringify(bindData));
        
        console.log(`[恢复] ${cleaned.slice(0, 12)}...`);
        return { statusCode: 200, headers, body: JSON.stringify({ code: 200, message: '卡密已恢复，可正常使用' }) };
    }
    
    // ---- POST /api/info ---- (查看卡密信息)
    if (method === 'POST' && path.endsWith('/info')) {
        const { cardKey } = body;
        if (!cardKey) {
            return { statusCode: 400, headers, body: JSON.stringify({ code: 400, message: '缺少卡密' }) };
        }
        
        const cleaned = cardKey.replace(/[\s\-_]/g, '').toUpperCase();
        const raw = await redisGet(`bind:${cleaned}`);
        
        if (!raw) {
            return { statusCode: 200, headers, body: JSON.stringify({ code: 200, status: 'unbound', message: '该卡密尚未激活' }) };
        }
        
        const bindData = parseBindData(raw);
        return {
            statusCode: 200, headers,
            body: JSON.stringify({
                code: 200,
                status: bindData.status || 'active',
                deviceHash: bindData.deviceHash ? bindData.deviceHash.substring(0, 16) + '...' : null,
                hasHwFp: !!bindData.hwFp
            })
        };
    }
    
    return { statusCode: 404, headers, body: JSON.stringify({ code: 404, message: 'Not Found' }) };
};
