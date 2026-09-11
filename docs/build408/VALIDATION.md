# Build408 検証記録

実行環境：Node v24.19.0。基準はBuild407/v3.1.87。

- 新規テスト：30件成功。70体・280スキル・24ペアとの仕様照合、5体の担当・ランク、複製、陣営分離、再帰抑止、回数・履歴の保存、自然行動10回の冬眠、確定死の重複除外、HP0/1攻撃の例外、弱体21種の変換、最大8倍の成長、HP100固定、8%盾、バッチの上限を検証。
- 既存のペア・反撃・状態異常・AI・保存関連：132件成功。新規と合わせ162件成功。
- 変更した全JavaScriptの構文、直接import先、更新対象モジュールのimport-mapを確認。
- Build407の変更ファイルのうち今回対象外のファイルはハッシュがすべて一致。ホーム環境演出を維持。
- 保存状態は実際のSaveServiceで保存・再読み込みして発動済み回数と冬眠の進行を確認。

実行コマンド（プロジェクトルート）：

```sh
node --test tests/build408-ability-foundation.test.mjs
node --test --test-skip-pattern='formation and battle show the partner requirement|new pair UI names the partner|the new pair requirements and all enemy names/ranks' tests/build385-twins.test.mjs tests/build386-pairs.test.mjs tests/build387-finale.test.mjs tests/build388-oath-heroines.test.mjs tests/build389-keys-thunder.test.mjs tests/build390-crystal-oaths.test.mjs tests/build391-wings-bells.test.mjs tests/build392-dreams-crowns.test.mjs tests/build395-polish.test.mjs tests/build408-ability-foundation.test.mjs
```

旧UIテストの扱い：Build385・386・387各1件は `敵 共鳴名` がHTMLに連続した文字列で存在する前提。共鳴欄の省スペース化後の表示とは合わず、Build407の6ファイルへ戻しても同じ3件が失敗した。今回の成功件数には含めず、戦闘ロジックの回帰テストからこの3件だけを除外した。テストやUIを通過目的で書き換えてはいない。

実行できなかった範囲：Build398の魔法陣テスト一式は、作業用プロジェクトの `online-server/src/CoopBossCatalog.js` 不足で読み込み時に停止。オンライン補助コードの追加・変更は今回のZIPに含めていない。オンライン戦闘・実機iPhone・ブラウザ操作の確認は未実施。

新しい個別特性と24ペア追加効果は未有効化。そのため、これらが実戦で全て発動することや、十神との勝率・強さを今回検証したという意味ではない。個別アダプター・AI選択・ログ・演出・サーバー同期と、設計書の比較条件によるバランス検証は次段階。
