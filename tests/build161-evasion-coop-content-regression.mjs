import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{attackHitChance,effectiveEvasion,EVASION_CAP}from"../src/battle/HitSystem.js";
import{applyEnemyDamage}from"../src/battle/BattleRules.js";
import{createMonster}from"../src/models/Monster.js";
import{totalExperience}from"../src/models/Monster.js";
import{consumeExperiencePacks,previewExperiencePacks}from"../src/core/ExperiencePackSystem.js";
import{createEndgameTrialEncounter,endgameTrialThreat}from"../src/core/EndgameSystem.js";
import{ENDGAME_CHARACTERS}from"../src/data/endgameCharacters.js";
import{SPECIES}from"../src/data/species.js";
import{RARITY_ORDER}from"../src/data/equipment.js";
import{allSpeciesSkills}from"../src/battle/SkillSystem.js";
import{PERMANENT_SIGNATURE_RATE,createSignatureEquipment,permanentSignatureOwners,rollPermanentSignatureHit}from"../src/core/SignatureWeaponSystem.js";
import{RoomStore}from"../online-server/src/RoomStore.js";

const read=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");

test("evasion is visible combat math with a safe cap and guaranteed-hit escape hatch",()=>{
 assert.equal(EVASION_CAP,75);
 assert.equal(effectiveEvasion({evasion:90}),75);
 assert.equal(attackHitChance({accuracy:100,evasion:0}),.98);
 assert.equal(attackHitChance({accuracy:100,evasion:75}),.25);
 assert.equal(attackHitChance({accuracy:20,evasion:75}),.25);
 assert.equal(attackHitChance({accuracy:20,evasion:75,guaranteedHit:true}),1);
});

test("mimic is a short chest-only fortress and every landed hit is capped at one",()=>{
 const enemy={id:"mimic",hp:5,maxHp:5,enemyMimicArmor:true};
 assert.deepEqual(applyEnemyDamage({},enemy,999_999),{beforeHp:5,damage:1,requested:999_999});
 const store=new RoomStore({random:()=>.999999}),online=store._createBattleEnemies({id:"b",floor:29,forceSpeciesId:"mimic",treasureMimic:true},[],1)[0];
 assert.equal(online.speciesId,"mimic");assert.equal(online.maxHp,5);assert.equal(online.spd,1);assert.equal(online.evasion,24);
 assert.ok(online.def>=1_000_000_000_000&&online.mdef>=1_000_000_000_000);
 assert.equal(store._damageToEnemy(999_999_999,online,99,100).value,1);
});

