// Local-only QA: production modules and exact native functions; no main startup,
// sockets, accounts or production data. Battle progression is covered in Node.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
import {WorldRaidCoordinator440} from '../../online-server/src/WorldRaidCoordinator440.js';
import {buildOnlinePartyProfile} from '../../src/ui/screens/OnlinePartyScreen.js';
import {sanitizeProfile} from '../../online-server/src/RoomStore.js';
import {run} from '../build430/native-harness.mjs';
import {MOTHER_ENEMY422,tuneMother422} from '../../src/primordial/Mother422.js';
import {createEnemyBattleState} from '../../src/battle/EnemyAI.js';import {SPECIES} from '../../src/data/species.js';
import {prepareMother426,createMotherChild426,MOTHER_SUMMON_POOL426} from '../../src/primordial/Cycle426.js';
const root=process.cwd(),boss=tuneMother422(createEnemyBattleState(SPECIES.ch2_ionea,{...MOTHER_ENEMY422,id:'mother433'},1));
const f=await run(['ten_life','ten_time','abyss_wrath','abyss_gluttony'],[],{inspect:true,level:4000,enemyUnits:[boss],battleOptions:{specialBattleType:'mother422',specialBattle:true,specialTitle:'第二章・原母イオネア',specialSubtitle:'原初の聖胎',battleTheme:'boss'}});
prepareMother426(f.b);const children=['slime','ten_life','ch2_ryune'].map(id=>{let first=true;return createMotherChild426(f.b,f.b.enemies[0],()=>{if(first){first=false;return(MOTHER_SUMMON_POOL426.indexOf(id)+.5)/MOTHER_SUMMON_POOL426.length;}return .5;});});
f.context.save.state.monsters.forEach((m,i)=>{m.endgameBossId=['ten_life','ten_time','abyss_wrath','abyss_gluttony'][i];m.summonTier=i<2?'十神':'深淵';});
const raidProfile=sanitizeProfile(buildOnlinePartyProfile(f.context.save.state)),raidSession={playerId:'AD-QA435',connected:true,profile:raidProfile},raidCoordinator=new WorldRaidCoordinator440({sessions:new Map([['AD-QA435',raidSession]]),send:()=>{},random:()=>.5});raidCoordinator.start(raidSession,{requestId:'local-qa435-start-0001',campaignId:raidCoordinator.ledger.state.current.id});const raidState=raidCoordinator.snapshot(raidSession.playerId);
const source=fs.readFileSync('src/main.js','utf8'),map=JSON.parse(fs.readFileSync('tools/build430/native-source-map.json','utf8'));
const imports=map.imports.map((e,i)=>`import * as import${i} from '${e.source.replace('./','/src/')}';\nconst {${e.specifiers.map(s=>`${s.imported}:${s.local}`).join(',')}}=import${i};`).join('\n');
const extra438=source.match(/const ONLINE_RAID_EXCHANGE_PRICES[\s\S]*?\n\}\);/)[0];
const functions=map.functions.map(e=>source.slice(e.start,e.end)).join('\n'),constants=map.constants.map(s=>'const '+s+';').join('\n');
const classes=source.split('\n').filter(line=>/^class (Entity|Camera)\b/.test(line)).join('\n');
const script="import {createMagicCircleInstance as qaCircle438,equipMagicCircle as qaEquipCircle438} from '/src/core/MagicCircleSystem.js';import {worldRaidRankingView429 as qaRanking438} from '/src/worldRaid/WorldRaidRankingView429.js';import {raidExchange432 as qaExchange438} from '/src/worldRaid/WorldRaidView432.js';import {raidResult432,raidHeader432,raidLobby432} from '/src/worldRaid/WorldRaidView432.js';import {worldRaidBattleView428} from '/src/worldRaid/WorldRaidView428.js';\n"+imports+'\n'+classes+'\n'+functions+'\n'+constants+'\n'+extra438+`\n
const fixture=await(await fetch('/fixture-data')).json(),TILE=88,app=document.querySelector('#app'),save={state:fixture.state,save:()=>true},audio={setScene(){},sfx(){}};
let game=null,battle=null,snapshot=null,activeEnemy=null,screen='campaignFinalFloor',campaignStoryPresenting=false,battleBiomePanelTimer=null,formationOrigin,navigationOrigin,detailNavigationOrigin,selected,skillTarget,skillSlotSelection,skillNavigationOrigin;
const explorationSpriteCache=new Map();let starts=[],stories=[];
render=()=>screen==='primordial422'?renderPrimordial422():renderCampaignFinalFloor();go=route=>{screen=route;render();};
showCampaignStoryReplaySequence=scenes=>stories.push(scenes.map(s=>s.id));
showToast=text=>window.lastToast434=text;
document.addEventListener('click',e=>{if(e.target.matches('[data-modal-dismiss]')){const m=e.target.closest('.game-modal');if(m._onDismiss)m._onDismiss();else m.remove();}});
startSpecialBattle=(entries,options)=>{starts.push({entries,options});game=null;const enemies=entries.map(makeBattleEnemy);battle={...structuredClone(fixture.battle),enemies,enemy:enemies[0],targetEnemyId:enemies[0].id,party:save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)),battleId:options.battleId,specialBattle:true,specialBattleType:options.type,specialTitle:options.title,specialSubtitle:options.subtitle,specialReturnScreen:options.returnScreen,priorVitals:options.priorVitals,turnQueue:[],queueIndex:0,auto:false};buildTurnQueue(battle);app.innerHTML=BattleScreen(battle,{},save.state.settings);mountBattleBossLayout(app.querySelector('.battle-screen'));};
window.qa434={field(position={x:10,y:15}){stopGame();battle=null;save.state.player.inRun=false;save.state.campaign100.finalCompleted=true;const r=royalState(save.state);Object.assign(r,{phase:'cleared',position,attempt:null});renderCampaignFinalFloor();},get game(){return game;},get state(){return save.state;},get starts(){return starts;},get stories(){return stories;},get battle(){return battle;},hero:openRoyalHero434,throne:openRoyalThrone360,finish:finishRoyalSolo434,point(index,name=false){const p={x:7+index*2,y:9},q=game.camera.world((p.x+.5)*TILE,name?(p.y+1)*TILE:(p.y+.9)*TILE-28*2.65),c=game.canvas,r=c.getBoundingClientRect();return{x:r.left+q.x*r.width/c.width,y:r.top+(q.y+(name?15:0))*r.height/c.height};}};

let powerRankingUi={state:null},onlinePartyController={selfId:'self',profile:{displayName:'えなみの冒険部隊'},connectionReady:true,capabilities:new Set(['powerRankingsV1'])},homeServerStatus={state:'online'};
const powerRankingSeason={};
const raidPresentation={roomState:{members:[{playerId:'AD-QA435',profile:fixture.raidProfile}]},selfId:'AD-QA435',selectedTarget:{raid:null},selectedAlly:{raid:null},skillMenu:{raid:false},itemMenu:{raid:false},itemTargetMenu:{raid:false},hpTrails:{raid:{}},presentationKoIds:{raid:new Set()}};
window.qa435={...window.qa434,
 mother(legacy=true){stopGame();battle=null;save.state.player.inRun=false;delete save.state.activeBattle;save.state.chapterTwo376={areaClears378:{4:1}};save.state.primordial422={phase:legacy?'victory':'cleared',cleared:true,position:{x:10,y:19},introRead:true,endingRead:!legacy,wins:1,serial:0,dialogues:{}};screen='primordial422';renderPrimordial422();},
 motherPoint(){const g=motherFieldHitBounds433({camera:game.camera,TILE,actor:{position:{x:7,y:14}},nameBounds:{left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity},padding:0}),r=game.canvas.getBoundingClientRect();return{x:r.left+(g.left+g.right)/2*r.width/game.canvas.width,y:r.top+(g.top+g.bottom)/2*r.height/game.canvas.height};},
 rank(){stopGame();battle=null;app.classList.remove('world-raid-active432');app.innerHTML='';const ids=['ten_life','myth_yori','myth_enami','abyss_wrath','ten_time','slime','myth_hide'];const entries=ids.map((id,i)=>({rank:i+1,playerId:i?'player'+i:'self',displayName:['えなみの冒険部隊','より','絶対に勝ちたいひで','紅蓮の旅人','十神の守り手','ぷるん','旅する魔術師'][i],icon:{speciesId:id,name:SPECIES[id]?.name??{ten_life:'十神III 生命',abyss_wrath:'深淵III 憤怒',ten_time:'十神I 時間'}[id]},power:[23889,21276,18762,12510,8932,5665,4710][i],maxFloor:100,online:i===0,lastSeenAt:Date.now(),lastSeen:Date.now()}));powerRankingUi.state={entries,total:7,serverNow:Date.now(),_receivedAt:Date.now()};app.insertAdjacentHTML('beforeend',Modal('戦力記録','','閉じる'));const m=topModal();m.dataset.powerRecordModal='1';openPowerRankingProfile=id=>window.selectedProfile435=id;renderCombatPowerRecordModal(m,'ranking');},
 gacha(){stopGame();battle=null;app.classList.remove('world-raid-active432');app.innerHTML='';save.state.gacha.firstTenUsed=true;openGacha();},
 raid(auto=true,menu=false){stopGame();battle=null;app.classList.add('world-raid-active432');const s=structuredClone(fixture.raidState);s.attempt.raid.autoPlayers=auto?['AD-QA435']:[];s.attempt.raid.phase='command';raidPresentation.skillMenu.raid=menu;app.innerHTML='<section class="world-raid428 world-raid432 is-battle432">'+raidHeader432('オフライン挑戦')+'<div class="raid-scroll432"><small class="raid-local432">結果は保存し、接続後に自動送信</small>'+worldRaidBattleView428(s,raidPresentation,{compact432:true})+'</div></section>';mountBattleBossLayout(app.querySelector('.battle-screen'));},
 lobby(count=2){stopGame();battle=null;app.classList.add('world-raid-active432');const s=structuredClone(fixture.raidState);s.remaining=0;s.attempt=null;const ts=Array.from({length:count},(_,i)=>({phase:'ready',ticket:{id:'local-'+i,day:s.day,issuedAt:s.serverNow,sequence:1,expiresAt:s.serverNow+86400000,campaign:s.campaign}}));const client={state:s,offline:{bank:()=>({tickets:Object.fromEntries(ts.map(t=>[t.ticket.id,t]))}),available:()=>ts,ready:()=>true,active:()=>null,time:()=>s.serverNow},connected:()=>true,supported:()=>true,getState:()=>save.state,transport:{},ranking429:{campaign:s.campaign,page:0,rows:[{rank:1,name:'えなみ',damage:6660443}],mine:{rank:1,damage:6660443}}};app.innerHTML='<section class="world-raid428 world-raid432">'+raidHeader432('オンライン')+'<div class="raid-scroll432">'+raidLobby432(client)+'</div></section>';},
 failSave(value){save.save=()=>!value;},
 get currentState(){return save.state;},get activeBattle(){return battle;}
};

window.qa436={...window.qa435,
 normalCount(){stopGame();battle=null;app.classList.remove('world-raid-active432');app.innerHTML='';openGachaCountPicker('monster');},
 chapterGacha(crystals=19012){stopGame();battle=null;app.classList.remove('world-raid-active432');app.innerHTML='';save.state.player.crystals=crystals;save.state.campaign100.finalCompleted=true;save.state.chapterTwo376={unlocked:true,started:true,introComplete:true,areaClears378:{4:1}};openChapterTwoGacha397();},
 role(explore=false){stopGame();battle=null;app.classList.remove('world-raid-active432');save.state.player.inRun=explore;formationOrigin=explore?'explore':'home';const ids=['ch2_shion','ch2_suiren','ch2_aure','ch2_noelle','ch2_viola','ch2_nevia','ch2_nephia','ch2_mirea'];save.state.monsters=ids.filter(id=>SPECIES[id]).map((id,i)=>createMonster(id,{level:i?1500:1}));const death=createMonster('dark_knight',{level:1500});death.endgameBossId='ten_death';death.endgameFaction='tenGod';death.summonTier='十神';death.nickname='十神IV 死';death.skillLoadoutInitialized=false;save.state.monsters.push(death);save.state.party=save.state.monsters.slice(0,4).map(m=>m.id);app.innerHTML=FormationScreen(save.state,{origin:formationOrigin});bindFormation();},
 motherBattle(speed=4){stopGame();app.classList.remove('world-raid-active432');battle=structuredClone(fixture.battle);battle.enemies=[battle.enemies[0]];battle.enemy=battle.enemies[0];battle.enemy._floorBossHpShield=96000;battle.enemy._floorBossHpShieldMax425=96000;battle.turn=3;battle.auto=true;battle.busy=true;save.state.settings.battleSpeed=speed;app.innerHTML=BattleScreen(battle,{},save.state.settings);mountBattleBossLayout(app.querySelector('.battle-screen'));},
 cue(){const law=motherLaw424(3);window.cueStarted436=performance.now();window.cueDone436=false;battleBanner(law.name,law.godName+'より発動','skill',720,battle.enemies[0],motherSkillSummary436(law.info)).then(()=>{window.cueDone436=true;window.cueElapsed436=performance.now()-window.cueStarted436;});},
 rerenderCue(){save.state.settings.battleSpeed=2;app.innerHTML=BattleScreen(battle,{},save.state.settings);mountBattleBossLayout(app.querySelector('.battle-screen'));},
 get state(){return save.state;},get battle(){return battle;}
};

window.qa437={...window.qa436,
 menu(kind='formation'){
  stopGame();battle=null;app.classList.remove('world-raid-active432');save.state.player.inRun=false;
  save.state.monsters=['ch2_noctelle','ch2_rucie','ch2_auriane','ch2_dracia'].map((id,i)=>createMonster(id,{level:[10000,6871,3752,3598][i]}));
  save.state.party=save.state.monsters.map(m=>m.id);save.state.reserveEquipment??=[];save.state.bossEquipmentVault??=[];normalizeEquipmentState();
  if(kind==='formation'){app.innerHTML=FormationScreen(save.state);formationOrigin='home';bindFormation();}
  else if(kind==='equipment')app.innerHTML=EquipmentScreen(save.state,save.state.party[0],{home:true});
  else app.innerHTML=SkillScreen(save.state,save.state.party[0]);
 },
 raid(auto=true,online=true){qa435.raid(auto);if(online){document.querySelector('.raid-local432')?.remove();document.querySelector('[data-world-connection]').textContent='オンライン';}const boss=document.querySelector('.raid-main-boss');boss.querySelector('.enemy-hp .bar-label').textContent='HP 99,988,295,077/100,000,000,000';mountBattleBossLayout(document.querySelector('.battle-screen'));},
 report(status='online',large=false){
  stopGame();battle=null;app.classList.add('world-raid-active432');const s=structuredClone(fixture.raidState),a=s.attempt;a.status='ended';a.raid.round=99;a.report={result:'limit',bossName:a.raid.name,damage:large?99988777666555:1071408,rounds:99};
  a.raid.performance432=Object.fromEntries(a.raid.players.map((p,i)=>[p.playerId,{damage:large?98765432109999:600000-i*130000,healing:i*34251,taken:45554-i*3454,revives:i?0:1,kills:i?0:2}]));
  const receipt=status==='accepted'?{status:'accepted'}:status==='expired'?{status:'expired'}:null;
  const client={state:s,localTicket430:status==='online'?null:'qa437-ticket',offline:{bank:()=>({tickets:{'qa437-ticket':{receipt}}})},getState:()=>save.state,contributionBody432:raid=>battleContributionBody(raidContributionSnapshot432(raidPresentation.roomState,raid)),ranking429:{campaign:{id:a.campaignId,provisional430:status==='pending'},mine:{rank:1}}};
  app.innerHTML='<section class="world-raid428 world-raid432">'+raidHeader432(status==='online'?'オンライン':'オフライン')+'<div class="raid-scroll432 raid-results432">'+raidResult432(client)+'</div></section>';
 },
 contribution(){const s={party:save.state.monsters,performance:Object.fromEntries(save.state.monsters.map((m,i)=>[m.id,{damage:200000-i*30000,healing:i*5000,taken:65543,revives:0,kills:i?0:1}]))};app.innerHTML=Modal('活躍表',battleContributionBody(s),'報酬を確認');}
};

let navigationClient438=null;
let equipmentTarget=null,equipmentFocusItemId=null,equipmentManage={editing:false,selected:new Set()},storyArchiveCategory='prologue';
const reset438=()=>{navigationClient438?.unmount();navigationClient438=null;stopGame();battle=null;app.classList.remove('world-raid-active432');app.innerHTML='';document.querySelectorAll('.game-modal').forEach(m=>m.remove());};
window.qa438={...window.qa437,
 setup(){qa437.menu('equipment');save.state.player.gold=47563551;save.state.player.crystals=10542;save.state.onlineParty??={};save.state.onlineParty.raidMaterials=289;save.state.records??={};save.state.records.combatPower={highest:26596};const ci=qaCircle438(save.state,'reincarnation',{level:7});qaEquipCircle438(save.state,save.state.monsters[0],ci.instanceId);save.state.equipment=['N','R','SSR','UR'].map(rarity=>createEquipment('weapon',{rarity}));equipmentTarget=save.state.party[0];skillTarget=equipmentTarget;},
 equipment(editing=false){reset438();equipmentManage.editing=editing;screen='equipment';navigationOrigin='home';render=()=>{app.innerHTML=EquipmentScreen(save.state,equipmentTarget,{home:true,editing:equipmentManage.editing,selected:equipmentManage.selected});bindEquipment();};render();},
 skills(){reset438();screen='skills';skillTarget=save.state.party[0];render=()=>{app.innerHTML=SkillScreen(save.state,skillTarget);bindSkills();};render();},
 monsters(){reset438();app.innerHTML=MonsterListScreen(save.state);},
 memory(){reset438();save.state.campaign100.finalCompleted=true;save.state.chapterTwo376={unlocked:true,started:true,introComplete:true,areaClears378:{4:1}};save.state.recentBattleMemory={entries:[{speciesId:'slime'}]};openMemoryArchiveHub();},
 notices(){reset438();openNoticeCenter();},
 idle(){reset438();openIdleReturnPreview();},
 power(){reset438();app.insertAdjacentHTML('beforeend',Modal('戦力記録','','閉じる'));const m=topModal();m.dataset.powerRecordModal='1';renderCombatPowerRecordModal(m,'own');},
 shop(){reset438();app.classList.add('world-raid-active432');app.innerHTML='<section class="world-raid428 world-raid432">'+raidHeader432('オンライン')+'<div class="raid-scroll432">'+qaExchange438(save.state,ONLINE_WEEKLY_RAID_REWARDS,ONLINE_RAID_EXCHANGE_PRICES)+'</div></section>';},
 ranking(){reset438();app.classList.add('world-raid-active432');const data={campaign:{id:'raid-1',sequence:1,bossName:'終焉融骸・アビス＝マルガ'},latestSequence:1,page:0,pageSize:20,total:3,mine:{rank:1,damage:11818655,share:.78},rows:[{rank:1,name:'えなみ',playerId:'self',damage:11818655},{rank:2,name:'より',playerId:'second',damage:2412950},{rank:3,name:'ひで',playerId:'third',damage:948547}]};app.innerHTML='<section class="world-raid428 world-raid432">'+raidHeader432('オンライン')+'<div class="raid-scroll432"><button data-raid-lobby432>‹ レイドへ戻る</button>'+qaRanking438(data,{connected:true,supported:true,playerId:'self'})+'</div></section>';},
 navigation(active=false){reset438();window.navSent438=[];const old=structuredClone(fixture.raidState);old.attempt.status=active?'active':'ended';old.attempt.report=active?null:{rounds:10,result:'limit',damage:1071408};let bank={tickets:{},cachedState:old};const transport={selfId:'AD-QA435',profile:fixture.raidProfile,connectionReady:true,ws:{readyState:1},capabilities:new Set(['worldRaidV1']),_handleMessage(){},_notifyServerAvailability(){},_send(type,payload){window.navSent438.push({type,...payload});return true;},startBackground(){},worldRaidOffline430:{bank:()=>bank,active:()=>null,available:()=>[],ready:()=>true,time:()=>Date.now(),flush(){},tick(){},cacheState(s){bank.cachedState=s;},write(b){bank=b;}}};navigationClient438=new WorldRaidClient428({transport,getState:()=>save.state});navigationClient438.mount(app);window.nav438=navigationClient438;},
 state:()=>save.state
};qa438.setup();window.ready438=true;

window.ready437=true;
window.ready435=true;window.ready436=true;



`;
const index=fs.readFileSync('index.html','utf8'),head=index.slice(0,index.indexOf('</head>')+7),tailStyles=[...index.slice(index.indexOf('</head>')).matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)].map(m=>m[0]).join('\n'),importMap=index.match(/<script type="importmap">[\s\S]*?<\/script>/)[0],types={'.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'};
http.createServer((req,res)=>{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(name==='/fixture-data'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({battle:f.b,state:f.context.save.state,children,raidState,raidProfile}));}
 if(name==='/'){res.setHeader('Content-Type','text/html');return res.end(head+'<body>'+tailStyles+importMap+'<main id="app"></main><script type="module" src="/fixture.js"></script></body>');}
 if(name==='/fixture.js'){res.setHeader('Content-Type','text/javascript');return res.end(script+'\n'+fs.readFileSync('tools/build439/browser-fixtures.js','utf8')+'\n'+fs.readFileSync('tools/build440/browser-fixtures.js','utf8'));}
 const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;return res.end('missing');}res.setHeader('Content-Type',types[path.extname(file)]??'application/octet-stream');fs.createReadStream(file).pipe(res);
}).listen(8440,'127.0.0.1',()=>console.log('Preview http://127.0.0.1:8440'));
