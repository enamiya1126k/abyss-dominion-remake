import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";

import{campaignFloorToLegacyFloor}from"../src/core/Campaign100System.js";
import{goldForClearedFloor}from"../src/core/GoldEconomySystem.js";
import{casinoBetLimit,darkMarketMonsterPriceFloor,secretRoomPlan}from"../src/core/SecretRoomSystem.js";

function casinoState(floor){
 return{
  player:{gold:Number.MAX_SAFE_INTEGER,currentFloor:floor},
  secretRooms:{run:null,activeRoom:{id:`room-${floor}`,floor,rested:false,casino:{},offers:[],recoveryPurchased:{}}}
 }
}

test("build301 secret-room casino uses legacy economic depth without changing its display floor",()=>{
 const state=casinoState(100),raw=goldForClearedFloor(campaignFloorToLegacyFloor(100))*500,expected=Math.round(raw/10_000)*10_000;
 assert.equal(casinoBetLimit(state),expected);
 assert.equal(state.secretRooms.activeRoom.floor,100);
});

test("build301 dark-market overlevel floor follows the converted campaign depth",()=>{
 assert.equal(darkMarketMonsterPriceFloor(100,3_000,"SR","standard"),0,"campaign 100F is legacy depth 1000, so level 3000 is still inside the normal band");
 assert.ok(darkMarketMonsterPriceFloor(100,3_001,"SR","standard")>0);
 assert.equal(darkMarketMonsterPriceFloor(10,300,"SR","standard"),0,"campaign 10F preserves the former 100F threshold");
 assert.ok(darkMarketMonsterPriceFloor(10,301,"SR","standard")>0);
});

test("build301 secret-room appearance still uses campaign display milestones",()=>{
 const state={secretRooms:{run:{id:"stable-run",seed:123456,startedAt:1},activeRoom:null}};
 assert.equal(secretRoomPlan(state,10).appears,false);
 assert.equal(secretRoomPlan(state,100).appears,false);
 assert.equal(state.secretRooms.run.id,"stable-run");
});

test("build305 all active secret-room consumers use the current cache identity",async()=>{
 const files=await Promise.all([
  readFile(new URL("../src/main.js",import.meta.url),"utf8"),
  readFile(new URL("../src/services/SaveService.js",import.meta.url),"utf8"),
  readFile(new URL("../src/ui/screens/ShopScreen.js",import.meta.url),"utf8")
 ]);
 for(const source of files)assert.match(source,/SecretRoomSystem\.js\?v=3\.0\.5-build305/);
});
