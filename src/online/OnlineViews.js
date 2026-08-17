import { dungeonThemeForFloor } from "../data/dungeonThemes.js?v=2.10.0-build163";
import { onlineAvatarVisual, onlineEnemyVisual, escapeOnlineHtml } from "../ui/screens/OnlinePartyScreen.js?v=2.10.0-build163";

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

function combatantCard({ id, name, profile, hp, maxHp, mp, maxMp, shield = 0, side = "ally", selected = false, down = false, action = null }) {
  return `<button type="button" class="online-v3-combatant ${side} ${selected ? "selected" : ""} ${down ? "down" : ""}" data-online-target="${escapeOnlineHtml(id)}" data-online-target-side="${side}">
    ${profile ? onlineAvatarVisual(profile, { frame: down ? "down" : "idle", className: "online-v3-combatant-art" }) : ""}
    <span><b>${escapeOnlineHtml(name)}</b>${shield > 0 ? `<em>障壁 ${number(shield)}</em>` : ""}${action ? `<small>${escapeOnlineHtml(action)}</small>` : ""}${meter("hp", hp, maxHp)}${maxMp != null ? meter("mp", mp, maxMp) : ""}</span>
  </button>`;
}

function eventFeed(events = []) {
  const rows = events.slice(-5).reverse();
  return `<div class="online-v3-battle-feed">${rows.length ? rows.map(event => `<p class="${escapeOnlineHtml(event.kind || "event")}"><b>${escapeOnlineHtml(EVENT_LABELS[event.kind] || "戦況")}</b><span>${escapeOnlineHtml(event.label || event.message || "戦況が変化した")}${event.value ? ` <strong>${number(event.value)}</strong>` : ""}</span></p>`).join("") : "<p><b>戦況</b><span>全員の行動を待っています。</span></p>"}</div>`;
}

function skills(profile, mode, battle, selfId) {
  const self = (battle?.players ?? []).find(player => player.playerId === selfId);
  return `<div class="online-v3-skills" data-online-skills hidden>${(profile?.skills ?? []).map(skill => `<button type="button" data-online-battle-skill="${escapeOnlineHtml(skill.id)}" data-online-mode="${mode}" ${Number(self?.mp ?? 0) < Number(skill.mp ?? 0) ? "disabled" : ""}><b>${escapeOnlineHtml(skill.name)}</b><small>MP ${number(skill.mp)}・${escapeOnlineHtml(skill.description || "特殊効果")}</small></button>`).join("") || "<p>使用できるスキルがありません。</p>"}</div>`;
}

