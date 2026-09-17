import{boostLimit462,boostCost462}from'./RaceRules462.js';
// Cumulative intents allow immediate taps without waiting for a roundtrip.
// The server still owns acceptance, stamina, total uses and actual movement.
export function boostPower457(x,elapsed){return 1+.18*Math.min(x.temperament462||x.restUntil462!==undefined?5:Infinity,(x.boostEnds457??[]).filter(t=>t>elapsed).length)}
export function boostIntent457(room,selfId,pending){const index=room?.racers?.findIndex(x=>x.ownerId===selfId)??-1,x=room?.live456?.runners?.[index],accepted=x?.boostSeq??0,wanted=pending?.raceId===room?.id?Math.max(accepted,pending.seq):accepted;return{index,x,accepted,wanted,waiting:Math.max(0,wanted-accepted),stamina:Math.max(0,(x?.stamina??100)-Math.max(0,wanted-accepted)*boostCost462(room))}}
export function nextBoost457(room,selfId,pending){const v=boostIntent457(room,selfId,pending);if(room?.rulesVersion<5||room?.phase!=='race'||!v.x||v.x.finishMs!==null||v.wanted>=boostLimit462(room)||v.stamina<boostCost462(room))return null;return{raceId:room.id,seq:v.wanted+1}}
