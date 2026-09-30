import {HOCKEY564 as C,canShoot564 as canShoot563,TEAM564,power565,speed565} from './Hockey564.js';
import {board564 as board563,resize564 as resize563,paintBoard564 as paintBoard563} from './Board564.js';
import {teamPicker564,teamScoreboard564,hockeyResult564,modePicker565} from './Teams564.js';
import {esc563 as esc,color563 as color,put563 as put,clock563 as clock,avatar563,header563,lobby563} from '../party/Arcade563.js';
import {unlock543} from '../cart/Audio543.js';
import {sound565} from './Audio565.js';
import {lockPlayZoom498} from '../cabbage/Zoom498.js';
const ui=c=>c.ricochetUI550??={seq:0,sound:true,seen:0,limit:24,search:''},me=c=>c.state?.ricochet?.players.find(p=>p.playerId===c.transport.selfId);
const options={prefix:'rc',title:'人間エアホッケー！',sub:'2 vs 2 · AIR HOCKEY',cover:new URL('../../assets/hockey565/court.webp',import.meta.url).href,hero:'ふたりで決めろ、<br>逆転シュート！',rule:'引いて、離す。パックを相手のゴールへ。',detail:'自陣で引いて、離す。丸いパックを相手ゴールへ！ 味方へのパスで弾速が＋5％ずつ強化される。上限なし、打ち返されても強さは残る！ ゴールの２秒後に次のパック。最後の15秒は２点。',players:'２対２ · チーム対戦 · 空席はAI',note:'相棒による能力差はありません。離席・切断中はAIが引き継ぎます。同点は引き分け。',search:'ricochetSearch550'};
export const avatar550=avatar563;
function play(c,g){return `<section class="arc563 arc-play563 pb-play563 hk-play564 hk-play565">${header563(c,ui(c),'rc',options.title,options.sub)}${teamScoreboard564(c,g)}
<div class="pb-stage563" data-rc-stage><canvas data-rc-canvas tabindex="0" role="img" aria-label="自陣で引いて離して発射。味方へのパスで弾速が5％ずつ上限なく増す。パック全体が相手ゴールを通ると得点。矢印キーとスペースでも操作可能。"></canvas>
<div class="hk-modebadge565">${g.hockey565?.speed===2?'弾速 ×2':'STANDARD'}${g.hockey565?.rotor?' · プロペラあり':''}</div>
<div class="pb-pawns563">${g.players.map(p=>`<div class="pb-pawn563" data-rc-pawn="${p.seat}" style="--player:${color(p)};--team:${TEAM564[p.team564].color}"><span>${avatar563(c,p)}</span><b><i>${TEAM564[p.team564].mark}</i>${p.playerId===c.transport.selfId?'YOU':esc(p.name)}</b></div>`).join('')}</div>
<div class="arc-count563" data-rc-count hidden></div>
<div class="hk-goal565" data-rc-goal role="status" hidden><div class="hk-goalshine565"></div><div class="hk-goalcard565"><small data-rc-goaltype>GOAL!</small><div><b data-rc-goalname></b><strong data-rc-goalvalue>+1</strong></div><p data-rc-goaldetail></p><footer><span data-rc-goalnext></span><i><em data-rc-goalmeter></em></i></footer></div></div>
<div class="arc-network563" data-rc-network hidden>再接続中 · AIが引き継いでいます</div></div>
<footer class="pb-control563 hk-control565"><div><b data-rc-help>引いて、離す！</b><span data-rc-ready>発射OK</span><strong data-rc-power>弾速 ×1.00</strong></div><div class="arc-meter563"><i data-rc-meter></i></div><div class="hk-powerrow565"><b data-rc-chain>PASS 0</b><span data-rc-tip>味方へパスで＋5％ · 上限なし</span></div></footer></section>`;}
export function ricochetView550(c){const g=c.state.ricochet,u=ui(c);if(g.id!==u.id)Object.assign(u,{id:g.id,seq:0,seen:0,limit:24,search:'',previous:null,pull:null,pending:null,goalAt565:null});if(g.rules550!==9)return `<section class="arc563">${header563(c,u,'rc',options.title,options.sub)}<div class="arc-body563"><p>エアホッケーを遊ぶには、本体とサーバーをBuild565へ更新して再読み込みしてください。</p></div></section>`;return g.phase==='lobby'?lobby563(c,g,u,{...options,extra:teamPicker564(c,g)+modePicker565(c,g)}):g.phase==='result'?hockeyResult564(c,g,u,options):play(c,g);}
export function ricochetReceive550(c){const g=c.state?.ricochet;if(!g)return;const u=ui(c),p=me(c);u.seq=Math.max(u.seq,p?.lastSeq??0);if(u.pending&&(p?.shots555>u.pending.shot||clock(c)-u.pending.at>1600))u.pending=null;if(g.phase!=='play'||!canShoot563(g,p,clock(c)))u.pull=null;u.receivedAt=performance.now();}
export function ricochetFrame550(c,m){const g=c.state?.ricochet,n=m.ricochet;if(m.selfId!==c.transport.selfId||!g||n?.id!==g.id||n.serverAt<g.serverAt)return;ui(c).previous=g;c.offset=m.serverNow-Date.now();c.state.ricochet={...g,...n,members:n.members??g.members};ricochetReceive550(c);if((g.phase==='result')!==(n.phase==='result'))c.render();}
function send(c,action,extra={}){const g=c.state.ricochet,p=me(c);if(!c.ready()||!canShoot563(g,p,clock(c)))return false;return c.raw('ricochetInput550',{gameId:g.id,seq:++ui(c).seq,round:1,shot:p.shots555,action,...extra});}
function cancel(c,notify=true){const u=ui(c);if(u.pull&&notify)send(c,'cancel');u.pull=null;u.pointer=null;u.keyDown=null;}
function fire(c){const u=ui(c),p=me(c),pull=u.pull;if(pull?.power>=.08&&!u.pending&&send(c,'shoot',{power:pull.power,angle:pull.angle})!==false){u.pending={shot:p.shots555,at:clock(c)};}else if(pull)send(c,'cancel');cancel(c,false);}
function paint(c){
 const u=ui(c),g=c.state.ricochet,p=me(c),n=u.nodes,at=clock(c);if(!g?.goals)return;
 if(u.pending&&at-u.pending.at>1600)u.pending=null;if(u.keyDown&&u.pull)u.pull.power=Math.min(1,(performance.now()-u.keyDown)/700);
 paintBoard563(u.renderer,g,c.transport.selfId,u,at);
 const left=Math.max(0,Math.ceil((g.deadline-at)/1000)),ready=canShoot563(g,p,at)&&!u.pending,waiting=g.phase==='play'&&!g.gem;
 put(n.time,left);n.time.classList.toggle('is-hot',left<=15);
 put(n.help,g.phase==='countdown'?'自陣から打ち返せ！':waiting?'次のパックを準備中':u.pull?'離して、決めろ！':ready?'引いて、離す！':'チャージ中…');
 put(n.ready,waiting?'':u.pull?Math.round(u.pull.power*100)+'%':ready?'発射OK':Math.max(0,(p?.nextShotAt563-at)/1000).toFixed(1)+'秒');
 n.meter.style.transform=`scaleX(${u.pull?.power??(ready?1:Math.max(0,1-((p?.nextShotAt563??at)-at)/C.reload))})`;
 put(n.tip,left<=15?'ラスト15秒！ １ゴール２点':'味方へパスで＋5％ · 上限なし');
 put(n.power,'弾速 ×'+(power565(g.gem)*speed565(g)).toFixed(2));put(n.chain,'PASS '+(g.gem?.charge565??0));n.power.classList.toggle('is-powered',(g.gem?.charge565??0)>0);
 for(const player of g.players){const q=u.renderer.points.find(q=>q.seat===player.seat),el=u.pawns[player.seat];if(q&&el){el.style.transform=`translate(${q.x}px,${q.y}px)`;el.style.setProperty('--size',q.size+'px');el.style.setProperty('--radius',q.radius+'px');el.style.zIndex=String(Math.round(q.y));}}
 for(const team of g.teams564)put(u.scores[team.id],team.score);
 n.count.hidden=g.phase!=='countdown';if(!n.count.hidden)put(n.count,Math.max(1,Math.ceil((g.startAt-at)/1000)));
 const goal=g.lastGoal,age=goal?at-goal.at:Infinity,show=goal&&age>=0&&age<C.respawn&&!g.gem;
 n.goal.hidden=!show;
 if(show){
  const team=TEAM564[goal.team],remaining=Math.max(0,g.gemReadyAt-at);
  n.goal.style.setProperty('--team',team.color);put(n.goaltype,goal.charge565>0?'POWER GOAL!':'GOAL!');put(n.goalname,team.name+'チーム');put(n.goalvalue,'+'+goal.value);
  put(n.goaldetail,goal.ownGoal?'まさかのオウンゴール！':goal.assistSeat!=null?'ふたりで決めた、連携ゴール！':goal.team===p?.team564?'ナイスシュート！':'取り返そう、次の１点！');
  put(n.goalnext,'NEXT PUCK · '+Math.max(1,Math.ceil(remaining/1000)));n.goalmeter.style.transform=`scaleX(${Math.min(1,remaining/C.respawn)})`;
  if(u.goalAt565!==goal.at){u.goalAt565=goal.at;n.goal.classList.remove('is-scored');void n.goal.offsetWidth;n.goal.classList.add('is-scored');u.root.classList.remove('is-impact565');void u.root.offsetWidth;u.root.classList.add('is-impact565');}
 }
 n.network.hidden=c.connected();
 for(const e of g.events){if(e.id<=u.seen)continue;u.seen=e.id;if(Math.abs(at-e.at)>1000)continue;sound565(u,e);}
}
export function ricochetBefore550(c){const u=c.ricochetUI550;if(!u)return;u.cleanup?.();u.cleanup=null;cancelAnimationFrame(u.raf);u.raf=null;u.root=null;cancel(c,false);}
export function ricochetDispose550(c){ricochetBefore550(c);c.ricochetUI550?.audio?.close()?.catch(()=>{});if(c.ricochetUI550)c.ricochetUI550.audio=null;}
export function ricochetAfter550(c){const root=c.root?.querySelector('.pb-play563');if(!root)return;const u=ui(c);u.root=root;u.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;u.nodes=Object.fromEntries(['stage','canvas','time','count','goal','network','help','ready','meter','tip','power','chain','goaltype','goalname','goalvalue','goaldetail','goalnext','goalmeter'].map(k=>[k,root.querySelector(`[data-rc-${k}]`)]));u.pawns=[...root.querySelectorAll('[data-rc-pawn]')];u.scores=Object.fromEntries([...root.querySelectorAll('[data-hk-score]')].map(e=>[e.dataset.hkScore,e]));u.renderer=board563(u.nodes.canvas);const abort=new AbortController(),on=(e,k,fn)=>e.addEventListener(k,fn,{signal:abort.signal}),resize=()=>{cancel(c);resize563(u.renderer,u.nodes.stage.clientWidth,u.nodes.stage.clientHeight,devicePixelRatio||1);};resize();const observer=new ResizeObserver(resize);observer.observe(u.nodes.stage);const zoom=lockPlayZoom498(root);let last=0;
 const move=e=>{if(u.pointer!==e.pointerId||!u.pull)return;const dx=u.origin.x-e.clientX,dy=e.clientY-u.origin.y;u.pull.angle=Math.atan2(dx/u.renderer.sx,dy/u.renderer.sy);u.pull.power=Math.min(1,Math.hypot(dx,dy)/Math.min(125,u.renderer.width*.33));if(clock(c)-last>85){send(c,'pull',u.pull);last=clock(c);}};
 on(u.nodes.canvas,'pointerdown',e=>{const g=c.state.ricochet;if(e.button!==0||u.pointer!=null||u.pending||!canShoot563(g,me(c),clock(c)))return;e.preventDefault();unlock543(u);u.nodes.canvas.focus({preventScroll:true});u.pointer=e.pointerId;u.origin={x:e.clientX,y:e.clientY};u.pull={power:0,angle:0};u.nodes.canvas.setPointerCapture(e.pointerId);});on(u.nodes.canvas,'pointermove',move);on(u.nodes.canvas,'pointerup',e=>{if(e.pointerId!==u.pointer)return;e.preventDefault();move(e);fire(c);});on(u.nodes.canvas,'pointercancel',()=>cancel(c));on(u.nodes.canvas,'lostpointercapture',()=>{if(u.pointer!=null)cancel(c);});on(u.nodes.canvas,'contextmenu',e=>e.preventDefault());on(window,'blur',()=>cancel(c));on(window,'keyup',e=>{if(e.code==='Space'&&u.keyDown){e.preventDefault();fire(c);}});
 const tick=()=>{u.raf=null;if(!u.root||document.hidden)return;paint(c);u.raf=requestAnimationFrame(tick);};on(document,'visibilitychange',()=>{cancel(c);if(document.hidden){cancelAnimationFrame(u.raf);u.raf=null;u.audio?.suspend()?.catch(()=>{});}else{c.refresh?.();if(u.raf==null)tick();}});u.cleanup=()=>{cancel(c);abort.abort();observer.disconnect();zoom();};ricochetReceive550(c);tick();}
