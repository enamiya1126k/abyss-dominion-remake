import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const css=readFileSync(new URL("../src/Styles/build306-ui.css",import.meta.url),"utf8");
const main=readFileSync(new URL("../src/main.js",import.meta.url),"utf8");
const explore=readFileSync(new URL("../src/ui/screens/ExploreScreen.js",import.meta.url),"utf8");
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const cleanCss=css.replace(/\/\*[\s\S]*?\*\//g,"");
const compact=value=>value.replace(/\s+/g,"");

function rulesOf(source){
 return[...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([,selector,body])=>({selector:selector.trim(),body}));
}

function ruleWith(source,selector,description=selector){
 const rule=rulesOf(source).find(candidate=>candidate.selector.split(",").some(part=>part.trim()===selector));
 assert.ok(rule,`${description} rule must exist`);
 return rule;
}

function assertDeclaration(rule,pattern,message){
 assert.match(compact(rule.body),pattern,message);
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

test("Build306 renders one compact image-backed campaign-key chip",()=>{
 assert.match(
  explore,
  /class="campaign-key-counter"[^>]*aria-label="戦利品の鍵[^>]*>\$\{pixelIcon\("key"\)\}<small>鍵<\/small><b>\$\{keys\}\/\$\{CAMPAIGN_KEYS_PER_FLOOR\}<\/b>/,
  "the chip must expose the key image, concise label, count and accessible text",
 );
 assert.doesNotMatch(explore,/campaign-key-locks|data-key-lock|>⚿</,"the retired three-glyph panel must not return");

 const chip=ruleWith(cleanCss,".explore-screen-dungeon .explore-stage>.campaign-key-counter");
 assertDeclaration(chip,/top:8px!important/,"key chip must use the quiet upper-left stage corner");
 assertDeclaration(chip,/left:8px!important/,"key chip must use the quiet upper-left stage corner");
 assertDeclaration(chip,/width:auto!important/,"key chip must size to its concise contents");
 assertDeclaration(chip,/min-width:66px!important/,"key chip must remain legible without becoming a panel");
 assertDeclaration(chip,/min-height:36px!important/,"key chip must stay visually compact");
 assertDeclaration(ruleWith(cleanCss,".explore-screen-dungeon .campaign-key-counter>.home-pixel-icon"),/width:20px!important/,"key art must remain compact");
 const onlineMobile=balancedBlock(cleanCss,"@media(max-width:430px)");
 const onlineChip=ruleWith(onlineMobile,".online-shared-explore .explore-stage>.campaign-key-counter");
 assertDeclaration(onlineChip,/top:60px!important/,"co-op key status must sit below the 48px emote control");
});

test("Build306 AUTO uses the shared drag contract and persists a clamped stage position",()=>{
 assert.match(main,/autoButton=document\.getElementById\("exploreAutoToggle"\)/);
 assert.match(main,/stage\.append\(button,map\);if\(autoButton\)stage\.append\(autoButton\)/,"AUTO must live in the same clamped coordinate space as the map controls");
 assert.match(main,/requestAnimationFrame\(\(\)=>place\(element,save\.state\.settings\[settingKey\],fallback\)\)/,"saved positions must be restored after layout");
 assert.match(main,/element\.setPointerCapture\?\.\(event\.pointerId\)/,"dragging must retain the pointer on iPhone");
 assert.match(main,/save\.state\.settings\[settingKey\]=final;save\.save\(\)/,"a completed drag must persist its final position");
 assert.match(main,/bindDrag\(autoButton,"autoExploreButtonPosition",autoFallback\(\),\{onTap:toggleAuto\}\)/,"AUTO must distinguish drag from tap");
 assert.match(main,/ResizeObserver[\s\S]*place\(autoButton,save\.state\.settings\.autoExploreButtonPosition,autoFallback\(\)\)/,"viewport changes must re-clamp AUTO");
 assert.doesNotMatch(main,/autoExploreButtonPosition!=null[\s\S]{0,160}autoExploreButtonPosition=null/,"saved AUTO positions must no longer be erased");

 const button=ruleWith(cleanCss,".explore-screen-dungeon:not(.online-shared-explore) .explore-stage>.explore-auto-toggle");
 assertDeclaration(button,/width:86px!important/,"AUTO must be materially narrower than the retired 112px panel");
 assertDeclaration(button,/height:44px!important/,"AUTO must retain a reliable tap target");
 assertDeclaration(button,/touch-action:none!important/,"pointer movement must not be stolen by page panning");
 assertDeclaration(button,/cursor:grab!important/,"AUTO must communicate that it can move");
 assertDeclaration(ruleWith(cleanCss,".explore-screen-dungeon .explore-auto-toggle.dragging"),/cursor:grabbing!important/,"active drag feedback must be present");
});

test("Build306 reserves a safe-area-aware bottom navigation row outside the dungeon canvas",()=>{
 const screen=ruleWith(cleanCss,".explore-screen-dungeon");
 assertDeclaration(screen,/grid-template-rows:autoautoautominmax\(0,1fr\)calc\(50px\+max\(2px,env\(safe-area-inset-bottom\)\)\)!important/,"the canvas and bottom menu must own separate rows");

 const nav=ruleWith(cleanCss,".explore-screen-dungeon>.explore-nav");
 assertDeclaration(nav,/height:calc\(50px\+max\(2px,env\(safe-area-inset-bottom\)\)\)!important/,"the nav row must include the home-indicator inset");
 assertDeclaration(nav,/padding:00max\(2px,env\(safe-area-inset-bottom\)\)!important/,"nav content must stay above the home indicator");
 assertDeclaration(nav,/position:relative!important/,"the menu must form its own stacking surface");
 assertDeclaration(nav,/isolation:isolate/,"the dungeon canvas must not paint over the menu");

 const action=ruleWith(cleanCss,".explore-screen-dungeon>.explore-nav>button");
 assertDeclaration(action,/height:50px!important/,"bottom actions must receive the full reserved row");
 assertDeclaration(action,/min-height:50px!important/,"older compact rules must not clip bottom actions");
});

test("Build306 reward claim controls remain compact on desktop and narrow phones",()=>{
 const claimAll=ruleWith(cleanCss,".notice-center-v2 .notice-claim-all");
 assertDeclaration(claimAll,/width:max-content!important/,"claim-all must no longer stretch across the modal");
 assertDeclaration(claimAll,/max-width:calc\(100%-54px\)!important/,"claim-all must reserve the sticky close-control lane");
 assertDeclaration(claimAll,/margin:054px9px0!important/,"claim-all must not sit underneath the modal X");

 const claim=ruleWith(cleanCss,".notice-center-v2 .notice-gift-claim");
 assertDeclaration(claim,/grid-column:3!important/,"individual claim actions must stay beside reward copy");
 assertDeclaration(claim,/width:auto!important/,"individual claim actions must size to their label");
 assertDeclaration(claim,/max-width:92px!important/,"individual claim actions must not become full-width bars");
 assertDeclaration(claim,/min-height:44px!important/,"compact claim actions must still be easy to tap");

 const mobile=balancedBlock(cleanCss,"@media(max-width:520px)");
 const mobileClaim=ruleWith(mobile,".notice-center-v2 .notice-gift-claim");
 assertDeclaration(mobileClaim,/grid-column:3!important/,"the old mobile full-width claim row must remain overridden");
 assertDeclaration(mobileClaim,/max-width:76px!important/,"phone claim actions must be visibly compact");
});

test("Build306 ranking presence has distinct online and offline visual contracts",()=>{
 const presence=ruleWith(cleanCss,".power-ranking-presence");
 assertDeclaration(presence,/display:inline-flex!important/,"presence must remain a concise inline status");
 assertDeclaration(presence,/font-size:9px!important/,"presence must remain secondary to player identity");
 assertDeclaration(presence,/white-space:nowrap/,"relative-login text must not split across lines");

 const dot=ruleWith(cleanCss,".power-ranking-presence>i");
 assertDeclaration(dot,/width:6px/,"presence must include a small status dot");
 assertDeclaration(dot,/background:#706976/,"offline presence must be visually quiet");

 const online=ruleWith(cleanCss,".power-ranking-presence.online");
 assertDeclaration(online,/color:#7de8b0!important/,"online text must be immediately distinguishable");
 const onlineDot=ruleWith(cleanCss,".power-ranking-presence.online>i");
 assertDeclaration(onlineDot,/background:#52e79a/,"online dot must use the active green state");
});

test("Build306 UI overrides load once and after the Build305 audit layer",()=>{
 const links=[...html.matchAll(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/g)].map(match=>match[1]);
 const build305At=links.findIndex(href=>href.includes("build305-final-audit.css"));
 const build306Links=links.filter(href=>href.includes("build306-ui.css"));
 const build306At=links.findIndex(href=>href.includes("build306-ui.css"));
 assert.equal(build306Links.length,1,"Build306 UI stylesheet must be linked exactly once");
 assert.ok(build306At>build305At,"Build306 operation fixes must win over Build305 audit rules");
 assert.match(build306Links[0],/\?v=3\.0\.6-build306$/,"Build306 CSS must keep its own release identity");
});
