import fs from 'node:fs';
import {createMonster} from '../../src/models/Monster.js';
import {endgameCharacter} from '../../src/data/endgameCharacters.js';
import {SaveService} from '../../src/services/SaveService.js';
import {buildOnlinePartyProfile} from '../../src/ui/screens/OnlinePartyScreen.js';
import {WorldRaidCoordinator428} from '../../online-server/src/WorldRaidCoordinator428.js';
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const teams=[['myth_enami','myth_yori','myth_hide','myth_rion'],['ten_time','ten_life','abyss_wrath','abyss_gluttony'],['ten_death','ten_end','ten_divinity','abyss_envy'],['slime','wolf','ghost','goblin']];
const results=[];
for(const ids of teams)for(const initialSeed of [1,19,47]){
 let seed=initialSeed,clock=Date.UTC(2026,8,13),events=[];const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const state=new SaveService().state;state.monsters=ids.map(id=>{const g=endgameCharacter(id);return createMonster(g?.speciesId??id,{endgameBossId:g?.id,endgameFaction:g?.faction,level:10000,allowEndgameLevel:true,rank:4,traitId:'steady',plus:0,affection:0});});state.party=state.monsters.map(u=>u.id);state.equipment=[];
 const session={playerId:'AD-AUDT-0001',connected:true,profile:buildOnlinePartyProfile(state)},c=new WorldRaidCoordinator428({sessions:new Map([[session.playerId,session]]),now:()=>clock,random,send:(_,m)=>events.push(...m.events??[])});
 const result=c.start(session,{requestId:'audit-request-000001',campaignId:c.snapshot(session.playerId).campaign.id,profile:session.profile});if(!result.ok)throw new Error(JSON.stringify(result));
 let ticks=0;while(c.active(session.playerId)&&ticks++<100){clock+=3000;c.advance();}
 const view=c.snapshot(session.playerId);if(c.active(session.playerId))throw new Error('battle stalled');
 const entry={team:ids,seed:initialSeed,result:view.attempt.report.result,rounds:view.attempt.report.rounds,damage:view.attempt.damage,maxEventDamage:Math.max(0,...events.filter(e=>['damage','statusDamage','ultimateDeath'].includes(e.kind)&&e.targetKind==='boss').map(e=>e.value??0)),remaining:view.remaining};
 if(entry.damage>1000000000)throw new Error('Unexpected raid-wide percentage damage '+JSON.stringify(entry));results.push(entry);
}
fs.writeFileSync('docs/build428/formation-audit.json',JSON.stringify({description:'Native auto combat, four level-10000 formations without equipment, three deterministic seeds each. No browser rendering.',results},null,2)+'\n');
console.log(results.map(r=>({team:r.team.join('/'),seed:r.seed,rounds:r.rounds,damage:r.damage,result:r.result})));
