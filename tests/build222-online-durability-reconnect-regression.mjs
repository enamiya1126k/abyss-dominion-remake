import assert from "node:assert/strict";
import fs from "node:fs";

const server = fs.readFileSync(new URL("../online-server/server.js", import.meta.url), "utf8");
const room = fs.readFileSync(new URL("../online-server/src/RoomStore.js", import.meta.url), "utf8");
const client = fs.readFileSync(new URL("../src/online/OnlinePartyClient.js", import.meta.url), "utf8");
const main = fs.readFileSync(new URL("../src/main.js", import.meta.url), "utf8");

assert.match(server, /new RoomStore\(\{battleReconnectActionGraceMs:2500\}\)/, "battle reconnect grace should be enabled");
assert.match(server, /store\.disconnect\(socket\.session,socket\)/, "disconnect must identify the closing socket");
assert.match(server, /session\.connection!==socket/, "superseded sockets must not be accepted for commands");
assert.match(room, /battleReconnectActionGraceMs/, "RoomStore must retain reconnect action grace");
assert.match(room, /now-disconnectedAt<this\.battleReconnectActionGraceMs/, "disconnected exploration followers must receive grace before AI movement");
assert.match(room, /now-disconnectedAt>=this\.battleReconnectActionGraceMs/, "battle AI must wait through reconnect grace");
assert.match(room, /if\(battle\.actions\[session\.playerId\]\)return\{ok:true,duplicate:true/, "duplicate battle action submissions must be idempotent");
assert.match(client, /visibilitychange/, "iOS visibility resume hook should be present");
assert.match(client, /pageshow/, "iOS page-cache resume hook should be present");
assert.match(client, /_bind\(window,\s*"online"/, "network-online resume hook should be present");
assert.match(client, /_handleClose\(closedSocket\s*=\s*null\)/, "socket-specific close handling should be present");
assert.match(client, /closedSocket\s*&&\s*this\.ws\s*&&\s*this\.ws\s*!==\s*closedSocket/, "stale socket close events must not clear a newer socket");

const start = main.indexOf("function claimOnlinePartyReward");
const end = main.indexOf("function exchangeOnlineRaidReward", start);
assert.ok(start >= 0 && end > start, "online reward claim function should exist");
const claim = main.slice(start, end);
const duplicateGuard = claim.indexOf("online.claimedRewards.includes(id)");
assert.ok(duplicateGuard >= 0, "reward claim must have a duplicate guard");
assert.ok(duplicateGuard < claim.indexOf("recordSkillUse"), "duplicate guard must run before skill mastery side effects");
assert.match(claim, /online\.claimedRewards=online\.claimedRewards\.slice\(-2048\)/, "reward idempotency history should be bounded");

const battleStart = main.indexOf("function persistOnlineBattleDefeated");
const battleEnd = main.indexOf("function claimOnlinePartyReward", battleStart);
assert.ok(battleStart >= 0 && battleEnd > battleStart, "online battle metadata persistence should exist");
const battlePersistence = main.slice(battleStart, battleEnd);
const battleDuplicateGuard = battlePersistence.indexOf("online.processedBattleEventIds.includes(eventId)");
assert.ok(battleDuplicateGuard >= 0, "battle metadata persistence must have a duplicate guard");
assert.ok(battleDuplicateGuard < battlePersistence.indexOf("recordSeriesBattle"), "battle duplicate guard must run before series mastery side effects");
assert.match(battlePersistence, /online\.processedBattleEventIds=online\.processedBattleEventIds\.slice\(-512\)/, "battle idempotency history should be bounded");

console.log("build222 online durability/reconnect regression: ok");
