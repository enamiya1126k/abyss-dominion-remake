import{unlockMagicCircleFromTree}from"./MagicCircleSystem.js?v=3.1.1-build316";

export const ABYSS_SKILL_TREE_VERSION=9;

export const ABYSS_SKILL_CATEGORIES=Object.freeze([
 {
  id:"economy",
  icon:"🪙",
  name:"経済",
  subtitle:"GOLDの獲得量と資産効率を伸ばす",
  color:"#efc667"
 },
 {
  id:"combat",
  icon:"⚔️",
  name:"戦闘",
  subtitle:"部隊の基礎能力と戦闘性能を伸ばす",
  color:"#ee718f"
 },
 {
  id:"exploration",
  icon:"🧭",
  name:"探索",
  subtitle:"宝箱・ドロップ・強敵報酬を伸ばす",
  color:"#70d6bd"
 }
]);

const FOUNDATION_LANES=Object.freeze({
 "economy-gold-sense":2,"economy-return-ledger":1,"economy-idle-mining":3,"economy-battle-bounty":1,"economy-appraisal":3,"economy-abyss-market":2,
 "combat-abyss-core":2,"combat-demon-fang":1,"combat-dark-shell":3,"combat-blood-rush":1,"combat-undying-will":3,"combat-dominion":2,
 "exploration-instinct":2,"exploration-relic-sense":1,"exploration-elite-trail":3,"exploration-abyss-luck":1,"exploration-key-echo":3,"exploration-endless-path":2
});

// Version 6 used a blanket 25% discount. Keep the exact formula only for
// reconstructing missing paidCosts during the one-time version 7 refund.
function version6TreePrice(original){
 const value=Math.max(0,Number(original)||0),discounted=value*.25;
 if(discounted<1000)return Math.max(100,Math.round(discounted/50)*50);
 if(discounted<100000)return Math.max(1000,Math.round(discounted/500)*500);
 return Math.max(1000,Math.round(discounted/1000)*1000);
}

function foundationTreePrice(tier){return({1:1000,2:3000,3:10000,4:30000})[Math.max(1,Math.floor(Number(tier)||1))]??30000}

