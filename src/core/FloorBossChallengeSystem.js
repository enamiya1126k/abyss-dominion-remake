import{FLOOR_BOSS_CATALOG,floorBossDefinitionById}from"../data/floorBosses.js?v=2.11.30-build195";
import{SPECIES}from"../data/species.js?v=2.11.82-build258";

export const FLOOR_BOSS_CONTRACT_COST=50;
export const FLOOR_BOSS_EQUIPMENT_COST=20;

function object(value){return value&&typeof value==="object"&&!Array.isArray(value)?value:{}}
function integer(value,min=0,max=Number.MAX_SAFE_INTEGER){const number=Math.floor(Number(value)||0);return Math.max(min,Math.min(max,number))}

export function normalizeFloorBossChallengeState(state){
 const current=object(state.floorBossChallenges);
 current.discovered=object(current.discovered);
 current.encounters=object(current.encounters);
 current.fragments=object(current.fragments);
 current.victories=object(current.victories);
 current.contracts=object(current.contracts);
 current.processedResults=object(current.processedResults);
 for(const boss of FLOOR_BOSS_CATALOG){
  current.discovered[boss.id]=Boolean(current.discovered[boss.id]);
  current.encounters[boss.id]=integer(current.encounters[boss.id]);
  current.fragments[boss.id]=integer(current.fragments[boss.id]);
  current.victories[boss.id]=integer(current.victories[boss.id]);
  current.contracts[boss.id]=Boolean(current.contracts[boss.id]);
 }
 const resultKeys=Object.keys(current.processedResults);
 if(resultKeys.length>500)current.processedResults=Object.fromEntries(resultKeys.slice(-500).map(key=>[key,current.processedResults[key]]));
 state.floorBossChallenges=current;
 return current;
}

export function recordFloorBossDiscovery(state,bossId){
 const boss=floorBossDefinitionById(bossId);if(!boss)return null;
 const challenge=normalizeFloorBossChallengeState(state),first=!challenge.discovered[boss.id];
 challenge.discovered[boss.id]=true;challenge.encounters[boss.id]=integer(challenge.encounters[boss.id])+1;
 return{boss,first,encounters:challenge.encounters[boss.id]};
}

export function floorBossChallengeStatus(state,bossId){
 const boss=floorBossDefinitionById(bossId);if(!boss)return null;
 const challenge=normalizeFloorBossChallengeState(state),fragments=integer(challenge.fragments[boss.id]),victories=integer(challenge.victories[boss.id]);
 return{boss,unlocked:Boolean(challenge.discovered[boss.id]),encounters:integer(challenge.encounters[boss.id]),fragments,victories,contracted:Boolean(challenge.contracts[boss.id]),contractCost:FLOOR_BOSS_CONTRACT_COST,equipmentCost:FLOOR_BOSS_EQUIPMENT_COST};
}

function compatibleSupports(boss){
 const candidates=Object.values(SPECIES).filter(species=>species.id!==boss.speciesId&&species.fieldEncounter!==false&&!species.ultraRareEncounter&&!species.isAbyss&&!species.isTenGod&&!['深淵','十神'].includes(species.rarity)&&((species.element??"neutral")===boss.element||(species.race&&species.race===SPECIES[boss.speciesId]?.race)));
 const fallback=Object.values(SPECIES).filter(species=>species.id!==boss.speciesId&&species.fieldEncounter!==false&&!species.ultraRareEncounter&&!species.isAbyss&&!species.isTenGod);
 const source=candidates.length>=3?candidates:fallback,seed=Math.max(0,Math.floor(boss.floor/10));
 return Array.from({length:3},(_,index)=>source[(seed*7+index*11)%Math.max(1,source.length)]).filter(Boolean);
}

