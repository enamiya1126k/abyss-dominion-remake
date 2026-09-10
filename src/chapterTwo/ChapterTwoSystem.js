import {installChapterTwoRoster397} from './ChapterTwoRoster397.js?v=3.1.77-build397';
import {grantChapterTwoSpoils394} from './ChapterTwoRewards394.js?v=3.1.78-build398';
import {CHAPTER_TWO_ELITE_TIERS393,installChapterTwoElite393,chapterTwoEliteTier393,chapterTwoEliteUnlockedTier393,tuneChapterTwoElite393} from './ChapterTwoElite393.js?v=3.1.73-build393';
import {installChapterTwoHabitats392} from './ChapterTwoMonsters392.js?v=3.1.72-build392';
import {installChapterTwoHabitats391,chapterTwoRoamingBase391,chapterTwoRoamingId391} from './ChapterTwoMonsters391.js?v=3.1.73-build393';
import {installChapterTwoHabitats390} from './ChapterTwoMonsters390.js?v=3.1.70-build390';
import {installChapterTwoHabitats389} from './ChapterTwoMonsters389.js?v=3.1.69-build389';
import {installChapterTwoHabitats388} from './ChapterTwoMonsters388.js?v=3.1.68-build388';
import {installChapterTwoHabitats387} from './ChapterTwoMonsters387.js?v=3.1.67-build387';
import {installChapterTwoHabitats386} from './ChapterTwoMonsters386.js?v=3.1.66-build386';
import {installChapterTwoHabitats385} from './ChapterTwoMonsters385.js?v=3.1.65-build385';
import {installChapterTwoHabitats384} from './ChapterTwoMonsters384.js?v=3.1.70-build390';
import {installChapterTwoHabitats383,chapterTwoNativeHint383} from './ChapterTwoMonsters383.js?v=3.1.82-build402';
import {chapterTwoLoadouts382,applyChapterTwoGear382,chapterTwoTacticHint382} from './ChapterTwoTactics382.js?v=3.1.78-build398';
import {createVaultWeapon380} from './VaultGear380.js?v=3.1.60-build380';
import {createMonster} from '../models/Monster.js?v=3.1.82-build402';
import {createSignatureEquipment} from '../core/SignatureWeaponSystem.js?v=3.1.72-build392';
import {CHAPTER_TWO_AREAS,CHAPTER_TWO_NEW_ENCOUNTERS,chapterTwoArea,chapterTwoRooms} from './ChapterTwoContent.js?v=3.1.58-build378';
import {createEquipment} from '../models/Equipment.js';
import {receiveEquipment} from '../services/EquipmentStorage.js?v=3.1.78-build398';
import {EQUIPMENT_BASES} from '../data/equipment.js';
import {chapterTwoSpawn,chapterTwoPortal,createChapterTwoWorld} from './ChapterTwoMap.js?v=3.1.60-build380';
import {applyTotalExperience,totalExperience} from '../models/Monster.js?v=3.1.82-build402';
export const CHAPTER_TWO_KEY='chapterTwo376';
const victories=new Set(['complete','narrow','all-preempted']);
export function chapterTwoUnlocked(state){
 const c=state?.campaign100??{},arena=c.heroEncounters310?.finalArena??{};
 const floor100=c.floors?.['100'];
 const passed100=floor100?.bossDefeated===true||floor100?.cleared===true||c.finalUnlocked===true||Number(state?.player?.maxFloor)>=100;
 const won=c.finalCompleted===true||(arena.completed===true&&victories.has(arena.lastEnding))||(c.reincarnation319?.history??[]).some(r=>r.victorious===true&&victories.has(r.ending));
 return Boolean(passed100&&won);
}
export {CHAPTER_TWO_AREAS,chapterTwoArea,chapterTwoRooms} from './ChapterTwoContent.js?v=3.1.58-build378';
export const ROOMS=CHAPTER_TWO_AREAS[0].rooms;
export const ENCOUNTERS=({...CHAPTER_TWO_NEW_ENCOUNTERS,
 patrol:{name:'侵食された獣たち',species:['dire_wolf','jade_mantis'],level:1050,hp:90000,atk:11000,def:5500,spd:4800,experience:30000,gold:45000},
 west:{name:'西封樹の守護者',species:['root_guard','mandrake'],level:1100,hp:150000,atk:15500,def:8000,spd:5500,experience:50000,gold:70000,seal:true},
 east:{name:'東封樹の守護者',species:['moss_golem','frost_dryad'],level:1100,hp:150000,atk:14500,def:9500,spd:5000,experience:50000,gold:70000,seal:true},
 heart:{name:'世界樹の残響・侵食体',species:['world_tree_guardian','frost_dryad'],level:1200,hp:380000,atk:21000,def:11000,spd:6500,experience:120000,gold:180000,boss:true}
});
// Build382: keep story identities, author role-compatible escorts.
for(const [id,species] of Object.entries({
 heart:['world_tree_guardian','jade_mantis','root_guard','frost_dryad'],
 a1_heart:['ogre','mandrake','dark_knight','frost_dryad'],
 a2_patrol:['wraith','stone_golem','goblin_shaman'],
 a2_heart:['ancient_dragon','wraith','dark_knight','goblin_shaman'],
 a3_heart:['ancient_dragon','clockwork','angelic_orb','water_spirit'],
 a4_heart:['ancient_dragon','clockwork','frost_dragon','water_spirit']
}))ENCOUNTERS[id]={...ENCOUNTERS[id],species,authorities:({a2_heart:['abyss_pride','abyss_lust','abyss_wrath','abyss_greed'],a3_heart:['ten_divinity','ten_time','ten_creation','ten_life'],a4_heart:['ten_divinity','ten_time','ten_chaos','ten_life']})[id]??ENCOUNTERS[id].authorities};
for(const area of CHAPTER_TWO_AREAS){
 const boss=ENCOUNTERS[area.keys[3]],patrol=ENCOUNTERS[area.keys[0]];
 ENCOUNTERS[`vault${area.id}`]={...boss,boss:false,seal:false,vault:true,area:area.id,name:`${area.name}・宝物庫の番人`,level:Math.round(area.level*1.65),hp:Math.round(boss.hp*2.8),atk:Math.round(boss.atk*1.65),def:Math.round(boss.def*1.35),experience:boss.experience*2,gold:boss.gold*2};
 for(const room of [1,3,4])ENCOUNTERS[`roam${area.id}_${room}`]={...patrol,boss:false,seal:false,roaming:true,room,area:area.id,name:`${area.name}の残党`,experience:Math.floor(patrol.experience*.5),gold:Math.floor(patrol.gold*.5)};
}
installChapterTwoHabitats383(ENCOUNTERS);
installChapterTwoHabitats384(ENCOUNTERS);
installChapterTwoHabitats385(ENCOUNTERS);
installChapterTwoHabitats386(ENCOUNTERS);
installChapterTwoHabitats387(ENCOUNTERS);
installChapterTwoHabitats388(ENCOUNTERS);
installChapterTwoHabitats389(ENCOUNTERS);
installChapterTwoHabitats390(ENCOUNTERS);
installChapterTwoHabitats391(ENCOUNTERS);
installChapterTwoHabitats392(ENCOUNTERS);
installChapterTwoElite393(ENCOUNTERS);
installChapterTwoRoster397(ENCOUNTERS);
const copy=x=>JSON.parse(JSON.stringify(x));
const count=x=>Math.max(0,Math.min(1e9,Math.floor(Number(x)||0)));
export function chapterTwoState(state){
 if(!chapterTwoUnlocked(state))return null;
 let p=state[CHAPTER_TWO_KEY];
 if(!p||typeof p!=='object'||Array.isArray(p))p=state[CHAPTER_TWO_KEY]={version:1,introIndex:0,introComplete:false,epilogueIndex:0,epilogueComplete:false,clears:0,serial:0,run:null};
 p.clears=count(p.clears);p.serial=count(p.serial);p.introIndex=count(p.introIndex);p.epilogueIndex=count(p.epilogueIndex);p.introComplete=p.introComplete===true;p.epilogueComplete=p.epilogueComplete===true;
 p.areaClears378??={};p.areaClears378[0]=Math.max(count(p.areaClears378[0]),p.clears);p.runs378??={};p.vaults380??={};p.stories378??={};p.challengeClears378??={};p.eliteClears393??={};
 if(p.run&&(!Number.isInteger(p.run.room)||!ROOMS[p.run.room]||!Number.isInteger(p.run.serial)))p.run=null;
 if(p.run){const r=p.run;r.area=CHAPTER_TWO_AREAS[r.area]?r.area:0;const area=chapterTwoArea(r);
  r.keys380??=area.keys.slice(1,3).filter(id=>(r.defeated??[]).includes(id));
  r.roaming380??=[];r.visit380??=0;if(!chapterTwoEliteTier393(r))delete r.eliteTier393;r.vault380=p.vaults380[r.area]??={defeated:false,chests:[]};
  r.defeated=[...new Set((Array.isArray(r.defeated)?r.defeated:[]).filter(id=>area.keys.includes(id)))];r.visited=[...new Set([0,r.room,...(Array.isArray(r.visited)?r.visited:[])].filter(id=>ROOMS[id]))];r.completed=r.defeated.includes(area.keys[3]);
  if(r.pending&&(!ENCOUNTERS[r.pending.encounter]||!Array.isArray(r.pending.partyIds)))r.pending=null;
  if(r.geometryVersion!==377||!Number.isInteger(r.position?.x)||!Number.isInteger(r.position?.y)){r.position=chapterTwoSpawn(r);r.geometryVersion=377;}r.startedAt??=Date.now();p.runs378[r.area]=r;
 }

 return p;
}
export function chapterTwoAreaUnlocked(state,area=0){const p=chapterTwoState(state);return !!p&&!!CHAPTER_TWO_AREAS[area]&&(area===0||count(p.areaClears378[area-1])>0);}
export function selectChapterTwoArea(state,area){const p=chapterTwoState(state);if(!p||!chapterTwoAreaUnlocked(state,area)||p.run?.pending||state.activeBattle||state.player?.inRun)return{ok:false};if(p.runs378[area]){p.run=p.runs378[area];chapterTwoState(state);return{ok:true,run:p.run}}return beginChapterTwoRun(state,{area});}
export function beginChapterTwoRun(state,{area=0,challenge=false}={}){
 const p=chapterTwoState(state);if(!p?.introComplete||!chapterTwoAreaUnlocked(state,area)||state.player?.inRun||state.activeBattle||p.run?.pending||!(state.party??[]).some(id=>state.monsters?.some(m=>m.id===id))||challenge&&!p.endingComplete378)return{ok:false};
 p.serial++;p.run={area,challenge,challengeTier:challenge?Math.min(5,1+count(p.challengeClears378[area])):0,serial:p.serial,room:0,visited:[0],defeated:[],chest:false,pending:null,completed:false,geometryVersion:377,startedAt:Date.now(),keys380:[],roaming380:[],visit380:0};p.run.vault380=p.vaults380[area]??={defeated:false,chests:[]};p.run.position=chapterTwoSpawn(p.run);p.runs378[area]=p.run;p.dungeonHint377=false;return{ok:true,run:p.run};
}
export function beginChapterTwoElite393(state,area,tier=1,{resume=false}={}){
 const p=chapterTwoState(state),r=p?.runs378?.[area],a=CHAPTER_TWO_AREAS[area];
 if(!p?.introComplete||!a||!chapterTwoAreaUnlocked(state,area)||state.activeBattle||state.player?.inRun||p.run?.pending||r?.pending||!(state.party??[]).some(id=>state.monsters?.some(m=>m.id===id)))return{ok:false};
 if(!r?.defeated?.includes(a.keys[3])||!chapterTwoEliteUnlockedTier393(p,area))return{ok:false,message:'この地域を踏破してから挑戦できます。'};
 if(resume){if(!chapterTwoEliteTier393(r))return{ok:false};p.run=r;chapterTwoState(state);return{ok:true,run:r};}
 if(!Number.isInteger(tier)||tier<1||tier>chapterTwoEliteUnlockedTier393(p,area))return{ok:false,message:'一つ前の段階で3部隊を討伐すると解放されます。'};
 p.run=r;r.eliteTier393=tier;r.visit380=count(r.visit380)+1;r.roaming380=[];r.room=0;r.position=chapterTwoSpawn(r);r.auto377=false;r.startedAt=Date.now();chapterTwoState(state);
 return{ok:true,run:r};
}
export function moveChapterTwoRoom(state,direction){
 const p=chapterTwoState(state),r=p?.run;if(!r||r.pending)return{ok:false};
 const next=chapterTwoRooms(r)[r.room].links[direction];if(next==null)return{ok:false};
 if(next===5&&!chapterTwoArea(r).keys.slice(1,3).every(id=>r.keys380.includes(id)))return{ok:false,message:`${chapterTwoArea(r).gate}を2つ揃えると、この通路が開きます。`};
 const portal=chapterTwoPortal(r,direction);if(!portal)return{ok:false};r.room=next;r.position={x:portal.arrivalX,y:portal.arrivalY};
 if(!r.visited.includes(next))r.visited.push(next);return{ok:true};
}
export function beginChapterTwoEncounter(state,id){
 const p=chapterTwoState(state),r=p?.run;
 if(r&&id===chapterTwoArea(r).keys[3]&&!chapterTwoArea(r).keys.slice(1,3).every(key=>r.keys380.includes(key)))return{ok:false};
 if(!r||!ENCOUNTERS[id])return{ok:false};
 const selected=chapterTwoRoamingId391(r,id,ENCOUNTERS);
 if(ENCOUNTERS[id].roamingBase391&&selected!==id)return{ok:false};
 id=selected;
 const e=ENCOUNTERS[id];
 if(e.vault?e.area!==r.area||r.room!==2||r.vault380.defeated:e.roaming?e.area!==r.area||!r.completed||r.room!==e.room||r.roaming380.includes(chapterTwoRoamingBase391(id,ENCOUNTERS)):r.completed||chapterTwoRooms(r)[r.room].encounter!==id||r.defeated.includes(id))return{ok:false};
 if(r.pending&&r.pending.encounter!==id)return{ok:false};
 r.pending??={token:ENCOUNTERS[id].roaming?`roam:${r.serial}:${r.visit380}:${id}`:`forest:${r.serial}:${id}`,encounter:id,partyIds:[...new Set(state.party??[])].slice(0,4),...(e.elite393?{eliteTier393:chapterTwoEliteTier393(r)}:{})};
 return{ok:true,...copy(r.pending)};
}
function currency(state,key,amount){state.player??={};const before=Math.max(0,Number(state.player[key])||0);state.player[key]=Math.min(Number.MAX_SAFE_INTEGER,before+amount);return state.player[key]-before;}
// Progress and rewards are changed together; caller saves them in one transaction.
export function settleChapterTwoEncounter(state,token,{won=false}={}){
 const p=chapterTwoState(state),r=p?.run,attempt=r?.pending;
 if(!attempt||attempt.token!==token||(ENCOUNTERS[attempt.encounter]?.vault?r.room!==2:ENCOUNTERS[attempt.encounter]?.roaming?r.room!==ENCOUNTERS[attempt.encounter].room:chapterTwoRooms(r)[r.room].encounter!==attempt.encounter))return{ok:false,duplicate:true};
 const encounter=ENCOUNTERS[attempt.encounter];r.pending=null;
 if(!won)return{ok:true,won:false};
 if(r.defeated.includes(attempt.encounter))return{ok:false,duplicate:true};
 if(encounter.vault)r.vault380.defeated=true;else if(encounter.roaming){const base=chapterTwoRoamingBase391(attempt.encounter,ENCOUNTERS);if(r.roaming380.includes(base))return{ok:false,duplicate:true};r.roaming380.push(base)}else r.defeated.push(attempt.encounter);
 const area=chapterTwoArea(r),firstClear=Boolean(encounter.boss&&!p.areaClears378[area.id]),multiplier=encounter.elite393?CHAPTER_TWO_ELITE_TIERS393[attempt.eliteTier393||1].reward:r.challenge?1+(r.challengeTier??1)*.5:1;
 const experience=Math.floor((encounter.experience+(firstClear?180000*(area.id+1):0))*multiplier),members=[];
 for(const id of attempt.partyIds){const m=state.monsters?.find(m=>m.id===id);if(!m)continue;const before=m.level;applyTotalExperience(m,Math.min(Number.MAX_SAFE_INTEGER,totalExperience(m)+experience));members.push({id,before,after:m.level});}
 const gold=currency(state,'gold',Math.floor(encounter.gold*multiplier)),crystals=firstClear?currency(state,'crystals',300*(area.id+1)):0;
 const experiencePacks=(area.id>0||r.challenge||encounter.elite393)?Math.floor((encounter.boss?30:10)*(area.id+1)*multiplier):0;
 if(experiencePacks){state.inventory??={};state.inventory.experienceItemsUltra=count(state.inventory.experienceItemsUltra)+experiencePacks;}
 let equipment=null;
 if(encounter.roaming&&r.roaming380.length===3){
  const eliteTier=encounter.elite393?(attempt.eliteTier393||1):0,slot=eliteTier?['weapon','armor','accessory','weapon','armor'][area.id]:'weapon';
  const item=createEquipment(slot,{rarity:eliteTier>=2?'神話':'LR'});item.level=Math.round(area.level*(eliteTier?CHAPTER_TWO_ELITE_TIERS393[eliteTier].level:1));
  if(eliteTier){item.plus=CHAPTER_TWO_ELITE_TIERS393[eliteTier].plus;item.obtainedMethod='chapterTwoElite393';p.eliteClears393[area.id]=Math.max(Math.min(3,count(p.eliteClears393[area.id])),eliteTier);}
  const receipt=receiveEquipment(state,item,{bossReward:true});equipment={name:item.name,rarity:item.rarity,level:item.level,plus:item.plus,slot,id:item.id,receipt:receipt.message};
 }
 if(encounter.boss){p.areaClears378[area.id]=count(p.areaClears378[area.id])+1;if(area.id===0)p.clears=p.areaClears378[0];r.completed=true;p.dungeonHint377=true;
  if(r.challenge)p.challengeClears378[area.id]=count(p.challengeClears378[area.id])+1;
  if(area.id>0||r.challenge){const slot=['accessory','weapon','armor','accessory','weapon'][area.id],base=EQUIPMENT_BASES[slot][(area.id*7)%EQUIPMENT_BASES[slot].length],item=createEquipment(slot,{rarity:'神話',base});item.name=['境界の残光','黒根断ちの刃','深淵を歩む装甲','天律の盟約','白紙の未来'][area.id];item.level=Math.round(area.level*(1+(r.challengeTier??0)*.15));item.plus=10+area.id*5+(r.challengeTier??0)*5;item.favorite=true;item.locked=true;item.obtainedMethod='chapterTwo';const receipt=receiveEquipment(state,item,{bossReward:true});equipment={name:item.name,rarity:item.rarity,level:item.level,plus:item.plus,slot,receipt:receipt.message,id:item.id};}
 }
 const spoils394=encounter.elite393?grantChapterTwoSpoils394(state,attempt.encounter,area.level,attempt.eliteTier393||1,r.roaming380.length===3):null;
 const result={ok:true,won:true,spoils394,token,area:area.id,challenge:!!r.challenge&&!encounter.elite393,eliteTier393:encounter.elite393?(attempt.eliteTier393||1):0,encounter:attempt.encounter,experience,gold,crystals,firstClear,members,equipment,experiencePacks};p.lastReward=result;recordChapterTwo380(state,result);return result;
}

