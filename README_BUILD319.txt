ABYSS DOMINION REMAKE — Build319 勇者・最終章・輪廻

導入
1. Build318適用済みのゲームフォルダへ、このZIPの内容を同じ階層で上書きします。
2. index.htmlを開き直します。Build番号は build319 です。

変更内容
- 予言2〜9日目に勇者一人ずつの遭遇期間を設定し、期間内の正確な遭遇階を安定したランダム判定へ変更。
- より→ひで→えなみ→りおんの一巡後、後半で二巡目が発生。見逃した期間を後日へ不自然に持ち越しません。
- 道中で与えた傷は残存HP率として保存し、撃破した勇者は王室と最終戦から離脱します。
- 100階踏破後は「魔王城・謁見の王室」へ移動。魔王軍と勇者一行が画面上で向かい合い、会話完了後に最終戦が解禁されます。
- 勇者全員生存時は既存の神話共鳴「無敵」を維持した最終4対4。傷・欠員数もそのまま反映します。
- エンディングを「完全勝利」「辛勝」「勇者の勝利」の3系統へ整理。全員を道中撃破した場合は完全勝利の特殊演出です。
- 敗北時の強制81階巻き戻しを廃止。育成や傷を保持したまま王室へ再挑戦できます。
- 勝利後も通常の探索・育成を継続可能。ホームからだけ選べる任意の輪廻を追加しました。
- 輪廻は仲間・装備・通貨・所持品・図鑑・結末履歴を保持し、1階から物語と勇者遭遇を再始動します。
- 輪廻ごとに敵能力+28%、通常GOLD/EXP+12%。固有装備など一度きりの報酬は再配布されません。

確認
- node --test tests/build319-hero-finale-reincarnation.test.mjs
- node --check src/main.js src/services/SaveService.js src/ui/screens/HomeScreen.js src/ui/screens/CampaignFinalFloorScreen.js src/core/CampaignHeroEncounterSystem.js src/core/CampaignReincarnationSystem.js
