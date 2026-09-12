import fs from 'node:fs';
import {run,monster} from './native-harness.mjs';
import {chapterTwoEnemyEntries,tuneChapterTwoEnemy,ENCOUNTERS} from '../../src/chapterTwo/ChapterTwoSystem.js';
import {tuneMother422,MOTHER_ENEMY422} from '../../src/primordial/Mother422.js';
const parties=[['ch2_seria','ch2_carmia','ch2_rostia','ch2_althea'],['ch2_ryune','ch2_rose','ch2_mirea','ch2_viola'],['ch2_dracia','ch2_rucie','ch2_tillea','ch2_grant']];
const ctx=(await run(parties[0],['ch2_grant'],{inspect:true})).context;
const targets=process.argv.includes('--all')?Object.keys(ENCOUNTERS).filter(id=>ENCOUNTERS[id].boss||ENCOUNTERS[id].vault||id==='roam4_3_392'):['roam4_3_392','mother422'];
if(!targets.includes('mother422'))targets.push('mother422');
const rows=[];
for(const id of targets){const e=ENCOUNTERS[id],area=e?.area??0,runState={area,challengeTier:0,serial:1,roaming380:[],defeated:[]};
 const units=id==='mother422'?[tuneMother422(ctx.makeBattleEnemy(MOTHER_ENEMY422))]:chapterTwoEnemyEntries(id,runState).map((entry,i)=>{const unit=ctx.makeBattleEnemy(entry,i);tuneChapterTwoEnemy(unit,id,i,runState);if(unit.chapterTwoTactics382)ctx.applyEnemyMagicCircleProfile(unit,unit.enemyMagicCircle);return unit;});
 for(let p=0;p<parties.length;p++)for(const seed of [1,7,29]){const level=id==='mother422'?4200:Math.max(1500,e.level),out=await run(parties[p],[],{level,gear:true,seed,circles:true,maxRounds:40,enemyUnits:units,battleOptions:{specialBattleType:id==='mother422'?'mother422':'chapterTwo',specialBattle:true,chapterPreparationTier415:0,chapterPreparationElite415:0,chapterPreparationVault415:false}});rows.push({id,party:p,seed,level,won:out.won,lost:out.lost,rounds:out.rounds,remaining:out.remaining,damage:out.metrics.damage,taken:out.metrics.taken});}
 console.log(id,rows.filter(r=>r.id===id).map(r=>`${r.party}:${r.won?'W':r.lost?'L':'T'}R${r.rounds}`).join(' '));
}
fs.writeFileSync('docs/build422/balance-audit.json',JSON.stringify(rows,null,2));
