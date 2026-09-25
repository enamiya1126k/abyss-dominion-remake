import {surfaceDepth558} from './Projection558.js';
// Four corners follow the calibrated road. Texture rows use a homography so
// borders and medallions share its vanishing point, once per terrain cache build.
export function rug557(c,P,z,image){
 if(!image?.complete||!image.naturalWidth)return false;
 const left=z.left,right=z.right,near=P(0,z.from),far=P(0,z.to),rows=Math.max(48,Math.min(360,Math.ceil(Math.abs(near.y-far.y)*1.5))),farWidth=P(right,z.to).x-P(left,z.to).x,nearWidth=P(right,z.from).x-P(left,z.from).x;
 const polygon=()=>{c.beginPath();for(const [i,[x,y]]of [[left,z.from],[right,z.from],[right,z.to],[left,z.to]].entries()){const p=P(x,y);if(i)c.lineTo(p.x,p.y);else c.moveTo(p.x,p.y)}c.closePath()};
 c.save();c.translate(1,1.2);c.shadowColor='#24253865';c.shadowBlur=2.2;polygon();c.fillStyle='#26333c50';c.fill();c.restore();
 c.save();polygon();c.clip();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
 // The opaque carpet and its loose fringe are centered in the source canvas.
 const crop={x:186,y:8,w:426,h:1957};
 for(let i=0;i<rows;i++){const t=i/rows,t2=(i+1)/rows,y=z.to+(z.from-z.to)*surfaceDepth558(t,farWidth,nearWidth),y2=z.to+(z.from-z.to)*surfaceDepth558(t2,farWidth,nearWidth),a=P(left,(y+y2)/2),b=P(right,(y+y2)/2),top=P(0,y),bottom=P(0,y2);c.drawImage(image,crop.x,crop.y+crop.h*t,crop.w,crop.h/rows,a.x,top.y,b.x-a.x,bottom.y-top.y+.35)}
 // The same cool sky and warm lantern light that falls on the surrounding dock.
 const light=c.createLinearGradient(0,far.y,0,near.y);light.addColorStop(0,'#bce6ff12');light.addColorStop(.6,'#ffecd904');light.addColorStop(1,'#fff0be10');polygon();c.fillStyle=light;c.fill();c.restore();return true;
}
