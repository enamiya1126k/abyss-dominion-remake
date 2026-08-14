import{APP_VERSION,CONTENT_TEST_MODE,CONTENT_TEST_UNLOCK_FLOOR}from"../../core/config.js?v=2.6.1";
import{SERIAL_CODE_COUNT}from"../../core/SerialCodeSystem.js?v=2.6.1";
export function SettingsScreen(state){
  const redeemedCount=Object.keys(state.serialCodes?.redeemed??{}).length;
  return`
    <section class="screen settings-screen-v3">
      <header class="settings-hero-v3">
        <button id="backHome" aria-label="戻る">←</button>
        <div><small>ABYSS DOMINION</small><h2>設定</h2></div>
        <span class="settings-gear-v3" aria-hidden="true">⚙</span>
      </header>
      <div class="settings-page-v3">
        <div class="settings-control-card-v3">
          <div><small>BATTLE</small><b>戦闘AUTO初期値</b></div>
          <button id="toggleAuto" class="metal-toggle-v3 ${state.settings.autoBattle?"on":"off"}" aria-pressed="${state.settings.autoBattle}"><i></i><span>${state.settings.autoBattle?"ON":"OFF"}</span></button>
        </div>
        <div class="settings-control-card-v3">
          <div><small>EXPLORATION</small><b>ミニマップ初期表示</b></div>
          <button id="toggleMinimap" class="metal-toggle-v3 ${state.settings.minimapVisible?"on":"off"}" aria-pressed="${state.settings.minimapVisible}"><i></i><span>${state.settings.minimapVisible?"ON":"OFF"}</span></button>
        </div>
        <div class="settings-control-card-v3">
          <div><small>ABYSS DOMINION ORIGINAL SOUNDTRACK</small><b>BGM・効果音</b><em>場面別BGMと本作専用効果音</em></div>
          <button id="toggleAudio" class="metal-toggle-v3 ${state.settings.audioEnabled!==false?"on":"off"}" aria-pressed="${state.settings.audioEnabled!==false}"><i></i><span>${state.settings.audioEnabled!==false?"ON":"OFF"}</span></button>
        </div>
        <div class="settings-audio-mix-v3">
          <label><span><b>BGM</b><output id="musicVolumeOutput">${Math.round((state.settings.musicVolume??.28)*100)}%</output></span><input id="musicVolume" type="range" min="0" max="100" step="1" value="${Math.round((state.settings.musicVolume??.28)*100)}"></label>
          <label><span><b>SE</b><output id="sfxVolumeOutput">${Math.round((state.settings.sfxVolume??.45)*100)}%</output></span><input id="sfxVolume" type="range" min="0" max="100" step="1" value="${Math.round((state.settings.sfxVolume??.45)*100)}"></label>
        </div>
        <div class="settings-tutorial-v3"><span aria-hidden="true">📖</span><div><b>序盤チュートリアル</b><small>1〜5階の探索指南をいつでも確認</small></div><button id="openTutorialBook">指南書を開く</button></div>
        <div class="serial-code-panel settings-gm-console-v3">
          <div class="serial-code-heading"><div><small>GAME MASTER SEALED GIFT</small><h3>シリアルコード</h3></div><span>${redeemedCount}/${SERIAL_CODE_COUNT} 使用済み</span></div>
          <form id="serialCodeForm" class="serial-code-form">
            <input id="serialCodeInput" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="32" placeholder="AD-GM-XXXX-XXXX-XXXX" aria-label="シリアルコード">
            <button id="redeemSerialCode" type="submit">封印を解き、報酬を受け取る</button>
          </form>
          <small>英字の大小・ハイフンの有無は問いません。各コードは同じセーブ／端末につき1回限りです。</small>
        </div>
        <div class="serial-code-panel settings-gm-console-v3 gm-master-panel">
          <div class="serial-code-heading"><div><small>AUTHORIZED GAME MASTER</small><h3>GMコード</h3></div><span>${state.gameMaster?.claimedAt?"支援受取済み":"未使用"}</span></div>
          <form id="gameMasterCodeForm" class="serial-code-form">
            <input id="gameMasterCodeInput" type="password" autocomplete="off" maxlength="40" placeholder="GMコードを入力" aria-label="GMコード">
            <button id="redeemGameMasterCode" type="submit">GM権限を認証する</button>
          </form>
          <small>支援コードは最高到達階を変更せず、出発階層1〜9998だけを解放します。RESETコードは別経路で二重確認されます。</small>
        </div>
        ${CONTENT_TEST_MODE?`<div class="settings-test-plaque-v3"><b>TEST ACCESS ACTIVE</b><small>高難度コンテンツを${CONTENT_TEST_UNLOCK_FLOOR}階で試遊できます。正式条件の値は保持されています。</small></div>`:""}
        <div class="settings-version-plaque-v3"><small>ABYSS DOMINION</small><h3>REMAKE v${APP_VERSION}</h3><span>GDD v1.0同期 / 保存互換 / 製品モード</span></div>
        <button id="resetSave" class="settings-reset-v3">GM RESET（コード＋RESET二重確認）</button>
      </div>
    </section>
  `;
}
