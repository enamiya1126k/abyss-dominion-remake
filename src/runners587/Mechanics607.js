// Shared by rendering and the authoritative simulation. No wall-clock roulette.
export const ELEMENT_CYCLE607=['fire','wind','ice','thunder','stone','water'];
export function pickupKind607(item,elapsed){let offset=0;for(const ch of item.id??'')offset=(offset+ch.charCodeAt(0))%6;return ELEMENT_CYCLE607[(Math.floor(Math.max(0,elapsed)/100)+offset)%6];}
export const hubSurface607=h=>({id:'hub607:'+h.id,x:h.x-14,y:h.y-12,w:28,h:24,oneWay:true,hub607:true});
export const onHub607=(p,h)=>p.grounded&&p.platformId==='hub607:'+h.id&&Math.abs(p.y-(h.y-12))<1;
