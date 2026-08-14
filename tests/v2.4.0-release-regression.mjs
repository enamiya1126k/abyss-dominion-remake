import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

class MemoryStorage{
  constructor(){this.map=new Map()}
  getItem(key){return this.map.get(key)??null}
  setItem(key,value){this.map.set(key,String(value))}
  removeItem(key){this.map.delete(key)}
  clear(){this.map.clear()}
}

globalThis.localStorage=new MemoryStorage();
globalThis.window={dispatchEvent(){}};
globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}};

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const {
  APP_VERSION,
  MONSTER_STORAGE_CAP,
  SAVE_SCHEMA_VERSION
}=await import("../src/core/config.js");
const {SaveService}=await import("../src/services/SaveService.js");
const {
  SERIAL_CODE_COUNT,
  applyGameMasterReward,
  applySerialReward,
  validateGameMasterCode,
  validateSerialCode
}=await import("../src/core/SerialCodeSystem.js");
const {
  CASINO_CRYSTAL_COST,
  CASINO_MULTIPLIER_RATES,
  spinSecretRoomCasino
}=await import("../src/core/SecretRoomSystem.js");
const {
  ENEMY_ACTIONS,
  chooseEnemyAction,
  createEnemyBattleState,
  enemyActionMpCost
}=await import("../src/battle/EnemyAI.js");
const {SPECIES}=await import("../src/data/species.js");
const {ADDITIONAL_SPECIES}=await import("../src/data/additionalSpecies.js");
const {ENDGAME_SPRITE_FOLDERS,MONSTER_SPRITE_FOLDERS}=await import("../src/data/monsterCatalog.js");
const {affectionBonuses,createMonster}=await import("../src/models/Monster.js");
const {createEquipment}=await import("../src/models/Equipment.js");
const {canEquipInSubslot}=await import("../src/services/EquipmentLoadoutSystem.js");

assert.equal(APP_VERSION,"2.8.0");
assert.equal(SAVE_SCHEMA_VERSION,54);
assert.equal(SERIAL_CODE_COUNT,21);

const serialCodes=new Map([
  ["AD-GM-ZM7T-QKAG-WKHF","crystals10000"],
  ["AD-GM-33CT-1KKX-UO2P","gold10000000"],
  ["AD-GM-0Z36-GMXK-AAWM","keys100"],
  ["AD-GM-UFAJ-IXH2-JJHM","tenGodMonster"],
  ["AD-GM-5FM7-8GCS-Q8C8","abyssMonster"],
  ["AD-GM-CGAN-31VR-QIFF","mythicMonster"],
  ["AD-GM-KP3B-WFYH-2Q6J","lrMonster"],
  ["AD-GM-512R-08O1-EICZ","capture5000"],
  ["AD-GM-KEYS-1000","keys1000"],
  ["AD-GM-CAPTURE-50000","capture50000"],
  ["AD-GM-TEN-GEAR-PACK","tenGodGearPack"],
  ["AD-GM-ABYSS-GEAR-PACK","abyssGearPack"],
  ["AD-GM-RANDOM-LR","randomLrMonster"],
  ["AD-GM-RANDOM-MYTH","randomMythicMonster"],
  ["AD-GM-RANDOM-ABYSS","randomAbyssMonster"],
  ["AD-GM-RANDOM-TENGOD","randomTenGodMonster"],
  ["AD-GM-CHAPPY-SECRET","chappySecret"]
]);
const initial=()=>structuredClone(new SaveService().state);
for(const [code,rewardId] of serialCodes){
  localStorage.clear();
  const validation=await validateSerialCode(initial(),code.toLowerCase().replaceAll("-"," "));
  assert.equal(validation.ok,true,`${code} must validate`);
  assert.equal(validation.rewardId,rewardId,`${code} reward mismatch`);
}
assert.equal((await validateSerialCode(initial(),"AD-GM-NOT-A-CODE")).ok,false);

