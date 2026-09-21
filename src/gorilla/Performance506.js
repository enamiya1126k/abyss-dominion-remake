// Only structural changes need to rebuild the play DOM. Every authoritative
// gameplay update still reaches the existing canvas, controls and hit testing.
export function gorillaSignature506(g){
 if(!g||g.rules505!==1||['lobby','result'].includes(g.phase))return g;
 return{id:g.id,rules505:g.rules505,phase:'play',players:g.players.map(p=>({playerId:p.playerId,seat:p.seat,name:p.name,choice:p.choice,color499:p.color499,ai:p.ai}))};
}
export function liveFrame506(g,at,reduced){
 const age=at-(g.phaseAt503??at);
 if(g.phase==='focus')return!reduced&&age<650;
 if(g.phase==='reaction')return!reduced&&!g.events.at(-1)?.mercy504&&age<700;
 if(g.phase==='pluck')return!reduced&&age<850;
 if(g.phase==='pinch')return!reduced&&age<850;
 if(g.phase==='drum')return at-(g.drumAt504??at)<4000;
 if(g.phase==='blast')return at-(g.blastAt??at)<5000;
 return false;
}
export function sceneKey506(g,u,w,h,pw,ph){const e=g.events.at(-1);return[g.id,g.phase,g.phaseAt503,g.startAt,g.drumAt504,g.blastAt,g.painOffset505,g.turnSeat,g.picked.join(','),e?.seq,e?.hair,e?.spot505,e?.mercy504,e?.playerId,g.players.map(p=>p.color499).join(','),u.pending?.kind,u.pending?.hair,!!u.reduced,w,h,pw,ph].join('|')}
export function property506(el,key,value){if(el&&el[key]!==value)el[key]=value}
const styles506=new WeakMap();
export function style506(el,key,value){if(!el)return;let values=styles506.get(el);if(!values){values=Object.create(null);styles506.set(el,values)}if(values[key]===value)return;values[key]=value;if(el.style[key]!==value)el.style[key]=value}
