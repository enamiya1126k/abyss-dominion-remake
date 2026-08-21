/*
 * 深淵七柱・十神十柱 Character Bible。
 * 表示、契約スキル、敵AI、固有装備、試練が同じ正本を参照する。
 */

const SUBSLOTS=["weaponRight","weaponLeft","accessoryNeck","accessoryFinger","armorBody","armorSupport"];
const SLOT_BY_SUBSLOT={weaponRight:"weapon",weaponLeft:"weapon",accessoryNeck:"accessory",accessoryFinger:"accessory",armorBody:"armor",armorSupport:"armor"};

function active(key,name,type,power,mp,cooldown,description,extra={}){
 return{key,name,type,power,mp,cooldown,description,target:extra.allEnemies?"敵全体":extra.target??(type==="allHeal"||extra.allies?"味方全体":type==="buff"||type==="stance"?"自分":"敵単体"),tag:extra.tag??(type.includes("Heal")||type==="revive"?"回復":type==="buff"||type==="stance"?"権能":"攻撃"),...extra};
}
function equipment(names,effects){return SUBSLOTS.map((subslot,index)=>({subslot,slot:SLOT_BY_SUBSLOT[subslot],name:names[index],effectText:effects[index]}))}
function character(source){
 const prefix=source.faction==="abyss"?`深淵${source.numeral}`:`十神${source.numeral}`;
 const name=`${prefix} ${source.epithet}`;
 const skills=[source.basic,...source.authorities].map((skill,index)=>({...skill,id:`endgame__${source.id}__${skill.key}`,unlock:{type:"level",value:1},element:skill.element??source.element,damageClass:skill.damageClass??source.damageClass??"magic",tag:skill.tag??(index===0?"固有基本":"権能")}));
 const weaponSkill=source.signatureWeapon?.skill?{...source.signatureWeapon.skill,id:`endgame_weapon__${source.id}__${source.signatureWeapon.skill.key}`,equipmentGranted:true,unlock:{type:"equipment",value:1},element:source.signatureWeapon.skill.element??source.element,damageClass:source.signatureWeapon.skill.damageClass??source.damageClass??"magic"}:null;
 const signatureWeapon=source.signatureWeapon?{...source.signatureWeapon,skill:weaponSkill}:null;
 const gear=equipment(source.gearNames,source.gearEffects);
 return{...source,signatureWeapon,name,shortName:source.epithet,title:source.title??source.role,skills,signature:skills.at(-1).name,signatureName:skills.at(-1).name,gear,gearNames:{weapon:gear[0].name,armor:gear[4].name,accessory:gear[2].name},resistances:Object.entries(source.elementMultipliers).map(([element,multiplier])=>`${element} ${Math.round(multiplier*100)}%`).concat((source.statusProfile.immune??[]).map(id=>`${id}無効`)),reward:`${source.epithet}の欠片・${source.epithet}シリーズ`};
}