const FOUNDATION_SKILL_NODES=Object.freeze([
 {
  id:"economy-gold-sense",
  category:"economy",
  tier:1,
  icon:"🪙",
  name:"黄金の嗅覚",
  description:"すべてのGOLD獲得量 +5%",
  cost:1000,
  requires:[],
  effect:{key:"goldGainRate",value:.05}
 },
 {
  id:"economy-return-ledger",
  category:"economy",
  tier:2,
  icon:"📒",
  name:"帰還会計",
  description:"手動帰還のGOLD獲得量 +10%",
  cost:4000,
  requires:["economy-gold-sense"],
  effect:{key:"manualReturnGoldRate",value:.10}
 },
 {
  id:"economy-idle-mining",
  category:"economy",
  tier:2,
  icon:"🕯️",
  name:"不在採掘",
  description:"放置帰還のGOLD獲得量 +10%",
  cost:4000,
  requires:["economy-gold-sense"],
  effect:{key:"idleReturnGoldRate",value:.10}
 },
 {
  id:"economy-battle-bounty",
  category:"economy",
  tier:3,
  icon:"🏅",
  name:"討伐報奨",
  description:"戦闘で得るGOLD +10%",
  cost:15000,
  requires:["economy-return-ledger"],
  effect:{key:"battleGoldRate",value:.10}
 },
 {
  id:"economy-appraisal",
  category:"economy",
  tier:3,
  icon:"⚖️",
  name:"価値鑑定",
  description:"装備の売却GOLD +15%",
  cost:15000,
  requires:["economy-idle-mining"],
  effect:{key:"equipmentSellGoldRate",value:.15}
 },
 {
  id:"economy-abyss-market",
  category:"economy",
  tier:4,
  icon:"🏛️",
  name:"深淵経済圏",
  description:"すべてのGOLD獲得量をさらに +10%",
  cost:60000,
  requires:["economy-battle-bounty","economy-appraisal"],
  effect:{key:"goldGainRate",value:.10}
 },
 {
  id:"combat-abyss-core",
  category:"combat",
  tier:1,
  icon:"🫀",
  name:"深淵核",
  description:"味方全体の最大HP +3%",
  cost:1000,
  requires:[],
  effect:{key:"partyHpRate",value:.03}
 },
 {
  id:"combat-demon-fang",
  category:"combat",
  tier:2,
  icon:"🦷",
  name:"魔王の牙",
  description:"味方全体の物理・魔法ATK +3%",
  cost:4000,
  requires:["combat-abyss-core"],
  effect:{key:"partyAtkRate",value:.03}
 },
 {
  id:"combat-dark-shell",
  category:"combat",
  tier:2,
  icon:"🛡️",
  name:"漆黒の殻",
  description:"味方全体のDEF +3%",
  cost:4000,
  requires:["combat-abyss-core"],
  effect:{key:"partyDefRate",value:.03}
 },
 {
  id:"combat-blood-rush",
  category:"combat",
  tier:3,
  icon:"💨",
  name:"血の加速",
  description:"味方全体のSPD +3%",
  cost:15000,
  requires:["combat-demon-fang"],
  effect:{key:"partySpdRate",value:.03}
 },
 {
  id:"combat-undying-will",
  category:"combat",
  tier:3,
  icon:"🔥",
  name:"不滅の意志",
  description:"味方全体の被ダメージ -3%",
  cost:15000,
  requires:["combat-dark-shell"],
  effect:{key:"partyDamageTakenRate",value:-.03}
 },
 {
  id:"combat-dominion",
  category:"combat",
  tier:4,
  icon:"👑",
  name:"覇王領域",
  description:"味方全体の与ダメージ +5%",
  cost:60000,
  requires:["combat-blood-rush","combat-undying-will"],
  effect:{key:"partyDamageRate",value:.05}
 },
 {
  id:"exploration-instinct",
  category:"exploration",
  tier:1,
  icon:"👁️",
  name:"探索本能",
  description:"通常探索で、宝箱マスが生成される抽選率を5%加算。戦闘報酬やボス報酬には影響しない。",
  cost:1000,
  requires:[],
  effect:{key:"chestSpawnRate",value:.05}
 },
 {
  id:"exploration-relic-sense",
  category:"exploration",
  tier:2,
  icon:"📡",
  name:"遺物感知",
  description:"通常敵・エリート敵・宝箱から装備品を入手する抽選率を5%加算。確定報酬には影響しない。",
  cost:4000,
  requires:["exploration-instinct"],
  effect:{key:"equipmentDropRate",value:.05}
 },
 {
  id:"exploration-elite-trail",
  category:"exploration",
  tier:2,
  icon:"🐾",
  name:"強敵追跡",
  description:"エリート敵＝金色の強敵マーク付き個体。討伐時のGOLD・装備・素材・欠片の獲得量と抽選回数を10%増加。通常敵・ボス・捕獲率には無効。",
  cost:4000,
  requires:["exploration-instinct"],
  effect:{key:"eliteRewardRate",value:.10}
 },
 {
  id:"exploration-abyss-luck",
  category:"exploration",
  tier:3,
  icon:"✨",
  name:"深淵の幸運",
  description:"探索で装備品が出た際、レアリティ抽選を1段階ぶん有利に補正。装備の入手率や強化レベル自体は増えない。",
  cost:15000,
  requires:["exploration-relic-sense"],
  effect:{key:"equipmentRarityBonus",value:1}
 },
 {
  id:"exploration-key-echo",
  category:"exploration",
  tier:3,
  icon:"🔑",
  name:"鍵の残響",
  description:"通常探索・エリート敵・ボス報酬で行う「深淵の鍵」抽選率を10%加算。確定配布やショップ購入には影響しない。",
  cost:15000,
  requires:["exploration-elite-trail"],
  effect:{key:"abyssKeyDropRate",value:.10}
 },
 {
  id:"exploration-endless-path",
  category:"exploration",
  tier:4,
  icon:"🌌",
  name:"無窮踏破",
  description:"通常探索で得るGOLD・経験値・装備・素材・欠片の数量を5%増加。魔晶石、捕獲率、ログイン配布、試練・オンライン報酬には影響しない。",
  cost:60000,
  requires:["exploration-abyss-luck","exploration-key-echo"],
  effect:{key:"explorationRewardRate",value:.05}
 }
].map(node=>Object.freeze({...node,legacyCost:node.cost,previousCost:version6TreePrice(node.cost),cost:foundationTreePrice(node.tier),lane:FOUNDATION_LANES[node.id]??2,requiresAny:[],requiresAnyCount:0,branchId:"foundation",branchName:"根源"})));

