// ==UserScript==
// @name        cg最新-增强版
// @namespace    http://tampermonkey.net/
// @version      7.3
// @description  
// @author       萧萧暮雨
// @updateURL    https://api.xiaoxiaomuyu.top/cg-latest.user.js
// @downloadURL  https://api.xiaoxiaomuyu.top/cg-latest.user.js
// @match        https://www.66rpg.com/game/*
// @match        https://www.66rpg.com/h5/*
// @match        *://www.66rpg.com/home
// @match        *://m.66rpg.com/home
// @match        https://m.66rpg.com/game/*
// @match        https://m.66rpg.com/h5/*
// @match        *://*.66rpg.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_notification
// @grant        GM_download
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function(){

// ====== 云存档拦截+锁定移动端 ======
(function(){
var _cs_isGM=typeof GM_setValue!=="undefined";
var _cs_storage={set:function(k,v){try{if(_cs_isGM)GM_setValue(k,v);else localStorage.setItem(k,v);return true;}catch(e){return false;}},get:function(k,d){if(d===undefined)d=null;try{if(_cs_isGM){var v=GM_getValue(k);return v!==undefined?v:d;}else{var v2=localStorage.getItem(k);return v2!==null?v2:d;}}catch(e){return d;}}};
var _cs_ua="Android/Mozilla/5.0 (Linux; U; Android 2.2.1; zh-cn; HTC_Wildfire_A3333 Build/FRG83D) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1";
// 在覆盖 UA 之前保存真实 UA 供指纹使用
unsafeWindow.__cg_realUA = navigator.userAgent;
(function(){var l=_cs_storage.get("uaMobileLocked",true);_cs_storage.set("uaMobileLocked",true);if(l){try{Object.defineProperty(unsafeWindow.navigator,"userAgent",{get:function(){return _cs_ua;},configurable:true});}catch(e){}}})();
var _cs_of=unsafeWindow.fetch;
var _cs_oxo=unsafeWindow.XMLHttpRequest.prototype.open;
var _cs_oxs=unsafeWindow.XMLHttpRequest.prototype.send;
function _cs_isSave(u){if(!/(\/|_)(save|archive)(\/|\?|$|_)|uploadSave/i.test(u))return false;if(/shop|mall|buy|purchase|order|pay|gift|reward/i.test(u))return false;return true;}
unsafeWindow.fetch=function(u,o){var s=typeof u==="string"?u:(u.url||"");if(_cs_isSave(s))return Promise.resolve(new Response(JSON.stringify({code:0,msg:"ok",data:{saveId:"blocked_"+Date.now()}}),{status:200}));return _cs_of.apply(this,arguments);};
unsafeWindow.XMLHttpRequest.prototype.open=function(m,u){this.___u=u;return _cs_oxo.apply(this,arguments);};
unsafeWindow.XMLHttpRequest.prototype.send=function(b){if(this.___u&&_cs_isSave(this.___u)){var s=this;Object.defineProperty(s,"readyState",{value:4,writable:true});Object.defineProperty(s,"status",{value:200,writable:true});Object.defineProperty(s,"responseText",{value:JSON.stringify({code:0,msg:"ok",data:{saveId:"blocked_"+Date.now()}}),writable:true});if(s.onreadystatechange)setTimeout(function(){s.onreadystatechange();},10);if(s.onload)setTimeout(function(){s.onload();},10);return;}return _cs_oxs.apply(this,arguments);};
})();
// ====== 云存档拦截+锁定移动端 END ======


// -------- 鍚屾閲嶅畾鍚戯紙濮嬬粓鎵ц锛?-------
(function(){if(location.href.indexOf("66rpg.com/game/")!=-1){var m=/https:\/\/www\.66rpg\.com\/game\/([0-9]+)/.exec(location.href);if(m)location.replace("https://www.66rpg.com/h5/"+m[1]+"?quality=34&is_gold_orange=0&mark=isFlash&ohp=v3");}})();

// ============================================================
//  卡密激活系统 v3 —— UUID 主键 + 硬件指纹恢复 + 吊销检测
// ============================================================
var _cgCfg={API_BASE_URL:"https://api.xiaoxiaomuyu.top/api",API_FALLBACK_URL:"https://cheerful-queijadas-a8a5a4.netlify.app/api",LS_KEY:"__cg612_license_v3",UUID_KEY:"__cg612_uuid",HW_CACHE:"__cg612_hw"};
function _cgGetUUID(){try{var v=GM_getValue(_cgCfg.UUID_KEY);if(v)return v;}catch(e){}try{var v2=unsafeWindow.localStorage.getItem(_cgCfg.UUID_KEY);if(v2)return v2;}catch(e){}var uuid;try{uuid=crypto.randomUUID();}catch(e){uuid='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0;return(c==='x'?r:r&0x3|0x8).toString(16);});}_cgSaveUUID(uuid);return uuid;}
function _cgSaveUUID(uuid){try{GM_setValue(_cgCfg.UUID_KEY,uuid);}catch(e){}try{unsafeWindow.localStorage.setItem(_cgCfg.UUID_KEY,uuid);}catch(e){}}
function _cgGetHwFingerprint(){try{var cached=unsafeWindow.localStorage.getItem(_cgCfg.HW_CACHE);if(cached)return cached;}catch(e){}var s=[];s.push('p='+(navigator.platform||''));s.push('c='+(navigator.hardwareConcurrency||0));s.push('t='+(navigator.maxTouchPoints||0));s.push('l='+(navigator.language||''));s.push('d='+(screen.colorDepth||0));if(navigator.deviceMemory)s.push('m='+navigator.deviceMemory);try{var cv=document.createElement('canvas');cv.width=280;cv.height=60;var cx=cv.getContext('2d');cx.textBaseline='top';cx.font='14px Arial';cx.fillStyle='#f60';cx.fillRect(125,1,62,20);cx.fillStyle='#069';cx.fillText('CG25HW',2,15);cx.fillStyle='rgba(102,204,0,0.7)';cx.fillText('CG25HW',4,17);var d=cv.toDataURL();s.push('cv='+d.length);}catch(e){}try{var c2=document.createElement('canvas');var gl=c2.getContext('webgl')||c2.getContext('experimental-webgl');if(gl){var dbg=gl.getExtension('WEBGL_debug_renderer_info');if(dbg)s.push('gl='+gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL));}}catch(e){}var hw=s.join('|');try{unsafeWindow.localStorage.setItem(_cgCfg.HW_CACHE,hw);}catch(e){}return hw;}
function _cgSaveLicense(key,deviceId){var obj={key:key||'',deviceId:deviceId,status:'active'};try{unsafeWindow.localStorage.setItem(_cgCfg.LS_KEY,JSON.stringify(obj));GM_setValue(_cgCfg.LS_KEY,JSON.stringify(obj));}catch(e){try{unsafeWindow.localStorage.setItem(_cgCfg.LS_KEY,JSON.stringify(obj));}catch(e2){}}}
function _cgClearLicense(){try{unsafeWindow.localStorage.removeItem(_cgCfg.LS_KEY);GM_setValue(_cgCfg.LS_KEY,'');}catch(e){}try{unsafeWindow.localStorage.removeItem(_cgCfg.UUID_KEY);}catch(e){}}
function _cgApiCall(endpoint,data){return fetch(_cgCfg.API_BASE_URL+endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)}).then(function(res){return res.json();}).catch(function(){return fetch(_cgCfg.API_FALLBACK_URL+endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)}).then(function(res){return res.json();});});}
function _cgHasLicense(){var deviceId=_cgGetUUID();try{var raw=unsafeWindow.localStorage.getItem(_cgCfg.LS_KEY);if(raw){var lic=JSON.parse(raw);if(lic&&lic.deviceId===deviceId&&lic.status==="active")return true;}try{var gmRaw=GM_getValue(_cgCfg.LS_KEY);if(gmRaw){var gLic=JSON.parse(gmRaw);if(gLic&&gLic.deviceId===deviceId&&gLic.status==="active")return true;}}catch(e){}var oldLic=unsafeWindow.localStorage.getItem("_cg25_license");if(oldLic){try{var p=JSON.parse(oldLic);unsafeWindow.localStorage.setItem("__cg612_oldkey",p.key||oldLic);}catch(e){unsafeWindow.localStorage.setItem("__cg612_oldkey",oldLic);}}var oldV2=unsafeWindow.localStorage.getItem("__cg612_license_v2");if(oldV2){try{var v2=JSON.parse(oldV2);if(v2&&v2.key)unsafeWindow.localStorage.setItem("__cg612_oldkey",v2.key);}catch(e){}}return false;}catch(e){return false;}}
function _cgShowRevoked(key){if(document.getElementById("__cg612_overlay"))return;function _render(){if(!document.body){setTimeout(_render,100);return;}var ov=document.createElement("div");ov.id="__cg612_overlay";ov.innerHTML='<div style="position:fixed;left:0;top:0;width:100%;height:100%;z-index:2147483647;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);background:rgba(0,0,0,.55);flex-direction:column;"><div style="background:#fff;border-radius:16px;padding:32px 28px;width:320px;max-width:90vw;box-shadow:0 16px 48px rgba(0,0,0,.35);text-align:center;"><div style="font-size:40px;margin-bottom:12px;">🚫</div><div style="font-size:20px;font-weight:700;color:#e74c3c;margin-bottom:6px;">卡密已被禁用</div><div style="font-size:13px;color:#999;margin-bottom:20px;">'+key+'<br>请联系管理员</div></div></div>';document.body.appendChild(ov);}_render();}
function _cgShowConfirm(){if(document.getElementById("__cg612_overlay"))return;function _render(){if(!document.body){setTimeout(_render,100);return;}var ov=document.createElement("div");ov.id="__cg612_overlay";ov.innerHTML='<div style="position:fixed;left:0;top:0;width:100%;height:100%;z-index:2147483647;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);background:rgba(0,0,0,.55);flex-direction:column;"><div style="background:#fff;border-radius:16px;padding:32px 28px;width:320px;max-width:90vw;box-shadow:0 16px 48px rgba(0,0,0,.35);text-align:center;"><div style="font-size:40px;margin-bottom:12px;">&#x1F511;</div><div style="font-size:20px;font-weight:700;color:#222;margin-bottom:6px;">&#x8BF7;&#x8F93;&#x5165;&#x5361;&#x5BC6;</div><div style="font-size:13px;color:#999;margin-bottom:20px;">&#x4E00;&#x673A;&#x4E00;&#x5BC6;&#xFF0C;&#x4EC5;&#x7ED1;&#x5B9A;&#x5F53;&#x524D;&#x8BBE;&#x5907;</div><button id="__cg612_go" style="padding:12px 40px;border:none;border-radius:10px;background:linear-gradient(135deg,#ff6b9d,#ff8fb3);color:#fff;font-size:16px;font-weight:600;cursor:pointer;transition:transform .1s;font-family:inherit;">&#x5F00;&#x59CB;&#x6FC0;&#x6D3B;</button></div></div>';document.body.appendChild(ov);document.getElementById("__cg612_go").addEventListener("click",function(){ov.remove();_cgShowKeyInput();});document.getElementById("__cg612_go").addEventListener("touchstart",function(e){e.preventDefault();ov.remove();_cgShowKeyInput();});}_render();}
function _cgShowKeyInput(){function _render2(){if(!document.body){setTimeout(_render2,100);return;}var ov=document.createElement("div");ov.id="__cg612_overlay2";ov.innerHTML='<div style="position:fixed;left:0;top:0;width:100%;height:100%;z-index:2147483647;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);background:rgba(0,0,0,.55);flex-direction:column;"><div id="__cg612_card2" style="background:#fff;border-radius:16px;padding:32px 28px;width:360px;max-width:90vw;box-shadow:0 16px 48px rgba(0,0,0,.35);text-align:center;transition:transform .35s ease,margin-top .35s ease;margin-top:0;"><div style="font-size:18px;font-weight:700;color:#222;margin-bottom:6px;">&#x1F511; &#x8F93;&#x5165;&#x5361;&#x5BC6;</div><div style="font-size:12px;color:#999;margin-bottom:18px;">&#x4E00;&#x673A;&#x4E00;&#x5BC6;&#xFF0C;&#x4EC5;&#x7ED1;&#x5B9A;&#x5F53;&#x524D;&#x8BBE;&#x5907;</div><input id="__cg612_input2" type="text" placeholder="&#x8BF7;&#x8F93;&#x5165;&#x5361;&#x5BC6;" style="width:100%;box-sizing:border-box;padding:12px 16px;border:2px solid #e5e7eb;border-radius:10px;font-size:15px;outline:none;text-align:center;transition:border .2s;font-family:inherit;" autocomplete="off"><div id="__cg612_msg2" style="font-size:13px;color:#ef4444;margin-top:10px;min-height:18px;"></div><button id="__cg612_btn2" style="margin-top:16px;width:100%;padding:12px;border:none;border-radius:10px;background:linear-gradient(135deg,#ff6b9d,#ff8fb3);color:#fff;font-size:16px;font-weight:600;cursor:pointer;transition:opacity .2s,transform .1s;font-family:inherit;">&#x6FC0; &#x6D3B;</button></div></div>';document.body.appendChild(ov);var card=document.getElementById("__cg612_card2");var inp=document.getElementById("__cg612_input2");var msg=document.getElementById("__cg612_msg2");var btn=document.getElementById("__cg612_btn2");try{var oldk=unsafeWindow.localStorage.getItem("__cg612_oldkey");if(oldk)inp.value=oldk;}catch(e){}unsafeWindow.localStorage.removeItem("__cg612_oldkey");inp.focus();inp.addEventListener("focus",function(){card.style.marginTop="-15vh";});inp.addEventListener("blur",function(){card.style.marginTop="0";});function doActivate(){var key=inp.value.trim();if(!key){msg.textContent="\u8BF7\u8F93\u5165\u5361\u5BC6";return;}btn.disabled=true;btn.textContent="\u9A8C\u8BC1\u4E2D...";btn.style.opacity="0.7";var deviceId=_cgGetUUID();var hwFp=_cgGetHwFingerprint();_cgApiCall("/activate",{key:key,deviceId:deviceId,hwFingerprint:hwFp}).then(function(res){if(res.code===200){_cgSaveLicense(key,deviceId);btn.textContent="\u2713 \u6FC0\u6D3B\u6210\u529F";btn.style.background="linear-gradient(135deg,#10b981,#059669)";btn.style.opacity="1";card.style.opacity="0";card.style.transform="scale(0.95)";card.style.transition="opacity .4s ease,transform .4s ease";setTimeout(function(){location.reload();},600);}else{msg.textContent=res.message||"\u5361\u5BC6\u65E0\u6548\u6216\u5DF2\u5728\u5176\u4ED6\u8BBE\u5907\u4F7F\u7528";btn.disabled=false;btn.textContent="\u6FC0 \u6D3B";btn.style.opacity="1";}}).catch(function(){msg.textContent="\u7F51\u7EDC\u9519\u8BEF\uFF0C\u8BF7\u91CD\u8BD5";btn.disabled=false;btn.textContent="\u6FC0 \u6D3B";btn.style.opacity="1";});}btn.addEventListener("click",doActivate);btn.addEventListener("touchstart",function(e){e.preventDefault();doActivate();});inp.addEventListener("keydown",function(e){if(e.key==="Enter")doActivate();});}_render2();}
if(!_cgHasLicense()){_cgShowConfirm();var _cgPoll=setInterval(function(){if(_cgHasLicense()){clearInterval(_cgPoll);location.reload();}},1000);return;}
(function(){var deviceId=_cgGetUUID();var hwFp=_cgGetHwFingerprint();function _cgDoCheck(){_cgApiCall("/check",{deviceId:deviceId,hwFingerprint:hwFp}).then(function(res){if(res.code===401&&res.status==='revoked'){_cgClearLicense();var key='';try{var raw=unsafeWindow.localStorage.getItem(_cgCfg.LS_KEY);if(raw)key=JSON.parse(raw).key||'';}catch(e){}try{var gmRaw=GM_getValue(_cgCfg.LS_KEY);if(gmRaw)key=JSON.parse(gmRaw).key||'';}catch(e){}_cgShowRevoked(key||'?');return;}if(res.code===200&&res.status==='active'){if(res.recovered){_cgSaveLicense('',deviceId);_cgSaveUUID(deviceId);}return;}if(res.code===200&&(res.status==='inactive'||res.status==='unbound')){_cgClearLicense();_cgShowConfirm();return;}_cgClearLicense();}).catch(function(){});}_cgDoCheck();setInterval(_cgDoCheck,300000);})();

