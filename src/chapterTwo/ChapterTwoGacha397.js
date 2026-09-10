import {chapterTwoUnlocked} from './ChapterTwoSystem.js?v=3.1.82-build402';
import {SPECIES} from '../data/species.js';
import {createMonster} from '../models/Monster.js?v=3.1.82-build402';
import {MONSTER_STORAGE_CAP} from '../core/config.js?v=3.1.82-build402';

export const CHAPTER_TWO_GACHA_RATES397=Object.freeze({N:5,R:15,SR:35,SSR:25,UR:15,LR:4,'神話':1});
export const CHAPTER_TWO_GACHA_POOLS397=Object.freeze(Object.fromEntries(Object.keys(CHAPTER_TWO_GACHA_RATES397).map(rank=>[rank,Object.freeze(Object.values(SPECIES).filter(s=>s.chapterTwoOnly&&s.rarity===rank).map(s=>s.id))])));
export const chapterTwoGachaUnlocked397=state=>chapterTwoUnlocked(state);
const roll=random=>{const n=Number(random());return Number.isFinite(n)?Math.max(0,Math.min(.999999999999,n)):0;};
export function rollChapterTwoGacha397(random=Math.random){
 const ticket=Math.floor(roll(random)*10000);let limit=0;
 for(const [rank,percent]of Object.entries(CHAPTER_TWO_GACHA_RATES397)){
  limit+=percent*100;if(ticket>=limit)continue;
  const pool=CHAPTER_TWO_GACHA_POOLS397[rank];if(pool.length!==10)throw new Error(`Invalid chapter two pool: ${rank}`);
  return{rarity:rank,speciesId:pool[Math.floor(roll(random)*pool.length)]};
 }
 throw new Error('Invalid chapter two rates');
}
export function chapterTwoGachaCheck397(state,count){
 if(!chapterTwoGachaUnlocked397(state))return{ok:false,message:'第二章を解放すると利用できます。'};
 if(state.activeBattle||state.player?.inRun)return{ok:false,message:'戦闘・探索を終えてから召喚してください。'};
 if(![1,10].includes(count))return{ok:false,message:'1回か10回を選んでください。'};
 if((state.monsters?.length??0)+count>MONSTER_STORAGE_CAP)return{ok:false,message:`仲間の所持枠が${count}枠必要です。`};
 const cost=count*100,crystals=Number(state.player?.crystals);
 if(!Number.isFinite(crystals)||crystals<cost)return{ok:false,message:`魔晶石が足りません（必要 ${cost}個）。`};
 return{ok:true,cost};
}
export function drawChapterTwoGacha397(state,count,{random=Math.random}={}){
 const check=chapterTwoGachaCheck397(state,count);if(!check.ok)return check;
 // Construct all results first; no partial charge or grant if construction fails.
 const owned=new Set((state.monsters??[]).map(m=>m.speciesId));
 const results=Array.from({length:count},()=>{
  const {speciesId,rarity}=rollChapterTwoGacha397(random),species=SPECIES[speciesId],isNew=!owned.has(speciesId);
  const item=createMonster(speciesId,{nickname:species.name,obtainedMethod:'chapterTwoSummon',obtainedFloor:state.player.maxFloor});item.summonRarity=rarity;owned.add(speciesId);
  return{type:'monster',rarity,displayRarity:rarity,name:species.name,icon:species.emoji,speciesId,item,isNew};
 });
 state.monsters??=[];state.codex??={};state.codex.captures??={};state.codex.encounters??={};
 state.player.crystals-=check.cost;
 for(const r of results){state.monsters.push(r.item);for(const key of ['captures','encounters'])state.codex[key][r.speciesId]=(Number(state.codex[key][r.speciesId])||0)+1;}
 const prior=state.chapterTwoGacha397,draws=Number.isSafeInteger(prior?.draws)&&prior.draws>=0?prior.draws:0;
 state.chapterTwoGacha397={draws:Math.min(Number.MAX_SAFE_INTEGER,draws+count),lastReceipt:{count,cost:check.cost,monsterIds:results.map(r=>r.item.id)}};
 return{ok:true,cost:check.cost,results};
}
