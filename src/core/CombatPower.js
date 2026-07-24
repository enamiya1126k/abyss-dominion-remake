import{calculatedStats}from"../models/Monster.js?v=1.6.0";

/**
 * 表示用の戦力値。
 * 実戦で使われる最終ステータスを基礎にし、HP・攻撃・防御・速度・会心・回避を
 * ひとつの比較しやすい数値へ圧縮する。戦闘処理そのものには影響しない。
 */
export function monsterCombatPower(monster){
  if(!monster)return 0;
  const s=calculatedStats(monster);
  const raw=
    Math.max(0,s.hp)*.35+
    Math.max(0,s.atk)*4+
    Math.max(0,s.def)*3+
    Math.max(0,s.spd)*2+
    Math.max(0,s.crit)*12+
    Math.max(0,s.evasion)*10;
  return Math.max(1,Math.round(raw));
}

export function partyCombatPower(state){
  if(!state)return 0;
  const monsters=state.monsters??[];
  return(state.party??[])
    .map(id=>monsters.find(monster=>monster.id===id))
    .filter(Boolean)
    .reduce((total,monster)=>total+monsterCombatPower(monster),0);
}

export function formatCombatPower(value){
  return Math.max(0,Math.round(Number(value)||0)).toLocaleString("ja-JP");
}

export function normalizeCombatPowerRecord(state,fallbackPower=0){
  state.records??={};
  const current=Math.max(0,Math.round(Number(fallbackPower)||0));
  const source=state.records.combatPower&&typeof state.records.combatPower==="object"&&!Array.isArray(state.records.combatPower)?state.records.combatPower:{};
  const highest=Math.max(0,Math.round(Number(source.highest)||0));
  const previous=Math.max(0,Math.round(Number(source.previous)||0));
  const history=(Array.isArray(source.history)?source.history:[]).filter(entry=>entry&&typeof entry==="object").map(entry=>({
    power:Math.max(0,Math.round(Number(entry.power)||0)),
    previous:Math.max(0,Math.round(Number(entry.previous)||0)),
    delta:Math.round(Number(entry.delta)||0),
    floor:Math.max(1,Math.round(Number(entry.floor)||1)),
    at:typeof entry.at==="string"?entry.at:new Date(0).toISOString()
  })).filter(entry=>entry.power>0).slice(-20);
  state.records.combatPower={
    highest:highest||current,
    previous:previous||highest||current,
    updatedAt:typeof source.updatedAt==="string"?source.updatedAt:null,
    history
  };
  return state.records.combatPower;
}

export function recordPartyCombatPower(state,now=new Date()){
  const current=partyCombatPower(state),hadRecord=Math.max(0,Math.round(Number(state?.records?.combatPower?.highest)||0)),record=normalizeCombatPowerRecord(state,current);
  const at=now instanceof Date?now.toISOString():new Date(now).toISOString();
  if(current&&!hadRecord){
    record.highest=current;record.previous=current;record.updatedAt=at;
    record.history=[{power:current,previous:current,delta:0,floor:Math.max(1,Math.round(Number(state.player?.maxFloor)||1)),at}];
    return{changed:true,current,record,initialized:true};
  }
  if(!current||current<=record.highest)return{changed:false,current,record};
  const previous=record.highest;
  record.previous=previous;record.highest=current;record.updatedAt=at;
  record.history.push({power:current,previous,delta:current-previous,floor:Math.max(1,Math.round(Number(state.player?.maxFloor)||1)),at});
  if(record.history.length>20)record.history.splice(0,record.history.length-20);
  return{changed:true,current,record};
}
