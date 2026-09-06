export const HERO_SOLO_DAMAGE_RATES=Object.freeze({myth_enami:.35,myth_yori:.25,myth_rion:.50,myth_hide:.35});
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
    soloDamageRate:HERO_SOLO_DAMAGE_RATES[id],
    passiveDescription:`勇者の胆力：生存する勇者が自分1人なら被ダメージ30%軽減・与ダメージ${Math.round(HERO_SOLO_DAMAGE_RATES[id]*100)}%。勇者2人以上で本来の火力を発揮。`+(id==="myth_yori"?"被弾で攻撃20%上昇（3ターン・重複なし）。":""),
    tags:["mythicSerial","invincibleAlliance"]
  });
}

export const MYTHIC_SERIAL_SPECIES=Object.freeze({
  myth_enami:mythic({
    id:"myth_enami",name:"えなみ",element:"fire",role:"support",maxMp:155,
    stats:{hp:380,atk:195,def:215,spd:108,crit:22,evasion:23},
    skills:[
      skill("enami_world_create","メンタル！！",{soloShieldRate:0.18,mp:11,power:1.65,allEnemies:true,target:"敵全体",damageClass:"magic",effects:[{kind:"vulnerable",value:.25,turns:3,enemy:true}],description:"勇者が自分1人の編成なら自身にHP18%のシールド。敵全体へ魔法攻撃。被ダメージを25%増加させる（3ターン）。"}),
      skill("enami_spicy_casino","塩ください・777",{level:20,mp:14,type:"multiAttack",power:1.05,hits:3,defenseIgnore:.18,effects:[{kind:"healDown",value:.60,turns:3,enemy:true}],description:"3連撃。敵の回復量を60%低下させる（3ターン）。"}),
      skill("enami_hyper_focus","まかセロリ",{level:45,mp:18,type:"buff",power:0,target:"味方全体",partyShieldRate:.30,effects:[{kind:"atkUp",value:.30,turns:3,allies:true},{kind:"defUp",value:.30,turns:3,allies:true},{kind:"spdUp",value:.12,turns:3,allies:true}],description:"味方全体へHP30%のシールド、攻撃・防御30%と速度12%上昇（3ターン）。"}),
      skill("enami_genesis","おいおい！そんなもんか？！",{level:80,mp:36,power:3.6,allEnemies:true,target:"敵全体",damageClass:"magic",defenseIgnore:.2,bonusVsEffect:{kind:"defDown",multiplier:1.5},cooldown:4,effects:[{kind:"vulnerable",value:.18,turns:2,enemy:true}],description:"敵全体へ大魔法。防御低下中の敵には威力1.5倍。"})
    ]
  }),
  myth_rion:mythic({
    id:"myth_rion",name:"りおん",element:"nature",role:"support",maxMp:165,
    stats:{hp:405,atk:180,def:220,spd:122,crit:18,evasion:24},
    skills:[
      skill("rion_talk","いこうぜ！",{soloShieldRate:0.15,mp:8,power:1.2,allEnemies:true,target:"敵全体",reducePartyCooldowns:1,damageClass:"magic",effects:[{kind:"defDown",value:.25,turns:3,enemy:true},{kind:"spdDown",value:.25,turns:3,enemy:true}],description:"勇者が自分1人の編成なら自身にHP15%のシールド。敵全体へ魔法攻撃。防御・速度25%低下（3ターン）。味方の再使用を1ターン短縮（1ラウンド1回）。"}),
      skill("rion_arrange","最高やな",{level:20,mp:13,type:"buff",power:0,target:"味方全体",effects:[{kind:"atkUp",value:.25,turns:3,allies:true},{kind:"defUp",value:.22,turns:3,allies:true},{kind:"spdUp",value:.40,turns:3,allies:true}],description:"味方全体の速度40%・攻撃25%・防御22%上昇（3ターン）。"}),
      skill("rion_therapy","また今度やな",{level:45,mp:18,type:"allHeal",power:0,heal:.40,target:"味方全体",cleanse:true,effects:[{kind:"spdUp",value:.15,turns:2,allies:true}],description:"味方全体のHP40%回復と状態異常解除。速度15%上昇（2ターン）。"}),
      skill("rion_community","今日は豪遊するぞ！",{level:80,mp:30,mpRate:.58,type:"revive",power:0,revive:.50,reviveMp:.25,target:"戦闘不能の味方1体",cooldown:5,description:"戦闘不能の仲間をHP50%・MP25%で蘇生する。"})
    ]
  }),
  myth_yori:mythic({
    id:"myth_yori",name:"より",element:"water",role:"burst",maxMp:112,
    stats:{hp:410,atk:278,def:212,spd:106,crit:30,evasion:16},
    skills:[
      skill("yori_rifle","イージー！！",{mp:7,power:2.2,defenseIgnore:.32,bonusVsEffect:{kind:"defDown",multiplier:1.5},description:"防御32%無視の単体物理。防御低下中なら威力1.5倍。"}),
      skill("yori_beautiful","ユーアービューティフォー！！",{level:20,mp:11,type:"buff",power:0,target:"自分",effects:[{kind:"guaranteedCritical",value:1,turns:3},{kind:"atkUp",value:.70,turns:3},{kind:"defUp",value:.18,turns:3},{kind:"spdUp",value:.18,turns:3}],description:"自身の攻撃70%・防御18%・速度18%上昇（3ターン）。次の攻撃行動は確定会心。"}),
      skill("yori_tetrapod","開けんかいコラァ！",{soloShieldRate:0.15,level:45,mp:20,power:2.5,allEnemies:true,target:"敵全体",defenseIgnore:.50,bonusVsEffect:{kind:"vulnerable",multiplier:1.2},noLifeSteal:true,description:"勇者が自分1人の編成なら自身にHP15%のシールド。敵全体へ防御50%無視の物理攻撃。被ダメージ増加中なら威力1.2倍。"}),
      skill("yori_difficult","ディフィカルト・暴走",{level:80,mp:34,type:"multiAttack",power:1.38,hits:5,defenseIgnore:.45,bonusVsEffect:{kind:"vulnerable",multiplier:1.8},cooldown:4,description:"防御45%無視の5連撃。被ダメージ増加中なら威力1.8倍。撃破時、生存敵へ追加の拳を1発。"})
    ]
  }),
  myth_hide:mythic({
    id:"myth_hide",name:"ひで",element:"dark",role:"magic",maxMp:118,
    stats:{hp:440,atk:292,def:226,spd:94,crit:26,evasion:14},
    skills:[
      skill("hide_crayfish","フォー！！！！",{soloShieldRate:0.18,mp:9,power:1.55,allEnemies:true,target:"敵全体",damageClass:"magic",effects:[{kind:"accuracyDown",value:.25,turns:3,enemy:true}],description:"勇者が自分1人の編成なら自身にHP18%のシールド。敵全体へ魔法攻撃。命中25%低下（3ターン）。"}),
      skill("hide_hunt","待ってくださいよ〜！",{level:20,mp:12,power:1.75,damageClass:"magic",effects:[{kind:"defDown",value:.30,turns:3,enemy:true},{kind:"evasionDown",value:.30,turns:3,enemy:true}],description:"単体魔法。防御・回避30%低下（3ターン）。"}),
      skill("hide_gourmet","いいんすか！！",{level:45,mp:18,type:"allHeal",power:0,heal:.3,extendPartyBuffs:1,target:"味方全体",effects:[{kind:"atkUp",value:.40,turns:3,allies:true},{kind:"spdUp",value:.1,turns:3,allies:true}],description:"全体HP30%回復。攻撃40%・速度10%上昇（3ターン）。味方の強化を1ターン延長（1ラウンド1回・残り最大5ターン）。"}),
      skill("hide_master_claw","計算外・零点崩壊",{level:80,mp:36,power:3.9,allEnemies:true,target:"敵全体",damageClass:"magic",defenseIgnore:.25,bonusVsEffect:{kind:"vulnerable",multiplier:1.8},bonusPerDebuff:.15,debuffBonusCap:.9,cooldown:4,description:"敵全体へ大魔法。被ダメージ増加中なら威力1.8倍。弱体1種ごとにさらに15%強化（最大90%）。"})
    ]
  })
});

export const MYTHIC_SERIAL_IDS=Object.freeze(Object.keys(MYTHIC_SERIAL_SPECIES));
