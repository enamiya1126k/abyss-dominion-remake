import { randomBytes } from "node:crypto";

const SIDES = new Set(["sun", "moon", "spectator"]);
const ACTIONS = new Set(["attack", "guard", "skill", "item"]);
const SPEEDS = new Set([0.5, 1, 2]);
const RULESETS = new Set(["standard", "balanced", "blitz"]);
const SERIES = new Set(["bo1", "bo3"]);
const COMMAND_MS = 18_000;
const BLITZ_COMMAND_MS = 9_000;
const EFFECT_KINDS = new Set([
  "atkUp", "defUp", "spdUp", "evasionUp", "accuracyUp",
  "atkDown", "defDown", "spdDown", "evasionDown", "accuracyDown",
  "critUp", "critDown", "vulnerable", "regen", "counter", "guard", "taunt", "lifeSteal",
]);

const token = (bytes = 10) => randomBytes(bytes).toString("base64url");
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const cleanText = (value, max = 80) => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);

function normalizedSettings(source = {}) {
  const ruleset = RULESETS.has(source?.ruleset) ? source.ruleset : "standard";
  const series = SERIES.has(source?.series) ? source.series : "bo1";
  return { ruleset, series };
}

function targetWinsFor(series) {
  return series === "bo3" ? 2 : 1;
}

function statPower(stats = {}) {
  const offense = Math.max(1, (Number(stats.atk) || 1) + (Number(stats.matk) || 1));
  const defense = Math.max(1, (Number(stats.def) || 0) + (Number(stats.mdef) || 0));
  return Math.max(1, Math.sqrt(Math.max(1, Number(stats.hp) || 1)) * Math.sqrt(offense * defense) * Math.max(1, Math.sqrt(Number(stats.spd) || 1)));
}

function balancedStats(stats, member, participants, sideCounts) {
  const powerValues = participants.map(entry => Math.max(1, Number(entry.profile?.power) || statPower(entry.profile?.battleStats)));
  const averagePower = powerValues.reduce((sum, value) => sum + value, 0) / Math.max(1, powerValues.length);
  const ownPower = Math.max(1, Number(member.profile?.power) || statPower(stats));
  const buildScale = clamp(Math.sqrt(averagePower / ownPower), 0.65, 1.6);
  const ownCount = Math.max(1, sideCounts[member.teamSide] || 1);
  const enemyCount = Math.max(1, sideCounts[member.teamSide === "sun" ? "moon" : "sun"] || 1);
  const numberAdvantage = Math.max(1, enemyCount / ownCount);
  const enduranceScale = clamp(buildScale * numberAdvantage, 0.65, 3);
  const combatScale = clamp(buildScale * Math.sqrt(numberAdvantage), 0.65, 2.1);
  return {
    hp: Math.max(1, Math.round(stats.hp * enduranceScale)),
    mp: Math.max(0, Math.round(stats.mp * clamp(buildScale, 0.8, 1.4))),
    atk: Math.max(1, Math.round(stats.atk * combatScale)),
    matk: Math.max(1, Math.round(stats.matk * combatScale)),
    def: Math.max(0, Math.round(stats.def * combatScale)),
    mdef: Math.max(0, Math.round(stats.mdef * combatScale)),
    spd: Math.max(1, Math.round(stats.spd * clamp(Math.sqrt(buildScale), 0.82, 1.24))),
    crit: stats.crit,
    evasion: stats.evasion,
    accuracy: stats.accuracy,
  };
}

function initialEffects(circleEffect) {
  return circleEffect === "openingBuff" ? [{ kind: "atkUp", value: .2, turns: 999 }, { kind: "critUp", value: .2, turns: 999 }] : [];
}

function resetPlayerForGame(player) {
  const initial = player.initial;
  player.hp = initial.maxHp;
  player.maxHp = initial.maxHp;
  player.mp = initial.maxMp;
  player.maxMp = initial.maxMp;
  player.shield = initial.shield;
  player.guard = false;
  player.itemCharges = 1;
  player.effects = initialEffects(player.circleEffect);
  player.circleLastLifeUsed = false;
  player.circleReviveUsed = false;
}

