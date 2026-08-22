import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";

import {APP_VERSION,SAVE_SCHEMA_VERSION} from "../src/core/config.js";
import {SaveService} from "../src/services/SaveService.js";
import {
 CONTEXT_GUIDE_STEPS,
 bumpGuideCounter,
 completeGuideStep,
 contextualGuideProgress,
 createContextualGuideState,
 guidePending,
 guideStepDone,
 normalizeContextualGuide,
 resetContextualGuide,
 setGuidePending
} from "../src/core/ContextualGuideSystem.js";

const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const main=readFileSync(join(root,"src","main.js"),"utf8");
const index=readFileSync(join(root,"index.html"),"utf8");
const css=readFileSync(join(root,"src","Styles","build199.css"),"utf8");

class MemoryStorage{constructor(){this.map=new Map()}getItem(key){return this.map.get(key)??null}setItem(key,value){this.map.set(key,String(value))}removeItem(key){this.map.delete(key)}}
globalThis.localStorage=new MemoryStorage();
globalThis.window={dispatchEvent(){}};
globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}};

assert.equal(APP_VERSION,"2.11.34");
assert.equal(SAVE_SCHEMA_VERSION,58);
assert.equal(CONTEXT_GUIDE_STEPS.length,28);
assert.equal(new Set(CONTEXT_GUIDE_STEPS.map(step=>step.id)).size,CONTEXT_GUIDE_STEPS.length);

const guide=createContextualGuideState(1);
assert.deepEqual(contextualGuideProgress(guide),{completed:0,total:28,rate:0});
assert.equal(completeGuideStep(guide,"home_dungeon"),true);
assert.equal(completeGuideStep(guide,"home_dungeon"),false);
assert.equal(guideStepDone(guide,"home_dungeon"),true);
setGuidePending(guide,"starterGacha",true);
assert.equal(guidePending(guide,"starterGacha"),true);
assert.equal(bumpGuideCounter(guide,"normalBattles"),1);
assert.equal(bumpGuideCounter(guide,"normalBattles"),2);
const normalized=normalizeContextualGuide(JSON.parse(JSON.stringify(guide)),{monsterCount:3});
assert.equal(normalized.counters.normalBattles,2);
resetContextualGuide(normalized,3);
assert.equal(normalized.initialMonsterCount,3);
assert.equal(contextualGuideProgress(normalized).completed,0);

const saves=new SaveService();
assert.equal(saves.state.settings.contextualGuide.disabled,false);
assert.equal(contextualGuideProgress(saves.state.settings.contextualGuide).completed,0);
const legacy=structuredClone(saves.state);delete legacy.settings.contextualGuide;legacy.settings.tutorialSeen={5:true};legacy.player.maxFloor=12;
assert.equal(saves.migrate(legacy).settings.contextualGuide.disabled,true);

for(const hook of[
 "ensureFirstTutorialPickup","showTutorialPickupMarker","scheduleBattleContextGuide",
 "tutorialCaptureEligible","battle.tutorialCaptureEligible?1","markNewMonsterForGuide",
 "completePartyAddGuide","starter_gacha_pull","bedRecovery","floor10_defeat"
])assert.ok(main.includes(hook),`missing build199 hook: ${hook}`);

assert.equal(main.includes("showFloorTutorial()"),false);
assert.equal(main.includes("claimDefeatTutorial()"),false);
assert.match(index,/build199\.css\?v=2\.11\.34-build199/);
assert.match(index,/ASSET_BUILD = "build199"/);
assert.match(css,/context-guide-target/);
assert.match(css,/tutorial-world-marker/);

console.log("ABYSS DOMINION build199 contextual guide regression: PASS");
