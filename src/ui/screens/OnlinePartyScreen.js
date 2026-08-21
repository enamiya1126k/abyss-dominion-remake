import { SPECIES } from "../../data/species.js?v=2.11.2-build166";
import { displayName, calculatedStats } from "../../models/Monster.js?v=2.11.2-build166";
import { monsterCombatPower, formatCombatPower } from "../../core/CombatPower.js?v=2.11.2-build166";
import { magicCircleById, equippedMagicCircle } from "../../core/MagicCircleSystem.js?v=2.11.2-build166";
import { learnedSkills, maxMp, effectiveSkillMpCost } from "../../battle/SkillSystem.js?v=2.11.2-build166";
import { signatureWeaponForMonster, signatureWeaponOwnerId } from "../../core/SignatureWeaponSystem.js?v=2.11.2-build166";
import { monsterVisual } from "../MonsterVisual.js?v=2.11.2-build166";
import { resourceHud, pixelIcon } from "../components/GameChrome.js?v=2.11.2-build166";

export const ONLINE_STORAGE_KEYS = Object.freeze({
  friendId: "abyss-dominion-online-friend-id",
  clientKey: "abyss-dominion-online-client-key",
  resumeToken: "abyss-dominion-online-resume-token",
  serverUrl: "abyss-dominion-online-server-url",
  displayName: "abyss-dominion-online-display-name",
  monsterId: "abyss-dominion-online-monster-id",
  route: "abyss-dominion-online-route",
  autoConnect: "abyss-dominion-online-auto-connect",
});

const EQUIPMENT_SLOTS = Object.freeze([
  ["weaponRight", "右手"], ["weaponLeft", "左手"], ["accessoryNeck", "首"],
  ["accessoryFinger", "指"], ["armorBody", "胴"], ["armorSupport", "補助"],
]);

export function escapeOnlineHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function storageGet(key, fallback = "") {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

function storageSet(key, value) {
  try { localStorage.setItem(key, String(value)); } catch {}
}

function randomToken(length = 8) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(length);
  globalThis.crypto?.getRandomValues?.(bytes);
  return Array.from(bytes, (value, index) => alphabet[(value || Math.floor(Math.random() * 256) + index) % alphabet.length]).join("");
}

export function ensureOnlineIdentity() {
  let friendId = storageGet(ONLINE_STORAGE_KEYS.friendId);
  let clientKey = storageGet(ONLINE_STORAGE_KEYS.clientKey);
  if (!/^AD-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(friendId)) {
    friendId = `AD-${randomToken(4)}-${randomToken(4)}`;
    storageSet(ONLINE_STORAGE_KEYS.friendId, friendId);
  }
  if (clientKey.length < 24) {
    clientKey = `${randomToken(16)}${randomToken(16)}`;
    storageSet(ONLINE_STORAGE_KEYS.clientKey, clientKey);
  }
  return { friendId, clientKey };
}

function inviteParameters() {
  try {
    const params = new URLSearchParams(location.search);
    return {
      server: params.get("partyServer") ?? "",
      room: (params.get("partyRoom") ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6),
    };
  } catch { return { server: "", room: "" }; }
}

function selectedPartyMonster(state, requestedId = null) {
  const party = (state.party ?? []).map(id => state.monsters?.find(monster => monster.id === id)).filter(Boolean);
  const savedId = requestedId || storageGet(ONLINE_STORAGE_KEYS.monsterId);
  const monster = party.find(entry => entry.id === savedId) ?? party[0] ?? state.monsters?.[0] ?? null;
  if (monster) storageSet(ONLINE_STORAGE_KEYS.monsterId, monster.id);
  return { party, monster };
}

function equipmentProfile(state, monster) {
  const items = new Map((state.equipment ?? []).map(item => [item.id, item]));
  return EQUIPMENT_SLOTS.map(([slot, label]) => {
    const item = items.get(monster?.equipment?.[slot]);
    return item ? {
      slot, label, name: item.name ?? "装備", rarity: item.rarity ?? item.displayRarity ?? "N",
      level: Math.max(1, Number(item.level) || 1), plus: Math.max(0, Number(item.plus) || 0),
      signatureOwnerId: signatureWeaponOwnerId(item),
    } : { slot, label, name: "なし", rarity: "", level: 0, plus: 0, signatureOwnerId: null };
  });
}

function onlineSkillKind(skill) {
  const type = String(skill?.type ?? "");
  if (type === "revive") return "revive";
  if (type === "allHeal") return "allHeal";
  if (type === "selfHeal" || type === "heal") return "heal";
  if (type === "mpHeal") return "mpHeal";
  if (["stance", "buff"].includes(type)) return "buff";
  return "attack";
}