// ====== 缓存/注入稳定修复 START ======
const CG_FIX_VER = "20260616_9";

const CG_REMOTE_GAME_JS =
 "https://preview-chat-1b176371-f9ab-4760-b15c-b9d70ed59d23.space-z.ai/game.js";

const CG_REMOTE_MIN_JS =
 "https://preview-chat-1b176371-f9ab-4760-b15c-b9d70ed59d23.space-z.ai/game.lztve17aE7yOjUahBaH3k53qKoaK4ZZM.min.js";

function cgFreshUrl(url) {
 return url + (url.indexOf("?") === -1 ? "?" : "&") + "cg_fix=" + CG_FIX_VER + "_" + Date.now();
}


function cgIsOfficialGameJs(src) {
 return src &&
 src.indexOf("website/hfplayer/") !== -1 &&
 src.indexOf("/official/game.js") !== -1;
}

function cgIsAWeblib(src) {
 return src && src.indexOf("enginejs/aWeblib.") !== -1;
}

function cgPatchScriptNode(node) {
 try {
 if (!node || node.nodeType !== 1 || node.tagName !== "SCRIPT") return;

 var src = node.src || node.getAttribute("src") || "";

 if (cgIsOfficialGameJs(src)) {
 node.removeAttribute("integrity");
 node.removeAttribute("crossorigin");
 node.src = cgFreshUrl(CG_REMOTE_GAME_JS);
return;
 }

 if (cgIsAWeblib(src)) {
cgInjectRemoteMinJs("aWeblib");
 }
 } catch (e) {
}
}

async function cgInjectRemoteMinJs(reason) {
 if (unsafeWindow.__cg_remote_min_state === "done") {
return;
 }
 if (unsafeWindow.__cg_remote_min_state === "loading") {
return;
 }

 unsafeWindow.__cg_remote_min_state = "loading";
try {
 var res = await fetch(cgFreshUrl(CG_REMOTE_MIN_JS), {
 cache: "no-store",
 headers: {
 "Cache-Control": "no-cache",
 "Pragma": "no-cache"
 }
 });

 if (!res.ok) throw new Error("HTTP " + res.status);

 var txt = await res.text();

 txt = txt
 .replace("_0x289b9c(_0x303a27['currentGameId'])['then'](function(_0xd6c61c){",
 "_0x289b9c(_0x303a27['currentGameId'])['then'](function(_0xd6c61c){_0xd6c61c.data.cts={};")
 .replace("_0x303a27={", "_0x303a27=window.glb={")
 .replace("function(_0x195be5,_0x5950f1){",
 "function(_0x195be5,_0x5950f1){window.ymlfvar=_0x5cda97;if(window.$jksj){window.$jkddsj[`ac.var['${_0x5950f1}']`]=true};")
 .replace("function(_0x3adc13,_0x54acba){",
 "function(_0x3adc13,_0x54acba){window.ymlfarr=_0x2a6064;if(window.$jksj){window.$jkddsj[`ac.arr['${_0x54acba}']`]=true};")
 .replace("function(_0xaa21ec,_0x18c15e){",
 "function(_0xaa21ec,_0x18c15e){window.ymlfcVar=_0x2efdbd;if(window.$jksj){window.$jkddsj[`ac.cVar['${_0x18c15e}']`]=true};")
 .replace("function(_0x45bc30,_0x5f2be9){",
 "function(_0x45bc30,_0x5f2be9){window.ymlfcArr=_0x2c44a4;if(window.$jksj){window.$jkddsj[`ac.cArr['${_0x5f2be9}']`]=true};");

 var s = document.createElement("script");
 s.textContent = txt;
 (document.head || document.documentElement || document.body).appendChild(s);
function runWhenReady() {
 try {
 if (
 unsafeWindow.cc &&
 unsafeWindow.cc.game &&
 typeof unsafeWindow.initGame === "function"
 ) {
 unsafeWindow.cc.game.onStart = unsafeWindow.initGame;
 unsafeWindow.cc.game.run();
 unsafeWindow.__cg_remote_min_state = "done";
alert("脚本已加载完成~");
 } else {
 setTimeout(runWhenReady, 80);
 }
 } catch (e) {
 unsafeWindow.__cg_remote_min_state = "";
}
 }

 runWhenReady();
 } catch (e) {
 unsafeWindow.__cg_remote_min_state = "";
alert("脚本加载失败：" + e.message);
 }
}

