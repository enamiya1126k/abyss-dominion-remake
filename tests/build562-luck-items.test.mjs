import test from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../src/luck/Rules511.js';
import {ITEMS511,BIG511} from '../src/luck/Items511.js';
import {DETAILS562} from '../src/luck/Descriptions562.js';
import {equipmentFrame562,equipmentStats562} from '../src/luck/Equipment562.js';
import {game,gear,resolve,commit,select,bigint as B} from '../tools/build562/fixture.mjs';

// Expected values are the item promises, independently written as concrete cases.
const bases={dash:220,rocket:500,turbo:1000,shell:120,lightning:80,shield:160,mirror:120,engine:100,magnet:120,banana:180,pit:100,swap:80,dice:0,spring:350,comet:1250,battery:100,turbine:0,seed:0,bond:0,coil:0,ward:100,revenge:80,product:200,mega:6000,jackpot:0,breaker:100,sniper:150,wrench:150,doubling:100,bank:0,solar:100,forge:200,echo:0,focus:100,crown:100,overdrive:100,triple:600,harvest:400,nova:12000,dragon:3000};
test('catalogue covers all 40 items, 28 persistent pieces and 12 one-shot choices',()=>{
 assert.equal(ITEMS511.length,40);assert.equal(ITEMS511.filter(x=>x.persistent).length,28);assert.equal(BIG511.length,11);
 assert.deepEqual(new Set(ITEMS511.map(x=>x.id)),new Set(Object.keys(bases)));assert.deepEqual(new Set(Object.keys(DETAILS562)),new Set(Object.keys(bases)));
 for(const i of ITEMS511){assert(i.detail&&i.name);assert.equal(i.detail,DETAILS562[i.id]);}
});
for(const [id,expected]of Object.entries(bases))test(`item ${id}: promised initial metres and persistence`,()=>{
 const g=game({round:1,items:[id,'echo','echo','echo']}),e=resolve(g),row=e.rows[0];assert.equal(B(row.planned),BigInt(expected));
 if(id==='dice')assert.equal(row.knockback,300);
 commit(g,e);const installed=g.players[0].loadout.filter(x=>x.id===id).length;assert.equal(installed,ITEMS511.find(i=>i.id===id).persistent?1:0);
 if(id==='ward')assert.equal(g.players[0].wards,1);if(id==='bank')assert.equal(g.players[0].savings,200);if(id==='solar')assert.equal(g.players[0].suns,1);
});

const stacking={dash:n=>220n*n,shell:n=>120n*n,lightning:n=>80n*n,shield:n=>160n*n,mirror:n=>120n*n,engine:n=>100n*n,magnet:n=>120n*n,banana:n=>180n*n,pit:n=>100n*n,spring:n=>350n*n,battery:n=>100n*n,turbine:n=>100n*3n**n/2n**n,seed:n=>400n*n,bond:()=>0n,coil:()=>0n,ward:n=>100n*n,revenge:n=>80n*n,breaker:n=>100n*n,sniper:n=>150n*n,wrench:n=>150n*n,doubling:n=>100n*n*2n**(3n*n),bank:()=>0n,solar:n=>100n*n,forge:n=>800n*n,echo:n=>321n*n/2n,focus:n=>100n*n,crown:n=>100n*n,overdrive:n=>100n*n*2n**n};
for(const [id,expected]of Object.entries(stacking))test(`stack ${id}: 1, 2 and 3 copies with elapsed rounds`,()=>{
 for(const n of [1,2,3]){const g=game({round:4});g.players[0].loadout=gear(id,n);g.players[0].lastAdvance=321;
  if(id==='turbine')g.players[0].loadout.push(...gear('engine'));
  g.players[0].wards=5;g.players[0].coils=2;g.players[0].savings=7;g.players[0].suns=7;
  const r=resolve(g).rows[0];assert.equal(B(r.planned),expected(BigInt(n)),id+' '+n);
  if(id==='ward')assert.equal(r.wards,5+n);if(id==='coil')assert.equal(r.coils,2+n);if(id==='shield')assert.equal(r.guards,n);if(id==='mirror')assert.equal(r.mirrors,n);
  if(id==='bank')assert.equal(r.savings,7+200*n);if(id==='solar')assert.equal(r.suns,7+n);
 }
});

