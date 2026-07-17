export const SKILLS={
 slime_tackle:{id:"slime_tackle",name:"体当たり",mp:2,type:"attack",power:1.25,description:"敵単体へ125%の物理ダメージ。"},
 slime_absorb:{id:"slime_absorb",name:"吸収",mp:4,type:"drain",power:1.05,drain:.45,description:"敵へダメージを与え、その45%を回復。"},
 slime_regen:{id:"slime_regen",name:"自己再生",mp:6,type:"selfHeal",heal:.4,description:"自身の最大HPの40%を回復。"},
 slime_split:{id:"slime_split",name:"分裂の恵み",mp:8,type:"allHeal",heal:.18,description:"味方全体の最大HPの18%を回復。"},
 slime_king:{id:"slime_king",name:"王の粘膜",mp:7,type:"selfHeal",heal:.55,description:"自身の最大HPの55%を回復。"},

 goblin_double:{id:"goblin_double",name:"二段斬り",mp:3,type:"multiAttack",power:.72,hits:2,description:"敵単体へ72%の攻撃を2回。"},
 goblin_steal:{id:"goblin_steal",name:"強奪斬り",mp:4,type:"attack",power:1.4,description:"敵単体へ140%の物理ダメージ。"},
 goblin_ambush:{id:"goblin_ambush",name:"奇襲",mp:6,type:"attack",power:1.85,critBonus:.2,description:"会心率の高い185%攻撃。"},
 goblin_poison:{id:"goblin_poison",name:"毒刃乱舞",mp:9,type:"multiAttack",power:.65,hits:4,description:"敵単体へ65%の攻撃を4回。"},
 goblin_general:{id:"goblin_general",name:"将軍の一閃",mp:10,type:"attack",power:2.45,description:"敵単体へ245%の物理ダメージ。"},

 fairy_heal:{id:"fairy_heal",name:"癒やしの風",mp:5,type:"allHeal",heal:.25,description:"味方全体の最大HPの25%を回復。"},
 fairy_barrier:{id:"fairy_barrier",name:"光の治癒",mp:5,type:"selfHeal",heal:.5,description:"自身の最大HPの50%を回復。"},
 fairy_cleanse:{id:"fairy_cleanse",name:"浄化の光",mp:7,type:"allHeal",heal:.32,description:"味方全体の最大HPの32%を回復。"},
 fairy_revive:{id:"fairy_revive",name:"生命の雫",mp:12,type:"allHeal",heal:.5,description:"味方全体の最大HPの50%を回復。"},
 fairy_spirit:{id:"fairy_spirit",name:"大精霊の祝福",mp:14,type:"allHeal",heal:.65,description:"味方全体の最大HPの65%を回復。"},

 dragon_breath:{id:"dragon_breath",name:"ドラゴンブレス",mp:5,type:"attack",power:1.6,description:"敵単体へ160%の強力な攻撃。"},
 dragon_fireball:{id:"dragon_fireball",name:"火炎弾",mp:8,type:"attack",power:2.2,description:"敵単体へ220%の高威力攻撃。"},
 dragon_roar:{id:"dragon_roar",name:"竜の咆哮",mp:7,type:"attack",power:1.45,description:"敵単体へ145%の衝撃ダメージ。"},
 dragon_vortex:{id:"dragon_vortex",name:"火焔渦",mp:11,type:"multiAttack",power:.85,hits:3,description:"敵単体へ85%の攻撃を3回。"},
 dragon_ancient:{id:"dragon_ancient",name:"古龍覚醒",mp:16,type:"attack",power:3.1,description:"敵単体へ310%の極大ダメージ。"},

 mushroom_spore:{id:"mushroom_spore",name:"毒胞子",mp:3,type:"attack",power:1.3,description:"敵単体へ130%の攻撃。"},
 mushroom_cloud:{id:"mushroom_cloud",name:"胞子雲",mp:5,type:"attack",power:1.55,description:"敵単体へ155%の攻撃。"},
 mushroom_drain:{id:"mushroom_drain",name:"腐食吸収",mp:7,type:"drain",power:1.35,drain:.5,description:"与えたダメージの50%を回復。"},
 mushroom_plague:{id:"mushroom_plague",name:"疫病庭園",mp:10,type:"multiAttack",power:.7,hits:4,description:"敵単体へ70%の攻撃を4回。"},
 mushroom_king:{id:"mushroom_king",name:"魔茸王の領域",mp:13,type:"attack",power:2.7,description:"敵単体へ270%の攻撃。"}
};
