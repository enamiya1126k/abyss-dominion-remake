import {HOME_SKINS400,homeSkinState400,commitHomeSkin400} from '../core/HomeSkinSystem400.js?v=3.1.82-build402';

const legacyMotion=`<div class="home-environment-motion" aria-hidden="true">
 <i class="home-moving-sky sky-left"></i><i class="home-moving-sky sky-right"></i>
 <i class="home-moving-foliage foliage-left"></i><i class="home-moving-foliage foliage-right"></i>
 <i class="home-river-shimmer river-frame-1"></i><i class="home-river-shimmer river-frame-2"></i><i class="home-river-shimmer river-frame-3"></i>
</div>`;
const path=(d,attributes='')=>`<path d="${d}" ${attributes}/>`;
const particlePositions=[[125,375],[774,336],[621,666],[295,520],[851,788],[403,769],[687,504],[207,871],[572,345],[907,463],[354,341],[732,911]];
function particles(skin){
 return particlePositions.map(([x,y],i)=>`<g class="skin400-moving skin400-particle ${skin.id==='invasion'?'skin400-ember':''}" style="--delay:-${i*1.7}s;--duration:${8+i%5*3}s;--drift:${i%2?18:-16}px">
 <rect x="${x}" y="${y}" width="${skin.id==='forest'?3:4}" height="${skin.id==='invasion'?7:4}" fill="${skin.color}" opacity="${.26+(i%3)*.14}"/>
 </g>`).join('');
}
export function homeSkinScene400(state,context='home'){
 const {skin,motion}=homeSkinState400(state),id=`skin400-${context==='preview'?'preview':'home'}-${skin.id}`;
 const layer=(clip,cls)=>`<g clip-path="url(#${id}-${clip})" class="skin400-moving ${cls}"><image href="${skin.image}" width="1024" height="1536"/></g>`;
 let effects=particles(skin);
 if(['forest','town'].includes(skin.id))effects+=layer('leavesL','skin400-leaves left')+layer('leavesR','skin400-leaves right')+`<g clip-path="url(#${id}-water)" class="skin400-moving skin400-water" fill="none" stroke="#c7f9ee" stroke-width="2" opacity=".25">${[0,1,2,3,4,5].map(i=>path(`M${430-i*8} ${625+i*33} q50 -7 115 0 m-90 13 q28 -4 65 1`)).join('')}</g>`;
 if(skin.id==='invasion')effects+=[[235,638],[776,640]].map(([x,y],i)=>`<g class="skin400-moving skin400-flame" style="--delay:-${i*.4}s">${path(`M${x-9} ${y} Q${x-18} ${y-18} ${x+1} ${y-39} Q${x-1} ${y-21} ${x+11} ${y-15} Q${x+15} ${y-3} ${x+4} ${y+1}Z`,'fill="#f3b768" opacity=".7"')}${path(`M${x-3} ${y-2} Q${x-5} ${y-12} ${x+3} ${y-20} L${x+6} ${y-1}Z`,'fill="#ffe1a1" opacity=".8"')}</g>`).join('');
 if(['abyss','sanctum'].includes(skin.id))effects+=`<g class="skin400-moving skin400-mist" opacity="${skin.id==='sanctum'?.22:.18}"><ellipse cx="525" cy="${skin.id==='sanctum'?598:730}" rx="490" ry="88" fill="url(#${id}-mist)"/><ellipse cx="240" cy="${skin.id==='sanctum'?687:850}" rx="280" ry="38" fill="url(#${id}-mist)"/></g>`;
 if(skin.id==='sanctum')effects+=layer('bannerL','skin400-banner left')+layer('bannerR','skin400-banner right');
 if(skin.id==='core')effects+=`<g class="skin400-moving skin400-orbit" fill="none" stroke="#a0e5e2" stroke-width="1.5" opacity=".3"><circle cx="512" cy="315" r="165" stroke-dasharray="2 31"/><path d="M512 148 l4 4 -4 4 -4 -4Z M675 312 l4 4 -4 4 -4 -4Z" fill="#d8eacb"/></g><g class="skin400-moving skin400-core-pulse" opacity=".3"><circle cx="512" cy="315" r="9" fill="#bdeaf0"/><path d="M503 315h18 M512 306v18" stroke="#fff4cd" stroke-width="2"/></g>`;
 return `<svg class="home-skin-scene400 skin400-${skin.id}" data-home-skin-scene400="" data-motion400="${motion?'on':'off'}" viewBox="0 0 1024 1536" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
 <defs>
 <clipPath id="${id}-leavesL"><path d="M0 130H235L310 280 222 390 296 500 208 654 0 742Z"/></clipPath>
 <clipPath id="${id}-leavesR"><path d="M1024 110H820L770 244 829 372 755 505 849 615 1024 688Z"/></clipPath>
 <clipPath id="${id}-water"><path d="M451 550H498L509 623 562 644 549 691 424 701 454 655 468 626Z M492 749H552L616 807 619 841 438 842 458 802 522 783Z"/></clipPath>
 <clipPath id="${id}-bannerL"><path d="M156 61H243V412L204 487 165 418Z"/></clipPath>
 <clipPath id="${id}-bannerR"><path d="M791 60H864V413L826 488 794 419Z"/></clipPath>
 <radialGradient id="${id}-mist"><stop stop-color="${skin.id==='sanctum'?'#f5f4dc':'#a8a0c4'}" stop-opacity=".85"/><stop offset="1" stop-color="${skin.id==='sanctum'?'#f5f4dc':'#a8a0c4'}" stop-opacity="0"/></radialGradient>
 </defs>
 <image class="skin400-base" href="${skin.image}" width="1024" height="1536" onerror="this.removeAttribute('onerror');this.setAttribute('href','./assets/ui/home-town-bg.png');this.closest('svg').classList.add('skin400-image-failed')"/>
 ${effects}</svg>`;
}
export function homeEnvironment400(state){
 return homeSkinState400(state).skin.id==='town'?legacyMotion:homeSkinScene400(state);
}
export function homeSkinSettings400(state){
 const {skin,motion,unlocked}=homeSkinState400(state);if(!unlocked)return '';
 return `<section class="home-skin-settings400" data-home-skin-settings400 aria-labelledby="homeSkinTitle400" data-motion400="${motion?'on':'off'}">
 <header><small>第二章 解放記念</small><h3 id="homeSkinTitle400">ホームの風景</h3><p>新しい風景5種類が解放されました。選ぶと保存され、ホームに反映されます。</p></header>
 <div class="home-skin-preview400"><div class="home-skin-preview-art400">${homeSkinScene400(state,'preview')}</div><div><small>選択中</small><h4>${skin.name}</h4><p>${skin.description}</p><span>${skin.motion}</span></div></div>
 <div class="home-skin-grid400" role="group" aria-label="ホームスキンを選ぶ">
 ${HOME_SKINS400.map(s=>`<button type="button" data-select-home-skin400="${s.id}" aria-pressed="${s.id===skin.id}" class="home-skin-choice400${s.id===skin.id?' is-selected':''}"><img src="${s.thumbnail}" alt="" width="1024" height="1536" loading="lazy" decoding="async"><span><b>${s.name}</b><small>${s.id===skin.id?'選択中':s.id==='town'?'いつもの風景':'第二章'}</small></span></button>`).join('')}
 </div><div class="home-skin-motion-row400"><span><b>環境モーション</b><small>風景に合わせた動き。端末の「視差効果を減らす」がONのときは静止します。</small></span><button type="button" data-toggle-home-motion400 aria-pressed="${motion}">${motion?'ON':'OFF'}</button></div>
 <p class="home-skin-status400" data-home-skin-status400 role="status" aria-live="polite"></p>
 </section>`;
}

