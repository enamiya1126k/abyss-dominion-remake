// Rank measures impact; activation conditions and point costs remain part of card strategy.
export const RANKS466=['N','R','SR','SSR','UR','LR','神話','深淵','十神'];
export const RANK_COLORS466=['#44515b','#244c3c','#233e68','#503664','#765729','#733844','#244c62','#352255','#6c542b'];
const templates=[
 ['R','自分の出目 ＋2','サイコロの合計に追加'],['SR','自分の出目 ＋3','サイコロの合計に追加'],
 ['R','自分 ＋2マス','移動先のマス効果なし'],['SSR','サイコロ ＋1個','追加分も合計して進む'],['UR','サイコロ ＋2個','追加分も合計して進む'],
 ['SSR','自分 ＋6マス','この手番はサイコロなし'],['R','相手1人 −2マス','移動先のマス効果なし'],
 ['SSR','相手の手札 −2枚','相手1人・ランダム破棄'],['SR','相手から1枚奪う','裏向きから選ぶ・呪い注意'],['UR','相手から2枚奪う','裏向きから1枚ずつ選ぶ'],
 ['SR','手札を2枚交換','相手1人とランダム交換'],['SR','自分 2枚ドロー','引いた速攻は発動'],
 ['SSR','攻撃・マスを無効','1回分の効果をすべて防ぐ'],['SSR','安全に2枚ドロー','悪い速攻は無効'],
 ['R','1枚ドロー','この札を捨てると＋1マス'],['LR','次の属性札 ×2','移動・補充・破棄枚数を倍に']
];
const other={
 exchange:['LR','特殊能力を獲得','持っていれば残す方を選ぶ'],
 'curse-goal':['深淵','呪い：ゴール不可','到達時−20マスで呪い解除'],
 'curse-heavy':['SR','呪い：出目 −2','持っている間・最低1マス'],
 'curse-hunger':['UR','呪い：毎手番 −1枚','ほかの手札をランダムに失う'],
 cleanse:['SSR','呪い全解除＋1枚','自分の呪いをすべて捨てる'],chance:['LR','特殊能力を交換','相手1人と・片方の所持も可'],
 'rob-special':['神話','特殊能力を奪う','相手1人・自分は1つ残す'],'break-special':['LR','相手の特殊を消す','相手1人の特殊カードを破棄'],
 dove:['SR','捨てた枚数だけ進む','任意枚数・サイコロなし'],mental:['SSR','1枚捨て→安全に3枚','捨てるカードは自分で選ぶ'],
 guard:['SSR','攻撃・マスを無効','1回分の効果をすべて防ぐ'],reflect:['UR','攻撃を跳ね返す','マス・速攻は無効化'],
 cerberus:['神話','＋1マス→休み→破棄','対象を選択・手札3枚破棄'],fremens:['深淵','安全に3枚＋追加手番','追加手番の連続獲得は不可'],
 hide:['神話','4枚回収＋出目4','使うと手札の40ptを失う'],fist:['神話','特殊獲得＋7マス','安全に2枚／敵全員−1枚'],
 destroyer:['十神','敵全員：特殊破壊','さらに手札−3枚・移動−3'],principal:['UR','自分 4枚ドロー','速攻も発動せず手札へ'],
 forest:['SSR','手札を5枚にする','不足は補充・余りは選んで破棄'],poison:['UR','1回休み＋りおん全捨て','速攻・自分に発動'],
 sleep:['SR','今の手番が終了','相手の手番なら次を休む'],cup:['深淵','自分の手札 全破棄','より・えなみ1枚で回避可'],
 experiment:['LR','相手全員 −2マス','速攻・移動先効果なし'],thunder:['神話','全員 −5マス','自分も対象・速攻'],
 'hide-date':['UR','特殊カードの点数 ×2','マイナスも倍・重複しない'],nothing:['N','残して ＋1pt','効果なし・無属性'],
 treasure:['SSR','残して ＋12pt','使う効果なし・無属性'],phoenix:['SR','捨てられると＋2マス','持っている間は＋1pt']
};
export function rankInfo466(c){
 const m=c.id.match(/^(yori|rion|enami|hide)-(\d+)$/);let row=m?templates[Number(m[2])]:other[c.id];
 if(c.id.startsWith('relic-'))row=['SR','残して ＋8pt','使う効果なし・属性あり'];
 if(c.id.startsWith('affliction-'))row=['UR','自分の指定属性 全捨て','速攻・対象属性は枠色'];
 if(c.id.startsWith('gift-'))row=['SSR','安全に2枚＋出目1','速攻・自分に発動'];
 if(c.id.startsWith('mixed-'))row=['SR','1枚ドロー＋出目2','2つの属性として扱う'];
 if(c.set==='heroes')row=['十神','4種：＋10マス／3枚','安全に3枚＋敵全員3枚破棄'];
 if(c.set==='dark')row=['深淵','4種：先頭をスタートへ','捨て札から6枚回収も発動'];
 if(!row)throw Error('Missing card rank: '+c.id);
 return{rank466:row[0],summary466:row[1],note466:row[2],rankIndex466:RANKS466.indexOf(row[0])};
}
export const rankStyle466=c=>`--rank-face:${RANK_COLORS466[c.rankIndex466??0]};--rank-index:${c.rankIndex466??0};--card-accent:${({yori:'#70afff',rion:'#83d4ac',enami:'#ecb678',hide:'#de97c5'})[c.attrs?.[0]]??'#d5c094'}`;
export const SPECIAL_SHORT466={worker:'休み・後退無効／4〜6は1に',grudge:'後退されたら奪取＋補充',chuni:'手札2枚で出目＋5',surprise:'最下位から全員を後退',want:'手番ごとに相手から1枚',genius:'素の出目が最低7に',hacker:'速攻を手札に隠せる',greed:'補充・破棄・奪取が2倍（強制破棄も）',power:'黒マスを無効化',buddha:'悪い速攻無効／毎手番＋1マス',tsundere:'単体攻撃を反射',thief:'単独最下位なら出目＋3',drunk:'よりの札があれば出目＋2',shiva:'手札を防御札に変える',punch:'近くの相手を後退',swift:'毎手番、安全に1枚補充'};
