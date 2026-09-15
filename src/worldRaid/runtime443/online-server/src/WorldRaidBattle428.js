import {RaidCoordinator,raidSnapshot} from './RaidCoordinator.js';
import {WORLD_RAID_RULES428,worldRaidBoss428} from './WorldRaidStore428.js';

const factor=(unit,up,down)=>Math.max(.2,1+Math.max(0,...(unit.effects??[]).filter(e=>e.kind===up&&e.turns>0).map(e=>Number(e.value)||0))-Math.max(0,...(unit.effects??[]).filter(e=>e.kind===down&&e.turns>0).map(e=>Number(e.value)||0)));
// Keep the original raid actor roster, actions, ultimates, auto AI and presentation events.
export class WorldRaidBattle428 extends RaidCoordinator{
 constructor({session,now,random=Math.random,broadcast=()=>{}}){super({now,random,sessions:new Map([[session.playerId,{...session,ready:true,connected:true}]]),broadcast,queueReward:()=>false});}
 create(session,campaign,attemptId){
  const room={roomId:attemptId,leaderId:session.playerId,selectedFloor:100,members:new Set([session.playerId]),phase:'lobby'};
  const result=super.start(room,this.sessions.get(session.playerId));if(!result.ok)return result;
  const raid=room.raid,boss=worldRaidBoss428(campaign.sequence),sub=boss.subBoss;
  raid.id=attemptId;raid.name=boss.name;raid.weekId=null;raid.weekEndsAt=0;raid.weeklyBoss=boss;
  raid.modifier={id:'world-raid',name:'共闘レイド',description:'5ラウンドの猶予。全員の攻撃が巨敵を削る。'};
  raid.progress={campaignId:campaign.id,maxHp:campaign.maxHp,hp:campaign.hp,totalDamage:0,attempts:1,contribution:raid.contribution,milestonesClaimed:[],personalMilestonesClaimed:{},juvenileRewardClaimedBy:{}};
  Object.assign(raid.boss,{id:boss.id,worldRaidBoss428:true,name:boss.name,level:5000,hp:campaign.hp,maxHp:campaign.maxHp,atk:18000,matk:19000,def:800,mdef:800,spd:3500,element:boss.element,heroAsset:boss.heroAsset,asset:boss.heroAsset,visualBase:boss.visualBase,circleId:boss.circleId,magicCircle:boss.circleName,magicCircleName:boss.circleName,magicCircleAsset:boss.id==='abyss-amalga'?'./assets/magic-circles/reincarnation.png':boss.id==='zero-sovereign'?'./assets/magic-circles/raid-zero-sovereign.png':'./assets/magic-circles/raid-vajra-beast.png'});
  raid.minions=[1,2].map(i=>({id:`${sub.id}-${i}`,role:'subBoss',name:`${sub.name} ${i}`,level:100,hp:12500,maxHp:12500,atk:500,matk:500,def:150,mdef:150,spd:180,evasion:5,accuracy:100,element:sub.element,effects:[],summonTier:'R',summonRarity:'R',magicCircleAsset:null,heroAsset:sub.heroAsset??null,asset:sub.heroAsset??null,visualBase:sub.visualBase,attackName:sub.attackName}));
  raid.lastEvents=raid.lastEvents.filter(e=>e.kind!=='weeklyRule');raid.telegraph=this._telegraph(1,boss);raid.worldRaid428={campaignId:campaign.id,maxRounds:WORLD_RAID_RULES428.maxRounds};
  raid.autoPlayers=[session.playerId];return {ok:true,room};
 }
 _awardMilestones(){}
 _awardPersonalMilestones(){}
 _awardJuvenilePartialRewards(){}
 _telegraph(round,boss){const cue=super._telegraph(round,boss);return round<=WORLD_RAID_RULES428.quietRounds?{...cue,title:'巨敵は力を溜めている',message:`このラウンド、ボスは攻撃しない。第6ラウンドから攻撃開始。取り巻きは行動する。`}:cue;}
 _resolveBoss(raid,events){if(raid.round>WORLD_RAID_RULES428.quietRounds)super._resolveBoss(raid,events);}
 _resolveMinions(raid,events){
  for(const minion of raid.minions.filter(m=>m.hp>0)){
   if((minion.effects??[]).some(e=>e.turns>0&&['stun','status:stun','status:freeze','status:sleep'].includes(e.kind))){events.push({kind:'statusBlock',actorId:minion.id,targetId:minion.id,targetKind:'minion',label:'状態異常で行動できない'});continue;}
   if(minion.actionDelay>0){minion.actionDelay--;continue;}
   const alive=Object.values(raid.players).filter(p=>p.hp>0);if(!alive.length)return;
   const target=alive[Math.floor(this.random()*alive.length)],magic=this.random()<.5;
   const attack=(magic?minion.matk:minion.atk)*factor(minion,'atkUp','atkDown'),defense=(magic?target.stats.mdef:target.stats.def)*factor(target,'defUp','defDown');
   const damage=Math.max(1,Math.round((attack-defense*.45)*(.92+this.random()*.16)*(target.guard?.42:1)));
   this._damagePlayer(raid,minion,target,damage,events,minion.attackName);
  }
 }
 _resolve(room,raid){super._resolve(room,raid);if(!raid.outcome&&raid.round>=WORLD_RAID_RULES428.maxRounds)raid.outcome='limit';}
 _finish(room,raid){room.phase='lobby';raid.phase='finished';this.broadcast(room,{type:'raidEnded',raid:raidSnapshot(raid),result:raid.outcome??'limit'});}
}