const EXPANSION_STAGES=Object.freeze([
 {suffix:"萌芽",cost:5000,legacyCost:120000},
 {suffix:"脈動",cost:10000,legacyCost:300000},
 {suffix:"刻印",cost:20000,legacyCost:750000},
 {suffix:"共鳴",cost:40000,legacyCost:2000000},
 {suffix:"転成",cost:75000,legacyCost:5000000},
 {suffix:"顕現",cost:125000,legacyCost:12000000},
 {suffix:"超越",cost:200000,legacyCost:30000000},
 {suffix:"支配",cost:300000,legacyCost:75000000},
 {suffix:"終極",cost:450000,legacyCost:180000000},
 {suffix:"王冠",cost:650000,legacyCost:350000000},
 {suffix:"律動",cost:900000,legacyCost:650000000},
 {suffix:"深化",cost:1200000,legacyCost:1200000000},
 {suffix:"星環",cost:1500000,legacyCost:1800000000},
 {suffix:"変革",cost:1800000,legacyCost:2500000000},
 {suffix:"天衝",cost:2200000,legacyCost:3500000000},
 {suffix:"霊峰",cost:2600000,legacyCost:5000000000},
 {suffix:"永劫",cost:3000000,legacyCost:7000000000},
 {suffix:"神域",cost:3500000,legacyCost:9500000000},
 {suffix:"冥界",cost:4000000,legacyCost:12500000000},
 {suffix:"界渡",cost:4500000,legacyCost:16000000000},
 {suffix:"星海",cost:5000000,legacyCost:20000000000},
 {suffix:"真理",cost:5500000,legacyCost:25000000000},
 {suffix:"創世",cost:6000000,legacyCost:31000000000},
 {suffix:"虚無",cost:6500000,legacyCost:38000000000},
 {suffix:"原初",cost:7000000,legacyCost:46000000000},
 {suffix:"万象",cost:7500000,legacyCost:55000000000},
 {suffix:"王座",cost:8000000,legacyCost:65000000000},
 {suffix:"無限",cost:8500000,legacyCost:76000000000},
 {suffix:"終焉",cost:9000000,legacyCost:88000000000},
 {suffix:"超克",cost:9500000,legacyCost:100000000000},
 {suffix:"深淵王",cost:10000000,legacyCost:115000000000}
]);

const EXPANSION_CAPSTONES=Object.freeze({
 economy:"economy-abyss-market",
 combat:"combat-dominion",
 exploration:"exploration-endless-path"
});

const EXPANSION_BRANCHES=Object.freeze({
 economy:[
  {
   id:"gold-vein",name:"黄金脈",icon:"💰",
   effect:()=>({key:"goldGainRate",value:.01})
  },
  {
   id:"expedition-guild",name:"遠征商会",icon:"🧳",
   effect:stage=>({key:stage%2===0?"manualReturnGoldRate":"idleReturnGoldRate",value:.02})
  },
  {
   id:"spoils-market",name:"戦利品市場",icon:"📈",
   effect:stage=>({key:stage%2===0?"battleGoldRate":"equipmentSellGoldRate",value:.02})
  }
 ],
 combat:[
  {
   id:"overlord-blood",name:"覇王血統",icon:"🩸",
   effect:stage=>({key:stage%3===1?"partyDamageRate":"partyAtkRate",value:.01})
  },
  {
   id:"undying-armor",name:"不滅装甲",icon:"🛡️",
   effect:stage=>stage%3===0
    ?{key:"partyHpRate",value:.015}
    :stage%3===1
     ?{key:"partyDefRate",value:.015}
     :{key:"partyDamageTakenRate",value:-.01}
  },
  {
   id:"demonic-circuit",name:"魔迅回路",icon:"⚡",
   effect:stage=>stage%3===0
    ?{key:"partySpdRate",value:.015}
    :stage%3===1
     ?{key:"partyDamageRate",value:.01}
     :{key:"partyAtkRate",value:.01}
  }
 ],
 exploration:[
  {
   id:"relic-map",name:"遺物星図",icon:"🗺️",
   effect:stage=>({key:stage%2===0?"chestSpawnRate":"equipmentDropRate",value:.005})
  },
  {
   id:"hunter-oath",name:"狩人盟約",icon:"🏹",
   effect:stage=>({key:stage%2===0?"eliteRewardRate":"abyssKeyDropRate",value:stage%2===0 ? .02 : .015})
  },
  {
   id:"fate-compass",name:"運命羅針",icon:"🧿",
   effect:stage=>[8,17,26,30].includes(stage)
    ?{key:"equipmentRarityBonus",value:1}
    :{key:"explorationRewardRate",value:.01}
  }
 ]
});

