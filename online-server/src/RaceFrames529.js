import {advanceSimulation456,publicSimulation456,simulationOutcome456} from '../../src/race/RaceSimulation456.js';
import {partyFor462,partyRace462} from './PartyCoordinator462.js';
const saves=new WeakMap();
export function raceFrames529(c,room){
 const now=c.now(),live=publicSimulation456(room.sim456);
 for(const id of c.subscribers){const s=c.sessions.get(id);if(!s?.connected)continue;
  const r=c.roomFor(id)??partyRace462(c,partyFor462(c,id));if(r?.id!==room.id)continue;
  if(s.raceFrames529===1)c.send(id,{type:'raceFrame529',selfId:id,raceId:room.id,serverNow:now,live456:live,finishMs:room.outcome?.finishMs??null});
  else c.push(s); // Older clients retain their existing full-state protocol.
 }
}
export function advanceRace529(c,room,at){
 if(room.rulesVersion<4||room.phase!=='race'||room.sim456?.order.length>=8||at-room.startAt-room.sim456.elapsed<250)return;
 // Fixed-step simulation is unchanged. Clone only this race, not every account
 // and every other game, for a visual tick. Financial actions still transact.
 const next=structuredClone(room.sim456);
 advanceSimulation456(next,room.racers,at-room.startAt,c.autoIndices456(room));
 const finished=next.order.length===8;
 const update=()=>{room.sim456=next;if(finished){room.outcome=simulationOutcome456(next);room.finishAt456=room.startAt+next.elapsed}};
 if(finished||at-(saves.get(room)??0)>=2000){c.transaction(update);saves.set(room,at)}else update();
 raceFrames529(c,room);
}
