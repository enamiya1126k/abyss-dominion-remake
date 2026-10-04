import {course589} from './Courses589.js';
// The renderer and thumb pad share these small, testable layout decisions.
export function keyCode588(e){if(['ArrowLeft','ArrowRight','ArrowUp','KeyA','KeyD','KeyW','KeyX','KeyK','Space'].includes(e.code))return e.code;return{a:'KeyA',d:'KeyD',w:'KeyW',x:'KeyX',k:'KeyK',' ':'Space',ArrowLeft:'ArrowLeft',ArrowRight:'ArrowRight',ArrowUp:'ArrowUp'}[e.key?.toLowerCase?.()]??({ArrowLeft:'ArrowLeft',ArrowRight:'ArrowRight',ArrowUp:'ArrowUp'}[e.key]);}
export function thumb588(x,y,rect){if(y<rect.top-55||y>rect.bottom+55||x<rect.left-65||x>rect.right+65)return 'neutral';const middle=(rect.left+rect.right)/2;return Math.abs(x-middle)<7?'neutral':x<middle?'left':'right';}
export function rank588(g,p){const metric=q=>q.finishTime!=null?[1,-q.finishTime]:[0,Math.floor(q.furthest)];const a=metric(p);return 1+g.players.filter(q=>{const b=metric(q);return b[0]>a[0]||(b[0]===a[0]&&b[1]>a[1]);}).length;}
export function look588(width,height,p,world){const course=course589(world);const landscape=width>650,view=width>650?900:width<350?440:480,scale=width/view,anchor=landscape?Math.min(height-86,height*.75):height*.62;
 const facing=(p.wallLockUntil??0)>(world?.serverAt??0)&&p.axis?p.axis:p.facing,ahead=facing<0?.64:.25,camera=Math.max(0,Math.min(course.length-view,p.x-view*ahead));
 // Keep spring jumps and the upper route below the HUD, including short screens.
 const top=landscape?85:105,offsetY=Math.max(anchor-300*scale,top-(p.y-60)*scale);
 return{view,scale,camera,offsetY,anchor};
}