const EFFECT_LABELS=Object.freeze({
 goldGainRate:"すべてのGOLD獲得量",
 manualReturnGoldRate:"手動帰還のGOLD獲得量",
 idleReturnGoldRate:"放置帰還のGOLD獲得量",
 battleGoldRate:"戦闘で得るGOLD",
 equipmentSellGoldRate:"装備の売却GOLD",
 partyHpRate:"味方全体の最大HP",
 partyAtkRate:"味方全体の物理・魔法ATK",
 partyDefRate:"味方全体のDEF",
 partySpdRate:"味方全体のSPD",
 partyDamageRate:"味方全体の与ダメージ",
 partyDamageTakenRate:"味方全体の被ダメージ",
 chestSpawnRate:"宝箱の出現率",
 equipmentDropRate:"装備ドロップ率",
 eliteRewardRate:"エリート敵の報酬量",
 abyssKeyDropRate:"深淵の鍵の獲得率",
 explorationRewardRate:"探索で得るすべての報酬"
});

const CATEGORY_EFFECT_KEYS=Object.freeze({
 economy:["goldGainRate","manualReturnGoldRate","idleReturnGoldRate","battleGoldRate","equipmentSellGoldRate"],
 combat:["partyHpRate","partyAtkRate","partyDefRate","partySpdRate","partyDamageRate","partyDamageTakenRate"],
 exploration:["chestSpawnRate","equipmentDropRate","eliteRewardRate","abyssKeyDropRate","explorationRewardRate","equipmentRarityBonus"]
});

function expansionDescription(effect){
 if(effect.key==="equipmentRarityBonus")return"装備レアリティ抽選をさらに強化";
 const percent=Math.round(Math.abs(effect.value)*1000)/10;
 return`${EFFECT_LABELS[effect.key]??effect.key} ${effect.value<0?"−":"+"}${percent}%`;
}

export function abyssExpansionRewardScale(stageIndex){
 const index=Math.max(0,Math.floor(Number(stageIndex)||0));
 if(index>=30)return 2.5;
 if(index>=24)return 2;
 if(index>=16)return 1.5;
 if(index>=8)return 1.25;
 return 1;
}

function scaledExpansionEffect(effect,stageIndex){
 if(!effect||effect.key==="equipmentRarityBonus")return effect;
 return{...effect,value:Number(((Number(effect.value)||0)*abyssExpansionRewardScale(stageIndex)).toFixed(4))};
}

function expansionNodesForCategory(category){
 const branches=EXPANSION_BRANCHES[category];
 return EXPANSION_STAGES.flatMap((stage,stageIndex)=>branches.map((branch,branchIndex)=>{
  const id=`${category}-${branch.id}-${String(stageIndex+1).padStart(2,"0")}`;
  const previousIds=branches.map(entry=>`${category}-${entry.id}-${String(stageIndex).padStart(2,"0")}`);
  let requires=[],requiresAny=[],requiresAnyCount=0,pathType="lane";
  if(stageIndex===0)requires=[EXPANSION_CAPSTONES[category]];
  else if([7,15,23,30].includes(stageIndex)){
   requiresAny=previousIds;requiresAnyCount=2;pathType="convergence";
  }else if(stageIndex%3===2){
   requiresAny=branchIndex===0
    ?[previousIds[0],previousIds[1]]
    :branchIndex===1
     ?[previousIds[0],previousIds[2]]
     :[previousIds[1],previousIds[2]];
   requiresAnyCount=1;pathType="choice";
  }else requires=[previousIds[branchIndex]];
  const effect=scaledExpansionEffect(branch.effect(stageIndex),stageIndex);
  return{
   id,
   category,
   tier:stageIndex+5,
   icon:branch.icon,
   name:`${branch.name}・${stage.suffix}`,
   description:expansionDescription(effect),
   cost:stage.cost,
   previousCost:version6TreePrice(stage.legacyCost),
   legacyCost:stage.legacyCost,
   requires,
   requiresAny,
   requiresAnyCount,
   lane:branchIndex+1,
   branchId:branch.id,
   branchName:branch.name,
   pathType,
   effect
  };
 }));
}

