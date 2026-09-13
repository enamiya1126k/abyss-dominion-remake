import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {run} from '../tools/build430/native-harness.mjs';
import {SPECIES} from '../src/data/species.js';import {ENDGAME_CHARACTERS} from '../src/data/endgameCharacters.js';
import {MOTHER_ENEMY422,tuneMother422} from '../src/primordial/Mother422.js';import {createEnemyBattleState} from '../src/battle/EnemyAI.js';
import {prepareMother426,beginMotherAttack426,createMotherChild426,MOTHER_SUMMON_POOL426} from '../src/primordial/Cycle426.js';
import {MOTHER_LAWS424} from '../src/primordial/Dial424.js';import {motherDialExpansion425} from '../src/ui/MotherDial425.js';
import {beginMother422,settleMother422,motherState422} from '../src/primordial/State422.js';
import {motherFieldHitBounds433} from '../src/primordial/FieldHit433.js';import {chapterTwoFrameBounds383} from '../src/ui/ChapterTwoSprite383.js';
const boss=()=>tuneMother422(createEnemyBattleState(SPECIES.ch2_ionea,{...MOTHER_ENEMY422,id:'mother433'},1));
async function fixture(){return run(['ch2_nemesia','ch2_everia','ch2_aeriel','ch2_vespera'],[],{inspect:true,level:6000,enemyUnits:[boss()],battleOptions:{specialBattleType:'mother422',specialBattle:true}});}
function hit(f,amount){beginMotherAttack426(f.b,f.party[0]);f.context.applyEnemyDamage(f.b,f.b.enemies[0],amount,{sourceId:f.party[0].id,damageClass:'physical'});}
test('summoning begins strictly below half HP, including a hit crossing the threshold',async()=>{
 for(const [before,damage,count]of [[1600000,1,0],[800001,1,0],[800000,1,1],[800001,2,1],[799999,1,1]]){const f=await fixture();f.b.enemies[0].hp=before;hit(f,damage);assert.equal(f.b.enemies.length-1,count,JSON.stringify({before,damage}));}
 const f=await fixture();f.b.enemies[0].hp=799999;hit(f,1);f.b.enemies[0].hp=900000;hit(f,1);assert.equal(f.b.enemies.length,2,'healing above half temporarily suspends summoning');
});
test('every eligible species and each distinct abyss / ten-god record can be drawn without touching source data',async()=>{
 const f=await fixture(),before=JSON.stringify([SPECIES,ENDGAME_CHARACTERS]);prepareMother426(f.b);
 assert.equal(new Set(MOTHER_SUMMON_POOL426).size,MOTHER_SUMMON_POOL426.length);assert.ok(MOTHER_SUMMON_POOL426.length>300);assert.ok(!MOTHER_SUMMON_POOL426.includes('ch2_ionea'));
 for(const [index,id]of MOTHER_SUMMON_POOL426.entries()){
  let first=true;const child=createMotherChild426(f.b,f.b.enemies[0],()=>{if(first){first=false;return(index+.5)/MOTHER_SUMMON_POOL426.length;}return .5;});
  const god=ENDGAME_CHARACTERS[id];assert.equal(child.speciesId,god?.speciesId??id);assert.ok(child.uncapturable&&child.noItemDrops&&child.motherSummon426);assert.equal(child.readyRound426,2);assert.equal(child.enemyGear.length,3);
  for(const k of ['maxHp','hp','atk','matk','def','mdef','spd','maxMp','currentMp'])assert.ok(Number.isFinite(child[k])&&child[k]>=0,id+': '+k);
  if(god){assert.equal(child.endgameBossId,id);assert.equal(child.visualSpeciesId,id);assert.equal(child.name,god.name);assert.equal(child.faction,god.faction);const saved=JSON.stringify(child);f.context.hydrateEndgameEnemy(child);assert.equal(JSON.stringify(child),saved,'resume must not change rolled stats');child.hp=0;f.context.hydrateEndgameEnemy(child);assert.equal(child.hp,0);}else assert.equal(child.endgameBossId,undefined);
 }
 assert.equal(JSON.stringify([SPECIES,ENDGAME_CHARACTERS]),before);
});
test('all ten native skill banners name the stopped god and the actual projected skill',async()=>{
 for(const law of MOTHER_LAWS424){const f=await fixture(),calls=[];f.context.battleBanner=async(...args)=>calls.push(args);await f.context.resolveEnemySpecialAction(f.b.enemies[0],law.action);assert.equal(calls.length,1);assert.equal(calls[0][0],law.name);assert.equal(calls[0][1],law.godName+'より発動');assert.equal(calls[0][2],'skill');assert.equal(calls[0][4],f.b.enemies[0]);}
});
test('dial growth stays centered on the mother and within the enemy-side budget',()=>{
 for(const width of [140,180,320]){const side={left:200,top:150,width,height:420},circle={left:200+width*.15,top:190,width:width*.7,height:width*.7},g=motherDialExpansion425(circle,side);assert.equal(g.dx,0);assert.equal(g.dy,0);assert.ok(g.scale>=1&&g.scale<=1.18);const r=circle.width*g.scale/2;assert.ok(circle.left+circle.width/2-r>=side.left);assert.ok(circle.left+circle.width/2+r<=side.left+width);}
});
test('hit area encloses actual visible body and name at every zoom',()=>{
 for(const z of [.3,.7,1,2]){const camera={z,world:(x,y)=>({x:x*z+13,y:y*z-27})},actor={position:{x:7,y:9}},nameBounds={left:200,right:270,top:450,bottom:465},r=motherFieldHitBounds433({camera,TILE:88,actor,nameBounds}),b=chapterTwoFrameBounds383('ch2_ionea'),foot=camera.world(7.5*88,9.9*88),s=z*2.65;
 assert.ok(r.left<=foot.x-32*s+64*s*b.left);assert.ok(r.right>=foot.x-32*s+64*s*b.right);assert.ok(r.top<=foot.y-61*s+64*s*b.top);assert.ok(r.bottom>=foot.y-61*s+64*s*b.bottom);assert.ok(r.left<=nameBounds.left&&r.right>=nameBounds.right&&r.top<=nameBounds.top&&r.bottom>=nameBounds.bottom);}
});
function modalFixture(c){let html='',modal;const nodes=new Map(),node=k=>{if(!nodes.has(k))nodes.set(k,{});return nodes.get(k);};modal={isConnected:true,querySelector:node,classList:{add(){}},remove(){this.isConnected=false;}};c.app.insertAdjacentHTML=(_,s)=>html=s;c.topModal=()=>modal;c.save.save=()=>true;c.showToast=()=>{};return{modal,node,html:()=>html};}
test('native challenge confirmation cancels safely, prevents stale/double starts and uses short rematch copy',async()=>{
 for(const cancel of [true,false]){const f=await fixture(),c=f.context;c.battle=null;c.save.state.player.inRun=false;c.save.state.chapterTwo376={areaClears378:{4:1}};Object.assign(motherState422(c.save.state),{cleared:true,phase:'cleared'});const ui=modalFixture(c);let starts=0;c.startSpecialBattle=()=>starts++;c.openMotherChallenge422();assert.match(ui.html(),/十神の母と再戦しますか？/);assert.match(ui.html(),/初回報酬は再取得できません/);assert.doesNotMatch(ui.html(),/十律輪|mother-law-list|万命の産声/);if(cancel)ui.node('[data-mother-cancel433]').onclick();ui.node('[data-modal-primary]').onclick();ui.node('[data-modal-primary]').onclick();assert.equal(starts,cancel?0:1);assert.equal(Boolean(motherState422(c.save.state).attempt),!cancel);}
});
test('altar only opens the ending; rematch victory returns to the mother with no repeated first reward',async()=>{
 const f=await fixture(),c=f.context,s=c.save.state;s.player.inRun=false;s.chapterTwo376={areaClears378:{4:1}};c.battle=null;const stories=[];c.showMotherStory422=k=>stories.push(k);c.openMotherAltar422();assert.equal(stories.length,0);
 assert.ok(beginMother422(s).ok);const first=settleMother422(s,true);assert.ok(first.first);const wallet=[s.player.gold,s.player.crystals];c.openMotherAltar422();assert.deepEqual(stories,['ending']);assert.ok(beginMother422(s).ok);const again=settleMother422(s,true);assert.equal(again.first,false);assert.deepEqual([s.player.gold,s.player.crystals],wallet);assert.equal(motherState422(s).phase,'cleared');assert.equal(settleMother422(s,true).ok,false);
});
test('cache maps route every edited module to the new build while frozen raid runtime stays isolated',()=>{
 const html=fs.readFileSync('index.html','utf8'),map=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
 for(const path of ['src/main.js','src/primordial/Cycle426.js','src/ui/RoyalChamberField.js','src/ui/MotherDial425.js','src/ui/screens/BattleScreen.js','src/core/config.js']){const entries=Object.entries(map).filter(([k])=>k.split('?')[0]==='./'+path);assert.ok(entries.length);assert.ok(entries.every(([,v])=>v.endsWith(['src/main.js','src/ui/RoyalChamberField.js','src/ui/screens/BattleScreen.js','src/core/config.js'].includes(path)?'3.1.114-build435':'3.1.112-build433')));}
 assert.match(html,/world-raid-offline435-sw/);const assets=JSON.parse(fs.readFileSync('world-raid-offline433-assets.json','utf8'));assert.ok(assets.includes('./src/primordial/FieldHit433.js'));assert.ok(assets.includes('./src/Styles/build433-mother.css'));assert.ok(!Object.keys(map).some(k=>k.includes('/runtime430/')));
});
