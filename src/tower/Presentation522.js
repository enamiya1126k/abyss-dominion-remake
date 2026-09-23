// Presentation only. The server continues to own collision, speed and outcomes.
export function receiveMotion522(u,g,now){
 let t=u.timeline522;
 if(!t||t.id!==g.id||t.startAt!==g.startAt||now-t.received>1000){
  t=u.timeline522={id:g.id,startAt:g.startAt,at:g.serverAt,mono:now,received:now,offset:g.serverAt-now,samples:[],frames:[]};
 }
 t.samples.push({at:now,offset:g.serverAt-now});
 t.samples=t.samples.filter(s=>now-s.at<=3000).slice(-32);
 // A late packet must not rewind the local clock. Recover drift gradually.
 t.offset=Math.max(...t.samples.map(s=>s.offset));t.received=now;
 const last=t.frames.at(-1);
 if(!last||g.serverAt>last.serverAt)t.frames.push(g);
 else if(g.serverAt===last.serverAt)t.frames[t.frames.length-1]=g;
 t.frames=t.frames.slice(-8);
}
export function motionTime522(u,now){
 const t=u.timeline522;if(!t)return null;
 const dt=Math.max(0,now-t.mono),natural=t.at+dt;
 t.at=natural+Math.max(-dt*.1,Math.min(dt*.1,now+t.offset-natural));t.mono=now;
 return t.at;
}
export function remotePose522(u,player,at){
 const frames=u.timeline522?.frames;if(!frames?.length||!player.alive||player.escaped)return player;
 const target=at-100;let a=frames[0],b=a;
 for(const frame of frames){if(frame.serverAt<=target)a=frame;b=frame;if(frame.serverAt>=target)break;}
 const from=a.players.find(p=>p.playerId===player.playerId),to=b.players.find(p=>p.playerId===player.playerId);
 if(!from||!to||!from.alive||!to.alive)return player;
 const f=Math.max(0,Math.min(1,(target-a.serverAt)/Math.max(1,b.serverAt-a.serverAt)));
 return{...player,x:from.x+(to.x-from.x)*f,y:from.y+(to.y-from.y)*f};
}
export function followPose522(pos,target,dt){
 // Same response at 30, 60 and 120 Hz; also used as the camera's focus.
 const f=dt>0?1-Math.exp(-dt*30.649537):1;
 pos.x+=(target.x-pos.x)*f;pos.y+=(target.y-pos.y)*f;return pos;
}
const values=new WeakMap();
function changed(el,key,value){if(!el)return false;let cache=values.get(el);if(!cache){cache=new Map();values.set(el,cache)}if(cache.get(key)===value)return false;cache.set(key,value);return true}
export function style522(el,key,value){if(changed(el,'s:'+key,value))el.style[key]=value}
export function class522(el,key,value){value=!!value;if(changed(el,'c:'+key,value))el.classList.toggle(key,value)}
export function prop522(el,key,value){if(el&&el[key]!==value)el[key]=value}
export function data522(el,key,value){if(el&&el.dataset[key]!==value)el.dataset[key]=value}
export function attr522(el,key,value){value=String(value);if(changed(el,'a:'+key,value))el.setAttribute(key,value)}
export function variable522(el,key,value){if(changed(el,'v:'+key,value))el.style.setProperty?.(key,value)}
export function guardControls522(root,on){
 // Scoped to this game's live controls; lobby search and other games are unaffected.
 const selector='[data-tw-move520],[data-tw-control517],[data-tw-slot517],.tw-dropcontrols517';
 for(const type of ['contextmenu','selectstart','dragstart','touchstart','touchmove','touchend'])on(root,type,e=>{
  if(e.target?.closest?.(selector)&&e.cancelable!==false)e.preventDefault();
 },{capture:true,passive:false});
}
