/**
 * license-server-vercel.js v2
 * 
 * 卡密验证服务器 - 纯算法验证（不需要存储卡密列表）
 * 绑定数据存储在 Upstash Redis（免费，无需信用卡）
 * 环境变量只需要 3 个：SECRET、UPSTASH_URL、UPSTASH_TOKEN
 * 
 * 部署位置：GitHub 仓库的 api/index.js
 */

const crypto = require('crypto');

const SECRET = process.env.SECRET;
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const VERSION = 0x01;
const PRODUCT_ID = [0xC6, 0x25];

// ========== Upstash Redis 操作（纯 fetch，不需要任何 npm 包）==========
async function redisGet(key) {
    const res = await fetch(`${UPSTASH_URL}/get/${key}`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    });
    const data = await res.json();
    return data.result;  // Upstash 返回字符串
}

async function redisSet(key, value) {
    await fetch(`${UPSTASH_URL}/set/${key}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
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

// ========== Vercel Serverless Handler ==========
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(204).end();
    
    const url = req.url || '';
    
    // ---- GET /api/status ----
    if (req.method === 'GET' && url === '/api/status') {
        return res.status(200).json({
            status: 'running',
            redis: !!UPSTASH_URL,
            secret: !!SECRET,
        });
    }
    
    // ---- POST /api/activate ----
    if (req.method === 'POST' && url === '/api/activate') {
        if (!SECRET) return res.status(500).json({ code: 500, message: '服务器未配置 SECRET' });
        if (!UPSTASH_URL) return res.status(500).json({ code: 500, message: '服务器未配置 Redis' });
        
        const { key, deviceId } = req.body || {};
        if (!key || !deviceId) return res.status(400).json({ code: 400, message: '缺少参数' });
        
        const verifyResult = verifyKey(key);
        if (!verifyResult.valid) return res.status(400).json({ code: 400, message: verifyResult.reason });
        
        const deviceHash = hashDeviceFingerprint(deviceId);
        const normalizedKey = verifyResult.hex;
        
        const boundDevice = await redisGet(`bind:${normalizedKey}`);
        
        if (boundDevice && boundDevice !== deviceHash) {
            return res.status(403).json({ code: 403, message: '此卡密已在其他设备上激活' });
        }
        
        if (boundDevice === deviceHash) {
            return res.status(200).json({ code: 200, message: '已激活', status: 'already_activated' });
        }
        
        await redisSet(`bind:${normalizedKey}`, deviceHash);
        await redisSet(`device:${deviceHash}`, normalizedKey);
        
        console.log(`[激活] ${normalizedKey.slice(0, 12)}... → ${deviceHash.slice(0, 16)}...`);
        return res.status(200).json({ code: 200, message: '激活成功', status: 'activated' });
    }
    
    // ---- POST /api/check ----
    if (req.method === 'POST' && url === '/api/check') {
        if (!SECRET) return res.status(500).json({ code: 500, message: '服务器未配置 SECRET' });
        if (!UPSTASH_URL) return res.status(500).json({ code: 500, message: '服务器未配置 Redis' });
        
        const { deviceId } = req.body || {};
        if (!deviceId) return res.status(400).json({ code: 400, message: '缺少参数' });
        
        const deviceHash = hashDeviceFingerprint(deviceId);
        const boundKey = await redisGet(`device:${deviceHash}`);
        
        if (boundKey) return res.status(200).json({ code: 200, message: '已激活', status: 'active' });
        return res.status(200).json({ code: 200, message: '未激活', status: 'inactive' });
    }
    
    return res.status(404).json({ code: 404, message: 'Not Found' });
};
