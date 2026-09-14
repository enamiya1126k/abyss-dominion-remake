import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
import{run,monster}from'../tools/build430/native-harness.mjs';
import{createSignatureEquipment,signatureWeaponGrantedSkill,signatureSetState}from'../src/core/SignatureWeaponSystem.js';
import{assignEquipmentToSubslot,normalizeEquipmentLoadouts,canEquipInSubslot}from'../src/services/EquipmentLoadoutSystem.js';
import{learnedSkills}from'../src/battle/SkillSystem.js';
import{buildOnlinePartyProfile}from'../src/ui/screens/OnlinePartyScreen.js';
import{savePlayerName}from'../src/core/PlayerNameSystem.js';
import{summonLevel439}from'../src/core/SummonLimits439.js';
import{fixture430}from'../tools/build430/offline-fixture.mjs';
import{WorldRaidCoordinator440}from'../online-server/src/WorldRaidCoordinator440.js';
import{bestAutoEquipment441}from'../src/core/AutoEquipment441.js';
async function equipmentFixture(){const f=await run(['ten_time','slime'],['zombie'],{inspect:true}),s=f.context.save.state,w=createSignatureEquipment('ten_time',0);w.level=1000;s.equipment=[w];s.player.inRun=false;return{f,s,w,owner:s.monsters[0],other:s.monsters[1]}}
test('foreign signature weapon survives normalization and reload with base stats but no unique skill, fixed effect or set effect',async()=>{
 const{f,s,w,owner,other}=await equipmentFixture();assert.ok(canEquipInSubslot(w,other,'weaponRight'));assert.ok(assignEquipmentToSubslot(s,w.id,other.id,'weaponRight').ok);f.context.normalizeEquipmentState();
 assert.equal(other.equipment.weaponRight,w.id);assert.ok(other._equipmentStats.matk>0);assert.equal(signatureWeaponGrantedSkill(w,other),null);assert.equal(other._equipmentSkills.length,0);assert.equal(signatureSetState(s,other,w).active,false);assert.equal(other._seriesCounts[w.series],undefined);for(const k of Object.keys(w.fixedEffects))assert.equal(other._equipmentAffixes[k]??0,0,k);
 const profile=buildOnlinePartyProfile(s,{monsterId:other.id}),row=profile.battleRoster.find(r=>r.monsterId===other.id);assert.ok(!row.skills.some(skill=>skill.id===w.grantedSkillId));
 const copy=JSON.parse(JSON.stringify(s));normalizeEquipmentLoadouts(copy);assert.equal(copy.monsters[1].equipment.weaponRight,w.id);
 assert.ok(assignEquipmentToSubslot(s,w.id,owner.id,'weaponRight').ok);f.context.normalizeEquipmentState();assert.ok(owner._equipmentSkills.some(skill=>skill.id===w.grantedSkillId));assert.equal(signatureSetState(s,owner,w).active,true);assert.equal(other.equipment.weaponRight,null);
});
test('party recommendation reserves signature for owner, even when non-owner is processed first',async()=>{
 const{f,s,w,owner,other}=await equipmentFixture();s.party=[other.id,owner.id];f.context.autoEquipMonster(other.id);assert.equal(w.equippedBy,null);f.context.autoEquipMonster(owner.id);assert.equal(w.equippedBy,owner.id);
 assignEquipmentToSubslot(s,w.id,other.id,'weaponRight');f.context.autoEquipMonster(owner.id);assert.equal(w.equippedBy,owner.id);assert.ok(!Object.values(other.equipment).includes(w.id));
});
test('very weak signature does not replace far stronger basic equipment',async()=>{const{w,owner}=await equipmentFixture();const strong={id:'normal',power:100};w.power=10;assert.equal(bestAutoEquipment441([w,strong],owner,i=>i.power).id,'normal');w.power=80;assert.equal(bestAutoEquipment441([w,strong],owner,i=>i.power).id,w.id)});
test('existing level rules and weapon category compatibility still apply',async()=>{const{w}=await equipmentFixture(),m=monster('slime',1);assert.equal(canEquipInSubslot(w,m,'weaponLeft'),true);assert.equal(canEquipInSubslot({...w,ruleOverrides:{},endgameBossId:null},m,'weaponLeft'),false);assert.equal(canEquipInSubslot(w,m,'armorBody'),false);});
test('gacha floor100 endpoints are 1000–2000 and 1000–1500, including malformed random inputs',()=>{const s={player:{maxFloor:100}};for(const type of['monster','equipment']){assert.equal(summonLevel439(s,type,()=>0),1000);assert.equal(summonLevel439(s,type,()=>1),type==='equipment'?2000:1500);for(const n of[-1,NaN,Infinity,.5,1]){const level=summonLevel439(s,type,()=>n);assert.ok(level>=1000&&level<=(type==='equipment'?2000:1500))}}});
test('raid builder uses configured player name independently of selected character and empty party',async()=>{const{ s,other}=await equipmentFixture();savePlayerName('えなみの部隊');assert.equal(buildOnlinePartyProfile(s).displayName,'えなみの部隊');assert.equal(buildOnlinePartyProfile(s,{monsterId:other.id}).displayName,'えなみの部隊');assert.equal(buildOnlinePartyProfile({...s,party:[]}).displayName,'えなみの部隊')});
test('authenticated ranking refresh replaces stale character name and persists without changing damage',()=>{const f=fixture430(),sent=[];const c=new WorldRaidCoordinator440({sessions:f.sessions,now:f.now,send:(id,m)=>sent.push(m)});c.ledger.transact(s=>{s.current.contribution[f.a.playerId]={name:'十神III 生命',damage:14550631,attempts:3};return{ok:true}});assert.ok(c.ranking429(f.a,{playerName441:'えなみ',page:0}).ok);const msg=sent.findLast(m=>m.type==='worldRaidRanking429');assert.equal(msg.rows[0].name,'えなみ');assert.equal(msg.rows[0].damage,14550631);assert.equal(c.ledger.state.current.contribution[f.a.playerId].name,'えなみ');});
