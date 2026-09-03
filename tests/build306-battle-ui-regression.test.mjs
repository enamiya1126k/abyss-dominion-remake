import assert from "node:assert/strict";
import test from "node:test";
import {BattleScreen} from "../src/ui/screens/BattleScreen.js?build306-battle-ui-regression";

const inventory={captureCrystals:0};
const settings={battleSpeed:1};

function baseBattle(overrides={}){
 return{
  party:[],
  enemies:[],
  enemy:null,
  targetEnemyId:null,
  turnQueue:[],
  queueIndex:0,
  turn:1,
  auto:false,
  busy:false,
  battleTheme:"fire",
  species:{},
  ...overrides,
 };
}

function biome(overrides={}){
 return{
  name:"火属性区画",
  primary:"fire",
  favorable:["fire"],
  adverse:["water"],
  boost:1.22,
  penalty:.84,
  accent:"#ef552f",
  ...overrides,
 };
}

function detailTags(html){
 return[...html.matchAll(/<small\b[^>]*data-battle-biome-details[^>]*>/g)].map(match=>match[0]);
}

test("Build306 biome control renders an accessible expanded and collapsed DOM contract",()=>{
 const expanded=BattleScreen(baseBattle({biomeBattle:biome()}),inventory,settings,11);
 assert.match(expanded,/<button\b[^>]*class="battle-biome-badge compact is-expanded"[^>]*data-battle-biome-toggle[^>]*data-battle-biome-state="expanded"[^>]*aria-expanded="true"/);
 assert.match(expanded,/class="battle-biome-summary"/);
 const expandedDetails=detailTags(expanded);
 assert.ok(expandedDetails.length>=1,"expanded biome control must expose its modifier details");
 for(const tag of expandedDetails){
  assert.match(tag,/aria-hidden="false"/);
  assert.doesNotMatch(tag,/\shidden(?:\s|>)/,"expanded details must not carry the hidden attribute");
 }

 const collapsed=BattleScreen(baseBattle({biomeBattle:biome(),biomePanelCollapsed:true}),inventory,settings,11);
 assert.match(collapsed,/<button\b[^>]*class="battle-biome-badge compact is-collapsed"[^>]*data-battle-biome-toggle[^>]*data-battle-biome-state="collapsed"[^>]*aria-expanded="false"/);
 const collapsedDetails=detailTags(collapsed);
 assert.equal(collapsedDetails.length,expandedDetails.length,"collapsing must preserve, not discard, the matchup information");
 for(const tag of collapsedDetails){
  assert.match(tag,/aria-hidden="true"/);
  assert.match(tag,/\shidden(?:\s|>)/,"collapsed details must be removed from layout and accessibility navigation");
 }
});

test("Build306 enemy name lives in the unit card while the floating lane is badges only",()=>{
 const enemy={id:"enemy-306",speciesId:"build306_enemy",name:"玄熔の剣王",hp:1800,maxHp:1800,level:113,plus:0,atk:140,matk:80,def:95,mdef:75,spd:47,role:"tank",color:"#d44f32",emoji:"敵"};
 const html=BattleScreen(baseBattle({enemies:[enemy],enemy,targetEnemyId:enemy.id,species:{build306_enemy:{element:"fire",rarity:"UR"}}}),inventory,settings,11);
 const enemyStart=html.indexOf(`id="enemy-${enemy.id}"`),enemyEnd=html.indexOf("</button>",enemyStart),enemyMarkup=html.slice(enemyStart,enemyEnd);
 assert.ok(enemyStart>=0&&enemyEnd>enemyStart,"enemy combatant must render");

 const cardStart=enemyMarkup.indexOf('<div class="side-unit-card enemy-info">');
 const cardNameStart=enemyMarkup.indexOf('<b class="enemy-card-name"');
 assert.ok(cardStart>=0&&cardNameStart>cardStart,"enemy name must be anchored inside the unit card");
 assert.match(enemyMarkup,/<b class="enemy-card-name"[^>]*>玄熔の剣王<\/b>/);
 assert.match(enemyMarkup,/class="enemy-card-meta"/,"level, growth and attribute remain grouped separately from the name");

 const floating=enemyMarkup.match(/<span class="battle-unit-floating-name battle-unit-floating-badges"[^>]*>([\s\S]*?)<\/span>\s*<div class="side-unit-sprite/);
 assert.ok(floating,"the legacy floating lane must be retained only as a compact badge lane");
 assert.doesNotMatch(floating[1],/玄熔の剣王|enemy-card-name/,"enemy names must never return to the collision-prone floating lane");
});

test("Build306 escapes enemy and biome display text before inserting it into battle markup",()=>{
 const unsafeName='魔獣 <img src=x onerror="boom"> & "王"',unsafeBiome='火<svg onload="boom">属性';
 const enemy={id:"unsafe-306",speciesId:"unsafe_enemy",name:unsafeName,hp:10,maxHp:10,level:1,plus:0,atk:1,matk:1,def:1,mdef:1,spd:1,role:"balanced",color:"#fff",emoji:"敵"};
 const html=BattleScreen(baseBattle({biomeBattle:biome({name:unsafeBiome}),enemies:[enemy],enemy,targetEnemyId:enemy.id,species:{unsafe_enemy:{element:"neutral",rarity:"N"}}}),inventory,settings,1);

 assert.doesNotMatch(html,/<img src=x onerror="boom">/);
 assert.doesNotMatch(html,/<svg onload="boom">/);
 assert.match(html,/魔獣 &lt;img src=x onerror=&quot;boom&quot;&gt; &amp; &quot;王&quot;/);
 assert.match(html,/火&lt;svg onload=&quot;boom&quot;&gt;属性/);
});
