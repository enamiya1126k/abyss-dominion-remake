import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import vm from 'node:vm';
import {normalizePowerRankingSnapshot,normalizePowerRankingProfile} from '../src/online/OnlinePartyClient.js';
import {PlayerPowerRanking,verifiedMonsterPower} from '../online-server/src/PlayerPowerRanking.js';
const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const stats={hp:1000,atk:100,matk:80,def:60,mdef:50,spd:30,crit:10,evasion:5};
const power=verifiedMonsterPower(stats);
function snapshot(){
 const equipment=Array.from({length:6},(_,i)=>({id:i+1,slot:i<2?'weapon':i<4?'accessory':'armor',name:`装備${i}`,rarity:'SR',level:10,plus:2}));
 const monster={id:'m1',speciesId:'slime',name:'リオネル',level:10,equipment:Object.fromEntries(equipment.map((e,i)=>[`slot${i}`,String(e.id)]))};
 const context={save:{state:{equipment,party:['m1'],monsters:[monster],player:{maxFloor:10}}},SPECIES:{},calculatedStats:()=>stats,equippedMagicCircle:()=>({name:'守護',level:3}),equipmentDisplayRarity:e=>e.rarity,displayName:m=>m.name,monsterVisibleRarity:()=> 'SR',monsterCombatPower:()=>power,partyCombatPower:()=>power,powerRankingDisplayName:()=> '公開者'};
 const code=main.slice(main.indexOf('function powerRankingPublicSnapshot(){'),main.indexOf('function powerRankingSnapshotSignature('));
 vm.createContext(context);vm.runInContext(code,context);
 return {context,get:()=>JSON.parse(JSON.stringify(context.powerRankingPublicSnapshot()))};
}
test('six equipment slots survive publishing, another viewer, and server restart',()=>{
 const dir=mkdtempSync(join(tmpdir(),'abyss371-'));try{
  const stateFile=join(dir,'ranking.json'),now=()=>1800000000000;
  let server=new PlayerPowerRanking({stateFile,now});
  const owner={playerId:'AD-ABCD-EFGH'},viewer={playerId:'AD-JKLM-NPQR'};
  const source=normalizePowerRankingSnapshot(snapshot().get());
  assert.equal(source.party[0].equipment.length,6);
  assert.equal(source.party[0].equipmentStatus,'complete');
  assert.equal(server.submit(owner,{requestId:'publish_371a',snapshot:source}).ok,true);
  for(let i=0;i<2;i++){
   const result=server.profile(viewer,{playerId:owner.playerId,requestId:`profile_371${i}`});assert.equal(result.ok,true);
   const profile=normalizePowerRankingProfile(result.message.profile);
   assert.equal(profile.party[0].equipment.length,6);assert.equal(profile.party[0].equipment[5].name,'装備5');assert.equal(profile.party[0].equipmentStatus,'complete');assert.equal(profile.party[0].magicCircle.name,'守護');
   server=new PlayerPowerRanking({stateFile,now});
  }
 }finally{rmSync(dir,{recursive:true,force:true})}
});
test('missing references, empty loadouts, and legacy records stay distinct',()=>{
 const fixture=snapshot();fixture.context.save.state.equipment.pop();assert.equal(fixture.get().party[0].equipmentStatus,'partial');
 fixture.context.save.state.monsters[0].equipment={weaponRight:null};assert.equal(fixture.get().party[0].equipmentStatus,'complete');assert.equal(fixture.get().party[0].equipment.length,0);
 const legacy=fixture.get();delete legacy.party[0].equipmentStatus;
 const server=new PlayerPowerRanking();const owner={playerId:'AD-ABCD-EFGH'};
 assert.equal(server.submit(owner,{requestId:'legacy_371a',snapshot:normalizePowerRankingSnapshot(legacy)}).ok,true);
 const p=server.profile({playerId:'AD-JKLM-NPQR'},{playerId:owner.playerId}).message.profile;
 assert.equal(normalizePowerRankingProfile(p).party[0].equipmentStatus,'unknown');
});
test('continuous edits cannot postpone pending publication indefinitely',()=>{
 let queued,delay,calls=0;
 const ctx={powerRankingPublishTimer:null,powerRankingLastSignature:'old',powerRankingScheduledSignature:'',powerRankingSnapshotSignature:()=>String(++calls),clearTimeout:()=>{throw Error('must not cancel an existing pending publication')},setTimeout:(fn,ms)=>{queued=fn;delay=ms;return 1},publishPowerRankingSnapshot:()=>{ctx.published=true}};
 ctx.clearTimeout=timer=>{assert.equal(timer,null)};
 vm.createContext(ctx);vm.runInContext(main.slice(main.indexOf('function schedulePowerRankingPublish('),main.indexOf('function ensurePowerRankingConnection(')),ctx);
 ctx.schedulePowerRankingPublish();const first=queued;for(let i=0;i<20;i++)ctx.schedulePowerRankingPublish();assert.equal(queued,first);assert.equal(delay,30000);queued();assert.equal(ctx.published,true);
});
test('public UI shows received gear and distinguishes legacy missing data from an empty loadout',()=>{
 const body={innerHTML:'',querySelector:()=>null},modal={querySelector:()=>body,dataset:{playerId:'AD-JKLM-NPQR'}};
 const ctx={clearTimeout:()=>{},powerRankingUi:{loadingProfile:false},onlinePartyController:{selfId:'AD-ABCD-EFGH'},SPECIES:{},monsterVisual:()=>'',formatCombatPower:String,escapeAttribute:String,pixelIcon:()=>'',rankingPresenceMarkup:()=>'',schedulePowerRankingPresenceRefresh:()=>{},rankingEquipmentMarkup:item=>`<li>${item.name}</li>`};
 vm.createContext(ctx);vm.runInContext(main.slice(main.indexOf('function renderPowerRankingProfileModal('),main.indexOf('function openPowerRankingProfile(')),ctx);
 const profile={playerId:'AD-JKLM-NPQR',party:[{name:'相手の魔物',equipment:[],equipmentStatus:'unknown'}]};
 ctx.renderPowerRankingProfileModal(modal,profile);assert.match(body.innerHTML,/装備情報の更新待ち/);assert.match(body.innerHTML,/data-power-profile-refresh/);
 profile.party[0].equipmentStatus='complete';ctx.renderPowerRankingProfileModal(modal,profile);assert.match(body.innerHTML,/装備しているアイテムはありません/);
 profile.party[0].equipment=[{name:'相手の剣'}];ctx.renderPowerRankingProfileModal(modal,profile);assert.match(body.innerHTML,/相手の剣/);assert.doesNotMatch(body.innerHTML,/装備情報の更新待ち/);
});
