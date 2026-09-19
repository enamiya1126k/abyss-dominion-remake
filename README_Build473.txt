ABYSS DOMINION Build473 / v3.1.152
Build472からの差し替えパッチ

【適用】
Build472適用済みのゲームをバックアップし、このZIPをindex.htmlのあるフォルダへ同じ構成で上書きしてください。
変更・追加ファイルのみです。元の素材・ソース一式は必要です。
サーバーの変更はありません。通信バージョン13を維持しています。
公開サイトへの反映は行っていません。適用後、ブラウザを再読み込みしてください。

【修正】
・3か所の寄り道のマス間隔を広げ、最初の分岐地点を神殿の入口から離しました。
・分岐選択は実際のマップと座標を使い、光る経路・順番の数字・金と青緑の選択肢を表示。
・特殊カードは手札の開閉によらず166:242の縦長比率を維持。小さい盤面では効果をカードの横にも表示。
・全員表示のカメラを補正し、マップの外側には背景とつながるぼかした風景を追加。
・魔物一覧は対戦で使用する種族情報に統一。特殊種族がある魔物の一覧・プレビューの不一致を修正。
・魔物選択の足元の台座を独立した背面要素に変更し、足より下に配置。

【確認と範囲】
Chromiumのスマホ相当画面で、手札開閉時のカード比率、全員カメラ、種族情報の異なる魔物、台座の上下関係を検証。
3分岐・2ルートなど84通りの停止先予測とエンジンの一致を確認。
手札の見切れ、ターンごとの開閉、1マスずつの移動、演出範囲も回帰確認。
未変更の元アプリ依存ファイルが手元にないため、魔物描画と選択通信は検証用代替を使用。
実機iPhone Safari・公開サイト全体での動作確認は未実施です。

【差し替えファイル】
index.html
src/Styles/build473-sugoroku.css
src/core/config.js
src/sugoroku/Adventure467.js
src/sugoroku/Experience472.js
src/sugoroku/Presentation464.js
src/sugoroku/View463.js
src/sugoroku/Visual473.js
src/worldRaid/WorldRaidOfflineCache430.js
world-raid-offline473-assets.json
world-raid-offline473-sw.js
