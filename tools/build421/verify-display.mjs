import fs from 'node:fs';
import {run} from './native-harness.mjs';
import {FormationScreen} from '../../src/ui/screens/FormationScreen.js';
import {BattleScreen} from '../../src/ui/screens/BattleScreen.js';
import {unlockMagicCircleFromTree,equipMagicCircle} from '../../src/core/MagicCircleSystem.js';
import {CHAPTER_TWO_CIRCLES394} from '../../src/data/chapterTwoRelics394.js';
import {cleanupSingles410} from '../../src/battle/SingleTraits410.js';
import {cleanupTrial415} from '../../src/battle/TrialAdaptation415.js';
const root=new URL('../../',import.meta.url),out=new URL('docs/build421/',root);
const f=await run(['ch2_carmia','ch2_seria','ch2_rostia','ch2_althea'],['ch2_seria','ch2_rostia','slime','ch2_althea'],{inspect:true,battleOptions:{specialBattle:true,specialBattleType:'chapterTwo'}});
const state=f.context.save.state;
for(const [i,u] of f.party.slice(0,3).entries()){
 const id=CHAPTER_TWO_CIRCLES394[i].id;unlockMagicCircleFromTree(state,id);
 if(!equipMagicCircle(state,u,id).ok)throw Error('Fixture circle could not be equipped');
}
for(const origin of ['home','chapterTwoField','explore'])fs.writeFileSync(new URL(`formation-${origin}.html`,out),FormationScreen(state,{origin}));
fs.writeFileSync(new URL('formation-empty.html',out),FormationScreen({...state,party:[]}));
for(const chapter of ['first','second']){
 const b=chapter==='first'?{...f.b,specialBattle:false,specialBattleType:undefined}:f.b;
 fs.writeFileSync(new URL(`battle-${chapter}.html`,out),BattleScreen(b,{},state.settings,100));
}
cleanupSingles410(f.b);cleanupTrial415(f.b);
console.log('Generated real formation and battle screen HTML for structural verification.');
