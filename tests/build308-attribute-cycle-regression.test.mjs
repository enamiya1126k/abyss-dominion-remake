import assert from "node:assert/strict";
import test from "node:test";
import {readFile} from "node:fs/promises";

import {
 ATTRIBUTE_CYCLE,
 ATTRIBUTE_MATCHUP_MULTIPLIERS,
 ATTRIBUTE_RELATIONS,
 attributeDamageMultiplier,
 attributesEffectiveAgainst,
 attributesIneffectiveAgainst,
} from "../src/data/attributes.js?build308-attribute-cycle";
import {battleEnvironmentForFloor} from "../src/data/biomes.js?build308-attribute-cycle";
import {createEnemyBattleState} from "../src/battle/EnemyAI.js?build308-attribute-cycle";
import {attributeCycleVisual} from "../src/ui/components/AttributeVisual.js?build308-attribute-cycle";
import {BattleScreen} from "../src/ui/screens/BattleScreen.js?build308-attribute-cycle";
import {RoomStore} from "../online-server/src/RoomStore.js";

test("Build308 formal six-element cycle is the sole matchup authority",()=>{
 assert.deepEqual(ATTRIBUTE_CYCLE,["fire","ice","wind","earth","lightning","water"]);
 assert.deepEqual(ATTRIBUTE_MATCHUP_MULTIPLIERS,{strong:1.25,weak:.8,neutral:1});
 for(let index=0;index<ATTRIBUTE_CYCLE.length;index++){
  const attack=ATTRIBUTE_CYCLE[index],strong=ATTRIBUTE_CYCLE[(index+1)%ATTRIBUTE_CYCLE.length],weak=ATTRIBUTE_CYCLE[(index-1+ATTRIBUTE_CYCLE.length)%ATTRIBUTE_CYCLE.length];
  assert.deepEqual(ATTRIBUTE_RELATIONS[attack].strong,[strong],`${attack} must point to ${strong}`);
  assert.deepEqual(ATTRIBUTE_RELATIONS[attack].weak,[weak],`${attack} must be countered by ${weak}`);
  assert.equal(attributeDamageMultiplier(attack,strong),1.25,`${attack} -> ${strong}`);
  assert.equal(attributeDamageMultiplier(attack,weak),.8,`${attack} -> ${weak}`);
  assert.equal(attributeDamageMultiplier(attack,attack),1,`${attack} mirror`);
 }
 assert.equal(attributeDamageMultiplier("light","dark"),1.25);
 assert.equal(attributeDamageMultiplier("dark","light"),1.25);
 assert.equal(attributeDamageMultiplier("neutral","fire"),1);
});

test("Build308 defender lookup and battle badge agree with actual multipliers",()=>{
 assert.deepEqual(attributesEffectiveAgainst("lightning"),["earth"]);
 assert.deepEqual(attributesIneffectiveAgainst("lightning"),["water"]);
 const environment={...battleEnvironmentForFloor(11),name:"雷属性区画",primary:"lightning",accent:"#9a77ff"};
 const html=BattleScreen({party:[],enemies:[],turnQueue:[],turn:1,auto:false,busy:false,species:{},biomeBattle:environment},{captureCrystals:0},{battleSpeed:1},11);
 assert.match(html,/攻撃有利/);
 assert.match(html,/data-attribute="earth"/);
 assert.match(html,/×1\.25/);
 assert.match(html,/攻撃不利/);
 assert.match(html,/data-attribute="water"/);
 assert.match(html,/×0\.80/);
 assert.doesNotMatch(html,/環境強化|環境弱体|\+22%|-16%/);
});

test("Build308 chart uses the existing pixel-art atlas and the same cycle order",()=>{
 const html=attributeCycleVisual();
 const nodes=[...html.matchAll(/class="attribute-pixel-art home-attribute-node node-(\d+)" data-attribute="([^"]+)"/g)].map(match=>match[2]);
 assert.deepEqual(nodes,ATTRIBUTE_CYCLE);
 assert.match(html,/class="attribute-pixel-art home-attribute-node node-neutral" data-attribute="neutral"/);
 assert.match(html,/class="attribute-pixel-art home-attribute-node node-light" data-attribute="light"/);
 assert.match(html,/class="attribute-pixel-art home-attribute-node node-dark" data-attribute="dark"/);
 assert.doesNotMatch(html,/🔥|💧|⚡|🪨|🌪|❄|✨|🌑|⚪/);
});

test("Build308 battle state honors a boss override instead of its base species element",()=>{
 const species={id:"base-fire",name:"基礎炎獣",element:"fire",role:"burst",rarity:"N",maxMp:10,baseStats:{hp:50,atk:10,def:8,spd:5},growth:{hp:1,atk:1,def:1,spd:1}};
 const enemy=createEnemyBattleState(species,{speciesId:species.id,level:10,boss:true,trialElement:"water",role:"controller"},10);
 assert.equal(enemy.element,"water");
 assert.equal(enemy.role,"controller");
 assert.equal(attributeDamageMultiplier("lightning",enemy.element),1.25);
 assert.equal(attributeDamageMultiplier("fire",enemy.element),.8);
});

test("Build308 removes hidden terrain stacking in solo and online battle",()=>{
 const environment=battleEnvironmentForFloor(31);
 assert.equal(environment.matchupOnly,true);
 const store=new RoomStore({now:()=>1,random:()=>.5});
 assert.equal(store._battleEnvironmentFactor(31,"ice"),1);
 assert.equal(store._battleEnvironmentFactor(31,"fire"),1);
});

test("Build308 every live resolver consumes the shared matchup authority",async()=>{
 const [main,skills,team,room,raid]=await Promise.all([
  readFile(new URL("../src/main.js",import.meta.url),"utf8"),
  readFile(new URL("../src/battle/SkillSystem.js",import.meta.url),"utf8"),
  readFile(new URL("../online-server/src/TeamBattleCoordinator.js",import.meta.url),"utf8"),
  readFile(new URL("../online-server/src/RoomStore.js",import.meta.url),"utf8"),
  readFile(new URL("../online-server/src/RaidCoordinator.js",import.meta.url),"utf8"),
 ]);
 assert.match(main,/attributeDamageMultiplier/);
 assert.match(main,/targetElement=e\.trialElement\?\?e\.element\?\?SPECIES\[e\.speciesId\]/);
 assert.match(main,/enemy\.trialElement\?\?enemy\.element\?\?SPECIES\[enemy\.speciesId\]/);
 assert.match(skills,/enemy\?\.trialElement\?\?enemy\?\.element/);
 assert.match(team,/import \{ attributeDamageMultiplier, canonicalAttribute \} from "\.\.\/\.\.\/src\/data\/attributes\.js"/);
 assert.doesNotMatch(team,/const ATTRIBUTE_RELATIONS|function attributeDamageMultiplier/);
 assert.match(room,/canonicalAttribute,attributeDamageMultiplier/);
 assert.match(raid,/canonicalAttribute,attributeDamageMultiplier/);
});
