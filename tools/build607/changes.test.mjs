import test from 'node:test';
import assert from 'node:assert/strict';
import {makeRunners587,startRunners587,advanceRunners587,hurtRunners587,publicRunners587,inputRunners587} from '../../src/runners587/Rules587.js';
import {COURSES589,course589} from '../../src/runners587/Courses589.js';
import {stepThreats604,resolveThreats604,counterShot604,freezePlayer604,frozen604,thaw604,inWater604} from '../../src/runners587/Threats604.js';
import {combat591} from '../../src/runners587/Combat591.js';
import {control587,stepRunner587,stomp599} from '../../src/runners587/Physics587.js';
import {surfaces587,enemyAt587} from '../../src/runners587/Level587.js';
import {encounters600,hitBoss600,bossStomp600} from '../../src/runners587/Encounters600.js';
import {cooperation601,deathLabel601} from '../../src/runners587/Coop601.js';
import {starHud601} from '../../src/runners587/Scenery601.js';
import {deathPose604} from '../../src/runners587/Art604.js';
import {stepIce598,iceContact598} from '../../src/runners587/Ice598.js';
import {predict591,remember591} from '../../src/runners587/Motion591.js';
const emit=(g,type,data={})=>g.events.push({id:g.events.length+1,type,at:g.lastAt,...data});
function game(id='forest',n=1){const g=makeRunners587({id:'604',code:'T',hostId:'p0',members:Array.from({length:n},(_,i)=>({playerId:'p'+i,name:'P'+i})),now:0});g.courseId=id;startRunners587(g,0);for(let at=25;at<=3000;at+=25)advanceRunners587(g,at);return g;}
function emptyCourse(g,extra={}){g.threats604.shots=[];return {...course589(g),cannons603:[],meteors603:[],rollers600:[],...extra};}
function place(g,x=90,y=300,i=0){const p=g.players[i];Object.assign(p,{x,y,vx:0,vy:0,axis:0,weapon:null,grounded:true,platformId:surfaces587(g.elapsed,course589(g),g).find(s=>x>s.x&&x<s.x+s.w&&s.y===y)?.id??null,invincibleUntil:0,respawnAt:0,paused:false,waiting:false,jumpHeld:false,jumpBufferUntil:0,controlAt:g.lastAt,lastGroundAt:g.lastAt,frozenUntil604:0});return p;}
function tick(g,ms){for(let i=0;i<ms;i+=25)advanceRunners587(g,g.lastAt+25);}
function incoming(g,kind='cannon',more={}){const s={id:++g.threats604.next,kind,ice:['iceball','icicle'].includes(kind),x:145,y:285,vx:-300,vy:0,r:15,born:g.elapsed,until:g.elapsed+3000,...more};g.threats604.shots.push(s);return s;}

