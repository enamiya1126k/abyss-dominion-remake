import test from 'node:test';
import assert from 'node:assert/strict';
import {run} from '../tools/build422/native-harness.mjs';
import {SaveService} from '../src/services/SaveService.js';
import {SAVE_KEY} from '../src/core/config.js';
import {calculatedStats} from '../src/models/Monster.js';
import {cleanupTrial415} from '../src/battle/TrialAdaptation415.js';
import {cleanupSingles410} from '../src/battle/SingleTraits410.js';
import {chapterTwoState,beginChapterTwoRun,beginChapterTwoEncounter} from '../src/chapterTwo/ChapterTwoSystem.js';
import {buildTurnQueue} from '../src/battle/TurnSystem.js';

const ids=['ch2_ryune','ch2_rose','ch2_mirea','ch2_viola'];
async function fixture(options={}){
 localStorage.removeItem(SAVE_KEY);
 const f=await run(ids,['slime'],{inspect:true,circles:true,level:1000,...options});
 const service=new SaveService();service.state=f.context.save.state;f.context.save=service;
 service.state.settings.autoBattle=false;service.state.settings.exploreAutoMode='off';f.b.auto=false;
 return f;
}
function dispose(f){cleanupSingles410(f.context.battle);cleanupTrial415(f.context.battle);}

for(const [label,options] of [
 ['first chapter',{}],
 ['chapter two',{specialBattle:true,specialBattleType:'chapterTwo',chapterTwoToken:'qa416',chapterTwoEncounter:'forest_boss'}],
 ['manual trial',{specialBattle:true,specialBattleType:'emergency',manualEndgameChallenge:true,preludeChoiceId:'manifest100'}]
])for(const committed of [false,true])test(`${label}: real checkpoint → SaveService migration → resume preserves HP, MP, effects and turn ownership (${committed})`,async()=>{
 const f=await fixture({battleOptions:options}),c=f.context,s=c.save.state;
 if(options.specialBattleType==='chapterTwo'){seedChapter(f);}
 buildTurnQueue(f.b);f.b.queueIndex=1;f.b.turn=7;f.b.actionCommitted=committed;
 f.b.pairPreparation415={version:1,markers:[{side:'ally',pairId:'qa',targetId:'e0',kind:'spdDown',round:7}]};
 f.b.allyEffects[f.party[0].id]=[{kind:'atkUp',value:.2,turns:2}];
 f.b.signatureShields[f.party[1].id]=1357;
 f.party.forEach((u,i)=>{u.currentHp=Math.floor(calculatedStats(u).hp*(.35+i*.1));u.currentMp=Math.floor(u.currentMp*.6);});
 const expected=f.party.map(u=>({id:u.id,hp:u.currentHp,mp:u.currentMp,max:calculatedStats(u).hp}));
 f.nativeSave();assert.ok(s.activeBattle);assert.equal(s.activeBattle.actionCommitted,committed);
 const persisted=localStorage.getItem(SAVE_KEY);assert.ok(persisted.length>1000);
 dispose(f);c.save=new SaveService();assert.equal(c.save.loadFailed,false);
 let finished=0,continued=0;const callbacks=[];
 c.setTimeout=fn=>{callbacks.push(fn);return callbacks.length};
 // Rendering is replaced only at the presentation boundary; run its production
 // preparation hook, which native renderBattle invokes before mounting the DOM.
 c.renderBattle=()=>c.prepareBattleUltimates358();
 c.finishCurrentAction=()=>{finished++};c.continueBattleFlow=()=>{continued++};
 assert.equal(f.nativeResume(),true);
 assert.deepEqual(c.battle.party.map(u=>({id:u.id,hp:u.currentHp,mp:u.currentMp,max:calculatedStats(u).hp})),expected);
 assert.equal(c.battle.turn,7);assert.equal(c.battle.queueIndex,1);
 assert.deepEqual(JSON.parse(JSON.stringify(c.battle.pairPreparation415)),JSON.parse(JSON.stringify(f.b.pairPreparation415)));
 assert.equal(c.battle.allyEffects[f.party[0].id][0].turns,2);assert.equal(c.battle.signatureShields[f.party[1].id],1357);
 assert.equal(c.battle.skillMenu,false);assert.equal(c.battle.itemMenu,false);
 callbacks.forEach(fn=>fn());assert.equal(finished,Number(committed));assert.equal(continued,Number(!committed));
 dispose(f);
});

