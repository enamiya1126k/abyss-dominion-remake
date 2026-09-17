import{CARD_BY_ID463}from'./Catalog463.js';
import{NODES463}from'./Board463.js';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function tileLabel464(n){return({start:'START',goal:'GOAL',draw:'2枚引く',safe:'安全に2枚',move:'3マス進む',back:'2マス戻る',skip:'1回休み',trade:'1枚交換',discard:'2枚捨てる',special:'特殊獲得',lose:'特殊を失う',steal:'1枚奪う',rest:'1枚引く',cleanse:'呪いを解除',wager:'1枚捨て3枚',attribute:'属性札を捨てる',gate:'必ず停止'})[n.kind]??n.name}
export function cardState464(card,h,g,selfId){
 if(h?.playable)return'使える';
 if(h?.ward||card.timing==='reaction')return'攻撃時に防御';
 if(card.timing==='passive')return'所持中に有効';
 if(card.timing==='set')return'4種類で発動';
 if(g.turnPlayerId!==selfId)return'自分の手番に';
 if(g.step==='draw')return'まず1枚引く';
 if(g.pending)return'選択のあとに';
 return card.timing==='pre'?'移動前に使う':card.timing==='post'?'移動後に使う':'この手番は使用済み';
}
export function effectLabel464(e){const n=e.n;return({draw:`カードを${n??''}枚引く`,bonus:`出目 ${n>=0?'+':''}${n}`,dice:`サイコロ +${n}`,move:n<0?`${-n}マス戻る`:`${n}マス進む`,direct:`${n}マス移動`,discard:'手札を捨てる',discardAttr:'属性カードを捨てる',cleanse:'呪いを解除',catastrophe:'手札をすべて捨てる',handSize:'手札枚数を変更',steal:'手札を奪う',swapHand:'手札を交換',special:'特殊カード獲得',loseSpecial:'特殊カードを失う',swapSpecial:'特殊カードを交換',stealSpecial:'特殊カードを奪う',skip:`${n}回休み`,endNow:'手番終了',extraTurn:'もう一度、自分の手番',recover:'捨て札から回収',discardMove:'手札を捨てて移動',resetLeader:'スタートへ戻る',ward:'防御札を用意',boostAttr:'属性の力をためる',defend:'防御発動！'})[e.effectType]??'効果発動'}
export function presentationBusy464(c,g){const f=c.sgFX464;if(!f||f.gameId!==g.id||f.disconnected)return false;return !!f.active||f.queue.length>0||(g.presentation464??[]).some(e=>e.id>f.seen)}
function dice464(n){return`<span class="sg-die464" data-value="${n}">${Array.from({length:9},(_,i)=>`<i class="pip-${i+1}"></i>`).join('')}</span>`}
function write464(c,f,art){
 const layer=c.root?.querySelector('.sg-presentation464');if(!layer)return;
 if(!f.active){layer.innerHTML='';layer.removeAttribute('data-kind');return}
 const e=f.active.event,g=c.state.sugoroku,actor=g.players.find(p=>p.playerId===e.actorId),targets=(e.targetIds??[]).map(id=>g.players.find(p=>p.playerId===id)).filter(Boolean),card=CARD_BY_ID463[e.cardId],age=performance.now()-f.active.start;
 layer.style.setProperty('--sg-stage-h',layer.clientHeight+'px');layer.dataset.kind=e.kind;layer.style.setProperty('--fx-age',`-${age}ms`);layer.classList.toggle('sg-motion-reduced',f.reduced);
 if(e.kind==='card'&&card){layer.innerHTML=`<div class="sg-cast464"><small>${escape(actor?.name)} が使用</small><div class="sg-flip464"><div class="sg-flip-inner464"><div class="sg-back464"><span>ABYSS</span><b>✦</b><span>DOMINION</span></div><div class="sg-front464">${art(card.art)}<b>${escape(card.name)}</b><p>${escape(card.text)}</p></div></div></div></div>`}
 else if(e.kind==='dice'){layer.innerHTML=`<div class="sg-dice-stage464"><small>${escape(actor?.name)} のサイコロ</small><div class="sg-dice-row464">${e.dice.map(dice464).join('')}</div><b class="sg-dice-total464">${e.total}<small>マス進む</small></b><p>${e.genius?'特殊能力で手札の枚数だけ移動':e.total!==e.dice.reduce((s,n)=>s+n,0)?'カード・特殊能力などの補正込み':''}</p></div>`}
 else if(e.kind==='effect'){layer.innerHTML=`<div class="sg-impact464 ${e.harmful?'is-harmful':''}"><small>${e.source==='tile'?escape(NODES463[e.tile]?.name??'マス効果'):escape(actor?.name)}${e.source==='tile'?'':' → '+targets.map(p=>escape(p.name)).join('・')}</small><b>${escape(effectLabel464(e))}</b><span>${e.source==='tile'?targets.map(p=>escape(p.name)).join('・'):e.harmful?'対象に効果発動':''}</span></div>`}
 else layer.innerHTML='';
 for(const el of c.root.querySelectorAll('.sg-seat,.sg-token')){const id=el.dataset.player??el.dataset.sgToken;el.classList.toggle('sg-target464',e.kind==='effect'&&(e.targetIds??[]).includes(id));el.classList.toggle('sg-attacker464',e.kind==='effect'&&id===e.actorId)}
}
function position464(c,f,id,pos){const el=[...c.root.querySelectorAll('[data-sg-token]')].find(e=>e.dataset.sgToken===id),n=NODES463[pos];if(!el||!n)return;el.style.left=n.x+'px';el.style.top=(n.y-48)+'px'}
export function presentationAfter464(c,art,focus){
 const g=c.state?.sugoroku;if(!g)return;
 let f=c.sgFX464;
 if(!f||f.gameId!==g.id){if(f?.raf)cancelAnimationFrame(f.raf);f=c.sgFX464={gameId:g.id,seen:g.presentationSequence464??0,queue:[],active:null,positions:{},reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};}
 if(!c.connected()){f.disconnected=true;f.queue=[];f.active=null;f.positions={};}
 else if(f.disconnected){f.seen=g.presentationSequence464??0;f.disconnected=false;}
 const incoming=(g.presentation464??[]).filter(e=>e.id>f.seen);f.seen=Math.max(f.seen,g.presentationSequence464??0);
 f.queue.push(...incoming);
 for(const e of incoming)if(e.kind==='move'&&f.positions[e.actorId]==null)f.positions[e.actorId]=e.from;
 for(const [id,pos]of Object.entries(f.positions))position464(c,f,id,pos);
 // Renders replace the DOM, not the presentation clock or its pending events.
 write464(c,f,art);
 if(f.raf)cancelAnimationFrame(f.raf);
 const frame=()=>{
  if(c.sgFX464!==f||c.state?.sugoroku?.id!==f.gameId||c.partyBrowse462||!c.root?.querySelector('.sg-game')){f.raf=null;return}
  if(f.active&&performance.now()-f.active.start>=f.active.duration){const e=f.active.event;if(e.kind==='move'){f.positions[e.actorId]=e.to;position464(c,f,e.actorId,e.to)}f.active=null;f.justFinished=true;}
  if(!f.active&&f.queue.length){const e=f.queue.shift(),duration=f.reduced?({card:1400,dice:900,effect:750,move:100}[e.kind]??400):({card:2200,dice:1800,effect:850,move:600}[e.kind]??400);f.active={event:e,start:performance.now(),duration};if(e.kind==='move'){const el=[...c.root.querySelectorAll('[data-sg-token]')].find(x=>x.dataset.sgToken===e.actorId),n=NODES463[e.to];if(el&&n){const from={left:el.style.left,top:el.style.top};position464(c,f,e.actorId,e.to);if(!f.reduced)el.animate([from,{left:el.style.left,top:el.style.top}],{duration,easing:'ease-in-out'});focus(e.to);}}write464(c,f,art);}
  if(!f.active&&!f.queue.length){f.positions={};write464(c,f,art);for(const el of c.root.querySelectorAll('.sg-target464,.sg-attacker464'))el.classList.remove('sg-target464','sg-attacker464');f.raf=null;const finished=f.justFinished;f.justFinished=false;if(finished&&c.state?.sugoroku?.pending?.playerId===c.transport.selfId)c.render();return}
  f.raf=requestAnimationFrame(frame);
 };
 frame();
}
