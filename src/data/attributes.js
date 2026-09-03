export const ATTRIBUTES=Object.freeze({
 neutral:{name:"無",icon:"⚪"},
 fire:{name:"火",icon:"🔥"},
 water:{name:"水",icon:"💧"},
 lightning:{name:"雷",icon:"⚡"},
 earth:{name:"土",icon:"🪨"},
 wind:{name:"風",icon:"🌪️"},
 ice:{name:"氷",icon:"❄️"},
 light:{name:"光",icon:"✨"},
 dark:{name:"闇",icon:"🌑"}
});

// Build308: this is the single source of truth for both the rendered chart and
// every battle resolver.  An arrow means "the element on this side deals
// increased damage to the next element".
export const ATTRIBUTE_CYCLE=Object.freeze(["fire","ice","wind","earth","lightning","water"]);
export const ATTRIBUTE_OPPOSED_PAIR=Object.freeze(["light","dark"]);
export const ATTRIBUTE_MATCHUP_MULTIPLIERS=Object.freeze({strong:1.25,weak:.8,neutral:1});
export const ATTRIBUTE_ORDER=Object.freeze(["neutral","fire","water","lightning","earth","wind","ice","light","dark"]);
export const DEFAULT_RESISTANCES=Object.freeze(Object.fromEntries(ATTRIBUTE_ORDER.map(id=>[id,1])));
function cycleRelation(id){
 const index=ATTRIBUTE_CYCLE.indexOf(id);
 if(index<0)return{strong:Object.freeze([]),weak:Object.freeze([])};
 return{
  strong:Object.freeze([ATTRIBUTE_CYCLE[(index+1)%ATTRIBUTE_CYCLE.length]]),
  weak:Object.freeze([ATTRIBUTE_CYCLE[(index-1+ATTRIBUTE_CYCLE.length)%ATTRIBUTE_CYCLE.length]])
 };
}
export const ATTRIBUTE_RELATIONS=Object.freeze(Object.fromEntries(ATTRIBUTE_ORDER.map(id=>{
 if(ATTRIBUTE_OPPOSED_PAIR.includes(id)){
  const opposite=ATTRIBUTE_OPPOSED_PAIR.find(candidate=>candidate!==id);
  // Light and dark deal increased damage to each other.  Keeping the opposite
  // in `weak` also preserves the long-standing "vulnerable to" data contract.
  return[id,Object.freeze({strong:Object.freeze([opposite]),weak:Object.freeze([opposite])})];
 }
 return[id,Object.freeze(cycleRelation(id))];
})));

function stableHash(value=""){
 let hash=2166136261;
 for(const char of String(value)){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}
 return hash>>>0;
}

export function canonicalAttribute(id,seed=""){
 const key=String(id??"neutral").toLowerCase();
 if(key==="thunder")return"lightning";
 if(key==="poison")return["dark","water","earth","ice"][stableHash(seed||key)%4];
 if(key==="nature")return["wind","earth","light","ice"][stableHash(seed||key)%4];
 return ATTRIBUTES[key]?key:"neutral";
}

export function normalizedResistances(value={}){
 const result={...DEFAULT_RESISTANCES};
 for(const[id,multiplier]of Object.entries(value??{})){
  const canonical=canonicalAttribute(id,`resistance:${id}`),number=Number(multiplier);
  if(Number.isFinite(number))result[canonical]=Math.min(result[canonical]??1,number);
 }
 return result;
}

export function attributeDamageMultiplier(attacking,defending){
 const attack=canonicalAttribute(attacking),defense=canonicalAttribute(defending),relation=ATTRIBUTE_RELATIONS[attack]??ATTRIBUTE_RELATIONS.neutral;
 if(relation.strong.includes(defense))return ATTRIBUTE_MATCHUP_MULTIPLIERS.strong;
 if(relation.weak.includes(defense))return ATTRIBUTE_MATCHUP_MULTIPLIERS.weak;
 return ATTRIBUTE_MATCHUP_MULTIPLIERS.neutral;
}

export function attributesEffectiveAgainst(defending){
 const defense=canonicalAttribute(defending);
 return ATTRIBUTE_ORDER.filter(attacking=>attributeDamageMultiplier(attacking,defense)===ATTRIBUTE_MATCHUP_MULTIPLIERS.strong);
}
export function attributesIneffectiveAgainst(defending){
 const defense=canonicalAttribute(defending);
 return ATTRIBUTE_ORDER.filter(attacking=>attributeDamageMultiplier(attacking,defense)===ATTRIBUTE_MATCHUP_MULTIPLIERS.weak);
}
export function attributeGuideRows(){return ATTRIBUTE_ORDER.map(id=>{const relation=ATTRIBUTE_RELATIONS[id];return{id,name:ATTRIBUTES[id].name,strongIds:[...relation.strong],weakIds:[...relation.weak],strong:relation.strong.map(key=>ATTRIBUTES[key].name),weak:relation.weak.map(key=>ATTRIBUTES[key].name)}})}
// Retained for old callers, but no emoji are emitted. New UI uses the atlas
// through AttributeVisual.attributeCycleVisual().
export function compactAttributeChart(){return`${ATTRIBUTE_CYCLE.map(id=>ATTRIBUTES[id].name).join("→")}→${ATTRIBUTES[ATTRIBUTE_CYCLE[0]].name}　光⇄闇　無`}