const RAW=[
 {id:"abyss_gluttony",faction:"abyss",numeral:"Ⅰ",epithet:"暴食",icon:"🌑",speciesId:"ogre",support:["vampire_bat","acid_slime","wraith"],seriesId:"abyssGluttony",element:"dark",role:"吸命要塞",title:"生命・魔力・戦線そのものを呑む第一柱",damageClass:"physical",ai:"欠損HPが大きい時は吸収技、敵MPが多い時は魔喰、瀕死者には処刑技を優先する。",passive:"飢界肉体：最大HP+38%、物理DEF+22%、魔法DEF+12%。SPDは22%低い。",awakening:"専用武器『飢界顎・アペティトゥス』装備中、満タンまで敵HPを防御無視で奪う『満命吸葬』を習得。",lore:"生命への欲望が巨大な胃袋として自我を得た、七つの深淵の第一柱。",encounterText:"『足りない。お前たちを喰らっても、まだ足りない。』",victoryText:"飢えは消えず、次なる器の奥へ静かに沈んだ。",statProfile:{hp:1.38,atk:1.08,matk:.72,def:1.22,mdef:1.12,spd:.78,crit:2,evasion:0,accuracy:8},elementMultipliers:{fire:1.5,water:.5,lightning:1,earth:.75,light:1.25,dark:.25},statusProfile:{immune:["poison","bleed","charm"],resistant:["fear"],weak:["freeze"]},
  basic:active("devour","捕食","drain",1.75,0,0,"敵単体へ175%。与ダメージの30%を吸収。",{drain:.3}),authorities:[active("rend","三顎喰裂","drain",1.3,20,2,"敵単体へ130%の3連撃。40%吸収し、出血を刻む。",{hits:3,drain:.4,status:{id:"bleed",name:"喰傷",chance:.6,turns:3,power:.03}}),active("roar","飢餓咆哮","drain",1.35,30,4,"敵全体へ135%。恐怖35%・ATK低下、命中後に自己回復。",{allEnemies:true,drain:.15,status:{id:"fear",name:"飢餓恐怖",chance:.35,turns:1},selfHeal:.06,effects:[{kind:"atkDown",value:.15,turns:3,enemy:true}]}),active("manaFeast","魔喰","attack",2.3,26,4,"敵単体のMP35%を吸収し、固有技の再使用を1ターン遅延。",{damageClass:"hybrid",mpDrain:.35,defenseIgnore:.2,increaseEnemyCooldowns:1,increaseAllyCooldowns:1}),active("allFeast","万象終喰","drain",6.6,62,8,"敵単体へ660%。65%吸収、現在HP10%追加、HP25%以下なら処刑威力。",{drain:.65,execute:.25,currentHpDamage:.1,guaranteedHit:true})],
  signatureWeapon:{name:"飢界顎・アペティトゥス",description:"欠けた生命だけを敵から直接喰い戻す、第一柱の生体大剣。",stats:{hp:620,atk:210,def:90,mdef:65},fixedEffects:{lifeSteal:25,hpPct:15,skillPower:12},resonance:{damageMultiplier:1.08,damageReductionRate:.08},skill:active("fullLifeBurial","満命吸葬","attack",0,0,9,"自分のHPが満タンになるまで敵単体のHPを防御無視で吸収。",{mpRate:.45,fillHpDrain:true,guaranteedHit:true,tag:"固有武器技"})},
  gearNames:["飢界顎・アペティトゥス","暴食の腕","暴食の胃袋","暴食の牙","暴食の皮","暴食の核"],gearEffects:["HP吸収+25%・最大HP+15%・固有武器技『満命吸葬』。","反撃と防御を両立する左腕。ダメージ軽減+8%。","最大HPと吸収回復を支える第二胃。","会心時の吸収効率を高める黒牙。","割合攻撃へ耐える再生外皮。","吸収技の威力とMP循環を強める飢餓核。"],setText:{2:"吸収回復量+12%",4:"最大HP+12%",6:"吸収技威力+25%"}},

 {id:"abyss_wrath",faction:"abyss",numeral:"Ⅱ",epithet:"憤怒",icon:"🔥",speciesId:"dark_knight",support:["orc","salamander","dark_knight"],seriesId:"abyssWrath",element:"fire",role:"瀕死反撃アタッカー",title:"傷と生命を会心へ燃やす第二柱",damageClass:"physical",ai:"HP半分までは報復態勢、半分以下では憤激と憤怒解放を優先して短期決戦へ移る。",passive:"血焔肉体：物理ATK+42%、SPD+12%、会心+18。代わりに物理DEF-10%、魔法DEF-18%。",awakening:"専用武器『血債剣・イラ』装備中、挑発・40%軽減・300%反撃を同時展開する『血債反照』を習得。",lore:"奪われた者たちの怒号と、届かなかった祈りが紅蓮の鎧を得た。",encounterText:"『痛みを知れ。俺が積み上げたすべての痛みを。』",victoryText:"怒号は遠ざかり、赤い残火だけが地面に残った。",statProfile:{hp:1.08,atk:1.42,matk:.7,def:.9,mdef:.82,spd:1.12,crit:18,evasion:2,accuracy:10},elementMultipliers:{fire:.25,water:1.5,lightning:.75,earth:1,light:1,dark:1},statusProfile:{immune:["fear"],resistant:["charm","confusion"],weak:["sleep","freeze"]},
  basic:active("crush","焔骨破砕","attack",1.9,0,0,"敵単体へ190%。会心率+25%、物理DEFを12%低下。",{critBonus:.25,effects:[{kind:"defDown",value:.12,turns:2,enemy:true}]}),authorities:[active("rageBlow","瀕怒撃","attack",4.1,20,2,"敵単体へ410%。自身HP50%以下なら威力+65%。",{lowHpBonus:.65,lowHpThreshold:.5,defenseIgnore:.2}),active("reprisal","血焔報復","stance",0,26,4,"2ターン挑発し、25%軽減しながら物理ATK220%で反撃。",{effects:[{kind:"taunt",turns:2},{kind:"counter",value:2.2,turns:2},{kind:"guard",value:.25,turns:2}]}),active("berserker","理性焼却","buff",0,34,5,"3ターンATK+55%・SPD+25%・命中+20%。被ダメージ+22%。",{effects:[{kind:"atkUp",value:.55,turns:3},{kind:"spdUp",value:.25,turns:3},{kind:"accuracyUp",value:.2,turns:3},{kind:"vulnerable",value:.22,turns:3}]}),active("rageRelease","憤怒解放・紅蓮葬","attack",5.8,64,8,"現在HP20%を代価に敵全体へ580%。必ず会心。",{allEnemies:true,guaranteedCritical:true,selfHpCostRate:.2})],
  signatureWeapon:{name:"血債剣・イラ",description:"持ち主の傷を借金として記録し、次の反撃で取り立てる両刃剣。",stats:{atk:310,spd:32,crit:20},fixedEffects:{critDamage:45,critRate:15,lowHpDamage:20},resonance:{damageMultiplier:1.1,critBonus:.08},skill:active("bloodDebtMirror","血債反照","stance",0,0,8,"3ターン挑発・40%軽減・物理ATK300%反撃。",{mpRate:.36,effects:[{kind:"taunt",turns:3},{kind:"guard",value:.4,turns:3},{kind:"counter",value:3,turns:3}],tag:"固有武器技"})},
  gearNames:["血債剣・イラ","憤怒の鎧片","憤怒の心臓","憤怒の爪","憤怒の鎧","憤怒の炎核"],gearEffects:["会心ダメージ+45%・低HP与ダメージ+20%・固有武器技『血債反照』。","反撃の衝撃を逃がす焼けた鎧片。","HP半分以下の猛攻を支える第二心臓。","会心率と命中を補う灼熱爪。","捨て身時の被害を抑える血鎧。","憤怒解放のMPと再使用を支える炎核。"],setText:{2:"会心ダメージ+20%",4:"会心率+8",6:"物理・魔法ATK+20%"}},

 {id:"abyss_envy",faction:"abyss",numeral:"Ⅲ",epithet:"嫉妬",icon:"🪞",speciesId:"mimic",support:["ghost","mimic","angelic_orb"],seriesId:"abyssEnvy",element:"water",role:"高速模倣デバッファー",title:"強化と長所を裏返して奪う第三柱",damageClass:"hybrid",ai:"強化中の敵を優先し、奪取→反転→完全模倣の順で相手の長所を弱点へ変える。",passive:"鏡像肉体：SPD+28%、回避+18、命中+20。HP-8%・物理DEF-8%と引き換えに物理／魔法両対応。",awakening:"専用武器『無貌鏡刃・インウィディア』装備中、敵強化と魔法陣を同時に奪う『無貌収奪』を習得。",lore:"自分を持てなかった影が、他者を写し続けて深淵へ至った。",encounterText:"『その力、その仲間、その未来――全部、私の方が似合う。』",victoryText:"砕けた鏡には、最後まで誰の顔も映らなかった。",statProfile:{hp:.92,atk:1.12,matk:1.12,def:.92,mdef:.96,spd:1.28,crit:10,evasion:18,accuracy:20},elementMultipliers:{fire:1,water:.25,lightning:1.5,earth:.75,light:1,dark:1},statusProfile:{immune:["charm","confusion"],resistant:["fear"],weak:["petrify"]},
  basic:active("trace","弱点模写","attack",1.55,0,0,"敵単体へ物理・魔法の高い方で155%。命中・回避を15%低下。",{damageClass:"hybrid",effects:[{kind:"accuracyDown",value:.15,turns:2,enemy:true},{kind:"evasionDown",value:.15,turns:2,enemy:true}]}),authorities:[active("copy","借影","buff",0,18,2,"敵の強化を1つ解除し、70%の効果量で自分へ複写。",{stealEnemyBuffRate:.7,dispelOne:true,stealOneBuffRate:.7,effects:[{kind:"atkUp",value:.2,turns:3},{kind:"spdUp",value:.2,turns:3}]}),active("covetEye","奪眼解析","attack",2.8,24,3,"敵単体へ280%。敵の最高攻撃値を参照し、ATK強化とDEF低下を同時付与。",{damageClass:"hybrid",copyAtk:true,effects:[{kind:"atkUp",value:.25,turns:4},{kind:"defDown",value:.22,turns:3,enemy:true}]}),active("jealousy","羨望反転","attack",3.2,32,4,"敵単体へ320%。強化を1つ解除し、80%相当の対応弱体へ反転。",{damageClass:"hybrid",invertEnemyBuffRate:.8,invertOneBuff:true,invertRate:.8,bonusVsEnemyBuff:{multiplier:1.35}}),active("perfectCopy","完全模倣・無貌","attack",5.8,58,8,"発動ごとに属性を変える必中攻撃。強化中の敵へ威力+50%、DEF35%無視。",{damageClass:"hybrid",randomElement:true,guaranteedHit:true,defenseIgnore:.35,copyAtk:true,bonusVsEnemyBuff:{multiplier:1.5}})],
  signatureWeapon:{name:"無貌鏡刃・インウィディア",description:"敵の加護と魔法陣を映し、原典側だけを空白にする水鏡の刃。",stats:{atk:185,matk:185,spd:58,accuracy:20,evasion:12},fixedEffects:{skillPower:18,statusChance:20,evasion:12},resonance:{damageMultiplier:1.06,critBonus:.05},skill:active("facelessTheft","無貌収奪","buff",0,0,8,"敵の強化を1つ100%複写し、敵側の魔法陣をランダムに1つ破壊。",{mpRate:.34,stealEnemyBuffRate:1,removeEnemyMagicCircle:true,effects:[{kind:"evasionUp",value:.25,turns:3}],tag:"固有武器技"})},
  gearNames:["無貌鏡刃・インウィディア","嫉妬の鏡盾","嫉妬の瞳","嫉妬の指輪","嫉妬の鏡衣","嫉妬の核"],gearEffects:["スキル威力+18%・状態命中+20%・固有武器技『無貌収奪』。","複写後の隙を受け流す反射盾。","解析精度と命中を高める第三眼。","奪った強化の持続を安定させる指輪。","回避と魔法DEFを補う可変鏡衣。","反転・複写技の再使用を支える無貌核。"],setText:{2:"状態異常耐性+12%",4:"SPD+8%",6:"固有スキル威力+25%"}},

 {id:"abyss_sloth",faction:"abyss",numeral:"Ⅳ",epithet:"怠惰",icon:"💤",speciesId:"stone_golem",support:["healing_mushroom","ghost","stone_golem"],seriesId:"abyssSloth",element:"earth",role:"低速制圧タンク",title:"行動回数と時間を沈める第四柱",damageClass:"magic",ai:"速度低下を先に重ね、睡眠対象へ永眠を撃つ。自分は遅いが長期戦ほど妨害密度が上がる。",passive:"停界肉体：最大HP+28%、物理DEF+48%、魔法DEF+45%。SPDは38%低い。",awakening:"専用武器『停刻杖・アケディア』装備中、SPDをさらに捨てて回避・防御へ変える『無為転界』を習得。",lore:"進むことを諦めた世界線が凝固し、巨大な眠りとして残った。",encounterText:"『急ぐ理由などない。いずれすべては、ここで止まる。』",victoryText:"止まっていた塵が落ち、世界の時間が再び流れ始めた。",statProfile:{hp:1.28,atk:.86,matk:1.12,def:1.48,mdef:1.45,spd:.62,crit:0,evasion:4,accuracy:6},elementMultipliers:{fire:1,water:.75,lightning:.25,earth:1.5,light:1,dark:1},statusProfile:{immune:["sleep","charm"],resistant:["paralysis","fear"],weak:[]},
  basic:active("drowse","微睡みの重圧","attack",1.2,0,0,"敵単体へ120%。睡眠35%、SPD-12%。",{status:{id:"sleep",name:"微睡み",chance:.35,turns:1},effects:[{kind:"spdDown",value:.12,turns:2,enemy:true}]}),authorities:[active("deepSleep","深層睡眠","attack",1,18,2,"敵単体へ100%。睡眠70%、SPD-30%、ATK-20%。",{status:{id:"sleep",name:"深層睡眠",chance:.7,turns:1},effects:[{kind:"spdDown",value:.3,turns:3,enemy:true},{kind:"atkDown",value:.2,turns:3,enemy:true}]}),active("gravity","惰性重力圏","attack",1.4,28,4,"敵全体へ140%。SPD-40%、回避-25%。",{allEnemies:true,effects:[{kind:"spdDown",value:.4,turns:3,enemy:true},{kind:"evasionDown",value:.25,turns:3,enemy:true}]}),active("timeField","時間停止域","attack",1,38,6,"敵全体へ100%。SPD・命中を低下し、敵固有技の再使用を2ターン遅延。",{allEnemies:true,increaseEnemyCooldowns:2,increaseAllyCooldowns:2,effects:[{kind:"spdDown",value:.45,turns:3,enemy:true},{kind:"accuracyDown",value:.25,turns:3,enemy:true}]}),active("eternalSleep","永眠葬界","attack",3,60,8,"敵全体へ300%。睡眠70%、行動停止35%。既に睡眠中なら威力+60%。",{allEnemies:true,status:{id:"sleep",name:"永眠",chance:.7,turns:2},bonusVsStatus:{id:"sleep",multiplier:1.6},effects:[{kind:"stun",statusId:"sleep",chance:.35,turns:1,enemy:true}]})],
  signatureWeapon:{name:"停刻杖・アケディア",description:"速度を捨てた量だけ術者の輪郭を薄め、攻撃を空振りさせる巨大杖。",stats:{hp:520,matk:210,def:185,mdef:185},fixedEffects:{damageReduction:15,guardPower:25,statusResistance:25},resonance:{damageReductionRate:.12,damageMultiplier:1.04},skill:active("idleWorld","無為転界","stance",0,0,8,"3ターン自分のSPD-45%。代わりに回避+35%、被ダメージ50%軽減。",{mpRate:.32,effects:[{kind:"spdDown",value:.45,turns:3},{kind:"evasionUp",value:.35,turns:3},{kind:"guard",value:.5,turns:3}],tag:"固有武器技"})},
  gearNames:["停刻杖・アケディア","怠惰の玉座","怠惰の欠片","怠惰の指輪","怠惰の衣","怠惰の夢"],gearEffects:["被ダメージ-15%・状態耐性+25%・固有武器技『無為転界』。","攻撃を受け止める不動の副装。","最大MPと魔法DEFを補う停刻片。","睡眠・速度低下の命中を高める指輪。","物理／魔法DEFを均等に守る眠衣。","妨害技の再使用を支える永い夢。"],setText:{2:"状態異常耐性+18%",4:"最大MP+15%",6:"固有スキル威力+20%"}},

 {id:"abyss_greed",faction:"abyss",numeral:"Ⅴ",epithet:"強欲",icon:"💰",speciesId:"goblin_shaman",support:["mimic","goblin_guard","clockwork"],seriesId:"abyssGreed",element:"light",role:"強化・陣地強奪",title:"敵の優位を味方の財産へ換える第五柱",damageClass:"hybrid",ai:"敵に強化や魔法陣がある時は奪取を優先し、得た余剰を全体障壁と覇権強化へ換価する。",passive:"黄金肉体：魔法ATK+32%、魔法DEF+20%。攻防・速度は平均的で、命中+12。",awakening:"専用武器『万有王杖・アヴァリティア』装備中、敵強化を奪い全体障壁とCT短縮へ換える『万有換価』を習得。",lore:"世界を所有した王が最後に欲したものは、他者の可能性そのものだった。",encounterText:"『お前の力も運命も、まだ私の蔵にない。それは不自然だ。』",victoryText:"黄金は灰へ変わり、所有者のいない輝きだけが残った。",statProfile:{hp:1.08,atk:1.08,matk:1.32,def:1.08,mdef:1.2,spd:1,crit:8,evasion:6,accuracy:12},elementMultipliers:{fire:1,water:1,lightning:.75,earth:1,light:.25,dark:1.5},statusProfile:{immune:["charm"],resistant:["fear"],weak:[]},
  basic:active("collect","権利徴収","attack",1.5,0,0,"敵単体へ150%。強化を1つ解除し、50%の効果量で自分へ複写。",{damageClass:"hybrid",stealEnemyBuffRate:.5,dispelOne:true,stealOneBuffRate:.5}),authorities:[active("plunder","王権略奪","attack",3,22,2,"敵単体へ300%。強化を1つ100%複写し、与ダメージ15%を吸収。",{damageClass:"hybrid",drain:.15,stealEnemyBuffRate:1,dispelOne:true,stealOneBuffRate:1}),active("goldenSeizure","黄金収奪陣","attack",1.8,32,4,"敵全体へ180%。味方全体に最大HP12%障壁、自分を12%回復。",{damageClass:"hybrid",allEnemies:true,selfHeal:.12,partyShieldRate:.12,hpShieldRate:.12}),active("ownership","共同所有宣言","buff",0,36,5,"3ターン味方全体のATK・DEF+22%、被ダメージ15%軽減。",{target:"味方全体",effects:[{kind:"atkUp",value:.22,turns:3,allies:true},{kind:"defUp",value:.22,turns:3,allies:true},{kind:"guard",value:.15,turns:3,allies:true}]}),active("allMine","万物所有宣言","attack",4.6,64,8,"敵全体へ460%。強化を解除し、敵側の魔法陣を1つ破壊。",{damageClass:"hybrid",allEnemies:true,stealEnemyBuffRate:1,dispelOne:true,stealOneBuffRate:1,removeEnemyMagicCircle:true,breakAllyMagicCircle:true,selfAtk:.2})],
  signatureWeapon:{name:"万有王杖・アヴァリティア",description:"敵の優位を黄金へ換算し、味方全員へ再配分する契約王杖。",stats:{matk:290,mp:90,mdef:110,crit:14},fixedEffects:{skillPower:20,mpCostReduction:12,freeSkillChance:10},resonance:{damageMultiplier:1.07,damageReductionRate:.06},skill:active("universalAppraisal","万有換価","buff",0,0,9,"敵強化を1つ100%複写し、味方全体へ18%障壁、発動中CTを1短縮。",{mpRate:.42,stealEnemyBuffRate:1,partyShieldRate:.18,reducePartyCooldowns:1,tag:"固有武器技"})},
  gearNames:["万有王杖・アヴァリティア","強欲の宝盾","強欲の首飾り","強欲の黄金指輪","強欲の王衣","強欲の財宝"],gearEffects:["スキル威力+20%・MP消費-12%・固有武器技『万有換価』。","奪取後の全体障壁を補強する宝盾。","最大MPと魔法DEFを高める契約首飾り。","複写した強化の会心効率を上げる王指輪。","複数の強化を安全に保持する王衣。","CT短縮とMP循環を支える無限財宝。"],setText:{2:"固有スキル威力+12%",4:"物理・魔法ATK+12%",6:"会心率+10"}},

 {id:"abyss_lust",faction:"abyss",numeral:"Ⅵ",epithet:"色欲",icon:"💗",speciesId:"wraith",support:["fairy","dream_eater","tide_siren"],seriesId:"abyssLust",element:"water",role:"高速魅了ヒーラー",title:"敵の意思と味方の命脈を結ぶ第六柱",damageClass:"magic",ai:"複数を誘惑して命中を落とし、戦線崩壊時は自身のHP半分を分与して蘇生する。",passive:"愛執肉体：魔法ATK+38%、SPD+30%、回避+20。代わりに最大HP-4%、物理DEF-12%。",awakening:"専用武器『心界扇・クピディタス』装備中、敵全体へ魅了・強化解除・吸命を行う『心界反転』を習得。",lore:"愛されたいという願いが、相手の意思を奪う権能へ歪んだ。",encounterText:"『心を預けて。痛みも迷いも、私が選んであげる。』",victoryText:"甘い霧が晴れ、奪われていた意思が持ち主へ帰った。",statProfile:{hp:.96,atk:.72,matk:1.38,def:.88,mdef:1.18,spd:1.3,crit:8,evasion:20,accuracy:16},elementMultipliers:{fire:1,water:.25,lightning:1.25,earth:.75,light:1,dark:1},statusProfile:{immune:["charm","confusion"],resistant:["fear"],weak:[]},
  basic:active("kiss","吸心接吻","attack",1.4,0,0,"敵単体へ140%。魅了30%、与ダメージ10%吸収。",{status:{id:"charm",name:"魅了",chance:.3,turns:1},drain:.1}),authorities:[active("temptation","万華誘惑","attack",1,20,2,"敵全体へ100%。魅了42%、ATK・命中を20%低下。",{allEnemies:true,status:{id:"charm",name:"誘惑",chance:.42,turns:1},effects:[{kind:"atkDown",value:.2,turns:3,enemy:true},{kind:"accuracyDown",value:.2,turns:3,enemy:true}]}),active("pet","愛玩命令","attack",3.1,26,3,"敵単体へ310%。魅了中なら威力+70%。混乱65%、魔法DEF25%無視。",{status:{id:"confusion",name:"愛玩混乱",chance:.65,turns:1},bonusVsStatus:{id:"charm",multiplier:1.7},defenseIgnore:.25}),active("sweetDream","分命の甘夢","allHeal",0,42,7,"味方全体を28%回復・浄化。倒れた味方1体へ自分の現在HP50%を分けて蘇生。",{heal:.28,cleanse:true,revive:.01,reviveTransferRate:.5,reviveMp:.2,partyShieldRate:.08,clearNegativeSelf:true}),active("mindControl","精神支配・恋獄","attack",4,62,8,"敵単体へ400%。魅了85%（2ターン）、ATK-40%・命中-35%・SPD-25%。",{status:{id:"charm",name:"精神支配",chance:.85,turns:2},effects:[{kind:"atkDown",value:.4,turns:3,enemy:true},{kind:"accuracyDown",value:.35,turns:3,enemy:true},{kind:"spdDown",value:.25,turns:3,enemy:true}]})],
  signatureWeapon:{name:"心界扇・クピディタス",description:"感情の流れを裏返し、敵意を陶酔へ、加護を空白へ変える深紅の扇。",stats:{matk:300,spd:60,heal:32,evasion:14},fixedEffects:{healPower:25,statusChance:20,evasion:12},resonance:{damageMultiplier:1.05,damageReductionRate:.05},skill:active("heartReversal","心界反転","attack",2.4,0,9,"敵全体へ240%。魅了50%、強化を1つ解除し、与ダメージ15%を吸収。",{mpRate:.4,allEnemies:true,status:{id:"charm",name:"心界魅了",chance:.5,turns:1},dispelEnemyBuff:true,dispelOne:true,drain:.15,tag:"固有武器技"})},
  gearNames:["心界扇・クピディタス","色欲の羽","色欲の首飾り","色欲の指輪","色欲の衣","色欲の心"],gearEffects:["回復量+25%・状態命中+20%・固有武器技『心界反転』。","回避と魅了対象からの被害を抑える副翼。","分命蘇生後の立て直しを支える首飾り。","魅了対象への命中と会心を補う指輪。","物理DEFの低さを補う夢衣。","魅了・蘇生・浄化のMP循環を守る心核。"],setText:{2:"回復量+15%",4:"味方全体HP再生+1.5%",6:"状態異常耐性+18%"}},

 {id:"abyss_pride",faction:"abyss",numeral:"Ⅶ",epithet:"傲慢",icon:"👑",speciesId:"ancient_dragon",support:["gargoyle","dark_knight","angelic_orb"],seriesId:"abyssPride",element:"dark",role:"全軍指揮・処刑",title:"臣下を強め、最強の敵を裁く第七柱",damageClass:"physical",ai:"味方が生存中は覇王令で全軍を維持し、強化中の高脅威対象を王の裁きで処刑する。",passive:"絶対王体：最大HP+20%、物理ATK+28%、物理／魔法DEF+25%、SPD+12%、会心+12。",awakening:"専用武器『絶対王剣・スペルビア』装備中、全軍強化・軽減・CT短縮を同時に行う『絶対王命』を習得。",lore:"世界より高い場所を求めた皇帝が、深淵そのものを玉座とした。",encounterText:"『跪け。許可なく我を見上げることすら罪である。』",victoryText:"王冠が割れ、初めて皇帝の視線が同じ高さまで落ちた。",statProfile:{hp:1.2,atk:1.28,matk:.9,def:1.25,mdef:1.25,spd:1.12,crit:12,evasion:8,accuracy:18},elementMultipliers:{fire:.75,water:.75,lightning:.75,earth:.75,light:1.5,dark:.25},statusProfile:{immune:["fear","charm"],resistant:["sleep","paralysis"],weak:[]},
  basic:active("royalStrike","王剣撃","attack",2.1,0,0,"敵単体へ210%。会心率+15%。",{critBonus:.15}),authorities:[active("royalAura","絶対王威","attack",1.4,24,3,"敵全体へ140%。恐怖45%、ATK-25%、DEF-15%。",{allEnemies:true,status:{id:"fear",name:"王威恐怖",chance:.45,turns:1},effects:[{kind:"atkDown",value:.25,turns:3,enemy:true},{kind:"defDown",value:.15,turns:3,enemy:true}]}),active("overlordOrder","覇王令・全軍進撃","buff",0,34,4,"味方全体のATK・DEF+25%、SPD+18%、命中+15%、被ダメージ10%軽減。",{target:"味方全体",effects:[{kind:"atkUp",value:.25,turns:3,allies:true},{kind:"defUp",value:.25,turns:3,allies:true},{kind:"spdUp",value:.18,turns:3,allies:true},{kind:"accuracyUp",value:.15,turns:3,allies:true},{kind:"guard",value:.1,turns:3,allies:true}]}),active("kingsJudgment","王の裁き・強者断頭","attack",5.6,40,5,"敵単体へ560%。必中・物理DEF55%無視。強化中なら威力+35%。",{defenseIgnore:.55,guaranteedHit:true,bonusVsEnemyBuff:{multiplier:1.35}}),active("endDeclaration","終焉宣告・万軍跪伏","attack",8,76,9,"敵全体へ800%。物理DEF30%無視、敵強化を1つ解除。",{allEnemies:true,defenseIgnore:.3,dispelEnemyBuff:true,dispelOne:true})],
  signatureWeapon:{name:"絶対王剣・スペルビア",description:"王の一振りを全軍の号令へ変える、七柱を締め括る黒金の大剣。",stats:{atk:285,def:125,mdef:125,spd:36,accuracy:18},fixedEffects:{skillPower:22,bossDamage:20,accuracy:15},resonance:{damageMultiplier:1.1,damageReductionRate:.08,critBonus:.05},skill:active("absoluteEdict","絶対王命","buff",0,0,9,"味方全体のATK・DEF+35%、SPD+20%、被ダメージ20%軽減。発動中CTを1短縮。",{mpRate:.45,target:"味方全体",reducePartyCooldowns:1,effects:[{kind:"atkUp",value:.35,turns:3,allies:true},{kind:"defUp",value:.35,turns:3,allies:true},{kind:"spdUp",value:.2,turns:3,allies:true},{kind:"guard",value:.2,turns:3,allies:true}],tag:"固有武器技"})},
  gearNames:["絶対王剣・スペルビア","王盾・傲慢","王冠","王印","王鎧","玉座"],gearEffects:["スキル威力+22%・ボス与ダメージ+20%・固有武器技『絶対王命』。","全軍の被害を均す黒金の王盾。","指揮範囲と状態耐性を拡張する王冠。","命中と会心を保証する臣従印。","物理／魔法DEFを等しく高める王鎧。","覇王令と終焉宣告を循環させる携行玉座。"],setText:{2:"物理・魔法ATK+10%",4:"物理・魔法DEF・SPD+10%",6:"ガード効果+20%"}},

 {id:"ten_time",faction:"tenGod",numeral:"Ⅰ",epithet:"時間",icon:"⏳",speciesId:"clockwork",support:["clockwork","ghost","angelic_orb"],seriesId:"godChronos",element:"light",role:"行動順・CT",title:"因果の速度を統べる第一法則",ai:"行動順を歪め、停止・逆行・遅延攻撃で手数そのものを支配する。",passive:"時相：偶数ターンは攻撃、奇数ターンは防御が上昇。",awakening:"15ターン経過で覚醒。2回行動、CT干渉強化、SPD上昇。",lore:"過去を裁かず未来を選ばず、因果の整合だけを守る観測者。",encounterText:"『この敗北はすでに見た。覆す可能性を、お前は持つか。』",victoryText:"止まった秒針が動き、存在しなかった勝利が現在へ刻まれた。",elementMultipliers:{fire:1,water:1,lightning:.75,earth:.75,light:.25,dark:1.5},statusProfile:{immune:["sleep","paralysis","charm","confusion"],resistant:["fear"],weak:[]},
  basic:active("hourHand","時針","attack",1.8,0,0,"敵単体へ180%。対象のCTを1遅延。",{effects:[{kind:"spdDown",value:.12,turns:2,enemy:true}]}),authorities:[active("acceleration","時間加速","buff",0,22,3,"味方全体のCTを短縮しSPDを上昇。",{target:"味方全体",effects:[{kind:"spdUp",value:.3,turns:3,allies:true}]}),active("stop","時間停止","attack",1.5,34,5,"敵全体を1ターン停止。ボスにはCT+2相当の鈍化。",{allEnemies:true,effects:[{kind:"stun",statusId:"paralysis",chance:.65,turns:1,enemy:true},{kind:"spdDown",value:.35,turns:3,enemy:true}]}),active("rewind","時間逆行","stance",0,38,6,"自身を2ターン前の状態へ近づけ、HP・MPを回復。",{heal:.55,effects:[{kind:"spdUp",value:.25,turns:2}]}),active("eternity","永劫","attack",7,56,8,"敵単体へ700%。2ターン後に同威力の残響が発生。",{repeatDelay:2,defenseIgnore:.2})],
  gearNames:["時神の秒針","時神の歯車","時神の時計","時神の指輪","時神の法衣","時神の核"],gearEffects:["CT短縮。通常攻撃後に低確率で追加行動。","CT増加耐性。SPD上昇。","MP回復。CT短縮量上昇。","偶数ターン会心、奇数ターン回避上昇。","時間停止耐性。行動速度上昇。","時間逆行強化。追加行動率上昇。"],setText:{2:"CT短縮量+1",4:"追加行動率上昇",6:"戦闘不能時、1戦闘1回だけ直前ターンへ逆行"}},

 {id:"ten_space",faction:"tenGod",numeral:"Ⅱ",epithet:"空間",icon:"🌌",speciesId:"ancient_dragon",support:["wyvern","angelic_orb","ancient_dragon"],seriesId:"godAstra",element:"earth",role:"位置・射程無視",title:"距離と境界を統べる第二法則",damageClass:"physical",ai:"前後列・かばう・回避を無視し、最も脆い空間へ直接刃を通す。",passive:"空間超越：すべての攻撃で射程・隊列制限を無視。",awakening:"HP35%以下で覚醒。基本技全体化、全位置を隣接扱い。",lore:"世界と世界の境界を定め、外から侵入するものを退ける門。",encounterText:"『距離は免罪符にならない。境界を越える覚悟を示せ。』",victoryText:"裂け目は一筋の道となり、閉ざされていた境界が開いた。",elementMultipliers:{fire:.75,water:1,lightning:1,earth:.25,light:1,dark:1.5},statusProfile:{immune:["paralysis","petrify"],resistant:[],weak:[]},
  basic:active("sever","裂断","attack",1.7,0,0,"敵単体へ170%。前衛保護を無視。",{guaranteedHit:true}),authorities:[active("spaceRend","空間断裂","attack",4.8,22,3,"後衛を含む敵全体へ480%。DEF無視。",{allEnemies:true,defenseIgnore:.45}),active("transpose","転位","attack",1.6,26,4,"敵全体の前衛・後衛を入れ替え、SPDを低下。",{allEnemies:true,effects:[{kind:"spdDown",value:.25,turns:3,enemy:true}]}),active("void","虚空","attack",6.2,34,5,"敵単体へ必中。回避・ガードを無視。",{guaranteedHit:true,defenseIgnore:.65}),active("worldCut","世界切断","attack",9.5,62,8,"敵全体へ950%。位置・射程・かばうを無視。",{allEnemies:true,guaranteedHit:true,defenseIgnore:.5})],
  gearNames:["空神の刃","空神の断片","空神の首輪","空神の指輪","空神の外套","空神の核"],gearEffects:["後衛ダメージ+30%。防御無視+10%。","射程無視。かばう無視率上昇。","命中+20%。回避を無視。","会心時に位置変更。","位置変更耐性。被ダメージ軽減。","空間断裂威力上昇。世界切断CT短縮。"],setText:{2:"防御無視+15%",4:"常に有利な対象を優先攻撃",6:"かばう・挑発・前衛保護を無効化"}},

 {id:"ten_life",faction:"tenGod",numeral:"Ⅲ",epithet:"生命",icon:"🌿",speciesId:"water_spirit",support:["fairy","healing_mushroom","mandrake"],seriesId:"godLife",element:"light",role:"回復・蘇生",title:"生と循環を統べる第三法則",ai:"最大HP増加・継続回復・蘇生を循環し、戦線を再構築する。",passive:"生命連鎖：回復するたび味方全体へ小回復。",awakening:"味方死亡またはHP30%以下で覚醒。回復2倍、再生強化、追加蘇生1回。",lore:"すべての芽吹きと血流をひとつの循環として守る世界樹の意志。",encounterText:"『生きたいと願うなら、その願いを次の命へ渡しなさい。』",victoryText:"砕けた光から芽が伸び、戦場を静かな緑で満たした。",elementMultipliers:{fire:1.25,water:.25,lightning:1,earth:.5,light:.25,dark:1.5},statusProfile:{immune:["poison","bleed"],resistant:["curse"],weak:[]},
  basic:active("sprout","芽吹き","attack",1.6,0,0,"敵単体へ160%。最もHPの低い味方を小回復。",{selfHeal:.08}),authorities:[active("lifeCycle","生命循環","stance",0,16,2,"自身を50%回復し、戦闘中の最大HPを10%増加。",{heal:.5,effects:[{kind:"regen",value:.1,turns:3}]}),active("worldTree","世界樹","buff",0,28,4,"味方全体へ継続回復と状態耐性。",{target:"味方全体",effects:[{kind:"regen",value:.12,turns:4,allies:true},{kind:"guard",value:.15,turns:3,allies:true}]}),active("rebirth","再誕","revive",0,40,6,"味方1体をHP50%・MP50%で蘇生。",{revive:.5,reviveMp:.5}),active("lifeBlessing","命の祝福","allHeal",0,68,10,"味方全体を完全回復し、最大HPを20%増加。",{heal:1,cleanse:true,effects:[{kind:"guard",value:.2,turns:4,allies:true}]})],
  gearNames:["命樹の杖","命樹の枝","命樹の雫","命樹の指輪","命樹の法衣","命樹の種"],gearEffects:["回復量+25%。継続回復+15%。","シールド量+20%。蘇生後シールド。","最大HP+20%。MP回復量上昇。","回復会心率上昇。回復時MP回復。","被回復量+20%。状態耐性上昇。","蘇生後1ターン無敵。生命循環強化。"],setText:{2:"回復量+20%",4:"回復対象以外も30%回復",6:"戦闘開始時、味方全体の最大HP+15%"}},

 {id:"ten_death",faction:"tenGod",numeral:"Ⅳ",epithet:"死",icon:"☠️",speciesId:"dark_knight",support:["wraith","skeleton_guard","ghost"],seriesId:"godDeath",element:"dark",role:"寿命・処刑",title:"死と寿命を統べる第四法則",damageClass:"physical",ai:"最大HPを削り、処刑印と蘇生封印で回復不能な終端へ導く。",passive:"寿命流出：ラウンド終了ごとに敵の最大HPを戦闘中0.5%低下。",awakening:"戦闘中の死亡累計3で覚醒。印強化、回復阻害100%、基本技が割合攻撃化。",lore:"罰ではなく終点として、すべての生命に等しく訪れる静かな法則。",encounterText:"『終わりは罰ではない。生きた時間を、ここへ返しなさい。』",victoryText:"黄泉の門は閉じ、残された鼓動だけが強く響いた。",elementMultipliers:{fire:1,water:1.25,lightning:1,earth:.75,light:1.5,dark:.25},statusProfile:{immune:["instantDeath","curse"],resistant:["fear"],weak:[]},
  basic:active("lifespan","寿命","attack",1.7,0,0,"敵単体へ170%。戦闘中の最大HPを1%低下。",{currentHpDamage:.01}),authorities:[active("executionMark","処刑印","attack",2.8,16,2,"対象へ印を刻む。HP20%以下を処刑。",{execute:.2,effects:[{kind:"vulnerable",value:.2,turns:4,enemy:true}]}),active("reapLife","寿命刈り","attack",2.4,26,4,"現在HPへの割合ダメージと最大HP5%減少。",{currentHpDamage:.12,defenseIgnore:.25}),active("yomiSeal","黄泉封じ","attack",2,34,5,"敵全体へ蘇生封印・回復量50%低下。",{allEnemies:true,effects:[{kind:"vulnerable",value:.25,turns:4,enemy:true}]}),active("deathArrival","死神の迎え","attack",9,66,9,"敵単体へ900%。処刑印対象へ追加。ボスには割合ダメージ。",{execute:.25,currentHpDamage:.12,defenseIgnore:.45})],
  gearNames:["死神の鎌","黄泉の灯","死神の首飾り","死神の指輪","死神の外套","黄泉の門"],gearEffects:["割合ダメージ+20%。処刑印対象へ威力上昇。","回復阻害成功率上昇。蘇生封印+1ターン。","最大HP減少量上昇。MP回復。","会心時に処刑印付与。","割合ダメージ軽減。状態耐性上昇。","死神の迎え威力上昇。黄泉開門強化。"],setText:{2:"割合ダメージ+15%",4:"処刑印対象への全ダメージ+25%",6:"印を持つ敵へ毎ターン追加割合ダメージ"}},

 {id:"ten_fate",faction:"tenGod",numeral:"Ⅴ",epithet:"運命",icon:"⚡",speciesId:"wyvern",support:["clockwork","angelic_orb","harpy"],seriesId:"godFate",element:"lightning",role:"必中・会心確定",title:"結果を確定する第五法則",ai:"命中と会心を確定し、敵側の回避・ガードという可能性を消す。",passive:"運命補正：味方の最低命中30%、最低会心10%。",awakening:"累計会心10回で覚醒。3ターン全攻撃必中、敵の回避・ガード無効。",lore:"未来を予言するのではなく、無数の未来からひとつを結果として固定する。",encounterText:"『可能性は十分に見た。次の一撃を、結果として選びなさい。』",victoryText:"張り巡らされた糸がほどけ、未来は再び無数へ分かれた。",elementMultipliers:{fire:1,water:1,lightning:.25,earth:1.25,light:.75,dark:1},statusProfile:{immune:["confusion"],resistant:["charm","fear"],weak:[]},
  basic:active("fateLine","運命線","attack",1.8,0,0,"敵単体へ180%。次の攻撃を必中化。",{guaranteedHit:true}),authorities:[active("inevitable","必然","attack",5.5,20,3,"敵単体へ550%。必中・確定会心。",{guaranteedHit:true,guaranteedCritical:true}),active("futureRewrite","未来改変","buff",0,30,5,"味方全体の次の攻撃を必中・会心100%へ。",{target:"味方全体",effects:[{kind:"atkUp",value:.35,turns:2,allies:true},{kind:"spdUp",value:.2,turns:2,allies:true}]}),active("fateDenial","運命否定","attack",2.2,32,5,"敵全体の命中・回避・会心を低下。",{allEnemies:true,effects:[{kind:"atkDown",value:.25,turns:3,enemy:true},{kind:"spdDown",value:.25,turns:3,enemy:true}]}),active("fateFixed","運命確定","attack",8,58,8,"次の結果を固定し、敵単体へ必中・確定会心の800%。",{guaranteedHit:true,guaranteedCritical:true,defenseIgnore:.3})],
  gearNames:["運命の筆","運命の書","運命の糸","運命の指輪","運命の法衣","運命の天秤"],gearEffects:["会心+20%。必中率上昇。","ガード無視率上昇。未来改変+1ターン。","命中+20%。回避+15%。","会心時に追加ダメージ。","被会心率低下。命中率上昇。","未来確定強化。会心ダメージ上昇。"],setText:{2:"命中+15%・会心+10%",4:"会心時、味方全体の会心+5%",6:"1戦闘1回、任意攻撃を必中・確定会心化"}},

 {id:"ten_chaos",faction:"tenGod",numeral:"Ⅵ",epithet:"混沌",icon:"🌀",speciesId:"frost_dragon",support:["mist_jelly","mimic","willowisp"],seriesId:"godChaos",element:"dark",role:"法則変異",title:"規則を組み替える第六法則",ai:"属性と能力対応を変異させるが、勝敗を無作為には決めない。適応力を試す。",passive:"混沌脈動：毎ターン、重複しないランダム強化を1つ得る。",awakening:"HP30%以下で覚醒。全攻撃属性が変化し、基本技全体化。",lore:"秩序が生まれる前の揺らぎ。破壊ではなく、規則が未確定な状態そのもの。",encounterText:"『正解がひとつだと、誰が決めた？　変化に耐えてみせろ。』",victoryText:"色のない渦がほどけ、世界はひとつの規則を選び直した。",elementMultipliers:{fire:1,water:1,lightning:1,earth:1,light:1,dark:1},statusProfile:{immune:[],resistant:["confusion"],weak:[],variable:true},
  basic:active("collapse","崩壊","attack",1.8,0,0,"敵単体へ180%。攻撃属性が毎回変化。",{randomElement:true}),authorities:[active("chaoticize","混沌化","attack",1.8,20,3,"敵全体の強化・弱体を別効果へ変換。",{allEnemies:true,effects:[{kind:"atkDown",value:.2,turns:3,enemy:true}]}),active("worldReverse","世界反転","attack",2.6,30,5,"敵全体の攻撃と防御の均衡を反転。",{allEnemies:true,effects:[{kind:"atkDown",value:.3,turns:3,enemy:true},{kind:"defDown",value:.3,turns:3,enemy:true}]}),active("resistCollapse","耐性崩壊","attack",3.4,38,6,"敵全体の属性耐性をランダムに崩す。",{allEnemies:true,effects:[{kind:"vulnerable",value:.3,turns:3,enemy:true}]}),active("chaosWorld","混沌世界","attack",6.2,70,10,"5ターン属性相性を中和し、命中・回避・強化量を再編。",{allEnemies:true,randomElement:true,effects:[{kind:"spdDown",value:.25,turns:5,enemy:true}]})],
  gearNames:["混沌の断片","混沌の外殻","混沌の首飾り","混沌の指輪","混沌の衣","混沌の核"],gearEffects:["通常攻撃時、低確率で属性変更。","被弾時にランダム強化。","属性耐性が毎ターン変化。","会心時にランダム弱体付与。","受ける属性ダメージをランダム軽減。","世界反転強化。混沌世界+1ターン。"],setText:{2:"ランダム強化の効果量上昇",4:"属性変化時にHP回復",6:"開戦時に敵味方へ属性付与、自身は相性不利無効"}},

 {id:"ten_dominion",faction:"tenGod",numeral:"Ⅶ",epithet:"支配",icon:"♛",speciesId:"goblin_shaman",support:["dark_knight","clockwork","gargoyle"],seriesId:"godDominion",element:"dark",role:"AI・標的制御",title:"命令を上書きする第七法則",ai:"思考と優先順位を書き換え、攻撃対象・防御役・行動順を崩す。",passive:"王命干渉：低確率で敵の次行動を後ろへ送る。",awakening:"HP30%以下または支配2回成功で覚醒。成功率上昇、基本技全体化、究極CT短縮。",lore:"心を奪うのではなく、命令体系そのものへ新しい最優先規則を書き込む。",encounterText:"『意思は残しておけ。従うべき命令だけを、私が決める。』",victoryText:"王命の文字列が砕け、自分で選ぶ権利が戦場へ戻った。",elementMultipliers:{fire:1,water:.75,lightning:1.25,earth:1,light:1.5,dark:.25},statusProfile:{immune:["charm","confusion"],resistant:["fear"],weak:[]},
  basic:active("order","命令","attack",1.7,0,0,"敵単体へ170%。低確率で次の標的を乱す。",{status:{id:"confusion",name:"命令上書き",chance:.2,turns:1}}),authorities:[active("dominionOrder","支配命令","attack",2.2,20,3,"敵単体を2ターン誤作動。ボスにはATK・MATK・命中低下。",{status:{id:"confusion",name:"支配",chance:.6,turns:2},effects:[{kind:"atkDown",value:.3,turns:3,enemy:true}]}),active("royalDecree","王命","attack",1.8,28,4,"敵全体の優先順位を変更し、挑発・かばうを無効化。",{allEnemies:true,effects:[{kind:"spdDown",value:.25,turns:3,enemy:true}]}),active("subordination","従属","attack",3.8,34,5,"敵単体へ380%。対象の強化50%を複製。",{drain:.18,selfAtk:.2}),active("absoluteDominion","絶対支配","attack",4.8,68,10,"敵全体を2ターン非効率AIへ。ボスには大幅弱体。",{allEnemies:true,status:{id:"confusion",name:"絶対支配",chance:.55,turns:2},effects:[{kind:"atkDown",value:.4,turns:3,enemy:true},{kind:"spdDown",value:.35,turns:3,enemy:true}]})],
  gearNames:["支配の王笏","支配の王印","支配の首飾り","支配の指輪","支配の軍服","支配の王冠"],gearEffects:["支配成功率+20%。命令対象へのダメージ+15%。","挑発・かばう無効率上昇。命令+1ターン。","命中+20%。支配耐性10%無視。","敵の行動失敗ごとに会心上昇。","被弾時、低確率で命令付与。","絶対支配CT-1。支配成功時シールド。"],setText:{2:"支配・命令成功率+20%",4:"支配敵からの被ダメージ-20%",6:"支配敵のAI優先順位を完全上書き"}},

 {id:"ten_creation",faction:"tenGod",numeral:"Ⅷ",epithet:"創造",icon:"✨",speciesId:"angelic_orb",support:["fairy","stone_golem","water_spirit"],seriesId:"godCreation",element:"light",role:"盾・創具",title:"形と守りを生む第八法則",ai:"シールドを再生し、戦況に必要な能力を一時創造して味方へ配る。",passive:"再創造：シールド破壊時、耐久20%で一度再生成。",awakening:"シールド破壊5回で覚醒。シールド量2倍、基本技が全体回復化。",lore:"無から世界を作る力ではなく、存在へ役割と形を与える設計の法則。",encounterText:"『壊す力は見た。次は、守る形を生み出してみせなさい。』",victoryText:"砕けた光片が盾となり、挑戦者たちの背後へ静かに浮かんだ。",elementMultipliers:{fire:1,water:.75,lightning:1,earth:.5,light:.25,dark:1.5},statusProfile:{immune:["poison"],resistant:["curse"],weak:[]},
  basic:active("creationLight","創光","attack",1.7,0,0,"敵単体へ170%。最もHPの低い味方を小回復。",{selfHeal:.08}),authorities:[active("genesis","創世","buff",0,20,3,"3ターン、状況に応じATK・DEF・MATKのひとつを大強化。",{effects:[{kind:"atkUp",value:.35,turns:3},{kind:"defUp",value:.35,turns:3}]}),active("divineWall","神壁","buff",0,28,4,"味方全体へ大シールド。",{target:"味方全体",effects:[{kind:"guard",value:.4,turns:3,allies:true}]}),active("createWorld","創界","buff",0,34,5,"味方全体のATK・DEF・状態耐性を上昇。",{target:"味方全体",effects:[{kind:"atkUp",value:.25,turns:4,allies:true},{kind:"defUp",value:.25,turns:4,allies:true}]}),active("creationDomain","創造神域","allHeal",0,68,10,"味方全体を60%回復、シールド付与、状態異常解除。",{heal:.6,cleanse:true,effects:[{kind:"guard",value:.45,turns:3,allies:true}]})],
  gearNames:["創造の筆","創造の盾","創造の雫","創造の指輪","創造の法衣","創造の核"],gearEffects:["シールド生成量+20%。創世強化。","シールド耐久+25%。被ダメージ軽減。","回復量+20%。MP回復。","味方シールド中に会心上昇。","味方全体の被ダメージ軽減。","創造神域CT短縮。盾破壊時に追加生成。"],setText:{2:"シールド量+20%",4:"シールド付与時、状態異常を1回無効",6:"開戦時、味方全体へ最大HP20%シールド"}},

 {id:"ten_end",faction:"tenGod",numeral:"Ⅸ",epithet:"終焉",icon:"☀️",speciesId:"salamander",support:["ember_slime","salamander","willowisp"],seriesId:"godEnd",element:"fire",role:"炎上・終焉カウント",title:"時間経過を崩壊へ収束する第九法則",ai:"炎上と終焉印を全体へ広げ、長期戦ほど受けるダメージを増幅する。",passive:"終焉カウント：開戦時開始。ラウンドごとに敵被ダメージ+2%（上限あり）。",awakening:"20ターン経過または敵全員に印で覚醒。基本技全体化、炎上・割合ダメージ強化。",lore:"世界に寿命を与え、循環が止まった文明を灰へ戻す最後の熱。",encounterText:"『続きすぎた世界は腐る。灰から次を始める覚悟はあるか。』",victoryText:"世界を覆った炎は一粒の種火となり、新しい時代へ受け継がれた。",elementMultipliers:{fire:.25,water:1.5,lightning:1,earth:.75,light:1,dark:1},statusProfile:{immune:["burn"],resistant:["fear"],weak:[]},
  basic:active("ash","灰化","attack",1.9,0,0,"敵単体へ190%。炎上付与。",{status:{id:"burn",name:"炎上",chance:.55,turns:3,power:.04}}),authorities:[active("worldBurn","世界炎上","attack",2.4,22,3,"敵全体へ240%。炎上付与。",{allEnemies:true,status:{id:"burn",name:"世界炎上",chance:.7,turns:4,power:.05}}),active("collapseEnd","崩壊","attack",2.8,32,5,"敵全体へ現在HP割合ダメージ。炎上中は追加。",{allEnemies:true,currentHpDamage:.1}),active("ashMark","灰の刻印","attack",2.4,34,5,"敵全体へ終焉印。ターン経過で被ダメージ上昇。",{allEnemies:true,effects:[{kind:"vulnerable",value:.25,turns:5,enemy:true}]}),active("lastJudge","ラストジャッジ","attack",15,78,10,"敵全体へ1500%。終焉カウントに応じ威力上昇。",{allEnemies:true,defenseIgnore:.3})],
  gearNames:["終焉の大剣","終焉の炎","終焉の灰","終焉の指輪","終焉の外套","終焉の核"],gearEffects:["炎上ダメージ+30%。割合ダメージ+15%。","炎上付与率+20%。継続ダメージ上昇。","敵全体被ダメージ+5%。火属性強化。","炎上敵への会心・会心ダメージ上昇。","炎上耐性を無視。被ダメージ軽減。","終焉カウント強化。ラストジャッジCT-1。"],setText:{2:"炎上ダメージ+25%",4:"炎上敵への与ダメージ+20%",6:"開戦時に全敵へ成長する終焉カウント"}},

 {id:"ten_divinity",faction:"tenGod",numeral:"Ⅹ",epithet:"神格",icon:"Ⅹ",speciesId:"ancient_dragon",support:["angelic_orb","clockwork","dark_knight"],seriesId:"godDivinity",element:"light",role:"適応型万能",title:"十の法則を均衡させる最終神格",ai:"不足役割を毎ターン解析し、攻撃・防御・回復・解除を切り替える。専門家を上回らない。",passive:"均衡：毎ターン、味方側で最も不足する能力を自動補助。",awakening:"HP20%以下または味方2体死亡で覚醒。技強化、2回行動、適応高速化。",lore:"十神の頂点ではなく、十の法則が衝突せず世界を保つための均衡点。",encounterText:"『完成とは万能ではない。欠けたものを知り、補い続けることだ。』",victoryText:"光と闇は相殺せず、ひとつの均衡として挑戦者の周囲を巡った。",elementMultipliers:{fire:.5,water:.5,lightning:.5,earth:.5,light:.25,dark:.25},statusProfile:{immune:[],resistant:["poison","bleed","burn","curse","sleep","paralysis","freeze","charm","confusion","fear"],weak:[]},
  basic:active("divinePunish","神罰","attack",2.2,0,0,"敵単体へ220%。強化を1つ解除。",{defenseIgnore:.15}),authorities:[active("sanctuary","神域","buff",0,28,4,"味方全体のATK・DEF・MATK・MDEFを上げ、シールド付与。",{target:"味方全体",effects:[{kind:"atkUp",value:.25,turns:3,allies:true},{kind:"defUp",value:.25,turns:3,allies:true},{kind:"guard",value:.2,turns:3,allies:true}]}),active("divineJudgment","神罰・全界","attack",6.5,38,5,"敵全体へ650%。強化を解除。",{allEnemies:true,defenseIgnore:.25}),active("genesisRevive","創世","allHeal",0,48,7,"味方全体を45%回復し、戦闘不能1体を蘇生。",{heal:.45,revive:.35}),active("divineDescent","神格降臨","buff",0,76,10,"生存中の味方全体を神格へ適応させ、全能力と行動速度を大幅強化。",{target:"味方全体",allAllies:true,effects:[{kind:"atkUp",value:.45,turns:4,allies:true},{kind:"defUp",value:.45,turns:4,allies:true},{kind:"spdUp",value:.35,turns:4,allies:true},{kind:"regen",value:.12,turns:4,allies:true}]})],
  gearNames:["神格の光","神格の輪","神格の証","神格の指輪","神格の衣","神格の核"],gearEffects:["適応速度上昇。通常攻撃強化。","シールド生成。被ダメージ軽減。","全能力+10%。MP回復。","会心・命中・回避が微上昇。","状態耐性・HP回復量上昇。","均衡強化。神格降臨CT短縮。"],setText:{2:"全能力+5%",4:"毎ターン、不足能力を自動強化",6:"開戦解析後、毎ターン最適役割へ適応"}}
];

