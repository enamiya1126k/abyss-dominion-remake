import {chapterTwoFrameBounds383} from '../ui/ChapterTwoSprite383.js';
import {MOTHER_ID422} from './Mother422.js';
// Same 64px frame, 2.65 scale and 61px foot pivot as drawExplorationMonster.
// Include the visible body and name, not the transparent atlas margins.
export function motherFieldHitBounds433({camera,TILE,actor,nameBounds,padding=6}){
 const foot=camera.world((actor.position.x+.5)*TILE,(actor.position.y+.9)*TILE),b=chapterTwoFrameBounds383(MOTHER_ID422),s=camera.z*2.65;
 const body={left:foot.x-32*s+64*s*b.left,right:foot.x-32*s+64*s*b.right,top:foot.y-61*s+64*s*b.top,bottom:foot.y-61*s+64*s*b.bottom};
 return {left:Math.min(body.left,nameBounds.left)-padding,right:Math.max(body.right,nameBounds.right)+padding,top:Math.min(body.top,nameBounds.top)-padding,bottom:Math.max(body.bottom,nameBounds.bottom)+padding};
}
