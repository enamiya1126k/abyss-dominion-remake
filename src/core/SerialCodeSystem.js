import{createMonster,calculatedStats}from"../models/Monster.js?v=2.6.0";
import{allLearnedSkills,maxMp}from"../battle/SkillSystem.js?v=2.6.0";
import{SPECIES}from"../data/species.js?v=2.6.0";
import{ENDGAME_BOSSES}from"./EndgameSystem.js?v=2.6.0";
import{MONSTER_STORAGE_CAP}from"./config.js?v=2.6.0";
import{createEquipment}from"../models/Equipment.js?v=2.6.0";
import{receiveEquipment}from"../services/EquipmentStorage.js?v=2.6.0";

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
  ,"96fa165a21494ee5da765b98892cf27e2e9a65d07405ad061bee7f6ccaa68740":"keys1000"
  ,"9505b9860d63c6840b7d3412246e3d079a473ca07fad1713ac55435d110c2c33":"capture50000"
  ,"0f7ab460833992a0ef63cbe84ebd85eea4de4780c1afb0f0c78b896726e824f1":"tenGodGearPack"
  ,"eff0a78862889d8bf3a4a0eb61895ae0ee8b34172384dee5a1407af1d5f1b6a9":"abyssGearPack"
  ,"dc92610f50c337e3a3d01de089bde66251a595e394199f13f3cfa442e1f1f2c8":"randomLrMonster"
  ,"b1bbce6cc2cbdd44e21bb7bad403e10467dcd36834704cb003db6f67586760a6":"randomMythicMonster"
  ,"5b6f0f23428f299bcf017a96ff9322f8937410bb8820e3f0528c797ade1d1bc1":"randomAbyssMonster"
  ,"69d9fe050e4d7bdf452d8460f7b2a4e4e48fef13274e5af55440b0d2069479f1":"randomTenGodMonster"
  ,"0ee946c08c36317e3c903b6f468710edba7aba78a681808caec070692a167d63":"chappySecret"
  ,"348f49a6b5c31ff339d6509a8192cfc630d20b4172f727cacd4d928b6d8a42a3":"mythicPackEnami"
  ,"4d589a2841ebf423bc321b3b8e2b54591d37a0af404bd1ec96cb1d656cbd26ad":"mythicPackRion"
  ,"ecd4a995b6a7ef734e498ff854e94953e0a5675b3df11748e60029e22a95de49":"mythicPackYori"
  ,"9d5c12ceb74d9ad485bdd55dbdc12916cd52e36ed38bbfbbab40f4920687b2ab":"mythicPackHide"
});

const GAME_MASTER_HASH="dd808decc6532af902eb00cc9a8aad1b5575db84d325c9732fe84256cbd1b15e";
const GAME_MASTER_RESET_HASH="221eaa54f463cdeec89723e15eb5aa7d81a772eb62193c88b0a096a0684e8d6f";

const REWARD_INFO=Object.freeze({
  crystals10000:{title:"魔晶石補給",icon:"💎",message:"魔晶石 10,000個を受け取りました。"},
  gold10000000:{title:"王国金庫",icon:"🪙",message:"10,000,000Gを受け取りました。"},
  keys100:{title:"深淵鍵束",icon:"🔑",message:"深淵の鍵 100個を受け取りました。"},
  tenGodMonster:{title:"十神との特別契約",icon:"🌌"},
  abyssMonster:{title:"深淵との特別契約",icon:"🌑"},
  mythicMonster:{title:"神話召喚",icon:"✨"},
  lrMonster:{title:"LR召喚",icon:"🐉"},
  capture5000:{title:"捕獲支援物資",icon:"📀",message:"捕獲結晶 5,000個を受け取りました。"}
  ,keys1000:{title:"深層鍵庫",icon:"🔑",message:"深淵の鍵 1,000個を受け取りました。"}
  ,capture50000:{title:"超大型捕獲支援",icon:"📀",message:"捕獲結晶 50,000個を受け取りました。"}
  ,tenGodGearPack:{title:"十神装備三種箱",icon:"🌌"}
  ,abyssGearPack:{title:"深淵装備三種箱",icon:"🌑"}
  ,randomLrMonster:{title:"ランダムLR契約",icon:"🐉"}
  ,randomMythicMonster:{title:"ランダム神話契約",icon:"✨"}
  ,randomAbyssMonster:{title:"ランダム深淵契約",icon:"🌑"}
  ,randomTenGodMonster:{title:"ランダム十神契約",icon:"🌌"}
  ,chappySecret:{title:"開発室からの封印便",icon:"🛠️"}
  ,mythicPackEnami:{title:"神話限定・えなみ創世パック",icon:"🎮"}
  ,mythicPackRion:{title:"神話限定・りおん万能パック",icon:"💚"}
  ,mythicPackYori:{title:"神話限定・より蒼晶パック",icon:"🔷"}
  ,mythicPackHide:{title:"神話限定・ひで紅殻パック",icon:"🦞"}
});

