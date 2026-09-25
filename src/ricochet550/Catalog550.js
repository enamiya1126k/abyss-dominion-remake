// Presentation copy is also the authoritative list of selectable upgrades.
export const MODES550=Object.freeze({
 pinball:{name:'人間ピンボール大運動会',short:'人間ピンボール',en:'ABYSS · PINBALL CARNIVAL',unit:'点',cover:'./assets/ricochet550/pinball-cover.png',tag:'ぶつかれ。貯めろ。跳ね上がれ。',intro:'反射と能力が連鎖する、４人の大運動会。',rule:'金ピンと宝箱で得点。壁で倍率を育て、相手への衝突で能力を発動！ 各回の得点を合計して勝負。'},
 junkgp:{name:'ポンコツ改造グランプリ',short:'ポンコツ改造GP',en:'ABYSS · SCRAPWORKS GRAND PRIX',unit:'m',cover:'./assets/ricochet550/junkgp-cover.png',tag:'その改造、だれが止める。',intro:'拾ったパーツで育てる、ノーブレーキの怪物。',rule:'進んだ最長距離を毎回加算。ロケット・装甲・バネを重ねて大暴走！ 他人に押してもらうのも作戦。'}
});
const item=(id,name,icon,rarity,desc)=>Object.freeze({id,name,icon,rarity,desc,max:4});
export const ITEMS550=Object.freeze({
 pinball:[
  item('spring','発射バネ','spring',1,'発射の勢い＋18％／個。強く引けば大暴走！'),
  item('echo','反響の王冠','crown',2,'壁に当たるたび倍率＋0.35／個。壁倍率は最大８倍。'),
  item('cell','仕返し電池','cell',2,'衝突で充電し、次の発射に放出。１個ごとに充電効率アップ。'),
  item('crown','金ピンの勲章','star',1,'ピンの得点が1.35倍／個。重ねると掛け算！'),
  item('link','友情？コイル','link',2,'相手に当たると、お互いの次のピン得点が２倍。個数で最大５倍。'),
  item('dice','運命のサイコロ','dice',3,'発射時に１〜６。出目×0.25／個を得点倍率に加算。'),
  item('magnet','宝探し磁石','magnet',1,'近くの未開封の宝箱へ引き寄せられる。個数で吸引力アップ。'),
  item('chest','強欲の宝袋','chest',2,'宝箱の得点＋80％／個。箱は早い者勝ち！'),
  item('comet','三段ロケット','rocket',2,'３回ぶつかると１度だけ追加噴射。個数で加速アップ。'),
  item('bank','未来のへそくり','bank',3,'毎回、12×ラウンド数の２乗×個数の追加点。後半ほど大きい！'),
  item('mirror','反射のよろい','shield',1,'跳ね返りを強化し、減速を10％軽減／個。'),
  item('spark','金粉まみれ','spark',1,'ピンに当たるたび基本点＋40／個。倍率も乗る。')
 ],
 junkgp:[
  item('rocket','後付けロケット','rocket',2,'発射1.2秒後に追加噴射。前方向へ勢い＋５／個。'),
  item('spring','暴発サスペンション','spring',2,'壁で反射するたび勢い＋８％／個。'),
  item('armor','鉄板よろい','shield',1,'重さ＋60％／個。押し合いに強くなるが、発射は重くなる。'),
  item('turbo','追突ターボ','spark',2,'他の車とぶつかるたび前へ加速。勢い＋３／個。'),
  item('cell','仕返し電池','cell',2,'衝突で充電。次の発射へ持ち越し、貯めた勢いを一気に放出。'),
  item('wheels','つるつる車輪','wheel',1,'走行の減速が20％減／個。重ねるともっと滑る。'),
  item('engine','増設エンジン','engine',1,'発射の勢いが1.16倍／個。重ねると掛け算！'),
  item('hook','ちゃっかり牽引','link',2,'近くを走る前の車に引かれて加速。前に誰もいなければお休み。'),
  item('bank','育つエンジン','bank',3,'発射の勢い＋ラウンド数×0.7／個。後半に効く先行投資。'),
  item('dice','気まぐれギア','dice',3,'毎回１〜６の出目で発射力が変化。１は弱め、６は大当たり！'),
  item('bumper','特大バンパー','shield',1,'車同士の跳ね返りを強化。重さも＋15％／個。'),
  item('coil','おかわり噴射','comet',2,'３回衝突すると１度だけ前へ追加噴射。勢い＋６／個。')
 ]
});
export const item550=(mode,id)=>ITEMS550[mode]?.find(x=>x.id===id);
export const level550=(p,id)=>p.parts?.[id]??0;
export const clamp550=(n,a,b)=>Math.max(a,Math.min(b,n));
export const format550=n=>Math.round(n??0).toLocaleString('ja-JP');
export const THEMES550=[{name:'真鍮の祝祭',track:'工房通り',friction:1,boost:1},{name:'金ピン・フィーバー',track:'磨きたての坂',friction:.74,boost:1},{name:'宝箱大放出',track:'速達ベルト街道',friction:1,boost:1.45},{name:'反射カーニバル',track:'追い風の路地',friction:.86,boost:1.15}];
