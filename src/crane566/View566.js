import {CRANE566 as C,LOOT566,canCast566} from './Rules566.js';
import {board566,resize566,paint566,world566,unrotate566} from './Board566.js';
import {esc563 as esc,color563 as color,put563 as put,clock563 as clock,avatar563,header563,lobby563,result563,scoreCards563} from '../party/Arcade563.js';
import {unlock543,sound543} from '../cart/Audio543.js';
import {lockPlayZoom498} from '../cabbage/Zoom498.js';
const ui=c=>c.craneUI566??={seq:0,sound:true,seen:0,limit:24,search:''},me=c=>c.state?.crane?.players.find(p=>p.playerId===c.transport.selfId);
const options={prefix:'cr',title:'よこどり！お宝クレーン',sub:'TREASURE SNATCH',cover:new URL('../../assets/crane566/cover.webp',import.meta.url).href,hero:'そのお宝、<br>いただき！',rule:'狙ってタップ。手元に届くまで、よこどり自由。',detail:'宝を狙ってクレーンを伸ばそう。自分の手元に届くと得点！ 相手の回収中の宝も、クレーンを当てれば横取りできる。大きな宝ほど帰りが遅い。赤い目のミミックを持ち帰ると４点ロスト！',players:'４人対戦 · 90秒 · 空席はAI',search:'craneSearch566'};
function play(c,g){return `<section class="arc563 arc-play563 cr-play566">${header563(c,ui(c),'cr',options.title,options.sub)}${scoreCards563(c,g)}<div class="cr-mission566"><div><small>TREASURE SNATCH</small><b data-cr-mission>届くまで、よこどり自由！</b></div><strong><span data-cr-time>90</span><small>秒</small></strong></div><div class="cr-stage566" data-cr-stage><canvas data-cr-canvas tabindex="0" role="img" aria-label="狙う場所をタップしてクレーン発射。相手の回収中の宝も横取りできます。矢印キーで照準、スペースで発射。"></canvas><div class="cr-pawns566">${g.players.map(p=>`<div data-cr-pawn="${p.seat}" class="cr-pawn566" style="--player:${color(p)}"><span>${avatar563(c,p)}</span><b>${p.playerId===c.transport.selfId?'YOU':esc(p.name)}</b><small data-cr-state="${p.seat}"></small></div>`).join('')}</div><div class="cr-call566" data-cr-call role="status" aria-live="polite" hidden></div><div class="arc-count563" data-cr-count hidden></div><div class="arc-network563" data-cr-network hidden>再接続中 · AIが引き継いでいます</div></div><footer class="cr-control566"><div><b data-cr-help>狙って、タップ！</b><span data-cr-ready>クレーン準備OK</span></div><div class="cr-legend566"><span>金貨 <b>1</b></span><span>宝石 <b>3</b></span><span>宝箱 <b>7</b></span><span>大宝箱 <b>12</b></span><span class="is-danger">ミミック <b>−4</b></span></div></footer></section>`;}
export function craneView566(c){
 const g=c.state.crane,u=ui(c);if(g.id!==u.id)Object.assign(u,{id:g.id,seq:0,seen:0,limit:24,search:'',previous:null,pending:null,aim:null,notice:null});
 if(g.rules566!==1)return `<section class="arc563"><div class="arc-body563">お宝クレーンを遊ぶには、本体とサーバーをBuild566へ更新してください。</div></section>`;
 return g.phase==='lobby'?lobby563(c,g,u,options):g.phase==='result'?result563(c,g,u,{...options,caption:g.winnerIds.includes(c.transport.selfId)?'お宝、いただき！':'お宝争奪戦、決着！',stats:p=>`獲得 ${p.caught}個 · 横取り ${p.steals}回 · ガブッ ${p.bites}回`}):play(c,g);
}
export function craneReceive566(c){const g=c.state?.crane;if(!g)return;const u=ui(c),p=me(c);u.seq=Math.max(u.seq,p?.lastSeq??0);if(u.pending&&(p?.shots>u.pending.shot||clock(c)-u.pending.at>1600))u.pending=null;if(!canCast566(g,p,clock(c)))u.aim=null;u.receivedAt=performance.now();}
export function craneFrame566(c,m){const g=c.state?.crane,n=m.crane;if(m.selfId!==c.transport.selfId||!g||n?.id!==g.id||n.serverAt<g.serverAt)return;ui(c).previous=g;c.offset=m.serverNow-Date.now();c.state.crane={...g,...n};craneReceive566(c);if((g.phase==='result')!==(n.phase==='result'))c.render();}
function cancel(c){const u=ui(c);u.pointer=null;u.aim=null;}
function fire(c,aim){const u=ui(c),g=c.state.crane,p=me(c);if(!aim||u.pending||!c.ready()||!canCast566(g,p,clock(c)))return false;const angle=Math.atan2(aim.y-p.y,aim.x-p.x);unlock543(u);const sent=c.raw('craneInput566',{gameId:g.id,seq:++u.seq,round:1,shot:p.shots,action:'cast',angle});if(sent!==false)u.pending={shot:p.shots,at:clock(c)};cancel(c);return sent!==false;}
function paint(c){
 const g=c.state.crane,u=ui(c),p=me(c),at=clock(c),n=u.nodes;if(!g?.players.length)return;
 if(u.pending&&at-u.pending.at>1600)u.pending=null;
 paint566(u.renderer,g,c.transport.selfId,u,at);
 const ready=canCast566(g,p,at)&&!u.pending&&c.ready(),item=g.loot.find(v=>v.id===p?.hook?.itemId),left=Math.max(0,Math.ceil((g.deadline-at)/1000));
 put(n.time,left);put(n.mission,g.phase==='resolve'?'最後のお宝を回収中！':g.final?'ラスト15秒！ 大宝箱ラッシュ':'届くまで、よこどり自由！');u.root.classList.toggle('is-final',g.final);
 put(n.help,g.phase==='countdown'?'手元に届いたら、得点！':g.phase==='resolve'?'回収を見届けよう！':p?.stunUntil>at?'噛まれた！ ひと休み…':item?.kind==='mimic'?'それ、ミミックー！':item?'持ち帰るまで、気を抜くな！':ready?(u.aim?'ここで離して、つかめ！':'狙って、タップ！'):'クレーン回収中…');
 put(n.ready,item?(LOOT566[item.kind].name+' '+(LOOT566[item.kind].value>0?'+':'')+LOOT566[item.kind].value+'点'):ready?'クレーン準備OK':'');
 for(const player of g.players){const q=u.renderer.points.find(v=>v.seat===player.seat),el=u.pawns[player.seat];if(q)el.style.transform=`translate(${q.x}px,${q.y}px)`;el.classList.toggle('is-bitten',player.stunUntil>at);put(u.scores[player.seat],player.score+'点');const loot=g.loot.find(v=>v.id===player.hook?.itemId),label=loot?(loot.kind==='mimic'?'ミミック！':'回収中 +'+LOOT566[loot.kind].value):player.hook?'狙い中':player.stunUntil>at?'ガブッ！':player.auto?'AI':'準備OK';put(u.status[player.seat],label);put(u.states[player.seat],player.auto?'AI':player.playerId===c.transport.selfId?'あなた':'');}
 n.count.hidden=g.phase!=='countdown';if(!n.count.hidden)put(n.count,Math.max(1,Math.ceil((g.startAt-at)/1000)));
 for(const e of g.events){if(e.id<=u.seen)continue;u.seen=e.id;if(at-e.at>1000)continue;
  const s=g.players[e.seat];let message='';
  if(e.type==='steal')message=(s?.playerId===c.transport.selfId?'あなた':s?.name)+'が、よこどり！';
  else if(e.type==='bite')message=(s?.playerId===c.transport.selfId?'あなた':s?.name)+'、ミミックだった！';
  else if(e.type==='bank'&&e.value>=7)message=(s?.playerId===c.transport.selfId?'あなた':s?.name)+' ＋'+e.value+'点！';
  else if(e.type==='crown')message='大宝箱が出現！';
  else if(e.type==='reverse')message='お宝の回転が逆向きに！';
  if(message)u.notice={message,until:at+1300,color:s?color(s):'#f6d28c'};
  sound543(u,({cast:'launch',grab:'park',steal:'spring',bank:'score',bite:'fall',start:'go',crown:'edge',final:'go'})[e.type]);
 }
 n.call.hidden=!u.notice||at>u.notice.until;if(!n.call.hidden){put(n.call,u.notice.message);n.call.style.setProperty('--player',u.notice.color);}
 n.network.hidden=c.connected();
}
export function craneBefore566(c){const u=c.craneUI566;if(!u)return;u.cleanup?.();u.cleanup=null;cancelAnimationFrame(u.raf);u.raf=null;u.root=null;cancel(c);}
export function craneDispose566(c){craneBefore566(c);c.craneUI566?.audio?.close()?.catch(()=>{});if(c.craneUI566)c.craneUI566.audio=null;}
export function craneAfter566(c){
 const root=c.root?.querySelector('.cr-play566');if(!root)return;const u=ui(c);u.root=root;u.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 u.nodes=Object.fromEntries(['stage','canvas','time','mission','count','call','network','help','ready'].map(k=>[k,root.querySelector(`[data-cr-${k}]`)]));u.pawns=[...root.querySelectorAll('[data-cr-pawn]')];u.scores=[...root.querySelectorAll('[data-arc-score]')];u.status=[...root.querySelectorAll('[data-arc-status]')];u.states=[...root.querySelectorAll('[data-cr-state]')];
 u.renderer=board566(u.nodes.canvas);const abort=new AbortController(),on=(e,k,f)=>e.addEventListener(k,f,{signal:abort.signal}),resize=()=>{cancel(c);resize566(u.renderer,u.nodes.stage.clientWidth,u.nodes.stage.clientHeight,devicePixelRatio||1);};resize();const observer=new ResizeObserver(resize);observer.observe(u.nodes.stage);const zoom=lockPlayZoom498(root);
 const aim=e=>{const rect=u.nodes.canvas.getBoundingClientRect();return world566(u.renderer,e.clientX-rect.left,e.clientY-rect.top,me(c)?.seat??0);};
 on(u.nodes.canvas,'pointerdown',e=>{if(e.button!==0||u.pointer!=null||u.pending||!c.ready()||!canCast566(c.state.crane,me(c),clock(c)))return;e.preventDefault();unlock543(u);u.nodes.canvas.focus({preventScroll:true});u.pointer=e.pointerId;u.aim=aim(e);u.nodes.canvas.setPointerCapture(e.pointerId);});
 on(u.nodes.canvas,'pointermove',e=>{if(e.pointerId===u.pointer)u.aim=aim(e);});
 on(u.nodes.canvas,'pointerup',e=>{if(e.pointerId!==u.pointer)return;e.preventDefault();fire(c,aim(e));cancel(c);});on(u.nodes.canvas,'pointercancel',()=>cancel(c));on(u.nodes.canvas,'lostpointercapture',()=>cancel(c));on(u.nodes.canvas,'contextmenu',e=>e.preventDefault());on(window,'blur',()=>cancel(c));
 const tick=()=>{u.raf=null;if(!u.root||document.hidden)return;paint(c);u.raf=requestAnimationFrame(tick);};
 on(document,'visibilitychange',()=>{cancel(c);if(document.hidden){cancelAnimationFrame(u.raf);u.raf=null;u.audio?.suspend()?.catch(()=>{});}else{c.refresh?.();if(u.raf==null)tick();}});
 u.cleanup=()=>{abort.abort();observer.disconnect();zoom();};craneReceive566(c);tick();
}
export function craneClick566(c,b){const d=b.dataset;if(!c.state?.crane||!Object.keys(d).some(k=>k.startsWith('cr')))return false;const u=ui(c),g=c.state.crane;unlock543(u);if(d.crMonster)c.raw('crane566',{gameId:g.id,kind:'select',monsterId:d.crMonster});if(d.crAction==='start')c.raw('crane566',{gameId:g.id,kind:'start'});if(d.crAction==='more'){u.limit+=24;c.render();}if(d.crAction==='sound'){u.sound=!u.sound;b.textContent='音 '+(u.sound?'ON':'OFF');if(!u.sound)u.audio?.suspend()?.catch(()=>{});else unlock543(u);}return true;}
export function craneInput566(c,e){if(e.name!=='craneSearch566')return false;ui(c).search=e.value;ui(c).limit=24;c.render();return true;}
export function craneKey566(c,e){
 if(!c.root?.querySelector('.cr-play566')||/INPUT|TEXTAREA/.test(e.target?.tagName))return false;const u=ui(c),p=me(c);
 if(e.key==='Escape'){cancel(c);return true;}
 const dirs={ArrowUp:[0,-.7],ArrowDown:[0,.7],ArrowLeft:[-.7,0],ArrowRight:[.7,0]};
 if(dirs[e.key]){e.preventDefault();u.keyPoint??={x:0,y:0};u.keyPoint.x=Math.max(-8,Math.min(8,u.keyPoint.x+dirs[e.key][0]));u.keyPoint.y=Math.max(-8,Math.min(8,u.keyPoint.y+dirs[e.key][1]));u.aim=unrotate566(u.keyPoint.x,u.keyPoint.y,p?.seat??0);return true;}
 if(['Space','Enter'].includes(e.code)){e.preventDefault();if(!e.repeat)fire(c,u.aim??{x:0,y:0});return true;}return false;
}
