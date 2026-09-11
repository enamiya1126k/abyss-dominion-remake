// Decorative motion has no frame loop. CSS animates a bounded scene; this
// controller only responds to visibility, navigation and preference changes.
export function homeMotionQuality407(view=globalThis.window){
 const nav=view?.navigator;
 return nav?.connection?.saveData||Number(nav?.deviceMemory)>0&&nav.deviceMemory<=4||Number(nav?.hardwareConcurrency)>0&&nav.hardwareConcurrency<=4?'light':'full';
}

export function mountHomeMotion407(root,doc=globalThis.document){
 if(!root||!doc)return()=>{};
 const view=doc.defaultView??globalThis.window,scene=root.querySelector?.('[data-home-skin-scene400]');
 const isHome=root.matches?.('.home-command-screen')??false;
 const app=root.closest?.('#app'),observers=[],cleanups=[];
 const reduced=view?.matchMedia?.('(prefers-reduced-motion: reduce)');
 let inView=true,pageAway=false,disposed=false;
 const update=()=>{
  if(disposed||!root.isConnected)return;
  const covered=isHome&&Boolean(app?.querySelector?.('.game-modal'));
  root.dataset.environmentPaused400=String(Boolean(doc.hidden||pageAway||!inView||covered||reduced?.matches));
  root.dataset.homeMotionQuality407=homeMotionQuality407(view);
 };
 const listen=(target,event,fn)=>{
  if(!target?.addEventListener)return;
  target.addEventListener(event,fn);cleanups.push(()=>target.removeEventListener(event,fn));
 };
 listen(doc,'visibilitychange',update);
 listen(view,'pagehide',()=>{pageAway=true;update();});
 listen(view,'pageshow',()=>{pageAway=false;update();});
 listen(reduced,'change',update);
 listen(view?.navigator?.connection,'change',update);
 if(view?.IntersectionObserver){
  const observer=new view.IntersectionObserver(entries=>{
   const entry=entries.find(e=>e.target===(scene??root));
   if(entry){inView=entry.isIntersecting;update();}
  },{threshold:0});
  observer.observe(scene??root);observers.push(observer);
 }
 if(isHome&&app&&view?.MutationObserver){
  // Shared modals are appended/removed directly under #app. Ignore animated
  // attributes and inner character updates, which would cause needless work.
  const observer=new view.MutationObserver(update);observer.observe(app,{childList:true});observers.push(observer);
 }
 update();
 return()=>{
  if(disposed)return;disposed=true;
  cleanups.forEach(dispose=>dispose());observers.forEach(observer=>observer.disconnect());
 };
}
