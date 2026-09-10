import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {SPECIES} from '../src/data/species.js';
import {CHAPTER_TWO_SPECIES383,chapterTwoCaptureChance383} from '../src/data/chapterTwoSpecies383.js';
import {CHAPTER_TWO_SPECIES384} from '../src/data/chapterTwoSpecies384.js';
import {CHAPTER_TWO_ACTIONS384,chapterTwoManaTransfer384} from '../src/chapterTwo/ChapterTwoMonsters384.js';
import {CHAPTER_TWO_SPRITES384} from '../src/data/chapterTwoSprites384.js';
import {chapterTwoFrame383,chapterTwoClipPath383,chapterTwoCanvasFrame383} from '../src/ui/ChapterTwoSprite383.js';
import {monsterVisual,hasMonsterSprite} from '../src/ui/MonsterVisual.js';
import {createMonster,calculatedStats} from '../src/models/Monster.js';
import {learnedSkills,allSpeciesSkills,chooseAutoBattleDecision,maxMp} from '../src/battle/SkillSystem.js';
import {createEnemyBattleState,chooseEnemyAction,enemyActionMpCost,specialActionInfo,specialActionMultiplier} from '../src/battle/EnemyAI.js';
import {applyBattleEffect,hasEffect,effectValue,tickBattleEffects} from '../src/battle/BattleRules.js';
import {ENCOUNTERS,chapterTwoEnemyEntries,tuneChapterTwoEnemy,chapterTwoState,selectChapterTwoArea,beginChapterTwoEncounter,settleChapterTwoEncounter,refreshChapterTwoRoaming380,CHAPTER_TWO_AREAS} from '../src/chapterTwo/ChapterTwoSystem.js';
import {eligibleEncounterSpecies,eligibleCampaignEncounterSpecies} from '../src/core/EncounterPoolSystem.js';
import {isDarkMarketMonsterAllowed} from '../src/core/SecretRoomSystem.js';
import {COMPLETE_MONSTER_CODEX,codexCollectionSummary} from '../src/core/CollectionRewardSystem.js';
import {SaveService} from '../src/services/SaveService.js';
import {BattleScreen} from '../src/ui/screens/BattleScreen.js';
const roster=Object.values(CHAPTER_TWO_SPECIES384),both=[...Object.values(CHAPTER_TWO_SPECIES383),...roster];
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const extract=(from,to)=>{const start=main.indexOf(from),end=main.indexOf(to,start);assert.ok(start>=0&&end>start);return main.slice(start,end);};
const team=id=>chapterTwoEnemyEntries(id).map((e,i)=>{const u=createEnemyBattleState(SPECIES[e.speciesId],{...e,id:`e${i}`,combatRarity:SPECIES[e.speciesId].rarity},100);tuneChapterTwoEnemy(u,id,i);return u;});
function runtime(enemies){
 const battle={enemies,party:[{id:'p',currentHp:10000,currentMp:100,maxHp:10000,maxMp:200}],turn:1,reviveCount:0,enemyEffects:{},allyEffects:{},enemyStatuses:{},allyAilments:{}};
 const c={battle,SPECIES,chapterTwoManaTransfer384,specialActionInfo,specialActionMultiplier,hasEffect,effectValue,applyBattleEffect,addBattleLog(){},battleBanner:async()=>{},battleFlash(){},applyFloorBossActionTax:async()=>{},canBattleRevive:()=>battle.reviveCount<99,queueBattleRecovery(){},flushBattleRecoveries:async()=>{},floatText:async()=>{},POSITIVE_ENEMY_EFFECTS:new Set(['atkUp','defUp','spdUp','accuracyUp','evasionUp','guard','counter']),maxMp:x=>x.maxMp??200,calculatedStats:x=>({hp:x.maxHp??10000}),heroOverheal(){},displayName:x=>x.speciesId??x.id,battleContribution:()=>null,syncInvincibleAllianceState(){},grantEnemyAuthorityShield:(e,rate)=>{for(const ally of battle.enemies.filter(x=>x.hp>0))ally._floorBossHpShield=Math.max(ally._floorBossHpShield??0,Math.floor(ally.maxHp*rate));},dispelRandomAllyBuff:()=>battle.allyEffects.p?.shift()};
 Object.assign(c,{chooseEnemyTarget:()=>battle.party[0],floorBossDomainActionMultiplier:()=>1,turnPowerMultiplier:()=>1,allyAilment:(target,id)=>(battle.allyAilments[target.id]??[]).find(a=>a.id===id),animateAttack:async()=>{},hit:10,dealEnemyHit:async(e,target,multiplier,label,crit,element,rules)=>{c.lastHit={id:target.id,multiplier,element,rules};return c.hit;}});
 vm.createContext(c);vm.runInContext(extract('async function resolveEnemySpecialAction(','async function resolveEnemyFlee('),c);vm.runInContext(extract('function recoverBattleHp(','function storeFloorBossManaNocturne('),c);vm.runInContext(extract('function reviveBattleMonster(','function recoverBattleHp('),c);return c;
}

