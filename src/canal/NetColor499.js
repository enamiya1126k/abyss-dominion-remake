import{PARTY_COLORS499}from'../party/PartyColors499.js';
// Tint the existing artwork at runtime. Geometry, alpha and rope luminance stay intact.
// Four 512px atlases (~4 MiB total), generated once per source; no work per animation frame.
export function tintNet499(source,color,makeCanvas=()=>globalThis.document?.createElement?.('canvas')){
 const entry=PARTY_COLORS499.find(c=>c.hex===color);if(!entry||!source?.complete||!source.naturalWidth)return null;
 const canvas=makeCanvas();if(!canvas)return null;canvas.width=canvas.height=512;
 const ctx=canvas.getContext('2d');if(!ctx)return null;
 ctx.drawImage(source,0,0,512,512);
 ctx.globalCompositeOperation='color';ctx.fillStyle=entry.tint;ctx.fillRect(0,0,512,512);
 ctx.globalCompositeOperation='destination-in';ctx.drawImage(source,0,0,512,512);
 ctx.globalCompositeOperation='source-over';
 return canvas;
}
export function netCell499(ctx,u,index,x,y,size,color){
 if(index>2||!u.netArt497?.complete||!u.netArt497.naturalWidth)return false;
 if(u.netSource499!==u.netArt497){u.netSource499=u.netArt497;u.netCache499=new Map()}
 if(!u.netCache499.has(color))u.netCache499.set(color,tintNet499(u.netArt497,color,u.makeNetCanvas499));
 const canvas=u.netCache499.get(color);if(!canvas)return false;
 const s=canvas.width/2;ctx.drawImage(canvas,index%2*s,Math.floor(index/2)*s,s,s,x-size/2,y-size/2,size,size);return true;
}
