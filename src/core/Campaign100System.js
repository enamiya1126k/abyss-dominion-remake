export const CAMPAIGN_MAX_FLOOR=100;
export const CAMPAIGN_KEYS_PER_FLOOR=3;
export const CAMPAIGN_ROOM_MIN=4;
export const CAMPAIGN_ROOM_MAX=6;

export const CAMPAIGN_ELEMENTS=Object.freeze(["fire","water","wind","earth","ice","thunder","light","dark","poison"]);
export const CAMPAIGN_ROOM_PROFILES=Object.freeze({
 neutral:Object.freeze({id:"neutral",name:"無",logoAttribute:"neutral",combatAttribute:"neutral",encounterAttributes:Object.freeze(["neutral"]),dungeonTheme:"ruins",battleTheme:"default"}),
 fire:Object.freeze({id:"fire",name:"火",logoAttribute:"fire",combatAttribute:"fire",encounterAttributes:Object.freeze(["fire"]),dungeonTheme:"magma",battleTheme:"fire"}),
 water:Object.freeze({id:"water",name:"水",logoAttribute:"water",combatAttribute:"water",encounterAttributes:Object.freeze(["water"]),dungeonTheme:"deepsea",battleTheme:"water"}),
 wind:Object.freeze({id:"wind",name:"風",logoAttribute:"wind",combatAttribute:"wind",encounterAttributes:Object.freeze(["wind"]),dungeonTheme:"jungle",battleTheme:"wind"}),
 earth:Object.freeze({id:"earth",name:"土",logoAttribute:"earth",combatAttribute:"earth",encounterAttributes:Object.freeze(["earth"]),dungeonTheme:"ruins",battleTheme:"earth"}),
 ice:Object.freeze({id:"ice",name:"氷",logoAttribute:"ice",combatAttribute:"ice",encounterAttributes:Object.freeze(["ice"]),dungeonTheme:"ice",battleTheme:"ice"}),
 thunder:Object.freeze({id:"thunder",name:"雷",logoAttribute:"lightning",combatAttribute:"lightning",encounterAttributes:Object.freeze(["lightning","thunder"]),dungeonTheme:"storm",battleTheme:"lightning"}),
 lightning:Object.freeze({id:"lightning",name:"雷",logoAttribute:"lightning",combatAttribute:"lightning",encounterAttributes:Object.freeze(["lightning","thunder"]),dungeonTheme:"storm",battleTheme:"lightning"}),
 light:Object.freeze({id:"light",name:"光",logoAttribute:"light",combatAttribute:"light",encounterAttributes:Object.freeze(["light"]),dungeonTheme:"sacred",battleTheme:"light"}),
 dark:Object.freeze({id:"dark",name:"闇",logoAttribute:"dark",combatAttribute:"dark",encounterAttributes:Object.freeze(["dark"]),dungeonTheme:"void",battleTheme:"dark"}),
 poison:Object.freeze({id:"poison",name:"瘴毒",logoAttribute:"dark",combatAttribute:"dark",encounterAttributes:Object.freeze(["dark","earth","water"]),dungeonTheme:"poison",battleTheme:"poison"})
});
export function campaignRoomProfile(attribute){return CAMPAIGN_ROOM_PROFILES[String(attribute??"neutral").toLowerCase()]??CAMPAIGN_ROOM_PROFILES.neutral}
export const HERO_PARTY_IDS=Object.freeze(["myth_enami","myth_yori","myth_hide","myth_rion"]);

