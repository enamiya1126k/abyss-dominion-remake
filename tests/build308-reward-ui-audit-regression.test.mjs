import test from "node:test";
import assert from "node:assert/strict";

import {
  bossRewardIdentity,
  bossRewardEquipmentIdentity,
} from "../src/core/BossRewardMappingSystem.js";

test("Build308 campaign boss identity alone fixes each multi-boss reward owner", () => {
  for (const [floor, bossIds] of [
    [80, ["ten_time", "ten_space", "ten_life"]],
    [90, ["ten_death", "ten_fate", "ten_chaos"]],
    [100, ["ten_dominion", "ten_creation", "ten_end", "ten_divinity"]],
  ]) {
    for (const campaignBossId of bossIds) {
      const identity = bossRewardIdentity({ campaignBossId }, { floor });
      assert.equal(identity?.ownerId, campaignBossId, `${floor}F/${campaignBossId}`);
      assert.equal(
        bossRewardEquipmentIdentity({ campaignBossId }, 0, { floor })?.ownerId,
        campaignBossId,
        `${floor}F/${campaignBossId} equipment owner`,
      );
    }
  }
});

test("Build308 contradictory campaign and endgame owners fail closed", () => {
  assert.equal(
    bossRewardIdentity(
      { campaignBossId: "ten_time", endgameBossId: "ten_space" },
      { floor: 80 },
    ),
    null,
  );
});
