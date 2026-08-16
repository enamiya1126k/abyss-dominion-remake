import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{ABYSS_SKILL_NODES,ABYSS_SKILL_TREE_VERSION,learnAbyssSkill,normalizeAbyssSkillTree}from"../src/core/AbyssSkillTreeSystem.js";
import{EQUIPMENT_BASES,RARITY_ORDER,compatibleSubslots,equipmentIdentity,normalizeEquipmentIdentity}from"../src/data/equipment.js";
import{LEGENDARY_AFFIX_CHANCE,LEGENDARY_AFFIX_IDS,rollAffixForSlot,rollEquipmentAffixes}from"../src/data/equipmentAffixes.js";
import{createEquipment}from"../src/models/Equipment.js";
import{MYTHIC_SERIAL_SPECIES}from"../src/data/mythicSerialSpecies.js";

const read=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");
const nodesById=new Map(ABYSS_SKILL_NODES.map(node=>[node.id,node]));

function prerequisiteClosure(nodeId,result=new Set()){
 const node=nodesById.get(nodeId);if(!node)return result;
 for(const id of node.requires??[]){if(result.has(id))continue;prerequisiteClosure(id,result);result.add(id)}
 const any=(node.requiresAny??[]).slice(0,Math.max(0,Number(node.requiresAnyCount)||0));
 for(const id of any){if(result.has(id))continue;prerequisiteClosure(id,result);result.add(id)}
 return result;
}
function treeStateFor(node,{gold=node.cost+12_345}={}){
 const learned=[...prerequisiteClosure(node.id)],paidCosts=Object.fromEntries(learned.map(id=>[id,nodesById.get(id).cost]));
 return{player:{gold},monsters:[],party:[],abyssSkillTree:{version:ABYSS_SKILL_TREE_VERSION,learned,grandfathered:[],paidCosts,investedGold:Object.values(paidCosts).reduce((sum,cost)=>sum+cost,0)}};
}

test("every Abyss-tree purchase subtracts exactly its displayed cost",()=>{
 for(const node of ABYSS_SKILL_NODES){
  const state=treeStateFor(node),before=state.player.gold,result=learnAbyssSkill(state,node.id);
  assert.equal(result.ok,true,node.id);assert.equal(state.player.gold,before-node.cost,node.id);assert.equal(state.abyssSkillTree.paidCosts[node.id],node.cost,node.id);
 }
});

test("Abyss-tree rebalance refund is one-shot and can never turn a purchase into profit",()=>{
 const discounted=ABYSS_SKILL_NODES.find(node=>node.legacyCost>node.cost),root=ABYSS_SKILL_NODES.find(node=>!(node.requires?.length||node.requiresAny?.length)&&node.id!==discounted.id);
 assert.ok(discounted&&root);
 const guarded={player:{gold:9000},monsters:[],party:[],abyssSkillRebalance:{version:ABYSS_SKILL_TREE_VERSION},abyssSkillTree:{version:5,learned:[discounted.id],paidCosts:{[discounted.id]:discounted.legacyCost}}};
 normalizeAbyssSkillTree(guarded);assert.equal(guarded.player.gold,9000,"an existing marker blocks another refund");
 const legacy={player:{gold:root.cost+50_000},monsters:[],party:[],abyssSkillTree:{version:5,learned:[discounted.id],paidCosts:{[discounted.id]:discounted.legacyCost}}},before=legacy.player.gold;
 const result=learnAbyssSkill(legacy,root.id);assert.equal(result.ok,true);assert.equal(legacy.player.gold,before-root.cost,"validation-time migration cannot create GOLD");
 const after=legacy.player.gold;assert.equal(learnAbyssSkill(legacy,root.id).ok,false);assert.equal(legacy.player.gold,after,"duplicate purchase is side-effect free");
 const poor=treeStateFor(root,{gold:Math.max(0,root.cost-1)}),poorBefore=poor.player.gold;assert.equal(learnAbyssSkill(poor,root.id).ok,false);assert.equal(poor.player.gold,poorBefore);
});

