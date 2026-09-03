import test from"node:test";
import assert from"node:assert/strict";

import{
 BOSS_REWARD_IDENTITY_CATALOG,
 bossRewardEquipmentIdentity,
 bossRewardIdentity,
 bossRewardIdentityFromEquipment,
 bossRewardMappingSummary,
 campaignBossRewardIdentities,
 equipmentBelongsToBoss,
 resolveBossEquipmentReward
}from"../src/core/BossRewardMappingSystem.js";
import{
 ENDGAME_CHARACTERS,
 ENDGAME_LEGACY_ID_MAP
}from"../src/data/endgameCharacters.js";
import{FLOOR_BOSS_CATALOG}from"../src/data/floorBosses.js";
import{
 createSignatureEquipment,
 endgameSignatureEquipmentFixedEffects,
 endgameSignatureEquipmentStats,
 signatureEquipmentOwnerId
}from"../src/core/SignatureWeaponSystem.js";
import{craftEndgameEquipment,normalizeEndgameState}from"../src/core/EndgameSystem.js";
import{normalizeEquipmentLoadouts}from"../src/services/EquipmentLoadoutSystem.js";

const TEN_GOD_FLOORS=Object.freeze({
 80:["ten_time","ten_space","ten_life"],
 90:["ten_death","ten_fate","ten_chaos"],
 100:["ten_dominion","ten_creation","ten_end","ten_divinity"]
});

function withRandom(value,callback){
 const original=Math.random;Math.random=()=>value;
 try{return callback()}finally{Math.random=original}
}

function stableEquipmentSnapshot(item){
 return{
  slot:item.slot,
  subslot:item.ruleOverrides?.subslot??null,
  name:item.name,
  rarity:item.rarity,
  level:item.level,
  plus:item.plus,
  stats:{...(item.stats??{})},
  fixedEffects:{...(item.fixedEffects??{})},
  fixedEffectText:item.fixedEffectText??null,
  affixes:[...(item.affixes??[])],
  handedness:item.handedness??null,
  weaponType:item.weaponType??null,
  archetype:item.archetype??null,
  series:item.series??null,
  seriesName:item.seriesName??null,
  favorite:Boolean(item.favorite),
  locked:Boolean(item.locked),
  rewardOwnerId:item.rewardOwnerId??null,
  endgameBossId:item.endgameBossId??null,
  endgameFaction:item.endgameFaction??null,
  signatureOwnerId:item.ruleOverrides?.signatureOwnerId??null,
  signaturePieceIndex:item.ruleOverrides?.signaturePieceIndex??null,
  signatureSkill:item.signatureSkill??null,
  signatureWeaponEffectId:item.signatureWeaponEffectId??null,
  grantedSkillId:item.grantedSkillId??null,
  iconKey:item.iconKey??null,
  iconAtlas:item.iconAtlas??null,
  iconIndex:item.iconIndex??null,
  iconColumn:item.iconColumn??null,
  iconRow:item.iconRow??null
 }
}

function forgeState(ownerId){
 const state={
  flags:{},player:{currentFloor:100,maxFloor:100},monsters:[],equipment:[],
  reserveEquipment:[],bossEquipmentVault:[],endgame:{}
 };
 normalizeEndgameState(state);
 state.endgame.emergency.fragments[ownerId]=100_000;
 return state
}

