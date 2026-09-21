import{GORILLA503,warning503}from'./Rules503.js';
import{playerColor499}from'../party/PartyColors499.js';
export{warning503 as warning504};
export{count503 as count504}from'./Presentation503.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
// IDs/types are stable across 503/504 and never depend on the hidden losing hair.
const bumps=new Set([3,8,16,21,27]);
export const HAIRS504=Object.freeze(Array.from({length:30},(_,id)=>{
 const row=Math.floor(id/5),col=id%5,baseX=38+col*6,baseY=49.5+row*5.9;
 return Object.freeze({id,baseX,baseY,x:baseX+Math.sin(id*7.1)*.45,y:baseY+Math.cos(id*4.9)*.18,bump:bumps.has(id),zone:row<3?'chest':'navel',bend:Math.sin(id*3.7),length:12+(id*5%7),tilt:Math.cos(id*1.9)*.32});
}));
// Normalized source rectangles keep the re-packed sprites aligned without
// changing the PNGs or allowing adjacent frames to bleed into the scene.
export const ATLAS504=Object.freeze({
 patience:[[0,0,627,627],[0,0,627,627],[0,0,627,627],[0,0,627,627]],
 tension:[[55,55,536,536],[39,55,538,538],[53,42,542,542],[37,42,542,542]],
 rage:[[75,60,515,515],[61,75,507,507],[76,57,516,516],[54,57,512,512]]
});
export const STAGES504=Object.freeze([
 {at:0,asset:'patience',frame:0,title:'…………。',sub:'王、無。まだ顔色ひとつ変えない。'},
 {at:2,asset:'tension',frame:0,title:'……ん？',sub:'眉が、ほんの少し動いた。'},
 {at:5,asset:'patience',frame:1,title:'……気のせいじゃ。',sub:'ほっぺだけ、正直。'},
 {at:9,asset:'tension',frame:1,title:'……まだ、平気じゃ。',sub:'まぶたに、力が入り始めた。'},
 {at:13,asset:'patience',frame:2,title:'……今のは、汗じゃ。',sub:'黙って、じっと耐えている。'},
 {at:18,asset:'tension',frame:2,title:'ん゛……。',sub:'歯を食いしばり始めた。'},
 {at:24,asset:'patience',frame:3,title:'……調子に、乗るでない。',sub:'顔が赤い。かなり赤い。'},
 {at:30,asset:'tension',frame:3,title:'もう……っ！',sub:'王、湯気まで出てきた。'}
].map(Object.freeze));
export const painWeight504=id=>HAIRS504[id]?.bump?2:1;
// Cosmetic discomfort, NOT an explosion threshold or a probability hint.
// Reconstruct from public history so reconnects and all four views agree.
export function pain504(g,at=Infinity){let ids=g.picked??[];const last=g.events?.at(-1);if(g.phase==='pluck'&&last&&at-(g.phaseAt503??last.at)<530)ids=ids.filter(id=>id!==last.hair);return [...new Set(ids)].reduce((n,id)=>n+(HAIRS504[id]?painWeight504(id):0),0)}
export function stage504(g,at=Infinity){const pain=pain504(g,at);let index=0;for(let i=1;i<STAGES504.length;i++)if(pain>=STAGES504[i].at)index=i;return{...STAGES504[index],index,pain}}
export function camera504(g,at,reduced=false){if(reduced)return['focus','playing','pluck'].includes(g.phase)?1:0;const age=at-(g.phaseAt503??at);if(g.phase==='focus')return smooth(age/GORILLA503.focusMs);if(['playing','pluck'].includes(g.phase))return 1;if(g.phase==='reaction')return g.events.at(-1)?.mercy504?0:1-smooth(age/700);if(g.phase==='drum')return 1-smooth(age/420);if(g.phase==='blast')return g.rules504===1?0:1-smooth(age/420);return 0}
export function layout504(w,h,g,at,reduced=false){const size=Math.min(w*.94,Math.max(250,h-138),470),x=(w-size)/2,y=Math.max(75,(h-size)*.48+15),focus=camera504(g,at,reduced),unit=Math.min(w*.90/38,(h-118)/29.5),target=unit*100/size,scale=1+(target-1)*focus,cx=w/2,cy=y+size*.64,targetY=Math.max(h*.55,114+(64-49.5)*unit);
 return{w,h,size,x,y,focus,scale,cx,cy,dx:0,dy:(targetY-cy)*focus,point(px,py){return{x:cx+(x+size*px/100-cx)*scale,y:cy+(y+size*py/100-cy)*scale+(targetY-cy)*focus}}};
}
export function hairTargets504(l){return HAIRS504.map(h=>{const p=l.point(h.baseX,h.baseY);return{id:h.id,x:p.x,y:p.y-19,width:44,height:44}})}
export function kingPose504(g,at){if(g.phase==='drum'||g.phase==='blast'){const t=at-(g.phase==='drum'?g.drumAt504:g.blastAt);return{asset:'rage',frame:t<650?0:t<980||t>2550?1:2+Math.floor((t-980)/160)%2}}
 const s=stage504(g,at);return{asset:s.asset,frame:s.frame};
}
export function plucker504(g){const last=g.events?.at(-1);return (['pluck','reaction','drum','blast'].includes(g.phase)?g.players.find(p=>p.playerId===last?.playerId):g.players[g.turnSeat])??g.players[g.turnSeat]}
export function toolColor504(g){return playerColor499(plucker504(g))}
export function toolTag504(g,l,at,pending){const id=g.phase==='pluck'?g.events.at(-1)?.hair:pending?.kind==='pull'?pending.hair:null,h=HAIRS504[id];if(!h)return null;const root=l.point(h.x,h.y);return{x:clamp(root.x+(h.x>50?-52:52),44,l.w-44),y:clamp(root.y-54,150,l.h-32),player:plucker504(g)}}
export function flight504(g,p,at,w,h,reduced=false){const elapsed=at-(g.blastAt??at)-1300,far=p.playerId===g.loserId,duration=far?3400:1350,t=clamp(elapsed/duration);if(g.phase!=='blast'||elapsed<0||reduced)return{x:0,y:0,rotate:0,scale:1,landed:false};const arc=Math.sin(t*Math.PI);return{x:arc*(p.seat<2?-1:1)*w*(far?.27:.17),y:-arc*h*(far?1.6:.67),rotate:arc*(far?940:(p.seat%2?150:-150)),scale:1-arc*(far?.58:.2),landed:t>=1}}
export function blast504(g,at,reduced=false){if(!['drum','blast'].includes(g.phase))return null;const age=at-(g.phase==='drum'?g.drumAt504:g.blastAt);return{age,judging:g.phase==='drum',beat:age<650?'silence':age<980?'roar':age<1300?'drum':age<2600?'impact':age<4700?'flight':'land',shake:reduced?0:age>=980&&age<2600?(1-(age-980)/1620)*(g.phase==='drum'?3:7):0,scale:reduced?1:age>=650&&age<2600?1.07:1}}
export function caption504(g,self,at){const p=g.players?.[g.turnSeat],mine=p?.playerId===self,name=mine?'あなた':p?.name??'挑戦者',s=stage504(g,at),last=g.events.at(-1);
 if(g.phase==='countdown')return{title:'王の胸毛に、挑め。',sub:'最初の1本でも、突然ブチギレ。'};
 if(g.phase==='pluck')return{title:at-g.phaseAt503<530?'そ〜っと、引っぱる……':HAIRS504[last?.hair]?.bump?'ぷちっ！ 痛さ2倍！':'ぷちっ！',sub:`${name}の1本。さて、王の反応は……？`};
 if(g.phase==='drum')return{title:at-g.drumAt504<650?'…………抜いたな？':at-g.drumAt504<2400?'ドンドンドンドン！！':'……許される？',sub:'まだ負けじゃない。セーフは50％！'};
 if(['reaction','decision'].includes(g.phase))return{title:last?.mercy504?'……今回は、許す。':s.title,sub:g.phase==='decision'?`${name}は${g.turnPulls503}本セーフ。もう1本、いく？`:last?.mercy504?'セーーーフ！ 全員、その場でひと安心。':s.sub};
 if(g.phase==='blast'){const t=at-g.blastAt;return{title:t<650?'…………抜いたな？':t<1300?'まずい。王が、キレた。':t>4700?'ドッスーーン！！':'全員、ぶっ飛べーー！！',sub:t<650?'その1本は、抜いてはいけなかった。':`${g.players.find(p=>p.playerId===g.loserId)?.name??'挑戦者'}、やっちまった！`}};
 return{title:g.phase==='handoff'?`${name}の番！`:mine?'気になる毛を、1本。':`${name}が選んでいるよ。`,sub:`残り${30-g.picked.length}本 · この番 ${g.turnPulls503}/3本`};
}
