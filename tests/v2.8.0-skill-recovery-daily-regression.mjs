import assert from"node:assert/strict";
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";

import{APP_VERSION,SAVE_SCHEMA_VERSION}from"../src/core/config.js";
import{skillEffectDetails,skillEffectSummary}from"../src/battle/SkillSystem.js";
import{DAILY_NOTICE_GIFT,tokyoNoticeDayKey,dailyNoticeGiftStatus,claimDailyNoticeGift}from"../src/core/NoticeSystem.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const main=read("src/main.js"),battleScreen=read("src/ui/screens/BattleScreen.js"),css=read("src/Styles/v2.6.0.css"),index=read("index.html");

assert.equal(APP_VERSION,"2.10.0");
assert.equal(SAVE_SCHEMA_VERSION,55);
assert.match(index,/ASSET_VERSION = "2\.10\.0"/);

const specification=skillEffectDetails({damageClass:"magic",power:1.2,hits:3,allEnemies:true,defenseIgnore:.25,status:{id:"poison",chance:.65,turns:3,power:.04},effects:[{kind:"defDown",value:.2,turns:3,enemy:true}]});
assert.ok(specification.some(line=>line.includes("魔法ATKの120%")&&line.includes("3Hit")&&line.includes("合計 360%")));
assert.ok(specification.some(line=>line.includes("魔法DEFを25%無視")));
assert.ok(specification.some(line=>line.includes("毒：成功率65%")&&line.includes("毎ターン最大HPの4%")));
assert.ok(specification.some(line=>line.includes("DEF低下")&&line.includes("−20%")));
assert.match(skillEffectSummary({type:"allHeal",target:"味方全体",heal:.35}),/味方全体のHPを最大HPの35%回復/);

assert.equal(tokyoNoticeDayKey("2026-08-14T14:59:59.000Z"),"2026-08-14");
assert.equal(tokyoNoticeDayKey("2026-08-14T15:00:00.000Z"),"2026-08-15");
const state={player:{crystals:7},inventory:{captureCrystals:2},notices:{readIds:[]}};
const dayOne="2026-08-14T15:00:00.000Z",dayTwo="2026-08-15T15:00:00.000Z";
assert.equal(dailyNoticeGiftStatus(state,dayOne).available,true);
assert.equal(claimDailyNoticeGift(state,dayOne).ok,true);
assert.equal(state.inventory.captureCrystals,2+DAILY_NOTICE_GIFT.captureCrystals);
assert.equal(state.player.crystals,7+DAILY_NOTICE_GIFT.crystals);
assert.equal(claimDailyNoticeGift(state,dayOne).ok,false,"same-day double claim must be rejected");
assert.equal(dailyNoticeGiftStatus(state,dayTwo).available,true,"the next Tokyo day has exactly one new gift");
assert.equal(state.inventory.captureCrystals,7,"unclaimed days must not be auto-awarded or accumulated");

assert.match(main,/foundCaptureCrystal=Math\.random\(\)<\.01/);
assert.match(main,/if\(roll<\.005\)/,"the existing bone key rate must remain unchanged");
assert.match(main,/else if\(roll<\.24\)/,"the existing bone GOLD threshold must remain unchanged");
assert.match(main,/data-claim-daily-gift/);
assert.match(main,/function queueBattleRecovery/);
assert.match(main,/function animateBattleRecoveryGauge/);
assert.match(main,/await animateHit\(result\.monster\.id,false\)/,"ally periodic damage must use the hit feedback too");
assert.match(battleScreen,/battle-skill-spec/);
assert.doesNotMatch(battleScreen,/class="battle-bar mp enemy-mp"/,"enemy MP remains internal and must not consume battle-card space");
assert.match(css,/battle-hp-recover-pulse/);
assert.match(css,/battle-mp-recover-pulse/);
assert.match(css,/notice-gift-claim/);

console.log("ABYSS DOMINION v2.9.0 skill/recovery/daily regression: PASS");
