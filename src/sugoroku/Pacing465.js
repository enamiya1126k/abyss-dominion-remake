// Shared event pacing; the client never advances gameplay before the server permits it.
export function duration465(e){
 if(e.kind==='awaken')return 2800;
 if(e.kind==='defense469')return 1700;
 if(e.kind==='draw')return 1350;
 if(e.kind==='card')return e.activation466==='instant'?1600:1400;
 if(e.kind==='dice')return 2200;
 if(e.kind==='effect')return 1000;
 if(e.kind==='move')return Math.max(500,Math.min(2400,140*(e.path465?.length??2)));
 return 1200;
}
export function schedule465(g,now,afterId){
 const events=(g.presentation464??[]).filter(e=>e.id>afterId);let at=now+100;
 for(const e of events){e.duration465=duration465(e);e.startAt465=at;at+=e.duration465;}
 g.presentationUntil465=events.length?at:now;
 g.nextAutoAt=Math.max(now+600,g.presentationUntil465+350);
 g.deadline=g.presentationUntil465+45000;
}
