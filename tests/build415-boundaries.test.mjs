import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {SPECIES} from '../src/data/species.js';import {createMonster,calculatedStats} from '../src/models/Monster.js';import {endgameCharacter,ENDGAME_CHARACTERS} from '../src/data/endgameCharacters.js';
import {prepareTrial415,cleanupTrial415,trialTier415,battleAdaptationDescription415} from '../src/battle/TrialAdaptation415.js';
import {applyBattleEffect,createBattleRulesState,applyEnemyDamage} from '../src/battle/BattleRules.js';
import {preparationAvailable415} from '../src/battle/PairPreparation415.js';
import {RESONANCE_PAIRS385} from '../src/battle/TwinResonance385.js';
import {maxMp,learnedSkills,effectiveSkillMpCost} from '../src/battle/SkillSystem.js';
import {buildOnlinePartyProfile} from '../src/ui/screens/OnlinePartyScreen.js';
import {SaveService} from '../src/services/SaveService.js';
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('all modified browser modules, including old importer aliases, resolve to the current code',()=>{
 const imports=JSON.parse(read('index.html').match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
 for(const path of JSON.parse(read('docs/build415/changed-runtime.json')).filter(p=>p.endsWith('.js')&&p!=='src/main.js')){
  const version=path==='src/core/config.js'?'3.1.100-build421':['src/battle/TrialAdaptation415.js','src/ui/BattlePreparation415.js'].includes(path)?'3.1.98-build419':path==='src/ui/screens/FormationScreen.js'?'3.1.97-build418':'3.1.94-build415';
  assert.equal(imports['./'+path],'./'+path+'?v='+version);for(const[k,v]of Object.entries(imports))if(k.split('?')[0]==='./'+path)assert.equal(v,'./'+path+'?v='+version);
 }
 assert.match(read('index.html'),/const ASSET_BUILD = "build421"/);assert.match(read('src/core/config.js'),/SAVE_SCHEMA_VERSION=84/);
});
test('online combat cannot acquire trial stats; role condition is explicit',()=>{
 const party=['ch2_ryune','ch2_rose','ch2_noelle'].map(speciesId=>createMonster(speciesId,{level:1000}));
 assert.ok(trialTier415({party,specialBattleType:'chapterTwo'}));assert.equal(trialTier415({party:party.slice(0,2),specialBattleType:'chapterTwo'}),null);
 for(const flag of [{onlineMode:true},{pvp:true},{raid:true},{isPvp:true},{mode:'online'},{mode:'raid'},{mode:'pvp'}])assert.equal(trialTier415({party,...flag}),null);
 const b={party,specialBattleType:'chapterTwo',chapterPreparationElite415:3};assert.match(battleAdaptationDescription415(b),/HP×70/);
});
test('enemy-side preparation belongs to its side, pair, target and status type',()=>{
 const pair=RESONANCE_PAIRS385.find(p=>p.id==='glassaria'),enemies=pair.members.map((speciesId,i)=>({id:'enemy'+i,speciesId,hp:100,maxHp:100})),target={id:'ally',currentHp:100,statusProfile:{immune:['spdDown']}};
 const b={...createBattleRulesState([target]),party:[target],enemies,turn:1};assert.equal(applyBattleEffect(b,target.id,{kind:'spdDown',chance:1,turns:2,sourceMonsterId:enemies[0].id,authoredSetup415:true},'ally'),false);
 assert.equal(preparationAvailable415(b,'enemy',pair.id,target.id,'spdDown'),true);for(const[side,pairId,targetId,type]of [['ally',pair.id,target.id,'spdDown'],['enemy','twinclock',target.id,'spdDown'],['enemy',pair.id,'other','spdDown'],['enemy',pair.id,target.id,'evasionDown']])assert.equal(preparationAvailable415(b,side,pairId,targetId,type),false);
});
test('protected damage caps final HP loss after shield absorption',()=>{
 const enemy={id:'boss',hp:10000,maxHp:10000,_floorBossHpShield:8000};const b={...createBattleRulesState([]),party:[],enemies:[enemy],turn:1};b.enemyEffects={boss:[{kind:'vulnerable',value:1,turns:2}]};
 let h=applyEnemyDamage(b,enemy,5000,{maximumDamage415:800});assert.equal(h.damage,0);h=applyEnemyDamage(b,enemy,5000,{maximumDamage415:800});assert.ok(h.damage<=800);assert.equal(enemy.hp,10000-h.damage);
});
test('full outgoing online profile stays at its ordinary stats while local battle uses adaptation',()=>{
 const state=new SaveService().state;const m=createMonster('ch2_ryune',{level:999});state.monsters=[m];state.party=[m.id];state.equipment=[];
 const before=buildOnlinePartyProfile(state),b={party:[m],manualEndgameChallenge:true,specialBattleType:'emergency',preludeChoiceId:'manifest100'};prepareTrial415(b,calculatedStats);const after=buildOnlinePartyProfile(state);assert.deepEqual(after.battleStats,before.battleStats);assert.equal(after.power,before.power);assert.deepEqual(after.skills,before.skills);cleanupTrial415(b);
});
test('primary healing support has MP for at least three casts at benchmark levels',()=>{
 let checked=0;for(const s of Object.values(SPECIES).filter(s=>!endgameCharacter(s.id)&&['healer','support'].includes(s.role))){const m=createMonster(s.id,{level:1000});const heals=learnedSkills(m).filter(x=>['heal','allHeal'].includes(x.type));if(!heals.length)continue;const primary=heals.sort((a,b)=>effectiveSkillMpCost(m,a)-effectiveSkillMpCost(m,b))[0];assert.ok(maxMp(m)>=3*effectiveSkillMpCost(m,primary),s.id);checked++;}assert.ok(checked>10);
});

test('Deep Abyss and Ten Gods preserve all 68 golden stat, MP and skill profiles',async()=>{
 const {allLearnedSkills}=await import('../src/battle/SkillSystem.js'),{createHash}=await import('node:crypto');const baseline=JSON.parse(read('docs/build415/protected-baseline.json'));
 assert.equal(baseline.rows.length,68);for(const [path,hash]of Object.entries(baseline.hashes))assert.equal(createHash('sha256').update(read(path)).digest('hex'),hash,path);
 for(const row of baseline.rows){const m=createMonster(row.speciesId,{endgameBossId:row.id,endgameFaction:row.faction,level:row.level,allowEndgameLevel:true,traitId:'steady',rank:1,plus:0,affection:0});assert.deepEqual(calculatedStats(m),row.stats,row.id);assert.equal(maxMp(m),row.mp);assert.deepEqual(allLearnedSkills(m).map(s=>({id:s.id,mp:effectiveSkillMpCost(m,s)})),row.skills);
 const party=[m,...['ch2_ryune','ch2_rose','ch2_noelle'].map(speciesId=>createMonster(speciesId,{level:1000}))],b={party,specialBattleType:'chapterTwo'};prepareTrial415(b,calculatedStats);assert.deepEqual(calculatedStats(m),row.stats);cleanupTrial415(b);}
});
