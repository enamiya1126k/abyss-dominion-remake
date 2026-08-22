import { dungeonThemeForFloor } from "../data/dungeonThemes.js?v=2.11.2-build166";
import { onlineAvatarVisual, onlineMagicCircleArt, escapeOnlineHtml } from "../ui/screens/OnlinePartyScreen.js?v=2.11.38-build203";
import { BattleScreen } from "../ui/screens/BattleScreen.js?v=2.11.38-build203";
import { ExploreScreen } from "../ui/screens/ExploreScreen.js?v=2.11.38-build203";
import { pixelIcon } from "../ui/components/GameChrome.js?v=2.11.2-build166";

const ROUTE_LABELS = Object.freeze({ home: "ホーム", explore: "通常探索", raid: "レイドボス", team: "自由チーム戦", chat: "チャット" });
const EVENT_LABELS = Object.freeze({
  damage: "ダメージ", enemyDamage: "ダメージ", heal: "回復", mpHeal: "MP回復", revive: "蘇生",
  guard: "ガード", miss: "回避", ko: "戦闘不能", effect: "効果", buff: "強化", shield: "障壁",
  capture: "捕獲", result: "決着", signature: "共鳴", raidTelegraph: "予兆",
});

const number = value => Math.max(0, Math.floor(Number(value) || 0)).toLocaleString();
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const ratio = (value, maximum) => clamp(Number(value) / Math.max(1, Number(maximum)) * 100, 0, 100);
const memberById = (room, id) => (room?.members ?? []).find(member => member.playerId === id);

function screenHeader(route, eyebrow, copy) {
  return `<header class="online-v3-view-head"><div><small>${escapeOnlineHtml(eyebrow)}</small><h2>${ROUTE_LABELS[route]}</h2><p>${escapeOnlineHtml(copy)}</p></div></header>`;
}

function meter(kind, value, maximum) {
  return `<span class="online-v3-meter ${kind}"><i style="width:${ratio(value, maximum)}%"></i><b>${kind.toUpperCase()} ${number(value)} / ${number(maximum)}</b></span>`;
}

function memberCard(member, { compact = false, state = "" } = {}) {
  const profile = member?.profile ?? {};
  return `<article class="online-v3-member ${member?.connected ? "" : "offline"} ${member?.leader ? "leader" : ""} ${compact ? "compact" : ""}">
    ${onlineAvatarVisual(profile, { className: "online-v3-member-art" })}
    <div><small>${member?.leader ? "LEADER" : member?.connected ? "ONLINE" : "RECONNECTING"}</small><b>${escapeOnlineHtml(profile.displayName || "冒険者")}</b><span>${escapeOnlineHtml(profile.monsterName || "魔物")}・Lv.${number(profile.level || 1)}</span>${state ? `<em>${escapeOnlineHtml(state)}</em>` : ""}</div>
  </article>`;
}

function readyGrid(room, { team = false } = {}) {
  return `<div class="online-v3-ready-grid">${(room?.members ?? []).map(member => {
    const ready = team ? member.teamReady : member.ready;
    const state = team ? member.teamSide === "sun" ? "紅組" : member.teamSide === "moon" ? "蒼組" : "観戦" : ready ? "準備完了" : "準備中";
    return `<div class="${ready ? "ready" : ""}">${memberCard(member, { compact: true, state })}<strong>${ready ? "READY" : "WAIT"}</strong></div>`;
  }).join("")}${Array.from({ length: Math.max(0, 4 - (room?.members?.length ?? 0)) }, () => `<div class="online-v3-empty-member">参加待ち</div>`).join("")}</div>`;
}

