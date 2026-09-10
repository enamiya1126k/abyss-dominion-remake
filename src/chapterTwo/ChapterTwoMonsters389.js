import {CHAPTER_TWO_SPECIES389} from '../data/chapterTwoSpecies389.js?v=3.1.69-build389';
const utility=new Set(['buff','stance','allHeal','cleanse','revive']);
export const CHAPTER_TWO_ACTIONS389=Object.freeze(Object.fromEntries(Object.values(CHAPTER_TWO_SPECIES389).flatMap(s=>s.authoredSkills.map(k=>[k.id,{...k,label:k.name,multiplier:k.power,utility:utility.has(k.type),pattern:utility.has(k.type)?'self':k.allEnemies?'all':'singleWeak',dispelOne:k.dispelEnemyBuff,hpShieldRate:k.selfShieldRate}]))));
export function installChapterTwoHabitats389(encounters){
 const set=(id,keys,name,extra={})=>{if(encounters[id])encounters[id]={...encounters[id],species:keys.map(key=>`ch2_${key}`),authorities:undefined,roles:undefined,name,chapterTwoNative383:true,chapterTwoNative389:true,...extra};};
 set('roam0_1',['lilica','kororu','pipia','lumea'],'封書と夜露の案内隊');
 set('roam0_3',['nerik','ticta','nevia','elmina'],'封樹を巡る双藤の鎖隊');
 set('roam3_4',['aure','noelle','calista','solenne'],'双翼と双雷の聖壇衛');
 set('roam4_4',['ordia','astera','meliora','elyselle'],'修復の中枢と双鍵の姫',{level:5400,hp:1900000,atk:79000,def:39000,spd:16600,experience:265000,gold:315000});
}
