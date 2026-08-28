import{randomBytes}from"node:crypto";

const DIRECTIONS=Object.freeze({up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]});
const MAZE_TILES=Object.freeze([
 "#############",
 "#.....#.....#",
 "#.###.#.###.#",
 "#.#...#...#.#",
 "#.#.#####.#.#",
 "#...#...#...#",
 "###.#.#.#.###",
 "#...#.#.#...#",
 "#.###.#.###.#",
 "#.#...#...#.#",
 "#.#.#####.#.#",
 "#...........#",
 "#############"
]);
const SPAWNS=Object.freeze([{x:1,y:1},{x:11,y:1},{x:1,y:11},{x:11,y:11}]);
const SWITCHES=Object.freeze([{id:"azure",x:3,y:5,label:"蒼音板"},{id:"crimson",x:9,y:5,label:"紅音板"}]);
const RESCUE_POINT=Object.freeze({x:9,y:3});
const EXIT_POINT=Object.freeze({x:6,y:11});
const CLUES=Object.freeze([
 "蒼の音板は左回廊。紅の音板と同時に起動せよ。",
 "紅の音板は右回廊。蒼の音板が光った瞬間に押せ。",
 "閉ざされた仲間は北東の共鳴杭で救出できる。",
 "出口は最南部。宝箱が脈打てばミミックに備えよ。"
]);

function id(){return randomBytes(7).toString("base64url")}
function bounded(value,min,max){const parsed=Number(value);return Number.isFinite(parsed)?Math.max(min,Math.min(max,parsed)):min}
function playerSnapshot(player){return{playerId:player.playerId,x:player.x,y:player.y,facing:player.facing,trapped:Boolean(player.trapped),choice:player.choice??null,lastActionAt:player.lastActionAt??0}}
export function resonanceSnapshot(state){
 if(!state)return null;
 return{id:state.id,phase:state.phase,startedAt:state.startedAt,deadlineAt:state.deadlineAt,finishedAt:state.finishedAt??0,cols:13,rows:13,tiles:[...state.tiles],players:Object.values(state.players).map(playerSnapshot),switches:state.switches.map(entry=>({...entry})),rescuePoint:{...state.rescuePoint},exit:{...state.exit},clues:{...state.clues},defenseProgress:state.defenseProgress,mimic:state.mimic?{...state.mimic}:null,choices:{...state.choices},score:state.score,rescues:state.rescues,coordination:state.coordination,result:state.result??null,lastEvent:state.lastEvent?{...state.lastEvent}:null};
}

export class ResonanceMazeCoordinator{
 constructor({now=()=>Date.now(),random=Math.random,sessions=new Map(),broadcast=()=>{},queueReward=()=>{}}={}){this.now=now;this.random=random;this.sessions=sessions;this.broadcast=broadcast;this.queueReward=queueReward}

 start(room,session){
  if(!room)return{ok:false,code:"NOT_IN_ROOM",message:"部屋に参加していません"};
  if(room.leaderId!==session?.playerId)return{ok:false,code:"LEADER_ONLY",message:"共鳴迷宮を開始できるのはリーダーだけです"};
  if(room.phase!=="lobby")return{ok:false,code:"ROOM_BUSY",message:"別の共闘コンテンツが進行中です"};
  const members=[...room.members].map(playerId=>this.sessions.get(playerId)).filter(Boolean);
  if(members.length<2)return{ok:false,code:"NEED_PARTY",message:"共鳴迷宮は2人以上で挑戦してください"};
  if(members.some(member=>!member.connected))return{ok:false,code:"MEMBER_OFFLINE",message:"再接続待ちの仲間がいます"};
  if(members.some(member=>!member.ready))return{ok:false,code:"NOT_ALL_READY",message:"全員の準備完了を待っています"};
  const startedAt=this.now(),players={};
  members.forEach((member,index)=>{const spawn=SPAWNS[index]??SPAWNS[0];players[member.playerId]={playerId:member.playerId,...spawn,facing:index%2?"left":"right",trapped:false,choice:null,lastActionAt:0};member.ready=false});
  room.phase="resonance";
  room.resonance={id:id(),phase:"switches",startedAt,deadlineAt:startedAt+7*60_000,finishedAt:0,tiles:[...MAZE_TILES],players,switches:SWITCHES.map(entry=>({...entry,heldBy:null,activatedAt:0})),rescuePoint:{...RESCUE_POINT},exit:{...EXIT_POINT},clues:Object.fromEntries(members.map((member,index)=>[member.playerId,CLUES[index%CLUES.length]])),defenseProgress:0,mimic:null,choices:{},score:0,rescues:0,coordination:0,result:null,lastEvent:{kind:"start",title:"共鳴迷宮 開門",message:"別々の手掛かりを声で共有し、二つの音板を同時に起動しよう。",at:startedAt},lastAdvanceAt:startedAt};
  this.broadcast(room,{type:"resonanceStarted",resonance:resonanceSnapshot(room.resonance)});
  this.broadcast(room,{type:"roomRefresh"});
  return{ok:true,resonance:resonanceSnapshot(room.resonance)};
 }

