// Compare server snapshots, never the synthetic state of a local ticket battle.
export function acceptsWorldRaidState431(current,next){
 if(!next)return false;
 if(!current||next.available===false)return true;
 if(next.revision!==current.revision)return next.revision>current.revision;
 return Number(next.serverNow??0)>=Number(current.serverNow??0);
}
