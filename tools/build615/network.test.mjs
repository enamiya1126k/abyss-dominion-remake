import test from 'node:test';
import assert from 'node:assert/strict';
import {installRealtime615,syncPartyClock615,partyClock615,probeClock615,clockReply615,resetRealtime615,mergeRealtime615} from '../../src/party/Realtime615.js';
import {rememberSnapshot615,snapshotPair615,interpolate615} from '../../src/party/Snapshots615.js';
import {syncClock595,clock595} from '../../src/runners587/Timeline595.js';
import {predict591,remember591} from '../../src/runners587/Motion591.js';
import {makeRunners587,startRunners587,advanceRunners587,publicRunners587} from '../../src/runners587/Rules587.js';

const EPOCH=1800000000000,originalDate=Date.now,originalPerf=globalThis.performance;
let now=0,wallShift=0;
Date.now=()=>EPOCH+now+wallShift;
globalThis.performance={now:()=>now};
test.after(()=>{Date.now=originalDate;globalThis.performance=originalPerf;});
function client(id='p1') {now=0;wallShift=0;const c={transport:{selfId:id},root:{},state:{},connected:()=>true,raw:()=>true,runnersUI587:{inputs591:[]}};installRealtime615(c);return c;}
function deliveries(duration=5000,base=90,jitter=[0,60,10,130,25,80]){
 const packets=[];let previous=-1;
 for(let time=0;time<=duration;time+=50){const at=Math.max(previous+.01,time+base+jitter[packets.length%jitter.length]);packets.push({at,time});previous=at;}
 return packets;
}
test('all legacy game clocks stay monotonic under ordered WebSocket bursts and wall-clock changes',()=>{
 const c=client(),packets=deliveries();let last=null,maxStep=0,minStep=Infinity,oldLast=null,oldBacktracks=0,oldOffset=0;
 for(now=0;now<5000;now+=1000/60){while(packets[0]?.at<=now){const p=packets.shift();c.offset=EPOCH+p.time-Date.now();oldOffset=EPOCH+p.time-Date.now();}
  if(!c.realtime615.initialized)continue;if(now>2400)wallShift=900000;
  const at=Date.now()+c.offset,oldAt=Date.now()+oldOffset;
  if(last!==null){maxStep=Math.max(maxStep,at-last);minStep=Math.min(minStep,at-last);if(oldAt<oldLast)oldBacktracks++;}last=at;oldLast=oldAt;
 }
 assert(oldBacktracks>5,'fixture must reproduce legacy clock rewinds');
 assert(minStep>=16,'no frozen or reversed display time');assert(maxStep<17.3,'bounded clock slew: '+maxStep);
});
test('runners and the legacy offset adapter share exactly one clock',()=>{
 const c=client();c.state.runners={id:'run',round:1};syncClock595(c,EPOCH,0);
 for(now=16;now<1000;now+=16){syncClock595(c,EPOCH+now-20,now);assert.equal(clock595(c),Date.now()+c.offset);}
});
test('clock probes use the existing server echo; only own outstanding replies are consumed',()=>{
 const c=client(),sent=[];c.raw=(op,data)=>sent.push({op,...data});syncPartyClock615(c,EPOCH,0);
 probeClock615(c);assert.equal(sent.length,1);assert.equal(sent[0].op,'cabbageClock484');assert(sent[0].clientSent<0);
 assert.equal(clockReply615(c,{type:'cabbageClock484',selfId:'p0',clientSent:sent[0].clientSent,serverNow:EPOCH+50},100),false);
 assert.equal(clockReply615(c,{type:'cabbageClock484',selfId:'p1',clientSent:1234,serverNow:EPOCH+50},100),false);
 assert.equal(clockReply615(c,{type:'cabbageClock484',selfId:'p1',clientSent:sent[0].clientSent,serverNow:EPOCH+50},100),true);
 assert.equal(c.realtime615.pings[0].rtt,100);assert.equal(c.realtime615.target,EPOCH);
 probeClock615(c,499);assert.equal(sent.length,1);probeClock615(c,500);assert.equal(sent.length,2);
});
test('best round trip estimates do not chase congestion; reconnect clears old probes',()=>{
 const c=client();syncPartyClock615(c,EPOCH-60,0);
 for(const [sent,rtt,delay]of [[0,100,50],[500,800,500],[1000,120,60]]){
  const token=-(sent+1);c.realtime615.pending.set(token,sent);
  clockReply615(c,{type:'cabbageClock484',selfId:'p1',clientSent:token,serverNow:EPOCH+sent+delay},sent+rtt);
 }
 assert.equal(c.realtime615.target,EPOCH);resetRealtime615(c);assert.equal(c.realtime615.pings.length,0);assert.equal(c.realtime615.pending.size,0);
 syncPartyClock615(c,EPOCH+5000,500);assert.equal(partyClock615(c,516),EPOCH+5016);
});
for(const key of ['runners','walls','chairs','sushi','elevator','lava','crane','ricochet','cart','bomb','tetra','hide','fishing','sumo','tower'])test(key+' status cannot overwrite a newer live simulation',()=>{
 const latest={id:'g',round:2,serverAt:500,revision:8,phase:'play'},c={state:{[key]:latest}},receipt={id:'reward'};
 const input={[key]:{...latest,serverAt:450,phase:'countdown'},deliveries:[receipt],party:{hostId:'new-host'}};
 const result=mergeRealtime615(c,input);assert.equal(result[key],latest);assert.equal(result.deliveries[0],receipt);assert.equal(result.party.hostId,'new-host');assert.notEqual(input[key],latest);
 assert.equal(mergeRealtime615(c,{[key]:null})[key],null);assert.equal(mergeRealtime615(c,{[key]:{id:'next',serverAt:1}})[key].id,'next');
 assert.equal(mergeRealtime615(c,{[key]:{...latest,serverAt:550}})[key].serverAt,550);
});
test('snapshot interpolation tolerates bursts, duplicate status and stream restarts',()=>{
 const u={},packets=deliveries(),positions=[];let old=null,oldAt=0,legacyMax=0,lastLegacy=null;
 for(now=0;now<5000;now+=1000/60){while(packets[0]?.at<=now){const p=packets.shift(),g={id:'g',round:1,serverAt:p.time,players:[{seat:0,x:p.time*.235,y:300,alive:true,vx:235,vy:0}]};old=u.snapshots615?.frames.at(-1);rememberSnapshot615(u,g,now);oldAt=now;}
  const pair=snapshotPair615(u,now),q=interpolate615(pair,'players',0);if(!q)continue;
  positions.push(q.x+235*(pair.extra??0)/1000);
  const current=u.snapshots615.frames.at(-1),legacy=old?old.players[0].x+(current.players[0].x-old.players[0].x)*Math.min(1,(now-oldAt)/50):current.players[0].x;
  if(lastLegacy!==null)legacyMax=Math.max(legacyMax,Math.abs(legacy-lastLegacy));lastLegacy=legacy;
 }
 const deltas=positions.slice(1).map((x,i)=>x-positions[i]),max=Math.max(...deltas),min=Math.min(...deltas);
 assert(min>=-.001,'rewind '+min);assert(max<6,'burst jump '+max);assert(legacyMax>8,'legacy burst reproduced '+legacyMax);
 const latest=u.snapshots615.frames.at(-1);rememberSnapshot615(u,{...latest},now);assert(u.snapshots615.frames.length<=32);
 rememberSnapshot615(u,{id:'g',round:2,serverAt:6000,players:[]},6000);assert.equal(u.snapshots615.frames.length,1);
});
test('death, teleport, waiting and platform state are never blended across lives',()=>{
 for(const change of [{alive:false},{motionEpoch600:1},{respawnAt:2000},{waiting:true},{paused:true}]){
  const a={seat:0,x:0,y:300,alive:true,motionEpoch600:0,waiting:false,paused:false},b={...a,x:1000,...change};
  assert.equal(interpolate615({a:{players:[a]},b:{players:[b]},f:.5},'players',0),null);
 }
});
function runners(){const g=makeRunners587({id:'network615',code:'TEST',hostId:'p0',members:[{playerId:'p0',name:'Host'},{playerId:'p1',name:'Guest'}],now:EPOCH});startRunners587(g,EPOCH);advanceRunners587(g,EPOCH+25);for(let t=50;t<=3025;t+=25)advanceRunners587(g,EPOCH+t);g.enemies=[];return g;}
test('remote runner does not jump to newest then rewind when interpolation history is missing',()=>{
 const g=runners(),c=client('p1');g.serverAt=g.lastAt=EPOCH;g.players[0].motionEpoch600=0;g.players[0].vx=120;g.players[0].vy=0;g.players[0].grounded=true;
 const packets=deliveries(1500,110,[0,120,10,140,0,80]);let last=null,max=0,min=Infinity;
 syncPartyClock615(c,EPOCH,0);
 for(now=0;now<1500;now+=1000/60){while(packets[0]?.at<=now){const p=packets.shift(),frame=publicRunners587(g,'p1');frame.serverAt=EPOCH+p.time;frame.elapsed=p.time;frame.players[0].x=80+.12*p.time;c.state.runners=frame;remember591(c);}
  if(!c.state.runners)continue;const q=predict591(c,c.state.runners.players[0],EPOCH+now);
  if(last!==null){max=Math.max(max,q.x-last);min=Math.min(min,q.x-last);}last=q.x;
 }
 assert(min>=-.001,'remote rewind '+min);assert(max<7,'remote jump '+max);
});
