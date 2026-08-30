const GAME_TYPES = new Set(["mimic", "race"]);
const ACTIVE_STATUSES = new Set(["active", "intermission", "racing"]);
const MIMIC_ROUNDS = 5;
const MIMIC_FUSE_MIN_MS = 7_000;
const MIMIC_FUSE_MAX_MS = 13_000;
const MIMIC_PASS_COOLDOWN_MS = 500;
const MIMIC_INTERMISSION_MS = 1_800;
const RACE_DURATION_MIN_MS = 7_000;
const RACE_DURATION_MAX_MS = 11_000;
const RECONNECT_GRACE_MS = 15_000;
const ACTION_RECEIPT_LIMIT = 128;
const HISTORY_LIMIT = 20;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}

function asId(value, maximum = 128) {
  return String(value ?? "").trim().slice(0, maximum);
}

function cloneWins(source = {}) {
  const result = {};
  for (const [playerId, record] of Object.entries(source ?? {})) {
    const id = asId(playerId, 40);
    if (!id) continue;
    const mimic = Math.max(0, Math.floor(Number(record?.mimic) || 0));
    const race = Math.max(0, Math.floor(Number(record?.race) || 0));
    result[id] = { mimic, race, total: mimic + race };
  }
  return result;
}

function roomHasPlayer(room, playerId) {
  if (!room || !playerId) return false;
  if (room.members instanceof Set) return room.members.has(playerId);
  if (Array.isArray(room.members)) {
    return room.members.some(value => (value?.playerId ?? value) === playerId);
  }
  return true;
}

/**
 * Server-authoritative coordinator for the gathering hall's lightweight games.
 *
 * Private deadlines, race rolls and idempotency receipts live below `_private`
 * and are deliberately omitted by snapshot(). The surrounding RoomStore only
 * needs to broadcast a fresh snapshot when a mutating method reports `changed`.
 */
export class HallMinigameCoordinator {
  constructor({ now = () => Date.now(), random = Math.random, sessions = new Map() } = {}) {
    this.now = typeof now === "function" ? now : () => Date.now();
    this.random = typeof random === "function" ? random : Math.random;
    this.sessions = sessions;
    this.sequence = 0;
  }

  active(room) {
    return Boolean(room?.hallGame && ACTIVE_STATUSES.has(room.hallGame.status));
  }

  snapshot(room) {
    const game = room?.hallGame;
    if (!game || !GAME_TYPES.has(game.type)) return null;
    const serverNow = this.now();

    const participants = game.participantIds
      .map(playerId => game.participants[playerId])
      .filter(Boolean)
      .map(participant => {
        const wins = game.wins[participant.playerId] ?? { mimic: 0, race: 0, total: 0 };
        const publicParticipant = {
          playerId: participant.playerId,
          displayName: participant.displayName,
          connected: this._connected(room, participant.playerId),
          ready: Boolean(participant.ready),
          joinedAt: participant.joinedAt,
          blasts: Math.max(0, participant.blasts || 0),
          passes: Math.max(0, participant.passes || 0),
          cheered: Boolean(participant.cheered),
          wins: { ...wins },
        };
        if (participant.monster) publicParticipant.monster = { ...participant.monster };
        return publicParticipant;
      });

    const snapshot = {
      id: game.id,
      type: game.type,
      game: game.type,
      status: game.status,
      phase: game.status === "waiting" ? "entry"
        : game.status === "active" || game.status === "racing" ? "running"
          : game.status,
      revision: game.revision,
      organizerId: room.leaderId ?? null,
      serverNow,
      minPlayers: MIN_PLAYERS,
      maxPlayers: MAX_PLAYERS,
      participantIds: [...game.participantIds],
      participants,
      canStart: game.status === "waiting"
        && participants.filter(entry => entry.connected).length >= MIN_PLAYERS
        && participants.filter(entry => entry.connected).every(entry => entry.ready),
      lastEvent: game.lastEvent ? { ...game.lastEvent } : null,
      history: game.history.map(entry => ({ ...entry })),
      result: game.result ? this._publicResult(game.result) : null,
      wins: cloneWins(game.wins),
      paused: Boolean(game._private?.insufficientSince),
      reconnectGraceMs: RECONNECT_GRACE_MS,
      reconnectRemainingMs: game._private?.insufficientSince
        ? Math.max(0, RECONNECT_GRACE_MS - (serverNow - game._private.insufficientSince))
        : 0,
    };

    if (game.type === "mimic") {
      snapshot.round = Math.max(0, game.round || 0);
      snapshot.rounds = MIMIC_ROUNDS;
      snapshot.totalRounds = MIMIC_ROUNDS;
      snapshot.holderId = game.holderId ?? null;
      snapshot.previousHolderId = game.previousHolderId ?? null;
      snapshot.passCooldownMs = game.status === "active"
        ? Math.max(0, (game._private?.passLockedUntil || 0) - serverNow)
        : 0;
      snapshot.dangerLevel = this._mimicDangerLevel(game, serverNow);
      snapshot.danger = { idle: 0, low: 22, medium: 58, high: 88 }[snapshot.dangerLevel] ?? 0;
    } else {
      snapshot.cheeredIds = game.participantIds.filter(id => game.participants[id]?.cheered);
      snapshot.startedAt = Math.max(0, Number(game.startedAt) || 0);
      snapshot.durationMs = Math.max(0, Number(game.durationMs) || 0);
      snapshot.racers = this._publicRacers(game, serverNow);
    }

    return snapshot;
  }

