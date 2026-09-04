ABYSS DOMINION REMAKE — Build320 全体監査・最終差し替え

導入
1. Build319適用済みのゲームフォルダへ、このZIPの内容を同じ階層で上書きします。
2. index.htmlを開き直します。Build番号は build320 です。

最終監査と修正
- iPhone Safari相当（幅390/430px・高DPR・タッチ操作・セーフエリア・動的ビューポート）を再監査。王室の操作ボタンを44px以上へ統一し、長文と狭幅時のはみ出しを防止。
- セーブスキーマを79へ更新。Build319以前の所持仲間・装備・通貨・勇者の傷・結末履歴を保持します。
- 旧仕様の「敗北後81階へ強制巻き戻し中」で保存されたデータを自動救済し、解放済みの王室から再挑戦できるよう修正。
- 完全勝利・辛勝・勇者の勝利、全員道中撃破の特殊完全勝利、敗北後再挑戦を確認。
- 輪廻1周目・2周目の開始、100階到達記録、任意継続、傷と物語の再初期化を確認。
- サーバーのオンライン／オフライン表示、メンテナンス通知の追加と復旧時の自動取り下げを確認。
- オンライン探索中にオフライン専用の勇者遭遇が混入しないことを確認。
- 探索はiPhone相当でDPR 1.35・30fps描画上限・粒子45%を維持。王室画面に追加の常駐タイマーや描画ループはありません。
- 100階到達時に輪廻進行が99階で止まる可能性を修正。
- エンディング結果、輪廻開始、勇者遭遇、固有宝箱の受領済み記録が同じIDで二重処理されないことを確認。

確認コマンド
- node --test tests/build311-campaign-migration.test.mjs tests/build311-floor-reachability.test.mjs tests/build311-save-recovery.test.mjs tests/build312-story-personality.test.mjs tests/build313-hero-voice.test.mjs tests/build314-hero-mythic-resonance.test.mjs tests/build315-explore-performance.test.mjs tests/build316-economy-team-battle.test.mjs tests/build317-home-battle-ui.test.mjs tests/build318-explore-map.test.mjs tests/build319-hero-finale-reincarnation.test.mjs tests/build320-final-audit.test.mjs
- node --check src/main.js src/services/SaveService.js src/ui/screens/HomeScreen.js src/ui/screens/CampaignFinalFloorScreen.js src/core/CampaignHeroEncounterSystem.js src/core/CampaignReincarnationSystem.js

注記
- 実機Safariそのものではなく、iPhone Safari相当の画面幅・DPR・タッチ・CSS互換条件での自動監査です。公開後の最終実機確認では、ホーム、探索、戦闘、王室を各1回ずつ開く確認を推奨します。
