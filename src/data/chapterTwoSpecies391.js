// Chapter II installment 9: crimson pursuit, cleansing bells and eclipse renewal.
const skill=(key,name,mp,cooldown,description,fields={})=>({key,name,mp,cooldown,description,type:'attack',power:1,target:'敵単体',tag:'第二章固有',chapterTwoSet391:true,unlock:{type:'level',value:1},...fields});
const creatures=[
 {key:'rithia',name:'根灯の短剣姫リティア',rarity:'N',element:'wind',race:'spirit',role:'support',tacticRole383:'support',stats:[120,27,17,22,24,28],maxMp:50,captureCap383:.65,habitat383:'境界の森・再探索「倒木の小径」（再訪で交代）',lore383:'倒木の内側に残った灯りから生まれた案内役。根灯を掲げ、迷い込んだ黒羽と紅羽の双子に帰り道を示す。',counter383:'低燃費の回復役。足止めと回避で双子を支えるが、全体攻撃や命中強化で崩せる。',skills:[
 skill('root','根灯・絡み根の短剣',9,2,'風属性1.00倍。速度15%低下（2ターン）。',{effects:[{kind:'spdDown',value:.15,turns:2,enemy:true}],ai383:'setup'}),
 skill('light','帰路を照らす灯り',13,3,'生存味方全体のHP14%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.14,ai383:'heal'}),
 skill('purify','根灯の祓火',12,3,'生存味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'}),
 skill('trail','木漏れ日の抜け道',12,3,'味方全体に最大HP10%の障壁、回避15%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.1,effects:[{kind:'evasionUp',value:.15,turns:2,allies:true}],ai383:'shield'})]},
 {key:'nizelle',name:'黒羽の細剣姫ニゼル',rarity:'R',element:'dark',race:'demon',role:'attack',tacticRole383:'disruptor',stats:[136,35,16,23,22,34],maxMp:58,captureCap383:.55,habitat383:'境界の森・再探索「倒木の小径」（再訪で交代）',lore383:'封樹に奪われた紅い羽を探す双子の姉。黒羽の細剣で浅い傷を刻み、妹だけが読める軌跡を残す。',counter383:'出血が双剣連撃の起点。出血を治すか、速い姉を先に止めると妹の追撃が弱まる。',skills:[
 skill('feather','黒羽・紅糸の刻傷',14,2,'闇属性1.00倍。80%で出血（3ターン、最大HP2.5%）。',{status:{id:'bleed',name:'出血',chance:.8,turns:3,power:.025},ai383:'setup'}),
 skill('bind','羽根縫いの細剣',15,2,'闇属性1.10倍。回避18%低下（2ターン）。',{power:1.1,effects:[{kind:'evasionDown',value:.18,turns:2,enemy:true}],ai383:'disrupt'}),
 skill('trace','紅糸を辿る刺突',14,1,'闇属性1.25倍。出血中には威力1.50倍。',{power:1.25,bonusVsStatus:{id:'bleed',multiplier:1.5},ai383:'strike'}),
 skill('cloak','黒羽の身替わり',15,3,'自身に最大HP15%の障壁、回避20%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.15,effects:[{kind:'evasionUp',value:.2,turns:2}],ai383:'stance'})]},
 {key:'charne',name:'紅羽の双剣姫シャルネ',rarity:'SR',element:'fire',race:'demon',role:'attack',tacticRole383:'striker',stats:[166,45,16,28,23,29],maxMp:64,captureCap383:.42,habitat383:'境界の森・再探索「倒木の小径」（再訪で交代）',lore383:'姉が刻んだ紅糸を追う双剣の妹。失われた羽を取り戻すため、二本の剣を重ねて封樹の呪いを切り開く。',counter383:'出血相手への連撃が強烈。出血耐性・浄化・物理軽減を用意し、姉妹の片方を集中して倒す。',skills:[
 skill('pursuit','紅羽・双刃追葬',18,1,'火属性1.55倍、防御20%無視。出血中には威力1.60倍。',{power:1.55,defenseIgnore:.2,bonusVsStatus:{id:'bleed',multiplier:1.6},ai383:'strike'}),
 skill('scar','癒えぬ紅の剣痕',17,2,'火属性1.10倍。HP回復35%低下（2ターン）。',{power:1.1,effects:[{kind:'healDown',value:.35,turns:2,enemy:true}],ai383:'setup'}),
 skill('rain','散華・紅羽の剣雨',20,2,'敵全体に火属性0.95倍、防御15%無視。',{power:.95,allEnemies:true,target:'敵全体',defenseIgnore:.15,ai383:'fallback'}),
 skill('oath','帰り道の約束',17,3,'自身に最大HP16%の障壁、攻撃20%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.16,effects:[{kind:'atkUp',value:.2,turns:2}],ai383:'stance'})]},
 {key:'ferne',name:'宵鐘の護姫フェルネ',rarity:'SSR',element:'dark',race:'golem',role:'tank',tacticRole383:'guardian',stats:[212,40,21,42,35,24],maxMp:80,captureCap383:.32,habitat383:'深淵の回廊・再探索「眠りの裁定」（再訪で交代）',lore383:'眠りの裁定を告げる古い鐘から生まれた姉妹機の姉。槌を鳴らして呪いを引き受け、妹の澄んだ鐘へ受け渡す。',counter383:'姉妹がそろうと攻撃後に全体浄化。弱体を重ねるだけでは押し切れないため、片方の足止めや集中攻撃が有効。',skills:[
 skill('toll','宵鐘・鎮めの槌',21,2,'闇属性1.25倍。攻撃20%低下（2ターン）。',{power:1.25,effects:[{kind:'atkDown',value:.2,turns:2,enemy:true}],ai383:'setup'}),
 skill('belfry','黒鐘楼の守り',25,3,'味方全体に最大HP20%の障壁、防御20%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.2,effects:[{kind:'defUp',value:.2,turns:2,allies:true}],ai383:'shield'}),
 skill('echo','静寂を破る返響',22,1,'闇属性1.50倍。攻撃低下中には威力1.45倍。',{power:1.5,bonusVsEffect:{kind:'atkDown',multiplier:1.45},ai383:'strike'}),
 skill('vespers','宵の弔鐘',23,3,'生存味方全体のHP18%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.18,ai383:'heal'})]},
 {key:'clarisse',name:'暁鐘の聖姫クラリス',rarity:'UR',element:'light',race:'golem',role:'magic',tacticRole383:'support',stats:[194,21,53,29,41,31],maxMp:94,captureCap383:.24,habitat383:'深淵の回廊・再探索「眠りの裁定」（再訪で交代）',lore383:'裁定の夜を明かす青い水晶鐘の妹。姉が引き受けた呪いをほどき、二つの音を重ねて閉ざされた回廊を照らす。',counter383:'浄化・回復・強化解除を兼ねる支援役。高い単体火力で姉妹を分断し、連携を止める。',skills:[
 skill('dawn','暁鐘・偽りの加護崩し',24,2,'光属性1.15倍の魔法攻撃。敵の強化を1つ解除。',{power:1.15,damageClass:'magic',dispelEnemyBuff:true,ai383:'dispel'}),
 skill('absolve','澄鐘の赦し',25,3,'生存味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'}),
 skill('benison','夜明けの祝鐘',27,3,'生存味方全体のHP22%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.22,ai383:'heal'}),
 skill('chime','青晶の審鐘',25,1,'光属性1.55倍の魔法攻撃。攻撃低下中には威力1.45倍。',{power:1.55,damageClass:'magic',bonusVsEffect:{kind:'atkDown',multiplier:1.45},ai383:'strike'})]},
 {key:'lunaria',name:'月冥の翼姫ルナリア',rarity:'LR',element:'dark',race:'angel',role:'magic',tacticRole383:'disruptor',stats:[208,22,61,30,40,34],maxMp:104,captureCap383:.18,habitat383:'理の中枢・再探索「修復の中枢」（再訪で交代）',lore383:'修復機構の夜側を護る月翼の姉。欠けた記憶を月輪へ集め、妹の太陽へ渡すことで失われた魔力を巡らせる。',counter383:'防御低下から月輪で追討し、姉妹連携で魔力を回収。MP回復阻害や片方の撃破で長期戦の循環を断つ。',skills:[
 skill('waning','月冥・欠けゆく夜',28,2,'闇属性1.20倍の魔法攻撃。防御22%低下（2ターン）。',{power:1.2,damageClass:'magic',effects:[{kind:'defDown',value:.22,turns:2,enemy:true}],ai383:'setup'}),
 skill('crescent','欠月の追輪',30,1,'闇属性1.65倍の魔法攻撃。防御低下中には威力1.50倍。',{power:1.65,damageClass:'magic',bonusVsEffect:{kind:'defDown',multiplier:1.5},ai383:'strike'}),
 skill('eclipse','月蝕の魔力封じ',31,3,'敵全体に闇属性0.85倍の魔法攻撃。MP回復45%低下（2ターン）。',{power:.85,damageClass:'magic',allEnemies:true,target:'敵全体',effects:[{kind:'mpRecoveryDown',value:.45,turns:2,enemy:true}],ai383:'disrupt'}),
 skill('mantle','黒月の羽衣',29,3,'味方全体に最大HP18%の障壁、命中18%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.18,effects:[{kind:'accuracyUp',value:.18,turns:2,allies:true}],ai383:'shield'})]},
 {key:'solaria',name:'日輪の翼姫ソラリア',rarity:'神話',element:'light',race:'angel',role:'magic',tacticRole383:'leader',stats:[233,24,65,35,44,30],maxMp:110,captureCap383:.12,habitat383:'理の中枢・再探索「修復の中枢」（再訪で交代）',lore383:'修復機構の昼側を護る日翼の妹。月が集めた記憶を日輪で再び灯し、永い夜の先へ姉の手を引いて進む。',counter383:'回復と障壁で月冥を支え、連携のたび姉妹のMPを補う。回復阻害を重ねて片方に火力を集めたい。',skills:[
 skill('sunrise','日輪・朝焼けの裁き',30,2,'光属性1.25倍の魔法攻撃。攻撃22%低下（2ターン）。',{power:1.25,damageClass:'magic',effects:[{kind:'atkDown',value:.22,turns:2,enemy:true}],ai383:'setup'}),
 skill('zenith','白昼の天光',33,1,'光属性1.75倍の魔法攻撃。防御低下中には威力1.45倍。',{power:1.75,damageClass:'magic',bonusVsEffect:{kind:'defDown',multiplier:1.45},ai383:'strike'}),
 skill('renewal','巡る朝の祝福',31,3,'生存味方全体のHP24%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.24,ai383:'heal'}),
 skill('corona','日輪の天蓋',32,3,'味方全体に最大HP20%の障壁、防御22%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.2,effects:[{kind:'defUp',value:.22,turns:2,allies:true}],ai383:'shield'})]}
];
export const CHAPTER_TWO_SPECIES391=Object.freeze(Object.fromEntries(creatures.map(c=>{
 const id=`ch2_${c.key}`,[hp,atk,matk,def,mdef,spd]=c.stats;
 const skills=c.skills.map(s=>({...s,id:`${id}__${s.key}`,element:c.element,damageClass:s.damageClass??'physical'}));
 return[id,{...c,id,emoji:'✦',chapterTwoOnly:true,chapterTwoSet391:true,fieldEncounter:false,gachaExcluded:true,minFloor:Number.MAX_SAFE_INTEGER,captureRate:c.captureCap383,acquisition:[c.habitat383,'捕獲'],growth:{hp:1,atk:1,def:1,spd:1},baseStats:{hp,atk,matk,def,mdef,spd,crit:8,evasion:8,accuracy:112},rankNames:[c.name,c.name,c.name,c.name],skills,authoredSkills:skills}];
})));
