import test from 'node:test';import assert from 'node:assert/strict';import{mkdtempSync,readFileSync,writeFileSync}from'node:fs';import{tmpdir}from'node:os';import{join}from'node:path';
import{expandedPower445}from'../src/core/PowerScale445.js';
import{displayPower446,displayPartyPower446}from'../src/core/PowerScale446.js';
import{displayPower447,displayPartyPower447}from'../src/core/PowerScale447.js';
import{monsterCombatPower,legacyMonsterCombatPower445,partyCombatPower,formatCombatPower,normalizeCombatPowerRecord,recordPartyCombatPower}from'../src/core/CombatPower.js';
import{createMonster,calculatedStats}from'../src/models/Monster.js';
import{PlayerPowerRanking,verifiedMonsterPower}from'../online-server/src/PlayerPowerRanking.js';
const session={playerId:'AD-ABCD-EFGH'},now=Date.parse('2026-09-15T10:00:00Z');
function snapshot(newScale=false){const monsters=[1,5,20,100].map(level=>createMonster('slime',{level}));const party=monsters.map((m,i)=>({slot:i+1,speciesId:'slime',name:'テスト',level:m.level,battleStats:calculatedStats(m),power:newScale?monsterCombatPower(m):legacyMonsterCombatPower445(m),equipment:[]}));return{displayName:'えなみ',maxFloor:100,party,power:party.reduce((s,m)=>s+m.power,0)};}
test('screenshot party is the sum of all four displayed ratings',()=>{assert.equal(displayPartyPower446([5697,5408,6060,6487].map(power=>({power}))),1405071)});
test('growth contrast increases while preserving member order',()=>{assert.equal(displayPower446(5000)/displayPower446(1000),250);let last=0;for(let p=1;p<10000;p++){assert.ok(displayPower446(p)>=last);last=displayPower446(p);assert.ok(displayPower446(p)<=expandedPower445(p));if(expandedPower445(p)>=100000)assert.equal(displayPower446(p),expandedPower445(p))}});
test('real stats are unchanged; party equals member sum',()=>{const m=createMonster('slime',{level:100}),s=calculatedStats(m),before=structuredClone(m);assert.equal(monsterCombatPower(m),displayPower446(verifiedMonsterPower(s)));assert.deepEqual(m,before);assert.equal(partyCombatPower({monsters:[m],party:[m.id]}),monsterCombatPower(m))});
test('old high scores are preserved separately, migration is idempotent',()=>{const old={scaleVersion:4,highest:23652,previous:20000,history:[{power:23652,previous:20000,delta:3652,floor:100,at:'2026-09-14T00:00:00Z'}]};const m=createMonster('slime',{level:100}),state={records:{combatPower:structuredClone(old)},monsters:[m],party:[m.id],player:{maxFloor:100}};normalizeCombatPowerRecord(state);assert.equal(state.records.combatPower.legacyRecord445.highest,23652);assert.equal(state.records.combatPower.legacyRecord445.history[0].power,23652);recordPartyCombatPower(state);assert.equal(state.records.combatPower.highest,monsterCombatPower(m));const stable=structuredClone(state.records);recordPartyCombatPower(state);assert.deepEqual(state.records,stable)});
test('both old and new clients validate, old retry identity survives restart',()=>{const dir=mkdtempSync(join(tmpdir(),'power445-')),file=join(dir,'rank.json'),rank=new PlayerPowerRanking({now:()=>now,stateFile:file});const old=snapshot(),fresh=snapshot(true),v5=snapshot();v5.party.forEach(m=>m.power=expandedPower445(m.power));v5.power=v5.party.reduce((s,m)=>s+m.power,0);assert.equal(rank.submit({...session},{requestId:'request-old-445',snapshot:old}).ok,true);const restarted=new PlayerPowerRanking({now:()=>now,stateFile:file});assert.equal(restarted.submit({...session},{requestId:'request-old-445',snapshot:old}).duplicate,true);assert.equal(restarted.submit({...session},{requestId:'request-v5-446',snapshot:v5}).ok,true);assert.equal(restarted.submit({...session},{requestId:'request-new-445',snapshot:fresh}).ok,true);const row=restarted.list({...session}).message.entries[0];assert.equal(row.power,fresh.power);assert.equal(row.powerScaleVersion,7);assert.equal(JSON.parse(readFileSync(file)).records[0].power,old.power);const profile=restarted.profile({...session},{playerId:session.playerId}).message.profile;assert.equal(profile.party.reduce((s,m)=>s+m.power,0),row.power)});
test('existing disconnected players convert from persisted member scores exactly',()=>{const dir=mkdtempSync(join(tmpdir(),'old445-')),file=join(dir,'rank.json'),rank=new PlayerPowerRanking({now:()=>now,stateFile:file});rank.submit({...session},{requestId:'request-persisted-445',snapshot:snapshot()});const data=JSON.parse(readFileSync(file));data.records[0].party.forEach((m,i)=>m.power=[5697,5408,6060,6487][i]);data.records[0].power=23652;writeFileSync(file,JSON.stringify(data));const restored=new PlayerPowerRanking({now:()=>now,stateFile:file});assert.equal(restored.list({...session}).message.entries[0].power,1405071)});
test('forged scores rejected under either scale',()=>{const rank=new PlayerPowerRanking({now:()=>now}),s=snapshot(true);s.party[0].power*=7;s.power=s.party.reduce((a,m)=>a+m.power,0);assert.equal(rank.submit({...session},{requestId:'request-bad-445',snapshot:s}).code,'POWER_MISMATCH')});
test('compact labels stay short and never expose NaN/Infinity',()=>{for(const n of [0,1,5355,324558,999999,1405071,99999999,1e8,1e12,Number.MAX_SAFE_INTEGER,Infinity,NaN]){const label=formatCombatPower(n);assert.ok(label.length<=7,label);assert.ok(!/NaN|Infinity|e\+|,/.test(label),label)}assert.equal(formatCombatPower(1405071),'140.5万');assert.equal(formatCombatPower(324558),'324558')});

