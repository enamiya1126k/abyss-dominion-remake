// Presentation only. Visibility remains authoritative; disappearing objects freeze at their last visible position.
export function sampleObjects545(r,objects,at,reduced=false){
 r.visible545??=new Map();const live=new Set(),out=[],dt=Math.max(0,Math.min(100,at-(r.sampleAt545??at-16.67))),blend=reduced?1:1-Math.exp(-dt/55);r.sampleAt545=at;
 for(const o of objects){live.add(o.id);const prev=r.visible545.get(o.id),near=prev&&Math.hypot(prev.x-o.x,prev.y-o.y)<230,entry=Object.assign(prev??{},o,{x:near?prev.x+(o.x-prev.x)*blend:o.x,y:near?prev.y+(o.y-prev.y)*blend:o.y,first:prev?.first??at,last:at,alpha:reduced?1:Math.min(1,(prev?.alpha??0)+dt/140)});r.visible545.set(o.id,entry);out.push(entry)}
 for(const[id,p]of r.visible545){if(live.has(id))continue;const age=at-p.last;if(reduced||age>=220){r.visible545.delete(id);continue}out.push({...p,moving:false,alpha:p.alpha*(1-age/220),stale545:true})}
 return out;
}
export function marker545(x,y,w,h,labelWidth,used=[]){
 const half=Math.min(w/2-8,labelWidth/2+7),compact=h<380,bottom=Math.max(100,h-(compact?12:125)),top=Math.min(180,bottom-60);
 let xx=Math.max(half,Math.min((compact?w-125:w)-half,x)),yy=Math.max(top,Math.min(bottom,y));
 const clear=cy=>used.every(a=>Math.abs(a.x-xx)>=(a.width+half*2)/2+4||Math.abs(a.y-cy)>=((a.height??29)+29)/2);
 if(!clear(yy))for(let d=30;d<=bottom-top+30;d+=30){const candidate=[yy+d,yy-d].find(cy=>cy>=top&&cy<=bottom&&clear(cy));if(candidate!=null){yy=candidate;break}}
 const q={x:xx,y:yy,width:half*2};used.push(q);return q;
}
