export const CAMPAIGN_MAX_FLOOR=100;
export const CAMPAIGN_KEYS_PER_FLOOR=3;
export const CAMPAIGN_ROOM_MIN=4;
export const CAMPAIGN_ROOM_MAX=6;

export const CAMPAIGN_ELEMENTS=Object.freeze(["fire","water","wind","earth","ice","thunder","light","dark","poison"]);
export const HERO_PARTY_IDS=Object.freeze(["myth_enami","myth_yori","myth_hide","myth_rion"]);

export const SAIRAN_TYPES=Object.freeze({
 balanced:{id:"balanced",name:"覇道型",description:"攻守と魔力を均等に伸ばす",stats:{hp:1,atk:1,matk:1,def:1,mdef:1,spd:1}},
 power:{id:"power",name:"破壊型",description:"鈍重だが高火力・高耐久",stats:{hp:1.18,atk:1.25,matk:.78,def:1.12,mdef:.94,spd:.78}},
 magic:{id:"magic",name:"魔導型",description:"高速詠唱と属性術で制圧",stats:{hp:.90,atk:.72,matk:1.30,def:.86,mdef:1.14,spd:1.12}},
 speed:{id:"speed",name:"疾影型",description:"先手と連撃で崩す",stats:{hp:.88,atk:1.08,matk:1.02,def:.82,mdef:.88,spd:1.32}},
 fortress:{id:"fortress",name:"不落型",description:"仲間が倒れた後も耐え抜く",stats:{hp:1.34,atk:.90,matk:.86,def:1.28,mdef:1.22,spd:.70}}
});

const SAIRAN_STAT_KEYS=Object.freeze(["hp","atk","matk","def","mdef","spd"]);
const SAIRAN_SKILL_IDS=Object.freeze(Array.from({length:5},(_,index)=>`abyss_dominion__identity_${index+1}`));
const SAIRAN_SKILL_LOADOUTS=Object.freeze({
 balanced:Object.freeze([SAIRAN_SKILL_IDS[0],SAIRAN_SKILL_IDS[2],SAIRAN_SKILL_IDS[3],SAIRAN_SKILL_IDS[4],SAIRAN_SKILL_IDS[1]]),
 power:Object.freeze([SAIRAN_SKILL_IDS[1],SAIRAN_SKILL_IDS[2],SAIRAN_SKILL_IDS[0],SAIRAN_SKILL_IDS[3],SAIRAN_SKILL_IDS[4]]),
 magic:Object.freeze([SAIRAN_SKILL_IDS[1],SAIRAN_SKILL_IDS[3],SAIRAN_SKILL_IDS[2],SAIRAN_SKILL_IDS[4],SAIRAN_SKILL_IDS[0]]),
 speed:Object.freeze([SAIRAN_SKILL_IDS[3],SAIRAN_SKILL_IDS[0],SAIRAN_SKILL_IDS[1],SAIRAN_SKILL_IDS[2],SAIRAN_SKILL_IDS[4]]),
 fortress:Object.freeze([SAIRAN_SKILL_IDS[4],SAIRAN_SKILL_IDS[3],SAIRAN_SKILL_IDS[1],SAIRAN_SKILL_IDS[0],SAIRAN_SKILL_IDS[2]])
});
export function applyCampaignSairanType(monster,typeId,{learnedSkillIds=[]}={}){
 if(!monster||typeof monster!=="object")return monster;
 const type=SAIRAN_TYPES[typeId]??SAIRAN_TYPES.balanced;
 monster.campaignSairanType=type.id;
 monster.title=type.name;
 // calculatedStats already treats this persisted profile as an authored,
 // per-monster multiplier.  Reusing it keeps the temporary final-battle
 // monster save-safe without changing every ordinary monster's stat schema.
 monster.floorBossStatProfile=Object.fromEntries(SAIRAN_STAT_KEYS.map(key=>[key,Number(type.stats[key])||1]));
 const learned=new Set((Array.isArray(learnedSkillIds)?learnedSkillIds:[]).map(String)),priority=SAIRAN_SKILL_LOADOUTS[type.id]??SAIRAN_SKILL_LOADOUTS.balanced,loadout=priority.filter(skillId=>learned.has(skillId)).slice(0,4);
 while(loadout.length<4)loadout.push(null);
 monster.equippedSkills=loadout;
 monster.skillLoadoutInitialized=true;
 return monster
}

