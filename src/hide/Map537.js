// Build538: one continuous estate, with an asymmetric manor, open gardens and woodland.
export const TILE537=100, GRID537=48;
export const THEMES537=[{name:'大広間',floor:8},{name:'静かな書庫',floor:8},{name:'長卓の食堂',floor:8},{name:'客人の寝室',floor:8},{name:'石造りの厨房',floor:7},{name:'食料貯蔵庫',floor:1},{name:'陽だまりの回廊',floor:7},{name:'主人の書斎',floor:8},{name:'玄関ホール',floor:7}];
export function random537(seed){let n=seed>>>0||538;return()=>{n^=n<<13;n^=n>>>17;n^=n<<5;return(n>>>0)/4294967296}}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),cols=m=>m.width/100,rows=m=>m.height/100;
export function tile537(m,x,y){if(!m)return 0;const c=Math.floor(x/100),r=Math.floor(y/100);return c<0||r<0||c>=cols(m)||r>=rows(m)?0:m.cells[r*cols(m)+c]}
const geometry=new WeakMap(),cache=new WeakMap();
function localDecor(m,x,y){let bins=geometry.get(m);if(!bins){bins=new Map();for(const o of m.decor){for(let j=Math.floor((o.y-o.h/2-32)/200);j<=Math.floor((o.y+o.h/2+32)/200);j++)for(let i=Math.floor((o.x-o.w/2-32)/200);i<=Math.floor((o.x+o.w/2+32)/200);i++){const k=i+','+j;if(!bins.has(k))bins.set(k,[]);bins.get(k).push(o)}}geometry.set(m,bins)}return bins.get(Math.floor(x/200)+','+Math.floor(y/200))??[]}
export function free537(m,x,y,r=24){if(!m)return false;for(const [dx,dy]of [[0,0],[r,0],[-r,0],[0,r],[0,-r],[r*.71,r*.71],[-r*.71,r*.71],[r*.71,-r*.71],[-r*.71,-r*.71]]){const t=tile537(m,x+dx,y+dy);if(!t||t===9)return false}return !localDecor(m,x,y).some(o=>Math.abs(x-o.x)<o.w/2+r&&Math.abs(y-o.y)<o.h/2+r)}
export function line537(m,a,b,r=0){const n=Math.max(1,Math.ceil(dist(a,b)/20));for(let i=0;i<=n;i++)if(!free537(m,a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,r))return false;return true}
export function nav537(m){let data=cache.get(m);if(!data){const nodes=[];for(let y=0;y<rows(m);y++)for(let x=0;x<cols(m);x++){const p={x:x*100+50,y:y*100+50,i:y*cols(m)+x};if(free537(m,p.x,p.y))nodes.push(p)}const by=new Map(nodes.map(n=>[n.i,n])),edges=new Map();for(const p of nodes)edges.set(p.i,[-cols(m),cols(m),-1,1].map(d=>by.get(p.i+d)).filter(q=>q&&dist(p,q)<101&&line537(m,p,q,24)).map(q=>q.i));data={nodes,by,edges};cache.set(m,data)}return data.nodes}
export function nearest537(m,q){return nav537(m).reduce((a,p)=>!a||dist(p,q)<dist(a,q)?p:a,null)}
export function path537(m,a,b){if(!m)return[];const end=free537(m,b.x,b.y)?{x:b.x,y:b.y}:nearest537(m,b);if(!end)return[];if(line537(m,a,end,24))return[end];nav537(m);const{by,edges}=cache.get(m),start=nearest537(m,a),goal=nearest537(m,end);if(!start||!goal)return[];const queue=[start.i],prev=new Map([[start.i,-1]]);for(let h=0;h<queue.length;h++){const id=queue[h];if(id===goal.i)break;for(const next of edges.get(id)){if(prev.has(next))continue;prev.set(next,id);queue.push(next)}}if(!prev.has(goal.i))return[];const route=[];for(let id=goal.i;id!==-1;id=prev.get(id))route.unshift({x:by.get(id).x,y:by.get(id).y});if(line537(m,goal,end,24))route.push(end);const smooth=[];let current=a;while(route.length){let k=0;for(let j=route.length-1;j>=0;j--)if(line537(m,current,route[j],24)){k=j;break}if(!line537(m,current,route[k],24))return[];current=route[k];smooth.push(current);route.splice(0,k+1)}return smooth}
export function makeMap537(seed){const rand=random537(seed),jitter=()=>Math.floor(rand()*3)-1,m={version:3,width:4800,height:4400,cells:Array(48*44).fill(5),walls:[],doors:[],rooms:[],decor:[],rugs:[],zones:[],links:[]};const wall=new Set(),door=new Set();
 const set=(x,y,t)=>{if(x>=0&&y>=0&&x<48&&y<44)m.cells[y*48+x]=t};
 for(let y=0;y<44;y++)for(let x=0;x<48;x++){const d=Math.min(x,47-x,y,43-y),forest=d<4+(Math.sin(x*.45)+Math.cos(y*.4))*1.4;set(x,y,d===0?0:forest?6:5)}
 const x0=8+jitter(),x1=19+jitter(),x2=29+jitter(),x3=40+jitter(),y0=7+jitter(),y1=14+jitter(),y2=24+jitter(),y3=32+jitter();
 const defs=[[0,x1,y1,x2,y3-3],[1,x1,y0,x2,y1],[2,x0,y1,x1,y2],[3,x0,y0,x1,y1],[4,x0,y2,x1,y3],[5,x2,y2,x3,y3+1],[6,x2,y1-2,x3,y2],[7,x2,y0-2,x3-3,y1-2],[8,x1,y3-3,x2,y3+3]];
 for(const [theme,x,y,xx,yy]of defs){const r={index:m.rooms.length,theme,name:THEMES537[theme].name,x:x*100,y:y*100,w:(xx-x+1)*100,h:(yy-y+1)*100,cx:(x+xx+1)*50,cy:(y+yy+1)*50};m.rooms.push(r);for(let j=y;j<=yy;j++)for(let i=x;i<=xx;i++){const edge=i===x||i===xx||j===y||j===yy;set(i,j,edge?0:THEMES537[theme].floor);if(edge)wall.add(j*48+i)}}
 function opening(x,y,vertical=false){for(let i=0;i<2;i++){const xx=x+(vertical?0:i),yy=y+(vertical?i:0),id=yy*48+xx;set(xx,yy,7);wall.delete(id);door.add(id);m.doors.push({x:xx*100,y:yy*100,vertical})}}
 // Interior doors and generous outdoor exits: a choice of routes through rooms or around the house.
 opening(x1+3+jitter(),y1);opening(x1,y1+4+jitter(),true);opening(x1,y0+2,true);opening(x0+3+jitter(),y1);opening(x0+4+jitter(),y2);opening(x2,y1+3+jitter(),true);opening(x2+4+jitter(),y2);opening(x2+2,y1-2);opening(x1+3,y3-3);opening(x1+3,y3+3);opening(x0,y1+4,true);opening(x0+3,y3);opening(x3,y1+3,true);opening(x2+2,y0-2);opening(x1+3,y0);opening(x2+4,y3+1);
 // Reconcile shared wall cells before furnishing.
 for(const id of wall)if(!door.has(id))m.cells[id]=0;m.walls=[...wall];
 function path(points,width=150){for(let n=1;n<points.length;n++){const a=points[n-1],b=points[n],steps=Math.ceil(dist(a,b)/45);for(let k=0;k<=steps;k++){const x=a.x+(b.x-a.x)*k/steps,y=a.y+(b.y-a.y)*k/steps;for(let j=Math.floor((y-width)/100);j<=Math.floor((y+width)/100);j++)for(let i=Math.floor((x-width)/100);i<=Math.floor((x+width)/100);i++)if([5,6].includes(m.cells[j*48+i])&&Math.hypot(i*100+50-x,j*100+50-y)<width)set(i,j,7)}}}
 const south={x:(x1+4)*100,y:(y3+4)*100};path([south,{x:south.x-350,y:3950},{x:850,y:3750},{x:500,y:2550},{x:650,y:1600},{x:x0*100,y:(y1+5)*100}],210);path([south,{x:3350,y:3850},{x:4350,y:3000},{x:4300,y:1750},{x:x3*100,y:(y1+4)*100}],210);path([{x:(x1+4)*100,y:y0*100},{x:2400,y:350},{x:3450,y:350},{x:(x3-2)*100,y:(y0-2)*100}],170);
 const add=(kind,x,y,w=170,h=95,size=280)=>m.decor.push({id:'d'+m.decor.length,kind,x,y,w,h,size,atlas:'estate'});
 // Carefully staged room sets. Small object anchors below follow these arrangements.
 for(const r of m.rooms){const left=r.x+220,right=r.x+r.w-220,top=r.y+220,bottom=r.y+r.h-210,cx=r.cx,cy=r.cy;
 if(r.theme===0){add(3,left,cy-100,200,100,310);add(3,right,cy-100,200,100,310);m.rugs.push({x:cx,y:cy,w:360,h:r.h-330,color:'#733833'});add(4,right,top,170,100,270)}
 if(r.theme===1){for(let i=0;i<3;i++)add(0,left+i*(right-left)/2,top,170,90,265);add(4,right,bottom,190,100,285);m.rugs.push({x:cx,y:cy+60,w:r.w-330,h:260,color:'#204c46'})}
 if(r.theme===2){add(2,cx,cy,340,140,490);add(6,left,top,170,95,280);m.rugs.push({x:cx,y:cy,w:540,h:400,color:'#703532'})}
 if(r.theme===3){add(1,right,top+70,230,150,370);add(4,left,bottom,160,100,260);add(6,left,top,155,90,240);m.rugs.push({x:cx,y:cy+50,w:320,h:230,color:'#51536a'})}
 if(r.theme===4){add(5,left,top,230,115,340);add(6,right,top,170,95,280);add(2,cx,cy+80,230,100,330)}
 if(r.theme===5){add(6,left,top,170,95,280);add(6,right,top,170,95,280);add(6,right,bottom,170,95,280)}
 if(r.theme===6){add(3,right,cy,200,100,310);add(4,left,bottom,160,90,265);m.rugs.push({x:cx,y:cy,w:270,h:r.h-330,color:'#366555'})}
 if(r.theme===7){add(0,left,top,170,95,275);add(4,right,bottom,180,90,300);add(3,left,bottom,160,80,265)}
 if(r.theme===8){add(3,left,cy,180,95,290);add(3,right,cy,180,95,290);m.rugs.push({x:cx,y:cy,w:300,h:r.h-250,color:'#77403b'})}}
 // Garden compositions: a fountain court, rose borders and quiet seating, outside the manor walls.
 const fountain={x:4320,y:3050};add(7,fountain.x,fountain.y,230,180,390);add(11,4320,3410,150,70,250);add(8,4560,3200,150,90,250);add(8,4100,3380,150,90,250);add(11,650,3300,150,70,245);add(8,500,3100,150,90,255);add(8,780,3460,150,90,255);add(8,1550,3950,170,90,280);add(11,1780,4000,150,70,250);
 m.zones=[{name:'噴水の庭',x:4000,y:2450,w:700,h:1400},{name:'薔薇の庭',x:300,y:2900,w:1500,h:1300},{name:'木漏れ日の森',x:0,y:0,w:4800,h:4400}];
 // Natural clusters leave wide grassy travel lanes. Trees never block a doorway or paved route.
 for(let i=0;i<150;i++){const x=140+rand()*4520,y=140+rand()*4120,t=tile537(m,x,y);if(t!==6&&!(t===5&&(x<650||x>4350||y>3900)))continue;if(dist({x,y},fountain)<650||m.decor.some(o=>dist(o,{x,y})<175))continue;add(rand()<.65?9:10,x,y,65,60,310+rand()*100)}
 // All geometry is complete before generating cached collision/navigation data.
 const spawn=nearest537(m,{x:m.rooms[0].cx,y:m.rooms[0].cy+100}),hunter=nearest537(m,{x:south.x,y:4100});m.spawn={x:spawn.x,y:spawn.y};m.hunter={x:hunter.x,y:hunter.y};return m;
}
export function furniture537(m,seed){const rand=random537(seed^0x538),objects=[];function put(kind,x,y,zone){if(!free537(m,x,y,28)||objects.some(o=>dist(o,{x,y})<74)||dist({x,y},m.spawn)<105||dist({x,y},m.hunter)<100)return;objects.push({kind,x:x+(rand()-.5)*8,y:y+(rand()-.5)*8,checked:false,zone})}
 for(const r of m.rooms){const l=r.x+160,rr=r.x+r.w-160,t=r.y+170,b=r.y+r.h-170,cx=r.cx,cy=r.cy,z=r.name;
 const row=(kinds,x,y,dx=100,dy=0)=>kinds.forEach((kind,i)=>put(kind,x+i*dx,y+i*dy,z));
 if(r.theme===0){row([5,10],l,t,110);row([5,11],rr-110,b,110);row([9,4],l,cy+110,100);put(10,rr,b-130,z)}
 if(r.theme===1){row([10,0],l,b,105);row([9,10],rr-190,b-130,100);put(5,rr,t+170,z)}
 if(r.theme===2){for(const dx of [-175,0,175]){put(9,cx+dx,cy+170,z);put(9,cx+dx,cy-170,z)}row([4,4,6],rr-190,t,90);put(10,l,b,z)}
 if(r.theme===3){row([0,10],rr-120,b,105);row([9,5],l+140,b-80,95);put(11,l,t+170,z)}
 if(r.theme===4){row([7,7,8],l,b,90);row([5,6,4],rr-210,b,95);put(9,cx-200,cy+80,z);put(8,l,cy,z)}
 if(r.theme===5){row([1,1,2,2],l,b,105);row([7,7,7],l,cy,95);row([3,2,10],rr-210,cy,100);row([1,4],l,t+170,100)}
 if(r.theme===6){row([11,5],l,t,105);row([11,10],rr-100,b,100);put(9,l+120,b-80,z)}
 if(r.theme===7){row([0,10],rr-100,t,95);put(9,cx,cy+200,z);row([4,5],l,b,95)}
 if(r.theme===8){row([5,11],l,t,110);row([5,11],rr-100,b,100);put(10,l,b,z)}}
 // Outdoor items belong to a work corner, planting bench or fountain: no random litter in the woods.
 for(const [kind,x,y]of [[5,4160,3550],[5,4250,3550],[11,4500,3450],[10,4500,2780],[9,650,3430],[5,390,3380],[11,830,3250],[3,1230,3700],[2,1320,3720],[2,1410,3720],[7,1240,3830],[10,1940,4030]])put(kind,x,y,'庭');
 return objects;
}
