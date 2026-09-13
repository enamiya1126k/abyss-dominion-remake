// Same small, exact-number treatment as the chapter battle cards. Fitting is
// repeated after shared HP updates and viewport changes; no values are shortened.
export function fitRaidVitals437(root){
 if(!root?.closest?.('.world-raid432.is-battle432')&&!root?.matches?.('.world-raid432.is-battle432'))return;
 for(const label of root.querySelectorAll('.side-unit-card .bar-label')){
  const width=label.clientWidth;if(!width)continue;
  let size=label.closest('.raid-main-boss')?8:7;
  label.style.setProperty('font-size',size+'px','important');
  // A Range measures the text, even when the gauge intentionally clips fills.
  const range=label.ownerDocument.createRange();range.selectNodeContents(label);
  const textWidth=range.getBoundingClientRect().width;
  if(textWidth>width-2)size=Math.max(4,Math.floor(size*(width-2)/textWidth*10)/10);
  label.style.setProperty('font-size',size+'px','important');label.title=label.textContent;
 }
}
