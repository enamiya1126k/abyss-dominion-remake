// Battle-local mother lifecycle. Owned monsters and shared raid rules are untouched.
import {MOTHER_ID422} from './Mother422.js';
import {SPECIES} from '../data/species.js';
import {ENDGAME_CHARACTERS} from '../data/endgameCharacters.js';
import {createEnemyBattleState} from '../battle/EnemyAI.js';
import {createEquipment,equipmentStatMultiplier} from '../models/Equipment.js';
import {EQUIPMENT_BASES} from '../data/equipment.js';

export const MOTHER_SUMMON_POOL426=Object.freeze([...Object.values(SPECIES).filter(s=>s.id!==MOTHER_ID422&&['N','R','SR','SSR','UR','LR','神話'].includes(s.rarity)).map(s=>s.id),...Object.keys(ENDGAME_CHARACTERS)]);
const bindings=globalThis[Symbol.for('abyss.mother426')]??=new WeakMap();
const round=b=>Math.max(1,Math.floor(Number(b.turn)||1));
export const mother426=b=>b?.specialBattleType==='mother422'?(b.enemies??[]).find(u=>u.speciesId===MOTHER_ID422&&u.motherRevision426===426):null;
const children=b=>(b.enemies??[]).filter(u=>u.motherSummon426&&u.hp>0&&!u.fled&&!u.captured);
function cue(b,label){b.log??=[];b.log.unshift(label);b.log=b.log.slice(0,6);const s=b.motherCycle426;s.events??=[];s.events.push(label);s.events=s.events.slice(-12);}
export function beginMotherAttack426(b,u){if(!mother426(b))return;prepareMother426(b);const s=b.motherCycle426;s.action={serial:++s.actionSerial,actorId:u.id,round:round(b),summoned:false};}
export function endMotherAttack426(b){if(b?.motherCycle426)b.motherCycle426.action=null;}
export function motherCycleText426(b){
 const m=mother426(b),s=b?.motherCycle426;if(!m||!s)return '';
 if(m.hp<=0&&s.deathRound!=null&&!s.reviveUsed&&children(b).length)return `母の復活まで あと${s.remaining}ラウンド／召喚敵を全滅させると勝利`;
 if(m.hp<=0)return '母は撃破済み／残った召喚敵を倒そう';
 return `HP半分未満で被ダメージ時に召喚（空き枠・攻撃1回につき1体）／ふんばり ${s.gutsUsed?'使用済み':'残り1回'}／復活 ${s.reviveUsed?'使用済み':'残り1回'}`;
}
export function createMotherChild426(b,m,rng=Math.random){
 const s=b.motherCycle426,roll=(min,max)=>min+Math.floor(rng()*(max-min+1)),pick=a=>a[roll(0,a.length-1)];
 const candidate=pick(MOTHER_SUMMON_POOL426),god=ENDGAME_CHARACTERS[candidate],speciesId=god?.speciesId??candidate,level=roll(2500,4500),strength=roll(85,115)/100,id=`${m.id}-birth-${++s.birthSerial}`;
 const gear=['weapon','armor','accessory'].map((slot,i)=>{
  const item=createEquipment(slot,{rarity:pick(['SSR','UR','LR']),base:pick(EQUIPMENT_BASES[slot]),affixes:[],series:null});
  Object.assign(item,{id:`${id}:gear:${i}`,createdAt:null,level:roll(600,1800),plus:roll(0,10),series:null,equippedBy:id});return item;
 });
 const e=createEnemyBattleState(SPECIES[speciesId],{id,speciesId,level,boss:false,uncapturable:true,noItemDrops:true,summoned:true,motherSummon426:true,motherId426:m.id,readyRound426:round(b)+1,enemyLoadoutVersion:5,enemyGear:gear,enemyMagicCircle:null,fixedTrialScaling:true},1);
 const extra={};for(const item of gear)for(const[k,v]of Object.entries(item.stats))extra[k]=(extra[k]??0)+Math.round(v*equipmentStatMultiplier(item));
 for(const k of ['atk','matk','def','mdef','spd'])e[k]=Math.max(k==='spd'?1:0,Math.floor((e[k]+(extra[k]??0))*strength));
 e.maxHp=Math.max(1,Math.floor((e.maxHp+(extra.hp??0))*8*strength));e.hp=e.maxHp;
 e.maxMp=Math.max(8,e.maxMp+(extra.mp??0));e.currentMp=e.maxMp;e.motherStrength426=strength;e.intent='召喚直後：次のラウンドから行動';
 if(god){
  Object.assign(e,{endgameBossId:god.id,visualSpeciesId:god.id,name:god.name,faction:god.faction,endgameFaction:god.faction,element:god.element,elementMultipliers:god.elementMultipliers,statusProfile:god.statusProfile,bossPassive:god.passive});
  // Use the same profile as native endgame enemies. Mark it before a checkpoint
  // so the resume hydrator cannot apply the profile twice or revive a dead child.
  const rates=god.statProfile??{};
  for(const key of ['maxHp','atk','matk','def','mdef','spd'])e[key]=Math.max(['maxHp','atk','matk','spd'].includes(key)?1:0,Math.floor(e[key]*Math.max(.25,Math.min(3,Number(rates[key==='maxHp'?'hp':key])||1))));
  e.hp=e.maxHp;e.crit=Math.max(0,(e.crit??0)+(Number(rates.crit)||0)/100);e.evasion=Math.max(0,Math.min(75,(e.evasion??0)+(Number(rates.evasion)||0)));e.accuracy=Math.max(20,Math.min(180,(e.accuracy??100)+(Number(rates.accuracy)||0)));e._endgameStatProfileApplied=god.id;
 }
 return e;
}
function summonOnHit(b,m){
 const s=b.motherCycle426,a=s.action,c=b._singleCause410??b._motherDamageCause426??b._ultimateAction358??{};
 if(!a||a.summoned||a.round!==round(b)||m.hp<=0||m.hp>=m.maxHp*.5||s.deathRound!=null||b.resultSettled)return;
 if(c.direct===false||!['primary','direct','followup',undefined].includes(c.kind)||!b.party?.some(u=>String(u.id)===String(c.sourceId??'')))return;
 if(!b.party?.some(u=>u.id===a.actorId)||children(b).length>=3)return;
 const slot=b.enemies.findIndex(u=>u!==m&&u.hp<=0&&u.motherSummon426);
 if(slot<0&&b.enemies.length>=4)return;
 a.summoned=true;const child=createMotherChild426(b,m);
 if(slot<0)b.enemies.push(child);else b.enemies[slot]=child;
 s.totalSummons++;cue(b,`万命の産声：${child.name} Lv.${child.level.toLocaleString()}を召喚・次ラウンドから行動`);
}
// HP writers include native skills, ultimates and poison. Chain their mitigation
// first, then consume guts only when actual HP reaches zero. Never revive via a
// minion's generic healing/raise; the five-round lifecycle owns this boss's return.
export function prepareMother426(b){
 const m=mother426(b);if(!m)return null;
 const s=b.motherCycle426??={version:1,gutsUsed:false,reviveUsed:false,deathRound:null,remaining:0,lastCountRound:0,birthSerial:0,actionSerial:0,action:null,totalSummons:0,events:[]};
 if(bindings.get(m)?.b===b)return s;
 const desc=Object.getOwnPropertyDescriptor(m,'hp');let value=Number(m.hp)||0;
 const get=()=>desc?.get?desc.get.call(m):value,write=n=>{if(desc?.set)desc.set.call(m,n);else value=n;};
 const force=n=>{const effects=b.ultimates358?.effects;if(b.ultimates358)b.ultimates358.effects=[];try{write(n);}finally{if(b.ultimates358)b.ultimates358.effects=effects??[];}};
 bindings.set(m,{b,force});
 Object.defineProperty(m,'hp',{enumerable:true,configurable:true,get,set(n){
  const before=get(),requested=Math.max(0,Math.floor(Number(n)||0));
  if(before<=0&&requested>0)return; // Dedicated revival calls the preserved writer.
  write(requested);let after=get();
  if(before>0&&after<=0&&!s.gutsUsed){s.gutsUsed=true;force(1);after=get();cue(b,'原母のふんばり：HP1で耐えた（この戦闘では使用済み）');}
  if(before>0&&after<=0){s.action=null;s.deathRound=round(b);s.remaining=s.reviveUsed?0:5;s.lastCountRound=round(b);if(children(b).length&&!s.reviveUsed)cue(b,'母を撃破：次ラウンドから復活まで5ラウンド。召喚敵を倒し切ろう');}
  if(before>after&&after>0)summonOnHit(b,m);
 }});
 return s;
}
export function endMotherRound426(b){
 const m=mother426(b);if(!m)return false;const s=prepareMother426(b),r=round(b);
 endMotherAttack426(b);
 if(m.hp>0||s.deathRound==null||s.reviveUsed||!children(b).length||r<=s.deathRound||r<=s.lastCountRound)return false;
 s.lastCountRound=r;s.remaining=Math.max(0,5-(r-s.deathRound));
 if(s.remaining>0){cue(b,`母の復活まで あと${s.remaining}ラウンド`);return false;}
 s.reviveUsed=true;s.deathRound=null;
 b.enemyEffects??={};b.enemyStatuses??={};b.enemyEffects[m.id]=[];b.enemyStatuses[m.id]=[];
 // Do not carry shields or stored healing through death.
 for(const k of ['_floorBossHpShield','heroShield348','heroShieldMax378','divineBarrier','shield'])m[k]=0;
 for(const k of ['circleShields','signatureShields'])if(b[k])delete b[k][m.id];
 bindings.get(m).force(Math.max(1,Math.floor(m.maxHp*.30)));m.visualFrame='idle';
 cue(b,'原母再誕：HP30%で復活。ふんばり・再復活は残っていない');return true;
}
