export const BET_NAMES456={win:'単勝',place:'複勝',pair:'二連複',wide:'ワイド',exact:'二連単',trio:'三連複',trifecta:'三連単'};
export const pickCount456=kind=>({win:1,place:1,pair:2,wide:2,exact:2,trio:3,trifecta:3})[kind]??0;
export const ordered456=kind=>kind==='exact'||kind==='trifecta';
export const betHint456=kind=>({win:'1着になる1匹',place:'3着以内になる1匹',pair:'1・2着になる2匹（順不同）',wide:'両方が3着以内になる2匹',exact:'1着 → 2着の順で2匹',trio:'上位3匹（順不同）',trifecta:'1着 → 2着 → 3着の順で3匹'})[kind];
export function validTicket456(t){return !!t&&pickCount456(t.kind)>0&&Array.isArray(t.picks)&&t.picks.length===pickCount456(t.kind)&&t.picks.every(i=>Number.isInteger(i)&&i>=0&&i<8)&&new Set(t.picks).size===t.picks.length}
export function ticketWins456(t,order){if(!validTicket456(t)||!Array.isArray(order))return false;if(t.kind==='win')return t.picks[0]===order[0];if(ordered456(t.kind))return t.picks.every((i,j)=>order[j]===i);const n=t.kind==='pair'?2:3;return order.length>=n&&t.picks.every(i=>order.slice(0,n).includes(i))}
export function probability456(f,t){if(!f||!validTicket456(t))return 0;let hit=0,total=0;for(let a=0;a<8;a++)for(let b=0;b<8;b++)for(let c=0;c<8;c++){if(a===b||a===c||b===c)continue;const count=(f.triples[a*64+b*8+c]??0)+.25;total+=count;if(ticketWins456(t,[a,b,c]))hit+=count}return hit/total}
export function odds456(f,t){const p=probability456(f,t);return p>0?Math.max(1.1,Math.min(1000,Math.floor(.85/p*10)/10)):0}
export function forecastRows456(f){const rows=Array.from({length:8},(_,index)=>({index,probability:probability456(f,{kind:'win',picks:[index]}),odds:odds456(f,{kind:'win',picks:[index]})}));return rows.map(x=>({...x,rank:1+rows.filter(y=>y.probability>x.probability).length}))}
