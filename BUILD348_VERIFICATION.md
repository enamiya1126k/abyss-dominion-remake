# Build348 検証記録

## 実行済み

```sh
node --experimental-vm-modules --test tests/build348-hero-alliance.test.mjs tests/build348-story.test.mjs tests/build340-story-continuity.test.mjs online-server/tests/build248-raid-roster-integrity.test.js online-server/tests/build249-auto-heal-and-mimic.test.js
node tests/build348-tengod-comparison.mjs
```

- 対象テスト46件成功。追加19件と既存27件。
- 16固有技の敵味方一致、MP/CT、4/9/16行動、70%追撃、過剰回復、復活封印、踏みとどまり、再開、実オンライン各モードの入口を検証。
- 4人別の逃走/交戦/新規負傷/古傷/撃退/履歴再生を検証。
- 既存ストーリーテストは384通りの遭遇後分岐や16通りの生存編成を含む。
- 全210通りの十神4人編成に勇者側勝利。1編成につき1シード、全て1ラウンドで決着。戦闘のアクション/ラウンドは TeamBattleCoordinator の実装を使用。試行条件は README に記載。
- 差し替え対象JavaScriptの構文、ローカルimportの解決、ZIP展開とハッシュを確認。

## 実行環境と範囲

Node.js v24.19.0。ブラウザ版の保存/再開関数およびダメージ接続はVMへ実コードを読み込んで実行。
実ブラウザでの描画、Safari実機、ライブのサーバー/複数端末接続は未確認。

追加で実行した古い Build324/Build244 のテストには4件の失敗があります。変更前のBuild347でも同じ4件が失敗することを比較確認済みです。
Build324のテスト用ローダーが後から追加されたCampaignHeroPursuitSystemのimportに対応しない1件と、Build244の旧探索進行条件に関する3件です。今回の対象テスト46件とは分けて記録しています。

## 配布形態

既存Build345/346/347への累積差し替え。Build347で修正した固有スキル接続と画面/保存関連ファイルを含みます。
新しい実装一覧/READMEを優先してください。旧ビルド番号や旧数値に固定された過去のテストは、現在の仕様の合否判定には使用しません。
