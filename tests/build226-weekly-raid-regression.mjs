import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");

test("build226 exposes weekly raid metadata and a mobile-safe screen",async()=>{
 const[views,styles,index]=await Promise.all([read("src/online/OnlineViews.js"),read("src/Styles/build226.css"),read("index.html")]);
 assert.match(views,/WEEKLY WORLD RAID/);assert.match(views,/毎週月曜9:00更新/);assert.match(views,/online-weekly-rule/);assert.match(views,/online-raid-milestones/);assert.match(views,/今週は討伐済み/);assert.match(styles,/@media\(max-width:600px\)/);assert.match(styles,/grid-template-columns:repeat\(6,1fr\)/);assert.match(index,/build226\.css\?v=2\.11\.54-build226/);
});

test("build226 persists weekly identity, completion and personal milestone receipts",async()=>{
 const[main,client,store,save]=await Promise.all([read("src/main.js"),read("src/online/OnlinePartyClient.js"),read("online-server/src/RoomStore.js"),read("src/services/SaveService.js")]);
 for(const field of ["weekId","weekStartsAt","weekEndsAt","bossId","modifierId","personalMilestonesClaimed","completedAt"]){assert.match(main,new RegExp(field));assert.match(save,new RegExp(field))}
 assert.match(main,/SaveService\.js\?v=2\.11\.54-build226/);assert.match(save,/slice\(-2048\)/);assert.match(client,/this\._syncRaidWorld\(message\.raid\?\.progress \?\? null\)/);assert.match(client,/const ONLINE_PROTOCOL = "1\.16\.0"/);assert.match(store,/weeklyRaid/);assert.match(store,/personalMilestonesClaimed/);
});

test("build226 exchange includes boss-specific contracts, weapons and repeatable crystals",async()=>{
 const[main,views]=await Promise.all([read("src/main.js"),read("src/online/OnlineViews.js")]);
 assert.match(main,/ONLINE_WEEKLY_RAID_REWARDS/);assert.match(main,/"zero-sovereign"/);assert.match(main,/"vajra-beast"/);assert.match(main,/crystals:30/);assert.match(main,/魔晶石 ×100/);assert.match(views,/character:\$\{boss\.id\}/);assert.match(views,/equipment:\$\{boss\.id\}/);assert.match(views,/\["crystals", 30/);
});

console.log("ABYSS DOMINION build226 weekly raid regression: PASS");
