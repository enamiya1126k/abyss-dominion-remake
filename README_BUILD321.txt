ABYSS DOMINION REMAKE — Build321 UI・データ・物語調整

導入
1. Build320適用済みのゲームフォルダへ、このZIPの内容を同じ階層で上書きします。
2. index.htmlを開き直します。Build番号は build321、アプリ版は 3.1.2 です。

修正内容
- ホーム左上の侵攻タイトルを省略せず表示。狭い画面では文字サイズと改行を自動調整します。
- 「サーバーオンライン中」を画面上端中央へ移動し、小型化。資源欄・放置報酬・お知らせとの重なりを解消しました。
- パーティーから外した仲間の魔法陣を同時解除。旧データに残った控え仲間の装着名も起動時に自動修復します。
- 旧1000階層版由来のセーブへ、大幅アップデートと新ストーリーを案内する強い初期化推奨画面を追加。初期化は既存の最終確認を通し、現在データで続行した選択も保存します。
- 区画移動の長い黒い通路を、短い石床・縁取り・敷居を持つ通路へ作り直しました。移動時は次の属性区画を短く表示します。
- ミニマップを設計図風に調整。通路を太い帯へ変更し、現在区画の金枠、未探索区画の暗い輪郭と「?」、小型の現在地表示で区画の形を読みやすくしました。
- 敵カードは上部の「レア度＋名前」を維持し、カード内の重複名と物攻・魔攻・物防・魔防・速度を削除。HP・Lv・成長値・戦闘特性だけを表示します。
- 序章などのストーリー表示中は FIRST ACTION GUIDE を出さず、終了またはスキップ後に再開します。
- 魔王サイラーン、預言者リオネルを専用画像へ差し替え。両名を今後も使える再登場ストーリー専用人物として固定し、召喚・戦闘・図鑑対象から除外しました。

確認コマンド
- node --test tests/build317-home-battle-ui.test.mjs tests/build318-explore-map.test.mjs tests/build321-polish.test.mjs
- node --check src/main.js src/services/SaveService.js src/ui/screens/HomeScreen.js src/ui/screens/BattleScreen.js src/core/MagicCircleSystem.js src/core/CampaignStorySystem.js src/core/DungeonSectionSystem.js

注記
- 実機Safariそのものではなく、iPhone Safari相当の狭幅・タッチ・セーフエリア条件をCSSと静的テストで監査しています。公開後はホーム、序章、編成解除、戦闘、区画移動、ミニマップを実機で各1回ずつ開く最終確認を推奨します。
