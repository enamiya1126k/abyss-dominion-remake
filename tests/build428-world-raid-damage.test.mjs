import test from 'node:test';
import assert from 'node:assert/strict';
import {worldRaidPercentHp428} from '../src/worldRaid/WorldRaidDamage428.js';
import {RaidCoordinator} from '../online-server/src/RaidCoordinator.js';
import {prepareUltimateBattle,replayUltimateOrdinary,ENDGAME_ULTIMATES,castEndgameUltimate,endUltimateRound} from '../src/core/EndgameUltimateSystem.js';

const setup=(world=true)=>{
 const actor={id:'p',playerId:'p',ownerPlayerId:'p',name:'時',endgameBossId:'ten_time',hp:100000,maxHp:100000,mp:10000,maxMp:10000,stats:{hp:100000,atk:1000,matk:1000,def:100,mdef:100,spd:100,crit:0},effects:[],cooldowns:{},skills:[],metrics:{}};
 const boss={id:'b',name:'ボス',worldRaidBoss428:world,hp:100000000000,maxHp:100000000000,atk:100,def:100,mdef:100,effects:[],evasion:0};
 return {round:4,onlineMode:true,players:{p:actor},boss,minions:[],contribution:{p:{damage:0}},progress:{hp:boss.hp,maxHp:boss.hp,totalDamage:0},modifier:{}};
};
test('world HP basis is capped only for the world boss; all other targets preserve exact values',()=>{
 assert.equal(worldRaidPercentHp428({worldRaidBoss428:true},1e11),1600000);
 assert.equal(worldRaidPercentHp428({worldRaidBoss428:true},10),10);
 assert.equal(worldRaidPercentHp428({},1e11),1e11);
 assert.equal(worldRaidPercentHp428({},12500),12500);
});
test('legacy ordinary skill and ultimate replay use the same finite world HP basis',()=>{
 for(const replay of [false,true]){const b=setup(),u=b.players.p,skill={id:'percent',name:'割合',kind:'attack',type:'attack',power:1,mp:0,currentHpDamage:.08,guaranteedHit:true};u.skills=[skill];prepareUltimateBattle(b);const before=b.boss.hp;
  if(replay)replayUltimateOrdinary(b,u,skill,{targetId:b.boss.id,charge:false,random:()=>.5});
  else new RaidCoordinator({sessions:new Map(),random:()=>.5})._resolvePlayer({},b,u,{kind:'skill',skillId:skill.id,enemyTargetId:b.boss.id},{profile:{}},[]);
  assert.ok(before-b.boss.hp>=128000);assert.ok(before-b.boss.hp<135000);
 }
});
test('instant death becomes bounded damage for a world boss and keeps its original effect elsewhere',()=>{
 for(const world of [true,false]){const b=setup(world),u=b.players.p;u.skills=[ENDGAME_ULTIMATES.ten_time];prepareUltimateBattle(b);assert.equal(castEndgameUltimate(b,u,u.skills[0].id,{targetId:b.boss.id}).ok,true);b.round=14;endUltimateRound(b);assert.equal(b.boss.hp,world?100000000000-400000:0);}
});