test("Build308 reward catalog fixes all 107 bosses to 372 globally unique pieces",()=>{
 const identities=Object.values(BOSS_REWARD_IDENTITY_CATALOG),pieces=identities.flatMap(identity=>identity.equipment);
 assert.deepEqual(bossRewardMappingSummary(),{bosses:107,floorBosses:90,abyssBosses:7,tenGodBosses:10,equipmentPieces:372});
 assert.equal(identities.length,107);
 assert.equal(new Set(identities.map(identity=>identity.id)).size,107);
 assert.equal(pieces.length,372);
 assert.equal(new Set(pieces.map(piece=>piece.designId)).size,372,"every equipment design ID must be globally unique");
 assert.equal(new Set(pieces.map(piece=>piece.name)).size,372,"every authored boss-equipment name must be globally unique");

 for(const boss of FLOOR_BOSS_CATALOG){
  const identity=BOSS_REWARD_IDENTITY_CATALOG[boss.id],designs=[boss.dedicatedWeapon,boss.dedicatedArmor,boss.dedicatedAccessory];
  assert.ok(identity,`missing floor-boss identity: ${boss.id}`);
  assert.equal(identity.ownerId,boss.id);
  assert.deepEqual(identity.equipment.map(piece=>piece.piece),["weapon","armor","accessory"]);
  identity.equipment.forEach((piece,index)=>{
   const design=designs[index];
   assert.equal(piece.ownerId,boss.id,`${boss.id}/${piece.piece} owner`);
   assert.equal(piece.designId,design.id,`${boss.id}/${piece.piece} design`);
   assert.equal(piece.name,design.name,`${boss.id}/${piece.piece} name`);
   assert.equal(piece.slot,design.slot,`${boss.id}/${piece.piece} slot`);
   assert.equal(piece.subslot,design.subslot??null,`${boss.id}/${piece.piece} subslot`);
   assert.strictEqual(bossRewardEquipmentIdentity(boss.id,piece.piece),piece)
  })
 }

 for(const boss of Object.values(ENDGAME_CHARACTERS)){
  const identity=BOSS_REWARD_IDENTITY_CATALOG[boss.id];
  assert.ok(identity,`missing endgame identity: ${boss.id}`);
  assert.equal(identity.ownerId,boss.id);
  assert.equal(identity.equipment.length,6);
  identity.equipment.forEach((piece,index)=>{
   const gear=boss.gear[index];
   assert.equal(piece.ownerId,boss.id,`${boss.id}/${index} owner`);
   assert.equal(piece.pieceIndex,index,`${boss.id}/${index} piece index`);
   assert.equal(piece.name,gear.name,`${boss.id}/${index} name`);
   assert.equal(piece.slot,gear.slot,`${boss.id}/${index} slot`);
   assert.equal(piece.subslot,gear.subslot,`${boss.id}/${index} subslot`);
   assert.strictEqual(bossRewardEquipmentIdentity(boss.id,index),piece)
  })
 }
});

test("Build308 80F, 90F and 100F preserve authored order and filter multiple defeats",()=>{
 for(const[rawFloor,expected]of Object.entries(TEN_GOD_FLOORS)){
  const floor=Number(rawFloor),all=campaignBossRewardIdentities(floor);
  assert.deepEqual(all.map(identity=>identity.id),expected,`${floor}F order`);
  const defeated=[expected.at(-1),{endgameBossId:expected[0]},expected.at(-1),"abyss_gluttony"];
  assert.deepEqual(
   campaignBossRewardIdentities(floor,defeated).map(identity=>identity.id),
   [expected[0],expected.at(-1)],
   `${floor}F filter must retain floor order and ignore duplicates/foreign bosses`
  )
 }
 assert.deepEqual(
  campaignBossRewardIdentities(100,[{endgameBossId:"ten_fire"}]).map(identity=>identity.id),
  ["ten_end"],
  "legacy defeated IDs must filter through their canonical owner"
 )
});

test("Build308 unknown and contradictory explicit owners fail closed",()=>{
 assert.equal(bossRewardIdentity("unknown-boss"),null);
 assert.equal(bossRewardIdentity({rewardOwnerId:"unknown-boss"},{floor:1}),null,"unknown explicit owner must not fall back to floor");
 assert.equal(bossRewardIdentity({rewardOwnerId:"ten_time",endgameBossId:"ten_space"}),null);
 assert.equal(bossRewardIdentity({floorBossCatalogId:"floor-boss-10",bossId:"floor-boss-20"}),null);
 assert.equal(bossRewardIdentityFromEquipment({rewardOwnerId:"ten_time",endgameBossId:"ten_space"}),null);
 assert.equal(equipmentBelongsToBoss({rewardOwnerId:"ten_time",endgameBossId:"ten_space"},"ten_time"),false)
});

test("Build308 all legacy endgame aliases resolve to one canonical reward owner",()=>{
 for(const[legacyId,currentId]of Object.entries(ENDGAME_LEGACY_ID_MAP)){
  assert.equal(bossRewardIdentity(legacyId)?.id,currentId,legacyId);
  assert.equal(bossRewardIdentity({rewardOwnerId:legacyId,endgameBossId:currentId})?.id,currentId,`${legacyId} plus canonical metadata`);
  const item=withRandom(0,()=>createSignatureEquipment(legacyId,0));
  assert.ok(item,legacyId);
  assert.equal(signatureEquipmentOwnerId(item),currentId);
  assert.equal(item.rewardOwnerId,currentId);
  assert.equal(item.endgameBossId,currentId);
  assert.equal(item.ruleOverrides.signatureOwnerId,currentId);
  assert.equal(bossRewardIdentityFromEquipment(item)?.id,currentId)
 }
});

