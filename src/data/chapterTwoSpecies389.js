// Chapter II additional installment 7: cute faces, ornate armor, distinct weapon roles.
const skill=(key,name,mp,cooldown,description,fields={})=>({key,name,mp,cooldown,description,type:'attack',power:1,target:'敵単体',tag:'第二章固有',chapterTwoSet389:true,unlock:{type:'level',value:1},...fields});
const poison={id:'poison',name:'毒',chance:.85,turns:3,power:.025};
const creatures=[
 {key:'lumea',name:'封書の小剣姫ルメア',rarity:'N',element:'wind',race:'spirit',role:'support',tacticRole383:'support',stats:[114,24,18,20,24,25],maxMp:48,captureCap383:.65,habitat383:'境界の森・再探索「倒木の小径」',lore383:'届かなかった手紙から生まれた封書の精霊。封樹に絡む呪いを小剣でほどき、忘れられた言葉を持ち主へ返す。',counter383:'低ランクでも全体浄化を持つ支援役。浄化の再使用待ちを狙って弱体を重ねる。',skills:[
 skill('letter','封書・霞の一筆',9,2,'風属性0.95倍。命中15%低下（2ターン）。',{power:.95,effects:[{kind:'accuracyDown',value:.15,turns:2,enemy:true}],ai383:'setup'}),
 skill('seal','封蝋をほどく剣',13,3,'生存味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'}),
 skill('reply','返書の祝福',12,3,'生存味方全体のHP12%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.12,ai383:'heal'}),
 skill('quill','風筆の追い書き',10,1,'風属性1.15倍。命中低下中には威力1.35倍。',{power:1.15,bonusVsEffect:{kind:'accuracyDown',multiplier:1.35},ai383:'strike'})]},
 {key:'nevia',name:'藤影の鎖姫ネヴィア',rarity:'R',element:'dark',race:'demon',role:'controller',tacticRole383:'disruptor',stats:[138,33,16,22,22,30],maxMp:56,captureCap383:.55,habitat383:'境界の森・再探索「西の封印樹」',lore383:'封印樹の陰に咲く藤から生まれた双子の姉。呪毒を編んだ鎖で逃げ道を閉じ、妹エルミナが断つべき根を示す。',counter383:'毒を入れてから双子の連撃を強める。毒を治すか、鎖役を先に捕獲・撃破して連携を断つ。',skills:[
 skill('venom','藤影・呪毒の鎖',12,2,'闇属性1.00倍。85%で毒を3ターン付与。',{power:1,status:poison,ai383:'setup'}),
 skill('bind','藤鎖の縫い留め',14,2,'闇属性1.05倍。回避18%低下（2ターン）。',{power:1.05,effects:[{kind:'evasionDown',value:.18,turns:2,enemy:true}],ai383:'disrupt'}),
 skill('reel','鎖刃の引き裂き',14,1,'闇属性1.30倍。毒状態の敵には威力1.45倍。',{power:1.3,bonusVsStatus:{id:'poison',multiplier:1.45},ai383:'strike'}),
 skill('cloak','影藤の外套',15,3,'自身に最大HP16%の障壁、回避18%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.16,effects:[{kind:'evasionUp',value:.18,turns:2}],ai383:'stance'})]},
 {key:'elmina',name:'白藤の鎌姫エルミナ',rarity:'SR',element:'wind',race:'demon',role:'assassin',tacticRole383:'striker',stats:[149,40,15,24,20,29],maxMp:60,captureCap383:.42,habitat383:'境界の森・再探索「西の封印樹」',lore383:'白藤の花に宿る双子の妹。姉の鎖が縫い留めた呪いを、大きな翠鎌で根元から刈り取る。',counter383:'姉の毒から単体強打と連撃を重ねる。毒を残したまま回復に頼ると、連携の回復阻害で追い込まれる。',skills:[
 skill('reap','白藤・呪根刈り',16,1,'風属性1.45倍。毒状態の敵には威力1.50倍。',{power:1.45,bonusVsStatus:{id:'poison',multiplier:1.5},ai383:'strike'}),
 skill('sweep','花鎌の旋風',19,2,'敵全体に風属性0.90倍、防御20%無視。',{power:.9,allEnemies:true,target:'敵全体',defenseIgnore:.2,ai383:'fallback'}),
 skill('wither','枯れ藤の切断',16,2,'風属性1.10倍。受けるHP回復30%低下（2ターン）。',{power:1.1,effects:[{kind:'healDown',value:.3,turns:2,enemy:true}],ai383:'healBlock'}),
 skill('bloom','白藤の覚悟',17,3,'自身に最大HP16%の障壁、攻撃18%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.16,effects:[{kind:'atkUp',value:.18,turns:2}],ai383:'stance'})]},
 {key:'calista',name:'蒼雷の槍姫カリスタ',rarity:'SSR',element:'lightning',race:'angel',role:'attack',tacticRole383:'striker',stats:[174,48,24,27,25,35],maxMp:76,captureCap383:.32,habitat383:'天律の聖域・再探索「因果の聖壇」',lore383:'天律の雷を槍へ閉じ込めた蒼き姉。妹ソレーヌの盾が避雷針となるとき、ふたりの雷は天空を穿つ一条へ変わる。',counter383:'姉妹の同ラウンド2回目の共鳴が全体大技に変わる。2人目の行動前に片方を止める。',skills:[
 skill('pierce','蒼雷・鎧穿ち',22,2,'雷属性1.20倍。防御20%低下（2ターン）。',{power:1.2,effects:[{kind:'defDown',value:.2,turns:2,enemy:true}],ai383:'setup'}),
 skill('bolt','蒼穹を貫く槍',24,1,'雷属性1.60倍。防御低下中には威力1.40倍。',{power:1.6,bonusVsEffect:{kind:'defDown',multiplier:1.4},ai383:'strike'}),
 skill('storm','雷槍の散華',26,2,'敵全体に雷属性0.95倍、防御20%無視。',{power:.95,allEnemies:true,target:'敵全体',defenseIgnore:.2,ai383:'fallback'}),
 skill('charge','蒼雷の纏装',22,3,'自身に最大HP16%の障壁、攻撃20%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.16,effects:[{kind:'atkUp',value:.2,turns:2}],ai383:'stance'})]},
 {key:'solenne',name:'金雷の盾姫ソレーヌ',rarity:'UR',element:'lightning',race:'angel',role:'tank',tacticRole383:'guardian',stats:[209,39,29,39,37,25],maxMp:86,captureCap383:.24,habitat383:'天律の聖域・再探索「因果の聖壇」',lore383:'姉の蒼雷を受け止める黄金の盾姫。傷を恐れず盾を掲げ、集めた雷を次の一撃へ送り返す。',counter383:'障壁・回復・浄化で姉の2回目の共鳴を支える。浄化直後の回復阻害と集中攻撃で守りを崩す。',skills:[
 skill('aegis','金雷・避雷の聖盾',26,3,'味方全体に最大HP18%の障壁、防御18%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.18,effects:[{kind:'defUp',value:.18,turns:2,allies:true}],ai383:'shield'}),
 skill('grace','黄金の帰雷',24,3,'生存味方全体のHP18%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.18,ai383:'heal'}),
 skill('ground','雷盾の押し返し',22,2,'雷属性1.15倍。攻撃20%低下（2ターン）。',{power:1.15,effects:[{kind:'atkDown',value:.2,turns:2,enemy:true}],ai383:'setup'}),
 skill('clear','雷鳴の祓い',23,3,'生存味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'})]},
 {key:'meliora',name:'冥鍵の剣姫メリオラ',rarity:'LR',element:'dark',race:'golem',role:'attack',tacticRole383:'striker',stats:[207,57,29,32,33,34],maxMp:88,captureCap383:.18,habitat383:'理の中枢・再探索「修復の中枢」',lore383:'中枢の閉じた記録を守る冥鍵の姉。妹エリゼルと対になる鍵剣で、偽りの加護だけを選んで断ち切る。',counter383:'強化を剥がして4連撃する双鍵の攻撃役。強化だけで耐えず、一方を集中攻撃して連携を止める。',skills:[
 skill('unlock','冥鍵・錠断の剣',28,1,'闇属性1.65倍。攻撃低下中には威力1.45倍。',{power:1.65,bonusVsEffect:{kind:'atkDown',multiplier:1.45},ai383:'strike'}),
 skill('false','偽冠の切断',27,2,'闇属性1.40倍。強化中の敵には威力1.45倍。',{power:1.4,bonusVsEnemyBuff:{multiplier:1.45},ai383:'buffStrike'}),
 skill('gate','冥門の開刃',30,2,'敵全体に闇属性1.00倍、防御25%無視。',{power:1,allEnemies:true,target:'敵全体',defenseIgnore:.25,ai383:'fallback'}),
 skill('lock','魂鎖の封緘',28,3,'闇属性1.10倍。蘇生を封印（2ターン）。',{power:1.1,effects:[{kind:'reviveSeal',value:1,turns:2,enemy:true}],ai383:'reviveBlock'})]},
 {key:'elyselle',name:'聖鍵の冠姫エリゼル',rarity:'神話',element:'light',race:'golem',role:'magic',tacticRole383:'leader',stats:[229,30,59,37,43,30],maxMp:98,captureCap383:.12,habitat383:'理の中枢・再探索「修復の中枢」',lore383:'記録の門を開く聖鍵の妹。失われた王冠を受け継ぎ、姉の鍵剣と同時に回すことで中枢の封界を解く。',counter383:'攻撃低下で姉の強打を助け、障壁・回復・浄化で連携を維持。蘇生封印と回復阻害を使い分けて二人を分断する。',skills:[
 skill('edict','聖鍵・静謐の勅令',29,2,'光属性1.15倍の魔法攻撃。攻撃22%低下（2ターン）。',{power:1.15,damageClass:'magic',effects:[{kind:'atkDown',value:.22,turns:2,enemy:true}],ai383:'setup'}),
 skill('sanctum','白門の聖域',31,3,'味方全体に最大HP20%の障壁、命中20%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.2,effects:[{kind:'accuracyUp',value:.2,turns:2,allies:true}],ai383:'shield'}),
 skill('restore','記憶を継ぐ祈り',30,3,'生存味方全体のHP20%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.2,ai383:'heal'}),
 skill('release','聖鍵の解呪',28,3,'生存味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'})]}
];
export const CHAPTER_TWO_SPECIES389=Object.freeze(Object.fromEntries(creatures.map(c=>{
 const id=`ch2_${c.key}`,[hp,atk,matk,def,mdef,spd]=c.stats;
 const skills=c.skills.map(s=>({...s,id:`${id}__${s.key}`,element:c.element,damageClass:s.damageClass??'physical'}));
 return[id,{...c,id,emoji:'✦',chapterTwoOnly:true,chapterTwoSet389:true,fieldEncounter:false,gachaExcluded:true,minFloor:Number.MAX_SAFE_INTEGER,captureRate:c.captureCap383,acquisition:[c.habitat383,'捕獲'],growth:{hp:1,atk:1,def:1,spd:1},baseStats:{hp,atk,matk,def,mdef,spd,crit:8,evasion:8,accuracy:112},rankNames:[c.name,c.name,c.name,c.name],skills,authoredSkills:skills}];
})));
