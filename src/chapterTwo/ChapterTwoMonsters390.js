import {CHAPTER_TWO_SPECIES390} from '../data/chapterTwoSpecies390.js?v=3.1.70-build390';
const utility=new Set(['buff','stance','allHeal','cleanse','revive']);
export const CHAPTER_TWO_ACTIONS390=Object.freeze(Object.fromEntries(Object.values(CHAPTER_TWO_SPECIES390).flatMap(s=>s.authoredSkills.map(k=>[k.id,{...k,label:k.name,multiplier:k.power,utility:utility.has(k.type),pattern:utility.has(k.type)?'self':k.allEnemies?'all':'singleWeak',dispelOne:k.dispelEnemyBuff,hpShieldRate:k.selfShieldRate}]))));
export function installChapterTwoHabitats390(encounters){
 const set=(id,keys,name,extra={})=>{if(encounters[id])encounters[id]={...encounters[id],species:keys.map(key=>`ch2_${key}`),authorities:undefined,roles:undefined,name,chapterTwoNative383:true,chapterTwoNative390:true,...extra};};
 set('roam1_1',['mirea','viola','rostia','althea'],'黒根を護る双誓の姉妹',{level:2600,hp:920000,atk:39000,def:23000,spd:10100,experience:140000,gold:175000});
 set('roam1_4',['rikka','rinne','shelza','miretta'],'焼け跡を繕う根脈の部隊');
 set('roam2_1',['seria','carmia','iselle','virelle'],'忘却を砕く双晶の鎖隊');
 set('roam4_1',['celes','lumina','sephira','astrelle'],'輪廻を巡る星門の詠唱隊',{level:5600,hp:2200000,atk:83000,def:42000,spd:17200,experience:290000,gold:350000});
 // Ione remains in roam3_3; Mimelia stays in the same region.
 set('roam4_3',['luxion','aeriel','vespera','mimelia'],'記録を護る光冠と玻璃姫');
}
