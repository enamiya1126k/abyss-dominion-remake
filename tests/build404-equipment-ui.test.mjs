import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as Protection from '../src/services/EquipmentProtection404.js';
import * as Enhancement from '../src/services/EquipmentEnhancement.js';
import * as Details from '../src/ui/components/EquipmentDetails404.js';
import * as Crafting from '../src/services/EquipmentAffixCrafting.js';
import * as Affixes from '../src/data/equipmentAffixes.js';
import * as Equipment from '../src/data/equipment.js';
import {equipmentStatMultiplier,createEquipment} from '../src/models/Equipment.js';
import {equipmentVisual} from '../src/ui/components/EquipmentVisual.js';
import {equipmentLockManagerBody404} from '../src/ui/EquipmentLockManager404.js';
import {slotLabel} from '../src/services/EquipmentStorage.js';
import {SaveService} from '../src/services/SaveService.js';
import {ArmoryScreen} from '../src/ui/screens/InventoryScreen.js';
import {relicRewardMarkup394} from '../src/ui/ChapterTwoRelics394.js';
import {createVaultWeapon380} from '../src/chapterTwo/VaultGear380.js';

const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const item=(id,extra={})=>({id,name:'試験装備',slot:'accessory',rarity:'N',level:1,exp:0,plus:0,stats:{hp:10},affixes:[],...extra});
const state=items=>({equipment:items,monsters:[],player:{gold:12345,crystals:987},inventory:{captureCrystals:123}});
function fixture(){const data=new Map();globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};return new SaveService();}
function extract(from,to){const start=source.indexOf(from),end=source.indexOf(to,start);assert.ok(start>=0&&end>start);return source.slice(start,end);}
function mainContext(saveState){
 const context={...Equipment,...Enhancement,...Protection,...Details,...Affixes,...Crafting,equipmentVisual,slotLabel,pixelIcon:()=>'',save:{state:saveState,save:()=>true},weaponMasterySummary:()=>'',seriesMasterySummary:()=>'',equipmentManage:{selected:new Set()},showToast(){},render(){}};
 vm.createContext(context);return context;
}

