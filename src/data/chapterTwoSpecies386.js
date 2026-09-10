// Chapter II installment 4: right-facing heroines and three complementary pairs.
const skill=(key,name,mp,cooldown,description,fields={})=>({key,name,mp,cooldown,description,type:'attack',power:1,target:'敵単体',tag:'第二章固有',chapterTwoSet386:true,unlock:{type:'level',value:1},...fields});
const creatures=[
 {key:'ticta',name:'巻鍵の工姫ティクタ',rarity:'N',element:'earth',race:'golem',role:'controller',tacticRole383:'disruptor',stats:[100,23,10,17,12,24],maxMp:38,captureCap383:.65,habitat383:'境界の森・再探索「西の封印樹」',lore383:'封樹に埋もれた工房で目覚めた小さな自動人形。大きな巻鍵を槍に変え、壊れた仲間を直すため旅をしている。',counter383:'防御と速度を落として仲間の攻撃を通す。弱体を浄化し、回避に頼る魔法陣には命中支援で対抗。',skills:[
 skill('unwind','装甲の巻き戻し',8,2,'地属性0.95倍。防御15%低下（2ターン）。',{power:.95,effects:[{kind:'defDown',value:.15,turns:2,enemy:true}],ai383:'setup'}),
 skill('key','巻鍵貫き',9,1,'地属性1.15倍。防御低下中には威力1.35倍。',{power:1.15,bonusVsEffect:{kind:'defDown',multiplier:1.35},ai383:'strike'}),
 skill('clock','歯車止め',10,2,'地属性1.00倍。速度18%低下（2ターン）。',{power:1,effects:[{kind:'spdDown',value:.18,turns:2,enemy:true}],ai383:'fallback'}),
 skill('repair','小さな応急修理',12,3,'自身に最大HP14%の障壁、回避12%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.14,effects:[{kind:'evasionUp',value:.12,turns:2}],ai383:'stance'})]},
 {key:'mirea',name:'翠薬の魔女ミレア',rarity:'R',element:'earth',race:'spirit',role:'healer',tacticRole383:'support',stats:[122,11,27,16,25,22],maxMp:55,captureCap383:.55,habitat383:'黒根の侵食域・再探索「吸命の荒野」',lore383:'黒根の毒から薬を精製する翠髪の魔女。毒花を育てるヴィオラとは工房の相棒で、同じ花を治療にも攻撃にも使う。',counter383:'毒花の魔女との共鳴は毒状態の相手に大幅強化。毒を浄化し、回復役のミレアを先に狙う。',skills:[
 skill('elixir','翠薬の調合',18,3,'生存している味方全体のHPを15%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.15,ai383:'heal'}),
 skill('antidote','白百合の解毒',15,3,'生存している味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'}),
 skill('extract','薬毒の抽出',10,1,'地属性1.10倍の魔法攻撃。毒状態には威力1.35倍。',{power:1.1,damageClass:'magic',bonusVsStatus:{id:'poison',multiplier:1.35},ai383:'strike'}),
 skill('bottle','翠晶の薬瓶',15,3,'味方全体に最大HP10%の障壁、防御12%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.1,effects:[{kind:'defUp',value:.12,turns:2,allies:true}],ai383:'shield'})]},
 {key:'viola',name:'毒花の魔女ヴィオラ',rarity:'SR',element:'poison',race:'spirit',role:'magic',tacticRole383:'disruptor',stats:[112,10,37,14,26,26],maxMp:58,captureCap383:.42,habitat383:'黒根の侵食域・再探索「吸命の荒野」',lore383:'黒根の庭園を紫の花で覆う魔女。ミレアと約束した薬になる花だけを育てているが、敵には毒の側面を見せる。',counter383:'まず全体に毒を広げ、毒状態へ濃縮攻撃。毒耐性・浄化と回復阻害で二人の循環を断つ。',skills:[
 skill('pollen','毒花の花粉',17,2,'敵全体に毒属性0.60倍の魔法攻撃。85%で毒（3ターン）。',{power:.6,allEnemies:true,target:'敵全体',damageClass:'magic',status:{id:'poison',name:'毒',chance:.85,turns:3,power:.025},ai383:'setup'}),
 skill('distill','夜花の濃縮',16,1,'毒属性1.40倍の魔法攻撃。毒状態には威力1.50倍。',{power:1.4,damageClass:'magic',bonusVsStatus:{id:'poison',multiplier:1.5},ai383:'strike'}),
 skill('wilt','癒し枯らし',14,2,'毒属性1.00倍の魔法攻撃。受けるHP回復30%低下（2ターン）。',{power:1,damageClass:'magic',effects:[{kind:'healDown',value:.3,turns:2,enemy:true}],ai383:'healBlock'}),
 skill('petal','紫花のヴェール',14,3,'自身に最大HP12%の障壁、回避18%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.12,effects:[{kind:'evasionUp',value:.18,turns:2}],ai383:'stance'})]},
 {key:'kagura',name:'紅月の巫狐カグラ',rarity:'SSR',element:'fire',race:'beast',role:'assassin',tacticRole383:'striker',stats:[149,42,16,22,20,32],maxMp:62,captureCap383:.32,habitat383:'天律の聖域・再探索「天秤の回廊」',lore383:'天律の月を祀る狐巫女の姉。紅の太刀で夜を裂き、妹サヨの扇が送る風に狐火を乗せて舞う。',counter383:'火傷を付けて妹と連撃する。火傷を消すと固有技も共鳴も弱まる。防御を固め、姉妹の一方へ集中。',skills:[
 skill('flame','紅月の狐火刃',16,2,'火属性1.00倍。85%で火傷（3ターン）。',{power:1,status:{id:'burn',name:'火傷',chance:.85,turns:3,power:.02},ai383:'setup'}),
 skill('crescent','緋月一閃',19,1,'火属性1.45倍。火傷中には威力1.45倍。',{power:1.45,bonusVsStatus:{id:'burn',multiplier:1.45},ai383:'strike'}),
 skill('dance','紅蓮の剣舞',21,2,'敵全体に火属性0.85倍。防御を20%無視。',{power:.85,allEnemies:true,target:'敵全体',defenseIgnore:.2,ai383:'fallback'}),
 skill('oath','姉狐の誓い',18,3,'自身に最大HP14%の障壁、攻撃20%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.14,effects:[{kind:'atkUp',value:.2,turns:2}],ai383:'stance'})]},
 {key:'sayo',name:'蒼月の巫狐サヨ',rarity:'UR',element:'wind',race:'beast',role:'support',tacticRole383:'support',stats:[165,38,24,25,34,35],maxMp:76,captureCap383:.24,habitat383:'天律の聖域・再探索「天秤の回廊」',lore383:'天律の月を祀る狐巫女の妹。蒼い双扇で姉カグラの剣を導き、舞いの合間にも仲間の傷を見逃さない。',counter383:'命中・速度支援で姉の狐火刃を通す。支援を解除し、火傷を浄化する。妹自身にも物理攻撃力がある。',skills:[
 skill('wind','蒼月の追い風',24,3,'味方全体の命中18%・速度18%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',effects:[{kind:'accuracyUp',value:.18,turns:2,allies:true},{kind:'spdUp',value:.18,turns:2,allies:true}],ai383:'rally'}),
 skill('fans','月下の双扇',16,1,'風属性1.25倍。火傷中には威力1.40倍。',{power:1.25,bonusVsStatus:{id:'burn',multiplier:1.4},ai383:'strike'}),
 skill('purify','月露の禊',22,3,'生存している味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'}),
 skill('moon','宵待ちの舞',23,3,'生存している味方全体のHPを16%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.16,ai383:'heal'})]},
 {key:'celes',name:'星糸の織姫セレス',rarity:'LR',element:'light',race:'golem',role:'controller',tacticRole383:'disruptor',stats:[182,17,49,28,36,30],maxMp:82,captureCap383:.18,habitat383:'理の中枢・再探索「輪廻の歯車」',lore383:'星図から舞台衣装を織る人形姫。妹機ルミナと同じ星核から生まれた。糸で敵の足取りを読み、妹の終演へ道を作る。',counter383:'ルミナとの同ラウンド2回目の連携が終演へ変化。2人目が動く前に片方を倒すか隔離して大技を止める。',skills:[
 skill('thread','星糸の仮縫い',24,2,'敵全体に光属性0.70倍の魔法攻撃。回避18%低下（2ターン）。',{power:.7,allEnemies:true,target:'敵全体',damageClass:'magic',effects:[{kind:'evasionDown',value:.18,turns:2,enemy:true}],ai383:'setup'}),
 skill('needle','星針の裁縫',23,1,'光属性1.40倍の魔法攻撃。回避低下中には威力1.40倍。',{power:1.4,damageClass:'magic',bonusVsEffect:{kind:'evasionDown',multiplier:1.4},ai383:'strike'}),
 skill('veil','星幕の仕立て',26,3,'味方全体に最大HP16%の障壁、防御18%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.16,effects:[{kind:'defUp',value:.18,turns:2,allies:true}],ai383:'shield'}),
 skill('unpick','加護の糸切り',25,3,'光属性1.05倍の魔法攻撃。敵陣の強化を1つ解除。',{power:1.05,damageClass:'magic',dispelEnemyBuff:true,ai383:'dispel'})]},
 {key:'lumina',name:'星刃の舞姫ルミナ',rarity:'神話',element:'light',race:'golem',role:'assassin',tacticRole383:'striker',stats:[218,58,22,33,30,33],maxMp:88,captureCap383:.12,habitat383:'理の中枢・再探索「輪廻の歯車」',lore383:'黒金の舞台衣装をまとう人形姫。姉機セレスの紡ぐ星糸だけを信じ、二本の星刃で記録の終わりを演じる。',counter383:'セレスの回避低下と終演の大技を利用する。能力低下を浄化し、障壁だけに頼らず二人目の連携を阻止する。',skills:[
 skill('rehearsal','開演の合図',27,3,'味方全体の攻撃20%・命中18%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',effects:[{kind:'atkUp',value:.2,turns:2,allies:true},{kind:'accuracyUp',value:.18,turns:2,allies:true}],ai383:'rally'}),
 skill('cut','星刃・花舞',28,1,'光属性1.60倍。回避低下中には威力1.45倍。',{power:1.6,bonusVsEffect:{kind:'evasionDown',multiplier:1.45},ai383:'strike'}),
 skill('shower','終幕の流星',29,2,'敵全体に光属性0.95倍。防御を30%無視。',{power:.95,allEnemies:true,target:'敵全体',defenseIgnore:.3,ai383:'fallback'}),
 skill('curtsy','星姫の礼',24,3,'自身に最大HP18%の障壁、回避20%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.18,effects:[{kind:'evasionUp',value:.2,turns:2}],ai383:'stance'})]}
];
export const CHAPTER_TWO_SPECIES386=Object.freeze(Object.fromEntries(creatures.map(c=>{
 const id=`ch2_${c.key}`,[hp,atk,matk,def,mdef,spd]=c.stats;
 const skills=c.skills.map(s=>({...s,id:`${id}__${s.key}`,element:c.element,damageClass:s.damageClass??'physical'}));
 return[id,{...c,id,emoji:'✦',chapterTwoOnly:true,chapterTwoSet386:true,fieldEncounter:false,gachaExcluded:true,minFloor:Number.MAX_SAFE_INTEGER,captureRate:c.captureCap383,acquisition:[c.habitat383,'捕獲'],growth:{hp:1,atk:1,def:1,spd:1},baseStats:{hp,atk,matk,def,mdef,spd,crit:8,evasion:8,accuracy:112},rankNames:[c.name,c.name,c.name,c.name],skills,authoredSkills:skills}];
})));
