import {
  PINBALL563, makeGoal563, startGoal563, random563, event563,
  canShoot563, launch563, inputGoal563, limit563, pairGoal563,
  rotorGoal563, publicGoal563, signatureGoal563,
} from './Goals563.js';

// Keep the Build563 launch impulse, momentum, drag, reload and input contract.
export const HOCKEY564 = Object.freeze({ ...PINBALL563, version: 8,
  goalHalfWidth: 3.2, goalDepth: 1.3, postRadius: .17 });
const C = HOCKEY564, clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const TEAM564 = Object.freeze([
  Object.freeze({ id: 0, name: 'サファイア', mark: '◆', color: '#89d7ff' }),
  Object.freeze({ id: 1, name: 'ルビー', mark: '●', color: '#ff9aa8' }),
]);
export { canShoot563 as canShoot564, launch563 as launch564,
  inputGoal563 as input564, signatureGoal563 as signature564 };
export const goals564 = () => [0, 1].map(team => ({ team, x: 0,
  y: team === 0 ? C.goalDepth : C.height - C.goalDepth,
  halfWidth: C.goalHalfWidth, depth: C.goalDepth }));

export function allocateTeams564(members) {
  const active = members.filter(m => !m.departed), counts = [0, 0], map = new Map();
  for (const m of active) if ([0, 1].includes(m.team564) && counts[m.team564] < 2) {
    map.set(m.playerId, m.team564); counts[m.team564]++;
  }
  for (const m of active) if (!map.has(m.playerId)) {
    const team = counts[0] <= counts[1] ? 0 : 1;
    if (counts[team] >= 2) throw Error('エアホッケーは４人まで参加できます');
    map.set(m.playerId, team); counts[team]++;
  }
  return map;
}

export function makeHockey564(options) {
  const g = makeGoal563(options), map = allocateTeams564(g.members);
  g.rules550 = C.version;
  for (const m of g.members) m.team564 = map.get(m.playerId);
  return g;
}

export function configureHockey564(g, party, member, message) {
  if (message.kind !== 'team') return false;
  if (![0, 1].includes(message.team)) throw Error('チームを選んでね');
  const map = allocateTeams564(g.members);
  if (map.get(member.playerId) === message.team) return true;
  if ([...map].filter(([id, team]) => id !== member.playerId && team === message.team).length >= 2)
    throw Error('そのチームは２人そろっています');
  for (const m of g.members) m.team564 = map.get(m.playerId);
  member.team564 = message.team;
  for (const m of party.members) m.ready = false;
  return true;
}

export function startHockey564(g, now, seed = 564) {
  const map = allocateTeams564(g.members);
  startGoal563(g, now, seed);
  g.rules550 = C.version;
  g.teams564 = TEAM564.map(t => ({ ...t, score: 0, goals: 0 }));
  g.goals = goals564();
  const counts = [0, 0];
  for (const p of g.players) if (map.has(p.playerId)) counts[map.get(p.playerId)]++;
  for (const p of g.players) {
    let team = map.get(p.playerId);
    if (team == null) { team = counts[0] <= counts[1] ? 0 : 1; counts[team]++; }
    p.team564 = team; p.assists564 = 0; p.ownGoals564 = 0;
    const m = g.members.find(m => m.playerId === p.playerId);
    if (m) m.team564 = team;
  }
  for (const team of [0, 1]) g.players.filter(p => p.team564 === team).forEach((p, i) => {
    p.x = i === 0 ? -3.5 : 3.5;
    p.y = team === 0 ? 4.2 : C.height - 4.2;
  });
  return g;
}

function spawnPuck(g) {
  const angle = (g.gemSerial % 4) * Math.PI / 2 + Math.PI / 4;
  g.gemSerial++;
  // Outside the full sweep of the rotor, equally often on both halves.
  g.gem = { x: Math.cos(angle) * 3.6, y: C.height / 2 + Math.sin(angle) * 3.6,
    vx: -Math.cos(angle) * 1.8, vy: -Math.sin(angle) * 1.8,
    r: C.gemRadius, mass: .65, lastTouch: null, assistSeat564: null,
    serial: g.gemSerial, value: g.deadline - g.simAt <= 15000 ? 2 : 1 };
  g.gemReadyAt = 0;
  event563(g, 'gem', { x: g.gem.x, y: g.gem.y, value: g.gem.value });
}

function wall(g, p, nx, ny, depth) {
  p.x += nx * depth; p.y += ny * depth;
  const v = p.vx * nx + p.vy * ny;
  if (v >= 0) return;
  p.vx -= 1.9 * v * nx; p.vy -= 1.9 * v * ny;
  const key = 'w' + (p.seat ?? 'gem');
  if (-v > 3 && g.simAt - (g.contacts[key] ?? -1e6) >= 110) {
    g.contacts[key] = g.simAt;
    event563(g, 'wall', { seat: p.seat, x: p.x, y: p.y, strength: -v });
  }
}

