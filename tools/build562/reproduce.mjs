import {writeFile} from 'node:fs/promises';
import {game,gear} from './fixture.mjs';
import {resolveRound511 as before} from '../../../baseline561/src/luck/Rules511.js';
import {resolveRound511 as after} from '../../src/luck/Rules511.js';
const probes={
 ward(){const g=game();g.players[0].loadout=gear('ward');g.players[0].wards=3;const row=r=>({wards:r.rows[0].wards});return {g,row,expected:{wards:4}}},
 echo(){const g=game();g.players[0].loadout=gear('echo',2);g.players[0].lastAdvance=321;const row=r=>({planned:r.rows[0].planned});return {g,row,expected:{planned:321}}},
 echoMultiplier(){const g=game();g.players[0].loadout=[...gear('echo'),...gear('overdrive')];g.players[0].lastAdvance=321;const row=r=>({planned:r.rows[0].planned});return {g,row,expected:{planned:521}}},
 wrench(){const g=game({items:['wrench','wrench','echo','echo']});g.players[2].loadout=gear('turbine');g.players[3].loadout=gear('engine');const row=r=>({secondTarget:r.attacks.find(a=>a.source===1)?.targets[0]?.target,secondOutcome:r.attacks.find(a=>a.source===1)?.targets[0]?.outcome});return {g,row,expected:{secondTarget:3,secondOutcome:'hit'}}}
};
const output={};for(const [id,probe]of Object.entries(probes)){const {g,row,expected}=probe();output[id]={before:row(before(g,0)),after:row(after(g,0)),expected};}
await writeFile('docs/build562/reproduction.json',JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify(output,null,2));
