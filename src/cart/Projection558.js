// Floor edges in the original 1024 × 1536 frost-harbor painting. The renderer
// crops its top 20%. Use that same crop to keep every floor item on the dock.
const frost558={farY:578,nearY:1536,farLeft:373,farRight:626,nearLeft:83,nearRight:943};
export function frostPoint558(r,x,screenY,width){
 const f=frost558,sourceY=(.2+.8*screenY)*1536,t=(sourceY-f.farY)/(f.nearY-f.farY);
 const left=f.farLeft+(f.nearLeft-f.farLeft)*t,right=f.farRight+(f.nearRight-f.farRight)*t,span=(right-left)/1024;
 return{x:r.width*((left+right)/2048+x/width*span),y:r.height*screenY,scale:span/.82};
}
// A photograph mapped onto a trapezoid needs perspective in both directions.
// Linear strip spacing foreshortens its width but leaves its length flat.
export function surfaceDepth558(t,farWidth,nearWidth){return t*farWidth/((1-t)*nearWidth+t*farWidth)}
