// Shared reading time for server scheduling and client presentation. Reduced motion keeps reading time.
export function duration465(e){
 if(e.kind==='awaken')return 5800;
 if(e.kind==='draw')return 2400;
 if(e.kind==='card')return 4800;
 if(e.kind==='dice')return 3000;
 if(e.kind==='effect')return 1900;
 if(e.kind==='move')return Math.max(1200,Math.min(5200,450*(e.path465?.length??2)));
 return 1600;
}
export function schedule465(g,now,afterId){
 const events=(g.presentation464??[]).filter(e=>e.id>afterId);let at=now+250;
 for(const e of events){e.duration465=duration465(e);e.startAt465=at;at+=e.duration465+250;}
 g.presentationUntil465=events.length?at:now;
 g.nextAutoAt=Math.max(now+2000,g.presentationUntil465+1200);
 g.deadline=g.presentationUntil465+75000;
}
