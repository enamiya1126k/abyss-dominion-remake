export const DANGER_LEVELS={
  1:{name:"通常",icon:"○",enemyLevel:0,stats:1,reward:1,keyRate:1,treasureRate:1,bossCapture:1},
  2:{name:"危険",icon:"△",enemyLevel:4,stats:1.18,reward:1.25,keyRate:1.5,treasureRate:1.35,bossCapture:1.15},
  3:{name:"凶悪",icon:"◇",enemyLevel:9,stats:1.4,reward:1.6,keyRate:2.25,treasureRate:1.8,bossCapture:1.35},
  4:{name:"奈落",icon:"◆",enemyLevel:16,stats:1.72,reward:2.15,keyRate:3.5,treasureRate:2.4,bossCapture:1.65},
  5:{name:"深淵",icon:"☠",enemyLevel:25,stats:2.15,reward:3,keyRate:5,treasureRate:3.2,bossCapture:2}
};
export function dangerConfig(value){return DANGER_LEVELS[Math.max(1,Math.min(5,Number(value)||1))]}
export function dangerLabel(value){const d=dangerConfig(value);return`${d.icon} 危険度${value}・${d.name}`}
