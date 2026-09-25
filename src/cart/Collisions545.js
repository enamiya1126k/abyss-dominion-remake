// Equal-mass impulse response, with tangential friction and spin. Same solver in preview and server.
const R=.58,I=.5*R*R,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function surface545(p,nx,ny,penetration,restitution=.84){
 p.x+=nx*penetration;p.y+=ny*penetration;const normal=p.vx*nx+p.vy*ny;if(normal>=0)return 0;
 const j=-(1+restitution)*normal;p.vx+=j*nx;p.vy+=j*ny;
 const tx=-ny,ty=nx,slip=p.vx*tx+p.vy*ty-(p.spin545??0)*R,friction=clamp(-slip/3,-j*.16,j*.16);
 p.vx+=friction*tx;p.vy+=friction*ty;p.spin545=clamp((p.spin545??0)-friction*R/I,-3.5,3.5);return-normal;
}
export function box545(p,b){
 const left=b.x-b.w/2,right=b.x+b.w/2,bottom=b.y-b.h/2,top=b.y+b.h/2;
 const x=clamp(p.x,left,right),y=clamp(p.y,bottom,top),dx=p.x-x,dy=p.y-y,d=Math.hypot(dx,dy);
 if(d>=R)return 0;if(d>.00001)return surface545(p,dx/d,dy/d,R-d+.00001,.5);
 const sides=[[p.x-left,-1,0],[right-p.x,1,0],[p.y-bottom,0,-1],[top-p.y,0,1]].sort((a,b)=>a[0]-b[0]);const[gap,nx,ny]=sides[0];return surface545(p,nx,ny,gap+R+.00001,.5);
}
export function pair545(a,b,restitution=.62){
 const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>=2*R)return 0;const nx=d>1e-8?dx/d:1,ny=d>1e-8?dy/d:0,overlap=(2*R-d+.00001)/2;
 a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;
 const rv=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rv>=0)return 0;
 const j=-(1+restitution)*rv/2,tx=-ny,ty=nx,slip=(b.vx-a.vx)*tx+(b.vy-a.vy)*ty-R*((a.spin545??0)+(b.spin545??0)),jt=clamp(-slip/6,-j*.22,j*.22);
 a.vx-=j*nx+jt*tx;a.vy-=j*ny+jt*ty;b.vx+=j*nx+jt*tx;b.vy+=j*ny+jt*ty;
 a.spin545=clamp((a.spin545??0)-R*jt/I,-3.5,3.5);b.spin545=clamp((b.spin545??0)-R*jt/I,-3.5,3.5);return-rv;
}
export function rotate545(p,dt){const speed=Math.hypot(p.vx,p.vy),angle=p.bodyAngle545??0,target=speed>.2?Math.atan2(p.vx,p.vy):angle,diff=Math.atan2(Math.sin(target-angle),Math.cos(target-angle));p.bodyAngle545=angle+(p.spin545??0)*dt+diff*Math.min(1,dt*3);p.spin545=(p.spin545??0)*Math.exp(-dt*3.5)}
