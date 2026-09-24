// One amplification per numeric effect. Fixed rules and payment costs stay fixed.
export const GREED_TEXT528='自分の出目・移動・追加サイコロ・カードの増減枚数が2倍。後退・休みも2倍。行動できる自分の2手番で終了。💎・支払コスト・固定効果は対象外。サイコロは最大5個。';
const doubled=new Set(['move','direct','bonus','dice','roll','resonance','draw','discard','discardAttr','catastrophe','steal','recover','swapHand','skip']);
export const greedMultiplier528=(p,e={})=>p?.special==='greed'&&!e.cost&&!e.noGreed&&doubled.has(e.type)?2:1;
export const greedLeft528=p=>p?.special==='greed'?Math.max(0,p.greedTurns528??2):0;
export function ensureGreed528(p){if(p?.special==='greed'&&!Number.isInteger(p.greedTurns528))p.greedTurns528=2;}
export function markGreedTurn528(g,p){ensureGreed528(p);if(p?.special==='greed'&&g.players[g.turn]===p&&g.step==='pre'&&!p.mods.noRoll)p.greedActiveTurn528=g.turnNumber;}
export function setSpecial528(g,p,id,remaining=2){p.special=id;p.ward=null;delete p.greedActiveTurn528;delete p.greedTurns528;if(id==='greed'){p.greedTurns528=remaining;markGreedTurn528(g,p);}}
export function finishGreedTurn528(g,p){ensureGreed528(p);if(p?.special!=='greed'||p.greedActiveTurn528!==g.turnNumber)return false;p.greedTurns528--;delete p.greedActiveTurn528;return p.greedTurns528<=0;}
