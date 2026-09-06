import {ENDGAME_ULTIMATES,ENDGAME_ULTIMATE_BY_ID,isEndgameUltimate} from '../data/endgameUltimates.js?v=3.1.38-build358';
import {attributeDamageMultiplier} from '../data/attributes.js';

// Serializable battle-local rules shared by browser, co-op, raid and 4v4.
// Absolute rounds protect these skills from legacy CT resets and extra actions.
export {ENDGAME_ULTIMATES,ENDGAME_ULTIMATE_BY_ID,isEndgameUltimate};
export const ultimateUnitId=u=>String(u?.playerId??u?.id??'');
export const ultimateHp=u=>Math.max(0,Number(u?.currentHp??u?.hp)||0);
export const ultimateMp=u=>Math.max(0,Number(u?.mp??u?.currentMp)||0);
const registryKey=Symbol.for('abyss.ultimateVitals358');
// Node treats browser cache-query imports as distinct module URLs. Sharing only
// these weak runtime guards prevents re-entrant HP interception across adapters.
const {directVitals,vitalGuards}=globalThis[registryKey]??={directVitals:new WeakSet(),vitalGuards:new WeakMap()};
const setHp=(u,n)=>{if(!u)return;directVitals.add(u);try{if('currentHp'in u)u.currentHp=Math.max(0,Math.floor(n));else u.hp=Math.max(0,Math.floor(n))}finally{directVitals.delete(u)}};
// Legacy combat has several direct HP writers (items, regeneration, counters,
// hero skills). Battle-local accessors route all of them through one defensive
// rule. They serialize as ordinary numbers and are removed on battle cleanup.
export function attachUltimateVitals(b){
 if(!ultimateUnits(b).some(u=>u.endgameBossId)||b.onlineMode)return b;
 for(const u of ultimateUnits(b)){
  const key='currentHp'in u?'currentHp':'hp',old=vitalGuards.get(u);
  if(old?.battle===b)continue;if(old)detachUltimateVital(u);
  const descriptor=Object.getOwnPropertyDescriptor(u,key);if(descriptor&&!descriptor.configurable)continue;
  const record={battle:b,key,value:Math.max(0,Number(u[key])||0),descriptor};vitalGuards.set(u,record);
  Object.defineProperty(u,key,{enumerable:true,configurable:true,get(){return record.value},set(value){
   const requested=Math.max(0,Number(value)||0),before=record.value;
   if(directVitals.has(u)||!b.ultimates358?.effects?.length){record.value=requested;return}
   if(requested<before){const ctx=b._ultimateAction358??{},source=find(b,ctx.sourceId),amount=ultimateIncomingDamage(b,u,before-requested,{source,element:ctx.element,damageClass:ctx.damageClass,direct:ctx.direct!==false});record.value=Math.max(0,record.value-amount);ultimateAfterDamage(b,u,Math.max(0,before-record.value),{source,direct:ctx.direct!==false});}
   else if(requested>before){record.value=before+ultimateHealingAmount(b,u,requested-before,maxHp(b,u));}
  }});
 }
 return b;
}
function detachUltimateVital(u){const old=vitalGuards.get(u);if(!old)return;Object.defineProperty(u,old.key,{value:old.value,writable:true,enumerable:old.descriptor?.enumerable??true,configurable:true});vitalGuards.delete(u)}
export function beginUltimateAction(b,u,skill=null,{direct=true}={}){b._ultimateAction358={sourceId:ultimateUnitId(u),element:skill?.element??u?.element??u?.attribute??null,damageClass:skill?.damageClass??((ultimateStats(b,u).matk??0)>(ultimateStats(b,u).atk??0)?'magic':'physical'),direct};}
export function finishUltimateAction(b){delete b._ultimateAction358;syncUltimateCircles(b)}

