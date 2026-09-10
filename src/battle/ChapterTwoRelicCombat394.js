import {relicById394,relicGrowth394,RELIC_EFFECT_CAPS394,chapterTwoCircleEffects394} from '../data/chapterTwoRelics394.js?v=3.1.74-build394';
import {ultimateCircle,ultimateIsolated,ultimateExtraBlocked} from '../core/EndgameUltimateSystem.js';
import {twinReady385} from './TwinResonance385.js?v=3.1.75-build395';
export function aggregateRelics394(items,cycleRate=1){
 const byDefinition=new Map();for(const item of items??[]){const d=relicById394(item.chapterTwoRelic394);if(d&&(!byDefinition.has(d.id)||Number(item.plus)>Number(byDefinition.get(d.id).plus)))byDefinition.set(d.id,item);}
 const effects={};for(const [id,item] of byDefinition)for(const [key,n] of Object.entries(relicById394(id).effects))effects[key]=(effects[key]??0)+n*relicGrowth394(item.plus);
 return Object.fromEntries(Object.entries(effects).map(([k,v])=>[k,Math.min(RELIC_EFFECT_CAPS394[k],v)*Math.max(0,Math.min(1,Number(cycleRate)||0))]));
}
export function battleRelicEffects394(battle,actor){
 if(!actor||!(battle?.party??[]).includes(actor)||actor.currentHp<=0||actor.captured||ultimateIsolated(battle,actor))return {};
 const c=ultimateCircle(battle,actor,battle.magicCircleProfiles?.[actor.id]);
 return{gear:actor._chapterTwoRelics394??{},circle:chapterTwoCircleEffects394(c?.id,c?.level)};
}
const active=e=>(e?.turns??1)>0;
const ailments=new Set(['poison','burn','bleed','sleep','freeze','paralysis','shock','curse','charm','confusion','fear']);
const positive=new Set(['atkUp','defUp','spdUp','critUp','accuracyUp','evasionUp','guard','counter','regen','taunt','lifeSteal','guaranteedCritical','guaranteedHit','magicToPhysical']);
export const guarded394=(battle,actor)=>Boolean(battle.guards?.[actor?.id]||(battle.allyEffects?.[actor?.id]??[]).some(e=>e.kind==='guard'&&active(e)));
export function relicIncomingMultiplier394(battle,actor){const {gear={},circle={}}=battleRelicEffects394(battle,actor);return guarded394(battle,actor)?(1-(gear.guard??0))*(1-(circle.guard??0)):1;}
const key=(a,t)=>`${a.id}:${t.id}`;
export function relicDamageMultiplier394(battle,actor,target,kind='direct'){
 if(kind==='excluded')return 1;const {gear,circle}=battleRelicEffects394(battle,actor);if(!gear)return 1;
 const status=new Set((battle.enemyStatuses?.[target?.id]??[]).filter(active).map(s=>s.id));
 const pair=kind==='pair'||kind==='pairCounter',ready=pair&&twinReady385(battle,actor,'ally',u=>ultimateIsolated(battle,u)||ultimateExtraBlocked(battle,u));
 const round=Math.max(1,Number(battle.turn)||1),hits=battle.relicHits394?.round===round?battle.relicHits394.counts?.[key(actor,target)]??0:0;
 const flags={pair:!!ready,chain:hits>=1,counter:kind==='counter'||kind==='pairCounter',poison:status.has('poison'),sleep:status.has('sleep'),burn:status.has('burn'),freeze:status.has('freeze'),ailment:[...status].some(s=>ailments.has(s)),buff:(battle.enemyEffects?.[target?.id]??[]).some(e=>positive.has(e.kind)&&active(e)),execute:Number(target?.hp)/Math.max(1,Number(target?.maxHp)||1)<=.35};
 const sum=source=>Object.entries(source).reduce((n,[k,v])=>n+(flags[k]?Number(v)||0:0),0);
 return (1+Math.min(1.5,sum(gear)))*(1+Math.min(.6,sum(circle)));
}
export function recordRelicHit394(battle,actor,target,damage,kind='direct'){
 if(kind==='excluded'||!(damage>0)||!(battle.party??[]).includes(actor)||!actor||actor.currentHp<=0)return;
 const {gear={},circle={}}=battleRelicEffects394(battle,actor);if(!gear.chain&&!circle.chain)return;
 const round=Math.max(1,Number(battle.turn)||1);if(battle.relicHits394?.round!==round)battle.relicHits394={round,counts:{}};
 battle.relicHits394.counts[key(actor,target)]=1;
}
