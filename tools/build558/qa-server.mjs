import {clientURL551,presentationURL551} from './client-fixture.mjs';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as R from '../../src/cart/Rules543.js';
import {handleCart543,queueCart543,advanceCarts543,cartSnapshot543,liveCart543} from '../../online-server/src/CartCoordinator543.js';
import {partyFixture550} from './party-fixture.mjs';
const P=await partyFixture550(),ws=await import(process.env.PLAYWRIGHT_WS_MODULE),WebSocketServer=ws.WebSocketServer??ws.default?.wsServer;
const root=resolve(fileURLToPath(new URL('../../',import.meta.url))),font=process.env.QA_FONT_PATH??resolve(root,'../runtime548/NotoSansJP.ttf');
const html=`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ABYSS · Build558</title><style>@font-face{font-family:'Noto Sans JP';src:url('/qa/font.ttf')}html,body{margin:0;background:#0b2c23;color:#fff0d2;font:14px 'Noto Sans JP',sans-serif}button,input{font:inherit}.party-seats462{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px}.party-seats462>div{border:1px solid #d2bc7b55;border-radius:7px;padding:10px}.party-seats462 span{display:block}.party-seats462 small{display:block}.seat-avatar462{display:none!important}.party-hub462{padding:20px}.party-games462{display:grid;gap:15px}.game-cover462{background:#143b2e;color:#ffeabc;border:1px solid #a68e55;border-radius:10px;overflow:hidden;padding:0}.game-cover462 img{width:100%;height:180px;object-fit:cover}.game-caption462{display:block;padding:12px}.game-caption462>*{display:block}.game-cover462:nth-child(n+3){display:none}</style><link rel="stylesheet" href="/src/Styles/build543-cart.css"><link rel="stylesheet" href="/src/Styles/build544-cart.css"><link rel="stylesheet" href="/src/Styles/build545-minigames.css"><link rel="stylesheet" href="/src/Styles/build547-cart-sling.css"><link rel="stylesheet" href="/src/Styles/build548-cart-craft.css"><link rel="stylesheet" href="/src/Styles/build549-cart-collision.css"><link rel="stylesheet" href="/src/Styles/build556-cart-courses.css"><link rel="stylesheet" href="/src/Styles/build557-cart-parking.css"><script type="importmap">{"imports":{"/src/sugoroku/Wallet474.js":"/qa/unused-wallet.js"}}</script><main id="app"></main><script type="module" src="/tools/build558/preview.mjs"></script></html>`;
let c,now=Date.now(),paused=false,serial=0;const sockets=new Map();
const members=['あなた','改造ゴブ','より','ネジ余った骨'].map((name,i)=>({playerId:'p'+i,name,color499:['orange','green','pink','blue'][i],choice:{id:'m'+i,speciesId:['slime','goblin','wolf','skeleton'][i]},owned:Array.from({length:4},(_,j)=>({id:'m'+j,speciesId:['slime','goblin','wolf','skeleton'][j]})),slotOne476:'m'+i,ready:false,atHome:false,ricochetVersion550:6,cartVersion543:7}));
const send=(id,m)=>{const s=sockets.get(id);if(s?.readyState===1)s.send(JSON.stringify(m))};
const current=()=>P.partyRace462(c,Object.values(c.data.parties462)[0]);
const push=id=>{const g=current();send(id,{type:'raceState451',selfId:id,serverNow:now,ricochetVersion550:6,cartVersion543:7,partyResultActions490:1,available:true,cart:g?cartSnapshot543(c,g,id):null,party:P.partyView462(c,c.sessions.get(id))})};
function reset({phase='play',round=1,courseId,humans=4,seed=556}={}){
 now=Date.now();paused=false;const party={id:'party'+(++serial),code:'LOCAL',hostId:'p0',members:structuredClone(members.slice(0,humans)),aiColors500:{}};c={data:{serial,accounts:{},rooms:{},parties462:{LOCAL:party}},sessions:new Map(members.map(m=>[m.playerId,{playerId:m.playerId,connected:sockets.has(m.playerId)}])),subscribers:new Set(members.map(m=>m.playerId)),now:()=>now,isBusy:()=>false,roomFor:()=>null,canJoin:()=>true,roster:x=>structuredClone(x),member:(g,id)=>g?.members.find(m=>m.playerId===id&&!m.departed),send,transaction:fn=>fn(),broadcast(){for(const id of sockets.keys())push(id)},push:s=>{if(s)push(s.playerId)}};P.openGame462(c,party,'cart');const g=current();if(phase!=='lobby'){
 R.startCart543(g,now,seed);if(courseId){g.courseDeck556[round-1]=courseId;g.courseId556=courseId;}else g.courseId556=g.courseDeck556[round-1];g.round=round;g.multiplier=round===5?2:1;
 if(phase==='play'){g.phase='play';g.phaseAt=now;g.roundAt=now;g.lastAt=now;g.elapsed=0;}
 }
 c.broadcast();return g;
}
reset();const timer=setInterval(()=>{if(paused)return;now=Date.now();advanceCarts543(c)},25);
const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost'),p=decodeURIComponent(u.pathname);if(p.startsWith('/qa/')&&req.method==='POST'){let body='';for await(const chunk of req)body+=chunk;const data=JSON.parse(body||'{}');let out={ok:true};
 if(p==='/qa/reset')out={id:reset(data).id};
 if(p==='/qa/connections')out=Object.fromEntries([...c.sessions].map(([id,s])=>[id,s.connected]));
 if(p==='/qa/state')out=liveCart543(c,current());
 if(p==='/qa/advance'){for(let i=0;i<data.ms;i+=25){now+=25;advanceCarts543(c)}paused=true;c.broadcast()}
 if(p==='/qa/step'){for(let i=0;i<data.ms;i+=25){now+=25;advanceCarts543(c)}paused=true}
 if(p==='/qa/position'){const g=liveCart543(c,current());for(const v of data.players??[])Object.assign(g.players[v.seat],v);c.broadcast()}
 if(p==='/qa/pause')paused=!!data.value;
 res.setHeader('Content-Type','application/json');res.end(JSON.stringify(out));return}
 if(p==='/preview.html'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return}
 if(p==='/favicon.ico'){res.writeHead(204);res.end();return}
 if(p==='/qa/client.js'){res.setHeader('Content-Type','text/javascript');res.end("export {RaceClient451} from '"+await clientURL551({browser:true})+"';");return}
 if(p==='/qa/presentation.js'){res.setHeader('Content-Type','text/javascript');res.end("export {raceDomSignature452} from '"+await presentationURL551({browser:true})+"';");return}
 if(p==='/qa/unused-wallet.js'){res.setHeader('Content-Type','text/javascript');res.end("export function prepareEntry474(){throw Error('Unrelated wallet outside fixture')}");return}
 const path=p==='/qa/font.ttf'?font:resolve(root,p.slice(1));if(path!==font&&!path.startsWith(root+'/')){res.writeHead(403);res.end();return}const bytes=await readFile(path);res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf'})[extname(path)]??'application/octet-stream');res.end(bytes);
 }catch(e){res.writeHead(404);res.end(String(e))}});
const wss=new WebSocketServer({server});wss.on('connection',(socket,req)=>{const id=new URL(req.url,'http://localhost').searchParams.get('self')??'p0';sockets.set(id,socket);c.sessions.get(id).connected=true;push(id);socket.on('message',b=>{try{const m=JSON.parse(b),session=c.sessions.get(id);if(m.op==='cartInput543')queueCart543(c,session,m);else{if(!handleCart543(c,session,m))P.handleParty462(c,session,m);c.broadcast()}}catch(e){send(id,{type:'raceError451',message:e.message})}});socket.on('close',()=>{if(sockets.get(id)===socket){sockets.delete(id);c.sessions.get(id).connected=false}})});
server.listen(8558,'127.0.0.1',()=>console.log('cart556 QA ready'));process.on('SIGTERM',()=>{clearInterval(timer);wss.close();server.close();process.exit()});