// 種族の基礎値まで含めて七柱の戦闘役割が明確に出るようにする。
// ID・種族・旧セーブ上の個体情報は変えず、深淵固有の補正だけを上書きする。
const ABYSS_PROFILE_REFINEMENTS=Object.freeze({
 abyss_gluttony:{
  statProfile:{hp:1.9,atk:1.15,matk:.65,def:2.2,mdef:2.4,spd:.78,crit:2,evasion:0,accuracy:8},
  passive:"飢界肉体：七柱最大級のHPと両防御を持つ吸命要塞。代わりにSPDは低い。"
 },
 abyss_wrath:{
  statProfile:{hp:1.05,atk:2,matk:.6,def:.75,mdef:.65,spd:1.2,crit:18,evasion:2,accuracy:10},
  passive:"血焔肉体：七柱最高の物理ATKと高い会心を持つ。代わりに両防御を犠牲にする。"
 },
 abyss_envy:{
  statProfile:{hp:1.1,atk:1.3,matk:1.8,def:.9,mdef:1.1,spd:1.9,crit:10,evasion:18,accuracy:20},
  passive:"鏡像肉体：物理／魔法を同水準で扱う高速・高回避型。耐久は控えめ。"
 },
 abyss_sloth:{
  statProfile:{hp:1.45,atk:.9,matk:2.3,def:1.6,mdef:1.9,spd:.65,crit:0,evasion:4,accuracy:6},
  passive:"停界肉体：七柱最高の物理／魔法DEFを持つ低速制圧型。行動速度は最低。"
 },
 abyss_greed:{
  statProfile:{hp:2.5,atk:1.3,matk:2.4,def:2.2,mdef:2.8,spd:.85,crit:8,evasion:6,accuracy:12},
  passive:"黄金肉体：高い魔法ATKとMP、平均以上の魔法DEFを持ち、奪った優位を味方へ再分配する。"
 },
 abyss_lust:{
  statProfile:{hp:1.7,atk:.7,matk:2.7,def:1.6,mdef:2.8,spd:.95,crit:8,evasion:20,accuracy:16},
  passive:"心界肉体：七柱最高の魔法ATKとSPDを持つ高速支援型。物理攻撃には弱い。"
 },
 abyss_pride:{
  statProfile:{hp:.85,atk:.8,matk:.55,def:1.35,mdef:1.6,spd:2.8,crit:12,evasion:8,accuracy:18},
  passive:"王威肉体：HP・物理ATK・両防御を高水準で併せ持つ万能前衛。単独の特化値では各専門柱を越えない。"
 }
});

