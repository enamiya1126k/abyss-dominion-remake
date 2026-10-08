import {chairLocation584,chairValue584,chairOpen584} from './Rules583.js';
import {esc563 as esc,color563 as color} from '../party/Arcade563.js';
export const mode584=g=>g.round===8?'最後の１席・得点２倍':g.chairs?.length===1?'１席争奪！':'金のイスは200点・連続着席ボーナス';
export function decision584(g,at){return g.stage==='dance'?'♪':g.stage==='grab'?'空席をタップ！':'';}
export function motion584(u,p,target,g,at){
 u.motion??={};const state=p.chair!=null?'seat'+p.chair:p.out?'out':g.stage==='dance'?'dance':'wait',key=g.round+':'+state;
 let m=u.motion[p.seat];if(!m||m.key!==key){m=u.motion[p.seat]={key,from:m?.current??target,current:target,at,duration:state.startsWith('seat')?460:state==='out'?620:260,state};}
 const t=u.reduced?1:Math.max(0,Math.min(1,(at-m.at)/m.duration)),ease=1-(1-t)**3;
 const pos=state==='dance'?target:{x:m.from.x+(target.x-m.from.x)*ease,y:m.from.y+(target.y-m.from.y)*ease-(state.startsWith('seat')?.11:state==='out'?.08:0)*Math.sin(Math.PI*t)};
 m.current=pos;return {...pos,landing:state.startsWith('seat')&&t<1,flying:state==='out'&&t<1};
}
export function score584(u,seat,value,at){u.scoreTweens??={};let t=u.scoreTweens[seat];if(!t||t.target!==value)t=u.scoreTweens[seat]={from:t?.value??value,target:value,at,value};const f=u.reduced?1:Math.min(1,Math.max(0,(at-t.at)/550));t.value=Math.round(t.from+(t.target-t.from)*(1-(1-f)**3));return t.value;}
export function recap584(c,g){return `<div class="ch-recap584"><small>ROUND RECORD</small><h2>８回の勝負を振り返ろう</h2><div class="ch-record584"><div class="ch-record-head584"><b>相棒</b>${Array.from({length:8},(_,i)=>`<span>${i+1}</span>`).join('')}</div>${g.players.map(p=>`<div style="--player:${color(p)}"><b>${p.playerId===c.transport.selfId?'あなた':esc(p.name)}</b>${Array.from({length:8},(_,i)=>{const n=g.history[i]?.gains[p.seat]??0;return `<span class="${n?'is-win':'is-miss'}">${n||'—'}</span>`;}).join('')}</div>`).join('')}</div><p>止まった瞬間、金席をつかめ！ 次は誰が玉座をつかむ？</p></div>`;}
export function bursts584(r,g,u,at){
 const x=r.ctx,w=r.w,h=r.h;
 for(const ch of g.chairs){if(!ch.gold)continue;const p=chairLocation584(g,ch.id),cx=p.x*w,cy=(p.y+.115)*h,charge=1;
  const glow=x.createRadialGradient(cx,cy,0,cx,cy,w*.22);glow.addColorStop(0,ch.owner!=null?'#ffdc9233':'#ffdc921c');glow.addColorStop(1,'#ffd89100');x.fillStyle=glow;x.fillRect(cx-w*.22,cy-w*.22,w*.44,w*.44);
  if(g.stage==='grab'&&ch.owner==null){x.save();x.strokeStyle='#fce1a333';x.lineWidth=3;x.beginPath();x.ellipse(cx,cy,w*.12,h*.025,0,0,Math.PI*2);x.stroke();if(chairOpen584(g,ch,at)){x.strokeStyle='#ffe4a6';x.shadowColor='#f7c259';x.shadowBlur=10;x.beginPath();x.ellipse(cx,cy,w*.12,h*.025,0,-Math.PI/2,-Math.PI/2+Math.PI*2*charge);x.stroke();}x.restore();}
 }
 r.rings??=[];for(const e of g.events){if(e.id<=(r.polishSeen??0))continue;r.polishSeen=e.id;if(!u.reduced&&at-e.at<1000&&['sit','miss','shuffle'].includes(e.type)){r.rings.push({...e,point:e.chair!=null?chairLocation584(g,e.chair):{x:.5,y:.56}});}}
 r.rings=r.rings.filter(e=>at-e.at<900).slice(-12);
 for(const e of r.rings){const t=(at-e.at)/900;if(t<0)continue;const p=e.point;x.save();x.globalAlpha=(1-t)*.75;x.strokeStyle=e.type==='sit'?color(g.players[e.seat]):e.type==='miss'?'#ffbba1':'#e6cf9d';x.lineWidth=3*(1-t)+1;x.beginPath();x.ellipse(p.x*w,(p.y+.03)*h,w*(.06+t*.17),h*(.02+t*.045),0,0,Math.PI*2);x.stroke();if(e.type==='sit'&&e.gold){x.strokeStyle='#ffe7a3';for(let i=0;i<12;i++){const a=i*Math.PI/6;x.beginPath();x.moveTo(p.x*w+Math.cos(a)*w*.08,(p.y+.02)*h+Math.sin(a)*h*.08);x.lineTo(p.x*w+Math.cos(a)*w*(.10+t*.09),(p.y+.02)*h+Math.sin(a)*h*(.10+t*.08));x.stroke();}}x.restore();}
}
