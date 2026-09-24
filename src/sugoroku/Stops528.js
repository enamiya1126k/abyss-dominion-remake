import {NODES463} from './Board463.js';
import {greedMultiplier528} from './Greed528.js';
export const mustStop528=(p,node)=>node?.kind==='gate'&&!p?.visited469?.includes(node.id);
// Enumerate public routes. Stop at the same first-visit gates as the authoritative engine.
export function moveRoutes528(p,steps){
 const limit=Math.max(0,Math.trunc(steps)),result=[];
 function walk(id,left,path){const node=NODES463[id];if(!node)return;
  if(!left||!node.next.length||path.length>1&&mustStop528(p,node)){result.push({id,steps:limit-left,left,stop:path.length>1&&mustStop528(p,node),path});return;}
  for(const next of node.next)walk(next,left-1,[...path,next]);
 }
 walk(p.pos,Math.min(200,limit),[p.pos]);return result;
}
export function nextStops528(p){return moveRoutes528(p,100).filter(r=>r.stop);}
export function cardStops528(p,card){
 const e=card?.effects?.find(e=>['move','direct'].includes(e.type)&&e.n>0&&(!e.target||e.target===p.playerId));
 if(!e)return null;const steps=e.n*greedMultiplier528(p,e);return{steps,routes:moveRoutes528(p,steps)};
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function stopNotice528(p,card){
 if(!p)return'';const preview=card?cardStops528(p,card):null;
 const routes=card?(preview?.routes??[]):nextStops528(p);
 const stopped=routes.filter(r=>r.stop&&(card?r.left>0:true));if(!stopped.length)return'';
 const ids=[...new Set(stopped.map(r=>r.id))],distances=stopped.map(r=>r.steps),min=Math.min(...distances),max=Math.max(...distances),distance=min===max?String(min):`${min}〜${max}`;
 const first=stopped[0],title=card?`${preview.steps}マス進む → ${distance}マス先で初回停止`:`あと${distance}マスで初回停止`;
 const all=stopped.length===routes.length;
 return`<div class="sg-stop-notice528" role="note"><span aria-hidden="true">STOP</span><div><b>${esc(title)}</b><small>${ids.map(id=>esc(NODES463[id].name)).join(' ／ ')}${!all?'（選ぶ進路による）':''} · ${card&&all&&min===max?`残り${first.left}マスは消える`:'残りの移動は繰り越さない'}</small></div></div>`;
}
export function gateBadge528(p,node){if(node.kind!=='gate')return'';const active=mustStop528(p,node);return`<g class="sg-gate-badge528 ${active?'is-stop':'is-cleared'}" aria-hidden="true"><rect x="-65" y="-79" width="130" height="30" rx="8"/><text x="0" y="-59" text-anchor="middle">${active?'初回 STOP':'通過 OK'}</text></g>`;}
