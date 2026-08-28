import { prepareCoopExpeditionV206 } from "./CoopGimmicks.js";

const RARITY_ORDER = Object.freeze(["N", "R", "SR", "SSR", "UR", "LR"]);

export function rareEventChance() {
  // Named export retained for older imports; retired realms have no draw.
  return 0;
}

export function chooseRareEvent() {
  // Legacy forceRare values are intentionally ignored.
  return null;
}

export function prepareOnlineExpansionV207(expedition, {
  ownerId,
  hostWorld,
  contribution = null,
  participants = 1,
  resonance = 0,
  forceRare: _legacyForceRare = null,
} = {}) {
  const partySize = Math.max(1, Math.min(4, Math.floor(Number(participants) || 1)));
  prepareCoopExpeditionV206(expedition, { leaderId: ownerId, hostWorld, contribution, participants: partySize });
  expedition.hostOwnerId = ownerId;
  expedition.coop ??= {};
  expedition.coop.resonance = partySize < 2 ? null : {
    level: Math.max(0, Math.min(5, Number(resonance) || 0)),
    max: 5,
    rewardBonusPct: Math.max(0, Math.min(15, (Number(resonance) || 0) * 3)),
    contributionBonusPct: Math.max(0, Math.min(10, (Number(resonance) || 0) * 2)),
  };
  expedition.coop.ownerDisconnectedAt = 0;
  expedition.coop.ownerReconnectDeadline = 0;

  // The dedicated rare realms were retired in build184. Keep only the empty
  // state shape so old snapshots/clients can be normalized without switching
  // away from the host's ordinary exploration map.
  void _legacyForceRare;
  expedition.coop.rare = {
    kind: null,
    resolved: true,
    merchantClaims: {},
    portalEntered: false,
    guardianDefeated: false,
    realmActive: false,
    portalReturned: false,
  };
  return expedition;
}

export function personalBonusDraw(random = Math.random, { floor = 1, resonance = 0, premium = false } = {}) {
  const chance = Math.min(.4, (premium ? .25 : .18) + Math.max(0, Number(resonance)) * .03);
  if (random() >= chance) return null;
  const roll = random();
  if (roll < .42) return { reward: { gold: Math.max(500, Math.round((Number(floor) + 10) * (premium ? 280 : 130))) }, label: "追加GOLD" };
  if (roll < .68) return { reward: { captureCrystals: premium ? 2 : 1 }, label: "追加捕獲結晶" };
  const rarityRoll = random(), rarity = rarityRoll > .985 ? "LR" : rarityRoll > .90 ? "UR" : rarityRoll > .64 ? "SSR" : "SR";
  return { reward: { randomEquipmentRarity: rarity }, label: `${rarity}装備`, rarity };
}

export function firstClearEquipmentRarity(floor = 1) {
  const value = Math.max(1, Number(floor) || 1);
  if (value >= 1000) return "LR";
  if (value >= 500) return "UR";
  if (value >= 100) return "SSR";
  if (value >= 30) return "SR";
  return "R";
}

export function rarityAtLeast(rarity, threshold = "UR") {
  return RARITY_ORDER.indexOf(String(rarity)) >= RARITY_ORDER.indexOf(String(threshold));
}

export function resonanceContributionScore(value = {}, resonance = 0) {
  const base = Math.max(0, Math.round(
    (Number(value.exploration) || 0) * 100 +
    (Number(value.combat) || 0) +
    (Number(value.rescue) || 0) * 500 +
    (Number(value.chests) || 0) * 250 +
    (Number(value.switches) || 0) * 400 +
    (Number(value.gimmicks) || 0) * 450 +
    (Number(value.pings) || 0) * 40 +
    (Number(value.support) || 0) * .4
  ));
  return Math.round(base * (1 + Math.max(0, Math.min(5, Number(resonance) || 0)) * .02));
}
