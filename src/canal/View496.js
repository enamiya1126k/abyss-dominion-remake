import{CANAL496,SPECIES496,wave496}from'./Rules496.js';
import{layout496,draw496,stable496,colors496,crew496}from'./Scene496.js';
import{bindFocus496}from'./Input496.js';
import{flushCanal489,acknowledgeCanal489}from'./Input489.js';
import{lockPlayZoom486}from'../cabbage/Input486.js';
import{view492,after492,click492}from'./View492.js';
import{sound493}from'./Feedback493.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ui=c=>c.cnUI496??={pending:[],seq:0,lastFlush:0,lane:0,targets:new Map(),effects:[],seen:0};
const game=c=>c.state?.canal,mine=c=>game(c)?.players.find(p=>p.playerId===c.transport.selfId),clock=c=>Date.now()+(c.offset??0);
const portrait=(c,id)=>c.sgMonster463?.(id)??'';
function playable(c){const g=game(c);return!!mine(c)&&c.ready()&&['countdown','playing'].includes(g?.phase)&&clock(c)>=g.startAt&&clock(c)<g.endAt&&globalThis.document?.visibilityState!=='hidden'}
export function cooldown496(p,u,at,now){return Math.max(0,Math.min(CANAL496.fireMs,Math.max((p?.nextFireAt??0)-at,u.localFire?CANAL496.fireMs-(now-u.localFire):0)))}
export function view496(c){const g=game(c),u=ui(c),p=mine(c);if(u.gameId!==g.id){Object.assign(u,{gameId:g.id,lane:p?.seat??0,seat:p?.seat??0,pending:[],seq:0,lastFlush:0,targets:new Map(),effects:[],seen:0,localFire:0,preview:null,feedback:null,burstPending:0,callout:null,feed:[],feedSignature:null,snareNote:null,frameLayout:[],motion:new Map(),signal:null})}if(g.phase==='result')return view492(c);
return`<section class="cn-screen cn-play cn496"><header class="cn-header"><button data-party-action462="browse">‹ パーティー</button><div><b>用水路防衛隊</b><small>家を60秒守れ！</small></div><button data-cn-action="sound">音 ${sound493(c)?'ON':'OFF'}</button></header>
<div class="cn-crew496" aria-label="同じ家を守る4人">${g.players.map(x=>`<article style="--crew:${colors496[x.seat]}" class="${x.playerId===c.transport.selfId?'is-self':''}"><span>${portrait(c,x.choice.speciesId)}</span><b>${x.playerId===c.transport.selfId?'あなた':esc(x.name)}${x.ai?' · AI':''}</b><small data-cn-player496="${x.seat}">0匹</small></article>`).join('')}</div>
<div class="cn-stage496" data-cn-stage496><canvas aria-label="生き物をタップして家を守る水路"></canvas><div class="cn-targets496" data-cn-targets496></div>
<div class="cn-lane-title496"><div><small>ONE TEAM / ONE HOME</small><b>みんなで守れ！</b></div><div><b data-cn-time496>60</b><small>秒</small></div><span data-cn-total496>捕獲 0</span></div>
<div class="cn-alert496" role="status" aria-live="polite" data-cn-alert496>敵をタップ！数字の回数で捕獲</div>
<div class="cn-feed496" data-cn-feed496 aria-hidden="true"></div>
${g.players.map(x=>`<div class="cn-helper496 ${x.playerId===c.transport.selfId?'is-self':''}" data-cn-helper496="${x.seat}" style="--crew:${colors496[x.seat]};left:${crew496[x.seat].x*100}%;top:${crew496[x.seat].y*100}%" aria-hidden="true">${portrait(c,x.choice.speciesId)}<span>${x.playerId===c.transport.selfId?'あなた':esc(x.name)}</span><small data-cn-work496="${x.seat}"></small></div>`).join('')}
<div class="cn-count496" data-cn-count496 role="status"><small>この家を、みんなで守る。</small><strong data-cn-count-number496>3</strong><b>敵をタップして捕獲！</b><span>仲間の色の網に続けて、連携捕獲！<br>家に着かれると共通HPが減る！</span></div>
<div class="cn-hp-sr496" data-cn-health496 role="progressbar" aria-label="みんなの家の体力" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"></div>
</div><footer class="cn-bottom496"><button class="cn-mega496" data-cn-action="burst" disabled><i aria-hidden="true"></i><span><b>4人で、一網打尽！</b><small data-cn-net-note496>捕獲で大網をためよう</small><em><i data-cn-energy496></i></em></span><strong data-cn-net-count496>0 / ${CANAL496.netMax}</strong></button></footer>
<div class="cn-offline" data-cn-offline496 hidden><strong>再接続中…AIが援護しているよ</strong><button data-race-action="refresh">接続を確認</button></div>${c.error?`<p class="cn-error" role="alert">${esc(c.error)}</p>`:''}</section>`}
function sound(c,kind){if(!sound493(c)||globalThis.document?.visibilityState==='hidden')return;const u=ui(c);try{const Audio=globalThis.AudioContext??globalThis.webkitAudioContext;if(!Audio)return;u.audio??=new Audio();u.audio.resume().catch(()=>{});const a=u.audio,t=a.currentTime,o=a.createOscillator(),v=a.createGain();o.type=kind==='alarm'?'sawtooth':'triangle';o.frequency.setValueAtTime(kind==='alarm'?180:kind==='catch'?720:470,t);o.frequency.exponentialRampToValueAtTime(kind==='catch'?1050:95,t+.12);v.gain.setValueAtTime(.025,t);v.gain.exponentialRampToValueAtTime(.001,t+.15);o.connect(v);v.connect(a.destination);o.start(t);o.stop(t+.16);o.onended=()=>{o.disconnect();v.disconnect()}}catch{}}
function submit(c,payload){const u=ui(c),g=game(c);if(!playable(c)||u.pending.length>=96)return false;acknowledgeCanal489(u,mine(c));if(u.seq>=50000)return false;u.pending.push({seq:++u.seq,lane:u.lane,held:false,pulse:false,burst:false,...payload});flushCanal489(c,u,g,Date.now());return true}
export function target496(c,id){const u=ui(c),e=game(c)?.enemies.find(e=>e.id===id);if(!playable(c)||!e||cooldown496(mine(c),u,clock(c),Date.now())>0)return false;if(!submit(c,{pulse:true,targetId:id,lane:e.lane}))return false;u.localFire=Date.now();u.preview={kind:'stroke',localAt:Date.now(),lane:e.lane,seat:u.seat,enemyId:e.id,point:u.frameLayout.find(x=>x.id===id)};sound(c,'net');tick496(c);return true}
export function before496(c){c.cnUI496?.cleanup?.();if(c.cnUI496)c.cnUI496.cleanup=null}
export function dispose496(c){before496(c);const u=c.cnUI496;if(u){u.audio?.close().catch(()=>{});u.audio=null;u.pending=[]}}
export function after496(c){if(game(c)?.phase==='result')return after492(c);const stage=c.root?.querySelector('[data-cn-stage496]');if(!stage)return;const u=ui(c);u.targets=new Map();u.reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
if(globalThis.Image)for(const [key,path]of [['background','canal496/shared-pond.png'],['atlas','canal492/creatures.png'],['props','canal492/props.png'],['netArt497','canal497/net-effects.png']])if(!u[key]){u[key]=new Image();u[key].src='./assets/'+path;u[key].decode?.().then(()=>tick496(c)).catch(()=>{})}
const unbind=bindFocus496(stage,{tap:id=>target496(c,id)}),unlock=lockPlayZoom486(c.root.querySelector('.cn496'));u.cleanup=()=>{unbind();unlock();u.targets.clear()};tick496(c)}
export function click496(c,b,e){if(game(c)?.phase==='result')return click492(c,b,e);if(b.dataset.cnTarget496!==undefined){if(e?.detail===0&&!e?.pointerType&&!e?.sourceCapabilities?.firesTouchEvents)target496(c,Number(b.dataset.cnTarget496));return true}const a=b.dataset.cnAction;if(!a)return false;const u=ui(c);if(a==='sound'){const enabled=sound493(c,!sound493(c));b.textContent='音 '+(enabled?'ON':'OFF');if(!enabled)u.audio?.suspend().catch(()=>{});else sound(c,'net')}else if(a==='burst'&&playable(c)&&game(c).netEnergy>=CANAL496.netMax&&clock(c)>=(game(c).netUntil??0)&&Date.now()-(u.burstPending??0)>700){if(submit(c,{burst:true})){u.burstPending=Date.now();sound(c,'catch');tick496(c)}}return true}
export function key496(c,e){if(!c.root?.querySelector('.cn496')||e.target.closest?.('input,textarea,select')||e.ctrlKey||e.metaKey||e.altKey)return false;const key=e.key.toLowerCase();if(key===' '&&!e.target.closest?.('button')){e.preventDefault();if(!e.repeat)click496(c,{dataset:{cnAction:'burst'}},e);return true}return false}
export function receive496(c){const u=ui(c),g=game(c);if(u.gameId!==g?.id)return;acknowledgeCanal489(u,mine(c));
 const who=seat=>seat===u.seat?'あなた':(g.players.find(p=>p.seat===seat)?.name??'仲間');
 for(const e of g.events??[]){if(e.id<=u.seen)continue;u.seen=e.id;if(clock(c)-e.at>1800)continue;u.effects.push({...e,point:u.targets.get(e.enemyId)?.point,localAt:Date.now()});
  if(e.kind==='catch'&&!e.mega){if(e.seat===u.seat)sound(c,'catch');const helpers=(e.helpers??[]).map(who);const text=e.teamwork?`${helpers.join('・')} ＋ ${who(e.seat)}：連携捕獲！`:e.rescue?`${who(e.seat)}、ナイス救援！`:`${who(e.seat)}が捕獲！`;
   u.feed??=[];u.feed.push({text,color:colors496[e.seat],until:Date.now()+1600});u.feed=u.feed.slice(-2);
   if(e.teamwork||e.rescue)u.feedback={until:Date.now()+1100,text:e.rescue?'ナイス救援！ 家を守った！':'連携捕獲！ 大網ゲージ＋2'};
  }
  if(e.kind==='hit'&&e.slow)u.snareNote={until:Date.now()+650,text:who(e.seat)+'が足止め！ みんなで続け！'};
  if(e.kind==='flood')u.callout={until:Date.now()+1800,text:'全水門、開放！ 最後の10秒！'};
  if(e.kind==='boss')u.callout={until:Date.now()+1500,text:'ザリ将軍が来た！ みんなの網を重ねろ！'};
  if(e.kind==='breach'){sound(c,'alarm');u.callout={until:Date.now()+1000,text:`侵入！ 家に −${e.damage}！ 赤い敵を急げ！`}};
  if(e.kind==='mega')u.callout={until:Date.now()+1100,text:'4人で、一網打尽！'};
 }u.effects=u.effects.slice(-48);tick496(c)}