export function renderOnlineHome(room, selfId) {
  const self = memberById(room, selfId);
  return `${screenHeader("home", "ONLINE ROOM", "遊びたい内容を選択。画面は下へつながらず、選んだ機能だけが開きます。")}
    <section class="online-v3-home-hero">
      <div><small>ROOM ${escapeOnlineHtml(room?.roomId ?? "------")}</small><h3>${escapeOnlineHtml(self?.profile?.displayName || "冒険者")}の共闘拠点</h3><p>${room?.members?.length ?? 0} / 4人が参加中。途中で切断しても5分以内なら同じ部屋へ復帰できます。</p></div>
      ${onlineAvatarVisual(self?.profile ?? {}, { className: "online-v3-home-avatar" })}
    </section>
    <section class="online-v3-party-list"><header><h3>参加メンバー</h3><span>${room?.members?.length ?? 0} / 4</span></header>${(room?.members ?? []).map(member => memberCard(member)).join("")}</section>
    <section class="online-v3-mode-grid">
      <button type="button" data-online-go="explore"><span>探索</span><b>通常探索</b><small>同じダンジョンを歩き、戦闘と発見を共有</small></button>
      <button type="button" data-online-go="raid"><span>協力</span><b>レイドボス</b><small>最大4人で巨大ボスへ挑むサーバー同期戦</small></button>
      <button type="button" data-online-go="team"><span>対戦</span><b>自由チーム戦</b><small>1vs1・1vs2・1vs3・2vs2を自由に編成</small></button>
      <button type="button" data-online-go="chat"><span>会話</span><b>チャット</b><small>定型文・スタンプ・80文字メッセージ</small></button>
    </section>`;
}

function battleProfile(room, battlePlayer) {
  const member = memberById(room, battlePlayer?.playerId);
  return member?.profile ?? {
    speciesId: battlePlayer?.speciesId ?? "slime", fallbackEmoji: battlePlayer?.fallbackEmoji ?? "魔",
    displayName: battlePlayer?.name ?? "冒険者", monsterName: battlePlayer?.monsterName ?? "魔物", level: 1,
  };
}

function onlineMonster(room, player) {
  const profile = battleProfile(room, player), stats = profile.battleStats ?? {};
  return {
    id: player.playerId, speciesId: profile.speciesId || "slime", visualSpeciesId: profile.visualSpeciesId ?? null,
    endgameBossId: profile.endgameBossId ?? null, floorBossCatalogId: profile.floorBossCatalogId ?? null,
    nickname: profile.monsterName || profile.displayName || player.name || "魔物", onlineName: profile.monsterName || player.monsterName || profile.displayName || "魔物",
    level: Math.max(1, Number(profile.level) || 1), exp: 0, rank: 1, plus: Math.max(0, Number(profile.plus) || 0),
    stars: Math.max(1, Number(profile.stars) || 1), affection: 0, bond: 0, colorId: "default",
    currentHp: Math.max(0, Number(player.hp) || 0), currentMp: Math.max(0, Number(player.mp) || 0),
    onlineStats: { ...stats, hp: Math.max(1, Number(player.maxHp ?? stats.hp) || 1) },
    onlineMaxMp: Math.max(0, Number(player.maxMp ?? stats.mp) || 0), attribute: profile.attribute || "neutral",
    summonTier: profile.summonTier ?? profile.summonRarity ?? null, summonRarity: profile.summonRarity ?? profile.summonTier ?? null,
    endgameFaction: profile.endgameFaction ?? null, equipment: {}, equippedSkills: [], skillLoadoutInitialized: true,
  };
}

function onlineEnemy(room, enemy) {
  const profile = enemy.playerId ? battleProfile(room, enemy) : null;
  return {
    ...enemy, id: enemy.id ?? enemy.playerId, speciesId: profile?.speciesId ?? enemy.speciesId ?? "slime",
    visualSpeciesId: profile?.visualSpeciesId ?? enemy.visualSpeciesId ?? null, endgameBossId: profile?.endgameBossId ?? enemy.endgameBossId ?? null,
    floorBossCatalogId: profile?.floorBossCatalogId ?? enemy.floorBossCatalogId ?? null,
    customVisualAsset: enemy.asset ?? null, name: profile?.monsterName || enemy.monsterName || enemy.name || profile?.displayName || "敵",
    level: Math.max(1, Number(profile?.level ?? enemy.level) || 1), hp: Math.max(0, Number(enemy.hp) || 0), maxHp: Math.max(1, Number(enemy.maxHp) || 1),
    atk: Math.max(1, Number(enemy.atk ?? profile?.battleStats?.atk) || 1), matk: Math.max(1, Number(enemy.matk ?? profile?.battleStats?.matk) || 1),
    def: Math.max(0, Number(enemy.def ?? profile?.battleStats?.def) || 0), mdef: Math.max(0, Number(enemy.mdef ?? profile?.battleStats?.mdef) || 0),
    spd: Math.max(1, Number(enemy.spd ?? profile?.battleStats?.spd) || 1), element: profile?.attribute ?? enemy.element ?? "neutral",
    emoji: profile?.fallbackEmoji ?? enemy.emoji ?? "魔", summonTier: profile?.summonTier ?? profile?.summonRarity ?? null,
    summonRarity: profile?.summonRarity ?? profile?.summonTier ?? null, boss: Boolean(enemy.boss || enemy.id === "abyss-amalga"), uncapturable: enemy.uncapturable ?? Boolean(enemy.playerId || enemy.asset),
  };
}

