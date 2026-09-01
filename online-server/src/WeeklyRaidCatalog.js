const WEEK_MS=7*24*60*60*1000;
const ROTATION_EPOCH=Date.UTC(2026,0,5);

export const WEEKLY_RAID_BOSSES=Object.freeze([
 Object.freeze({
  id:"abyss-amalga",name:"終焉融骸・アビス＝マルガ",shortName:"終焉融骸",level:50,maxHp:50_000,
  element:"dark",accent:"#b45cff",heroAsset:"./assets/online/raid-abyss-amalgam.png",visualBase:"./assets/online/raid/abyss-amalga",
  materialName:"融骸核片",contractName:"融骸幼体アマルガ",contractSpeciesId:"juvenile_amalga",contractVisualBase:"./assets/online/raid/juvenile-amalga",
  equipmentName:"終焉喰らいの大刃",circleName:"即死返鏡陣",circleId:"death_mirror",
  intro:"千の命を取り込んだ融骸。倒れた仲間の影を作り、残った者へ襲いかかる。",
  subBoss:{id:"juvenile-amalga",name:"深淵の融骸幼体アマルガ",level:200,maxHp:12_500,element:"dark",visualBase:"./assets/online/raid/juvenile-amalga",attackName:"幼体融解爪",respawnDelayRounds:1,maxRespawnsPerAttempt:2,rewardableKillsPerCampaign:1},
  patterns:[{name:"赤核穿孔",count:1,rate:.72,magic:false},{name:"千口同哭",count:2,rate:.5,magic:true},{name:"腐界圧壊",count:99,rate:.36,magic:true},{name:"崩星捕食",count:1,rate:.82,magic:false}],
 }),
 Object.freeze({
  id:"zero-sovereign",name:"零界凍皇・ニヴル＝レギア",shortName:"零界凍皇",level:180,maxHp:60_000,
  element:"ice",accent:"#65d9ff",heroAsset:"./assets/monsters/169_frost_sovereign/idle1.png",visualBase:"./assets/monsters/169_frost_sovereign",
  materialName:"零界核片",contractName:"零界皇ニヴルシア",contractSpeciesId:"frost_sovereign",contractVisualBase:"./assets/monsters/169_frost_sovereign",
  equipmentName:"凍星断界剣",circleName:"絶零封界陣",circleId:"absolute_zero",
  intro:"熱と回復を封じる氷界の皇。長引くほど凍結圧が増し、守りを削り取る。",
  subBoss:{id:"frost-core",name:"零界核・フロストコア",level:220,maxHp:14_000,element:"ice",visualBase:"./assets/monsters/018_frost_slime",attackName:"凍核衝"},
  patterns:[{name:"氷葬槍",count:1,rate:.7,magic:true},{name:"凍界連鎖",count:2,rate:.48,magic:true},{name:"白夜零落",count:99,rate:.34,magic:true},{name:"絶対零圧",count:1,rate:.86,magic:false}],
 }),
 Object.freeze({
  id:"vajra-beast",name:"雷獄天獣・ヴァジュリオン",shortName:"雷獄天獣",level:320,maxHp:70_000,
  element:"lightning",accent:"#ffd95a",heroAsset:"./assets/monsters/104_thunder_emperor/idle1.png",visualBase:"./assets/monsters/104_thunder_emperor",
  materialName:"雷獄核片",contractName:"雷帝獣ヴァジュラ",contractSpeciesId:"thunder_emperor",contractVisualBase:"./assets/monsters/104_thunder_emperor",
  equipmentName:"天雷轟断牙",circleName:"雷獄連環陣",circleId:"thunder_prison",
  intro:"雷を食らって加速する天獣。標的を連続で狙い、後半ほど行動が苛烈になる。",
  subBoss:{id:"thunder-core",name:"雷獄眷属・スパークコア",level:360,maxHp:16_000,element:"lightning",visualBase:"./assets/monsters/049_spark_moth",attackName:"連雷牙"},
  patterns:[{name:"迅雷穿牙",count:1,rate:.76,magic:false},{name:"雷鎖追撃",count:2,rate:.52,magic:false},{name:"天獄落雷",count:99,rate:.38,magic:true},{name:"神速雷葬",count:1,rate:.9,magic:false}],
 }),
]);

export const WEEKLY_RAID_MODIFIERS=Object.freeze([
 Object.freeze({id:"overdrive",name:"攻勢共鳴",icon:"⚔",description:"味方の与ダメージ+15%。敵から受けるダメージも+10%。",playerDamage:1.15,incomingDamage:1.1}),
 Object.freeze({id:"healing_lock",name:"治癒封鎖",icon:"◆",description:"HP回復量が50%に低下。蘇生による回復は低下しない。",healing:0.5}),
 Object.freeze({id:"silent_critical",name:"無響結界",icon:"◇",description:"敵味方ともにクリティカルが発生しない。",disableCritical:true}),
 Object.freeze({id:"rescue_chain",name:"救命連鎖",icon:"✦",description:"仲間を蘇生すると、生存者全員の攻撃・防御+20%（2ターン）。",reviveBoost:.2}),
 Object.freeze({id:"collapse_accel",name:"崩壊加速",icon:"‼",description:"第6ラウンド以降、ボスの攻撃が毎ターン5%ずつ上昇（最大40%）。",lateDamagePerRound:.05,lateDamageMax:.4}),
]);

function safeNow(value){const number=Number(value);return Number.isFinite(number)?number:Date.now()}
export function weeklyRaidState(now=Date.now()){
 const time=safeNow(now),weekIndex=Math.max(0,Math.floor((time-ROTATION_EPOCH)/WEEK_MS)),startsAt=ROTATION_EPOCH+weekIndex*WEEK_MS,endsAt=startsAt+WEEK_MS;
 const boss=WEEKLY_RAID_BOSSES[weekIndex%WEEKLY_RAID_BOSSES.length],modifier=WEEKLY_RAID_MODIFIERS[weekIndex%WEEKLY_RAID_MODIFIERS.length];
 return{weekId:`weekly-${weekIndex}`,weekIndex,startsAt,endsAt,boss:{...boss,subBoss:{...boss.subBoss},patterns:boss.patterns.map(entry=>({...entry}))},modifier:{...modifier}};
}

export function raidBossById(id){return WEEKLY_RAID_BOSSES.find(entry=>entry.id===id)??WEEKLY_RAID_BOSSES[0]}
export function raidModifierById(id){return WEEKLY_RAID_MODIFIERS.find(entry=>entry.id===id)??WEEKLY_RAID_MODIFIERS[0]}