function resultSummary(battle) {
  const rows = Object.values(battle.players).map(player => {
    const metrics = player.metrics ?? {};
    const score = Math.max(0, Math.round((metrics.damage || 0) + (metrics.healing || 0) * .7 + (metrics.support || 0) * 250 + (metrics.kos || 0) * 1000));
    return { playerId: player.playerId, name: player.name, monsterName: player.monsterName, side: player.side, score, damage: metrics.damage || 0, healing: metrics.healing || 0, damageTaken: metrics.damageTaken || 0, guards: metrics.guards || 0, support: metrics.support || 0, kos: metrics.kos || 0 };
  }).sort((left, right) => right.score - left.score || right.damage - left.damage || left.playerId.localeCompare(right.playerId));
  return {
    resultId: `team:${battle.id}`,
    winner: battle.winner ?? null,
    outcome: battle.outcome ?? null,
    ruleset: battle.ruleset,
    series: battle.series,
    format: battle.format,
    score: { ...battle.score },
    games: (battle.games ?? []).map(game => ({ ...game, score: { ...game.score } })),
    mvpPlayerId: rows[0]?.playerId ?? null,
    ranking: rows.map((entry, index) => ({ ...entry, rank: index + 1 })),
  };
}

function effectValue(entity, kind) {
  return (entity?.effects ?? [])
    .filter(effect => effect.kind === kind && effect.turns > 0)
    .reduce((best, effect) => Math.max(best, Number(effect.value) || 0), 0);
}

function addEffect(entity, effect) {
  if (!entity || !EFFECT_KINDS.has(effect?.kind)) return;
  entity.effects ??= [];
  const current = entity.effects.find(entry => entry.kind === effect.kind);
  if (current) {
    current.value = Math.max(current.value, clamp(effect.value, 0, 3));
    current.turns = Math.max(current.turns, Math.round(clamp(effect.turns, 1, 20)));
  } else {
    entity.effects.push({
      kind: effect.kind,
      value: clamp(effect.value, 0, 3),
      turns: Math.round(clamp(effect.turns, 1, 20)),
    });
  }
}

function tickEffects(entity) {
  entity.effects = (entity.effects ?? [])
    .map(effect => ({ ...effect, turns: effect.turns - 1 }))
    .filter(effect => effect.turns > 0);
}

function statFactor(entity, up, down) {
  return Math.max(0.2, 1 + effectValue(entity, up) - effectValue(entity, down));
}

function effectiveEvasion(entity) {
  return clamp((entity?.stats?.evasion ?? 0) * statFactor(entity, "evasionUp", "evasionDown"), 0, 75);
}

function hitLands(attacker, target, random, guaranteed = false) {
  if (guaranteed) return true;
  const accuracy = clamp((attacker?.stats?.accuracy ?? 100) * statFactor(attacker, "accuracyUp", "accuracyDown"), 20, 180);
  const dodge = clamp(effectiveEvasion(target) - (accuracy - 100) * 0.5, 0, 75);
  return random() < clamp(1 - dodge / 100, 0.08, 0.98);
}

function circleDamageFactor(actor, round = 1, aliveCount = 2) {
  const effect = actor?.circleEffect ?? "none", missing = 1 - actor.hp / Math.max(1, actor.maxHp), level = Math.max(0, Number(actor?.circleLevel) || 0);
  if (effect === "openingBuff") return 1.2;
  if (effect === "manaReversal") return 1.15 + Math.min(.25, level * .004);
  if (effect === "rage") return 1 + missing * .75;
  if (effect === "lowHpPower") return 1 + missing * 1.15;
  if (effect === "goldPower") return 1.12 + Math.min(.3, level * .004);
  if (effect === "soleSurvivor" && aliveCount === 1) return 1.65;
  if (effect === "slot") { const seed = [...`${actor.playerId}:${round}`].reduce((sum, char) => Math.imul(sum ^ char.charCodeAt(0), 16777619) >>> 0, 2166136261), roll = seed % 1000; return roll === 0 ? 0 : .5 + roll / 400; }
  return 1;
}

function publicPlayer(player) {
  const { stats, initial, ...safe } = player;
  return { ...safe, effects: (safe.effects ?? []).map(effect => ({ ...effect })) };
}

