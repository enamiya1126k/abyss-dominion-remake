// Client-only learning notes. Sources checked 2026-09-24; no edibility verdicts.
const source=(label,url)=>Object.freeze({label,url});
const note=(habitat,fact,source,extra={})=>Object.freeze({habitat,fact,source,...extra});
const marine=id=>source('新潟市水族館 マリンピア日本海',`https://www.marinepia.or.jp/picturebook/fish/entry-${id}.html`);
const toba=id=>source('鳥羽水族館',`https://aquarium.co.jp/picturebook/${id}.html`);
const osaka=end=>source('大阪府立環境農林水産総合研究所','https://www.knsk-osaka.jp/'+end);
const chura=id=>source('沖縄美ら海水族館',`https://churaumi.okinawa/fishbook/${id}/`);
const ministry=id=>source('厚生労働省・自然毒のリスクプロファイル',`https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/shokuhin/syokuchu/poison/animal_${id}.html`);
const museum=source('国立科学博物館・危険な魚たち','https://www.kahaku.go.jp/research/db/zoology/uodas/fish_in_focus/kiken/');
export const KNOWLEDGE534=Object.freeze({
 anchovy:note('沿岸の海','しらすや煮干しとしてもおなじみ。小さな魚が食卓へつながっている。',osaka('zukan/zukan_database/osakawan/8050b3250f4abcc/5850c05cb54bd9f.html')),
 roundherring:note('暖かい海','世界の暖かい海に分布するイワシの仲間。日本でも沿岸で出会える。',source('Honda釣り倶楽部・釣魚図鑑','https://www.honda.co.jp/fishing///picture-book/urumeiwashi/')),
 yellowfingoby:note('河口などの砂泥底','砂や泥のある底を好む。小動物だけでなく藻類も食べる雑食性。',osaka('zukan/zukan_database/tansui/8450b2c298b2683/4050b6e5d7555d6.html')),
 surfperch:note('海藻のある岩場と周囲の砂底','卵が母親のおなかでかえり、育った稚魚が生まれてくる。',marine('11081')),
 kyusen:note('沿岸の海','夜は砂に潜って休む魚。魚にも昼と夜で違う過ごし方がある。',marine('11243')),
 grunt:note('磯の海','磯にすむことや幼魚の縞模様が、名前の由来といわれている。',source('近畿大学水産研究所・おさかな図鑑','https://www.kindaifish.com/picturebook/isaki/')),
 barredknifejaw:note('沿岸の海','硬い殻を持つウニや貝、ヤドカリなどを好んで食べる。',marine('11027')),
 blacktipgrouper:note('沿岸の岩礁・サンゴ礁','赤い体が名前の由来。岩場やサンゴ礁は魚の暮らしを支える場所。',toba('epinephelus-fasciatus')),
 redspottedgrouper:note('沿岸の岩礁','「アコウ」とも呼ばれるハタ。岩の多い海を住みかにする。',osaka('suisan/kijihata/nani.html')),
 redbarracuda:note('沿岸の浅い海','ほかの魚を捕らえる肉食魚。細長い体で沿岸の浅い海に暮らす。',marine('10942')),
 needlefish:note('沿岸の海','夜に光へ突進することがあり、長いあごによるけがに注意が必要。',source('環境省・せとうちネット','https://www.env.go.jp/water/heisa/heisa_net/setouchiNet/seto/g1/g1chapter1/kikennaikimono/datsu.html'),{danger:'injury',caution:'突進に注意：夜の水面を不用意に照らして近づかない。'}),
 kidako:note('沿岸の岩場','ウツボの仲間は、鋭い歯で捕らえた獲物を喉の奥の顎で飲み込む。',source('鳥羽水族館・飼育日記','https://aquarium.co.jp/diary/2022/03/57618'),{danger:'injury',caution:'鋭い歯に注意：口元へ手を出したり、素手でつかんだりしない。'}),
 bigeyetrevally:note('暖かい海・若魚は汽水域にも','若い魚は、川の水と海水が混じる汽水域でも多く見られる。',chura('00000533')),
 gianttrevally:note('暖かい海','釣り人に人気の大型のアジ。英名の頭文字から「GT」とも呼ばれる。',chura('00000525')),
 morwong:note('海藻の生えた岩場','斜めの縞模様と尾びれの白い点が特徴。海藻のある岩場に暮らす。',marine('11499')),
 cardinalfish:note('沿岸の海','身近なテンジクダイの仲間。小さな魚にも、それぞれ名前がある。',toba('apogon-semilineatus')),
 spottedknifejaw:note('沿岸の海','シガテラ食中毒の原因となった事例が、本州や九州でも報告されている。',ministry('det_02'),{danger:'food',caution:'食中毒に注意：毒を持つ個体がいる。見た目だけで食用を判断しない。'}),
 blueparrotfish:note('暖かい海','青い体の美しい魚だが、パリトキシン様毒による食中毒の原因になる。',ministry('03'),{danger:'food',caution:'食中毒に注意：アオブダイを自己判断で食べない。'}),
 rabbitfish:note('日本沿岸などの海','ひれのトゲには毒がある。身近な釣り場でも触り方を誤ると危険。',toba('siganus-fuscescens'),{danger:'spine',caution:'毒のあるトゲ：ひれに刺される危険。素手でつかまない。'}),
 stripedcatfish:note('磯・潮だまりの周り','小さなナマズの仲間でも、背びれと胸びれのトゲに毒がある。',museum,{danger:'spine',caution:'毒のあるトゲ：背びれ・胸びれに注意。素手で触らない。'}),
 velvetfish:note('磯・潮だまりの周り','小さくても油断は禁物。背びれのトゲに毒を持つ魚。',museum,{danger:'spine',caution:'毒のあるトゲ：小魚でも手でつかまない。'}),
 devilstinger:note('浅い海の砂底','岩に似た姿で隠れる魚。背びれの毒針に気づきにくい。',source('のとじま水族館','https://www.notoaqua.jp/diary/276'),{danger:'spine',caution:'毒のあるトゲ：触ったり踏んだりしない。'}),
 pantherpuffer:note('日本沿岸の海','フグは種や体の部位で毒性が異なる。知っている魚に似ていても油断できない。',ministry('01'),{danger:'food',caution:'食中毒に注意：フグを自分でさばいたり食べたりしない。'}),
 scrawledfilefish:note('暖かい海','青い模様が目を引くカワハギの仲間。強い毒を持つ可能性がある。',source('愛知県・ソウシハギの食中毒防止','https://www.pref.aichi.jp/0000056023.html'),{danger:'food',caution:'食中毒に注意：ソウシハギを食べない。カワハギとの思い込みに注意。'})
});
const survey=source('環境省・海洋ごみ調査','https://www.env.go.jp/press/107902.html');
const materials=source('環境省・漂着ごみの分類','https://www.env.go.jp/content/900543292.pdf');
const ghost=source('環境省・ゴーストギア','https://kyushu.env.go.jp/blog/page_00079.html');
const litter=(quip,fact,source)=>Object.freeze({quip,fact,source});
export const LITTER_NOTES534=Object.freeze({
 petbottle:litter('大物の予感、空っぽでした。','ペットボトルは海底ごみの調査でも見つかる。街のごみも海へつながる。',survey),
 crushedcan:litter('プシュッとは鳴らない。','海辺のごみには飲料缶などの金属もある。',materials),
 plasticbag:litter('クラゲかと思ったら袋！','レジ袋も海底で見つかるプラスチックごみの一つ。',survey),
 tangledline:litter('糸で、糸を釣った。','流出した釣り糸もゴーストギア。海の生き物を絡め取ることがある。',ghost),
 tornnet:litter('魚を捕る道具が釣れた。','失われた漁網が生き物を捕らえ続けることを、ゴーストフィッシングという。',ghost),
 foambox:litter('お魚用の箱だけ来た。','発泡スチロールの容器や破片も、漂着ごみとして調べられている。',materials),
 oldtire:litter('引きはヌシ級。正体はタイヤ。','海のごみにはプラスチックだけでなく、タイヤなどのゴム製品もある。',materials),
 workglove:litter('もう片方はどこの海へ？','軍手や衣服などの布製品も漂着ごみに含まれる。',materials)
});
export const litterNote534=f=>LITTER_NOTES534[f?.id??f]??null;
