const MAX_FLOOR = 10_000;
const SNAPSHOT_VERSION = 1;
const CLONE_FAILED = Symbol("clone-failed");
const PROGRESSION_FLAG_KEYS = Object.freeze([
  "abyssUnlocked",
  "deepAbyssUnlocked",
  "gameClear1000",
  "ending1000Played",
  "gameClear10000",
  "ending10000Played",
  "secondWorldEntered",
  "tenGodObserved",
]);

function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function clone(value, fallback = null) {
  if (value == null) return value;
  try {
    return typeof structuredClone === "function"
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

function plainRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

// Progress snapshots are written back to JSON saves. Reject values that would
// be omitted, coerced, or make JSON persistence fail instead of silently
// producing a snapshot that cannot fully restore the local campaign.
function isSnapshotSafe(value) {
  const active = new WeakSet(), stack = [{ value, leave: false }];
  try {
    while (stack.length) {
      const entry = stack.pop(), current = entry.value;
      if (entry.leave) { active.delete(current); continue; }
      if (current == null || typeof current === "string" || typeof current === "boolean") continue;
      if (typeof current === "number") { if (!Number.isFinite(current)) return false; continue; }
      if (typeof current !== "object") return false;
      if (active.has(current)) return false;
      if (!Array.isArray(current) && !plainRecord(current)) return false;
      if (Object.getOwnPropertySymbols(current).length) return false;
      active.add(current); stack.push({ value: current, leave: true });
      if (Array.isArray(current)) {
        for (let index = current.length - 1; index >= 0; index -= 1) {
          if (!hasOwn(current, index)) return false;
          stack.push({ value: current[index], leave: false });
        }
      } else {
        for (const key of Object.keys(current)) {
          const descriptor = Object.getOwnPropertyDescriptor(current, key);
          if (!descriptor || !("value" in descriptor)) return false;
          stack.push({ value: descriptor.value, leave: false });
        }
      }
    }
    return true;
  } catch {
    return false;
  }
}

function strictClone(value) {
  if (!isSnapshotSafe(value)) return CLONE_FAILED;
  if (typeof structuredClone === "function") {
    try {
      const result = structuredClone(value);
      if (isSnapshotSafe(result)) return result;
    } catch {}
  }
  try {
    const encoded = JSON.stringify(value);
    if (typeof encoded !== "string") return CLONE_FAILED;
    const result = JSON.parse(encoded);
    return isSnapshotSafe(result) ? result : CLONE_FAILED;
  } catch {
    return CLONE_FAILED;
  }
}

function floor(value, fallback = 1) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.max(1, Math.min(MAX_FLOOR, Math.floor(number)))
    : floor(fallback, 1);
}

function cleanText(value, max = 160) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").slice(0, max);
}

