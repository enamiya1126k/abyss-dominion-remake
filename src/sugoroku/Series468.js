import{CARD_BY_ID463}from'./Catalog463.js';
export function seriesState468(hand,set){const cards=hand.filter(h=>CARD_BY_ID463[h.cardId]?.set===set),parts=[...new Set(cards.map(h=>CARD_BY_ID463[h.cardId].part))].sort();return{set,cards,parts,count:cards.length,unique:parts.length,complete:parts.length===4,playable:cards.find(h=>h.playable)}}
export function handGroups468(hand){const seen=new Set(),groups=[];for(const h of hand){const set=CARD_BY_ID463[h.cardId]?.set;if(!set){groups.push({cards:[h]});continue}if(seen.has(set))continue;seen.add(set);groups.push(seriesState468(hand,set))}return groups}
export function tidyHand468(hand){
 const groups=handGroups468(hand);
 const priority=g=>g.cards.some(h=>h.playable)?0:g.complete?1:g.set?2:g.cards.some(h=>['passive','reaction'].includes(CARD_BY_ID463[h.cardId].timing)||CARD_BY_ID463[h.cardId].kind==='curse')?4:3;
 return groups.map((g,i)=>({...g,i})).sort((a,b)=>priority(a)-priority(b)||a.i-b.i).flatMap(g=>g.cards.slice().sort((a,b)=>g.set?CARD_BY_ID463[a.cardId].part-CARD_BY_ID463[b.cardId].part:0));
}
export function completedSeries468(before,after){return['heroes','dark'].filter(set=>!seriesState468(before,set).complete&&seriesState468(after,set).complete)}