function unlockFloorForTier(tier){
 const value=Math.max(1,Math.floor(Number(tier)||1));
 if(value<=1)return 5;
 if(value===2)return 10;
 if(value===3)return 20;
 if(value===4)return 30;
 // 31段の専門ルートを30〜100階へ均等に配置する。
 return Math.min(100,30+Math.ceil((value-4)*70/31));
}

export const ABYSS_SKILL_NODES=Object.freeze([
 ...FOUNDATION_SKILL_NODES,
 ...Object.keys(EXPANSION_BRANCHES).flatMap(expansionNodesForCategory)
].map(node=>Object.freeze({...node,unlockFloor:unlockFloorForTier(node.tier)})));

const NODE_BY_ID=new Map(ABYSS_SKILL_NODES.map(node=>[node.id,node]));
const CATEGORY_BY_ID=new Map(ABYSS_SKILL_CATEGORIES.map(category=>[category.id,category]));

const MAGIC_CIRCLE_UNLOCKS=Object.freeze({
 "economy-gold-vein-05":"slot_fate",
 "economy-expedition-guild-08":"gold_power",
 "economy-spoils-market-12":"inheritance",
 "economy-gold-vein-16":"random_arsenal",
 "economy-expedition-guild-22":"sacrifice_lottery",
 "economy-spoils-market-31":"sole_survivor",
 "combat-overlord-blood-05":"last_life",
 "combat-undying-armor-08":"aegis",
 "combat-demonic-circuit-12":"blood_acceleration",
 "combat-overlord-blood-16":"opening_rite",
 "combat-undying-armor-22":"judgment20",
 "combat-demonic-circuit-31":"weak_critical",
 "exploration-relic-map-05":"mana_reversal",
 "exploration-hunter-oath-08":"deep_silence",
 "exploration-fate-compass-12":"reincarnation",
 "exploration-relic-map-16":"death_drain",
 "exploration-hunter-oath-22":"crimson_threshold",
 "exploration-fate-compass-31":"death_mirror"
});

export function magicCircleUnlockForNode(nodeId){return MAGIC_CIRCLE_UNLOCKS[nodeId]??null}

function safeInteger(value,fallback=0){
 const number=Number(value);
 return Number.isFinite(number)?Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(number))):fallback;
}

export function createAbyssSkillTreeState(){
 return{version:ABYSS_SKILL_TREE_VERSION,learned:[],grandfathered:[],paidCosts:{},investedGold:0};
}

export function abyssSkillNodeById(nodeId){
 return NODE_BY_ID.get(nodeId)??null;
}

export function abyssSkillUnlockFloor(nodeOrId){
 // Kept as a compatibility export for older UI modules.  Build332 removed
 // every floor gate: GOLD is the only purchase requirement.
 return 1;
}

export function abyssSkillCategoryById(categoryId){
 return CATEGORY_BY_ID.get(categoryId)??ABYSS_SKILL_CATEGORIES[0];
}

export function abyssSkillBranches(categoryId){
 return(EXPANSION_BRANCHES[categoryId]??[]).map((branch,index)=>({id:branch.id,name:branch.name,icon:branch.icon,lane:index+1}));
}

function prerequisitesMet(node,learnedSet){
 if(!node.requires.every(id=>learnedSet.has(id)))return false;
 const candidates=node.requiresAny??[],needed=Math.max(0,Number(node.requiresAnyCount)||0);
 return!needed||candidates.filter(id=>learnedSet.has(id)).length>=needed;
}

