import {applyTotalExperience,totalExperience} from '../models/Monster.js?v=3.1.56-build376';
export const CHAPTER_TWO_KEY='chapterTwo376';
const victories=new Set(['complete','narrow','all-preempted']);
export function chapterTwoUnlocked(state){
 const c=state?.campaign100??{},arena=c.heroEncounters310?.finalArena??{};
 const floor100=c.floors?.['100'];
 const passed100=floor100?.bossDefeated===true||floor100?.cleared===true||c.finalUnlocked===true||Number(state?.player?.maxFloor)>=100;
 const won=c.finalCompleted===true||(arena.completed===true&&victories.has(arena.lastEnding))||(c.reincarnation319?.history??[]).some(r=>r.victorious===true&&victories.has(r.ending));
 return Boolean(passed100&&won);
}
export const ROOMS=Object.freeze([
 {id:0,name:'境界の林道',hint:'東の倒木道から森へ。帰還しても探索状況は残る。',links:{east:1}},
 {id:1,name:'倒木の小径',hint:'北は西の封印、東は回復できる水辺。',links:{west:0,east:2,north:3},encounter:'patrol'},
 {id:2,name:'月映りの水辺',hint:'泉で全回復できる。北は東の封印。',links:{west:1,north:4},chest:true,spring:true},
 {id:3,name:'西の封印樹',hint:'守護者を倒すと封印が1つ解ける。',links:{south:1,east:4},encounter:'west'},
 {id:4,name:'東の封印樹',hint:'西と東の封印を解き、北の最深部へ。',links:{south:2,west:3,north:5},encounter:'east'},
 {id:5,name:'侵食の根源',hint:'世界樹の残響を鎮め、この森の異変を止める。',links:{south:4},encounter:'heart'}
]);
export const ENCOUNTERS=Object.freeze({
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
 if(p.run&&(!Number.isInteger(p.run.room)||!ROOMS[p.run.room]||!Number.isInteger(p.run.serial)))p.run=null;
 if(p.run){const r=p.run;r.defeated=[...new Set((Array.isArray(r.defeated)?r.defeated:[]).filter(id=>ENCOUNTERS[id]))];r.visited=[...new Set([0,r.room,...(Array.isArray(r.visited)?r.visited:[])].filter(id=>ROOMS[id]))];r.completed=r.defeated.includes('heart');if(r.pending&&(!ENCOUNTERS[r.pending.encounter]||r.pending.token!==`forest:${r.serial}:${r.pending.encounter}`||!Array.isArray(r.pending.partyIds)))r.pending=null;if(!walkable(r.position?.x,r.position?.y))r.position={x:9,y:15};}
 return p;
}
export function beginChapterTwoRun(state){
 const p=chapterTwoState(state);if(!p?.introComplete||state.player?.inRun||state.activeBattle||!(state.party??[]).some(id=>state.monsters?.some(m=>m.id===id)))return{ok:false};
 p.serial++;p.run={serial:p.serial,room:0,position:{x:9,y:15},visited:[0],defeated:[],chest:false,pending:null,completed:false};return{ok:true,run:p.run};
}
export function moveChapterTwoRoom(state,direction){
 const p=chapterTwoState(state),r=p?.run;if(!r||r.pending)return{ok:false};
 const next=ROOMS[r.room].links[direction];if(next==null)return{ok:false};
 if(next===5&&!['west','east'].every(id=>r.defeated.includes(id)))return{ok:false,message:'西と東、2つの封印樹を先に解放してください。'};
 r.room=next;r.position=copy({north:{x:9,y:15},south:{x:9,y:3},east:{x:3,y:9},west:{x:15,y:9}}[direction]);
 if(!r.visited.includes(next))r.visited.push(next);return{ok:true};
}
export function beginChapterTwoEncounter(state,id){
 const p=chapterTwoState(state),r=p?.run;
 if(id==='heart'&&r&&!['west','east'].every(key=>r.defeated.includes(key)))return{ok:false};
 if(!r||r.completed||!ENCOUNTERS[id]||ROOMS[r.room].encounter!==id||r.defeated.includes(id))return{ok:false};
 if(r.pending&&r.pending.encounter!==id)return{ok:false};
 r.pending??={token:`forest:${r.serial}:${id}`,encounter:id,partyIds:[...new Set(state.party??[])].slice(0,4)};
 return{ok:true,...copy(r.pending)};
}
function currency(state,key,amount){state.player??={};const before=Math.max(0,Number(state.player[key])||0);state.player[key]=Math.min(Number.MAX_SAFE_INTEGER,before+amount);return state.player[key]-before;}
// Progress and rewards are changed together; caller saves them in one transaction.
export function settleChapterTwoEncounter(state,token,{won=false}={}){
 const p=chapterTwoState(state),r=p?.run,attempt=r?.pending;
 if(!attempt||attempt.token!==token||ROOMS[r.room].encounter!==attempt.encounter)return{ok:false,duplicate:true};
 const encounter=ENCOUNTERS[attempt.encounter];r.pending=null;
 if(!won)return{ok:true,won:false};
 if(r.defeated.includes(attempt.encounter))return{ok:false,duplicate:true};
 r.defeated.push(attempt.encounter);
 const firstClear=Boolean(encounter.boss&&p.clears===0),experience=encounter.experience+(firstClear?180000:0),members=[];
 for(const id of attempt.partyIds){const m=state.monsters?.find(m=>m.id===id);if(!m)continue;const before=m.level;applyTotalExperience(m,Math.min(Number.MAX_SAFE_INTEGER,totalExperience(m)+experience));members.push({id,before,after:m.level});}
 const gold=currency(state,'gold',encounter.gold),crystals=firstClear?currency(state,'crystals',300):0;
 if(encounter.boss){p.clears++;r.completed=true;}
 const result={ok:true,won:true,token,encounter:attempt.encounter,experience,gold,crystals,firstClear,members};p.lastReward=result;return result;
}
export function openChapterTwoChest(state){const p=chapterTwoState(state),r=p?.run;if(!r||r.pending||r.room!==2||r.chest)return{ok:false};r.chest=true;return{ok:true,gold:currency(state,'gold',80000)};}
export function chapterTwoEnemyEntries(id){
 const e=ENCOUNTERS[id];if(!e)return[];
 return e.species.map((speciesId,i)=>({speciesId,level:e.level,chapterTwoEncounter:id,chapterTwoIndex:i,boss:i===0&&(e.boss||e.seal)||false,nameOverride:i===0&&(e.boss||e.seal)?e.name:undefined,uncapturable:i===0&&(e.boss||e.seal)||false,enemyLoadoutVersion:5,enemyGear:[],enemyMagicCircle:null,equipped:false,fixedTrialScaling:true,enemyFloor:100,statMultiplier:1}));
}
export function tuneChapterTwoEnemy(enemy,id,index=0){
 const e=ENCOUNTERS[id];if(!e)return;
 const support=index>0&&Boolean(e.boss||e.seal),rate=support?.55:1;
 Object.assign(enemy,{maxHp:Math.round(e.hp*rate),hp:Math.round(e.hp*rate),atk:Math.round(e.atk*rate),matk:Math.round(e.atk*(support?.8:.9)),def:Math.round(e.def*rate),mdef:Math.round(e.def*rate),spd:e.spd+(support?600:0),maxMp:1800,currentMp:1800,accuracy:110,evasion:8,hiddenCapturePressure:1,bossStatusResist:.15,bossHealRate:.08,bossPowerMultiplier:1.5});
 // The escort's existing healing AI can be focused down; no new global skill rules.
 if(support)enemy.role='healer';
}
export function walkable(x,y){return Number.isInteger(x)&&Number.isInteger(y)&&x>=2&&x<=16&&y>=2&&y<=16;}
export function chapterTwoWorld(){return{cols:19,rows:19,tiles:Array.from({length:19},(_,y)=>Array.from({length:19},(_,x)=>walkable(x,y)?0:1)),sections:[],start:{x:9,y:15},enemies:[],chests:[],decorations:[],rooms:[],bossDefeated:false,currentAttribute:'nature'};}