test('bulk lock and unlock changes selected items only; favorites and affix locks stay independent',()=>{
 const a=item('a',{locked:false,favorite:true,affixes:[{id:'hpPct',value:4,locked:true}]}),b=item('b',{locked:true}),target=item('target',{locked:true}),s=state([a,b,target]),economy=JSON.stringify([s.player,s.inventory]);let saves=0;
 let result=Protection.applyEquipmentProtection404(s,['a','b','target','missing'],true,{excludeId:'target',persist:()=>{saves++;return true;}});
 assert.equal(result.count,1);assert.equal(saves,1);assert.equal(a.locked,true);
 result=Protection.applyEquipmentProtection404(s,['a','b','target'],false,{excludeId:'target'});
 assert.equal(result.count,2);assert.equal(a.favorite,true);assert.equal(a.affixes[0].locked,true);assert.equal(target.locked,true);
 result=Protection.applyEquipmentProtection404(s,['a'],false,{clearFavorites:true});
 assert.equal(result.favoritesCleared,1);assert.equal(a.favorite,false);assert.equal(JSON.stringify([s.player,s.inventory]),economy);
});
test('failed persistence rolls every changed lock back, including originally missing properties',()=>{
 for(const persist of [()=>false,()=>{throw new Error('quota');}]){
  const s=state([item('a'),item('b',{locked:false,favorite:true})]),before=JSON.stringify(s);
  assert.equal(Protection.applyEquipmentProtection404(s,['a','b'],true,{persist}).ok,false);
  assert.equal(JSON.stringify(s),before);
  s.equipment[0].locked=true;s.equipment[0].favorite=true;const lockedBefore=JSON.stringify(s);
  assert.equal(Protection.applyEquipmentProtection404(s,['a'],false,{clearFavorites:true,persist}).ok,false);
  assert.equal(JSON.stringify(s),lockedBefore);
 }
});
test('filtered bulk presets include locked gear, respect displayed rarity and exclude the enhancement target',()=>{
 const s=state([item('target',{locked:true}),item('a',{locked:true}),item('b',{locked:true,slot:'weapon'}),item('c',{locked:true,rarity:'N',rewardTier:'十神'}),item('d',{locked:false})]);
 const entries=Protection.equipmentLockEntries404(s,{slot:'accessory',status:'locked',targetId:'target'});
 assert.deepEqual(entries.map(i=>i.id),['a','c']);
 assert.deepEqual(Protection.equipmentLockPreset404(entries,'low'),['a']);
 assert.deepEqual(Protection.equipmentLockPreset404(entries,'none'),[]);
 const ui={slot:'accessory',status:'locked',rarity:'all',targetId:'target',selected:new Set(),clearFavorites:false};
 const html=equipmentLockManagerBody404(s,ui);
 assert.ok(html.includes('data-lock-item404="a"'));assert.ok(!html.includes('data-lock-item404="target"'));
 assert.ok(html.includes('equipment-lock404.png'));assert.ok(!html.includes('🔒'));
});
test('unlocking never makes equipped, favorited or permanent gear consumable, including stale equippedBy',()=>{
 const s=state([item('target'),item('free'),item('lock',{locked:true}),item('favorite',{favorite:true}),item('worn'),item('permanent',{ruleOverrides:{unsellable:true}})]);
 s.monsters=[{id:'m',equipment:{accessoryNeck:'worn'}}];
 assert.deepEqual(Enhancement.enhancementMaterialCandidates(s,'target').map(i=>i.id),['free']);
 const summary=Protection.equipmentMaterialSummary404(s,'target');assert.equal(summary.usable,1);assert.equal(summary.excluded,4);
 Protection.applyEquipmentProtection404(s,s.equipment.map(i=>i.id),false);
 assert.equal(Enhancement.enhancementMaterialCandidates(s,'target').length,2);
 for(const id of ['favorite','worn','permanent']){const before=JSON.stringify(s);assert.equal(Enhancement.consumeEquipmentMaterials(s,'target',[id]).ok,false);assert.equal(JSON.stringify(s),before);}
});
test('synthesis consumes a repeated ID once, preserves EXP rules and rejects stale selections atomically',()=>{
 const target=item('target'),material=item('material',{level:4,exp:15}),s=state([target,material,item('keep')]);
 const expected=Enhancement.equipmentMaterialExp(material,target),projected=Enhancement.projectEquipmentGrowth(target,expected);
 assert.equal(Enhancement.consumeEquipmentMaterials(s,'target',['material','missing']).ok,false);assert.equal(s.equipment.length,3);
 const result=Enhancement.consumeEquipmentMaterials(s,'target',['material','material','target']);
 assert.equal(result.amount,expected);assert.equal(result.materials.length,1);assert.equal(target.level,projected.level);assert.equal(target.exp,projected.exp);assert.equal(s.equipment.length,2);
});
test('actual save reload retains bulk-unlocked vault gear and its chosen favorite state',()=>{
 const save=fixture(),gear=createVaultWeapon380(0);save.state.equipment.push(gear);
 const result=Protection.applyEquipmentProtection404(save.state,[gear.id],false,{clearFavorites:true,persist:()=>save.save()});assert.equal(result.ok,true);
 const restored=new SaveService().state.equipment.find(i=>i.id===gear.id);
 assert.equal(restored.locked,false);assert.equal(restored.favorite,false);assert.equal(restored.level,gear.level);assert.equal(restored.name,gear.name);
});
test('reward details resolve actual art and scaled stats in all three storage locations without rolling affixes',()=>{
 const gear=item('reward',{name:'天穹の神鎧',slot:'armor',level:1500,plus:12,stats:{hp:8,spd:-2,def:12},fixedEffectText:'特殊効果あり',locked:true,iconAtlas:'armor',iconIndex:3});
 const receipt={id:gear.id,name:gear.name,rarity:'N',receipt:'予備BOXへ転送'},before=JSON.stringify(gear);
 for(const key of ['equipment','reserveEquipment','bossEquipmentVault']){
  const s={equipment:[],[key]:[gear]};assert.equal(Details.equipmentReceiptItem404(receipt,s),gear);
  const html=Details.equipmentReward404(receipt,s),stats=Details.equipmentPerformance404(gear);
  assert.ok(html.includes('armor-atlas.png'));assert.ok(html.includes('特殊効果あり'));assert.ok(html.includes('予備BOXへ転送'));
  assert.equal(stats.find(x=>x.label==='HP').value,Math.round(8*equipmentStatMultiplier(gear)));
  assert.ok(stats.some(x=>x.value<0));assert.equal(JSON.stringify(gear),before);
 }
 const noAffixes={...gear};delete noAffixes.affixes;Details.equipmentReward404(noAffixes,{equipment:[]});assert.equal(Object.hasOwn(noAffixes,'affixes'),false);
});
test('elite reward retains its circle reward while showing equipment details and optional notes',()=>{
 const gear=item('relic',{fixedEffectText:'ペア連携強化'}),s=state([gear]),spoils={relic:{id:'relic',name:gear.name,rarity:'LR',effect:'ペア連携強化'},circle:{name:'専用魔法陣',level:5}};
 const html=relicRewardMarkup394(spoils,s);assert.ok(html.includes('equipment-reward404'));assert.ok(html.includes('専用魔法陣'));assert.ok(html.includes('ペア連携強化'));
 assert.ok(!Details.equipmentReward404(item('plain'),state([])).includes('equipment-reward-notes404'));
});
test('forge diamonds use per-slot quality in order; unidentified slots avoid the generic empty class',()=>{
 const gear=item('forge',{rarity:'十神'}),s=state([gear]),context=mainContext(s);
 vm.runInContext(extract('function equipmentAffixCraftingBody(','function equipmentAffixCraftingModal('),context);
 let html=context.equipmentAffixCraftingBody(gear);assert.equal((html.match(/class="affix-forge-socket404 is-unidentified"/g)??[]).length,4);
 assert.ok(!html.includes('<i class="empty"'));assert.equal(gear.affixes.length,0);
 gear.affixes=['legendary','rare','rare','rare'].map((quality,i)=>({id:['hpPct','mpPct','atkPct','spdPct'][i],quality,value:10,locked:false}));
 html=context.equipmentAffixCraftingBody(gear);
 const colors=[...html.matchAll(/--socket-quality404:([^";]+)/g)].map(x=>x[1]);assert.deepEqual(colors,['#ffd45d','#64b5ff','#64b5ff','#64b5ff']);
});
test('synthesis presents all 149 usable materials, their art and the protection explanation',()=>{
 const target=item('target'),s=state([target,...Array.from({length:150},(_,i)=>item(`material${i}`,{locked:i===149}))]),context=mainContext(s);
 vm.runInContext(extract('function equipmentEnhancementBody(','function openEquipmentEnhancement('),context);
 const html=context.equipmentEnhancementBody(target);
 assert.equal((html.match(/data-equipment-material=/g)??[]).length,149);assert.ok(html.includes('material148'));assert.ok(!html.includes('data-equipment-material="material149"'));
 assert.ok(html.includes('equipment-material-art404'));assert.ok(html.includes('ロック中 1個'));assert.ok(html.includes('data-enhancement-lock404'));
});
test('armory cards display the custom lock badge exactly for locked items',()=>{
 const save=fixture();save.state.equipment=[createEquipment('weapon',{rarity:'N'}),createEquipment('armor',{rarity:'R'})];save.state.equipment[0].locked=true;
 let html=ArmoryScreen(save.state);assert.equal((html.match(/aria-label="ロック中"/g)??[]).length,1);assert.ok(html.includes('data-equipment-lock-manager404'));
 Protection.applyEquipmentProtection404(save.state,[save.state.equipment[0].id],false);html=ArmoryScreen(save.state);assert.equal((html.match(/aria-label="ロック中"/g)??[]).length,0);
});
test('real synthesis handler cancels without consuming, restores a failed save and commits one successful retry',()=>{
 const target=item('target'),material=item('material',{level:3,exp:12}),s=state([target,material]),context=mainContext(s),before=JSON.stringify(s);let latest,confirmed=false,saveOK=false,writes=0;
 const makeModal=()=>{
  const preview={},execute={},close={},lockButton={};let inputs=[];
  const body={scrollTop:0,set innerHTML(html){inputs=[...html.matchAll(/data-equipment-material="([^"]+)"/g)].map(match=>({dataset:{equipmentMaterial:match[1]},checked:false}));},querySelectorAll:selector=>selector==='[data-equipment-material]'?inputs:[],querySelector:()=>lockButton};
  return {isConnected:true,remove(){this.isConnected=false;},querySelector:selector=>({'.game-modal-body':body,'#enhancementPreview':preview,'#executeEquipmentEnhancement':execute,'[data-modal-primary]':close}[selector])};
 };
 Object.assign(context,{app:{insertAdjacentHTML(){latest=makeModal();}},topModal:()=>latest,confirm:()=>confirmed,completeContextGuide(){},preserveVitals(){},openEquipmentLockManager404(){}});
 context.save.save=()=>{writes++;return saveOK;};
 vm.runInContext(extract('function equipmentEnhancementBody(','function bulkSellEquipment('),context);
 context.openEquipmentEnhancement('target');
 const original=latest,body=original.querySelector('.game-modal-body'),input=body.querySelectorAll('[data-equipment-material]')[0],execute=original.querySelector('#executeEquipmentEnhancement');
 input.checked=true;input.onchange();assert.equal(execute.disabled,false);
 execute.onclick();assert.equal(JSON.stringify(s),before);assert.equal(writes,0);
 confirmed=true;execute.onclick();assert.equal(JSON.stringify(s),before);assert.equal(writes,1);assert.equal(execute.disabled,false);
 saveOK=true;execute.onclick();assert.equal(s.equipment.length,1);assert.ok(target.level>1);assert.equal(writes,2);assert.equal(original.isConnected,false);
 execute.onclick();assert.equal(writes,2);assert.equal(s.equipment.length,1);
});
