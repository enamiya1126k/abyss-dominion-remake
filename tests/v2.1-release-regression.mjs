import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {
  APP_VERSION,
  COMBAT_POWER_DISPLAY_SCALE,
  ENDGAME_MAX_LEVEL,
  MONSTER_STAR_MAX,
  MONSTER_STORAGE_CAP,
  PREMIUM_COST_MULTIPLIER,
  premiumCrystalCost
} from "../src/core/config.js";
import {
  ENDGAME_CHALLENGE_TIERS,
  MANUAL_ENDGAME_DAILY_LIMIT,
  applyPreludeToEncounter,
  attemptEndgameContract,
  consumeManualEndgameChallenge,
  createTeamBattleEncounter,
  endgameContractStatus,
  endgameFactionStatMultiplier,
  manualEndgameTierStatus,
  normalizeEndgameState,
  recordManualEndgameClear,
  teamBattleRewardPreview,
  teamBattleStageMultiplier
} from "../src/core/EndgameSystem.js";
import {EQUIPMENT_BASES, equipmentIconMeta} from "../src/data/equipment.js";
import {biomeForFloor} from "../src/data/biomes.js";
import {calculatedStats, createMonster, rollInnateStars} from "../src/models/Monster.js";
import {maxMp} from "../src/battle/SkillSystem.js";
import {monsterCombatPower, normalizeCombatPowerRecord} from "../src/core/CombatPower.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");

assert.equal(PREMIUM_COST_MULTIPLIER,10);
assert.equal(APP_VERSION,"2.10.0");
assert.equal(MONSTER_STORAGE_CAP,3000);
assert.equal(ENDGAME_MAX_LEVEL,99999);
assert.equal(COMBAT_POWER_DISPLAY_SCALE,90);
assert.equal(premiumCrystalCost(5),50);
assert.equal(premiumCrystalCost(45),450);

assert.equal(MONSTER_STAR_MAX,10);
assert.equal(rollInnateStars(()=>0),1);
assert.equal(rollInnateStars(()=>.999999),10);
const oneStar=createMonster("slime",{stars:1,level:50,ivs:{hp:75,atk:75,def:75,spd:75},traitId:"steady"});
const tenStar=createMonster("slime",{stars:10,level:50,ivs:{hp:75,atk:75,def:75,spd:75},traitId:"steady"});
assert.equal(oneStar.stars,1);
assert.equal(tenStar.stars,10);
assert.ok(calculatedStats(tenStar).hp>calculatedStats(oneStar).hp);
assert.ok(calculatedStats(tenStar).atk>calculatedStats(oneStar).atk);

assert.equal(endgameFactionStatMultiplier("abyss"),10);
assert.equal(endgameFactionStatMultiplier("tenGod"),100);
assert.deepEqual(ENDGAME_CHALLENGE_TIERS.map(tier=>tier.fragmentReward),[1,3,5,10]);
assert.deepEqual(ENDGAME_CHALLENGE_TIERS.map(tier=>tier.id),["projection50","projection100","manifest50","manifest100"]);
assert.deepEqual(ENDGAME_CHALLENGE_TIERS.map(tier=>tier.level),[999,4999,9999,99999]);
const manualEncounter={enemies:[{level:1,statMultiplier:1,nameOverride:"深淵〈40%〉"},{level:1,statMultiplier:1}]};
applyPreludeToEncounter(manualEncounter,ENDGAME_CHALLENGE_TIERS[3]);
assert.equal(manualEncounter.enemies[0].level,99999);
assert.equal(manualEncounter.enemies[0].statMultiplier,50);

const manualState={player:{currentFloor:1000,maxFloor:1000},flags:{},endgame:{}};
normalizeEndgameState(manualState);
assert.equal(manualEndgameTierStatus(manualState,"abyss_gluttony").highestUnlocked,1);
assert.equal(consumeManualEndgameChallenge(manualState,"abyss_gluttony","projection100").ok,false);
assert.equal(consumeManualEndgameChallenge(manualState,"abyss_gluttony","projection50").ok,true);
assert.equal(recordManualEndgameClear(manualState,"abyss_gluttony","projection50",true).highestUnlocked,2);
assert.equal(consumeManualEndgameChallenge(manualState,"abyss_gluttony","projection100").ok,true);
assert.equal(consumeManualEndgameChallenge(manualState,"abyss_gluttony","projection100").ok,true);
assert.equal(manualEndgameTierStatus(manualState,"abyss_gluttony").remaining,0);
assert.equal(MANUAL_ENDGAME_DAILY_LIMIT,3);

const contractState={player:{currentFloor:1000,maxFloor:1000},flags:{},endgame:{}};
normalizeEndgameState(contractState);
contractState.endgame.emergency.fragments.abyss_gluttony=50;
assert.equal(endgameContractStatus(contractState,"abyss_gluttony").canContract,true);
const contract=attemptEndgameContract(contractState,"abyss_gluttony",1000);
assert.equal(contract.success,true);
assert.equal(contract.spent,50);
assert.equal(contractState.endgame.emergency.fragments.abyss_gluttony,0);

