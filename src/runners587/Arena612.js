// Keep the gate in place, but make it an exit trigger inside a safe arena.
export function arena612(c){
 if(!c.boss600)return c;
 const left=c.boss600.left-350,length=c.length+820,right=length-90;
 const layouts={charge:[[150,220],[330,135],[620,220],[840,125]],wave:[[170,220],[360,130],[650,210],[880,120]],fire:[[140,215],[330,120],[600,220],[830,130]]};
 const steps=(layouts[c.boss600.pattern]??layouts.wave).map(([dx,y],i)=>({id:c.id+'-arena612-'+i,x:c.goal-420+dx,y,w:i%2?115:145,h:18}));
 return {...c,length,arena612:{left,right,floor:300},boss600:{...c.boss600,left,right,arena612:true},
  grounds:[...c.grounds.filter(([x])=>x<left).map(([x,end,y])=>[x,Math.min(end,left),y??300]),[left,length,300]],
  platforms:[...c.platforms,...steps],
  walls:(c.walls??[]).filter(w=>w.x+w.w<left),
  sections:c.sections.map((s,i)=>i===c.sections.length-1?{...s,sub:'広場と上段の足場を使おう。光る予兆を見て回避！'}:s)};
}
