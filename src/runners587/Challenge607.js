// Optional star routes: the main road and checkpoints remain accessible.
export function challenge607(c){
 for(const tr of c.trials601){
  if(c.id==='relay')tr.pads[0].x+=40;
  if(tr.kind604==='sprint')tr.limit604=3200;
  const a=tr.pads[0],star=c.stars601.find(s=>s.trial===tr.id),gated=tr.kind604==='sprint'||tr.kind604==='duet';
  c.platforms=c.platforms.filter(p=>p.trial601!==tr.id&&!p.id.startsWith(tr.id+'-step604-'));
  const dx=tr.reward.x-a.x,dir=dx<0?-1:1;
  const offsets=[100,20,135,dx],route=[];
  // 72px rises fit an ordinary held jump. Reversing direction and small
  // moving/crumbling ledges make one-player timing tight; buddy jumps skip links.
  for(let i=0;i<4;i++){
   const p={id:tr.id+'-acro607-'+i,x:a.x+(i===3?dx:offsets[i]*dir)-24,y:a.y-72*(i+1),w:48,h:18,acro607:true};
   if(c.id==='crystal'&&i===0)p.y=142;
   if(gated)p.trial601=tr.id;
   if(i===1)p.move={axis:'x',range:14,period:2400};
   if(i===2)p.crumble=true;
   c.platforms.push(p);route.push(p);
  }
  Object.assign(tr.reward,{x:route[3].x+24,y:route[3].y-30});Object.assign(star,tr.reward);
  tr.route607=route.map(p=>p.id);tr.start607={...a};
  c.hints601.push({kind:'buddy',x:a.x,y:a.y});
  if(tr.kind604==='rings')tr.rings604=[0,1,2].map(i=>({x:route[i].x+24,y:route[i].y-26}));
  if(tr.kind604==='targets'){
   tr.window607=6000;tr.targets604.forEach((q,i)=>Object.assign(q,{x:route[i].x+24,y:route[i].y-28}));
  }
  if(tr.kind604==='combat'){
   tr.window607=6500;delete route[1].move;delete route[2].crumble;route[3].crumble=true;
   tr.guards604.forEach((id,i)=>{const e=c.enemies.find(e=>e.id===id),p=route[i];Object.assign(e,{x:p.x+24,y:p.y,min:p.x+10,max:p.x+38,speed:18});});
  }
  c.pickups.push({id:tr.id+'-supply607',x:tr.kind604==='rings'?a.x-24:route[0].x+24,y:(tr.kind604==='rings'?a.y:route[0].y)-27,kind:'fire',optional607:true,...(gated?{trial601:tr.id}:{})});
 }
 // Replace low, unguarded roadside rewards with a higher optional detour.
 for(const star of c.stars601.filter(s=>!s.trial&&['canopy','tide','ice','fire'].includes(s.kind))){
  const baseY=star.y+30,x=star.x;
  star.route607=[];
  for(let i=0;i<3;i++){const p={id:star.id+'-acro607-'+i,x:x+(i%2===0?90:0)-23,y:baseY-72*(i+1),w:46,h:18,acro607:true};if(i===1)p.move={axis:'x',range:14,period:2600};if(i===0)p.crumble=true;c.platforms.push(p);star.route607.push(p.id);}
  star.x=x+90;star.y=baseY-246;
 }
 c.stars601.sort((a,b)=>a.x-b.x);c.stars601.forEach((s,i)=>s.slot604=i);
 c.features=[c.features[0],'上空アクロバット・役割分担'];
 c.description+=' 星の寄り道は上空の難関。仲間がスイッチを維持し、別の仲間が登る。射的と番兵は制限時間内に分担しよう。';
 return c;
}
