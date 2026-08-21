import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";

import {FLOOR_BOSS_CATALOG,floorBossActionInfo,floorBossDefinitionForFloor} from "../src/data/floorBosses.js?v=2.11.2-build166";
import {FLOOR_BOSS_SPRITE_FOLDERS} from "../src/data/monsterCatalog.js?v=2.11.2-build166";
import {SPECIES} from "../src/data/species.js?v=2.11.2-build166";
import {createEnemyBattleState} from "../src/battle/EnemyAI.js?v=2.11.2-build166";

const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const opening=[
 {floor:10,name:"黒鉄の剣王",element:"earth",title:"始まりの洞窟",weapon:"洞核断剣",visual:"floor_boss_010"},
 {floor:20,name:"翠風の鏡術師",element:"wind",title:"地下樹宮",weapon:"翠嵐反照杖",visual:"floor_boss_020"},
 {floor:30,name:"熔城の城塞公",element:"fire",title:"灼熱の城塞",weapon:"熾岩城塞槌",visual:"floor_boss_030"},
 {floor:40,name:"氷迅の疾風侯",element:"ice",title:"凍結回廊",weapon:"氷晶瞬牙",visual:"floor_boss_040"},
 {floor:50,name:"星祷の命紡ぎ",element:"light",title:"星金古神殿",weapon:"星祷命環杖",visual:"floor_boss_050"},
 {floor:60,name:"深潮の封陣卿",element:"dark",title:"深淵門",weapon:"深潮封律典",visual:"floor_boss_060"},
 {floor:70,name:"瘴牙の双牙将",element:"poison",title:"瘴毒奈落",weapon:"瘴牙双極刃",visual:"floor_boss_070"},
 {floor:80,name:"虚鐘の葬鐘守",element:"dark",title:"虚無奈落",weapon:"虚鐘葬鐘鎌",visual:"floor_boss_080"},
 {floor:90,name:"火冠の冠位竜",element:"fire",title:"火冠奈落",weapon:"火冠竜槍",visual:"floor_boss_090"}
];

const build165IdleHashes=new Map([
 [10,"62ddc429874b81e849055efbdb3c55ba246b5bd4601ce5e5c483fd851aef018b"],
 [20,"dfde5d4cf6395669c07cb96d77a77a9a17ba1cc90cfd6c693fba23628e86a280"],
 [30,"bb454e7b3b6712e35b831f5bc169a73fd1807b8006499ca69c8c5e118ee529e6"],
 [40,"fb119e250c4795ffe365ddd9f92691dad35ad87aba0bcc76cc51c9add000b8e3"],
 [50,"4f7a4176e9da286da7a68b2eaa3a7d58491346d63242ba93b098ef8361228097"],
 [60,"c92591296f87c4f98ea504b5a2ab4d9f91bc402467ed17f1be0c910d61e67ff6"],
 [70,"787f6e3e898d3cfdb8b70b410acf52844fe61618cd112c57fd525b5c18d93da6"],
 [80,"53c88a6408131caa14a10ccafc3f07f7fa34b9d3a3c2d5a0273b12987aa27590"],
 [90,"0e3666fe110afcbdd9ca6be8daee7a8efe6626512dd43e1460e2a27bf18a4d12"]
]);

test("10F–90F identities match the real dungeon sequence",()=>{
 const bosses=FLOOR_BOSS_CATALOG.slice(0,9),labels=new Set(),quotes=new Set(),weapons=new Set(),weaponStats=new Set();
 assert.equal(bosses.length,9);
 for(const expected of opening){
  const boss=floorBossDefinitionForFloor(expected.floor);
  assert.equal(boss.name,expected.name);assert.equal(boss.element,expected.element);assert.equal(boss.visualSpeciesId,expected.visual);
  assert.match(boss.title,new RegExp(expected.title));assert.match(boss.dedicatedWeapon.name,new RegExp(`^${expected.weapon}・`));
  assert.equal(boss.uncapturable,true);assert.equal(boss.actionIds.length,4);quotes.add(boss.quote);weapons.add(boss.dedicatedWeapon.name);weaponStats.add(JSON.stringify(boss.dedicatedWeapon.stats));
  for(const id of boss.actionIds){
   const action=floorBossActionInfo(`floorBoss:${id}`);assert.ok(action?.label,id);assert.equal(labels.has(action.label),false,action.label);labels.add(action.label);
   if(action.element)assert.equal(action.element,expected.element,action.label);
  }
 }
 assert.equal(labels.size,36);assert.equal(quotes.size,9);assert.equal(weapons.size,9);assert.equal(weaponStats.size,9);
});

test("seven mismatched visuals were replaced while both magma bosses were retained",()=>{
 for(const expected of opening){
  const folder=FLOOR_BOSS_SPRITE_FOLDERS[expected.visual],file=join(root,"assets","monsters",folder,"idle1.png"),hash=createHash("sha256").update(readFileSync(file)).digest("hex");
  if([30,90].includes(expected.floor))assert.equal(hash,build165IdleHashes.get(expected.floor),`${expected.floor}F magma visual retained`);
  else assert.notEqual(hash,build165IdleHashes.get(expected.floor),`${expected.floor}F visual remade`);
 }
});

test("floor-boss element and role override the balance-only base species",()=>{
 for(const expected of opening){
  const boss=floorBossDefinitionForFloor(expected.floor),species=SPECIES[boss.speciesId];
  const enemy=createEnemyBattleState(species,{speciesId:boss.speciesId,level:Math.max(14,expected.floor),boss:true,combatRarity:boss.rarity,floorBossStats:boss.stats,trialElement:boss.element,attribute:boss.element,role:boss.role},expected.floor);
  assert.equal(enemy.element,expected.element);assert.equal(enemy.role,boss.role);
 }
});

test("build166 routes, cache busting and finite boss barriers are wired",()=>{
 const main=readFileSync(join(root,"src","main.js"),"utf8"),enemyAi=readFileSync(join(root,"src","battle","EnemyAI.js"),"utf8"),index=readFileSync(join(root,"index.html"),"utf8"),config=readFileSync(join(root,"src","core","config.js"),"utf8");
 assert.match(main,/attribute:definition\.element,trialElement:definition\.element,role:definition\.role/);
 assert.match(enemyAi,/element:source\.trialElement\?\?source\.attribute\?\?source\.element\?\?species\.element/);
 assert.match(enemyAi,/if\(\(enemy\.divineBarrier\?\?0\)>0\)enemy\.divineBarrier--;/);
 assert.match(index,/build166\.css\?v=2\.11\.2-build166/);assert.match(index,/ASSET_VERSION = "2\.11\.2"/);assert.match(index,/ASSET_BUILD = "build166"/);
 assert.match(config,/APP_VERSION="2\.11\.2"/);assert.equal(config.includes("SAVE_SCHEMA_VERSION=56"),true);
});
