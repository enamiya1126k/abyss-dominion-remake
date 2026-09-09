export const MEMORY_MAX_STAGE=19;
export const memoryLevel=stage=>1000+500*(Math.max(1,Math.min(MEMORY_MAX_STAGE,Math.floor(Number(stage)||1)))-1);
export function memoryProgress(state){const c=state.campaign100??{},r=c.royal360;if(!r)return{best:0,unlocked:1};if(!Number.isFinite(r.memoryCleared379))r.memoryCleared379=Math.min(MEMORY_MAX_STAGE,Math.max(0,Math.floor(Number(r.memoryWins)||0),Math.floor(Number(c.revengeBest361)||0)));const best=Math.max(0,Math.min(MEMORY_MAX_STAGE,r.memoryCleared379));return{best,unlocked:Math.min(MEMORY_MAX_STAGE,best+1)};}