function onlineSkillProfile(monster) {
  return learnedSkills(monster).slice(0, 4).map(skill => ({
    id: skill.id,
    name: skill.name ?? "スキル",
    description: skill.description ?? "特殊効果を発動",
    kind: onlineSkillKind(skill),
    mp: effectiveSkillMpCost(monster, skill),
    power: Math.max(.1, Number(skill.power) || 1),
    heal: Math.max(0, Number(skill.heal) || Number(skill.revive) || 0),
    reviveMp: Math.max(0, Number(skill.reviveMp) || 0),
    mpHeal: Math.max(0, Number(skill.mpHeal) || 0),
    hits: Math.max(1, Number(skill.hits) || 1),
    allEnemies: Boolean(skill.allEnemies || String(skill.target ?? "").includes("敵全体")),
    allAllies: Boolean(skill.allies || String(skill.target ?? "").includes("味方全体") || skill.type === "allHeal"),
    guaranteedHit: Boolean(skill.guaranteedHit),
    damageClass: skill.damageClass === "magic" ? "magic" : "physical",
    element: skill.element ?? monster.attribute ?? SPECIES[monster.speciesId]?.element ?? "neutral",
    partyShieldRate: Math.max(0, Number(skill.partyShieldRate) || 0),
    effects: (skill.effects ?? []).slice(0, 6).map(effect => ({
      kind: String(effect.kind ?? ""), value: Math.max(0, Number(effect.value) || 0),
      turns: Math.max(1, Number(effect.turns) || 1), allies: Boolean(effect.allies), enemy: Boolean(effect.enemy),
    })),
    status: skill.status ? {
      id: String(skill.status.id ?? "status"), name: String(skill.status.name ?? "状態異常"),
      chance: Math.max(0, Math.min(1, Number(skill.status.chance) || 0)),
      power: Math.max(0, Number(skill.status.power) || 0), turns: Math.max(1, Number(skill.status.turns) || 1),
    } : null,
  }));
}

export function buildOnlinePartyProfile(state, { monsterId = null, displayName: onlineName = "" } = {}) {
  const { monster } = selectedPartyMonster(state, monsterId);
  if (!monster) return {
    displayName: onlineName || "冒険者", monsterId: null, speciesId: "slime", monsterName: "未編成",
    fallbackEmoji: "？", level: 1, stars: 1, plus: 0, power: 0, maxFloor: 1, attribute: "neutral",
    circleId: "none", circleName: "魔法陣なし", circleLevel: 0, circleEffect: "none", equipment: [],
    battleStats: { hp: 100, mp: 10, atk: 10, matk: 10, def: 5, mdef: 5, spd: 10, crit: 5, evasion: 3, accuracy: 100 },
    skills: [], captureStock: 0,
  };
  const species = SPECIES[monster.speciesId] ?? {};
  const circle = equippedMagicCircle(monster, state);
  const stats = calculatedStats(monster);
  const signature = signatureWeaponForMonster(state, monster);
  return {
    displayName: String(onlineName || displayName(monster) || "冒険者").trim().slice(0, 16),
    monsterId: monster.id, speciesId: monster.speciesId, visualSpeciesId: monster.visualSpeciesId ?? null,
    endgameBossId: monster.endgameBossId ?? null, monsterName: displayName(monster), fallbackEmoji: species.emoji ?? "魔",
    level: Math.max(1, Number(monster.level) || 1), stars: Math.max(1, Number(monster.stars) || 1),
    plus: Math.max(0, Number(monster.plus) || 0), power: monsterCombatPower(monster),
    maxFloor: Math.max(1, Number(state.player?.maxFloor) || 1), attribute: monster.attribute ?? species.element ?? "neutral",
    circleId: circle.id, circleName: circle.name, circleLevel: circle.id === "none" ? 0 : Math.max(1, Number(circle.level) || 1),
    circleEffect: circle.effect ?? "none", equipment: equipmentProfile(state, monster),
    signatureResonance: signature ? {
      id: signature.definition.id, name: signature.definition.name, ownerId: signature.ownerId,
      active: signature.active, description: signature.definition.description, ...signature.definition,
    } : null,
    battleStats: {
      hp: Math.max(1, stats.hp), mp: Math.max(0, maxMp(monster)), atk: Math.max(1, stats.atk),
      matk: Math.max(1, stats.matk ?? stats.atk), def: Math.max(0, stats.def), mdef: Math.max(0, stats.mdef ?? stats.def),
      spd: Math.max(1, stats.spd), crit: Math.max(0, stats.crit), evasion: Math.max(0, stats.evasion),
      accuracy: Math.max(20, Number(stats.accuracy) || 100),
    },
    skills: onlineSkillProfile(monster), captureStock: Math.max(0, Number(state.inventory?.captureCrystals) || 0),
  };
}

export function onlineMagicCircleArt(profile, { className = "" } = {}) {
  const circle = magicCircleById(profile?.circleId);
  const source = circle?.asset ?? "./assets/magic-circles/plain.png";
  return `<span class="online-v3-circle ${className}" data-circle="${escapeOnlineHtml(circle?.id ?? "none")}" aria-hidden="true"><img src="${source}" alt=""><i></i></span>`;
}

export function onlineAvatarVisual(profile, { className = "", frame = "idle" } = {}) {
  return `<span class="online-v3-avatar ${className}">${onlineMagicCircleArt(profile)}${monsterVisual(profile, profile?.fallbackEmoji ?? "魔", { frame, className: "online-v3-avatar-monster" })}</span>`;
}

