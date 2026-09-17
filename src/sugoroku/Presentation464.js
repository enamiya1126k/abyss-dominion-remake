import{rankStyle466,SPECIAL_SHORT466}from'./CardRanks466.js';
import{distance463}from'./Board463.js';
import{CARD_BY_ID463,SPECIAL_BY_ID463}from'./Catalog463.js';
import{NODES465 as NODES463}from'./Adventure467.js';
import{duration465}from'./Pacing465.js';
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
const name465=(c,p)=>p?.playerId===c.transport.selfId?'あなた':p?.name??'冒険者';
function pawn465(c,p,token,role){if(!p)return'';return`<div class="sg-event-pawn465 ${role??''}" style="--seat:${['#68b4ff','#79dda9','#ffb367','#ef91ca'][p.seat??0]}"><span>${token(p)}</span><b>${escape(name465(c,p))}</b></div>`}

function capture466(g){return structuredClone({players:g.players,hand:g.hand,ownScore:g.ownScore,turnPlayerId:g.turnPlayerId,step:g.step,lastRoll:g.lastRoll})}
export function visualGame466(c,g){const f=c.sgFX464;return presentationBusy464(c,g)&&f?.visual466?{...g,...f.visual466,hand:f.visual466.hand.map(h=>({...h,playable:false})),pending:null}:g}
function applySnapshot466(f,s){if(!s||!f.visual466)return;const v=f.visual466;v.players=v.players.map(p=>({...p,...s.status465?.find(x=>x.playerId===p.playerId)}));if(s.hand466)v.hand=structuredClone(s.hand466);if(s.score466)v.ownScore=s.score466;if(s.turnPlayerId466)v.turnPlayerId=s.turnPlayerId466;if(s.step466)v.step=s.step466}
const back466=()=>'<div class="sg-back464"><span>ABYSS</span><b>✦</b><span>DOMINION</span></div>';
function write464(c,f,art,token){
 const layer=c.root?.querySelector('.sg-presentation464');if(!layer)return;
 if(!f.active){layer.innerHTML='';layer.removeAttribute('data-kind');layer.classList.remove('is-dark-instant467');return}
 const e=f.active.event,g=c.state.sugoroku,actor=g.players.find(p=>p.playerId===e.actorId),targets=(e.targetIds??[]).map(id=>g.players.find(p=>p.playerId===id)).filter(Boolean),card=CARD_BY_ID463[e.cardId],age=performance.now()-f.active.start;
 const height=Math.max(220,layer.parentElement?.clientHeight??300),cardHeight=Math.max(180,Math.min(310,height-70));
 layer.style.setProperty('--sg-stage-h',height+'px');layer.style.setProperty('--card-h465',cardHeight+'px');layer.style.setProperty('--card-w465',Math.round(cardHeight*.68)+'px');layer.style.setProperty('--fx-age',`-${age}ms`);layer.dataset.kind=e.kind;layer.classList.toggle('is-dark-instant467',e.kind==='card'&&card?.kind==='bad'&&e.activation466==='instant');layer.classList.toggle('sg-motion-reduced',f.reduced);
 if(e.kind==='card'&&card){layer.innerHTML=`${card.kind==='bad'&&e.activation466==='instant'?'<div class="sg-dark-title467"><small>引いてしまった…！</small><b>闇の速攻</b><span>強制発動</span></div>':''}<div class="sg-cast465"><div class="sg-caster465">${pawn465(c,actor,token,'is-source')}<small>${e.activation466==='instant'?'速攻カードを引いた！<br>強制発動':e.activation466==='blocked'?'悪い速攻を引いた<br>無効化！':'このカードを使用'}</small></div><div class="sg-flip464"><div class="sg-flip-inner464">${back466()}<div class="sg-front464" style="${rankStyle466(card)}">${art(card.art)}<small class="sg-rank466">${escape(card.rank466)}</small><b>${escape(card.name)}</b><p>${escape(card.text)}</p></div></div></div><div class="sg-event-progress465"></div></div>`}
 else if(e.kind==='draw'){
  const own=e.actorId===c.transport.selfId,drawn=own?CARD_BY_ID463[e.drawCardId466]:null,from=g.players.find(p=>p.playerId===e.fromPlayerId466),source=CARD_BY_ID463[e.sourceCardId466]?.name??(e.tile?NODES463[e.tile]?.name:e.source==='turn'?'手番のドロー':'カードを獲得');
  layer.innerHTML=`<div class="sg-draw466 ${own?'is-own':'is-hidden'}"><div class="sg-draw-heading466">${pawn465(c,from??actor,token)}<div><small>${escape(from?name465(c,from)+'の手札から':source)}</small><b>${escape(name465(c,actor))}が1枚引く</b><span>${e.ordinal466} / ${e.total466} 枚</span></div></div><div class="sg-draw-card466"><div class="sg-draw-flipper466">${back466()}${drawn?`<div class="sg-front464" style="${rankStyle466(drawn)}">${art(drawn.art)}<small class="sg-rank466">${escape(drawn.rank466)}</small><b>${escape(drawn.name)}</b><p>${escape(drawn.summary466)}</p></div>`:back466()}</div></div><small class="sg-draw-result466">${own?'あなたの手元へ':'中身は本人だけに表示'}</small></div>`;
 }
 else if(e.kind==='awaken'){
 const sp=SPECIAL_BY_ID463[e.specialId466];layer.innerHTML=`<div class="sg-awaken466"><div class="sg-awaken-circle466"></div><div class="sg-awaken-beam466"></div>${Array.from({length:18},(_,i)=>`<i class="sg-awaken-spark466" style="--i:${i}"></i>`).join('')}<small>深淵の力が目覚める</small><b class="sg-awaken-title466">覚 醒</b>${pawn465(c,actor,token)}<h2>${escape(sp?.name)}</h2><p>${escape(SPECIAL_SHORT466[e.specialId466]??sp?.text)}</p><span>特殊カード獲得</span></div>`;
 }
 else if(e.kind==='dice'){layer.innerHTML=`<div class="sg-dice-stage464">${pawn465(c,actor,token)}<div><small>運命の出目</small><img class="sg-dice-spin467" src="./assets/sugoroku467/dice.png" alt="回転するサイコロ"><div class="sg-dice-row464">${e.dice.map(dice464).join('')}</div><b class="sg-dice-total464">${e.total}<small>マス進む</small></b><p>${e.genius?'特殊能力：手札の枚数で移動':e.total!==e.dice.reduce((s,n)=>s+n,0)?'カード・特殊能力の補正込み':''}</p></div></div>`}
 else if(e.kind==='effect'){
  const own=e.actorId===targets[0]?.playerId,isTile=e.source==='tile',origin=isTile?NODES463[e.tile]?.name:card?.name??SPECIAL_BY_ID463[e.specialId466]?.name??(e.source==='turn'?'手番のドロー':e.effectType==='defend'?'防御':'カード効果');
  layer.innerHTML=`<div class="sg-impact465 ${e.harmful?'is-harmful':''}"><small class="sg-effect-origin465">${escape(origin)}</small><div class="sg-effect-people465">${!isTile&&!own?pawn465(c,actor,token,'is-source')+'<span class="sg-effect-arrow465">➜</span>':''}${targets.map(p=>pawn465(c,p,token,'is-target')).join('')}<div><b class="sg-effect-label465">${escape(effectLabel464(e))}</b><small>${isTile?'止まったマスの効果':own?'自分に効果発動':e.harmful?'この相手への攻撃':'対象に効果発動'}</small></div></div></div>`;
 }else if(e.kind==='move'){layer.innerHTML=`<div class="sg-movement465">${pawn465(c,actor,token)}<div><b>1マスずつ移動中</b><span data-move-count465></span></div></div>`}else layer.innerHTML='';
 for(const el of c.root.querySelectorAll('.sg-seat,.sg-token')){const id=el.dataset.player??el.dataset.sgToken;el.classList.toggle('sg-target464',e.kind==='effect'&&(e.targetIds??[]).includes(id));el.classList.toggle('sg-attacker464',e.kind==='effect'&&id===e.actorId)}
 for(const el of c.root.querySelectorAll('[data-sg-tile]'))el.classList.toggle('sg-landed466',e.kind==='effect'&&e.tile===el.dataset.sgTile);
 const step=e.kind==='draw'?'draw':e.kind==='dice'||e.kind==='move'?'move':e.source==='tile'?'tile':'card';for(const el of c.root.querySelectorAll('[data-phase466]'))el.classList.toggle('is-current',el.dataset.phase466===step);
}
function position464(c,f,id,pos){const el=[...c.root.querySelectorAll('[data-sg-token]')].find(e=>e.dataset.sgToken===id),n=NODES463[pos];if(!el||!n)return;el.style.left=n.x+'px';el.style.top=(n.y-48)+'px';const p=f.visual466?.players.find(p=>p.playerId===id);if(p)p.pos=pos;const seat=[...c.root.querySelectorAll('.sg-seat')].find(e=>e.dataset.player===id);const remaining=seat?.querySelector('b');if(remaining&&!p?.finished)remaining.textContent='残'+distance463(pos)+'マス'}
export function presentationAfter464(c,art,token,focus){
 const g=c.state?.sugoroku;if(!g)return;let f=c.sgFX464;
 if(!f||f.gameId!==g.id){if(f?.raf)cancelAnimationFrame(f.raf);f=c.sgFX464={gameId:g.id,seen:g.presentationSequence464??0,queue:[],active:null,positions:{},visual466:capture466(g),reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};}
 if(!c.connected()){f.disconnected=true;f.queue=[];f.active=null;f.positions={};f.visual466=capture466(g);}
 else if(f.disconnected){f.seen=g.presentationSequence464??0;f.disconnected=false;f.visual466=capture466(g);}
 const incoming=(g.presentation464??[]).filter(e=>e.id>f.seen);f.seen=Math.max(f.seen,g.presentationSequence464??0);f.queue.push(...incoming);
 for(const e of incoming)if(e.kind==='move'&&f.positions[e.actorId]==null)f.positions[e.actorId]=e.from;
 for(const [id,pos]of Object.entries(f.positions))position464(c,f,id,pos);
 write464(c,f,art,token);if(f.raf)cancelAnimationFrame(f.raf);
 const frame=()=>{
  if(c.sgFX464!==f||c.state?.sugoroku?.id!==f.gameId||c.partyBrowse462||!c.root?.querySelector('.sg-game')){f.raf=null;return}
  let boundary=false;
  if(f.active&&performance.now()-f.active.start>=f.active.duration){const e=f.active.event;applySnapshot466(f,e.after466);if(e.kind==='move'){f.positions[e.actorId]=e.to;position464(c,f,e.actorId,e.to)}if(e.kind==='dice')f.visual466.lastRoll={playerId:e.actorId,dice:e.dice,total:e.total};f.active=null;f.justFinished=true;boundary=true;}
  if(!f.active&&f.queue.length){const e=f.queue.shift(),duration=e.duration465??duration465(e);f.active={event:e,start:performance.now(),duration,lastStep:-1};if(e.kind==='move')focus(e.from);if(e.kind==='awaken')c.sound452?.play('win');if(e.kind==='card'&&e.activation466==='instant'&&CARD_BY_ID463[e.cardId]?.kind==='bad')c.sound452?.tone(130,0,.7,.035,'sawtooth',38);write464(c,f,art,token);}
  if(f.active?.event.kind==='move'){const a=f.active,e=a.event,path=e.path465?.length?e.path465:[e.from,e.to],index=Math.min(path.length-1,Math.floor((performance.now()-a.start)/a.duration*path.length));if(index!==a.lastStep){a.lastStep=index;f.positions[e.actorId]=path[index];position464(c,f,e.actorId,path[index]);focus(path[index]);const counter=c.root.querySelector('[data-move-count465]');if(counter)counter.textContent=`${index} / ${path.length-1} マス`;}}
  c.root.querySelector('.sg-game')?.classList.toggle('is-presenting465',!!f.active);
  if(!f.active&&!f.queue.length){f.positions={};f.visual466=capture466(c.state.sugoroku);write464(c,f,art,token);for(const el of c.root.querySelectorAll('.sg-target464,.sg-attacker464,.sg-landed466'))el.classList.remove('sg-target464','sg-attacker464','sg-landed466');f.raf=null;const finished=f.justFinished;f.justFinished=false;if(finished)c.render();return}
  if(boundary){c.render();return}f.raf=requestAnimationFrame(frame);
 };frame();
}
