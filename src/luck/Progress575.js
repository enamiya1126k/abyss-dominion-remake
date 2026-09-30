import {copies571} from './Buffs571.js';
export function factors575(gear,round,soloLeader){
 const grown=gear.filter(x=>x.round<round);
 return {regalia:4n**BigInt(soloLeader?grown.filter(x=>x.id==='regalia').reduce((n,x)=>n+copies571(x),0):0),podium:2n**BigInt(grown.filter(x=>x.id==='podium').reduce((n,x)=>n+(x.medals575??0)*copies571(x),0)),frontier:8n**BigInt(grown.filter(x=>x.id==='frontier'&&x.awake575).reduce((n,x)=>n+copies571(x),0))};
}
export function rewardProgress575(rows,round,rounds){
 if(round>rounds/2)return;
 const first=rows.filter(r=>r.afterRank===1),solo=first.length===1?first[0]:null;
 for(const r of rows){r.rewards575={medals:0,awaken:0,suns:0};for(const gear of r.loadout){
  if(gear.round>round)continue;
  if(gear.id==='podium'&&r.afterRank<=2){gear.medals575=(gear.medals575??0)+1;r.rewards575.medals+=copies571(gear);}
  if(gear.id==='frontier'&&!gear.awake575&&BigInt(r.to)>=10000n){gear.awake575=true;r.rewards575.awaken+=copies571(gear);}
  if(gear.id==='usurper'&&!gear.claimed575&&r.beforeRank>1&&r===solo){r.suns+=3*copies571(gear);r.rewards575.suns+=3*copies571(gear);gear.claimed575=true;}
 }}
}