const MYTHIC_PACKS=Object.freeze({
  mythicPackEnami:{speciesId:"myth_enami",owner:"enami",names:["創世のゲームパッド","スパイシールーレット","星海山空のオレンジコート","多動の冒険靴","ゲームマスターの鍵","万象創作のダイス"]},
  mythicPackRion:{speciesId:"myth_rion",owner:"rion",names:["話術","万能の段取り帳","主人公のグリーンコート","フッ軽スニーカー","理学療法士","マダムキラーの微笑み"]},
  mythicPackYori:{speciesId:"myth_yori",owner:"yori",names:["ライフル","剛腕の素手","ヘルメット","迷彩服","アルコール","テトラポット"]},
  mythicPackHide:{speciesId:"myth_hide",owner:"hide",names:["ザリガニの左腕","ザリガニの右腕","ザリガニの甲冑","ピンクタイツ","狩猟免許","修士号"]}
});

export const SERIAL_CODE_COUNT=Object.keys(CODE_REWARDS).length;

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
  return(state.monsters?.length??0)>=MONSTER_STORAGE_CAP;
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
    stars:10,
    rank:4,
    plus,
    affection,
    favorite:true,
    locked:true,
    ivs:{hp:minimumIv,atk:minimumIv,def:minimumIv,spd:minimumIv},
    attribute:boss.element??SPECIES[boss.speciesId]?.element,
    obtainedFloor:Math.max(1,Number(state.player?.maxFloor)||1),
    obtainedMethod:"serialCode",
    endgameBossId:bossId,
    endgameFaction:boss.faction,
    isContractedEndgame:true,
    allowEndgameLevel:true,
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
    stars:10,
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

function randomEntry(entries){return entries[Math.floor(Math.random()*entries.length)]??null}
function randomSpeciesId(rarity){return randomEntry(Object.values(SPECIES).filter(species=>species.rarity===rarity&&species.id!=="dev_familiar_chappy"&&!species.serialOnly&&!species.gachaExcluded))?.id??null}
function randomEndgameBossId(faction){return randomEntry(Object.values(ENDGAME_BOSSES).filter(boss=>boss.faction===faction))?.id??null}
function rewardMonsterRequired(rewardId){return rewardId.endsWith("Monster")||rewardId==="chappySecret"||Boolean(MYTHIC_PACKS[rewardId])}
function createFactionEquipment(faction,slot){
 const bosses=Object.values(ENDGAME_BOSSES).filter(boss=>boss.faction===faction),boss=randomEntry(bosses),rarity=faction==="tenGod"?"十神":"深淵",item=createEquipment(slot,{rarity,series:boss?.seriesId,ruleOverrides:{endgame:true}}),name=boss?.gearNames?.[slot]??boss?.gear?.find(gear=>gear.slot===slot)?.name;
 if(name)item.name=name;item.endgameBossId=boss?.id??null;item.endgameFaction=faction;item.favorite=true;item.rewardTier=rarity;return item
}
function grantEquipment(state,item){const receipt=receiveEquipment(state,item);return{item,receipt}}
function grantFactionPack(state,faction,countPerSlot=1){
 const granted=[];for(const slot of["weapon","armor","accessory"])for(let index=0;index<countPerSlot;index++)granted.push(grantEquipment(state,createFactionEquipment(faction,slot)));return granted
}
function createChappy(state){
 const monster=createRarityRewardMonster(state,"dev_familiar_chappy","SECRET",130,13,1000,10);monster.nickname="開発使魔チャッピー";monster.locked=true;
 const weapon=createEquipment("weapon",{rarity:"神話",handedness:"either",ruleOverrides:{unsellable:true,secret:true}});weapon.name="未完成兵装《PATCH//404》";weapon.stats={atk:404,matk:404,spd:40,crit:4};weapon.favorite=true;weapon.locked=true;weapon.rewardTier="神話";
 return{monster,weapon}
}

