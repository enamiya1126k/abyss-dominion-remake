import{rankInfo466}from'./CardRanks466.js';
import{ATTRS463}from'./Board463.js';
export const CARDS463=[];
function card(id,name,attrs,points,timing,effects,extra={}){const c={id,name,attrs,points,timing,effects,kind:'normal',copies:3,art:0,...extra};CARDS463.push(c);return c}
const themes={yori:['拳の疾走','青い衝動','海原の一歩','拳の連撃','拳の加速','蒼雷の突進','影の小突き','氷のけん制','蒼の盗賊','青い引力','海辺の交換','旅の備え','拳の護り','蒼の書庫','潮の記憶','海原の共鳴'],rion:['森の疾走','緑の衝動','木漏れ日の一歩','風の連撃','森の加速','翠嵐の突進','蔦の小突き','根のけん制','森の盗賊','緑の引力','森の交換','薬草の備え','風の護り','翠の書庫','森の記憶','森の共鳴'],enami:['メンタル疾走','橙の衝動','炎の一歩','炎の連撃','炎の加速','跳躍メンタル','塩の小突き','炎のけん制','炎の盗賊','橙の引力','焚火の交換','香辛料の備え','炎の護り','橙の書庫','炎の記憶','炎の共鳴'],hide:['ピンクの疾走','桃の衝動','星明かりの一歩','魔法の連撃','魔法の加速','ひでの大跳躍','呪いの小突き','闇のけん制','魔法の盗賊','桃の引力','秘密の交換','魔法の備え','闇の護り','桃の書庫','星の記憶','溶岩帯']};
for(let ai=0;ai<4;ai++){
 const a=ATTRS463[ai],names=themes[a.id];
 const templates=[
 ['pre',1,[{type:'bonus',n:2}],0,'合計出目＋2。'],
 ['pre',2,[{type:'bonus',n:3}],0,'合計出目＋3。'],
 ['pre',1,[{type:'move',n:2}],1,'2マス進む。移動先のマス効果は発動しない。'],
 ['pre',2,[{type:'dice',n:1}],0,'サイコロを1個追加して振る。'],
 ['pre',-1,[{type:'dice',n:2}],0,'サイコロを2個追加して振る。'],
 ['pre',1,[{type:'direct',n:6}],1,'6マス進む。このターンはサイコロを振らない。移動先のマス効果は発動しない。'],
 ['pre',1,[{type:'move',n:-2,target:'choose',harmful:true}],2,'相手1人を2マス戻す。移動先のマス効果は発動しない。'],
 ['any',-1,[{type:'discard',n:2,target:'choose',harmful:true}],2,'相手1人の手札をランダムに2枚捨てる。'],
 ['pre',2,[{type:'steal',n:1,target:'choose',harmful:true}],3,'相手1人の裏向きの手札から1枚引く。呪いを引くこともある。'],
 ['pre',-2,[{type:'steal',n:2,target:'choose',harmful:true}],3,'相手1人の裏向きの手札から2枚引く。'],
 ['any',1,[{type:'swapHand',n:2,target:'choose',harmful:true}],3,'相手1人とランダムに手札を2枚ずつ交換する。'],
 ['any',1,[{type:'draw',n:2}],4,'カードを2枚引く。速攻は発動する。'],
 ['reaction',-3,[],5,'自分へのカード1枚またはマス1つの効果をすべて無効化する。'],
 ['pre',-1,[{type:'draw',n:2,mode:'safe'}],4,'カードを2枚引く。悪い速攻は無効にして捨てる。'],
 ['any',1,[{type:'draw',n:1}],6,'カードを1枚引く。このカードが捨てられると1マス進む。'],
 ['pre',-1,[{type:'boostAttr',attr:a.id}],7,`このターン、次に使う${a.name}属性カードの移動・補充・破棄枚数を2倍にする。`]
 ];
 templates.forEach(([timing,points,fx,art,text],j)=>card(`${a.id}-${j}`,names[j],[a.id],points,timing,fx,{art,text,copies:j===4?2:3,...(j===12?{defense:true}:{}),...(j===14?{onDiscard:1}:{})}));
}
for(let i=0;i<4;i++){
 const a=ATTRS463[i];
 card(`relic-${a.id}`,`${a.name}の宝物`,[a.id],8,'passive',[],{art:8,copies:4,text:'使う効果はない。手札に残して8点を獲得する。'});
 card(`affliction-${a.id}`,`${a.name}の災難`,[a.id],0,'instant',[{type:'discardAttr',attr:a.id,harmful:true}],{kind:'bad',art:9,copies:2,text:`速攻。自分の${a.name}属性の手札をすべて捨てる。`});
 card(`gift-${a.id}`,`${a.name}の追い風`,[a.id],0,'instant',[{type:'draw',n:2,mode:'safe'},{type:'bonus',n:1}],{kind:'good',art:4,copies:2,text:'速攻。カードを2枚引く（悪い速攻は無効）。このターンの合計出目＋1。'});
 card(`mixed-${i}`,`${a.name}と${ATTRS463[(i+1)%4].name}の約束`,[a.id,ATTRS463[(i+1)%4].id],4,'pre',[{type:'draw',n:1},{type:'bonus',n:2}],{art:7,text:'カードを1枚引き、合計出目＋2。2つの属性として扱う。'});
 card(`face-${i}`,`四勇者の肖像・${a.name}`,[a.id],2,'set',[{type:'move',n:10},{type:'draw',n:3,mode:'safe'},{type:'discard',target:'allOthers',n:3,harmful:true}],{set:'heroes',part:i,art:12+i,copies:2,kind:'set',text:'4種類をそろえて全4枚を消費。10マス進む→安全に3枚引く→相手全員の手札を3枚ずつ捨てる。移動先のマス効果なし。'});
 card(`dark-${i}`,`闇を持つひで・${['左上','右上','左下','右下'][i]}`,['hide'],1,'set',[{type:'recover',n:6},{type:'resetLeader',harmful:true,target:'leader'}],{set:'dark',part:i,art:9,copies:2,kind:'set',text:'4パーツをそろえて全4枚を消費。捨て札から6枚選んで回収→先頭の相手をスタートへ戻す。回収した速攻は手札に保持。'});
}
const extra=[
 ['exchange','特殊カード交換',[],0,'instant',[{type:'special'}],{kind:'exchange',copies:16,art:10,text:'公開する特殊カードをランダムに1枚獲得。すでに持っていれば残す1枚を選ぶ。'}],
 ['curse-goal','無念・帰れない呪い',[], -5,'passive',[],{kind:'curse',curse:'goal',copies:3,art:9,text:'持っている間はゴール不可。到達すると20マス戻り、この呪いを1枚捨てる。交換・奪取で相手に渡せる。'}],
 ['curse-heavy','鉛の呪い',[], -4,'passive',[],{kind:'curse',curse:'heavy',copies:3,art:9,text:'所持中、サイコロの合計出目−2（最低1）。複数枚でも−2。交換・奪取で相手に渡せる。'}],
 ['curse-hunger','底なしの呪い',[], -8,'passive',[],{kind:'curse',curse:'hunger',copies:3,art:9,text:'自分の手番開始時に、ほかの手札をランダムに1枚失う。複数枚でも1枚。'}],
 ['cleanse','浄化の灯',[],2,'any',[{type:'cleanse'},{type:'draw',n:1}],{kind:'good',art:5,text:'自分の呪いをすべて捨てて、カードを1枚引く。'}],
 ['chance','チャンス！！！',[],5,'pre',[{type:'swapSpecial',target:'choose',harmful:true}],{kind:'good',art:10,text:'相手1人と特殊カードを交換する。片方だけの所持でも交換できる。'}],
 ['rob-special','王冠泥棒',[], -3,'pre',[{type:'stealSpecial',target:'choose',harmful:true}],{art:3,text:'相手1人の特殊カードを奪う。所持中なら残す1枚を選ぶ。'}],
 ['break-special','忘却の雷',[], -2,'any',[{type:'loseSpecial',target:'choose',harmful:true}],{art:2,text:'相手1人の特殊カードを捨てる。'}],
 ['dove','ハト払い', ['yori'],2,'pre',[{type:'discardMove'}],{art:1,text:'手札を好きな枚数捨て、その枚数だけ進む。そのターンはサイコロなし。移動先のマス効果なし。'}],
 ['mental','不屈のメンタル',['enami'],3,'any',[{type:'discard',n:1,select:true},{type:'draw',n:3,mode:'safe'}],{art:4,text:'手札を1枚捨てて、安全に3枚引く。'}],
 ['guard','破片になっても', ['enami'],-3,'reaction',[],{defense:true,copies:6,art:5,text:'自分へのカード1枚またはマス1つの効果をすべて無効化する。相手のターンでも防御に使える。'}],
 ['reflect','鏡のいたずら',['hide'],-4,'reaction',[],{defense:true,reflect:true,art:5,text:'自分を対象にした相手のカードを1回だけ相手へ跳ね返す。マスや速攻なら無効化する。'}],
 ['cerberus','声の良いケルベロス',['rion'],10,'pre',[{type:'move',n:1,event:true,target:'chooseAny',harmful:true},{type:'skip',n:1,target:'choose',harmful:true},{type:'discard',n:3,target:'choose',harmful:true}],{kind:'rare',art:11,copies:1,text:'誰か1人を1マス進め、移動先のマス効果も発動→相手1人を1回休み→相手1人の手札を3枚捨てる。'}],
 ['fremens','フレメンズはいいぞ',['yori','rion','enami','hide'],5,'post',[{type:'draw',n:3,mode:'safe'},{type:'extraTurn'}],{kind:'rare',art:7,copies:1,text:'安全に3枚引き、追加ターンを得る。追加ターンからさらに追加ターンは得られない。'}],
 ['hide','ひで・秘蔵の一枚',['hide'],40,'pre',[{type:'recover',n:4},{type:'bonus',n:4}],{kind:'rare',art:15,copies:1,text:'捨て札から4枚回収し、合計出目＋4。使うと40点を失う。回収した速攻は手札に保持。'}],
 ['fist','539.936kgの拳',['yori'],5,'pre',[{type:'special'},{type:'move',n:7},{type:'draw',n:2,mode:'safe'},{type:'discard',target:'allOthers',n:1,harmful:true}],{kind:'rare',art:12,copies:1,text:'特殊カード獲得→7マス進む→安全に2枚引く→相手全員が1枚失う。移動先のマス効果なし。'}],
 ['destroyer','破壊神ヒデ',['hide'],-5,'pre',[{type:'loseSpecial',target:'allOthers',harmful:true},{type:'discard',target:'allOthers',n:3,harmful:true},{type:'move',target:'allOthers',n:-3,harmful:true}],{kind:'rare',art:15,copies:1,text:'相手全員の特殊カードを破棄→手札を3枚ずつ破棄→3マスずつ戻す。移動先のマス効果なし。'}],
 ['principal','園長先生（より）',['yori'],-4,'pre',[{type:'draw',n:4,mode:'hold'}],{art:4,text:'カードを4枚引く。速攻は発動せず手札に保持する。'}],
 ['forest','森のより',['yori'],0,'instant',[{type:'handSize',n:5}],{kind:'good',copies:3,art:6,text:'速攻。手札を5枚にそろえる。不足分は安全に引き、余分は自分で選んで捨てる。'}],
 ['poison','毒',[],0,'instant',[{type:'skip',n:1,harmful:true},{type:'discardAttr',attr:'rion',harmful:true}],{kind:'bad',art:9,copies:2,text:'速攻。次の手番を1回休み、りおん属性の手札をすべて捨てる。'}],
 ['sleep','よりの寝落ち',['yori'],0,'instant',[{type:'endNow',harmful:true}],{kind:'bad',art:9,copies:2,text:'速攻。今が自分のターンなら直ちに終了。それ以外は次の手番を1回休む。'}],
 ['cup','土佐鶴ワンカップ',[],0,'instant',[{type:'catastrophe',harmful:true}],{kind:'bad',art:9,copies:2,text:'速攻。手札をすべて失う。より・えなみ属性を1枚捨てて回避できる。'}],
 ['experiment','ヒデの化学実験',['hide'],0,'instant',[{type:'move',n:-2,target:'allOthers',harmful:true}],{kind:'good',art:2,copies:2,text:'速攻。相手全員を2マス戻す。移動先のマス効果なし。'}],
 ['thunder','奇行ヒデ',['hide'],0,'instant',[{type:'move',n:-5,target:'all',harmful:true}],{kind:'bad',art:2,copies:2,text:'速攻。自分を含む未ゴールの全員が5マス戻る。移動先のマス効果なし。'}],
 ['hide-date','ヒデート風',['hide'],2,'passive',[],{score:'specialDouble',art:8,copies:2,text:'精算時、特殊カードの印刷点を2倍にする。マイナス点も2倍。複数枚でも2倍。'}],
 ['nothing','10kg',[],1,'passive',[],{art:8,copies:5,text:'特に効果なし。無属性なので4属性の指定効果を受けない。'}],
 ['treasure','星の財宝',[],12,'passive',[],{art:8,copies:3,text:'手札に残して12点。無属性。'}],
 ['phoenix','人類の進化とは',['hide'],1,'passive',[],{onDiscard:2,art:6,copies:4,text:'このカードが捨てられると2マス進む。移動先のマス効果は発動しない。'}]
];
for(const args of extra)card(...args);
for(const c of CARDS463)Object.assign(c,rankInfo466(c));
export const CARD_BY_ID463=Object.fromEntries(CARDS463.map(c=>[c.id,c]));
export const SPECIALS463=[
 ['worker','限界社畜',10,'一回休みと後退を無効化。サイコロの4・5・6は1として数える。',0],
 ['grudge','怨念',3,'後退させられた時、攻撃者から1枚奪い、安全に2枚引く。自分の手番につき1回。',9],
 ['chuni','厨二病',-5,'終了時に手札2枚を捨てて追加ターン。追加ターン中は再発動不可。',12],
 ['surprise','サプライズ',-3,'開始時に単独最下位なら、手札2枚を捨てて相手全員を2マス戻せる。',4],
 ['want','物欲',10,'手番開始時に相手1人の裏向きの手札から1枚引く。',3],
 ['genius','天才',10,'サイコロの代わりに手札枚数だけ進む（1〜10マス）。移動先のマス効果は発動する。',4],
 ['hacker','ハッカー',3,'自分が引いた速攻を発動させず手札に保持する。奪取・交換で渡すと新しい持ち主に速攻が発動する。',9],
 ['greed','強欲',5,'自分への補充・破棄、自分が奪う枚数を2倍にする。強制破棄も2倍。得点・サイコロ・移動・支払コストは変わらない。',8],
 ['power','権力',10,'黒いマスのイベントを無効化する。',10],
 ['buddha','ブッダ',-10,'悪い速攻を無効化。相手がスタートへ戻された後の自分の手番はサイコロを2個追加。',5],
 ['tsundere','ツンデレ',-15,'自分1人を対象にした相手の攻撃を跳ね返せる。各相手ターンに1回。跳ね返しは連鎖しない。',5],
 ['thief','怪盗',-20,'最初のゴールが確定する直前に割り込み、自分が1位、相手が2位になる。自分がゴールを阻む呪いを持つ場合は発動しない。',3],
 ['drunk','酒乱',-7,'精算時、より属性の手札1枚につき＋3点。より属性の悪い速攻を無効化。',12],
 ['shiva','シヴァ',-15,'悪い速攻を無効化。自分のターン中に手札を1枚防御札にできる。保持は1枚まで。',15],
 ['punch','拳',-5,'終了時、前後2マス以内の相手1人をサイコロ1個の出目だけ戻せる。',12],
 ['swift','瞬足',5,'手番開始時に安全に1枚追加で引き、手札を1枚選んで捨てる。',1]
].map(([id,name,points,text,art])=>({id,name,points,text,art}));
export const SPECIAL_BY_ID463=Object.fromEntries(SPECIALS463.map(s=>[s.id,s]));
export const TIMING463={pre:'移動前',post:'移動後',any:'自分のターン',reaction:'防御',passive:'持っている間',instant:'速攻',set:'4枚完成・移動前'};
export const isInstant463=c=>c?.timing==='instant';
export const hasAttr463=(c,a)=>c?.attrs.includes(a);
export const DECK_COUNT463=CARDS463.reduce((n,c)=>n+c.copies,0);
