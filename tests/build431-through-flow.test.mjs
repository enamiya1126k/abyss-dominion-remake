import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {run} from '../tools/build430/native-harness.mjs';
import {fixture430} from '../tools/build430/offline-fixture.mjs';
import {WorldRaidCoordinator430} from '../online-server/src/WorldRaidCoordinator430.js';
import {WorldRaidOfflineClient430} from '../src/worldRaid/WorldRaidOfflineClient430.js';
import {WorldRaidRewardsClient429} from '../src/worldRaid/WorldRaidRewardsClient429.js';
import {claimWorldRaidReward429} from '../src/worldRaid/WorldRaidRewards429.js';
import {SaveService} from '../src/services/SaveService.js';
import {SAVE_KEY} from '../src/core/config.js';

test('native chest → save/reload → offline resume → late result → reward-save retry → server restart stays consistent',async()=>{
 localStorage.removeItem(SAVE_KEY);
 const native=await run(['slime'],['slime'],{inspect:true,floor:10}),c=native.context;
 let save=new SaveService();save.state=c.save.state;c.save=save;c.battle=null;c.snapshot=null;c.game={world:{treasureRoom:false,chests:[]},player:{path:[]},running:true};
 for(const name of ['persistExpeditionSnapshot','expeditionSnapshotFromGame','showExploreNotice','showToast','showChestRewardReveal'])c[name]=()=>{};
 save.state.settings.exploreAutoMode='off';c.exploreActionGeneration=1;save.state.player.openedChests[10]=[];
 const chest={id:'integrated-chest431',kind:'box',locked:false,open:false,mimic:false};assert.equal(c.openChest(chest),true);
 const chestInventory=structuredClone(save.state.inventory);save=new SaveService();c.save=save;
 assert.equal(c.openChest({...chest,open:false}),false);for(const [key,amount]of Object.entries(chestInventory))assert.equal(save.state.inventory[key],amount);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'raid-through431-')),file=path.join(dir,'world-raid.json'),f=fixture430({stateFile:file}),sent=[];
 let offline,rewards;
 const transport={selfId:f.a.playerId,profile:f.a.profile,connectionReady:true,ws:{readyState:1},capabilities:new Set(['worldRaidV1','worldRaidRewardsV1','worldRaidOfflineV1']),_handleMessage:()=>{},_notifyServerAvailability:()=>{},_send(type,payload){sent.push({type,...payload});return true;},startBackground:()=>{}};
 function attach(){
  transport._handleMessage=()=>{};
  rewards=new WorldRaidRewardsClient429({transport,onReward:(entry,id)=>claimWorldRaidReward429(save,entry,id)});
  offline=new WorldRaidOfflineClient430({transport,getBank:()=>save.state.onlineParty.worldRaidOffline430,setBank:bank=>{const previous=save.state.onlineParty.worldRaidOffline430;save.state.onlineParty.worldRaidOffline430=bank;if(save.save())return true;save.state.onlineParty.worldRaidOffline430=previous;return false;},now:f.now,prepare:async()=>({reload:true})});
 }
 const close=()=>{clearInterval(offline?.retry);clearTimeout(rewards?.timer);clearTimeout(rewards?.pageTimer);};
 try{
  attach();assert.equal(f.c.start(f.a,{requestId:'through-online-431001',campaignId:f.c.ledger.state.current.id}).ok,true);assert.equal(f.c.retreat(f.a,{attemptId:f.c.active(f.a.playerId).id,round:1}).ok,true);
  await offline.reserve(2,f.a.profile,f.c.ledger.state.current.id);const request=sent.find(m=>m.type==='worldRaidReserve430');assert.equal(f.c.reserve430(f.a,request).ok,true);
  await offline.receive(f.messages.at(-1));assert.equal(f.c.snapshot(f.a.playerId).remaining,0);const tickets=offline.available().map(e=>e.ticket.id);
  transport.connectionReady=false;await offline.start(tickets[0]);await offline.command(tickets[0],{kind:'advance',round:1});const partial=offline.view(tickets[0]);close();save=new SaveService();attach();
  assert.equal(offline.view(tickets[0]).damage,partial.damage);assert.equal(offline.active().ticket.id,tickets[0]);
  async function finish(id){let n=0;while(offline.active()&&n++<30){const v=offline.view(id);await offline.command(id,{kind:'advance',round:v.raid.round});}assert.equal(offline.bank().tickets[id].phase,'pending');}
  await finish(tickets[0]);await offline.start(tickets[1]);await finish(tickets[1]);
  const uploads=tickets.map(id=>({ticketId:id,commands:structuredClone(offline.bank().tickets[id].commands)}));assert.equal(sent.some(m=>m.type==='worldRaidSubmit430'),false);
  f.c.ledger.transact(s=>{s.current.hp=1;return {ok:true};});assert.equal(f.c.start(f.b,{requestId:'through-killer-431001',campaignId:f.c.ledger.state.current.id}).ok,true);const b=f.c.active(f.b.playerId);
  f.c.auto(f.b,{attemptId:b.id,round:1,enabled:false});assert.equal(f.c.action(f.b,{attemptId:b.id,round:1,kind:'attack',actorId:f.b.playerId,enemyTargetId:b.room.raid.boss.id}).ok,true);
  const nextHp=f.c.ledger.state.current.hp;assert.equal(f.c.ledger.state.current.sequence,2);assert.ok(f.c.ledger.state.history[0].closing430);assert.equal(Object.keys(f.c.ledger.state.rewards429).length,0);
  transport.connectionReady=true;offline.flush(true);assert.ok(sent.some(m=>m.type==='worldRaidSubmit430'));
  assert.equal(f.c.submit430(f.a,uploads[0]).ok,true);assert.equal(Object.keys(f.c.ledger.state.rewards429).length,0);
  // The first response is lost; replaying the saved request must not count again.
  assert.equal(f.c.submit430(f.a,uploads[0]).duplicate,true);assert.equal(f.c.submit430(f.a,uploads[1]).ok,true);assert.equal(f.c.ledger.state.current.hp,nextHp);
  assert.equal(f.c.ledger.state.history[0].killerId,f.b.playerId);assert.ok(f.c.ledger.state.history[0].settlement429);
  f.c.ticketList430(f.a);await offline.receive(f.messages.at(-1));assert.ok(tickets.every(id=>offline.bank().tickets[id].phase==='synced'));
  const packet=f.messages.findLast(m=>m.type==='worldRaidRewards429'&&m.id===f.a.playerId);assert.equal(packet.entries.length,1);const award=packet.entries[0];assert.equal(award.source.lastHit,false);
  const before=structuredClone(save.state),realSave=save.save.bind(save);save.save=()=>false;await rewards.receive(packet);assert.deepEqual(save.state,before);assert.equal(sent.some(m=>m.type==='worldRaidRewardAck429'),false);
  save.save=realSave;await rewards.receive(packet);const ack=sent.find(m=>m.type==='worldRaidRewardAck429');assert.ok(ack);assert.equal(save.state.player.gold,before.player.gold+award.reward.gold);assert.equal(save.state.player.crystals,before.player.crystals+award.reward.crystals);
  assert.equal(save.state.onlineParty.raidMaterials,(before.onlineParty.raidMaterials??0)+award.reward.raidMaterials);assert.equal(save.state.inventory.experienceItemsUltra,(before.inventory.experienceItemsUltra??0)+award.reward.experienceItemsUltra);
  close();save=new SaveService();attach();const receivedGold=save.state.player.gold;await rewards.receive(packet);assert.equal(save.state.player.gold,receivedGold);
  // The server restarts before it receives the acknowledgement.
  const restarted=new WorldRaidCoordinator430({stateFile:file,sessions:f.sessions,now:f.now});assert.equal(restarted.healthy(),true);assert.equal(restarted.submit430(f.a,uploads[0]).duplicate,true);assert.equal(restarted.handle(f.a,ack).ok,true);assert.equal(restarted.handle(f.a,ack).ok,true);
  assert.equal(restarted.snapshot(f.a.playerId).pendingRewards429,0);assert.equal(restarted.snapshot(f.a.playerId).remaining,0);assert.equal(restarted.ledger.state.current.hp,nextHp);
  c.save=save;const after=JSON.stringify(save.state.inventory);assert.equal(c.openChest({...chest,open:false}),false);assert.equal(JSON.stringify(save.state.inventory),after);assert.ok(save.state.onlineParty.worldRaidReceipts429[award.rewardId]);
 }finally{close();fs.rmSync(dir,{recursive:true,force:true});}
});