function createMythicPackEquipment(pack,index){
 const slots=["weapon","weapon","armor","armor","accessory","accessory"],slot=slots[index],item=createEquipment(slot,{rarity:"神話",handedness:slot==="weapon"?"either":null,ruleOverrides:{unsellable:true,serialOnly:true,mythicOwner:pack.speciesId}});
 item.name=pack.names[index];item.visualAsset=`./assets/ui/equipment/mythic/${pack.owner}-${["weapon-1","weapon-2","armor-1","armor-2","accessory-1","accessory-2"][index]}.png`;item.favorite=true;item.locked=true;item.rewardTier="神話";item.affixes=[];
 const stats=[{atk:280,matk:210,spd:28,crit:14},{atk:220,matk:270,spd:32,crit:10},{hp:720,def:245,mdef:195},{hp:520,def:190,mdef:180,spd:20},{hp:260,atk:90,matk:90,spd:30},{def:80,mdef:80,crit:16,evasion:14}];
 item.stats={...stats[index]};return item
}

function createMythicPackMonster(state,pack){
 const species=SPECIES[pack.speciesId];if(!species)throw new Error("神話限定キャラのデータが見つかりません。");
 const monster=createMonster(pack.speciesId,{nickname:species.name,level:1,stars:10,rank:4,plus:50,affection:1000,favorite:true,locked:true,ivs:{hp:100,atk:100,def:100,spd:100},obtainedFloor:Math.max(1,Number(state.player?.maxFloor)||1),obtainedMethod:"serialCode",tags:[...(species.tags??[]),"serialOnly","invincibleAlliance"]});
 monster.summonTier="神話";monster.summonRarity="神話";prepareSkillMastery(monster,5);monster.currentHp=calculatedStats(monster).hp;monster.currentMp=maxMp(monster);return monster
}

function grantMythicPack(state,rewardId){
 const pack=MYTHIC_PACKS[rewardId],monster=createMythicPackMonster(state,pack),equipment=[],targetSlots=["weaponRight","weaponLeft","armorBody","armorSupport","accessoryNeck","accessoryFinger"];
 monster.equipment={weaponRight:null,weaponLeft:null,armorBody:null,armorSupport:null,accessoryNeck:null,accessoryFinger:null};
 for(let index=0;index<6;index++){
  const granted=grantEquipment(state,createMythicPackEquipment(pack,index));equipment.push(granted);
  if(granted.receipt.location==="inventory"){granted.item.equippedBy=monster.id;monster.equipment[targetSlots[index]]=granted.item.id}
 }
 return{monster,equipment,pack}
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
  if(rewardMonsterRequired(rewardId)&&monsterCapacityReached(state))return{ok:false,message:`モンスター所持数が${MONSTER_STORAGE_CAP}体で満杯です。整理してからもう一度入力してください。`};
  return{ok:true,rewardId,...REWARD_INFO[rewardId]};
}

