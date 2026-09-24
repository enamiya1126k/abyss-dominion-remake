import {EXTRA_CATCHES534,LITTER_IDS534} from './Catalog534.js';
import {EXTRA_CATCHES533} from './Catalog533.js';
// Catch metadata and recipes for this fantasy minigame. Forced-bait flags are game rules.
import {EXTRA_CATCHES532,varietyPick532} from './Catalog532.js';
import {EXTRA_CATCHES531,MAX_CHAIN531} from './Catalog531.js';
const entry=(id,name,tier,base,kg,difficulty,color,size,sheet,cell,extra={})=>Object.freeze({id,name,tier,base,kg,difficulty,color,size,art525:{sheet,cell},...extra});
export const CATCHES525=Object.freeze([
 entry('silver','銀葉ウグイ',0,24,1.2,.9,'#a9ded8',.65,'legacy',0),
 entry('jade','翡翠コイ',1,58,3.8,1.25,'#61bfa2',1,'legacy',1),
 entry('ruby','紅玉タイ',2,106,8,1.65,'#ed8977',1.25,'legacy',2),
 entry('gold','月冠キンギョ',3,190,14,1.9,'#f3ce79',1.5,'legacy',3),
 entry('lord','千年大鯰・ヌマオウ',4,720,420,2.75,'#bac88a',4,'lord',0,{terminal525:true}),
 entry('trout','星斑ニジマス',0,28,1.7,.9,'#b8d2cf',.8,'river',0),
 entry('eel','夜紋ウナギ',1,67,4.3,1.25,'#999ecd',1,'river',1),
 entry('catfish','岩背ナマズ',2,112,18,1.65,'#8fba98',1.4,'river',2),
 entry('bass','青縞バス',1,61,4.8,1.3,'#81aec0',1,'river',3),
 entry('puffer','ふくらみフグ',1,72,2.1,1.28,'#decfa2',1,'river',4),
 entry('betta','花びらベタ',0,32,.4,.85,'#e69cc8',.65,'river',5),
 entry('sturgeon','黒鎧チョウザメ',3,206,34,1.95,'#93a7b7',1.6,'river',6),
 entry('angler','灯りアンコウ',2,134,12,1.75,'#c6b885',1.3,'river',7),
 entry('piranha','深紅ピラニア',2,118,5.5,1.7,'#de8278',1.2,'river',8),
 entry('arowana','黄金アロワナ',3,290,21,2,'#f5d581',1.65,'rare',0,{golden525:true}),
 entry('glass','透明グラスフィッシュ',0,30,.6,.85,'#b4e4e0',.65,'rare',1),
 entry('salmon','氷晶サーモン',2,123,13,1.65,'#91c8ea',1.3,'rare',2),
 entry('flying','虹ひれトビウオ',1,79,2.6,1.3,'#a7c7e8',1.1,'rare',3),
 entry('seahorse','星冠タツノオトシゴ',1,87,.8,1.25,'#eed79c',.9,'rare',4),
 entry('jelly','月光クラゲ',2,141,6,1.55,'#bfb3ef',1.2,'rare',5),
 entry('axolotl','桜ウーパールーパー',1,74,1.3,1.1,'#efb4c9',.9,'rare',6),
 entry('crab','鋼鋏ガニ',2,128,10,1.7,'#9ababe',1.2,'rare',7),
 entry('oarfish','天鱗リュウグウノツカイ',3,265,28,2,'#e1c7dc',1.7,'rare',8),
 entry('boot','古びた長靴',0,3,.7,.52,'#ac9278',.8,'oddities',0,{item525:true}),
 entry('lure','きらめくルアー',0,5,.2,.52,'#c8dda2',.6,'oddities',1,{item525:true,lure525:true}),
 entry('crayfish','アメリカザリガニ',0,0,.4,.75,'#d98b72',.7,'oddities',2,{baitOnly525:true}),
 entry('turtle','ミドリガメ',1,0,1.4,.95,'#aac683',.8,'oddities',3,{baitOnly525:true}),
 entry('hermit','宿借り大ヤドカリ',1,76,4.7,1.15,'#d6b28a',1,'oddities',4,{exclusive525:true}),
 entry('mimic','宝箱ミミック',2,166,15,1.65,'#d1b876',1.3,'oddities',5,{exclusive525:true,item525:true}),
 entry('keyeel','鍵角ウナギ',2,205,19,1.7,'#b8c8ae',1.4,'oddities',6,{exclusive525:true}),
 entry('kingcrab','王冠ガニ',3,282,38,1.9,'#ebc883',1.6,'oddities',7,{exclusive525:true}),
 entry('treasure','深淵の宝箱',3,365,65,1.9,'#efd899',1.8,'oddities',8,{exclusive525:true,item525:true,terminal525:true}),
 ...EXTRA_CATCHES531, ...EXTRA_CATCHES532, ...EXTRA_CATCHES533, ...EXTRA_CATCHES534
]);
const byId=new Map(CATCHES525.map(s=>[s.id,s]));
export const catch525=id=>byId.get(id)??null;
export const pool525=tier=>CATCHES525.filter(f=>f.tier===tier&&f.tier<4&&!f.item525&&!f.exclusive525&&!f.baitOnly525);
export const RECIPES525=Object.freeze({slipper:[['bicycle',1]],bicycle:[['wallet',1]],mossycat:[['wallet',1]],boot:[['hermit',1]],hermit:[['mimic',.72],['keyeel',.28]],mimic:[['keyeel',1]],keyeel:[['kingcrab',1]],kingcrab:[['treasure',1]],crayfish:[['catfish',.65],['sturgeon',.35]],turtle:[['sturgeon',.7],['keyeel',.3]],catfish:[['sturgeon',1]],sturgeon:[['kingcrab',1]],gold:[['arowana',.6],['kingcrab',.4]]});
export const canChain525=f=>!!f&&!f.terminal525&&f.tier!==4&&(f.chainDepth525??0)<MAX_CHAIN531;
export function chainHint525(f){if(f?.trash534)return'ゴミを回収して少し得点。次は魚が来るかな？';if(f?.baitOnly525)return'エサ専用 · 次を狙って竿も育てよう';if(f?.id==='slipper')return'片っぽだけ？ 次はもっと大きな落とし物かも';if(f?.id==='bicycle')return'前カゴの奥に、何かが引っかかっている…';if(f?.id==='mossycat')return'招き猫のご利益は、次の一投で？';if(f?.id==='boot')return'長靴に住みつく、何かがいる…';if(f?.specialId531)return catch525(f.specialId531).name+'を呼ぶルアー';if(f?.lure525)return'ルアー効果 · 大物候補＋取り込み補助';if(f?.id==='keyeel')return'その鍵に、王冠が反応している';if(f?.id==='kingcrab')return'湖底のお宝へ、あと一投';if(f?.terminal525)return f.tier===4?'伝説のヌシ級、釣り上げ成功！':'連鎖完走！ お宝を確保！';return canChain525(f)?'エサにすると竿が成長。確保しても強化は残る':''}
const pick=(list,random)=>list[Math.min(list.length-1,Math.floor(random()*list.length))];
export function selectCatch525(tier,random,{bait=false,previous=null,lordId531='lord',theme='river',recent=[]}={}){
 // A visible lord always wins over a bait recipe: reservation and catch must agree.
 if(tier===4)return catch525(lordId531);
 if(previous&&canChain525(previous)){
  if(previous.specialId531)return catch525(previous.specialId531);
  const recipe=RECIPES525[previous.id];let found;
  if(recipe){const x=random();let acc=0;found=recipe.find(row=>(acc+=row[1])>x)?.[0]??recipe.at(-1)[0];return catch525(found)}
  if(previous.lure525)return varietyPick532(pool525(random()<.58?3:2),random,{theme,recent});
  const pool=pool525(Math.min(3,Math.max(tier,1,previous.tier+1))),large=pool.filter(f=>f.kg>=(previous.kg??0)*.65&&f.id!==previous.id);
  return varietyPick532(large.length?large:pool,random,{theme,recent});
 }
 if(!bait){const v=random();if(v<.04)return pick(['boot','slipper','mossycat','bicycle',...LITTER_IDS534].map(catch525),random);if(v<.11)return pick(CATCHES525.filter(f=>f.lure525),random);if(tier<=1&&v<.14)return catch525(tier===0?'crayfish':'turtle')}
 return varietyPick532(pool525(tier),random,{theme,recent});
}
export function artSpec525(f){const spec=catch525(f?.id??f),a=f?.art525??spec?.art525;return a??{sheet:'legacy',cell:Math.min(4,f?.tier??0)}}
// Frame boundaries follow the transparent gutters in the generated sheets.
// Sharing these UVs keeps CSS catch cards and Canvas sprites identical.
export function artFrame525(f){const a=artSpec525(f);if(a.sheet.endsWith('534')){const row=Math.floor(a.cell/4),col=a.cell%4,shore=a.sheet==='shore534',ys=shore?[0,.25,.5,.72,1]:[0,.25,.485,.73,1],cuts=shore?[[311,621,933],[319,625,930],[318,636,962],[316,627,940]]:[[314,627,949],[318,625,945],[310,625,942],[309,628,943]],xs=[0,...cuts[row].map(v=>v/1254),1];return{x:xs[col],y:ys[row],w:xs[col+1]-xs[col],h:ys[row+1]-ys[row]}}if(a.sheet==='sea532'){const row=Math.floor(a.cell/4),col=a.cell%4,ys=[0,.25,.485,.735,1],xs=row===2?[0,.255,.485,.756,1]:row===3?[0,.23,.51,.755,1]:[0,.25,.5,.75,1];return{x:xs[col],y:ys[row],w:xs[col+1]-xs[col],h:ys[row+1]-ys[row]}}if(a.sheet==='coast533'){const row=Math.floor(a.cell/4),col=a.cell%4,xs=[0,.255,.505,.75,1],ys=[0,.25,.5,.715,1];return{x:xs[col],y:ys[row],w:xs[col+1]-xs[col],h:ys[row+1]-ys[row]}}if(a.sheet.endsWith('533'))return{x:a.cell%4/4,y:Math.floor(a.cell/4)/4,w:.25,h:.25};if(a.sheet.endsWith('532')){const cols=a.sheet==='danger532'?2:4;return{x:a.cell%cols/cols,y:Math.floor(a.cell/cols)/cols,w:1/cols,h:1/cols}}if(a.sheet==='collection531'){const ys=[0,.2,.397,.60,.777,1],row=Math.floor(a.cell/4);return{x:a.cell%4/4,y:ys[row],w:.25,h:ys[row+1]-ys[row]}}if(a.sheet==='lord')return{x:0,y:0,w:1,h:1};const xs=a.sheet==='river'?[0,.356,2/3,1]:a.sheet==='oddities'?[0,1/3,.681,1]:[0,1/3,2/3,1],ys=a.sheet==='legacy'?[0,.5,1]:a.sheet==='oddities'?[0,.355,.643,1]:[0,1/3,2/3,1],col=a.cell%3,row=Math.floor(a.cell/3);return{x:xs[col],y:ys[row],w:xs[col+1]-xs[col],h:ys[row+1]-ys[row]}}
export function atlasCSS525(f){const a=artSpec525(f),fuv=artFrame525(f),url=a.sheet.endsWith('534')?`./assets/fishing534/${a.sheet.replace('534','')}.webp`:a.sheet.endsWith('533')?`./assets/fishing533/${a.sheet.replace('533','')}.webp`:a.sheet.endsWith('532')?`./assets/fishing532/${a.sheet.replace('532','')}.webp`:a.sheet==='collection531'?'./assets/fishing531/collection.webp':a.sheet==='legacy'?'./assets/fishing524/fish-atlas.webp':`./assets/fishing525/${a.sheet}.webp`;return{url,size:`${100/fuv.w}% ${100/fuv.h}%`,position:`${fuv.w===1?0:fuv.x/(1-fuv.w)*100}% ${fuv.h===1?0:fuv.y/(1-fuv.h)*100}%`}}
