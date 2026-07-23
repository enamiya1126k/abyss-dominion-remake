export const ABYSS_SKILL_TREE_VERSION=2;

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
  description:"味方全体のATK +3%",
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
  description:"宝箱の出現率 +5%",
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
  description:"装備ドロップ率 +5%",
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
  description:"エリート敵の報酬量 +10%",
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
  description:"装備レアリティ抽選を強化",
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
  description:"深淵の鍵の獲得率 +10%",
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
  description:"探索で得るすべての報酬 +5%",
  cost:60000,
  requires:["exploration-abyss-luck","exploration-key-echo"],
  effect:{key:"explorationRewardRate",value:.05}
 }
]);

const EXPANSION_STAGES=Object.freeze([
 {suffix:"萌芽",cost:120000},
 {suffix:"脈動",cost:300000},
 {suffix:"刻印",cost:750000},
 {suffix:"共鳴",cost:2000000},
 {suffix:"転成",cost:5000000},
 {suffix:"顕現",cost:12000000},
 {suffix:"超越",cost:30000000},
 {suffix:"支配",cost:75000000},
 {suffix:"終極",cost:180000000}
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
   effect:stage=>(stage+1)%3===0
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
 partyAtkRate:"味方全体のATK",
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

function expansionDescription(effect){
 if(effect.key==="equipmentRarityBonus")return"装備レアリティ抽選をさらに強化";
 const percent=Math.round(Math.abs(effect.value)*1000)/10;
 return`${EFFECT_LABELS[effect.key]??effect.key} ${effect.value<0?"−":"+"}${percent}%`;
}

function expansionNodesForCategory(category){
 const branches=EXPANSION_BRANCHES[category];
 return EXPANSION_STAGES.flatMap((stage,stageIndex)=>branches.map((branch,branchIndex)=>{
  const id=`${category}-${branch.id}-${String(stageIndex+1).padStart(2,"0")}`;
  const requires=stageIndex===0
   ?[EXPANSION_CAPSTONES[category]]
   :[`${category}-${branch.id}-${String(stageIndex).padStart(2,"0")}`];
  // Three major convergence tiers prevent a single straight branch from
  // unlocking the entire late tree while keeping every dependency in the
  // immediately preceding tier for deterministic legacy-save normalization.
  if(stageIndex>0&&[3,6,8].includes(stageIndex)){
   const neighbor=branches[(branchIndex+branches.length-1)%branches.length];
   requires.push(`${category}-${neighbor.id}-${String(stageIndex).padStart(2,"0")}`);
  }
  const effect=branch.effect(stageIndex);
  return{
   id,
   category,
   tier:stageIndex+5,
   icon:branch.icon,
   name:`${branch.name}・${stage.suffix}`,
   description:expansionDescription(effect),
   cost:stage.cost,
   requires:[...new Set(requires)],
   effect
  };
 }));
}

export const ABYSS_SKILL_NODES=Object.freeze([
 ...FOUNDATION_SKILL_NODES,
 ...Object.keys(EXPANSION_BRANCHES).flatMap(expansionNodesForCategory)
]);

const NODE_BY_ID=new Map(ABYSS_SKILL_NODES.map(node=>[node.id,node]));
const CATEGORY_BY_ID=new Map(ABYSS_SKILL_CATEGORIES.map(category=>[category.id,category]));

function safeInteger(value,fallback=0){
 const number=Number(value);
 return Number.isFinite(number)?Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(number))):fallback;
}

export function createAbyssSkillTreeState(){
 return{version:ABYSS_SKILL_TREE_VERSION,learned:[],paidCosts:{},investedGold:0};
}

export function abyssSkillNodeById(nodeId){
 return NODE_BY_ID.get(nodeId)??null;
}

export function abyssSkillCategoryById(categoryId){
 return CATEGORY_BY_ID.get(categoryId)??ABYSS_SKILL_CATEGORIES[0];
}

export function normalizeAbyssSkillTree(state){
 const source=state?.abyssSkillTree&&typeof state.abyssSkillTree==="object"&&!Array.isArray(state.abyssSkillTree)
  ?state.abyssSkillTree
  :createAbyssSkillTreeState();
 const requested=new Set(Array.isArray(source.learned)?source.learned.filter(id=>NODE_BY_ID.has(id)):[]);
 const learned=[];
 const learnedSet=new Set();
 for(const node of ABYSS_SKILL_NODES){
  if(!requested.has(node.id)||!node.requires.every(id=>learnedSet.has(id)))continue;
  learned.push(node.id);
  learnedSet.add(node.id);
 }
 const paidCosts={};
 let investedGold=0;
 for(const nodeId of learned){
  const node=NODE_BY_ID.get(nodeId);
  // Node prices are fixed and there are no discounts. Rebuild this value from
  // the learned nodes so a damaged legacy paidCosts entry can never reduce the
  // amount returned by the free full reset.
  const paid=node.cost;
  paidCosts[nodeId]=paid;
  investedGold=Math.min(Number.MAX_SAFE_INTEGER,investedGold+paid);
 }
 state.abyssSkillTree={
  version:ABYSS_SKILL_TREE_VERSION,
  learned,
  paidCosts,
  investedGold
 };
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

export function abyssSkillEffectTotal(state,key){
 return Number(abyssSkillEffects(state)[key])||0;
}

export function abyssSkillMultiplier(state,key){
 return Math.max(0,1+abyssSkillEffectTotal(state,key));
}

export function abyssExplorationChance(state,base,effectKey=null,{additive=false,max=1}={}){
 const initial=Math.max(0,Number(base)||0);
 const specific=effectKey?abyssSkillEffectTotal(state,effectKey):0;
 const exploration=abyssSkillEffectTotal(state,"explorationRewardRate");
 const chance=additive
  ?(initial+specific)*(1+exploration)
  :initial*(1+specific+exploration);
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
 const missing=node.requires.filter(id=>!learned.has(id));
 if(missing.length){
  const names=missing.map(id=>NODE_BY_ID.get(id)?.name).filter(Boolean).join("・");
  return{ok:false,reason:"prerequisite",message:`先に「${names}」を習得してください。`,node,missing};
 }
 const gold=safeInteger(state.player?.gold,0);
 if(gold<node.cost)return{ok:false,reason:"gold",message:`GOLDが不足しています。あと${(node.cost-gold).toLocaleString()}G必要です。`,node};
 return{ok:true,node};
}

export function learnAbyssSkill(state,nodeId){
 const result=canLearnAbyssSkill(state,nodeId);
 if(!result.ok)return result;
 const tree=state.abyssSkillTree;
 state.player.gold=safeInteger(state.player.gold,0)-result.node.cost;
 tree.learned.push(result.node.id);
 tree.paidCosts[result.node.id]=result.node.cost;
 tree.investedGold=Math.min(Number.MAX_SAFE_INTEGER,tree.investedGold+result.node.cost);
 return{ok:true,node:result.node,cost:result.node.cost,tree};
}

export function resetAbyssSkillTree(state){
 const tree=normalizeAbyssSkillTree(state);
 const refund=tree.investedGold;
 state.player.gold=Math.min(Number.MAX_SAFE_INTEGER,safeInteger(state.player?.gold,0)+refund);
 state.abyssSkillTree=createAbyssSkillTreeState();
 return{ok:true,refund,tree:state.abyssSkillTree};
}
