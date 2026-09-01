import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join} from "node:path";

const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const main=readFileSync(join(root,"src/main.js"),"utf8");
const battleScreen=readFileSync(join(root,"src/ui/screens/BattleScreen.js"),"utf8");
const index=readFileSync(join(root,"index.html"),"utf8");

test("build254 cache boundary is active",()=>{
 assert.match(index,/ASSET_VERSION = "2\.11\.82"/);
 assert.match(index,/ASSET_BUILD = "build258"/);
 assert.match(main,/BattleScreen\.js\?v=2\.11\.82-build258/);
});

test("offline special battles expose an enabled retreat control",()=>{
 assert.match(battleScreen,/const offlineExit=battle\.specialBattle\?`<button id="escapeBattle"[^`]*撤退/);
 assert.match(battleScreen,/battle\.escapePending\?"撤退待ち":"撤退"/);
 assert.match(battleScreen,/battle\.onlineMode\?onlineExit:offlineExit/);
 assert.match(battleScreen,/onlineMode==="explore"\?'<button type="button" data-online-return>帰還<\/button>':'<button type="button" disabled>逃走不可<\/button>'/);
 assert.doesNotMatch(battleScreen,/battle\.specialBattle\?`<button disabled>逃走不可<\/button>`/);
});

test("special retreat is confirmed, queued safely, and survives reload",()=>{
 assert.match(main,/async function requestEscape\(\)\{\s*if\(!battle\|\|battle\.escapePending\)return;/);
 assert.doesNotMatch(main,/battle\.escapePending\|\|battle\.specialBattle/);
 assert.match(main,/if\(special&&!confirm\("この戦闘から撤退しますか？/);
 assert.match(main,/現在の行動後に撤退します/);
 assert.match(main,/escapePending:Boolean\(battle\.escapePending\)/);
});

test("special retreat exits deterministically without current-battle rewards",()=>{
 const resolveStart=main.indexOf("async function resolveEscape()");
 const randomEscape=main.indexOf("if(Math.random()<.65)",resolveStart);
 const specialEscape=main.indexOf("if(battle.specialBattle)return retreatSpecialBattle();",resolveStart);
 assert.ok(resolveStart>=0&&specialEscape>resolveStart&&specialEscape<randomEscape);
 assert.match(main,/function retreatSpecialBattle\(\)\{/);
 assert.match(main,/if\(type==="gauntlet"\)[\s\S]*settleGauntletRun\("return"\)/);
 assert.match(main,/restorePartyVitals\(prior\);clearPartySynergy\(\);clearBattleCheckpoint\(\)/);
 assert.match(main,/if\(type==="floorBoss"\)\{openEndgameTrialPicker\(\)/);
 assert.doesNotMatch(main.slice(main.indexOf("function retreatSpecialBattle()"),main.indexOf("function finishSpecialBattle(won)")),/award|recordEmergencyResult|recordSpecialBattleSettlement/);
});

test("normal exploration escape keeps its original 65 percent roll",()=>{
 assert.match(main,/if\(Math\.random\(\)<\.65\)\{clearBattleCheckpoint\(\)/);
});

test("endgame briefing no longer claims retreat is impossible",()=>{
 assert.match(main,/戦闘中はいつでも撤退できます。撤退した戦闘の報酬は獲得できません。/);
 assert.doesNotMatch(main,/味方は開始時に全回復。逃走不可。敗北ペナルティはありません。/);
});
