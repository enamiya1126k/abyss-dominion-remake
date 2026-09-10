import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {SPECIES} from '../src/data/species.js';
import {CHAPTER_TWO_SPECIES383,chapterTwoCaptureChance383} from '../src/data/chapterTwoSpecies383.js';
import {CHAPTER_TWO_ACTIONS383} from '../src/chapterTwo/ChapterTwoMonsters383.js';
import {CHAPTER_TWO_SPRITES383} from '../src/data/chapterTwoSprites383.js';
import {chapterTwoFrame383,chapterTwoFrameBounds383,chapterTwoClipPath383} from '../src/ui/ChapterTwoSprite383.js';
import {monsterVisual,hasMonsterSprite,setMonsterVisualFrame} from '../src/ui/MonsterVisual.js';
import {createMonster,calculatedStats,speciesLevelStats} from '../src/models/Monster.js';
import {learnedSkills,allSpeciesSkills,chooseAutoBattleDecision,skillDamage} from '../src/battle/SkillSystem.js';
import {createEnemyBattleState,chooseEnemyAction,enemyActionMpCost,specialActionInfo,specialActionMultiplier} from '../src/battle/EnemyAI.js';
import {applyBattleEffect,hasEffect,effectValue,tickBattleEffects} from '../src/battle/BattleRules.js';
import {ENCOUNTERS,chapterTwoEnemyEntries,tuneChapterTwoEnemy,chapterTwoState,selectChapterTwoArea,beginChapterTwoEncounter,settleChapterTwoEncounter,refreshChapterTwoRoaming380,CHAPTER_TWO_AREAS} from '../src/chapterTwo/ChapterTwoSystem.js';
import {eligibleEncounterSpecies,eligibleCampaignEncounterSpecies} from '../src/core/EncounterPoolSystem.js';
import {isDarkMarketMonsterAllowed} from '../src/core/SecretRoomSystem.js';
import {COMPLETE_MONSTER_CODEX,codexCollectionSummary} from '../src/core/CollectionRewardSystem.js';
import {SaveService} from '../src/services/SaveService.js';
import {BattleScreen} from '../src/ui/screens/BattleScreen.js';
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const extract=(from,to)=>main.slice(main.indexOf(from),main.indexOf(to,main.indexOf(from)));
const roster=Object.values(CHAPTER_TWO_SPECIES383);
const team=id=>chapterTwoEnemyEntries(id).map((e,i)=>{const unit=createEnemyBattleState(SPECIES[e.speciesId],{...e,id:`e${i}`,combatRarity:SPECIES[e.speciesId].rarity},100);tuneChapterTwoEnemy(unit,id,i);return unit;});

