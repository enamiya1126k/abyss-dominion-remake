import {ISLAND_THEME534} from './Catalog534.js';
import {THEMES533,EXTRA_CATCHES533} from './Catalog533.js';
// All weights, tiers, points and encounter locations below are GAME settings.
// Real-world knowledge is deliberately kept in the client-only Knowledge532 module.
const animal=(id,name,tier,base,kg,difficulty,sheet,cell,group532='wild',extra={})=>Object.freeze({id,name,tier,base,kg,difficulty,color:group532==='danger'?'#f0b687':'#a4d8bd',size:tier===4?4:tier>=2?1.5:.8,real532:true,group532,art525:{sheet,cell},...extra});
const river=(...a)=>animal(...a.slice(0,6),'river532',a[6],a[7]??'wild');
const sea=(...a)=>animal(...a.slice(0,6),'sea532',a[6],a[7]??'market',a[8]??{});
export const EXTRA_CATCHES532=Object.freeze([
 river('medaka','メダカ',0,22,.003,.70,0),
 river('donko','ドンコ',0,29,.045,.82,1),
 river('ayu','アユ',0,32,.09,.88,2),
 river('crucian','ギンブナ',1,61,.65,1.16,3),
 river('bluegill','ブルーギル',0,30,.16,.90,4),
 river('yellowperch','イエローパーチ',1,67,.40,1.20,5),
 river('char','イワナ',1,76,.35,1.26,6),
 river('yamame','ヤマメ',1,75,.22,1.24,7),
 river('cherrysalmon','サクラマス',2,142,3.2,1.63,8),
 river('grasscarp','ソウギョ',3,243,18,1.95,9),
 river('snakehead','カムルチー',2,148,4.8,1.70,10),
 river('peacockbass','アイスポットシクリッド',2,155,3.5,1.68,11),
 river('freshshrimp','スジエビ',0,28,.006,.76,12),
 river('mussel','ドブガイの仲間',0,27,.18,.76,13),
 river('mittencrab','モクズガニ',1,80,.30,1.27,14),
 river('bullfrog','ウシガエル',1,69,.45,1.18,15),
 sea('mackerel','マサバ',1,65,.55,1.18,0),
 sea('horsemackerel','マアジ',0,31,.16,.87,1),
 sea('sardine','マイワシ',0,25,.09,.78,2),
 sea('flounder','ヒラメ',2,147,3.0,1.60,3),
 sea('octopus','マダコ',1,82,1.2,1.30,4),
 sea('cuttlefish','コウイカ',1,80,.60,1.27,5),
 sea('saury','サンマ',0,30,.15,.86,6),
 sea('yellowtail','ブリ',2,153,6.5,1.70,7),
 sea('mahimahi','シイラ',3,251,12,2.00,8,'wild'),
 sea('sunfish','マンボウ',3,272,85,2.04,9,'wild'),
 sea('arapaima','ピラルク',4,800,140,2.65,10,'wild',{terminal525:true}),
 sea('grouper','タマカイ',4,815,160,2.70,11,'wild',{terminal525:true}),
 ...[['mossycat','コケまみれの招き猫',1,44,2.4,12],['bicycle','湖底の自転車',2,96,13,13],['slipper','片っぽのスリッパ',0,6,.2,14],['wallet','小銭入りの財布',3,310,.3,15]].map(([id,name,tier,base,kg,cell])=>Object.freeze({id,name,tier,base,kg,difficulty:tier===3?1.7:.65+tier*.3,color:'#d2b68a',size:1.1,group532:'curio',item525:true,art525:{sheet:'sea532',cell},...(id==='wallet'?{exclusive525:true,terminal525:true}:{})})),
 animal('tigerpuffer','トラフグ',2,157,1.8,1.72,'danger532',0,'danger'),
 animal('lionfish','ハナミノカサゴ',2,164,.75,1.78,'danger532',1,'danger'),
 animal('stonefish','オニダルマオコゼ',3,280,1.8,2.10,'danger532',2,'danger'),
 animal('stingray','アカエイ',3,259,14,2.00,'danger532',3,'danger')
]);
export const THEMES532=Object.freeze([
 {id:'river',name:'川の出会い',ids:['ayu','char','yamame','cherrysalmon','donko','medaka','mittencrab']},
 {id:'market',name:'おなじみの魚',ids:['mackerel','horsemackerel','sardine','flounder','octopus','cuttlefish','saury','yellowtail',...EXTRA_CATCHES533.filter(f=>f.group532==='market'&&!f.deep533).map(f=>f.id)]},
 {id:'wild',name:'水辺の探検',ids:['bluegill','yellowperch','grasscarp','snakehead','peacockbass','freshshrimp','mussel','bullfrog']},
 {id:'ocean',name:'大海の出会い',ids:['mahimahi','sunfish','grouper','tigerpuffer','lionfish','stonefish','stingray']},
 ...THEMES533, ISLAND_THEME534
]);
export const theme532=id=>THEMES532.find(t=>t.id===id)??THEMES532[0];
// Real species dominate ordinary draws. Themes are fictional encounter boosts,
// not a claim that marine fish and freshwater fish share one natural habitat.
export function varietyPick532(list,random,{theme='river',recent=[]}={}){
 const fresh=list.filter(f=>!recent.includes(f.id)),pool=fresh.length?fresh:list;
 const featured=theme532(theme).ids;
 const weight=f=>(f.real532?5:1)*(featured.includes(f.id)?2:1);
 let n=random()*pool.reduce((sum,f)=>sum+weight(f),0);
 return pool.find(f=>(n-=weight(f))<0)??pool.at(-1);
}
export const gameWeight532=kg=>kg<1?`${Math.round(kg*1000)}g`:`${Number(kg.toFixed(2))}kg`;