export function teamBattleSnapshot(battle) {
  if (!battle) return null;
  return {
    id: battle.id,
    round: battle.round,
    phase: battle.phase,
    speed: battle.speed,
    deadlineAt: battle.deadlineAt,
    nextRoundAt: battle.nextRoundAt,
    outcome: battle.outcome,
    winner: battle.winner,
    format: battle.format,
    ruleset: battle.ruleset,
    series: battle.series,
    game: battle.game,
    targetWins: battle.targetWins,
    score: { ...(battle.score ?? { sun: 0, moon: 0 }) },
    betweenGames: Boolean(battle.betweenGames),
    gameWinner: battle.gameWinner ?? null,
    games: (battle.games ?? []).map(game => ({ ...game, score: { ...game.score } })),
    summary: battle.summary ? { ...battle.summary, score: { ...(battle.summary.score ?? {}) }, games: (battle.summary.games ?? []).map(game => ({ ...game, score: { ...(game.score ?? {}) } })), ranking: (battle.summary.ranking ?? []).map(entry => ({ ...entry })) } : null,
    focusTarget: battle.focusTarget ? { ...battle.focusTarget } : null,
    cheeredBy: [...(battle.cheeredBy ?? [])],
    players: Object.values(battle.players).map(publicPlayer),
    actions: Object.fromEntries(Object.entries(battle.actions).map(([id, action]) => [id, {
      kind: action.kind,
      skillId: action.skillId ?? null,
      targetId: action.targetId ?? null,
      auto: Boolean(action.auto),
    }])),
    lastEvents: (battle.lastEvents ?? []).map(event => ({ ...event })),
  };
}

export class TeamBattleCoordinator {
  constructor({ now = () => Date.now(), random = Math.random, sessions, broadcast = () => {} } = {}) {
    this.now = now;
    this.random = random;
    this.sessions = sessions;
    this.broadcast = broadcast;
  }

  settings(room) {
    if (!room) return normalizedSettings();
    room.teamSettings = normalizedSettings(room.teamSettings);
    return { ...room.teamSettings };
  }

  setSettings(room, session, source = {}) {
    if (!room) return { ok: false, code: "NOT_IN_ROOM", message: "部屋に参加していません" };
    if (room.leaderId !== session.playerId) return { ok: false, code: "LEADER_ONLY", message: "対戦ルールを変更できるのはリーダーだけです" };
    if (room.phase !== "lobby") return { ok: false, code: "ROOM_BUSY", message: "ロビーでのみ対戦ルールを変更できます" };
    const requestedRuleset = cleanText(source.ruleset, 20), requestedSeries = cleanText(source.series, 20);
    if (requestedRuleset && !RULESETS.has(requestedRuleset)) return { ok: false, code: "BAD_TEAM_RULESET", message: "その対戦ルールは使用できません" };
    if (requestedSeries && !SERIES.has(requestedSeries)) return { ok: false, code: "BAD_TEAM_SERIES", message: "その勝敗形式は使用できません" };
    const current = this.settings(room);
    room.teamSettings = normalizedSettings({ ruleset: requestedRuleset || current.ruleset, series: requestedSeries || current.series });
    for (const id of room.members) {
      const member = this.sessions.get(id);
      if (member) member.teamReady = false;
    }
    this.broadcast(room, { type: "roomRefresh" });
    return { ok: true, settings: this.settings(room) };
  }

  swapSides(room, session) {
    if (!room) return { ok: false, code: "NOT_IN_ROOM", message: "部屋に参加していません" };
    if (room.leaderId !== session.playerId) return { ok: false, code: "LEADER_ONLY", message: "チームを入れ替えられるのはリーダーだけです" };
    if (room.phase !== "lobby") return { ok: false, code: "ROOM_BUSY", message: "ロビーでのみチームを入れ替えられます" };
    let changed = 0;
    for (const id of room.members) {
      const member = this.sessions.get(id);
      if (!member) continue;
      if (member.teamSide === "sun") { member.teamSide = "moon"; changed += 1; }
      else if (member.teamSide === "moon") { member.teamSide = "sun"; changed += 1; }
      member.teamReady = false;
    }
    if (!changed) return { ok: false, code: "NO_TEAM_PLAYERS", message: "入れ替える対戦参加者がいません" };
    this.broadcast(room, { type: "roomRefresh" });
    return { ok: true, swapped: changed };
  }

  setSide(room, session, side) {
    if (!room) return { ok: false, code: "NOT_IN_ROOM", message: "部屋に参加していません" };
    if (room.phase !== "lobby") return { ok: false, code: "ROOM_BUSY", message: "別の共闘コンテンツを終了してください" };
    const next = SIDES.has(side) ? side : "spectator";
    session.teamSide = next;
    session.teamReady = false;
    this.broadcast(room, { type: "roomRefresh" });
    return { ok: true, side: next };
  }

  setReady(room, session, ready) {
    if (!room) return { ok: false, code: "NOT_IN_ROOM", message: "部屋に参加していません" };
    if (room.phase !== "lobby") return { ok: false, code: "ROOM_BUSY", message: "別の共闘コンテンツを終了してください" };
    if (!["sun", "moon"].includes(session.teamSide)) return { ok: false, code: "TEAM_REQUIRED", message: "紅組か蒼組を選んでください" };
    session.teamReady = Boolean(ready);
    this.broadcast(room, { type: "roomRefresh" });
    return { ok: true };
  }

