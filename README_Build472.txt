ABYSS DOMINION — Build472 / v3.1.151
Build471適用済み環境向け・差し替えパッチ

【入れ方】
1. 現在のBuild471をバックアップしてください。
2. このZIPの中身を、ゲームのindex.htmlがある場所へ同じフォルダ構成で上書きしてください。
   変更・追加した15ファイルと、この説明書だけが入っています。既存の写真・魔物素材・その他のファイルは必要です。
3. オンラインサーバーにも更新を反映し、再起動してください。
   online-server/srcだけでなく、共有するsrc/sugorokuの更新も必要です。
   通信バージョンは13です。ブラウザ本体とサーバーの両方をBuild472にそろえてください。
4. ブラウザを再読み込みしてください。新しいキャッシュへの切替も同梱しています。
   公開中のサイトへの反映・サーバー再起動は、この納品では行っていません。

【今回の修正】
・手札を開いていても、ドロー待機は「中央の山札 → その下のラベル」の縦並び。
・相手のドローは盤面内の小さな通知。紫の全面背景をなくし、手札操作を妨げません。
・分岐は実際のマップ画像・実際の座標で拡大表示。現在地、2つの道、残り歩数、今回の停止先と効果を表示。
・分岐地点まで移動してから選択。選択後は残り歩数から再開。画面の現在地の丸も強調。
・近道の先の神殿で特殊カードを得る理由を事前に説明。移動 → 到着と報酬説明 → 専用山札 → 表面 → 覚醒の順。
・寄り道の各効果は「止まった場所だけ」で発動することを明記。
・パーティー画面に生成した召喚の間、金と青緑の装飾、席の紋章を追加。
・魔物選択に大きな相棒プレビュー、召喚の台座、光の輪、粒子、選択中の表示を追加。
・自分の手番で手札を開く／相手の手番で閉じる動作、手動の開閉、1マスずつの移動、コマの光、上面のサイコロを維持。

【確認】
・320×568、375×620、393×694、393×740の手札と操作表示。1280幅の表示。
・手札の開閉にかかわらず山札を中央配置。9種類の演出が小さい盤面の中に収まること。
・相手の非公開カードを見せず、手札の操作を継続できること。
・3つの分岐・2つの道・残り歩数・神殿の再訪を組み合わせた84通りで、表示予定と実際の進行が一致。
・20試合の自動進行でカードが保存され、先着1名で終了すること。
・2つのローカルWebSocketクライアントで二重操作・古い状態・古いクライアントの拒否、切断時進行を確認。
・相棒の選択、検索、一覧スクロール維持、準備状態、動きを減らす設定を確認。

検証はChromiumと本番のエンジン・ビューを使ったテスト環境です。
手元の素材一式には未変更の元アプリの依存ファイルが含まれないため、魔物の表示と選択通信は検証用の代替を使用しました。
実機iPhone Safariおよび公開中サイト全体での確認は未実施です。

【生成素材】
assets/lounge472/summoning-hall.png
用途：パーティーと相棒召喚の背景。既存の魔物や人物写真は置き換えていません。
生成内容：黒曜石と古金の地下召喚殿、青緑の結晶、円形の台座、暖かい灯り。人物・文字なし。
生成プロンプト：Create a production-ready fantasy mobile game background asset, one portrait image 1024x1536. Art direction: ABYSS DOMINION, premium dark fantasy pixel-art inspired painted game scenery with finely detailed stonework and painterly light, not photorealistic. A majestic subterranean summoning hall opening into an abyss, obsidian and aged gold architecture, tall pointed arches, turquoise crystals clustered at the edges, warm candlelight, a large circular gold-rimmed summoning dais in the lower central third, pale cyan magical runes etched into the floor, suspended small gold particles. Deep ink navy shadows and subtle violet, teal and molten gold accents. The upper half is atmospheric architectural detail with a distant glowing portal, the lower half an unobstructed round stone platform and floor, suitable for compositing an existing small pixel monster on top. Strong depth, cinematic focal light at the center, satisfying collectible RPG game presentation. Keep central negative space clean enough for white interface text and a monster; highly detailed edges. No characters, no people, no text, no letters, no logo, no interface, no cards, no borders. This must be one coherent background environment, not a mockup or collage.

【次の演出案・未実装】
首位が入れ替わった瞬間に「首位奪取！」を短く表示すると、飲み会中に少し目を離していても盛り上がりどころが伝わります。
毎手番の演出を長くするより、逆転した瞬間だけ強調する方向が合いそうです。

【差し替えファイル】
assets/lounge472/summoning-hall.png
index.html
online-server/src/RaceCoordinator451.js
online-server/src/SugorokuCoordinator463.js
src/Styles/build472-sugoroku.css
src/core/config.js
src/party/PartyView462.js
src/sugoroku/Engine463.js
src/sugoroku/Experience472.js
src/sugoroku/Pacing465.js
src/sugoroku/Presentation464.js
src/sugoroku/View463.js
src/worldRaid/WorldRaidOfflineCache430.js
world-raid-offline472-assets.json
world-raid-offline472-sw.js
