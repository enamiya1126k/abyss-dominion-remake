import fs from 'node:fs';
import {RaidCoordinator} from '../../online-server/src/RaidCoordinator.js';
import {RoomStore} from '../../online-server/src/RoomStore.js';
import {weeklyRaidState} from '../../online-server/src/WeeklyRaidCatalog.js';
import {coopBossFor,COOP_BOSS_CATALOG} from '../../online-server/src/CoopBossCatalog.js';
import {buildOnlinePartyProfile} from '../../src/ui/screens/OnlinePartyScreen.js';
import {SaveService} from '../../src/services/SaveService.js';
import {gearParty415,LATE_TEAMS415} from './teams.mjs';import {rng} from './native-harness.mjs';
const teams=[LATE_TEAMS415[0],LATE_TEAMS415[3],LATE_TEAMS415[11]],out=process.env.COOP_ONLY?'docs/build415/coop-verification.jsonl':'docs/build415/online-verification.jsonl';fs.writeFileSync(out,'');
function sessionsFor(ids){return new Map(gearParty415(ids,1000).map((m,i)=>{const state=new SaveService().state;state.monsters=[m];state.party=[m.id];state.player.maxFloor=100;state.player.currentFloor=100;const profile=buildOnlinePartyProfile(state,{monsterId:m.id,displayName:'tester'+i});return['p'+i,{playerId:'p'+i,profile,connected:true,ready:true,dungeonPosition:{x:0,y:0},coopVitals:{hp:profile.currentHp,maxHp:profile.battleStats.hp,mp:profile.currentMp,maxMp:profile.battleStats.mp}}];}));}
for(let w=0;w<(process.env.COOP_ONLY?0:15);w++)for(const[team,ids]of teams.entries()){
 const nowBase=Date.UTC(2026,0,5,1)+w*7*864e5,definition=weeklyRaidState(nowBase);let wins=0,rounds=0;
 for(let seed=0;seed<100;seed++){let now=nowBase;const sessions=sessionsFor(ids),raid=new RaidCoordinator({sessions,now:()=>now,random:rng(seed)}),room={roomId:'test',members:new Set(sessions.keys()),leaderId:'p0',phase:'lobby',selectedFloor:100};const started=raid.start(room,sessions.get('p0'));if(!started.ok)throw Error(JSON.stringify(started));const b=room.raid;b.autoPlayers=[...sessions.keys()];while(!b.outcome&&b.round<=40){now+=30000;raid.advance(room);}wins+=Number(b.outcome==='victory');rounds+=b.round;}
 fs.appendFileSync(out,JSON.stringify({mode:'raid',target:definition.boss.id+':'+definition.modifier.id,team,ids,level:1000,participants:4,seeds:100,wins,rounds:rounds/100})+'\n');
}
for(const boss of COOP_BOSS_CATALOG)for(const[team,ids]of teams.entries()){
 let owner='';for(let i=0;i<100;i++)if(coopBossFor({ownerId:'test'+i,floor:100}).id===boss.id){owner='test'+i;break;}let wins=0,rounds=0;
 for(let seed=0;seed<100;seed++){
 const store=new RoomStore({random:rng(seed)}),sessions=sessionsFor(ids);store.sessions=sessions;store._broadcast=()=>{};store._broadcastRoom=()=>{};store._syncAllExpeditionVitals=()=>{};
 const room={roomId:'test',members:new Set(sessions.keys()),leaderId:'p0',ownerId:owner,phase:'expedition',selectedFloor:100,expedition:{id:'fixture',floor:100,tiles:['.'],rows:1,cols:1,returnVotes:new Set(),exit:{x:0,y:0},sections:[],hostOwnerId:owner,start:{x:0,y:0},contribution:{},objects:[],coop:{enabled:true,partySize:4}}};store._startBattle(room,{id:'coop',type:'coopElite',x:0,y:0});const b=room.expedition.battle;if(!b||b.coopBoss.id!==boss.id)throw Error('Wrong boss factory');
 while(!b.outcome&&b.round<=40){store._resolveBattleRound(room,b);if(!b.outcome)store._openNextBattleRound(room,b);}
 wins+=Number(b.outcome==='victory');rounds+=b.round;
 }
 fs.appendFileSync(out,JSON.stringify({mode:'coop',target:boss.id,team,ids,level:1000,participants:4,seeds:100,wins,rounds:rounds/100})+'\n');
}
console.log(out);
