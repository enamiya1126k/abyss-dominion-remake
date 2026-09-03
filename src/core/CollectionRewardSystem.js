import{SPECIES}from"../data/species.js?v=3.1.1-build311";
import{orderedMonsterSpecies}from"../data/monsterCatalog.js?v=3.1.1-build311";
import{FLOOR_BOSS_CATALOG}from"../data/floorBosses.js?v=3.1.1-build311";
import{ENDGAME_BOSSES}from"./EndgameSystem.js?v=3.1.1-build311";
import{floorBossCampaignDisplayFloor}from"./Campaign100System.js?v=3.1.1-build311";

const LIMITED_TAGS=new Set(["mythicSerial","serialOnly","raidLimited","eventLimited","limited"]);
const number=value=>Math.max(0,Math.floor(Number(value)||0));
const unique=value=>[...new Set(Array.isArray(value)?value.map(String).filter(Boolean):[])];

function isLimitedSpecies(species){
 return Boolean(species?.serialOnly||species?.raidLimited||species?.tags?.some(tag=>LIMITED_TAGS.has(tag))||["dev_familiar_chappy","juvenile_amalga"].includes(species?.id)||species?.acquisition?.some(source=>/シリアル限定|週間レイド/.test(String(source))));
}

function limitedSource(species){
 if(species?.id==="juvenile_amalga"||species?.raidLimited||species?.tags?.includes("raidLimited")||species?.tags?.includes("weekly")||species?.acquisition?.some(source=>/週間レイド/.test(String(source))))return"週間レイド限定交換";
 return"専用シリアルコード"
}

function ordinaryEntry(species,index){
 const limited=isLimitedSpecies(species);
 return Object.freeze({
  key:`species:${species.id}`,id:species.id,kind:limited?"limited":"ordinary",group:limited?"限定魔物":"通常魔物",
  name:species.name,rarity:species.rarity??"N",element:species.element??"neutral",visualId:species.id,emoji:species.emoji??"魔",
  speciesId:species.id,sort:index,source:limited?limitedSource(species):"探索・召喚・交換"
 });
}

function floorBossEntry(boss,index){
 const campaignFloor=floorBossCampaignDisplayFloor(boss)??boss.floor;
 return Object.freeze({
  key:`floorBoss:${boss.id}`,id:boss.id,kind:"floorBoss",group:"階層ボス",name:boss.name,rarity:"神話",element:boss.element??"neutral",
  visualId:boss.visualSpeciesId??boss.id,emoji:SPECIES[boss.speciesId]?.emoji??"♛",speciesId:boss.speciesId,floorBossCatalogId:boss.id,
  sort:10000+index,source:`${campaignFloor}階ボスの欠片契約`,floor:campaignFloor,title:boss.title??"階層を統べる者"
 });
}

function endgameEntry(boss,index){
 const divine=boss.faction==="tenGod";
 return Object.freeze({
  key:`endgame:${boss.id}`,id:boss.id,kind:divine?"tenGod":"abyss",group:divine?"十神":"深淵",name:boss.name,
  rarity:divine?"十神":"深淵",element:boss.element??"neutral",visualId:boss.id,emoji:boss.icon??"✦",speciesId:boss.speciesId,endgameBossId:boss.id,
  sort:20000+index,source:divine?"十神の欠片契約":"深淵ガチャ（日曜）・深淵の欠片契約",title:boss.title??boss.role??"世界法則"
 });
}

export function completeMonsterCodex(){
 const ordinary=orderedMonsterSpecies(SPECIES).map(ordinaryEntry),bosses=FLOOR_BOSS_CATALOG.map(floorBossEntry),endgame=Object.values(ENDGAME_BOSSES).map(endgameEntry);
 return Object.freeze([...ordinary,...bosses,...endgame]);
}

export const COMPLETE_MONSTER_CODEX=completeMonsterCodex();
const VALID_CODEX_KEYS=new Set(COMPLETE_MONSTER_CODEX.map(entry=>entry.key));
const CODEX_ENTRY_BY_KEY=new Map(COMPLETE_MONSTER_CODEX.map(entry=>[entry.key,entry]));
const FLOOR_BOSS_IDS=new Set(FLOOR_BOSS_CATALOG.map(entry=>entry.id));
const ENDGAME_BOSS_IDS=new Set(Object.keys(ENDGAME_BOSSES));

function monsterCodexKey(monster){
 if(monster?.floorBossCatalogId&&FLOOR_BOSS_IDS.has(monster.floorBossCatalogId))return`floorBoss:${monster.floorBossCatalogId}`;
 if(monster?.endgameBossId&&ENDGAME_BOSS_IDS.has(monster.endgameBossId))return`endgame:${monster.endgameBossId}`;
 if(monster?.speciesId&&SPECIES[monster.speciesId])return`species:${monster.speciesId}`;
 return null
}

