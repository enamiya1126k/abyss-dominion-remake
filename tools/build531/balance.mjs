// Deterministic strategy comparison, not a claim about human win rates.
import * as R from '../../src/fishing/Rules524.js';
import * as C from '../../src/fishing/Catches525.js';
import {available526} from '../../src/fishing/Water526.js';
import {writeFileSync,mkdirSync} from 'node:fs';
const compare=[];
for(const policy of ['shore_cashout','grow_and_explore']){
 let score=0,catches=0,bosses=0,misses=0;
 for(let seed=1;seed<=100;seed++){
  const g=R.makeFishing524({id:'b531',code:'QA',hostId:'p0',members:Array.from({length:4},(_,i)=>({playerId:'p'+i,name:'P'+i,choice:{speciesId:'slime'}}))});R.startFishing524(g,0,seed);R.advanceFishing524(g,3000);const p=g.players[0];
  while(g.phase==='play'){
   if(['idle','aim'].includes(p.mode)){
    const boss=g.shoals.find(s=>s.tier===4&&available526(s,g.elapsed));
    if(policy==='grow_and_explore'&&boss&&R.rod524(p)>=3){const pos=R.fishPose524(boss,g.elapsed);R.cast524(g,p,pos.x,pos.y)}
    else{const y=policy==='grow_and_explore'&&R.rod524(p)>=3?.23:.70;R.cast524(g,p,.30,y)}
   }
   if(p.mode==='fight')p.reel=!['surge','warn'].includes(R.mood524(p,g.elapsed))&&p.tension<.58;
   if(p.mode==='choice'){const chain=g.elapsed<93000&&C.canChain525(p.fish)&&(p.fish.baitOnly525||policy==='grow_and_explore'&&(p.fish.lure525||p.fish.tier<3&&(p.fish.chainDepth525??0)<3));R.choose524(g,p,chain?'continue':p.fish.baitOnly525?'bait':'keep')}
   R.advanceFishing524(g,g.lastAt+50);
  }
  score+=p.score;catches+=p.caught;bosses+=p.records.filter(f=>f.tier===4).length;misses+=p.misses;
 }
 compare.push({policy,matches:100,meanScore:score/100,meanCatches:catches/100,lordsCaught:bosses,meanMisses:misses/100});
}
mkdirSync(new URL('../../docs/build531/',import.meta.url),{recursive:true});writeFileSync(new URL('../../docs/build531/balance.json',import.meta.url),JSON.stringify({note:'Same-seed solo deterministic timing policies; 2-minute matches. No input delay, not real-player evidence.',compare},null,2));console.log(JSON.stringify(compare,null,2));
if(compare[1].meanScore<=compare[0].meanScore)throw Error('Growth policy does not reward the added risk');
