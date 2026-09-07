import {rollEnemyMagicCircle} from './MagicCircleSystem.js?v=3.1.40-build360';
// Campaign manifestations are tuned to the floor's ordinary progression.
// This never changes contracted characters, manual trials, or the authored skills.
export function campaignEndgameRates(floor){
 const f=Math.max(1,Number(floor)||1);if(f<80||f>100)return null;
 const progress=Math.max(0,Math.min(1,(f-80)/20));
 return{hp:.60+.20*progress,atk:.30+.30*progress,matk:.30+.30*progress,def:.65+.20*progress,mdef:.65+.20*progress,spd:.80+.10*progress};
}
export function applyCampaignEndgameBalance(enemy,floor,{campaign=true}={}){
 const rates=campaign&&enemy?.boss&&enemy?.endgameBossId?.startsWith('ten_')?campaignEndgameRates(floor):null;if(!rates||enemy.campaignBalance358)return enemy;
 const hpRate=Math.max(0,Math.min(1,Number(enemy.hp)/Math.max(1,enemy.maxHp)));
 for(const[key,rate]of Object.entries(rates)){const stat=key==='hp'?'maxHp':key;enemy[stat]=Math.max(1,Math.round((Number(enemy[stat])||0)*rate));if(enemy._preMagicCircleStats?.[stat]!=null)enemy._preMagicCircleStats[stat]=Math.max(1,Math.round(enemy._preMagicCircleStats[stat]*rate));}
 enemy.hp=Math.round(enemy.maxHp*hpRate);enemy.campaignBalance358={version:1,floor,rates};return enemy;
}
export function campaignEndgameCircle(floor,bossId,rank='tenGod'){
 let seed=2166136261;for(const ch of `campaign358:${Math.floor(floor)}:${bossId}`)seed=Math.imul(seed^ch.charCodeAt(0),16777619)>>>0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 return rollEnemyMagicCircle(Math.max(1,Math.floor(floor)*10),{rank,random,force:floor>=40});
}