function onlineSkill(skill) {
  const support = skill.kind !== "attack";
  return {
    ...skill, onlineMpCost: Math.max(0, Number(skill.mp) || 0), onlineDescription: skill.description || "サーバー同期スキル",
    type: skill.kind === "allHeal" ? "allHeal" : skill.kind === "heal" ? "selfHeal" : skill.kind,
    target: skill.allEnemies ? "敵全体" : skill.allAllies ? "味方全体" : support ? "味方単体" : "敵単体",
    tag: support ? "支援スキル" : "攻撃スキル", cooldown: 0,
  };
}

function eventLine(event) {
  const label = event?.label || event?.message || "戦況が変化した", value = Number(event?.value) || 0;
  return `${EVENT_LABELS[event?.kind] || "戦況"}：${label}${value ? ` ${number(value)}` : ""}`;
}

export function renderSharedBattle({ mode, room, battle, selfId, selectedTarget = null, selectedAlly = null, title = "共闘バトル", enemies = [], allowCapture = false, readOnly = false, skillMenu = false }) {
  const players = battle?.players ?? [], self = players.find(player => player.playerId === selfId), party = players.map(player => onlineMonster(room, player));
  const foes = enemies.map(enemy => onlineEnemy(room, enemy)), target = foes.find(enemy => enemy.id === selectedTarget && enemy.hp > 0) ?? foes.find(enemy => enemy.hp > 0) ?? null;
  const selfMember = memberById(room, selfId), selfMonster = party.find(monster => monster.id === selfId), turnQueue = selfMonster && selfMonster.currentHp > 0 && !readOnly ? [{ type: "ally", id: selfId, name: selfMonster.onlineName, spd: selfMonster.onlineStats.spd ?? 0 }] : [];
  const magicCircleProfiles = Object.fromEntries(party.map(monster => { const profile = memberById(room, monster.id)?.profile ?? {}; return [monster.id, { id: profile.circleId ?? "none", name: profile.circleName ?? "魔法陣なし", level: profile.circleLevel ?? 0, effect: profile.circleEffect ?? "none" }]; }));
  const magicCircleArt = Object.fromEntries(party.map(monster => [monster.id, onlineMagicCircleArt(memberById(room, monster.id)?.profile ?? {}, { className: "battle-magic-circle" })]));
  const events = [...(battle?.lastEvents ?? [])];
  if (battle?.telegraph) events.push({ kind: "raidTelegraph", label: `${battle.telegraph.title || "予兆"}：${battle.telegraph.message || "終焉が迫る…"}` });
  const uiBattle = {
    onlineMode: mode, onlineReadOnly: readOnly, onlineActionSubmitted: Boolean(battle?.actions?.[selfId]) || battle?.phase !== "command", onlineAllowCapture: allowCapture && Number(self?.captureCharges ?? selfMember?.profile?.captureStock) > 0,
    onlineCountdownMode: mode, onlineSelectedAlly: selectedAlly || selfId, onlineSkills: (selfMember?.profile?.skills ?? []).map(onlineSkill),
    enemies: foes, enemy: foes[0], targetEnemyId: target?.id ?? null, party, species: {}, turn: Math.max(1, Number(battle?.round) || 1), turnQueue, queueIndex: 0,
    auto: false, busy: false, phase: battle?.phase ?? "command", speed: battle?.speed ?? 1, skillMenu: Boolean(skillMenu), itemMenu: false,
    guards: {}, cooldowns: {}, enemyStatuses: {}, allyAilments: {}, allyEffects: {}, enemyEffects: {}, hpTrails: {},
    magicCircleProfiles, magicCircleArt, enemyMagicCircleArt: {}, log: events.slice(-6).map(eventLine),
    specialTitle: title, battleTheme: mode === "raid" ? "boss" : mode === "team" ? "abyss" : "default",
  };
  return BattleScreen(uiBattle, { captureCrystals: Math.max(0, Number(self?.captureCharges ?? selfMember?.profile?.captureStock) || 0) }, { battleSpeed: uiBattle.speed }, battle?.floor ?? room?.selectedFloor ?? 1);
}

