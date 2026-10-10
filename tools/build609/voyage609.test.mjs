import test from 'node:test';import assert from 'node:assert/strict';
import {course589,COURSES589,readyGate589} from '../../src/runners587/Courses589.js';
import {makeRunners587,startRunners587,advanceRunners587,publicRunners587,hurtRunners587} from '../../src/runners587/Rules587.js';
import {shipAt609,voyageStep609,resetVoyage609,aboard609} from '../../src/runners587/Voyage609.js';
import {surfaces587} from '../../src/runners587/Level587.js';
import {control587,stepRunner587} from '../../src/runners587/Physics587.js';
import {combat591} from '../../src/runners587/Combat591.js';
import {predict591,remember591} from '../../src/runners587/Motion591.js';
const c=course589('voyage'),emit=(g,type,data)=>g.events.push({id:g.events.length+1,type,at:g.lastAt,...data});
function game(n=1){const g=makeRunners587({id:'609',code:'QA',hostId:'p0',members:Array.from({length:n},(_,i)=>({playerId:'p'+i,name:'P'+i})),now:0});g.courseId='voyage';startRunners587(g,0);for(let t=25;t<=3000;t+=25)advanceRunners587(g,t);return g;}
function clock(g,t){g.elapsed=t;g.lastAt=g.startAt+t;g.serverAt=g.lastAt;}
function place(g,p,x,y,id){Object.assign(p,{x,y,grounded:true,platformId:id,vx:0,vy:0,lastGroundAt:g.lastAt,controlAt:g.lastAt,jumpHeld:false,jumpBufferUntil:0,respawnAt:0,waiting:false,invincibleUntil:0,weapon:null});}
function board(g,p){const b=shipAt609(g.elapsed,g);place(g,p,b.x+80,b.y,b.id);}
test('adds ship course immediately before the finale; original twelve retained',()=>{assert.equal(COURSES589.length,13);assert.equal(COURSES589.at(-2),c);assert.equal(COURSES589.at(-1).id,'finale');assert.equal(c.islands609.length,3);assert.equal(c.stars601.length,3);});
for(const n of [1,2,3,4])test(n+' human players can start on the same ship',()=>{const g=game(n),b=shipAt609(0,g);assert.equal(g.players.length,n);for(const p of g.players)assert(aboard609(p,b));});
test('ship is continuous and monotonic, slows for 27s and warns for 6s',()=>{const g=game();let last=40,slow=0,warn=0;for(let t=0;t<=46000;t+=25){const b=shipAt609(t,g);assert(b.x>=last);assert(b.x-last<=2.51);last=b.x;if(b.phase==='island'||b.phase==='warning')slow+=25;if(b.phase==='warning')warn+=25;}assert.equal(slow,27000);assert.equal(warn,6000);assert.equal(shipAt609(60000,g).x,2010);});
test('standing aboard is carried without input by authoritative movement',()=>{const g=game(),p=g.players[0];clock(g,4000);board(g,p);const d=p.x-shipAt609(g.elapsed,g).x;for(let i=0;i<120;i++){clock(g,g.elapsed+25);stepRunner587(p,g.lastAt,g.elapsed,.025,g);}assert(Math.abs(p.x-shipAt609(g.elapsed,g).x-d)<.001);assert.equal(p.platformId,'ark609');});
test('client prediction uses the same ship motion',()=>{const g=game(),p=g.players[0];clock(g,4000);board(g,p);const client={state:{runners:g},transport:{selfId:'p0'},runnersUI587:{intent:{axis:0,jump:false,attack:false}}};remember591(client);const q=predict591(client,p,g.serverAt+25);const copy=structuredClone(p);stepRunner587(copy,g.lastAt+25,g.elapsed+25,.025,g);assert(Math.abs(copy.x-q.x)<1);});
test('each island objective has its own actual collection/combat/break rule',()=>{
 const g=game(),p=g.players[0];place(g,p,1195,84,'voyage-island-0-summit');voyageStep609(g,c,emit,hurtRunners587);assert(g.ship609.objective);
 resetVoyage609(g,c,emit,true);assert.equal(g.ship609.leg,1);assert.deepEqual(g.ship609.completed,[0]);assert(!g.ship609.objective);
 for(const id of c.islands609[1].guards){const e=g.enemies.find(e=>e.id===id);place(g,p,e.x-26,84,'voyage-island-1-summit');p.facing=1;p.attackHeld=true;p.shotAt=0;combat591(g,emit);assert(e.defeated,id);}
 voyageStep609(g,c,emit,hurtRunners587);assert(g.ship609.objective);resetVoyage609(g,c,emit,true);
 const wall=c.walls.find(w=>w.id===c.islands609[2].seal);place(g,p,wall.x-22,84,'voyage-island-2-summit');p.facing=1;p.attackHeld=true;p.shotAt=0;combat591(g,emit);assert(g.broken.includes(wall.id));voyageStep609(g,c,emit,hurtRunners587);assert(g.ship609.objective);
});
test('riding without island completion cannot advance or unlock goal',()=>{const g=game();clock(g,45000);board(g,g.players[0]);voyageStep609(g,c,emit,hurtRunners587);assert(g.ship609.retryAt);assert(!readyGate589(g));assert.equal(g.ship609.leg,0);});
test('stranded person counts once, entire crew and vessel reset at same sector',()=>{const g=game(2);g.ship609.objective=true;clock(g,45000);board(g,g.players[0]);place(g,g.players[1],1550,228,'voyage-island-0-return');voyageStep609(g,c,emit,hurtRunners587);assert.equal(g.players[1].deaths,1);assert.equal(g.players[0].deaths,0);clock(g,45700);voyageStep609(g,c,emit,hurtRunners587);assert.equal(g.ship609.retry,1);for(const p of g.players){assert(aboard609(p,shipAt609(g.elapsed,g)));assert(!p.respawnAt);}assert(!g.ship609.objective);});
test('actual death triggers sector restart and does not double count',()=>{const g=game(2);hurtRunners587(g,g.players[0],'fall');for(let i=0;i<35;i++)advanceRunners587(g,g.lastAt+25);assert.equal(g.players[0].deaths,1);assert.equal(g.players[1].deaths,0);assert.equal(g.ship609.retry,1);assert(g.players.every(p=>!p.respawnAt));});
test('all completed earlier islands and optional stars survive later retry',()=>{const g=game();resetVoyage609(g,c,emit,true);g.stars601.push(c.stars601[0].id);g.enemies.find(e=>e.id===c.islands609[1].guards[0]).defeated=true;resetVoyage609(g,c,emit);assert.deepEqual(g.ship609.completed,[0]);assert.equal(g.ship609.leg,1);assert.equal(g.stars601.length,1);assert(!g.enemies.find(e=>e.id===c.islands609[1].guards[0]).defeated);});
test('active bow occupant creates moving rear rescue deck; leaving removes it',()=>{const g=game(2),b=shipAt609(0,g);g.players[0].x=b.x+b.w-30;voyageStep609(g,c,emit,hurtRunners587);assert(surfaces587(0,c,g).some(s=>s.id==='ark-rescue609'));g.players[0].x=b.x+50;voyageStep609(g,c,emit,hurtRunners587);assert(!surfaces587(0,c,g).some(s=>s.id==='ark-rescue609'));});
test('snapshots isolate ship state and crew pause freezes game-time ship',()=>{const g=game(2),snap=publicRunners587(g,'p0');snap.ship609.completed.push(2);assert.equal(g.ship609.completed.length,0);g.players.forEach(p=>p.paused=true);const before=shipAt609(g.elapsed,g);for(let i=0;i<80;i++)advanceRunners587(g,g.lastAt+25);assert.equal(shipAt609(g.elapsed,g).x,before.x);});
test('clearing all islands and returning to final dock opens the goal',()=>{const g=game();for(let i=0;i<3;i++){g.ship609.objective=true;clock(g,g.ship609.at+47000);board(g,g.players[0]);voyageStep609(g,c,emit,hurtRunners587);}assert.deepEqual(g.ship609.completed,[0,1,2]);assert(readyGate589(g));});
// Shared physics checks a continuous on-foot route: ship -> summit -> return -> same moving ship.
for(const leg of [0,1,2])test('island '+leg+' ordinary jumps can disembark, climb, return before departure',()=>{
 const g=game(),p=g.players[0];g.ship609.leg=leg;const a=leg*2200;clock(g,13000);board(g,p);
 const tick=(axis,jump)=>{clock(g,g.elapsed+25);control587(p,{axis,jump,attack:false},g.lastAt);stepRunner587(p,g.lastAt,g.elapsed,.025,g);};
 for(const suffix of ['landing','step','summit','return-high','return']){const id='voyage-island-'+leg+'-'+suffix,s=c.platforms.find(s=>s.id===id);tick(0,false);let landed=false;for(let i=0;i<90;i++){const aim=s.x+s.w/2;tick(p.x<aim-4?1:p.x>aim+4?-1:0,true);if(p.grounded&&p.platformId===id){landed=true;break;}}assert(landed,suffix+' '+JSON.stringify({x:p.x,y:p.y,t:g.elapsed}));}
 // Wait on return ledge until ship is arriving beneath its right side, then chase it.
 while(shipAt609(g.elapsed,g).x<a+1460)tick(0,false);
 tick(0,false);let back=false;for(let i=0;i<100;i++){const b=shipAt609(g.elapsed+25,g),aim=b.x+70;tick(p.x<aim-3?1:p.x>aim+3?-1:0,true);if(p.grounded&&p.platformId==='ark609'){back=true;break;}}
 assert(back,JSON.stringify({x:p.x,y:p.y,ship:shipAt609(g.elapsed,g)}));assert(shipAt609(g.elapsed,g).x<a+1840);
});
test('first island key and return succeed in the full server simulation with hazards enabled',()=>{
 const g=game(),p=g.players[0];clock(g,13000);board(g,p);const tick=(axis,jump)=>{control587(p,{axis,jump,attack:true},g.lastAt+25);advanceRunners587(g,g.lastAt+25);assert.equal(p.deaths,0,JSON.stringify({x:p.x,y:p.y,t:g.elapsed,cause:p.death604}));};
 for(const suffix of ['landing','step','summit','return-high','return']){const id='voyage-island-0-'+suffix,s=c.platforms.find(s=>s.id===id);tick(0,false);let landed=false;for(let i=0;i<90;i++){const aim=s.x+s.w/2;tick(p.x<aim-4?1:p.x>aim+4?-1:0,true);if(p.grounded&&p.platformId===id){landed=true;break;}}assert(landed,suffix);}
 assert(g.ship609.objective);while(shipAt609(g.elapsed,g).x<1200)tick(0,false);tick(0,false);let back=false;for(let i=0;i<100;i++){const b=shipAt609(g.elapsed+25,g),aim=b.x+65;tick(p.x<aim-3?1:p.x>aim+3?-1:0,true);if(p.grounded&&p.platformId==='ark609'){back=true;break;}}assert(back);
 // Run ahead on deck to avoid the pendulum's sweep, then sail into next section.
 while(g.ship609.leg===0&&g.elapsed<48000){const b=shipAt609(g.elapsed+25,g),aim=b.x+b.w-25;tick(p.x<aim-5?1:0,false);}assert.equal(g.ship609.leg,1);assert.deepEqual(g.ship609.completed,[0]);
});
