import {LUCK511} from './Rules511.js';

// Presentation only. The server's metres, phases and 4.8-second run are unchanged.
export const WORLDS512 = Object.freeze([
  {id:'stadium', name:'王立競技場', from:0n, milestone:'START', src:'./assets/luck508/course.png'},
  {id:'forest', name:'大森林と滝', from:10000n, milestone:'1万m', src:'./assets/luck512/forest.png'},
  {id:'desert', name:'砂漠の古代遺跡', from:100000n, milestone:'10万m', src:'./assets/luck512/desert.png'},
  {id:'sky', name:'天空都市', from:1000000n, milestone:'100万m', src:'./assets/luck512/sky.png'},
  {id:'stratosphere', name:'成層圏', from:10000000n, milestone:'1000万m', src:'./assets/luck512/stratosphere.png'},
  {id:'space', name:'宇宙', from:100000000n, milestone:'1億m', src:'./assets/luck512/space.png'},
  {id:'galaxy', name:'銀河の彼方', from:1000000000n, milestone:'10億m', src:'./assets/luck512/galaxy.png'}
].map(world=>Object.freeze({...world,src:new URL('../../'+world.src.slice(2),import.meta.url).href})));
const clamp=x=>Math.max(0,Math.min(1,x)), Q=1000000n, P=1000000000000n;
const fast=new Set(['rocket','turbo','comet','mega','jackpot']);
const routes=new WeakMap();
export function worldIndex512(metres){
  const n=BigInt(metres??0);
  for(let i=WORLDS512.length-1;i>0;i--)if(n>=WORLDS512[i].from)return i;
  return 0;
}
// Inverse of Presentation510's exact fixed-point movement curve. Never changes it.
function crossingTime(row, boundary){
  const from=BigInt(row.from),to=BigInt(row.to),forward=to>from;
  let lo=0,hi=1;
  for(let i=0;i<46;i++){
    const mid=(lo+hi)/2,t=fast.has(row.item)?clamp((mid-.1)/.86):mid;
    const k=BigInt(Math.round(t*t*(3-2*t)*Number(P)));
    const here=from*Q+(to-from)*Q*k/P;
    if(forward?here>=boundary*Q:here<boundary*Q)hi=mid;else lo=mid;
  }
  return hi*LUCK511.runMs;
}
export function worldRoute512(row){
  if(routes.has(row))return routes.get(row);
  const start=worldIndex512(row.from),end=worldIndex512(row.to),direction=end>=start?1:-1;
  const route=[{index:start,at:0}];
  for(let next=start+direction;direction>0?next<=end:next>=end;next+=direction){
    const threshold=WORLDS512[direction>0?next:next+1].from;
    // Keep sub-frame world crossings readable. A late boundary is never anticipated.
    // Any remaining fade is clipped at run end; no queued cinematic or extra phase.
    const previous=route.at(-1),earliest=route.length===1?0:previous.at+280;
    route.push({index:next,at:Math.min(LUCK511.runMs,Math.max(earliest,crossingTime(row,threshold)))});
  }
  const frozen=Object.freeze(route.map(Object.freeze));routes.set(row,frozen);return frozen;
}
export function sceneryFrame512(g,at,raceFrame,reduced=false){
  const actual=worldIndex512(raceFrame.focusQ/Q),row=g.event?.rows[raceFrame.focusSeat];
  const still=index=>({from:index,to:index,blend:0,index,warp:0});
  if(g.phase!=='run'||!row||reduced)return still(actual);
  const elapsed=Math.max(0,at-g.phaseAt);
  if(elapsed>=LUCK511.runMs)return still(worldIndex512(row.to));
  const route=worldRoute512(row);
  let step=0;while(step+1<route.length&&elapsed>=route[step+1].at)step++;
  if(!step)return still(route[0].index);
  const current=route[step],previous=route[step-1],duration=Math.min(180,LUCK511.runMs-current.at);
  const k=duration>0?clamp((elapsed-current.at)/duration):1,blend=k*k*(3-2*k);
  if(k===1)return still(current.index);
  return {from:previous.index,to:current.index,blend,index:blend<.5?previous.index:current.index,warp:Math.sin(Math.PI*k)*.15};
}

