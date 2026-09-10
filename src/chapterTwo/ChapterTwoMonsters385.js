import {CHAPTER_TWO_SPECIES385} from '../data/chapterTwoSpecies385.js?v=3.1.65-build385';
const utility=new Set(['buff','stance','allHeal','cleanse','revive']);
export const CHAPTER_TWO_ACTIONS385=Object.freeze(Object.fromEntries(Object.values(CHAPTER_TWO_SPECIES385).flatMap(s=>s.authoredSkills.map(k=>[k.id,{...k,label:k.name,multiplier:k.power,utility:utility.has(k.type),pattern:utility.has(k.type)?'self':k.allEnemies?'all':'singleWeak',dispelOne:k.dispelEnemyBuff,hpShieldRate:k.selfShieldRate}]))));
export function installChapterTwoHabitats385(encounters){
 const set=(id,keys,name,extra={})=>{if(encounters[id])encounters[id]={...encounters[id],species:keys.map(key=>`ch2_${key}`),authorities:undefined,roles:undefined,name,chapterTwoNative383:true,chapterTwoNative385:true,...extra};};
 set('roam0_1',['lilica','kororu','balk'],'煤紫の剣と封樹の従者');
 set('roam0_4',['ryune','rose','balk'],'封樹の双鏡姉妹');
 set('roam2_4',['shion','suiren','velg'],'冥路の双符姉妹');
 set('roam3_4',['aure','noelle'],'天律の双翼姉妹',{level:4300,hp:1200000,atk:56000,def:27000,spd:12500,experience:190000,gold:230000});
}