export const CAMPAIGN_DAYS=Object.freeze([
 {day:1,from:1,to:10,title:"予言",summary:"西の大陸から勇者一行が来る。リオネルの予言が魔界を走る。"},
 {day:2,from:11,to:20,title:"徴兵",summary:"散った魔物を束ね、最初の将軍候補を見定める。"},
 {day:3,from:21,to:30,title:"侵食",summary:"深淵の気配が迷宮へ混ざり始める。"},
 {day:4,from:31,to:40,title:"反逆",summary:"力だけでは軍にならない。魔王の統率が試される。"},
 {day:5,from:41,to:50,title:"境界",summary:"予言の半ば。勇者一行の足音が大陸を越える。"},
 {day:6,from:51,to:60,title:"七罪",summary:"深淵の支配者たちが魔王軍の資格を量る。"},
 {day:7,from:61,to:70,title:"王冠",summary:"最後の深淵を越え、魔界の王として認めさせる。"},
 {day:8,from:71,to:80,title:"神託",summary:"十神が地上の戦争へ介入する。"},
 {day:9,from:81,to:90,title:"神域",summary:"神々の包囲を破り、決戦の布陣を完成させる。"},
 {day:10,from:91,to:100,title:"魔王軍",summary:"最後の四神を退け、魔王城で勇者一行を迎え撃つ。"}
]);

export const CAMPAIGN_MILESTONE_BOSSES=Object.freeze({
 10:Object.freeze(["abyss_gluttony"]),20:Object.freeze(["abyss_wrath"]),30:Object.freeze(["abyss_envy"]),
 40:Object.freeze(["abyss_sloth"]),50:Object.freeze(["abyss_greed"]),60:Object.freeze(["abyss_lust"]),70:Object.freeze(["abyss_pride"]),
 80:Object.freeze(["ten_time","ten_space","ten_life"]),
 90:Object.freeze(["ten_death","ten_fate","ten_chaos"]),
 100:Object.freeze(["ten_dominion","ten_creation","ten_end","ten_divinity"])
});

const capFloor=value=>Math.max(1,Math.min(CAMPAIGN_MAX_FLOOR,Math.floor(Number(value)||1)));
export function campaignFloorToLegacyFloor(floor){return capFloor(floor)*10}
export function legacyFloorToCampaignFloor(floor){return capFloor(Math.ceil(Math.max(1,Number(floor)||1)/10))}
export function campaignDayForFloor(floor){return Math.min(10,Math.max(1,Math.ceil(capFloor(floor)/10)))}
export function campaignDayDefinition(floor){return CAMPAIGN_DAYS[campaignDayForFloor(floor)-1]}
export function campaignMilestoneBossIds(floor){return[...(CAMPAIGN_MILESTONE_BOSSES[capFloor(floor)]??[])]}
export function isCampaignMilestoneFloor(floor){return campaignMilestoneBossIds(floor).length>0}

export function roomCountForRandom(random=Math.random){return CAMPAIGN_ROOM_MIN+Math.floor(Math.max(0,Math.min(.999999,Number(random())||0))*(CAMPAIGN_ROOM_MAX-CAMPAIGN_ROOM_MIN+1))}
export function roomAttributesForFloor(floor,count,random=Math.random){
 const wanted=Math.max(3,Math.floor(Number(count)||CAMPAIGN_ROOM_MIN)),offset=(capFloor(floor)-1)%CAMPAIGN_ELEMENTS.length;
 const pool=[...CAMPAIGN_ELEMENTS.slice(offset),...CAMPAIGN_ELEMENTS.slice(0,offset)],result=[];
 while(result.length<wanted){const available=pool.filter(value=>!result.includes(value));result.push(available.length?available[Math.floor(random()*available.length)]:pool[Math.floor(random()*pool.length)])}
 return result
}

