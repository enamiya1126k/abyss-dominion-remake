import {spikes595,steam596} from './Art595.js';
import {hazard589} from './Courses589.js';
import {image602,centered602,strip602,switch602,wall602} from './Art602.js';
export function backdrop589(){} // Backdrops are decoded paintings in World593.
export function scenery589(c,g,course,left,right,at){
 const visible=s=>s.x+(s.w??45)>left&&s.x<right;c.save();
 for(const wind of course.winds.filter(visible)){
  c.save();c.beginPath();c.rect(wind.x,wind.y,wind.w,wind.h);c.clip();c.globalAlpha=.34;
  for(let i=0;i<6;i++){const dir=Math.sign(wind.speed),x=wind.x+((at*.06*dir+i*83)%(wind.w+90)+wind.w+90)%(wind.w+90)-45,y=wind.y+25+i*37%wind.h;c.save();c.translate(x,y);c.scale(dir,1);image602(c,'wind-streak',-35,-5,70,10);c.restore();}c.restore();
 }
 for(const b of course.belts.filter(visible))strip602(c,'bridge',b.x,b.y,b.w,16,88,at/1000*b.speed);
 for(const w of course.walls.filter(visible))wall602(c,w);
 for(const b of course.bridges.filter(visible)){
  const on=g.switches.includes(b.id);
  if(on){strip602(c,'bridge',b.x,b.y-1,b.w,32,195);const event=g.events.findLast(e=>e.type==='switch'&&e.switchId===b.id),age=event?at-event.at:9999;if(age>=0&&age<850){c.save();c.globalAlpha=1-age/850;centered602(c,'spark',b.x+age/850*b.w,b.y,25);c.restore();}}
  else {c.save();c.globalAlpha=.8;image602(c,'chain',b.x+6,b.y+2,6,44);image602(c,'chain',b.x+b.w-12,b.y+2,6,44);c.restore();}
 }
 for(const s of [...course.switches,...(course.switchAccess602??[])].filter(visible))switch602(c,s,g.switches.includes(s.id),at);
 for(const p of course.platforms.filter(p=>p.crumble&&visible(p))){
  const start=g.crumbles[p.id],age=start==null?-1:g.elapsed-start;if(age<0||age>=1100)continue;
  c.save();c.globalAlpha=Math.min(.75,age/900);for(let i=0;i<3;i++)centered602(c,'spark',p.x+15+i*27,p.y+30+(at/14+i*9)%19,6,8);c.restore();
 }
 for(const h of course.hazards.filter(visible)){
  if(h.kind==='spikes'){spikes595(c,h);continue;}
  const state=hazard589(h,g.elapsed);if(g.ventsOff?.[h.id]>g.serverAt){state.active=false;state.warning=false;}
  if(h.wide){for(let x=0;x<h.w;x+=54)steam596(c,{...h,x:h.x+x,w:Math.min(54,h.w-x)},state,at);}
  else steam596(c,h,state,at);
 }
 c.restore();
}
