// Retain the connected scroll surface across battle updates, including swipes.
export function mountBattleScreen(app,markup){
 const template=app.ownerDocument.createElement('template');template.innerHTML=markup;
 const next=template.content.firstElementChild,old=app.querySelector('.battle-screen');
 const strip=old?.querySelector('.turn-order'),nextStrip=next.querySelector('.turn-order');
 if(!old||!strip||!nextStrip){old?.remove();app.append(next);return next}
 const left=strip.scrollLeft;
 for(const attr of [...old.attributes])old.removeAttribute(attr.name);
 for(const attr of [...next.attributes])old.setAttribute(attr.name,attr.value);
 for(const child of [...old.childNodes])if(child!==strip)child.remove();
 strip.innerHTML=nextStrip.innerHTML;
 let after=false;
 for(const child of [...next.childNodes]){
  if(child===nextStrip){after=true;continue}
  if(after)old.append(child);else old.insertBefore(child,strip);
 }
 strip.scrollLeft=left;
 return old;
}