test('v5 history and the older v4 archive survive the v7 migration once',()=>{
 const v4={scaleVersion:4,highest:5000,history:[{power:5000,previous:4000,floor:2}]};
 const old={scaleVersion:5,highest:40000,previous:25000,updatedAt:'2026-09-15T00:00:00Z',history:[{power:40000,previous:25000,delta:15000,floor:2,at:'2026-09-15T00:00:00Z'}],legacyRecord445:v4};
 const m=createMonster('slime',{level:5}),state={records:{combatPower:structuredClone(old)},monsters:[m],party:[m.id],player:{maxFloor:2}};
 recordPartyCombatPower(state,new Date(now));const r=state.records.combatPower;
 assert.equal(r.scaleVersion,7);assert.equal(r.highest,monsterCombatPower(m));assert.deepEqual(r.legacyRecord445,v4);assert.equal(r.legacyRecord446.highest,40000);assert.deepEqual(r.legacyRecord446.history,old.history);
 const stable=structuredClone(state.records);recordPartyCombatPower(state,new Date(now+1000));assert.deepEqual(state.records,stable);
});
test('all ranking rows and totals use the same current scale for logged-out players',()=>{
 const dir=mkdtempSync(join(tmpdir(),'rank446-')),file=join(dir,'rank.json'),rank=new PlayerPowerRanking({now:()=>now,stateFile:file});
 const a=snapshot(),b=snapshot();b.party=b.party.slice(3);b.party[0].slot=1;b.power=b.party[0].power;
 assert.equal(rank.submit({...session},{requestId:'request-rank-a-446',snapshot:a}).ok,true);
 assert.equal(rank.submit({playerId:'AD-EEEE-FFFF'},{requestId:'request-rank-b-446',snapshot:b}).ok,true);
 const restored=new PlayerPowerRanking({now:()=>now,stateFile:file}),rows=restored.list({...session}).message.entries;
 assert.equal(rows.length,2);assert.ok(rows[0].power>=rows[1].power);
 for(const row of rows){const profile=restored.profile({...session},{playerId:row.playerId}).message.profile;assert.equal(profile.party.reduce((s,m)=>s+m.power,0),row.power);assert.equal(row.powerScaleVersion,7)}
});
test('nonfinite values stay safe on the new scale',()=>{for(const value of [NaN,Infinity,-Infinity,-1,0])assert.equal(displayPower446(value),0);assert.equal(displayPower446(Number.MAX_SAFE_INTEGER),Number.MAX_SAFE_INTEGER)});

