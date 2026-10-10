import {shipAt609,SHIP609} from './Voyage609.js';
import {strip602,centered602,switch602,link602} from './Art602.js';
export function voyageStatus609(g,t=g.elapsed){
 const b=shipAt609(t,g),s=g.ship609??{},done=!!s.objective;
 if(s.retryAt!=null)return '航路を再出発';
 if(b.phase==='boarding')return '出発 '+(b.remaining/1000).toFixed(1)+'秒';
 if(b.phase==='cruise')return '上陸地点まで '+Math.ceil(b.remaining/1000)+'秒';
 if(b.phase==='island'||b.phase==='warning')return '出航 '+(b.remaining/1000).toFixed(1)+'秒';
 if(b.phase==='escape'&&b.remaining===0)return '桟橋へ接岸中';
 if(b.phase==='escape')return '帰還 '+(b.remaining/1000).toFixed(1)+'秒';
 return done?'到着！':'攻略未完了';
}
function label(c,text,x,y,color='#f9df9d'){
 c.save();c.font='bold 10px "Noto Sans JP",sans-serif';c.textAlign='center';const w=c.measureText(text).width+18;c.fillStyle='#082b2bed';c.fillRect(x-w/2,y-13,w,21);c.strokeStyle='#b69b5e';c.lineWidth=.8;c.strokeRect(x-w/2,y-13,w,21);c.fillStyle=color;c.fillText(text,x,y+1);c.restore();
}
export function voyageArt609(c,g,course,left,right,t,reduced){
 if(!course.ship609)return;const b=shipAt609(t,g),s=g.ship609??{},h=course.islands609[s.leg??0];
 for(const ceiling of course.walls.filter(w=>!w.breakable))if(ceiling.x<right&&ceiling.x+ceiling.w>left)for(const x of [ceiling.x+15,ceiling.x+ceiling.w-15])link602(c,'chain',x,-180,x,ceiling.y,7);
 if(b.x+b.w>left-80&&b.x<right+80){
  c.save();c.translate(b.x,b.y);
  // Hull sits below the exact deck collider; the visible gold rim is the walk plane.
  const paint=c.createLinearGradient(0,6,0,67);paint.addColorStop(0,'#26675d');paint.addColorStop(.5,'#123b36');paint.addColorStop(1,'#071e22');c.fillStyle=paint;c.strokeStyle='#cba76c';c.lineWidth=3;
  c.beginPath();c.moveTo(0,8);c.lineTo(b.w,8);c.lineTo(b.w-28,46);c.quadraticCurveTo(b.w/2,75,24,43);c.closePath();c.fill();c.stroke();
  c.strokeStyle='#8a7448';c.lineWidth=2;for(let i=28;i<b.w-15;i+=35){c.beginPath();c.moveTo(i,12);c.lineTo(i+8,47);c.stroke();}
  for(let i=45;i<210;i+=55){centered602(c,'ui-button',i,30,27,23);centered602(c,'spark',i,29,11);}
  strip602(c,'bridge',0,-1,b.w,12,90);c.fillStyle='#f8dea2';c.fillRect(0,0,b.w,2);
  if(!reduced){c.strokeStyle='#a6f3ea88';c.lineWidth=2;for(let i=0;i<3;i++){const d=(t/16+i*21)%60;c.beginPath();c.moveTo(-d-5,36+i*7);c.lineTo(-d-26,36+i*7);c.stroke();}}
  switch602(c,{x:b.w-32,y:0},!!s.rescue,t,true);c.restore();
  if(s.rescue){strip602(c,'bridge',b.x-80,b.y-38,82,14,80);label(c,'救援足場',b.x-38,b.y-53,'#a0f4d7');}
  label(c,voyageStatus609(g,t),b.x+b.w/2,b.y+88,b.phase==='warning'||b.phase==='escape'?'#ffbd8c':'#bdeee1');
 }
 for(const island of course.islands609){if(island.x<left-220||island.x>right+220)continue;const done=island.index<(s.leg??0)||(island.index===s.leg&&s.objective);
  const text=done?'攻略完了 → 船に戻ろう':({key:'高台の航路鍵を回収',guards:'番兵を2体倒す',seal:'封印装置を攻撃で破壊'})[island.kind];
  label(c,text,island.x,island.y-62,done?'#a8eeb9':'#f9df9d');
  if(island.kind==='key'&&!done){c.save();c.translate(island.x,island.y-20);c.strokeStyle='#ffe7a0';c.lineWidth=4;c.beginPath();c.arc(0,-8,7,0,Math.PI*2);c.moveTo(0,-1);c.lineTo(0,13);c.lineTo(8,13);c.moveTo(0,7);c.lineTo(6,7);c.stroke();c.restore();}
  if(island.kind==='seal'&&!done){centered602(c,'spark',island.x+33,island.y-24,20);}
 }
 if(h.returnX>left-100&&h.returnX<right+100){centered602(c,'arrow',h.returnX+46,200,23,23,Math.PI/2);label(c,'ここから船へ飛び乗れ！',h.returnX,180);}
}
