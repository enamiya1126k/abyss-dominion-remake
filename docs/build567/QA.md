# Build567 検証記録

## 自動テスト

`tests.tap`: 93件成功、0失敗。新しい縦スライド14件と、クレーン・ホッケー・カート等の回帰79件。

`legacy-tests.tap`: 81件成功、0失敗。旧ルームのタップ操作、負点、まな板から床までの破損、収穫量、結果画面、再戦、復元。

旧入力のコーディネーターテストは明示的に pre-Build567 の保存ルームを使用します。新規ルームのバージョン制約と旧タップ拒否は `build567-wire.test.mjs` で別途検証しています。

## ブラウザー

Chromium 153.0.8010.0。ゲームの本番 View / Rules / Gesture / Scene を使用。外側のパーティー参加者選択だけプレビュー用の表示へ置き換え、本番コーディネーターは別の実WebSocketテストで検証しました。

390×740、320×568、横740×390で画面のはみ出しなし。指を途中まで下げると包丁が追従し、下まで切り終えるまでは得点しません。下げたままの保持、タップ、同じ下矢印の繰り返しでは追加得点が入りません。↑/↓、タッチキャンセル、2本指、PointerEventのない環境、切断、動きを減らす設定も確認しています。

4倍CPUスローダウン、最大40破片、100フレームの測定では、描画と画面更新の処理時間は平均3.91ms、95パーセンタイル6.80ms。フレーム間隔は平均29.58ms、95パーセンタイル49.20msです。共有実行環境のヘッドレスブラウザーでの測定値で、実端末のフレームレートや電池消費を示すものではありません。実機iPhone/Safariは未確認です。

破片は得点・対戦状態から独立した表示処理です。最大40個、静止後の物理更新省略、9秒で破棄、負荷が高いと24個・DPR上限1.25へ自動軽量化。通常のDPR上限は2です。粒子同士の衝突計算を持たず、各粒子とまな板を独立に計算します。

## 再現

Node 24、Playwright、Chromium で検証しました。部分パッチ環境では本体のデータ・既存アセットも配置してください。

```sh
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node --test --test-concurrency=2 tests/build567-*.test.mjs
QA_CHROMIUM=/path/to/chromium QA_FONT=/path/to/NotoSansJP.ttf node tools/build567/browser.mjs
QA_CHROMIUM=/path/to/chromium QA_FONT=/path/to/NotoSansJP.ttf node tools/build567/capture.mjs
```

`chromium-browser.json` が画面寸法、入力チェック、通信フィールド、負荷測定の原本です。GIF は本番のタッチ操作を撮影した120フレームのプレビューです。
