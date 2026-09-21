import{progress492,SPECIES492}from'./Rules492.js';
export const colors492=['#ffd371','#75dbff','#b5ef82','#ffaad4'];
export function point492(lane,r,side=0){return lane===0?{x:50+side,y:50-r}:lane===1?{x:50+r,y:50+side}:lane===2?{x:50+side,y:50+r}:{x:50-r,y:50+side}}
// Six visual slots per waterway. Bunching spreads into two columns instead of hiding targets.
export function layout492(enemies,at){const out=[];for(let lane=0;lane<4;lane++){
 const group=enemies.filter(e=>e.lane===lane).sort((a,b)=>progress492(b,at)-progress492(a,at)||a.id-b.id),columns=[[],[]];
 for(const [i,e]of group.entries()){const col=Number.isInteger(e.visualSlot493)?e.visualSlot493%2:i%2,prog=progress492(e,at),prev=columns[col].at(-1)?.r??5;columns[col].push({e,prog,r:Math.max(18,47-29*prog,prev+12)})}
 for(const [col,list]of columns.entries()){const shift=Math.max(0,(list.at(-1)?.r??0)-45);for(const {e,prog,r}of list)out.push({...e,...point492(lane,r-shift,Number.isInteger(e.visualSlot493)||group.length>1?(col?7.5:-7.5):0),progress:prog})}
 }return out}

