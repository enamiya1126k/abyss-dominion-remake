import{COMPLETE_MONSTER_CODEX,codexCollectionSummary,rewardDescription}from"./CollectionRewardSystem.js?v=3.0.1-build301";
import{enqueueNoticeReward}from"./NoticeSystem.js?v=2.11.86-build262";
import{FLOOR_BOSS_CATALOG}from"../data/floorBosses.js?v=2.11.86-build262";

const number=value=>Math.max(0,Math.floor(Number(value)||0));
const unique=value=>[...new Set(Array.isArray(value)?value.map(String).filter(Boolean):[])];
const reward=(gold,crystals,extra={})=>Object.freeze({gold,crystals,...extra});
const definition=(id,group,icon,title,description,metric,target,rewardValue)=>Object.freeze({id,group,icon,title,description,metric,target,reward:rewardValue});

export const ACHIEVEMENT_DEFINITIONS=Object.freeze([
 definition("floor-10","探索","🗺️","地下世界への第一歩","最高到達階層10階", "maxFloor",10,reward(50000,50,{captureCrystals:10})),
 definition("floor-30","探索","🗺️","三日を越えし者","最高到達階層30階", "maxFloor",30,reward(250000,150,{captureCrystals:25})),
 definition("floor-50","探索","🌑","予言の折り返し","最高到達階層50階", "maxFloor",50,reward(1000000,500,{abyssKeys:5,experienceItemsUltra:3})),
 definition("floor-70","探索","👑","七深淵の支配者","最高到達階層70階", "maxFloor",70,reward(3000000,1000,{abyssKeys:10,mythicEquipment:1,equipmentPlus:30})),
 definition("floor-90","探索","🌌","神域を破る者","最高到達階層90階", "maxFloor",90,reward(10000000,2500,{abyssKeys:30,mythicEquipment:1,equipmentPlus:60})),
 definition("floor-100","探索","✨","百階完全制覇","最高到達階層100階", "maxFloor",100,reward(50000000,10000,{abyssKeys:100,mythicEquipment:3,equipmentPlus:99})),

 definition("kills-100","戦闘","⚔️","百の討伐","累計撃破数100体", "kills",100,reward(100000,100,{experienceItemsUltra:1})),
 definition("kills-1000","戦闘","⚔️","千の討伐","累計撃破数1,000体", "kills",1000,reward(1000000,400,{experienceItemsUltra:5})),
 definition("kills-10000","戦闘","🔥","万魔撃滅","累計撃破数10,000体", "kills",10000,reward(10000000,1500,{mythicEquipment:1,equipmentPlus:50})),
 definition("captures-10","捕獲","🔮","契約の始まり","累計捕獲数10体", "captures",10,reward(100000,100,{captureCrystals:30})),
 definition("captures-100","捕獲","🔮","百契約の盟主","累計捕獲数100体", "captures",100,reward(1000000,500,{captureCrystals:150})),
 definition("captures-300","捕獲","💠","万象との盟約","累計捕獲数300体", "captures",300,reward(5000000,1500,{captureCrystals:500,mythicEquipment:1,equipmentPlus:40})),
 definition("chests-10","収集","🧰","宝箱探し","宝箱を10個開封", "chests",10,reward(100000,100,{fullHeals:1})),
 definition("chests-100","収集","💎","宝物庫の主","宝箱を100個開封", "chests",100,reward(2000000,750,{abyssKeys:10,experienceItemsUltra:5})),

 definition("bosses-1","ボス","♛","最初の階層王","階層ボスを1種撃破", "floorBosses",1,reward(250000,150,{experienceItemsUltra:1})),
 definition("bosses-10","ボス","♛","十王撃破","階層ボスを10種撃破", "floorBosses",10,reward(1500000,500,{abyssKeys:10})),
 definition("bosses-50","ボス","👑","半界制圧","階層ボスを50種撃破", "floorBosses",50,reward(7500000,2000,{abyssKeys:40,mythicEquipment:1,equipmentPlus:60})),
 definition("bosses-90","ボス","👑","九十王完全制覇","階層ボス90種を撃破", "floorBosses",90,reward(25000000,5000,{abyssKeys:100,mythicEquipment:2,equipmentPlus:99})),
 definition("abyss-1","契約","🌌","深淵との契約","深淵を1体獲得", "abyssOwned",1,reward(1000000,500,{abyssKeys:10})),
 definition("abyss-7","契約","🌌","七深淵の集結","深淵7体を獲得", "abyssOwned",7,reward(10000000,3000,{abyssKeys:70,mythicEquipment:1,equipmentPlus:70})),
 definition("tengod-1","契約","✨","神域への接触","十神を1体獲得", "tenGodOwned",1,reward(3000000,1000,{abyssKeys:20})),
 definition("tengod-10","契約","✨","十神集結","十神10体を獲得", "tenGodOwned",10,reward(30000000,7500,{abyssKeys:100,mythicEquipment:2,equipmentPlus:99})),
 definition("serial-4","契約","🎟️","四つの限定契約","シリアル限定魔物を4体獲得", "serialOwned",4,reward(2000000,1000,{captureCrystals:200})),

 definition("coop-1","オンライン","🤝","初めての共同探索","共同探索で1階踏破", "coopExpeditions",1,reward(250000,150,{captureCrystals:20})),
 definition("coop-25","オンライン","🤝","共闘の熟練者","共同探索で25階踏破", "coopExpeditions",25,reward(2500000,750,{captureCrystals:100,abyssKeys:10})),
 definition("coop-battles-100","オンライン","⚔️","百戦共闘","オンライン戦闘で100勝", "coopBattles",100,reward(5000000,1250,{experienceItemsUltra:10})),
 definition("raid-1","オンライン","🐉","レイド初討伐","ワールドレイドで1勝", "raidWins",1,reward(1000000,500,{abyssKeys:10})),
 definition("raid-10","オンライン","🐉","レイドブレイカー","ワールドレイドで10勝", "raidWins",10,reward(10000000,2500,{abyssKeys:50,mythicEquipment:1,equipmentPlus:70})),
 definition("trade-1","オンライン","🔁","初めての安全交換","プレイヤー交換を1回完了", "trades",1,reward(500000,250,{captureCrystals:30})),

 definition("power-10000","育成","💪","戦力一万","歴代最高戦力10,000", "combatPower",10000,reward(500000,250,{experienceItemsUltra:3})),
 definition("power-100000","育成","💪","戦力十万","歴代最高戦力100,000", "combatPower",100000,reward(3000000,1000,{experienceItemsUltra:10})),
 definition("power-1000000","育成","🌠","戦力百万","歴代最高戦力1,000,000", "combatPower",1000000,reward(15000000,3500,{mythicEquipment:1,equipmentPlus:80})),
 definition("mythic-1","育成","🗡️","神話装備の所有者","神話装備を1個獲得", "mythicEquipment",1,reward(500000,300,{experienceItemsUltra:2})),
 definition("mythic-10","育成","🗡️","神話武装庫","神話装備を10個獲得", "mythicEquipment",10,reward(5000000,1500,{abyssKeys:25,mythicEquipment:1,equipmentPlus:50})),
 definition("plus-100","育成","🔨","極限強化","装備の最高強化値+100", "equipmentPlus",100,reward(3000000,1000,{experienceItemsUltra:10,mythicEquipment:1,equipmentPlus:60}))
]);