function presentResults(f){
 const c=f.context,primary={},modal={querySelector:()=>primary,remove(){},classList:{add(){}}};let html='';
 Object.assign(c,{audio:{setScene(){},sfx(){}},topModal:()=>modal,openBattleContributionReport:(_,reveal)=>reveal(),persistExpeditionSnapshot(){},showToast(){}});
 c.app.insertAdjacentHTML=(_,value)=>{html=value};
 return {html:()=>html,primary};
}
test('normal victory grants gold, EXP, kills and history only once while its result remains open',async()=>{
 const f=await fixture({battleOptions:{memoryBattle:true,memorySourceFloor:100}}),c=f.context;
 presentResults(f);f.enemies.forEach(e=>e.hp=0);c.win=f.nativeWin;
 c.win(false,null);const once=JSON.stringify(c.save.state);c.win(false,null);
 assert.ok(JSON.stringify(c.save.state)===once,'second settlement changed rewards or history');assert.equal(c.battle.resultSettled,true);assert.equal(c.save.state.activeBattle,undefined);
 dispose(f);
});
test('victory result HP and level gains use ordinary post-battle stats',async()=>{
 const f=await fixture({battleOptions:{memoryBattle:true,memorySourceFloor:100}}),c=f.context,ui=presentResults(f);
 f.party[0].currentHp=Math.floor(calculatedStats(f.party[0]).hp*.5);f.enemies.forEach(e=>e.hp=0);
 f.nativeWin(false,null);
 for(const u of f.party)assert.ok(ui.html().includes(`HP ${u.currentHp}/${calculatedStats(u).hp}`),u.id);
 dispose(f);
});

test('storage quota failure keeps the last valid save and retry writes the current state once',()=>{
 localStorage.removeItem(SAVE_KEY);const s=new SaveService();s.state.player.gold=12345;s.save();const previous=localStorage.getItem(SAVE_KEY),set=localStorage.setItem,error=console.error;
 try{console.error=()=>{};localStorage.setItem=()=>{throw Object.assign(new Error('full'),{name:'QuotaExceededError'})};s.state.player.gold+=700;assert.equal(s.save(),false);assert.equal(localStorage.getItem(SAVE_KEY),previous);assert.equal(s.state.player.gold,13045);}
 finally{localStorage.setItem=set;console.error=error;}
 assert.equal(s.save(),true);assert.equal(new SaveService().state.player.gold,13045);
});

test('1 battle HP remains alive through serialization and removing large trial multipliers; KO remains zero',async()=>{
 const f=await fixture({circles:false,battleOptions:{specialBattle:true,specialBattleType:'emergency',manualEndgameChallenge:true,preludeChoiceId:'manifest100'}});
 f.party[0].currentHp=1;f.party[1].currentHp=0;
 const copy=JSON.parse(JSON.stringify(f.party));assert.equal(copy[0].currentHp,1);assert.equal(copy[1].currentHp,0);
 dispose(f);assert.equal(f.party[0].currentHp,1);assert.equal(f.party[1].currentHp,0);
});

test('native manual skill picker waits; choosing an authored skill consumes MP and exactly one turn',async()=>{
 const f=await fixture({circles:false}),c=f.context,u=f.party[0];
 f.b.turnQueue=[{type:'ally',id:u.id},{type:'enemy',id:f.enemies[0].id}];f.b.queueIndex=0;
 const skill=c.learnedSkills(u).find(s=>s.mp>0&&!c.isEndgameUltimate(s)),mp=u.currentMp,cost=c.effectiveSkillMpCost(u,skill);
 await f.nativeContinue();assert.equal(f.b.queueIndex,0);assert.equal(u.currentMp,mp);
 for(let i=0;i<10;i++){await c.command('skill');assert.equal(f.b.skillMenu,true);assert.equal(f.b.queueIndex,0);assert.equal(u.currentMp,mp);}
 await Promise.all([c.command('skill',skill.id),c.command('skill',skill.id)]);
 assert.equal(u.currentMp,mp-cost);assert.equal(f.b.queueIndex,1);dispose(f);
});

