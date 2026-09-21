import test from 'node:test';
import assert from 'node:assert/strict';
import { destruction488, tableStyle488, damageMessage488, paintDestruction488 } from '../src/cabbage/Destruction488.js';
import { makeCabbage484, startCabbage484, tap484, publicCabbage484, advanceCabbage484, CABBAGE484 as R } from '../src/cabbage/Rules484.js';
import { predict486, acknowledge486 } from '../src/cabbage/Input486.js';
import { cabbageView484, cabbageTick484, cabbageTap484 } from '../src/cabbage/View484.js';

function game(){
  const g=startCabbage484(makeCabbage484({id:'488',code:'KITCHN',partyId:'party',hostId:'p',members:[{playerId:'p',name:'料理人',choice:{id:'owned',speciesId:'wolf'}}],now:1000}),1000);
  g.phase='playing';const a=g.startAt;
  g.windows=[{kind:'stop',at:a,until:a+2000,index:0},{kind:'cut',at:a+2000,until:a+3000,index:1},{kind:'stop',at:a+3000,until:a+5000,index:2},{kind:'cut',at:a+5000,until:g.endAt,index:3}];
  return g;
}

test('the eighth forbidden strike reaches the table only after seven board damage stages',()=>{
  for(let hits=0;hits<=7;hits++){const d=destruction488(hits);assert.equal(d.board,hits);assert.equal(d.boardVisible,true);assert.equal(d.tableHits,0);assert.equal(d.table,0)}
  const next=destruction488(8);assert.equal(next.boardVisible,false);assert.equal(next.tableHits,1);assert.equal(next.table,1);assert.equal(next.phase,'table');
});

test('each further hit changes the table through cracks, holes, collapse and complete removal with no rectangular clipping',()=>{
  let previous='';
  for(let hits=8;hits<=26;hits++){
    const d=destruction488(hits),style=tableStyle488(d),serial=JSON.stringify(style);
    assert.notEqual(serial,previous);assert.equal(style.clipPath,undefined);assert.ok(style.opacity>=0&&style.opacity<=1);previous=serial;
  }
  assert.equal(destruction488(12).table,5);assert.equal(destruction488(14).table,7);
  const gone=destruction488(26);assert.equal(gone.phase,'floor');assert.equal(gone.tableOpacity,0);assert.equal(gone.sink,1);
  for(const hits of [27,48,1000]){const d=destruction488(hits);assert.equal(d.phase,'floor');assert.equal(d.tableOpacity,0);assert.equal(d.boardVisible,false)}
});

test('old or invalid counters never display negative damage or an invalid atlas cell',()=>{
  for(const count of [undefined,NaN,Infinity,-1]){const d=destruction488(count);assert.equal(d.hits,0);assert.equal(d.phase,'board');assert.equal(tableStyle488(d).backgroundPosition,'0% 0%')}
});

test('persistent table damage survives the next cut, a later stop, save and result without changing scoring rules',()=>{
  const g=game(),p=g.players[0];p.score=500;
  for(let i=0;i<20;i++){const at=g.startAt+200+i*30;tap484(g,p,{seq:i+1,side:i%2?'right':'left',at},at)}
  assert.equal(p.score,420);assert.equal(p.breaks,1);assert.equal(destruction488(p.boardDamage).tableHits,13);
  let at=g.startAt+2100;tap484(g,p,{seq:21,side:'left',at},at);assert.equal(p.score,430);assert.equal(p.boardDamage,20);
  at=g.startAt+3250;tap484(g,p,{seq:22,side:'right',at},at);assert.equal(p.score,350);assert.equal(p.breaks,2);assert.equal(p.boardDamage,21);
  const restored=JSON.parse(JSON.stringify(g));advanceCabbage484(restored,g.endAt+R.maxAge);
  assert.deepEqual(destruction488(publicCabbage484(restored,'p',g.endAt).players[0].boardDamage),destruction488(21));
  assert.equal(game().players[0].boardDamage,0);
});

test('crossing from board to table before a server reply reconciles to identical scene state',()=>{
  const g=game(),p=g.players[0];p.score=500;p.boardDamage=6;
  const taps=[1,2,3].map((seq,i)=>({seq,side:i%2?'right':'left',at:g.startAt+250+i*30}));
  const predicted=predict486(g,p,taps),d=destruction488(predicted.boardDamage);
  assert.equal(d.tableHits,2);assert.equal(p.boardDamage,6);
  tap484(g,p,taps[0],taps[0].at);const ui={pending:taps,sequence:3};acknowledge486(ui,p,taps[2].at);
  assert.deepEqual(destruction488(predict486(g,p,ui.pending).boardDamage),d);
});

class El{
  constructor(){this.nodes=new Map();this.dataset={};this.attrs={};this.values={};this.style={setProperty:(k,v)=>this.values[k]=v};this.classes=new Set();this.classList={add:k=>this.classes.add(k),toggle:(k,v)=>v?this.classes.add(k):this.classes.delete(k)};this.animations=[]}
  querySelector(q){return this.nodes.get(q)??null}querySelectorAll(q){return this.nodes.get(q)??[]}
  setAttribute(k,v){this.attrs[k]=v}getAnimations(){return[]}animate(frames,options){this.animations.push({frames,options})}
}
function scene(){
  const stage=new El(),board=new El(),table=new El();stage.nodes.set('[data-cb-board]',board);stage.nodes.set('[data-cb-table]',table);return{stage,board,table};
}

