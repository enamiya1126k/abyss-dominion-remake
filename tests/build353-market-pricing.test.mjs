import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as M from '../src/core/SecretRoomSystem.js';
import {SPECIES} from '../src/data/species.js';
import {createMonster} from '../src/models/Monster.js';

const owned=()=>({player:{gold:1e14,currentFloor:35},monsters:[{id:'lead',level:100},{id:'reserve',level:220}],party:['lead'],inventory:{},equipment:[],reserveEquipment:[]});
function offer(level,price=1,speciesId='dream_eater',extra={}){
 const payload=createMonster(speciesId,{level,plus:0});
 return {id:`offer-${level}`,kind:'monster',payload,rarity:SPECIES[speciesId].rarity,price,referencePrice:1000,priceLabel:'商人の気まぐれ',priceTone:'bargain',powerGrade:'standard',...extra};
}
function room(state,offers){state.secretRooms={run:{id:'run',seed:123,startedAt:1},activeRoom:{id:'shop',floor:35,offers,recoveryPurchased:{}}};return M.activeSecretRoom(state);}

test('threshold uses the highest owned monster including reserves, with an inclusive +100 boundary for every rarity',()=>{
 const state=owned();assert.equal(M.darkMarketPlayerMaxLevel(state),220);
 for(const rarity of ['SR','SSR','UR','LR','神話']){
  assert.equal(M.darkMarketMonsterPriceFloor(220,320,rarity),0);
  assert.ok(M.darkMarketMonsterPriceFloor(220,321,rarity)>0);
 }
 assert.equal(M.darkMarketPlayerMaxLevel({monsters:[]}),1);
 assert.equal(M.darkMarketPlayerMaxLevel({monsters:[{level:NaN},{level:Infinity},{level:-1}]}),1);
});

test('existing unsold and mystery monsters get the minimum, while low-level mythic and equipment bargains survive',()=>{
 const state=owned(),myth=Object.values(SPECIES).find(s=>s.rarity==='神話'&&M.isDarkMarketMonsterAllowed(s));
 const original=[offer(638,90600),offer(769,472600,'abyss_reaper',{id:'mystery',mystery:true}),offer(10,1,myth.id),{id:'equipment',kind:'equipment',rarity:'SR',payload:{level:99999},price:1},offer(802,696350000,'frost_dryad'),offer(900,1,'dream_eater',{sold:true})];
 const current=room(state,original);
 assert.equal(current.offers[0].price,M.darkMarketMonsterPriceFloor(220,current.offers[0].payload,'SR'));
 assert.ok(current.offers[1].price>472600);assert.equal(current.offers[1].mystery,true);
 assert.equal(current.offers[2].price,1);assert.equal(current.offers[3].price,1);
 assert.equal(current.offers[4].price,696350000,'higher random quotes stay high');assert.equal(current.offers[5].price,1,'sold receipts are not repriced');
 const before=JSON.stringify(current);M.activeSecretRoom(state);assert.equal(JSON.stringify(state.secretRooms.activeRoom),before);
 const restored=JSON.parse(JSON.stringify(state));M.activeSecretRoom(restored);assert.deepEqual(restored.secretRooms.activeRoom,state.secretRooms.activeRoom);
});

test('higher levels and rarity increase minimums; even extreme levels remain safe integers',()=>{
 for(const max of [1,100,220,1000,5000]){
  let previous=0;
  for(const level of [max+101,Math.min(9999,max+500),9999]){
   const price=M.darkMarketMonsterPriceFloor(max,level,'SR');assert.ok(price>=previous);assert.ok(Number.isSafeInteger(price));previous=price;
  }
 }
 assert.ok(M.darkMarketMonsterPriceFloor(220,638,'SSR')>M.darkMarketMonsterPriceFloor(220,638,'SR'));
 assert.ok(M.darkMarketMonsterPriceFloor(220,{level:638,plus:5},'SR')>M.darkMarketMonsterPriceFloor(220,638,'SR'));
});

test('training into the +100 band restores the same random quote without rerolling stock',()=>{
 const state=owned();room(state,[offer(321,1)]);assert.ok(state.secretRooms.activeRoom.offers[0].price>1);
 state.monsters[1].level=221;assert.equal(M.activeSecretRoom(state).offers[0].price,1);
 state.monsters[1].level=220;assert.ok(M.activeSecretRoom(state).offers[0].price>1);
});

test('purchase enforces the corrected price before charging, and prevents duplicate purchases',()=>{
 const state=owned();room(state,[offer(638,90600)]);const price=state.secretRooms.activeRoom.offers[0].price;
 state.player.gold=90600;assert.equal(M.buyDarkMarketOffer(state,'offer-638').ok,false);assert.equal(state.player.gold,90600);assert.equal(state.monsters.length,2);
 state.player.gold=price+77;assert.equal(M.buyDarkMarketOffer(state,'offer-638').ok,true);assert.equal(state.player.gold,77);assert.equal(state.monsters.length,3);
 assert.equal(M.buyDarkMarketOffer(state,'offer-638').ok,false);assert.equal(state.player.gold,77);
});

test('new shops enforce the owned-level floor from creation and retain random non-monster pricing',()=>{
 for(const roll of [0,.1,.3,.6,.9,.999]){
  const state=owned(),shop=M.enterSecretRoom(state,`shop-${roll}`,35,()=>roll);
  for(const o of shop.offers.filter(o=>o.kind==='monster'))assert.ok(o.price>=M.darkMarketMonsterPriceFloor(220,o.payload,o.rarity,o.powerGrade));
  assert.ok(Object.values(shop.recoveryPrices).every(Number.isSafeInteger));
  const prices=()=>JSON.stringify({offers:state.secretRooms.activeRoom.offers.map(o=>[o.id,o.price,o.randomQuote353]),recovery:state.secretRooms.activeRoom.recoveryPrices});
  const saved=prices();M.activeSecretRoom(state);assert.equal(prices(),saved);
 }
 const cheap=M.enterSecretRoom(owned(),'cheap',35,()=>0),expensive=M.enterSecretRoom(owned(),'expensive',35,()=>.99);
 assert.equal(cheap.offers[0].price,1);assert.equal(cheap.recoveryPrices.highPotions,1);
 assert.ok(expensive.offers[0].price>1e9);assert.ok(expensive.recoveryPrices.highPotions>1e9);
});

test('recovery prices are saved, displayed and charged consistently, with stock limits intact',()=>{
 const state=owned();room(state,[]);const shop=state.secretRooms.activeRoom,price=shop.recoveryPrices.highPotions;
 state.player.gold=price*10+23;
 for(let i=0;i<10;i++)assert.equal(M.buyDarkMarketRecovery(state,'highPotions').item.price,price);
 assert.equal(state.inventory.highPotions,10);assert.equal(state.player.gold,23);assert.equal(M.buyDarkMarketRecovery(state,'highPotions').ok,false);
 const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),start=main.indexOf('function darkMarketBody('),end=main.indexOf('\nfunction darkMarketOfferDetail(',start);
 const ctx=vm.createContext({...M,save:{state}});vm.runInContext(main.slice(start,end),ctx);
 const html=ctx.darkMarketBody();assert.ok(html.includes('最高Lv.220＋100（Lv.320）'));assert.ok(html.includes(`${shop.recoveryPrices.partyPotions.toLocaleString()}G`));assert.ok(!html.includes('階層の3倍'));
});