 move(room,session,source={}){
  const state=room?.resonance,player=state?.players?.[session?.playerId];
  if(!state||room.phase!=="resonance")return{ok:false,code:"NO_RESONANCE",message:"共鳴迷宮は開始されていません"};
  if(!player)return{ok:false,code:"NOT_IN_MAZE",message:"迷宮の参加者ではありません"};
  if(["result","mimic"].includes(state.phase))return{ok:false,code:"MOVE_CLOSED",message:"現在は移動できません"};
  if(player.trapped)return{ok:false,code:"PLAYER_TRAPPED",message:"仲間の救出を待っています"};
  const direction=String(source.direction??""),vector=DIRECTIONS[direction];
  if(!vector)return{ok:false,code:"BAD_DIRECTION",message:"移動方向が正しくありません"};
  const x=player.x+vector[0],y=player.y+vector[1];
  if(state.tiles[y]?.[x]!==".")return{ok:false,code:"BLOCKED",message:"壁があって進めません"};
  player.x=x;player.y=y;player.facing=direction;
  for(const entry of state.switches)if(entry.heldBy===player.playerId&&!(entry.x===x&&entry.y===y)){entry.heldBy=null;entry.activatedAt=0}
  this._state(room,"move");
  return{ok:true,position:{x,y,facing:direction}};
 }