function post(g, p, x, y) {
  const dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy), r = p.r + C.postRadius;
  if (d >= r) return;
  wall(g, p, d > 1e-8 ? dx / d : 1, d > 1e-8 ? dy / d : 0, r - d + .00001);
}

export function pairHockey564(g, a, b) {
  const previous = b === g.gem ? b.lastTouch : null;
  const strength = pairGoal563(g, a, b);
  if (strength > 0 && b === g.gem && previous !== a.seat) {
    const passer = g.players.find(p => p.seat === previous);
    b.assistSeat564 = passer?.team564 === a.team564 ? passer.seat : null;
    b.assistAt564 = g.simAt;
  }
  return strength;
}

function scoreGoal(g, defendingTeam) {
  const gem = g.gem, team = 1 - defendingTeam, value = g.deadline - g.simAt <= 15000 ? 2 : 1;
  const scorer = g.players.find(p => p.seat === gem.lastTouch);
  const ownGoal = scorer != null && scorer.team564 !== team;
  const passer = g.players.find(p => p.seat === gem.assistSeat564);
  g.teams564[team].score += value; g.teams564[team].goals++;
  for (const p of g.players) { p.score = g.teams564[p.team564].score; p.roundScore = p.score; }
  if (scorer) { if (ownGoal) scorer.ownGoals564++; else scorer.goals++; }
  const assisted = !ownGoal && scorer && passer && passer.team564 === team &&
    passer.seat !== scorer.seat && g.simAt - gem.assistAt564 <= 6000;
  if (assisted) passer.assists564++;
  g.lastGoal = { team, defendingTeam, seat: scorer?.seat ?? null,
    assistSeat: assisted ? passer.seat : null, ownGoal, value, at: g.simAt };
  event563(g, 'goal', { ...g.lastGoal, x: gem.x, y: gem.y, lastTouch: gem.lastTouch });
  g.gem = null; g.gemReadyAt = g.simAt + 950; g.revision++;
}

export function physicsHockey564(g, dt = C.step / 1000) {
  let left = dt;
  while (left > 1e-9) {
    const bodies = [...g.players, ...(g.gem ? [g.gem] : [])];
    const speed = Math.max(1, ...bodies.map(p => Math.hypot(p.vx, p.vy)));
    const h = Math.min(left, .12 / (speed + Math.abs(g.rotor.omega) * 2.5 + 1));
    left -= h;
    g.rotor.angle = (g.rotor.angle + g.rotor.omega * h) % (Math.PI * 2);
    g.rotor.omega *= Math.exp(-.35 * h);
    for (const p of bodies) {
      const drag = p === g.gem ? .52 : .78;
      p.vx *= Math.exp(-drag * h); p.vy *= Math.exp(-drag * h);
      p.x += p.vx * h; p.y += p.vy * h;
    }
    for (let pass = 0; pass < 3; pass++) {
      for (const p of bodies) {
        const w = C.width / 2 - p.r;
        if (p.x < -w) wall(g, p, 1, 0, -w - p.x);
        if (p.x > w) wall(g, p, -1, 0, p.x - w);
        if (p.y < p.r) wall(g, p, 0, 1, p.r - p.y);
        if (p.y > C.height - p.r) wall(g, p, 0, -1, p.y - C.height + p.r);
        for (const goal of g.goals) for (const x of [-goal.halfWidth, goal.halfWidth]) post(g, p, x, goal.y);
        rotorGoal563(g, p);
      }
      for (let i = 0; i < g.players.length; i++) for (let j = i + 1; j < g.players.length; j++)
        pairHockey564(g, g.players[i], g.players[j]);
      if (g.gem) for (const p of g.players) pairHockey564(g, p, g.gem);
    }
    for (const p of bodies) limit563(p);
    // The entire puck must cross the visible goal line, between the posts.
    if (g.gem && Math.abs(g.gem.x) + g.gem.r <= C.goalHalfWidth) {
      if (g.gem.y + g.gem.r <= C.goalDepth) scoreGoal(g, 0);
      else if (g.gem.y - g.gem.r >= C.height - C.goalDepth) scoreGoal(g, 1);
    }
  }
}

