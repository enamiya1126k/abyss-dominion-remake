// Retain the connected scroll surface across battle updates, including swipes.
export function mountBattleScreen(app,markup){
 const template=app.ownerDocument.createElement('template');template.innerHTML=markup;
 const next=template.content.firstElementChild,old=app.querySelector('.battle-screen');
 const strip=old?.querySelector('.turn-order'),nextStrip=next.querySelector('.turn-order');
 if(!old||!strip||!nextStrip){old?.remove();app.append(next);return next}
 const resonance=old.querySelector('.battle-resonance405'),nextResonance=next.querySelector('.battle-resonance405');
 const retained=new Map([[nextStrip,strip]]);
 if(resonance&&nextResonance)retained.set(nextResonance,resonance);
 const offsets=new Map([...retained.values()].map(node=>[node,node.scrollLeft]));
 for(const attr of [...old.attributes])old.removeAttribute(attr.name);
 for(const attr of [...next.attributes])old.setAttribute(attr.name,attr.value);
 for(const child of [...old.childNodes])if(!offsets.has(child))child.remove();
 for(const [fresh,node] of retained)node.innerHTML=fresh.innerHTML;
 let cursor=old.firstChild;
 for(const child of [...next.childNodes]){
  const node=retained.get(child)??child;
  if(node===cursor)cursor=cursor.nextSibling;
  else old.insertBefore(node,cursor);
 }
 for(const [node,left] of offsets)node.scrollLeft=left;
 return old;
}
