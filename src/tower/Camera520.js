// Camera coordinates are presentation-only; server collision units remain square cells.
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function layout520(width,height,overview=false){
 const cell=Math.max(4,overview?Math.min((width-24)/10,(height-16)/18.6):(width-24)/10);
 const worldHeight=Math.max(height,cell*18.6+16),worldBottom=worldHeight-14;
 return{cell,left:(width-cell*10)/2,worldHeight,worldBottom};
}
export function camera520(r,g,focus,dt=0,reduced=false){
 let y=focus?.alive&&focus.role==='run'?focus.y:null;
 if(y==null){const runners=g.players.filter(p=>p.role==='run'&&p.alive&&!p.escaped);y=Math.max(0,...runners.map(p=>p.y));
  if(focus?.role==='drop'){const landing=g.falling?.land;y=Math.max(y,Math.min(15,(landing??y)+1));}}
 const max=Math.max(0,r.worldHeight-r.height);
 const target=r.overview520?max:clamp(r.worldBottom-y*r.cell-r.height*.81,0,max);
 if(r.cameraY==null||reduced||dt===0)r.cameraY=target;
 else r.cameraY+=(target-r.cameraY)*(1-Math.exp(-dt*11));
 // Never allow an unusually fast launch or a server correction to move the hero above the warning band.
 if(focus?.alive&&focus.role==='run')r.cameraY=Math.min(r.cameraY,Math.max(0,r.worldBottom-(focus.y+1.1)*r.cell-48));
 r.cameraY=clamp(r.cameraY,0,max);r.bottom=r.worldBottom-r.cameraY;r.top=r.bottom-16*r.cell;
 return{offset:r.cameraY,target,visibleBottom:Math.max(0,(r.worldBottom-r.cameraY-r.height)/r.cell),visibleTop:Math.min(16,(r.worldBottom-r.cameraY)/r.cell)};
}
