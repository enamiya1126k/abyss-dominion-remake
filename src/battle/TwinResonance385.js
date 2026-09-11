import {beginPairSequence409,beforePairHit409,afterPairHit409,finishPairSequence409,notePairDispel409,notePairCleanse409,notePairMp409,writePairShield409} from './PairSynergy409.js?v=3.1.89-build409';
import {reserveRound408} from './ChapterTwoAbilityRuntime408.js?v=3.1.88-build408';
import {CHAPTER_TWO_PAIRS392} from '../data/chapterTwoPairs392.js?v=3.1.72-build392';
import {CHAPTER_TWO_PAIRS391} from '../data/chapterTwoPairs391.js?v=3.1.71-build391';
import {CHAPTER_TWO_PAIRS390} from '../data/chapterTwoPairs390.js?v=3.1.70-build390';
import {ultimateIsolated,ultimateExtraBlocked} from '../core/EndgameUltimateSystem.js';
import {CHAPTER_TWO_PAIRS389} from '../data/chapterTwoPairs389.js?v=3.1.69-build389';
import {CHAPTER_TWO_PAIRS388} from '../data/chapterTwoPairs388.js?v=3.1.68-build388';
import {CHAPTER_TWO_PAIRS387} from '../data/chapterTwoPairs387.js?v=3.1.67-build387';
import {CHAPTER_TWO_PAIRS386} from '../data/chapterTwoPairs386.js?v=3.1.66-build386';
// The quota is saved with the battle, keyed by species (duplicate copies cannot reset it).
export const TWIN_PAIRS385=Object.freeze([
 {id:'mirrors',name:'双鏡狂奏',members:['ch2_ryune','ch2_rose'],names:['リュネ','ロゼ'],power:1.10,hits:3,damageClass:'physical',defenseIgnore:.30,shield:.12,scope:'twins',description:'相方が敵単体へ1.10倍×3連撃（防御30%無視）。双子に最大HP12%の障壁。'},
 {id:'talismans',name:'双符百鬼夜行',members:['ch2_shion','ch2_suiren'],names:['シオン','スイレン'],power:2.20,hits:1,all:true,damageClass:'magic',defenseIgnore:0,heal:.12,scope:'party',debuff:{kind:'healDown',value:.35,turns:2},description:'相方が敵全体へ2.20倍の魔法追撃。命中した敵のHP回復35%低下（2ターン）。生存味方全体のHP12%回復。'},
 {id:'wings',name:'天穹・双翼聖歌',members:['ch2_aure','ch2_noelle'],names:['アウレ','ノエル'],power:3,hits:1,all:true,damageClass:'hybrid',defenseIgnore:0,heal:.20,shield:.20,scope:'party',description:'相方が敵全体へ3.00倍の追撃（高い方の攻撃・魔力で判定）。生存味方全体のHP20%回復＋最大HP20%の障壁。'}
]);
export const RESONANCE_PAIRS385=Object.freeze([...TWIN_PAIRS385,...CHAPTER_TWO_PAIRS386,...CHAPTER_TWO_PAIRS387,...CHAPTER_TWO_PAIRS388,...CHAPTER_TWO_PAIRS389,...CHAPTER_TWO_PAIRS390,...CHAPTER_TWO_PAIRS391,...CHAPTER_TWO_PAIRS392]);
export const TWIN_RULE385='通常戦闘で指定の2人が同じ陣営で生存中、通常攻撃・固有スキルの後に発動。各キャラにつき1ラウンド1回、1組で最大2回。追加MPなし。追撃から再発動せず、戦闘不能・捕獲・隔離・追加行動禁止・行動不能（睡眠・凍結など）で連携停止。';
export function twinPair385(subject){const id=typeof subject==='string'?subject:subject?.speciesId;return RESONANCE_PAIRS385.find(p=>p.members.includes(id))??null;}
export function twinAlive385(unit,side='ally'){return !!unit&&!unit.captured&&Number(side==='enemy'?unit.hp:unit.currentHp)>0;}
export function twinRoster385(battle,side='ally'){return (side==='enemy'?battle?.enemies:battle?.party)??[];}
export function twinMembers385(pair,roster,side='ally',blocked=()=>false){
 return pair.members.map(id=>roster.find(u=>u.speciesId===id&&twinAlive385(u,side)&&!blocked(u)));
}
export function twinActionBlocked395(battle,unit,side='ally'){
 const control=new Set(['sleep','paralysis','freeze','charm','confusion','fear']);
 return ultimateIsolated(battle,unit)||ultimateExtraBlocked(battle,unit)||
 (battle?.[side==='enemy'?'enemyEffects':'allyEffects']?.[unit?.id]??[]).some(e=>(e.turns??1)>0&&(e.kind==='stun'||control.has(String(e.kind??'').replace(/^status:/,''))))||
 (battle?.[side==='enemy'?'enemyStatuses':'allyAilments']?.[unit?.id]??[]).some(e=>(e.turns??1)>0&&control.has(e.id));
}
export function twinReady385(battle,actor,side='ally',blocked=()=>false){
 const supplied=blocked;blocked=u=>twinActionBlocked395(battle,u,side)||supplied(u);
 const pair=twinPair385(actor),roster=twinRoster385(battle,side);
 if(!pair||!roster.includes(actor)||!twinAlive385(actor,side)||blocked(actor))return null;
 const members=twinMembers385(pair,roster,side,blocked);
 if(members.some(u=>!u))return null;
 // The acting copy must be used, rather than another copy of the same sister.
 members[pair.members.indexOf(actor.speciesId)]=actor;
 return{pair,members,actor,partner:members.find(u=>u.speciesId!==actor.speciesId),side};
}
export function reserveTwin385(battle,actor,side='ally',blocked=()=>false){
 const plan=twinReady385(battle,actor,side,blocked);if(!plan)return null;
 const turn=Math.max(1,Math.floor(Number(battle.turn)||1)),key=`${side}:${plan.pair.id}:${actor.speciesId}`;
 const state=battle.twinResonance385??(battle.twinResonance385={used:{}});state.used??={};
 if(!reserveRound408(state.used,key,turn))return null;
 const count=plan.pair.members.filter(id=>Number(state.used[`${side}:${plan.pair.id}:${id}`])===turn).length;
 if(plan.pair.burst&&count>=plan.pair.burst.threshold)plan.pair={...plan.pair,...plan.pair.burst,finisher386:true};
 if(plan.pair.charge390){
  const key=`${side}:${plan.pair.id}`,charge=plan.pair.charge390;state.charge390??={};
  const next=Math.min(charge.threshold-1,Math.max(0,Math.floor(Number(state.charge390[key])||0)))+1;
  state.charge390[key]=next>=charge.threshold?0:next;
  plan.pair=next>=charge.threshold?{...plan.pair,...charge.release,finisher390:true}:{...plan.pair,charging390:true,chargeCount390:next};
 }
 return plan;
}
const running=new WeakSet();
const counterRunning390=new WeakSet();
const counterBlocked390=(battle,u)=>ultimateIsolated(battle,u)||ultimateExtraBlocked(battle,u)||[...(battle.allyEffects?.[u?.id]??[]),...(battle.enemyEffects?.[u?.id]??[])].some(e=>['stun','status:freeze','status:sleep'].includes(e.kind)&&(e.turns??1)>0)||[...(battle.allyAilments?.[u?.id]??[]),...(battle.enemyStatuses?.[u?.id]??[])].some(e=>['freeze','sleep'].includes(e.id)&&(e.turns??1)>0);
const guarded390=(battle,u,side,pair)=>(battle[side==='enemy'?'enemyEffects':'allyEffects']?.[u.id]??[]).some(e=>e.kind==='guard'&&e.sourceKey===`pair:${pair.id}`&&e.turns>0&&e.value>0);
// Queue a single response per defended species per round. Pure data survives checkpoints.
export function queuePairCounter390(battle,defender,attacker,side='ally',landed=false){
 if(!landed||counterRunning390.has(battle))return false;
 const plan=twinReady385(battle,defender,side,u=>counterBlocked390(battle,u)),other=side==='enemy'?'ally':'enemy';
 if(!plan?.pair.counter390||!twinRoster385(battle,other).includes(attacker)||!twinAlive385(attacker,other)||!guarded390(battle,defender,side,plan.pair))return false;
 const state=battle.twinResonance385??(battle.twinResonance385={used:{}}),turn=Math.max(1,Math.floor(Number(battle.turn)||1)),key=`${side}:${plan.pair.id}:${defender.speciesId}`;
 state.counterUsed390??={};if(!reserveRound408(state.counterUsed390,key,turn))return false;
 (state.counterQueue390??=[]).push({side,defenderId:defender.id,attackerId:attacker.id,pairId:plan.pair.id,turn});return true;
}
export async function resolvePairCounters390(battle,environment){
 if(counterRunning390.has(battle)||!battle?.twinResonance385?.counterQueue390?.length)return 0;
 const pending=battle.twinResonance385.counterQueue390.splice(0);let count=0;counterRunning390.add(battle);
 try{for(const entry of pending){
  const side=entry.side,other=side==='enemy'?'ally':'enemy',defender=twinRoster385(battle,side).find(u=>u.id===entry.defenderId),attacker=twinRoster385(battle,other).find(u=>u.id===entry.attackerId);
  const plan=twinReady385(battle,defender,side,u=>counterBlocked390(battle,u));
  if(!plan?.pair.counter390||plan.pair.id!==entry.pairId||!guarded390(battle,defender,side,plan.pair)||!twinAlive385(attacker,other)||counterBlocked390(battle,attacker)||entry.turn!==Math.max(1,Math.floor(Number(battle.turn)||1)))continue;
  const env=environment(defender,side),pair={...plan.pair,...plan.pair.counter390,hits:1,shield:0,partyEffect:null,reaction390:true};
  const valid=()=>plan.members.every(u=>twinRoster385(battle,side).includes(u)&&twinAlive385(u,side)&&!twinActionBlocked395(battle,u,side)&&!env.blocked(u))&&guarded390(battle,defender,side,plan.pair)&&env.opponents().includes(attacker);
  if(!valid())continue;await env.cue({...plan,pair});if(!valid())continue;
  const response409={...plan,pair},synergy409=beginPairSequence409(battle,response409,env);
  const damage409=await env.hit(plan.partner,attacker,pair);afterPairHit409(synergy409,attacker,damage409,pair);
  await finishPairSequence409(synergy409,()=>plan.members.every(u=>twinRoster385(battle,side).includes(u)&&twinAlive385(u,side)&&!twinActionBlocked395(battle,u,side)&&!env.blocked(u)));count++;
 }}finally{counterRunning390.delete(battle);}return count;
}
// Shared orchestration keeps followups finite and rechecks deaths caused by counters.
export async function resolveTwin385(battle,actor,side,env){
 if(running.has(battle)||!env.opponents().length)return false;
 const plan=reserveTwin385(battle,actor,side,env.blocked);if(!plan)return false;
 running.add(battle);
 const valid=()=>plan.members.every(u=>twinRoster385(battle,side).includes(u)&&twinAlive385(u,side)&&!twinActionBlocked395(battle,u,side)&&!env.blocked(u));
 try{
  if(plan.pair.emergency&&plan.members.some(u=>env.hpRatio?.(u)<=plan.pair.emergency.threshold))plan.pair={...plan.pair,...plan.pair.emergency,rescue387:true};
  const synergy409=beginPairSequence409(battle,plan,env);
  await env.cue(plan);
  if(!valid())return true;
  const pair=plan.pair,targets=pair.all?[...env.opponents()]:[env.opponents().find(u=>u.id===env.targetId)??env.opponents()[0]];
  let dispelled=false;const dispelledTargets392=new Set();
  for(const chosen of targets){
   for(let i=0;i<pair.hits;i++){
    if(!valid())return true;
    const foes=env.opponents(),target=foes.includes(chosen)?chosen:pair.all?null:foes[0];if(!target)break;
    if(pair.dispelOne&&!dispelled){notePairDispel409(synergy409,env.dispel(target));dispelled=true;}
    if(pair.dispelEach392&&!dispelledTargets392.has(target)){notePairDispel409(synergy409,env.dispel(target));dispelledTargets392.add(target);}
    const statusBonus=pair.bonusVsStatus&&env.hasStatus?.(target,pair.bonusVsStatus.id)?pair.bonusVsStatus.multiplier:1;
    const hpBonus=pair.bonusVsHp392&&env.opponentHpRatio?.(target)<=pair.bonusVsHp392.threshold?pair.bonusVsHp392.multiplier:1;
    const effectBonus=pair.bonusVsEffects&&pair.bonusVsEffects.kinds.every(kind=>env.hasEffect?.(target,kind))?pair.bonusVsEffects.multiplier:1,bonus=statusBonus*effectBonus*hpBonus;
    const hitPair409=await beforePairHit409(synergy409,bonus===1?pair:{...pair,power:pair.power*bonus},target,i,chosen);
    const damage=await env.hit(plan.partner,target,hitPair409);
    if(!valid())return true;
    if(damage>0&&pair.debuff&&env.opponents().includes(target))env.weaken(target,pair.debuff);
    afterPairHit409(synergy409,target,damage,hitPair409);
   }
  }
  if(!valid())return true;
  const beneficiaries=pair.scope==='twins'?plan.members:twinRoster385(battle,side).filter(u=>twinAlive385(u,side)&&!env.blocked(u));
  for(const u of beneficiaries){
   if(!valid())return true;
   const eligible=()=>twinRoster385(battle,side).includes(u)&&twinAlive385(u,side)&&!env.blocked(u);
   if(!eligible())continue;
   if(pair.cleanse391)notePairCleanse409(synergy409,env.cleanse(u));
   if(pair.heal)await env.heal(u,pair.heal,plan.partner);
   if(!valid())return true;if(!eligible())continue;
   if(pair.mpHeal391)notePairMp409(synergy409,await env.restoreMp(u,pair.mpHeal391,plan.partner));
   if(!valid())return true;if(!eligible())continue;
   if(pair.shield){env.shield(u,pair.shield);if(synergy409&&env.maxHp){battle.pairSynergy409.maxHp[`${side}:${u.id}`]=env.maxHp(u);writePairShield409(battle,side,u,pair.shield,pair.id);}}
   if(pair.partyEffect)env.boost(u,{...pair.partyEffect,sourceKey:`pair:${pair.id}`});
  }
  await finishPairSequence409(synergy409,valid);
  return true;
 }finally{running.delete(battle);}
}
