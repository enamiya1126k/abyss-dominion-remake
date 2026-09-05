import{CAMPAIGN_MAX_FLOOR,beginCampaignFloorReplay,normalizeCampaignState}from"./Campaign100System.js?v=3.1.1-build320";
import{createCampaignHeroEncounterState}from"./CampaignHeroEncounterSystem.js?v=3.1.22-build341";

export const CAMPAIGN_REINCARNATION_VERSION=2;
export const CAMPAIGN_FINAL_ENDING_IDS=Object.freeze(["complete","narrow","defeat"]);
export const CAMPAIGN_REINCARNATION_MAX_HISTORY=32;

const plainRecord=value=>Boolean(value&&typeof value==="object"&&!Array.isArray(value));
const boundedInteger=(value,fallback=0,min=0,max=Number.MAX_SAFE_INTEGER)=>{const number=Number(value);return Number.isFinite(number)?Math.max(min,Math.min(max,Math.floor(number))):fallback};
const cleanId=(value,max=140)=>typeof value==="string"?value.replace(/[\u0000-\u001f\u007f]/g,"").trim().slice(0,max):"";
const endingId=value=>CAMPAIGN_FINAL_ENDING_IDS.includes(value)?value:value==="all-preempted"?"complete":"defeat";

function normalizeHistory(value){
 const byResult=new Map();
 for(const raw of Array.isArray(value)?value.slice(-CAMPAIGN_REINCARNATION_MAX_HISTORY*2):[]){
  if(!plainRecord(raw))continue;
  const resultId=cleanId(raw.resultId)||`legacy-${byResult.size}`,ending=endingId(raw.ending),cycle=boundedInteger(raw.cycle,0,0,999),variant=cleanId(raw.variant,40)||null;
  byResult.delete(resultId);byResult.set(resultId,{resultId,ending,variant,cycle,victorious:ending!=="defeat",recordedAt:cleanId(raw.recordedAt,40)||null});
 }
 return[...byResult.values()].slice(-CAMPAIGN_REINCARNATION_MAX_HISTORY)
}

export function normalizeCampaignReincarnationState(state){
 if(!plainRecord(state))return{version:CAMPAIGN_REINCARNATION_VERSION,cycle:0,cycleMaxFloor:1,active:false,available:false,history:[],processedResultIds:[],lastEnding:null,lastVariant:null};
 const campaign=normalizeCampaignState(state),source=plainRecord(campaign.reincarnation319)?campaign.reincarnation319:{},history=normalizeHistory(source.history),cycle=boundedInteger(source.cycle,0,0,999),cycleMaxFloor=boundedInteger(source.cycleMaxFloor,cycle?1:Math.max(1,Number(state.player?.maxFloor)||1),1,CAMPAIGN_MAX_FLOOR),last=history.at(-1),active=cycle>0&&source.active!==false;
 const result={version:CAMPAIGN_REINCARNATION_VERSION,cycle,cycleMaxFloor,active,available:!active&&(source.available===true||campaign.finalCompleted===true||history.some(entry=>entry.victorious)),history,processedResultIds:[...new Set((Array.isArray(source.processedResultIds)?source.processedResultIds:[]).map(value=>cleanId(value)).filter(Boolean))].slice(-64),lastEnding:CAMPAIGN_FINAL_ENDING_IDS.includes(source.lastEnding)?source.lastEnding:(last?.ending??null),lastVariant:cleanId(source.lastVariant,40)||(last?.variant??null),lastReincarnationId:cleanId(source.lastReincarnationId)||null};
 campaign.reincarnation319=result;return result
}

export function campaignCanonicalEnding(value,{won=false,partyWon=false,partySurvivors,partySize=4,remainingHeroes=null}={}){
 const heroCount=remainingHeroes==null?null:Math.max(0,Number(remainingHeroes)||0),victory=won===true||partyWon===true||heroCount===0,size=Math.max(1,Math.min(4,Math.floor(Number(partySize)||4))),survivors=partySurvivors==null?size:Array.isArray(partySurvivors)?partySurvivors.length:Math.max(0,Math.min(size,Math.floor(Number(partySurvivors)||0)));
 if(heroCount===0)return{ending:"complete",variant:"all-preempted",victorious:true};
 if(!victory||survivors<=0)return{ending:"defeat",variant:null,victorious:false};
 return survivors>=size?{ending:"complete",variant:null,victorious:true}:{ending:"narrow",variant:"last-stand",victorious:true}
}

