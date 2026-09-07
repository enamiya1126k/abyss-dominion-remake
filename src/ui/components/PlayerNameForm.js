import { PLAYER_NAME_MAX_LENGTH, readPlayerName } from "../../core/PlayerNameSystem.js?v=3.1.43-build363";

const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

export function PlayerNameForm(name = readPlayerName(), id = "settingsPlayerName") {
  return `<form class="player-name-form363" data-player-name-form>
    <header><small>PLAYER PROFILE</small><label for="${id}">プレイヤー名</label></header>
    <p id="${id}Help">ランキング・オンライン広場で表示する、あなたの名前です。</p>
    <div class="player-name-controls363"><input id="${id}" data-player-name-input type="text" value="${escape(name)}" maxlength="${PLAYER_NAME_MAX_LENGTH}" autocomplete="nickname" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-describedby="${id}Help ${id}Status"><button type="submit">名前を保存</button></div>
    <small>16文字まで・いつでも変更できます</small>
    <p id="${id}Status" data-player-name-status role="status" aria-live="polite"></p>
  </form>`;
}
