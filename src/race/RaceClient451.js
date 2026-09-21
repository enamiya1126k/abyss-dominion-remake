import{resultClick490,resultReceive490,resultError490,resultPoll490}from'../party/PartyResults490.js';
import{canalView489,canalBefore489,canalAfter489,canalDispose489,canalClick489,canalInput489,canalKey489,canalTick489,canalReceive489}from'../canal/View489.js';
import{memberDialog485,memberClick485,memberKey485,memberBefore485,memberAfter485,memberReceive485,memberError485,memberPoll485}from'../party/PartyMember485.js';
import{cabbageClockReply484,cabbageView484,cabbageBefore484,cabbageAfter484,cabbageDispose484,cabbageClick484,cabbageInput484,cabbageKey484,cabbageTick484,cabbageReceive484}from'../cabbage/View484.js';
import{slotOne476}from'../party/PartyPortrait476.js';
import{deferHandRender474}from'../sugoroku/HandOrder466.js';
import{applyCrystalDelivery474,retryEntry474,availableCrystals474}from'../sugoroku/Wallet474.js';
import{sugorokuView463,sugorokuBefore463,sugorokuAfter463,sugorokuClick463,sugorokuInput463,sugorokuTick463,sugorokuKey463}from'../sugoroku/View463.js';
import{monsterVisual}from'../ui/MonsterVisual.js';
import{raceSpecies451}from'./RaceCatalog451.js';
import{partyHub462,isPartyHub462,partyDecorate462,partyClick462,spectator462}from'../party/PartyView462.js';
import{toggleExpanded460}from'./RaceExperience460.js';
import{bond459}from'./RaceCourse459.js';
import{panelKey458,rememberScroll458,restoreScroll458,swipeDirection458,editPick458,betLimit458}from'./RaceUX458.js';
import{nextBoost457}from'./RaceBoost457.js';
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
  Object.assign(this,{transport,save,displayName,onBack,toast,audio});this.state=null;this.root=null;this.offset=0;this.error='';this.rewardError='';this.draft={code:typeof location!=='undefined'?new URL(location.href).searchParams.get('party462')?.slice(0,6).toUpperCase()??'':'',search:'',amount:'1000',ticket:{kind:'win',picks:[]}};
  const original=transport._handleMessage.bind(transport);
  transport._handleMessage=(m,socket)=>{if(socket&&socket!==transport.ws)return;if(m.type==='cabbageClock484'){cabbageClockReply484(this,m);return}if(m.type==='raceState451'){this.receive(m);return}if(m.type==='raceError451'){memberError485(this,m);resultError490(this,m);if(m.op==='boost'&&(!this.boostPending456||m.raceId==null||m.raceId===this.boostPending456.raceId&&(m.seq??20)>=this.boostPending456.seq))this.boostPending456=null;if(m.op==='sg463'&&this.sgUI463)this.sgUI463.inFlight=null;this.error=m.message;this.actionPending458=null;this.render();return}const result=original(m,socket);if(m.type==='helloAck'){this.presenceKey462=null;if(this.state?.selfId!==this.transport.selfId)this.state=null;this.refresh()}return result};
  this.retryClock=setInterval(()=>{if(this.connected()&&transport.capabilities?.has('monsterRaceV1')){this.refresh();this.retryPurchase();if(this.boostPending456)this.raw('boost',this.boostPending456)}if(this.root)this.renderConnection()},5000);
  this.retryClock.unref?.();
  this.sound452=new RaceAudio452(this);this.onHidden452=()=>{if(document.visibilityState==='hidden'||document.hasFocus?.()===false){this.sound452.stop();if(this.state?.sugoroku)sugorokuBefore463(this)}else{this.sgFX464=null;this.refresh();this.render()}};document.addEventListener('visibilitychange',this.onHidden452);window.addEventListener('blur',this.onHidden452);
  this.sgMonster463=id=>`<span class="sg-monster">${monsterVisual({speciesId:id,visualSpeciesId:id},'◆',{className:'sg-monster-visual'})}</span>`;this.sgSpeciesName463=id=>raceSpecies451(id)?.name??id;
  this.keydown459=e=>{if(memberKey485(this,e))return;if(this.state?.canal&&canalKey489(this,e))return;if(this.state?.cabbage&&cabbageKey484(this,e))return;if(this.state?.sugoroku&&sugorokuKey463(this,e))return;if(e.key==='Escape'&&this.expanded460){e.preventDefault();toggleExpanded460(this,false);return}const dialog=this.root?.querySelector('[data-system-dialog459]');if(!dialog)return;const buttons=[...dialog.querySelectorAll('button,summary')];if(e.key==='Escape'){e.preventDefault();buttons[0]?.click()}if(e.key==='Tab'){const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}};this.click=e=>this.onClick(e);this.input=e=>this.onInput(e);
  this.pointerDown458=e=>{if(e.isPrimary!==false&&e.button===0&&!e.target.closest('button')&&e.target.closest('[data-parade-swipe]'))this.swipeStart458={x:e.clientX,y:e.clientY,at:Date.now(),pointer:e.pointerId}};
  this.pointerUp458=e=>{const start=this.swipeStart458;this.swipeStart458=null;if(!start||start.pointer!==e.pointerId)return;const direction=swipeDirection458(start,{x:e.clientX,y:e.clientY,at:Date.now()});if(direction){this.suppressClick458=Date.now()+350;this.moveParade458(direction)}};
  this.pointerCancel458=()=>this.swipeStart458=null;
  this.toggle458=e=>{if(e.target.matches('details[data-detail-key]')){this.openDetails458??={};this.openDetails458[e.target.dataset.detailKey]=e.target.open;if(e.target.open&&this.state?.room?.phase==='parade'&&this.paradePinned==null)this.paradePinned=paradeIndex452(this.state.room,Date.now()+this.offset)}};

 }
 connected(){return this.transport.connectionReady&&this.transport.ws?.readyState===1}
 ready(){return this.connected()&&this.transport.capabilities?.has('monsterRaceV1')&&this.state?.available===true&&this.state?.rulesVersion>=8}
 connectionMessage(){if(!this.connected())return '接続待ちです。復帰後に現在のレースと保留中の受取を確認します。';if(!this.state)return 'サーバーへレース状況を確認しています。';if(!(this.state.rulesVersion>=8))return '操作できるレースの新ルールにはゲームとサーバー両方の更新が必要です。サーバーをBuild462へ更新・再起動してください。';return 'サーバーのレース保存状態を確認しています。受取・購入の記録を保持して再接続します。'}
 key(){const id=this.transport.selfId,url=this.transport.ws?.url;if(id&&url)try{const u=new URL(url);this.lastBankKey458={id,key:`${u.origin}${u.pathname}|${id}`};return this.lastBankKey458.key}catch{}return this.lastBankKey458&&(this.lastBankKey458.id===id||!id&&!this.connected())?this.lastBankKey458.key:null}

 bank(){const key=this.key();return key?raceBank451(this.save.state,key):null}
 raw(op,payload={}){payload={canalRules494:1,canalRules492:1,canalVersion489:1,cabbageVersion484:1,cabbageScoring491:1,...payload};if(['partyCreate462','partyJoin462','partyRoster462'].includes(op)){const id=slotOne476(this.save.state)?.id??null,roster=payload.roster;payload={...payload,slotOne476:id,...(Array.isArray(roster)&&roster.findIndex(m=>m.id===id)>=500?{roster:[roster.find(m=>m.id===id),...roster.filter(m=>m.id!==id)]}:{})}}if(['sgAck474','status','partyCreate462','partyJoin462','partyRoster462'].includes(op))payload={crystals474:availableCrystals474(this),...payload};if(!this.connected()||!this.transport.capabilities?.has('monsterRaceV1'))return false;return this.transport._send('raceRequest451',{op,rulesVersion:8,...payload})}
 refresh(){this.raw('status',{subscribe:true})}
 retryPurchase(){retryEntry474(this);const pending=this.bank()?.pending;if(!pending||!this.connected())return;const decision=this.state?.decisions?.find(d=>d.requestId===pending.requestId);if(!decision)this.raw('bet',pending)}
 receive(message){
  if(message.selfId!==this.transport.selfId)return;
  const old=this.state?.room,oldCanal=this.state?.canal,oldCabbage=this.state?.cabbage,oldBoard=this.state?.sugoroku;if(this.sgUI463&&oldBoard?.revision!==message.sugoroku?.revision)this.sgUI463.inFlight=null;this.offset=message.serverNow-Date.now();this.state=message;memberReceive485(this);if(this.sgUI463?.leaveAfter480&&(message.sugoroku?.paused480||message.sugoroku?.players?.find(p=>p.playerId===this.transport.selfId)?.auto480)){this.sgUI463.leaveAfter480=false;this.onBack()}if(oldCanal?.id!==message.canal?.id||old?.id!==message.room?.id||oldBoard?.id!==message.sugoroku?.id||oldCabbage?.id!==message.cabbage?.id)this.partyBrowse462=false;resultReceive490(this);const presenceKey=message.party?.id+':'+!!this.root;if(message.party&&this.presenceKey462!==presenceKey){this.presenceKey462=presenceKey;this.raw('partyPresence462',{atHome:!this.root});if(this.root)this.raw('partyRoster462',{roster:this.roster()})}
  if(this.actionPending458&&(old?.id!==message.room?.id||old?.phase!==message.room?.phase)){this.actionPending458=null;this.actionNote458=''}
  const deferred=this.bank()?.leave458;if(deferred){if(message.room?.id===deferred&&['lobby','result'].includes(message.room.phase))this.raw('leave');else if(message.room?.id!==deferred){delete this.bank().leave458;this.save.save()}}
  if(this.boostPending456){const p=this.boostPending456,room=message.room,x=room?.live456?.runners?.[room.racers?.findIndex(r=>r.ownerId===this.transport.selfId)];if(room?.id!==p.raceId||room.phase!=='race'||x?.boostSeq>=p.seq)this.boostPending456=null}
  if(old?.id!==message.room?.id){this.draft.ticket={kind:'win',picks:[]};this.pickSlot458=null;this.systemDetail459=null;this.openDetails458={};this.ticketExpanded458=null;this.paradePinned=null;this.watchPlayer452=null;this.predictionTab457='watch';this.newsOpen457=false;this.detailsOpen457=false;this.error='';this.sound452?.stop()}
  if(old?.phase!==message.room?.phase){if(!['countdown','race'].includes(message.room?.phase))this.expanded460=false;this.paradePinned=null;this.systemDetail459=null;}
  const ack=[];this.rewardError='';
  for(const entry of message.deliveries??[])try{const result=applyRaceDelivery451(this.save,this.key(),entry);ack.push(entry.id);if(!result.duplicate&&entry.kind==='result')this.toast(`魔物レース：${entry.gold.toLocaleString()}G受取・出走魔物のEXPとなつき度アップ`)}catch(e){this.rewardError=e.message}
  const crystalAck474=[];for(const entry of message.crystalDeliveries474??[])try{const result=applyCrystalDelivery474(this.save,this.key(),entry);crystalAck474.push(entry.id);if(!result.duplicate&&entry.kind==='refund')this.toast(`カードすごろく：参加費💎${entry.crystals.toLocaleString()}を返金しました`)}catch(e){this.rewardError=e.message}
  if(crystalAck474.length)this.raw('sgAck474',{ids:crystalAck474,rulesVersion:18});
  // ACK only after the whole local state has successfully persisted.
  if(ack.length)this.raw('ack',{ids:ack});
  if(this.renderSignature452!==raceDomSignature452(this))this.render();
  if(message.canal)canalReceive489(this);
  if(message.cabbage)cabbageReceive484(this);
 }
 mount(root){if(this.root!==root){this.unmount();this.root=root;root.classList.add("race-host454");root.addEventListener('keydown',this.keydown459);root.addEventListener('click',this.click);root.addEventListener('input',this.input);root.addEventListener('pointerdown',this.pointerDown458);root.addEventListener('pointerup',this.pointerUp458);root.addEventListener('pointercancel',this.pointerCancel458);root.addEventListener('toggle',this.toggle458,true);this.animationClock=setInterval(()=>{updateRaceClock451(this);if(this.state?.sugoroku)sugorokuTick463(this);if(this.state?.canal)canalTick489(this);if(this.state?.cabbage)cabbageTick484(this)},33)}this.render();this.transport.startBackground?.();if(this.state?.party){this.presenceKey462=this.state.party.id+':true';this.raw('partyPresence462',{atHome:false});this.raw('partyRoster462',{roster:this.roster()})}this.refresh();this.retryPurchase()}
 unmount(){this.partyMember485=null;this.partyMemberRestore485=null;canalDispose489(this);cabbageDispose484(this);sugorokuBefore463(this);if(this.root){if(this.state?.party){this.presenceKey462=null;this.raw('partyPresence462',{atHome:true})}this.root.classList.remove("race-host454");this.root.removeEventListener('keydown',this.keydown459);this.root.removeEventListener('click',this.click);this.root.removeEventListener('input',this.input);this.root.removeEventListener('pointerdown',this.pointerDown458);this.root.removeEventListener('pointerup',this.pointerUp458);this.root.removeEventListener('pointercancel',this.pointerCancel458);this.root.removeEventListener('toggle',this.toggle458,true)}clearInterval(this.animationClock);this.sound452?.stop();this.root=null}
 dispose(){this.unmount();clearInterval(this.retryClock);document.removeEventListener('visibilitychange',this.onHidden452);window.removeEventListener('blur',this.onHidden452)}
 renderConnection(){memberPoll485(this);resultPoll490(this);if(this.renderSignature452!==raceDomSignature452(this))this.render()}
 render(){if(!this.root||this.sgUI463?.dragging)return;if(deferHandRender474(this))return;memberBefore485(this);canalBefore489(this);cabbageBefore484(this);sugorokuBefore463(this);rememberScroll458(this);const oldKey=this.renderKey458,key=panelKey458(this),active=this.root.contains(document.activeElement)?document.activeElement:null,name=active?.name,selection=active?.selectionStart;this.renderSignature452=raceDomSignature452(this);this.root.innerHTML=(isPartyHub462(this)?partyHub462(this):this.state?.canal?canalView489(this):this.state?.cabbage?cabbageView484(this):this.state?.sugoroku?sugorokuView463(this):partyDecorate462(this,raceView451(this)))+memberDialog485(this);for(const detail of this.root.querySelectorAll('details[data-detail-key]'))detail.open=!!this.openDetails458?.[detail.dataset.detailKey];if(name){const field=[...this.root.querySelectorAll('input,select')].find(e=>e.name===name);field?.focus({preventScroll:true});try{field?.setSelectionRange(selection,selection)}catch{}}updateRaceClock451(this);restoreScroll458(this,key,oldKey);sugorokuAfter463(this);cabbageAfter484(this);canalAfter489(this);memberAfter485(this)}
 moveParade458(direction){const r=this.state?.room;if(r?.phase!=='parade')return;this.paradePinned=(paradeIndex452(r,Date.now()+this.offset,this.paradePinned)+direction+8)%8;this.render()}
 switchTab458(tab){if(!['watch','compare','bet'].includes(tab))return;this.predictionTab457=tab;this.render()}

 roster(){return(this.save.state.monsters??[]).map(m=>({id:m.id,speciesId:m.speciesId,raceSpeciesId:ownedRaceIdentity451(m),bond459:bond459(m.affection??m.bond)}))}
 onInput(event){const e=event.target;if(canalInput489(this,e))return;if(cabbageInput484(this,e))return;if(sugorokuInput463(this,e))return;if(e.name==='raceSort'){this.sort458=e.value;this.rosterLimit453=24;this.render();return}if(e.name==='roomCode')this.draft.code=e.value.toUpperCase();if(e.name==='betAmount'){this.draft.amount=e.value;updateRaceClock451(this)}if(e.name==='monsterSearch'){this.rosterLimit453=24;this.draft.search=e.value;this.render()}}
 onClick(event){if(memberClick485(this,event))return;if(Date.now()<(this.suppressClick458??0))return;const b=event.target.closest('button');if(!b||b.disabled||!this.root?.contains(b))return;this.sound452?.unlock();if(resultClick490(this,b))return;if(canalClick489(this,b,event))return;if(cabbageClick484(this,b,event))return;if(sugorokuClick463(this,b))return;if(partyClick462(this,b))return;if(spectator462(this)&&(b.dataset.betPick!==undefined||b.dataset.betKind||['bet','pass','boost456','candidate458'].includes(b.dataset.raceAction)))return;
  if(b.dataset.systemDetail459!==undefined){this.systemDetail459=Number(b.dataset.systemDetail459);this.render();this.root.querySelector('[data-system-dialog459] button')?.focus({preventScroll:true});return}
  if(b.dataset.raceAction==='closeSystem459'){const old=this.systemDetail459;this.systemDetail459=null;this.render();this.root.querySelector(`[data-system-detail459="${old}"]`)?.focus({preventScroll:true});return}
  if(b.dataset.raceAction==='expand460'){toggleExpanded460(this);updateRaceClock451(this);return}
  if(b.dataset.raceCamera461){this.camera461=b.dataset.raceCamera461;this.worldCamera461=null;updateRaceClock451(this);return}
  if(b.dataset.raceCamera){this.camera457=b.dataset.raceCamera;updateRaceClock451(this);return}
  if(b.dataset.predictionTab){this.switchTab458(b.dataset.predictionTab);return}
  if(b.dataset.paradeStep){this.moveParade458(Number(b.dataset.paradeStep));return}
  if(b.dataset.raceAction==='rosterDetail458'){this.rosterDetail458=!this.rosterDetail458;this.render();return}
  if(b.dataset.raceAction==='candidate458'){const r=this.state.room;if(r.members.find(m=>m.playerId===this.transport.selfId)?.ready){this.switchTab458('bet');return}const i=paradeIndex452(r,Date.now()+this.offset,this.paradePinned);if(!this.draft.ticket.picks.includes(i))this.draft.ticket=editPick458(this.draft.ticket,i,this.pickSlot458);this.pickSlot458=null;this.switchTab458('bet');return}
  if(b.dataset.pickSlot!==undefined){this.pickSlot458=Number(b.dataset.pickSlot);this.render();return}
  if(b.dataset.betFraction){const max=betLimit458(this.save.state.player.gold,this.state.room?.rulesVersion);this.draft.amount=String(b.dataset.betFraction==='half'?Math.floor(max/2):max);this.render();return}

  if(b.dataset.raceDetail){const key=b.dataset.raceDetail==='news'?'newsOpen457':'detailsOpen457';this[key]=!this[key];if(this[key]&&this.paradePinned==null)this.paradePinned=paradeIndex452(this.state.room,Date.now()+this.offset);this.render();return}
  if(b.dataset.raceStyle!==undefined){this.styleFilter453=b.dataset.raceStyle;this.rosterLimit453=24;this.render();return}if(b.dataset.raceAction==='more453'){this.rosterLimit453=(this.rosterLimit453??24)+24;this.render();return}if(b.dataset.betAmount){this.draft.amount=String(Math.min(Number(b.dataset.betAmount),betLimit458(this.save.state.player.gold,this.state.room?.rulesVersion)));this.render();return}
  if(b.dataset.ticketFocus){this.ticketExpanded458=this.ticketExpanded458===b.dataset.ticketFocus?null:b.dataset.ticketFocus;const detail=this.root.querySelector('[data-ticket-detail458]');if(detail&&!this.ticketExpanded458)detail.hidden=true;this.watchPlayer452=b.dataset.ticketFocus;updateRaceClock451(this);return}
  if(b.dataset.raceAction==='sound452'){this.sound452.toggle();this.render();return}
  if(b.dataset.raceAction==='pauseParade456'){this.paradePinned=this.paradePinned==null?paradeIndex452(this.state.room,Date.now()+this.offset):null;if(this.paradePinned==null){this.newsOpen457=false;this.detailsOpen457=false}this.render();return}
  if(b.dataset.raceAction==='paradeAuto452'){this.paradePinned=null;this.newsOpen457=false;this.detailsOpen457=false;this.render();return}
  if(b.dataset.raceAction==='skip452'){presentation452(this).skip=true;this.sound452.stop();updateRaceClock451(this);return}
  if(b.dataset.raceAction==='replay452'){const p=presentation452(this);p.skip=false;p.replayAt=Date.now()+this.offset;p.seen=new Set();this.sound452.stop();this.render();this.root.scrollTop=0;window.scrollTo(0,0);return}
  if(b.dataset.paradeIndex!==undefined){this.paradePinned=Number(b.dataset.paradeIndex);this.switchTab458('watch');return}
  if(b.dataset.betKind){this.draft.ticket={kind:b.dataset.betKind,picks:[]};this.pickSlot458=null;this.render();return}
  if(b.dataset.betPick!==undefined){this.draft.ticket=editPick458(this.draft.ticket,Number(b.dataset.betPick),this.pickSlot458);this.pickSlot458=null;this.render();return}
  const action=b.dataset.raceAction;if(action==='back'){this.onBack();return}if(action==='refresh'){this.transport.startBackground?.();this.refresh();this.retryPurchase();return}if(action==='copy'){const code=this.state?.room?.code;if(code){if(navigator.clipboard)navigator.clipboard.writeText(code).then(()=>this.toast('合言葉をコピーしました'),()=>this.toast(`合言葉：${code}`));else this.toast(`合言葉：${code}`)}return}
  this.error='';this.actionNote458='';
  if(action==='leave'&&!this.ready()){const bank=this.bank();if(bank&&this.state?.room){bank.leave458=this.state.room.id;if(this.save.save()!==true){delete bank.leave458;this.error='退出予約を保存できませんでした。ホームには戻れます。';this.render();return}}this.onBack();return}
  if(!this.ready()){this.error='接続を確認してから操作してください';this.render();return}
  try{
   if(b.dataset.raceDistance459){this.raw('distance459',{distance:Number(b.dataset.raceDistance459)});return}
   if(b.dataset.raceCourse){this.raw('course',{course:b.dataset.raceCourse});return}
   if(action==='boost456'&&this.state.room?.rulesVersion>=5){const intent=nextBoost457(this.state.room,this.transport.selfId,this.boostPending456);if(!intent)return;this.boostPending456=intent;this.raw('boost',intent);this.tapAt457=Date.now();this.sound452?.play('step');updateRaceClock451(this);return}
   if(action==='boost456'){const r=this.state.room,i=r?.racers?.findIndex(x=>x.ownerId===this.transport.selfId),x=r?.live456?.runners?.[i];if(!x||r.phase!=='race'||this.boostPending456)return;this.boostPending456={raceId:r.id,seq:x.boostSeq+1};this.raw('boost',this.boostPending456);updateRaceClock451(this);return}
   if(b.dataset.raceMonster){this.rosterDetail458=true;this.raw('select',{monsterId:b.dataset.raceMonster,roster:this.roster()});return}
   if(action==='create'||action==='join'){this.raw(action,{code:this.draft.code.trim(),roster:this.roster(),displayName:this.displayName()});return}
   if(action==='bet'){const r=this.state.room,t=this.draft.ticket;if(r?.phase!=='parade'||!validTicket451(t))throw Error('購入する予想を選んでください');if(!Number.isSafeInteger(Number(this.draft.amount))||Number(this.draft.amount)<1||Number(this.draft.amount)>betLimit458(this.save.state.player.gold,r.rulesVersion))throw Error('購入金額を所持GOLD・上限以内にしてください');const packet={raceId:r.id,requestId:`${r.id}:${this.transport.selfId}`,amount:Number(this.draft.amount),ticket:structuredClone(t)};reserveRaceBet451(this.save,this.key(),packet);this.raw('bet',packet);this.render();return}
   if(action==='pass'&&this.bank()?.pending)throw Error('馬券の受付確認中です');
   if(['start','pass','leave','again'].includes(action)){if(this.actionPending458?.op===action&&Date.now()-this.actionPending458.at<8000)return;this.actionPending458={op:action,at:Date.now(),roomId:this.state.room.id};this.raw(action);updateRaceClock451(this);return}
  }catch(e){this.error=e.message;this.render()}
 }
}