{
  const state=initial(),crystals=state.player.crystals;
  assert.equal(applySerialReward(state,"crystals10000").ok,true);
  assert.equal(state.player.crystals,crystals+10_000);
}
{
  const state=initial(),gold=state.player.gold;
  applySerialReward(state,"gold10000000");
  assert.equal(state.player.gold,gold+10_000_000);
}
for(const [rewardId,key,amount] of [
  ["keys100","abyssKeys",100],
  ["keys1000","abyssKeys",1_000],
  ["capture5000","captureCrystals",5_000],
  ["capture50000","captureCrystals",50_000]
]){
  const state=initial(),before=state.inventory[key];
  applySerialReward(state,rewardId);
  assert.equal(state.inventory[key],before+amount);
}
for(const [rewardId,faction] of [["tenGodGearPack","tenGod"],["abyssGearPack","abyss"]]){
  const state=initial(),before=state.equipment.length;
  applySerialReward(state,rewardId);
  const items=state.equipment.slice(before);
  assert.equal(items.length,3);
  assert.deepEqual(items.map(item=>item.slot).sort(),["accessory","armor","weapon"]);
  assert.ok(items.every(item=>item.endgameFaction===faction));
}
for(const rewardId of ["tenGodMonster","abyssMonster","mythicMonster","lrMonster","randomLrMonster","randomMythicMonster","randomAbyssMonster","randomTenGodMonster"]){
  const state=initial(),before=state.monsters.length,result=applySerialReward(state,rewardId);
  assert.equal(result.ok,true,rewardId);
  assert.equal(state.monsters.length,before+1,rewardId);
  assert.ok(result.monster?.favorite,rewardId);
}
{
  const state=initial(),beforeMonsters=state.monsters.length,beforeEquipment=state.equipment.length;
  const result=applySerialReward(state,"chappySecret");
  assert.equal(result.monster.speciesId,"dev_familiar_chappy");
  assert.equal(state.monsters.length,beforeMonsters+1);
  assert.equal(state.equipment.length,beforeEquipment+1);
  assert.equal(state.equipment.at(-1).name,"未完成兵装《PATCH//404》");
  assert.equal(state.equipment.at(-1).ruleOverrides.unsellable,true);
}
{
  const full=initial();
  while(full.monsters.length<MONSTER_STORAGE_CAP)full.monsters.push({...full.monsters[0],id:crypto.randomUUID()});
  assert.equal((await validateSerialCode(full,"AD-GM-RANDOM-LR")).ok,false);
}

assert.deepEqual(await validateGameMasterCode(initial(),"AD-GM-OMEGA-9998"),{ok:true,kind:"grant"});
assert.deepEqual(await validateGameMasterCode(initial(),"AD-GM-RESET-1300"),{ok:true,kind:"reset"});
{
  const state=initial();
  state.player.maxFloor=321;
  state.player.currentFloor=219;
  const before={gold:state.player.gold,crystals:state.player.crystals,keys:state.inventory.abyssKeys,capture:state.inventory.captureCrystals,exp:state.inventory.experienceItems,equipment:state.equipment.length,monsters:state.monsters.length};
  const result=applyGameMasterReward(state);
  assert.equal(result.ok,true);
  assert.equal(state.player.gold,before.gold+100_000_000);
  assert.equal(state.player.crystals,before.crystals+100_000);
  assert.equal(state.inventory.abyssKeys,before.keys+1_000);
  assert.equal(state.inventory.captureCrystals,before.capture+50_000);
  assert.equal(state.inventory.experienceItems,before.exp+50);
  assert.equal(state.equipment.length,before.equipment+24);
  assert.equal(result.equipment.filter(entry=>entry.item.endgameFaction==="tenGod").length,12);
  assert.equal(result.equipment.filter(entry=>entry.item.endgameFaction==="abyss").length,12);
  for(const slot of ["weapon","armor","accessory"])assert.equal(result.equipment.filter(entry=>entry.item.slot===slot).length,8);
  assert.equal(state.monsters.length,before.monsters+4);
  assert.ok(result.monsters.every(monster=>monster.endgameFaction==="tenGod"));
  assert.equal(state.settings.gmFloorUnlockMax,9998);
  assert.equal(state.player.maxFloor,321,"GM must not alter highest reached floor");
  assert.equal(state.player.currentFloor,219,"GM must not move the player");
  assert.equal(applyGameMasterReward(state).ok,false,"GM pack is one-time per save");
}

