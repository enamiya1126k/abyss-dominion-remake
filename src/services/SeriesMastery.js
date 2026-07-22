import{EQUIPMENT_SERIES}from"../data/equipmentSeries.js?v=0.9.15-alpha.32-phase10-10-release-audit";

export const SERIES_MASTERY_LEVELS=[
 {level:1,exp:0,label:"見習い",bonus:{}},
 {level:2,exp:50,label:"習熟",bonus:{hp:.02}},
 {level:3,exp:150,label:"熟達",bonus:{atk:.02,def:.02}},
 {level:4,exp:350,label:"達人",bonus:{spd:.03,crit:2}},
 {level:5,exp:700,label:"極致",bonus:{hp:.05,atk:.05,def:.05,spd:.05,crit:3}}
];

export function normalizeSeriesMastery(state){
 state.seriesMastery=state.seriesMastery&&typeof state.seriesMastery==="object"?state.seriesMastery:{};
 for(const id of Object.keys(EQUIPMENT_SERIES)){
  const row=state.seriesMastery[id]??={};
  row.exp=Math.max(0,Number(row.exp)||0);
  row.battles=Math.max(0,Number(row.battles)||0);
  state.seriesMastery[id]=row
 }
 return state.seriesMastery
}

export function seriesMasteryLevel(exp=0){
 let result=SERIES_MASTERY_LEVELS[0];
 for(const row of SERIES_MASTERY_LEVELS)if(exp>=row.exp)result=row;
 return result
}

export function nextSeriesMasteryLevel(exp=0){return SERIES_MASTERY_LEVELS.find(row=>exp<row.exp)??null}

export function recordSeriesBattle(state,party=[],equipment=[],{boss=false}={}){
 const mastery=normalizeSeriesMastery(state),byId=new Map(equipment.map(item=>[item.id,item])),earned={};
 for(const monster of party){
  const counts={};
  for(const id of Object.values(monster.equipment??{})){const item=byId.get(id);if(item?.series)counts[item.series]=(counts[item.series]??0)+1}
  for(const[seriesId,pieces]of Object.entries(counts)){if(pieces<2)continue;earned[seriesId]=(earned[seriesId]??0)+pieces*(boss?3:1)}
 }
 const results=[];
 for(const[seriesId,amount]of Object.entries(earned)){
  const row=mastery[seriesId]??={exp:0,battles:0},before=seriesMasteryLevel(row.exp);
  row.exp+=amount;row.battles++;mastery[seriesId]=row;
  const after=seriesMasteryLevel(row.exp);results.push({seriesId,amount,before,after,leveled:after.level>before.level,exp:row.exp})
 }
 return results
}

export function seriesMasteryBonusForMonster(state,counts={}){
 const mastery=normalizeSeriesMastery(state),bonus={hp:0,atk:0,def:0,spd:0,crit:0};
 for(const[seriesId,pieces]of Object.entries(counts)){
  if(pieces<2)continue;const level=seriesMasteryLevel(mastery[seriesId]?.exp??0);
  for(const[key,value]of Object.entries(level.bonus??{}))bonus[key]=(bonus[key]??0)+value
 }
 return bonus
}

export function seriesMasterySummary(state,seriesId){
 const mastery=normalizeSeriesMastery(state)[seriesId]??{exp:0,battles:0},level=seriesMasteryLevel(mastery.exp),next=nextSeriesMasteryLevel(mastery.exp),series=EQUIPMENT_SERIES[seriesId];
 const progress=next?Math.min(100,Math.round((mastery.exp-level.exp)/(next.exp-level.exp)*100)):100;
 const bonus=Object.entries(level.bonus??{}).map(([key,value])=>key==="crit"?`会心率 +${value}%`:`${({hp:"HP",atk:"ATK",def:"DEF",spd:"SPD"})[key]??key} +${Math.round(value*100)}%`).join(" / ")||"追加補正なし";
 return`<div class="series-mastery-box"><div class="spread"><b>🔥 ${series?.name??seriesId}熟練度 Lv.${level.level}</b><span>${level.label}</span></div><small>${bonus}</small><i><u style="width:${progress}%"></u></i><small>${next?`EXP ${mastery.exp.toLocaleString()} / ${next.exp.toLocaleString()}　あと${(next.exp-mastery.exp).toLocaleString()}`:`EXP ${mastery.exp.toLocaleString()}　MAX`} / 戦闘 ${mastery.battles.toLocaleString()}回</small><em>同シリーズを2部位以上装備して勝利すると上昇。ボス戦は3倍。</em></div>`
}