export function recordCampaignConclusion(state,{ending="defeat",variant=null,resultId,recordedAt=null}={}){
 const reincarnation=normalizeCampaignReincarnationState(state),receipt=cleanId(resultId),canonical=endingId(ending);
 if(!receipt)return{state:reincarnation,recorded:false,reason:"missing-result-id"};
 if(reincarnation.processedResultIds.includes(receipt))return{state:reincarnation,recorded:false,duplicate:true,ending:canonical};
 const entry={resultId:receipt,ending:canonical,variant:cleanId(variant,40)||null,cycle:reincarnation.cycle,victorious:canonical!=="defeat",recordedAt:cleanId(recordedAt,40)||new Date().toISOString()};
 reincarnation.history.push(entry);if(reincarnation.history.length>CAMPAIGN_REINCARNATION_MAX_HISTORY)reincarnation.history.splice(0,reincarnation.history.length-CAMPAIGN_REINCARNATION_MAX_HISTORY);
 reincarnation.processedResultIds.push(receipt);if(reincarnation.processedResultIds.length>64)reincarnation.processedResultIds.splice(0,reincarnation.processedResultIds.length-64);
 reincarnation.lastEnding=canonical;reincarnation.lastVariant=entry.variant;if(entry.victorious){reincarnation.available=true;reincarnation.active=false;reincarnation.cycleMaxFloor=CAMPAIGN_MAX_FLOOR}
 return{state:reincarnation,recorded:true,ending:canonical,variant:entry.variant,victorious:entry.victorious}
}

export function campaignReincarnationDifficultyMultiplier(state){const cycle=normalizeCampaignReincarnationState(state).cycle;return Math.min(4,Number((1+cycle*.28).toFixed(2)))}
export function campaignReincarnationRewardMultiplier(state){const cycle=normalizeCampaignReincarnationState(state).cycle;return Math.min(2.5,Number((1+cycle*.12).toFixed(2)))}
export function campaignReincarnationFloorLimit(state){const progress=normalizeCampaignReincarnationState(state);return progress.active?progress.cycleMaxFloor:Math.min(CAMPAIGN_MAX_FLOOR,Math.max(1,Number(state?.player?.maxFloor)||1))}

export function recordCampaignReincarnationFloor(state,floor){
 const progress=normalizeCampaignReincarnationState(state),current=boundedInteger(floor,1,1,CAMPAIGN_MAX_FLOOR);if(!progress.active)return{state:progress,changed:false,maxFloor:campaignReincarnationFloorLimit(state)};
 const previous=progress.cycleMaxFloor,next=Math.max(previous,current);progress.cycleMaxFloor=next;return{state:progress,changed:next!==previous,maxFloor:next}
}

function clearFloorLedger(value){
 const source=plainRecord(value)?value:{},result={};for(const[key,entry]of Object.entries(source)){const floor=Number(key);if(!Number.isInteger(floor)||floor<1||floor>CAMPAIGN_MAX_FLOOR)result[key]=entry}return result
}

export function beginOptionalCampaignReincarnation(state,{resultId}={}){
 if(!plainRecord(state))return{ok:false,reason:"invalid-state"};
 const campaign=normalizeCampaignState(state),progress=normalizeCampaignReincarnationState(state),receipt=cleanId(resultId);
 if(!progress.available||campaign.finalCompleted!==true)return{ok:false,reason:"not-unlocked",state:progress};
 if(receipt&&progress.lastReincarnationId===receipt)return{ok:false,duplicate:true,state:progress};
 const oldFloors=Object.keys(campaign.floors??{}).map(Number).filter(floor=>Number.isInteger(floor)&&floor>=1&&floor<=CAMPAIGN_MAX_FLOOR);
 for(const floor of oldFloors)beginCampaignFloorReplay(state,floor,`reincarnation-${progress.cycle+1}`);
 campaign.invasionDaysSeen=[];delete campaign.story309;campaign.finalUnlocked=false;campaign.finalCompleted=false;campaign.finalPartyBackup=[];campaign.finalVitals={};campaign.finalStage=null;delete campaign.finalSessionPending;
 progress.cycle=Math.min(999,progress.cycle+1);campaign.heroEncounters310=createCampaignHeroEncounterState({storyCycle:progress.cycle});
 progress.cycleMaxFloor=1;progress.active=true;progress.available=false;progress.lastReincarnationId=receipt||`reincarnation-${progress.cycle}`;campaign.reincarnation319=progress;
 state.player=plainRecord(state.player)?state.player:{};state.player.currentFloor=1;state.player.checkpoint=1;state.player.inRun=false;state.player.floorSeeds={};state.player.dungeonShapeHistory=[];state.player.openedChests=clearFloorLedger(state.player.openedChests);state.player.bossKills=clearFloorLedger(state.player.bossKills);state.player.bossRewards=clearFloorLedger(state.player.bossRewards);state.player.pendingBossRewards=clearFloorLedger(state.player.pendingBossRewards);
 state.expeditionSnapshot=null;delete state.activeBattle;delete state.expeditionAffectionDeaths;delete state.manualReturn;delete state.returnReward;
 if(plainRecord(state.flags))state.flags.ending10000Played=false;
 return{ok:true,state:progress,cycle:progress.cycle,difficultyMultiplier:campaignReincarnationDifficultyMultiplier(state),rewardMultiplier:campaignReincarnationRewardMultiplier(state),preserved:{monsters:true,equipment:true,currency:true,inventory:true,endingHistory:true}}
}
