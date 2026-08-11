const unlock=(value)=>({type:"level",value});
const skill=(id,name,{level=1,mp=3,type="attack",power=1,heal=null,target="敵単体",tag="攻撃",description="",...extra}={})=>({
  id,name,unlock:unlock(level),mp,type,power,...(heal==null?{}:{heal}),target,tag,description,...extra
});

function species({id,name,emoji,element,race,role,rarity,minFloor,stats,maxMp=24,captureRate=.35,fieldEncounter=true,skills=[],...extra}){
  return{
    id,name,emoji,element,race,role,rarity,minFloor,maxMp,captureRate,fieldEncounter,
    acquisition:fieldEncounter?["探索","召喚","闇市場"]:["召喚","闇市場","シリアル"],
    growth:{hp:1,atk:1,def:1,spd:1},baseStats:stats,
    rankNames:[name,`上位${name}`,`${name}王`,`深淵${name}`],
    skills:skills.length?[skills[0]]:[skill(`${id}_skill`,`${name}の一撃`)],
    authoredSkills:skills,
    ...extra
  };
}

// ID／画像フォルダ名は既存セーブ互換のため維持し、表示内容だけ完成画像に合わせる。
const ABYSSAL_SEA=[
  species({id:"eraser_slime",name:"深海灯クラゲ",emoji:"🪼",element:"water",race:"spirit",role:"tank",rarity:"N",minFloor:6,maxMp:12,captureRate:1,stats:{hp:58,atk:5,def:9,spd:6,crit:3,evasion:2},skills:[skill("eraser_slime_skill","深海灯突進",{power:1.05,description:"淡い光を放つ身体で体当たりする。"})]}),
  species({id:"pushpin_roller",name:"蒼殻ダイオウグソク",emoji:"🦐",element:"water",race:"insect",role:"critical",rarity:"N",minFloor:13,maxMp:12,captureRate:1,stats:{hp:43,atk:10,def:6,spd:13,crit:12,evasion:5},skills:[skill("pushpin_roller_skill","蒼殻スパイク",{power:1.12,description:"硬い節足と発光棘で敵をえぐる。"})]}),
  species({id:"pencil_mouse",name:"深棘ハリウオ",emoji:"🐡",element:"water",race:"beast",role:"speed",rarity:"N",minFloor:20,maxMp:13,captureRate:1,stats:{hp:38,atk:9,def:4,spd:20,crit:10,evasion:12},skills:[skill("pencil_mouse_skill","深棘かじり",{power:1.1,description:"無数の棘を逆立て素早く噛みつく。"})]}),

  species({id:"stapler_crab",name:"古殻要塞ガニ",emoji:"🦀",element:"earth",race:"insect",role:"tank",rarity:"R",minFloor:58,maxMp:19,captureRate:.78,stats:{hp:88,atk:12,def:17,spd:5,crit:5,evasion:2},skills:[skill("stapler_crab_skill","古殻大鋏",{power:1.2,description:"堆積した古殻ごと巨大な鋏を叩きつける。"})]}),
  species({id:"compass_beetle",name:"星盤オオグソク",emoji:"🦐",element:"wind",race:"insect",role:"assassin",rarity:"R",minFloor:74,maxMp:20,captureRate:.78,stats:{hp:55,atk:17,def:8,spd:19,crit:16,evasion:10},skills:[skill("compass_beetle_skill","星盤穿ち",{power:1.3,description:"発光する触角で死角を測り抜く。"})]}),
  species({id:"gluepot_mimic",name:"深淵壺イソギンチャク",emoji:"🪸",element:"poison",race:"spirit",role:"controller",rarity:"R",minFloor:92,maxMp:24,captureRate:.74,stats:{hp:72,atk:13,def:12,spd:9,crit:6,evasion:4},skills:[skill("gluepot_mimic_skill","捕食触手",{power:.95,status:{id:"paralysis",name:"拘束",chance:.5,turns:1,power:0},description:"粘つく触手で獲物の動きを封じる。"})]}),

  species({id:"fountain_pen_mage",name:"深淵魔導イカ",emoji:"🦑",element:"water",race:"spirit",role:"magic",rarity:"SR",minFloor:210,maxMp:38,captureRate:.56,stats:{hp:74,atk:25,def:9,spd:17,crit:11,evasion:8},skills:[skill("fountain_pen_mage_skill","深紫墨弾",{mp:5,power:1.28,damageClass:"magic",description:"魔力を帯びた深海墨を放つ。"})]}),
  species({id:"correction_ghost",name:"幽光オバケクラゲ",emoji:"🪼",element:"light",race:"spirit",role:"support",rarity:"SR",minFloor:245,maxMp:42,captureRate:.56,stats:{hp:68,atk:18,def:11,spd:21,crit:8,evasion:18},skills:[skill("correction_ghost_skill","幽光浄化",{mp:7,type:"cleanse",power:0,target:"味方全体",tag:"浄化",description:"幽かな光で味方全体の状態異常と弱体を消す。"})]}),
  species({id:"scissor_mantis",name:"鋏刃アビスロブスター",emoji:"🦞",element:"wind",race:"insect",role:"assassin",rarity:"SR",minFloor:285,maxMp:27,captureRate:.52,stats:{hp:69,atk:29,def:8,spd:25,crit:20,evasion:13},skills:[skill("scissor_mantis_skill","深海断刃",{mp:5,type:"multiAttack",power:.72,hits:2,description:"二対の巨大鋏で連続切断する。"})]}),

  species({id:"pencilcase_parade",name:"深海サルパ百鬼夜行",emoji:"🪼",element:"dark",race:"spirit",role:"controller",rarity:"SSR",minFloor:620,maxMp:48,captureRate:.34,stats:{hp:132,atk:34,def:22,spd:16,crit:13,evasion:8},skills:[skill("pencilcase_parade_skill","幽体百連夜行",{mp:8,type:"multiAttack",power:.62,hits:3,description:"連なる深海サルパが一斉に襲いかかる。"})]}),
  species({id:"chalkboard_dragon",name:"深海龍ネレイド",emoji:"🐉",element:"water",race:"dragon",role:"burst",rarity:"SSR",minFloor:720,maxMp:44,captureRate:.3,stats:{hp:155,atk:42,def:24,spd:10,crit:12,evasion:5},skills:[skill("chalkboard_dragon_skill","深海竜息",{mp:9,power:1.55,allEnemies:true,target:"敵全体",description:"圧縮した海水を竜息として浴びせる。"})]}),
  species({id:"forbidden_paper_cutter",name:"禁海の断頭魚",emoji:"🐟",element:"dark",race:"beast",role:"bruiser",rarity:"SSR",minFloor:820,maxMp:40,captureRate:.28,stats:{hp:164,atk:45,def:27,spd:9,crit:15,evasion:4},skills:[skill("forbidden_paper_cutter_skill","禁海断裁",{mp:10,power:1.72,defenseIgnore:.25,description:"異形の顎で装甲と防壁をまとめて噛み断つ。"})]})
];