function dungeonBoard(room, selfId, theme) {
  const expedition = room?.expedition;
  if (!expedition) return "";
  const cols = Math.max(1, Number(expedition.cols) || 1), rows = Math.max(1, Number(expedition.rows) || 1);
  const cells = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) cells.push(expedition.tiles?.[y]?.[x] === "." ? `<button type="button" class="floor" style="grid-column:${x + 1};grid-row:${y + 1}" data-map-x="${x}" data-map-y="${y}" aria-label="${x},${y}へ移動"></button>` : `<i class="wall" style="grid-column:${x + 1};grid-row:${y + 1}"></i>`);
  const objects = (expedition.objects ?? []).filter(object => !object.resolved || object.type === "exit").map(object => `<button type="button" class="online-v3-map-object ${escapeOnlineHtml(object.type)}" style="grid-column:${object.x + 1};grid-row:${object.y + 1}" data-map-x="${object.x}" data-map-y="${object.y}" title="${escapeOnlineHtml(object.type)}"></button>`).join("");
  const players = (room.members ?? []).filter(member => member.dungeonPosition).map(member => {
    const point = member.dungeonPosition, vitals = member.coopVitals ?? {}, hp = Number(vitals.hp ?? member.profile?.battleStats?.hp) || 0, maxHp = Number(vitals.maxHp ?? member.profile?.battleStats?.hp) || 1;
    return `<button type="button" class="online-v3-map-player ${member.playerId === selfId ? "self" : ""} ${hp <= 0 ? "down" : hp / maxHp <= .1 ? "critical" : ""}" style="grid-column:${point.x + 1};grid-row:${point.y + 1}" data-online-map-player="${escapeOnlineHtml(member.playerId)}">${onlineAvatarVisual(member.profile, { frame: hp <= 0 ? "down" : "idle" })}<b>${escapeOnlineHtml(member.profile?.displayName || "冒険者")}</b></button>`;
  }).join("");
  const floorAsset = escapeOnlineHtml(theme?.floorAsset ?? "assets/ui/explore/dungeon-floor.png");
  const wallAsset = escapeOnlineHtml(theme?.wallAsset ?? "assets/ui/explore/dungeon-wall.png");
  return `<div class="online-shared-map-viewport" data-online-map-viewport><div class="online-shared-map" data-online-map style="--map-cols:${cols};--map-rows:${rows};--dungeon-floor:url('${floorAsset}');--dungeon-wall:url('${wallAsset}');--scenery-accent:${escapeOnlineHtml(theme?.accent ?? "#d6b56f")}">${cells.join("")}${objects}${players}</div></div>`;
}

function fallbackExploreState(source, floor) {
  if (source?.player && source?.inventory) return source;
  return { player: { currentFloor: floor, gold: 0, crystals: 0 }, inventory: {}, settings: {}, party: [], monsters: [] };
}

function exploreParty(room) {
  return (room?.members ?? []).map(member => {
    const profile = member.profile ?? {}, vitals = member.coopVitals ?? profile.battleStats ?? {};
    return onlineMonster(room, { playerId: member.playerId, hp: vitals.hp ?? profile.battleStats?.hp, maxHp: vitals.maxHp ?? profile.battleStats?.hp, mp: vitals.mp ?? profile.battleStats?.mp, maxMp: vitals.maxMp ?? profile.battleStats?.mp });
  });
}

