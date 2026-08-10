import{calculatedStats}from"../models/Monster.js?v=2.4.0";
import{COMBAT_POWER_DISPLAY_SCALE}from"./config.js?v=2.4.0";

/**
 * 表示用の戦力値。
 * 実戦で使われる最終ステータスを基礎にし、HP・攻撃・防御・速度・会心・回避を
 * ひとつの比較しやすい数値へ圧縮する。戦闘処理そのものには影響しない。
 */
export function monsterCombatPower(monster){
  if(!monster)return 0;
  const s=calculatedStats(monster);
  const highAttack=Math.max(Math.max(0,s.atk),Math.max(0,s.matk??0));
  const lowAttack=Math.min(Math.max(0,s.atk),Math.max(0,s.matk??0));
  const highDefense=Math.max(Math.max(0,s.def),Math.max(0,s.mdef??0));
  const lowDefense=Math.min(Math.max(0,s.def),Math.max(0,s.mdef??0));
  const raw=
    Math.max(0,s.hp)*.35+
    (highAttack+lowAttack*.35)*4+
    (highDefense+lowDefense*.35)*3+
    Math.max(0,s.spd)*2+
    Math.max(0,s.crit)*12+
    Math.max(0,s.evasion)*10;
  // Actual stats are deliberately allowed to become enormous in the last
  // world. A fractional power keeps the rating readable without weakening a
  // single battle stat. It also prevents one contracted god from turning an
  // early party record into a ten-digit value.
  return Math.max(1,Math.round(Math.pow(Math.max(1,raw),.32)*COMBAT_POWER_DISPLAY_SCALE));
}

export function partyCombatPower(state){
  if(!state)return 0;
  const monsters=state.monsters??[];
  return(state.party??[])
    .map(id=>monsters.find(monster=>monster.id===id))
    .filter(Boolean)
    .reduce((total,monster)=>total+monsterCombatPower(monster),0);
}

export function formatCombatPower(value,{scientificAt=1_000_000_000}={}){
  const number=Math.max(0,Math.round(Number(value)||0));
  if(number>=scientificAt)return number.toExponential(3).replace("e+0","e+").replace("e-0","e-");
  return number.toLocaleString("ja-JP");
}

export function normalizeCombatPowerRecord(state,fallbackPower=0){
  state.records??={};
  const current=Math.max(0,Math.round(Number(fallbackPower)||0));
  const source=state.records.combatPower&&typeof state.records.combatPower==="object"&&!Array.isArray(state.records.combatPower)?state.records.combatPower:{};
  const version=Number(source.scaleVersion)||0;
  const convert=value=>{
    const number=Math.max(0,Number(value)||0);
    if(version>=4)return Math.round(number);
    // v3 was already compressed with raw^.4 * 200. Reconstruct the raw
    // comparison score once, then apply the tighter v4 scale.
    if(version===3){
      const raw=Math.pow(number/200,2.5);
      return raw?Math.max(1,Math.round(Math.pow(Math.max(1,raw),.32)*COMBAT_POWER_DISPLAY_SCALE)):0;
    }
    // v2 ratings were the uncompressed raw score multiplied by 1000.
    const raw=version>=2?number/1000:number;
    return raw?Math.max(1,Math.round(Math.pow(Math.max(1,raw),.32)*COMBAT_POWER_DISPLAY_SCALE)):0;
  };
  const highest=convert(source.highest);
  const previous=convert(source.previous);
  const history=(Array.isArray(source.history)?source.history:[]).filter(entry=>entry&&typeof entry==="object").map(entry=>({
    power:convert(entry.power),
    previous:convert(entry.previous),
    delta:convert(entry.power)-convert(entry.previous),
    floor:Math.max(1,Math.round(Number(entry.floor)||1)),
    at:typeof entry.at==="string"?entry.at:new Date(0).toISOString()
  })).filter(entry=>entry.power>0).slice(-20);
  state.records.combatPower={
    scaleVersion:4,
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
