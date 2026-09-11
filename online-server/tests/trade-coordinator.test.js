import test from"node:test";
import assert from"node:assert/strict";
import{TradeCoordinator,sanitizeTradeAsset}from"../src/TradeCoordinator.js";

function participant(playerId){return{playerId,connected:true}}

test("trade commit retries failed receivers and completes only after both idempotent acknowledgements",()=>{
 let now=10_000;const sent=[];
 const coordinator=new TradeCoordinator({now:()=>now,timeoutMs:1_000,send:(playerId,message,options={})=>sent.push({playerId,message,options}),getPlayerName:id=>id});
 const left=participant("AD-AAAA-AAAB"),right=participant("AD-AAAA-AAAC"),room={roomId:"TRADE2",phase:"lobby",members:new Set([left.playerId,right.playerId])};
 const requested=coordinator.request(room,left,right);assert.equal(requested.ok,true);const tradeId=requested.trade.tradeId;
 assert.equal(coordinator.respond(right,tradeId,true).ok,true);
 assert.equal(coordinator.offer(left,tradeId,{assetId:"currency:gold",kind:"currency",name:"GOLD",payload:{key:"gold",amount:1250}}).ok,true);
 assert.equal(coordinator.offer(right,tradeId,{assetId:"equipment:sword",kind:"equipment",name:"星剣",payload:{id:"sword",slots:[{kind:"crit",value:12}]}}).ok,true);
 assert.equal(coordinator.readyUp(left,tradeId,true).ok,true);assert.equal(coordinator.readyUp(right,tradeId,true).trade.state,"confirming");
 assert.equal(coordinator.confirm(left,tradeId).ok,true);assert.equal(coordinator.confirm(right,tradeId).trade.state,"committing");
 const commits=sent.filter(entry=>entry.message.type==="tradeCommit");assert.equal(commits.length,2);assert.equal(commits.every(entry=>entry.options.persist),true);
 const failed=coordinator.ack(left,tradeId,false);assert.equal(failed.retry,true);assert.equal(failed.clearPending,false);assert.ok(coordinator.activeFor(left.playerId));
 assert.equal(coordinator.ack(right,tradeId,true).committed,true);now+=1_001;coordinator.prune();assert.ok(sent.filter(entry=>entry.playerId===left.playerId&&entry.message.type==="tradeCommit").length>=2);
 assert.equal(coordinator.ack(left,tradeId,true).committed,true);assert.equal(coordinator.activeFor(left.playerId),null);assert.equal(sent.filter(entry=>entry.message.type==="tradeCompleted").length,2);
});

test("trade transport rejects magic circles and accepts preserved monster payloads",()=>{
 assert.equal(sanitizeTradeAsset({assetId:"circle:x",kind:"circle",name:"魔法陣",payload:{id:"x"}}),null);
 const asset=sanitizeTradeAsset({assetId:"monster:m1",kind:"monster",name:"継承個体",level:88,payload:{id:"m1",iv:{atk:99},skills:["alpha"],equipment:{weaponRight:null}}});
 assert.equal(asset.kind,"monster");assert.equal(asset.payload.iv.atk,99);assert.deepEqual(asset.payload.skills,["alpha"]);
});