export function openChapterTwoChest(state){const p=chapterTwoState(state),r=p?.run;if(!r||r.pending||r.room!==2||r.chest)return{ok:false};r.chest=true;return{ok:true,gold:currency(state,'gold',80000*(chapterTwoArea(r).id+1))};}
export function chapterTwoEnemyEntries(id,run=null){
 id=chapterTwoRoamingId391(run,id,ENCOUNTERS);
 const e=ENCOUNTERS[id];if(!e)return[];const loadouts=chapterTwoLoadouts382(id,e,run);
 return e.species.map((speciesId,i)=>({speciesId,endgameBossId:e.authorities?.[i]??null,faction:e.authorities?.[i]?.startsWith('ten_')?'tenGod':e.authorities?.[i]?'abyss':null,teamBattle:!!e.area,teamBattleRole:e.roles?.[i],level:Math.round(e.level*(e.elite393?CHAPTER_TWO_ELITE_TIERS393[chapterTwoEliteTier393(run)||1].level:1+(run?.challengeTier??0)*.18)),chapterTwoEncounter:id,chapterTwoIndex:i,boss:i===0&&(e.boss||e.seal||e.vault)||false,nameOverride:e.memberNames397?.[i]??(i===0&&(e.boss||e.seal||e.vault)?e.name:undefined),uncapturable:!!e.authorities?.[i]||i===0&&(e.boss||e.seal||e.vault)||false,enemyLoadoutVersion:5,enemyGear:[],enemyMagicCircle:null,equipped:false,fixedTrialScaling:true,enemyFloor:100,statMultiplier:1,...loadouts[i]}));
}
export function tuneChapterTwoEnemy(enemy,id,index=0,run=null){
 id=chapterTwoRoamingId391(run,id,ENCOUNTERS);
 const e=ENCOUNTERS[id];if(!e)return;
 const support=index>0&&Boolean(e.boss||e.seal||e.vault),rate=support?.72:1;
 Object.assign(enemy,{maxHp:Math.round(e.hp*rate),hp:Math.round(e.hp*rate),atk:Math.round(e.atk*rate),matk:Math.round(e.atk*(support?.8:.9)),def:Math.round(e.def*rate),mdef:Math.round(e.def*rate),spd:e.spd+(support?600:0),maxMp:1800,currentMp:1800,accuracy:110,evasion:8,hiddenCapturePressure:1,bossStatusResist:.15,bossHealRate:.08,bossPowerMultiplier:1.5});
 // The escort's existing healing AI can be focused down; no new global skill rules.
 if(support&&!enemy.chapterTwoTactics382)enemy.role=(index===1?'healer':'attacker');
 if(e.area||e.vault){enemy.teamBattle=true;enemy.teamBattleRole=enemy.chapterTwoTactics382?.role??e.roles?.[index];enemy.hiddenDamageTaken=1;if(e.memberNames397?.[index])enemy.name=e.memberNames397[index];else if(index===0&&(e.boss||e.seal||e.vault))enemy.name=e.name;const factor=e.elite393?1:1+(run?.challengeTier??0)*.3;for(const key of ['maxHp','hp','atk','matk','def','mdef','spd'])enemy[key]=Math.round(enemy[key]*factor);if(e.area>=3&&index===0&&!e.chapterTwoNative383){enemy.heroShield348=Math.floor(enemy.maxHp*.18);enemy.heroShieldMax378=enemy.heroShield348;}}
 applyChapterTwoGear382(enemy);
 tuneChapterTwoElite393(enemy,e,run);
}
export function walkable(x,y){return Number.isInteger(x)&&Number.isInteger(y)&&x>=2&&x<=16&&y>=2&&y<=16;}
export function chapterTwoWorld(run){
 const world=createChapterTwoWorld(run,chapterTwoRooms(run),ENCOUNTERS);
 for(const boss of world.bosses){const id=chapterTwoRoamingId391(run,boss.id,ENCOUNTERS);if(id!==boss.id){const e=ENCOUNTERS[id];boss.id=id;boss.chapterEnemy={speciesId:e.species[0],endgameBossId:e.authorities?.[0]??null,visualSpeciesId:e.authorities?.[0]??null,level:Math.round(e.level*(e.elite393?CHAPTER_TWO_ELITE_TIERS393[chapterTwoEliteTier393(run)||1].level:1))};}}
 return world;
}

