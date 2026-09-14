import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {ROLE_GUIDE436,roleRoster436,roleCandidates436,roleDetail436,roleResult436} from '../src/ui/RoleGuide436.js';
import {motherSkillSummary436,skillReadingMs436,holdSkillBanner436} from '../src/ui/SkillGuide436.js';
import {MOTHER_LAWS424} from '../src/primordial/Dial424.js';
import {createMonster} from '../src/models/Monster.js';
import {allSpeciesSkills} from '../src/battle/SkillSystem.js';
const make=(id,level=1500)=>createMonster(id,{level});
const state=()=>({player:{gold:999,crystals:19012},monsters:[make('ch2_shion'),make('ch2_suiren'),make('ch2_nevia'),make('ch2_noelle'),make('slime')],party:[],equipment:[]});
test('role filters use real effect fields, not names, AI tags or conditional bonuses',()=>{
 const s=state(),rows=roleRoster436(s),anti=roleCandidates436(rows,'healDown');assert.ok(anti.some(r=>r.monster.speciesId==='ch2_shion'));assert.ok(!anti.some(r=>r.monster.speciesId==='ch2_suiren'));
 for(const entry of anti)for(const r of entry.matches)assert.ok(r.skill.effects.some(e=>e.kind==='healDown'&&e.enemy));
 const cfg=ROLE_GUIDE436.find(r=>r.id==='healDown');assert.equal(cfg.match({name:'回復禁止',description:'回復量低下',bonusVsEffect:{kind:'healDown'},ai383:'healBlock'}),false);assert.ok(!roleCandidates436(rows,'revive').some(r=>r.monster.speciesId==='slime'));
});
test('viewing every role, detail and filter leaves all save fields unchanged',()=>{
 const s=state(),before=structuredClone(s),rows=roleRoster436(s);for(const role of ROLE_GUIDE436)for(const r of roleCandidates436(rows,role.id)){roleDetail436(r,role.id);roleResult436(r,role.id);}assert.deepEqual(s,before);
});
test('learned and equipped skills are distinguished, with locked skills and exact unlock level',()=>{
 const candidates=allSpeciesSkills('slime'),future=candidates.find(s=>(s.unlock?.value??1)>1);assert.ok(future);
 const m=make('slime',1);m.equippedSkills=[];m.skillLoadoutInitialized=true;const rows=roleRoster436({monsters:[m]})[0];assert.equal(rows.skills.find(r=>r.skill.id===future.id).learned,false);assert.equal(rows.skills.find(r=>r.skill.id===future.id).unlock,future.unlock.value);assert.ok(rows.skills.every(r=>!r.equipped));
 for(const role of ROLE_GUIDE436)assert.ok(roleCandidates436([rows],role.id,{learnedOnly:true}).every(r=>r.matches.every(s=>s.learned)));
});
test('real equipped weapon skills and endgame identity participate without granting unowned skills',()=>{
 const m=make('dark_knight');m.endgameBossId='ten_death';m.endgameFaction='tenGod';m.nickname='十神IV 死';m.skillLoadoutInitialized=true;m.equippedSkills=[];
 const own=roleRoster436({monsters:[m]});assert.ok(roleCandidates436(own,'healDown').some(r=>r.matches.some(s=>s.skill.name==='黄泉封じ・無帰門')));assert.ok(!own[0].skills.some(r=>r.skill.name==='不可逆終端'));
 Object.defineProperty(m,'_equipmentSkills',{value:[{id:'test-weapon',name:'装備の回復阻害',power:1,mp:12,type:'attack',equipmentGranted:true,effects:[{kind:'healDown',value:.25,turns:2,enemy:true}]}],enumerable:false});assert.ok(roleCandidates436(roleRoster436({monsters:[m]}),'healDown')[0].matches.some(r=>r.skill.id==='test-weapon'));
});
test('search is stable, escaped, and has an empty result without inventing a candidate',()=>{
 const s=state();s.monsters[0].nickname='<img src=x onerror=alert(1)>';const rows=roleRoster436(s),matches=roleCandidates436(rows,'healDown',{query:'幽符'});assert.ok(matches.length);assert.ok(roleResult436(matches[0],'healDown').includes('&lt;img'));assert.equal(roleCandidates436(rows,'healDown',{query:'存在しないキャラ'}).length,0);
});
test('mother description is based on the scaled projection, not the original 920% skill',()=>{
 const law=MOTHER_LAWS424.find(l=>l.name==='死神の迎え・終命'),s=motherSkillSummary436(law.info);assert.match(s,/184%/);assert.doesNotMatch(s,/920%/);assert.match(s,/防御50%無視/);assert.match(s,/現在HP15%/);assert.match(s,/35%以下/);
 assert.match(motherSkillSummary436(MOTHER_LAWS424[7].info),/回復3%・2ターン/);assert.match(motherSkillSummary436(MOTHER_LAWS424[0].info),/2ターン延長/);assert.match(motherSkillSummary436(MOTHER_LAWS424[9].info),/必中/);
});
test('reading hold is at least 3 wall-clock seconds for every speed and reattaches after arena replacement',async()=>{
 for(const speed of [.5,1,2,4])assert.ok(skillReadingMs436('死神の迎え',speed)>=3000);
 let time=0,arena={appendChild(el){el.parentNode=this;el.isConnected=true;}},active=true,removed=0,attached=0;
 const el={parentNode:arena,isConnected:true,classList:{add(){}},remove(){removed++;this.isConnected=false;}};
 await holdSkillBanner436(el,{getArena:()=>arena,isCurrent:()=>active,duration:3000,now:()=>time,delay:async ms=>{time+=ms;if(time===1000)arena={appendChild(el){attached++;el.parentNode=this;}};}});assert.equal(time,3220);assert.equal(attached,1);assert.equal(removed,1);
 time=0;await holdSkillBanner436(el,{getArena:()=>arena,isCurrent:()=>active,duration:3000,now:()=>time,delay:async ms=>{time+=ms;active=false;}});assert.ok(time<3000);
});
test('3000 owned characters can be filtered locally without changing save or skill data',()=>{
 const m=make('ch2_shion'),s={monsters:Array.from({length:3000},(_,i)=>({...m,id:'owned-'+i})),party:[]},before=JSON.stringify(s),start=performance.now();const rows=roleRoster436(s);assert.equal(roleCandidates436(rows,'healDown').length,3000);assert.equal(JSON.stringify(s),before);assert.ok(performance.now()-start<5000);
});
test('436 cache and import aliases include the new UI and art without touching frozen replay modules',()=>{
 const html=fs.readFileSync('index.html','utf8'),map=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports,assets=JSON.parse(fs.readFileSync('world-raid-offline436-assets.json'));
 for(const name of ['RoleGuide436','SkillGuide436','ChapterTwoGacha397'])assert.match(map['./src/ui/'+name+'.js'],name==='RoleGuide436'?/3\.1\.118-build439$/:/3\.1\.115-build436$/);
 assert.ok(assets.includes('./assets/ui/build436/summon-button.webp'));assert.ok(assets.includes('./src/Styles/build436-guides.css'));assert.ok(!Object.keys(map).some(k=>k.includes('/runtime430/')));assert.match(html,/ASSET_BUILD = "build439"/);
});
