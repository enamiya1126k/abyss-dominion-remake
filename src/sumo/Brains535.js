// Persistent, seat-neutral tactics: no knowledge of which opponent is human.
const profiles=[
 {name:'forager',loot:1.45,items:1.1,attack:.7,windup:.88,risk:.03},
 {name:'collector',loot:1.1,items:1.7,attack:.85,windup:.94,risk:.05},
 {name:'duelist',loot:.95,items:1.15,attack:1.2,windup:.78,risk:.08},
 {name:'raider',loot:.85,items:.9,attack:1.4,windup:.64,risk:.22}
];
const length=(x,y)=>Math.hypot(x,y);
const direction=(x,y)=>{const n=length(x,y);return n>.02?{x:x/n,y:y/n}:{x:0,y:0}};
function roll(g,p,salt=0){let x=(g.seed^(p.seat+1)*2654435761^Math.floor(g.elapsed/400)*1597334677^salt)|0;x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}
export function think535(g,p,ops){
 if(!p.alive)return{};
 const style=profiles[p.aiStyle535??p.seat%4],level=ops.level(p),warning=ops.next(g.elapsed)-g.elapsed<ops.warning;
 const safeRadius=(warning?ops.radius(ops.next(g.elapsed)):g.radius)-ops.body(p)-.22;
 const distance=length(p.x,p.y),enemies=g.players.filter(v=>v.alive&&v.playerId!==p.playerId);
 let brain=p.brain535;
 if(!brain||g.elapsed>=brain.until){
  const noise=roll(g,p),threats=enemies.filter(e=>{
   const dx=p.x-e.x,dy=p.y-e.y,d=length(dx,dy);
   return d<5.4&&d>.01&&(e.attackUntil>g.elapsed||e.charging&&ops.ratio(e)>.55)&&(e.fx*dx+e.fy*dy)/d>.74;
  });
  let goal;
  if(distance>safeRadius){
   // Each fighter takes a different route onto the safe floor, not to the centre.
   const angle=Math.atan2(p.y,p.x)+(noise-.5)*.45,r=Math.max(.65,safeRadius-.9);
   goal={type:'retreat',tx:Math.cos(angle)*r,ty:Math.sin(angle)*r};
  }else if(threats.length&&!p.charging&&noise>style.risk){
   const e=threats.sort((a,b)=>length(a.x-p.x,a.y-p.y)-length(b.x-p.x,b.y-p.y))[0],perp={x:-e.fy,y:e.fx};
   const sign=p.x*perp.x+p.y*perp.y>0?-1:1;
   goal={type:'evade',tx:p.x+perp.x*sign*2,ty:p.y+perp.y*sign*2};
  }else{
   const choices=[];
   for(const v of g.pickups??[]){
    if(length(v.x,v.y)>safeRadius||v.type==='brace'&&p.anchor535)continue;
    const value=v.type==='brace'?9:p.magnetUntil>g.elapsed?1:7;
    choices.push({type:'item',tx:v.x,ty:v.y,score:style.items*value/(length(v.x-p.x,v.y-p.y)+1)});
   }
   for(const v of g.crystals){
    if(length(v.x,v.y)>safeRadius)continue;
    const crowded=enemies.reduce((n,e)=>n+(length(e.x-v.x,e.y-v.y)<2?1:0),0),distance=length(v.x-p.x,v.y-p.y);
    const value=(p.power>=48?.18:1)*(2+v.value*.6)*style.loot;
    choices.push({type:'gather',tx:v.x,ty:v.y,score:value/(distance+.7+crowded*.9)});
   }
   for(const e of enemies){
    const d=length(e.x-p.x,e.y-p.y);
    if(g.elapsed<18000||d>7||g.elapsed<p.coolUntil||g.elapsed<(p.aiRest535??0))continue;
    const edge=length(e.x,e.y)/g.radius,gap=level-ops.level(e);
    let score=style.attack*(3+edge*2+Math.max(-1.5,gap*.15))/(d+1.3);
    if(e.anchor535)score*=.65;
    if(e.charging&&ops.ratio(e)>.8&&gap<0)score*=.65;
    if(p.power>=40)score*=1.65;if(g.elapsed<45000)score*=.6;
    if(e.playerId===brain?.target)score*=1.15;
    choices.push({type:'hunt',target:e.playerId,tx:e.x,ty:e.y,score});
   }
   choices.sort((a,b)=>b.score-a.score);
   goal=choices[0];
   if(!goal){const a=p.seat*Math.PI/2+g.elapsed/14000,r=Math.max(.6,safeRadius*.6);goal={type:'roam',tx:Math.cos(a)*r,ty:Math.sin(a)*r}}
  }
  brain=p.brain535={...goal,until:g.elapsed+260+noise*220,reckless:noise<style.risk,windup:Math.min(.99,style.windup+noise*.16)};
 }
 let target=enemies.find(e=>e.playerId===brain.target),tx=brain.tx,ty=brain.ty;
 if(p.charging&&target){tx=target.x+target.vx*.13;ty=target.y+target.vy*.13}
 else if(brain.type==='hunt'&&target){
  const d=length(target.x-p.x,target.y-p.y);
  if(d>3.1){const n=direction(target.x,target.y);tx=target.x-n.x*1.8;ty=target.y-n.y*1.8}
  else{tx=target.x+target.vx*.12;ty=target.y+target.vy*.12}
 }
 const v=direction(tx-p.x,ty-p.y),dot=p.x*v.x+p.y*v.y,edge=Math.max(.6,safeRadius+.12);
 const room=-dot+Math.sqrt(Math.max(0,dot*dot+edge*edge-p.x*p.x-p.y*p.y));
 const targetDistance=target?length(target.x-p.x,target.y-p.y):Infinity;
 const hunt=brain.type==='hunt'&&targetDistance<4.7;
 const unsafe=distance>safeRadius+.25&&dot>0;
 // The raider accepts shorter stopping margins. Prediction error can cause a real overshoot.
 const margin=brain.reckless?-.8:.25,limit=Math.max(1.4,room-margin);
 const release=p.charging&&(ops.ratio(p)>=brain.windup||ops.dash(p)>=limit||!hunt),cancel=p.charging&&unsafe&&!brain.reckless;
 if(release&&!cancel)p.aiRest535=g.elapsed+[3500,3000,2200,1700][p.aiStyle535??p.seat%4]+roll(g,p,941)*1200;
 return{x:v.x,y:v.y,press:hunt&&!p.charging&&room>1.6,release,cancel};
}
