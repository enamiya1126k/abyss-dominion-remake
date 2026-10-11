import {voyageShips610} from './Voyage609.js';
import {strip602,centered602} from './Art602.js';
export function voyageStatus609(g,t=g.elapsed,focus=g.players?.[0]){
 return focus?.finishTime!=null?'ゴール！':'ゴールまで '+Math.max(0,Math.ceil((6690-(focus?.x??0))/6690*100))+'%';
}
function label(c,text,x,y,color='#f9df9d'){
 c.save();c.font='bold 10px "Noto Sans JP",sans-serif';c.textAlign='center';const w=c.measureText(text).width+18;c.fillStyle='#082b2bed';c.fillRect(x-w/2,y-13,w,21);c.strokeStyle='#b69b5e';c.lineWidth=.8;c.strokeRect(x-w/2,y-13,w,21);c.fillStyle=color;c.fillText(text,x,y+1);c.restore();
}
export function voyageArt609(c,g,course,left,right,t,reduced){
 if(!course.ship609)return;
 for(const b of voyageShips610(t,g)){
  if(b.x+b.w<left-80||b.x>right+80)continue;
  c.save();c.translate(b.x,b.y);
  const paint=c.createLinearGradient(0,6,0,67);paint.addColorStop(0,'#26675d');paint.addColorStop(.5,'#123b36');paint.addColorStop(1,'#071e22');c.fillStyle=paint;c.strokeStyle='#cba76c';c.lineWidth=3;
  c.beginPath();c.moveTo(0,8);c.lineTo(b.w,8);c.lineTo(b.w-28,46);c.quadraticCurveTo(b.w/2,75,24,43);c.closePath();c.fill();c.stroke();
  c.strokeStyle='#8a7448';c.lineWidth=2;for(let i=28;i<b.w-15;i+=35){c.beginPath();c.moveTo(i,12);c.lineTo(i+8,47);c.stroke();}
  for(let i=45;i<b.w-20;i+=55){centered602(c,'ui-button',i,30,27,23);centered602(c,'spark',i,29,11);}
  strip602(c,'bridge',0,-1,b.w,12,90);c.fillStyle='#f8dea2';c.fillRect(0,0,b.w,2);
  if(!reduced&&b.speed){c.strokeStyle='#a6f3ea88';c.lineWidth=2;for(let i=0;i<3;i++){const d=(t/16+i*21)%60,x=b.speed>0?-d-5:b.w+d+5;c.beginPath();c.moveTo(x,36+i*7);c.lineTo(x+(b.speed>0?-21:21),36+i*7);c.stroke();}}
  c.restore();label(c,b.speed>0?'自動航行 →':b.speed<0?'← 自動航行':'自動出発 '+Math.ceil(b.remaining/1000)+'秒',b.x+b.w/2,b.y+83,'#bdeee1');
 }
 for(const island of course.islands609){
  if(island.x<left-160||island.x>right+160)continue;
  const done=g.ship609?.completed?.includes(island.index);
  label(c,done?'宝星の封印 解除！':({key:'寄り道：高台の鍵',guards:'寄り道：番兵を2体倒せ',seal:'寄り道：封印箱を壊せ'})[island.kind],island.x,island.y-62,done?'#a8eeb9':'#f9df9d');
  if(island.kind==='key'&&!done){c.save();c.translate(island.x,island.y-20);c.strokeStyle='#ffe7a0';c.lineWidth=4;c.beginPath();c.arc(0,-8,7,0,Math.PI*2);c.moveTo(0,-1);c.lineTo(0,13);c.lineTo(8,13);c.moveTo(0,7);c.lineTo(6,7);c.stroke();c.restore();}
 }
}
