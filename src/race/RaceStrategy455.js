import{courseBonus459}from'./RaceCourse459.js';
// Race-only fitness. Species-keyed so swapping an identical copy cannot erase fatigue.
export const fatigueLevel455=value=>Math.max(0,Math.min(3,Math.floor(Number(value)||0)));
export const fatigueLabel455=value=>['疲労なし','疲労・小','疲労・中','疲労・大'][fatigueLevel455(value)];
export function nextFatigue455(previous={},speciesId){const next={};for(const[id,value]of Object.entries(previous)){const v=fatigueLevel455(value)-1;if(v>0)next[id]=v}next[speciesId]=Math.min(3,fatigueLevel455(previous[speciesId])+1);return next}
export function raceAssessment455(racer,course){const p=racer.profile,w=course==='砂'?[.3,.45,.25]:[.45,.2,.35],base=p.speed*w[0]+p.stamina*w[1]+p.technique*w[2],condition=(racer.condition-2)*7,aptitude=p.ground===course?8:0,fatigue=fatigueLevel455(racer.fatigue455)*6;const distance=racer.rulesVersion>=7?courseBonus459(p,racer.track459):0;return{base,condition,aptitude,fatigue,distance,score:base+condition+aptitude-fatigue+distance}}
export function raceWeight455(racer,course){return Math.exp((raceAssessment455(racer,course).score-70)/10)}
