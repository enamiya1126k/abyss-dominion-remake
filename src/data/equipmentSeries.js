export const EQUIPMENT_SERIES={
 flame:{name:"炎帝",bonuses:{2:{atk:.10},4:{fireDamage:.18},6:{fireDamage:.30,fireRes:.25}}},
 guardian:{name:"守護者",bonuses:{2:{def:.15},4:{hp:.18},6:{def:.25,hp:.25}}},
 traveler:{name:"旅人",bonuses:{2:{spd:.10},4:{evasion:8},6:{spd:.20,evasion:15}}},
 capturer:{name:"捕獲師",bonuses:{2:{capture:.12},4:{capture:.20},6:{capture:.35}}}
};
export function activeSeriesBonuses(counts={}){const active=[];for(const[id,count]of Object.entries(counts)){const series=EQUIPMENT_SERIES[id];if(!series)continue;for(const[pieces,effect]of Object.entries(series.bonuses))if(count>=Number(pieces))active.push({seriesId:id,pieces:Number(pieces),effect})}return active}
