// Fish are real species. Points, tier, weight and difficulty are game settings.
const fish=(id,name,tier,base,kg,difficulty,sheet,cell,group532='wild')=>Object.freeze({id,name,tier,base,kg,difficulty,color:group532==='danger'?'#edb188':'#aed8be',size:tier>=2?1.5:.8,real532:true,new534:true,shore534:true,group532,art525:Object.freeze({sheet,cell})});
const shore=(id,name,tier,base,kg,difficulty,cell,group='wild')=>fish(id,name,tier,base,kg,difficulty,'shore534',cell,group);
const hazard=(id,name,tier,base,kg,difficulty,cell)=>fish(id,name,tier,base,kg,difficulty,'finds534',cell,'danger');
const litter=(id,name,kg,base,cell)=>Object.freeze({id,name,tier:0,base,kg,difficulty:.58,color:'#b7c7ae',size:.8,new534:true,trash534:true,item525:true,terminal525:true,group532:'trash',art525:Object.freeze({sheet:'finds534',cell})});
export const EXTRA_CATCHES534=Object.freeze([
 shore('anchovy','カタクチイワシ',0,25,.04,.8,0),
 shore('roundherring','ウルメイワシ',0,27,.09,.82,1),
 shore('yellowfingoby','マハゼ',0,29,.05,.85,2),
 shore('surfperch','ウミタナゴ',1,66,.25,1.18,3),
 shore('kyusen','キュウセン',1,72,.2,1.23,4),
 shore('grunt','イサキ',1,75,.7,1.25,5),
 shore('barredknifejaw','イシダイ',2,151,2.5,1.68,6),
 shore('blacktipgrouper','アカハタ',2,154,1.1,1.68,7),
 shore('redspottedgrouper','キジハタ',2,158,1.4,1.72,8),
 shore('redbarracuda','アカカマス',1,74,.45,1.25,9),
 shore('needlefish','ダツ',1,76,.4,1.3,10,'danger'),
 shore('kidako','ウツボ',2,150,2.2,1.7,11,'danger'),
 shore('bigeyetrevally','ギンガメアジ',2,154,2.5,1.7,12),
 shore('gianttrevally','ロウニンアジ',3,278,25,2.08,13),
 shore('morwong','タカノハダイ',1,73,.8,1.23,14),
 shore('cardinalfish','ネンブツダイ',0,28,.018,.8,15),
 hazard('spottedknifejaw','イシガキダイ',2,160,2.4,1.72,0),
 hazard('blueparrotfish','アオブダイ',3,258,4.5,1.97,1),
 hazard('rabbitfish','アイゴ',1,79,.65,1.28,2),
 hazard('stripedcatfish','ゴンズイ',0,33,.055,.9,3),
 hazard('velvetfish','ハオコゼ',0,32,.025,.9,4),
 hazard('devilstinger','オニオコゼ',2,165,.55,1.75,5),
 hazard('pantherpuffer','ヒガンフグ',2,154,.7,1.7,6),
 hazard('scrawledfilefish','ソウシハギ',2,161,1.5,1.72,7),
 litter('petbottle','空のペットボトル',.04,8,8),
 litter('crushedcan','へこんだ空き缶',.03,8,9),
 litter('plasticbag','波にもまれたレジ袋',.02,8,10),
 litter('tangledline','からまった釣り糸',.08,10,11),
 litter('tornnet','ちぎれた漁網',.8,12,12),
 litter('foambox','発泡スチロール箱',.35,10,13),
 litter('oldtire','海底の古タイヤ',7,15,14),
 litter('workglove','片っぽの軍手',.12,8,15)
]);
export const LITTER_IDS534=Object.freeze(EXTRA_CATCHES534.filter(f=>f.trash534).map(f=>f.id));
export const ISLAND_THEME534=Object.freeze({id:'island',name:'南の島の気配',ids:['blacktipgrouper','bigeyetrevally','gianttrevally','blueparrotfish','rabbitfish','scrawledfilefish','spottedknifejaw','kidako']});
