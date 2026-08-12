export const NOTICE_DEFINITIONS=Object.freeze([
 {
  id:"v250-magic-circles",
  kind:"update",
  icon:"✨",
  label:"新機能",
  title:"魔法陣システム実装！",
  body:"GOLDで魔法陣を解放・強化し、仲間ごとに戦闘法則を変更できます。装備管理から設定できます。"
 },
 {
  id:"v250-slot-pickup",
  kind:"event",
  icon:"🔮",
  label:"召喚",
  title:"運命の三桁環ピックアップ開催",
  body:"新たな魔法陣とNo.211〜230の仲間が登場。召喚結果の装備表示も改善しました。"
 },
 {
  id:"v250-new-monsters",
  kind:"update",
  icon:"🌌",
  label:"新キャラ",
  title:"深海生物・深淵・十神を追加",
  body:"新キャラを魔物一覧・召喚・深層コンテンツへ実装しました。深淵と十神は欠片から契約できます。"
 },
 {
  id:"v250-battle-renewal",
  kind:"update",
  icon:"⚔️",
  label:"アップデート",
  title:"戦闘演出・活躍表・深層難易度を更新",
  body:"戦闘後の活躍表、敵専用の裏装備と熟練度、バフ表示、数値演出を改善しました。"
 },
 {
  id:"alpha-110-112",
  kind:"update",
  icon:"✨",
  label:"アップデート",
  title:"alpha110〜112 品質改善",
  body:"ショップ導線、召喚の提供割合、深淵ツリー価格、共通メニューを改善しました。"
 },
 {
  id:"summon-rates",
  kind:"update",
  icon:"🔮",
  label:"アップデート",
  title:"通常召喚の提供割合を明記",
  body:"通常枠と10連確定枠の割合、排出対象外の階級を確認できるようになりました。"
 },
 {
  id:"endgame-emergency",
  kind:"event",
  icon:"🌌",
  label:"イベント",
  title:"深淵・十神 緊急戦闘",
  body:"解放条件を満たすと探索中に特別な敵が出現します。"
 },
 {
  id:"tutorial-guide",
  kind:"update",
  icon:"📖",
  label:"ガイド",
  title:"遊び方・序盤チュートリアル",
  body:"1〜5階の説明をいつでも確認できます。",
  action:"tutorial"
 },
 {
  id:"codex-guide",
  kind:"update",
  icon:"📚",
  label:"データ",
  title:"モンスター・装備図鑑",
  body:"発見・捕獲・獲得した記録を確認します。",
  action:"codex"
 },
 {
  id:"save-stability",
  kind:"maintenance",
  icon:"🛠️",
  label:"メンテナンス",
  title:"セーブ安定性の継続確認",
  body:"旧セーブとの互換性を保ったまま各機能を更新しています。"
 }
]);

export function normalizeNoticeState(state){
 const source=state?.notices&&typeof state.notices==="object"&&!Array.isArray(state.notices)?state.notices:{};
 const readIds=Array.isArray(source.readIds)
  ?source.readIds.filter(id=>typeof id==="string"&&id).slice(-200)
  :[];
 state.notices={...source,readIds:[...new Set(readIds)]};
 return state.notices;
}

export function unreadNoticeIds(state){
 const notices=normalizeNoticeState(state);
 const read=new Set(notices.readIds);
 return NOTICE_DEFINITIONS.map(notice=>notice.id).filter(id=>!read.has(id));
}

export function markAllNoticesRead(state){
 const notices=normalizeNoticeState(state);
 notices.readIds=[...new Set([...notices.readIds,...NOTICE_DEFINITIONS.map(notice=>notice.id)])].slice(-200);
 notices.lastReadAt=new Date().toISOString();
 return notices;
}
