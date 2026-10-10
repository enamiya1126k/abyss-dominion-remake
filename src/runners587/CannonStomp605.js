// Relative feet / projectile-top crossing, shared by authority and prediction.
export function cannonStomp605(p,before,s,elapsed){
 if(s.kind!=='cannon'||s.dead||p.grounded||p.vy<0||(p.frozenUntil604??0)>elapsed||!before)return null;
 const x0=s.oldX??s.x,y0=s.oldY??s.y,from=before.y-(y0-s.r),to=p.y-(s.y-s.r);
 if(from>5||to<0||to<=from)return null;
 const time=Math.max(0,Math.min(1,-from/(to-from))),x=x0+(s.x-x0)*time,y=y0+(s.y-y0)*time;
 if(Math.abs(before.x+(p.x-before.x)*time-x)>s.r+8)return null;
 return {time,x,y:y-s.r};
}
