import {attributeVisual} from '../ui/components/AttributeVisual.js';
const ids={fire:'fire',wind:'wind',ice:'ice',thunder:'lightning',stone:'earth',water:'water'},indices={fire:1,water:2,ice:3,thunder:4,stone:5,wind:6};
let atlas;
export function rune597(c,kind,x,y,size=40){if(!atlas){atlas=new Image();atlas.decoding='async';atlas.src=new URL('../../assets/ui/attributes/attribute-atlas.png',import.meta.url).href;}if(!atlas.complete||!atlas.naturalWidth)return;const i=indices[kind]??0,w=atlas.naturalWidth/4,h=atlas.naturalHeight/3;c.drawImage(atlas,i%4*w,Math.floor(i/4)*h,w,h,x-size/2,y-size/2,size,size);}
export function elementIcon597(kind){return ids[kind]?attributeVisual(ids[kind],{className:'ru-element598'}):'';}