function targets(c,u,layout){const host=c.root.querySelector('[data-cn-targets496]');if(!host?.ownerDocument?.createElement)return;const ids=new Set(layout.map(x=>x.id));for(const[id,x]of u.targets)if(!ids.has(id)){x.button.remove();u.targets.delete(id)}for(const e of layout){let x=u.targets.get(e.id);if(!x){const b=host.ownerDocument.createElement('button');b.type='button';b.className='cn-target496';b.dataset.cnTarget496=String(e.id);host.appendChild(b);x={button:b};u.targets.set(e.id,x)}x.point={x:e.x,y:e.y};const b=x.button;b.style.left=e.x+'px';b.style.top=e.y+'px';b.style.width=b.style.height=e.touchSize+'px';b.style.zIndex=String(10+Math.round(e.progress*10));b.disabled=!playable(c);b.setAttribute('aria-label',SPECIES496[e.kind].name+'。あと'+e.hp+'回で捕獲');b.classList.toggle('is-cooling',u.preview?.enemyId===e.id&&cooldown496(mine(c),u,clock(c),Date.now())>0)}}
export function tick496(c){const root=c.root,g=game(c),stage=root?.querySelector('[data-cn-stage496]');if(!g||!stage)return;const u=ui(c),p=mine(c),now=Date.now(),at=Math.min(clock(c),(g.serverNow??clock(c))+750),elapsed=Math.max(0,at-g.startAt);
 flushCanal489(c,u,g,now);const set=(q,t)=>{const el=root.querySelector(q);if(el&&el.textContent!==String(t))el.textContent=t};
 set('[data-cn-time496]',Math.max(0,Math.min(60,Math.ceil((g.endAt-at)/1000))));set('[data-cn-total496]','捕獲 '+g.captured+'匹');
 for(const x of g.players){set(`[data-cn-player496="${x.seat}"]`,`${x.captured}匹 · 連携${x.teamwork??0}`);const age=at-(x.lastAction?.at??0),active=age>=0&&age<600,helper=root.querySelector(`[data-cn-helper496="${x.seat}"]`);helper?.classList.toggle('is-casting',active);set(`[data-cn-work496="${x.seat}"]`,active?x.lastAction?.burst?'一網打尽！':'網を投げた！':x.auto?'AI代行中':'')}
 const canvas=stage.querySelector('canvas');u.teach=(p?.captured??0)===0;u.frameLayout=stable496(layout496(g.enemies,at,stage.clientWidth,stage.clientHeight),u,now,stage.clientWidth,stage.clientHeight);
 const danger=u.frameLayout.some(e=>e.eta<2500),ready=g.netEnergy>=CANAL496.netMax&&at>=(g.netUntil??0),alert=root.querySelector('[data-cn-alert496]');
 const note=at<g.startAt?'敵をタップ！ 数字の回数で捕獲':u.callout?.until>now?u.callout.text:ready?'大網が満タン！ 下の金色ボタンで一網打尽！':danger?'家の手前！ 赤い敵を急いで捕獲！':u.feedback?.until>now?u.feedback.text:u.snareNote?.until>now?u.snareNote.text:elapsed>=50000?'全水門、開放中！ 最後まで守れ！':(p?.captured??0)<3?'敵をタップ！ 数字の回数で捕獲':wave496(elapsed).name;
 set('[data-cn-alert496]',note);alert?.classList.toggle('is-danger',danger||g.hp<=30);if((g.hp<=30||elapsed>=50000)&&u.signal!==Math.floor(elapsed/5000)){u.signal=Math.floor(elapsed/5000);sound(c,'alarm')}
 const health=root.querySelector('[data-cn-health496]');health?.setAttribute('aria-valuenow',String(g.hp));stage.classList.toggle('is-critical',g.hp<=30);stage.classList.toggle('is-finale',elapsed>=50000);
 const count=root.querySelector('[data-cn-count496]');if(count){count.hidden=at>=g.startAt;set('[data-cn-count-number496]',at<g.startAt-3000?'準備！':Math.max(1,Math.ceil((g.startAt-at)/1000)))}
 const feed=root.querySelector('[data-cn-feed496]');if(feed){const items=(u.feed??[]).filter(x=>x.until>now),signature=items.map(x=>x.text).join('|');if(signature!==u.feedSignature){u.feedSignature=signature;feed.innerHTML=items.map(x=>`<span style="--crew:${x.color}">${esc(x.text)}</span>`).join('')}}
 const mega=root.querySelector('[data-cn-action="burst"]');if(mega){mega.disabled=!playable(c)||!ready||now-(u.burstPending??0)<700;mega.classList.toggle('is-ready',ready)}set('[data-cn-net-note496]',ready?'今だ！ 仲間と一緒に全員で網を投げる！':'捕獲で＋1・仲間と連携なら＋2');set('[data-cn-net-count496]',ready?'発動！':g.netEnergy+' / '+CANAL496.netMax);const energy=root.querySelector('[data-cn-energy496]');if(energy)energy.style.width=Math.min(100,g.netEnergy/CANAL496.netMax*100)+'%';const off=root.querySelector('[data-cn-offline496]');if(off)off.hidden=c.ready();
 targets(c,u,u.frameLayout);draw496(canvas,g,u,at,now,u.frameLayout);
}
