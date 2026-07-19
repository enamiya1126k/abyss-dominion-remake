export const ATTRIBUTES={
 neutral:{name:"無",icon:"⚪"},fire:{name:"火",icon:"🔥"},water:{name:"水",icon:"💧"},lightning:{name:"雷",icon:"⚡"},earth:{name:"土",icon:"🪨"},wind:{name:"風",icon:"🌪️"},light:{name:"光",icon:"✨"},dark:{name:"闇",icon:"🌑"},poison:{name:"毒",icon:"☠️"},nature:{name:"自然",icon:"🌿"}
};
export const DEFAULT_RESISTANCES=Object.freeze(Object.fromEntries(Object.keys(ATTRIBUTES).map(id=>[id,1])));
export function normalizedResistances(value={}){return{...DEFAULT_RESISTANCES,...value}}
