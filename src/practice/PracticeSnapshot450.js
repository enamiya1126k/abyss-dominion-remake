// Bounded public combat data only. Never include a save, inventory or account IDs.
const MAX=1e12,keys=['hp','atk','matk','def','mdef','spd','crit','evasion','accuracy'];
const num=(v,min=0,max=MAX)=>Math.max(min,Math.min(max,Number.isFinite(Number(v))?Number(v):min));
function clean(v,depth=0){
 if(depth>7)return null;if(v===null||typeof v==='boolean')return v;
 if(typeof v==='number')return Number.isFinite(v)?Math.max(-MAX,Math.min(MAX,v)):0;
 if(typeof v==='string')return v.replace(/[<>\u0000-\u001f]/g,'').slice(0,240);
 if(Array.isArray(v))return v.slice(0,24).map(x=>clean(x,depth+1));
 if(v&&typeof v==='object'){const out={};for(const k of Object.keys(v).slice(0,100))if(!['__proto__','prototype','constructor'].includes(k)&&/^[a-zA-Z0-9_-]{1,80}$/.test(k))out[k]=clean(v[k],depth+1);return out}return null;
}
export function normalizeDuel450(source){
 if(source?.version!==1||!source.stats||!Array.isArray(source.skills)||source.skills.length>4)return null;
 if(JSON.stringify(source).length>14000)return null;
 if(keys.some(k=>!Number.isFinite(Number(source.stats[k])))||Number(source.stats.hp)<=0||!Number.isFinite(Number(source.maxMp)))return null;
 const stats=Object.fromEntries(keys.map(k=>[k,num(source.stats[k],['hp','atk','matk','spd'].includes(k)?1:0)]));
 return{version:1,stats,maxMp:num(source.maxMp,1),plus:Math.floor(num(source.plus,0,99999)),rank:Math.floor(num(source.rank,1,4)),affection:num(source.affection,0,1000),
 skills:source.skills.map(s=>clean(s)).filter(s=>s&&typeof s.id==='string'),circleId:String(source.circleId??'none').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80),circleLevel:Math.floor(num(source.circleLevel,0,99)),
 goldRate:num(source.goldRate,1,2),affixes:clean(source.affixes??{}),signature:clean(source.signature??null),abyss:clean(source.abyss??{}),element:String(source.element??'neutral').replace(/[^a-zA-Z]/g,'').slice(0,20)};
}
export function duelReady450(party){return Array.isArray(party)&&party.length>0&&party.length<=4&&party.every(m=>normalizeDuel450(m.duel));}
export function makeDuelEnemy450(member,index,{species,circle}){
 const d=normalizeDuel450(member.duel);if(!d||!species)throw Error('対戦情報の更新が必要です');
 return{...d.stats,id:`practice-enemy-${index}`,speciesId:member.speciesId,visualSpeciesId:member.visualSpeciesId,customVisualAsset:member.customVisualAsset,customVisualBase:member.customVisualBase,
 name:member.name,nameOverride:member.name,level:member.level,plus:d.plus,rank:d.rank,combatRarity:member.rarity,emoji:species.emoji,boss:false,uncapturable:true,noItemDrops:true,
 hp:d.stats.hp,maxHp:d.stats.hp,maxMp:d.maxMp,currentMp:d.maxMp,element:d.element,trialElement:d.element,role:species.role,race:species.race,
 endgameBossId:member.endgameBossId,duel450:d,enemyMagicCircle:circle,intent:'編成を見極めている',phase:1,guard:false,specialCooldown:0,hiddenDamageTaken:1,hiddenStatusResist:0,hiddenAi:0,
 _equipmentAffixes:d.affixes,_affixes:d.affixes,_abyssSkillEffects:d.abyss,heroSignature348:d.signature,heroSkillCosts348:Object.fromEntries(d.skills.map(s=>[s.id,s.mp??0]))};
}
