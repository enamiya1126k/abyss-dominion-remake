# ABYSS DOMINION build209 最小差し替え

## 更新内容

- 共闘限定宝箱を正面寄りの見下ろし素材へ差し替え、黒鉄／銀／金／深淵の閉・開8枚を同一寸法・同一接地点へ統一しました。
- 宝箱の外見と報酬倍率は「現在階層」と「出発時人数」の高い方で固定します。途中切断中のプレイヤーもAI代理として参加人数へ残り、格下げされません。
- 共鳴宝箱の周囲3×3マスを表示し、必要人数を「あと1人」、成立時を金色の「開封可能」で案内します。
- 近くに複数の操作対象がある場合は最寄り1件だけを表示。同距離の間は直前の対象を維持し、操作案内の切り替わりを防ぎます。
- 宝箱・仕掛け・異界商人の操作中はボタンを無効化して「処理中…」を表示。異界商人は受取品の正確な個数と結果を、探索画面から離れず確認できます。
- 開封済み宝箱は開いた姿を保持。支援済み商人は減光し「支援受取済」、解除済み封印は消去します。
- 宝箱取得、アイテム取得、商人利用、同期更新では探索カメラの位置とズームを保持。専用異界へ入るときだけ別カメラ状態へ切り替えます。
- ミニマップと探索チャットのドラッグ位置を探索枠内へ収め、画面外へ見切れないよう安全余白を追加しました。

## 差し替え対象

- `index.html`
- `README.md`
- `src/main.js`
- `src/core/config.js`
- `src/ui/MonsterVisual.js`
- `src/online/OnlinePartyClient.js`
- `src/online/OnlineViews.js`
- `src/Styles/build209.css`
- `assets/online/coop/chests/`
- `online-server/package.json`
- `online-server/package-lock.json`
- `online-server/server.js`
- `online-server/src/CoopGimmicks.js`
- `online-server/src/OnlineExpansion207.js`
- `online-server/src/RoomStore.js`
- `online-server/tests/build209-coop-polish.test.js`
- `online-server/tests/websocket-integration.test.js`
- `tests/build207-online-expansion-regression.mjs`
- `tests/build208-coop-visual-regression.mjs`
- `tests/build209-coop-polish-regression.mjs`

ゲーム側と `online-server` を同時に差し替え、サーバーを停止後に再起動してください。サーバープロトコルは `1.11.1` です。

## 確認結果

- 変更JavaScript構文：合格
- build209クライアント回帰：合格
- 共闘品質固定／AI代理／共鳴範囲／最寄り操作テスト：4/4合格
- オンラインサーバー全テスト：40/40合格
- 宝箱素材：8枚すべて128×112・RGBA PNG

画像素材の出典・採用工程・最終プロンプトは `BUILD209_IMAGE_PROMPTS.md` に記録しています。