export function chapterTwoObjective(run){
 const a=chapterTwoArea(run),defeated=run?.defeated??[],seals=a.keys.slice(1,3).filter(id=>(run?.keys380??defeated).includes(id)).length,rooms=a.rooms;
 if(run?.completed&&chapterTwoEliteTier393(run)){const tier=chapterTwoEliteTier393(run),remaining=[1,3,4].filter(n=>!run.roaming380.includes(`roam${a.id}_${n}`)),targetRoom=remaining[0]??null;return{title:remaining.length?`${CHAPTER_TWO_ELITE_TIERS393[tier].name}部隊を討伐（${3-remaining.length}/3）`:`${CHAPTER_TWO_ELITE_TIERS393[tier].name}・全3部隊討伐`,detail:remaining.length?`${a.rooms.find(r=>r.id===targetRoom).name}の精鋭部隊へ。相手の連携と支援役を見て狙いを決めよう。`:tier<3?'拠点の探索開始から次の段階へ挑戦できます。':'極冠を制圧。再挑戦して装備を集めることもできます。',seals,targetRoom};}
 if(run?.completed)return {title:`${a.name}を解放した`,detail:a.id<4?`帰還して「${CHAPTER_TWO_AREAS[a.id+1].name}」へ。ダンジョンの行き先から進めます。`:'裁定者を退けた。帰還して物語の結末へ。',seals,targetRoom:null};
 if(seals===2)return {title:run?.room===5?`${ENCOUNTERS[a.keys[3]].name}を倒す`:'最深部へ向かう',detail:`${rooms[4].name}から${rooms[5].name}へ続く道が開いています。`,seals,targetRoom:5};
 return {title:`${a.goal}【${seals}/2】`,detail:`${rooms[3].name}と${rooms[4].name}の守護者を倒し、落ちた鍵を拾おう。`,seals,targetRoom:(run?.keys380??defeated).includes(a.keys[1])?4:3};
}
export function chapterTwoNeedsIntroduction(state){return chapterTwoUnlocked(state)&&state.chapterTwo376?.introComplete!==true;}
export function chapterTwoDungeonHint(state){return chapterTwoUnlocked(state)&&state.chapterTwo376?.introComplete===true&&state.chapterTwo376?.dungeonHint377!==false;}

