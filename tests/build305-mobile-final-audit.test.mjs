import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const css=readFileSync(new URL("../src/Styles/build305-final-audit.css",import.meta.url),"utf8");
const main=readFileSync(new URL("../src/main.js",import.meta.url),"utf8");
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const gameChrome=readFileSync(new URL("../src/ui/components/GameChrome.js",import.meta.url),"utf8");

const cleanCss=css.replace(/\/\*[\s\S]*?\*\//g,"");
const compact=value=>value.replace(/\s+/g,"");

function rulesOf(source){
 return [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([,selector,body])=>({
  selector:selector.trim(),
  body,
 }));
}

function ruleWith(source,selector,description=selector){
 const rule=rulesOf(source).find(candidate=>candidate.selector.split(",").some(part=>part.trim()===selector));
 assert.ok(rule,`${description} rule must exist`);
 return rule;
}

function balancedBlock(source,marker){
 const markerAt=source.indexOf(marker);
 assert.ok(markerAt>=0,`${marker} must exist`);
 const open=source.indexOf("{",markerAt);
 assert.ok(open>=0,`${marker} block must open`);
 let depth=0;
 for(let index=open;index<source.length;index+=1){
  if(source[index]==="{")depth+=1;
  if(source[index]!=="}")continue;
  depth-=1;
  if(depth===0)return source.slice(open+1,index);
 }
 assert.fail(`${marker} block must close`);
}

function assertDeclaration(rule,pattern,message){
 assert.match(compact(rule.body),pattern,message);
}

const GRID_MODAL_CLASSES=[
 "campaign-final-modal",
 "boss-gate-modal-v2",
 "skill-reserve-modal-v2",
 "magic-circle-modal",
 "battle-status-detail-modal",
];

test("Build305 keeps all five fixed-grid dialogs out of generic card scrolling and sticky-X rules",()=>{
 const rules=rulesOf(cleanCss);
 const scrollRule=rules.find(rule=>rule.selector.includes(".game-modal")&&rule.selector.includes(">.game-modal-card")&&compact(rule.body).includes("overflow-y:auto!important"));
 const stickyRule=rules.find(rule=>rule.selector.includes(".game-modal")&&rule.selector.includes(">.game-modal-card>.modal-x")&&compact(rule.body).includes("position:sticky!important"));
 assert.ok(scrollRule,"generic scrollable modal-card rule must exist");
 assert.ok(stickyRule,"generic sticky modal-X rule must exist");
 for(const className of GRID_MODAL_CLASSES){
  assert.ok(scrollRule.selector.includes(`:not(.${className})`),`${className} must be excluded from generic card overflow`);
  assert.ok(stickyRule.selector.includes(`:not(.${className})`),`${className} must be excluded from generic sticky X`);
 }
});

test("Build305 generic dialogs honor every safe area and keep a 44px sticky close control",()=>{
 const shell=ruleWith(cleanCss,".game-modal","generic modal shell");
 for(const side of ["top","right","bottom","left"]){
  assert.match(shell.body,new RegExp(`env\\(safe-area-inset-${side}\\)`),`generic modal must honor the ${side} safe area`);
 }

 const card=rulesOf(cleanCss).find(rule=>rule.selector.includes(">.game-modal-card")&&compact(rule.body).includes("overflow-y:auto!important"));
 assertDeclaration(card,/max-height:calc\(100dvh-/,"generic modal card must remain inside the dynamic viewport");
 assertDeclaration(card,/overflow-y:auto!important/,"generic modal card must scroll vertically");
 assertDeclaration(card,/-webkit-overflow-scrolling:touch/,"generic modal card must retain iOS momentum scrolling");

 const close=rulesOf(cleanCss).find(rule=>rule.selector.includes(">.game-modal-card>.modal-x")&&compact(rule.body).includes("position:sticky!important"));
 assertDeclaration(close,/position:sticky!important/,"modal X must be sticky");
 assertDeclaration(close,/top:0!important/,"modal X must stay at the top of its scrollport");
 assertDeclaration(close,/width:44px!important/,"modal X must be 44px wide");
 assertDeclaration(close,/height:44px!important/,"modal X must be 44px high");
 assertDeclaration(close,/touch-action:manipulation/,"modal X must use direct tap handling");
});

test("Build305 landscape Home, Explore and Gauntlet own a reachable vertical scrollport",()=>{
 const landscape=balancedBlock(cleanCss,"@media(orientation:landscape) and (max-height:520px)");
 for(const selector of [".home-screen",".explore-screen",".gauntlet-walk-screen"]){
  const rule=ruleWith(landscape,selector,`${selector} landscape`);
  assertDeclaration(rule,/box-sizing:border-box/,`${selector} must include padding in its viewport height`);
  assertDeclaration(rule,/height:100dvh!important/,`${selector} must use the dynamic viewport`);
  assertDeclaration(rule,/min-height:0!important/,`${selector} must be allowed to shrink`);
  assertDeclaration(rule,/overflow-x:hidden!important/,`${selector} must not introduce horizontal scrolling`);
  assertDeclaration(rule,/overflow-y:auto!important/,`${selector} must expose clipped bottom actions by vertical scrolling`);
  assertDeclaration(rule,/safe-area-inset-left/,`${selector} must honor the landscape left inset`);
  assertDeclaration(rule,/safe-area-inset-right/,`${selector} must honor the landscape right inset`);
 }
});

test("Build305 offline Explore reserves full 44px HUD rows and controls",()=>{
 assertDeclaration(ruleWith(cleanCss,".explore-party-hud"),/grid-template-rows:44pxauto!important/,"expanded party HUD header row must be 44px");
 assertDeclaration(ruleWith(cleanCss,".explore-screen.party-hud-collapsed .explore-party-hud"),/grid-template-rows:44px!important/,"collapsed party HUD row must be 44px");

 const collapse=ruleWith(cleanCss,".explore-party-collapse");
 assertDeclaration(collapse,/height:44px!important/,"party collapse control must be 44px high");
 assertDeclaration(collapse,/min-height:44px!important/,"compact rules must not shrink the party collapse control");

 const help=ruleWith(cleanCss,".explore-command-header .resource-help");
 for(const declaration of ["width:44px!important","min-width:44px!important","height:44px!important","min-height:44px!important"]){
  assert.ok(compact(help.body).includes(declaration),`resource help must include ${declaration}`);
 }
 const commandHeader=ruleWith(cleanCss,".explore-screen-dungeon .explore-command-header");
 assertDeclaration(commandHeader,/grid-template-columns:[^;]*44px!important/,"command header must reserve a 44px help column");
});

test("Build305 primary battle commands cannot be compressed below 44px",()=>{
 const touchRule=rulesOf(cleanCss).find(rule=>{
  const selectors=rule.selector.split(",").map(value=>value.trim());
  return selectors.includes(".side-battle-v2 .battle-header button")
   &&selectors.includes(".side-battle-v2 .command-grid button");
 });
 assert.ok(touchRule,"specific main-battle header and command button rule must exist");
 assertDeclaration(touchRule,/min-height:44px!important/,"battle buttons must beat old compact 32/40px rules");
 assertDeclaration(touchRule,/touch-action:manipulation/,"battle buttons must respond directly to taps");
 const commandGrid=ruleWith(cleanCss,".side-battle-v2 .command-grid");
  assertDeclaration(commandGrid,/grid-auto-rows:minmax\(44px,auto\)!important/,"battle command rows must remain at least 44px");
});

test("Build305 fixed-grid dialogs retain their layout with a full 44px close target",()=>{
 const close=rulesOf(cleanCss).find(rule=>rule.selector.includes(".game-modal:is(")&&rule.selector.includes(">.game-modal-card>.modal-x"));
 assert.ok(close,"fixed-grid dialogs must have a dedicated close-target rule");
 for(const className of GRID_MODAL_CLASSES)assert.ok(close.selector.includes(`.${className}`),`${className} must receive the fixed-grid close target`);
 for(const declaration of ["width:44px!important","min-width:44px!important","height:44px!important","min-height:44px!important"]){
  assert.ok(compact(close.body).includes(declaration),`fixed-grid close target must include ${declaration}`);
 }
});

test("Build305 restores 44px mobile targets on compact legacy and online controls",()=>{
 const mobile=balancedBlock(cleanCss,"@media (pointer:coarse),(max-width:760px)");
 const rules=rulesOf(mobile);
 const expected=[
  ".affix-forge-header>button",
  ".online-reward-receipt header button",
  ".monster-switcher>button",
  ".complete-codex-tools button",
  ".achievement-filters button",
  ".notice-tabs button",
  ".boss-gate-tabs button",
  ".floor-boss-band-filter button",
  ".magic-circle-row button",
  ".skill-picker-filters button",
  ".party-filter-scroll button",
  ".party-tool-row select",
  ".affix-forge-slot .affix-lock-toggle",
  ".online-trade-modal button",
  ".online-trade-quantity-controls input",
  ".online-friend-actions button",
  ".online-hall-chat-bar button",
  ".online-raid-exchange article button",
 ];
 for(const selector of expected){
  const rule=rules.find(candidate=>candidate.selector.split(",").some(part=>part.trim()===selector));
  assert.ok(rule,`${selector} must have a Build305 mobile override`);
  assertDeclaration(rule,/min-height:44px!important/,`${selector} must not shrink below 44px`);
 }
});

test("Build305 Second World and Ten God full-screen scenes remain scrollable",()=>{
 const storyRule=rulesOf(cleanCss).find(rule=>{
  const selectors=rule.selector.split(",").map(value=>value.trim());
  return selectors.includes(".second-world-intro")&&selectors.includes(".ten-god-contact");
 });
 assert.ok(storyRule,"Second World and Ten God must share the full-screen scroll contract");
 assertDeclaration(storyRule,/overflow-x:hidden!important/,"story overlays must not scroll sideways");
 assertDeclaration(storyRule,/overflow-y:auto!important/,"story overlays must scroll vertically");
 assertDeclaration(storyRule,/-webkit-overflow-scrolling:touch/,"story overlays must support iOS momentum scrolling");
 for(const side of ["top","right","bottom","left"]){
  assert.match(storyRule.body,new RegExp(`env\\(safe-area-inset-${side}\\)`),`story overlays must honor the ${side} safe area`);
 }
 const actionRule=rulesOf(cleanCss).find(rule=>rule.selector.includes(".second-world-intro button")&&rule.selector.includes(".ten-god-contact button"));
 assert.ok(actionRule,"story action touch-target rule must exist");
 assertDeclaration(actionRule,/min-height:44px/,"story action buttons must be at least 44px");
});

test("Build305 removes the document-wide rapid-touch suppression",()=>{
 assert.doesNotMatch(main,/(?:document|window)\.addEventListener\(\s*["']touchend["']/,"global touchend must not prevent a second rapid iPhone tap");
 assert.doesNotMatch(main,/lastTouchEnd|lastTouchTimestamp/,"the retired global double-tap timer must not return");
});

test("Build305 separates resource exact-number taps from the dedicated help button",()=>{
 assert.doesNotMatch(gameChrome,/data-resource-help/,"resource spans must not also carry the help action");
 assert.match(gameChrome,/data-exact-number=/,"resource spans must retain exact-number feedback");
 assert.match(main,/querySelectorAll\(\s*["']\[data-exact-number\]["']\s*\)/,"resource spans must keep their exact-number toast binding");
 assert.doesNotMatch(main,/querySelectorAll\(\s*["']\[data-resource-help\]["']\s*\)/,"the removed generic help binding must not return");
 assert.match(main,/getElementById\(\s*["']resourceHelp["']\s*\)\?\.addEventListener\(\s*["']click["']\s*,\s*openResourceHelp\s*\)/,"only the dedicated help button must open the resource guide");
});

test("Build305 hides repeated play-screen versions while leaving Settings canonical",()=>{
 const versionRule=rulesOf(cleanCss).find(rule=>{
  const selectors=rule.selector.split(",").map(value=>value.trim());
  return selectors.includes(".home-screen .home-version")
   &&selectors.includes(".explore-screen .explore-version")
   &&selectors.includes(".gauntlet-walk-screen .corridor-version");
 });
 assert.ok(versionRule,"Home, Explore and Gauntlet version labels must share one cleanup rule");
 assertDeclaration(versionRule,/display:none!important/,"repeated live-play version labels must be hidden");
 assert.doesNotMatch(versionRule.selector,/settings-version/,"the canonical Settings version must stay visible");
});

test("Build305 stylesheet is loaded after Build304 and both fatal fallbacks can scroll",()=>{
 const links=[...html.matchAll(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/g)].map(match=>match[1]);
 const auditLinks=links.filter(href=>href.includes("build305-final-audit.css"));
 assert.equal(auditLinks.length,1,"Build305 final-audit stylesheet must be linked exactly once");
 const build304At=links.findIndex(href=>href.includes("build304-final.css"));
 const build305At=links.findIndex(href=>href.includes("build305-final-audit.css"));
 assert.ok(build305At>build304At,"Build305 overrides must load after Build304");

 const fallbackStyles=[...html.matchAll(/class=["']runtime-error-screen["']\s+style=["']([^"']+)["']/g)].map(match=>compact(match[1]));
 assert.equal(fallbackStyles.length,2,"both runtime error and unhandled rejection fallbacks must use the audited screen");
 for(const style of fallbackStyles){
  assert.match(style,/height:100dvh/);
  assert.match(style,/overflow:auto/);
  assert.match(style,/overflow-wrap:anywhere/);
  for(const side of ["top","right","bottom","left"]){
   assert.match(style,new RegExp(`env\\(safe-area-inset-${side}\\)`),`fatal fallback must honor the ${side} safe area`);
  }
 }
});
