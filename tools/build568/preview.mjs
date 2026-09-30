import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root=resolve(new URL('../../',import.meta.url).pathname);
const css=['build550-ricochet','build563-arcade','build564-hockey','build565-hockey'];
export const html=`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>
${process.env.QA_FONT?"@font-face{font-family:'Noto Sans JP';src:url('/qa-font.ttf')}":''}
body{margin:0;background:#092821;color:#fff1cf;font-family:'Noto Sans JP',sans-serif}button,input{font:inherit}.sg-monster{display:inline-block;width:40px;height:40px}button{cursor:pointer}</style>
${css.map(s=>'<link rel="stylesheet" href="/src/Styles/'+s+'.css">').join('')}<main id="root"></main><script type="module">
import * as rules from '/src/ricochet550/Hockey564.js';
import * as view from '/src/ricochet550/View550.js';
import {members} from '/tools/build563/fixture.mjs';
window.c={root:document.querySelector('#root'),state:{},transport:{selfId:'p0'},offset:0,error:'',ready:()=>true,connected:()=>true,roster:()=>members().map(p=>p.choice),sgSpeciesName463:x=>({slime:'スライム',goblin:'ゴブリン',wolf:'ウルフ',skeleton:'スケルトン'}[x]??x),refresh:()=>{}};
let timer;window.sent=[];
c.raw=(op,m)=>{sent.push({op,...m});if(op==='ricochetInput550'){const p=rawGame.players.find(p=>p.playerId===c.transport.selfId);return rules.input564(rawGame,p,m);}if(['team','hockeyOptions'].includes(m.kind)){rules.configureHockey564(rawGame,c.state.party,rawGame.members.find(p=>p.playerId===c.transport.selfId),m);sync();c.render();return true;}return true;};
c.render=()=>{view.ricochetBefore550(c);c.root.innerHTML=view.ricochetView550(c);view.ricochetAfter550(c);};
c.root.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&!b.disabled)view.ricochetClick550(c,b)});c.root.addEventListener('keydown',e=>view.ricochetKey550(c,e));
window.sync=()=>{const old=c.state.ricochet?.phase;c.state.ricochet=rules.publicHockey564(rawGame,c.transport.selfId);view.ricochetReceive550(c);if(old&&old!==rawGame.phase)c.render();};
window.freeze=()=>clearInterval(timer);
window.load=(phase='play',self=0,count=4)=>{freeze();view.ricochetBefore550(c);c.transport.selfId='p'+self;c.offset=0;window.sent=[];
 const people=members().slice(0,count);window.rawGame=rules.makeHockey564({id:'preview-'+Date.now(),code:'TEST',partyId:'party',hostId:'p0',members:people,now:Date.now()-4000});
 c.state.party={id:'party',hostId:'p0',members:people.map(p=>({...p,ready:true,connected:true}))};
 if(phase!=='lobby'){rules.startHockey564(rawGame,Date.now()-4000,565);for(let t=rawGame.simAt+20;t<=Date.now();t+=20)rules.advanceHockey564(rawGame,t);rawGame.players.forEach(p=>p.ai=p.playerId!==c.transport.selfId);}
 sync();c.render();if(phase==='play')timer=setInterval(()=>{rules.advanceHockey564(rawGame,Date.now());sync();},40);
};
window.advance=ms=>{const until=rawGame.simAt+ms;for(let t=rawGame.simAt+20;t<=until;t+=20)rules.advanceHockey564(rawGame,t);c.offset=rawGame.simAt-Date.now();sync();};
window.finish=(draw=false)=>{freeze();rawGame.teams564[0].score=draw?3:4;rawGame.teams564[1].score=3;rules.finishHockey564(rawGame,Date.now());sync();};
window.demo=()=>{load();freeze();rawGame.players.forEach((p,i)=>{p.vx=p.vy=0;p.x=[-3.5,3.4,2.4,-3.2][i];p.y=[5.3,13.2,3.6,15][i];});rawGame.teams564[0].score=2;rawGame.teams564[1].score=1;rawGame.gem={x:.9,y:11.6,vx:0,vy:0,r:.42,mass:.65,value:1,serial:1,charge565:4,chain565:4};rawGame.deadline=Date.now()+61000;rawGame.rotor.angle=.38;sync();};
load(new URLSearchParams(location.search).get('phase')??'play',Number(new URLSearchParams(location.search).get('self')??0));window.goalDemo=(own=false,charge=6)=>{load();freeze();rawGame.players.forEach(p=>{p.x=p.seat<2?-6:6;p.y=p.team564===0?3:15;p.vx=p.vy=0;});rawGame.gem={x:0,y:own?-.7:19.1,vx:0,vy:0,r:.42,mass:.65,lastTouch:0,serial:9,charge565:charge,value:1};rawGame.simAt=Date.now();rules.physicsHockey564(rawGame);sync();};window.ready=true;
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
if(process.argv.includes('--serve'))createServer().listen(8568,'127.0.0.1',()=>console.log('http://127.0.0.1:8568'));