// 十神I〜Vは単純な上位互換ではなく、五つの法則を別々の戦術として成立させる。
// 旧セーブが参照するキャラクターID・種族ID・スキルkeyは維持したまま、
// 固有能力、全25技、専用武器5種と装備限定技だけを正本上で精密化する。
const TEN_FIRST_PROFILE_REFINEMENTS=Object.freeze({
 ten_time:{
  role:"高速CT支配・時相回復",title:"行動回数と再使用時間を統べる第一法則",damageClass:"magic",
  ai:"敵に再使用待ちがある時は遅延、味方の再使用待ちが重い時は加速、損耗時は逆行を選び、手数差を勝敗へ変える。",
  passive:"時相演算：高い魔法ATKとSPDで先行し、味方のCTを縮めながら敵のCTを延ばす。物理火力は低い。",
  awakening:"専用武器『零刻杖・クロノレクサ』装備中、味方全体の時を零刻へ戻す『零刻再演』を習得。",
  statProfile:{hp:1.6,atk:.75,matk:2.4,def:1.4,mdef:1.65,spd:1.8,crit:8,evasion:14,accuracy:18},
  basic:active("hourHand","遅刻の時針","attack",1.9,0,0,"敵単体へ190%。SPDを15%低下し、固有技の再使用を1ターン遅延。",{increaseEnemyCooldowns:1,increaseAllyCooldowns:1,effects:[{kind:"spdDown",value:.15,turns:2,enemy:true}]}),
  authorities:[
   active("acceleration","時間加速・先刻","buff",0,26,3,"味方全体のSPDを35%・命中を15%上げ、発動中のCTを1短縮。",{target:"味方全体",reducePartyCooldowns:1,effects:[{kind:"spdUp",value:.35,turns:3,allies:true},{kind:"accuracyUp",value:.15,turns:3,allies:true}]}),
   active("stop","時間停止・凍秒界","attack",1.6,40,5,"敵全体へ160%。50%で行動不能、SPDを40%低下し、固有技の再使用を1ターン遅延。",{allEnemies:true,increaseEnemyCooldowns:1,increaseAllyCooldowns:1,effects:[{kind:"stun",statusId:"paralysis",chance:.5,turns:1,enemy:true},{kind:"spdDown",value:.4,turns:3,enemy:true}]}),
   active("rewind","時間逆行・生環","allHeal",0,48,6,"味方全体を38%回復・浄化し、再生を付与。発動中のCTを1短縮。",{heal:.38,cleanse:true,reducePartyCooldowns:1,effects:[{kind:"regen",value:.08,turns:3,allies:true}]}),
   active("eternity","永劫・無限秒針","attack",6.4,74,9,"敵全体へ640%の必中魔法。現在HP8%を追加で削り、SPDを45%低下、固有技の再使用を2ターン遅延。",{allEnemies:true,guaranteedHit:true,currentHpDamage:.08,defenseIgnore:.3,increaseEnemyCooldowns:2,increaseAllyCooldowns:2,effects:[{kind:"spdDown",value:.45,turns:3,enemy:true}]})
  ],
  signatureWeapon:{name:"零刻杖・クロノレクサ",description:"存在するすべての再使用時間を零刻へ巻き戻す、第一法則の時環杖。",stats:{matk:330,spd:82,mp:100,mdef:90,accuracy:18},fixedEffects:{skillPower:22,mpCostReduction:14,freeSkillChance:10},resonance:{damageMultiplier:1.07,damageReductionRate:.06},skill:active("zeroHourReplay","零刻再演","buff",0,0,11,"味方全体の発動中CTをすべて解消し、SPD+50%・命中+30%・必中を2ターン付与。",{mpRate:.58,target:"味方全体",reducePartyCooldowns:99,effects:[{kind:"spdUp",value:.5,turns:2,allies:true},{kind:"accuracyUp",value:.3,turns:2,allies:true},{kind:"guaranteedHit",value:1,turns:2,allies:true}],tag:"固有武器技"})},
  gearNames:["零刻杖・クロノレクサ","逆刻歯車","因果時計","先刻指輪","時相法衣","永劫振子"],
  gearEffects:["スキル威力+22%・MP消費-14%・固有武器技『零刻再演』。","敵のCT延長と停止命中を安定させる逆回転歯車。","味方CT短縮時のMP循環を支える因果時計。","SPDと命中を高め、先手支配を補強する指輪。","時間停止・速度低下への耐性を持つ法衣。","時間逆行の回復量と永劫の威力を高める振子。"],setText:{2:"SPD+12%・命中+10%",4:"CT短縮技の回復量+20%",6:"戦闘開始時、味方全体の発動中CTを1短縮"}
 },
 ten_space:{
  role:"境界破壊・障壁前衛",title:"距離・防御・陣地を切断する第二法則",damageClass:"physical",
  ai:"味方が損耗する前に転位結界を張り、敵の魔法陣が現れれば虚空で破壊、強化中の集団へ世界切断を優先する。",
  passive:"界殻巨体：五神最大のHPと物理ATKを持ち、必中・防御無視で境界を越える。代わりにSPDと魔法ATKは低い。",
  awakening:"専用武器『界断剣・アストラ』装備中、敵単体の存在座標を直接断つ『存在座標消去』を習得。",
  statProfile:{hp:1.1,atk:1.3,matk:.55,def:1.25,mdef:1.4,spd:1.4,crit:12,evasion:4,accuracy:20},
  basic:active("sever","境界裂断","attack",2,0,0,"敵単体へ200%の必中斬撃。物理DEFを20%無視。",{guaranteedHit:true,defenseIgnore:.2}),
  authorities:[
   active("spaceRend","空間断裂・多界","attack",3.8,28,3,"敵全体へ380%の必中斬撃。物理DEFを35%無視。",{allEnemies:true,guaranteedHit:true,defenseIgnore:.35}),
   active("transpose","転位結界","buff",0,34,4,"味方全体の回避を30%上げ、被ダメージ20%軽減と最大HP15%障壁を付与。",{target:"味方全体",partyShieldRate:.15,effects:[{kind:"evasionUp",value:.3,turns:3,allies:true},{kind:"guard",value:.2,turns:3,allies:true}]}),
   active("void","虚空・陣界消失","attack",7,48,6,"敵単体へ700%の必中斬撃。物理DEF65%無視・現在HP10%追加・敵側魔法陣を1つ破壊。",{guaranteedHit:true,defenseIgnore:.65,currentHpDamage:.1,removeEnemyMagicCircle:true,breakAllyMagicCircle:true}),
   active("worldCut","世界切断・万境離断","attack",8.5,78,9,"敵全体へ850%の必中斬撃。物理DEF55%を無視し、強化を1つ解除。",{allEnemies:true,guaranteedHit:true,defenseIgnore:.55,dispelEnemyBuff:true,dispelOne:true})
  ],
  signatureWeapon:{name:"界断剣・アストラ",description:"防具ではなく対象が存在する座標そのものを切断する、第二法則の巨剣。",stats:{hp:560,atk:360,def:150,mdef:110,accuracy:24},fixedEffects:{bossDamage:25,skillPower:20,accuracy:18},resonance:{damageMultiplier:1.11,damageReductionRate:.09},skill:active("coordinateErase","存在座標消去","attack",10.5,0,11,"敵単体へ1050%の必中斬撃。物理DEF80%を無視し、現在HP15%を追加で削る。",{mpRate:.58,guaranteedHit:true,defenseIgnore:.8,currentHpDamage:.15,tag:"固有武器技"})},
  gearNames:["界断剣・アストラ","転位副刃","星間首輪","境界指輪","虚空外套","世界座標核"],
  gearEffects:["ボス与ダメージ+25%・スキル威力+20%・固有武器技『存在座標消去』。","かばうと隊列を越えて攻撃座標を固定する副刃。","HPと物理DEFを高める星間首輪。","必中攻撃の会心と防御無視を補う指輪。","味方障壁と魔法DEFを補強する虚空外套。","虚空・世界切断のMP循環を支える座標核。"],setText:{2:"防御無視+15%",4:"最大HP+12%・物理ATK+10%",6:"必中攻撃の最終与ダメージ+20%"}
 },
 ten_life:{
  role:"分命蘇生・全体再生",title:"生命を分かち、戦線を再構築する第三法則",damageClass:"magic",
  ai:"戦闘不能者がいれば分命蘇生、複数が負傷すれば命の祝福、平時は世界樹の再生と障壁を維持する。",
  passive:"世界樹心：高い魔法ATK・魔法DEFと回復性能を持つ。蘇生は必ず自分の現在HP50%と大きなMPを分け与える。",
  awakening:"専用武器『世界樹杖・アニマムンディ』装備中、全員の命脈を接続する『命脈大循環』を習得。",
  statProfile:{hp:3,atk:.6,matk:3,def:2.8,mdef:3,spd:.85,crit:3,evasion:12,accuracy:15},
  basic:active("sprout","命芽の光","attack",1.6,0,0,"敵単体へ160%の魔法攻撃。命中後、自分を最大HP10%回復。",{selfHeal:.1}),
  authorities:[
   active("lifeCycle","生命循環・樹心","stance",0,28,3,"自分を52%回復・浄化し、3ターン再生12%・被ダメージ18%軽減。",{heal:.52,cleanse:true,effects:[{kind:"regen",value:.12,turns:3},{kind:"guard",value:.18,turns:3}]}),
   active("worldTree","世界樹・万葉障壁","buff",0,42,5,"味方全体へ再生12%・DEF25%・18%軽減と最大HP14%障壁を付与。",{target:"味方全体",partyShieldRate:.14,effects:[{kind:"regen",value:.12,turns:4,allies:true},{kind:"defUp",value:.25,turns:4,allies:true},{kind:"guard",value:.18,turns:3,allies:true}]}),
   active("rebirth","再誕・分命の芽","revive",0,58,7,"自分の現在HP50%を分け与えて味方1体を蘇生。蘇生者はMP25%・再生・軽減を得る。",{revive:.01,reviveTransferRate:.5,reviveMp:.25,revivedEffects:[{kind:"regen",value:.1,turns:3},{kind:"guard",value:.25,turns:2}]}),
   active("lifeBlessing","命の祝福・万命帰樹","allHeal",0,86,10,"味方全体を70%回復・浄化し、戦闘不能1体へ自分の現在HP50%を分けて蘇生。",{heal:.7,cleanse:true,revive:.01,reviveTransferRate:.5,reviveMp:.3,partyShieldRate:.18,revivedEffects:[{kind:"regen",value:.12,turns:4},{kind:"guard",value:.3,turns:2}]})
  ],
  signatureWeapon:{name:"世界樹杖・アニマムンディ",description:"味方全員の鼓動をひとつの大樹へ接続し、枯れた枝へ命を戻す第三法則の杖。",stats:{hp:720,matk:350,mdef:180,mp:130,heal:38},fixedEffects:{healPower:35,mpCostReduction:12,regen:5},resonance:{damageMultiplier:1.04,damageReductionRate:.1},skill:active("greatLifeCycle","命脈大循環","allHeal",0,0,12,"味方全体を100%回復・浄化し、戦闘不能1体へ自分の現在HP50%を分与。25%障壁を展開。",{mpRate:.62,heal:1,cleanse:true,revive:.01,reviveTransferRate:.5,reviveMp:.4,partyShieldRate:.25,revivedEffects:[{kind:"regen",value:.15,turns:4},{kind:"guard",value:.35,turns:3}],tag:"固有武器技"})},
  gearNames:["世界樹杖・アニマムンディ","双生枝","生命雫","輪廻指輪","万葉法衣","原初種子"],
  gearEffects:["回復量+35%・MP消費-12%・固有武器技『命脈大循環』。","蘇生時に分けた生命を障壁へ変える双生枝。","最大HP・MPと被回復量を高める生命雫。","継続回復と蘇生後のMP循環を守る指輪。","物理／魔法DEFと状態耐性を補う万葉法衣。","命の祝福と再誕の再使用を支える原初種子。"],setText:{2:"回復量+20%",4:"味方全体の再生量+25%",6:"蘇生者へ2ターン被ダメージ30%軽減"}
 },
 ten_death:{
  role:"回復封殺・不可逆処刑",title:"回復と蘇生を閉ざして終点を刻む第四法則",damageClass:"physical",
  ai:"回復役がいる相手へ黄泉封じを先行し、低HPへ処刑印、割合攻撃で閾値へ落として死神の迎えを狙う。",
  passive:"終命骸：高い物理ATKと処刑性能を持ち、回復量低下と蘇生封印で損耗を不可逆化する。魔法ATKは低い。",
  awakening:"専用武器『終命鎌・モルティス』装備中、敵全体へ不可逆の終端を刻む『不可逆終端』を習得。",
  statProfile:{hp:1.25,atk:2.3,matk:.5,def:1.1,mdef:1.1,spd:1.2,crit:20,evasion:5,accuracy:18},
  basic:active("lifespan","寿命流出","attack",1.9,0,0,"敵単体へ190%。現在HP2%を追加で削り、2ターン回復量を20%低下。",{currentHpDamage:.02,effects:[{kind:"healDown",value:.2,chance:1,turns:2,enemy:true}]}),
  authorities:[
   active("executionMark","処刑印・首級指定","attack",3,24,3,"敵単体へ300%。HP25%以下で威力2倍、被ダメージ+25%・蘇生封印2ターン。",{execute:.25,effects:[{kind:"vulnerable",value:.25,turns:3,enemy:true},{kind:"reviveSeal",value:1,chance:1,turns:2,enemy:true}]}),
   active("reapLife","寿命刈り・黒穂","drain",3.2,34,4,"敵単体へ320%。物理DEF30%無視・現在HP15%追加・与ダメージ25%吸収。",{currentHpDamage:.15,defenseIgnore:.3,drain:.25}),
   active("yomiSeal","黄泉封じ・無帰門","attack",2.2,48,6,"敵全体へ220%。回復量60%低下・蘇生封印3ターン、敵側魔法陣を1つ破壊。",{allEnemies:true,removeEnemyMagicCircle:true,breakAllyMagicCircle:true,effects:[{kind:"healDown",value:.6,chance:1,turns:3,enemy:true},{kind:"reviveSeal",value:1,chance:1,turns:3,enemy:true}]}),
   active("deathArrival","死神の迎え・終命","attack",9.2,78,9,"敵単体へ920%の必中処刑。物理DEF50%無視・現在HP15%追加、HP35%以下で威力2倍。",{guaranteedHit:true,execute:.35,currentHpDamage:.15,defenseIgnore:.5})
  ],
  signatureWeapon:{name:"終命鎌・モルティス",description:"切られた命を回復や蘇生で戻せない終端へ固定する、第四法則の大鎌。",stats:{atk:390,crit:28,spd:42,accuracy:20},fixedEffects:{bossDamage:24,critDamage:55,lowHpDamage:25},resonance:{damageMultiplier:1.12,critBonus:.08},skill:active("irreversibleEnd","不可逆終端","attack",6.4,0,11,"敵全体へ640%の必中処刑。HP30%以下で威力2倍、回復量90%低下・蘇生封印3ターン。",{mpRate:.6,allEnemies:true,guaranteedHit:true,execute:.3,currentHpDamage:.08,defenseIgnore:.45,effects:[{kind:"healDown",value:.9,chance:1,turns:3,enemy:true},{kind:"reviveSeal",value:1,chance:1,turns:3,enemy:true}],tag:"固有武器技"})},
  gearNames:["終命鎌・モルティス","黄泉灯刃","余命首飾り","処刑指輪","不可逆外套","無帰門鍵"],
  gearEffects:["ボス与ダメージ+24%・会心ダメージ+55%・固有武器技『不可逆終端』。","回復阻害と蘇生封印の命中を高める副刃。","割合攻撃と最大HPを補う余命首飾り。","処刑閾値での会心と命中を保証する指輪。","光耐性と状態耐性を補う不可逆外套。","黄泉封じと死神の迎えのMP循環を守る門鍵。"],setText:{2:"処刑対象への与ダメージ+15%",4:"割合攻撃+5%・命中+12%",6:"回復阻害中の敵へ会心ダメージ+35%"}
 },
 ten_fate:{
  role:"必中会心・結果確定",title:"可能性を一つの勝利結果へ固定する第五法則",damageClass:"physical",
  ai:"味方の確定効果が切れれば未来改変、敵の強化・魔法陣には運命否定、瀕死者には運命確定を優先する。",
  passive:"因果眼：五神最高のSPD・会心・命中を持ち、回避や偶然に左右されない一撃を作る。耐久は控えめ。",
  awakening:"専用武器『因果筆・モイライ』装備中、味方全体の次なる結果を一つへ束ねる『唯一未来』を習得。",
  statProfile:{hp:.85,atk:1.6,matk:.8,def:.8,mdef:.9,spd:2.4,crit:30,evasion:22,accuracy:50},
  basic:active("fateLine","運命線・必中縫い","attack",2.1,0,0,"敵単体へ210%の必中攻撃。会心率+25%。",{guaranteedHit:true,critBonus:.25}),
  authorities:[
   active("inevitable","必然・一点収束","attack",4.8,30,3,"敵単体へ480%。必中・確定会心、物理DEF20%無視。",{guaranteedHit:true,guaranteedCritical:true,defenseIgnore:.2}),
   active("futureRewrite","未来改変・勝機固定","buff",0,42,5,"味方全体へATK+30%・SPD+25%・命中+30%、必中・確定会心を2ターン付与。",{target:"味方全体",effects:[{kind:"atkUp",value:.3,turns:2,allies:true},{kind:"spdUp",value:.25,turns:2,allies:true},{kind:"accuracyUp",value:.3,turns:2,allies:true},{kind:"guaranteedHit",value:1,turns:2,allies:true},{kind:"guaranteedCritical",value:1,turns:2,allies:true}]}),
   active("fateDenial","運命否定・可能性剥離","attack",2.5,46,6,"敵全体へ250%。命中・回避を35%低下し、強化と敵側魔法陣を1つずつ消す。",{allEnemies:true,dispelEnemyBuff:true,dispelOne:true,removeEnemyMagicCircle:true,breakAllyMagicCircle:true,effects:[{kind:"accuracyDown",value:.35,turns:3,enemy:true},{kind:"evasionDown",value:.35,turns:3,enemy:true}]}),
   active("fateFixed","運命確定・唯一終点","attack",10,80,9,"敵単体へ1000%。必中・確定会心、物理DEF40%無視、HP25%以下を処刑。",{guaranteedHit:true,guaranteedCritical:true,defenseIgnore:.4,execute:.25})
  ],
  signatureWeapon:{name:"因果筆・モイライ",description:"無数の未来線を消し、味方全員の攻撃を唯一の命中結果へ記述する第五法則の神筆。",stats:{atk:345,spd:92,crit:30,accuracy:35,evasion:18},fixedEffects:{critRate:20,critDamage:50,accuracy:25},resonance:{damageMultiplier:1.09,critBonus:.12},skill:active("onlyFuture","唯一未来","buff",0,0,10,"味方全体へATK+35%と必中・確定会心を2ターン付与し、発動中CTを1短縮。",{mpRate:.56,target:"味方全体",reducePartyCooldowns:1,effects:[{kind:"atkUp",value:.35,turns:2,allies:true},{kind:"guaranteedHit",value:1,turns:2,allies:true},{kind:"guaranteedCritical",value:1,turns:2,allies:true}],tag:"固有武器技"})},
  gearNames:["因果筆・モイライ","余白の書","三相運命糸","確定指輪","選定法衣","因果天秤"],
  gearEffects:["会心率+20%・会心ダメージ+50%・固有武器技『唯一未来』。","敵の強化と魔法陣を消す可能性を書き留める書。","命中・回避・SPDを同時に高める三相糸。","確定会心時の物理DEF無視を補う指輪。","被会心と状態異常への耐性を持つ法衣。","未来改変と運命確定のMP循環を整える天秤。"],setText:{2:"命中+18%・会心+12%",4:"必中攻撃の会心ダメージ+25%",6:"戦闘開始時、味方全体へ1ターン必中"}
 }
});

