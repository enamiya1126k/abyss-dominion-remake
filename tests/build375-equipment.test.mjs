import test from 'node:test';
import assert from 'node:assert/strict';
import {compatibleSubslots,EQUIPMENT_SUBSLOTS} from '../src/data/equipment.js';
import {canEquipInSubslot,assignEquipmentToSubslot,normalizeEquipmentLoadouts} from '../src/services/EquipmentLoadoutSystem.js';
for(const [category,slots] of Object.entries(EQUIPMENT_SUBSLOTS))test(`${category}: old fixed slots accept both positions`,()=>{
 for(const fixed of slots){
  const item={id:'gear',slot:category,level:1,ruleOverrides:{subslot:fixed}};
  assert.deepEqual(new Set(compatibleSubslots(item)),new Set(slots));
  const m={id:'m',speciesId:'slime',level:100,equipment:{}},state={equipment:[item],monsters:[m],party:['m']};
  for(const slot of slots){
   assert.equal(assignEquipmentToSubslot(state,'gear','m',slot).ok,true);
   assert.equal(Object.values(m.equipment).filter(id=>id==='gear').length,1);
   const restored=JSON.parse(JSON.stringify(state));normalizeEquipmentLoadouts(restored);
   assert.equal(restored.monsters[0].equipment[slot],'gear');
  }
 }
});
test('level, owner and category restrictions remain',()=>{
 const m={id:'m',speciesId:'slime',level:1};
 assert.equal(canEquipInSubslot({slot:'armor',level:100},m,'armorSupport'),false);
 assert.equal(canEquipInSubslot({slot:'accessory',level:1},m,'armorSupport'),false);
 assert.equal(canEquipInSubslot({slot:'armor',level:1,ruleOverrides:{signatureOwnerId:'hero_enami'}},m,'armorBody'),false);
});
test('two separate pieces coexist; a piece moves between owners without duplication',()=>{
 const monsters=['a','b'].map(id=>({id,speciesId:'slime',level:100,equipment:{}}));
 const state={monsters,party:['a','b'],equipment:['x','y'].map(id=>({id,slot:'accessory',level:1,ruleOverrides:{subslot:'accessoryNeck'}}))};
 assert.equal(assignEquipmentToSubslot(state,'x','a','accessoryNeck').ok,true);
 assert.equal(assignEquipmentToSubslot(state,'y','a','accessoryFinger').ok,true);
 assert.equal(monsters[0].equipment.accessoryNeck,'x');assert.equal(monsters[0].equipment.accessoryFinger,'y');
 assert.equal(assignEquipmentToSubslot(state,'x','b','accessoryFinger').ok,true);
 assert.equal(monsters[0].equipment.accessoryNeck,null);
 assert.equal(monsters[1].equipment.accessoryFinger,'x');
});
