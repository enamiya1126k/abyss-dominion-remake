import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {ENCOUNTERS,chapterTwoEnemyEntries,tuneChapterTwoEnemy,chapterTwoState,beginChapterTwoRun,beginChapterTwoEncounter,settleChapterTwoEncounter} from '../src/chapterTwo/ChapterTwoSystem.js';
import {CHAPTER_TWO_ACTIONS,chapterTwoUltimateAllowed382,chapterTwoLoadouts382} from '../src/chapterTwo/ChapterTwoTactics382.js';
import {createEnemyBattleState,chooseEnemyAction,enemyActionMpCost,specialActionInfo,specialActionMultiplier} from '../src/battle/EnemyAI.js';
import {SPECIES} from '../src/data/species.js';
import {SaveService} from '../src/services/SaveService.js';
import {applyBattleEffect,hasEffect,effectValue,tickBattleEffects} from '../src/battle/BattleRules.js';
import {chapterTwoArtScale382} from '../src/ui/BattleBossLayout.js';
import {BattleScreen} from '../src/ui/screens/BattleScreen.js';
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const extract=(from,to)=>main.slice(main.indexOf(from),main.indexOf(to,main.indexOf(from)));
const team=id=>chapterTwoEnemyEntries(id).map((entry,index)=>{const enemy=createEnemyBattleState(SPECIES[entry.speciesId],{...entry,id:`enemy${index}`},100);tuneChapterTwoEnemy(enemy,id,index);return enemy;});

