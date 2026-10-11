// Build611: one continuous world. Ships are autonomous, optional moving floors.
export function voyageCourse609(){
 const c={id:'voyage',name:'魔界渡りの暴走船',en:'THE RUNAWAY ARK',theme:'coast',expert603:true,ship609:true,color:'#70d7d2',icon:'wave',level:'上級・島めぐり',tag:'船・分岐・連続コース',mode:'coop',height:400,ground:300,length:6800,goal:6690,duration:600000,description:'砲撃岩礁、水門工場、嵐の灯台をひと続きに走破。船は自動で往復する足場。陸路でも船でもゴールへ進める。鍵・番兵・封印はスターを狙う寄り道。1〜4人、途中の旗から何度でも再挑戦。',features:['船でも陸路でも進める','3つの島・上下の分岐']};
 for(const k of ['grounds','platforms','walls','bridges','switches','switchAccess602','belts','winds','hazards','springs','gems','enemies','pickups','checkpoints','firebars600','swarms600','tides600','rollers600','secrets600','crushers','stars601','trials601','hints601','climbs602','saws603','pendulums603','lightning603','cannons603','meteors603','jets603','modules603'])c[k]=[];
 const pad=(id,x,y,w=110,more={})=>c.platforms.push({id:'voyage-'+id,x,y,w,h:18,...more});
 const power=(id,x,y,kind)=>c.pickups.push({id:'voyage-power-'+id,x,y:y-27,kind});
 c.sections=[{x:0,name:'砲撃岩礁と崩落橋',sub:'崩れる橋を駆け抜け、高台にも寄り道'},{x:2200,name:'水門工場の上下ルート',sub:'蒸気とプレスの下道か、番兵の上道か'},{x:4400,name:'嵐の灯台と風の回廊',sub:'風で灯台へ登るか、海沿いを駆け抜けるか'}];
 // Safe shores join sections without moving the players or resetting time.
 c.grounds=[[0,280,300],[1000,1290,228],[1960,2370,300],[2540,2770,245],[2880,3290,245],[3490,3710,300],[4050,4630,300],[5080,5330,210],[6020,6190,260],[6440,6800,300]];
 c.checkpoints=[{x:90,y:300},{x:1080,y:228},{x:2200,y:300},{x:3220,y:245},{x:4460,y:300},{x:5160,y:210},{x:6090,y:260}];
 // 1. Uneven reef, crumbling causeway and an optional tall treasure climb.
 pad('reef-step',350,250,105);pad('reef-crumble',520,206,130,{crumble:true});pad('reef-battery',705,184,155);pad('reef-tide',915,228,110,{move:{axis:'y',range:24,period:4200}});
 pad('reef-key-step',1020,158,110);pad('reef-key',1180,92,125);pad('reef-star',1360,26,115);pad('reef-high-return',1550,102,100);pad('reef-high-exit',1730,174,100);
 pad('reef-bridge-a',1380,230,110,{crumble:true});pad('reef-bridge-b',1550,242,110,{crumble:true});pad('reef-bridge-c',1740,262,120,{crumble:true});
 c.cannons603.push({id:'voyage-reef-cannon',x:810,y:184,period:3700,warning:1050,speed:235,range:580});
 c.firebars600.push({id:'voyage-reef-flame',x:1860,y:173,length:62,period:7200,offset:0});
 power('start',180,300,'fire');power('reef',1090,228,'wind');
 c.gems.push({id:'voyage-reef-boost',x:1395,y:201});
 // 2. Two horizontal routes: steam / crusher below, guards / treasure above.
 pad('works-entry',2425,245,105);pad('works-upper-a',2490,175,140);pad('works-guards',2700,105,200);pad('works-star',2960,36,125);pad('works-upper-b',3190,105,110);pad('works-upper-c',3360,180,110);
 pad('works-lift',3365,250,110,{move:{axis:'y',range:38,period:3900}});pad('works-shuttle',3790,240,120,{move:{axis:'x',range:32,period:3400}});pad('works-exit',3960,240,115);
 c.hazards.push({id:'voyage-works-steam',x:2650,y:245,w:70,h:63,period:4700,on:1400,offset:500});
 c.crushers.push({id:'voyage-works-press',x:3020,w:132,y:245,offset:1700});
 c.belts.push({x:3510,y:300,w:150,speed:-80});
 c.walls.push({id:'voyage-works-box',x:3645,y:264,w:36,h:36,breakable:true,box:true});
 for(const [i,x]of [2750,2850].entries())c.enemies.push({id:'voyage-guard-'+i,x,y:105,min:x-26,max:x+26,speed:29,axe604:true});
 power('works',2290,300,'water');power('guards',2570,175,'fire');power('works-exit',4160,300,'thunder');
 // 3. Wind tower, a low coast route, vanishing ledge with a permanent catch,
 // then a moving blade / pendulum gauntlet with a safe checkpoint between.
 pad('tower-entry',4720,246,110,{move:{axis:'y',range:20,period:4300}});pad('tower-coast',4890,210,130);
 pad('tower-step-a',5130,140,105);pad('tower-step-b',5290,72,105);pad('tower-seal',5450,8,135);pad('tower-return-a',5650,80,115);pad('tower-return-b',5810,150,120);
 pad('coast-phase',5420,255,135,{phase603:{period:4500,on:3100,offset:600}});pad('coast-catch',5410,325,170);pad('coast-crumble',5630,255,125,{crumble:true});pad('coast-saw',5820,238,130);pad('coast-last',6260,230,125);
 c.walls.push({id:'voyage-seal',x:5500,y:-30,w:36,h:38,breakable:true,box:true});
 c.jets603.push({id:'voyage-updraft',x:5010,y:300,w:65,h:260,speed:320,period:6200,on:2400});
 c.winds.push({x:5480,y:-60,w:540,h:350,speed:48});
 c.saws603.push({id:'voyage-coast-saw',x:5890,y:211,axis:'x',range:40,r:14,period:4000});
 c.pendulums603.push({id:'voyage-coast-pendulum',x:6360,y:20,length:162,period:4900,swing:.6,r:17,offset:.8});
 power('tower',4510,300,'wind');power('coast',5200,210,'stone');
 c.islands609=[{id:'voyage-key',index:0,kind:'key',x:1240,y:92},{id:'voyage-guards',index:1,kind:'guards',x:2800,y:105,guards:['voyage-guard-0','voyage-guard-1']},{id:'voyage-seal-bonus',index:2,kind:'seal',x:5518,y:8,seal:'voyage-seal'}];
 for(const [i,[x,y]] of [[1415,0],[3020,10],[5550,-18]].entries())c.stars601.push({id:'voyage-star-'+i,x,y,slot604:i,kind:'voyage',trial:c.islands609[i].id});
 c.modules603=[{kind:'reef',left:0,right:2200},{kind:'waterworks',left:2200,right:4400},{kind:'wind-tower',left:4400,right:6800}];
 return c;
}
// Constant routes and unique IDs keep remote players and prediction in sync.
// Each vessel returns naturally; no passenger, mission or section state is read.
export const SHIP_ROUTES611=Object.freeze([
 {id:'ark609',start:40,end:740,y:300,w:225,speed:84,dwell:2200,offset:0},
 {id:'ark-reef611',start:1300,end:1970,y:300,w:215,speed:98,dwell:2200,offset:1700},
 {id:'ark-works611',start:3300,end:3820,y:300,w:200,speed:90,dwell:2000,offset:3500},
 {id:'ark-tower611',start:4460,end:4840,y:300,w:220,speed:88,dwell:1800,offset:900},
 {id:'ark-coast611',start:5340,end:5785,y:300,w:220,speed:102,dwell:2000,offset:2300}
]);
export function vessel611(route,t){
 const travel=(route.end-route.start)/route.speed*1000,period=2*(travel+route.dwell),age=((t+route.offset)%period+period)%period;
 let x=route.start,speed=0,remaining=0;
 if(age<route.dwell)remaining=route.dwell-age;
 else if(age<route.dwell+travel){x=route.start+(age-route.dwell)*route.speed/1000;speed=route.speed;}
 else if(age<2*route.dwell+travel){x=route.end;remaining=2*route.dwell+travel-age;}
 else{x=route.end-(age-2*route.dwell-travel)*route.speed/1000;speed=-route.speed;}
 return {id:route.id,x,y:route.y,w:route.w,h:24,oneWay:true,move:{axis:'x'},ship609:true,speed,phase:speed?'cruise':'boarding',remaining};
}
export const voyageShips610=(t,g)=>SHIP_ROUTES611.map(r=>vessel611(r,t));
export const shipAt609=(t,g)=>vessel611(SHIP_ROUTES611[0],t);
export const aboard609=(p,b)=>p.grounded&&p.platformId===b.id&&p.x>=b.x-10&&p.x<=b.x+b.w+10;
// The voyage never gates the exit. Arrival alone is sufficient, in any order.
export const voyageReady609=()=>true;
export const voyageCheckpoint611=(p,cp)=>p.grounded&&!p.platformId?.startsWith('ark')&&p.x>=cp.x-20&&p.x<=cp.x+100&&Math.abs(p.y-cp.y)<6;
export function voyageStep609(g,c,emit){
 if(!c.ship609)return;
 const s=g.ship609??={completed:[]},live=g.players.filter(p=>p.alive&&!p.departed&&!p.waiting&&!p.paused&&!p.respawnAt&&p.finishTime==null);
 for(const h of c.islands609){
  if(s.completed.includes(h.index))continue;
  const success=h.kind==='key'?live.some(p=>Math.hypot(p.x-h.x,p.y-14-(h.y-20))<30):h.kind==='guards'?h.guards.every(id=>g.enemies.find(e=>e.id===id)?.defeated):g.broken.includes(h.seal);
  if(success){s.completed.push(h.index);g.coop601[h.id]={open:true,at:g.elapsed};emit(g,'voyage-objective',{leg:h.index,x:h.x,y:h.y});}
 }
}
