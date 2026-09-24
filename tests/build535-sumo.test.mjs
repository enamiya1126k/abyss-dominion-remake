import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as R from '../src/sumo/Rules523.js';
import {queueSumo523} from '../online-server/src/SumoCoordinator523.js';
const make=()=>{const g=R.makeSumo523({id:'535',code:'QA',hostId:'p0',members:Array.from({length:4},(_,i)=>({playerId:'p'+i,name:'P'+i,choice:{speciesId:'slime'}}))});R.startSumo523(g,0,535);R.advanceSumo523(g,3000);return g};
const strike=(g,p)=>{Object.assign(p,{charging:true,charge:R.chargeCap535(p),coolUntil:0,stunUntil:0});R.release523(g,p)};
const pair=g=>{const [a,b]=g.players;Object.assign(a,{x:-.4,y:0,fx:1,fy:0});Object.assign(b,{x:.4,y:0,fx:-1,fy:0});return[a,b]};
const step=(g,ms)=>{for(const end=g.lastAt+ms;g.lastAt+R.SUMO523.step<=end+.001&&g.phase==='play';)R.advanceSumo523(g,Math.min(g.lastAt+50,end))};
test('charge survives a direct hit, continues while stunned, and releasing immediately counters',()=>{
 const g=make(),[a,b]=pair(g);b.charging=true;b.charge=630;strike(g,a);R.collide523(g);
 assert.equal(b.charging,true);assert.equal(b.charge,630);assert.ok(b.stunUntil>g.elapsed);assert.ok(b.kx>0);
 R.motion523(g,b,{},.05);assert.ok(b.charge>630);R.motion523(g,b,{release:true});assert.equal(b.attackSerial,1);assert.ok(b.attackUntil>g.elapsed);assert.equal(b.stunUntil,g.elapsed);
});
test('MAX emits once per fill, can stay held, and gaining a level increases the capacity',()=>{
 const g=make(),p=g.players[0];p.charging=true;p.charge=1399;
 for(let i=0;i<100;i++)R.motion523(g,p,{});
 assert.equal(g.events.filter(e=>e.type==='chargeFull').length,1);assert.equal(p.charge,1400);
 p.power=4;assert.ok(R.chargeRatio535(p)<1);for(let i=0;i<30;i++)R.motion523(g,p,{});
 assert.equal(p.charge,R.chargeCap535(p));assert.equal(g.events.filter(e=>e.type==='chargeFull').length,2);
});
test('all 13 levels increase capacity and force, but reach MAX within 1.6 seconds',()=>{
 let cap=0,might=0;for(let lv=1;lv<=13;lv++){const p={power:(lv-1)*4};assert.equal(R.level535(p),lv);assert.ok(R.chargeCap535(p)>cap);assert.ok(R.might535(p)>might);cap=R.chargeCap535(p);might=R.might535(p);assert.ok(cap/(1+(lv-1)*.1)<1600)}assert.ok(might>4.7);
});
test('Lv.13 full dash is over four times stronger than Lv.1 against the same opponent',()=>{
 const forces=[];for(const power of[0,48]){const g=make(),[a,b]=pair(g);g.elapsed=70000;a.power=power;strike(g,a);R.collide523(g);forces.push(b.kx)}assert.ok(forces[1]/forces[0]>4.7);
});
test('direction guide uses the same speed and duration as the authoritative dash',()=>{
 for(const power of[0,16,32,48])for(const ratio of[.3,.7,1]){const g=make(),p=g.players[0];Object.assign(p,{power,charging:true,charge:R.chargeCap535({power})*ratio});const distance=R.dashDistance527(p);R.release523(g,p);assert.ok(Math.abs(distance-p.attackSpeed535*(p.attackUntil-g.elapsed)/1000)<1e-9)}
});
test('iron boots absorb one direct hit without interrupting charge; the next hit knocks back',()=>{
 const g=make(),[a,b]=pair(g);Object.assign(b,{anchor535:1,charging:true,charge:700});strike(g,a);R.collide523(g);
 assert.equal(b.anchor535,0);assert.equal(b.blocks535,1);assert.equal(b.kx,0);assert.equal(b.stunUntil,0);assert.equal(b.charge,700);
 pair(g);strike(g,a);R.collide523(g);assert.ok(b.kx>0);assert.equal(b.blocks535,1);assert.ok(b.charging);
});
test('boots do not turn into timed invulnerability against two separate simultaneous attacks',()=>{
 const g=make(),[a,b,c]=g.players;Object.assign(a,{x:-.7,y:0,fx:1,fy:0});Object.assign(b,{x:0,y:0,anchor535:1});Object.assign(c,{x:0,y:-.7,fx:0,fy:1});strike(g,a);strike(g,c);R.collide523(g);assert.equal(b.blocks535,1);assert.equal(b.anchor535,0);assert.ok(b.stunUntil>0);assert.ok(Math.hypot(b.kx,b.ky)>0);
});
test('blocking a dash on the lip keeps the defender planted and stops repeated body shoves',()=>{
 const g=make(),[a,b]=g.players;Object.assign(a,{x:8.2,y:0,fx:1,fy:0});Object.assign(b,{x:9.08,y:0,anchor535:1});strike(g,a);R.collide523(g);assert.equal(b.x,9.08);assert.equal(a.attackUntil,g.elapsed);step(g,300);assert.ok(b.alive);assert.equal(b.braceUsed,false);assert.equal(b.blocks535,1);
});
test('boots cannot save walking off the edge or a collapsing floor; edge rescue keeps a held charge',()=>{
 const g=make(),p=g.players[0];Object.assign(p,{x:9.2,y:0,charging:true,charge:780,lastHitAt:0});assert.ok(R.brace527(g,p));assert.equal(p.charge,780);assert.equal(p.charging,true);
 const h=make();h.elapsed=39983.3334;h.lastAt=h.startAt+h.elapsed;Object.assign(h.players[0],{x:8.4,y:0,anchor535:1});step(h,50);assert.equal(h.players[0].alive,false);assert.equal(h.players[0].anchor535,1);
 const k=make();Object.assign(k.players[0],{x:10,y:0,anchor535:1});step(k,50);assert.equal(k.players[0].alive,false);
});
test('boots pickup does not stack or consume a second item when already equipped',()=>{
 const g=make(),p=g.players[0];g.pickups=[{id:1,type:'brace',x:p.x,y:p.y,expires:99999}];step(g,50);assert.equal(p.anchor535,1);g.pickups=[{id:2,type:'brace',x:p.x,y:p.y,expires:99999}];step(g,50);assert.equal(p.anchor535,1);assert.equal(g.pickups.length,1);
});
test('magnet and boots both spawn; at most two collectible items are present',()=>{
 const g=make();g.players.forEach((p,i)=>{p.x=i%2?8:-8;p.y=0});step(g,23000);assert.equal(g.pickups.length,2);assert.deepEqual(g.pickups.map(p=>p.type).sort(),['brace','magnet']);
});
test('v2 migration keeps progress, geometry, existing edge rescue and magnet, and charge ratio',()=>{
 const g=make(),p=g.players[0];g.rules523=2;Object.assign(p,{power:32,charging:true,charge:700,magnetUntil:9000,braceUsed:true});const before={x:p.x,y:p.y,elapsed:g.elapsed,radius:g.radius};assert.ok(R.migrateSumo527(g));assert.equal(R.chargeRatio535(p),.5);assert.equal(p.braceUsed,true);assert.equal(p.magnetUntil,9000);assert.equal(p.anchor535,0);assert.equal(g.rules523,3);assert.deepEqual({x:p.x,y:p.y,elapsed:g.elapsed,radius:g.radius},before);assert.equal(R.migrateSumo527(g),false);
});
test('AI chooses the same tactic when only human/AI flags of opponents change',()=>{
 const g=make(),p=g.players[0];g.elapsed=70000;g.crystals=[];g.pickups=[];p.x=p.y=0;Object.assign(g.players[1],{x:2,y:0});const a=R.bot523(g,p);const target=p.brain535.target;delete p.brain535;g.players.slice(1).forEach(v=>v.ai=!v.ai);const b=R.bot523(g,p);assert.deepEqual(a,b);assert.equal(p.brain535.target,target);
});
test('AI leaves a collapsing band along its own sector rather than aiming at the origin',()=>{
 const g=make(),p=g.players[0];g.elapsed=39000;p.x=8;p.y=0;R.bot523(g,p);assert.equal(p.brain535.type,'retreat');assert.ok(Math.hypot(p.brain535.tx,p.brain535.ty)>4);assert.ok(Math.hypot(p.brain535.tx,p.brain535.ty)<7);
});
test('v2 clients cannot submit inputs after the rule change',()=>{
 const g=make(),c={data:{sumoRooms523:{QA:g}}};assert.equal(queueSumo523(c,{playerId:'p0'},{gameId:g.id,kind:'move',sumoVersion523:2,seq:1,x:0,y:0}),false);
});
test('new effects, results and assets have import aliases and offline coverage without replacing fishing rules',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),map=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports,assets=JSON.parse(readFileSync(new URL('../world-raid-offline535-assets.json',import.meta.url),'utf8'));
 for(const module of ['Brains535','Effects535','Stage535','Results535','Rules523','View523','Renderer523']){const path='./src/sumo/'+module+'.js';assert.ok(map[path].endsWith('3.1.214-build535'));assert.ok(assets.includes(path))}for(const name of ['items','victory'])assert.ok(assets.includes('./assets/sumo535/'+name+'.webp'));assert.ok(map['./src/fishing/Rules524.js'].endsWith('3.1.213-build534'));assert.ok(html.includes('build535-sumo.css'));
});
