import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const main = read('src/main.js');
function declaration(source, name) {
  const start = source.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name);
  const rest = source.slice(start);
  const end = rest.slice(1).search(/\n(?:export )?(?:async )?function /);
  return end < 0 ? rest : rest.slice(0, end + 1);
}
function harness(mode='floor') {
  const pursuit = {encounterId:'hero-ambush-yori-1',heroId:'myth_yori',state:'pursuing',chaseSteps:0};
  const game = {running:true,paused:false,world:{campaignHeroPursuit:pursuit},player:{path:[{x:3,y:2}],p:.5}};
  const actions=[], frames=[]; let modal=null, saveOK=true;
  function button() {return {focus(){},disabled:false,hidden:false};}
  const ctx=vm.createContext({game,battle:null,Date,Math,Number,Boolean,Object,Array,
    save:{state:{settings:{exploreAutoMode:mode},player:{inRun:true}},save:()=>saveOK},
    document:{querySelector:()=>modal},
    app:{insertAdjacentHTML(){const primary=button(),flee=button(),dismiss=button();modal={primary,flee,dismiss,
      classList:{add(){}},setAttribute(){},remove(){modal=null},
      querySelector:s=>s==='[data-modal-primary]'?primary:s==='[data-hero-choice-flee]'?flee:dismiss,
      querySelectorAll:()=>[primary,flee,dismiss]};}},
    Modal:()=>'',topModal:()=>modal,requestAnimationFrame:fn=>frames.push(fn),
    campaignHeroName:()=> 'より',escapeAttribute:s=>s,showToast:s=>actions.push(['toast',s]),
    showExploreNotice:s=>actions.push(['notice',s]),refreshCampaignHeroChaseHud(){},updateExploreAutoToggleState(){},
    expeditionSnapshotFromGame:()=>({world:game.world}),persistExpeditionSnapshot:s=>structuredClone(s),
    cancelPendingExploreActions(){game.player.path=[];game.player.p=0;actions.push(['cancel']);},
    beginCampaignHeroContactBattle:p=>actions.push(['fight',p.heroId]),
    applyExploreAutoPath(){actions.push(['auto-path']);},
    armCampaignHeroEncounter:()=>true,
    CAMPAIGN_HERO_PROFILES:{myth_yori:{field:{maxPursuitPlayerSteps:24}}},
    campaignHeroTouchesPlayer:()=>false,resolveEscapedCampaignHeroPursuit:()=>actions.push(['escaped'])
  });
  for(const name of ['campaignHeroChoicePending','showCampaignHeroEncounterChoice','setExploreAutoMode','stopExploreAuto','updateCampaignHeroPursuitOnStep'])vm.runInContext(declaration(main,name),ctx);
  return {ctx,game,pursuit,actions,frames,get modal(){return modal},setSaveOK:value=>saveOK=value};
}