test('ward adds all unused guards, stacks, consumes only a guarded hit, and survives JSON restart',()=>{
 let g=game({round:1,items:['ward','echo','echo','echo']});commit(g);assert.equal(g.players[0].wards,1);
 L.advanceLuck511(g,g.nextAt);select(g,['echo','echo','echo','echo']);commit(g);assert.equal(g.players[0].wards,2);
 L.advanceLuck511(g,g.nextAt);select(g,['ward','echo','echo','echo']);commit(g);assert.equal(g.players[0].wards,4);
 g=JSON.parse(JSON.stringify(g));L.advanceLuck511(g,g.nextAt);select(g,['echo','lightning','echo','echo']);const e=resolve(g);assert.equal(e.rows[0].beforeAttacks.wards,6);assert.equal(e.rows[0].wards,5);commit(g,e);assert.equal(g.players[0].wards,5);
 const once=JSON.stringify(g);L.advanceLuck511(g,g.phaseAt);assert.equal(JSON.stringify(g),once);assert.equal(L.publicLuck511(g,'p0').players[0].wards,5);
});
test('seed, periodic bond and individual forge ages activate on the promised rounds',()=>{
 const seed=[0,100,200,400,800,1600],bond=[0,0,2400,0,2400,0],forge=[200,400,600,800,1000,1200];
 for(let age=0;age<6;age++)for(const [id,expected]of [['seed',seed],['bond',bond],['forge',forge]]){const g=game({round:age+1});g.players[0].loadout=gear(id);const row=resolve(g).rows[0];assert.equal(B(row.planned),BigInt(expected[age]),id+' age '+age);}
 const g=game({round:4});g.players[0].loadout=[...gear('seed',1,1),...gear('seed',1,3),...gear('forge',1,1),...gear('forge',1,3)];assert.equal(resolve(g).rows[0].planned,1700);
});
test('new turbine, coil, doubling, overdrive, echo and revenge wait until the next round',()=>{
 for(const id of ['turbine','coil','doubling','overdrive','echo','revenge']){const g=game({round:2,items:[id,'lightning','echo','echo']});g.players[0].lastAdvance=999;const row=resolve(g).rows[0];assert.equal(row.calculation.turbines,0);assert.equal(row.calculation.doubling,0);assert.equal(row.calculation.overdrive,0);assert.equal(row.calculation.echo,0);assert.equal(row.coils,0);assert.equal(row.revenge,0);}
});
test('echo sums copies before rounding and preserves half-metres through amplification',()=>{
 for(const n of [1,2,3]){const g=game();g.players[0].lastAdvance=321;g.players[0].loadout=[...gear('echo',n),...gear('overdrive')];assert.equal(resolve(g).rows[0].planned,200+321*n);}
 const g=game();g.players[0].lastAdvance=0;g.players[0].loadout=gear('echo',3);assert.equal(resolve(g).rows[0].planned,0);
});