export function normalizeMonsterCodexRegistry(state){
 state.codex=state?.codex&&typeof state.codex==="object"&&!Array.isArray(state.codex)?state.codex:{};
 const keys=new Set((Array.isArray(state.codex.acquiredMonsterKeys)?state.codex.acquiredMonsterKeys:[]).map(String).filter(key=>VALID_CODEX_KEYS.has(key)));
 for(const monster of state?.monsters??[]){const key=monsterCodexKey(monster);if(key)keys.add(key)}
 for(const[bossId,contract]of Object.entries(state?.floorBossChallenges?.contracts??{}))if(contract&&FLOOR_BOSS_IDS.has(bossId))keys.add(`floorBoss:${bossId}`);
 for(const contracts of[state?.endgame?.contracts??{},state?.endgame?.emergency?.contracts??{}])for(const[bossId,contract]of Object.entries(contracts))if((contract===true||contract?.contracted===true)&&ENDGAME_BOSS_IDS.has(bossId))keys.add(`endgame:${bossId}`);
 // Resolve exact special contracts before interpreting legacy species capture
 // counters. Otherwise a released special body can reveal its ordinary body too.
 const specialSpecies=new Set();for(const key of keys){const entry=CODEX_ENTRY_BY_KEY.get(key);if(entry&&["floorBoss","abyss","tenGod"].includes(entry.kind))specialSpecies.add(entry.speciesId)}
 // Legacy counters contain quantities, not form IDs. Once an exact special
 // contract is known, extra copies cannot prove that the ordinary form existed.
 for(const[speciesId,count]of Object.entries(state.codex.captures??{}))if(number(count)>0&&!specialSpecies.has(speciesId)&&SPECIES[speciesId])keys.add(`species:${speciesId}`);
 state.codex.acquiredMonsterKeys=COMPLETE_MONSTER_CODEX.map(entry=>entry.key).filter(key=>keys.has(key));
 return new Set(state.codex.acquiredMonsterKeys)
}

export function ownedCodexKeys(state){
 return normalizeMonsterCodexRegistry(state)
}

export function codexCollectionSummary(state){
 const owned=ownedCodexKeys(state),entries=COMPLETE_MONSTER_CODEX,byGroup={};
 for(const entry of entries){const group=byGroup[entry.group]??={owned:0,total:0};group.total++;if(owned.has(entry.key))group.owned++}
 return{owned:owned.size,total:entries.length,complete:owned.size>=entries.length,ownedKeys:owned,byGroup};
}

export function codexRewardMilestones(total=COMPLETE_MONSTER_CODEX.length){
 const maximum=Math.max(0,number(total)),values=[];
 for(let value=10;value<=maximum;value+=10)values.push(value);
 if(maximum&&!values.includes(maximum))values.push(maximum);
 return values;
}

export function collectionMilestoneReward(milestone,{complete=false}={}){
 const count=Math.max(1,number(milestone)),major=count%50===0||complete,century=count%100===0||complete;
 return Object.freeze({
  gold:Math.max(250000,count*count*1000),crystals:Math.max(250,count*20),captureCrystals:Math.max(10,Math.ceil(count/2)),
  abyssKeys:major?Math.max(10,Math.floor(count/5)):0,experienceItemsUltra:major?Math.max(3,Math.floor(count/10)):1,
  fullHeals:century?Math.max(3,Math.floor(count/50)):0,partyFullHeals:century?1:0,
  mythicEquipment:major?1:0,equipmentPlus:major?Math.min(99,20+Math.floor(count/10)):0
 });
}

export function rewardDescription(reward={}){
 return[
  reward.gold?`${number(reward.gold).toLocaleString()}G`:"",reward.crystals?`魔晶石 ×${number(reward.crystals)}`:"",
  reward.captureCrystals?`捕獲結晶 ×${number(reward.captureCrystals)}`:"",reward.abyssKeys?`深淵の鍵 ×${number(reward.abyssKeys)}`:"",
  reward.experienceItemsUltra?`特大EXP結晶 ×${number(reward.experienceItemsUltra)}`:"",reward.fullHeals?`完全回復薬 ×${number(reward.fullHeals)}`:"",
  reward.partyFullHeals?`全体完全回復薬 ×${number(reward.partyFullHeals)}`:"",reward.mythicEquipment?`神話装備${reward.equipmentPlus?` +${number(reward.equipmentPlus)}`:""} ×${number(reward.mythicEquipment)}`:""
 ].filter(Boolean).join("・");
}

function rewardInbox(state){
 state.notices=state.notices&&typeof state.notices==="object"&&!Array.isArray(state.notices)?state.notices:{};
 state.notices.rewardInbox=Array.isArray(state.notices.rewardInbox)?state.notices.rewardInbox:[];
 return state.notices.rewardInbox;
}

export function syncCollectionRewardInbox(state,{now=Date.now()}={}){
 state.collectionRewards=state.collectionRewards&&typeof state.collectionRewards==="object"&&!Array.isArray(state.collectionRewards)?state.collectionRewards:{};
 const summary=codexCollectionSummary(state),queued=unique(state.collectionRewards.queuedMilestones),inbox=rewardInbox(state),known=new Set([...queued,...inbox.filter(entry=>entry?.source==="codex").map(entry=>String(entry.milestone))]);let added=0;
 for(const milestone of codexRewardMilestones(summary.total)){
  if(summary.owned<milestone||known.has(String(milestone)))continue;
  const complete=milestone===summary.total,reward=collectionMilestoneReward(milestone,{complete}),id=`codex-milestone-${milestone}-v1`;
  inbox.unshift({id,source:"codex",kind:"gift",icon:complete?"👑":"📚",label:complete?"図鑑完全制覇":"図鑑達成報酬",title:complete?"全魔物図鑑 COMPLETE！":`魔物図鑑 ${milestone}種達成！`,body:rewardDescription(reward),reward,milestone,receivedAt:new Date(now).toISOString(),claimedAt:null});
  queued.push(String(milestone));known.add(String(milestone));added++;
 }
 state.notices.rewardInbox=inbox;state.collectionRewards.queuedMilestones=unique(queued).slice(-80);state.collectionRewards.lastOwnedCount=summary.owned;state.collectionRewards.total=summary.total;
 return{added,summary};
}
