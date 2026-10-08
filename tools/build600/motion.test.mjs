import test from 'node:test';
import assert from 'node:assert/strict';
import {makeRunners587,startRunners587,advanceRunners587,publicRunners587} from '../../src/runners587/Rules587.js';
import {predict591,remember591} from '../../src/runners587/Motion591.js';
import {stepRunner587,control587} from '../../src/runners587/Physics587.js';
import {course589} from '../../src/runners587/Courses589.js';
const make=()=>{const g=makeRunners587({id:'motion600',code:'T',hostId:'p0',members:[{playerId:'p0',name:'You'}],now:1000});startRunners587(g,1000);for(let t=1025;t<=4025;t+=25)advanceRunners587(g,t);g.enemies=[];return g;};
test('jitter, packet acknowledgments and repeated air steering keep visible motion continuous',()=>{
 const g=make(),start=g.lastAt,initial=publicRunners587(g,'p0'),actions=[
  [0,0,true],[75,1,true],[200,-1,true],[325,1,false],[500,0,false],[775,-1,true],[850,1,true],[975,-1,false],[1150,0,false]
 ].map(([at,axis,jump],i)=>({seq:i+1,at:start+at,target:{axis,jump,attack:false}}));
 const snapshots=[],delay=[70,30,90,60,110,40];let delivered=0;
 for(let t=25;t<=1500;t+=25){const list=actions.filter(a=>a.at-start+40>t-25&&a.at-start+40<=t).map(a=>({...a,round:g.round,action:'control',at:start+t}));advanceRunners587(g,start+t,new Map([['p0',list]]));if(t%50===0){delivered=Math.max(delivered+1,t+delay[snapshots.length%delay.length]);snapshots.push({at:delivered,g:publicRunners587(g,'p0')});}}
 const c={transport:{selfId:'p0'},state:{runners:initial},runnersUI587:{inputs591:[]}};remember591(c);let nextInput=0,last=null,maxDelta=0;
 for(let t=0;t<=1500;t+=1000/60){
  while(nextInput<actions.length&&actions[nextInput].at<=start+t)c.runnersUI587.inputs591.push(actions[nextInput++]);
  while(snapshots[0]?.at<=t){c.state.runners=snapshots.shift().g;remember591(c);}
  const p=predict591(c,c.state.runners.players[0],start+t);if(last)maxDelta=Math.max(maxDelta,Math.hypot(p.x-last.x,p.y-last.y));last=p;
 }
 assert(maxDelta<18,'visible frame displacement '+maxDelta);
});
for(const id of ['sky','clock'])test(id+' new climb and descent can be crossed with ordinary jump physics',()=>{
 const g=make();g.courseId=id;g.crumbles={};const course=course589(g),r=course.route600,p=g.players[0];
 Object.assign(p,{x:r.left+10,y:300,vx:0,vy:0,axis:0,grounded:true,platformId:null,weapon:null,lastGroundAt:10000,jumpHeld:false});
 let lowest=p.y,highest=p.y;
 const targets=r.levels.map((y,i)=>({x:r.left+i*100+45,y})).slice(1);
 const exit=course.grounds.find(([a,b])=>b>r.right+30);targets.push({x:Math.max(r.right+25,exit[0]+25),y:exit[2]??300});
 let at=10000;
 for(const target of targets){
  control587(p,{axis:0,jump:false,attack:false},at);stepRunner587(p,at,at-10000,.025,g);at+=25;
  let landed=false;
  for(let i=0;i<80;i++){
   const axis=p.x<target.x-9?1:p.x>target.x+9?-1:0;
   control587(p,{axis,jump:true,attack:false},at);stepRunner587(p,at,at-10000,.025,g);at+=25;
   lowest=Math.max(lowest,p.y);highest=Math.min(highest,p.y);
   assert(p.y<460,'fell off at '+p.x.toFixed(1));
   if(p.grounded&&Math.abs(p.x-target.x)<32&&Math.abs(p.y-target.y)<2){landed=true;break;}
  }
  assert(landed,'unreachable landing '+JSON.stringify(target)+' from '+p.x+','+p.y);
 }
 assert(p.x>=r.right,'stopped at '+p.x.toFixed(1));assert(highest<-100,'never reached summit');assert(lowest>=280);
});
