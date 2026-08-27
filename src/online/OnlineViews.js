import { dungeonThemeForFloor } from "../data/dungeonThemes.js?v=2.11.54-build226";
import { battleEnvironmentForFloor } from "../data/biomes.js?v=2.11.54-build226";
import { onlineAvatarVisual, onlineMagicCircleArt, escapeOnlineHtml } from "../ui/screens/OnlinePartyScreen.js?v=2.11.54-build226";
import { BattleScreen } from "../ui/screens/BattleScreen.js?v=2.11.54-build227";
import { ExploreScreen } from "../ui/screens/ExploreScreen.js?v=2.11.54-build226";
import { pixelIcon } from "../ui/components/GameChrome.js?v=2.11.54-build226";

const ROUTE_LABELS = Object.freeze({ home: "ホーム", explore: "通常探索", raid: "レイドボス", team: "自由チーム戦", chat: "チャット" });
const EVENT_LABELS = Object.freeze({
  damage: "ダメージ", enemyDamage: "ダメージ", heal: "回復", mpHeal: "MP回復", revive: "蘇生",
  guard: "ガード", miss: "回避", ko: "戦闘不能", effect: "効果", buff: "強化", shield: "障壁",
  capture: "捕獲", result: "決着", signature: "共鳴", raidTelegraph: "予兆", weeklyRule: "週間ルール", milestone: "到達報酬", link: "連携", coopBreak: "LINK ARTS", coopBossMechanic: "共鳴課題", circleActivate: "魔法陣",
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
    <div><small>${member?.leader ? "LEADER" : member?.connected ? "ONLINE" : "RECONNECTING"}</small><b>${escapeOnlineHtml(profile.displayName || "冒険者")}</b><span>${escapeOnlineHtml(profile.monsterName || "魔物")}・Lv.${number(profile.level || 1)}</span><span class="online-circle-loadout">◉ ${escapeOnlineHtml(profile.circleId && profile.circleId !== "none" ? `${profile.circleName || "魔法陣"} Lv.${number(profile.circleLevel || 1)}` : "魔法陣なし")}</span>${state ? `<em>${escapeOnlineHtml(state)}</em>` : ""}</div>
  </article>`;
}

function readyGrid(room, { team = false } = {}) {
  return `<div class="online-v3-ready-grid">${(room?.members ?? []).map(member => {
    const ready = team ? member.teamReady : member.ready;
    const state = team ? member.teamSide === "sun" ? "紅組" : member.teamSide === "moon" ? "蒼組" : "観戦" : ready ? "準備完了" : "準備中";
    return `<div class="${ready ? "ready" : ""}">${memberCard(member, { compact: true, state })}<strong>${ready ? "READY" : "WAIT"}</strong></div>`;
  }).join("")}${Array.from({ length: Math.max(0, 4 - (room?.members?.length ?? 0)) }, () => `<div class="online-v3-empty-member">参加待ち</div>`).join("")}</div>`;
}

const HALL_DESTINATIONS = Object.freeze([
  { route: "raid", x: 18, y: 25, label: "レイド受付", prompt: "レイド戦へ行く", icon: "RAID", asset: "./assets/online/hall/build218/raid-pavilion.png" },
  { route: "explore", x: 82, y: 25, label: "ダンジョン門", prompt: "通常探索へ行く", icon: "GATE", asset: "./assets/online/hall/build218/dungeon-gate.png" },
  { route: "team", x: 24, y: 78, label: "闘技場", prompt: "自由チーム戦へ行く", icon: "ARENA", asset: "./assets/online/hall/build218/arena.png" },
  { route: "chat", x: 76, y: 78, label: "掲示板", prompt: "会話を開く", icon: "CHAT", asset: "./assets/online/hall/build218/notice-board.png" },
]);

function tradeAssetCard(asset, label = "未選択") {
  if (!asset) return `<article class="online-trade-offer empty"><small>${escapeOnlineHtml(label)}</small><b>交換品を選択中</b></article>`;
  return `<article class="online-trade-offer rarity-${escapeOnlineHtml(String(asset.rarity || "N").toLowerCase())}"><small>${escapeOnlineHtml(asset.kind === "monster" ? "仲間" : asset.kind === "equipment" ? "装備" : asset.kind === "currency" ? "通貨" : "消耗品")}</small><b>${escapeOnlineHtml(asset.name || "交換品")}</b><span>${escapeOnlineHtml([asset.rarity, asset.level ? `Lv.${number(asset.level)}` : "", asset.details].filter(Boolean).join("・"))}</span></article>`;
}

function renderTradeOverlay(room, selfId, state) {
  const trade = state.trade; if (!trade) return "";
  const partnerId = trade.participants?.find(id => id !== selfId), partner = memberById(room, partnerId), own = trade.offers?.[selfId], theirs = trade.offers?.[partnerId];
  const invited = trade.state === "invited", requester = trade.requesterId === selfId, ready = Boolean(trade.ready?.[selfId]), partnerReady = Boolean(trade.ready?.[partnerId]), confirmed = Boolean(trade.confirmed?.[selfId]);
  const filters = [["all","すべて"],["monster","仲間"],["equipment","装備"],["stack","消耗品"],["currency","通貨"]];
  const catalog = (state.tradeCatalog ?? []).map(asset => `<button type="button" class="online-trade-catalog-item" data-online-trade-offer="${escapeOnlineHtml(asset.ref)}" ${asset.unavailable ? "disabled" : ""}><span><b>${escapeOnlineHtml(asset.name)}</b><small>${escapeOnlineHtml(`${asset.rarity || "N"}・${asset.details || ""}`)}</small></span><em>${escapeOnlineHtml(asset.unavailable ? asset.reason || "交換不可" : asset.maxAmount > 1 ? `最大 ${number(asset.maxAmount)}` : "選ぶ")}</em></button>`).join("");
  const amount = `<label class="online-trade-amount">数量 <input type="number" min="1" max="50000000" inputmode="numeric" value="${number(state.tradeAmount || 1).replaceAll(",", "")}" data-online-trade-amount></label>`;
  let body = "";
  if (invited) body = requester ? `<div class="online-trade-wait"><b>交換を申し込みました</b><p>${escapeOnlineHtml(partner?.profile?.displayName || "相手")}の返事を待っています。</p><button type="button" data-online-trade-cancel>取り消す</button></div>` : `<div class="online-trade-invite"><b>${escapeOnlineHtml(partner?.profile?.displayName || "冒険者")}から交換の申し込み</b><p>交換品は双方が確認してから同時に確定します。</p><footer><button type="button" data-online-trade-decline>断る</button><button type="button" class="primary" data-online-trade-accept>交換する</button></footer></div>`;
  else if (trade.state === "committing") body = `<div class="online-trade-wait"><b>交換品をセーブしています…</b><p>完了するまで画面を閉じないでください。切断時も再接続後に再開します。</p></div>`;
  else body = `<div class="online-trade-offers"><section><small>あなたが渡す</small>${tradeAssetCard(own, "あなた")}</section><i>⇄</i><section><small>${escapeOnlineHtml(partner?.profile?.displayName || "相手")}から受取</small>${tradeAssetCard(theirs, "相手")}</section></div>
    ${trade.state === "offering" ? `<div class="online-trade-picker"><nav>${filters.map(([id,label]) => `<button type="button" class="${state.tradeFilter === id ? "active" : ""}" data-online-trade-filter="${id}">${label}</button>`).join("")}</nav><div class="online-trade-search"><input type="search" maxlength="40" value="${escapeOnlineHtml(state.tradeQuery || "")}" placeholder="名前で絞り込み" data-online-trade-query>${amount}</div><div class="online-trade-catalog">${catalog || "<p>交換できる所持品がありません</p>"}</div></div>` : ""}
    <div class="online-trade-progress"><span class="${ready ? "done" : ""}">自分 ${ready ? "SET" : "WAIT"}</span><span class="${partnerReady ? "done" : ""}">相手 ${partnerReady ? "SET" : "WAIT"}</span></div>
    <footer class="online-trade-actions">${trade.state === "confirming" ? `<div class="online-trade-warning"><b>最終確認</b><span>成立後は元に戻せません。品名と数量を確認してください。</span></div><button type="button" class="primary" data-online-trade-confirm ${confirmed || state.tradeConfirmSeconds > 0 ? "disabled" : ""}>${confirmed ? "確認済み・相手待ち" : state.tradeConfirmSeconds > 0 ? `${number(state.tradeConfirmSeconds)}秒後に確定` : "この内容で交換確定"}</button>` : `<button type="button" data-online-trade-ready ${!own ? "disabled" : ""}>${ready ? "セットを解除" : "この品をセット"}</button>`}<button type="button" data-online-trade-cancel>交換をやめる</button></footer>`;
  return `<aside class="online-trade-modal" role="dialog" aria-modal="true" aria-label="プレイヤー間交換"><header><div><small>SAFE PLAYER TRADE</small><b>${escapeOnlineHtml(partner?.profile?.displayName || "冒険者")}との交換</b></div>${onlineAvatarVisual(partner?.profile ?? {}, { className: "online-trade-partner" })}</header>${body}</aside>`;
}

export function renderOnlineHome(room, selfId, state = {}) {
  const self = memberById(room, selfId), point = self?.position ?? { x: 50, y: 76 };
  const nearby = HALL_DESTINATIONS.find(zone => Math.hypot(zone.x - Number(point.x), zone.y - Number(point.y)) <= 10);
  const social = new Map((state.socialBubbles ?? []).map(entry => [entry.playerId, entry]));
  const chats = new Map((state.chatBubbles ?? []).map(entry => [entry.playerId, entry]));
  const inlineChat = `<form class="online-hall-chat-bar ${state.exploreChatOpen ? "open" : ""}" data-online-explore-chat-form ${state.exploreChatOpen ? "" : "hidden"}><input maxlength="80" enterkeyhint="send" autocomplete="off" data-online-explore-chat-input placeholder="集会所の仲間へ話す" value="${escapeOnlineHtml(state.chatDraft ?? "")}"><button type="submit">送信</button><button type="button" data-online-chat-close aria-label="閉じる">×</button></form>`;
  return `<section class="online-gathering-hall" data-online-hall-stage aria-label="オンライン集会所">
    <div class="online-hall-backdrop" aria-hidden="true"></div>
    <header class="online-hall-hud"><div><small>GATHERING HALL / ROOM</small><b>${escapeOnlineHtml(room?.roomId ?? "------")}</b></div><span>${room?.members?.length ?? 0} / 4人</span><p>床をタップして移動・施設に近づいて選択</p></header>
    <div class="online-hall-world">
      ${HALL_DESTINATIONS.map(zone => `<button type="button" class="online-hall-zone zone-${zone.route}" style="--hall-x:${zone.x}%;--hall-y:${zone.y}%" data-online-hall-destination="${zone.route}" data-hall-x="${zone.x}" data-hall-y="${zone.y}" aria-label="${zone.label}へ移動"><span class="hall-facility-art"><img src="${zone.asset}" alt="" draggable="false"></span><i>${zone.icon}</i><b>${zone.label}</b></button>`).join("")}
      <div class="online-hall-members">${(room?.members ?? []).map((member, index) => {
        const position = member.position ?? { x: 50 + index * 4, y: 72 + index * 3 };
        const bubble = social.get(member.playerId);
        const chat = chats.get(member.playerId);
        const tag = member.playerId === selfId ? "figure" : "button", trade = member.playerId === selfId ? "" : `type="button" data-online-trade-player="${escapeOnlineHtml(member.playerId)}" aria-label="${escapeOnlineHtml(member.profile?.displayName || "冒険者")}と交換する" ${member.connected ? "" : "disabled"}`;
        return `<${tag} class="online-hall-player ${member.playerId === selfId ? "self" : "tradeable"} ${member.connected ? "" : "offline"}" style="--hall-x:${clamp(position.x, 5, 95)}%;--hall-y:${clamp(position.y, 15, 96)}%" data-online-hall-player="${escapeOnlineHtml(member.playerId)}" ${trade}>${bubble ? `<span class="online-hall-emote">${escapeOnlineHtml(bubble.emoji)}</span>` : ""}${chat ? `<span class="online-hall-chat-bubble">${escapeOnlineHtml(chat.text)}</span>` : ""}${onlineAvatarVisual(member.profile ?? {}, { className: "online-hall-avatar" })}<span class="online-hall-player-name">${escapeOnlineHtml(member.profile?.displayName || "冒険者")}${member.playerId === selfId ? "" : "<small>タップで交換</small>"}</span></${tag}>`;
      }).join("")}</div>
      <div class="online-hall-social-tools"><button type="button" class="online-hall-emote-tool" data-online-emote-anchor><b>☺</b><small>長押し</small></button><button type="button" data-online-chat-toggle class="online-hall-chat-tool ${state.exploreChatOpen ? "active" : ""}">${pixelIcon("notice")}<small>チャット</small></button></div>
      ${state.exploreChatOpen ? "" : nearby ? `<aside class="online-hall-prompt"><small>${nearby.label}</small><button type="button" data-online-go="${nearby.route}">${nearby.prompt}</button></aside>` : `<aside class="online-hall-tip">行き先へ近づくと案内が表示されます</aside>`}
      ${inlineChat}
    </div>
    <footer class="online-hall-party-strip">${(room?.members ?? []).map(member => `<span class="${member.connected ? "online" : "offline"}"><i></i>${escapeOnlineHtml(member.profile?.displayName || "冒険者")}</span>`).join("")}</footer>
    ${renderTradeOverlay(room, selfId, state)}
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
    _equipmentAuthorities: Array.isArray(profile.equipmentAuthorities) ? profile.equipmentAuthorities : [],
  };
}

