const themes={
 forest:{tag:'群れを突破する森',features:['押し寄せる虫の大群','森の番兵'],description:'森の奥で虫の群れが３波に分かれて襲来。踏みつけをつなぎ、最後はゴブリンの番兵を倒して門を開こう。'},
 sky:{tag:'登って下る天空の山',features:['高低差440の山道','追い風と向かい風'],description:'雲より高い頂上へ登り、反対側へ下山。足場の高さと風向きを読んで、風の紋章をどこで使うか選ぼう。'},
 relay:{tag:'秘密を探す守護遺跡',features:['落下先の隠し部屋','石の守護者'],description:'橋を開きながら遺跡を横断。深い裂け目には小さな宝物部屋も。最後は石の守護者の衝撃波を跳び越えよう。'},
 clock:{tag:'回転する炎の時計塔',features:['ゆっくり回る火の棒','崩落足場で塔登り'],description:'針のように回る火の棒をかわして塔を登る。崩れた足場もすぐには消えない。落下中の一跳びで立て直そう。'},
 coast:{tag:'潮が満ちる海賊の道',features:['満ち引きする潮','上下する避難足場'],description:'低い道を走るか、潮が上がる前に足場へ逃げるか。波の高さを見ながら島々を渡ろう。'},
 frost:{tag:'氷塊が転がる峠道',features:['転がる巨大氷塊','凍った敵を蹴って突破'],description:'斜面の先から大きな氷塊が転がってくる。跳び越す・撃ち砕く・足場でやり過ごす。凍った敵も武器にしよう。'},
 crystal:{tag:'地下に続く水晶迷宮',features:['落ちた先の隠し洞窟','上下２つの探索ルート'],description:'宝石の並ぶ裂け目の下に隠し洞窟。地上の道と地下の宝物を選び、大バネで元の道へ帰ろう。'},
 ember:{tag:'魔王が待つ最後の城',features:['連続回転火柱','魔王の突進と火炎弾'],description:'回る火の棒を抜けると魔王が待つ。突進の予告を見てかわし、踏みつけと紋章で撃破。倒すまで門は開かない。'}
};
const pad=(id,x,y,w=100,extra={})=>({id,x,y,w,h:18,...extra});
function cutGround(c,a,b){c.grounds=c.grounds.flatMap(([x,end,y=300])=>end<=a||x>=b?[[x,end,y]]:[...(x<a?[[x,a,y]]:[]),...(end>b?[[b,end,y]]:[])]);}
function clear(c,a,b){
 c.enemies=c.enemies.filter(e=>e.flying?e.x+65<a||e.x-65>b:(e.max??e.x)<a||(e.min??e.x)>b);
 for(const field of ['platforms','walls','hazards','belts','winds','springs','crushers','gems','enemies'])c[field]=c[field].filter(s=>s.x+(s.w??40)<a||s.x>b);
}
function mountain(c,a,tower=false){
 const levels=tower?[300,240,180,120,60,0,-60,-120,-180,-120,-60,0,60,120,180,240]:[300,245,190,135,80,25,-30,-85,-140,-85,-30,25,80,135,190,245];
 const b=a+levels.length*100;clear(c,a-25,b+25);cutGround(c,a,b);
 for(let i=0;i<levels.length;i++){
  const x=a+i*100,y=levels[i];
  if(!tower)c.grounds.push([x,x+100,y]);
  else c.platforms.push(pad(c.id+'-tower600-'+i,x,y,90,{crumble:i%4===2}));
  if(i===8)c.checkpoints.push({x:x+45,y});
  if((i===4||i===11)&&tower)c.firebars600.push({id:'clock-needle600-'+i,x:x+45,y:y-47,length:82,period:10000,offset:i*.4});
 }
 // Keep checkpoints and collectibles on the authored walkable route.
 c.checkpoints=c.checkpoints.map(cp=>cp.x>=a&&cp.x<b?{...cp,y:levels[Math.floor((cp.x-a)/100)],x:a+Math.floor((cp.x-a)/100)*100+45}:cp);
 if(!tower)c.winds.push({x:a+300,y:-240,w:450,h:540,speed:-22},{x:a+900,y:-240,w:450,h:540,speed:32});
 c.route600={kind:tower?'tower':'mountain',left:a,right:b,levels};
}
function secret(c,a,b){
 const id=c.id+'-secret600',floor=550,left=a-32,right=b+32;
 c.secrets600.push({id,left,right,floor,entrance:(a+b)/2});
 c.platforms.push(pad(id+'-floor',left,floor,right-left),pad(id+'-shelf',left+8,floor-65,65));
 c.enemies.push({id:id+'-keeper',x:left+95,min:left+80,max:right-95,y:floor,speed:42,advance:true});
 c.springs.push({id:id+'-escape',x:b-26,y:floor,power:900});
 for(let i=0;i<5;i++)c.gems.push({id:id+'-gem'+i,x:a+18+i*(b-a-70)/4,y:floor-30});
 for(let i=0;i<3;i++)c.gems.push({id:id+'-trail'+i,x:(a+b)/2,y:365+i*60});
 c.secretPickups600.push({id:id+'-wind',x:left+37,y:floor-92,kind:'wind',secret:true});
}
function boss(c,speciesId,hp,pattern){
 const left=c.goal-500,right=c.goal-60;clear(c,left-30,c.goal+100);cutGround(c,left-30,c.goal+90);c.grounds.push([left-30,c.goal+90,300]);
 c.checkpoints=c.checkpoints.filter(cp=>cp.x<left-65);c.checkpoints.push({x:left-10,y:300});
 c.boss600={id:c.id+'-boss600',speciesId,maxHp:hp,hp,pattern,left,right,x:right-70,y:300};
 c.platforms.push(pad(c.id+'-boss-step600',left+35,245,90));
}
function sparsePickups(c,old){
 const kinds=['fire','wind','ice','thunder','stone','water'],pickups=[];
 // Six forms over a whole 6,500–8,500 unit course, not several at every flag.
 for(let i=0;i<6;i++){
  const target=i===0?190:180+i*(c.goal-600)/5;
  const safe=c.grounds.filter(([a,b,y])=>b-a>=70).flatMap(([a,b,y=300])=>{
   const x=Math.max(a+32,Math.min(b-32,target));
   if(x>c.goal-100||x<100||c.crushers.some(h=>x>h.x-40&&x<h.x+h.w+40)||c.hazards.some(h=>x>h.x-45&&x<h.x+h.w+45)||c.walls.some(w=>x>w.x-48&&x<w.x+w.w+48)||c.springs.some(s=>Math.abs(s.x-x)<55))return [];
   return [{x,y:y-27}];
  }).sort((a,b)=>Math.abs(a.x-target)-Math.abs(b.x-target));
  const spot=safe.find(p=>pickups.every(q=>Math.abs(q.x-p.x)>=600));
  if(spot)pickups.push({id:c.id+'-rune600-'+i,kind:kinds[i],...spot});
 }
 // A tower has no solid floor for part of its route; use a safe ledge if needed.
 for(const kind of kinds)if(!pickups.some(p=>p.kind===kind)){
  const places=[...c.platforms.filter(s=>!s.move&&!s.crumble).map(s=>({x:s.x+s.w/2,y:s.y-27})),...old];
  const p=places.find(p=>p.x>100&&p.x<c.goal-80&&pickups.every(q=>Math.abs(p.x-q.x)>=600));
  if(p)pickups.push({id:c.id+'-rune600-'+kind,kind,x:p.x,y:p.y});
 }
 return [...pickups,...c.secretPickups600].sort((a,b)=>a.x-b.x);
}
export function signatureCourse600(source){
 const c={...source,...themes[source.id],firebars600:[],swarms600:[],tides600:[],rollers600:[],secrets600:[],secretPickups600:[],boss600:null};
 for(const k of ['grounds','platforms','walls','hazards','belts','winds','springs','crushers','gems','enemies','checkpoints'])c[k]=source[k].map(s=>Array.isArray(s)?[...s]:{...s});
 const start=c.length-3600;
 if(c.id==='sky'||c.id==='clock')mountain(c,start+900,c.id==='clock');
 if(c.id==='forest'){
  const a=start+2510,b=start+2970;clear(c,a+30,b-30);
  c.swarms600.push({id:'forest-swarm600',trigger:a-120,min:a+22,max:b-24,y:300,count:12,interval:450});
  c.platforms.push(pad('forest-swarm-high600',a+150,232,110));boss(c,'goblin_guard',8,'charge');
 }
 if(c.id==='relay'||c.id==='crystal')secret(c,start+215,start+450);
 if(c.id==='relay')boss(c,'stone_golem',10,'wave');
 if(c.id==='crystal'){
  const x=start+1990;c.platforms.push(pad('crystal-branch600-a',x+70,218,95),pad('crystal-branch600-b',x+185,137,95),pad('crystal-branch600-c',x+300,62,100));
  c.gems.push({id:'crystal-summit600',x:x+345,y:35});
 }
 if(c.id==='coast'){
  const a=start+2560,b=start+2940;clear(c,a+10,b-10);
  c.tides600.push({id:'coast-tide600',x:a+25,w:b-a-50,y:300,period:8000});
  for(let i=0;i<3;i++)c.platforms.push(pad('coast-raft600-'+i,a+40+i*110,225,82,{move:{axis:'y',range:12,period:4000}}));
 }
 if(c.id==='frost'){
  const a=start+2550,b=start+2920;clear(c,a+15,b-15);
  c.rollers600.push({id:'frost-roll600',left:a+24,right:b-24,y:300,period:4200});
  c.platforms.push(pad('frost-refuge600',a+125,221,86));
  c.enemies.push({id:'frost-kick600',x:a+70,min:a+45,max:a+100,y:300,speed:50,advance:true,prefrozen600:true});
 }
 if(c.id==='ember'){
  for(const x of [start+1450,start+2140])c.firebars600.push({id:'ember-firebar600-'+x,x,y:250,length:94,period:10500,offset:0});
  boss(c,'demon_lord',16,'fire');
 }
 c.grounds.sort((a,b)=>a[0]-b[0]);c.checkpoints.sort((a,b)=>a.x-b.x);
 c.pickups=sparsePickups(c,source.pickups);
 c.duration=Math.max(c.duration,c.boss600?300000:270000);
 return c;
}
