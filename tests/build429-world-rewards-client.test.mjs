import test from 'node:test';import assert from 'node:assert/strict';
import {SaveService} from '../src/services/SaveService.js';
import {claimWorldRaidReward429,worldRaidRewardId429} from '../src/worldRaid/WorldRaidRewards429.js';
import {WorldRaidRewardsClient429} from '../src/worldRaid/WorldRaidRewardsClient429.js';
import {WorldRaidClient428} from '../src/worldRaid/WorldRaidClient428.js';
import {worldRaidRankingView429} from '../src/worldRaid/WorldRaidRankingView429.js';
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};globalThis.WebSocket={OPEN:1};
const self='AD-AAAA-AAAA',ledgerId='1234567890abcdef';
const entry=(sequence=1)=>({rewardId:worldRaidRewardId429(ledgerId,sequence,self),source:{kind:'worldRaid429',rewardVersion:1,ledgerId,sequence,playerId:self,rank:1,lastHit:true},reward:{raidMaterials:250,crystals:4200,gold:6200000,experienceItemsUltra:140}});
const transport=()=>({selfId:self,connectionReady:true,ws:{readyState:1},capabilities:new Set(['worldRaidV1','worldRaidRewardsV1']),sent:[],_handleMessage(){},_notifyServerAvailability(){},_send(type,payload){this.sent.push({type,...payload});return true;},startBackground(){}});
const close=b=>{clearTimeout(b.timer);clearTimeout(b.pageTimer);};

