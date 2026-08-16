import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{weekdayGachaSchedule,weekdayGachaCost}from"../src/core/WeekdayGachaSystem.js";
import{ABYSS_SKILL_NODES,ABYSS_SKILL_TREE_VERSION,normalizeAbyssSkillTree}from"../src/core/AbyssSkillTreeSystem.js";
import{MAGIC_CIRCLES,magicCircleUpgradePrice}from"../src/core/MagicCircleSystem.js";
import{createEndgameTrialEncounter}from"../src/core/EndgameSystem.js";
import{ENDGAME_CHARACTERS}from"../src/data/endgameCharacters.js";
import{MYTHIC_SERIAL_SPECIES}from"../src/data/mythicSerialSpecies.js";
import{canEquipInSubslot}from"../src/services/EquipmentLoadoutSystem.js";
import{createSignatureEquipment,signatureEligibleOwners,signatureEquipmentOwnerName,signatureSetState,signatureStatBonuses}from"../src/core/SignatureWeaponSystem.js";

const read=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");

test("JST weekday altar follows the fixed weekly calendar",()=>{
 const expected=["experience","signature","experience","signature","experience","signature","sunday"];
 for(let offset=0;offset<7;offset++)assert.equal(weekdayGachaSchedule(new Date(Date.parse("2026-08-17T03:00:00Z")+offset*86400000)).kind,expected[offset]);
 assert.deepEqual(weekdayGachaSchedule(new Date("2026-08-23T03:00:00Z")).factions,["abyss"]);
 assert.deepEqual(weekdayGachaSchedule(new Date("2026-08-30T03:00:00Z")).factions,["abyss","tenGod"]);
 assert.equal(weekdayGachaCost("signature",10),162);
});

test("every Abyss tree node is cheaper and old investment is refunded once",()=>{
 assert.equal(ABYSS_SKILL_TREE_VERSION,6);
 assert.ok(ABYSS_SKILL_NODES.length>250);
 for(const node of ABYSS_SKILL_NODES)assert.ok(node.cost<=(node.legacyCost??node.cost),`${node.id} was not discounted`);
 const node=ABYSS_SKILL_NODES.find(entry=>entry.legacyCost>entry.cost),state={player:{gold:1000},monsters:[],party:[],abyssSkillTree:{version:5,learned:[node.id],paidCosts:{[node.id]:node.legacyCost}}};
 normalizeAbyssSkillTree(state);const after=state.player.gold;
 assert.equal(after,1000+node.legacyCost-node.cost);assert.equal(state.abyssSkillRebalance.version,6);
 normalizeAbyssSkillTree(state);assert.equal(state.player.gold,after,"refund must be idempotent");
});

test("magic-circle strengthening is drastically cheaper",()=>{
 for(const circle of MAGIC_CIRCLES.filter(entry=>entry.id!=="none")){
  const first=magicCircleUpgradePrice(circle,1);assert.ok(first>=1000);assert.ok(first<=circle.baseUpgrade*.04,`${circle.id} remains too expensive`);
 }
});

test("Naraku Corridor difficulty is fixed, gradual and durable",()=>{
 const low=createEndgameTrialEncounter({player:{maxFloor:100},monsters:[],equipment:[]},1),high=createEndgameTrialEncounter({player:{maxFloor:9999},monsters:[],equipment:[]},1),later=createEndgameTrialEncounter({player:{maxFloor:100},monsters:[],equipment:[]},7);
 assert.deepEqual(low.enemies,high.enemies,"player progress must not scale the corridor");
 assert.equal(low.enemies[0].enemyFloor,220);assert.equal(low.enemies[0].fixedTrialScaling,true);assert.ok(low.enemies[0].fixedTrialHpMultiplier>=4);
 assert.ok(later.enemies[0].level>low.enemies[0].level);assert.ok(later.enemies[0].statMultiplier>low.enemies[0].statMultiplier);
});

test("Rion has the fastest base SPD in the four-person party",()=>{
 const speed=id=>MYTHIC_SERIAL_SPECIES[id].baseStats.spd;
 assert.ok(speed("myth_rion")>Math.max(speed("myth_enami"),speed("myth_yori"),speed("myth_hide")));
});

test("all LR+ owners can build a labelled 1/2/4/6 exclusive set",()=>{
 const monster={id:"owner",speciesId:"slime",summonRarity:"LR",level:999,equipment:{}},state={party:[monster.id],monsters:[monster],equipment:[]};
 assert.equal(signatureEligibleOwners(state)[0].ownerId,"slime");
 const subslots=["weaponRight","weaponLeft","armorBody","armorSupport","accessoryNeck","accessoryFinger"];
 for(let index=0;index<6;index++){const item=createSignatureEquipment("slime",index);state.equipment.push(item);monster.equipment[subslots[index]]=item.id;assert.equal(signatureEquipmentOwnerName(item),"スライム")}
 const resonance=signatureSetState(state,monster);assert.equal(resonance.pieces,6);assert.equal(resonance.milestone,6);assert.equal(resonance.definition.awakened,true);assert.equal(resonance.status,"専用共鳴 6/6");
 const bonus=signatureStatBonuses(state,monster);assert.ok(bonus.hp>=.18&&bonus.atk>=.2&&bonus.spd>=.16);
 const wrong={id:"wrong",speciesId:"goblin",summonRarity:"LR",level:999,equipment:{}};assert.equal(canEquipInSubslot(state.equipment[0],wrong,"weaponRight"),false);
});

test("all 17 Deep/Ten characters keep unique skills and six exclusive pieces",()=>{
 const characters=Object.values(ENDGAME_CHARACTERS),skills=characters.flatMap(character=>character.skills);
 assert.equal(characters.length,17);assert.equal(new Set(characters.map(character=>character.signatureName)).size,17);assert.equal(new Set(skills.map(skill=>skill.id)).size,skills.length);
 for(const character of characters){assert.equal(character.skills.length,5,character.id);assert.equal(character.gear.length,6,character.id);assert.deepEqual(Object.keys(character.setText).map(Number),[2,4,6])}
});

test("build160 UI and economy rules remain wired to the app",async()=>{
 const[main,styles,index]=await Promise.all([read("src/main.js"),read("src/Styles/v2.10.0.css"),read("index.html")]);
 for(const token of["潤沢なGOLD","魔晶石 ×","bossExperiencePackAmount","宝箱探索セット"])assert.ok(main.includes(token),token);
 assert.match(main,/return pool\.map\(value=>\(\{value,sort:Math\.random\(\)\}\)\)\.sort/);assert.match(main,/restGoldCost\(recovery\)/);assert.match(main,/\/250\+\(Number\(recovery\.mp\)/);
 assert.match(main,/id:"reviveLeaves"[^}]+price:60000/);assert.match(main,/function resolveRandomSkillElement/);assert.match(main,/battleFloor=prepared\.fixedTrialScaling\?hiddenFloor/);
 assert.match(styles,/grid-template-areas:"art copy" "actions actions"/);assert.match(styles,/home-shop-buy-actions\{grid-area:actions/);assert.match(styles,/weekday-gacha-calendar/);assert.match(index,/ASSET_BUILD = "build160"/);
});