export function normalizeAbyssSkillTree(state){
 const source=state?.abyssSkillTree&&typeof state.abyssSkillTree==="object"&&!Array.isArray(state.abyssSkillTree)
  ?state.abyssSkillTree
  :createAbyssSkillTreeState();
 const sourceVersion=Number(source.version??0);
 const requested=new Set(Array.isArray(source.learned)?source.learned.filter(id=>NODE_BY_ID.has(id)):[]);
 const grandfathered=new Set(Array.isArray(source.grandfathered)?source.grandfathered.filter(id=>requested.has(id)):[]);
 if(sourceVersion<ABYSS_SKILL_TREE_VERSION)requested.forEach(id=>grandfathered.add(id));
 const learned=ABYSS_SKILL_NODES.filter(node=>requested.has(node.id)).map(node=>node.id);
 const learnedSet=new Set(learned);
 const paidCosts={};
 let investedGold=0;
 let rebalanceRefund=0;
 const rebalanceAlreadyApplied=Number(state?.abyssSkillRebalance?.version)>=ABYSS_SKILL_TREE_VERSION;
 const shouldApplyRebalanceRefund=sourceVersion>0&&sourceVersion<ABYSS_SKILL_TREE_VERSION&&!rebalanceAlreadyApplied;
 for(const nodeId of learned){
  const node=NODE_BY_ID.get(nodeId);
  const paid=node.cost;
  paidCosts[nodeId]=paid;
  investedGold=Math.min(Number.MAX_SAFE_INTEGER,investedGold+paid);
  if(shouldApplyRebalanceRefund){
   const recorded=Number(source.paidCosts?.[nodeId]);
   const fallbackPaid=sourceVersion>=6?Number(node.previousCost):Number(node.legacyCost);
   const previousPaid=Number.isFinite(recorded)&&recorded>0?recorded:(Number.isFinite(fallbackPaid)&&fallbackPaid>0?fallbackPaid:node.cost);
   rebalanceRefund=Math.min(Number.MAX_SAFE_INTEGER,rebalanceRefund+Math.max(0,previousPaid-node.cost));
  }
 }
 if(shouldApplyRebalanceRefund){
  state.player??={};
  state.player.gold=Math.min(Number.MAX_SAFE_INTEGER,safeInteger(state.player.gold,0)+rebalanceRefund);
  state.abyssSkillRebalance={version:ABYSS_SKILL_TREE_VERSION,refund:rebalanceRefund,appliedAt:new Date().toISOString()};
 }
 state.abyssSkillTree={
  version:ABYSS_SKILL_TREE_VERSION,
  learned,
  grandfathered:[...grandfathered].filter(id=>learnedSet.has(id)),
  paidCosts,
  investedGold
 };
 for(const nodeId of learned){
  const circleId=magicCircleUnlockForNode(nodeId);
  if(circleId)unlockMagicCircleFromTree(state,circleId);
 }
 return state.abyssSkillTree;
}

export function abyssSkillTreeSummary(state){
 const tree=normalizeAbyssSkillTree(state);
 const learnedSet=new Set(tree.learned);
 const byCategory=Object.fromEntries(ABYSS_SKILL_CATEGORIES.map(category=>[
  category.id,
  {
   learned:ABYSS_SKILL_NODES.filter(node=>node.category===category.id&&learnedSet.has(node.id)).length,
   total:ABYSS_SKILL_NODES.filter(node=>node.category===category.id).length
  }
 ]));
 return{
  learnedCount:tree.learned.length,
  totalCount:ABYSS_SKILL_NODES.length,
  investedGold:tree.investedGold,
  byCategory
 };
}

export function abyssSkillEffects(state){
 const tree=normalizeAbyssSkillTree(state);
 const effects={};
 for(const nodeId of tree.learned){
  const effect=NODE_BY_ID.get(nodeId)?.effect;
  if(!effect)continue;
  effects[effect.key]=(effects[effect.key]??0)+(Number(effect.value)||0);
 }
 return effects;
}

export function abyssSkillEffectSummary(state,categoryId){
 const effects=abyssSkillEffects(state);
 return(CATEGORY_EFFECT_KEYS[categoryId]??[]).map(key=>{
  const value=Number(effects[key])||0;
  if(!value)return null;
  if(key==="equipmentRarityBonus")return{key,label:"装備レア抽選",value,text:`+${Math.floor(value)}段階`};
  const amount=Math.round(Math.abs(value)*1000)/10;
  return{key,label:EFFECT_LABELS[key]??key,value,text:`${value<0?"−":"+"}${amount}%`};
 }).filter(Boolean);
}

