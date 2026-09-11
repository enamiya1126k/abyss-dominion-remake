import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';
import * as chapter from '../../src/chapterTwo/ChapterTwoSystem.js';import * as end from '../../src/core/EndgameSystem.js';
import * as campaign from '../../src/core/Campaign100System.js';import {createFloorBossChallengeEncounter} from '../../src/core/FloorBossChallengeSystem.js';import {FLOOR_BOSS_CATALOG} from '../../src/data/floorBosses.js';
import {balanceTeamBattleEnemies} from '../../src/core/TeamBattleBalanceSystem.js';import {calculatedStats} from '../../src/models/Monster.js';import {applyCampaignHeroLoadout} from '../../src/core/CampaignHeroLoadoutSystem.js';import {tuneFinalHero} from '../../src/core/Postgame361System.js';import {CAMPAIGN_HERO_IDS} from '../../src/core/CampaignHeroEncounterSystem.js';import {memoryLevel} from '../../src/core/RoyalMemory379.js';
const source=fs.readFileSync('src/main.js','utf8'),map=JSON.parse(fs.readFileSync('tools/build415/native-source-map.json'));
const names=new Set(['applyEnemyMultiplier','prepareEnemyEntry','hydrateEndgameEnemy','applyEnemyMagicCircleProfile','applyFloorBossSignatureProfile','makeBattleEnemy','milestoneBossEntry','floorBossEnemy','normalizedElement','attributeSynergyFor','ensureUniqueEnemyMagicCircles','campaignHeroBattleEntry','campaignHeroLedger','campaignHeroName']);const bindings={};
for(const e of map.imports){const mod=await import(path.resolve('src',e.source.split('?')[0]));for(const s of e.specifiers)bindings[s.local]=s.imported==='*'?mod:mod[s.imported];}
const ctx=vm.createContext({...bindings,console,Math,save:{state:null}});vm.runInContext(map.functions.filter(f=>names.has(f.name)).map(f=>source.slice(f.start,f.end)).join('\n')+'\nconst '+map.constants.find(c=>c.startsWith('ENEMY_EQUIPMENT_SUBSLOTS'))+';',ctx);
export function targetList415(){
 const list=[];for(let floor=1;floor<=100;floor++)for(const id of campaign.campaignMilestoneBossIds(floor).length?campaign.campaignMilestoneBossIds(floor):[null])list.push({mode:'campaign',floor,id,key:`campaign:${floor}:${id??'boss'}`});
 for(const boss of FLOOR_BOSS_CATALOG)list.push({mode:'rematch',id:boss.id,floor:100,key:`rematch:${boss.id}`});
 for(let i=1;i<=112;i++)list.push({mode:'corridor',i,floor:100,key:`corridor:${i}`});
 for(let i=1;i<=90;i++)list.push({mode:'team',i,floor:100,key:`team:${i}`});
 for(const id of Object.keys(end.ENDGAME_BOSSES))for(const tier of end.ENDGAME_CHALLENGE_TIERS)list.push({mode:'manual',id,tier:tier.id,level:Math.min(10000,tier.level),floor:100,key:`manual:${id}:${tier.id}`});
 for(const [id,d]of Object.entries(chapter.ENCOUNTERS))for(const n of d.elite393?[1,2,3]:[0,1,2,3,4,5])list.push({mode:'chapter',id,run:{area:d.area,challengeTier:d.elite393?0:n,...(d.elite393?{eliteTier393:n}:{})},floor:100,key:`chapter:${id}:${n}`});
 for(let stage=0;stage<=19;stage++)list.push({mode:'heroes',stage,floor:100,level:stage?memoryLevel(stage):1000,key:`heroes:${stage}`});return list;
}
export function makeEnemies415(t,party=[]){
 const state={player:{currentFloor:t.floor,maxFloor:t.floor},monsters:party,party:party.map(u=>u.id),floorBossChallenges:{discovered:Object.fromEntries(FLOOR_BOSS_CATALOG.map(b=>[b.id,true]))}};ctx.save.state=state;
 let entries,options={specialBattle:true};
 if(t.mode==='campaign'){entries=[ctx.floorBossEnemy(t.id)];options={};}
 if(t.mode==='rematch')entries=createFloorBossChallengeEncounter(state,t.id).enemies;
 if(t.mode==='corridor'){options={specialBattle:true,specialBattleType:'gauntlet',specialTrialNumber:t.i,specialTrialLoop:1};end.normalizeEndgameState(state).trials.loop=1;entries=end.createEndgameTrialEncounter(state,t.i).enemies;}
 if(t.mode==='team'){options={specialBattle:true,specialBattleType:'team',specialTeamStage:t.i};end.normalizeEndgameState(state).teamBattle.stage=t.i;entries=end.createTeamBattleEncounter(state);}
 if(t.mode==='manual'){const tier=end.ENDGAME_CHALLENGE_TIERS.find(x=>x.id===t.tier);entries=end.applyPreludeToEncounter(end.createEmergencyEncounter(state,t.id),tier).enemies;Object.assign(options,{specialBattleType:'emergency',manualEndgameChallenge:true,preludeChoiceId:t.tier});}
 if(t.mode==='chapter'){entries=chapter.chapterTwoEnemyEntries(t.id,t.run);options.specialBattleType='chapterTwo';options.chapterPreparationTier415=t.run.challengeTier;options.chapterPreparationElite415=t.run.eliteTier393??0;options.chapterPreparationVault415=t.id.startsWith('vault');options.chapterTwoEncounter=t.id;}
 if(t.mode==='heroes'){const room=ctx.royalState(state);room.attempt={memory:t.stage>0,memoryLevel379:t.stage?t.level:null};options={specialBattle:true,specialBattleType:'campaignFinal',campaignStage:'party'};entries=CAMPAIGN_HERO_IDS.map(id=>({...ctx.campaignHeroBattleEntry(id,{final:true}),level:t.level}));}

 const units=ctx.ensureUniqueEnemyMagicCircles(entries.map((e,i)=>ctx.makeBattleEnemy(e,i)),t.floor);
 const synergy=ctx.attributeSynergyFor(units.map(u=>u.trialElement));for(const u of units){if(synergy&&ctx.normalizedElement(u.trialElement)===synergy.element){ctx.applyEnemyMultiplier(u,1+Math.max(synergy.atk??0,synergy.def??0,synergy.hp??0,synergy.spd??0));u.crit=(u.crit??0)+(synergy.crit??0);u.evasion=(u.evasion??0)+(synergy.evasion??0);}}
 if(t.mode==='chapter')units.forEach((u,i)=>{chapter.tuneChapterTwoEnemy(u,t.id,i,t.run);if(u.chapterTwoTactics382)ctx.applyEnemyMagicCircleProfile(u,u.enemyMagicCircle);});
 if(t.mode==='team')balanceTeamBattleEnemies(units,party.map(calculatedStats),t.i);
 return {units,options};
}
