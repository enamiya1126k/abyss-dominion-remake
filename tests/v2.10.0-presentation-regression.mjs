import assert from"node:assert/strict";
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";

import{APP_VERSION,SAVE_SCHEMA_VERSION}from"../src/core/config.js";
import{applyEnemyDamage}from"../src/battle/BattleRules.js";
import{MAGIC_CIRCLES,rollEnemyMagicCircle}from"../src/core/MagicCircleSystem.js";
import{NOTICE_DEFINITIONS,markNoticeRead,unreadNoticeIds}from"../src/core/NoticeSystem.js";
import{createMonster,calculatedStats}from"../src/models/Monster.js";
import{homeCriticalVitals}from"../src/ui/screens/HomeScreen.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const index=read("index.html"),main=read("src/main.js"),battleScreen=read("src/ui/screens/BattleScreen.js"),css=read("src/Styles/v2.10.0.css");

assert.equal(APP_VERSION,"2.10.0");
assert.equal(SAVE_SCHEMA_VERSION,55,"presentation and balance changes remain save-compatible");
assert.match(index,/ASSET_VERSION = "2\.10\.0"/);
assert.match(index,/v2\.10\.0\.css\?v=2\.10\.0/);

const mimic={id:"mimic",hp:5,maxHp:5,enemyMimicArmor:true};
const mimicBattle={turn:1,turnQueue:[],queueIndex:0};
assert.equal(applyEnemyDamage(mimicBattle,mimic,999,{sourceId:"ally-a"}).damage,1);
assert.equal(applyEnemyDamage(mimicBattle,mimic,999,{sourceId:"ally-a"}).damage,0,"the same ally is fully guarded for the rest of the round");
assert.equal(applyEnemyDamage(mimicBattle,mimic,999,{sourceId:"ally-b"}).damage,1);
assert.equal(applyEnemyDamage(mimicBattle,mimic,999,{sourceId:"ally-c"}).damage,1);
assert.equal(applyEnemyDamage(mimicBattle,mimic,999,{sourceId:"ally-d"}).damage,1);
assert.equal(applyEnemyDamage(mimicBattle,mimic,999,{sourceId:"extra-source"}).damage,0,"mimic takes at most four chip damage per round");
mimicBattle.turn=2;
assert.equal(applyEnemyDamage(mimicBattle,mimic,999,{sourceId:"ally-a"}).damage,1,"each ally can chip again next round");
assert.equal(mimic.hp,0);

const allCombatIds=MAGIC_CIRCLES.filter(circle=>circle.id!=="none").map(circle=>circle.id),remaining=allCombatIds.at(-1),rolled=rollEnemyMagicCircle(100,{force:true,excludeIds:allCombatIds.slice(0,-1),random:()=>0});
assert.equal(rolled.id,remaining,"enemy magic-circle rerolls must honor the party uniqueness set");

const noticeState={player:{crystals:0},inventory:{captureCrystals:0},monsters:[],party:[]};
const unreadBefore=unreadNoticeIds(noticeState);
assert.ok(unreadBefore.includes(NOTICE_DEFINITIONS[0].id));
markNoticeRead(noticeState,NOTICE_DEFINITIONS[0].id);
assert.ok(!unreadNoticeIds(noticeState).includes(NOTICE_DEFINITIONS[0].id));

const monster=createMonster("slime",{currentHp:null,currentMp:null,ivs:{hp:100,atk:100,def:100,spd:100},traitId:"steady",personalityId:"brave",colorId:"violet"}),maximum=calculatedStats(monster).hp;
assert.equal(homeCriticalVitals(monster).critical,false);
monster.currentHp=1;
assert.equal(homeCriticalVitals(monster).critical,true,"home switches to the down frame at critical HP");
monster.currentHp=maximum;monster.currentMp=0;
assert.equal(homeCriticalVitals(monster).critical,true,"home also treats critical MP as exhausted");

assert.match(main,/Math\.max\(1300,duration\)/,"magic-circle results must remain readable as long as skill banners");
assert.match(main,/999・即死確定/);
assert.match(main,/magicCircleInstantDeath\(victim,monster,\{force:true\}\)/);
assert.match(main,/Math\.random\(\)<\.72\?1:2/,"enemy mimic attacks may hit only one or two allies");
assert.match(main,/function playBattleResurrectionFx/);
assert.match(main,/全軍復活/);
assert.match(main,/連鎖蘇生/);
assert.match(main,/data-notice-filter/);
assert.match(main,/ensureUniqueEnemyMagicCircles\(entries\.map\(makeBattleEnemy\)/);
assert.match(main,/enemyLoadoutVersion:4/);
assert.match(main,/prepared=e\.enemyLoadoutVersion===4\?e:prepareEnemyEntry/,"current v4 loadouts stay stable while older layouts reroll onto the stronger curve");
assert.doesNotMatch(battleScreen,/class="battle-bar mp enemy-mp"/);
assert.match(battleScreen,/ally-circle-intent/);
assert.match(css,/magic-circle-activation-copy strong/);
assert.match(css,/resurrection-pillar/);
assert.match(css,/home-rest-callout/);
assert.match(css,/home-notice-card\[hidden\]/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);

console.log("ABYSS DOMINION v2.10.0 presentation regression: PASS");
