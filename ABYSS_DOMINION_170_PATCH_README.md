# ABYSS DOMINION 170 — 階層ボス90体 固有戦闘ギミック監査

## 適用条件
168+169パッチまで適用済みのゲームフォルダへ上書きしてください。

## 差し替え対象
- online-server/src/RoomStore.js
- tests/build224-online-floor-boss-domain-parity-regression.mjs（回帰テスト、ゲーム実行には不要）

## 主な変更
- 10F〜990Fの階層ボス90体について、floorBossPassive / floorBossDomain / floorBossAi / dedicatedWeapon をオンライン敵生成へ引き継ぐ。
- 90体に定義された89種類の domain.effect をオンライン戦闘側で監査可能な共通フックへ接続。
- 領域の攻撃倍率、周期解放、速度優位、強化反照、状態異常追撃、CT負債、MP枯渇、蓄積解放、極性切替、加速蓄積などをオンライン戦闘へ反映。
- 被弾トリガー（侵蝕、蓄熱、反撃準備、会心蓄積、適応系）を追加。
- ラウンド終了トリガー（生命再生、継続圧力、MP圧力、防御転換、再生系）を追加。
- 既存のオンライン共闘同期、報酬、魔法陣、装備・スキル処理は維持。

## 検証
- build224: PASS（90 bosses / 89 domain effects）
- build223: PASS
- build222: PASS
- build221: PASS
- build220: PASS
- build219: PASS
- ESM syntax: PASS (97 files)
- online-server旧テスト: 38/42 PASS。残る4件は固定敵マス時代・旧行動順など現行仕様と矛盾するレガシーテスト。
