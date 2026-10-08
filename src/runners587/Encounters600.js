// Pure geometry shared by authority and rendering. Timers use game elapsed time.
export function firebar600(h,elapsed){const angle=elapsed/h.period*Math.PI*2+(h.offset??0);return Array.from({length:Math.ceil(h.length/15)},(_,i)=>({x:h.x+Math.cos(angle)*(i+1)*15,y:h.y+Math.sin(angle)*(i+1)*15,r:8}));}
export const tide600=(h,elapsed)=>({y:h.y+20-(.5-.5*Math.cos(elapsed/h.period*Math.PI*2))*83});
export function roller600(h,elapsed){const cycle=Math.floor(elapsed/h.period),phase=elapsed%h.period,t=(phase-700)/2800;return {cycle,warning:phase<700,active:t>=0&&t<1,x:h.right-(h.right-h.left)*Math.max(0,t),y:h.y-22,r:22};}
const overlap=(p,x,y,r)=>p.x+10>x-r&&p.x-10<x+r&&p.y>y-r&&p.y-28<y+r;
const active=p=>p.alive&&!p.waiting&&!p.paused&&!p.respawnAt&&p.finishTime==null;
export function bossPosition600(b,elapsed){return b.phase==='dash'?Math.max(b.left+28,Math.min(b.right-28,b.x+b.dir*(b.hp<=b.maxHp/2?165:130)*Math.max(0,Math.min(.15,(elapsed-(b.at600??elapsed))/1000)))):b.x;}
export function bossStomp600(p,b,old){return b.hp>0&&b.phase!=='sleep'&&Math.abs(p.x-b.x)<=39&&p.vy>=0&&old.y<=b.y-50&&p.y>=b.y-64&&p.y-28<b.y;}
export function initEncounters600(g,course){
 g.waves600={};g.rollerBroken600={};g.enemyShots600=[];g.boss600=course.boss600?{...course.boss600,phase:'sleep',phaseAt:0,turn:0,hitUntil:0,dir:-1}:null;
 if(g.boss600){const b=g.boss600,n=g.players.filter(p=>!p.departed).length;b.maxHp=b.hp=Math.round(b.maxHp*(1+.45*Math.max(0,n-1)));b.lastHitSeat601=null;b.lastHitAt601=-1e9;b.comboUntil601=0;}
 for(const e of g.enemies)if(e.prefrozen600)e.ice={x:e.x,y:e.y,dir:-1,vx:0,vy:0,at:0,until:1e9,kicker:null,grace:0};
}
export function hitBoss600(g,seat,amount,emit,impact={}){
 const b=g.boss600;if(!b||b.hp<=0||b.phase==='sleep'||g.elapsed<b.hitUntil)return false;
 const shield=['wave','fire'].includes(b.pattern)&&['warn','dash'].includes(b.phase);
 if(shield&&impact.kind==='shot'&&Math.sign(impact.x-b.x)===b.dir){emit(g,'boss-block',{seat,x:b.x+b.dir*30,y:b.y-32});return false;}
 const combo=seat!=null&&b.lastHitSeat601!=null&&seat!==b.lastHitSeat601&&g.elapsed-b.lastHitAt601<=1500&&g.elapsed>=(b.comboUntil601??0);
 if(combo){amount+=2;b.phase='stunned';b.phaseAt=g.elapsed;b.comboUntil601=g.elapsed+2600;emit(g,'boss-combo',{seat,helper:b.lastHitSeat601,x:b.x,y:b.y-36});}
 b.lastHitSeat601=seat;b.lastHitAt601=g.elapsed;
 b.hp=Math.max(0,b.hp-amount);b.hitUntil=g.elapsed+160;emit(g,'boss-hit',{seat,x:b.x,y:b.y-38});
 if(!b.hp){b.phase='down';b.phaseAt=g.elapsed;g.enemyShots600=[];if(g.players[seat])g.players[seat].kills++;emit(g,'boss-defeat',{seat,x:b.x,y:b.y});}
 return true;
}
export function encounters600(g,course,previous,emit,hurt,stomp){
 const players=g.players.filter(active),now=g.elapsed;
 for(const h of course.swarms600){
  let w=g.waves600[h.id];if(!w&&players.some(p=>p.x>=h.trigger))w=g.waves600[h.id]={start:now,count:0};
  if(!w)continue;
  while(w.count<h.count&&now>=w.start+Math.floor(w.count/4)*h.interval){
   const i=w.count++,flying=i%4===3,x=h.max-(i%4)*18;
   g.enemies.push({id:h.id+'-'+i,x,y:h.y-(flying?82:0),min:h.min,max:h.max,speed:85+i*3,advance:true,flying,bob:flying?12:0,motionOffset:now});
   emit(g,'swarm',{x,y:h.y});
  }
 }
 for(const p of players){
  for(const h of course.firebars600)if(Math.abs(p.x-h.x)<h.length+20&&firebar600(h,now).some(q=>overlap(p,q.x,q.y,q.r)))hurt(g,p,'firebar',h.x);
  for(const h of course.tides600)if(p.x+10>h.x&&p.x-10<h.x+h.w&&p.y>tide600(h,now).y&&p.y-28<h.y+25)hurt(g,p,'tide',h.x+h.w/2);
  for(const h of course.rollers600){const q=roller600(h,now);if(q.active&&g.rollerBroken600[h.id]!==q.cycle&&overlap(p,q.x,q.y,q.r))hurt(g,p,'ice-roll',q.x);}
 }
 const b=g.boss600;
 if(b?.hp>0){
  const target=players.filter(p=>p.x>b.left-150).sort((a,c)=>Math.abs(a.x-b.x)-Math.abs(c.x-b.x))[0];
  if(b.phase==='sleep'&&target){b.phase='warn';b.phaseAt=now;b.dir=target.x<b.x?-1:1;}
  let age=now-b.phaseAt;
  if(b.phase==='warn'&&age>=900){
   b.phase=b.pattern==='charge'||b.turn%2===0?'dash':'cast';b.phaseAt=now;age=0;
   if(b.phase==='cast'){
    const speeds=b.pattern==='wave'?[0]:[-55,0,55];
    for(const vy of speeds)g.enemyShots600.push({x:b.x+b.dir*32,y:b.y-(b.pattern==='wave'?10:30),vx:b.dir*230,vy,r:b.pattern==='wave'?10:8,kind:b.pattern,born:now,until:now+2200});
   }
  }
  if(b.phase==='dash'){b.x=Math.max(b.left+28,Math.min(b.right-28,b.x+b.dir*(b.hp<=b.maxHp/2?165:130)*.025));if(age>=850){b.phase='rest';b.phaseAt=now;}}
  if(b.phase==='cast'&&age>=350){b.phase='rest';b.phaseAt=now;}
  if((b.phase==='rest'&&age>=1000||b.phase==='stunned'&&age>=1400)&&target){b.turn++;b.phase='warn';b.phaseAt=now;b.dir=target.x<b.x?-1:1;}
  for(const p of players){const old=previous.get(p.seat);if(!old||Math.abs(p.x-b.x)>39)continue;
   const top=b.y-62;
   if(bossStomp600(p,b,old)){hitBoss600(g,p.seat,2,emit);stomp(p,{y:top+24});emit(g,'stomp',{seat:p.seat,x:b.x,y:top});}
   else if(p.y>top+3&&p.y-28<b.y)hurt(g,p,'boss',b.x);
  }
  b.at600=now;
 }
 g.enemyShots600=(g.enemyShots600??[]).filter(s=>{
  const oldX=s.x;s.x+=s.vx*.025;s.y+=s.vy*.025;
  for(const p of players)if(p.x+10>Math.min(oldX,s.x)-s.r&&p.x-10<Math.max(oldX,s.x)+s.r&&p.y>s.y-s.r&&p.y-28<s.y+s.r){hurt(g,p,'boss-shot',oldX);return false;}
  return now<s.until&&(!b||s.x>b.left-100&&s.x<b.right+100);
 });
}
