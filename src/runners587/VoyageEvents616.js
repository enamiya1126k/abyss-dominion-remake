import {SHIP_ROUTES616,depart616,shipPose616,deckRock616} from './VoyagePath616.js';
// Fixed installations are activated by the vessel passing them, not by a room-wide timetable.
export const VOYAGE_EVENTS616=[
 {id:'boarding-party',leg:1,x:3200,kind:'enemy',warning:1100},
 {id:'second-boarder',leg:1,x:3460,kind:'enemy',warning:1100},
 {id:'deck-boulder',leg:1,x:3700,kind:'rock',warning:1300},
 {id:'sky-boarder',leg:2,x:5780,kind:'enemy',warning:1100},
 {id:'last-boulder',leg:2,x:6830,kind:'rock',warning:1300}
];
const active=p=>p.alive&&!p.waiting&&!p.paused&&!p.departed&&!p.respawnAt&&p.finishTime==null;
export function voyageEvents616(g,emit,hurt){
 const s=g.ship609;s.triggered616??={};s.warnings616??=[];s.rocks616??=[];
 for(const e of VOYAGE_EVENTS616){
  const r=SHIP_ROUTES616[e.leg],depart=depart616(g,r.id);if(depart==null||s.triggered616[e.id])continue;
  const b=shipPose616(r,g.elapsed,depart);if(b.x<e.x)continue;
  s.triggered616[e.id]=true;const at=g.elapsed+e.warning,landAt=at+800,landing=shipPose616(r,landAt,depart),launch=shipPose616(r,at,depart);
  s.warnings616.push({...e,route:r.id,depart,at,landAt,dropX:landing.x+150,fromY:landing.y-200,landY:landing.y,x:e.kind==='rock'?launch.x+r.w+42:landing.x+150,y:e.kind==='rock'?launch.y-125:landing.y-200});
  emit(g,'voyage-warning',{kind:e.kind,x:e.x});
 }
 for(const q of s.warnings616){if(g.elapsed<q.at)continue;
  if(q.kind==='rock')s.rocks616.push({id:q.id,route:q.route,depart:q.depart,at:q.at});
  else g.enemies.push({id:'voyage-drop-'+q.id,x:q.dropX,y:q.fromY,min:0,max:170,speed:65,downUntil:0,deck616:{route:q.route,depart:q.depart,born:q.at,landAt:q.landAt,dropX:q.dropX,fromY:q.fromY,landY:q.landY,localX:150}});
  emit(g,q.kind==='rock'?'voyage-rock':'voyage-boarder',{x:q.x,y:q.y});
 }
 s.warnings616=s.warnings616.filter(q=>g.elapsed<q.at);
 for(const q of s.rocks616){const rock=deckRock616(q,g.elapsed);if(!rock)continue;
  for(const p of g.players.filter(active)){const nearY=Math.max(p.y-28,Math.min(p.y,rock.y));if(Math.hypot(p.x-rock.x,nearY-rock.y)<rock.r+9)hurt?.(g,p,'voyage-boulder',rock.x);}
 }
 s.rocks616=s.rocks616.filter(q=>g.elapsed<q.at+2300);
}
