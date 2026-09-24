import {KNOWLEDGE534} from './Knowledge534.js';
import {KNOWLEDGE533} from './Knowledge533.js';
// Client-only learning notes. Sources checked 2026-09-24. No edibility verdicts.
const source=(label,url)=>Object.freeze({label,url});
const mlit=source('国土交通省・川内川の魚類','https://www.qsr.mlit.go.jp/sendai/sendai_river/kankyou/zukan/gyorui.html');
const masu=source('国土交通省・ヤマメ','https://www.thr.mlit.go.jp/iwate/iport/kitakami/sizen/ikimono/fish/yamame.html');
const note=(habitat,fact,ref,extra={})=>Object.freeze({habitat,fact,source:ref,...extra});
const aq=(slug)=>source('鳥羽水族館',`https://aquarium.co.jp/picturebook/${slug}.html`);
const marine=(kind,id)=>source('新潟市水族館 マリンピア日本海',`https://www.marinepia.or.jp/picturebook/${kind}/entry-${id}.html`);
const osaka=(end)=>source('大阪府立環境農林水産総合研究所','https://www.knsk-osaka.jp/'+end);
const warning='野生の生き物を自己判断で食べたり、別の水域へ移したりしないでね。';
export const SAFETY532='この図鑑は採食・同定用ではありません。絵はイメージです。知らない生き物は触らず、自己判断で食べないでね。危険表示がない種類の安全を保証するものではありません。';
export const FICTION532='釣り場・重さ・得点・エサの連鎖はゲーム設定。淡水魚と海水魚が一緒に釣れるのも演出です。';
export const KNOWLEDGE532=Object.freeze({
 ...KNOWLEDGE533, ...KNOWLEDGE534,
 medaka:note('流れのゆるい小川・水路','小さな体で水面近くを泳ぎ、プランクトンなどを食べる。',mlit),
 donko:note('川の流れのゆるい場所','石の下などに身を隠して暮らす、底生の魚。',mlit),
 ayu:note('川','海と川を行き来する暮らし方が知られている。',mlit),
 crucian:note('池・流れのゆるい川','水草のある穏やかな水辺にも暮らすフナの仲間。',mlit),
 bluegill:note('池・湖','北米から日本へ持ち込まれた外来魚。水辺への影響も考えよう。',mlit,{caution:warning}),
 yellowperch:note('北米の湖・川','北米の淡水に暮らすパーチの仲間。海外の魚も知ってみよう。',source('米国ミネソタ州 自然資源局','https://www.dnr.state.mn.us/minnaqua/speciesprofile/yellowperch.html')),
 char:note('冷たい渓流','冷たい川に暮らすイワナ。渓流魚には生息環境の違いがある。',source('水産庁・渓流魚の放流マニュアル','https://www.jfa.maff.go.jp/j/enoki/pdf/hatugannran.pdf')),
 yamame:note('川の上流','川で一生を過ごすヤマメと、海へ下るサクラマスは同じ種の異なる暮らし方。',masu),
 cherrysalmon:note('海と川','ヤマメのうち海へ下って成長するタイプ。銀色の姿で川へ戻る。',masu),
 grasscarp:note('淡水','コイに似ているけれど、背びれはコイより小さい。',marine('fish','11482')),
 snakehead:note('淡水','日本では外来魚として知られる大型の肉食魚。',aq('channa-argus'),{caution:warning}),
 peacockbass:note('南アメリカの淡水','南米に暮らす大型のシクリッドの仲間。',aq('cichla-ocellaris')),
 freshshrimp:note('川岸の水草帯・池','流れのゆるい水辺に暮らす小さなエビ。',source('国土交通省・筑後川の生物図鑑','https://www.qsr.mlit.go.jp/chikugo/siryo/02-kawa/01_chikugo/teisei/sujiebi.html')),
 mussel:note('池などの淡水','魚だけでなく、淡水には二枚貝の仲間もいる。',source('いなみ野ため池ミュージアム','https://www.inamino-tameike-museum.com/pond-creature/ikimono-photo-album.html')),
 mittencrab:note('川と海をつなぐ水辺','はさみに毛が生えたカニ。川と海をつなぐ環境も大切。',source('国土交通省・川内川の底生動物','https://www.qsr.mlit.go.jp/sendai/sendai_river/kankyou/zukan/teiseidoubutsu.html'),{caution:warning}),
 bullfrog:note('池・湖・流れのゆるい川','昆虫や魚など、いろいろな動物を食べる外来のカエル。',osaka('zukan/zukan_database/sonota/545110a8632c8f5/5050c050a49cd9b.html'),{caution:warning}),
 mackerel:note('海','サバは缶詰でもおなじみ。売り場の魚名と、泳ぐ姿をつなげてみよう。',source('農林水産省・缶詰の世界','https://www.maff.go.jp/j/pr/aff/2008/spe1_03.html')),
 horsemackerel:note('海','体の横に「ゼイゴ」と呼ばれる硬いうろこが並ぶ。',osaka('zukan/zukan_database/osakawan/8050b3250f4abcc/2650c1799d34d3a.html')),
 sardine:note('海','体の横に並ぶ黒い点は「七つ星」とも呼ばれる。',osaka('zukan/zukan_database/osakawan/8050b3250f4abcc/9850c17d372970b.html')),
 flounder:note('海の底','ふつうは体の左側に両目がある。見た目だけの決めつけには注意。',marine('fish','11753')),
 octopus:note('海','８本の腕を持ち、周りに合わせて体色を変えられる。',marine('invertebrate','11844')),
 cuttlefish:note('海','体の中には、浮力の調整に使う「甲」という殻がある。',marine('invertebrate','11320')),
 saury:note('海','光に集まる習性を利用した漁が行われている。',source('農林水産省・漁法を知ろう','https://www.maff.go.jp/j/pr/aff/1805/characterinformation.html')),
 yellowtail:note('海','養殖に使われる稚魚は「モジャコ」と呼ばれる。',source('農林水産省・養殖を知ろう','https://www.maff.go.jp/j/pr/aff/1901/characterinformation.html')),
 mahimahi:note('海','ハワイでは「マヒマヒ」と呼ばれる魚。',source('水産庁・魅了ギョ！プロジェクト','https://www.jfa.maff.go.jp/j/kakou/miryogyo.html')),
 sunfish:note('海','自然の海では、クラゲやイカなども食べている。',source('海遊館・マンボウ','https://www.kaiyukan.com/connect/encyclopedia/82.html')),
 arapaima:note('アマゾン川','南米に暮らす巨大な淡水魚。ゲームではヌシ級として登場。',aq('arapaima-gigas')),
 grouper:note('インド・太平洋などの海','ハタの仲間でも最大級になる魚。ゲームではヌシ級として登場。',source('沖縄美ら海水族館・タマカイ','https://churaumi.okinawa/sp/fishbook/00000129/')),
 tigerpuffer:note('海','フグの毒は、種類や部位によって異なる。',source('厚生労働省・フグ毒','https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/shokuhin/syokuchu/poison/animal_01.html'),{danger:'food',caution:'食中毒に注意：フグを自分でさばいたり、自己判断で食べたりしない。'}),
 lionfish:note('サンゴ礁などの海','美しい長いひれを持つが、毒のあるトゲに注意。',source('沖縄県警察・ハナミノカサゴ','https://www.police.pref.okinawa.jp/docs/2015022300043/'),{danger:'spine',caution:'毒のあるトゲ：ひれで刺される危険。素手で触らない。'}),
 stonefish:note('浅い海の底','岩に似た姿でじっとするため、気づきにくい。',source('沖縄美ら海水族館・オニダルマオコゼ','https://churaumi.okinawa/sp/fishbook/00000277/'),{danger:'spine',caution:'毒のあるトゲ：背びれの猛毒に注意。触れたり踏んだりしない。'}),
 stingray:note('海の砂底など','砂に潜んでいることもあるエイ。尾に毒のあるトゲを持つ。',source('加茂水族館・アカエイ','https://kamo-kurage.jp/shonaizukan/akaei/'),{danger:'spine',caution:'毒のあるトゲ：尾で刺される危険。近づいて触らない。'})
});
export const knowledge532=f=>KNOWLEDGE532[f?.id??f]??null;
export const category532=f=>f.trash534?'trash':knowledge532(f)?f.group532??'wild':f.group532==='curio'?'curio':f.item525?'item':'fantasy';
export const groupLabel532=f=>({market:'食卓でおなじみ',wild:'水辺の探検',danger:knowledge532(f)?.danger==='injury'?'歯・突進に注意':knowledge532(f)?.danger==='food'?'食中毒に注意':'毒のトゲに注意',trash:'海のゴミ',curio:'変わり種',item:'アイテム',fantasy:'幻想の生き物'})[category532(f)];
