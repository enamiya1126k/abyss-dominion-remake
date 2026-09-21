import test from 'node:test';
import assert from 'node:assert/strict';
import { CABBAGE484 as R, makeCabbage484, startCabbage484, tap484, publicCabbage484, advanceCabbage484 } from '../src/cabbage/Rules484.js';
import { queueCabbage484, advanceCabbages484 } from '../online-server/src/CabbageCoordinator484.js';
import { predict486, acknowledge486, flush486, material486, bindPads486, lockPlayZoom486 } from '../src/cabbage/Input486.js';
import { cabbageView484, cabbageTap484, cabbageReceive484, cabbageClick484, cabbageBefore484, cabbageAfter484 } from '../src/cabbage/View484.js';

function game() {
  const g = startCabbage484(makeCabbage484({ id:'486', code:'CABBAG', partyId:'party', hostId:'p', members:[{playerId:'p',name:'あなた',choice:{id:'wolf',speciesId:'wolf'}}], now:10000 }),10000);
  // Long uninterrupted cut interval for repeatable throughput measurements.
  g.windows = [{kind:'cut',at:g.startAt,until:g.endAt,index:0}];
  g.phase='playing'; return g;
}
const input=(seq,side,at)=>({seq,side,at});

test('opposite thumbs at the same millisecond both count; only same-side bounce is suppressed',()=>{
  const g=game(),p=g.players[0],at=g.startAt+100;
  assert.equal(tap484(g,p,input(1,'left',at),at),'cut');
  assert.equal(tap484(g,p,input(2,'right',at),at),'cut');
  assert.equal(tap484(g,p,input(3,'left',at+1),at+1),'rate');
  assert.equal(p.cuts,2); assert.equal(p.combo,2);
  assert.equal(tap484(g,p,input(4,'left',at+25),at+25),'cut');
});

test('40 alternating taps per second maintain a full combo and all scoring',()=>{
  const g=game(),p=g.players[0];
  for(let i=0;i<160;i++)assert.equal(tap484(g,p,input(i+1,i%2?'right':'left',g.startAt+100+i*25),g.startAt+100+i*25),'cut');
  assert.equal(p.cuts,160);assert.equal(p.combo,160);assert.equal(p.maxCombo,160);assert.equal(p.score,1680);
});

test('every forbidden tap damages the board, including consecutive hits from one hand; penalty is once per signal',()=>{
  const g=game(),p=g.players[0],at=g.startAt+1000;
  g.windows=[{kind:'stop',at,until:at+2000,index:3},{kind:'cut',at:at+2000,until:g.endAt,index:4}];p.score=300;
  assert.equal(tap484(g,p,input(1,'left',at+100),at+100),'grace');
  for(let i=0;i<12;i++){const t=at+200+i*35;assert.equal(tap484(g,p,input(i+2,'left',t),t),i?'damage':'break');assert.equal(p.boardDamage,i+1)}
  assert.equal(p.breaks,1);assert.equal(p.score,220);assert.equal(p.combo,0);
  assert.equal(material486(p,g.windows[0]).board,7);assert.equal(material486(p,g.windows[0]).damage,12);
  assert.equal(material486(p,g.windows[1]).damage,12);
  const next=at+2000;assert.equal(tap484(g,p,input(14,'right',next),next),'cut');assert.equal(p.boardDamage,12);assert.equal(p.cuts,1);
});

test('another stop keeps the same board; duplicated input does not damage or charge twice',()=>{
  const g=game(),p=g.players[0],a=g.startAt+1000;p.score=300;
  g.windows=[{kind:'stop',at:a,until:a+1000,index:1},{kind:'stop',at:a+1000,until:a+2000,index:2}];
  const first=input(1,'left',a+250);tap484(g,p,first,first.at);assert.equal(tap484(g,p,first,first.at),'duplicate');
  const next=input(2,'left',a+1300);tap484(g,p,next,next.at);assert.equal(p.boardDamage,2);assert.equal(p.breaks,2);assert.equal(p.score,140);
});

test('saved games without new timing and damage fields migrate on first input',()=>{
  const g=JSON.parse(JSON.stringify(game())),p=g.players[0];for(const k of ['lastLeftAt','lastRightAt','boardWindow','boardDamage'])delete p[k];
  const at=g.startAt+500;assert.equal(tap484(g,p,input(1,'left',at),at),'cut');assert.equal(tap484(g,p,input(2,'right',at),at),'cut');
  const restored=JSON.parse(JSON.stringify(g));assert.equal(restored.players[0].cuts,2);assert.equal(restored.players[0].lastLeftAt,at);
});