  start(room, session) {
    if (!room) return { ok: false, code: "NOT_IN_ROOM", message: "部屋に参加していません" };
    if (room.leaderId !== session.playerId) return { ok: false, code: "LEADER_ONLY", message: "チーム戦を開始できるのはリーダーだけです" };
    if (room.phase !== "lobby") return { ok: false, code: "ROOM_BUSY", message: "別の共闘コンテンツを終了してください" };
    const participants = [...room.members]
      .map(id => this.sessions.get(id))
      .filter(member => member && ["sun", "moon"].includes(member.teamSide));
    const sun = participants.filter(member => member.teamSide === "sun");
    const moon = participants.filter(member => member.teamSide === "moon");
    if (participants.length < 2 || !sun.length || !moon.length) return { ok: false, code: "BAD_TEAMS", message: "紅組と蒼組へ1人以上ずつ参加してください" };
    if (participants.length > 4) return { ok: false, code: "TOO_MANY_PLAYERS", message: "参加できるのは最大4人です" };
    if (participants.some(member => !member.connected)) return { ok: false, code: "MEMBER_OFFLINE", message: "再接続待ちの参加者がいます" };
    if (participants.some(member => !member.teamReady)) return { ok: false, code: "NOT_ALL_READY", message: "参加者全員の準備完了を待っています" };

    const settings = this.settings(room), sideCounts = { sun: sun.length, moon: moon.length };
    const players = {}, circleEvents = [];
    for (const member of participants) {
      const sourceStats = member.profile.battleStats;
      const stats = settings.ruleset === "balanced" ? balancedStats(sourceStats, member, participants, sideCounts) : { ...sourceStats };
      const circleEffect = member.profile.circleEffect ?? "none";
      const shield = circleEffect === "shield" ? Math.ceil(stats.hp * .5) : 0;
      players[member.playerId] = {
        playerId: member.playerId,
        name: member.profile.displayName,
        monsterName: member.profile.monsterName,
        speciesId: member.profile.speciesId,
        fallbackEmoji: member.profile.fallbackEmoji,
        side: member.teamSide,
        hp: stats.hp,
        maxHp: stats.hp,
        mp: stats.mp,
        maxMp: stats.mp,
        shield,
        guard: false,
        itemCharges: 1,
        stats: { ...stats },
        effects: initialEffects(circleEffect),
        circleEffect, circleLevel: member.profile.circleLevel ?? 0, circleLastLifeUsed: false, circleReviveUsed: false,
        balanced: settings.ruleset === "balanced",
        balanceFactor: settings.ruleset === "balanced" ? Number((stats.hp / Math.max(1, sourceStats.hp)).toFixed(3)) : 1,
        initial: { maxHp: stats.hp, maxMp: stats.mp, shield },
        metrics: { damage: 0, healing: 0, damageTaken: 0, guards: 0, support: 0, kos: 0 },
      };
      if (circleEffect !== "none") circleEvents.push({ kind: "circleActivate", actorId: member.playerId, actorName: member.profile.displayName, targetKind: "player", targetId: member.playerId, label: member.profile.circleName || "魔法陣" });
      member.teamReady = false;
    }
    room.teamBattle = {
      id: token(), round: 1, game: 1, phase: "command", speed: 1,
      deadlineAt: this.now() + (settings.ruleset === "blitz" ? BLITZ_COMMAND_MS : COMMAND_MS), nextRoundAt: 0,
      outcome: null, winner: null, format: `${sun.length} vs ${moon.length}`,
      ruleset: settings.ruleset, series: settings.series, targetWins: targetWinsFor(settings.series),
      score: { sun: 0, moon: 0 }, games: [], betweenGames: false, gameWinner: null,
      commandMs: settings.ruleset === "blitz" ? BLITZ_COMMAND_MS : COMMAND_MS,
      damageMultiplier: settings.ruleset === "blitz" ? 1.25 : 1,
      healingMultiplier: settings.ruleset === "blitz" ? .85 : 1,
      players, actions: {}, lastEvents: [...circleEvents, { kind: "seriesStart", label: `${settings.series === "bo3" ? "2本先取" : "1本先取"}・${settings.ruleset === "balanced" ? "均衡" : settings.ruleset === "blitz" ? "速攻" : "通常"}ルール` }],
    };
    room.phase = "team";
    this.broadcast(room, { type: "teamBattleStarted", teamBattle: teamBattleSnapshot(room.teamBattle) });
    this.broadcast(room, { type: "roomRefresh" });
    return { ok: true, teamBattle: teamBattleSnapshot(room.teamBattle) };
  }

