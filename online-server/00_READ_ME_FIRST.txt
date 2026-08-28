ABYSS DOMINION オンライン（Windows・自宅PC用）
================================================

最初の1回だけ：
1. Node.js LTS版をインストール
2. cloudflared Windows版をインストール
3. 01_FIRST_SETUP.bat を実行

固定URLを使う場合（推奨・最初の1回だけ）：
1. 無料のngrokアカウントを作成し、Windows版ngrokをインストール
2. 05_SETUP_FIXED_URL.bat を実行
3. 画面に従ってauthtokenと、割り当てられたdev domainを入力

以後、遊ぶ日は 04_START_ONLINE.bat をダブルクリックします。
固定設定後は毎回同じ https://xxxxx.ngrok-free.app で起動します。
ゲーム内の「サーバーURL」へ入力するのは最初の1回だけです。

固定設定をしていない場合は、従来どおりCloudflare Quick Tunnelで
起動し、表示された https://xxxxx.trycloudflare.com を入力します。

オンラインは次の5画面だけです。
- ホーム
- 共同探索
- レイドボス
- 自由チーム戦（1vs1／1vs2／1vs3／2vs2、最大4人）
- チャット

友達側のインストールは不要です。ルームIDまたは招待リンクを送り、
同じ部屋へ集合してください。各画面は下へ連結されず、下部タブで
現在使う画面だけを切り替えます。

重要：
- サーバーとトンネルの黒い画面は、遊んでいる間は閉じません。
- ルーターのポート開放は不要です。
- 画面更新や一時切断後は、同じ部屋への自動復帰を試みます。
- PCを終了すると部屋は終了します。data/settlements.json から、
  未受取報酬は24時間、未確認の交換受取は7日間を上限に復旧します。
- 更新前は online-server/data フォルダ全体をバックアップし、
  friends.json、guilds.json、settlements.json を削除しないでください。
- build239では friends.json をversion 2へ自動移行し、ミュートと
  ブロックを保存します。既存フレンドとブロックは維持されます。
- 公開募集で困った相手は交流パネルの「安全設定」からミュート／
  ブロックできます。ブロックした相手の部屋は一覧にも出ません。
- 起動後は http://127.0.0.1:8787/health の "ok":true を確認します。
- fixed-tunnel-domain.txt がある場合はngrok固定URL、ない場合は
  Cloudflare Quick Tunnelを自動選択します。

04が開かない場合は、右クリック→プロパティ→「許可する」→適用。
詳しい説明と手動起動方法は ONLINE_SETUP_GUIDE.md を開いてください。
