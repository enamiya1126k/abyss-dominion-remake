import test from'node:test';
import assert from'node:assert/strict';
import fs from'node:fs';
import{handleParty462,partyView462,partyFor462}from'../online-server/src/PartyCoordinator462.js';
import{slotOne476,partyFloor476}from'../src/party/PartyPortrait476.js';
import{partyHub462}from'../src/party/PartyView462.js';
import{CARDS463,SPECIALS463}from'../src/sugoroku/Catalog463.js';
import{cardBody476,cardClass476,isDark476}from'../src/sugoroku/CardDesign476.js';
import{CATALOG475,catalogView475,catalogDetail475,catalogClick475,filteredCatalog475}from'../src/sugoroku/CardLibrary475.js';
import{makeLobby463,start463,public463}from'../src/sugoroku/Engine463.js';
import{sugorokuView463,art463}from'../src/sugoroku/View463.js';
import{specialCard470}from'../src/sugoroku/Readability470.js';

function rig(){
 const sessions=new Map(Array.from({length:4},(_,i)=>['p'+i,{playerId:'p'+i,connected:true}]));
 const c={data:{serial:0,rooms:{},accounts:{}},sessions,now:()=>1000,isBusy:()=>false,roomFor:()=>null,canJoin:()=>true,member:(r,id)=>r.members.find(x=>x.playerId===id),roster:a=>a.slice(0,500).filter(x=>['slime','wolf','endgame-test'].includes(x.speciesId))};
 const roster=i=>[{id:'other'+i,speciesId:'slime'},{id:'lead'+i,speciesId:'wolf'},{id:'god'+i,speciesId:'endgame-test'}];
 const send=(i,op,p={})=>handleParty462(c,sessions.get('p'+i),{op,rulesVersion:8,roster:roster(i),displayName:'人'+i,slotOne476:'lead'+i,...p});
 return{c,sessions,send,roster};
}
test('SLOT1 broadcasts per owner across join, reconnect, departure and saved party state',()=>{
 const {c,sessions,send}=rig();send(0,'partyCreate462');const p=partyFor462(c,'p0');
 for(let i=1;i<4;i++)send(i,'partyJoin462',{code:p.code});
 for(let i=0;i<4;i++){const v=partyView462(c,sessions.get('p'+i));assert.equal(v.members.length,4);assert.ok(v.members.every(x=>x.portrait476.speciesId==='wolf'));assert.ok(v.members.every(x=>!('owned'in x)&&!('slotOne476'in x)));}
 sessions.get('p1').connected=false;assert.equal(partyView462(c,sessions.get('p0')).members[1].connected,false);
 sessions.get('p1').connected=true;send(1,'partyRoster462',{slotOne476:'god1'});assert.equal(partyView462(c,sessions.get('p0')).members[1].portrait476.speciesId,'endgame-test');
 c.data=JSON.parse(JSON.stringify(c.data));assert.equal(partyView462(c,sessions.get('p2')).members[1].portrait476.speciesId,'endgame-test');
 send(1,'partyLeave462');assert.equal(partyView462(c,sessions.get('p0')).members.length,3);
});
test('SLOT1 remains distinct from chosen game pawn; invalid and removed IDs produce no false portrait',()=>{
 const {c,sessions,send}=rig();send(0,'partyCreate462',{game:'sugoroku'});const p=partyFor462(c,'p0'),r=c.data.boardRooms463[p.code];r.members[0].choice={id:'other0',speciesId:'slime'};
 assert.equal(partyView462(c,sessions.get('p0')).members[0].portrait476.speciesId,'wolf');
 send(0,'partyRoster462',{slotOne476:'lead99'});assert.equal(partyView462(c,sessions.get('p0')).members[0].portrait476,null);
 send(0,'partyRoster462',{slotOne476:null});assert.equal(partyView462(c,sessions.get('p0')).members[0].portrait476,null);
 send(0,'partyRoster462');send(0,'partyRoster462',{roster:[{id:'other0',speciesId:'slime'}],slotOne476:'lead0'});assert.equal(partyView462(c,sessions.get('p0')).members[0].portrait476,null);
 assert.equal(slotOne476({party:['second'],monsters:[{id:'first'},{id:'second'}]}).id,'second');assert.equal(slotOne476({party:[null,'first'],monsters:[{id:'first'}]}),null);
});
test('client packets send the current SLOT1 including IDs past roster position 500',()=>{
 const source=fs.readFileSync(new URL('../src/race/RaceClient451.js',import.meta.url),'utf8'),start=source.indexOf(' raw('),end=source.indexOf('\n refresh()',start),method=source.slice(start,end);
 const Client=new Function('slotOne476','availableCrystals474',`return class{${method}}`)(slotOne476,()=>2000),c=new Client(),roster=Array.from({length:600},(_,i)=>({id:'m'+i,speciesId:'slime'}));let sent;
 c.save={state:{party:['m550'],monsters:roster}};c.connected=()=>true;c.transport={capabilities:new Set(['monsterRaceV1']),_send:(type,body)=>sent=body};
 for(const op of ['partyCreate462','partyJoin462','partyRoster462']){c.raw(op,{roster});assert.equal(sent.slotOne476,'m550');assert.equal(sent.roster[0].id,'m550');assert.equal(sent.roster.length,600);assert.equal(new Set(sent.roster.map(x=>x.id)).size,600);}
 c.save.state.party=[];c.raw('partyRoster462',{roster});assert.equal(sent.slotOne476,null);
});
test('all 132 card faces keep stable IDs, original artwork and descriptions; dark and premium are explicit',()=>{
 assert.equal(CATALOG475.length,132);assert.equal(CARDS463.length,116);assert.equal(SPECIALS463.length,16);
 const before=JSON.stringify(CATALOG475);
 for(const row of CATALOG475){const c=row.card,special=row.type==='special',html=cardBody476(c,art463,{special}),cls=cardClass476(c,special);assert.ok(html.includes(row.code));assert.ok(html.includes('sg-paper476'));assert.ok(!html.includes('undefined'));if(special){assert.match(cls,/sg-premium476/);assert.match(html,/sg-seal476/)}else if(isDark476(c)){assert.match(cls,/sg-dark476/);assert.match(html,/sg-sigil476/)}else assert.ok(!cls.includes('sg-dark476'));const detail=catalogDetail475({catalog475:{tab:'all',query:'',limit:132}},row.key,art463);assert.ok(detail.includes(c.text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')));}
 assert.equal(JSON.stringify(CATALOG475),before);assert.equal(new Set(CARDS463.map(x=>x.rankIndex466)).size,9);
 for(const s of SPECIALS463)assert.match(specialCard470(s.id,art463),/sg-premium476/);
});
test('card library filters and navigation remain read-only',()=>{
 const u={scrolls:{},catalog475:{tab:'all',query:'',draft:'',limit:24}},c={render(){},raw(){throw Error('unexpected packet')},root:{querySelector(){return null}}};
 assert.equal((catalogView475(u,art463).match(/data-catalog-key=/g)??[]).length,24);
 catalogClick475(c,u,{dataset:{sgAction:'catalogTab475',tab:'special'}});assert.equal(filteredCatalog475(u).length,16);
 catalogClick475(c,u,{dataset:{sgAction:'catalogCard475',catalogKey:'special:greed'}});assert.equal(u.modal.key,'special:greed');
 catalogClick475(c,u,{dataset:{sgAction:'catalogBack475'}});assert.equal(u.modal.kind,'catalog475');
 catalogClick475(c,u,{dataset:{sgAction:'catalogTab475',tab:'all'}});u.catalog475.draft='B-116';catalogClick475(c,u,{dataset:{sgAction:'catalogSearch475'}});assert.equal(filteredCatalog475(u).length,1);
});
test('lounge portraits escape names, retain vacant seats and never substitute another owned monster',()=>{
 const c={transport:{selfId:'p0'},save:{state:{party:['b'],monsters:[{id:'a',speciesId:'wrong'},{id:'b',speciesId:'right'}]}},state:{party:{members:[{playerId:'p0',name:'<img onerror=bad>',connected:true},{playerId:'p1',name:'長いプレイヤー名',connected:false,portrait476:{speciesId:'wolf'}}]}},sgMonster463:id=>`<span data-monster="${id}"></span>`};
 const html=partyFloor476(c);assert.match(html,/data-monster="right"/);assert.ok(!html.includes('data-monster="wrong"'));assert.ok(!html.includes('<img onerror'));assert.equal((html.match(/is-empty/g)||[]).length,2);assert.match(html,/再接続待ち/);
});
test('production game view renders redesigned hand, full details and premium special',()=>{
 const g=makeLobby463({id:'qa476',code:'ABCDEF',hostId:'p0',members:[{playerId:'p0',name:'えなみ',owned:[]}],seed:88});g.members[0].choice={id:'lead',speciesId:'wolf'};start463(g,1000);
 const c={state:{sugoroku:public463(g,'p0')},root:null,transport:{selfId:'p0'},connected:()=>true,offset:0};
 const hand=sugorokuView463(c);assert.ok(hand.includes('sg-tcg476'));
 c.sgUI463.modal={kind:'card',id:'curse-goal'};assert.match(sugorokuView463(c),/sg-detail-card476[^>]*sg-dark476/);
 c.sgUI463.modal={kind:'special',id:'greed'};assert.match(sugorokuView463(c),/sg-special-card470[^>]*sg-premium476/);
});