export const CAMPAIGN_DAYS=Object.freeze([
 {day:1,from:1,to:10,title:"予言",summary:"預言者リオネルが告げる。勇者一行は西の大陸を発ち、魔王城を目指した。",heroLocation:"西の大陸・王都門"},
 {day:2,from:11,to:20,title:"徴兵",summary:"勇者一行は西岸の港へ到達。魔界では迎撃に備えて戦力を集める。",heroLocation:"西の大陸・港湾都市"},
 {day:3,from:21,to:30,title:"侵食",summary:"勇者一行を乗せた船が黒潮海峡へ入る。深淵の気配も迷宮へ混ざり始める。",heroLocation:"黒潮海峡"},
 {day:4,from:31,to:40,title:"反逆",summary:"勇者一行は魔界沿岸へ上陸。魔王の統率と、現在の部隊の結束が試される。",heroLocation:"魔界・西岸"},
 {day:5,from:41,to:50,title:"境界",summary:"予言の半ば。勇者一行は境界砦を越え、魔王領へ歩を進める。",heroLocation:"境界砦"},
 {day:6,from:51,to:60,title:"七罪",summary:"勇者一行は七罪の荒野を進軍。深淵の支配者たちが魔王軍の資格を量る。",heroLocation:"七罪の荒野"},
 {day:7,from:61,to:70,title:"王冠",summary:"勇者一行は魔王領へ侵入。最後の深淵を越え、迎撃の力を示す時が来た。",heroLocation:"魔王領・外縁"},
 {day:8,from:71,to:80,title:"神託",summary:"勇者一行は魔都の灯を捉える。十神も地上の決戦へ介入し始める。",heroLocation:"魔都街道"},
 {day:9,from:81,to:90,title:"神域",summary:"勇者一行は魔王城目前。神々の包囲を破り、決戦までに部隊を完成させる。",heroLocation:"魔王城・外郭"},
 {day:10,from:91,to:100,title:"決戦",summary:"城門まで残されたのは十階。百階の支配者を退けた時、勇者一行が到着する。",heroLocation:"魔王城・城門前"}
]);

export const CAMPAIGN_MILESTONE_BOSSES=Object.freeze({
 10:Object.freeze(["abyss_gluttony"]),20:Object.freeze(["abyss_wrath"]),30:Object.freeze(["abyss_envy"]),
 40:Object.freeze(["abyss_sloth"]),50:Object.freeze(["abyss_greed"]),60:Object.freeze(["abyss_lust"]),70:Object.freeze(["abyss_pride"]),
 80:Object.freeze(["ten_time","ten_space","ten_life"]),
 90:Object.freeze(["ten_death","ten_fate","ten_chaos"]),
 100:Object.freeze(["ten_dominion","ten_creation","ten_end","ten_divinity"])
});

const capFloor=value=>Math.max(1,Math.min(CAMPAIGN_MAX_FLOOR,Math.floor(Number(value)||1)));
const plainRecord=value=>Boolean(value&&typeof value==="object"&&!Array.isArray(value));
const boundedInteger=(value,fallback=0,min=0,max=Number.MAX_SAFE_INTEGER)=>{const number=Number(value);return Number.isFinite(number)?Math.max(min,Math.min(max,Math.floor(number))):fallback};
const cleanStateId=(value,max=100)=>typeof value==="string"?value.replace(/[\u0000-\u001f\u007f]/g,"").slice(0,max):"";
function normalizePostBossSpawns(value){
 if(!plainRecord(value))return null;const normalized={};
 for(const key of["trophy","spring","exit"]){const point=value[key];if(!plainRecord(point)||!Number.isFinite(Number(point.x))||!Number.isFinite(Number(point.y)))continue;normalized[key]={...point,x:Math.floor(Number(point.x)),y:Math.floor(Number(point.y))};if(point.sectionId!=null)normalized[key].sectionId=cleanStateId(point.sectionId,100)||null}
 return Object.keys(normalized).length?normalized:null
}
export function campaignFloorToLegacyFloor(floor){return capFloor(floor)*10}
export function legacyFloorToCampaignFloor(floor){return capFloor(Math.ceil(Math.max(1,Number(floor)||1)/10))}
export function campaignDayForFloor(floor){return Math.min(10,Math.max(1,Math.ceil(capFloor(floor)/10)))}
export function campaignDayDefinition(floor){return CAMPAIGN_DAYS[campaignDayForFloor(floor)-1]}
export function campaignHeroAdvance(stateOrFloor){
 const state=stateOrFloor&&typeof stateOrFloor==="object"?stateOrFloor:null,floor=capFloor(state?Math.max(Number(state.player?.currentFloor)||1,Number(state.player?.maxFloor)||1):stateOrFloor),day=campaignDayDefinition(floor),arrived=Boolean(state?.campaign100?.finalUnlocked||state?.campaign100?.floors?.[String(CAMPAIGN_MAX_FLOOR)]?.bossDefeated),progress=arrived?100:Math.min(99,Math.max(0,floor-1)),floorsRemaining=arrived?0:Math.max(1,CAMPAIGN_MAX_FLOOR-floor+1);
 return{day:day.day,location:arrived?"魔王城・正門":day.heroLocation,progress,arrived,floorsRemaining,daysRemaining:arrived?0:Math.max(0,10-day.day),status:arrived?"勇者一行が到着":day.day===10?"決戦は目前":`魔王城まで残り${10-day.day}日`}
}
export function campaignMilestoneBossIds(floor){return[...(CAMPAIGN_MILESTONE_BOSSES[capFloor(floor)]??[])]}
export function isCampaignMilestoneFloor(floor){return campaignMilestoneBossIds(floor).length>0}

