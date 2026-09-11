import {createAbilityState408} from '../src/battle/ChapterTwoAbilityRuntime408.js';
import {createPairState409} from '../src/battle/PairSynergy409.js';
import {createSingleState410} from '../src/battle/SingleTraits410.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as C from '../src/chapterTwo/ChapterTwoSystem.js';
import {CHAPTER_TWO_SQUADS397} from '../src/chapterTwo/ChapterTwoRoster397.js';
import * as G from '../src/chapterTwo/ChapterTwoGacha397.js';
import {reduceChapterTwoCooldowns397} from '../src/chapterTwo/ChapterTwoCommander397.js';
import {chapterTwoGachaTabs397,chapterTwoGachaBody397,chapterTwoGachaRates397} from '../src/ui/ChapterTwoGacha397.js';
import {SPECIES} from '../src/data/species.js';
import {endgameCharacter} from '../src/data/endgameCharacters.js';
import {RESONANCE_PAIRS385,twinReady385} from '../src/battle/TwinResonance385.js';
import {createEnemyBattleState,chooseEnemyAction,enemyActionMpCost,specialActionInfo,specialActionMultiplier} from '../src/battle/EnemyAI.js';
import {applyBattleEffect,hasEffect,tickBattleEffects,effectValue} from '../src/battle/BattleRules.js';
import {SaveService} from '../src/services/SaveService.js';
import {MONSTER_STORAGE_CAP} from '../src/core/config.js';
import {BattleScreen} from '../src/ui/screens/BattleScreen.js';
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const extract=(a,b)=>main.slice(main.indexOf(a),main.indexOf(b,main.indexOf(a)));
function fixture(unlocked=true){const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};const save=new SaveService();if(unlocked){save.state.player.maxFloor=100;save.state.campaign100.finalCompleted=true;}save.state.player.crystals=1000;return save;}
function team(id,tier=1){return C.chapterTwoEnemyEntries(id,{eliteTier393:tier}).map((entry,i)=>{const e=createEnemyBattleState(SPECIES[entry.speciesId],{...entry,id:`e${i}`},100);C.tuneChapterTwoEnemy(e,id,i,{eliteTier393:tier});if(e.endgameBossId){const p=endgameCharacter(e.endgameBossId);Object.assign(e,{visualSpeciesId:p.id,name:p.name,_endgameStatProfileApplied:p.id,elementMultipliers:p.elementMultipliers,statusProfile:p.statusProfile,bossPassive:p.passive});}return e;});}
const mixed=Object.entries(C.ENCOUNTERS).filter(([,e])=>e.authorities?.some(Boolean));

