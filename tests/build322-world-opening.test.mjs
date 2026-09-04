import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{applyLionelAvatarIdentity,isLionelAvatar,lionelAvatarProtectionReason,normalizeLionelAvatarState}from"../src/core/CampaignProtagonistSystem.js";

test("Build322 gives fresh and legacy saves one protected Lionel avatar",()=>{
 const fresh={monsters:[],campaign100:{}},created={id:"lionel-new",speciesId:"slime",nickname:"リオネル"};
 const receipt=normalizeLionelAvatarState(fresh,{createAvatar:()=>created});
 assert.equal(receipt.created,true);assert.equal(fresh.monsters.length,1);assert.equal(isLionelAvatar(created),true);assert.equal(created.locked,true);assert.equal(created.releaseProtected,true);assert.equal(created.synthesisProtected,true);assert.equal(fresh.campaign100.lionelAvatarMonsterId,"lionel-new");
 const legacy={monsters:[{id:"starter",speciesId:"slime",nickname:"ぷるん"}],campaign100:{}};
 const migrated=normalizeLionelAvatarState(legacy,{createAvatar:()=>assert.fail("the legacy starter should be migrated")});
 assert.equal(migrated.migrated,true);assert.equal(legacy.monsters[0].nickname,"リオネル");assert.equal(legacy.monsters.length,1);
 const custom={id:"custom",speciesId:"slime",nickname:"マイスライム"};applyLionelAvatarIdentity(custom);assert.equal(custom.nickname,"マイスライム");assert.match(lionelAvatarProtectionReason(custom),/逃す・合成素材/);
});

test("Build322 wires the long opening, corrected Home HUD and deep passage",async()=>{
 const[index,config,home,main,save,story,css]=await Promise.all([
  "../index.html","../src/core/config.js","../src/ui/screens/HomeScreen.js","../src/main.js","../src/services/SaveService.js","../src/core/CampaignStorySystem.js","../src/Styles/build322-world.css"
 ].map(path=>readFile(new URL(path,import.meta.url),"utf8")));
 assert.match(index,/build322-world\.css\?v=3\.1\.3-build322/);assert.match(index,/const ASSET_BUILD = "build322"/);assert.match(config,/SAVE_SCHEMA_VERSION=80/);assert.match(config,/APP_VERSION="3\.1\.3"/);
 assert.match(css,/home-server-status\{top:11px!important\}/);assert.match(css,/white-space:nowrap!important/);assert.match(home,/remainingDays=Math\.max\(1,11-day\)/);assert.match(home,/勇者、魔王城へ到達/);
 const portal=main.slice(main.indexOf("function drawCampaignSectionPortal"),main.indexOf("function drawCampaignKey",main.indexOf("function drawCampaignSectionPortal")));
 assert.match(portal,/fadeSlices=layers\*2/);assert.match(portal,/Math\.pow\(t1,1\.72\)/);assert.match(portal,/passageDepth=Math\.max\(3\.15/);assert.doesNotMatch(portal,/targetTheme|minimapFloor|createLinearGradient|drawExploreParticles/);
 const opening=story.slice(story.indexOf("export const CAMPAIGN_STORY_OPENING="),story.indexOf("export const CAMPAIGN_STORY_SCENES="));
 assert.equal((opening.match(/\bline\(/g)??[]).length,30);assert.match(story,/lastSurvivorIds:Object\.freeze\(\["sairan","lionel"\]\)/);assert.match(opening,/玉座は旧世界の残滓を新世界へ縫い留める楔/);assert.match(opening,/stageEffect:"lionel-seal"/);assert.match(opening,/stageEffect:"lionel-slime"/);
 assert.match(story,/CAMPAIGN_STORY_OPENING_VERSION=2/);assert.match(story,/openingVersion<CAMPAIGN_STORY_OPENING_VERSION/);assert.match(main,/campaign-story-lionel-avatar/);assert.match(css,/data-story-effect="lionel-slime"/);
 assert.match(save,/applyLionelAvatarIdentity\(createMonster\("slime",\{nickname:"リオネル"/);assert.match(save,/normalizeLionelAvatarState\(s,\{createAvatar/);
 assert.match(main,/function workshopProtected\(monster\).*isLionelAvatar\(monster\)/);assert.match(main,/function selectableMonsters\(\).*isLionelAvatar\(m\)/);assert.match(main,/function releaseMonster\(m\)\{if\(isLionelAvatar\(m\)\)/);assert.match(main,/limitBreakCandidates\(m\).*isLionelAvatar\(x\)/);
});