test('all 61 encounter profiles have six real gear pieces, distinct role circles and finite tuned stats',()=>{
 assert.equal(Object.keys(ENCOUNTERS).length,61);
 for(const id of Object.keys(ENCOUNTERS)){
  const enemies=team(id);assert.equal(new Set(enemies.map(e=>e.enemyMagicCircle.id)).size,enemies.length,id);
  for(const e of enemies){assert.equal(e.enemyGear.length,6);assert.equal(new Set(e.enemyGear.map(g=>g.id)).size,6);assert.equal(e.teamBattleRole,e.chapterTwoTactics382.role);
   assert.deepEqual(e.enemyGear.map(g=>g.slot),['weapon','weapon','armor','armor','accessory','accessory']);
   assert.ok(e.enemyGear.every(g=>g.name&&g.level>1&&g.plus>0));assert.ok(e.enemyMagicCircle.name&&e.enemyMagicCircle.effect);
   for(const key of ['maxHp','maxMp','atk','matk','def','mdef','spd'])assert.ok(Number.isFinite(e[key])&&e[key]>0,`${id}:${key}`);
   for(const action of e.chapterTwoTactics382.actions)assert.ok(specialActionInfo(action));
  }
 }
});
test('equipment choices and levels affect combat, and magical attackers select magical weapons',()=>{
 const entry={...chapterTwoEnemyEntries('a1_patrol')[0],speciesId:'ogre',...chapterTwoLoadouts382('a1_patrol',{...ENCOUNTERS.a1_patrol,species:['ogre','mandrake']})[0]},withGear=createEnemyBattleState(SPECIES[entry.speciesId],entry,100),withoutGear=structuredClone(withGear);
 withoutGear.enemyGear=[];tuneChapterTwoEnemy(withGear,'a1_patrol',0);tuneChapterTwoEnemy(withoutGear,'a1_patrol',0);
 assert.ok(withGear.matk>withoutGear.matk);assert.ok(withGear.maxMp>withoutGear.maxMp);
 assert.ok(withGear.enemyGear.slice(0,2).every(g=>(g.stats.matk??0)>0));
 const early=team('heart'),late=team('a4_heart');assert.notDeepEqual(early[0].enemyGear.map(g=>g.name),late[0].enemyGear.map(g=>g.name));
 assert.ok(late[3].enemyEquipmentLevel>early[3].enemyEquipmentLevel);
 const reduced=structuredClone(entry);reduced.enemyGear.forEach(g=>{g.level=1;g.plus=0});tuneChapterTwoEnemy(reduced,'a1_patrol',0);assert.ok(reduced.matk<withGear.matk);
});
test('shared encounter preparation preserves authored loadout metadata without random rerolls',()=>{
 const c={SPECIES};vm.createContext(c);vm.runInContext(extract('function prepareEnemyEntry(','function ensureUniqueEnemyMagicCircles('),c);
 for(const e of chapterTwoEnemyEntries('a4_heart')){const result=c.prepareEnemyEntry(e,100);assert.equal(result.enemyEquipmentLevel,e.enemyEquipmentLevel);assert.equal(result.enemyEquipmentRarity,e.enemyEquipmentRarity);assert.equal(result.enemyEquipmentSlots,6);assert.deepEqual(result.enemyGear,e.enemyGear);assert.deepEqual(result.enemyMagicCircle,e.enemyMagicCircle)}
});
test('real circle profile is applied after authored stats and gear, retaining reversible circle multipliers',()=>{
 const c={};vm.createContext(c);vm.runInContext(extract('function applyEnemyMagicCircleProfile(','function applyFloorBossSignatureProfile('),c);
 for(const e of team('heart')){const before={hp:e.maxHp,atk:e.atk,def:e.def};c.applyEnemyMagicCircleProfile(e,e.enemyMagicCircle);assert.ok(e.maxHp>before.hp);assert.ok(e.atk>before.atk);assert.equal(e._preMagicCircleStats.maxHp,before.hp);assert.equal(e._enemyMagicCircleApplied.rates.atk,e.atk/before.atk);assert.equal(e.hp,e.maxHp)}
});
test('AI chooses heal, cleanse and one revive, respecting MP, cooldowns, seals and reload',()=>{
 const legacyTeam=()=>team('heart').map((e,i)=>({...e,speciesId:'ogre',...chapterTwoLoadouts382('heart',{...ENCOUNTERS.heart,roster397:false,roles:undefined,species:['ogre','ogre','ogre','ogre']})[i]}));
 const enemies=legacyTeam(),support=enemies[3],dead=enemies[2],battle={turn:1,reviveCount:0,enemyEffects:{},enemyStatuses:{}},context={allies:enemies,opponents:[],battle};
 dead.hp=0;assert.equal(chooseEnemyAction(support,context),'ch2:revive');
 const restored=JSON.parse(JSON.stringify(support));battle.turn=20;assert.notEqual(chooseEnemyAction(restored,context),'ch2:revive');
 const sealed=legacyTeam()[3];battle.enemyEffects[dead.id]=[{kind:'reviveSeal',turns:2}];assert.notEqual(chooseEnemyAction(sealed,context),'ch2:revive');
 dead.hp=dead.maxHp;enemies[0].hp=Math.floor(enemies[0].maxHp*.2);battle.enemyEffects={};
 const healer=legacyTeam()[3];context.allies=[healer,...enemies.slice(0,3)];assert.equal(chooseEnemyAction(healer,context),'ch2:mend');assert.notEqual(chooseEnemyAction(healer,context),'ch2:mend');
 battle.turn+=3;assert.equal(chooseEnemyAction(healer,context),'ch2:mend');
 battle.enemyStatuses[enemies[0].id]=[{id:'poison'}];assert.equal(chooseEnemyAction(healer,context),'ch2:cleanse');
 healer.currentMp=0;assert.equal(chooseEnemyAction(healer,context),'ch2:recharge');assert.equal(chooseEnemyAction(healer,context),'attack');
});
test('AI targets prepared victims and responds to player buffs and recast delay',()=>{
 const enemies=team('patrol').map((e,i)=>({...e,speciesId:i?'jade_mantis':'dire_wolf',...chapterTwoLoadouts382('patrol',{...ENCOUNTERS.patrol,species:['dire_wolf','jade_mantis']})[i]})),striker=enemies[0],disruptor=enemies[1],opponents=[{id:'weak',currentHp:1},{id:'marked',currentHp:900}],battle={turn:1,allyAilments:{marked:[{id:'poison'}]},allyEffects:{weak:[{kind:'atkUp',turns:2}]}};
 assert.equal(chooseEnemyAction(striker,{allies:enemies,opponents,battle}),'ch2:harvest');assert.equal(striker.chapterTwoFocus382,'marked');
 assert.equal(chooseEnemyAction(disruptor,{allies:enemies,opponents,battle}),'ch2:dispel');
 disruptor.specialCooldown=3;battle.turn=10;assert.equal(chooseEnemyAction(disruptor,{allies:enemies,opponents,battle}),'attack');assert.equal(disruptor.specialCooldown,2);
 for(const [key,info] of Object.entries(CHAPTER_TWO_ACTIONS))assert.equal(enemyActionMpCost(striker,key),info.mp);
});
test('chapter authority ultimates begin at round four for the leader, once; other modes retain eligibility',()=>{
 const [leader,,,guardian]=team('a3_heart');assert.equal(chapterTwoUltimateAllowed382(leader,1),false);assert.equal(chapterTwoUltimateAllowed382(leader,4),true);
 leader.chapterTwoUltimateUsed382=true;assert.equal(chapterTwoUltimateAllowed382(leader,10),false);assert.equal(chapterTwoUltimateAllowed382(guardian,10),false);assert.equal(chapterTwoUltimateAllowed382({endgameBossId:'ten_time'},1),true);
});

