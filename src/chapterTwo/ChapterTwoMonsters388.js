import {CHAPTER_TWO_SPECIES388} from '../data/chapterTwoSpecies388.js?v=3.1.68-build388';
const utility=new Set(['buff','stance','allHeal','cleanse','revive']);
export const CHAPTER_TWO_ACTIONS388=Object.freeze(Object.fromEntries(Object.values(CHAPTER_TWO_SPECIES388).flatMap(s=>s.authoredSkills.map(k=>[k.id,{...k,label:k.name,multiplier:k.power,utility:utility.has(k.type),pattern:utility.has(k.type)?'self':k.allEnemies?'all':'singleWeak',dispelOne:k.dispelEnemyBuff,hpShieldRate:k.selfShieldRate}]))));
export function installChapterTwoHabitats388(encounters){
 const set=(id,keys,name,extra={})=>{if(encounters[id])encounters[id]={...encounters[id],species:keys.map(key=>`ch2_${key}`),authorities:undefined,roles:undefined,name,chapterTwoNative383:true,chapterTwoNative388:true,...extra};};
 set('roam0_4',['ryune','rose','balk','fiora'],'夜灯と蒼紅の巡察隊');
 set('roam1_3',['senela','grant','lyriet','rosette'],'蒼紅の誓姫と封印の衛');
 set('roam2_3',['razil','senela','noctelle','auriane'],'黒白の薔薇聖堂');
 set('roam3_3',['ione','nerik','eirene','iridelle'],'双刻の星姫と天文台の記録',{level:4800,hp:1500000,atk:69000,def:33000,spd:15400,experience:220000,gold:265000});
}
