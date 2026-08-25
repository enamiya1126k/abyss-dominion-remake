import assert from 'node:assert/strict';
import fs from 'node:fs';
import {FLOOR_BOSS_CATALOG} from '../src/data/floorBosses.js';
const server=fs.readFileSync(new URL('../online-server/src/RoomStore.js',import.meta.url),'utf8');
assert.equal(FLOOR_BOSS_CATALOG.length,90,'階層ボスは90体');
const effects=new Set(FLOOR_BOSS_CATALOG.map(b=>b.domain?.effect).filter(Boolean));
assert.ok(effects.size>=80,`固有領域effectが十分に個別化されている: ${effects.size}`);
for(const boss of FLOOR_BOSS_CATALOG){assert.ok(boss.domain?.effect,`${boss.floor}F domain.effect`);assert.ok(Array.isArray(boss.actionIds)&&boss.actionIds.length===4,`${boss.floor}F 固有行動4種`)}
for(const token of ['floorBossDomain:definition.domain','floorBossPassive:definition.passive','_floorBossDomainPower(','_floorBossDomainOnDamaged(','_floorBossDomainRoundEnd(','domainFactor=this._floorBossDomainPower'])assert.ok(server.includes(token),`online domain parity hook: ${token}`);
console.log(`build224 online floor boss domain parity regression: OK (90 bosses / ${effects.size} domain effects)`);
