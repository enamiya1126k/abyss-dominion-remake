# ABYSS DOMINION build208 最小差し替え

## 更新内容

- 通常宝箱は既存素材のまま維持し、共闘限定宝箱のみ黒鉄／銀／金／深淵の4段階へ刷新。全段階に閉・開素材があり、取得後も開いた姿を保持します。
- 蒼と紫の鍵片を別々のプレイヤーが拾うと、合体演出後に豪華共鳴宝箱が出現します。
- 黄金の財宝獣は右向き原画8フレームを通常モンスター処理へ接続。探索時と戦闘時に待機／歩行／攻撃／被弾／戦闘不能を使います。
- 異界商人は探索画面内の無料支援NPC。近づいて「話す」を押すとページ遷移なしの小窓を開き、遺物、結晶、全快から各自1回だけ選択できます。
- 隠し転送門は通路上に浮かべず、壁際へ配置。全員を専用宝物庫へ転送し、番人→深淵宝箱→帰還門の順で攻略します。
- 専用宝物庫から帰還すると、主の世界の地形、通常宝箱、探索進行、階段状態を復元します。

## 差し替え対象

- `index.html`
- `src/main.js`
- `src/core/config.js`
- `src/data/monsterCatalog.js`
- `src/ui/MonsterVisual.js`
- `src/online/OnlinePartyClient.js`
- `src/online/OnlineViews.js`
- `src/Styles/build208.css`
- `online-server/package.json`
- `online-server/package-lock.json`
- `online-server/server.js`
- `online-server/src/RoomStore.js`
- `online-server/src/OnlineExpansion208.js`
- `assets/monsters/rare_golden_beast/`
- `assets/online/coop/chests/`
- `assets/online/coop/keys/`
- `assets/online/coop/merchant/`
- `assets/online/coop/portal/`

オンラインサーバーも同時に差し替え、停止後に再起動してください。サーバープロトコルは `1.11.0` です。

## 確認結果

- JavaScript ESM構文：97ファイル合格
- build208素材：26個すべてRGBA PNG
- build208専用クライアント回帰：合格
- オンラインサーバー：36/36合格
- ZIP内容と展開テスト：合格

画像生成の作業記録と最終プロンプトは `BUILD208_IMAGE_PROMPTS.md` に収録しています。
