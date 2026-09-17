import{CARDS463,CARD_BY_ID463,SPECIALS463,SPECIAL_BY_ID463,isInstant463,hasAttr463}from'./Catalog463.js';
import{BOARD463,NODES463,GOAL463,distance463}from'./Board463.js';
const fail=s=>{throw Error(s)};
export const copy463=x=>JSON.parse(JSON.stringify(x));
export function rng463(g,n){let x=g.seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;g.seed=x>>>0;return(g.seed>>>0)%Math.max(1,n)}
export function shuffle463(g,a){for(let i=a.length-1;i>0;i--){const j=rng463(g,i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
export const player463=(g,id)=>g.players?.find(p=>p.playerId===id);
export const current463=g=>g.players?.[g.turn];
export const definition463=(g,uid)=>CARD_BY_ID463[g.cards?.[uid]];
const active=g=>g.players.filter(p=>!p.finished);
const special=p=>SPECIAL_BY_ID463[p?.special];
const label=(g,id)=>player463(g,id)?.name??'冒険者';
const posValue=p=>NODES463[p.pos]?.index??0;
export function log463(g,text,cardId=null){g.log.push({id:++g.eventId,text,cardId,turn:g.turnNumber});if(g.log.length>100)g.log.shift()}
function add(g,list,front=false){const fx=list.filter(Boolean);if(front)g.queue.unshift(...fx);else g.queue.push(...fx)}
function meta(g,actor,cardId,source='card'){return{actor,group:`${g.turnNumber}:${++g.effectId}`,cardId,source}}
function cardEffects(g,p,c,over={}){const m={...meta(g,p.playerId,c.id),...over};let mult=p.boostAttr&&c.attrs.includes(p.boostAttr)?2:1;if(mult>1)p.boostAttr=null;return c.effects.map(e=>({...e,...m,n:e.n!=null?e.n*(['move','bonus','draw','discard','steal'].includes(e.type)?mult:1):e.n,target:e.target??p.playerId}))}
function ask(g,playerId,kind,prompt,options,data={}){g.pending={id:++g.choiceId,playerId,kind,prompt,options,data};}
function ownCards(g,p){return p.hand.map(uid=>({uid,c:definition463(g,uid)}))}
function leading(g,exclude){return active(g).filter(p=>p.playerId!==exclude).sort((a,b)=>distance463(a.pos)-distance463(b.pos)||a.seat-b.seat)[0]}
function hostileTarget(g,e){return typeof e.target==='string'&&player463(g,e.target)&&e.actor!==e.target&&e.harmful}
function multiplier(p,e){return p.special==='greed'&&!e.cost&&!e.noGreed&&['draw','discard','steal'].includes(e.type)?2:1}
export function makeLobby463({id,code,partyId,hostId,members,now=0,seed=1}){return{id,code,game:'sugoroku',partyId462:partyId,hostId,rulesVersion:9,phase:'lobby',createdAt:now,updatedAt:now,seed:seed||1,members:members.map(m=>({...m,choice:null,ai:false})),players:[],revision:0,seen:{},log:[],eventId:0,effectId:0,choiceId:0,deadline:0}}
export function start463(g,now=0){
 if(g.phase!=='lobby')fail('すでに開始しています');
 g.cards={};g.deck=[];g.discard=[];g.specialDeck=shuffle463(g,SPECIALS463.map(s=>s.id));g.specialDiscard=[];g.queue=[];g.pending=null;g.turnNumber=1;g.turn=0;g.extraChain=0;g.finishOrder=[];g.blocked={};g.step='draw';g.usedSet={};g.startedAt=now;
 let serial=0;for(const c of CARDS463)for(let i=0;i<c.copies;i++){const uid='c'+(++serial);g.cards[uid]=c.id;g.deck.push(uid)}shuffle463(g,g.deck);
 g.players=g.members.map((m,i)=>({playerId:m.playerId,name:m.name,seat:i,ai:!!m.ai,choice:m.choice,hand:[],special:null,pos:'0',trail:['0'],skip:0,turns:0,mods:{bonus:0,dice:1},finished:null,ward:null}));
 const aiNames=['旅するスライム','火花のスライム','月影の狼','いたずら悪魔'];const aiSpecies=['slime','ember_slime','wolf','goblin'];
 while(g.players.length<4){const i=g.players.length;g.players.push({playerId:`AI-${g.id}-${i}`,name:aiNames[i],seat:i,ai:true,choice:{id:'ai-'+i,speciesId:aiSpecies[i]},hand:[],special:null,pos:'0',trail:['0'],skip:0,turns:0,mods:{bonus:0,dice:1},finished:null,ward:null})}
 // Draw from the shuffled non-instant portion without revealing or discarding the excluded cards.
 for(const p of g.players)for(let i=0;i<3;i++){const at=g.deck.findIndex(uid=>!isInstant463(definition463(g,uid)));p.hand.push(g.deck.splice(at,1)[0])}shuffle463(g,g.deck);
 g.phase='playing';g.updatedAt=now;g.deadline=now+75000;g.nextAutoAt=now+1400;log463(g,'星砕きの回廊へ。手札3枚でスタート！');log463(g,`${current463(g).name}の手番`);
}
function drop(g,p,uids,{silent=false}={}){const actual=[];for(const uid of uids){const i=p.hand.indexOf(uid);if(i<0)continue;p.hand.splice(i,1);g.discard.push(uid);actual.push(uid);if(p.ward===uid)p.ward=null}
 if(actual.length&&!silent)log463(g,`${p.name}は手札を${actual.length}枚捨てた`);
 const triggers=actual.filter(uid=>definition463(g,uid)?.onDiscard);if(!p.finished&&triggers.length)add(g,triggers.map(uid=>({...meta(g,p.playerId,g.cards[uid],'discard'),type:'move',target:p.playerId,n:definition463(g,uid).onDiscard})),true);
 return actual;
}
function recycle(g){if(!g.deck.length&&g.discard.length){g.deck=shuffle463(g,g.discard.splice(0));log463(g,'捨て札をシャッフルして山札に戻した')}}
function receiveCard(g,p,uid,mode='normal'){
 if(p.finished){g.discard.push(uid);return}
 const c=definition463(g,uid);
 if(isInstant463(c)){
  if(c.kind==='exchange'){g.discard.push(uid);log463(g,`${p.name}が特殊カード交換を引いた`,c.id);add(g,[{...meta(g,p.playerId,c.id,'instant'),type:'special',target:p.playerId}],true);return}
  if((c.kind==='bad'&&(mode==='safe'||['buddha','shiva'].includes(p.special)||(p.special==='drunk'&&hasAttr463(c,'yori'))))){g.discard.push(uid);log463(g,`${p.name}は悪い速攻を無効化した`,c.id);return}
  if(mode==='hold'||p.special==='hacker'){p.hand.push(uid);return}
  g.discard.push(uid);log463(g,`${p.name}の速攻「${c.name}」発動！`,c.id);add(g,cardEffects(g,p,c,{source:'instant'}),true);
 }else p.hand.push(uid);
}
function safeSpecial(g,p,id){if(!id)return;if(p.special)ask(g,p.playerId,'special','残す特殊カードを選ぶ',[{value:p.special,label:special(p).name,special:p.special},{value:id,label:SPECIAL_BY_ID463[id].name,special:id}],{old:p.special,next:id});else{p.special=id;log463(g,`${p.name}が「${SPECIAL_BY_ID463[id].name}」を獲得！`)}}
function takeSpecial(g,p){if(!g.specialDeck.length)g.specialDeck=shuffle463(g,g.specialDiscard.splice(0));const id=g.specialDeck.pop();if(id)safeSpecial(g,p,id);else log463(g,'特殊カードの山札は空だった')}
function loseSpecial(g,p){if(p.special){log463(g,`${p.name}は「${special(p).name}」を失った`);g.specialDiscard.push(p.special);p.special=null;p.ward=null}}
export function score463(g,p,bonus=0){const raw=p.hand.reduce((n,uid)=>n+(definition463(g,uid)?.points??0),0);const double=p.hand.some(uid=>definition463(g,uid)?.score==='specialDouble');const sp=(special(p)?.points??0)*(double?2:1);const affinity=p.special==='drunk'?3*p.hand.filter(uid=>hasAttr463(definition463(g,uid),'yori')).length:0;return{hand:raw,special:sp,affinity,bonus,total:raw+sp+affinity+bonus,specialDouble:double}}
function finalize(g,p,place){p.finished={place,...score463(g,p,[40,20,10,5][place-1]),handCards:p.hand.map(uid=>g.cards[uid]),specialId:p.special};g.finishOrder.push(p.playerId);log463(g,`${p.name}が${place}着！ ${p.finished.total}点で確定`)}
function goal(g,p){
 const curse=p.hand.find(uid=>definition463(g,uid)?.curse==='goal');
 if(curse){drop(g,p,[curse],{silent:true});p.trail=p.trail.slice(0,Math.max(1,p.trail.length-20));p.pos=p.trail.at(-1);log463(g,`${p.name}は無念の呪いで20マス戻った！呪いは消滅`);return}
 if(!g.finishOrder.length){const thief=active(g).find(x=>x!==p&&x.special==='thief'&&!x.hand.some(uid=>definition463(g,uid)?.curse==='goal'));if(thief){thief.pos=GOAL463;finalize(g,thief,1);log463(g,'怪盗が最初のゴールを奪った！')}}
 finalize(g,p,g.finishOrder.length+1);
 if(g.finishOrder.length>=3){for(const last of active(g))finalize(g,last,4);g.phase='result';g.queue=[];g.pending=null;g.results=g.players.map(p=>({playerId:p.playerId,name:p.name,choice:p.choice,...p.finished})).sort((a,b)=>b.total-a.total||a.place-b.place);g.endedAt=g.updatedAt;log463(g,`${g.results[0].name}が得点1位！`)}
}
function landing(g,p,e){if(p.pos===GOAL463){goal(g,p);return}if(!e.event||p.finished)return;const node=NODES463[p.pos];if(p.special==='power'&&node.tone==='black'){log463(g,`${p.name}は権力で黒マスを無効化`);return}log463(g,`${p.name}が「${node.name}」に止まった`);const m=meta(g,p.playerId,null,'tile');add(g,node.effects.map(fx=>({...fx,...m,target:fx.target??p.playerId,tile:node.id,...(fx.type==='move'?{event:false}:{})})),true)}
function move(g,p,e){
 if(p.finished)return;let n=Math.trunc(e.n??0);if(!n)return;
 if(n<0){if(p.special==='worker'){log463(g,`${p.name}は後退を無効化`);return}const from=p.pos;p.trail=p.trail.slice(0,Math.max(1,p.trail.length+n));p.pos=p.trail.at(-1);log463(g,`${p.name}が${Math.abs(n)}マス戻る`);landing(g,p,e);if(from!=='0'&&p.pos==='0')for(const x of active(g))if(x!==p&&x.special==='buddha')x.buddhaReady=true;
  if(p.special==='grudge'&&!p.grudgeUsed){p.grudgeUsed=true;const fx=[{...meta(g,p.playerId,null,'special'),type:'draw',target:p.playerId,n:2,mode:'safe'}];if(e.actor!==p.playerId&&player463(g,e.actor)&&!player463(g,e.actor).finished)fx.unshift({...meta(g,p.playerId,null,'special'),type:'steal',target:e.actor,n:1,harmful:true});add(g,fx,true)}return}
 const origin=p.pos;let reachedGoal=false;
 while(n>0&&!p.finished){const node=NODES463[p.pos];if(!node.next.length)break;
  if(node.next.length>1&&!e.path){ask(g,p.playerId,'fork','近道か、宝庫への寄り道か',[{value:node.next[0],label:'近道を進む',note:'ゴールへ最短の道'},{value:node.next[1],label:'宝庫へ寄り道',note:'4マス長い。補充・特殊カードのチャンス'}],{effect:{...e,n}});return}
  const next=e.path??node.next[0];delete e.path;if(!node.next.includes(next))fail('通れない道です');p.pos=next;p.trail.push(next);n--;
  if(p.pos===GOAL463){reachedGoal=true;goal(g,p);break}if(NODES463[p.pos].kind==='gate'){e.event=true;break}
 }
 if(p.pos!==origin)log463(g,`${p.name}が${NODES463[p.pos].name}へ進む`);if(!p.finished&&!reachedGoal)landing(g,p,e);
}
function defend(g,p,e){
 if(!e.harmful||e.checked||g.blocked[e.group+':'+p.playerId])return false;
 if(p.finished)return false;
 const options=[];
 for(const uid of p.hand){const c=definition463(g,uid);if(c.defense)options.push({value:uid,label:c.name,cardId:c.id});else if(p.ward===uid)options.push({value:uid,label:'シヴァの防御札',cardId:c.id})}
 if(p.special==='tsundere'&&e.actor!==p.playerId&&!e.area&&!e.reflected&&p.reflectTurn!==g.turnNumber)options.push({value:'passive-reflect',label:'ツンデレで跳ね返す'});
 if(e.type==='catastrophe')for(const uid of p.hand){const c=definition463(g,uid);if(c.attrs.some(a=>['yori','enami'].includes(a)))options.push({value:'cost:'+uid,label:c.name+'を捨てて回避',cardId:c.id})}
 if(!options.length)return false;options.push({value:'accept',label:'防御せず受ける'});ask(g,p.playerId,'defense',`${e.cardId?CARD_BY_ID463[e.cardId]?.name:e.source==='tile'?NODES463[e.tile]?.name:'相手の効果'}に対応`,options,{effect:e});return true;
}
function expandTarget(g,e){
 if(['all','allOthers'].includes(e.target)){add(g,active(g).filter(p=>e.target==='all'||p.playerId!==e.actor).map(p=>({...e,target:p.playerId,area:true})),true);return true}
 if(e.target==='leader'){const p=leading(g,e.actor);if(p)add(g,[{...e,target:p.playerId}],true);return true}
 if(e.target==='choose'||e.target==='chooseAny'){
  let choices=active(g).filter(p=>e.target==='chooseAny'||p.playerId!==e.actor);if(['steal','swapHand','discard'].includes(e.type))choices=choices.filter(p=>p.hand.length);if(['stealSpecial','loseSpecial'].includes(e.type))choices=choices.filter(p=>p.special);
  if(!choices.length)return true;
  ask(g,e.actor,'target','対象のプレイヤーを選ぶ',choices.map(p=>({value:p.playerId,label:p.name,note:`残り${distance463(p.pos)}マス・手札${p.hand.length}枚`})),{effect:e});return true;
 }return false;
}
function execute(g,e){
 if(g.phase!=='playing'||player463(g,e.actor)?.finished)return;if(expandTarget(g,e))return;const p=player463(g,e.target);if(!p||p.finished||g.blocked[e.group+':'+p.playerId])return;
 if(e.source==='instant'&&CARD_BY_ID463[e.cardId]?.kind==='bad'&&(['buddha','shiva'].includes(p.special)||p.special==='drunk'&&hasAttr463(CARD_BY_ID463[e.cardId],'yori'))){log463(g,`${p.name}は悪い速攻を無効化した`);return}
 if(defend(g,p,e))return;
 const actor=player463(g,e.actor)??p;
 switch(e.type){
 case'draw':{const n=Math.min(24,Math.max(0,e.n??1)*multiplier(p,e));add(g,Array.from({length:n},()=>({...e,type:'drawOne'})),true);break}
 case'drawOne':{recycle(g);const uid=g.deck.pop();if(uid)receiveCard(g,p,uid,e.mode);break}
 case'bonus':p.mods.bonus+=e.n;log463(g,`${p.name}の合計出目＋${e.n}`);break;
 case'dice':p.mods.dice=Math.min(5,p.mods.dice+e.n);log463(g,`${p.name}のサイコロが${p.mods.dice}個に`);break;
 case'boostAttr':p.boostAttr=e.attr;log463(g,`${p.name}が属性の力をためた`);break;
 case'direct':p.mods.noRoll=true;move(g,p,{...e,type:'move'});break;
 case'move':move(g,p,e);break;
 case'roll':{let count=Math.min(5,p.mods.dice+(p.buddhaReady?2:0));p.buddhaReady=false;const dice=Array.from({length:count},()=>rng463(g,6)+1),transformed=p.special==='worker'?dice.map(n=>n>=4?1:n):dice;let n=transformed.reduce((a,b)=>a+b,0)+p.mods.bonus;
 if(p.special==='genius')n=Math.max(1,Math.min(10,p.hand.length));if(p.hand.some(uid=>definition463(g,uid)?.curse==='heavy'))n-=2;n+=Math.max(0,Math.floor((g.turnNumber-85)/16));n=Math.max(1,n);g.lastRoll={eventId:g.eventId+1,playerId:p.playerId,dice,transformed,total:n,genius:p.special==='genius'};log463(g,`${p.name}：${n}マス進む`);move(g,p,{...e,type:'move',n,event:true});break}
 case'discard':{const n=Math.min(p.hand.length,Math.max(0,e.n)*multiplier(p,e));if(n&&e.select){ask(g,p.playerId,'discard',`捨てるカードを${n}枚選ぶ`,p.hand.map(uid=>({value:uid,label:definition463(g,uid).name,cardId:g.cards[uid]})),{remaining:n,effect:e});}else if(n)drop(g,p,shuffle463(g,[...p.hand]).slice(0,n));break}
 case'discardAttr':drop(g,p,p.hand.filter(uid=>hasAttr463(definition463(g,uid),e.attr)));break;
 case'cleanse':drop(g,p,p.hand.filter(uid=>definition463(g,uid)?.kind==='curse'));log463(g,`${p.name}の呪いを浄化`);break;
 case'catastrophe':drop(g,p,[...p.hand]);break;
 case'handSize':if(p.hand.length<e.n)add(g,[{...e,type:'draw',n:e.n-p.hand.length,noGreed:true,mode:'safe'}],true);else if(p.hand.length>e.n)add(g,[{...e,type:'discard',n:p.hand.length-e.n,select:true,noGreed:true}],true);break;
 case'steal':{if(actor.finished)return;const n=Math.min(p.hand.length,Math.max(0,e.n)*multiplier(actor,e));if(!n)return;const concealed=shuffle463(g,[...p.hand]);ask(g,actor.playerId,'steal',`${p.name}の裏向きの手札から1枚選ぶ`,concealed.map((uid,i)=>({value:String(i),label:`裏向きのカード ${i+1}`})),{target:p.playerId,concealed,remaining:n,effect:e});break}
 case'swapHand':{if(actor.finished)return;const n=Math.min(e.n,actor.hand.length,p.hand.length);const fromA=shuffle463(g,[...actor.hand]).slice(0,n),fromB=shuffle463(g,[...p.hand]).slice(0,n);actor.hand=actor.hand.filter(uid=>!fromA.includes(uid));p.hand=p.hand.filter(uid=>!fromB.includes(uid));for(const uid of fromA){if(actor.ward===uid)actor.ward=null;receiveCard(g,p,uid)}for(const uid of fromB){if(p.ward===uid)p.ward=null;receiveCard(g,actor,uid)}log463(g,`${actor.name}と${p.name}が手札${n}枚を交換`);break}
 case'special':takeSpecial(g,p);break;
 case'loseSpecial':loseSpecial(g,p);break;
 case'swapSpecial':if(!actor.finished){[actor.special,p.special]=[p.special,actor.special];actor.ward=null;p.ward=null;log463(g,`${actor.name}と${p.name}が特殊カードを交換`)}break;
 case'stealSpecial':if(p.special&&!actor.finished){const s=p.special;p.special=null;p.ward=null;log463(g,`${actor.name}が${p.name}の特殊カードを奪った`);safeSpecial(g,actor,s)}break;
 case'skip':if(p.special!=='worker'){p.skip=Math.min(2,p.skip+e.n);log463(g,`${p.name}は${p.skip}回休み`)}else log463(g,`${p.name}は休みを無効化`);break;
 case'endNow':if(current463(g)===p){g.queue=g.queue.filter(x=>x.group!==e.group);g.step='ending';log463(g,`${p.name}の手番終了`)}else p.skip=Math.min(2,p.skip+1);break;
 case'extraTurn':if(!g.extraChain){p.extraTurn=true;log463(g,`${p.name}が追加ターンを獲得`)}else log463(g,'追加ターン中の再追加はできない');break;
 case'recover':{const n=Math.min(e.n,g.discard.length);if(n)ask(g,p.playerId,'recover',`捨て札から${n}枚回収できる`,g.discard.map(uid=>({value:uid,label:definition463(g,uid).name,cardId:g.cards[uid]})),{remaining:n});break}
 case'discardMove':ask(g,p.playerId,'discardMove','進むために捨てる手札を選ぶ（0枚なら取り消し）',[...p.hand.map(uid=>({value:uid,label:definition463(g,uid).name,cardId:g.cards[uid]})),{value:'done',label:'選び終えて進む'}],{count:0});break;
 case'resetLeader':{if(p.special==='worker'){log463(g,`${p.name}は後退を無効化`);break}p.pos='0';p.trail=['0'];log463(g,`${p.name}がスタートへ戻された！`);for(const x of active(g))if(x!==p&&x.special==='buddha')x.buddhaReady=true;break}
 case'ward':if(!p.ward&&p.hand.length)ask(g,p.playerId,'ward','防御札に変えるカードを選ぶ',p.hand.map(uid=>({value:uid,label:definition463(g,uid).name,cardId:g.cards[uid]})));break;
 default:fail('未定義の効果：'+e.type);
 }
}
function nextTurn(g){if(g.phase!=='playing')return;const last=current463(g);if(last?.extraTurn&&!last.finished&&!g.extraChain){last.extraTurn=false;g.extraChain=1}else{g.extraChain=0;do{g.turn=(g.turn+1)%4}while(current463(g).finished)}g.turnNumber++;g.step='draw';g.blocked={};const p=current463(g);p.mods={bonus:0,dice:1};p.boostAttr=null;p.grudgeUsed=false;p.specialUsed=false;p.playedTurn={};log463(g,`${p.name}の手番${g.extraChain?'（追加）':''}`)}
export function settle463(g){let safety=0;while(g.queue.length&&!g.pending&&g.phase==='playing'){if(++safety>1500)fail('効果の処理回数を超えました');execute(g,g.queue.shift())}if(g.phase==='playing'&&!g.queue.length&&!g.pending&&(g.step==='ending'||current463(g).finished))nextTurn(g)}
function resolveChoice(g,p,value){const q=g.pending;if(!q||q.playerId!==p.playerId)fail('今はあなたの選択ではありません');if(!q.options.some(o=>o.value===value))fail('選択肢を選んでください');g.pending=null;const d=q.data,e=d.effect;
 switch(q.kind){
 case'target':add(g,[{...e,target:value}],true);break;
 case'fork':add(g,[{...e,target:p.playerId,path:value}],true);break;
 case'special':{const unused=value===d.old?d.next:d.old;if(unused)g.specialDiscard.push(unused);p.special=value;p.ward=null;log463(g,`${p.name}は「${special(p).name}」を選んだ`);break}
 case'discard':{drop(g,p,[value]);if(d.remaining>1&&p.hand.length)ask(g,p.playerId,'discard',`あと${d.remaining-1}枚捨てる`,p.hand.map(uid=>({value:uid,label:definition463(g,uid).name,cardId:g.cards[uid]})),{...d,remaining:d.remaining-1});break}
 case'recover':{const i=g.discard.indexOf(value);if(i<0)fail('そのカードはもう捨て札にありません');g.discard.splice(i,1);receiveCard(g,p,value,'hold');if(d.remaining>1&&g.discard.length)ask(g,p.playerId,'recover',`あと${d.remaining-1}枚回収`,g.discard.map(uid=>({value:uid,label:definition463(g,uid).name,cardId:g.cards[uid]})),{remaining:d.remaining-1});break}
 case'discardMove':if(value==='done'){p.mods.noRoll=true;add(g,[{...meta(g,p.playerId,'dove'),type:'move',target:p.playerId,n:d.count}],true)}else{drop(g,p,[value]);ask(g,p.playerId,'discardMove',`${d.count+1}マス分選択中`,[...p.hand.map(uid=>({value:uid,label:definition463(g,uid).name,cardId:g.cards[uid]})),{value:'done',label:`${d.count+1}マス進む`}],{count:d.count+1})}break;
 case'steal':{const other=player463(g,d.target),uid=d.concealed[Number(value)],i=other?.hand.indexOf(uid);if(i==null||i<0)fail('そのカードは選べません');other.hand.splice(i,1);if(other.ward===uid)other.ward=null;receiveCard(g,p,uid);log463(g,`${p.name}が${other.name}から1枚引いた`);if(d.remaining>1)add(g,[{...e,n:d.remaining-1,noGreed:true,checked:true}],false);break}
 case'defense':{
  if(value==='accept'){add(g,[{...e,checked:true}],true);break}
  let reflect=value==='passive-reflect';if(value.startsWith('cost:'))drop(g,p,[value.slice(5)]);else if(reflect)p.reflectTurn=g.turnNumber;else{reflect=definition463(g,value)?.reflect;drop(g,p,[value]);}
  g.blocked[e.group+':'+p.playerId]=true;const remaining=g.queue.filter(x=>x.group===e.group&&x.target===p.playerId);g.queue=g.queue.filter(x=>!(x.group===e.group&&x.target===p.playerId));
  if(reflect&&e.actor!==p.playerId&&e.source!=='tile'&&e.source!=='instant'&&!e.reflected){const group=meta(g,p.playerId,null).group;add(g,[e,...remaining].map(x=>({...x,actor:p.playerId,target:e.actor,group,reflected:true,checked:false})),true);log463(g,`${p.name}が効果を跳ね返した！`)}else log463(g,`${p.name}が効果を無効化した！`);break}
 case'ward':p.ward=value;log463(g,`${p.name}が防御札を用意した`);break;
 default:fail('未対応の選択です');
 }
}
export function playable463(g,p,uid){const c=definition463(g,uid);if(!c||!p.hand.includes(uid)||p.finished||current463(g)!==p||g.pending||g.phase!=='playing')return false;if(p.playedTurn?.[uid])return false;if(c.timing==='set')return !g.usedSet[p.playerId+':'+c.set]&&g.step==='pre'&&[0,1,2,3].every(part=>p.hand.some(x=>{const d=definition463(g,x);return d.set===c.set&&d.part===part}));return(c.timing==='pre'&&g.step==='pre')||(c.timing==='post'&&g.step==='post')||(c.timing==='any'&&['pre','post'].includes(g.step));}
function useSpecial(g,p,payload){
 if(p.specialUsed||!['pre','post'].includes(g.step))fail('今は特殊能力を使えません');const fx=[],m=meta(g,p.playerId,null,'special');
 if(p.special==='chuni'&&g.step==='post'&&!g.extraChain){if(p.hand.length<2)fail('手札が2枚必要です');fx.push({type:'discard',n:2,select:true,cost:true},{type:'extraTurn'})}
 else if(p.special==='surprise'&&g.step==='pre'&&active(g).every(x=>x===p||distance463(x.pos)<distance463(p.pos))){if(p.hand.length<2)fail('手札が2枚必要です');fx.push({type:'discard',n:2,select:true,cost:true},{type:'move',n:-2,target:'allOthers',harmful:true})}
 else if(p.special==='punch'&&g.step==='post'){const targets=active(g).filter(x=>x!==p&&Math.abs(posValue(x)-posValue(p))<=2);if(!targets.length)fail('前後2マス以内に相手がいません');const n=rng463(g,6)+1;ask(g,p.playerId,'target',`${n}マス戻す相手を選ぶ`,targets.map(x=>({value:x.playerId,label:x.name})),{effect:{...m,type:'move',n:-n,harmful:true}})}
 else if(p.special==='shiva'&&!p.ward&&p.hand.length)fx.push({type:'ward'});else fail('特殊能力の発動条件を満たしていません');
 p.specialUsed=true;add(g,fx.map(e=>({...e,...m,target:e.target??p.playerId})));
}
export function action463(g,playerId,m,now=0){
 if(g.phase!=='playing')fail('ゲームは進行中ではありません');const p=player463(g,playerId);if(!p||p.finished)fail('観戦中は操作できません');g.updatedAt=now;
 if(m.kind==='choice'){resolveChoice(g,p,String(m.value));settle463(g);return}
 if(g.pending)fail('選択が終わるまでお待ちください');if(current463(g)!==p)fail('あなたの手番ではありません');
 if(m.kind==='draw'){
  if(g.step!=='draw')fail('この手番のカードは引いています');p.turns++;p.mods={bonus:0,dice:1};p.grudgeUsed=false;p.specialUsed=false;p.playedTurn={};
  if(p.skip>0){p.skip--;g.step='ending';log463(g,`${p.name}は1回休み`);settle463(g);return}
  g.step='pre';const base=meta(g,p.playerId,null,'turn');const fx=[];
  if(p.hand.some(uid=>definition463(g,uid)?.curse==='hunger')){const choices=p.hand.filter(uid=>definition463(g,uid)?.curse!=='hunger');if(choices.length)drop(g,p,[choices[rng463(g,choices.length)]])}
  fx.push({...base,type:'draw',target:p.playerId,n:1});
  if(p.special==='swift')fx.push({...base,type:'draw',target:p.playerId,n:1,mode:'safe'},{...base,type:'discard',target:p.playerId,n:1,select:true,cost:true});
  if(p.special==='want')fx.push({...base,type:'steal',target:'choose',n:1,harmful:true});add(g,fx);log463(g,`${p.name}がカードを引く`);
 }else if(m.kind==='play'){
  const uid=String(m.uid),c=definition463(g,uid);if(!playable463(g,p,uid))fail('このカードは今は使えません');let spent=[uid];if(c.set){spent=[0,1,2,3].map(part=>p.hand.find(x=>{const d=definition463(g,x);return d.set===c.set&&d.part===part}));log463(g,`${p.name}の絵柄が完成！`,c.id)}
  p.playedTurn??={};for(const used of spent)p.playedTurn[used]=true;if(c.set)g.usedSet[p.playerId+':'+c.set]=true;drop(g,p,spent,{silent:true});log463(g,`${p.name}が「${c.name}」を使用`,c.id);add(g,cardEffects(g,p,c));
 }else if(m.kind==='roll'){
  if(g.step!=='pre')fail('今はサイコロを振れません');g.step='post';if(p.mods.noRoll)log463(g,'移動カードを使用したため、サイコロを省略');else add(g,[{...meta(g,p.playerId,null,'roll'),type:'roll',target:p.playerId}]);
 }else if(m.kind==='end'){if(g.step!=='post')fail('移動を終えてから手番を終了できます');g.step='ending'}
 else if(m.kind==='special')useSpecial(g,p,m);else fail('未対応の操作です');settle463(g);
}
export function public463(g,id){
 const me=player463(g,id),q=g.pending;const pending=q?{id:q.id,playerId:q.playerId,kind:q.kind,prompt:q.prompt,...(q.playerId===id?{options:q.options}:{} )}:null;
 return{id:g.id,code:g.code,phase:g.phase,game:g.game,revision:g.revision,hostId:g.hostId,members:g.members.map(m=>({playerId:m.playerId,name:m.name,choice:m.choice,ai:!!m.ai})),players:(g.players??[]).map(p=>({playerId:p.playerId,name:p.name,seat:p.seat,ai:p.ai,choice:p.choice,pos:p.pos,skip:p.skip,special:p.special,handCount:p.hand.length,finished:p.finished,turns:p.turns,wardReady:!!p.ward})),hand:me?.hand.map(uid=>({uid,cardId:g.cards[uid],ward:uid===me.ward,playable:playable463(g,me,uid)}))??[],deckCount:g.deck?.length??0,discardCount:g.discard?.length??0,discardCards:(g.discard??[]).map(uid=>g.cards[uid]),step:g.step,turnNumber:g.turnNumber,turnPlayerId:current463(g)?.playerId,pending,deadline:g.deadline,lastRoll:g.lastRoll??null,log:g.log.slice(-24),results:g.results??null,ownScore:me?(me.finished??score463(g,me)):null,ownMods:me?.mods??null,ownSpecialUsed:me?.specialUsed??false,extraChain:g.extraChain??0};
}
export function botAction463(g,playerId){
 const p=player463(g,playerId),q=g.pending;if(!p||p.finished)return null;
 if(q){if(q.playerId!==playerId)return null;let value=q.options[0]?.value;
  if(q.kind==='defense'){const defense=q.options.filter(o=>o.value!=='accept');value=defense.find(o=>o.value==='passive-reflect')?.value??defense[0]?.value??'accept'}
  if(q.kind==='fork')value=q.options[p.hand.length<7&&distance463(p.pos)>20?1:0].value;
  if(q.kind==='discard'||q.kind==='ward')value=[...q.options].sort((a,b)=>{const ca=CARD_BY_ID463[a.cardId],cb=CARD_BY_ID463[b.cardId];return((ca?.kind==='curse'?-100:ca?.points??0)-(cb?.kind==='curse'?-100:cb?.points??0))})[0].value;
  if(q.kind==='recover')value=[...q.options].sort((a,b)=>(CARD_BY_ID463[b.cardId]?.points??0)-(CARD_BY_ID463[a.cardId]?.points??0))[0].value;
  if(q.kind==='special')value=[...q.options].sort((a,b)=>specialRating(b.special,p)-specialRating(a.special,p))[0].value;
  if(q.kind==='target')value=[...q.options].sort((a,b)=>distance463(player463(g,a.value)?.pos)-distance463(player463(g,b.value)?.pos))[0].value;
  if(q.kind==='steal')value=q.options[rng463(g,q.options.length)].value;
  if(q.kind==='discardMove')value=q.data.count>=3||p.hand.length<=4?'done':q.options.find(o=>o.value!=='done')?.value??'done';
  return{kind:'choice',value};
 }
 if(current463(g)!==p)return null;if(g.step==='draw')return{kind:'draw'};
 const playable=p.hand.filter(uid=>playable463(g,p,uid));const chosen=playable.find(uid=>definition463(g,uid).set)??playable.find(uid=>definition463(g,uid).id==='cleanse'&&p.hand.some(x=>definition463(g,x).kind==='curse'))??playable.find(uid=>{const c=definition463(g,uid);return c.points<=3&&c.id!=='dove'&&c.effects.some(e=>['bonus','dice','draw','steal','move','direct','extraTurn','loseSpecial'].includes(e.type))});
 if(chosen&&(p.botPlays??0)<3){p.botPlays=(p.botPlays??0)+1;return{kind:'play',uid:chosen}}
 if(g.step==='pre'){p.botPlays=0;return{kind:'roll'}}if(g.step==='post'){p.botPlays=0;if(p.special==='chuni'&&!p.specialUsed&&!g.extraChain&&p.hand.length>=5)return{kind:'special'};return{kind:'end'}}return null;
}
function specialRating(id,p){const s=SPECIAL_BY_ID463[id];return(s?.points??0)+(id==='genius'?p.hand.length:0)+(id==='thief'?-5:0)+(id==='hacker'?12:0)+(id==='want'?10:0)}