export function botHockey564(g, p) {
  const gem = g.gem;
  if (!gem) return;
  const attack = g.goals[1 - p.team564];
  const dx = attack.x - gem.x, dy = attack.y - gem.y, d = Math.hypot(dx, dy) || 1;
  const behind = { x: clamp(gem.x - dx / d * 1.55, -7, 7),
    y: clamp(gem.y - dy / d * 1.55, .8, C.height - .8) };
  const allies = g.players.filter(q => q.team564 === p.team564);
  const distance = q => Math.hypot(behind.x - q.x, behind.y - q.y);
  const striker = [...allies].sort((a, b) => distance(a) - distance(b) || a.seat - b.seat)[0];
  const danger = p.team564 === 0 ? gem.y < 5.5 : gem.y > C.height - 5.5;
  const striking = striker?.seat === p.seat;
  let target, shoot = false;
  if (striking) {
    const onGoalSide = (p.x - gem.x) * dx + (p.y - gem.y) * dy < -.15;
    shoot = onGoalSide && Math.hypot(p.x - gem.x, p.y - gem.y) < 3.4;
    target = shoot ? { x: gem.x + gem.vx * .09, y: gem.y + gem.vy * .09 } : behind;
  } else {
    // One partner stays between the puck and their own goal instead of both chasing.
    target = { x: clamp(gem.x * .42, -2.8, 2.8),
      y: p.team564 === 0 ? (danger ? 2.3 : 4.2) : C.height - (danger ? 2.3 : 4.2) };
  }
  p.role564 = striking ? 'attack' : 'defend';
  const tx = target.x - p.x, ty = target.y - p.y, dist = Math.hypot(tx, ty);
  if (!shoot && dist < 1.5 && Math.hypot(p.vx, p.vy) < 3) return;
  const desiredSpeed = shoot ? 19 + random563(g) * 6 : clamp(dist * 1.35, 5, 15);
  const vx = tx / (dist || 1) * desiredSpeed - p.vx * .85;
  const vy = ty / (dist || 1) * desiredSpeed - p.vy * .85;
  const impulse = Math.hypot(vx, vy), power = clamp((-15 + Math.sqrt(225 + 52 * Math.max(0, impulse - 7))) / 26, .08, 1);
  const angle = Math.atan2(vx, vy) + (random563(g) - .5) * (shoot ? .06 : .1);
  return { angle: Math.atan2(Math.sin(angle), Math.cos(angle)), power };
}

export function finishHockey564(g, at) {
  if (g.phase === 'result') return;
  g.phase = 'result'; g.phaseAt = at;
  g.teamResults564 = g.teams564.map(t => ({ ...t,
    rank: 1 + g.teams564.filter(other => other.score > t.score).length })).sort((a, b) => a.rank - b.rank || a.id - b.id);
  for (const p of g.players) { p.pulling = false; p.vx = p.vy = 0; p.score = g.teams564[p.team564].score; }
  g.results = g.players.map(p => ({ playerId: p.playerId, seat: p.seat,
    name: p.name, team564: p.team564, score: p.score, goals: p.goals,
    assists564: p.assists564, rank: g.teamResults564.find(t => t.id === p.team564).rank
  })).sort((a, b) => a.rank - b.rank || a.team564 - b.team564 || a.seat - b.seat);
  g.draw564 = g.teams564[0].score === g.teams564[1].score;
  g.winnerIds = g.results.filter(p => p.rank === 1).map(p => p.playerId);
  g.revision++; event563(g, 'finish');
}

export function advanceHockey564(g, now, inputs = [], auto = new Set()) {
  if (['lobby', 'result'].includes(g.phase)) { g.serverAt = now; inputs.length = 0; return; }
  if (now - g.simAt > 2000) {
    const shift = now - g.simAt - 500;
    for (const k of ['simAt', 'phaseAt', 'startAt', 'roundAt', 'deadline', 'gemReadyAt']) g[k] += shift;
    for (const p of g.players) { p.nextShotAt563 += shift; p.botAt += shift; }
    if (g.gem?.assistAt564 != null) g.gem.assistAt564 += shift;
    if (g.lastGoal) g.lastGoal.at += shift;
    g.events = []; g.contacts = {};
  }
  while (g.simAt + C.step <= now) {
    g.simAt += C.step; g.elapsed = Math.max(0, g.simAt - g.startAt);
    if (g.phase === 'countdown') {
      inputs.length = 0;
      if (g.simAt >= g.startAt) { g.phase = 'play'; g.phaseAt = g.simAt; spawnPuck(g); event563(g, 'start'); g.revision++; }
      continue;
    }
    if (g.simAt >= g.deadline) { finishHockey564(g, g.simAt); inputs.length = 0; break; }
    if (!g.finalCue && g.deadline - g.simAt <= 15000) {
      g.finalCue = true; if (g.gem) g.gem.value = 2; event563(g, 'final');
    }
    if (!g.gem && g.simAt >= g.gemReadyAt) spawnPuck(g);
    while (inputs.length && inputs[0].at <= g.simAt) {
      const m = inputs.shift(), p = g.players.find(q => q.playerId === m.playerId);
      if (!auto.has(p?.playerId) && !p?.ai) inputGoal563(g, p, m);
    }
    for (const p of g.players) if ((p.ai || auto.has(p.playerId)) && g.simAt >= p.botAt && canShoot563(g, p)) {
      const aim = botHockey564(g, p);
      if (aim) launch563(g, p, aim.power, aim.angle);
      p.botAt = g.simAt + 1400 + random563(g) * 1000;
    }
    physicsHockey564(g);
  }
  g.serverAt = now; g.updatedAt = now;
}

export function publicHockey564(g, id, options = {}) {
  const s = publicGoal563(g, id, options);
  if (s.members) {
    const map = allocateTeams564(g.members);
    for (const m of s.members) {
      const original = g.members.find(p => p.playerId === m.playerId);
      m.team564 = map.get(m.playerId); m.color499 = original?.color499;
    }
  }
  return s;
}
