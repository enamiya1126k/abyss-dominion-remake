import {centered602,switch602} from './Art602.js';
export function trialArt604(c,g,trial,t,reduced){
 const mode=trial.kind604;if(!mode||mode==='duet')return false;
 const s=g.coop601?.[trial.id]??{},r=trial.reward;let label='';
 if(mode==='targets'){
  for(const q of trial.targets604){const hit=s.hit604?.includes(q.id);c.save();c.translate(q.x,q.y);c.globalAlpha=hit?.35:1;c.strokeStyle=hit?'#98dfa5':'#ffe0a1';c.fillStyle='#623733';c.lineWidth=3;c.beginPath();c.arc(0,0,13,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle='#ffe0a1';c.lineWidth=2;c.beginPath();c.arc(0,0,6,0,Math.PI*2);c.stroke();if(hit){c.strokeStyle='#b3ffc0';c.beginPath();c.moveTo(-5,0);c.lineTo(-1,4);c.lineTo(7,-5);c.stroke();}c.restore();}
  label='的 '+(s.hit604?.length??0)+' / 3';
 }
 if(mode==='rings'){
  trial.rings604.forEach((q,i)=>{if(i<(s.ring604??0))return;c.save();c.globalAlpha=i===(s.ring604??0)?1:.35;c.strokeStyle='#ffe3a3';c.lineWidth=3;c.beginPath();c.ellipse(q.x,q.y,14,21,0,0,Math.PI*2);c.stroke();c.font='bold 10px sans-serif';c.textAlign='center';c.fillStyle='#fff4cf';c.fillText(String(i+1),q.x,q.y+4);c.restore();});label='光の輪 '+(s.ring604??0)+' / 3';
 }
 if(mode==='sprint'){switch602(c,trial.pads[0],s.open,t);label=s.claimed604?'':s.open?'残り '+Math.max(0,(s.until604-t)/1000).toFixed(1)+'秒':'踏んだら6秒で星へ';}
 if(mode==='ice'){switch602(c,trial.pads[0],s.open,t);if(!s.open)centered602(c,'arrow',trial.pads[0].x-44,trial.pads[0].y-25,13,19,Math.PI/2);label=s.resetAt604?'氷を戻している…':'氷の敵を台座へ';}
 if(mode==='combat')label='番兵 '+trial.guards604.filter(id=>g.enemies.find(e=>e.id===id)?.defeated).length+' / 3';
 if(label&&(!s.open||mode==='sprint'&&!s.claimed604)){c.save();c.font='bold 10px sans-serif';c.textAlign='center';const w=c.measureText(label).width+14;c.fillStyle='#102c27e8';c.fillRect(r.x-w/2,r.y-55,w,18);c.fillStyle='#f4e5b6';c.fillText(label,r.x,r.y-42);c.restore();}
 return true;
}
