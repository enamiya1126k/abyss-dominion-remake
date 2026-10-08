// A foreground request survives a closed socket and is retried until applied.
// Sending a packet is not an acknowledgement; inputSeq only means queued.
export function presence599(c,pause,{force=false,now=performance.now()}={}){
 const g=c.state?.runners,u=c.runnersUI587;
 if(!g||!u)return false;
 if(u.presenceGame599!==g.id){u.presenceGame599=g.id;u.presencePending599=null;u.pauseWanted599=null;}
 if(typeof pause==='boolean'&&pause!==u.pauseWanted599){u.pauseWanted599=pause;u.presencePending599=null;force=true;}
 const p=g.players.find(p=>p.playerId===c.transport.selfId),wanted=u.pauseWanted599;
 if(typeof wanted!=='boolean'||!p||g.phase!=='play'||g.stage!=='run'||p.finishTime!=null||p.departed)return false;
 let pending=u.presencePending599;
 if(pending&&(p.processedSeq??p.lastSeq)>=pending.seq&&p.paused===wanted){u.presencePending599=null;pending=null;}
 if(!force&&!pending&&p.paused===wanted)return true;
 if(!c.connected()||!c.ready())return false;
 if(!force&&pending?.socket===c.transport.ws&&now-pending.sentAt<250)return false;
 u.seq=Math.max(u.seq??0,p.lastSeq??0);
 const seq=++u.seq,sent=c.raw('runnersInput587',{gameId:g.id,round:g.round,seq,action:'control',target:{axis:0,jump:false,attack:false,pause:wanted}});
 if(sent===false)return false;
 u.presencePending599={seq,sentAt:now,socket:c.transport.ws};return true;
}
