import {clientURL551,presentationURL551} from './client-fixture.mjs';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as R from '../../src/ricochet550/Rules550.js';
import {handleRicochet550,queueRicochet550,advanceRicochets550,ricochetSnapshot550,liveRicochet550} from '../../online-server/src/RicochetCoordinator550.js';
import {partyFixture550} from './party-fixture.mjs';
const P=await partyFixture550(),ws=await import(process.env.PLAYWRIGHT_WS_MODULE),WebSocketServer=ws.WebSocketServer??ws.default?.wsServer;
const root=resolve(fileURLToPath(new URL('../../',import.meta.url))),font=process.env.QA_FONT_PATH??resolve(root,'../runtime548/NotoSansJP.ttf');
const html=`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ABYSS · Build552</title><style>@font-face{font-family:'Noto Sans JP';src:url('/qa/font.ttf')}html,body{margin:0;background:#0b2c23;color:#fff0d2;font:14px 'Noto Sans JP',sans-serif}button,input{font:inherit}.party-seats462{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px}.party-seats462>div{border:1px solid #d2bc7b55;border-radius:7px;padding:10px}.party-seats462 span{display:block}.party-seats462 small{display:block}.seat-avatar462{display:none!important}.party-hub462{padding:20px}.party-games462{display:grid;gap:15px}.game-cover462{background:#143b2e;color:#ffeabc;border:1px solid #a68e55;border-radius:10px;overflow:hidden;padding:0}.game-cover462 img{width:100%;height:180px;object-fit:cover}.game-caption462{display:block;padding:12px}.game-caption462>*{display:block}.game-cover462:nth-child(n+3){display:none}</style><link rel="stylesheet" href="/src/Styles/build550-ricochet.css"><link rel="stylesheet" href="/src/Styles/build551-continuous.css"><link rel="stylesheet" href="/src/Styles/build552-carnival.css"><script type="importmap">{"imports":{"/src/sugoroku/Wallet474.js":"/qa/unused-wallet.js"}}</script><main id="app"></main><script type="module" src="/tools/build552/preview.mjs"></script></html>`;
let c,now=Date.now(),paused=false,serial=0;const sockets=new Map();
const members=['あなた','改造ゴブ','より','ネジ余った骨'].map((name,i)=>({playerId:'p'+i,name,color499:['orange','green','pink','blue'][i],choice:{id:'m'+i,speciesId:['slime','goblin','wolf','skeleton'][i]},owned:Array.from({length:4},(_,j)=>({id:'m'+j,speciesId:['slime','goblin','wolf','skeleton'][j]})),slotOne476:'m'+i,ready:false,atHome:false,ricochetVersion550:3}));
const send=(id,m)=>{const s=sockets.get(id);if(s?.readyState===1)s.send(JSON.stringify(m))};
const current=()=>P.partyRace462(c,Object.values(c.data.parties462)[0]);
const push=id=>{const g=current();send(id,{type:'raceState451',selfId:id,serverNow:now,ricochetVersion550:3,partyResultActions490:1,available:true,ricochet:g?ricochetSnapshot550(c,g,id):null,party:P.partyView462(c,c.sessions.get(id))})};
function reset({mode='pinball',phase='choice',round=1,humans=4,upgrades=false}={}){
 now=Date.now();paused=false;const party={id:'party'+(++serial),code:'LOCAL',hostId:'p0',members:structuredClone(members.slice(0,humans)),aiColors500:{}};c={data:{serial,accounts:{},rooms:{},parties462:{LOCAL:party}},sessions:new Map(members.map(m=>[m.playerId,{playerId:m.playerId,connected:sockets.has(m.playerId)}])),subscribers:new Set(members.map(m=>m.playerId)),now:()=>now,isBusy:()=>false,roomFor:()=>null,canJoin:()=>true,roster:x=>structuredClone(x),member:(g,id)=>g?.members.find(m=>m.playerId===id&&!m.departed),send,transaction:fn=>fn(),broadcast(){for(const id of sockets.keys())push(id)},push:s=>{if(s)push(s.playerId)}};P.openGame462(c,party,mode);const g=current();if(phase!=='lobby'){
  R.start550(g,now,550);g.round=round;g.theme=(round-1)%4;g.layout=R.layout550(g);
  if(upgrades)for(const p of g.players){p.parts=mode==='pinball'?{spring:1,echo:2,cell:2,crown:1,dice:1}:{rocket:2,spring:1,armor:1,cell:1,engine:1,wheels:1};p.charge=35;p.mass=1+(p.parts.armor??0)*.6;p.score=[3840,2780,4100,1900][p.seat]}
  if(phase==='play'){g.players.forEach(p=>R.pick550(g,p,p.offers[0]));g.phase='play';g.phaseAt=now;g.roundAt=now;g.simAt=now;g.deadline=now+R.RICOCHET550.play;g.elapsed=0}
  if(phase==='unused'){g.players.forEach((p,i)=>{p.roundScore=[1280,795,2240,632][i];p.roundHits=12+i});R.finishRound550(g,now);paused=true}
  if(phase==='result'){g.round=g.rounds;g.players.forEach((p,i)=>{p.roundScore=[18840,23500,17080,19620][i];p.roundHits=12+i});R.finishRound550(g,now);paused=true}
 }
 c.broadcast();return g;
}
reset();const timer=setInterval(()=>{if(paused)return;now=Date.now();advanceRicochets550(c)},20);
const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost'),p=decodeURIComponent(u.pathname);if(p.startsWith('/qa/')&&req.method==='POST'){let body='';for await(const chunk of req)body+=chunk;const data=JSON.parse(body||'{}');let out={ok:true};
 if(p==='/qa/reset')out={id:reset(data).id};
 if(p==='/qa/connections')out=Object.fromEntries([...c.sessions].map(([id,s])=>[id,s.connected]));
 if(p==='/qa/state')out=liveRicochet550(c,current());
 if(p==='/qa/advance'){for(let i=0;i<data.ms;i+=20){now+=20;advanceRicochets550(c)}paused=true;c.broadcast()}
 if(p==='/qa/step'){for(let i=0;i<data.ms;i+=20){now+=20;advanceRicochets550(c)}paused=true}
 if(p==='/qa/position'){const g=liveRicochet550(c,current());for(const v of data.players??[]){Object.assign(g.players[v.seat],v);g.players[v.seat].maxY=Math.max(g.players[v.seat].maxY,g.players[v.seat].y)}g.layout=R.layout550(g);c.broadcast()}
 if(p==='/qa/offers'){const g=liveRicochet550(c,current());g.players[0].offers=data.items;c.broadcast()}
 if(p==='/qa/pause')paused=!!data.value;
 if(p==='/qa/push'){const g=reset({mode:data.mode,phase:'play'});Object.assign(g.players[0],{x:.1,y:3});Object.assign(g.players[1],{x:-1.4,y:3});Object.assign(g.players[2],{x:3,y:12});Object.assign(g.players[3],{x:-3,y:14});c.broadcast();out={id:g.id}}
 res.setHeader('Content-Type','application/json');res.end(JSON.stringify(out));return}
 if(p==='/preview.html'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return}
 if(p==='/favicon.ico'){res.writeHead(204);res.end();return}
 if(p==='/qa/client.js'){res.setHeader('Content-Type','text/javascript');res.end("export {RaceClient451} from '"+await clientURL551({browser:true})+"';");return}
 if(p==='/qa/presentation.js'){res.setHeader('Content-Type','text/javascript');res.end("export {raceDomSignature452} from '"+await presentationURL551({browser:true})+"';");return}
 if(p==='/qa/unused-wallet.js'){res.setHeader('Content-Type','text/javascript');res.end("export function prepareEntry474(){throw Error('Unrelated wallet outside fixture')}");return}
 const path=p==='/qa/font.ttf'?font:resolve(root,p.slice(1));if(path!==font&&!path.startsWith(root+'/')){res.writeHead(403);res.end();return}const bytes=await readFile(path);res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf'})[extname(path)]??'application/octet-stream');res.end(bytes);
 }catch(e){res.writeHead(404);res.end(String(e))}});
const wss=new WebSocketServer({server});wss.on('connection',(socket,req)=>{const id=new URL(req.url,'http://localhost').searchParams.get('self')??'p0';sockets.set(id,socket);c.sessions.get(id).connected=true;push(id);socket.on('message',b=>{try{const m=JSON.parse(b),session=c.sessions.get(id);if(m.op==='ricochetInput550')queueRicochet550(c,session,m);else{if(!handleRicochet550(c,session,m))P.handleParty462(c,session,m);c.broadcast()}}catch(e){send(id,{type:'raceError451',message:e.message})}});socket.on('close',()=>{if(sockets.get(id)===socket){sockets.delete(id);c.sessions.get(id).connected=false}})});
server.listen(8550,'127.0.0.1',()=>console.log('ricochet550 QA ready'));process.on('SIGTERM',()=>{clearInterval(timer);wss.close();server.close();process.exit()});
