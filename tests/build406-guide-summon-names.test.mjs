import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {CHAPTER_TWO_PAIR_NAMES406,chapterTwoPairMember406,chapterTwoPairDisplayName406,chapterTwoPairEditableName406,applyChapterTwoPairName406,normalizeChapterTwoPairNicknames406} from '../src/data/chapterTwoPairNames406.js';
import {SPECIES} from '../src/data/species.js';
import {createMonster,displayName,rankName,calculatedStats} from '../src/models/Monster.js';
import {RESONANCE_PAIRS385} from '../src/battle/TwinResonance385.js';
import {twinStatus385,twinCodex385} from '../src/ui/TwinStatus385.js';
import {chapterTwoGachaBody397,chapterTwoGachaRates397} from '../src/ui/ChapterTwoGacha397.js';
import {chapterTwoHelp} from '../src/chapterTwo/ChapterTwoScreen.js';
import {CHAPTER_TWO_AREAS} from '../src/chapterTwo/ChapterTwoSystem.js';
import {chapterTwoNativeHint383} from '../src/chapterTwo/ChapterTwoMonsters383.js';
import {MonsterDetailScreen} from '../src/ui/screens/MonsterDetailScreen.js';
import {MonsterListScreen} from '../src/ui/screens/MonsterListScreen.js';
import {BattleScreen} from '../src/ui/screens/BattleScreen.js';
import {SaveService} from '../src/services/SaveService.js';
import {APP_VERSION,SAVE_SCHEMA_VERSION} from '../src/core/config.js';

const root=new URL('../',import.meta.url),read=file=>fs.readFileSync(new URL(file,root),'utf8');
const main=read('src/main.js'),extract=(a,b)=>main.slice(main.indexOf(a),main.indexOf(b,main.indexOf(a)));
const members=CHAPTER_TWO_PAIR_NAMES406.flatMap(p=>p.members);
function fixture(){
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
 const save=new SaveService();save.state.player.maxFloor=100;save.state.campaign100.finalCompleted=true;save.state.player.crystals=1000;return save;
}

test('24 unique common names identify exactly the existing 24 pairs and 48 of 70 natives',()=>{
 assert.equal(CHAPTER_TWO_PAIR_NAMES406.length,24);assert.equal(members.length,48);
 assert.equal(new Set(CHAPTER_TWO_PAIR_NAMES406.map(p=>p.group)).size,24);
 assert.equal(new Set(members.map(m=>m.id)).size,48);
 for(const pair of RESONANCE_PAIRS385){
  const names=CHAPTER_TWO_PAIR_NAMES406.find(p=>p.id===pair.id);assert.ok(names,pair.id);
  assert.deepEqual(names.members.map(m=>m.id),pair.members);
  for(const m of names.members){assert.equal(SPECIES[m.id].name,m.name);assert.equal(chapterTwoPairMember406(m.id).partner.id,pair.members.find(id=>id!==m.id));}
 }
 assert.equal(Object.values(SPECIES).filter(s=>s.chapterTwoOnly).length,70);
 assert.equal(Object.values(SPECIES).filter(s=>s.chapterTwoOnly&&!chapterTwoPairMember406(s)).length,22);
});

test('the naming adapter changes only presentation fields and leaves non-pairs untouched',()=>{
 for(const member of members){
  const original={...SPECIES[member.id],name:member.legacyName,rankNames:[member.legacyName,`${member.legacyName} II`]};
  delete original.pairGroup406;delete original.pairPartnerId406;
  const before=structuredClone(original),result=applyChapterTwoPairName406(original);
  assert.deepEqual(original,before);
  for(const key of Object.keys(original).filter(k=>!['name','rankNames','legacyName'].includes(k)))assert.deepEqual(result[key],original[key]);
  assert.deepEqual(result.rankNames,[member.name,`${member.name} II`]);
 }
 for(const species of Object.values(SPECIES).filter(s=>!chapterTwoPairMember406(s)))assert.equal(applyChapterTwoPairName406(species),species);
});

test('legacy defaults, new summons, rank names and 12-character custom nicknames share one prefix',()=>{
 for(const member of members){
  const monster=createMonster(member.id);assert.equal(displayName(monster),member.name);assert.ok(rankName(monster).includes(member.name));
  for(const nickname of ['',member.legacyName,member.short,member.name]){monster.nickname=nickname;assert.equal(displayName(monster),member.name);assert.equal(chapterTwoPairEditableName406(monster),member.short);}
  const custom='あいうえおかきくけこさし';monster.nickname=custom;
  const label=displayName(monster);assert.equal(label,`【${chapterTwoPairMember406(member.id).group}】${custom}`);
  assert.equal(chapterTwoPairEditableName406(monster),custom);
  monster.nickname=label;assert.equal(displayName(monster),label);assert.equal(chapterTwoPairEditableName406(monster),custom);
 }
 assert.equal(chapterTwoPairDisplayName406('slime','ぷるん'),'ぷるん');
});

