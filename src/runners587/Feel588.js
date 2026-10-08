import {course589} from './Courses589.js';
// The renderer and thumb pad share these small, testable layout decisions.
export function keyCode588(e){if(['ArrowLeft','ArrowRight','ArrowUp','KeyA','KeyD','KeyW','KeyX','KeyK','Space'].includes(e.code))return e.code;return{a:'KeyA',d:'KeyD',w:'KeyW',x:'KeyX',k:'KeyK',' ':'Space',ArrowLeft:'ArrowLeft',ArrowRight:'ArrowRight',ArrowUp:'ArrowUp'}[e.key?.toLowerCase?.()]??({ArrowLeft:'ArrowLeft',ArrowRight:'ArrowRight',ArrowUp:'ArrowUp'}[e.key]);}
export function thumb588(x,y,rect){if(y<rect.top-55||y>rect.bottom+55||x<rect.left-65||x>rect.right+65)return 'neutral';const middle=(rect.left+rect.right)/2;return Math.abs(x-middle)<7?'neutral':x<middle?'left':'right';}
export function rank588(g,p){const value=q=>q.finishTime!=null?[1,-(q.deaths??0),-q.finishTime]:[0,Math.floor(q.furthest),-(q.deaths??0)];const a=value(p);return 1+g.players.filter(q=>!q.departed&&(()=>{const b=value(q);for(let i=0;i<a.length;i++)if(b[i]!==a[i])return b[i]>a[i];return false;})()).length;}

export function look588(width,height,p,world){const course=course589(world);const landscape=width>650,view=width>650?900:width<350?440:480,scale=width/view,anchor=landscape?Math.min(height-86,height*.75):height*.73;
 // Turning in midair must not shift the camera target by a sixth of a screen.
 const camera=Math.max(0,Math.min(course.length-view,p.x-view*.36+Math.max(-24,Math.min(24,(p.vx??0)*.08))));
 // Keep spring jumps and the upper route below the HUD, including short screens.
 const top=landscape?80:78,base=anchor-300*scale,offsetY=p.y>340?Math.min(base,anchor-(p.y-40)*scale):Math.max(base,top-(p.y-60)*scale);
 return{view,scale,camera,offsetY,anchor};
}
