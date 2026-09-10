import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {SaveService} from '../src/services/SaveService.js';
import {SAVE_KEY} from '../src/core/config.js';
import {createMonster} from '../src/models/Monster.js';
import {chapterTwoState,recruitChapterTwoHeroes380,CHAPTER_TWO_HERO_IDS396} from '../src/chapterTwo/ChapterTwoSystem.js';
import {heroAlliancePresentation396,acknowledgeHeroAlliance396} from '../src/chapterTwo/HeroAlliance396.js';
import {heroAllianceBody396} from '../src/ui/HeroAlliance396.js';
import {monsterSpriteUrl} from '../src/ui/MonsterVisual.js';
import {validateSerialCode,applySerialReward,commitSerialRedemption,normalizeSerialCodeState,HERO_SERIAL_ENDED_MESSAGE396} from '../src/core/SerialCodeSystem.js';

const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
function fresh({intro=true}={}){
 const mem=new Map();globalThis.localStorage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};
 const save=new SaveService();if(intro){save.state.player.maxFloor=100;save.state.campaign100.finalCompleted=true;chapterTwoState(save.state).introComplete=true;}
 return{save,mem};
}
function ui(save){
 const buttons={close:{},formation:{}},modal={isConnected:true,classList:{add(){}},remove(){this.isConnected=false},querySelector:q=>q==='[data-modal-primary]'?buttons.close:q==='[data-hero-alliance-formation]'?buttons.formation:null};
 let present=false;const calls={render:0,formation:0,toast:0,insert:0,timers:[]};
 const c={save,game:null,battle:null,screen:'home',campaignStoryPresenting:false,heroAlliancePresentation396,acknowledgeHeroAlliance396,heroAllianceBody396,clearContextGuide(){},configureCampaignOutcomeModal(){},Modal:(title,body)=>title+body,app:{insertAdjacentHTML:(_,html)=>{calls.html=html;calls.insert++;present=true;modal.isConnected=true}},topModal:()=>modal,document:{querySelector:q=>q==='.hero-alliance396-modal'?present&&modal.isConnected?modal:null:c.blockedModal?{}:null},clearTimeout(){},setTimeout:f=>{calls.timers.push(f);return 1},requestAnimationFrame:f=>f(),render:()=>calls.render++,openFormationFromHome:()=>calls.formation++,showToast:()=>calls.toast++};
 vm.createContext(c);vm.runInContext(main.slice(main.indexOf('function chapterTwoCommit('),main.indexOf('let chapterTwoIntroTimer='))+main.slice(main.indexOf('let heroAllianceTimer396='),main.indexOf('function bindHome(){')),c);
 return{c,calls,modal,buttons};
}

