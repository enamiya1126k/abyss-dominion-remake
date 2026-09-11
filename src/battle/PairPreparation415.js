import {CHAPTER_TWO_ABILITY_DESIGN408} from '../data/ChapterTwoAbilityDesign408.js';
import {endgameCharacter} from '../data/endgameCharacters.js';
import {ultimateIsolated} from '../core/EndgameUltimateSystem.js';

const types=new Set(['poison','burn','freeze','sleep','bleed','spdDown','defDown','evasionDown']);
const pairs=CHAPTER_TWO_ABILITY_DESIGN408.pairs;
const turn=b=>Math.max(1,Math.floor(Number(b?.turn)||1));
const alive=(u,side)=>u&&!u.captured&&Number(side==='enemy'?u.hp:u.currentHp)>0;
const key=(side,pair,target,type)=>JSON.stringify([side,pair,target,type]);
export function hardImmune415(target,type){
 const profile=target?.statusProfile??endgameCharacter(target?.endgameBossId)?.statusProfile;
 return Boolean(profile?.immune?.includes(type)||target?.floorBossPassive?.statusImmunities?.includes(type)||target?.floorBossPassive?.effectImmunities?.includes(type));
}
function marks(b){
 b.pairPreparation415??={};
 for(const [k,v] of Object.entries(b.pairPreparation415))if(v.expires<turn(b))delete b.pairPreparation415[k];
 return b.pairPreparation415;
}
// Called only after a landed, authored setup passed its probability check.
// Ordinary resistance, misses, isolation, costs and generated reactions cannot create marks.
export function recordImmunePreparation415(b,target,effect,targetSide){
 const type=effect.id??effect.statusId??effect.kind,side=targetSide==='enemy'?'ally':'enemy';
 if(!types.has(type)||!hardImmune415(target,type)||ultimateIsolated(b,target)||effect.selfCost||effect.ultimate358||String(effect.sourceKey??'').startsWith('pair:'))return false;
 const roster=(side==='ally'?b.party:b.enemies)??[],source=roster.find(u=>u.id===(effect.sourceMonsterId??effect.sourceId));
 if(!effect.authoredSetup415&&!String(effect.sourceSkillId??'').startsWith(`${source?.speciesId}__`))return false;
 const pair=pairs.find(p=>p.members.includes(source?.speciesId));
 if(!pair||!pair.members.every(id=>roster.some(u=>u.speciesId===id&&alive(u,side)&&!ultimateIsolated(b,u))))return false;
 const map=marks(b),k=key(side,pair.id,target.id,type);
 map[k]={expires:turn(b)+1,sourceSpecies:source.speciesId};
 b.log??=[];b.log.unshift(`【${pair.label}】準備成立：${type}無効への代替連携`);b.log=b.log.slice(0,6);
 return true;
}
export function preparationAvailable415(b,side,pairId,targetId,type,partnerSpecies=null){
 const m=marks(b)[key(side,pairId,targetId,type)];return Boolean(m&&(!partnerSpecies||m.sourceSpecies!==partnerSpecies));
}
export function takePreparation415(b,side,pairId,targetId,type,partnerSpecies){
 if(!preparationAvailable415(b,side,pairId,targetId,type,partnerSpecies))return false;
 delete marks(b)[key(side,pairId,targetId,type)];return true;
}
