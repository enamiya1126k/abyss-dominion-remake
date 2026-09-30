import {
  PINBALL563, makeGoal563, startGoal563, random563, event563,
  canShoot563, inputGoal563, limit563, pairGoal563,
  rotorGoal563, publicGoal563, signatureGoal563,
} from './Goals563.js';
import {HANDLING568, launchVelocity568} from './Control568.js';

// Keep the slingshot, full-power impulse and reload; make small corrections controllable.
export const HOCKEY564 = Object.freeze({ ...PINBALL563, version: 10,
  radius: .8, gemRadius: .42, goalHalfWidth: 3.2, goalDepth: .9,
  postRadius: .14, respawn: 2000, passBoost: .05 });
const C = HOCKEY564, clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const TEAM564 = Object.freeze([
  Object.freeze({ id: 0, name: 'サファイア', mark: '◆', color: '#89d7ff' }),
  Object.freeze({ id: 1, name: 'ルビー', mark: '●', color: '#ff9aa8' }),
]);
export { signatureGoal563 as signature564 };
export const canShoot564 = (g, p, at = g.simAt) => !!g.gem && canShoot563(g, p, at);
export function launch564(g, p, power, angle) {
  if (!canShoot564(g, p) || !Number.isFinite(power) || power < .08 || power > 1 ||
    !Number.isFinite(angle) || Math.abs(angle) > Math.PI) return false;
  const carryX = p.vx, carryY = p.vy;
  Object.assign(p, launchVelocity568(p, power, angle, C.maxSpeed));
  p.nextShotAt563 = g.simAt + C.reload; p.shots555++; p.pulling = false; p.power = 0;
  event563(g, 'launch', {seat:p.seat, x:p.x, y:p.y, carryX, carryY, vx:p.vx, vy:p.vy});
  return true;
}
export function input564(g, p, message) {
  if (!canShoot564(g, p)) return false;
  if (message.action !== 'shoot') return inputGoal563(g, p, message);
  if (!Number.isSafeInteger(message.seq) || message.seq <= p.lastSeq || message.round !== 1 ||
    message.shot !== p.shots555 || !launch564(g, p, message.power, message.angle)) return false;
  p.lastSeq = message.seq;
  return true;
}
export const power565 = gem => 1 + Math.max(0, gem?.charge565 ?? 0) * C.passBoost;
export const speed565 = g => g.hockey565?.speed === 2 ? 2 : 1;
export const goals564 = () => [0, 1].map(team => ({ team, x: 0,
  y: team === 0 ? 0 : C.height,
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
  g.hockey565 = { rotor: false, speed: 1 };
  for (const m of g.members) m.team564 = map.get(m.playerId);
  return g;
}

export function configureHockey564(g, party, member, message) {
  if (message.kind === 'hockeyOptions') {
    if (party.hostId !== member.playerId) throw Error('部屋主が設定できます');
    if (typeof message.rotor !== 'boolean' || ![1, 2].includes(message.speed))
      throw Error('プロペラと弾速を選んでね');
    g.hockey565 = { rotor: message.rotor, speed: message.speed };
    for (const m of party.members) m.ready = false;
    return true;
  }
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
  g.hockey565 = { rotor: g.hockey565?.rotor === true, speed: speed565(g) };
  g.teams564 = TEAM564.map(t => ({ ...t, score: 0, goals: 0 }));
  g.goals = goals564();
  const counts = [0, 0];
  for (const p of g.players) if (map.has(p.playerId)) counts[map.get(p.playerId)]++;
  for (const p of g.players) {
    let team = map.get(p.playerId);
    if (team == null) { team = counts[0] <= counts[1] ? 0 : 1; counts[team]++; }
    p.team564 = team; p.assists564 = 0; p.ownGoals564 = 0; p.passes565 = 0; p.r = C.radius;
    const m = g.members.find(m => m.playerId === p.playerId);
    if (m) m.team564 = team;
  }
  for (const team of [0, 1]) g.players.filter(p => p.team564 === team).forEach((p, i) => {
    p.x = i === 0 ? -3.5 : 3.5;
    p.y = team === 0 ? 4.2 : C.height - 4.2;
  });
  g.serveTeam565 = random563(g) < .5 ? 0 : 1;
  return g;
}

function spawnPuck(g) {
  const direction = g.serveTeam565 === 0 ? -1 : 1;
  g.gemSerial++;
  // The conceding team receives the next puck. Rotor serves clear its full sweep.
  g.gem = { x: g.hockey565.rotor ? (g.gemSerial % 2 ? 4.1 : -4.1) : 0,
    y: C.height / 2 + direction * .7, vx: 0, vy: direction * 3 * speed565(g),
    r: C.gemRadius, mass: .65, lastTouch: null, assistSeat564: null,
    charge565: 0, chain565: 0, touch565: null,
    serial: g.gemSerial, value: g.deadline - g.simAt <= 15000 ? 2 : 1 };
  g.gemReadyAt = 0;
  event563(g, 'gem', { x: g.gem.x, y: g.gem.y, value: g.gem.value });
}

function wall(g, p, nx, ny, depth) {
  p.x += nx * depth; p.y += ny * depth;
  const v = p.vx * nx + p.vy * ny;
  if (v >= 0) return;
  const bounce = p === g.gem ? .9 : HANDLING568.railBounce;
  p.vx -= (1 + bounce) * v * nx; p.vy -= (1 + bounce) * v * ny;
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
  if (b !== g.gem) return pairGoal563(g, a, b);
  // Solve the original contact at base speed, then apply a single flight multiplier.
  // This keeps repeated contacts from multiplying velocity exponentially.
  const scale = speed565(g) * power565(b), previous = b.lastTouch;
  b.vx /= scale; b.vy /= scale;
  const strength = pairGoal563(g, a, b);
  if (strength > 0 && previous !== a.seat) {
    const passer = g.players.find(p => p.seat === previous);
    b.assistSeat564 = passer?.team564 === a.team564 ? passer.seat : null;
    b.assistAt564 = g.simAt;
    const touch = b.touch565;
    const passed = touch && touch.seat === previous && touch.team === a.team564 &&
      g.simAt - touch.at >= 180 && Math.hypot(b.x - touch.x, b.y - touch.y) >= 2;
    b.chain565 = passed ? (b.chain565 ?? 0) + 1 : 0;
    if (passed) {
      b.charge565 = (b.charge565 ?? 0) + 1;
      passer.passes565 = (passer.passes565 ?? 0) + 1;
      event563(g, 'pass', { team: a.team564, seat: a.seat, from: previous,
        charge: b.charge565, chain: b.chain565, x: b.x, y: b.y });
    }
    // Opponent interceptions preserve charge: a powered return can become an own goal.
    b.touch565 = { seat: a.seat, team: a.team564, at: g.simAt, x: b.x, y: b.y };
  }
  const next = speed565(g) * power565(b);
  b.vx *= next; b.vy *= next;
  limitPuck565(g, b);
  return strength;
}

function limitPuck565(g, p) {
  const speed = Math.hypot(p.vx, p.vy), cap = C.maxSpeed * speed565(g) * power565(p);
  if (speed > cap) { p.vx *= cap / speed; p.vy *= cap / speed; }
}

function keepHome565(g, p) {
  const low = p.team564 === 0 ? p.r : C.height / 2 + p.r;
  const high = p.team564 === 0 ? C.height / 2 - p.r : C.height - p.r;
  if (p.y < low) wall(g, p, 0, 1, low - p.y);
  if (p.y > high) wall(g, p, 0, -1, p.y - high);
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
    assistSeat: assisted ? passer.seat : null, ownGoal, value, at: g.simAt,
    charge565: gem.charge565 ?? 0, x: gem.x, y: gem.y };
  event563(g, 'goal', { ...g.lastGoal, x: gem.x, y: gem.y, lastTouch: gem.lastTouch });
  g.gem = null; g.gemReadyAt = g.simAt + C.respawn; g.serveTeam565 = defendingTeam;
  for (const p of g.players) { p.vx = p.vy = 0; p.pulling = false; p.power = 0; }
  g.revision++;
}

export function physicsHockey564(g, dt = C.step / 1000) {
  let left = dt;
  while (left > 1e-9) {
    const bodies = [...g.players, ...(g.gem ? [g.gem] : [])];
    const actorSpeed = Math.max(1, ...g.players.map(p => Math.hypot(p.vx, p.vy)));
    const rotorSpeed = g.hockey565.rotor ? Math.abs(g.rotor.omega) * 2.5 : 0;
    let h = Math.min(left, .12 / (actorSpeed + rotorSpeed + 1));
    if (g.gem) {
      const p = g.gem;
      // Conservative free-space steps shrink near contact, rather than imposing
      // a charge ceiling. Fast pucks cannot cross an entire collider in one step.
      let gap = Math.min(C.width / 2 - Math.abs(p.x) - p.r, p.y - p.r, C.height - p.y - p.r,
        ...g.players.map(q => Math.hypot(p.x-q.x,p.y-q.y)-p.r-q.r));
      for(const goal of g.goals)for(const x of [-goal.halfWidth,goal.halfWidth])
        gap=Math.min(gap,Math.hypot(p.x-x,p.y-goal.y)-p.r-C.postRadius);
      if(g.hockey565.rotor){const co=Math.cos(g.rotor.angle),si=Math.sin(g.rotor.angle),t=clamp(p.x*co+(p.y-C.height/2)*si,-2.5,2.5);gap=Math.min(gap,Math.hypot(p.x-co*t,p.y-C.height/2-si*t)-p.r-.2);}
      h=Math.min(h,Math.max(.12,gap*.8)/(Math.hypot(p.vx,p.vy)+actorSpeed+rotorSpeed+1));
    }
    left -= h;
    g.rotor.angle = (g.rotor.angle + g.rotor.omega * h) % (Math.PI * 2);
    g.rotor.omega *= Math.exp(-.35 * h);
    for (const p of bodies) {
      const drag = p === g.gem ? .52 : p.pulling ? HANDLING568.aimDrag : .78;
      p.vx *= Math.exp(-drag * h); p.vy *= Math.exp(-drag * h);
      p.x += p.vx * h; p.y += p.vy * h;
    }
    for (let pass = 0; pass < 3; pass++) {
      for (const p of bodies) {
        const w = C.width / 2 - p.r;
        if (p.x < -w) wall(g, p, 1, 0, -w - p.x);
        if (p.x > w) wall(g, p, -1, 0, p.x - w);
        if (p === g.gem) {
          const mouth = Math.abs(p.x) + p.r <= C.goalHalfWidth;
          if (!mouth && p.y < p.r) wall(g, p, 0, 1, p.r - p.y);
          if (!mouth && p.y > C.height - p.r) wall(g, p, 0, -1, p.y - C.height + p.r);
        }
        for (const goal of g.goals) for (const x of [-goal.halfWidth, goal.halfWidth]) post(g, p, x, goal.y);
        if (g.hockey565.rotor) rotorGoal563(g, p);
      }
      for (let i = 0; i < g.players.length; i++) for (let j = i + 1; j < g.players.length; j++)
        pairHockey564(g, g.players[i], g.players[j]);
      if (g.gem) for (const p of g.players) pairHockey564(g, p, g.gem);
      // Resolve the center constraint last, including displacement from a spinning rotor.
      for (const p of g.players) keepHome565(g, p);
    }
    for (const p of bodies) p === g.gem ? limitPuck565(g, p) : limit563(p);
    // The entire puck must cross the visible goal line, between the posts.
    if (g.gem && Math.abs(g.gem.x) + g.gem.r <= C.goalHalfWidth) {
      if (g.gem.y + g.gem.r <= 0) { scoreGoal(g, 0); return; }
      else if (g.gem.y - g.gem.r >= C.height) { scoreGoal(g, 1); return; }
    }
  }
}

export function botHockey564(g, p) {
  const gem = g.gem;
  if (!gem) return;
  const low = p.team564 === 0 ? p.r + .05 : C.height / 2 + p.r + .05;
  const high = p.team564 === 0 ? C.height / 2 - p.r - .05 : C.height - p.r - .05;
  const home = y => clamp(y, low, high);
  const onOurSide = p.team564 === 0 ? gem.y <= C.height / 2 + gem.r : gem.y >= C.height / 2 - gem.r;
  const attack = g.goals[1 - p.team564];
  const allies = g.players.filter(q => q.team564 === p.team564);
  const partner = allies.find(q => q.seat !== p.seat);
  if (g.simAt >= (p.planAt565 ?? 0)) {
    p.planAt565 = g.simAt + 1900;
    p.passPlan565 = onOurSide && partner && gem.charge565 < 4 &&
      Math.hypot(partner.x - gem.x, partner.y - gem.y) > 3.2 && random563(g) < .22;
  }
  const aim = p.passPlan565 && onOurSide ? partner : attack;
  const dx = aim.x - gem.x, dy = aim.y - gem.y, d = Math.hypot(dx, dy) || 1;
  const behind = { x: clamp(gem.x - dx / d * 1.55, -7, 7),
    y: home(gem.y - dy / d * 1.55) };
  const distance = q => Math.hypot(behind.x - q.x, behind.y - q.y);
  const striker = [...allies].sort((a, b) => distance(a) - distance(b) || a.seat - b.seat)[0];
  const danger = p.team564 === 0 ? gem.y < 5.5 : gem.y > C.height - 5.5;
  const striking = striker?.seat === p.seat;
  let target, shoot = false;
  if (striking && onOurSide) {
    const onGoalSide = (p.x - gem.x) * dx + (p.y - gem.y) * dy < -.15;
    shoot = onGoalSide && Math.hypot(p.x - gem.x, p.y - gem.y) < 3.4;
    target = shoot ? { x: gem.x + gem.vx * .09, y: gem.y + gem.vy * .09 } : behind;
    // Reposition around the puck instead of driving through it toward our own goal.
    if (!shoot && !onGoalSide && Math.abs(p.x - gem.x) < 2.1) {
      const side = Math.abs(gem.x) > 4.8 ? -Math.sign(gem.x) : p.x < gem.x ? -1 : 1;
      target = {x: clamp(gem.x + side * 2.25, -7, 7), y: home(p.y)};
    }
  } else {
    // One partner stays between the puck and their own goal instead of both chasing.
    target = { x: clamp(gem.x * (striking ? .7 : .42), -5.4, 5.4),
      y: p.team564 === 0 ? (striking ? 6.6 : danger ? 2 : 3.3) : C.height - (striking ? 6.6 : danger ? 2 : 3.3) };
  }
  target.y = home(target.y);
  p.role564 = striking ? 'attack' : 'defend';
  const tx = target.x - p.x, ty = target.y - p.y, dist = Math.hypot(tx, ty);
  if (!shoot && dist < 1.5 && Math.hypot(p.vx, p.vy) < 3) return;
  const desiredSpeed = shoot ? 19 + random563(g) * 6 : clamp(dist * 1.35, 5, 15);
  const vx = tx / (dist || 1) * desiredSpeed - p.vx * HANDLING568.carry;
  const vy = ty / (dist || 1) * desiredSpeed - p.vy * HANDLING568.carry;
  const impulse = Math.hypot(vx, vy), power = clamp((-14 + Math.sqrt(196 + 72 * Math.max(0, impulse - 3))) / 36, .08, 1);
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
    if (g.gem?.touch565) g.gem.touch565.at += shift;
    for (const p of g.players) if (p.planAt565 != null) p.planAt565 += shift;
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
    if (!g.gem) { inputs.length = 0; continue; }
    while (inputs.length && inputs[0].at <= g.simAt) {
      const m = inputs.shift(), p = g.players.find(q => q.playerId === m.playerId);
      if (!auto.has(p?.playerId) && !p?.ai) input564(g, p, m);
    }
    for (const p of g.players) if ((p.ai || auto.has(p.playerId)) && g.simAt >= p.botAt && canShoot564(g, p)) {
      const aim = botHockey564(g, p);
      if (aim) launch564(g, p, aim.power, aim.angle);
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
