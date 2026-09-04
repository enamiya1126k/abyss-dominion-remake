ABYSS DOMINION REMAKE — Build322 世界観・序章・表示修正

導入
1. Build321適用済みのゲームフォルダへ、このZIPの内容を同じ階層で上書きします。
2. index.htmlを開き直します。Build番号は build322、アプリ版は 3.1.3 です。

修正内容
- 「サーバーオンライン中」を前版から8px下げ、画面上端との間隔を調整しました。
- 予言1日目を「魔王城まで残り10日」へ修正。左上タイトルは狭いiPhone画面でも一行で表示します。
- 区画間を、石床が奥へ細く続き、遠方ほど段階的に暗闇へ消える長い通路として描画し直しました。属性色の板に見える旧表示は廃止しています。
- 旧世界最後の生存者を魔王サイラーンと預言者リオネルの二人に確定しました。
- サイラーンは旧世界を新世界へ留める「玉座の楔」であり、強すぎるため離れると城が崩れ、覇気も勇者へ悟られる設定を追加しました。
- 序章を全30会話へ拡張。旧世界滅亡、新世界、四勇者の予言、百階迷宮の軍備、リオネルの潜入までを描きます。
- 序章終盤にリオネルが力・姿・記憶の一部を封じ、スライムへ変化する専用表示演出を追加しました。
- 初期スライムを「リオネル」として登録。物語専用IDと保護フラグを持たせ、逃す・一括整理・同名合成・限界突破素材の全経路から除外します。
- 旧セーブでは従来の初期個体「ぷるん」をリオネルへ安全に移行します。該当個体がない場合のみ新しいリオネルを追加し、既存の名前付きスライムは上書きしません。
- Build321までの短い序章を読了済みのセーブにも、Build322の完成版序章を一度だけ表示する版管理を追加しました。

確認コマンド
- node --test tests/build317-home-battle-ui.test.mjs tests/build318-explore-map.test.mjs tests/build321-polish.test.mjs tests/build322-world-opening.test.mjs
- node --check src/main.js src/services/SaveService.js src/ui/screens/HomeScreen.js src/core/CampaignStorySystem.js src/core/CampaignProtagonistSystem.js src/core/config.js

注記
- この配布物はBuild321へ重ねる差分ZIPです。
- 公開後は実機Safariで、ホーム上部、序章30会話、リオネルの変身、区画通路、逃す・合成画面を各1回ずつ確認してください。
