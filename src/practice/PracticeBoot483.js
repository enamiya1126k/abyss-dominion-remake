const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=s=>JSON.stringify(s).replace(/</g,'\\u003c');

// Runs in the child realm before importing the game. No parent save or storage
// object is ever exposed to SaveService or to combat code.
export function installPracticeBoot483(win){
 const doc=win.document;let failure=null,timeout=null;
 const draw=()=>{
  const panel=doc.getElementById('practice-error450'),loading=doc.getElementById('practice-loading483');
  if(!panel)return;if(failure){loading.hidden=true;panel.hidden=false;doc.getElementById('practice-reason483').textContent=failure;}
 };
 const fail=error=>{if(failure)return;failure=String(error?.message??error??'起動処理を完了できませんでした').slice(0,400);win.clearTimeout(timeout);draw();};
 win.__practiceFail483=fail;
 win.addEventListener('error',event=>fail(event.error??event.message));
 win.addEventListener('unhandledrejection',event=>{
  // Autoplay permission affects sound, not an already rendered battle.
  if(win.__practiceReady450&&event.reason?.name==='NotAllowedError'&&/audio|media|play|autoplay/i.test(event.reason?.message??'')){event.preventDefault();return;}
  fail(event.reason);
 });
 doc.addEventListener('DOMContentLoaded',draw,{once:true});
 try{
  win.__practiceBoot450=structuredClone(win.frameElement.__practiceBoot450);delete win.frameElement.__practiceBoot450;
  const memory=()=>{const data=new Map();return{getItem:k=>data.get(String(k))??null,setItem:(k,v)=>data.set(String(k),String(v)),removeItem:k=>data.delete(String(k)),clear:()=>data.clear(),key:i=>[...data.keys()][i]??null,get length(){return data.size}}};
  Object.defineProperty(win,'localStorage',{value:memory()});Object.defineProperty(win,'sessionStorage',{value:memory()});
  win.WebSocket=class{constructor(){throw Error('模擬戦ではサーバーへ送信しません')}};
  win.__practiceLoaded483=()=>{win.clearTimeout(timeout);doc.getElementById('practice-loading483').hidden=true;};
  win.__practiceCanStart483=()=>!failure;
  timeout=win.setTimeout(()=>fail(Error('読み込みが完了しませんでした。接続を確認して、もう一度お試しください。')),30000);
 }catch(error){fail(error);}
}

export function practiceDocument483({base,styles,map,entry}){
 // Absolute import-map URLs are independent of about:srcdoc URL resolution.
 const source=JSON.parse(map),absolute=value=>new URL(value,base).href;
 const imports=Object.fromEntries(Object.entries(source.imports??{}).map(([k,v])=>[/^(\.|\/|https?:)/.test(k)?absolute(k):k,v===null?null:absolute(v)]));
 const scopes=Object.fromEntries(Object.entries(source.scopes??{}).map(([scope,rows])=>[absolute(scope),Object.fromEntries(Object.entries(rows).map(([k,v])=>[/^(\.|\/|https?:)/.test(k)?absolute(k):k,v===null?null:absolute(v)]))]));
 const entryUrl=absolute(entry);
 // Pin all aliases for main.js to the same entry the parent uses.
 for(const k of Object.keys(imports))if(k.split('?')[0]===absolute('./src/main.js'))imports[k]=entryUrl;
 imports[absolute('./src/main.js')]=entryUrl;
 return`<!doctype html><html lang="ja"><head><base href="${escape(base)}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><script>(${installPracticeBoot483.toString()})(window);<\/script><script type="importmap">${json({imports,scopes})}<\/script>${styles}<style>html,body{margin:0;min-height:100%;background:#09060e}#practice-error450,#practice-loading483{position:fixed;inset:25% 5% auto;padding:24px;background:#21132df5;color:#fff;border:1px solid #ab8756;border-radius:12px;z-index:999999;line-height:1.7}#practice-error450[hidden],#practice-loading483[hidden]{display:none}#practice-error450 button{margin:12px 8px 0 0;padding:12px 18px;border:1px solid #d6b777;border-radius:8px;background:#362343;color:#fff;font:inherit}#practice-error450 details{margin-top:16px;font-size:12px;overflow-wrap:anywhere}#practice-error450 h2{font-size:19px;margin:0 0 8px}</style></head><body><div id="app"></div><div id="practice-loading483" role="status">対戦を準備しています…</div><section id="practice-error450" hidden role="alert"><h2>模擬戦を開始・続行できませんでした</h2><p>本編データは変更されていません。</p><button id="practice-retry483">もう一度試す</button><button id="practice-close483">ランキングへ戻る</button><details><summary>エラーの詳細</summary><p id="practice-reason483"></p></details></section><script type="module">
 const origin=new URL(document.baseURI).origin;
 document.getElementById('practice-retry483').onclick=()=>parent.postMessage({type:'practice-retry483'},origin);
 document.getElementById('practice-close483').onclick=()=>parent.postMessage({type:'practice-close450'},origin);
 try{
  if(!globalThis.__practiceCanStart483?.())throw Error('模擬戦の準備に失敗しました');
  await import(${json(entryUrl)});
  if(!globalThis.__practiceCanStart483())throw Error('模擬戦の読み込みに失敗しました');
  if(typeof globalThis.__practiceStart483!=='function')throw Error('本体の更新が必要です。ランキングに戻って再読み込みしてください。');
  await globalThis.__practiceStart483();
  if(!globalThis.__practiceReady450)throw Error('戦闘画面を開始できませんでした');
  globalThis.__practiceLoaded483();
 }catch(error){globalThis.__practiceFail483(error);}
 <\/script></body></html>`;
}
