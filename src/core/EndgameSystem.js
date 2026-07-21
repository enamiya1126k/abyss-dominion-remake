export const TEAM_BATTLE_UNLOCK_FLOOR=100;
export const EMERGENCY_UNLOCK_FLOOR=500;
export const WORLD_MAX_FLOOR=10000;

export const ENDGAME_BOSSES={
 abyss_gluttony:{id:"abyss_gluttony",faction:"abyss",name:"深淵・暴食",title:"飢え続ける深淵",icon:"🌑",speciesId:"ogre",support:["vampire_bat","acid_slime","wraith"],seriesId:"abyssGluttony",gearNames:{weapon:"暴食の大剣",armor:"暴食の外殻",accessory:"暴食の環"}},
 abyss_extinction:{id:"abyss_extinction",faction:"abyss",name:"深淵・死滅",title:"命を終わらせる深淵",icon:"☠️",speciesId:"wraith",support:["skeleton_guard","zombie","ghost"],seriesId:"abyssExtinction",gearNames:{weapon:"死滅の鎌",armor:"死滅の葬衣",accessory:"死滅の刻印"}},
 ten_fire:{id:"ten_fire",faction:"tenGod",name:"炎神・イグニス",title:"十神・灼熱の権能",icon:"☀️",speciesId:"salamander",support:["ember_slime","salamander","willowisp"],seriesId:"godIgnis",gearNames:{weapon:"炎神剣イグニス",armor:"炎神の天衣",accessory:"炎神核"}},
 ten_thunder:{id:"ten_thunder",faction:"tenGod",name:"雷神・ヴァジュラ",title:"十神・天雷の権能",icon:"⚡",speciesId:"wyvern",support:["harpy","willowisp","clockwork"],seriesId:"godVajra",gearNames:{weapon:"雷神槍ヴァジュラ",armor:"雷神の天鎧",accessory:"雷神核"}}
};

export function manifestationForFloor(floor){
 const f=Math.max(1,Number(floor)||1);
 if(f>=10000)return{rate:1,label:"真なる顕現",percent:100};
 if(f>=5000)return{rate:.8,label:"神格顕現",percent:80};
 if(f>=3000)return{rate:.6,label:"権能解放",percent:60};
 if(f>=1000)return{rate:.4,label:"上位投影体",percent:40};
 return{rate:.2,label:"投影体",percent:20};
}

export function normalizeEndgameState(state){
 state.endgame??={};
 state.endgame.teamBattle??={unlocked:false,stage:1,totalWins:0,totalLosses:0,dailyKey:null,dailyAttempts:0};
 state.endgame.emergency??={encounters:0,wins:0,losses:0,lastFloor:0,lastRollStep:0,records:{},fragments:{},craftCounts:{},craftedGear:[]};
 const e=state.endgame.emergency;
 e.records??={};e.fragments??={};e.craftCounts??={};e.craftedGear??=[];
 state.endgame.teamBattle.unlocked=Boolean(state.endgame.teamBattle.unlocked||state.player?.maxFloor>=TEAM_BATTLE_UNLOCK_FLOOR);
 return state.endgame;
}

export function dailyTeamAttempts(state){
 const team=normalizeEndgameState(state).teamBattle;
 const key=new Date().toISOString().slice(0,10);
 if(team.dailyKey!==key){team.dailyKey=key;team.dailyAttempts=0;}
 return team;
}