  join(room, session, source = {}) {
    const membership = this._validateMembership(room, session);
    if (membership) return membership;
    if (room.phase !== "lobby") return this._failure("ROOM_BUSY", "ロビーでのみ遊戯へ参加できます");

    const requestedType = GAME_TYPES.has(source.game) ? source.game
      : GAME_TYPES.has(source.type) ? source.type
        : null;
    if (!requestedType) return this._failure("BAD_GAME", "遊ぶゲームを選んでください");

    let game = room.hallGame;
    if (!game || !GAME_TYPES.has(game.type)) {
      game = this._newWaitingGame(requestedType);
      room.hallGame = game;
    } else if (game.status === "result") {
      return this._failure("GAME_FINISHED", "再戦を準備してから参加してください");
    } else if (this.active(room)) {
      return this._failure("GAME_ACTIVE", "ゲーム進行中です。次の試合をお待ちください");
    } else if (game.type !== requestedType) {
      if (game.participantIds.length) {
        return this._failure("OTHER_GAME_WAITING", "別のゲームを準備中です");
      }
      room.hallGame = game = this._newWaitingGame(requestedType, game.wins);
    }

    const playerId = session.playerId;
    const existing = game.participants[playerId];
    if (!existing && game.participantIds.length >= MAX_PLAYERS) {
      return this._failure("GAME_FULL", "参加枠は4人で満員です");
    }

    let monster = null;
    let raceRating = 0;
    if (requestedType === "race") {
      const resolved = this._resolveRaceMonster(session, source.monsterId);
      if (!resolved) return this._failure("BAD_MONSTER", "自分の出走魔物を選び直してください");
      monster = resolved.publicMonster;
      raceRating = resolved.rating;
    }

    if (existing) {
      existing.displayName = this._displayName(session);
      existing.ready = false;
      if (monster) {
        existing.monster = monster;
        existing._raceRating = raceRating;
      }
      this._recordEvent(game, {
        kind: "selection",
        playerId,
        message: requestedType === "race" ? "出走魔物を変更しました" : "参加を確認しました",
      });
      this._touch(game);
      return this._success(room, { duplicate: true, changed: true });
    }

    game.participants[playerId] = {
      playerId,
      displayName: this._displayName(session),
      joinedAt: this.now(),
      ready: false,
      blasts: 0,
      passes: 0,
      holdMs: 0,
      cheered: false,
      monster,
      _raceRating: raceRating,
    };
    game.participantIds.push(playerId);
    this._ensureWinRecord(game, playerId);
    this._recordEvent(game, { kind: "join", playerId, message: `${this._displayName(session)}が参加` });
    this._touch(game);
    return this._success(room, { changed: true });
  }

  leave(room, session) {
    const membership = this._validateMembership(room, session);
    if (membership) return membership;
    const game = room.hallGame;
    if (!game?.participants?.[session.playerId]) {
      return this._success(room, { duplicate: true, changed: false });
    }
    const changed = this._removeParticipant(room, session.playerId, "leftGame");
    return this._success(room, { changed });
  }

  ready(room, session, ready) {
    const membership = this._validateMembership(room, session);
    if (membership) return membership;
    const game = room.hallGame;
    if (!game || game.status !== "waiting") {
      return this._failure("NOT_WAITING", "現在は準備状態を変更できません");
    }
    const participant = game.participants[session.playerId];
    if (!participant) return this._failure("NOT_PARTICIPATING", "先にゲームへ参加してください");
    participant.ready = Boolean(ready);
    this._recordEvent(game, {
      kind: participant.ready ? "ready" : "unready",
      playerId: session.playerId,
      message: participant.ready ? "準備完了" : "準備を解除",
    });
    this._touch(game);
    return this._success(room, { changed: true });
  }

