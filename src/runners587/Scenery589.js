import {hazard589} from './Courses589.js';
const line=(c,x1,y1,x2,y2)=>{c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();};
function label(c,text,x,y,color='#fff0c2') {c.font='bold 10px "Noto Sans JP",sans-serif';c.textAlign='center';const width=c.measureText(text).width+16;c.fillStyle='#102f35e8';c.beginPath();c.roundRect(x-width/2,y-12,width,19,5);c.fill();c.fillStyle=color;c.fillText(text,x,y+1);}
export function backdrop589(c,r,course,at){
 if(course.id==='forest')return;
 const {width:w,height:h}=r;c.save();
 if(course.theme==='sky'){
  c.fillStyle='#468eac30';c.fillRect(0,0,w,h);
  for(let i=0;i<5;i++){const x=((i*183-r.camera*.1)%(w+170)+w+170)%(w+170)-85,y=h*.23+(i%3)*h*.15;c.fillStyle='#edfff52b';c.beginPath();c.ellipse(x,y,110,18,0,0,7);c.fill();}
 }else if(course.theme==='clock'){
  c.fillStyle='#40325158';c.fillRect(0,0,w,h);
  for(let i=0;i<4;i++){const x=i*w*.4-r.camera*.09%w,y=h*(.3+(i%2)*.34),radius=45+i*12;c.save();c.translate(x,y);c.rotate(at/9000*(i%2?-1:1));c.strokeStyle='#d9b58732';c.lineWidth=8;c.beginPath();c.arc(0,0,radius,0,7);c.stroke();c.lineWidth=6;for(let a=0;a<12;a++){c.save();c.rotate(a*Math.PI/6);line(c,radius-8,0,radius+10,0);if(a%3===0)line(c,5,0,radius-5,0);c.restore();}c.restore();}
 }else{c.fillStyle='#145b6450';c.fillRect(0,0,w,h);for(let i=0;i<7;i++){const x=((i*119-r.camera*.08)%w+w)%w,y=h*.2+i*43%h;c.save();c.translate(x,y);c.rotate(Math.PI/4);c.strokeStyle='#aeffe747';c.lineWidth=1;c.strokeRect(-8,-8,16,16);c.restore();}}
 c.restore();
}
export function scenery589(c,g,course,left,right,at){
 const visible=s=>s.x+(s.w??45)>left&&s.x<right;c.save();
 for(const wind of course.winds.filter(visible)){
  c.save();c.beginPath();c.rect(wind.x,wind.y,wind.w,wind.h);c.clip();const dir=Math.sign(wind.speed);c.strokeStyle='#d9fff477';c.lineWidth=1.3;
  for(let i=0;i<12;i++){const x=wind.x+((at*.075*dir+i*83)%(wind.w+90)+wind.w+90)%(wind.w+90)-45,y=wind.y+25+i*23%wind.h;line(c,x,y,x+40*dir,y);line(c,x+32*dir,y-4,x+40*dir,y);line(c,x+32*dir,y+4,x+40*dir,y);}
  c.restore();label(c,dir>0?'追い風 →':'← 向かい風',wind.x+wind.w*.5,wind.y+40,'#c0faff');
 }
 for(const b of course.belts.filter(visible)){
  c.fillStyle='#304650';c.fillRect(b.x,b.y,b.w,10);c.strokeStyle='#e4c991';c.lineWidth=1.5;line(c,b.x,b.y,b.x+b.w,b.y);c.save();c.beginPath();c.rect(b.x,b.y,b.w,13);c.clip();
  const dir=Math.sign(b.speed),offset=at/1000*b.speed%25;c.strokeStyle=dir>0?'#b2eabd':'#ecc0a1';c.lineWidth=2;for(let x=b.x-25+offset;x<b.x+b.w+25;x+=25){line(c,x-dir*4,b.y+3,x,b.y+6);line(c,x,b.y+6,x-dir*4,b.y+9);}c.restore();
 }
 for(const wall of course.walls.filter(visible)){
  const {x,y,w,h}=wall,fill=c.createLinearGradient(x,y,x+w,y);fill.addColorStop(0,'#544960');fill.addColorStop(.25,'#88766c');fill.addColorStop(.7,'#5f565c');fill.addColorStop(1,'#383746');c.fillStyle=fill;c.fillRect(x,y,w,h);c.strokeStyle='#e5c795';c.lineWidth=2;c.strokeRect(x+.5,y+.5,w-1,h-.5);c.fillStyle='#e6d5a6';c.fillRect(x-3,y,w+6,5);
  for(let yy=y+18;yy<y+h-10;yy+=24){c.strokeStyle='#cfbc96';c.lineWidth=2;line(c,x+3,yy,x+10,yy-5);line(c,x+10,yy-5,x+17,yy);line(c,x+w-3,yy,x+w-10,yy-5);line(c,x+w-10,yy-5,x+w-17,yy);c.fillStyle='#303644';c.fillRect(x+4,yy+6,w-8,3);}
  label(c,'壁キック',x+w/2,y-14,'#ffe6a8');
 }
 for(const bridge of course.bridges.filter(visible)){
  const on=g.switches.includes(bridge.id);c.save();c.globalAlpha=on?1:.4;
  if(on){const fill=c.createLinearGradient(bridge.x,bridge.y,bridge.x,bridge.y+25);fill.addColorStop(0,'#d5ffe2');fill.addColorStop(.2,'#6abdac');fill.addColorStop(1,'#234d58');c.fillStyle=fill;c.fillRect(bridge.x,bridge.y,bridge.w,18);c.shadowColor='#8dffdb';c.shadowBlur=10;c.fillStyle='#caffdb';c.fillRect(bridge.x,bridge.y,bridge.w,3);c.shadowBlur=0;for(let x=bridge.x+13;x<bridge.x+bridge.w;x+=23){c.strokeStyle='#183d48';line(c,x,bridge.y+4,x-7,bridge.y+16);}}
  else{c.strokeStyle='#bce7dd';c.setLineDash([7,9]);c.lineWidth=2;line(c,bridge.x,bridge.y+9,bridge.x+bridge.w,bridge.y+9);c.setLineDash([]);label(c,'対岸スイッチで開通',bridge.x+bridge.w/2,bridge.y+40,'#c6ebe1');}
  c.restore();
 }
 for(const s of course.switches.filter(visible)){
  const on=g.switches.includes(s.id),y=s.y;c.fillStyle='#254653';c.fillRect(s.x-24,y-9,48,9);c.fillStyle=on?'#91e8b2':'#dbb26e';c.beginPath();c.ellipse(s.x,y-(on?6:12),22,6,0,0,7);c.fill();c.strokeStyle='#e6eccb';c.lineWidth=2;c.stroke();
  c.save();c.translate(s.x,y-41);c.rotate(Math.PI/4);c.shadowColor=on?'#86ffd2':'#f9ca79';c.shadowBlur=on?16:8;c.fillStyle=on?'#b5ffdc':'#f0cc82';c.fillRect(-8,-8,16,16);c.restore();c.fillStyle='#183f42';c.font='bold 10px "Noto Sans JP",sans-serif';c.textAlign='center';c.fillText(on?'✓':s.label,s.x,y-37);label(c,on?'橋がつながった！':'ここを踏むと橋が開く',s.x,y-71,on?'#c1ffdd':'#ffe0a0');
 }
 for(const p of course.platforms.filter(p=>p.crumble&&visible(p))){
  const start=g.crumbles[p.id],age=start==null?-1:g.elapsed-start;
  if(age>=900&&age<4000){c.strokeStyle='#e4bc7866';c.setLineDash([5,7]);line(c,p.x,p.y+3,p.x+p.w,p.y+3);c.setLineDash([]);continue;}
  c.strokeStyle=age>=0?'#ffb077':'#e4b779';c.lineWidth=2;for(let x=p.x+15;x<p.x+p.w;x+=28){c.beginPath();c.moveTo(x,p.y+2);c.lineTo(x+5,p.y+8);c.lineTo(x,p.y+14);c.lineTo(x+6,p.y+18);c.stroke();}
  if(age>=0){c.fillStyle='#ebba71';c.fillRect(p.x,p.y-5,p.w*Math.max(0,1-age/900),3);}else label(c,'止まると崩れる',p.x+p.w/2,p.y+65,'#ffcf99');
 }
 for(const h of course.hazards.filter(visible)){
  const state=hazard589(h,g.elapsed);c.fillStyle='#302f40';c.fillRect(h.x,h.y-6,h.w,6);c.strokeStyle=state.active?'#ffe1c2':state.warning?'#ffc06d':'#779697';c.lineWidth=2;for(let x=h.x+5;x<h.x+h.w-4;x+=8)line(c,x,h.y-5,x+2,h.y-1);
  if(state.active){const fill=c.createLinearGradient(h.x,h.y-h.h,h.x,h.y);fill.addColorStop(0,'#d4f8ff00');fill.addColorStop(.3,'#dcfaffb0');fill.addColorStop(1,'#b5e8ef');c.fillStyle=fill;for(let i=0;i<5;i++){const x=h.x+6+i*(h.w-12)/4,height=h.h-(i%2)*8;c.beginPath();c.ellipse(x,h.y-height/2,7+Math.sin(at/100+i)*2,height/2,0,0,7);c.fill();}label(c,'蒸気に注意',h.x+h.w/2,h.y-h.h-12,'#e5faff');}
  else if(state.warning){c.fillStyle='#ffd98d';c.font='bold 20px sans-serif';c.textAlign='center';c.fillText('!',h.x+h.w/2,h.y-13);}
 }
 c.restore();
}
