const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
const positive=(value,fallback=1)=>Math.max(1,finite(value,fallback));
const total=(rows,key)=>rows.reduce((sum,row)=>sum+Math.max(0,finite(row?.[key])),0);
const average=(rows,key)=>rows.length?total(rows,key)/rows.length:1;
const median=values=>{const sorted=values.map(value=>positive(value)).sort((a,b)=>a-b);if(!sorted.length)return 1;const middle=Math.floor(sorted.length/2);return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2};

export function teamBattleTargetProfile(partyStats=[],stage=1){
 const party=(partyStats??[]).filter(Boolean),s=Math.max(1,Math.floor(finite(stage,1))),within=(s-1)%10,tier=Math.floor((s-1)/10),partyHp=Math.max(4,total(party,"hp")),avgAtk=Math.max(1,(average(party,"atk")+average(party,"matk"))/2),avgDef=Math.max(1,(average(party,"def")+average(party,"mdef"))/2),avgHp=Math.max(1,partyHp/Math.max(1,party.length)),speed=median(party.map(row=>row.spd));
 return Object.freeze({stage:s,within,tier,partyHp,avgAtk,avgDef,avgHp,speed,hpRatio:1.5+within*.15+tier*.45,offenseRatio:.78+within*.055+tier*.12,defenseRatio:.38+within*.03+tier*.07,speedRatio:.92+within*.018+tier*.04});
}

export function balanceTeamBattleEnemies(enemies=[],partyStats=[],stage=1){
 const rows=(enemies??[]).filter(Boolean);if(!rows.length)return rows;
 const profile=teamBattleTargetProfile(partyStats,stage),targetHp=profile.partyHp*profile.hpRatio,weights=rows.map(enemy=>enemy.teamBattleRole==="leader"?1.5:enemy.teamBattleRole==="guardian"?1.3:enemy.teamBattleRole==="support"?1.05:.95),weightTotal=weights.reduce((sum,value)=>sum+value,0);
 rows.forEach((enemy,index)=>{
  const role=enemy.teamBattleRole??(index?"striker":"leader");
  const roleOffense=role==="leader"?1.16:role==="disruptor"?1.05:role==="support"?0.84:role==="guardian"?0.9:1;
  const roleDefense=role==="guardian"?1.35:role==="leader"?1.12:role==="support"?1.02:0.92;
  const roleSpeed=role==="disruptor"?1.16:role==="support"?1.08:role==="guardian"?0.82:1;
  const hpMinimum=Math.round(targetHp*weights[index]/Math.max(1,weightTotal)),attackMinimum=Math.round((profile.avgDef*profile.offenseRatio+profile.avgHp*.018)*roleOffense),defenseMinimum=Math.round(profile.avgAtk*profile.defenseRatio*roleDefense),speedMinimum=Math.round(profile.speed*profile.speedRatio*roleSpeed);
  enemy.maxHp=Math.max(positive(enemy.maxHp),hpMinimum);enemy.hp=enemy.maxHp;enemy.atk=Math.max(positive(enemy.atk),attackMinimum);enemy.matk=Math.max(positive(enemy.matk??enemy.atk),attackMinimum);enemy.def=Math.max(0,finite(enemy.def),defenseMinimum);enemy.mdef=Math.max(0,finite(enemy.mdef??enemy.def),defenseMinimum);enemy.spd=Math.max(positive(enemy.spd),speedMinimum);enemy.accuracy=Math.max(100,finite(enemy.accuracy,100));enemy.bossStatusResist=Math.max(finite(enemy.bossStatusResist),role==="leader"?.42:.24);enemy.teamBattle=true;enemy.teamBattleRole=role;enemy.teamBattleTargetMode=enemy.teamBattleTargetMode??(role==="disruptor"?"threat":role==="support"?"weak":"normal");enemy.teamBattleBalance={version:1,stage:profile.stage,hpMinimum,attackMinimum,defenseMinimum,speedMinimum};
 });
 return rows;
}
