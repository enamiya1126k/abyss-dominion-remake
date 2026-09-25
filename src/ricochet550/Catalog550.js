// Presentation copy is also the authoritative list of selectable upgrades.
export const MODES550=Object.freeze({
 pinball:{name:'人間ピンボール大運動会',short:'人間ピンボール',en:'ABYSS · IMPACT CARNIVAL',unit:'点',cover:'./assets/ricochet552/carnival-poster.png',tag:'狙って回せ。３色から、王冠へ。',intro:'一撃で盤面を動かす、90秒の得点勝負。',rule:'赤・青・緑を集めて上の王冠へ。外周レーンなら３色まとめ取り。中央の棒は当てた勢いで回り、回転でフィーバー！ 2.8秒ごとに引き直せる。'}
});
const item=(id,name,icon,rarity,desc)=>Object.freeze({id,name,icon,rarity,desc,max:3});
export const ITEMS550=Object.freeze({
 pinball:[
  item('spring','発射バネ','spring',1,'発射の勢い＋15％／個。重ねるほど一撃が強くなる。'),
  item('echo','反響の王冠','crown',2,'壁に当たると次の得点倍率＋0.25／個。最大1.75倍、得点でリセット。'),
  item('cell','仕返し電池','cell',2,'衝突で充電し、次の通常発射に放出。１個ごとに充電効率アップ。'),
  item('crown','王冠の勲章','star',1,'王冠の獲得点＋25％／個。大当たりの一撃を伸ばす。'),
  item('mirror','反射のよろい','shield',1,'跳ね返りを強化し、減速を10％軽減／個。'),
  item('spark','金粉まみれ','spark',1,'ピンの基本点＋25％／個。連鎖やフィーバーも乗る。')
 ]
});
export const item550=(mode,id)=>ITEMS550[mode]?.find(x=>x.id===id);
export const level550=(p,id)=>p.parts?.[id]??0;
export const clamp550=(n,a,b)=>Math.max(a,Math.min(b,n));
export const format550=n=>Math.round(n??0).toLocaleString('ja-JP');
export const THEMES550=[{name:'真鍮の祝祭',track:'工房通り',friction:1,boost:1},{name:'金ピン・フィーバー',track:'磨きたての坂',friction:.74,boost:1},{name:'宝箱大放出',track:'速達ベルト街道',friction:1,boost:1.45},{name:'反射カーニバル',track:'追い風の路地',friction:.86,boost:1.15}];
