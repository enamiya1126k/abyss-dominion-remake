// Every obstacle and surface is shared by the authoritative solver and renderer.
const courses=[
 {id:'market',scene:'market',name:'はじめての坂',label:'SUNSHINE MARKET',hint:'素直な木の坂。駆け引きは、押す強さとタイミング。',color:'#e8c781',zones:[],botPower:.66},
 {id:'wax',scene:'market',name:'床、磨きたて。',label:'SLIPPERY BUSINESS',hint:'真ん中の長い坂はツルツル。弱めの一押しも遠くへ。',color:'#94e8f0',zones:[{kind:'wax',from:6,to:23,friction:.72}],botPower:.415},
 {id:'bank',scene:'market',name:'搬入中につき、遠回り。',label:'BANK SHOT MARKET',hint:'中央は荷物！ 左右の壁で反射して回り込もう。',color:'#e3b689',zones:[],blocks:[{x:0,y:10,w:5.1,h:2.4}],botPower:.81},
 {id:'boost',scene:'market',name:'返品エクスプレス',label:'EXPRESS DELIVERY',hint:'中央のローラーでひと加速。踏む前の勢いが勝負！',color:'#ffc46f',zones:[{kind:'boost',from:12,to:15,boost:1.7}],botPower:.495},
 {id:'sale',scene:'market',name:'閉店ダッシュ',label:'LAST CALL MARKET',hint:'磨いた床の先に加速台。止まりたいのに、もう一押し！',color:'#e7b4f6',zones:[{kind:'wax',from:6,to:16,friction:.85},{kind:'boost',from:18,to:21,boost:1.35}],botPower:.43},
 {id:'frost',scene:'frost-harbor',name:'つるつる氷の港',label:'FROST HARBOR',hint:'端から端まで滑る坂。壁で勢いを逃がすのも手。',color:'#a1e9ff',friction:.88,zones:[],botPower:.42},
 {id:'icefork',scene:'frost-harbor',name:'氷か、じゅうたんか。',label:'SPLIT DECISION',hint:'左は滑る氷、右は止まるじゅうたん。どちらを通す？',color:'#b8ddff',friction:1.15,zones:[{kind:'wax',from:5,to:25,left:-4.4,right:0,friction:.46},{kind:'rug',from:5,to:25,left:0,right:4.4,friction:3.6}],botPower:.65},
 {id:'slalom',scene:'frost-harbor',name:'雪どけジグザグ便',label:'FROZEN SLALOM',hint:'左右に積み荷。滑る床と壁を使って、すき間を抜けよう。',color:'#bceef3',friction:1.12,zones:[],blocks:[{x:-2.35,y:9.2,w:3.1,h:1.6},{x:2.35,y:17.5,w:3.1,h:1.6}],botPower:.72},
 {id:'relay',scene:'foundry-quay',name:'二段ロケット配送',label:'STEAM RELAY',hint:'左の加速台、次は右の加速台。両方踏む？ 片方にする？',color:'#ffd28c',zones:[{kind:'boost',from:7.5,to:10.5,left:-4.15,right:-.4,boost:1.7},{kind:'boost',from:17,to:20,left:.4,right:4.15,boost:1.7}],botPower:.51},
 {id:'reversal',scene:'foundry-quay',name:'行きすぎ返品ベルト',label:'RETURN TO SENDER',hint:'手前は加速、奥は逆回転で減速。戻されるほど踏むな！',color:'#a8e6dd',zones:[{kind:'boost',from:8,to:11,boost:2.5},{kind:'boost',from:20,to:23,boost:-3.4}],botPower:.69},
 {id:'bumpers',scene:'moonlit-bazaar',name:'真夜中のばね樽',label:'BOUNCE BAZAAR',hint:'金のばね樽が弾き返す！ 樽と壁で連続バウンド。',color:'#f4c5ff',zones:[],bumpers:[{x:-1.75,y:9.5,r:.7,kick:2.4},{x:1.75,y:13.6,r:.7,kick:2.4},{x:0,y:21,r:.8,kick:2.4}],botPower:.74},
 {id:'crosswind',scene:'moonlit-bazaar',name:'横取りクロスベルト',label:'MIDNIGHT CROSSING',hint:'右へ、左へ、ベルトが横取り。壁で弾いて奥へ抜けろ！',color:'#e3bbff',zones:[{kind:'boost',from:8,to:10.8,boost:0,kickX:4.3,direction:'right'},{kind:'boost',from:17,to:19.8,boost:0,kickX:-4.3,direction:'left'}],botPower:.65},
];
export const COURSES556=Object.freeze(courses.map(c=>Object.freeze({...c,friction:c.friction??1.65,zones:Object.freeze(c.zones.map((z,i)=>Object.freeze({id:c.id+':'+i,left:-4.15,right:4.15,...z}))),blocks:Object.freeze((c.blocks??[]).map(Object.freeze)),bumpers:Object.freeze((c.bumpers??[]).map(Object.freeze))})));
export const courseById556=id=>COURSES556.find(c=>c.id===id);
const shuffle=(items,random)=>{const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out};
// A server-owned draw: five different courses, at least three scenery families.
// Store the deck once; never redraw it on reconnect or a process restart.
export function drawCourses556(random){const groups=shuffle([...new Set(COURSES556.map(c=>c.scene))],random).slice(0,3),chosen=groups.map(scene=>{const pool=COURSES556.filter(c=>c.scene===scene);return pool[Math.floor(random()*pool.length)].id});const rest=shuffle(COURSES556.filter(c=>!chosen.includes(c.id)).map(c=>c.id),random);return shuffle([...chosen,...rest.slice(0,2)],random)}
export const insideZone556=(z,x,y)=>x>=(z.left??-4.15)&&x<=(z.right??4.15)&&y>=z.from&&y<z.to;
export function zoneEntry556(z,x0,y0,x1,y1){
 // Swept segment against the surface rectangle, including sideways entries.
 let lo=0,hi=1;for(const [a,b,min,max] of [[x0,x1,z.left,z.right],[y0,y1,z.from,z.to]]){const d=b-a;if(Math.abs(d)<1e-9){if(a<min||a>max)return false;continue}const u=(min-a)/d,v=(max-a)/d;lo=Math.max(lo,Math.min(u,v));hi=Math.min(hi,Math.max(u,v));if(lo>hi)return false}return true;
}
