// Shared, deterministic course definitions. The renderer and server use the same bounds.
export const COURSES544=Object.freeze([
 {id:'market',name:'はじめての坂',label:'SUNSHINE MARKET',hint:'ふつうの床。まずは力加減をつかもう。',color:'#e8c781',zones:[],botPower:.66},
 {id:'wax',name:'床、磨きたて。',label:'SLIPPERY BUSINESS',hint:'ツヤのある木の床は滑る。弱めに押そう！',color:'#94e8f0',zones:[{kind:'wax',from:6,to:23,friction:.72}],botPower:.415},
 {id:'bank',name:'搬入中につき、遠回り。',label:'BANK SHOT MARKET',hint:'中央は荷物！ 左右の壁で反射して回り込もう。',color:'#e3b689',zones:[],blocks:[{x:0,y:10,w:5.1,h:2.4}],botPower:.81},
 {id:'boost',name:'返品エクスプレス',label:'EXPRESS DELIVERY',hint:'ベルトで１度だけ加速。押しすぎ注意！',color:'#ffc46f',zones:[{kind:'boost',from:12,to:15,boost:1.7}],botPower:.495},
 {id:'sale',name:'閉店セール',label:'LAST CHANCE · DOUBLE POINTS',hint:'滑る床＋加速ベルト！ 最後は得点２倍。',color:'#e7b4f6',zones:[{kind:'wax',from:6,to:16,friction:.85},{kind:'boost',from:18,to:21,boost:1.35}],botPower:.43},
].map(c=>Object.freeze({...c,zones:Object.freeze(c.zones.map(Object.freeze)),blocks:Object.freeze((c.blocks??[]).map(Object.freeze))})));
export const GOLD544=Object.freeze({from:26.9,to:29.3,bonus:50});
export const course544=g=>COURSES544[Math.max(0,Math.min(4,(g.round??1)-1))];
export const resistance544=(g,y)=>course544(g).zones.find(z=>z.friction&&y>=z.from&&y<z.to)?.friction??1.65;
export function parkingBonus544(p,radius=.58){return p.launched&&p.fallenAt==null&&Math.hypot(p.vx,p.vy)<.06&&p.y-radius>=GOLD544.from&&p.y+radius<=GOLD544.to?GOLD544.bonus:0}
