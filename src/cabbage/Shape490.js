// Crop each material to its actual silhouette, then apply ONE continuous envelope.
// Sprite padding must never make the same cabbage grow at a fineness boundary.
const BOXES = [
 [30,72,411,432], [469,85,887,442], [917,92,1328,441], [1352,150,1761,444],
 [13,528,432,830], [453,576,877,826], [897,580,1317,823], [1342,599,1761,823],
 [637,205,1228,585], [34,790,616,1165], [645,831,1219,1165],
];
export function cabbageShape490(cuts=0) {
 const n=Number.isFinite(cuts)?Math.max(0,cuts):0;
 return {height:.10+.90/Math.pow(1+n/35,.68),width:1+.18*n/(n+55)};
}
export function foodLayer490(frame,from=0,to=100) {
 frame=Math.max(0,Math.min(10,Math.floor(frame)||0));
 const fine=frame>=8,[x,y,right,bottom]=BOXES[frame],w=right-x,h=bottom-y,W=fine?1254:1774,H=fine?1254:887;
 return {
  backgroundImage:`url('./assets/cabbage${fine?'487/fine-stages':'486/cabbage-stages'}.png')`,
  backgroundSize:`${W/w*100}% ${H/h*100}%`,
  backgroundPosition:`${x/(W-w)*100}% ${y/(H-h)*100}%`,
  clipPath:`inset(0 ${100-to}% 0 ${from}%)`,transform:'none',opacity:1,
 };
}
export function paintCabbage490(food,cuts) {
 const s=cabbageShape490(cuts);
 food.style.transform=`scale(${s.width},${s.height})`;
 return s;
}
