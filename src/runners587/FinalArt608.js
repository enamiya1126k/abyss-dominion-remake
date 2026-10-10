import {centered602,switch602,link602} from './Art602.js';
import {crew608} from './FinalRules608.js';
function label(c,text,x,y,color='#f6dfac'){c.save();c.font='bold 10px "Noto Sans JP",sans-serif';c.textAlign='center';const w=c.measureText(text).width+14;c.fillStyle='#122823eb';c.fillRect(x-w/2,y-13,w,20);c.fillStyle=color;c.fillText(text,x,y);c.restore();}
export function finalArt608(c,g,course,left,right,t){
 if(!course.final608)return;const visible=x=>x>left-80&&x<right+80;
 for(const h of course.gates608){const s=g.final608?.[h.id]??{},open=s.done;
  if(visible(h.x)){if(!open){c.save();const pulse=.45+.15*Math.sin(t/300);c.fillStyle='#12262488';c.fillRect(h.x,-1500,24,1800);c.strokeStyle=`rgba(241,203,126,${pulse})`;c.lineWidth=3;for(const dx of [1,12,23]){c.beginPath();c.moveTo(h.x+dx,-1500);c.lineTo(h.x+dx,300);c.stroke();}c.restore();centered602(c,'ui-button',h.x+12,264,44);label(c,'封印 · 連携で解除',h.x+12,226);}else{centered602(c,'spark',h.x+12,265,25);label(c,'解除済み',h.x+12,230,'#a8efba');}}
  if(open)continue;
  if(h.rescue608&&visible(h.left.x))label(c,'仲間を踏んで上へ → 救援足場',h.left.x,h.left.y-74);
  if(['relay','sync','ice'].includes(h.kind)){
   if(visible(h.left.x)){switch602(c,h.left,!!g.coop601?.[h.id]?.open,t,true);label(c,h.kind==='sync'?'A：同時に650ms':h.kind==='ice'?'A：橋を維持':'A：踏んで足場を維持',h.left.x,h.left.y+29);}
   if(visible(h.right.x)){switch602(c,h.right,false,t,true);label(c,h.kind==='ice'?'B：氷をここへ':h.kind==='sync'?'B：同時に650ms':'B：ここまで突破',h.right.x,h.right.y+29);}
  }
  for(const [i,q] of (h.targets??[]).entries()){if(!visible(q.x))continue;const hit=s.hits?.find(v=>v.id===q.id&&t-v.at<=h.window);c.save();c.translate(q.x,q.y);c.strokeStyle=hit?'#9bf2b2':'#ffcf7b';c.lineWidth=3;c.beginPath();c.arc(0,0,16,0,Math.PI*2);c.stroke();centered602(c,'star',0,0,19);c.restore();label(c,(i?'B':'A')+'：別の人と'+h.window/1000+'秒以内',q.x,q.y-28);}
  if(h.kind==='hunt')for(const id of h.guards){const e=g.enemies.find(e=>e.id===id);if(e&&visible(e.x))label(c,e.defeated?'相方を待つ · 3.5秒':'別の人が片方ずつ撃破',e.x,e.y-60);}
  if(crew608(g).length<2&&visible(h.left.x))label(c,'仲間の復帰を待とう · 2人必須',h.left.x,h.left.y-80,'#ffc8b5');
 }
 const b=g.boss600;if(b&&visible(b.x)&&b.hp>0){const pending=b.pair608&&t-b.pair608.at<=1000;label(c,pending?'仲間の一撃を！ '+Math.max(0,(1000-t+b.pair608.at)/1000).toFixed(1)+'秒':'第'+(b.finalPhase608??1)+'形態 · 2人で1秒以内に攻撃',b.x,b.y-111,pending?'#fff2a2':'#d8c4ff');if(pending){c.save();c.strokeStyle='#ffe99c';c.lineWidth=2;c.beginPath();c.arc(b.x,b.y-34,43,0,Math.PI*2);c.stroke();c.restore();}}
}
