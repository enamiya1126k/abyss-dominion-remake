import {image602} from './Art602.js';
export function iceArt598(c,p,at,reduced=false){
 c.save();c.globalAlpha=.7;image602(c,'ice-shell',p.x-25,p.y-39,50,41);c.restore();
 if(p.ice?.vx&&!reduced){c.save();c.translate(p.x,p.y-8);c.scale(Math.sign(p.ice.vx),1);c.globalAlpha=.65;image602(c,'wind-streak',-60,-7,42,11);c.restore();}
}
