export const RARITY_ORDER={N:0,R:1,SR:2,SSR:3,LR:4};
export const RARITY_COLORS={N:"#d9d9d9",R:"#71c5ff",SR:"#c586ff",SSR:"#ffd05c",LR:"#ff79dd"};

export const EQUIPMENT_BASES={
 weapon:[
  {name:"鉄の剣",stats:{atk:5,crit:2}},
  {name:"魔爪",stats:{atk:7,spd:1}},
  {name:"炎刃",stats:{atk:9,crit:3}},
  {name:"捕獲師の短剣",stats:{atk:4,capture:7}}
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
 return{atk:"ATK",def:"DEF",hp:"HP",spd:"SPD",crit:"会心",evasion:"回避",capture:"捕獲",heal:"回復量",fireRes:"炎耐性"}[key]??key;
}
