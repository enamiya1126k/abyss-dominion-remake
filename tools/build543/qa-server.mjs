// Local QA only. Runs the actual coordinator; missing original catalog files use QA fixtures.
import '../build539/catalog-fixture.mjs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {RaceCoordinator451} from '../../online-server/src/RaceCoordinator451.js';
import {partyFor462,partyRace462} from '../../online-server/src/PartyCoordinator462.js';
import {liveCart543} from '../../online-server/src/CartCoordinator543.js';
import {speciesSource,heroSource,visualSource,monsterSource} from '../build539/catalog-fixture.mjs';
const mod=await import(process.env.PLAYWRIGHT_WS_MODULE),WebSocketServer=mod.WebSocketServer??mod.default?.wsServer;
const root=fileURLToPath(new URL('../../',import.meta.url)),sockets=new Map(),names=['えなみ','りおん','より','ひで'];
const fixtures={'/src/data/species.js':speciesSource,'/src/data/endgameCharacters.js':heroSource,'/src/ui/MonsterVisual.js':visualSource,'/src/models/Monster.js':monsterSource};
const roster=['slime','wolf','goblin','skeleton'].map((speciesId,i)=>({id:'m'+i,speciesId}));
let c,now=Date.now(),running=false;
const versions={cartVersion543:1,bombVersion542:1,rulesVersion:8};
const send=(id,m)=>{const s=sockets.get(id);if(s?.readyState===1)s.send(JSON.stringify(m))};
const request=(id,op,payload={})=>c.handle(c.sessions.get(id),{op,...versions,roster,displayName:names[Number(id.slice(1))],...payload});
function reset({humans=1}={}){running=false;now=Date.now();const sessions=new Map(names.map((name,i)=>['p'+i,{playerId:'p'+i,clientKey:'qa-'+i,connected:true,profile:{name}}]));c=new RaceCoordinator451({sessions,now:()=>now,send});request('p0','partyCreate462',{game:'cart'});const p=partyFor462(c,'p0');for(let i=1;i<humans;i++)request('p'+i,'partyJoin462',{code:p.code});const g=partyRace462(c,p);for(let i=0;i<humans;i++){request('p'+i,'cart543',{gameId:g.id,kind:'select',monsterId:'m'+i});const m=p.members[i];request('p'+i,'partyColor499',{partyId:p.id,seatToken485:m.seatToken485,color499:['orange','green','blue','pink'][i]})}c.broadcast();return g.id}
const current=()=>liveCart543(c,partyRace462(c,partyFor462(c,'p0')));
function advance(ms,broadcast=true){const end=now+ms;while(now<end){now+=Math.min(25,end-now);c.advanceCart543()}if(broadcast)c.broadcast()}
reset();
const server=createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost'),path=decodeURIComponent(url.pathname);if(path.startsWith('/qa/')){let body='';for await(const chunk of req)body+=chunk;const input=body?JSON.parse(body):{};let output={ok:true};
 if(path==='/qa/reset')output={id:reset(input)};
 if(path==='/qa/run')running=input.running===true;
 if(path==='/qa/advance')advance(Math.min(160000,input.ms??50));
 if(path==='/qa/state')output=current();
 if(path==='/qa/request')request(input.id??'p0',input.op,input.payload??{});
 if(path==='/qa/session'){c.sessions.get(input.id).connected=input.connected;c.broadcast()}
 if(path==='/qa/disableAI'){current().players.forEach(p=>{p.ai=false;if(!c.sessions.has(p.playerId))c.sessions.set(p.playerId,{playerId:p.playerId,clientKey:'qa-frozen',connected:true})});const party=partyFor462(c,'p0');current().players.forEach(p=>{if(!party.members.some(m=>m.playerId===p.playerId))party.members.push({playerId:p.playerId,ready:true,owned:roster,name:p.name})})}
 // Deterministic collision scene to inspect the real renderer/physics; not a gameplay shortcut.
 if(path==='/qa/scene'){const g=current();g.phase='play';g.elapsed=6000;g.roundAt=now-g.elapsed;g.lastAt=now;g.serverAt=now;g.events=[];g.stillAt=null;const poses=input.kind==='fall'?[[0,29.1,0,0],[0,27.7,0,7],[-2,24,0,0],[2,19,0,0]]:[[0,28.8,0,0],[.1,25.2,0,6],[-1.8,23,0,0],[2,17,0,2]];g.players.forEach((p,i)=>Object.assign(p,{launched:true,chargeAt:null,power:.65,x:poses[i][0],y:poses[i][1],vx:poses[i][2],vy:poses[i][3],fallenAt:null,lastHitAt:-9999}));c.broadcast()}
 res.setHeader('Content-Type','application/json');res.end(JSON.stringify(output));return}
 if(path==='/preview.html'){const styles=['build462-party','build528-party','build499-party-colors','build501-party-polish','build542-player-colors','build543-cart'];res.setHeader('Content-Type','text/html');res.end(`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">${styles.map(n=>`<link rel="stylesheet" href="/src/Styles/${n}.css">`).join('')}<link rel="stylesheet" href="/font/400.css"><link rel="stylesheet" href="/font/700.css"><style>*{box-sizing:border-box}html,body{margin:0;background:#102e27;color:#f4e6c8;font-family:'Noto Sans JP',sans-serif}button,input{font:inherit}#app{min-height:100vh}.sg-monster svg{width:100%;height:100%}.party-seats462{display:grid;grid-template-columns:1fr 1fr;gap:7px}.party-seats462>div{display:flex;align-items:center;gap:7px;border:1px solid #9b884444;padding:6px;border-radius:6px}.seat-avatar462{width:32px;height:32px;display:grid;place-items:center}.seat-avatar462 svg{width:28px;height:28px}</style><main id="app"></main><script type="module" src="/tools/build543/preview.mjs"></script></html>`);return}
 const font=path.startsWith('/font/'),base=font?process.env.QA_FONT_DIR:root,rel=font?path.slice(5):path,target=resolve(base,'.'+rel);
 try{if(!target.startsWith(resolve(base)+'/'))throw Error('path');const bytes=await readFile(target);res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'})[extname(target)]??'application/octet-stream');res.end(bytes)}catch{if(fixtures[path]){res.setHeader('Content-Type','text/javascript');res.end(fixtures[path])}else if(path==='/favicon.ico'){res.statusCode=204;res.end()}else{res.statusCode=404;res.end('Missing '+path)}}
 }catch(e){res.statusCode=500;res.end(e.stack)}});
const wss=new WebSocketServer({server,path:'/socket'});wss.on('connection',(socket,req)=>{const id=new URL(req.url,'http://localhost').searchParams.get('self');if(!c.sessions.has(id)){socket.close();return}sockets.set(id,socket);c.sessions.get(id).connected=true;c.subscribers.add(id);c.push(c.sessions.get(id));socket.on('message',bytes=>c.handle(c.sessions.get(id),JSON.parse(bytes)));socket.on('close',()=>{if(sockets.get(id)===socket){sockets.delete(id);c.sessions.get(id).connected=false}})});
const timer=setInterval(()=>{if(running)advance(50,false)},50);server.listen(8543,'127.0.0.1',()=>console.log('QA543 ready'));process.on('SIGTERM',()=>{clearInterval(timer);wss.close();server.close();process.exit(0)});
