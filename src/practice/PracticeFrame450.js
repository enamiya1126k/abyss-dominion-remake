import {practiceDocument483} from './PracticeBoot483.js';

export async function openPracticeFrame450({state,opponent,onClose=()=>{}}){
 if(document.querySelector('.practice-frame-shell450'))return;
 // Clone before opening the overlay: invalid input must never strand the parent.
 const snapshot=structuredClone({state,opponent});
 const base=new URL('./',document.baseURI).href;
 const styles=[...document.querySelectorAll('link[rel="stylesheet"],style')].map(e=>e.outerHTML).join('\n');
 const map=document.querySelector('script[type="importmap"]')?.textContent??'{"imports":{}}';
 // Reuse the entry point actually loaded by the parent, including its build.
 const entry=globalThis.__abyssMainUrl483??new URL(JSON.parse(map).imports?.['./src/main.js']??'./src/main.js',base).href;
 const html=practiceDocument483({base,styles,map,entry});
 const shell=document.createElement('section');shell.className='practice-frame-shell450';shell.setAttribute('role','dialog');shell.setAttribute('aria-label',`${opponent.displayName}との模擬戦`);
 const close=document.createElement('button');close.className='practice-frame-close450';close.textContent='模擬戦を終了';
 const previousOverflow=document.body.style.overflow,previousFocus=document.activeElement;
 let closed=false,frame=null;
 const finish=()=>{if(closed)return;closed=true;document.body.style.overflow=previousOverflow;window.removeEventListener('message',receive);shell.remove();previousFocus?.focus?.({preventScroll:true});onClose();};
 const launch=()=>{if(closed)return;const next=document.createElement('iframe');next.title='模擬戦';next.setAttribute('allow','autoplay');next.__practiceBoot450=structuredClone(snapshot);next.srcdoc=html;if(frame)frame.replaceWith(next);else shell.prepend(next);frame=next;};
 const receive=e=>{if(e.source!==frame?.contentWindow||e.origin!==new URL(base).origin)return;if(e.data?.type==='practice-close450')finish();else if(e.data?.type==='practice-retry483')launch();};
 close.onclick=finish;shell.append(close);document.body.append(shell);document.body.style.overflow='hidden';window.addEventListener('message',receive);
 try{launch();close.focus?.({preventScroll:true});}catch(error){finish();throw error}
 return{close:finish,get frame(){return frame}};
}
