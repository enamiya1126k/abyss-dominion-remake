// First-goal party rules. Old points remain zero-valued only for save compatibility.
export const RULES469={id:'first-goal-469',cardLimit:1,baseDice:2,finish:'first-goal'};
export function configureCard469(c){
 c.points=0;delete c.score;
 if(['any','post'].includes(c.timing))c.timing='pre';
 const change=(fx,summary,text,note='カード使用は手番に1回')=>{c.effects=fx;c.summary466=summary;c.text=text;c.note466=note;c.timing='pre'};
 if(c.id.endsWith('-15')&&!c.set)change([{type:'resonance',attr:c.attrs[0]}],'属性があれば出目＋4','ほかの手札に同じ属性があれば出目＋4。なければ＋2。次のカードを待たず、このサイコロに加算。');
 if(c.id.startsWith('relic-'))change([{type:'bonus',n:3}],'出目＋3','合計出目に3を加える。宝物を使ってゴールへ近づく。');
 if(/^(yori|rion|enami|hide)-5$/.test(c.id))change([{type:'direct',n:10}],'確定で10マス進む','10マス進む。この手番はサイコロなし。移動先のマス効果なし（神殿の初回到着を除く）。');
 if(c.id==='nothing')change([{type:'draw',n:1,mode:'safe'},{type:'bonus',n:1}],'安全に1枚＋出目1','安全に1枚引き、出目＋1。悪い速攻は無効。');
 if(c.id==='treasure')change([{type:'piece'}],'未所持の絵柄を1種','いちばんそろっている未完成シリーズの、持っていない絵柄1種を山札・捨て札から獲得。見つからなければ安全に1枚引く。');
 if(c.id==='hide-date')change([{type:'special'}],'覚醒能力を獲得','公開の覚醒能力を1つ獲得する。すでにあれば残す1つを選ぶ。');
 if(c.id==='phoenix')change([{type:'move',n:3}],'使うと＋3マス','使うと3マス進む。使用時の追加発動はない。ほかの効果で捨てられると2マス進む。移動先のマス効果なし。','捨てられると＋2マス');
 if(c.id==='hide'){change([{type:'recover',n:2},{type:'bonus',n:4}],'2枚回収＋出目4','捨て札から2枚回収し、出目＋4。回収した速攻は手札に保持。');}
 if(c.id==='cerberus')change([{type:'move',n:-3,target:'choose',harmful:true},{type:'draw',n:1,mode:'safe'}],'相手−3マス＋1枚','相手1人を3マス戻し、安全に1枚引く。移動先のマス効果なし。');
 if(c.id==='destroyer')change([{type:'discard',n:1,target:'allOthers',harmful:true},{type:'move',n:-3,target:'allOthers',harmful:true}],'敵全員 −1枚・−3マス','相手全員の手札を1枚ずつ捨て、3マスずつ戻す。移動先のマス効果なし。');
 if(c.id==='fremens')change([{type:'draw',n:2,mode:'safe'},{type:'bonus',n:5}],'安全に2枚＋出目5','安全に2枚引き、出目＋5。');
 if(c.id==='principal')change([{type:'draw',n:3,mode:'hold'}],'速攻も保持して3枚','3枚引く。引いた速攻は発動せず手札に保持し、次の自分の手番に使える。');
 if(c.set==='heroes'){change([{type:'move',n:10},{type:'draw',n:2,mode:'safe'},{type:'discard',n:1,target:'allOthers',harmful:true}],'4種：＋10マス・2枚','4種類を1枚ずつ消費。10マス進む→安全に2枚引く→相手全員の手札を1枚ずつ捨てる。移動先の効果なし。','4枚まとめて1回の使用');c.timing='set';c.copies=3;}
 if(c.set==='dark'){change([{type:'move',n:8},{type:'move',n:-8,target:'leader',harmful:true},{type:'recover',n:2}],'4種：自分＋8・先頭−8','4種類を1枚ずつ消費。自分が8マス進む→先頭の相手を8マス戻す→捨て札から2枚回収。移動先の効果なし。','4枚まとめて1回の使用');c.timing='set';c.copies=3;}
 if(c.id.startsWith('affliction-')){c.effects[0].n=2;c.summary466='自分の指定属性 −2枚';c.note466='速攻・対象属性は枠色';c.text='速攻。指定属性の自分の手札をランダムに最大2枚捨てる。';}
 if(c.id==='poison'){c.effects=[{type:'move',n:-2,harmful:true},{type:'discard',n:1,harmful:true}];c.summary466='自分 −2マス・−1枚';c.text='速攻。自分が2マス戻り、手札をランダムに1枚捨てる。移動先の効果なし。';c.note466='引いた瞬間に発動';}
 if(c.id==='sleep'){c.effects=[{type:'move',n:-3,harmful:true}];c.summary466='自分 −3マス';c.text='速攻。自分が3マス戻る。手番は続く。移動先の効果なし。';c.note466='手番は続きます';}
 if(c.id==='cup'){c.effects=[{type:'catastrophe',n:2,harmful:true}];c.summary466='自分の手札 −2枚';c.text='速攻。手札をランダムに2枚失う。より・えなみ属性を1枚捨てて回避できる。';}
 if(c.id==='thunder'){c.effects[0].n=-3;c.summary466='全員 −3マス';c.text='速攻。自分を含む全員が3マス戻る。移動先の効果なし。';}
 if(c.id==='curse-goal'){c.summary466='ゴール直前で−6マス';c.note466='到達時に呪いは全解除';c.text='ゴール到達時、6マス戻る。この種類の呪いをすべて捨てる。浄化・交換・奪取でも手放せる。';}
 if(c.id==='forest'){c.effects=[{type:'draw',n:2,mode:'safe'}];c.summary466='安全に2枚ドロー';c.text='速攻。安全に2枚引く。手札を捨てる調整は不要。';c.note466='山札に1枚だけ';}
 if(c.id==='dove'){c.effects=[{type:'discard',n:2,select:true,cost:true},{type:'bonus',n:5}];c.summary466='2枚捨て→出目＋5';c.text='手札を最大2枚選んで捨て、出目＋5。手札が足りなければ残りをすべて捨てる。';c.note466='サイコロも振れます';}
 if(c.id==='phoenix')c.onDiscard=2;
 c.category469=c.defense?'防御':c.set?'切り札':c.timing==='instant'?'速攻':c.kind==='curse'?'呪い':c.effects.some(e=>e.type==='steal'||e.type==='stealSpecial')?'奪取':c.effects.some(e=>e.harmful)?'妨害':c.effects.some(e=>['move','bonus','dice','direct','resonance'].includes(e.type))?'加速':c.effects.some(e=>['special','piece'].includes(e.type))?'覚醒':'補充';
}
export function configureSpecial469(s){s.points=0;const texts={
 genius:'サイコロの素の合計が7未満なら7として数える。そのあとカードの出目補正を加算する。',
 chuni:'自分の移動前、手札2枚を捨てて出目＋5。カード使用の代わりに1回。',
 surprise:'自分の移動前、単独最下位なら手札2枚を捨てて相手全員を2マス戻す。カード使用の代わりに1回。',
 thief:'自分の手番開始時、単独最下位なら出目＋3。ゴールの横取りはしない。',
 drunk:'自分の手番開始時、より属性の手札があれば出目＋2。より属性の悪い速攻を無効化。',
 punch:'自分の移動前、前後4マス以内の相手1人を3マス戻す。カード使用の代わりに1回。',
 shiva:'悪い速攻を無効化。自分の移動前、手札1枚を防御札にできる。カード使用の代わりに1回。保持1枚まで。',
 buddha:'悪い速攻を無効化。自分の手番開始時、覚醒能力の出目補正＋1。',
 hacker:'引いた速攻を手札に保持。自分の移動前に1枚として使える。奪取・交換で渡すと、渡した先で速攻が発動。',
 greed:'自分への補充・破棄、自分が奪う枚数が2倍。強制破棄も2倍。移動・サイコロ・支払コストはそのまま。'
 };if(texts[s.id])s.text=texts[s.id];}
export function cardValue469(c,p,g){if(!c)return 0;if(c.kind==='curse')return -20;if(c.kind==='bad')return -8;if(c.set)return 8+new Set(p.hand.map(u=>g.cards[u]).filter(id=>id.startsWith(c.set==='heroes'?'face-':'dark-'))).size*3;if(c.defense)return 9;return c.effects.reduce((n,e)=>n+({bonus:2,dice:5,move:e.n>0?1:.6,direct:1,draw:p.hand.length<5?3:1,steal:3,piece:8,special:8,resonance:7,cleanse:p.hand.some(u=>g.cards[u].startsWith('curse'))?15:1}[e.type]??2)*Math.abs(e.n??1),0);}
