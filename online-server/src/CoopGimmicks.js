import { coopBossFor, coopBossObjectMeta } from "./CoopBossCatalog.js";
import { campaignFloorToLegacyDepth } from "./CampaignFloorScale.js";

const GIMMICKS = Object.freeze(["dualSwitch", "relaySeal", "resonanceChest", "splitKey", "eliteVault"]);

function pointKey(point) { return `${point.x},${point.y}`; }
function hashText(value) {
  let hash = 2166136261;
  for (const char of String(value)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

export function coopFloorTier(floor = 1) {
  const value = campaignFloorToLegacyDepth(floor);
  if (value >= 1000) return { id: "abyss", label: "深淵級", rank: 4, multiplier: 2.4 };
  if (value >= 500) return { id: "gold", label: "金級", rank: 3, multiplier: 1.85 };
  if (value >= 100) return { id: "silver", label: "銀級", rank: 2, multiplier: 1.35 };
  return { id: "black-iron", label: "黒鉄級", rank: 1, multiplier: 1 };
}

export function coopParticipantTier(count = 1) {
  const value = Math.max(1, Math.min(4, Math.floor(Number(count) || 1)));
  if (value >= 4) return { id: "abyss", label: "深淵共鳴", rank: 4, multiplier: 2, extraRolls: 1 };
  if (value >= 3) return { id: "gold", label: "黄金共鳴", rank: 3, multiplier: 1.5, extraRolls: 0 };
  if (value >= 2) return { id: "silver", label: "白銀共鳴", rank: 2, multiplier: 1, extraRolls: 0 };
  // A one-player online room is ordinary exploration, not a weakened co-op
  // mode.  Keeping the multiplier at exactly one is important for parity with
  // the same floor played offline.
  return { id: "solo", label: "通常探索", rank: 0, multiplier: 1, extraRolls: 0 };
}

export function coopRewardTier(floor, participantCount) {
  const floorTier = coopFloorTier(floor), participantTier = coopParticipantTier(participantCount);
  const visual = floorTier.rank >= participantTier.rank ? floorTier : participantTier;
  const visualLabel = ({ "black-iron": "黒鉄級", silver: "銀級", gold: "金級", abyss: "深淵級" })[visual.id] ?? floorTier.label;
  return {
    id: visual.id,
    visualLabel,
    floorTierLabel: floorTier.label,
    participantTierLabel: participantTier.label,
    label: `${floorTier.label}・${participantTier.label}`,
    multiplier: floorTier.multiplier * participantTier.multiplier,
    extraRolls: participantTier.extraRolls,
  };
}

export function coopGimmickFor({ leaderId = "ROOM", floor = 1 } = {}) {
  const value = Math.max(1, Math.floor(Number(floor) || 1));
  const seed = hashText(`build206:gimmick:${leaderId}:${value}`);
  return GIMMICKS[seed % GIMMICKS.length];
}

export function prepareCoopExpeditionV206(expedition, { leaderId, hostWorld, contribution = null, participants = 1 } = {}) {
  const rng = seededRandom(hashText(`build206:coop:${leaderId}:${expedition.floor}`));
  const occupied = new Set([
    pointKey(expedition.start),
    pointKey(expedition.exit),
    ...expedition.objects.map(pointKey),
    ...(expedition.decorations ?? []).map(pointKey),
  ]);
  const cells = [];
  for (let y = 1; y < expedition.rows - 1; y++) for (let x = 1; x < expedition.cols - 1; x++) {
    if (expedition.tiles[y]?.[x] !== "." || occupied.has(`${x},${y}`)) continue;
    if (Math.abs(x - expedition.start.x) + Math.abs(y - expedition.start.y) <= 4) continue;
    cells.push({ x, y });
  }
  const take = () => {
    if (!cells.length) return { ...expedition.start };
    const index = Math.floor(rng() * cells.length), point = cells.splice(index, 1)[0];
    occupied.add(pointKey(point));
    return point;
  };
  const farFrom = source => {
    if (!cells.length) return { ...expedition.start };
    let best = cells[0], distance = -1;
    for (const point of cells) {
      const next = Math.abs(point.x - source.x) + Math.abs(point.y - source.y);
      if (next > distance) { distance = next; best = point; }
    }
    cells.splice(cells.indexOf(best), 1);
    occupied.add(pointKey(best));
    return best;
  };

  const opened = new Set(hostWorld?.openedChestIds?.[String(expedition.floor)] ?? []);
  let normalIndex = 0;
  for (const object of expedition.objects.filter(entry => entry.type === "chest")) {
    const hostChestKey = `${expedition.floor}-${normalIndex++}`;
    object.hostChestKey = hostChestKey;
    if (opened.has(hostChestKey) || opened.has(object.id)) object.resolved = true;
  }

  const partySize = Math.max(1, Math.min(4, Math.floor(Number(participants) || 1)));
  const multiplayer = partySize >= 2;
  const bossFloor = Number(expedition.floor) % 10 === 0;
  const withoutGimmick = () => {
    const floorTier = coopFloorTier(expedition.floor), participantTier = coopParticipantTier(partySize), rewardTier = coopRewardTier(expedition.floor, partySize);
    expedition.hostOwnerId = leaderId;
    expedition.coop = {
      enabled: multiplayer,
      gimmickType: null,
      optionalFeature: null,
      floorTier: floorTier.id,
      floorTierLabel: floorTier.label,
      partySize,
      participantTier: participantTier.id,
      participantTierLabel: participantTier.label,
      rewardTier: rewardTier.id,
      rewardTierLabel: rewardTier.visualLabel,
      rewardScaleLabel: rewardTier.label,
      switchHoldStartedAt: 0,
      switchUnlocked: false,
      switchResolution: null,
      relayStage: 0,
      relayFirstPlayerId: null,
      relayExpiresAt: 0,
      keyHolders: {},
      keyCombined: false,
      eliteBattleStarted: false,
      eliteDefeated: false,
    };
    expedition.contribution = contribution ?? {};
    expedition.interactions = {};
    return expedition;
  };
  if (!multiplayer || bossFloor || cells.length < 3) return withoutGimmick();

  const type = coopGimmickFor({ leaderId, floor: expedition.floor });
  const coopBoss = coopBossFor({ ownerId: leaderId, floor: expedition.floor });
  const bossMeta = coopBossObjectMeta(coopBoss);
  const floorTier = coopFloorTier(expedition.floor), participantTier = coopParticipantTier(participants), rewardTier = coopRewardTier(expedition.floor, participants);
  const first = take(), second = farFrom(first), reward = take();
  // Every object below is one component of the single optional gimmick chosen
  // for this floor.  These markers let clients and regression tests distinguish
  // the additive co-op overlay from the host's untouched ordinary map objects.
  const push = (...objects) => expedition.objects.push(...objects.map(object => ({
    rewardTier: rewardTier.id,
    coopOnly: true,
    optional: true,
    nonBlocking: true,
    onlineAdded: true,
    gimmickType: type,
    ...object,
  })));

  if (type === "dualSwitch") {
    push(
      { id: "coop-switch-a", type: "coopSwitch", ...first, resolved: false, active: false, occupied: false, progress: 0, persistent: true },
      { id: "coop-switch-b", type: "coopSwitch", ...second, resolved: false, active: false, occupied: false, progress: 0, persistent: true },
      { id: "coop-vault", type: "resonanceVault", ...reward, resolved: false, unlocked: false, persistent: true },
      { id: "coop-elite", type: "coopElite", ...reward, ...bossMeta, resolved: false, hidden: true, persistent: true },
      { id: "coop-deluxe-chest", type: "deluxeChest", ...reward, resolved: false, hidden: true },
    );
  } else if (type === "relaySeal") {
    push(
      { id: "coop-relay-a", type: "relaySeal", seal: "A", ...first, resolved: false, active: false, persistent: true },
      { id: "coop-relay-b", type: "relaySeal", seal: "B", ...second, resolved: false, active: false, persistent: true },
      { id: "coop-deluxe-chest", type: "deluxeChest", ...reward, resolved: false, hidden: true },
    );
  } else if (type === "resonanceChest") {
    push({ id: "coop-resonance-chest", type: "resonanceChest", ...reward, resolved: false, nearbyCount: 0 });
  } else if (type === "splitKey") {
    push(
      { id: "coop-key-cyan", type: "keyFragment", fragment: "cyan", ...first, resolved: false },
      { id: "coop-key-violet", type: "keyFragment", fragment: "violet", ...second, resolved: false },
      { id: "coop-combined-key", type: "combinedKey", ...reward, resolved: false, hidden: true, persistent: true },
      { id: "coop-deluxe-chest", type: "deluxeChest", ...reward, resolved: false, hidden: true },
    );
  } else {
    push(
      { id: "coop-vault", type: "resonanceVault", ...reward, resolved: false, unlocked: true, persistent: true },
      { id: "coop-elite", type: "coopElite", ...reward, ...bossMeta, resolved: false, hidden: false, persistent: true },
      { id: "coop-deluxe-chest", type: "deluxeChest", ...reward, resolved: false, hidden: true },
    );
  }

  expedition.totalDiscoveries += 1;
  expedition.hostOwnerId = leaderId;
  const hasCoopBoss = ["dualSwitch", "eliteVault"].includes(type);
  expedition.coop = {
    enabled: true,
    gimmickType: type,
    floorTier: floorTier.id,
    floorTierLabel: floorTier.label,
    partySize,
    participantTier: participantTier.id,
    participantTierLabel: participantTier.label,
    rewardTier: rewardTier.id,
    rewardTierLabel: rewardTier.visualLabel,
    rewardScaleLabel: rewardTier.label,
    optionalFeature: { kind: type, optional: true, nonBlocking: true },
    switchHoldStartedAt: 0,
    switchUnlocked: false,
    switchResolution: null,
    relayStage: 0,
    relayFirstPlayerId: null,
    relayExpiresAt: 0,
    keyHolders: {},
    keyCombined: false,
    eliteBattleStarted: false,
    eliteDefeated: false,
    coopBoss: hasCoopBoss ? coopBossObjectMeta(coopBoss) : null,
    coopBossAttempts: 0,
    coopBossVictories: 0,
  };
  expedition.contribution = contribution ?? {};
  expedition.interactions = {};
  return expedition;
}

export function scaledCoopReward(base = {}, { floor = 1, participants = 1, premium = false } = {}) {
  const tier = coopRewardTier(floor, participants);
  const premiumFactor = premium ? 1.45 : 1;
  const scale = tier.multiplier * premiumFactor;
  const reward = {
    gold: Math.max(0, Math.round((Number(base.gold) || 0) * scale)),
    crystals: Math.max(0, Math.round((Number(base.crystals) || 0) * Math.max(1, scale * .72))),
    captureCrystals: Math.max(0, Math.round(Number(base.captureCrystals) || 0)),
    coopTier: tier.id,
    coopTierLabel: tier.label,
  };
  if (tier.extraRolls > 0) {
    reward.crystals += tier.extraRolls;
    reward.captureCrystals += tier.extraRolls;
    reward.coopExtraRolls = tier.extraRolls;
  }
  return reward;
}

/**
 * Resolve the two-floor-switch overlay from server-owned player positions.
 *
 * The UI describes this as "two players step on the two switches at the same
 * time".  There is deliberately no client timer or hidden hold requirement:
 * the second distinct, connected and living player landing on the other
 * switch is the authoritative transition.  The persisted resolution record
 * makes repeated movement packets, room snapshots and reconnect ticks safe.
 */
export function resolveDualSwitch(expedition, members = [], { now = Date.now() } = {}) {
  const coop = expedition?.coop;
  const switches = (expedition?.objects ?? []).filter(object => object.type === "coopSwitch");
  if (!coop || switches.length !== 2) return { available: false, unlocked: false, changed: false, actorIds: [] };

  const living = members.filter(member => (
    member?.connected === true
    && member.playerId
    && Number(member.coopVitals?.hp) > 0
    && member.dungeonPosition
  ));
  const occupants = switches.map(object => living.filter(member => (
    member.dungeonPosition.x === object.x && member.dungeonPosition.y === object.y
  )));
  const pair = occupants[0]
    .flatMap(left => occupants[1].map(right => [left, right]))
    .find(([left, right]) => left.playerId !== right.playerId);

  if (coop.switchUnlocked) {
    for (const object of switches) {
      object.progress = 1;
      object.active = true;
      object.occupied = true;
    }
    const vault = expedition.objects.find(object => object.type === "resonanceVault");
    const elite = expedition.objects.find(object => object.type === "coopElite");
    if (vault) vault.unlocked = true;
    if (elite) elite.hidden = false;
    return {
      available: true,
      unlocked: true,
      changed: false,
      actorIds: [...(coop.switchResolution?.actorIds ?? [])],
      resolutionId: coop.switchResolution?.id ?? `${expedition.id}:switch-open`,
    };
  }

  switches.forEach((object, index) => {
    object.occupied = occupants[index].length > 0;
    object.progress = 0;
    object.active = false;
  });
  if (!pair) {
    coop.switchHoldStartedAt = 0;
    return { available: true, unlocked: false, changed: false, actorIds: [] };
  }

  const actorIds = pair.map(member => member.playerId);
  const resolvedAt = Math.max(1, Math.floor(Number(now) || Date.now()));
  const resolutionId = `${expedition.id}:switch-open`;
  coop.switchHoldStartedAt = resolvedAt;
  coop.switchUnlocked = true;
  coop.switchResolution = { id: resolutionId, resolvedAt, actorIds: [...actorIds] };
  for (const object of switches) {
    object.progress = 1;
    object.active = true;
    object.occupied = true;
  }
  const vault = expedition.objects.find(object => object.type === "resonanceVault");
  const elite = expedition.objects.find(object => object.type === "coopElite");
  if (vault) vault.unlocked = true;
  if (elite) elite.hidden = false;
  return { available: true, unlocked: true, changed: true, actorIds, resolutionId };
}

export const COOP_GIMMICK_TYPES = GIMMICKS;