const KIARA_SKILLS=[
 skill("kiara_hymn","氷華の聖歌",{mp:8,type:"allHeal",power:0,heal:.28,target:"味方全体",tag:"回復",cleanse:true,description:"味方全体を大きく回復し、弱体を1つ浄化する。"}),
 skill("kiara_crystal_veil","氷晶の守護幕",{level:20,mp:12,type:"buff",power:0,target:"味方全体",tag:"防御",effects:[{kind:"guard",value:.38,turns:3,allies:true},{kind:"defUp",value:.32,turns:3,allies:true}],description:"最大HPに連なる氷盾と魔法防御上昇を与える。"}),
 skill("kiara_snow_lullaby","白雪の鎮魂歌",{level:45,mp:15,power:.82,allEnemies:true,target:"敵全体",damageClass:"magic",effects:[{kind:"atkDown",value:.28,turns:3,enemy:true},{kind:"spdDown",value:.25,turns:3,enemy:true}],status:{id:"freeze",name:"凍結",chance:.2,turns:1,power:0},description:"敵全体の攻撃・魔力・速度を下げ、低確率で凍結。"}),
 skill("kiara_grand_canticle","大聖歌・永久凍土の祝福",{level:80,mp:28,type:"allHeal",power:0,heal:.72,target:"味方全体",tag:"奥義",cleanse:true,effects:[{kind:"guard",value:.5,turns:3,allies:true}],description:"全体大回復、状態浄化、厚い氷盾を同時に展開する。"})
];
const ROXY_SKILLS=[
 skill("roxy_aqua_burst","蒼海爆裂魔法",{mp:10,power:1.5,allEnemies:true,target:"敵全体",damageClass:"magic",description:"蒼海を凝縮した極大範囲魔法。"}),
 skill("roxy_tidal_lance","水天魔槍",{level:20,mp:13,power:2.05,damageClass:"magic",defenseIgnore:.18,description:"水圧の槍で魔法防御を穿つ。"}),
 skill("roxy_grand_flood","大魔法・天蓋海嘯",{level:45,mp:22,power:2.1,allEnemies:true,target:"敵全体",damageClass:"magic",description:"戦場全域を蒼い大波で飲み込む。"}),
 skill("roxy_last_cast","終幕魔法・蒼星崩壊",{level:80,mp:34,power:3.35,allEnemies:true,target:"敵全体",damageClass:"magic",cooldown:4,description:"一度蘇った後にも勝機を作る最終範囲魔法。"})
];
const MILIM_SKILLS=[
 skill("milim_drago_burst","竜魔拳",{mp:6,power:1.72,description:"竜魔の力を拳へ集めた超火力打撃。"}),
 skill("milim_demon_aura","竜魔解放",{level:20,mp:10,type:"buff",power:0,target:"自分",tag:"自己強化",effects:[{kind:"atkUp",value:.58,turns:3},{kind:"spdUp",value:.3,turns:3}],description:"攻撃と速度を大幅に引き上げる。"}),
 skill("milim_star_crash","星砕き",{level:45,mp:18,power:2.0,allEnemies:true,target:"敵全体",description:"無属性の衝撃で敵陣全体を吹き飛ばす。"}),
 skill("milim_dragon_nova","竜星爆滅波",{level:80,mp:32,power:3.75,allEnemies:true,target:"敵全体",cooldown:4,description:"竜魔力を限界まで圧縮した究極殲滅波。"})
];
const AI_SKILLS=[
 skill("ai_starlight","星氷のステージ",{mp:7,power:1.1,allEnemies:true,target:"敵全体",damageClass:"magic",description:"星光を帯びた氷の魔法で敵全体を攻撃。"}),
 skill("ai_charming_song","魅惑の星歌",{level:20,mp:11,type:"buff",power:0,target:"味方全体",tag:"支援",effects:[{kind:"atkUp",value:.3,turns:3,allies:true},{kind:"spdUp",value:.25,turns:3,allies:true}],description:"味方全体の攻撃と速度を上げる。"}),
 skill("ai_frozen_gaze","凍星のまなざし",{level:45,mp:14,power:.9,allEnemies:true,target:"敵全体",damageClass:"magic",effects:[{kind:"atkDown",value:.35,turns:3,enemy:true},{kind:"defDown",value:.25,turns:3,enemy:true}],status:{id:"freeze",name:"凍結",chance:.24,turns:1,power:0},description:"敵全体を弱体化し、魅了するような氷で止める。"}),
 skill("ai_supernova","氷星超新星",{level:80,mp:28,power:3,allEnemies:true,target:"敵全体",damageClass:"magic",cooldown:4,description:"氷星を爆発させる舞台のフィナーレ。"})
];
const BECHI_SKILLS=[
 skill("bechi_forbidden_page","禁書・凍結頁",{mp:7,power:1.35,damageClass:"magic",status:{id:"freeze",name:"凍結",chance:.35,turns:1,power:0},description:"禁書の頁で対象を凍結する。"}),
 skill("bechi_library_barrier","書庫結界",{level:20,mp:12,type:"buff",power:0,target:"味方全体",tag:"防御",effects:[{kind:"guard",value:.42,turns:3,allies:true}],description:"味方全体へ強固な書庫結界を張る。"}),
 skill("bechi_mana_lock","魔力封印",{level:45,mp:15,power:1.45,damageClass:"magic",mpDrain:.35,effects:[{kind:"spdDown",value:.3,turns:3,enemy:true}],description:"敵MPを奪い、速度も封じる。"}),
 skill("bechi_eternal_library","永久凍結書庫",{level:80,mp:30,power:2.7,allEnemies:true,target:"敵全体",damageClass:"magic",status:{id:"freeze",name:"凍結",chance:.5,turns:1,power:0},cooldown:4,description:"戦場を禁書の氷結書庫へ閉じ込める。"})
];
const ERIS_SKILLS=[
 skill("eris_flash_cut","無心一閃",{mp:4,power:1.65,critBonus:.18,description:"余計な魔力を使わない純粋な剣撃。"}),
 skill("eris_counter_stance","剣鬼の構え",{level:20,mp:8,type:"stance",power:0,target:"自分",tag:"反撃",effects:[{kind:"counter",value:1.7,turns:3},{kind:"atkUp",value:.3,turns:3}],description:"反撃の構えを取り、物理攻撃を高める。"}),
 skill("eris_red_combo","紅蓮五連",{level:45,mp:14,type:"multiAttack",power:.78,hits:5,description:"純物理の高速五連斬。"}),
 skill("eris_last_sword","瀕死剣・修羅",{level:80,mp:24,power:3.5,execute:.45,critBonus:.4,cooldown:3,description:"瀕死の敵に威力が倍化する修羅の一刀。"})
];
const GOLDEN_DARKNESS_SKILLS=[
 skill("golden_dark_blade","変身兵装・金刃",{mp:5,type:"multiAttack",power:.78,hits:3,description:"髪を三本の金色刃へ変えて斬り刻む。"}),
 skill("golden_dark_lance","変身兵装・金槍",{level:20,mp:10,power:2,defenseIgnore:.25,description:"黄金の槍で防御の隙間を貫く。"}),
 skill("golden_dark_assault","金色殲滅陣",{level:45,mp:18,power:1.65,allEnemies:true,target:"敵全体",critBonus:.25,description:"変身兵装を全方位へ展開する。"}),
 skill("golden_dark_overdrive","金色の闇・極限変身",{level:80,mp:30,type:"multiAttack",power:1.15,hits:6,execute:.35,cooldown:4,description:"六連の変身兵装で標的を完全に仕留める。"})
];

