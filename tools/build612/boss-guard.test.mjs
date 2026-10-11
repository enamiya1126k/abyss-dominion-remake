import test from 'node:test';import assert from 'node:assert/strict';
import {makeRunners587,startRunners587,advanceRunners587,hurtRunners587} from '../../src/runners587/Rules587.js';
import {encounters600} from '../../src/runners587/Encounters600.js';
import {stomp599} from '../../src/runners587/Physics587.js';
import {course589} from '../../src/runners587/Courses589.js';
import {predict591,remember591} from '../../src/runners587/Motion591.js';
const emit=(g,type,d={})=>g.events.push({type,...d});
function setup(phase='warn'){const g=makeRunners587({id:'606',code:'QA',hostId:'p',members:[{playerId:'p',name:'P'}],now:0});g.courseId='stormforge';startRunners587(g,0);for(let at=25;at<=3000;at+=25)advanceRunners587(g,at);g.enemies=[];g.enemyShots600=[];const b=g.boss600,p=g.players[0];Object.assign(b,{x:b.x-200,phase,phaseAt:g.elapsed,hitUntil:0});Object.assign(p,{x:b.x-8,y:b.y-58,vy:300,vx:0,weapon:null,grounded:false,platformId:null,invincibleUntil:0,lastGroundAt:-1e9,controlAt:g.lastAt});return {g,p,b,old:{x:p.x,y:b.y-72},c:{...course589(g),firebars600:[],swarms600:[]}};}
const run=f=>encounters600(f.g,f.c,new Map([[0,f.old]]),emit,hurtRunners587,stomp599);
for(const phase of ['warn','dash','cast','counter'])test(phase+': guarded head repels without either side taking damage',()=>{const f=setup(phase),hp=f.b.hp;run(f);assert.equal(f.p.deaths,0);assert.equal(f.p.respawnAt,0);assert.equal(f.b.hp,hp);assert.equal(f.p.vy,-320);assert(f.p.vx<0);assert(f.p.reboundJump599);assert(f.g.events.some(e=>e.type==='boss-block'&&e.head606));});
test('crown cooldown also repels during rest',()=>{const f=setup('rest');f.b.crownUntil604=f.g.elapsed+1000;run(f);assert.equal(f.p.deaths,0);assert.equal(f.b.hp,f.b.maxHp);assert.equal(f.p.vy,-320);});
test('unguarded head still takes two damage and retreats',()=>{const f=setup('rest');run(f);assert.equal(f.b.hp,f.b.maxHp-2);assert.equal(f.p.deaths,0);assert.equal(f.b.phase,'counter');});
test('ordinary side contact remains dangerous',()=>{const f=setup();f.p.y=f.b.y-10;f.old.y=f.p.y;run(f);assert.equal(f.p.deaths,1);assert(f.p.respawnAt);});
test('300ms body-contact protection prevents an immediate collision after repulsion, then expires',()=>{const f=setup();run(f);f.p.y=f.old.y=f.b.y-10;f.p.vy=0;f.g.lastAt+=100;f.g.elapsed+=100;run(f);assert.equal(f.p.deaths,0);f.g.lastAt+=201;f.g.elapsed+=201;run(f);assert.equal(f.p.deaths,1);});
test('repeated guarded head contacts do not kill the player or chip boss HP',()=>{const f=setup(),hp=f.b.hp;for(let i=0;i<10;i++){f.g.lastAt+=400;f.g.elapsed+=400;f.b.phase='warn';f.b.phaseAt=f.g.elapsed;Object.assign(f.p,{x:f.b.x-8,y:f.b.y-58,vy:300});f.old.y=f.b.y-72;run(f);}assert.equal(f.p.deaths,0);assert.equal(f.b.hp,hp);});
test('prediction uses the same safe guarded-head rebound',()=>{const f=setup();f.p.y=f.b.y-70;const c={state:{runners:f.g},transport:{selfId:'p'},runnersUI587:{intent:{axis:0,jump:false,attack:false}}};remember591(c);const q=predict591(c,f.p,f.g.serverAt+25);assert.equal(q.vy,-320);assert(q.vx<0);assert.equal(f.p.vy,300);});
test('authoritative full tick repels from guarded head without a death',()=>{const f=setup();f.p.y=f.b.y-70;advanceRunners587(f.g,f.g.lastAt+25);assert.equal(f.p.deaths,0);assert.equal(f.p.vy,-320);assert.equal(f.b.hp,f.b.maxHp);});
