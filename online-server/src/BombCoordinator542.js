import {realtime563} from './Realtime563.js';
import {makeRelay563,startRelay563,advanceRelay563,publicRelay563,canPass563} from '../../src/bomb/Relay563.js';
const api=realtime563({rooms:'bombRooms542',runtime:'bombRuntime542',prefix:'bb563',op:'bomb542',state:'bomb',frame:'bombFrame542',versionKey:'bombVersion542',rulesKey:'rules542',version:3,array:false,frameMs:70,make:makeRelay563,start:startRelay563,advance:advanceRelay563,public:publicRelay563,
 valid:(g,p,m,at)=>m.action==='pass'&&m.bombId===g.bomb?.id&&Number.isInteger(m.target)&&m.target!==p.seat&&g.players[m.target]?.alive&&canPass563(g,p,at)});
export const bombFor542=api.find,liveBomb542=api.live,bombSnapshot542=api.snapshot,createBomb542=api.create,handleBomb542=api.handle,queueBomb542=api.queue,advanceBombs542=api.advance;