// 十神VI〜Xも種族基礎値の偶然へ任せず、後半五法則を別々の戦術へ仕上げる。
// 既存キャラクターID・種族ID・全25スキルkeyは維持し、旧セーブの習得履歴を引き継ぐ。
const TEN_LAST_PROFILE_REFINEMENTS=Object.freeze({
 ten_chaos:{
  role:"属性変異・強化反転",title:"属性と能力対応を組み替える第六法則",damageClass:"hybrid",
  ai:"敵の強化には混沌化、魔法陣には耐性崩壊、長期戦では世界反転で魔力を物理へ換え、状況を意図的に揺らす。",
  passive:"無相竜核：物理／魔法ATKを高水準で併せ持ち、発動ごとに属性を変える。耐久は高いが行動速度は控えめ。",
  awakening:"専用武器『原初渦刃・アペイロン』装備中、強化・魔法陣・属性相性を同時に崩す『無定義世界』を習得。",
  statProfile:{hp:.95,atk:1.25,matk:1.25,def:1.15,mdef:1.25,spd:2.8,crit:12,evasion:14,accuracy:22},
  basic:active("collapse","無相崩壊","attack",2.2,0,0,"敵単体へ220%。発動ごとに属性が変化する物理・魔法複合攻撃。",{damageClass:"hybrid",randomElement:true}),
  authorities:[
   active("chaoticize","混沌化・加護反転","attack",2,30,3,"敵全体へ200%。強化を1つ80%相当の弱体へ反転し、命中・回避を18%低下。",{damageClass:"hybrid",allEnemies:true,randomElement:true,invertEnemyBuffRate:.8,invertOneBuff:true,invertRate:.8,effects:[{kind:"accuracyDown",value:.18,turns:3,enemy:true},{kind:"evasionDown",value:.18,turns:3,enemy:true}]}),
   active("worldReverse","世界反転・魔零換力","stance",0,38,5,"3ターン魔法ATKを0にし、その100%を物理ATKへ加算。ATK・回避を上げる代わりにSPDを20%失う。",{effects:[{kind:"magicToPhysical",value:1,turns:3},{kind:"atkUp",value:.35,turns:3},{kind:"evasionUp",value:.25,turns:3},{kind:"spdDown",value:.2,turns:3,selfCost:true}]}),
   active("resistCollapse","耐性崩壊・六相破陣","attack",3.8,48,6,"敵全体へ380%。被ダメージ・DEFを30%悪化させ、敵側魔法陣を1つ破壊。",{damageClass:"hybrid",allEnemies:true,randomElement:true,removeEnemyMagicCircle:true,breakAllyMagicCircle:true,effects:[{kind:"vulnerable",value:.3,turns:3,enemy:true},{kind:"defDown",value:.3,turns:3,enemy:true}]}),
   active("chaosWorld","混沌世界・万象未定","attack",7,82,10,"敵全体へ700%の必中複合攻撃。強化を反転し、混乱・SPD低下・命中低下を与える。",{damageClass:"hybrid",allEnemies:true,randomElement:true,guaranteedHit:true,invertEnemyBuffRate:1,invertOneBuff:true,invertRate:1,status:{id:"confusion",name:"法則混乱",chance:.6,turns:2},effects:[{kind:"spdDown",value:.35,turns:4,enemy:true},{kind:"accuracyDown",value:.3,turns:4,enemy:true}]})
  ],
  signatureWeapon:{name:"原初渦刃・アペイロン",description:"確定した法則へ刃を入れ、属性・加護・陣地を未定義の渦へ戻す第六法則の双刃。",stats:{atk:240,matk:240,spd:58,evasion:18,accuracy:22},fixedEffects:{skillPower:22,statusChance:22,evasion:15},resonance:{damageMultiplier:1.08,damageReductionRate:.07},skill:active("undefinedWorld","無定義世界","attack",7.8,0,11,"敵全体へ780%の必中複合攻撃。強化を完全反転し、敵側魔法陣を1つ破壊、混乱を刻む。",{mpRate:.6,damageClass:"hybrid",allEnemies:true,randomElement:true,guaranteedHit:true,defenseIgnore:.35,invertEnemyBuffRate:1,invertOneBuff:true,invertRate:1,removeEnemyMagicCircle:true,breakAllyMagicCircle:true,status:{id:"confusion",name:"未定義",chance:.7,turns:2},tag:"固有武器技"})},
  gearNames:["原初渦刃・アペイロン","反律副刃","六相首飾り","未定義指輪","無相竜衣","混沌原核"],
  gearEffects:["スキル威力+22%・状態命中+22%・固有武器技『無定義世界』。","反転後の物理／魔法攻撃を均衡させる副刃。","ランダム属性の命中と耐性を補う六相首飾り。","回避と強化反転の成功率を高める指輪。","属性変化時の被ダメージを抑える竜衣。","世界反転と混沌世界のMP循環を安定させる原核。"],setText:{2:"複合攻撃威力+16%",4:"回避+12・毎ターンHP2%再生",6:"属性不利を無効化し、強化反転の効果量+25%"}
 },
 ten_dominion:{
  role:"命令上書き・行動封殺",title:"意思を残したまま命令順位を奪う第七法則",damageClass:"magic",
  ai:"強化中の敵には従属、再使用待ちを抱えた集団には絶対支配、平時は王命で行動順と命中を崩す。",
  passive:"帝王術式：高い魔法ATKと状態命中を持つ制圧役。混乱・能力低下・CT延長を重ね、敵の有効行動を減らす。",
  awakening:"専用武器『絶対王笏・インペリウム』装備中、敵の加護を王権へ換え味方へ配る『万軍臣従』を習得。",
  statProfile:{hp:3,atk:.7,matk:3,def:3,mdef:3,spd:.9,crit:5,evasion:5,accuracy:28},
  basic:active("order","王命刻印","attack",1.8,0,0,"敵単体へ180%。30%で命令上書き、命中を12%低下。",{status:{id:"confusion",name:"命令上書き",chance:.3,turns:1},effects:[{kind:"accuracyDown",value:.12,turns:2,enemy:true}]}),
  authorities:[
   active("dominionOrder","支配命令・優先律","attack",2.6,30,3,"敵単体へ260%。75%で2ターン支配し、ATK35%・命中30%低下、固有技CTを1延長。",{status:{id:"confusion",name:"支配",chance:.75,turns:2},increaseEnemyCooldowns:1,increaseAllyCooldowns:1,effects:[{kind:"atkDown",value:.35,turns:3,enemy:true},{kind:"accuracyDown",value:.3,turns:3,enemy:true}]}),
   active("royalDecree","王命・列序剥奪","attack",2.1,40,5,"敵全体へ210%。強化を1つ解除し、45%で命令上書き、SPD・回避を25%低下。",{allEnemies:true,dispelEnemyBuff:true,dispelOne:true,status:{id:"confusion",name:"王命",chance:.45,turns:1},effects:[{kind:"spdDown",value:.25,turns:3,enemy:true},{kind:"evasionDown",value:.25,turns:3,enemy:true}]}),
   active("subordination","従属・王権接収","drain",4.2,48,6,"敵単体へ420%。強化を1つ100%複写し、与ダメージ25%を吸収。",{drain:.25,stealEnemyBuffRate:1,dispelOne:true,stealOneBuffRate:1,bonusVsEnemyBuff:{multiplier:1.35}}),
   active("absoluteDominion","絶対支配・万軍停止","attack",5.4,84,10,"敵全体へ540%の必中魔法。75%で2ターン支配し、全攻防・SPD・命中を35%低下、CTを2延長。",{allEnemies:true,guaranteedHit:true,increaseEnemyCooldowns:2,increaseAllyCooldowns:2,status:{id:"confusion",name:"絶対支配",chance:.75,turns:2},effects:[{kind:"atkDown",value:.35,turns:4,enemy:true},{kind:"defDown",value:.35,turns:4,enemy:true},{kind:"spdDown",value:.35,turns:4,enemy:true},{kind:"accuracyDown",value:.35,turns:4,enemy:true}]})
  ],
  signatureWeapon:{name:"絶対王笏・インペリウム",description:"解除した加護へ王印を捺し、敵の権利を味方全軍へ再配分する第七法則の王笏。",stats:{hp:480,matk:350,mp:110,mdef:150,accuracy:28},fixedEffects:{skillPower:22,statusChance:28,mpCostReduction:14},resonance:{damageMultiplier:1.06,damageReductionRate:.1},skill:active("allArmySubmit","万軍臣従","buff",0,0,11,"敵の強化を1つ完全接収。味方全体へATK・DEF+35%、命中+25%、20%軽減を3ターン付与しCTを1短縮。",{mpRate:.58,target:"味方全体",stealEnemyBuffRate:1,reducePartyCooldowns:1,effects:[{kind:"atkUp",value:.35,turns:3,allies:true},{kind:"defUp",value:.35,turns:3,allies:true},{kind:"accuracyUp",value:.25,turns:3,allies:true},{kind:"guard",value:.2,turns:3,allies:true}],tag:"固有武器技"})},
  gearNames:["絶対王笏・インペリウム","服従王印","勅令首飾り","臣従指輪","万軍帝衣","支配王冠"],
  gearEffects:["スキル威力+22%・状態命中+28%・固有武器技『万軍臣従』。","支配成功時の防御と障壁を補う王印。","命中と最大MPを高める勅令首飾り。","解除した加護の複写持続を安定させる指輪。","全体命令中の被ダメージを抑える帝衣。","絶対支配と王命の再使用を短縮する王冠。"],setText:{2:"支配・命令成功率+18%",4:"支配中の敵から受けるダメージ-20%",6:"支配成功時、味方全体の固有技CTを1短縮"}
 },
 ten_creation:{
  role:"創具障壁・全体修復",title:"必要な守りを設計して現実へ与える第八法則",damageClass:"magic",
  ai:"味方障壁が薄ければ神壁、複数負傷なら創造神域、平時は創世と創界で攻防を組み上げる。",
  passive:"原型光核：高いHP・両DEF・魔法ATKを持つ守護術師。速度と物理ATKを抑え、回復・障壁・強化へ性能を集中する。",
  awakening:"専用武器『創世神筆・アルケー』装備中、損耗した戦線を完成形へ描き直す『無限創装』を習得。",
  statProfile:{hp:3,atk:.5,matk:2.2,def:3,mdef:3,spd:.55,crit:4,evasion:8,accuracy:15},
  basic:active("creationLight","創光・修復粒子","attack",1.7,0,0,"敵単体へ170%。命中後、自分を最大HP10%回復。",{selfHeal:.1}),
  authorities:[
   active("genesis","創世・原型付与","buff",0,30,3,"味方全体へATK・DEF+25%、命中+15%を3ターン付与し、最大HP10%障壁を創造。",{target:"味方全体",partyShieldRate:.1,effects:[{kind:"atkUp",value:.25,turns:3,allies:true},{kind:"defUp",value:.25,turns:3,allies:true},{kind:"accuracyUp",value:.15,turns:3,allies:true}]}),
   active("divineWall","神壁・多層創甲","buff",0,44,5,"味方全体へ最大HP25%障壁、DEF+35%、被ダメージ30%軽減を3ターン付与。",{target:"味方全体",partyShieldRate:.25,effects:[{kind:"defUp",value:.35,turns:3,allies:true},{kind:"guard",value:.3,turns:3,allies:true}]}),
   active("createWorld","創界・生命設計","buff",0,52,6,"味方全体へATK・DEF・SPD+30%と再生8%を4ターン付与し、発動中CTを1短縮。",{target:"味方全体",reducePartyCooldowns:1,effects:[{kind:"atkUp",value:.3,turns:4,allies:true},{kind:"defUp",value:.3,turns:4,allies:true},{kind:"spdUp",value:.3,turns:4,allies:true},{kind:"regen",value:.08,turns:4,allies:true}]}),
   active("creationDomain","創造神域・万象再築","allHeal",0,86,10,"味方全体を65%回復・浄化。最大HP25%障壁、再生10%、35%軽減を付与。",{heal:.65,cleanse:true,partyShieldRate:.25,effects:[{kind:"regen",value:.1,turns:4,allies:true},{kind:"guard",value:.35,turns:3,allies:true}]})
  ],
  signatureWeapon:{name:"創世神筆・アルケー",description:"壊れたものを戻すのではなく、より強い完成形として描き直す第八法則の神筆。",stats:{hp:680,matk:340,def:190,mdef:190,mp:120},fixedEffects:{healPower:30,guardPower:30,mpCostReduction:12},resonance:{damageMultiplier:1.04,damageReductionRate:.13},skill:active("infiniteArmament","無限創装","allHeal",0,0,12,"味方全体を50%回復・浄化。最大HP35%障壁、DEF+45%、40%軽減を3ターン創造。",{mpRate:.62,heal:.5,cleanse:true,partyShieldRate:.35,effects:[{kind:"defUp",value:.45,turns:3,allies:true},{kind:"guard",value:.4,turns:3,allies:true}],tag:"固有武器技"})},
  gearNames:["創世神筆・アルケー","原型創盾","設計雫","多層指輪","万象法衣","創造原核"],
  gearEffects:["回復量+30%・障壁強度+30%・固有武器技『無限創装』。","神壁の障壁を多層化する原型創盾。","最大HP・MPと浄化性能を高める設計雫。","障壁付与時のDEFと状態耐性を補う指輪。","味方全体への軽減効果を安定させる法衣。","創造神域と創界のMP循環を支える原核。"],setText:{2:"障壁量+20%",4:"回復量+20%・状態耐性+20%",6:"戦闘開始時、味方全体へ最大HP20%障壁"}
 },
 ten_end:{
  role:"炎上収束・長期戦処刑",title:"戦闘時間を灰燼へ収束させる第九法則",damageClass:"magic",
  ai:"まず世界炎上、次に灰の刻印で回復と防御を崩し、炎上中の集団へ崩壊、終盤はラストジャッジで収束させる。",
  passive:"終焉カウント：高い魔法ATK・SPD・会心と引き換えに耐久が低い。対応技は経過ターンごとに威力+2%（上限40%）。",
  awakening:"専用武器『終界大剣・エスカトン』装備中、長期戦そのものを処刑火力へ換える『灰燼最終審判』を習得。",
  statProfile:{hp:.9,atk:.55,matk:3,def:.6,mdef:.65,spd:1.4,crit:25,evasion:10,accuracy:25},
  basic:active("ash","灰化・余燼","attack",2.1,0,0,"敵単体へ210%。65%で3ターン炎上。",{status:{id:"burn",name:"余燼",chance:.65,turns:3,power:.04}}),
  authorities:[
   active("worldBurn","世界炎上・赫灼圏","attack",2.8,34,3,"敵全体へ280%。80%で4ターン、最大HP6%の炎上を刻む。",{allEnemies:true,status:{id:"burn",name:"世界炎上",chance:.8,turns:4,power:.06}}),
   active("collapseEnd","崩壊・焼滅収束","attack",3.8,46,5,"敵全体へ380%。現在HP12%を追加で削り、炎上中の対象へ威力+50%。",{allEnemies:true,currentHpDamage:.12,bonusVsStatus:{id:"burn",multiplier:1.5}}),
   active("ashMark","灰の刻印・回生焼却","attack",2.6,50,6,"敵全体へ260%。被ダメージ+30%・回復量35%低下を4ターン刻む。",{allEnemies:true,effects:[{kind:"vulnerable",value:.3,turns:4,enemy:true},{kind:"healDown",value:.35,chance:1,turns:4,enemy:true}]}),
   active("lastJudge","ラストジャッジ・終刻","attack",12,92,10,"敵全体へ1200%の必中終焉魔法。炎上中は威力+50%、現在HP10%追加、HP25%以下を処刑。経過ターンごとに威力上昇。",{allEnemies:true,guaranteedHit:true,defenseIgnore:.45,currentHpDamage:.1,execute:.25,bonusVsStatus:{id:"burn",multiplier:1.5},turnPowerStep:.02,turnPowerCap:.4})
  ],
  signatureWeapon:{name:"終界大剣・エスカトン",description:"刻まれた戦闘時間を炎へ変え、世界の寿命とともに振り下ろす第九法則の大剣。",stats:{matk:410,spd:72,crit:32,accuracy:25,mp:80},fixedEffects:{fireDamage:40,dotDamage:35,critDamage:55},resonance:{damageMultiplier:1.12,critBonus:.1},skill:active("finalAshJudgment","灰燼最終審判","attack",14.5,0,12,"敵全体へ1450%の必中・確定会心。魔法DEF50%無視、現在HP12%追加、HP30%以下を処刑し炎上を刻む。",{mpRate:.7,allEnemies:true,guaranteedHit:true,guaranteedCritical:true,defenseIgnore:.5,currentHpDamage:.12,execute:.3,turnPowerStep:.03,turnPowerCap:.45,status:{id:"burn",name:"最終灰燼",chance:.9,turns:4,power:.07},tag:"固有武器技"})},
  gearNames:["終界大剣・エスカトン","余燼副刃","終刻灰晶","焼滅指輪","終界外套","最後の種火"],
  gearEffects:["火属性+40%・継続ダメージ+35%・固有武器技『灰燼最終審判』。","炎上中の対象への魔法DEF無視を補う副刃。","終焉カウントと最大MPを蓄える灰晶。","炎上対象への会心と処刑火力を高める指輪。","低い両DEFを補い、水属性被害を抑える外套。","ラストジャッジの再使用とMP循環を守る種火。"],setText:{2:"炎上ダメージ+25%",4:"炎上中の敵への与ダメージ+20%",6:"終焉カウント上限+20%・処刑閾値+5%"}
 },
 ten_divinity:{
  role:"全体適応・十律統合",title:"十の法則を味方全体へ循環させる最終神格",damageClass:"hybrid",
  ai:"戦線が崩れれば創世再誕、守りが薄ければ神域、敵の強化・魔法陣には全界神罰、好機には神格降臨を全員へ展開する。",
  passive:"十律均衡体：最高級のHPと両防御、物理／魔法攻撃を併せ持つ総合型。各専門神の尖った一分野ではなく、戦線全体を補完する。",
  awakening:"専用武器『十律神剣・デカロゴス』装備中、味方全員を完全神格へ接続する『十律統合』を習得。",
  statProfile:{hp:1.15,atk:1.15,matk:1.5,def:1.3,mdef:1.6,spd:3,crit:18,evasion:12,accuracy:28},
  basic:active("divinePunish","神罰・双律裁定","attack",2.5,0,0,"敵単体へ250%の必中複合攻撃。防御20%無視、強化を1つ解除。",{damageClass:"hybrid",guaranteedHit:true,defenseIgnore:.2,dispelEnemyBuff:true,dispelOne:true}),
  authorities:[
   active("sanctuary","神域・均衡聖環","buff",0,40,4,"味方全体へATK・DEF・SPD・命中+25%、20%軽減と最大HP18%障壁を3ターン付与。",{target:"味方全体",partyShieldRate:.18,effects:[{kind:"atkUp",value:.25,turns:3,allies:true},{kind:"defUp",value:.25,turns:3,allies:true},{kind:"spdUp",value:.25,turns:3,allies:true},{kind:"accuracyUp",value:.25,turns:3,allies:true},{kind:"guard",value:.2,turns:3,allies:true}]}),
   active("divineJudgment","神罰・全界十字","attack",6.8,58,6,"敵全体へ680%の必中複合攻撃。防御35%無視、現在HP5%追加、強化と敵側魔法陣を1つずつ消す。",{damageClass:"hybrid",allEnemies:true,guaranteedHit:true,defenseIgnore:.35,currentHpDamage:.05,dispelEnemyBuff:true,dispelOne:true,removeEnemyMagicCircle:true,breakAllyMagicCircle:true}),
   active("genesisRevive","創世再誕・分命神環","allHeal",0,76,8,"味方全体を55%回復・浄化し、自分の現在HP50%を分けて戦闘不能1体を蘇生。",{heal:.55,cleanse:true,revive:.01,reviveTransferRate:.5,reviveMp:.3,partyShieldRate:.12,revivedEffects:[{kind:"regen",value:.1,turns:3},{kind:"guard",value:.25,turns:2}]}),
   active("divineDescent","神格降臨・全軍適応","buff",0,94,10,"生存中の味方全体へATK・DEF+40%、SPD+35%、必中・再生12%、最大HP20%障壁を4ターン付与。",{target:"味方全体",allAllies:true,partyShieldRate:.2,reducePartyCooldowns:1,effects:[{kind:"atkUp",value:.4,turns:4,allies:true},{kind:"defUp",value:.4,turns:4,allies:true},{kind:"spdUp",value:.35,turns:4,allies:true},{kind:"guaranteedHit",value:1,turns:4,allies:true},{kind:"regen",value:.12,turns:4,allies:true}]})
  ],
  signatureWeapon:{name:"十律神剣・デカロゴス",description:"十の法則を一本の回路へ束ね、味方全員へ欠けた神格を供給する最終神格の剣。",stats:{hp:620,atk:280,matk:280,def:130,mdef:130,spd:45},fixedEffects:{skillPower:24,damageReduction:12,mpCostReduction:12},resonance:{damageMultiplier:1.1,damageReductionRate:.11},skill:active("completeDivinity","十律統合・完全神格","buff",0,0,12,"味方全体へATK・DEF・SPD+50%、命中+35%、必中・確定会心・再生15%・30%軽減・30%障壁を2ターン付与。CTを2短縮。",{mpRate:.68,target:"味方全体",partyShieldRate:.3,reducePartyCooldowns:2,effects:[{kind:"atkUp",value:.5,turns:2,allies:true},{kind:"defUp",value:.5,turns:2,allies:true},{kind:"spdUp",value:.5,turns:2,allies:true},{kind:"accuracyUp",value:.35,turns:2,allies:true},{kind:"guaranteedHit",value:1,turns:2,allies:true},{kind:"guaranteedCritical",value:1,turns:2,allies:true},{kind:"regen",value:.15,turns:2,allies:true},{kind:"guard",value:.3,turns:2,allies:true}],tag:"固有武器技"})},
  gearNames:["十律神剣・デカロゴス","均衡副環","十法首飾り","完全神格指輪","統合法衣","世界均衡核"],
  gearEffects:["スキル威力+24%・被ダメージ-12%・固有武器技『十律統合』。","物理／魔法攻撃と両防御を均衡させる副環。","最大HP・MPと状態耐性を高める十法首飾り。","命中・会心・回避を同時に補う完全神格指輪。","全体適応中の被ダメージを抑える統合法衣。","神格降臨と創世再誕のMP循環を支える均衡核。"],setText:{2:"全能力+5%",4:"毎ターンHP2%再生・状態耐性+20%",6:"戦闘開始時、味方全体へATK・DEF+20%"}
 }
});
for(const entry of RAW){
 const refinement=ABYSS_PROFILE_REFINEMENTS[entry.id]??TEN_FIRST_PROFILE_REFINEMENTS[entry.id]??TEN_LAST_PROFILE_REFINEMENTS[entry.id];
 if(refinement)Object.assign(entry,refinement);
}

