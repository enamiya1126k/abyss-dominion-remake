ABYSS DOMINION オンライン広場（Windows・自宅PC用）
====================================================

今晩やることは3つだけです。

1. Node.js の LTS 版をインストール
   https://nodejs.org/en/download

2. cloudflared の Windows 版をインストール
   https://developers.cloudflare.com/tunnel/downloads/

3. このフォルダ内の 01_FIRST_SETUP.bat を1回だけ実行

準備後は、遊ぶたびに 04_START_ONLINE.bat をダブルクリックします。
画面に表示される https://xxxxx.trycloudflare.com を、ゲーム内
「パーティ」→「オンライン広場」→「サーバーURL」へ入力してください。

友達側はインストール不要です。
あなたから届いた招待リンクをブラウザで開き、接続ボタンを押すだけです。

重要：
- 04_START_ONLINE.bat と、別に開くサーバー画面は遊んでいる間は閉じません。
- ルーターのポート開放は不要です。
- サーバーは127.0.0.1だけで待ち受け、Cloudflare経由で公開します。
- PCを終了すると部屋も終了します。ゲーム本体・セーブには影響しません。
- Quick TunnelのURLは起動し直すたびに変わります。

詳しい説明は ONLINE_SETUP_GUIDE.md を開いてください。
