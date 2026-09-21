import test from 'node:test';
import assert from 'node:assert/strict';
import { makeCabbage484, startCabbage484, tap484, publicCabbage484, advanceCabbage484, CABBAGE484 as R } from '../src/cabbage/Rules484.js';
import { material486, predict486, acknowledge486 } from '../src/cabbage/Input486.js';
import { chopMaterial487, foodLayer487, cabbagePile487 } from '../src/cabbage/Presentation487.js';
import { cabbageView484 } from '../src/cabbage/View484.js';

function game() {
  const g = startCabbage484(makeCabbage484({id:'487',code:'GREENS',partyId:'p',hostId:'me',members:[{playerId:'me',name:'あなた',choice:{id:'owned',speciesId:'wolf'}}],now:1000}),1000);
  g.phase='playing';const a=g.startAt;
  g.windows=[{kind:'cut',at:a,until:a+1000,index:0},{kind:'stop',at:a+1000,until:a+2000,index:1},{kind:'cut',at:a+2000,until:a+3000,index:2},{kind:'stop',at:a+3000,until:a+4000,index:3},{kind:'cut',at:a+4000,until:g.endAt,index:4}];
  return g;
}
const hit=(g,p,seq,side,elapsed)=>{const at=g.startAt+elapsed;return tap484(g,p,{seq,side,at},at)};

test('one board retains cumulative damage through cut, another stop, save/reconnect and results; only a new match repairs it',()=>{
  const g=game(),p=g.players[0];p.score=500;
  hit(g,p,1,'left',1200);hit(g,p,2,'right',1250);hit(g,p,3,'left',1300);
  assert.equal(p.boardDamage,3);assert.equal(p.score,260);
  hit(g,p,4,'right',2100);assert.equal(p.boardDamage,3);assert.equal(p.cuts,1);
  hit(g,p,5,'left',3250);assert.equal(p.boardDamage,4);assert.equal(p.breaks,4);assert.equal(p.score,190);
  const restored=JSON.parse(JSON.stringify(g)),rp=restored.players[0];
  const reconnected=publicCabbage484(restored,'me',g.startAt+4500);
  assert.equal(material486(reconnected.players[0],{kind:'cut',index:4}).damage,4);
  hit(restored,rp,6,'right',4500);assert.equal(rp.boardDamage,4);assert.equal(rp.score,200);
  advanceCabbage484(restored,g.endAt+R.maxAge);assert.equal(restored.phase,'result');assert.equal(publicCabbage484(restored,'me',g.endAt+R.maxAge).players[0].boardDamage,4);
  const fresh=game();assert.equal(fresh.players[0].boardDamage,0);assert.equal(fresh.players[0].cuts,0);
});

test('a completely shattered board never prevents legal cuts and repeated damage is charged on every tap',()=>{
  const g=game(),p=g.players[0];p.score=1000;
  for(let i=0;i<20;i++)hit(g,p,i+1,i%2?'right':'left',1200+i*25);
  assert.equal(p.boardDamage,20);assert.equal(p.breaks,20);assert.equal(p.score,-600);
  for(let i=0;i<20;i++)assert.equal(hit(g,p,21+i,i%2?'right':'left',2100+i*25),'cut');
  assert.equal(p.boardDamage,20);assert.equal(p.score,-390);assert.equal(p.cuts,20);
});

test('predicted cumulative damage reconciles across the stop boundary without double damage or losing old scars',()=>{
  const g=game(),p=g.players[0];p.boardDamage=5;p.score=300;
  const taps=[{seq:1,side:'left',at:g.startAt+1200},{seq:2,side:'right',at:g.startAt+1250},{seq:3,side:'left',at:g.startAt+2100}];
  const predicted=predict486(g,p,taps);assert.equal(predicted.boardDamage,7);assert.equal(predicted.score,150);assert.equal(p.boardDamage,5);
  const ui={pending:taps,sequence:3};tap484(g,p,taps[0],taps[0].at);acknowledge486(ui,p,taps[2].at);
  assert.deepEqual(predict486(g,p,ui.pending),predicted);
  for(const input of ui.pending)tap484(g,p,input,input.at);
  assert.deepEqual(p,predicted);
});