function cleanTime(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function numericFloorMap(value, maxFloor = MAX_FLOOR) {
  const result = {};
  for (const [key, entry] of Object.entries(object(value))) {
    const depth = Math.floor(Number(key));
    if (!Number.isFinite(depth) || depth < 1 || depth > maxFloor) continue;
    result[String(depth)] = clone(entry);
  }
  return result;
}

function normalizedSnapshotFloorMap(value, maxFloor = MAX_FLOOR) {
  const result = {};
  for (const [key, entry] of Object.entries(value)) {
    const depth = Math.floor(Number(key));
    if (!Number.isFinite(depth) || depth < 1 || depth > maxFloor) continue;
    // `value` already belongs to the strict, detached clone made above.
    result[String(depth)] = entry;
  }
  return result;
}

function progressionFlags(value) {
  const source = object(value), result = {};
  for (const key of PROGRESSION_FLAG_KEYS) result[key] = Boolean(source[key]);
  return result;
}

function isolationState(state) {
  state.onlineParty = object(state.onlineParty);
  const source = object(state.onlineParty.progressIsolation);
  const dismissed = Array.isArray(source.dismissedLegacyCandidates)
    ? [...new Set(source.dismissedLegacyCandidates.map(value => cleanText(value, 200)).filter(Boolean))].slice(-32)
    : [];
  state.onlineParty.progressIsolation = {
    version: SNAPSHOT_VERSION,
    activeGuestSession: normalizeActiveGuestSession(source.activeGuestSession),
    interruptedRecovery: object(source.interruptedRecovery),
    dismissedLegacyCandidates: dismissed,
    lastLegacyRepair: normalizeLegacyRepair(source.lastLegacyRepair),
  };
  return state.onlineParty.progressIsolation;
}

function normalizeActiveGuestSession(value) {
  const source = object(value), snapshot = normalizeLocalProgressSnapshot(source.snapshot);
  if (!snapshot) return null;
  const ownerId = cleanText(source.ownerId, 24), selfId = cleanText(source.selfId, 24);
  if (!ownerId || !selfId || ownerId === selfId) return null;
  return {
    version: SNAPSHOT_VERSION,
    roomId: cleanText(source.roomId, 24),
    ownerId,
    selfId,
    runId: cleanText(source.runId, 120),
    capturedAt: cleanTime(source.capturedAt),
    snapshot,
  };
}

function normalizeLegacyRepair(value) {
  const source = object(value), backup = normalizeLocalProgressSnapshot(source.backup);
  if (!backup) return null;
  return {
    candidateId: cleanText(source.candidateId, 200),
    repairedAt: cleanTime(source.repairedAt),
    targetFloor: floor(source.targetFloor),
    backup,
  };
}

export function normalizeLocalProgressSnapshot(value) {
  const copied = strictClone(value);
  if (copied === CLONE_FAILED || !plainRecord(copied) || Number(copied.version) !== SNAPSHOT_VERSION) return null;
  const source = copied, player = source.player, onlineWorld = source.onlineWorld;
  const playerNumbers = ["maxFloor", "currentFloor", "checkpoint", "nextShopFloor"];
  const playerRecords = ["floorSeeds", "openedChests", "bossRewards", "pendingBossRewards", "bossKills", "exploreRun"];
  const rootRecords = ["flags", "returnRewards", "secretRooms", "biomeProgress", "floorBossChallenges", "secondWorld"];
  if (!plainRecord(player)
    || playerNumbers.some(key => !hasOwn(player, key) || player[key] == null || !Number.isFinite(Number(player[key])))
    || !hasOwn(player, "inRun") || typeof player.inRun !== "boolean"
    || playerRecords.some(key => !hasOwn(player, key) || !plainRecord(player[key]))
    || rootRecords.some(key => !hasOwn(source, key) || !plainRecord(source[key]))
    || !hasOwn(source, "worldPhase") || source.worldPhase == null || !Number.isFinite(Number(source.worldPhase))
    || PROGRESSION_FLAG_KEYS.some(key => !hasOwn(source.flags, key) || typeof source.flags[key] !== "boolean")
    || !plainRecord(onlineWorld)
    || !Array.isArray(onlineWorld.firstCoopBossClears)
    || !plainRecord(onlineWorld.hostWorld)
    || ["activeExpeditionRunId", "activeManualExploreRunId", "activeExpeditionOwnerId"].some(key => !hasOwn(onlineWorld, key) || (onlineWorld[key] != null && typeof onlineWorld[key] !== "string"))
    || (source.expeditionSnapshot != null && !plainRecord(source.expeditionSnapshot))
    || (source.activeBattle != null && !plainRecord(source.activeBattle))
    || (source.tenGodContact != null && !plainRecord(source.tenGodContact))) return null;
  return {
    version: SNAPSHOT_VERSION,
    player: {
      maxFloor: floor(player.maxFloor),
      currentFloor: floor(player.currentFloor, player.maxFloor),
      checkpoint: floor(player.checkpoint),
      inRun: Boolean(player.inRun),
      nextShopFloor: floor(player.nextShopFloor, 4),
      floorSeeds: normalizedSnapshotFloorMap(player.floorSeeds),
      openedChests: normalizedSnapshotFloorMap(player.openedChests),
      bossRewards: normalizedSnapshotFloorMap(player.bossRewards),
      pendingBossRewards: normalizedSnapshotFloorMap(player.pendingBossRewards),
      bossKills: normalizedSnapshotFloorMap(player.bossKills),
      exploreRun: player.exploreRun,
    },
    flags: progressionFlags(source.flags),
    worldPhase: Math.max(0, Math.min(1, Math.floor(Number(source.worldPhase) || 0))),
    expeditionSnapshot: source.expeditionSnapshot ?? null,
    activeBattle: source.activeBattle ?? null,
    returnRewards: source.returnRewards,
    secretRooms: source.secretRooms,
    biomeProgress: source.biomeProgress,
    floorBossChallenges: source.floorBossChallenges,
    secondWorld: source.secondWorld,
    tenGodContact: source.tenGodContact ?? null,
    onlineWorld: {
      firstCoopBossClears: [...new Set((Array.isArray(source.onlineWorld?.firstCoopBossClears) ? source.onlineWorld.firstCoopBossClears : []).map(Number).filter(value => value >= 10 && value <= MAX_FLOOR && value % 10 === 0))],
      hostWorld: onlineWorld.hostWorld,
      activeExpeditionRunId: cleanText(source.onlineWorld?.activeExpeditionRunId, 120) || null,
      activeManualExploreRunId: cleanText(source.onlineWorld?.activeManualExploreRunId, 120) || null,
      activeExpeditionOwnerId: cleanText(source.onlineWorld?.activeExpeditionOwnerId, 24) || null,
    },
  };
}

export function captureLocalProgress(state) {
  if (!plainRecord(state) || !plainRecord(state.player) || !plainRecord(state.flags) || !plainRecord(state.onlineParty)) return null;
  const player = state.player, online = state.onlineParty;
  return normalizeLocalProgressSnapshot({
    version: SNAPSHOT_VERSION,
    player: {
      maxFloor: player.maxFloor,
      currentFloor: player.currentFloor,
      checkpoint: player.checkpoint,
      inRun: player.inRun,
      nextShopFloor: player.nextShopFloor,
      floorSeeds: player.floorSeeds,
      openedChests: player.openedChests,
      bossRewards: player.bossRewards,
      pendingBossRewards: player.pendingBossRewards,
      bossKills: player.bossKills,
      exploreRun: player.exploreRun,
    },
    flags: state?.flags,
    worldPhase: state?.worldPhase,
    expeditionSnapshot: state.expeditionSnapshot ?? null,
    activeBattle: state.activeBattle ?? null,
    returnRewards: state.returnRewards,
    secretRooms: state.secretRooms,
    biomeProgress: state.biomeProgress,
    floorBossChallenges: state.floorBossChallenges,
    secondWorld: state.secondWorld,
    tenGodContact: state.tenGodContact ?? null,
    onlineWorld: {
      firstCoopBossClears: online.firstCoopBossClears,
      hostWorld: online.hostWorld,
      activeExpeditionRunId: online.activeExpeditionRunId,
      activeManualExploreRunId: online.activeManualExploreRunId,
      activeExpeditionOwnerId: online.activeExpeditionOwnerId,
    },
  });
}

export function restoreLocalProgress(state, value) {
  const snapshot = normalizeLocalProgressSnapshot(value);
  if (!state || !snapshot) return { ok: false, restored: false };
  const restoredSnapshot = strictClone(snapshot);
  if (restoredSnapshot === CLONE_FAILED) return { ok: false, restored: false };
  state.player = object(state.player);
  Object.assign(state.player, restoredSnapshot.player);
  state.flags = { ...object(state.flags), ...restoredSnapshot.flags };
  state.worldPhase = restoredSnapshot.worldPhase;
  state.expeditionSnapshot = restoredSnapshot.expeditionSnapshot;
  if (restoredSnapshot.activeBattle == null) delete state.activeBattle;
  else state.activeBattle = restoredSnapshot.activeBattle;
  state.returnRewards = restoredSnapshot.returnRewards;
  state.secretRooms = restoredSnapshot.secretRooms;
  state.biomeProgress = restoredSnapshot.biomeProgress;
  state.floorBossChallenges = restoredSnapshot.floorBossChallenges;
  state.secondWorld = restoredSnapshot.secondWorld;
  if (restoredSnapshot.tenGodContact == null) delete state.tenGodContact;
  else state.tenGodContact = restoredSnapshot.tenGodContact;
  state.onlineParty = object(state.onlineParty);
  state.onlineParty.firstCoopBossClears = [...restoredSnapshot.onlineWorld.firstCoopBossClears];
  state.onlineParty.hostWorld = restoredSnapshot.onlineWorld.hostWorld;
  state.onlineParty.activeExpeditionRunId = restoredSnapshot.onlineWorld.activeExpeditionRunId;
  state.onlineParty.activeManualExploreRunId = restoredSnapshot.onlineWorld.activeManualExploreRunId;
  state.onlineParty.activeExpeditionOwnerId = restoredSnapshot.onlineWorld.activeExpeditionOwnerId;
  state.player.maxFloor = floor(state.player.maxFloor);
  state.player.currentFloor = Math.min(state.player.maxFloor, floor(state.player.currentFloor, state.player.maxFloor));
  state.player.checkpoint = Math.min(state.player.maxFloor, floor(state.player.checkpoint));
  return { ok: true, restored: true, snapshot };
}

export function beginGuestProgressIsolation(state, context = {}) {
  if (!plainRecord(state)) return { ok: false, captured: false, reason: "STATE_REQUIRED" };
  const isolation = isolationState(state), ownerId = cleanText(context.ownerId, 24), selfId = cleanText(context.selfId, 24);
  if (!ownerId || !selfId || ownerId === selfId) return { ok: false, captured: false, reason: "OWNER_REQUIRED" };
  const roomId = cleanText(context.roomId, 24), runId = cleanText(context.runId, 120), active = isolation.activeGuestSession;
  if (active && active.ownerId === ownerId && active.selfId === selfId && active.roomId === roomId) {
    const restored = restoreLocalProgress(state, active.snapshot);
    return { ok: restored.ok, captured: false, restored: restored.restored, session: active };
  }
  if (active) {
    const restored = restoreLocalProgress(state, active.snapshot);
    if (!restored.ok) return { ok: false, captured: false, restored: false, reason: "RESTORE_FAILED", session: active };
  }
  const snapshot = captureLocalProgress(state);
  if (!snapshot) return { ok: false, captured: false, reason: "SNAPSHOT_FAILED" };
  isolation.activeGuestSession = {
    version: SNAPSHOT_VERSION,
    roomId,
    ownerId,
    selfId,
    runId,
    capturedAt: cleanTime(context.now ?? Date.now()),
    snapshot,
  };
  isolation.interruptedRecovery = {};
  return { ok: true, captured: true, session: isolation.activeGuestSession };
}

export function finishGuestProgressIsolation(state, context = {}) {
  if (!plainRecord(state)) return { ok: false, restored: false, reason: "STATE_REQUIRED" };
  const isolation = isolationState(state), active = isolation.activeGuestSession;
  if (!active) return { ok: true, restored: false };
  const restored = restoreLocalProgress(state, active.snapshot);
  if (!restored.ok) return restored;
  isolation.activeGuestSession = null;
  isolation.interruptedRecovery = {
    restoredAt: cleanTime(context.now ?? Date.now()),
    reason: cleanText(context.reason || "leave", 40),
    roomId: active.roomId,
    ownerId: active.ownerId,
  };
  return { ok: true, restored: true, session: active };
}

export function recoverInterruptedGuestProgress(state, now = Date.now()) {
  if (!plainRecord(state)) return { ok: false, restored: false, reason: "STATE_REQUIRED" };
  const isolation = isolationState(state), active = isolation.activeGuestSession;
  if (!active) return { ok: true, restored: false };
  return finishGuestProgressIsolation(state, { reason: "reload", now });
}

export function onlineProgressionAllowed(source, { selfId = "", roomOwnerId = "" } = {}) {
  const ownerId = cleanText(source?.worldOwnerId ?? source?.ownerId, 24), localId = cleanText(selfId, 24), roomOwner = cleanText(roomOwnerId, 24);
  if (!ownerId || !localId || ownerId !== localId) return false;
  if (roomOwner && roomOwner !== localId) return false;
  return source?.progressionEligible !== false;
}

function bossEvidenceFloors(state) {
  const online = object(state?.onlineParty), excluded = new Set([
    ...(Array.isArray(online.firstCoopBossClears) ? online.firstCoopBossClears : []),
    ...(Array.isArray(online.hostWorld?.defeatedBossFloors) ? online.hostWorld.defeatedBossFloors : []),
  ].map(Number));
  const evidence = new Set();
  for (const source of [state?.player?.bossKills, state?.player?.bossRewards]) {
    for (const [key, value] of Object.entries(object(source))) {
      const depth = Math.floor(Number(key));
      const cleared = source === state?.player?.bossKills ? Number(value) > 0 : Boolean(value);
      if (cleared && depth >= 10 && depth <= MAX_FLOOR && depth % 10 === 0 && !excluded.has(depth)) evidence.add(depth);
    }
  }
  return [...evidence];
}

export function verifiedLocalProgressFloor(state) {
  const player = object(state?.player), candidates = [1, floor(player.checkpoint)];
  const gmUnlock = Math.max(0, Math.floor(Number(state?.gameMaster?.floorUnlockMax ?? state?.settings?.gmFloorUnlockMax) || 0));
  if (gmUnlock) candidates.push(Math.min(MAX_FLOOR, gmUnlock + 1));
  for (const depth of bossEvidenceFloors(state)) candidates.push(Math.min(MAX_FLOOR, depth === MAX_FLOOR ? MAX_FLOOR : depth + 1));
  // Migration used to infer ending flags from maxFloor itself. Those flags are
  // therefore not independent proof when maxFloor may have been contaminated
  // by a guest session. Real clears remain verifiable through boss records.
  return Math.min(floor(player.maxFloor), Math.max(...candidates));
}

export function legacyProgressRecoveryCandidate(state, { selfId = "" } = {}) {
  const isolation = isolationState(state), online = object(state?.onlineParty), manual = object(state?.returnRewards?.manual);
  const localId = cleanText(selfId, 24), persistedOwnerId = cleanText(online.hostWorld?.ownerId, 24);
  if (localId && persistedOwnerId === localId) return null;
  const runId = cleanText(online.activeExpeditionRunId, 120), manualRunId = cleanText(online.activeManualExploreRunId, 120);
  const floorClearReceipts = (Array.isArray(online.claimedRewards) ? online.claimedRewards : []).map(String).filter(value => value.includes(":floor-clear:"));
  if (!floorClearReceipts.length) return null;
  const currentMax = floor(state?.player?.maxFloor), suggestedMax = verifiedLocalProgressFloor(state), currentFloor = floor(state?.player?.currentFloor, currentMax);
  if (currentMax <= suggestedMax || currentMax - suggestedMax < 2) return null;
  const highOnlineEvidence = [
    ...(Array.isArray(online.firstCoopBossClears) ? online.firstCoopBossClears : []),
    ...(Array.isArray(online.hostWorld?.defeatedBossFloors) ? online.hostWorld.defeatedBossFloors : []),
    ...Object.keys(object(online.hostWorld?.floorSeeds)),
    ...Object.keys(object(online.hostWorld?.openedChestIds)),
  ].some(value => Number(value) > suggestedMax);
  const activeTrace = Boolean(runId && manualRunId && manual.active);
  if (!activeTrace && !highOnlineEvidence) return null;
  const exploreRunId = cleanText(state?.player?.exploreRun?.id, 120);
  const onlineRunAttached = Boolean(activeTrace && exploreRunId && manualRunId === exploreRunId);
  const traceId = runId || manualRunId || floorClearReceipts.at(-1) || "online-floor-clear";
  const candidateId = cleanText(`${traceId}:${currentMax}:${currentFloor}:${suggestedMax}`, 200);
  if (isolation.dismissedLegacyCandidates.includes(candidateId)) return null;
  return {
    candidateId,
    selfId: localId,
    onlineRunAttached,
    runId,
    currentMax,
    currentFloor,
    suspectedStartFloor: floor(manual.startFloor, currentFloor),
    suggestedMax,
  };
}

function trimBiomeProgress(value, targetFloor) {
  const result = clone(object(value), {});
  const fixedBounds = {
    origin_cave: [1, 10], forgotten_forest: [11, 20], lava_fields: [21, 30],
    frozen_corridor: [31, 40], ancient_temple: [41, 50], abyss_gate: [51, 60], nether: [61, 100],
  };
  for (const [id, data] of Object.entries(result)) {
    if (!data || typeof data !== "object") continue;
    const deepBand = /^deep_(\d+)_/.exec(id), bounds = fixedBounds[id] ?? (deepBand ? [101 + (Number(deepBand[1]) - 1) * 50, 150 + (Number(deepBand[1]) - 1) * 50] : null);
    if (bounds?.[0] > targetFloor) { delete result[id]; continue; }
    if (Array.isArray(data.visitedFloors)) data.visitedFloors = data.visitedFloors.filter(value => Number(value) <= targetFloor);
    if (Array.isArray(data.events)) data.events = data.events.filter(entry => Number(entry?.floor ?? 1) <= targetFloor);
    if (bounds?.[1] > targetFloor) data.bossDefeated = false;
  }
  return result;
}

function trimFloorBossChallenges(value, targetFloor) {
  const result = clone(object(value), {}), fragments = object(result.fragments), contracts = object(result.contracts);
  for (const field of ["discovered", "encounters", "victories"]) {
    const map = object(result[field]); result[field] = map;
    for (const id of Object.keys(map)) {
      const match = /^floor-boss-(\d+)$/.exec(id), depth = Number(match?.[1]);
      if (depth > targetFloor && !contracts[id] && !(Number(fragments[id]) > 0)) delete map[id];
    }
  }
  const processed = object(result.processedResults); result.processedResults = processed;
  for (const [id, entry] of Object.entries(processed)) {
    const match = /^floor-boss-(\d+)$/.exec(String(entry?.bossId ?? "")), depth = Number(match?.[1]);
    if (depth > targetFloor && !contracts[entry?.bossId] && !(Number(fragments[entry?.bossId]) > 0)) delete processed[id];
  }
  return result;
}

function trimSecondWorld(value, targetFloor) {
  if (targetFloor <= 1000) return {};
  const result = clone(object(value), {}), randomEvents = object(result.randomEvents); result.randomEvents = randomEvents;
  if (Array.isArray(randomEvents.resolvedFloors)) randomEvents.resolvedFloors = randomEvents.resolvedFloors.filter(value => Number(value) <= targetFloor);
  return result;
}

export function applyLegacyProgressRecovery(state, candidate, requestedFloor, now = Date.now()) {
  const current = legacyProgressRecoveryCandidate(state, { selfId: candidate?.selfId });
  if (!current || current.candidateId !== cleanText(candidate?.candidateId, 200)) return { ok: false, repaired: false, reason: "CANDIDATE_STALE" };
  if (state?.player?.inRun && !current.onlineRunAttached) return { ok: false, repaired: false, reason: "ACTIVE_LOCAL_RUN" };
  const targetFloor = Math.min(current.currentMax, floor(requestedFloor, current.suggestedMax)), isolation = isolationState(state), backup = captureLocalProgress(state);
  if (!backup) return { ok: false, repaired: false, reason: "BACKUP_FAILED" };
  const player = state.player = object(state.player), online = state.onlineParty = object(state.onlineParty);
  state.flags = object(state.flags);
  player.maxFloor = targetFloor;
  player.currentFloor = targetFloor;
  player.checkpoint = Math.min(targetFloor, floor(player.checkpoint));
  player.inRun = false;
  player.floorSeeds = numericFloorMap(player.floorSeeds, targetFloor);
  player.openedChests = numericFloorMap(player.openedChests, targetFloor);
  player.bossRewards = numericFloorMap(player.bossRewards, targetFloor);
  player.pendingBossRewards = numericFloorMap(player.pendingBossRewards, targetFloor);
  player.bossKills = numericFloorMap(player.bossKills, targetFloor);
  player.exploreRun = { id: null, floors: {} };
  state.expeditionSnapshot = null;
  delete state.activeBattle;
  state.returnRewards = object(state.returnRewards);
  state.returnRewards.manual = { active: false, startFloor: targetFloor, lastFloor: targetFloor, floorsCleared: 0, pendingGold: 0, startedAt: null };
  state.secretRooms = object(state.secretRooms);
  state.secretRooms.activeRoom = null;
  state.biomeProgress = trimBiomeProgress(state.biomeProgress, targetFloor);
  state.floorBossChallenges = trimFloorBossChallenges(state.floorBossChallenges, targetFloor);
  state.secondWorld = trimSecondWorld(state.secondWorld, targetFloor);
  online.firstCoopBossClears = (Array.isArray(online.firstCoopBossClears) ? online.firstCoopBossClears : []).filter(value => Number(value) <= targetFloor);
  online.hostWorld = object(online.hostWorld);
  online.hostWorld.openedChestIds = numericFloorMap(online.hostWorld.openedChestIds, targetFloor);
  online.hostWorld.floorSeeds = numericFloorMap(online.hostWorld.floorSeeds, targetFloor);
  online.hostWorld.defeatedBossFloors = (Array.isArray(online.hostWorld.defeatedBossFloors) ? online.hostWorld.defeatedBossFloors : []).filter(value => Number(value) <= targetFloor);
  online.hostWorld.claimedBossRewardFloors = (Array.isArray(online.hostWorld.claimedBossRewardFloors) ? online.hostWorld.claimedBossRewardFloors : []).filter(value => Number(value) <= targetFloor);
  online.activeExpeditionRunId = null;
  online.activeManualExploreRunId = null;
  online.activeExpeditionOwnerId = null;
  if (targetFloor <= 1000) {
    state.flags.gameClear1000 = false;
    state.flags.ending1000Played = false;
    state.flags.secondWorldEntered = false;
    state.flags.deepAbyssUnlocked = false;
    state.worldPhase = 0;
  }
  if (targetFloor < MAX_FLOOR) {
    state.flags.gameClear10000 = false;
    state.flags.ending10000Played = false;
  }
  isolation.activeGuestSession = null;
  isolation.lastLegacyRepair = { candidateId: current.candidateId, repairedAt: cleanTime(now), targetFloor, backup };
  return { ok: true, repaired: true, targetFloor, previousFloor: current.currentMax };
}

export function dismissLegacyProgressRecovery(state, candidate) {
  const isolation = isolationState(state), candidateId = cleanText(candidate?.candidateId, 200);
  if (!candidateId) return false;
  isolation.dismissedLegacyCandidates = [...new Set([...isolation.dismissedLegacyCandidates, candidateId])].slice(-32);
  return true;
}

export function undoLegacyProgressRecovery(state) {
  const isolation = isolationState(state), repair = isolation.lastLegacyRepair;
  if (!repair?.backup) return { ok: false, restored: false };
  const restored = restoreLocalProgress(state, repair.backup);
  if (!restored.ok) return restored;
  isolation.lastLegacyRepair = null;
  return { ok: true, restored: true };
}

export function normalizeOnlineProgressIsolation(state) {
  return isolationState(state);
}
