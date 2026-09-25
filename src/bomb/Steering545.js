// Tile-centered steering permits quick turns without tapping individual tiny cells.
export function steer545(g,p,dir,cell,solid,floor){
 if(dir===-1){p.steer545=null;p.route=[];p.move=null;return}
 p.steer545=dir;p.steerUntil545=g.elapsed+600;
 // Keep an in-progress step on its axis; the newest direction is used at the next center.
 if(!p.route.length)p.move=null;
}
export function steeringStep545(g,p,cell,solid,floor){
 if(p.steer545==null)return;if(g.elapsed>=p.steerUntil545){p.steer545=null;p.route=[];return}
 if(p.route.length)return;const center={x:Math.floor(p.x)+.5,y:Math.floor(p.y)+.5};
 if(Math.hypot(center.x-p.x,center.y-p.y)>.035){p.route=[center];return}
 const [dx,dy]=[[0,-1],[1,0],[0,1],[-1,0]][p.steer545],target={x:center.x+dx,y:center.y+dy};p.face=p.steer545;
 if(!solid(g,target.x,target.y)&&floor(g,target.x,target.y))p.route=[target];
}