  start(room, session) {
    const membership = this._validateMembership(room, session);
    if (membership) return membership;
    if (room.phase !== "lobby") return this._failure("ROOM_BUSY", "ほかのオンラインプレイが進行中です");
    if (room.leaderId !== session.playerId) {
      return this._failure("LEADER_ONLY", "ゲームを開始できるのはリーダーだけです");
    }

    const game = room.hallGame;
    if (!game || game.status !== "waiting") {
      return this._failure("NOT_WAITING", "開始できるゲームがありません");
    }

    // A socket drop is not a formal withdrawal: RoomStore deliberately keeps
    // the member/session alive for its resume window. Keep that participant in
    // this game's authoritative roster too, so reconnect restores the same
    // gameId and selection. Starting still requires two players online now.
    const connectedIds = game.participantIds.filter(playerId => this._connected(room, playerId));
    if (connectedIds.length < MIN_PLAYERS) {
      return this._failure("NOT_ENOUGH_PLAYERS", "開始には2人以上必要です");
    }
    if (connectedIds.some(id => !game.participants[id]?.ready)) {
      return this._failure("NOT_ALL_READY", "参加者全員の準備完了を待っています");
    }

    if (game.type === "race") {
      for (const playerId of game.participantIds) {
        const participant = game.participants[playerId];
        const owner = this._session(playerId);
        const resolved = this._resolveRaceMonster(owner, participant.monster?.monsterId);
        if (!resolved) return this._failure("BAD_MONSTER", `${participant.displayName}の出走魔物を確認できません`);
        participant.monster = resolved.publicMonster;
        participant._raceRating = resolved.rating;
      }
      this._startRace(game);
    } else {
      this._startMimic(game);
    }
    return this._success(room, { changed: true, event: game.lastEvent });
  }

  action(room, session, source = {}) {
    const membership = this._validateMembership(room, session);
    if (membership) return membership;
    const game = room.hallGame;
    if (!game || !this.active(room)) return this._failure("NO_ACTIVE_GAME", "進行中のゲームがありません");
    if (!game.participants[session.playerId]) {
      return this._failure("NOT_PARTICIPATING", "この試合には参加していません");
    }

    // The hall client names mutation receipts `requestId`; direct coordinator
    // callers may use the more explicit `actionId`. Both share one receipt map.
    const actionId = asId(source.actionId ?? source.requestId);
    if (!actionId) return this._failure("BAD_ACTION_ID", "操作IDがありません");
    const prior = game._private.processedActions.get(actionId);
    if (prior) {
      if (prior.playerId !== session.playerId) {
        return this._failure("ACTION_ID_REUSED", "同じ操作IDは使用できません");
      }
      return this._success(room, { duplicate: true, changed: false });
    }

    if (source.gameId != null && asId(source.gameId) !== game.id) {
      return this._failure("STALE_GAME", "試合が更新されています");
    }
    if (source.expectedRevision != null && Number(source.expectedRevision) !== game.revision) {
      return this._failure("STALE_REVISION", "画面が更新されています");
    }

    let result;
    if (game.type === "mimic") result = this._mimicAction(room, game, session, source);
    else result = this._raceAction(game, session, source);
    if (!result.ok) return result;

    this._rememberAction(game, actionId, session.playerId);
    return this._success(room, { changed: true, event: game.lastEvent });
  }

  reset(room, session) {
    const membership = this._validateMembership(room, session);
    if (membership) return membership;
    if (room.leaderId !== session.playerId) {
      return this._failure("LEADER_ONLY", "再戦を準備できるのはリーダーだけです");
    }
    const current = room.hallGame;
    if (!current) return this._failure("NO_GAME", "準備中のゲームがありません");
    if (this.active(room)) return this._failure("GAME_ACTIVE", "ゲーム進行中は再設定できません");

    const next = this._newWaitingGame(current.type, current.wins);
    for (const playerId of current.participantIds) {
      if (!this._connected(room, playerId)) continue;
      const owner = this._session(playerId);
      const previous = current.participants[playerId];
      let monster = null;
      let raceRating = 0;
      if (current.type === "race") {
        const resolved = this._resolveRaceMonster(owner, previous?.monster?.monsterId);
        if (!resolved) continue;
        monster = resolved.publicMonster;
        raceRating = resolved.rating;
      }
      next.participants[playerId] = {
        playerId,
        displayName: this._displayName(owner),
        joinedAt: this.now(),
        ready: false,
        blasts: 0,
        passes: 0,
        holdMs: 0,
        cheered: false,
        monster,
        _raceRating: raceRating,
      };
      next.participantIds.push(playerId);
      this._ensureWinRecord(next, playerId);
    }
    this._recordEvent(next, { kind: "rematch", playerId: session.playerId, message: "再戦準備" });
    this._touch(next);
    room.hallGame = next;
    return this._success(room, { changed: true });
  }

  playerLeft(room, playerId) {
    const id = asId(playerId, 40);
    if (!id || !room?.hallGame?.participants?.[id]) return false;
    return this._removeParticipant(room, id, "playerLeft");
  }

