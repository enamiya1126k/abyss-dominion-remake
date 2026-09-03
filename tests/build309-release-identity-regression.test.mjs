import test from"node:test";
import assert from"node:assert/strict";
import{readdir,readFile}from"node:fs/promises";
import{relative,resolve}from"node:path";
import{fileURLToPath}from"node:url";

import{APP_VERSION,SAVE_SCHEMA_VERSION}from"../src/core/config.js";

const ROOT=fileURLToPath(new URL("../",import.meta.url));
const SRC_ROOT=resolve(ROOT,"src");
const RELEASE_QUERY="?v=3.0.9-build309";

async function javascriptFiles(directory=SRC_ROOT){
 const result=[];for(const entry of await readdir(directory,{withFileTypes:true})){const path=resolve(directory,entry.name);if(entry.isDirectory())result.push(...await javascriptFiles(path));else if(entry.isFile()&&entry.name.endsWith(".js")&&entry.name!=="app.bundle.js")result.push(path)}return result
}

test("Build309 publishes one app and entry-point identity without resetting save schema",async()=>{
 assert.equal(APP_VERSION,"3.0.9");
 assert.equal(SAVE_SCHEMA_VERSION,75);
 const index=await readFile(resolve(ROOT,"index.html"),"utf8");
 assert.match(index,/const ASSET_VERSION = "3\.0\.9";/);
 assert.match(index,/const ASSET_BUILD = "build309";/);
 assert.match(index,/import\(`\.\/src\/main\.js\?v=\$\{ASSET_VERSION\}-\$\{ASSET_BUILD\}`\)/);
});

test("Build309 updates every active source import edge and removes the superseded identity",async()=>{
 let releaseEdges=0;
 for(const path of await javascriptFiles()){
  const source=await readFile(path,"utf8"),name=relative(SRC_ROOT,path).replaceAll("\\","/");
  assert.doesNotMatch(source,/\?v=3\.0\.8-build308/,`${name} still exposes the superseded Build308 identity`);
  releaseEdges+=source.split(RELEASE_QUERY).length-1;
 }
 assert.ok(releaseEdges>=250,`expected every former Build308 edge to publish Build309, found only ${releaseEdges}`);
 const main=await readFile(resolve(SRC_ROOT,"main.js"),"utf8"),story=await readFile(resolve(SRC_ROOT,"core/CampaignStorySystem.js"),"utf8");
 assert.match(main,/CampaignStorySystem\.js\?v=3\.0\.9-build309/);
 assert.match(story,/Campaign100System\.js\?v=3\.0\.9-build309/);
});

test("Build309 keeps historical stylesheet identities and adds its own final layer",async()=>{
 const index=await readFile(resolve(ROOT,"index.html"),"utf8"),styles=[...index.matchAll(/<link[^>]+href="([^"]+\.css\?v=[^"]+)"/g)].map(match=>match[1]);
 assert.ok(styles.includes("./src/Styles/build304-final.css?v=3.0.4-build304"));
 assert.ok(styles.includes("./src/Styles/build305-final-audit.css?v=3.0.5-build305"));
 assert.ok(styles.includes("./src/Styles/build306-ui.css?v=3.0.6-build306"));
 assert.ok(styles.includes("./src/Styles/build308-boss.css?v=3.0.8-build308"));
 assert.equal(styles.at(-1),"./src/Styles/build309-story.css?v=3.0.9-build309");
});
