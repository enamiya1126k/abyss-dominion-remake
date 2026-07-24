import{APP_VERSION}from"../../core/config.js?v=1.7.0";
export function SettingsScreen(state){
  const redeemedCount=Object.keys(state.serialCodes?.redeemed??{}).length;
  return`
    <section class="screen">
      <header class="topbar">
        <button id="backHome">←</button>
        <h2>設定</h2>
        <span></span>
      </header>
      <div class="page">
        <div class="panel">
          <div class="spread">
            <span>戦闘AUTO初期値</span>
            <button id="toggleAuto">${state.settings.autoBattle?"ON":"OFF"}</button>
          </div>
        </div>
        <div class="panel">
          <div class="spread">
            <span>ミニマップ初期表示</span>
            <button id="toggleMinimap">${state.settings.minimapVisible?"ON":"OFF"}</button>
          </div>
        </div>
        <div class="panel"><div class="spread"><div><span>序盤チュートリアル</span><small class="muted" style="display:block">1〜5階の説明をいつでも確認</small></div><button id="openTutorialBook">一覧を見る</button></div></div>
        <div class="panel serial-code-panel">
          <div class="serial-code-heading"><div><small>GAME MASTER GIFT</small><h3>シリアルコード</h3></div><span>${redeemedCount}/8 使用済み</span></div>
          <form id="serialCodeForm" class="serial-code-form">
            <input id="serialCodeInput" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="32" placeholder="AD-GM-XXXX-XXXX-XXXX" aria-label="シリアルコード">
            <button id="redeemSerialCode" type="submit">報酬を受け取る</button>
          </form>
          <small class="muted">英字の大小・ハイフンの有無は問いません。各コードは同じセーブ／端末につき1回限りです。</small>
        </div>
        <div class="panel version-panel"><div><small class="muted">ABYSS DOMINION</small><h3>REMAKE v${APP_VERSION}</h3><small class="muted">ピクセル魔物対応 / GMシリアルコード / 捕獲結晶常設販売</small></div></div>
        <button id="resetSave" class="danger" style="width:100%">セーブ初期化</button>
      </div>
    </section>
  `;
}