const bigBase={rocket:500,turbo:1000,comet:1250,dice:0,product:200,mega:6000,jackpot:0,triple:600,harvest:6400,nova:12000,dragon:3000};
for(const [id,base]of Object.entries(bigBase))test(`big ${id}: consumes today's coil, bank and sun; permanent gear remains`,()=>{
 const g=game({items:[id,'echo','echo','echo']});g.players[0].loadout=['battery','coil','bank','solar'].flatMap(x=>gear(x));Object.assign(g.players[0],{coils:2,savings:7,suns:2});const row=resolve(g).rows[0];
 assert.equal(B(row.planned),BigInt(base+200+828)*144n);assert.equal(row.calculation.coils,3);assert.equal(row.calculation.suns,2);assert.equal(row.calculation.cash,828);
 assert.equal(row.coils,0);assert.equal(row.suns,0);assert.equal(row.savings,0);assert.equal(row.loadout.length,4);
});
test('gate is not a big move; accumulated resources remain and continue charging',()=>{
 const g=game({items:['swap','echo','echo','echo']});g.players[0].loadout=['battery','coil','bank','solar'].flatMap(x=>gear(x));Object.assign(g.players[0],{coils:2,savings:7,suns:2});const r=resolve(g).rows[0];assert.equal(r.planned,280);assert.equal(r.coils,3);assert.equal(r.savings,207);assert.equal(r.suns,3);
});
test('all dice faces and 0..6 focus copies respect the cap, product and cannon odds',()=>{
 for(const id of ['dice','product','triple','jackpot'])for(let focus=0;focus<=6;focus++)for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)for(let c=1;c<=6;c++){
  const g=game({items:[id,'echo','echo','echo']});g.players[0].loadout=gear('focus',focus);const d=g.plan511[g.round-1].seats[0];d.dice=[a,b,c];d.jackpot=a;
  const f=[a,b,c].map(x=>Math.min(6,x+focus)),base=id==='dice'?(f[0]>=4?1400:0):id==='jackpot'?(f[0]===6?20000:0):100*f[0]*f[1]*(id==='triple'?f[2]:1),row=resolve(g).rows[0];
  assert.equal(row.planned,base+focus*100);assert.equal(row.knockback,id==='dice'&&f[0]<4?300:0);
 }
});
test('crown fires only on the selected 8- or 16-round final; copies multiply',()=>{
 for(const rounds of [8,16])for(const n of [1,2,3])for(const round of [rounds-1,rounds]){const g=game({round,rounds});g.players[0].loadout=gear('crown',n);assert.equal(B(resolve(g).rows[0].planned),100n*BigInt(n)*(round===rounds?5n**BigInt(n):1n));}
});
test('mixed multipliers and huge distances use exact integers without a distance ceiling',()=>{
 const g=game({round:16,rounds:16,items:['nova','echo','echo','echo']});g.players[0].distance='123456789012345678901234567890';
 g.players[0].loadout=[...gear('doubling',2,1),...gear('doubling',1,8),...gear('turbine',2),...gear('overdrive',2),...gear('crown',2)];
 const r=resolve(g).rows[0],expected=12700n*9n*2n**(38n+4n)*25n/4n;assert.equal(B(r.planned),expected);assert.equal(B(r.to),B(g.players[0].distance)+expected);assert.equal(typeof r.to,'string');assert.doesNotThrow(()=>JSON.stringify(r));
});

