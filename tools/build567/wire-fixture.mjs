import {RaceCoordinator451} from '../../online-server/src/RaceCoordinator451.js';
export const flags={rulesVersion:18,cabbageVersion484:1,cabbageScoring491:1,cabbageSwipe567:1};
export function room567(count=3,send=()=>{},stateFile=null){
 let at=10000;const messages=[],sessions=new Map(Array.from({length:count},(_,seat)=>['p'+seat,{playerId:'p'+seat,clientKey:'test-'+seat,connected:true,profile:{displayName:'Player '+seat}}]));
 const c=new RaceCoordinator451({sessions,stateFile,now:()=>at,send:(id,m)=>{messages.push({id,...m});send(id,m);}});
 const party=()=>Object.values(c.data.parties462??{})[0],g=()=>c.data.cabbageRooms484?.[party()?.code];
 const dispatch=(id,m)=>{const before=messages.length;c.handle(sessions.get(id),{...flags,gameId:g()?.id,...m});const error=messages.slice(before).find(x=>x.id===id&&x.type==='raceError451');if(error)throw Error(error.message);};
 for(let i=0;i<count;i++)dispatch('p'+i,{op:i?'partyJoin462':'partyCreate462',code:party()?.code,roster:[{id:'m'+i,speciesId:['slime','goblin','wolf','skeleton'][i]}]});
 dispatch('p0',{op:'partyGame462',game:'cabbage'});for(let i=0;i<count;i++)dispatch('p'+i,{op:'cabbage484',kind:'select',monsterId:'m'+i});
 const tick=ms=>{at+=ms;c.advance();if(c.writeError)throw Error(c.writeError);};
 const ready=()=>{for(let i=0;i<count;i++)dispatch('p'+i,{op:'partyReady462',ready:true});};
 const start=()=>{ready();dispatch('p0',{op:'cabbage484',kind:'start'});tick(3600);};
 return{c,messages,sessions,party,g,dispatch,tick,ready,start,get at(){return at}};
}
