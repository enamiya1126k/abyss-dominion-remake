import {CHAPTER_TWO_ABILITY_DESIGN408} from '../data/ChapterTwoAbilityDesign408.js?v=3.1.88-build408';
import {ultimateIsolated,ultimateExtraBlocked} from '../core/EndgameUltimateSystem.js';
export const PAIR_SERIES409=Object.freeze(Object.fromEntries(CHAPTER_TWO_ABILITY_DESIGN408.pairs.map(p=>[p.id,Object.freeze({id:p.id,label:p.label,members:p.members,identity:p.identity,feature:p.plannedFeature,counterplay:p.counterplay})])));
import {takePreparation415,preparationAvailable415} from './PairPreparation415.js';
const bySpecies=new Map(Object.values(PAIR_SERIES409).flatMap(p=>p.members.map(id=>[id,p])));
const n=v=>Math.max(0,Number(v)||0),round=b=>Math.max(1,Math.floor(n(b?.turn))),key=(side,id)=>`${side}:${id}`;
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const fields=['used','totals','marks','discounts','guards','shields','momentum','maxHp','stats'];
export function createPairState409(raw){
 const s={version:1,used:{},totals:{},marks:{},discounts:{},guards:{},shields:{},momentum:{},maxHp:{},stats:{},cues:[]};
 if(raw?.version===1)for(const f of fields)if(raw[f]&&typeof raw[f]==='object'&&!Array.isArray(raw[f]))s[f]=JSON.parse(JSON.stringify(raw[f]));
 return s;
}
export function pairState409(b){return b.pairSynergy409??(b.pairSynergy409=createPairState409());}
export function snapshotPairs409(b){return b?.pairSynergy409?createPairState409(b.pairSynergy409):null;}
export function pairDefinition409(subject){return bySpecies.get(typeof subject==='string'?subject:subject?.speciesId)??null;}
export function pairRoster409(b,side){return(side==='enemy'?b.enemies:b.party)??[];}
export function pairAlive409(u,side){return !!u&&!u.captured&&n(side==='enemy'?u.hp:u.currentHp)>0;}
export function pairBlocked409(b,u,side){
 if(!u||ultimateIsolated(b,u)||ultimateExtraBlocked(b,u))return true;
 const controls=new Set(['sleep','freeze','paralysis','charm','confusion','fear','stun']);
 return [...(b[side==='enemy'?'enemyEffects':'allyEffects']?.[u.id]??[]),...(b[side==='enemy'?'enemyStatuses':'allyAilments']?.[u.id]??[])].some(e=>(e.turns??1)>0&&controls.has(String(e.id??e.kind??'').replace(/^status:/,'')));
}
export function pairMembers409(b,side,pair){return pair.members.map(id=>pairRoster409(b,side).find(u=>u.speciesId===id&&pairAlive409(u,side)&&!pairBlocked409(b,u,side)));}
const ready=(b,side,p)=>p&&pairMembers409(b,side,p).every(Boolean);
export function preparePairVitals409(b,maximum){const s=pairState409(b);for(const side of ['ally','enemy'])for(const u of pairRoster409(b,side))s.maxHp[key(side,u.id)]=Math.max(1,n(maximum(u,side)));}
function maxHp(b,u,side){return Math.max(1,n(pairState409(b).maxHp[key(side,u.id)])||n(u.maxHp??u._maxHp??u.stats?.hp??(side==='enemy'?u.hp:u.currentHp)));}
function effects(b,side,u){const f=side==='enemy'?'enemyEffects':'allyEffects';b[f]??={};return b[f][u.id]??(b[f][u.id]=[]);}
function statuses(b,side,u){return b[side==='enemy'?'enemyStatuses':'allyAilments']?.[u.id]??[];}
const active=e=>(e.turns??1)>0;
function has(b,side,u,kind){return effects(b,side,u).some(e=>e.kind===kind&&active(e))||statuses(b,side,u).some(e=>e.id===kind&&active(e));}
function canClaim(b,side,p,owner=''){
 if(b.pairEnhancements409===false)return false;
 const s=pairState409(b),k=key(side,p.id)+(owner?`:${owner}`:''),u=s.used[k];
 return !(u?.round>round(b))&&!(u?.round===round(b)&&u.count>=(owner?1:p.feature.perRound))&&n(s.totals[key(side,p.id)])<p.feature.perBattle;
}
function claim(b,side,p,owner=''){
 if(!canClaim(b,side,p,owner))return false;
 const s=pairState409(b),k=key(side,p.id)+(owner?`:${owner}`:''),u=s.used[k];s.used[k]={round:round(b),count:u?.round===round(b)?u.count+1:1};
 s.totals[key(side,p.id)]=n(s.totals[key(side,p.id)])+1;const stat=s.stats[key(side,p.id)]??(s.stats[key(side,p.id)]={activations:0});stat.activations++;
 return true;
}
function cue(b,side,p,text){const s=pairState409(b);if(s.cues.length<8)s.cues.push({side,pairId:p.id,text,round:round(b)});}
export function takePairCues409(b){return pairState409(b).cues.splice(0);}
function putEffect(b,side,u,kind,value,turns,p){
 const list=effects(b,side,u),sourceKey=`pair409:${p.id}:${kind}`,old=list.find(e=>e.kind===kind&&e.sourceKey===sourceKey);
 if(old){old.value=Math.max(n(old.value),value);old.turns=Math.max(n(old.turns),turns);}else list.push({kind,value,turns,sourceKey,pairMaximum409:true});
}
export function writePairShield409(b,side,u,rate,pairId){
 const amount=Math.floor(maxHp(b,u,side)*rate),s=pairState409(b),previous=side==='enemy'?n(u._floorBossHpShield):n(b.circleShields?.[u.id]);
 if(side==='enemy')u._floorBossHpShield=Math.max(previous,amount);else{b.circleShields??={};b.circleShields[u.id]=Math.max(previous,amount);}
 const k=key(side,u.id);if(amount>=previous&&amount>0)s.shields[k]={pairId,amount,round:round(b)};else if(s.shields[k]&&previous>s.shields[k].amount)delete s.shields[k];
 return Math.max(0,amount-previous);
}
export function recordNaturalPairAction409(b,actor,side,target,{offensive=true,extra=false}={}){
 const p=pairDefinition409(actor);if(!p||!offensive||extra||!target||!pairAlive409(target,side==='enemy'?'ally':'enemy')||!ready(b,side,p)||b.pairEnhancements409===false)return false;
 const s=pairState409(b),k=key(side,p.id),mark=s.marks[k]?.round===round(b)?s.marks[k]:(s.marks[k]={round:round(b),targets:{}});
 if(own(mark.targets,actor.speciesId))return false;
 mark.targets[actor.speciesId]=target.id;return true;
}
function matchedTarget(b,side,p,id){const m=pairState409(b).marks[key(side,p.id)];return m?.round===round(b)&&p.members.every(species=>m.targets[species]===id);}
export function pairDiscount409(b,u,side='ally',skill=null){
 if(!b||b.pairEnhancements409===false||!String(skill?.id??'').startsWith(`${u?.speciesId}__`))return 0;
 const p=pairDefinition409(u);if(!ready(b,side,p)||!pairAlive409(u,side))return 0;
 const d=pairState409(b).discounts[key(side,u.speciesId)];return d&&d.expires>=round(b)?d.rate:0;
}
export function pairSkillCost409(b,u,skill,cost,side='ally'){return Math.max(0,Math.ceil(n(cost)*(1-pairDiscount409(b,u,side,skill))));}
export function consumePairDiscount409(b,u,side,skill){if(!pairDiscount409(b,u,side,skill))return false;delete pairState409(b).discounts[key(side,u.speciesId)];return true;}
function grantDiscount(b,side,p,members){for(const u of members)pairState409(b).discounts[key(side,u.speciesId)]={rate:.10,expires:round(b)+1,pairId:p.id};}
export function consumePairGuard409(b,u,side,amount,ordinaryGuard=0){
 const s=pairState409(b),k=key(side,u.id),g=s.guards[k];if(!g||g.expires<round(b)||n(amount)<=0)return amount;
 delete s.guards[k];const base=Math.max(0,Math.min(.85,n(ordinaryGuard))),rate=Math.max(base,g.rate);
 return Math.max(0,Math.floor(amount*(1-rate)/Math.max(.15,1-base)));
}
// Called synchronously after HP/automatic rescue and after the named barrier was consumed.
export function observePairImpact409(b,u,side,{beforeShield=0,afterShield=0,direct=false}={}){
 if(b.pairEnhancements409===false)return;
 const s=pairState409(b),p=pairDefinition409(u),shield=s.shields[key(side,u.id)];
 if(shield&&beforeShield>shield.amount)delete s.shields[key(side,u.id)];
 if(direct&&shield?.pairId==='oathguard'&&beforeShield>0&&beforeShield<=shield.amount&&afterShield===0){
  delete s.shields[key(side,u.id)];const guard=PAIR_SERIES409.oathguard;
  if(ready(b,side,guard)&&claim(b,side,guard)){for(const member of pairMembers409(b,side,guard))putEffect(b,side,member,'defUp',.15,2,guard);cue(b,side,guard,'砕けた盾・二人の防御+15%');}
 }
 if(p?.id==='wings'&&ready(b,side,p)&&pairMembers409(b,side,p).some(member=>n(side==='enemy'?member.hp:member.currentHp)/maxHp(b,member,side)<=.30)&&claim(b,side,p)){
  for(const member of pairMembers409(b,side,p))writePairShield409(b,side,member,.25,p.id);cue(b,side,p,'救援の双翼・二人に障壁25%');
 }
}
function lowest(b,side,env){return pairRoster409(b,side).filter(u=>pairAlive409(u,side)&&!env.blocked?.(u)).sort((a,c)=>(env.hpRatio?.(a)??1)-(env.hpRatio?.(c)??1))[0];}
function clearOne(b,side,u,only=null){
 const bad=new Set(['atkDown','defDown','spdDown','accuracyDown','evasionDown','vulnerable','healDown','mpRecoveryDown','reviveSeal','poison','burn','bleed','curse']);
 const lists=[effects(b,side,u),statuses(b,side,u)];for(const list of lists){const i=list.findIndex(e=>active(e)&&(only?(e.kind??e.id)===only:bad.has(e.kind??e.id)));if(i>=0){const [removed]=list.splice(i,1);if(side==='ally'&&Array.isArray(u.ailments))u.ailments=u.ailments.filter(e=>(e.id??e)!==(removed.id??removed.kind));return true;}}return false;
}
export function beginPairSequence409(b,plan,env){
 const p=PAIR_SERIES409[plan.pair.id];if(!p||b.pairEnhancements409===false)return null;
 const c={prepared415:new Map(),fallbackHits415:new Set(),b,plan,env,p,side:plan.side,other:plan.side==='enemy'?'ally':'enemy',hitTargets:new Set(),statusHits:new Set(),dispelled:0,cleansed:0,overflow:0,retargeted:false,triggered:false,hitIndex:0};
 const momentum=pairState409(b).momentum[key(c.side,p.id)];if(momentum?.round===round(b)){c.momentum=.1;delete pairState409(b).momentum[key(c.side,p.id)];}
 return c;
}
export function notePairDispel409(c,result){if(c&&result)c.dispelled++;}
export function notePairCleanse409(c,result){if(c)c.cleansed+=n(result);}
export function notePairMp409(c,result){if(c)c.overflow+=n(result?.overflow);}
export async function beforePairHit409(c,pair,target,index,chosen){
 if(!c)return pair;
 const {b,p,side,other,env}=c;let out={...pair,damageMultiplier409:(pair.damageMultiplier409??1)*(1+(c.momentum??0))};
 if(p.id==='mirrors'&&matchedTarget(b,side,p,target.id)&&(c.triggered||claim(b,side,p))){c.triggered=true;out.damageMultiplier409*=1.20;}
 if(p.id==='foxmoon'&&(has(b,other,target,'burn')||c.prepared415.get(target.id)?.has('burn'))&&matchedTarget(b,side,p,target.id)&&(c.triggered||claim(b,side,p))){c.triggered=true;if(has(b,other,target,'burn'))out.guaranteedHit409=true;else out.accuracyBonus415=.20;}
 if(p.id==='starconfluence'&&pair.finisher390&&(c.triggered||claim(b,side,p))){c.triggered=true;out.guaranteedHit409=true;}
 if(p.id==='eclipsecrown'&&target!==chosen&&!c.retargeted&&canClaim(b,side,p)){
  c.retargeted=true;const removed=env.dispel?.(target);if(removed){claim(b,side,p);c.triggered=true;c.dispelled++;}
 }
 if(p.id==='twinkeys'&&c.dispelled>0&&index===pair.hits-1&&claim(b,side,p)){c.triggered=true;out.defenseIgnore=.60;}
 c.beforeStatuses=new Set(['poison','burn','freeze','bleed','sleep'].filter(id=>has(b,other,target,id)));
 c.beforeHealDown=has(b,other,target,'healDown');
 c.beforeDouble=pair.bonusVsEffects?.kinds.every(kind=>has(b,other,target,kind));
 c.fallbackCurrent415=c.prepared415.get(target.id)??new Set();
 c.beforeHpRatio=env.opponentHpRatio?.(target)??1;c.hitIndex++;return out;
}
export function afterPairHit409(c,target,damage,pair){
 if(!c)return;c.lastHitLanded=damage>0;if(damage<=0)return;const {b,p,side,other}=c;c.hitTargets.add(target.id);for(const type of c.fallbackCurrent415??[])c.fallbackHits415.add(type);
 for(const status of ['poison','burn','freeze','bleed','sleep'])if(c.beforeStatuses?.has(status)||has(b,other,target,status))c.statusHits.add(status);
 if(c.beforeDouble||pair.bonusVsEffects?.kinds.every(kind=>has(b,other,target,kind)))c.doubleDebuffHit=true;else if(pair.bonusVsEffects?.kinds.every(kind=>has(b,other,target,kind)||c.fallbackCurrent415?.has(kind)))c.fallbackDouble415=true;
 if(pair.finisher386)c.burstHit=true;
 if(pair.finisher386&&c.beforeHpRatio<=.35)c.finaleHit=true;
 const set=(kind,value,turns)=>{c.env.weaken?.(target,{kind,value,turns,sourceKey:`pair:${p.id}`,pairMaximum409:true});};
 if(p.id==='talismans'&&c.beforeHealDown&&canClaim(b,side,p)){
  const e=effects(b,other,target).find(e=>e.kind==='healDown'&&active(e));if(e&&n(e.turns)<3&&claim(b,side,p)){e.turns=Math.min(3,e.turns+1);c.triggered=true;}
 }
 if(p.id==='wisteria'&&has(b,other,target,'poison')&&claim(b,side,p)){set('healDown',.40,2);c.triggered=true;}
 if(p.id==='crimsonwings'&&(has(b,other,target,'bleed')||c.fallbackCurrent415?.has('bleed'))&&claim(b,side,p)){set('healDown',has(b,other,target,'bleed')?.20:.10,2);c.triggered=true;}
 if(p.id==='dreamharvest'&&c.statusHits.has('sleep')&&claim(b,side,p)){set('accuracyDown',.15,2);c.triggered=true;}
}
export async function finishPairSequence409(c,valid){
 if(!c||!valid())return;const {b,p,side,env,plan}=c,members=plan.members;
 const run=async(condition,fn,owner='')=>{if(condition&&valid()&&claim(b,side,p,owner)){c.triggered=true;await fn();}};
 const heal=async(u,rate)=>{if(u&&valid())await env.heal?.(u,rate,plan.partner);};
 await run(p.id==='garden'&&(c.statusHits.has('poison')||c.fallbackHits415.has('poison')),()=>heal(lowest(b,side,env),c.statusHits.has('poison')?.08:.04));
 await run(p.id==='starthread'&&c.burstHit,()=>{const u=lowest(b,side,env);if(u)putEffect(b,side,u,'guard',.20,1,p);});
 await run(p.id==='stitch'&&plan.pair.rescue387&&c.hitTargets.size>0,()=>{for(const u of members)clearOne(b,side,u);});
 await run(p.id==='glassaria'&&(c.doubleDebuffHit||c.fallbackDouble415),async()=>{for(const u of members)if(valid())await env.restoreMp?.(u,c.doubleDebuffHit?.04:.02,plan.partner);});
 await run(p.id==='rosevow'&&plan.pair.rescue387&&c.lastHitLanded,()=>{const u=[...members].sort((a,c)=>(env.hpRatio?.(a)??1)-(env.hpRatio?.(c)??1))[0];clearOne(b,side,u,'healDown');});
 await run(p.id==='twinclock'&&c.doubleDebuffHit,()=>{for(const u of members){const e=effects(b,side,u).find(e=>e.kind==='spdUp'&&e.sourceKey===`pair:${p.id}`);if(e){e.value=.25;e.pairMaximum409=true;}else putEffect(b,side,u,'spdUp',.25,2,p);}});
 await run(p.id==='twinthunder'&&c.burstHit,()=>grantDiscount(b,side,p,members));
 await run(p.id==='frostshatter'&&(c.statusHits.has('freeze')||c.fallbackHits415.has('freeze')),()=>{for(const u of members)pairState409(b).guards[key(side,u.id)]={rate:c.statusHits.has('freeze')?.10:.05,expires:round(b)+1,pairId:p.id};});
 await run(p.id==='oathreturn'&&plan.pair.reaction390&&c.hitTargets.size>0,()=>heal(plan.actor,.05),plan.actor.speciesId);
 await run(p.id==='absolutionbells'&&c.cleansed>0,()=>{for(const u of members)writePairShield409(b,side,u,.10,p.id);});
 await run(p.id==='eclipserenewal'&&c.overflow>0,()=>grantDiscount(b,side,p,members));
 await run(p.id==='dragonliberation'&&c.dispelled>0,()=>{for(const u of members)writePairShield409(b,side,u,.28,p.id);});
 await run(p.id==='crownsfinale'&&c.finaleHit,()=>{pairState409(b).momentum[key(side,p.id)]={round:round(b)+1};});
 if(c.triggered)cue(b,side,p,p.identity);
}
export function pairCondition409(b,side,pairId){
 const p=PAIR_SERIES409[pairId];if(!p)return '';
 if(!b)return p.identity;
 if(!ready(b,side,p))return '相乗効果は休止中';
 const s=pairState409(b),k=key(side,p.id),mark=s.marks[k];
 if(p.id==='wings')return n(s.totals[k])?'相乗：戦闘中使用済み':'HP30%以下で救援';
 if(['mirrors','foxmoon'].includes(p.id))return mark?.round===round(b)&&p.members.every(id=>mark.targets[id])?(new Set(Object.values(mark.targets)).size===1?'標的一致':'標的が別'):'同じ敵を狙う';
 if(['twinthunder','eclipserenewal'].includes(p.id)&&p.members.some(id=>s.discounts[key(side,id)]?.expires>=round(b)))return '次の固有技 MP−10%';
 if(p.id==='crownsfinale'&&s.momentum[k]?.round===round(b))return '次の共鳴 +10%';
 const used=s.used[k];return used?.round===round(b)?'相乗：今R発動済み':p.identity;
}

