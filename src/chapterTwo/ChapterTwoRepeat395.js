import {beginChapterTwoElite393} from './ChapterTwoSystem.js?v=3.1.82-build402';
import {chapterTwoEliteTier393} from './ChapterTwoElite393.js';
export function chapterTwoRepeatTicket395(state){
 const r=state.chapterTwo376?.run,tier=chapterTwoEliteTier393(r);if(!tier||r.pending||![1,3,4].every(room=>r.roaming380?.includes(`roam${r.area}_${room}`)))return null;
 return{area:r.area,tier,serial:r.serial,visit:r.visit380};
}
export function repeatChapterTwoElite395(state,ticket){
 const fresh=chapterTwoRepeatTicket395(state);
 if(!ticket||!fresh||['area','tier','serial','visit'].some(k=>fresh[k]!==ticket[k]))return{ok:false,message:'探索状況が更新されました。行き先から選び直してください。'};
 if(!(state.party??[]).some(id=>state.monsters?.some(m=>m.id===id&&m.currentHp>0)))return{ok:false,message:'部隊を回復してから再挑戦してください。'};
 // Detach the finished field's run object so its dispose callback cannot overwrite the new spawn.
 const p=state.chapterTwo376,old=p.run,copy=JSON.parse(JSON.stringify(old));p.run=copy;p.runs378[ticket.area]=copy;
 const result=beginChapterTwoElite393(state,ticket.area,ticket.tier);if(!result.ok){p.run=old;p.runs378[ticket.area]=old;}return result;
}
