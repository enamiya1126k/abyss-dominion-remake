import test from 'node:test';import assert from 'node:assert/strict';
import {fixture430,reserve430} from '../tools/build430/offline-fixture.mjs';
import {WorldRaidCoordinator440} from '../online-server/src/WorldRaidCoordinator440.js';
import {WorldRaidReplay430,replayOffline430} from '../src/worldRaid/WorldRaidReplay430.js';
import {WorldRaidBattle437} from '../online-server/src/WorldRaidCoordinator437.js';
import {sanitizeProfile} from '../online-server/src/RoomStore.js';
import {magicCircleById} from '../src/core/MagicCircleSystem.js';
for(const id of ['reincarnation','raid_zero_sovereign','raid_vajra_beast'])test(`rule 4: ${id} agrees with live combat, survives JSON resume and settles once`,()=>{
 const f=fixture430();f.a.profile=sanitizeProfile({displayName:'検証',monsterId:'slime1',speciesId:'slime',level:1000,maxFloor:100,circleId:id,circleEffect:magicCircleById(id).effect,circleLevel:99,battleStats:{hp:1e6,mp:1000,atk:20000,matk:20000,def:5000,mdef:5000,spd:1000},skills:[]});
 f.c=new WorldRaidCoordinator440({sessions:f.sessions,now:f.now,random:()=>.5,send:()=>{},persist:()=>true});const[t]=reserve430(f);assert.equal(t.ruleVersion,4);
 const saved=JSON.stringify(t),a=new WorldRaidReplay430(t),live=new WorldRaidReplay430(JSON.parse(saved));
 live.engine=new WorldRaidBattle437({session:live.session,now:()=>live.time,random:live.random,broadcast:(_,m)=>live.events.push(...m.events??[])});
 let n=0;while(!a.ended){assert.ok(n++<250);const cmd={kind:'advance',round:a.room.raid.round};a.step(cmd);live.step(cmd);assert.equal(a.damage,live.damage);assert.equal(a.room.raid.players[t.playerId].hp,live.room.raid.players[t.playerId].hp);assert.equal(a.ended,live.ended);}
 const replay=replayOffline430(JSON.parse(saved),JSON.parse(JSON.stringify(a.commands)));assert.equal(replay.damage,a.damage);assert.deepEqual(replay.snapshot(),a.snapshot());assert.equal(JSON.stringify(t),saved);
 const result=f.c.submit430(f.a,{ticketId:t.id,commands:a.commands});assert.equal(result.ok,true);assert.equal(result.receipt.damage,a.damage);const before=JSON.stringify(f.c.ledger.state);assert.equal(f.c.submit430(f.a,{ticketId:t.id,commands:a.commands}).duplicate,true);assert.equal(JSON.stringify(f.c.ledger.state),before);
});