test('migration replaces only exact old automatic names and never edits custom names or combat data',()=>{
 const state={monsters:members.map((m,i)=>({id:`owned${i}`,speciesId:m.id,nickname:i%2?'自分の名前':m.legacyName,level:1500,exp:123,plus:10,equipment:{weapon:'my-weapon'}})),party:['owned0','owned1'],activeBattle:{turn:9,enemies:[{name:'記録を保持',hp:1}]},equipment:[{id:'my-weapon',level:3000,locked:true}]};
 const before=structuredClone(state);normalizeChapterTwoPairNicknames406(state);
 for(let i=0;i<members.length;i++){assert.equal(state.monsters[i].nickname,i%2?'自分の名前':members[i].name);state.monsters[i].nickname=before.monsters[i].nickname;}
 assert.deepEqual(state,before);
});

test('real save reload upgrades default names while preserving owned IDs, stats, equipment and party',()=>{
 const save=fixture(),member=members[0],monster=createMonster(member.id,{level:37});monster.nickname=member.legacyName;monster.favorite=true;
 const custom=createMonster(member.id,{nickname:'あいうえおかきくけこさし'});
 save.state.monsters.push(monster,custom);save.state.party=[monster.id,custom.id];
 const stats=calculatedStats(monster),equipment=structuredClone(save.state.equipment),ids=save.state.monsters.map(m=>m.id);
 assert.equal(save.save(),true);const loaded=new SaveService();
 const m=loaded.state.monsters.find(m=>m.id===monster.id),c=loaded.state.monsters.find(m=>m.id===custom.id);
 assert.equal(m.nickname,member.name);assert.equal(c.nickname,custom.nickname);
 assert.deepEqual(calculatedStats(m),stats);assert.deepEqual(loaded.state.equipment,equipment);
 assert.deepEqual(loaded.state.party,save.state.party);assert.deepEqual(loaded.state.monsters.map(m=>m.id),ids);
 assert.equal(m.favorite,true);assert.equal(loaded.state.schemaVersion,SAVE_SCHEMA_VERSION);
});

test('details and roster use common names, and the nickname editor safely round-trips custom text',()=>{
 const save=fixture(),monster=createMonster('ch2_nemesia',{nickname:'<好きな"名前>&'});save.state.monsters.push(monster);
 const details=MonsterDetailScreen(monster,save.state);
 assert.match(details,/【剣姫】/);assert.match(details,/id="nicknameInput" maxlength="12" value="&lt;好きな&quot;名前&gt;&amp;"/);
 const list=MonsterListScreen(save.state);assert.match(list,/【剣姫】/);
});

test('all five area guides omit repeated controls but retain Chapter II keys, vault and persistence guidance',()=>{
 for(const area of CHAPTER_TWO_AREAS){
  for(const mode of [{},{eliteTier393:2},{challenge:true}]){
   const html=chapterTwoHelp({area:area.id,defeated:[],keys380:[],...mode});
   assert.doesNotMatch(html,/地面をタップで移動|ドラッグで視点移動|2本指で拡大|マップボタンで地図|長押ししてスライド|宝箱はGOLD|泉は部隊の全回復/);
   for(const text of ['6区画','落ちた鍵','地域のボス','宝箱10個','記録は残ります','自動をON'])assert.ok(html.includes(text));
   if(mode.eliteTier393)assert.match(html,/精鋭再探索・段階2/);
   if(mode.challenge)assert.match(html,/強化再戦中/);
  }
 }
});

test('altar reuses the existing wallet and campaign frame and groups the four previews by pair',()=>{
 const state=fixture().state,html=chapterTwoGachaBody397(state);
 for(const className of ['gacha-v2-wallet','gacha-campaign-carousel','gacha-campaign-slide'])assert.ok(html.includes(className));
 assert.equal((html.match(/class="chapter406-featured-pair"/g)??[]).length,2);
 assert.match(html,/【剣姫】ネメシア/);assert.match(html,/【剣姫】エヴェリア/);
 assert.match(html,/【魔導姫】セフィラ/);assert.match(html,/【魔導姫】アストレル/);
 assert.match(html,/ペアでの排出保証はありません/);
 for(const count of [1,10]){
  state.player.crystals=count*100-1;assert.match(chapterTwoGachaBody397(state),new RegExp(`data-chapter397-pull="${count}" disabled`));
  state.player.crystals=count*100;assert.doesNotMatch(chapterTwoGachaBody397(state),new RegExp(`data-chapter397-pull="${count}" disabled`));
 }
});

