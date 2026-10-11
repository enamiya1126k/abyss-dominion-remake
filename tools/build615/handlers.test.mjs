import test from 'node:test';import assert from 'node:assert/strict';
import {productionModule} from './vm-loader.mjs';
import * as realtime from '../../src/party/Realtime615.js';
import * as snapshots from '../../src/party/Snapshots615.js';
import * as timeline from '../../src/runners587/Timeline595.js';
import * as motion from '../../src/runners587/Motion591.js';
import * as runners from '../../src/runners587/Rules587.js';
import * as walls from '../../src/walls585/Rules585.js';
import * as mechanics from '../../src/walls585/Mechanics586.js';
const EPOCH=1800000000000,oldDate=Date.now,oldPerf=globalThis.performance;let now=0;
Date.now=()=>EPOCH+now;globalThis.performance={now:()=>now};
test.after(()=>{Date.now=oldDate;globalThis.performance=oldPerf;});
const shared={'../party/Realtime615.js':realtime,'../party/Snapshots615.js':snapshots,'../party/Arcade563.js':{clock563:c=>Date.now()+(c.offset??0),color563:()=> '#ffaa00'}};
const ru=await productionModule('src/runners587/View587.js',{...shared,'./Timeline595.js':timeline,'./Motion591.js':motion,'./Rules587.js':runners});
const wa=await productionModule('src/walls585/View585.js',{...shared,'./Rules585.js':walls});
const arc=await productionModule('src/arcade580/View580.js',shared);
const su=await productionModule('src/sushi581/View581.js',shared);
const ch=await productionModule('src/chairs583/View583.js',shared);
const controls=await productionModule('src/walls585/Controls586.js',{...shared,'./Rules585.js':walls,'./Mechanics586.js':mechanics});
const board=await productionModule('src/arcade580/Board580.js',shared,{Image:class {complete=false;}});
const {RaceClient451}=await productionModule('src/race/RaceClient451.js',{
 ...shared,'../runners587/View587.js':ru,'../walls585/View585.js':wa,'../arcade580/View580.js':arc,'../sushi581/View581.js':su,'../chairs583/View583.js':ch,
 './RacePresentation452.js':{raceDomSignature452:()=> 'fixed'},'../sugoroku/Wallet474.js':{availableCrystals474:()=>0}
});
function fixture(){
 now=0;const sent=[],transport={selfId:'p1',ws:{readyState:1},connectionReady:true,capabilities:new Set(['monsterRaceV1']),_handleMessage(){},_send(type,message){sent.push({type,...message});return true;}};
 const c=new RaceClient451({transport,save:{state:{player:{gold:0}},save(){}}});c.bank=()=>null;c.renderSignature452='fixed';c.rendered=0;c.render=()=>c.rendered++;c.roster=()=>[];
 return{c,sent};
}
function state(key,time){return{type:'raceState451',selfId:'p1',serverNow:EPOCH+time,available:true,rulesVersion:20,[key]:{id:'g',game:key,rules587:23,round:1,serverAt:EPOCH+time,phase:'play',stage:'run',players:[{playerId:'p1',seat:0,x:100,y:300,alive:true,auto:false,lastSeq:0}],events:[]}};}
for(const [key,type]of [['runners','runnersFrame587'],['walls','wallsFrame585'],['sushi','sushiFrame581'],['chairs','chairsFrame583'],['elevator','arcadeFrame580'],['lava','arcadeFrame580']])test(key+' production dispatch uses the shared clock, rejects foreign frames and preserves live status',()=>{
 const {c}=fixture();c.receive(state(key,0));const old=c.state[key];
 now=100;c.transport._handleMessage({type,selfId:'p1',serverNow:EPOCH+50,[key]:{...old,serverAt:EPOCH+50}});const before=Date.now()+c.offset;
 now=117;c.transport._handleMessage({type,selfId:'p1',serverNow:EPOCH+51,[key]:{...old,serverAt:EPOCH+51}});const after=Date.now()+c.offset;
 assert(after-before>16&&after-before<18,'packet must not rewind time');
 c.transport._handleMessage({type,selfId:'stranger',serverNow:EPOCH+500,[key]:{...old,serverAt:EPOCH+500}});assert.equal(c.state[key].serverAt,EPOCH+51);
 c.receive(state(key,25));assert.equal(c.state[key].serverAt,EPOCH+51);assert.equal(c.rendered,0,'no full DOM rebuild on movement/status');
});
test('production socket dispatch consumes an own clock echo without entering cabbage UI',()=>{
 const {c,sent}=fixture();c.receive(state('runners',0));c.root={};realtime.probeClock615(c);
 assert(sent.some(m=>m.op==='cabbageClock484'));const token=sent.at(-1).clientSent;now=100;
 c.transport._handleMessage({type:'cabbageClock484',selfId:'p1',clientSent:token,serverNow:EPOCH+50});assert.equal(c.realtime615.pings.length,1);
});
test('elevator production renderer follows timestamp interpolation through an arrival burst',()=>{
 const ctx=new Proxy({},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)}),r={ctx,w:400,h:500,points:[]},u={reduced:true};
 const frame=(at,x)=>({id:'elevator',round:1,serverAt:at,game:'elevator',phase:'play',stress:0,players:[{seat:0,x,y:.79,status:'riding'}],events:[],drops:[]});
 let last=0,max=0;const frames=[frame(0,.2),frame(50,.22),frame(100,.24),frame(150,.26),frame(200,.28)];
 for(let at=0;at<=300;at+=1000/60){if(at<190){if(!u.snapshots615)snapshots.rememberSnapshot615(u,frames[0],at);}else while(frames[1]&&frames[1].serverAt<=200){snapshots.rememberSnapshot615(u,frames[1],at);frames.shift();}
  const g=u.snapshots615.frames.at(-1);board.paint580(r,g,'p1',u,at);if(last)max=Math.max(max,Math.abs(r.points[0].x-last));last=r.points[0].x;
 }
 assert(max<5,'arrival caused a jump of '+max+'px');
});
test('wall-game self movement stays continuous with 180ms delivery jitter',()=>{
 const c={transport:{selfId:'p1'},state:{},wallsUI585:{mode:'steer',vector:{x:1,y:0}}};let last=null,max=0,previousDelivery=0,next=0;const frames=[];
 for(let t=0;t<1200;t+=50){const delivery=Math.max(previousDelivery+.01,t+80+[0,90,10,100,0][next++%5]);frames.push({delivery,g:{id:'walls',round:1,stage:'run',serverAt:t,players:[{playerId:'p1',seat:0,alive:true,x:.15+t*.0003,y:.5,control:'steer',steerX:1,steerY:0,controlAt:t}]}});previousDelivery=delivery;}
 for(let at=0;at<1000;at+=1000/60){while(frames[0]?.delivery<=at)c.state.walls=frames.shift().g;if(!c.state.walls)continue;const p=controls.position586(c,c.state.walls.players[0],at);if(last)max=Math.max(max,Math.abs(p.x-last.x)*500);last=p;}
 assert(max<10,'500px board correction '+max);
});
test('Build613 server handler accepts shared clock probes without any server update',async()=>{
 const {RaceCoordinator451}=await productionModule('online-server/src/RaceCoordinator451.js');const replies=[],c=Object.create(RaceCoordinator451.prototype);
 Object.assign(c,{healthy:()=>true,account:()=>({}),now:()=>EPOCH+123,send:(id,m)=>replies.push({id,m})});
 c.handle({playerId:'p1',connected:true},{op:'cabbageClock484',rulesVersion:8,clientSent:-1});
 assert.equal(replies.length,1);assert.equal(replies[0].m.type,'cabbageClock484');assert.equal(replies[0].m.clientSent,-1);assert.equal(replies[0].m.serverNow,EPOCH+123);
});