  advance(room) {
    // RoomStore's 250ms clock consumes this result and only broadcasts when
    // `changed` is true. Keeping that signal explicit avoids full room traffic
    // on idle ticks.
    const game = room?.hallGame;
    if (!game || !this.active(room)) return this._success(room, { changed: false, events: [] });

    const now = this.now();
    const events = [];
    let changed = false;
    if (game.type === "mimic") {
      const connectionUpdate = this._advanceMimicConnections(room, game, now);
      changed = connectionUpdate.changed;
      events.push(...connectionUpdate.events);
      if (!this.active(room) || connectionUpdate.paused) {
        return this._success(room, { changed, events });
      }
    }

    if (game.type === "mimic" && game.status === "active") {
      if (now >= game._private.explodeAt) {
        this._explodeMimic(game);
        changed = true;
        events.push({ ...game.lastEvent });
      }
    } else if (game.type === "mimic" && game.status === "intermission") {
      if (now >= game._private.nextRoundAt) {
        if (game.round >= MIMIC_ROUNDS) this._finishMimic(game);
        else this._beginMimicRound(game);
        changed = true;
        events.push({ ...game.lastEvent });
      }
    } else if (game.type === "race" && game.status === "racing") {
      if (now >= game._private.finishAt) {
        this._finishRace(game);
        changed = true;
        events.push({ ...game.lastEvent });
      }
    }

    return this._success(room, { changed, events });
  }

  _newWaitingGame(type, previousWins = {}) {
    return {
      id: this._newId(type),
      type,
      status: "waiting",
      revision: 0,
      createdAt: this.now(),
      participantIds: [],
      participants: {},
      wins: cloneWins(previousWins),
      round: 0,
      holderId: null,
      previousHolderId: null,
      history: [],
      lastEvent: null,
      result: null,
      startedAt: 0,
      durationMs: 0,
      _private: {
        processedActions: new Map(),
        resolvedRoundIds: new Set(),
        startOrder: [],
        roundStartedAt: 0,
        holderSince: 0,
        explodeAt: 0,
        passLockedUntil: 0,
        nextRoundAt: 0,
        finishAt: 0,
        racePlan: [],
        insufficientSince: 0,
        pausedTimerKind: null,
        pausedRemainingMs: 0,
      },
    };
  }

  _startMimic(game) {
    game.round = 0;
    game.result = null;
    game.history = [];
    game.holderId = null;
    game.previousHolderId = null;
    game._private.startOrder = this._shuffle([...game.participantIds]);
    game._private.resolvedRoundIds.clear();
    for (const playerId of game.participantIds) {
      const participant = game.participants[playerId];
      participant.blasts = 0;
      participant.passes = 0;
      participant.holdMs = 0;
      participant.ready = false;
    }
    this._beginMimicRound(game);
  }

  _beginMimicRound(game) {
    game.round += 1;
    game.status = "active";
    const available = game._private.startOrder.filter(id => game.participants[id]);
    if (!available.length) {
      this._abort(game, "notEnoughPlayers", "参加者が不足したため中断しました");
      return;
    }
    const holderId = available[(game.round - 1) % available.length];
    const now = this.now();
    game.holderId = holderId;
    game.previousHolderId = null;
    game._private.roundStartedAt = now;
    game._private.holderSince = now;
    game._private.passLockedUntil = now;
    game._private.explodeAt = now + this._randomInteger(MIMIC_FUSE_MIN_MS, MIMIC_FUSE_MAX_MS);
    this._recordEvent(game, {
      id: `bomb:${game.id}:round:${game.round}:start`,
      kind: "roundStart",
      round: game.round,
      holderId,
      message: `ROUND ${game.round} 開始`,
    });
    this._touch(game);
  }

