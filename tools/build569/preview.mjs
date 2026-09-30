import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root=resolve(new URL('../../',import.meta.url).pathname);
const css=['build563-arcade','build569-bomb'];
export const html=`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>
${process.env.QA_FONT?"@font-face{font-family:'Noto Sans JP';src:url('/qa-font.ttf')}":''}
body{margin:0;background:#092821;color:#fff1cf;font-family:'Noto Sans JP',sans-serif}button,input{font:inherit}.sg-monster{display:inline-block;width:40px;height:40px}</style>
${css.map(s=>'<link rel="stylesheet" href="/src/Styles/'+s+'.css">').join('')}<main id="root"></main><script type="module">
import * as rules from '/src/bomb/Relay569.js';
import * as view from '/src/bomb/View569.js';
import {members} from '/tools/build563/fixture.mjs';
window.c={root:document.querySelector('#root'),state:{},transport:{selfId:'p0'},offset:0,error:'',ready:()=>true,connected:()=>true,roster:()=>members().map(p=>p.choice),sgSpeciesName463:x=>x,refresh:()=>{}};
let timer;window.sent=[];window.rules=rules;
c.raw=(op,m)=>{sent.push({op,...m});if(op==='bombInput542'){const ok=rules.inputRelay569(rawGame,rawGame.players.find(p=>p.playerId===c.transport.selfId),m);sync();return ok;}return true;};
c.render=()=>{view.bombBefore569(c);c.root.innerHTML=view.bombView569(c);view.bombAfter569(c);};
c.root.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&!b.disabled)view.bombClick569(c,b)});c.root.addEventListener('keydown',e=>view.bombKey569(c,e));
window.sync=()=>{const old=c.state.bomb?.phase;c.state.bomb=rules.publicRelay569(rawGame,c.transport.selfId);view.bombReceive569(c);if(old&&old!==rawGame.phase)c.render();};
window.freeze=()=>clearInterval(timer);
window.load=(round=1,self=0,phase='play')=>{freeze();c.transport.selfId='p'+self;c.offset=0;window.sent=[];const people=members();window.rawGame=rules.makeRelay569({id:'preview-'+Date.now(),code:'TEST',partyId:'party',hostId:'p0',members:people,now:Date.now()-3400});c.state.party={id:'party',hostId:'p0',members:people.map(p=>({...p,ready:true,connected:true}))};
 if(phase!=='lobby'){rules.startRelay569(rawGame,Date.now()-3400,569);rawGame.round=round;for(let t=rawGame.lastAt+20;t<=Date.now();t+=20)rules.advanceRelay569(rawGame,t);}
 sync();c.render();if(phase==='play')timer=setInterval(()=>{rules.advanceRelay569(rawGame,Date.now());sync();},20);
};
window.advance=ms=>{freeze();const until=rawGame.lastAt+ms;for(let t=rawGame.lastAt+20;t<=until;t+=20)rules.advanceRelay569(rawGame,t);c.offset=rawGame.lastAt-Date.now();sync();};
window.demo=(hidden=false)=>{load(3);freeze();rawGame.bombs.forEach(b=>{b.holder=0;b.readyAt=rawGame.lastAt-10;b.receivedAt=rawGame.lastAt-1000;});rawGame.players.forEach((p,i)=>{p.bank=[120,98,142,106][i];p.roundScore=[38,24,29,42][i];p.roundHeldMs=p.roundScore*100;p.score=p.bank+p.roundScore;});if(hidden)advance(5500);else sync();};
load();window.ready=true;
</script></html>`;
export function createServer(){return http.createServer(async(req,res)=>{
  try{
    const p=new URL(req.url,'http://local').pathname;
    if(p==='/'){res.setHeader('Content-Type','text/html');return res.end(html);}
    if(p==='/favicon.ico'){res.writeHead(204);return res.end();}
    // Only the outside party lobby is isolated; game UI, art, input and physics are production code.
    if(p==='/src/party/PartyView462.js'){res.setHeader('Content-Type','text/javascript');return res.end('export const partySeats462=()=>"";');}
    const file=p==='/qa-font.ttf'?process.env.QA_FONT:resolve(root,p.slice(1));
    if(p!=='/qa-font.ttf'&&!file.startsWith(root+'/'))throw Error('bad path');
    const bytes=await readFile(file);res.setHeader('Content-Type',{'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf','.svg':'image/svg+xml'}[extname(file)]??'application/octet-stream');res.end(bytes);
  }catch(e){res.writeHead(404);res.end(String(e));}
});}
if(process.argv.includes('--serve'))createServer().listen(8569,'127.0.0.1',()=>console.log('http://127.0.0.1:8569'));
