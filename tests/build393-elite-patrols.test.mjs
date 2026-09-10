import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import * as C from '../src/chapterTwo/ChapterTwoSystem.js';
import {CHAPTER_TWO_ELITE_SQUADS393 as squads,CHAPTER_TWO_ELITE_TIERS393 as tiers,chapterTwoEliteUnlockedTier393} from '../src/chapterTwo/ChapterTwoElite393.js';
import {prioritizeChapterTwoTargets393} from '../src/chapterTwo/ChapterTwoTargeting393.js';
import {chapterTwoElitePanel393} from '../src/chapterTwo/ChapterTwoElitePanel393.js';
import {RESONANCE_PAIRS385,resolveTwin385} from '../src/battle/TwinResonance385.js';
import {endgameCharacter} from '../src/data/endgameCharacters.js';
import {SPECIES} from '../src/data/species.js';import {createMonster,calculatedStats} from '../src/models/Monster.js';
import {SaveService} from '../src/services/SaveService.js';
import {createEnemyBattleState,chooseEnemyAction} from '../src/battle/EnemyAI.js';
import {chapterTwoRoamingId391} from '../src/chapterTwo/ChapterTwoMonsters391.js';
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
function fixture(area=0){const mem=new Map();globalThis.localStorage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};const save=new SaveService(),s=save.state;s.player.maxFloor=100;s.campaign100.finalCompleted=true;const p=C.chapterTwoState(s);p.introComplete=true;for(let a=0;a<5;a++){p.areaClears378[a]=1;assert.equal(C.beginChapterTwoRun(s,{area:a}).ok,true);const r=p.run;r.defeated=C.CHAPTER_TWO_AREAS[a].keys.slice();r.keys380=r.defeated.slice(1,3);r.chest=true;r.vault380.defeated=true;r.vault380.chests=[0,1,2,3,4,5,6,7,8,9];C.chapterTwoState(s);}p.run=p.runs378[area];s.monsters.forEach(m=>{m.currentHp=23;m.currentMp=5;});return{save,s,p,r:p.run};}
function team(id,tier=1){const run={eliteTier393:tier};return C.chapterTwoEnemyEntries(id,run).map((entry,i)=>{const e=createEnemyBattleState(SPECIES[entry.speciesId],{...entry,id:'enemy'+i},100);C.tuneChapterTwoEnemy(e,id,i,run);return e;});}
function sweep(s){const r=C.chapterTwoState(s).run,results=[];for(const room of [1,3,4]){r.room=room;const attempt=C.beginChapterTwoEncounter(s,`roam${r.area}_${room}`);assert.equal(attempt.ok,true);results.push(C.settleChapterTwoEncounter(s,attempt.token,{won:true}));}return results;}

