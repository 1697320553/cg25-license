/**
 * license-server-vercel.js
 * Vercel Serverless Function 版本
 * 部署到 Vercel 免费托管
 * 
 * 文件位置: api/index.js (Vercel 约定)
 * 部署后访问: https://cg25-license.vercel.app/api/activate
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ========== 配置 ==========
const SECRET = process.env.SECRET || 'my-secret-key-2024';
const KEYS_FILE = path.join('/tmp', 'keys.json');      // Vercel 只读 /tmp 可写
const BINDINGS_FILE = path.join('/tmp', 'bindings.json');

const VERSION = 0x01;
const PRODUCT_ID = [0xC6, 0x25];

// ========== 持久化 (Vercel 无本地文件, 用 /tmp 或外部存储) ==========
// Vercel 每次部署 /tmp 会清空, 建议用 Vercel KV 或外部 JSON 文件
// 这里用 /tmp 做演示, 生产建议接入 Vercel KV 或 Airtable API

function loadJSON(file, fallback) {
    try {
        if (fs.existsSync(file)) {
            return JSON.parse(fs.readFileSync(file, 'utf-8'));
        }
    } catch (e) {}
    return fallback;
}

function saveJSON(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
        console.error('保存失败:', e.message);
    }
}

// 初始化: 从环境变量读取卡密 (Vercel 无持久化文件)
// 在 Vercel 后台设置环境变量 KEYS_JSON = [你的 keys.json 内容]
let keysDB = [];
let bindingsDB = [];

function initDB() {
    // 优先从 /tmp 读取
    keysDB = loadJSON(KEYS_FILE, []);
    bindingsDB = loadJSON(BINDINGS_FILE, []);
    
    // 如果 /tmp 没有, 从环境变量 KEYS_JSON 初始化
    if (keysDB.length === 0 && process.env.KEYS_JSON) {
        try {
            keysDB = JSON.parse(process.env.KEYS_JSON);
            saveJSON(KEYS_FILE, keysDB);
            console.log(`[init] 从环境变量加载了 ${keysDB.length} 个卡密`);
        } catch (e) {
            console.error('[init] KEYS_JSON 解析失败:', e.message);
        }
    }
}

initDB();

// 每 10 次请求重新加载一次 (模拟热重载)
let requestCount = 0;
function maybeReload() {
    requestCount++;
    if (requestCount % 10 === 0) {
        initDB();
    }
}

// ========== 卡密验证 (同 server 版) ==========
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
    
    if (!crypto.timingSafeEqual(signature, expectedSig)) {
        return { valid: false, reason: '卡密无效' };
    }
    
    return { valid: true, hex: cleaned };
}

function hashDeviceFingerprint(fp) {
    return crypto.createHash('sha256').update(fp + '||salt').digest('hex');
}

// ========== Vercel Serverless Handler ==========
module.exports = async (req, res) => {
    maybeReload();
    
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(204).end();
    
    const url = req.url || '';
    
    // GET /api/status
    if (req.method === 'GET' && url === '/api/status') {
        return res.status(200).json({
            status: 'running',
            keysCount: keysDB.length,
            usedCount: keysDB.filter(k => k.used).length,
            bindingsCount: bindingsDB.length,
        });
    }
    
    // POST /api/activate
    if (req.method === 'POST' && url === '/api/activate') {
        const { key, deviceId } = req.body || {};
        if (!key || !deviceId) {
            return res.status(400).json({ code: 400, message: '缺少参数' });
        }
        
        const verifyResult = verifyKey(key);
        if (!verifyResult.valid) {
            return res.status(400).json({ code: 400, message: verifyResult.reason });
        }
        
        const deviceHash = hashDeviceFingerprint(deviceId);
        const normalizedKey = verifyResult.hex;
        
        const keyRecord = keysDB.find(k => 
            k.key.replace(/[\s\-_]/g, '').toUpperCase() === normalizedKey
        );
        
        if (!keyRecord) {
            return res.status(404).json({ code: 404, message: '卡密不存在' });
        }
        
        if (keyRecord.used && keyRecord.boundDevice !== deviceHash) {
            return res.status(403).json({ 
                code: 403, 
                message: '此卡密已在其他设备上激活',
            });
        }
        
        const now = new Date().toISOString();
        
        if (keyRecord.used && keyRecord.boundDevice === deviceHash) {
            keyRecord.lastCheck = now;
            saveJSON(KEYS_FILE, keysDB);
            return res.status(200).json({ code: 200, message: '已激活', status: 'already_activated' });
        }
        
        keyRecord.used = true;
        keyRecord.boundDevice = deviceHash;
        keyRecord.boundAt = now;
        keyRecord.lastCheck = now;
        
        bindingsDB.push({ key: normalizedKey, deviceHash, activatedAt: now });
        saveJSON(KEYS_FILE, keysDB);
        saveJSON(BINDINGS_FILE, bindingsDB);
        
        console.log(`[激活] ${normalizedKey.slice(0,12)}... → ${deviceHash.slice(0,16)}...`);
        return res.status(200).json({ code: 200, message: '激活成功', status: 'activated' });
    }
    
    // POST /api/check
    if (req.method === 'POST' && url === '/api/check') {
        const { deviceId } = req.body || {};
        if (!deviceId) {
            return res.status(400).json({ code: 400, message: '缺少参数' });
        }
        
        const deviceHash = hashDeviceFingerprint(deviceId);
        const record = keysDB.find(k => k.boundDevice === deviceHash && k.used);
        
        if (record) {
            record.lastCheck = new Date().toISOString();
            saveJSON(KEYS_FILE, keysDB);
            return res.status(200).json({ code: 200, message: '已激活', status: 'active' });
        }
        
        return res.status(200).json({ code: 200, message: '未激活', status: 'inactive' });
    }
    
    return res.status(404).json({ code: 404, message: 'Not Found' });
};