assert.equal(CASINO_CRYSTAL_COST,100);
assert.ok(Math.abs(CASINO_MULTIPLIER_RATES.reduce((sum,bucket)=>sum+bucket.rate,0)-1)<1e-12);
assert.ok(CASINO_MULTIPLIER_RATES.every(bucket=>bucket.min!==1&&bucket.max!==1));
assert.deepEqual(CASINO_MULTIPLIER_RATES.map(bucket=>bucket.rate),[.45,.35,.15,.04,.009,.0009,.0001]);
function casinoState(){
  return{player:{gold:10_000,crystals:1_000},secretRooms:{run:null,activeRoom:{id:"audit",floor:1,rested:false,casino:{used:false,spins:0,wins:0,netGold:0,crystalsSpent:0,lastResult:null},offers:[],recoveryPurchased:{}}}};
}
for(const [roll,min,max] of [[0,0,0],[.5,2,2],[.85,3,5],[.97,6,9],[.995,10,29],[.9995,30,99],[.99995,100,999]]){
  const sequence=[roll,.999999];
  const result=spinSecretRoomCasino(casinoState(),100,()=>sequence.shift()??0);
  assert.equal(result.ok,true);
  assert.ok(result.multiplier>=min&&result.multiplier<=max,`casino roll ${roll}`);
  assert.notEqual(result.multiplier,1);
  assert.equal(result.crystals,900);
}

{
  const species=SPECIES.goblin,enemy=createEnemyBattleState(species,{speciesId:"goblin",level:40,currentMp:99999,hp:1},41);
  assert.ok(enemy.maxMp>=8);
  assert.equal(enemy.currentMp,enemy.maxMp,"enemy MP is clamped to the internal maximum");
  assert.equal(enemy.hp,enemy.maxHp,"derived battle HP cannot be overridden by encounter source");
  assert.equal(enemyActionMpCost(enemy,ENEMY_ACTIONS.attack),0);
  assert.ok(enemyActionMpCost(enemy,ENEMY_ACTIONS.heal)>0);
  assert.ok(enemyActionMpCost(enemy,ENEMY_ACTIONS.packRevive)>enemyActionMpCost(enemy,ENEMY_ACTIONS.heal));
}
{
  const support={speciesId:"healer",role:"healer",hp:100,maxHp:100,maxMp:100,currentMp:100,boss:false,specialCooldown:1};
  const action=chooseEnemyAction(support,{allies:[support,{hp:0,maxHp:100}],opponents:[]});
  assert.equal(action,ENEMY_ACTIONS.packRevive);
}
{
  const depleted={speciesId:"healer",role:"healer",hp:100,maxHp:100,maxMp:100,currentMp:0,boss:false,specialCooldown:1};
  const originalRandom=Math.random;Math.random=()=>.99;
  try{assert.equal(chooseEnemyAction(depleted,{allies:[depleted,{hp:0,maxHp:100}],opponents:[]}),ENEMY_ACTIONS.attack)}finally{Math.random=originalRandom}
}

const stationery=Object.values(ADDITIONAL_SPECIES).filter(species=>species.id!=="dev_familiar_chappy"&&species.id!=="ochuki"&&!["bechi","kiara","roxy","milim","ai","eris","golden_darkness"].includes(species.id));
assert.equal(stationery.length,12);
assert.deepEqual(Object.fromEntries(["N","R","SR","SSR"].map(rarity=>[rarity,stationery.filter(species=>species.rarity===rarity).length])),{N:3,R:3,SR:3,SSR:3});
assert.equal(SPECIES.compass_beetle.name,"星盤オオグソク");
assert.ok(!Object.values(ADDITIONAL_SPECIES).some(species=>/蜘蛛|spider/i.test(`${species.id} ${species.name} ${species.race}`)));
for(const [id,name] of [["ochuki","おちゅき"],["bechi","ベチー"],["kiara","きあら"],["roxy","ロキシー"],["milim","ミリム"],["ai","アイ"],["eris","エリス"],["golden_darkness","金色の闇"],["dev_familiar_chappy","開発使魔チャッピー"]]){
  assert.equal(SPECIES[id].name,name);
  assert.ok(SPECIES[id].authoredSkills.length>=1,id);
}
assert.equal(SPECIES.ochuki.ultraRareEncounter,true);
assert.deepEqual(SPECIES.ochuki.fleeTurns,[2,4]);
assert.equal(SPECIES.kiara.passive.kind,"nearDeathPartyHealOnce");
assert.equal(SPECIES.roxy.passive.kind,"onceRevive");
assert.equal(SPECIES.milim.element,"neutral");
assert.equal(SPECIES.golden_darkness.element,"neutral");

assert.equal(createMonster("slime",{affection:2000}).affection,1000);
assert.equal(createMonster("slime",{affection:-1}).affection,0);
for(let threshold=100;threshold<=1000;threshold+=100){
  assert.notDeepEqual(affectionBonuses(threshold),affectionBonuses(threshold-1),`affection threshold ${threshold}`);
}
assert.ok(Object.values(affectionBonuses(1000)).every(value=>value>0));

