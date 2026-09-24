import{overviewFrame462}from'./RaceOverview462.js';
import{course459}from'./RaceCourse459.js';
import{worldSize461,worldPoint461,followCamera461}from'./RaceCamera461.js';
const base='./assets/race461/';
const ovalPath=(radius=312)=>`M648 ${720-radius}H1272A${radius} ${radius} 0 0 1 1272 ${720+radius}H648A${radius} ${radius} 0 0 1 648 ${720-radius}Z`;
export function worldArt461(r){const track=course459(r.track459),oval=track.shape==='oval',world=worldSize461(track),d=oval?ovalPath():'M160 500H3040',edge=offset=>oval?ovalPath(312+offset):`M160 ${500+offset}H3040`,finishX=oval?960:2960,finishY=oval?1032:500;
 const posts=Array.from({length:oval?72:36},(_,i)=>{const t=i/(oval?72:35),p=worldPoint461(t,3.5,track),a=(p.angle+90)*Math.PI/180;return[-135,135].map(side=>{const x=p.x+Math.cos(a)*side,y=p.y+Math.sin(a)*side;return`<g transform="translate(${x} ${y})"><ellipse cy="4" rx="6" ry="4" fill="#050a10" opacity=".6"/><rect x="-3" y="-8" width="6" height="13" rx="1" fill="#796143"/><path d="M-4-8H4L2-13H-2Z" fill="#e8c178"/></g>`}).join('')}).join('');
 return`<svg class="world-art461" viewBox="0 0 ${world.width} ${world.height}" width="${world.width}" height="${world.height}" aria-hidden="true"><defs><pattern id="ground461" patternUnits="userSpaceOnUse" width="480" height="480"><image href="${base}${r.course==='砂'?'sand':'turf'}.webp" width="480" height="480"/></pattern><pattern id="finish461" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#eee0b3"/><path d="M0 0H10V10H0ZM10 10H20V20H10Z" fill="#211926"/></pattern><linearGradient id="rail461" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e6c981"/><stop offset="1" stop-color="#7d5636"/></linearGradient></defs><image href="${base}arena.webp" width="${world.width}" height="${world.height}" preserveAspectRatio="none"/><path d="${d}" fill="none" stroke="#050d0b" stroke-width="278" opacity=".7" transform="translate(0 7)"/><path d="${d}" fill="none" stroke="#5c5139" stroke-width="268"/><path d="${d}" fill="none" stroke="url(#ground461)" stroke-width="250"/>${[-132,132].map(n=>`<path d="${edge(n)}" fill="none" stroke="#1e1c20" stroke-width="8"/><path d="${edge(n)}" fill="none" stroke="url(#rail461)" stroke-width="4" transform="translate(0 -4)"/>`).join('')}${posts}<rect x="${finishX-10}" y="${finishY-125}" width="20" height="250" fill="url(#finish461)" opacity=".9"/><text x="${finishX+24}" y="${finishY+168}" fill="#e6d5a5" font-size="20" letter-spacing="4">${oval?'START / FINISH':'FINISH'}</text>${!oval?'<path d="M240 375V625" stroke="#e2d2a2" stroke-width="5"/>':''}</svg>`;
}
export function broadcast461(r,c,html){if(r.rulesVersion<7)return html;const track=course459(r.track459),world=worldSize461(track),mode=c.camera461??'follow';
 html=html.replace('1000m',track.distance+'m').replace(/<div class="race-camera457"[\s\S]*?<\/div>/,`<div class="race-camera461" aria-label="レースカメラ"><span><b data-course-lap459>${track.shape==='oval'?'1 / '+track.laps+'周':'直線'}</b><small data-course-section459>スタート待ち</small></span><button data-race-camera461="overview" aria-pressed="${mode==='overview'}">コース全体</button><button data-race-camera461="follow" aria-pressed="${mode==='follow'}">追尾カメラ</button></div>`);
 html=html.replace('class="race-track451 track452"','class="race-track451 track452 world-viewport461"').replace('<div class="race-track-glint452">',`<div class="world-plane461" data-world-plane461 style="width:${world.width}px;height:${world.height}px">${worldArt461(r)}<div class="race-track-glint452">`).replace('<div class="race-start452"','</div><div class="race-start452"');
 html=html.replace('<div class="race-grandstand452">',`<div class="race-grandstand452"><button class="expand-race460" data-race-action="expand460" aria-pressed="${!!c.expanded460}">${c.expanded460?'通常表示':'拡大表示'}</button>`);if(track.shape==='oval')html=html.replace('最後の直線</b>','勝負の終盤</b>');return html;
}
const worlds529=new WeakMap();
export function disposeWorld529(c){worlds529.get(c)?.observer?.disconnect();worlds529.delete(c)}
function nodes529(c){let n=worlds529.get(c);if(n?.root===c.root.firstElementChild)return n;
 disposeWorld529(c);const viewport=c.root.querySelector('.world-viewport461'),plane=viewport?.querySelector('[data-world-plane461]');if(!plane)return null;
 n={root:c.root.firstElementChild,viewport,plane,width:viewport.clientWidth,height:viewport.clientHeight,
  runners:[...plane.querySelectorAll('[data-race-runner]')],buttons:[...c.root.querySelectorAll('[data-race-camera461]')],labels:{}};
 for(const s of ['[data-remaining457]','[data-course-lap459]','[data-course-section459]','[data-boost-status]'])n.labels[s]=c.root.querySelector(s);
 for(const el of n.runners){let number=el.querySelector('.runner-number461');if(!number){number=document.createElement('b');number.className='runner-number461';number.textContent=String(Number(el.dataset.raceRunner)+1);el.append(number)}}
 if(typeof ResizeObserver!=='undefined'){n.observer=new ResizeObserver(entries=>{const box=entries[0]?.contentRect;if(box){n.width=box.width;n.height=box.height}});n.observer.observe(viewport)}
 worlds529.set(c,n);return n;
}
const style529=(el,key,value)=>{if(el.style[key]!==value)el.style[key]=value};
export function updateWorld461(c,r,frame,p){if(r.rulesVersion<7)return;const n=nodes529(c);if(!n)return;const{viewport,plane}=n;
 const mode=c.camera461??'follow',track=course459(r.track459),world=worldSize461(track),overview=overviewFrame462(r.track459,n.width);
 if(n.mode!==mode||n.modeWidth!==n.width){n.mode=mode;n.modeWidth=n.width;viewport.dataset.camera461=mode;style529(viewport,'height',mode==='overview'?overview.height+'px':'');style529(viewport,'flex',mode==='overview'?'0 0 auto':'');viewport.classList.remove('is-follow457');viewport.dataset.shape462=track.shape;for(const button of n.buttons)button.setAttribute('aria-pressed',String(button.dataset.raceCamera461===mode))}
 const width=n.width,height=mode==='overview'?overview.height:n.height,live=r.live456,ownIndex=r.racers.findIndex(x=>x.ownerId===c.transport.selfId),watched=r.members.find(m=>m.playerId===(c.watchPlayer452??c.transport.selfId)),put=(s,t)=>{const el=n.labels[s];if(el&&el.textContent!==t)el.textContent=t};
 const close=frame.allFinished&&frame.finished.length>1&&Math.abs(live.runners[frame.finished[0].i].finishMs-live.runners[frame.finished[1].i].finishMs)<650,replayT=Math.min(1,Math.max(0,(Date.now()-(p.photoAt456??Date.now()))/1800)),replay=close&&replayT<1&&!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches&&live.history.length>1;
 const points=r.racers.map((_,i)=>{const position=frame.positions.find(x=>x.i===i);let progress=position?.p??0;if(replay){const t=replayT*(live.history.length-1),a=Math.floor(t),b=Math.min(a+1,live.history.length-1);progress=(live.history[a][i]*(1-t+a)+live.history[b][i]*(t-a))/track.distance}return{i,...worldPoint461(progress,i,track)}});
 const key=[r.id,width,height,mode].join(':'),now=performance.now(),previous=c.worldCamera461?.key===key?c.worldCamera461:null,camera=mode==='overview'?overview.camera:followCamera461(points,width,height,previous,previous?now-previous.at:16,false,world);
 c.worldCamera461={...camera,key,at:now};style529(plane,'transform',`translate3d(${width/2-camera.cx*camera.scale}px,${height/2-camera.cy*camera.scale}px,0) scale(${camera.scale})`);
 for(const point of points){const el=n.runners.find(el=>Number(el.dataset.raceRunner)===point.i);if(!el)continue;
  style529(el,'transform',`translate3d(${point.x}px,${point.y}px,0) translate(-50%,-100%)`);style529(el,'zIndex',String(Math.round(point.y)));
  const facing=String(Math.cos(point.angle*Math.PI/180)<0?-1:1);if(el.style.getPropertyValue('--facing461')!==facing)el.style.setProperty('--facing461',facing);
  el.classList.toggle('is-own458',point.i===ownIndex);el.classList.toggle('is-ticket461',!!watched?.ticket?.picks.includes(point.i));
  if(n.race!==r.id)el.setAttribute('aria-label',`${point.i+1}番 ${r.racers[point.i].name}`);
 }
 n.race=r.id;
 // Human-readable counters need not invalidate layout at display refresh rate.
 if(now-(n.hudAt??-Infinity)>=100||frame.allFinished){n.hudAt=now;const lp=frame.leader?.p??0;put('[data-remaining457]',frame.allFinished?'全匹ゴール':`先頭 残り${Math.max(0,Math.ceil((1-lp)*track.distance))}m`);put('[data-course-lap459]',frame.allFinished?'全匹ゴール':track.shape==='oval'?`${Math.min(track.laps,Math.floor(lp*track.laps)+1)} / ${track.laps}周`:'直線');put('[data-course-section459]',frame.allFinished?'着順確定':worldPoint461(lp,0,track).corner?'コーナー':'直線区間');if(live?.runners[ownIndex]?.pendingBoost459?.length)put('[data-boost-status]','いうことを聞かない…！ 少し遅れて加速')}
}
