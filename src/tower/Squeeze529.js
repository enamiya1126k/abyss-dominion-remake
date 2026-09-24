// Only a shallow edge contact may slide sideways. Never hop through an obstacle
// or search for a second escape after the nearest exit is blocked.
export function squeeze529(g,p,oldY,C,solid){
 const f=g.falling,left=p.x-C.pw/2,right=p.x+C.pw/2,top=p.y+C.ph;
 const contacts=f.cells.map(([dx,dy])=>({left:f.x+dx,right:f.x+dx+1,bottom:f.y+dy,old:oldY+dy}))
  .filter(b=>left<b.right-1e-6&&right>b.left+1e-6&&p.y<b.old&&top>b.bottom+1e-6)
  .sort((a,b)=>a.left-b.left);
 if(!contacts.length)return null;
 // Union, rather than a per-cell test: seams and stacked cells count only once.
 let covered=0,end=-Infinity;
 for(const b of contacts){const a=Math.max(left,b.left),z=Math.min(right,b.right);covered+=Math.max(0,z-Math.max(a,end));end=Math.max(end,z)}
 if(covered>=C.pw/2-1e-6)return null;
 const exits=[Math.min(...contacts.map(b=>b.left))-C.pw/2-1e-5,Math.max(...contacts.map(b=>b.right))+C.pw/2+1e-5];
 const x=exits.sort((a,b)=>Math.abs(a-p.x)-Math.abs(b-p.x))[0];
 // A narrow gap on both sides is not an edge. Limit displacement to the actual
 // shallow overlap; this also prevents teleporting across a multi-cell piece.
 if(Math.abs(x-p.x)>C.pw/2+1e-4)return null;
 if(solid(g,x,p.y,true))return{x,blocked:true};
 // Check the entire horizontal sweep against the settled board, not just its end.
 const sweepLeft=Math.min(left,x-C.pw/2),sweepRight=Math.max(right,x+C.pw/2);
 const blocked=g.board.some(b=>sweepLeft<b.x+1-1e-6&&sweepRight>b.x+1e-6&&p.y<b.y+1-1e-6&&top>b.y+1e-6);
 return{x,blocked};
}
