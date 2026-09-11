import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as R from '../src/battle/ChapterTwoAbilityRuntime408.js';
import {CHAPTER_TWO_ABILITY_DESIGN408 as design} from '../src/data/ChapterTwoAbilityDesign408.js';
import {SPECIES} from '../src/data/species.js';
import {RESONANCE_PAIRS385,reserveTwin385} from '../src/battle/TwinResonance385.js';
import {createBattleRulesState} from '../src/battle/BattleRules.js';
import {SaveService} from '../src/services/SaveService.js';
const context=(extra={})=>({side:'ally',speciesId:'ch2_senela',abilityId:'pact',eventId:'hit:1',round:1,...extra});
const unit=(id,side='enemy',hp=0)=>({id,side,hp,speciesId:`species:${id}`,initialRoster:true});
const json=x=>JSON.parse(JSON.stringify(x));

test('design covers the real 70 characters / 280 skills / 24 complete pairs, without enabling traits',()=>{
 const characters=Object.values(SPECIES).filter(s=>s.chapterTwoOnly);
 assert.equal(characters.length,70);assert.equal(characters.flatMap(c=>c.authoredSkills).length,280);
 assert.equal(design.pairs.length,24);assert.equal(new Set(design.pairs.flatMap(p=>p.members)).size,48);
 for(const p of design.pairs){assert.deepEqual(p.current,RESONANCE_PAIRS385.find(x=>x.id===p.id));assert.deepEqual(p.names,p.members.map(id=>SPECIES[id].name));assert.deepEqual(p.ranks,p.members.map(id=>SPECIES[id].rarity));assert.ok(p.counterplay);assert.ok(p.plannedFeature.description);}
 assert.equal(design.individualTraitsEnabled,false);assert.equal(design.pairEnhancementsEnabled,false);assert.ok(Object.isFrozen(design.traits[0]));
});
test('five distinct unpaired owners retain current rarity and four skills until individual integration',()=>{
 assert.equal(new Set(design.traits.map(t=>t.speciesId)).size,5);
 for(const t of design.traits){assert.ok(!design.pairs.some(p=>p.members.includes(t.speciesId)));assert.equal(SPECIES[t.speciesId].rarity,t.rarity);assert.equal(SPECIES[t.speciesId].authoredSkills.length,4);assert.ok(t.counterplay&&t.exception&&t.trigger);}
});
test('round quota matches the saved legacy shape; advancing a round never resets another side',()=>{
 const used={};assert.ok(R.reserveRound408(used,'ally:pair:species',1));assert.equal(R.reserveRound408(used,'ally:pair:species',1),false);
 assert.ok(R.reserveRound408(used,'enemy:pair:species',1));assert.ok(R.reserveRound408(used,'ally:pair:species',2));assert.equal(R.reserveRound408(used,'ally:pair:species',1),false);
});
test('live twin reservation still shares quotas between duplicate copies and JSON resume',()=>{
 let b={turn:1,party:[{id:'a',speciesId:'ch2_ryune',currentHp:10},{id:'b',speciesId:'ch2_rose',currentHp:10},{id:'copy',speciesId:'ch2_ryune',currentHp:10}]};
 assert.ok(reserveTwin385(b,b.party[0]));assert.equal(reserveTwin385(b,b.party[2]),null);b=json(b);assert.equal(reserveTwin385(b,b.party[0]),null);assert.ok(reserveTwin385(b,b.party[1]));
});
test('ability receipts survive checkpoint restore and separate opposing sides',()=>{
 let s=R.createAbilityState408();assert.ok(R.claimAbility408(s,context()));s=R.createAbilityState408(json(s));
 assert.equal(R.claimAbility408(s,context()),false);assert.equal(R.claimAbility408(s,context({round:2,eventId:'hit:2'})),false);
 assert.ok(R.claimAbility408(s,context({side:'enemy'})));
});
test('secondary attacks and counter/reflection reentry cannot reserve primary activations',()=>{
 for(const source of ['trait','followup','counter','reflection'])assert.equal(R.claimAbility408(R.createAbilityState408(),context({source,allowedSources:[source]})),false);
});
test('per-round limit advances without refilling battle allowance, and stale rounds fail',()=>{
 const s=R.createAbilityState408(),c=context({perRound:1,perBattle:2});assert.ok(R.claimAbility408(s,c));
 assert.equal(R.claimAbility408(s,{...c,eventId:'two'}),false);assert.ok(R.claimAbility408(s,{...c,round:2,eventId:'two'}));
 assert.equal(R.claimAbility408(s,{...c,round:1,eventId:'three'}),false);assert.equal(R.claimAbility408(s,{...c,round:3,eventId:'three'}),false);
});
test('receipt saturation fails closed instead of forgetting spent activations',()=>{
 const s=R.createAbilityState408();for(let i=0;i<4096;i++)s.receipts[`old:${i}`]=true;
 assert.equal(R.claimAbility408(s,context()),false);assert.equal(s.saturated,true);assert.equal(R.claimAbility408(R.createAbilityState408(json(s)),context()),false);
});
test('state loader bounds imported arrays, ignores prototype keys and normalizes counts',()=>{
 const s=R.createAbilityState408(JSON.parse('{"version":1,"quotas":{"x":{"round":-1,"roundUses":-5,"total":3}},"meters":{"__proto__":4,"x":999999}}'));
 assert.equal({}.x,undefined);assert.equal(s.meters.x,100);assert.deepEqual(s.quotas.x,{round:0,roundUses:0,total:3});assert.equal(s.saturated,true);
});
test('death events wait for automatic resurrection and exclude living/captured/summoned/removed actors',()=>{
 const s=R.createAbilityState408(),u=[unit('a'),unit('b','enemy',1),{...unit('c'),captured:true},{...unit('d'),summoned:true},{...unit('e'),initialRoster:false}];
 assert.deepEqual(R.confirmedDeaths408(s,u),[]);assert.deepEqual(R.confirmedDeaths408(s,u,{settled:true}).map(d=>d.id),['a']);
});
test('a revived unit never donates another death; IDs on opposite sides are independent',()=>{
 let s=R.createAbilityState408();assert.equal(R.confirmedDeaths408(s,[unit('a')],{settled:true}).length,1);s=R.createAbilityState408(json(s));
 assert.equal(R.confirmedDeaths408(s,[unit('a')],{settled:true}).length,0);assert.equal(R.confirmedDeaths408(s,[unit('a','ally')],{settled:true}).length,1);
});
test('simultaneous deaths use deterministic ordering independent of input iteration',()=>{
 const a=[unit('z'),unit('a'),unit('m','ally')];assert.deepEqual(R.confirmedDeaths408(R.createAbilityState408(),a,{settled:true}),R.confirmedDeaths408(R.createAbilityState408(),a.reverse(),{settled:true}));
});
test('shared meter retains charge across checkpoints and releases once at threshold',()=>{
 let s=R.createAbilityState408();const c=context({perRound:2,perBattle:10});assert.equal(R.advanceMeter408(s,c).charge,1);s=R.createAbilityState408(json(s));
 assert.equal(R.advanceMeter408(s,c),null);assert.equal(R.advanceMeter408(s,{...c,eventId:'2'}).charge,2);
 assert.deepEqual(R.advanceMeter408(s,{...c,eventId:'3',round:2}),{released:true,charge:0,threshold:3});
});
test('hibernation skips ten natural turns and releases on eleven, including a mid-sleep restore',()=>{
 let s=R.createAbilityState408();const c={side:'ally',speciesId:'ch2_noctia',ownerId:'owl'};
 for(let round=1;round<=10;round++){assert.equal(R.hibernationTurn408(s,{...c,round}).kind,'skip');assert.equal(R.hibernationTurn408(s,{...c,round}).kind,'none');if(round===5)s=R.createAbilityState408(json(s));}
 assert.equal(R.hibernationTurn408(s,{...c,round:11}).kind,'discharge');assert.equal(R.hibernationTurn408(s,{...c,round:12}).kind,'none');
});
test('extra actions and control do not accelerate sleep; duplicate owners cannot take over',()=>{
 const s=R.createAbilityState408(),c={side:'ally',speciesId:'ch2_noctia',ownerId:'owl',round:1};
 assert.equal(R.hibernationTurn408(s,{...c,natural:false}).kind,'none');assert.equal(R.hibernationTurn408(s,{...c,blocked:true}).kind,'none');assert.equal(R.hibernationTurn408(s,c).remaining,9);
 assert.equal(R.hibernationTurn408(s,{...c,ownerId:'copy',round:2}).kind,'none');assert.equal(R.hibernationTurn408(s,{...c,round:2}).remaining,8);
});
test('death cancels hibernation permanently even if the actor revives',()=>{
 const s=R.createAbilityState408(),c={side:'ally',speciesId:'ch2_noctia',ownerId:'owl',round:1};R.hibernationTurn408(s,c);
 assert.equal(R.hibernationTurn408(s,{...c,alive:false}).kind,'cancelled');assert.equal(R.hibernationTurn408(R.createAbilityState408(json(s)),{...c,round:2}).kind,'none');
});
test('all 21 supported debuffs convert without generating the original condition or a recursive effect',()=>{
 assert.equal(Object.keys(R.DEBUFF_CONVERSIONS408).length,21);
 for(const kind of Object.keys(R.DEBUFF_CONVERSIONS408)){
  const plan=R.convertDebuff408({kind:'status:'+kind,value:99},{fromSide:'enemy',toSide:'ally',landed:true});assert.equal(plan.cancelOriginal,true);assert.ok(plan.effect.value<=.12);assert.equal(plan.effect.turns,2);assert.equal(plan.effect.stack,'refresh-maximum');assert.equal(R.convertDebuff408(plan.effect,{fromSide:'ally',toSide:'enemy',landed:true}),null);
 }
});
test('reflection excludes allied costs, misses, ultimates, isolation and MP drain',()=>{
 for(const effect of [{kind:'isolation'},{kind:'mpDrain'},{kind:'atkDown',ultimate358:true},{kind:'atkDown',source:'reflection'}])assert.equal(R.convertDebuff408(effect,{fromSide:'enemy',toSide:'ally',landed:true}),null);
 assert.equal(R.convertDebuff408({kind:'atkDown'},{fromSide:'ally',toSide:'ally',landed:true}),null);assert.equal(R.convertDebuff408({kind:'atkDown'},{fromSide:'enemy',toSide:'ally',landed:false}),null);
});
test('ordinary targets get a terminal HP floor; no negative healing when already at HP1',()=>{
 assert.equal(R.terminalDamagePlan408({id:'x',hp:50},'deathPact').requestedDamage,50);
 assert.equal(R.terminalDamagePlan408({id:'x',hp:50},'hibernation').requestedDamage,49);assert.equal(R.terminalDamagePlan408({id:'x',hp:1},'hibernation').requestedDamage,0);
 const p=R.terminalDamagePlan408({hp:50},'deathPact');assert.ok(p.ignoreBarrier&&p.allowRescue);assert.equal(p.canReflect,false);
});
test('bosses, raid, PvP, online, story and instant-death protection get ordinary damage instead',()=>{
 for(const flag of ['boss','raidBoss','storyProtected','instantDeathImmune','immortal'])assert.equal(R.terminalDamagePlan408({hp:9999,[flag]:true},'deathPact',{attackerPower:100}).requestedDamage,200);
 for(const mode of ['raid','pvp','online','story']){const p=R.terminalDamagePlan408({hp:9999},'hibernation',{mode,attackerPower:100});assert.equal(p.kind,'damage');assert.equal(p.requestedDamage,400);assert.equal(p.ignoreBarrier,false);}
});
test('pact targets the living killer, otherwise deterministic threat without friendly fire',()=>{
 const owner={side:'ally'},targets=[{id:'x',side:'enemy',hp:10,threat:5},{id:'z',side:'enemy',hp:10,threat:10},{id:'a',side:'enemy',hp:10,threat:10},{id:'friend',side:'ally',hp:10,threat:999}];
 assert.equal(R.selectPactTarget408(owner,targets,'x').id,'x');assert.equal(R.selectPactTarget408(owner,targets,'friend').id,'a');assert.equal(R.selectPactTarget408(owner,[]),null);
});
test('absorption requires a real settled death and caps three deaths across allied/enemy casualties',()=>{
 const s=R.createAbilityState408(),owner={id:'dragon',side:'ally',speciesId:'ch2_velg'};assert.equal(R.absorbDeath408(s,owner,{id:'fake',key:'fake'}),null);
 const deaths=R.confirmedDeaths408(s,[unit('1'),unit('2'),unit('3','ally'),unit('4')],{settled:true});const results=deaths.map(d=>R.absorbDeath408(s,owner,d));
 assert.deepEqual(results.filter(Boolean).map(x=>x.multiplier),[2,4,8]);assert.equal(R.deathGrowthStacks408(s,owner),3);assert.equal(R.absorbDeath408(s,owner,deaths[0]),null);
});
test('dead absorbers gain nothing; duplicate copies share three receipts rather than creating more',()=>{
 const s=R.createAbilityState408(),owner={id:'dragon',side:'ally',speciesId:'ch2_velg'},death=R.confirmedDeaths408(s,[unit('enemy')],{settled:true})[0];
 assert.equal(R.absorbDeath408(s,owner,death,{alive:false}),null);assert.ok(R.absorbDeath408(s,owner,death));assert.equal(R.absorbDeath408(s,{...owner,id:'copy'},death),null);assert.equal(R.deathGrowthStacks408(s,{...owner,id:'copy'}),1);
});
test('growth is a pure projection, never exponential speed, free healing, or permanent stat mutation',()=>{
 const base=Object.freeze({hp:1000,atk:100,matk:80,def:60,mdef:40,spd:50,crit:10});
 for(const [stacks,scale] of [[0,.25],[1,.5],[2,1],[3,2],[20,2]]){const p=R.deathGrowthStats408(base,stacks,50);assert.equal(p.scale,scale);assert.equal(p.stats.spd,40);assert.equal(p.currentHp,50);assert.equal(p.stats.hp,1000*scale);}
 assert.equal(R.deathGrowthStats408(base,0,900).currentHp,250);assert.equal(base.hp,1000);
});
test('paper shield uses recipient entry HP, fixed source, two turns, no additive rule',()=>{
 assert.deepEqual(R.paperShield408(1000),{amount:80,turns:2,sourceKey:'trait:paper-shield',stack:'refresh-maximum'});assert.equal(R.paperShield408(-1).amount,0);assert.equal(design.traits.find(t=>t.id==='paperShield').fixedMaxHp,100);
});
test('batch replay returns no plans and failed oversized batches leave previous state untouched',()=>{
 const previous=R.createAbilityState408();const result=R.reduceAbilityBatch408(previous,[{id:'1'},{id:'1'}],()=>[{kind:'damage'}]);assert.equal(result.plans.length,1);assert.deepEqual(previous,R.createAbilityState408());
 const replay=R.reduceAbilityBatch408(json(result.state),[{id:'1'}],()=>{throw Error('replayed');});assert.equal(replay.plans.length,0);
 assert.equal(R.reduceAbilityBatch408(previous,Array.from({length:33},(_,i)=>({id:String(i)})),()=>[]).ok,false);
 assert.equal(R.reduceAbilityBatch408(previous,[{id:'x'}],()=>Array(129).fill({})).ok,false);assert.deepEqual(previous,R.createAbilityState408());
});
test('new battle state and optional legacy restore start empty, with no shared references',()=>{
 const a=createBattleRulesState([]),b=createBattleRulesState([]);R.claimAbility408(a.chapterTwoAbilities408,context());assert.equal(Object.keys(b.chapterTwoAbilities408.receipts).length,0);
 const snap=R.snapshotAbilities408(a);snap.receipts={};assert.equal(Object.keys(a.chapterTwoAbilities408.receipts).length,1);assert.deepEqual(R.createAbilityState408(undefined),R.createAbilityState408());assert.equal(R.snapshotAbilities408({}),null);
});
test('SaveService roundtrip retains spent traits and sleep counters with active battle state',()=>{
 const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
 const save=new SaveService(),state=R.createAbilityState408();R.claimAbility408(state,context());R.hibernationTurn408(state,{side:'ally',speciesId:'ch2_noctia',ownerId:'owl',round:1});
 save.state.activeBattle={battleId:'build408-test',partyIds:save.state.party,enemies:[{id:'e',speciesId:'ch2_kororu',hp:20}],turn:1,chapterTwoAbilities408:state};save.save();const restored=new SaveService().state.activeBattle;
 assert.ok(restored);const loaded=R.createAbilityState408(restored.chapterTwoAbilities408);assert.equal(R.claimAbility408(loaded,context()),false);assert.equal(R.hibernationTurn408(loaded,{side:'ally',speciesId:'ch2_noctia',ownerId:'owl',round:2}).remaining,8);
});
test('main checkpoint and resume preserve the optional state after the fresh rules-state spread',()=>{
 const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');assert.ok(main.includes('chapterTwoAbilities408:snapshotAbilities408(battle)'));assert.ok(main.includes('...createBattleRulesState(party),chapterTwoAbilities408:createAbilityState408(data.chapterTwoAbilities408)'));
 const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');const map=JSON.parse(index.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
 for(const path of ['src/battle/TwinResonance385.js','src/battle/BattleRules.js','src/core/config.js','src/services/SaveService.js']){const canonical=map['./'+path];assert.ok(canonical?.startsWith('./'+path+'?v='));for(const [key,value] of Object.entries(map))if(key.split('?')[0]==='./'+path)assert.equal(value,canonical);}
});
test('trait stat projections apply the five agreed costs and keep paper maximum HP at 100 at any level',()=>{
 const base=Object.freeze({hp:1000000,atk:2000,matk:3000,def:500,mdef:600,spd:800});
 for(const definition of design.traits){const p=R.traitStats408(base,definition);assert.equal(p.atk,base.atk*definition.entryMultipliers.atk);assert.equal(p.hp,definition.fixedMaxHp??Math.floor(base.hp*definition.entryMultipliers.hp));}
 const paper=design.traits.find(t=>t.id==='paperShield');assert.equal(R.traitStats408({...base,hp:999999999},paper).hp,100);assert.equal(base.hp,1000000);
});
