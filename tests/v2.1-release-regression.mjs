import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {
  MONSTER_STAR_MAX,
  PREMIUM_COST_MULTIPLIER,
  premiumCrystalCost
} from "../src/core/config.js";
import {
  ENDGAME_CHALLENGE_TIERS,
  MANUAL_ENDGAME_DAILY_LIMIT,
  consumeManualEndgameChallenge,
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

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");

assert.equal(PREMIUM_COST_MULTIPLIER,10);
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

assert.ok(teamBattleStageMultiplier(50)>teamBattleStageMultiplier(1)*50);
assert.ok(teamBattleRewardPreview(50).goldMultiplier>teamBattleRewardPreview(1).goldMultiplier*1000);
assert.equal(teamBattleRewardPreview(50).guaranteedRarity,"LR");

for(const relative of [
  "assets/ui/trials/corridor-emblem.png",
  "assets/ui/trials/abyss-ten-emblem.png",
  "assets/ui/attributes/attribute-atlas.png",
  "assets/ui/equipment/weapon-atlas.png",
  "assets/ui/equipment/armor-atlas.png",
  "assets/ui/equipment/accessory-atlas.png",
  "assets/ui/equipment/endgame-abyss-atlas.png",
  "assets/ui/equipment/endgame-ten-atlas.png"
]){
  const file=path.join(root,relative);
  assert.ok(fs.existsSync(file),`Missing release asset: ${relative}`);
  assert.ok(fs.statSync(file).size>1024,`Empty release asset: ${relative}`);
}

console.log("ABYSS DOMINION v2.1.0 release regression: PASS");