  _mimicAction(room, game, session, source) {
    if (game.status !== "active") return this._failure("ACTION_CLOSED", "いまはパスできません");
    if (game._private.insufficientSince) {
      return this._failure("GAME_PAUSED", "仲間の再接続を待っています");
    }
    if (source.round != null && Number(source.round) !== game.round) {
      return this._failure("STALE_ROUND", "ラウンドが更新されています");
    }
    if (game.holderId !== session.playerId) {
      return this._failure("NOT_HOLDER", "ミミックを持っている人だけがパスできます");
    }
    const now = this.now();
    if (now >= game._private.explodeAt) {
      return this._failure("TOO_LATE", "ミミックはすでに爆発寸前です");
    }
    if (now < game._private.passLockedUntil) {
      return this._failure("PASS_COOLDOWN", "少し待ってからパスしてください");
    }
    const targetId = asId(source.targetId, 40);
    if (!targetId || targetId === session.playerId) {
      return this._failure("BAD_TARGET", "別の参加者を選んでください");
    }
    if (!game.participants[targetId] || !this._connected(room, targetId)) {
      return this._failure("BAD_TARGET", "その参加者にはパスできません");
    }
    const connectedParticipants = game.participantIds.filter(playerId => this._connected(room, playerId));
    if (connectedParticipants.length >= 3 && targetId === game.previousHolderId) {
      return this._failure("IMMEDIATE_RETURN", "3人以上では直前の相手へすぐ返せません");
    }

    const actor = game.participants[session.playerId];
    actor.passes += 1;
    actor.holdMs += Math.max(0, now - game._private.holderSince);
    game.previousHolderId = session.playerId;
    game.holderId = targetId;
    game._private.holderSince = now;
    game._private.passLockedUntil = now + MIMIC_PASS_COOLDOWN_MS;
    this._recordEvent(game, {
      kind: "pass",
      round: game.round,
      playerId: session.playerId,
      targetId,
      message: `${actor.displayName}がパス`,
    });
    this._touch(game);
    return { ok: true };
  }

  _explodeMimic(game) {
    const roundKey = `${game.id}:${game.round}`;
    if (game._private.resolvedRoundIds.has(roundKey) || game.status !== "active") return false;
    game._private.resolvedRoundIds.add(roundKey);
    const now = this.now();
    const loser = game.participants[game.holderId];
    if (loser) {
      loser.holdMs += Math.max(0, now - game._private.holderSince);
      loser.blasts += 1;
    }
    const event = {
      id: `bomb:${game.id}:round:${game.round}:explode`,
      kind: "explode",
      round: game.round,
      playerId: game.holderId,
      message: loser ? `${loser.displayName}の手元で爆発！` : "爆弾ミミックが爆発！",
    };
    game.status = "intermission";
    game.holderId = null;
    game.previousHolderId = null;
    game._private.nextRoundAt = now + MIMIC_INTERMISSION_MS;
    this._recordEvent(game, event);
    this._touch(game);
    return true;
  }

  _finishMimic(game) {
    const ranking = game.participantIds
      .map(playerId => game.participants[playerId])
      .filter(Boolean)
      .sort((left, right) => left.blasts - right.blasts || right.passes - left.passes || left.joinedAt - right.joinedAt)
      .map(participant => ({
        playerId: participant.playerId,
        displayName: participant.displayName,
        blasts: participant.blasts,
        passes: participant.passes,
        holdMs: participant.holdMs,
      }));
    const best = ranking.length ? ranking[0].blasts : Infinity;
    const winnerIds = ranking.filter(entry => entry.blasts === best).map(entry => entry.playerId);
    for (const playerId of winnerIds) this._awardWin(game, playerId, "mimic");
    this._complete(game, {
      kind: "completed",
      game: "mimic",
      winnerIds,
      ranking,
      rounds: MIMIC_ROUNDS,
      message: winnerIds.length > 1 ? "同率優勝！" : "爆弾ミミック回し 決着！",
    });
  }

  _startRace(game) {
    const ratings = game.participantIds.map(id => Math.max(0, game.participants[id]?._raceRating || 0));
    const average = ratings.reduce((sum, value) => sum + value, 0) / Math.max(1, ratings.length);
    const plan = game.participantIds.map((playerId, index) => {
      const participant = game.participants[playerId];
      const relative = average > 0 ? participant._raceRating / average - 1 : 0;
      const performanceBonus = clamp(relative * 0.12, -0.12, 0.12);
      const randomRoll = this._randomUnit();
      participant.cheered = false;
      participant.ready = false;
      return {
        playerId,
        score: randomRoll + performanceBonus,
        performanceBonus,
        randomRoll,
        order: index,
      };
    });
    plan.sort((left, right) => right.score - left.score || left.order - right.order);
    let latestFinish = this._randomInteger(RACE_DURATION_MIN_MS, 8_200);
    for (const entry of plan) {
      entry.durationMs = latestFinish;
      latestFinish = Math.min(RACE_DURATION_MAX_MS, latestFinish + this._randomInteger(280, 760));
    }
    const now = this.now();
    game.status = "racing";
    game.result = null;
    game.history = [];
    game.startedAt = now;
    game.durationMs = Math.max(...plan.map(entry => entry.durationMs), RACE_DURATION_MIN_MS);
    game._private.racePlan = plan;
    game._private.finishAt = now + game.durationMs;
    this._recordEvent(game, { kind: "raceStart", message: "魔物レース スタート！" });
    this._touch(game);
  }

