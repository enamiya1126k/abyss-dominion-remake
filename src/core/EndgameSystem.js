export const TEAM_BATTLE_UNLOCK_FLOOR=100;
export const EMERGENCY_UNLOCK_FLOOR=500;
export const WORLD_MAX_FLOOR=10000;

export const ENDGAME_BOSSES={
 abyss_gluttony:{id:"abyss_gluttony",faction:"abyss",name:"深淵・暴食",title:"飢え続ける深淵",icon:"🌑",speciesId:"ogre",support:["vampire_bat","acid_slime","wraith"]},
 abyss_extinction:{id:"abyss_extinction",faction:"abyss",name:"深淵・死滅",title:"命を終わらせる深淵",icon:"☠️",speciesId:"wraith",support:["skeleton_guard","zombie","ghost"]},
 ten_fire:{id:"ten_fire",faction:"tenGod",name:"炎神・イグニス",title:"十神・灼熱の権能",icon:"☀️",speciesId:"salamander",support:["ember_slime","salamander","willowisp"]},
 ten_thunder:{id:"ten_thunder",faction:"tenGod",name:"雷神・ヴァジュラ",title:"十神・天雷の権能",icon:"⚡",speciesId:"wyvern",support:["harpy","willowisp","clockwork"]}
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
 state.endgame.emergency??={encounters:0,wins:0,losses:0,lastFloor:0,lastRollStep:0,records:{}};
 state.endgame.teamBattle.unlocked=Boolean(state.endgame.teamBattle.unlocked||state.player?.maxFloor>=TEAM_BATTLE_UNLOCK_FLOOR);
 state.endgame.emergency.records??={};
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

export function recordEmergencyResult(state,battle,won){
 const end=normalizeEndgameState(state).emergency,bossId=battle?.specialBossId;
 end.encounters++;won?end.wins++:end.losses++;end.lastFloor=state.player?.currentFloor||1;
 if(bossId){const r=end.records[bossId]??={encounters:0,wins:0,losses:0,highestPower:0,firstFloor:null};r.encounters++;won?r.wins++:r.losses++;r.highestPower=Math.max(r.highestPower,battle.powerPercent||0);r.firstFloor??=end.lastFloor;end.records[bossId]=r;}
}
