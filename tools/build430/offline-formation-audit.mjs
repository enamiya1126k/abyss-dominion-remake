import fs from 'node:fs';import assert from 'node:assert/strict';
import {createMonster} from '../../src/models/Monster.js';import {endgameCharacter} from '../../src/data/endgameCharacters.js';import {SaveService} from '../../src/services/SaveService.js';import {buildOnlinePartyProfile} from '../../src/ui/screens/OnlinePartyScreen.js';
import {fixture430,reserve430,finish430} from './offline-fixture.mjs';import {replayOffline430} from '../../src/worldRaid/WorldRaidReplay430.js';
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const teams=[['myth_enami','myth_yori','myth_hide','myth_rion'],['ten_time','ten_life','abyss_wrath','abyss_gluttony'],['ten_death','ten_end','ten_divinity','abyss_envy'],['ch2_ryune','ch2_rose','ch2_mirea','ch2_viola']];const rows=[];
for(const team of teams)for(const seed of [1,19,47]){
 const state=new SaveService().state;state.monsters=team.map(id=>{const g=endgameCharacter(id);return createMonster(g?.speciesId??id,{endgameBossId:g?.id,endgameFaction:g?.faction,level:10000,allowEndgameLevel:true,rank:4,traitId:'steady',plus:0,affection:0});});state.party=state.monsters.map(m=>m.id);state.equipment=[];
 const f=fixture430();f.a.profile=buildOnlinePartyProfile(state);const [ticket]=reserve430(f);ticket.seed=seed;
 const result=finish430(ticket),replayed=replayOffline430(ticket,JSON.parse(JSON.stringify(result.commands)));assert.equal(replayed.damage,result.damage);assert.deepEqual(replayed.snapshot(),result.snapshot());
 const accepted=f.c.submit430(f.a,{ticketId:ticket.id,commands:result.commands});assert.equal(accepted.ok,true);assert.equal(accepted.receipt.damage,result.damage);
 rows.push({team,seed,rounds:result.room.raid.round,damage:result.damage,result:result.room.raid.outcome,commands:result.commands.length,replay:'identical'});
}
fs.writeFileSync('docs/build430/formation-audit.json',JSON.stringify(rows,null,2)+'\n');console.log(JSON.stringify(rows));
