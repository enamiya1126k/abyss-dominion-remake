import {chapterTwoFrameBounds383} from './ChapterTwoSprite383.js?v=3.1.82-build402';

// Convert the final visible silhouette, after fitting/mirroring, to the
// unscaled sprite anchor. This also handles transparent, asymmetric canvases.
export function battleCircleGeometry405({image,bounds,sprite,slotWidth,mirrored=false}){
 const b=mirrored?{...bounds,left:1-bounds.right,right:1-bounds.left}:bounds;
 const width=image.width*(b.right-b.left),height=image.height*(b.bottom-b.top);
 const diameter=Math.max(32,Math.min(160,Math.max(32,slotWidth)*1.28,Math.max(width,height)*1.16));
 const sx=sprite.width/Math.max(1,sprite.layoutWidth||sprite.width),sy=sprite.height/Math.max(1,sprite.layoutHeight||sprite.height);
 return {left:(image.left+image.width*(b.left+b.right)/2-sprite.left)/sx,
  top:(image.top+image.height*(b.top+b.bottom)/2-sprite.top)/sy,
  width:diameter/sx,height:diameter/sy};
}

function mirroredImage(image,sprite){
 let sign=1;
 for(let node=image;node&&node!==sprite;node=node.parentElement){
  const matrix=getComputedStyle(node).transform;
  if(matrix?.startsWith('matrix(')&&Number(matrix.slice(7).split(',')[0])<0)sign*=-1;
 }
 return sign<0;
}
function containedImageBox(image,rect){
 if(!image.naturalWidth||!image.naturalHeight)return rect;
 const ratio=Math.min(rect.width/image.naturalWidth,rect.height/image.naturalHeight);
 const width=image.naturalWidth*ratio,height=image.naturalHeight*ratio;
 const position=getComputedStyle(image).objectPosition.split(' ');
 const fraction=value=>value==='bottom'||value==='right'?1:value==='top'||value==='left'?0:value?.endsWith('%')?parseFloat(value)/100:.5;
 return {left:rect.left+(rect.width-width)*fraction(position[0]),top:rect.top+(rect.height-height)*fraction(position[1]),width,height};
}
export function layoutBattleCircles405(root,visibleBounds){
 for(const unit of root.querySelectorAll('.side-battle-unit')){
  const sprite=unit.querySelector('.side-unit-sprite'),circle=sprite?.querySelector('.battle-magic-circle,.enemy-battle-magic-circle');
  const image=sprite?.querySelector('.monster-visual svg[data-monster-atlas],.monster-visual img:not([hidden])');
  if(!circle||!image||(!image.dataset.monsterAtlas&&(!image.complete||!image.naturalWidth)))continue;
  const sr=sprite.getBoundingClientRect(),rect=containedImageBox(image,image.getBoundingClientRect());
  if(!sr.width||!sr.height||!rect.width||!rect.height)continue;
  const bounds=chapterTwoFrameBounds383(image.dataset.monsterAtlas)??visibleBounds(image);
  const geometry=battleCircleGeometry405({image:rect,bounds,sprite:{left:sr.left,top:sr.top,width:sr.width,height:sr.height,layoutWidth:sprite.offsetWidth,layoutHeight:sprite.offsetHeight},slotWidth:unit.getBoundingClientRect().width,mirrored:mirroredImage(image,sprite)});
  for(const [key,value] of Object.entries(geometry))circle.style.setProperty(key,`${value}px`,'important');
  circle.dataset.aligned405='true';
 }
}
