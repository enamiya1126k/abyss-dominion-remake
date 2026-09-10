import {CHAPTER_TWO_SPECIES384} from '../data/chapterTwoSpecies384.js?v=3.1.70-build390';
const utility=new Set(['buff','stance','allHeal','cleanse','revive']);
export const CHAPTER_TWO_ACTIONS384=Object.freeze(Object.fromEntries(Object.values(CHAPTER_TWO_SPECIES384).flatMap(s=>s.authoredSkills.map(k=>[k.id,{...k,label:k.name,multiplier:k.power,utility:utility.has(k.type),pattern:utility.has(k.type)?'self':k.allEnemies?'all':'singleWeak',dispelOne:k.dispelEnemyBuff,hpShieldRate:k.selfShieldRate}]))));

// Fixed repeatable rooms keep both installments obtainable, with no reload rerolls.
export function installChapterTwoHabitats384(encounters){
 const set=(id,keys,name,extra={})=>{if(encounters[id])encounters[id]={...encounters[id],species:keys.map(key=>`ch2_${key}`),authorities:undefined,roles:undefined,name,chapterTwoNative383:true,chapterTwoNative384:true,...extra};};
 set('roam0_3',['nerik','grant','kororu'],'根継ぎの巡視隊');
 set('roam1_3',['senela','grant','shelza'],'灰燭と黒根の番兵');
 set('roam2_3',['razil','senela','velg'],'忘却の鎖牢隊');
 set('roam3_3',['ione','grant','noctia','nerik'],'天秤の聖壇守');
 set('roam4_1',['mimelia','nerik','astera'],'星機匣と記録の守衛');
 set('roam4_3',['luxion','razil','ione','grant'],'白紙の執政機関',{level:4900,hp:1450000,atk:69000,def:33000,spd:15300,experience:210000,gold:260000});
}

// Native set 2 uses the same real transfer on both sides: never creates mana.
export function chapterTwoManaTransfer384(source,target,rate,sourceMax,targetMax){
 const available=Math.max(0,Number(target.currentMp)||0),maximum=Math.max(0,Number(targetMax)||0);
 const drained=Math.min(available,Math.max(0,Math.floor(maximum*Math.max(0,Math.min(.8,Number(rate)||0)))));
 const before=Math.max(0,Number(source.currentMp)||0);
 target.currentMp=available-drained;source.currentMp=Math.min(Math.max(before,Number(sourceMax)||0),before+drained);
 return{drained,gained:source.currentMp-before};
}
