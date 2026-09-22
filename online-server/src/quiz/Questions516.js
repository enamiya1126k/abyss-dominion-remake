// Build516 question selection. Loaded once by the server, never by the browser.
import {QUESTIONS513} from './Questions513.js';
import {EXTRA_QUESTIONS516} from './QuestionData516.js';
export const RECENT_QUESTION_LIMIT516=120;
export const QUESTIONS516=Object.freeze([...QUESTIONS513,...EXTRA_QUESTIONS516].map(q=>Object.freeze({...q,source:q.source?Object.freeze({...q.source}):null})));
// Four server-side pools; keep the existing wire-level difficulty range (1..3).
const pools=Array.from({length:4},(_,i)=>{
 const categories=new Map();
 for(const q of QUESTIONS516){if((q.master?4:q.difficulty)!==i+1)continue;const list=categories.get(q.category)??[];list.push(q);categories.set(q.category,list)}
 return categories;
});
export function drawQuestions516(randomInt,recent=[]){
 const recentSet=new Set(Array.isArray(recent)?recent.slice(-RECENT_QUESTION_LIMIT516):[]),used=new Set(),counts=new Map(),deck=[];
 for(let round=0;round<20;round++){
  const pool=pools[round<6?0:round<13?1:round<17?2:3],available=[],fresh=[];
  for(const [category,questions] of pool){
   const all=questions.filter(q=>!used.has(q.id)),unseen=all.filter(q=>!recentSet.has(q.id));
   if(all.length)available.push({category,questions:all});
   if(unseen.length)fresh.push({category,questions:unseen});
  }
  // Prefer unseen questions. Bounded fallback also handles old/invalid history.
  let choices=fresh.length?fresh:available;
  const different=choices.filter(x=>x.category!==deck.at(-1)?.category);
  if(different.length)choices=different;
  const least=Math.min(...choices.map(x=>counts.get(x.category)??0));
  choices=choices.filter(x=>(counts.get(x.category)??0)===least);
  const group=choices[randomInt(choices.length)],q=group.questions[randomInt(group.questions.length)];
  deck.push(structuredClone(q));used.add(q.id);counts.set(q.category,(counts.get(q.category)??0)+1);
 }
 return deck;
}
