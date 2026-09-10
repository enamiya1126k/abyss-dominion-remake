// Chapter II installment 8: frost shatter, guarded reprisal, shared spell charge.
const skill=(key,name,mp,cooldown,description,fields={})=>({key,name,mp,cooldown,description,type:'attack',power:1,target:'敵単体',tag:'第二章固有',chapterTwoSet390:true,unlock:{type:'level',value:1},...fields});
const creatures=[
 {key:'miretta',name:'繕糸の針姫ミレッタ',rarity:'N',element:'wind',race:'spirit',role:'support',tacticRole383:'support',stats:[118,25,17,21,23,26],maxMp:50,captureCap383:.65,habitat383:'黒根の侵食域・再探索「焼け跡の根脈」',lore383:'焼けた根脈に残る記憶を縫い合わせる糸の精霊。針剣を振るうたび、裂けた外套も仲間の傷も小さく繕われる。',counter383:'低ランクの浄化・回復役。味方の補助にも便利だが、大技を受け止める耐久力は低い。',skills:[
 skill('needle','繕糸・ほつれ刺し',9,2,'風属性1.00倍。命中15%低下（2ターン）。',{effects:[{kind:'accuracyDown',value:.15,turns:2,enemy:true}],ai383:'setup'}),
 skill('mend','記憶の縫い直し',13,3,'生存味方全体のHP14%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.14,ai383:'heal'}),
 skill('unpick','呪糸ほどき',13,3,'生存味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'}),
 skill('hem','翠糸の裾結界',12,3,'味方全体に最大HP10%の障壁、回避12%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.1,effects:[{kind:'evasionUp',value:.12,turns:2,allies:true}],ai383:'shield'})]},
 {key:'iselle',name:'氷紋の杖姫イゼル',rarity:'R',element:'ice',race:'spirit',role:'magic',tacticRole383:'disruptor',stats:[134,16,35,20,28,31],maxMp:60,captureCap383:.55,habitat383:'深淵の回廊・再探索「忘却の鎖道」',lore383:'忘れられた鎖の記憶を氷紋に封じる双子の姉。妹ヴィレルの槌が砕く瞬間まで、氷の中に呪いを閉じ込める。',counter383:'単体凍結から双子の連撃を強化する。浄化や凍結耐性で粉砕の準備を崩せる。',skills:[
 skill('seal','氷紋・封晶の刻印',15,2,'氷属性0.95倍の魔法攻撃。75%で凍結（1ターン）。',{power:.95,damageClass:'magic',status:{id:'freeze',name:'凍結',chance:.75,turns:1,power:0},ai383:'setup'}),
 skill('snow','蒼雪の鎖',16,2,'敵全体に氷属性0.80倍の魔法攻撃。速度18%低下（2ターン）。',{power:.8,damageClass:'magic',allEnemies:true,target:'敵全体',effects:[{kind:'spdDown',value:.18,turns:2,enemy:true}],ai383:'disrupt'}),
 skill('prism','凍晶の追矢',13,1,'氷属性1.20倍の魔法攻撃。凍結中には威力1.50倍。',{power:1.2,damageClass:'magic',bonusVsStatus:{id:'freeze',multiplier:1.5},ai383:'strike'}),
 skill('veil','氷絹の外套',16,3,'味方全体に最大HP12%の障壁、命中15%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.12,effects:[{kind:'accuracyUp',value:.15,turns:2,allies:true}],ai383:'shield'})]},
 {key:'virelle',name:'砕氷の槌姫ヴィレル',rarity:'SR',element:'ice',race:'spirit',role:'attack',tacticRole383:'striker',stats:[168,44,15,30,22,24],maxMp:62,captureCap383:.42,habitat383:'深淵の回廊・再探索「忘却の鎖道」',lore383:'氷紋と対になる砕晶の槌を持つ妹。姉が凍らせた呪いだけを選び抜き、鎖ごと砕いて記憶を解き放つ。',counter383:'凍結中の相手への槌が強烈。姉を先に止めるか、氷を治してから攻め返す。',skills:[
 skill('shatter','砕氷・紫晶崩し',18,1,'氷属性1.55倍、防御25%無視。凍結中には威力1.60倍。',{power:1.55,defenseIgnore:.25,bonusVsStatus:{id:'freeze',multiplier:1.6},ai383:'strike'}),
 skill('fracture','鎖砕きの一槌',16,2,'氷属性1.15倍。防御20%低下（2ターン）。',{power:1.15,effects:[{kind:'defDown',value:.2,turns:2,enemy:true}],ai383:'setup'}),
 skill('avalanche','紫雪の崩落',20,2,'敵全体に氷属性0.95倍、防御15%無視。',{power:.95,allEnemies:true,target:'敵全体',defenseIgnore:.15,ai383:'fallback'}),
 skill('brace','砕晶の構え',16,3,'自身に最大HP18%の障壁、攻撃18%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.18,effects:[{kind:'atkUp',value:.18,turns:2}],ai383:'stance'})]},
 {key:'rostia',name:'黒盾の誓姫ロスティア',rarity:'SSR',element:'dark',race:'golem',role:'tank',tacticRole383:'guardian',stats:[211,38,22,42,34,25],maxMp:78,captureCap383:.32,habitat383:'黒根の侵食域・再探索「吸命の荒野」',lore383:'かつて荒野を護った城壁の記憶が人の姿を得た姉。盾に刻まれた誓いを守り、妹の紅剣が帰る場所となる。',counter383:'ペア共鳴後は護誓中の姉妹への攻撃に反撃が返る。軽減の強化を解除するか、片方を集中して倒す。',skills:[
 skill('bastion','黒盾・不退の城壁',25,3,'味方全体に最大HP20%の障壁、防御20%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.2,effects:[{kind:'defUp',value:.2,turns:2,allies:true}],ai383:'shield'}),
 skill('rebuke','誓盾の押し返し',20,2,'闇属性1.20倍。攻撃20%低下（2ターン）。',{power:1.2,effects:[{kind:'atkDown',value:.2,turns:2,enemy:true}],ai383:'setup'}),
 skill('vow','帰還を待つ誓い',23,3,'生存味方全体のHP18%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.18,ai383:'heal'}),
 skill('clean','黒冠の祓い',23,3,'生存味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'})]},
 {key:'althea',name:'紅剣の返誓姫アルテア',rarity:'UR',element:'fire',race:'golem',role:'attack',tacticRole383:'striker',stats:[193,54,23,31,28,32],maxMp:84,captureCap383:.24,habitat383:'黒根の侵食域・再探索「吸命の荒野」',lore383:'姉の城壁へ必ず帰ると誓った紅剣の妹。黒盾が受け止めた憎しみを、鋭い紅の剣閃で断ち切る。',counter383:'姉の攻撃低下に合わせて強打。護誓中の反撃は各姉妹1ラウンド1回で、複製個体では増やせない。',skills:[
 skill('return','返誓・紅剣一閃',25,1,'火属性1.65倍。攻撃低下中には威力1.45倍。',{power:1.65,bonusVsEffect:{kind:'atkDown',multiplier:1.45},ai383:'strike'}),
 skill('sunder','偽りの誓い断ち',24,2,'火属性1.35倍。強化中の敵には威力1.45倍。',{power:1.35,bonusVsEnemyBuff:{multiplier:1.45},ai383:'buffStrike'}),
 skill('sweep','紅冠の剣雨',27,2,'敵全体に火属性1.00倍、防御20%無視。',{allEnemies:true,target:'敵全体',defenseIgnore:.2,ai383:'fallback'}),
 skill('resolve','帰還の決意',23,3,'自身に最大HP18%の障壁、攻撃20%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.18,effects:[{kind:'atkUp',value:.2,turns:2}],ai383:'stance'})]},
 {key:'sephira',name:'星詠の魔導姫セフィラ',rarity:'LR',element:'dark',race:'angel',role:'magic',tacticRole383:'disruptor',stats:[208,22,61,30,38,33],maxMp:100,captureCap383:.18,habitat383:'理の中枢・再探索「輪廻の歯車」',lore383:'中枢の夜空に記された呪文を読む星詠の姉。妹の天環へ一節ずつ魔力を送り、三節がそろうと禁じられた星門を開く。',counter383:'姉妹の共鳴3回目で合体魔法。蓄積はラウンドをまたぐため、準備中に片方を止めたい。',skills:[
 skill('night','星詠・宵の一節',28,2,'闇属性1.20倍の魔法攻撃。防御22%低下（2ターン）。',{power:1.2,damageClass:'magic',effects:[{kind:'defDown',value:.22,turns:2,enemy:true}],ai383:'setup'}),
 skill('meteor','深星の落款',30,1,'闇属性1.65倍の魔法攻撃。防御低下中には威力1.45倍。',{power:1.65,damageClass:'magic',bonusVsEffect:{kind:'defDown',multiplier:1.45},ai383:'strike'}),
 skill('script','星屑の祓書',27,3,'生存味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'}),
 skill('orbit','宵星の防陣',28,3,'味方全体に最大HP16%の障壁、命中18%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.16,effects:[{kind:'accuracyUp',value:.18,turns:2,allies:true}],ai383:'shield'})]},
 {key:'astrelle',name:'天環の魔導姫アストレル',rarity:'神話',element:'light',race:'angel',role:'magic',tacticRole383:'leader',stats:[231,23,64,34,43,30],maxMp:108,captureCap383:.12,habitat383:'理の中枢・再探索「輪廻の歯車」',lore383:'姉が読んだ星の呪文を天環へ織り込む妹。夜と暁の魔力が重なると、輪廻の歯車さえ照らす巨大な星門が開く。',counter383:'回復で姉を守り、蓄積3回目の合体魔法につなぐ。回復阻害と集中攻撃で完成を阻止する。',skills:[
 skill('dawn','天環・暁の一節',30,2,'光属性1.25倍の魔法攻撃。攻撃22%低下（2ターン）。',{power:1.25,damageClass:'magic',effects:[{kind:'atkDown',value:.22,turns:2,enemy:true}],ai383:'setup'}),
 skill('judgment','白星の裁定',32,1,'光属性1.70倍の魔法攻撃。攻撃低下中には威力1.40倍。',{power:1.7,damageClass:'magic',bonusVsEffect:{kind:'atkDown',multiplier:1.4},ai383:'strike'}),
 skill('grace','明け星の祝福',30,3,'生存味方全体のHP22%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.22,ai383:'heal'}),
 skill('halo','天環の聖域',31,3,'味方全体に最大HP20%の障壁、防御20%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.2,effects:[{kind:'defUp',value:.2,turns:2,allies:true}],ai383:'shield'})]}
];
export const CHAPTER_TWO_SPECIES390=Object.freeze(Object.fromEntries(creatures.map(c=>{
 const id=`ch2_${c.key}`,[hp,atk,matk,def,mdef,spd]=c.stats;
 const skills=c.skills.map(s=>({...s,id:`${id}__${s.key}`,element:c.element,damageClass:s.damageClass??'physical'}));
 return[id,{...c,id,emoji:'✦',chapterTwoOnly:true,chapterTwoSet390:true,fieldEncounter:false,gachaExcluded:true,minFloor:Number.MAX_SAFE_INTEGER,captureRate:c.captureCap383,acquisition:[c.habitat383,'捕獲'],growth:{hp:1,atk:1,def:1,spd:1},baseStats:{hp,atk,matk,def,mdef,spd,crit:8,evasion:8,accuracy:112},rankNames:[c.name,c.name,c.name,c.name],skills,authoredSkills:skills}];
})));
