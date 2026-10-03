// Authoritative outAt avoids replaying deaths after reconnection.
export function impact590(u,g,self,at){
 for(const p of g.players){
  const el=u.pawns[p.seat],age=p.alive?Infinity:at-p.outAt,active=age>=0&&age<1000;
  el.classList.toggle('is-impact590',active);el.classList.toggle('is-ghost590',!p.alive&&!active);
  if(active&&!u.reduced){const t=Math.min(1,age/850),d=p.outDir??0,dx=[0,0,1,-1][d],dy=[1,-1,0,0][d];el.style.setProperty('--crash-x',`${dx*36*t}px`);el.style.setProperty('--crash-y',`${dy*22*t-42*Math.sin(t*Math.PI)}px`);el.style.setProperty('--crash-turn',`${(d%2?-1:1)*115*t}deg`);el.style.setProperty('--crash-alpha',String(Math.max(.12,1-t*.86)));}
 }
 const age=self&&!self.alive?at-self.outAt:Infinity,active=age>=0&&age<1100;
 u.nodes.impact.hidden=!active;u.nodes.square.classList.toggle('is-crash590',active&&age<280&&!u.reduced);
}
export function burst590(c,g,s,at,reduced){
 for(const e of g.events){const age=at-e.at;if(e.type!=='out'||age<0||age>900)continue;
  const t=age/900,x=e.x*s,y=e.y*s;c.save();c.translate(x,y);c.globalAlpha=1-t;
  c.strokeStyle='#fff0bf';c.lineWidth=3*(1-t)+1;c.beginPath();c.arc(0,0,s*(.025+t*.1),0,Math.PI*2);c.stroke();
  if(!reduced)for(let i=0;i<10;i++){const a=i*Math.PI/5,inner=s*(.018+t*.05),outer=s*(.052+t*.10);c.strokeStyle=i%2?'#ffe7b4':'#ff6f4b';c.beginPath();c.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);c.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);c.stroke();}
  c.font=`900 ${Math.max(15,s*.058)}px sans-serif`;c.textAlign='center';c.lineWidth=5;c.strokeStyle='#49190e';c.strokeText('OUT',0,-s*.055-(reduced?0:t*s*.05));c.fillStyle='#ffdeaf';c.fillText('OUT',0,-s*.055-(reduced?0:t*s*.05));c.restore();
 }
}
