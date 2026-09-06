import test from 'node:test';
import fs from 'node:fs';import vm from 'node:vm';
import assert from 'node:assert/strict';
import {validateGameMasterCode,applyGameMasterReward} from '../src/core/SerialCodeSystem.js';
import {GM_FINALE_PACK,prepareGmFinaleEquipment} from '../src/core/GmFinalePackSystem.js';
import {MONSTER_STORAGE_CAP} from '../src/core/config.js';
import {EQUIPMENT_LIMIT} from '../src/services/EquipmentStorage.js';
import {canEquipInSubslot,normalizeEquipmentLoadouts,assignEquipmentToSubslot} from '../src/services/EquipmentLoadoutSystem.js';
import {SaveService} from '../src/services/SaveService.js';
import {learnedSkills,allLearnedSkills} from '../src/battle/SkillSystem.js';
import {equipmentPower} from '../src/models/Equipment.js';
import {signatureEquipmentMatchesMonster,signatureSetState} from '../src/core/SignatureWeaponSystem.js';
function autoEquipGrantedParty(state){
 const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),start=source.indexOf('function autoEquipMonster('),end=source.indexOf('\nfunction unequipItem(',start);
 const context=vm.createContext({save:{state},canEquipInSubslot,assignEquipmentToSubslot,signatureEquipmentMatchesMonster,equipmentPower,autoEquipMagicCircle:()=>{},captureVitalSnapshot:()=>({}),restoreVitalSnapshot:()=>{},normalizeEquipmentState:()=>{normalizeEquipmentLoadouts(state);for(const m of state.monsters)prepareGmFinaleEquipment(state,m);}});
 vm.runInContext(source.slice(start,end),context);for(const id of state.party)context.autoEquipMonster(id);
}
const code='AD-GM-2G2A-9R6K';
const fresh=()=>({player:{gold:123,crystals:45,maxFloor:81,currentFloor:80,bossKills:{80:true}},inventory:{captureCrystals:6},monsters:[],equipment:[],party:['existing'],settings:{autoBattle:false},flags:{},gameMaster:{claimedAt:'old',progressPack356:{claimedAt:'lr-pack'}}});
test('GM 2G2A code authenticates independently of both old rewards and rejects altered codes',async()=>{
 const s=fresh();assert.equal((await validateGameMasterCode(s,'ad gm 2g2a 9r6k')).kind,'finalePack359');assert.equal((await validateGameMasterCode(s,code+'X')).ok,false);
 const before=JSON.stringify(s);assert.equal((await validateGameMasterCode(s,code)).ok,true);assert.equal(JSON.stringify(s),before);
});
test('four named contracts have legal complete dedicated sets and the intended four skills',()=>{
 const s=fresh(),before=structuredClone(s),result=applyGameMasterReward(s,'finalePack359');assert.equal(result.ok,true);
 assert.deepEqual(s.monsters.map(m=>m.endgameBossId),['ten_time','ten_life','abyss_gluttony','abyss_wrath']);assert.equal(s.monsters.filter(m=>m.summonTier==='十神').length,2);assert.equal(s.monsters.filter(m=>m.summonTier==='深淵').length,2);
 assert.equal(s.equipment.length,24);assert.equal(new Set(s.equipment.map(e=>e.id)).size,24);
 for(const key of ['party','settings','flags'])assert.deepEqual(s[key],before[key]);
 assert.ok(s.equipment.every(e=>e.equippedBy===null));s.party=s.monsters.map(m=>m.id);autoEquipGrantedParty(s);
 for(const m of s.monsters){assert.equal(m.level,1500);assert.equal(m.plus,10);assert.equal(Object.values(m.equipment).filter(Boolean).length,6);assert.equal(signatureSetState(s,m).pieces,6);
  for(const [slot,id]of Object.entries(m.equipment)){const e=s.equipment.find(e=>e.id===id);assert.ok(e);assert.equal(e.level,3000);assert.equal(e.plus,10);assert.equal(e.equippedBy,m.id);assert.equal(canEquipInSubslot(e,m,slot),true);}
  const derived=prepareGmFinaleEquipment(s,m);assert.ok(derived.stats.hp>m.currentHp);assert.ok(derived.maxMp>=m.currentMp);assert.equal(learnedSkills(m).length,4);assert.equal(learnedSkills(m).filter(s=>s.ultimate358).length,1);assert.ok(allLearnedSkills(m).some(s=>s.equipmentGranted));
 }
 assert.equal(s.player.gold,100000123);assert.equal(s.player.crystals,30045);assert.equal(s.inventory.captureCrystals,1006);
 for(const key of ['settings','flags'])assert.deepEqual(s[key],before[key]);for(const key of ['maxFloor','currentFloor','bossKills'])assert.deepEqual(s.player[key],before.player[key]);assert.equal(s.gameMaster.claimedAt,'old');assert.deepEqual(s.gameMaster.progressPack356,before.gameMaster.progressPack356);
});
test('full storage and repeated redemption are atomic no-ops',async()=>{
 for(const [key,count]of [['monsters',MONSTER_STORAGE_CAP-3],['equipment',EQUIPMENT_LIMIT-23]]){const s=fresh();s[key]=Array.from({length:count},()=>({id:'old'}));const before=JSON.stringify(s);assert.equal((await validateGameMasterCode(s,code)).ok,false);assert.equal(applyGameMasterReward(s,'finalePack359').ok,false);assert.equal(JSON.stringify(s),before);}
 const s=fresh();assert.equal(applyGameMasterReward(s,'finalePack359').ok,true);const before=JSON.stringify(s);assert.equal((await validateGameMasterCode(s,code)).ok,false);assert.equal(applyGameMasterReward(s,'finalePack359').ok,false);assert.equal(JSON.stringify(s),before);
});
test('real save reload preserves reserve contracts, loose sets, skill selections and claim',async()=>{
 const memory=new Map(),previous=globalThis.localStorage;globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
 try{const save=new SaveService(),floor=save.state.player.maxFloor,party=[...save.state.party];assert.equal(applyGameMasterReward(save.state,'finalePack359').ok,true);const record=save.state.gameMaster.finalePack359,loadouts=record.monsterIds.map(id=>save.state.monsters.find(m=>m.id===id).equippedSkills);assert.equal(save.save(),true);
  const reloaded=new SaveService();assert.equal(reloaded.loadFailed,false);assert.equal(reloaded.state.player.maxFloor,floor);assert.deepEqual(reloaded.state.party,party);assert.equal((await validateGameMasterCode(reloaded.state,code)).ok,false);
  for(const [i,id]of record.monsterIds.entries()){const m=reloaded.state.monsters.find(m=>m.id===id);assert.equal(m.endgameBossId,GM_FINALE_PACK.members[i].id);assert.equal(m.level,1500);assert.equal(m.plus,10);assert.deepEqual(m.equippedSkills,loadouts[i]);assert.equal(signatureSetState(reloaded.state,m).pieces,0);assert.equal(record.equipmentIds.filter(eid=>reloaded.state.equipment.some(e=>e.id===eid&&e.endgameBossId===m.endgameBossId)).length,6);}
  reloaded.state.party=[...record.monsterIds];autoEquipGrantedParty(reloaded.state);assert.equal(reloaded.save(),true);const equippedReload=new SaveService();for(const m of equippedReload.state.monsters.filter(m=>record.monsterIds.includes(m.id)))assert.equal(signatureSetState(equippedReload.state,m).pieces,6);
  memory.clear();assert.equal((await validateGameMasterCode(new SaveService().state,code)).ok,true);
 }finally{globalThis.localStorage=previous;}
});
