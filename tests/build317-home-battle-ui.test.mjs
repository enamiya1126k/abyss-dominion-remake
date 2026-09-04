import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{SERVER_MAINTENANCE_NOTICE,activeNoticeDefinitions,setServerMaintenanceState,unreadNoticeIds,markNoticeRead}from"../src/core/NoticeSystem.js";

function noticeState(){return{player:{},inventory:{},notices:{readIds:[],rewardInbox:[]}}}

test("サーバー停止通知はオフライン時だけ現れ、復旧時に消える",()=>{
 const state=noticeState(),offline=setServerMaintenanceState(state,true,{now:1_700_000_000_000});
 assert.equal(offline.changed,true);assert.equal(state.notices.serverMaintenance.active,true);
 assert.equal(activeNoticeDefinitions(state)[0].id,SERVER_MAINTENANCE_NOTICE.id);
 assert.ok(unreadNoticeIds(state).includes(SERVER_MAINTENANCE_NOTICE.id));
 markNoticeRead(state,SERVER_MAINTENANCE_NOTICE.id);assert.ok(!unreadNoticeIds(state).includes(SERVER_MAINTENANCE_NOTICE.id));
 const online=setServerMaintenanceState(state,false,{now:1_700_000_001_000});assert.equal(online.changed,true);assert.ok(!activeNoticeDefinitions(state).some(notice=>notice.id===SERVER_MAINTENANCE_NOTICE.id));
 setServerMaintenanceState(state,true,{now:1_700_000_002_000});assert.ok(unreadNoticeIds(state).includes(SERVER_MAINTENANCE_NOTICE.id));
});

test("ホーム状態・戦闘AUTO遮蔽・敵情報・黒金スキルUIがBuild317へ接続済み",async()=>{
 const[home,battle,main,client,css,index]=await Promise.all(["../src/ui/screens/HomeScreen.js","../src/ui/screens/BattleScreen.js","../src/main.js","../src/online/OnlinePartyClient.js","../src/Styles/build317-ui.css","../index.html"].map(path=>readFile(new URL(path,import.meta.url),"utf8")));
 assert.match(home,/data-home-server-status/);assert.match(home,/サーバーオンライン中/);assert.match(home,/サーバーオフライン/);
 assert.match(main,/onConnectionStatus:handleServerConnectionStatus/);assert.match(main,/app\.classList\.add\("battle-active"\)/);assert.match(client,/_notifyServerAvailability\("online"\)/);assert.match(client,/_notifyServerAvailability\("offline"\)/);
 assert.match(battle,/enemy-mini-stats/);assert.match(battle,/battle-unit-floating-name battle-unit-floating-badges/);assert.match(battle,/battle-skill-panel-v317/);assert.match(battle,/SKILL COMMAND/);
 assert.match(css,/#app\.battle-active \.explore-auto-toggle/);assert.match(css,/BLACK-GOLD SKILL COMMAND/);assert.match(css,/home-record-card\{top:112px!important/);
 assert.match(index,/build317-ui\.css/);assert.match(index,/ASSET_BUILD = "build317"/);
});