function openedChestCount(state){
 const opened=state?.player?.openedChests;if(!opened||typeof opened!=="object")return 0;
 return Object.values(opened).reduce((sum,value)=>sum+(Array.isArray(value)?new Set(value.map(String)).size:value&&typeof value==="object"?Object.values(value).filter(Boolean).length:value?1:0),0)
}
function floorBossVictoryCount(state){
 const player=state?.player??{},victories=state?.floorBossChallenges?.victories??{};
 return FLOOR_BOSS_CATALOG.filter(boss=>number(player.bossKills?.[boss.floor])>0||Object.prototype.hasOwnProperty.call(player.bossRewards??{},String(boss.floor))||Object.prototype.hasOwnProperty.call(player.pendingBossRewards??{},String(boss.floor))||Boolean(victories[boss.id])).length
}
function equipmentList(state){return[...(state?.equipment??[]),...(state?.reserveEquipment??[]),...(state?.bossEquipmentVault??[])]}

export function achievementMetrics(state){
 const codex=codexCollectionSummary(state),capturesFromCodex=Object.values(state?.codex?.captures??{}).reduce((sum,value)=>sum+number(value),0),equipment=equipmentList(state),online=state?.onlineParty??{};
 const serialOwned=COMPLETE_MONSTER_CODEX.filter(entry=>entry.kind==="limited"&&entry.id!=="juvenile_amalga"&&codex.ownedKeys.has(entry.key)).length;
 return Object.freeze({
  maxFloor:number(state?.player?.maxFloor),kills:number(state?.records?.kills),captures:Math.max(number(state?.records?.captures),capturesFromCodex,number(state?.monsters?.length)),
  chests:Math.max(number(state?.records?.chests),openedChestCount(state)),floorBosses:floorBossVictoryCount(state),
  abyssOwned:number(codex.byGroup?.["深淵"]?.owned),tenGodOwned:number(codex.byGroup?.["十神"]?.owned),serialOwned,
  coopExpeditions:number(online.expeditionsCompleted),coopBattles:number(online.battlesWon),raidWins:number(online.raidWins),trades:Math.max(number(online.completedTradeIds?.length),number(online.tradeHistory?.length)),
  combatPower:Math.max(number(state?.records?.combatPower?.highest),number(state?.records?.combatPower?.previous)),
  mythicEquipment:equipment.filter(item=>String(item?.rarity??item?.displayRarity)==="神話").length,equipmentPlus:equipment.reduce((best,item)=>Math.max(best,number(item?.plus)),0)
 })
}

