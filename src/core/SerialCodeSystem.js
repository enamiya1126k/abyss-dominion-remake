import{createMonster,calculatedStats}from"../models/Monster.js?v=1.7.0";
import{allLearnedSkills,maxMp}from"../battle/SkillSystem.js?v=1.7.0";
import{SPECIES}from"../data/species.js?v=1.7.0";
import{ENDGAME_BOSSES}from"./EndgameSystem.js?v=1.0.0";

const DEVICE_LEDGER_KEY="abyss-dominion-serial-ledger-v1";

const CODE_REWARDS=Object.freeze({
  "6cae36d5b863cd1a016f0ce9395adbb9d89ff1dfe38eebe146c79a5953960d5a":"crystals10000",
  "083a8cc4c2c465a273c05507721ae0a116ffc35c53ae6ea1dc6b563729c2a491":"gold10000000",
  "11e533dd689b4c78724544450e61e322e317fc45f2297a0533cc85b9fd30ac25":"keys100",
  "ceb2718cb3cc53e9667a1a08d295ff4dddf5909387ccb61b36caab8a2e1c5e88":"tenGodMonster",
  "52fc627d0c5fbffd10717d9da601eb8a80ae05196f6c81bbe02f72d5ec903299":"abyssMonster",
  "c3483e6a40a8fe7a93abfdec290c5e4069227d6f583befc23e191ebfb5e7f254":"mythicMonster",
  "67574ed4708115e8d4a888edf4abc487934cba6597198d51253e49f6bb65668f":"lrMonster",
  "91f57a06ab5db692919d415690123f9c5993a204e5a231d436e5679ee13d3cbd":"capture5000"
});

const REWARD_INFO=Object.freeze({
  crystals10000:{title:"魔晶石補給",icon:"💎",message:"魔晶石 10,000個を受け取りました。"},
  gold10000000:{title:"王国金庫",icon:"🪙",message:"10,000,000Gを受け取りました。"},
  keys100:{title:"深淵鍵束",icon:"🔑",message:"深淵の鍵 100個を受け取りました。"},
  tenGodMonster:{title:"十神との特別契約",icon:"🌌"},
  abyssMonster:{title:"深淵との特別契約",icon:"🌑"},
  mythicMonster:{title:"神話召喚",icon:"✨"},
  lrMonster:{title:"LR召喚",icon:"🐉"},
  capture5000:{title:"捕獲支援物資",icon:"📀",message:"捕獲結晶 5,000個を受け取りました。"}
});

function finiteInteger(value,fallback=0){
  const number=Number(value);
  return Number.isFinite(number)?Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(number))):fallback;
}

export function normalizeSerialCodeState(state){
  state.serialCodes=state.serialCodes&&typeof state.serialCodes==="object"&&!Array.isArray(state.serialCodes)?state.serialCodes:{};
  state.serialCodes.redeemed=state.serialCodes.redeemed&&typeof state.serialCodes.redeemed==="object"&&!Array.isArray(state.serialCodes.redeemed)?state.serialCodes.redeemed:{};
  const deviceLedger=loadDeviceLedger();
  for(const[rewardId,record]of Object.entries(deviceLedger)){
    if(REWARD_INFO[rewardId]&&!state.serialCodes.redeemed[rewardId])state.serialCodes.redeemed[rewardId]={at:record?.at??null,device:true};
  }
  return state.serialCodes;
}

export function normalizeSerialInput(value){
  return String(value??"").trim().toUpperCase().replace(/[^A-Z0-9]/g,"");
}

async function sha256(value){
  if(!globalThis.crypto?.subtle||typeof TextEncoder==="undefined")throw new Error("このブラウザではシリアルコード認証を利用できません。");
  const bytes=await globalThis.crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,"0")).join("");
}

function loadDeviceLedger(){
  try{
    const parsed=JSON.parse(globalThis.localStorage?.getItem(DEVICE_LEDGER_KEY)??"{}");
    return parsed&&typeof parsed==="object"&&!Array.isArray(parsed)?parsed:{};
  }catch{
    return{};
  }
}

function monsterCapacityReached(state){
  return(state.monsters?.length??0)>=500;
}

function prepareSkillMastery(monster,level){
  const skills=allLearnedSkills(monster).slice(-4);
  monster.equippedSkills=skills.map(skill=>skill.id);
  monster.skillProgress={};
  for(const skill of skills){
    monster.skillProgress[skill.id]={level,exp:0,uses:0,need:level>=10?0:25*level};
  }
}

