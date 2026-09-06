import test from 'node:test';
import assert from 'node:assert/strict';
import {validateGameMasterCode,applyGameMasterReward,GM_PROGRESS_PACK} from '../src/core/SerialCodeSystem.js';
import {SPECIES} from '../src/data/species.js';
import {MONSTER_STORAGE_CAP} from '../src/core/config.js';
import {canEquipInSubslot} from '../src/services/EquipmentLoadoutSystem.js';
import {SaveService} from '../src/services/SaveService.js';
const code='AD-GM-100F-LR4-7K9P';
const fresh=()=>({player:{gold:123,crystals:45,maxFloor:7,currentFloor:4,bossKills:{7:true}},inventory:{captureCrystals:6},monsters:[],equipment:[],party:['existing'],settings:{gmFloorUnlockMax:0},flags:{gameClear1000:false},gameMaster:{claimedAt:'old',floorUnlockMax:0}});
test('new GM code normalizes, rejects invalid codes and is independent of the old claim',async()=>{const s=fresh();assert.equal((await validateGameMasterCode(s,'ad gm 100f lr4 7k9p')).kind,'progressPack356');assert.equal((await validateGameMasterCode(s,code+'X')).ok,false);assert.equal((await validateGameMasterCode(s,'')).ok,false);});
test('grants four distinct LR at 1500, 24 usable LR pieces at 3000 and exact resources without changing progression',async()=>{
 const s=fresh(),before=structuredClone(s),validation=await validateGameMasterCode(s,code),result=applyGameMasterReward(s,validation.kind);assert.equal(result.ok,true);assert.equal(s.player.gold,100000123);assert.equal(s.player.crystals,30045);assert.equal(s.inventory.captureCrystals,1006);
 assert.equal(s.monsters.length,4);assert.equal(new Set(s.monsters.map(m=>m.speciesId)).size,4);
 for(const m of s.monsters){assert.equal(SPECIES[m.speciesId].rarity,'LR');assert.equal(m.level,1500);assert.equal(m.plus,10);assert.equal(m.equippedSkills.filter(Boolean).length,4);assert.ok(m.currentHp>0);assert.ok(m.currentMp>0);}
 assert.equal(s.equipment.length,24);for(const [i,e] of s.equipment.entries()){assert.equal(e.rarity,'LR');assert.equal(e.level,3000);assert.equal(e.plus,10);assert.equal(e.equippedBy,null);assert.equal(canEquipInSubslot(e,s.monsters[Math.floor(i/6)],e.ruleOverrides.subslot),true);}
 for(const key of ['party','settings','flags'])assert.deepEqual(s[key],before[key]);assert.equal(s.player.maxFloor,7);assert.equal(s.player.currentFloor,4);assert.deepEqual(s.player.bossKills,before.player.bossKills);assert.equal(s.gameMaster.claimedAt,'old');assert.equal(s.gameMaster.floorUnlockMax,0);
 const saved=JSON.stringify(s);assert.equal(applyGameMasterReward(s,'progressPack356').ok,false);assert.equal((await validateGameMasterCode(s,code)).ok,false);assert.equal(JSON.stringify(s),saved);
});
test('insufficient storage rejects all rewards without consuming the code, even when called directly',()=>{for(const [key,n] of [['monsters',MONSTER_STORAGE_CAP-3],['equipment',477]]){const s=fresh();s[key]=Array.from({length:n},()=>({id:'existing'}));const before=JSON.stringify(s);assert.equal(applyGameMasterReward(s,'progressPack356').ok,false);assert.equal(JSON.stringify(s),before);s[key]=[];assert.equal(applyGameMasterReward(s,'progressPack356').ok,true);}});
test('claim and level survive real SaveService save/load; fresh reset has no claim',async()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
 const save=new SaveService(),startFloor=save.state.player.maxFloor;assert.equal(applyGameMasterReward(save.state,'progressPack356').ok,true);assert.equal(save.save(),true);const reloaded=new SaveService();assert.equal(reloaded.loadFailed,false);assert.equal(reloaded.state.player.maxFloor,startFloor);assert.equal((await validateGameMasterCode(reloaded.state,code)).ok,false);for(const id of GM_PROGRESS_PACK.speciesIds)assert.equal(reloaded.state.monsters.find(m=>m.speciesId===id&&m.obtainedMethod==='serialCode')?.level,1500);
 memory.clear();assert.equal((await validateGameMasterCode(new SaveService().state,code)).ok,true);
});
