import {SPECIAL_BY_ID463} from './Catalog463.js';
import {SPECIAL_SHORT466} from './CardRanks466.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={
 move:'M4 12h15m-6-6 6 6-6 6M4 6h4M4 18h4',
 draw:'M5 3h11v15H5zM9 21h11V7M8 10h5m-2.5-2.5v5',
 defend:'M12 3 3 6v6c0 5 9 9 9 9s9-4 9-9V6zM7 12l3 3 7-7',
 steal:'M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4',
 awaken:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z',
 curse:'m12 2 9 18H3zM12 8v5m0 3v1',
 set:'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z',
 discard:'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',
 dice:'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2M7 7h.01M12 12h.01M17 17h.01'
};
export function effectIcon470(key){return `<svg class="sg-effect-icon470" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[key]??paths.awaken}"/></svg>`;}
export function cardCue470(card){
 const category=card.category469??'効果',types=(card.effects??[]).map(e=>e.type);
 const key=card.set?'set':card.kind==='curse'||card.kind==='bad'?'curse':card.timing==='reaction'?'defend':types.includes('special')?'awaken':types.includes('steal')||types.includes('swapHand')?'steal':types.includes('discard')?'discard':types.includes('dice')?'dice':types.includes('draw')?'draw':'move';
 const timing=card.set?'4種類そろえて使う':card.timing==='passive'?'持っている間に有効':card.timing==='reaction'?'攻撃を受けた時に使う':card.timing==='instant'?'通常は引くとすぐ発動':'自分の移動前に使う';
 return {key,category,timing};
}
export const SPECIAL_TINY470={worker:'休み・後退無効',grudge:'後退に反撃',chuni:'2枚で出目＋5',surprise:'最下位で妨害',want:'手番ごとに奪取',genius:'素の出目7以上',hacker:'速攻を手札へ',greed:'補充・破棄2倍',power:'黒マス無効',buddha:'闇無効・＋1マス',tsundere:'単体攻撃を反射',thief:'最下位で＋3',drunk:'より所持で＋2',shiva:'手札を防御に',punch:'近くの相手−3',swift:'安全に1枚補充'};
export function specialBack470(){return '<div class="sg-special-back470" aria-hidden="true"></div>';}
export function specialDeck470(){return '<span class="sg-special-deck470" aria-hidden="true"><i></i><i></i><i></i></span>';}
export function specialCard470(id,art){const s=SPECIAL_BY_ID463[id];if(!s)return '';return `<article class="sg-special-card470"><small>特殊カード · 公開</small>${art(s.art)}<h2>${esc(s.name)}</h2><p>${esc(SPECIAL_SHORT466[id]??s.text)}</p><span>覚醒能力</span></article>`;}

// Both still and animated pawns use the same ground anchor and overlap offsets.
export function pawnAnchor470(players,id,nodes,zoom=.72,overview=false){const p=players.find(x=>x.playerId===id),n=nodes[p?.pos];if(!n)return null;const stack=players.filter(x=>x.pos===p.pos),i=stack.findIndex(x=>x.playerId===id),scale=overview?Math.max(1,.55/zoom):1;return {x:n.x+(i-(stack.length-1)/2)*44*scale,y:n.y-5};}
