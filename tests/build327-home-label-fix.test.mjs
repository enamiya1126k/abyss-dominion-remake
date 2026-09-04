import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
const read=path=>readFile(new URL(path,import.meta.url),"utf8");

test("Build327 keeps the invasion location on one line without the visible detail label",async()=>{
 const[css,home]=await Promise.all([read("../src/Styles/build327-home-label-fix.css"),read("../src/ui/screens/HomeScreen.js")]);
 assert.match(home,/data-open-campaign-intel role="button" tabindex="0"/);
 assert.match(css,/\.home-intel-cue\{display:none!important\}/);
 assert.match(css,/white-space:nowrap!important/);
 assert.match(css,/word-break:keep-all!important/);
 assert.match(css,/grid-template-columns:minmax\(28px,46px\) minmax\(0,1fr\)!important/);
 assert.match(css,/padding-right:0!important/);
});

test("Build327 updates only the asset/app version and keeps save schema 84",async()=>{
 const[index,config]=await Promise.all([read("../index.html"),read("../src/core/config.js")]);
 assert.match(index,/build327-home-label-fix\.css\?v=3\.1\.8-build327/);
 assert.match(index,/const ASSET_VERSION = "3\.1\.8"/);
 assert.match(index,/const ASSET_BUILD = "build327"/);
 assert.match(config,/SAVE_SCHEMA_VERSION=84/);
 assert.match(config,/APP_VERSION="3\.1\.8"/);
});