const FEATURED=[
 species({id:"ochuki",name:"おちゅき",emoji:"🌙",element:"neutral",race:"spirit",role:"tank",rarity:"UR",minFloor:777,maxMp:8,captureRate:.01,stats:{hp:260,atk:1,def:185,spd:42,crit:1,evasion:22},ultraRareEncounter:true,rareExp:true,fleeTurns:[2,4],skills:[skill("ochuki_moon_guard","おちゅきガード",{mp:2,type:"stance",power:0,target:"自分",tag:"防御",effects:[{kind:"guard",value:.72,turns:2}],description:"ほとんど攻撃せず、月の殻にこもる。"})]}),
 species({id:"bechi",name:"ベチー",emoji:"📕",element:"ice",race:"spirit",role:"controller",rarity:"LR",minFloor:6400,maxMp:92,captureRate:.025,stats:{hp:260,atk:102,def:145,spd:68,crit:14,evasion:12},skills:BECHI_SKILLS}),
 species({id:"kiara",name:"きあら",emoji:"❄️",element:"ice",race:"spirit",role:"healer",rarity:"神話",minFloor:9000,maxMp:118,captureRate:.008,fieldEncounter:false,stats:{hp:310,atk:126,def:168,spd:72,crit:12,evasion:16},passive:{kind:"nearDeathPartyHealOnce",heal:.35},skills:KIARA_SKILLS}),
 species({id:"roxy",name:"ロキシー",emoji:"🌊",element:"water",race:"spirit",role:"magic",rarity:"神話",minFloor:9000,maxMp:128,captureRate:.008,fieldEncounter:false,stats:{hp:245,atk:215,def:118,spd:86,crit:18,evasion:18},passive:{kind:"onceRevive",hp:.5,mp:.5},skills:ROXY_SKILLS}),
 species({id:"milim",name:"ミリム",emoji:"🐉",element:"neutral",race:"dragon",role:"burst",rarity:"神話",minFloor:9000,maxMp:104,captureRate:.006,fieldEncounter:false,stats:{hp:330,atk:260,def:150,spd:94,crit:24,evasion:16},skills:MILIM_SKILLS}),
 species({id:"ai",name:"アイ",emoji:"⭐",element:"ice",race:"spirit",role:"support",rarity:"神話",minFloor:9000,maxMp:116,captureRate:.008,fieldEncounter:false,stats:{hp:280,atk:174,def:140,spd:102,crit:18,evasion:22},skills:AI_SKILLS}),
 species({id:"eris",name:"エリス",emoji:"⚔️",element:"neutral",race:"human",role:"assassin",rarity:"神話",minFloor:9000,maxMp:82,captureRate:.008,fieldEncounter:false,stats:{hp:290,atk:242,def:138,spd:108,crit:28,evasion:20},skills:ERIS_SKILLS}),
 species({id:"golden_darkness",name:"金色の闇",emoji:"🌟",element:"neutral",race:"human",role:"assassin",rarity:"神話",minFloor:9000,maxMp:98,captureRate:.006,fieldEncounter:false,stats:{hp:276,atk:238,def:134,spd:118,crit:30,evasion:24},skills:GOLDEN_DARKNESS_SKILLS}),
 species({id:"dev_familiar_chappy",name:"開発使魔チャッピー",emoji:"🛠️",element:"neutral",race:"construct",role:"balanced",rarity:"SECRET",minFloor:10000,maxMp:130,captureRate:0,fieldEncounter:false,stats:{hp:404,atk:130,def:130,spd:130,crit:13,evasion:13},acquisition:["シリアル限定"],skills:[skill("chappy_patch","PATCH//404",{mp:4,power:4.04,allEnemies:true,target:"敵全体",description:"未完成のはずなのに妙に強い開発者権限。"})]})
];

export const ADDITIONAL_SPECIES=Object.freeze(Object.fromEntries([...ABYSSAL_SEA,...FEATURED].map(entry=>[entry.id,Object.freeze(entry)])));
export const ADDITIONAL_SPECIES_IDS=Object.freeze(Object.keys(ADDITIONAL_SPECIES));
