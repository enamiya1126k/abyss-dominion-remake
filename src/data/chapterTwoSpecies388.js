// Chapter II additional installment 6: right-facing heroines and three complementary pairs.
const skill=(key,name,mp,cooldown,description,fields={})=>({key,name,mp,cooldown,description,type:'attack',power:1,target:'敵単体',tag:'第二章固有',chapterTwoSet388:true,unlock:{type:'level',value:1},...fields});
const creatures=[
 {key:'fiora',name:'夜灯の従騎フィオラ',rarity:'N',element:'wind',race:'spirit',role:'support',tacticRole383:'support',stats:[116,25,13,22,19,25],maxMp:46,captureCap383:.65,habitat383:'境界の森・再探索「東の封印樹」',lore383:'境界の森に残された誓いの灯を守る従騎。小さな剣とランタンを頼りに、主を失った甲冑たちを夜明けへ導く。',counter383:'命中支援と攻撃低下で前衛を支える。従騎を先に止めると誓姫の攻めが不安定になる。',skills:[
 skill('lamp','迷い照らす夜灯',11,3,'味方全体の命中18%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',effects:[{kind:'accuracyUp',value:.18,turns:2,allies:true}],ai383:'rally'}),
 skill('moth','灯蛾の牽制',9,2,'風属性0.95倍。攻撃15%低下（2ターン）。',{power:.95,effects:[{kind:'atkDown',value:.15,turns:2,enemy:true}],ai383:'setup'}),
 skill('guard','従騎の小さな盾',12,3,'本人以外へ開戦時HP8%の盾を2ラウンド。特殊能力と1ラウンド1回を共有。',{type:'buff',power:0,target:'味方全体',paperShield410:true,partyShieldRate:.08,ai383:'shield'}),
 skill('path','夜道の一閃',10,1,'風属性1.15倍。攻撃低下中には威力1.35倍。',{power:1.15,bonusVsEffect:{kind:'atkDown',multiplier:1.35},ai383:'strike'})]},
 {key:'lyriet',name:'蒼刃の誓姫リリエット',rarity:'R',element:'ice',race:'golem',role:'attack',tacticRole383:'striker',stats:[136,34,13,24,20,28],maxMp:54,captureCap383:.55,habitat383:'黒根の侵食域・再探索「飢えた根脈」',lore383:'失われた騎士団の誓約から生まれた蒼い自動人形。双子の妹ロゼットに背を預け、退く者を守るために剣を振るう。',counter383:'妹の障壁と共鳴で攻守を整える剣士。速度低下を浄化し、共鳴相手を集中攻撃して分断する。',skills:[
 skill('frost','蒼誓・凍てる切先',12,2,'氷属性1.05倍。速度18%低下（2ターン）。',{power:1.05,effects:[{kind:'spdDown',value:.18,turns:2,enemy:true}],ai383:'setup'}),
 skill('oath','誓剣・蒼き追討',14,1,'氷属性1.40倍。速度低下中には威力1.45倍。',{power:1.4,bonusVsEffect:{kind:'spdDown',multiplier:1.45},ai383:'strike'}),
 skill('rally','退かぬ誓い',15,3,'味方全体の攻撃18%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',effects:[{kind:'atkUp',value:.18,turns:2,allies:true}],ai383:'rally'}),
 skill('arc','蒼刃の半月',17,2,'敵全体に氷属性0.85倍、防御15%無視。',{power:.85,allEnemies:true,target:'敵全体',defenseIgnore:.15,ai383:'fallback'})]},
 {key:'rosette',name:'紅盾の誓姫ロゼット',rarity:'SR',element:'fire',race:'golem',role:'tank',tacticRole383:'guardian',stats:[170,30,15,34,28,21],maxMp:64,captureCap383:.42,habitat383:'黒根の侵食域・再探索「飢えた根脈」',lore383:'姉リリエットと同じ誓約から生まれた紅い自動人形。守るべき者がいなくなった今も、姉の帰る場所として盾を掲げる。',counter383:'障壁と全体回復で前衛を維持する盾役。防御低下と回復阻害を重ね、障壁を張り直す前に崩す。',skills:[
 skill('bastion','紅誓・帰る場所',18,3,'味方全体に最大HP16%の障壁、防御18%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.16,effects:[{kind:'defUp',value:.18,turns:2,allies:true}],ai383:'shield'}),
 skill('shelter','誓いの灯火',18,3,'生存味方全体のHP16%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.16,ai383:'heal'}),
 skill('bash','紅盾の押し返し',12,2,'火属性1.00倍。攻撃18%低下（2ターン）。',{power:1,effects:[{kind:'atkDown',value:.18,turns:2,enemy:true}],ai383:'setup'}),
 skill('return','帰還の剣',14,1,'火属性1.30倍。速度低下中には威力1.45倍。',{power:1.3,bonusVsEffect:{kind:'spdDown',multiplier:1.45},ai383:'strike'})]},
 {key:'noctelle',name:'黒薔薇の刃姫ノクテル',rarity:'SSR',element:'dark',race:'demon',role:'attack',tacticRole383:'striker',stats:[162,46,22,25,23,33],maxMp:72,captureCap383:.32,habitat383:'深淵の回廊・再探索「眠りの裁定」',lore383:'深淵の聖堂で影の薔薇を守る姉。妹オーリアンが光を失わぬよう、呪いをすべて黒い剣へ封じている。',counter383:'妹の防御低下に大剣の強打を合わせる。どちらかがHP40%以下だと共鳴が強まるため、回復阻害から素早く仕留める。',skills:[
 skill('thorn','黒薔薇・断罪の棘',22,1,'闇属性1.55倍。防御低下中には威力1.50倍。',{power:1.55,bonusVsEffect:{kind:'defDown',multiplier:1.5},ai383:'strike'}),
 skill('wither','萎れる加護',21,2,'闇属性1.10倍。受けるHP回復35%低下（2ターン）。',{power:1.1,effects:[{kind:'healDown',value:.35,turns:2,enemy:true}],ai383:'healBlock'}),
 skill('pierce','黒棘の簒奪',24,2,'闇属性1.30倍。強化中の敵には威力1.50倍。',{power:1.3,bonusVsEnemyBuff:{multiplier:1.5},ai383:'buffStrike'}),
 skill('veil','夜薔薇の外套',20,3,'自身に最大HP18%の障壁、回避18%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.18,effects:[{kind:'evasionUp',value:.18,turns:2}],ai383:'stance'})]},
 {key:'auriane',name:'白薔薇の衛姫オーリアン',rarity:'UR',element:'light',race:'angel',role:'support',tacticRole383:'support',stats:[195,40,28,34,36,27],maxMp:84,captureCap383:.24,habitat383:'深淵の回廊・再探索「眠りの裁定」',lore383:'白い薔薇に記憶を託す聖堂の妹。姉ノクテルの剣に封じられた呪いを知り、戦いが終わるたびにその手を包む。',counter383:'浄化・回復・障壁を使い分ける守護役。姉妹が窮地になると回復を伴う連撃を放つ。浄化の直後に回復阻害を入れる。',skills:[
 skill('petal','白薔薇・鎧ほどく光',22,2,'光属性1.05倍。防御22%低下（2ターン）。',{power:1.05,effects:[{kind:'defDown',value:.22,turns:2,enemy:true}],ai383:'setup'}),
 skill('haven','薔薇園の聖壁',25,3,'味方全体に最大HP20%の障壁。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.2,ai383:'shield'}),
 skill('bloom','枯れぬ白薔薇',26,3,'生存味方全体のHP20%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.2,ai383:'heal'}),
 skill('prayer','暁の祈り',23,3,'生存味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'})]},
 {key:'eirene',name:'蒼刻の星姫エイレーネ',rarity:'LR',element:'ice',race:'spirit',role:'magic',tacticRole383:'disruptor',stats:[204,26,55,30,39,36],maxMp:90,captureCap383:.18,habitat383:'天律の聖域・再探索「生命の聖壇」',lore383:'深淵天文台の過去を記録する蒼刻の姉。止まった砂時計を抱え、妹イリデルが選ぶ未来へ一秒だけ道を開く。',counter383:'速度低下と防御低下がそろうと双刻の共鳴が強化。弱体を浄化するか一方を止め、星律の成立を防ぐ。',skills:[
 skill('still','蒼刻・止まる秒針',26,2,'敵全体に氷属性0.80倍の魔法攻撃。速度22%低下（2ターン）。',{power:.8,damageClass:'magic',allEnemies:true,target:'敵全体',effects:[{kind:'spdDown',value:.22,turns:2,enemy:true}],ai383:'setup'}),
 skill('rewind','失秒の星刃',28,1,'氷属性1.55倍の魔法攻撃。防御低下中には威力1.50倍。',{power:1.55,damageClass:'magic',bonusVsEffect:{kind:'defDown',multiplier:1.5},ai383:'strike'}),
 skill('hourglass','蒼砂の再構成',27,3,'生存味方全体のHP18%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.18,ai383:'heal'}),
 skill('silence','凍星の封書',28,3,'氷属性1.15倍の魔法攻撃。敵陣の強化を1つ解除。',{power:1.15,damageClass:'magic',dispelEnemyBuff:true,ai383:'dispel'})]},
 {key:'iridelle',name:'緋刻の星姫イリデル',rarity:'神話',element:'fire',race:'spirit',role:'attack',tacticRole383:'leader',stats:[225,62,34,37,33,35],maxMp:96,captureCap383:.12,habitat383:'天律の聖域・再探索「生命の聖壇」',lore383:'深淵天文台で未来の星を刻む緋刻の妹。姉の止めた一秒を刃へ変え、誰も選ばなかった明日を切り拓く。',counter383:'防御を崩して姉の魔法を通し、速度低下した相手を大剣で追討する。姉妹の弱体を同時に残さないことが攻略の鍵。',skills:[
 skill('advance','緋刻・裂ける時環',29,2,'敵全体に火属性0.85倍。防御22%低下（2ターン）。',{power:.85,allEnemies:true,target:'敵全体',effects:[{kind:'defDown',value:.22,turns:2,enemy:true}],ai383:'setup'}),
 skill('future','未明を拓く星剣',31,1,'火属性1.70倍。速度低下中には威力1.50倍。',{power:1.7,bonusVsEffect:{kind:'spdDown',multiplier:1.5},ai383:'strike'}),
 skill('orbit','双刻の星環',29,3,'味方全体に最大HP18%の障壁、命中20%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.18,effects:[{kind:'accuracyUp',value:.2,turns:2,allies:true}],ai383:'shield'}),
 skill('dawn','未来への解呪',28,3,'生存味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'})]}
];
export const CHAPTER_TWO_SPECIES388=Object.freeze(Object.fromEntries(creatures.map(c=>{
 const id=`ch2_${c.key}`,[hp,atk,matk,def,mdef,spd]=c.stats;
 const skills=c.skills.map(s=>({...s,id:`${id}__${s.key}`,element:c.element,damageClass:s.damageClass??'physical'}));
 return[id,{...c,id,emoji:'✦',chapterTwoOnly:true,chapterTwoSet388:true,fieldEncounter:false,gachaExcluded:true,minFloor:Number.MAX_SAFE_INTEGER,captureRate:c.captureCap383,acquisition:[c.habitat383,'捕獲'],growth:{hp:1,atk:1,def:1,spd:1},baseStats:{hp,atk,matk,def,mdef,spd,crit:8,evasion:8,accuracy:112},rankNames:[c.name,c.name,c.name,c.name],skills,authoredSkills:skills}];
})));