test('cabbage progresses beyond the old coarse pile into granules, snow and powder without restocking',()=>{
  const samples=[chopMaterial487(0),chopMaterial487(50),chopMaterial487(109),chopMaterial487(150),chopMaterial487(175),chopMaterial487(1000)];
  assert.deepEqual(samples.map(m=>m.food),[0,7,8,9,10,10]);
  assert.equal(samples[3].label,'キャベツの雪');assert.equal(samples[4].label,'限界の極細');
  assert.equal(material486({cuts:109,boardDamage:6},{kind:'stop'}).food,8);
  assert.equal(material486({cuts:109,boardDamage:6},{kind:'cut'}).food,8);
});

test('each cut refines an opaque part of the same pile: complementary masks have no translucent double image',()=>{
  let previous='';
  for(let cuts=0;cuts<=175;cuts++){
    const m=chopMaterial487(cuts),base=foodLayer487(m.food,m.mix*100,100),next=foodLayer487(m.next,0,m.mix*100);
    assert.equal(base.opacity,1);assert.equal(next.opacity,1);
    const b=base.clipPath.match(/[\d.]+/g).map(Number),n=next.clipPath.match(/[\d.]+/g).map(Number);
    assert.ok(Math.abs(b[3]+n[1]-100)<1e-10);
    const state=JSON.stringify([base,next]);assert.notEqual(state,previous);previous=state;
  }
  // Skip the generated atlas's coarser first cell instead of growing strips back.
  const start=foodLayer487(8,0,100);assert.match(start.backgroundImage,/fine-stages/);assert.equal(start.backgroundPosition,'100% 0%');
});

test('harvest quantity uses final points including penalties and bonus, with shared exact comparison scale',()=>{
  assert.equal(cabbagePile487(800,1600).share,.5);assert.equal(cabbagePile487(400,1600).share,.25);
  const g=game(),p=g.players[0];p.score=800;p.cuts=80;
  const before=cabbagePile487(p.score);hit(g,p,1,'left',1200);
  assert.equal(p.cuts,80);assert.equal(p.score,720);assert.ok(cabbagePile487(p.score).scale<before.scale);
  let previous=0;for(const score of [1,10,80,500,1645,10000,45000]){const q=cabbagePile487(score);assert.ok(q.scale>previous&&q.scale<1);previous=q.scale}
  assert.deepEqual(cabbagePile487(0,0),{points:0,scale:0,share:0});
});

function result(scores) {
  const g=game();g.players.forEach((p,i)=>Object.assign(p,{score:scores[i],cuts:100+i,maxCombo:20,boardDamage:i+2,breaks:1}));g.phase='result';
  const c={state:{cabbage:publicCabbage484(g,'me',g.endAt)},transport:{selfId:'me'},sgMonster463:id=>`<span class="sg-monster" data-species="${id}"></span>`};
  return {g,c};
}

test('result gives the podium only to rank one, shows final point quantities for all players and keeps replay actions',()=>{
  const {c}=result([670,1110,1320,1645]);const html=cabbageView484(c);
  assert.equal([...html.matchAll(/data-champion-rank="1"/g)].length,1);
  assert.match(html,/data-pile-score="1645"/);
  assert.deepEqual([...html.matchAll(/data-harvest-score="(\d+)"/g)].map(m=>Number(m[1])),[1645,1320,1110,670]);
  assert.match(html,/同じまな板に2打の傷/);assert.doesNotMatch(html,/枚粉砕/);
  assert.match(html,/data-party-result490="again"/);assert.match(html,/data-party-action462="browse"/);assert.doesNotMatch(html,/data-race-action="back"/);assert.match(html,/data-party-result490="list"/);
});

test('tied winners share the summit and zero points never invent a cabbage mountain or divide by zero',()=>{
  for(const scores of [[1200,800,1200,400],[0,0,0,0]]){
    const {c}=result(scores),html=cabbageView484(c),expected=scores.filter(v=>v===Math.max(...scores)).length;
    assert.equal([...html.matchAll(/data-champion-rank="1"/g)].length,expected);assert.match(html,/同点優勝/);assert.doesNotMatch(html,/NaN|Infinity/);
    if(scores.every(x=>x===0)){assert.doesNotMatch(html,/class="cb-mountain487"/);assert.equal([...html.matchAll(/width:0\.000%/g)].length,4)}
  }
});

test('winner names remain escaped in podium accessibility text and result labels',()=>{
  const {c}=result([2000,0,0,0]);c.state.cabbage.players[0].name='王様"><script>oops</script>';
  const html=cabbageView484(c);assert.doesNotMatch(html,/<script>/);assert.match(html,/王様&quot;&gt;&lt;script&gt;oops&lt;\/script&gt;/);
});
