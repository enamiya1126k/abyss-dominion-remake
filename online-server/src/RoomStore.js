import{randomBytes}from"node:crypto";

const ROOM_ALPHABET="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const FACING=new Set(["up","down","left","right"]);
const SOCIAL_IDS=Object.freeze({chat:new Set(["hello","ready","follow","thanks"]),emote:new Set(["wave","cheer","heart","surprise"])});

function token(bytes=18){return randomBytes(bytes).toString("base64url")}
function roomCode(){const bytes=randomBytes(6);return Array.from(bytes,value=>ROOM_ALPHABET[value%ROOM_ALPHABET.length]).join("")}
function text(value,max=32){return String(value??"").replace(/[\u0000-\u001f\u007f]/g,"").trim().slice(0,max)}
function number(value,min,max,fallback=min){const parsed=Number(value);return Number.isFinite(parsed)?Math.max(min,Math.min(max,parsed)):fallback}
function bool(value){return Boolean(value)}

function sanitizeEquipment(items){
 return(Array.isArray(items)?items:[]).slice(0,6).map(item=>({slot:text(item?.slot,24),label:text(item?.label,8),name:text(item?.name,48),rarity:text(item?.rarity,12),level:Math.round(number(item?.level,0,99_999_999,0)),plus:Math.round(number(item?.plus,0,9999,0))}));
}
export function sanitizeProfile(source={}){
 const speciesId=/^[a-zA-Z0-9_-]{1,80}$/.test(String(source.speciesId??""))?String(source.speciesId):"slime",visualSpeciesId=/^[a-zA-Z0-9_-]{1,80}$/.test(String(source.visualSpeciesId??""))?String(source.visualSpeciesId):null,endgameBossId=/^[a-zA-Z0-9_-]{1,80}$/.test(String(source.endgameBossId??""))?String(source.endgameBossId):null;
 return{displayName:text(source.displayName,16)||"冒険者",monsterId:text(source.monsterId,80)||null,speciesId,visualSpeciesId,endgameBossId,monsterName:text(source.monsterName,32)||"魔物",fallbackEmoji:text(source.fallbackEmoji,8)||"魔",level:Math.round(number(source.level,1,99_999_999,1)),stars:Math.round(number(source.stars,1,99,1)),plus:Math.round(number(source.plus,0,9999,0)),power:Math.round(number(source.power,0,Number.MAX_SAFE_INTEGER,0)),attribute:text(source.attribute,20)||"neutral",circleId:/^[a-zA-Z0-9_-]{1,80}$/.test(String(source.circleId??""))?String(source.circleId):"none",circleName:text(source.circleName,32)||"魔法陣なし",circleLevel:Math.round(number(source.circleLevel,0,99,0)),equipment:sanitizeEquipment(source.equipment)};
}
function publicMember(session){return{playerId:session.playerId,leader:bool(session.leader),connected:bool(session.connected),joinedAt:session.joinedAt,position:{...session.position},profile:{...session.profile,equipment:session.profile.equipment.map(item=>({...item}))}}}

export class RoomStore{
 constructor({maxMembers=4,reconnectGraceMs=15_000,now=()=>Date.now(),randomRoomCode=roomCode}={}){this.maxMembers=maxMembers;this.reconnectGraceMs=reconnectGraceMs;this.now=now;this.randomRoomCode=randomRoomCode;this.sessions=new Map();this.rooms=new Map()}

 hello(connection,{friendId,clientKey,resumeToken,profile}={}){
  const playerId=text(friendId,20).toUpperCase(),secret=text(clientKey,128);
  if(!/^AD-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(playerId))return{ok:false,code:"BAD_FRIEND_ID",message:"フレンドIDの形式が正しくありません"};
  if(secret.length<24)return{ok:false,code:"BAD_CLIENT_KEY",message:"端末キーが正しくありません"};
  let session=this.sessions.get(playerId),resumed=false;
  if(session&&!session.connected&&session.expiresAt&&session.expiresAt<this.now()){
   this.leaveRoom(session,{notifySelf:false});this.sessions.delete(playerId);session=null;
  }
  if(session){
   if(session.clientKey!==secret)return{ok:false,code:"ID_IN_USE",message:"同じフレンドIDが別の端末で使用されています"};
   if(session.connected&&session.connection!==connection)try{session.connection.close?.(4001,"replaced by reconnect")}catch{}
   resumed=Boolean(session.roomId&&(!session.expiresAt||session.expiresAt>=this.now()));session.connection=connection;session.connected=true;session.expiresAt=0;session.resumeToken=token();session.profile=sanitizeProfile(profile??session.profile);session.lastSeen=this.now();
  }else{
   session={playerId,clientKey,resumeToken:token(),connection,connected:true,roomId:null,leader:false,joinedAt:this.now(),lastSeen:this.now(),expiresAt:0,position:{x:50,y:76,facing:"down"},profile:sanitizeProfile(profile)};this.sessions.set(playerId,session);
  }
  connection.session=session;const room=session.roomId?this.rooms.get(session.roomId):null;if(!room&&session.roomId)session.roomId=null;
  if(room)this._broadcastRoom(room);
  return{ok:true,playerId,resumeToken:session.resumeToken,resumed:Boolean(resumed&&room),room:room?this.roomSnapshot(room):null};
 }

