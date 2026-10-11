import {voyageThreats613} from './VoyageThreats613.js';
const arrival=r=>r.depart+(r.end-r.start)/r.speed*1000;
const first={id:'ark609',start:280,end:1860,y:300,w:240,speed:84,depart:7000};
const second={id:'ark-works611',start:2860,end:4360,y:300,w:240,speed:92,depart:arrival(first)+16000};
const third={id:'ark-coast611',start:5440,end:7260,y:300,w:240,speed:98,depart:arrival(second)+20000};
export const SHIP_ROUTES611=Object.freeze([first,second,third].map(r=>Object.freeze({...r,arrival:arrival(r)})));
export function vessel611(r,t){const age=Math.max(0,t-r.depart),x=Math.min(r.end,r.start+age*r.speed/1000),moving=t>=r.depart&&t<r.arrival;return {id:r.id,x,y:r.y,w:r.w,h:24,oneWay:true,move:{axis:'x'},ship609:true,speed:moving?r.speed:0,phase:t<r.depart?'boarding':moving?'cruise':'arrived',remaining:Math.max(0,r.depart-t)};}
export const voyageShips610=(t,g)=>SHIP_ROUTES611.map(r=>vessel611(r,t));
export const shipAt609=(t,g)=>vessel611(SHIP_ROUTES611[0],t);
export const aboard609=(p,b)=>p.grounded&&p.platformId===b.id&&p.x>=b.x-10&&p.x<=b.x+b.w+10;
export const voyageReady609=()=>true;
export const voyageCheckpoint611=(p,cp)=>p.grounded&&!p.platformId?.startsWith('ark')&&p.x>=cp.x-20&&p.x<=cp.x+100&&Math.abs(p.y-cp.y)<6;
export function voyageCourse609(){
 const c={id:'voyage',name:'魔界渡りの暴走船',en:'THE RUNAWAY ARK',theme:'coast',expert603:true,ship609:true,color:'#70d7d2',icon:'wave',level:'上級・片道航海',tag:'船上回避・出航に間に合え',mode:'coop',height:400,ground:300,length:8000,goal:7820,duration:160000,description:'船必須の3海峡。船は片道・再便なし！船上の砲撃を避け、島の宝星に寄り道して次の出航へ。置いていかれた人は脱落。全員脱落なら再挑戦。',features:['片道航海・再便なし','出航前の宝星チャレンジ']};
 for(const k of ['grounds','platforms','walls','bridges','switches','switchAccess602','belts','winds','hazards','springs','gems','enemies','pickups','checkpoints','firebars600','swarms600','tides600','rollers600','secrets600','crushers','stars601','trials601','hints601','climbs602','saws603','pendulums603','lightning603','cannons603','meteors603','jets603','modules603'])c[k]=[];
 const pad=(id,x,y,w=105,extra={})=>c.platforms.push({id:'voyage-'+id,x,y,w,h:18,...extra});
 const power=(id,x,y,kind)=>c.pickups.push({id:'voyage-power-'+id,x,y:y-27,kind});
 c.sections=[{x:0,name:'砲撃海峡と三連封印',sub:'7秒で出航！ 島では順番に3つの封印を踏め'},{x:2860,name:'挟撃海峡と番兵の砦',sub:'上下の弾を避け、島では12秒の番兵戦'},{x:5440,name:'嵐の片道航路',sub:'戻る船はない。4つの空中輪で最後の宝星！'}];
 c.grounds=[[0,280,300],[2100,2860,300],[4600,5440,300],[7500,8000,300]];
 c.checkpoints=[{x:90,y:300},{x:2170,y:300},{x:4670,y:300},{x:7570,y:300}];
 pad('seal-a',2210,225,110);pad('seal-b',2390,150,110,{crumble:true});pad('seal-c',2570,75,115);pad('seal-exit',2740,145,115);
 c.firebars600.push({id:'voyage-seal-flame',x:2490,y:160,length:46,period:6100,offset:.7});
 pad('fort-a',4770,225,115);pad('fort-b',4940,150,160);pad('fort-c',5190,220,140);
 c.hazards.push({id:'voyage-fort-steam',x:5020,y:300,w:70,h:65,period:4100,on:1100,offset:700});
 power('fire',180,300,'fire');power('fort',4750,300,'fire');power('last',5350,300,'wind');
 c.voyageGuards613=[{id:'voyage-guard-0',x:5020,y:150,min:4970,max:5070,speed:55,axe604:true},{id:'voyage-guard-1',x:5260,y:220,min:5210,max:5310,speed:65,axe604:true}];
 c.islands609=[{id:'voyage-seals',index:0,kind:'sequence',x:2570,y:75,pads:[{x:2265,y:225},{x:2445,y:150},{x:2625,y:75}]},{id:'voyage-fort',index:1,kind:'timed',x:4827,y:225,guards:c.voyageGuards613.map(e=>e.id)},{id:'voyage-rings',index:2,kind:'rings',x:6730,y:215}];
 c.rings613=[.18,.39,.61,.82].map((f,i)=>({x:third.start+(third.end-third.start)*f+120,y:i%2?195:220}));
 for(const [i,[x,y]]of [[2795,119],[5260,190],[7640,270]].entries())c.stars601.push({id:'voyage-star-'+i,x,y,slot604:i,kind:'voyage',trial:c.islands609[i].id});
 c.modules603=c.sections.map((s,i)=>({kind:['seal-reef','timed-fort','storm-rings'][i],left:s.x,right:c.sections[i+1]?.x??c.length}));return c;
}
const live=p=>p.alive&&!p.departed&&!p.waiting&&!p.paused&&!p.respawnAt&&p.finishTime==null;
const on=(p,q)=>p.grounded&&Math.abs(p.x-q.x)<30&&Math.abs(p.y-q.y)<5;
function open(g,h,emit){if(g.ship609.completed.includes(h.index))return;g.ship609.completed.push(h.index);g.coop601[h.id]={open:true,at:g.elapsed};emit(g,'voyage-objective',{leg:h.index,x:h.x,y:h.y});}
export function voyageStep609(g,c,emit){
 if(!c.ship609)return;const s=g.ship609??={completed:[]},players=g.players.filter(live);s.seals613??={};s.rings613??={};
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
 voyageThreats613(g,SHIP_ROUTES611,vessel611,emit);
 for(const p of g.players){if(!p.alive||p.departed||p.finishTime!=null||p.waiting||p.paused)continue;
  const r=SHIP_ROUTES611.find(r=>p.x<r.end+r.w-35);if(!r||g.elapsed<r.depart)continue;const boat=vessel611(r,g.elapsed);
  if(boat.x>r.start+700&&p.x<boat.x-700){const missed=p.respawnAt>0;p.deaths+=(missed?0:1);p.fatalDeaths601=p.deaths;Object.assign(p,{alive:false,respawnAt:0,lives:0,outAt:g.elapsed,axis:0,vx:0,vy:0,voyageOut613:true});emit(g,'voyage-stranded',{seat:p.seat,x:p.x,y:p.y});}
 }
}
