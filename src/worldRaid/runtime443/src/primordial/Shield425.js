import {MOTHER_ID422} from './Mother422.js';
// Display capacity, like heroShieldMax378. Never changes grants or absorption.
export function motherShieldCapacity425(unit){
 return unit?.speciesId===MOTHER_ID422?Math.max(0,Math.floor(Number(unit._floorBossHpShieldMax425)||0),Math.floor(Number(unit._floorBossHpShield)||0)):0;
}
export function rememberMotherShield425(unit){
 if(unit?.speciesId!==MOTHER_ID422)return 0;
 const capacity=motherShieldCapacity425(unit);if(capacity>0)unit._floorBossHpShieldMax425=capacity;return capacity;
}
