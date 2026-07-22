import{SPECIES}from"../data/species.js?v=0.9.15-alpha.28-phase10-6-consistency";

export const WEAPON_MASTERY_TIERS=[
 {level:1,kills:500,bonus:.05,label:"Ⅰ"},
 {level:2,kills:1000,bonus:.10,label:"Ⅱ"},
 {level:3,kills:3000,bonus:.15,label:"Ⅲ"}
];

export const WEAPON_RACE_TRAITS={
 slime:{name:"粘体殺し",icon:"🫧"},
 goblin:{name:"小鬼狩り",icon:"🪖"},
 demon:{name:"退魔",icon:"👹"},
 plant:{name:"伐採者",icon:"🌿"},
 dragon:{name:"竜殺し",icon:"🐉"},
 undead:{name:"不死狩り",icon:"☠️"},
 beast:{name:"獣狩り",icon:"🐾"},
 reptile:{name:"鱗断ち",icon:"🦎"},
 flying:{name:"翼落とし",icon:"🪽"},
 spirit:{name:"精霊祓い",icon:"✨"},
 construct:{name:"機巧壊し",icon:"⚙️"}
};

export function normalizeWeaponMastery(item){
 if(!item||item.slot!=="weapon")return null;
 item.mastery??={};
 item.mastery.totalKills=Math.max(0,Number(item.mastery.totalKills)||0);
 item.mastery.byRace=item.mastery.byRace&&typeof item.mastery.byRace==="object"?item.mastery.byRace:{};
 item.mastery.bySpecies=item.mastery.bySpecies&&typeof item.mastery.bySpecies==="object"?item.mastery.bySpecies:{};
 return item.mastery
}

export function masteryTierForKills(kills=0){
 let result={level:0,kills:0,bonus:0,label:""};
 for(const tier of WEAPON_MASTERY_TIERS)if(kills>=tier.kills)result=tier;
 return result
}

export function nextMasteryTier(kills=0){return WEAPON_MASTERY_TIERS.find(tier=>kills<tier.kills)??null}

export function recordWeaponKill(state,monsterId,enemy){
 if(!state||!monsterId||!enemy||enemy.captured)return[];
 const monster=state.monsters?.find(entry=>entry.id===monsterId);if(!monster)return[];
 const species=SPECIES[enemy.speciesId],race=species?.race??"unknown";
 const ids=[monster.equipment?.weaponRight,monster.equipment?.weaponLeft].filter(Boolean);
 const updated=[];
 for(const id of new Set(ids)){
  const item=state.equipment?.find(entry=>entry.id===id);if(!item||item.slot!=="weapon")continue;
  const mastery=normalizeWeaponMastery(item);mastery.totalKills++;
  mastery.byRace[race]=(mastery.byRace[race]??0)+1;
  mastery.bySpecies[enemy.speciesId]=(mastery.bySpecies[enemy.speciesId]??0)+1;
  updated.push({item,race,kills:mastery.byRace[race],tier:masteryTierForKills(mastery.byRace[race])})
 }
 return updated
}

export function weaponMasteryDamageMultiplier(state,monster,enemy){
 if(!state||!monster||!enemy)return 1;
 const race=SPECIES[enemy.speciesId]?.race;if(!race)return 1;
 const ids=[monster.equipment?.weaponRight,monster.equipment?.weaponLeft].filter(Boolean);
 let bonus=0;
 for(const id of new Set(ids)){
  const item=state.equipment?.find(entry=>entry.id===id);if(!item||item.slot!=="weapon")continue;
  const kills=normalizeWeaponMastery(item)?.byRace?.[race]??0;
  bonus+=masteryTierForKills(kills).bonus
 }
 return 1+Math.min(.30,bonus)
}

export function weaponMasteryRows(item){
 const mastery=normalizeWeaponMastery(item);if(!mastery)return[];
 return Object.entries(mastery.byRace).filter(([,kills])=>kills>0).sort((a,b)=>b[1]-a[1]).map(([race,kills])=>{
  const trait=WEAPON_RACE_TRAITS[race]??{name:`${race}特効`,icon:"⚔️"},tier=masteryTierForKills(kills),next=nextMasteryTier(kills);
  return{race,kills,trait,tier,next}
 })
}

export function weaponMasteryBadge(item){
 const mastery=normalizeWeaponMastery(item);if(!mastery)return"";
 const rows=weaponMasteryRows(item),best=rows.sort((a,b)=>b.tier.level-a.tier.level||b.kills-a.kills)[0];
 if(!best)return`<span class="growth-chip muted">⚔️ 撃破 0</span>`;
 return`<span class="growth-chip">${best.trait.icon} ${best.trait.name}${best.tier.label||""}</span><span class="growth-chip muted">撃破 ${mastery.totalKills.toLocaleString()}</span>`
}

export function weaponMasterySummary(item){
 const mastery=normalizeWeaponMastery(item);if(!mastery)return"";
 const rows=weaponMasteryRows(item);
 if(!rows.length)return`<details class="weapon-mastery"><summary><b>⚔️ 撃破履歴</b><span>まだ記録なし</span></summary><small>この武器で敵を倒すと、種族ごとの特効が育ちます。</small></details>`;
 return`<details class="weapon-mastery"><summary><b>⚔️ 撃破履歴</b><span>累計 ${mastery.totalKills.toLocaleString()}体</span></summary><div class="weapon-mastery-list">${rows.map(row=>`<div class="weapon-mastery-row"><span>${row.trait.icon}</span><section><b>${row.trait.name}${row.tier.label}</b><small>${row.kills.toLocaleString()}体撃破　${row.tier.bonus?`与ダメージ +${Math.round(row.tier.bonus*100)}%`:row.next?`あと${(row.next.kills-row.kills).toLocaleString()}体でⅠ解放`:""}</small><i><u style="width:${row.next?Math.min(100,row.kills/row.next.kills*100):100}%"></u></i></section></div>`).join("")}</div><small>解放条件：500体 / 1,000体 / 3,000体</small></details>`
}
