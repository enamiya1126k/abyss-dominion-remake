// Shared handling values keep the displayed launch direction and server impulse equal.
export const HANDLING568 = Object.freeze({carry: .25, aimDrag: 6, railBounce: .12, deadZone: 10});
export const viewSign568 = team => team === 1 ? -1 : 1;
export const worldAngle568 = (angle, team) => Math.atan2(
  Math.sin(angle) * viewSign568(team), Math.cos(angle) * viewSign568(team));
export const viewPosition568 = (point, height, team) => team === 1
  ? {x: -point.x, y: height - point.y} : {x: point.x, y: point.y};

export function launchVelocity568(player, power, angle, maxSpeed = 46) {
  const impulse = 3 + 14 * power + 18 * power * power;
  let vx = player.vx * HANDLING568.carry + Math.sin(angle) * impulse;
  let vy = player.vy * HANDLING568.carry + Math.cos(angle) * impulse;
  const speed = Math.hypot(vx, vy);
  if (speed > maxSpeed) { vx *= maxSpeed / speed; vy *= maxSpeed / speed; }
  return {vx, vy};
}

// Gestures use screen coordinates; packets always contain world coordinates.
export function samplePull568(origin, end, renderer, team = 0) {
  const dx = origin.x - end.x, dy = end.y - origin.y;
  const distance = Math.hypot(dx, dy), limit = Math.min(125, renderer.width * .33);
  const power = Math.max(0, Math.min(1, (distance - HANDLING568.deadZone) / (limit - HANDLING568.deadZone)));
  return {power, angle: worldAngle568(Math.atan2(dx / renderer.sx, dy / renderer.sy), team)};
}

export function launchDirection568(player, pull, renderer, team) {
  const v = launchVelocity568(player, pull.power, pull.angle);
  const sign = viewSign568(team), x = v.vx * renderer.sx * sign, y = -v.vy * renderer.sy * sign;
  const length = Math.hypot(x, y) || 1;
  return {x: x / length, y: y / length};
}