export function floorBossEnemyEntry(boss,{level=boss?.floor??10,statMultiplier=1,hpMultiplier=2.2,label="再戦"}={}){
 if(!boss)return null;
 return{speciesId:boss.speciesId,visualSpeciesId:boss.visualSpeciesId??boss.speciesId,level:Math.max(1,integer(level,1,10000)),boss:true,nameOverride:`${boss.name}〈${label}〉`,floorBossCatalogId:boss.id,floorBossTitle:boss.title,floorBossQuote:boss.quote,floorBossStats:boss.stats,floorBossActionIds:boss.actionIds,floorBossPassive:boss.passive,floorBossDomain:boss.domain,floorBossAi:boss.ai,dedicatedWeapon:boss.dedicatedWeapon,combatRarity:boss.rarity,attribute:boss.element,trialElement:boss.element,role:boss.role,uncapturable:true,fixedTrialScaling:true,fixedTrialHpMultiplier:Math.max(1,Number(hpMultiplier)||1),enemyFloor:boss.floor,statMultiplier:Math.max(.01,Number(statMultiplier)||1)};
}

export function createFloorBossChallengeEncounter(state,bossId){
 const status=floorBossChallengeStatus(state,bossId);if(!status?.unlocked)return null;
 const boss=status.boss,cycle=Math.floor(status.victories/10),level=Math.min(10000,Math.max(boss.floor,Math.round(boss.floor+cycle*25))),scale=1+cycle*.12;
 const leader=floorBossEnemyEntry(boss,{level,statMultiplier:scale,hpMultiplier:2.35,label:"欠片試練"});
 const supports=compatibleSupports(boss).map((species,index)=>({speciesId:species.id,level:Math.max(1,level-5-index*2),nameOverride:`${boss.name.split("の")[0]}の随伴・${index+1}`,trialElement:boss.element,uncapturable:true,fixedTrialScaling:true,fixedTrialHpMultiplier:1.15,enemyFloor:boss.floor,statMultiplier:(.68+index*.05)*scale,floorBossChallengeSupport:true}));
 return{definition:boss,enemies:[leader,...supports]};
}

export function awardFloorBossChallengeFragments(state,bossId,won,battleId){
 const status=floorBossChallengeStatus(state,bossId);if(!status)return{ok:false,amount:0};
 const challenge=normalizeFloorBossChallengeState(state),key=String(battleId??"");
 if(key&&challenge.processedResults[key])return{...challenge.processedResults[key],duplicate:true};
 let amount=0,firstVictory=false;
 if(won){
  firstVictory=status.victories===0;
  amount=firstVictory?10:Math.min(5,2+Math.floor(status.boss.floor/300));
  challenge.victories[bossId]=status.victories+1;challenge.fragments[bossId]=status.fragments+amount;
 }
 const result={ok:true,bossId,won:Boolean(won),amount,firstVictory,fragments:challenge.fragments[bossId],victories:challenge.victories[bossId]};
 if(key)challenge.processedResults[key]=result;
 return result;
}

export function spendFloorBossFragments(state,bossId,reward){
 const status=floorBossChallengeStatus(state,bossId);if(!status?.unlocked)return{ok:false,message:"ダンジョンでこの階層ボスに出会うと解禁されます。"};
 const challenge=normalizeFloorBossChallengeState(state),body=reward==="monster",piece=["weapon","armor","accessory"].includes(reward)?reward:null,cost=body?FLOOR_BOSS_CONTRACT_COST:piece?FLOOR_BOSS_EQUIPMENT_COST:0;
 if(!cost)return{ok:false,message:"交換対象が見つかりません。"};
 if(body&&status.contracted)return{ok:false,message:"この階層ボス本体は契約済みです。"};
 if(status.fragments<cost)return{ok:false,message:`欠片が不足しています（${status.fragments}/${cost}）`};
 challenge.fragments[bossId]=status.fragments-cost;if(body)challenge.contracts[bossId]=true;
 return{ok:true,boss:status.boss,reward,piece,cost,remaining:challenge.fragments[bossId]};
}

export function restoreFloorBossFragments(state,bossId,amount,{contract=false}={}){
 const challenge=normalizeFloorBossChallengeState(state);challenge.fragments[bossId]=integer(challenge.fragments[bossId])+integer(amount);if(contract)challenge.contracts[bossId]=false;return challenge.fragments[bossId];
}
