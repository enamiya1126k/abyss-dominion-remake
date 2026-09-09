import {CHAPTER_TWO_AREAS,CHAPTER_TWO_NEW_ENCOUNTERS,chapterTwoArea,chapterTwoRooms} from './ChapterTwoContent.js?v=3.1.58-build378';
import {createEquipment} from '../models/Equipment.js';
import {receiveEquipment} from '../services/EquipmentStorage.js';
import {EQUIPMENT_BASES} from '../data/equipment.js';
import {chapterTwoSpawn,chapterTwoPortal,createChapterTwoWorld} from './ChapterTwoMap.js?v=3.1.58-build378';
import {applyTotalExperience,totalExperience} from '../models/Monster.js?v=3.1.58-build378';
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
export const ENCOUNTERS=Object.freeze({...CHAPTER_TWO_NEW_ENCOUNTERS,
 patrol:{name:'侵食された獣たち',species:['dire_wolf','jade_mantis'],level:1050,hp:90000,atk:11000,def:5500,spd:4800,experience:30000,gold:45000},
 west:{name:'西封樹の守護者',species:['root_guard','mandrake'],level:1100,hp:150000,atk:15500,def:8000,spd:5500,experience:50000,gold:70000,seal:true},
 east:{name:'東封樹の守護者',species:['moss_golem','frost_dryad'],level:1100,hp:150000,atk:14500,def:9500,spd:5000,experience:50000,gold:70000,seal:true},
 heart:{name:'世界樹の残響・侵食体',species:['world_tree_guardian','frost_dryad'],level:1200,hp:380000,atk:21000,def:11000,spd:6500,experience:120000,gold:180000,boss:true}
});
const copy=x=>JSON.parse(JSON.stringify(x));
const count=x=>Math.max(0,Math.min(1e9,Math.floor(Number(x)||0)));
export function chapterTwoState(state){
 if(!chapterTwoUnlocked(state))return null;
 let p=state[CHAPTER_TWO_KEY];
 if(!p||typeof p!=='object'||Array.isArray(p))p=state[CHAPTER_TWO_KEY]={version:1,introIndex:0,introComplete:false,epilogueIndex:0,epilogueComplete:false,clears:0,serial:0,run:null};
 p.clears=count(p.clears);p.serial=count(p.serial);p.introIndex=count(p.introIndex);p.epilogueIndex=count(p.epilogueIndex);p.introComplete=p.introComplete===true;p.epilogueComplete=p.epilogueComplete===true;
 p.areaClears378??={};p.areaClears378[0]=Math.max(count(p.areaClears378[0]),p.clears);p.runs378??={};p.stories378??={};p.challengeClears378??={};
 if(p.run&&(!Number.isInteger(p.run.room)||!ROOMS[p.run.room]||!Number.isInteger(p.run.serial)))p.run=null;
 if(p.run){const r=p.run;r.area=CHAPTER_TWO_AREAS[r.area]?r.area:0;const area=chapterTwoArea(r);
  r.defeated=[...new Set((Array.isArray(r.defeated)?r.defeated:[]).filter(id=>area.keys.includes(id)))];r.visited=[...new Set([0,r.room,...(Array.isArray(r.visited)?r.visited:[])].filter(id=>ROOMS[id]))];r.completed=r.defeated.includes(area.keys[3]);
  if(r.pending&&(!area.keys.includes(r.pending.encounter)||r.pending.token!==`forest:${r.serial}:${r.pending.encounter}`||!Array.isArray(r.pending.partyIds)))r.pending=null;
  if(r.geometryVersion!==377||!Number.isInteger(r.position?.x)||!Number.isInteger(r.position?.y)){r.position=chapterTwoSpawn(r);r.geometryVersion=377;}r.startedAt??=Date.now();p.runs378[r.area]=r;
 }

 return p;
}
export function chapterTwoAreaUnlocked(state,area=0){const p=chapterTwoState(state);return !!p&&!!CHAPTER_TWO_AREAS[area]&&(area===0||count(p.areaClears378[area-1])>0);}
export function selectChapterTwoArea(state,area){const p=chapterTwoState(state);if(!p||!chapterTwoAreaUnlocked(state,area)||p.run?.pending||state.activeBattle||state.player?.inRun)return{ok:false};if(p.runs378[area]){p.run=p.runs378[area];chapterTwoState(state);return{ok:true,run:p.run}}return beginChapterTwoRun(state,{area});}
export function beginChapterTwoRun(state,{area=0,challenge=false}={}){
 const p=chapterTwoState(state);if(!p?.introComplete||!chapterTwoAreaUnlocked(state,area)||state.player?.inRun||state.activeBattle||p.run?.pending||!(state.party??[]).some(id=>state.monsters?.some(m=>m.id===id))||challenge&&!p.endingComplete378)return{ok:false};
 p.serial++;p.run={area,challenge,challengeTier:challenge?Math.min(5,1+count(p.challengeClears378[area])):0,serial:p.serial,room:0,visited:[0],defeated:[],chest:false,pending:null,completed:false,geometryVersion:377,startedAt:Date.now()};p.run.position=chapterTwoSpawn(p.run);p.runs378[area]=p.run;p.dungeonHint377=false;return{ok:true,run:p.run};
}
export function moveChapterTwoRoom(state,direction){
 const p=chapterTwoState(state),r=p?.run;if(!r||r.pending)return{ok:false};
 const next=chapterTwoRooms(r)[r.room].links[direction];if(next==null)return{ok:false};
 if(next===5&&!chapterTwoArea(r).keys.slice(1,3).every(id=>r.defeated.includes(id)))return{ok:false,message:`${chapterTwoArea(r).gate}を2つ揃えると、この通路が開きます。`};
 const portal=chapterTwoPortal(r,direction);if(!portal)return{ok:false};r.room=next;r.position={x:portal.arrivalX,y:portal.arrivalY};
 if(!r.visited.includes(next))r.visited.push(next);return{ok:true};
}
export function beginChapterTwoEncounter(state,id){
 const p=chapterTwoState(state),r=p?.run;
 if(r&&id===chapterTwoArea(r).keys[3]&&!chapterTwoArea(r).keys.slice(1,3).every(key=>r.defeated.includes(key)))return{ok:false};
 if(!r||r.completed||!ENCOUNTERS[id]||chapterTwoRooms(r)[r.room].encounter!==id||r.defeated.includes(id))return{ok:false};
 if(r.pending&&r.pending.encounter!==id)return{ok:false};
 r.pending??={token:`forest:${r.serial}:${id}`,encounter:id,partyIds:[...new Set(state.party??[])].slice(0,4)};
 return{ok:true,...copy(r.pending)};
}
function currency(state,key,amount){state.player??={};const before=Math.max(0,Number(state.player[key])||0);state.player[key]=Math.min(Number.MAX_SAFE_INTEGER,before+amount);return state.player[key]-before;}
// Progress and rewards are changed together; caller saves them in one transaction.
export function settleChapterTwoEncounter(state,token,{won=false}={}){
 const p=chapterTwoState(state),r=p?.run,attempt=r?.pending;
 if(!attempt||attempt.token!==token||chapterTwoRooms(r)[r.room].encounter!==attempt.encounter)return{ok:false,duplicate:true};
 const encounter=ENCOUNTERS[attempt.encounter];r.pending=null;
 if(!won)return{ok:true,won:false};
 if(r.defeated.includes(attempt.encounter))return{ok:false,duplicate:true};
 r.defeated.push(attempt.encounter);
 const area=chapterTwoArea(r),firstClear=Boolean(encounter.boss&&!p.areaClears378[area.id]),multiplier=r.challenge?1+(r.challengeTier??1)*.5:1;
 const experience=Math.floor((encounter.experience+(firstClear?180000*(area.id+1):0))*multiplier),members=[];
 for(const id of attempt.partyIds){const m=state.monsters?.find(m=>m.id===id);if(!m)continue;const before=m.level;applyTotalExperience(m,Math.min(Number.MAX_SAFE_INTEGER,totalExperience(m)+experience));members.push({id,before,after:m.level});}
 const gold=currency(state,'gold',Math.floor(encounter.gold*multiplier)),crystals=firstClear?currency(state,'crystals',300*(area.id+1)):0;
 const experiencePacks=(area.id>0||r.challenge)?Math.floor((encounter.boss?30:10)*(area.id+1)*multiplier):0;
 if(experiencePacks){state.inventory??={};state.inventory.experienceItemsUltra=count(state.inventory.experienceItemsUltra)+experiencePacks;}
 let equipment=null;
 if(encounter.boss){p.areaClears378[area.id]=count(p.areaClears378[area.id])+1;if(area.id===0)p.clears=p.areaClears378[0];r.completed=true;p.dungeonHint377=true;
  if(r.challenge)p.challengeClears378[area.id]=count(p.challengeClears378[area.id])+1;
  if(area.id>0||r.challenge){const slot=['accessory','weapon','armor','accessory','weapon'][area.id],base=EQUIPMENT_BASES[slot][(area.id*7)%EQUIPMENT_BASES[slot].length],item=createEquipment(slot,{rarity:'神話',base});item.name=['境界の残光','黒根断ちの刃','深淵を歩む装甲','天律の盟約','白紙の未来'][area.id];item.level=Math.round(area.level*(1+(r.challengeTier??0)*.15));item.plus=10+area.id*5+(r.challengeTier??0)*5;item.favorite=true;item.locked=true;item.obtainedMethod='chapterTwo';const receipt=receiveEquipment(state,item,{bossReward:true});equipment={name:item.name,rarity:item.rarity,level:item.level,plus:item.plus,slot,receipt:receipt.message,id:item.id};}
 }
 const result={ok:true,won:true,token,area:area.id,challenge:!!r.challenge,encounter:attempt.encounter,experience,gold,crystals,firstClear,members,equipment,experiencePacks};p.lastReward=result;return result;
}

