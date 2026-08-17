import {
  buildOnlinePartyProfile, ONLINE_STORAGE_KEYS, ensureOnlineIdentity,
} from "../ui/screens/OnlinePartyScreen.js?v=2.10.0-build162";
import {
  renderOnlineHome, renderOnlineExplore, renderOnlineRaid, renderOnlineTeam, renderOnlineChat,
} from "./OnlineViews.js?v=2.10.0-build162";

const ROUTES = new Set(["home", "explore", "raid", "team", "chat"]);
const DIRECTION = Object.freeze({ up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] });

function storageGet(key, fallback = "") { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } }
function storageSet(key, value) { try { localStorage.setItem(key, String(value)); } catch {} }
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
function safeRoomId(value) { return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6); }
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
  constructor({ getState, toast = () => {}, onReward = async () => ({ ok: false }), onBack = () => {} } = {}) {
    const identity = ensureOnlineIdentity();
    this.getState = getState;
    this.toast = toast;
    this.onReward = onReward;
    this.onBack = onBack;
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
    this.heldDirections = new Set();
    this.path = [];
    this.lastMoveAt = 0;
    this.lastChatAt = 0;
    this.chatDraft = "";
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
    this._removeEvents();
    if (this.clockFrame) cancelAnimationFrame(this.clockFrame);
    if (this.moveFrame) cancelAnimationFrame(this.moveFrame);
    this.clockFrame = null; this.moveFrame = null;
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
      if (!event.target.matches?.("[data-online-chat-input]") || event.key !== "Enter" || event.shiftKey || event.isComposing) return;
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
    const button = event.target.closest?.("button");
    if (!button) return;
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
    if (button.matches("[data-online-start-explore]")) { this._send("startExpedition"); return; }
    if (button.matches("[data-online-return]")) { this._send("requestReturn"); return; }
    if (button.matches("[data-online-complete]")) { this._send("completeExpedition"); return; }
    if (button.matches("[data-online-start-raid]")) { this._send("startRaid"); return; }
    if (button.matches("[data-online-team-side]")) { this._send("teamSide", { side: button.dataset.onlineTeamSide }); return; }
    if (button.matches("[data-online-team-ready]")) { const self = this._self(); this._send("teamReady", { ready: !self?.teamReady }); return; }
    if (button.matches("[data-online-start-team]")) { this._send("startTeamBattle"); return; }
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
  }

  _handleInput(event) {
    if (event.target.matches("[data-online-room-code]")) event.target.value = safeRoomId(event.target.value);
    if (event.target.matches("[data-online-chat-input]")) { this.chatDraft = event.target.value.slice(0, 80); const count = this._query("[data-online-chat-count]"); if (count) count.textContent = String(this.chatDraft.length); }
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
    if (message.type === "expeditionMoved") { const member = this.roomState?.members?.find(entry => entry.playerId === message.playerId); if (member && message.position) member.dungeonPosition = { ...message.position }; this._render(); return; }
    if (["expeditionStarted", "battleStarted", "expeditionFloorAdvanced"].includes(message.type) && message.room) { this._applyRoomState(message.room); return; }
    if (message.type === "battleRound" || message.type === "battleResolved") { if (this.roomState?.expedition) this.roomState.expedition.battle = message.battle; this._setRoute("explore", { silent: true }); this._render(); return; }
    if (message.type === "expeditionEnded") { this.toast(message.summary?.completed ? `共闘 ${message.summary.floor}F 踏破！` : message.summary?.reason === "defeat" ? "共闘パーティが全滅しました…" : "共闘探索から帰還しました"); return; }
    if (message.type === "battleEnded") { this.toast(message.result === "victory" ? "共闘バトル勝利！" : "共闘パーティが全滅しました…"); return; }
    if (message.type === "raidStarted") { this.roomState = { ...(this.roomState ?? {}), phase: "raid", raid: message.raid, raidProgress: message.raid?.progress }; this._setRoute("raid", { silent: true }); this._render(); return; }
    if (["raidState", "raidRound", "raidResolved"].includes(message.type)) { if (this.roomState) { this.roomState.phase = "raid"; this.roomState.raid = message.raid; this.roomState.raidProgress = message.raid?.progress ?? this.roomState.raidProgress; } this._setRoute("raid", { silent: true }); this._render(); return; }
    if (message.type === "raidEnded") { if (this.roomState) this.roomState.raidProgress = message.result === "victory" ? null : message.raid?.progress; this.toast(message.result === "victory" ? "レイド討伐成功！" : "敗北…ボスの残HPを保存しました"); return; }
    if (message.type === "teamBattleStarted" || message.type === "teamBattleState" || message.type === "teamBattleRound" || message.type === "teamBattleResolved") { if (this.roomState) { this.roomState.phase = "team"; this.roomState.teamBattle = message.teamBattle; } this._setRoute("team", { silent: true }); this._render(); return; }
    if (message.type === "teamBattleEnded") { this.toast(message.winner ? `${message.winner === "sun" ? "紅組" : "蒼組"}の勝利！` : "引き分け！"); return; }
    if (message.type === "chatMessage") { this._receiveChat(message.message); return; }
    if (message.type === "onlineReward") { this._receiveReward(message); return; }
    if (message.type === "error") { this.toast(message.message || "オンライン処理に失敗しました"); return; }
  }

  _applyRoomState(room) {
    if (!room?.roomId) return;
    const previousCount = this.roomState?.chatHistory?.length ?? 0;
    this.roomState = room; this.roomId = room.roomId;
    if (room.phase === "expedition") this.route = "explore";
    else if (room.phase === "raid") this.route = "raid";
    else if (room.phase === "team") this.route = "team";
    if (this.route !== "chat" && (room.chatHistory?.length ?? 0) > previousCount && previousCount > 0) this.unread = Math.min(99, this.unread + (room.chatHistory.length - previousCount));
    this._showConnectionStep("room"); this._render();
  }

  _self() { return this.roomState?.members?.find(member => member.playerId === this.selfId); }

  _showConnectionStep(step) {
    const entry = this._query("[data-online-entry]"), gate = this._query("[data-online-gate]"), room = this._query("[data-online-room]");
    if (entry) entry.hidden = step !== "entry";
    if (gate) gate.hidden = step !== "gate";
    if (room) room.hidden = step !== "room";
  }

  _clearRoom() {
    this.roomState = null; this.roomId = null; this.path = []; this.heldDirections.clear(); this.unread = 0;
    this._showConnectionStep(this.ws?.readyState === WebSocket.OPEN ? "gate" : "entry");
  }

  _setStatus(kind, title, detail) {
    const node = this._query("[data-online-status]"); if (!node) return;
    node.className = `online-v3-status ${kind}`;
    const b = node.querySelector("b"), span = node.querySelector("span"); if (b) b.textContent = title; if (span) span.textContent = detail;
  }

  _setRoute(route, { silent = false } = {}) {
    if (!ROUTES.has(route)) return;
    this.route = route; storageSet(ONLINE_STORAGE_KEYS.route, route);
    if (route === "chat") this.unread = 0;
    if (!silent) { this.path = []; this.heldDirections.clear(); }
    this._render();
  }

  _render() {
    if (!this.roomState || !this.roomId) return;
    const roomNode = this._query("[data-online-room-id]"), count = this._query("[data-online-member-count]");
    if (roomNode) roomNode.textContent = this.roomId; if (count) count.textContent = `${this.roomState.members?.length ?? 0} / 4`;
    this.root?.querySelectorAll("[data-online-route]").forEach(button => button.classList.toggle("active", button.dataset.onlineRoute === this.route));
    const unread = this._query("[data-online-unread]"); if (unread) { unread.hidden = this.unread <= 0; unread.textContent = this.unread > 9 ? "9+" : String(this.unread); }
    const stage = this._query("[data-online-stage]"); if (!stage) return;
    const state = { selectedTarget: this.selectedTarget[this.route], selectedAlly: this.selectedAlly[this.route] };
    stage.innerHTML = this.route === "explore" ? renderOnlineExplore(this.roomState, this.selfId, state)
      : this.route === "raid" ? renderOnlineRaid(this.roomState, this.selfId, state)
      : this.route === "team" ? renderOnlineTeam(this.roomState, this.selfId, state)
      : this.route === "chat" ? renderOnlineChat(this.roomState, this.selfId, this.chatDraft)
      : renderOnlineHome(this.roomState, this.selfId);
    if (this.route === "chat") requestAnimationFrame(() => { const log = this._query("[data-online-chat-log]"); if (log) log.scrollTop = log.scrollHeight; });
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
    if (kind === "skill" && !skillId) { const panel = this._query("[data-online-skills]"); if (panel) panel.hidden = !panel.hidden; return; }
    const skill = this._self()?.profile?.skills?.find(entry => entry.id === skillId);
    const support = kind === "item" || kind === "skill" && skill?.kind !== "attack";
    if (mode === "raid") this._send("raidAction", { kind, skillId, targetId: this.selectedAlly.raid || this.selfId, enemyTargetId: this.selectedTarget.raid || "abyss-amalga" });
    else if (mode === "team") this._send("teamAction", { kind, skillId, targetId: support ? this.selectedAlly.team || this.selfId : this.selectedTarget.team });
    else this._send("battleAction", { kind, skillId, targetId: support ? this.selectedAlly.explore || this.selfId : this.selectedTarget.explore });
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
    this._render();
  }

  async _receiveReward(message) {
    const id = String(message.rewardId ?? ""); if (!id || this.rewardInFlight.has(id)) return;
    this.rewardInFlight.add(id);
    try {
      const result = await this.onReward({ rewardId: id, reward: message.reward ?? {}, source: message.source ?? {} });
      if (result?.ok) { this._send("rewardAck", { rewardId: id }); if (!result.duplicate) this.toast("オンライン報酬を受け取りました"); }
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
    if (this.route !== "explore" || this.roomState?.phase !== "expedition" || this.roomState?.expedition?.battle) return;
    const self = this._self(), current = self?.dungeonPosition, expedition = this.roomState.expedition;
    if (!current) return;
    let direction = [...this.heldDirections][0], target = null;
    if (direction) { const [dx, dy] = DIRECTION[direction]; target = { x: current.x + dx, y: current.y + dy }; }
    else if (this.path.length) { target = this.path.shift(); const dx = target.x - current.x, dy = target.y - current.y; direction = dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down"; }
    if (!target || expedition.tiles?.[target.y]?.[target.x] !== ".") { if (target) this.path = []; return; }
    this.lastMoveAt = now; self.dungeonPosition = { ...target, facing: direction }; this._send("expeditionMove", { position: self.dungeonPosition }); this._render();
  }

  _handleClose() {
    this.ws = null; if (this.manualClose) return;
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