function runtime(enemies){
 const battle={enemies,party:[{id:'p',currentHp:1000,currentMp:100,maxHp:1000}],turn:1,reviveCount:0,enemyEffects:{},allyEffects:{},enemyStatuses:{},allyAilments:{}};
 const c={battle,Math,Number,Set,Object,Boolean,String,Array,specialActionInfo,specialActionMultiplier,hasEffect,applyBattleEffect,addBattleLog(){},battleBanner:async()=>{},battleFlash(){},applyFloorBossActionTax:async()=>{},canBattleRevive:()=>true,queueBattleRecovery(){},flushBattleRecoveries:async()=>{},floatText:async()=>{},POSITIVE_ENEMY_EFFECTS:new Set(['atkUp','defUp','spdUp','guard','regen']),recoverFloorBossHp:(e,n)=>{const before=e.hp;e.hp=Math.min(e.maxHp,e.hp+n);return e.hp-before},recoverEnemyBattleMp:(e,n)=>{const before=e.currentMp;e.currentMp=Math.min(e.maxMp,e.currentMp+n);return e.currentMp-before},grantEnemyAuthorityShield:(e,rate)=>{for(const ally of battle.enemies.filter(x=>x.hp>0))ally._floorBossHpShield=Math.floor(ally.maxHp*rate)}};
 Object.assign(c,{chooseEnemyTarget:()=>battle.party[0],floorBossDomainActionMultiplier:()=>1,turnPowerMultiplier:()=>1,allyAilment:(target,id)=>(battle.allyAilments[target.id]??[]).find(a=>a.id===id),animateAttack:async()=>{},dealEnemyHit:async(e,target,multiplier,label,crit,element,rules)=>{c.lastHit={id:target.id,multiplier,element,rules};return 10;}});
 vm.createContext(c);vm.runInContext(extract('async function resolveEnemySpecialAction(','async function resolveEnemyFlee('),c);return c;
}
test('real resolver applies timed party buffs without permanently inflating stats',async()=>{
 const enemies=team('heart'),c=runtime(enemies),before=enemies[0].atk;
 await c.resolveEnemySpecialAction(enemies[0],'ch2:rally');await c.resolveEnemySpecialAction(enemies[0],'ch2:rally');
 assert.equal(enemies[0].atk,before);assert.equal(effectValue(c.battle,enemies[1].id,'atkUp','enemy'),.18);
 for(let i=0;i<3;i++)tickBattleEffects(c.battle);assert.equal(effectValue(c.battle,enemies[1].id,'atkUp','enemy'),0);
 await c.resolveEnemySpecialAction(enemies[2],'ch2:bulwark');assert.equal(enemies[0]._floorBossHpShield,Math.floor(enemies[0].maxHp*.1));
});
test('real resolver heals, cleanses, revives and restores MP by the advertised amounts',async()=>{
 const enemies=team('heart'),c=runtime(enemies),support=enemies[3];enemies.forEach(e=>e.hp=10);
 await c.resolveEnemySpecialAction(support,'ch2:mend');for(const e of enemies)assert.equal(e.hp,10+Math.floor(e.maxHp*.18));
 c.battle.enemyStatuses[enemies[0].id]=[{id:'poison'}];c.battle.enemyEffects[enemies[0].id]=[{kind:'defDown'},{kind:'atkUp'}];
 await c.resolveEnemySpecialAction(support,'ch2:cleanse');assert.equal(c.battle.enemyStatuses[enemies[0].id].length,0);assert.equal(c.battle.enemyEffects[enemies[0].id][0].kind,'atkUp');
 enemies[0].hp=0;enemies[0].currentMp=0;await c.resolveEnemySpecialAction(support,'ch2:revive');assert.equal(enemies[0].hp,Math.floor(enemies[0].maxHp*.28));assert.equal(enemies[0].currentMp,Math.floor(enemies[0].maxMp*.15));
 support.currentMp=0;await c.resolveEnemySpecialAction(support,'ch2:recharge');assert.equal(support.currentMp,Math.floor(support.maxMp*.24));
});
test('real resolver performs defense-break combos and follows the AI-selected poisoned victim',async()=>{
 const enemies=team('a4_heart'),c=runtime(enemies);
 await c.resolveEnemySpecialAction(enemies[1],'ch2:breach');assert.ok(hasEffect(c.battle,'p','defDown'));assert.ok(hasEffect(c.battle,'p','vulnerable'));
 await c.resolveEnemySpecialAction(enemies[0],'ch2:finish');assert.equal(c.lastHit.multiplier,1.4*1.3);
 const forest=team('patrol')[0];c.battle.party.push({id:'poisoned',currentHp:1000});c.battle.allyAilments.poisoned=[{id:'poison'}];forest.chapterTwoFocus382='poisoned';
 await c.resolveEnemySpecialAction(forest,'ch2:harvest');assert.equal(c.lastHit.id,'poisoned');assert.equal(c.lastHit.multiplier,1.25*1.4);
});

