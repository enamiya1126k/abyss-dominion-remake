import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import * as C from '../src/core/MagicCircleSystem.js';
const main=fs.readFileSync('src/main.js','utf8'),view=fs.readFileSync('src/ui/screens/BattleScreen.js','utf8');
function fn(src,name){const a=src.indexOf('function '+name+'('),b=src.indexOf('\nfunction ',a+1);assert.ok(a>=0&&b>a);return src.slice(a,b);}
const ctx=vm.createContext({battle:{auto:true,busy:true},save:{state:{settings:{autoBattle:true,exploreAutoMode:'floor'}},save(){}},showToast(){},renderBattle(){},continueBattleFlow(){}});
const a=main.indexOf('toggleBattleAuto=()=>{'),b=main.indexOf('\n };',a);vm.runInContext('const '+main.slice(a,b+4),ctx);vm.runInContext('toggleBattleAuto()',ctx);
assert.equal(ctx.save.state.settings.autoBattle,false);assert.equal(ctx.save.state.settings.exploreAutoMode,'floor');
for(const line of main.split('\n').filter(l=>l.includes('auto:')&&(l.includes('battle={')||l.includes('const battleOptions=')))){
 const expr=line.match(/\bauto:(.*?),explorationAuto/)?.[1]??line.match(/\bauto:(.*?)\};/)?.[1];assert.ok(expr);
 for(const explorationAuto of [false,true]){Object.assign(ctx,{explorationAuto,options:{explorationAuto},data:{auto:true}});assert.equal(vm.runInContext(expr,ctx),false);}
}
vm.runInContext('toggleBattleAuto()',ctx);assert.equal(ctx.save.state.settings.autoBattle,true);
const close={},inventory={potions:9};ctx.document={getElementById:()=>close};ctx.battle.itemMenu=true;ctx.inventory=inventory;vm.runInContext(main.split('\n').find(l=>l.includes('const closeItem=document')),ctx);close.onpointerdown({button:0,preventDefault(){},stopPropagation(){}});assert.equal(ctx.battle.itemMenu,false);assert.equal(inventory.potions,9);
const ui=vm.createContext({itemIcon:()=>'<img>',battleInteger:Number,battleParty:()=>[]});for(const name of ['renderItems','renderItemPanel','renderOnlineItems'])vm.runInContext(fn(view,name),ui);
for(const html of [ui.renderItems({potions:99,manaPotions:1}),ui.renderItems({}),ui.renderOnlineItems({onlineItemCharges:2}),ui.renderOnlineItems({onlineItemTargetMenu:true})]){assert.ok(html.indexOf('id="close')<html.indexOf('class="skill-command-list'));assert.equal((html.match(/id="close/g)||[]).length,1);}
const circle=C.MAGIC_CIRCLES.find(c=>c.id!=='none').id;
function state(){return {player:{gold:0,homePartySlots:['a','b']},party:['a','b'],equipment:[],monsters:[{id:'a',equipment:{},level:10,total:100},{id:'b',equipment:{},level:20,total:200},{id:'c',equipment:{},level:30,total:300}],magicCircles:{version:999,unlocked:{[circle]:true},instances:[{instanceId:'mc:test:one',circleId:circle,level:2},{instanceId:'mc:test:two',circleId:circle,level:10},{instanceId:'mc:test:three',circleId:circle,level:8}]}};}
const s=state();C.equipMagicCircle(s,s.monsters[1],'mc:test:two');C.autoEquipMagicCircle(s,s.monsters[0]);assert.equal(s.monsters[0].magicCircleInstanceId,'mc:test:three');assert.equal(s.monsters[1].magicCircleInstanceId,'mc:test:two');C.autoEquipMagicCircle(s,s.monsters[0]);assert.equal(s.monsters[0].magicCircleInstanceId,'mc:test:three');assert.equal(s.magicCircles.instances.length,3);
function harness(s){const h=vm.createContext({...C,save:{state:s,save(){}},captureVitalSnapshot:()=>({}),restoreVitalSnapshot(){},preserveVitals(){},calculatedStats:()=>({}),maxMp:()=>1,totalExperience:m=>m.total,applyTotalExperience:(m,n)=>m.total=n,emptyEquipmentLoadout:()=>({}),normalizeEquipmentState(){},render(){},confirm:()=>true,alert(){},displayName:m=>m.id});for(const name of ['replacePartyMember','unequipMonsterAll','autoEquipMonster'])vm.runInContext(fn(main,name),h);return h;}
const h=harness(s);h.unequipMonsterAll('a',false);assert.equal(s.monsters[0].magicCircleInstanceId,null,'circle-only unequip');assert.equal(s.monsters[1].magicCircleInstanceId,'mc:test:two');
h.autoEquipMonster('a');assert.equal(s.monsters[0].magicCircleInstanceId,'mc:test:three');
assert.equal(h.replacePartyMember('a','c',true),true);assert.equal(s.monsters[2].magicCircleInstanceId,'mc:test:three');assert.equal(s.monsters[0].magicCircleInstanceId,null);assert.equal(s.monsters[2].total,100);assert.equal(s.monsters[0].total,300);assert.equal(s.magicCircles.instances.length,3);
for(const id of s.party)h.unequipMonsterAll(id,false);assert.ok(s.monsters.every(m=>!m.magicCircleInstanceId));
const locked=state();locked.magicCircles.unlocked={};C.autoEquipMagicCircle(locked,locked.monsters[0]);assert.equal(locked.monsters[0].magicCircleInstanceId,null);
const plain=state();C.equipMagicCircle(plain,plain.monsters[0],'mc:test:one');harness(plain).replacePartyMember('a','c',false);assert.equal(plain.monsters[2].magicCircleInstanceId,null);assert.equal(plain.magicCircles.instances.length,3);
// Execute the actual picker filter, including a stale missing equippedBy pointer.
const expression=main.match(/const candidates=save.state.equipment.filter\((item=>canEquipInSubslot\(item,target,subslot\).*?)\)\.sort/)[1];
const eq=[{id:'current'},{id:'other',equippedBy:'b'},{id:'free'},{id:'wrong',slot:'bad'}],filter=vm.runInNewContext('('+expression+')',{target:{id:'a'},subslot:'accessoryFinger',equippedIds:new Set(['current']),canEquipInSubslot:i=>i.slot!=='bad'});
assert.deepEqual(eq.filter(filter).map(i=>i.id),['free']);
console.log('PASS: auto OFF persistence/resume, four item panels and touch close, circle auto equip/no stealing/locked exclusion/individual and party removal, inherit/plain swap with EXP preserved, equipped-item picker exclusion.');
