import {relicById394,relicItemText394} from '../data/chapterTwoRelics394.js?v=3.1.74-build394';
export function relicRefinePrice394(item){const d=relicById394(item?.chapterTwoRelic394);return d?25000*(Math.max(0,Math.floor(Number(item.plus)||0))+1)*(d.area+1):0;}
export function relicRefineCandidates394(state,target){
 if(!relicById394(target?.chapterTwoRelic394))return [];
 const equipped=new Set((state.monsters??[]).flatMap(m=>Object.values(m.equipment??{})));
 return (state.equipment??[]).filter(i=>i.id!==target.id&&i.chapterTwoRelic394===target.chapterTwoRelic394&&!i.equippedBy&&!equipped.has(i.id)&&!i.favorite&&!i.locked&&!i.ruleOverrides?.unsellable).sort((a,b)=>(a.plus??0)-(b.plus??0)||(a.level??1)-(b.level??1));
}
export function refineChapterTwoRelic394(state,targetId,materialId){
 if(state.player?.inRun||state.activeBattle)return{ok:false,message:'帰還してから固有鍛錬を行ってください。'};
 const target=(state.equipment??[]).find(i=>i.id===targetId);if(!relicById394(target?.chapterTwoRelic394))return{ok:false,message:'第二章の限定装備を選んでください。'};
 const before=Math.max(0,Math.floor(Number(target.plus)||0));if(before>=30)return{ok:false,message:'固有鍛錬は＋30で完成です。'};
 const material=relicRefineCandidates394(state,target).find(i=>i.id===materialId);if(!material)return{ok:false,message:'未装備・お気に入り解除・ロック解除済みの同じ限定装備を1個選んでください。'};
 const price=relicRefinePrice394(target),gold=Math.max(0,Number(state.player?.gold)||0);if(gold<price)return{ok:false,message:`${price.toLocaleString()}G必要です。`};
 state.equipment=state.equipment.filter(i=>i.id!==material.id);state.player.gold=gold-price;target.plus=before+1;target.fixedEffectText=relicItemText394(target);
 return{ok:true,id:target.id,name:target.name,plus:target.plus,price,consumed:material.id};
}
