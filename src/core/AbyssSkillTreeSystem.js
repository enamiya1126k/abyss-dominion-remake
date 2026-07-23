export const ABYSS_SKILL_TREE_VERSION=1;

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

export const ABYSS_SKILL_NODES=Object.freeze([
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
 const sourcePaid=source.paidCosts&&typeof source.paidCosts==="object"&&!Array.isArray(source.paidCosts)?source.paidCosts:{};
 const paidCosts={};
 let investedGold=0;
 for(const nodeId of learned){
  const node=NODE_BY_ID.get(nodeId);
  const paid=safeInteger(sourcePaid[nodeId],node.cost);
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
