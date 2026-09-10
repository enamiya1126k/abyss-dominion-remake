// Chapter II, installment 2: six humanoids and one archive mimic.
// The *383 fields are the established native-creature interface, shared with set 1.
const skill=(key,name,mp,cooldown,description,fields={})=>({key,name,mp,cooldown,description,type:'attack',power:1,target:'敵単体',tag:'第二章固有',chapterTwoSet384:true,unlock:{type:'level',value:1},...fields});
const burn={id:'burn',name:'火傷',chance:.70,turns:3,power:.02};
const creatures=[
 {key:'nerik',name:'根継ぎの斥候ネリク',rarity:'N',element:'earth',race:'golem',role:'controller',tacticRole383:'disruptor',humanoid384:true,stats:[78,16,7,10,8,29],maxMp:34,captureCap383:.65,habitat383:'境界の森・再探索「西の封印樹」',lore383:'封樹の根に古い斥候の記憶が継がれた小さな木偶。顔の彫り跡と擦れた黄布だけが、かつての任務を覚えている。',counter383:'命中支援で回避頼みの編成を崩す。支援を解除するか、軽装の斥候を先に狙う。',skills:[
  skill('signal','根脈の合図',9,3,'味方全体の命中16%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',effects:[{kind:'accuracyUp',value:.16,turns:2,allies:true}],ai383:'rally'}),
  skill('snare','足絡みの鉤槍',6,2,'地属性0.85倍。回避15%低下（2ターン）。',{power:.85,effects:[{kind:'evasionDown',value:.15,turns:2,enemy:true}],ai383:'setup'}),
  skill('pin','継ぎ目突き',5,1,'地属性1.00倍。回避低下中の敵には威力1.25倍。',{power:1,bonusVsEffect:{kind:'evasionDown',multiplier:1.25},ai383:'strike'}),
  skill('hide','木陰渡り',8,3,'自身の回避18%・速度12%上昇（2ターン）。',{type:'stance',power:0,target:'自分',effects:[{kind:'evasionUp',value:.18,turns:2},{kind:'spdUp',value:.12,turns:2}],ai383:'stance'})]},
 {key:'grant',name:'封樹の衛兵グラント',rarity:'R',element:'earth',race:'golem',role:'tank',tacticRole383:'guardian',humanoid384:true,stats:[148,21,6,28,13,9],maxMp:38,captureCap383:.55,habitat383:'黒根の侵食域・再探索「飢えた根脈」／「焼け跡の根脈」',lore383:'誰もいない門を守り続ける空洞の鎧兵。大盾の封印板から伸びる根が、鎧の内側で筋肉のように動く。',counter383:'斥候の命中支援と組む盾役。魔法防御は低め。障壁を割り、攻撃低下を浄化して押し切る。',skills:[
  skill('wall','封樹の防壁',14,3,'味方全体に最大HP10%の障壁、防御15%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.10,effects:[{kind:'defUp',value:.15,turns:2,allies:true}],ai383:'shield'}),
  skill('check','武具押さえ',8,2,'地属性0.90倍。攻撃18%低下（2ターン）。',{power:.9,effects:[{kind:'atkDown',value:.18,turns:2,enemy:true}],ai383:'setup'}),
  skill('hammer','衛門の鉄槌',9,1,'地属性1.10倍。攻撃低下中の敵には威力1.30倍。',{power:1.1,bonusVsEffect:{kind:'atkDown',multiplier:1.3},ai383:'strike'}),
  skill('brace','空鎧の踏ん張り',10,3,'自身に最大HP12%の障壁、防御25%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.12,effects:[{kind:'defUp',value:.25,turns:2}],ai383:'stance'})]},
 {key:'senela',name:'灰燭の呪術師セネラ',rarity:'SR',element:'fire',race:'spirit',role:'controller',tacticRole383:'disruptor',humanoid384:true,stats:[105,9,32,12,24,23],maxMp:48,captureCap383:.42,habitat383:'黒根の侵食域・再探索「飢えた根脈」',lore383:'侵食された祈祷師の姿を借りた灰燭の魔物。消えない蝋火と封じた灰瓶で、癒やしの循環を焦がす。',counter383:'火傷と回復阻害を重ねる。回復する前に浄化し、ラズィルの追撃条件を消す。',skills:[
  skill('cinder','黒根の燭火',13,2,'敵全体に火属性0.55倍。70%で火傷（3ターン）。',{power:.55,allEnemies:true,target:'敵全体',status:burn,damageClass:'magic',ai383:'setup'}),
  skill('ash','癒し灰の封瓶',11,2,'火属性0.85倍。受けるHP回復35%低下（2ターン）。',{power:.85,effects:[{kind:'healDown',value:.35,turns:2,enemy:true}],damageClass:'magic',ai383:'healBlock'}),
  skill('wick','残火の縫針',12,1,'火属性1.10倍。火傷中の敵には威力1.45倍。',{power:1.1,bonusVsStatus:{id:'burn',multiplier:1.45},damageClass:'magic',ai383:'strike'}),
  skill('wax','灰蝋の外套',13,3,'自身に最大HP10%の障壁、回避10%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.10,effects:[{kind:'evasionUp',value:.10,turns:2}],ai383:'stance'})]},
 {key:'razil',name:'忘却の鎖士ラズィル',rarity:'SSR',element:'dark',race:'undead',role:'assassin',tacticRole383:'striker',humanoid384:true,stats:[135,37,14,20,16,30],maxMp:55,captureCap383:.32,habitat383:'深淵の回廊・再探索「眠りの裁定」',lore383:'囚人の名を忘れたまま鎖を振るう人型の亡霊。目隠しの下で魔力の流れを読み、継ぎ直される命を狙う。',counter383:'命中した吸魔で魔力を奪う。回避・命中低下が有効。蘇生封印や回復阻害は浄化で解除できる。',skills:[
  skill('siphon','忘却の鎖環',15,3,'闇属性0.85倍。命中時、対象の最大MP12%まで吸収（残MPが上限）。',{power:.85,mpDrain:.12,ai383:'manaDrain'}),
  skill('seal','帰路断ち',14,3,'闇属性0.90倍。蘇生封印（2ターン）。',{power:.9,effects:[{kind:'reviveSeal',value:1,turns:2,enemy:true}],ai383:'reviveBlock'}),
  skill('sever','枯命の双刃',13,1,'闇属性1.15倍。回復阻害中の敵には威力1.35倍。',{power:1.15,bonusVsEffect:{kind:'healDown',multiplier:1.35},ai383:'strike'}),
  skill('listen','無音の鎖歩',15,3,'自身の命中16%・回避16%上昇（2ターン）。',{type:'stance',power:0,target:'自分',effects:[{kind:'accuracyUp',value:.16,turns:2},{kind:'evasionUp',value:.16,turns:2}],ai383:'stance'})]},
 {key:'ione',name:'天秤の祭司イオネ',rarity:'UR',element:'light',race:'golem',role:'healer',tacticRole383:'support',humanoid384:true,stats:[142,11,40,20,34,22],maxMp:76,captureCap383:.24,habitat383:'天律の聖域・再探索「生命の聖壇」／理の中枢',lore383:'天律の秤を抱く陶製の祭司。失われた信徒の重さを測りながら、砕けた器に一度ずつ祈りを注ぎ直す。',counter383:'蘇生技はMP36・再使用5ターン。祭司を先に倒すか、倒す相手に蘇生封印を付けて援護を断つ。',skills:[
  skill('recall','秤上の帰還',36,5,'蘇生封印のない味方1体をHP30%で蘇生。MPは最大値の5%まで補充。',{type:'revive',power:0,target:'戦闘不能の味方',revive:.30,reviveMp:.05,ai383:'revive'}),
  skill('mercy','陶灯の祈り',23,3,'生存している味方全体のHPを14%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.14,ai383:'heal'}),
  skill('absolve','清秤の洗礼',20,3,'生存している味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'}),
  skill('glint','白陶の光条',10,1,'光属性1.05倍。回避12%低下（2ターン）。',{power:1.05,damageClass:'magic',effects:[{kind:'evasionDown',value:.12,turns:2,enemy:true}],ai383:'strike'})]},
 {key:'mimelia',name:'星機匣ミメリア',rarity:'LR',element:'light',race:'mimic',role:'magic',tacticRole383:'striker',humanoid384:false,stats:[178,18,47,27,32,18],maxMp:67,captureCap383:.18,habitat383:'理の中枢・再探索「記録の中枢」',lore383:'中枢の星図を保管していた箱が、加護を食べる口を得たもの。小さな機械脚で歩き、蓋の奥の一眼で魔法陣を見定める。',counter383:'強化中の相手への噛み付きが強い。強化を重ねる前に狙う。宝物庫の一度きりの報酬とは別に捕獲できる。',skills:[
  skill('bite','加護喰みの晶歯',20,2,'光属性1.25倍の魔法攻撃。強化中の敵には威力1.40倍。',{power:1.25,damageClass:'magic',bonusVsEnemyBuff:{multiplier:1.4},ai383:'buffStrike'}),
  skill('unfold','星図の剥離',23,3,'敵全体に光属性0.55倍の魔法攻撃。敵陣の強化を1つ解除。',{power:.55,allEnemies:true,target:'敵全体',damageClass:'magic',dispelEnemyBuff:true,ai383:'dispel'}),
  skill('prism','箱庭の穿光',14,1,'光属性1.05倍の魔法攻撃。防御を30%無視。',{power:1.05,damageClass:'magic',defenseIgnore:.30,ai383:'strike'}),
  skill('lid','記録殻の閉蓋',19,3,'自身に最大HP16%の障壁、防御20%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.16,effects:[{kind:'defUp',value:.20,turns:2}],ai383:'stance'})]},
 {key:'luxion',name:'白紙の執政官ルクシオン',rarity:'神話',element:'light',race:'golem',role:'balanced',tacticRole383:'leader',humanoid384:true,stats:[216,30,51,31,38,25],maxMp:82,captureCap383:.12,habitat383:'理の中枢・再探索「記録の中枢」',lore383:'白紙の法典を携えた人型の執政機。記録から失われた王命を補うため、出会う者の力と癒やしに新しい制限を書き加える。',counter383:'攻撃低下を浄化すると判決への連携が切れる。イオネの蘇生を止め、支援役から順に崩す。',skills:[
  skill('edict','白紙の制令',26,3,'敵全体に光属性0.60倍。攻撃18%・受けるHP回復25%低下（2ターン）。',{power:.60,allEnemies:true,target:'敵全体',damageClass:'magic',effects:[{kind:'atkDown',value:.18,turns:2,enemy:true},{kind:'healDown',value:.25,turns:2,enemy:true}],ai383:'setup'}),
  skill('sentence','空欄への判決',27,2,'光属性1.35倍の魔法攻撃。攻撃低下中の敵には威力1.35倍。',{power:1.35,damageClass:'magic',bonusVsEffect:{kind:'atkDown',multiplier:1.35},ai383:'strike'}),
  skill('order','書記列の整序',28,4,'味方全体の命中16%・速度16%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',effects:[{kind:'accuracyUp',value:.16,turns:2,allies:true},{kind:'spdUp',value:.16,turns:2,allies:true}],ai383:'rally'}),
  skill('quill','無誤の筆槍',19,2,'必中の光属性1.05倍魔法攻撃。防御を25%無視。',{power:1.05,damageClass:'magic',guaranteedHit:true,defenseIgnore:.25,ai383:'fallback'})]}
];
export const CHAPTER_TWO_SPECIES384=Object.freeze(Object.fromEntries(creatures.map(c=>{
 const id=`ch2_${c.key}`,[hp,atk,matk,def,mdef,spd]=c.stats;
 const skills=c.skills.map(s=>({...s,id:`${id}__${s.key}`,element:c.element,damageClass:s.damageClass??'physical'}));
 return[id,{...c,id,emoji:'✦',chapterTwoOnly:true,chapterTwoSet384:true,fieldEncounter:false,gachaExcluded:true,minFloor:Number.MAX_SAFE_INTEGER,captureRate:c.captureCap383,acquisition:[c.habitat383,'捕獲'],growth:{hp:1,atk:1,def:1,spd:1},baseStats:{hp,atk,matk,def,mdef,spd,crit:8,evasion:8,accuracy:112},rankNames:[c.name,c.name,c.name,c.name],skills,authoredSkills:skills}];
})));
