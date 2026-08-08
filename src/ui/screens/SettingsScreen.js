import{APP_VERSION,CONTENT_TEST_MODE,CONTENT_TEST_UNLOCK_FLOOR}from"../../core/config.js?v=1.8.0-gdd-v1";
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
        <div class="settings-tutorial-v3"><span aria-hidden="true">📖</span><div><b>序盤チュートリアル</b><small>1〜5階の探索指南をいつでも確認</small></div><button id="openTutorialBook">指南書を開く</button></div>
        <div class="serial-code-panel settings-gm-console-v3">
          <div class="serial-code-heading"><div><small>GAME MASTER SEALED GIFT</small><h3>シリアルコード</h3></div><span>${redeemedCount}/8 使用済み</span></div>
          <form id="serialCodeForm" class="serial-code-form">
            <input id="serialCodeInput" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="32" placeholder="AD-GM-XXXX-XXXX-XXXX" aria-label="シリアルコード">
            <button id="redeemSerialCode" type="submit">封印を解き、報酬を受け取る</button>
          </form>
          <small>英字の大小・ハイフンの有無は問いません。各コードは同じセーブ／端末につき1回限りです。</small>
        </div>
        ${CONTENT_TEST_MODE?`<div class="settings-test-plaque-v3"><b>TEST ACCESS ACTIVE</b><small>高難度コンテンツを${CONTENT_TEST_UNLOCK_FLOOR}階で試遊できます。正式条件の値は保持されています。</small></div>`:""}
        <div class="settings-version-plaque-v3"><small>ABYSS DOMINION</small><h3>REMAKE v${APP_VERSION}</h3><span>GDD v1.0同期 / 保存互換 / 製品モード</span></div>
        <button id="resetSave" class="settings-reset-v3">セーブデータを初期化</button>
      </div>
    </section>
  `;
}
