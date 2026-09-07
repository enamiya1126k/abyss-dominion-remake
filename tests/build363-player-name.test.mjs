import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { PLAYER_NAME_STORAGE_KEY, readPlayerName, savePlayerName } from '../src/core/PlayerNameSystem.js';
import { PlayerNameForm } from '../src/ui/components/PlayerNameForm.js';
import { SettingsScreen } from '../src/ui/screens/SettingsScreen.js';
import { OnlinePartyController } from '../src/online/OnlinePartyClient.js';
import { ONLINE_STORAGE_KEYS } from '../src/ui/screens/OnlinePartyScreen.js';
import { SaveService } from '../src/services/SaveService.js';

function storage() {
  const data = new Map();
  globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) };
  return data;
}
function controller(state = new SaveService().state) {
  const c = Object.create(OnlinePartyController.prototype);
  c.getState = () => state; c.root = null; c.profile = null; c.selectedMonsterId = null; c.connectionReady = false;
  c._refreshProfile();
  return c;
}

test('existing identity/name is reused and a saved Japanese name survives a fresh profile', () => {
  const data = storage();
  data.set(ONLINE_STORAGE_KEYS.displayName, 'えなみ');
  data.set(ONLINE_STORAGE_KEYS.friendId, 'AD-FRIEND-ID');
  data.set(ONLINE_STORAGE_KEYS.clientKey, 'existing-key');
  assert.equal(PLAYER_NAME_STORAGE_KEY, ONLINE_STORAGE_KEYS.displayName);
  assert.equal(readPlayerName(), 'えなみ');
  const c = controller(), before = JSON.stringify(c.getState());
  assert.equal(c.setDisplayName('  魔王えなみ  ').ok, true);
  assert.equal(c.profile.displayName, '魔王えなみ');
  assert.equal(controller(c.getState()).profile.displayName, '魔王えなみ');
  assert.equal(JSON.stringify(c.getState()), before);
  assert.equal(data.get(ONLINE_STORAGE_KEYS.friendId), 'AD-FRIEND-ID');
  assert.equal(data.get(ONLINE_STORAGE_KEYS.clientKey), 'existing-key');
});

test('blank and overlong names do not overwrite the previous name; normalized bounds match the server', () => {
  storage(); savePlayerName('えなみ');
  for (const value of ['', '  \n ', '\u202e', 'あ'.repeat(17), '😀'.repeat(9)]) {
    assert.equal(savePlayerName(value).ok, false); assert.equal(readPlayerName(), 'えなみ');
  }
  assert.equal(savePlayerName('あ'.repeat(16)).ok, true);
  assert.equal(savePlayerName('😀'.repeat(8)).ok, true);
  assert.equal(readPlayerName(), '😀'.repeat(8));
  assert.equal(savePlayerName('ＡＢＣ\u202e\u0000').name, 'ABC');
  localStorage.setItem(PLAYER_NAME_STORAGE_KEY, 'あ'.repeat(15) + '😀');
  assert.equal(readPlayerName(), 'あ'.repeat(15));
});

test('failed storage reports failure without changing the live profile or queued ranking', () => {
  storage(); savePlayerName('旧名'); const c = controller();
  c.latestPowerRankingSnapshot = { displayName: '旧名', power: 123 };
  localStorage.setItem = () => { throw new Error('quota'); };
  const result = c.setDisplayName('新名');
  assert.equal(result.ok, false); assert.match(result.message, /保存できません/);
  assert.equal(c.profile.displayName, '旧名'); assert.equal(c.latestPowerRankingSnapshot.displayName, '旧名');
});