test('rendered surfaces expose the floor and stay collapsed when the signal changes',()=>{
  const x=scene();paintDestruction488(x.stage,8);assert.equal(x.board.style.opacity,0);assert.equal(x.board.style.clipPath,'none');assert.equal(x.table.dataset.damage,1);
  paintDestruction488(x.stage,26);assert.equal(x.table.style.opacity,0);assert.equal(x.stage.values['--floor-drop488'],'10%');assert.equal(x.stage.dataset.destruction,'floor');
  paintDestruction488(x.stage,26);assert.equal(x.table.style.opacity,0);assert.equal(x.board.style.opacity,0);
  paintDestruction488(x.stage,0);assert.equal(x.table.style.opacity,1);assert.equal(x.board.style.opacity,1);assert.equal(x.stage.values['--floor-drop488'],'0%');
});

function client(g){
  const x=scene(),root=new El(),pads=['left','right'].map(side=>{const p=new El();p.dataset.cbSide=side;return p});
  root.nodes.set('.cb-play',new El());root.nodes.set('[data-cb-stage]',x.stage);root.nodes.set('[data-cb-side]',pads);
  for(const p of pads)root.nodes.set(`[data-cb-side="${p.dataset.cbSide}"]`,p);
  for(const name of ['time','progress','combo','hint','offline','feedback','signal-en','signal-main','signal-note'])root.nodes.set(`[data-cb-${name}]`,new El());
  for(let seat=0;seat<4;seat++)for(const what of ['score','place','online'])root.nodes.set(`[data-cb-${what}="${seat}"]`,new El());
  for(const q of ['.cb-knife','.cb-food','.cb-chef','.cb-food-layers486','[data-cb-texture]'])x.stage.nodes.set(q,new El());
  x.stage.nodes.set('[data-cb-food-layer]',[new El(),new El()]);
  const c={root,state:{cabbage:publicCabbage484(g,'p',g.startAt)},transport:{selfId:'p'},offset:0,ready:()=>true,connected:()=>true,raw:()=>true,sgMonster463:()=>''};
  cabbageView484(c);c.cbUI484.sound=false;c.cbUI484.reduced=false;
  return{...x,c,root,pads};
}

test('real input immediately breaks the table locally, then the same mounted buttons keep accepting fast legal cuts on the floor',t=>{
  const g=game();g.players[0].boardDamage=6;g.players[0].score=500;
  const x=client(g);let now=g.startAt+250;t.mock.method(Date,'now',()=>now);
  for(let i=0;i<20;i++){now=g.startAt+250+i*25;cabbageTap484(x.c,i%2?'right':'left')}
  assert.equal(x.board.style.opacity,0);assert.equal(x.table.style.opacity,0);assert.equal(x.stage.dataset.destruction,'floor');assert.equal(x.c.cbUI484.pending.length,20);
  for(const hit of x.c.cbUI484.pending)tap484(g,g.players[0],hit,hit.at);
  x.c.state.cabbage=publicCabbage484(g,'p',g.startAt+2100);x.c.cbUI484.pending=[];
  for(let i=0;i<20;i++){now=g.startAt+2100+i*25;cabbageTap484(x.c,i%2?'right':'left')}
  assert.equal(x.root.querySelector('[data-cb-combo]').textContent,20);assert.equal(x.table.style.opacity,0);assert.equal(x.root.querySelector('[data-cb-side]'),x.pads);
  assert.equal(x.c.cbUI484.particles.length,84);assert.ok(x.pads[0].animations.length>0);assert.equal(x.pads[0].disabled,false);
  const knife=x.stage.querySelector('.cb-knife');assert.match(knife.animations.at(-1).frames[0].transform,/translateY\(10px\)/);
});

test('reduced motion suppresses new input recoil, knife animations and particles but preserves scene damage',t=>{
  const g=game();g.players[0].boardDamage=7;const x=client(g);x.c.cbUI484.reduced=true;t.mock.method(Date,'now',()=>g.startAt+250);
  cabbageTap484(x.c,'left');assert.equal(x.table.dataset.damage,1);assert.equal(x.pads[0].animations.length,0);assert.equal(x.stage.querySelector('.cb-knife').animations.length,0);assert.equal(x.c.cbUI484.particles.length,0);
});

test('damage feedback describes the object actually breaking and never suggests a second charge in one stop',()=>{
  assert.match(damageMessage488(7,false),/まな板、全壊/);assert.match(damageMessage488(8,true),/テーブル.*−80/);assert.match(damageMessage488(12,false),/穴/);assert.match(damageMessage488(14,false),/崩落/);assert.match(damageMessage488(48,false),/台所、全壊/);
  assert.doesNotMatch(damageMessage488(13,false),/80/);
});

test('results show the winner’s collapsed table rather than restoring it; replay still works',()=>{
  const g=game();g.players[0].score=2000;g.players[0].boardDamage=48;g.phase='result';
  const c={state:{cabbage:publicCabbage484(g,'p',g.endAt)},transport:{selfId:'p'},sgMonster463:()=>'<span class="sg-monster"></span>'};
  const html=cabbageView484(c);assert.match(html,/優勝者の全壊したテーブル/);assert.match(html,/cb-result-table488[^>]*opacity:0/);assert.doesNotMatch(html,/class="cb-result-board487"/);
  assert.match(html,/まな板全壊 · テーブルも全壊/);assert.match(html,/cb-crown488/);assert.doesNotMatch(html,/♛/);assert.match(html,/data-party-result490="again"/);
});
