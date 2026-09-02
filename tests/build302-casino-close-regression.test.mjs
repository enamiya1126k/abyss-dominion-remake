import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const main=readFileSync(new URL("../src/main.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/Styles/build301.css",import.meta.url),"utf8");

function sourceOf(name,nextName){
 const start=main.indexOf(`function ${name}(`),end=main.indexOf(`function ${nextName}(`,start+1);
 assert.ok(start>=0&&end>start,`${name} source must exist`);
 return main.slice(start,end);
}

test("build302 casino keeps both close controls enabled while reels animate",()=>{
 const bind=sourceOf("bindSecretRoomCasinoModal","openSecretRoomCasino");
 assert.match(bind,/if\(!control\.matches\("\[data-modal-primary\],\[data-modal-dismiss\]"\)\)control\.disabled=true/);
 assert.doesNotMatch(bind,/querySelectorAll\("button,input,\[data-modal-primary\],\[data-modal-dismiss\]"\)/);
 assert.match(bind,/finally\{if\(spinEpoch===casinoSpinEpoch\)casinoSpinBusy=false;modal\.removeAttribute\("aria-busy"\);if\(modal\.isConnected\)refreshSecretRoomCasinoModal/);
 assert.match(bind,/const spinEpoch=\+\+casinoSpinEpoch/);
 assert.match(bind,/await pause\(step\);if\(!modal\.isConnected\)return/);
});

test("build302 casino supports X, backdrop and Escape through one idempotent close path",()=>{
 const open=sourceOf("openSecretRoomCasino","openSecretRoomInn");
 const backdrop=sourceOf("bindBackdropTapClose","bindTapAnywhereClose");
 assert.match(open,/let closed=false;const close=\(\)=>\{if\(closed\)return;closed=true/);
 assert.match(open,/closed=true;casinoSpinEpoch\+\+;casinoSpinBusy=false/);
 assert.match(open,/modal\._onDismiss=close/);
 assert.match(open,/bindBackdropTapClose\(modal,close\)/);
 assert.match(open,/dismiss\?\.focus\(\{preventScroll:true\}\)/);
 assert.match(main,/event\.key!=="Escape"[\s\S]*typeof modal\._onDismiss==="function"\)modal\._onDismiss\(\)/);
 assert.match(backdrop,/event\.target!==modal/);
 assert.match(backdrop,/!pointer\.moved&&event\.target===modal/);
});

test("build302 casino close restores the secret-room position and focus without input lock",()=>{
 const open=sourceOf("openSecretRoomCasino","openSecretRoomInn");
 assert.match(open,/returnState=\{x:window\.scrollX,y:window\.scrollY,screenScroll:/);
 assert.match(open,/modal\.removeAttribute\("aria-busy"\)/);
 assert.match(open,/modal\.querySelector\("\.casino-panel"\)\?\.classList\.remove\("busy"\)/);
 assert.match(open,/window\.scrollTo\(\{left:returnState\.x,top:returnState\.y,behavior:"auto"\}\)/);
 assert.match(open,/focus\(\{preventScroll:true\}\)/);
 assert.match(open,/role","dialog"/);
 assert.match(open,/aria-modal","true"/);
});

test("build302 casino X remains sticky and inside iPhone safe areas",()=>{
 assert.match(css,/\.casino-modal-v2\{padding:max\(6px,env\(safe-area-inset-top\)\)/);
 assert.match(css,/\.casino-modal-v2>\.game-modal-card>\.modal-x\{position:sticky!important;top:0!important/);
 assert.match(css,/touch-action:manipulation/);
 assert.match(css,/:focus-visible\{outline:3px solid/);
});
