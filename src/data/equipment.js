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
  {name:"守護者の外套",nativeRarity:"SR",stats:{hp:20,def:5,mdef:5,spd:-2}},
  {name:"鎖帷子",nativeRarity:"R",stats:{hp:20,def:6,spd:1}},
  {name:"白銀板金",nativeRarity:"SR",stats:{hp:32,def:10,mdef:4}},
  {name:"魔女の夜衣",nativeRarity:"SR",stats:{hp:24,matk:8,mdef:10,mp:10,spd:5,evasion:3}},
  {name:"氷竜外套",nativeRarity:"SSR",stats:{hp:42,def:9,mdef:12,iceRes:16,spd:-2}},
  {name:"聖騎士重鎧",nativeRarity:"SSR",stats:{hp:55,def:16,mdef:10,spd:-1}},
  {name:"王者の戦装",nativeRarity:"UR",stats:{hp:74,def:21,atk:8,crit:5}},
  {name:"星幽ローブ",nativeRarity:"LR",stats:{hp:68,mp:32,matk:18,mdef:24,spd:10,evasion:6}},
  {name:"天穹の神鎧",nativeRarity:"神話",stats:{hp:110,def:34,mdef:32,heal:12}}
 ],
 accessory:[
  {name:"旅人の指輪",nativeRarity:"N",stats:{mp:8,spd:2,capture:3}},
  {name:"幸運の護符",nativeRarity:"R",stats:{hp:16,crit:4,evasion:2}},
  {name:"癒やしの雫",nativeRarity:"SR",stats:{heal:12,hp:20}},
  {name:"炎の指輪",nativeRarity:"R",stats:{mp:10,atk:3,fireRes:12}},
  {name:"生命の首飾り",nativeRarity:"R",stats:{hp:22,heal:4}},
  {name:"毒避け護石",nativeRarity:"R",stats:{hp:18,mdef:5,poisonRes:18}},
  {name:"雷鳥の羽根",nativeRarity:"SR",stats:{mp:14,spd:8,evasion:4,lightningRes:8}},
  {name:"月光の耳飾り",nativeRarity:"SSR",stats:{matk:9,mp:14,crit:6}},
  {name:"竜心の首輪",nativeRarity:"SSR",stats:{hp:34,atk:9,def:6}},
  {name:"賢者の宝珠",nativeRarity:"UR",stats:{matk:16,mdef:12,mp:24,heal:7}},
  {name:"時渡りの時計",nativeRarity:"LR",stats:{mp:20,spd:18,evasion:10,crit:9}},
  {name:"天命の王冠",nativeRarity:"神話",stats:{hp:48,atk:18,matk:18,crit:12,heal:10}}
 ]
};

const FIXED_SUBSLOTS_BY_NAME=Object.freeze({
 "守護者の外套":"armorSupport","魔女の夜衣":"armorSupport","氷竜外套":"armorSupport","星幽ローブ":"armorSupport",
 "幸運の護符":"accessoryNeck","癒やしの雫":"accessoryNeck","生命の首飾り":"accessoryNeck","毒避け護石":"accessoryNeck","竜心の首輪":"accessoryNeck","天命の王冠":"accessoryNeck",
 "旅人の指輪":"accessoryFinger","炎の指輪":"accessoryFinger","雷鳥の羽根":"accessoryFinger","月光の耳飾り":"accessoryFinger","賢者の宝珠":"accessoryFinger","時渡りの時計":"accessoryFinger"
});

const ARCHETYPE_LABELS=Object.freeze({
 physicalAttack:"物理攻撃特化型",magicAttack:"魔法攻撃特化型",balancedAttack:"攻撃バランス型",ultimateAttack:"最強攻撃型",
 physicalDefense:"物理防御特化型",magicDefense:"魔法防御特化型",balancedDefense:"防御バランス型",ultimateDefense:"最強防御型",
 hpTank:"HPタンク型",hpBalanced:"HPバランス型",ultimateHp:"最強HP型",
 mpTank:"MPタンク型",mpBalanced:"MPバランス型",ultimateMp:"最強MP型",
 fastest:"最速型",slow:"鈍足型",supportBalanced:"補助バランス型",elementalSupport:"属性支援型",ultimateSupport:"最強補助型"
});

export function inferredEquipmentSubslot(itemOrBase,slot=itemOrBase?.slot){
 const fixed=itemOrBase?.ruleOverrides?.subslot;
 if(fixed&&EQUIPMENT_SLOT_ORDER.includes(fixed))return fixed;
 const preferred=itemOrBase?.ruleOverrides?.preferredSubslot;
 if(preferred&&EQUIPMENT_SLOT_ORDER.includes(preferred))return preferred;
 const name=String(itemOrBase?.name??"");
 if(FIXED_SUBSLOTS_BY_NAME[name])return FIXED_SUBSLOTS_BY_NAME[name];
 if(slot==="armor")return"armorBody";
 if(slot==="accessory")return"accessoryNeck";
 return null;
}

