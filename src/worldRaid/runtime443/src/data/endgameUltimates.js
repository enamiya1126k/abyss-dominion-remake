// Build358: additional innate skills. Existing attacks and weapon skills stay intact.
const entries=[
 ['ten_time','finalHour','終刻宣告',20,'敵全体','10ラウンド後、敵全員を強制戦闘不能にする。使用者を倒すと解除。1戦闘1回。',{once:true}],
 ['ten_space','voidExile','虚空隔離',12,'敵単体','敵1体を次のラウンド終了まで隔離する。行動・攻撃対象・回復対象にならない。使用者撃破で解除。'],
 ['ten_life','allRebirth','万命再誕',14,'味方全体','自分以外の味方を全回復・蘇生。蘇生封印は無効化できない。発動後、自分はHP1・MP0。1戦闘1回。',{once:true}],
 ['ten_death','deathRegister','黄泉の名簿',12,'敵全体','3ラウンド後、HP40%以下の敵を強制戦闘不能・蘇生封印3ラウンド。使用者撃破で解除。待機中は自分の両DEF-30%。'],
 ['ten_fate','onlyFuture','唯一未来・結果確定',12,'味方全体','2ラウンド、味方全員が必中・確定会心。終了後の1ラウンドは敵全員が必中・確定会心になる。'],
 ['ten_chaos','reverseWorld','世界反転・逆相法則',10,'全体','2ラウンド、敵味方全員の属性相性を逆転。属性耐性は弱点へ、弱点は耐性へ変わる。'],
 ['ten_dominion','royalOverride','王命上書き',12,'敵単体','敵1体の次の行動を奪い、その通常スキル1回を自軍のために使用させる。支配耐性・浄化で対抗可能。待機中、自分の被ダメージ+40%。'],
 ['ten_creation','absoluteWall','絶対神壁',12,'味方全体','2ラウンド、味方全員へ致死ダメージを1回無効化する壁。壁が割れるたび使用者の最大HP10%を消費。'],
 ['ten_end','finalFurnace','終末炉',14,'自分','3ラウンド、自軍が敵HPへ与えた直接ダメージの50%を蓄積し、敵全体へ均等放出。上限は自分の最大HP150%。撃破で解除。放出後、現在HP30%消費。'],
 ['ten_divinity','tenLaws','十律統合・再演神格',14,'味方全体','2ラウンド、味方の通常スキルを威力60%で追加発動。各自1ラウンド1回、MPも消費。切り札は対象外。終了後、自分の通常技CT+2。'],
 ['abyss_gluttony','allDevour','万象捕食',12,'敵単体','敵1体の現在HP30%・現在MP50%を奪い、通常強化を最大2つ接収。発動後2ラウンド、自分のSPD-50%・回復量-50%。'],
 ['abyss_wrath','undyingRage','不死狂戦',12,'自分','2ラウンド、通常ダメージではHP1で耐え、物理攻撃ダメージ2倍。回復不可。終了後1ラウンド、両DEF-50%。'],
 ['abyss_envy','betterThanYou','お前より上手く使える',10,'敵単体','敵が直前に使用した通常スキルを威力150%で再現する。切り札は模倣できない。'],
 ['abyss_sloth','idleWorld','何もしなくていい世界',12,'敵全体','2ラウンド、敵全員の追撃・反撃・追加行動を封じる。自分も通常攻撃だけになる。'],
 ['abyss_greed','ownershipTransfer','所有権移転',12,'敵単体','敵1体の魔法陣の発動効果と通常強化2つを3ラウンド借用。借用中は自分の元の魔法陣が停止。撃破・戦闘終了で返却。'],
 ['abyss_lust','stolenLove','恋獄・愛の横取り',12,'敵全体','2ラウンド、敵が受けるHP回復の50%を奪い、自軍の生存者へ分配。自分の両DEF-35%。'],
 ['abyss_pride','kneelAll','万軍跪伏',12,'敵全体','自分よりHP割合が低い敵全員の通常強化を解除し、次の行動を1回封じる。判定後、自分の現在HP30%を消費。']
];
export const ENDGAME_ULTIMATES=Object.freeze(Object.fromEntries(entries.map(([owner,key,name,cooldown,target,description,extra={}])=>[owner,Object.freeze({id:`endgame_ultimate__${owner}__${key}`,owner,key,name,cooldown,target,description:`${description} 開幕3ラウンド使用不可・最大MP60%消費・CT短縮不可。`,type:'buff',kind:'buff',power:0,mp:0,mpRate:.6,ultimate358:true,openingRounds:3,unlock:{type:'level',value:1},tag:'固有切り札',...extra})])));
export const ENDGAME_ULTIMATE_BY_ID=Object.freeze(Object.fromEntries(Object.values(ENDGAME_ULTIMATES).map(s=>[s.id,s])));
export const isEndgameUltimate=s=>Boolean(typeof s==='string'?ENDGAME_ULTIMATE_BY_ID[s]:s?.ultimate358||ENDGAME_ULTIMATE_BY_ID[s?.id]);
