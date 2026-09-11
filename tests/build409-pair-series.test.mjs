import test from 'node:test';import assert from 'node:assert/strict';
import * as P from '../src/battle/PairSynergy409.js';
import {resolveTwin385,twinPair385,queuePairCounter390,resolvePairCounters390} from '../src/battle/TwinResonance385.js';
import {applyBattleEffect,effectValue,applyEnemyDamage,processAllyEffects} from '../src/battle/BattleRules.js';
import {PAIR_THEMES409,pairCutinMarkup409} from '../src/ui/PairEffects409.js';
function fixture(id,side='ally'){
 const p=P.PAIR_SERIES409[id],members=p.members.map((speciesId,i)=>({id:`${side}${i}`,speciesId,currentHp:1000,hp:1000,maxHp:1000,currentMp:100,maxMp:100}));
 const foes=[0,1].map(i=>({id:`foe${i}`,speciesId:'slime',hp:10000,currentHp:10000,maxHp:10000}));
 const b={turn:1,party:side==='ally'?members:foes,enemies:side==='ally'?foes:members,allyEffects:{},enemyEffects:{},allyAilments:{},enemyStatuses:{},circleShields:{}};
 P.preparePairVitals409(b,u=>u.maxHp);
 const other=side==='ally'?'enemy':'ally',hp=u=>side==='ally'?u.currentHp:u.hp,fhp=u=>other==='ally'?u.currentHp:u.hp;
 const calls={hits:[],heals:[],mp:[],cues:[]},env={blocked:()=>false,maxHp:u=>u.maxHp,hpRatio:u=>hp(u)/u.maxHp,opponentHpRatio:u=>fhp(u)/u.maxHp,targetId:foes[0].id,opponents:()=>foes.filter(u=>fhp(u)>0),hasStatus:(u,id)=>(b[other==='ally'?'allyAilments':'enemyStatuses'][u.id]??[]).some(e=>e.id===id),hasEffect:(u,k)=>effectValue(b,u.id,k,other)>0,
 cue:async plan=>calls.cues.push(plan),hit:async(actor,target,pair)=>{calls.hits.push({...pair,targetId:target.id});if(env.killFirst&&target===foes[0])target.hp=target.currentHp=0;return env.miss?0:10;},
 weaken:(u,e)=>applyBattleEffect(b,u.id,e,other),boost:(u,e)=>applyBattleEffect(b,u.id,e,side),
 dispel:u=>{const list=b[other==='ally'?'allyEffects':'enemyEffects'][u.id]??[],i=list.findIndex(e=>['atkUp','defUp','guard'].includes(e.kind));return i<0?false:list.splice(i,1)[0];},
 cleanse:u=>{const list=b[side==='ally'?'allyEffects':'enemyEffects'][u.id]??[];const old=list.length;b[side==='ally'?'allyEffects':'enemyEffects'][u.id]=list.filter(e=>!e.kind.endsWith('Down'));return old-b[side==='ally'?'allyEffects':'enemyEffects'][u.id].length;},
 heal:async(u,rate)=>{calls.heals.push({id:u.id,rate});const field=side==='ally'?'currentHp':'hp',old=u[field];u[field]=Math.min(u.maxHp,old+u.maxHp*rate);return u[field]-old;},
 restoreMp:async(u,rate)=>{calls.mp.push({id:u.id,rate});const old=u.currentMp;u.currentMp=Math.min(u.maxMp,old+u.maxMp*rate);return{gained:u.currentMp-old,overflow:Math.max(0,old+u.maxMp*rate-u.maxMp)};},
 shield:(u,rate)=>P.writePairShield409(b,side,u,rate,id)};
 const effect=(u,kind,value=.2,turns=2,targetSide=other)=>applyBattleEffect(b,u.id,{kind,value,turns,sourceKey:'fixture:'+kind},targetSide);
 const status=id=>b[other==='ally'?'allyAilments':'enemyStatuses'][foes[0].id]=[{id,turns:2,power:.01}];
 const natural=i=>P.recordNaturalPairAction409(b,members[i],side,foes[0]);
 return{b,p,members,foes,side,other,calls,env,effect,status,natural,go:i=>resolveTwin385(b,members[i],side,env)};
}
async function activate(f){const{b,p,members:m,foes,effect,status,side,env,natural}=f;
 if(['mirrors','foxmoon'].includes(p.id)){if(p.id==='foxmoon')status('burn');natural(0);await f.go(0);natural(1);return f.go(1);}
 if(p.id==='talismans')effect(foes[0],'healDown');
 if(p.id==='wings'){m[0].hp=m[0].currentHp=300;return P.observePairImpact409(b,m[0],side);}
 if(['garden','wisteria'].includes(p.id))status('poison');
 if(p.id==='frostshatter')status('freeze');if(p.id==='crimsonwings')status('bleed');if(p.id==='dreamharvest')status('sleep');
 if(['glassaria','twinclock'].includes(p.id)){effect(foes[0],'spdDown');effect(foes[0],p.id==='glassaria'?'evasionDown':'defDown');m.forEach(u=>u.currentMp=0);}
 if(['stitch','rosevow'].includes(p.id)){m[0].hp=m[0].currentHp=200;effect(m[0],'healDown',.25,2,side);effect(m[1],'atkDown',.2,2,side);}
 if(p.id==='absolutionbells')effect(m[0],'atkDown',.2,2,side);
 if(['twinkeys','dragonliberation'].includes(p.id))effect(foes[0],'atkUp');
 if(p.id==='eclipsecrown'){env.killFirst=true;effect(foes[1],'atkUp');}
 if(p.id==='crownsfinale')foes[0].hp=foes[0].currentHp=3000;
 await f.go(0);
 if(['starthread','twinthunder','crownsfinale','starconfluence'].includes(p.id))await f.go(1);
 if(p.id==='starconfluence'){b.turn++;await f.go(0);}
 if(p.id==='oathguard'){const amount=side==='ally'?b.circleShields[m[0].id]:m[0]._floorBossHpShield;P.observePairImpact409(b,m[0],side,{beforeShield:amount,afterShield:0,direct:true});}
 if(p.id==='oathreturn'){m[0].hp=m[0].currentHp=500;assert.equal(queuePairCounter390(b,m[0],foes[0],side,true),true);await resolvePairCounters390(b,()=>env);}
}
for(const side of ['ally','enemy'])for(const id of Object.keys(P.PAIR_SERIES409))test(`${side}: ${id} triggers its actual shared resonance effect`,async()=>{
 const f=fixture(id,side);await activate(f);const{b,members:m,foes,calls,other}=f;
 assert.equal(b.pairSynergy409.stats[`${side}:${id}`]?.activations,1);
 assert.ok(b.pairSynergy409.cues.some(c=>c.pairId===id));
 if(id==='mirrors'){assert.equal(calls.hits.filter(p=>p.damageMultiplier409===1.2).length,3);}
 if(['foxmoon','starconfluence'].includes(id))assert.ok(calls.hits.some(p=>p.guaranteedHit409));
 if(id==='talismans')assert.equal(b[other==='enemy'?'enemyEffects':'allyEffects'][foes[0].id].find(e=>e.kind==='healDown').turns,3);
 if(id==='garden')assert.equal(calls.heals.filter(h=>h.rate===.08).length,1);
 if(id==='starthread')assert.equal(effectValue(b,m[0].id,'guard',side),.2);
 if(id==='stitch')assert.equal(effectValue(b,m[1].id,'atkDown',side),0);
 if(id==='glassaria')assert.equal(calls.mp.filter(h=>h.rate===.04).length,2);
 if(id==='eclipsecrown')assert.equal(effectValue(b,foes[1].id,'atkUp',other),0);
 if(id==='oathguard')m.forEach(u=>assert.equal(effectValue(b,u.id,'defUp',side),.15));
 if(id==='rosevow')assert.equal(effectValue(b,m[0].id,'healDown',side),0);
 if(id==='twinclock')m.forEach(u=>assert.equal(effectValue(b,u.id,'spdUp',side),.25));
 if(id==='wisteria')assert.equal(effectValue(b,foes[0].id,'healDown',other),.4);
 if(['twinthunder','eclipserenewal'].includes(id))m.forEach(u=>assert.equal(P.pairSkillCost409(b,u,{id:u.speciesId+'__skill'},100,side),90));
 if(id==='twinkeys'){assert.equal(calls.hits.at(-1).defenseIgnore,.6);assert.equal(calls.hits.filter(p=>p.defenseIgnore===.6).length,1);}
 if(id==='frostshatter')m.forEach(u=>{assert.equal(P.consumePairGuard409(b,u,side,100),90);assert.equal(P.consumePairGuard409(b,u,side,100),100);});
 if(id==='oathreturn')assert.ok(calls.heals.some(h=>h.id===m[0].id&&h.rate===.05));
 if(id==='crimsonwings')assert.equal(effectValue(b,foes[0].id,'healDown',other),.2);
 if(id==='dreamharvest')assert.equal(effectValue(b,foes[0].id,'accuracyDown',other),.15);
 if(['wings','absolutionbells','dragonliberation'].includes(id))m.forEach(u=>assert.equal(side==='ally'?b.circleShields[u.id]:u._floorBossHpShield,{wings:250,absolutionbells:100,dragonliberation:280}[id]));
 if(id==='crownsfinale'){b.turn++;await f.go(0);assert.equal(calls.hits.at(-1).damageMultiplier409,1.1);await f.go(1);assert.equal(calls.hits.at(-1).damageMultiplier409,1);}
});
test('24 pairs stop on partner control, death, capture and isolation; copies do not add activations',async()=>{
 for(const id of Object.keys(P.PAIR_SERIES409))for(const cancel of [f=>f.members[1].currentHp=0,f=>f.members[1].captured=true,f=>f.b.allyAilments[f.members[1].id]=[{id:'sleep',turns:2}],f=>f.b.ultimates358={effects:[{kind:'exile',source:f.foes[0].id,targets:[f.members[1].id],until:2}]}]){
 const f=fixture(id);cancel(f);assert.equal(await f.go(0),false,id);assert.deepEqual(f.b.pairSynergy409.stats,{});}
 const f=fixture('twinthunder');await activate(f);const copy={...f.members[1],id:'copy'};f.b.party.push(copy);assert.equal(await resolveTwin385(f.b,copy,'ally',f.env),false);assert.equal(f.b.pairSynergy409.stats['ally:twinthunder'].activations,1);
});
test('no false conditional benefits from misses, plain targets, empty cleansing or empty dispel',async()=>{
 for(const id of ['talismans','garden','foxmoon','glassaria','eclipsecrown','stitch','rosevow','twinclock','wisteria','twinkeys','frostshatter','crimsonwings','absolutionbells','dreamharvest','dragonliberation']){const f=fixture(id);f.env.miss=true;await f.go(0);assert.deepEqual(f.b.pairSynergy409.stats,{},id);}
 const f=fixture('talismans');await f.go(0);assert.deepEqual(f.b.pairSynergy409.stats,{});assert.equal(f.b.enemyEffects.foe0[0].turns,2);
});
test('only natural attacks record focus; effects use maximum rather than sum',async()=>{
 const f=fixture('mirrors');for(const options of [{offensive:false},{extra:true}])assert.equal(P.recordNaturalPairAction409(f.b,f.members[0],'ally',f.foes[0],options),false);
 const f2=fixture('starthread');f2.effect(f2.members[0],'guard',.5,3,'ally');await activate(f2);assert.equal(effectValue(f2.b,f2.members[0].id,'guard'),.5);
 const enemy=fixture('starthread','enemy');await activate(enemy);enemy.members[0]._floorBossHpShield=0;assert.equal(applyEnemyDamage(enemy.b,enemy.members[0],100,{sourceId:'foe0',damageClass:'physical'}).damage,80);
});
test('defensive event attribution, one battle rescue, lethal hits and DoT crossing',async()=>{
 for(const event of [{beforeShield:120,afterShield:0,direct:false},{beforeShield:500,afterShield:0,direct:true}]){const f=fixture('oathguard');await f.go(0);P.observePairImpact409(f.b,f.members[0],'ally',event);assert.deepEqual(f.b.pairSynergy409.stats,{});}
 const f=fixture('wings');f.members[0].currentHp=310;f.b.allyAilments.ally0=[{id:'poison',power:.02,turns:3}];processAllyEffects(f.b,u=>({hp:1000}));assert.equal(f.b.circleShields.ally0,250);f.b.circleShields.ally0=0;f.b.turn++;P.observePairImpact409(f.b,f.members[0],'ally');assert.equal(f.b.circleShields.ally0,0);
 const dead=fixture('wings');dead.members[0].currentHp=0;P.observePairImpact409(dead.b,dead.members[0],'ally');assert.deepEqual(dead.b.pairSynergy409.stats,{});
});
test('save and restore keeps quotas, focus, charge and consumption without copying cues',async()=>{
 const f=fixture('twinthunder');await activate(f);const raw=JSON.parse(JSON.stringify(f.b));raw.pairSynergy409=P.createPairState409(raw.pairSynergy409);assert.deepEqual(raw.pairSynergy409.cues,[]);
 const u=raw.party[0],skill={id:u.speciesId+'__skill'};assert.equal(P.pairSkillCost409(raw,u,skill,99),90);assert.equal(P.pairSkillCost409(raw,u,{id:'global'},99),99);assert.equal(P.consumePairDiscount409(raw,u,'ally',skill),true);assert.equal(P.pairSkillCost409(raw,u,skill,99),99);assert.equal(P.consumePairDiscount409(raw,u,'ally',skill),false);
 const copy={...raw.party[1],id:'duplicate'};raw.party.push(copy);assert.equal(P.consumePairDiscount409(raw,copy,'ally',{id:copy.speciesId+'__s'}),true);assert.equal(P.pairSkillCost409(raw,raw.party[1],{id:copy.speciesId+'__s'},100),100);
 const g=fixture('twinthunder');await activate(g);g.b.turn=3;assert.equal(P.pairSkillCost409(g.b,g.members[0],{id:g.members[0].speciesId+'__s'},100),100);
});
test('cutins have 24 themes, two escaped names, distinct phases and no input controls',()=>{
 assert.equal(Object.keys(PAIR_THEMES409).length,24);for(const id of Object.keys(P.PAIR_SERIES409)){const f=fixture(id);const html=pairCutinMarkup409({pair:twinPair385(f.members[0]),members:f.members,side:'ally'},()=>'<img alt="">',()=>'<script>');assert.equal((html.match(/pair-partner409 /g)??[]).length,2);assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<button'));}
 for(const [flag,phase] of [['charging390','charge'],['finisher390','release'],['finisher386','burst'],['reaction390','counter']]){const f=fixture('starconfluence');assert.ok(pairCutinMarkup409({pair:{...twinPair385(f.members[0]),[flag]:true},members:f.members}).includes('phase-'+phase));}
});

test('lowest-HP aid may heal a sleeping third member; no late perk after a partner falls mid-hit',async()=>{
 const f=fixture('garden'),third={id:'third',speciesId:'slime',currentHp:1,maxHp:1000,currentMp:0,maxMp:100};f.b.party.push(third);f.b.allyAilments.third=[{id:'sleep',turns:2}];await activate(f);assert.equal(f.calls.heals.find(h=>h.rate===.08)?.id,'third');
 const g=fixture('wisteria');g.status('poison');g.env.hit=async()=>{g.members[1].currentHp=0;return 10;};await g.go(0);assert.equal(effectValue(g.b,g.foes[0].id,'healDown','enemy'),0);assert.deepEqual(g.b.pairSynergy409.stats,{});
});

test('pair discount agrees between MP affordability, battle skill buttons and enemy native AI',async()=>{
 const {createMonster,calculatedStats}=await import('../src/models/Monster.js'),{maxMp,learnedSkills,canUseSkill,effectiveSkillMpCost}=await import('../src/battle/SkillSystem.js'),{BattleScreen}=await import('../src/ui/screens/BattleScreen.js'),{SPECIES}=await import('../src/data/species.js'),{chooseChapterTwoAction383}=await import('../src/chapterTwo/ChapterTwoMonsters383.js');
 const f=fixture('twinthunder');await activate(f);
 f.b.party=f.p.members.map((id,i)=>{const m=createMonster(id,{level:1500});m.id='ally'+i;m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);return m;});
 const actor=f.b.party[0],skill=learnedSkills(actor).find(s=>s.power>0),base=effectiveSkillMpCost(actor,skill),cost=effectiveSkillMpCost(actor,skill,f.b);assert.equal(cost,Math.ceil(base*.9));actor.currentMp=cost;assert.equal(canUseSkill(actor,skill,0),false);assert.equal(canUseSkill(actor,skill,0,f.b),true);
 Object.assign(f.b,{species:SPECIES,enemy:f.foes[0],targetEnemyId:f.foes[0].id,skillMenu:true,turnQueue:[{id:actor.id,type:'ally'}],queueIndex:0,guards:{}});
 const html=BattleScreen(f.b,{},{}),button=html.match(new RegExp('<button[^>]+data-skill-id="'+skill.id+'"[^>]*>[\\s\\S]*?</button>'))?.[0];assert.ok(button);assert.ok(!button.slice(0,button.indexOf('>')).includes('disabled'));assert.ok(button.includes('MP '+cost));
 const g=fixture('twinthunder','enemy');await activate(g);const enemy=g.members[0],authored=SPECIES[enemy.speciesId].authoredSkills.find(s=>s.power>0),enemyCost=P.pairSkillCost409(g.b,enemy,authored,authored.mp,'enemy');enemy.currentMp=enemyCost;enemy.chapterTwoCooldowns383=Object.fromEntries(SPECIES[enemy.speciesId].authoredSkills.filter(s=>s.id!==authored.id).map(s=>[s.id,99]));
 assert.equal(chooseChapterTwoAction383(enemy,{allies:g.members,opponents:g.foes,battle:g.b}),authored.id);
});
