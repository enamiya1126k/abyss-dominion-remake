import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {BattleScreen} from '../src/ui/screens/BattleScreen.js';
import {SaveService} from '../src/services/SaveService.js';
import * as Circles from '../src/core/MagicCircleSystem.js';
import {isMagicCircle398} from '../src/data/magicCircles398.js';
import {isChapterTwoCircle394} from '../src/data/chapterTwoRelics394.js';
import {chapterTwoUnlocked,CHAPTER_TWO_AREAS} from '../src/chapterTwo/ChapterTwoSystem.js';
import {claimCircleResearch398} from '../src/chapterTwo/MagicCircleResearch398.js';

const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
function extract(from,to){const start=source.indexOf(from);assert.ok(start>=0);const end=source.indexOf(to,start);assert.ok(end>start);return source.slice(start,end);}
function saveFixture(){
  const memory=new Map();
  globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
  return new SaveService();
}
function skillFixture(){
  const actor=saveFixture().state.monsters[0];actor.currentHp=100;actor.currentMp=10000;
  const skills=Array.from({length:12},(_,i)=>({id:`skill-${i}`,name:`スキル${i}`,description:'対象へ攻撃。追加効果の長い説明。',target:'敵全体',element:'fire',onlineMpCost:5}));
  const battle={party:[actor],enemies:[{id:'enemy',name:'敵',hp:100,maxHp:100}],turnQueue:[],turn:1,onlineActorId:actor.id,onlineSkills:skills,skillMenu:true};
  return {actor,skills,battle,render:()=>BattleScreen(battle,{},{} )};
}
test('manual skill panel includes all 12 choices, last choice and a separate close action',()=>{
  const f=skillFixture(),before=[f.actor.currentHp,f.actor.currentMp,f.battle.enemies[0].hp,f.battle.turn],html=f.render();
  assert.match(html,/has-skill-menu/);
  assert.equal((html.match(/data-skill-id=/g)??[]).length,12);
  assert.match(html,/<button[^>]*data-skill-id="skill-11"[^>]*>/);
  assert.doesNotMatch(html,/<button[^>]*data-skill-id="skill-11"[^>]*disabled/);
  assert.match(html,/id="closeSkillMenu"/);
  assert.deepEqual([f.actor.currentHp,f.actor.currentMp,f.battle.enemies[0].hp,f.battle.turn],before);
});
test('last skill still respects MP costs and read-only / auto / submitted commands do not open the sheet',()=>{
  const f=skillFixture();f.actor.currentMp=0;
  assert.match(f.render(),/<button[^>]*data-skill-id="skill-11"[^>]*disabled/);
  for(const mode of ['auto','onlineReadOnly','onlineActionSubmitted']){
    f.battle[mode]=true;assert.doesNotMatch(f.render(),/has-skill-menu/);delete f.battle[mode];
  }
  f.battle.skillMenu=false;f.battle.itemMenu=true;
  assert.match(f.render(),/has-item-menu/);assert.doesNotMatch(f.render(),/has-skill-menu/);
});
function rankingContext(count=7){
  const entries=Array.from({length:count},(_,i)=>({playerId:`player-${i+1}`,displayName:`冒険者${i+1}`,rank:i+1,power:10000-i,maxFloor:100,icon:{name:'仲間'},lastActiveAt:Date.now()}));
  const c={Date,Set,Number,Math,clearTimeout,onlinePartyController:{connectionReady:true,selfId:'self'},powerRankingUi:{state:{entries,total:count}},powerRankingSupported:()=>true,homeServerStatus:{state:'online'},pixelIcon:()=>'',SPECIES:{},monsterVisual:()=>'',escapeAttribute:s=>String(s),formatCombatPower:String,powerRankingDisplayName:()=> '自分',rankingPresenceMarkup:()=>'',schedulePowerRankingPresenceRefresh(){},combatPowerOwnMarkup:()=>'<p>記録</p>',requestPowerRankings(){},openPlayerNameEditor(){},ensurePowerRankingConnection(){},openPowerRankingProfile(){}};
  vm.createContext(c);
  vm.runInContext(extract('function powerRankingEntryMarkup(','function requestPowerRankings('),c);
  vm.runInContext(extract('function renderCombatPowerRecordModal(','function rankingEquipmentMarkup('),c);
  return c;
}
test('ranking renders seven and one hundred participants including the last place, plus a separate self entry',()=>{
  for(const count of [7,100]){
    const c=rankingContext(count),before=JSON.stringify(c.powerRankingUi.state),html=c.combatPowerRankingMarkup();
    assert.equal((html.match(/data-power-ranking-player=/g)??[]).length,count);
    assert.ok(html.includes(`data-power-ranking-player="player-${count}"`));
    assert.equal(JSON.stringify(c.powerRankingUi.state),before);
    c.powerRankingUi.state.self={playerId:'self',rank:101,displayName:'自分',power:1};
    assert.ok(c.combatPowerRankingMarkup().includes('data-power-ranking-player="self"'));
  }
});
test('ranking updates and switching to own records preserve the scroll position in the real scroll owner',()=>{
  const c=rankingContext();let panel;
  const body={set innerHTML(v){this.html=v;panel={scrollTop:0,addEventListener(type,fn){this[type]=fn;}}},querySelector:q=>q==='.power-record-panel'?panel:null,querySelectorAll:()=>[]};
  const modal={dataset:{},querySelector:q=>q==='.game-modal-body'?body:q==='.power-record-panel'?panel:null};
  c.renderCombatPowerRecordModal(modal,'ranking');
  panel.scrollTop=721;panel.scroll();
  c.renderCombatPowerRecordModal(modal,'ranking');assert.equal(panel.scrollTop,721);
  c.renderCombatPowerRecordModal(modal,'own');panel.scrollTop=12;
  c.renderCombatPowerRecordModal(modal,'ranking');assert.equal(panel.scrollTop,721);
  panel.scrollTop=940;panel.scroll();
  c.powerRankingUi.state.entries.push({playerId:'player-8',rank:8,displayName:'追加',power:5});
  c.renderCombatPowerRecordModal(modal,'ranking');assert.equal(panel.scrollTop,940);
  assert.ok(body.html.includes('data-power-ranking-player="player-8"'));
});
test('empty, cached and loading rankings keep their existing messages and refresh actions',()=>{
  const c=rankingContext(0);assert.ok(c.combatPowerRankingMarkup().includes('ランキング登録者はまだいません'));
  c.powerRankingUi.state._cached=true;assert.ok(c.combatPowerRankingMarkup().includes('前回の記録'));
  c.powerRankingUi.state=null;c.powerRankingUi.loadingList=true;
  assert.ok(c.combatPowerRankingMarkup().includes('最新ランキングを取得中'));
});
test('research is the first entry of the circle list and can be claimed once without changing existing equipment',()=>{
  const save=saveFixture();save.state.player.maxFloor=100;save.state.campaign100.finalCompleted=true;save.migrate(save.state);
  const c={save,...Circles,isMagicCircle398,isChapterTwoCircle394,chapterTwoUnlocked,CHAPTER_TWO_AREAS,displayName:m=>m.name??m.speciesId};
  vm.createContext(c);vm.runInContext(extract('function magicCircleWorkshopBody(','function openMagicCircleWorkshop('),c);
  const monster=save.state.monsters[0],before=JSON.stringify({gold:save.state.player.gold,equipment:save.state.equipment,monster});
  let html=c.magicCircleWorkshopBody(monster);
  assert.ok(html.indexOf('class="magic-circle-list"')<html.indexOf('class="circle-research398"'));
  assert.ok(html.indexOf('class="circle-research398"')<html.indexOf('<article class="magic-circle-row'));
  assert.equal((html.match(/<article class="magic-circle-row/g)??[]).length,Circles.MAGIC_CIRCLES.length);
  assert.equal(JSON.stringify({gold:save.state.player.gold,equipment:save.state.equipment,monster}),before);
  const received=claimCircleResearch398(save.state);assert.equal(received.ok,true);assert.equal(received.granted.length,3);
  html=c.magicCircleWorkshopBody(monster);assert.ok(!html.includes('data-circle-research398'));
  assert.equal(claimCircleResearch398(save.state).ok,false);
  assert.equal((html.match(/<article class="magic-circle-row/g)??[]).length,Circles.MAGIC_CIRCLES.length);
});
