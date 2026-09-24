import {fixture} from './race-fixture.mjs';
import{RaceCoordinator451 as Current}from'../../online-server/src/RaceCoordinator451.js';
import * as Tower from '../../src/tower/Rules517.js';
import{writeFile,mkdir}from'node:fs/promises';
const baseline=process.env.BASELINE_URL??new URL('../../../base/',import.meta.url).href;
const {RaceCoordinator451:Base}=await import(new URL('online-server/src/RaceCoordinator451.js',baseline));
const OldTower=await import(new URL('src/tower/Rules517.js',baseline));
const results={description:'Two concurrent 3000m races, four human seats each, one idle subscriber, 10 seconds at server 250ms cadence. Identical fixture catalog and seeded simulation; modules loaded before timing; wall time is indicative.'};
for(const [name,C]of [['before',Base],['after',Current]]){const f=fixture(C);let writes=0;const tx=f.c.transaction.bind(f.c);f.c.transaction=fn=>{writes++;return tx(fn)};const start=performance.now();for(let i=0;i<40;i++)f.step();results[name]={messages:f.packets.length,bytes:f.packets.reduce((n,p)=>n+Buffer.byteLength(JSON.stringify(p.m)),0),otherRoomMessages:f.packets.filter(p=>p.id==='p8').length,storeTransactions:writes,elapsedMs:performance.now()-start};}
results.flatAI={description:'30 seconds, three neighboring runners, no falling block or higher platform; count authoritative jump/bounce/super events, not animation frames.'};
for(const [name,R]of [['before',OldTower],['after',Tower]]){const g=R.makeTower517({id:'bench',code:'B',hostId:'p0',members:Array.from({length:4},(_,i)=>({playerId:'p'+i,choice:{speciesId:'slime'}}))});g.roleMode='p0';R.startTower517(g,0,529);R.advanceTower517(g,3000);g.autoAt=1e8;g.players.slice(1).forEach((p,i)=>{p.x=4+i*.3});let last=0,jumps=0;const start=performance.now();for(let i=0;i<1800;i++){const inputs=new Map(g.players.slice(1).map(p=>[p.playerId,R.botRunner517(g,p)]));R.advanceTower517(g,g.lastAt+R.TOWER517.step,inputs);for(const e of g.events)if(e.id>last&&['jump','bounce','superJump'].includes(e.type))jumps++;last=g.eventSeq;}results.flatAI[name]={jumps,elapsedMs:performance.now()-start};}
await mkdir(new URL('../../docs/build529/',import.meta.url),{recursive:true});await writeFile(new URL('../../docs/build529/performance.json',import.meta.url),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
