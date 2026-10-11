import test from 'node:test';
import assert from 'node:assert/strict';
import {COURSES589,course589,readyGate589} from '../../src/runners587/Courses589.js';
import {makeRunners587,startRunners587,advanceRunners587,publicRunners587} from '../../src/runners587/Rules587.js';
import {encounters600,hitBoss600} from '../../src/runners587/Encounters600.js';
import {bossPose612,tickBoss612} from '../../src/runners587/Boss612.js';
import {surfaces587} from '../../src/runners587/Level587.js';
import {stepRunner587,control587} from '../../src/runners587/Physics587.js';
const bosses=COURSES589.filter(c=>c.boss600),noop=()=>{};
function game(id,n=id==='finale'?2:1){const g=makeRunners587({id:'qa612',members:Array.from({length:n},(_,i)=>({playerId:'p'+i,name:'P'+i})),now:0});g.courseId=id;startRunners587(g,0);for(let t=25;t<=3000;t+=25)advanceRunners587(g,t);g.enemies=[];return g;}
function place(g,x,y=300){const p=g.players[0],s=surfaces587(g.elapsed,course589(g),g).find(s=>s.x<=x&&s.x+s.w>=x&&s.y===y);Object.assign(p,{x,y,vx:0,vy:0,axis:0,grounded:!!s,platformId:s?.id??null,respawnAt:0,waiting:false,finishTime:null,invincibleUntil:0,controlAt:g.lastAt});return p;}
for(const c of bosses){
 test(c.id+': flags are inside pursuit range and camping there gets attacked',()=>{
  const g=game(c.id),b=g.boss600,cp=c.checkpoints.at(-1),p=place(g,cp.x-55);assert(b.left+28<p.x);
  let hits=0,minX=b.x;for(let t=25;t<=22000;t+=25){g.elapsed=t;encounters600(g,{...c,swarms600:[],firebars600:[]},new Map(),noop,()=>hits++,noop);minX=Math.min(minX,b.x);}
  assert(minX<cp.x,'boss never crossed the flag');assert(hits>0,'stationary player was safe');
 });
 test(c.id+': locked gate never rewinds position or kills at the right boundary',()=>{
  const g=game(c.id),p=place(g,c.goal+45);p.invincibleUntil=1e9;g.boss600.phase='sleep';
  const before=p.x;advanceRunners587(g,g.lastAt+25);assert(p.x>=before);assert.equal(p.finishTime,null);assert.equal(p.deaths,0);
  place(g,c.length-14);p.invincibleUntil=1e9;
  for(let i=0;i<100;i++){g.lastAt+=25;g.elapsed+=25;control587(p,{axis:1,jump:false,attack:false},g.lastAt);stepRunner587(p,g.lastAt,g.elapsed,.025,g);}
  assert(p.x>c.goal+700);assert(p.x<c.length);assert.equal(p.y,300);assert(p.grounded);assert.equal(p.deaths,0);
 });
 test(c.id+': arena has a continuous safe floor and reachable two-level platforms',()=>{
  assert(c.boss600.right-c.boss600.left>1300);
  const floor=c.grounds.find(([x,end,y])=>x===c.arena612.left&&end===c.length&&y===300);assert(floor);
  const steps=c.platforms.filter(p=>p.id.includes('-arena612-'));assert.equal(steps.length,4);
  for(const q of steps){
   const g=game(c.id),p=place(g,q.x+q.w/2,q.y+(q.y<180?90:300-q.y));
   // Start a normal jump from the preceding height, then resolve real one-way landing.
   Object.assign(p,{grounded:true,lastGroundAt:g.lastAt,jumpHeld:false,jumpBufferUntil:0,vy:0});let landed=false;
   for(let i=0;i<70;i++){g.lastAt+=25;g.elapsed+=25;control587(p,{axis:0,jump:i<12,attack:false},g.lastAt);stepRunner587(p,g.lastAt,g.elapsed,.025,g);if(p.platformId===q.id){landed=true;break;}}
   assert(landed,'cannot land on '+q.id);
  }
 });
}
test('all four attacks occur with warnings and recovery; warning targets stay fixed',()=>{
 const g=game('relay'),b=g.boss600,p=place(g,b.left+100),seen=new Set();let restTicks=0;
 for(let t=25;t<22000;t+=25){g.elapsed=t;const phase=b.phase;tickBoss612(g,b,[p]);if(b.phase==='warn'){seen.add(b.move612);assert(b.warn612>=750);const a={...b.aim612};p.x+=3;g.elapsed+=1;tickBoss612(g,b,[p]);assert.deepEqual(b.aim612,a);}if(phase==='rest'&&b.phase==='rest')restTicks++;}
 assert.equal(seen.size,4);assert(restTicks>80);
});
test('aimed volleys reach high platforms, rain sweeps vertically, and inactive players are ignored',()=>{
 const g=game('abyssice'),b=g.boss600,p=place(g,b.x-180,120);b.phase='rest';b.turn=0;b.phaseAt=-2000;tickBoss612(g,b,[p]);assert.equal(b.move612,'aim');g.elapsed+=b.warn612;tickBoss612(g,b,[p]);assert(g.enemyShots600.length>=3);assert(g.enemyShots600.every(s=>s.vy<0));
 g.enemyShots600=[{x:p.x,y:p.y-60,vx:0,vy:2000,r:9,until:g.elapsed+5000}];let hit=0;encounters600(g,{...course589(g),firebars600:[],swarms600:[]},new Map(),noop,()=>hit++,noop);assert.equal(hit,1);
 p.waiting=true;g.enemyShots600=[{x:p.x,y:p.y-60,vx:0,vy:2000,r:9,until:g.elapsed+5000}];encounters600(g,{...course589(g),firebars600:[],swarms600:[]},new Map(),noop,()=>hit++,noop);assert.equal(hit,1);
});
test('leap authority and prediction share the same airborne pose; landing makes two shockwaves',()=>{
 const g=game('forest'),b=g.boss600,p=place(g,b.x-280);b.phase='rest';b.turn=1;b.phaseAt=-2000;tickBoss612(g,b,[p]);assert.equal(b.move612,'leap');g.elapsed+=b.warn612;tickBoss612(g,b,[p]);const at=g.elapsed;
 for(let dt=25;dt<=975;dt+=25){const predicted=bossPose612(b,at+dt);g.elapsed=at+dt;tickBoss612(g,b,[p]);assert.equal(b.x,predicted.x);assert.equal(b.y,predicted.y);}
 g.elapsed=at+1000;tickBoss612(g,b,[p]);assert.equal(b.phase,'rest');assert.equal(b.y,300);assert.equal(g.enemyShots600.length,2);assert(g.enemyShots600[0].vx<0&&g.enemyShots600[1].vx>0);
});
test('snapshot target and jump data cannot mutate authority',()=>{
 const g=game('forest');g.boss600.aim612={x:10,y:20};g.boss600.jump612={x:30,to:40};const snap=publicRunners587(g,'p0');snap.boss600.aim612.x=999;snap.boss600.jump612.to=888;assert.equal(g.boss600.aim612.x,10);assert.equal(g.boss600.jump612.to,40);
});
test('defeated boss releases a player already beyond the gate',()=>{
 const g=game('relay'),c=course589(g),p=place(g,c.goal+160);g.switches=c.switches.map(s=>s.id);g.boss600.hp=0;p.invincibleUntil=1e9;assert(readyGate589(g));advanceRunners587(g,g.lastAt+25);assert.notEqual(p.finishTime,null);assert.equal(p.deaths,0);
});

test('an aerial combo interrupts the leap and falls back to the arena floor',()=>{
 const g=game('relay',2),b=g.boss600,p=place(g,b.x-100);Object.assign(b,{phase:'leap',y:100,phaseAt:g.elapsed-500,jump612:{x:b.x-80,to:b.x+80},hitUntil:0});
 hitBoss600(g,0,1,noop);g.elapsed+=525;hitBoss600(g,1,1,noop);assert.equal(b.phase,'stunned');
 g.elapsed+=750;tickBoss612(g,b,[p]);assert.equal(b.y,300);assert.equal(b.phase,'stunned');
 g.elapsed+=700;tickBoss612(g,b,[p]);assert.equal(b.phase,'warn');assert.equal(b.y,300);
});
