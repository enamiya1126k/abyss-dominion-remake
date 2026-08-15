# ABYSS DOMINION 開発資料

| 資料 | 内容 |
|---|---|
| [RELEASE_NOTES_v2.10.0_JA.md](RELEASE_NOTES_v2.10.0_JA.md) | v2.10.0戦闘演出・ミミック・お知らせ・拠点表示の更新内容 |
| [RELEASE_NOTES_v2.9.0_JA.md](RELEASE_NOTES_v2.9.0_JA.md) | v2.9.0戦闘AUTO・深層装備・魔法陣演出の更新内容 |
| [RELEASE_NOTES_v2.8.0_JA.md](RELEASE_NOTES_v2.8.0_JA.md) | v2.8.0スキル明細・回復演出・毎日配布の更新内容 |
| [RELEASE_NOTES_v2.7.0_JA.md](RELEASE_NOTES_v2.7.0_JA.md) | v2.7.0深層敵・完全AUTO・ミミック更新内容 |
| [RELEASE_NOTES_v2.4.0_JA.md](RELEASE_NOTES_v2.4.0_JA.md) | v2.4.0完成版の更新内容 |
| [IMPLEMENTATION_VERIFICATION_v2.4.0_JA.md](IMPLEMENTATION_VERIFICATION_v2.4.0_JA.md) | 130版引き継ぎ修正の実装範囲と検証結果 |
| [RELEASE_NOTES_v2.3.1_JA.md](RELEASE_NOTES_v2.3.1_JA.md) | v2.3.1完成版の更新内容と配置方法 |
| [IMPLEMENTATION_VERIFICATION_v2.3.1_JA.md](IMPLEMENTATION_VERIFICATION_v2.3.1_JA.md) | v2.3.1追加修正の実装範囲と検証結果 |
| [RELEASE_NOTES_v2.3.0_JA.md](RELEASE_NOTES_v2.3.0_JA.md) | v2.3.0完成版の更新内容と配置方法 |
| [IMPLEMENTATION_VERIFICATION_v2.3.0_JA.md](IMPLEMENTATION_VERIFICATION_v2.3.0_JA.md) | v2.3.0追加修正の実装範囲と検証結果 |
| [RELEASE_NOTES_v2.2.0_JA.md](RELEASE_NOTES_v2.2.0_JA.md) | v2.2.0のプレイヤー向け更新内容と配置方法 |
| [RELEASE_NOTES_v2.2.1_JA.md](RELEASE_NOTES_v2.2.1_JA.md) | v2.2.1起動修正と差し替え方法 |
| [IMPLEMENTATION_VERIFICATION_v2.2.1_JA.md](IMPLEMENTATION_VERIFICATION_v2.2.1_JA.md) | v2.2.1起動修正の原因・検証結果 |
| [IMPLEMENTATION_VERIFICATION_v2.2.0_JA.md](IMPLEMENTATION_VERIFICATION_v2.2.0_JA.md) | 追加修正依頼に対する実装対応と最終検証結果 |
| [RELEASE_NOTES_v2.1.0_JA.md](RELEASE_NOTES_v2.1.0_JA.md) | v2.1.0のプレイヤー向け更新内容と配置方法 |
| [IMPLEMENTATION_VERIFICATION_v2.1.0_JA.md](IMPLEMENTATION_VERIFICATION_v2.1.0_JA.md) | 今回の修正依頼に対する実装対応と最終検証結果 |
| [RELEASE_NOTES_v2.0.0_JA.md](RELEASE_NOTES_v2.0.0_JA.md) | プレイヤー向け更新内容と起動方法 |
| [GDD_v1.0_IMPLEMENTATION_REPORT_JA.md](GDD_v1.0_IMPLEMENTATION_REPORT_JA.md) | 改訂GDD・Character Bibleの実装範囲と検証結果 |
| [CHANGELOG.md](CHANGELOG.md) | バージョン別変更履歴 |
| [ROADMAP.md](ROADMAP.md) | 完了範囲と将来候補 |
| [TODO.md](TODO.md) | 配布前の外部工程と将来候補 |

## 正本

- ゲーム起動：`index.html` → `src/main.js`
- 深淵・十神設定：`src/data/endgameCharacters.js`
- エンドゲーム進行：`src/core/EndgameSystem.js`
- セーブ：`src/services/SaveService.js`
- 回帰検証：`tests/gdd-v1-regression.mjs`から`tests/v2.10.0-presentation-regression.mjs`まで

`src/app.bundle.js`は旧成果物であり、現在の起動経路から参照されない。