export function bindHomeSkinSettings400(root,save){
 const panel=root?.querySelector('[data-home-skin-settings400]');if(!panel)return;
 let busy=false;
 panel.addEventListener('click',async event=>{
  const button=event.target.closest('[data-select-home-skin400],[data-toggle-home-motion400]');
  if(!button||!panel.contains(button)||busy)return;
  busy=true;panel.setAttribute('aria-busy','true');
  const isSkin=button.hasAttribute('data-select-home-skin400'),id=button.dataset.selectHomeSkin400;
  panel.querySelectorAll('button').forEach(b=>b.disabled=true);
  const change=isSkin?{id}:{motion:!homeSkinState400(save.state).motion};
  const result=await commitHomeSkin400(save,change);
  if(!panel.isConnected)return;
  if(result.ok){
   panel.outerHTML=homeSkinSettings400(save.state);bindHomeSkinSettings400(root,save);
   const next=root.querySelector('[data-home-skin-settings400]');
   next.querySelector(isSkin?`[data-select-home-skin400="${id}"]`:'[data-toggle-home-motion400]')?.focus({preventScroll:true});
   next.querySelector('[data-home-skin-status400]').textContent=result.message;
   mountHomeEnvironment400(next);
  }else{
   busy=false;panel.removeAttribute('aria-busy');panel.querySelectorAll('button').forEach(b=>b.disabled=false);
   panel.querySelector('[data-home-skin-status400]').textContent=result.message;
  }
 });
 mountHomeEnvironment400(panel);
}

let disposeEnvironment400=null;
// CSS owns motion; no RAF/timer loop or extra sound source is created.
export function mountHomeEnvironment400(root,doc=globalThis.document){
 disposeEnvironment400?.();disposeEnvironment400=null;if(!root||!doc)return;
 const update=()=>{if(root.isConnected)root.dataset.environmentPaused400=doc.hidden?'true':'false';};
 update();doc.addEventListener('visibilitychange',update);
 disposeEnvironment400=()=>doc.removeEventListener('visibilitychange',update);
}