  _raceAction(game, session, source) {
    const action = source.kind ?? source.action ?? "cheer";
    if (game.status !== "racing" || action !== "cheer") {
      return this._failure("ACTION_CLOSED", "いまは応援できません");
    }
    if (this.now() >= game._private.finishAt) {
      return this._failure("TOO_LATE", "レースはすでに決着しています");
    }
    const participant = game.participants[session.playerId];
    if (participant.cheered) return this._failure("CHEER_USED", "このレースでは応援済みです");
    participant.cheered = true;
    this._recordEvent(game, {
      kind: "cheer",
      playerId: session.playerId,
      message: `${participant.displayName}が応援！`,
    });
    this._touch(game);
    return { ok: true };
  }

  _finishRace(game) {
    const activeIds = new Set(game.participantIds);
    const ranking = game._private.racePlan
      .filter(entry => activeIds.has(entry.playerId))
      .map((entry, index) => {
        const participant = game.participants[entry.playerId];
        return {
          place: index + 1,
          playerId: entry.playerId,
          displayName: participant?.displayName ?? "冒険者",
          monster: participant?.monster ? { ...participant.monster } : null,
          cheered: Boolean(participant?.cheered),
        };
      });
    const winnerIds = ranking.length ? [ranking[0].playerId] : [];
    if (winnerIds[0]) this._awardWin(game, winnerIds[0], "race");
    this._complete(game, {
      kind: "completed",
      game: "race",
      winnerIds,
      ranking,
      message: ranking[0]?.monster?.name
        ? `${ranking[0].monster.name}が1着！`
        : "魔物レース 決着！",
    });
  }

  _removeParticipant(room, playerId, reason) {
    const game = room?.hallGame;
    const participant = game?.participants?.[playerId];
    if (!participant) return false;
    if (game.status === "result") {
      delete game.participants[playerId];
      game.participantIds = game.participantIds.filter(id => id !== playerId);
      if (!game.participantIds.length) room.hallGame = null;
      else this._touch(game);
      return true;
    }

    const wasHolder = game.type === "mimic" && game.status === "active" && game.holderId === playerId;
    if (wasHolder) {
      participant.holdMs += Math.max(0, this.now() - game._private.holderSince);
    }
    delete game.participants[playerId];
    game.participantIds = game.participantIds.filter(id => id !== playerId);
    game._private.startOrder = game._private.startOrder.filter(id => id !== playerId);
    game._private.racePlan = game._private.racePlan.filter(entry => entry.playerId !== playerId);

    this._recordEvent(game, {
      kind: "participantLeft",
      playerId,
      reason,
      message: `${participant.displayName}がゲームから離れました`,
    });

    if (this.active(room) && game.participantIds.length < MIN_PLAYERS) {
      this._abort(game, "notEnoughPlayers", "参加者が2人未満になったため中断しました");
      return true;
    }

    if (wasHolder) {
      const nextHolder = game.participantIds.find(id => this._connected(room, id)) ?? game.participantIds[0] ?? null;
      const now = this.now();
      game.holderId = nextHolder;
      game.previousHolderId = null;
      game._private.holderSince = now;
      game._private.passLockedUntil = now + MIMIC_PASS_COOLDOWN_MS;
      game._private.explodeAt = Math.max(game._private.explodeAt, now + 1_000);
      this._recordEvent(game, {
        kind: "autoPass",
        playerId,
        targetId: nextHolder,
        message: "切断を検知し、ミミックを自動で渡しました",
      });
    }
    this._touch(game);
    return true;
  }

