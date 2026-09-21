import test from'node:test';import assert from'node:assert/strict';
import{cabbageShape490,foodLayer490,paintCabbage490}from'../src/cabbage/Shape490.js';
import{chopMaterial487,cabbagePile487}from'../src/cabbage/Presentation487.js';
import{destruction490,floorStyle490,paintDestruction490,damageMessage490}from'../src/cabbage/Floor490.js';
import{makeCabbage484,startCabbage484,tap484,advanceCabbage484,publicCabbage484,CABBAGE484 as R}from'../src/cabbage/Rules484.js';
import{cabbageView484}from'../src/cabbage/View484.js';
test('same cabbage gets lower on every cut across all material boundaries and only spreads slightly',()=>{
 let prev=cabbageShape490(0);assert.equal(prev.height,1);assert.equal(prev.width,1);
 for(let cuts=1;cuts<=10000;cuts++){const s=cabbageShape490(cuts),m=chopMaterial487(cuts);assert.ok(s.height<prev.height,`grew at ${cuts}`);assert.ok(s.width>prev.width&&s.width<1.18);assert.ok(s.height>.1);
  for(const frame of [m.food,m.next]){const style=foodLayer490(frame);assert.equal(style.transform,'none');assert.equal(style.clipPath,'inset(0 0% 0 0%)');assert.ok(!/NaN|Infinity/.test(JSON.stringify(style)))}prev=s;
 }
 const food={style:{}};paintCabbage490(food,61);const before=food.style.transform;paintCabbage490(food,66);assert.notEqual(before,food.style.transform);assert.ok(cabbageShape490(66).height<cabbageShape490(61).height);
});
test('play height depends only on total cuts, never combo, points, damage or material reset; final podium still grows with points',()=>{
 for(const bad of [NaN,Infinity,-1])assert.deepEqual(cabbageShape490(bad),cabbageShape490(0));
 assert.ok(cabbagePile487(2000).scale>cabbagePile487(1000).scale);
 assert.ok(cabbageShape490(2000).height<cabbageShape490(1000).height);
});
test('all eight floor stages follow total board/table loss; every additional strike continues widening the abyss',()=>{
 for(let n=0;n<=26;n++)assert.equal(floorStyle490(destruction490(n)).opacity,0);
 let last='';for(let n=27;n<=1500;n++){const d=destruction490(n),style=floorStyle490(d);assert.equal(d.floorHits,n-26);assert.equal(d.boardVisible,false);assert.equal(d.tableOpacity,0);assert.equal(style.opacity,1);assert.notEqual(JSON.stringify(style),last);last=JSON.stringify(style)}
 assert.equal(destruction490(27).floor,0);assert.equal(destruction490(34).floor,7);
});
function scene(){const nodes=new Map();const el=()=>({dataset:{},style:{setProperty(){}},setAttribute(){}});for(const k of ['board','table','floor'])nodes.set(`[data-cb-${k}]`,el());return{...el(),querySelector:q=>nodes.get(q)}}
test('paint and reconnect preserve floor holes; starting a new match alone restores all surfaces',()=>{
 const stage=scene();paintDestruction490(stage,40);const floor=stage.querySelector('[data-cb-floor]'),style={...floor.style};paintDestruction490(stage,40);assert.deepEqual(floor.style,style);assert.equal(floor.dataset.damage,14);assert.equal(stage.querySelector('[data-cb-board]').style.opacity,0);assert.equal(stage.querySelector('[data-cb-table]').style.opacity,0);paintDestruction490(stage,0);assert.equal(floor.style.opacity,0);assert.equal(stage.querySelector('[data-cb-board]').style.opacity,1);assert.equal(stage.querySelector('[data-cb-table]').style.opacity,1);
});
test('floor damage survives real cuts, next stop, persisted snapshot and final result; one penalty per stop remains',()=>{
 const g=startCabbage484(makeCabbage484({id:'490',hostId:'p',members:[{playerId:'p',name:'Chef',choice:{id:'m',speciesId:'wolf'}}],now:0}),0),p=g.players[0],a=g.startAt;
 g.windows=[{kind:'stop',at:a,until:a+2000,index:0},{kind:'cut',at:a+2000,until:a+3000,index:1},{kind:'stop',at:a+3000,until:a+5000,index:2},{kind:'cut',at:a+5000,until:g.endAt,index:3}];p.score=1000;
 for(let i=0;i<40;i++){const at=a+200+i*30;tap484(g,p,{seq:i+1,side:i%2?'right':'left',at},at)}
 assert.equal(p.boardDamage,40);assert.equal(p.score,920);assert.equal(p.breaks,1);
 let at=a+2100;tap484(g,p,{seq:41,side:'left',at},at);assert.equal(p.boardDamage,40);assert.equal(p.score,930);
 at=a+3250;tap484(g,p,{seq:42,side:'right',at},at);assert.equal(p.boardDamage,41);assert.equal(p.score,850);assert.equal(p.breaks,2);
 const restored=JSON.parse(JSON.stringify(g));advanceCabbage484(restored,g.endAt+R.maxAge);const view=publicCabbage484(restored,'p',g.endAt);assert.equal(destruction490(view.players[0].boardDamage).floorHits,15);
 const html=cabbageView484({state:{cabbage:view},transport:{selfId:'p'},sgMonster463:()=>''});assert.match(html,/床の破壊 15打/);assert.match(html,/cb-result-floor490/);assert.match(html,/data-party-result490="again"/);assert.match(html,/data-party-result490="list"/);assert.doesNotMatch(html,/ホームへ戻る/);
 assert.match(damageMessage490(27,true),/床.*−80/);assert.doesNotMatch(damageMessage490(28,false),/80/);
});
