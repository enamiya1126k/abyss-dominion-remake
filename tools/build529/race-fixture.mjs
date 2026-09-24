import test from 'node:test';import assert from 'node:assert/strict';
import{RaceCoordinator451}from'../../online-server/src/RaceCoordinator451.js';
import{raceProfile451}from'../../src/race/RaceRules451.js';
import{course459}from'../../src/race/RaceCourse459.js';
import{createSimulation456,publicSimulation456,advanceSimulation456}from'../../src/race/RaceSimulation456.js';
import{raceFrame529,noteRace529,smoothFrame529,raceTime529}from'../../src/race/RaceMotion529.js';
import{frame456}from'../../src/race/RaceVisual456.js';
import{mkdtempSync,readFileSync,rmSync}from'node:fs';import{tmpdir}from'node:os';import{join}from'node:path';
export function fixture(Coordinator=RaceCoordinator451,file=null){let at=100000;const packets=[],sessions=new Map(Array.from({length:9},(_,i)=>['p'+i,{playerId:'p'+i,clientKey:'529-key-'+i,connected:true,raceFrames529:1}]));const c=new Coordinator({sessions,stateFile:file,now:()=>at,send:(id,m)=>packets.push({id,m:structuredClone(m)})});
 for(const s of sessions.values()){c.account(s);c.subscribers.add(s.playerId)}
 for(let n=0;n<2;n++){const members=Array.from({length:4},(_,i)=>({playerId:'p'+(n*4+i),name:'プレイヤー'+i,choice:{id:'m'+i,speciesId:['slime','wolf','goblin','skeleton'][i]},owned:[{id:'m'+i,speciesId:'slime'}]}));const r=c.makeRoom('ROOM'+n,members,8);r.phase='race';r.phaseAt=at;r.startAt=at;r.track459=course459(3000);r.system=['myth_rion','myth_yori','myth_hide','myth_enami'].map(speciesId=>({speciesId,name:speciesId,ownerId:null,profile:raceProfile451(speciesId),condition:2,rulesVersion:8,track459:r.track459,bond459:1000}));r.racers=[...r.system,...members.map(m=>({speciesId:m.choice.speciesId,name:m.name,ownerId:m.playerId,monsterId:m.choice.id,profile:raceProfile451(m.choice.speciesId),condition:2,rulesVersion:8,track459:r.track459,bond459:1000}))];r.forecast456={samples:1024,triples:Array(512).fill(2),assumption:'事前の試算'};r.sim456=createSimulation456(r.racers,'芝',529+n);c.data.rooms[r.code]=r;}
 return{c,sessions,packets,get at(){return at},step(ms=250){at+=ms;c.advance()},room:()=>c.data.rooms.ROOM0};
}