export function renderSharedBattle({ mode, room, battle, selfId, selectedTarget = null, selectedAlly = null, title = "共闘バトル", enemies = [], allowCapture = false, readOnly = false }) {
  const selfMember = memberById(room, selfId);
  const selfAction = battle?.actions?.[selfId];
  const players = battle?.players ?? [];
  const aliveEnemy = enemies.find(enemy => enemy.hp > 0);
  const currentTarget = selectedTarget || aliveEnemy?.id;
  const currentAlly = selectedAlly || selfId;
  const speedDisabled = readOnly || room?.leaderId !== selfId;
  return `<section class="online-v3-battle" data-online-battle-view="${mode}">
    <header><div><small>SERVER SYNCHRONIZED</small><h3>${escapeOnlineHtml(title)}</h3></div><strong>ROUND ${number(battle?.round || 1)}</strong><div class="online-v3-speed">${[.5, 1, 2].map(speed => `<button type="button" data-online-speed="${speed}" data-online-mode="${mode}" class="${Number(battle?.speed) === speed ? "active" : ""}" ${speedDisabled ? "disabled" : ""} aria-label="戦闘速度 ${speed}倍">×${speed}</button>`).join("")}</div></header>
    <div class="online-v3-battlefield">
      <section class="online-v3-enemy-side"><small>ENEMY</small>${enemies.map(enemy => combatantCard({
        id: enemy.id, name: enemy.name || "敵", hp: enemy.hp, maxHp: enemy.maxHp, side: "enemy",
        selected: currentTarget === enemy.id, down: enemy.hp <= 0,
        profile: null,
      }).replace('<span><b>', `${enemy.asset ? `<img class="online-v3-raid-art" src="${escapeOnlineHtml(enemy.asset)}" alt="">` : onlineEnemyVisual(enemy, { className: "online-v3-foe-art" })}<span><b>`)).join("")}</section>
      <div class="online-v3-versus">VS</div>
      <section class="online-v3-ally-side"><small>PARTY</small>${players.map(player => {
        const profile = battleProfile(room, player);
        return combatantCard({ id: player.playerId, name: profile.displayName || player.name || "冒険者", profile,
          hp: player.hp, maxHp: player.maxHp, mp: player.mp, maxMp: player.maxMp, shield: player.shield,
          side: "ally", selected: currentAlly === player.playerId, down: player.hp <= 0,
          action: battle?.actions?.[player.playerId] ? "行動入力済み" : player.hp <= 0 ? "戦闘不能" : "入力待ち",
        });
      }).join("")}</section>
    </div>
    ${eventFeed(battle?.lastEvents)}
    ${readOnly ? `<section class="online-v3-spectating"><b>観戦中</b><span>両チームの行動と戦況をリアルタイムで表示しています。</span></section>` : `<section class="online-v3-command ${selfAction ? "submitted" : ""}">
      <header><div><small>YOUR COMMAND</small><h3>${selfAction ? "行動入力済み" : "行動を選択"}</h3></div><strong data-online-countdown="${mode}">${battle?.phase === "command" ? "--.-" : "処理中"}</strong></header>
      <div class="online-v3-command-grid">
        <button type="button" data-online-battle-action="attack" data-online-mode="${mode}">⚔<b>たたかう</b></button>
        <button type="button" data-online-battle-action="guard" data-online-mode="${mode}">🛡<b>ガード</b></button>
        <button type="button" data-online-battle-action="skill" data-online-mode="${mode}">📖<b>スキル</b></button>
        <button type="button" data-online-battle-action="item" data-online-mode="${mode}">🧪<b>応急薬</b></button>
        ${allowCapture ? `<button type="button" data-online-battle-action="capture" data-online-mode="${mode}">🔮<b>捕獲</b></button>` : ""}
      </div>
      ${skills(selfMember?.profile, mode, battle, selfId)}
      <p>敵または味方カードをタップして対象を選べます。未入力時は時間切れで自動行動します。</p>
    </section>`}
  </section>`;
}

function dungeonBoard(room, selfId) {
  const expedition = room?.expedition;
  if (!expedition) return "";
  const cols = Math.max(1, Number(expedition.cols) || 1), rows = Math.max(1, Number(expedition.rows) || 1);
  const cells = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) cells.push(`<i class="${expedition.tiles?.[y]?.[x] === "." ? "floor" : "wall"}" style="grid-column:${x + 1};grid-row:${y + 1}" data-map-x="${x}" data-map-y="${y}"></i>`);
  const objects = (expedition.objects ?? []).filter(object => !object.resolved || object.type === "exit").map(object => `<button type="button" class="online-v3-map-object ${escapeOnlineHtml(object.type)}" style="grid-column:${object.x + 1};grid-row:${object.y + 1}" data-map-x="${object.x}" data-map-y="${object.y}" title="${escapeOnlineHtml(object.type)}"></button>`).join("");
  const players = (room.members ?? []).filter(member => member.dungeonPosition).map(member => {
    const point = member.dungeonPosition, vitals = member.coopVitals ?? {}, hp = Number(vitals.hp ?? member.profile?.battleStats?.hp) || 0, maxHp = Number(vitals.maxHp ?? member.profile?.battleStats?.hp) || 1;
    return `<button type="button" class="online-v3-map-player ${member.playerId === selfId ? "self" : ""} ${hp <= 0 ? "down" : hp / maxHp <= .1 ? "critical" : ""}" style="grid-column:${point.x + 1};grid-row:${point.y + 1}" data-online-map-player="${escapeOnlineHtml(member.playerId)}">${onlineAvatarVisual(member.profile, { frame: hp <= 0 ? "down" : "idle" })}<b>${escapeOnlineHtml(member.profile?.displayName || "冒険者")}</b></button>`;
  }).join("");
  return `<div class="online-v3-map-viewport" data-online-map-viewport><div class="online-v3-map" data-online-map style="--map-cols:${cols};--map-rows:${rows}">${cells.join("")}${objects}${players}</div></div>`;
}

