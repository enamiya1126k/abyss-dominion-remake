import{appendHistory459}from'./RaceCourse459.js';
import{expNeedFor,totalExperience,applyTotalExperience}from'../models/Monster.js';
import{RACE451,validTicket451}from'./RaceRules451.js';
export function raceBank451(state,key){state.race451??={accounts:{}};state.race451.accounts??={};return state.race451.accounts[key]??={pending:null,applied:{}}}
function commit(save,fn){const previous=structuredClone(save.state);try{const result=fn();if(save.save()!==true)throw Error('保存できませんでした。購入・受取は再試行できます');return result}catch(e){save.state=previous;throw e}}
export function reserveRaceBet451(save,key,packet){const bank=raceBank451(save.state,key);if(bank.pending)throw Error('前の馬券の受付を確認しています');if(bank.applied[`result:${packet.raceId}:${key.split('|').at(-1)}`])throw Error('終了済みのレースです');if(!key||!validTicket451(packet.ticket))throw Error('馬券の予想が不正です');const n=packet.amount,gold=save.state.player.gold;if(!Number.isSafeInteger(n)||n<RACE451.minBet||n>RACE451.maxBet||!Number.isFinite(gold)||gold<n)throw Error('購入金額は所持GOLD以内の整数にしてください（計算可能な上限あり）');return commit(save,()=>{save.state.player.gold-=n;raceBank451(save.state,key).pending=structuredClone(packet);return packet})}
export function applyRaceDelivery451(save,key,entry){const bank=raceBank451(save.state,key);if(bank.applied[entry.id])return{duplicate:true};if(typeof entry.id!=='string'||!['refund','result'].includes(entry.kind)||!Number.isSafeInteger(entry.gold)||entry.gold<0||entry.gold>RACE451.maxBet*1000+RACE451.maxPrize)throw Error('受取情報が不正です');
 if(entry.kind==='refund'&&entry.gold!==entry.amount)throw Error('返金額が購入記録と一致しません');if(entry.kind==='result'&&(entry.playerId!==key.split('|').at(-1)||!Number.isSafeInteger(entry.stake)||entry.stake<0||entry.gold!==entry.payout+entry.prize))throw Error('精算先と金額を確認できません');
 const pending=bank.pending,needsEscrow=entry.kind==='refund'||entry.stake>0,amount=entry.kind==='refund'?entry.amount:entry.stake;
 if(needsEscrow&&(!pending||pending.requestId!==entry.requestId||pending.amount!==amount))throw Error('馬券の購入記録と精算が一致しません。元のセーブで再接続してください');
 const training=entry.training??{affection:5,expRate:.02};if(entry.kind==='result'&&(!Number.isInteger(training.affection)||training.affection<5||training.affection>8||![.02,.022,.025,.03].includes(training.expRate)))throw Error('育成報酬を確認できません');
 return commit(save,()=>{const b=raceBank451(save.state,key);save.state.player.gold=Math.min(Number.MAX_SAFE_INTEGER,Math.max(0,Number(save.state.player.gold)||0)+entry.gold);let exp=0;
  if(entry.kind==='result'){if(entry.history459&&entry.history459.raceId===entry.raceId&&entry.history459.monsterId===entry.monsterId)b.history459=appendHistory459(b.history459,entry.history459);const m=save.state.monsters?.find(m=>m.id===entry.monsterId);if(m){exp=Math.max(10,Math.floor(expNeedFor(m)*training.expRate));applyTotalExperience(m,totalExperience(m)+exp);m.affection=Math.min(1000,Math.max(0,Number(m.affection??m.bond)||0)+training.affection);m.bond=m.affection}}
  if(needsEscrow)b.pending=null;b.applied[entry.id]={at:Date.now(),gold:entry.gold,exp,affection:entry.kind==='result'?training.affection:0};return{duplicate:false,gold:entry.gold,exp};
 })
}
