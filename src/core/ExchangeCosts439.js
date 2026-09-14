export const exchangeKeyCost439=kind=>kind==='tenGod'?15:kind==='abyss'?10:5;
export const heldKeys439=state=>Math.max(0,Math.floor(Number(state.inventory?.abyssKeys)||0));
export function exchangeKeys439(state,kind){const required=exchangeKeyCost439(kind),available=heldKeys439(state);return {keyCost:required,availableKeys:available,keysEnough:available>=required};}
