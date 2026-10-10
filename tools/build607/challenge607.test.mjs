import test from 'node:test';import assert from 'node:assert/strict';
import {COURSES589,course589} from '../../src/runners587/Courses589.js';
import {makeRunners587,startRunners587,advanceRunners587} from '../../src/runners587/Rules587.js';
import {stepRunner587,control587} from '../../src/runners587/Physics587.js';
import {surfaces587} from '../../src/runners587/Level587.js';
import {cooperation601} from '../../src/runners587/Coop601.js';
const emit=(g,type,d)=>g.events.push({type,...d});
function game(id){const g=makeRunners587({id:'607',code:'QA',hostId:'p',members:[{playerId:'p',name:'P'},{playerId:'q',name:'Q'}],now:0});g.courseId=id;startRunners587(g,0);for(let t=25;t<=3000;t+=25)advanceRunners587(g,t);g.enemies=[];return g;}
for(const c of COURSES589)test(c.id+' high trial route can be climbed continuously with ordinary solo jumps',()=>{
 const g=game(c.id),tr=c.trials601[0],p=g.players[0];g.coop601[tr.id]={open:true};const a=tr.pads[0];Object.assign(p,{x:a.x,y:a.y,vx:0,vy:0,grounded:true,platformId:null,lastGroundAt:g.lastAt,weapon:null,axis:0});const start=g.lastAt;
 for(const id of tr.route607){let landed=false;control587(p,{axis:0,jump:false,attack:false},g.lastAt);for(let i=0;i<100;i++){
  g.lastAt+=25;g.elapsed+=25;const s=surfaces587(g.elapsed,c,g).find(s=>s.id===id),aim=s.x+s.w/2;control587(p,{axis:p.x<aim-3?1:p.x>aim+3?-1:0,jump:true,attack:false},g.lastAt);stepRunner587(p,g.lastAt,g.elapsed,.025,g);if(p.grounded&&(p.platformId===id||Math.abs(p.y-s.y)<1&&Math.abs(p.x-aim)<26)){landed=true;break;}
 }assert(landed,id+' '+JSON.stringify({x:p.x,y:p.y}));}
 assert(tr.pads[0].y-tr.reward.y>=300);if(tr.kind604==='sprint')assert(g.lastAt-start<tr.limit604,'solo time '+(g.lastAt-start));console.log(c.id+' ascent ms '+(g.lastAt-start));
});
test('partner holding switch preserves high platforms beyond solo time limit',()=>{const g=game('coast'),c=course589(g),tr=c.trials601[0],p=g.players[0];Object.assign(p,{x:tr.pads[0].x,y:tr.pads[0].y,grounded:true});for(let t=0;t<=10000;t+=25){g.elapsed=t;cooperation601(g,c,emit);}assert(g.coop601[tr.id].open);assert(g.coop601[tr.id].until604>=10000+tr.limit604);p.x-=100;g.elapsed=10001+tr.limit604;cooperation601(g,c,emit);assert(!g.coop601[tr.id].open);assert(!surfaces587(g.elapsed,c,g).some(s=>s.id===tr.route607[0]));});
for(const id of ['crystal','ember'])test(id+' incomplete timed objective resets for another attempt',()=>{const g=game(id),c=course589(g),tr=c.trials601[0];if(tr.kind604==='targets')g.coop601[tr.id]={hit604:[tr.targets604[0].id]};else g.enemies=c.enemies.map(e=>({...e,defeated:tr.guards604.includes(e.id)}));if(tr.kind604==='combat')g.enemies.find(e=>e.id===tr.guards604[2]).defeated=false;cooperation601(g,c,emit);assert(g.coop601[tr.id].deadline607);g.elapsed=tr.window607+1;cooperation601(g,c,emit);assert(!g.coop601[tr.id].open);if(tr.kind604==='targets')assert.equal(g.coop601[tr.id].hit604.length,0);else assert(tr.guards604.every(id=>!g.enemies.find(e=>e.id===id).defeated));});
for(const c of COURSES589)for(const star of c.stars601.filter(s=>s.route607))test(c.id+' former roadside star now requires a reachable three-jump detour',()=>{
 const g=game(c.id),p=g.players[0],first=c.platforms.find(s=>s.id===star.route607[0]),x=star.x-90;
 const base=surfaces587(0,c,g).filter(s=>x>=s.x&&x<=s.x+s.w&&Math.abs(s.y-(first.y+72))<25).sort((a,b)=>a.y-b.y)[0];assert(base);
 Object.assign(p,{x,y:base.y,vx:0,vy:0,grounded:true,platformId:base.id,lastGroundAt:g.lastAt,weapon:null,axis:0});
 for(const id of star.route607){control587(p,{axis:0,jump:false,attack:false},g.lastAt);let landed=false;for(let i=0;i<100;i++){g.lastAt+=25;g.elapsed+=25;const s=surfaces587(g.elapsed,c,g).find(s=>s.id===id),aim=s.x+s.w/2;control587(p,{axis:p.x<aim-3?1:p.x>aim+3?-1:0,jump:true,attack:false},g.lastAt);stepRunner587(p,g.lastAt,g.elapsed,.025,g);if(p.grounded&&p.platformId===id){landed=true;break;}}assert(landed,id);}
 assert(base.y-star.y>220);
});
