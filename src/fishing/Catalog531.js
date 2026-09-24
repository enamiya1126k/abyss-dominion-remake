// One art cell per catch. Weights are fantasy-game kilograms, not zoological data.
const fish=(id,name,tier,base,kg,difficulty,color,cell,extra={})=>Object.freeze({id,name,tier,base,kg,difficulty,color,size:tier===4?4:tier>=2?1.5:.8,art525:{sheet:'collection531',cell},...extra});
const special={exclusive525:true,special531:true};
const lure={item525:true,lure525:true};
const boss={terminal525:true};
export const EXTRA_CATCHES531=Object.freeze([
 fish('smelt','真珠ワカサギ',0,26,.3,.78,'#bfeae8',0),
 fish('loach','金縞ドジョウ',0,29,.5,.85,'#e0b579',1),
 fish('perch','翠玉パーチ',1,70,3.2,1.2,'#89d3a5',2),
 fish('shrimp','瑠璃テナガエビ',0,34,.6,.9,'#75c7e1',3),
 fish('sawshark','蒼刃ノコギリザメ',3,248,45,2.05,'#83afde',4),
 fish('moray','紫紋ウツボ',2,140,16,1.7,'#c493dc',5),
 fish('nautilus','螺旋オウムガイ',2,150,11,1.6,'#7edbce',6),
 fish('stormfish','雷鱗シーラカンス',3,345,64,2.12,'#9c9ff0',7,special),
 fish('moonray','月翼マンタ',3,350,72,2.15,'#dce3f3',8,special),
 fish('sunmarlin','炎帆カジキ',3,360,82,2.2,'#ffb07e',9,special),
 fish('crystaleel','水晶リュウウナギ',3,338,58,2.08,'#83eaf7',10,special),
 fish('abyssangler','冥灯アンコウ',3,355,76,2.18,'#ca9eee',11,special),
 fish('moonlure','月影スプーン',0,8,.2,.55,'#dce3f3',12,{...lure,specialId531:'moonray'}),
 fish('flamelure','焔のスピナー',0,8,.2,.55,'#ffb07e',13,{...lure,specialId531:'sunmarlin'}),
 fish('crystallure','水晶ミノー',0,8,.2,.55,'#83eaf7',14,{...lure,specialId531:'crystaleel'}),
 fish('abysslure','深淵ジグ',0,8,.3,.55,'#ca9eee',15,{...lure,specialId531:'abyssangler'}),
 fish('stormlure','雷羽フェザー',0,8,.1,.55,'#9c9ff0',16,{...lure,specialId531:'stormfish'}),
 fish('elderturtle','万年玄武・コケガメ',4,790,460,2.65,'#acd292',17,boss),
 fish('leviathan','深淵竜・ヨルナギ',4,840,510,2.85,'#b7a2eb',18,boss),
 fish('crownkoi','星冠大鯉・アマツ',4,810,440,2.7,'#f3d78e',19,boss)
]);
export const LORD_IDS531=Object.freeze(['lord','elderturtle','leviathan','crownkoi','arapaima','grouper']);
export const ROD_THRESHOLDS531=Object.freeze([0,2,5,9,14,20,27,35]);
export const MAX_CHAIN531=8;
export function rodLevel531(xp=0){let level=1;for(let i=1;i<ROD_THRESHOLDS531.length;i++)if(xp>=ROD_THRESHOLDS531[i])level=i+1;return level}
export function rodMeter531(p){const xp=p.rodXP531??Math.max(p.caught??0,ROD_THRESHOLDS531[Math.min(7,(p.rod??1)-1)]??0),level=rodLevel531(xp),floor=ROD_THRESHOLDS531[level-1],next=ROD_THRESHOLDS531[level];return{xp,level,current:xp-floor,needed:next==null?0:next-floor,ratio:next==null?1:(xp-floor)/(next-floor)}}
// Every tier retains a non-zero chance in every band; these are tendencies, not locks.
export function depthWeights531(y){const d=Math.max(0,Math.min(1,(.75-y)/.58));return d<.34?[.67,.26,.06,.01]:d<.67?[.18,.46,.28,.08]:[.05,.18,.40,.37]}
export function depthTier531(y,random){const weights=depthWeights531(y),v=random();let total=0;return weights.findIndex((w,i)=>(total+=w)>v||i===3)}
export const zoneName531=y=>y>.553?'岸辺 · 小魚中心':y>.361?'中ほど · 多彩な魚':'沖 · 大型・深海魚';
