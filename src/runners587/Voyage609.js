import {voyageEvents616} from './VoyageEvents616.js';
import {SHIP_ROUTES616,shipPose616,depart616} from './VoyagePath616.js';
export const SHIP_ROUTES611=SHIP_ROUTES616;
export const vessel611=(r,t,g)=>shipPose616(r,t,depart616(g,r.id));
export const voyageShips610=(t,g)=>SHIP_ROUTES611.map(r=>vessel611(r,t,g));
export const shipAt609=(t,g)=>vessel611(SHIP_ROUTES611[0],t,g);
export const aboard609=(p,b)=>p.grounded&&p.platformId===b.id&&p.x>=b.x-10&&p.x<=b.x+b.w+10;
export const voyageReady609=()=>true;
export const voyageCheckpoint611=(p,cp)=>p.grounded&&!p.platformId?.startsWith('ark')&&p.x>=cp.x-20&&p.x<=cp.x+100&&Math.abs(p.y-cp.y)<6;
export function voyageCourse609(){
 const c={id:'voyage',name:'魔界渡りの暴走船',en:'THE RUNAWAY ARK',theme:'coast',expert603:true,ship609:true,color:'#70d7d2',icon:'wave',level:'上級・立体航海',tag:'跳び降りろ、船に戻れ！',mode:'coop',height:400,ground:300,length:8000,goal:7820,duration:210000,description:'誰かが乗った瞬間、船は片道の航海へ！振り子斧や炎の柱を上空の足場でかわし、上下へ進み続ける船へ戻ろう。大砲・落下する敵・甲板を掃く大岩も待ち受ける。船に置いていかれたら脱落。',features:['乗船で即出航・再便なし','空中へ退避 → 船へ帰還','3つの航路と宝星チャレンジ']};
 for(const k of ['grounds','platforms','walls','bridges','switches','switchAccess602','belts','winds','hazards','springs','gems','enemies','pickups','checkpoints','firebars600','swarms600','tides600','rollers600','secrets600','crushers','stars601','trials601','hints601','climbs602','saws603','pendulums603','lightning603','cannons603','meteors603','jets603','modules603'])c[k]=[];
 const pad=(id,x,y,w=105,extra={})=>c.platforms.push({id:'voyage-'+id,x,y,w,h:18,...extra});
 const power=(id,x,y,kind)=>c.pickups.push({id:'voyage-power-'+id,x,y:y-27,kind});
 c.sections=[{x:0,name:'振り子の海峡と炎の門',sub:'乗ったら出航！ 炎の前で上空へ、抜けたら船へ'},{x:2860,name:'砲台の谷と甲板の大岩',sub:'降ってくる敵を迎撃！ 大岩の前に足場へ逃げろ'},{x:5440,name:'天空を昇る最後の航路',sub:'船は空へ、そして急降下。4つの輪は一度きり！'}];
 c.grounds=[[0,280,300],[2100,2860,300],[4600,5440,300],[7500,8000,300]];
 c.checkpoints=[{x:90,y:300},{x:2170,y:300},{x:4670,y:300},{x:7570,y:300}];
 // These are short detours, separated from shore by sea that even wind jumps cannot bridge.
 pad('axe-refuge',1160,195,110);pad('flame-overpass',1320,115,135);pad('flame-exit',1510,120,120);pad('cannon-reef',1810,185,105);
 pad('rock-refuge',3820,250,120);pad('raider-perch',4000,165,130);pad('valley-cannon',4230,170,110);
 pad('sky-step',6370,0,110);pad('sky-overpass',6540,-75,110);pad('sky-exit',6740,-75,120);pad('dive-step',6940,65,110);
 c.pendulums603.push({id:'voyage-axe-1',x:820,y:20,length:250,r:24,period:3300,swing:.9,offset:.3},{id:'voyage-axe-2',x:1040,y:5,length:230,r:24,period:3900,swing:.85,offset:2.1},{id:'voyage-sky-axe',x:6080,y:-145,length:245,r:24,period:3500,swing:.8,offset:1.4});
 c.firebars600.push({id:'voyage-flame-gate',x:1480,y:130,length:210,angle616:Math.PI/2,noHub616:true,period:1},{id:'voyage-valley-wheel',x:4140,y:130,length:65,period:3900,offset:1.7,noHub616:true},{id:'voyage-sky-gate',x:6680,y:-40,length:210,angle616:Math.PI/2,noHub616:true,period:1},{id:'voyage-sky-wheel',x:6880,y:-100,length:65,period:4300,offset:2.4,noHub616:true});
 c.cannons603.push({id:'voyage-reef-cannon',x:1865,y:185,dir:-1,period:4200,offset:1500,range:540,speed:245},{id:'voyage-valley-gun',x:4285,y:170,dir:-1,period:3800,offset:700,range:600,speed:260});
 c.enemies.push({id:'voyage-perch-guard',x:4050,y:165,min:4020,max:4110,speed:55},{id:'voyage-sky-guard',x:6790,y:-75,min:6760,max:6840,speed:58});
 c.signs616=[{x:1170,y:156,text:'炎の前に上へ！'},{x:1570,y:80,text:'船は止まらない！'},{x:3820,y:207,text:'大岩は上空でかわす'},{x:6490,y:-112,text:'炎を越えて、船へ戻れ！'}];
 pad('seal-a',2210,225,110);pad('seal-b',2390,150,110,{crumble:true});pad('seal-c',2570,75,115);pad('seal-exit',2740,145,115);
 c.firebars600.push({id:'voyage-seal-flame',x:2490,y:160,length:46,period:6100,offset:.7});
 pad('fort-a',4770,225,115);pad('fort-b',4940,150,160);pad('fort-c',5190,220,140);
 c.hazards.push({id:'voyage-fort-steam',x:5020,y:300,w:70,h:65,period:4100,on:1100,offset:700});
 power('fire',180,300,'fire');power('fort',4750,300,'fire');power('last',5350,300,'wind');
 c.voyageGuards613=[{id:'voyage-guard-0',x:5020,y:150,min:4970,max:5070,speed:55,axe604:true},{id:'voyage-guard-1',x:5260,y:220,min:5210,max:5310,speed:65,axe604:true}];
 c.islands609=[{id:'voyage-seals',index:0,kind:'sequence',x:2570,y:75,pads:[{x:2265,y:225},{x:2445,y:150},{x:2625,y:75}]},{id:'voyage-fort',index:1,kind:'timed',x:4827,y:225,guards:c.voyageGuards613.map(e=>e.id)},{id:'voyage-rings',index:2,kind:'rings',x:6430,y:0}];
 c.rings613=[{x:6000,y:90},{x:6450,y:-45},{x:6710,y:-125},{x:7100,y:100}];
 for(const [i,[x,y]]of [[2795,119],[5260,190],[7640,270]].entries())c.stars601.push({id:'voyage-star-'+i,x,y,slot604:i,kind:'voyage',trial:c.islands609[i].id});
 c.modules603=c.sections.map((s,i)=>({kind:['seal-reef','timed-fort','storm-rings'][i],left:s.x,right:c.sections[i+1]?.x??c.length}));return c;
}
const live=p=>p.alive&&!p.departed&&!p.waiting&&!p.paused&&!p.respawnAt&&p.finishTime==null;
const on=(p,q)=>p.grounded&&Math.abs(p.x-q.x)<30&&Math.abs(p.y-q.y)<5;
function open(g,h,emit){if(g.ship609.completed.includes(h.index))return;g.ship609.completed.push(h.index);g.coop601[h.id]={open:true,at:g.elapsed};emit(g,'voyage-objective',{leg:h.index,x:h.x,y:h.y});}
export function voyageStep609(g,c,emit,hurt){
 if(!c.ship609)return;const s=g.ship609??={completed:[]},players=g.players.filter(live);s.seals613??={};s.rings613??={};
 s.departures616??={};
 for(const r of SHIP_ROUTES611){if(depart616(g,r.id)!=null)continue;const b=vessel611(r,g.elapsed,g),rider=players.find(p=>aboard609(p,b));if(rider){s.departures616[r.id]={at:g.elapsed,seat:rider.seat};emit(g,'voyage-depart',{seat:rider.seat,ship:r.id,x:b.x,y:b.y});}}
 const seals=c.islands609[0];
 for(const p of players){
  let q=s.seals613[p.seat]??={next:0,until:0,epoch:p.motionEpoch600};
  if(q.epoch!==p.motionEpoch600||g.elapsed>q.until){q.next=0;q.epoch=p.motionEpoch600;}
  if(on(p,seals.pads[q.next]??{})){if(q.next===0)q.until=g.elapsed+8000;q.next++;if(q.next===3)open(g,seals,emit);}
  let ring=s.rings613[p.seat]??={next:0,epoch:p.motionEpoch600};if(ring.epoch!==p.motionEpoch600){ring.next=0;ring.epoch=p.motionEpoch600;}
  const target=c.rings613[ring.next];if(target&&Math.hypot(p.x-target.x,p.y-14-target.y)<27){ring.next++;emit(g,'ring',{seat:p.seat,x:target.x,y:target.y});if(ring.next===4)open(g,c.islands609[2],emit);}
 }
 const fort=c.islands609[1],f=s.fort613??={started:null,blocked:false},held=players.some(p=>on(p,fort));
 if(!held)f.blocked=false;
 if(!s.completed.includes(1)){
  if(f.started==null&&held&&!f.blocked){f.started=g.elapsed;g.enemies=g.enemies.filter(e=>!fort.guards.includes(e.id));g.enemies.push(...c.voyageGuards613.map(e=>({...e,downUntil:0})));emit(g,'voyage-fort',{x:fort.x,y:fort.y});}
  if(f.started!=null){if(g.elapsed-f.started<=12000&&fort.guards.every(id=>g.enemies.find(e=>e.id===id)?.defeated))open(g,fort,emit);else if(g.elapsed-f.started>12000){g.enemies=g.enemies.filter(e=>!fort.guards.includes(e.id));f.started=null;f.blocked=true;emit(g,'voyage-expired',{x:fort.x,y:fort.y});}}
 }
 voyageEvents616(g,emit,hurt);
 for(const p of g.players){if(!p.alive||p.departed||p.finishTime!=null||p.waiting||p.paused)continue;
  const r=SHIP_ROUTES611.find(r=>p.x<r.end+r.w-35);if(!r||depart616(g,r.id)==null)continue;const boat=vessel611(r,g.elapsed,g);
  if(boat.x>r.start+700&&p.x<boat.x-700){const missed=p.respawnAt>0;p.deaths+=(missed?0:1);p.fatalDeaths601=p.deaths;Object.assign(p,{alive:false,respawnAt:0,lives:0,outAt:g.elapsed,axis:0,vx:0,vy:0,voyageOut613:true});emit(g,'voyage-stranded',{seat:p.seat,x:p.x,y:p.y});}
 }
}
