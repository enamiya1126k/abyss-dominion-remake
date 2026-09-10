import {CHAPTER_TWO_SPECIES386} from '../data/chapterTwoSpecies386.js?v=3.1.66-build386';
const utility=new Set(['buff','stance','allHeal','cleanse','revive']);
export const CHAPTER_TWO_ACTIONS386=Object.freeze(Object.fromEntries(Object.values(CHAPTER_TWO_SPECIES386).flatMap(s=>s.authoredSkills.map(k=>[k.id,{...k,label:k.name,multiplier:k.power,utility:utility.has(k.type),pattern:utility.has(k.type)?'self':k.allEnemies?'all':'singleWeak',dispelOne:k.dispelEnemyBuff,hpShieldRate:k.selfShieldRate}]))));
export function installChapterTwoHabitats386(encounters){
 const set=(id,keys,name,extra={})=>{if(encounters[id])encounters[id]={...encounters[id],species:keys.map(key=>`ch2_${key}`),authorities:undefined,roles:undefined,name,chapterTwoNative383:true,chapterTwoNative386:true,...extra};};
 set('roam0_3',['nerik','grant','kororu','ticta'],'封樹の工房巡視隊');
 set('roam1_1',['mirea','viola','shelza'],'黒根の薬毒工房');
 set('roam3_1',['kagura','sayo','noctia'],'天律の狐巫女姉妹');
 set('roam4_1',['celes','lumina','mimelia','nerik'],'星糸の終演舞台',{level:4900,hp:1450000,atk:69000,def:33000,spd:15300,experience:210000,gold:260000});
}