export function renderOnlineExplore(room, selfId, state = {}) {
  const expedition = room?.expedition;
  if (room?.phase === "expedition" && expedition?.battle) return renderSharedBattle({ mode: "explore", room, battle: expedition.battle, selfId, selectedTarget: state.selectedTarget, selectedAlly: state.selectedAlly, title: `${number(expedition.floor)}F・遭遇戦`, enemies: expedition.battle.enemies ?? [], allowCapture: true, skillMenu: state.skillMenu });
  if (room?.phase === "expedition" && expedition) {
    const theme = dungeonThemeForFloor(expedition.floor), base = fallbackExploreState(state.gameState, expedition.floor), discovered = Number(expedition.discoveries) + Number(expedition.encountersCleared), total = Math.max(1, Number(expedition.totalDiscoveries) + Number(expedition.totalEncounters));
    const stageTools = `<button type="button" data-online-route="chat" class="minimap-toggle">${pixelIcon("notice")}<b>チャット</b></button>${expedition.exitReached && room.leaderId === selfId ? `<button type="button" data-online-complete class="minimap-toggle online-floor-complete">${pixelIcon("event")}<b>踏破確定</b></button>` : ""}`;
    const nav = `<button type="button" data-online-route="home"><i>${pixelIcon("formation")}</i>部屋</button><button type="button" data-online-route="chat"><i>${pixelIcon("notice")}</i>会話</button><button type="button" data-online-route="raid"><i>${pixelIcon("growth")}</i>レイド</button><button type="button" data-online-center><i>${pixelIcon("event")}</i>現在地</button><button type="button" data-online-return class="danger"><i>${pixelIcon("rest")}</i>帰還</button>`;
    return ExploreScreen(base, { online: true, floor: expedition.floor, title: `共闘探索・${expedition.floor}階`, party: exploreParty(room), hudCollapsed: state.hudCollapsed, combatPower: (room.members ?? []).reduce((sum, member) => sum + Math.max(0, Number(member.profile?.power) || 0), 0), progress: Math.round(discovered / total * 100), run: { startedAt: expedition.startedAt ?? Date.now() }, stageContentHtml: dungeonBoard(room, selfId, theme), stageToolsHtml: stageTools, miniMapHtml: "", navHtml: nav, className: `online-scenery-${theme.id}` });
  }
  return `${screenHeader("explore", "CO-OP DUNGEON", "ソロ探索と同じ部品・処理を使い、1人1体を操作する共同探索です。")}
    <section class="online-v3-lobby-card"><div><small>CHALLENGE FLOOR</small><label><input type="number" min="1" max="10000" value="${number(room?.selectedFloor || 1).replaceAll(",", "")}" data-online-floor><b>F</b></label><p>変更できるのはリーダーだけ。全員の準備後に出発できます。</p></div></section>
    ${readyGrid(room)}
    <div class="online-v3-ready-actions"><button type="button" data-online-ready>${memberById(room, selfId)?.ready ? "準備を解除" : "準備完了"}</button><button type="button" class="online-v3-primary" data-online-start-explore ${room?.leaderId === selfId ? "" : "disabled"}>通常探索へ出発</button></div>`;
}

export function renderOnlineRaid(room, selfId, state = {}) {
  if (room?.phase === "raid" && room.raid) {
    const enemies = [room.raid.boss, ...(room.raid.minions ?? [])];
    return renderSharedBattle({ mode: "raid", room, battle: room.raid, selfId, selectedTarget: state.selectedTarget, selectedAlly: state.selectedAlly, title: room.raid.name, enemies, skillMenu: state.skillMenu });
  }
  const progress = room?.raidProgress;
  return `${screenHeader("raid", "CALAMITY RAID", "巨大ボスのHPは敗北後も保存。役割と行動を相談して少しずつ討伐します。")}
    <section class="online-v3-raid-hero"><img src="./assets/online/raid-abyss-amalgam.png" alt="終焉融骸・アビス＝マルガ"><div><small>WORLD RAID BOSS</small><h3>終焉融骸・アビス＝マルガ</h3><p>与ダメージ・回復・蘇生・防御・補助を貢献度として集計します。</p></div></section>
    <section class="online-v3-raid-progress"><header><b>累積討伐進行</b><span>${progress ? `${number(progress.attempts)}回挑戦` : "未挑戦"}</span></header>${meter("boss", progress?.hp ?? 1, progress?.maxHp ?? 1)}<p>${progress ? `残りHP ${number(progress.hp)} / ${number(progress.maxHp)}` : "初回挑戦時にボスHPが確定します。"}</p></section>
    ${readyGrid(room)}<div class="online-v3-ready-actions"><button type="button" data-online-ready>${memberById(room, selfId)?.ready ? "準備を解除" : "準備完了"}</button><button type="button" class="online-v3-primary danger" data-online-start-raid ${room?.leaderId === selfId ? "" : "disabled"}>レイド開始</button></div>`;
}