export function recordChapterTwo380(state,result){const p=chapterTwoState(state);p.expedition380??={gold:0,experience:0,crystals:0,experiencePacks:0,battles:0,equipment:[]};const x=p.expedition380;for(const k of ['gold','experience','crystals','experiencePacks'])x[k]+=Number(result[k])||0;if(result.won)x.battles++;if(result.equipment)x.equipment.push(result.equipment);if(result.spoils394?.relic)x.equipment.push(result.spoils394.relic);if(result.spoils394?.circle)(x.circles395??=[]).push(result.spoils394.circle);}
export function takeChapterTwoSummary380(state){const p=chapterTwoState(state);if(!p)return null;const report=copy(p.expedition380??{gold:0,experience:0,battles:0,equipment:[]});p.expedition380=null;return report;}
export function pickupChapterTwoKey380(state,id){const p=chapterTwoState(state),r=p?.run,a=chapterTwoArea(r);if(!r||r.pending||!a.keys.slice(1,3).includes(id)||chapterTwoRooms(r)[r.room].encounter!==id||!r.defeated.includes(id)||r.keys380.includes(id))return{ok:false};r.keys380.push(id);return{ok:true,encounter:id,sealPickup:true};}
export function refreshChapterTwoRoaming380(state){const p=chapterTwoState(state);if(!p?.run?.completed||p.run.pending)return;const r=p.run;r.visit380++;r.roaming380=[];delete r.eliteTier393;}
export function openVaultChest380(state,index){const p=chapterTwoState(state),r=p?.run;if(!r||r.pending||r.room!==2||!r.vault380.defeated||!Number.isInteger(index)||index<0||index>9||r.vault380.chests.includes(index))return{ok:false};r.vault380.chests.push(index);const area=chapterTwoArea(r);let result={ok:true,gold:0,experiencePacks:0};
 if(index===9||index%3===2){const item=index===9?createVaultWeapon380(r.area):createEquipment(['weapon','armor','accessory'][Math.floor(index/3)],{rarity:'神話'});if(index!==9){item.level=area.level;item.favorite=true;item.locked=true}const receipt=receiveEquipment(state,item,{bossReward:true});result.equipment={id:item.id,name:item.name,rarity:item.rarity,level:item.level,plus:item.plus,receipt:receipt.message};}
 else if(index%3===0)result.gold=currency(state,'gold',250000*(r.area+1));else{result.experiencePacks=30*(r.area+1);state.inventory??={};state.inventory.experienceItemsUltra=count(state.inventory.experienceItemsUltra)+result.experiencePacks;}
 recordChapterTwo380(state,result);return result;}
