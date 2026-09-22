import './build515-effects.test.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {QUESTIONS516,drawQuestions516,RECENT_QUESTION_LIMIT516} from '../online-server/src/quiz/Questions516.js';
import {EXTRA_QUESTIONS516} from '../online-server/src/quiz/QuestionData516.js';
import {QUESTIONS513} from '../online-server/src/quiz/Questions513.js';
import {makeQuiz513,startQuiz513,chooseQuiz513,advanceQuiz513,publicQuiz513,validDeck513} from '../src/quiz/Rules513.js';
import {handleQuiz513,advanceQuizzes513} from '../online-server/src/QuizCoordinator513.js';
const rng=seed=>{let x=seed;return n=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x%n}};
const make=()=>makeQuiz513({id:'q',code:'QUIZ16',partyId:'party',hostId:'p0',members:Array.from({length:4},(_,i)=>({playerId:'p'+i,name:'Player '+i,choice:{id:'m'+i,speciesId:'wolf'}}))});
test('600 unique questions, 30 genres, 480 additions and 96 master candidates',()=>{
 assert.equal(QUESTIONS516.length,600);assert.equal(EXTRA_QUESTIONS516.length,480);assert.equal(new Set(QUESTIONS516.map(q=>q.id)).size,600);assert.equal(new Set(QUESTIONS516.map(q=>q.text)).size,600);assert.equal(new Set(QUESTIONS516.map(q=>q.category)).size,30);assert.equal(QUESTIONS516.filter(q=>q.master).length,96);
 for(const q of QUESTIONS516){assert.ok(q.text.length>0&&q.text.length<=100);assert.ok(q.explanation.length>0&&q.explanation.length<=100);assert.equal(typeof q.answer,'boolean');assert.ok([1,2,3].includes(q.difficulty));if(q.source){assert.ok(q.source.label);assert.equal(new URL(q.source.url).protocol,'https:')}}
});
test('each new genre has balanced answers and six/six/four/four difficulty tiers',()=>{
 for(const category of new Set(EXTRA_QUESTIONS516.map(q=>q.category))){const rows=EXTRA_QUESTIONS516.filter(q=>q.category===category);assert.equal(rows.length,20);assert.equal(rows.filter(q=>q.answer).length,10);assert.deepEqual([1,2,3,4].map(t=>rows.filter(q=>(q.master?4:q.difficulty)===t).length),[6,6,4,4])}
});
test('all 600 questions are reached; 2000 complete decks respect tiers, diversity and recent 120',()=>{
 const r=rng(991),recent=[],seen=new Set();for(let run=0;run<2000;run++){const deck=drawQuestions516(r,recent);assert.ok(validDeck513(deck));assert.equal(new Set(deck.map(q=>q.category)).size,20);deck.forEach((q,i)=>{assert.equal(q.difficulty,i<6?1:i<13?2:3);assert.equal(!!q.master,i>=17);assert.ok(!recent.includes(q.id));seen.add(q.id)});recent.push(...deck.map(q=>q.id));recent.splice(0,Math.max(0,recent.length-120))}assert.equal(seen.size,600);
});
test('bounded history fallback works with exhausted easy tier and constant RNG',()=>{
 const recent=QUESTIONS516.filter(q=>q.difficulty===1).slice(0,120).map(q=>q.id);for(const r of [()=>0,n=>n-1])for(const history of [recent,QUESTIONS516.map(q=>q.id),null,[]]){const deck=drawQuestions516(r,history);assert.ok(validDeck513(deck));assert.equal(deck.filter(q=>q.master).length,3)}assert.equal(RECENT_QUESTION_LIMIT516,120);
});
test('deck and source mutations never change the shared question bank or another room',()=>{
 const a=drawQuestions516(()=>0),b=drawQuestions516(()=>0),q=QUESTIONS516.find(q=>q.id===a[0].id),original=structuredClone(q);a[0].text='changed';if(a[0].source)a[0].source.label='changed';assert.deepEqual(q,original);assert.notEqual(b[0].text,a[0].text);assert.ok(Object.isFrozen(QUESTIONS516));assert.ok(QUESTIONS516.every(q=>Object.isFrozen(q)&&(!q.source||Object.isFrozen(q.source))));assert.deepEqual(QUESTIONS516.slice(0,120),QUESTIONS513);
});
test('every new question works through real walking, lock, reveal and source publication',()=>{
 for(const q of EXTRA_QUESTIONS516){const deck=[q,...QUESTIONS516.filter(x=>x.id!==q.id).slice(0,19)],g=make();startQuiz513(g,1000,deck,rng(7));advanceQuiz513(g,g.nextAt);const side=q.answer?'o':'x';for(const p of g.players)chooseQuiz513(g,p.playerId,side,1,1,g.phaseAt+100);const before=publicQuiz513(g,'p0');assert.deepEqual(Object.keys(before.question).sort(),['category','id','text']);assert.equal(before.deck513,undefined);assert.equal(before.question.answer,undefined);assert.equal(before.question.source,undefined);assert.equal(before.question.master,undefined);advanceQuiz513(g,g.deadline);advanceQuiz513(g,g.nextAt);assert.ok(g.players.every(p=>p.alive));assert.equal(g.reveal.answer,side);assert.equal(g.reveal.explanation,q.explanation);assert.deepEqual(publicQuiz513(g,'p0').reveal.source,q.source)}
});
test('production coordinator starts the new deck and retains a bounded history through 20 floors',()=>{
 const g=make(),p={id:'party',hostId:'p0',members:g.members.map(m=>({...m,ready:true,quizVersion514:1})),recentQuestionIds513:QUESTIONS516.slice(0,120).map(q=>q.id)};let now=1000,broadcasts=0;
 const c={data:{parties462:{party:p},quizRooms513:{QUIZ16:g}},now:()=>now,sessions:new Map(g.members.map(m=>[m.playerId,{connected:true}])),isBusy:()=>false,transaction:f=>f(),broadcast:()=>broadcasts++};
 assert.equal(handleQuiz513(c,{playerId:'p0'},{op:'quiz513',gameId:g.id,kind:'start',quizVersion514:1}),true);assert.equal(g.deck513.filter(q=>q.master).length,3);assert.ok(g.deck513.some(q=>q.id.startsWith('q516-')));
 now=g.nextAt;advanceQuizzes513(c);
 for(let round=1;round<=20;round++){const answer=g.deck513[round-1].answer?'o':'x';for(const seat of g.players)chooseQuiz513(g,seat.playerId,answer,round,1,g.phaseAt+100);now=g.deadline;advanceQuizzes513(c);now=g.nextAt;advanceQuizzes513(c);assert.equal(p.recentQuestionIds513.length,120);assert.equal(p.recentQuestionIds513.at(-1),g.reveal.id);now=g.nextAt;advanceQuizzes513(c)}
 assert.equal(g.phase,'result');assert.equal(g.outcome,'survived');assert.ok(g.results.every(p=>p.correct===20));assert.equal(g.deck513,undefined);assert.ok(broadcasts>=61);
});
test('question bank stays out of browser source and offline asset list; no fetch in sampler',()=>{
 const sampler=readFileSync(new URL('../online-server/src/quiz/Questions516.js',import.meta.url),'utf8');assert.ok(!/fetch\(|setInterval\(|setTimeout\(/.test(sampler));const assets=readFileSync(new URL('../world-raid-offline515-assets.json',import.meta.url),'utf8');assert.ok(!assets.includes('Questions516'));assert.ok(!assets.includes('QuestionData516'));
});
test('master flag and all other players future questions never enter the public payload',()=>{
 const g=make();startQuiz513(g,1000,drawQuestions516(rng(21)),rng(2));advanceQuiz513(g,g.nextAt);const json=JSON.stringify(publicQuiz513(g,'p0'));assert.ok(!json.includes('master'));assert.ok(!json.includes('botPlan513'));for(const q of g.deck513.slice(1))assert.ok(!json.includes(q.id));assert.ok(Buffer.byteLength(json)<7000);
});
