import{tuneFinalHero}from'../src/core/Postgame361System.js';
// Reference inventory -> native server combat resolvers and round-end processing.
// No browser UI, player items, magic circles, permanent tree bonuses or old wounds.
import {gmParty} from './build357-balance-simulation.mjs';
import {RoomStore,sanitizeProfile} from '../online-server/src/RoomStore.js';
import {createGmFinalePack,prepareGmFinaleEquipment} from '../src/core/GmFinalePackSystem.js';
import {applyCampaignHeroLoadout} from '../src/core/CampaignHeroLoadoutSystem.js';
import {learnedSkills,effectiveSkillMpCost} from '../src/battle/SkillSystem.js';
import {heroAuthoredSkills,HERO_ORDER} from '../src/core/HeroAllianceSystem.js';
import {prepareOnlineUltimates} from '../online-server/src/EndgameUltimateAdapter.js';
import {cleanupUltimateBattle} from '../src/core/EndgameUltimateSystem.js';

export function seededRandom(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
export function finaleFixture(seed=1,ids=HERO_ORDER,{legacyLR=false,stage=0}={}){
 const random=seededRandom(seed),pack=legacyLR?{monsters:gmParty(seededRandom(seed))}:createGmFinalePack(),store=new RoomStore({random}),players={};
 for(const [i,m]of pack.monsters.entries()){
  const derived=legacyLR?{stats:m.stats,maxMp:m.maxMp,signature:null}:prepareGmFinaleEquipment(pack,m),skills=learnedSkills(m).map(s=>({...s,mp:effectiveSkillMpCost(m,s)})),id=`gm:${i}`;
  const profile=sanitizeProfile({displayName:m.nickname,monsterName:m.nickname,speciesId:m.speciesId,visualSpeciesId:m.endgameBossId,endgameBossId:m.endgameBossId,level:m.level,attribute:m.attribute,battleStats:{...derived.stats,mp:derived.maxMp},skills,equipmentCombatEffects:m._equipmentAffixes,signatureResonance:{...derived.signature,active:true},maxFloor:100});
  const actor={playerId:id,id,ownerPlayerId:id,speciesId:m.speciesId,endgameBossId:m.endgameBossId,visualSpeciesId:m.endgameBossId,name:m.nickname,attribute:m.attribute,element:m.attribute,hp:derived.stats.hp,maxHp:derived.stats.hp,mp:derived.maxMp,maxMp:derived.maxMp,stats:{...derived.stats,mp:derived.maxMp},skills:profile.skills,equipmentCombatEffects:m._equipmentAffixes,signatureResonance:derived.signature,effects:[],cooldowns:{},guard:false,shield:0,itemCharges:0,captureCharges:0,capturedEnemyIds:new Set(),circleEffect:'none',circleLevel:0};
  players[id]=actor;store.sessions.set(id,{playerId:id,profile,connected:true});
 }
 const enemies=ids.map(id=>{const e=applyCampaignHeroLoadout({id,speciesId:id,campaignHeroId:id,level:1000});tuneFinalHero(e,{count:ids.length,stage});e.name=id;e.effects=[];e.cooldowns={};e.skills=heroAuthoredSkills(e).map(s=>({...s,mp:e.heroSkillCosts348[s.id]}));return e;});
 const battle={id:'balance359',floor:100,round:1,phase:'command',speed:1,players,enemies,actions:{},lastEvents:[],captureSerial:0},room={roomId:'balance359',members:new Set(Object.keys(players))};
 // Only transport is suppressed; all combat and round-end methods are native.
 store._broadcast=()=>{};store._broadcastRoom=()=>{};
 prepareOnlineUltimates(battle);return{store,battle,room,pack,random};
}

export function simulateFinale(seed=1,{ids=HERO_ORDER,basicOnly=false,legacyLR=false,maxRounds=50,trace=false,stage=0}={}){
 const {store,battle:b,room}=finaleFixture(seed,ids,{legacyLR,stage}),rows=[];let peakHeroHit=0,heroActions=0,ultimateCasts=0;
 const fx=(u,k)=>(u.effects??[]).filter(e=>e.kind===k&&e.turns>0).reduce((n,e)=>n+(e.value??0),0);
 try{while(b.round<=maxRounds&&!b.outcome){
  const events=[],order=[...Object.values(b.players),...b.enemies].filter(u=>u.hp>0).sort((a,c)=>(c.stats?.spd??c.spd)*Math.max(.2,1+fx(c,'spdUp')-fx(c,'spdDown'))-(a.stats?.spd??a.spd)*Math.max(.2,1+fx(a,'spdUp')-fx(a,'spdDown')));
  for(const actor of order){if(actor.hp<=0||!b.enemies.some(e=>e.hp>0)||!Object.values(b.players).some(u=>u.hp>0))continue;
   if(actor.playerId){const action=basicOnly?{kind:'attack',targetId:b.enemies.find(e=>e.hp>0)?.id}:store._autoBattleAction(room,b,actor);store._resolvePlayerAction(room,b,actor,action,events,new Map());}
   else store._resolveEnemyActions(b,events,actor);
  }
  for(const e of events){if(e.kind==='heroAction')heroActions++;if(e.kind==='ultimateCast')ultimateCasts++;if(e.kind==='damage'&&HERO_ORDER.includes(e.actorId))peakHeroHit=Math.max(peakHeroHit,e.value??0);}
  if(trace)rows.push({round:b.round,party:Object.values(b.players).map(u=>Math.round(u.hp/u.maxHp*100)),heroes:b.enemies.map(u=>Math.round(u.hp/u.maxHp*100)),actions:events.filter(e=>['heroAction','ultimateCast','damage','heal'].includes(e.kind)).map(e=>[e.actorId,e.label,e.value])});
  store._openNextBattleRound(room,b);
 }
 return{won:b.outcome==='victory',outcome:b.outcome??'timeout',rounds:b.round,heroActions,ultimateCasts,peakHeroHit,party:Object.values(b.players).map(u=>Math.round(u.hp/u.maxHp*100)),heroes:b.enemies.map(u=>Math.round(u.hp/u.maxHp*100)),...(trace?{trace:rows}:{})};
 }finally{cleanupUltimateBattle(b);}
}
