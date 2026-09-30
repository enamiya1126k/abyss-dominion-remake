// Local presentation only: reveal server-provided cards, never predict a draw.
export function stopChest574(u){
 for(const a of u?.chestAnimations574??[])a.cancel();
 if(u){u.chestAnimations574=[];u.chestOverlay574?.remove();u.chestOverlay574=null;}
}
export function chestBeat574(previous,g){
 const key=g.id+':'+g.round;
 return {key,phase:g.phase,box:g.ownBox,
  select:g.phase==='chest'&&Number.isInteger(g.ownBox)&&previous?.key===key&&previous.phase==='chest'&&previous.box!==g.ownBox,
  open:g.phase==='hand'&&g.hand?.length===4&&previous?.key===key&&previous.phase==='chest'};
}
export function paintChest574(c,g){
 const u=c.lkUI511,n=u?.nodes;if(!n)return;
 const beat=chestBeat574(u.chestState574,g);u.chestState574=beat;
 if(!['chest','hand'].includes(g.phase))stopChest574(u);
 if(u.reduced||!n.stage?.ownerDocument||typeof n.stage.animate!=='function')return;
 const animate=(el,frames,options)=>{const a=el.animate(frames,options);(u.chestAnimations574??=[]).push(a);a.finished.then(()=>{u.chestAnimations574=u.chestAnimations574.filter(x=>x!==a)},()=>{});return a;};
 if(beat.select){stopChest574(u);const box=n.chestButtons[g.ownBox];if(box)animate(box,[{transform:'scale(1)'},{transform:'scale(1.08)',filter:'brightness(1.3)'},{transform:'scale(1)'}],{duration:240,easing:'ease-out'});}
 if(!beat.open)return;
 stopChest574(u);
 const doc=n.stage.ownerDocument,overlay=doc.createElement('div');overlay.className='lk-opening574';overlay.setAttribute('aria-hidden','true');
 const shell=doc.createElement('div');shell.className='lk-open-chest574';
 for(const part of ['base','lid']){const piece=doc.createElement('i');piece.className='lk-art507 lk-chest-'+part+'574';piece.dataset.tile='0';shell.append(piece);}
 const glow=doc.createElement('div');glow.className='lk-chest-glow574';overlay.append(glow,shell);
 for(let i=0;i<4;i++){const icon=n.handButtons[i]?.querySelector('.lk-art508')?.cloneNode(true);if(!icon)continue;const card=doc.createElement('div');card.className='lk-loot574';card.append(icon);overlay.append(card);animate(card,[{transform:'translate(-50%,20px) scale(.25)',opacity:0,offset:0},{transform:'translate(-50%,20px) scale(.25)',opacity:0,offset:.2},{transform:`translate(calc(-50% + ${(i-1.5)*65}px),-48px) scale(1)`,opacity:1,offset:.65},{transform:`translate(calc(-50% + ${(i-1.5)*78}px),35px) scale(.7)`,opacity:0}],{duration:700,delay:i*30,easing:'ease-out',fill:'both'});
 const hand=n.handButtons[i];animate(hand,[{transform:'translateY(18px) scale(.94)',opacity:.35},{transform:'translateY(0) scale(1)',opacity:1}],{duration:340,delay:180+i*55,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'});}
 n.stage.append(overlay);u.chestOverlay574=overlay;
 animate(shell.querySelector('.lk-chest-lid574'),[{transform:'translateY(0) rotate(0)'},{transform:'translateY(-28px) rotate(-16deg)',offset:.45},{transform:'translateY(-35px) rotate(-20deg)'}],{duration:520,easing:'ease-out',fill:'forwards'});
 animate(glow,[{transform:'translate(-50%,-50%) scale(.3)',opacity:0},{transform:'translate(-50%,-50%) scale(1)',opacity:.75,offset:.4},{transform:'translate(-50%,-50%) scale(1.25)',opacity:0}],{duration:700});
 const end=animate(overlay,[{opacity:1,offset:0},{opacity:1,offset:.7},{opacity:0}],{duration:820,easing:'ease-out'});end.finished.then(()=>{overlay.remove();if(u.chestOverlay574===overlay)u.chestOverlay574=null},()=>{});
}
