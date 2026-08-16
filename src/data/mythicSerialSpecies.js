const unlock=value=>({type:"level",value});
const skill=(id,name,{level=1,mp=8,type="attack",power=1.5,target="敵単体",description="",...extra}={})=>({
  id,name,unlock:unlock(level),mp,type,power,target,description,...extra
});

function mythic({id,name,element,role,maxMp,stats,skills}){
  return Object.freeze({
    id,name,emoji:"✦",element,race:"human",role,rarity:"神話",minFloor:Number.MAX_SAFE_INTEGER,
    maxMp,captureRate:0,fieldEncounter:false,serialOnly:true,gachaExcluded:true,
    acquisition:["専用シリアルコード限定"],growth:{hp:1,atk:1,def:1,spd:1},baseStats:stats,
    rankNames:[name,`${name}・覚醒`,`${name}・神話`,`${name}・創世`],skills:[skills[0]],authoredSkills:skills,
    tags:["mythicSerial","invincibleAlliance"]
  });
}

export const MYTHIC_SERIAL_SPECIES=Object.freeze({
  myth_enami:mythic({
    id:"myth_enami",name:"えなみ",element:"fire",role:"support",maxMp:155,
    stats:{hp:340,atk:195,def:190,spd:108,crit:22,evasion:20},
    skills:[
      skill("enami_world_create","万象創作",{mp:10,power:1.75,allEnemies:true,target:"敵全体",damageClass:"magic",description:"海・星・山・空を同時に創り出して敵陣を塗り替える。"}),
      skill("enami_spicy_casino","スパイシーカジノ777",{level:20,mp:14,type:"multiAttack",power:.92,hits:3,description:"運命の数字を回し、熱い三連撃を叩き込む。"}),
      skill("enami_hyper_focus","天才の多動領域",{level:45,mp:18,type:"buff",power:0,target:"味方全体",partyShieldRate:.22,effects:[{kind:"atkUp",value:.32,turns:3,allies:true},{kind:"defUp",value:.3,turns:3,allies:true}],description:"味方全体へ最大HP22%分のシールドを配り、攻撃と防御を引き上げる。"}),
      skill("enami_genesis","創世遊戯・星海山空",{level:80,mp:34,power:3.4,allEnemies:true,target:"敵全体",damageClass:"magic",cooldown:4,description:"四つの世界を重ねて創世級の爆発を起こす。"})
    ]
  }),
  myth_rion:mythic({
    id:"myth_rion",name:"りおん",element:"ice",role:"support",maxMp:165,
    stats:{hp:370,atk:180,def:198,spd:78,crit:18,evasion:20},
    skills:[
      skill("rion_talk","万能話術",{mp:7,power:1.32,damageClass:"magic",effects:[{kind:"defDown",value:.28,turns:3,enemy:true}],description:"軽妙な話術で相手の守りを崩す。"}),
      skill("rion_arrange","主人公の段取り",{level:20,mp:12,type:"buff",power:0,target:"味方全体",effects:[{kind:"atkUp",value:.3,turns:3,allies:true},{kind:"defUp",value:.3,turns:3,allies:true},{kind:"spdUp",value:.28,turns:3,allies:true}],description:"全員が最も動きやすい状況を即座に整える。"}),
      skill("rion_therapy","理学療法士の手",{level:45,mp:16,type:"allHeal",power:0,heal:.48,target:"味方全体",cleanse:true,description:"味方全体を回復し、弱体を浄化する。"}),
      skill("rion_community","万界コミュニティ",{level:80,mp:30,mpRate:.65,type:"revive",power:0,revive:.28,reviveMp:.08,target:"戦闘不能の味方1体",cooldown:5,description:"最大MPの65%を捧げ、戦闘不能の味方1体をHP28%・MP8%で蘇生する。"})
    ]
  }),
  myth_yori:mythic({
    id:"myth_yori",name:"より",element:"water",role:"burst",maxMp:112,
    stats:{hp:410,atk:278,def:212,spd:106,crit:30,evasion:16},
    skills:[
      skill("yori_rifle","蒼晶銃剣",{mp:6,power:1.9,defenseIgnore:.2,description:"蒼い銃剣で狙撃と刺突を同時に行う。"}),
      skill("yori_beautiful","ビューティフォー！",{level:20,mp:11,type:"buff",power:0,target:"自分",effects:[{kind:"atkUp",value:.55,turns:3},{kind:"defUp",value:.25,turns:3}],description:"完璧な立ち回りで自身を大幅強化する。"}),
      skill("yori_tetrapod","因縁のテトラポット",{level:45,mp:19,power:2.25,allEnemies:true,target:"敵全体",description:"因縁の巨大テトラポットを戦場へ叩き落とす。"}),
      skill("yori_difficult","ディフィカルト・暴走",{level:80,mp:32,type:"multiAttack",power:1.28,hits:5,defenseIgnore:.35,cooldown:4,description:"蒼黒の禍々しいオーラを解放した五連殲滅攻撃。"})
    ]
  }),
  myth_hide:mythic({
    id:"myth_hide",name:"ひで",element:"dark",role:"bruiser",maxMp:118,
    stats:{hp:440,atk:292,def:226,spd:94,crit:26,evasion:14},
    skills:[
      skill("hide_crayfish","ザリガニ双爪",{mp:6,type:"multiAttack",power:.92,hits:2,description:"愛するザリガニの左右の爪で豪快に挟み込む。"}),
      skill("hide_hunt","狩猟免許・山海ドブ",{level:20,mp:10,power:1.65,effects:[{kind:"defDown",value:.3,turns:3,enemy:true}],description:"どんな場所からでも獲物を仕留める野生の一撃。"}),
      skill("hide_gourmet","狂宴料理フォー！",{level:45,mp:17,type:"allHeal",power:0,heal:.36,target:"味方全体",effects:[{kind:"atkUp",value:.38,turns:3,allies:true}],description:"常識外れの食材で仲間を回復・強化する。"}),
      skill("hide_master_claw","修士爪・紅殻大暴走",{level:80,mp:33,power:3.65,allEnemies:true,target:"敵全体",cooldown:4,description:"巨大な紅殻双爪で戦場すべてを粉砕する。"})
    ]
  })
});

export const MYTHIC_SERIAL_IDS=Object.freeze(Object.keys(MYTHIC_SERIAL_SPECIES));