  action(room, session, source = {}) {
    const battle = room?.teamBattle;
    if (!battle || room.phase !== "team") return { ok: false, code: "NO_TEAM_BATTLE", message: "チーム戦は開始されていません" };
    if (battle.phase !== "command") return { ok: false, code: "ACTION_CLOSED", message: "現在は行動を選べません" };
    const actor = battle.players[session.playerId];
    if (!actor || actor.hp <= 0) return { ok: false, code: "ACTOR_DOWN", message: "戦闘不能中です" };
    const kind = ACTIONS.has(source.kind) ? source.kind : "attack";
    const skill = kind === "skill" ? session.profile.skills.find(entry => entry.id === cleanText(source.skillId, 80)) : null;
    if (kind === "skill" && !skill) return { ok: false, code: "BAD_SKILL", message: "そのスキルは使用できません" };
    if (skill && actor.mp < skill.mp) return { ok: false, code: "NO_MP", message: "MPが足りません" };
    if (kind === "item" && actor.itemCharges <= 0) return { ok: false, code: "NO_ITEM", message: "応急薬は使用済みです" };

    const targetId = cleanText(source.targetId, 80);
    const values = Object.values(battle.players);
    const supportAction = kind === "item" || kind === "skill" && skill?.kind !== "attack";
    const attackSkill = !supportAction;
    const candidates = values.filter(player => attackSkill ? player.side !== actor.side && player.hp > 0 : player.side === actor.side);
    let target = candidates.find(player => player.playerId === targetId);
    if (!target) target = attackSkill ? candidates.find(player => player.hp > 0) : actor;
    if (!target) return { ok: false, code: "NO_TARGET", message: "対象がいません" };
    if (skill?.kind === "revive" && target.hp > 0) return { ok: false, code: "TARGET_ALIVE", message: "倒れている味方を選んでください" };
    if (!attackSkill && skill?.kind !== "revive" && target.hp <= 0) return { ok: false, code: "TARGET_DOWN", message: "戦闘可能な味方を選んでください" };
    battle.actions[session.playerId] = { kind, skillId: skill?.id ?? null, targetId: target.playerId, submittedAt: this.now(), auto: false };
    this.broadcast(room, { type: "teamBattleState", teamBattle: teamBattleSnapshot(battle) });
    if (this._allReady(battle)) this._resolve(room, battle);
    return { ok: true, teamBattle: teamBattleSnapshot(battle) };
  }

  setSpeed(room, session, value) {
    const battle = room?.teamBattle;
    if (!battle) return { ok: false, code: "NO_TEAM_BATTLE", message: "チーム戦は開始されていません" };
    if (room.leaderId !== session.playerId) return { ok: false, code: "LEADER_ONLY", message: "速度変更はリーダーだけが行えます" };
    const speed = Number(value);
    if (!SPEEDS.has(speed)) return { ok: false, code: "BAD_SPEED", message: "その速度は選べません" };
    battle.speed = speed;
    this.broadcast(room, { type: "teamBattleState", teamBattle: teamBattleSnapshot(battle) });
    return { ok: true };
  }

  playerLeft(room, playerId) {
    const session = this.sessions.get(playerId);
    if (session) session.teamReady = false;
    const battle = room?.teamBattle;
    if (room?.phase === "team" && battle?.players?.[playerId]) {
      delete battle.players[playerId];
      delete battle.actions[playerId];
      const players = Object.values(battle.players);
      const aliveSun = players.some(player => player.side === "sun" && player.hp > 0);
      const aliveMoon = players.some(player => player.side === "moon" && player.hp > 0);
      if (!aliveSun || !aliveMoon) {
        battle.outcome = aliveSun === aliveMoon ? "draw" : "victory";
        battle.winner = aliveSun === aliveMoon ? null : aliveSun ? "sun" : "moon";
        if (battle.winner) battle.score[battle.winner] = battle.targetWins;
        battle.gameWinner = battle.winner;
        battle.games.push({ game: battle.game, winner: battle.winner, reason: "forfeit", score: { ...battle.score } });
        battle.summary = resultSummary(battle);
        battle.phase = "result";
        battle.deadlineAt = 0;
        battle.nextRoundAt = this.now();
        battle.lastEvents = [{ kind: "result", label: battle.winner ? `${battle.winner === "sun" ? "紅組" : "蒼組"} 勝利（相手が退出）` : "引き分け" }];
      }
      this.broadcast(room, { type: "teamBattleState", teamBattle: teamBattleSnapshot(battle) });
    }
    this.broadcast(room, { type: "roomRefresh" });
  }

