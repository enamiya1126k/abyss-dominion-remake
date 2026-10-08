// Shared geometry and cooperative state. No DOM or timers outside game time.
export const BUDDY601=620;
export const active601=p=>p.alive&&!p.departed&&!p.waiting&&!p.paused&&!p.respawnAt&&p.finishTime==null;
export function buddyContact601(rider,before,base,old,at){
 if(!before||!old||before.grounded||!active601(base)||base.seat===rider.seat||at<(rider.buddyUntil??0)||rider.y<before.y)return false;
 return Math.abs(rider.x-base.x)<24&&before.y<=old.y-25&&rider.y>=base.y-28&&rider.y<=base.y+10&&rider.y-before.y>=base.y-old.y;
}
export function bounceBuddy601(rider,base,at){
 Object.assign(rider,{y:base.y-28,vy:-BUDDY601,grounded:false,platformId:null,lastGroundAt:-1e9,jumpBufferUntil:0,springFlight:true,buddyUntil:at+350,reboundJump599:true,airJumps598:0,airJumpUsed:false,wallSide:0,wallAt:-1e9});
 rider.buddyBounces=(rider.buddyBounces??0)+1;
}
export function checkpoint601(g,index,seat,emit){
 if(index<=(g.teamCheckpoint??0))return false;
 g.teamCheckpoint=index;
 for(const p of g.players)if(!p.departed)p.checkpoint=Math.max(p.checkpoint??0,index);
 emit(g,'checkpoint',{seat,checkpoint:index,shared:true});return true;
}
export function initCoop601(g){g.stars601=[];g.starBy601={};g.coop601={};}
export const starOpen601=(g,star)=>!star.trial||!!g.coop601?.[star.trial]?.open;
export function cooperation601(g,course,emit){
 const players=g.players.filter(active601);
 for(const trial of course.trials601??[]){
  const state=g.coop601[trial.id]??={charge:0,open:false};if(state.open)continue;
  const occupants=trial.pads.map(pad=>players.filter(p=>p.grounded&&Math.abs(p.x-pad.x)<=23&&Math.abs(p.y-pad.y)<=5).map(p=>p.seat));
  const held=occupants[0].some(a=>occupants[1].some(b=>a!==b));
  state.charge=held?Math.min(600,state.charge+25):0;
  if(state.charge>=600){state.open=true;state.at=g.elapsed;emit(g,'star-unlock',{x:trial.reward.x,y:trial.reward.y});}
 }
 for(const star of course.stars601??[]){
  if(g.stars601.includes(star.id)||!starOpen601(g,star))continue;
  const p=players.find(p=>Math.hypot(p.x-star.x,p.y-14-star.y)<25);if(!p)continue;
  g.stars601.push(star.id);g.starBy601[star.id]=p.seat;p.starsTaken601=(p.starsTaken601??0)+1;
  emit(g,'star',{seat:p.seat,x:star.x,y:star.y,count:g.stars601.length});
 }
}
export const deathLabel601=p=>'死亡 '+(p?.fatalDeaths601??p?.falls??0)+'回';
