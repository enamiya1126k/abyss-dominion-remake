import {CHAPTER_TWO_SPECIES392} from './chapterTwoSpecies392.js?v=3.1.72-build392';
import {CHAPTER_TWO_SPECIES391} from './chapterTwoSpecies391.js?v=3.1.71-build391';
import {CHAPTER_TWO_SPECIES390} from './chapterTwoSpecies390.js?v=3.1.70-build390';
import {CHAPTER_TWO_SPECIES389} from './chapterTwoSpecies389.js?v=3.1.69-build389';
import {CHAPTER_TWO_SPECIES388} from './chapterTwoSpecies388.js?v=3.1.68-build388';
import {CHAPTER_TWO_SPECIES387} from './chapterTwoSpecies387.js?v=3.1.67-build387';
import {CHAPTER_TWO_SPECIES386} from './chapterTwoSpecies386.js?v=3.1.66-build386';
import {CHAPTER_TWO_SPECIES385} from './chapterTwoSpecies385.js?v=3.1.65-build385';
import {CHAPTER_TWO_SPECIES384} from './chapterTwoSpecies384.js?v=3.1.70-build390';
// Chapter II native creatures: shared, authored player/enemy skill definitions.
const poison={id:'poison',name:'毒',chance:.75,turns:3,power:.025};
const slow={kind:'spdDown',value:.18,turns:2,enemy:true};
const exposed={kind:'vulnerable',value:.14,turns:2,enemy:true};
const skill=(key,name,mp,cooldown,description,fields={})=>({key,name,mp,cooldown,description,type:'attack',power:1,target:'敵単体',tag:'第二章固有',unlock:{type:'level',value:1},...fields});
const creatures=[
 {key:'kororu',name:'芽灯虫コロル',rarity:'N',element:'earth',race:'insect',role:'poison',tacticRole383:'disruptor',stats:[68,8,12,7,13,24],maxMp:32,captureCap383:.65,habitat383:'境界の森・再探索の残党',lore383:'封樹の樹液を腹の灯嚢に蓄える小さな虫。葉脈には中枢の紋様に似た筋が浮かぶ。',counter383:'毒を浄化すると蠍への連携が切れる。本人の耐久は低い。',skills:[
  skill('seed','灯嚢の胞子',8,2,'敵全体に地属性0.50倍。75%で毒を3ターン。',{power:.5,allEnemies:true,target:'敵全体',status:poison,ai383:'setup',damageClass:'magic'}),
  skill('sting','芽針',3,0,'地属性0.85倍。毒の敵には威力1.25倍。',{power:.85,bonusVsStatus:{id:'poison',multiplier:1.25},ai383:'strike',damageClass:'magic'}),
  skill('veil','葉脈の目眩まし',6,2,'地属性0.65倍。命中を15%下げる（2ターン）。',{power:.65,effects:[{kind:'accuracyDown',value:.15,turns:2,enemy:true}],ai383:'disrupt',damageClass:'magic'}),
  skill('lamp','小さな道標',9,3,'味方全体の速度を12%上げる（2ターン）。',{type:'buff',power:0,target:'味方全体',effects:[{kind:'spdUp',value:.12,turns:2,allies:true}],ai383:'rally'})]},
 {key:'balk',name:'棘盾獣バルク',rarity:'R',element:'earth',race:'beast',role:'tank',tacticRole383:'guardian',stats:[138,18,7,23,16,10],maxMp:35,captureCap383:.55,habitat383:'境界の森・再探索の残党',lore383:'古い封印板を額に宿す獣。侵食で石化した背の樹皮を盾に、灯嚢虫の群れを守る。',counter383:'障壁を張り直すまで3ターンの隙。魔法攻撃と強化解除が有効。',skills:[
  skill('shelter','封樹の庇護',12,3,'味方全体に最大HP8%の障壁、防御18%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.08,effects:[{kind:'defUp',value:.18,turns:2,allies:true}],ai383:'shield'}),
  skill('ram','石殻突進',6,1,'地属性1.05倍。防御を18%下げる（2ターン）。',{power:1.05,effects:[{kind:'defDown',value:.18,turns:2,enemy:true}],ai383:'setup'}),
  skill('thorns','棘陰の構え',10,3,'自身の防御30%・回避12%上昇（2ターン）。',{type:'stance',power:0,target:'自分',effects:[{kind:'defUp',value:.3,turns:2},{kind:'evasionUp',value:.12,turns:2}],ai383:'stance'}),
  skill('roots','根留め',8,2,'地属性0.90倍。速度を18%下げる（2ターン）。',{power:.9,effects:[slow],ai383:'strike'})]},
 {key:'shelza',name:'玻璃蠍シェルザ',rarity:'SR',element:'dark',race:'insect',role:'assassin',tacticRole383:'striker',stats:[112,30,11,15,11,26],maxMp:39,captureCap383:.42,habitat383:'黒根の侵食域・再探索の残党',lore383:'黒根から析出した玻璃を甲殻にまとう。毒で鈍った獲物を透明な鋏で切り取る。',counter383:'コロルを先に倒すか毒を治すと、追撃の威力が下がる。',skills:[
  skill('venom','玻璃毒針',9,2,'闇属性0.85倍。75%で毒を3ターン。',{power:.85,status:poison,ai383:'setup'}),
  skill('pursuit','蝕晶の刈取り',11,1,'闇属性1.20倍。毒の敵には威力1.50倍。',{power:1.2,bonusVsStatus:{id:'poison',multiplier:1.5},ai383:'strike'}),
  skill('shell','晶殻偏光',13,3,'自身に最大HP12%の障壁、回避15%上昇（2ターン）。',{type:'stance',power:0,target:'自分',selfShieldRate:.12,effects:[{kind:'evasionUp',value:.15,turns:2}],ai383:'stance'}),
  skill('cut','透刃',7,1,'闇属性1.05倍。防御を20%無視。',{power:1.05,defenseIgnore:.2,ai383:'fallback'})]},
 {key:'noctia',name:'霜鐘梟ノクティア',rarity:'SSR',element:'ice',race:'flying',role:'controller',tacticRole383:'disruptor',stats:[126,14,34,14,25,25],maxMp:52,captureCap383:.32,habitat383:'天律の聖域・再探索の残党',lore383:'廃聖堂の鐘を胸に抱く梟。羽の霜紋は祈りの楽譜で、鳴くたび空気に幾何学の氷が生まれる。',counter383:'速度低下を浄化して先手を取り戻す。凍結は全体ではなく単体。',skills:[
  skill('chime','霜鐘の余韻',15,2,'敵全体に氷属性0.65倍。速度18%低下（2ターン）。',{power:.65,allEnemies:true,target:'敵全体',effects:[slow],ai383:'setup',damageClass:'magic'}),
  skill('icicle','静寂の氷羽',12,1,'氷属性1.15倍。速度低下中の敵には威力1.35倍。',{power:1.15,bonusVsEffect:{kind:'spdDown',multiplier:1.35},ai383:'strike',damageClass:'magic'}),
  skill('freeze','白夜の鐘',19,3,'氷属性0.90倍。35%で凍結（1ターン）。',{power:.9,status:{id:'freeze',name:'凍結',chance:.35,turns:1,power:0},ai383:'disrupt',damageClass:'magic'}),
  skill('feather','聖堂の羽衣',16,3,'味方全体の防御を20%上げる（2ターン）。',{type:'buff',power:0,target:'味方全体',effects:[{kind:'defUp',value:.2,turns:2,allies:true}],ai383:'shield'})]},
 {key:'velg',name:'鎖翼竜ヴェルグ',rarity:'UR',element:'dark',race:'dragon',role:'bruiser',tacticRole383:'striker',stats:[184,42,20,27,21,19],maxMp:55,captureCap383:.24,habitat383:'深淵の回廊・再探索の残党',lore383:'古い監獄の拘束鎖が翼に融合した竜。外殻の割れ目から侵食の赤がのぞくが、眼はまだ理性を保つ。',counter383:'強化の重ね過ぎに注意。脆弱を浄化すると鎖牙への連携を断てる。',skills:[
  skill('unseal','封鎖剥離',18,3,'敵全体に闇属性0.55倍。敵陣の強化を1つ解除。',{power:.55,allEnemies:true,target:'敵全体',dispelEnemyBuff:true,ai383:'dispel'}),
  skill('breach','裂鎖の爪',13,2,'闇属性1.00倍。被ダメージを14%増やす（2ターン）。',{power:1,effects:[exposed],ai383:'setup'}),
  skill('fang','落翼の鎖牙',17,1,'闇属性1.30倍。脆弱の敵には威力1.35倍。',{power:1.3,bonusVsEffect:{kind:'vulnerable',multiplier:1.35},ai383:'strike'}),
  skill('feed','侵食喰らい',14,2,'闇属性1.05倍。与えたダメージの20%を吸収。',{power:1.05,drain:.2,ai383:'drain'})]},
 {key:'astera',name:'星糸司アステラ',rarity:'LR',element:'light',race:'spirit',role:'healer',tacticRole383:'support',stats:[155,13,46,19,36,24],maxMp:70,captureCap383:.18,habitat383:'天律の聖域・再探索の残党／理の中枢',lore383:'中枢の観測装置から生まれた蛾の精霊。星図を織った翅と欠けた糸車で、破れた命の境を縫う。',counter383:'回復と浄化には別々の待ち時間がある。耐久は低く、集中攻撃が有効。',skills:[
  skill('mend','星縫いの帳',25,3,'生存している味方全体のHPを18%回復。',{type:'allHeal',power:0,target:'味方全体',heal:.18,ai383:'heal'}),
  skill('cleanse','解き糸',22,3,'生存している味方全体の状態異常と弱体を浄化。',{type:'cleanse',power:0,target:'味方全体',cleanse:true,ai383:'cleanse'}),
  skill('weave','星図の織直し',23,3,'味方全体に最大HP10%の障壁、攻撃16%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.1,effects:[{kind:'atkUp',value:.16,turns:2,allies:true}],ai383:'rally'}),
  skill('thread','裁星の糸',10,1,'光属性1.05倍。命中を12%下げる（2ターン）。',{power:1.05,effects:[{kind:'accuracyDown',value:.12,turns:2,enemy:true}],ai383:'strike',damageClass:'magic'})]},
 {key:'ordia',name:'境律獣オルディア',rarity:'神話',element:'light',race:'beast',role:'balanced',tacticRole383:'leader',stats:[225,48,40,35,33,24],maxMp:76,captureCap383:.12,habitat383:'理の中枢・再探索「修復の中枢」',lore383:'森と中枢の境を見張る律の獣。門の鍵を思わせる角と陶製の前脚を持ち、自然と機構の均衡を測る。',counter383:'境界標を浄化し、アステラの支援から崩す。結界はHP12%分で破壊できる。',skills:[
  skill('mark','境界標',24,2,'敵全体に光属性0.65倍。被ダメージ14%増加（2ターン）。',{power:.65,allEnemies:true,target:'敵全体',effects:[exposed],ai383:'setup',damageClass:'magic'}),
  skill('verdict','律角の裁定',28,2,'光属性1.40倍。脆弱の敵には威力1.40倍。',{power:1.4,bonusVsEffect:{kind:'vulnerable',multiplier:1.4},ai383:'strike'}),
  skill('gate','環門の結界',32,4,'味方全体に最大HP12%の障壁、防御18%上昇（2ターン）。',{type:'buff',power:0,target:'味方全体',partyShieldRate:.12,effects:[{kind:'defUp',value:.18,turns:2,allies:true}],ai383:'shield'}),
  skill('return','均衡の歩法',22,3,'自身の攻撃18%・速度16%上昇（2ターン）。',{type:'stance',power:0,target:'自分',effects:[{kind:'atkUp',value:.18,turns:2},{kind:'spdUp',value:.16,turns:2}],ai383:'stance'})]}
];
export const CHAPTER_TWO_SPECIES383=Object.freeze(Object.fromEntries(creatures.map(c=>{
 const id=`ch2_${c.key}`,[hp,atk,matk,def,mdef,spd]=c.stats;
 return[id,{...c,id,emoji:'✦',chapterTwoOnly:true,fieldEncounter:false,gachaExcluded:true,minFloor:Number.MAX_SAFE_INTEGER,captureRate:c.captureCap383,acquisition:[c.habitat383,'捕獲'],growth:{hp:1,atk:1,def:1,spd:1},baseStats:{hp,atk,matk,def,mdef,spd,crit:8,evasion:8,accuracy:112},rankNames:[c.name,c.name,c.name,c.name],skills:c.skills.map(s=>({...s,id:`${id}__${s.key}`})),authoredSkills:c.skills.map(s=>({...s,id:`${id}__${s.key}`,element:c.element,damageClass:s.damageClass??'physical'}))}];
})));
export function chapterTwoCaptureChance383(speciesId,chance){const c=CHAPTER_TWO_SPECIES383[speciesId]??CHAPTER_TWO_SPECIES384[speciesId]??CHAPTER_TWO_SPECIES385[speciesId]??CHAPTER_TWO_SPECIES386[speciesId]??CHAPTER_TWO_SPECIES387[speciesId]??CHAPTER_TWO_SPECIES388[speciesId]??CHAPTER_TWO_SPECIES389[speciesId]??CHAPTER_TWO_SPECIES390[speciesId]??CHAPTER_TWO_SPECIES391[speciesId]??CHAPTER_TWO_SPECIES392[speciesId];return c?Math.max(.01,Math.min(c.captureCap383,chance)):chance;}
