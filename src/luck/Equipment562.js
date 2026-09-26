import {item511} from './Items511.js';
import {LUCK511} from './Rules511.js';
const clone=x=>JSON.parse(JSON.stringify(x));
const count=(gear,id)=>(gear??[]).filter(x=>x.id===id).length;

// The server seals a complete result before the broadcast. Show only effects
// whose impact has happened on screen, not that future result's empty shields.
export function equipmentFrame562(g,at,reduced=false){
 const active=['reveal','dice','broadcast','run'].includes(g.phase),event=g.event;
 if(!active||!event||event.itemRules562!==1)return g.players.map(p=>({...p,...(g.phase==='settle'&&event?{guards:event.rows[p.seat].guards,mirrors:event.rows[p.seat].mirrors}:{}),loadout:clone(p.loadout??[])}));
 const states=g.players.map(p=>{
  const row=event.rows[p.seat],loadout=clone(p.loadout??[]),item=item511(row.item);
  if(item.persistent)loadout.push({id:item.id,round:g.round});
  return{...p,...row.beforeAttacks,loadout};
 });
 const apply=hit=>{
  const victim=states[hit.target],source=states[hit.source];
  if(['blocked','reflected'].includes(hit.outcome)){
   const field={shield:'guards',mirror:'mirrors',ward:'wards'}[hit.guard];
   if(field)victim[field]=Math.max(0,(victim[field]??0)-1);
  }else if(hit.outcome==='hit'){
   victim.coils+=count(victim.loadout.filter(x=>x.round<g.round),'revenge');
   for(const stolen of hit.stolen??[]){
    const index=victim.loadout.findIndex(x=>x.id===stolen.id&&x.round===stolen.fromRound);
    if(index>=0){victim.loadout.splice(index,1);source.loadout.push({id:stolen.id,round:g.round});}
   }
  }
 };
 for(let i=0;i<event.attacks.length;i++){
  const age=at-g.phaseAt-i*LUCK511.castMs;
  const current=g.phase==='broadcast'&&Math.floor(Math.max(0,at-g.phaseAt)/LUCK511.castMs)===i;
  const impact=g.phase==='run'||g.phase==='broadcast'&&(age>=LUCK511.castMs*.55||reduced&&current);
  const returned=g.phase==='run'||g.phase==='broadcast'&&(age>=LUCK511.castMs*.79||reduced&&current);
  if(impact)for(const hit of event.attacks[i].targets){apply(hit);if(returned&&hit.returned)apply(hit.returned);}
 }
 return states;
}

export function equipmentStats562(g,source,formatDistance){
 const gear=source.loadout??[],round=g.round;
 const choosing=['chest','hand','countdown'].includes(g.phase);
 const stats=[['コイル',`${source.coils??0} 個`],['太陽',`${source.suns??0} 個`],['貯金',formatDistance(source.savings??0)],['お守り残り',`${source.wards??0} 回`]];
 const wards=count(gear,'ward');if(choosing&&wards)stats.push(['今回の補充（選択後）',`+${wards} 回`]);
 for(const [id,field,label]of [['shield','guards','バリア'],['mirror','mirrors','反射']]){
  const n=choosing?count(gear,id):source[field]??count(gear,id);if(count(gear,id))stats.push([`${choosing?'毎回の回数':'今回の残り'}・${label}`,`${n} 回`]);
 }
 const exponent=gear.filter(x=>x.id==='doubling'&&x.round<round).reduce((n,x)=>n+round-x.round,0);
 if(exponent)stats.push([`成長倍率（R${round}）`,'×'+(2n**BigInt(exponent)).toString()]);
 if(source.lastAdvance)stats.push([g.phase==='settle'?'今回の前進':'前回の前進',formatDistance(source.lastAdvance)]);
 return stats;
}
