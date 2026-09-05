import test from"node:test";
import assert from"node:assert/strict";
import{
 MAGIC_CIRCLES,
 MAGIC_CIRCLE_STATE_VERSION,
 equippedMagicCircle,
 legacyMagicCircleUpgradePrice,
 magicCircleLevelEffect,
 magicCircleNextEffect,
 magicCircleUpgradePrice,
 normalizeMagicCircleState,
 slotDamageMultiplier
}from"../src/core/MagicCircleSystem.js";

const playable=MAGIC_CIRCLES.filter(circle=>circle.id!=="none");
const effectPayload=profile=>Object.fromEntries(Object.entries(profile).filter(([key])=>!["id","effect","level","progress","summary"].includes(key)));

test("build301 magic-circle prices use the v4 bounded curve",()=>{
 assert.equal(MAGIC_CIRCLE_STATE_VERSION,4);
 assert.equal(magicCircleUpgradePrice("last_life",1),59_000);
 assert.equal(magicCircleUpgradePrice("random_arsenal",1),886_000);
 assert.equal(magicCircleUpgradePrice("last_life",98),9_431_000);
 for(const circle of playable){
  assert.ok(magicCircleUpgradePrice(circle,1)<legacyMagicCircleUpgradePrice(circle,1),circle.id);
  assert.ok(magicCircleUpgradePrice(circle,98)<legacyMagicCircleUpgradePrice(circle,98),circle.id);
 }
});

test("build301 every playable magic circle exposes a real bounded level effect",()=>{
 assert.equal(playable.length,20);
 for(const circle of playable){
  const first=magicCircleLevelEffect(circle,1),last=magicCircleLevelEffect(circle,99);
  assert.notDeepEqual(effectPayload(first),effectPayload(last),`${circle.id} must improve beyond cosmetic level text`);
  assert.ok(first.summary.length>0&&last.summary.length>0,circle.id);
  assert.match(magicCircleNextEffect(circle,1),/^Lv\.2：/);
  assert.equal(magicCircleNextEffect(circle,99),"最大Lv.99・強化完了");
 }
 assert.equal(magicCircleLevelEffect("aegis",1).shieldRate,.5);
 assert.equal(magicCircleLevelEffect("aegis",99).shieldRate,.7);
 assert.equal(magicCircleLevelEffect("reincarnation",99).reviveHpRate,1);
 assert.equal(magicCircleLevelEffect("reincarnation",99).reviveMpRate,.8);
 assert.equal(magicCircleLevelEffect("judgment20",1).triggerTurn,20);
 assert.equal(magicCircleLevelEffect("judgment20",99).triggerTurn,12);
 assert.equal(slotDamageMultiplier(999,1),3);
 assert.equal(slotDamageMultiplier(999,99),3.5);
});

test("build301 equipped circle carries its canonical level-effect profile",()=>{
 const monster={id:"m1",magicCircleId:"aegis",magicCircleInstanceId:"mc:aegis:test"},state={player:{gold:0},monsters:[monster],party:[monster.id],magicCircles:{version:MAGIC_CIRCLE_STATE_VERSION,unlocked:{aegis:true},instances:[{instanceId:"mc:aegis:test",circleId:"aegis",level:50,source:"test"}],goldSpent:0}};
 const equipped=equippedMagicCircle(monster,state);
 assert.equal(equipped.level,50);
 assert.equal(equipped.levelEffect.level,50);
 assert.ok(equipped.levelEffect.shieldRate>.5&&equipped.levelEffect.shieldRate<.7);
});

test("build301 v3 upgrade spend is refunded once without minting GOLD",()=>{
 const instance={instanceId:"mc:last_life:legacy",circleId:"last_life",level:3,source:"legacy"};
 const oldInvestment=legacyMagicCircleUpgradePrice("last_life",1)+legacyMagicCircleUpgradePrice("last_life",2),newInvestment=magicCircleUpgradePrice("last_life",1)+magicCircleUpgradePrice("last_life",2),refund=oldInvestment-newInvestment;
 const state={player:{gold:12_345},monsters:[],party:[],magicCircles:{version:3,unlocked:{last_life:true},instances:[instance],goldSpent:oldInvestment}};
 normalizeMagicCircleState(state);
 assert.equal(state.magicCircles.version,MAGIC_CIRCLE_STATE_VERSION);
 assert.equal(state.magicCircleRebalance.version,MAGIC_CIRCLE_STATE_VERSION);
 assert.equal(state.magicCircleRebalance.refund,refund);
 assert.equal(state.player.gold,12_345+refund);
 assert.equal(state.magicCircles.goldSpent,newInvestment);
 const goldAfter=state.player.gold;
 normalizeMagicCircleState(state);
 assert.equal(state.player.gold,goldAfter,"normalization must not refund twice");

 const guarded={player:{gold:10},monsters:[],party:[],magicCircles:{version:3,unlocked:{last_life:true},instances:[instance],goldSpent:1_000}};
 normalizeMagicCircleState(guarded);
 assert.equal(guarded.magicCircleRebalance.refund,1_000);
 assert.equal(guarded.player.gold,1_010,"refund cannot exceed recorded spend");
 assert.equal(guarded.magicCircles.goldSpent,0);
});
