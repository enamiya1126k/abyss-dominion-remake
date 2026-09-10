import {chapterTwoUnlocked} from './ChapterTwoSystem.js?v=3.1.82-build402';
import {MAGIC_CIRCLES398} from '../data/magicCircles398.js?v=3.1.78-build398';
import {normalizeMagicCircleState,createMagicCircleInstance} from '../core/MagicCircleSystem.js?v=3.1.78-build398';
export function claimCircleResearch398(state){
 if(!chapterTwoUnlocked(state))return{ok:false,message:'第二章を解放すると受け取れます。'};
 if(state.activeBattle||state.player?.inRun)return{ok:false,message:'戦闘・探索を終えてから受け取ってください。'};
 if(state.magicCircleResearch398?.claimed)return{ok:false,message:'受取済みです。'};
 normalizeMagicCircleState(state);const granted=[];
 for(const c of MAGIC_CIRCLES398){state.magicCircles.unlocked[c.id]=true;const item=createMagicCircleInstance(state,c.id,{instanceId:`mc:${c.id}:research398`,source:'research398'});if(item)granted.push(item);}
 state.magicCircleResearch398={claimed:true};return{ok:true,granted};
}