test('legacy pending notice is retired on load without resetting possessions, currency, party or chapter progress',()=>{
 const {save}=fresh(),s=save.state;s.player.gold=123456;s.player.crystals=4567;s.migrationNotices.legacyCampaignReset={pending:true,detectedSchema:20,legacyMaxFloor:912,dismissedAt:null};s.lastMigration={from:20};s.chapterTwo376.areaClears378[0]=1;s.campaign100.reincarnation319.available=true;
 const ids=s.monsters.map(m=>m.id),party=[...s.party],equipment=s.equipment.map(e=>e.id),campaign=JSON.stringify(s.campaign100);assert.ok(save.save());
 const loaded=new SaveService();assert.equal(loaded.state.migrationNotices.legacyCampaignReset.pending,false);assert.equal(loaded.state.migrationNotices.legacyCampaignReset.retiredBuild,396);assert.equal(loaded.state.migrationNotices.legacyCampaignReset.detectedSchema,20);assert.equal(loaded.state.player.gold,123456);assert.equal(loaded.state.player.crystals,4567);assert.deepEqual(loaded.state.party,party);assert.deepEqual(loaded.state.monsters.map(m=>m.id),ids);assert.deepEqual(loaded.state.equipment.map(e=>e.id),equipment);assert.equal(JSON.stringify(loaded.state.campaign100),campaign);assert.equal(loaded.state.chapterTwo376.areaClears378[0],1);assert.equal(new SaveService().state.migrationNotices.legacyCampaignReset.pending,false);
});
test('old reset notice has no UI or trigger; intentional settings reset remains guarded',()=>{
 assert.doesNotMatch(main,/showLegacyCampaignResetPrompt|data-legacy-campaign-reset|初期化を強くおすすめ|初期化して最初から始める/);
 assert.match(main,/async function requestFullGameReset/);assert.match(main,/runConfirmedFullReset/);
 assert.doesNotMatch(fs.readFileSync(new URL('../src/Styles/build321-polish.css',import.meta.url),'utf8'),/legacy-campaign-reset/);
});
test('unreadable saved data is retained instead of reset or overwritten',()=>{
 const {mem}=fresh({intro:false});mem.set(SAVE_KEY,'{broken');const old=console.error;console.error=()=>{};
 try{const s=new SaveService();assert.equal(s.loadFailed,true);assert.equal(s.save(),false);assert.equal(mem.get(SAVE_KEY),'{broken');}finally{console.error=old;}
});
test('chapter one and unfinished introduction do not get alliance UI, records, heroes or weapons',()=>{
 for(const mode of ['chapterOne','intro']){const {save}=fresh({intro:false});if(mode==='intro'){save.state.player.maxFloor=100;save.state.campaign100.finalCompleted=true;chapterTwoState(save.state);}
 const before=JSON.stringify(save.state);assert.equal(heroAlliancePresentation396(save.state),null);assert.equal(acknowledgeHeroAlliance396(save.state).ok,false);const {c,calls}=ui(save);assert.equal(c.maybeShowHeroAlliance396(),false);assert.equal(calls.insert,0);assert.equal(JSON.stringify(save.state),before);}
});
test('0–4 pre-owned heroes: grant only missing heroes and four weapons once; preserve trained heroes and formation',()=>{
 for(let n=0;n<=4;n++){
 const {save}=fresh();const s=save.state,trained=CHAPTER_TWO_HERO_IDS396.slice(0,n).map(id=>createMonster(id,{level:1600,plus:10}));s.monsters.push(...trained);const before=JSON.stringify(trained),party=[...s.party],gear=s.equipment.length;
 const result=recruitChapterTwoHeroes380(s);assert.ok(result.ok);assert.equal(result.joined.length,4-n);assert.equal(s.equipment.length,gear+4);assert.equal(JSON.stringify(trained),before);assert.deepEqual(s.party,party);
 for(const id of result.joined){const m=s.monsters.find(m=>m.id===id);assert.equal(m.level,1000);assert.equal(m.locked,true);}
 assert.equal(heroAlliancePresentation396(s).members.length,4);assert.equal(heroAlliancePresentation396(s).retrospective,false);assert.ok(save.save());const loaded=new SaveService();assert.equal(recruitChapterTwoHeroes380(loaded.state).ok,false);assert.equal(loaded.state.equipment.length,gear+4);assert.equal(heroAlliancePresentation396(loaded.state).members.length,4);
 }
});
test('old alliance receipt offers one retrospective presentation without any reward mutation',()=>{
 const {save}=fresh(),s=save.state;recruitChapterTwoHeroes380(s);delete s.chapterTwo376.alliance380.presentationVersion396;delete s.chapterTwo376.alliance380.presentationAcknowledged396;
 const old=JSON.stringify(s);const p=heroAlliancePresentation396(s);assert.equal(p.retrospective,true);assert.equal(JSON.stringify(s),old);assert.equal(recruitChapterTwoHeroes380(s).ok,false);assert.equal(JSON.stringify(s),old);
 assert.ok(acknowledgeHeroAlliance396(s).ok);assert.ok(save.save());const loaded=new SaveService();assert.equal(heroAlliancePresentation396(loaded.state),null);assert.equal(acknowledgeHeroAlliance396(loaded.state).ok,false);assert.equal(loaded.state.monsters.length,s.monsters.length);assert.equal(loaded.state.equipment.length,s.equipment.length);
});
test('an interrupted presentation resumes on reload, then manual dismissal persists once',()=>{
 const {save}=fresh();recruitChapterTwoHeroes380(save.state);save.save();const first=ui(save);assert.equal(first.c.maybeShowHeroAlliance396(),true);assert.equal(first.calls.timers.length,0);assert.equal(heroAlliancePresentation396(save.state).retrospective,false);
 const loaded=new SaveService(),second=ui(loaded);assert.equal(second.c.maybeShowHeroAlliance396(),true);second.buttons.close.onclick();second.buttons.close.onclick();assert.equal(second.calls.render,1);assert.equal(heroAlliancePresentation396(new SaveService().state),null);
});
test('failed acknowledgement save leaves dialog and pending receipt intact; retry succeeds without reward duplication',()=>{
 const {save}=fresh();recruitChapterTwoHeroes380(save.state);save.save();const {c,buttons,modal,calls}=ui(save),before=JSON.stringify(save.state),original=save.save.bind(save);c.maybeShowHeroAlliance396();save.save=()=>false;buttons.close.onclick();assert.equal(modal.isConnected,true);assert.equal(calls.render,0);assert.equal(JSON.stringify(save.state),before);assert.equal(calls.toast,1);
 save.save=original;buttons.close.onclick();assert.equal(modal.isConnected,false);assert.equal(calls.render,1);assert.equal(heroAlliancePresentation396(new SaveService().state),null);
});
test('failed initial recruitment save rolls back receipt, heroes and weapons; retry grants once',()=>{
 const {save}=fresh(),{c}=ui(save),before=JSON.stringify(save.state),original=save.save.bind(save);save.save=()=>false;
 assert.equal(c.chapterTwoCommit(()=>recruitChapterTwoHeroes380(save.state)).saveFailed,true);assert.equal(JSON.stringify(save.state),before);assert.equal(heroAlliancePresentation396(save.state),null);
 save.save=original;assert.ok(c.chapterTwoCommit(()=>recruitChapterTwoHeroes380(save.state)).ok);const after=JSON.stringify(save.state);assert.equal(c.chapterTwoCommit(()=>recruitChapterTwoHeroes380(save.state)).ok,false);assert.equal(JSON.stringify(save.state),after);
});
test('formation button opens existing editor once and never silently replaces the party',()=>{
 const {save}=fresh();recruitChapterTwoHeroes380(save.state);const party=[...save.state.party],{c,calls,buttons}=ui(save);c.maybeShowHeroAlliance396();buttons.formation.onclick();buttons.formation.onclick();assert.equal(calls.formation,1);assert.equal(calls.render,0);assert.deepEqual(save.state.party,party);assert.equal(heroAlliancePresentation396(new SaveService().state),null);
});
test('close icon / Escape dismissal uses the same persistent manual acknowledgement',()=>{
 const {save}=fresh();recruitChapterTwoHeroes380(save.state);const {c,modal,calls}=ui(save);c.maybeShowHeroAlliance396();modal._onDismiss();modal._onDismiss();assert.equal(calls.render,1);assert.equal(heroAlliancePresentation396(new SaveService().state),null);
});
test('dialog waits behind an active modal/story and never opens during battle or exploration',()=>{
 const {save}=fresh();recruitChapterTwoHeroes380(save.state);const {c,calls}=ui(save);for(const props of [{screen:'settings'},{battle:{}},{campaignStoryPresenting:true},{blockedModal:true}]){Object.assign(c,{screen:'home',battle:null,campaignStoryPresenting:false,blockedModal:false},props);assert.equal(c.maybeShowHeroAlliance396(),false);assert.equal(calls.insert,0);}
 Object.assign(c,{screen:'home',battle:null,campaignStoryPresenting:false,blockedModal:false});save.state.player.inRun=true;assert.equal(c.maybeShowHeroAlliance396(),false);save.state.player.inRun=false;save.state.activeBattle={};assert.equal(c.maybeShowHeroAlliance396(),false);delete save.state.activeBattle;assert.equal(c.maybeShowHeroAlliance396(),true);assert.equal(c.maybeShowHeroAlliance396(),true);assert.equal(calls.insert,1);
});
test('four named full-body sprites exist for all idle/motion frames; layout keeps four equal columns',()=>{
 const {save}=fresh();recruitChapterTwoHeroes380(save.state);const html=heroAllianceBody396(heroAlliancePresentation396(save.state));assert.equal((html.match(/<figure /g)??[]).length,4);for(const name of ['えなみ','より','ひで','りおん'])assert.ok(html.includes(name));
 for(const id of CHAPTER_TWO_HERO_IDS396)for(const frame of ['idle1','idle2','idle3','walk1','walk2','attack','damage','down']){const url=monsterSpriteUrl({speciesId:id},frame).split('?')[0];assert.ok(fs.existsSync(new URL('../'+url,import.meta.url)),url);}
 const css=fs.readFileSync(new URL('../src/Styles/build396-alliance.css',import.meta.url),'utf8');assert.match(css,/repeat\(4,minmax\(0,1fr\)\)/);assert.match(css,/object-fit:contain/);assert.match(css,/prefers-reduced-motion/);
});

