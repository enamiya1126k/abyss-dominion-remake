import {CHAPTER_TWO_SPECIES392} from '../data/chapterTwoSpecies392.js?v=3.1.72-build392';
const utility=new Set(['buff','stance','allHeal','cleanse','revive']);
export const CHAPTER_TWO_ACTIONS392=Object.freeze(Object.fromEntries(Object.values(CHAPTER_TWO_SPECIES392).flatMap(s=>s.authoredSkills.map(k=>[k.id,{...k,label:k.name,multiplier:k.power,utility:utility.has(k.type),pattern:utility.has(k.type)?'self':k.allEnemies?'all':'singleWeak',dispelOne:k.dispelEnemyBuff,hpShieldRate:k.selfShieldRate}]))));
export function installChapterTwoHabitats392(encounters){
 const alternate=(base,keys,name)=>{const old=encounters[base];if(!old)return;const id=`${base}_392`;
  encounters[base]={...old,roamingAlternates391:[...(old.roamingAlternates391??[]),id]};
  encounters[id]={...old,roamingAlternates391:undefined,roamingBase391:base,species:keys.map(k=>`ch2_${k}`),authorities:undefined,roles:undefined,name,chapterTwoNative383:true,chapterTwoNative392:true};
 };
 alternate('roam1_3',['morina','elmize','tillea','grant'],'悪夢を刈る双子と栞の書姫');
 alternate('roam3_1',['dracia','rucie','ione','noctia'],'天秤を解き放つ黒白の双竜');
 alternate('roam4_3',['nemesia','everia','aeriel','vespera'],'夜明けを刻む二組の双冠');
}