for(const mode of ['floor','off'])test(`encounter pauses ${mode} movement and requires a choice`,()=>{
  const h=harness(mode);assert.equal(h.ctx.showCampaignHeroEncounterChoice(),true);
  assert.equal(h.ctx.save.state.settings.exploreAutoMode,'off');assert.equal(h.game.paused,true);
  assert.equal(h.game.player.path.length,0);assert.equal(h.game.player.p,0);
  const modal=h.modal;assert.equal(modal.dismiss.hidden,true);modal._onDismiss();
  assert.equal(h.modal,modal);assert.equal(h.pursuit.playerChoice337,undefined);
  for(let step=0;step<100;step++)assert.equal(h.ctx.updateCampaignHeroPursuitOnStep(),true);
  assert.equal(h.pursuit.chaseSteps,0);assert.equal(h.actions.filter(x=>x[0]==='fight'||x[0]==='escaped').length,0);
  assert.equal(h.ctx.showCampaignHeroEncounterChoice(),false,'no duplicate modal');
});
test('fight click starts one battle, never escape, even on double click',()=>{
  const h=harness();h.ctx.showCampaignHeroEncounterChoice();const {primary,flee}=h.modal;
  primary.onclick();primary.onclick();flee.onclick();
  assert.equal(h.pursuit.playerChoice337,'fight');assert.equal(h.pursuit.state,'contact');
  assert.deepEqual(h.actions.filter(x=>x[0]==='fight'),[['fight','myth_yori']]);assert.equal(h.modal,null);
});
test('flee resumes manual pursuit rather than settling an escape',()=>{
  const h=harness();h.ctx.showCampaignHeroEncounterChoice();h.modal.flee.onclick();
  assert.equal(h.pursuit.playerChoice337,'flee');assert.equal(h.game.paused,false);
  assert.equal(h.pursuit.chaseSteps,0);assert.equal(h.ctx.save.state.settings.exploreAutoMode,'off');
  assert.equal(h.actions.some(x=>x[0]==='escaped'||x[0]==='fight'),false);
  assert.equal(h.ctx.setExploreAutoMode('floor'),'off');assert.equal(h.ctx.save.state.settings.exploreAutoMode,'off');
  h.game.world.campaignHeroPursuit=null;assert.equal(h.ctx.setExploreAutoMode('floor'),'floor','AUTO usable after encounter');
});
test('save failure leaves choice pending; retry works without duplicate battle',()=>{
  const h=harness();h.ctx.showCampaignHeroEncounterChoice();h.setSaveOK(false);h.modal.primary.onclick();
  assert.equal(h.ctx.campaignHeroChoicePending(),true);assert.equal(h.game.paused,true);assert.ok(h.modal);
  h.setSaveOK(true);h.modal.primary.onclick();assert.equal(h.actions.filter(x=>x[0]==='fight').length,1);
});
test('stale dialog cannot act after game replacement',()=>{
  const h=harness();h.ctx.showCampaignHeroEncounterChoice();h.ctx.game={running:true,world:{}};h.modal.primary.onclick();
  assert.equal(h.actions.some(x=>x[0]==='fight'),false);assert.equal(h.pursuit.playerChoice337,undefined);
});
test('offline-only gate leaves online encounters untouched',()=>{
  const h=harness();h.game.online=true;assert.equal(h.ctx.showCampaignHeroEncounterChoice(),false);
  assert.equal(h.ctx.campaignHeroChoicePending(),false);
  assert.equal(h.game.paused,false);assert.equal(h.ctx.save.state.settings.exploreAutoMode,'floor');
});
test('new spawn consumes the step; restore and movement check decision before travel',()=>{
  const h=harness();h.game.world.campaignHeroPursuit=null;assert.equal(h.ctx.updateCampaignHeroPursuitOnStep(),true);
  const update=declaration(main,'update');assert.ok(update.indexOf('campaignHeroChoicePending')<update.indexOf('transitionCampaignSection'));
  assert.match(declaration(main,'loop'),/campaignHeroChoicePending\(\).*showCampaignHeroEncounterChoice\(\)/);
  assert.match(main,/pursuit\?\.playerChoice337==="fight"&&!resumableHeroBattle\)delete pursuit.playerChoice337/);
});
test('snapshot normalizer preserves manual choice and old saves remain pending',()=>{
  const service=read('src/services/SaveService.js');
  const start=service.indexOf('function normalizeExpeditionSnapshot('),end=service.indexOf('\n/**',start);
  const ctx=vm.createContext({EXPEDITION_MAP_MAX_DIMENSION:1024,Date,Number,Object,Array,Set,Map,String,Boolean,
    plainRecord:v=>v&&typeof v==='object'&&!Array.isArray(v),
    finiteNumber:(v,f,min,max)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):f});
  vm.runInContext(service.slice(start,end),ctx);
  for(const choice of [undefined,'fight','flee']){
    const value={floor:16,world:{tiles:[[0,0],[0,0]],start:{x:0,y:0},exit:{x:1,y:1},sections:[{id:'a'}],
      campaignHeroPursuit:{encounterId:'hero-ambush-yori-1',heroId:'myth_yori',sectionId:'a',x:1,y:0,playerChoice337:choice}}};
    const normalized=ctx.normalizeExpeditionSnapshot(JSON.parse(JSON.stringify(value)));
    assert.equal(normalized.world.campaignHeroPursuit.playerChoice337,choice);
  }
});

