// Effects are server-authoritative. Descriptions also serve the item-selection UI.
export const ITEMS508 = Object.freeze([
 {id:'dash',name:'ウイングダッシュ',type:'加速',move:220,detail:'+220m。堅実に走り抜ける。'},
 {id:'rocket',name:'ロケット',type:'加速',move:500,detail:'+500m。一直線に加速！'},
 {id:'turbo',name:'超ブースト',type:'大勝負',move:1000,detail:'+1000m。ただし攻撃を受けると、この回の前進が0に。'},
 {id:'shell',name:'青甲羅',type:'攻撃',move:120,detail:'+120m。この回の開始時に1位だった相手を100m後退させる。'},
 {id:'lightning',name:'雷雲',type:'全体攻撃',move:80,detail:'+80m。自分以外の、この回の前進を半分にする。'},
 {id:'shield',name:'まるごとバリア',type:'防御',move:160,detail:'+160m。この回、外からの攻撃をすべて防ぐ。'},
 {id:'mirror',name:'反射ミラー',type:'反射',move:120,detail:'+120m。最初に受けた攻撃を送り返す。2発目からは受ける。'},
 {id:'engine',name:'永久エンジン',type:'装備',move:60,detail:'+60m。次の回から毎回+100m。何個でも重ねられる。'},
 {id:'magnet',name:'横取りマグネット',type:'攻撃',move:120,detail:'+120m。先頭の相手から、この回の前進の半分を奪う（最大300m）。'},
 {id:'banana',name:'バナナトラップ',type:'攻撃',move:180,detail:'+180m。すぐ前の相手を250m後退させる。前にいなければ空振り。'},
 {id:'pit',name:'落とし穴',type:'攻撃',move:100,detail:'+100m。すぐ後ろの相手の、この回の前進を0にする。'},
 {id:'swap',name:'入れ替えゲート',type:'攻撃',move:80,detail:'+80m。先頭の相手と、この回の開始地点を入れ替える。防御で失敗。'},
 {id:'dice',name:'一発逆転ダイス',type:'大勝負',move:0,detail:'半々で+1400m、または300m後退。運にすべてを託す！'},
 {id:'spring',name:'高跳びスプリング',type:'加速＋防御',move:350,detail:'+350m。バナナと落とし穴は飛び越える。'},
 {id:'comet',name:'逆転コメット',type:'追い上げ',move:550,detail:'+550mに加え、先頭との差の半分を上乗せ（上乗せ最大700m）。'},
 {id:'battery',name:'次回チャージ',type:'装備',move:100,detail:'+100m。次の回だけ、自分の前進が2倍に。重ねても2倍。'}
].map((x,tile)=>Object.freeze({...x,tile})));
export const item508 = id => ITEMS508.find(x=>x.id===id) ?? ITEMS508[0];
export const ATTACKS508 = Object.freeze(['shell','lightning','magnet','banana','pit','swap']);