const retired={mythicPackEnami:'348f49a6b5c31ff339d6509a8192cfc630d20b4172f727cacd4d928b6d8a42a3',mythicPackRion:'4d589a2841ebf423bc321b3b8e2b54591d37a0af404bd1ec96cb1d656cbd26ad',mythicPackYori:'ecd4a995b6a7ef734e498ff854e94953e0a5675b3df11748e60029e22a95de49',mythicPackHide:'9d5c12ceb74d9ad485bdd55dbdc12916cd52e36ed38bbfbbab40f4920687b2ab'};
test('all four hero serial hashes return the ended message before already-used or capacity checks, without mutation',async()=>{
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'crypto');
 try{for(const [rewardId,hash]of Object.entries(retired))for(const mode of ['new','used','full']){
 const {save,mem}=fresh(),s=save.state;if(mode==='used'){s.serialCodes={redeemed:{[rewardId]:{at:'old'}}};mem.set('abyss-dominion-serial-ledger-v1',JSON.stringify(s.serialCodes.redeemed));}if(mode==='full')s.monsters=Array(10000).fill({speciesId:'slime'});
 Object.defineProperty(globalThis,'crypto',{configurable:true,value:{subtle:{digest:async(_algo,bytes)=>{assert.equal(new TextDecoder().decode(bytes),'TESTHERO');return Uint8Array.from(Buffer.from(hash,'hex')).buffer;}}}});
 const before=JSON.stringify(s),storage=JSON.stringify([...mem]),result=await validateSerialCode(s,' test-hero ');assert.equal(result.ok,false);assert.equal(result.reason,'distributionEnded');assert.equal(result.message,HERO_SERIAL_ENDED_MESSAGE396);assert.equal(JSON.stringify(s),before);assert.equal(JSON.stringify([...mem]),storage);
 }}finally{if(descriptor)Object.defineProperty(globalThis,'crypto',descriptor);else delete globalThis.crypto;}
});
test('direct/stale hero redemption cannot add heroes, equipment, currency or a device receipt; existing assets survive',()=>{
 for(const rewardId of Object.keys(retired)){const {save,mem}=fresh(),s=save.state;recruitChapterTwoHeroes380(s);s.serialCodes={redeemed:{[rewardId]:{at:'old'}}};mem.set('abyss-dominion-serial-ledger-v1',JSON.stringify(s.serialCodes.redeemed));const before=JSON.stringify(s),storage=JSON.stringify([...mem]);assert.equal(applySerialReward(s,rewardId).message,HERO_SERIAL_ENDED_MESSAGE396);assert.equal(commitSerialRedemption(rewardId),false);assert.equal(JSON.stringify(s),before);assert.equal(JSON.stringify([...mem]),storage);normalizeSerialCodeState(s);assert.equal(s.serialCodes.redeemed[rewardId].at,'old');}
});
test('unrelated resource code still validates, grants, commits and blocks reuse',async()=>{
 const {save}=fresh();const code='AD-GM-CRYSTAL-10000';
 // Exercise the real SHA implementation using the same published code fixture as earlier releases.
 const oldTests=fs.readFileSync(new URL('v2.4.0-release-regression.mjs',import.meta.url),'utf8');
 const fixture=oldTests.match(/\["([^"]+)",\s*"crystals10000"/);
 const actual=fixture?.[1]??code;const validation=await validateSerialCode(save.state,actual);
 assert.equal(validation.ok,true,actual);assert.equal(validation.rewardId,'crystals10000');const before=save.state.player.crystals;assert.ok(applySerialReward(save.state,validation.rewardId).ok);assert.equal(save.state.player.crystals,before+10000);assert.ok(commitSerialRedemption(validation.rewardId));assert.equal((await validateSerialCode(save.state,actual)).ok,false);
});
