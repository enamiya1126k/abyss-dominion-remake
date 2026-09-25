import {mainFixture550} from './main-fixture.mjs';
import {partyFixture550} from './party-fixture.mjs';
import {startHide536} from '../../src/hide/Rules536.js';
import {liveHide536} from '../../online-server/src/HideCoordinator536.js';
const {RaceCoordinator451}=await mainFixture550(),P=await partyFixture550();
export function room559({humans=4,role='hunter',phase='play',seed=559,send=()=>{}}={}){
 let now=Date.now();const messages=[],sessions=new Map(Array.from({length:humans},(_,i)=>['p'+i,{playerId:'p'+i,clientKey:'fixture-'+i,connected:true,profile:{displayName:['あなた','ふわり','コトコト','コソコソ'][i]}}]));
 const c=new RaceCoordinator451({sessions,now:()=>now,send:(id,m)=>{messages.push({id,...m});send(id,m)}});
 const raw=(id,op,p={})=>c.handle(sessions.get(id),{op,rulesVersion:8,hideVersion536:6,cartVersion543:7,ricochetVersion550:6,roster:[{id:'m',speciesId:['slime','goblin','skeleton','wolf'][Number(id.slice(1))]}],slotOne476:'m',...p});
 raw('p0','partyCreate462',{game:'hide'});const party=P.partyFor462(c,'p0');
 for(let i=1;i<humans;i++)raw('p'+i,'partyJoin462',{code:party.code});
 let saved=P.partyRace462(c,party);raw('p0','hide536',{gameId:saved.id,kind:'role',role});
 for(let i=0;i<humans;i++){raw('p'+i,'hide536',{gameId:saved.id,kind:'select',monsterId:'m'});raw('p'+i,'partyReady462',{ready:true});raw('p'+i,'status')}
 if(phase!=='lobby'){
  raw('p0','hide536',{gameId:saved.id,kind:'start'});saved=P.partyRace462(c,party);
  if(seed!=null)startHide536(saved,now,seed);
  if(phase==='play'){saved.phase='play';saved.startAt=now;saved.endAt=now+180000;saved.lastAt=now;saved.elapsed=0;}
  c.hideRuntime536?.delete(saved.id);
 }
 const errors=messages.filter(m=>m.type==='raceError451');if(errors.length)throw Error(JSON.stringify(errors));
 return{c,party,sessions,messages,raw,get saved(){return P.partyRace462(c,party)},get game(){return liveHide536(c,P.partyRace462(c,party))},get now(){return now},advance(ms){for(let n=0;n<ms;n+=50){now+=Math.min(50,ms-n);c.advanceHide536()}if(!c.healthy())throw Error(c.writeError);},push(){for(const s of sessions.values())if(s.connected)c.push(s)}};
}
