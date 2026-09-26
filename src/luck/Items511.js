import {ITEMS509,ATTACKS509,BIG509} from './Items509.js';
import {DETAILS562} from './Descriptions562.js';
const extra = [
 {id:'doubling',name:'倍々クロノクリスタル',move:100,persistent:true,type:'成長バフ',detail:'毎回+100m。次の回から倍率が×2→×4→×8…。複数個の倍率は掛け算。'},
 {id:'bank',name:'星くず貯金箱',move:0,persistent:true,type:'貯蓄バフ',detail:'1個につき毎回200m貯金。大技で全額×4を前進に加算し、貯金は0へ。'},
 {id:'solar',name:'太陽チャージ炉',move:100,persistent:true,type:'蓄積バフ',detail:'1個につき毎回+100m。大技以外の回に太陽+1（2個なら+2）。大技で全消費：太陽1個×3、2個×9…。'},
 {id:'forge',name:'鍛錬のフォージ',move:200,persistent:true,type:'成長バフ',detail:'装備した回から+200m、次は+400m、+600m…。複数個はそれぞれ育ち、合計に倍率が乗る。'},
 {id:'echo',name:'余韻アンプ',move:0,persistent:true,type:'連鎖バフ',detail:'次の回から、前回の実際の前進×50%を加算。2個なら100%。その合計に倍率が乗る。'},
 {id:'focus',name:'出目のルーペ',move:100,persistent:true,type:'幸運バフ',detail:'毎回+100m。装備中はサイコロの出目がすべて+1（最大6）。大砲にも有効。重ねて出目アップ。'},
 {id:'crown',name:'終幕のクラウン',move:100,persistent:true,type:'最終回バフ',detail:'毎回+100m。最終ラウンドは自分の前進×5！ 重ねると×25、×125…の大フィナーレ。'},
 {id:'overdrive',name:'限界突破エンジン',move:100,persistent:true,type:'増幅バフ',detail:'1個につき毎回+100m。次の回から前進×2、大技なら×4。2個なら×4／大技×16。'},
 {id:'triple',name:'三連かけ算ダイス',move:0,persistent:false,type:'大技・一回',detail:'3個のサイコロを掛け算×100m！ 最大21,600m。育てた倍率も全部乗る。'},
 {id:'harvest',name:'豊穣フルバースト',move:0,persistent:false,type:'大技・一回',detail:'装備の個数×個数×400m！ 最低400m。装備は消えず、貯金・太陽・コイルも一斉解放。'},
 {id:'nova',name:'超新星ロケット',move:12000,persistent:false,type:'大技・一回',detail:'+12,000mを土台に、育てた倍率を全部乗せて発進！ 貯金・太陽・コイルも一斉解放。'},
 {id:'dragon',name:'蓄積竜の大跳躍',move:0,persistent:false,type:'大技・一回',detail:'いまの累積距離+2,000mを前進の土台に！ 育てた倍率も全部乗せて、もうひと跳び。'}
];
export const ITEMS511=Object.freeze([...ITEMS509,...extra.map((x,tile)=>({...x,tile,atlas:511}))].map(x=>Object.freeze({...x,detail:DETAILS562[x.id]})));
export const item511=id=>ITEMS511.find(x=>x.id===id)??ITEMS511[0];
export const ATTACKS511=ATTACKS509;
export const BIG511=Object.freeze([...BIG509,'triple','harvest','nova','dragon']);
export const DICE511=Object.freeze(['dice','product','jackpot','triple']);
