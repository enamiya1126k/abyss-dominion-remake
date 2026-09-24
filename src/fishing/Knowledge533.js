// Client-only short learning notes, paraphrased from the linked sources (2026-09-24).
const source=(label,url)=>Object.freeze({label,url});
const marine=id=>source('新潟市水族館 マリンピア日本海',`https://www.marinepia.or.jp/picturebook/fish/entry-${id}.html`);
const osaka=end=>source('大阪府立環境農林水産総合研究所','https://www.knsk-osaka.jp/'+end);
const hro=end=>source('北海道立総合研究機構','https://www.hro.or.jp/fisheries/'+end);
const maff=end=>source('農林水産省','https://www.maff.go.jp/'+end);
const note=(habitat,fact,source)=>Object.freeze({habitat,fact,source});
export const KNOWLEDGE533=Object.freeze({
 redseabream:note('沿岸の海','赤い体をよく見ると、小さな青い点が散りばめられている。',marine('11843')),
 bluefintuna:note('太平洋などの海','全長３ｍにもなる大型のマグロ。海を泳ぐ姿も迫力たっぷり。',source('沖縄美ら海水族館','https://churaumi.okinawa/sp/fishbook/00000565/')),
 skipjack:note('海','高知県の郷土料理「たたき」でも知られる魚。食文化ともつながっている。',maff('j/keikaku/syokubunka/traditional-foods/menu/katuonotataki.html')),
 spanishmackerel:note('沿岸〜沖の海','成長すると呼び名が変わる魚。小さいものはサゴシとも呼ばれる。',osaka('suisan/shien/sawara/sawara1.html')),
 cod:note('北の海','夏には深い海へ、冬の産卵期には浅い海へ移動する。',marine('11845')),
 hokke:note('北海道などの北の海','岩のくぼみに産みつけた卵を、ふ化するまでオスが守る。',hro('research/hakodate/section/zoushoku/tpc0530000000hq8/tpc0530000000j44.html')),
 alfonsino:note('深い海','売り場では全身が赤く見えても、生きているときのおなかは銀色。',marine('11258')),
 hairtail:note('海','細長く銀色に輝く姿が、名前の「太刀」を連想させる。',osaka('zukan/zukan_database/osakawan/8050b3250f4abcc/8150c18c5ff10ad.html')),
 marbledflounder:note('沿岸の海底','似た名前のマガレイとは別の魚。カレイの仲間にもいろいろな種類がいる。',marine('11840')),
 thornyhead:note('深い海','「キンキ」とも呼ばれる魚。同じ魚でも地域で呼び名が変わることがある。',hro('publication/sakana/o7u1kr0000000791.html')),
 blackthroat:note('深い海','口の中が黒いことから「ノドグロ」とも呼ばれる。',marine('10967')),
 amberjack:note('暖かい海','上から見た頭の模様が「八」に見えることが、カンパチの名の由来。',marine('11209')),
 seabass:note('沿岸・河口','大阪では成長に合わせて、セイゴ・ハネ・スズキと呼び名が変わる。',osaka('zukan/zukan_database/osakawan/8050b3250f4abcc/1250c18a4a20d27.html')),
 herring:note('北の海','同じニシンでも、群れによって産卵する季節が異なる。',hro('research/wakkanai/surveys-knowledge-of-fish/inpvt400000007sg/inpvt400000008cx.html')),
 shishamo:note('北海道の太平洋側の海と川','自然に暮らす場所が北海道の一部に限られる、日本固有の魚。',maff('j/keikaku/syokubunka/k_ryouri/search_menu/menu/shishamonokanroni_hokkaido.html')),
 japaneseeel:note('川と海','川で見かけるウナギも、産卵の舞台は遠く離れた西マリアナ海嶺付近の海。',maff('j/pr/aff/1607/spe2_02.html')),
 blackseabream:note('沿岸・河口','関西では「チヌ」の名でも親しまれる、黒っぽいタイの仲間。',osaka('zukan/zukan_database/osakawan/8050b3250f4abcc/9250c1773998e3d.html')),
 mejina:note('浅い海の岩礁','岩の多い浅い海に暮らす魚。似た名前のクロメジナは別の種。',marine('11910')),
 filefish:note('沿岸の海','フグ目に分類される魚。フグとずいぶん違う姿の仲間もいる。',marine('11202')),
 rockfish:note('沿岸の岩場','お母さんの体内で卵がかえり、小さな仔魚になってから外へ出てくる。',osaka('zukan/zukan_database/osakawan/8050b3250f4abcc/2850c05c2876ee0.html')),
 blackrockfish:note('沿岸の海','かつて同じメバルとして扱われた仲間は、2008年に３種に分けられた。',source('鳥羽水族館・飼育日記','https://aquarium.co.jp/diary/2012/01/1574')),
 greenling:note('海の岩場','ホッケに近い仲間。地域によってはアブラメとも呼ばれる。',osaka('zukan/zukan_database/osakawanikimono/385c4e95fd0b200/225c4eabeca8207.html')),
 whiting:note('浅い海の砂底','危険を感じると、砂の中にもぐって身を隠すことがある。',marine('11427')),
 flathead:note('内湾・河口近くの砂泥底','海底に身を隠し、近くを通る小魚などを待ち伏せする。',source('Honda釣り倶楽部・釣魚図鑑','https://www.honda.co.jp/fishing/picture-book/magochi/')),
 mullet:note('沿岸・河口','成長とともに呼び名が変わり、大きなものはトドとも呼ばれる。',osaka('zukan/zukan_database/tansui/6550b2c290c751e/9150b590d73852d.html')),
 halfbeak:note('沿岸の海','ダツ目に分類されるサヨリ科の魚。細長い魚の仲間も多彩。',marine('11381')),
 gurnard:note('海の砂泥底','胸びれから分かれた３本のひれを動かし、海底のエサ探しに使う。',marine('11809')),
 goatfish:note('海の砂底','ひげには味を感じる細胞があり、砂の中に隠れた獲物を探せる。',source('鳥羽水族館','https://aquarium.co.jp/picturebook/upeneus-japonicus.html')),
 sandfish:note('海の深場〜産卵期の沿岸','「ブリコ」と呼ばれる卵のかたまりを、海藻に産みつける。',hro('research/saibai/section/zoushoku/jajqh500000002n4.html')),
 icefish:note('湖・河口など','「しらす」とは別の魚。シラウオは小さなまま大人になる。',source('茨城県・霞ケ浦のシラウオ','https://www.pref.ibaraki.jp/nourinsuisan/kasui/shinko/kasumigaura-shirauo.html')),
 barreleye:note('北太平洋の深海','透明な頭の中に緑色の目。目の向きを上や前へ変えられる。',source('MBARI・モントレー湾水族館研究所','https://www.mbari.org/animal/barreleye-fish/')),
 frilledshark:note('深海','多くのサメのえらは左右に５対。ラブカには６対ある。',source('アクアマリンふくしま','https://www.aquamarine.or.jp/new-animals/rabuka/'))
});