test('the same cabbage only gets finer across 1,000 cuts; every pre-mince tap advances its material',()=>{
  let last=-1;
  for(let cuts=0;cuts<=1000;cuts++){
    const m=material486({cuts},{kind:'cut'}),progress=m.food+m.mix;
    assert.ok(progress>=last);if(cuts&&cuts<=175)assert.ok(progress>last);
    assert.ok(m.food>=0&&m.next<=10);if(cuts>=175)assert.equal(m.food,10);last=progress;
  }
  const chopped={cuts:64,boardWindow:1,boardDamage:7};assert.equal(material486(chopped,{kind:'cut'}).food,material486(chopped,{kind:'stop',index:1}).food);
});

test('local prediction uses real rules without mutating server state; ACK removes exactly confirmed inputs',()=>{
  const g=game(),p=g.players[0],at=g.startAt+100;
  const taps=[input(1,'left',at),input(2,'right',at+1),input(3,'left',at+40)],u={pending:taps,sequence:3};
  const before=structuredClone(p),local=predict486(g,p,taps);assert.equal(local.cuts,3);assert.deepEqual(p,before);
  tap484(g,p,taps[0],at);tap484(g,p,taps[1],at+1);acknowledge486(u,p,at+45);assert.deepEqual(u.pending,[taps[2]]);
  assert.equal(predict486(g,p,u.pending).score,30);assert.equal(p.score,20);
});

test('fresh input bypasses ACK backlog; failures retain unsent input and retry sends no private fields',()=>{
  const g=game(),u={lastFlush:0,pending:[],sequence:0},sent=[];const c={connected:()=>true,raw:(op,m)=>{sent.push(m);return true}};
  u.pending=Array.from({length:12},(_,i)=>input(i+1,i%2?'right':'left',1000+i));flush486(c,u,g,1100);assert.equal(sent[0].taps.length,12);
  u.pending.push(input(13,'left',1200));flush486(c,u,g,1200);assert.deepEqual(sent[1].taps.map(t=>t.seq),[13]);assert.deepEqual(Object.keys(sent[1].taps[0]),['seq','side','at']);
  flush486(c,u,g,1600);assert.equal(sent[2].taps.length,13);
  u.pending.push(input(14,'right',1800));c.raw=()=>false;flush486(c,u,g,1800);assert.equal(u.pending.at(-1).sentAt486,undefined);
  acknowledge486(u,{lastSeq:0},5000);assert.equal(u.pending.length,0);
});

test('40 taps/sec survive 300ms each-way latency, 250ms server ticks, batched retries and reconciliation',()=>{
  const g=game(),p=g.players[0],u={pending:[],lastFlush:0,sequence:0},packets=[],replies=[];let now=g.startAt;
  const party={id:'party',members:[{playerId:'p'}]},session={playerId:'p',connected:true};
  let snapshot=publicCabbage484(g,'p',now),writes=0;
  const server={data:{cabbageRooms484:{CABBAG:g},parties462:{CABBAG:party}},sessions:new Map([['p',session]]),now:()=>now,transaction:f=>{writes++;f()},push:()=>replies.push({at:now+300,g:structuredClone(publicCabbage484(g,'p',now))})};
  const client={connected:()=>true,raw:(op,message)=>{packets.push({at:now+300,message});return true}};
  let created=0;
  for(let elapsed=0;elapsed<=6000;elapsed+=5){
    now=g.startAt+elapsed;
    if(elapsed>=100&&elapsed<4100&&(elapsed-100)%25===0){created++;u.pending.push(input(created,created%2?'left':'right',now));u.sequence=created;assert.equal(predict486(snapshot,snapshot.players[0],u.pending).cuts,created)}
    flush486(client,u,snapshot,now);
    while(packets[0]?.at<=now)queueCabbage484(server,session,packets.shift().message);
    if(elapsed%250===0)advanceCabbages484(server);
    while(replies[0]?.at<=now){snapshot=replies.shift().g;acknowledge486(u,snapshot.players[0],now)}
  }
  assert.equal(created,160);assert.equal(p.cuts,160);assert.equal(p.combo,160);assert.equal(p.score,1680);assert.equal(u.pending.length,0);assert.ok(writes<=25);
});

