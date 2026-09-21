import{progress494,SPECIES494}from'./Rules494.js';
import{imageCell492}from'./Scene492.js';
export const laneNames494=['北','東','南','西'];
export const remaining494=(e,at)=>Math.max(0,e.spawnAt+e.travelMs-at);
export function pressure494(g,lane,at){const list=g.enemies.filter(e=>e.lane===lane),eta=list.length?Math.min(...list.map(e=>remaining494(e,at))):Infinity;return{count:list.length,eta,danger:eta<3000,urgent:eta<1600}}
export function layout494(enemies,lane,at,width,height){
 const size=Math.max(56,Math.min(110,width*.245,height*.20));
 const columns=[[],[]];for(const e of enemies.filter(e=>e.lane===lane)){const col=(e.visualSlot493??e.id)%2;columns[col].push({...e,progress:progress494(e,at)})}
 const result=[];for(let col=0;col<2;col++){
  const items=columns[col].sort((a,b)=>b.progress-a.progress||a.id-b.id);let last=Infinity;
  for(const [i,e]of items.entries()){const gap=Math.min(size*.87,height*.23),min=height*.14;const y=Math.max(min+(items.length-1-i)*gap,Math.min(height*(.14+e.progress*.50),last-gap));last=y;result.push({...e,x:(col?.66:.34)*width,y,size,eta:remaining494(e,at)})}
 }return result;
}
const pill=(ctx,x,y,w,h,fill)=>{ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(12,h/2));ctx.fill()};
function text(ctx,value,x,y,size,color='#fff6d0',weight=800){ctx.fillStyle=color;ctx.font=`${weight} ${size}px system-ui,sans-serif`;ctx.textAlign='center';ctx.fillText(value,x,y)}
export function draw494(canvas,g,u,at,now,layout){
 const ctx=canvas?.getContext('2d'),w=canvas?.clientWidth,h=canvas?.clientHeight;if(!ctx||!w||!h)return;
 const dpr=Math.min(globalThis.devicePixelRatio??1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 if(u.background?.complete&&u.background.naturalWidth)ctx.drawImage(u.background,0,0,w,h);else{ctx.fillStyle='#1c9299';ctx.fillRect(0,0,w,h)}
 // Flow direction and house boundary remain readable in every lane.
 const p=pressure494(g,u.lane,at),lineY=h*.70;
 ctx.strokeStyle=p.danger?'#ff8261':'#d8ffe5aa';ctx.lineWidth=p.danger?3:1.5;ctx.setLineDash([8,7]);ctx.beginPath();ctx.moveTo(w*.22,lineY);ctx.lineTo(w*.78,lineY);ctx.stroke();ctx.setLineDash([]);
 if(g.phase==='playing')for(let n=0;n<3;n++){const y=h*(.15+((u.reduced?n/3:now/3600+n/3)%1)*.49);ctx.strokeStyle='#d4ffef55';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*.5-5,y);ctx.lineTo(w*.5,y+5);ctx.lineTo(w*.5+5,y);ctx.stroke()}
 for(const e of layout){const {x,y,size:s}=e;ctx.save();ctx.translate(x,y);ctx.fillStyle='#083d4155';ctx.beginPath();ctx.ellipse(0,s*.32,s*.4,s*.12,0,0,Math.PI*2);ctx.fill();
  if(e.eta<3000){ctx.strokeStyle='#ff7859';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,s*.12,s*.44,s*.35,0,0,Math.PI*2);ctx.stroke()}
  if(u.atlas?.complete&&u.atlas.naturalWidth)imageCell492(ctx,u.atlas,e.kind,0,0,s);else{ctx.fillStyle=['#f96840','#99b740','#a3b66b','#d19eef'][e.kind];ctx.beginPath();ctx.arc(0,0,s*.30,0,Math.PI*2);ctx.fill()}
  pill(ctx,s*.16,-s*.46,s*.42,26,e.eta<3000?'#922b20':'#123e3c');text(ctx,String(e.hp),s*.37,-s*.46+19,17);
  if(e.eta<3000){pill(ctx,-34,s*.40,68,20,'#922b20');text(ctx,'あと'+(e.eta/1000).toFixed(1)+'秒',0,s*.40+14,10)}
  else if(u.teach&&e.id===layout[0]?.id){pill(ctx,-36,s*.37,72,22,'#fff0a9');text(ctx,'タップ！',0,s*.37+16,12,'#123b32')}
  ctx.restore();
 }
 // Health is attached to the protected house, not to a distant HUD.
 const hpWidth=Math.min(230,w*.62),hpX=(w-hpWidth)/2,hpY=h*.735;
 const hpColor=g.hp<=30?'#ff795b':g.hp<=60?'#ffc963':'#99efb7';
 pill(ctx,hpX-7,hpY-21,hpWidth+14,47,'#092f31ed');
 text(ctx,`みんなの家   ${g.hp} / 100`,w*.5,hpY-5,13,hpColor);
 pill(ctx,hpX,hpY+3,hpWidth,11,'#45615a');if(g.hp>0)pill(ctx,hpX,hpY+3,hpWidth*g.hp/100,11,hpColor);
 if(g.hp<=60){ctx.save();ctx.strokeStyle='#432917';ctx.lineWidth=2.5;const paths=[[[.43,.81],[.48,.83],[.46,.86],[.50,.89]],[[.56,.80],[.52,.84],[.55,.86],[.53,.90]]];for(const path of paths.slice(0,g.hp<=30?2:1)){ctx.beginPath();path.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));ctx.stroke()}ctx.restore()}
 if(g.hp<=30){const grad=ctx.createRadialGradient(w/2,h/2,w*.22,w/2,h/2,h*.8);grad.addColorStop(0,'#a7251600');grad.addColorStop(1,'#a7251655');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h)}
 const effects=[...(u.effects??[])];if(u.preview&&now-u.preview.localAt<220&&!effects.some(e=>e.enemyId===u.preview.enemyId&&e.seat===u.seat))effects.push(u.preview);
 for(const e of effects){const age=now-e.localAt;if(age<0||age>950)continue;const alpha=1-age/950;
  if(e.kind==='breach'){pill(ctx,w*.28,h*.865,w*.44,28,'#8b201cee');text(ctx,`${laneNames494[e.lane]}から侵入！ −${e.damage}`,w/2,h*.865+20,14);continue}
  if(e.kind==='mega'){ctx.save();ctx.strokeStyle=`rgba(255,241,155,${alpha})`;ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(w/2,h*.42,w*(.25+age/1500),h*(.12+age/1800),0,0,Math.PI*2);ctx.stroke();text(ctx,'全方向、一網打尽！',w/2,h*.43,Math.min(26,w*.066),'#fff5b0');ctx.restore();continue}
  if(e.lane!==u.lane||!e.point)continue;const x=e.point.x/w,y=e.point.y/h;ctx.save();ctx.globalAlpha=alpha;
  if(u.props?.complete&&u.props.naturalWidth)imageCell492(ctx,u.props,0,x*w,y*h-8,85);
  if(e.kind==='catch'){text(ctx,e.assist?'援護成功！':'捕獲！',x*w,y*h-32-age*.02,16);for(let k=0;k<7;k++){const a=k*Math.PI*2/7;ctx.fillStyle='#e6ffdd';ctx.beginPath();ctx.arc(x*w+Math.cos(a)*age*.08,y*h+Math.sin(a)*age*.05,3,0,Math.PI*2);ctx.fill()}}
  ctx.restore();
 }
 u.effects=(u.effects??[]).filter(e=>now-e.localAt<950);
}
