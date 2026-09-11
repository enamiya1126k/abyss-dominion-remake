import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'../..');
const T=await import(root+'/src/battle/TwinResonance385.js');
const ui={namespace:await import(root+'/src/ui/TwinStatus385.js')};
const result=[];
for(const pair of T.RESONANCE_PAIRS385)for(const side of ['ally','enemy']){
 const roster=pair.members.map((speciesId,i)=>({id:side+i,speciesId,hp:1000,currentHp:1000,maxHp:1000,currentMp:100,maxMp:100}));const foe={id:'foe',hp:10000,currentHp:10000,maxHp:10000};const b={turn:1,party:side==='ally'?roster:[foe],enemies:side==='enemy'?roster:[foe]};let hits=0;
 const env={blocked:()=>false,opponents:()=>[foe],targetId:'foe',cue:async()=>{},hit:async()=>{hits++;return 10},hasStatus:()=>false,hasEffect:()=>false,weaken(){},boost(){},maxHp:()=>1000,hpRatio:()=>1,opponentHpRatio:()=>1,heal:async()=>0,restoreMp:async()=>({gained:0,overflow:0}),shield(){},dispel:()=>false,cleanse:()=>0};
 const states=[ui.namespace.twinStatus385(roster,{side,battle:b,compact:true})];
 for(const u of roster){assert.equal(await T.resolveTwin385(b,u,side,env),true);states.push(ui.namespace.twinStatus385(roster,{side,battle:b,compact:true}));}
 assert.match(states[0],/残り2\/2/);assert.match(states[1],/残り1\/2/);assert.match(states[2],/残り0\/2/);
 const after=hits;assert.equal(await T.resolveTwin385(b,roster[0],side,env),false);assert.equal(hits,after);
 b.turn=2;assert.match(ui.namespace.twinStatus385(roster,{side,battle:b,compact:true}),/残り2\/2/);
 assert.equal(await T.resolveTwin385(b,roster[0],side,env),true);
 result.push({pair:pair.id,side,hitsRound1:after,quota:'2→1→0→次ラウンド2',extraCallBlocked:true});
}
fs.writeFileSync(root+'/docs/build414/pair-verification.json',JSON.stringify({scope:'real pair resolver + real UI + real isolation/single-trait modules; damage and healing callbacks are fixtures; not full battle or win-rate',cases:result},null,2));console.log('pair side cases',result.length);