 action(room,session,source={}){
  const state=room?.resonance,player=state?.players?.[session?.playerId],kind=String(source.kind??"interact"),now=this.now();
  if(!state||room.phase!=="resonance")return{ok:false,code:"NO_RESONANCE",message:"共鳴迷宮は開始されていません"};
  if(!player)return{ok:false,code:"NOT_IN_MAZE",message:"迷宮の参加者ではありません"};
  if(kind==="return"&&state.phase==="result"){room.phase="lobby";room.resonance=null;for(const playerId of room.members){const member=this.sessions.get(playerId);if(member)member.ready=false}this.broadcast(room,{type:"roomRefresh"});return{ok:true}}
  if(now-(player.lastActionAt??0)<280)return{ok:false,code:"ACTION_RATE",message:"少し待ってから操作してください"};
  player.lastActionAt=now;
  if(state.phase==="switches"){
   const plate=state.switches.find(entry=>entry.x===player.x&&entry.y===player.y);
   if(!plate)return{ok:false,code:"NO_SWITCH",message:"共鳴音板の上で操作してください"};
   for(const entry of state.switches)if(entry.heldBy===player.playerId){entry.heldBy=null;entry.activatedAt=0}
   plate.heldBy=player.playerId;plate.activatedAt=now;
   const active=state.switches.every(entry=>entry.heldBy&&state.players[entry.heldBy]);
   if(active&&new Set(state.switches.map(entry=>entry.heldBy)).size===state.switches.length){state.phase="defense";state.coordination++;state.defenseProgress=0;this._event(state,"gate","同時起動成功！","開門まで共鳴杭を守り抜け！")}
   else this._event(state,"switch",`${plate.label} 起動`,"もう一方の音板を仲間に頼もう。")
  }else if(state.phase==="defense"){
   state.defenseProgress=bounded(state.defenseProgress+12+Object.keys(state.players).length*2,0,100);
   if(state.defenseProgress>=100)this._beginRescue(state);
   else this._event(state,"defense","共鳴杭を防衛",`開門同調 ${Math.round(state.defenseProgress)}%`)
  }else if(state.phase==="rescue"){
   if(player.trapped)return{ok:false,code:"TRAPPED",message:"救助を待ってください"};
   if(Math.abs(player.x-state.rescuePoint.x)+Math.abs(player.y-state.rescuePoint.y)>1)return{ok:false,code:"TOO_FAR",message:"北東の共鳴杭まで移動してください"};
   const trapped=Object.values(state.players).find(entry=>entry.trapped);
   if(trapped){trapped.trapped=false;trapped.x=player.x;trapped.y=player.y+1;state.rescues++;state.score+=500;state.phase="chest";this._event(state,"rescue","救出成功！","出口の三つの宝箱から一つずつ選ぼう。")}
  }else if(state.phase==="chest"){
   const choice=["gold","crystal","capture"].includes(String(source.choice))?String(source.choice):null;
   if(!choice)return{ok:false,code:"BAD_CHEST",message:"宝箱を選んでください"};
   player.choice=choice;state.choices[player.playerId]=choice;
   if(Object.keys(state.players).every(playerId=>state.choices[playerId]))this._resolveChest(room,state);
   else this._event(state,"choice","宝箱を選択",`${Object.keys(state.choices).length}/${Object.keys(state.players).length}人が選択済み`)
  }else if(state.phase==="mimic"){
   if(kind!=="attack")return{ok:false,code:"MIMIC_ACTION",message:"ミミックへ攻撃してください"};
   const profile=this.sessions.get(player.playerId)?.profile??{},damage=Math.max(35,Math.min(420,Math.round(35+Math.sqrt(Math.max(0,Number(profile.power)||0))*2.5))),before=state.mimic.hp;state.mimic.hp=Math.max(0,state.mimic.hp-damage);state.score+=before-state.mimic.hp;
   this._event(state,"mimic","共鳴ミミックへ攻撃！",`${before-state.mimic.hp}ダメージ`);
   if(state.mimic.hp<=0)this._finish(room,true,"mimic")
  }else if(state.phase==="result")return{ok:false,code:"ALREADY_FINISHED",message:"挑戦は終了しています"};
  this._state(room,"action");
  this.broadcast(room,{type:"roomRefresh"});
  return{ok:true,resonance:resonanceSnapshot(state)};
 }

 playerLeft(room,playerId){const state=room?.resonance;if(!state?.players?.[playerId])return;delete state.players[playerId];delete state.choices[playerId];for(const plate of state.switches)if(plate.heldBy===playerId){plate.heldBy=null;plate.activatedAt=0}const remaining=Object.keys(state.players).length;if(!remaining){room.phase="lobby";room.resonance=null;return}if(remaining<2&&state.phase!=="result"){this._finish(room,false,"partyChanged");return}this._state(room,"leave")}

 advance(room){
  const state=room?.resonance;if(!state||room.phase!=="resonance"||state.phase==="result")return;
  const now=this.now();if(now>=state.deadlineAt){this._finish(room,false,"timeout");return}
  if(now-(state.lastAdvanceAt??0)<500)return;state.lastAdvanceAt=now;
  if(state.phase==="defense"){const count=Object.keys(state.players).length;state.defenseProgress=bounded(state.defenseProgress+count*1.5,0,100);if(state.defenseProgress>=100)this._beginRescue(state)}
  for(const player of Object.values(state.players)){const session=this.sessions.get(player.playerId);if(session?.connected)continue;this._autoPlayer(room,state,player)}
  this._state(room,"tick");
  this.broadcast(room,{type:"roomRefresh"});
 }

