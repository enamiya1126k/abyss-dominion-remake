import{arrivalText472}from'./Experience472.js';
import{pawnAnchor470,specialDeck470,specialBack470,specialCard470,cardCue470,effectIcon470}from'./Readability470.js';
import{die469,deck469,defenseResult469}from'./Objects469.js';
import{photoCardArt468,puzzle468,SERIES_ART468}from'./PhotoArt468.js';
import{completedSeries468}from'./Series468.js';
import{rankStyle466,SPECIAL_SHORT466}from'./CardRanks466.js';
import{distance463}from'./Board463.js';
import{CARD_BY_ID463,SPECIAL_BY_ID463}from'./Catalog463.js';
import{NODES465 as NODES463}from'./Adventure467.js';
import{duration465}from'./Pacing465.js';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function tileLabel464(n){if(n.landmark469)return n.name;return({start:'START',goal:'GOAL',draw:'2枚引く',safe:'安全に2枚',move:'3マス進む',back:'2マス戻る',skip:'1回休み',trade:'1枚交換',discard:'2枚捨てる',special:'特殊獲得',lose:'特殊を失う',steal:'1枚奪う',rest:'1枚引く',cleanse:'呪いを解除',wager:'1枚捨て3枚',attribute:'属性札−2枚',gate:'神殿で絵柄'})[n.kind]??n.name}
export function cardState464(card,h,g,selfId){
 if(h?.playable)return'使える';
 if(h?.ward||card.timing==='reaction')return'攻撃時に防御';
 if(card.timing==='passive')return'所持中に有効';
 if(card.timing==='set')return'4種類で発動';
 if(g.turnPlayerId!==selfId)return'自分の手番に';
 if(g.step==='draw')return'まず1枚引く';
 if(g.pending)return'選択のあとに';if(g.ownCardsUsed469)return'この手番は使用済み';
 return card.timing==='pre'?'移動前に使う':card.timing==='post'?'移動後に使う':'この手番は使用済み';
}
export function effectLabel464(e){const n=e.n;return({draw:`カードを${n??''}枚引く`,bonus:`出目 ${n>=0?'+':''}${n}`,dice:`サイコロ +${n}`,move:n<0?`${-n}マス戻る`:`${n}マス進む`,direct:`${n}マス移動`,discard:'手札を捨てる',discardAttr:'属性カードを捨てる',cleanse:'呪いを解除',catastrophe:'手札を2枚捨てる',handSize:'手札枚数を変更',piece:'未所持の絵柄を獲得',resonance:'属性の共鳴',goalCurse469:'呪いで6マス後退・解除',steal:'手札を奪う',swapHand:'手札を交換',special:'特殊カード獲得',loseSpecial:'特殊カードを失う',swapSpecial:'特殊カードを交換',stealSpecial:'特殊カードを奪う',skip:`${n}回休み`,endNow:'手番終了',extraTurn:'もう一度、自分の手番',recover:'捨て札から回収',discardMove:'手札を捨てて移動',resetLeader:'スタートへ戻る',ward:'防御札を用意',boostAttr:'属性の力をためる',defend:'防御発動！'})[e.effectType]??'効果発動'}
export function presentationBusy464(c,g){const f=c.sgFX464;if(!f||f.gameId!==g.id||f.disconnected)return false;return !!f.active||f.queue.length>0||(g.presentation464??[]).some(e=>e.id>f.seen)}
function dice464(n){return`<span class="sg-die464" data-value="${n}">${Array.from({length:9},(_,i)=>`<i class="pip-${i+1}"></i>`).join('')}</span>`}
const name465=(c,p)=>p?.playerId===c.transport.selfId?'あなた':p?.name??'冒険者';
function pawn465(c,p,token,role){if(!p)return'';return`<div class="sg-event-pawn465 ${role??''}" style="--seat:${['#68b4ff','#79dda9','#ffb367','#ef91ca'][p.seat??0]}"><span>${token(p)}</span><b>${escape(name465(c,p))}</b></div>`}