  _advanceMimicConnections(room, game, now) {
    const events = [];
    const connectedIds = game.participantIds.filter(playerId => this._connected(room, playerId));

    if (connectedIds.length <= 1) {
      if (!game._private.insufficientSince) {
        game._private.insufficientSince = now;
        if (game.status === "active") {
          game._private.pausedTimerKind = "fuse";
          game._private.pausedRemainingMs = Math.max(1_000, game._private.explodeAt - now);
          game._private.explodeAt = 0;
        } else if (game.status === "intermission") {
          game._private.pausedTimerKind = "intermission";
          game._private.pausedRemainingMs = Math.max(0, game._private.nextRoundAt - now);
          game._private.nextRoundAt = 0;
        }
        this._recordEvent(game, {
          kind: "reconnectWait",
          message: "接続中の参加者が不足しています。15秒間、復帰を待ちます",
        });
        this._touch(game);
        events.push({ ...game.lastEvent });
        return { changed: true, paused: true, events };
      }
      if (now - game._private.insufficientSince >= RECONNECT_GRACE_MS) {
        this._abort(game, "reconnectTimeout", "参加者が戻らなかったため中断しました");
        events.push({ ...game.lastEvent });
        return { changed: true, paused: false, events };
      }
      return { changed: false, paused: true, events };
    }

    let changed = false;
    if (game._private.insufficientSince) {
      if (game._private.pausedTimerKind === "fuse") {
        game._private.explodeAt = now + Math.max(1_000, game._private.pausedRemainingMs);
        game._private.holderSince = now;
      } else if (game._private.pausedTimerKind === "intermission") {
        game._private.nextRoundAt = now + Math.max(0, game._private.pausedRemainingMs);
      }
      game._private.insufficientSince = 0;
      game._private.pausedTimerKind = null;
      game._private.pausedRemainingMs = 0;
      this._recordEvent(game, { kind: "reconnected", message: "参加者が戻り、ゲームを再開します" });
      this._touch(game);
      events.push({ ...game.lastEvent });
      changed = true;
    }

    if (game.status === "active" && !this._connected(room, game.holderId)) {
      const previousHolder = game.participants[game.holderId];
      if (previousHolder) {
        previousHolder.holdMs += Math.max(0, now - game._private.holderSince);
      }
      const nextHolder = connectedIds.find(playerId => playerId !== game.holderId) ?? connectedIds[0];
      game.holderId = nextHolder;
      game.previousHolderId = null;
      game._private.holderSince = now;
      game._private.passLockedUntil = now + MIMIC_PASS_COOLDOWN_MS;
      game._private.explodeAt = Math.max(game._private.explodeAt, now + 1_000);
      this._recordEvent(game, {
        kind: "autoPass",
        targetId: nextHolder,
        message: "切断を検知し、ミミックを自動で渡しました",
      });
      this._touch(game);
      events.push({ ...game.lastEvent });
      changed = true;
    }

    return { changed, paused: false, events };
  }

  _abort(game, reason, message) {
    this._complete(game, {
      kind: "aborted",
      game: game.type,
      reason,
      winnerIds: [],
      ranking: [],
      message,
    });
  }

  _complete(game, result) {
    game.status = "result";
    game.holderId = null;
    game.previousHolderId = null;
    game.result = {
      ...result,
      id: `${game.id}:result`,
      completedAt: this.now(),
    };
    this._recordEvent(game, {
      id: `${game.id}:result`,
      kind: result.kind === "aborted" ? "aborted" : "result",
      message: result.message,
      winnerIds: [...result.winnerIds],
    });
    this._touch(game);
  }

  _awardWin(game, playerId, type) {
    const record = this._ensureWinRecord(game, playerId);
    record[type] += 1;
    record.total = record.mimic + record.race;
  }

  _ensureWinRecord(game, playerId) {
    game.wins[playerId] ??= { mimic: 0, race: 0, total: 0 };
    return game.wins[playerId];
  }

  _resolveRaceMonster(session, requestedMonsterId) {
    if (!session?.profile) return null;
    const profile = session.profile;
    const supplied = Array.isArray(profile.battleRoster)
      ? profile.battleRoster.filter(entry => entry && typeof entry === "object").slice(0, 4)
      : [];
    const roster = supplied.length ? supplied : profile.monsterId ? [profile] : [];
    if (!roster.length) return null;

    const requested = asId(requestedMonsterId ?? profile.primaryMonsterId ?? roster[0]?.monsterId, 80);
    const selected = roster.find(entry => asId(entry.monsterId, 80) === requested);
    if (!selected) return null;
    const monsterId = asId(selected.monsterId, 80);
    if (!monsterId) return null;

    const stats = selected.battleStats ?? {};
    const explicitPower = Math.max(0, Number(selected.power) || 0);
    const derivedPower = Math.max(1,
      (Number(stats.hp) || 0) * 0.18
      + (Number(stats.mp) || 0) * 0.08
      + (Number(stats.atk) || 0)
      + (Number(stats.matk) || 0)
      + (Number(stats.def) || 0) * 0.7
      + (Number(stats.mdef) || 0) * 0.7
      + (Number(stats.spd) || 0) * 1.2
      + Math.max(1, Number(selected.level) || 1) * 2);
    const rating = Math.log1p(explicitPower || derivedPower);
    return {
      rating,
      publicMonster: {
        monsterId,
        speciesId: asId(selected.speciesId, 80) || "slime",
        visualSpeciesId: asId(selected.visualSpeciesId, 80) || null,
        name: asId(selected.monsterName ?? selected.nickname ?? selected.name, 40) || "魔物",
        level: Math.max(1, Math.floor(Number(selected.level) || 1)),
        fallbackEmoji: asId(selected.fallbackEmoji, 8) || "魔",
      },
    };
  }

  _mimicDangerLevel(game, now = this.now()) {
    if (game.status !== "active" || game._private?.insufficientSince) return "idle";
    const elapsed = Math.max(0, now - (game._private?.roundStartedAt || now));
    if (elapsed < 3_500) return "low";
    if (elapsed < 7_000) return "medium";
    return "high";
  }