export function ricochetClick550(c,b){const d=b.dataset;if(!c.state?.ricochet||!Object.keys(d).some(k=>k.startsWith('rc')))return false;const u=ui(c),g=c.state.ricochet;unlock543(u);if(d.rcRotor!=null||d.rcSpeed!=null)c.raw('ricochet550',{gameId:g.id,kind:'hockeyOptions',rotor:d.rcRotor!=null?d.rcRotor==='true':g.hockey565.rotor,speed:d.rcSpeed!=null?Number(d.rcSpeed):g.hockey565.speed});if(d.rcTeam!=null)c.raw('ricochet550',{gameId:g.id,kind:'team',team:Number(d.rcTeam)});if(d.rcMonster)c.raw('ricochet550',{gameId:g.id,kind:'select',monsterId:d.rcMonster});if(d.rcDuration)c.raw('ricochet550',{gameId:g.id,kind:'duration',seconds:Number(d.rcDuration)});if(d.rcAction==='start')c.raw('ricochet550',{gameId:g.id,kind:'start'});if(d.rcAction==='more'){u.limit+=24;c.render();}if(d.rcAction==='sound'){u.sound=!u.sound;b.textContent='音 '+(u.sound?'ON':'OFF');if(!u.sound)u.audio?.suspend()?.catch(()=>{});else unlock543(u);}return true;}
export function ricochetInput550(c,e){if(e.name!=='ricochetSearch550')return false;ui(c).search=e.value;ui(c).limit=24;c.render();return true;}
export function ricochetKey550(c,e){if(!c.root?.querySelector('.pb-play563')||/INPUT|TEXTAREA/.test(e.target?.tagName))return false;const u=ui(c);if(e.key==='Escape'){cancel(c);return true;}const directions={ArrowUp:0,ArrowRight:Math.PI/2,ArrowDown:Math.PI,ArrowLeft:-Math.PI/2};if(directions[e.key]!=null){e.preventDefault();u.keyAngle=directions[e.key];if(u.pull)u.pull.angle=u.keyAngle;return true;}if(e.code==='Space'){e.preventDefault();if(!e.repeat&&!u.pending&&canShoot563(c.state.ricochet,me(c),clock(c))){unlock543(u);u.keyDown=performance.now();u.pull={power:.08,angle:u.keyAngle??0};}return true;}return false;}
