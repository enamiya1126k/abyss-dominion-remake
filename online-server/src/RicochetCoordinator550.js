import {realtime563} from './Realtime563.js';
import {makeGoal563,startGoal563,advanceGoal563,publicGoal563,canShoot563} from '../../src/ricochet550/Goals563.js';
const api=realtime563({rooms:'ricochetRooms550',runtime:'ricochetRuntime550',prefix:'rc563',op:'ricochet550',state:'ricochet',frame:'ricochetFrame550',versionKey:'ricochetVersion550',rulesKey:'rules550',version:7,array:true,frameMs:50,make:makeGoal563,start:startGoal563,advance:advanceGoal563,public:publicGoal563,
 valid:(g,p,m,at)=>['pull','shoot','cancel'].includes(m.action)&&m.shot===p.shots555&&canShoot563(g,p,at)&&(m.action==='cancel'||Number.isFinite(m.angle)&&Math.abs(m.angle)<=Math.PI&&Number.isFinite(m.power)&&m.power<=(1)&&m.power>=(m.action==='shoot'?.08:0))});
export const ricochetFor550=api.find,liveRicochet550=api.live,ricochetSnapshot550=api.snapshot,createRicochet550=api.create,handleRicochet550=api.handle,queueRicochet550=api.queue,advanceRicochets550=api.advance;
