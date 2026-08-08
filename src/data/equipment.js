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
  {name:"鉄の剣",nativeRarity:"N",handedness:"right",stats:{atk:5,crit:2}},
  {name:"魔爪",nativeRarity:"R",handedness:"either",stats:{atk:7,spd:1}},
  {name:"炎刃",nativeRarity:"SR",handedness:"twoHanded",stats:{atk:9,crit:3}},
  {name:"捕獲師の短剣",nativeRarity:"R",handedness:"left",stats:{atk:4,capture:7}},
  {name:"星詠みの杖",nativeRarity:"SSR",weaponType:"staff",handedness:"twoHanded",stats:{matk:9,mdef:2,heal:4}},
  {name:"深森のワンド",nativeRarity:"R",weaponType:"staff",handedness:"either",stats:{matk:7,mp:6,heal:3}},
  {name:"黒曜の魔導杖",nativeRarity:"SR",weaponType:"staff",handedness:"twoHanded",stats:{matk:11,crit:2}},
  {name:"狩人の短弓",nativeRarity:"N",weaponType:"bow",handedness:"twoHanded",stats:{atk:7,spd:2,crit:2}},
  {name:"月影の長弓",nativeRarity:"SSR",weaponType:"bow",handedness:"twoHanded",stats:{atk:9,spd:3,crit:3}},
  {name:"星穿ちの魔弓",nativeRarity:"UR",weaponType:"bow",handedness:"twoHanded",stats:{atk:8,matk:6,crit:4}},
  {name:"白銀の剣",nativeRarity:"R",handedness:"right",stats:{atk:8,def:2}},
  {name:"処刑人の大斧",nativeRarity:"SR",handedness:"twoHanded",stats:{atk:14,crit:5,spd:-1}},
  {name:"風切り双刃",nativeRarity:"R",handedness:"either",stats:{atk:8,spd:5}},
  {name:"雷鳴槍",nativeRarity:"SSR",handedness:"twoHanded",stats:{atk:15,spd:4,crit:4}},
  {name:"聖堂騎士の剣",nativeRarity:"SR",handedness:"right",stats:{atk:11,def:4,mdef:3}},
  {name:"深海の三叉槍",nativeRarity:"SSR",handedness:"twoHanded",stats:{atk:16,matk:8,waterRes:10}},
  {name:"影縫いの苦無",nativeRarity:"SR",handedness:"left",stats:{atk:10,spd:7,evasion:3}},
  {name:"王家の大剣",nativeRarity:"UR",handedness:"twoHanded",stats:{atk:22,def:5,crit:6}},
  {name:"龍哭刀",nativeRarity:"LR",handedness:"twoHanded",stats:{atk:29,crit:9,spd:5}},
  {name:"黎明の聖剣",nativeRarity:"神話",handedness:"right",stats:{atk:36,matk:24,heal:8,crit:10}},
  {name:"骨喰らいの鎌",nativeRarity:"R",handedness:"twoHanded",stats:{atk:10,crit:4}},
  {name:"毒蛇の鞭",nativeRarity:"R",handedness:"either",stats:{atk:8,spd:3,poisonPower:8}},
  {name:"破城槌",nativeRarity:"SR",handedness:"twoHanded",stats:{atk:18,def:3,spd:-2}},
  {name:"精霊樹の杖",nativeRarity:"SR",weaponType:"staff",handedness:"twoHanded",stats:{matk:14,mp:14,heal:8}},
  {name:"氷晶の杖",nativeRarity:"SSR",weaponType:"staff",handedness:"twoHanded",stats:{matk:19,mdef:6,iceRes:12}},
  {name:"黄昏の魔典",nativeRarity:"UR",weaponType:"book",handedness:"left",stats:{matk:24,mp:20,crit:5}},
  {name:"太陽の神弓",nativeRarity:"LR",weaponType:"bow",handedness:"twoHanded",stats:{atk:27,matk:18,crit:11}},
  {name:"天穿の槍",nativeRarity:"UR",handedness:"twoHanded",stats:{atk:25,spd:8,crit:6}},
  {name:"星砕きの鎚",nativeRarity:"SSR",handedness:"twoHanded",stats:{atk:21,def:8,crit:3}},
  {name:"虚空の魔剣",nativeRarity:"神話",handedness:"either",stats:{atk:34,matk:34,crit:12,evasion:6}}
 ],
 armor:[
  {name:"革鎧",nativeRarity:"N",stats:{hp:12,def:3}},
  {name:"魔布のローブ",nativeRarity:"R",stats:{hp:18,def:2,mdef:4,heal:5}},
  {name:"竜鱗鎧",nativeRarity:"SSR",stats:{hp:25,def:6,fireRes:8}},
  {name:"守護者の外套",nativeRarity:"SR",stats:{hp:20,def:5,mdef:5}},
  {name:"鎖帷子",nativeRarity:"R",stats:{hp:20,def:6,spd:1}},
  {name:"白銀板金",nativeRarity:"SR",stats:{hp:32,def:10,mdef:4}},
  {name:"魔女の夜衣",nativeRarity:"SR",stats:{hp:24,matk:8,mdef:10,mp:10}},
  {name:"氷竜外套",nativeRarity:"SSR",stats:{hp:42,def:9,mdef:12,iceRes:16}},
  {name:"聖騎士重鎧",nativeRarity:"SSR",stats:{hp:55,def:16,mdef:10,spd:-1}},
  {name:"王者の戦装",nativeRarity:"UR",stats:{hp:74,def:21,atk:8,crit:5}},
  {name:"星幽ローブ",nativeRarity:"LR",stats:{hp:68,mp:32,matk:18,mdef:24}},
  {name:"天穹の神鎧",nativeRarity:"神話",stats:{hp:110,def:34,mdef:32,heal:12}}
 ],
 accessory:[
  {name:"旅人の指輪",nativeRarity:"N",stats:{spd:2,capture:3}},
  {name:"幸運の護符",nativeRarity:"R",stats:{crit:4,evasion:2}},
  {name:"癒やしの雫",nativeRarity:"SR",stats:{heal:12,hp:8}},
  {name:"炎の指輪",nativeRarity:"R",stats:{atk:3,fireRes:12}},
  {name:"生命の首飾り",nativeRarity:"R",stats:{hp:22,heal:4}},
  {name:"毒避け護石",nativeRarity:"R",stats:{mdef:5,poisonRes:18}},
  {name:"雷鳥の羽根",nativeRarity:"SR",stats:{spd:8,evasion:4,lightningRes:8}},
  {name:"月光の耳飾り",nativeRarity:"SSR",stats:{matk:9,mp:14,crit:6}},
  {name:"竜心の首輪",nativeRarity:"SSR",stats:{hp:34,atk:9,def:6}},
  {name:"賢者の宝珠",nativeRarity:"UR",stats:{matk:16,mdef:12,mp:24,heal:7}},
  {name:"時渡りの時計",nativeRarity:"LR",stats:{spd:18,evasion:10,crit:9}},
  {name:"天命の王冠",nativeRarity:"神話",stats:{hp:48,atk:18,matk:18,crit:12,heal:10}}
 ]
};