export const ENDGAME_CHARACTERS=Object.freeze(Object.fromEntries(RAW.map(entry=>{const value=character(entry);return[value.id,Object.freeze(value)]})));
export const ABYSS_CHARACTER_IDS=Object.freeze(RAW.filter(entry=>entry.faction==="abyss").map(entry=>entry.id));
export const TEN_GOD_CHARACTER_IDS=Object.freeze(RAW.filter(entry=>entry.faction==="tenGod").map(entry=>entry.id));
export const ENDGAME_LEGACY_ID_MAP=Object.freeze({abyss_extinction:"abyss_lust",ten_fire:"ten_end",ten_water:"ten_life",ten_thunder:"ten_fate",ten_wind:"ten_divinity",ten_earth:"ten_dominion",ten_light:"ten_creation",ten_dark:"ten_death",ten_ice:"ten_chaos"});
export const ENDGAME_SKILLS=Object.freeze(Object.fromEntries(Object.values(ENDGAME_CHARACTERS).flatMap(character=>[...character.skills,character.signatureWeapon?.skill].filter(Boolean).map(skill=>[skill.id,Object.freeze(skill)]))));
export const ENDGAME_WEAPON_SKILLS=Object.freeze(Object.fromEntries(Object.values(ENDGAME_CHARACTERS).map(character=>character.signatureWeapon?.skill).filter(Boolean).map(skill=>[skill.id,skill])));

