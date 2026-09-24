// Real species; tiers, weight baselines and points are GAME settings, not biological limits.
// Learning text stays in the client-only Knowledge533 module.
const fish=(id,name,tier,base,kg,difficulty,sheet,cell,group532,deep=false)=>Object.freeze({id,name,tier,base,kg,difficulty,color:'#a4d8bd',size:tier>=2?1.5:.8,real532:true,new533:true,group532,deep533:deep,art525:Object.freeze({sheet,cell})});
const market=(id,name,tier,base,kg,difficulty,cell,deep=false)=>fish(id,name,tier,base,kg,difficulty,'market533',cell,'market',deep);
const coast=(id,name,tier,base,kg,difficulty,cell,deep=false)=>fish(id,name,tier,base,kg,difficulty,'coast533',cell,'wild',deep);
export const EXTRA_CATCHES533=Object.freeze([
 market('redseabream','マダイ',2,150,3,1.6,0),
 market('bluefintuna','クロマグロ',3,290,95,2.1,1),
 market('skipjack','カツオ',2,146,4,1.7,2),
 market('spanishmackerel','サワラ',2,148,3.8,1.65,3),
 market('cod','マダラ',2,140,5,1.65,4),
 market('hokke','ホッケ',1,70,.7,1.18,5),
 market('alfonsino','キンメダイ',3,255,1.3,1.95,6,true),
 market('hairtail','タチウオ',2,148,1.8,1.65,7),
 market('marbledflounder','マコガレイ',1,72,.65,1.2,8),
 market('thornyhead','キチジ',3,268,1,2,9,true),
 market('blackthroat','アカムツ（ノドグロ）',3,265,.8,2,10,true),
 market('amberjack','カンパチ',2,160,7,1.75,11),
 market('seabass','スズキ',2,144,3.5,1.6,12),
 market('herring','ニシン',0,30,.25,.85,13),
 market('shishamo','シシャモ',0,28,.035,.8,14),
 market('japaneseeel','ニホンウナギ',2,154,.8,1.65,15),
 coast('blackseabream','クロダイ',1,78,1.1,1.28,0),
 coast('mejina','メジナ',1,73,.8,1.24,1),
 coast('filefish','カワハギ',1,78,.3,1.28,2),
 coast('rockfish','カサゴ',1,73,.3,1.24,3),
 coast('blackrockfish','クロメバル',1,72,.25,1.2,4),
 coast('greenling','アイナメ',1,75,.7,1.25,5),
 coast('whiting','シロギス',0,30,.09,.85,6),
 coast('flathead','マゴチ',2,140,1.4,1.65,7),
 coast('mullet','ボラ',1,68,1.5,1.22,8),
 coast('halfbeak','サヨリ',0,31,.12,.86,9),
 coast('gurnard','ホウボウ',2,156,.65,1.64,10),
 coast('goatfish','ヒメジ',0,33,.08,.86,11),
 coast('sandfish','ハタハタ',0,32,.1,.84,12),
 coast('icefish','シラウオ',0,26,.005,.76,13),
 coast('barreleye','デメニギス',3,285,.12,2.1,14,true),
 coast('frilledshark','ラブカ',3,288,9,2.12,15,true)
]);
export const THEMES533=Object.freeze([
 {id:'coast',name:'磯と堤防',ids:['blackseabream','mejina','filefish','rockfish','blackrockfish','greenling','whiting','flathead','mullet','halfbeak','gurnard','goatfish']},
 {id:'deep',name:'深海の気配',ids:EXTRA_CATCHES533.filter(f=>f.deep533).map(f=>f.id)}
]);