const setMp=(u,n)=>{if('mp'in u)u.mp=Math.max(0,Math.floor(n));else u.currentMp=Math.max(0,Math.floor(n))};
const round=b=>Math.max(1,Math.floor(Number(b?.turn??b?.round)||1));
export function ultimateUnits(b){return [...(b?.party??Object.values(b?.players??{})),...(b?.boss?[b.boss,...(b.minions??[])]:b?.enemies??[])].filter((u,i,a)=>u&&a.indexOf(u)===i)}
export function ultimateTeam(b,u){return u?.side??((b?.party??Object.values(b?.players??{})).includes(u)?'ally':'enemy')}
const teammates=(b,u)=>ultimateUnits(b).filter(x=>ultimateTeam(b,x)===ultimateTeam(b,u));
const opponents=(b,u)=>ultimateUnits(b).filter(x=>ultimateTeam(b,x)!==ultimateTeam(b,u));
const find=(b,id)=>ultimateUnits(b).find(u=>ultimateUnitId(u)===id);
const state=b=>b.ultimates358??={version:1,ready:{},used:{},effects:[],lastSkills:{},echoRounds:{},events:[]};
export function ultimateStats(b,u){return b?.ultimateProfiles358?.[ultimateUnitId(u)]?.stats??u?.stats??{...u,hp:u?.maxHp??u?._maxHp??ultimateHp(u)}}
const maxHp=(b,u)=>Math.max(1,Number(ultimateStats(b,u).hp??u.maxHp)||1);
const maxMp=(b,u)=>Math.max(0,Number(b?.ultimateProfiles358?.[ultimateUnitId(u)]?.maxMp??u?.maxMp??u?.stats?.mp)||0);
function effects(b,u){if(b.players)return u.effects??=[];const key=(b.enemies??[]).includes(u)?'enemyEffects':'allyEffects';b[key]??={};return b[key][ultimateUnitId(u)]??=[]}
const value=(b,u,kind)=>effects(b,u).filter(e=>e.kind===kind&&(e.turns??1)>0).reduce((sum,e)=>sum+(Number(e.value)||0),0);
const POSITIVE=new Set(['atkUp','defUp','spdUp','evasionUp','accuracyUp','critUp','regen','guard','counter','lifeSteal','guaranteedHit','guaranteedCritical']);
const supportedBuff=e=>POSITIVE.has(e.kind)&&!e.ultimate358;
const linkKinds=new Set(['doom','register','exile','possession','wall','furnace','borrow','stolenLove','idle','echo']);
function active(b,e){return !e.done&&(e.until==null||e.until>=round(b))&&(!linkKinds.has(e.kind)||ultimateHp(find(b,e.source))>0)}
const matching=(b,kind,u=null)=>(b?.ultimates358?.effects??[]).filter(e=>e.kind===kind&&active(b,e)&&(!u||e.targets?.includes(ultimateUnitId(u))));
const emit=(b,kind,u,label,amount=0,source=null)=>{state(b).events.push({kind,targetId:ultimateUnitId(u),actorId:ultimateUnitId(source),targetKind:u?.playerId||b.party?.includes(u)?'player':'enemy',value:Math.max(0,Math.floor(amount)),label,actorName:source?.name??source?.nickname??'権能'});};
function put(b,u,kind,amount,turns,source,label){const list=effects(b,u),sourceKey=`ultimate358:${ultimateUnitId(source)}:${label}:${kind}`,old=list.find(e=>e.sourceKey===sourceKey),entry={kind,value:amount,turns:turns+1,sourceKey,name:label,sourceSkillName:label,ultimate358:true,expires358:round(b)+turns-1};if(old)Object.assign(old,entry);else list.push(entry)}
function schedule(b,kind,source,targets,duration,extra={}){const e={kind,source:ultimateUnitId(source),targets:targets.map(ultimateUnitId),until:round(b)+duration-1,...extra};state(b).effects.push(e);return e}
function immune(b,u,id){const p=b?.ultimateProfiles358?.[ultimateUnitId(u)]?.statusProfile??u.statusProfile;return(p?.immune??[]).includes(id)||value(b,u,`immune:${id}`)>0}
function sealed(b,u){return effects(b,u).some(e=>e.kind==='reviveSeal'&&(e.turns??1)>0)}
export function prepareUltimateBattle(b,{stats,skills,mp,statusProfile}={}){
 b.ultimateProfiles358??={};
 for(const u of ultimateUnits(b)){const id=ultimateUnitId(u),old=b.ultimateProfiles358[id]??{};b.ultimateProfiles358[id]={...old,stats:stats?stats(u):u.stats??old.stats??{...u,hp:u.maxHp},maxMp:mp?mp(u):u.maxMp??u.stats?.mp??old.maxMp??0,skills:skills?skills(u):u.skills??old.skills??[],statusProfile:statusProfile?statusProfile(u):u.statusProfile??old.statusProfile};}
 attachUltimateVitals(b);return b;
}
export function ultimateIsolated(b,u){return matching(b,'exile',u).length>0}
export function ultimateExtraBlocked(b,u){return matching(b,'idle',u).length>0||ultimateIsolated(b,u)}
export function ultimateBasicOnly(b,u){return matching(b,'idle').some(e=>e.source===ultimateUnitId(u))}
export function ultimateCost(b,u){return Math.ceil(maxMp(b,u)*.6)}
export function ultimateRemaining(b,u,id){return Math.max(0,4-round(b),(b?.ultimates358?.ready?.[ultimateUnitId(u)]?.[id]??0)-round(b))}
function normalSkills(b,u){return(b?.ultimateProfiles358?.[ultimateUnitId(u)]?.skills??u.skills??[]).filter(s=>s&&!isEndgameUltimate(s))}
function lastOpposingSkill(b,u){return Object.entries(b?.ultimates358?.lastSkills??{}).filter(([team])=>team!==ultimateTeam(b,u)).map(([,s])=>s).sort((a,c)=>c.serial-a.serial)[0]?.skill??null}
export function ultimateAvailability(b,u,id){
 const s=ENDGAME_ULTIMATE_BY_ID[id];if(!s||s.owner!==u?.endgameBossId)return{ok:false,reason:'このキャラの技ではありません'};
 if(ultimateHp(u)<=0||ultimateIsolated(b,u)||effects(b,u).some(e=>(e.turns??1)>0&&['stun','status:stun','status:sleep','status:freeze','status:paralysis','status:charm','status:confusion'].includes(e.kind)))return{ok:false,reason:'行動できません'};
 if(ultimateBasicOnly(b,u))return{ok:false,reason:'領域中は通常攻撃のみ'};
 if(s.once&&b.ultimates358?.used?.[ultimateUnitId(u)]?.[id])return{ok:false,reason:'この戦闘では使用済み'};
 const remaining=ultimateRemaining(b,u,id);if(remaining)return{ok:false,reason:round(b)<=3?`開幕待機 ${remaining}T`:`再使用まで ${remaining}T`,remaining};
 if(ultimateMp(u)<ultimateCost(b,u))return{ok:false,reason:'MPが足りません'};
 const foes=opponents(b,u).filter(x=>ultimateHp(x)>0&&!ultimateIsolated(b,x));
 if(['voidExile','royalOverride','allDevour','ownershipTransfer','kneelAll'].includes(s.key)&&!foes.length)return{ok:false,reason:'対象がいません'};
 if(s.key==='allRebirth'&&!teammates(b,u).some(x=>x!==u&&!ultimateIsolated(b,x)&&(ultimateHp(x)>0?ultimateHp(x)<maxHp(b,x):!sealed(b,x))))return{ok:false,reason:'回復・蘇生が必要な仲間がいません'};
 if(s.key==='betterThanYou'&&!lastOpposingSkill(b,u))return{ok:false,reason:'まだ模倣できる敵スキルがありません'};
 if(s.key==='kneelAll'&&!foes.some(x=>ultimateHp(x)/maxHp(b,x)<ultimateHp(u)/maxHp(b,u)))return{ok:false,reason:'自分よりHP割合の低い敵がいません'};
 if(s.key==='royalOverride'&&!foes.some(x=>!immune(b,x,'charm')&&(b.ultimates358?.controlRecovery?.[ultimateUnitId(x)]??0)<round(b)))return{ok:false,reason:'敵は支配を無効化します'};
 return{ok:true,cost:ultimateCost(b,u)};
}
export function chooseEndgameUltimate(b,u,availableSkills=null){
 const s=ENDGAME_ULTIMATES[u?.endgameBossId];if(!s||availableSkills&&!availableSkills.some(x=>x.id===s.id)||!ultimateAvailability(b,u,s.id).ok)return null;
 const hp=ultimateHp(u)/maxHp(b,u);if(s.key==='allDevour'&&hp>.85&&opponents(b,u).every(x=>ultimateMp(x)<maxMp(b,x)*.2))return null;
 if(s.key==='undyingRage'&&hp>.65)return null;
 if(s.key==='allRebirth'&&teammates(b,u).every(x=>x===u||ultimateHp(x)/maxHp(b,x)>.55))return null;
 return s;
}
function chooseTarget(b,u,id){const candidates=opponents(b,u).filter(x=>ultimateHp(x)>0&&!ultimateIsolated(b,x));return candidates.find(x=>ultimateUnitId(x)===id)??candidates.sort((a,c)=>Math.max(ultimateStats(b,c).atk??0,ultimateStats(b,c).matk??0)-Math.max(ultimateStats(b,a).atk??0,ultimateStats(b,a).matk??0))[0]}
function cleanse(b,u){const list=effects(b,u);list.splice(0,list.length,...list.filter(e=>supportedBuff(e)||POSITIVE.has(e.kind)));if(b.allyAilments?.[ultimateUnitId(u)])b.allyAilments[ultimateUnitId(u)]=[];if(b.enemyStatuses?.[ultimateUnitId(u)])b.enemyStatuses[ultimateUnitId(u)]=[];u.ailments=[];u.statuses=[];u.status=null;for(const e of matching(b,'possession',u))e.done=true;}
function stealBuffs(b,u,target,count){const list=effects(b,target),picked=list.filter(supportedBuff).slice(0,count);for(const e of picked){list.splice(list.indexOf(e),1);effects(b,u).push({...e,sourceKey:`ultimate358:stolen:${ultimateUnitId(u)}:${e.kind}`,turns:Math.min(3,e.turns??3)})}return picked}
export function ultimateHealingAmount(b,u,requested,maximum=maxHp(b,u)){
 if(!b?.ultimates358)return requested;
 if(ultimateIsolated(b,u)||matching(b,'rage',u).length)return 0;
 const possible=Math.max(0,Math.min(Number(requested)||0,maximum-ultimateHp(u))),theft=matching(b,'stolenLove',u)[0];if(!theft||possible<=0)return requested;
 const caster=find(b,theft.source),receivers=teammates(b,caster).filter(x=>ultimateHp(x)>0&&!ultimateIsolated(b,x)&&!matching(b,'rage',x).length),stolen=Math.floor(possible*.5);let remaining=stolen;
 for(let i=0;i<receivers.length;i++){const target=receivers[i],share=Math.ceil(remaining/(receivers.length-i)),before=ultimateHp(target);setHp(target,Math.min(maxHp(b,target),before+share));remaining-=share;emit(b,'heal',target,'恋獄・回復横取り',ultimateHp(target)-before,caster)}
 return Math.max(0,requested-stolen);
}
function heal(b,u,amount,source,label){if(ultimateHp(u)<=0||ultimateIsolated(b,u))return 0;const before=ultimateHp(u),received=ultimateHealingAmount(b,u,Math.floor(amount*Math.max(0,1-value(b,u,'healDown'))));setHp(u,Math.min(maxHp(b,u),before+received));emit(b,'heal',u,label,ultimateHp(u)-before,source);return ultimateHp(u)-before}
function forceDeath(b,u,source,label){if(ultimateHp(u)<=0)return;const before=ultimateHp(u);setHp(u,0);emit(b,'ultimateDeath',u,label,before,source)}
export function ultimateIncomingDamage(b,target,amount,{source=null,element=null,damageClass=null,direct=true}={}){
 if(!b?.ultimates358)return amount;
 if(ultimateIsolated(b,target))return 0;
 let n=Math.max(0,Number(amount)||0);
 if(source&&direct&&damageClass==='physical'&&matching(b,'rage',source).length)n*=2;
 if(element&&matching(b,'reverse').length){const targetElement=target.attribute??target.element??b.ultimateProfiles358?.[ultimateUnitId(target)]?.stats?.element??'neutral',base=attributeDamageMultiplier(element,targetElement);if(base!==1)n/=base*base;const resistance=target.elementMultipliers?.[element];if(resistance>0&&resistance!==1)n/=resistance*resistance;}
 const wall=matching(b,'wall',target).find(e=>!e.spent?.includes(ultimateUnitId(target)));
 if(n>=ultimateHp(target)&&n>0&&wall){wall.spent??=[];wall.spent.push(ultimateUnitId(target));const caster=find(b,wall.source);setHp(caster,ultimateHp(caster)-Math.floor(maxHp(b,caster)*.1));emit(b,'shield',target,'絶対神壁・致死無効',n,caster);return 0}
 if(matching(b,'rage',target).length)n=Math.min(n,Math.max(0,ultimateHp(target)-1));
 return Math.max(0,Math.floor(n));
}
export function ultimateAfterDamage(b,target,dealt,{source=null,direct=true}={}){
 if(!(dealt>0)||!source||!direct||!b?.ultimates358||b._ultimateDerived358)return;
 for(const e of matching(b,'furnace')){const caster=find(b,e.source);if(caster&&ultimateTeam(b,caster)===ultimateTeam(b,source)&&ultimateTeam(b,caster)!==ultimateTeam(b,target))e.stored=Math.min(maxHp(b,caster)*1.5,(e.stored??0)+dealt*.5)}
}
function damage(b,source,target,amount,{element=null,damageClass=null,direct=true,label='権能',ignoreShield=false}={}){
 const before=ultimateHp(target);let n=Math.max(0,Math.floor(amount));
 if(!ignoreShield){for(const key of ['shield','heroShield348','_floorBossHpShield']){const absorbed=Math.min(Number(target[key])||0,n);if(absorbed){target[key]-=absorbed;n-=absorbed}}for(const store of [b.circleShields,b.signatureShields]){const absorbed=Math.min(Number(store?.[ultimateUnitId(target)])||0,n);if(absorbed){store[ultimateUnitId(target)]-=absorbed;n-=absorbed}}}
 n=ultimateIncomingDamage(b,target,n,{source,element,damageClass,direct});setHp(target,ultimateHp(target)-n);const dealt=Math.max(0,before-ultimateHp(target));ultimateAfterDamage(b,target,dealt,{source,direct});emit(b,'damage',target,label,dealt,source);return dealt;
}
export function ultimateCircle(b,u,fallback){if(!b?.ultimates358)return fallback;const e=matching(b,'borrow').find(e=>e.source===ultimateUnitId(u)||e.targets.includes(ultimateUnitId(u)));if(!e)return fallback;return e.source===ultimateUnitId(u)?e.circle:null}
function circleOf(b,u){return u.enemyMagicCircle??b.magicCircleProfiles?.[ultimateUnitId(u)]??(u.circleEffect&&u.circleEffect!=='none'?{id:u.circleId,name:u.circleName??'魔法陣',effect:u.circleEffect,level:u.circleLevel}:null)}
function borrowCircle(b,u,target,e){
 e.circle=circleOf(b,target);e.oldCircleFields=[u,target].map(x=>({id:ultimateUnitId(x),circleId:x.circleId,circleEffect:x.circleEffect,circleLevel:x.circleLevel,enemyMagicCircle:x.enemyMagicCircle,magicCircleName:x.magicCircleName,magicCircleLevel:x.magicCircleLevel}));
 syncUltimateCircles(b);
}
function applyCircleFields(u,circle){u.circleId=circle?.id??'none';u.circleEffect=circle?.effect??'none';u.circleLevel=circle?.level??0;if('enemyMagicCircle'in u){u.enemyMagicCircle=circle;u.magicCircleName=circle?.name??null;u.magicCircleLevel=circle?.level??0}}
function returnCircle(b,e){for(const old of e.oldCircleFields??[]){const u=find(b,old.id);if(u)for(const key of ['circleId','circleEffect','circleLevel','enemyMagicCircle','magicCircleName','magicCircleLevel']){if(old[key]===undefined)delete u[key];else u[key]=old[key]}}}
export function syncUltimateCircles(b){for(const e of b?.ultimates358?.effects??[]){if(e.kind!=='borrow')continue;if(!active(b,e)){returnCircle(b,e);e.done=true;continue}const source=find(b,e.source),target=find(b,e.targets[0]);if(source)applyCircleFields(source,e.circle);if(target)applyCircleFields(target,null)}}
function normalCost(b,u,s){return Math.max(0,Math.ceil(Number(s._cost358??s.onlineMpCost??s.mp)||0))}
// Replays canonical skill data; generated skills and endgame skills use the same
// attack/heal/effect vocabulary. Replays never invoke an ultimate or another replay.
export function replayUltimateOrdinary(b,u,s,{team=ultimateTeam(b,u),scale=1,charge=true,targetId=null,random=Math.random}={}){
 if(!s||isEndgameUltimate(s)||ultimateHp(u)<=0||ultimateIsolated(b,u))return false;const cost=normalCost(b,u,s);if(charge&&ultimateMp(u)<cost)return false;if(charge)setMp(u,ultimateMp(u)-cost);
 const all=ultimateUnits(b),allies=all.filter(x=>ultimateTeam(b,x)===team),foes=all.filter(x=>ultimateTeam(b,x)!==team&&ultimateHp(x)>0&&!ultimateIsolated(b,x)),living=allies.filter(x=>ultimateHp(x)>0&&!ultimateIsolated(b,x));
 const type=s.type??s.kind,group=s.allAllies||s.target==='味方全体'||type==='allHeal',friendly=group?living:[living.find(x=>ultimateUnitId(x)===targetId)??(living.includes(u)?u:living[0])].filter(Boolean),targets=s.allEnemies?foes:[foes.find(x=>ultimateUnitId(x)===targetId)??foes.slice().sort((a,c)=>ultimateHp(a)/maxHp(b,a)-ultimateHp(c)/maxHp(b,c))[0]].filter(Boolean);
 if(['revive','allHeal'].includes(type)&&s.revive){const fallen=allies.find(x=>ultimateHp(x)<=0&&!sealed(b,x));if(fallen&&(b.reviveCount??0)<99){const transferred=s.reviveTransferRate?Math.floor(ultimateHp(u)*s.reviveTransferRate):0;if(transferred)setHp(u,ultimateHp(u)-transferred);setHp(fallen,Math.max(1,Math.min(maxHp(b,fallen),transferred||maxHp(b,fallen)*s.revive*scale)));setMp(fallen,maxMp(b,fallen)*(s.reviveMp??0));b.reviveCount=(b.reviveCount??0)+1;emit(b,'revive',fallen,s.name,ultimateHp(fallen),u)}}
 if(['selfHeal','allHeal','heal'].includes(type)||['stance','buff'].includes(type)&&s.heal)for(const target of friendly){heal(b,target,maxHp(b,target)*(s.heal??.25)*scale,u,s.name);if(s.cleanse)cleanse(b,target)}
 if(type==='mpHeal')for(const target of friendly)setMp(target,Math.min(maxMp(b,target),ultimateMp(target)+Math.floor(maxMp(b,target)*(s.mpHeal??.25)*scale)));
 if(s.clearNegativeSelf)cleanse(b,u);if(type==='cleanse'||s.cleanse&&['buff','stance'].includes(type))for(const target of friendly)cleanse(b,target);
 if(s.partyShieldRate)for(const target of living)target.heroShield348=Math.max(target.heroShield348??0,Math.floor(maxHp(b,target)*s.partyShieldRate*scale));
 let total=0;const stats=ultimateStats(b,u),affixes=stats._affixes??u.equipmentCombatEffects??{};
 if(s.selfHpCostRate)setHp(u,Math.max(1,ultimateHp(u)-Math.floor(ultimateHp(u)*s.selfHpCostRate)));
 if((s.power??0)>0)for(const target of targets)for(let hit=0;hit<(s.hits??1)&&ultimateHp(target)>0;hit++){
  const defense=ultimateStats(b,target),accuracy=Math.max(.05,Math.min(1,1-(defense.evasion??0)/100+value(b,u,'accuracyUp')-value(b,u,'accuracyDown')-value(b,target,'evasionUp')+value(b,target,'evasionDown')));if(!s.guaranteedHit&&!value(b,u,'guaranteedHit')&&random()>accuracy){emit(b,'miss',target,s.name,0,u);continue}
  const magic=s.damageClass==='magic',hybrid=s.damageClass==='hybrid',attack=hybrid?Math.max(stats.atk??0,stats.matk??0):magic?(stats.matk??stats.atk):stats.atk,def=hybrid?Math.min(defense.def??0,defense.mdef??0):magic?(defense.mdef??defense.def):defense.def,critical=s.guaranteedCritical||value(b,u,'guaranteedCritical')>0||random()<Math.min(.95,(stats.crit??10)/100+(s.critBonus??0)+value(b,u,'critUp'));
  const element=s.randomElement?['fire','water','lightning','earth','light','dark'][Math.floor(random()*6)]:s.element??u.element??u.attribute??'neutral',targetElement=target.element??target.attribute??'neutral',execution=s.execute&&ultimateHp(target)/maxHp(b,target)<=s.execute?2:1,ignore=Math.min(.9,s.defenseIgnore??0),raw=Math.max(1,attack*Math.max(.2,1+value(b,u,'atkUp')-value(b,u,'atkDown'))*(s.power??1)-(def??0)*Math.max(.2,1+value(b,target,'defUp')-value(b,target,'defDown'))*(1-ignore)*.55),bonus=(s.bonusVsEnemyBuff&&effects(b,target).some(supportedBuff)?s.bonusVsEnemyBuff.multiplier:1)*(s.bonusVsEffect&&value(b,target,s.bonusVsEffect.kind)>0?s.bonusVsEffect.multiplier:1);
  const ramp=s.turnPowerStep?Math.min(s.turnPowerCap??2,1+(round(b)-1)*s.turnPowerStep):1,low=s.lowHpBonus&&ultimateHp(u)/maxHp(b,u)<=(s.lowHpThreshold??.5)?1+s.lowHpBonus:1;const reduction=Math.min(.8,value(b,target,'guard')),n=(raw*scale*execution*bonus*ramp*low*(critical?1.7+(affixes.critDamage??0)/100:1)*(1+(affixes.skillPower??0)/100)*attributeDamageMultiplier(element,targetElement)*(1+value(b,target,'vulnerable'))*(1-reduction));total+=damage(b,u,target,n,{element,damageClass:magic?'magic':'physical',label:s.name});
  if(s.currentHpDamage&&ultimateHp(target)>0)total+=damage(b,u,target,ultimateHp(target)*Math.min(.25,s.currentHpDamage)*scale,{label:s.name});
  if(s.stealOneBuffRate||s.stealEnemyBuffRate){const picked=stealBuffs(b,u,target,1);for(const effect of picked){const copy=effects(b,u).find(e=>e.sourceKey===`ultimate358:stolen:${ultimateUnitId(u)}:${effect.kind}`);if(copy)copy.value*=s.stealOneBuffRate??s.stealEnemyBuffRate}}
  if(s.dispelOne||s.dispelEnemyBuff){const list=effects(b,target),e=list.find(supportedBuff);if(e)list.splice(list.indexOf(e),1)}
  if(s.copyAtk){const own=ultimateStats(b,u),other=ultimateStats(b,target);put(b,u,'atkUp',Math.max(0,(Math.max(other.atk,other.matk)*s.copyAtk)/Math.max(1,Math.max(own.atk,own.matk))),2,u,s.name)}
  if(s.invertOneBuff||s.invertEnemyBuffRate){const list=effects(b,target),entry=list.find(supportedBuff),negative={atkUp:'atkDown',defUp:'defDown',spdUp:'spdDown',accuracyUp:'accuracyDown',evasionUp:'evasionDown',guard:'vulnerable',regen:'healDown'};if(entry){list.splice(list.indexOf(entry),1);list.push({...entry,kind:negative[entry.kind]??'vulnerable',value:(entry.value??.1)*(s.invertRate??s.invertEnemyBuffRate??1)})}}
  if(s.mpDrain){const stolen=Math.floor(ultimateMp(target)*s.mpDrain*scale);setMp(target,ultimateMp(target)-stolen);setMp(u,Math.min(maxMp(b,u),ultimateMp(u)+stolen))}
  if(s.status&&random()<(s.status.chance??1)&&!immune(b,target,s.status.id))effects(b,target).push({kind:`status:${s.status.id}`,name:s.status.name,value:s.status.power??0,turns:s.status.turns??2});
 }
 if(s.drain&&total)heal(b,u,total*s.drain,u,s.name);if(s.selfHeal)heal(b,u,maxHp(b,u)*s.selfHeal*scale,u,s.name);
 for(const e of s.effects??[]){const affected=e.enemy?targets:e.allies?living:[u];for(const target of affected){if(ultimateHp(target)<=0||e.chance!=null&&random()>e.chance)continue;effects(b,target).push({...e,value:(e.value??0)*scale,turns:e.turns??2,sourceKey:`replay358:${ultimateUnitId(u)}:${s.id}:${e.kind}`})}}
 if(s.selfAtk)put(b,u,'atkUp',s.selfAtk*scale,3,u,s.name);
 if(s.increaseEnemyCooldowns||s.increaseAllyCooldowns)for(const target of targets){const cd=b.players?target.cooldowns??={}:(b.cooldowns??={})[ultimateUnitId(target)]??={};for(const id of Object.keys(cd))if(!isEndgameUltimate(id))cd[id]+=s.increaseEnemyCooldowns??s.increaseAllyCooldowns}
 if(s.reducePartyCooldowns)for(const target of living){const cd=b.players?target.cooldowns??={}:(b.cooldowns??={})[ultimateUnitId(target)]??={};for(const id of Object.keys(cd))if(!isEndgameUltimate(id))cd[id]=Math.max(0,cd[id]-s.reducePartyCooldowns)}
 emit(b,'ultimateReplay',u,`${s.name}・${Math.round(scale*100)}%再演`,0,u);return true;
}
export function castEndgameUltimate(b,u,id,{targetId=null,random=Math.random}={}){
 const available=ultimateAvailability(b,u,id);if(!available.ok)return available;const s=ENDGAME_ULTIMATE_BY_ID[id],st=state(b),source=ultimateUnitId(u),foes=opponents(b,u).filter(x=>ultimateHp(x)>0&&!ultimateIsolated(b,x)),allies=teammates(b,u),living=allies.filter(x=>ultimateHp(x)>0&&!ultimateIsolated(b,x));let target=chooseTarget(b,u,targetId);
 if(s.key==='royalOverride'&&(immune(b,target,'charm')||(st.controlRecovery?.[ultimateUnitId(target)]??0)>=round(b)))target=foes.find(x=>!immune(b,x,'charm')&&(st.controlRecovery?.[ultimateUnitId(x)]??0)<round(b));
 setMp(u,ultimateMp(u)-available.cost);(st.ready[source]??={})[id]=round(b)+s.cooldown+1;(st.used[source]??={})[id]=true;
 emit(b,'ultimateCast',u,s.name,0,u);
 switch(s.key){
  case 'finalHour':schedule(b,'doom',u,opponents(b,u),11,{due:round(b)+10});break;
  case 'voidExile':schedule(b,'exile',u,[target],2);break;
  case 'allRebirth':for(const x of allies.filter(x=>x!==u&&!ultimateIsolated(b,x))){if(ultimateHp(x)>0)heal(b,x,maxHp(b,x),u,s.name);else if(!sealed(b,x)&&(b.reviveCount??0)<99){setHp(x,maxHp(b,x));b.reviveCount=(b.reviveCount??0)+1;emit(b,'revive',x,s.name,ultimateHp(x),u)}}setHp(u,1);setMp(u,0);break;
  case 'deathRegister':schedule(b,'register',u,opponents(b,u),4,{due:round(b)+3});put(b,u,'defDown',.3,4,u,s.name);break;
  case 'onlyFuture':for(const x of living){put(b,x,'guaranteedHit',1,2,u,s.name);put(b,x,'guaranteedCritical',1,2,u,s.name)}schedule(b,'fateRecoil',u,foes,2);break;
  case 'reverseWorld':schedule(b,'reverse',u,ultimateUnits(b),2);break;
  case 'royalOverride':schedule(b,'possession',u,[target],2);effects(b,target).push({kind:'authorityPossession',name:'王命上書き',turns:3});put(b,u,'vulnerable',.4,2,u,s.name);break;
  case 'absoluteWall':schedule(b,'wall',u,living,2,{spent:[]});break;
  case 'finalFurnace':schedule(b,'furnace',u,foes,4,{due:round(b)+3,stored:0});break;
  case 'tenLaws':schedule(b,'echo',u,living,2);break;
  case 'allDevour':{const n=damage(b,u,target,ultimateHp(target)*.3,{ignoreShield:true,direct:false,label:s.name});heal(b,u,n,u,s.name);const mp=Math.floor(ultimateMp(target)*.5);setMp(target,ultimateMp(target)-mp);setMp(u,Math.min(maxMp(b,u),ultimateMp(u)+mp));stealBuffs(b,u,target,2);put(b,u,'spdDown',.5,2,u,s.name);put(b,u,'healDown',.5,2,u,s.name);break;}
  case 'undyingRage':schedule(b,'rage',u,[u],2);break;
  case 'betterThanYou':b._ultimateDerived358=true;try{replayUltimateOrdinary(b,u,lastOpposingSkill(b,u),{scale:1.5,charge:false,targetId,random})}finally{delete b._ultimateDerived358}break;
  case 'idleWorld':schedule(b,'idle',u,foes,2);break;
  case 'ownershipTransfer':{const e=schedule(b,'borrow',u,[target],3);borrowCircle(b,u,target,e);stealBuffs(b,u,target,2);break;}
  case 'stolenLove':schedule(b,'stolenLove',u,foes,2);put(b,u,'defDown',.35,2,u,s.name);break;
  case 'kneelAll':{const rate=ultimateHp(u)/maxHp(b,u),targets=foes.filter(x=>ultimateHp(x)/maxHp(b,x)<rate);for(const x of targets){const list=effects(b,x);list.splice(0,list.length,...list.filter(e=>!supportedBuff(e)));if(!immune(b,x,'stun')&&(st.controlRecovery?.[ultimateUnitId(x)]??0)<round(b))schedule(b,'kneel',u,[x],2)}setHp(u,ultimateHp(u)-Math.floor(ultimateHp(u)*.3));break;}
 }
 return{ok:true,skill:s,cost:available.cost};
}
export function beforeUltimateAction(b,u,{random=Math.random}={}){
 if(!b?.ultimates358)return false;if(ultimateIsolated(b,u)){emit(b,'statusBlock',u,'虚空隔離');return true}
 const kneel=matching(b,'kneel',u)[0];if(kneel){kneel.done=true;(state(b).controlRecovery??={})[ultimateUnitId(u)]=round(b)+1;emit(b,'statusBlock',u,'万軍跪伏');return true}
 const control=matching(b,'possession',u)[0];if(!control)return false;
 if(!effects(b,u).some(e=>e.kind==='authorityPossession'&&(e.turns??1)>0)){control.done=true;return false}
 control.done=true;const caster=find(b,control.source);effects(b,u).splice(0,effects(b,u).length,...effects(b,u).filter(e=>e.kind!=='authorityPossession'));if(!caster||ultimateHp(caster)<=0||immune(b,u,'charm'))return false;
 const skills=normalSkills(b,u).filter(s=>normalCost(b,u,s)<=ultimateMp(u)&&!(b.players?u.cooldowns?.[s.id]:b.cooldowns?.[ultimateUnitId(u)]?.[s.id]));const chosen=skills.sort((a,c)=>(c.power??c.heal??0)*(c.hits??1)-(a.power??a.heal??0)*(a.hits??1))[0]??{id:'attack',name:'たたかう',type:'attack',power:1,mp:0};
 replayUltimateOrdinary(b,u,chosen,{team:ultimateTeam(b,caster),charge:true,random});if(chosen.cooldown){const cd=b.players?u.cooldowns??={}:(b.cooldowns??={})[ultimateUnitId(u)]??={};cd[chosen.id]=chosen.cooldown+1}(state(b).controlRecovery??={})[ultimateUnitId(u)]=round(b)+1;return true;
}
export function afterUltimateOrdinary(b,u,skill,{random=Math.random,targetId=null}={}){
 if(!skill||skill.id==='attack'||isEndgameUltimate(skill)||b._ultimateDerived358||!ultimateUnits(b).some(x=>x.endgameBossId))return;
 const st=state(b);st.serial=(st.serial??0)+1;st.lastSkills[ultimateTeam(b,u)]={serial:st.serial,skill:{...skill}};
 if(ultimateHp(u)<=0||ultimateExtraBlocked(b,u)||!matching(b,'echo',u).length||st.echoRounds[ultimateUnitId(u)]===round(b))return;
 st.echoRounds[ultimateUnitId(u)]=round(b);b._ultimateDerived358=true;try{replayUltimateOrdinary(b,u,skill,{scale:.6,charge:true,targetId,random})}finally{delete b._ultimateDerived358}
}
export function endUltimateRound(b){
 if(!b?.ultimates358)return;const st=state(b),r=round(b);if(st.endedRound===r)return;st.endedRound=r;
 for(const e of [...st.effects]){const caster=find(b,e.source),wasActive=active(b,e);
  if(wasActive&&e.due!=null&&r>=e.due){
   if(e.kind==='doom'||e.kind==='register')for(const id of e.targets){const target=find(b,id);if(target&&ultimateHp(target)>0&&(e.kind==='doom'||ultimateHp(target)/maxHp(b,target)<=.4)){forceDeath(b,target,caster,e.kind==='doom'?'終刻宣告':'黄泉の名簿');if(e.kind==='register')put(b,target,'reviveSeal',1,4,caster,'黄泉の封印')}}
   if(e.kind==='furnace'){const targets=opponents(b,caster).filter(x=>ultimateHp(x)>0&&!ultimateIsolated(b,x)),share=Math.floor((e.stored??0)/Math.max(1,targets.length));for(const target of targets)damage(b,caster,target,share,{direct:false,label:'終末炉・放出'});setHp(caster,ultimateHp(caster)-Math.floor(ultimateHp(caster)*.3))}
   e.done=true;
  }
  if(!wasActive||e.done||e.until<=r){
   if(wasActive&&!e.done&&e.kind==='rage'&&ultimateHp(caster)>0)put(b,caster,'defDown',.5,2,caster,'不死狂戦・反動');
   if(wasActive&&!e.done&&e.kind==='fateRecoil')for(const target of opponents(b,caster).filter(x=>ultimateHp(x)>0)){put(b,target,'guaranteedHit',1,2,caster,'唯一未来・反転');put(b,target,'guaranteedCritical',1,2,caster,'唯一未来・反転')}
   if(wasActive&&!e.done&&e.kind==='echo'&&caster){const cd=b.players?caster.cooldowns??={}:(b.cooldowns??={})[ultimateUnitId(caster)]??={};for(const id of Object.keys(cd))if(!isEndgameUltimate(id))cd[id]+=2}
   if(e.kind==='borrow')returnCircle(b,e);e.done=true;
  }
 }
 st.effects=st.effects.filter(e=>!e.done);
 for(const u of ultimateUnits(b)){const list=effects(b,u);list.splice(0,list.length,...list.filter(e=>!e.ultimate358||e.expires358>r));}
}
export function cleanupUltimateBattle(b){if(!b)return;for(const u of ultimateUnits(b))detachUltimateVital(u);delete b._ultimateAction358;if(!b?.ultimates358){delete b.ultimateProfiles358;return;}for(const e of b.ultimates358.effects)if(e.kind==='borrow')returnCircle(b,e);for(const u of ultimateUnits(b)){const list=effects(b,u);list.splice(0,list.length,...list.filter(e=>!e.ultimate358&&e.kind!=='authorityPossession'));}delete b.ultimates358;delete b.ultimateProfiles358;}
export function drainUltimateEvents(b){const events=b?.ultimates358?.events??[];if(b?.ultimates358)b.ultimates358.events=[];return events}
const LABELS={doom:'終刻宣告',register:'黄泉の名簿',exile:'虚空隔離',possession:'王命上書き',wall:'絶対神壁',furnace:'終末炉',echo:'十律統合',rage:'不死狂戦',reverse:'世界反転',borrow:'所有権移転',stolenLove:'恋獄',idle:'追撃封印',kneel:'跪伏'};
export function ultimateLabels(b,u){return(b?.ultimates358?.effects??[]).filter(e=>active(b,e)&&(e.targets?.includes(ultimateUnitId(u))||e.source===ultimateUnitId(u))).map(e=>`${LABELS[e.kind]??'権能'} ${e.due!=null?`残${Math.max(0,e.due-round(b))}T`:`残${Math.max(1,e.until-round(b)+1)}T`}`)}
