// Local QA only; never loaded by the production app/server.
import '../build539/catalog-fixture.mjs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {RaceCoordinator451} from '../../online-server/src/RaceCoordinator451.js';
import {partyFor462,partyRace462} from '../../online-server/src/PartyCoordinator462.js';
import {liveTetra539} from '../../online-server/src/TetraCoordinator539.js';
import {liveHide536} from '../../online-server/src/HideCoordinator536.js';
import {liveFishing524} from '../../online-server/src/FishingCoordinator524.js';
import {nav537,free537} from '../../src/hide/Map537.js';
import {cast524} from '../../src/fishing/Rules524.js';
import {speciesSource,heroSource,visualSource,monsterSource} from '../build539/catalog-fixture.mjs';
const wsModule=await import(process.env.PLAYWRIGHT_WS_MODULE),WebSocketServer=wsModule.WebSocketServer??wsModule.default?.wsServer;
const game=fileURLToPath(new URL('../../',import.meta.url)),sockets=new Map(),names=['えなみ','りおん','より','ひで'];
const fixtures={'/src/data/species.js':speciesSource,'/src/data/endgameCharacters.js':heroSource,'/src/ui/MonsterVisual.js':visualSource,'/src/models/Monster.js':monsterSource};
const roster=['slime','wolf','goblin','skeleton'].map((speciesId,i)=>({id:'m'+i,speciesId}));
let c,now=Date.now(),running=false,gameType='tetra';
const versions={rulesVersion:8,tetraVersion539:2,hideVersion536:4,fishingFrames540:1,fishingVersion524:8,minigamesVersion528:1,luckVersion511:1,luckVersion509:1,luckVersion508:1,luckVersion507:1,gorillaVersion502:1,gorillaRules503:1,gorillaRules504:1,gorillaRules505:1};
const send=(id,m)=>{const socket=sockets.get(id);if(socket?.readyState===1)socket.send(JSON.stringify(m))};
const request=(id,op,extra={})=>c.handle(c.sessions.get(id),{op,...versions,roster,displayName:names[Number(id.slice(1))],...extra});
const operations={tetra:'tetra539',hide:'hide536',fishing:'fishing524',luck:'luck511',gorilla:'gorilla502'};
function reset({humans=1,kind='tetra'}={}){running=false;now=Date.now();gameType=kind;const sessions=new Map(Array.from({length:4},(_,i)=>['p'+i,{playerId:'p'+i,clientKey:'local-qa-'+i,connected:true,profile:{name:names[i]}}]));c=new RaceCoordinator451({sessions,now:()=>now,send});request('p0','partyCreate462',{game:kind});const p=partyFor462(c,'p0');for(let i=1;i<humans;i++)request('p'+i,'partyJoin462',{code:p.code});const g=partyRace462(c,p);for(let i=0;i<humans;i++)request('p'+i,operations[kind],{gameId:g.id,kind:'select',monsterId:'m'+i});c.broadcast();return g.id}
const current=()=>{const g=partyRace462(c,partyFor462(c,'p0'));return !g?null:g.game==='tetra'?liveTetra539(c,g):g.game==='hide'?liveHide536(c,g):g.game==='fishing'?liveFishing524(c,g):g};
function advance(ms,broadcast=true){const end=now+ms;while(now<end){now+=Math.min(50,end-now);if(gameType==='tetra')c.advanceTetra539();else if(gameType==='hide')c.advanceHide536();else if(gameType==='fishing')c.advanceFishing524();else c.advance()}if(broadcast)c.broadcast()}
reset();
const server=createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost'),path=decodeURIComponent(url.pathname);if(path.startsWith('/qa/')){let body='';for await(const chunk of req)body+=chunk;const input=body?JSON.parse(body):{};let output={ok:true};
 if(path==='/qa/reset')output={id:reset(input)};if(path==='/qa/run')running=input.running===true;if(path==='/qa/advance')advance(Math.min(250000,input.ms??50));if(path==='/qa/state')output=current();if(path==='/qa/request')request(input.id??'p0',input.op,input.payload??{});
 if(path==='/qa/place'){const g=current(),pad=g.course.pads[input.padId],p=g.players[input.seat];Object.assign(p,{x:pad.x+(input.dx??0),y:pad.y+(input.dy??0),padId:pad.id,ox:input.dx??0,oy:input.dy??0,flight:null,fallAt:null,chargeAt:null,checkpoint:input.checkpoint??p.checkpoint,landedAt:g.elapsed});c.tetraRuntime539?.get(g.id)?.inputs.delete(p.playerId);c.broadcast()}
 if(path==='/qa/time'){const g=current();now=g.startAt+input.elapsed;g.lastAt=now;g.serverAt=now;g.elapsed=input.elapsed;g.endAt=g.startAt+150000;c.broadcast()}
 if(path==='/qa/session'){const session=c.sessions.get(input.id);if(session)session.connected=input.connected;c.broadcast()}
 if(path==='/qa/disableAI'){current().players.forEach(p=>{p.ai=false;if(!c.sessions.has(p.playerId))c.sessions.set(p.playerId,{playerId:p.playerId,clientKey:'qa-freeze',connected:true})})}
 if(path==='/qa/hideSetup'){const g=current(),q=nav537(g.map).find(p=>free537(g.map,p.x+280,p.y)&&free537(g.map,p.x+100,p.y)&&free537(g.map,p.x+200,p.y));g.players[0].x=q.x;g.players[0].y=q.y;g.players[1].x=q.x+205;g.players[1].y=q.y;g.players[1].alive=true;g.players[0].route=[];g.players[0].goal=null;output={x:q.x,y:q.y,objectId:g.players[1].objectId};c.broadcast()}
 if(path==='/qa/cast'){const g=current();output={ok:cast524(g,g.players[input.seat??0],input.x??.5,input.y??.5)};c.broadcast()}
 if(path==='/qa/gear'){const g=current();g.players[0].loadout=[{id:'solar',round:1},{id:'solar',round:2},{id:'doubling',round:1},{id:'doubling',round:8}];g.players[0].suns=4;g.round=16;c.broadcast()}
 res.setHeader('Content-Type','application/json');res.end(JSON.stringify(output));return}
 if(path==='/preview.html'){const styles=['build462-party','build502-gorilla','build503-gorilla','build504-gorilla','build505-gorilla','build507-luck','build508-luck','build509-luck','build510-luck','build511-luck','build512-luck','build528-party','build524-fishing','build525-fishing','build526-fishing','build530-fishing','build531-fishing','build532-fishing','build534-fishing','build536-hide','build539-tetra'];res.setHeader('Content-Type','text/html');res.end(`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">${styles.map(n=>`<link rel="stylesheet" href="/src/Styles/${n}.css">`).join('')}<link rel="stylesheet" href="/font/400.css"><link rel="stylesheet" href="/font/700.css"><style>*{box-sizing:border-box}html,body{margin:0;background:#081c17;color:#f4e6c8;font-family:'Noto Sans JP',sans-serif}button,input{font:inherit}#app{min-height:100vh}.sg-monster svg{width:100%;height:100%}.party-seats462{display:grid;grid-template-columns:1fr 1fr;gap:7px}.party-seats462>div{display:flex;align-items:center;gap:7px;border:1px solid #9b884444;padding:6px;border-radius:6px}.seat-avatar462{width:32px;height:32px;display:grid;place-items:center}.seat-avatar462 svg{width:28px;height:28px}</style><main id="app"></main><script type="module" src="/tools/build540/preview.mjs"></script></html>`);return}
 const font=process.env.QA_FONT_DIR,isFont=path.startsWith('/font/'),base=path.startsWith('/baseline/'),root=isFont?font:base?resolve(game,'../baseline539'):game,rel=isFont?path.slice(5):base?path.slice(9):path;
 try{const target=resolve(root,'.'+rel);if(!target.startsWith(resolve(root)+'/'))throw Error();const data=await readFile(target);res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'})[extname(target)]??'application/octet-stream');res.end(data)}catch{if(fixtures[path]){res.setHeader('Content-Type','text/javascript');res.end(fixtures[path])}else if(path==='/favicon.ico'){res.statusCode=204;res.end()}else{res.statusCode=404;res.end('Missing '+path)}}}catch(e){res.statusCode=500;res.end(e.stack)}});
const wss=new WebSocketServer({server,path:'/socket'});wss.on('connection',(socket,req)=>{const id=new URL(req.url,'http://local').searchParams.get('self');if(!c.sessions.has(id)){socket.close();return}sockets.set(id,socket);c.sessions.get(id).connected=true;c.subscribers.add(id);c.push(c.sessions.get(id));socket.on('message',data=>{const m=JSON.parse(data);c.handle(c.sessions.get(id),m)});socket.on('close',()=>{if(sockets.get(id)===socket){sockets.delete(id);c.sessions.get(id).connected=false}})});
const timer=setInterval(()=>{if(running)advance(50,false)},50);server.listen(8540,'127.0.0.1',()=>console.log('QA540 ready'));process.on('SIGTERM',()=>{clearInterval(timer);wss.close();server.close();process.exit(0)});
