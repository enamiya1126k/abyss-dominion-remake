// Presentation only. Anchors retain authoritative race progress; portraits may
// be separated with a tether so dense groups remain readable.
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function fitCamera460(points,width,height,follow=false){
 if(!follow||!points.length)return{scale:1,x:0,y:0};
 const xs=points.map(p=>p.x),ys=points.map(p=>p.y),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys),margin=68;
 const scale=clamp(Math.min((width-2*margin)/Math.max(1,right-left),(height-2*margin)/Math.max(1,bottom-top)),1,2.25);
 return{scale,x:clamp(width/2-scale*(left+right)/2,width-scale*width,0),y:clamp(height/2-scale*(top+bottom)/2,height-scale*height,0)};
}
export function separateRunners460(points,width,height,size=46){
 const boxW=size+8,boxH=size+22,pad=5,placed=[];
 const fits=p=>p.x>=pad+boxW/2&&p.x<=width-pad-boxW/2&&p.y>=pad+boxH/2&&p.y<=height-pad-boxH/2;
 const clear=p=>placed.every(q=>Math.abs(p.x-q.x)>=boxW||Math.abs(p.y-q.y)>=boxH);
 for(const point of points){
  const home={x:clamp(point.x,boxW/2+pad,width-boxW/2-pad),y:clamp(point.y-boxH/3,boxH/2+pad,height-boxH/2-pad)},candidates=[home];
  // A fixed index order avoids sudden reassignment when two runners exchange rank.
  for(let ring=1;ring<=4;ring++)for(let a=-ring;a<=ring;a++)for(let b=-ring;b<=ring;b++)if(Math.max(Math.abs(a),Math.abs(b))===ring)candidates.push({x:home.x+a*boxW,y:home.y+b*boxH});
  // Guaranteed fallback for narrow/landscape viewports.
  for(let y=pad+boxH/2;y<=height-pad-boxH/2;y+=boxH)for(let x=pad+boxW/2;x<=width-pad-boxW/2;x+=boxW)candidates.push({x,y});
  candidates.sort((a,b)=>(a.x-home.x)**2+(a.y-home.y)**2-((b.x-home.x)**2+(b.y-home.y)**2));
  const chosen=candidates.find(p=>fits(p)&&clear(p))??home;
  placed.push({...point,x:chosen.x,y:chosen.y,anchorX:point.x,anchorY:point.y,width:boxW,height:boxH});
 }
 return placed;
}
