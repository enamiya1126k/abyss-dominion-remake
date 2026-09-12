import test from 'node:test';
import assert from 'node:assert/strict';
import {run} from '../tools/build422/native-harness.mjs';
import {BattleScreen} from '../src/ui/screens/BattleScreen.js';
import {cleanupSingles410} from '../src/battle/SingleTraits410.js';
import {cleanupTrial415} from '../src/battle/TrialAdaptation415.js';
const dispose=f=>{cleanupSingles410(f.b);cleanupTrial415(f.b)};
async function fixture(chapterTwo=false){
 const f=await run(['ch2_carmia','ch2_seria','ch2_rostia','ch2_althea'],['slime'],{inspect:true,enemyHp:1000,battleOptions:chapterTwo?{specialBattle:true,specialBattleType:'chapterTwo'}:{}});
 const c=f.context,u=f.party[0];f.b.auto=false;f.b.skillMenu=true;f.b.turnQueue=[{type:'ally',id:u.id},{type:'enemy',id:f.enemies[0].id}];f.b.queueIndex=0;
 let html='',renders=0;c.renderBattle=()=>{html=BattleScreen(f.b,{},c.save.state.settings,100);renders++};c.renderBattle();
 const skill=c.learnedSkills(u).find(s=>s.mp>0&&!c.isEndgameUltimate(s));assert.ok(skill);
 return {...f,c,u,skill,html:()=>html,renders:()=>renders};
}
for(const chapterTwo of [false,true])test(`chapter ${chapterTwo?2:1}: skill picker is removed before the banner; a second tap cannot spend MP twice`,async()=>{
 const f=await fixture(chapterTwo);try{
  const {c,u,skill,b}=f,mp=u.currentMp,cost=c.effectiveSkillMpCost(u,skill);
  assert.match(f.html(),/has-skill-menu/);assert.match(f.html(),/data-skill-id/);
  let release,started;const entered=new Promise(r=>started=r),hold=new Promise(r=>release=r);
  c.battleBanner=async()=>{assert.equal(b.skillMenu,false);assert.doesNotMatch(f.html(),/has-skill-menu|data-skill-id/);started();await hold};
  const first=c.command('skill',skill.id);await entered;
  assert.equal(b.busy,true);assert.equal(b.queueIndex,0);
  await c.command('skill',skill.id);release();await first;
  assert.equal(u.currentMp,mp-cost);assert.equal(b.queueIndex,1);
 }finally{dispose(f)}
});
test('rejected MP/cooldown choices keep the picker open and do not consume the turn',async()=>{
 for(const reason of ['mp','cooldown']){
  const f=await fixture();try{
   const {c,u,skill,b}=f;let alerts=0;c.alert=()=>alerts++;
   if(reason==='mp')u.currentMp=0;else c.setSkillCooldown(b,u.id,{...skill,cooldown:3});
   const mp=u.currentMp,renders=f.renders();await c.command('skill',skill.id);
   assert.equal(alerts,1);assert.equal(b.skillMenu,true);assert.match(f.html(),/has-skill-menu/);
   assert.equal(f.renders(),renders);assert.equal(u.currentMp,mp);assert.equal(b.queueIndex,0);assert.equal(b.busy,false);
  }finally{dispose(f)}
 }
});
test('hero and ultimate presentation paths also close the picker before presenting events',async()=>{
 for(const kind of ['hero','ultimate']){
  const f=await fixture();try{
   const {c,u,b}=f;let presented=false;
   const check=()=>{presented=true;assert.equal(b.skillMenu,false);assert.doesNotMatch(f.html(),/has-skill-menu|data-skill-id/)};
   // Isolate the presentation boundary of the two dedicated dispatchers;
   // ability effects are covered by the existing battle regression suite.
   c.finishCurrentAction=async()=>{};b.busy=true;
   if(kind==='hero'){
    c.heroBattleEnvironment348=()=>({events:[]});c.runHeroAllianceAction=()=>{};c.showHeroEvents348=async()=>check();
    await c.performHeroCommand348(u,'ally',f.skill);
   }else{
    c.castEndgameUltimate=()=>({ok:true,skill:{name:'test',description:'test'}});c.battleBanner=async()=>check();c.flushUltimateEvents358=async()=>{};
    await c.performUltimate358(u,'test');
   }
   assert.equal(presented,true);
  }finally{dispose(f)}
 }
});