// Cache consumed marks for this one sequence, including multi-hit attacks.
export function pairPreparationBonus415(c,pair,target){
 if(!c)return 1;const {b,side,other,p,plan}=c;
 let cached=c.prepared415.get(target.id);if(!cached){
  cached=new Set();c.prepared415.set(target.id,cached);
  const required=pair.bonusVsEffects?.kinds??(pair.bonusVsStatus?[pair.bonusVsStatus.id]:({garden:['poison'],wisteria:['poison'],crimsonwings:['bleed'],frostshatter:['freeze'],foxmoon:['burn']}[p.id]??[]));
  if(required.every(type=>has(b,other,target,type)||preparationAvailable415(b,side,p.id,target.id,type,plan.partner.speciesId)))for(const type of required)if(!has(b,other,target,type)&&takePreparation415(b,side,p.id,target.id,type,plan.partner.speciesId))cached.add(type);
 }
 let bonus=1;
 if(pair.bonusVsStatus&&!has(b,other,target,pair.bonusVsStatus.id)&&cached.has(pair.bonusVsStatus.id))bonus*=1+(pair.bonusVsStatus.multiplier-1)*.5;
 if(pair.bonusVsEffects&&!pair.bonusVsEffects.kinds.every(type=>has(b,other,target,type))&&pair.bonusVsEffects.kinds.every(type=>has(b,other,target,type)||cached.has(type)))bonus*=1+(pair.bonusVsEffects.multiplier-1)*.5;
 return bonus;
}
