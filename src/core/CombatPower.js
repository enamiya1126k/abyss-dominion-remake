import{calculatedStats}from"../models/Monster.js?v=0.9.15-alpha.95-abyss-skill-effects";

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