  _publicRacers(game, now = this.now()) {
    const startedAt = Math.max(0, Number(game.startedAt) || 0);
    const elapsed = startedAt ? Math.max(0, now - startedAt) : 0;
    const planByPlayer = new Map(game._private.racePlan.map((entry, index) => [entry.playerId, { ...entry, finalRank: index + 1 }]));
    const racers = game.participantIds.map((playerId, lane) => {
      const participant = game.participants[playerId];
      const plan = planByPlayer.get(playerId);
      const durationMs = Math.max(RACE_DURATION_MIN_MS, Number(plan?.durationMs) || game.durationMs || RACE_DURATION_MIN_MS);
      const progress = game.status === "result"
        ? 100
        : clamp(elapsed / durationMs * 100, 0, 100);
      return {
        lane,
        playerId,
        monster: participant?.monster ? { ...participant.monster } : null,
        progress: Math.round(progress * 10) / 10,
        rank: plan?.finalRank ?? lane + 1,
        durationMs,
      };
    });
    if (game.status !== "result") {
      const liveOrder = [...racers].sort((left, right) => right.progress - left.progress || left.lane - right.lane);
      const liveRank = new Map(liveOrder.map((entry, index) => [entry.playerId, index + 1]));
      for (const racer of racers) racer.rank = liveRank.get(racer.playerId) ?? racer.rank;
    }
    return racers;
  }

  _publicResult(result) {
    return {
      id: result.id,
      kind: result.kind,
      game: result.game,
      reason: result.reason ?? null,
      winnerIds: [...(result.winnerIds ?? [])],
      ranking: (result.ranking ?? []).map(entry => ({
        ...entry,
        monster: entry.monster ? { ...entry.monster } : entry.monster,
      })),
      rounds: result.rounds ?? null,
      completedAt: result.completedAt,
      message: result.message,
    };
  }

  _recordEvent(game, event) {
    const safeEvent = {
      id: asId(event.id, 160) || `${game.id}:event:${game.revision + 1}`,
      kind: asId(event.kind, 40) || "update",
      message: asId(event.message, 120),
    };
    for (const key of ["playerId", "targetId", "reason"]) {
      if (event[key] != null) safeEvent[key] = asId(event[key], 80);
    }
    if (event.round != null) safeEvent.round = Math.max(0, Math.floor(Number(event.round) || 0));
    if (Array.isArray(event.winnerIds)) safeEvent.winnerIds = event.winnerIds.map(id => asId(id, 40)).filter(Boolean);
    game.lastEvent = safeEvent;
    game.history.push(safeEvent);
    game.history = game.history.slice(-HISTORY_LIMIT);
  }

  _rememberAction(game, actionId, playerId) {
    game._private.processedActions.set(actionId, { playerId });
    while (game._private.processedActions.size > ACTION_RECEIPT_LIMIT) {
      const oldest = game._private.processedActions.keys().next().value;
      game._private.processedActions.delete(oldest);
    }
  }

  _connected(room, playerId) {
    const session = this._session(playerId);
    return Boolean(session && session.connected !== false && roomHasPlayer(room, playerId));
  }

  _session(playerId) {
    if (this.sessions instanceof Map) return this.sessions.get(playerId) ?? null;
    return this.sessions?.[playerId] ?? null;
  }

  _validateMembership(room, session) {
    if (!room || !session?.playerId) return this._failure("NOT_READY", "先に接続してください");
    if (!roomHasPlayer(room, session.playerId)) {
      return this._failure("NOT_IN_ROOM", "この部屋には参加していません");
    }
    if (session.connected === false) return this._failure("OFFLINE", "再接続してから操作してください");
    return null;
  }

  _displayName(session) {
    return asId(session?.profile?.displayName, 24) || "冒険者";
  }

  _touch(game) {
    game.revision = Math.max(0, Math.floor(Number(game.revision) || 0)) + 1;
  }

  _newId(type) {
    this.sequence = (this.sequence + 1) % Number.MAX_SAFE_INTEGER;
    const time = Math.max(0, Math.floor(Number(this.now()) || 0)).toString(36);
    const random = Math.floor(this._randomUnit() * 0x7fffffff).toString(36).padStart(6, "0");
    return `hall-${type}-${time}-${this.sequence.toString(36)}-${random}`;
  }

  _randomUnit() {
    return clamp(this.random(), 0, 0.999999999999);
  }

  _randomInteger(minimum, maximum) {
    return minimum + Math.floor(this._randomUnit() * (maximum - minimum + 1));
  }

  _shuffle(values) {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const other = Math.floor(this._randomUnit() * (index + 1));
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }

  _success(room, extra = {}) {
    return { ok: true, ...extra, game: this.snapshot(room) };
  }

  _failure(code, message) {
    return { ok: false, code, message };
  }
}