export const CHAPTER_TWO_HERO_IDS396=Object.freeze(['myth_enami','myth_yori','myth_hide','myth_rion']);
export function recruitChapterTwoHeroes380(state){const p=chapterTwoState(state);if(!p?.introComplete||p.alliance380)return{ok:false};state.monsters??=[];const joined=[],weapons=[];for(const id of CHAPTER_TWO_HERO_IDS396){if(!state.monsters.some(m=>m.speciesId===id)){const m=createMonster(id,{level:1000,rank:1});m.favorite=true;m.locked=true;state.monsters.push(m);joined.push(m.id)}const item=createSignatureEquipment(id,0);item.level=1;item.plus=0;item.favorite=true;item.locked=true;receiveEquipment(state,item,{bossReward:true});weapons.push(item.name)}p.alliance380={joined,weapons,at:Date.now(),presentationVersion396:1,presentationAcknowledged396:false};return{ok:true,joined,weapons};}
export function chapterTwoHint380(id){if(ENCOUNTERS[id]?.roster397)return ENCOUNTERS[id].hint;if(ENCOUNTERS[id]?.elite393)return ENCOUNTERS[id].hint;const nativeHint=chapterTwoNativeHint383(ENCOUNTERS[id]);if(nativeHint)return nativeHint;const e=ENCOUNTERS[id];return e?chapterTwoTacticHint382(id,e):'';}
