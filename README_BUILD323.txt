ABYSS DOMINION REMAKE — Build323 勇者遭遇・分岐ストーリーパッチ

適用元
  Build322へ、このZIPの同名ファイルを上書きしてください。

バージョン
  アプリ: 3.1.4
  セーブスキーマ: 81
  アセットビルド: build323

主な変更
  ・予言2〜9日目に、えなみ／より／ひで／りおんの単独行動ストーリーを追加
  ・事前ストーリーを記録するまで、その勇者の遭遇抽選をロック
  ・探索中の出現カットイン、追跡距離、追跡猶予、画面外方向表示を追加
  ・遭遇後を「迷宮側勝利」「勇者側勝利」「逃走」の3結果に分岐
  ・遭遇結果 → リオネルからサイラーンへの報告 → 同時刻の勇者一行、の3場面を追加
  ・勇者に残った傷、途中撃退で欠けた仲間を以降の会話へ反映
  ・輪廻開始時に勇者遭遇と分岐物語の台帳を新しい周回として再作成
  ・Build320〜322の遭遇結果と進行中追跡は壊さず移行

追加ファイル
  src/core/CampaignHeroBranchStorySystem.js
  src/Styles/build323-hero-story.css
  tests/build323-hero-branch-story.test.mjs

確認
  node --test tests/build323-hero-branch-story.test.mjs tests/build322-world-opening.test.mjs tests/build321-polish.test.mjs tests/build318-explore-map.test.mjs

注意
  差分パッチです。単体では起動せず、Build322適用済み一式へ上書きしてください。
