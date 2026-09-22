import {ITEMS509,ATTACKS509,BIG509} from './Items509.js';
const extra = [
 {id:'doubling',name:'倍々クロノクリスタル',move:100,persistent:true,type:'成長バフ',detail:'毎回+100m。次の回から自分の前進×2、×4、×8…！ 時間がたつほど倍率アップ。重複OK。'},
 {id:'bank',name:'星くず貯金箱',move:0,persistent:true,type:'貯蓄バフ',detail:'毎回200mずつ貯金。次に選ぶ大技で全額を4倍にして前進へ！ 貯金は攻撃されても減らない。'},
 {id:'solar',name:'太陽チャージ炉',move:100,persistent:true,type:'蓄積バフ',detail:'毎回+100m。大技を選ばない回は太陽+1。次の大技で全部使い×3、×9、×27…！'},
 {id:'forge',name:'鍛錬のフォージ',move:200,persistent:true,type:'成長バフ',detail:'毎回+200、400、600m…と加速の土台が育つ。装備した回から発動。すべての倍率が乗る！'},
 {id:'echo',name:'余韻アンプ',move:0,persistent:true,type:'連鎖バフ',detail:'次の回から、前の回に実際進んだ距離の半分を加速の土台に足す。大加速の余韻が次につながる！'},
 {id:'focus',name:'出目のルーペ',move:100,persistent:true,type:'幸運バフ',detail:'毎回+100m。装備中はサイコロの出目がすべて+1（最大6）。大砲にも有効。重ねて出目アップ。'},
 {id:'crown',name:'終幕のクラウン',move:100,persistent:true,type:'最終回バフ',detail:'毎回+100m。最終ラウンドは自分の前進×5！ 重ねると×25、×125…の大フィナーレ。'},
 {id:'overdrive',name:'限界突破エンジン',move:100,persistent:true,type:'増幅バフ',detail:'毎回+100m。次の回から自分の前進×2。大技を選んだ回は×4に！ 重ねるとさらに掛け算。'},
 {id:'triple',name:'三連かけ算ダイス',move:0,persistent:false,type:'大技・一回',detail:'3個のサイコロを掛け算×100m！ 最大21,600m。育てた倍率も全部乗る。'},
 {id:'harvest',name:'豊穣フルバースト',move:0,persistent:false,type:'大技・一回',detail:'装備の個数×個数×400m！ 最低400m。装備は消えず、貯金・太陽・コイルも一斉解放。'},
 {id:'nova',name:'超新星ロケット',move:12000,persistent:false,type:'大技・一回',detail:'+12,000mを土台に、育てた倍率を全部乗せて発進！ 貯金・太陽・コイルも一斉解放。'},
 {id:'dragon',name:'蓄積竜の大跳躍',move:0,persistent:false,type:'大技・一回',detail:'いまの累積距離+2,000mを前進の土台に！ 育てた倍率も全部乗せて、もうひと跳び。'}
];
export const ITEMS511=Object.freeze([...ITEMS509.map(x=>x.id==='dice'?Object.freeze({...x,detail:'出目4〜6なら+1400m、1〜3なら300m後退。出目バフがなければ半々！ 育てた倍率は前進に乗る。'}):x),...extra.map((x,tile)=>Object.freeze({...x,tile,atlas:511}))]);
export const item511=id=>ITEMS511.find(x=>x.id===id)??ITEMS511[0];
export const ATTACKS511=ATTACKS509;
export const BIG511=Object.freeze([...BIG509,'triple','harvest','nova','dragon']);
export const DICE511=Object.freeze(['dice','product','jackpot','triple']);
