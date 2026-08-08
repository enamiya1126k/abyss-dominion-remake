export const ATTRIBUTES={
 neutral:{name:"無",icon:"⚪"},fire:{name:"火",icon:"🔥"},water:{name:"水",icon:"💧"},ice:{name:"氷",icon:"❄️"},lightning:{name:"雷",icon:"⚡"},thunder:{name:"雷",icon:"⚡"},earth:{name:"土",icon:"🪨"},wind:{name:"風",icon:"🌪️"},light:{name:"光",icon:"✨"},dark:{name:"闇",icon:"🌑"},poison:{name:"毒",icon:"☠️"},nature:{name:"自然",icon:"🌿"}
};
export const DEFAULT_RESISTANCES=Object.freeze(Object.fromEntries(Object.keys(ATTRIBUTES).map(id=>[id,1])));
export function normalizedResistances(value={}){return{...DEFAULT_RESISTANCES,...value}}
export const ATTRIBUTE_RELATIONS=Object.freeze({
 fire:{strong:["nature","ice"],weak:["water"]},
 water:{strong:["fire","earth"],weak:["lightning","nature"]},
 ice:{strong:["wind","nature"],weak:["fire"]},
 lightning:{strong:["water","wind"],weak:["earth"]},
 earth:{strong:["lightning","poison"],weak:["water","wind","nature"]},
 wind:{strong:["earth","poison"],weak:["ice","lightning"]},
 light:{strong:["dark","poison"],weak:["dark"]},
 dark:{strong:["light"],weak:["light"]},
 poison:{strong:["nature"],weak:["earth","wind","light"]},
 nature:{strong:["water","earth"],weak:["fire","ice","poison"]},
 neutral:{strong:[],weak:[]}
});
export function canonicalAttribute(id){return id==="thunder"?"lightning":id??"neutral"}
export function attributeDamageMultiplier(attacking,defending){
 const attack=canonicalAttribute(attacking),defense=canonicalAttribute(defending),relation=ATTRIBUTE_RELATIONS[attack]??ATTRIBUTE_RELATIONS.neutral;
 if(relation.strong.includes(defense))return 1.25;
 if(relation.weak.includes(defense))return .8;
 return 1;
}
export function attributeGuideRows(){return Object.entries(ATTRIBUTE_RELATIONS).filter(([id])=>id!=="neutral").map(([id,relation])=>({id,name:ATTRIBUTES[id]?.name??id,strong:relation.strong.map(key=>ATTRIBUTES[key]?.name??key),weak:relation.weak.map(key=>ATTRIBUTES[key]?.name??key)}))}