test("four-LR invincibility and Divine Descent both use live whole-party checks",async()=>{
 const[main,battleScreen,roomStore,raid]=await Promise.all([read("src/main.js"),read("src/ui/screens/BattleScreen.js"),read("online-server/src/RoomStore.js"),read("online-server/src/RaidCoordinator.js")]);
 assert.match(main,/filter\(monster=>monster\.currentHp>0\)/);
 assert.match(main,/syncInvincibleAllianceState\(.*四LRの一角が倒れ、無敵が解除された/s);
 assert.match(battleScreen,/filter\(monster=>Number\(monster\.currentHp\)>0\)/);
 assert.match(roomStore,/filter\(player=>player\.hp>0\).*FOUR_LR_IDS\.every/s);
 assert.match(raid,/filter\(player=>player\.hp>0\).*FOUR_LR_IDS\.every/s);
 const descent=ENDGAME_CHARACTERS.ten_divinity.skills.find(skill=>skill.key==="divineDescent");
 assert.equal(descent.allAllies,true);assert.equal(descent.target,"味方全体");assert.ok(descent.effects.every(effect=>effect.allies));
});

test("Naraku loop two opens above the previous loop's final threat",()=>{
 const state={player:{maxFloor:1000},monsters:[],equipment:[],flags:{gameClear1000:true},endgame:{trials:{battle:1,loop:2,cleared:[],run:null}}};
 const next=createEndgameTrialEncounter(state,1),previousState={player:{maxFloor:1000},monsters:[],equipment:[],flags:{gameClear1000:true},endgame:{trials:{battle:22,loop:1,cleared:[],run:null}}},previous=createEndgameTrialEncounter(previousState,22);
 assert.ok(endgameTrialThreat(next)>=endgameTrialThreat(previous)*1.05-.000001);
 assert.ok(next.continuityMultiplier>=1);
});

test("experience packs support one atomic cap-aware bulk transaction",()=>{
 const monster=createMonster("slime",{level:1}),inventory={experienceItems:25},before=totalExperience(monster),plan=previewExperiencePacks(monster,10,inventory.experienceItems);
 assert.equal(plan.count,10);assert.ok(plan.gain>0&&plan.levelAfter>1);
 const result=consumeExperiencePacks(monster,10,inventory);
 assert.equal(result.ok,true);assert.equal(result.count,10);assert.equal(inventory.experienceItems,15);assert.equal(totalExperience(monster),before+result.gain);
});

test("permanent signature gacha is exactly 0.1 percent and excludes restricted owners",()=>{
 assert.equal(PERMANENT_SIGNATURE_RATE,.001);assert.equal(rollPermanentSignatureHit(()=>.000999),true);assert.equal(rollPermanentSignatureHit(()=>.001),false);
 const pool=permanentSignatureOwners(),ids=new Set(pool.map(entry=>entry.ownerId));assert.ok(pool.length>0);
 for(const species of Object.values(SPECIES)){
  const eligible=(RARITY_ORDER[species.rarity]??0)>=(RARITY_ORDER.SSR??3)&&!species.serialOnly&&!species.isAbyss&&!species.isTenGod&&!species.tags?.includes?.("abyss")&&!species.tags?.includes?.("tenGod")&&!ENDGAME_CHARACTERS[species.id]&&!new Set(["myth_enami","myth_yori","myth_rion","myth_hide"]).has(species.id);
  assert.equal(ids.has(species.id),eligible,`signature pool mismatch: ${species.id}`);
 }
 const owner=pool[0].ownerId,first=createSignatureEquipment(owner,0),second=createSignatureEquipment(owner,4);
 assert.equal(first.series,second.series);assert.equal(first.ruleOverrides.signatureOwnerId,owner);assert.equal(second.ruleOverrides.signatureOwnerId,owner);
});

test("every ordinary SSR+ species receives a strategic identity and evasion-aware skills",()=>{
 const eligible=Object.values(SPECIES).filter(species=>(RARITY_ORDER[species.rarity]??0)>=(RARITY_ORDER.SSR??3)&&!["myth_enami","myth_yori","myth_rion","myth_hide"].includes(species.id)&&!species.isAbyss&&!species.isTenGod&&!species.tags?.includes?.("abyss")&&!species.tags?.includes?.("tenGod"));
 assert.ok(eligible.length>=10);assert.ok(new Set(eligible.map(species=>species.strategicIdentity?.kind)).size>=4);
 for(const species of eligible){assert.ok(species.strategicIdentity,`${species.id} identity`);assert.ok(Number(species.baseStats.evasion)>=0,`${species.id} evasion`);const skills=allSpeciesSkills(species.id),effects=skills.flatMap(skill=>skill.effects??[]);assert.ok(effects.some(effect=>["evasionUp","evasionDown","accuracyUp","accuracyDown","guard"].includes(effect.kind))||skills.some(skill=>skill.partyShieldRate>0),`${species.id} tactical skill`)}
});

test("build161 UI exposes evasion, permanent gacha and bulk-pack controls",async()=>{
 const[equipment,main,styles]=await Promise.all([read("src/ui/screens/EquipmentScreen.js"),read("src/main.js"),read("src/Styles/app.css")]);
 assert.match(equipment,/<small>回避率<\/small>/);assert.doesNotMatch(equipment,/<small>属性<\/small>/);
 for(const token of["MISS / 回避","専用装備契約","総率0.1%","経験値パックをまとめて使用","data-exp-max"])assert.ok(main.includes(token),token);
 assert.match(styles,/experience-pack-picker/);assert.match(styles,/signature-pool-list/);
});
