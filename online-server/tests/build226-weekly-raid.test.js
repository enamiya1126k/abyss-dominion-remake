import test from "node:test";
import assert from "node:assert/strict";
import { weeklyRaidState } from "../src/WeeklyRaidCatalog.js";
import { RaidCoordinator } from "../src/RaidCoordinator.js";

const EPOCH=Date.UTC(2026,0,5),WEEK=7*24*60*60*1000;
function member(id="leader"){
 return{playerId:id,connected:true,ready:true,profile:{displayName:id,speciesId:"slime",battleStats:{hp:1000,mp:100,atk:420,matk:390,def:240,mdef:230,spd:100,crit:10,evasion:3,accuracy:100},skills:[]}};
}
function setup(weekIndex=0){
 const leader=member(),sessions=new Map([[leader.playerId,leader]]),rewards=[],messages=[],now=EPOCH+weekIndex*WEEK+1000,raid=new RaidCoordinator({now:()=>now,random:()=>.5,sessions,queueReward:(session,reward)=>rewards.push({playerId:session?.playerId,reward}),broadcast:(_room,message)=>messages.push(message)}),room={roomId:"WEEKLY",ownerId:leader.playerId,leaderId:leader.playerId,phase:"lobby",members:new Set([leader.playerId]),selectedFloor:300,raidProgress:null};
 return{leader,sessions,rewards,messages,raid,room,now};
}

test("build226 rotates three bosses across five weekly rules without changing mid-week",()=>{
 const pairs=new Set(),bosses=new Set(),modifiers=new Set();
 for(let index=0;index<15;index++){const start=weeklyRaidState(EPOCH+index*WEEK+1),end=weeklyRaidState(EPOCH+(index+1)*WEEK-1);assert.equal(start.weekId,end.weekId);assert.equal(start.boss.id,end.boss.id);assert.equal(start.modifier.id,end.modifier.id);assert.equal(start.endsAt-start.startsAt,WEEK);pairs.add(`${start.boss.id}:${start.modifier.id}`);bosses.add(start.boss.id);modifiers.add(start.modifier.id)}
 assert.equal(bosses.size,3);assert.equal(modifiers.size,5);assert.equal(pairs.size,15);
});

test("build226 saves the weekly clear and prevents a second host clear",()=>{
 const{leader,raid,room}=setup(2);assert.equal(raid.start(room,leader).ok,true);const active=room.raid;active.outcome="victory";raid._finish(room,active);assert.equal(room.raidProgress.hp,0);assert.ok(room.raidProgress.completedAt>0);leader.ready=true;const retry=raid.start(room,leader);assert.equal(retry.ok,false);assert.equal(retry.code,"WEEKLY_RAID_CLEARED");
});

test("build226 awards each personal contribution threshold exactly once",()=>{
 const{leader,raid,room,rewards}=setup(0);assert.equal(raid.start(room,leader).ok,true);room.raid.contribution[leader.playerId].damage=16_000;const events=[];raid._awardPersonalMilestones(room,room.raid,events);raid._awardPersonalMilestones(room,room.raid,events);const personal=rewards.filter(entry=>entry.reward.source.kind==="raidPersonal");assert.deepEqual(personal.map(entry=>entry.reward.source.threshold),[5,15,30]);assert.equal(new Set(personal.map(entry=>entry.reward.rewardId)).size,3);
});

test("build226 healing-lock week halves ordinary recovery",()=>{
 const{leader,raid,room}=setup(1);assert.equal(weeklyRaidState(EPOCH+WEEK+1).modifier.id,"healing_lock");assert.equal(raid.start(room,leader).ok,true);const actor=room.raid.players[leader.playerId];actor.hp=200;const events=[];raid._resolvePlayer(room,room.raid,actor,{kind:"item",targetId:leader.playerId},leader,events);assert.equal(actor.hp,390);assert.equal(events.at(-1).value,190);
});

test("build226 stale progress starts a fresh current-week campaign",()=>{
 const{leader,raid,room}=setup(4);room.raidProgress={campaignId:"old",weekId:"weekly-0",bossId:"abyss-amalga",maxHp:50_000,hp:100,attempts:8,totalDamage:49_900,milestonesClaimed:[5,10,25],contribution:{leader:{damage:10_000}}};assert.equal(raid.start(room,leader).ok,true);const current=weeklyRaidState(EPOCH+4*WEEK+1);assert.equal(room.raid.progress.weekId,current.weekId);assert.equal(room.raid.boss.id,current.boss.id);assert.equal(room.raid.progress.hp,current.boss.maxHp);assert.equal(room.raid.progress.attempts,1);
});