export function roomCountForRandom(random=Math.random){return CAMPAIGN_ROOM_MIN+Math.floor(Math.max(0,Math.min(.999999,Number(random())||0))*(CAMPAIGN_ROOM_MAX-CAMPAIGN_ROOM_MIN+1))}
export function roomAttributesForFloor(floor,count,random=Math.random){
 const wanted=Math.max(3,Math.floor(Number(count)||CAMPAIGN_ROOM_MIN)),offset=(capFloor(floor)-1)%CAMPAIGN_ELEMENTS.length;
 const pool=[...CAMPAIGN_ELEMENTS.slice(offset),...CAMPAIGN_ELEMENTS.slice(0,offset)],result=[];
 while(result.length<wanted){const available=pool.filter(value=>!result.includes(value));result.push(available.length?available[Math.floor(random()*available.length)]:pool[Math.floor(random()*pool.length)])}
 return result
}

export function createCampaignFloorState(floor){return{floor:capFloor(floor),keysCollected:0,keyIds:[],keysConsumed:0,bossDiscovered:false,bossDefeated:false,cleared:false,trophyLocksOpened:0,trophyFragmentPacksClaimed:0,trophyClaimed:false,trophyRewardVersion:2,replayActive:false,hotSpringUsed:false,exitUnlocked:false,visitedRoomIds:[],bossAreaId:null,postBossSpawns:null}}
export function normalizeCampaignFloorState(value,floor,{allowLegacyReward=false}={}){
 const source=plainRecord(value)?value:{},legacyRewardModel=allowLegacyReward&&boundedInteger(source.trophyRewardVersion,0,0,Number.MAX_SAFE_INTEGER)<2,rawLocks=boundedInteger(source.trophyLocksOpened,0,0,CAMPAIGN_KEYS_PER_FLOOR),rawClaimed=source.trophyClaimed===true||legacyRewardModel&&rawLocks>=CAMPAIGN_KEYS_PER_FLOOR,replayActive=source.replayActive===true,state={...createCampaignFloorState(floor),...source};state.floor=capFloor(floor);state.replayActive=replayActive;
 state.keyIds=[...new Set((Array.isArray(source.keyIds)?source.keyIds:[]).map(value=>cleanStateId(value,80)).filter(Boolean))].slice(0,CAMPAIGN_KEYS_PER_FLOOR);
 const legacyKeyCount=legacyRewardModel?boundedInteger(source.keysCollected,0,0,CAMPAIGN_KEYS_PER_FLOOR):0,settledKeyCount=rawLocks>=CAMPAIGN_KEYS_PER_FLOOR||rawClaimed&&!replayActive?CAMPAIGN_KEYS_PER_FLOOR:0,targetKeyCount=Math.max(state.keyIds.length,legacyKeyCount,settledKeyCount);
 while(state.keyIds.length<targetKeyCount)state.keyIds.push(`${state.floor}-campaign-key-${state.keyIds.length+1}`);
 state.keysCollected=state.keyIds.length;
 state.visitedRoomIds=[...new Set((Array.isArray(source.visitedRoomIds)?source.visitedRoomIds:[]).map(value=>cleanStateId(value,100)).filter(Boolean))].slice(0,CAMPAIGN_ROOM_MAX+1);
 state.bossDefeated=source.bossDefeated===true;state.bossDiscovered=source.bossDiscovered===true||state.bossDefeated;
 if(legacyRewardModel){
  // Build301 paid fragments one lock at a time. Preserve those payments, but
  // restore a partial chest to unopened so all three field keys can still
  // unlock exactly one guaranteed boss item.
 state.trophyFragmentPacksClaimed=Math.max(boundedInteger(source.trophyFragmentPacksClaimed,0,0,CAMPAIGN_KEYS_PER_FLOOR),rawLocks);
 }else state.trophyFragmentPacksClaimed=boundedInteger(source.trophyFragmentPacksClaimed,0,0,CAMPAIGN_KEYS_PER_FLOOR);
 state.trophyLocksOpened=rawLocks>=CAMPAIGN_KEYS_PER_FLOOR||rawClaimed&&!replayActive?CAMPAIGN_KEYS_PER_FLOOR:0;state.keysConsumed=state.trophyLocksOpened>=CAMPAIGN_KEYS_PER_FLOOR?CAMPAIGN_KEYS_PER_FLOOR:0;
 state.bossAreaId=cleanStateId(source.bossAreaId,100)||null;state.postBossSpawns=normalizePostBossSpawns(source.postBossSpawns);
 state.trophyClaimed=rawClaimed;state.trophyFragmentPacksClaimed=state.trophyClaimed&&!replayActive?CAMPAIGN_KEYS_PER_FLOOR:state.trophyFragmentPacksClaimed;state.trophyRewardVersion=2;state.cleared=source.cleared===true||state.bossDefeated||state.trophyClaimed;state.hotSpringUsed=source.hotSpringUsed===true;state.exitUnlocked=source.exitUnlocked===true||state.bossDefeated;return state
}
function mergeCampaignFloorStates(current,incoming,floor){
 if(!current)return incoming;const merged={...current,...incoming};
 merged.keyIds=[...new Set([...(current.keyIds??[]),...(incoming.keyIds??[])])].slice(0,CAMPAIGN_KEYS_PER_FLOOR);
 merged.visitedRoomIds=[...new Set([...(current.visitedRoomIds??[]),...(incoming.visitedRoomIds??[])])].slice(0,CAMPAIGN_ROOM_MAX+1);
 for(const key of["bossDiscovered","bossDefeated","cleared","trophyClaimed","replayActive","hotSpringUsed","exitUnlocked"])merged[key]=current[key]===true||incoming[key]===true;
 for(const key of["trophyLocksOpened","trophyFragmentPacksClaimed","bossClearVersion"])merged[key]=Math.max(boundedInteger(current[key]),boundedInteger(incoming[key]));
 merged.postBossSpawns=normalizePostBossSpawns({...plainRecord(current.postBossSpawns)?current.postBossSpawns:{},...plainRecord(incoming.postBossSpawns)?incoming.postBossSpawns:{}});
 return normalizeCampaignFloorState(merged,floor)
}
function canonicalCampaignFloors(value,{allowLegacyReward=false}={}){
 const result={};for(const[rawFloor,valueAtFloor]of Object.entries(plainRecord(value)?value:{})){const floor=Number(rawFloor);if(!Number.isInteger(floor)||floor<1||floor>CAMPAIGN_MAX_FLOOR||!plainRecord(valueAtFloor))continue;const key=String(floor),incoming=normalizeCampaignFloorState(valueAtFloor,floor,{allowLegacyReward});result[key]=mergeCampaignFloorStates(result[key],incoming,floor)}return result
}
function hasCampaignBossClearEvidence(value){
 if(!value||typeof value!=="object"||!value.bossDefeated)return false;
 return Boolean(
  Number(value.bossClearVersion)>0||value.clearRecordedAt||value.cleared===true||
  Number(value.trophyLocksOpened)>0||Number(value.trophyFragmentPacksClaimed)>0||
  value.trophyClaimed||value.hotSpringUsed||
  value.lastBossInfo&&typeof value.lastBossInfo==="object"
 )
}
function legacyBossClearEvidence(value){
 const result=new Map();for(const[rawFloor,rawEntry]of Object.entries(plainRecord(value)?value:{})){const floor=Number(rawFloor);if(!Number.isInteger(floor)||floor<1||floor>CAMPAIGN_MAX_FLOOR||!plainRecord(rawEntry))continue;const prior=result.get(floor)??{bossDefeated:false,evidence:false};prior.bossDefeated=prior.bossDefeated||rawEntry.bossDefeated===true;prior.evidence=prior.evidence||hasCampaignBossClearEvidence(rawEntry);result.set(floor,prior)}return result
}
function rescueUnsupportedLegacyBossClears(campaign,evidenceByFloor=new Map()){
 const rescued=[];
 for(const[rawFloor,rawEntry]of Object.entries(campaign.floors??{})){
  const floor=Math.floor(Number(rawFloor));if(!Number.isInteger(floor)||floor<1||floor>CAMPAIGN_MAX_FLOOR||!plainRecord(rawEntry))continue;
  const evidence=evidenceByFloor.get(floor);if(!evidence?.bossDefeated||evidence.evidence)continue;
  const entry=normalizeCampaignFloorState(rawEntry,floor);entry.bossDiscovered=false;entry.bossDefeated=false;entry.cleared=false;entry.exitUnlocked=false;entry.postBossSpawns=null;
  campaign.floors[String(floor)]=entry;rescued.push(floor)
 }
 for(const[rawFloor,rawEntry]of Object.entries(campaign.floors??{})){const floor=Math.floor(Number(rawFloor));if(!Number.isInteger(floor)||floor<1||floor>CAMPAIGN_MAX_FLOOR||!plainRecord(rawEntry))continue;campaign.floors[String(floor)]=normalizeCampaignFloorState(rawEntry,floor)}
 campaign.legacyBossClearRescue={version:2,floors:[...new Set(rescued)].sort((a,b)=>a-b)}
}
export function normalizeCampaignState(state){
 if(!state||typeof state!=="object")return{version:4,floors:{}};state.campaign100=plainRecord(state.campaign100)?state.campaign100:{};const campaign=state.campaign100,previousVersion=boundedInteger(campaign.version,0,0,Number.MAX_SAFE_INTEGER),legacyEvidence=previousVersion<2?legacyBossClearEvidence(campaign.floors):null;campaign.floors=canonicalCampaignFloors(campaign.floors,{allowLegacyReward:previousVersion<2});if(previousVersion<2)rescueUnsupportedLegacyBossClears(campaign,legacyEvidence);
 {
  // Build301 could leave only a compatibility reward marker. Treat it as
  // definitive payment evidence: partial
  // fragment packs stay paid, while a complete marker also restores the one
  // and only mythic claim. Loading a save never mints a new reward.
  const rewards=plainRecord(state.player?.bossRewards)?state.player.bossRewards:{},evidence=new Map();
  for(const[rawFloor,reward]of Object.entries(rewards)){
   const floor=Number(rawFloor),text=String(reward??""),partial=text.match(/^CAMPAIGN_TROPHY_([12])$/),complete=text==="CAMPAIGN_TROPHY_COMPLETE"||text==="CAMPAIGN_TROPHY_3";if(!Number.isInteger(floor)||floor<1||floor>CAMPAIGN_MAX_FLOOR||!partial&&!complete)continue;
   const receipt={locks:complete?CAMPAIGN_KEYS_PER_FLOOR:Number(partial[1]),complete},prior=evidence.get(floor);if(!prior||receipt.locks>prior.locks||receipt.complete&&!prior.complete)evidence.set(floor,receipt)
  }
  for(const[floor,reward]of evidence){
   const key=String(floor),locks=reward.locks,entry=plainRecord(campaign.floors[key])?campaign.floors[key]:{},replayActive=entry.replayActive===true;
   entry.bossDiscovered=true;entry.cleared=true;if(!replayActive){entry.bossDefeated=true;entry.exitUnlocked=true;entry.keysCollected=Math.max(Number(entry.keysCollected)||0,locks);entry.trophyLocksOpened=Math.max(Number(entry.trophyLocksOpened)||0,locks);entry.trophyFragmentPacksClaimed=Math.max(Number(entry.trophyFragmentPacksClaimed)||0,locks);entry.keyIds=Array.isArray(entry.keyIds)?entry.keyIds:[];for(let index=1;index<=locks;index++){const id=`${floor}-campaign-key-${index}`;if(!entry.keyIds.includes(id))entry.keyIds.push(id)}}if(reward.complete)entry.trophyClaimed=true;campaign.floors[key]=entry;
  }
 }
 campaign.floors=canonicalCampaignFloors(campaign.floors);
 if(plainRecord(state.player)){
  state.player.bossRewards=plainRecord(state.player.bossRewards)?state.player.bossRewards:{};
  for(const[floor,entry]of Object.entries(campaign.floors)){if(entry.trophyClaimed||entry.trophyLocksOpened>=CAMPAIGN_KEYS_PER_FLOOR)state.player.bossRewards[floor]="CAMPAIGN_TROPHY_COMPLETE";else if(entry.trophyFragmentPacksClaimed>0)state.player.bossRewards[floor]=`CAMPAIGN_TROPHY_${Math.min(2,entry.trophyFragmentPacksClaimed)}`}
 }
 if(campaign.floors[String(CAMPAIGN_MAX_FLOOR)]?.bossDefeated)campaign.finalUnlocked=true;
 campaign.version=4;
 campaign.invasionDaysSeen=[...new Set((Array.isArray(campaign.invasionDaysSeen)?campaign.invasionDaysSeen:[]).map(Number).filter(value=>Number.isInteger(value)&&value>=1&&value<=10))];
 campaign.endings=Array.isArray(campaign.endings)?[...new Set(campaign.endings.filter(value=>["complete","comeback","defeat"].includes(value)))]:[];campaign.finalUnlocked=campaign.finalUnlocked===true;campaign.finalCompleted=campaign.finalCompleted===true;
 campaign.finalPartyBackup=[...new Set((Array.isArray(campaign.finalPartyBackup)?campaign.finalPartyBackup:[]).map(value=>cleanStateId(value,120)).filter(Boolean))].slice(0,4);campaign.finalVitals=plainRecord(campaign.finalVitals)?campaign.finalVitals:{};campaign.sairanMonsterId=cleanStateId(campaign.sairanMonsterId,120)||null;campaign.finalBattleLevel=campaign.finalBattleLevel==null?null:boundedInteger(campaign.finalBattleLevel,1,1,Number.MAX_SAFE_INTEGER);campaign.finalStage=["party","sairan"].includes(campaign.finalStage)?campaign.finalStage:null;if(!["party","sairan"].includes(campaign.finalSessionPending))delete campaign.finalSessionPending;campaign.heroCarry=(Array.isArray(campaign.heroCarry)?campaign.heroCarry:[]).filter(entry=>plainRecord(entry)&&HERO_PARTY_IDS.includes(entry.speciesId)&&Number.isFinite(Number(entry.hp))&&Number(entry.hp)>0).slice(0,4).map(entry=>({speciesId:entry.speciesId,hp:boundedInteger(entry.hp,1,1,Number.MAX_SAFE_INTEGER)}));
 // Build304 removed the detached eight-general roster, reserve swaps and
 // selectable Sairan profiles. Delete their persisted remnants so a legacy
 // save cannot silently reactivate the old flow.
 for(const key of["selectedSairanType","generalIds","activeGeneralIds","reserveGeneralIds","storyDaysSeen"])delete campaign[key];
 return campaign
}
export function campaignFloorState(state,floor,{create=true}={}){const campaign=normalizeCampaignState(state),key=String(capFloor(floor));if(create)campaign.floors[key]=normalizeCampaignFloorState(campaign.floors[key],floor);return campaign.floors[key]??null}
export function campaignRegionProgress(state,floor){
 const campaign=normalizeCampaignState(state),day=campaignDayDefinition(floor),total=Math.max(1,day.to-day.from+1);let cleared=0;
 for(let current=day.from;current<=day.to;current++){const key=String(current),raw=campaign.floors?.[key];if(!raw)continue;const entry=normalizeCampaignFloorState(raw,current);campaign.floors[key]=entry;if(entry.cleared)cleared++}
 return{from:day.from,to:day.to,cleared,total,percent:Math.round(cleared/total*100),complete:cleared>=total}
}
// A normal entry is always a resume.  Campaign progress belongs to the floor,
// not to the temporary expedition id, so reconnecting or starting a new manual
// expedition must never resurrect a defeated boss or relock its reward.
export function beginCampaignFloorRun(state,floor,runId){const entry=campaignFloorState(state,floor);entry.runId=String(runId??"");return entry}
// Replays are deliberately explicit and never restore the first-clear mythic
// entitlement.  No ordinary entry path calls this helper.
export function beginCampaignFloorReplay(state,floor,runId){const entry=campaignFloorState(state,floor),claimed=Boolean(entry.trophyClaimed);entry.runId=String(runId??"");entry.keyIds=[];entry.keysCollected=0;entry.keysConsumed=0;entry.bossDiscovered=false;entry.bossDefeated=false;entry.trophyLocksOpened=0;entry.trophyFragmentPacksClaimed=0;entry.replayActive=true;entry.hotSpringUsed=false;entry.exitUnlocked=false;entry.visitedRoomIds=[];entry.postBossSpawns=null;entry.trophyClaimed=claimed;return entry}
export function collectCampaignKey(state,floor,keyId){const entry=campaignFloorState(state,floor),id=cleanStateId(keyId,80);if(!id||entry.keyIds.includes(id)||entry.keyIds.length>=CAMPAIGN_KEYS_PER_FLOOR)return{collected:false,count:entry.keysCollected};entry.keyIds.push(id);entry.keysCollected=entry.keyIds.length;return{collected:true,count:entry.keysCollected}}
export function defeatCampaignBoss(state,floor){const entry=campaignFloorState(state,floor);entry.bossDiscovered=true;entry.bossDefeated=true;entry.cleared=true;entry.bossClearVersion=2;entry.exitUnlocked=true;if(capFloor(floor)===CAMPAIGN_MAX_FLOOR)normalizeCampaignState(state).finalUnlocked=true;return entry}
export function campaignKeysHeld(stateOrEntry,floor){const entry=floor==null?stateOrEntry:campaignFloorState(stateOrEntry,floor);return Math.max(0,Math.min(CAMPAIGN_KEYS_PER_FLOOR,Math.floor(Number(entry?.keysCollected)||0)-Math.floor(Number(entry?.keysConsumed)||0)))}
export function trophyChestEntitlements(state,floor){const entry=campaignFloorState(state,floor),runClaimed=entry.trophyLocksOpened>=CAMPAIGN_KEYS_PER_FLOOR,firstClear=!entry.trophyClaimed,heldKeys=campaignKeysHeld(entry),missingKeys=Math.max(0,CAMPAIGN_KEYS_PER_FLOOR-heldKeys),fragmentPacks=Math.max(0,CAMPAIGN_KEYS_PER_FLOOR-entry.trophyFragmentPacksClaimed),available=entry.bossDefeated&&!runClaimed&&heldKeys>=CAMPAIGN_KEYS_PER_FLOOR;return{available,heldKeys,missingKeys,totalKeys:entry.keysCollected,fragmentPacks,equipmentGuaranteed:available&&firstClear}}
export function claimTrophyChest(state,floor){const reward=trophyChestEntitlements(state,floor),entry=campaignFloorState(state,floor);if(!reward.available)return reward;entry.keysConsumed=CAMPAIGN_KEYS_PER_FLOOR;entry.trophyLocksOpened=CAMPAIGN_KEYS_PER_FLOOR;entry.trophyFragmentPacksClaimed=CAMPAIGN_KEYS_PER_FLOOR;if(reward.equipmentGuaranteed)entry.trophyClaimed=true;return{...reward,claimed:true,keysConsumed:CAMPAIGN_KEYS_PER_FLOOR}}
export function campaignEndingForResult({partyWon=false,sairanWon=false}={}){return partyWon?"complete":sairanWon?"comeback":"defeat"}
export function recordCampaignEnding(state,ending){
 const result=["complete","comeback","defeat"].includes(ending)?ending:"defeat",campaign=normalizeCampaignState(state),victorious=result!=="defeat";
 campaign.endings=[...new Set([...(campaign.endings??[]),result])];
 if(victorious)campaign.finalCompleted=true;
 return{ending:result,victorious,finalCompleted:campaign.finalCompleted}
}
