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

function shortestPath(expedition,from,to){
 const key=point=>`${point.x},${point.y}`,queue=[from],previous=new Map([[key(from),null]]);for(let cursor=0;cursor<queue.length;cursor++){const current=queue[cursor];if(current.x===to.x&&current.y===to.y)break;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const next={x:current.x+dx,y:current.y+dy},id=key(next);if(expedition.tiles[next.y]?.[next.x]!=="."||previous.has(id))continue;previous.set(id,current);queue.push(next)}}const path=[];let cursor=to;while(cursor&&(cursor.x!==from.x||cursor.y!==from.y)){path.push(cursor);cursor=previous.get(key(cursor))}return path.reverse();
}

test("leader starts a ready four-player shared expedition and discoveries resolve once",()=>{
 let code=0;const store=new RoomStore({randomRoomCode:()=>`COOP${++code}X`.slice(0,6),random:()=>.1}),players=[1,2,3,4].map(index=>hello(store,index)),created=store.createRoom(players[0].session),roomId=created.room.roomId;for(const player of players.slice(1))store.joinRoom(player.session,roomId);for(const player of players)assert.equal(store.setReady(player.session,true).ok,true);
 const started=store.startExpedition(players[0].session);assert.equal(started.ok,true);assert.equal(started.room.phase,"expedition");assert.equal(started.room.members.length,4);assert.equal(started.room.members.every(member=>member.dungeonPosition),true);
 const room=store.rooms.get(roomId),target=room.expedition.objects.find(object=>object.type==="chest"),path=shortestPath(room.expedition,players[0].session.dungeonPosition,target);for(const point of path)assert.equal(store.moveExpedition(players[0].session,point).ok,true);assert.equal(target.resolved,true);const discoveries=room.expedition.discoveries,rewardCounts=players.map(player=>player.session.pendingRewards.length);assert.ok(discoveries>=1);assert.equal(rewardCounts.every(count=>count>=1),true);
 assert.equal(store.moveExpedition(players[0].session,players[0].session.dungeonPosition).ok,true);assert.equal(room.expedition.discoveries,discoveries);players.forEach((player,index)=>assert.equal(player.session.pendingRewards.length,rewardCounts[index]));
});

test("shared expedition rejects unready starts and ends by majority return vote",()=>{
 const store=new RoomStore({randomRoomCode:()=>"VOTE24"}),players=[hello(store,1),hello(store,2),hello(store,3)],created=store.createRoom(players[0].session),roomId=created.room.roomId;store.joinRoom(players[1].session,roomId);store.joinRoom(players[2].session,roomId);store.setReady(players[0].session,true);assert.equal(store.startExpedition(players[0].session).code,"NOT_ALL_READY");store.setReady(players[1].session,true);store.setReady(players[2].session,true);assert.equal(store.startExpedition(players[0].session).ok,true);
 assert.equal(store.requestReturn(players[1].session).ended,false);assert.equal(store.requestReturn(players[2].session).ended,true);assert.equal(store.rooms.get(roomId).phase,"lobby");assert.equal(store.rooms.get(roomId).expedition,null);
});
