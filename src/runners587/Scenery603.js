import {image603,sprite603} from './Art603.js';
import {image602,centered602,link602,strip602} from './Art602.js';
import {rune597} from './Elements597.js';
import {saw603,pendulum603,lightning603,cannon603,meteor603,jet603,phase603,platform603} from './Hazards603.js';
export function scenery603(c,g,course,left,right,t,reduced){
 if(!course.expert603)return;const visible=(x,w=40)=>x+w>left&&x-w<right;
 for(const h of course.saws603){if(!visible(h.x,h.range+25))continue;const p=saw603(h,t);link602(c,'chain',h.x-(h.axis==='y'?0:h.range),h.y-(h.axis==='y'?h.range:0),h.x+(h.axis==='y'?0:h.range),h.y+(h.axis==='y'?h.range:0),3);sprite603(c,'saw',p.x,p.y,p.r*2.5,p.r*2.5,reduced?0:p.angle);}
 for(const h of course.pendulums603){if(!visible(h.x,h.length))continue;const p=pendulum603(h,t);link602(c,'chain',h.x,h.y,p.x,p.y-10,5);centered602(c,'ui-button',h.x,h.y,18);sprite603(c,'pendulum',p.x,p.y,63,44,p.angle);}
 for(const h of course.lightning603){if(!visible(h.x))continue;const p=lightning603(h,t);image603(c,'tesla',h.x-22,h.y-32,44,34);
  if(p.active){for(let y=h.y-32;y>h.y-h.h;y-=35)rune597(c,'thunder',h.x+(reduced?0:Math.sin(y+t/45)*3),y,34);}
  else if(p.warning){c.save();c.globalAlpha=.35;centered602(c,'spark',h.x,h.y-39,28);for(let y=h.y-60;y>h.y-h.h;y-=65)rune597(c,'thunder',h.x,y,12);c.restore();}
 }
 for(const h of course.cannons603){if(!visible(h.x,h.range??620))continue;const p=cannon603(h,t);c.save();c.translate(h.x,h.y);c.scale((h.dir??-1)===-1?1:-1,1);image603(c,'cannon',-32,-39,64,39);c.restore();
  if(p.warning){c.save();c.globalAlpha=.6;centered602(c,'spark',h.x+(h.dir??-1)*31,h.y-25,12);c.restore();}if(p.active&&visible(p.x))rune597(c,h.kind??'fire',p.x,p.y,25);
 }
 for(const h of course.meteors603){if(!visible(h.x))continue;const p=meteor603(h,t);if(p.warning){c.save();c.globalAlpha=.45;centered602(c,'arrow',h.x,h.y-45,13,18,Math.PI);centered602(c,'spark',h.x,h.y-2,26,6);c.restore();}
  if(p.active){if(h.kind==='fire')rune597(c,'fire',p.x,p.y,36);else sprite603(c,'icicle',p.x,p.y,16,58);}
 }
 for(const h of course.jets603){if(!visible(h.x,h.w))continue;const p=jet603(h,t);c.save();c.globalAlpha=p.active?.5:p.warning?.25:.1;strip602(c,'bridge',h.x,h.y-4,h.w,10,80);
  for(let i=0;i<7;i++){const age=(t/(h.period*.45)+i/7)%1,y=h.y-age*h.h;if(p.active||p.warning)centered602(c,h.kind==='water'?'water':'wind-streak',h.x+h.w*.5+Math.sin(i*2+t/1100)*h.w*.2,y,h.w*.65,14,-Math.PI/2);}
  c.restore();
 }
 for(const h of course.platforms){if(!h.phase603||!visible(h.x,h.w))continue;const state=phase603(h,t),p={...h,...platform603(h,t)};c.save();c.globalAlpha=!state.solid?.13:state.warning?(reduced?.5:.45+Math.sin(t/80)*.2):1;image603(c,'phase',p.x,p.y-3,p.w,26);c.restore();}
}