test('native auto wait honors switching to manual before committing the queued action',async()=>{
 const f=await fixture({circles:false}),c=f.context,u=f.party[0];
 f.b.turnQueue=[{type:'ally',id:u.id},{type:'enemy',id:f.enemies[0].id}];f.b.queueIndex=0;f.b.auto=true;
 c.wait=async()=>{f.b.auto=false};const mp=u.currentMp;
 await f.nativeContinue();assert.equal(f.b.queueIndex,0);assert.equal(u.currentMp,mp);assert.equal(f.b.actionCommitted??false,false);
 c.wait=async()=>{};f.b.auto=true;await f.nativeContinue();assert.equal(f.b.queueIndex,1);dispose(f);
});

function seedChapter(f){
 const s=f.context.save.state;s.player.inRun=false;s.campaign100.finalCompleted=true;chapterTwoState(s).introComplete=true;
 assert.equal(beginChapterTwoRun(s).ok,true);s.chapterTwo376.run.room=1;
 const pending=beginChapterTwoEncounter(s,'patrol');assert.equal(pending.ok,true);
 f.b.specialBattle=true;f.b.specialBattleType='chapterTwo';f.b.chapterTwoToken=pending.token;f.b.chapterTwoEncounter='patrol';
}
test('memory defeat rescues every member at HP1 and does not charge a second loss',async()=>{
 const f=await fixture({circles:false,battleOptions:{memoryBattle:true,memorySourceFloor:100}}),c=f.context;
 presentResults(f);f.party.forEach(u=>u.currentHp=0);c.lose=f.nativeLose;
 c.lose();for(const u of f.party)assert.equal(u.currentHp,1,u.id);
 const once=JSON.stringify(c.save.state);c.lose();assert.ok(JSON.stringify(c.save.state)===once);
 dispose(f);
});
for(const failure of [false,true])test(`chapter victory saves the same normal HP displayed after rewards, including storage retry (${failure})`,async()=>{
 const f=await fixture({circles:false,battleOptions:{specialBattle:true,specialBattleType:'chapterTwo'}}),c=f.context;
 seedChapter(f);const ui=presentResults(f);c.render=()=>{};c.chapterTwoAutoModal380=()=>{};
 f.party.forEach((u,i)=>{u.currentHp=Math.floor(calculatedStats(u).hp*(i===2?1:.5));c.applyTotalExperience(u,c.totalExperience(u)+c.expNeed(u)-1);});
 f.enemies.forEach(e=>e.hp=0);f.nativeSave();
 const gold=c.save.state.player.gold,levels=f.party.map(u=>u.level),persist=c.save.save.bind(c.save);
 if(failure)c.save.save=()=>false;
 c.finishChapterTwoBattle(true);
 if(failure){assert.equal(c.save.state.player.gold,gold);assert.ok(c.battle);c.save.save=persist;ui.primary.onclick();}
 assert.equal(c.battle,null);assert.ok(c.save.state.player.gold>gold);
 for(const u of c.save.state.monsters)assert.ok(u.currentHp<=calculatedStats(u).hp);
 const expected=c.save.state.monsters.map(u=>({id:u.id,hp:u.currentHp,mp:u.currentMp,level:u.level}));
 const reloaded=new SaveService();assert.deepEqual(reloaded.state.monsters.filter(u=>ids.includes(u.id)).map(u=>({id:u.id,hp:u.currentHp,mp:u.currentMp,level:u.level})),expected);
 assert.equal(reloaded.state.activeBattle,undefined);
 assert.ok(expected.some((u,i)=>u.level>levels[i]));
});
