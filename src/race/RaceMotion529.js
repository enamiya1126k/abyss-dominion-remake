// Presentation never decides finishing order, boosts or rewards.
export function noteRace529(c,room,serverNow){
 if(!room?.live456)return;
 const previous=c.raceMotion529;
 c.raceMotion529={id:room.id,live:room.live456,at:performance.now(),
  lag:Math.max(0,Math.min(400,serverNow-room.startAt-room.live456.elapsed)),
  serverNow,positions:previous?.id===room.id?previous.positions:null,last:previous?.last,drawAt:previous?.drawAt};
}
export function raceFrame529(c,m){
 const r=c.state?.room;
 if(m.selfId!==c.transport.selfId||!r||r.id!==m.raceId||r.phase!=='race'||!m.live456)return false;
 const old=c.raceMotion529;
 if(m.serverNow<(old?.serverNow??0)||m.live456.elapsed<(r.live456?.elapsed??0))return false;
 r.live456=m.live456;r.finishMs=m.finishMs;
 noteRace529(c,r,m.serverNow);
 const pending=c.boostPending456,index=r.racers.findIndex(x=>x.ownerId===c.transport.selfId);
 if(pending?.raceId===r.id&&m.live456.runners[index]?.boostSeq>=pending.seq)c.boostPending456=null;
 return true;
}
export function raceTime529(c,r,fallback){
 const t=c.raceMotion529;
 return t?.id===r.id&&t.live===r.live456?r.startAt+r.live456.elapsed+t.lag+Math.max(0,performance.now()-t.at):fallback;
}
export function smoothFrame529(c,r,frame){
 if(r.rulesVersion<4||r.phase!=='race')return frame;
 if(c.raceMotion529?.id!==r.id)noteRace529(c,r,Date.now()+(c.offset??0));
 const t=c.raceMotion529;if(!t)return frame;
 const now=performance.now(),dt=Math.max(0,Math.min(100,now-(t.last??now))),alpha=1-Math.exp(-dt/80);
 const old=t.positions;t.last=now;t.positions={};
 for(const v of frame.positions){const before=old?.[v.i];
  // Ease corrections and never run backwards on an ordinary course. A resumed
  // hidden tab catches up immediately instead of spending seconds interpolating.
  const snap=!old||now-(t.drawAt??now)>1000||v.finished;
  v.p=t.positions[v.i]=snap?v.p:Math.max(before??0,(before??v.p)+(v.p-(before??v.p))*alpha);
 }
 t.drawAt=now;
 frame.positions.sort((a,b)=>b.p-a.p||(r.live456.runners[a.i].finishMs??Infinity)-(r.live456.runners[b.i].finishMs??Infinity)||a.i-b.i);
 frame.leader=frame.positions[0];return frame;
}
