// QA-only local wrapper. Real party coordinator and per-player WebSocket frames.
// Missing original base character modules are supplied by catalog-fixture, never shipped as replacements.
import './catalog-fixture.mjs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const wsModule=await import(process.env.PLAYWRIGHT_WS_MODULE??'ws');
const WebSocketServer=wsModule.WebSocketServer??wsModule.default?.wsServer;
import {RaceCoordinator451} from '../../online-server/src/RaceCoordinator451.js';
import {partyFor462,partyRace462} from '../../online-server/src/PartyCoordinator462.js';
import {liveHide536} from '../../online-server/src/HideCoordinator536.js';
import {speciesSource,heroSource,visualSource,monsterSource} from './catalog-fixture.mjs';
const game=fileURLToPath(new URL('../../',import.meta.url)),sockets=new Map(),names=['えなみ','りおん','より','ひで'];
const fixtures={'/src/data/species.js':speciesSource,'/src/data/endgameCharacters.js':heroSource,'/src/ui/MonsterVisual.js':visualSource,'/src/models/Monster.js':monsterSource};
const roster=['slime','wolf','goblin','skeleton'].map((speciesId,i)=>({id:'m'+i,speciesId}));
let c,now=Date.now(),running=false;
const send=(id,m)=>{const socket=sockets.get(id);if(socket?.readyState===1)socket.send(JSON.stringify(m))};
const request=(id,op,extra={})=>c.handle(c.sessions.get(id),{op,rulesVersion:8,hideVersion536:1,roster,displayName:names[Number(id.slice(1))],...extra});
function reset({humans=1,role='hunter'}={}){running=false;now=Date.now();const sessions=new Map(Array.from({length:4},(_,i)=>['p'+i,{playerId:'p'+i,clientKey:'local-qa-'+i,connected:true,profile:{name:names[i]}}]));c=new RaceCoordinator451({sessions,now:()=>now,send});request('p0','partyCreate462',{game:'hide'});const p=partyFor462(c,'p0');for(let i=1;i<humans;i++)request('p'+i,'partyJoin462',{code:p.code});const g=partyRace462(c,p);request('p0','hide536',{gameId:g.id,kind:'role',role});for(let i=0;i<humans;i++)request('p'+i,'hide536',{gameId:g.id,kind:'select',monsterId:'m'+i});c.broadcast();return g.id}
reset();
const current=()=>{const g=partyRace462(c,partyFor462(c,'p0'));return g?liveHide536(c,g):null};
function advance(ms){const end=now+ms;while(now<end){now+=Math.min(50,end-now);c.advanceHide536()}c.broadcast()}
const server=createServer(async(req,res)=>{const url=new URL(req.url,'http://localhost'),path=decodeURIComponent(url.pathname);
 if(path.startsWith('/qa/')){let body='';for await(const chunk of req)body+=chunk;const input=body?JSON.parse(body):{};let output={ok:true};if(path==='/qa/reset')output={id:reset(input)};if(path==='/qa/run')running=input.running===true;if(path==='/qa/advance')advance(Math.min(100000,input.ms??50));if(path==='/qa/state')output=current();if(path==='/qa/session'){const session=c.sessions.get(input.id);if(session)session.connected=input.connected;c.broadcast()}if(path==='/qa/position'){const g=current();Object.assign(g.players[input.seat],{x:input.x,y:input.y,anchor:{x:input.x,y:input.y}});c.broadcast()}if(path==='/qa/disableAI'){current().players.forEach(p=>{p.ai=false;if(!c.sessions.has(p.playerId))c.sessions.set(p.playerId,{playerId:p.playerId,clientKey:'qa-freeze',connected:true})})}res.setHeader('Content-Type','application/json');res.end(JSON.stringify(output));return}
 if(path==='/preview.html'){res.setHeader('Content-Type','text/html');res.end(`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><link rel="stylesheet" href="/src/Styles/build462-party.css"><link rel="stylesheet" href="/src/Styles/build536-hide.css"><link rel="stylesheet" href="/font/400.css"><link rel="stylesheet" href="/font/700.css"><style>*{box-sizing:border-box}html,body{margin:0;background:#081c17;color:#f4e6c8;font-family:'Noto Sans JP',sans-serif}button,input{font:inherit}button{cursor:pointer}#app{min-height:100vh}.sg-monster svg{width:100%;height:100%}.party-seats462{display:grid;grid-template-columns:1fr 1fr;gap:7px}.party-seats462>div{display:flex;align-items:center;gap:7px;border:1px solid #9b884444;padding:6px;border-radius:6px}.party-seats462>div>span:last-child{display:flex;flex-direction:column}.seat-avatar462{width:32px;height:32px;display:grid;place-items:center}.seat-avatar462 svg{width:28px;height:28px}</style><main id="app"></main><script type="module" src="/tools/build536/preview.mjs"></script></html>`);return}
 const font=process.env.QA_FONT_DIR??game+'/node_modules/@fontsource/noto-sans-jp',isFont=path.startsWith('/font/'),root=isFont?font:game,rel=isFont?path.slice(5):path;try{const target=resolve(root,'.'+rel);if(!target.startsWith(resolve(root)+'/'))throw Error();const data=await readFile(target);res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'})[extname(target)]??'application/octet-stream');res.end(data)}catch{if(fixtures[path]){res.setHeader('Content-Type','text/javascript');res.end(fixtures[path])}else if(path==='/favicon.ico'){res.statusCode=204;res.end()}else{res.statusCode=404;res.end('Missing '+path)}}
});
const wss=new WebSocketServer({server,path:'/socket'});wss.on('connection',(socket,req)=>{const id=new URL(req.url,'http://local').searchParams.get('self');if(!c.sessions.has(id)){socket.close();return}sockets.set(id,socket);c.sessions.get(id).connected=true;c.subscribers.add(id);c.push(c.sessions.get(id));socket.on('message',data=>{const m=JSON.parse(data);c.handle(c.sessions.get(id),m)});socket.on('close',()=>{if(sockets.get(id)===socket){sockets.delete(id);c.sessions.get(id).connected=false}})});
const timer=setInterval(()=>{if(running){now+=50;c.advanceHide536()}},50);server.listen(8536,'127.0.0.1',()=>console.log('Hide536 QA listening 8536'));
process.on('SIGTERM',()=>{clearInterval(timer);wss.close();server.close();process.exit(0)});
