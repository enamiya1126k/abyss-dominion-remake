// A conservative impossibility proof. Adding blocks cannot reopen a sealed void.
// Ignore gravity and body size in this graph: if even a point cannot leave, no
// runner can leave, including arbitrary cooperative head jumps. Never use AI
// inactivity or a merely high ledge as proof of a loss.
const cache = new WeakMap();
const shapes = [[[0,0],[1,0],[2,0],[3,0]],[[0,0],[1,0],[0,1],[1,1]],[[0,0],[1,0],[2,0],[1,1]],[[0,0],[1,0],[2,0],[2,1]],[[0,0],[1,0],[2,0],[0,1]],[[0,0],[1,0],[1,1],[2,1]],[[1,0],[2,0],[0,1],[1,1]]];
const names = ['I','O','T','L','J','S','Z'];
function topology(g) {
 const old=cache.get(g); if(old?.revision===g.boardRevision && old.count===g.board.length) return old;
 const occupied=new Uint8Array(160), outside=new Uint8Array(160), queue=[];
 for(const b of g.board) if(b.x>=0&&b.x<10&&b.y>=0&&b.y<16) occupied[b.y*10+b.x]=1;
 for(let x=0;x<10;x++) if(!occupied[150+x]) { outside[150+x]=1;queue.push(150+x); }
 for(let i=0;i<queue.length;i++) { const n=queue[i],x=n%10,y=Math.floor(n/10); for(const v of [x>0?n-1:-1,x<9?n+1:-1,y>0?n-10:-1,y<15?n+10:-1]) if(v>=0&&!occupied[v]&&!outside[v]){outside[v]=1;queue.push(v);} }
 const out={revision:g.boardRevision,count:g.board.length,occupied,outside};cache.set(g,out);return out;
}
export function hasPlacement518(g) {
 for(const type of new Set(g.hand)) {let cells=shapes[names.indexOf(type)]?.map(c=>[...c]);if(!cells)continue;
  for(let rot=0;rot<4;rot++) { const w=1+Math.max(...cells.map(c=>c[0]));for(let x=0;x<=10-w;x++){let y=0;for(const [dx,dy] of cells)for(const b of g.board)if(b.x===x+dx)y=Math.max(y,b.y+1-dy);if(cells.every(([,dy])=>y+dy+1<=16))return true;}
   cells=cells.map(([x,y])=>[-y,x]);const minX=Math.min(...cells.map(c=>c[0])),minY=Math.min(...cells.map(c=>c[1]));cells=cells.map(([x,y])=>[x-minX,y-minY]);
  }
 }return false;
}
export function impossible518(g) {
 if(g.phase!=='play'||g.falling) return null;
 const alive=g.players.filter(p=>p.role==='run'&&p.alive&&!p.escaped);if(!alive.length)return null;
 const {outside,occupied}=topology(g);
 const connected=p=>p.y+.41>=16||outside[Math.max(0,Math.min(159,Math.floor(p.y+.41)*10+Math.floor(p.x)))];
 if(alive.every(p=>!connected(p)))return 'sealed';
 // With multiple runners, airborne head jumps can create further opportunities.
 // Keep these matches alive unless topology proves that every exit is closed.
 if(alive.length!==1||hasPlacement518(g))return null;
 const p=alive[0];let high=p.y+Math.max(0,p.vy)**2/50;
 // Optimistically allow any ledge in the board and unlimited lateral travel.
 // Failure even with these advantages proves the sole runner cannot get out.
 const heights=[0,...g.board.filter(b=>b.y===15||!occupied[(b.y+1)*10+b.x]).map(b=>b.y+1)].sort((a,b)=>a-b);
 // A cooldown will expire: never declare defeat merely because the boost is not ready yet.
 const reach=g.rules517>=3?5.18:2.17;
 for(const h of heights)if(h<=high+reach)high=Math.max(high,h);
 return high+reach<16?'unreachable':null;
}
export function sealedRunners520(g){
 if(g.phase!=='play'||g.falling)return [];
 const {outside}=topology(g);
 return g.players.filter(p=>p.role==='run'&&p.alive&&!p.escaped&&p.y+.41<16&&!outside[Math.max(0,Math.min(159,Math.floor(p.y+.41)*10+Math.floor(p.x)))]);
}
