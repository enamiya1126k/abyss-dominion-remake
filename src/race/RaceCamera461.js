import{course459,coursePoint459}from'./RaceCourse459.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const SPRITE461={width:76,height:88,top:104,bottom:10};
export const worldSize461=track=>course459(track).shape==='oval'?{width:1920,height:1440}:{width:3200,height:1000};
// A fixed lane follows the true course, never a collision-avoidance layout.
export function worldPoint461(progress,index,track){
 const c=course459(track),lane=(index-3.5)*25.8;
 if(c.shape!=='oval')return{x:240+2720*clamp(progress,0,1),y:500+lane,angle:0,corner:false};
 const p=coursePoint459(progress,c),a=(p.angle+90)*Math.PI/180;
 return{x:(p.x+30)*12+Math.cos(a)*lane,y:(p.y+10)*12+Math.sin(a)*lane,angle:p.angle,corner:p.corner};
}
export function cameraBounds461(points){return{left:Math.min(...points.map(p=>p.x-SPRITE461.width/2-8)),right:Math.max(...points.map(p=>p.x+SPRITE461.width/2+8)),top:Math.min(...points.map(p=>p.y-SPRITE461.top)),bottom:Math.max(...points.map(p=>p.y+SPRITE461.bottom))};}
export function followCamera461(points,width,height,previous=null,dt=33,overview=false,world={width:1920,height:1440}){
 if(overview){const scale=Math.min(width/world.width,height/world.height);return{cx:world.width/2,cy:world.height/2,scale};}
 const b=cameraBounds461(points),pad=24,hardPad=8,maxScale=clamp(width/340,.85,1.3),spanX=Math.max(1,b.right-b.left),spanY=Math.max(1,b.bottom-b.top),targetScale=Math.min(maxScale,(width-pad*2)/spanX,(height-pad*2)/spanY),targetX=(b.left+b.right)/2,targetY=(b.top+b.bottom)/2;
 const mix=1-Math.exp(-clamp(dt,0,100)/220),zoomMix=1-Math.exp(-clamp(dt,0,100)/(previous&&targetScale<previous.scale?180:600));
 let scale=previous?previous.scale+(targetScale-previous.scale)*zoomMix:targetScale;
 scale=Math.min(scale,(width-2*hardPad)/spanX,(height-2*hardPad)/spanY);
 let cx=previous?previous.cx+(targetX-previous.cx)*mix:targetX,cy=previous?previous.cy+(targetY-previous.cy)*mix:targetY;
 // Clamp the CAMERA, not runners, so even a restart/resize never clips anyone.
 const halfX=(width/2-hardPad)/scale,halfY=(height/2-hardPad)/scale;
 cx=clamp(cx,b.right-halfX,b.left+halfX);cy=clamp(cy,b.bottom-halfY,b.top+halfY);
 return{cx,cy,scale};
}
export const project461=(point,camera,width,height)=>({x:width/2+(point.x-camera.cx)*camera.scale,y:height/2+(point.y-camera.cy)*camera.scale});