 _autoPlayer(room,state,player){
  if(state.phase==="switches"){const index=Object.keys(state.players).indexOf(player.playerId)%state.switches.length,target=state.switches[index];if(player.x===target.x&&player.y===target.y){if(!target.heldBy)this.action(room,this.sessions.get(player.playerId),{kind:"interact"});return}this._autoMove(state,player,target);return}
  if(state.phase==="defense"){player.lastActionAt=0;this.action(room,this.sessions.get(player.playerId),{kind:"interact"});return}
  if(state.phase==="rescue"){if(player.trapped)return;const distance=Math.abs(player.x-state.rescuePoint.x)+Math.abs(player.y-state.rescuePoint.y);if(distance<=1){player.lastActionAt=0;this.action(room,this.sessions.get(player.playerId),{kind:"interact"})}else this._autoMove(state,player,state.rescuePoint);return}
  if(state.phase==="chest"){player.lastActionAt=0;this.action(room,this.sessions.get(player.playerId),{kind:"choose",choice:["gold","crystal","capture"][Object.keys(state.choices).length%3]});return}
  if(state.phase==="mimic"){player.lastActionAt=0;this.action(room,this.sessions.get(player.playerId),{kind:"attack"})}
 }

 _autoMove(state,player,target){const step=this._nextStep(state,player,target);if(!step)return;player.x=step.x;player.y=step.y;player.facing=step.facing}
 _nextStep(state,start,target){const key=point=>`${point.x},${point.y}`,queue=[{x:start.x,y:start.y}],seen=new Set([key(start)]),parent=new Map();let found=null;for(let cursor=0;cursor<queue.length&&!found;cursor++){const current=queue[cursor];for(const[direction,[dx,dy]]of Object.entries(DIRECTIONS)){const next={x:current.x+dx,y:current.y+dy,direction},nextKey=key(next);if(seen.has(nextKey)||state.tiles[next.y]?.[next.x]!==".")continue;seen.add(nextKey);parent.set(nextKey,current);if(next.x===target.x&&next.y===target.y){found=next;break}queue.push(next)}}if(!found)return null;let step=found;while(parent.has(key(step))){const prior=parent.get(key(step));if(prior.x===start.x&&prior.y===start.y)break;step=prior}return{x:step.x,y:step.y,facing:step.x<start.x?"left":step.x>start.x?"right":step.y<start.y?"up":"down"}}
 _beginRescue(state){state.phase="rescue";state.defenseProgress=100;const trapped=Object.values(state.players).at(-1);if(trapped)trapped.trapped=true;this._event(state,"trap","仲間が共鳴牢へ転送！","北東の救助杭へ急げ！")}
 _resolveChest(room,state){state.coordination++;if(this.random()<.55){state.phase="mimic";state.mimic={hp:1200+Object.keys(state.players).length*450,maxHp:1200+Object.keys(state.players).length*450};this._event(state,"mimic","宝箱が共鳴ミミックへ変貌！","みんなで連打して撃破しよう！")}else this._finish(room,true,"treasure")}
 _finish(room,victory,reason){const state=room.resonance;if(!state||state.phase==="result")return;const elapsed=Math.max(0,this.now()-state.startedAt),timeBonus=Math.max(0,Math.round((state.deadlineAt-this.now())/1000)*5);state.score=Math.max(0,Math.round(1000+timeBonus+state.rescues*500+state.coordination*700+(victory?1800:0)));state.phase="result";state.result={victory,reason,elapsedMs:elapsed,score:state.score};state.finishedAt=this.now();this._event(state,"result",victory?"共鳴迷宮 踏破！":"共鳴が途絶えた…",victory?`協力スコア ${state.score.toLocaleString()}`:"時間切れ。もう一度連携を整えよう。");if(victory)for(const playerId of Object.keys(state.players)){const session=this.sessions.get(playerId),choice=state.choices[playerId],reward={gold:800+Math.round(state.score*.35),crystals:choice==="crystal"?3:1,captureCrystals:choice==="capture"?2:0};if(choice==="gold")reward.gold+=1200;this.queueReward(session,{rewardId:`resonance:${state.id}:${playerId}`,reward,source:{kind:"resonance",title:"共鳴迷宮 協力報酬",score:state.score}})}this.broadcast(room,{type:"resonanceEnded",resonance:resonanceSnapshot(state),result:state.result});this.broadcast(room,{type:"roomRefresh"})}
 _event(state,kind,title,message){state.lastEvent={kind,title,message,at:this.now()}}
 _state(room,reason){this.broadcast(room,{type:"resonanceState",reason,resonance:resonanceSnapshot(room.resonance)})}
}