test('rates list names all 70 natives and identifies the correct partner for each of 48 paired members',()=>{
 const html=chapterTwoGachaRates397();assert.equal((html.match(/data-summon-species406=/g)??[]).length,70);
 assert.equal((html.match(/相方：/g)??[]).length,48);
 for(const member of members){
  const row=html.match(new RegExp(`<li data-summon-species406="${member.id}">([\\s\\S]*?)</li>`))[1];
  assert.ok(row.includes(member.name));assert.ok(row.includes(chapterTwoPairMember406(member.id).partner.name));
  assert.ok(!row.includes(member.legacyName));
 }
});

test('all pair help and the compact resonance strip name the correct two characters',()=>{
 for(const pair of CHAPTER_TWO_PAIR_NAMES406){
  const roster=pair.members.map(m=>createMonster(m.id)),html=twinCodex385(roster[0]);
  for(const m of pair.members)assert.ok(html.includes(m.name));
  assert.ok(twinStatus385(roster,{compact:true}).includes(`【${pair.group}】`));
  assert.ok(twinStatus385([roster[0]],{compact:true}).includes(pair.members[1].name));
 }
 const member=members[0];assert.ok(chapterTwoNativeHint383({chapterTwoNative383:true,species:[member.id]}).includes(member.name));
});

test('resumed battles replace old enemy labels in cards, target text and turn order without rewriting saved names or turn data',()=>{
 const member=chapterTwoPairMember406('ch2_ryune'),monster=createMonster('ch2_rose',{skillLoadoutInitialized:true});monster.currentHp=100;monster.currentMp=100;monster.equippedSkills=[null,null,null,null];
 const enemy={id:'e',speciesId:member.id,name:member.legacyName,hp:100,maxHp:100,level:10};
 const battle={party:[monster],enemies:[enemy,{id:'other',speciesId:'slime',name:'スライム',hp:10,maxHp:10}],species:SPECIES,specialBattle:true,specialBattleType:'chapterTwo',turn:1,turnQueue:[{type:'ally',id:monster.id,name:SPECIES[monster.speciesId].legacyName},{type:'enemy',id:'e',name:member.legacyName}],queueIndex:0,selectedEnemyId:'e'};
 const checkpoint=()=>JSON.stringify({enemies:battle.enemies,turn:battle.turn,turnQueue:battle.turnQueue,selectedEnemyId:battle.selectedEnemyId,partyNames:battle.party.map(m=>m.nickname)});
 const before=checkpoint(),html=BattleScreen(battle,{},{});
 assert.ok(html.includes(member.name));assert.ok(!html.includes(member.legacyName));assert.ok(html.includes(`攻撃対象：${member.name}`));
 assert.equal(checkpoint(),before);assert.doesNotMatch(html,/装備6枠/);
});

test('altar help, rate-list return and close remain separate actions',()=>{
 const save=fixture(),created=[],buttons={},modal={isConnected:true,classList:{add(){}},querySelectorAll:()=>[],querySelector:s=>buttons[s]??={},remove(){this.isConnected=false;}};
 let current=modal,help=0;
 const c={save,battle:null,chapterTwoGachaUnlocked397:()=>true,chapterTwoGachaBody397,chapterTwoGachaRates397,app:{insertAdjacentHTML(){}},Modal:(title)=>{created.push(title);return '';},topModal:()=>current,bindGachaTabs397(){},openRarityGuide:()=>help++};
 vm.createContext(c);vm.runInContext(extract('function openChapterTwoGacha397(','function openGacha('),c);c.openChapterTwoGacha397();
 assert.equal(created[0],'召喚の祭壇');buttons['[data-gacha-rarity406]'].onclick();assert.equal(help,1);
 const rateButtons={};current={classList:{add(){}},querySelector:s=>rateButtons[s]??={},removed:false,remove(){this.removed=true;}};
 buttons['[data-chapter397-rates]'].onclick();assert.equal(created[1],'第二章召喚・提供割合');rateButtons['[data-modal-primary]'].onclick();assert.equal(current.removed,true);assert.equal(modal.isConnected,true);
 buttons['[data-modal-primary]'].onclick();assert.equal(modal.isConnected,false);
});

test('current entry preserves guide/name and motion module aliases',()=>{
 const html=read('index.html'),map=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
 assert.equal(SAVE_SCHEMA_VERSION,84);
 assert.ok(html.indexOf('type="importmap"')<html.indexOf('type="module"'));
 assert.ok(html.includes(`const ASSET_VERSION = "${APP_VERSION}"`));
 for(const path of ['models/Monster.js','ui/HomeSkin400.js','core/HomeSkinSystem400.js']){
  const aliases=Object.entries(map).filter(([key])=>key.split('?')[0]==='./src/'+path);
  assert.ok(aliases.length>0);assert.equal(new Set(aliases.map(([,value])=>value)).size,1);
 }
 for(const target of Object.values(map))assert.ok(fs.existsSync(new URL('../'+target.split('?')[0],import.meta.url)));
 for(const css of ['build406-chapter-guide-summon','build407-home-motion'])assert.ok(html.includes(css));
});