  advance(room) {
    const battle = room?.teamBattle;
    if (!battle || room.phase !== "team") return;
    const now = this.now();
    if (battle.phase === "command") {
      for (const actor of Object.values(battle.players)) {
        const session = this.sessions.get(actor.playerId);
        if (actor.hp <= 0 || battle.actions[actor.playerId] || session?.connected) continue;
        battle.actions[actor.playerId] = this._autoAction(battle, actor);
      }
      if (now >= battle.deadlineAt || this._allReady(battle)) this._resolve(room, battle);
      return;
    }
    if (battle.phase !== "result" || now < battle.nextRoundAt) return;
    if (battle.outcome) {
      battle.summary ??= resultSummary(battle);
      this.broadcast(room, { type: "teamBattleEnded", resultId: battle.summary.resultId, result: battle.outcome, winner: battle.winner, summary: battle.summary, teamBattle: teamBattleSnapshot(battle) });
      room.phase = "lobby";
      room.teamBattle = null;
      for (const id of room.members) {
        const member = this.sessions.get(id);
        if (member) member.teamReady = false;
      }
      this.broadcast(room, { type: "roomRefresh" });
      return;
    }
    if (battle.betweenGames) {
      this._openNextGame(room, battle, now);
      return;
    }
    battle.round += 1;
    battle.phase = "command";
    battle.deadlineAt = now + battle.commandMs;
    battle.nextRoundAt = 0;
    battle.actions = {};
    battle.lastEvents = [];
    for (const player of Object.values(battle.players)) {
      player.guard = false;
      const regen = effectValue(player, "regen");
      if (regen && player.hp > 0) player.hp = Math.min(player.maxHp, player.hp + Math.ceil(player.maxHp * regen));
      tickEffects(player);
    }
    this.broadcast(room, { type: "teamBattleRound", teamBattle: teamBattleSnapshot(battle) });
    this.broadcast(room, { type: "roomRefresh" });
  }

  _openNextGame(room, battle, now) {
    battle.game += 1;
    battle.round = 1;
    battle.phase = "command";
    battle.deadlineAt = now + battle.commandMs;
    battle.nextRoundAt = 0;
    battle.actions = {};
    battle.betweenGames = false;
    battle.gameWinner = null;
    battle.lastEvents = [];
    for (const player of Object.values(battle.players)) {
      resetPlayerForGame(player);
      if (player.circleEffect !== "none") battle.lastEvents.push({ kind: "circleActivate", actorId: player.playerId, actorName: player.name, targetKind: "player", targetId: player.playerId, label: this.sessions.get(player.playerId)?.profile?.circleName || "魔法陣" });
    }
    battle.lastEvents.push({ kind: "gameStart", label: `第${battle.game}戦開始・紅 ${battle.score.sun} - ${battle.score.moon} 蒼` });
    this.broadcast(room, { type: "teamBattleRound", teamBattle: teamBattleSnapshot(battle) });
    this.broadcast(room, { type: "roomRefresh" });
  }

  _allReady(battle) {
    return Object.values(battle.players).filter(player => player.hp > 0).every(player => battle.actions[player.playerId]);
  }

  _autoAction(battle, actor) {
    const target = Object.values(battle.players).find(player => player.side !== actor.side && player.hp > 0);
    return { kind: "attack", targetId: target?.playerId ?? null, skillId: null, submittedAt: this.now(), auto: true };
  }