test('15 elite formations use 60 distinct existing monsters and preserve all 24 complete pairs',()=>{
 assert.equal(squads.length,15);assert.equal(new Set(squads.flatMap(s=>s.species)).size,60);
 for(const p of RESONANCE_PAIRS385)assert.equal(squads.filter(s=>p.members.every(id=>s.species.includes(id))).length,1,p.id);
 for(const s of squads){assert.equal(s.species.length,4);assert.equal(new Set(s.species).size,4);assert.equal(s.circles.length,4);assert.ok(s.hint.length>20);assert.ok(s.species.every(id=>SPECIES[id].chapterTwoOnly));}
});
test('old completed saves can start tier one without healing, reopening vaults or changing story and keys',()=>{
 const {s,p,r}=fixture(),vitals=s.monsters.map(m=>[m.currentHp,m.currentMp]),vault=structuredClone(r.vault380),keys=r.keys380.slice(),clears=structuredClone(p.areaClears378),serial=r.serial;
 assert.equal(chapterTwoEliteUnlockedTier393(p,0),1);assert.equal(C.beginChapterTwoElite393(s,0,1).ok,true);assert.equal(r.eliteTier393,1);assert.equal(r.serial,serial);assert.deepEqual(s.monsters.map(m=>[m.currentHp,m.currentMp]),vitals);assert.deepEqual(r.vault380,vault);assert.deepEqual(r.keys380,keys);assert.deepEqual(p.areaClears378,clears);assert.equal(r.chest,true);assert.equal(r.room,0);
});
test('invalid, locked and unfinished entries are rejected; pending battles cannot change modes or tiers',()=>{
 const {s,p,r}=fixture();for(const tier of [0,2,3,NaN,Infinity,1.5])assert.equal(C.beginChapterTwoElite393(s,0,tier).ok,false);
 assert.equal(C.beginChapterTwoElite393(s,99).ok,false);r.defeated.pop();assert.equal(C.beginChapterTwoElite393(s,0).ok,false);r.defeated=C.CHAPTER_TWO_AREAS[0].keys.slice();
 assert.equal(C.beginChapterTwoElite393(s,0).ok,true);r.room=1;const a=C.beginChapterTwoEncounter(s,'roam0_1'),visit=r.visit380;
 assert.equal(C.beginChapterTwoElite393(s,0).ok,false);assert.equal(C.beginChapterTwoElite393(s,1).ok,false);C.refreshChapterTwoRoaming380(s);assert.equal(r.visit380,visit);assert.equal(r.eliteTier393,1);assert.equal(C.beginChapterTwoEncounter(s,'roam0_1').token,a.token);
});
test('normal and elite patrol identities agree across world, battle, pending and room gates',()=>{
 const {s,r}=fixture(4);assert.equal(C.beginChapterTwoElite393(s,4).ok,true);r.room=3;
 const id='roam4_3_elite393',entries=C.chapterTwoEnemyEntries('roam4_3',r),w=C.chapterTwoWorld(r),marker=w.bosses.find(b=>b.id===id);
 assert.ok(marker.active);assert.equal(marker.chapterEnemy.level,entries[0].level);assert.deepEqual(entries.map(e=>e.speciesId),C.ENCOUNTERS[id].species);
 assert.equal(C.beginChapterTwoEncounter(s,'roam4_3_392').ok,false);assert.equal(C.beginChapterTwoEncounter(s,'roam3_1_elite393').ok,false);assert.equal(C.beginChapterTwoEncounter(s,'roam4_4_elite393').ok,false);
 const a=C.beginChapterTwoEncounter(s,'roam4_3');assert.equal(a.encounter,id);assert.equal(a.eliteTier393,1);assert.equal(chapterTwoRoamingId391(r,'roam4_3',C.ENCOUNTERS),id);
});
test('three rooms pay one equipment reward, unlock the next tier, and do not replay story first-clear rewards',()=>{
 for(const area of [0,2,4]){const {s,p}=fixture(area),clears=structuredClone(p.areaClears378);for(const tier of [1,2,3]){assert.equal(C.beginChapterTwoElite393(s,area,tier).ok,true);const results=sweep(s);assert.deepEqual(results.map(r=>!!r.equipment),[false,false,true]);assert.ok(results.every(r=>r.crystals===0&&!r.firstClear&&r.eliteTier393===tier));assert.equal(results[2].equipment.rarity,tier===1?'LR':'神話');assert.equal(results[2].equipment.plus,tiers[tier].plus);assert.equal(results[2].equipment.level,Math.round(C.CHAPTER_TWO_AREAS[area].level*tiers[tier].level));assert.equal(p.eliteClears393[area],tier);assert.equal(chapterTwoEliteUnlockedTier393(p,area),Math.min(3,tier+1));const before=s.player.gold;assert.equal(C.settleChapterTwoEncounter(s,results[2].token,{won:true}).ok,false);assert.equal(s.player.gold,before);assert.equal(C.beginChapterTwoEncounter(s,`roam${area}_4`).ok,false);}assert.deepEqual(p.areaClears378,clears);}
});
test('defeat gives no rewards or unlock and SaveService resume preserves tier, visit, pending and progress',()=>{
 const {save,s,r}=fixture();C.beginChapterTwoElite393(s,0);r.room=1;let a=C.beginChapterTwoEncounter(s,'roam0_1'),gold=s.player.gold;assert.equal(C.settleChapterTwoEncounter(s,a.token,{won:false}).ok,true);assert.equal(s.player.gold,gold);assert.equal(chapterTwoEliteUnlockedTier393(C.chapterTwoState(s),0),1);
 a=C.beginChapterTwoEncounter(s,'roam0_1');C.settleChapterTwoEncounter(s,a.token,{won:true});save.save();const loaded=new SaveService(),p=C.chapterTwoState(loaded.state),visit=p.run.visit380;
 assert.equal(C.beginChapterTwoElite393(loaded.state,0,1,{resume:true}).ok,true);assert.deepEqual(p.run.roaming380,['roam0_1']);assert.equal(p.run.visit380,visit);p.run.room=3;a=C.beginChapterTwoEncounter(loaded.state,'roam0_3');loaded.save();const checkpoint=new SaveService();assert.equal(C.beginChapterTwoEncounter(checkpoint.state,'roam0_3').token,a.token);assert.equal(C.chapterTwoState(checkpoint.state).run.eliteTier393,1);
});
test('ordinary reentry restores normal rotations and every existing capture route',()=>{
 const {s,r}=fixture();C.beginChapterTwoElite393(s,0);C.refreshChapterTwoRoaming380(s);assert.equal(r.eliteTier393,undefined);assert.equal(C.chapterTwoEnemyEntries('roam0_1',r)[0].speciesId,C.ENCOUNTERS.roam0_1.species[0]);
 const seen=new Set();for(const [id,e] of Object.entries(C.ENCOUNTERS).filter(([,e])=>e.roaming&&!e.roamingBase391))for(const visit380 of [0,1])for(const u of C.chapterTwoEnemyEntries(id,{visit380})){assert.equal(u.uncapturable,false);seen.add(u.speciesId);}
 assert.equal(seen.size,70);assert.equal(Object.values(SPECIES).filter(s=>s.chapterTwoOnly).length,70);
});
test('all tiers use six actual gear slots and authored circles, capture rules, and scale independently of player challenge flags',()=>{
 for(const squad of squads){let previous;for(const tier of [1,2,3]){const units=team(squad.id,tier);for(const [i,u] of units.entries()){assert.equal(u.enemyGear.length,6);assert.equal(u.enemyMagicCircle.id,C.ENCOUNTERS[squad.id].circles[i]);assert.equal(u.elitePolicy393,squad.policy);assert.equal(u.uncapturable,!!u.endgameBossId);assert.ok(u.enemyGear.every(g=>g.enemyOnly&&g.level>1&&g.plus>0));if(previous){assert.ok(u.maxHp>previous[i].maxHp);assert.ok(u.atk>previous[i].atk);assert.ok(u.enemyEquipmentLevel>previous[i].enemyEquipmentLevel);}}
 previous=units;}
 const a=C.chapterTwoEnemyEntries(squad.id,{eliteTier393:2}),b=C.chapterTwoEnemyEntries(squad.id,{eliteTier393:2,challengeTier:5});assert.deepEqual(a.map(u=>[u.level,u.enemyEquipmentLevel,u.enemyMagicCircle.level]),b.map(u=>[u.level,u.enemyEquipmentLevel,u.enemyMagicCircle.level]));}
});
test('elite targeting prioritizes support, wounded targets and paired enemies while honoring taunt and capture',()=>{
 const keys=['elmize','tillea','morina'],foes=keys.map(key=>{const m=createMonster('ch2_'+key,{level:1500});m.currentHp=calculatedStats(m).hp;return m;}),battle={allyEffects:{},enemies:[],party:foes};
 assert.equal(prioritizeChapterTwoTargets393({elitePolicy393:'support'},foes,battle,SPECIES)[0],foes[1]);assert.equal(prioritizeChapterTwoTargets393({elitePolicy393:'pair'},foes,battle,SPECIES)[0],foes[0]);
 foes[2].currentHp=1;assert.equal(prioritizeChapterTwoTargets393({elitePolicy393:'wounded'},foes,battle,SPECIES)[0],foes[2]);foes[2].captured=true;assert.equal(prioritizeChapterTwoTargets393({elitePolicy393:'wounded'},foes,battle,SPECIES).includes(foes[2]),false);
 battle.allyEffects[foes[0].id]=[{kind:'taunt',turns:2}];assert.deepEqual(prioritizeChapterTwoTargets393({elitePolicy393:'support'},foes,battle,SPECIES),[foes[0]]);assert.equal(prioritizeChapterTwoTargets393({},foes,battle,SPECIES),foes);
});
test('actual elite AI establishes sleep on the selected support then pursues the marked victim, with MP and cooldown limits',()=>{
 const enemies=team('roam1_3_elite393'),foes=['ch2_elmize','ch2_tillea'].map(id=>{const m=createMonster(id,{level:1500});m.currentHp=calculatedStats(m).hp;return m;}),battle={turn:1,allyEffects:{},allyAilments:{},enemyEffects:{},enemyStatuses:{},enemies,party:foes};
 assert.equal(chooseEnemyAction(enemies[0],{allies:enemies,opponents:foes,battle}),'ch2_morina__lull');assert.equal(enemies[0].chapterTwoFocus382,foes[1].id);
 battle.allyAilments[foes[1].id]=[{id:'sleep',turns:1}];assert.equal(chooseEnemyAction(enemies[1],{allies:enemies,opponents:foes,battle}),'ch2_elmize__harvest');assert.equal(enemies[1].chapterTwoFocus382,foes[1].id);
 enemies[1].currentMp=0;assert.equal(chooseEnemyAction(enemies[1],{allies:enemies,opponents:foes,battle}),'attack');assert.ok(enemies[1].chapterTwoCooldowns383.ch2_elmize__harvest>battle.turn);
});
test('departure preview exposes all three squads, real loadouts, tier locks and resume; objective follows remaining patrols',()=>{
 const {s,r}=fixture(3);let html=chapterTwoElitePanel393(s,3);assert.equal((html.match(/data-depart-elite="/g)??[]).length,3);assert.match(html,/data-depart-elite="2" disabled/);for(const squad of squads.filter(s=>s.area===3))for(const u of C.chapterTwoEnemyEntries(squad.id,{eliteTier393:1}))assert.ok(html.includes(endgameCharacter(u.endgameBossId)?.name??SPECIES[u.speciesId].name));
 C.beginChapterTwoElite393(s,3);html=chapterTwoElitePanel393(s,3);assert.match(html,/data-depart-elite-resume/);assert.equal(C.chapterTwoObjective(r).targetRoom,1);r.roaming380=['roam3_1'];assert.equal(C.chapterTwoObjective(r).targetRoom,3);r.roaming380.push('roam3_3','roam3_4');assert.equal(C.chapterTwoObjective(r).targetRoom,null);
 assert.ok(main.includes('chapterTwoElitePanel393(save.state,selected)'));assert.ok(main.includes('eliteResume:true'));assert.ok(main.includes('eliteTier:tier'));assert.match(fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),/build393-elite\.css/);
});
test('real departure entry starts and resumes elite patrols without calling ordinary refresh or confirmation',()=>{
 const {s,r}=fixture();let entered=0;const scope={save:{state:s},battle:null,chapterTwoState:C.chapterTwoState,chapterTwoAreaUnlocked:C.chapterTwoAreaUnlocked,beginChapterTwoElite393:C.beginChapterTwoElite393,chapterTwoCommit:f=>f(),showToast:m=>{throw Error(m)},confirm:()=>{throw Error('unexpected confirmation')},refreshChapterTwoRoaming380:()=>{throw Error('ordinary refresh would lose mode')},stopGame(){},snapshot:null,go:()=>entered++};vm.createContext(scope);const start=main.indexOf('function enterChapterTwoForest('),end=main.indexOf('function departureParty379(',start);vm.runInContext(main.slice(start,end),scope);scope.enterChapterTwoForest({area:0,eliteTier:1});assert.equal(r.eliteTier393,1);r.roaming380=['roam0_1'];const visit=r.visit380;scope.enterChapterTwoForest({area:0,eliteResume:true});assert.equal(entered,2);assert.equal(r.visit380,visit);assert.deepEqual(r.roaming380,['roam0_1']);
});
test('failed final-reward save rolls back gold, equipment and tier unlock; one retry pays once and persists the unlock',()=>{
 const {save,s,r}=fixture();C.beginChapterTwoElite393(s,0);for(const room of [1,3]){r.room=room;const a=C.beginChapterTwoEncounter(s,`roam0_${room}`);C.settleChapterTwoEncounter(s,a.token,{won:true});}r.room=4;const a=C.beginChapterTwoEncounter(s,'roam0_4'),gold=s.player.gold,equipment=JSON.stringify(s.equipment),saved=save.save.bind(save);let fail=true;
 save.save=()=>fail?false:saved();const c={save,game:null,showToast(){}};vm.createContext(c);vm.runInContext(main.slice(main.indexOf('function chapterTwoCommit('),main.indexOf('let chapterTwoIntroTimer=')),c);
 const result=c.chapterTwoCommit(()=>C.settleChapterTwoEncounter(save.state,a.token,{won:true}));assert.equal(result.saveFailed,true);assert.equal(save.state.player.gold,gold);assert.equal(JSON.stringify(save.state.equipment),equipment);assert.equal(C.chapterTwoState(save.state).run.pending.token,a.token);assert.equal(chapterTwoEliteUnlockedTier393(C.chapterTwoState(save.state),0),1);
 fail=false;assert.equal(c.chapterTwoCommit(()=>C.settleChapterTwoEncounter(save.state,a.token,{won:true})).ok,true);const loaded=new SaveService();assert.equal(chapterTwoEliteUnlockedTier393(C.chapterTwoState(loaded.state),0),2);assert.equal(C.beginChapterTwoElite393(loaded.state,0,2).ok,true);assert.equal(C.settleChapterTwoEncounter(save.state,a.token,{won:true}).ok,false);
});
