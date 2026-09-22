// Deterministic presentation timeline, tied to the server decision timestamp.
export const finaleActive518=(g,now)=>g?.phase==='result'&&g.finale518&&now<g.finale518.until;
const clamp=n=>Math.max(0,Math.min(1,n)),mix=(a,b,t)=>a+(b-a)*t;
export function finalePose518(g,at,w,h,r,reduced=false){
 const t=Math.max(0,at-g.finale518.at),run=g.winner==='run',p=g.players.find(p=>p.playerId===g.finale518.escapeId),floor=h*.52,ex=w*.6,heroSize=Math.min(88,w*.22);
 let hero={x:w*.5,y:floor,angle:0,scale:1},enemy={x:ex,y:floor,angle:0,scale:1};
 if(run){
  const startX=r.left+(p?.x??5)*r.cell,startY=r.bottom-(p?.y??16)*r.cell;
  if(t<1100){const k=clamp(t/1100);hero={x:mix(startX,w*.37,k),y:mix(startY,floor,k)-Math.sin(k*Math.PI)*h*.18,angle:-15*Math.sin(k*Math.PI),scale:mix(.45,1,k)}}
  else if(t<1500){const k=clamp((t-1100)/400);hero={x:mix(w*.37,ex-heroSize*.3,k),y:floor-Math.sin(k*Math.PI)*heroSize*.48,angle:-25,scale:1}}
  else{const k=clamp((t-1500)/520);hero={x:mix(ex-heroSize*.3,w*.5,k),y:floor-Math.sin(k*Math.PI)*heroSize*.35,angle:mix(-25,0,k),scale:1};const kick=(t-1500)/750;enemy={x:ex+kick*w*.85,y:floor-kick*h*.7+kick*kick*h*.25,angle:kick*600,scale:Math.max(.25,1-kick*.35)}}
 }else{hero={x:w*.5,y:floor-(t<1550?0:Math.sin(clamp((t-1550)/600)*Math.PI)*24),angle:0,scale:1};}
 if(reduced){hero={x:w*.5,y:floor,angle:0,scale:1};enemy={x:w*1.4,y:floor,angle:0,scale:1};}
 const impact=run?1500:1250,shock=clamp(1-(t-impact)/400)*(t>=impact?1:0);
 return{t,run,hero,enemy,heroSize,floor,impact,shock:reduced?0:shock,seal:run?0:clamp(t/1250),platform:clamp(t/900),banner:t>2300,veil:clamp(t/800)*.62};
}
export function finaleMarkup518(c,g,pic){const runner=g.players.find(p=>p.playerId===g.finale518?.escapeId)??g.players.find(p=>p.role==='run'),drop=g.players.find(p=>p.role==='drop');return`<div class="tw-cinema518" data-tw-cinema517 hidden aria-live="polite"><div class="tw-veil518" data-tw-veil517></div><div class="tw-rays518"></div><div class="tw-podium518" data-tw-podium517><i></i><b>◆</b><i></i></div><div class="tw-seal518" data-tw-seal517><i></i><strong>◆</strong><i></i></div><div class="tw-cineactor518" data-tw-hero517>${pic(c,g.winner==='drop'?drop:runner)}</div><div class="tw-cineactor518" data-tw-villain517>${pic(c,drop)}</div><div class="tw-impact518" data-tw-impact517></div><div class="tw-cinetitle518" data-tw-banner517><small>${g.winner==='run'?'SKY LIBERATED':'FORTRESS DOMINATED'}</small><strong>${g.winner==='run'?'天空、奪還！':'完全制圧！'}</strong><span>${g.winner==='run'?'逃げる３人のチーム勝利':g.reason==='sealed'?'脱出経路、完全封鎖':g.reason==='unreachable'?'到達不能 — 脱出を阻止！':g.reason==='timeout'?'最後まで守り抜いた！':'３人全員を撃破！'}</span></div></div>`}
export function paintFinale518(u,g,at){
 const r=u.renderer,n=u.nodes,pose=finalePose518(g,at,r.width,r.height,r,u.reduced);n.cinema.hidden=false;u.root.classList.toggle('tw-ending518',true);
 n.veil.style.opacity=pose.veil;n.podium.style.top=pose.floor+'px';n.podium.style.opacity=pose.platform;
 n.seal.hidden=pose.run;n.seal.style.top=(pose.floor-110*(1-pose.seal))+'px';n.seal.style.opacity=pose.seal;n.seal.style.transform=`scaleX(${.3+.7*pose.seal})`;
 const actor=(el,p)=>{el.style.width=pose.heroSize+'px';el.style.height=pose.heroSize+'px';el.style.transform=`translate3d(${p.x-pose.heroSize/2}px,${p.y-pose.heroSize}px,0) rotate(${p.angle}deg) scale(${p.scale})`};actor(n.hero,pose.hero);actor(n.villain,pose.enemy);n.villain.hidden=!pose.run;n.hero.classList.toggle('tw-kick518',pose.run&&pose.t>=1100&&pose.t<1600&&!u.reduced);n.hero.style.opacity=pose.run||pose.t>1200?'1':'.8';
 n.banner.style.opacity=pose.banner?'1':'0';n.impact.style.opacity=pose.shock;n.impact.style.top=(pose.floor-pose.heroSize*.6)+'px';n.impact.style.transform=`translateX(-50%) scale(${1+(1-pose.shock)*2})`;
 return pose;
}