  _resolve(room, battle) {
    if (battle.phase !== "command") return;
    for (const actor of Object.values(battle.players)) {
      if (actor.hp <= 0 || battle.actions[actor.playerId]) continue;
      battle.actions[actor.playerId] = this._autoAction(battle, actor);
    }
    const events = [];
    const order = Object.values(battle.players)
      .filter(player => player.hp > 0)
      .sort((a, b) => b.stats.spd * statFactor(b, "spdUp", "spdDown") - a.stats.spd * statFactor(a, "spdUp", "spdDown"));
    for (const actor of order) {
      if (actor.hp <= 0) continue;
      this._resolveAction(battle, actor, battle.actions[actor.playerId], events);
    }
    const aliveSun = Object.values(battle.players).some(player => player.side === "sun" && player.hp > 0);
    const aliveMoon = Object.values(battle.players).some(player => player.side === "moon" && player.hp > 0);
    if (!aliveSun || !aliveMoon) {
      const gameWinner = aliveSun === aliveMoon ? null : aliveSun ? "sun" : "moon";
      battle.gameWinner = gameWinner;
      if (gameWinner) battle.score[gameWinner] += 1;
      battle.games.push({ game: battle.game, winner: gameWinner, reason: gameWinner ? "ko" : "draw", score: { ...battle.score } });
      if (battle.games.length > 8) battle.games = battle.games.slice(-8);
      const reachedTarget = gameWinner && battle.score[gameWinner] >= battle.targetWins;
      const drawLimit = !gameWinner && (battle.series === "bo1" || battle.games.length >= 5);
      if (reachedTarget) { battle.outcome = "victory"; battle.winner = gameWinner; }
      else if (drawLimit) { battle.outcome = "draw"; battle.winner = null; }
      else { battle.outcome = null; battle.winner = null; battle.betweenGames = true; }
      events.push({ kind: "result", label: gameWinner ? `第${battle.game}戦 ${gameWinner === "sun" ? "紅組" : "蒼組"}勝利（${battle.score.sun}-${battle.score.moon}）` : "この試合は引き分け" });
      if (battle.outcome) battle.summary = resultSummary(battle);
    }
    battle.phase = "result";
    battle.deadlineAt = 0;
    battle.nextRoundAt = this.now() + Math.round(2200 / battle.speed);
    battle.lastEvents = events;
    this.broadcast(room, { type: "teamBattleResolved", teamBattle: teamBattleSnapshot(battle), events });
    this.broadcast(room, { type: "roomRefresh" });
  }

