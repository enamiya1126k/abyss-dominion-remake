import test from"node:test";
import assert from"node:assert/strict";
import{OnlinePartyController,normalizePowerRankingState}from"../src/online/OnlinePartyClient.js";

test("ranking reward delivery reaches the durable client callback and ACK stays explicit",async()=>{
 const sent=[],deliveries=[],controller=Object.create(OnlinePartyController.prototype);Object.assign(controller,{connectionReady:true,capabilities:new Set(["powerRankingsV1","powerRankingRewardsV1"]),powerRankingState:normalizePowerRankingState(null,{supported:true}),powerRankingRequests:new Map(),powerRankingRequestSequence:0,latestPowerRankingListRequestId:"",powerRankingWanted:false,powerRankingWantedOptions:{limit:100},onPowerRankingState:()=>{},onPowerRankingReward:delivery=>deliveries.push(delivery),_send(type,payload){sent.push({type,...payload});return true}});
 const promise=controller.requestPowerRankings(),request=sent.at(-1);controller._handleMessage({type:"powerRankingState",requestId:request.requestId,serverNow:Date.now(),season:{id:"2026-08-24",startsAt:1,endsAt:2},entries:[],rankingRewards:[{deliveryId:"power-2026-08-17-AD-ABCD-EFGH",seasonId:"2026-08-17",rank:1,title:"週間戦力ランキング #1",reward:{gold:100}}]});await promise;await Promise.resolve();
 assert.equal(deliveries.length,1);assert.equal(deliveries[0].rank,1);assert.equal(sent.some(message=>message.type==="powerRankingRewardAck"),false,"callback persistence must happen before ACK");
 assert.equal(controller.ackPowerRankingReward(deliveries[0].deliveryId),true);assert.equal(sent.at(-1).type,"powerRankingRewardAck");
});

test("reconnect reward push reaches the same persistence-before-ACK callback",async()=>{
 const sent=[],deliveries=[],controller=Object.create(OnlinePartyController.prototype);Object.assign(controller,{connectionReady:true,capabilities:new Set(["powerRankingsV1","powerRankingRewardsV1"]),powerRankingState:normalizePowerRankingState(null,{supported:true}),powerRankingRequests:new Map(),powerRankingRequestSequence:0,latestPowerRankingListRequestId:"",powerRankingWanted:false,powerRankingWantedOptions:{limit:100},onPowerRankingState:()=>{},onPowerRankingReward:delivery=>deliveries.push(delivery),_send(type,payload){sent.push({type,...payload});return true}});
 controller._handleMessage({type:"powerRankingRewards",rankingRewards:[{deliveryId:"power-2026-08-24-AD-ABCD-EFGH",seasonId:"2026-08-24",rank:5,title:"週間戦力ランキング #5",reward:{gold:100}}]});await Promise.resolve();
 assert.equal(deliveries.length,1);assert.equal(deliveries[0].rank,5);assert.equal(sent.some(message=>message.type==="powerRankingRewardAck"),false);
});
