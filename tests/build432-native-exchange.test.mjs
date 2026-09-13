import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {run} from '../tools/build430/native-harness.mjs';import {SaveService} from '../src/services/SaveService.js';
const source=fs.readFileSync('src/main.js','utf8'),catalog=source.slice(source.indexOf('const ONLINE_RAID_EXCHANGE_PRICES='),source.indexOf('function onlinePartyPersistentState('));
async function fixture(){const {context:c}=await run(['slime'],['slime'],{inspect:true});vm.runInContext(catalog,c);c.save=new SaveService();c.save.state.onlineParty.raidMaterials=2000;return c;}
test('native raid exchange saves actual items and a unique circle only once',async()=>{
 const c=await fixture();let r=c.exchangeOnlineRaidReward('circle:zero-sovereign');assert.equal(r.ok,true,r.message);assert.equal(c.save.state.onlineParty.raidMaterials,1880);assert.equal(c.save.state.magicCircles.unlocked.raid_zero_sovereign,true);
 assert.equal(c.exchangeOnlineRaidReward('circle:zero-sovereign').ok,false);assert.equal(c.save.state.onlineParty.raidMaterials,1880);
 for(const kind of ['character:abyss-amalga','equipment:vajra-beast']){r=c.exchangeOnlineRaidReward(kind);assert.equal(r.ok,true,r.message);}
 const restored=new SaveService();assert.equal(restored.state.onlineParty.raidMaterials,1460);assert.equal(restored.state.monsters.some(m=>m.weeklyRaidBossId==='abyss-amalga'),true);assert.equal(restored.state.equipment.some(e=>e.weeklyRaidBossId==='vajra-beast'),true);
});
test('native exchange rolls back material, reward, codex and receipt when saving fails, then retries once',async()=>{
 const c=await fixture(),persist=c.save.save.bind(c.save);
 for(const kind of ['character:zero-sovereign','circle:vajra-beast','equipment:abyss-amalga']){const before=structuredClone(c.save.state);c.save.save=()=>false;assert.equal(c.exchangeOnlineRaidReward(kind).ok,false);assert.deepEqual(c.save.state,before);c.save.save=persist;const r=c.exchangeOnlineRaidReward(kind);assert.equal(r.ok,true,r.message);}
});
