import assert from"node:assert/strict";
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";
import{RoomStore,createSharedDungeon}from"../online-server/src/RoomStore.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),".."),read=relative=>fs.readFileSync(path.join(root,relative),"utf8"),screen=read("src/ui/screens/OnlinePartyScreen.js"),client=read("src/online/OnlinePartyClient.js"),server=read("online-server/server.js"),storeSource=read("online-server/src/RoomStore.js"),main=read("src/main.js"),save=read("src/services/SaveService.js"),css=read("src/Styles/v2.10.0.css"),index=read("index.html");

for(const feature of["共闘準備室","data-online-floor","data-online-ready-grid","data-online-start-expedition","data-online-dungeon-board","data-online-dungeon-objects","data-online-dungeon-players","data-online-request-return","data-online-complete-expedition"])assert.match(screen,new RegExp(feature));
for(const feature of["setReady","setFloor","startExpedition","expeditionMove","requestReturn","completeExpedition","onlineReward","rewardAck","_findDungeonPath","dungeonThemeForFloor"])assert.match(client,new RegExp(feature));
for(const feature of["setReady","setFloor","startExpedition","moveExpedition","requestReturn","completeExpedition","deliverPendingRewards"])assert.match(server,new RegExp(feature));
for(const feature of["carveDungeon","pendingRewards","exitReached","returnVotes","_moveDisconnectedFollowers","completion"])assert.match(storeSource,new RegExp(feature));
assert.match(main,/claimOnlinePartyReward/);assert.match(main,/claimedRewards/);assert.match(save,/onlineParty:\{claimedRewards:\[\]/);assert.match(css,/\.online-coop-lobby/);assert.match(css,/\.online-dungeon-board/);assert.match(css,/\.online-expedition-event/);assert.match(index,/ASSET_BUILD = "build(?:14[6-9]|15[0-9])"/);

const dungeon=createSharedDungeon({roomId:"ABC234",floor:245,runId:"TEST"});assert.ok(dungeon.cols>=23&&dungeon.cols<=39);assert.ok(dungeon.rows>=23&&dungeon.rows<=39);assert.equal(dungeon.tiles.length,dungeon.rows);assert.ok(dungeon.objects.filter(object=>object.type==="encounter").length>=1);assert.equal(dungeon.objects.filter(object=>object.type==="bone").length,2);assert.equal(dungeon.objects.filter(object=>object.type==="shrine").length,1);assert.equal(dungeon.objects.filter(object=>object.type==="exit").length,1);assert.ok(dungeon.decorations.length>=1);for(const object of dungeon.objects)assert.equal(dungeon.tiles[object.y][object.x],".");

const sent=[],connection={send:raw=>sent.push(JSON.parse(raw)),close(){}},store=new RoomStore({randomRoomCode:()=>"ABC234"}),hello=store.hello(connection,{friendId:"AD-ABCD-EFGH",clientKey:"a-secure-local-client-key-1234",profile:{displayName:"テスト",speciesId:"slime",power:123,maxFloor:300}});assert.equal(hello.ok,true);const created=store.createRoom(connection.session);assert.equal(created.room.selectedFloor,300);assert.equal(store.setFloor(connection.session,245).room.selectedFloor,245);assert.equal(store.setReady(connection.session,true).room.members[0].ready,true);assert.equal(store.startExpedition(connection.session).room.phase,"expedition");

console.log("ABYSS DOMINION build146 online co-op regression: PASS");
