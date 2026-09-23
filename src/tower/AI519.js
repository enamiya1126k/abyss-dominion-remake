// Decisions use only the visible board, falling piece and actor positions/velocity.
// Search state is kept outside game snapshots and cannot alter live physics.
const brains=new WeakMap(),boards=new WeakMap();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const alive=g=>g.players.filter(p=>p.role==='run'&&p.alive&&!p.escaped);
function boardInfo(g,A){let memo=boards.get(g);if(memo?.revision===g.boardRevision&&memo.count===g.board.length)return memo;const ledges=[];
 for(let x=.5;x<10;x++) {if(!A.solid(g,x,0,false))ledges.push({x,y:0});for(const b of g.board)if(b.x===Math.floor(x)&&!A.solid(g,x,b.y+1,false))ledges.push({x,y:b.y+1});}
 memo={revision:g.boardRevision,count:g.board.length,ledges};boards.set(g,memo);return memo;
}
function copyGame(g){return{...g,players:g.players.map(p=>({...p})),board:[...g.board],falling:g.falling?{...g.falling,cells:g.falling.cells}:null,events:[],results:null,phase:'play'}}
function axisTo(x,target){const gap=target-x;return Math.abs(gap)<.07?0:clamp(gap*5,-1,1)}
function control(g,p,plan,A){const target=plan.head?g.players.find(o=>o.playerId===plan.head&&o.alive):null,tx=target?target.x:plan.x,ty=target?target.y+A.C.ph:plan.y;
 const axis=axisTo(p.x,tx),wall=axis&&A.solid(g,p.x+Math.sign(axis)*.32,p.y,false),onHead=!!p.support;
 const waitForHead=target&&p.grounded&&target.vy>0&&target.y<p.y+.7;return{axis,jump:!waitForHead&&(p.grounded||p.coyote>=g.elapsed)&&(plan.jump||ty>p.y+.15||wall||onHead),superJump:!!plan.super&&g.elapsed>=(p.superReady??0)&&(p.grounded||p.coyote>=g.elapsed)};
}
function projectedRisk(g,p,A){const f=g.falling;if(!f)return 0;let risk=0;for(const[dx,dy]of f.cells){const bottom=f.y+dy,eta=(bottom-p.y-A.C.ph)/A.fallSpeed(g.elapsed);if(f.land+dy<p.y+A.C.ph&&Math.abs(f.x+dx+.5-p.x)<.82&&eta>=0&&eta<1.5)risk=Math.max(risk,(1.5-eta)*10)}return risk}
function trial(g,p,plan,A){const sim=copyGame(g),q=sim.players.find(v=>v.playerId===p.playerId),dt=1/60;let peak=p.y,landed=p.grounded?p.y:Math.max(0,p.y-1),risk=0;
 for(let i=0;i<(plan.super?96:66);i++){sim.elapsed+=dt*1000;sim.lastAt+=dt*1000;for(const o of sim.players)if(o!==q&&o.role==='run'&&o.alive){A.move(sim,o,{axis:clamp(o.vx/A.C.speed,-1,1)},dt)}A.move(sim,q,control(sim,q,plan,A),dt);A.fall(sim,dt);if(!q.alive)return{score:-10000+i,x:q.x,y:q.y};if(q.escaped||sim.winner==='run')return{score:10000-i,x:q.x,y:q.y};peak=Math.max(peak,q.y);if(q.grounded)landed=Math.max(landed,q.y);risk=Math.max(risk,projectedRisk(sim,q,A));}
 const future=boardInfo(g,A).ledges.filter(t=>t.y>landed+.1&&t.y<=landed+2.15&&Math.abs(t.x-q.x)<3.3);const next=Math.max(landed,...future.map(t=>t.y));
 const score=landed*13+q.y*3+peak*.7+next*2-risk-Math.abs(q.x-plan.x)*.5-(plan.super?9:0)-(plan.jump&&landed<=p.y+.1?.9:0);
 return{score,x:q.x,y:q.y};
}
export function botRunner519(g,p,A){if(!p.alive||p.escaped)return{axis:0};let group=brains.get(g);if(!group){group=new Map();brains.set(g,group)}let memory=group.get(p.playerId);const mates=alive(g).filter(o=>o!==p&&Math.abs(o.x-p.x)<1.15&&Math.abs(o.y-p.y)<1.3);const needsLift=boardInfo(g,A).ledges.some(t=>t.y>p.y+2.17&&t.y<p.y+4.5&&Math.abs(t.x-p.x)<3.3);if(p.grounded&&g.elapsed<(p.superReady??0)&&needsLift&&mates.some(o=>o.seat>p.seat)&&g.elapsed%1700<150&&!projectedRisk(g,p,A))return{axis:0,jump:true};const falling=g.falling?.id??0;
 if(!memory||g.elapsed>=memory.until||memory.board!==g.boardRevision||memory.falling!==falling){
  const ledges=boardInfo(g,A).ledges,options=[{x:p.x,y:p.y,jump:false,dash:false}];
  const nearby=ledges.filter(t=>Math.abs(t.x-p.x)<=4.2&&t.y<=p.y+2.17&&t.y>=p.y-3).sort((a,b)=>(b.y*4-Math.abs(b.x-p.x))-(a.y*4-Math.abs(a.x-p.x))).slice(0,7);
  for(const t of nearby)options.push({...t,jump:t.y>p.y+.12,dash:false});
  // Ordinary lateral evasion and two-block jumps; no hidden dash remains.
  for(const d of[-1,1]){const x=clamp(p.x+d*2.1,.31,9.69);options.push({x,y:p.y,jump:false});if(g.falling)options.push({x,y:p.y,jump:true});}
  if(g.falling){const f=g.falling,left=f.x-.70,right=f.x+Math.max(...f.cells.map(c=>c[0]))+1.70;for(const x of [left,right])if(x>=.3&&x<=9.7)for(const jump of [false,true])options.push({x,y:p.y,jump,dash:false});}
  for(const o of alive(g))if(o!==p&&(o.y>p.y+.4||o.seat<p.seat)&&Math.abs(o.x-p.x)<2.7&&o.y+A.C.ph<=p.y+2.1&&o.y+A.C.ph>p.y+.2)options.push({x:o.x,y:o.y+A.C.ph,head:o.playerId,jump:true,dash:false});
  if(g.elapsed>=(p.superReady??0)){
   const high=ledges.filter(t=>t.y>p.y+2.17&&t.y<=p.y+(A.C.superJump**2/(2*A.C.gravity))&&Math.abs(t.x-p.x)<4.4).sort((a,b)=>(b.y*3-Math.abs(b.x-p.x))-(a.y*3-Math.abs(a.x-p.x))).slice(0,5);
   for(const t of high)options.push({...t,super:true,jump:false});
   if(p.y>=A.C.height-(A.C.superJump**2/(2*A.C.gravity))+.02)options.push({x:p.x,y:A.C.height,super:true,jump:false});
  }
  if(p.y>=A.C.height-2.2||p.support)options.push({x:p.x,y:A.C.height,jump:true,dash:false});
  let best=null;for(const plan of options){const score=trial(g,p,plan,A).score+(memory&&Math.abs(memory.plan.x-plan.x)<.2?.35:0);if(!best||score>best.score)best={score,plan};}
  memory={plan:best.plan,until:g.elapsed+(g.falling?200:300),board:g.boardRevision,falling};group.set(p.playerId,memory);
 }
 return control(g,p,memory.plan,A);
}
function covering(cells,x,px){return cells.some(([dx])=>Math.abs(x+dx+.5-px)<.8)}
export function chooseDrop519(g,A){const runners=alive(g);if(!runners.length)return null;const all=[];const ledges=boardInfo(g,A).ledges;
 for(let slot=0;slot<4;slot++){const seen=new Set();for(let rotation=0;rotation<4;rotation++){const cells=A.shape(g.hand[slot],rotation),key=cells.map(String).sort().join(';');if(seen.has(key))continue;seen.add(key);const width=1+Math.max(...cells.map(c=>c[0]));for(let x=0;x<=10-width;x++){
  const land=A.landing(g,cells,x);if(!A.fits(g,cells,x))continue;const placed=cells.map(([dx,dy])=>({x:x+dx,y:land+dy,type:g.hand[slot]}));let score=-land*.08,threat=0,gift=0;
  for(const p of runners){const weight=1+p.y/8,eta=Math.max(0,(A.C.height+2-p.y-A.C.ph)/A.fallSpeed(g.elapsed)),projected=clamp(p.x+p.vx*Math.min(.65,eta),.3,9.7),hits=covering(cells,x,p.x),ahead=covering(cells,x,projected);let escapes=0,covered=0;
   for(let px=Math.max(.5,p.x-2);px<=Math.min(9.5,p.x+2);px+=.5)if(!A.solid(g,px,p.y,false)){escapes++;if(covering(cells,x,px))covered++;}
   const fraction=covered/Math.max(1,escapes),under=placed.some(b=>b.y<p.y+A.C.ph&&Math.abs(b.x+.5-projected)<.8);
   threat+=(ahead?4:0)*weight+(hits?2:0)*weight+fraction*8*weight+(under?14*fraction*weight:0);
   const rises=placed.filter(b=>b.y+1>p.y+.05&&b.y+1<=p.y+2.2&&Math.abs(b.x+.5-p.x)<3.3);
   if(rises.length)gift+=Math.max(...rises.map(b=>b.y+1-p.y))*weight*3;
   if(placed.some(b=>b.y+1>=A.C.height&&p.y>=A.C.height-2.2&&Math.abs(b.x+.5-p.x)<3.4))gift+=150;
  }
  const candidate={...g,board:[...g.board,...placed],boardRevision:g.boardRevision+1,falling:null};const sealed=A.impossible(candidate)==='sealed';
  // Prefer denying an exit/covering a pocket over constructing the enemy a staircase.
  score+=threat-gift+(sealed?180:0);const span=new Set(cells.map(c=>c[0])).size;score+=span*.35;
  all.push({slot,rotation,x,score,land,sealed});
 }}}
 all.sort((a,b)=>b.score-a.score||a.slot-b.slot||a.rotation-b.rotation||a.x-b.x);return all[0]??null;
}
export function botDrop519(g,A){if(g.falling||g.elapsed<g.nextDropAt)return;let group=brains.get(g);if(!group){group=new Map();brains.set(g,group)}let plan=group.get('drop');
 if(!plan||plan.board!==g.boardRevision||plan.serial!==g.dropSerial){const choice=chooseDrop519(g,A);if(!choice)return;plan={...choice,board:g.boardRevision,serial:g.dropSerial,releaseAt:g.elapsed+260};group.set('drop',plan);A.aim(g,plan.slot,plan.rotation,plan.x);}
 if(g.elapsed>=plan.releaseAt){const choice=chooseDrop519(g,A);if(choice)A.aim(g,choice.slot,choice.rotation,choice.x);A.drop(g);group.delete('drop')}
}
