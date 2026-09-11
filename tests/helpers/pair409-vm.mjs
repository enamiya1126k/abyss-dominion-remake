import * as singles from '../../src/battle/SingleTraits410.js';
// VM fixtures that extract main functions must explicitly load their new imports.
import * as foundation from '../../src/battle/ChapterTwoAbilityRuntime408.js';
import * as pair from '../../src/battle/PairSynergy409.js';
import {maxMp} from '../../src/battle/SkillSystem.js';
const recover=(u,amount)=>{const max=u.maxMp??maxMp(u),before=u.currentMp??0;u.currentMp=Math.min(max,before+Math.max(0,amount));return u.currentMp-before;};
export const pairVm409={...foundation,...pair,...singles,maxMp,recoverBattleMp:recover,recoverEnemyBattleMp:recover};