test('set 2 has six humanoids, seven ranks and 28 actual shared learned actions',()=>{
 assert.deepEqual(roster.map(s=>s.rarity),['N','R','SR','SSR','UR','LR','神話']);assert.equal(roster.filter(s=>s.humanoid384).length,6);assert.equal(Object.keys(CHAPTER_TWO_ACTIONS384).length,28);
 for(const s of roster){const m=createMonster(s.id,{level:1500});assert.equal(learnedSkills(m).length,4);assert.equal(allSpeciesSkills(s.id).length,4);for(const k of s.authoredSkills){const player=learnedSkills(m).find(a=>a.id===k.id),enemy=specialActionInfo(k.id);for(const field of Object.keys(k))assert.deepEqual(player[field],k[field],`${s.id}: ${field}`);assert.equal(enemy.multiplier,k.power);assert.equal(specialActionMultiplier(k.id),k.power);assert.equal(enemyActionMpCost({},k.id),k.mp);}}
});
test('all fourteen species stay repeatably capturable while story slots use the Build397 roster',()=>{
 const seen=new Set();for(const [id,e] of Object.entries(ENCOUNTERS).filter(([,e])=>e.roaming&&!e.elite393)){for(const u of chapterTwoEnemyEntries(id)){seen.add(u.speciesId);assert.equal(u.boss,false);assert.equal(u.uncapturable,false);}}
 for(const s of both)assert.ok(seen.has(s.id),s.id);assert.equal(ENCOUNTERS.heart.species[0],'ch2_ryune');assert.equal(ENCOUNTERS.a4_heart.authorities[0],'ten_end');assert.equal(ENCOUNTERS.roam4_4.species[0],'ch2_ordia');assert.equal(ENCOUNTERS.roam4_3.species[0],'ch2_luxion');assert.equal(ENCOUNTERS.roam4_3.level,5200);
});
test('new enemies use six real leveled equipment slots, compatible attack weapons and distinct circles',()=>{
 for(const [id,e] of Object.entries(ENCOUNTERS).filter(([,e])=>e.chapterTwoNative384)){const enemies=team(id);assert.equal(new Set(enemies.map(u=>u.enemyMagicCircle.id)).size,enemies.length);for(const u of enemies){const s=SPECIES[u.speciesId];assert.equal(u.chapterTwoTactics382.role,e.roles?.[enemies.indexOf(u)]??s.tacticRole383);assert.equal(u.enemyGear.length,6);assert.ok(u.enemyEquipmentLevel>1);for(const k of ['hp','maxHp','atk','matk','def','mdef','spd','maxMp'])assert.ok(Number.isFinite(u[k])&&u[k]>0);if(s.chapterTwoSet384){const stat=s.authoredSkills.filter(k=>k.power>0).every(k=>k.damageClass==='magic')?'matk':'atk';assert.ok(u.enemyGear.slice(0,2).every(g=>(g.stats[stat]??0)>0),`${s.id}: ${stat}`);}}}
});
test('the sorceress blocks healing, and the chain duelist follows that target with a prepared strike',()=>{
 const enemies=team('roam2_3'),battle={turn:1,allyEffects:{},enemyEffects:{}},foes=[{id:'healthy',currentHp:100,_maxHp:100,currentMp:30},{id:'wounded',currentHp:70,_maxHp:200,currentMp:100}],context={allies:enemies,opponents:foes,battle};
 assert.equal(chooseEnemyAction(enemies[1],context),'ch2_senela__ash');assert.equal(enemies[1].chapterTwoFocus382,'wounded');battle.allyEffects.wounded=[{kind:'healDown',value:.35,turns:2}];
 assert.equal(chooseEnemyAction(enemies[0],context),'ch2_razil__sever');assert.equal(enemies[0].chapterTwoFocus382,'wounded');const reloaded=JSON.parse(JSON.stringify(enemies[0]));assert.notEqual(chooseEnemyAction(reloaded,context),'ch2_razil__sever');
 reloaded.currentMp=0;assert.equal(chooseEnemyAction(reloaded,context),'attack');reloaded.currentMp=100;reloaded.specialCooldown=3;assert.equal(chooseEnemyAction(reloaded,context),'attack');
});
test('priest AI only revives valid fallen allies and respects the battle revival cap',()=>{
 const enemies=team('roam3_3'),u=enemies.find(e=>e.speciesId==='ch2_ione'),context={allies:enemies,opponents:[{id:'p',currentHp:100}],battle:{turn:1,enemyEffects:{},reviveCount:0}};enemies[1].hp=0;
 context.battle.enemyEffects.e1=[{kind:'reviveSeal',turns:2}];assert.notEqual(chooseEnemyAction(u,context),'ch2_ione__recall');u.chapterTwoCooldowns383={};context.battle.enemyEffects.e1=[];assert.equal(chooseEnemyAction(u,context),'ch2_ione__recall');
 const copy=JSON.parse(JSON.stringify(u));assert.notEqual(chooseEnemyAction(copy,context),'ch2_ione__recall');copy.chapterTwoCooldowns383={};context.battle.reviveCount=99;assert.notEqual(chooseEnemyAction(copy,context),'ch2_ione__recall');
});
test('mimic AI bites an empowered target before stripping buffs, and player auto recognizes the same bonus',()=>{
 const enemies=team('roam4_3'),mimic=enemies.find(e=>e.speciesId==='ch2_mimelia'),context={allies:enemies,opponents:[{id:'weak',currentHp:1},{id:'buffed',currentHp:100}],battle:{turn:1,allyEffects:{buffed:[{kind:'evasionUp',value:.2,turns:2}]}}};
 assert.equal(chooseEnemyAction(mimic,context),'ch2_mimelia__bite');assert.equal(mimic.chapterTwoFocus382,'buffed');assert.equal(chooseEnemyAction(mimic,context),'ch2_mimelia__unfold');
 const m=createMonster('ch2_mimelia',{level:1500});m.currentHp=calculatedStats(m).hp;m._maxHp=m.currentHp;m.currentMp=maxMp(m);const foes=['clean','buffed'].map(id=>({id,hp:1000000,maxHp:1000000,atk:10,def:0,mdef:0,element:'neutral'}));
 const choice=chooseAutoBattleDecision(m,{party:[m],enemies:foes,turn:3,enemyEffects:{buffed:[{kind:'atkUp',value:.2,turns:2}]}});assert.equal(choice.skill?.id,'ch2_mimelia__bite');assert.equal(choice.targetId,'buffed');
});
test('actual enemy skills apply recovery suppression and prepared damage; effects expire',async()=>{
 const enemies=team('roam4_3'),c=runtime(enemies);await c.resolveEnemySpecialAction(enemies[0],'ch2_luxion__edict');assert.equal(effectValue(c.battle,'p','healDown'),.25);assert.equal(effectValue(c.battle,'p','atkDown'),.18);
 c.battle.party[0].currentHp=100;assert.equal(c.recoverBattleHp(c.battle.party[0],1000,10000),750);await c.resolveEnemySpecialAction(enemies[0],'ch2_luxion__sentence');assert.equal(c.lastHit.multiplier,1.35*1.35);
 for(let i=0;i<3;i++)tickBattleEffects(c.battle);assert.equal(effectValue(c.battle,'p','healDown'),0);assert.equal(c.recoverBattleHp(c.battle.party[0],1000,10000),1000);
});
test('actual enemy and player revival preserve remaining MP and both reject revival seal',async()=>{
 const enemies=team('roam3_3'),c=runtime(enemies),fallen=enemies[1],priest=enemies.find(e=>e.speciesId==='ch2_ione');fallen.hp=0;fallen.currentMp=70;await c.resolveEnemySpecialAction(priest,'ch2_ione__recall');assert.equal(fallen.hp,Math.floor(fallen.maxHp*.3));assert.equal(fallen.currentMp,Math.max(70,Math.floor(fallen.maxMp*.05)));assert.equal(c.battle.reviveCount,1);
 fallen.hp=0;applyBattleEffect(c.battle,fallen.id,{kind:'reviveSeal',turns:2},'enemy');await c.resolveEnemySpecialAction(priest,'ch2_ione__recall');assert.equal(fallen.hp,0);
 const p=c.battle.party[0];p.currentHp=0;p.currentMp=70;assert.equal(c.reviveBattleMonster(p,.3,.05,{speciesId:'ch2_ione'}),true);assert.equal(p.currentHp,3000);assert.equal(p.currentMp,70);p.currentHp=0;applyBattleEffect(c.battle,p.id,{kind:'reviveSeal',turns:2});assert.equal(c.reviveBattleMonster(p,.3,.05,{speciesId:'ch2_ione'}),false);
});
test('actual absorption only drains on damage, caps at remaining MP and never creates MP from an empty target',async()=>{
 const enemies=team('roam2_3'),c=runtime(enemies),u=enemies[0],p=c.battle.party[0];u.currentMp=0;p.currentMp=100;await c.resolveEnemySpecialAction(u,'ch2_razil__siphon');assert.equal(p.currentMp,76);assert.equal(u.currentMp,24);
 c.hit=0;await c.resolveEnemySpecialAction(u,'ch2_razil__siphon');assert.equal(p.currentMp,76);assert.equal(u.currentMp,24);c.hit=10;p.currentMp=3;await c.resolveEnemySpecialAction(u,'ch2_razil__siphon');assert.equal(p.currentMp,0);assert.equal(u.currentMp,27);await c.resolveEnemySpecialAction(u,'ch2_razil__siphon');assert.equal(u.currentMp,27);
 const a={currentMp:0,maxMp:100},victim={currentMp:0,maxMp:200},scope={a,skill:{chapterTwoSet384:true,mpDrain:.12},drainTargets384:[victim],chapterTwoManaTransfer384,maxMp:x=>x.maxMp,queueBattleRecovery(){},flushBattleRecoveries:async()=>{},floatText:async()=>{}};
 vm.createContext(scope);vm.runInContext('async function transfer(){'+extract('if(skill.mpDrain&&(skill.chapterTwoSet384||skill.chapterTwoSet385||skill.chapterTwoSet386||skill.chapterTwoSet387||skill.chapterTwoSet388||skill.chapterTwoSet389||skill.chapterTwoSet390||skill.chapterTwoSet391||skill.chapterTwoSet392))','else if(skill.mpDrain){')+'}',scope);await scope.transfer();assert.equal(a.currentMp,0);victim.currentMp=6;await scope.transfer();assert.equal(a.currentMp,6);assert.equal(victim.currentMp,0);scope.drainTargets384=[];victim.currentMp=100;await scope.transfer();assert.equal(a.currentMp,6);assert.equal(victim.currentMp,100);
 assert.ok(main.includes('(skill.chapterTwoSet384||skill.chapterTwoSet385||skill.chapterTwoSet386||skill.chapterTwoSet387||skill.chapterTwoSet388||skill.chapterTwoSet389||skill.chapterTwoSet390||skill.chapterTwoSet391||skill.chapterTwoSet392)&&targetTotal>0&&e.hp>0'));
});
test('priest auto resurrects and avoids trying to resurrect sealed allies',()=>{
 const m=createMonster('ch2_ione',{level:1500}),dead=createMonster('ch2_nerik',{level:1500});m.currentHp=calculatedStats(m).hp;m._maxHp=m.currentHp;m.currentMp=maxMp(m);dead.currentHp=0;dead._maxHp=calculatedStats(dead).hp;const battle={party:[m,dead],enemies:[{id:'e',hp:999999,maxHp:999999,def:100,mdef:100}],turn:3};
 assert.equal(chooseAutoBattleDecision(m,battle).skill?.id,'ch2_ione__recall');battle.allyEffects={[dead.id]:[{kind:'reviveSeal',turns:2}]};assert.notEqual(chooseAutoBattleDecision(m,battle).skill?.id,'ch2_ione__recall');
});
test('new captures are absent from Chapter I and summoning pools and survive SaveService without enemy gear',()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};const save=new SaveService(),regular=new Set(eligibleEncounterSpecies(SPECIES,999999).map(s=>s.id)),campaign=new Set(eligibleCampaignEncounterSpecies(SPECIES,100).map(s=>s.id));
 for(const s of roster){assert.equal(regular.has(s.id),false);assert.equal(campaign.has(s.id),false);assert.equal(isDarkMarketMonsterAllowed(s),false);assert.equal(s.gachaExcluded,true);assert.equal(chapterTwoCaptureChance383(s.id,.9),s.captureCap383);const m=createMonster(s.id,{level:1500,obtainedMethod:'capture'});m.currentHp=0;m.currentMp=2;save.state.monsters.push(m);}save.save();const restored=new SaveService();
 for(const s of roster){const m=restored.state.monsters.find(x=>x.speciesId===s.id);assert.equal(m.currentHp,0);assert.equal(m.currentMp,2);assert.equal(learnedSkills(m).length,4);assert.equal(m.enemyGear,undefined);assert.equal(m.enemyMagicCircle,undefined);assert.ok(codexCollectionSummary(restored.state).ownedKeys.has(`species:${s.id}`));assert.equal(COMPLETE_MONSTER_CODEX.find(x=>x.speciesId===s.id).group,'第二章');}
});
test('completed saves can reach every new room without losing keys, vault rewards or the first seven habitats',()=>{
 const state={player:{maxFloor:100},campaign100:{finalCompleted:true,finalUnlocked:true},party:['m'],monsters:[createMonster('slime',{level:100})]};state.monsters[0].id='m';const p=chapterTwoState(state);p.introComplete=true;p.endingComplete378=true;
 for(const a of CHAPTER_TWO_AREAS){p.areaClears378[a.id]=1;p.runs378[a.id]={area:a.id,room:0,serial:a.id+1,defeated:[...a.keys],visited:[0,1,2,3,4,5],keys380:a.keys.slice(1,3),completed:true,roaming380:[],visit380:0};p.vaults380[a.id]={defeated:true,chests:[0,1,2]};}p.clears=1;
 const seen=new Set();for(const area of CHAPTER_TWO_AREAS){assert.equal(selectChapterTwoArea(state,area.id).ok,true);for(let visit=0;visit<2;visit++){refreshChapterTwoRoaming380(state);for(const room of [1,3,4]){p.run.room=room;const id=`roam${area.id}_${room}`,attempt=beginChapterTwoEncounter(state,id);assert.equal(attempt.ok,true);assert.equal(beginChapterTwoEncounter(state,id).token,attempt.token);for(const e of chapterTwoEnemyEntries(id,p.run))seen.add(e.speciesId);assert.equal(settleChapterTwoEncounter(state,attempt.token,{won:false}).ok,true);}assert.deepEqual(p.run.defeated,area.keys);assert.deepEqual(p.vaults380[area.id].chests,[0,1,2]);}}
 for(const s of both)assert.ok(seen.has(s.id),s.id);assert.equal(p.endingComplete378,true);
});
test('all 56 transparent pose regions fit 256px, use disjoint clip paths and render on canvas',()=>{
 const originalDocument=globalThis.document,originalImage=globalThis.Image;let clips=0,draws=0;
 globalThis.Image=class{set src(value){this.onload();}};globalThis.document={createElement:()=>({getContext:()=>({translate(){},scale(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(rule){assert.equal(rule,'evenodd');clips++;},drawImage(){draws++;}})})};
 try{for(const s of roster){assert.ok(hasMonsterSprite(s.id));const atlas=CHAPTER_TWO_SPRITES384[s.id],bytes=fs.readFileSync(new URL('../'+atlas.url.split('?')[0],import.meta.url));assert.equal(bytes[25],6);assert.equal(Object.keys(atlas.frames).length,8);for(const [name,region] of Object.entries(atlas.frames)){const f=chapterTwoFrame383(s.id,name);assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=256&&f.y+f.height<=256);assert.ok(chapterTwoClipPath383(region).startsWith('M'));const canvas=chapterTwoCanvasFrame383(s.id,name);assert.equal(canvas.width,256);assert.equal(canvas.height,256);}assert.match(monsterVisual(s.id),/clip-rule="evenodd"/);}}finally{globalThis.document=originalDocument;globalThis.Image=originalImage;}
 assert.equal(clips,56);assert.equal(draws,56);
});
test('new battle names and ranks remain above art, and the gallery includes all eight motion controls',()=>{
 const enemies=team('roam4_3'),html=BattleScreen({specialBattle:true,specialBattleType:'chapterTwo',party:[],enemies,turnQueue:[],turn:1},{},{});for(const e of enemies){const start=html.indexOf(`data-enemy-target="${e.id}"`),end=html.indexOf('side-unit-sprite',start);assert.ok(html.slice(start,end).includes(e.name));assert.ok(html.slice(start,end).includes('combat-rank-badge'));}
 const gallery=fs.readFileSync(new URL('../artifacts/build384/monsters.html',import.meta.url),'utf8');for(const s of roster)assert.ok(gallery.includes(s.name));for(const motion of ['idle1','idle2','idle3','walk1','walk2','attack','damage','down'])assert.ok(gallery.includes(`data-motion="${motion}"`));assert.ok(!gallery.includes("from '../"));
});
