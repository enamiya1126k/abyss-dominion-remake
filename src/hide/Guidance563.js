import {gatesOpen559,exits559} from './Heist541.js';
import {goal559} from './Objectives559.js';
import {path537} from './Map537.js';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// Recommendations use only the information in this viewer's public snapshot.
export function nextObjective563(g,p,key){if(!p?.alive||p.hunter||!g.heist541)return null;const chosen=key&&goal559(g,key);if(chosen)return{...chosen,key};const open=gatesOpen559(g.heist541),hunter=g.players.find(q=>q.hunter&&Number.isFinite(q.x)),targets=open?exits559(g.heist541):g.heist541.seals.filter(s=>!s.done);const ordered=targets.map(q=>({...q,key:(open?'gate:':'seal:')+q.id,cost:dist(p,q)+(hunter&&dist(hunter,q)<600?1800:0)})).sort((a,b)=>a.cost-b.cost);return ordered.find(q=>path537(g.map,p,q).length)??ordered[0]??null;}
export function routeGuide563(c,r,g,p,u,at){if(!p?.alive||!u.destination||u.mapOpen||!g.map)return;const key=g.id+':'+Math.round(p.x/100)+','+Math.round(p.y/100)+':'+Math.round(u.destination.x)+','+Math.round(u.destination.y);if(r.guideKey563!==key){r.guideKey563=key;r.guidePath563=path537(g.map,p,u.destination);}const route=r.guidePath563;if(!route?.length)return;c.save();c.beginPath();c.moveTo(p.x,p.y);for(const q of route)c.lineTo(q.x,q.y);c.strokeStyle='#d9fbe2a0';c.lineWidth=5;c.setLineDash([10,22]);c.lineDashOffset=u.reduced?0:-at/45;c.stroke();c.restore();}
