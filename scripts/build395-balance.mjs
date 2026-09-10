// Deterministic mechanical audit, not a complete AI battle or an estimate of win rate.
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {SPECIES} from '../src/data/species.js';
import {createMonster,calculatedStats,displayName} from '../src/models/Monster.js';
import {equipmentStatMultiplier} from '../src/models/Equipment.js';
import {equipmentAffixesWithSeries} from '../src/core/EquipmentAffixSystem.js';
import {createEnemyBattleState} from '../src/battle/EnemyAI.js';
import {skillDamage,maxMp} from '../src/battle/SkillSystem.js';
import {applyEnemyDamage,applyBattleEffect,effectValue,hasEffect,clearNegativeAllyEffects,clearPersistentAilments} from '../src/battle/BattleRules.js';
import {ENCOUNTERS,chapterTwoEnemyEntries,tuneChapterTwoEnemy,CHAPTER_TWO_AREAS} from '../src/chapterTwo/ChapterTwoSystem.js';
import {CHAPTER_TWO_ELITE_SQUADS393 as squads} from '../src/chapterTwo/ChapterTwoElite393.js';
import {RESONANCE_PAIRS385 as pairs,resolveTwin385,queuePairCounter390,resolvePairCounters390} from '../src/battle/TwinResonance385.js';
import {CHAPTER_TWO_RELICS394 as relics,CHAPTER_TWO_CIRCLES394 as circles} from '../src/data/chapterTwoRelics394.js';
import {createChapterTwoRelic394} from '../src/chapterTwo/ChapterTwoRewards394.js';
import {aggregateRelics394} from '../src/battle/ChapterTwoRelicCombat394.js';
const root=new URL('../',import.meta.url),main=fs.readFileSync(new URL('src/main.js',root),'utf8');
function seeded(seed,fn){const old=Math.random;let n=seed>>>0;Math.random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/2**32};try{return fn()}finally{Math.random=old}}
function team(id,tier,seed=1){return seeded(seed,()=>chapterTwoEnemyEntries(id,{eliteTier393:tier}).map((e,i)=>{const u=createEnemyBattleState(SPECIES[e.speciesId],{...e,id:'e'+i},100);tuneChapterTwoEnemy(u,id,i,{eliteTier393:tier});return u}));}
const average=a=>a.reduce((s,x)=>s+x,0)/a.length,round=x=>Math.round(x*1000)/1000;
const elite=[];
for(const squad of squads)for(let tier=1;tier<=3;tier++){
 const samples=Array.from({length:16},(_,i)=>team(squad.id,tier,395+i)),units=samples.flat();
 for(const u of units)for(const k of ['maxHp','atk','matk','def','mdef','spd','maxMp'])assert.ok(Number.isFinite(u[k])&&u[k]>0,`${squad.id}:${tier}:${k}`);
 elite.push({id:squad.id,name:squad.name,area:squad.area,tier,samples:16,meanTotalHp:Math.round(average(samples.map(s=>s.reduce((a,u)=>a+u.maxHp,0)))),meanOffense:Math.round(average(units.map(u=>Math.max(u.atk,u.matk)))),meanDefense:Math.round(average(units.map(u=>(u.def+u.mdef)/2))),meanSpeed:Math.round(average(units.map(u=>u.spd)))});
}
for(const squad of squads){const rows=elite.filter(r=>r.id===squad.id);for(let i=1;i<3;i++){assert.ok(rows[i].meanTotalHp>rows[i-1].meanTotalHp);assert.ok(rows[i].meanOffense>rows[i-1].meanOffense);}}
const pairRows=[];
function optimalItems(pair,level){
 const status=pair.bonusVsStatus?.id;
 const weaponIndex=({poison:3,sleep:4,freeze:11})[status]??(pair.bonusVsHp392||pair.burst?.bonusVsHp392?13:pair.damageClass==='magic'?3:0);
 return seeded(395,()=>[weaponIndex,9,7,10,14,12].map((index,i)=>{const item=createChapterTwoRelic394(relics[index],level,3);item.level=level;item.plus=30;item.affixes=[];item.id='gear'+i;return item}));
}
function setup(pair,mode){
 const squad=squads.find(s=>pair.members.every(id=>s.species.includes(id))),level=CHAPTER_TWO_AREAS[squad.area].level,reference=team(squad.id,2);
 const party=pair.members.map((id,i)=>{const m=seeded(395,()=>createMonster(id,{level})),items=mode==='standard'?reference.find(u=>u.speciesId===id).enemyGear.map(g=>({...g,affixes:[]})):optimalItems(pair,level);m.id='p'+i;m._equipmentStats={};for(const item of items)for(const [k,v]of Object.entries(item.stats))m._equipmentStats[k]=(m._equipmentStats[k]??0)+Math.round(v*equipmentStatMultiplier(item));m._equipmentAffixes=equipmentAffixesWithSeries(items,{});m._chapterTwoRelics394=aggregateRelics394(items);m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);return m});
 // Immortal target HP isolates 3 rounds of followups from overkill. Actual elite defenses retained.
 const enemies=reference.map((e,i)=>({id:'target'+i,hp:1e12,maxHp:1e12,def:e.def,mdef:e.mdef,evasion:0,element:'neutral'}));
 const b={party,enemies,turn:1,allyEffects:{},enemyEffects:{},allyAilments:{},enemyStatuses:{},circleShields:{},magicCircleProfiles:{}};
 for(const m of party){b.magicCircleProfiles[m.id]=mode==='standard'?{id:'none',level:1}:{id:circles[pair.bonusVsStatus?.id==='sleep'?1:2].id,level:99};}
 const ready=mode==='prepared';if(ready){for(const e of enemies){if(pair.bonusVsStatus)b.enemyStatuses[e.id]=[{id:pair.bonusVsStatus.id,turns:99}];b.enemyEffects[e.id]=(pair.bonusVsEffects?.kinds??[]).map(kind=>({kind,value:.1,turns:99}));if(pair.bonusVsHp392||pair.burst?.bonusVsHp392)e.hp=.3*e.maxHp;}if(pair.emergency)party[0].currentHp=Math.floor(calculatedStats(party[0]).hp*.3);}
 if(mode==='stopped')b.allyAilments.p1=[{id:'freeze',turns:99}];
 return{b,squad,level};
}
function runtime(b){let total=0;const c={queuePairCounter390,resolvePairCounters390,clearNegativeAllyEffects,clearPersistentAilments,maxMp,battle:b,save:{state:{equipment:[]}},SPECIES,resolveTwin385,calculatedStats,displayName,POSITIVE_ENEMY_EFFECTS:new Set(['atkUp','defUp','spdUp','accuracyUp','evasionUp','guard']),skillDamage,applyEnemyDamage,applyBattleEffect,effectValue,hasEffect,allyAilment:(u,id)=>(b.allyAilments[u.id]??[]).find(s=>s.id===id&&s.turns>0),aliveEnemies:x=>x.enemies.filter(e=>e.hp>0),ultimateIsolated:()=>false,ultimateExtraBlocked:()=>false,convertedAttackStats:s=>s,attackHits:()=>true,allyAttackFactor:id=>1+effectValue(b,id,'atkUp')-effectValue(b,id,'atkDown'),enemyDefenseFactor:id=>1+effectValue(b,id,'defUp','enemy')-effectValue(b,id,'defDown','enemy'),attributeDamageMultiplier:()=>1,abyssBattleMultiplier:()=>1,enemyDamageMultiplier:()=>1,endgameIncomingDamageMultiplier:()=>1,weaponMasteryDamageMultiplier:()=>1,magicCircleDamageMultiplier:()=>1,affixValue:(u,k,cap=Infinity)=>Math.min(cap,Number(u._equipmentAffixes?.[k])||0),addBattleLog(){},battleBanner:async()=>{},animateAttack:async()=>{},animateHit:async()=>{},floatText:async()=>{},recordBattleDamage(_u,d){total+=d},registerWeaponFinisher(){},recordBattleHealing(){},flushBattleRecoveries:async()=>{},queueBattleRecovery(){},heroOverheal(){},hasCircleEffect:()=>false,queueMagicCircleEvent(){}};
 vm.createContext(c);const start=main.indexOf('async function resolveTwinResonance385('),end=main.indexOf('async function triggerInvincibleAlliance(',start);vm.runInContext(main.slice(start,end),c);
 const add=(a,z)=>vm.runInContext(main.slice(main.indexOf(a),main.indexOf(z,main.indexOf(a))),c);add('function recoverBattleHp(','function storeFloorBossManaNocturne(');add('function recoverBattleMp(','function magicCircleDamageMultiplier(');const x=main.indexOf('function clearAilments(');vm.runInContext(main.slice(x,main.indexOf('\n',x)),c);
 return{c,total:()=>total};
}
for(const pair of pairs){const row={id:pair.id,name:pair.name,members:pair.names,description:pair.description,scenarios:{}};for(const mode of ['standard','limited','prepared','stopped']){const {b,squad,level}=setup(pair,mode),{c,total}=runtime(b);row.area=squad.area;row.level=level;for(let turn=1;turn<=3;turn++){b.turn=turn;for(const actor of b.party){await c.resolveTwinResonance385(actor);assert.equal(await c.resolveTwinResonance385(actor),false,'one quota per member');}}assert.ok(Number.isFinite(total()));if(mode==='stopped')assert.equal(total(),0);row.scenarios[mode]=total();for(const u of b.party){assert.ok(u.currentHp<=calculatedStats(u).hp);assert.ok(u.currentMp<=maxMp(u));}}
 row.conditionalRatio=row.scenarios.limited?round(row.scenarios.prepared/row.scenarios.limited):null;pairRows.push(row);
}
const out={build:395,method:'実際の生成・装備計算・ペア追撃処理を使用。精鋭は15部隊×3段階×16固定シードの能力値比較。ペアは24組×4条件×3ラウンド、各組2人対4体。',limitations:'勝率や完全自動戦闘の試験ではない。追撃比較は必中・会心なし・属性等倍・継続する標的で通常技と敵の行動を除外。反撃・時間経過での異常解除・装備厳選・既存魔法陣の自動発動・シリーズ効果・権能・転生は含めない。回復/障壁型を総ダメージだけで順位付けしない。',presets:{standard:'同地域・覇者の敵と同じ6枠装備、個体Lvは地域目安、＋値は敵装備設定、追加厳選なし・陣なし。',limited:'同Lvの限定6枠装備＋30・指定魔法陣Lv99。ペアの睡眠/毒/凍結等の特効条件なし。',prepared:'limitedと同じ装備、固有の状態異常・弱体・瀕死/敵HP条件を設定。',stopped:'limitedと同じ装備、相方を凍結。'},eliteConfigurations:720,pairScenarios:96,elite,pairs:pairRows,decision:'全15部隊で段階ごとの平均総HP・攻撃力の上昇を確認。基本の敵倍率と24組の固有威力は維持。行動不能中の連携のみ停止する共通条件を追加。'};
fs.writeFileSync(new URL('artifacts/build395/balance-audit.json',root),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({configurations:out.eliteConfigurations,pairScenarios:96,eliteHpRatioRange:[Math.min(...squads.map(s=>elite.find(e=>e.id===s.id&&e.tier===3).meanTotalHp/elite.find(e=>e.id===s.id&&e.tier===1).meanTotalHp)),Math.max(...squads.map(s=>elite.find(e=>e.id===s.id&&e.tier===3).meanTotalHp/elite.find(e=>e.id===s.id&&e.tier===1).meanTotalHp))].map(round),conditional:pairRows.filter(p=>p.conditionalRatio>1.001).map(p=>[p.name,p.conditionalRatio])},null,2));