assert.equal(Object.values(EQUIPMENT_BASES).flat().length,54);
assert.deepEqual(Object.fromEntries(Object.entries(EQUIPMENT_BASES).map(([slot,items])=>[slot,items.length])),{weapon:30,armor:12,accessory:12});
for(const [slot,items] of Object.entries(EQUIPMENT_BASES))for(const item of items){
  const meta=equipmentIconMeta({...item,slot});
  assert.equal(meta.slot,slot);
  assert.ok(meta.column>=0&&meta.row>=0);
}

assert.equal(biomeForFloor(101).theme,"fire");
assert.equal(biomeForFloor(150).theme,"fire");
assert.equal(biomeForFloor(151).theme,"ice");
assert.equal(biomeForFloor(201).theme,"poison");
assert.equal(biomeForFloor(601).theme,"fire");
assert.equal(biomeForFloor(101).to-biomeForFloor(101).from+1,50);

assert.ok(teamBattleStageMultiplier(50)>teamBattleStageMultiplier(49));
assert.ok(teamBattleStageMultiplier(50)/teamBattleStageMultiplier(49)<1.15);
assert.ok(teamBattleRewardPreview(50).goldMultiplier>teamBattleRewardPreview(1).goldMultiplier);
assert.equal(teamBattleRewardPreview(50).guaranteedRarity,"LR");
const infiniteState={player:{currentFloor:1000,maxFloor:1000},flags:{},endgame:{teamBattle:{stage:51,dailyAttempts:0,totalWins:0,totalLosses:0}}};
assert.equal(createTeamBattleEncounter(infiniteState).length,4);
assert.ok(teamBattleStageMultiplier(51)>teamBattleStageMultiplier(50));
infiniteState.endgame.teamBattle.stage=60;
assert.ok(createTeamBattleEncounter(infiniteState)[0].faction==="tenGod");

const normal=createMonster("slime",{level:300,stars:10,rank:4});
const abyss={...normal,endgameFaction:"abyss",endgameBossId:"abyss_gluttony",isContractedEndgame:true};
const tenGod={...normal,endgameFaction:"tenGod",endgameBossId:"ten_fire",isContractedEndgame:true};
assert.ok(calculatedStats(abyss).hp/calculatedStats(normal).hp>9.9);
assert.ok(calculatedStats(tenGod).hp/calculatedStats(normal).hp>99);
assert.ok(maxMp(normal)>250);
assert.ok(maxMp(abyss)>maxMp(normal)*2);
assert.ok(maxMp(tenGod)>maxMp(abyss));
assert.ok(monsterCombatPower(tenGod)<100000,"displayed combat power must remain readable");
const oldRecordState={records:{combatPower:{scaleVersion:3,highest:7_000_000_000,previous:6_000_000_000,history:[]}}};
assert.equal(normalizeCombatPowerRecord(oldRecordState).scaleVersion,4);
assert.ok(oldRecordState.records.combatPower.highest<7_000_000_000);

for(const relative of [
  "assets/ui/trials/corridor-emblem.png",
  "assets/ui/trials/abyss-ten-emblem.png",
  "assets/ui/attributes/attribute-atlas.png",
  "assets/ui/equipment/weapon-atlas.png",
  "assets/ui/equipment/armor-atlas.png",
  "assets/ui/equipment/accessory-atlas.png",
  "assets/ui/equipment/endgame-abyss-atlas.png",
  "assets/ui/equipment/endgame-ten-atlas.png"
  ,"assets/ui/battle/fire-stratum.png"
  ,"assets/ui/battle/ice-stratum.png"
  ,"assets/ui/battle/poison-stratum.png"
  ,"assets/ui/battle/boss-throne.png"
  ,"assets/ui/battle/abyss-reality.png"
  ,"assets/ui/battle/ten-gods-domain.png"
  ,"assets/ui/explore/empty-water-basin.png"
  ,"assets/audio/main-bgm.mp3"
  ,"assets/audio/dungeon-bgm.mp3"
  ,"assets/audio/battle-bgm.mp3"
  ,"assets/audio/boss-bgm.mp3"
  ,"assets/audio/elite-bgm.mp3"
  ,"assets/audio/abyss-bgm.mp3"
  ,"assets/audio/ten-gods-bgm.mp3"
]){
  const file=path.join(root,relative);
  assert.ok(fs.existsSync(file),`Missing release asset: ${relative}`);
  assert.ok(fs.statSync(file).size>1024,`Empty release asset: ${relative}`);
}

console.log("ABYSS DOMINION v2.4.0 release regression: PASS");
