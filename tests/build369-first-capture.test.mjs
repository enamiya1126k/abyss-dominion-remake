import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {SaveService} from '../src/services/SaveService.js';
import {createMonster,calculatedStats} from '../src/models/Monster.js';
import {applyLionelAvatarIdentity} from '../src/core/CampaignProtagonistSystem.js';
import {SPECIES} from '../src/data/species.js';
import {LIONEL_STARTER_SKILL,firstCaptureEncounter,tuneFirstCaptureEnemy} from '../src/core/LionelStarterSystem.js';
import {allLearnedSkills,learnedSkills,normalizeSkillLoadout,skillDamage,skillById,maxMp} from '../src/battle/SkillSystem.js';
import {createEnemyBattleState,chooseEnemyAction} from '../src/battle/EnemyAI.js';
import {attributeDamageMultiplier} from '../src/data/attributes.js';
const avatar=()=>applyLionelAvatarIdentity(createMonster('slime',{personalityId:'bold'}));
const target=()=>tuneFirstCaptureEnemy(createEnemyBattleState(SPECIES.dire_wolf,firstCaptureEncounter(),1));
test('new save starts with Lionel and his level-one skill; ordinary slimes do not learn it',()=>{
 globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
 try{const s=new SaveService().state,m=s.monsters[0];assert.equal(m.nickname,'リオネル');assert.equal(m.speciesId,'slime');assert(learnedSkills(m).some(x=>x.id===LIONEL_STARTER_SKILL.id));assert(maxMp(m)>=LIONEL_STARTER_SKILL.mp);
 assert(!allLearnedSkills(createMonster('slime')).some(x=>x.id===LIONEL_STARTER_SKILL.id));assert.equal(skillById(LIONEL_STARTER_SKILL.id).guaranteedHit,true);
 }finally{delete globalThis.localStorage}
});
test('existing loadouts keep their choices; the personal skill fills an empty slot once and can stay unequipped',()=>{
 const m=avatar();m.skillLoadoutInitialized=true;m.equippedSkills=['slime__identity_1',null,null,null];
 normalizeSkillLoadout(m);assert.equal(m.equippedSkills[0],'slime__identity_1');assert.equal(m.equippedSkills[1],LIONEL_STARTER_SKILL.id);
 m.equippedSkills[1]=null;normalizeSkillLoadout(m);assert.equal(m.equippedSkills[1],null);
 const empty=avatar();empty.skillLoadoutInitialized=true;empty.equippedSkills=[null,null,null,null];normalizeSkillLoadout(empty);assert.deepEqual(empty.equippedSkills,[null,null,null,null]);
 const advanced=avatar();advanced.level=1000;advanced.skillLoadoutInitialized=true;advanced.equippedSkills=allLearnedSkills(advanced).filter(x=>x.id!==LIONEL_STARTER_SKILL.id).slice(0,4).map(x=>x.id);const before=[...advanced.equippedSkills];normalizeSkillLoadout(advanced);assert.deepEqual(advanced.equippedSkills,before);
});
test('the first enemy is a capturable SR wolf; its tutorial weakness does not transfer to the captured ally',()=>{
 const e=target();assert.equal(e.speciesId,'dire_wolf');assert.equal(SPECIES[e.speciesId].rarity,'SR');assert.equal(e.level,1);assert.equal(e.hp,26);assert.equal(e.boss,false);assert.equal(e.equipped,false);assert.equal(e.enemyMagicCircle,null);
 for(let i=0;i<30;i++){e.hp=1+i%26;assert.equal(chooseEnemyAction(e),'attack')}
 const captured=createMonster(e.speciesId,{level:e.level,obtainedMethod:'capture'});assert.equal(captured.firstCaptureProfileVersion,undefined);assert(calculatedStats(captured).hp>26);assert(calculatedStats(captured).atk>4);
 const ordinary=createEnemyBattleState(SPECIES.dire_wolf,{speciesId:'dire_wolf',level:1,boss:false},1),before=structuredClone(ordinary);tuneFirstCaptureEnemy(ordinary);assert.deepEqual(ordinary,before);
});
test('one normal attack and foresight leave a catchable enemy; 3–4 offensive turns defeat it without tutorial protection',()=>{
 const s=calculatedStats(avatar()),skill=LIONEL_STARTER_SKILL;
 for(const roll of [.9,1,1.099]){
  const e=target(),normal=Math.max(1,Math.floor(Math.floor(s.atk*roll-e.def*.4)*attributeDamageMultiplier('water',e.element))),special=skillDamage(s,{...e,def:e.def*(1-skill.defenseIgnore)},skill);
  assert.equal(special,16);assert(e.hp-normal-special>0);assert(e.hp-normal-special<=8);
  let hp=e.hp,count=0;for(const d of [normal,special,normal,special]){hp-=d;count++;if(hp<=0)break}assert(count>=3&&count<=4);
 }
});
test('overkill keeps the first capture possible, then stops protecting after the capture lesson',()=>{
 const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),start=main.indexOf('function protectTutorialCaptureTarget()'),end=main.indexOf('\n}',start)+2,e=target();e.hp=-500;
 let complete=false;const ctx=vm.createContext({battle:{tutorialCaptureEligible:true,enemies:[e]},contextGuideDone:()=>complete,addBattleLog(){}});vm.runInContext(main.slice(start,end),ctx);
 assert.equal(ctx.protectTutorialCaptureTarget(),true);assert.equal(e.hp,1);complete=true;e.hp=0;assert.equal(ctx.protectTutorialCaptureTarget(),false);assert.equal(e.hp,0);
});
test('memory encounters strip the temporary tutorial AI profile',()=>{
 const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),start=main.indexOf('function normalizedMemoryEncounterEntry('),end=main.indexOf('function memorySignature(',start);
 const ctx=vm.createContext({SPECIES,cloneSerializable:structuredClone});vm.runInContext(main.slice(start,end),ctx);
 const memory=ctx.normalizedMemoryEncounterEntry(firstCaptureEncounter());assert.equal(memory.firstCaptureProfileVersion,undefined);assert.equal(memory.speciesId,'dire_wolf');assert.equal(memory.level,1);
});