 createRoom(session){
  if(!session)return{ok:false,code:"NOT_READY",message:"先に接続してください"};this.leaveRoom(session,{notifySelf:false});let id;do{id=this.randomRoomCode()}while(this.rooms.has(id));const room={roomId:id,createdAt:this.now(),leaderId:session.playerId,members:new Set([session.playerId])};this.rooms.set(id,room);session.roomId=id;session.leader=true;session.joinedAt=this.now();session.position={x:50,y:76,facing:"down"};this._broadcastRoom(room);return{ok:true,room:this.roomSnapshot(room)};
 }

 joinRoom(session,rawRoomId){
  if(!session)return{ok:false,code:"NOT_READY",message:"先に接続してください"};const roomId=text(rawRoomId,6).toUpperCase(),room=this.rooms.get(roomId);if(!room)return{ok:false,code:"ROOM_NOT_FOUND",message:"そのルームIDは見つかりません"};if(session.roomId===roomId)return{ok:true,room:this.roomSnapshot(room)};
  if(room.members.size>=this.maxMembers)return{ok:false,code:"ROOM_FULL",message:"この部屋は4人で満員です"};this.leaveRoom(session,{notifySelf:false});room.members.add(session.playerId);session.roomId=roomId;session.leader=false;session.joinedAt=this.now();session.position=this._spawnPosition(room.members.size);this._broadcastRoom(room);return{ok:true,room:this.roomSnapshot(room)};
 }

 leaveRoom(session,{notifySelf=true}={}){
  const room=session?.roomId?this.rooms.get(session.roomId):null;if(!session||!room){if(session)session.roomId=null;return{ok:true}};room.members.delete(session.playerId);session.roomId=null;session.leader=false;
  if(notifySelf)this._send(session,{type:"leftRoom"});
  if(!room.members.size){this.rooms.delete(room.roomId);return{ok:true}}
  if(room.leaderId===session.playerId){const next=[...room.members].map(id=>this.sessions.get(id)).filter(Boolean).sort((a,b)=>a.joinedAt-b.joinedAt)[0];room.leaderId=next?.playerId??[...room.members][0]}
  for(const id of room.members){const member=this.sessions.get(id);if(member)member.leader=id===room.leaderId}
  this._broadcastRoom(room);return{ok:true};
 }

 updateProfile(session,profile){if(!session)return{ok:false};session.profile=sanitizeProfile(profile);const room=session.roomId?this.rooms.get(session.roomId):null;if(room)this._broadcast(room,{type:"memberUpdated",member:publicMember(session)});return{ok:true}}
 move(session,position){
  if(!session?.roomId)return{ok:false,code:"NOT_IN_ROOM",message:"部屋に参加していません"};const next={x:number(position?.x,5,95,session.position.x),y:number(position?.y,15,96,session.position.y),facing:FACING.has(position?.facing)?position.facing:session.position.facing};const distance=Math.hypot(next.x-session.position.x,next.y-session.position.y);if(distance>8){const scale=8/distance;next.x=session.position.x+(next.x-session.position.x)*scale;next.y=session.position.y+(next.y-session.position.y)*scale}session.position=next;session.lastSeen=this.now();const room=this.rooms.get(session.roomId);if(room)this._broadcast(room,{type:"memberMoved",playerId:session.playerId,position:{...next}},{except:session.playerId});return{ok:true,position:next};
 }
 social(session,{kind,id}={}){if(!session?.roomId)return{ok:false,code:"NOT_IN_ROOM",message:"部屋に参加していません"};if(!SOCIAL_IDS[kind]?.has(id))return{ok:false,code:"BAD_SOCIAL",message:"そのリアクションは使用できません"};const room=this.rooms.get(session.roomId);if(room)this._broadcast(room,{type:"social",playerId:session.playerId,kind,id,duration:3600});return{ok:true}}

 disconnect(session){
  if(!session)return;session.connected=false;session.connection=null;session.expiresAt=this.now()+this.reconnectGraceMs;const room=session.roomId?this.rooms.get(session.roomId):null;if(room)this._broadcastRoom(room);
 }
 pruneExpired(){for(const session of this.sessions.values()){if(session.connected||!session.expiresAt||session.expiresAt>this.now())continue;this.leaveRoom(session,{notifySelf:false});this.sessions.delete(session.playerId)}}
 roomSnapshot(room){return{roomId:room.roomId,leaderId:room.leaderId,maxMembers:this.maxMembers,members:[...room.members].map(id=>this.sessions.get(id)).filter(Boolean).map(publicMember)}}

 _spawnPosition(count){const positions=[{x:50,y:76,facing:"down"},{x:36,y:67,facing:"right"},{x:64,y:67,facing:"left"},{x:50,y:55,facing:"down"}];return{...(positions[Math.max(0,count-1)]??positions[0])}}
 _send(session,message){if(!session?.connected||!session.connection)return;try{session.connection.send(JSON.stringify(message))}catch{}}
 _broadcast(room,message,{except=null}={}){for(const id of room.members){if(id===except)continue;this._send(this.sessions.get(id),message)}}
 _broadcastRoom(room){this._broadcast(room,{type:"roomState",room:this.roomSnapshot(room)})}
}