class Element {
  constructor(){this.dataset={};this.attributes={};this.listeners=new Map();this.values={};this.style={setProperty:(k,v)=>this.values[k]=v};this.classes=new Set();this.classList={add:k=>this.classes.add(k),toggle:(k,v)=>v?this.classes.add(k):this.classes.delete(k)};this.nodes=new Map();this.textContent='';}
  addEventListener(n,f){if(!this.listeners.has(n))this.listeners.set(n,new Set());this.listeners.get(n).add(f)}
  removeEventListener(n,f){this.listeners.get(n)?.delete(f)}
  emit(n,extra={}){const e={cancelable:true,prevented:false,preventDefault(){this.prevented=true},...extra};for(const f of this.listeners.get(n)??[])f(e);return e}
  querySelector(s){return this.nodes.get(s)??null}
  querySelectorAll(s){return this.nodes.get(s)??[]}
  setAttribute(k,v){this.attributes[k]=String(v)} getAttribute(k){return this.attributes[k]??null} removeAttribute(k){delete this.attributes[k]}
  getAnimations(){return []} animate(){return {}}
}
function domClient(g){
  const root=new Element(),stage=new Element(),surface=new Element(),board=new Element(),food=new Element(),layers=[new Element(),new Element()],pads=['left','right'].map(side=>{const b=new Element();b.dataset.cbSide=side;b.closest=()=>b;return b});
  root.nodes.set('.cb-screen',surface);root.nodes.set('.cb-play',surface);root.nodes.set('[data-cb-stage]',stage);root.nodes.set('[data-cb-side]',pads);
  for(const name of ['time','progress','combo','hint','offline','feedback','signal-en','signal-main','signal-note'])root.nodes.set(`[data-cb-${name}]`,new Element());
  for(let seat=0;seat<4;seat++)for(const what of ['score','place','online'])root.nodes.set(`[data-cb-${what}="${seat}"]`,new Element());
  for(const name of ['.cb-knife','.cb-food','.cb-chef'])stage.nodes.set(name,new Element());
  stage.nodes.set('[data-cb-board]',board);stage.nodes.set('[data-cb-food-layer]',layers);stage.nodes.set('.cb-food-layers486',food);
  const sent=[],c={root,state:{cabbage:publicCabbage484(g,'p',g.startAt)},transport:{selfId:'p'},offset:0,ready:()=>true,connected:()=>true,sgMonster463:()=>'',raw:(op,m)=>{sent.push({op,m});return true}};
  cabbageView484(c);c.cbUI484.sound=false;c.cbUI484.reduced=false;return{c,root,stage,surface,board,food,layers,pads,sent};
}

test('view updates score, combo, expected hand and generated food immediately before any server reply',t=>{
  const g=game(),x=domClient(g);let now=g.startAt+100;t.mock.method(Date,'now',()=>now);
  for(let i=0;i<80;i++){now=g.startAt+100+i*25;cabbageTap484(x.c,i%2?'right':'left')}
  assert.equal(x.c.state.cabbage.players[0].score,0);assert.equal(x.root.querySelector('[data-cb-combo]').textContent,80);
  assert.equal(x.root.querySelector('[data-cb-hint]').textContent,'← 次は 左！');assert.equal(x.root.querySelector('[data-cb-score="0"]').dataset.score,'840');
  assert.equal(x.c.cbUI484.pending.length,80);assert.ok(x.layers[1].style.opacity>0);assert.equal(x.pads[0].classes.has('is-next'),true);
  // A server ACK reconciles instead of replaying local cuts or sounds.
  for(const hit of x.c.cbUI484.pending)tap484(g,g.players[0],hit,hit.at);
  x.c.state.cabbage=publicCabbage484(g,'p',now);cabbageReceive484(x.c);assert.equal(x.c.cbUI484.pending.length,0);assert.equal(x.root.querySelector('[data-cb-combo]').textContent,80);
});

test('each illegal tap swaps board art locally; the board persists through stop and the next cut while cabbage remains minced',t=>{
  const g=game(),a=g.startAt+500;g.players[0].cuts=140;g.players[0].score=300;g.windows=[{kind:'stop',at:a,until:a+2000,index:1},{kind:'cut',at:a+2000,until:g.endAt,index:2}];
  const x=domClient(g);let now=a+250;t.mock.method(Date,'now',()=>now);const positions=[];
  for(let i=0;i<10;i++){now=a+250+i*35;cabbageTap484(x.c,'left');assert.equal(x.board.dataset.damage,i+1);positions.push(x.board.style.backgroundPosition)}
  assert.equal(new Set(positions.slice(0,7)).size,7);assert.equal(x.board.style.clipPath,'none');assert.equal(x.board.style.opacity,0);assert.equal(x.stage.dataset.destruction,'table');assert.equal(x.stage.classes.has('is-broken'),true);
  assert.equal(x.root.querySelector('[data-cb-score="0"]').dataset.score,'220');
  const previous=x.layers[0].style.backgroundPosition;now=a+2000;for(const hit of x.c.cbUI484.pending)tap484(g,g.players[0],hit,hit.at);x.c.state.cabbage=publicCabbage484(g,'p',now);cabbageReceive484(x.c);cabbageTap484(x.c,'right');assert.equal(x.board.dataset.damage,10);assert.equal(x.stage.classes.has('is-broken'),true);assert.equal(x.layers[0].style.backgroundPosition,previous);
});