export function applySerialReward(state,rewardId){
  const info=REWARD_INFO[rewardId];
  if(!info)return{ok:false,message:"報酬データが見つかりません。"};
  if(rewardMonsterRequired(rewardId)&&monsterCapacityReached(state))return{ok:false,message:`モンスター所持数が${MONSTER_STORAGE_CAP}体で満杯です。`};
  state.player??={};
  state.inventory??={};
  let monster=null,message=info.message,equipment=[];
  if(rewardId==="crystals10000")state.player.crystals=finiteInteger(state.player.crystals)+10000;
  else if(rewardId==="gold10000000")state.player.gold=finiteInteger(state.player.gold)+10000000;
  else if(rewardId==="keys100")state.inventory.abyssKeys=finiteInteger(state.inventory.abyssKeys)+100;
  else if(rewardId==="capture5000")state.inventory.captureCrystals=finiteInteger(state.inventory.captureCrystals)+5000;
  else if(rewardId==="keys1000")state.inventory.abyssKeys=finiteInteger(state.inventory.abyssKeys)+1000;
  else if(rewardId==="capture50000")state.inventory.captureCrystals=finiteInteger(state.inventory.captureCrystals)+50000;
  else if(rewardId==="tenGodMonster")monster=createEndgameRewardMonster(state,"ten_divinity","十神",100);
  else if(rewardId==="abyssMonster")monster=createEndgameRewardMonster(state,"abyss_pride","深淵",75);
  else if(rewardId==="mythicMonster")monster=createRarityRewardMonster(state,"creator_dragon","神話",60,10,500,3);
  else if(rewardId==="lrMonster")monster=createRarityRewardMonster(state,"ancient_dragon","LR",45,5,300,2);
  else if(rewardId==="randomLrMonster")monster=createRarityRewardMonster(state,randomSpeciesId("LR"),"LR",50,5,350,3);
  else if(rewardId==="randomMythicMonster")monster=createRarityRewardMonster(state,randomSpeciesId("神話"),"神話",70,10,550,4);
  else if(rewardId==="randomAbyssMonster")monster=createEndgameRewardMonster(state,randomEndgameBossId("abyss"),"深淵",80);
  else if(rewardId==="randomTenGodMonster")monster=createEndgameRewardMonster(state,randomEndgameBossId("tenGod"),"十神",100);
  else if(rewardId==="tenGodGearPack"){const equipment=grantFactionPack(state,"tenGod");message=`十神装備を武器・防具・アクセサリー各1個（計${equipment.length}個）受け取りました。`}
  else if(rewardId==="abyssGearPack"){const equipment=grantFactionPack(state,"abyss");message=`深淵装備を武器・防具・アクセサリー各1個（計${equipment.length}個）受け取りました。`}
  else if(rewardId==="chappySecret"){const secret=createChappy(state);monster=secret.monster;grantEquipment(state,secret.weapon);message="開発使魔チャッピーと未完成兵装《PATCH//404》が仲間になりました。"}
  else if(MYTHIC_PACKS[rewardId]){const pack=grantMythicPack(state,rewardId);monster=pack.monster;equipment=pack.equipment;message=`神話限定 ${monster.nickname}と専用装備6点を受け取りました。`}
  if(monster)recordMonsterAcquisition(state,monster);
  const redeemedAt=new Date().toISOString();
  normalizeSerialCodeState(state).redeemed[rewardId]={at:redeemedAt};
  return{
    ok:true,
    rewardId,
    title:info.title,
    icon:info.icon,
    monster,
    equipment,
    message:message??(monster?`${monster.nickname}（${monster.summonTier} / Lv.${monster.level} / ★${monster.stars}）が仲間になりました。`:"報酬を受け取りました。")
  };
}

export async function validateGameMasterCode(state,rawCode){
 const normalized=normalizeSerialInput(rawCode);if(!normalized)return{ok:false,message:"GMコードを入力してください。"};let hash;
 try{hash=await sha256(normalized)}catch(error){return{ok:false,message:error.message}}
 if(hash===GAME_MASTER_RESET_HASH)return{ok:true,kind:"reset"};
 if(hash!==GAME_MASTER_HASH)return{ok:false,message:"GMコードが正しくありません。"};
 if(state.gameMaster?.claimedAt)return{ok:false,message:"GM支援パックはこのセーブで受取済みです。"};
 if((state.monsters?.length??0)>MONSTER_STORAGE_CAP-4)return{ok:false,message:"十神4体分のモンスター所持枠を空けてください。"};
 return{ok:true,kind:"grant"}
}

export function applyGameMasterReward(state){
 if(state.gameMaster?.claimedAt)return{ok:false,message:"GM支援パックは受取済みです。"};
 state.player??={};state.inventory??={};state.settings??={};state.monsters??=[];
 state.player.gold=finiteInteger(state.player.gold)+100000000;state.player.crystals=finiteInteger(state.player.crystals)+100000;
 state.inventory.abyssKeys=finiteInteger(state.inventory.abyssKeys)+1000;state.inventory.captureCrystals=finiteInteger(state.inventory.captureCrystals)+50000;state.inventory.experienceItems=finiteInteger(state.inventory.experienceItems)+50;
 const equipment=[...grantFactionPack(state,"tenGod",4),...grantFactionPack(state,"abyss",4)];
 const tenGodIds=Object.values(ENDGAME_BOSSES).filter(boss=>boss.faction==="tenGod").map(boss=>boss.id);const monsters=[];
 for(let index=0;index<4;index++){const monster=createEndgameRewardMonster(state,randomEntry(tenGodIds),"十神",100);recordMonsterAcquisition(state,monster);monsters.push(monster)}
 state.settings.gmFloorUnlockMax=9998;state.gameMaster={claimedAt:new Date().toISOString(),floorUnlockMax:9998,equipmentGranted:equipment.length,monsterIds:monsters.map(monster=>monster.id)};
 return{ok:true,message:`EXP結晶50個、資源一式、深淵・十神装備各12個、十神4体を受け取り、1〜9998階の出発選択を解放しました。`,equipment,monsters}
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