for(const[slot,bases]of Object.entries(EQUIPMENT_BASES))bases.forEach((base,index)=>{base.iconAtlas=slot;base.iconIndex=index});

export function equipmentIconMeta(item){
 if(!item)return{atlas:"weapon",column:0,row:0,columns:6,rows:5,slot:"weapon"};
 if(item.iconAtlas?.startsWith?.("endgame-"))return{atlas:item.iconAtlas,column:Math.max(0,Number(item.iconColumn)||0),row:Math.max(0,Number(item.iconRow)||0),columns:6,rows:item.iconAtlas==="endgame-abyss"?7:10,slot:item.slot??"weapon"};
 const base=(EQUIPMENT_BASES[item.slot]??[]).find(entry=>entry.name===item.name),index=Math.max(0,Number(item.iconIndex??base?.iconIndex)||0),columns=6,rows=item.slot==="weapon"?5:2;
 return{atlas:item.slot??"weapon",column:index%columns,row:Math.floor(index/columns),columns,rows,slot:item.slot??"weapon"};
}

export function equipmentStatLabel(key){
 return{atk:"物理ATK",matk:"魔法ATK",def:"物理DEF",mdef:"魔法DEF",hp:"HP",mp:"MP",spd:"SPD",crit:"会心",evasion:"回避",capture:"捕獲",heal:"回復量",fireRes:"炎耐性",waterRes:"水耐性",iceRes:"氷耐性",lightningRes:"雷耐性",poisonRes:"毒耐性",poisonPower:"毒威力"}[key]??key;
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
export function compatibleSubslots(item){const fixed=item?.ruleOverrides?.subslot;if(fixed&&EQUIPMENT_SLOT_ORDER.includes(fixed))return[fixed];if(item.slot==="armor")return["armorBody","armorSupport"];if(item.slot==="accessory")return["accessoryNeck","accessoryFinger"];if(item.handedness==="right")return["weaponRight"];if(item.handedness==="left")return["weaponLeft"];if(item.handedness==="twoHanded")return["weaponRight"];return["weaponRight","weaponLeft"]}
