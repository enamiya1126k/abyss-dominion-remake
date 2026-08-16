import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{signatureWeaponState,SIGNATURE_WEAPON_RESONANCES}from"../src/core/SignatureWeaponSystem.js";
import{sanitizeProfile}from"../online-server/src/RoomStore.js";

const read=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");

test("build157 isolates active online play and keeps the composer persistent",async()=>{
 const[screen,client,styles,index]=await Promise.all([read("src/ui/screens/OnlinePartyScreen.js"),read("src/online/OnlinePartyClient.js"),read("src/Styles/v2.10.0.css"),read("index.html")]);
 for(const token of["online-expedition-shell online-solo-explore explore-screen explore-screen-dungeon","online-solo-resource-hud resource-hud","explore-command-header","online-expedition-party-toggle","online-explore-nav explore-nav","online-raid-battle battle-screen side-battle-v2","battle-arena side-battle-arena","battle-command online-normal-raid-command"])assert.ok(screen.includes(token),`missing immersive component: ${token}`);
 for(const token of["data-online-chat-dock","data-online-chat-toggle","data-online-chat-drawer","data-online-chat-form","data-online-chat-input"])assert.ok(screen.includes(token),`missing persistent chat component: ${token}`);
 assert.match(styles,/html\.online-immersive,body\.online-immersive/);assert.match(styles,/position:fixed;z-index:1400/);assert.match(styles,/font-size:16px!important/);assert.match(styles,/\.online-party-screen\.online-phase-expedition \.online-expedition-shell/);assert.match(styles,/\.online-party-screen\.online-phase-raid \.online-raid-view/);
 assert.match(client,/_syncImmersiveMode/);assert.match(client,/_setChatExpanded/);assert.match(client,/online-chat-keyboard-open/);assert.match(client,/if\(!this\.chatExpanded\)this\.chatUnread/);assert.match(index,/ASSET_BUILD = "build157"/);
});

test("mobile quantity shop stacks the real purchase control",async()=>{
 const[main,styles]=await Promise.all([read("src/main.js"),read("src/Styles/v2.10.0.css")]);
 assert.match(main,/data-shop-qty-step/);assert.match(main,/data-shop-qty-max/);assert.match(main,/data-home-item-buy/);assert.match(main,/item\.price\*count/);
 assert.match(styles,/home-shop-buy-actions>\[data-home-item-buy\]/);assert.match(styles,/grid-template-columns:1fr!important/);
});

test("exclusive weapon resonance is owner-only, canonical and server-authoritative",async()=>{
 assert.deepEqual(Object.keys(SIGNATURE_WEAPON_RESONANCES).sort(),["myth_enami","myth_hide","myth_rion","myth_yori"]);
 const weapon={id:"signature",slot:"weapon",ruleOverrides:{mythicOwner:"myth_enami"}},state={equipment:[weapon]},owner={speciesId:"myth_enami",equipment:{weaponRight:"signature"}},guest={speciesId:"slime",equipment:{weaponRight:"signature"}};
 assert.equal(signatureWeaponState(state,owner).status,"専用共鳴 発動中");assert.equal(signatureWeaponState(state,guest).status,"専用効果 未発動");
 const canonical=sanitizeProfile({speciesId:"myth_yori",equipment:[{slot:"weaponRight",signatureOwnerId:"myth_yori"}],signatureResonance:{id:"yori-chain",ownerId:"myth_yori",active:true,damagePerStack:999,critPerStack:999}});
 assert.equal(canonical.signatureResonance.damagePerStack,.1);assert.equal(canonical.signatureResonance.critPerStack,.05);assert.equal(canonical.equipment[0].signatureOwnerId,"myth_yori");
 const mismatch=sanitizeProfile({speciesId:"slime",signatureResonance:{id:"yori-chain",ownerId:"myth_yori",active:true}});assert.equal(mismatch.signatureResonance,null);
 const[main,client,raid]=await Promise.all([read("src/main.js"),read("src/online/OnlinePartyClient.js"),read("online-server/src/RaidCoordinator.js")]);
 for(const token of["enami-multitask","yori-chain","rion-care","hide-guardian"])assert.match(main+raid,new RegExp(token));
 assert.match(client,/event\.kind==="signature"/);assert.match(client,/専用共鳴 発動中/);
});

test("battle max HP growth preserves the existing amount",async()=>{
 const main=await read("src/main.js");assert.match(main,/const previousMaxHp=Math\.max\(1,Number\(calculatedStats\(monster\)\.hp\)/);assert.match(main,/wasAlive&&hp>previousMaxHp/);assert.match(main,/monster\.currentHp\+=hp-previousMaxHp/);
});
