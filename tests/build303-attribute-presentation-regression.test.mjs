import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{CAMPAIGN_ELEMENTS,campaignRoomProfile}from"../src/core/Campaign100System.js";
import{dungeonThemeForAttribute,dungeonThemeAssetPaths}from"../src/data/dungeonThemes.js";

test("every generated section has Japanese copy, an official crest and a matching dungeon skin",()=>{
 const official=new Set(["neutral","fire","water","ice","lightning","earth","wind","light","dark"]),seenThemes=new Set();
 for(const attribute of CAMPAIGN_ELEMENTS){
  const profile=campaignRoomProfile(attribute),theme=dungeonThemeForAttribute(attribute,38);
  assert.match(profile.name,/^[^a-z]+$/i,`${attribute} uses Japanese display copy`);
  assert.ok(official.has(profile.logoAttribute),`${attribute} maps to an existing attribute crest`);
  assert.equal(theme.id,profile.dungeonTheme,`${attribute} maps to its authored dungeon skin`);
  assert.match(theme.name,/[^\x00-\x7f]/,`${attribute} dungeon name is Japanese`);
  seenThemes.add(theme.id);
 }
 assert.ok(seenThemes.size>=8,"the generated attributes use the authored skin set instead of one floor skin");
 assert.ok(dungeonThemeAssetPaths().some(path=>path.includes("storm-atlas.png")));
 assert.ok(dungeonThemeAssetPaths().some(path=>path.includes("poison-atlas.png")));
});

test("field labels, crossings and battle backgrounds all follow the active section",async()=>{
 const[main,screen,css,index]=await Promise.all([
  readFile(new URL("../src/main.js",import.meta.url),"utf8"),
  readFile(new URL("../src/ui/screens/ExploreScreen.js",import.meta.url),"utf8"),
  readFile(new URL("../src/Styles/build303-dungeon.css",import.meta.url),"utf8"),
  readFile(new URL("../index.html",import.meta.url),"utf8")
 ]);
 assert.match(screen,/campaignRoomProfile\(savedAttribute\)/);
 assert.match(screen,/data-section-attribute-name/);
 assert.match(screen,/attributeVisual\(roomProfile\.logoAttribute/);
 assert.match(main,/function syncExploreSectionPresentation/);
 assert.match(main,/function showSectionTransition/);
 assert.match(main,/profile\.name\}属性区画/);
 assert.match(main,/roomProfile\?\.battleTheme/);
 assert.match(main,/battleRoomAttribute:roomProfile\?\.id/);
 for(const theme of["default","earth","lightning","wind","light","dark"])assert.match(css,new RegExp(`battle-theme-${theme}`));
 assert.match(index,/build303-dungeon\.css\?v=3\.0\.3-build303/);
 assert.ok(index.indexOf("build303-dungeon.css")>index.indexOf("build302-auto.css"),"Build303 overrides load last");
});

