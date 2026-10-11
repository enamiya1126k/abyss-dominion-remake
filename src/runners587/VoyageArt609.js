import {voyageShips610,SHIP_ROUTES611,vessel611} from './Voyage609.js';
import {deckRock616} from './VoyagePath616.js';
import {strip602,centered602} from './Art602.js';
export function voyageStatus609(g,t=g.elapsed,focus=g.players?.[0]){
 if(focus?.finishTime!=null)return 'ゴール！';if(focus?.voyageOut613)return '乗り遅れ · 脱落';
 const r=SHIP_ROUTES611.find(r=>(focus?.x??0)<r.end+r.w-35);if(!r)return 'ゴールへ！';
 const b=vessel611(r,t,g);
 if(b.phase==='boarding')return '誰かが乗ると出航 · 再便なし';
 return b.phase==='cruise'?'上空でかわして船へ戻れ！':'到着 · 次の船は乗船待ち';
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
  c.restore();label(c,b.phase==='arrived'?'到着 · 折り返しなし':b.speed>0?'片道航行 →':'乗ったら出航！',b.x+b.w/2,b.y+83,'#bdeee1');
 }
 for(const island of course.islands609){
  if(island.x<left-160||island.x>right+160)continue;
  const done=g.ship609?.completed?.includes(island.index);
  label(c,done?'宝星の封印 解除！':({sequence:'8秒以内に ①→②→③',timed:g.ship609?.fort613?.started!=null?'番兵戦 残り '+Math.max(0,Math.ceil((12000-t+g.ship609.fort613.started)/1000))+'秒':'この台から開始！ 番兵2体を12秒で',rings:'4つの輪を順番に跳べ'})[island.kind],island.x,island.y-62,done?'#a8eeb9':'#f9df9d');
  if(island.kind==='key'&&!done){c.save();c.translate(island.x,island.y-20);c.strokeStyle='#ffe7a0';c.lineWidth=4;c.beginPath();c.arc(0,-8,7,0,Math.PI*2);c.moveTo(0,-1);c.lineTo(0,13);c.lineTo(8,13);c.moveTo(0,7);c.lineTo(6,7);c.stroke();c.restore();}
 }
 for(const [i,q]of course.islands609[0].pads.entries()){c.save();c.fillStyle='#fff0ab';c.fillRect(q.x-22,q.y-4,44,4);c.restore();label(c,String(i+1),q.x,q.y-24);}
 for(const [i,q]of course.rings613.entries()){if(q.x<left-40||q.x>right+40)continue;c.save();c.strokeStyle='#ffe58f';c.lineWidth=4;c.beginPath();c.ellipse(q.x,q.y,19,25,0,0,Math.PI*2);c.stroke();c.restore();label(c,String(i+1),q.x,q.y-35);}
 for(const q of course.signs616??[])if(q.x>left-160&&q.x<right+160)label(c,q.text,q.x,q.y);
 for(const w of g.ship609?.warnings616??[]){
  if(w.x<left-100||w.x>right+100)continue;
  c.save();c.strokeStyle='#e8bd74';c.lineWidth=3;c.beginPath();c.moveTo(w.x-27,w.y-48);c.lineTo(w.x-27,w.y+5);c.lineTo(w.x+27,w.y+5);c.lineTo(w.x+27,w.y-48);c.stroke();
  strip602(c,'bridge',w.x-31,w.y-5,62,11,62);centered602(c,'arrow',w.x,w.y+29,20,29,Math.PI);
  c.globalAlpha=.55+.35*Math.sin(t/70);c.strokeStyle='#ffbe5c';c.lineWidth=2;c.setLineDash([4,5]);c.beginPath();c.moveTo(w.x,w.y+47);c.lineTo(w.x,w.y+123);c.stroke();c.restore();
  label(c,w.kind==='rock'?'大岩！ 上へ逃げろ':'敵が降りてくる！',w.x,w.y-61,'#ffc886');
 }
 for(const q of g.ship609?.rocks616??[]){const rock=deckRock616(q,t);if(!rock||rock.x<left-60||rock.x>right+60)continue;
  c.save();c.translate(rock.x,rock.y);c.rotate(rock.angle);const paint=c.createRadialGradient(-12,-15,3,0,0,40);paint.addColorStop(0,'#bfc9c8');paint.addColorStop(.5,'#647578');paint.addColorStop(1,'#29383e');c.fillStyle=paint;c.strokeStyle='#d0b583';c.lineWidth=2;
  c.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5,r=rock.r*(i%2?.93:1);if(!i)c.moveTo(Math.cos(a)*r,Math.sin(a)*r);else c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.fill();c.stroke();
  c.strokeStyle='#28383d';c.lineWidth=3;c.beginPath();c.moveTo(-23,-23);c.lineTo(-5,-12);c.lineTo(-9,9);c.lineTo(12,25);c.moveTo(-9,9);c.lineTo(-27,15);c.moveTo(-5,-12);c.lineTo(22,-20);c.stroke();c.restore();
 }
}
