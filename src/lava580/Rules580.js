import {STEP580,random580 as rnd,event580 as emit,make580,players580,finish580,publicBase580,resume580} from '../arcade580/Common580.js';
export const LAVA580=Object.freeze({step:STEP580,countdown:3000,choose:3300,reveal:1500,rounds:8,jump:420});
const C=LAVA580;
export const makeLava580=args=>({...make580('lava',args),rules580:2});
function next(g){
 const pool=[0,1,2,3,4];for(let i=4;i>0;i--){const j=Math.floor(rnd(g)*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 const count=g.round>=5?3:2;g.eruptions598=pool.slice(0,count);g.danger=[];g.warnAt598=g.lastAt+C.choose-Math.min(600,g.round*60)-(g.round>=5?1000:1250);g.eruption=g.eruptions598[0];g.treasure=pool[0];g.treasureTaken598=[];g.stage='choose';g.phaseAt=g.lastAt;g.deadline=g.lastAt+C.choose-Math.min(600,g.round*60);g.multiplier=g.round>=7?2:1;
 for(const p of g.players){const start=p.out?null:p.pad;Object.assign(p,{fromPad598:start,target:start,pad:start,gain:0,out:false,jumpAt598:0,landAt598:0,loot598:0,botPlan598:'loot',botAt:g.lastAt+220+rnd(g)*450});}emit(g,'choose',{round:g.round});
}
export function startLava580(g,now,seed=580){if(g.phase!=='lobby')return false;g.rules580=2;g.seed=seed>>>0||580;g.lastAt=now;g.round=1;players580(g);for(const p of g.players)Object.assign(p,{survived:0,treasures:0,falls:0,target:null,pad:null,gain:0,out:false,streak598:0});Object.assign(g,{phase:'countdown',phaseAt:now,startAt:now+C.countdown,deadline:now+C.countdown,stage:'ready',danger:[],treasure:null,multiplier:1});g.revision++;g.updatedAt=now;return true;}
export function validLava580(g,p,m,at=g.lastAt){return !!p&&g.phase==='play'&&g.stage==='choose'&&at>=g.phaseAt&&at<g.deadline&&at>=(p.landAt598??0)&&m.action==='choose'&&Number.isInteger(m.target)&&m.target>=0&&m.target<5&&m.target!==p.target;}
export function inputLava580(g,p,m){if(!validLava580(g,p,m))return false;p.fromPad598=p.pad;p.target=m.target;p.jumpAt598=g.lastAt;p.landAt598=g.lastAt+C.jump;p.lastSeq=Math.max(p.lastSeq,m.seq??0);emit(g,'jump',{seat:p.seat,target:p.target});return true;}
export function resolveLava580(g){
 if(g.stage!=='choose')return;g.stage='reveal';g.phaseAt=g.lastAt;g.deadline=g.lastAt+C.reveal;
 for(const p of g.players){p.pad=p.target;p.out=p.pad==null||g.eruptions598.includes(p.pad)||p.landAt598>g.lastAt;
  if(p.out){p.gain=0;p.falls++;p.streak598=0;continue;}
  const treasure=p.loot598??0;p.streak598++;
  p.gain=(100+treasure+Math.min(3,p.streak598-1)*25)*g.multiplier;p.score+=p.gain;p.survived++;if(treasure)p.treasures++;
 }for(const pad of g.eruptions598)emit(g,'eruption',{pad});
}
export function advanceLava580(g,now,inputs=new Map(),auto=new Set()){
 if(['lobby','result'].includes(g.phase))return false;resume580(g,now,inputs,['startAt','deadline','phaseAt','warnAt598'],['botAt','jumpAt598','landAt598']);let changed=false;
 while(g.lastAt+C.step<=now&&g.phase!=='result'){
  g.lastAt+=C.step;changed=true;if(g.phase==='countdown'){inputs.clear();if(g.lastAt<g.startAt)continue;g.phase='play';next(g);}
  if(g.lastAt>=g.deadline){inputs.clear();if(g.stage==='choose')resolveLava580(g);else if(g.round>=C.rounds){finish580(g);continue;}else{g.round++;next(g);}}
  if(g.stage==='choose'&&g.lastAt>=g.warnAt598&&!g.danger.length){g.danger=[...g.eruptions598];emit(g,'warning');}
  for(const p of g.players){p.auto=p.ai||auto.has(p.playerId);const list=inputs.get(p.playerId)??[];inputs.delete(p.playerId);if(g.stage!=='choose')continue;
   if(p.landAt598&&g.lastAt>=p.landAt598)p.pad=p.target;
   if(p.auto&&g.lastAt>=p.botAt){
    if(p.botPlan598==='loot'){p.botPlan598='escape';p.botAt=g.warnAt598+180+rnd(g)*360;if(rnd(g)<.7)inputLava580(g,p,{action:'choose',target:g.treasure});}
    else if(g.danger.length){const safe=[0,1,2,3,4].filter(i=>!g.danger.includes(i)),target=rnd(g)<.08?Math.floor(rnd(g)*5):safe[Math.floor(rnd(g)*safe.length)];if(inputLava580(g,p,{action:'choose',target})||target===p.target)p.botAt=g.deadline+1;}
   }
   else if(!p.auto){const future=[];for(const m of list)if(m.round==null||m.round===g.round){if((m.at??0)>g.lastAt)future.push(m);else inputLava580(g,p,m);}if(future.length)inputs.set(p.playerId,future);}
  }
  if(g.stage==='choose'&&!g.treasureTaken598.length){const landed=g.players.filter(p=>p.target===g.treasure&&p.landAt598<=g.lastAt);if(landed.length){g.treasureTaken598=landed.map(p=>p.seat);for(const p of landed){p.loot598=Math.floor(120/landed.length);emit(g,'loot',{seat:p.seat,value:p.loot598});}}}
 }g.serverAt=g.lastAt;g.updatedAt=now;if(changed)g.revision++;return changed;
}
export function publicLava580(g,selfId){return {...publicBase580(g),rules580:2,stage:g.stage,danger:[...(g.danger??[])],treasure:g.treasure,treasureTaken598:[...(g.treasureTaken598??[])],multiplier:g.multiplier,eruptions598:g.stage==='reveal'||g.phase==='result'?[...(g.eruptions598??[])]:[],eruption:g.stage==='reveal'||g.phase==='result'?g.eruption:null,players:g.players.map(({botAt,inputSeq563,...p})=>({...p,lastSeq:p.playerId===selfId?Math.max(p.lastSeq,inputSeq563??0):0}))};}
