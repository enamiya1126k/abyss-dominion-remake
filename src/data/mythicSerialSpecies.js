const unlock=value=>({type:"level",value});
const skill=(id,name,{level=1,mp=8,type="attack",power=1.5,target="敵単体",description="",...extra}={})=>({
  id,name,unlock:unlock(level),mp,type,power,target,description,...extra
});

function mythic({id,name,element,role,maxMp,stats,skills}){
  return Object.freeze({
    id,name,emoji:"✦",element,race:"human",role,rarity:"神話",minFloor:Number.MAX_SAFE_INTEGER,
    maxMp,captureRate:0,fieldEncounter:false,serialOnly:true,gachaExcluded:true,
    acquisition:["専用シリアルコード限定"],growth:{hp:1,atk:1,def:1,spd:1},baseStats:stats,
    rankNames:[name,`${name}・覚醒`,`${name}・神話`,`${name}・極`],skills:[skills[0]],authoredSkills:skills,
    tags:["mythicSerial","invincibleAlliance"]
  });
}

export const MYTHIC_SERIAL_SPECIES=Object.freeze({
  myth_enami:mythic({
    id:"myth_enami",name:"えなみ",element:"fire",role:"support",maxMp:155,
    stats:{hp:380,atk:195,def:215,spd:108,crit:22,evasion:23},
    skills:[
      skill("enami_world_create","メンタル！！",{mp:11,power:1.65,allEnemies:true,target:"敵全体",damageClass:"magic",effects:[{kind:"defDown",value:.22,turns:3,enemy:true},{kind:"vulnerable",value:.12,turns:3,enemy:true}],description:"敵陣全体の守りと立て直しを同時に崩し、後続の一撃が通る状況を作る。"}),
      skill("enami_spicy_casino","塩ください・777",{level:20,mp:14,type:"multiAttack",power:1.05,hits:3,defenseIgnore:.18,effects:[{kind:"healDown",value:.28,turns:3,enemy:true}],description:"三連撃で回復の起点を潰す。より・ひでの追撃前に使うほど厄介。"}),
      skill("enami_hyper_focus","まかセロリ",{level:45,mp:18,type:"buff",power:0,target:"味方全体",partyShieldRate:.25,effects:[{kind:"atkUp",value:.28,turns:3,allies:true},{kind:"defUp",value:.34,turns:3,allies:true},{kind:"spdUp",value:.12,turns:3,allies:true}],description:"味方全体へ最大HP25%分のシールドを配り、攻撃・防御・速度をまとめて底上げする。"}),
      skill("enami_genesis","おいおい！そんなもんか？！",{level:80,mp:36,power:3.6,allEnemies:true,target:"敵全体",damageClass:"magic",defenseIgnore:.2,cooldown:4,effects:[{kind:"vulnerable",value:.18,turns:2,enemy:true}],description:"敵全体を大きく削り、さらに被ダメージを増幅して勇者一行の決定打へつなぐ。"})
    ]
  }),
  myth_rion:mythic({
    id:"myth_rion",name:"りおん",element:"nature",role:"support",maxMp:165,
    stats:{hp:405,atk:180,def:220,spd:122,crit:18,evasion:24},
    skills:[
      skill("rion_talk","いこうぜ！",{mp:8,power:1.2,damageClass:"magic",effects:[{kind:"defDown",value:.24,turns:3,enemy:true},{kind:"spdDown",value:.22,turns:3,enemy:true}],description:"最速で相手の守りと行動速度を落とし、勇者一行の連携を始動させる。"}),
      skill("rion_arrange","最高やな",{level:20,mp:13,type:"buff",power:0,target:"味方全体",effects:[{kind:"atkUp",value:.26,turns:3,allies:true},{kind:"defUp",value:.22,turns:3,allies:true},{kind:"spdUp",value:.38,turns:3,allies:true}],description:"全員の行動を一気に整える。特に速度上昇が大きく、4人揃うほど手数が止まらなくなる。"}),
      skill("rion_therapy","また今度やな",{level:45,mp:18,type:"allHeal",power:0,heal:.44,target:"味方全体",cleanse:true,effects:[{kind:"spdUp",value:.15,turns:2,allies:true}],description:"味方全体を回復・浄化し、そのまま次の行動へつなげる。"}),
      skill("rion_community","今日は豪遊するぞ！",{level:80,mp:30,mpRate:.58,type:"revive",power:0,revive:.38,reviveMp:.14,target:"戦闘不能の味方1体",cooldown:5,description:"戦闘不能の仲間をHP38%・MP14%で復帰させ、崩したはずの連携を再始動させる。"})
    ]
  }),
  myth_yori:mythic({
    id:"myth_yori",name:"より",element:"water",role:"burst",maxMp:112,
    stats:{hp:410,atk:278,def:212,spd:106,crit:30,evasion:16},
    skills:[
      skill("yori_rifle","イージー！！",{mp:7,power:2.2,defenseIgnore:.32,bonusVsEffect:{kind:"defDown",multiplier:1.28},description:"防御低下中の相手へ威力が跳ね上がる単体物理。味方が崩した敵を迷わず殴り抜く。"}),
      skill("yori_beautiful","ビューティフォー！",{level:20,mp:11,type:"buff",power:0,target:"自分",effects:[{kind:"atkUp",value:.62,turns:3},{kind:"defUp",value:.18,turns:3},{kind:"spdUp",value:.18,turns:3}],description:"自身の火力と速度を引き上げ、フィニッシャーとしての圧を最大化する。"}),
      skill("yori_tetrapod","開けんかいコラァ！",{level:45,mp:20,power:2.5,allEnemies:true,target:"敵全体",defenseIgnore:.28,bonusVsEffect:{kind:"vulnerable",multiplier:1.2},noLifeSteal:true,description:"弱体化された敵陣へ防御無視の全体物理を叩き込む。"}),
      skill("yori_difficult","ディフィカルト・暴走",{level:80,mp:34,type:"multiAttack",power:1.38,hits:5,defenseIgnore:.45,bonusVsEffect:{kind:"vulnerable",multiplier:1.35},cooldown:4,description:"被ダメージ増加中の標的へ五連撃を集中させる最終打。連携後は極端に危険。"})
    ]
  }),
  myth_hide:mythic({
    id:"myth_hide",name:"ひで",element:"dark",role:"magic",maxMp:118,
    stats:{hp:440,atk:292,def:226,spd:94,crit:26,evasion:14},
    skills:[
      skill("hide_crayfish","フォー！！！！",{mp:9,power:1.55,allEnemies:true,target:"敵全体",damageClass:"magic",effects:[{kind:"accuracyDown",value:.14,turns:3,enemy:true}],description:"全体魔法で命中を崩し、相手の反撃精度を落とす。"}),
      skill("hide_hunt","待ってくださいよ〜！",{level:20,mp:12,power:1.75,damageClass:"magic",effects:[{kind:"defDown",value:.25,turns:3,enemy:true},{kind:"evasionDown",value:.18,turns:3,enemy:true}],description:"危険な相手を解析し、防御と回避を同時に崩す。"}),
      skill("hide_gourmet","いいんすか！！",{level:45,mp:18,type:"allHeal",power:0,heal:.3,target:"味方全体",effects:[{kind:"atkUp",value:.32,turns:3,allies:true},{kind:"spdUp",value:.1,turns:3,allies:true}],description:"味方全体を立て直しながら攻撃と速度を上げる。"}),
      skill("hide_master_claw","計算外・零点崩壊",{level:80,mp:36,power:3.9,allEnemies:true,target:"敵全体",damageClass:"magic",defenseIgnore:.25,bonusVsEffect:{kind:"defDown",multiplier:1.35},cooldown:4,description:"防御低下中の敵へ威力が大きく上がる全体魔法。えなみ・りおんの崩しから直結する。"})
    ]
  })
});

export const MYTHIC_SERIAL_IDS=Object.freeze(Object.keys(MYTHIC_SERIAL_SPECIES));
