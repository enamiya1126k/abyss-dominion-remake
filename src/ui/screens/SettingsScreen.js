import{APP_VERSION}from"../../core/config.js?v=1.1.0";
export function SettingsScreen(state){
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
        <div class="panel version-panel"><div><small class="muted">ABYSS DOMINION</small><h3>REMAKE v${APP_VERSION}</h3><small class="muted">99ノード深淵ツリー / 装備UI・GOLD経済改善</small></div></div>
        <button id="resetSave" class="danger" style="width:100%">セーブ初期化</button>
      </div>
    </section>
  `;
}