(function cgInstallEarlyHooks() {
 if (unsafeWindow.__cg_early_hooks_installed) return;
 unsafeWindow.__cg_early_hooks_installed = true;
function hookAppend(proto, name) {
 if (!proto || !proto[name]) return;

 var old = proto[name];
 proto[name] = function(node, ref) {
 cgPatchScriptNode(node);
 if (name === "insertBefore") {
 return old.call(this, node, ref);
 }
 return old.call(this, node);
 };
 }

 hookAppend(HTMLHeadElement.prototype, "appendChild");
 hookAppend(HTMLHeadElement.prototype, "insertBefore");
 hookAppend(HTMLBodyElement.prototype, "appendChild");
 hookAppend(HTMLBodyElement.prototype, "insertBefore");

 new MutationObserver(function(list) {
 list.forEach(function(m) {
 Array.prototype.forEach.call(m.addedNodes || [], cgPatchScriptNode);
 });
 }).observe(document.documentElement, {
 childList: true,
 subtree: true
 });

 var pollCount = 0;
 var poll = setInterval(function() {
 pollCount++;
 var a = document.querySelector && document.querySelector('script[src*="enginejs/aWeblib."]');
 if (a) {
 clearInterval(poll);
cgInjectRemoteMinJs("poll-existing-aWeblib");
 }
 if (pollCount > 100) {
 clearInterval(poll);
}
 }, 200);
})();
// ====== 缓存/注入稳定修复 END ======

