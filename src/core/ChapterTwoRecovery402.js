// Run only when loading a save, or after rejecting an invalid checkpoint.
// During battle creation the pending receipt legitimately precedes activeBattle.
export function recoverChapterTwoPending402(state){
 if(!state||state.activeBattle)return 0;
 const chapter=state.chapterTwo376;if(!chapter||typeof chapter!=='object')return 0;
 const runs=new Set([chapter.run,...Object.values(chapter.runs378??{})]);let recovered=0;
 for(const run of runs){if(run&&typeof run==='object'&&run.pending){run.pending=null;recovered++;}}
 return recovered;
}
