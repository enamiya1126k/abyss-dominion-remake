release177 差分パッチ

対象: release176 適用済みのゲームフォルダ
内容: release176 から変更・追加されたファイルだけ
削除対象: なし

ZIPを展開し、中の`abyss-dominion-remake-main`フォルダの「中身」を、release176の同名フォルダへ階層を保ったまま上書きしてください。
ゲーム全体の再配置は不要です。

更新前に確認すること:
- release176が適用済みであること
- `online-server/data/guilds.json`を別の場所へバックアップする
- `online-server/data` フォルダを削除しない
- 既存の`friends.json`や`guilds.json`を上書き・削除しない
- 上書き後にオンラインサーバーを再起動する
- ブラウザを再読み込みする

この差分ZIPには、画像・音声などのゲーム素材、利用中のオンライン保存データ、`online-server/node_modules`、実行時生成物、一時ファイル、旧差分マニフェスト、ZIPファイルを含めません。

旧`guilds.json` version 1・2は、サーバー起動時に遠征予定の保存領域を補ってversion 3へ自動移行します。既存のギルド、メンバー、役職、申請、招待、チャット、週間情報、活動履歴は維持します。

release176のサーバーはversion 3の`guilds.json`を読み込めません。release176へ戻す場合はプログラムだけを戻さず、適用前にバックアップしたversion 2の`guilds.json`も一緒に戻してください。実際の保存データはこの差分ZIPに含めません。

遠征予定は事前の日時共有用です。部屋を自動作成せず、報酬、週間共闘Pt、通常セーブを変更しません。開催時は従来のオンライン部屋とギルド共闘募集を利用してください。

詳しい変更は README_177.txt と BUILD236_GUILD_PLANS_UPDATE.md を確認してください。
