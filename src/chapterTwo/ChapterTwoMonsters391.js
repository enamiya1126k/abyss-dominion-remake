import {CHAPTER_TWO_SPECIES391} from '../data/chapterTwoSpecies391.js?v=3.1.71-build391';
const utility=new Set(['buff','stance','allHeal','cleanse','revive']);
export const CHAPTER_TWO_ACTIONS391=Object.freeze(Object.fromEntries(Object.values(CHAPTER_TWO_SPECIES391).flatMap(s=>s.authoredSkills.map(k=>[k.id,{...k,label:k.name,multiplier:k.power,utility:utility.has(k.type),pattern:utility.has(k.type)?'self':k.allEnemies?'all':'singleWeak',dispelOne:k.dispelEnemyBuff,hpShieldRate:k.selfShieldRate}]))));
export function installChapterTwoHabitats391(encounters){
 const alternate=(base,keys,name)=>{const old=encounters[base];if(!old)return;const id=`${base}_391`;
  encounters[base]={...old,roamingAlternates391:[id]};
  encounters[id]={...old,roamingAlternates391:undefined,roamingBase391:base,species:keys.map(k=>`ch2_${k}`),authorities:undefined,roles:undefined,name,chapterTwoNative383:true,chapterTwoNative391:true};
 };
 alternate('roam0_1',['nizelle','charne','rithia','lilica'],'根灯に導かれた黒紅の双羽');
 alternate('roam2_3',['ferne','clarisse','noctelle','auriane'],'宵暁の鐘が響く薔薇聖堂');
 alternate('roam4_4',['lunaria','solaria','meliora','elyselle'],'日月を巡らせる双輪と双鍵');
}
export const chapterTwoRoamingBase391=(id,encounters)=>encounters[id]?.roamingBase391??id;
// Selection is deterministic for the saved visit. An in-flight legacy fight stays intact.
export function chapterTwoRoamingId391(run,id,encounters){
 if(!run)return id;
 const base=chapterTwoRoamingBase391(id,encounters),eliteId=`${base}_elite393`,choices=[base,...(encounters[base]?.roamingAlternates391??[])];
 if(choices.includes(run.pending?.encounter)||encounters[run.pending?.encounter]?.roamingBase391===base)return run.pending.encounter;
 if(Number.isInteger(run.eliteTier393)&&run.eliteTier393>=1&&run.eliteTier393<=3&&encounters[eliteId])return eliteId;
 if(choices.includes(run.pending?.encounter))return run.pending.encounter;
 const visit=Number(run.visit380),index=Number.isFinite(visit)?Math.max(0,Math.floor(visit))%choices.length:0;
 return choices[index];
}
