// Use the front of the physical cart for both the bonus and the fall boundary.
// The gold bonus continues beyond the far line; risk can never lower a safe score.
export const PARKING557=Object.freeze({edge:30,radius:.58,stopSpeed:.06,extra:50});
export const GOLD557=Object.freeze({from:26.9,to:29.3,bonus:50});
const NONE=Object.freeze({kind:'none',gold:0,edge:0,bonus:0,progress:0});
export function parking557(p,radius=PARKING557.radius){
 if(!p?.launched||p.fallenAt!=null||!Number.isFinite(p.y)||Math.hypot(p.vx,p.vy)>=PARKING557.stopSpeed)return NONE;
 const front=p.y+radius,back=p.y-radius;
 if(front>=PARKING557.edge||back<GOLD557.from-1e-9)return NONE;
 const progress=Math.max(0,Math.min(1,(front-GOLD557.to)/(PARKING557.edge-GOLD557.to))),edge=Math.round(progress*PARKING557.extra);
 return{kind:front>GOLD557.to+1e-9?'edge':'gold',gold:GOLD557.bonus,edge,bonus:GOLD557.bonus+edge,progress};
}