function capture466(g){return structuredClone({players:g.players,hand:g.hand,ownScore:g.ownScore,turnPlayerId:g.turnPlayerId,turnNumber:g.turnNumber,step:g.step,lastRoll:g.lastRoll})}
export function visualGame466(c,g){const f=c.sgFX464;return presentationBusy464(c,g)&&f?.visual466?{...g,...f.visual466,hand:f.visual466.hand.map(h=>({...h,playable:false})),pending:null}:g}
function applySnapshot466(f,s){if(!s||!f.visual466)return;if(s.hand466)queueCompleted468(f,s.hand466);const v=f.visual466;v.players=v.players.map(p=>({...p,...s.status465?.find(x=>x.playerId===p.playerId)}));if(s.hand466)v.hand=structuredClone(s.hand466);if(s.score466)v.ownScore=s.score466;if(s.turnPlayerId466)v.turnPlayerId=s.turnPlayerId466;if(s.turnNumber466!=null)v.turnNumber=s.turnNumber466;if(s.step466)v.step=s.step466}
function queueCompleted468(f,hand){const completed=completedSeries468(f.seriesHand468??hand,hand);f.seriesHand468=hand.map(h=>({...h}));for(const set468 of completed.reverse())f.queue.unshift({kind:'series468',set468,duration465:2200});}
const back466=()=>'<div class="sg-back464"><span>ABYSS</span><b>✦</b><span>DOMINION</span></div>';
function write464(c,f,art,token){
 const layer=c.root?.querySelector('.sg-presentation464');if(!layer)return;const viewport=c.root.querySelector('.sg-viewport');if(viewport&&layer.parentElement!==viewport)viewport.append(layer);layer.classList.remove('sg-stage-overlay471');
 if(!f.active){layer.innerHTML='';layer.removeAttribute('data-kind');layer.classList.remove('is-dark-instant467','is-other-draw472','is-short472');return}
 const e=f.active.event,g=c.state.sugoroku,actor=g.players.find(p=>p.playerId===e.actorId),targets=(e.targetIds??[]).map(id=>g.players.find(p=>p.playerId===id)).filter(Boolean),card=CARD_BY_ID463[e.cardId],age=performance.now()-f.active.start;
 const height=Math.max(80,layer.clientHeight||layer.parentElement?.clientHeight||300),cardHeight=Math.max(180,Math.min(310,height-70));
 layer.style.setProperty('--sg-stage-h',height+'px');layer.style.setProperty('--card-h465',cardHeight+'px');layer.style.setProperty('--card-w465',Math.round(cardHeight*.68)+'px');layer.style.setProperty('--fx-age',`-${age}ms`);layer.dataset.kind=e.kind;layer.classList.toggle('is-other-draw472',e.kind==='draw'&&e.actorId!==c.transport.selfId);layer.classList.toggle('is-short472',height<280);layer.classList.toggle('is-compact470',height<340);layer.style.setProperty('--event-duration469',`${f.active.duration}ms`);layer.classList.toggle('is-dark-instant467',e.kind==='card'&&card?.kind==='bad'&&e.activation466==='instant');layer.classList.toggle('sg-motion-reduced',f.reduced);
 if(e.kind==='card'&&card){layer.innerHTML=`${card.kind==='bad'&&e.activation466==='instant'?'<div class="sg-dark-title467"><small>引いてしまった…！</small><b>闇の速攻</b><span>強制発動</span></div>':''}<div class="sg-cast465"><div class="sg-caster465">${pawn465(c,actor,token,'is-source')}<small>${e.activation466==='instant'?'速攻カードを引いた！<br>強制発動':e.activation466==='blocked'?'悪い速攻を引いた<br>無効化！':'このカードを使用'}</small><button data-sg-action="card" data-card="${card.id}" class="sg-fx-detail469">効果を読む</button></div><div class="sg-flip464"><div class="sg-flip-inner464">${back466()}<div class="sg-front464" style="${rankStyle466(card)}">${photoCardArt468(card,art)}<small class="sg-rank466">${escape(card.rank466)}</small><b>${escape(card.name)}</b><p>${escape(card.summary466)}</p></div></div></div>${e.activation466==='blocked'?'<div class="sg-safe-block469"><b>無効化！</b><span>闇の速攻を防いだ</span></div>':''}<div class="sg-event-progress465"></div></div>`}
 else if(e.kind==='series468'){const name=SERIES_ART468[e.set468].name;layer.innerHTML=`<div class="sg-series-celebrate468">${puzzle468(e.set468)}<div><small>4つの絵柄が、ひとつに。</small><h2>絵柄完成！</h2><b>${name}</b><p>切り札はあなたの手の中に。<br>自分の移動前に選んで発動</p><small>あなただけに表示</small></div></div>`}
 else if(e.kind==='draw'){
  const own=e.actorId===c.transport.selfId,drawn=own?CARD_BY_ID463[e.drawCardId466]:null,from=g.players.find(p=>p.playerId===e.fromPlayerId466),source=CARD_BY_ID463[e.sourceCardId466]?.name??(e.tile?NODES463[e.tile]?.name:e.source==='turn'?'手番のドロー':'カードを獲得'),cue=drawn?cardCue470(drawn):null;
  if(!own){layer.innerHTML=`<div class="sg-observer-draw472"><span class="sg-observer-back472" aria-hidden="true"></span><div><small>${escape(source)}</small><b>${escape(name465(c,actor))}がカードを獲得</b><span>${e.ordinal466??1} / ${e.total466??1} 枚 · 中身は本人だけに表示</span></div></div>`;}
  else layer.innerHTML=`<div class="sg-draw470 ${own?'is-own':'is-hidden'}"><div class="sg-draw-title470"><small>${escape(from?name465(c,from)+'の手札から':source)}</small><b>${escape(name465(c,actor))}が1枚獲得 <em>${e.ordinal466??1} / ${e.total466??1}</em></b></div><div class="sg-draw-layout470"><div class="sg-draw-table470">${deck469()}<div class="sg-draw-card466"><div class="sg-draw-flipper466">${back466()}${drawn?`<div class="sg-front464" style="${rankStyle466(drawn)}">${photoCardArt468(drawn,art)}<small class="sg-rank466">${escape(drawn.rank466)}</small><b>${escape(drawn.name)}</b><p>${escape(drawn.summary466)}</p></div>`:back466()}</div></div></div>${drawn?`<div class="sg-draw-cue470"><span class="sg-cue-symbol470 cue-${cue.key}">${effectIcon470(cue.key)}</span><small>${escape(cue.category)}</small><strong>${escape(drawn.summary466)}</strong><span>${escape(cue.timing)}</span><button data-sg-action="card" data-card="${drawn.id}">詳しく読む</button></div>`:'<span class="sg-hidden-cue470">中身は本人だけに表示</span>'}</div><div class="sg-reading470"><span></span></div><small class="sg-draw-foot470">${drawn?'獲得後も「直近の獲得」で読み返せます':'相手の手札へ'}</small></div>`;
 }
 else if(e.kind==='arrival472'){const node=NODES463[e.tile];layer.innerHTML=`<div class="sg-arrival472"><small>${escape(name465(c,actor))}が到着${e.forcedStop472?' · 必ず停止するマス':''}</small><b>✧ ${escape(node?.name)}</b><span>${escape(arrivalText472(node,e.hasSpecial472))}</span></div>`;}
 else if(e.kind==='specialDraw470'){
  const sp=SPECIAL_BY_ID463[e.specialId466];layer.innerHTML=`<div class="sg-special-reveal470"><div class="sg-special-heading470"><small>${escape(e.tile?NODES463[e.tile]?.name:CARD_BY_ID463[e.sourceCardId466]?.name??name465(c,actor))} · 特殊カード獲得</small><b>覚醒の山札</b></div><div class="sg-special-table470">${specialDeck470()}<div class="sg-special-fly470"><div class="sg-special-flipper470">${specialBack470()}<div class="sg-special-front470">${specialCard470(sp?.id,art)}</div></div></div></div><p>${e.replacing470?'持っている特殊カードと、残す1枚を選ぼう':'この力が、あなたの新しい能力になる'}</p></div>`;
 }
 else if(e.kind==='awaken'){
  const sp=SPECIAL_BY_ID463[e.specialId466];layer.innerHTML=`<div class="sg-awakening470"><div class="sg-awaken-halo470"></div><div class="sg-awaken-rays470"></div><small>${escape(name465(c,actor))}の力が目覚める</small><b class="sg-awaken-word470">覚 醒</b><div class="sg-awaken-card470">${specialCard470(sp?.id,art)}</div><span class="sg-awaken-equipped470">✦ ${escape(sp?.name)}を装備</span><small>上の特殊カードから、いつでも効果を確認</small></div>`;
 }
 else if(e.kind==='defense469'){
  const defender=CARD_BY_ID463[e.cardId];layer.innerHTML=`<div class="sg-defense469"><div class="sg-defense-face469">${defender?`<div class="sg-flip464"><div class="sg-flip-inner464">${back466()}<div class="sg-front464" style="${rankStyle466(defender)}">${photoCardArt468(defender,art)}<b>${escape(defender.name)}</b><p>${escape(defender.summary466)}</p></div></div></div>`:pawn465(c,actor,token)}</div><div class="sg-defense-outcome469"><span class="sg-shield469">${e.reflected469?'↩':'✦'}</span><small>${escape(name465(c,actor))}</small><b>${e.reflected469?'反射成功！':'防御成功！'}</b><strong>${escape(defenseResult469(e))}</strong><span>この攻撃は通らない</span></div></div>`;
 }
 else if(e.kind==='dice'){const sum=e.dice.reduce((s,n)=>s+n,0),delta=e.total-sum;layer.innerHTML=`<div class="sg-dice-table469"><small>${escape(name465(c,actor))}のサイコロ · 上の面が出目</small><div class="sg-dice-line469" style="--dice-count469:${e.dice.length}">${e.dice.map((n,i)=>die469(n,true,i)).join('')}</div><div class="sg-dice-answer469"><b>${e.total}<small>マス進む</small></b><p>${e.genius?'天才：素の出目は最低7＋カード補正':delta?`${sum} ${delta>0?'+':'−'} ${Math.abs(delta)} = ${e.total}（補正込み）`:e.dice.join(' + ')+' = '+e.total}</p></div></div>`}
 else if(e.kind==='effect'){
  const own=e.actorId===targets[0]?.playerId,isTile=e.source==='tile',origin=isTile?NODES463[e.tile]?.name:card?.name??SPECIAL_BY_ID463[e.specialId466]?.name??(e.source==='turn'?'手番のドロー':e.effectType==='defend'?'防御':'カード効果');
  layer.innerHTML=`<div class="sg-impact465 ${e.harmful?'is-harmful':''}"><small class="sg-effect-origin465">${escape(origin)}</small><div class="sg-effect-people465">${!isTile&&!own?pawn465(c,actor,token,'is-source')+'<span class="sg-effect-arrow465">➜</span>':''}${targets.map(p=>pawn465(c,p,token,'is-target')).join('')}<div><b class="sg-effect-label465">${escape(effectLabel464(e))}</b><small>${isTile?'止まったマスの効果':own?'自分に効果発動':e.harmful?'攻撃が迫る！ 防御できます':'対象に効果発動'}</small></div></div></div>`;
 }else if(e.kind==='move'){layer.innerHTML=`<div class="sg-movement465">${pawn465(c,actor,token)}<div><b>1マスずつ移動中</b><span data-move-count465></span></div></div>`}else layer.innerHTML='';
 for(const el of c.root.querySelectorAll('.sg-seat')){const id=el.dataset.player??el.dataset.sgToken;el.classList.toggle('sg-target464',e.kind==='effect'&&(e.targetIds??[]).includes(id));el.classList.toggle('sg-attacker464',e.kind==='effect'&&id===e.actorId)}
 for(const el of c.root.querySelectorAll('[data-sg-tile]'))el.classList.toggle('sg-landed466',e.kind==='effect'&&e.tile===el.dataset.sgTile);
 const step=e.kind==='draw'?'draw':e.kind==='dice'||e.kind==='move'?'move':e.source==='tile'?'tile':'card';for(const el of c.root.querySelectorAll('[data-phase466]'))el.classList.toggle('is-current',el.dataset.phase466===step);
}
function position464(c,f,id,pos){const p=f.visual466?.players.find(p=>p.playerId===id);if(p)p.pos=pos;const players=f.visual466?.players??c.state.sugoroku.players,u=c.sgUI463??{};for(const el of c.root.querySelectorAll('[data-sg-token]')){const anchor=pawnAnchor470(players,el.dataset.sgToken,NODES463,u.zoom,u.allPlayers469);if(anchor){el.style.left=anchor.x+'px';el.style.top=anchor.y+'px'}}const seat=[...c.root.querySelectorAll('.sg-seat')].find(e=>e.dataset.player===id),remaining=seat?.querySelector('b');if(remaining&&!p?.finished)remaining.textContent='残'+distance463(pos)+'マス'}
function hop471(c,f,id,beat,index){const el=[...c.root.querySelectorAll('[data-sg-token]')].find(el=>el.dataset.sgToken===id);if(!el)return;el.classList.add('is-moving471');el.style.setProperty('--sg-hop-ms471',Math.round(beat*.65)+'ms');if(!f.reduced&&document.visibilityState!=='hidden'){el.querySelector(':scope>.sg-monster,:scope>.sg-art')?.animate([{translate:'0 0',offset:0},{translate:'0 -10px',offset:.45},{translate:'0 0',offset:1}],{duration:beat*.65,easing:'ease-in-out'});}c.sound452?.tone(740+(index%4)*55,0,.045,.018,'sine');}
export function presentationAfter464(c,art,token,focus){
 const g=c.state?.sugoroku;if(!g)return;let f=c.sgFX464;
 if(!f||f.gameId!==g.id){if(f?.raf)cancelAnimationFrame(f.raf);f=c.sgFX464={gameId:g.id,seen:g.presentationSequence464??0,queue:[],active:null,positions:{},visual466:capture466(g),seriesHand468:g.hand.map(h=>({...h})),recent470:[],reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};}
 if(!c.connected()){f.disconnected=true;f.queue=[];f.active=null;f.positions={};f.visual466=capture466(g);f.seriesHand468=g.hand.map(h=>({...h}));}
 else if(f.disconnected){f.seen=g.presentationSequence464??0;f.disconnected=false;f.visual466=capture466(g);f.seriesHand468=g.hand.map(h=>({...h}));}
 const incoming=(g.presentation464??[]).filter(e=>e.id>f.seen);f.seen=Math.max(f.seen,g.presentationSequence464??0);f.queue.push(...incoming);
 for(const e of incoming)if(e.kind==='move'&&f.positions[e.actorId]==null)f.positions[e.actorId]=e.from;
 for(const [id,pos]of Object.entries(f.positions))position464(c,f,id,pos);
 write464(c,f,art,token);if(f.active?.event.kind==='move'){const a=f.active,el=[...c.root.querySelectorAll('[data-sg-token]')].find(el=>el.dataset.sgToken===a.event.actorId);el?.classList.add('is-moving471');el?.style.setProperty('--sg-hop-ms471',Math.round(a.duration/(a.event.path465?.length||2)*.65)+'ms')}if(f.raf)cancelAnimationFrame(f.raf);
 const frame=()=>{
  if(c.sgFX464!==f||c.state?.sugoroku?.id!==f.gameId||c.partyBrowse462||!c.root?.querySelector('.sg-game')){f.raf=null;return}
  let boundary=false;
  if(f.active&&performance.now()-f.active.start>=f.active.duration){const e=f.active.event;if(e.kind==='draw'&&e.actorId===c.transport.selfId&&e.drawCardId466&&!f.recent470.some(r=>r.id===e.id))f.recent470.unshift({id:e.id,cardId:e.drawCardId466}),f.recent470=f.recent470.slice(0,8);applySnapshot466(f,e.after466);if(e.kind==='move'){f.positions[e.actorId]=e.to;position464(c,f,e.actorId,e.to)}if(e.kind==='dice')f.visual466.lastRoll={playerId:e.actorId,dice:e.dice,total:e.total};f.active=null;f.justFinished=true;boundary=true;}
  if(!f.active&&!f.queue.length&&!f.disconnected)queueCompleted468(f,c.state.sugoroku.hand);
  if(!f.active&&f.queue.length){const e=f.queue.shift(),duration=e.duration465??duration465(e);f.active={event:e,start:performance.now(),duration,lastStep:-1};if(e.kind==='move')focus(e.from);if(e.kind==='awaken'||e.kind==='series468')c.sound452?.play('win');if(e.kind==='card'&&e.activation466==='instant'&&CARD_BY_ID463[e.cardId]?.kind==='bad')c.sound452?.tone(130,0,.7,.035,'sawtooth',38);write464(c,f,art,token);}
  if(f.active?.event.kind==='move'){const a=f.active,e=a.event,path=e.path465?.length?e.path465:[e.from,e.to],index=Math.min(path.length-1,Math.floor((performance.now()-a.start)/a.duration*path.length));if(index!==a.lastStep){a.lastStep=index;if(index>0)hop471(c,f,e.actorId,a.duration/path.length,index);f.positions[e.actorId]=path[index];position464(c,f,e.actorId,path[index]);focus(path[index]);const counter=c.root.querySelector('[data-move-count465]');if(counter)counter.textContent=`${index} / ${path.length-1} マス`;}}
  c.root.querySelector('.sg-game')?.classList.toggle('is-presenting465',!!f.active);
  if(!f.active&&!f.queue.length){f.positions={};f.visual466=capture466(c.state.sugoroku);write464(c,f,art,token);for(const el of c.root.querySelectorAll('.sg-target464,.sg-attacker464,.sg-landed466,.is-moving471'))el.classList.remove('sg-target464','sg-attacker464','sg-landed466','is-moving471');f.raf=null;const finished=f.justFinished;f.justFinished=false;if(finished)c.render();return}
  if(boundary){c.render();return}f.raf=requestAnimationFrame(frame);
 };frame();
}