{
  const monster=createMonster("slime",{level:100});
  const weapon=createEquipment("weapon",{handedness:"twoHanded"}),armor=createEquipment("armor"),accessory=createEquipment("accessory");
  assert.equal(canEquipInSubslot(weapon,monster,"weaponRight"),true);
  assert.equal(canEquipInSubslot(weapon,monster,"armorBody"),false);
  assert.equal(canEquipInSubslot(armor,monster,"armorBody"),true);
  assert.equal(canEquipInSubslot(armor,monster,"accessoryNeck"),false);
  assert.equal(canEquipInSubslot(accessory,monster,"accessoryFinger"),true);
}

const frames=["idle1","idle2","idle3","walk1","walk2","attack","damage","down"];
const uniqueFolders=[...new Set(Object.values(MONSTER_SPRITE_FOLDERS))];
for(const folder of uniqueFolders)for(const frame of frames)assert.ok(fs.existsSync(path.join(root,"assets/monsters",folder,`${frame}.png`)),`missing ${folder}/${frame}.png`);
const simpleFolders=Array.from({length:12},(_,index)=>`${String(index+211).padStart(3,"0")}_${["eraser_slime","pushpin_roller","pencil_mouse","stapler_crab","compass_beetle","gluepot_mimic","fountain_pen_mage","correction_ghost","scissor_mantis","pencilcase_parade","chalkboard_dragon","forbidden_paper_cutter"][index]}`);
const detailedFolders=["223_ochuki","224_bechi","225_kiara","226_roxy","227_milim","228_ai","229_eris","230_golden_darkness",...new Set(Object.values(ENDGAME_SPRITE_FOLDERS))];
function pngSize(file){const data=fs.readFileSync(file);assert.equal(data.toString("ascii",1,4),"PNG");return[data.readUInt32BE(16),data.readUInt32BE(20)]}
for(const folder of simpleFolders)for(const frame of frames){
  const file=path.join(root,"assets/monsters",folder,`${frame}.png`),size=pngSize(file);
  assert.ok([[128,128],[256,256]].some(expected=>expected[0]===size[0]&&expected[1]===size[1]),`${folder}/${frame}.png size`);
}
for(const folder of ["secret_dev_familiar_chappy"])for(const frame of frames){
  const file=path.join(root,"assets/monsters",folder,`${frame}.png`);
  assert.deepEqual(pngSize(file),[128,128],`${folder}/${frame}.png size`);
}
for(const [folders,size] of [[detailedFolders,512]])for(const folder of folders)for(const frame of frames){
  const file=path.join(root,"assets/monsters",folder,`${frame}.png`);
  assert.deepEqual(pngSize(file),[size,size],`${folder}/${frame}.png size`);
}

const main=read("src/main.js"),battleScreen=read("src/ui/screens/BattleScreen.js"),exploreScreen=read("src/ui/screens/ExploreScreen.js"),settingsScreen=read("src/ui/screens/SettingsScreen.js"),css=read("src/Styles/v2.4.0.css");
assert.doesNotMatch(battleScreen,/次の行動|敵MP/);
assert.match(battleScreen,/enemy-mp/,"enemy MP must be visible so MP recovery has a readable gauge animation");
assert.match(battleScreen,/戦闘特性/);
assert.match(main,/await wait\(1000\)/);
assert.match(main,/String\(type\)\.includes\("biome"\)\?1500/);
assert.match(main,/String\(type\)\.includes\("biome"\)\?500/);
assert.match(main,/autoResultTimer=setTimeout\(returnToExplore,1000\)/);
assert.match(main,/exploreAutoMenuOpen=false/);
assert.match(exploreScreen,/autoMenuOpen\?"open":""/);
assert.match(main,/for\(let level=1;level<=5;level\+\+\)/);
assert.match(main,/DEFEAT GUIDE 1\/2/);
assert.match(main,/DEFEAT GUIDE 2\/2/);
assert.match(main,/×0\.5／×1／×2／×4/);
assert.match(main,/GM RESET専用コード/);
assert.match(main,/toUpperCase\(\)!=="RESET"/);
assert.match(main,/最終確認/);
assert.match(settingsScreen,/1〜9998/);
assert.match(css,/max-width:36px!important/);
assert.match(css,/height:36px!important/);

console.log(`ABYSS DOMINION v2.4.0 integration regression: PASS (${uniqueFolders.length} sprite folders / ${uniqueFolders.length*frames.length} files)`);
