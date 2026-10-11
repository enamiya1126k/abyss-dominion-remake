// One presentation clock for every party game, including older views that use
// Date.now() + c.offset. Authoritative simulation timestamps stay untouched.
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const perf=()=>performance.now();
const games=['runners','walls','chairs','sushi','elevator','lava','crane','ricochet','cart','bomb','tetra','hide','fishing','sumo','tower'];
function timeline(c){return c.realtime615??={samples:[],pings:[],pending:new Map(),serial:0,nextProbe:0,initialized:false};}
export function syncPartyClock615(c,serverNow,received=perf()){
 if(!Number.isFinite(serverNow)||!Number.isFinite(received))return;
 const t=timeline(c),sample=serverNow-received;
 if(!t.initialized){Object.assign(t,{initialized:true,offset:sample,target:sample,lastAt:received,last:serverNow});}
 t.samples=t.samples.filter(s=>received-s.at<5000);t.samples.push({at:received,offset:sample});if(t.samples.length>120)t.samples.shift();
 t.pings=t.pings.filter(s=>received-s.at<30000);
 const best=t.pings.reduce((a,b)=>!a||b.rtt<a.rtt?b:a,null);
 t.target=best?best.offset:Math.max(...t.samples.map(s=>s.offset));
}
export function partyClock615(c,now=perf()){
 const t=timeline(c);if(!t.initialized)return Date.now();
 const dt=Math.max(0,now-t.lastAt);
 // Slew by at most 3%, independent of frame rate and packet frequency.
 t.offset+=clamp(t.target-t.offset,-dt*.03,dt*.03);t.lastAt=Math.max(t.lastAt,now);
 return t.last=Math.max(t.last,now+t.offset);
}
export function installRealtime615(c){
 const t=timeline(c);if(t.installed)return;t.installed=true;
 Object.defineProperty(c,'offset',{configurable:true,enumerable:true,
  get:()=>partyClock615(c)-Date.now(),
  set:value=>{if(Number.isFinite(value))syncPartyClock615(c,Date.now()+value);}
 });
}
export function resetRealtime615(c){
 const installed=c.realtime615?.installed,serial=c.realtime615?.serial??0;
 c.realtime615={installed,serial,samples:[],pings:[],pending:new Map(),nextProbe:0,initialized:false};
}
export function probeClock615(c,now=perf()){
 const t=timeline(c);
 if(!c.root||!c.connected?.()||!c.state||now<t.nextProbe)return;
 for(const [token,sent] of t.pending)if(now-sent>5000)t.pending.delete(token);
 // The existing clock echo is available on Build613 servers. Negative tokens
 // distinguish these probes from the cabbage game's own clock requests.
 const token=-(++t.serial);t.pending.set(token,now);
 if(c.raw('cabbageClock484',{clientSent:token})===false)t.pending.delete(token);
 t.nextProbe=now+(t.pings.length<3?500:3000);
}
export function clockReply615(c,m,received=perf()){
 if(m.type!=='cabbageClock484'||m.selfId!==c.transport.selfId)return false;
 const t=timeline(c),sent=t.pending.get(m.clientSent);if(sent==null)return false;
 t.pending.delete(m.clientSent);const rtt=received-sent;
 if(rtt<0||rtt>2000||!Number.isFinite(m.serverNow))return true;
 t.pings.push({at:received,rtt,offset:m.serverNow-(sent+received)/2});
 if(t.pings.length>16)t.pings.shift();syncPartyClock615(c,m.serverNow,received);return true;
}
// A status response must not rewind a newer live frame. Keep receipts, party
// membership and explicit nulls (leaving a game) from the full response.
export function mergeRealtime615(c,message){
 let result=message;
 for(const key of games){const old=c.state?.[key],next=message[key];
  if(old&&next&&old.id===next.id&&Number.isFinite(old.serverAt)&&Number.isFinite(next.serverAt)&&
   (next.serverAt<old.serverAt||next.serverAt===old.serverAt&&(next.revision??0)<(old.revision??0))){
   if(result===message)result={...message};result[key]=old;
  }
 }
 return result;
}