function lossFixture({retreated=false,allDown=true,failFirst=false}={}){
 const mem=new Map();globalThis.localStorage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};
 const save=new SaveService();Object.assign(save.state.player,{maxFloor:100,inRun:false});Object.assign(save.state.campaign100,{finalCompleted:true,finalUnlocked:true});chapterTwoState(save.state).introComplete=true;
 beginChapterTwoRun(save.state);save.state.chapterTwo376.run.room=1;save.state.chapterTwo376.run.auto377=true;const attempt=beginChapterTwoEncounter(save.state,'patrol');assert.equal(attempt.ok,true);
 const party=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id));party.forEach(m=>{m.currentHp=allDown?0:17;m.currentMp=3});save.state.inventory.potions=2;
 save.state.activeBattle={specialBattleType:'chapterTwo',chapterTwoToken:attempt.token};let failed=failFirst,homeCalls=0;const button={},modal={classList:{add(){}},querySelector:()=>button,remove(){}};
 const actualSave=save.save.bind(save);save.save=()=>{if(failed){failed=false;return false}return actualSave()};
 const c={save,battle:{specialBattleType:'chapterTwo',chapterTwoToken:attempt.token,chapterTwoEncounter:'patrol',party,priorVitals:party.map(m=>({id:m.id,hp:99999,mp:99999}))},battleContributionSnapshot:()=>({}),settleChapterTwoEncounter,chapterTwoState,CHAPTER_TWO_ENCOUNTERS:ENCOUNTERS,chapterTwoHint380:()=>'',syncPersistentAilments(){},clearPartySynergy(){},cleanupUltimateBattle(){},document:{querySelector:()=>({remove(){}})},app:{insertAdjacentHTML:(_,html)=>c.html=html},audio:{sfx(){}},render(){},Modal:(title,body,button)=>title+body+button,topModal:()=>modal,activeEnemy:null,snapshot:null,screen:'chapterTwoField',pixelIcon:()=>'',monsterVisual:()=>'',SPECIES,displayName:m=>m.name??m.speciesId,escapeAttribute:x=>x,stopGame(){},go:s=>{if(s==='home')homeCalls++}};
 vm.createContext(c);vm.runInContext(extract('function chapterTwoDefeatBody382(','\nfunction openExploreFloorSelector'),c);
 const gold=save.state.player.gold;c.finishChapterTwoBattle(false,{retreated});return {c,button,modal,save,party,gold,homeCalls:()=>homeCalls};
}
test('actual defeat settlement and SaveService reload preserve KO, MP, consumables and progress; all-KO exits home once',()=>{
 const f=lossFixture();assert.equal(f.c.battle,null);assert.equal(f.save.state.activeBattle,undefined);assert.equal(f.save.state.player.gold,f.gold);assert.equal(f.save.state.inventory.potions,2);
 assert.equal(f.save.state.chapterTwo376.run.auto377,false);assert.equal(f.save.state.chapterTwo376.run.defeated.length,0);assert.match(f.c.html,/拠点で立て直す/);
 f.button.onclick();f.modal._onDismiss();assert.equal(f.homeCalls(),1);
 const reloaded=new SaveService();for(const id of reloaded.state.party){const m=reloaded.state.monsters.find(m=>m.id===id);assert.equal(m.currentHp,0);assert.equal(m.currentMp,3)}
});
test('retreat preserves remaining HP and MP and offers exploration; failed save can retry without recovery',()=>{
 const f=lossFixture({retreated:true,allDown:false,failFirst:true});assert.ok(f.c.battle);assert.match(f.c.html,/再試行/);f.button.onclick();
 assert.equal(f.c.battle,null);assert.match(f.c.html,/探索へ戻る/);assert.equal(f.homeCalls(),0);for(const id of f.save.state.party){const m=f.save.state.monsters.find(m=>m.id===id);assert.equal(m.currentHp,17);assert.equal(m.currentMp,3)}
});
test('alpha-aware sizing enlarges small normal silhouettes and fits boss silhouettes to mobile columns and label headroom',()=>{
 for(const slotWidth of [65,75,90,140])for(const headroom of [65,100,180]){
  const normal=chapterTwoArtScale382({width:31,height:38,slotWidth,headroom,normalSize:62});assert.ok(38*normal>=54);assert.ok(31*normal<=slotWidth-8);
  const boss=chapterTwoArtScale382({width:190,height:260,slotWidth,headroom,normalSize:62,boss:true});assert.ok(190*boss<=slotWidth-8+.001);assert.ok(260*boss<=headroom+.001);
 }
});
test('second-chapter markup gives each enemy an overhead name and rank outside its scaled art',()=>{
 const enemies=team('vault4'),html=BattleScreen({specialBattle:true,specialBattleType:'chapterTwo',party:[],enemies,turnQueue:[],turn:1},{},{});
 assert.equal((html.match(/chapter-two-loadout382/g)??[]).length,4);
 for(const e of enemies){const start=html.indexOf(`data-enemy-target="${e.id}"`),end=html.indexOf('side-unit-sprite',start);assert.ok(html.slice(start,end).includes('battle-unit-floating-name'));assert.ok(html.slice(start,end).includes('combat-rank-badge'))}
});
