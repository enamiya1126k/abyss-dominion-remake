# Build568 検証記録

## 自動テスト

`tests.tap`：86件成功、失敗0。新規11件に加え、ホッケー・パーティー通信・キャッシュ・クレーン・キャベツ・カートの関連回帰を実行した。

視点変換の往復、3縦横比での斜め入力、両チームの上下左右、発射矢印とサーバー速度の一致、微小入力、発射間隔・重複・旧クライアント拒否を確認した。パックとキャラの反発を分け、中央線からの反射が自ゴールへつながる再現条件を両チームで検証した。実際のパーティーメニュー関数が新版を許可し、旧版を止めることも確認した。

4本の実WebSocketでサーバーの入力キュー・個別フレーム・切断からのAI引き継ぎを確認した。パス強化200回、2倍速、極端な強化状態でのすり抜け対策、ゴール後の待機、保存・再接続・再戦を既存テストで確認した。

## ブラウザー

Chromium 153.0.8010.0。390×740、320×568、740×390の各サイズで4席、計12条件を確認した。全条件で味方2人が下、攻撃方向が上となり、得点欄の先頭は自チームである。盤面の回転時も文字・キャラ画像を逆さにしない。

本番 View、Renderer、Control、Rulesを使用し、外側の参加者欄のみプレビュー用に省略した。両チームのネイティブタッチと4方向のキーボード入力を確認した。短いドラッグ、タッチキャンセル、2本目の指、連射制限、切断、動きを減らす設定、ロビーのチーム・プロペラ・速度変更、勝敗・再戦ボタンを確認した。JavaScriptエラー・取得失敗は0件である。

`chromium-browser.json` に元データを収録した。実機iPhone/Safari、および実際の4人による対人試遊は未実施である。

## AI比較

`ai-comparison.json`：4設定×12シード＝48試合を旧版と新版でそれぞれ実行した。物理処理が変わるため途中の乱数選択も変化する。AI比較は操作感や対人の改善率を直接測るものではない。

| 設定 | 旧版：オウンゴール / 全ゴール | 新版：オウンゴール / 全ゴール |
| --- | ---: | ---: |
| 通常・プロペラなし | 28 / 56（50.0%） | 12 / 32（37.5%） |
| 2倍・プロペラなし | 50 / 89（56.2%） | 26 / 67（38.8%） |
| 通常・プロペラあり | 36 / 44（81.8%） | 23 / 36（63.9%） |
| 2倍・プロペラあり | 50 / 62（80.6%） | 42 / 57（73.7%） |

全試合が完走し、両チームとも得点した。プロペラあり、とくに2倍速では事故が起きやすい性質が残る。通常・プロペラなしが初回の操作確認に適している。

## 再現

Node 24、Playwright、Chromiumを使用した。ブラウザー実行時は既存アセットと日本語フォントを配置する。

```sh
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node --test --test-concurrency=2 tests/build563-wire.test.mjs tests/build564-hockey.test.mjs tests/build564-cache.test.mjs tests/build565-hockey.test.mjs tests/build566-*.test.mjs tests/build567-*.test.mjs tests/build568-*.test.mjs tests/build557-cart-regression.test.mjs
QA_CHROMIUM=/path/to/chromium QA_FONT=/path/to/NotoSansJP.ttf node tools/build568/browser.mjs
QA_CHROMIUM=/path/to/chromium QA_FONT=/path/to/NotoSansJP.ttf node tools/build568/capture.mjs
node tools/build568/compare.mjs
```

比較にはGit履歴内の旧Build567のコミットを使用する。GIFは両チームの初期位置を揃えてから本番のタッチ入力・物理処理を撮影したものである。