for(const id of ['shell','lightning','magnet','banana','pit','breaker','sniper','wrench'])test(`attack ${id}: target, stacking and strength`,()=>{
 for(const n of [1,2,3]){const g=game({items:[id,'rocket','rocket','rocket'],distance:[1000,3000,2000,500]});g.players[0].loadout=gear(id,n-1);
  if(['sniper','magnet'].includes(id))g.plan511[2].seats[1].boxes[0][0]='nova';
  if(id==='wrench'){g.players[1].loadout=[...gear('turbine',2),...gear('engine',3)];g.players[2].loadout=gear('engine',5);}
  const e=resolve(g),a=e.attacks.find(a=>a.source===0),v=a.volleys.find(v=>v.item===id);assert.equal(v.strength,n);assert.equal(v.targets.length,id==='lightning'?3:1);
  const hit=v.targets[0];assert.equal(hit.outcome,'hit');assert.equal(hit.target,id==='banana'?2:id==='pit'?3:1);
  if(id==='shell'||id==='banana')assert.equal(hit.amount,(id==='shell'?100:250)*n);
  if(id==='lightning')assert.equal(e.rows[1].gain,Math.floor(500/2**n));
  if(id==='magnet'){assert.equal(hit.amount,300*n);assert.equal(e.rows[0].gain,420*n);}
  if(id==='pit'||id==='sniper'){assert.equal(e.rows[hit.target].gain,0);assert(e.rows[hit.target].stopped);}
  if(id==='breaker')assert.equal(B(hit.amount),3000n-3000n*7n**BigInt(n)/10n**BigInt(n));
  if(id==='wrench'){assert.equal(hit.amount,n);assert.equal(e.rows[0].loadout.filter(x=>['turbine','engine'].includes(x.id)).length,n);assert.equal(e.rows[0].planned,150*n);assert(e.rows[0].loadout.filter(x=>['turbine','engine'].includes(x.id)).every(x=>x.round===3));}
 }
});
test('shell/breaker exclude a sole leading self; adjacent attacks ignore equal positions',()=>{
 for(const id of ['shell','breaker','banana']){const g=game({items:[id,'echo','echo','echo'],distance:[4000,3000,2000,1000]});assert.equal(resolve(g).attacks[0].targets.length,0);}
 for(const id of ['banana','pit']){const g=game({items:[id,'echo','echo','echo'],distance:[0,0,0,0]});assert.equal(resolve(g).attacks[0].targets.length,0);}
});
test('sniper threshold is 2000, uses the largest original plan and a stack stays one attack',()=>{
 for(const size of [1999,2000,2001]){const g=game({items:['sniper','dragon','echo','echo'],distance:[100,Math.max(0,size-2000),0,0]});if(size===1999){g.plan511[2].seats[1].boxes[0][0]='rocket';g.players[1].loadout=gear('echo');g.players[1].lastAdvance=2998;}const e=resolve(g);assert.equal(e.rows[1].planned,size);assert.equal(e.attacks[0].targets.length,size<2000?0:1);}
 const g=game({items:['sniper','nova','mega','echo']});g.players[0].loadout=gear('sniper',2);g.players[1].loadout=gear('shield');const hit=resolve(g).attacks[0].targets[0];assert.equal(hit.target,1);assert.equal(hit.outcome,'blocked');assert.equal(hit.strength,3);
});
test('wrench retargets after an earlier theft, excludes new gear, and starts stolen effects next round',()=>{
 const g=game({items:['wrench','wrench','engine','echo']});g.players[2].loadout=gear('turbine');g.players[3].loadout=gear('engine');const e=resolve(g);assert.equal(e.attacks[1].targets[0].target,3);assert.equal(e.attacks[1].targets[0].outcome,'hit');assert.deepEqual(e.attacks[0].targets[0].stolen,[{id:'turbine',fromRound:1}]);
 assert.equal(e.rows[0].planned,150);assert.equal(e.rows[2].planned,150);commit(g,e);L.advanceLuck511(g,g.nextAt);select(g,['echo','echo','echo','echo']);const next=resolve(g);assert.equal(next.rows[0].calculation.turbines,1);assert.equal(next.rows[1].planned,250);
 const fresh=game({items:['wrench','engine','turbine','echo']});assert.equal(resolve(fresh).attacks[0].targets.length,0);
});
test('defense priority and stacked volleys consume one per hit; blocked hits do not charge revenge',()=>{
 const g=game({items:['shell','nova','echo','echo']});g.players[0].loadout=['lightning','magnet','sniper'].flatMap(x=>gear(x));g.players[1].loadout=['shield','mirror','ward','revenge'].flatMap(x=>gear(x));g.players[1].wards=1;
 const e=resolve(g),hits=e.attacks[0].targets.filter(h=>h.target===1);assert.deepEqual(hits.map(h=>h.guard),['shield','mirror','ward','ward']);assert.equal(e.rows[1].guards,0);assert.equal(e.rows[1].mirrors,0);assert.equal(e.rows[1].wards,0);assert.equal(e.rows[1].coils,0);assert.equal(e.rows[1].hit,false);
});
test('spring blocks unlimited banana/pit volleys without consuming other defense',()=>{
 for(const id of ['banana','pit']){const g=game({items:[id,'rocket','echo','echo'],distance:id==='banana'?[1000,2000,3000,0]:[3000,2000,1000,4000]});g.players[0].loadout=gear(id,3);g.players[1].loadout=[...gear('spring'),...gear('ward')];g.players[1].wards=5;const e=resolve(g),hit=e.attacks[0].targets[0];assert.equal(hit.guard,'spring');assert.equal(e.rows[1].wards,6);assert.equal(e.rows[1].stopped,false);}
});
test('mirror returns the same attack strength once; a second mirror blocks instead of looping',()=>{
 const g=game({items:['shell','echo','echo','echo']});g.players[0].loadout=[...gear('shell',2),...gear('mirror')];g.players[1].loadout=gear('mirror');const e=resolve(g),hit=e.attacks[0].targets[0];assert.equal(hit.strength,3);assert.equal(hit.outcome,'reflected');assert.equal(hit.returned.outcome,'blocked');assert.equal(hit.returned.strength,3);assert.equal(hit.returned.returned,undefined);assert.equal(e.rows[0].mirrors,0);assert.equal(e.rows[1].mirrors,0);
});
test('revenge charges on each unblocked hit including reflection, is carried, and is not spent by this round’s big',()=>{
 const g=game({items:['nova','shell','lightning','echo'],distance:[5000,3000,2000,0]});g.players[0].loadout=gear('revenge',2);g.players[0].coils=3;const e=resolve(g);assert.equal(e.rows[0].calculation.coils,3);assert.equal(e.rows[0].coils,4);assert(e.rows[0].hit);
 const reflected=game({items:['shell','echo','echo','echo']});reflected.players[0].loadout=gear('revenge');reflected.players[1].loadout=gear('mirror');assert.equal(resolve(reflected).rows[0].coils,1);
});
test('turbo/mega lose all forward gains on an unblocked hit; a guard preserves the boost',()=>{
 for(const id of ['turbo','mega'])for(const guarded of [false,true]){const g=game({items:[id,'lightning','echo','echo']});g.players[0].loadout=[...gear('engine'),...(guarded?gear('ward'):[])];g.players[0].coils=2;const r=resolve(g).rows[0];assert.equal(r.gain,guarded?(bases[id]+200)*4:0);assert.equal(r.coils,0);}
});
test('a stop cannot be undone by a later magnet and no negative distance is possible',()=>{
 const g=game({items:['pit','magnet','rocket','echo'],distance:[3000,2000,10000,0]});const e=resolve(g);assert.equal(e.rows[1].gain,0);assert.equal(e.rows[1].to,2000);assert(e.rows[1].stopped);
 const floor=game({items:['echo','banana','echo','echo'],distance:[1,0,2000,3000]});assert.equal(resolve(floor).rows[0].to,0);
});
test('gate swaps start positions, targets the front opponent even from first, and can be guarded',()=>{
 for(const first of [false,true])for(const guard of [false,true]){const g=game({items:['swap','echo','echo','echo'],distance:first?[4000,3000,2000,0]:[1000,3000,2000,0]});if(guard)g.players[1].loadout=gear('ward');const e=resolve(g),h=e.attacks[0].targets[0];assert.equal(h.target,1);assert.equal(h.outcome,guard?'blocked':'hit');assert.equal(e.rows[0].start,guard?g.players[0].distance:3000);}
});
test('full 8- and 16-round progression preserves every unused ward and does not replenish twice',()=>{
 for(const rounds of [8,16]){let g=game({round:1,rounds});for(let r=1;r<=rounds;r++){
   select(g,['ward','ward','ward','ward']);commit(g);assert.equal(g.players[0].wards,r*(r+1)/2);
   g=JSON.parse(JSON.stringify(g));const saved=g.players[0].wards;assert.equal(L.advanceLuck511(g,g.phaseAt),false);assert.equal(g.players[0].wards,saved);L.advanceLuck511(g,g.nextAt);
  }assert.equal(g.phase,'result');assert.equal(g.history.length,rounds);assert.equal(g.results.length,4);}
});