test("equipment jobs, signed slow stats, high-rank series and rare LR affixes stay intact",()=>{
 for(const[slot,bases]of Object.entries(EQUIPMENT_BASES))for(const base of bases){
  const item=createEquipment(slot,{base,rarity:base.nativeRarity});
  assert.ok(equipmentIdentity(item).label.length>0,base.name);
  if((RARITY_ORDER[base.nativeRarity]??0)>=RARITY_ORDER.SSR)assert.ok(item.series,`${base.name} needs a series`);
 }
 const slow=createEquipment("armor",{base:EQUIPMENT_BASES.armor.find(base=>base.name==="守護者の外套"),rarity:"SR"});assert.ok(slow.stats.spd<0);assert.equal(equipmentIdentity(slow).label,"鈍足型");assert.ok(compatibleSubslots(slow).includes("armorBody")&&compatibleSubslots(slow).includes("armorSupport"));
 const custom=normalizeEquipmentIdentity({id:"custom",slot:"weapon",name:"無銘のLR剣",rarity:"LR",stats:{atk:80},ruleOverrides:{}});assert.ok(custom.series);
 assert.ok(LEGENDARY_AFFIX_CHANCE.LR<=.02&&LEGENDARY_AFFIX_CHANCE["神話"]<=.03);
 for(let index=0;index<300;index++)assert.ok(rollEquipmentAffixes("weapon","十神").filter(affix=>LEGENDARY_AFFIX_IDS.has(affix.id)).length<=1);
 const originalRandom=Math.random;try{Math.random=()=>0;const existing=[...LEGENDARY_AFFIX_IDS][0],rerolled=rollAffixForSlot("weapon","十神",[existing]);assert.equal(LEGENDARY_AFFIX_IDS.has(rerolled.id),false,"one item cannot gain a second legendary affix")}finally{Math.random=originalRandom}
});

test("the four serial characters are LR with top-LR innate aptitude",async()=>{
 for(const species of Object.values(MYTHIC_SERIAL_SPECIES)){assert.equal(species.rarity,"LR");assert.ok(species.rankNames.includes(`${species.name}・LR`))}
 const[serial,save,battle]=await Promise.all([read("src/core/SerialCodeSystem.js"),read("src/services/SaveService.js"),read("src/ui/screens/BattleScreen.js")]);
 assert.match(serial,/ivs:\{hp:94,atk:94,def:94,spd:94\}/);assert.match(serial,/summonTier="LR"/);assert.match(save,/LR_SERIAL_CHARACTER_IDS/);assert.match(battle,/四LR連携/);
});

test("save migration keeps equipment attached while correcting legacy serial rank",async()=>{
 const storage=new Map();globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value))};
 const[{SaveService},{createMonster}]=await Promise.all([import("../src/services/SaveService.js"),import("../src/models/Monster.js")]),service=new SaveService(),state=structuredClone(service.state),monster=createMonster("myth_enami",{ivs:{hp:100,atk:100,def:100,spd:100}}),item=createEquipment("armor",{base:EQUIPMENT_BASES.armor.find(base=>base.name==="守護者の外套"),rarity:"SR"});
 monster.summonTier="神話";monster.summonRarity="神話";delete item.ruleOverrides.preferredSubslot;item.equippedBy=monster.id;monster.equipment={weaponRight:null,weaponLeft:null,armorBody:item.id,armorSupport:null,accessoryNeck:null,accessoryFinger:null};state.monsters=[monster];state.party=[monster.id];state.equipment=[item];
 const migrated=service.migrate(state),restored=migrated.monsters[0],restoredItem=migrated.equipment[0];assert.equal(restored.summonTier,"LR");assert.equal(restored.summonRarity,"LR");assert.deepEqual(restored.ivs,{hp:94,atk:94,def:94,spd:94});assert.equal(restored.equipment.armorBody,restoredItem.id);assert.equal(restoredItem.ruleOverrides.preferredSubslot,"armorBody");
});

test("critical/down exploration and readable status details are wired to both modes",async()=>{
 const[main,online,profile,styles,index]=await Promise.all([read("src/main.js"),read("src/online/OnlinePartyClient.js"),read("src/ui/screens/OnlinePartyScreen.js"),read("src/Styles/v2.10.0.css"),read("index.html")]);
 assert.match(main,/currentHp\/maximumHp<=\.1/);assert.match(main,/down\?"down":sequence/);assert.match(online,/critical=!down&&hp\/maxHp<=\.1/);assert.match(online,/frame:down\?"down":"idle"/);assert.match(profile,/frame="idle"/);
 for(const token of["battle-status-effect-entries","最終効果","発動元：","build160CriticalBlink","equipment-archetype-chip"])assert.ok(`${main}\n${styles}`.includes(token),token);
 assert.match(index,/ASSET_BUILD = "build160"/);
});
