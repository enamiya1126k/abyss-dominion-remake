// Chapter II installment 5: right-facing heroines and three complementary pairs.
const skill=(key,name,mp,cooldown,description,fields={})=>({key,name,mp,cooldown,description,type:'attack',power:1,target:'敵単体',tag:'第二章固有',chapterTwoSet387:true,unlock:{type:'level',value:1},...fields});
const creatures=[
 {key:'pipia',name:'露鈴の案内姫ピピア',rarity:'N',element:'wind',race:'spirit',role:'healer',tacticRole383:'support',stats:[110,12,24,17,22,26],maxMp:44,captureCap383:.65,habitat383:'境界の森・再探索「倒木の小径」',lore383:'境界の露を集める鈴の妖精。迷子の魔物を案内し、長い探索を終えた者には小さな祝福を贈る。',counter383:'仲間を回復し命中を助ける案内役。先に止めると周囲の攻撃が通りにくくなる。',skills:[
 skill('dew','露鈴の祝福',12,3,'生存味方全体のHP12%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.12,ai383:'heal'}),
 skill('guide','迷い晴らし',10,3,'味方全体の命中15%・速度10%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',effects:[{kind:'accuracyUp',value:.15,turns:2,allies:true},{kind:'spdUp',value:.1,turns:2,allies:true}],ai383:'rally'}),
 skill('chime','鈴風のしるべ',8,2,'風属性0.90倍の魔法攻撃。回避15%低下（2ターン）。',{power:.9,damageClass:'magic',effects:[{kind:'evasionDown',value:.15,turns:2,enemy:true}],ai383:'setup'}),
 skill('trail','露光の追跡',9,1,'風属性1.10倍の魔法攻撃。回避低下中には威力1.35倍。',{power:1.1,damageClass:'magic',bonusVsEffect:{kind:'evasionDown',multiplier:1.35},ai383:'strike'})]},
 {key:'rikka',name:'白兎の縫姫リッカ',rarity:'R',element:'ice',race:'golem',role:'support',tacticRole383:'support',stats:[137,27,12,24,22,23],maxMp:52,captureCap383:.55,habitat383:'黒根の侵食域・再探索「焼け跡の根脈」',lore383:'白い縫い糸で壊れた自動人形を直す兎耳の姉。黒兎リンネが戻るための道を、縫い目の灯りで残している。',counter383:'姉妹のどちらかがHP35%以下だと救援共鳴に変化。回復阻害を入れ、低HPの一方を素早く倒す。',skills:[
 skill('stitch','白糸の繕い',16,3,'生存味方全体のHP16%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.16,ai383:'heal'}),
 skill('hem','守りの裾縫い',17,3,'味方全体に最大HP14%の障壁、防御15%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.14,effects:[{kind:'defUp',value:.15,turns:2,allies:true}],ai383:'shield'}),
 skill('needle','白兎の針刺し',10,2,'氷属性1.00倍。防御15%低下（2ターン）。',{power:1,effects:[{kind:'defDown',value:.15,turns:2,enemy:true}],ai383:'setup'}),
 skill('unravel','縫い目をほどく',15,3,'生存味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'})]},
 {key:'rinne',name:'黒兎の鋏姫リンネ',rarity:'SR',element:'dark',race:'golem',role:'assassin',tacticRole383:'striker',stats:[145,38,11,21,18,31],maxMp:56,captureCap383:.42,habitat383:'黒根の侵食域・再探索「焼け跡の根脈」',lore383:'姉の白糸を守る黒い裁縫人形。大切な縫い目は切らず、敵の装甲と呪いだけを鋏で断ち切る。',counter383:'姉が防御を下げると鋏の追撃が強まる。回復阻害と集中攻撃で救援の前に姉妹を分断する。',skills:[
 skill('shears','黒鋏・断ち縫い',14,1,'闇属性1.35倍。防御低下中には威力1.50倍。',{power:1.35,bonusVsEffect:{kind:'defDown',multiplier:1.5},ai383:'strike'}),
 skill('ribbon','呪いの裁断',15,2,'闇属性1.05倍。受けるHP回復30%低下（2ターン）。',{power:1.05,effects:[{kind:'healDown',value:.3,turns:2,enemy:true}],ai383:'healBlock'}),
 skill('scissor','影縫いの円舞',18,2,'敵全体に闇属性0.85倍、防御20%無視。',{power:.85,allEnemies:true,target:'敵全体',defenseIgnore:.2,ai383:'fallback'}),
 skill('promise','黒兎の約束',16,3,'自身に最大HP15%の障壁、攻撃18%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.15,effects:[{kind:'atkUp',value:.18,turns:2}],ai383:'stance'})]},
 {key:'seria',name:'氷硝の歌姫セリア',rarity:'SSR',element:'ice',race:'spirit',role:'magic',tacticRole383:'disruptor',stats:[155,12,43,23,32,31],maxMp:73,captureCap383:.32,habitat383:'深淵の回廊・再探索「忘却の鎖道」',lore383:'忘れられた聖堂の音を氷の硝子に保存する姉。妹カルミアの旋律と合わさると、沈黙した記録が再び歌い始める。',counter383:'速度低下と回避低下の両方があると姉妹の合奏が大幅強化。片方の弱体を浄化して合奏条件を崩す。',skills:[
 skill('note','氷硝の前奏',19,2,'敵全体に氷属性0.70倍の魔法攻撃。速度18%低下（2ターン）。',{power:.7,damageClass:'magic',allEnemies:true,target:'敵全体',effects:[{kind:'spdDown',value:.18,turns:2,enemy:true}],ai383:'setup'}),
 skill('aria','蒼白のアリア',20,1,'氷属性1.45倍の魔法攻撃。回避低下中には威力1.45倍。',{power:1.45,damageClass:'magic',bonusVsEffect:{kind:'evasionDown',multiplier:1.45},ai383:'strike'}),
 skill('rest','静音の小節',20,3,'生存味方全体のHP14%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.14,ai383:'heal'}),
 skill('glass','氷硝の響壁',22,3,'味方全体に最大HP14%の障壁、命中15%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.14,effects:[{kind:'accuracyUp',value:.15,turns:2,allies:true}],ai383:'shield'})]},
 {key:'carmia',name:'紅硝の奏姫カルミア',rarity:'UR',element:'fire',race:'spirit',role:'magic',tacticRole383:'striker',stats:[168,14,50,25,30,34],maxMp:78,captureCap383:.24,habitat383:'深淵の回廊・再探索「忘却の鎖道」',lore383:'紅の弦で記録の封印を震わせる妹。姉の冷たい音を壊さぬよう、炎を小さな旋律に変えて奏でる。',counter383:'姉の速度低下へ火の強奏を重ね、回避低下も準備する。弱体の浄化と魔法防御が対策。',skills:[
 skill('string','紅硝の調弦',20,2,'敵全体に火属性0.65倍の魔法攻撃。回避18%低下（2ターン）。',{power:.65,damageClass:'magic',allEnemies:true,target:'敵全体',effects:[{kind:'evasionDown',value:.18,turns:2,enemy:true}],ai383:'setup'}),
 skill('forte','緋色のフォルテ',22,1,'火属性1.50倍の魔法攻撃。速度低下中には威力1.45倍。',{power:1.5,damageClass:'magic',bonusVsEffect:{kind:'spdDown',multiplier:1.45},ai383:'strike'}),
 skill('break','加護砕きの弦',24,3,'火属性1.10倍の魔法攻撃。敵陣の強化を1つ解除。',{power:1.1,damageClass:'magic',dispelEnemyBuff:true,ai383:'dispel'}),
 skill('cadence','終止の守奏',19,3,'自身に最大HP15%の障壁、回避18%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.15,effects:[{kind:'evasionUp',value:.18,turns:2}],ai383:'stance'})]},
 {key:'aeriel',name:'終律の聖姫アエリエル',rarity:'LR',element:'light',race:'angel',role:'support',tacticRole383:'leader',stats:[205,51,24,35,35,31],maxMp:86,captureCap383:.18,habitat383:'理の中枢・再探索「記録の中枢」',lore383:'理が終わる場所を守る白銀の姉。魔姫ヴェスペラと二つに分かれた王冠を分け合い、次の世界へ渡す記録を選ぶ。',counter383:'魔姫とそろうと強化を1つ剥がして連撃する。強化だけに頼らず、障壁と集中攻撃で片方を止める。',skills:[
 skill('vow','白冠の誓約',28,3,'味方全体に最大HP18%の障壁、防御20%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.18,effects:[{kind:'defUp',value:.2,turns:2,allies:true}],ai383:'shield'}),
 skill('judgment','終律の断章',26,2,'光属性1.35倍。防御20%低下・被回復25%低下（2ターン）。',{power:1.35,effects:[{kind:'defDown',value:.2,turns:2,enemy:true},{kind:'healDown',value:.25,turns:2,enemy:true}],ai383:'setup'}),
 skill('mercy','白銀の慈悲',27,3,'生存味方全体のHP18%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.18,ai383:'heal'}),
 skill('blade','誓剣・天衡',25,1,'光属性1.50倍。防御低下中には威力1.40倍。',{power:1.5,bonusVsEffect:{kind:'defDown',multiplier:1.4},ai383:'strike'})]},
 {key:'vespera',name:'始淵の魔姫ヴェスペラ',rarity:'神話',element:'dark',race:'demon',role:'magic',tacticRole383:'striker',stats:[225,30,61,32,39,35],maxMp:94,captureCap383:.12,habitat383:'理の中枢・再探索「記録の中枢」',lore383:'深淵が始まる場所を守る黒紫の妹。姉の光を奪わず、影として寄り添う。二人の刃は理と深淵の境界を開く。',counter383:'姉の防御低下へ強打を重ね、強化中の相手にも強い。姉妹を分断し、回復阻害で立て直しを防ぐ。',skills:[
 skill('eclipse','始淵の月刃',30,1,'闇属性1.65倍の魔法攻撃。防御低下中には威力1.45倍。',{power:1.65,damageClass:'magic',bonusVsEffect:{kind:'defDown',multiplier:1.45},ai383:'strike'}),
 skill('crown','黒冠の簒奪',29,2,'闇属性1.40倍の魔法攻撃。強化中の敵には威力1.40倍。',{power:1.4,damageClass:'magic',bonusVsEnemyBuff:{multiplier:1.4},ai383:'buffStrike'}),
 skill('night','夜明け前の帳',28,3,'生存味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'}),
 skill('crescent','深淵の三日月',32,2,'敵全体に闇属性1.00倍の魔法攻撃、防御25%無視。',{power:1,damageClass:'magic',allEnemies:true,target:'敵全体',defenseIgnore:.25,ai383:'fallback'})]}
];
export const CHAPTER_TWO_SPECIES387=Object.freeze(Object.fromEntries(creatures.map(c=>{
 const id=`ch2_${c.key}`,[hp,atk,matk,def,mdef,spd]=c.stats;
 const skills=c.skills.map(s=>({...s,id:`${id}__${s.key}`,element:c.element,damageClass:s.damageClass??'physical'}));
 return[id,{...c,id,emoji:'✦',chapterTwoOnly:true,chapterTwoSet387:true,fieldEncounter:false,gachaExcluded:true,minFloor:Number.MAX_SAFE_INTEGER,captureRate:c.captureCap383,acquisition:[c.habitat383,'捕獲'],growth:{hp:1,atk:1,def:1,spd:1},baseStats:{hp,atk,matk,def,mdef,spd,crit:8,evasion:8,accuracy:112},rankNames:[c.name,c.name,c.name,c.name],skills,authoredSkills:skills}];
})));
