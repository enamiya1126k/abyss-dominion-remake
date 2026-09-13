// Build410: five authored, battle-local traits. No permanent monster mutation.
import {CHAPTER_TWO_ABILITY_DESIGN408} from '../data/ChapterTwoAbilityDesign408.js?v=3.1.88-build408';
import {createAbilityState408,claimAbility408,confirmedDeaths408,hibernationTurn408,convertDebuff408,terminalDamagePlan408,selectPactTarget408,absorbDeath408,deathGrowthStacks408,deathGrowthStats408,traitStats408,paperShield408} from './ChapterTwoAbilityRuntime408.js?v=3.1.88-build408';
export const SINGLE_TRAITS410=Object.freeze(Object.fromEntries(CHAPTER_TWO_ABILITY_DESIGN408.traits.map(t=>[t.speciesId,t])));
// Cache-query aliases share only weak, ephemeral bindings. Save files contain plain data.
const registry=globalThis[Symbol.for('abyss.singleTraits410')]??={bindings:new WeakMap(),vitals:new WeakMap()};
const hp=u=>Math.max(0,Number(u?.currentHp??u?.hp)||0),key=(side,id)=>JSON.stringify([side,String(id)]),round=b=>Math.max(1,Number(b?.turn)||1);
export const singleTrait410=u=>SINGLE_TRAITS410[u?.speciesId]??null;
export const paperBody410=u=>singleTrait410(u)?.id==='paperShield';
export function createSingleState410(raw=null){
 const clean={version:1,ready:false,entries:{},pending:{},shields:{},actions:{},events:[]};
 if(raw?.version!==1)return clean;
 for(const name of ['entries','pending','shields','actions'])for(const[k,v]of Object.entries(raw[name]??{}).slice(0,256))if(k.length<400&&!['__proto__','prototype','constructor'].includes(k))clean[name][k]=JSON.parse(JSON.stringify(v));
 clean.ready=raw.ready===true;return clean;
}
export const singleState410=b=>b.singleTraits410??=createSingleState410();
export const snapshotSingles410=b=>b?.singleTraits410?createSingleState410(b.singleTraits410):null;
export function singleRoster410(b){return ['ally','enemy'].flatMap(side=>((side==='ally'?b?.party:b?.enemies)??[]).filter(Boolean).map(u=>({u,side,id:String(u.id),speciesId:u.speciesId})));}
function cue(b,u,label,detail=''){const s=singleState410(b);s.events.push({id:u.id,label,detail});if(s.events.length>24)s.events.shift();b.log??=[];b.log.unshift(`${u.name??u.nickname??singleTrait410(u)?.characterName??u.speciesId}：${label}${detail?'・'+detail:''}`);b.log=b.log.slice(0,6);}
export function takeSingleCues410(b){return b?.singleTraits410?.events?.splice(0)??[];}
export function projectSingleStats410(stats,u){
 const binding=registry.bindings.get(u),def=singleTrait410(u);if(!def)return stats;
 if(!binding)return traitStats408(stats,def);
 if(def.id==='deathAbsorb')return deathGrowthStats408(binding.entry.raw,deathGrowthStacks408(binding.b.chapterTwoAbilities408,{side:binding.side,speciesId:u.speciesId}),hp(u)).stats;
 return traitStats408(stats,def);
}
// Boot-time equipment normalization runs before the saved battle is rebound.
// Keep an absorber's saved maximum during that short window, so HP is not lost on reload.
export function savedSingleStats410(stats,u,active){
 if(registry.bindings.has(u)||singleTrait410(u)?.id!=='deathAbsorb')return stats;
 const entry=active?.singleTraits410?.entries?.[key('ally',u.id)];
 if(!entry?.raw||entry.speciesId!==u.speciesId)return stats;
 return deathGrowthStats408(entry.raw,deathGrowthStacks408(active.chapterTwoAbilities408,{side:'ally',speciesId:u.speciesId}),hp(u)).stats;
}
function blocked(b,u,side){const lists=[...(side==='ally'?b.allyEffects?.[u.id]??[]:b.enemyEffects?.[u.id]??[]),...(side==='ally'?b.allyAilments?.[u.id]??[]:b.enemyStatuses?.[u.id]??[])];return hp(u)<=0||u.captured||u.fled||b._singleEnv410?.blocked?.(u,side)||lists.some(e=>['sleep','stun','paralysis','freeze','shock','charm','confusion','fear'].includes(String(e.id??e.kind).replace(/^status:/,''))&&(e.turns==null||e.turns>0));}
function zeroProperty(obj,field){if(!obj||Object.getOwnPropertyDescriptor(obj,field)?.get?.singleZero410)return;const get=()=>0;get.singleZero410=true;Object.defineProperty(obj,field,{enumerable:true,configurable:true,get,set(){}});}
export function enforcePaperBody410(b){
 if(!b?.singleTraits410?.ready)return; // Only a prepared local trait battle owns the HP100 rule.
 for(const {u,side}of singleRoster410(b).filter(x=>paperBody410(x.u))){
  for(const field of ['shield','heroShield348','heroShieldMax378','_floorBossHpShield','divineBarrier'])zeroProperty(u,field);
  for(const name of ['circleShields','signatureShields']){b[name]??={};zeroProperty(b[name],u.id);}
  u.maxHp=100;u._maxHp=100;if(hp(u)>100)u[side==='ally'?'currentHp':'hp']=100;
 }
}
export function prepareSingles410(b,{stats,rawStats=stats,blocked:blockedFn,rescue,terminal,damage}={}){
 if(!b)return;const s=singleState410(b);b.chapterTwoAbilities408??=createAbilityState408();
 Object.defineProperty(b,'_singleEnv410',{configurable:true,writable:true,value:{...b._singleEnv410,stats:stats??b._singleEnv410?.stats,blocked:blockedFn??b._singleEnv410?.blocked,rescue:rescue??b._singleEnv410?.rescue,terminal:terminal??b._singleEnv410?.terminal,damage:damage??b._singleEnv410?.damage}});
 const fresh=!s.ready;
 for(const {u,side,id}of singleRoster410(b)){
  const k=key(side,id),def=singleTrait410(u);let entry=s.entries[k];
  if(!entry){
   // Only the opening roster is eligible for death absorption. Late summons never enter it.
   const raw=side==='ally'?{...rawStats(u)}:{...u,hp:u.maxHp};
   const rawNumbers=Object.fromEntries(['hp','atk','matk','def','mdef','spd','crit','evasion','accuracy'].map(f=>[f,Number(raw[f])||0]));
   entry=s.entries[k]={id,side,speciesId:u.speciesId,raw:rawNumbers,initial:fresh&&hp(u)>0&&!u.summoned&&!u.fled&&!u.captured,dead:hp(u)<=0};
   if(def){const reduced=traitStats408(rawNumbers,def);if(side==='enemy'){for(const field of ['atk','matk','def','mdef','spd'])u[field]=reduced[field];u.maxHp=reduced.hp;u.hp=Math.min(hp(u),reduced.hp);}else{u.currentHp=Math.min(hp(u),reduced.hp);u.maxHp=reduced.hp;}}
   entry.maxHp=def?traitStats408(rawNumbers,def).hp:Math.max(1,rawNumbers.hp);
  }
  if(def)registry.bindings.set(u,{b,side,entry});
 }
 s.ready=true;enforcePaperBody410(b);
 // install after the existing ultimate accessor, preserving its setter and rescue rules
 for(const {u,side}of singleRoster410(b))attachSingleVital410(b,u,side);
 if(fresh)for(const {u,side}of singleRoster410(b))if(paperBody410(u))refreshPaperShield410(b,u,side,'opening');
}
function attachSingleVital410(b,u,side){
 const field=side==='ally'?'currentHp':'hp',desc=Object.getOwnPropertyDescriptor(u,field),old=registry.vitals.get(u);
 if(old?.b===b&&desc?.get===old.get)return;
 if(desc&&!desc.configurable)return;
 let value=hp(u);const get=()=>desc?.get?desc.get.call(u):value;
 const record={b,field,get};registry.vitals.set(u,record);
 Object.defineProperty(u,field,{enumerable:true,configurable:true,get,set(n){
  const before=get(),requested=Math.max(0,Math.floor(Number(n)||0)),next=paperBody410(u)?Math.min(100,requested):requested;
  if(desc?.set)desc.set.call(u,next);else value=next;
  const after=get();if(before>0&&after<=0){const c=b._singleCause410??b._ultimateAction358??{},sourceId=c.sourceId??null,source=singleRoster410(b).find(x=>x.id===String(sourceId));singleState410(b).pending[key(side,u.id)]={sourceId,fromSide:c.fromSide??source?.side??null,kind:c.kind??(c.direct===true?'primary':'unknown')};}
 }});
}
export function noteSingleDamage410(b,target,source,{kind='primary',fromSide=null}={}){if(!b?.singleTraits410||!target)return;const row=singleRoster410(b).find(x=>x.u===target);if(!row)return;const src=singleRoster410(b).find(x=>x.u===source||x.id===String(source));if(hp(target)<=0)singleState410(b).pending[key(row.side,row.id)]={...singleState410(b).pending[key(row.side,row.id)],kind:b._singleCause410?.kind??kind,sourceId:src?.id??(typeof source==='string'?source:null),fromSide:fromSide??src?.side??null};}
export function withSingleCause410(b,cause,fn){const prev=b._singleCause410;b._singleCause410=cause;try{return fn();}finally{b._singleCause410=prev;}}
export function absorbPaperShield410(b,u,amount){
 const row=singleRoster410(b).find(x=>x.u===u),s=b?.singleTraits410;if(!row||!s||paperBody410(u))return amount;
 const shield=s.shields[key(row.side,row.id)];if(!shield)return amount;if(round(b)>shield.expires){delete s.shields[key(row.side,row.id)];return amount;}
 const absorbed=Math.min(Math.max(0,amount),Math.max(0,shield.amount));shield.amount-=absorbed;return Math.max(0,amount-absorbed);
}
export function refreshPaperShield410(b,owner,side,event='action'){
 if(!paperBody410(owner)||blocked(b,owner,side))return false;
 const s=singleState410(b);if(!claimAbility408(b.chapterTwoAbilities408,{side,speciesId:owner.speciesId,abilityId:'paper-shield',eventId:`${event}:${round(b)}:${owner.id}`,round:round(b),perRound:1,perBattle:999}))return false;
 let total=0;for(const{u,side:team,id}of singleRoster410(b)){if(team!==side||u===owner||paperBody410(u)||hp(u)<=0||u.captured||u.fled)continue;const entry=s.entries[key(side,id)];if(!entry)continue;const shield=paperShield408(entry.maxHp);s.shields[key(side,id)]={amount:shield.amount,expires:round(b)+1};total+=shield.amount;}
 cue(b,owner,'百命の従騎盾',`味方へ開戦時HP8%の盾・2ラウンド`);return total>=0;
}
export function naturalSingleAction410(b,u,side,{natural=true}={}){
 if(!singleTrait410(u)||!natural)return {kind:'none'};const s=singleState410(b),k=key(side,u.id),r=round(b);
 if(s.actions[k]?.round===r)return s.actions[k].result?.kind==='skip'?s.actions[k].result:{kind:'none'};
 if(blocked(b,u,side))return {kind:'none'};
 if(paperBody410(u)){refreshPaperShield410(b,u,side);s.actions[k]={round:r,result:{kind:'none'}};return {kind:'none'};}
 if(singleTrait410(u).id!=='hibernation')return {kind:'none'};
 const result=hibernationTurn408(b.chapterTwoAbilities408,{side,speciesId:u.speciesId,ownerId:String(u.id),round:r});
 s.actions[k]={round:r,result};if(result.kind==='skip')cue(b,u,'冬眠',`${10-result.remaining}/10・11回目に解放`);
 if(result.kind==='discharge'){cue(b,u,'十夜の冬眠鐘','冬眠解放');for(const target of singleRoster410(b).filter(x=>x.side!==side&&hp(x.u)>0))executeTerminal410(b,u,side,target.u,target.side,'hibernation');settleSingleDeaths410(b);}
 return result;
}
// Preserve the originating side on persistent DoT, including after a later battle reload.
export function singleEffectOrigin410(b,e){
 if(!e||e.selfCost)return e;
 const rows=singleRoster410(b),explicit=e.sourceMonsterId??e.sourceId,source=rows.find(x=>x.id===String(explicit))??(explicit==null?rows.find(x=>String(e.sourceKey??'').startsWith(x.id+':'))??rows.find(x=>x.id===String(b?._ultimateAction358?.sourceId)):null);
 return source?{...e,sourceMonsterId:explicit??source.id,fromSide:e.fromSide??source.side}:e;
}
export function inversionCandidate410(b,target,effect,toSide){
 if(singleTrait410(target)?.id!=='reverseLetter'||effect?.selfCost)return null;
 const sourceId=effect.sourceMonsterId??effect.sourceId??b?._ultimateAction358?.sourceId,source=singleRoster410(b).find(x=>x.id===String(sourceId))??singleRoster410(b).find(x=>String(effect.sourceKey??'').startsWith(x.id+':'));
 const fromSide=effect.fromSide??source?.side;
 return convertDebuff408({...effect,id:effect.id??effect.statusId??effect.kind},{fromSide,toSide,landed:true});
}
export function invertSingleDebuff410(b,target,effect,side){
 const conversion=inversionCandidate410(b,target,effect,side);if(!conversion)return false;
 const map=side==='ally'?(b.allyEffects??={}):(b.enemyEffects??={}),list=map[target.id]??=[],e={...conversion.effect,pairMaximum409:true},old=list.find(x=>x.kind===e.kind&&x.sourceKey===e.sourceKey);
 if(old){old.turns=Math.max(old.turns,2);old.value=Math.max(old.value,e.value);}else list.push(e);
 cue(b,target,'裏返しの封書',`${effect.name??effect.id??effect.kind}を強化へ反転`);return true;
}
export function protectedSingleTarget410(b,u){return Boolean(b.onlineMode||b.raid||b.pvp||b.isPvp||['raid','pvp','online'].includes(b.mode)||u.boss||u.isBoss||u.raidBoss||u.floorBossCatalogId||u.endgameBossId||['tenGod','abyss'].includes(u.faction??u.endgameFaction)||u.storyProtected||u.instantDeathImmune||u.immortal);}
function executeTerminal410(b,owner,side,target,targetSide,kind){
 const entry=singleState410(b).entries[key(side,owner.id)],power=kind==='hibernation'?entry?.raw.matk:traitStats408(entry?.raw??{},singleTrait410(owner)).matk;
 const plan=terminalDamagePlan408({...target,hp:hp(target),boss:protectedSingleTarget410(b,target)},kind,{attackerPower:power,balance415:!b.onlineMode&&!b.raid&&!b.pvp&&!b.isPvp&&!['raid','pvp','online'].includes(b.mode)});if(!plan)return;
 return withSingleCause410(b,{kind:'trait',sourceId:owner.id,fromSide:side},()=>{if(plan.kind==='terminal')b._singleEnv410?.terminal?.(target,targetSide,plan,owner);else b._singleEnv410?.damage?.(target,targetSide,plan,owner,kind==='hibernation'?'ice':'dark');});
}
export function settleSingleDeaths410(b){
 if(!b?.singleTraits410||b._singleSettling410)return [];b._singleSettling410=true;
 try{
  const s=singleState410(b),rows=singleRoster410(b),pending=s.pending;s.pending={};
  // Rescue every victim first. A simultaneous death batch never grows a dead absorber.
  for(const row of rows)if(hp(row.u)<=0&&pending[key(row.side,row.id)]&&!row.u.captured&&!row.u.fled)b._singleEnv410?.rescue?.(row.u,row.side,pending[key(row.side,row.id)]);
  const dead=rows.filter(x=>hp(x.u)<=0&&!x.u.captured&&!x.u.fled);
  for(const row of dead){const entry=s.entries[key(row.side,row.id)];if(!entry)continue;entry.dead=true;if(singleTrait410(row.u)?.id==='hibernation'){const k=JSON.stringify([row.side,row.speciesId,'hibernation']),sleep=b.chapterTwoAbilities408.sleepers[k];if(!sleep||sleep.ownerId===row.id)b.chapterTwoAbilities408.sleepers[k]={ownerId:row.id,ticks:sleep?.ticks??0,round:round(b),done:true};}}
  const deaths=confirmedDeaths408(b.chapterTwoAbilities408,rows.map(x=>({...x,hp:hp(x.u),initialRoster:s.entries[key(x.side,x.id)]?.initial===true,captured:x.u.captured||x.u.fled,summoned:x.u.summoned})),{settled:true});
  for(const row of dead.filter(x=>singleTrait410(x.u)?.id==='deathPact')){
   const cause=pending[key(row.side,row.id)];if(!cause||cause.fromSide===row.side||!['ally','enemy'].includes(cause.fromSide)||!['primary','dot'].includes(cause.kind))continue;
   if(!claimAbility408(b.chapterTwoAbilities408,{side:row.side,speciesId:row.speciesId,abilityId:'death-pact',eventId:`death:${row.id}`,round:round(b)}))continue;
   const target=selectPactTarget408(row,rows.map(x=>({...x,hp:hp(x.u),captured:x.u.captured||x.u.fled,threat:Number(x.u.threat??x.u.aggro??Math.max(...['atk','matk'].map(f=>Number((x.side==='ally'?b._singleEnv410?.stats?.(x.u):x.u)?.[f])||0)))||0})),cause.sourceId);
   if(target){cue(b,row.u,'灰燭の道連れ',singleTrait410(target.u)?.characterName??target.u.name??target.speciesId);executeTerminal410(b,row.u,row.side,target.u,target.side,'deathPact');}
  }
  // Secondary deaths are recorded too, but cannot trigger another pact.
  for(const row of rows)if(hp(row.u)<=0&&s.pending[key(row.side,row.id)])b._singleEnv410?.rescue?.(row.u,row.side);
  const secondary=confirmedDeaths408(b.chapterTwoAbilities408,rows.map(x=>({...x,hp:hp(x.u),initialRoster:s.entries[key(x.side,x.id)]?.initial===true,captured:x.u.captured||x.u.fled,summoned:x.u.summoned})),{settled:true});
  for(const row of rows.filter(x=>singleTrait410(x.u)?.id==='deathAbsorb'&&hp(x.u)>0&&!x.u.captured&&!x.u.fled)){
   for(const death of [...deaths,...secondary]){const result=absorbDeath408(b.chapterTwoAbilities408,row,death,{round:round(b),alive:hp(row.u)>0});if(result)cue(b,row.u,'鎖翼の死喰い',`${result.stacks}/3・基礎比${25*result.multiplier}%`);}
  }
  for(const row of rows){const entry=s.entries[key(row.side,row.id)];if(singleTrait410(row.u)?.id==='deathAbsorb'&&entry){const projected=deathGrowthStats408(entry.raw,deathGrowthStacks408(b.chapterTwoAbilities408,row),hp(row.u));row.u.maxHp=projected.stats.hp;if(row.side==='enemy')for(const f of ['atk','matk','def','mdef','spd'])row.u[f]=projected.stats[f];}
   if(hp(row.u)<=0&&singleTrait410(row.u)?.id==='hibernation'){const k=JSON.stringify([row.side,row.speciesId,'hibernation']),sleep=b.chapterTwoAbilities408.sleepers[k];if(!sleep||sleep.ownerId===row.id)b.chapterTwoAbilities408.sleepers[k]={ownerId:row.id,ticks:sleep?.ticks??0,round:round(b),done:true};}
  }
  s.pending={};enforcePaperBody410(b);return [...deaths,...secondary];
 }finally{b._singleSettling410=false;}
}
export function cleanupSingles410(b){
 if(!b)return;
 for(const{u,side}of singleRoster410(b)){
  const binding=registry.bindings.get(u);registry.bindings.delete(u);
  const r=registry.vitals.get(u);if(r?.b===b){let value=u[r.field];
   if(binding){const max=side==='ally'?(b._singleEnv410?.stats?.(u)?.hp??traitStats408(binding.entry.raw,singleTrait410(u)).hp):traitStats408(binding.entry.raw,singleTrait410(u)).hp;value=Math.min(value,max);u.maxHp=max;u._maxHp=max;}
   Object.defineProperty(u,r.field,{value,writable:true,configurable:true,enumerable:true});registry.vitals.delete(u);
  }
 }
}
export function singleTraitLabel410(b,u,side='ally'){
 const def=singleTrait410(u);if(!def)return '';
 if(def.id==='hibernation'){const x=b?.chapterTwoAbilities408?.sleepers?.[JSON.stringify([side,u.speciesId,'hibernation'])];return x?.done?'冬眠終了':`冬眠 ${x?.ticks??0}/10`;}
 if(def.id==='deathAbsorb')return `死喰い ${deathGrowthStacks408(b?.chapterTwoAbilities408,{side,speciesId:u.speciesId})}/3`;
 return def.name;
}
