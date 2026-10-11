import test from 'node:test';import assert from 'node:assert/strict';
import {makeRunners587,startRunners587,advanceRunners587,publicRunners587} from '../../src/runners587/Rules587.js';
import {predict591,remember591} from '../../src/runners587/Motion591.js';
import {installRealtime615,syncPartyClock615} from '../../src/party/Realtime615.js';
const EPOCH=1800000000000,originalPerf=globalThis.performance;let now=0;
globalThis.performance={now:()=>now};test.after(()=>{globalThis.performance=originalPerf;});
function simulate(self,up,down,jitter){
 const g=makeRunners587({id:'two-players',code:'TEST',hostId:'p0',members:Array.from({length:self==='p3'?4:2},(_,seat)=>({playerId:'p'+seat,name:seat?'Guest '+seat:'Host'})),now:EPOCH});
 startRunners587(g,EPOCH);for(let t=25;t<=3025;t+=25)advanceRunners587(g,EPOCH+t);g.enemies=[];
 const start=g.lastAt,initial=publicRunners587(g,self),actions=[];
 const control=t=>({axis:t<450?1:t<750?-1:t<1200?1:0,jump:t>=125&&t<350||t>=850&&t<1100,attack:false});
 for(let t=0;t<=1600;t+=25){const target=control(t),prev=actions.at(-1);if(!prev||JSON.stringify(prev.target)!==JSON.stringify(target)||t-prev.time>=50)actions.push({seq:actions.length+1,time:t,at:start+t,target,round:1,action:'control'});}
 let queued=0,lastDelivery=-1;const snapshots=[],inputs=new Map([[self,[]]]);
 for(let t=25;t<=2200;t+=25){while(actions[queued]&&actions[queued].time+up<=t){const i=actions[queued++];if(!inputs.has(self))inputs.set(self,[]);inputs.get(self).push({...i,at:start+i.time+up});}
  advanceRunners587(g,start+t,inputs);
  if(t%50===0){lastDelivery=Math.max(lastDelivery+.01,t+down+jitter[snapshots.length%jitter.length]);snapshots.push({at:lastDelivery,g:publicRunners587(g,self)});}
 }
 now=0;const c={transport:{selfId:self},state:{runners:initial},runnersUI587:{inputs591:[]}};installRealtime615(c);syncPartyClock615(c,start,0);remember591(c);
 let action=0,last=null,max=0,distances=[],seenJumps=0;
 for(now=0;now<=2100;now+=1000/60){while(actions[action]?.time<=now)c.runnersUI587.inputs591.push(actions[action++]);
  while(snapshots[0]?.at<=now){c.state.runners=snapshots.shift().g;remember591(c);}
  const p=c.state.runners.players.find(p=>p.playerId===self),q=predict591(c,p,start+now);
  assert(Number.isFinite(q.x)&&Number.isFinite(q.y));assert.equal(p.respawnAt,0,'fixture must not die');
  if(last){const d=Math.hypot(q.x-last.x,q.y-last.y);max=Math.max(max,d);distances.push(d);if(last.vy>=0&&q.vy<0)seenJumps++;}last=q;
 }
 const authority=g.players.find(p=>p.playerId===self);assert(Math.hypot(last.x-authority.x,last.y-authority.y)<1,'prediction must converge after release');
 return{max,seenJumps,distances};
}
for(const [name,id,up,down,jitter]of [['host','p0',15,15,[0,5,0,10]],['guest','p1',90,90,[0,40,90,10,65,0]],['guest burst','p1',125,110,[0,90,15,100,0,50]],['four-player guest','p3',90,90,[0,40,90,10,65,0]]])test(name+' self movement with real authoritative input/physics',()=>{
 const {max,seenJumps}=simulate(id,up,down,jitter);
 console.log(name+' largest 60Hz movement: '+max.toFixed(2)+' world pixels; jumps '+seenJumps);
 assert(max<20,'visible correction '+max);assert(seenJumps>=1,'local jump must respond');
});