export function imageCell492(ctx,img,index,x,y,size){if(!img?.complete||!img.naturalWidth)return false;const w=img.naturalWidth/2,h=img.naturalHeight/2;ctx.drawImage(img,index%2*w,Math.floor(index/2)*h,w,h,x-size/2,y-size/2,size,size);return true}
function badge(ctx,text,x,y,color='#183e37',size=13){ctx.font=`900 ${size}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';const w=ctx.measureText(text).width+12;ctx.fillStyle=color;ctx.beginPath();if(ctx.roundRect){ctx.roundRect(x-w/2,y-size*.8,w,size*1.6,size*.35);ctx.fill()}else ctx.fillRect(x-w/2,y-size*.8,w,size*1.6);ctx.fillStyle='#fff6d2';ctx.fillText(text,x,y)}
export function draw492(canvas,g,u,at,now,seat,frameLayout){
 const ctx=canvas?.getContext('2d');if(!ctx)return;const size=canvas.clientWidth;if(!size)return;const dpr=Math.min(globalThis.devicePixelRatio??1,2);if(canvas.width!==Math.round(size*dpr))canvas.width=canvas.height=Math.round(size*dpr);
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,size,size);const px=n=>n*size/100,layout=frameLayout??layout492(g.enemies,at),selected=u.lane??seat??0;
 // Highlight a whole waterway, joining the button, target and protected house.
 for(let lane=0;lane<4;lane++){const a=point492(lane,46),b=point492(lane,17);ctx.strokeStyle=colors492[lane]+(lane===selected?'55':'18');ctx.lineWidth=px(lane===selected?17:12);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(px(a.x),px(a.y));ctx.lineTo(px(b.x),px(b.y));ctx.stroke();
  // Short current chevrons point towards the house, even when the lane is empty.
  for(let j=0;j<2;j++){const v=point492(lane,29+j*12),angle=lane*Math.PI/2;ctx.save();ctx.translate(px(v.x),px(v.y));ctx.rotate(angle);ctx.strokeStyle=lane===seat?'#fff6baaa':'#e1fffa66';ctx.lineWidth=px(.45);ctx.beginPath();ctx.moveTo(-px(1.5),-px(1));ctx.lineTo(0,px(.7));ctx.lineTo(px(1.5),-px(1));ctx.stroke();ctx.restore()}
  const danger=layout.some(e=>e.lane===lane&&e.progress>.73);if(danger){ctx.strokeStyle='#ff8e6477';ctx.lineWidth=px(2);ctx.beginPath();ctx.moveTo(px(a.x),px(a.y));ctx.lineTo(px(b.x),px(b.y));ctx.stroke()}
 }
 ctx.strokeStyle=g.hp<35?'#ff794e':'#ffedb3';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px(50),px(45),px(12),0,Math.PI*2);ctx.stroke();badge(ctx,'守る家',px(50),px(57),'#2c493cee',Math.max(9,px(3)));
 for(const e of layout){const x=px(e.x),y=px(e.y),s=px(e.kind===3?18:15.5);ctx.save();ctx.translate(x,y);if(!u.reduced)ctx.translate(0,Math.sin(now/240+e.id)*1.5);ctx.fillStyle='#073c4855';ctx.beginPath();ctx.ellipse(0,s*.28,s*.38,s*.12,0,0,Math.PI*2);ctx.fill();
  if(!imageCell492(ctx,u.atlas,e.kind,0,0,s)){ctx.fillStyle=['#e95635','#81aa4c','#697c52','#b05cba'][e.kind];ctx.beginPath();ctx.arc(0,0,s*.35,0,Math.PI*2);ctx.fill();badge(ctx,SPECIES492[e.kind].short,0,0,'#183e37',10)}
  if(e.maxHp>1)badge(ctx,String(e.hp),s*.32,-s*.24,e.kind===3?'#70417ef0':'#163f3cf0',Math.max(11,px(3.1)));
  if(e.progress>.73){ctx.strokeStyle='#ff714b';ctx.lineWidth=px(.7);ctx.beginPath();ctx.ellipse(0,s*.3,s*.46,s*.15,0,0,Math.PI*2);ctx.stroke()}
  ctx.restore();
 }
 const strokes=[...g.players.map(p=>p.lastAction?{...p.lastAction,age:at-p.lastAction.at}:null).filter(a=>a&&!(u.preview&&a.enemyId===u.preview.enemyId&&now-u.preview.at<380)),...(u.preview?[{...u.preview,age:now-u.preview.at}]:[])];
 for(const a of strokes){if(a.age<0||a.age>380||a.burst)continue;const e=layout.find(e=>e.id===a.enemyId),v=e??a.point??point492(a.lane,47-29*(a.progress??.5));ctx.save();ctx.globalAlpha=1-a.age/400;if(!imageCell492(ctx,u.props,0,px(v.x),px(v.y)-(!u.reduced?a.age/55:0),px(23))){ctx.strokeStyle='#fff8c1';ctx.lineWidth=4;ctx.beginPath();ctx.arc(px(v.x),px(v.y),px(8),0,Math.PI*2);ctx.stroke()}ctx.restore()}
 for(const e of u.effects??[]){const age=now-e.localAt;if(age<0||age>1100)continue;const t=age/1100,v=e.point??point492(e.lane,47-29*(e.progress??.7));ctx.save();ctx.globalAlpha=1-t;
  if(e.kind==='catch'){const y=px(v.y)-(u.reduced?0:t*35);imageCell492(ctx,u.atlas,e.kindIndex,px(v.x),y,px(12)*(1-t*.35));badge(ctx,e.mega?'大網で捕獲！':e.teamwork?'連携 ＋2':e.assist?'援護 ＋1':'捕獲 ＋1',px(v.x),y-px(8),e.teamwork?'#886225':'#143f37',Math.max(10,px(3.5)))}
  else if(e.kind==='hit')badge(ctx,'あと'+e.hp+'回',px(v.x),px(v.y)-px(9),'#725134',11);
  else if(e.kind==='mega'){imageCell492(ctx,u.props,3,px(50),px(50),size*(u.reduced?.9:.4+t));for(let lane=0;lane<4;lane++){const v=point492(lane,27);imageCell492(ctx,u.props,0,px(v.x),px(v.y),px(30))}badge(ctx,'みんなの大網！',px(50),px(48),'#8c6829',Math.max(16,px(5)))}
  else if(e.kind==='breach')badge(ctx,'家 −'+e.damage,px(50),px(50),'#973f2d',16);
  ctx.restore();
 }
 u.effects=(u.effects??[]).filter(e=>now-e.localAt<1100);
 return layout;
}
