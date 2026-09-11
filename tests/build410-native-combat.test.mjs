import test from 'node:test';import assert from 'node:assert/strict';
import {run} from '../tools/build411/native-harness.mjs';
import * as T from '../src/battle/SingleTraits410.js';
import {deathGrowthStacks408} from '../src/battle/ChapterTwoAbilityRuntime408.js';
import {calculatedStats,rawCalculatedStats410} from '../src/models/Monster.js';
import {applyEnemyDamage,applyBattleEffect,effectValue} from '../src/battle/BattleRules.js';
import {magicCircleById,magicCircleLevelEffect} from '../src/core/MagicCircleSystem.js';
import {SaveService} from '../src/services/SaveService.js';
const fixture=(party,enemies=['ch2_grant','ch2_grant'],options={})=>run(party,enemies,{inspect:true,gear:true,...options});
function circle(b,u,id){const def=magicCircleById(id);b.magicCircleProfiles[u.id]={...def,level:10,levelEffect:magicCircleLevelEffect(def,10)};}
function entry(x,u,side='ally'){x.b.turnQueue=[{type:side,id:u.id}];x.b.queueIndex=0;x.b.busy=false;x.b.actionCommitted=false;}
for(const speed of [1,4])test(`native ${speed}x: actual turn flow sleeps ten times and HP1 release respects barriers`,async()=>{
 const x=await fixture(['ch2_noctia','ch2_fiora','ch2_ferne','ch2_clarisse'],undefined,{speed}),u=x.party[0];for(let i=1;i<=10;i++){x.b.turn=i;entry(x,u);await x.nativeContinue();assert.equal(Object.values(x.b.chapterTwoAbilities408.sleepers)[0].ticks,i);assert.ok(x.enemies.every(e=>e.hp===e.maxHp));}
 x.enemies.forEach(e=>e._floorBossHpShield=1e9);x.b.turn=11;entry(x,u);await x.nativeContinue();assert.ok(x.enemies.every(e=>e.hp===1));assert.ok(x.enemies.every(e=>e._floorBossHpShield===1e9));
});
test('native protected winter release uses unweakened entry MATK and ordinary shields',async()=>{
 const x=await fixture(['ch2_noctia','ch2_fiora'],['ch2_grant','ch2_grant'],{boss:true}),u=x.party[0];x.enemies[0]._floorBossHpShield=1e9;const start=x.enemies.map(e=>e.hp);for(let i=1;i<=11;i++){x.b.turn=i;entry(x,u);await x.nativeContinue();}
 assert.equal(x.enemies[0].hp,start[0]);assert.ok(x.enemies[0]._floorBossHpShield<1e9);assert.ok(x.enemies[1].hp>1&&x.enemies[1].hp<start[1]);
});
for(const id of ['last_life','reincarnation'])test(`native ${id}: rescue delays pact until the next actual death`,async()=>{
 const x=await fixture(['ch2_senela','ch2_velg','ch2_fiora']),u=x.party[0];circle(x.b,u,id);x.context.prepareBattleUltimates358();x.enemies[0].accuracy=1000;
 await x.context.dealEnemyHit(x.enemies[0],u,1e8,'',0,'dark',{guaranteedHit:true});T.settleSingleDeaths410(x.b);assert.ok(u.currentHp>0);assert.ok(x.enemies[0].hp>0);assert.equal(Object.keys(x.b.chapterTwoAbilities408.deaths).length,0);
 await x.context.dealEnemyHit(x.enemies[0],u,1e8,'',0,'dark',{guaranteedHit:true});T.settleSingleDeaths410(x.b);assert.equal(u.currentHp,0);assert.equal(x.enemies[0].hp,0);assert.equal(deathGrowthStacks408(x.b.chapterTwoAbilities408,{side:'ally',speciesId:'ch2_velg'}),2);
});
test('native ten-life revival preserves spent pact and never reactivates winter',async()=>{
 const x=await fixture(['ten_life','ch2_senela','ch2_noctia','ch2_velg'],['ch2_grant','ch2_grant','ch2_grant']),[life,pact,winter]=x.party;
 await x.context.dealEnemyHit(x.enemies[0],pact,1e8,'',0,'dark',{guaranteedHit:true});T.settleSingleDeaths410(x.b);assert.equal(x.enemies[0].hp,0);
 await x.context.dealEnemyHit(x.enemies[1],winter,1e8,'',0,'dark',{guaranteedHit:true});T.settleSingleDeaths410(x.b);assert.equal(winter.currentHp,0);
 entry(x,life);await x.context.command('skill','endgame__ten_life__lifeBlessing');assert.ok(pact.currentHp>0||winter.currentHp>0);
 // Native heal skill may choose one target; restore the other through the same recovery setter.
 if(winter.currentHp<=0)winter.currentHp=1;if(pact.currentHp<=0)pact.currentHp=1;x.b.turn=2;assert.equal(T.naturalSingleAction410(x.b,winter,'ally').kind,'none');
 await x.context.dealEnemyHit(x.enemies[1],pact,1e8,'',0,'dark',{guaranteedHit:true});T.settleSingleDeaths410(x.b);assert.ok(x.enemies[1].hp>0);
});
test('native enemy pact triggers on player command and chooses the actual killer',async()=>{
 const x=await fixture(['ch2_lumea','ch2_velg'],['ch2_senela','ch2_grant']),actor=x.party[0];x.enemies[0].hp=1;x.b.targetEnemyId=x.enemies[0].id;actor._equipmentStats.accuracy=1000;entry(x,actor);await x.context.command('attack');T.settleSingleDeaths410(x.b);assert.equal(x.enemies[0].hp,0);assert.equal(actor.currentHp,0);assert.ok(x.party[1].currentHp>0);
});
test('native paper-shield skill cannot refill the spent opening shield; magic circles and ten-life cannot shield Fiora',async()=>{
 const x=await fixture(['ch2_fiora','ten_life','ch2_sephira','ch2_astrelle']),u=x.party[0],k=JSON.stringify(['ally',x.party[1].id]);const initial=x.b.singleTraits410.shields[k].amount;T.absorbPaperShield410(x.b,x.party[1],initial);entry(x,u);await x.context.command('skill','ch2_fiora__guard');assert.equal(x.b.singleTraits410.shields[k].amount,0);assert.equal(x.b.circleShields[x.party[1].id]??0,0);
 circle(x.b,u,'aegis');await x.context.applyOpeningMagicCircles();entry(x,x.party[1]);await x.context.command('skill','endgame__ten_life__worldTree');assert.equal(u.heroShield348,0);assert.equal(x.b.circleShields[u.id],0);assert.equal(u.maxHp,100);assert.ok(x.party.slice(1).some(a=>((a.heroShield348??0)+(x.b.circleShields[a.id]??0))>0));
});
test('native pair synergies protect allies without breaking the low-HP body',async()=>{
 const x=await fixture(['ch2_sephira','ch2_astrelle','ch2_fiora','ch2_noctia']);await x.context.resolveTwinResonance385(x.party[0],'ally');await x.context.resolveTwinResonance385(x.party[1],'ally');assert.ok((x.b.circleShields[x.party[3].id]??0)>0);assert.equal(x.b.circleShields[x.party[2].id],0);x.b.turn=2;await x.context.resolveTwinResonance385(x.party[0],'ally');assert.ok(x.b.pairSynergy409.stats['ally:starconfluence']?.activations>0);
});
test('native opposing inversion regenerates while ordinary persistent poison still needs cleansing',async()=>{
 const x=await fixture(['ch2_lumea','ch2_fiora'],['ch2_lumea','ch2_grant']);const enemy=x.enemies[0];enemy.hp=Math.floor(enemy.maxHp/2);applyBattleEffect(x.b,enemy.id,{kind:'healDown',turns:2,chance:1,sourceMonsterId:x.party[0].id},'enemy');assert.equal(effectValue(x.b,enemy.id,'regen','enemy'),.03);const before=enemy.hp;await x.context.endRound();assert.ok(enemy.hp>before);assert.equal(effectValue(x.b,enemy.id,'healDown','enemy'),0);
});
test('native enemy hibernation and enemy shared shields use the same limits',async()=>{
 const x=await fixture(['ch2_grant','ch2_grant'],['ch2_noctia','ch2_fiora','ch2_velg']);const sleeper=x.enemies[0];for(let r=1;r<=11;r++){x.b.turn=r;entry(x,sleeper,'enemy');await x.nativeContinue();}assert.ok(x.party.every(u=>u.currentHp===1));assert.equal(x.enemies[1].maxHp,100);
});
test('native main checkpoint through SaveService preserves the complete special-ability ledger',async()=>{
 const x=await fixture(['ch2_noctia','ch2_fiora','ch2_velg']);x.b.turn=5;entry(x,x.party[0]);await x.nativeContinue();x.b.circleShields[x.party[1].id]=10000;x.context.persistExpeditionSnapshot=()=>null;x.nativeSave();const raw=JSON.parse(JSON.stringify(x.context.save.state));assert.deepEqual(raw.activeBattle.singleTraits410,T.snapshotSingles410(x.b));
 const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};const saver=new SaveService();saver.state=raw;assert.ok(saver.save());const restored=new SaveService().state;assert.deepEqual(restored.activeBattle.singleTraits410,raw.activeBattle.singleTraits410);assert.deepEqual(restored.activeBattle.chapterTwoAbilities408,raw.activeBattle.chapterTwoAbilities408);assert.equal(restored.monsters[1].currentHp,100);
});
