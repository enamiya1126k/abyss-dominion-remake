export function updateHeroTracker(stage,model,actions){
 let hud=stage.querySelector('.hero-tracker341');
 if(!model){hud?.remove();stage.querySelector('.hero-direction341')?.remove();return}
 if(!hud){
  hud=document.createElement('div');hud.className='hero-tracker341';
  hud.innerHTML='<button type="button" class="hero-tracker-summary341" data-hero-fold><span data-hero-portrait></span><span class="hero-tracker-copy341"><b data-hero-name></b><small data-hero-status></small></span><span class="hero-tracker-count341" data-hero-count></span></button><button type="button" class="hero-tracker-locate341" data-hero-locate aria-label="勇者の位置を見る"></button><button type="button" class="hero-tracker-fight341" data-hero-fight>迎え撃つ</button>';
  stage.append(hud);hud.addEventListener('pointerdown',e=>e.stopPropagation());
  hud.querySelector('[data-hero-fold]').onclick=e=>{e.stopPropagation();actions.toggle()};
  hud.querySelector('[data-hero-locate]').onclick=e=>{e.stopPropagation();actions.locate()};
  hud.querySelector('[data-hero-fight]').onclick=e=>{e.stopPropagation();actions.fight()};
 }
 hud.style.top=`${model.top}px`;hud.classList.toggle('is-collapsed',model.collapsed);
 hud.querySelector('[data-hero-fold]').setAttribute('aria-expanded',String(!model.collapsed));
 hud.querySelector('[data-hero-fold]').setAttribute('aria-label',`${model.name}・${model.status}・追跡${model.steps}/500歩・${model.collapsed?'通常表示へ':'簡易表示へ'}`);
 if(hud.dataset.hero!==model.heroId){hud.querySelector('[data-hero-portrait]').innerHTML=model.portrait;hud.dataset.hero=model.heroId}
 hud.querySelector('[data-hero-name]').textContent=model.name;
 hud.querySelector('[data-hero-status]').textContent=model.status;
 hud.querySelector('[data-hero-count]').textContent=`${model.steps}/500`;
 hud.querySelector('[data-hero-locate]').textContent=model.arrow;
 hud.querySelector('[data-hero-fight]').disabled=model.busy;
 let indicator=stage.querySelector('.hero-direction341');
 if(model.inside||model.arriving){indicator?.remove();return}
 if(!indicator){indicator=document.createElement('button');indicator.type='button';indicator.className='hero-direction341';indicator.onclick=e=>{e.stopPropagation();actions.locate()};indicator.addEventListener('pointerdown',e=>e.stopPropagation());stage.append(indicator)}
 indicator.style.left=`${model.x}px`;indicator.style.top=`${model.y}px`;indicator.textContent=model.arrow;indicator.setAttribute('aria-label',`${model.name}はこの方向・タップで位置を見る`);
}
