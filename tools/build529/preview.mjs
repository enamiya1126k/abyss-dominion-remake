// Production client, views, simulation and controls. Local transport replaces the
// socket; absent base catalog/portrait/EXP modules are explicit QA-only fixtures.
const prefix=new URL(location.href).searchParams.get('version')==='base'?'/base/':'/game/';
const load=f=>import(prefix+f);
const{RaceClient451}=await load('src/race/RaceClient451.js');
const S=await load('src/race/RaceSimulation456.js'),{raceProfile451}=await load('src/race/RaceRules451.js'),{course459}=await load('src/race/RaceCourse459.js');
const T=await load('src/tower/Rules517.js');
let scene='race',sim,room,raw,start,playing=true,root=document.querySelector('#app');
const names=['あなた','ちょ','追い風オオカミ','骨までラッキー'],ids=['slime','goblin','wolf','skeleton'];
const members=names.map((name,i)=>({playerId:'p'+i,name,connected:true,ready:true,ai:false,choice:{id:'m'+i,speciesId:ids[i]},owned:[{id:'m'+i,speciesId:ids[i]}]}));
window.sent=[];
const transport={selfId:'p0',clientKey:'qa',ws:{readyState:1,url:'ws://localhost/race'},connectionReady:true,capabilities:new Set(['monsterRaceV1']),_handleMessage(){},startBackground(){},_send(type,m){window.sent.push({type,m});if(m.op==='boost'&&scene==='race'){try{S.boost456(sim,4,m.seq);sync()}catch{}}if(m.op==='towerInput517'&&raw?.phase==='play'){const p=raw.players.find(p=>p.playerId==='p0');if(m.kind==='move'){T.predictRunner517(raw,p,m,1/60);sync()}}return true}};
const save={state:{player:{gold:10000,crystals:0},settings:{audioEnabled:false},monsters:members.map(m=>({...m.choice,affection:1000}))},save:()=>true};
const c=window.c=new RaceClient451({transport,save});
function state(){return{type:'raceState451',selfId:'p0',available:true,rulesVersion:19,minigamesVersion528:1,towerVersion517:5,serverNow:Date.now(),room:scene==='race'?structuredClone(room):null,tower:scene==='tower'?T.publicTower517(raw):null,party:null,deliveries:[],decisions:[],crystalDeliveries474:[],entryDecisions474:[],history459:[],fatigue455:{}}}
function sync(){if(scene==='race'){room.live456=S.publicSimulation456(sim);room.finishMs=sim.order.length===8?sim.runners.map(p=>p.finishMs):null}transport._handleMessage(state())}
window.showRace=(distance=1600)=>{scene='race';start=Date.now()-6000;const track=course459(distance);const racers=Array.from({length:8},(_,i)=>({speciesId:ids[i%4],name:i<4?['森のスライム','影のゴブリン','白銀のオオカミ','骨の騎士'][i]:names[i-4],ownerId:i>=4?'p'+(i-4):null,monsterId:'m'+i,profile:raceProfile451(ids[i%4]),condition:2,rulesVersion:8,track459:track,bond459:1000}));room={id:'qa-race-'+distance,code:'QA529',phase:'race',rulesVersion:8,hostId:'p0',startAt:start,phaseAt:start,track459:track,course:'芝',members,system:racers.slice(0,4),racers};sim=S.createSimulation456(racers,'芝',529);S.advanceSimulation456(sim,racers,6000,[0,1,2,3]);sync();if(!c.root)c.mount(root);c.camera461='follow';c.render();return true};
window.showTower=()=>{scene='tower';raw=T.makeTower517({id:'qa-tower',code:'QAT529',hostId:'p0',members});raw.roleMode='p3';T.startTower517(raw,Date.now()-T.TOWER517.countdown,529);T.advanceTower517(raw,Date.now());raw.autoAt=1e8;for(let x=0;x<10;x++)for(let y=0;y<Math.max(0,Math.floor((x-4)/2));y++)raw.board.push({x,y,type:'O'});raw.boardRevision++;raw.players[0].x=3.9;raw.players[0].y=0;raw.falling={id:1,x:4,y:.81,land:0,type:'O',cells:[[0,0]]};sync();return true};
window.squash=()=>{T.advanceFalling529(raw,1/60);sync();return raw.players[0]};
window.setPlaying=v=>playing=v;
window.setElapsed=ms=>{S.advanceSimulation456(sim,room.racers,ms,[0,1,2,3]);room.startAt=Date.now()-ms;sync()};
window.setDisconnected=v=>{transport.connectionReady=!v;c.render()};
window.disposeQA=()=>{playing=false;c.dispose()};
setInterval(()=>{if(!playing||!c.root)return;if(scene==='race'){S.advanceSimulation456(sim,room.racers,Date.now()-room.startAt,[0,1,2,3]);room.live456=S.publicSimulation456(sim);if(prefix==='/game/'){transport._handleMessage({type:'raceFrame529',selfId:'p0',raceId:room.id,serverNow:Date.now(),live456:structuredClone(room.live456),finishMs:sim.order.length===8?sim.runners.map(p=>p.finishMs):null})}else sync()}},prefix==='/game/'?250:500);
window.showRace();window.qaReady=true;