test('connected profile sends immediately; offline ranking queue and reconnect use the saved name', () => {
  storage(); savePlayerName('旧名'); const c = controller(), sent = [];
  c.connectionReady = true; c._send = (type, value) => { sent.push({ type, ...value }); return true; };
  c.latestPowerRankingSnapshot = { displayName: '旧名', power: 999, party: [] };
  assert.equal(c.setDisplayName('新名').sent, true);
  assert.equal(sent.length, 1); assert.equal(sent[0].type, 'profile'); assert.equal(sent[0].profile.displayName, '新名');
  c.connectionReady = false; assert.equal(c.setDisplayName('再接続名').sent, false);
  assert.equal(sent.length, 1); assert.equal(c.latestPowerRankingSnapshot.displayName, '再接続名');
  assert.equal(c.latestPowerRankingSnapshot.power, 999);
  c.profile = null; c._refreshProfile(); assert.equal(c.profile.displayName, '再接続名');
});

test('online drawer commits on change, not IME input, and does not leak unsaved draft on refresh', () => {
  storage(); savePlayerName('旧名'); const c = controller(), messages = [];
  const input = { value: 'へんかん', matches: selector => selector === '[data-online-display-name]' };
  c.root = { querySelector: selector => selector === '[data-online-display-name]' ? input : null };
  c.toast = message => messages.push(message);
  c._handleInput({ target: input, isComposing: true });
  c._refreshProfile(); assert.equal(c.profile.displayName, '旧名'); assert.equal(readPlayerName(), '旧名');
  input.value = '変換完了'; c._handleChange({ target: input });
  assert.equal(readPlayerName(), '変換完了'); assert.equal(c.profile.displayName, '変換完了');
  input.value = '  '; c._handleChange({ target: input });
  assert.equal(input.value, '変換完了'); assert.match(messages.at(-1), /入力してください/);
});

test('settings and ranking form escape arbitrary names, and settings exposes the editor first', () => {
  storage(); const name = '"><img>&\'';
  const html = PlayerNameForm(name);
  assert.ok(html.includes('&quot;&gt;&lt;img&gt;&amp;&#39;')); assert.ok(!html.includes('<img>'));
  const settings = SettingsScreen(new SaveService().state, { playerName: name });
  assert.ok(settings.indexOf('data-player-name-form') < settings.indexOf('id="toggleAuto"'));
  assert.ok(settings.includes('maxlength="16"')); assert.ok(settings.includes('type="submit"'));
});

test('settings/ranking shared submit handler blocks IME and invalid input, persists and publishes a valid name', () => {
  storage(); savePlayerName('旧名'); const c = controller();
  const formEvents = {}, inputEvents = {}, attrs = {};
  const status = { textContent: '', classList: { toggle() {}, remove() {} } };
  const input = { value: '', addEventListener: (type, fn) => inputEvents[type] = fn, setAttribute: (k, v) => attrs[k] = v, removeAttribute: k => delete attrs[k], focus() {}, blur() {} };
  const form = { querySelector: q => q === '[data-player-name-input]' ? input : status, addEventListener: (type, fn) => formEvents[type] = fn };
  let published = 0, refreshed = 0;
  const ctx = vm.createContext({ ensureOnlinePartyController: () => c, publishPowerRankingSnapshot: () => published++, renderCombatPowerRecordModal: () => refreshed++, document: { querySelector: () => ({ dataset: { powerRecordTab: 'ranking' } }) } });
  const source = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  vm.runInContext(source.slice(source.indexOf('function bindPlayerNameForm('), source.indexOf('function openPlayerNameEditor(')), ctx);
  ctx.bindPlayerNameForm({ querySelector: () => form });
  formEvents.submit({ preventDefault() {} }); assert.equal(published, 0); assert.equal(attrs['aria-invalid'], 'true');
  input.value = '新しい名前'; formEvents.compositionstart();
  formEvents.submit({ preventDefault() {} }); assert.equal(readPlayerName(), '旧名');
  formEvents.compositionend(); formEvents.submit({ preventDefault() {} });
  assert.equal(readPlayerName(), '新しい名前'); assert.equal(published, 1); assert.equal(refreshed, 1); assert.match(status.textContent, /オンラインに接続/);
});

test('no saved name preserves the existing monster-name default until the player chooses a name', () => {
  storage(); assert.equal(readPlayerName(''), ''); const c = controller();
  assert.equal(c.profile.displayName, c.profile.monsterName.slice(0, 16));
});
