import {MOTHER_SPECIES422} from '../primordial/Mother422.js';
// Installment ten: dream harvest, dragon dispel and a low-HP crown finisher.
const skill=(key,name,mp,cooldown,description,fields={})=>({key,name,mp,cooldown,description,type:'attack',power:1,target:'敵単体',tag:'第二章固有',chapterTwoSet392:true,unlock:{type:'level',value:1},...fields});
const creatures=[
 {key:'tillea',name:'栞の書姫ティレア',rarity:'N',element:'wind',race:'spirit',role:'support',tacticRole383:'support',stats:[120,25,20,22,25,27],maxMp:52,captureCap383:.65,habitat383:'黒根の侵食域・再探索「飢えた根脈」（再訪で交代）',lore383:'侵食された書庫から逃れた栞の精霊。羽根の短剣で呪文を書き足し、夢に迷う双子の帰る頁を守る。',counter383:'低燃費で浄化と回復を担当。命中低下を治して支援役を先に崩そう。',skills:[
 skill('quill','栞刃・墨霞の一筆',9,2,'風属性1.00倍。命中16%低下（2ターン）。',{effects:[{kind:'accuracyDown',value:.16,turns:2,enemy:true}],ai383:'setup'}),
 skill('page','帰り道の頁',14,3,'生存味方全体のHP15%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.15,ai383:'heal'}),
 skill('erase','呪文の消し跡',12,3,'生存味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'}),
 skill('bookmark','迷わぬ栞',12,3,'味方全体に最大HP10%の障壁、命中15%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.1,effects:[{kind:'accuracyUp',value:.15,turns:2,allies:true}],ai383:'shield'})]},
 {key:'morina',name:'幻眠の扇姫モリナ',rarity:'R',element:'dark',race:'spirit',role:'magic',tacticRole383:'disruptor',stats:[135,17,36,21,28,33],maxMp:62,captureCap383:.55,habitat383:'黒根の侵食域・再探索「飢えた根脈」（再訪で交代）',lore383:'侵食された者の悪夢を扇へ吸い込む双子の姉。妹が刈り取れるよう、夢の輪郭を紫の光で浮かび上がらせる。',counter383:'睡眠が夢刈り連携の起点。睡眠耐性や姉への集中攻撃が有効。',skills:[
 skill('lull','幻眠・夢渡りの扇',15,2,'闇属性0.80倍の魔法攻撃。75%で睡眠（1ターン）。',{power:.8,damageClass:'magic',status:{id:'sleep',name:'睡眠',chance:.75,turns:1,power:0},ai383:'setup'}),
 skill('mist','宵霞の帳',17,2,'敵全体に闇属性0.75倍の魔法攻撃。攻撃15%低下（2ターン）。',{power:.75,damageClass:'magic',allEnemies:true,target:'敵全体',effects:[{kind:'atkDown',value:.15,turns:2,enemy:true}],ai383:'disrupt'}),
 skill('dream','夢底への誘い',14,1,'闇属性1.20倍の魔法攻撃。睡眠中には威力1.50倍。',{power:1.2,damageClass:'magic',bonusVsStatus:{id:'sleep',multiplier:1.5},ai383:'strike'}),
 skill('veil','夢繭の羽衣',16,3,'味方全体に最大HP12%の障壁、回避15%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.12,effects:[{kind:'evasionUp',value:.15,turns:2,allies:true}],ai383:'shield'})]},
 {key:'elmize',name:'醒夢の鎌姫エルミゼ',rarity:'SR',element:'ice',race:'spirit',role:'attack',tacticRole383:'striker',stats:[169,45,17,29,24,28],maxMp:66,captureCap383:.42,habitat383:'黒根の侵食域・再探索「飢えた根脈」（再訪で交代）',lore383:'姉の扇が映した悪夢だけを刈る双子の妹。冷たい鎌は眠りを断ち、侵食された記憶に朝を戻す。',counter383:'眠った相手への一撃が強烈。浄化と物理軽減を用意し、双子の片方を止めよう。',skills:[
 skill('harvest','醒夢・悪夢刈り',19,1,'氷属性1.60倍、防御25%無視。睡眠中には威力1.65倍。',{power:1.6,defenseIgnore:.25,bonusVsStatus:{id:'sleep',multiplier:1.65},ai383:'strike'}),
 skill('seam','夢境の縫い目断ち',17,2,'氷属性1.15倍。回避20%低下（2ターン）。',{power:1.15,effects:[{kind:'evasionDown',value:.2,turns:2,enemy:true}],ai383:'setup'}),
 skill('reap','白夜の刈り払い',21,2,'敵全体に氷属性0.90倍。HP回復30%低下（2ターン）。',{power:.9,allEnemies:true,target:'敵全体',effects:[{kind:'healDown',value:.3,turns:2,enemy:true}],ai383:'fallback'}),
 skill('awaken','目覚めの誓い',17,3,'自身に最大HP18%の障壁、攻撃20%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.18,effects:[{kind:'atkUp',value:.2,turns:2}],ai383:'stance'})]},
 {key:'dracia',name:'黒鎖の竜姫ドラシア',rarity:'SSR',element:'fire',race:'dragon',role:'tank',tacticRole383:'guardian',stats:[216,42,20,44,34,25],maxMp:82,captureCap383:.32,habitat383:'天律の聖域・再探索「天秤の回廊」（再訪で交代）',lore383:'聖域に鎖で繋がれていた竜の姉。鎖を斧盾に鍛え直し、妹の白翼が飛び立つ道を守る。',counter383:'防御低下と強化解除で槍の道を開く。強化の重ね掛けだけに頼らず、回復役を狙って持久力を崩そう。',skills:[
 skill('chain','黒鎖・竜顎の斧',22,2,'火属性1.25倍。防御22%低下（2ターン）。',{power:1.25,effects:[{kind:'defDown',value:.22,turns:2,enemy:true}],ai383:'setup'}),
 skill('aegis','飛翔を護る竜盾',26,3,'味方全体に最大HP22%の障壁、被ダメージ18%軽減（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.22,effects:[{kind:'guard',value:.18,turns:2,allies:true}],ai383:'shield'}),
 skill('break','偽りの戒律砕き',23,2,'火属性1.20倍。敵の強化を1つ解除。',{power:1.2,dispelEnemyBuff:true,ai383:'dispel'}),
 skill('nest','帰るべき竜の巣',24,3,'生存味方全体のHP18%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.18,ai383:'heal'})]},
 {key:'rucie',name:'白翼の竜姫リュシエ',rarity:'UR',element:'ice',race:'dragon',role:'attack',tacticRole383:'striker',stats:[199,55,24,32,31,33],maxMp:88,captureCap383:.24,habitat383:'天律の聖域・再探索「天秤の回廊」（再訪で交代）',lore383:'姉が砕いた鎖を越えて飛ぶ白竜の妹。聖域の偽りの加護を蒼い槍で貫き、奪われた空を取り戻す。',counter383:'防御低下への槍撃と強化中への特効を持つ。浄化して姉妹を分断し、全体連携を止めよう。',skills:[
 skill('lance','白翼・蒼穹の穿槍',26,1,'氷属性1.65倍、防御20%無視。防御低下中には威力1.50倍。',{power:1.65,defenseIgnore:.2,bonusVsEffect:{kind:'defDown',multiplier:1.5},ai383:'strike'}),
 skill('breach','聖衣を裂く竜槍',25,2,'氷属性1.40倍。強化中の敵には威力1.50倍。',{power:1.4,bonusVsEnemyBuff:{multiplier:1.5},ai383:'buffStrike'}),
 skill('sky','天蓋を破る白翼',28,2,'敵全体に氷属性1.00倍、防御20%無視。',{allEnemies:true,target:'敵全体',defenseIgnore:.2,ai383:'fallback'}),
 skill('flight','解き放たれた翼',24,3,'自身に最大HP18%の障壁、回避20%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.18,effects:[{kind:'evasionUp',value:.2,turns:2}],ai383:'stance'})]},
 {key:'nemesia',name:'夜冠の剣姫ネメシア',rarity:'LR',element:'dark',race:'angel',role:'attack',tacticRole383:'disruptor',stats:[215,63,24,34,34,35],maxMp:104,captureCap383:.18,habitat383:'理の中枢・再探索「記録の中枢」（再訪で交代）',lore383:'消された歴史の夜を背負う黒冠の姉。妹に託す朝を護るため、記録の番人として最後の頁に立つ。',counter383:'防御と回復を崩し、姉妹2回目の連携で決着を狙う。HP35%以下は危険域。早めの回復と集中攻撃で対処。',skills:[
 skill('night','夜冠・記録の断章',29,2,'闇属性1.25倍。防御22%低下（2ターン）。',{power:1.25,effects:[{kind:'defDown',value:.22,turns:2,enemy:true}],ai383:'setup'}),
 skill('sever','黒頁の終剣',31,1,'闇属性1.70倍、防御25%無視。防御低下中には威力1.40倍。',{power:1.7,defenseIgnore:.25,bonusVsEffect:{kind:'defDown',multiplier:1.4},ai383:'strike'}),
 skill('elegy','夜に閉ざす挽歌',32,3,'敵全体に闇属性1.05倍。HP回復45%低下（2ターン）。',{power:1.05,allEnemies:true,target:'敵全体',effects:[{kind:'healDown',value:.45,turns:2,enemy:true}],ai383:'disrupt'}),
 skill('resolve','最後の頁を護る者',28,3,'自身に最大HP20%の障壁、攻撃22%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.2,effects:[{kind:'atkUp',value:.22,turns:2}],ai383:'stance'})]},
 {key:'everia',name:'暁冠の剣姫エヴェリア',rarity:'神話',element:'light',race:'angel',role:'attack',tacticRole383:'leader',stats:[239,66,26,39,39,31],maxMp:114,captureCap383:.12,habitat383:'理の中枢・再探索「記録の中枢」（再訪で交代）',lore383:'姉が護った歴史へ新しい朝を書き込む白冠の妹。二つの剣が重なる時、止まっていた記録が未来へ動き出す。',counter383:'回復と浄化で姉を護り、黒白の終剣へ繋ぐ。連携前に片方を倒すか、十分なHPを保って受けよう。',skills:[
 skill('dawn','暁冠・未来の一閃',31,2,'光属性1.30倍。攻撃22%低下（2ターン）。',{power:1.3,effects:[{kind:'atkDown',value:.22,turns:2,enemy:true}],ai383:'setup'}),
 skill('future','白頁に刻む聖剣',34,1,'光属性1.80倍、防御20%無視。防御低下中には威力1.45倍。',{power:1.8,defenseIgnore:.2,bonusVsEffect:{kind:'defDown',multiplier:1.45},ai383:'strike'}),
 skill('promise','続いてゆく朝の約束',32,3,'生存味方全体のHP24%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.24,ai383:'heal'}),
 skill('rewrite','白紙からの再記録',29,3,'生存味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'})]}
];
export const CHAPTER_TWO_SPECIES392=Object.freeze(Object.fromEntries(creatures.map(c=>{
 const id=`ch2_${c.key}`,[hp,atk,matk,def,mdef,spd]=c.stats,skills=c.skills.map(s=>({...s,id:`${id}__${s.key}`,element:c.element,damageClass:s.damageClass??'physical'}));
 return[id,{...c,id,emoji:'✦',chapterTwoOnly:true,chapterTwoSet392:true,fieldEncounter:false,gachaExcluded:true,minFloor:Number.MAX_SAFE_INTEGER,captureRate:c.captureCap383,acquisition:[c.habitat383,'捕獲'],growth:{hp:1,atk:1,def:1,spd:1},baseStats:{hp,atk,matk,def,mdef,spd,crit:8,evasion:8,accuracy:112},rankNames:[c.name,c.name,c.name,c.name],skills,authoredSkills:skills}];
}).concat([[MOTHER_SPECIES422.id,MOTHER_SPECIES422]])));
