import test from 'node:test';
import assert from 'node:assert/strict';
import {makeRunners587,startRunners587,advanceRunners587,inputRunners587,hurtRunners587,publicRunners587} from '../../src/runners587/Rules587.js';
import {COURSES589,course589,readyGate589} from '../../src/runners587/Courses589.js';
import {stepRunner587,control587} from '../../src/runners587/Physics587.js';
import {surfaces587} from '../../src/runners587/Level587.js';
import {crusherSurface601} from '../../src/runners587/Gimmicks597.js';
import {cooperation601,buddyContact601,bounceBuddy601,deathLabel601} from '../../src/runners587/Coop601.js';
import {hitBoss600,encounters600} from '../../src/runners587/Encounters600.js';
import {starHud601} from '../../src/runners587/Scenery601.js';
const emit=(g,type,data={})=>g.events.push({type,at:g.lastAt,...data});
function game(id='forest',n=1){const g=makeRunners587({id:'601',code:'TEST',hostId:'p0',members:Array.from({length:n},(_,i)=>({playerId:'p'+i,name:'P'+i})),now:1000});g.courseId=id;startRunners587(g,1000,601);for(let at=1025;at<=4000;at+=25)advanceRunners587(g,at);g.enemies=[];return g;}
function place(g,p,x,y){Object.assign(p,{x,y,vx:0,vy:0,grounded:true,axis:0,jumpHeld:false,jumpBufferUntil:0,lastGroundAt:g.lastAt,controlAt:g.lastAt,platformId:surfaces587(g.elapsed,course589(g),g).find(s=>x>=s.x&&x<=s.x+s.w&&Math.abs(s.y-y)<.01)?.id});}
function tick(g,ms,targets=[]){for(let i=0;i<ms;i+=25){for(const [seat,target]of targets)inputRunners587(g,g.players[seat],{seq:g.players[seat].lastSeq+1,action:'control',target});advanceRunners587(g,g.lastAt+25);}}
function phase(g,elapsed){g.elapsed=elapsed;g.startAt=g.lastAt-elapsed;}
for(const id of ['forest','clock','ember'])test(id+' moving press carries a player safely on top for a full cycle',()=>{
 const g=game(id),h=course589(g).crushers[0],q=crusherSurface601(h,0),p=g.players[0];place(g,p,q.x+q.w/2,q.y);
 for(let i=0;i<240;i++){tick(g,25);const surface=crusherSurface601(h,g.elapsed);assert.equal(p.deaths,0);assert.equal(p.respawnAt,0);assert.equal(p.platformId,surface.id);assert(Math.abs(p.y-surface.y)<.001);}
});
test('closed press side is a harmless wall and supports a real wall kick',()=>{
 const g=game(),h=course589(g).crushers[0],p=g.players[0];phase(g,3350);place(g,p,h.x-12,300);
 tick(g,200,[[0,{axis:1,jump:false,attack:false}]]);assert.equal(p.deaths,0);assert(p.x<=h.x-11);
 tick(g,75,[[0,{axis:1,jump:true,attack:false}]]);tick(g,25,[[0,{axis:1,jump:false,attack:false}]]);tick(g,25,[[0,{axis:1,jump:true,attack:false}]]);
 assert(p.wallJumps>0);assert(p.vx<0);assert(p.vy<0);assert.equal(p.deaths,0);
});
test('jumping into the underside of a moving press bumps the head, without a death',()=>{
 const g=game(),h=course589(g).crushers[0],p=g.players[0];phase(g,1800);place(g,p,h.x+80,300);
 tick(g,250,[[0,{axis:0,jump:true,attack:false}]]);assert.equal(p.deaths,0);assert.equal(p.respawnAt,0);assert(p.y>=crusherSurface601(h,g.elapsed).y+145+28-.1);
});
test('a genuinely closing press against a floor respawns once, ignoring invincibility',()=>{
 const g=game(),h=course589(g).crushers[0],p=g.players[0];phase(g,2500);place(g,p,h.x+80,300);p.invincibleUntil=1e9;p.weapon='stone';
 tick(g,450);assert.equal(p.fatalDeaths601,1);assert.equal(p.deaths,1);assert(p.respawnAt>g.lastAt);tick(g,725);assert.equal(p.respawnAt,0);assert.equal(p.fatalDeaths601,1);
});
test('standing in the recess is safe while the press closes and reopens',()=>{
 const g=game(),h=course589(g).crushers[0],p=g.players[0];place(g,p,h.pitX+h.pitW/2,h.pitY);tick(g,6500);assert.equal(p.deaths,0);assert.equal(p.y,h.pitY);
});
for(const c of COURSES589)test(c.id+' has three optional stars; both seal pads can be stood on and open for two players',()=>{
 const g=game(c.id,2),t=c.trials601[0];g.boss600=null;
 assert.equal(c.stars601.length,3);assert.equal(new Set(c.stars601.map(s=>s.id)).size,3);
 for(const [i,pad]of t.pads.entries())place(g,g.players[i],pad.x,pad.y);
 tick(g,625);assert(g.coop601[t.id].open,JSON.stringify(g.players.map(p=>({x:p.x,y:p.y,grounded:p.grounded}))));
 assert.equal(g.players[0].deaths+g.players[1].deaths,0);
 assert(surfaces587(g.elapsed,c,g).some(p=>p.trial601===t.id));
 const s=c.stars601.find(s=>s.trial);place(g,g.players[0],s.x,s.y+14);cooperation601(g,c,emit);
 assert.deepEqual(g.stars601,[s.id]);const snap=publicRunners587(g,'p1');assert.deepEqual(snap.stars601,g.stars601);assert(snap.coop601[t.id].open);
 place(g,g.players[1],s.x,s.y+14);cooperation601(g,c,emit);assert.equal(g.stars601.length,1);
 hurtRunners587(g,g.players[0],'fall');tick(g,725);assert.deepEqual(g.stars601,[s.id]);assert(g.coop601[t.id].open);
 g.switches=c.switches.map(s=>s.id);if(c.boss600)g.boss600={...c.boss600,hp:0};g.stars601=[];assert(readyGate589(g),'stars must never gate the main goal');
});
test('a single player cannot fake two simultaneous seal occupants or collect the locked star',()=>{
 const g=game('relay'),c=course589(g),t=c.trials601[0],p=g.players[0];
 for(let i=0;i<60;i++){const pad=t.pads[i%2];place(g,p,pad.x,pad.y);cooperation601(g,c,emit);}
 assert(!g.coop601[t.id].open);const s=c.stars601.find(s=>s.trial);place(g,p,s.x,s.y+14);cooperation601(g,c,emit);assert(!g.stars601.includes(s.id));
});
test('a reached flag updates every teammate including a waiting player, without teleporting active friends',()=>{
 const g=game('forest',3),c=course589(g),cp=c.checkpoints[2];place(g,g.players[0],cp.x,cp.y);place(g,g.players[1],100,300);g.players[2].paused=true;
 tick(g,25);assert.equal(g.teamCheckpoint,2);assert(g.players.every(p=>p.checkpoint===2));assert.equal(g.players[1].x,100);
 hurtRunners587(g,g.players[1],'fall');tick(g,725);assert.equal(g.players[1].x,cp.x);assert.equal(g.players[1].y,cp.y);assert.equal(g.players[1].fatalDeaths601,1);
});
test('death counter distinguishes fatal falls and crushing from contact misses',()=>{
 const g=game(),p=g.players[0];hurtRunners587(g,p,'enemy',200);assert.equal(deathLabel601(p),'死亡 0回');hurtRunners587(g,p,'fall');assert.equal(deathLabel601(p),'死亡 1回');tick(g,725);hurtRunners587(g,p,'crush');assert.equal(deathLabel601(p),'死亡 2回');assert.equal(p.deaths,3);
});
test('buddy boost crosses an aerial gap ordinary jumping cannot, and grants a fresh jump',()=>{
 const g=game('sky',2),c=course589(g),launch=c.platforms.find(s=>s.id.endsWith('601-launch')),landing=c.platforms.find(s=>s.id.endsWith('601-treasure')),r=g.players[0],base=g.players[1];
 function flight(boost){place(g,r,launch.x+launch.w-14,launch.y);r.grounded=false;r.platformId=null;r.vx=235;r.vy=-470;r.lastGroundAt=-1e9;r.jumpHeld=true;let crossed=false;
  if(boost){place(g,base,r.x,launch.y);r.y=base.y-27;const before={x:r.x,y:r.y-5,grounded:false};assert(buddyContact601(r,before,base,{...base},g.lastAt));bounceBuddy601(r,base,g.lastAt);assert(r.reboundJump599);}
  for(let i=1;i<=80;i++){control587(r,{axis:1,jump:true,attack:false},g.lastAt+i*25);stepRunner587(r,g.lastAt+i*25,g.elapsed+i*25,.025,g);if(r.grounded){crossed=r.platformId===landing.id;break;}if(r.y>launch.y+50)break;}
  return crossed;
 }
 assert(!flight(false));assert(flight(true));
});
test('bosses keep solo recovery windows, shield the front, and reward alternating teammates',()=>{
 const solo=game('ember'),g=game('ember',2),b=g.boss600;assert(b.maxHp>solo.boss600.maxHp);b.phase='warn';b.dir=-1;b.phaseAt=g.elapsed;
 assert(!hitBoss600(g,0,1,emit,{kind:'shot',x:b.x-100}));assert.equal(b.hp,b.maxHp);
 assert(hitBoss600(g,1,1,emit,{kind:'shot',x:b.x+100}));g.elapsed+=200;b.phase='rest';
 assert(hitBoss600(g,0,1,emit,{kind:'shot',x:b.x-100}));assert.equal(b.hp,b.maxHp-4);assert.equal(b.phase,'stunned');assert(g.events.some(e=>e.type==='boss-combo'));
 solo.boss600.phase='rest';assert(hitBoss600(solo,0,2,emit,{kind:'shot',x:solo.boss600.x-100}));
});
test('steam corridors are specific to two worlds; secret rooms have a subtle masonry clue without an explicit gem trail',()=>{
 for(const c of COURSES589){const steam=c.hazards.filter(h=>h.kind!=='spikes');if(!['clock','ember'].includes(c.id))assert.equal(steam.length,0);else assert(steam.length<=3);
  for(const room of c.secrets600){assert(c.hints601.some(h=>h.kind==='secret'&&h.subtle602&&Math.abs(h.x-room.entrance)<100&&h.y>300));assert(!c.gems.some(g=>g.id.includes('hint601')||g.id.includes('-trail')));}
 }
 const g=game();assert.equal((starHud601(course589(g),g).match(/<img/g)??[]).length,3);
});
