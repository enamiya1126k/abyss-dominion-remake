import {chapterTwoUnlocked} from '../chapterTwo/ChapterTwoSystem.js?v=3.1.82-build402';

export const HOME_SKIN_VERSION400='3.1.80-build400';
export const HOME_SKINS400=Object.freeze([
 {id:'town',name:'はじまりの城下町',description:'城を望む川辺。いつもの仲間と過ごす風景。',motion:'川のせせらぎ・木々の揺れ',image:'./assets/ui/home-town-bg.png',color:'#92c5aa'},
 {id:'forest',name:'境界の森',description:'予言の外へ続く、青緑の古い森。',motion:'水面の流れ・葉の揺れ・蛍',color:'#87dfc5'},
 {id:'invasion',name:'黒根の侵食域',description:'黒い根に覆われた石門と、消えない篝火。',motion:'篝火の揺らぎ・舞い上がる火の粉',color:'#e5aa7c'},
 {id:'abyss',name:'深淵の回廊',description:'旧世界の記憶が眠る、紫紺の回廊。',motion:'流れる薄霧・漂う紫の光',color:'#b4a1e9'},
 {id:'sanctum',name:'天律の聖域',description:'雲海の上にたたずむ、白金の聖域。',motion:'雲の流れ・旗の揺れ・光の粒',color:'#eddaa0'},
 {id:'core',name:'理の中枢',description:'星と歯車が静かに巡る、世界の中枢。',motion:'星環の巡り・脈打つ光・浮遊する粒',color:'#87d7e8'},
].map(skin=>Object.freeze({...skin,thumbnail:skin.image??`./assets/ui/home-skins400/${skin.id}-thumb.webp?v=${HOME_SKIN_VERSION400}`,image:skin.image??`./assets/ui/home-skins400/${skin.id}.webp?v=${HOME_SKIN_VERSION400}`})));

export const homeSkinsUnlocked400=state=>chapterTwoUnlocked(state);
// Reading a home or a settings page never writes unlocks or migrates progress.
export function homeSkinState400(state){
 const unlocked=homeSkinsUnlocked400(state),raw=state?.settings?.homeSkin400;
 const chosen=HOME_SKINS400.find(s=>s.id===raw?.id);
 return {skin:unlocked&&chosen?chosen:HOME_SKINS400[0],motion:!unlocked||raw?.motion!==false,unlocked};
}

// Only this optional settings key is changed. Keep absent fields absent on
// failure, including first-chapter/older saves, instead of inventing migration.
export async function commitHomeSkin400(save,change){
 const state=save?.state;
 if(!homeSkinsUnlocked400(state))return{ok:false,message:'第二章を解放すると選べます。'};
 const current=homeSkinState400(state);
 const id=change?.id??current.skin.id,motion=change?.motion??current.motion;
 if(!HOME_SKINS400.some(s=>s.id===id)||typeof motion!=='boolean')return{ok:false,message:'このホームスキンは選べません。'};
 const existed=Object.hasOwn(state,'settings'),settings=state.settings;
 if(!settings||typeof settings!=='object'||Array.isArray(settings))return{ok:false,message:'設定を読み込めませんでした。'};
 const had=Object.hasOwn(settings,'homeSkin400'),old=settings.homeSkin400;
 settings.homeSkin400={id,motion};
 try{
  if(typeof save.save!=='function'||await save.save()!==true)throw new Error('save failed');
  return{ok:true,message:change?.id?`「${HOME_SKINS400.find(s=>s.id===id).name}」を保存しました。`:`環境モーションを${motion?'ON':'OFF'}にしました。`};
 }catch{
  if(had)settings.homeSkin400=old;else delete settings.homeSkin400;
  if(!existed)delete state.settings;
  return{ok:false,message:'保存できませんでした。空き容量を確認して、もう一度お試しください。'};
 }
}
