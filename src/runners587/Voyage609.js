// One persistent vessel, three independently retryable expeditions.
export function voyageCourse609(){
 const c={id:'voyage',name:'魔界渡りの暴走船',en:'THE RUNAWAY ARK',theme:'coast',expert603:true,ship609:true,color:'#70d7d2',icon:'wave',level:'上級・追走航路',tag:'上陸・攻略・飛び乗り',mode:'coop',height:400,ground:300,length:6800,goal:6690,duration:600000,description:'同じ船で三つの島を巡る。島では減速するが停止しない。鍵を回収、番兵を撃破、封印装置を破壊して、出航する船へ戻ろう。出航6秒前に予告。死亡・乗り遅れはその航路から全員で再挑戦。1〜4人、星は高所の寄り道。',features:['動く船から上陸・時間内に帰還','三つの島・航路ごとに再挑戦']};
 for(const k of ['grounds','platforms','walls','bridges','switches','switchAccess602','belts','winds','hazards','springs','gems','enemies','pickups','checkpoints','firebars600','swarms600','tides600','rollers600','secrets600','crushers','stars601','trials601','hints601','climbs602','saws603','pendulums603','lightning603','cannons603','meteors603','jets603','modules603'])c[k]=[];
 c.sections=[];c.islands609=[];
 const pad=(id,x,y,w=90)=>c.platforms.push({id,x,y,w,h:18});
 for(let i=0;i<3;i++){
  const a=i*2200,id='voyage-island-'+i;
  c.sections.push({x:a,name:['砲火を抜ける船出','番兵島の追走','封印灯台への最終便'][i],sub:''});
  c.checkpoints.push({x:a+100,y:300});c.grounds.push([a,a+270,300],[a+1960,a+2200,300]);
  c.islands609.push({id,index:i,kind:['key','guards','seal'][i],x:a+1195,y:84,returnX:a+1560,guards:[id+'-guard-a',id+'-guard-b'],seal:id+'-seal'});
  // Ship deck (y=300) passes below the island. Three 72px rises need no power.
  pad(id+'-landing',a+810,228,180);pad(id+'-step',a+970,156,125);pad(id+'-summit',a+1120,84,170);
  pad(id+'-return-high',a+1320,156,110);pad(id+'-return',a+1460,228,185);
  pad(id+'-star-low',a+1230,12,55);pad(id+'-star-high',a+1360,-60,48);
  c.stars601.push({id:id+'-star',x:a+1384,y:-90,slot604:i,kind:'voyage'});
  c.pickups.push({id:id+'-power',x:a+875,y:204,kind:'fire'});
  if(i===1){for(const [j,x] of [[0,a+1160],[1,a+1255]])c.enemies.push({id:c.islands609[i].guards[j],x,y:84,min:x-10,max:x+10,speed:16,axe604:true});}
  if(i===2)c.walls.push({id:id+'-seal',x:a+1210,y:46,w:36,h:38,breakable:true});
  // Batteries are on visible watchtowers, not floating in empty air.
  pad(id+'-battery',a+630,228,90);c.cannons603.push({id:id+'-cannon',x:a+675,y:228,period:3400,warning:900,speed:250,range:600,offset:i*310});
  c.pendulums603.push({id:id+'-pendulum',x:a+1770,y:75,length:190,period:4200,swing:.8,r:20,offset:i});
  c.walls.push({id:id+'-ceiling',x:a+1700,y:150,w:160,h:92});
  c.firebars600.push({id:id+'-flame',x:a+430,y:220,length:67,period:7200,offset:i});
  c.modules603.push({kind:'voyage',left:a,right:a+2200});
 }
 c.grounds.push([6600,6800,300]);return c;
}
export const SHIP609={id:'ark609',w:230,y:300,lead:2500,cruise:80,slow:20,escape:100,slowStart:780,slowEnd:1320,end:2010,returnLimit:1840};
export function shipAt609(t,world={}){
 const s=world.ship609??{leg:0,at:0},q=SHIP609,a=s.leg*2200;let sec=Math.max(0,t-s.at-q.lead)/1000,offset=40,speed=0,phase='boarding',remaining=q.lead-Math.max(0,t-s.at);
 if(sec>0){const cruise=(q.slowStart-40)/q.cruise,slow=(q.slowEnd-q.slowStart)/q.slow;
  if(sec<cruise){offset+=sec*q.cruise;speed=q.cruise;phase='cruise';remaining=(cruise-sec)*1000;}
  else if(sec<cruise+slow){offset=q.slowStart+(sec-cruise)*q.slow;speed=q.slow;remaining=(cruise+slow-sec)*1000;phase=remaining<=6000?'warning':'island';}
  else{offset=Math.min(q.end,q.slowEnd+(sec-cruise-slow)*q.escape);speed=offset===q.end?0:q.escape;phase=speed?'escape':'arrived';remaining=Math.max(0,(q.returnLimit-offset)/q.escape*1000);}
 }
 return {id:q.id,x:a+offset,y:q.y,w:q.w,h:24,oneWay:true,move:{axis:'x'},ship609:true,speed,phase,remaining:Math.max(0,remaining)};
}
export const aboard609=(p,b)=>p.grounded&&p.platformId===b.id&&p.x>=b.x-10&&p.x<=b.x+b.w+10;
export function voyageReady609(g,c){return !c.ship609||g.ship609?.completed?.length===3&&shipAt609(g.elapsed,g).phase==='arrived';}
export function resetVoyage609(g,c,emit,advance=false){
 const old=g.ship609,leg=old.leg+(advance?1:0),s=g.ship609={leg,at:g.elapsed,completed:[...old.completed],retry:(old.retry??0)+(advance?0:1),objective:false};
 if(advance)s.completed=[...new Set([...s.completed,old.leg])];
 const a=leg*2200,island=c.islands609[leg];
 g.enemies=g.enemies.filter(e=>!e.id.startsWith(island.id)).concat(c.enemies.filter(e=>e.id.startsWith(island.id)).map(e=>({...e,downUntil:0})));
 g.broken=g.broken.filter(id=>id!==island.seal);g.projectiles=[];g.enemyShots600=[];g.threats604.shots=[];
 g.teamCheckpoint=leg;g.crumbles={};
 const b=shipAt609(g.elapsed,g);
 for(const p of g.players){if(p.departed||p.finishTime!=null)continue;Object.assign(p,{x:b.x+55+p.seat*35,y:b.y,vx:0,vy:0,axis:0,grounded:true,platformId:b.id,checkpoint:leg,respawnAt:0,death604:null,frozenUntil604:0,lastGroundAt:g.lastAt,controlAt:g.lastAt,jumpHeld:false,jumpBufferUntil:0,attackHeld:false,waiting:!!p.paused,waitSurface:{x:b.x,y:b.y},wallSide:0,wallAt:-1e9,wallLockUntil:0,bumpUntil:0,bumpSafeUntil:0,springFlight:false,reboundJump599:false,invincibleUntil:g.lastAt+1600,motionEpoch600:(p.motionEpoch600??0)+1});}
 emit(g,advance?'voyage-next':'voyage-retry',{leg,retry:s.retry});
}
export function voyageStep609(g,c,emit,hurt){
 if(!c.ship609)return;const s=g.ship609,b=shipAt609(g.elapsed,g),h=c.islands609[s.leg];
 const crew=g.players.filter(p=>!p.departed&&p.finishTime==null),live=crew.filter(p=>p.alive&&!p.waiting&&!p.paused&&!p.respawnAt);
 s.rescue=live.some(p=>aboard609(p,b)&&p.x>b.x+b.w-60);
 if(s.retryAt!=null){if(g.elapsed>=s.retryAt)resetVoyage609(g,c,emit);return;}
 if(crew.some(p=>p.respawnAt)){s.retryAt=g.elapsed+700;return;}
 if(!s.objective){
  const islanders=live.filter(p=>p.x>=h.x-130&&p.x<=h.x+150&&p.y<=105&&p.y>=-130);
  const success=h.kind==='key'?islanders.some(p=>Math.hypot(p.x-h.x,p.y-14-(h.y-20))<30):h.kind==='guards'?h.guards.every(id=>g.enemies.find(e=>e.id===id)?.defeated):g.broken.includes(h.seal);
  if(success){s.objective=true;emit(g,'voyage-objective',{leg:s.leg,x:h.x,y:h.y});}
 }
 if(b.phase==='warning'&&!s.warned){s.warned=true;emit(g,'voyage-warning',{leg:s.leg});}
 if(b.x>=s.leg*2200+SHIP609.returnLimit){
  // A return jump in flight remains valid; truly stranded island players cannot wait forever.
  const missed=live.filter(p=>!aboard609(p,b)&&!(p.x>=s.leg*2200+1940&&p.y<=320)&&!(p.x>=b.x-100&&p.y<300));
  if(!s.objective||missed.length){for(const p of missed)hurt(g,p,'stranded');s.retryAt=g.elapsed+700;emit(g,'voyage-missed',{leg:s.leg,objective:s.objective});return;}
 }
 if(b.phase==='arrived'&&s.objective){
  const allBack=crew.length>0&&crew.every(p=>!p.respawnAt&&(aboard609(p,b)||p.x>=s.leg*2200+1940&&p.y<=320));
  if(allBack){if(s.leg<2)resetVoyage609(g,c,emit,true);else s.completed=[0,1,2];}
 }
}