test("Build308 every endgame factory piece matches its catalog gear and fixed owner",()=>{
 for(const boss of Object.values(ENDGAME_CHARACTERS))for(let index=0;index<6;index++){
  const gear=boss.gear[index],identity=BOSS_REWARD_IDENTITY_CATALOG[boss.id].equipment[index],item=withRandom(0,()=>createSignatureEquipment(boss.id,index));
  assert.ok(item,`${boss.id}/${index}`);
  assert.equal(item.name,gear.name,`${boss.id}/${index} name`);
  assert.equal(item.slot,gear.slot,`${boss.id}/${index} slot`);
  assert.equal(item.ruleOverrides.subslot,gear.subslot,`${boss.id}/${index} subslot`);
  assert.equal(item.ruleOverrides.signaturePieceIndex,index,`${boss.id}/${index} piece index`);
  assert.equal(signatureEquipmentOwnerId(item),boss.id,`${boss.id}/${index} signature owner`);
  assert.equal(item.rewardOwnerId,boss.id,`${boss.id}/${index} reward owner`);
  assert.equal(item.endgameBossId,boss.id,`${boss.id}/${index} endgame owner`);
  assert.equal(item.endgameFaction,boss.faction,`${boss.id}/${index} faction`);
  assert.equal(item.series,boss.seriesId,`${boss.id}/${index} series`);
  assert.deepEqual(item.stats,endgameSignatureEquipmentStats(boss.id,index),`${boss.id}/${index} stats`);
  assert.deepEqual(item.fixedEffects,endgameSignatureEquipmentFixedEffects(boss.id,index),`${boss.id}/${index} fixed effects`);
  assert.equal(identity.ownerId,boss.id);
  assert.equal(equipmentBelongsToBoss(item,boss.id),true);
  const otherBoss=Object.keys(ENDGAME_CHARACTERS).find(id=>id!==boss.id);
  assert.equal(equipmentBelongsToBoss(item,otherBoss),false)
 }
});

test("Build308 signature generation is deterministic apart from instance identity and time",()=>{
 for(const boss of Object.values(ENDGAME_CHARACTERS))for(let index=0;index<6;index++){
  const low=withRandom(0,()=>createSignatureEquipment(boss.id,index)),high=withRandom(.999999,()=>createSignatureEquipment(boss.id,index));
  assert.deepEqual(stableEquipmentSnapshot(low),stableEquipmentSnapshot(high),`${boss.id}/${index} must not inherit a random base`)
 }
});

test("Build308 reward IDs never select or override a boss owner",()=>{
 const first=bossRewardIdentity({rewardOwnerId:"ten_time",rewardId:"ten-space-reward"});
 const second=bossRewardIdentity({rewardOwnerId:"ten_time",rewardId:"abyss_gluttony"});
 assert.strictEqual(first,BOSS_REWARD_IDENTITY_CATALOG.ten_time);
 assert.strictEqual(second,first);
 assert.equal(bossRewardIdentity({rewardId:"ten_time"}),null,"a receipt ID alone is not boss identity");
 assert.equal(bossRewardIdentity({rewardOwnerId:"unknown-boss",rewardId:"ten_time"}),null);
 for(const rewardId of["ten_space","abyss_gluttony","floor-boss-10","arbitrary-replay-receipt"]){
  const reward=resolveBossEquipmentReward({bossId:"ten_time",rewardId});
  assert.equal(reward.ownerId,"ten_time",rewardId);
  assert.equal(reward.bossId,"ten_time",rewardId);
  assert.equal(reward.equipment.ownerId,"ten_time",rewardId)
 }
 assert.equal(resolveBossEquipmentReward({bossId:"unknown-boss",rewardId:"ten_time"}),null)
});

test("Build308 fragment forge and direct factory emit identical canonical equipment",()=>{
 for(const boss of Object.values(ENDGAME_CHARACTERS)){
  const state=forgeState(boss.id);
  for(let index=0;index<6;index++){
   const forged=withRandom(0,()=>craftEndgameEquipment(state,boss.id)),direct=withRandom(.999999,()=>createSignatureEquipment(boss.id,index));
   assert.equal(forged.ok,true,`${boss.id}/${index} forge`);
   assert.equal(forged.gearIndex,index,`${boss.id}/${index} forge order`);
   assert.deepEqual(stableEquipmentSnapshot(forged.item),stableEquipmentSnapshot(direct),`${boss.id}/${index} forge/factory`)
  }
 }
});

