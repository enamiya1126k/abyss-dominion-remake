import assert from"node:assert/strict";
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";
import{TEAM_BATTLE_UNLOCK_FLOOR,GAUNTLET_UNLOCK_FLOOR,EMERGENCY_UNLOCK_FLOOR}from"../src/core/EndgameSystem.js";
import{isContentUnlocked}from"../src/core/config.js";
import{RoomStore}from"../online-server/src/RoomStore.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const main=read("src/main.js"),home=read("src/ui/screens/HomeScreen.js"),formation=read("src/ui/screens/FormationScreen.js"),screen=read("src/ui/screens/OnlinePartyScreen.js"),client=read("src/online/OnlinePartyClient.js"),server=read("online-server/server.js"),roomStoreSource=read("online-server/src/RoomStore.js"),css=read("src/Styles/v2.10.0.css"),index=read("index.html");

assert.equal(TEAM_BATTLE_UNLOCK_FLOOR,50);
assert.equal(GAUNTLET_UNLOCK_FLOOR,100);
assert.equal(EMERGENCY_UNLOCK_FLOOR,150);
assert.equal(isContentUnlocked({player:{maxFloor:49}},TEAM_BATTLE_UNLOCK_FLOOR),false);
assert.equal(isContentUnlocked({player:{maxFloor:50}},TEAM_BATTLE_UNLOCK_FLOOR),true);
assert.equal(isContentUnlocked({player:{maxFloor:99}},GAUNTLET_UNLOCK_FLOOR),false);
assert.equal(isContentUnlocked({player:{maxFloor:100}},GAUNTLET_UNLOCK_FLOOR),true);
assert.equal(isContentUnlocked({player:{maxFloor:149}},EMERGENCY_UNLOCK_FLOOR),false);
assert.equal(isContentUnlocked({player:{maxFloor:150}},EMERGENCY_UNLOCK_FLOOR),true);
assert.match(main,/openGauntletTrial\(\)[\s\S]*GAUNTLET_UNLOCK_FLOOR/);
assert.match(main,/action==="gauntlet"\?contentUnlockFloor\(GAUNTLET_UNLOCK_FLOOR\)/);

assert.match(home,/id="openOnlineParty"/);
assert.match(main,/go\("onlineParty"\)/);
assert.match(formation,/data-party-tab="online"/);
for(const feature of["data-online-create-room","data-online-join-form","data-online-player-layer","data-online-chat","data-online-emote","data-online-profile-drawer"])assert.match(screen,new RegExp(feature));
for(const feature of["reconnectAttempts","copyInvite","followId","memberMoved","social","buildOnlinePartyProfile","data-online-follow"])assert.match(client,new RegExp(feature));
assert.match(css,/\.online-plaza/);assert.match(css,/\.online-avatar-figure\.face-left/);assert.match(css,/\.online-profile-drawer/);

assert.match(server,/127\.0\.0\.1/);assert.match(server,/maxPayload:16\*1024/);assert.match(server,/originAllowed/);assert.match(roomStoreSource,/ROOM_FULL/);
for(const file of["00_READ_ME_FIRST.txt","01_FIRST_SETUP.bat","02_START_SERVER.bat","03_OPEN_TUNNEL.bat","04_START_ONLINE.bat","ONLINE_SETUP_GUIDE.md","package.json"])assert.equal(fs.existsSync(path.join(root,"online-server",file)),true,`${file} is bundled`);
assert.match(index,/ASSET_BUILD = "build145"/);assert.match(index,/CACHE_VERSION/);

const sent=[],connection={send:raw=>sent.push(JSON.parse(raw)),close(){}},store=new RoomStore({randomRoomCode:()=>"ABCD23"}),hello=store.hello(connection,{friendId:"AD-ABCD-EFGH",clientKey:"a-secure-local-client-key-1234",profile:{displayName:"テスト",speciesId:"slime",power:123}});assert.equal(hello.ok,true);assert.equal(store.createRoom(connection.session).room.members.length,1);assert.equal(store.rooms.size,1);

const localValues=new Map();globalThis.localStorage={getItem:key=>localValues.get(key)??null,setItem:(key,value)=>localValues.set(key,String(value))};globalThis.location={search:""};
const{OnlinePartyScreen}=await import("../src/ui/screens/OnlinePartyScreen.js");
const emptyPartyHtml=OnlinePartyScreen({party:[],monsters:[],player:{currentFloor:1,gold:0,crystals:0},inventory:{captureCrystals:0,abyssKeys:0}});assert.match(emptyPartyHtml,/オンライン広場/);assert.match(emptyPartyHtml,/先に1体以上を部隊編成/);assert.match(emptyPartyHtml,/data-online-connect disabled/);

console.log("ABYSS DOMINION build145 online party regression: PASS");
