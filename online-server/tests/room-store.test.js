import test from"node:test";
import assert from"node:assert/strict";
import{RoomStore}from"../src/RoomStore.js";

function connection(){return{messages:[],send(raw){this.messages.push(JSON.parse(raw))},close(){}}}
function hello(store,index){const conn=connection(),id=`AD-AAAA-AAA${"BCDEF"[index-1]}`;const result=store.hello(conn,{friendId:id,clientKey:`client-secret-${index}`.padEnd(32,"x"),profile:{displayName:`P${index}`,speciesId:"slime",power:index*100}});assert.equal(result.ok,true);return{conn,session:conn.session,result}}

test("room creation, four-player limit, movement and leader transfer",()=>{
 let code=0;const store=new RoomStore({randomRoomCode:()=>`ROOM${++code}X`.slice(0,6)}),players=[1,2,3,4,5].map(index=>hello(store,index));
 const created=store.createRoom(players[0].session);assert.equal(created.ok,true);const roomId=created.room.roomId;
 for(const player of players.slice(1,4))assert.equal(store.joinRoom(player.session,roomId).ok,true);
 const full=store.joinRoom(players[4].session,roomId);assert.equal(full.ok,false);assert.equal(full.code,"ROOM_FULL");
 store.move(players[1].session,{x:60,y:50,facing:"right"});assert.equal(store.rooms.get(roomId).members.size,4);assert.equal(players[1].session.position.facing,"right");
 store.leaveRoom(players[0].session);const room=store.rooms.get(roomId);assert.equal(room.members.size,3);assert.notEqual(room.leaderId,players[0].session.playerId);assert.equal(store.sessions.get(room.leaderId).leader,true);
});

test("disconnected player resumes the same room during grace period",()=>{
 let now=1_000;const store=new RoomStore({now:()=>now,reconnectGraceMs:15_000,randomRoomCode:()=>"ABC234"}),first=hello(store,1);store.createRoom(first.session);store.disconnect(first.session);now+=5_000;
 const replacement=connection(),result=store.hello(replacement,{friendId:first.session.playerId,clientKey:first.session.clientKey,resumeToken:first.result.resumeToken,profile:first.session.profile});assert.equal(result.ok,true);assert.equal(result.resumed,true);assert.equal(result.room.roomId,"ABC234");
});

test("expired reconnect starts cleanly without reviving an old room",()=>{
 let now=10_000;const store=new RoomStore({now:()=>now,reconnectGraceMs:1_000,randomRoomCode:()=>"XYZ234"}),first=hello(store,3);store.createRoom(first.session);store.disconnect(first.session);now+=1_001;
 const replacement=connection(),result=store.hello(replacement,{friendId:first.session.playerId,clientKey:first.session.clientKey,resumeToken:first.result.resumeToken,profile:first.session.profile});assert.equal(result.ok,true);assert.equal(result.resumed,false);assert.equal(result.room,null);assert.equal(store.rooms.size,0);
});