export function renderOnlineExplore(room, selfId, state = {}) {
  const expedition = room?.expedition;
  if (room?.phase === "expedition" && expedition?.battle) return `${screenHeader("explore", "SHARED BATTLE", "通常探索と同じ戦闘UIで、全員が自分のキャラクターを操作します。")}${renderSharedBattle({ mode: "explore", room, battle: expedition.battle, selfId, selectedTarget: state.selectedTarget, selectedAlly: state.selectedAlly, title: `${number(expedition.floor)}F・遭遇戦`, enemies: expedition.battle.enemies ?? [], allowCapture: true })}`;
  if (room?.phase === "expedition" && expedition) {
    const theme = dungeonThemeForFloor(expedition.floor);
    return `${screenHeader("explore", "SHARED EXPEDITION", `${number(expedition.floor)}F・${theme.name}を共同探索中。`)}
      <section class="online-v3-explore-status"><div><small>発見</small><b>${number(expedition.discoveries)} / ${number(expedition.totalDiscoveries)}</b></div><div><small>戦闘</small><b>${number(expedition.encountersCleared)} / ${number(expedition.totalEncounters)}</b></div><button type="button" data-online-return>帰還を提案</button>${expedition.exitReached && room.leaderId === selfId ? `<button type="button" data-online-complete>踏破を確定</button>` : ""}</section>
      <section class="online-v3-dungeon" style="--dungeon-accent:${theme.accent};--dungeon-floor:url('${theme.floorAsset}');--dungeon-wall:url('${theme.wallAsset}')">${dungeonBoard(room, selfId)}<div class="online-v3-pad"><button data-online-move="up">▲</button><button data-online-move="left">◀</button><button data-online-move="down">▼</button><button data-online-move="right">▶</button></div></section>`;
  }
  return `${screenHeader("explore", "CO-OP DUNGEON", "ソロ探索と同じ部品・処理を使い、1人1体を操作する共同探索です。")}
    <section class="online-v3-lobby-card"><div><small>CHALLENGE FLOOR</small><label><input type="number" min="1" max="10000" value="${number(room?.selectedFloor || 1).replaceAll(",", "")}" data-online-floor><b>F</b></label><p>変更できるのはリーダーだけ。全員の準備後に出発できます。</p></div></section>
    ${readyGrid(room)}
    <div class="online-v3-ready-actions"><button type="button" data-online-ready>${memberById(room, selfId)?.ready ? "準備を解除" : "準備完了"}</button><button type="button" class="online-v3-primary" data-online-start-explore ${room?.leaderId === selfId ? "" : "disabled"}>通常探索へ出発</button></div>`;
}

export function renderOnlineRaid(room, selfId, state = {}) {
  if (room?.phase === "raid" && room.raid) {
    const enemies = [room.raid.boss, ...(room.raid.minions ?? [])];
    return `${screenHeader("raid", "CALAMITY RAID", "通常探索の戦闘UIをそのまま使う、最大4人の同期ボス戦です。")}${room.raid.telegraph ? `<aside class="online-v3-telegraph"><small>ROUND ${number(room.raid.round)}</small><b>${escapeOnlineHtml(room.raid.telegraph.title || "予兆")}</b><span>${escapeOnlineHtml(room.raid.telegraph.message || "終焉が迫る…")}</span></aside>` : ""}${renderSharedBattle({ mode: "raid", room, battle: room.raid, selfId, selectedTarget: state.selectedTarget, selectedAlly: state.selectedAlly, title: room.raid.name, enemies })}`;
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
    return `${screenHeader("team", "FREE TEAM BATTLE", `${escapeOnlineHtml(battle.format)}・報酬なしのフレンド模擬戦です。`)}${renderSharedBattle({ mode: "team", room, battle: allyBattle, selfId, selectedTarget: state.selectedTarget, selectedAlly: state.selectedAlly, title: `${battle.format} チーム戦`, enemies, readOnly: !self })}`;
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
