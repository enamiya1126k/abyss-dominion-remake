// A monotonic render/input clock. Packet arrival jitter must not move game time.
export function syncClock595(c,serverNow,received=performance.now()){
 const u=c.runnersUI587,g=c.state?.runners;if(!u||!g||!Number.isFinite(serverNow))return;
 const id=g.id+':'+g.round;let t=u.timeline595;
 if(!t||t.id!==id){u.timeline595={id,offset:serverNow-received,samples:[serverNow-received],last:serverNow};return;}
 const sample=serverNow-received;t.samples.push(sample);if(t.samples.length>40)t.samples.shift();
 // The freshest delivery gives the least delayed estimate. Slew, never snap.
 const delta=Math.max(...t.samples)-t.offset;
 t.offset+=Math.abs(delta)>1000?delta:Math.max(-.5,Math.min(1,delta));
}
export function clock595(c,now=performance.now()){
 const u=c.runnersUI587;if(!u)return Date.now()+(c.offset??0);
 const g=c.state?.runners;
 if(!u.timeline595||u.timeline595.id!==g?.id+':'+g?.round)syncClock595(c,c.state?.serverNow??g?.serverAt??Date.now(),now);
 const t=u.timeline595;if(!t)return Date.now();return t.last=Math.max(t.last,now+t.offset);
}