export function onlineEnemyVisual(enemy, { className = "" } = {}) {
  return monsterVisual({ speciesId: enemy?.speciesId ?? "slime", level: enemy?.level ?? 1 }, enemy?.emoji ?? "魔", {
    frame: Number(enemy?.hp) <= 0 ? "down" : "idle", className: `online-v3-enemy-monster ${className}`,
  });
}

function characterChoice(monster, selected) {
  const species = SPECIES[monster.speciesId] ?? {};
  return `<button type="button" class="online-v3-character ${monster.id === selected ? "selected" : ""}" data-online-character="${escapeOnlineHtml(monster.id)}" aria-pressed="${monster.id === selected}">
    ${monsterVisual(monster, species.emoji ?? "魔", { className: "online-v3-character-art" })}
    <span><b>${escapeOnlineHtml(displayName(monster))}</b><small>Lv.${Number(monster.level || 1).toLocaleString()}・戦力 ${formatCombatPower(monsterCombatPower(monster))}</small></span>
  </button>`;
}

export function OnlinePartyScreen(state) {
  const identity = ensureOnlineIdentity();
  const invite = inviteParameters();
  const { party, monster } = selectedPartyMonster(state);
  const defaultName = storageGet(ONLINE_STORAGE_KEYS.displayName) || (monster ? displayName(monster) : "冒険者");
  const server = invite.server || storageGet(ONLINE_STORAGE_KEYS.serverUrl);
  return `<section class="screen online-v3-screen" data-online-v3-root>
    ${resourceHud(state, { backId: "backOnlineParty", title: "オンライン", eyebrow: "ABYSS DOMINION / CO-OP" })}
    <main class="online-v3-page">
      <section class="online-v3-entry" data-online-entry>
        <header><span class="online-v3-signal"><i></i></span><div><small>HOME PC CO-OP SERVER</small><h2>仲間と同じ世界へ</h2><p>最大4人で、探索・レイド・自由チーム戦・チャットを楽しめます。</p></div></header>
        <div class="online-v3-id"><span><small>フレンドID</small><strong>${identity.friendId}</strong></span><button type="button" data-copy-friend-id>コピー</button></div>
        <label class="online-v3-field"><span>表示名</span><input type="text" maxlength="16" data-online-display-name value="${escapeOnlineHtml(defaultName)}" autocomplete="nickname"></label>
        <label class="online-v3-field"><span>サーバーURL</span><input type="url" inputmode="url" data-online-server-url value="${escapeOnlineHtml(server)}" placeholder="https://xxxxx.trycloudflare.com" autocapitalize="none"></label>
        <div class="online-v3-character-picker"><small>操作するキャラクター</small><div>${party.length ? party.map(entry => characterChoice(entry, monster?.id)).join("") : "<p>先に部隊へ1体以上編成してください。</p>"}</div></div>
        <button type="button" class="online-v3-primary" data-online-connect ${monster ? "" : "disabled"}>サーバーへ接続</button>
        <div class="online-v3-status offline" data-online-status><i></i><b>オフライン</b><span>通常ゲームのセーブには影響しません</span></div>
      </section>

      <section class="online-v3-gate" data-online-gate hidden>
        <header><button type="button" data-online-gate-back aria-label="接続設定へ戻る">←</button><div><small>ROOM ENTRANCE</small><h2>共闘する部屋へ</h2><p>新しい部屋を作るか、6文字のルームIDで参加してください。</p></div></header>
        <button type="button" class="online-v3-create" data-online-create-room><span>${pixelIcon("party")}</span><b>部屋を作成</b><small>自分がリーダーになります</small></button>
        <div class="online-v3-or"><span>または</span></div>
        <form data-online-join-form><label><span>ルームID</span><input type="text" maxlength="6" data-online-room-code value="${escapeOnlineHtml(invite.room)}" placeholder="AB12CD" autocapitalize="characters" autocomplete="off"></label><button type="submit">参加する</button></form>
        <button type="button" class="online-v3-link" data-online-disconnect>サーバーから切断</button>
      </section>

      <section class="online-v3-room" data-online-room hidden>
        <header class="online-v3-roombar">
          <div><small>ROOM</small><strong data-online-room-id>------</strong></div>
          <button type="button" data-copy-room-id>コピー</button><button type="button" data-copy-invite>招待</button>
          <span data-online-member-count>1 / 4</span><button type="button" class="danger" data-online-leave-room>退出</button>
        </header>
        <div class="online-v3-stage" data-online-stage aria-live="polite"></div>
        <nav class="online-v3-nav" aria-label="オンライン機能">
          <button type="button" data-online-route="home" class="active">${pixelIcon("home")}<b>ホーム</b></button>
          <button type="button" data-online-route="explore">${pixelIcon("dungeon")}<b>通常探索</b></button>
          <button type="button" data-online-route="raid">${pixelIcon("event")}<b>レイド</b></button>
          <button type="button" data-online-route="team">${pixelIcon("crossed-swords")}<b>チーム戦</b></button>
          <button type="button" data-online-route="chat">${pixelIcon("notice")}<b>チャット</b><i data-online-unread hidden></i></button>
        </nav>
      </section>
    </main>
  </section>`;
}
