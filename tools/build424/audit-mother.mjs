import fs from 'node:fs';
import {run,monster,rng} from './native-harness.mjs';
import {MOTHER_ENEMY422,tuneMother422} from '../../src/primordial/Mother422.js';
const sets=[['ch2_seria','ch2_carmia','ch2_rostia','ch2_althea'],['ch2_ryune','ch2_rose','ch2_mirea','ch2_viola'],['ch2_dracia','ch2_rucie','ch2_tillea','ch2_grant'],['ch2_nemesia','ch2_everia','ch2_aeriel','ch2_vespera'],['ch2_noelle','ch2_aure','ch2_ione','ch2_noctia'],['ten_life','ten_time','abyss_wrath','abyss_gluttony'],['ch2_ferne','ch2_clarisse','ch2_nemesia','ch2_everia'],['ch2_dracia','ch2_rucie','ch2_meliora','ch2_elyselle'],['ch2_sephira','ch2_astrelle','ch2_aeriel','ch2_vespera']];
const f=await run(sets[0],['slime'],{inspect:true}),enemy=tuneMother422(f.context.makeBattleEnemy(MOTHER_ENEMY422));
const rows=[];const levels=process.argv.includes('--full')?[4500,6000,8000]:[6000];
for(const level of levels)for(const [party,ids]of sets.entries())for(const seed of process.argv.includes('--full')?[1,7,29]:[1]){
 const result=await run(ids,[],{level,gear:true,enemyUnits:[enemy],seed,circles:true,maxRounds:40,trace:true,battleOptions:{specialBattleType:'mother422',specialBattle:true}});
 const {won,lost,rounds,remaining,metrics}=result,row={party,ids,level,seed,won,lost,rounds,remaining,...metrics};rows.push(row);console.log(JSON.stringify(row));
 if(process.argv.includes('--trace'))console.log(JSON.stringify(result.trace));
}
fs.writeFileSync('docs/build424/mother-audit.json',JSON.stringify(rows,null,2));
