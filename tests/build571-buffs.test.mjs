import test from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../src/luck/Rules511.js';
import {ITEMS511,BIG511,item511} from '../src/luck/Items511.js';
import {count571,total571,eligible571} from '../src/luck/Buffs571.js';
import {formula571,stock571,gearEffect571} from '../src/luck/Presentation571.js';
import {diceFrame511} from '../src/luck/Presentation511.js';
import {equipmentFrame562} from '../src/luck/Equipment562.js';
import {game,gear,resolve,commit,select,bigint as B} from '../tools/build562/fixture.mjs';
const rng=seed=>n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n};

test('20 × 27 is 540: all buff categories multiply the whole base, exactly',()=>{
 const g=game({round:8,items:['rocket','echo','echo','echo']});
 g.players[0].loadout=[...gear('overdrive'),...gear('crown'),...gear('focus'),...gear('engine',2)];g.players[0].suns=3;
 const c=resolve(g).rows[0].calculation;
 assert.equal(c.baseTwice,2000);assert.equal(c.factors.overdrive,4);assert.equal(c.factors.crown,5);assert.equal(c.factors.solar,27);assert.equal(c.planned,540000);
 assert.equal(formula571(c),'1,000m × 27 × 4 × 5 ＝ 540,000m');
 assert.equal(stock571({suns:3,coils:2}),'太陽3個 → 大技×27 · コイル2個 → 大技×4');assert.equal(stock571({coils:2,loadout:gear('coil')},3),'コイル2+今回1個 → 大技×8');
});
test('diverse multipliers and half metres are multiplied before the single final floor',()=>{
 const g=game({round:8,items:['rocket','echo','echo','echo'],distance:[2500,3000,0,0]});
 Object.assign(g.players[0],{suns:2,coils:2,strikes:3,attackHits:3,wings:4,lastAdvance:3,loadout:['doubling','combo','mile','pioneer','streak','echo','turbine','overdrive','crown'].flatMap(x=>gear(x)).concat({id:'interest',round:2,entryDistance:1500})});
 const c=resolve(g).rows[0].calculation;
 const expected=B(c.baseTwice)*128n*9n*4n*8n*4n*2n*3n*2n*5n*4n*5n*3n/4n;
 assert.equal(B(c.planned),expected);assert.equal(c.baseTwice%2,1);assert.equal(c.factors.interest,2);
});
test('every dealt hand has a non-big option; early items expire and final hands still have a big',()=>{
 let seen=new Set();
 for(const rounds of [8,16])for(let seed=1;seed<=32;seed++)for(const [r,row]of L.drawPlan511(rng(seed),rounds).entries())for(const seat of row.seats)for(const hand of seat.boxes){
  assert.equal(new Set(hand).size,4);assert(hand.some(id=>!BIG511.includes(id)));if(r===rounds-1)assert(hand.some(id=>BIG511.includes(id)));
  for(const id of hand){seen.add(id);assert(eligible571(item511(id),r+1,rounds));}
 }
 assert.equal(seen.size,ITEMS511.length);
});
test('hunter counts each affected opponent, not damage or copies; blocked and zero effects do not charge',()=>{
 const g=game({items:['lightning','rocket','rocket','echo']});g.players[0].loadout=gear('hunter',2);
 let e=resolve(g);assert.equal(e.rows[0].attackHits,2);assert.equal(e.rows[0].strikes,4);
 g.players[1].loadout=gear('shield');e=resolve(g);assert.equal(e.rows[0].attackHits,1);assert.equal(e.rows[0].strikes,2);
 commit(g,e);L.advanceLuck511(g,g.nextAt);select(g,['nova','echo','echo','echo']);e=resolve(g);assert.equal(e.rows[0].calculation.factors.hunt,4);assert.equal(e.rows[0].calculation.spent.strikes,2);
 assert.equal(L.publicLuck511(g,'p0').players[0].attackHits,1);
});
test('reflected attacks credit the reflector, and salvage charges when a guard is actually used',()=>{
 const g=game({items:['shell','echo','echo','echo']});g.players[0].loadout=gear('hunter');g.players[1].loadout=['mirror','hunter','salvage'].flatMap(x=>gear(x));
 const e=resolve(g);assert.equal(e.rows[0].strikes,0);assert.equal(e.rows[1].strikes,1);assert.equal(e.rows[1].attackHits,1);assert.equal(e.rows[1].coils,1);
 g.event=e;g.phase='broadcast';g.phaseAt=0;
 const before=equipmentFrame562(g,0),impact=equipmentFrame562(g,L.LUCK511.castMs*.56),returned=equipmentFrame562(g,L.LUCK511.castMs*.8);
 assert.equal(before[1].coils,0);assert.equal(impact[1].coils,1);assert.equal(impact[1].strikes,0);assert.equal(returned[1].strikes,1);
});
test('combo starts next round and multiplies once per effective equipment copy',()=>{
 const g=game({items:['combo','echo','echo','echo']});g.players[0].attackHits=3;
 let e=resolve(g);assert.equal(e.rows[0].calculation.factors.combo,1);
 g.players[0].loadout=gear('combo',2);e=resolve(g);assert.equal(e.rows[0].calculation.factors.combo,16);
});
test('resonance doubles equipment and saved buffs, preserving age and distance records, but not attack gear/history',()=>{
 const g=game({items:['resonance','echo','echo','echo']});
 Object.assign(g.players[0],{suns:3,coils:2,strikes:2,wards:2,savings:5,wings:3,attackHits:4,loadout:[...gear('solar'),...gear('coil'),...gear('bank'),...gear('ward'),...gear('doubling'),...gear('shell'),{id:'interest',round:1,entryDistance:1500}]});
 const e=resolve(g),r=e.rows[0];
 assert.equal(count571(r.loadout,'solar'),2);assert.equal(count571(r.loadout,'shell'),1);assert.equal(r.suns,8);assert.equal(r.coils,6);assert.equal(r.savings,410);assert.equal(r.wards,6);assert.equal(r.wings,6);assert.equal(r.strikes,4);assert.equal(r.calculation.factors.interest,4);assert.equal(r.calculation.factors.growth,16);assert.equal(r.attackHits,5);
 assert.equal(r.loadout.find(x=>x.id==='interest').entryDistance,1500);
 g.event=e;g.phase='reveal';g.phaseAt=0;const shown=equipmentFrame562(g,0)[0];assert.equal(count571(shown.loadout,'solar'),2);assert.equal(shown.attackHits,4);
 assert.match(gearEffect571('solar',shown,3),/装備2個/);
});
test('weighted equipment theft transfers only requested copies and cannot activate or be stolen again now',()=>{
 const g=game({items:['wrench','echo','echo','echo']});g.players[1].loadout=[{id:'turbine',round:1,stack:8}];g.players[0].loadout=gear('wrench',2);
 const e=resolve(g);assert.equal(count571(e.rows[0].loadout,'turbine'),3);assert.equal(count571(e.rows[1].loadout,'turbine'),5);assert.equal(e.rows[0].calculation.turbines,0);
 assert.equal(e.attacks[0].targets[0].stolen[0].count,3);
 g.event=e;g.phase='broadcast';g.phaseAt=0;const ui=equipmentFrame562(g,L.LUCK511.castMs*.56);assert.equal(count571(ui[0].loadout,'turbine'),3);assert.equal(count571(ui[1].loadout,'turbine'),5);
});
test('vault preserves floor(half), floor(three quarters), floor(seven eighths) while using the full charge',()=>{
 for(const [n,left]of [[1,3],[2,5],[3,6]]){const g=game({items:['nova','echo','echo','echo']});Object.assign(g.players[0],{suns:7,coils:7,strikes:7,loadout:gear('vault',n)});const r=resolve(g).rows[0];for(const key of ['suns','coils','strikes'])assert.equal(r[key],left);assert.equal(r.calculation.factors.solar,2187);assert.equal(r.calculation.factors.hunt,128);}
});
test('phoenix restores spent charges once, preserves charges earned afterward, and combines with vault',()=>{
 const g=game({items:['nova','sniper','echo','echo']});
 Object.assign(g.players[0],{suns:7,coils:7,strikes:7,savings:13,loadout:['vault','phoenix','phoenix','bank','revenge'].flatMap(x=>gear(x))});
 const r=resolve(g).rows[0];assert(r.refunded571);assert.equal(r.gain,0);assert.equal(r.suns,7);assert.equal(r.coils,8);assert.equal(r.strikes,7);assert.equal(r.savings,213);
 const normal=game({items:['jackpot','echo','echo','echo']});normal.players[0].loadout=gear('phoenix');normal.players[0].suns=3;const miss=resolve(normal).rows[0];assert.equal(miss.refunded571,undefined);assert.equal(miss.suns,0);
});
test('uncapped magnet steals 30% of actual available leader distance; anchor halves and shields block',()=>{
 for(const defence of [null,'anchor','shield']){const g=game({items:['magnet','echo','echo','echo'],distance:[1,'100000000000000000000',0,0]});if(defence)g.players[1].loadout=gear(defence);const e=resolve(g),h=e.attacks[0].targets[0];assert.equal(B(h.amount),defence==='shield'?0n:defence==='anchor'?15000000000000000000n:30000000000000000000n);assert.equal(B(e.rows[0].gain),120n+B(h.amount));}
 const g=game({items:['magnet','echo','magnet','magnet'],distance:[1,10000,0,0]});g.players[0].loadout=gear('magnet',9);g.players[2].loadout=gear('magnet',9);g.players[3].loadout=gear('magnet',9);
 const e=resolve(g);const total=e.attacks.flatMap(a=>a.targets).reduce((n,h)=>n+B(h.amount),0n);assert(total<=10000n);assert.equal(B(e.rows[1].to),10000n-total);
});
test('early sprint and progress gear use current accumulated metres; interest stays at its installation record',()=>{
 const g=game({items:['sprint','echo','echo','echo'],distance:[2500,0,0,0]});assert.equal(resolve(g).rows[0].calculation.base,9000);
 g.players[0].loadout=[...gear('mile',2),...gear('pioneer',2),{id:'interest',round:1,entryDistance:1500}];const c=resolve(g).rows[0].calculation;assert.equal(c.factors.miles,4);assert.equal(c.factors.pioneer,9);assert.equal(c.factors.interest,2);
});
test('wings grow per uneventful round, survive later hits and start multiplying next round',()=>{
 const g=game({items:['streak','echo','echo','echo']});let r=resolve(g).rows[0];assert.equal(r.wings,1);assert.equal(r.calculation.factors.wings,1);commit(g);L.advanceLuck511(g,g.nextAt);select(g,['echo','lightning','echo','echo']);r=resolve(g).rows[0];assert.equal(r.wings,1);assert.equal(r.calculation.factors.wings,2);
});
test('dice animation keeps a physical 1..6 face while the calculation uses uncapped adjusted faces',()=>{
 const g=game({items:['triple','echo','echo','echo']});g.players[0].loadout=gear('focus',3);g.event=resolve(g);g.phase='dice';g.phaseAt=0;
 const f=diceFrame511(g,2400,true);assert.deepEqual(f.dice.map(d=>d.raw),[1,2,3]);assert.deepEqual(f.dice.map(d=>d.value),[7,8,9]);assert.match(f.formula,/7 × 8 × 9 × 100m/);assert(f.dice.every(d=>Number.isFinite(d.x)&&Number.isFinite(d.y)));
});
test('8/16 round seeded AI matches complete, persist exact results, and never expose future hands',()=>{
 for(const rounds of [8,16])for(let seed=1;seed<=10;seed++){
  let g=L.makeLuck511({id:'AI'+seed,code:'AI',hostId:'p0',members:[{playerId:'p0',name:'QA',choice:{id:'m0',speciesId:'slime'}}]});g.rounds=rounds;L.startLuck511(g,0,L.drawPlan511(rng(seed),rounds));g.players.forEach(p=>p.ai=true);
  for(let ticks=0;g.phase!=='result';ticks++){assert(ticks<rounds*18);L.advanceLuck511(g,g.nextAt);assert(!('plan511' in L.publicLuck511(g,'visitor')));if(g.phase==='settle')g=JSON.parse(JSON.stringify(g));}
  assert.equal(g.history.length,rounds);assert.equal(g.results.length,4);for(const p of g.players){assert(B(p.distance)>=0n);assert(Number.isSafeInteger(total571(p.loadout)));}
 }
});

test('hitting a player already at zero with zero movement cannot farm successful-hit charges',()=>{
 const g=game({items:['shell','echo','echo','echo'],distance:[0,0,0,0]});g.players[0].loadout=gear('hunter');
 const e=resolve(g);assert.equal(e.attacks[0].targets[0].amount,0);assert.equal(e.rows[0].strikes,0);assert.equal(e.rows[0].attackHits,0);
});
