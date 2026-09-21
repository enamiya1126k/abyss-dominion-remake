import{destruction488,paintDestruction488,atlasPosition488,damageMessage488,damageRecord488}from'./Destruction488.js';
export function destruction490(total=0){
 const d=destruction488(total),floorHits=Math.max(0,d.hits-26);
 return {...d,floorHits,floor:Math.min(7,Math.max(0,floorHits-1)),
  label:floorHits?`床の破壊 ${floorHits}打${floorHits>=8?' · 深淵まで貫通！':''}`:d.label};
}
export function floorStyle490(d){
 // Eight silhouette stages, then a slowly widening abyss on every further strike.
 const extra=Math.max(0,d.floorHits-8),scale=1+.28*extra/(extra+30);
 return {backgroundPosition:atlasPosition488(d.floor),opacity:d.floorHits?1:0,transform:`scale(${scale})`};
}
export function floorMarkup490(total,result=false){
 const d=destruction490(total),s=floorStyle490(d);
 return `<div class="cb-floor490${result?' cb-result-floor490':''}" data-cb-floor role="img" aria-label="床の破壊 ${d.floorHits}打" style="background-position:${s.backgroundPosition};opacity:${s.opacity};transform:${s.transform}"></div>`;
}
export function paintDestruction490(stage,total){
 paintDestruction488(stage,total);const d=destruction490(total),floor=stage.querySelector('[data-cb-floor]');
 if(floor){Object.assign(floor.style,floorStyle490(d));floor.dataset.damage=d.floorHits;floor.setAttribute('aria-label',d.label)}
 return d;
}
export function damageMessage490(total,charged){
 const d=destruction490(total);if(!d.floorHits)return damageMessage488(total,charged);
 return (d.floorHits>=8?'床の下は、深淵！':d.floorHits>=4?'床まで陥没！':'床にもヒビ！')+(charged?' −80':'');
}
export function damageRecord490(total){
 const d=destruction490(total);return damageRecord488(total)+(d.floorHits?` · 床の破壊 ${d.floorHits}打`:'');
}
