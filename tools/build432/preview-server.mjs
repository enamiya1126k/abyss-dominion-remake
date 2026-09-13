// Local-only UI verification server. Never imported by the game or its server.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
import {WorldRaidCoordinator432} from '../../online-server/src/WorldRaidCoordinator432.js';
import {SaveService} from '../../src/services/SaveService.js';import {createMonster} from '../../src/models/Monster.js';
import {buildOnlinePartyProfile} from '../../src/ui/screens/OnlinePartyScreen.js';
const require=createRequire(import.meta.url),{WebSocketServer}=require('../../online-server/node_modules/ws');
const root=process.cwd();const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
const gameState=new SaveService().state;gameState.monsters=Array.from({length:4},(_,i)=>{const m=createMonster('slime',{level:1000,nickname:['リオネル','えなみ','より','ひで'][i]});return m;});gameState.party=gameState.monsters.map(m=>m.id);gameState.player.maxFloor=100;gameState.onlineParty.raidMaterials=300;
const profile=buildOnlinePartyProfile(gameState),playerId='AD-PREVIEW-432',session={playerId,connected:true,profile},sessions=new Map([[playerId,session]]);let socket;
const c=new WorldRaidCoordinator432({sessions,send:(id,m)=>{if(id===playerId&&socket?.readyState===1)socket.send(JSON.stringify(m));},random:()=>.5});
c.ledger.transact(s=>{s.current.contribution={sample1:{name:'リオネル',damage:5210000,attempts:1},sample2:{name:'りおん',damage:3210000,attempts:1},sample3:{name:'より',damage:2450000,attempts:1}};return {ok:true};});
const main=fs.readFileSync('src/main.js','utf8'),body=main.slice(main.indexOf('function battleContributionBody('),main.indexOf('function openBattleContributionReport(')),catalog=main.slice(main.indexOf('const ONLINE_RAID_EXCHANGE_PRICES='),main.indexOf('function onlinePartyPersistentState('));
const index=fs.readFileSync('index.html','utf8'),head=index.slice(0,index.indexOf('</head>')+7);
const script=`import {WorldRaidClient432} from './src/worldRaid/WorldRaidClient432.js';
import {WorldRaidOfflineClient430} from './src/worldRaid/WorldRaidOfflineClient430.js';
import {WorldRaidRewardsClient429} from './src/worldRaid/WorldRaidRewardsClient429.js';
import {raidContributionSnapshot432} from './src/online/OnlineViews.js';
import {pixelIcon} from './src/ui/components/GameChrome.js';import {monsterVisual} from './src/ui/MonsterVisual.js';import {displayName} from './src/models/Monster.js';import {SPECIES} from './src/data/species.js';import {RAID_VAJRA_SPRITE} from './src/core/RaidPresentation.js';
function escapeAttribute(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');}\n${body}\n${catalog}
const data=await(await fetch('/fixture-data')).json();const state=data.gameState;let screen;let bank=null;
const ws=new WebSocket('ws://'+location.host);await new Promise(r=>ws.onopen=r);
const transport={selfId:data.playerId,profile:data.profile,connectionReady:true,ws,capabilities:new Set(['worldRaidV1','worldRaidRewardsV1','worldRaidOfflineV1']),_handleMessage:()=>{},_notifyServerAvailability:()=>{},_send:(type,payload)=>{ws.send(JSON.stringify({type,...payload}));return true;},startBackground:()=>{}};
transport.worldRaidRewards429=new WorldRaidRewardsClient429({transport,onReward:()=>({ok:true}),onUpdate:()=>screen?.render()});
transport.worldRaidOffline430=new WorldRaidOfflineClient430({transport,getBank:()=>bank,setBank:b=>{bank=structuredClone(b);return true;},onUpdate:(id,e)=>screen?.offlineUpdated(id,e),prepare:async()=>({reload:true})});
screen=new WorldRaidClient432({transport,getState:()=>state,toast:t=>{window.lastToast=t;},onBack:()=>{window.wentHome=true;},onExchange:()=>({ok:false,message:'表示確認中'}),exchangeCatalog:ONLINE_WEEKLY_RAID_REWARDS,exchangePrices:ONLINE_RAID_EXCHANGE_PRICES,contributionBody:raid=>battleContributionBody(raidContributionSnapshot432(screen.presentation.roomState,raid))});
ws.onmessage=e=>transport._handleMessage(JSON.parse(e.data),ws);window.screen432=screen;window.state432=state;screen.mount(document.querySelector('#app'));window.ready432=true;`;
const types={'.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(name==='/fixture-data'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({gameState,playerId,profile}));}
 if(name==='/finish-test'){c.ledger.transact(s=>{s.current.hp=1;s.current.circle432={id:'reincarnation',shield:0,maxShield:0,reviveUsed:true};for(const a of Object.values(s.attempts))if(a.status==='active'){a.room.raid.phase='command';a.room.raid.actions={};a.room.raid.autoPlayers=[];}return {ok:true};});c._publish();res.end('ok');return;}
 if(name==='/'){res.setHeader('Content-Type','text/html');return res.end(head+'<body><main id="app"></main><script type="module">'+script+'</script></body></html>');}
 const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;return res.end('missing');}
 res.setHeader('Content-Type',types[path.extname(file)]??'application/octet-stream');fs.createReadStream(file).pipe(res);
});
const wss=new WebSocketServer({server});wss.on('connection',ws=>{socket=ws;ws.on('message',message=>{try{c.handle(session,JSON.parse(message));}catch(e){console.error(e);}});});
server.listen(8432,'127.0.0.1',()=>console.log('Preview http://127.0.0.1:8432'));