const heroes=['myth_rion','myth_yori','myth_enami','myth_hide'];
test('only the four canonical hero species get the display correction',()=>{
 for(const speciesId of heroes){const m=createMonster(speciesId,{level:6800,allowEndgameLevel:true}),before=structuredClone(m),stats=calculatedStats(m),old=displayPower446(legacyMonsterCombatPower445(m));assert.equal(monsterCombatPower(m),Math.round(old*.65));assert.deepEqual(m,before);assert.deepEqual(calculatedStats(m),stats)}
 for(const speciesId of ['slime','clockwork','water_spirit','myth_fake'])assert.equal(displayPower447(6060,{speciesId,name:'りおん',nickname:'えなみ',visualSpeciesId:'myth_rion'}),367236);
});
test('the reported Rion now rates below the reported time god',()=>{
 assert.equal(displayPower446(7143),510224);assert.equal(displayPower447(7143,{speciesId:'myth_rion'}),331646);assert.equal(displayPower447(6060,{speciesId:'clockwork',endgameBossId:'ten_time'}),367236);
 assert.equal(displayPartyPower447([{power:7143,speciesId:'myth_rion'},{power:6060,speciesId:'clockwork'}]),698882);
});
function heroSnapshot(version){
 const ms=heroes.map(speciesId=>createMonster(speciesId,{level:1000,allowEndgameLevel:true}));
 const party=ms.map((m,i)=>{const legacy=legacyMonsterCombatPower445(m);return{slot:i+1,speciesId:m.speciesId,name:m.speciesId,level:m.level,battleStats:calculatedStats(m),power:version===4?legacy:version===5?expandedPower445(legacy):version===6?displayPower446(legacy):monsterCombatPower(m),equipment:[]}});
 return{displayName:'プレイヤー名',maxFloor:100,party,power:party.reduce((s,m)=>s+m.power,0)};
}
test('hero clients v4/v5/v6/v7 validate to identical canonical persisted data',()=>{
 const dir=mkdtempSync(join(tmpdir(),'hero447-')),file=join(dir,'rank.json');let rank=new PlayerPowerRanking({now:()=>now,stateFile:file}),expected;
 for(const version of [4,5,6,7]){const packet={requestId:'hero-client-version-'+version,snapshot:heroSnapshot(version)};assert.equal(rank.submit({...session},packet).ok,true);const stored=JSON.parse(readFileSync(file)).records[0];expected??=stored;assert.deepEqual(stored,expected);rank=new PlayerPowerRanking({now:()=>now,stateFile:file});assert.equal(rank.submit({...session},packet).duplicate,true);const row=rank.list({...session}).message.entries[0],profile=rank.profile({...session},{playerId:session.playerId}).message.profile;assert.equal(row.power,heroSnapshot(7).power);assert.equal(profile.party.reduce((s,m)=>s+m.power,0),row.power);assert.equal(row.powerScaleVersion,7);assert.equal(row.displayName,'プレイヤー名')}
});
test('v6 history survives once alongside the older archives',()=>{
 const m=createMonster('myth_rion',{level:1000}),a={scaleVersion:4,highest:5000},b={scaleVersion:5,highest:30000},old={scaleVersion:6,highest:510224,previous:420812,updatedAt:'2026-09-15T00:00:00Z',history:[{power:510224,previous:420812,delta:89412,floor:100,at:'2026-09-15T00:00:00Z'}],legacyRecord445:a,legacyRecord446:b},state={records:{combatPower:structuredClone(old)},monsters:[m],party:[m.id],player:{maxFloor:100}};
 recordPartyCombatPower(state,new Date(now));const r=state.records.combatPower;assert.equal(r.scaleVersion,7);assert.equal(r.highest,monsterCombatPower(m));assert.equal(r.legacyRecord447.highest,510224);assert.deepEqual(r.legacyRecord447.history,old.history);assert.deepEqual(r.legacyRecord445,a);assert.deepEqual(r.legacyRecord446,b);const stable=structuredClone(state.records);recordPartyCombatPower(state,new Date(now+1000));assert.deepEqual(state.records,stable);
});
