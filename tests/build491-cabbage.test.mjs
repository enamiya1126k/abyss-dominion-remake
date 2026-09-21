import test from 'node:test';
import assert from 'node:assert/strict';
import{makeCabbage484,startCabbage484,tap484,publicCabbage484,ranking484,advanceCabbage484,CABBAGE484 as R}from'../src/cabbage/Rules484.js';
import{predict486,acknowledge486}from'../src/cabbage/Input486.js';
import{cue491,cueArt491,paintCue491,scoreText491,scoreMarkup491}from'../src/cabbage/Signals491.js';
import{cabbageView484,cabbageClick484}from'../src/cabbage/View484.js';
function game(){const members=Array.from({length:4},(_,i)=>({playerId:'p'+i,name:'Chef'+i,choice:{id:'m'+i,speciesId:'wolf'}}));const g=startCabbage484(makeCabbage484({id:'491',hostId:'p0',members,now:0}),0);g.windows=[{kind:'stop',at:g.startAt,until:g.startAt+2000,index:0},{kind:'cut',at:g.startAt+2000,until:g.endAt,index:1}];return g}
const hit=(g,p,seq,side,elapsed)=>{const input={seq,side,at:g.startAt+elapsed};return tap484(g,p,input,input.at)};
test('stop starts charging immediately; opposite thumbs, repeated hand and deep negative scores all count once per accepted tap',()=>{
 const g=game(),p=g.players[0];p.score=100;
 assert.equal(hit(g,p,1,'left',0),'break');assert.equal(p.score,20);
 assert.equal(hit(g,p,2,'right',0),'break');assert.equal(p.score,-60);
 assert.equal(hit(g,p,3,'right',20),'break');assert.equal(p.score,-140);
 const first={seq:3,side:'right',at:g.startAt+20};assert.equal(tap484(g,p,first,first.at),'duplicate');assert.equal(p.score,-140);
 for(let i=4;i<=80;i++)assert.equal(hit(g,p,i,i%2?'left':'right',i*20),'break');
 assert.equal(p.score,100-80*80);assert.equal(p.breaks,80);assert.equal(p.boardDamage,80);
 assert.equal(hit(g,p,81,'left',2000),'cut');assert.equal(p.score,-6290);
});
test('prediction and partial ACK preserve exact negative scores without charging retries twice',()=>{
 const g=game(),p=g.players[0],pending=Array.from({length:20},(_,i)=>({seq:i+1,side:i%2?'right':'left',at:g.startAt+i*25})),u={pending,sequence:20};
 assert.equal(predict486(publicCabbage484(g,'p0',g.startAt),p,pending).score,-1600);assert.equal(p.score,0);
 for(const t of pending.slice(0,12))tap484(g,p,t,t.at);acknowledge486(u,p,g.startAt+500);
 assert.equal(u.pending.length,8);assert.equal(predict486(g,p,u.pending).score,-1600);
 for(const t of pending)tap484(g,p,t,t.at);acknowledge486(u,p,g.startAt+550);assert.equal(p.score,-1600);assert.equal(u.pending.length,0);
});
test('old running snapshots finish with their original rule; a fresh start adopts the new rule',()=>{
 const g=game(),p=g.players[0];delete g.scoringVersion491;p.score=100;
 assert.equal(hit(g,p,1,'left',100),'grace');assert.equal(hit(g,p,2,'left',200),'break');assert.equal(p.score,20);
 assert.equal(hit(g,p,3,'right',230),'damage');assert.equal(p.score,20);assert.equal(publicCabbage484(g,'p0',g.startAt).scoringVersion491,0);
 const next=makeCabbage484({id:'next',hostId:'p0',members:g.members,now:0});delete next.scoringVersion491;startCabbage484(next,0);assert.equal(next.scoringVersion491,1);
});
test('constant mashing loses to the same cutting pace with hands off at red cues',()=>{
 const g=game(),[mash,stopper]=g.players;
 for(let t=0,seq=1;t<g.endAt-g.startAt;t+=50,seq++){
  hit(g,mash,seq,seq%2?'left':'right',t);
  if(t>=2000)hit(g,stopper,seq,seq%2?'left':'right',t);
 }
 assert.equal(mash.cuts,stopper.cuts);assert.equal(stopper.score-mash.score,3200);
});
test('negative-only results rank correctly, show true signed points and never draw a negative harvest mound',()=>{
 const g=game();g.players.forEach((p,i)=>p.score=[-1600,-80,-160,-80][i]);advanceCabbage484(g,g.endAt+R.maxAge);
 assert.deepEqual(ranking484(g).map(p=>[p.playerId,p.rank]),[['p1',1],['p3',1],['p2',3],['p0',4]]);
 const html=cabbageView484({state:{cabbage:publicCabbage484(g,'p0',g.endAt)},transport:{selfId:'p0'},sgMonster463:()=>'<i class="sg-monster"></i>'});
 assert.match(html,/−1,600/);assert.match(html,/全員マイナス/);assert.match(html,/data-pile-score="-80"/);assert.doesNotMatch(html,/class="cb-mountain487"/);
 assert.deepEqual([...html.matchAll(/--winner-x:([\d.]+)%/g)].map(m=>+m[1]),[38,62]);
 assert.match(html,/data-party-result490="again"/);assert.match(html,/data-party-result490="list"/);assert.doesNotMatch(html,/ホームへ戻る/);
 assert.equal(scoreText491(-240080),'−240,080');assert.match(scoreMarkup491(-240080),/is-long491/);assert.equal(scoreText491(0),'0');
});
test('countdown shows 3, 2, 1 then opening, and every subsequent cue uses its distinct live text and artwork',()=>{
 const g=game(),at=g.startAt;
 for(const [delta,text]of [[-3500,'3'],[-2000,'2'],[-1000,'1'],[-1,'1']])assert.equal(cue491({kind:'countdown'},g,at+delta).label[1],text);
 assert.equal(cue491({kind:'cut'},g,at).kind,'go');assert.equal(cue491({kind:'cut'},g,at+650).kind,'cut');
 assert.match(cue491({kind:'stop'},g,at+1000).label[2],/1タップ −80pt/);
 assert.equal(new Set(['cut','warning','stop','finish'].map(k=>JSON.stringify(cueArt491(k)))).size,4);
 assert.match(cueArt491('countdown').backgroundImage,/countdown-crest/);
 assert.equal(cue491({kind:'finish'},g,g.endAt).label[1],'そこまで！');
});
test('cue transitions update accessible text, digit dots and art even when reduced motion is enabled',()=>{
 const nodes=new Map(),animations=[];for(const name of ['en','main','note'])nodes.set(`[data-cb-signal-${name}]`,{textContent:'',getAnimations:()=>[],animate:(...args)=>animations.push(args)});
 nodes.set('[data-cb-cue-art]',{style:{}});const root={querySelector:q=>nodes.get(q)},stage={dataset:{}},g=game();
 paintCue491(root,stage,cue491({kind:'countdown'},g,g.startAt-2000),true);assert.equal(stage.dataset.count,'2');assert.equal(nodes.get('[data-cb-signal-main]').textContent,'2');assert.equal(animations.length,0);
 paintCue491(root,stage,cue491({kind:'stop'},g,g.startAt+800),false);assert.equal(stage.dataset.signal,'stop');assert.equal(nodes.get('[data-cb-signal-main]').textContent,'切るな！');assert.match(nodes.get('[data-cb-signal-note]').textContent,/−80/);assert.equal(animations.length,1);
});
test('new client explains an old server instead of starting a match with the old penalty rule',()=>{
 const c={state:{cabbage:{id:'491'}},render(){this.rendered=true},raw(){throw Error('must not send')}};
 assert.equal(cabbageClick484(c,{dataset:{cbAction:'start'}},{}),true);assert.match(c.error,/Build491/);assert.equal(c.rendered,true);
});
