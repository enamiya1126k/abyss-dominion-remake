const ledge=(c,id,x,y,w=90,extra={})=>c.platforms.push({id:c.id+'-601-'+id,x,y,w,h:18,...extra});
const star=(c,x,y,extra={})=>c.stars601.push({id:c.id+'-star'+(c.stars601.length+1),x,y,...extra});
function leap(c,x,y,toX,toY){
 ledge(c,'launch',x,y,80);ledge(c,'treasure',toX,toY,90);star(c,toX+45,toY-30,{kind:'leap'});
 c.hints601.push({kind:'buddy',x:x+40,y});
}
function shrine(c,pads,x,y){
 const id=c.id+'-duet601';c.trials601.push({id,pads:pads.map(([x,y])=>({x,y})),reward:{x,y}});
 // Opening the two seals is permanent; helpers may leave their pads afterward.
 star(c,x,y,{trial:id,kind:'duet'});ledge(c,'duet-reward',x-45,y+29,90,{trial601:id});
 for(const p of c.trials601.at(-1).pads){
  c.hazards=c.hazards.filter(h=>p.x<h.x-55||p.x>h.x+h.w+55);
  c.enemies=c.enemies.filter(e=>e.flying||p.x<(e.min??e.x)-35||p.x>(e.max??e.x)+35);
 }
}
const keepSpikes={forest:4,sky:0,relay:1,clock:2,coast:0,frost:2,crystal:0,ember:4};
export function cooperativeCourse601(source){
 const c={...source,stars601:[],trials601:[],hints601:[]};
 for(const k of ['grounds','platforms','walls','hazards','belts','winds','springs','crushers','gems','enemies','checkpoints','firebars600','swarms600','tides600','rollers600','secrets600'])c[k]=source[k].map(s=>Array.isArray(s)?[...s]:{...s});
 // Stop stamping the same crusher, spike rows and steam corridors into every world.
 if(!['forest','clock','ember'].includes(c.id)){
  const removed=c.crushers;c.crushers=[];
  c.grounds=c.grounds.map(([a,b,y=300])=>[a,b,removed.some(h=>a===h.pitX)?300:y]);
 }
 const spikes=c.hazards.filter(h=>h.kind==='spikes').sort((a,b)=>a.x-b.x),count=keepSpikes[c.id];
 c.hazards=spikes.filter((h,i)=>count&&i%Math.max(1,Math.ceil(spikes.length/count))===0).slice(0,count);
 if(c.id==='clock'||c.id==='ember'){
  const vents=source.hazards.filter(h=>h.kind!=='spikes').sort((a,b)=>a.x-b.x),selected=[];
  for(const h of vents)if(selected.every(q=>Math.abs(q.x-h.x)>=1400)&&selected.length<(c.id==='clock'?3:2))selected.push(h);
  // The castle keeps one long timed run; the tower uses separate single vents.
  if(c.id==='ember'){const wide=vents.find(h=>h.wide);if(wide&&!selected.some(h=>h.wide))selected[selected.length-1]=wide;}
  c.hazards.push(...selected);
 }
 const density={forest:1,sky:5,relay:4,clock:4,coast:4,frost:3,crystal:5,ember:2}[c.id];
 c.enemies=c.enemies.filter((e,i)=>e.prefrozen600||e.id.includes('keeper')||i%density===0);
 // Retain authored walls in the tower and castle; elsewhere only a single wreck stack.
 if(['sky','crystal'].includes(c.id))c.walls=c.walls.filter(w=>!w.breakable);
 if(['relay','coast','frost'].includes(c.id)){const x=c.walls.find(w=>w.box)?.x;c.walls=c.walls.filter(w=>!w.box||w.x===x);}
 if(c.id==='forest'){
  star(c,636,92,{kind:'canopy'});
  leap(c,2580,170,2890,140);
  shrine(c,[[6910,300],[7150,300]],7030,209);
  c.sections=c.sections.map((s,i)=>({...s,name:['こもれびの森','樹上の寄り道','石の昇降門','枝から枝へ','虫たちの包囲網','森の番兵'][i]}));
 }
 if(c.id==='sky'){
  star(c,5045,-184,{kind:'summit'});leap(c,3110,195,3420,165);
  ledge(c,'launch-step',3020,245);shrine(c,[[4645,80],[4845,-30]],4745,-91);
 }
 if(c.id==='relay'){
  const room=c.secrets600[0];star(c,room.entrance+32,room.floor-38,{kind:'secret'});
  leap(c,2530,185,2840,155);ledge(c,'launch-step',2440,245);
  shrine(c,[[3980,300],[4395,300]],4200,225);
 }
 if(c.id==='clock'){
  star(c,4765,-222,{kind:'summit'});const h=c.crushers[0];star(c,h.x+h.w/2,37,{kind:'lift'});
  shrine(c,[[5770,142],[5920,300]],5860,208);
 }
 if(c.id==='coast'){
  c.tides600.push({id:'coast-tide601',x:850,w:385,y:300,period:9500});
  ledge(c,'low-reef',990,264,80);star(c,1030,239,{kind:'tide'});
  ledge(c,'launch-step',3920,240);leap(c,4020,183,4330,161);
  ledge(c,'seal-west',5655,220,86);ledge(c,'seal-east',5940,220,86);
  shrine(c,[[5698,220],[5983,220]],5840,154);
 }
 if(c.id==='frost'){
  c.rollers600.push({id:'frost-roll601',left:950,right:1410,y:300,period:5500});
  ledge(c,'ice-shelf',1300,150,100);star(c,1350,118,{kind:'ice'});
  ledge(c,'launch-step',2840,240);leap(c,2940,181,3250,160);
  shrine(c,[[5195,300],[5500,300]],5365,210);
 }
 if(c.id==='crystal'){
  const room=c.secrets600[0];star(c,room.entrance+32,room.floor-38,{kind:'secret'});
  star(c,5680,28,{kind:'summit'});
  shrine(c,[[6030,221],[6200,142]],6300,181);
 }
 if(c.id==='ember'){
  ledge(c,'fire-treasure',4895,160,85);star(c,4937,126,{kind:'fire'});
  ledge(c,'fire-step',4810,230,75);ledge(c,'launch-step',5470,245,75);leap(c,5570,205,5875,170);
  shrine(c,[[6500,300],[6830,300]],6650,168);
 }
 // Visible from the main road, then descending into the actual opening.
 for(const room of c.secrets600){
  c.hints601.push({kind:'secret',x:room.entrance,y:300,left:room.left,right:room.right});
  for(let i=0;i<3;i++)c.gems.push({id:room.id+'-hint601-'+i,x:room.entrance-48+i*24,y:248+i*35});
 }
 c.features=[source.features[0],c.id==='clock'?'乗れる昇降壁':'協力スター３つ'];
 c.description=source.description+' スターは全３個。寄り道と仲間ジャンプ、２人で踏む封印台で集めよう。スターなしでもゴールでき、旗は全員共通。';
 c.duration=Math.max(c.duration,360000);
 return c;
}
