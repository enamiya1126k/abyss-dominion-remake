import assert from"node:assert/strict";
import fs from"node:fs";
import{createSoloStyleDungeon,floorEnemyStats}from"../online-server/src/OfflineDungeonRules.js";

const sequence=[.12,.72,.31,.88,.46,.57,.23,.94,.38,.66],random=()=>sequence.shift()??.41;
const dungeon=createSoloStyleDungeon({roomId:"test-room",floor:100,runId:"test-run",now:1,random});
assert.equal(dungeon.floor,100);
assert.equal(dungeon.objects.filter(object=>object.type==="campaignKey").length,3);
assert.equal(dungeon.objects.filter(object=>object.type==="encounter"&&object.bossEncounter).length,1);
assert.equal(dungeon.objects.find(object=>object.type==="exit")?.hidden,true);
assert.equal(dungeon.encountersEnabled,true);
assert.equal(dungeon.campaignKeysCollected,0);

const stats=floorEnemyStats({floor:100,template:{id:"slime",baseStats:{hp:10,atk:5,def:2,spd:3}},random:()=>.5,boss:true});
assert.ok(stats.level>1);
assert.ok(stats.maxHp>0);

const storeSource=fs.readFileSync(new URL("../online-server/src/RoomStore.js",import.meta.url),"utf8");
assert.match(storeSource,/if\(keys<3\)/);
assert.match(storeSource,/trophyFragmentPacksClaimed:3/);
assert.match(storeSource,/object\.locksOpened=3;object\.resolved=true/);
assert.match(storeSource,/expedition\.encountersEnabled=false/);
assert.match(storeSource,/type:["']hotSpring["']/);
assert.match(storeSource,/type:["']campaignTrophy["']/);
console.log("build300 online campaign regression: ok");
