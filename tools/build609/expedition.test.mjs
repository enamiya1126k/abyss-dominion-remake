import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeRunners587,startRunners587,advanceRunners587,inputRunners587} from '../../src/runners587/Rules587.js';
import {course589} from '../../src/runners587/Courses589.js';
import {stepRunner587,control587} from '../../src/runners587/Physics587.js';
import {surfaces587} from '../../src/runners587/Level587.js';
import {fallLimit600} from '../../src/runners587/Terrain600.js';
import {cooperation601} from '../../src/runners587/Coop601.js';
import {ASSETS602} from '../../src/runners587/Art602.js';
function game(id){const g=makeRunners587({id:'602',code:'T',hostId:'p0',members:[{playerId:'p0',name:'You'}],now:0});g.courseId=id;startRunners587(g,0);for(let t=25;t<=3000;t+=25)advanceRunners587(g,t);g.enemies=[];return g;}
function place(g,x,y){const p=g.players[0];Object.assign(p,{x,y,vx:0,vy:0,grounded:true,platformId:surfaces587(g.elapsed,course589(g),g).find(s=>x>=s.x&&x<=s.x+s.w&&Math.abs(y-s.y)<.1)?.id,axis:0,weapon:null,boostUntil:0,jumpHeld:false,jumpBufferUntil:0,wallSide:0,wallAt:-1e9,wallLockUntil:0,lastGroundAt:g.lastAt,controlAt:g.lastAt});return p;}
function physics(g,axis,jump){g.lastAt+=25;g.elapsed+=25;const p=g.players[0];control587(p,{axis,jump,attack:false},g.lastAt);return stepRunner587(p,g.lastAt,g.elapsed,.025,g);}
for(const id of ['clock','relay','crystal'])test(id+' shaft can be climbed by alternating real wall kicks without any element',()=>{
 const g=game(id),shaft=course589(g).climbs602[0],p=place(g,shaft.left+40,shaft.bottom);let axis=1,kicks=0,cleared=false;
 for(let i=0;i<600;i++){
  let jump=p.jumpHeld;
  if(p.grounded){jump=true;axis=1;}
  else if(p.wallSide&&g.lastAt+25>=p.wallLockUntil){jump=!p.jumpHeld;if(jump)axis=-p.wallSide;}
  else if(p.y<shaft.top-8)axis=1;
  const result=physics(g,axis,jump);if(result.wallJumped)kicks++;
  assert(!result.crushed601);assert(p.y<fallLimit600(course589(g),p.x));
  if(p.x>shaft.right+42&&p.y<=shaft.top+10){cleared=true;break;}
 }
 assert(cleared,'failed to leave shaft: '+JSON.stringify({x:p.x,y:p.y,kicks}));assert(kicks>=3);assert.equal(p.weapon,null);
});
test('the clock shaft cannot be bypassed by holding right and ordinary jump',()=>{
 const g=game('clock'),s=course589(g).climbs602[0],p=place(g,s.left+40,s.bottom);let minY=p.y;
 for(let i=0;i<160;i++){physics(g,1,true);minY=Math.min(minY,p.y);}
 assert(minY>s.top+150);assert(p.x<s.right);assert.equal(p.wallJumps,0);
});
for(const id of ['relay','crystal'])test(id+' detour has a continuous solo traversal through its lower and upper rooms',()=>{
 const g=game(id),c=course589(g),room=c.secrets600[0];
 const ids=id==='relay'?['cave-floor0','cave-floor1','cave-crumble','cave-floor2','cave-ferry','cave-floor3','cave-floor4']:['cave-floor0','cave-floor1','cave-floor2','cave-floor3','cave-floor4','cave-floor5','cave-floor6','cave-floor7','cave-floor8'];
 let from=c.platforms.find(p=>p.id===id+'-602-'+ids[0]);
 for(const name of ids.slice(1)){
  const to=c.platforms.find(p=>p.id===id+'-602-'+name),p=place(g,from.x+from.w-22,from.y),target=to.x+Math.min(40,to.w/2);let reached=false;
  for(let i=0;i<110;i++){
   const axis=p.x<target-6?1:p.x>target+6?-1:0;physics(g,axis,true);
   assert(p.y<fallLimit600(c,p.x),'fell on route to '+name);
   if(p.grounded&&p.platformId===to.id){reached=true;break;}
  }
  assert(reached,'unreachable '+name+' from '+from.id);from=surfaces587(g.elapsed,c,g).find(p=>p.id===to.id);
 }
 assert(room.right-room.left>=1800);assert(room.exit-room.entrance>=1700);
 const star=c.stars601.find(s=>s.kind==='secret');assert(star.x-room.entrance>900);
 place(g,star.x,star.y+18);cooperation601(g,c,()=>{});assert(g.stars601.includes(star.id));
 // The surface route remains crossable; the new exit is capped with a one-way ledge.
 const cap=c.platforms.find(s=>s.id.endsWith('cave-exit-cap'));assert(surfaces587(0,c,g).find(s=>s.id===cap.id).oneWay);
 assert.equal(c.hints601.filter(h=>h.kind==='secret').length,1);assert(!c.gems.some(x=>/hint601|trail/.test(x.id)));
});
test('crystal exit spring reaches the actual exit through its one-way cap',()=>{
 const g=game('crystal'),c=course589(g),s=c.springs.find(s=>s.id.endsWith('escape602')),p=place(g,s.x,s.y-35);Object.assign(p,{vy:220,grounded:false,platformId:null,lastGroundAt:-1e9});let minY=p.y;
 for(let i=0;i<100;i++){physics(g,0,false);minY=Math.min(minY,p.y);}
 assert(minY<300-25,'spring stopped at '+minY);assert.equal(p.y,300);assert(p.grounded);
});
test('missing the crystal upper gallery has a lower detour, rather than an unavoidable death',()=>{
 const g=game('crystal'),c=course589(g),room=c.secrets600[0],low=c.platforms.find(p=>p.id.endsWith('cave-low-west'));
 const p=place(g,low.x+45,720);p.grounded=false;p.platformId=null;p.vy=100;
 for(let i=0;i<60&&!p.grounded;i++)physics(g,0,false);
 assert.equal(p.platformId,low.id);assert(p.y<fallLimit600(c,p.x));
 const path=['cave-low-east','cave-floor6'];let from=low;
 for(const id of path){const to=c.platforms.find(s=>s.id.endsWith(id));place(g,from.x+from.w-22,from.y);let reached=false;
  for(let i=0;i<100;i++){physics(g,p.x<to.x+36?1:0,true);if(p.grounded&&p.platformId===to.id){reached=true;break;}}
  assert(reached,id);from=to;
 }
});
test('the underground relay switch opens the skipped surface bridge, with no new mandatory count',()=>{
 const g=game('relay'),c=course589(g),s=c.switchAccess602[0];place(g,s.x,s.y);advanceRunners587(g,g.lastAt+25);
 assert(g.switches.includes(s.id));assert.equal(c.switches.length,5);assert.equal(g.switches.length,1);assert(surfaces587(g.elapsed,c,g).some(b=>b.bridge&&b.id===s.id));
});
test('clock summit checkpoint records a stable real respawn surface',()=>{
 const g=game('clock'),c=course589(g),s=c.climbs602[0],p=place(g,s.exit.x,s.exit.y);advanceRunners587(g,g.lastAt+25);assert.equal(c.checkpoints[g.teamCheckpoint].y,-80);
 const support=surfaces587(g.elapsed,c,g).find(q=>q.id===p.platformId);assert(support);assert.equal(support.y,-80);
});
test('all generated game assets are small local WebP files with recorded prompts',()=>{
 const dir=new URL('../../assets/runners602/',import.meta.url),source=JSON.parse(fs.readFileSync(new URL('SOURCES.json',dir)));let bytes=0;
 assert.equal(source.assets.length,17);
 for(const name of [...ASSETS602,'cave']){
  const data=fs.readFileSync(new URL(name+'.webp',dir)),record=source.assets.find(a=>a.id===name);bytes+=data.length;
  assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WEBP');assert.equal(record.bytes,data.length);assert(record.prompt.length>80);
  if(name!=='cave')assert(record.transparentFraction>.15);
 }
 assert(bytes<650000,'new decoded art download budget');
});
