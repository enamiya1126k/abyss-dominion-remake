// Existing online servers do not execute the five Build410 local traits.
// Keep their pre-trait bodies and transfer wounds by ratio, without changing the wire schema.
import {calculatedStats,rawCalculatedStats410} from '../models/Monster.js';
import {singleTrait410} from '../battle/SingleTraits410.js?v=3.1.91-build411';
export function onlineStats411(monster){return singleTrait410(monster)?rawCalculatedStats410(monster):calculatedStats(monster);}
function transferHp(value,from,to,round=Math.ceil){
 const hp=Number(value);if(!Number.isFinite(hp))return null;
 if(hp<=0)return 0;
 return Math.max(1,Math.min(to,round(Math.min(1,hp/Math.max(1,from))*to)));
}
export function onlineHp411(monster,stats=onlineStats411(monster)){
 const local=calculatedStats(monster).hp;
 if(!singleTrait410(monster))return Math.max(0,Math.min(stats.hp,monster.currentHp==null?stats.hp:Number(monster.currentHp)||0));
 return transferHp(monster.currentHp??local,local,stats.hp,Math.floor)??0;
}
export function localHp411(monster,value){
 const maximum=calculatedStats(monster).hp;
 if(!singleTrait410(monster)){const hp=Number(value);return Number.isFinite(hp)?Math.max(0,Math.min(maximum,Math.floor(hp))):null;}
 return transferHp(value,onlineStats411(monster).hp,maximum);
}
