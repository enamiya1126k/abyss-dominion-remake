export const NOTICE_DEFINITIONS=Object.freeze([
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
