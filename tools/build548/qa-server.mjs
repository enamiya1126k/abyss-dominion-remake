// Real cart coordinator and wire protocol, isolated from live rooms/save data.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as R from '../../src/cart/Rules543.js';
import {advanceCarts543,queueCart543,liveCart543,cartSnapshot543} from '../../online-server/src/CartCoordinator543.js';
const ws=await import(process.env.PLAYWRIGHT_WS_MODULE),WebSocketServer=ws.WebSocketServer??ws.default?.wsServer;
const root=resolve(fileURLToPath(new URL('../../',import.meta.url))),runtime=process.env.RUNTIME548??resolve(root,'../runtime548');
const html=`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Build548 · cart presentation verification</title><style>@font-face{font-family:'Noto Sans JP';src:url('/qa/font.ttf')}html,body{margin:0;background:#102e27;font:14px 'Noto Sans JP',sans-serif}button,input{font:inherit}</style><link rel="stylesheet" href="/src/Styles/build543-cart.css"><link rel="stylesheet" href="/src/Styles/build544-cart.css"><link rel="stylesheet" href="/src/Styles/build545-minigames.css"><link rel="stylesheet" href="/src/Styles/build547-cart-sling.css"><link rel="stylesheet" href="/src/Styles/build548-cart-craft.css"><script type="importmap">{"imports":{"/src/sugoroku/Wallet474.js":"/qa/unused-wallet.js"}}</script><main id="app"></main><script type="module" src="/tools/build548/preview.mjs"></script></html>`;
const sockets=new Map();let c,now=Date.now(),serial=0,paused=false;
const send=(id,m)=>{const s=sockets.get(id);if(s?.readyState===1)s.send(JSON.stringify(m))};
const current=()=>Object.values(c.data.cartRooms543)[0];
const push=id=>send(id,{type:'raceState451',selfId:id,serverNow:now,cartVersion543:4,cart:cartSnapshot543(c,current(),id)});
function reset({round=2}={}){
 now=Date.now();paused=false;const members=['あなた','押すなよゴブ','より','おさきに骨さん'].map((name,i)=>({playerId:'p'+i,name,color499:['orange','blue','green','pink'][i],choice:{id:'m'+i,speciesId:['slime','goblin','wolf','skeleton'][i]}}));
 const g=R.makeCart543({id:'qa547-'+(++serial),code:'LOCAL',partyId:'party',hostId:'p0',now,members});R.startCart543(g,now,547);g.round=round;g.phase='play';g.roundAt=now;g.lastAt=now;g.elapsed=0;g.multiplier=round===5?2:1;
 const sessions=new Map(members.map(m=>[m.playerId,{playerId:m.playerId,connected:true}]));
 c={data:{cartRooms543:{LOCAL:g},parties462:{party:{id:'party',hostId:'p0',members:members.map(p=>({...p,cartVersion543:4,ready:true}))}}},sessions,subscribers:new Set(sessions.keys()),now:()=>now,transaction:fn=>fn(),send,broadcast(){for(const id of sockets.keys())push(id)},push:s=>{if(s)push(s.playerId)}};
 c.broadcast();return g;
}
reset();const timer=setInterval(()=>{if(paused)return;now+=25;advanceCarts543(c)},25);
const server=http.createServer(async(req,res)=>{try{
 const u=new URL(req.url,'http://localhost'),p=decodeURIComponent(u.pathname);
 if(p.startsWith('/qa/')&&req.method==='POST'){let body='';for await(const chunk of req)body+=chunk;const data=JSON.parse(body||'{}');let out={ok:true};
  if(p==='/qa/reset')out={id:reset(data).id};
  if(p==='/qa/advance'){for(let i=0;i<data.ms;i+=25){now+=25;advanceCarts543(c)}c.broadcast()}
  if(p==='/qa/state')out=liveCart543(c,current());
  if(p==='/qa/pause')paused=!!data.value;
  res.setHeader('Content-Type','application/json');res.end(JSON.stringify(out));return;
 }
 if(p==='/preview.html'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return}
 if(p==='/favicon.ico'){res.writeHead(204);res.end();return}
 // Wallet UI belongs to a different game and is never executed in this fixture.
 if(p==='/qa/unused-wallet.js'){res.setHeader('Content-Type','text/javascript');res.end("export function prepareEntry474(){throw Error('Unrelated wallet outside cart fixture')}");return}
 const path=p==='/qa/font.ttf'?resolve(runtime,'NotoSansJP.ttf'):resolve(root,p.slice(1));if(![root,runtime].some(base=>path.startsWith(base+'/'))){res.writeHead(403);res.end();return}
 const bytes=await readFile(path);res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.webp':'image/webp','.ttf':'font/ttf'})[extname(path)]??'application/octet-stream');res.end(bytes);
 }catch(e){res.writeHead(404);res.end(String(e))}});
const wss=new WebSocketServer({server});wss.on('connection',(socket,req)=>{const id=new URL(req.url,'http://localhost').searchParams.get('self')??'p0';sockets.set(id,socket);push(id);socket.on('message',buffer=>{const m=JSON.parse(buffer);if(m.op==='cartInput543')queueCart543(c,c.sessions.get(id),m)});socket.on('close',()=>{if(sockets.get(id)===socket)sockets.delete(id)})});
server.listen(8548,'127.0.0.1',()=>console.log('cart548 QA ready'));process.on('SIGTERM',()=>{clearInterval(timer);wss.close();server.close();process.exit()});