function enemy(speciesId,level,extra={}){return{speciesId,level,boss:false,equipped:false,gear:null,...extra}}
export function createTeamBattleEncounter(state){
 const team=dailyTeamAttempts(state),stage=Math.max(1,team.stage||1),base=Math.max(10,Math.round((state.player?.maxFloor||100)*(.55+stage*.035)));
 const pools=[["goblin_guard","goblin_shaman","orc","ogre"],["skeleton_guard","skeleton_archer","wraith","zombie"],["dire_wolf","bear","harpy","wyvern"],["stone_golem","clockwork","salamander","water_spirit"]];
 const pool=pools[(stage-1)%pools.length];
 return pool.map((id,i)=>enemy(id,base+i*2,{nameOverride:`試練 ${stage}・${i+1}`,teamBattle:true,statMultiplier:1+stage*.09}));
}
export function shouldTriggerEmergency(state,steps=0){
 if((state.player?.currentFloor||1)<EMERGENCY_UNLOCK_FLOOR)return false;
 const emergency=normalizeEndgameState(state).emergency;
 if(steps-emergency.lastRollStep<18)return false;
 emergency.lastRollStep=steps;
 return Math.random()<.035;
}
export function createEmergencyEncounter(state,forcedId=null){
 const floor=state.player?.currentFloor||500,manifestation=manifestationForFloor(floor);
 const available=Object.values(ENDGAME_BOSSES).filter(b=>floor>=1000||b.faction==="abyss");
 const boss=ENDGAME_BOSSES[forcedId]??available[Math.floor(Math.random()*available.length)];
 const factionBase=boss.faction==="tenGod"?7:4;
 const leaderMultiplier=factionBase*(.65+manifestation.rate*1.75);
 const supportMultiplier=(boss.faction==="tenGod"?2.5:1.75)*(1+manifestation.rate);
 const level=Math.max(150,Math.round(floor*(1.15+manifestation.rate*.45)));
 const leader=enemy(boss.speciesId,level,{boss:true,endgameBossId:boss.id,faction:boss.faction,nameOverride:`${boss.name}〈${manifestation.percent}%〉`,statMultiplier:leaderMultiplier,powerRate:manifestation.rate,manifestationLabel:manifestation.label,uncapturable:true});
 const supports=boss.support.map((id,i)=>enemy(id,Math.max(1,level-10-i*3),{nameOverride:`${boss.faction==="tenGod"?"神兵":"眷属"}・${i+1}`,statMultiplier:supportMultiplier,endgameSupport:true,uncapturable:true}));
 return{boss,manifestation,enemies:[leader,...supports]};
}
export function fragmentRequirement(craftCount=0){return[50,75,100,125,150,200][Math.min(5,Math.max(0,Number(craftCount)||0))]}
export function emergencyFragmentStatus(state,bossId){
 const e=normalizeEndgameState(state).emergency,count=e.fragments[bossId]??0,crafted=e.craftCounts[bossId]??0;
 return{count,crafted,required:fragmentRequirement(crafted),canCraft:count>=fragmentRequirement(crafted)};
}
export function awardEmergencyFragments(state,bossId,won){
 if(!bossId)return 0;
 const e=normalizeEndgameState(state).emergency,amount=won?20:1+Math.floor(Math.random()*3);
 e.fragments[bossId]=(e.fragments[bossId]??0)+amount;
 const r=e.records[bossId]??={encounters:0,wins:0,losses:0,highestPower:0,firstFloor:null,firstVictoryFloor:null,bestRemainingHpPercent:100,totalFragments:0};
 r.totalFragments=(r.totalFragments??0)+amount;e.records[bossId]=r;
 return amount;
}
function uid(){return crypto.randomUUID?.()??`${Date.now()}-${Math.random().toString(16).slice(2)}`}
export function craftEndgameEquipment(state,bossId){
 const boss=ENDGAME_BOSSES[bossId];if(!boss)return{ok:false,message:"対象が見つかりません。"};
 const e=normalizeEndgameState(state).emergency,status=emergencyFragmentStatus(state,bossId);
 if(!status.canCraft)return{ok:false,message:`欠片が不足しています（${status.count}/${status.required}）`};
 const slots=["weapon","armor","accessory"],slot=slots[Math.floor(Math.random()*slots.length)],god=boss.faction==="tenGod";
 const pools=slot==="weapon"?(god?[{atk:240,crit:24,spd:35},{atk:280,crit:18},{atk:220,crit:30,heal:25}]:[{atk:150,crit:16,spd:22},{atk:180,crit:10},{atk:135,crit:22,heal:16}]):slot==="armor"?(god?[{hp:1100,def:190},{hp:900,def:230,heal:35},{hp:1250,def:150,spd:25}]:[{hp:650,def:115},{hp:520,def:145,heal:22},{hp:760,def:90,spd:16}]):(god?[{atk:90,hp:450,crit:20,spd:30},{def:85,hp:600,heal:45},{atk:70,def:60,crit:28}]:[{atk:55,hp:260,crit:14,spd:18},{def:50,hp:340,heal:28},{atk:42,def:38,crit:18}]);
 const stats={...pools[Math.floor(Math.random()*pools.length)]};
 const item={id:uid(),slot,name:boss.gearNames[slot],rarity:"LR",level:1,plus:0,stats,handedness:slot==="weapon"?"either":null,ruleOverrides:{endgame:true,unsellable:true},series:boss.seriesId,favorite:true,locked:true,equippedBy:null,createdAt:new Date().toISOString(),endgameBossId:bossId,endgameFaction:boss.faction};
 e.fragments[bossId]-=status.required;e.craftCounts[bossId]=status.crafted+1;e.craftedGear.push({bossId,itemId:item.id,slot,at:item.createdAt});
 return{ok:true,item,spent:status.required,boss};
}
export function recordEmergencyResult(state,battle,won){
 const end=normalizeEndgameState(state).emergency,bossId=battle?.specialBossId;
 end.encounters++;won?end.wins++:end.losses++;end.lastFloor=state.player?.currentFloor||1;
 if(bossId){
  const r=end.records[bossId]??={encounters:0,wins:0,losses:0,highestPower:0,firstFloor:null,firstVictoryFloor:null,bestRemainingHpPercent:100,totalFragments:0};
  r.encounters++;won?r.wins++:r.losses++;r.highestPower=Math.max(r.highestPower,battle.powerPercent||0);r.firstFloor??=end.lastFloor;if(won)r.firstVictoryFloor??=end.lastFloor;
  const leader=battle.enemies?.find(x=>x.endgameBossId===bossId),remaining=leader?.maxHp?Math.max(0,Math.round((leader.hp/leader.maxHp)*100)):won?0:100;r.bestRemainingHpPercent=Math.min(r.bestRemainingHpPercent??100,remaining);
  end.records[bossId]=r;
 }
}
