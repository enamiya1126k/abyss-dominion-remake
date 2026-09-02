import test from"node:test";
import assert from"node:assert/strict";
import{readdir,readFile}from"node:fs/promises";
import{dirname,relative,resolve}from"node:path";
import{fileURLToPath}from"node:url";

const SRC_ROOT=fileURLToPath(new URL("../src/",import.meta.url));
const CURRENT_QUERY="?v=3.0.1-build301";
// Build300 -> build301 logic changes plus the three dependency carriers whose
// import URLs had to change so the new graph actually reaches the browser.
const CHANGED_BROWSER_MODULES=new Set([
 "battle/EnemyAI.js","battle/TurnSystem.js",
 "core/AbyssSkillTreeSystem.js","core/AchievementRewardSystem.js","core/BossRewardSystem.js","core/Campaign100System.js","core/CampaignRewardSystem.js","core/CollectionRewardSystem.js","core/CombatPower.js","core/DungeonSectionSystem.js","core/EndgameSystem.js","core/EquipmentDropSystem.js","core/ExperiencePackSystem.js","core/GachaBalanceSystem.js","core/GoldRewardSystem.js","core/MagicCircleSystem.js","core/ProgressionSystem.js","core/ReturnRewardSystem.js","core/SecondWorldEventSystem.js","core/SecretRoomSystem.js","core/SerialCodeSystem.js","core/TreasureSystem.js","core/WorldSystem.js","core/config.js",
 "main.js","models/Monster.js",
 "online/OnlinePartyClient.js","online/OnlineProgressIsolation.js","online/OnlineViews.js",
 "services/EquipmentAffixCrafting.js","services/EquipmentStorage.js","services/SaveService.js",
 "ui/MonsterVisual.js","ui/components/MonsterCard.js",
 "ui/screens/AbyssSkillTreeScreen.js","ui/screens/BattleScreen.js","ui/screens/EquipmentScreen.js","ui/screens/ExploreScreen.js","ui/screens/FormationScreen.js","ui/screens/GauntletScreen.js","ui/screens/HomeScreen.js","ui/screens/InventoryScreen.js","ui/screens/MonsterDetailScreen.js","ui/screens/MonsterListScreen.js","ui/screens/OnlinePartyScreen.js","ui/screens/SettingsScreen.js","ui/screens/ShopScreen.js","ui/screens/SkillScreen.js"
]);

async function javascriptFiles(directory=SRC_ROOT){
 const result=[];
 for(const entry of await readdir(directory,{withFileTypes:true})){
  const path=resolve(directory,entry.name);
  if(entry.isDirectory())result.push(...await javascriptFiles(path));
  else if(entry.isFile()&&entry.name.endsWith(".js"))result.push(path);
 }
 return result
}

test("build301 changed browser modules have no stale import-query edges",async()=>{
 const files=await javascriptFiles(),checked=[];
 for(const importer of files){
  const source=await readFile(importer,"utf8"),pattern=/(?:from\s*|import\s*\()(["'])([^"']+)\1/g;
  for(const match of source.matchAll(pattern)){
   const specifier=match[2],bare=specifier.split("?")[0];if(!bare.startsWith("."))continue;
   const target=relative(SRC_ROOT,resolve(dirname(importer),bare)).replaceAll("\\","/");
   if(!CHANGED_BROWSER_MODULES.has(target))continue;
   checked.push(`${relative(SRC_ROOT,importer)} -> ${target}`);
   assert.equal(specifier,`${bare}${CURRENT_QUERY}`,`${relative(SRC_ROOT,importer)} imports changed ${target} through a stale cache identity`);
  }
 }
 assert.ok(checked.length>=70,`expected the active build301 dependency graph, checked only ${checked.length} edges`);
});

test("build301 entry point is cache-busted by the active release identity",async()=>{
 const index=await readFile(new URL("../index.html",import.meta.url),"utf8");
 assert.match(index,/const ASSET_VERSION = "3\.0\.1"/);
 assert.match(index,/const ASSET_BUILD = "build301"/);
 assert.match(index,/import\(`\.\/src\/main\.js\?v=\$\{ASSET_VERSION\}-\$\{ASSET_BUILD\}`\)/);
});
