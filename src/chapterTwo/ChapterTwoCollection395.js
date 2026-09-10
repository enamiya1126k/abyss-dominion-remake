import {CHAPTER_TWO_RELICS394,CHAPTER_TWO_CIRCLES394} from '../data/chapterTwoRelics394.js';
const list=x=>Array.isArray(x)?x:[];
const stores=[['equipment','所持品'],['reserveEquipment','予備倉庫'],['bossEquipmentVault','王装保管庫']];
export function chapterTwoCollection395(state){
 const known=state.chapterTwoCollection395??{},seen=new Set(),gear=[];
 for(const [key,location] of stores)for(const item of list(state[key])){if(!item?.id||seen.has(item.id))continue;seen.add(item.id);gear.push({item,location});}
 const instances=list(state.magicCircles?.instances),last=state.chapterTwo376?.lastReward?.spoils394;
 const relics=CHAPTER_TWO_RELICS394.map(def=>{const owned=gear.filter(x=>x.item.chapterTwoRelic394===def.id);return{...def,count:owned.length,acquired:owned.length>0||list(known.relics).includes(def.id)||last?.relic?.definition===def.id,highestPlus:owned.length?Math.max(...owned.map(x=>Math.max(0,Number(x.item.plus)||0))):null,locations:[...new Set(owned.map(x=>x.location))]};});
 const circles=CHAPTER_TWO_CIRCLES394.map(def=>{const ids=new Set(),owned=instances.filter(i=>{if(i.circleId!==def.id||!i.instanceId||ids.has(i.instanceId))return false;ids.add(i.instanceId);return true;});return{...def,count:owned.length,acquired:owned.length>0||list(known.circles).includes(def.id)||state.magicCircles?.unlocked?.[def.id]===true||last?.circle?.id===def.id,highestLevel:owned.length?Math.max(...owned.map(i=>Math.max(1,Number(i.level)||1))):null};});
 return{relics,circles,relicCount:relics.filter(r=>r.acquired).length,circleCount:circles.filter(c=>c.acquired).length};
}
// Bounded discovery ledger. Consumption never erases the entry; no retroactive rewards.
export function normalizeChapterTwoCollection395(state){
 const x=chapterTwoCollection395(state);state.chapterTwoCollection395={relics:x.relics.filter(r=>r.acquired).map(r=>r.id),circles:x.circles.filter(c=>c.acquired).map(c=>c.id)};return state.chapterTwoCollection395;
}