test('generated material keeps changing the minced pile after the final art stage, never restocks',t=>{
  const g=game();g.players[0].cuts=300;const x=domClient(g);let now=g.startAt+100;t.mock.method(Date,'now',()=>now);
  cabbageTap484(x.c,'left');const a=x.food.values['--mince-turn'];now+=25;cabbageTap484(x.c,'right');assert.notEqual(x.food.values['--mince-turn'],a);assert.equal(x.layers[0].style.backgroundPosition,'100% 100%');
});

test('pointer binding accepts both simultaneous thumbs, suppresses duplicate downs and clears capture on cancel',()=>{
  const root=new Element(),hits=[],unbind=bindPads486(root,s=>hits.push(s),true),left={disabled:false,dataset:{cbSide:'left'}},right={disabled:false,dataset:{cbSide:'right'}};
  const down=(id,b)=>root.emit('pointerdown',{target:{closest:()=>b},pointerId:id,button:0,isPrimary:id===1});
  assert.equal(down(1,left).prevented,true);down(2,right);down(1,left);assert.deepEqual(hits,['left','right']);
  root.emit('pointercancel',{pointerId:1});down(1,left);assert.equal(hits.length,3);
  root.emit('pointerup',{pointerId:2});right.disabled=true;down(2,right);assert.equal(hits.length,3);
  unbind();right.disabled=false;down(2,right);assert.equal(hits.length,3);
});

test('touch fallback handles both changed touches; a compatibility click never adds a second cut',()=>{
  const root=new Element(),hits=[],unbind=bindPads486(root,s=>hits.push(s),false);
  const e=root.emit('touchstart',{changedTouches:['left','right'].map(side=>({target:{closest:()=>({dataset:{cbSide:side}})}}))});assert.equal(e.prevented,true);assert.deepEqual(hits,['left','right']);
  const c={};assert.equal(cabbageClick484(c,{dataset:{cbSide:'left'}},{detail:1,pointerType:'touch'}),true);assert.equal(c.cbUI484,undefined);unbind();
});

test('zoom prevention is confined to mounted play surface; it restores exact viewport and removes every listener',()=>{
  const surface=new Element(),meta=new Element(),original='width=device-width,initial-scale=1,viewport-fit=cover';meta.setAttribute('content',original);
  const doc={querySelector:()=>meta},unlock=lockPlayZoom486(surface,doc);
  assert.match(meta.getAttribute('content'),/user-scalable=no/);assert.equal(surface.emit('dblclick').prevented,true);assert.equal(surface.emit('gesturechange').prevented,true);
  assert.equal(surface.emit('touchstart',{touches:[{},{}]}).prevented,true);assert.equal(surface.emit('touchstart',{touches:[{}]}).prevented,false);
  assert.equal(surface.emit('click').prevented,false);unlock();assert.equal(meta.getAttribute('content'),original);assert.equal(surface.emit('dblclick').prevented,false);
  for(const list of surface.listeners.values())assert.equal(list.size,0);
});

test('render cleanup restores zoom and removes active input handlers when leaving the minigame',t=>{
  const g=game(),x=domClient(g),meta=new Element();meta.setAttribute('content','width=device-width,initial-scale=1');
  const old=globalThis.document;globalThis.document={querySelector:()=>meta,visibilityState:'visible'};t.after(()=>globalThis.document=old);t.mock.method(Date,'now',()=>g.startAt+100);
  cabbageAfter484(x.c);assert.match(meta.getAttribute('content'),/user-scalable=no/);cabbageBefore484(x.c);assert.equal(meta.getAttribute('content'),'width=device-width,initial-scale=1');
  for(const handlers of x.root.listeners.values())assert.equal(handlers.size,0);
});

test('private input timestamps are self-only; public damage survives reconnect and result sealing',()=>{
  const g=game(),p=g.players[0],a=g.startAt+1000;g.windows=[{kind:'stop',at:a,until:g.endAt,index:2}];
  tap484(g,p,input(1,'left',a+250),a+250);const view=publicCabbage484(g,'p',a+300),other=publicCabbage484(g,'other',a+300);
  assert.equal(view.players[0].boardDamage,1);assert.equal(view.players[0].lastLeftAt,a+250);assert.ok(!('lastLeftAt'in other.players[0]));assert.equal(view.inputVersion486,3);
  const restored=JSON.parse(JSON.stringify(g));advanceCabbage484(restored,g.endAt+R.maxAge);assert.equal(restored.phase,'result');assert.equal(restored.players[0].boardDamage,1);
  const score=restored.players[0].score;assert.equal(tap484(restored,restored.players[0],input(2,'right',g.endAt-1),g.endAt),'late');assert.equal(restored.players[0].score,score);
});
