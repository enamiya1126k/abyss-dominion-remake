import {conditionalCircleMultiplier398} from '../data/magicCircles398.js?v=3.1.78-build398';
import {maxMp} from './SkillSystem.js';
import {SPECIES} from '../data/species.js';
import {canonicalAttribute} from '../data/attributes.js';
import {ultimateCircle,ultimateIsolated} from '../core/EndgameUltimateSystem.js';
export function battleCircleMultiplier398(battle,actor,target,kind='direct'){
 if(kind==='excluded'||!actor||!(battle.party??[]).includes(actor)||actor.currentHp<=0||ultimateIsolated(battle,actor))return 1;
 const c=ultimateCircle(battle,actor,battle.magicCircleProfiles?.[actor.id]);if(!c)return 1;
 return conditionalCircleMultiplier398(c.id,c.level,{elements:battle.party.filter(u=>u.currentHp>0&&!u.captured&&!ultimateIsolated(battle,u)).map(u=>canonicalAttribute(u.attribute??SPECIES[u.speciesId]?.element,u.speciesId)),statuses:battle.enemyStatuses?.[target?.id]??[],mp:actor.currentMp,maxMp:maxMp(actor)});
}
