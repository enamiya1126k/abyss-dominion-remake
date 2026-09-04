import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{explorePerformanceProfile,shouldPaintExploreFrame}from"../src/core/ExplorePerformanceSystem.js";

test("iPhone相当では描画解像度とFPSを安全に制限",()=>{const profile=explorePerformanceProfile({pixelRatio:3,screenWidth:390,maxTouchPoints:5,hardwareConcurrency:6});assert.equal(profile.constrained,true);assert.equal(profile.pixelRatio,1.35);assert.ok(profile.frameInterval>=33);assert.ok(profile.particleScale<=.45)});

test("PCでは解像感を維持しつつ過剰DPRを抑制",()=>{const profile=explorePerformanceProfile({pixelRatio:2.5,screenWidth:1440,maxTouchPoints:0,hardwareConcurrency:12,deviceMemory:16});assert.equal(profile.constrained,false);assert.equal(profile.pixelRatio,1.75);assert.ok(profile.frameInterval<=20)});

test("フレーム制御は更新処理を止めず描画だけ間引く",()=>{const state={lastPaintAt:100};assert.equal(shouldPaintExploreFrame(state,120,1000/30),false);assert.equal(shouldPaintExploreFrame(state,134,1000/30),true);assert.equal(state.lastPaintAt,134)});

test("探索の重い区画走査・ミニマップ・オンライン描画へ接続済み",async()=>{const main=await readFile(new URL("../src/main.js",import.meta.url),"utf8"),index=await readFile(new URL("../index.html",import.meta.url),"utf8");assert.match(main,/shouldPaintExploreFrame\(game,now/);assert.match(main,/performanceProfile\.pixelRatio/);assert.match(main,/lastMiniMapPaintAt/);assert.match(main,/for\(let y=bounds\.minY;y<=bounds\.maxY;y\+\+\)/);assert.match(main,/game\.performanceProfile\?\.constrained/);assert.match(index,/ASSET_BUILD = "build315"/)});