export function equipmentIdentity(item,{subslot=null}={}){
 const rarity=equipmentDisplayRarity(item),rank=RARITY_ORDER[rarity]??0,stats=item?.stats??{},slot=item?.slot??"weapon",fixed=subslot??inferredEquipmentSubslot(item,slot);
 let id;
 if(slot==="weapon"){
  if(rank>=RARITY_ORDER["神話"])id="ultimateAttack";
  else if((Number(stats.matk)||0)>(Number(stats.atk)||0)*1.2)id="magicAttack";
  else if((Number(stats.atk)||0)>(Number(stats.matk)||0)*1.2)id="physicalAttack";
  else id="balancedAttack";
 }else if(fixed==="armorBody"){
  if(rank>=RARITY_ORDER["神話"])id="ultimateDefense";
  else if((Number(stats.def)||0)>(Number(stats.mdef)||0)*1.22)id="physicalDefense";
  else if((Number(stats.mdef)||0)>(Number(stats.def)||0)*1.22)id="magicDefense";
  else id="balancedDefense";
 }else if(fixed==="accessoryNeck"){
  id=rank>=RARITY_ORDER["神話"]?"ultimateHp":(Number(stats.hp)||0)>=30?"hpTank":"hpBalanced";
 }else if(fixed==="accessoryFinger"){
  id=rank>=RARITY_ORDER["神話"]?"ultimateMp":(Number(stats.mp)||0)>=18?"mpTank":"mpBalanced";
 }else{
  if(rank>=RARITY_ORDER["神話"])id="ultimateSupport";
  else if((Number(stats.spd)||0)<0)id="slow";
  else if((Number(stats.spd)||0)>=8)id="fastest";
  else if(Object.keys(stats).some(key=>/(Res|Damage)$/.test(key)))id="elementalSupport";
  else id="supportBalanced";
 }
 return{id,label:ARCHETYPE_LABELS[id]??"バランス型",subslot:fixed};
}

export function equipmentSeriesForItem(itemOrName,rarity=null){
 const item=typeof itemOrName==="string"?{name:itemOrName,rarity:rarity??"N"}:itemOrName??{},name=String(item.name??""),rank=RARITY_ORDER[equipmentDisplayRarity(item)]??0,stats=item.stats??{};
 if(/炎|竜鱗|太陽/.test(name))return"flame";
 if(/守護者|革鎧|鉄の剣|聖騎士|星砕き|天穹/.test(name))return"guardian";
 if(/旅人|幸運|月影|時渡り|天穿/.test(name))return"traveler";
 if(/捕獲師/.test(name))return"capturer";
 if(/精霊樹|生命|癒やし|竜心/.test(name))return"sacredTree";
 if(/深海|氷晶|氷竜|星詠み|星幽|賢者/.test(name))return"deepSea";
 if(/雷|龍哭/.test(name))return"thunder";
 if(/王家|王者|黎明|天命/.test(name))return"royal";
 if(/黄昏|虚空|月光/.test(name))return"void";
 if(rank<RARITY_ORDER.SSR)return null;
 if((Number(stats.matk)||0)>(Number(stats.atk)||0))return"deepSea";
 if((Number(stats.def)||0)+(Number(stats.mdef)||0)>(Number(stats.atk)||0)+(Number(stats.matk)||0))return"guardian";
 if((Number(stats.hp)||0)>=(Number(stats.mp)||0)*2)return"sacredTree";
 if((Number(stats.spd)||0)>=8)return"traveler";
 return"royal";
}

export function normalizeEquipmentIdentity(item,{equippedSubslot=null}={}){
 if(!item||typeof item!=="object")return item;
 item.ruleOverrides=item.ruleOverrides&&typeof item.ruleOverrides==="object"&&!Array.isArray(item.ruleOverrides)?item.ruleOverrides:{};
 if(["armor","accessory"].includes(item.slot)&&!item.ruleOverrides.subslot&&!item.ruleOverrides.preferredSubslot)item.ruleOverrides.preferredSubslot=equippedSubslot??inferredEquipmentSubslot(item,item.slot);
 const identity=equipmentIdentity(item,{subslot:item.ruleOverrides.subslot??item.ruleOverrides.preferredSubslot??equippedSubslot});
 item.archetype=identity.id;
 item.archetypeLabel=identity.label;
 if(!item.series)item.series=equipmentSeriesForItem(item);
 return item;
}

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
 weaponLeft:1,
 armorBody:1,
 armorSupport:1,
 accessoryNeck:1,
 accessoryFinger:1
};
export function equipmentSubslotLabel(id){return{weaponRight:"右手",weaponLeft:"左手",accessoryNeck:"首",accessoryFinger:"指",armorBody:"胴",armorSupport:"補助"}[id]??id}
export function compatibleSubslots(item){
 // build210: right/left remain save-compatible loadout positions, but every
 // weapon can be placed in either hand.  This intentionally runs before a
 // legacy ruleOverrides.subslot check so authored boss/signature weapons are
 // not silently locked to their old hand.
 if(item?.slot==="weapon")return["weaponRight","weaponLeft"];
 const fixed=item?.ruleOverrides?.subslot;if(fixed&&EQUIPMENT_SLOT_ORDER.includes(fixed))return[fixed];const preferred=inferredEquipmentSubslot(item,item?.slot);if(item.slot==="armor")return preferred==="armorSupport"?["armorSupport","armorBody"]:["armorBody","armorSupport"];if(item.slot==="accessory")return preferred==="accessoryFinger"?["accessoryFinger","accessoryNeck"]:["accessoryNeck","accessoryFinger"];return[]
}
