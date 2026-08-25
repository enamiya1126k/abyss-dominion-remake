ABYSS DOMINION 167 差し替えパッチ

適用元:
- 166 探索基盤統合パッチ適用済みフォルダ

上書き対象:
- src/ui/screens/OnlinePartyScreen.js
- online-server/src/RoomStore.js

テスト（任意）:
- tests/build221-online-sync-reward-battle-parity-regression.mjs

今回の内容:
1. オンライン戦闘の属性相性をオフライン同様に反映
2. 階層環境の有利/不利補正をオンライン戦闘にも反映
3. 物理/魔法で DEF/MDEF を正しく使い分け
4. 防御無視・確定会心・吸収・自己回復・現在HP割合攻撃・処刑補正・障壁・浄化をオンライン用プロフィールへ引き継ぎ
5. 浄化系スキルをオンラインでも支援行動として処理
6. 捕獲不可/ボスをオンラインで捕獲できてしまう抜け道を修正
7. 通常敵の捕獲率を種族捕獲率 + 残HP + レベル差ベースへ変更（固定18%を廃止）
8. 同一共闘戦の勝利基本報酬を全参加者で同一にし、同期ズレを防止
9. 既存の共闘チェイン・共鳴・チャット・共闘ギミック等は維持

確認済み:
- build218 floor boss regression: OK
- build219 solo entry parity regression: OK
- build220 exploration foundation parity regression: OK
- build221 sync/reward/battle parity regression: OK
- ESM syntax regression: 97 files PASS

注意:
- これは差し替えパッチです。164本体へ直接ではなく、165→166まで適用済みの状態へ上書きしてください。
