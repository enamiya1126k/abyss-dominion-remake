// Public course and temperament rules. No race RNG or private state lives here.
export const COURSES459 = [
 {distance:500,shape:'straight',laps:1,seconds:17,name:'閃光の短距離',hint:'速さとスタートの加速がカギ'},
 {distance:1000,shape:'straight',laps:1,seconds:24,name:'王道の直線',hint:'速さとスタミナの配分がカギ'},
 {distance:1600,shape:'oval',laps:1,seconds:33,name:'王庭の一周',hint:'コーナーで器用さが生きる'},
 {distance:3000,shape:'oval',laps:2,seconds:46,name:'大周回の試練',hint:'持久力と終盤の余力がカギ'},
];
export function course459(value){const distance=typeof value==='object'?value?.distance:value;return COURSES459.find(c=>c.distance===Number(distance))??COURSES459[1]}
export const distance459=r=>r?.rulesVersion>=7?course459(r.track459).distance:1000;
export const courseLabel459=r=>`${r.course}・${distance459(r)}m${r.rulesVersion>=7&&course459(r.track459).shape==='oval'?'・'+course459(r.track459).laps+'周':'・直線'}`;
export const bond459=n=>Math.max(0,Math.min(1000,Math.floor(Number(n)||0)));
export function temperament459(n){const bond=bond459(n);return bond<200?{label:'気まぐれ',chance:.15}:bond<600?{label:'慣れてきた',chance:.05}:{label:'息ぴったり',chance:0}}
export function courseBonus459(profile,track){const c=course459(track);return c.distance===500?(profile.speed-profile.stamina)*.15:c.distance===1600?(profile.technique-70)*.18:c.distance===3000?(profile.stamina-profile.speed)*.22:0}
// Stadium centre-line begins at the bottom straight, moving right; one physical
// lap is two straights and two semicircles. Ratios map to the same geometry used
// to classify corners in the simulation. Lane offsets are visual only.
export function coursePoint459(progress,track){const c=course459(track);if(c.shape==='straight')return{x:8+84*Math.max(0,Math.min(1,progress)),y:50,angle:0,corner:false};
 const q=((progress*c.laps)%1+1)%1,L=104+52*Math.PI,u=q*L;
 if(u<26)return{x:50+u,y:76,angle:0,corner:false};
 if(u<26+26*Math.PI){const a=Math.PI/2-(u-26)/26;return{x:76+26*Math.cos(a),y:50+26*Math.sin(a),angle:a*180/Math.PI-90,corner:true}}
 if(u<78+26*Math.PI)return{x:76-(u-26-26*Math.PI),y:24,angle:180,corner:false};
 if(u<78+52*Math.PI){const a=-Math.PI/2-(u-78-26*Math.PI)/26;return{x:24+26*Math.cos(a),y:50+26*Math.sin(a),angle:a*180/Math.PI-90,corner:true}}
 return{x:24+(u-78-52*Math.PI),y:76,angle:0,corner:false};
}
export function appendHistory459(previous,record){const rows=Array.isArray(previous)?previous:[];if(rows.some(x=>x.raceId===record.raceId&&x.monsterId===record.monsterId))return rows;const next=[record,...rows],counts=new Map();return next.filter(x=>{const count=(counts.get(x.monsterId)||0)+1;counts.set(x.monsterId,count);return count<=20}).slice(0,200)}
export const monsterHistory459=(rows,id)=>(Array.isArray(rows)?rows:[]).filter(x=>x.monsterId===id).slice(0,20);
export function historyRecord459(room,racer,index,at){return{raceId:room.id,monsterId:racer.monsterId??racer.speciesId,speciesId:racer.speciesId,place:room.outcome.order.indexOf(index)+1,course:room.course,distance:distance459(room),shape:room.rulesVersion>=7?course459(room.track459).shape:'straight',condition:racer.condition,fatigue:racer.fatigue455??0,finishMs:Math.round(room.outcome.finishMs[index]),at}}
