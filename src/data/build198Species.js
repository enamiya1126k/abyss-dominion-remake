/* build198: 属性別の不足を補う通常遭遇キャラクター10体。 */
const growth=Object.freeze({hp:1,atk:1,def:1,spd:1});

function species({id,emoji,name,element,race,role,rarity,minFloor,captureRate,maxMp,baseStats,skill}){
 return Object.freeze({
  id,emoji,name,element,race,role,rarity,minFloor,captureRate,maxMp,
  growth,
  baseStats:Object.freeze(baseStats),
  rankNames:Object.freeze([name,`上位${name}`,`${name}王`,`深淵${name}`]),
  skills:Object.freeze([{id:`${id}_skill`,name:skill,unlock:Object.freeze({type:"level",value:1}),description:`${skill}で戦う。`}])
 });
}

export const BUILD198_SPECIES=Object.freeze({
 static_hopper:species({id:"static_hopper",emoji:"🐇",name:"帯電トビネズミ",element:"lightning",race:"beast",role:"speed",rarity:"N",minFloor:32,captureRate:1,maxMp:14,baseStats:{hp:39,atk:10,def:4,spd:21,crit:11,evasion:13},skill:"帯電跳躍"}),
 thunder_shell_beetle:species({id:"thunder_shell_beetle",emoji:"🪲",name:"雷針カブト",element:"lightning",race:"insect",role:"tank",rarity:"R",minFloor:120,captureRate:.78,maxMp:18,baseStats:{hp:88,atk:13,def:17,spd:7,crit:6,evasion:3},skill:"雷針突進"}),
 storm_quill_boar:species({id:"storm_quill_boar",emoji:"🐗",name:"紫電針獣",element:"lightning",race:"beast",role:"critical",rarity:"SR",minFloor:240,captureRate:.56,maxMp:25,baseStats:{hp:105,atk:24,def:13,spd:17,crit:19,evasion:8},skill:"紫電針雨"}),
 volt_veil_arcanist:species({id:"volt_veil_arcanist",emoji:"🧙",name:"雷衣術師エレノア",element:"lightning",race:"human",role:"controller",rarity:"SSR",minFloor:520,captureRate:.34,maxMp:48,baseStats:{hp:135,atk:39,def:17,spd:23,crit:12,evasion:15},skill:"雷衣環流"}),
 stormfang_behemoth:species({id:"stormfang_behemoth",emoji:"🐺",name:"天雷牙獣ライガルム",element:"lightning",race:"beast",role:"speed",rarity:"UR",minFloor:1350,captureRate:.16,maxMp:42,baseStats:{hp:220,atk:55,def:28,spd:35,crit:22,evasion:20},skill:"天雷牙・瞬獄"}),
 thunder_crown_dragon:species({id:"thunder_crown_dragon",emoji:"🐉",name:"雷冠竜ヴォルトレクス",element:"lightning",race:"dragon",role:"burst",rarity:"LR",minFloor:3200,captureRate:.07,maxMp:58,baseStats:{hp:360,atk:72,def:52,spd:28,crit:18,evasion:12},skill:"雷冠竜界砲"}),
 frost_mole:species({id:"frost_mole",emoji:"🧊",name:"氷晶モグラ",element:"ice",race:"beast",role:"ambush",rarity:"R",minFloor:95,captureRate:.78,maxMp:18,baseStats:{hp:84,atk:14,def:16,spd:9,crit:8,evasion:5},skill:"氷晶掘り"}),
 aurora_mantis:species({id:"aurora_mantis",emoji:"🦗",name:"極光鎌虫",element:"ice",race:"insect",role:"assassin",rarity:"SR",minFloor:260,captureRate:.56,maxMp:28,baseStats:{hp:76,atk:27,def:9,spd:27,crit:21,evasion:15},skill:"極光双鎌"}),
 frozen_mirror_knight:species({id:"frozen_mirror_knight",emoji:"🛡️",name:"凍鏡騎士グラシエル",element:"ice",race:"human",role:"counter",rarity:"UR",minFloor:1450,captureRate:.16,maxMp:46,baseStats:{hp:285,atk:43,def:54,spd:18,crit:13,evasion:10},skill:"凍鏡反閃"}),
 ember_gecko:species({id:"ember_gecko",emoji:"🦎",name:"火種ヤモリ",element:"fire",race:"reptile",role:"burner",rarity:"N",minFloor:25,captureRate:1,maxMp:15,baseStats:{hp:44,atk:11,def:4,spd:18,crit:9,evasion:11},skill:"火種尾撃"})
});
