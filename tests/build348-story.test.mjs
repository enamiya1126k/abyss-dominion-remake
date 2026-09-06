import test from 'node:test';
import assert from 'node:assert/strict';
import * as H from '../src/core/CampaignHeroEncounterSystem.js';
import * as B from '../src/core/CampaignHeroBranchStorySystem.js';
const ids=['myth_yori','myth_rion','myth_hide','myth_enami'];
function scenario(id,{prior=1,hp=prior,battled=false,outcome='escaped'}={}){
 let ledger=H.createCampaignHeroEncounterState();ledger.heroes[id].remainingHpRate=prior;ledger.heroes[id].lowestHpRate=prior;const d=H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(d=>d.heroId===id);
 ledger=B.acknowledgeCampaignHeroBranchStoryScene(ledger,{sceneId:`branch-prelude-${d.id}`}).state;ledger=H.activateCampaignHeroEncounter(ledger,{encounterId:d.id,floor:d.floor}).state;
 assert.equal(ledger.events[d.id].entryHpRate348,prior);
 ledger.events[d.id].battled348=battled;
 // Real save checkpoints record the wound before settlement.
 if(battled)ledger=H.recordCampaignHeroWound(ledger,{heroId:id,hpRate:hp,woundId:'checkpoint'}).state;
 ledger=JSON.parse(JSON.stringify(ledger));
 ledger=H.settleCampaignHeroEncounter(ledger,{encounterId:d.id,resultId:'result',heroId:id,outcome,floor:d.floor,...(battled?{hpRate:hp,battled:true}:{})}).state;
 ledger=B.queueCampaignHeroAftermathStories(ledger,{encounterId:d.id,outcome,floor:d.floor,heroHpRate:hp}).state;
 const scenes=['result','report','party'].map(part=>B.campaignHeroBranchStorySceneById(ledger,`branch-${part}-${d.id}-${outcome}`));return {ledger,d,scenes,text:scenes.flatMap(s=>s.dialogue.map(l=>l.text)).join('\n')};
}
test('four heroes: untouched escape never claims damage, defeat, repairs, or fighting',()=>{
 for(const id of ids){const {text,ledger,d}=scenario(id);assert.match(text,/戦闘を回避/);assert.match(text,/攻撃は加えていません/);assert.doesNotMatch(text,/ボコられ|傷を刻|思ったより強|その一撃|損傷値は想定|交戦した/);assert.equal(ledger.events[d.id].newHurtPercent348,0);assert.equal(ledger.events[d.id].battled348,false);}
});
test('four heroes: fighting escape without fresh wounds is not described as avoiding combat',()=>{
 for(const id of ids){const {text,ledger,d}=scenario(id,{battled:true});assert.match(text,/交戦した後、撤退/);assert.doesNotMatch(text,/攻撃は加えていません|戦闘を回避し|戦う前に逃げ/);assert.equal(ledger.events[d.id].battled348,true);}
});
test('four heroes: prior wounds are not credited as new player damage on escape or hero victory',()=>{
 for(const id of ids)for(const outcome of ['escaped','hero-victory']){const {text,ledger,d}=scenario(id,{prior:.7,hp:.7,battled:outcome!=='escaped',outcome});assert.match(text,/以前から残る30%/);assert.doesNotMatch(text,/新たに30%|その一撃は前より深|修理で利益はゼロ|今回は損傷ゼロ/);assert.equal(ledger.events[d.id].priorHurtPercent348,30);assert.equal(ledger.events[d.id].newHurtPercent348,0);}
});
test('four heroes: fresh damage is measured from encounter entry even after a checkpoint; history retains it',()=>{
 for(const id of ids){const {text,ledger,d,scenes}=scenario(id,{prior:.7,hp:.5,battled:true});assert.match(text,/新たに20%/);assert.match(text,/以前の30%/);assert.match(text,/残る損傷は50%/);assert.equal(ledger.events[d.id].newHurtPercent348,20);const restored=B.normalizeCampaignHeroBranchStoryState(JSON.parse(JSON.stringify(ledger)));assert.deepEqual(B.campaignHeroBranchStorySceneById(restored,scenes[2].id),scenes[2]);}
});
test('defeated hero never speaks in the camp; no false reappearance in archive',()=>{
 for(const id of ids){const {scenes,ledger}=scenario(id,{hp:0,battled:true,outcome:'repelled'});assert.equal(ledger.heroes[id].defeated,true);assert.ok(scenes[2].dialogue.every(l=>l.speakerId!==id));assert.ok(scenes[2].characters.every(c=>c.id!==id));}
});
test('legacy escaped history with only cumulative wounds avoids asserting a new attack',()=>{
 const {ledger,d}=scenario('myth_yori',{prior:.7});for(const record of [ledger.events[d.id],...ledger.branchStories323.history,...ledger.branchStories323.pending]){delete record.entryHpRate348;delete record.battled348;delete record.newHurtPercent348;delete record.priorHurtPercent348;}const restored=B.normalizeCampaignHeroBranchStoryState(JSON.parse(JSON.stringify(ledger))),scene=B.campaignHeroBranchStorySceneById(restored,`branch-party-${d.id}-escaped`),text=scene.dialogue.map(l=>l.text).join('\n');assert.doesNotMatch(text,/ボコられ|新たに30%/);assert.match(text,/以前から残る30%/);
});
