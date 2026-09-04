ABYSS DOMINION REMAKE — Build317
ホーム・戦闘UI改修パッチ（Build316へ上書き）

導入
1. Build316適用済みのゲームフォルダへ、このZIPの内容を同じ階層で上書きします。
2. index.htmlを開き直します。Build番号は build317 です。
3. iPhone Safariで古い表示が残る場合も、Build更新時にキャッシュを自動破棄します。

変更内容
- ホーム左上の予言カード、戦力カード、左メニューをスマホ幅で別レーン化し、表示被りを解消。
- ホーム上部へ小さなサーバー状態表示を追加。
  - 緑：サーバーオンライン中
  - 赤：サーバーオフライン
  - 金：サーバー確認中
- 実際の共有WebSocket接続で状態を判定。二重接続は作成しません。
- オフライン時は「現在サーバーメンテナンス中です」をお知らせへ自動追加し、復旧時に自動撤去。
- 戦闘画面の背後に残っていた探索用AUTOボタンを戦闘中だけ完全非表示化。
- 敵カードへ名前、全レア度、Lv、強化値、属性、HP、役割、戦闘能力を追加。敵MPは非表示のままです。
- スキル選択画面を紫一色から、黒地・金罫線の簡素なコマンドパネルへ刷新。
- MP不足、クールタイム、対象、属性、効果要点を一画面で確認可能。

確認
- node --test tests/build317-home-battle-ui.test.mjs
- node --check src/main.js src/online/OnlinePartyClient.js src/ui/screens/HomeScreen.js src/ui/screens/BattleScreen.js src/core/NoticeSystem.js
