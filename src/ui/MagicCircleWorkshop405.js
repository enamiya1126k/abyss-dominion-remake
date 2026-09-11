import {buyOrUpgradeMagicCircle,equipMagicCircle} from '../core/MagicCircleSystem.js?v=3.1.78-build398';
import {claimCircleResearch398} from '../chapterTwo/MagicCircleResearch398.js?v=3.1.78-build398';

// One tap commits one purchase. A failed save restores both the level and GOLD.
export function commitCircleAction405(save,action){
 const before=structuredClone(save.state);
 try{
  const result=action(save.state);
  if(!result.ok){save.state=before;return result;}
  if(save.save()===false)throw new Error('save failed');
  return result;
 }catch{
  save.state=before;
  return {ok:false,message:'保存できませんでした。変更を戻しました。もう一度お試しください。'};
 }
}

// Refresh only the changing labels and prices. The scrollport, focus and
// pressed button keep their identity, including during consecutive touch taps.
export function refreshCircleWorkshop405(modal,markup,anchor=null){
 const list=modal.querySelector('.magic-circle-list');
 const scrollTop=list.scrollTop,anchorTop=anchor?.getBoundingClientRect().top;
 const template=modal.ownerDocument.createElement('template');template.innerHTML=markup;
 const next=template.content;
 for(const selector of ['.workshop-circle','.magic-circle-workshop > header h3','.magic-circle-workshop > header p','.magic-circle-workshop > header strong']){
  const old=modal.querySelector(selector),fresh=next.querySelector(selector);
  if(!old||!fresh)continue;
  if(selector==='.workshop-circle'){
   old.className=fresh.className;
   for(const attr of ['data-circle-id','data-circle-level'])old.setAttribute(attr,fresh.getAttribute(attr));
   if(old.innerHTML!==fresh.innerHTML)old.innerHTML=fresh.innerHTML;
  }else if(old.textContent!==fresh.textContent)old.textContent=fresh.textContent;
 }
 if(!next.querySelector('[data-circle-research398]'))modal.querySelector('.circle-research398')?.remove();
 const rows=new Map([...list.querySelectorAll('[data-circle-row405]')].map(row=>[row.dataset.circleRow405,row]));
 for(const fresh of next.querySelectorAll('[data-circle-row405]')){
  const old=rows.get(fresh.dataset.circleRow405);if(!old)continue;
  old.className=fresh.className;
  const copy=old.querySelector('.circle-copy405'),newCopy=fresh.querySelector('.circle-copy405');
  if(copy.innerHTML!==newCopy.innerHTML)copy.innerHTML=newCopy.innerHTML;
  for(const attr of ['data-circle-equip','data-circle-buy']){
   const button=old.querySelector(`[${attr}]`),newButton=fresh.querySelector(`[${attr}]`);
   if(button&&newButton){button.disabled=newButton.disabled;button.textContent=newButton.textContent;}
   else if(newButton)old.querySelector('.circle-actions405').append(newButton);
   else button?.remove();
  }
 }
 // Compensate for a changed description/header height, not just scrollTop.
 // On a short list the browser naturally clamps at the real end of the list.
 list.scrollTop=scrollTop;
 if(Number.isFinite(anchorTop)&&anchor?.isConnected)list.scrollTop+=anchor.getBoundingClientRect().top-anchorTop;
}

export function bindMagicCircleWorkshop405(modal,{save,monsterId,renderBody,onClose,onFailure}){
 let busy=false;
 modal._onDismiss=onClose;
 modal.querySelector('[data-modal-primary]').onclick=onClose;
 modal.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-circle-buy],[data-circle-equip],[data-circle-research398]');
  if(!button||!modal.contains(button)||button.disabled||busy)return;
  busy=true;
  try{
   const isBuy=button.hasAttribute('data-circle-buy'),isEquip=button.hasAttribute('data-circle-equip');
   const result=commitCircleAction405(save,state=>isBuy?buyOrUpgradeMagicCircle(state,button.dataset.circleBuy):isEquip?equipMagicCircle(state,state.monsters.find(m=>m.id===monsterId),button.dataset.circleEquip):claimCircleResearch398(state));
   refreshCircleWorkshop405(modal,renderBody(),isBuy||isEquip?button:null);
   const message=result.ok?(isBuy?`${result.circle.name} Lv.${result.level}に強化（−${result.price.toLocaleString()}G）`:isEquip?`${result.circle.name}を装着`:'新しい魔法陣3個を受け取りました！'):result.message;
   const feedback=modal.querySelector('.circle-feedback405');if(feedback){feedback.textContent=message;feedback.title=message;}
   if(!result.ok)onFailure?.(message);
  }finally{busy=false;}
 });
}
