import {CHAPTER_TWO_SPECIES387} from '../data/chapterTwoSpecies387.js?v=3.1.67-build387';
const utility=new Set(['buff','stance','allHeal','cleanse','revive']);
export const CHAPTER_TWO_ACTIONS387=Object.freeze(Object.fromEntries(Object.values(CHAPTER_TWO_SPECIES387).flatMap(s=>s.authoredSkills.map(k=>[k.id,{...k,label:k.name,multiplier:k.power,utility:utility.has(k.type),pattern:utility.has(k.type)?'self':k.allEnemies?'all':'singleWeak',dispelOne:k.dispelEnemyBuff,hpShieldRate:k.selfShieldRate}]))));
export function installChapterTwoHabitats387(encounters){
 const set=(id,keys,name,extra={})=>{if(encounters[id])encounters[id]={...encounters[id],species:keys.map(key=>`ch2_${key}`),authorities:undefined,roles:undefined,name,chapterTwoNative383:true,chapterTwoNative387:true,...extra};};
 set('roam0_1',['lilica','kororu','balk','pipia'],'露鈴と煤紫の案内隊');
 set('roam1_4',['rikka','rinne','grant'],'白黒の裁縫人形隊');
 set('roam2_1',['seria','carmia','velg'],'忘却の硝子音楽堂');
 set('roam4_3',['luxion','aeriel','ione','vespera'],'終始の双冠と白紙の衛',{level:5200,hp:1650000,atk:74000,def:35000,spd:16000,experience:240000,gold:290000});
}
