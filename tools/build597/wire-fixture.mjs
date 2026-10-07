import {runners587 as a} from '../../online-server/src/ArcadeCoordinator580.js';
import * as party from '../../online-server/src/PartyCoordinator462.js';
export function room({send=()=>{}}={}){
 let at=1000;const people=Array.from({length:4},(_,i)=>({playerId:'p'+i,name:'P'+i,runnersVersion587:7,arcadeVersion580:1,owned:[{id:'m'+i,speciesId:'slime'}],slotOne476:'m'+i,ready:false,connected:true,atHome:false}));
 const p={id:'party591',code:'TEST',hostId:'p0',members:people},sessions=new Map(people.map(p=>[p.playerId,{playerId:p.playerId,connected:true}]));
 const c={data:{serial:0,accounts:{},rooms:{},parties462:{TEST:p}},sessions,subscribers:new Set(people.map(p=>p.playerId)),now:()=>at,isBusy:()=>false,transaction:f=>f(),broadcast:()=>{},push:()=>{},send,roster:x=>structuredClone(x),member:(g,id)=>g?.members.find(m=>m.playerId===id),roomFor:()=>null};
 party.openGame462(c,p,'runners');const saved=()=>c.data.runnersRooms580.TEST,g=()=>a.live(c,saved());
 const dispatch=(id,m)=>{const msg={runnersVersion587:7,arcadeVersion580:1,gameId:g().id,...m},session=c.sessions.get(id)??{playerId:id,connected:true};if(msg.op==='runnersInput587')return a.queue(c,session,msg);if(msg.op?.startsWith('party'))return party.handleParty462(c,session,msg);return a.handle(c,session,msg);};
 const tick=ms=>{for(let t=0;t<ms;t+=25){at+=25;a.advance(c);}};
 const ready=()=>people.forEach(p=>dispatch(p.playerId,{op:'partyReady462',ready:true}));
 const start=()=>{ready();dispatch('p0',{op:'runners587',kind:'start'});tick(3025);};
 return{c,p,a,saved,g,dispatch,tick,ready,start,get at(){return at;}};
}