function createEndgameRewardMonster(state,bossId,tier,level){
  const boss=ENDGAME_BOSSES[bossId];
  if(!boss)throw new Error("特別契約データが見つかりません。");
  const divine=boss.faction==="tenGod",plus=divine?50:25,affection=divine?1000:750,minimumIv=divine?100:95;
  const monster=createMonster(boss.speciesId,{
    nickname:boss.name,
    title:boss.title,
    level,
    stars:5,
    rank:4,
    plus,
    affection,
    favorite:true,
    locked:true,
    ivs:{hp:minimumIv,atk:minimumIv,def:minimumIv,spd:minimumIv},
    attribute:boss.element??SPECIES[boss.speciesId]?.element,
    obtainedFloor:Math.max(1,Number(state.player?.maxFloor)||1),
    obtainedMethod:"serialCode",
    tags:[SPECIES[boss.speciesId]?.race,boss.faction,bossId,"contractedEndgame"].filter(Boolean)
  });
  monster.summonTier=tier;
  monster.summonRarity=tier;
  monster.endgameBossId=bossId;
  monster.endgameFaction=boss.faction;
  monster.contractSignature=boss.signature;
  monster.contractSignatureName=boss.skills?.[0]??boss.signature;
  monster.contractSeriesId=boss.seriesId;
  monster.isContractedEndgame=true;
  monster.contractProfileVersion=1;
  prepareSkillMastery(monster,divine?5:3);
  monster.currentHp=calculatedStats(monster).hp;
  monster.currentMp=maxMp(monster);
  return monster;
}

function createRarityRewardMonster(state,speciesId,tier,level,plus,affection,skillLevel){
  const species=SPECIES[speciesId];
  if(!species)throw new Error("召喚対象のデータが見つかりません。");
  const monster=createMonster(speciesId,{
    nickname:species.name,
    level,
    stars:5,
    rank:4,
    plus,
    affection,
    favorite:true,
    ivs:{hp:95,atk:95,def:95,spd:95},
    obtainedFloor:Math.max(1,Number(state.player?.maxFloor)||1),
    obtainedMethod:"serialCode"
  });
  monster.summonTier=tier;
  monster.summonRarity=tier;
  prepareSkillMastery(monster,skillLevel);
  monster.currentHp=calculatedStats(monster).hp;
  monster.currentMp=maxMp(monster);
  return monster;
}

function recordMonsterAcquisition(state,monster){
  state.monsters??=[];
  state.monsters.push(monster);
  state.codex??={};
  state.codex.encounters??={};
  state.codex.captures??={};
  state.codex.encounters[monster.speciesId]=(state.codex.encounters[monster.speciesId]??0)+1;
  state.codex.captures[monster.speciesId]=(state.codex.captures[monster.speciesId]??0)+1;
}

export async function validateSerialCode(state,rawCode){
  const normalized=normalizeSerialInput(rawCode);
  if(!normalized)return{ok:false,message:"シリアルコードを入力してください。"};
  let hash;
  try{hash=await sha256(normalized)}catch(error){return{ok:false,message:error.message}};
  const rewardId=CODE_REWARDS[hash];
  if(!rewardId)return{ok:false,message:"コードが正しくないか、期限外です。"};
  const redeemed=normalizeSerialCodeState(state).redeemed;
  if(redeemed[rewardId]||loadDeviceLedger()[rewardId])return{ok:false,message:"このコードはすでに使用済みです。"};
  if(rewardId.endsWith("Monster")&&monsterCapacityReached(state))return{ok:false,message:"モンスター所持数が500体で満杯です。整理してからもう一度入力してください。"};
  return{ok:true,rewardId,...REWARD_INFO[rewardId]};
}

export function applySerialReward(state,rewardId){
  const info=REWARD_INFO[rewardId];
  if(!info)return{ok:false,message:"報酬データが見つかりません。"};
  if(rewardId.endsWith("Monster")&&monsterCapacityReached(state))return{ok:false,message:"モンスター所持数が500体で満杯です。"};
  state.player??={};
  state.inventory??={};
  let monster=null;
  if(rewardId==="crystals10000")state.player.crystals=finiteInteger(state.player.crystals)+10000;
  else if(rewardId==="gold10000000")state.player.gold=finiteInteger(state.player.gold)+10000000;
  else if(rewardId==="keys100")state.inventory.abyssKeys=finiteInteger(state.inventory.abyssKeys)+100;
  else if(rewardId==="capture5000")state.inventory.captureCrystals=finiteInteger(state.inventory.captureCrystals)+5000;
  else if(rewardId==="tenGodMonster")monster=createEndgameRewardMonster(state,"ten_space","十神",100);
  else if(rewardId==="abyssMonster")monster=createEndgameRewardMonster(state,"abyss_pride","深淵",75);
  else if(rewardId==="mythicMonster")monster=createRarityRewardMonster(state,"creator_dragon","神話",60,10,500,3);
  else if(rewardId==="lrMonster")monster=createRarityRewardMonster(state,"ancient_dragon","LR",45,5,300,2);
  if(monster)recordMonsterAcquisition(state,monster);
  const redeemedAt=new Date().toISOString();
  normalizeSerialCodeState(state).redeemed[rewardId]={at:redeemedAt};
  return{
    ok:true,
    rewardId,
    title:info.title,
    icon:info.icon,
    monster,
    message:monster?`${monster.nickname}（${monster.summonTier} / Lv.${monster.level} / ⭐5）が仲間になりました。`:info.message
  };
}

export function commitSerialRedemption(rewardId){
  const ledger=loadDeviceLedger();
  ledger[rewardId]={at:new Date().toISOString()};
  try{
    globalThis.localStorage?.setItem(DEVICE_LEDGER_KEY,JSON.stringify(ledger));
    return true;
  }catch{
    return false;
  }
}
