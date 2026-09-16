export async function openPracticeFrame450({state,opponent,onClose=()=>{}}){
 if(document.querySelector('.practice-frame-shell450'))return;
 const shell=document.createElement('section');shell.className='practice-frame-shell450';shell.setAttribute('role','dialog');shell.setAttribute('aria-label',`${opponent.displayName}との模擬戦`);
 const frame=document.createElement('iframe');frame.title='模擬戦';frame.setAttribute('allow','autoplay');
 const close=document.createElement('button');close.className='practice-frame-close450';close.textContent='模擬戦を終了';shell.append(frame,close);document.body.append(shell);
 const previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
 let closed=false;const finish=()=>{if(closed)return;closed=true;document.body.style.overflow=previousOverflow;window.removeEventListener('message',receive);shell.remove();onClose();};
 const receive=e=>{if(e.source===frame.contentWindow&&e.data?.type==='practice-close450')finish();};window.addEventListener('message',receive);close.onclick=finish;
 // A distinct browsing context owns all combat mutations and timers. Only its
 // copied state is available to SaveService; persistent storage is shadowed.
 frame.__practiceBoot450=structuredClone({state,opponent});
 const base=new URL('./',document.baseURI).href;
 const styles=[...document.querySelectorAll('link[rel="stylesheet"],style')].map(e=>e.outerHTML).join('\n');
 const map=document.querySelector('script[type="importmap"]')?.textContent??'{"imports":{}}';
 const boot=`globalThis.__practiceBoot450=structuredClone(frameElement.__practiceBoot450);delete frameElement.__practiceBoot450;
 const memory=()=>{const data=new Map();return{getItem:k=>data.get(String(k))??null,setItem:(k,v)=>data.set(String(k),String(v)),removeItem:k=>data.delete(String(k)),clear:()=>data.clear(),key:i=>[...data.keys()][i]??null,get length(){return data.size}}};
 Object.defineProperty(window,'localStorage',{value:memory()});Object.defineProperty(window,'sessionStorage',{value:memory()});
 window.WebSocket=class{constructor(){throw Error('模擬戦ではサーバーへ送信しません')}};
 addEventListener('error',()=>{document.querySelector('#practice-error450').hidden=false});addEventListener('unhandledrejection',()=>{document.querySelector('#practice-error450').hidden=false});`;
 frame.srcdoc=`<!doctype html><html lang="ja"><head><base href="${base}"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><script>${boot}<\/script><script type="importmap">${map}<\/script>${styles}<style>html,body{margin:0;min-height:100%;background:#09060e}#practice-error450{position:fixed;inset:25% 5% auto;background:#21132d;color:#fff;padding:24px;z-index:999999}#practice-error450[hidden]{display:none}</style></head><body><div id="app"></div><div id="practice-error450" hidden>模擬戦を続行できませんでした。本編データは変更されていません。右上から終了してください。</div><script type="module">await import('./src/main.js');<\/script></body></html>`;
 return{close:finish,frame};
}
