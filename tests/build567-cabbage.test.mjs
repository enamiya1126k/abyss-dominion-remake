import test from 'node:test';
import assert from 'node:assert/strict';
import {makeCabbage484,startCabbage484,stroke567,tap484,advanceCabbage484,publicCabbage484,CABBAGE484 as R} from '../src/cabbage/Rules484.js';
import {gesture567,predict567,flush567} from '../src/cabbage/Swipe567.js';
import {acknowledge486} from '../src/cabbage/Input486.js';
import {queueCabbage484,advanceCabbages484} from '../online-server/src/CabbageCoordinator484.js';
import {createDebris567,release567,stepDebris567,DEBRIS567} from '../src/cabbage/Debris567.js';
import {layout567} from '../src/cabbage/Scene567.js';

function game(){const g=startCabbage484(makeCabbage484({id:'cb567',code:'ABC',partyId:'party',hostId:'p',members:[{playerId:'p',name:'あなた',choice:{id:'m',speciesId:'slime'}}],controlVersion567:1}),10000);g.phase='playing';g.windows=[{kind:'cut',at:g.startAt,until:g.endAt,index:0}];return g;}
function send(g,p,kind,at){return stroke567(g,p,{seq:p.lastSeq+1,kind,at},at);}
function cut(g,p,at){send(g,p,'lift',at-40);return send(g,p,'cut',at);}