export function renderOnlineTeam(room, selfId, state = {}) {
  if (room?.phase === "team" && room.teamBattle) {
    const battle = room.teamBattle, self = battle.players?.find(player => player.playerId === selfId), viewingSide = self?.side ?? "sun", enemySide = viewingSide === "sun" ? "moon" : "sun";
    const enemies = (battle.players ?? []).filter(player => player.side === enemySide).map(player => ({ ...player, id: player.playerId, name: player.name, asset: null, emoji: player.fallbackEmoji }));
    const allyBattle = { ...battle, players: (battle.players ?? []).filter(player => player.side === viewingSide) };
    return renderSharedBattle({ mode: "team", room, battle: allyBattle, selfId, selectedTarget: state.selectedTarget, selectedAlly: state.selectedAlly, title: `${battle.format} チーム戦`, enemies, readOnly: !self, skillMenu: state.skillMenu });
  }
  const self = memberById(room, selfId);
  const sun = (room?.members ?? []).filter(member => member.teamSide === "sun"), moon = (room?.members ?? []).filter(member => member.teamSide === "moon"), spectators = (room?.members ?? []).filter(member => !["sun", "moon"].includes(member.teamSide));
  return `${screenHeader("team", "FREE TEAM BATTLE", "参加者を紅組・蒼組へ自由に割り振り。1vs1、1vs2、1vs3、2vs2に対応します。")}
    <section class="online-v3-team-select"><button type="button" data-online-team-side="sun" class="sun ${self?.teamSide === "sun" ? "selected" : ""}"><b>紅組</b><span>${sun.length}人</span></button><button type="button" data-online-team-side="spectator" class="${self?.teamSide === "spectator" ? "selected" : ""}"><b>観戦</b><span>${spectators.length}人</span></button><button type="button" data-online-team-side="moon" class="moon ${self?.teamSide === "moon" ? "selected" : ""}"><b>蒼組</b><span>${moon.length}人</span></button></section>
    <section class="online-v3-team-roster"><div class="sun"><header>紅組</header>${sun.map(member => memberCard(member, { compact: true, state: member.teamReady ? "READY" : "WAIT" })).join("") || "<p>参加者を待っています</p>"}</div><strong>VS</strong><div class="moon"><header>蒼組</header>${moon.map(member => memberCard(member, { compact: true, state: member.teamReady ? "READY" : "WAIT" })).join("") || "<p>参加者を待っています</p>"}</div></section>
    <p class="online-v3-team-rule">最低2人。両チームに1人以上必要です。人数差のある対戦もそのまま開始できます。</p>
    <div class="online-v3-ready-actions"><button type="button" data-online-team-ready ${!["sun", "moon"].includes(self?.teamSide) ? "disabled" : ""}>${self?.teamReady ? "準備を解除" : "準備完了"}</button><button type="button" class="online-v3-primary" data-online-start-team ${room?.leaderId === selfId ? "" : "disabled"}>チーム戦開始</button></div>`;
}

export function renderOnlineChat(room, selfId, draft = "") {
  const messages = room?.chatHistory ?? [];
  return `${screenHeader("chat", "PARTY COMMUNICATION", "同じ部屋の全員へリアルタイム送信。再接続後も直近50件を復元します。")}
    <section class="online-v3-chat"><div class="online-v3-chat-log" data-online-chat-log role="log">${messages.length ? messages.map(message => {
      const own = message.playerId === selfId;
      return `<article class="${own ? "own" : ""}"><header><b>${escapeOnlineHtml(message.name || "冒険者")}</b><time>${new Date(Number(message.createdAt) || Date.now()).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</time></header><p>${escapeOnlineHtml(message.text)}</p></article>`;
    }).join("") : `<div class="online-v3-chat-empty"><b>まだ会話はありません</b><span>最初のメッセージを送ってみよう。</span></div>`}</div>
    <div class="online-v3-presets">${["よろしく！", "準備OK！", "ついてきて！", "ありがとう！", "👋", "✨", "❤️", "‼️"].map(text => `<button type="button" data-online-preset="${escapeOnlineHtml(text)}">${escapeOnlineHtml(text)}</button>`).join("")}</div>
    <form class="online-v3-compose" data-online-chat-form><label><textarea rows="2" maxlength="80" enterkeyhint="send" data-online-chat-input placeholder="メッセージを入力">${escapeOnlineHtml(draft)}</textarea><small><b data-online-chat-count>${number(String(draft).length)}</b>/80</small></label><button type="submit">送信</button></form></section>`;
}