// Six images maximum, two concurrent downloads. No request, decode or timer per frame.
// Core game art has its own readiness gate: these backgrounds never delay play.
export function createSceneryLoader512({ImageClass=globalThis.Image,setTimer=setTimeout,clearTimer=clearTimeout}={}){
  const records=WORLDS512.map((_,i)=>({status:i?'idle':'ready',image:null,cancel:null}));
  const listeners=new Set();let queue=[],active=0;
  const notify=()=>{for(const f of listeners)f()};
  function pump(){
    if(typeof ImageClass!=='function'||!listeners.size)return;
    while(active<2&&queue.length){
      const index=queue.shift(),r=records[index];if(r.status!=='idle')continue;
      const image=new ImageClass();r.image=image;r.status='loading';active++;
      let done=false,timer;
      const finish=ok=>{
        if(done)return;done=true;clearTimer(timer);image.onload=image.onerror=null;r.cancel=null;active--;
        r.status=ok?'ready':'failed';if(!ok)r.image=null;notify();pump();
      };
      r.cancel=()=>{if(done)return;done=true;clearTimer(timer);image.onload=image.onerror=null;image.src='';r.image=null;r.status='idle';r.cancel=null;active--};
      timer=setTimer(()=>finish(false),15000);
      image.onload=()=>{if(image.decode)Promise.resolve().then(()=>image.decode()).then(()=>finish(image.naturalWidth>0),()=>finish(false));else finish(image.naturalWidth>0)};
      image.onerror=()=>finish(false);image.decoding='async';image.src=WORLDS512[index].src;
    }
  }
  return {
    status:index=>records[index]?.status??'failed',
    subscribe(fn){listeners.add(fn);return()=>{listeners.delete(fn);if(!listeners.size){queue=[];for(const r of records)r.cancel?.()}}},
    preload(priority=[]){
      const all=[...priority,...WORLDS512.map((_,i)=>i)];
      queue=[...new Set(all)].filter(i=>i>0&&records[i]?.status==='idle');pump();
    },
    retry(){for(const r of records)if(r.status==='failed')r.status='idle';this.preload()}
  };
}
let sharedLoader;
export const sceneryLoader512=()=>sharedLoader??=createSceneryLoader512();

export function sceneryMarkup512(){return `<div class="lk-world512" data-world-slot512="0" data-world512="stadium" aria-hidden="true"><div class="lk-course508" data-ground511></div><div class="lk-course508 lk-horizon508" data-horizon511></div><div class="lk-near511" data-near511></div><div class="lk-lanes512"></div></div><div class="lk-world512" data-world-slot512="1" hidden aria-hidden="true"><div class="lk-course508" data-world-ground512></div><div class="lk-course508 lk-horizon508" data-world-horizon512></div><div class="lk-near511" data-world-near512></div><div class="lk-lanes512"></div></div><div class="lk-world-warp512" data-world-warp512 aria-hidden="true"></div><small class="lk-world-label512" data-world-label512></small>`}
export function sceneryNodes512(root){
  const q=s=>root.querySelector(s);
  return {slots:[0,1].map(i=>({el:q(`[data-world-slot512="${i}"]`),layers:['ground','horizon','near'].map(id=>q(i?`[data-world-${id}512]`:`[data-${id}511]`))})),label:q('[data-world-label512]'),warp:q('[data-world-warp512]')};
}
export function paintScenery512(nodes,scene,offsets,loader,{style,data,hide,put}){
  const indices=[scene.from,scene.to];
  for(let i=0;i<2;i++){
    const slot=nodes.slots[i],hidden=i===1&&scene.from===scene.to;hide(slot.el,hidden);if(hidden)continue;
    const index=indices[i],world=WORLDS512[index];data(slot.el,'world512',world.id);
    style(slot.el,'--lk-world-image512',loader.status(index)==='ready'?`url("${world.src}")`:'none');
    style(slot.el,'opacity',i?scene.blend.toFixed(4):'1');
    for(let j=0;j<3;j++)style(slot.layers[j],'transform',`translate3d(${-offsets[['ground','horizon','near'][j]].toFixed(2)}px,0,0)`);
  }
  const world=WORLDS512[scene.index];put(nodes.label,world.name+' · '+world.milestone);
  data(nodes.label,'cosmic',scene.index>=4);style(nodes.warp,'opacity',scene.warp.toFixed(4));
}
export function finishScenery512(distance){
  const world=WORLDS512[worldIndex512(distance)];
  return world.id==='stadium'?'':` data-finish-world512="${world.id}" style="background-image:linear-gradient(#101d3866,#101b32ee),url('${world.src}')"`;
}
