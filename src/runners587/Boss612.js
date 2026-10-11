const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const moves={charge:['rush','aim','leap','rain'],wave:['rush','aim','rain','leap'],fire:['rush','rain','leap','aim']};
export const bossSpeed612=b=>b.elite603?(b.elite603.dash+(b.hp<=b.maxHp/2?25:0)):b.hp<=b.maxHp/2?230:200;
export function bossPose612(b,t){
 if(b.phase==='stunned'&&b.stun612)return {x:b.x,y:Math.min(300,b.stun612.y+540*((t-b.phaseAt)/1000)**2)};
 if(b.phase==='leap'&&b.jump612){const j=b.jump612,u=clamp((t-b.phaseAt)/1000,0,1);return {x:j.x+(j.to-j.x)*u,y:300-Math.sin(u*Math.PI)*200};}
 if(b.phase==='dash')return {x:clamp(b.x+b.dir*bossSpeed612(b)*clamp((t-(b.at600??t))/1000,0,.15),b.left+28,b.right-28),y:b.y};
 return {x:b.x,y:b.y};
}
function warn(b,p,now){
 b.phase='warn';b.phaseAt=now;b.dir=p.x<b.x?-1:1;
 b.move612=(moves[b.pattern]??moves.wave)[b.turn%4];
 // A fixed target makes the warning an honest promise, including on high ledges.
 b.aim612={x:clamp(p.x,b.left-400,b.right+70),y:p.y-14};
 b.land612=clamp(clamp(p.x,b.x-600,b.x+600),b.left+45,b.right-45);
 b.warn612=Math.max(750,b.elite603?.warn??900);
}
function shot(g,b,x,y,vx,vy,kind=b.pattern){g.enemyShots600.push({x,y,vx,vy,r:9,kind,born:g.elapsed,until:g.elapsed+5000});}
export function tickBoss612(g,b,players){
 const now=g.elapsed,target=players.filter(p=>p.x>b.left-500&&p.x<b.right+180).sort((a,c)=>Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(c.x-b.x,c.y-b.y))[0];
 if(b.phase==='sleep'&&target)warn(b,target,now);
 let age=now-b.phaseAt;
 if(b.phase==='stunned')Object.assign(b,bossPose612(b,now));
 if(b.phase==='warn'&&age>=(b.warn612??Math.max(750,b.elite603?.warn??900))){
  const move=b.move612??'rush',aim=b.aim612??{x:target?.x??b.x+b.dir*250,y:target?.y-14||286};
  b.phase=move==='rush'?'dash':move==='leap'?'leap':'cast';b.phaseAt=now;age=0;
  if(move==='rush')b.dashMs612=clamp(Math.abs(aim.x-b.x)/bossSpeed612(b)*1000,850,2200);
  if(move==='leap')b.jump612={x:b.x,to:b.land612??clamp(aim.x,b.left+45,b.right-45)};
  if(move==='aim'){
   const angle=Math.atan2(aim.y-(b.y-36),aim.x-b.x),speed=b.elite603?.castSpeed??245;
   for(const delta of b.elite603?[-.3,-.15,0,.15,.3]:[-.2,0,.2])shot(g,b,b.x,b.y-36,Math.cos(angle+delta)*speed,Math.sin(angle+delta)*speed);
  }
  if(move==='rain')for(const dx of [-120,0,120])shot(g,b,aim.x+dx,aim.y-270,0,280,'rain612');
 }
 if(b.phase==='counter'){
  const u=Math.min(1,age/650);b.y=(b.baseY604??300)-Math.sin(u*Math.PI)*54;b.x=clamp(b.x+b.dir*3,b.left+28,b.right-28);
  if(age>=650){b.y=300;b.turn++;if(target)warn(b,target,now);else{b.phase='rest';b.phaseAt=now;age=0;}}
 }else if(b.phase==='dash'){
  b.x=clamp(b.x+b.dir*bossSpeed612(b)*.025,b.left+28,b.right-28);
  if(age>=(b.dashMs612??850)){b.phase='rest';b.phaseAt=now;age=0;}
 }else if(b.phase==='leap'){
  Object.assign(b,bossPose612(b,now));
  if(age>=1000){b.y=300;b.phase='rest';b.phaseAt=now;age=0;for(const dir of [-1,1])shot(g,b,b.x+dir*35,289,dir*245,0,'wave');}
 }else if(b.phase==='cast'&&age>=400){b.phase='rest';b.phaseAt=now;age=0;}
 if((b.phase==='rest'&&age>=Math.max(900,b.elite603?.rest??1000)||b.phase==='stunned'&&age>=1400)&&target){b.turn++;warn(b,target,now);}
}
export function bossWarning612(c,b){
 if(b.hp<=0||!['warn','leap'].includes(b.phase)||!b.aim612)return;
 const a=b.aim612;c.save();c.strokeStyle='#fff2b0';c.fillStyle='#ffad54';c.lineWidth=2;c.setLineDash([7,5]);
 if(b.move612==='rain')for(const dx of [-120,0,120]){c.beginPath();c.moveTo(a.x+dx,a.y-270);c.lineTo(a.x+dx,300);c.stroke();c.fillRect(a.x+dx-15,296,30,4);}
 else if(b.move612==='aim'){c.beginPath();c.moveTo(b.x,b.y-36);c.lineTo(a.x,a.y);c.stroke();c.beginPath();c.arc(a.x,a.y,18,0,Math.PI*2);c.stroke();}
 else if(b.move612==='leap'||b.phase==='leap'){c.beginPath();c.ellipse(b.jump612&&b.phase==='leap'?b.jump612.to:b.land612??clamp(a.x,b.left+45,b.right-45),295,42,8,0,0,Math.PI*2);c.stroke();}
 else{c.fillStyle='#ffad5466';c.fillRect(Math.min(b.x,a.x),288,Math.abs(b.x-a.x),12);}
 c.setLineDash([]);c.font='bold 12px sans-serif';c.textAlign='center';const label=({rush:'突進',aim:'狙い撃ち',rain:'降り注ぐ弾',leap:'跳躍 → 衝撃波'})[b.phase==='leap'?'leap':b.move612]??'',w=c.measureText(label).width+16;c.fillStyle='#102a2de6';c.fillRect(b.x-w/2,b.y-108,w,20);c.fillStyle='#fff2b0';c.fillText(label,b.x,b.y-94);c.restore();
}