test('all 61 encounters contain only chapter natives or one authored authority; 21 mixed squads retain a complete pair',()=>{
 assert.equal(Object.keys(C.ENCOUNTERS).length,61);assert.equal(Object.keys(CHAPTER_TWO_SQUADS397).length,27);assert.equal(mixed.length,21);
 for(const [id,e] of Object.entries(C.ENCOUNTERS)){
  const units=team(id);assert.ok(units.length<=4&&units.length>=2,id);
  for(const u of units){assert.ok(SPECIES[u.speciesId].chapterTwoOnly||endgameCharacter(u.endgameBossId),id);assert.equal(u.name,endgameCharacter(u.endgameBossId)?.name??SPECIES[u.speciesId].name);}
  if(e.authorities?.some(Boolean)){
   assert.equal(units.length,4);assert.equal(units.filter(u=>u.endgameBossId).length,1);const a=units.find(u=>u.endgameBossId);assert.equal(a.uncapturable,true);assert.equal(a.faction,e.area<3?'abyss':'tenGod');
   const pair=RESONANCE_PAIRS385.find(p=>p.members.every(k=>units.some(u=>u.speciesId===k)));assert.ok(pair,id);assert.ok(twinReady385({enemies:units,enemyEffects:{},enemyStatuses:{}},units.find(u=>u.speciesId===pair.members[0]),'enemy'),id);
   for(const u of units.filter(u=>!u.endgameBossId))assert.equal(u.uncapturable,false);
  }
 }
});
test('ordinary rotations still expose all 70 capturable natives and all 24 pairs',()=>{
 const found=new Set(),pairs=new Set();
 for(const [id,e] of Object.entries(C.ENCOUNTERS).filter(([,e])=>e.roaming&&!e.elite393&&!e.roamingBase391))for(const visit380 of [0,1]){
  const units=C.chapterTwoEnemyEntries(id,{visit380});for(const u of units){assert.equal(u.uncapturable,false);assert.equal(u.endgameBossId,null);found.add(u.speciesId);}
  for(const p of RESONANCE_PAIRS385)if(p.members.every(k=>units.some(u=>u.speciesId===k)))pairs.add(p.id);
 }
 assert.equal(found.size,70);assert.equal(pairs.size,24);
});
test('mixed squads use six real leveled gear slots, distinct circles, visible names/ranks and finite area stats',()=>{
 for(const [id]of mixed)for(const tier of [1,2,3]){
  const units=team(id,tier);assert.equal(new Set(units.map(u=>u.enemyMagicCircle.id)).size,4);
  for(const u of units){assert.equal(u.enemyGear.length,6);assert.equal(new Set(u.enemyGear.map(g=>g.enemySubslot)).size,6);assert.ok(u.enemyGear.every(g=>g.enemyOnly&&g.level>1&&g.plus>0));for(const stat of ['hp','maxHp','atk','matk','def','mdef','spd','maxMp'])assert.ok(Number.isFinite(u[stat])&&u[stat]>0,`${id}:${stat}`);}
  const html=BattleScreen({specialBattle:true,specialBattleType:'chapterTwo',enemies:units,party:[],turnQueue:[],turn:1},{},{});
  for(const u of units){const start=html.indexOf(`data-enemy-target="${u.id}"`),end=html.indexOf('side-unit-sprite',start);assert.ok(html.slice(start,end).includes(u.name),id);assert.ok(html.slice(start,end).includes('combat-rank-badge'));}
 }
});
test('gacha is absent before both 100F and hero victory; unlock does not require replaying the introduction',()=>{
 const s=fixture(false).state,before=JSON.stringify(s);assert.equal(chapterTwoGachaTabs397(s),'');assert.equal(G.drawChapterTwoGacha397(s,1).ok,false);assert.equal(JSON.stringify(s),before);
 s.player.maxFloor=100;assert.equal(G.chapterTwoGachaUnlocked397(s),false);s.campaign100.finalCompleted=true;assert.equal(G.chapterTwoGachaUnlocked397(s),true);assert.equal(s.chapterTwo376,undefined);assert.ok(chapterTwoGachaTabs397(s).includes('data-gacha-tab397="chapterTwo"'));
});
test('all 10000 rarity tickets exactly match rates and every one of the 70 names has an equal within-rank slot',()=>{
 const counts={};for(let ticket=0;ticket<10000;ticket++){let call=0;const r=G.rollChapterTwoGacha397(()=>call++?0:(ticket+.5)/10000);counts[r.rarity]=(counts[r.rarity]??0)+1;}
 assert.deepEqual(counts,{N:500,R:1500,SR:3500,SSR:2500,UR:1500,LR:400,'神話':100});
 let start=0;const ids=new Set();for(const [rank,pct]of Object.entries(G.CHAPTER_TWO_GACHA_RATES397)){const pool=G.CHAPTER_TWO_GACHA_POOLS397[rank];assert.equal(pool.length,10);for(let i=0;i<10;i++){let n=0;const r=G.rollChapterTwoGacha397(()=>n++?(i+.5)/10:(start+.5)/10000);assert.equal(r.speciesId,pool[i]);assert.equal(SPECIES[r.speciesId].gachaExcluded,true);assert.equal(SPECIES[r.speciesId].chapterTwoOnly,true);ids.add(r.speciesId);}start+=pct*100;}assert.equal(ids.size,70);
});
test('a 10-pull charges exactly 1000, permits ten N results, grants usable monsters and leaves normal pity/party/gear/progress intact',()=>{
 const save=fixture(),s=save.state,before=structuredClone(s);const result=G.drawChapterTwoGacha397(s,10,{random:()=>0});assert.equal(result.ok,true);assert.equal(s.player.crystals,0);assert.equal(result.results.length,10);assert.ok(result.results.every(r=>r.rarity==='N'));assert.equal(new Set(result.results.map(r=>r.item.id)).size,10);assert.equal(result.results.filter(r=>r.isNew).length,1);assert.equal(s.monsters.length,before.monsters.length+10);
 for(const r of result.results){assert.equal(r.item.obtainedMethod,'chapterTwoSummon');assert.equal(r.item.level,1);assert.equal(r.item.enemyGear,undefined);assert.equal(r.item.enemyMagicCircle,undefined);assert.equal(r.item.summonRarity,'N');}
 assert.equal(s.codex.captures[result.results[0].speciesId],10);assert.equal(s.chapterTwoGacha397.draws,10);
 const current=structuredClone(s);current.player.crystals=before.player.crystals;current.monsters=before.monsters;current.codex=before.codex;delete current.chapterTwoGacha397;assert.deepEqual(current,before);
 assert.equal(save.save(),true);const loaded=new SaveService();assert.deepEqual(loaded.state.chapterTwoGacha397,s.chapterTwoGacha397);assert.ok(result.results.every(r=>loaded.state.monsters.some(m=>m.id===r.item.id)));
});
test('funds, exact storage capacity, invalid counts and active exploration reject without changing any data',()=>{
 for(const count of [0,-1,2,11,1.5,NaN,Infinity,'10']){const s=fixture().state,b=JSON.stringify(s);assert.equal(G.drawChapterTwoGacha397(s,count).ok,false);assert.equal(JSON.stringify(s),b);}
 for(const tweak of [s=>s.player.crystals=99,s=>s.player.crystals=NaN,s=>s.player.inRun=true,s=>s.activeBattle={battleId:'running'},s=>s.monsters=Array.from({length:MONSTER_STORAGE_CAP},()=>({speciesId:'slime'}))]){const s=fixture().state;tweak(s);const b=JSON.stringify(s);assert.equal(G.drawChapterTwoGacha397(s,1).ok,false);assert.equal(JSON.stringify(s),b);}
 for(const count of [1,10]){const s=fixture().state;s.player.crystals=count*100;s.monsters=Array.from({length:MONSTER_STORAGE_CAP-count},()=>({speciesId:'slime'}));assert.equal(G.drawChapterTwoGacha397(s,count).ok,true);assert.equal(s.monsters.length,MONSTER_STORAGE_CAP);assert.equal(s.player.crystals,0);}
});
test('failed persistence rolls back charge and grants; retry then reload yields one receipt only',()=>{
 const save=fixture(),original=structuredClone(save.state),realSave=save.save.bind(save);save.save=()=>false;const c={save,game:null,showToast(){}};vm.createContext(c);vm.runInContext(extract('function chapterTwoCommit(','let chapterTwoIntroTimer='),c);
 assert.equal(c.chapterTwoCommit(()=>G.drawChapterTwoGacha397(save.state,10)).saveFailed,true);assert.equal(JSON.stringify(save.state),JSON.stringify(original));
 save.save=realSave;assert.equal(c.chapterTwoCommit(()=>G.drawChapterTwoGacha397(save.state,10)).ok,true);const loaded=new SaveService();assert.equal(loaded.state.player.crystals,0);assert.equal(loaded.state.chapterTwoGacha397.draws,10);assert.equal(loaded.state.monsters.length,original.monsters.length+10);
});
test('real summon button handler prevents double-click grants and permits retry after a failed save',()=>{
 const save=fixture(),buttons=[{dataset:{chapter397Pull:'1'}},{dataset:{chapter397Pull:'10'}}],other={},modal={isConnected:true,classList:{add(){}},querySelectorAll:()=>buttons,querySelector:s=>other[s]??=( {} ),remove(){this.isConnected=false;}};let shown=0,fail=true;
 const c={save,battle:null,app:{insertAdjacentHTML(){}},Modal:()=>'',topModal:()=>modal,bindGachaTabs397(){},chapterTwoGachaUnlocked397:G.chapterTwoGachaUnlocked397,chapterTwoGachaBody397,chapterTwoGachaRates397,openRarityGuide(){},drawChapterTwoGacha397:G.drawChapterTwoGacha397,showToast(){},showSummonResults:()=>shown++,chapterTwoCommit:f=>fail?{ok:false,saveFailed:true}:f()};
 vm.createContext(c);vm.runInContext(extract('function openChapterTwoGacha397(','function openGacha('),c);c.openChapterTwoGacha397();buttons[0].onclick();assert.equal(save.state.player.crystals,1000);fail=false;buttons[0].onclick();buttons[0].onclick();buttons[1].onclick();assert.equal(save.state.player.crystals,900);assert.equal(save.state.chapterTwoGacha397.draws,1);assert.equal(shown,1);assert.ok(buttons.every(b=>b.disabled));
});
test('provided-rate UI lists all names, individual percentages and no-guarantee conditions; results return to this gacha',()=>{
 const html=chapterTwoGachaRates397();assert.equal((html.match(/<li(?:\s[^>]*)?>/g)??[]).length,70);assert.equal((html.match(/<details>/g)??[]).length,7);for(const ids of Object.values(G.CHAPTER_TWO_GACHA_POOLS397))for(const id of ids)assert.ok(html.includes(SPECIES[id].name));assert.ok(html.includes('0.1%'));assert.ok(html.includes('独立抽選'));assert.ok(html.includes('天井はありません'));assert.ok(html.includes('通常召喚の保証カウントには影響しません'));
 const body=chapterTwoGachaBody397(fixture().state);assert.equal((body.match(/<figure>/g)??[]).length,4);assert.match(main,/if\(campaign==="chapterTwo397"\)openChapterTwoGacha397\(\)/);
});
function runtime(enemies){
 const battle={enemies,party:[{id:'p',currentHp:100000,currentMp:100}],turn:1,reviveCount:0,enemyEffects:{},enemyStatuses:{},allyEffects:{},allyAilments:{}};
 const c={battle,specialActionInfo,specialActionMultiplier,hasEffect,applyBattleEffect,reduceChapterTwoCooldowns397,addBattleLog(){},battleBanner:async()=>{},battleFlash(){},applyFloorBossActionTax:async()=>{},canBattleRevive:()=>true,queueBattleRecovery(){},flushBattleRecoveries:async()=>{},floatText:async()=>{},POSITIVE_ENEMY_EFFECTS:new Set(['atkUp','defUp','spdUp','guard','regen','accuracyUp']),recoverFloorBossHp:(e,n)=>{const before=e.hp;e.hp=Math.min(e.maxHp,e.hp+n);return e.hp-before;},recoverEnemyBattleMp:(e,n)=>{const before=e.currentMp;e.currentMp=Math.min(e.maxMp,e.currentMp+n);return e.currentMp-before;},storeFloorBossSacrifice(){},chooseEnemyTarget:()=>battle.party[0],floorBossDomainActionMultiplier:()=>1,turnPowerMultiplier:()=>1,allyAilment:()=>null,animateAttack:async()=>{},dealEnemyHit:async()=>10,grantEnemyAuthorityShield:(e,rate)=>{for(const u of enemies)u._floorBossHpShield=Math.floor(u.maxHp*rate);}};
 vm.createContext(c);vm.runInContext(extract('async function resolveEnemySpecialAction(','async function resolveEnemyFlee('),c);return c;
}
test('each commander selects its real authority, uses its real MP cost and preserves cooldowns on serialization',()=>{
 for(const [id]of mixed){const enemies=team(id),u=enemies[0],battle={turn:1,enemyEffects:{}},context={allies:enemies,battle};let action=chooseEnemyAction(u,context);assert.match(action,/^authority:/,id);const info=specialActionInfo(action);assert.equal(enemyActionMpCost(u,action),info.mp);assert.ok(u.currentMp>=info.mp);u.currentMp-=info.mp;
  const reloaded=JSON.parse(JSON.stringify(u));assert.notEqual(chooseEnemyAction(reloaded,context),action,id);u.specialCooldown=3;assert.equal(chooseEnemyAction(u,context),'attack');assert.equal(u.specialCooldown,2);u.specialCooldown=0;u.currentMp=0;assert.equal(chooseEnemyAction(u,context),'ch2:recharge');assert.equal(chooseEnemyAction(u,context),'attack');
 }
});
test('life commander revives one eligible ally, never a captured/sealed unit, and cannot repeat revive after reload',async()=>{
 const enemies=team('a3_west'),u=enemies[0],c=runtime(enemies),ctx={allies:enemies,battle:c.battle};enemies[1].hp=0;enemies[1].captured=true;enemies[2].hp=0;c.battle.enemyEffects.e2=[{kind:'reviveSeal',turns:3}];enemies[3].hp=0;
 const action=chooseEnemyAction(u,ctx);assert.ok(specialActionInfo(action).revive);await c.resolveEnemySpecialAction(u,action);assert.equal(u.commanderRevived397,true);assert.equal(enemies[1].hp,0);assert.equal(enemies[2].hp,0);assert.ok(enemies[3].hp>0);assert.equal(c.battle.reviveCount,1);
 enemies[3].hp=0;const copy=JSON.parse(JSON.stringify(u));c.battle.enemies[0]=copy;c.battle.turn=30;assert.notEqual(chooseEnemyAction(copy,{allies:enemies,battle:c.battle}),action);await c.resolveEnemySpecialAction(copy,action);assert.equal(enemies[3].hp,0);assert.equal(c.battle.reviveCount,1);
});
test('all-heal authorities can revive at full team HP once, then continue healing without re-reviving',async()=>{
 const enemies=team('vault2'),u=enemies[0],c=runtime(enemies);enemies[1].hp=0;
 const action=chooseEnemyAction(u,{allies:enemies,battle:c.battle});assert.equal(specialActionInfo(action).type,'allHeal');await c.resolveEnemySpecialAction(u,action);assert.ok(enemies[1].hp>0);assert.equal(u.commanderRevived397,true);
 enemies[1].hp=0;enemies[2].hp=1;await c.resolveEnemySpecialAction(u,action);assert.equal(enemies[1].hp,0);assert.ok(enemies[2].hp>1);assert.equal(c.battle.reviveCount,1);
});
test('time acceleration lowers native skill CT without enabling same-turn repeats or changing recharge CT',async()=>{
 const enemies=team('a3_east'),u=enemies[0],c=runtime(enemies);c.battle.turn=3;enemies[1].chapterTwoCooldowns383={attack:7,justUsed:4};u.commanderCooldowns397={spell:7,recharge:8};
 const action=chooseEnemyAction(u,{allies:enemies,battle:c.battle});await c.resolveEnemySpecialAction(u,action);assert.equal(enemies[1].chapterTwoCooldowns383.attack,6);assert.equal(enemies[1].chapterTwoCooldowns383.justUsed,4);assert.equal(u.commanderCooldowns397.spell,6);assert.equal(u.commanderCooldowns397.recharge,8);assert.equal(effectValue(c.battle,enemies[1].id,'spdUp','enemy'),.35);
});
test('commander regeneration and guard expire through real effect ticks instead of leaving permanent passive bonuses',async()=>{
 const enemies=team('a3_west'),u=enemies[0],c=runtime(enemies);const action=chooseEnemyAction(u,{allies:enemies,battle:c.battle});await c.resolveEnemySpecialAction(u,action);for(const e of enemies){assert.equal(e.eliteRegen,undefined);assert.equal(e.divineBarrier,0);}
 const start=main.indexOf('for(const enemy of(battle.enemies??[]).filter(e=>e.hp>0)){const regen='),end=main.indexOf('\n await flushBattleRecoveries();',start);vm.runInContext(`async function regenRound397(){${main.slice(start,end)}}`,c);
 enemies[1].hp=1;await c.regenRound397();assert.ok(enemies[1].hp>1);for(let i=0;i<4;i++)tickBattleEffects(c.battle);enemies[1].hp=1;await c.regenRound397();assert.equal(enemies[1].hp,1);assert.equal(effectValue(c.battle,u.id,'guard','enemy'),0);
});
test('real battle resume preserves old roster checkpoints and new commander names, HP, MP and CT without a reroll',()=>{
 for(const legacy of [true,false]){
  const save=fixture(),s=save.state,p=C.chapterTwoState(s);p.introComplete=true;for(let a=0;a<3;a++)p.areaClears378[a]=1;assert.equal(C.beginChapterTwoRun(s,{area:3}).ok,true);const id='a3_heart',token='checkpoint397';p.run.pending={token,encounter:id,partyIds:s.party.slice()};
  const enemies=team(id);if(legacy){enemies[0].endgameBossId='ten_divinity';enemies[0].name=C.ENCOUNTERS[id].name;enemies[1].speciesId='clockwork';enemies[1].name='旧護衛';for(const e of enemies){delete e.chapterTwoTactics382.roster397;delete e.chapterTwoTactics382.commander397;}}
  enemies[0].hp=321;enemies[0].currentMp=57;enemies[0].commanderCooldowns397={spell:9};enemies[0].commanderRevived397=true;enemies[1].hp=0;
  s.activeBattle={specialBattle:true,specialBattleType:'chapterTwo',chapterTwoEncounter:id,chapterTwoToken:token,enemies,turn:7,turnQueue:[{type:'enemy',id:'e0'}],queueIndex:0,floor:100,actionCommitted:false,enemyEffects:{},enemyStatuses:{},allyEffects:{},allyAilments:{},floorBossAliveState:{}};assert.equal(save.save(),true);const loaded=new SaveService(),before=structuredClone(loaded.state.activeBattle.enemies);
  const c={createAbilityState408,createPairState409,createSingleState410,save:loaded,C,chapterTwoUnlocked:C.chapterTwoUnlocked,chapterTwoState:C.chapterTwoState,CHAPTER_TWO_ENCOUNTERS:C.ENCOUNTERS,SPECIES,endgameCharacter,battle:null,snapshot:null,screen:'home',crypto:globalThis.crypto,hydrateExpeditionSnapshot:x=>x,activeSignatureResonances:()=>[],equippedMagicCircle:()=>null,magicCircleMarkup:()=>'',enemyMagicCircleMarkup:()=>'',createBattleRulesState:()=>({}),normalizePersistentAilments:()=>[],heroResonanceProfile:()=>({count:0}),invincibleAllianceReady:()=>false,syncPersistentAilments(){},aliveEnemies:()=>enemies.filter(e=>e.hp>0),renderBattle(){},setTimeout(){},scaledBattleDelay:x=>x};
  vm.createContext(c);vm.runInContext(extract('function hydrateEndgameEnemy(','function applyEnemyMagicCircleProfile(')+extract('function resumeSavedBattle(','function affixValue('),c);assert.equal(c.resumeSavedBattle(),true);
  assert.deepEqual(c.battle.enemies,before);assert.equal(c.battle.turn,7);assert.equal(c.battle.enemies[0].hp,321);assert.equal(c.battle.enemies[1].hp,0);assert.equal(c.battle.enemies[0].currentMp,57);assert.equal(c.battle.enemies[0].commanderCooldowns397.spell,9);assert.equal(c.screen,'chapterTwoField');
 }
});
