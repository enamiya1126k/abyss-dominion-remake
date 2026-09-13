// Native exploration sprite: 64px frame, 56px foot pivot and 2.65 scale.
export function royalHeroHitBounds434({camera,TILE,actor,nameBounds,padding=6}){
 const f=camera.world((actor.position.x+.5)*TILE,(actor.position.y+.9)*TILE),s=camera.z*2.65;
 return{left:Math.min(f.x-29*s,nameBounds.left)-padding,right:Math.max(f.x+29*s,nameBounds.right)+padding,top:Math.min(f.y-56*s,nameBounds.top)-padding,bottom:Math.max(f.y+8*s,nameBounds.bottom)+padding};
}
export function pickRoyalHero434(targets,point){
 return targets.filter(t=>point.x>=t.left&&point.x<=t.right&&point.y>=t.top&&point.y<=t.bottom).sort((a,b)=>Math.abs(point.x-(a.left+a.right)/2)-Math.abs(point.x-(b.left+b.right)/2))[0]?.hero??null;
}
export function nearestRoyalHero434(heroes,position,radius=1.45){return heroes.map(hero=>({hero,d:Math.hypot(position.x-hero.x,position.y-hero.y)})).filter(x=>x.d<=radius).sort((a,b)=>a.d-b.d)[0]?.hero??null;}