export function createCampaignFloorState(floor){return{floor:capFloor(floor),keysCollected:0,keyIds:[],bossDiscovered:false,bossDefeated:false,trophyLocksOpened:0,trophyClaimed:false,hotSpringUsed:false,exitUnlocked:false,visitedRoomIds:[],bossAreaId:null,postBossSpawns:null}}
export function normalizeCampaignFloorState(value,floor){
 const state={...createCampaignFloorState(floor),...(value&&typeof value==="object"?value:{})};state.floor=capFloor(floor);
 state.keyIds=[...new Set((Array.isArray(state.keyIds)?state.keyIds:[]).map(String))].slice(0,CAMPAIGN_KEYS_PER_FLOOR);state.keysCollected=Math.max(state.keyIds.length,Math.min(CAMPAIGN_KEYS_PER_FLOOR,Math.floor(Number(state.keysCollected)||0)));
 state.visitedRoomIds=[...new Set((Array.isArray(state.visitedRoomIds)?state.visitedRoomIds:[]).map(String))].slice(0,CAMPAIGN_ROOM_MAX+1);
 state.bossDiscovered=Boolean(state.bossDiscovered||state.bossDefeated);state.bossDefeated=Boolean(state.bossDefeated);state.trophyLocksOpened=Math.max(0,Math.min(state.keysCollected,Math.floor(Number(state.trophyLocksOpened)||0)));
 state.bossAreaId=state.bossAreaId==null?null:String(state.bossAreaId);state.postBossSpawns=state.postBossSpawns&&typeof state.postBossSpawns==="object"?state.postBossSpawns:null;
 state.trophyClaimed=Boolean(state.trophyClaimed||state.trophyLocksOpened>=CAMPAIGN_KEYS_PER_FLOOR);state.hotSpringUsed=Boolean(state.hotSpringUsed);state.exitUnlocked=Boolean(state.exitUnlocked||state.bossDefeated);return state
}
export function normalizeCampaignState(state){
 state.campaign100??={};const campaign=state.campaign100;campaign.version=1;campaign.floors??={};campaign.selectedSairanType=SAIRAN_TYPES[campaign.selectedSairanType]?campaign.selectedSairanType:"balanced";
 campaign.generalIds=[...new Set((Array.isArray(campaign.generalIds)?campaign.generalIds:[]).map(String))].slice(0,8);campaign.activeGeneralIds=campaign.generalIds.slice(0,4);campaign.reserveGeneralIds=campaign.generalIds.slice(4,8);
 campaign.storyDaysSeen=[...new Set((Array.isArray(campaign.storyDaysSeen)?campaign.storyDaysSeen:[]).map(Number).filter(value=>value>=1&&value<=10))];
 campaign.endings=Array.isArray(campaign.endings)?[...new Set(campaign.endings.filter(value=>["complete","comeback","defeat"].includes(value)))]:[];campaign.finalUnlocked=Boolean(campaign.finalUnlocked);campaign.finalCompleted=Boolean(campaign.finalCompleted);
 return campaign
}
export function campaignFloorState(state,floor,{create=true}={}){const campaign=normalizeCampaignState(state),key=String(capFloor(floor));if(create)campaign.floors[key]=normalizeCampaignFloorState(campaign.floors[key],floor);return campaign.floors[key]??null}
// A normal entry is always a resume.  Campaign progress belongs to the floor,
// not to the temporary expedition id, so reconnecting or starting a new manual
// expedition must never resurrect a defeated boss or relock its reward.
export function beginCampaignFloorRun(state,floor,runId){const entry=campaignFloorState(state,floor);entry.runId=String(runId??"");return entry}
// Replays are deliberately explicit and never restore the first-clear mythic
// entitlement.  No ordinary entry path calls this helper.
export function beginCampaignFloorReplay(state,floor,runId){const entry=campaignFloorState(state,floor),claimed=Boolean(entry.trophyClaimed);entry.runId=String(runId??"");entry.keyIds=[];entry.keysCollected=0;entry.bossDiscovered=false;entry.bossDefeated=false;entry.trophyLocksOpened=0;entry.hotSpringUsed=false;entry.exitUnlocked=false;entry.visitedRoomIds=[];entry.postBossSpawns=null;entry.trophyClaimed=claimed;return entry}
export function collectCampaignKey(state,floor,keyId){const entry=campaignFloorState(state,floor),id=String(keyId??"");if(!id||entry.keyIds.includes(id))return{collected:false,count:entry.keysCollected};entry.keyIds.push(id);entry.keysCollected=Math.min(CAMPAIGN_KEYS_PER_FLOOR,entry.keyIds.length);return{collected:true,count:entry.keysCollected}}
export function defeatCampaignBoss(state,floor){const entry=campaignFloorState(state,floor);entry.bossDiscovered=true;entry.bossDefeated=true;entry.exitUnlocked=true;if(capFloor(floor)===CAMPAIGN_MAX_FLOOR)normalizeCampaignState(state).finalUnlocked=true;return entry}
export function trophyChestEntitlements(state,floor){const entry=campaignFloorState(state,floor),newLocks=Math.max(0,entry.keysCollected-entry.trophyLocksOpened),firstClear=!entry.trophyClaimed;return{available:entry.bossDefeated&&newLocks>0,newLocks,totalKeys:entry.keysCollected,fragmentPacks:newLocks,equipmentGuaranteed:firstClear&&entry.keysCollected>=3&&entry.trophyLocksOpened<3}}
export function claimTrophyChest(state,floor){const reward=trophyChestEntitlements(state,floor),entry=campaignFloorState(state,floor);if(!reward.available)return reward;entry.trophyLocksOpened=entry.keysCollected;if(entry.trophyLocksOpened>=3)entry.trophyClaimed=true;return{...reward,claimed:true}}
export function campaignEndingForResult({generalsWon=false,sairanWon=false}={}){return generalsWon?"complete":sairanWon?"comeback":"defeat"}
export function recordCampaignEnding(state,ending){
 const result=["complete","comeback","defeat"].includes(ending)?ending:"defeat",campaign=normalizeCampaignState(state),victorious=result!=="defeat";
 campaign.endings=[...new Set([...(campaign.endings??[]),result])];
 if(victorious)campaign.finalCompleted=true;
 return{ending:result,victorious,finalCompleted:campaign.finalCompleted}
}
