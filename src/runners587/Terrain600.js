// Shared collision and artwork timing. A falling ledge remains rideable.
export const CRUMBLE600={shake:1100,fall:2600,reset:6200};
export function crumble600(start,elapsed){
 const age=start==null?-1:elapsed-start,t=Math.max(0,age-CRUMBLE600.shake)/1000;
 return {age,shake:age<0?0:Math.min(1,age/CRUMBLE600.shake),fall:35*t+17.5*t*t,
  falling:age>=CRUMBLE600.shake&&age<CRUMBLE600.shake+CRUMBLE600.fall,
  absent:age>=CRUMBLE600.shake+CRUMBLE600.fall&&age<CRUMBLE600.reset};
}
export function cameraFloor605(course,x){
 const room=course.secrets600?.find(s=>x>s.left-20&&x<s.right+20);
 return room?.floor??Math.max(300,...course.grounds.filter(([a,b])=>x>=a&&x<=b).map(g=>g[2]??300));
}
// Leave enough room to fall below a portrait viewport before recording a death.
export const fallLimit600=(course,x)=>cameraFloor605(course,x)+420;
