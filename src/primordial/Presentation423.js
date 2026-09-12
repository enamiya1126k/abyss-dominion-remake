import {chapterTwoFrameBounds383} from '../ui/ChapterTwoSprite383.js';
import {MOTHER_ID422} from './Mother422.js';
const TAU=Math.PI*2,ROMAN=['I','II','III','IV','V','VI','VII','VIII','IX','X'];
const glyph={I:['111','010','010','010','111'],V:['101','101','101','101','010'],X:['101','101','010','101','101']};
// Native pixel paths: integer square pixels, never thin antialiased circles.
function pixelPaths(){
 const colors=['#796035','#cba657','#ffe1a0'],dots=colors.map(()=>new Set()),put=(x,y,c=1)=>dots[c].add(`${Math.round(x)},${Math.round(y)}`);
 for(let y=5;y<155;y++)for(let x=5;x<155;x++){const r=Math.hypot(x-80,y-80);if([74,70,52].some(n=>Math.abs(r-n)<.45))put(x,y,r>72?2:1);}
 for(let i=0;i<40;i++){const a=i*TAU/40-Math.PI/2;for(let r=47;r<=(i%4===0?57:50);r++)put(80+Math.cos(a)*r,80+Math.sin(a)*r,i%4===0?2:0);}
 const base=dots.map((set,c)=>`<path fill="${colors[c]}" d="${[...set].map(v=>{const [x,y]=v.split(',');return `M${x} ${y}h1v1h-1Z`}).join('')}"/>`).join('');
 const labels=ROMAN.map((word,i)=>{const a=i*TAU/10-Math.PI/2,cx=80+62*Math.cos(a),cy=80+62*Math.sin(a),width=word.length*4-1;let d='';for(let j=0;j<word.length;j++)for(let y=0;y<5;y++)for(let x=0;x<3;x++)if(glyph[word[j]][y][x]==='1')d+=`M${Math.round(cx-width/2+j*4+x)} ${Math.round(cy-2+y)}h1v1h-1Z`;return `<path data-dial-numeral424="${i}" d="${d}"/>`;}).join('');
 return {base,labels,dots};
}
const PIXELS=pixelPaths();
export function motherHalo423({index=0,spinning=false}={}){
 const safe=Math.max(0,Math.min(9,Number(index)||0)),angle=-safe*36;
 return `<span class="mother-halo423 mother-dial424${spinning?' is-turning424':''}" aria-hidden="true" style="--dial-stop424:${angle}deg;--dial-start424:${angle-720}deg"><svg viewBox="0 0 160 160" shape-rendering="crispEdges" focusable="false" preserveAspectRatio="xMidYMid meet"><g class="mother-dial-wheel424" fill="#f7d986">${PIXELS.base}${PIXELS.labels}</g><path fill="#fff0b3" d="M77 0h7v2h-1v2h-1v2h-3V4h-1V2h-1Z"/></svg></span>`;
}
export function motherFieldGeometry424({camera,TILE,actor}){
 const foot=camera.world((actor.position.x+.5)*TILE,(actor.position.y+.9)*TILE),b=chapterTwoFrameBounds383(MOTHER_ID422),scale=camera.z*2.65;
 return{x:foot.x,y:foot.y-61*scale+64*scale*(b.top+b.bottom)/2,diameter:64*scale*Math.max(b.right-b.left,b.bottom-b.top)*1.16};
}
let fieldPixels=null;
function fieldDial(){
 if(fieldPixels||typeof document==='undefined')return fieldPixels;
 const c=document.createElement('canvas');c.width=c.height=160;const ctx=c.getContext('2d');if(!ctx)return null;
 for(const [n,set]of PIXELS.dots.entries()){ctx.fillStyle=['#796035','#cba657','#ffe1a0'][n];for(const point of set){const [x,y]=point.split(',').map(Number);ctx.fillRect(x,y,1,1);}}
 ctx.fillStyle='#ffe1a0';for(let i=0;i<10;i++){const word=ROMAN[i],a=i*TAU/10-Math.PI/2,cx=80+62*Math.cos(a),cy=80+62*Math.sin(a),w=word.length*4-1;for(let j=0;j<word.length;j++)for(let y=0;y<5;y++)for(let x=0;x<3;x++)if(glyph[word[j]][y][x]==='1')ctx.fillRect(Math.round(cx-w/2+j*4+x),Math.round(cy-2+y),1,1);}
 fieldPixels=c;return c;
}
export function drawMotherHalo423(args){
 const {ctx,time=0,reducedMotion=false}=args,{x,y,diameter}=motherFieldGeometry424(args),bitmap=fieldDial();if(!bitmap)return;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=.75;ctx.translate(Math.round(x),Math.round(y));ctx.rotate(reducedMotion?0:Math.floor(time/700)*TAU/120);ctx.drawImage(bitmap,-diameter/2,-diameter/2,diameter,diameter);ctx.restore();
}
