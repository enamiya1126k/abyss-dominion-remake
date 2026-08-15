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

export const ATTRIBUTE_ORDER=Object.freeze(["neutral","fire","water","lightning","earth","wind","ice","light","dark"]);
export const DEFAULT_RESISTANCES=Object.freeze(Object.fromEntries(ATTRIBUTE_ORDER.map(id=>[id,1])));
export const ATTRIBUTE_RELATIONS=Object.freeze({
 neutral:{strong:[],weak:[]},
 fire:{strong:["ice"],weak:["water"]},
 water:{strong:["fire"],weak:["lightning"]},
 lightning:{strong:["water"],weak:["earth"]},
 earth:{strong:["lightning"],weak:["wind"]},
 wind:{strong:["earth"],weak:["ice"]},
 ice:{strong:["wind"],weak:["fire"]},
 light:{strong:["dark"],weak:["dark"]},
 dark:{strong:["light"],weak:["light"]}
});

function stableHash(value=""){
 let hash=2166136261;
 for(const char of String(value)){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}
 return hash>>>0;
}

export function canonicalAttribute(id,seed=""){
 const key=String(id??"neutral").toLowerCase();
 if(key==="thunder")return"lightning";
 if(key==="poison")return["dark","water","earth"][stableHash(seed||key)%3];
 if(key==="nature")return["wind","earth","light"][stableHash(seed||key)%3];
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
 if(relation.strong.includes(defense))return 1.25;
 if(relation.weak.includes(defense))return .8;
 return 1;
}

export function attributeGuideRows(){return ATTRIBUTE_ORDER.map(id=>{const relation=ATTRIBUTE_RELATIONS[id];return{id,name:ATTRIBUTES[id].name,icon:ATTRIBUTES[id].icon,strong:relation.strong.map(key=>ATTRIBUTES[key].name),weak:relation.weak.map(key=>ATTRIBUTES[key].name)}})}
export function compactAttributeChart(){return`${ATTRIBUTES.fire.icon}→${ATTRIBUTES.ice.icon}→${ATTRIBUTES.wind.icon}→${ATTRIBUTES.earth.icon}→${ATTRIBUTES.lightning.icon}→${ATTRIBUTES.water.icon}→${ATTRIBUTES.fire.icon}　${ATTRIBUTES.light.icon}⇄${ATTRIBUTES.dark.icon}　${ATTRIBUTES.neutral.icon}`}
