// Chapter II installment 3: seven heroines, including three original twin pairs.
const skill=(key,name,mp,cooldown,description,fields={})=>({key,name,mp,cooldown,description,type:'attack',power:1,target:'敵単体',tag:'第二章固有',chapterTwoSet385:true,unlock:{type:'level',value:1},...fields});
const creatures=[
 {key:'lilica',name:'煤紫の剣魔リリカ',rarity:'N',element:'dark',race:'demon',role:'assassin',tacticRole383:'striker',stats:[91,22,10,12,12,23],maxMp:36,captureCap383:.65,habitat383:'境界の森・再探索「倒木の小径」',lore383:'封樹の煤から生まれた剣の魔物。紫の外套で姿を隠し、鏡の双子に憧れながらひとりで剣を磨いている。',counter383:'回避低下から防御貫通へつなぐ剣士。浄化と防御支援で崩し、魔法攻撃で外套の障壁を削る。',skills:[
  skill('mark','煤紫の刻印',7,2,'闇属性0.90倍。回避15%低下（2ターン）。',{power:.9,effects:[{kind:'evasionDown',value:.15,turns:2,enemy:true}],ai383:'setup'}),
  skill('edge','夜縫いの剣',8,1,'闇属性1.10倍。回避低下中には威力1.35倍。',{power:1.1,bonusVsEffect:{kind:'evasionDown',multiplier:1.35},ai383:'strike'}),
  skill('pierce','封枝断ち',9,2,'闇属性1.10倍。防御を30%無視。',{power:1.1,defenseIgnore:.3,ai383:'fallback'}),
  skill('cloak','小夜の外套',10,3,'自身に最大HP12%の障壁、回避15%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.12,effects:[{kind:'evasionUp',value:.15,turns:2}],ai383:'stance'})]},
 {key:'ryune',name:'湖鏡の侍女リュネ',rarity:'R',element:'ice',race:'spirit',role:'tank',tacticRole383:'guardian',stats:[145,24,14,26,18,18],maxMp:45,captureCap383:.55,habitat383:'境界の森・再探索「東の封印樹」',lore383:'封印樹の鏡に宿る双子の姉。青いリボンと鏡盾が目印。妹ロゼの一撃を守り、剣の軌跡を鏡に映して増幅する。',counter383:'ロゼとそろうと双鏡狂奏が発動。防御の薄い妹を先に倒すか捕獲して連携を断つ。',skills:[
  skill('mirror','湖鏡の庇護',16,3,'味方全体に最大HP12%の障壁、防御15%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.12,effects:[{kind:'defUp',value:.15,turns:2,allies:true}],ai383:'shield'}),
  skill('frost','鏡面の霜刃',9,2,'氷属性0.95倍。防御15%低下（2ターン）。',{power:.95,effects:[{kind:'defDown',value:.15,turns:2,enemy:true}],ai383:'setup'}),
  skill('edge','蒼鏡剣',10,1,'氷属性1.15倍。防御低下中には威力1.30倍。',{power:1.15,bonusVsEffect:{kind:'defDown',multiplier:1.3},ai383:'strike'}),
  skill('polish','曇りなき鏡',15,3,'生存している味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'})]},
 {key:'rose',name:'紅鏡の侍女ロゼ',rarity:'SR',element:'fire',race:'spirit',role:'assassin',tacticRole383:'striker',stats:[112,36,12,14,17,29],maxMp:48,captureCap383:.42,habitat383:'境界の森・再探索「東の封印樹」',lore383:'封印樹の鏡に宿る双子の妹。紅のリボンと大斧が目印。姉リュネの盾を信じ、封印の隙間を大胆に切り開く。',counter383:'リュネの防御低下に合わせて斧を振るう。姉の障壁を解除し、妹へ集中攻撃すると双子連携が止まる。',skills:[
  skill('chime','紅鏡の号令',15,3,'味方全体の攻撃18%・命中12%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',effects:[{kind:'atkUp',value:.18,turns:2,allies:true},{kind:'accuracyUp',value:.12,turns:2,allies:true}],ai383:'rally'}),
  skill('shatter','紅鏡砕き',13,2,'火属性1.35倍。防御低下中には威力1.45倍。',{power:1.35,bonusVsEffect:{kind:'defDown',multiplier:1.45},ai383:'strike'}),
  skill('sweep','薔薇の円舞',15,2,'敵全体に火属性0.75倍。',{power:.75,allEnemies:true,target:'敵全体',ai383:'fallback'}),
  skill('courage','妹の強がり',12,3,'自身に最大HP12%の障壁、攻撃18%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.12,effects:[{kind:'atkUp',value:.18,turns:2}],ai383:'stance'})]},
 {key:'shion',name:'幽符の姉シオン',rarity:'SSR',element:'dark',race:'undead',role:'magic',tacticRole383:'disruptor',stats:[138,12,40,20,29,27],maxMp:65,captureCap383:.32,habitat383:'深淵の回廊・再探索「王権の裁定」',lore383:'回廊の霊符から目覚めた双子の姉。紅の扇で冥路を開き、妹スイレンの鈴とともに眠る魂を送り出す。',counter383:'スイレンとの連携で全体攻撃と回復阻害。妹の治癒を封じて先に倒す。回復前には弱体を浄化する。',skills:[
  skill('seal','幽符・閉命',19,2,'敵全体に闇属性0.65倍。受けるHP回復30%低下（2ターン）。',{power:.65,allEnemies:true,target:'敵全体',damageClass:'magic',effects:[{kind:'healDown',value:.3,turns:2,enemy:true}],ai383:'healBlock'}),
  skill('fan','冥路の紅扇',18,1,'闇属性1.35倍の魔法攻撃。回復阻害中には威力1.40倍。',{power:1.35,damageClass:'magic',bonusVsEffect:{kind:'healDown',multiplier:1.4},ai383:'strike'}),
  skill('unseal','加護ほどき',20,3,'闇属性1.00倍の魔法攻撃。敵陣の強化を1つ解除。',{power:1,damageClass:'magic',dispelEnemyBuff:true,ai383:'dispel'}),
  skill('robe','冥衣の護符',18,3,'自身に最大HP15%の障壁、回避15%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.15,effects:[{kind:'evasionUp',value:.15,turns:2}],ai383:'stance'})]},
 {key:'suiren',name:'霊鈴の妹スイレン',rarity:'UR',element:'ice',race:'undead',role:'healer',tacticRole383:'support',stats:[157,12,44,23,36,25],maxMp:78,captureCap383:.24,habitat383:'深淵の回廊・再探索「王権の裁定」',lore383:'回廊の霊鈴から目覚めた双子の妹。蒼い鈴で傷ついた魂をつなぎ、姉シオンの紅扇に小さくうなずく。',counter383:'シオンがいると支援行動からも全体追撃。回復阻害と蘇生封印を使い、片方から確実に倒す。',skills:[
  skill('bell','還魂の小鈴',36,5,'蘇生封印のない味方1体をHP30%で蘇生。MPは最大値の5%まで補充。',{type:'revive',power:0,target:'戦闘不能の味方',revive:.3,reviveMp:.05,ai383:'revive'}),
  skill('lullaby','霊灯の子守歌',24,3,'生存している味方全体のHPを16%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.16,ai383:'heal'}),
  skill('wash','清鈴の響き',21,3,'生存している味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'}),
  skill('frost','蒼鈴の残響',14,1,'氷属性1.20倍の魔法攻撃。回復阻害中には威力1.35倍。',{power:1.2,damageClass:'magic',bonusVsEffect:{kind:'healDown',multiplier:1.35},ai383:'strike'})]},
 {key:'aure',name:'暁翼の祈姫アウレ',rarity:'LR',element:'light',race:'angel',role:'assassin',tacticRole383:'striker',stats:[184,49,23,28,31,31],maxMp:72,captureCap383:.18,habitat383:'天律の聖域・再探索「因果の聖壇」',lore383:'天律の暁を守る双子の姉。桜色の髪と太陽剣を持つ。銀髪の妹ノエルが歌うと、欠けた空を埋める翼が開く。',counter383:'ノエルと生存中は天穹・双翼聖歌。姉の剣と妹の魔法を両方受け続けず、一方へ攻撃を集める。',skills:[
  skill('dawn','暁翼の祝福',25,3,'味方全体の攻撃20%・速度16%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',effects:[{kind:'atkUp',value:.2,turns:2,allies:true},{kind:'spdUp',value:.16,turns:2,allies:true}],ai383:'rally'}),
  skill('sun','太陽剣・払暁',24,2,'光属性1.55倍。防御を35%無視。',{power:1.55,defenseIgnore:.35,ai383:'strike'}),
  skill('feather','金羽の剣雨',25,2,'敵全体に光属性0.85倍。防御15%低下（2ターン）。',{power:.85,allEnemies:true,target:'敵全体',effects:[{kind:'defDown',value:.15,turns:2,enemy:true}],ai383:'setup'}),
  skill('oath','暁の誓い',20,3,'自身に最大HP18%の障壁、命中20%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.18,effects:[{kind:'accuracyUp',value:.2,turns:2}],ai383:'stance'})]},
 {key:'noelle',name:'宵翼の詠姫ノエル',rarity:'神話',element:'light',race:'angel',role:'magic',tacticRole383:'leader',stats:[209,18,57,29,43,28],maxMp:90,captureCap383:.12,habitat383:'天律の聖域・再探索「因果の聖壇」',lore383:'天律の宵を守る双子の妹。銀色の髪と月の杖を持つ。姉アウレの剣先へ聖歌を送り、二人だけの夜明けを呼び起こす。',counter383:'姉がいると魔力と剣力を合わせた大連携。回復阻害で聖歌の回復を抑え、障壁を割って片方を倒す。',skills:[
  skill('vesper','宵の聖歌',28,3,'生存している味方全体のHPを20%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.2,ai383:'heal'}),
  skill('moon','月冠の光条',25,1,'光属性1.55倍の魔法攻撃。防御低下中には威力1.40倍。',{power:1.55,damageClass:'magic',bonusVsEffect:{kind:'defDown',multiplier:1.4},ai383:'strike'}),
  skill('wing','白翼の結界',28,3,'味方全体に最大HP18%の障壁、防御18%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.18,effects:[{kind:'defUp',value:.18,turns:2,allies:true}],ai383:'shield'}),
  skill('stars','星屑の洗礼',23,3,'生存している味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'})]}
];
export const CHAPTER_TWO_SPECIES385=Object.freeze(Object.fromEntries(creatures.map(c=>{
 const id=`ch2_${c.key}`,[hp,atk,matk,def,mdef,spd]=c.stats;
 const skills=c.skills.map(s=>({...s,id:`${id}__${s.key}`,element:c.element,damageClass:s.damageClass??'physical'}));
 return[id,{...c,id,emoji:'✦',chapterTwoOnly:true,chapterTwoSet385:true,fieldEncounter:false,gachaExcluded:true,minFloor:Number.MAX_SAFE_INTEGER,captureRate:c.captureCap383,acquisition:[c.habitat383,'捕獲'],growth:{hp:1,atk:1,def:1,spd:1},baseStats:{hp,atk,matk,def,mdef,spd,crit:8,evasion:8,accuracy:112},rankNames:[c.name,c.name,c.name,c.name],skills,authoredSkills:skills}];
})));
