// Cumulative intents allow immediate taps without waiting for a roundtrip.
// The server still owns acceptance, stamina, total uses and actual movement.
export function boostPower457(x,elapsed){return 1+.18*(x.boostEnds457??[]).filter(t=>t>elapsed).length}
export function boostIntent457(room,selfId,pending){const index=room?.racers?.findIndex(x=>x.ownerId===selfId)??-1,x=room?.live456?.runners?.[index],accepted=x?.boostSeq??0,wanted=pending?.raceId===room?.id?Math.max(accepted,pending.seq):accepted;return{index,x,accepted,wanted,waiting:Math.max(0,wanted-accepted),stamina:Math.max(0,(x?.stamina??100)-Math.max(0,wanted-accepted)*10)}}
export function nextBoost457(room,selfId,pending){const v=boostIntent457(room,selfId,pending);if(room?.rulesVersion<5||room?.phase!=='race'||!v.x||v.x.finishMs!==null||v.wanted>=5||v.stamina<10)return null;return{raceId:room.id,seq:v.wanted+1}}
