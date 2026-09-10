import {ENDGAME_SPRITE_BOUNDS399} from '../data/endgameSpriteBounds399.js?v=3.1.79-build399';

export const ENDGAME_SPRITE_VERSION399='3.1.79-build399';

// Bounds cover all eight motions. A wider attack must not be cropped by a
// position calculated while the idle frame happened to be on screen.
export function endgameSpriteBounds399(id){
 return ENDGAME_SPRITE_BOUNDS399[id]??null;
}

export function endgameArtFit399({width,height,slotWidth,headroom}){
 const values=[width,height,slotWidth,headroom];
 if(values.some(value=>!Number.isFinite(value)))return 1;
 return Math.max(.01,Math.min(1,Math.max(1,slotWidth-8)/Math.max(1,width),Math.max(1,headroom)/Math.max(1,height)));
}