test("Build308 save migration repairs the old six-piece slot plan without losing enhancement progress",()=>{
 const boss=ENDGAME_CHARACTERS.ten_time,items=Array.from({length:6},(_,index)=>withRandom(index/10,()=>createSignatureEquipment(boss.id,index)));
 const oldSubslots=["weaponRight","weaponLeft","armorBody","armorSupport","accessoryNeck","accessoryFinger"];
 items.forEach((item,index)=>{
  item.level=31+index;item.plus=7+index;item.exp=12_345+index;item.limitBreak=2+index;
  item.favorite=index%2===0;item.locked=index%2===1;item.equippedBy="ten-time-monster";
  item.slot=oldSubslots[index].startsWith("weapon")?"weapon":oldSubslots[index].startsWith("armor")?"armor":"accessory";
  item.ruleOverrides.subslot=oldSubslots[index];item.stats={wrong:999};item.fixedEffects={wrong:999};item.affixes=[{id:"legacy-random"}]
 });
 const state={
  flags:{},player:{currentFloor:100,maxFloor:100},endgame:{},equipment:items,reserveEquipment:[],bossEquipmentVault:[],
  monsters:[{id:"ten-time-monster",speciesId:boss.speciesId,endgameBossId:boss.id,level:100,equipment:Object.fromEntries(oldSubslots.map((subslot,index)=>[subslot,items[index].id]))}],
  party:["ten-time-monster"]
 };
 normalizeEndgameState(state);
 assert.deepEqual(state.monsters[0].equipment,{
  weaponRight:items[0].id,weaponLeft:items[1].id,
  accessoryNeck:items[2].id,accessoryFinger:items[3].id,
  armorBody:items[4].id,armorSupport:items[5].id
 });
 items.forEach((item,index)=>{
  const gear=boss.gear[index];
  assert.equal(item.slot,gear.slot,`${index} canonical slot`);
  assert.equal(item.ruleOverrides.subslot,gear.subslot,`${index} canonical subslot`);
  assert.deepEqual(item.stats,endgameSignatureEquipmentStats(boss.id,index),`${index} canonical stats`);
  assert.deepEqual(item.fixedEffects,endgameSignatureEquipmentFixedEffects(boss.id,index),`${index} canonical effects`);
  assert.deepEqual(item.affixes,[{id:"legacy-random"}],`${index} existing affix investment is preserved`);
  assert.equal(item.level,31+index);assert.equal(item.plus,7+index);assert.equal(item.exp,12_345+index);assert.equal(item.limitBreak,2+index);
  assert.equal(item.favorite,index%2===0);assert.equal(item.locked,index%2===1);assert.equal(item.equippedBy,"ten-time-monster")
 });
 const normalized=normalizeEquipmentLoadouts(state);
 assert.equal(normalized.repairs.incompatible,0);
 assert.equal(Object.values(state.monsters[0].equipment).filter(Boolean).length,6);
 const firstPass=JSON.stringify(state.monsters[0].equipment);normalizeEndgameState(state);assert.equal(JSON.stringify(state.monsters[0].equipment),firstPass,"migration must be idempotent")
});

test("Build308 save migration never displaces a non-migration item from a canonical slot",()=>{
 const boss=ENDGAME_CHARACTERS.ten_time,item=withRandom(0,()=>createSignatureEquipment(boss.id,2)),blocker={id:"ordinary-neck",slot:"accessory",name:"既存の首飾り"};
 item.slot="armor";item.ruleOverrides.subslot="armorBody";item.equippedBy="owner";
 const state={
  flags:{},player:{currentFloor:100,maxFloor:100},endgame:{},equipment:[item,blocker],reserveEquipment:[],bossEquipmentVault:[],party:["owner"],
  monsters:[{id:"owner",speciesId:boss.speciesId,endgameBossId:boss.id,level:100,equipment:{armorBody:item.id,accessoryNeck:blocker.id}}]
 };
 normalizeEndgameState(state);
 assert.equal(state.monsters[0].equipment.accessoryNeck,blocker.id);
 assert.equal(state.monsters[0].equipment.armorBody,null);
 assert.equal(item.equippedBy,null)
});
