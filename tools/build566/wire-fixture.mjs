import {RaceCoordinator451} from '../../online-server/src/RaceCoordinator451.js';
import {liveCrane566} from '../../online-server/src/CraneCoordinator566.js';
export const flags={rulesVersion:8,craneVersion566:1,ricochetVersion550:9};
export function room566(count=4,send=()=>{}){
 let at=1000;const messages=[],sessions=new Map(Array.from({length:count},(_,seat)=>['p'+seat,{playerId:'p'+seat,clientKey:'test-client-'+seat,connected:true,profile:{displayName:['あなた','お返しゴブ','より','ホネホネ'][seat]}}]));
 const c=new RaceCoordinator451({sessions,now:()=>at,send:(id,m)=>{messages.push({id,...m});send(id,m);}});
 const party=()=>Object.values(c.data.parties462??{})[0],saved=()=>c.data.craneRooms566?.[party()?.code],g=()=>liveCrane566(c,saved());
 const dispatch=(id,m)=>{const before=messages.length;c.handle(sessions.get(id),{...flags,gameId:g()?.id,...m});const error=messages.slice(before).find(x=>x.id===id&&x.type==='raceError451');if(error)throw Error(error.message);};
 for(let i=0;i<count;i++)dispatch('p'+i,{op:i?'partyJoin462':'partyCreate462',code:party()?.code,roster:[{id:'m'+i,speciesId:['slime','goblin','wolf','skeleton'][i]}],slotOne476:'m'+i});
 dispatch('p0',{op:'partyGame462',game:'crane'});
 const tick=ms=>{for(let i=0;i<ms;i+=25){at+=25;c.advanceCrane566();assertHealthy();}},assertHealthy=()=>{if(c.writeError)throw Error(c.writeError);};
 const ready=()=>{for(let i=0;i<count;i++)dispatch('p'+i,{op:'partyReady462',ready:true});};
 const start=()=>{ready();dispatch('p0',{op:'crane566',kind:'start'});tick(3100);};
 return{c,messages,sessions,party,saved,g,dispatch,tick,ready,start,get at(){return at}};
}