  _resolveAction(battle, actor, action, events) {
    if (!action) return;
    const session = this.sessions.get(actor.playerId);
    const actorName = session?.profile?.displayName ?? actor.name ?? "挑戦者";
    const skill = action.kind === "skill" ? session?.profile.skills.find(entry => entry.id === action.skillId) : null;
    const players = Object.values(battle.players);
    const allies = players.filter(player => player.side === actor.side);
    const enemies = players.filter(player => player.side !== actor.side && player.hp > 0);
    const target = players.find(player => player.playerId === action.targetId);
    if (action.kind === "guard") {
      actor.guard = true;
      actor.metrics.guards += 1;
      actor.metrics.support += 1;
      events.push({ kind: "guard", actorId: actor.playerId, actorName, targetKind: "player", targetId: actor.playerId, label: "ガード" });
      return;
    }
    if (action.kind === "item") {
      actor.itemCharges = Math.max(0, actor.itemCharges - 1);
      const ally = target?.side === actor.side ? target : actor;
      const before = ally.hp;
      ally.hp = Math.min(ally.maxHp, ally.hp + Math.ceil(ally.maxHp * 0.35 * (battle.healingMultiplier ?? 1)));
      const healed = ally.hp - before;
      actor.metrics.healing += healed;
      actor.metrics.support += 1;
      events.push({ kind: "heal", actorId: actor.playerId, actorName, targetKind: "player", targetId: ally.playerId, value: healed, label: "模擬戦応急薬" });
      return;
    }
    if (skill) actor.mp = Math.max(0, actor.mp - skill.mp);
    if (skill?.kind === "revive") {
      const fallen = target?.side === actor.side && target.hp <= 0 ? target : allies.find(player => player.hp <= 0);
      if (fallen) {
        fallen.hp = Math.max(1, Math.ceil(fallen.maxHp * Math.max(0.2, skill.heal || 0.35)));
        actor.metrics.healing += fallen.hp;
        actor.metrics.support += 2;
        events.push({ kind: "revive", actorId: actor.playerId, actorName, targetKind: "player", targetId: fallen.playerId, value: fallen.hp, label: skill.name });
      }
      return;
    }
    if (skill && ["heal", "allHeal", "mpHeal", "guard", "buff"].includes(skill.kind)) {
      const targets = skill.allAllies || skill.kind === "allHeal" ? allies.filter(player => player.hp > 0) : [target?.side === actor.side ? target : actor];
      if (["heal", "allHeal"].includes(skill.kind)) for (const ally of targets) {
        const before = ally.hp;
        ally.hp = Math.min(ally.maxHp, ally.hp + Math.ceil(ally.maxHp * Math.max(0.12, skill.heal || 0.25) * (battle.healingMultiplier ?? 1)));
        const healed = ally.hp - before;
        actor.metrics.healing += healed;
        events.push({ kind: "heal", actorId: actor.playerId, actorName, targetKind: "player", targetId: ally.playerId, value: healed, label: skill.name });
      }
      if (skill.kind === "mpHeal") for (const ally of targets) {
        const before = ally.mp;
        ally.mp = Math.min(ally.maxMp, ally.mp + Math.ceil(ally.maxMp * Math.max(0.15, skill.mpHeal || 0.25)));
        const restored = ally.mp - before;
        actor.metrics.support += Math.max(1, Math.ceil(restored / Math.max(1, ally.maxMp) * 10));
        events.push({ kind: "mpHeal", actorId: actor.playerId, actorName, targetKind: "player", targetId: ally.playerId, value: restored, label: skill.name });
      }
      if (skill.kind === "guard") for (const ally of targets) ally.guard = true;
      for (const effect of skill.effects ?? []) if (effect.allies || !effect.enemy) for (const ally of targets) addEffect(ally, effect);
      if (skill.partyShieldRate) for (const ally of targets) ally.shield = Math.max(ally.shield, Math.ceil(ally.maxHp * skill.partyShieldRate));
      actor.metrics.support += Math.max(1, targets.length);
      if (!events.some(event => event.actorId === actor.playerId && event.label === skill.name)) events.push({ kind: "buff", actorId: actor.playerId, actorName, targetKind: "player", targetId: targets[0]?.playerId, label: skill.name });
      return;
    }
    const defender = target?.side !== actor.side && target.hp > 0 ? target : enemies[0];
    if (!defender) return;
    if (!hitLands(actor, defender, this.random, Boolean(skill?.guaranteedHit))) {
      events.push({ kind: "miss", actorId: actor.playerId, actorName, targetId: defender.playerId, label: `${defender.name}が回避` });
      return;
    }
    const magic = skill?.damageClass === "magic";
    const attack = (magic ? actor.stats.matk : actor.stats.atk) * statFactor(actor, "atkUp", "atkDown") * circleDamageFactor(actor, battle.round, allies.filter(player => player.hp > 0).length);
    const defense = (magic ? defender.stats.mdef : defender.stats.def) * statFactor(defender, "defUp", "defDown");
    const power = skill?.kind === "attack" ? Math.max(0.2, skill.power * skill.hits) : 1;
    const ratio = attack / Math.max(1, attack + defense);
    const criticalRate = actor.stats.crit / 100 + effectValue(actor, "critUp") - effectValue(actor, "critDown");
    const critical = this.random() < clamp(criticalRate, 0, 0.65);
    const capRate = skill ? 0.55 : 0.38;
    const raw = Math.max(1, Math.round(defender.maxHp * ratio * 0.48 * power * (battle.damageMultiplier ?? 1) * (0.92 + this.random() * 0.16) * (critical ? 1.45 : 1)));
    let value = Math.min(raw, Math.max(1, Math.ceil(defender.maxHp * capRate)));
    if (defender.guard) value = Math.max(1, Math.round(value * 0.42));
    const absorbed = Math.min(defender.shield ?? 0, value);
    defender.shield = Math.max(0, (defender.shield ?? 0) - absorbed);
    const before = defender.hp;
    defender.hp = Math.max(0, defender.hp - (value - absorbed));
    if (defender.hp <= 0 && before > 0 && defender.circleEffect === "lastLife" && !defender.circleLastLifeUsed) { defender.circleLastLifeUsed = true; defender.hp = 1; events.push({ kind: "circleActivate", targetKind: "player", targetId: defender.playerId, label: "不屈の残光" }); }
    if (defender.hp <= 0 && before > 0 && defender.circleEffect === "revive" && !defender.circleReviveUsed) { defender.circleReviveUsed = true; defender.hp = Math.max(1, Math.ceil(defender.maxHp * .35)); events.push({ kind: "circleActivate", targetKind: "player", targetId: defender.playerId, label: "輪廻の魔法陣" }); }
    const dealt = before - defender.hp;
    actor.metrics.damage += dealt;
    defender.metrics.damageTaken += dealt;
    events.push({ kind: "damage", actorId: actor.playerId, actorName, targetId: defender.playerId, value: dealt, absorbed, critical, label: skill?.name ?? "たたかう" });
    if (skill) for (const effect of skill.effects ?? []) if (effect.enemy) addEffect(defender, effect);
    if (defender.hp <= 0) { actor.metrics.kos += 1; events.push({ kind: "ko", targetId: defender.playerId, label: `${defender.name} 戦闘不能` }); }
  }
}
