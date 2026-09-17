import{course459,bond459}from'./RaceCourse459.js';
export function boostLimit462(room){return (room?.rulesVersion??room?.version??0)>=8?({500:5,1000:10,1600:10,3000:20}[course459(room.track459).distance]):5}
export const boostCost462=room=>50/boostLimit462(room);
export function temperament462(value){const bond=bond459(value);return bond<200?{label:'気まぐれ',ignore:.18,rest:.35,surge:.30,pace:1}:bond<600?{label:'慣れてきた',ignore:.06,rest:.12,surge:.15,pace:1.015}:{label:'息ぴったり',ignore:0,rest:0,surge:0,pace:1.03}}
export function planTemperament462(r,random){const t=temperament462(r.bond459),seconds=course459(r.track459).seconds;return{temperament462:t,ignored462:0,commandRolls462:Array.from({length:boostLimit462(r)},random),restAt462:random()<t.rest?(seconds*(.25+random()*.4)*1000):-1,surgeAt462:random()<t.surge?(seconds*(.35+random()*.4)*1000):-1,restUntil462:0,surgeUntil462:0,loyalUntil462:0}}
export const boostHelp462=r=>`${boostLimit462(r)}回まで・待ち時間なし。1回1.4秒間＋18％、スタミナ−${boostCost462(r)}。同時加速は最大＋90％。なつき度が低いと最大2回、指示を無視することがあります（回数は消費・スタミナは消費なし）。`;
