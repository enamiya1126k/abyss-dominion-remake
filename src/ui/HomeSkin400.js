import {mountHomeMotion407} from './HomeMotion407.js?v=3.1.87-build407';
import {HOME_SKINS400,homeSkinState400,commitHomeSkin400,homeSkinAvailable424,MOTHER_HOME_SKIN424} from '../core/HomeSkinSystem400.js?v=3.1.87-build407';

const legacyMotion=`<div class="home-environment-motion" aria-hidden="true">
 <i class="home-moving-sky sky-left"></i><i class="home-moving-sky sky-right"></i>
 <i class="home-moving-foliage foliage-left"></i><i class="home-moving-foliage foliage-right"></i>
 <i class="home-river-shimmer river-frame-1"></i><i class="home-river-shimmer river-frame-2"></i><i class="home-river-shimmer river-frame-3"></i>
</div>`;
const particlePositions407=[[354,525],[605,595],[730,405],[470,438],[846,703],[282,700],[692,770],[548,868],[806,305],[408,348],[175,492],[912,530],[628,255],[328,835],[767,635],[210,920],[877,856],[504,724]];
function particles407(skin){
 const ember=skin.id==='invasion',color=skin.color;
 return particlePositions407.map(([px,py],i)=>{
  const x=ember?[237,775][i%2]+(i%3-1)*13:px,y=ember?624+(i%4)*9:py;
  const duration=ember?3.6+i%4*.7:5.2+i%5*.8,dx=ember?(i%2?100:-100):(i%2?92:-78),dy=ember?-(260+i%4*75):-(100+i%4*32);
  return `<g class="skin400-moving skin407-particle ${ember?'skin407-ember':''}" ${i>=12?'data-motion-detail407':''} style="--delay:-${(i*.71).toFixed(2)}s;--duration:${duration}s;--dx:${dx}px;--dy:${dy}px"><circle cx="${x}" cy="${y}" r="${ember?9:12}" fill="${color}" opacity=".12"/><rect x="${x-2}" y="${y-2}" width="${ember?4:5}" height="${ember?12:5}" fill="${color}"/><rect x="${x-1}" y="${y-1}" width="2" height="3" fill="#fff8d4"/></g>`;
 }).join('');
}
export function homeSkinScene400(state,context='home'){
 const {skin,motion}=homeSkinState400(state),id=`skin400-${context==='preview'?'preview':'home'}-${skin.id}`;
 const crop=(clip,cls)=>`<g clip-path="url(#${id}-${clip})"><g class="skin400-moving ${cls}"><image href="${skin.image}" width="1024" height="1536"/></g></g>`;
 const haze=(y,cloud=false)=>`<g class="skin400-moving skin407-haze ${cloud?'skin407-cloud':'skin407-fog'}"><ellipse cx="280" cy="${y}" rx="420" ry="${cloud?110:70}" fill="url(#${id}-mist)"/><ellipse cx="800" cy="${y+65}" rx="350" ry="55" fill="url(#${id}-mist)"/></g><g class="skin400-moving skin407-haze skin407-haze-back" data-motion-detail407><ellipse cx="750" cy="${y-90}" rx="380" ry="75" fill="url(#${id}-mist)"/></g>`;
 let effects=skin.id==='town'?'':particles407(skin);
 if(['forest','town'].includes(skin.id)){
  effects+=crop('leavesL','skin407-leaves left')+crop('leavesR','skin407-leaves right');
  effects+=`<g clip-path="url(#${id}-water)" fill="none" stroke="#c1fcff"><g class="skin400-moving skin407-waterfall" stroke-width="5" stroke-dasharray="20 18" opacity=".55"><path d="M470 548Q466 592 490 636T520 698 M490 557Q486 606 509 639T550 685"/></g><g class="skin400-moving skin407-ripples" stroke-width="3">${[0,1,2,3,4,5,6].map(i=>`<path d="M${430-i*3} ${754+i*14}q58 -8 133 0m-93 6q33 -3 69 1"/>`).join('')}</g></g>`;
  if(skin.id==='forest')effects+=`<g class="skin400-moving skin407-canopy-light" fill="url(#${id}-light)"><path d="M742 130L818 155 499 837 307 797Z"/><path d="M861 212L883 243 603 858 550 810Z"/></g>`;
 }
 if(skin.id==='invasion'){
  effects+=`<g class="skin400-moving skin407-firelight">${[237,775].map(x=>`<ellipse cx="${x}" cy="605" rx="125" ry="180" fill="url(#${id}-glow)"/>`).join('')}</g>`;
  // Animate the original authored fire pixels, anchored to their own braziers.
  effects+=[237,775].map((x,i)=>`<svg x="${x-22}" y="544" width="44" height="96" viewBox="0 0 44 96" overflow="visible"><g class="skin400-moving skin407-flame" mask="url(#${id}-fire-edge)" style="--delay:-${i*.37}s"><svg width="44" height="96" viewBox="${x-14} 595 28 45" preserveAspectRatio="none"><image href="${skin.image}" width="1024" height="1536"/></svg></g></svg>`).join('');
 }
 if(skin.id==='abyss'){
  effects+=haze(725)+`<g class="skin400-moving skin407-abyss-pulse"><ellipse cx="510" cy="505" rx="200" ry="320" fill="url(#${id}-glow)"/></g><g class="skin400-moving skin407-startrail" data-motion-detail407 fill="url(#${id}-light)"><path d="M670 177l-180 211 4 3 192-205Z"/><path d="M790 360l-120 153 3 2 130-147Z"/></g>`;
 }
 if(skin.id==='sanctum'){
  effects+=haze(620,true)+crop('bannerL','skin407-banner left')+crop('bannerR','skin407-banner right');
  effects+=`<g class="skin400-moving skin407-holy-light" fill="url(#${id}-light)"><path d="M660 150L765 182 540 1000 319 957Z"/></g>`;
 }
 if(skin.id==='core'){
  effects+=`<g class="skin400-moving skin407-core-pulse"><circle cx="512" cy="315" r="178" fill="url(#${id}-glow)"/></g><g class="skin400-moving skin407-orbit" style="transform-origin:512px 315px" fill="none" stroke="#9ae9ef"><circle cx="512" cy="315" r="224" stroke-width="3" stroke-dasharray="78 36 18 120"/><circle cx="512" cy="91" r="7" fill="#fff1ba" stroke-width="0"/><circle cx="512" cy="539" r="5" fill="#c6fcff" stroke-width="0"/></g><g class="skin400-moving skin407-orbit skin407-orbit-inner" style="transform-origin:512px 315px" fill="none" stroke="#e7cd83"><circle cx="512" cy="315" r="164" stroke-width="3" stroke-dasharray="40 48"/><circle cx="676" cy="315" r="7" fill="#fff1ba" stroke-width="0"/></g><g class="skin400-moving skin407-core-stream" stroke="#85dfe7" stroke-width="3" stroke-dasharray="26 65" opacity=".65"><path d="M82 70V855 M166 348V909 M924 410V925"/></g>`;
 }
 return `<svg class="home-skin-scene400 skin400-${skin.id} home-motion407" data-home-skin-scene400="" data-motion400="${motion?'on':'off'}" data-preview407="${context==='preview'}" viewBox="0 0 1024 1536" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
 <defs>
 <clipPath id="${id}-leavesL"><path d="M0 60H235L310 280 222 390 296 500 208 654 0 742Z"/></clipPath>
 <clipPath id="${id}-leavesR"><path d="M1024 50H820L770 244 829 372 755 505 849 615 1024 688Z"/></clipPath>
 <clipPath id="${id}-water"><path d="M451 550H498L509 623 562 644 549 691 424 701 454 655 468 626Z M492 749H552L616 807 619 841 438 842 458 802 522 783Z"/></clipPath>
 <clipPath id="${id}-bannerL"><path d="M160 62H248V412L204 487 166 418Z"/></clipPath>
 <clipPath id="${id}-bannerR"><path d="M780 62H866V413L826 488 788 419Z"/></clipPath>
 <radialGradient id="${id}-fire-mask"><stop offset=".48" stop-color="white"/><stop offset="1" stop-color="black"/></radialGradient><mask id="${id}-fire-edge" maskUnits="userSpaceOnUse" x="0" y="0" width="44" height="96"><rect width="44" height="96" fill="url(#${id}-fire-mask)"/></mask>
 <radialGradient id="${id}-mist"><stop stop-color="${skin.id==='sanctum'?'#fffbe7':'#b8a4ec'}" stop-opacity=".8"/><stop offset=".55" stop-color="${skin.id==='sanctum'?'#f8f3df':'#aa96db'}" stop-opacity=".35"/><stop offset="1" stop-color="${skin.color}" stop-opacity="0"/></radialGradient>
 <radialGradient id="${id}-glow"><stop stop-color="${skin.color}" stop-opacity=".65"/><stop offset="1" stop-color="${skin.color}" stop-opacity="0"/></radialGradient>
 <linearGradient id="${id}-light" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fcf4ca" stop-opacity=".02"/><stop offset=".45" stop-color="${skin.id==='abyss'?'#d1b8ff':'#e8fadb'}" stop-opacity=".38"/><stop offset="1" stop-color="#fdf2ce" stop-opacity="0"/></linearGradient>
 </defs>
 <image class="skin400-base" href="${skin.image}" width="1024" height="1536" onerror="this.removeAttribute('onerror');this.setAttribute('href','./assets/ui/home-town-bg.png');this.closest('svg').classList.add('skin400-image-failed')"/>
 <g class="skin407-effects">${effects}</g></svg>`;
}
export function homeEnvironment400(state){
 return homeSkinState400(state).skin.id==='town'?legacyMotion:homeSkinScene400(state);
}
export function homeSkinSettings400(state){
 const {skin,motion,unlocked}=homeSkinState400(state);if(!unlocked)return '';
 return `<section class="home-skin-settings400" data-home-skin-settings400 aria-labelledby="homeSkinTitle400" data-motion400="${motion?'on':'off'}">
 <header><small>第二章 解放記念</small><h3 id="homeSkinTitle400">ホームの風景</h3><p>風景を選ぶとホームに反映されます。原初の聖胎の限定スキンは、十神の母を初めて倒すと解放されます。</p></header>
 <div class="home-skin-preview400"><div class="home-skin-preview-art400">${homeSkinScene400(state,'preview')}</div><div><small>選択中</small><h4>${skin.name}</h4><p>${skin.description}</p><span>${skin.motion}</span></div></div>
 <div class="home-skin-grid400" role="group" aria-label="ホームスキンを選ぶ">
 ${HOME_SKINS400.map(s=>`<button type="button" data-select-home-skin400="${s.id}" ${homeSkinAvailable424(state,s.id)?'':'disabled'} aria-pressed="${s.id===skin.id}" class="home-skin-choice400${s.id===skin.id?' is-selected':''}"><img src="${s.thumbnail}" alt="" width="1024" height="1536" loading="lazy" decoding="async"><span><b>${s.name}</b><small>${!homeSkinAvailable424(state,s.id)?'十神の母を撃破で解放':s.id===skin.id?'選択中':s.id===MOTHER_HOME_SKIN424?'第二章・最終決戦の証':s.id==='town'?'いつもの風景':'第二章'}</small></span></button>`).join('')}
 </div><div class="home-skin-motion-row400"><span><b>環境モーション</b><small>風景に合わせた動き。端末の「視差効果を減らす」がONのときは静止します。</small></span><button type="button" data-toggle-home-motion400 aria-pressed="${motion}">${motion?'ON':'OFF'}</button></div>
 <p class="home-skin-status400" data-home-skin-status400 role="status" aria-live="polite"></p>
 </section>`;
}

export function bindHomeSkinSettings400(root,save){
 const panel=root?.querySelector('[data-home-skin-settings400]');if(!panel)return;
 let busy=false;
 panel.addEventListener('click',async event=>{
  const button=event.target.closest('[data-select-home-skin400],[data-toggle-home-motion400]');
  if(!button||button.disabled||!panel.contains(button)||busy)return;
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
   busy=false;panel.removeAttribute('aria-busy');panel.querySelectorAll('button').forEach(b=>b.disabled=b.dataset.selectHomeSkin400?!homeSkinAvailable424(save.state,b.dataset.selectHomeSkin400):false);
   panel.querySelector('[data-home-skin-status400]').textContent=result.message;
  }
 });
 mountHomeEnvironment400(panel);
}

let disposeEnvironment400=null;
export function mountHomeEnvironment400(root,doc=globalThis.document){
 disposeEnvironment400?.();disposeEnvironment400=mountHomeMotion407(root,doc);
}