test('seven native ranks have four learned authored skills each, preserved through the shared skill pipeline',()=>{
 assert.deepEqual(roster.map(s=>s.rarity),['N','R','SR','SSR','UR','LR','神話']);
 assert.equal(Object.keys(CHAPTER_TWO_ACTIONS383).length,28);
 for(const s of roster){const m=createMonster(s.id,{level:1500}),learned=learnedSkills(m);assert.equal(learned.length,4);assert.equal(allSpeciesSkills(s.id).length,4);
  for(const authored of s.authoredSkills){const player=learned.find(k=>k.id===authored.id),enemy=specialActionInfo(authored.id);assert.ok(player&&enemy);for(const key of ['name','mp','power','cooldown','heal','status','effects','bonusVsStatus','bonusVsEffect'])assert.deepEqual(player[key],authored[key],`${s.id}:${key}`);assert.equal(enemy.multiplier,player.power);assert.equal(enemyActionMpCost({},authored.id),player.mp);}
 }
});
test('native magical attack and defense use authored stats, leaving legacy stat calculation intact',()=>{
 for(const id of ['ch2_noctia','ch2_astera']){const stats=speciesLevelStats(id,1500);assert.ok(stats.matk>stats.atk*2);assert.ok(stats.mdef>stats.def);}
 const physical=speciesLevelStats('ch2_velg',1500);assert.ok(physical.atk>physical.matk*2);
 const legacy=speciesLevelStats('slime',1500);assert.equal(legacy.matk,Math.floor(legacy.atk*.72));
});
test('native creatures are absent from Chapter I encounter and ordinary market/summon pools',()=>{
 const regular=new Set(eligibleEncounterSpecies(SPECIES,999999).map(s=>s.id)),campaign=new Set(eligibleCampaignEncounterSpecies(SPECIES,100).map(s=>s.id));
 for(const s of roster){assert.equal(regular.has(s.id),false);assert.equal(campaign.has(s.id),false);assert.equal(isDarkMarketMonsterAllowed(s),false);assert.equal(s.gachaExcluded,true);}
});
test('every new creature has a repeatable capturable habitat; story slots use the Build397 roster',()=>{
 const repeatable=Object.entries(ENCOUNTERS).filter(([,e])=>e.roaming&&!e.elite393),seen=new Set();
 for(const [id] of repeatable)for(const e of chapterTwoEnemyEntries(id)){seen.add(e.speciesId);assert.equal(e.boss,false);assert.equal(e.uncapturable,false);}
 for(const s of roster)assert.ok(seen.has(s.id),s.id);
 assert.equal(ENCOUNTERS.heart.species[0],'ch2_ryune');assert.equal(ENCOUNTERS.a4_heart.authorities[0],'ten_end');
 assert.ok(ENCOUNTERS.roam4_4.level>ENCOUNTERS.a4_patrol.level);
});
test('new species choose compatible physical/magical gear, unique circles and finite enemy stats',()=>{
 for(const [id,e] of Object.entries(ENCOUNTERS).filter(([,e])=>e.chapterTwoNative383)){
  const enemies=team(id);assert.equal(new Set(enemies.map(e=>e.enemyMagicCircle.id)).size,enemies.length);
  for(const u of enemies){assert.equal(u.chapterTwoTactics382.role,e.roles?.[enemies.indexOf(u)]??SPECIES[u.speciesId].tacticRole383);assert.equal(u.enemyGear.length,6);assert.ok(u.enemyEquipmentLevel>1);for(const k of ['hp','maxHp','atk','matk','def','mdef','spd','maxMp'])assert.ok(Number.isFinite(u[k])&&u[k]>0);if(['ch2_shelza','ch2_velg'].includes(u.speciesId))assert.ok(u.enemyGear.slice(0,2).every(g=>(g.stats.atk??0)>0));}
 }
});
test('AI follows poison, slow and exposure combinations instead of always choosing the weakest victim',()=>{
 for(const [id,index,mark,skill] of [['roam1_4',0,'poison','ch2_shelza__pursuit'],['roam3_1',0,'spdDown','ch2_noctia__icicle'],['roam4_4',0,'vulnerable','ch2_ordia__verdict']]){
  const enemies=team(id),u=enemies.find(e=>e.speciesId===skill.split('__')[0]),battle={turn:1,allyEffects:{marked:[{kind:mark,turns:2}]},allyAilments:{marked:[{id:mark}]}},opponents=[{id:'weak',currentHp:1},{id:'marked',currentHp:9999}];
  assert.equal(chooseEnemyAction(u,{allies:enemies,opponents,battle}),skill);assert.equal(u.chapterTwoFocus382,'marked');
  const restored=JSON.parse(JSON.stringify(u));assert.notEqual(chooseEnemyAction(restored,{allies:enemies,opponents,battle}),skill);
 }
});
test('AI heals or cleanses only when needed, pays finite MP, respects seal and saved cooldowns',()=>{
 const enemies=team('roam4_4'),u=enemies.find(e=>e.speciesId==='ch2_astera'),battle={turn:1,enemyStatuses:{},enemyEffects:{}},context={allies:enemies,opponents:[{id:'p',currentHp:100}],battle};
 enemies[0].hp=1;assert.equal(chooseEnemyAction(u,context),'ch2_astera__mend');
 battle.enemyStatuses.e1=[{id:'poison'}];assert.equal(chooseEnemyAction(u,context),'ch2_astera__cleanse');
 const reload=JSON.parse(JSON.stringify(u));assert.notEqual(chooseEnemyAction(reload,context),'ch2_astera__cleanse');
 u.currentMp=0;assert.equal(chooseEnemyAction(u,context),'attack');
 u.currentMp=u.maxMp;u.specialCooldown=3;assert.equal(chooseEnemyAction(u,context),'attack');assert.equal(u.specialCooldown,2);
});
test('dispel is selected against buffs, ordinary attacks remain possible when all native skills are unavailable',()=>{
 const enemies=team('roam2_4'),u=enemies.find(e=>e.speciesId==='ch2_velg'),battle={turn:1,allyEffects:{p:[{kind:'atkUp',turns:2}]}},context={allies:enemies,opponents:[{id:'p',currentHp:100}],battle};
 assert.equal(chooseEnemyAction(u,context),'ch2_velg__unseal');
 u.chapterTwoCooldowns383=Object.fromEntries(SPECIES[u.speciesId].authoredSkills.map(k=>[k.id,10]));assert.equal(chooseEnemyAction(u,context),'attack');
});
function runtime(enemies){
 const battle={enemies,party:[{id:'p',currentHp:10000,currentMp:100,maxHp:10000}],turn:1,enemyEffects:{},allyEffects:{},enemyStatuses:{},allyAilments:{}};
 const c={battle,specialActionInfo,specialActionMultiplier,hasEffect,applyBattleEffect,addBattleLog(){},battleBanner:async()=>{},battleFlash(){},applyFloorBossActionTax:async()=>{},canBattleRevive:()=>true,queueBattleRecovery(){},flushBattleRecoveries:async()=>{},floatText:async()=>{},POSITIVE_ENEMY_EFFECTS:new Set(['atkUp','defUp','spdUp','guard','counter']),recoverFloorBossHp:(e,n)=>{const before=e.hp;e.hp=Math.min(e.maxHp,e.hp+n);return e.hp-before},grantEnemyAuthorityShield:(e,rate)=>{for(const ally of battle.enemies.filter(x=>x.hp>0))ally._floorBossHpShield=Math.max(ally._floorBossHpShield??0,Math.floor(ally.maxHp*rate));},dispelRandomAllyBuff:()=>{c.dispelled=true;return battle.allyEffects.p?.shift();}};
 Object.assign(c,{chooseEnemyTarget:()=>battle.party[0],floorBossDomainActionMultiplier:()=>1,turnPowerMultiplier:()=>1,allyAilment:(target,id)=>(battle.allyAilments[target.id]??[]).find(a=>a.id===id),animateAttack:async()=>{},dealEnemyHit:async(e,target,multiplier,label,crit,element,rules)=>{c.lastHit={id:target.id,multiplier,element,rules};return 10;}});
 vm.createContext(c);vm.runInContext(extract('async function resolveEnemySpecialAction(','async function resolveEnemyFlee('),c);return c;
}
test('actual enemy resolver applies new healing, cleansing, temporary buffs and bounded barriers',async()=>{
 const enemies=team('roam4_4'),c=runtime(enemies),u=enemies.find(e=>e.speciesId==='ch2_astera');enemies.forEach(e=>e.hp=1);
 await c.resolveEnemySpecialAction(u,'ch2_astera__mend');for(const e of enemies)assert.equal(e.hp,1+Math.floor(e.maxHp*.18));
 c.battle.enemyStatuses.e0=[{id:'poison'}];c.battle.enemyEffects.e0=[{kind:'defDown'},{kind:'atkUp',turns:2,value:.1}];
 await c.resolveEnemySpecialAction(u,'ch2_astera__cleanse');assert.equal(c.battle.enemyStatuses.e0.length,0);assert.equal(c.battle.enemyEffects.e0.length,1);
 const atk=u.atk;await c.resolveEnemySpecialAction(u,'ch2_astera__weave');await c.resolveEnemySpecialAction(u,'ch2_astera__weave');assert.equal(u.atk,atk);assert.equal(u._floorBossHpShield,Math.floor(u.maxHp*.1));assert.equal(effectValue(c.battle,u.id,'atkUp','enemy'),.16);
 for(let i=0;i<3;i++)tickBattleEffects(c.battle);assert.equal(effectValue(c.battle,u.id,'atkUp','enemy'),0);
 await c.resolveEnemySpecialAction(enemies[0],'ch2_ordia__gate');assert.equal(u._floorBossHpShield,Math.floor(u.maxHp*.12));
});
test('actual enemy resolver applies exposure then boosted pursuit, and one-buff dispel',async()=>{
 const enemies=team('roam4_4'),c=runtime(enemies);
 await c.resolveEnemySpecialAction(enemies[0],'ch2_ordia__mark');assert.equal(effectValue(c.battle,'p','vulnerable'),.14);
 await c.resolveEnemySpecialAction(enemies[0],'ch2_ordia__verdict');assert.equal(c.lastHit.multiplier,1.4*1.4);
 c.battle.allyEffects.p=[{kind:'atkUp',turns:3,value:.3}];await c.resolveEnemySpecialAction(enemies[1],'ch2_velg__unseal');assert.equal(c.dispelled,true);assert.equal(c.battle.allyEffects.p.length,0);
 const forest=team('roam1_4');c.battle.allyAilments.p=[{id:'poison'}];await c.resolveEnemySpecialAction(forest.find(e=>e.speciesId==='ch2_shelza'),'ch2_shelza__pursuit');assert.equal(c.lastHit.multiplier,1.2*1.5);
});
test('player auto battle recognizes native poisoned-target pursuit and emergency group healing',()=>{
 const m=createMonster('ch2_shelza',{level:1500}),stats=calculatedStats(m);m.currentMp=10000;m.currentHp=stats.hp;m._maxHp=stats.hp;
 const enemies=[{id:'clean',hp:100000,maxHp:100000,atk:10,def:0,mdef:0,element:'neutral'},{id:'poisoned',hp:100000,maxHp:100000,atk:10,def:0,mdef:0,element:'neutral'}],battle={party:[m],enemies,turn:3,enemyStatuses:{poisoned:[{id:'poison'}]},autoBattleStats:{[m.id]:stats}};
 const choice=chooseAutoBattleDecision(m,battle);assert.equal(choice.skill?.id,'ch2_shelza__pursuit');assert.equal(choice.targetId,'poisoned');
 const healer=createMonster('ch2_astera',{level:1500});healer._maxHp=calculatedStats(healer).hp;healer.currentHp=1;healer.currentMp=9999;battle.party=[healer,m];m.currentHp=1;
 assert.equal(chooseAutoBattleDecision(healer,battle).skill?.id,'ch2_astera__mend');
});
test('actual player effect resolver applies native shields and temporary buffs',()=>{
 const m=createMonster('ch2_balk',{level:1500}),other=createMonster('ch2_kororu',{level:1500}),battle={party:[m,other],enemies:[],allyEffects:{},enemyEffects:{}};
 m.currentHp=calculatedStats(m).hp;other.currentHp=calculatedStats(other).hp;
 const c={battle,applyBattleEffect,calculatedStats,displayName:x=>x.speciesId,addBattleLog(){},affixValue:()=>0,aliveEnemies:()=>[],POSITIVE_ENEMY_EFFECTS:new Set()};vm.createContext(c);vm.runInContext(extract('function applySkillEffects(','function applyRevivedSkillEffects('),c);
 c.applySkillEffects(learnedSkills(m).find(k=>k.id==='ch2_balk__shelter'),m,null);
 assert.equal(battle.circleShields[other.id],Math.floor(calculatedStats(other).hp*.08));assert.equal(effectValue(battle,other.id,'defUp'),.18);
});
test('capture caps preserve legacy chance and captured native monsters survive a real SaveService roundtrip',()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
 const save=new SaveService();
 for(const s of roster){assert.equal(chapterTwoCaptureChance383(s.id,.9),s.captureCap383);assert.equal(chapterTwoCaptureChance383(s.id,.05),.05);const m=createMonster(s.id,{level:1500,obtainedMethod:'capture'});m.currentHp=0;m.currentMp=2;save.state.monsters.push(m);}
 assert.equal(chapterTwoCaptureChance383('slime',.65),.65);save.save();const reload=new SaveService();
 for(const s of roster){const m=reload.state.monsters.find(m=>m.speciesId===s.id);assert.ok(m);assert.equal(m.currentHp,0);assert.equal(m.currentMp,2);assert.equal(learnedSkills(m).length,4);assert.equal(m.enemyGear,undefined);assert.equal(m.enemyMagicCircle,undefined);assert.ok(codexCollectionSummary(reload.state).ownedKeys.has(`species:${s.id}`));}
});
test('completed old saves can encounter all natives without resetting story, keys or one-time vault rewards',()=>{
 const state={player:{maxFloor:100},campaign100:{finalCompleted:true,finalUnlocked:true},party:['m'],monsters:[createMonster('slime',{level:100})]};state.monsters[0].id='m';const p=chapterTwoState(state);p.introComplete=true;p.endingComplete378=true;
 for(const a of CHAPTER_TWO_AREAS){p.areaClears378[a.id]=1;p.runs378[a.id]={area:a.id,room:0,serial:a.id+1,defeated:[...a.keys],visited:[0,1,2,3,4,5],keys380:a.keys.slice(1,3),completed:true,roaming380:[],visit380:0};p.vaults380[a.id]={defeated:true,chests:[0,1,2]};}p.clears=1;
 const seen=new Set();for(const a of CHAPTER_TWO_AREAS){assert.equal(selectChapterTwoArea(state,a.id).ok,true);for(let visit=0;visit<2;visit++){refreshChapterTwoRoaming380(state);for(const room of [1,3,4]){p.run.room=room;const id=`roam${a.id}_${room}`,attempt=beginChapterTwoEncounter(state,id);assert.equal(attempt.ok,true);assert.equal(beginChapterTwoEncounter(state,id).token,attempt.token);for(const e of chapterTwoEnemyEntries(id,p.run))seen.add(e.speciesId);assert.equal(settleChapterTwoEncounter(state,attempt.token,{won:false}).ok,true);assert.deepEqual(p.run.defeated,a.keys);assert.deepEqual(p.vaults380[a.id].chests,[0,1,2]);}}}
 for(const s of roster)assert.ok(seen.has(s.id));assert.equal(p.endingComplete378,true);
});
test('all seven species have transparent PNG atlases with eight distinct in-range frame descriptions',()=>{
 for(const s of roster){const atlas=CHAPTER_TWO_SPRITES383[s.id],bytes=fs.readFileSync(new URL('../'+atlas.url.split('?')[0],import.meta.url));assert.equal(bytes.readUInt32BE(16),atlas.width);assert.equal(bytes.readUInt32BE(20),atlas.height);assert.equal(bytes[25],6);assert.equal(Object.keys(atlas.frames).length,8);assert.equal(new Set(Object.values(atlas.frames).map(f=>JSON.stringify(f.box))).size,8);
  for(const name of Object.keys(atlas.frames)){const f=chapterTwoFrame383(s.id,name);assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=256&&f.y+f.height<=256);assert.ok(f.left>=0&&f.top>=0&&f.left+f.sourceWidth<=atlas.width&&f.top+f.sourceHeight<=atlas.height);}
  const b=chapterTwoFrameBounds383(s.id);assert.ok(b.top>=0&&b.bottom<1);assert.ok(hasMonsterSprite(s.id));assert.match(monsterVisual(s.id),/data-monster-atlas=/);
 }
});
test('frame changes update both clipping region and state, including down and return to idle',()=>{
 const attrs={},poly={},svg={dataset:{monsterAtlas:'ch2_astera'},matches:()=>true,querySelectorAll:()=>[],querySelector:()=>({setAttribute:(k,v)=>attrs[k]=v,querySelector:()=>({setAttribute:(k,v)=>poly[k]=v})})};
 setMonsterVisualFrame(svg,'attack');const attack=attrs.viewBox;assert.equal(svg.dataset.animationState,'static');assert.equal(poly.d,chapterTwoClipPath383(CHAPTER_TWO_SPRITES383.ch2_astera.frames.attack));
 setMonsterVisualFrame(svg,'down');assert.notEqual(attrs.viewBox,attack);assert.equal(svg.dataset.frame,'down');setMonsterVisualFrame(svg,'idle');assert.equal(svg.dataset.frame,'idle1');assert.equal(svg.dataset.animationState,'idle');
});
test('battle markup keeps all native names and ranks above art; codex sources identify Chapter II capture',()=>{
 const enemies=team('roam4_4'),html=BattleScreen({specialBattle:true,specialBattleType:'chapterTwo',party:[],enemies,turnQueue:[],turn:1},{},{});
 for(const e of enemies){const start=html.indexOf(`data-enemy-target="${e.id}"`),end=html.indexOf('side-unit-sprite',start);assert.ok(html.slice(start,end).includes(e.name));assert.ok(html.slice(start,end).includes('combat-rank-badge'));}
 for(const s of roster){const entry=COMPLETE_MONSTER_CODEX.find(e=>e.speciesId===s.id);assert.equal(entry.group,'第二章');assert.match(entry.source,/捕獲/);}
 const css=fs.readFileSync(new URL('../src/Styles/build383-chapter-monsters.css',import.meta.url),'utf8');assert.match(html,/class="battle-party side-party"/);assert.match(css,/\.side-party[^{}]+has-chapter-atlas383\{transform:scaleX\(-1\)/);assert.match(css,/\.side-enemies[^{}]+has-chapter-atlas383\{transform:none/);
});