test('swipe: one downstroke, then a full lift; hold, repeated down and old taps cannot farm points',()=>{
 const g=game(),p=g.players[0],t=g.startAt+100;
 assert.equal(send(g,p,'cut',t),'held');assert.equal(p.score,0);
 assert.equal(cut(g,p,t+100),'cut');assert.equal(send(g,p,'cut',t+200),'held');
 assert.equal(tap484(g,p,{seq:500,side:'left',at:t+300},t+300),'control');assert.equal(p.lastSeq,4);
 for(let i=0;i<9;i++)assert.equal(cut(g,p,t+400+i*100),'cut');
 assert.equal(p.cuts,10);assert.equal(p.combo,10);assert.equal(p.score,105);
});
test('swipe: stop charges each completed downstroke, while lift and stillness are safe; destruction persists',()=>{
 const g=game(),p=g.players[0],at=g.startAt+200;g.windows=[{kind:'stop',at:g.startAt,until:at+3000,index:1},{kind:'cut',at:at+3000,until:g.endAt,index:2}];
 assert.equal(send(g,p,'lift',at),'lift');assert.equal(p.boardDamage,0);
 for(let i=0;i<28;i++)assert.equal(cut(g,p,at+100+i*100),'break');
 assert.equal(p.score,-2240);assert.equal(p.boardDamage,28);assert.equal(p.breaks,28);
 assert.equal(cut(g,p,at+3100),'cut');assert.equal(p.boardDamage,28);assert.equal(p.score,-2230);
});
test('swipe: input deduplication, ordering, late packets, cancellation and timing survive serialization',()=>{
 const g=game(),p=g.players[0],at=g.startAt+100;
 const lift={seq:1,kind:'lift',at};stroke567(g,p,lift,at);assert.equal(stroke567(g,p,lift,at),'duplicate');
 assert.equal(send(g,p,'cut',at+1),'rate');assert.equal(send(g,p,'cut',at+100),'held');
 send(g,p,'lift',at+200);send(g,p,'cancel',at+220);assert.equal(send(g,p,'cut',at+250),'held');
 send(g,p,'lift',at+300);const restored=JSON.parse(JSON.stringify(g));assert.equal(send(restored,restored.players[0],'cut',at+350),'cut');
 for(const bad of [{at:at-2000},{at:at+2000},{kind:'left'},{seq:NaN}]){const before=p.score;stroke567(g,p,{seq:p.lastSeq+1,kind:'cut',at:at+400,...bad},at+400);assert.equal(p.score,before);}
 const own=publicCabbage484(restored,'p',at+400),other=publicCabbage484(restored,'stranger',at+400);assert.equal(own.controlVersion567,1);assert('bladeRaised567' in own.players[0]);assert(!('bladeRaised567' in other.players[0]));
});
test('swipe: relative finger tracking, hysteresis, release and a new touch preserve one-cut-per-cycle',()=>{
 const crosses=[],poses=[],g=gesture567({onCross:k=>crosses.push(k),onPose:p=>poses.push(p)});
 g.begin(100,100);g.move(140);assert.equal(g.position,.4);assert.deepEqual(crosses,['lift']);
 g.move(183);g.move(250);g.move(260);assert.deepEqual(crosses,['lift','cut']);
 g.end();g.begin(30,100);assert.equal(g.position,1);g.move(50);assert.equal(crosses.length,2);
 g.move(-40);g.move(35);assert.deepEqual(crosses,['lift','cut','lift','cut']);
 g.end(true);assert.equal(crosses.at(-1),'cancel');const n=crosses.length;g.move(150);assert.equal(crosses.length,n);
 assert(poses.every(p=>p>=0&&p<=1));
});
test('swipe: prediction and resend stay equal to authoritative score at 300ms each-way latency and 250ms ticks',()=>{
 const g=game(),p=g.players[0],u={pending:[],lastFlush:0,sequence:0},packets=[],replies=[];let now=g.startAt;
 const session={playerId:'p',connected:true},party={id:'party',members:[{playerId:'p'}]};let snapshot=publicCabbage484(g,'p',now),writes=0;
 const server={data:{cabbageRooms484:{ABC:g},parties462:{ABC:party}},sessions:new Map([['p',session]]),now:()=>now,transaction:f=>{writes++;f();},push:()=>replies.push({at:now+300,g:structuredClone(publicCabbage484(g,'p',now))})};
 const client={connected:()=>true,raw:(op,m)=>{packets.push({at:now+300,m:{op,cabbageSwipe567:1,...m}});return true;}};
 let count=0;
 for(let elapsed=0;elapsed<=6200;elapsed+=5){now=g.startAt+elapsed;
  if(elapsed>=100&&elapsed<4100&&(elapsed-100)%50===0){const kind=(elapsed-100)%100===0?'lift':'cut';u.pending.push({seq:++u.sequence,kind,at:now});if(kind==='cut')count++;assert.equal(predict567(snapshot,snapshot.players[0],u.pending).cuts,count);}
  flush567(client,u,snapshot,now);while(packets[0]?.at<=now)queueCabbage484(server,session,packets.shift().m);
  if(elapsed%250===0)advanceCabbages484(server);while(replies[0]?.at<=now){snapshot=replies.shift().g;acknowledge486(u,snapshot.players[0],now);}
 }
 assert.equal(count,40);assert.equal(p.cuts,40);assert.equal(p.score,420);assert.equal(u.pending.length,0);assert(writes<=26);
});
test('swipe: all AI chefs obey the same downstroke rule and the match seals after 45 seconds',()=>{
 const g=game();for(let t=g.startAt;t<=g.endAt+R.maxAge;t+=100)advanceCabbage484(g,t);
 assert.equal(g.phase,'result');assert(g.players.filter(p=>p.ai).every(p=>p.cuts>120&&p.score>1200));const p=g.players[0];assert.equal(cut(g,p,g.endAt+2000),'late');assert.equal(p.score,0);
});
test('debris: gravity, contact bounce, rolling friction and sleep; a collapsed board wakes settled pieces',()=>{
 const w=createDebris567();release567(w,{x:195,y:280,floor:300,width:390},()=>.45);
 for(let i=0;i<300;i++)stepDebris567(w,1/120,{width:390,floor:300});
 assert(w.bodies.every(b=>b.bounces>=1));assert(w.bodies.some(b=>b.sleep));assert(w.bodies.every(b=>b.y+b.radius<=300.0001));
 stepDebris567(w,1/60,{width:390,floor:350});assert(w.bodies.every(b=>!b.sleep&&b.floor===350));
});
test('debris: rapid cutting has a fixed memory/work limit and no nonfinite state after stalled frames',()=>{
 const w=createDebris567();for(let i=0;i<1500;i++){release567(w,{x:190,y:270,floor:300,width:390,cuts:i,wood:i%7===0},()=>.35);stepDebris567(w,i%9?1/30:15,{width:390,floor:300});assert(w.bodies.length<=DEBRIS567.max);}
 assert(w.bodies.every(b=>['x','y','vx','vy','spin','angle'].every(k=>Number.isFinite(b[k]))));for(let i=0;i<300;i++)stepDebris567(w,1/30,{width:390,floor:300});assert.equal(w.bodies.length,0);
});
test('knife contact and cut plane coincide at every viewport, mince stage and destruction depth',()=>{
 for(const [w,h]of [[390,470],[320,330],[575,348]])for(const cuts of [0,20,90,300])for(const damage of [0,7,20,35]){
  const up=layout567(w,h,cuts,damage,0),down=layout567(w,h,cuts,damage,.82);assert(up.edge<up.y);assert(Math.abs(down.edge-down.floor)<1e-9);assert(Math.abs(down.knife.y+down.knife.h*.995-down.edge)<1e-9);assert(down.floor<h);
 }
});
