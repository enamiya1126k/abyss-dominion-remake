// Large optional underground expeditions and a genuine wall-kick ascent.
const clone=s=>Array.isArray(s)?s.map(clone):s&&typeof s==='object'?Object.fromEntries(Object.entries(s).map(([k,v])=>[k,clone(v)])):s;
const ledge=(c,id,x,y,w,extra={})=>c.platforms.push({id:c.id+'-602-'+id,x,y,w,h:18,...extra});
const wall=(c,id,x,y,w,h)=>c.walls.push({id:c.id+'-602-'+id,x,y,w,h,climb602:true});
function cut(c,a,b){c.grounds=c.grounds.flatMap(([x,end,y=300])=>end<=a||x>=b?[[x,end,y]]:[...(x<a?[[x,a,y]]:[]),...(end>b?[[b,end,y]]:[])]);}
function clear(c,a,b){for(const key of ['platforms','walls','hazards','springs','gems','enemies','pickups','belts','winds'])c[key]=c[key].filter(s=>s.x+(s.w??32)<a||s.x>b);}
function clockShaft(c){
 const a=930,b=1090,top=-80;
 const moved=c.pickups.filter(p=>p.x>=885&&p.x<=1465);clear(c,885,1465);
 c.pickups.push(...moved.map(p=>({...p,x:1185,y:-42}))); 
 // Enter UNDER the left pier, then alternate walls in the 120-unit shaft.
 wall(c,'shaft-west',a,top,40,300);wall(c,'shaft-east',b,top,40,380);
 ledge(c,'descent-a',1150,-15,80);ledge(c,'descent-b',1250,75,80);ledge(c,'descent-c',1360,175,85);
 c.checkpoints=c.checkpoints.filter(p=>p.x<885||p.x>1465);c.checkpoints.push({x:875,y:300},{x:1110,y:top});
 c.climbs602.push({id:'clock-shaft',left:a+40,right:b,bottom:300,top,entry:{x:900,y:300},exit:{x:1110,y:top},mandatory:true});
 c.sections=c.sections.map((s,i)=>i===1?{...s,name:'双塔の壁キック',sub:''}:s);
}
function detour(c){
 const old=c.secrets600[0],id=old.id,e=old.entrance,crystal=c.id==='crystal';
 // Remove the old tiny room and its obvious breadcrumb trail.
 for(const k of ['platforms','springs','gems','enemies','pickups'])c[k]=c[k].filter(s=>!s.id?.startsWith(id));
 c.hints601=c.hints601.filter(h=>h.kind!=='secret');
 const room={id,left:e-110,right:e+1885,entrance:e,floor:crystal?840:790,exit:e+1810,large602:true,theme:crystal?'crystal':'relay',pathLength:crystal?2570:2390};
 c.secrets600=[room];
 if(!crystal)c.switchAccess602.push({id:'relay-long-bridge1',x:e+1582,y:750,label:'Ⅳ',secret602:true});
 // An unlit, chipped masonry lip is the only clue visible from the main road.
 c.hints601.push({kind:'secret',x:e-84,y:319,subtle602:true});
 const platforms=crystal?[
  [-85,620,255],[150,705,280],[495,755,180],[680,678,90],[790,601,90],[900,535,165],
  [1100,740,195],[1355,815,215],[1530,745,340]
 ]:[[-85,610,250],[135,700,380],[655,790,345],[1135,790,340],[1520,750,350]];
 platforms.forEach(([x,y,w],i)=>ledge(c,'cave-floor'+i,e+x,y,w,{secret602:true}));
 if(crystal){
  ledge(c,'cave-low-west',e+775,835,125,{secret602:true});ledge(c,'cave-low-east',e+960,805,110,{secret602:true});
  ledge(c,'cave-ferry',e+1280,680,82,{move:{axis:'y',range:35,period:4200},secret602:true});
  c.pickups.push({id:id+'-ice602',kind:'ice',x:e+545,y:723,secret:true});
 }else{
  ledge(c,'cave-crumble',e+535,733,90,{crumble:true,secret602:true});
  ledge(c,'cave-ferry',e+1020,735,85,{move:{axis:'x',range:24,period:3800},secret602:true});
  for(const [i,x,y] of [[0,1360,714],[1,1440,645]])ledge(c,'cave-return'+i,e+x,y,82,{secret602:true});
 }
 for(const [i,x,y,w] of [[0,230,crystal?705:700,170],[1,crystal?1130:1190,crystal?740:790,100]]){
  c.enemies.push({id:id+'-guard602-'+i,x:e+x,min:e+x-30,max:e+x+w,y,speed:48+i*8,advance:true});
 }
 // A different exit joins the surface road; its one-way cap is safe to cross above.
 const exit=e+1810;cut(c,e+1676,e+1860);ledge(c,'cave-exit-cap',e+1676,300,184);
 wall(c,'cave-west',e+1630,345,36,300);wall(c,'cave-east',e+1794,300,36,450);
 c.climbs602.push({id:c.id+'-cave-shaft',left:e+1666,right:e+1794,bottom:750,top:300,entry:{x:e+1690,y:750},exit:{x:exit,y:300},mandatory:false});
 if(crystal)c.springs.push({id:id+'-escape602',x:e+1708,y:745,power:1040});
 // The star is well inside the branch, not waiting directly under the entrance.
 const s=c.stars601.find(s=>s.kind==='secret');Object.assign(s,{x:e+(crystal?982:1310),y:crystal?500:756});
 for(const [i,x,y] of [[0,365,crystal?670:665],[1,crystal?943:850,crystal?504:755],[2,1505,crystal?780:612]])c.gems.push({id:id+'-reward602-'+i,x:e+x,y});
 c.features=[crystal?'水晶の立体地下迷宮':'長い地下遺跡の寄り道','協力スター３つ'];
 c.description=(crystal?'地上から続く深い水晶洞へ。上下に分かれた回廊を探り、奥のスターを持って別の出口へ。':'橋をつないで遺跡を横断。見逃しそうな裂け目の奥には、崩落橋と石柱を越える長い地下遺跡。')+' 旗は全員共通。２人の封印台と仲間ジャンプでスター３個を集めよう。';
 c.duration=Math.max(c.duration,420000);
}
export function expedition602(source){
 const c=clone(source);c.climbs602=[];c.switchAccess602=[];
 if(c.id==='clock')clockShaft(c);
 if(c.id==='relay'||c.id==='crystal')detour(c);
 c.grounds.sort((a,b)=>a[0]-b[0]);c.checkpoints.sort((a,b)=>a.x-b.x);
 return c;
}
