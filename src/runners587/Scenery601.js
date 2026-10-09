import {active601,starOpen601} from './Coop601.js';
import {artURL602,image602,centered602,link602,switch602} from './Art602.js';
export const starIcon601=filled=>`<img class="ru-star602 ${filled?'is-filled':'is-empty'}" src="${artURL602('star')}" alt="" draggable="false">`;
export function starHud601(course,g){return course.stars601.map(s=>starIcon601(g.stars601?.includes(s.id))).join('');}
export function scenery601(c,g,course,left,right,elapsed,reduced=false){
 const visible=(x,w=70)=>x+w>left&&x-w<right,players=g.players.filter(active601);c.save();
 for(const trial of course.trials601){
  if(!trial.pads.some(p=>visible(p.x,420)))continue;
  const state=g.coop601?.[trial.id],open=state?.open;
  for(const pad of trial.pads){
   const held=players.some(p=>p.grounded&&Math.abs(p.x-pad.x)<=23&&Math.abs(p.y-pad.y)<=5),lit=open||held;
   switch602(c,pad,lit,elapsed,true);
   if(lit&&!open){c.save();c.globalAlpha=.28;link602(c,'wind-streak',pad.x,pad.y-13,trial.reward.x,trial.reward.y,10);c.restore();}
  }
 }
 for(const s of course.stars601){
  if(!visible(s.x)||g.stars601?.includes(s.id))continue;
  const open=starOpen601(g,s),y=s.y+(reduced?0:Math.sin(elapsed/430+s.x)*2);
  c.save();c.globalAlpha=open?1:.5;centered602(c,'star',s.x,y,34,32);c.restore();
  if(!open){link602(c,'chain',s.x-17,y-16,s.x+17,y+16,5);link602(c,'chain',s.x+17,y-16,s.x-17,y+16,5);}
  else if(!reduced){const a=elapsed/1000;centered602(c,'spark',s.x+Math.cos(a)*18,y+Math.sin(a)*17,8);}
 }
 for(const h of course.hints601){if(!visible(h.x,70))continue;
  if(h.kind==='secret'){
   // A small unlit masonry fragment below the lip. No arch, arrow or gem trail.
   c.save();c.globalAlpha=.62;image602(c,'wall',h.x-4,h.y,8,27);c.restore();
  }else{c.save();c.globalAlpha=.45;centered602(c,'arrow',h.x,h.y-7,8,10);c.restore();}
 }
 const checkpoint=g.events.findLast(e=>e.type==='checkpoint'&&elapsed-(e.at-g.startAt)<850);
 if(checkpoint){const cp=course.checkpoints[checkpoint.checkpoint];if(cp&&visible(cp.x)){const age=elapsed-(checkpoint.at-g.startAt);c.save();c.globalAlpha=Math.max(0,1-age/850);centered602(c,'spark',cp.x,cp.y-30,30+age/25);c.restore();}}
 c.restore();
}