export function openChapterTwoChest(state){const p=chapterTwoState(state),r=p?.run;if(!r||r.pending||r.room!==2||r.chest)return{ok:false};r.chest=true;return{ok:true,gold:currency(state,'gold',80000*(chapterTwoArea(r).id+1))};}
export function chapterTwoEnemyEntries(id,run=null){
 const e=ENCOUNTERS[id];if(!e)return[];
 return e.species.map((speciesId,i)=>({speciesId,endgameBossId:e.authorities?.[i]??null,faction:e.authorities?.[i]?.startsWith('ten_')?'tenGod':e.authorities?.[i]?'abyss':null,teamBattle:!!e.area,teamBattleRole:e.roles?.[i],level:Math.round(e.level*(1+(run?.challengeTier??0)*.18)),chapterTwoEncounter:id,chapterTwoIndex:i,boss:i===0&&(e.boss||e.seal)||false,nameOverride:i===0&&(e.boss||e.seal)?e.name:undefined,uncapturable:!!e.authorities?.[i]||i===0&&(e.boss||e.seal)||false,enemyLoadoutVersion:5,enemyGear:[],enemyMagicCircle:null,equipped:false,fixedTrialScaling:true,enemyFloor:100,statMultiplier:1}));
}
export function tuneChapterTwoEnemy(enemy,id,index=0,run=null){
 const e=ENCOUNTERS[id];if(!e)return;
 const support=index>0&&Boolean(e.boss||e.seal),rate=support?.55:1;
 Object.assign(enemy,{maxHp:Math.round(e.hp*rate),hp:Math.round(e.hp*rate),atk:Math.round(e.atk*rate),matk:Math.round(e.atk*(support?.8:.9)),def:Math.round(e.def*rate),mdef:Math.round(e.def*rate),spd:e.spd+(support?600:0),maxMp:1800,currentMp:1800,accuracy:110,evasion:8,hiddenCapturePressure:1,bossStatusResist:.15,bossHealRate:.08,bossPowerMultiplier:1.5});
 // The escort's existing healing AI can be focused down; no new global skill rules.
 if(support)enemy.role='healer';
 if(e.area){enemy.teamBattle=true;enemy.teamBattleRole=e.roles[index];enemy.hiddenDamageTaken=1;if(index===0)enemy.name=e.name;const factor=1+(run?.challengeTier??0)*.3;for(const key of ['maxHp','hp','atk','matk','def','mdef','spd'])enemy[key]=Math.round(enemy[key]*factor);if(e.area>=3&&index===0){enemy.heroShield348=Math.floor(enemy.maxHp*.18);enemy.heroShieldMax378=enemy.heroShield348;}}
}
export function walkable(x,y){return Number.isInteger(x)&&Number.isInteger(y)&&x>=2&&x<=16&&y>=2&&y<=16;}
export function chapterTwoWorld(run){return createChapterTwoWorld(run,chapterTwoRooms(run),ENCOUNTERS)}

