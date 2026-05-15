/**
 * license-server-vercel.js v2
 * 
 * 🔥 重大改进：不再需要 KEYS_JSON！
 * - 卡密通过 HMAC-SHA256 算法直接验证，不需要把所有卡密存到服务器
 * - 只需要 1 个环境变量：SECRET（就是生成卡密时 --secret 后面的值）
 * - 激活绑定数据存在 Vercel KV（免费，自动持久化）
 * 
 * 部署位置：GitHub 仓库的 api/index.js
 */

const crypto = require('crypto');
const { kv } = require('@vercel/kv');

// ========== 配置 ==========
const SECRET = process.env.SECRET;
const VERSION = 0x01;
const PRODUCT_ID = [0xC6, 0x25];

// ========== 卡密验证（纯算法，不需要数据库）==========
function verifyKey(keyStr) {
    // 清理格式：去掉横杠和空格，转大写
    const cleaned = keyStr.replace(/[\s\-_]/g, '').toUpperCase();
    if (!cleaned.startsWith('CG25')) return { valid: false, reason: '格式错误' };
    
    const hex = cleaned.substring(4).toLowerCase();
    if (hex.length !== 32 || !/^[0-9a-f]+$/.test(hex)) {
        return { valid: false, reason: '格式错误' };
    }
    
    const keyBytes = Buffer.from(hex, 'hex');
    
    // 验证版本号
    if (keyBytes[0] !== VERSION) return { valid: false, reason: '版本不匹配' };
    
    // 验证产品标识
    if (keyBytes[1] !== PRODUCT_ID[0] || keyBytes[2] !== PRODUCT_ID[1]) {
        return { valid: false, reason: '产品标识不匹配' };
    }
    
    // HMAC 签名验证：用 SECRET 重新计算签名，对比是否一致
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
    // CORS 跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(204).end();
    
    const url = req.url || '';
    
    // ---- GET /api/status ----
    if (req.method === 'GET' && url === '/api/status') {
        return res.status(200).json({
            status: 'running',
            kv: !!process.env.KV_REST_API_URL,
            secret: !!SECRET,
        });
    }
    
    // ---- POST /api/activate ----
    if (req.method === 'POST' && url === '/api/activate') {
        if (!SECRET) {
            return res.status(500).json({ code: 500, message: '服务器未配置 SECRET' });
        }
        
        const { key, deviceId } = req.body || {};
        if (!key || !deviceId) {
            return res.status(400).json({ code: 400, message: '缺少参数' });
        }
        
        // 第1步：验证卡密是否合法（纯算法）
        const verifyResult = verifyKey(key);
        if (!verifyResult.valid) {
            return res.status(400).json({ code: 400, message: verifyResult.reason });
        }
        
        const deviceHash = hashDeviceFingerprint(deviceId);
        const normalizedKey = verifyResult.hex;
        
        // 第2步：检查此卡密是否已绑定其他设备
        const boundDevice = await kv.get(`bind:${normalizedKey}`);
        
        if (boundDevice && boundDevice !== deviceHash) {
            return res.status(403).json({
                code: 403,
                message: '此卡密已在其他设备上激活',
            });
        }
        
        // 同设备重复激活
        if (boundDevice === deviceHash) {
            return res.status(200).json({ code: 200, message: '已激活', status: 'already_activated' });
        }
        
        // 第3步：新绑定
        await kv.set(`bind:${normalizedKey}`, deviceHash);
        await kv.set(`device:${deviceHash}`, normalizedKey);
        
        console.log(`[激活] ${normalizedKey.slice(0, 12)}... → ${deviceHash.slice(0, 16)}...`);
        return res.status(200).json({ code: 200, message: '激活成功', status: 'activated' });
    }
    
    // ---- POST /api/check ----
    if (req.method === 'POST' && url === '/api/check') {
        if (!SECRET) {
            return res.status(500).json({ code: 500, message: '服务器未配置 SECRET' });
        }
        
        const { deviceId } = req.body || {};
        if (!deviceId) {
            return res.status(400).json({ code: 400, message: '缺少参数' });
        }
        
        const deviceHash = hashDeviceFingerprint(deviceId);
        const boundKey = await kv.get(`device:${deviceHash}`);
        
        if (boundKey) {
            return res.status(200).json({ code: 200, message: '已激活', status: 'active' });
        }
        
        return res.status(200).json({ code: 200, message: '未激活', status: 'inactive' });
    }
    
    return res.status(404).json({ code: 404, message: 'Not Found' });
};
