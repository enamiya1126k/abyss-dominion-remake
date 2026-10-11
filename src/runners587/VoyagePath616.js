// One authoritative voyage clock. A route has no departure until a living runner boards.
export const SHIP_ROUTES616=Object.freeze([
 {id:'ark609',start:280,end:1860,w:240,speed:84,knots:[[280,300],[620,280],[960,275],[1250,270],[1500,300],[1860,300]]},
 {id:'ark-works611',start:2860,end:4360,w:240,speed:92,knots:[[2860,300],[3210,215],[3550,265],[3860,345],[4170,250],[4360,300]]},
 {id:'ark-coast611',start:5440,end:7260,w:240,speed:98,knots:[[5440,300],[5730,235],[6070,115],[6410,65],[6690,35],[7010,215],[7260,300]]}
].map(r=>Object.freeze({...r,y:300,duration:(r.end-r.start)/r.speed*1000,knots:Object.freeze(r.knots.map(Object.freeze))})));
export function routeY616(r,x){
 const i=r.knots.findIndex(q=>q[0]>=x),a=r.knots[Math.max(0,i-1)],b=r.knots[i<0?r.knots.length-1:i];
 const u=Math.max(0,Math.min(1,(x-a[0])/Math.max(1,b[0]-a[0]))),f=u*u*(3-2*u);return a[1]+(b[1]-a[1])*f;
}
export function shipPose616(r,t,depart=null){
 const age=depart==null?0:Math.max(0,t-depart),x=Math.min(r.end,r.start+age*r.speed/1000),moving=depart!=null&&t>=depart&&age<r.duration;
 return {id:r.id,x,y:routeY616(r,x),w:r.w,h:24,oneWay:true,move:{axis:'xy'},ship609:true,speed:moving?r.speed:0,phase:depart==null?'boarding':moving?'cruise':'arrived'};
}
export const depart616=(g,id)=>g?.ship609?.departures616?.[id]?.at??null;
// A known one-way path can keep moving through short packet gaps. Freeze a paused room.
export function voyageTime616(g,at){
 const stopped=g.phase!=='play'||g.stage!=='run'||g.players?.every(p=>!p.alive||p.departed||p.waiting||p.paused||p.finishTime!=null);
 return g.elapsed+(stopped?0:Math.max(0,Math.min(1000,at-g.serverAt)));
}
export function deckEnemy616(e,t){
 const d=e.deck616,r=SHIP_ROUTES616.find(r=>r.id===d.route),boat=shipPose616(r,t,d.depart);
 if(t<d.landAt){const u=Math.max(0,(t-d.born)/(d.landAt-d.born));return {...e,x:d.dropX,y:d.fromY+(d.landY-d.fromY)*u*u,dir:-1};}
 const width=170,travel=(d.localX-35+(t-d.landAt)/1000*(e.speed??65))%(2*width),local=35+(travel<=width?travel:width*2-travel);
 return {...e,x:boat.x+local,y:boat.y,dir:travel<=width?1:-1};
}
export function deckRock616(q,t){
 if(t<q.at||t>q.at+2300)return null;
 const r=SHIP_ROUTES616.find(r=>r.id===q.route),b=shipPose616(r,t,q.depart),age=(t-q.at)/1000,local=r.w+42-age*215,fall=Math.max(0,-local/215);
 return {x:b.x+local,y:b.y-36+650*fall*fall,r:36,angle:-age*5};
}
