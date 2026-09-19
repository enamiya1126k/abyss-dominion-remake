import{crystalTile477}from'./CrystalRules477.js';
import{landmarkRules469}from'./Landmarks469.js';
// Authored board; no rules or text are baked into its illustration.
const effects={
 draw:{name:'カードの泉',icon:'＋',tone:'blue',text:'カードを2枚引く。速攻は発動する。',effects:[{type:'draw',n:2}]},
 safe:{name:'静かな書庫',icon:'本',tone:'green',text:'カードを2枚引く。悪い速攻は無効にして捨てる。',effects:[{type:'draw',n:2,mode:'safe'}]},
 move:{name:'追い風',icon:'↑',tone:'green',text:'3マス進む。移動先のマス効果は発動しない。',effects:[{type:'move',n:3}]},
 back:{name:'逆風',icon:'↓',tone:'purple',text:'2マス戻る。移動先のマス効果は発動しない。',effects:[{type:'move',n:-2,harmful:true}]},
 skip:{name:'眠りの霧',icon:'休',tone:'black',text:'次の自分の手番を1回休む。',effects:[{type:'skip',n:1,harmful:true}]},
 trade:{name:'すり替え市場',icon:'⇄',tone:'pink',text:'相手を1人選び、手札をランダムに1枚ずつ交換する。',effects:[{type:'swapHand',n:1,target:'choose',harmful:true}]},
 discard:{name:'奈落の徴収',icon:'捨',tone:'black',text:'手札を2枚選んで捨てる。',effects:[{type:'discard',n:2,select:true,harmful:true}]},
 special:{name:'運命の祭壇',icon:'◆',tone:'gold',text:'特殊カードを1枚獲得する。所持中なら残す1枚を選ぶ。',effects:[{type:'special'}]},
 lose:{name:'忘却の門',icon:'×',tone:'black',text:'特殊カードを失う。',effects:[{type:'loseSpecial',harmful:true}]},
 steal:{name:'影の取引',icon:'奪',tone:'purple',text:'相手を1人選び、裏向きの手札から1枚を引く。',effects:[{type:'steal',n:1,target:'choose',harmful:true}]},
 rest:{name:'月明かり',icon:'月',tone:'blue',text:'カードを1枚引く。',effects:[{type:'draw',n:1}]},
 cleanse:{name:'浄化の泉',icon:'浄',tone:'green',text:'呪いをすべて捨てて、カードを1枚引く。',effects:[{type:'cleanse'},{type:'draw',n:1}]},
 wager:{name:'宝庫の契約',icon:'宝',tone:'gold',text:'手札を1枚捨てて、カードを3枚引く。',effects:[{type:'discard',n:1,select:true},{type:'draw',n:3}]},
 attribute:{name:'属性の審判',icon:'属',tone:'pink',text:'指定属性のカードを最大2枚捨てる。無属性は対象外。',effects:[]},
 gate:{name:'必ず止まる',icon:'門',tone:'gold',text:'残りの移動を止め、カードを2枚引く。特殊カードを1枚獲得する。',effects:[{type:'draw',n:2},{type:'special'}]}
};
export const ATTRS463=[{id:'yori',name:'より',color:'#52a8ff'},{id:'rion',name:'りおん',color:'#6ddba1'},{id:'enami',name:'えなみ',color:'#ffae61'},{id:'hide',name:'ひで',color:'#f18cc7'}];
const pattern=['rest','draw','move','safe','back','trade','wager','rest','draw','discard','move','steal','rest','safe','attribute','back','draw','cleanse','special','rest','skip','draw','move','discard','safe','rest','trade','special'];
export const BOARD463=[];
for(let i=0;i<80;i++){
 const row=Math.floor(i/8),col=row%2?7-i%8:i%8,kind=i===0?'start':i===79?'goal':pattern[(i-1)%pattern.length];
 const base=effects[kind]??{name:kind==='start'?'旅立ち':'星の王座',icon:kind==='start'?'始':'冠',tone:'gold',text:kind==='start'?'カードと運命の旅が始まる。':'最初に到着したプレイヤーがその場で優勝！',effects:[]};
 const node={...base,id:String(i),index:i,x:280+col*135,y:130+row*160,next:i<79?[String(i+1)]:[],kind,effects:base.effects.map(e=>({...e}))};
 if(kind==='attribute'){const a=ATTRS463[Math.floor(i/8)%4];node.text=`${a.name}属性の手札を最大2枚捨てる。無属性は対象外。`;node.effects=[{type:'discardAttr',attr:a.id,harmful:true}];node.icon=a.name.slice(0,1)}
 BOARD463.push(crystalTile477(landmarkRules469(node)));
}
for(const [index,dir] of [[7,1],[31,-1],[55,1]]){
 const root=BOARD463[index],types=['safe','wager','special','cleanse'],coords=[[140,-20],[260,20],[260,125],[140,160]];
 root.next=[String(index+1),`b${index}-0`];root.fork=true;
 for(let j=0;j<4;j++){const b=effects[types[j]];BOARD463.push({...b,id:`b${index}-${j}`,index:index+(j+1)/5,x:root.x+coords[j][0]*dir,y:root.y+coords[j][1],kind:types[j],detour:true,next:[j===3?String(index+1):`b${index}-${j+1}`],effects:b.effects.map(e=>({...e}))})}
}
export const NODES463=Object.fromEntries(BOARD463.map(n=>[n.id,n]));
export const GOAL463='79';
export function distance463(id){const n=NODES463[id];if(!n)return 79;return n.next.length?1+Math.min(...n.next.map(distance463)):0}
export const BOARD_SIZE463={width:1600,height:1730};