async function branchModules(){
  const context=vm.createContext({console,Date,Math,Number,Object,Array,Set,Map,String,Boolean,JSON,structuredClone});
  // Only Campaign100's two immutable constants are needed by these modules.
  const constants=new vm.SourceTextModule('export const CAMPAIGN_MAX_FLOOR=100; export const HERO_PARTY_IDS=["myth_enami","myth_yori","myth_hide","myth_rion"];',{context});
  const hero=new vm.SourceTextModule(read('src/core/CampaignHeroEncounterSystem.js'),{context});
  await hero.link(()=>constants);await hero.evaluate();
  const branch=new vm.SourceTextModule(read('src/core/CampaignHeroBranchStorySystem.js'),{context});
  await branch.link(spec=>spec.includes('Campaign100System')?constants:hero);await branch.evaluate();
  return {H:hero.namespace,B:branch.namespace};
}
test('all four heroes × three outcomes × wounded/unhurt preserve correct party cast',async()=>{
  const {H,B}=await branchModules();
  for(const heroId of H.CAMPAIGN_HERO_IDS)for(const outcome of ['escaped','hero-victory','repelled'])for(const hpRate of [1,.6]){
    const event=H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(e=>e.heroId===heroId);
    let ledger=H.createCampaignHeroEncounterState();
    ledger=B.queueCampaignHeroAftermathStories(ledger,{encounterId:event.id,outcome,floor:event.floor,heroHpRate:hpRate}).state;
    const scene=B.campaignHeroBranchStorySceneById(ledger,`branch-party-${event.id}-${outcome}`);
    const expected=[...H.CAMPAIGN_HERO_IDS].filter(id=>outcome!=='repelled'||id!==heroId).sort();
    assert.deepEqual(Array.from(scene.characters,c=>c.id).sort(),expected,`${heroId}/${outcome}/${hpRate}`);
    for(const id of expected)assert.ok(scene.dialogue.some(l=>l.speakerId===id),`${id} speaks`);
    assert.equal(new Set(scene.characters.map(c=>c.id)).size,scene.characters.length);
  }
});
test('defeated heroes stay absent and dialogue does not promise four living members',async()=>{
  const {H,B}=await branchModules();const event=H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(e=>e.heroId==='myth_yori');
  let ledger=H.createCampaignHeroEncounterState();ledger.heroes.myth_hide.defeated=true;ledger.heroes.myth_hide.remainingHpRate=0;
  ledger=B.queueCampaignHeroAftermathStories(ledger,{encounterId:event.id,outcome:'escaped',floor:16,heroHpRate:1}).state;
  const scene=B.campaignHeroBranchStorySceneById(ledger,`branch-party-${event.id}-escaped`);
  assert.equal(scene.characters.length,3);assert.equal(scene.characters.some(c=>c.id==='myth_hide'),false);
  assert.equal(scene.dialogue.some(l=>l.speakerId==='myth_hide'),false);
  assert.equal(scene.dialogue.some(l=>l.text.includes('次は四人')),false);
});
test('Yori escape includes Hide without changing wounds, receipts or rewards',async()=>{
  const {H,B}=await branchModules();const event=H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(e=>e.heroId==='myth_yori');
  const queued=B.queueCampaignHeroAftermathStories(H.createCampaignHeroEncounterState(),{encounterId:event.id,outcome:'escaped',floor:16,heroHpRate:1});
  const before=JSON.stringify(queued.state),scene=B.campaignHeroBranchStorySceneById(queued.state,`branch-party-${event.id}-escaped`);
  assert.equal(JSON.stringify(queued.state),before);assert.equal(scene.characters.length,4);
  assert.ok(scene.dialogue.some(l=>l.speakerId==='myth_hide'&&l.text.includes('配置、忘れてました')));
  assert.equal(B.queueCampaignHeroAftermathStories(queued.state,{encounterId:event.id,outcome:'escaped',floor:16,heroHpRate:1}).added,0);
});
test('Build337 hero modules remain loaded under the Build338 entry point',()=>{
  assert.match(read('index.html'),/const ASSET_BUILD = "build338"/);
  assert.match(read('index.html'),/build337-hero-choice\.css\?v=3\.1\.18-build337/);
  assert.match(main,/CampaignHeroBranchStorySystem\.js\?v=3\.1\.18-build337/);
  assert.match(read('src/core/CampaignStoryArchiveSystem.js'),/CampaignHeroBranchStorySystem\.js\?v=3\.1\.18-build337/);
  assert.match(read('src/core/config.js'),/SAVE_SCHEMA_VERSION=84;/,'no destructive migration');
});
