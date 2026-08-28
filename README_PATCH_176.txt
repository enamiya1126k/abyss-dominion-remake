release176 差分パッチ

対象: release175 適用済みのゲームフォルダ
内容: release175 から変更・追加されたファイルだけ
削除対象: なし

ZIPを展開し、中の`abyss-dominion-remake-main`フォルダの「中身」を、release175の同名フォルダへ階層を保ったまま上書きしてください。
ゲーム全体の再配置は不要です。

更新前に確認すること:
- release175が適用済みであること
- `online-server/data` フォルダを削除しない
- 既存の`friends.json`や`guilds.json`を上書き・削除しない
- 上書き後にオンラインサーバーを再起動する
- ブラウザを再読み込みする

この差分ZIPには、画像・音声などのゲーム素材、利用中のオンライン保存データ、`online-server/node_modules`、実行時生成物、一時ファイル、旧差分マニフェスト、ZIPファイルを含めません。

旧`guilds.json`はサーバー起動時に新しい項目を補って自動移行します。既存のギルド、メンバー、役職、申請、招待、チャットは維持します。活動履歴はbuild235適用後の活動から始まります。

詳しい変更は README_176.txt と BUILD235_GUILD_ACTIVITY_HISTORY_UPDATE.md を確認してください。
