import {STEP580,random580 as rnd,event580 as emit,make580,players580,finish580,publicBase580,resume580} from '../arcade580/Common580.js';

export const LAVA580=Object.freeze({step:STEP580,countdown:3000,choose:5500,reveal:2600,rounds:8});
const C=LAVA580;
export const makeLava580=args=>make580('lava',args);
function next(g){
 const pool=[0,1,2,3,4];for(let i=4;i>0;i--){const j=Math.floor(rnd(g)*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 // Only these two marked stones can erupt. Which one is never sent before the jump.
 g.danger=pool.slice(0,2).sort();g.eruption=pool[Math.floor(rnd(g)*2)];g.treasure=pool[0];g.stage='choose';g.phaseAt=g.lastAt;g.deadline=g.lastAt+C.choose;g.multiplier=g.round>=7?2:1;
 for(const p of g.players)Object.assign(p,{target:null,pad:null,gain:0,out:false,botAt:g.lastAt+900+rnd(g)*3200});emit(g,'choose',{round:g.round});
}
export function startLava580(g,now,seed=580){if(g.phase!=='lobby')return false;g.seed=seed>>>0||580;g.lastAt=now;g.round=1;players580(g);for(const p of g.players)Object.assign(p,{survived:0,treasures:0,falls:0,target:null,pad:null,gain:0,out:false});Object.assign(g,{phase:'countdown',phaseAt:now,startAt:now+C.countdown,deadline:now+C.countdown,stage:'ready',danger:[],treasure:null,multiplier:1});g.revision++;g.updatedAt=now;return true;}
export function validLava580(g,p,m,at=g.lastAt){return !!p&&g.phase==='play'&&g.stage==='choose'&&at>=g.phaseAt&&at<g.deadline&&m.action==='choose'&&Number.isInteger(m.target)&&m.target>=0&&m.target<5;}
export function inputLava580(g,p,m){if(!validLava580(g,p,m))return false;p.target=m.target;p.lastSeq=Math.max(p.lastSeq,m.seq??0);return true;}
export function resolveLava580(g){
 if(g.stage!=='choose')return;
 g.stage='reveal';g.phaseAt=g.lastAt;g.deadline=g.lastAt+C.reveal;
 for(const p of g.players)p.pad=p.target;
 for(const p of g.players){
  p.out=p.pad==null||p.pad===g.eruption;
  if(p.out){p.gain=0;p.falls++;continue;}
  const crowd=g.players.filter(q=>q.pad===p.pad).length,base=g.danger.includes(p.pad)?180:100,treasure=p.pad===g.treasure?100:0;
  p.gain=Math.floor((base+treasure)*g.multiplier/crowd);p.score+=p.gain;p.survived++;if(treasure)p.treasures++;
 }
 emit(g,'eruption',{pad:g.eruption});
}
export function advanceLava580(g,now,inputs=new Map(),auto=new Set()){
 if(['lobby','result'].includes(g.phase))return false;
 resume580(g,now,inputs,['startAt','deadline','phaseAt'],['botAt']);let changed=false;
 while(g.lastAt+C.step<=now&&g.phase!=='result'){
  g.lastAt+=C.step;changed=true;
  if(g.phase==='countdown'){inputs.clear();if(g.lastAt<g.startAt)continue;g.phase='play';next(g);}
  if(g.lastAt>=g.deadline){inputs.clear();if(g.stage==='choose')resolveLava580(g);else if(g.round>=C.rounds){finish580(g);continue;}else{g.round++;next(g);}}
  for(const p of g.players){
   p.auto=p.ai||auto.has(p.playerId);const list=inputs.get(p.playerId)??[];inputs.delete(p.playerId);
   if(g.stage!=='choose')continue;
   if(p.auto&&p.target==null&&g.lastAt>=p.botAt){
    const behind=p.score<Math.max(...g.players.map(q=>q.score))-150;
    // Bots only use public warnings and scores, never the hidden eruption or opponents' choices.
    const risky=rnd(g)<(behind?.47:.24),pool=risky?g.danger:[0,1,2,3,4].filter(i=>!g.danger.includes(i));
    p.target=pool[Math.floor(rnd(g)*pool.length)];
   }else if(!p.auto)for(const m of list)if(m.round==null||m.round===g.round)inputLava580(g,p,m);
  }
 }
 g.serverAt=g.lastAt;g.updatedAt=now;if(changed)g.revision++;return changed;
}
export function publicLava580(g,selfId){return {...publicBase580(g),stage:g.stage,danger:[...(g.danger??[])],treasure:g.treasure,multiplier:g.multiplier,eruption:g.stage==='reveal'||g.phase==='result'?g.eruption:null,players:g.players.map(({botAt,inputSeq563,target,...p})=>({...p,lastSeq:p.playerId===selfId?Math.max(p.lastSeq,inputSeq563??0):0,target:p.playerId===selfId||g.stage==='reveal'||g.phase==='result'?target:null}))};}