function onlineEnemy(room, enemy) {
  const profile = enemy.playerId ? battleProfile(room, enemy) : null;
  const raidVisualBase = enemy.id === "abyss-amalga" ? "./assets/online/raid/abyss-amalga" : enemy.id === "juvenile-amalga" ? "./assets/online/raid/juvenile-amalga" : null;
  return {
    ...enemy, id: enemy.id ?? enemy.playerId, speciesId: profile?.speciesId ?? enemy.speciesId ?? "slime",
    visualSpeciesId: profile?.visualSpeciesId ?? enemy.visualSpeciesId ?? null, endgameBossId: profile?.endgameBossId ?? enemy.endgameBossId ?? null,
    floorBossCatalogId: profile?.floorBossCatalogId ?? enemy.floorBossCatalogId ?? null,
    customVisualBase: enemy.visualBase ?? raidVisualBase, customVisualAsset: enemy.visualBase || raidVisualBase ? null : enemy.asset ?? null, visualFrame: enemy.visualFrame ?? (Number(enemy.hp) <= 0 ? "down" : "idle"), name: profile?.monsterName || enemy.monsterName || enemy.name || profile?.displayName || "敵",
    level: Math.max(1, Number(profile?.level ?? enemy.level) || 1), hp: Math.max(0, Number(enemy.hp) || 0), maxHp: Math.max(1, Number(enemy.maxHp) || 1),
    atk: Math.max(1, Number(enemy.atk ?? profile?.battleStats?.atk) || 1), matk: Math.max(1, Number(enemy.matk ?? profile?.battleStats?.matk) || 1),
    def: Math.max(0, Number(enemy.def ?? profile?.battleStats?.def) || 0), mdef: Math.max(0, Number(enemy.mdef ?? profile?.battleStats?.mdef) || 0),
    spd: Math.max(1, Number(enemy.spd ?? profile?.battleStats?.spd) || 1), element: profile?.attribute ?? enemy.element ?? "neutral",
    emoji: profile?.fallbackEmoji ?? enemy.emoji ?? "魔", summonTier: profile?.summonTier ?? profile?.summonRarity ?? null,
    summonRarity: profile?.summonRarity ?? profile?.summonTier ?? null, boss: Boolean(enemy.boss || enemy.coopBoss || enemy.raidMainBoss || enemy.id === "abyss-amalga"), raidMainBoss: Boolean(enemy.raidMainBoss || enemy.id === "abyss-amalga"), raidSubBoss: enemy.role === "subBoss", magicCircleName: enemy.magicCircle ?? null, magicCircleAsset: enemy.magicCircleAsset ?? null, uncapturable: enemy.uncapturable ?? Boolean(enemy.boss || enemy.coopBoss || enemy.playerId || enemy.asset),
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

function splitEffects(units = []) {
  const ailments = {}, effects = {};
  for (const unit of units) {
    ailments[unit.playerId ?? unit.id] = (unit.effects ?? []).filter(effect => String(effect.kind ?? "").startsWith("status:")).map(effect => ({ ...effect, id: String(effect.kind).slice(7) }));
    effects[unit.playerId ?? unit.id] = (unit.effects ?? []).filter(effect => !String(effect.kind ?? "").startsWith("status:"));
  }
  return { ailments, effects };
}

function renderCoopBossMechanic(battle) {
  const boss = battle?.coopBoss;
  if (!boss) return "";
  const mechanic = boss.mechanic ?? battle?.coopMechanic ?? {};
  const round = Math.max(1, Number(battle?.round) || 1);
  const dueRound = Math.max(round, Number(mechanic.dueRound ?? boss.dueRound ?? battle?.coopBossDueRound) || round);
  const remaining = Math.max(0, dueRound - round);
  const successes = Math.max(0, Number(mechanic.successes ?? boss.successes) || 0);
  const failures = Math.max(0, Number(mechanic.failures ?? boss.failures) || 0);
  const accent = escapeOnlineHtml(boss.accent || "#8fe9ff");
  const active = remaining === 0 && battle?.phase === "command";
  return `<aside class="online-coop-boss-mechanic ${active ? "active" : "waiting"}" style="--coop-boss-accent:${accent}" aria-live="polite">
    <header><small>CO-OP BOSS・${escapeOnlineHtml(boss.title || "共鳴試練")}</small><b>${escapeOnlineHtml(mechanic.name || "共鳴課題")}</b><em>${active ? "このラウンド" : `${remaining}ラウンド後`}</em></header>
    <p>${escapeOnlineHtml(mechanic.instruction || boss.intro || "仲間と行動を合わせて共鳴を成功させよう。")}</p>
    <footer><span>成功 ${number(successes)}</span><span>失敗 ${number(failures)}</span><strong>${escapeOnlineHtml(mechanic.shortLabel || "行動を合わせる")}</strong></footer>
  </aside>`;
}

function renderLinkArts(battle) {
  const state = battle?.coopTechnique ?? battle?.coopBreak;
  if (!state || state.enabled === false) return "";
  const gauge = Math.max(0, Number(state.gauge) || 0);
  const maximum = Math.max(1, Number(state.max) || 100);
  const techniques = (Array.isArray(state.techniques) ? state.techniques : []).filter(technique => technique && typeof technique === "object");
  const lastTechniqueId = typeof state.lastTechnique === "object" ? state.lastTechnique?.id : state.lastTechnique;
  const lastTechnique = (typeof state.lastTechnique === "object" ? state.lastTechnique : null) ?? techniques.find(technique => technique.id === lastTechniqueId) ?? null;
  const lastLabel = String(state.lastLabel ?? "").trim();
  const latest = [lastLabel, lastTechnique?.name].filter(Boolean).join(" → ");
  const uses = Math.max(0, Number(state.totalUses) || 0);
  const availablePlayers = Math.max(0, Number(state.availablePlayers) || 0);
  const waitingForAlly = availablePlayers === 1;
  const recipes = techniques.map(technique => `<span title="${escapeOnlineHtml(technique.effectText || technique.name || "LINK ARTS")}" aria-label="${escapeOnlineHtml(`${technique.shortLabel || "連携"}で${technique.name || "LINK ARTS"}。${technique.effectText || "共闘効果が発動"}`)}"><b>${escapeOnlineHtml(technique.shortLabel || "連携")}</b><em>${escapeOnlineHtml(technique.name || "LINK ARTS")}</em></span>`).join("");
  return `<aside class="online-coop-break online-link-arts ${waitingForAlly ? "waiting" : gauge >= maximum ? "ready" : "charging"}" aria-label="LINK ARTS 共闘連携" aria-live="polite">
    <header><b>LINK ARTS</b><small>${number(gauge)} / ${number(maximum)}</small>${uses ? `<em>発動 ${number(uses)}</em>` : ""}</header>
    <i class="online-link-arts-meter" role="progressbar" aria-label="LINK ARTSゲージ" aria-valuemin="0" aria-valuemax="${maximum}" aria-valuenow="${Math.min(gauge, maximum)}" aria-valuetext="${number(gauge)} / ${number(maximum)}"><em style="width:${ratio(gauge, maximum)}%"></em></i>
    <p>${escapeOnlineHtml(waitingForAlly ? "仲間の復帰待ち（ゲージは保持）" : latest ? `直近 ${latest}` : "仲間との行動でゲージ上昇")}</p>
    ${recipes ? `<div class="online-link-arts-recipes" aria-label="発動レシピ">${recipes}</div>` : ""}
  </aside>`;
}

export function renderSharedBattle({ mode, room, battle, selfId, selectedTarget = null, selectedAlly = null, title = "共闘バトル", enemies = [], allowCapture = false, readOnly = false, skillMenu = false, itemMenu = false, itemTargetMenu = false, hpTrails = {} }) {
  const players = (Array.isArray(battle?.players) ? battle.players : []).filter(player => player && typeof player === "object" && player.playerId), self = players.find(player => player.playerId === selfId), party = players.map(player => onlineMonster(room, player));
  const foes = (Array.isArray(enemies) ? enemies : []).filter(enemy => enemy && typeof enemy === "object").map(enemy => onlineEnemy(room, enemy)), target = foes.find(enemy => enemy.id === selectedTarget && enemy.hp > 0) ?? foes.find(enemy => enemy.hp > 0) ?? null;
  const selfMember = memberById(room, selfId), selfMonster = party.find(monster => monster.id === selfId);
  const turnQueue = [
    ...party.filter(monster => monster.currentHp > 0).map(monster => ({ type: "ally", id: monster.id, name: monster.onlineName, spd: monster.onlineStats.spd ?? 0 })),
    ...foes.filter(enemy => enemy.hp > 0).map(enemy => ({ type: "enemy", id: enemy.id, name: enemy.name, spd: enemy.spd ?? 0 })),
  ].sort((left, right) => right.spd - left.spd);
  const allyState = splitEffects(players), enemyState = splitEffects(enemies);
  const magicCircleProfiles = Object.fromEntries(party.map(monster => { const profile = memberById(room, monster.id)?.profile ?? {}; return [monster.id, { id: profile.circleId ?? "none", name: profile.circleName ?? "魔法陣なし", level: profile.circleLevel ?? 0, effect: profile.circleEffect ?? "none" }]; }));
  const magicCircleArt = Object.fromEntries(party.map(monster => [monster.id, onlineMagicCircleArt(memberById(room, monster.id)?.profile ?? {}, { className: "battle-magic-circle" })]));
  const enemyMagicCircleArt = Object.fromEntries(foes.filter(enemy => enemy.magicCircleAsset).map(enemy => [enemy.id, `<span class="magic-circle magic-circle-black enemy-battle-magic-circle" data-circle-id="death-mirror-raid" aria-hidden="true"><img class="magic-circle-frame magic-circle-frame-1" src="${escapeOnlineHtml(enemy.magicCircleAsset)}" alt="" draggable="false"><i class="magic-circle-ring-a"></i><i class="magic-circle-ring-b"></i><b>死</b></span>`]));
  const events = [...(battle?.lastEvents ?? [])];
  if (battle?.telegraph) events.push({ kind: "raidTelegraph", label: `${battle.telegraph.title || "予兆"}：${battle.telegraph.message || "終焉が迫る…"}` });
  const floor = Math.max(1, Number(battle?.floor ?? room?.selectedFloor) || 1), biomeBattle = battleEnvironmentForFloor(floor);
  const uiBattle = {
    onlineMode: mode, onlineReadOnly: readOnly, onlineActionSubmitted: Boolean(battle?.actions?.[selfId]) || battle?.phase !== "command", onlineAllowCapture: allowCapture && Number(self?.captureCharges ?? selfMember?.profile?.captureStock) > 0,
    onlineCountdownMode: mode, onlineSelectedAlly: selectedAlly || selfId, onlineSkills: (selfMember?.profile?.skills ?? []).map(onlineSkill),
    enemies: foes, enemy: foes[0], targetEnemyId: target?.id ?? null, party, species: {}, turn: Math.max(1, Number(battle?.round) || 1), turnQueue, queueIndex: 0, onlineActorId: selfId,
    auto: false, busy: false, phase: battle?.phase ?? "command", speed: battle?.speed ?? 1, skillMenu: Boolean(skillMenu), itemMenu: Boolean(itemMenu), onlineItemTargetMenu: Boolean(itemTargetMenu), onlineItemCharges: Math.max(0, Number(self?.itemCharges) || 0),
    guards: {}, cooldowns: {}, enemyStatuses: enemyState.ailments, allyAilments: allyState.ailments, allyEffects: allyState.effects, enemyEffects: enemyState.effects, hpTrails,
    magicCircleProfiles, magicCircleArt, enemyMagicCircleArt, log: events.slice(-6).map(eventLine),
    biomeBattle, specialTitle: title, battleTheme: mode === "raid" || battle?.coopBoss ? "boss" : mode === "team" ? "abyss" : biomeBattle.theme,
  };
  const screen = BattleScreen(uiBattle, { captureCrystals: Math.max(0, Number(self?.captureCharges ?? selfMember?.profile?.captureStock) || 0) }, { battleSpeed: uiBattle.speed }, floor);
  const linkArts = renderLinkArts(battle);
  const coopBossMechanic = renderCoopBossMechanic(battle);
  const down = self && Number(self.hp) <= 0, cheered = (battle?.cheeredBy ?? []).includes(selfId);
  const cheer = down ? `<aside class="online-spectator-cheer"><b>戦況を観戦中</b><span>倒れていても1戦に1度だけ仲間を応援できます</span><button type="button" data-online-battle-cheer="${mode}" ${cheered ? "disabled" : ""}>${cheered ? "応援済み" : "応援する（全体 攻防+3%）"}</button></aside>` : "";
  const bossStyle = battle?.coopBoss ? ` style="--coop-boss-accent:${escapeOnlineHtml(battle.coopBoss.accent || "#8fe9ff")}"` : "";
  return `<div class="online-shared-battle-shell ${battle?.coopBoss ? "is-coop-boss" : ""}"${bossStyle}>${screen}${linkArts}${coopBossMechanic}${cheer}</div>`;
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
  if (state.expeditionReport && (state.expeditionReport.multiplayer ?? (room?.members?.length ?? 0) >= 2)) {
    const report = state.expeditionReport, rows = (report.ranking ?? []).map(entry => {
      const member = memberById(room, entry.playerId);
      const mvps = (entry.mvpTitles ?? []).map(title => `<em class="online-mvp-badge">${escapeOnlineHtml(title)}</em>`).join("");
      return `<article class="online-coop-report-row ${entry.playerId === selfId ? "self" : ""}"><strong>${number(entry.rank)}位</strong>${onlineAvatarVisual(member?.profile ?? {}, { className: "online-raid-report-avatar" })}<div><b>${escapeOnlineHtml(member?.profile?.displayName || entry.name || "冒険者")}</b><small>共闘貢献 ${number(entry.score)}</small><span class="online-mvp-list">${mvps}</span></div><dl><div><dt>探索</dt><dd>${number(entry.exploration)}</dd></div><div><dt>戦闘</dt><dd>${number(entry.combat)}</dd></div><div><dt>救助</dt><dd>${number(entry.rescue)}</dd></div><div><dt>宝箱</dt><dd>${number(entry.chests)}</dd></div><div><dt>仕掛け</dt><dd>${number((entry.switches ?? 0) + (entry.gimmicks ?? 0))}</dd></div><div><dt>支援</dt><dd>${number(entry.support)}</dd></div></dl></article>`;
    }).join("");
    return `${screenHeader("explore", "CO-OP REPORT", report.completed ? `${number(report.floor)}Fを共に踏破しました。` : "今回の共闘記録を確認できます。")}<section class="online-raid-report online-coop-report"><header><span>${report.completed ? "EXPEDITION CLEAR" : "EXPEDITION END"}</span><h3>共闘貢献票</h3></header><div>${rows || '<p class="empty">集計データがありません</p>'}</div><button type="button" data-online-close-expedition-report>探索受付へ戻る</button></section>`;
  }
  if (room?.phase === "expedition" && expedition?.battle) { const battle = expedition.battle, coopBoss = battle.coopBoss ?? null, bossNames = expedition.floorBoss?.profiles?.map(profile => profile?.name).filter(Boolean) ?? []; return renderSharedBattle({ mode: "explore", room, battle, selfId, selectedTarget: state.selectedTarget, selectedAlly: state.selectedAlly, title: coopBoss?.name ? `${number(expedition.floor)}F・共闘ボス ${coopBoss.name}` : bossNames.length ? `${number(expedition.floor)}F・階層支配者 ${bossNames.join("・")}` : `${number(expedition.floor)}F・遭遇戦`, enemies: battle.enemies ?? [], allowCapture: !coopBoss && !bossNames.length, skillMenu: state.skillMenu, itemMenu: state.itemMenu, itemTargetMenu: state.itemTargetMenu, hpTrails: state.hpTrails }); }
  if (room?.phase === "expedition" && expedition) {
    const theme = dungeonThemeForFloor(expedition.floor), base = fallbackExploreState(state.gameState, expedition.floor), discovered = Number(expedition.discoveries) + Number(expedition.encountersCleared), total = Math.max(1, Number(expedition.totalDiscoveries) + Number(expedition.totalEncounters));
    const interaction = expedition.interactions?.[selfId] ?? null;
    const realmActive = Boolean(expedition.coop?.rare?.realmActive);
    const stageTools = `<button id="miniMapToggle" type="button" class="minimap-toggle online-map-toggle" aria-pressed="true">${pixelIcon("event")}<b>マップ</b></button><button id="onlineExploreChatToggle" type="button" data-online-chat-toggle class="minimap-toggle online-chat-toggle ${state.exploreChatOpen ? "active" : ""}">${pixelIcon("notice")}<b>チャット</b></button><button type="button" data-online-ping-toggle class="minimap-toggle online-ping-toggle ${state.pingMenuOpen ? "active" : ""}">${pixelIcon("event")}<b>ピン</b></button><button type="button" class="minimap-toggle online-explore-emote" data-online-emote-anchor><b>☺</b><small>長押し</small></button>${expedition.exitReached && room.leaderId === selfId ? `<button type="button" data-online-complete class="minimap-toggle online-floor-complete">${pixelIcon("event")}<b>踏破確定</b></button>` : ""}`;
    const nav = `<button type="button" data-online-route="home"><i>${pixelIcon("formation")}</i>部屋</button><button type="button" data-online-chat-toggle><i>${pixelIcon("notice")}</i>会話</button><button type="button" data-online-route="raid"><i>${pixelIcon("growth")}</i>レイド</button><button type="button" data-online-center><i>${pixelIcon("event")}</i>現在地</button><button type="button" data-online-return class="danger"><i>${pixelIcon("rest")}</i>帰還</button>`;
    const compatibilityPlayers = (room.members ?? []).map(member => `<span hidden data-online-map-player="${escapeOnlineHtml(member.playerId)}"></span>`).join("");
    const inlineChat = `<form class="online-explore-chat-bar ${state.exploreChatOpen ? "open" : ""}" data-online-explore-chat-form ${state.exploreChatOpen ? "" : "hidden"}><input maxlength="80" enterkeyhint="send" autocomplete="off" data-online-explore-chat-input placeholder="探索しながら仲間へ話す" value="${escapeOnlineHtml(state.chatDraft ?? "")}"><button type="submit">送信</button><button type="button" data-online-chat-close aria-label="閉じる">×</button></form>`;
    const merchantResult = state.merchantResult ?? null, merchantReceipt = merchantResult?.offer === "relic" ? `${number(expedition.floor) >= 300 ? "UR" : "SSR"}装備 ×1` : merchantResult?.offer === "crystal" ? "捕獲結晶 ×2・魔晶石 ×3" : merchantResult?.offer === "rest" ? "HP・MP全回復・捕獲結晶 ×1" : "", merchantShowOffers = !merchantResult || merchantResult.status === "error";
    const merchantModal = `<aside class="online-rare-merchant-modal" role="dialog" aria-modal="true" aria-label="異界商人の無料支援"><header><img src="./assets/online/coop/merchant/talk.png?v=2.11.44-build209" alt=""><div><small>OTHERWORLD SUPPORT</small><b>異界商人の無料支援</b><span>代金は不要。各プレイヤー1回、ひとつだけ選べます。</span></div><button type="button" data-online-close-merchant aria-label="閉じる">×</button></header>${merchantResult ? `<div class="online-merchant-receipt ${escapeOnlineHtml(merchantResult.status || "")}"><b>${merchantResult.status === "pending" ? "処理中…" : merchantResult.status === "success" ? "支援品を受け取りました" : "受け取りを完了できませんでした"}</b><span>${escapeOnlineHtml(merchantResult.status === "error" ? merchantResult.message || "もう一度お試しください。" : merchantReceipt)}</span></div>` : ""}${merchantShowOffers ? `<div class="online-rare-merchant-offers"><button type="button" data-online-merchant-offer="relic" ${state.merchantPending ? "disabled" : ""}><i>遺物</i><b>遺物装備</b><small>${number(expedition.floor) >= 300 ? "UR装備×1" : "SSR装備×1"}</small></button><button type="button" data-online-merchant-offer="crystal" ${state.merchantPending ? "disabled" : ""}><i>結晶</i><b>結晶包み</b><small>捕獲結晶×2<br>魔晶石×3</small></button><button type="button" data-online-merchant-offer="rest" ${state.merchantPending ? "disabled" : ""}><i>灯火</i><b>全快の灯</b><small>HP・MP全回復<br>捕獲結晶×1</small></button></div>` : ""}<p>受け取った支援品は自分だけに適用されます。</p></aside>`;
    const merchantPrompt = state.merchantOpen ? merchantModal : `<aside class="online-coop-interaction online-rare-merchant-call"><small>無料支援NPC・異界商人</small><button type="button" data-online-open-merchant>異界商人と話す</button></aside>`, interactionPending = Boolean(state.interactionPending && state.interactionPending.action === interaction?.action && state.interactionPending.targetId === interaction?.targetId), interactionDisabled = interactionPending || ["waitResonanceChest","waitRelayPartner","waitKeyPartner"].includes(interaction?.action);
    const prompt = state.merchantOpen && merchantResult ? merchantModal : interaction?.action === "browseRareMerchant" ? merchantPrompt : interaction ? `<aside class="online-coop-interaction"><small>${escapeOnlineHtml(interactionPending ? "通信処理が終わるまでお待ちください" : interaction.hint || "共闘アクション")}</small><button type="button" data-online-expedition-interact="${escapeOnlineHtml(interaction.action)}" data-online-interaction-target="${escapeOnlineHtml(interaction.targetId || "")}" ${interactionDisabled ? "disabled" : ""} ${interactionPending ? 'aria-busy="true"' : ""}>${escapeOnlineHtml(interactionPending ? "処理中…" : interaction.label || "調べる")}</button></aside>` : "";
    const resonance = Number(expedition.coop?.resonance?.level) || 0, ownerOffline = Number(expedition.coop?.ownerReconnectDeadline) > Date.now(), multiplayer = (room?.members?.length ?? 0) >= 2;
    const onlineStatus = multiplayer ? `<aside class="online-coop-run-status ${realmActive ? "realm" : ""}"><b>${realmActive ? "異界宝物庫" : `共鳴率 ${resonance}/5`}</b><span>${realmActive ? "番人を倒し、宝箱を開いて帰還" : `宝箱 +${resonance * 3}%・貢献度 +${resonance * 2}%`}</span>${ownerOffline ? `<em>主の復帰待ち：現階層のみ継続可</em>` : ""}</aside>` : `<aside class="online-coop-run-status solo"><b>通常探索・主の世界</b><span>協力追加なし・オフライン探索と同じ進行</span></aside>`;
    const pingMenu = `<aside class="online-ping-menu ${state.pingMenuOpen ? "open" : ""}" ${state.pingMenuOpen ? "" : "hidden"}>${[["gather","集合"],["here","こっち"],["chest","宝箱"],["switch","スイッチ"],["rescue","救助"]].map(([id,label]) => `<button type="button" data-online-ping-kind="${id}">${label}</button>`).join("")}</aside>`;
    const floorBossConfirm = state.floorBossConfirm ? `<aside class="online-floor-boss-confirm" role="dialog" aria-modal="true"><div><small>FLOOR DOMINATOR・${number(state.floorBossConfirm.floor)}F</small><h3>${escapeOnlineHtml(state.floorBossConfirm.profile?.name || "階層支配者")}</h3><p>通常探索と同じ強さの支配者です。勝利すると温泉と初回三択報酬が解放されます。</p><dl><span>Lv.${number(state.floorBossConfirm.profile?.level || state.floorBossConfirm.floor)}</span><span>HP ${number(state.floorBossConfirm.profile?.hp || 0)}</span></dl><footer><button type="button" data-online-cancel-floor-boss>いったん退く</button><button type="button" class="primary" data-online-confirm-floor-boss>支配者へ挑む</button></footer></div></aside>` : "";
    const coopBoss = state.coopBossConfirm?.boss ?? null, coopBossConfirm = coopBoss ? `<aside class="online-floor-boss-confirm online-coop-boss-confirm" style="--coop-boss-accent:${escapeOnlineHtml(coopBoss.accent || "#8fe9ff")}" role="dialog" aria-modal="true" aria-label="共闘ボスへの挑戦確認"><div><small>CO-OP BOSS・${number(state.coopBossConfirm.floor)}F</small><h3>${escapeOnlineHtml(coopBoss.name || "共鳴の強敵")}</h3><strong>${escapeOnlineHtml(coopBoss.title || "複数人限定の共鳴試練")}</strong><p>${escapeOnlineHtml(coopBoss.intro || coopBoss.mechanic?.instruction || "仲間と行動を合わせて攻略する、2人以上限定のボスです。")}</p><dl><span>${escapeOnlineHtml(coopBoss.mechanic?.name || "共鳴課題")}</span><span>${escapeOnlineHtml(coopBoss.mechanic?.shortLabel || "連携必須")}</span></dl><footer><button type="button" data-online-cancel-coop-boss>いったん退く</button><button type="button" class="primary" data-online-confirm-coop-boss>仲間と挑む</button></footer></div></aside>` : "";
    return ExploreScreen(base, { online: true, floor: expedition.floor, title: realmActive ? `異界宝物庫・${expedition.floor}階` : multiplayer ? `共闘探索・${expedition.floor}階` : `通常探索・${expedition.floor}階`, party: exploreParty(room), hudCollapsed: state.hudCollapsed, combatPower: (room.members ?? []).reduce((sum, member) => sum + Math.max(0, Number(member.profile?.power) || 0), 0), progress: Math.round(discovered / total * 100), run: { startedAt: expedition.startedAt ?? Date.now() }, stageContentHtml: `<canvas id="gameCanvas" data-online-dungeon-canvas></canvas><div class="online-shared-map" hidden>${compatibilityPlayers}</div>${onlineStatus}${prompt}${inlineChat}${pingMenu}${floorBossConfirm}${coopBossConfirm}`, stageToolsHtml: stageTools, miniMapHtml: '<canvas id="miniMap"></canvas>', navHtml: nav, className: `online-scenery-${theme.id} ${realmActive ? "online-treasure-realm" : ""}` });
  }
  return `${screenHeader("explore", "HOST WORLD EXPLORATION", "1人なら通常探索と同じ。2人以上のときだけ協力要素が加わります。")} 
    <section class="online-v3-lobby-card"><div><small>CHALLENGE FLOOR</small><label><input type="number" min="1" max="10000" value="${number(room?.selectedFloor || 1).replaceAll(",", "")}" data-online-floor><b>F</b></label><p>変更できるのはリーダーだけ。全員の準備後に出発できます。</p></div></section>
    ${readyGrid(room)}
    <div class="online-v3-ready-actions"><button type="button" data-online-ready>${memberById(room, selfId)?.ready ? "準備を解除" : "準備完了"}</button><button type="button" class="online-v3-primary" data-online-start-explore ${room?.leaderId === selfId ? "" : "disabled"}>通常探索へ出発</button></div>`;
}

export function renderOnlineRaid(room, selfId, state = {}) {
  if (state.raidReport) {
    const report = state.raidReport, rows = (report.ranking ?? []).map(entry => {
      const member = memberById(room, entry.playerId), contribution = report.raid?.contribution?.[entry.playerId] ?? entry;
      return `<article class="online-raid-report-row ${entry.playerId === selfId ? "self" : ""}"><strong>${number(entry.rank)}位</strong>${onlineAvatarVisual(member?.profile ?? {}, { className: "online-raid-report-avatar" })}<div><b>${escapeOnlineHtml(member?.profile?.displayName || "冒険者")}</b><small>貢献 ${number(entry.score)}</small></div><dl><div><dt>与ダメージ</dt><dd>${number(contribution.damage)}</dd></div><div><dt>被ダメージ</dt><dd>${number(contribution.taken)}</dd></div><div><dt>回復</dt><dd>${number(contribution.healing)}</dd></div><div><dt>MP回復</dt><dd>${number(contribution.mpHealing)}</dd></div><div><dt>蘇生</dt><dd>${number(contribution.revives)}</dd></div><div><dt>防御・補助</dt><dd>${number((contribution.guards ?? 0) + (contribution.support ?? 0))}</dd></div></dl></article>`;
    }).join("");
    const reportBoss = report.raid?.weeklyBoss?.name ?? report.raid?.name ?? "ワールドレイドボス";
    return `${screenHeader("raid", report.result === "victory" ? "WEEKLY RAID CLEAR" : "WEEKLY RAID RESULT", report.result === "victory" ? `${reportBoss}を討伐しました。次の更新まで討伐済みとして保存されます。` : "今回の戦果を記録しました。ボスの残りHPと個人貢献は次回へ引き継がれます。")}
      <section class="online-raid-report"><header><span>${report.result === "victory" ? "討伐成功" : "撤退"}</span><h3>共闘貢献票</h3></header><div>${rows || '<p class="empty">集計データがありません</p>'}</div><button type="button" data-online-close-raid-report>レイド受付へ戻る</button></section>`;
  }
  if (room?.phase === "raid" && room.raid) {
    const enemies = [room.raid.boss, ...(room.raid.minions ?? [])];
    return renderSharedBattle({ mode: "raid", room, battle: room.raid, selfId, selectedTarget: state.selectedTarget, selectedAlly: state.selectedAlly, title: room.raid.name, enemies, skillMenu: state.skillMenu, itemMenu: state.itemMenu, itemTargetMenu: state.itemTargetMenu, hpTrails: state.hpTrails });
  }
  const weekly = room?.weeklyRaid ?? {}, boss = weekly.boss ?? { id: "abyss-amalga", name: "終焉融骸・アビス＝マルガ", level: 50, maxHp: 50_000, heroAsset: "./assets/online/raid-abyss-amalgam.png", materialName: "融骸核片", contractName: "融骸幼体アマルガ", equipmentName: "終焉喰らいの大刃", circleName: "即死返鏡陣", intro: "与ダメージ・回復・蘇生・防御・補助を貢献度として集計します。" }, modifier = weekly.modifier ?? { name: "通常環境", description: "特殊ルールなし" };
  const progress = room?.raidProgress?.weekId && room.raidProgress.weekId !== weekly.weekId ? null : room?.raidProgress, completed = Boolean(progress?.completedAt), endsAt = Number(weekly.endsAt) || 0, endLabel = endsAt ? new Date(endsAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "次週";
  const materials = Math.max(0, Number(state.gameState?.onlineParty?.raidMaterials) || 0), exchangeCount = state.gameState?.onlineParty?.raidExchange ?? {};
  const exchanges = [
    [`character:${boss.id}`, 240, "今週の限定仲間", boss.contractName, Number(exchangeCount[`character:${boss.id}`] ?? (boss.id === "abyss-amalga" ? exchangeCount.character : 0)) > 0],
    [`equipment:${boss.id}`, 180, "今週の神話武器", boss.equipmentName, false],
    ...(boss.id === "abyss-amalga" ? [[`circle:${boss.id}`, 120, "限定魔法陣", boss.circleName, Number(exchangeCount[`circle:${boss.id}`] ?? exchangeCount.circle) > 0]] : []),
    ["crystals", 30, "育成資源", "魔晶石 ×100", false],
  ];
  const milestones = [5, 10, 25, 50, 75, 100].map(value => `<span class="${progress?.milestonesClaimed?.includes(value) ? "claimed" : ""}">${value}%</span>`).join("");
  return `${screenHeader("raid", "WEEKLY WORLD RAID", "毎週月曜9:00更新。部屋主の世界に残HP・累積貢献・討伐結果を保存します。")}
    <section class="online-weekly-raid-meta"><span>WEEKLY ROTATION</span><b>${endLabel}まで</b></section>
    <section class="online-v3-raid-hero" style="--raid-accent:${escapeOnlineHtml(boss.accent || "#b45cff")}"><img src="${escapeOnlineHtml(boss.heroAsset)}" alt="${escapeOnlineHtml(boss.name)}"><div><small>WORLD RAID BOSS・Lv.${number(boss.level)}</small><h3>${escapeOnlineHtml(boss.name)}</h3><p>${escapeOnlineHtml(boss.intro)}</p></div></section>
    <section class="online-weekly-rule"><i>${escapeOnlineHtml(modifier.icon || "✦")}</i><div><small>THIS WEEK'S RULE</small><b>${escapeOnlineHtml(modifier.name)}</b><p>${escapeOnlineHtml(modifier.description)}</p></div></section>
    <section class="online-v3-raid-progress ${completed ? "completed" : ""}"><header><b>${completed ? "今週の討伐完了" : "部屋主の累積討伐進行"}</b><span>${progress ? `${number(progress.attempts)}回挑戦` : "未挑戦"}</span></header>${meter("boss", progress?.hp ?? boss.maxHp, progress?.maxHp ?? boss.maxHp)}<p>${completed ? "討伐済み。次回更新時に新しいボスへ切り替わります" : progress ? `残りHP ${number(progress.hp)} / ${number(progress.maxHp)}` : `HP ${number(boss.maxHp)}・Lv.${number(boss.level)}`}</p><div class="online-raid-milestones">${milestones}</div></section>
    <section class="online-raid-exchange"><header><div><small>WEEKLY RAID EXCHANGE</small><b>レイド核片 交換所</b></div><strong>${number(materials)}<small>個</small></strong></header><div>${exchanges.map(([kind,cost,label,name,uniqueClaimed]) => `<article><span><small>${escapeOnlineHtml(label)}</small><b>${escapeOnlineHtml(name)}</b></span><button type="button" data-online-raid-exchange="${escapeOnlineHtml(kind)}" data-online-raid-cost="${cost}" ${uniqueClaimed || materials < cost || state.raidExchangePending ? "disabled" : ""}>${uniqueClaimed ? "交換済み" : state.raidExchangePending === kind ? "交換中…" : `${number(cost)}個`}</button></article>`).join("")}</div><p>限定仲間と魔法陣はボスごとに1回。武器と魔晶石は繰り返し交換できます。</p></section>
    ${readyGrid(room)}<div class="online-v3-ready-actions"><button type="button" data-online-ready ${completed ? "disabled" : ""}>${memberById(room, selfId)?.ready ? "準備を解除" : "準備完了"}</button><button type="button" class="online-v3-primary danger" data-online-start-raid ${room?.leaderId === selfId && !completed ? "" : "disabled"}>${completed ? "今週は討伐済み" : "週替わりレイド開始"}</button></div>`;
}

export function renderOnlineTeam(room, selfId, state = {}) {
  if (room?.phase === "team" && room.teamBattle) {
    const battle = room.teamBattle, self = battle.players?.find(player => player.playerId === selfId), viewingSide = self?.side ?? "sun", enemySide = viewingSide === "sun" ? "moon" : "sun";
    const enemies = (battle.players ?? []).filter(player => player.side === enemySide).map(player => ({ ...player, id: player.playerId, name: player.name, asset: null, emoji: player.fallbackEmoji }));
    const allyBattle = { ...battle, players: (battle.players ?? []).filter(player => player.side === viewingSide) };
    return renderSharedBattle({ mode: "team", room, battle: allyBattle, selfId, selectedTarget: state.selectedTarget, selectedAlly: state.selectedAlly, title: `${battle.format} チーム戦`, enemies, readOnly: !self, skillMenu: state.skillMenu, itemMenu: state.itemMenu, itemTargetMenu: state.itemTargetMenu, hpTrails: state.hpTrails });
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
