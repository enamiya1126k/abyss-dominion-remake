export const ONLINE_EXPEDITION_MOVE_INTERVAL_MS = 140;
export const ONLINE_MOTION_BASE_SPEED = 1000 / ONLINE_EXPEDITION_MOVE_INTERVAL_MS;

const DEFAULT_MAX_QUEUE = 4;
const DEFAULT_SNAP_DISTANCE = 5;

function finitePoint(source) {
  const x = Number(source?.x), y = Number(source?.y);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

function samePoint(left, right) {
  return Boolean(left && right && left.x === right.x && left.y === right.y);
}

function distance(left, right) {
  return Math.hypot(Number(left?.x) - Number(right?.x), Number(left?.y) - Number(right?.y));
}

function snapOnlineMotion(entity, target) {
  entity.x = target.x;
  entity.y = target.y;
  entity.rx = target.x;
  entity.ry = target.y;
  entity.path = [];
  entity.p = 0;
}

/**
 * Reconciles an authoritative grid position without replacing an animation
 * that is already in progress. A short queue keeps consecutive WebSocket
 * steps continuous; a bounded catch-up path prevents delayed packets from
 * leaving the avatar several tiles behind forever.
 */
export function reconcileOnlineMotion(entity, source, options = {}) {
  if (!entity) return "invalid";
  const target = finitePoint(source);
  if (!target) return "invalid";
  const path = Array.isArray(entity.path) ? entity.path : (entity.path = []);
  const visual = finitePoint({ x: entity.rx ?? entity.x, y: entity.ry ?? entity.y }) ?? target;
  const latest = finitePoint(path.at(-1)) ?? finitePoint(entity) ?? visual;
  const maxQueue = Math.max(1, Math.floor(Number(options.maxQueue) || DEFAULT_MAX_QUEUE));
  const snapDistance = Math.max(1, Number(options.snapDistance) || DEFAULT_SNAP_DISTANCE);

  if (samePoint(target, latest) || path.some(point => samePoint(point, target))) return "unchanged";
  if (options.snap || distance(visual, target) > snapDistance || distance(latest, target) > snapDistance) {
    snapOnlineMotion(entity, target);
    return "snapped";
  }

  if (path.length >= maxQueue) {
    // Rebase on the rendered location rather than teleporting to the newest
    // server tile. The next frames then catch up smoothly.
    entity.x = visual.x;
    entity.y = visual.y;
    entity.rx = visual.x;
    entity.ry = visual.y;
    entity.path = [target];
    entity.p = 0;
    return "compacted";
  }

  path.push(target);
  return "queued";
}

export function onlineMotionSpeed(entity) {
  const queued = Math.max(0, (Array.isArray(entity?.path) ? entity.path.length : 0) - 1);
  return ONLINE_MOTION_BASE_SPEED * (1 + Math.min(.42, queued * .12));
}
