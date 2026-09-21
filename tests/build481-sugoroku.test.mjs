import test from 'node:test';
import assert from 'node:assert/strict';
import {duration465,schedule465} from '../src/sugoroku/Pacing465.js';
import {makeLobby463,start463} from '../src/sugoroku/Engine463.js';
import {advanceSugoroku463,handleSugoroku463} from '../online-server/src/SugorokuCoordinator463.js';
import {presentationAfter464} from '../src/sugoroku/Presentation464.js';

test('every presentation receives 1.5 times its Build480 reading budget',()=>{
 const cases=[
  [{kind:'draw'},3400],[{kind:'draw',readable470:false},1650],
  [{kind:'specialDraw470'},3400],[{kind:'awaken'},2200],
  [{kind:'card'},1400],[{kind:'card',activation466:'instant'},1600],
  [{kind:'defense469'},1700],[{kind:'dice'},2200],[{kind:'effect'},1000],
  [{kind:'arrival472'},1400],[{kind:'crystal477'},1800],[{kind:'crystal474'},1200],
  [{kind:'series468'},2200],
  ...[[1,500],[6,1470],[18,3230],[30,3720]].map(([steps,ms])=>[{kind:'move',path465:Array.from({length:steps+1},(_,i)=>String(i))},ms])
 ];
 for(const [event,before]of cases)assert.equal(duration465(event),before*1.5,JSON.stringify(event));
});

test('mixed human, AI, dark, defense and special events keep one clock and a full choice window',()=>{
 const old={id:1,kind:'effect',startAt465:50,duration465:1000};
 const g={players:[{playerId:'human'},{playerId:'bot',ai:true}],presentation464:[old,
  {id:2,kind:'draw',actorId:'human'},{id:3,kind:'draw',actorId:'bot'},
  {id:4,kind:'card',activation466:'instant'},{id:5,kind:'defense469'},
  {id:6,kind:'specialDraw470'},{id:7,kind:'awaken'}]};
 schedule465(g,10000,1);
 let end=10100;
 for(const event of g.presentation464.slice(1)){assert.equal(event.startAt465,end);end+=event.duration465;}
 assert.equal(g.presentation464[1].duration465,5100);
 assert.equal(g.presentation464[2].duration465,2475);
 assert.equal(g.presentationUntil465,end);
 assert.equal(g.nextAutoAt,end+350);
 assert.equal(g.deadline,end+45000);
 assert.deepEqual(old,{id:1,kind:'effect',startAt465:50,duration465:1000});
});

test('AI and player commands cannot overtake the extended special-card presentation',()=>{
 const g=makeLobby463({id:'sg481',code:'ABCDEF',partyId:'party',hostId:'p0',members:[{playerId:'p0',name:'P0'}],seed:3});
 start463(g,1000);g.turn=1;g.step='draw';g.presentation464=[{id:1,kind:'specialDraw470'}];g.presentationSequence464=1;schedule465(g,2000,0);
 let now=5401;const c={data:{boardRooms463:{ABCDEF:g},parties462:{party:{id:'party',members:g.members}},accounts:{}},sessions:new Map([['p0',{connected:true}]]),now:()=>now,transaction:fn=>fn(),broadcast(){}};
 const snapshot=JSON.stringify(g);
 for(now of [5401,g.presentationUntil465-1,g.nextAutoAt-1]){advanceSugoroku463(c);assert.equal(JSON.stringify(g),snapshot);}
 now=g.presentationUntil465-1;
 assert.throws(()=>handleSugoroku463(c,{playerId:'p0'},{op:'sg463',rulesVersion:18,gameId:g.id,revision:g.revision,requestId:'reading-481',kind:'draw'}),/演出/);
 assert.equal(JSON.stringify(g),snapshot);
 now=g.nextAutoAt;advanceSugoroku463(c);
 assert.ok(g.presentationSequence464>1,'AI resumes once the longer presentation and normal gap finish');
});

test('client rerenders retain elapsed time and finish at the authoritative duration, including replay',t=>{
 let clock=1000,seq=0;const frames=new Map(),previous={requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame};
 t.mock.method(performance,'now',()=>clock);
 globalThis.requestAnimationFrame=fn=>{frames.set(++seq,fn);return seq};globalThis.cancelAnimationFrame=id=>frames.delete(id);
 t.after(()=>{for(const [key,value]of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}});
 for(const ms of [1500,1000]){
  const props=new Map(),classes={toggle(){},remove(){}},layer={clientHeight:230,clientWidth:390,classList:classes,style:{setProperty:(k,v)=>props.set(k,v)},dataset:{},removeAttribute(){}};
  const event={id:1,kind:'effect',duration465:ms},g={id:'clock-'+ms,players:[],hand:[],presentationSequence464:1,presentation464:[],step:'pre'},f={gameId:g.id,seen:1,queue:[event],active:null,positions:{},visual466:{players:[],hand:[]},seriesHand468:[],recent470:[],reduced:true};
  const c={state:{sugoroku:g},sgFX464:f,transport:{selfId:'p0'},connected:()=>true,render(){},root:{querySelector:s=>s==='.sg-presentation464'?layer:s==='.sg-game'?{classList:classes}:null,querySelectorAll:()=>[]}};
  presentationAfter464(c,()=>'',()=>'',()=>{});
  assert.equal(props.get('--event-duration469'),ms+'ms');
  assert.equal(props.get('--fx-scale481'),String(ms/1000));
  const started=f.active.start;clock+=400;presentationAfter464(c,()=>'',()=>'',()=>{});
  assert.equal(f.active.start,started);assert.equal(props.get('--fx-age'),'-400ms');
  const run=()=>{const pending=[...frames.values()];frames.clear();for(const frame of pending)frame()};
  clock=started+ms-1;run();assert.ok(f.active);
  clock++;run();assert.equal(f.active,null);assert.equal(frames.size,0);
 }
});
