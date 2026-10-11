// Launch locations are fixed 900ms ahead; attacks never retarget after warning.
export function voyageThreats613(g,routes,vessel,emit){
 const s=g.ship609,now=g.elapsed;s.fired613??={};s.warnings613??=[];
 for(const [leg,r]of routes.entries()){
  const age=now-r.depart-1800;if(age<0||now>=r.arrival-1500)continue;
  const slot=Math.floor(age/3600),key=r.id+':'+slot;if(s.fired613[key])continue;s.fired613[key]=true;
  const rain=leg>0&&slot%3===2,high=slot%2===1,dir=slot%2?1:-1,b=vessel(r,now+900);
  s.warnings613.push({key,at:now+900,kind:rain?'rain':'side',dir,high,x:rain?b.x+b.w*.65:dir>0?b.x-135:b.x+b.w+135,y:rain?50:high?231:286});
 }
 s.warnings613=s.warnings613.filter(w=>{if(now<w.at)return true;g.enemyShots600.push({x:w.x,y:w.y,vx:w.kind==='rain'?0:w.dir*270,vy:w.kind==='rain'?310:0,r:9,kind:w.kind==='rain'?'rain613':'fire',born:now,until:now+3000});return false;});
}