function mainFunction() {  if (location.href.indexOf("66rpg.com/h5/") != -1) {
    unsafeWindow.cidian = [null, null, "sjjkz", "jkddsj", "cxjkz", "jkddcx", "push", "sjlb", "gnlb", JSON, Object, parseInt, "stringify", "story", "pos", "scene", "storyId", "entries", "var", unsafeWindow, "AP", document, "querySelector", "addEventListener", "jkddtp", "tpjkz", "UD", "UB", "ja", "autoSave"];
    unsafeWindow.$HHHH = "if(SZ==\"https://www.66rpg.com/PropShop/engine/v5/Game/get_goods_list\"){if(fT.data){window.商品总数=fT.data.count;}}if(SZ==\"https://www.66rpg.com/PropShop/engine/v5/user/getUserHaveAllPropNum\"){fT.data=[];fT.status=1;if(!window.商品总数){window.商品总数=100;}for(let i=0;i<window.商品总数;i++){fT.data.push({\"using_num\":window.商品购买数量?window.商品购买数量:1,\"goods_id\":i});}}return fT;";
    Object.dataLock = {};
    const _0x242f63 = {
      msg: [],
      jkddsj: {},
      jkddcx: [],
      jkddtp: {}
    };
    
    cidian[19].wcl = _0x242f63;
    wcl.gnlb = {};
    wcl.sjlb = {};
    cidian[19].ymlf = new Proxy(wcl, {
      get: function (_0x1074d2, _0x439d08) {
        {
          if (_0x439d08 == "var") {
            return new Proxy({}, {
              get: (_0x13b9a0, _0x584e79) => {
                {
                  let _0x110124;
                  try {
                    _0x110124 = AP.getVar(_0x584e79);
                  } catch (_0x407dbf) {}
                  ymlf.msg = "ymlf.var[\"" + _0x584e79 + "\"]=" + _0x110124;
                  return AP.getVar(_0x584e79);
                }
              },
              set: (_0x5141d3, _0x59c186, _0x43d134) => {
                let _0x4a6e35 = _0x43d134;
                typeof _0x43d134 == "object" && (_0x4a6e35 = JSON.stringify(_0x43d134));
                ymlf.msg = "ymlf.var[\"" + _0x59c186 + "\"]=" + _0x4a6e35;
                try {
                  AP.setVar(_0x59c186, _0x43d134);
                } catch (_0x78bddc) {}
                try {
                  {
                    Array.ymlf.setValue(_0x59c186, _0x43d134, Array.ai);
                  }
                } catch (_0x2e816) {}
                return true;
              }
            });
          }
          if (_0x439d08 == "msg") {
            {
              let _0x3f4178 = _0x1074d2[_0x439d08].join("\n");
              cidian[21][cidian[22]]("#代码输入框").value = _0x3f4178;
              return "";
            }
          }
          if (_0x439d08 == "功能") {
            return {
              push: function (_0x401342) {
                if (_0x401342.length != 3) {
                  {
                    return;
                  }
                }
                wcl.gnlb[_0x401342[0]] = {};
                wcl.gnlb[_0x401342[0]][_0x401342[1]] = _0x401342[2];
              }
            };
          }
          if (_0x439d08 == "dataLock") {
            return new Proxy({}, {
              get: (_0x2c6de1, _0x3530f0) => {
                {
                  ymlf.msg = "id:" + _0x3530f0 + "===" + Object.dataLock[_0x3530f0];
                  return Object.dataLock[_0x3530f0];
                }
              },
              set: (_0x24dcc5, _0x26de5f, _0x203dc8) => {
                {
                  ymlf.msg = "id:" + _0x26de5f + "===" + _0x203dc8;
                  Object.dataLock[_0x26de5f] = _0x203dc8;
                  return true;
                }
              }
            });
          }
          if (_0x439d08 == "功能列表") {
            let _0x25a9d5 = "";
            let _0x525b41 = Object.keys(wcl.gnlb);
            _0x525b41.map((_0x462665, _0x504872) => {
              _0x25a9d5 += "编号" + _0x504872 + ":" + _0x462665 + "\n";
            });
            ymlf.msg = _0x25a9d5;
          }
          if (_0x439d08 == "删除功能") {
            {
              return function (_0x44639e) {
                if (arguments.length == 0) {
                  {
                    ymlf.msg = "缺少参数:功能的编号,请查看功能列表!";
                    return;
                  }
                }
                let _0x3a781d = "";
                let _0x5ed962 = Object.keys(wcl.gnlb);
                _0x5ed962.map((_0x27c948, _0x31c9c5) => {
                  {
                    _0x31c9c5 == _0x44639e ? delete wcl.gnlb[_0x27c948] : _0x3a781d += "编号" + _0x31c9c5 + ":" + _0x27c948 + "\n";
                  }
                });
                ymlf.msg = _0x3a781d;
              };
            }
          }
          if (_0x439d08 == "剧情数据") {
            {
              let _0x37a1da = "当前剧情pos:" + UB.storyList.currentStory.storyName + " " + UB.storyList.currentStory.pos + "/" + (UB.storyList.currentStory.story.length - 1) + "\n\r";
              UB.storyList.currentStory.story.map((_0x3e6de8, _0x4c49e1) => {
                _0x37a1da += "[" + _0x4c49e1 + "] " + JSON.stringify(_0x3e6de8) + "\n\r";
              });
              document.querySelector("#代码输入框").value = _0x37a1da;
            }
          }
          return _0x1074d2[_0x439d08];
        }
      },
      set: function (_0x4c8614, _0x5e2539, _0x458a1e) {
        if (_0x5e2539 == "msg") {
          _0x4c8614[_0x5e2539].unshift(_0x458a1e);
          let _0x3cda80 = _0x4c8614[_0x5e2539].join("\n");
          cidian[21][cidian[22]]("#代码输入框").value = _0x3cda80;
          return;
        }
        _0x5e2539 == "累充" && ["totalFlower", "freshFlower", "wildFlower", "tempFlower", "realFlower", "haveFlower"].forEach(_0x599c5d => {
          oY[_0x599c5d] = _0x458a1e;
        });
        if (_0x5e2539 == "下载立绘") {
          {
            let _0x3c0a06 = new Function("t", "var img = new Image;\n            img.onload = function() {\n                const img = this;\n                const canvas = cidian[21].createElement('canvas');\n                const ctx = canvas.getContext('2d');\n                canvas.width = img.width;\n                canvas.height = img.height;\n                ctx.drawImage(img, 0, 0);\n                let dataURL = canvas.toDataURL('image/png');\n                const link = cidian[21].createElement('a');\n                link.href = dataURL;\n                link.download = img.src.split(\"/\").slice(-1)[0] + \".png\";\n                link.click();\n                link.remove();\n                canvas.remove();\n            }\n            ;\n            img.src=\"https://huangdi.3304399.net/dangji/v3580220/\"+t;");
            _0x3c0a06(_0x458a1e);
          }
        }
        _0x5e2539 == "剧情pos" && UB.storyList.currentStory.jumpToIndex(_0x458a1e);
        _0x4c8614[_0x5e2539] = _0x458a1e;
        return;
      }
    });
    cidian[0] = wcl;
    cidian[1] = ymlf;
    cidian[19].loadScript = function () {
      {
        let _0x463dd7 = "\n\t\t<div style=\"width:60vw;display:flex;flex-flow:column;position:relative;margin:auto;background:rgba(0,0,0,0.3);\"><div style=\"width:100%;display:flex;justify-content:center;background:rgba(255,255,255,0.3);backdrop-filter:blur(12px);position:relative;height:50px;align-items:center;box-sizing:border-box;border:2px solid #FFB6C1;padding:8px;border-radius:10px;\" class=\"node_46\"><span style=\"color:#f5788f;font-size:32px;font-weight:bold;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);\" id=\"游戏名\" class=\"node_50\">" + document.title + "</span></div>\n            <div style=\"display:flex;flex-direction:column;width:100%;align-items:center;flex:1;position:relative;\" class=\"node_51\">\n            <div style=\"display:flex;flex-wrap:wrap;flex-direction:row;justify-content:center;width:100%;font-size:12px;gap:15px;padding:5px 0;\" class=\"node_52\">\n            <div style=\"color:#f5788f;border-radius:10px;border:2px solid #FFB6C1;cursor:pointer;width:150px;text-align:center;background:rgba(255,255,255,0.5);backdrop-filter:blur(12px);font-size:21px;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;height:40px;\" id=\"监控数据\" class=\"node_54\">当前数值</div>\n            <div style=\"background:rgba(255,255,255,0.5);backdrop-filter:blur(12px);border:2px solid #FFB6C1;color:#f5788f;border-radius:10px;cursor:pointer;width:80px;text-align:center;height:40px;font-size:21px;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;\" id=\"运行代码\" class=\"node_85\">执行代码</div>\n            <div style=\"background:rgba(255,255,255,0.5);backdrop-filter:blur(12px);border:2px solid #FFB6C1;color:#f5788f;border-radius:10px;cursor:pointer;width:80px;text-align:center;height:40px;font-size:21px;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;\" id=\"清空数据\" class=\"node_82\">清除内容</div>\n            <div style=\"color:#f5788f;border-radius:10px;border:2px solid #FFB6C1;cursor:pointer;width:150px;text-align:center;background:rgba(255,255,255,0.5);backdrop-filter:blur(12px);font-size:21px;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;height:40px;\" id=\"累计充值\" class=\"node_58\">累计充值</div>\n            <div style=\"color:#f5788f;border-radius:10px;border:2px solid #FFB6C1;cursor:pointer;width:90px;text-align:center;background:rgba(255,255,255,0.5);backdrop-filter:blur(12px);font-size:21px;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;height:40px;\" id=\"全屏\" class=\"node_48\">全屏模式</div>\n            <div style=\"color:#f5788f;border-radius:10px;border:2px solid #FFB6C1;cursor:pointer;width:60px;text-align:center;background:rgba(255,255,255,0.5);backdrop-filter:blur(12px);font-size:21px;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;height:40px;\" id=\"关\" class=\"node_49\">关闭</div>\n            </div>\n            <div style=\"display:flex;flex:1;width:100%;flex-direction:column;margin-top:10px;position:relative;\" class=\"node_78\">\n            <div id=\"编辑框\" style=\"display:flex;justify-content:flex-start;flex-wrap:nowrap;width:100%;position:relative;height:612px;\" class=\"node_79\">\n            <textarea id=\"代码输入框\" placeholder=\"💫 在这里输入代码~\" style=\"background:rgba(255,255,255,0.3);backdrop-filter:blur(12px);font-size:21px;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);border:2px solid #FFB6C1;height:612px;width:100%;resize:none;box-sizing:border-box;padding:8px;\" class=\"node_80\"></textarea>\n            </div></div></div></div>\n\t\t\t";
        cidian[21][cidian[22]]("#gmTool").innerHTML = _0x463dd7;
      }
    };
    const _0x377052 = {
      get: function () {
        return true;
      },
      set: function () {},
      configurable: true
    };
    Object.defineProperty(Object.prototype, "showLocal", _0x377052);
    Object.defineProperty(unsafeWindow, "e", {
      get: function () {
        {
          return true;
        }
      },
      set: function () {},
      configurable: true
    });
    Object.defineProperty(Object.prototype, "getKey", {
      get: function () {
        {
          let _0xdf1075 = Symbol.for("_key");
          if (this[_0xdf1075]) {
            return unsafeWindow[this[_0xdf1075]];
          }
          return null;
        }
      },
      set: function (_0x535bac) {
        let _0x1a8e0f = Symbol.for("_key");
        if (!this[_0x1a8e0f]) {
          {
            this[_0x1a8e0f] = Date.now();
          }
        }
        unsafeWindow[this[_0x1a8e0f]] = _0x535bac;
      }
    });
    function _0x38762a(_0x20f8db) {
      {
        if (cidian[21][cidian[22]]("canvas") && !cidian[19].init) {
          {
            let _0x34e529 = cidian[21].body;
            _0x34e529.style.height = "100%";
            _0x34e529.parentElement.style.height = "100%";
            let _0x2c2ff9 = cidian[21].createElement("div");
            _0x2c2ff9.setAttribute("id", "gmTool");
            _0x2c2ff9.setAttribute("show", "false");
            _0x2c2ff9.setAttribute("style", "position:fixed;top:0;left:0;width:100%;height:100%;display:none;align-items:center;justify-content:center;");
            cidian[21].body.appendChild(_0x2c2ff9);
            loadScript();
            let _0x2f37fa = cidian[21][cidian[22]]("div");
            _0x2f37fa.setAttribute("style", "height: 50px;display: flex;align-items: center;position: absolute;right: 10px;top: 10px;");
            _0x2f37fa.innerHTML = "<div style=\"height: 4vh;font-size: 2vh;background: rgba(255,255,255,0.85);color: #ff6b9d;border-radius: 1.5vh;width: 50px;text-align: center;cursor: pointer;display: flex;border: 2px solid #ff6b9d;justify-content: center;align-items: center;user-select: none;font-weight: bold;backdrop-filter: blur(4px);\" id=\"开\">功能</div>";
            cidian[21].body.appendChild(_0x2f37fa);
            _0x2f37fa.style.display="none";_0x2c2ff9.style.setProperty("display","none","important");
var _nb=cidian[21].createElement("div");
_nb.setAttribute("id","newBtnWrap");
_nb.setAttribute("style","height:50px;display:flex;align-items:center;position:fixed;right:10px;top:10px;z-index:999999;");
_nb.innerHTML='<div id="\u65b0\u529f\u80fd" style="height:4vh;font-size:2vh;background:rgba(255,255,255,0.6);backdrop-filter:blur(4px);color:#ff6b9d;border-radius:1.5vh;width:50px;text-align:center;cursor:pointer;display:flex;border:2px solid #ff6b9d;justify-content:center;align-items:center;user-select:none;font-weight:bold;">\u529f\u80fd</div>';
cidian[21].body.appendChild(_nb);
var _np=cidian[21].createElement("div");
_np.setAttribute("id","newPanel");
_np.setAttribute("style","position:fixed;top:0;left:0;width:100%;height:100%;display:none;align-items:center;justify-content:center;z-index:999998;pointer-events:none;");
var _nt="\n<div class=\"newWrap\" style=\"width:60vw;display:flex;flex-flow:column;position:relative;background:rgba(0,0,0,0.3);pointer-events:auto;overflow-y:auto;max-height:90vh;-webkit-overflow-scrolling:touch;\"><div class=\"newHd\" style=\"width:100%;box-sizing:border-box;display:flex;justify-content:center;background:rgba(255,255,255,0.6);backdrop-filter:blur(12px);position:relative;height:50px;align-items:center;border:2px solid #FFB6C1;padding:8px;border-radius:10px;\"><span style=\"color:#f5788f;font-size:32px;font-weight:bold;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);\">"+document.title+"</span></div><div class=\"newBody\" style=\"display:flex;flex-direction:column;width:100%;align-items:center;flex:1;position:relative;\"><div class=\"newBtns\" style=\"display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:100%;padding:10px;box-sizing:border-box;\"><div id=\"n\u76d1\u63a7\" style=\"color:#f5788f;border-radius:10px;border:2px solid #FFB6C1;cursor:pointer;text-align:center;background:rgba(255,255,255,0.6);backdrop-filter:blur(12px);font-size:21px;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;height:40px;\">\u5f53\u524d\u6570\u503c</div><div id=\"n\u8fd0\u884c\" style=\"background:rgba(255,255,255,0.6);backdrop-filter:blur(12px);border:2px solid #FFB6C1;color:#f5788f;border-radius:10px;cursor:pointer;text-align:center;height:40px;font-size:21px;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;\">\u6267\u884c\u4ee3\u7801</div><div id=\"n\u6e05\u7a7a\" style=\"background:rgba(255,255,255,0.6);backdrop-filter:blur(12px);border:2px solid #FFB6C1;color:#f5788f;border-radius:10px;cursor:pointer;text-align:center;height:40px;font-size:21px;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;\">\u6e05\u9664\u5185\u5bb9</div><div id=\"n\u7d2f\u5145\" style=\"color:#f5788f;border-radius:10px;border:2px solid #FFB6C1;cursor:pointer;text-align:center;background:rgba(255,255,255,0.6);backdrop-filter:blur(12px);font-size:21px;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;height:40px;\">\u7d2f\u8ba1\u5145\u503c</div><div id=\"n\u5168\u5c4f\" style=\"color:#f5788f;border-radius:10px;border:2px solid #FFB6C1;cursor:pointer;text-align:center;background:rgba(255,255,255,0.6);backdrop-filter:blur(12px);font-size:21px;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;height:40px;\">\u5168\u5c4f\u6a21\u5f0f</div><div id=\"n\u5173\u95ed\" style=\"color:#f5788f;border-radius:10px;border:2px solid #FFB6C1;cursor:pointer;text-align:center;background:rgba(255,255,255,0.6);backdrop-filter:blur(12px);font-size:21px;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;height:40px;\">\u5173\u95ed</div><div id=\"n\u5b58\u6863\u7ba1\u7406\" style=\"color:#f5788f;border-radius:10px;border:2px solid #2ecc71;cursor:pointer;text-align:center;background:rgba(255,255,255,0.6);backdrop-filter:blur(12px);font-size:21px;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;height:40px;\">\u5b58\u6863\u7ba1\u7406</div><div id=\"n\u5feb\u8fdb\" style=\"color:#f5788f;border-radius:10px;border:2px solid #e67e22;cursor:pointer;text-align:center;background:rgba(255,255,255,0.6);backdrop-filter:blur(12px);font-size:21px;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;height:40px;\">\u5feb\u8fdb</div><div id=\"n\u6a21\u62df\u70b9\u51fb\" style=\"color:#f5788f;border-radius:10px;border:2px solid #3498db;cursor:pointer;text-align:center;background:rgba(255,255,255,0.6);backdrop-filter:blur(12px);font-size:21px;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;height:40px;\">\u6a21\u62df\u70b9\u51fb\u5f00</div></div><div style=\"display:flex;flex:1;width:100%;flex-direction:column;margin-top:10px;position:relative;\"><div id=\"n\u5b58\u6863\u5b50\u9762\u677f\" style=\"display:none;margin-bottom:10px;padding:10px;background:rgba(255,255,255,0.4);backdrop-filter:blur(12px);border-radius:10px;border:2px solid #2ecc71;\"><div style=\"display:flex;gap:10px;flex-wrap:wrap;align-items:center;\"><div id=\"n\u4e0b\u8f7d\u5b58\u6863\" style=\"color:#f5788f;border-radius:10px;border:2px solid #27ae60;cursor:pointer;text-align:center;padding:8px 16px;background:rgba(255,255,255,0.6);font-size:18px;text-shadow:0 0 4px #fff;\">\u4e0b\u8f7d\u5b58\u6863</div><div id=\"n\u6e05\u9664\u5b58\u6863\" style=\"color:#f5788f;border-radius:10px;border:2px solid #e74c3c;cursor:pointer;text-align:center;padding:8px 16px;background:rgba(255,255,255,0.6);font-size:18px;text-shadow:0 0 4px #fff;\">\u6e05\u9664\u6240\u6709\u5b58\u6863</div><div id=\"n\u5bfc\u5165\u5b58\u6863\" style=\"color:#f5788f;border-radius:10px;border:2px solid #8e44ad;cursor:pointer;text-align:center;padding:8px 16px;background:rgba(255,255,255,0.6);font-size:18px;text-shadow:0 0 4px #fff;\">\u5bfc\u5165\u5b58\u6863</div><div id=\"n\u6e05\u9664\u5f53\u524d\u5b58\u6863\" style=\"color:#f5788f;border-radius:10px;border:2px solid #c0392b;cursor:pointer;text-align:center;padding:8px 16px;background:rgba(255,255,255,0.6);font-size:18px;text-shadow:0 0 4px #fff;\">\u6e05\u9664\u5f53\u524d\u5b58\u6863</div><div id=\"n\u8fd4\u56de\u4e3b\u83dc\u5355\" style=\"color:#f5788f;border-radius:10px;border:2px solid #95a5a6;cursor:pointer;text-align:center;padding:8px 16px;background:rgba(255,255,255,0.6);font-size:18px;text-shadow:0 0 4px #fff;\">\u8fd4\u56de\u4e3b\u83dc\u5355</div></div><div id=\"n\u5b58\u6863\u72b6\u6001\" style=\"margin-top:8px;font-size:14px;color:#555;word-break:break-all;\"></div></div><textarea id=\"n\u8f93\u5165\u6846\" placeholder=\"\u5728\u8fd9\u91cc\u8f93\u5165\u4ee3\u7801~\" style=\"background:rgba(255,255,255,0.6);backdrop-filter:blur(12px);font-size:21px;text-shadow:0 0 4px #fff,0 0 8px rgba(255,255,255,0.8);border:2px solid #FFB6C1;height:400px;width:100%;resize:none;box-sizing:border-box;padding:8px;\"></textarea></div></div></div>\n";
_np.innerHTML=_nt;
cidian[21].body.appendChild(_np);
(function(){
var d=cidian[21];
var p=d.getElementById("newPanel");
var b=d.getElementById("newBtnWrap");
var _cgFFActive=false;
var _cgFFInterval=null;
var _cgTouchMapActive=false;
var _cgTouchMapHandler=null;
var localGameIdCache=null;
var localGameNameCache="";
(function(){var _b=document.getElementById("n\u6a21\u62df\u70b9\u51fb");if(_b){var _s=typeof unsafeWindow._mzTouchActive!=='undefined'?unsafeWindow._mzTouchActive:true;_b.textContent=_s?"\u6a21\u62df\u70b9\u51fb\u5f00":"\u6a21\u62df\u70b9\u51fb\u5173";}})();
function getLocalGameId(){
  try{if(unsafeWindow.state&&typeof unsafeWindow.state.currentGameId==="string"&&unsafeWindow.state.currentGameId.length===32){localGameIdCache=unsafeWindow.state.currentGameId;localGameNameCache=unsafeWindow.state.currentGameName||"";return localGameIdCache;}}catch(e){}
  try{var wk=Object.keys(unsafeWindow);for(var wi=0;wi<wk.length;wi++){var wv=unsafeWindow[wk[wi]];if(typeof wv==="string"&&/^[a-f0-9]{32}$/i.test(wv)){localGameIdCache=wv;break;}}}catch(e){}
  var pageName="";
  try{pageName=(unsafeWindow.state&&unsafeWindow.state.currentGameName)||"";}catch(e){}
  if(!pageName){var t=(document.title||"").replace(/- 橙光游戏$/,"").replace(/- 66RPG$/,"").replace(/\|.*$/,"").replace(/\s*-\s*$/,"").trim();pageName=t;}
  var gm={};
  for(var i=0;i<localStorage.length;i++){
    var key=localStorage.key(i);
    var sm=key.match(/^save([a-f0-9]{32})/i);
    if(sm){var hid=sm[1].toLowerCase();if(!gm[hid])gm[hid]={name:"",count:0};gm[hid].count++;
      if(!gm[hid].name){try{var v=localStorage.getItem(key);if(v&&key.indexOf("icon")===-1&&key.indexOf("Guide")===-1){var sd=JSON.parse(v);if(sd.Header)gm[hid].name=sd.Header.Name||sd.Header.GameName||sd.Header.Title||sd.Header.name||"";if(!gm[hid].name&&sd.name)gm[hid].name=sd.name;if(!gm[hid].name&&sd.gameName)gm[hid].name=sd.gameName;if(!gm[hid].name&&sd.title)gm[hid].name=sd.title;}}catch(e){}}}
    var gm2=key.match(/^Game_([a-f0-9]{32})/i);
    if(gm2){var hid2=gm2[1].toLowerCase();if(!gm[hid2])gm[hid2]={name:"",count:0};gm[hid2].count++;
      if(!gm[hid2].name){try{var v2=localStorage.getItem(key);if(v2){var sd2=JSON.parse(v2);gm[hid2].name=(sd2.Header&&(sd2.Header.Name||sd2.Header.GameName))||sd2.Name||sd2.name||"";}}catch(e){}}}
  }
  if(localGameIdCache)return localGameIdCache;
  var norm=function(s){return(s||"").replace(/[^\u4e00-\u9fff\w\d]/g,"").toLowerCase();};
  var np=norm(pageName);var ids=Object.keys(gm);
  for(var h in gm){if(gm[h].name&&norm(gm[h].name)===np){localGameIdCache=h;localGameNameCache=gm[h].name;return h;}}
  for(var h2 in gm){if(gm[h2].name){var ns=norm(gm[h2].name);if(ns.length>1&&(ns.indexOf(np)!==-1||np.indexOf(ns)!==-1)){localGameIdCache=h2;localGameNameCache=gm[h2].name;return h2;}}}
  if(np.length>=2){var head=np.substring(0,Math.max(2,Math.floor(np.length*0.6)));for(var h3 in gm){if(gm[h3].name&&norm(gm[h3].name).indexOf(head)===0){localGameIdCache=h3;localGameNameCache=gm[h3].name;return h3;}}}
  if(ids.length===1){localGameIdCache=ids[0];localGameNameCache=gm[ids[0]].name||pageName;return ids[0];}
  if(ids.length>0){ids.sort(function(a,b){return gm[b].count-gm[a].count;});localGameIdCache=ids[0];localGameNameCache=gm[ids[0]].name||pageName;return ids[0];}
  return null;
}
function refreshLocalGameId(){
  localGameIdCache=null;localGameNameCache="";
  try{localGameNameCache=(unsafeWindow.state&&unsafeWindow.state.currentGameName)||"";}catch(e){}
  if(!localGameNameCache){var t=(document.title||"").replace(/- 橙光游戏$/,"").replace(/- 66RPG$/,"").replace(/\|.*$/,"").replace(/\s*-\s*$/,"").trim();localGameNameCache=t;}
  return getLocalGameId();
}
function _cgToggleArchive(){
  var p=document.getElementById("n\u5b58\u6863\u5b50\u9762\u677f");
  if(p)p.style.display=p.style.display==="none"?"block":"none";
}
function _cgFastForward(){
  var btn=document.getElementById("n\u5feb\u8fdb");
  if(_cgFFActive){
    _cgFFActive=false;
    clearInterval(_cgFFInterval);
    _cgFFInterval=null;
    if(btn)btn.textContent="\u5feb\u8fdb";
    return;
  }
  _cgFFActive=true;
  if(btn)btn.textContent="\u505c\u6b62\u5feb\u8fdb";
  _cgFFInterval=setInterval(function(){
    if(!_cgFFActive){clearInterval(_cgFFInterval);_cgFFInterval=null;return;}
    document.dispatchEvent(new KeyboardEvent("keydown",{key:"z",keyCode:90,code:"KeyZ",bubbles:true}));
  },50);
}
function _cgDownloadSaves(){
  try{
    var gameId=refreshLocalGameId();
    if(!gameId){alert("\u672a\u627e\u5230\u5f53\u524d\u6e38\u620f\u7684\u5b58\u6863\uff01\n\u6e38\u620f\u540d\u79f0: "+(localGameNameCache||"\u672a\u77e5")+"\n\u8bf7\u5148\u4fdd\u5b58\u4e00\u4e2a\u6e38\u620f\u5b58\u6863\u3002");return;}
    var pattern=new RegExp("^(save|saveGuide).*"+gameId.replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&")+".*");
    var gameSaves={},saveCount=0;
    for(var i=0;i<localStorage.length;i++){
      var key=localStorage.key(i);
      if(pattern.test(key)){gameSaves[key]=localStorage.getItem(key);saveCount++;}
    }
    if(saveCount===0){alert("\u672a\u627e\u5230\u5f53\u524d\u6e38\u620f\u7684\u5b58\u6863\uff01\n\u8bf7\u5148\u4fdd\u5b58\u4e00\u4e2a\u6e38\u620f\u5b58\u6863\u3002");return;}
    var name="";
    try{name=localGameNameCache||"";}catch(e){}
    if(!name){
      try{
        for(var k in gameSaves){
          if(!k.includes("icon")&&!k.includes("Guide")){
            var so=JSON.parse(gameSaves[k]);
            if(so.Header&&so.Header.Name){name=so.Header.Name;break;}
          }
        }
      }catch(e){}
    }
    if(!name)name=document.title||"orangeGame";
    var now=new Date();
    var ts=now.getFullYear()+"-"+      String(now.getMonth()+1).padStart(2,"0")+"-"+      String(now.getDate()).padStart(2,"0")+"_"+
      String(now.getHours()).padStart(2,"0")+"-"+      String(now.getMinutes()).padStart(2,"0")+"-"+      String(now.getSeconds()).padStart(2,"0");
    var filename=name.replace(/[\\/:*?\"<>|]/g,"")+"_"+ts+".json";
    var saveData=JSON.stringify(gameSaves);
    var b=new Blob([saveData],{type:"application/json"});
    var a=document.createElement("a");a.href=URL.createObjectURL(b);
    a.download=filename;a.click();URL.revokeObjectURL(a.href);
    alert("\u5b58\u6863\u5907\u4efd\u6210\u529f\uff01\n\u6e38\u620f: "+name+"\n\u5b58\u6863\u6570\u91cf: "+saveCount+"\u4e2a\n\u3010\u8427\u8427\u66ae\u96e8\u3011");
  }catch(e){alert("\u5b58\u6863\u5907\u4efd\u5931\u8d25: "+e.message);}
}
function _cgClearSaves(){
  if(!confirm("\u662f\u5426\u6e05\u9664\u6240\u6709\u5b58\u6863\uff1f\u5907\u4efd\u597d\u540e\u518d\u6e05\u9664\uff01"))return;
  try{
    var saveCount=0,keysToDelete=[];
    for(var i=0;i<localStorage.length;i++){
      var key=localStorage.key(i);
      if(key.startsWith("save")||key.startsWith("saveGuide")){keysToDelete.push(key);saveCount++;}
    }
    keysToDelete.forEach(function(k){localStorage.removeItem(k);});
    try{localGameIdCache=null;}catch(e){}
    try{localGameNameCache=getLocalGameName();}catch(e){}
    alert("\u5df2\u6e05\u9664\u6240\u6709\u5b58\u6863\uff01\n\u5171\u5220\u9664 "+saveCount+" \u4e2a\u5b58\u6863\u3002");
  }catch(e){alert("\u5931\u8d25: "+e.message);}
}
function _cgClearCurrentSaves(){
  var gameId=refreshLocalGameId();
  if(!gameId){
    if(!confirm("\u26a0\ufe0f \u672a\u68c0\u6d4b\u5230\u5f53\u524d\u6e38\u620f\uff0c\u5c06\u6e05\u9664\u6240\u6709\u5b58\u6863\uff01\u64cd\u4f5c\u4e0d\u53ef\u9006\uff01\n\u786e\u5b9a\u8981\u7ee7\u7eed\u5417\uff1f"))return;
    var totalItems=localStorage.length;
    localStorage.clear();
    alert("\u6240\u6709\u5b58\u6863\u5df2\u6e05\u7a7a\uff01\u5171"+totalItems+"\u9879");
    return;
  }
  var gName="";
  try{gName=localGameNameCache||"";}catch(e){}
  if(!confirm("\u26a0\ufe0f \u786e\u5b9a\u6e05\u9664\u5f53\u524d\u6e38\u620f\u7684\u6240\u6709\u5b58\u6863\uff1f\u64cd\u4f5c\u4e0d\u53ef\u9006\uff01\n\u6e38\u620f: "+gName))return;
  try{
    var saveKeyPattern=new RegExp("^(save|saveGuide).*"+gameId.replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&")+".*");
    var clearedCount=0,keysToDelete=[];
    for(var i=0;i<localStorage.length;i++){
      var key=localStorage.key(i);
      if(saveKeyPattern.test(key)){keysToDelete.push(key);}
    }
    keysToDelete.forEach(function(k){localStorage.removeItem(k);clearedCount++;});
    try{localGameIdCache=null;}catch(e){}
    alert("\u5df2\u6e05\u7a7a "+clearedCount+" \u4e2a\u5b58\u6863\uff01\n\u6e38\u620f: "+gName);
  }catch(e){alert("\u5931\u8d25: "+e.message);}
}
function _cgImportSaves(){
  var inp=document.createElement("input");inp.type="file";inp.accept=".json";
  inp.onchange=function(e){
    var f=e.target.files[0];if(!f)return;
    var r=new FileReader();
    r.onload=function(ev){
      try{
        var d=JSON.parse(ev.target.result),c=0;
        for(var k in d){localStorage.setItem(k,d[k]);c++;}
        try{refreshLocalGameId();}catch(e){}
        alert("\u6210\u529f\u6062\u590d "+c+" \u4e2a\u5b58\u6863\uff01" +
          "\u3010\u8427\u8427\u66ae\u96e8\u3011");
      }catch(x){console.error("\u6062\u590d\u5b58\u6863\u5931\u8d25:",x);alert("\u6587\u4ef6\u683c\u5f0f\u9519\u8bef\u6216\u5df2\u635f\u574f\uff01");}
    };r.readAsText(f);
  };inp.click();
}
function _cgToggleTouchMap(){
  var btn=document.getElementById("n\u6a21\u62df\u70b9\u51fb");
  var cur=typeof unsafeWindow._mzTouchActive!=='undefined'?unsafeWindow._mzTouchActive:true;
  var next=!cur;
  unsafeWindow._mzTouchActive=next;
  try{GM_setValue('_cgTouchMapEnabled',next);}catch(e){console.log('触控映射存盘失败',e);}
  if(btn)btn.textContent=next?"\u6a21\u62df\u70b9\u51fb\u5f00":"\u6a21\u62df\u70b9\u51fb\u5173";
}
d.getElementById("\u65b0\u529f\u80fd").addEventListener("click",function(){p.style.display="flex";b.style.display="none";});

wcl._varNames=null;
wcl._loadVarNames=function(){
return new Promise(function(resolve){
if(wcl._varNames){resolve(wcl._varNames);return;}
try{var g=unsafeWindow.guid||window.guid||"",v=unsafeWindow.ver||window.ver||"";
if(!g||!v){wcl._varNames={};resolve({});return;}
fetch("https://dlcdn1.cgyouxi.com/web/"+g+"/"+v+"/Game_mini.bin?v="+Date.now()).then(function(r){
if(!r.ok)throw Error("idx");return r.arrayBuffer();
}).then(function(idxData){
var a=new Uint8Array(idxData),files=[],offset=4;
while(offset<a.length-50){try{var nl=a[offset]|(a[offset+1]<<8)|(a[offset+2]<<16)|(a[offset+3]<<24);offset+=4;if(nl<=0||nl>200)break;var fn="";for(var j=0;j<nl;j++)fn+=String.fromCharCode(a[offset+j]);offset+=nl;offset+=4;var hl=a[offset]|(a[offset+1]<<8)|(a[offset+2]<<16)|(a[offset+3]<<24);offset+=4;var h="";for(var j=0;j<hl;j++)h+=String.fromCharCode(a[offset+j]);offset+=hl;if(fn.indexOf(".bin")>-1&&hl===32)files.push({name:fn,url:"https://dlcdn1.cgyouxi.com/shareres/"+h.substring(0,2)+"/"+h});}catch(e2){break;}}
var core=files.find(function(x){return x.name==="game00.bin"||x.name==="data.bin";});
if(!core)throw Error("no core");
return fetch(core.url);
}).then(function(r){
if(!r.ok)throw Error("core download");return r.arrayBuffer();
}).then(function(coreData){
var text=new TextDecoder("utf-8",{fatal:false}).decode(coreData);
var names={},seen={};
var ptrns=[/数值\s*\[\s*(\d{1,5})\s*[:\uff1a]\s*([^\]]+?)\s*\]/g,/\[\s*(\d{1,5})\s*[:\uff1a]\s*([^\]]+?)\s*\]/g,/\b(\d{2,5})\s*[:\uff1a]\s*([\u4e00-\u9fa5][\u4e00-\u9fa5\w\s]{0,20})/g];
for(var pi=0;pi<ptrns.length;pi++){var re=ptrns[pi],m;while((m=re.exec(text))!==null){var id=parseInt(m[1]),nm=m[2].trim().replace(/[=\d\s]+$/,"").trim();if(nm&&!seen[id]){var sk=[".png",".jpg",".ogg",".mp3"];if(!sk.some(function(kw){return nm.toLowerCase().indexOf(kw)>-1;})){seen[id]=true;names[id]=nm;}}}}
wcl._varNames=names;resolve(names);
}).catch(function(){wcl._varNames={};resolve({});});
}catch(e){wcl._varNames={};resolve({});}
});
};

p.addEventListener("click",function(e){
var t=e.target;
while(t&&t.id.indexOf("n")!==0){t=t.parentElement;if(t===p)return;}
switch(t.id){
case"n\u5173\u95ed":p.style.display="none";b.style.display="flex";break;
case"n\u5168\u5c4f":if(d.fullscreenElement){d.exitFullscreen();try{screen.orientation.unlock();}catch(e){}}else{var el=d.documentElement;el.requestFullscreen();try{screen.orientation.lock("landscape").catch(function(oe){console.log(oe)})}catch(e){}}break;
case"n\u6e05\u7a7a":d.getElementById("\u006e\u8f93\u5165\u6846").value="";break;
case"n\u76d1\u63a7":
t.textContent="\u52a0\u8f7d\u4e2d...";
wcl._loadVarNames().then(function(names){
t.textContent="\u5f53\u524d\u6570\u503c";
if(wcl.sjjkz){wcl.sjjkz=false;var en=Object.entries(wcl.jkddsj);var s="";for(var i=0;i<en.length;i++){var vv=en[i][1];typeof en[i][1]=="object"&&(vv=JSON.stringify(en[i][1]));var key=en[i][0];s+="ymlf.var[\""+key+"\"]="+vv+";";var binId=parseInt(key)+1;if(names[binId])s+=" // "+names[binId];s+="\n";}wcl.jkddsj={};ymlf.msg=s;d.getElementById("\u006e\u8f93\u5165\u6846").value=s;t.style.background="rgba(255,255,255,0.6)";}else{wcl.sjjkz=true;t.style.background="#f49a9aad";}
});
break;
case"n\u8fd0\u884c":
var cd=d.getElementById("\u006e\u8f93\u5165\u6846").value;
if(cd=="\u4e0b\u8f7d\u5b58\u6863"){var sd={};for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);sd[k]=localStorage.getItem(k);}var a=d.createElement("a");var bl=new Blob([new TextEncoder().encode(JSON.stringify(sd,null,2))],{type:"text/plain"});a.href=URL.createObjectURL(bl);a.download="gameSave_"+Date.now()+".txt";a.click();URL.revokeObjectURL(a.href);return;}
try{var m=cd.match(/^ *\u641c\u7d22 +([^\s]+)/);if(m){var w=m[1];var r=[];for(var k2 in unsafeWindow.chineseDataList){if(k2.indexOf(w)!=-1)r.push("/*"+k2+"*/\nymlf.var["+(parseInt(unsafeWindow.chineseDataList[k2])-1)+"]="+ymlf.var[parseInt(unsafeWindow.chineseDataList[k2])-1]+";\n");}d.getElementById("\u006e\u8f93\u5165\u6846").value=r.join("\n");return;}}catch(ec){}
if(cd=="\u8bfb\u53d6\u5b58\u6863"){var f=d.createElement("input");f.type="file";f.click();f.addEventListener("change",async function(ev){var fr=new FileReader();fr.onload=function(ev2){var dd=new TextDecoder().decode(ev2.target.result);var o=JSON.parse(dd);localStorage.clear();for(var k3 in o){localStorage.setItem(k3,o[k3]);}};fr.readAsArrayBuffer(this.files[0]);});return;}
new Function("ymlf","window",cd)(ymlf,unsafeWindow);
break;
case"n\u7d2f\u5145":
var md=d.createElement("div");md.setAttribute("style","position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.4);display:flex;justify-content:center;align-items:center;z-index:9999999;pointer-events:auto;");md.innerHTML='<div style="background:rgba(255,255,255,0.95);border:2px solid #ff6b9d;border-radius:2vh;padding:3vh;text-align:center;min-width:30vh;backdrop-filter:blur(4px);pointer-events:auto;"><div style="color:#ff6b9d;font-size:3vh;font-weight:bold;margin-bottom:2vh;">\u8bbe\u7f6e\u7d2f\u8ba1\u5145\u503c</div><input id="_rch2" type="number" min="0" placeholder="\u8f93\u5165\u7d2f\u8ba1\u5145\u503c\u91d1\u989d" style="width:25vh;height:5vh;font-size:2.5vh;border:2px solid #ff6b9d;border-radius:1vh;text-align:center;color:#d4607a;background:rgba(255,209,224,0.3);outline:none;pointer-events:auto;"/><div style="display:flex;justify-content:center;gap:2vh;margin-top:2vh;"><div style="background:linear-gradient(135deg,#ff6b9d,#ff8fb3);color:white;padding:1vh 3vh;border-radius:1.5vh;cursor:pointer;font-size:2.5vh;font-weight:bold;pointer-events:auto;" id="_ok2">\u786e\u5b9a</div><div style="background:rgba(255,182,193,0.5);color:#d4607a;padding:1vh 3vh;border-radius:1.5vh;cursor:pointer;font-size:2.5vh;pointer-events:auto;" id="_cl2">\u53d6\u6d88</div></div></div>';d.body.appendChild(md);var inp=md.querySelector("#_rch2");inp.focus();md.querySelector("#_ok2").addEventListener("pointerdown",function(ev){ev.stopPropagation();ev.stopImmediatePropagation();var vv=parseInt(inp.value);md.remove();if(!isNaN(vv)&&vv>=0){var ti=d.getElementById("\u006e\u8f93\u5165\u6846");if(ti)ti.value="ymlf.\u7d2f\u5145="+vv;["totalFlower","freshFlower","wildFlower","tempFlower","realFlower","haveFlower"].forEach(function(ff){Object.defineProperty(ja.getInstance().userData,ff,{value:vv,writable:true,configurable:true});});}},{capture:true});md.querySelector("#_cl2").addEventListener("pointerdown",function(ev){ev.stopPropagation();md.remove();},{capture:true});md.addEventListener("click",function(ev){if(ev.target===md)md.remove();});inp.addEventListener("keydown",function(ev){if(ev.key==="Enter")md.querySelector("#_ok2").dispatchEvent(new Event("pointerdown"));});
break;
case"n\u5b58\u6863\u7ba1\u7406":_cgToggleArchive();break;
case"n\u5feb\u8fdb":_cgFastForward();break;
case"n\u6a21\u62df\u70b9\u51fb":_cgToggleTouchMap();break;
case"n\u4e0b\u8f7d\u5b58\u6863":_cgDownloadSaves();break;
case"n\u6e05\u9664\u5b58\u6863":_cgClearSaves();break;
case"n\u5bfc\u5165\u5b58\u6863":_cgImportSaves();break;
case"n\u6e05\u9664\u5f53\u524d\u5b58\u6863":_cgClearCurrentSaves();break;
case"n\u8fd4\u56de\u4e3b\u83dc\u5355":(function(){var ap=document.getElementById("n\u5b58\u6863\u5b50\u9762\u677f");if(ap)ap.style.display="none";})();break;
}
});
})();let _0x459261 = "mousedown";
            let _0x5ac4f8 = "mouseup";
            "ontouchstart" in cidian[19] && (_0x459261 = "touchstart", _0x5ac4f8 = "touchend");
            cidian[21][cidian[22]]("#开")[cidian[23]]("click", function () {
              cidian[21][cidian[22]]("#gmTool").style.display = "flex";
              this.style.display = "none";
            });
            cidian[21][cidian[22]]("#关")[cidian[23]]("click", function () {
              cidian[21][cidian[22]]("#gmTool").style.display = "none";
              cidian[21][cidian[22]]("#开").style.display = "flex";
            });
            cidian[21][cidian[22]]("#全屏")[cidian[23]]("click", function () {
              cidian[21].fullscreenElement ? cidian[21].exitFullscreen() : cidian[21].documentElement.requestFullscreen();
            });
            const _0x49580b = {
              passive: true
            };
            cidian[21][cidian[22]]("canvas")[cidian[23]]("mousedown", function () {
              cidian[19].kuaiJin = true;
              setTimeout(function () {
                cidian[19].kuaiJin ? UB && UB.system && (UB.system.quickRun = true) : UB && UB.system && (UB.system.quickRun = false);
              }, 1000);
            }, _0x49580b);
            const _0x398886 = {
              passive: true
            };
            cidian[21][cidian[22]]("canvas")[cidian[23]]("mouseup", function () {
              cidian[19].kuaiJin = false;
              UB && UB.system && (UB.system.quickRun = false);
            }, _0x398886);
            const _0x887523 = {
              passive: true
            };
            cidian[21][cidian[22]]("canvas")[cidian[23]]("touchstart", function () {
              arguments[0].touches.length == 1 && (cidian[19].kuaiJin = true, setTimeout(function () {
                {
                  cidian[19].kuaiJin ? UB && UB.system && (UB.system.quickRun = true) : UB && UB.system && (UB.system.quickRun = false);
                }
              }, 1000));
              
            }, _0x887523);
            const _0x2aa9e7 = {
              passive: true
            };
            cidian[21][cidian[22]]("canvas")[cidian[23]]("touchend", function () {
              if (arguments[0].touches.length == 0) {
                cidian[19].kuaiJin = false;
                if (UB && UB.system) {
                  {
                    UB.system.quickRun = false;
                  }
                }
              }
            }, _0x2aa9e7);
            cidian[21][cidian[22]]("#gmTool")[cidian[23]]("touchstart", function (_0x5a49f3) {
              
            });
            
cidian[21][cidian[22]]("#累计充值")[cidian[23]]("click", function () {
  let _0xmodal = cidian[21].createElement("div");
  _0xmodal.setAttribute("style", "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.4);display:flex;justify-content:center;align-items:center;z-index:999999;pointer-events:auto;");
  _0xmodal.innerHTML = '<div style="background:rgba(255,255,255,0.95);border:2px solid #ff6b9d;border-radius:2vh;padding:3vh;text-align:center;min-width:30vh;backdrop-filter:blur(4px);pointer-events:auto;"><div style="color:#ff6b9d;font-size:3vh;font-weight:bold;margin-bottom:2vh;">设置累计充值</div><input id="_rechargeInput" type="number" min="0" placeholder="输入累计充值金额" style="width:25vh;height:5vh;font-size:2.5vh;border:2px solid #ff6b9d;border-radius:1vh;text-align:center;color:#d4607a;background:rgba(255,209,224,0.3);outline:none;pointer-events:auto;"/><div style="display:flex;justify-content:center;gap:2vh;margin-top:2vh;"><div style="background:linear-gradient(135deg,#ff6b9d,#ff8fb3);color:white;padding:1vh 3vh;border-radius:1.5vh;cursor:pointer;font-size:2.5vh;font-weight:bold;pointer-events:auto;" id="_rechargeOk">确定</div><div style="background:rgba(255,182,193,0.5);color:#d4607a;padding:1vh 3vh;border-radius:1.5vh;cursor:pointer;font-size:2.5vh;pointer-events:auto;" id="_rechargeCancel">取消</div></div></div>';
  cidian[21].body.appendChild(_0xmodal);
  let _0xinput = _0xmodal.querySelector("#_rechargeInput");
  _0xinput.focus();
  _0xmodal.querySelector("#_rechargeOk").addEventListener("pointerdown", function(e){
    e.stopPropagation();
    e.stopImmediatePropagation();
    let _0xval = parseInt(_0xinput.value);
    _0xmodal.remove();
    if (!isNaN(_0xval) && _0xval >= 0) {
      cidian[21][cidian[22]]("#代码输入框").value = "ymlf.累充=" + _0xval;
      ["totalFlower","freshFlower","wildFlower","tempFlower","realFlower","haveFlower"].forEach(function(k){
        Object.defineProperty(ja.getInstance().userData, k, {value: _0xval, writable: true, configurable: true});
      });
    }
  }, {capture: true});
  _0xmodal.querySelector("#_rechargeCancel").addEventListener("pointerdown", function(e){
    e.stopPropagation();
    _0xmodal.remove();
  }, {capture: true});
  _0xmodal.addEventListener("click", function(e){if(e.target===_0xmodal)_0xmodal.remove()});
  _0xinput.addEventListener("keydown", function(e){if(e.key==="Enter")_0xmodal.querySelector("#_rechargeOk").dispatchEvent(new Event("pointerdown"))});
});cidian[21][cidian[22]]("#运行代码")[cidian[23]]("click", async function () {
              let _0x1b49e1 = cidian[21][cidian[22]]("#代码输入框").value;
              if (_0x1b49e1 == "下载存档") {
                {
                  const _0x154fd4 = {};
                  for (let _0x5c9aba = 0; _0x5c9aba < localStorage.length; _0x5c9aba++) {
                    const _0x258890 = localStorage.key(_0x5c9aba);
                    const _0x98d716 = localStorage.getItem(_0x258890);
                    _0x154fd4[_0x258890] = _0x98d716;
                  }
                  const _0x55d26d = document.createElement("a");
                  const _0x4fc957 = {
                    type: "text/plain"
                  };
                  const _0x439250 = new Blob([new TextEncoder().encode(JSON.stringify(_0x154fd4, null, 2))], _0x4fc957);
                  _0x55d26d.href = URL.createObjectURL(_0x439250);
                  _0x55d26d.download = "gameSave_" + Date.now() + ".txt";
                  _0x55d26d.click();
                  URL.revokeObjectURL(_0x55d26d.href);
                  return;
                }
              }
              unsafeWindow["搜索"] = function (_0x15c3a5) {
                try {
                  let _0x152f21 = /^ *搜索 +([^\s]+)/.exec(_0x15c3a5)[1];
                  let _0x16fec6 = [];
                  for (let _0x2b4c80 in unsafeWindow.chineseDataList) {
                    if (_0x2b4c80.indexOf(_0x152f21) != -1) {
                      let _0x2a9663 = parseInt(unsafeWindow.chineseDataList[_0x2b4c80]) - 1;
                      _0x16fec6.push("/*" + _0x2b4c80 + "*/\nymlf.var[" + _0x2a9663 + "]=" + ymlf.var[_0x2a9663] + ";\n");
                    }
                  }
                  cidian[21][cidian[22]]("#代码输入框").value = _0x16fec6.join("\n");
                } catch (_0x2b5550) {}
              };
              _0x1b49e1.search(/^ *搜索 +([^\s]+)/) != -1 && unsafeWindow["搜索"](_0x1b49e1);
              if (_0x1b49e1 == "读取存档") {
                {
                  const _0x15eefd = document.createElement("input");
                  _0x15eefd.type = "file";
                  _0x15eefd.click();
                  _0x15eefd.addEventListener("change", async function (_0x13de27) {
                    const _0x1f54c1 = new FileReader();
                    _0x1f54c1.onload = _0x382a5f => {
                      const _0x1941f7 = _0x382a5f.target.result;
                      const _0x4cc6d1 = new TextDecoder().decode(_0x1941f7);
                      const _0x42bc4c = JSON.parse(_0x4cc6d1);
                      localStorage.clear();
                      for (const _0x1f35d4 in _0x42bc4c) {
                        localStorage.setItem(_0x1f35d4, _0x42bc4c[_0x1f35d4]);
                      }
                    };
                    _0x1f54c1.readAsArrayBuffer(this.files[0]);
                  });
                  return;
                }
              }
              new Function("ymlf", "window", _0x1b49e1)(ymlf, unsafeWindow);
            });
            cidian[21][cidian[22]]("#清空数据")[cidian[23]]("click", function () {
              {
                wcl.msg = [];
                ymlf.msg;
              }
            });
            cidian[21][cidian[22]]("#监控数据")[cidian[23]]("click", function () {
              if (wcl.sjjkz) {
                wcl.sjjkz = false;
                let _0x9079be = Object.entries(wcl.jkddsj);
                let _0x2e5810 = "";
                for (let _0x20bf8f = 0; _0x20bf8f < _0x9079be.length; _0x20bf8f++) {
                  let _0x802ce0 = _0x9079be[_0x20bf8f][1];
                  typeof _0x9079be[_0x20bf8f][1] == "object" && (_0x802ce0 = JSON.stringify(_0x9079be[_0x20bf8f][1]));
                  _0x2e5810 += "ymlf.var[\"" + _0x9079be[_0x20bf8f][0] + "\"]=" + _0x802ce0 + ";\n";
                }
                wcl.jkddsj = {};
                ymlf.msg = _0x2e5810;
                this.style.background = "rgba(255,255,255,0.5); backdrop-filter: blur(12px)";
              } else {
                wcl.sjjkz = true;
                this.style.background = "#f49a9aad; backdrop-filter: blur(12px)";
              }
            });

            if (!window._$nwwy) {
              window._$nwwy = true;
              function _0x1580de() {
                try {
                  !ja.getInstance().userData.isLogin && (ja.getInstance().userData.isLogin = true);
                } catch (_0x331204) {
                  requestAnimationFrame(_0x1580de);
                }
              }
              _0x1580de();
            }
            cidian[19].init = true;
            cidian[19].kuaiJinZhong = 0;
            function _0x1fb07d(_0x5af19b) {
              {
                let _0x35be81 = cidian[21][cidian[22]]("#canvas").style.width;
                let _0x55964e = cidian[21][cidian[22]]("#canvas").style.height;
                let _0x2bd683 = cidian[21][cidian[22]]("#canvas").style.inset;
                let _0x37df62 = cidian[21][cidian[22]]("#gmTool");
                let _0x40dd91 = _0x2bd683.split(" ");
                if (parseInt(_0x35be81) > parseInt(_0x55964e)) {
                  _0x37df62.style.position = "absolute";
                  _0x37df62.style.width = "100vw";
                  _0x37df62.style.height = "100vh";
                  _0x37df62.style.transform = "rotate(0deg) scale(0.7)";
                  _0x37df62.style.top = "0";
                  _0x37df62.style.left = "0";
                  cidian[21][cidian[22]]("#编辑框").style.width = "100vw";
                  cidian[21][cidian[22]]("#代码输入框").style.width = "calc(100vw - 12vh)";
                  
                  cidian[21][cidian[22]](".node_52").style.width = "100vw";
                  cidian[21][cidian[22]](".node_51").style.width = "100vw";
                  cidian[21][cidian[22]](".node_46").style.width = "100vw";
                  cidian[21][cidian[22]](".node_46").style.justifyContent = "center";
                } else {
                  _0x37df62.style.position = "absolute";
                  _0x37df62.style.top = "0";
                  _0x37df62.style.left = "100vw";
                  _0x37df62.style.transformOrigin = "center center";
                  _0x37df62.style.width = "100vh";
                  _0x37df62.style.height = "100vw";
                  _0x37df62.style.transform = "rotate(90deg) scale(0.7)";
                  cidian[21][cidian[22]]("#编辑框").style.width = "100vh";
                  cidian[21][cidian[22]]("#代码输入框").style.width = "88vh";
                  
                  cidian[21][cidian[22]](".node_52").style.width = "100vh";
                  cidian[21][cidian[22]](".node_51").style.width = "100vh";
                  cidian[21][cidian[22]](".node_46").style.width = "100vh";
                  cidian[21][cidian[22]](".node_46").style.justifyContent = "flex-start";
                }
                
                if (unsafeWindow.SAL_payMoney && !unsafeWindow.laaeb_) {
                  {
                    unsafeWindow["商品购买数量"] = 999;
                    window["商品购买数量"] = 999;
                    unsafeWindow.SAL_payMoney = function (_0x302cd3, _0x5b4ea1, _0xa403e1, _0x52f68c, _0x458abd) {
                      let _0x2909c9 = JSON.parse(_0x5b4ea1);
                      UB.gameNewMall.goodList.goods.map(_0x3cb477 => {
                        if (_0x3cb477.itemName == _0x2909c9.name) {
                          if (_0x3cb477.limit !== undefined) _0x3cb477.limit = 999;
                          if (_0x3cb477.limitBuy !== undefined) _0x3cb477.limitBuy = 999;
                          if (_0x3cb477.buyLimit !== undefined) _0x3cb477.buyLimit = 999;
                          if (_0x3cb477.personalLimit !== undefined) _0x3cb477.personalLimit = 999;
                          if (_0x3cb477.buyed !== undefined) _0x3cb477.buyed = 0;
                          if (_0x3cb477.buyCount !== undefined) _0x3cb477.buyCount = 0;
                          UB.uiSceneList[0].successPurchase(_0x2909c9.actionID, 999);
                        }
                      });
                    };
                    unsafeWindow.laaeb_ = true;
                  }
                }
                if (UB && UB.gameNewMall && UB.gameNewMall.goodList && UB.gameNewMall.goodList.goods) {
                  try {
                    UB.gameNewMall.goodList.goods.map(function (_0x3e7f11) {
                      _0x3e7f11.limit !== undefined && (_0x3e7f11.limit = 999);
                      _0x3e7f11.limitBuy !== undefined && (_0x3e7f11.limitBuy = 999);
                      _0x3e7f11.buyLimit !== undefined && (_0x3e7f11.buyLimit = 999);
                      _0x3e7f11.personalLimit !== undefined && (_0x3e7f11.personalLimit = 999);
                      _0x3e7f11.buyed !== undefined && (_0x3e7f11.buyed = 0);
                      _0x3e7f11.buyCount !== undefined && (_0x3e7f11.buyCount = 0);
                    });
                  } catch (_0x5cf819) {}
                }
                if (UB && UB.uiSceneList && UB.uiSceneList[0] && UB.uiSceneList[0].clickBtn && UB.uiSceneList[0].clickBtn.toString().indexOf("ja._instance.isCloud") == -1) {
                  const _0xd00115 = UB.uiSceneList[0].clickBtn;
                  UB.uiSceneList[0].clickBtn = function () {
                    if (ja._instance.isCloud) {
                      return;
                    } else {
                      return _0xd00115.apply(UB.uiSceneList[0], arguments);
                    }
                  };
                }
                if (UB && UB.canvas && UB.canvas.cgMenu && UB.canvas.cgMenu.parent && UB.canvas.cgMenu.parent._elementList) {
                  {
                    UB.canvas.cgMenu.parent._elementList.map(_0x288a74 => {
                      {
                        try {
                          _0x288a74._children[1]._children[0].textureID == "https://c1.cgyouxi.com/website/hfplayer/v3/bin/res/autoSave/addictionBg_pc.png" && (_0x288a74._visible = false);
                        } catch (_0x350304) {}
                      }
                    });
                  }
                }
                if (UD && UD["data/game.bin"] && !unsafeWindow.uulsssf) {
                  {
                    const _0x20d3b3 = UD["data/game.bin"].url();
                    fetch(_0x20d3b3).then(_0x32a193 => {
                      return _0x32a193.text();
                    }).then(_0x1989b7 => {
                      let _0xc09971 = {};
                      _0x1989b7.replaceAll(/\[([0-9]+)：([^\]]+)/gs, function (_0x55e8ba, _0x57c830, _0x2cdc9e) {
                        _0xc09971[_0x2cdc9e] = _0x57c830;
                        return "";
                      });
                      unsafeWindow.chineseDataList = _0xc09971;
                    }).catch(_0x5259fa => {
                      console.error("Fetch failed:", _0x5259fa);
                    });
                    unsafeWindow.uulsssf = true;
                  }
                }
                if (ja.getInstance().userData && unsafeWindow.author_uid && !unsafeWindow.grsaa) {
                  {
                    function _0x4975a4() {
                      let _0x69ccbc = location.pathname.split("/").slice(-1)[0];
                      let _0x43b8ce = unsafeWindow.author_uid;
                      fetch("https://www.66rpg.com/ajax/Game/get_game_flower_ranking.json?gindex=" + _0x69ccbc + "&author_id=" + _0x43b8ce).then(_0x36e41f => {
                        {
                          return _0x36e41f.json();
                        }
                      }).then(_0x1c9953 => {
                        const _0x22059f = _0x1c9953.data.flower_ranking[0].coin_count;
                        ["totalFlower", "freshFlower", "wildFlower", "tempFlower", "realFlower", "haveFlower"].forEach(_0x3dff2d => {
                          {
                            const _0x37b474 = {
                              get: () => {
                                return _0x22059f;
                              }
                            };
                            Object.defineProperty(ja.getInstance().userData, _0x3dff2d, _0x37b474);
                          }
                        });
                      }).catch(_0xa11f85 => {
                        _0x4975a4();
                      });
                    }
                    _0x4975a4();
                    unsafeWindow.grsaa = true;
                  }
                }
                cidian[19].requestAnimationFrame(_0x1fb07d);
              }
            }
            _0x1fb07d();
          }
        }
        cidian[19].requestAnimationFrame(_0x38762a);
      }
    }
    _0x38762a();
  }
}
mainFunction();