test('all four rewards and receipt survive a native SaveService reload, even after legacy receipt eviction',()=>{
 const save=new SaveService(),before={gold:save.state.player.gold,crystals:save.state.player.crystals,fragments:save.state.onlineParty.raidMaterials??0,packs:save.state.inventory.experienceItemsUltra??0};
 assert.equal(claimWorldRaidReward429(save,entry(),self).ok,true);const loaded=new SaveService();assert.equal(loaded.state.player.gold,before.gold+6200000);assert.equal(loaded.state.player.crystals,before.crystals+4200);assert.equal(loaded.state.onlineParty.raidMaterials,before.fragments+250);assert.equal(loaded.state.inventory.experienceItemsUltra,before.packs+140);
 loaded.state.onlineParty.claimedRewards=Array.from({length:2500},(_,i)=>'other'+i);loaded.save();const restored=new SaveService(),gold=restored.state.player.gold;assert.equal(claimWorldRaidReward429(restored,entry(),self).duplicate,true);assert.equal(restored.state.player.gold,gold);
});
test('a failed native save rolls back currency, packs, fragments and receipt together',()=>{
 const save=new SaveService(),before=JSON.stringify(save.state);const real=save.save.bind(save);save.save=()=>false;assert.equal(claimWorldRaidReward429(save,entry(2),self).ok,false);assert.equal(JSON.stringify(save.state),before);save.save=real;assert.equal(claimWorldRaidReward429(save,entry(2),self).ok,true);
});
test('a different account or malformed reward cannot mutate the local save',()=>{
 const save=new SaveService(),before=JSON.stringify(save.state);assert.equal(claimWorldRaidReward429(save,entry(3),'someone-else').ok,false);assert.equal(claimWorldRaidReward429(save,{...entry(3),reward:{...entry(3).reward,gold:-1}},self).ok,false);assert.equal(claimWorldRaidReward429(save,{...entry(3),reward:{...entry(3).reward,gold:Infinity}},self).ok,false);assert.equal(JSON.stringify(save.state),before);
});
test('queued duplicate deliveries commit once and acknowledge only after the save succeeds',async()=>{
 const t=transport(),save=new SaveService(),before=save.state.player.gold,events=[],real=save.save.bind(save);save.save=()=>{events.push('save');return real();};t._send=(type,payload)=>{events.push(type);t.sent.push({type,...payload});return true;};
 const b=new WorldRaidRewardsClient429({transport:t,onReward:e=>claimWorldRaidReward429(save,e,self)}),packet={type:'worldRaidRewards429',entries:[entry(4)],pending:1};
 t._handleMessage(packet,t.ws);t._handleMessage(packet,t.ws);await b.queue;assert.equal(save.state.player.gold,before+6200000);assert.equal(events[0],'save');assert.equal(events.filter(x=>x==='save').length,1);assert.equal(t.sent.filter(x=>x.type==='worldRaidRewardAck429').length,1);close(b);
});
test('failed local save sends no ack; re-delivery after recovery grants the pending reward',async()=>{
 const t=transport(),save=new SaveService(),real=save.save.bind(save),b=new WorldRaidRewardsClient429({transport:t,onReward:e=>claimWorldRaidReward429(save,e,self)});save.save=()=>false;const packet={type:'worldRaidRewards429',entries:[entry(5)],pending:1};t._handleMessage(packet,t.ws);await b.queue;assert.equal(t.sent.length,0);assert.ok(b.lastError);save.save=real;t._handleMessage(packet,t.ws);await b.queue;assert.equal(t.sent.at(-1).type,'worldRaidRewardAck429');close(b);
});
test('a lost ack response is cleared by an empty pending list; old sockets and unsupported servers are ignored',async()=>{
 const t=transport(),b=new WorldRaidRewardsClient429({transport:t,onReward:()=>({ok:true,duplicate:true})});t._handleMessage({type:'worldRaidRewards429',entries:[entry(6)],pending:1},{});await b.queue;assert.equal(t.sent.length,0);
 t._handleMessage({type:'worldRaidRewards429',entries:[entry(6)],pending:1},t.ws);await b.queue;assert.equal(b.awaiting.size,1);t._handleMessage({type:'worldRaidRewards429',entries:[],pending:0},t.ws);await b.queue;assert.equal(b.awaiting.size,0);assert.equal(b.timer,null);
 t.capabilities.clear();const count=t.sent.length;assert.equal(b.refresh(),false);assert.equal(t.sent.length,count);close(b);
});
test('ranking response IDs prevent late packets from reverting the selected boss or page',()=>{
 const t=transport(),c=new WorldRaidClient428({transport:t,getState:()=>({})});c.requestRanking429(1,0);const first=t.sent.at(-1).requestId;c.requestRanking429(2,1);const second=t.sent.at(-1).requestId;
 c.receiveRanking429({requestId:first,campaign:{sequence:1},page:0});assert.equal(c.ranking429,null);c.receiveRanking429({requestId:second,campaign:{sequence:2},page:1});assert.equal(c.ranking429.campaign.sequence,2);assert.equal(c.rankPage429,1);c.unmount();
});
test('ranking displays own off-page contribution, same-rank rules, rewards and escaped player names',()=>{
 const data={campaign:{sequence:2,bossName:'ボス',completedAt:100},latestSequence:3,total:40,totalDamage:100000,page:0,pageSize:20,rows:[{rank:1,name:'<img onerror=bad>',damage:100,lastHit:true}],mine:{rank:25,damage:12,share:.00012},myReward:{...entry(),breakdown:[{label:'参加報酬',reward:entry().reward}],acknowledgedAt:null}};
 const html=worldRaidRankingView429(data,{connected:true,supported:true,playerId:self,received:()=>true});assert.match(html,/25位/);assert.match(html,/12 ダメージ/);assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img onerror/);assert.match(html,/最後の一撃/);assert.match(html,/受取済み/);assert.match(html,/同ダメージは同順位/);assert.match(html,/data-world-sequence429="1"/);assert.match(html,/data-world-page429="1"/);
});

test('overlapping backlog pages do not burst duplicate acknowledgements even when ack replies arrive immediately',async()=>{
 const t=transport(),b=new WorldRaidRewardsClient429({transport:t,onReward:()=>({ok:true,duplicate:true})});t._send=(type,payload)=>{t.sent.push({type,...payload});if(type==='worldRaidRewardAck429')t._handleMessage({type:'worldRaidRewardAck429',rewardId:payload.rewardId,pending:0},t.ws);return true;};
 const packet={type:'worldRaidRewards429',entries:Array.from({length:20},(_,i)=>entry(100+i)),pending:20};t._handleMessage(packet,t.ws);t._handleMessage(packet,t.ws);await b.queue;assert.equal(t.sent.filter(m=>m.type==='worldRaidRewardAck429').length,20);close(b);
});
