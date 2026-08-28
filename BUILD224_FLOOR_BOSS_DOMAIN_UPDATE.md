# BUILD 224 — 階層ボス90体 固有戦闘ギミック監査

## 主な変更

- 10F〜990Fの階層ボス90体について、`floorBossPassive`、`floorBossDomain`、`floorBossAi`、`dedicatedWeapon`をオンライン敵生成へ引き継ぎました。
- 90体に定義された89種類の`domain.effect`をオンライン戦闘側で監査可能な共通フックへ接続しました。
- 領域の攻撃倍率、周期解放、速度優位、強化反照、状態異常追撃、CT負債、MP枯渇、蓄積解放、極性切替、加速蓄積などをオンライン戦闘へ反映しました。
- 被弾トリガー（侵蝕、蓄熱、反撃準備、会心蓄積、適応系）を追加しました。
- ラウンド終了トリガー（生命再生、継続圧力、MP圧力、防御転換、再生系）を追加しました。
- 既存のオンライン共闘同期、報酬、魔法陣、装備・スキル処理は維持しています。

## 当時の検証記録

- build224: PASS（90 bosses / 89 domain effects）
- build223: PASS
- build222: PASS
- build221: PASS
- build220: PASS
- build219: PASS
- ESM syntax: PASS（97 files）

この文書は、以前`ABYSS_DOMINION_170_PATCH_README.md`に入っていたbuild224の記録を、履歴として移したものです。
