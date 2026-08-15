import test from"node:test";
import assert from"node:assert/strict";
import{RoomStore}from"../src/RoomStore.js";

function connection(){return{messages:[],send(raw){this.messages.push(JSON.parse(raw))},close(){}}}
function hello(store,index,profile={}){const conn=connection(),id=`AD-AAAA-AAA${"BCDEF"[index-1]}`;const result=store.hello(conn,{friendId:id,clientKey:`client-secret-${index}`.padEnd(32,"x"),profile:{displayName:`P${index}`,speciesId:"slime",power:index*100,...profile}});assert.equal(result.ok,true);return{conn,session:conn.session,result}}

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
 const room=store.rooms.get(roomId);for(const object of room.expedition.objects.filter(entry=>entry.type==="encounter"))object.resolved=true;const target=room.expedition.objects.find(object=>object.type==="chest"),path=shortestPath(room.expedition,players[0].session.dungeonPosition,target);for(const point of path)assert.equal(store.moveExpedition(players[0].session,point).ok,true);assert.equal(target.resolved,true);const discoveries=room.expedition.discoveries,rewardCounts=players.map(player=>player.session.pendingRewards.length);assert.ok(discoveries>=1);assert.equal(rewardCounts.every(count=>count>=1),true);
 assert.equal(store.moveExpedition(players[0].session,players[0].session.dungeonPosition).ok,true);assert.equal(room.expedition.discoveries,discoveries);players.forEach((player,index)=>assert.equal(player.session.pendingRewards.length,rewardCounts[index]));
});

test("shared expedition rejects unready starts and ends by majority return vote",()=>{
 const store=new RoomStore({randomRoomCode:()=>"VOTE24"}),players=[hello(store,1),hello(store,2),hello(store,3)],created=store.createRoom(players[0].session),roomId=created.room.roomId;store.joinRoom(players[1].session,roomId);store.joinRoom(players[2].session,roomId);store.setReady(players[0].session,true);assert.equal(store.startExpedition(players[0].session).code,"NOT_ALL_READY");store.setReady(players[1].session,true);store.setReady(players[2].session,true);assert.equal(store.startExpedition(players[0].session).ok,true);
 assert.equal(store.requestReturn(players[1].session).ended,false);assert.equal(store.requestReturn(players[2].session).ended,true);assert.equal(store.rooms.get(roomId).phase,"lobby");assert.equal(store.rooms.get(roomId).expedition,null);
});

function enterFirstEncounter(store,room,session){
 const choice=room.expedition.objects.filter(object=>object.type==="encounter").map(target=>({target,path:shortestPath(room.expedition,session.dungeonPosition,target)})).sort((a,b)=>a.path.length-b.path.length)[0];for(const point of choice.path){assert.equal(store.moveExpedition(session,point).ok,true);if(room.expedition.battle)break}assert.equal(room.expedition.objects.some(object=>object.type==="encounter"&&object.resolved),true);assert.ok(room.expedition.battle);return room.expedition.battle;
}

test("four players submit synchronized actions, create a perfect link, and a disconnected member is AI-controlled",()=>{
 let now=50_000;const profile={maxFloor:300,battleStats:{hp:20_000,mp:200,atk:4_000,matk:3_500,def:2_000,mdef:2_000,spd:900,crit:10,evasion:5},skills:[{id:"burst",name:"共鳴斬",kind:"attack",mp:12,power:1.2,hits:1}],captureStock:3},store=new RoomStore({now:()=>now,randomRoomCode:()=>"SYNC24",random:()=>.1}),players=[1,2,3,4].map(index=>hello(store,index,profile)),created=store.createRoom(players[0].session),roomId=created.room.roomId;for(const player of players.slice(1))store.joinRoom(player.session,roomId);assert.equal(store.setFloor(players[0].session,300).ok,true);for(const player of players)store.setReady(player.session,true);assert.equal(store.startExpedition(players[0].session).ok,true);
 const room=store.rooms.get(roomId),battle=enterFirstEncounter(store,room,players[0].session),targetId=battle.enemies[0].id;assert.equal(battle.enemies.length,4);assert.equal(store.setBattleSpeed(players[1].session,2).code,"LEADER_ONLY");assert.equal(store.setBattleSpeed(players[0].session,2).ok,true);
 for(const player of players.slice(0,3))assert.equal(store.submitBattleAction(player.session,{kind:"attack",targetId}).ok,true);assert.equal(battle.phase,"command");assert.equal(store.submitBattleAction(players[3].session,{kind:"attack",targetId}).ok,true);assert.equal(battle.phase,"result");assert.equal(battle.lastEvents.some(event=>event.kind==="link"&&event.perfect),true);
 now=battle.nextRoundAt+1;store.advanceBattles();assert.equal(room.expedition.battle.phase,"command");store.disconnect(players[3].session);for(const player of players.slice(0,3))store.submitBattleAction(player.session,{kind:"attack",targetId:room.expedition.battle.enemies.find(enemy=>enemy.hp>0)?.id});store.advanceBattles();assert.equal(room.expedition.battle.phase,"result");assert.equal(room.expedition.battle.actions[players[3].session.playerId].auto,true);
});

test("capture is an individual one-charge attempt and queues an idempotent contract reward",()=>{
 const profile={maxFloor:20,captureStock:2,battleStats:{hp:10_000,mp:80,atk:2_000,matk:2_000,def:2_000,mdef:2_000,spd:500,crit:5,evasion:3}},store=new RoomStore({randomRoomCode:()=>"CATCH2",random:()=>.1}),player=hello(store,1,profile),created=store.createRoom(player.session);store.setReady(player.session,true);store.startExpedition(player.session);const room=store.rooms.get(created.room.roomId),battle=enterFirstEncounter(store,room,player.session),enemy=battle.enemies[0];enemy.hp=1;
 assert.equal(store.submitBattleAction(player.session,{kind:"capture",targetId:enemy.id}).ok,true);assert.equal(battle.players[player.session.playerId].captureCharges,0);assert.equal(enemy.hp,1);const reward=player.session.pendingRewards.find(entry=>entry.source.kind==="battleCapture");assert.ok(reward);assert.equal(reward.reward.captureCrystalCost,1);assert.equal(reward.reward.captureSuccess,true);assert.equal(reward.reward.capture.speciesId,enemy.speciesId);assert.equal(store.ackReward(player.session,reward.rewardId).ok,true);assert.equal(player.session.pendingRewards.some(entry=>entry.rewardId===reward.rewardId),false);
});
