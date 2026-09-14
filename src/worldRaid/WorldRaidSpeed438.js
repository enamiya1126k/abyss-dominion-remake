// Playback pace only. The same engine resolves every action and every round.
export const WORLD_RAID_SPEEDS438=Object.freeze([.5,1,2,4,16,32]);
export function raidResultDelay438(speed=1){
 const s=WORLD_RAID_SPEEDS438.includes(Number(speed))?Number(speed):1;
 return Math.max(s>2?40:1600,Math.round(2600/s));
}
export function raidCommandDelay438(speed=1){return Math.max(Number(speed)>2?35:500,1200/(Number(speed)||1));}
export function withWorldRaidSpeed438(Base,snapshot){
 return class extends Base{
  setSpeed(room,session,value){
   const raid=room?.raid,speed=Number(value);
   if(!raid)return{ok:false,code:'NO_RAID',message:'レイド戦は開始されていません'};
   if(room.leaderId!==session?.playerId)return{ok:false,code:'LEADER_ONLY',message:'速度変更はリーダーだけが行えます'};
   if(!WORLD_RAID_SPEEDS438.includes(speed))return{ok:false,code:'BAD_SPEED',message:'その速度は選べません'};
   const prior=raid.speed||1;
   raid.speed=speed;
   if(raid.phase==='result'&&(prior>2||speed>2)){
    const fraction=Math.min(1,Math.max(0,raid.nextRoundAt-this.now())/raidResultDelay438(prior));
    raid.nextRoundAt=this.now()+Math.round(fraction*raidResultDelay438(speed));
   }
   this.broadcast(room,{type:'raidState',raid:snapshot(raid)});return{ok:true};
  }
  _resolve(room,raid){super._resolve(room,raid);if(raid.speed>2&&raid.phase==='result')raid.nextRoundAt=this.now()+raidResultDelay438(raid.speed);}
  advance(room){
   const r=room?.raid,phase=r?.phase,round=r?.round;
   super.advance(room);
   // Also covers a result reached by start-of-round status damage or revival.
   if(r?.speed>2&&r.phase==='result'&&(phase!=='result'||round!==r.round))r.nextRoundAt=this.now()+raidResultDelay438(r.speed);
  }
 };
}
