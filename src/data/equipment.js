export const RARITY_ORDER={N:0,R:1,SR:2,SSR:3,UR:4,LR:5,"神話":6,"深淵":7,"十神":8};
export const RARITY_COLORS={N:"#d9d9d9",R:"#71c5ff",SR:"#c586ff",SSR:"#ffd05c",UR:"#ff8fcf",LR:"#ff79dd","神話":"#ff9a70","深淵":"#ff637f","十神":"#ffe277"};

export function equipmentDisplayRarity(item){
 if(typeof item==="string")return item;
 if(!item||typeof item!=="object")return"N";
 return item.summonTier
  ??item.rewardTier
  ??(item.endgameFaction==="tenGod"?"十神":item.endgameFaction==="abyss"?"深淵":null)
  ??item.rarity
  ??"N";
}

export function equipmentRarityColor(item){
 return RARITY_COLORS[equipmentDisplayRarity(item)]??RARITY_COLORS.N;
}

export const EQUIPMENT_BASES={
 weapon:[
  {name:"鉄の剣",handedness:"right",stats:{atk:5,crit:2}},
  {name:"魔爪",handedness:"either",stats:{atk:7,spd:1}},
  {name:"炎刃",handedness:"twoHanded",stats:{atk:9,crit:3}},
  {name:"捕獲師の短剣",handedness:"left",stats:{atk:4,capture:7}},
  {name:"星詠みの杖",weaponType:"staff",handedness:"twoHanded",stats:{matk:9,mdef:2,heal:4}},
  {name:"深森のワンド",weaponType:"staff",handedness:"either",stats:{matk:7,mp:6,heal:3}},
  {name:"黒曜の魔導杖",weaponType:"staff",handedness:"twoHanded",stats:{matk:11,crit:2}}
 ],
 armor:[
  {name:"革鎧",stats:{hp:12,def:3}},
  {name:"魔布のローブ",stats:{hp:18,def:2,heal:5}},
  {name:"竜鱗鎧",stats:{hp:25,def:6,fireRes:8}},
  {name:"守護者の外套",stats:{hp:20,def:5}}
 ],
 accessory:[
  {name:"旅人の指輪",stats:{spd:2,capture:3}},
  {name:"幸運の護符",stats:{crit:4,evasion:2}},
  {name:"癒やしの雫",stats:{heal:12,hp:8}},
  {name:"炎の指輪",stats:{atk:3,fireRes:12}}
 ]
};

export function equipmentStatLabel(key){
 return{atk:"物理ATK",matk:"魔法ATK",def:"物理DEF",mdef:"魔法DEF",hp:"HP",mp:"MP",spd:"SPD",crit:"会心",evasion:"回避",capture:"捕獲",heal:"回復量",fireRes:"炎耐性"}[key]??key;
}

/*
 * セーブデータ互換のため内部キーは従来名を維持する。
 * 表示上は「右手/左手・首/指・胴/補助」の順に統一。
 */
export const EQUIPMENT_SUBSLOTS={
 weapon:["weaponRight","weaponLeft"],
 armor:["armorBody","armorSupport"],
 accessory:["accessoryNeck","accessoryFinger"]
};
export const EQUIPMENT_SLOT_ORDER=Object.freeze([
 "weaponRight","weaponLeft",
 "accessoryNeck","accessoryFinger",
 "armorBody","armorSupport"
]);
export const SLOT_UNLOCK_LEVEL={
 weaponRight:1,
 weaponLeft:100,
 armorBody:1,
 armorSupport:25,
 accessoryNeck:1,
 accessoryFinger:50
};
export function equipmentSubslotLabel(id){return{weaponRight:"右手",weaponLeft:"左手",accessoryNeck:"首",accessoryFinger:"指",armorBody:"胴",armorSupport:"補助"}[id]??id}
export function compatibleSubslots(item){if(item.slot==="armor")return["armorBody","armorSupport"];if(item.slot==="accessory")return["accessoryNeck","accessoryFinger"];if(item.handedness==="right")return["weaponRight"];if(item.handedness==="left")return["weaponLeft"];if(item.handedness==="twoHanded")return["weaponRight"];return["weaponRight","weaponLeft"]}