export function chapterTwoObjective(run){
 const a=chapterTwoArea(run),defeated=run?.defeated??[],seals=a.keys.slice(1,3).filter(id=>defeated.includes(id)).length,rooms=a.rooms;
 if(run?.completed)return {title:`${a.name}を解放した`,detail:a.id<4?`帰還して「${CHAPTER_TWO_AREAS[a.id+1].name}」へ。ダンジョンの行き先から進めます。`:'裁定者を退けた。帰還して物語の結末へ。',seals,targetRoom:null};
 if(seals===2)return {title:run?.room===5?`${ENCOUNTERS[a.keys[3]].name}を倒す`:'最深部へ向かう',detail:`${rooms[4].name}から${rooms[5].name}へ続く道が開いています。`,seals,targetRoom:5};
 return {title:`${a.goal}【${seals}/2】`,detail:`${rooms[3].name}と${rooms[4].name}の守護者を倒そう。地図から通路を選べます。`,seals,targetRoom:defeated.includes(a.keys[1])?4:3};
}
export function chapterTwoNeedsIntroduction(state){return chapterTwoUnlocked(state)&&state.chapterTwo376?.introComplete!==true;}
export function chapterTwoDungeonHint(state){return chapterTwoUnlocked(state)&&state.chapterTwo376?.introComplete===true&&state.chapterTwo376?.dungeonHint377!==false;}
