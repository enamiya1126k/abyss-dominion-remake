// Append-only photo expansion: one original photo and one deck copy per card.
// Existing B-001..B-116 and S-001..S-016 keep their identities.
import{RANKS466}from'./CardRanks466.js';
import{configureCard469}from'./Rules469.js';
const bonus=n=>({type:'bonus',n}),draw=(n,mode='safe')=>({type:'draw',n,mode});
const move=n=>({type:'move',n}),back=n=>({type:'move',n:-n,target:'choose',harmful:true});
const discard=n=>({type:'discard',n,target:'choose',harmful:true});
const steal=n=>({type:'steal',n,target:'choose',harmful:true});
const swap=n=>({type:'swapHand',n,target:'choose',harmful:true});
const recover=n=>({type:'recover',n}),dice=n=>({type:'dice',n});
const cleanse={type:'cleanse'},piece={type:'piece'},special={type:'special'};
const gems=mode=>({type:'crystal477',mode,...(mode==='steal'?{target:'choose',harmful:true}:{})});
const guard={timing:'reaction',defense:true};
const bad={timing:'instant',kind:'bad'};
const selfDiscard=n=>({type:'discard',n,harmful:true});
const rows=[
 ['karaoke-void','深夜カラオケ・虚無','hide','SR',[{...move(-2),harmful:true}], '自分 −2マス','速攻。自分が2マス戻る。手番は続く。',bad],
 ['firework-spark','花火・スパーク','hide','SSR',[dice(1),draw(1)],'サイコロ＋1個・安全に1枚','サイコロを1個追加し、安全に1枚引く。'],
 ['spicy-curry','18禁カレー辛すぎた','enami,yori','SR',[{...move(-2),harmful:true},selfDiscard(1)],'自分 −2マス・−1枚','速攻。自分が2マス戻り、手札をランダムに1枚捨てる。',bad],
 ['lord-hide','HIDE様','hide','神話',[gems('steal')],'相手の💎を全額奪う','相手1人の対戦用💎を全額奪う。防御・反射が可能。プレイヤー間の移転なので総量は増えない。'],
 ['punch-machine','パンチングマシーン破壊','yori','UR',[back(4),draw(1)],'相手−4マス・安全に1枚','相手1人を4マス戻し、安全に1枚引く。'],
 ['night-sky','夜空鑑賞','rion,yori','SSR',[cleanse,draw(2)],'呪い解除・安全に2枚','自分の呪いをすべて捨て、安全に2枚引く。'],
 ['bichikuso','ビチクソ','hide','UR',[selfDiscard(2)],'自分の手札 −2枚','速攻。自分の手札をランダムに2枚捨てる。',bad],
 ['umbrella-splash','映え','hide','SSR',[piece],'未所持の絵柄を1種','いちばんそろっている未完成シリーズの未所持の絵柄を1種獲得。山札・捨て札にない場合は安全に1枚引く。'],
 ['pad-armor','パッド装着中','hide','SSR',[],'攻撃・マスを無効','自分へのカード1枚またはマス1つの効果をすべて無効化する。',guard],
 ['symmetry','シンメトリ','hide','UR',[],'攻撃を跳ね返す','自分への相手の単体攻撃を1回だけ相手へ跳ね返す。反射できないマス・速攻は無効化する。',{...guard,reflect:true}],
 ['perm','パーマ','hide','SR',[swap(2),bonus(1)],'手札2枚交換・出目＋1','相手1人と手札をランダムに2枚ずつ交換し、出目＋1。交換した速攻は新しい持ち主に発動する。'],
 ['banquet','宴','hide,yori','SSR',[draw(2,'normal'),bonus(2)],'2枚引く・出目＋2','2枚引き、出目＋2。引いた速攻は発動する。'],
 ['blue-sky','青空','hide,yori','SR',[move(3),draw(1)],'自分＋3マス・安全に1枚','3マス進み、安全に1枚引く。'],
 ['hidden-hide','隠れ','hide','SSR',[],'攻撃・マスを無効','自分へのカード1枚またはマス1つの効果をすべて無効化する。',guard],
 ['sunset-trio','日の入・三人の時間','rion,hide,yori','LR',[recover(1),draw(1),bonus(3)],'1枚回収・1枚引く・出目＋3','捨て札から1枚選んで回収→安全に1枚引く→出目＋3。回収した速攻は手札に保持する。'],
 ['sunset-rion','日の入・りおん','rion','SR',[recover(1),bonus(2)],'1枚回収・出目＋2','捨て札から1枚選んで回収し、出目＋2。回収した速攻は手札に保持する。'],
 ['tengu-enami','天狗高原・えなみ','enami','SSR',[{type:'direct',n:8}],'確定で8マス進む','8マス進む。この手番はサイコロを振らない。'],
 ['tengu-rion','天狗高原・りおん','rion','SSR',[dice(1),bonus(1)],'サイコロ＋1個・出目＋1','サイコロを1個追加し、合計出目に1を加える。'],
 ['firework-mouth','花火咥え','hide','UR',[{...move(-3),harmful:true},selfDiscard(1)],'自分 −3マス・−1枚','速攻。自分が3マス戻り、手札をランダムに1枚捨てる。',bad],
 ['sea-bbq','海BBQ','rion','SR',[draw(2)],'安全に2枚','安全に2枚引く。悪い速攻は無効にして捨てる。'],
 ['meditation','瞑想','hide,yori','SR',[cleanse,bonus(2)],'呪い解除・出目＋2','自分の呪いをすべて捨て、出目＋2。'],
 ['enami-home','えなみの実家編','hide,rion','SSR',[draw(3,'hold')],'速攻も保持して3枚','3枚引く。速攻は発動せず手札に保持し、次の自分の手番に使える。'],
 ['white-hide','ひで・白ver','hide','SSR',[cleanse,move(3)],'呪い解除・自分＋3マス','自分の呪いをすべて捨て、3マス進む。'],
 ['tengu-hide','天狗高原・ひで','hide','UR',[dice(2)],'サイコロ＋2個','サイコロを2個追加して振る。合計は最大5個。'],
 ['tengu-hide-two','天狗高原2・ひで','hide','LR',[discard(2),bonus(2)],'相手−2枚・出目＋2','相手1人の手札をランダムに2枚捨て、出目＋2。'],
 ['surprised-pair','驚き','yori,hide','SSR',[back(3),bonus(2)],'相手−3マス・出目＋2','相手1人を3マス戻し、出目＋2。'],
 ['illumination','イルミネーション','yori,enami','SSR',[piece,bonus(1)],'未所持の絵柄・出目＋1','未完成シリーズの未所持の絵柄を1種獲得し、出目＋1。絵柄がなければ安全に1枚引く。'],
 ['sea-cucumber','ナマコ素手掴み','hide','SR',[steal(1),draw(1)],'相手から1枚・安全に1枚','相手1人の裏向きの手札から1枚奪い、安全に1枚引く。呪いを奪うこともある。'],
 ['peace-pair','ピース・ひでとえなみ','hide,enami','SR',[bonus(2),draw(1)],'出目＋2・安全に1枚','出目＋2。安全に1枚引く。'],
 ['nameless-river','名もなき川','yori,enami,hide','SSR',[move(4),draw(1)],'自分＋4マス・安全に1枚','4マス進み、安全に1枚引く。'],
 ['native-hide','先住民','hide','SSR',[recover(2)],'捨て札から2枚回収','捨て札から2枚選んで回収する。回収した速攻は発動せず手札に保持する。'],
 ['best-four','最高','yori,rion,enami,hide','十神',[cleanse,draw(2),bonus(4)],'呪い解除・2枚・出目＋4','自分の呪いをすべて捨て→安全に2枚引く→出目＋4。4属性のカードとして扱う。'],
 ['tengu-pair','天狗高原・二人の頂','enami,yori','UR',[move(5),bonus(1)],'自分＋5マス・出目＋1','5マス進み、出目＋1。サイコロも振れる。'],
 ['headache','頭痛そう','hide','SR',[{...move(-3),harmful:true}],'自分 −3マス','速攻。自分が3マス戻る。手番は続く。',bad],
 ['stone-worker','石職人','rion','SSR',[],'攻撃・マスを無効','自分へのカード1枚またはマス1つの効果をすべて無効化する。',guard],
 ['mario-pair','マリオ','hide,enami','UR',[move(4),dice(1)],'自分＋4マス・サイコロ＋1個','4マス進み、サイコロを1個追加して振る。'],
 ['cyborg-yori','サイボーグ','yori','LR',[back(5),bonus(1)],'相手−5マス・出目＋1','相手1人を5マス戻し、出目＋1。'],
 ['dive-hide','ダイビング前・ひで','hide','R',[draw(1),bonus(1)],'安全に1枚・出目＋1','安全に1枚引き、出目＋1。'],
 ['dive-rion','ダイビング前・りおん','rion','SR',[draw(2,'hold')],'速攻も保持して2枚','2枚引く。速攻は発動せず手札に保持する。'],
 ['sukumo-four','宿毛オブジェ','yori,enami,hide,rion','神話',[piece,draw(1),bonus(3)],'絵柄1種・1枚・出目＋3','未完成シリーズの未所持の絵柄を1種獲得→安全に1枚引く→出目＋3。絵柄がなければ安全に1枚引く。'],
 ['fish-face','顔面が魚すぎる','hide','SR',[swap(1),bonus(3)],'手札1枚交換・出目＋3','相手1人と手札をランダムに1枚ずつ交換し、出目＋3。交換した速攻は新しい持ち主に発動する。'],
 ['breathing-enami','呼吸に必死','enami','SSR',[],'攻撃・マスを無効','自分へのカード1枚またはマス1つの効果をすべて無効化する。',guard],
 ['guaranteed-light','確定演出の光','rion','神話',[special,bonus(2)],'覚醒能力獲得・出目＋2','特殊カードを1枚獲得し、出目＋2。すでに所持している場合は残す1枚を選ぶ。'],
 ['handsome-rion','イケメン','rion','SR',[bonus(4)],'出目＋4','サイコロの合計出目に4を加える。'],
 ['stylish-bar','シャレオツバー','rion','UR',[gems('double')],'対戦用💎を2倍に','対戦用💎を2倍にする。増加分は共有宝庫の残高と参加費4倍まで。上限を超えて所持中でも減らない。新たな💎は発行しない。'],
 ['tokushima-trio','in徳島','hide,enami,rion','LR',[draw(2),move(3)],'安全に2枚・自分＋3マス','安全に2枚引き、3マス進む。'],
 ['desert-island','いざ無人島へ','hide,rion','SSR',[{type:'direct',n:9}],'確定で9マス進む','9マス進む。この手番はサイコロを振らない。'],
 ['peace-yori','ピース・より','yori','R',[bonus(2)],'出目＋2','サイコロの合計出目に2を加える。'],
 ['before-breakfast','朝食前','hide','R',[draw(1),move(1)],'安全に1枚・自分＋1マス','安全に1枚引き、1マス進む。'],
 ['grinning-rion','ニヤニヤ','rion','SR',[steal(1),bonus(2)],'相手から1枚・出目＋2','相手1人の裏向きの手札から1枚奪い、出目＋2。呪いを奪うこともある。'],
 ['shell-gathering','貝採取中','hide','SR',[gems('gain'),draw(1)],'💎採取・安全に1枚','共有宝庫から参加費の20％分（最低1）の対戦用💎を受け取り、安全に1枚引く。宝庫の残高・参加費4倍まで。'],
 ['good-rion','良き','rion','R',[move(3)],'自分＋3マス','3マス進む。サイコロも振れる。'],
 ['sea-edge','海きわきわ','yori','SSR',[bonus(5),{type:'discard',n:1,select:true,cost:true}],'出目＋5・1枚捨てる','出目＋5。自分の手札を1枚選んで捨てる。残りの手札がなければ捨てずに進む。'],
 ['coffee-time','コーヒータイム','yori','SR',[recover(1),draw(1)],'1枚回収・安全に1枚','捨て札から1枚選んで回収し、安全に1枚引く。回収した速攻は手札に保持する。'],
 ['banquet-hide','宴中','hide','SSR',[draw(3,'normal')],'3枚引く','カードを3枚引く。引いた速攻は発動する。'],
 ['jacket-photo','ジャケット写真','rion,yori','LR',[piece,move(2)],'未所持の絵柄・自分＋2マス','未完成シリーズの未所持の絵柄を1種獲得し、2マス進む。絵柄がなければ安全に1枚引く。'],
 ['boat-pair','ボート','rion,hide','SR',[move(2),bonus(2)],'自分＋2マス・出目＋2','2マス進み、出目＋2。サイコロも振れる。'],
 ['friend-speech','友人スピーチ','rion','SSR',[cleanse,bonus(3)],'呪い解除・出目＋3','自分の呪いをすべて捨て、出目＋3。'],
 ['smoke-charge','ヤニチャージ','yori','SR',[draw(1,'hold'),bonus(3)],'1枚保持・出目＋3','1枚引き、出目＋3。引いた速攻は発動せず手札に保持する。'],
 ['board-game-four','ボードゲーム','rion,yori,enami,hide','十神',[recover(2),bonus(4)],'2枚回収・出目＋4','捨て札から2枚選んで回収し、出目＋4。回収した速攻は手札に保持する。4属性のカードとして扱う。'],
 ['pizza-potato','ピザポテト','hide,rion,yori','SSR',[draw(2),bonus(1)],'安全に2枚・出目＋1','安全に2枚引き、出目＋1。'],
 ['wrong-umbrella','傘の間違った持ち方','hide','UR',[],'攻撃を跳ね返す','自分への相手の単体攻撃を1回だけ相手へ跳ね返す。反射できないマス・速攻は無効化する。',{...guard,reflect:true}],
 ['jiro-ramen','二郎系ラーメン','hide','SSR',[draw(3,'hold'),bonus(-1)],'3枚保持・出目−1','3枚引き、出目−1。引いた速攻は発動せず手札に保持する。'],
 ['blueberry-eyes','ブルーベリーアイ','hide','SSR',[piece,draw(1)],'未所持の絵柄・安全に1枚','未完成シリーズの未所持の絵柄を1種獲得し、安全に1枚引く。絵柄がなければ安全に1枚引く。']
];
export const PHOTO_CARDS483=rows.map(([key,name,attrs,rank,effects,summary,text,extra={}],i)=>{
 const c={id:`photo483-${key}`,name,attrs:attrs.split(','),points:0,timing:'pre',kind:'normal',copies:1,art:0,effects,
  rank466:rank,rankIndex466:RANKS466.indexOf(rank),summary466:summary,note466:'カード使用は手番に1回',text,
  photo483:`./assets/sugoroku483/photo-${String(i+1).padStart(2,'0')}.jpeg`,...extra};
 if(effects.some(e=>['move','direct'].includes(e.type)))c.text+=' 移動先のマス効果は発動しない（初回の神殿停止を除く）。';
 if(c.timing==='instant')c.note466='引いた瞬間に発動';
 if(c.defense)c.note466='使うとこのカードを消費';
 configureCard469(c);return c;
});
export const PHOTO_CODES483=Object.fromEntries(PHOTO_CARDS483.map((c,i)=>[`basic:${c.id}`,`B-${117+i}`]));
