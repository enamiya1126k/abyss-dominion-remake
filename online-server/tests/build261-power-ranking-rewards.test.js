import test from"node:test";
import assert from"node:assert/strict";
import{mkdtempSync,readFileSync,writeFileSync}from"node:fs";
import{tmpdir}from"node:os";
import{join}from"node:path";
import{PlayerPowerRanking,powerRankingSeason,verifiedMonsterPower}from"../src/PlayerPowerRanking.js";

function session(playerId){return{playerId,powerRankingRates:{},powerRankingReceipts:[]}}
function snapshot(displayName,attack){const battleStats={hp:1000,atk:attack,matk:attack,def:100,mdef:100,spd:100,crit:0,evasion:0},power=verifiedMonsterPower(battleStats);return{displayName,maxFloor:200,power,party:[{slot:1,speciesId:"slime",name:"SLIME",level:100,rarity:"N",power,battleStats,equipment:[],magicCircle:{name:"魔法陣なし",level:0}}]}}

test("weekly TOP100 rewards survive reconnect and acknowledge once",()=>{
 const directory=mkdtempSync(join(tmpdir(),"abyss-rank-261-")),stateFile=join(directory,"power-rankings.json");let now=Date.UTC(2026,7,24,0,0,0),ranking=new PlayerPowerRanking({now:()=>now,stateFile}),first=session("AD-ABCD-EFGH"),second=session("AD-IJKL-MNPQ");
 assert.equal(ranking.submit(first,{requestId:"request-aaa1",snapshot:snapshot("FIRST",500)}).ok,true);assert.equal(ranking.submit(second,{requestId:"request-bbb2",snapshot:snapshot("SECOND",200)}).ok,true);
 const season=powerRankingSeason(now);now=season.endsAt+60_000;
 const list=ranking.list(first,{requestId:"request-list1"});assert.equal(list.ok,true);assert.equal(list.message.rankingRewards.length,1);assert.equal(list.message.rankingRewards[0].rank,1);assert.equal(list.message.rankingRewards[0].reward.mythicEquipment,1);
 const deliveryId=list.message.rankingRewards[0].deliveryId,ack=ranking.ackReward(first,{deliveryId});assert.equal(ack.ok,true);assert.equal(ranking.ackReward(first,{deliveryId}).duplicate,true);
 ranking=new PlayerPowerRanking({now:()=>now,stateFile});assert.equal(ranking.pendingRewards(first.playerId).length,0);assert.equal(JSON.parse(readFileSync(stateFile,"utf8")).version,2);
});

test("legacy version-one ranking files remain loadable",()=>{
 const directory=mkdtempSync(join(tmpdir(),"abyss-rank-legacy-")),stateFile=join(directory,"power-rankings.json"),now=Date.UTC(2026,7,24,0,0,0);
 writeFileSync(stateFile,JSON.stringify({version:1,records:[]}));
 const ranking=new PlayerPowerRanking({now:()=>now,stateFile});assert.equal(ranking.recordCount(),0);assert.deepEqual(ranking.pendingRewards("AD-ABCD-EFGH"),[]);
});