export function abyssSkillEffectTotal(state,key){
 return Number(abyssSkillEffects(state)[key])||0;
}

export function abyssSkillMultiplier(state,key){
 return Math.max(0,1+abyssSkillEffectTotal(state,key));
}

export function abyssExplorationChance(state,base,effectKey=null,{additive=false,max=1}={}){
 const initial=Math.max(0,Number(base)||0);
 const specific=effectKey?abyssSkillEffectTotal(state,effectKey):0;
 const chance=additive
  ?initial+specific
  :initial*(1+specific);
 return Math.max(0,Math.min(max,chance));
}

export function abyssEquipmentRarityBonus(state){
 return Math.max(0,Math.floor(abyssSkillEffectTotal(state,"equipmentRarityBonus")));
}

export function abyssGoldReward(state,amount,source="generic"){
 const base=Math.max(0,Number(amount)||0);
 const effects=abyssSkillEffects(state);
 let rate=effects.goldGainRate??0;
 if(source==="manualReturn")rate+=(effects.manualReturnGoldRate??0)+(effects.explorationRewardRate??0);
 if(source==="idleReturn")rate+=(effects.idleReturnGoldRate??0)+(effects.explorationRewardRate??0);
 if(source==="battle")rate+=(effects.battleGoldRate??0)+(effects.explorationRewardRate??0);
 if(source==="elite")rate+=(effects.battleGoldRate??0)+(effects.eliteRewardRate??0)+(effects.explorationRewardRate??0);
 if(source==="equipmentSale")rate+=effects.equipmentSellGoldRate??0;
 if(source==="exploration")rate+=effects.explorationRewardRate??0;
 return Math.max(0,Math.round(base*(1+rate)));
}

export function canLearnAbyssSkill(state,nodeId){
 const node=NODE_BY_ID.get(nodeId);
 if(!node)return{ok:false,reason:"unknown",message:"スキルが見つかりません。"};
 const tree=normalizeAbyssSkillTree(state);
 const learned=new Set(tree.learned);
 if(learned.has(node.id))return{ok:false,reason:"learned",message:"すでに習得済みです。",node};
 const gold=safeInteger(state.player?.gold,0);
 if(gold<node.cost)return{ok:false,reason:"gold",message:`GOLD不足｜あと ${(node.cost-gold).toLocaleString()}G`,node};
 return{ok:true,node};
}

export function learnAbyssSkill(state,nodeId){
 const goldBeforeValidation=safeInteger(state?.player?.gold,0);
 const result=canLearnAbyssSkill(state,nodeId);
 if(!result.ok)return result;
 const tree=state.abyssSkillTree;
 const cost=safeInteger(result.node.cost,0),goldAfterValidation=safeInteger(state.player?.gold,0),debitBase=Math.min(goldBeforeValidation,goldAfterValidation);
 if(cost<=0)return{ok:false,reason:"invalidCost",message:"習得コストが不正です。",node:result.node};
 if(tree.learned.includes(result.node.id))return{ok:false,reason:"learned",message:"すでに習得済みです。",node:result.node};
 if(debitBase<cost){state.player.gold=debitBase;return{ok:false,reason:"gold",message:`GOLD不足｜あと ${(cost-debitBase).toLocaleString()}G`,node:result.node}}
 state.player.gold=debitBase-cost;
 tree.learned=[...tree.learned,result.node.id];
 tree.paidCosts={...tree.paidCosts,[result.node.id]:cost};
 tree.investedGold=Math.min(Number.MAX_SAFE_INTEGER,safeInteger(tree.investedGold,0)+cost);
 const circleId=magicCircleUnlockForNode(result.node.id);
 const circleUnlock=circleId?unlockMagicCircleFromTree(state,circleId):null;
 return{ok:true,node:result.node,cost,tree,circleUnlock};
}

export function resetAbyssSkillTree(state){
 normalizeAbyssSkillTree(state);
 return{ok:false,refund:0,tree:state.abyssSkillTree,message:"深淵ツリーは恒久成長です。一度習得したノードはリセットできません。"};
}