export function normalizeAchievementState(state){
 const source=state?.achievements&&typeof state.achievements==="object"&&!Array.isArray(state.achievements)?state.achievements:{};
 const unlockedIds=unique(source.unlockedIds),queuedIds=unique(source.queuedIds),unlockedAt=source.unlockedAt&&typeof source.unlockedAt==="object"&&!Array.isArray(source.unlockedAt)?source.unlockedAt:{};
 state.achievements={...source,version:1,unlockedIds,queuedIds,unlockedAt:Object.fromEntries(Object.entries(unlockedAt).filter(([id,value])=>id&&Number.isFinite(Date.parse(value))).slice(-200))};
 return state.achievements
}

export function achievementStatuses(state){
 const metrics=achievementMetrics(state),achievements=normalizeAchievementState(state),unlocked=new Set(achievements.unlockedIds),inbox=new Map((state?.notices?.rewardInbox??[]).map(entry=>[entry?.id,entry]));
 const queued=new Set(achievements.queuedIds);
 return ACHIEVEMENT_DEFINITIONS.map(entry=>{const current=number(metrics[entry.metric]),complete=unlocked.has(entry.id)||current>=entry.target,rewardEntry=inbox.get(`achievement-${entry.id}-v1`),wasQueued=queued.has(entry.id);return{...entry,current,complete,progress:Math.min(1,current/Math.max(1,entry.target)),claimed:Boolean(rewardEntry?.claimedAt||wasQueued&&!rewardEntry),queued:Boolean(rewardEntry||wasQueued)}})
}

export function achievementSummary(state){
 const statuses=achievementStatuses(state),unlocked=statuses.filter(entry=>entry.complete).length;
 return{unlocked,total:statuses.length,complete:unlocked===statuses.length,groups:Object.fromEntries([...new Set(statuses.map(entry=>entry.group))].map(group=>{const rows=statuses.filter(entry=>entry.group===group);return[group,{unlocked:rows.filter(entry=>entry.complete).length,total:rows.length}]})),statuses}
}

export function syncAchievementRewardInbox(state,{now=Date.now()}={}){
 const achievements=normalizeAchievementState(state),metrics=achievementMetrics(state),unlocked=new Set(achievements.unlockedIds),queued=new Set(achievements.queuedIds);let added=0,newlyUnlocked=0;
 for(const entry of ACHIEVEMENT_DEFINITIONS){
  if(number(metrics[entry.metric])<entry.target)continue;
  if(!unlocked.has(entry.id)){unlocked.add(entry.id);achievements.unlockedAt[entry.id]=new Date(now).toISOString();newlyUnlocked++}
  if(queued.has(entry.id))continue;
  const queuedResult=enqueueNoticeReward(state,{id:`achievement-${entry.id}-v1`,source:"achievement",kind:"gift",icon:entry.icon,label:"実績達成",title:entry.title,body:`${entry.description}・${rewardDescription(entry.reward)}`,reward:entry.reward,receivedAt:now});
  if(queuedResult.ok){queued.add(entry.id);if(!queuedResult.duplicate)added++}
 }
 achievements.unlockedIds=[...unlocked].slice(-200);achievements.queuedIds=[...queued].slice(-200);achievements.lastSyncedAt=new Date(now).toISOString();
 return{added,newlyUnlocked,summary:achievementSummary(state)}
}
