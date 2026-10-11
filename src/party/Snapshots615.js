// Sample by simulation time, never restart a 50ms animation on packet arrival.
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function rememberSnapshot615(u,g,at){
 if(!Number.isFinite(g?.serverAt))return;
 const id=g.id+':'+g.round;
 let s=u.snapshots615;if(!s||s.id!==id)s=u.snapshots615={id,frames:[],ages:[],last:undefined,time:undefined};
 const frames=s.frames,last=frames.at(-1);
 if(last&&g.serverAt<last.serverAt)return;
 if(last?.serverAt===g.serverAt){frames[frames.length-1]=g;return;}
 frames.push(g);if(frames.length>32)frames.shift();
 s.ages.push(clamp(at-g.serverAt,0,500));if(s.ages.length>40)s.ages.shift();
}
export function snapshotPair615(u,at){
 const s=u.snapshots615,frames=s?.frames;if(!frames?.length)return null;
 const ages=[...s.ages].sort((a,b)=>a-b),delay=clamp((ages[Math.floor((ages.length-1)*.9)]??0)+65,75,240),target=at-delay;
 if(s.time==null||at-s.last>1000){s.time=target;}else{
  const dt=Math.max(0,at-s.last),advance=dt+clamp(target-(s.time+dt),-dt*.1,dt*.1);s.time+=advance;
 }
 // Hold at the last available snapshot on an underrun. Letting the
 // playhead run ahead made the next packet teleport non-predicted objects.
 s.time=Math.min(s.time,frames.at(-1).serverAt);
 s.last=at;const time=s.time,first=frames[0],last=frames.at(-1);
 if(time<=first.serverAt)return {a:first,b:first,f:0,time:first.serverAt};
 for(let i=1;i<frames.length;i++)if(time<=frames[i].serverAt){const a=frames[i-1],b=frames[i];return{a,b,f:(time-a.serverAt)/(b.serverAt-a.serverAt),time};}
 return {a:last,b:last,f:0,time:last.serverAt};
}
export function interpolate615(pair,collection,id,key='seat'){
 if(!pair)return null;
 const a=pair.a[collection]?.find(p=>p[key]===id),b=pair.b[collection]?.find(p=>p[key]===id);
 if(!a||!b)return null;
 if(a.alive!==b.alive||a.status!==b.status||a.motionEpoch600!==b.motionEpoch600||a.respawnAt||b.respawnAt||a.waiting!==b.waiting||a.paused!==b.paused)return null;
 const result={...b};for(const key of ['x','y'])if(Number.isFinite(a[key])&&Number.isFinite(b[key]))result[key]=a[key]+(b[key]-a[key])*pair.f;return result;
}