// _mzTouch 触控映射：canvas上鼠标→触摸事件合成（PC专用）
(function(){
 var _mzActive = true;
 try{var s=GM_getValue('_cgTouchMapEnabled');if(s!==undefined)_mzActive=s;else _mzActive=true;}catch(e){}
 unsafeWindow._mzTouchActive = _mzActive;
 var _mzLastTouch = null;
 function _mzBindCanvas(){
 var cv = document.querySelector('canvas');
 if(!cv){setTimeout(_mzBindCanvas,200);return;}
 cv.addEventListener('mousedown',function(e){
 if(!unsafeWindow._mzTouchActive)return;
 var t = new Touch({identifier: Date.now(),target: cv,clientX: e.clientX,clientY: e.clientY,screenX: e.screenX,screenY: e.screenY,pageX: e.pageX,pageY: e.pageY,radiusX: 1,radiusY: 1,rotationAngle: 0,force: 1});
 var te = new TouchEvent('touchstart',{bubbles: true,cancelable: true,touches: [t],targetTouches: [t],changedTouches: [t]});
 cv.dispatchEvent(te);
 _mzLastTouch = t;
 },{passive:false});
 cv.addEventListener('mousemove',function(e){
 if(!unsafeWindow._mzTouchActive||!_mzLastTouch)return;
 var t = new Touch({identifier: _mzLastTouch.identifier,target: cv,clientX: e.clientX,clientY: e.clientY,screenX: e.screenX,screenY: e.screenY,pageX: e.pageX,pageY: e.pageY,radiusX: 1,radiusY: 1,rotationAngle: 0,force: 1});
 var te = new TouchEvent('touchmove',{bubbles: true,cancelable: true,touches: [t],targetTouches: [t],changedTouches: [t]});
 cv.dispatchEvent(te);
 },{passive:false});
 cv.addEventListener('mouseup',function(e){
 if(!unsafeWindow._mzTouchActive||!_mzLastTouch)return;
 var t = new Touch({identifier: _mzLastTouch.identifier,target: cv,clientX: e.clientX,clientY: e.clientY,screenX: e.screenX,screenY: e.screenY,pageX: e.pageX,pageY: e.pageY,radiusX: 1,radiusY: 1,rotationAngle: 0,force: 1});
 var te = new TouchEvent('touchend',{bubbles: true,cancelable: true,touches: [],targetTouches: [],changedTouches: [t]});
 cv.dispatchEvent(te);
 _mzLastTouch = null;
 },{passive:false});
 }
 _mzBindCanvas();
})();

})();