export function canonicalEndgameId(id){return ENDGAME_LEGACY_ID_MAP[id]??id}
export function endgameCharacter(id){return ENDGAME_CHARACTERS[canonicalEndgameId(id)]??null}
export function endgameSkills(id){return endgameCharacter(id)?.skills??[]}
export function endgameSkillById(id){return ENDGAME_SKILLS[id]??null}
export function endgameWeaponSkill(id){return endgameCharacter(id)?.signatureWeapon?.skill??null}
export function endgameWeaponSkillById(id){return ENDGAME_WEAPON_SKILLS[id]??null}

const SERIES_NUMERIC={
 abyss_gluttony:{2:{healPower:.12},4:{hp:.12},6:{skillPower:.25}},abyss_wrath:{2:{critDamage:.2},4:{crit:8},6:{atk:.2}},abyss_envy:{2:{statusRes:.12},4:{spd:.08},6:{skillPower:.25}},abyss_sloth:{2:{statusRes:.18},4:{mp:.15},6:{skillPower:.2}},abyss_greed:{2:{skillPower:.12},4:{atk:.12},6:{crit:10}},abyss_lust:{2:{healPower:.15},4:{partyHpRegen:.015},6:{statusRes:.18}},abyss_pride:{2:{atk:.1},4:{def:.1,spd:.1},6:{guardPower:.2}},
 ten_time:{2:{mpCost:-.08},4:{spd:.14},6:{lastStand:1}},ten_space:{2:{skillPower:.18},4:{crit:10},6:{atk:.18}},ten_life:{2:{healPower:.2},4:{partyHpRegen:.025},6:{hp:.15}},ten_death:{2:{skillPower:.18},4:{critDamage:.25},6:{execution:.2}},ten_fate:{2:{crit:10},4:{critDamage:.2},6:{skillPower:.2}},ten_chaos:{2:{skillPower:.16},4:{hpRegen:.02},6:{statusRes:.25}},ten_dominion:{2:{statusRes:.18},4:{guardPower:.2},6:{skillPower:.22}},ten_creation:{2:{guardPower:.2},4:{statusRes:.2},6:{hp:.2}},ten_end:{2:{burnChance:.25},4:{fireDamage:.2},6:{skillPower:.3}},ten_divinity:{2:{atk:.05,def:.05,hp:.05,spd:.05},4:{hpRegen:.02},6:{skillPower:.2}}
};
export const ENDGAME_SERIES=Object.freeze(Object.fromEntries(Object.values(ENDGAME_CHARACTERS).map(character=>[character.seriesId,{name:character.epithet,theme:`${character.role}・固有権能`,bonuses:Object.fromEntries([2,4,6].map(pieces=>[pieces,{...(SERIES_NUMERIC[character.id]?.[pieces]??{}),specialText:character.setText[pieces]}]))}])));
