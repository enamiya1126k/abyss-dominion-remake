import {relicById394,relicItemText394} from '../data/chapterTwoRelics394.js';
import {relicRefinePrice394,relicRefineCandidates394} from './ChapterTwoRefining394.js';
import {normalizeChapterTwoCollection395} from './ChapterTwoCollection395.js?v=3.1.75-build395';
export function previewRelicRefine395(state,targetId,materialIds=[]){
 if(state.player?.inRun||state.activeBattle)return{ok:false,message:'帰還してから固有鍛錬を行ってください。'};
 const target=(state.equipment??[]).find(i=>i.id===targetId);if(!relicById394(target?.chapterTwoRelic394))return{ok:false,message:'第二章の限定装備を選んでください。'};
 const before=Math.max(0,Math.floor(Number(target.plus)||0)),ids=Array.isArray(materialIds)?materialIds:[],count=ids.length;
 if(before>=30)return{ok:false,message:'固有鍛錬は＋30で完成です。'};
 if(!count)return{ok:false,message:'消費する素材を選択してください。'};
 if(new Set(ids).size!==count||count>30-before)return{ok:false,message:`＋30まで、素材を最大${30-before}個選択できます。`};
 const candidates=relicRefineCandidates394(state,target);if(ids.some(id=>!candidates.some(m=>m.id===id)))return{ok:false,message:'素材が変更されています。未装備・お気に入り解除・ロック解除済みの同じ限定装備を選び直してください。'};
 const price=ids.reduce((sum,_id,i)=>sum+relicRefinePrice394({...target,plus:before+i}),0),gold=Math.max(0,Number(state.player?.gold)||0);
 return{ok:true,targetId,count,before,after:before+count,price,affordable:gold>=price,remainingGold:gold-price,materialIds:[...ids]};
}
export function refineChapterTwoRelics395(state,targetId,materialIds){
 const plan=previewRelicRefine395(state,targetId,materialIds);if(!plan.ok)return plan;if(!plan.affordable)return{ok:false,message:`${plan.price.toLocaleString()}G必要です。`};
 normalizeChapterTwoCollection395(state);
 const target=state.equipment.find(i=>i.id===targetId),consumed=new Set(plan.materialIds);state.equipment=state.equipment.filter(i=>!consumed.has(i.id));state.player.gold-=plan.price;target.plus=plan.after;target.fixedEffectText=relicItemText394(target);
 return{ok:true,id:target.id,name:target.name,plus:target.plus,price:plan.price,consumed:plan.materialIds};
}
