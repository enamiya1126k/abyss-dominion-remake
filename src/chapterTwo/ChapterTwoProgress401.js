import {MOTHER_STORY_ENTRIES423,motherStoryRead423} from '../primordial/Story422.js';
import {chapterTwoUnlocked,chapterTwoObjective} from './ChapterTwoSystem.js?v=3.1.82-build402';
import {CHAPTER_TWO_AREAS} from './ChapterTwoContent.js?v=3.1.58-build378';

// Read existing chapter-two receipts only. Rendering must never normalize a save.
export const CHAPTER_TWO_STORIES401=Object.freeze([
 {kind:'intro',area:0,title:'理の外に生きる者たち',subtitle:'序章・魔王と勇者の共闘'},
 {kind:'epilogue',area:0,title:'境界の森、解放',subtitle:'境界の森・結末'},
 ...CHAPTER_TWO_AREAS.slice(1).flatMap(a=>[
  {kind:`area${a.id}-intro`,area:a.id,title:a.subtitle,subtitle:`${a.name}・開幕`},
  {kind:`area${a.id}-outro`,area:a.id,title:`${a.name}の先へ`,subtitle:`${a.name}・結末`}
 ]),
 {kind:'ending',area:4,title:'筋書きのない明日',subtitle:'第二章・エンディング'}
].map(Object.freeze));

export function chapterTwoStarted401(state){
 return chapterTwoUnlocked(state)&&state?.chapterTwo376?.introComplete===true;
}
export function chapterTwoStoryRead401(state,kind){
 if(!chapterTwoStarted401(state))return false;
 const p=state.chapterTwo376;
 if(kind==='intro')return true;
 if(kind==='epilogue')return p.epilogueComplete===true;
 if(kind==='ending')return p.endingComplete378===true||p.stories378?.ending?.complete===true;
 return CHAPTER_TWO_STORIES401.some(s=>s.kind===kind)&&p.stories378?.[kind]?.complete===true;
}
const count=value=>Math.max(0,Math.floor(Number(value)||0));
function readRun(p,area){
 const source=p.run&&(p.run.area??0)===area?p.run:p.runs378?.[area];
 if(!source||typeof source!=='object')return null;
 const a=CHAPTER_TWO_AREAS[area],defeated=Array.isArray(source.defeated)?[...source.defeated]:[];
 return {area,room:Number.isInteger(source.room)?source.room:0,eliteTier393:source.eliteTier393,defeated,completed:defeated.includes(a.keys[3]),
  keys380:Array.isArray(source.keys380)?[...source.keys380]:a.keys.slice(1,3).filter(k=>defeated.includes(k)),
  roaming380:Array.isArray(source.roaming380)?[...source.roaming380]:[],
  visited:Array.isArray(source.visited)?[...source.visited]:[]};
}
export function chapterTwoProgress401(state){
 if(!chapterTwoStarted401(state))return null;
 const p=state.chapterTwo376;
 const clears=CHAPTER_TWO_AREAS.map(a=>Math.max(count(p.areaClears378?.[a.id]),a.id===0?count(p.clears):0));
 const areas=CHAPTER_TWO_AREAS.map(a=>({id:a.id,name:a.name,skin:a.skin,level:a.level,
  unlocked:a.id===0||clears[a.id-1]>0,cleared:clears[a.id]>0,run:readRun(p,a.id)}));
 const current=p.run?areas.find(a=>a.id===(p.run.area??0)&&a.unlocked&&a.run):null;
 const eliteActive=current?.run.completed&&[1,2,3].includes(current.run.eliteTier393)&&[1,3,4].some(n=>!current.run.roaming380.includes(`roam${current.id}_${n}`));
 let target=current&&(!current.run.completed||eliteActive)?current:areas.find(a=>a.unlocked&&!a.cleared)??current??(areas.every(a=>a.cleared)?areas.at(-1):areas[0]);
 // Closing a live story midway leaves an explicit way to continue it. Archive
 // replay is separate and never completes these receipts on the player's behalf.
 const pending=CHAPTER_TWO_STORIES401.find(s=>{
  if(chapterTwoStoryRead401(state,s.kind)||s.kind==='intro')return false;
  const area=areas[s.area];if(!area.unlocked)return false;
  if(s.kind==='epilogue')return count(p.clears)>0;
  if(s.kind==='ending'||s.kind.endsWith('-outro'))return area.cleared;
  return Boolean(area.run)||area.cleared;
 });
 let action,title,detail;
 if(pending){target=areas[pending.area];action={type:'story',kind:pending.kind,label:'物語の続きを見る'};title=pending.subtitle;detail='読みかけの場面から物語を続けます。読了すると「記憶の間」に収録されます。';}
 else if(target.run&&(!target.run.completed||eliteActive&&target===current)){
  const objective=chapterTwoObjective(target.run);title=objective.title;detail=objective.detail;
  action={type:'explore',area:target.id,eliteResume:Boolean(eliteActive&&target===current),label:eliteActive&&target===current?'精鋭討伐を再開する':'探索を再開する'};
 }else if(!target.cleared){title=`${target.name}へ出発`;detail='部隊を整えて、次の地域へ。探索は保存されている地点から続けられます。';action={type:'explore',area:target.id,label:'この地域へ出発する'};}
 else {title='理の外に続く旅';detail='各地の精鋭討伐や宝物庫で仲間を鍛えよう。歩んだ物語は「記憶の間」で振り返れます。';action={type:'destinations',area:target.id,label:'再探索・精鋭討伐を選ぶ'};}
 if(!pending&&clears[4]>0&&!state.primordial422?.endingRead){title='原初の聖胎・十神の母';detail='第二章・第5節（最終戦）が解放されました。部隊を整え、十神の母へ答えを届けよう。';action={type:'destinations',area:5,label:'最終戦の行き先を見る'};}
 const motherEntries=MOTHER_STORY_ENTRIES423.filter(e=>e.kind!=='defeat'||motherStoryRead423(state,e.kind));
 const blocked=Boolean(state.activeBattle||p.run?.pending||Object.values(p.runs378??{}).some(r=>r?.pending)||state.player?.inRun);
 return {areas,area:target.id,name:target.name,skin:target.skin,title,detail,action,blocked,
  completed:chapterTwoStoryRead401(state,'ending'),cleared:areas.filter(a=>a.cleared).length,total:areas.length,
  read:CHAPTER_TWO_STORIES401.filter(s=>chapterTwoStoryRead401(state,s.kind)).length+motherEntries.filter(e=>motherStoryRead423(state,e.kind)).length,storyTotal:CHAPTER_TWO_STORIES401.length+motherEntries.length};
}