test('equipment panel spends guards at impact, reflected guards at return, and uses the actual round',()=>{
 const g=game({items:['shell','echo','echo','echo']});g.players[0].loadout=gear('mirror');g.players[1].loadout=[...gear('mirror'),...gear('ward'),...gear('doubling')];g.players[1].wards=3;g.event=resolve(g);g.phase='broadcast';g.phaseAt=10000;
 let state=equipmentFrame562(g,10000);assert.equal(state[1].mirrors,1);assert.equal(state[1].wards,4);assert.equal(state[0].mirrors,1);
 state=equipmentFrame562(g,10000+L.LUCK511.castMs*.56);assert.equal(state[1].mirrors,0);assert.equal(state[0].mirrors,1);
 state=equipmentFrame562(g,10000+L.LUCK511.castMs*.8);assert.equal(state[0].mirrors,0);
 const stats=equipmentStats562(g,state[1],x=>x+'m');assert(stats.some(([label,value])=>label==='成長倍率（R3）'&&value==='×4'));assert(!stats.some(([label])=>label.includes('R4')));
 const original=JSON.stringify(g);equipmentFrame562(g,99999);assert.equal(JSON.stringify(g),original);
});
test('equipment panel theft and revenge follow the broadcast and agree with the final server state',()=>{
 const g=game({items:['wrench','wrench','lightning','echo']});g.players[0].loadout=gear('revenge');g.players[2].loadout=gear('turbine');g.players[3].loadout=gear('engine');g.event=resolve(g);g.phase='reveal';g.phaseAt=0;
 assert.equal(equipmentFrame562(g,0)[2].loadout.filter(x=>x.id==='turbine').length,1);
 g.phase='broadcast';const during=equipmentFrame562(g,L.LUCK511.castMs*.56);assert.equal(during[2].loadout.filter(x=>x.id==='turbine').length,0);assert.equal(during[0].coils,0);
 g.phase='run';const end=equipmentFrame562(g,0);for(const p of end){const r=g.event.rows[p.seat];for(const key of ['wards','guards','mirrors','coils','savings','suns'])assert.equal(p[key],r[key]);assert.deepEqual(p.loadout,r.loadout);}
});
