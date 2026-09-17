import test from'node:test';
import assert from'node:assert/strict';
import{course459,coursePoint459}from'../src/race/RaceCourse459.js';
import{fitCamera460,separateRunners460}from'../src/race/RaceCamera460.js';
test('all eight portraits fit without overlap at start, corners, finish and spread out',()=>{
 for(const[width,height]of[[284,310],[357,368],[677,560],[357,440],[700,145]])for(const follow of[false,true])for(const distance of[1600,3000])for(let frame=0;frame<=100;frame++)for(const spread of[0,.003,.12]){
  const points=Array.from({length:8},(_,i)=>{const p=coursePoint459(Math.max(0,Math.min(1,frame/100-i*spread)),course459(distance)),a=(p.angle+90)*Math.PI/180,lane=(i-3.5)*1.7;return{i,x:(p.x+10+Math.cos(a)*lane)/120*width,y:(p.y+Math.sin(a)*lane)/100*height}}),camera=fitCamera460(points,width,height,follow),size=height<200?28:Math.min(46,width*.11),projected=points.map(p=>({...p,x:p.x*camera.scale+camera.x,y:p.y*camera.scale+camera.y})),placed=separateRunners460(projected,width,height,size);
  for(const p of placed){assert.ok(p.x-p.width/2>=0&&p.x+p.width/2<=width&&p.y-p.height/2>=0&&p.y+p.height/2<=height,JSON.stringify({width,height,p}));for(const q of placed)if(p.i!==q.i)assert.ok(Math.abs(p.x-q.x)>=p.width-.01||Math.abs(p.y-q.y)>=p.height-.01,JSON.stringify({width,height,follow,frame,spread,p,q}));}
  for(const p of projected)assert.ok(p.x>=0&&p.x<=width&&p.y>=0&&p.y<=height,'true track anchor remains on screen');
 }
});
test('camera layout leaves progress immutable and is deterministic',()=>{const points=Array.from({length:8},(_,i)=>({i,x:80+i,y:230+i})),copy=structuredClone(points);assert.deepEqual(separateRunners460(points,350,380),separateRunners460(points,350,380));assert.deepEqual(points,copy);assert.deepEqual(fitCamera460(points,350,380,false),{scale:1,x:0,y:0});});
