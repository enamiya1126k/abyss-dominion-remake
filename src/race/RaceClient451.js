import{pickCount456}from'./RaceTickets456.js';
import{ownedRaceIdentity451}from'./RaceCatalog451.js';
import{raceBank451,reserveRaceBet451,applyRaceDelivery451}from'./RaceWallet451.js';
import{raceView452 as raceView451,updateRaceClock452 as updateRaceClock451}from'./RaceView452.js';
import{RaceAudio452}from'./RaceAudio452.js';
import{raceDomSignature452,presentation452,paradeIndex452}from'./RacePresentation452.js';
import{validTicket451}from'./RaceRules451.js';

// Uses the existing authenticated socket. Receipts continue to arrive on HOME.
export class RaceClient451{
 constructor({transport,save,displayName=()=>'',onBack=()=>{},toast=()=>{},audio=null}){
  Object.assign(this,{transport,save,displayName,onBack,toast,audio});this.state=null;this.root=null;this.offset=0;this.error='';this.rewardError='';this.draft={code:'',search:'',amount:'1000',ticket:{kind:'win',picks:[]}};
  const original=transport._handleMessage.bind(transport);
  transport._handleMessage=(m,socket)=>{if(socket&&socket!==transport.ws)return;if(m.type==='raceState451'){this.receive(m);return}if(m.type==='raceError451'){if(m.op==='boost')this.boostPending456=null;this.error=m.message;this.render();return}const result=original(m,socket);if(m.type==='helloAck'){this.state=null;this.refresh()}return result};
  this.retryClock=setInterval(()=>{if(this.connected()&&transport.capabilities?.has('monsterRaceV1')){this.refresh();this.retryPurchase();if(this.boostPending456)this.raw('boost',this.boostPending456)}if(this.root)this.renderConnection()},5000);
  this.retryClock.unref?.();
  this.sound452=new RaceAudio452(this);this.onHidden452=()=>{if(document.visibilityState==='hidden'||document.hasFocus?.()===false)this.sound452.stop()};document.addEventListener('visibilitychange',this.onHidden452);window.addEventListener('blur',this.onHidden452);
  this.click=e=>this.onClick(e);this.input=e=>this.onInput(e);
 }
 connected(){return this.transport.connectionReady&&this.transport.ws?.readyState===1}
 ready(){return this.connected()&&this.transport.capabilities?.has('monsterRaceV1')&&this.state?.available===true&&this.state?.rulesVersion>=4}
 connectionMessage(){if(!this.connected())return '接続待ちです。復帰後に現在のレースと保留中の受取を確認します。';if(!this.state)return 'サーバーへレース状況を確認しています。';if(!(this.state.rulesVersion>=4))return '操作できるレースの新ルールにはゲームとサーバー両方の更新が必要です。サーバーをBuild456へ更新・再起動してください。';return 'サーバーのレース保存状態を確認しています。受取・購入の記録を保持して再接続します。'}
 key(){if(!this.transport.selfId||!this.transport.ws?.url)return null;try{const url=new URL(this.transport.ws.url);return `${url.origin}${url.pathname}|${this.transport.selfId}`}catch{return null}}
 bank(){const key=this.key();return key?raceBank451(this.save.state,key):null}
 raw(op,payload={}){if(!this.connected()||!this.transport.capabilities?.has('monsterRaceV1'))return false;return this.transport._send('raceRequest451',{op,rulesVersion:4,...payload})}
 refresh(){this.raw('status',{subscribe:true})}
 retryPurchase(){const pending=this.bank()?.pending;if(!pending||!this.connected())return;const decision=this.state?.decisions?.find(d=>d.requestId===pending.requestId);if(!decision)this.raw('bet',pending)}
 receive(message){
  if(message.selfId!==this.transport.selfId)return;
  const old=this.state?.room;this.offset=message.serverNow-Date.now();this.state=message;if(this.boostPending456){const p=this.boostPending456,room=message.room,x=room?.live456?.runners?.[room.racers?.findIndex(r=>r.ownerId===this.transport.selfId)];if(room?.id!==p.raceId||room.phase!=='race'||x?.boostSeq>=p.seq)this.boostPending456=null}
  if(old?.id!==message.room?.id){this.draft.ticket={kind:'win',picks:[]};this.paradePinned=null;this.watchPlayer452=null;this.error='';this.sound452?.stop()}
  if(old?.phase!==message.room?.phase)this.paradePinned=null;
  const ack=[];this.rewardError='';
  for(const entry of message.deliveries??[])try{const result=applyRaceDelivery451(this.save,this.key(),entry);ack.push(entry.id);if(!result.duplicate&&entry.kind==='result')this.toast(`魔物レース：${entry.gold.toLocaleString()}G受取・出走魔物のEXPとなつき度アップ`)}catch(e){this.rewardError=e.message}
  // ACK only after the whole local state has successfully persisted.
  if(ack.length)this.raw('ack',{ids:ack});
  if(this.renderSignature452!==raceDomSignature452(this))this.render();if(this.root&&old?.phase!==message.room?.phase){this.root.scrollTop=0;window.scrollTo(0,0)}
 }
 mount(root){if(this.root!==root){this.unmount();this.root=root;root.classList.add("race-host454");root.addEventListener('click',this.click);root.addEventListener('input',this.input);this.animationClock=setInterval(()=>updateRaceClock451(this),33)}this.render();this.transport.startBackground?.();this.refresh();this.retryPurchase()}
 unmount(){if(this.root){this.root.classList.remove("race-host454");this.root.removeEventListener('click',this.click);this.root.removeEventListener('input',this.input)}clearInterval(this.animationClock);this.sound452?.stop();this.root=null}
 dispose(){this.unmount();clearInterval(this.retryClock);document.removeEventListener('visibilitychange',this.onHidden452);window.removeEventListener('blur',this.onHidden452)}
 renderConnection(){if(this.renderSignature452!==raceDomSignature452(this))this.render()}
 render(){if(!this.root)return;this.renderSignature452=raceDomSignature452(this);const active=this.root.contains(document.activeElement)?document.activeElement:null,name=active?.name,selection=active?.selectionStart,scroll=this.root.querySelector('.race-roster451')?.scrollTop??0;this.root.innerHTML=raceView451(this);if(name){const field=[...this.root.querySelectorAll('input')].find(e=>e.name===name);field?.focus({preventScroll:true});try{field?.setSelectionRange(selection,selection)}catch{}}const roster=this.root.querySelector('.race-roster451');if(roster)roster.scrollTop=scroll;updateRaceClock451(this)}
 roster(){return(this.save.state.monsters??[]).map(m=>({id:m.id,speciesId:m.speciesId,raceSpeciesId:ownedRaceIdentity451(m)}))}
 onInput(event){const e=event.target;if(e.name==='roomCode')this.draft.code=e.value.toUpperCase();if(e.name==='betAmount'){this.draft.amount=e.value;updateRaceClock451(this)}if(e.name==='monsterSearch'){this.rosterLimit453=24;this.draft.search=e.value;this.render()}}
 onClick(event){const b=event.target.closest('button');if(!b||b.disabled||!this.root?.contains(b))return;this.sound452?.unlock();
  if(b.dataset.raceStyle!==undefined){this.styleFilter453=b.dataset.raceStyle;this.rosterLimit453=24;this.render();return}if(b.dataset.raceAction==='more453'){this.rosterLimit453=(this.rosterLimit453??24)+24;this.render();return}if(b.dataset.betAmount){this.draft.amount=String(Math.max(1,Math.min(Number(b.dataset.betAmount),Math.floor(this.save.state.player.gold))));this.render();return}
  if(b.dataset.ticketFocus){this.watchPlayer452=b.dataset.ticketFocus;updateRaceClock451(this);return}
  if(b.dataset.raceAction==='sound452'){this.sound452.toggle();this.render();return}
  if(b.dataset.raceAction==='pauseParade456'){this.paradePinned=this.paradePinned==null?paradeIndex452(this.state.room,Date.now()+this.offset):null;this.render();return}
  if(b.dataset.raceAction==='paradeAuto452'){this.paradePinned=null;this.render();return}
  if(b.dataset.raceAction==='skip452'){presentation452(this).skip=true;this.sound452.stop();updateRaceClock451(this);return}
  if(b.dataset.raceAction==='replay452'){const p=presentation452(this);p.skip=false;p.replayAt=Date.now()+this.offset;p.seen=new Set();this.sound452.stop();this.render();this.root.scrollTop=0;window.scrollTo(0,0);return}
  if(b.dataset.paradeIndex!==undefined){this.paradePinned=Number(b.dataset.paradeIndex);this.render();return}
  if(b.dataset.betKind){this.draft.ticket={kind:b.dataset.betKind,picks:[]};this.render();return}
  if(b.dataset.betPick!==undefined){const t=this.draft.ticket,i=Number(b.dataset.betPick),max=pickCount456(t.kind);t.picks=t.picks.includes(i)?t.picks.filter(n=>n!==i):max===1?[i]:[...t.picks,i].slice(-max);this.render();return}
  const action=b.dataset.raceAction;if(action==='back'){this.onBack();return}if(action==='refresh'){this.transport.startBackground?.();this.refresh();this.retryPurchase();return}if(action==='copy'){const code=this.state?.room?.code;if(code){if(navigator.clipboard)navigator.clipboard.writeText(code).then(()=>this.toast('合言葉をコピーしました'),()=>this.toast(`合言葉：${code}`));else this.toast(`合言葉：${code}`)}return}
  this.error='';if(!this.ready()){this.error='接続を確認してから操作してください';this.render();return}
  try{
   if(b.dataset.raceCourse){this.raw('course',{course:b.dataset.raceCourse});return}
   if(action==='boost456'){const r=this.state.room,i=r?.racers?.findIndex(x=>x.ownerId===this.transport.selfId),x=r?.live456?.runners?.[i];if(!x||r.phase!=='race'||this.boostPending456)return;this.boostPending456={raceId:r.id,seq:x.boostSeq+1};this.raw('boost',this.boostPending456);updateRaceClock451(this);return}
   if(b.dataset.raceMonster){this.raw('select',{monsterId:b.dataset.raceMonster,roster:this.roster()});return}
   if(action==='create'||action==='join'){this.raw(action,{code:this.draft.code.trim(),roster:this.roster(),displayName:this.displayName()});return}
   if(action==='bet'){const r=this.state.room,t=this.draft.ticket;if(r?.phase!=='parade'||!validTicket451(t))throw Error('購入する予想を選んでください');const packet={raceId:r.id,requestId:`${r.id}:${this.transport.selfId}`,amount:Number(this.draft.amount),ticket:structuredClone(t)};reserveRaceBet451(this.save,this.key(),packet);this.raw('bet',packet);this.render();return}
   if(action==='pass'&&this.bank()?.pending)throw Error('馬券の受付確認中です');
   if(['start','pass','leave','again'].includes(action)){this.raw(action);return}
  }catch(e){this.error=e.message;this.render()}
 }
}
