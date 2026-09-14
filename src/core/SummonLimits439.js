const whole=value=>Number.isFinite(Number(value))?Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(Number(value)))):0;
export function summonLevelMax439(state,type='monster'){return Math.max(1,Math.floor(Math.max(1,whole(state.player?.maxFloor))*(type==='equipment'?2:1.5)));}
export function summonLevel439(state,type='monster',random=Math.random){const roll=Number(random());return 1+Math.floor(Math.max(0,Math.min(1-Number.EPSILON,Number.isFinite(roll)?roll:0))*summonLevelMax439(state,type));}
// Search the real price function: bulk prices round before crystal conversion.
export function maxSummons439(state,mode,costFor,monsterCap=3000){
 const crystals=whole(state.player?.crystals),monsters=Math.max(0,monsterCap-(state.monsters?.length??0)),equipment=Math.max(0,500-(state.equipment?.length??0));
 const capacity=['monster','guerrilla'].includes(mode)?monsters:['equipment','weapon','armor','accessory'].includes(mode)?equipment:mode==='mixed'?monsters+equipment:Number.MAX_SAFE_INTEGER;
 let low=0,high=Math.min(capacity,crystals); // every paid summon costs at least one crystal
 while(low<high){const mid=low+Math.ceil((high-low)/2),cost=costFor(mid);if(Number.isSafeInteger(cost)&&cost>0&&cost<=crystals)low=mid;else high=mid-1;}
 return low;
}
export function validSummonCount439(value,maximum){const count=Number(value);return Number.isSafeInteger(count)&&count>=1&&count<=maximum?count:null;}
