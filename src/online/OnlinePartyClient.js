import {
  buildOnlinePartyProfile, ONLINE_STORAGE_KEYS, ensureOnlineIdentity,
} from "../ui/screens/OnlinePartyScreen.js?v=2.11.47-build212";
import {
  renderOnlineHome, renderOnlineExplore, renderOnlineRaid, renderOnlineTeam, renderOnlineChat,
} from "./OnlineViews.js?v=2.11.52-build217";
import { setMonsterVisualFrame } from "../ui/MonsterVisual.js?v=2.11.52-build217";

const ROUTES = new Set(["home", "explore", "raid", "team", "chat"]);
const DIRECTION = Object.freeze({ up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] });
const ONLINE_EXPLORE_CHAT_POSITION = "abyss-online-explore-chat-position";
const ONLINE_EXPLORE_EMOTE_POSITION = "abyss-online-explore-emote-position";
const ONLINE_HALL_EMOTE_POSITION = "abyss-online-hall-emote-position";
const HALL_POINTS = Object.freeze([
  { route: "raid", x: 18, y: 25 }, { route: "explore", x: 82, y: 25 },
  { route: "team", x: 24, y: 78 }, { route: "chat", x: 76, y: 78 },
]);

function storageGet(key, fallback = "") { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } }
function storageSet(key, value) { try { localStorage.setItem(key, String(value)); } catch {} }
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
function safeRoomId(value) { return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6); }
function safeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character]); }
function isTyping(target) { return Boolean(target?.closest?.("input,textarea,select,[contenteditable=true]")); }
function keyDirection(key) { return ({ ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" })[key] ?? null; }

function websocketUrl(input) {
  let source = String(input ?? "").trim();
  if (!source) throw new Error("PCサーバーのURLを入力してください");
  if (!/^https?:\/\//i.test(source) && !/^wss?:\/\//i.test(source)) source = `https://${source}`;
  const url = new URL(source);
  if (url.protocol === "https:") url.protocol = "wss:";
  else if (url.protocol === "http:") url.protocol = "ws:";
  if (!["ws:", "wss:"].includes(url.protocol)) throw new Error("http(s) または ws(s) のURLを入力してください");
  if (location.protocol === "https:" && url.protocol === "ws:" && !["localhost", "127.0.0.1"].includes(url.hostname)) throw new Error("HTTPS版ゲームでは https:// のトンネルURLを使ってください");
  url.pathname = "/party"; url.search = ""; url.hash = "";
  return url.toString();
}

async function copyText(value) {
  try { await navigator.clipboard.writeText(String(value)); return true; } catch {
    const node = document.createElement("textarea"); node.value = String(value); node.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(node); node.select(); const ok = document.execCommand?.("copy"); node.remove(); return Boolean(ok);
  }
}

export class OnlinePartyController {
  constructor({ getState, toast = () => {}, onReward = async () => ({ ok: false }), onBack = () => {}, onExploreCanvasMount = () => {}, onExploreCanvasUpdate = () => {}, onExploreCanvasUnmount = () => {}, onHostWorldUpdate = () => {}, onScene = () => {} } = {}) {
    const identity = ensureOnlineIdentity();
    this.getState = getState;
    this.toast = toast;
    this.onReward = onReward;
    this.onBack = onBack;
    this.onExploreCanvasMount = onExploreCanvasMount;
    this.onExploreCanvasUpdate = onExploreCanvasUpdate;
    this.onExploreCanvasUnmount = onExploreCanvasUnmount;
    this.onHostWorldUpdate = onHostWorldUpdate;
    this.onScene = onScene;
    this.selfId = identity.friendId;
    this.resumeToken = storageGet(ONLINE_STORAGE_KEYS.resumeToken);
    this.selectedMonsterId = storageGet(ONLINE_STORAGE_KEYS.monsterId);
    this.route = ROUTES.has(storageGet(ONLINE_STORAGE_KEYS.route)) ? storageGet(ONLINE_STORAGE_KEYS.route) : "home";
    this.profile = null;
    this.root = null;
    this.ws = null;
    this.roomState = null;
    this.roomId = null;
    this.mounted = false;
    this.manualClose = true;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.rewardInFlight = new Set();
    this.selectedTarget = { explore: null, raid: "juvenile-amalga", team: null };
    this.selectedAlly = { explore: this.selfId, raid: this.selfId, team: this.selfId };
    this.skillMenu = { explore: false, raid: false, team: false };
    this.itemMenu = { explore: false, raid: false, team: false };
    this.itemTargetMenu = { explore: false, raid: false, team: false };
    this.hpTrails = { explore: {}, raid: {}, team: {} };
    this.raidReport = null;
    this.expeditionReport = null;
    this.hallDestination = null;
    this.hallNearbyRoute = null;
    this.exploreCanvasMounted = false;
    this.presentationTimers = new Set();
    this.onlineHudCollapsed = false;
    this.heldDirections = new Set();
    this.path = [];
    this.lastMoveAt = 0;
    this.lastChatAt = 0;
    this.chatDraft = "";
    this.exploreChatOpen = false;
    this.rareMerchantOpen = false;
    this.merchantPending = false;
    this.merchantResult = null;
    this.merchantPendingTimer = null;
    this.interactionPending = null;
    this.interactionPendingTimer = null;
    this.chatBubbles = new Map();
    this.socialBubbles = new Map();
    this.pingMenuOpen = false;
    this.coopPings = new Map();
    this.unread = 0;
    this.clockFrame = null;
    this.moveFrame = null;
    this.bound = [];
  }

  mount(root) {
    this.unmount({ disconnect: false });
    this.root = root;
    this.mounted = true;
    this.manualClose = false;
    this._refreshProfile();
    this._bindStaticUi();
    this._setStatus("offline", "オフライン", "通常ゲームのセーブには影響しません");
    this._startLoops();
    if (storageGet(ONLINE_STORAGE_KEYS.autoConnect) === "1" && storageGet(ONLINE_STORAGE_KEYS.serverUrl) && this.resumeToken) {
      queueMicrotask(() => { if (this.mounted) this.connect({ reconnect: true }); });
    }
  }

  unmount({ disconnect = true } = {}) {
    this.mounted = false;
    this.heldDirections.clear(); this.path = [];
    this.hallDestination = null;
    this._unmountExploreCanvas();
    clearTimeout(this.interactionPendingTimer); clearTimeout(this.merchantPendingTimer);
    this.interactionPendingTimer = null; this.merchantPendingTimer = null;
    for (const timer of this.presentationTimers) clearTimeout(timer);
    this.presentationTimers.clear();
    this._removeEvents();
    if (this.clockFrame) cancelAnimationFrame(this.clockFrame);
    if (this.moveFrame) cancelAnimationFrame(this.moveFrame);
    this.clockFrame = null; this.moveFrame = null;
    this.root?.querySelector(".online-v3-screen")?.classList.remove("online-shared-gameplay-active");
    if (disconnect) this.disconnect({ leave: true, quiet: true });
    this.root = null;
  }

  _bind(target, type, handler, options) {
    if (!target) return;
    target.addEventListener(type, handler, options);
    this.bound.push([target, type, handler, options]);
  }

  _removeEvents() {
    for (const [target, type, handler, options] of this.bound) target.removeEventListener(type, handler, options);
    this.bound = [];
  }

  _query(selector) { return this.root?.querySelector(selector) ?? null; }

  _bindStaticUi() {
    this._bind(this.root, "click", event => this._handleClick(event));
    this._bind(this.root, "submit", event => this._handleSubmit(event));
    this._bind(this.root, "input", event => this._handleInput(event));
    this._bind(this.root, "keydown", event => {
      if (!event.target.matches?.("[data-online-chat-input],[data-online-explore-chat-input]") || event.key !== "Enter" || event.shiftKey || event.isComposing) return;
      event.preventDefault(); event.target.form?.requestSubmit();
    });
    this._bind(window, "keydown", event => {
      const direction = keyDirection(event.key);
      if (!direction || isTyping(event.target) || this.route !== "explore" || this.roomState?.phase !== "expedition") return;
      event.preventDefault(); this.path = []; this.heldDirections.add(direction);
    });
    this._bind(window, "keyup", event => { const direction = keyDirection(event.key); if (direction) this.heldDirections.delete(direction); });
    this._bind(this.root, "pointerdown", event => {
      const button = event.target.closest?.("[data-online-move]");
      if (!button) return;
      event.preventDefault(); this.path = []; this.heldDirections.add(button.dataset.onlineMove); button.setPointerCapture?.(event.pointerId);
    });
    this._bind(this.root, "pointerdown", event => {
      const emote = event.target.closest?.("[data-online-emote-anchor]");
      if (emote) { this._beginEmoteGesture(event, emote); return; }
      const target = event.target.closest?.("[data-enemy-target]");
      if (!target) return;
      const timer = setTimeout(() => { target.dataset.focusHold = "1"; this._send("focusTarget", { mode: this.route, targetId: target.dataset.enemyTarget }); this.toast("集中攻撃マーカーを共有しました"); }, 520);
      const cancel = () => { clearTimeout(timer); window.removeEventListener("pointerup", cancel, true); window.removeEventListener("pointercancel", cancel, true); };
      window.addEventListener("pointerup", cancel, true); window.addEventListener("pointercancel", cancel, true);
    });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) this._bind(this.root, type, event => {
      const button = event.target.closest?.("[data-online-move]"); if (button) this.heldDirections.delete(button.dataset.onlineMove);
    });
  }

  _handleClick(event) {
    const mapCell = event.target.closest?.("[data-map-x][data-map-y]");
    if (mapCell && this.route === "explore" && this.roomState?.phase === "expedition") {
      this._setDestination({ x: Number(mapCell.dataset.mapX), y: Number(mapCell.dataset.mapY) });
      return;
    }
    const hall = event.target.closest?.("[data-online-hall-stage]");
    if (hall && !event.target.closest?.("button,.online-hall-hud,.online-hall-prompt,.online-hall-party-strip")) {
      const world = hall.querySelector(".online-hall-world"), rect = world?.getBoundingClientRect();
      if (rect?.width && rect?.height) this.hallDestination = { x: clamp((event.clientX - rect.left) / rect.width * 100, 5, 95), y: clamp((event.clientY - rect.top) / rect.height * 100, 15, 96) };
      return;
    }
    const button = event.target.closest?.("button");
    if (!button) return;
    if (button.matches("[data-online-reward-close]")) { button.closest(".online-reward-receipt")?.remove(); return; }
    if (button.matches("[data-online-ping-toggle]")) { this.pingMenuOpen = !this.pingMenuOpen; this._render(); return; }
    if (button.matches("[data-online-ping-kind]")) { const kind = button.dataset.onlinePingKind; this.pingMenuOpen = false; this._send("expeditionPing", { kind }); this._render(); return; }
    if (button.matches("[data-online-chat-toggle]")) { this.exploreChatOpen = !this.exploreChatOpen; this._render(); requestAnimationFrame(() => this._query("[data-online-explore-chat-input]")?.focus()); return; }
    if (button.matches("[data-online-chat-close]")) { this.exploreChatOpen = false; this._render(); return; }
    if (button.matches("[data-online-open-merchant]")) { this.rareMerchantOpen = true; this.merchantResult = null; this._render(); return; }
    if (button.matches("[data-online-close-merchant]")) { this.rareMerchantOpen = false; this.merchantPending = false; this.merchantResult = null; clearTimeout(this.merchantPendingTimer); this._render(); return; }
    if (button.matches("[data-online-expedition-interact]")) { const action = button.dataset.onlineExpeditionInteract, targetId = button.dataset.onlineInteractionTarget; if (!this._beginInteractionPending(action, targetId)) return; if (!this._send("expeditionInteract", { action, targetId })) this._clearInteractionPending(false); this._render(); return; }
    if (button.matches("[data-online-merchant-offer]")) { if (this.merchantPending) return; const offer = button.dataset.onlineMerchantOffer; this.merchantPending = true; this.merchantResult = { offer, status: "pending" }; clearTimeout(this.merchantPendingTimer); this.merchantPendingTimer = setTimeout(() => { if (!this.merchantPending) return; this.merchantPending = false; this.merchantResult = { offer, status: "error", message: "通信結果を確認できませんでした。もう一度お試しください。" }; this._render(); }, 3500); if (!this._send("rareMerchantClaim", { offer })) { clearTimeout(this.merchantPendingTimer); this.merchantPending = false; this.merchantResult = { offer, status: "error", message: "サーバーへ接続されていません。" }; } this._render(); return; }
    if (button.matches("[data-online-battle-cheer]")) { this._send("battleCheer", { mode: button.dataset.onlineBattleCheer || this.route }); return; }
    if (button.matches("[data-online-hall-destination]")) { this.hallDestination = { x: Number(button.dataset.hallX), y: Number(button.dataset.hallY) }; return; }
    if (button.id === "backOnlineParty") { this.disconnect({ leave: true, quiet: true }); this.onBack(); return; }
    if (button.matches("[data-copy-friend-id]")) { copyText(this.selfId).then(ok => this.toast(ok ? "フレンドIDをコピーしました" : "コピーできませんでした")); return; }
    if (button.matches("[data-online-connect]")) { this.connect(); return; }
    if (button.matches("[data-online-disconnect]")) { this.disconnect(); return; }
    if (button.matches("[data-online-gate-back]")) { this.disconnect({ leave: false }); return; }
    if (button.matches("[data-online-create-room]")) { this._send("createRoom"); return; }
    if (button.matches("[data-online-leave-room]")) { this.leaveRoom(); return; }
    if (button.matches("[data-copy-room-id]")) { copyText(this.roomId).then(ok => this.toast(ok ? "ルームIDをコピーしました" : "コピーできませんでした")); return; }
    if (button.matches("[data-copy-invite]")) { this.copyInvite(); return; }
    if (button.matches("[data-online-character]")) { this._selectCharacter(button.dataset.onlineCharacter); return; }
    const nextRoute = button.dataset.onlineRoute ?? button.dataset.onlineGo;
    if (nextRoute && ROUTES.has(nextRoute)) { this._setRoute(nextRoute); return; }
    if (button.matches("[data-online-ready]")) { const self = this._self(); this._send("setReady", { ready: !self?.ready }); return; }
    if (button.matches("[data-online-start-explore]")) { this.expeditionReport = null; this._send("startExpedition", { hostWorld: this._hostWorldSnapshot() }); return; }
    if (button.matches("[data-online-return]")) { this._send("requestReturn"); return; }
    if (button.matches("[data-online-complete]")) { this._send("completeExpedition"); return; }
    if (button.matches("[data-online-start-raid]")) { this._send("startRaid"); return; }
    if (button.matches("[data-online-team-side]")) { this._send("teamSide", { side: button.dataset.onlineTeamSide }); return; }
    if (button.matches("[data-online-team-ready]")) { const self = this._self(); this._send("teamReady", { ready: !self?.teamReady }); return; }
    if (button.matches("[data-online-start-team]")) { this._send("startTeamBattle"); return; }
    if (button.matches("[data-enemy-target]")) { this._selectBattleTarget(button.dataset.enemyTarget, "enemy"); return; }
    if (button.matches("[data-online-ally-target]")) { this._selectBattleTarget(button.dataset.onlineAllyTarget, "ally"); return; }
    if (button.matches("[data-command]")) { this._battleAction(this.route, button.dataset.command); return; }
    if (button.matches("[data-skill-id]")) { this._battleAction(this.route, "skill", button.dataset.skillId); return; }
    if (button.id === "closeSkillMenu") { this.skillMenu[this.route] = false; this._render(); return; }
    if (button.matches("[data-online-battle-item]")) { this.itemMenu[this.route] = false; this.itemTargetMenu[this.route] = true; this._render(); return; }
    if (button.matches("[data-online-item-target]")) { this.selectedAlly[this.route] = button.dataset.onlineItemTarget; this.itemTargetMenu[this.route] = false; this._submitBattleAction(this.route, "item"); return; }
    if (button.id === "closeItemMenu") { this.itemMenu[this.route] = false; this._render(); return; }
    if (button.id === "closeOnlineItemTarget") { this.itemTargetMenu[this.route] = false; this.itemMenu[this.route] = true; this._render(); return; }
    if (button.matches("[data-online-close-raid-report]")) { this.raidReport = null; this._render(); return; }
    if (button.matches("[data-online-close-expedition-report]")) { this.expeditionReport = null; this._render(); return; }
    if (button.matches("[data-online-speed-cycle]")) { const mode = button.dataset.onlineSpeedCycle, current = Number(this._battle(mode)?.speed) || 1, speeds = [.5, 1, 2], speed = speeds[(speeds.indexOf(current) + 1) % speeds.length]; this._send(mode === "raid" ? "raidSpeed" : mode === "team" ? "teamSpeed" : "battleSpeed", { speed }); return; }
    if (button.matches("[data-online-center]")) { this.path = []; if (this.exploreCanvasMounted) this.onExploreCanvasUpdate(this.roomState, this.selfId, { center: true }); return; }
    if (button.matches("[data-online-party-hud-toggle]")) { this.onlineHudCollapsed = !this.onlineHudCollapsed; this._render(); return; }
    if (button.matches("[data-online-target]")) { this._selectBattleTarget(button.dataset.onlineTarget, button.dataset.onlineTargetSide); return; }
    if (button.matches("[data-online-speed]")) { const mode = button.dataset.onlineMode, speed = Number(button.dataset.onlineSpeed) || 1; this._send(mode === "raid" ? "raidSpeed" : mode === "team" ? "teamSpeed" : "battleSpeed", { speed }); return; }
    if (button.matches("[data-online-battle-action]")) { this._battleAction(button.dataset.onlineMode, button.dataset.onlineBattleAction); return; }
    if (button.matches("[data-online-battle-skill]")) { this._battleAction(button.dataset.onlineMode, "skill", button.dataset.onlineBattleSkill); return; }
    if (button.matches("[data-online-preset]")) { this._sendPreset(button.dataset.onlinePreset); return; }
  }

  _setDestination(target) {
    const expedition = this.roomState?.expedition;
    const start = this._self()?.dungeonPosition;
    const tiles = expedition?.tiles;
    if (!start || !Array.isArray(tiles) || !Number.isInteger(target?.x) || !Number.isInteger(target?.y)) return;
    const rows = tiles.length, cols = tiles[0]?.length ?? 0;
    if (target.x < 0 || target.y < 0 || target.x >= cols || target.y >= rows || tiles[target.y]?.[target.x] !== ".") return;
    const key = point => `${point.x},${point.y}`;
    const destinationKey = key(target), queue = [{ x: start.x, y: start.y }], previous = new Map([[key(start), null]]);
    for (let index = 0; index < queue.length && !previous.has(destinationKey); index++) {
      const point = queue[index];
      for (const next of [{ x: point.x + 1, y: point.y }, { x: point.x - 1, y: point.y }, { x: point.x, y: point.y + 1 }, { x: point.x, y: point.y - 1 }]) {
        const nextKey = key(next);
        if (next.x < 0 || next.y < 0 || next.x >= cols || next.y >= rows || tiles[next.y]?.[next.x] !== "." || previous.has(nextKey)) continue;
        previous.set(nextKey, point); queue.push(next);
      }
    }
    if (!previous.has(destinationKey)) { this.toast("そこへは移動できません"); return; }
    const path = [];
    for (let point = target; point && key(point) !== key(start); point = previous.get(key(point))) path.unshift(point);
    this.path = path.slice(0, 48);
  }

  _handleSubmit(event) {
    if (event.target.matches("[data-online-join-form]")) {
      event.preventDefault(); const roomId = safeRoomId(this._query("[data-online-room-code]")?.value);
      if (roomId.length !== 6) return this.toast("6文字のルームIDを入力してください");
      this._send("joinRoom", { roomId }); return;
    }
    if (event.target.matches("[data-online-chat-form]")) {
      event.preventDefault(); const input = this._query("[data-online-chat-input]");
      const text = String(input?.value ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
      if (!text) return;
      if (Date.now() - this.lastChatAt < 850) return this.toast("少し待ってから送信してください");
      if (this._send("chat", { text })) { this.lastChatAt = Date.now(); this.chatDraft = ""; input.value = ""; const count = this._query("[data-online-chat-count]"); if (count) count.textContent = "0"; }
    }
    if (event.target.matches("[data-online-explore-chat-form]")) {
      event.preventDefault(); const input = this._query("[data-online-explore-chat-input]");
      const text = String(input?.value ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
      if (!text || Date.now() - this.lastChatAt < 850) return;
      if (this._send("chat", { text })) { this.lastChatAt = Date.now(); this.chatDraft = ""; input.value = ""; input.blur(); }
    }
  }

  _handleInput(event) {
    if (event.target.matches("[data-online-room-code]")) event.target.value = safeRoomId(event.target.value);
    if (event.target.matches("[data-online-chat-input],[data-online-explore-chat-input]")) { this.chatDraft = event.target.value.slice(0, 80); const count = this._query("[data-online-chat-count]"); if (count) count.textContent = String(this.chatDraft.length); }
    if (event.target.matches("[data-online-floor]")) {
      const self = this._self(); const max = Math.max(1, Number(self?.profile?.maxFloor) || 1);
      const floor = Math.round(clamp(event.target.value, 1, max)); event.target.value = String(floor); this._send("setFloor", { floor });
    }
    if (event.target.matches("[data-online-display-name]")) {
      storageSet(ONLINE_STORAGE_KEYS.displayName, event.target.value.trim().slice(0, 16)); this._refreshProfile(); this._send("profile", { profile: this.profile });
    }
    if (event.target.matches("[data-online-server-url]")) storageSet(ONLINE_STORAGE_KEYS.serverUrl, event.target.value.trim());
  }

  _selectCharacter(monsterId) {
    this.selectedMonsterId = monsterId; storageSet(ONLINE_STORAGE_KEYS.monsterId, monsterId);
    this.root?.querySelectorAll("[data-online-character]").forEach(button => {
      const active = button.dataset.onlineCharacter === monsterId; button.classList.toggle("selected", active); button.setAttribute("aria-pressed", String(active));
    });
    this._refreshProfile(); this._send("profile", { profile: this.profile });
  }

  _refreshProfile() {
    const name = this._query("[data-online-display-name]")?.value ?? storageGet(ONLINE_STORAGE_KEYS.displayName);
    this.profile = buildOnlinePartyProfile(this.getState?.(), { monsterId: this.selectedMonsterId, displayName: name });
  }

  connect({ reconnect = false } = {}) {
    if (this.ws && [WebSocket.OPEN, WebSocket.CONNECTING].includes(this.ws.readyState)) return;
    const input = this._query("[data-online-server-url]")?.value ?? storageGet(ONLINE_STORAGE_KEYS.serverUrl);
    let url;
    try { url = websocketUrl(input); } catch (error) { this.toast(error.message); return; }
    storageSet(ONLINE_STORAGE_KEYS.serverUrl, input.trim()); this.manualClose = false;
    this._setStatus(reconnect ? "reconnecting" : "connecting", reconnect ? "再接続中…" : "接続中…", "PCサーバーへ接続しています");
    try { this.ws = new WebSocket(url); } catch (error) { this._setStatus("error", "接続できません", error.message); return; }
    this.ws.addEventListener("open", () => {
      this.reconnectAttempts = 0; this._refreshProfile();
      this._send("hello", { friendId: this.selfId, clientKey: storageGet(ONLINE_STORAGE_KEYS.clientKey), resumeToken: this.resumeToken, profile: this.profile });
    });
    this.ws.addEventListener("message", event => { try { this._handleMessage(JSON.parse(event.data)); } catch (error) { console.warn("Online message ignored", error); } });
    this.ws.addEventListener("close", () => this._handleClose());
    this.ws.addEventListener("error", () => this._setStatus("error", "通信エラー", "PCサーバーとトンネルを確認してください"));
  }

  _beginInteractionPending(action, targetId) {
    if (this.interactionPending) return false;
    const pending = { action: String(action || ""), targetId: String(targetId || ""), startedAt: Date.now() };
    this.interactionPending = pending; clearTimeout(this.interactionPendingTimer);
    this.interactionPendingTimer = setTimeout(() => { if (this.interactionPending !== pending) return; this.interactionPending = null; this.interactionPendingTimer = null; this._render(); }, 3000);
    return true;
  }

  _clearInteractionPending(render = false) {
    clearTimeout(this.interactionPendingTimer); this.interactionPendingTimer = null; this.interactionPending = null;
    if (render) this._render();
  }

  _send(type, payload = {}) {
    if (this.ws?.readyState !== WebSocket.OPEN) return false;
    this.ws.send(JSON.stringify({ type, ...payload })); return true;
  }

  _handleMessage(message) {
    if (!message || typeof message.type !== "string") return;
    if (message.type === "helloAck") {
      this.selfId = message.playerId || this.selfId; this.resumeToken = message.resumeToken || ""; storageSet(ONLINE_STORAGE_KEYS.resumeToken, this.resumeToken);
      storageSet(ONLINE_STORAGE_KEYS.autoConnect, "1");
      this._setStatus("online", "接続済み", message.resumed ? "前の部屋へ復帰しました" : "部屋を作るか、ルームIDで参加してください");
      this._showConnectionStep(message.room ? "room" : "gate");
      if (message.room) this._applyRoomState(message.room);
      else { const invited = safeRoomId(this._query("[data-online-room-code]")?.value); if (invited.length === 6) this._send("joinRoom", { roomId: invited }); }
      return;
    }
    if (message.type === "roomState") { this._applyRoomState(message.room); return; }
    if (message.type === "leftRoom") { this._clearRoom(); return; }
    if (message.type === "memberMoved") { const member = this.roomState?.members?.find(entry => entry.playerId === message.playerId); if (member && message.position) member.position = { ...message.position }; if (this.route === "home") this._updateHallPlayerDom(message.playerId); return; }
    if (message.type === "expeditionMoved") { const member = this.roomState?.members?.find(entry => entry.playerId === message.playerId); if (member && message.position) member.dungeonPosition = { ...message.position }; if (this.exploreCanvasMounted) this.onExploreCanvasUpdate(this.roomState, this.selfId); else this._render(); return; }
    if (["expeditionStarted", "expeditionFloorAdvanced"].includes(message.type) && message.room) { this._applyRoomState(message.room); return; }
    if (message.type === "battleStarted" && message.room) { this._applyRoomState(message.room); this._queueBattlePresentation("explore", message.events ?? message.room?.expedition?.battle?.lastEvents); return; }
    if (message.type === "expeditionEvent") { if (message.event?.kind === "hostChestOpened") this.onHostWorldUpdate(message.event); this._announceExpeditionEvent(message.event); return; }
    if (message.type === "expeditionPing" && message.ping?.id) { this.coopPings.set(message.ping.id, { ...message.ping }); if (this.exploreCanvasMounted) this.onExploreCanvasUpdate(this.roomState, this.selfId, { chatBubbles: this._chatBubbleSnapshot(), pings: this._pingSnapshot() }); else this._render(); return; }
    if (message.type === "battleRound" || message.type === "battleResolved") { const previous = this.roomState?.expedition?.battle; this._captureHpTrails("explore", previous, message.battle); if (this.roomState?.expedition) this.roomState.expedition.battle = message.battle; if (message.type === "battleRound") this._closeBattleMenus("explore"); this._setRoute("explore", { silent: true }); this._queueBattlePresentation("explore", message.battle?.lastEvents); return; }
    if (message.type === "expeditionEnded") { this.expeditionReport = message.summary ?? null; this.route = "explore"; this.toast(message.summary?.completed ? `共闘 ${message.summary.floor}F 踏破！` : message.summary?.reason === "defeat" ? "共闘パーティが全滅しました…" : "共闘探索から帰還しました"); this._render(); return; }
    if (message.type === "battleEnded") { this.toast(message.result === "victory" ? "共闘バトル勝利！" : "共闘パーティが全滅しました…"); return; }
    if (message.type === "raidStarted") { this.roomState = { ...(this.roomState ?? {}), phase: "raid", raid: message.raid, raidProgress: message.raid?.progress }; this._setRoute("raid", { silent: true }); this._queueBattlePresentation("raid", message.raid?.lastEvents); return; }
    if (["raidState", "raidRound", "raidResolved"].includes(message.type)) { const previous = this.roomState?.raid; this._captureHpTrails("raid", previous, message.raid); if (this.roomState) { this.roomState.phase = "raid"; this.roomState.raid = message.raid; this.roomState.raidProgress = message.raid?.progress ?? this.roomState.raidProgress; } if (message.type === "raidRound") this._closeBattleMenus("raid"); this._setRoute("raid", { silent: true }); this._queueBattlePresentation("raid", message.raid?.lastEvents); return; }
    if (message.type === "raidEnded") { if (this.roomState) { this.roomState.phase = "lobby"; this.roomState.raid = null; this.roomState.raidProgress = message.result === "victory" ? null : message.raid?.progress; } this.raidReport = { result: message.result, raid: message.raid, ranking: message.ranking ?? message.raid?.ranking ?? [] }; this.route = "raid"; this.toast(message.result === "victory" ? "レイド討伐成功！" : "敗北…ボスの残HPを保存しました"); this._render(); return; }
    if (message.type === "teamBattleStarted" || message.type === "teamBattleState" || message.type === "teamBattleRound" || message.type === "teamBattleResolved") { const previous = this.roomState?.teamBattle; this._captureHpTrails("team", previous, message.teamBattle); if (this.roomState) { this.roomState.phase = "team"; this.roomState.teamBattle = message.teamBattle; } if (message.type === "teamBattleRound") this._closeBattleMenus("team"); this._setRoute("team", { silent: true }); this._queueBattlePresentation("team", message.teamBattle?.lastEvents); return; }
    if (message.type === "teamBattleEnded") { this.toast(message.winner ? `${message.winner === "sun" ? "紅組" : "蒼組"}の勝利！` : "引き分け！"); return; }
    if (message.type === "chatMessage") { this._receiveChat(message.message); return; }
    if (message.type === "social") { this._receiveSocial(message); return; }
    if (message.type === "onlineReward") { this._receiveReward(message); return; }
    if (message.type === "error") { this._clearInteractionPending(false); if (this.merchantPending) { clearTimeout(this.merchantPendingTimer); this.merchantPending = false; this.merchantResult = { ...(this.merchantResult ?? {}), status: "error", message: message.message || "支援品を受け取れませんでした。" }; } this.toast(message.message || "オンライン処理に失敗しました"); this._render(); return; }
  }

  _exploreUiSignature(room) {
    const expedition = room?.expedition;
    if (room?.phase !== "expedition" || !expedition || expedition.battle) return "";
    const interaction = expedition.interactions?.[this.selfId] ?? null;
    const rare = expedition.coop?.rare ?? null;
    const resonance = expedition.coop?.resonance ?? null;
    return JSON.stringify({
      expedition: expedition.id ?? null,
      leader: room.leaderId ?? null,
      floor: Number(expedition.floor) || 0,
      realm: Boolean(rare?.realmActive),
      exitReached: Boolean(expedition.exitReached),
      progress: [Number(expedition.discoveries) || 0, Number(expedition.encountersCleared) || 0, Number(expedition.totalDiscoveries) || 0, Number(expedition.totalEncounters) || 0],
      interaction: interaction ? [interaction.action ?? "", interaction.targetId ?? "", interaction.label ?? "", interaction.hint ?? ""] : null,
      resonance: [Number(resonance?.level) || 0, Number(expedition.coop?.ownerReconnectDeadline) || 0],
      rare: rare ? [rare.kind ?? "", rare.id ?? "", rare.phase ?? "", rare.merchantClaims?.[this.selfId] ?? null] : null,
      members: (room.members ?? []).map(member => {
        const vitals = member.coopVitals ?? member.profile?.battleStats ?? {};
        return [member.playerId, Boolean(member.connected), Boolean(member.isLeader), Number(vitals.hp) || 0, Number(vitals.maxHp) || 0, Number(vitals.mp) || 0, Number(vitals.maxMp) || 0];
      }),
    });
  }

  _applyRoomState(room) {
    if (!room?.roomId) return;
    const previousRoom = this.roomState;
    const previousCount = this.roomState?.chatHistory?.length ?? 0;
    const hadInteractionPending = Boolean(this.interactionPending);
    const keepExploreCanvas = this.exploreCanvasMounted
      && this.route === "explore"
      && previousRoom?.phase === "expedition"
      && !previousRoom?.expedition?.battle
      && room.phase === "expedition"
      && !room.expedition?.battle
      && this._exploreUiSignature(previousRoom) === this._exploreUiSignature(room)
      && !hadInteractionPending;
    const rareKind = room?.expedition?.coop?.rare?.kind;
    const merchantClaim = rareKind === "otherworldMerchant" ? room?.expedition?.coop?.rare?.merchantClaims?.[this.selfId] : null;
    if (this.merchantPending && merchantClaim) { clearTimeout(this.merchantPendingTimer); this.merchantPendingTimer = null; this.merchantPending = false; this.merchantResult = { offer: merchantClaim, status: "success" }; }
    if (rareKind !== "otherworldMerchant") { this.rareMerchantOpen = false; this.merchantPending = false; this.merchantResult = null; clearTimeout(this.merchantPendingTimer); this.merchantPendingTimer = null; }
    this._clearInteractionPending(false);
    this.roomState = room; this.roomId = room.roomId;
    if (room?.expedition?.interactions?.[this.selfId]?.action !== "browseRareMerchant" && !this.merchantResult) this.rareMerchantOpen = false;
    if (room.phase === "expedition") this.route = "explore";
    else if (room.phase === "raid") this.route = "raid";
    else if (room.phase === "team") this.route = "team";
    if (this.route !== "chat" && (room.chatHistory?.length ?? 0) > previousCount && previousCount > 0) this.unread = Math.min(99, this.unread + (room.chatHistory.length - previousCount));
    this._showConnectionStep("room");
    if (keepExploreCanvas) {
      this.onExploreCanvasUpdate(this.roomState, this.selfId, { chatBubbles: this._chatBubbleSnapshot(), pings: this._pingSnapshot(), socialBubbles: this._socialBubbleSnapshot() });
      return;
    }
    this._render();
  }

  _self() { return this.roomState?.members?.find(member => member.playerId === this.selfId); }

  _showConnectionStep(step) {
    const changed = this.connectionStep !== step;
    this.connectionStep = step;
    const entry = this._query("[data-online-entry]"), gate = this._query("[data-online-gate]"), room = this._query("[data-online-room]");
    if (entry) entry.hidden = step !== "entry";
    if (gate) gate.hidden = step !== "gate";
    if (room) room.hidden = step !== "room";
    if (changed) requestAnimationFrame(() => { const screen = this._query(".online-v3-screen"); if (screen) screen.scrollTop = 0; });
  }

  _clearRoom() {
    this.roomState = null; this.roomId = null; this.path = []; this.heldDirections.clear(); this.unread = 0; this.rareMerchantOpen = false; this.merchantPending = false; this.merchantResult = null; clearTimeout(this.merchantPendingTimer); this.merchantPendingTimer = null; this._clearInteractionPending(false);
    this.root?.querySelector(".online-v3-screen")?.classList.remove("online-shared-gameplay-active");
    this._unmountExploreCanvas();
    this._query("[data-online-room]")?.classList.remove("online-shared-gameplay");
    this._showConnectionStep(this.ws?.readyState === WebSocket.OPEN ? "gate" : "entry");
  }

  _setStatus(kind, title, detail) {
    const node = this._query("[data-online-status]"); if (!node) return;
    node.className = `online-v3-status ${kind}`;
    const b = node.querySelector("b"), span = node.querySelector("span"); if (b) b.textContent = title; if (span) span.textContent = detail;
  }

  _setRoute(route, { silent = false } = {}) {
    if (!ROUTES.has(route)) return;
    const changed = this.route !== route;
    this.route = route; storageSet(ONLINE_STORAGE_KEYS.route, route);
    if (route === "chat") this.unread = 0;
    if (route !== "home") this.hallDestination = null;
    if (!silent) { this.path = []; this.heldDirections.clear(); }
    this._render();
    if (changed) requestAnimationFrame(() => { const stage = this._query("[data-online-stage]"); if (stage) stage.scrollTop = 0; });
  }

  _render() {
    if (!this.roomState || !this.roomId) return;
    const roomNode = this._query("[data-online-room-id]"), count = this._query("[data-online-member-count]");
    if (roomNode) roomNode.textContent = this.roomId; if (count) count.textContent = `${this.roomState.members?.length ?? 0} / 4`;
    this.root?.querySelectorAll("[data-online-route]").forEach(button => button.classList.toggle("active", button.dataset.onlineRoute === this.route));
    const unread = this._query("[data-online-unread]"); if (unread) { unread.hidden = this.unread <= 0; unread.textContent = this.unread > 9 ? "9+" : String(this.unread); }
    const stage = this._query("[data-online-stage]"); if (!stage) return;
    const gameplay = this.route === "explore" && this.roomState.phase === "expedition" || this.route === "raid" && this.roomState.phase === "raid" || this.route === "team" && this.roomState.phase === "team";
    this._query("[data-online-room]")?.classList.toggle("online-shared-gameplay", gameplay);
    this.root?.querySelector(".online-v3-screen")?.classList.toggle("online-shared-gameplay-active", gameplay);
    const canvasExplore = this.route === "explore" && this.roomState.phase === "expedition" && !this.roomState.expedition?.battle;
    if (this.exploreCanvasMounted) this._unmountExploreCanvas();
    const state = { selectedTarget: this.selectedTarget[this.route], selectedAlly: this.selectedAlly[this.route], skillMenu: this.skillMenu[this.route], itemMenu: this.itemMenu[this.route], itemTargetMenu: this.itemTargetMenu[this.route], hpTrails: this.hpTrails[this.route], raidReport: this.raidReport, expeditionReport: this.expeditionReport, exploreChatOpen: this.exploreChatOpen, merchantOpen: this.rareMerchantOpen, merchantPending: this.merchantPending, merchantResult: this.merchantResult, interactionPending: this.interactionPending, pingMenuOpen: this.pingMenuOpen, chatDraft: this.chatDraft, hudCollapsed: this.onlineHudCollapsed, gameState: this.getState?.(), socialBubbles: this._socialBubbleSnapshot(), chatBubbles: this._chatBubbleSnapshot() };
    stage.innerHTML = this.route === "explore" ? renderOnlineExplore(this.roomState, this.selfId, state)
      : this.route === "raid" ? renderOnlineRaid(this.roomState, this.selfId, state)
      : this.route === "team" ? renderOnlineTeam(this.roomState, this.selfId, state)
      : this.route === "chat" ? renderOnlineChat(this.roomState, this.selfId, this.chatDraft)
      : renderOnlineHome(this.roomState, this.selfId, state);
    if (this.route === "chat") requestAnimationFrame(() => { const log = this._query("[data-online-chat-log]"); if (log) log.scrollTop = log.scrollHeight; });
    if (this.route === "home") { this.hallNearbyRoute = this._hallNearby(this._self()?.position); requestAnimationFrame(() => this._prepareExploreEmoteAnchor()); }
    this.onScene(canvasExplore ? "explore" : gameplay ? "battle" : "home");
    if (canvasExplore) requestAnimationFrame(() => { if (!this.mounted || this.route !== "explore" || this.roomState?.expedition?.battle) return; this.exploreCanvasMounted = true; this.onExploreCanvasMount(this.roomState, this.selfId, target => this._setDestination(target), this._chatBubbleSnapshot(), this._pingSnapshot(), this._socialBubbleSnapshot()); this._bindExploreChatDrag(); });
    if (gameplay && !canvasExplore) requestAnimationFrame(() => this._decorateBattleState());
  }

  _selectBattleTarget(id, side) {
    const mode = this.route;
    if (!["explore", "raid", "team"].includes(mode)) return;
    if (side === "ally") this.selectedAlly[mode] = id; else this.selectedTarget[mode] = id;
    this._render();
  }

  _battle(mode) { return mode === "raid" ? this.roomState?.raid : mode === "team" ? this.roomState?.teamBattle : this.roomState?.expedition?.battle; }

  _battleAction(mode, kind, skillId = null) {
    const battle = this._battle(mode); if (!battle || battle.phase !== "command") return this.toast("現在は行動を選べません");
    const self = battle.players?.find(player => player.playerId === this.selfId); if (!self || self.hp <= 0) return this.toast("戦闘不能中です");
    if (kind === "skill" && !skillId) { this.skillMenu[mode] = !this.skillMenu[mode]; this._render(); return; }
    if (kind === "item") { this.skillMenu[mode] = false; this.itemMenu[mode] = true; this.itemTargetMenu[mode] = false; this._render(); return; }
    this._submitBattleAction(mode, kind, skillId);
  }

  _submitBattleAction(mode, kind, skillId = null) {
    const battle = this._battle(mode); if (!battle || battle.phase !== "command") return this.toast("現在は行動を選べません");
    const skill = this._self()?.profile?.skills?.find(entry => entry.id === skillId);
    const support = kind === "item" || kind === "skill" && skill?.kind !== "attack";
    let sent;
    if (mode === "raid") sent = this._send("raidAction", { kind, skillId, targetId: this.selectedAlly.raid || this.selfId, enemyTargetId: this.selectedTarget.raid || "abyss-amalga" });
    else if (mode === "team") sent = this._send("teamAction", { kind, skillId, targetId: support ? this.selectedAlly.team || this.selfId : this.selectedTarget.team });
    else sent = this._send("battleAction", { kind, skillId, targetId: support ? this.selectedAlly.explore || this.selfId : this.selectedTarget.explore });
    if (sent) { battle.actions ??= {}; battle.actions[this.selfId] = { kind, skillId, pending: true }; this._closeBattleMenus(mode); this._render(); }
  }

  _closeBattleMenus(mode) { this.skillMenu[mode] = false; this.itemMenu[mode] = false; this.itemTargetMenu[mode] = false; }

  _unmountExploreCanvas() { if (!this.exploreCanvasMounted) return; this.exploreCanvasMounted = false; this.onExploreCanvasUnmount(); }

  _announceExpeditionEvent(event) {
    if (!event) return;
    const actor = this.roomState?.members?.find(member => member.playerId === event.actorId)?.profile?.displayName;
    const message = event.kind === "chest" || event.kind === "bone" || event.kind === "shrine" ? `${actor || "仲間"}が、${event.message}` : event.message || event.title;
    if (message) this.toast(message);
    if (event.kind === "splitKey" && String(event.id ?? event.message ?? "").includes("key-complete")) this._playKeyFusion();
  }

  _playKeyFusion() {
    const stage = this._query(".explore-stage") ?? this._query("[data-online-stage]");
    if (!stage) return;
    stage.querySelector(".online-key-fusion-fx")?.remove();
    const fx = document.createElement("div");
    fx.className = "online-key-fusion-fx";
    fx.setAttribute("aria-live", "polite");
    fx.innerHTML = `<div class="online-key-fusion-pieces"><img class="cyan" src="./assets/online/coop/keys/key-fragment-cyan.png?v=2.11.44-build209" alt=""><img class="violet" src="./assets/online/coop/keys/key-fragment-violet.png?v=2.11.44-build209" alt=""><img class="combined" src="./assets/online/coop/keys/key-combined.png?v=2.11.44-build209" alt=""></div><strong>共鳴鍵 完成</strong><small>封印された宝物庫が開きます</small>`;
    stage.appendChild(fx);
    requestAnimationFrame(() => fx.classList.add("active"));
    const timer = setTimeout(() => { this.presentationTimers.delete(timer); fx.classList.add("leaving"); setTimeout(() => fx.remove(), 420); }, 2100);
    this.presentationTimers.add(timer);
  }

  _healthMap(mode, battle) {
    if (!battle) return new Map();
    const foes = mode === "raid" ? [battle.boss, ...(battle.minions ?? [])] : mode === "team" ? battle.players ?? [] : battle.enemies ?? [];
    return new Map([...(battle.players ?? []).map(player => [`ally:${player.playerId}`, { hp: player.hp, max: player.maxHp }]), ...foes.filter(Boolean).map(enemy => [`enemy:${enemy.id ?? enemy.playerId}`, { hp: enemy.hp, max: enemy.maxHp }])]);
  }

  _captureHpTrails(mode, previous, next) {
    const before = this._healthMap(mode, previous), after = this._healthMap(mode, next), trails = {};
    for (const [key, current] of after) { const old = before.get(key); if (!old || Number(current.hp) >= Number(old.hp)) continue; trails[key] = { from: clamp(Number(old.hp) / Math.max(1, Number(old.max)) * 100, 0, 100), startedAt: Date.now(), duration: 1500 }; }
    this.hpTrails[mode] = trails;
  }

  _queueBattlePresentation(mode, events = []) {
    for (const timer of this.presentationTimers) clearTimeout(timer);
    this.presentationTimers.clear();
    const spacing = mode === "raid" ? 760 : 560;
    for (const [index, event] of [...events].slice(-8).entries()) {
      const timer = setTimeout(() => { this.presentationTimers.delete(timer); this._playBattleEvent(event, mode); }, 140 + index * spacing);
      this.presentationTimers.add(timer);
    }
  }

  _playBattleEvent(event, mode = this.route) {
    const actorId = event?.actorId, targetId = event?.targetId;
    const actor = this._query(`#ally-${CSS.escape(String(actorId))}`) ?? this._query(`#enemy-${CSS.escape(String(actorId))}`);
    const target = event?.targetKind === "player" ? this._query(`#ally-${CSS.escape(String(targetId))}`) : this._query(`#enemy-${CSS.escape(String(targetId))}`);
    if (actor && ["damage", "enemyDamage", "signature", "heal", "mpHeal", "revive", "circleActivate"].includes(event.kind)) { setMonsterVisualFrame(actor,"attack"); actor.classList.remove("fx-lunge", "fx-skill-lunge"); void actor.offsetWidth; actor.classList.add(event.label && event.label !== "たたかう" ? "fx-skill-lunge" : "fx-lunge"); const actorSelector=actor.id?`#${CSS.escape(actor.id)}`:null;setTimeout(()=>{const current=actorSelector?this._query(actorSelector):actor;if(current&&!current.classList.contains("dead"))setMonsterVisualFrame(current,"idle")},920); }
    if (target && ["damage", "enemyDamage", "signature", "deathMirrorPhantom"].includes(event.kind) && Number(event.value) > 0) { setMonsterVisualFrame(target,"damage"); target.classList.remove("fx-hit", "fx-critical-hit"); void target.offsetWidth; target.classList.add(event.critical ? "fx-critical-hit" : "fx-hit"); const flash = document.createElement("span"); flash.className = `battle-unit-hit-flash ${event.critical ? "critical" : ""}`; target.appendChild(flash); setTimeout(() => flash.remove(), 680); const targetSelector=target.id?`#${CSS.escape(target.id)}`:null;setTimeout(()=>{const current=targetSelector?this._query(targetSelector):target;if(current&&!current.classList.contains("dead"))setMonsterVisualFrame(current,"idle")},1050); }
    if(target&&event?.kind==="ko")setMonsterVisualFrame(target,"down");
    const layer = this._query("#battleFxLayer");
    if (layer && target && (Number(event?.value) || ["miss", "guard"].includes(event?.kind))) { const layerRect = layer.getBoundingClientRect(), rect = target.getBoundingClientRect(), float = document.createElement("div"); const healing = ["heal", "mpHeal", "revive"].includes(event.kind), text = event.kind === "miss" ? "MISS" : event.kind === "guard" ? "GUARD" : `${healing ? "+" : "-"}${Math.max(0, Number(event.value) || 0).toLocaleString()}`; float.className = `floating-number ${healing ? "heal" : event.critical ? "critical" : event.kind === "enemyDamage" ? "enemy" : "damage"}`; float.textContent = text; float.style.left = `${rect.left - layerRect.left + rect.width / 2}px`; float.style.top = `${rect.top - layerRect.top + rect.height * .34}px`; layer.appendChild(float); setTimeout(() => float.remove(), 2400); }
    if (layer && event?.label && (["signature", "raidTelegraph", "revive", "effect", "buff", "link", "coopBreak", "circleActivate", "equipmentAuthority"].includes(event.kind) || event.kind === "damage" && event.label !== "たたかう")) { const title = String(event.label), detail = String(event.description || event.message || event.effectText || (event.kind === "circleActivate" ? "魔法陣 発動" : event.actorName || "共闘アクション")); const banner = document.createElement("div"); const authority = event.kind === "equipmentAuthority" || /固有|権能|反照/.test(detail); banner.className = `battle-cinematic-banner ${event.kind === "raidTelegraph" || event.kind === "coopBreak" ? "boss" : "skill"} ${title.length > 20 ? "very-long-title" : title.length > 12 ? "long-title" : ""} ${authority ? "equipment-authority" : ""}`; banner.innerHTML = `<span class="battle-banner-copy"><strong>${safeHtml(title)}</strong><small class="battle-banner-effect">${safeHtml(detail)}</small></span>`; this._query(".battle-arena")?.appendChild(banner); const hold = mode === "raid" ? 2100 : 1550; setTimeout(() => { banner.classList.add("leaving"); setTimeout(() => banner.remove(), 380); }, hold); }
  }

  _sendPreset(text) {
    const message = String(text ?? "").trim().slice(0, 80);
    if (!message || Date.now() - this.lastChatAt < 850) return;
    if (this._send("chat", { text: message })) this.lastChatAt = Date.now();
  }

  _receiveChat(message) {
    if (!message?.id || !this.roomState) return;
    this.roomState.chatHistory ??= [];
    if (!this.roomState.chatHistory.some(entry => entry.id === message.id)) this.roomState.chatHistory.push(message);
    this.roomState.chatHistory = this.roomState.chatHistory.slice(-50);
    if (this.route !== "chat") this.unread = Math.min(99, this.unread + 1);
    this.chatBubbles.set(message.playerId, { playerId: message.playerId, text: String(message.text ?? "").slice(0, 80), expiresAt: Date.now() + 6200 });
    if (this.exploreCanvasMounted) this.onExploreCanvasUpdate(this.roomState, this.selfId, { chatBubbles: this._chatBubbleSnapshot(), pings: this._pingSnapshot() });
    else if (!["explore", "raid", "team"].includes(this.route) || !this._battle(this.route)) this._render();
  }

  _rewardRows(reward = {}) {
    const labels = { gold: ["GOLD", "枚"], crystals: ["魔晶石", "個"], captureCrystals: ["捕獲結晶", "個"], raidMaterials: ["融骸核片", "個"], experience: ["経験値", ""] };
    const rows = [];
    for (const [key, [label, unit]] of Object.entries(labels)) { const value = Math.max(0, Math.floor(Number(reward?.[key]) || 0)); if (value) rows.push({ label, value: `${value.toLocaleString()}${unit}` }); }
    if (reward?.randomEquipmentRarity) rows.push({ label: "追加装備抽選", value: String(reward.randomEquipmentRarity), rarity: String(reward.randomEquipmentRarity) });
    return rows;
  }

  _showRewardReceipt(message, result = {}) {
    if (result?.duplicate) return;
    const stage = this._query(".explore-stage") ?? this._query("[data-online-stage]"); if (!stage) return;
    stage.querySelector(".online-reward-receipt")?.remove();
    const reward = message.reward ?? {}, source = message.source ?? {}, shared = source.sharedBase && typeof source.sharedBase === "object" ? source.sharedBase : reward;
    const commonRows = this._rewardRows(shared), numericKeys = ["gold", "crystals", "captureCrystals", "raidMaterials", "experience"], personalReward = {};
    for (const key of numericKeys) { const extra = Math.max(0, Number(reward?.[key] || 0) - Number(shared?.[key] || 0)); if (extra) personalReward[key] = extra; }
    if (reward?.randomEquipmentRarity && reward.randomEquipmentRarity !== shared?.randomEquipmentRarity) personalReward.randomEquipmentRarity = reward.randomEquipmentRarity;
    const personalRows = this._rewardRows(personalReward);
    if (result.equipmentName && !personalRows.some(row => row.label.includes("装備"))) personalRows.push({ label: "個別装備", value: result.equipmentName, rarity: String(reward.randomEquipmentRarity || "") });
    const rowHtml = rows => rows.length ? rows.map(row => `<li class="${row.rarity ? "rare" : ""}"><span>${safeHtml(row.label)}</span><b>${safeHtml(row.value)}</b></li>`).join("") : `<li><span>受取済み</span><b>✓</b></li>`;
    const receipt = document.createElement("aside"); receipt.className = "online-reward-receipt"; receipt.setAttribute("role", "status");
    receipt.innerHTML = `<header><span>ONLINE LOOT</span><strong>${safeHtml(source.title || "共闘戦利品")}</strong><button type="button" data-online-reward-close aria-label="閉じる">×</button></header><section><h4>全員共通</h4><ul>${rowHtml(commonRows)}</ul></section>${personalRows.length || source.personalBonus ? `<section class="personal"><h4>あなたの追加抽選${source.personalBonus ? `・${safeHtml(source.personalBonus)}` : ""}</h4><ul>${rowHtml(personalRows)}</ul></section>` : ""}`;
    stage.appendChild(receipt);
    requestAnimationFrame(() => receipt.classList.add("show"));
    const timer = setTimeout(() => { this.presentationTimers.delete(timer); receipt.classList.add("leaving"); setTimeout(() => receipt.remove(), 380); }, 7200); this.presentationTimers.add(timer);
  }

  async _receiveReward(message) {
    const id = String(message.rewardId ?? ""); if (!id || this.rewardInFlight.has(id)) return;
    this.rewardInFlight.add(id);
    try {
      const result = await this.onReward({ rewardId: id, reward: message.reward ?? {}, source: message.source ?? {} });
      if (result?.ok) { this._send("rewardAck", { rewardId: id }); if (!result.duplicate) { this.toast("オンライン報酬を受け取りました"); this._showRewardReceipt(message, result); } }
    } finally { this.rewardInFlight.delete(id); }
  }

  _startLoops() {
    const clock = () => { if (!this.mounted) return; this._updateClock(); this.clockFrame = requestAnimationFrame(clock); };
    const move = now => { if (!this.mounted) return; if (now - this.lastMoveAt >= 145) this._moveStep(now); this.moveFrame = requestAnimationFrame(move); };
    this.clockFrame = requestAnimationFrame(clock); this.moveFrame = requestAnimationFrame(move);
  }

  _updateClock() {
    for (const mode of ["explore", "raid", "team"]) {
      const node = this._query(`[data-online-countdown="${mode}"]`), battle = this._battle(mode);
      if (!node || !battle || battle.phase !== "command") continue;
      const remaining = Math.max(0, (Number(battle.deadlineAt) - Date.now()) / 1000); node.textContent = remaining.toFixed(1); node.classList.toggle("urgent", remaining <= 5);
    }
  }

  _moveStep(now) {
    if (this.route === "home" && this.roomState?.phase === "lobby") { this._moveHallStep(now); return; }
    if (this.route !== "explore" || this.roomState?.phase !== "expedition" || this.roomState?.expedition?.battle) return;
    const self = this._self(), current = self?.dungeonPosition, expedition = this.roomState.expedition;
    if (!current || Number(self?.coopVitals?.hp) <= 0) { this.path = []; this.heldDirections.clear(); return; }
    let direction = [...this.heldDirections][0], target = null;
    if (direction) { const [dx, dy] = DIRECTION[direction]; target = { x: current.x + dx, y: current.y + dy }; }
    else if (this.path.length) { target = this.path.shift(); const dx = target.x - current.x, dy = target.y - current.y; direction = dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down"; }
    if (!target || expedition.tiles?.[target.y]?.[target.x] !== ".") { if (target) this.path = []; return; }
    this.lastMoveAt = now; self.dungeonPosition = { ...target, facing: direction }; this._send("expeditionMove", { position: self.dungeonPosition }); if (this.exploreCanvasMounted) this.onExploreCanvasUpdate(this.roomState, this.selfId); else this._render();
  }

  _hostWorldSnapshot() {
    const state = this.getState?.() ?? {}, source = state.onlineParty?.hostWorld ?? {};
    const opened = source.openedChestIds && typeof source.openedChestIds === "object" ? source.openedChestIds : {};
    const soloOpened = state.player?.openedChests && typeof state.player.openedChests === "object" ? state.player.openedChests : {};
    const floors = new Set([...Object.keys(opened), ...Object.keys(soloOpened)]);
    const onlineClears = Array.isArray(state.onlineParty?.firstCoopBossClears) ? state.onlineParty.firstCoopBossClears : [];
    const bossKills = Object.entries(state.player?.bossKills ?? {}).filter(([, value]) => Number(value) > 0).map(([floor]) => Number(floor));
    const bossRewards = Object.keys(state.player?.bossRewards ?? {}).map(Number);
    return { openedChestIds: Object.fromEntries([...floors].map(floor => [String(floor), [...new Set([...(Array.isArray(opened[floor]) ? opened[floor] : []), ...(Array.isArray(soloOpened[floor]) ? soloOpened[floor] : [])].map(String).slice(0, 200))]])), defeatedBossFloors: [...new Set([...onlineClears, ...bossKills, ...bossRewards].map(Number).filter(floor => floor > 0 && floor % 10 === 0))].slice(0, 1000) };
  }

  _chatBubbleSnapshot() {
    const now = Date.now();
    for (const [id, bubble] of this.chatBubbles) if (Number(bubble.expiresAt) <= now) this.chatBubbles.delete(id);
    return [...this.chatBubbles.values()].map(bubble => ({ ...bubble }));
  }

  _pingSnapshot() {
    const now = Date.now();
    for (const [id, ping] of this.coopPings) if (Number(ping.expiresAt) <= now) this.coopPings.delete(id);
    return [...this.coopPings.values()].map(ping => ({ ...ping }));
  }

  _socialBubbleSnapshot() {
    const now = Date.now();
    for (const [id, bubble] of this.socialBubbles) if (Number(bubble.expiresAt) <= now) this.socialBubbles.delete(id);
    return [...this.socialBubbles.values()].map(bubble => ({ ...bubble }));
  }

  _receiveSocial(message) {
    const emoji = ({ wave: "👋", cheer: "✨", heart: "❤️", like: "👍", alert: "⚠️", question: "❓", surprise: "‼️", laugh: "😄", cry: "💧", clap: "👏", sparkle: "🌟" })[message.id] ?? "✨";
    this.socialBubbles.set(message.playerId, { playerId: message.playerId, emoji, id: message.id, expiresAt: Date.now() + Math.max(1800, Number(message.duration) || 2800) });
    if (this.exploreCanvasMounted) this.onExploreCanvasUpdate(this.roomState, this.selfId, { chatBubbles: this._chatBubbleSnapshot(), pings: this._pingSnapshot(), socialBubbles: this._socialBubbleSnapshot() }); else if (!["explore", "raid", "team"].includes(this.route) || !this._battle(this.route)) this._render();
  }

  _placeExploreEmote(anchor, point = null) {
    const stage = anchor?.closest?.(".explore-stage,.online-hall-world");
    if (!anchor || !stage) return null;
    const rect = anchor.getBoundingClientRect();
    const minX = 10, maxX = Math.max(minX, stage.clientWidth - rect.width - 10);
    const minY = 10, maxY = Math.max(minY, stage.clientHeight - rect.height - 14);
    const x = clamp(point?.x ?? minX, minX, maxX), y = clamp(point?.y ?? 12, minY, maxY);
    anchor.style.setProperty("left", `${x}px`, "important");
    anchor.style.setProperty("top", `${y}px`, "important");
    anchor.style.setProperty("right", "auto", "important");
    anchor.style.setProperty("bottom", "auto", "important");
    return { x, y };
  }

  _prepareExploreEmoteAnchor() {
    const anchor = this._query(".online-explore-emote,.online-hall-emote-tool");
    if (!anchor) return;
    const key = anchor.matches(".online-hall-emote-tool") ? ONLINE_HALL_EMOTE_POSITION : ONLINE_EXPLORE_EMOTE_POSITION;
    let saved = null;
    try { saved = JSON.parse(storageGet(key, "null")); } catch {}
    const placed = this._placeExploreEmote(anchor, saved);
    if (placed) storageSet(key, JSON.stringify(placed));
  }

  _beginEmoteGesture(event, anchor) {
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    const choices = [["wave", "👋"], ["cheer", "✨"], ["heart", "❤️"], ["like", "👍"], ["alert", "⚠️"], ["question", "❓"]];
    const pointerId = event.pointerId, origin = { x: event.clientX, y: event.clientY };
    const movable = anchor.matches?.(".online-explore-emote,.online-hall-emote-tool"), stage = movable ? anchor.closest(".explore-stage,.online-hall-world") : null;
    const positionKey = anchor.matches?.(".online-hall-emote-tool") ? ONLINE_HALL_EMOTE_POSITION : ONLINE_EXPLORE_EMOTE_POSITION;
    const anchorRect = anchor.getBoundingClientRect(), stageRect = stage?.getBoundingClientRect();
    const startPosition = stageRect ? { x: anchorRect.left - stageRect.left, y: anchorRect.top - stageRect.top } : null;
    let wheel = null, selected = 0, opened = false, dragging = false, wheelMoved = false, lastPosition = startPosition;
    const viewportWidth = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1), viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
    const marginX = Math.min(82, Math.max(8, viewportWidth / 2 - 4)), marginY = Math.min(82, Math.max(8, viewportHeight / 2 - 4));
    const wheelOrigin = { x: clamp(origin.x, marginX, Math.max(marginX, viewportWidth - marginX)), y: clamp(origin.y, marginY, Math.max(marginY, viewportHeight - marginY)) };
    const paintSelection = () => wheel?.querySelectorAll("i").forEach((node, index) => node.classList.toggle("selected", index === selected));
    const open = () => {
      if (dragging) return;
      opened = true; wheel = document.createElement("div"); wheel.className = "online-emote-wheel";
      wheel.style.left = `${wheelOrigin.x}px`; wheel.style.top = `${wheelOrigin.y}px`;
      wheel.innerHTML = choices.map(([id, emoji], index) => `<i data-emote-index="${index}" data-emote-id="${id}" style="--emote-angle:${index * 60 - 90}deg">${emoji}</i>`).join("");
      document.body.appendChild(wheel); paintSelection();
    };
    const timer = setTimeout(open, 360);
    const update = move => {
      if (move.pointerId != null && move.pointerId !== pointerId) return;
      const dx = move.clientX - origin.x, dy = move.clientY - origin.y;
      if (movable && startPosition && Math.hypot(dx, dy) > 8 && !dragging) { dragging = true; opened = false; clearTimeout(timer); wheel?.remove(); wheel = null; anchor.classList.add("dragging"); }
      if (dragging) { move.preventDefault?.(); lastPosition = this._placeExploreEmote(anchor, { x: startPosition.x + dx, y: startPosition.y + dy }); return; }
      if (!opened || !wheel) return;
      wheelMoved = true;
      const angle = Math.atan2(move.clientY - wheelOrigin.y, move.clientX - wheelOrigin.x) * 180 / Math.PI;
      selected = Math.round(((angle + 90 + 360) % 360) / 60) % choices.length; paintSelection();
    };
    const cleanup = () => {
      clearTimeout(timer); anchor.classList.remove("dragging");
      window.removeEventListener("pointermove", update, true); window.removeEventListener("pointerup", finish, true); window.removeEventListener("pointercancel", cancel, true); wheel?.remove();
    };
    const finish = up => {
      if (up.pointerId != null && up.pointerId !== pointerId) return;
      if (dragging && lastPosition) { storageSet(positionKey, JSON.stringify(lastPosition)); anchor.dataset.emoteSuppress = "1"; setTimeout(() => delete anchor.dataset.emoteSuppress, 0); }
      else if (opened) { if (wheelMoved) update(up); const [id] = choices[selected]; this._send("social", { kind: "emote", id }); anchor.dataset.emoteSuppress = "1"; setTimeout(() => delete anchor.dataset.emoteSuppress, 0); }
      cleanup();
    };
    const cancel = cancelEvent => { if (cancelEvent?.pointerId != null && cancelEvent.pointerId !== pointerId) return; if (dragging && lastPosition) storageSet(positionKey, JSON.stringify(lastPosition)); cleanup(); };
    window.addEventListener("pointermove", update, true); window.addEventListener("pointerup", finish, true); window.addEventListener("pointercancel", cancel, true);
  }

  _decorateBattleState() {
    const battle = this._battle(this.route), focus = battle?.focusTarget;
    if (focus && Number(focus.expiresAt) > Date.now()) this._query(`#enemy-${CSS.escape(String(focus.targetId))}`)?.classList.add("online-focus-target");
  }

  _hallNearby(position) {
    if (!position) return null;
    return HALL_POINTS.find(point => Math.hypot(point.x - Number(position.x), point.y - Number(position.y)) <= 10)?.route ?? null;
  }

  _updateHallPlayerDom(playerId) {
    const member = this.roomState?.members?.find(entry => entry.playerId === playerId), node = this._query(`[data-online-hall-player="${CSS.escape(String(playerId))}"]`);
    if (member?.position && node) { node.style.setProperty("--hall-x", `${clamp(member.position.x, 5, 95)}%`); node.style.setProperty("--hall-y", `${clamp(member.position.y, 15, 96)}%`); }
  }

  _bindExploreChatDrag() {
    this._prepareExploreEmoteAnchor();
    const button = this._query("#onlineExploreChatToggle"), stage = button?.closest(".explore-stage");
    if (!button || !stage || button.dataset.dragBound === "1") return;
    button.dataset.dragBound = "1";
    const key = ONLINE_EXPLORE_CHAT_POSITION;
    const read = () => { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; } };
    const place = point => { const rect = button.getBoundingClientRect(), safeX = 10, safeTop = 10, safeBottom = 14, x = clamp(point?.x ?? stage.clientWidth - 84, safeX, Math.max(safeX, stage.clientWidth - rect.width - safeX)), y = clamp(point?.y ?? stage.clientHeight * .58, safeTop, Math.max(safeTop, stage.clientHeight - rect.height - safeBottom)); button.style.setProperty("left", `${x}px`, "important"); button.style.setProperty("top", `${y}px`, "important"); button.style.setProperty("right", "auto", "important"); button.style.setProperty("bottom", "auto", "important"); return { x, y }; };
    requestAnimationFrame(() => place(read()));
    button.addEventListener("pointerdown", down => { if (down.button != null && down.button !== 0) return; const start = { x: down.clientX, y: down.clientY }, origin = place(read()); let moved = false; button.setPointerCapture?.(down.pointerId); const move = event => { const dx = event.clientX - start.x, dy = event.clientY - start.y; if (Math.hypot(dx, dy) > 6) moved = true; if (moved) place({ x: origin.x + dx, y: origin.y + dy }); }; const finish = event => { button.removeEventListener("pointermove", move); button.removeEventListener("pointerup", finish); button.removeEventListener("pointercancel", finish); if (moved) { const final = place({ x: origin.x + event.clientX - start.x, y: origin.y + event.clientY - start.y }); try { localStorage.setItem(key, JSON.stringify(final)); } catch {} button.dataset.dragSuppress = "1"; setTimeout(() => delete button.dataset.dragSuppress, 0); } }; button.addEventListener("pointermove", move); button.addEventListener("pointerup", finish); button.addEventListener("pointercancel", finish); });
    button.addEventListener("click", event => { if (button.dataset.dragSuppress === "1") { event.preventDefault(); event.stopImmediatePropagation(); } }, true);
  }

  _moveHallStep(now) {
    const self = this._self(), current = self?.position, destination = this.hallDestination;
    if (!current || !destination) return;
    const dx = destination.x - current.x, dy = destination.y - current.y, distance = Math.hypot(dx, dy);
    if (distance <= 1.5) { this.hallDestination = null; const nearby = this._hallNearby(current); if (nearby !== this.hallNearbyRoute) { this.hallNearbyRoute = nearby; this._render(); } return; }
    const step = Math.min(6, distance), position = { x: current.x + dx / distance * step, y: current.y + dy / distance * step, facing: Math.abs(dx) > Math.abs(dy) ? dx < 0 ? "left" : "right" : dy < 0 ? "up" : "down" };
    this.lastMoveAt = now; self.position = position; this._send("move", { position }); this._updateHallPlayerDom(this.selfId); const nearby = this._hallNearby(position); if (nearby !== this.hallNearbyRoute) { this.hallNearbyRoute = nearby; this._render(); }
  }

  _handleClose() {
    this.ws = null; this._clearInteractionPending(false); clearTimeout(this.merchantPendingTimer); this.merchantPendingTimer = null; this.merchantPending = false; if (this.manualClose) return;
    this._setStatus("reconnecting", "再接続中…", "切断中はサーバーが自動行動を担当します");
    if (!this.mounted) return;
    clearTimeout(this.reconnectTimer); const delay = Math.min(10000, 800 * Math.pow(1.7, this.reconnectAttempts++));
    this.reconnectTimer = setTimeout(() => this.connect({ reconnect: true }), delay);
  }

  disconnect({ leave = true, quiet = false } = {}) {
    clearTimeout(this.reconnectTimer); this.reconnectTimer = null; this.manualClose = true;
    storageSet(ONLINE_STORAGE_KEYS.autoConnect, "0");
    if (leave) this._send("leaveRoom");
    if (this.ws) try { this.ws.close(1000, "client disconnect"); } catch {}
    this.ws = null; this._clearRoom();
    if (!quiet) this._setStatus("offline", "オフライン", "通常ゲームのセーブには影響しません");
  }

  leaveRoom() { this._send("leaveRoom"); this._clearRoom(); this._setStatus("online", "接続済み", "別の部屋へ参加できます"); }

  async copyInvite() {
    if (!this.roomId) return;
    const source = this._query("[data-online-server-url]")?.value ?? storageGet(ONLINE_STORAGE_KEYS.serverUrl);
    const url = new URL(location.href); url.searchParams.set("partyServer", source); url.searchParams.set("partyRoom", this.roomId);
    this.toast(await copyText(url.toString()) ? "招待リンクをコピーしました" : "コピーできませんでした");
  }
}