test('every damaging contact causes one visible death and a checkpoint respawn; immunity prevents repeat counting',()=>{
 const g=game(),p=place(g);assert(hurtRunners587(g,p,'cannon',140));assert.equal(p.deaths,1);assert.equal(deathLabel601(p),'死亡 1回');assert(p.respawnAt);assert(!hurtRunners587(g,p,'fall'));assert(!hurtRunners587(g,p,'lightning'));
 const pose=deathPose604(p,g.elapsed+200);assert(pose&&pose.x<p.x&&pose.y<p.y);assert.equal(deathPose604(p,g.elapsed+510),null);
 tick(g,700);assert.equal(p.respawnAt,0);assert.equal(p.x,90);assert.equal(p.deaths,1);assert(!hurtRunners587(g,p,'enemy',140));
});
test('stone shield blocks a hit without recording a death',()=>{const g=game(),p=place(g);p.weapon='stone';assert(!hurtRunners587(g,p,'axe',140));assert.equal(p.deaths,0);assert.equal(p.respawnAt,0);});
test('cannon tracks height and direction, locks aim before firing, and sends a large physical shot',()=>{
 const g=game('stormforge'),h={id:'qa-gun',x:400,y:300,dir:-1,range:650,speed:310,period:3500,warning:700,offset:0},c=emptyCourse(g,{cannons603:[h]});g.enemies=[];place(g,240,210);
 for(let t=0;t<=400;t+=25){g.elapsed=t;stepThreats604(g,c,emit);}const locked=g.threats604.cannons[h.id].angle;assert(Math.sin(locked)<-.2);
 place(g,650,290);for(let t=425;t<=725;t+=25){g.elapsed=t;stepThreats604(g,c,emit);}const s=g.threats604.shots[0];assert(s);assert.equal(g.threats604.cannons[h.id].angle,locked);assert(s.vx<0&&s.vy<0);assert.equal(s.r,15);
 for(let t=3500;t<=4225;t+=25){g.elapsed=t;stepThreats604(g,c,emit);}assert(g.threats604.shots.some(s=>s.vx>0));
});
for(const power of ['fire','wind','ice','thunder','stone','water'])for(const kind of ['cannon','icicle','iceball','axe'])test(power+' destroys '+kind+' with one swept collision',()=>{
 const g=game(),c=emptyCourse(g);g.enemies=[];place(g,75);incoming(g,kind,{x:125,y:280,vx:-500,vy:0});stepThreats604(g,c,emit);
 g.projectiles=[{owner:0,kind:power,x:86,y:280,vx:900,vy:0,hitsLeft:1,born:g.lastAt,until:g.lastAt+1000}];combat591(g,emit);resolveThreats604(g,c,emit,hurtRunners587);
 assert.equal(g.threats604.shots.length,0);assert.equal(g.players[0].deaths,0);assert(g.events.some(e=>e.type==='shot-break'));
});
test('a box absorbs fast incoming ice without breaking or freezing a player behind it',()=>{
 const g=game('abyssice'),box=course589(g).walls.find(w=>w.box);g.enemies=[];const c=emptyCourse(g);place(g,box.x+box.w+20,box.y+box.h);incoming(g,'icicle',{x:box.x-40,y:box.y+12,vx:4000,vy:0,r:11});stepThreats604(g,c,emit);resolveThreats604(g,c,emit,hurtRunners587);
 assert.equal(g.threats604.shots.length,0);assert.deepEqual(g.broken,[]);assert(!frozen604(g.players[0],g.elapsed));
});
test('player attacks cannot intercept an enemy shot through an unbroken box',()=>{
 const g=game('abyssice'),box=course589(g).walls.find(w=>w.box);g.enemies=[];const c=emptyCourse(g);incoming(g,'cannon',{x:box.x+box.w+20,y:box.y+12,vx:0});stepThreats604(g,c,emit);g.projectiles=[{owner:0,kind:'thunder',x:box.x-30,y:box.y+12,vx:4000,vy:0,until:g.lastAt+1000,hitsLeft:1}];combat591(g,emit);assert(g.broken.includes(box.id));assert.equal(g.threats604.shots[0].dead,undefined);
});
test('icicles visibly originate at their bracket and freeze enemies rather than killing them',()=>{
 const g=game('abyssice');g.enemies=[{id:'qa-enemy',x:150,min:150,max:151,y:300,speed:0}];const c=emptyCourse(g,{meteors603:[{id:'qa-drop',x:150,y:300,from:150,warning:100,fall:300,period:3000}]});place(g,90);
 g.elapsed=0;stepThreats604(g,c,emit);g.elapsed=100;stepThreats604(g,c,emit);const s=g.threats604.shots[0];assert(s.y>=179&&s.y<210);
 for(let t=125;t<500&&!g.enemies[0].ice;t+=25){g.elapsed=t;stepThreats604(g,c,emit);resolveThreats604(g,c,emit,hurtRunners587);}assert(g.enemies[0].ice);assert(!g.enemies[0].defeated);
});
test('ice freezes a player for exactly three seconds, blocks controls and self attacks, and does not count as death',()=>{
 const g=game(),p=place(g);g.enemies=[];assert(freezePlayer604(g,p,emit));p.weapon='fire';const x=p.x;
 for(let t=0;t<2975;t+=25){g.elapsed=t;control587(p,{axis:1,jump:true,attack:true},g.lastAt+t);stepRunner587(p,g.lastAt+t,g.elapsed,.025,g);combat591(g,emit);}
 assert.equal(p.x,x);assert.equal(p.y,300);assert.equal(g.projectiles.length,0);assert.equal(p.deaths,0);assert(frozen604(p,2999));assert(!frozen604(p,3000));
 control587(p,{axis:1,jump:false,attack:false},6000);stepRunner587(p,6000,3000,.025,g);assert(p.x>x);
});
test('a teammate rescues a frozen player with one attack even during friendly bump immunity',()=>{
 const g=game('forest',2);g.enemies=[];place(g,75,300,0);const p=place(g,130,300,1);freezePlayer604(g,p,emit);p.bumpSafeUntil=g.lastAt+9999;
 g.projectiles=[{owner:0,kind:'wind',x:100,y:280,vx:600,vy:0,hitsLeft:1,until:g.lastAt+1000}];combat591(g,emit);assert(!frozen604(p,g.elapsed));assert.equal(p.deaths,0);assert.equal(p.respawnAt,0);assert(p.invincibleUntil>g.lastAt);
});
test('an enemy attack shatters player ice first, without a death',()=>{const g=game(),p=place(g);freezePlayer604(g,p,emit);assert(!hurtRunners587(g,p,'axe',150));assert(!frozen604(p,g.elapsed));assert.equal(p.deaths,0);});
test('full party pause and long reconnect keep freeze and threat timers in game time',()=>{
 const g=game(),p=place(g);freezePlayer604(g,p,emit);incoming(g);p.paused=true;const elapsed=g.elapsed,shots=structuredClone(g.threats604.shots);tick(g,5000);assert.equal(g.elapsed,elapsed);assert.deepEqual(g.threats604.shots,shots);assert(frozen604(p,g.elapsed));
 p.paused=false;advanceRunners587(g,g.lastAt+20000);assert(g.elapsed<elapsed+100);assert(frozen604(p,g.elapsed));
});
for(const weapon of [null,'thunder'])test('water halves '+(weapon??'normal')+' ground speed, permits jumping and never damages',()=>{
 const g=game('coast'),c=course589(g),h=c.tides600[0],p=place(g,h.x+100);g.enemies=[];g.elapsed=4000;p.weapon=weapon;p.axis=1;p.vx=weapon?315:235;
 assert(inWater604(p,c,g.elapsed));for(let i=0;i<5;i++){control587(p,{axis:1,jump:false,attack:false},g.lastAt);stepRunner587(p,g.lastAt,g.elapsed,.025,g);}assert.equal(p.vx,(weapon?315:235)/2);
 encounters600(g,c,new Map(),emit,hurtRunners587,stomp599);assert.equal(p.deaths,0);control587(p,{axis:1,jump:true,attack:false},g.lastAt);stepRunner587(p,g.lastAt,g.elapsed,.025,g);assert(p.vy<0);
});
test('boss head can only be stomped during an opening and responds by jumping away',()=>{
 const g=game('stormforge'),b=g.boss600,p=place(g,b.x,b.y-61);g.enemies=[];p.grounded=false;p.vy=100;const old={y:b.y-70};b.phase='warn';assert(!bossStomp600(p,b,old,g.elapsed));
 b.phase='rest';b.phaseAt=g.elapsed;encounters600(g,course589(g),new Map([[0,old]]),emit,hurtRunners587,stomp599);assert.equal(b.hp,b.maxHp-2);assert.equal(b.phase,'counter');assert(!bossStomp600({...p,vy:100},b,old,g.elapsed+300));
 const bx=b.x,by=b.y;g.elapsed+=250;p.x=b.left-500;encounters600(g,course589(g),new Map(),emit,hurtRunners587,stomp599);assert(b.y<by);assert.notEqual(b.x,bx);assert.equal(b.hp,b.maxHp-2);
});
test('boss hit cooldown prevents rapid repeated head damage but alternating players still earn a combo',()=>{
 const g=game('ember',2),b=g.boss600;b.phase='rest';const hp=b.hp;assert(hitBoss600(g,0,2,emit));g.elapsed+=200;assert(!hitBoss600(g,0,2,emit));g.elapsed+=325;assert(hitBoss600(g,1,1,emit));assert.equal(b.hp,hp-5);assert.equal(b.phase,'stunned');
});
for(const c of COURSES589)test(c.id+' HUD retains the spatial slot when the third star is collected first',()=>{
 const g=game(c.id);g.stars601=[c.stars601[2].id];const html=starHud601(c,g),states=[...html.matchAll(/ru-star602 (is-\w+)/g)].map(m=>m[1]);assert.deepEqual(states,['is-empty','is-empty','is-filled']);assert(c.stars601[0].x<c.stars601[1].x&&c.stars601[1].x<c.stars601[2].x);
});
test('star trials cover six mechanisms and only two courses retain paired switches',()=>{const kinds=COURSES589.flatMap(c=>c.trials601.map(t=>t.kind604));assert.equal(new Set(kinds).size,6);assert.equal(kinds.filter(k=>k==='duet').length,2);});
for(const c of COURSES589)test(c.id+' optional trial has a working unlock condition and shares its star',()=>{
 const g=game(c.id,2),trial=c.trials601[0],mode=trial.kind604;g.elapsed=10000;
 if(mode==='duet'){trial.pads.forEach((p,i)=>place(g,p.x,p.y,i));for(let i=0;i<24;i++)cooperation601(g,c,emit);}
 if(mode==='sprint'){place(g,trial.pads[0].x,trial.pads[0].y);cooperation601(g,c,emit);assert.equal(g.coop601[trial.id].until604,10000+trial.limit604);}
 if(mode==='rings'){for(const r of trial.rings604){place(g,r.x,r.y+14);cooperation601(g,c,emit);}}
 if(mode==='targets'){for(const target of trial.targets604){g.projectiles=[{owner:0,kind:'thunder',x:target.x-18,y:target.y,vx:600,vy:0,hitsLeft:1,until:g.lastAt+1000}];combat591(g,emit);}cooperation601(g,c,emit);}
 if(mode==='combat'){for(const id of trial.guards604){const e=g.enemies.find(e=>e.id===id),q=enemyAt587(e,g.elapsed);g.projectiles=[{owner:0,kind:'thunder',x:q.x-18,y:q.y-20,vx:600,vy:0,hitsLeft:1,until:g.lastAt+1000}];combat591(g,emit);}cooperation601(g,c,emit);}
 if(mode==='ice'){const e=g.enemies.find(e=>e.id===trial.iceId604);place(g,e.ice.x-26,e.ice.y);iceContact598(g,new Map(),emit,hurtRunners587);assert(e.ice.vx>0);for(let i=0;i<16;i++){g.elapsed+=25;stepIce598(g,emit,hurtRunners587);cooperation601(g,c,emit);}}
 assert(g.coop601[trial.id].open,mode);const star=c.stars601.find(s=>s.trial===trial.id);place(g,star.x,star.y+14);cooperation601(g,c,emit);assert(g.stars601.includes(star.id));assert.equal(publicRunners587(g,'p1').stars601.includes(star.id),true);
});
test('timed trial closes after its solo limit, retries, and remains claimed after collection',()=>{
 const g=game('coast'),c=course589(g),tr=c.trials601[0];place(g,tr.pads[0].x,tr.pads[0].y);cooperation601(g,c,emit);place(g,90);g.elapsed=tr.limit604+1;cooperation601(g,c,emit);assert(!g.coop601[tr.id].open);place(g,tr.pads[0].x,tr.pads[0].y);cooperation601(g,c,emit);place(g,tr.reward.x,tr.reward.y+14);cooperation601(g,c,emit);g.elapsed+=7000;cooperation601(g,c,emit);assert(g.coop601[tr.id].open);
});
test('destroying the ice-puzzle enemy restores it for a retry',()=>{const g=game('frost'),c=course589(g),tr=c.trials601[0],e=g.enemies.find(e=>e.id===tr.iceId604);e.defeated=true;delete e.ice;cooperation601(g,c,emit);g.elapsed+=1825;cooperation601(g,c,emit);assert(!e.defeated&&e.ice);});
test('axe enemies warn for 650ms, throw an arcing shot, and stop throwing when defeated or frozen',()=>{
 const g=game('forest'),e=g.enemies.find(e=>e.axe604);assert(e);g.enemies=[e];const c=emptyCourse(g);place(g,e.x-140,e.y);g.elapsed=1000;stepThreats604(g,c,emit);assert(e.throw604);assert(!g.threats604.shots.length);g.elapsed=1625;stepThreats604(g,c,emit);assert(!g.threats604.shots.length);g.elapsed=1650;stepThreats604(g,c,emit);const s=g.threats604.shots.find(s=>s.kind==='axe');assert(s&&s.vy<0&&s.gravity===600);e.defeated=true;g.threats604.shots=[];g.elapsed=5000;stepThreats604(g,c,emit);assert.equal(g.threats604.shots.length,0);
});
test('snapshots preserve all new simulation state and do not share mutable shot arrays',()=>{
 const g=game('stormforge',2);incoming(g);freezePlayer604(g,g.players[1],emit);const snap=publicRunners587(g,'p1');assert.equal(snap.rules587,17);assert.equal(snap.players[1].frozenUntil604,3000);snap.threats604.shots[0].x=-1;assert.notEqual(g.threats604.shots[0].x,-1);
 const clone=structuredClone(g);for(let i=0;i<20;i++){advanceRunners587(g,g.lastAt+25);advanceRunners587(clone,clone.lastAt+25);}assert.deepEqual(publicRunners587(g,'p0'),publicRunners587(clone,'p0'));
});
test('client prediction honors the same freeze and water rules as authority',()=>{
 const g=game(),p=place(g);freezePlayer604(g,p,emit);const c={transport:{selfId:'p0'},state:{runners:publicRunners587(g,'p0')},runnersUI587:{inputs591:[],corrections591:new Map()}};remember591(c);const q=predict591(c,c.state.runners.players[0],g.lastAt+150);assert.equal(q.x,p.x);assert.equal(q.y,p.y);
});
