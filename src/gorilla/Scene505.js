import{ATLAS505,HAIRS505,layout505,kingPose505,count505,toolColor505,blast505,SPOTS505,strandPoint505}from'./Presentation505.js';
const clamp=v=>Math.max(0,Math.min(1,v));
function cover(c,image,w,h){if(!image)return;const s=Math.max(w/image.width,h/image.height);c.drawImage(image,(w-image.width*s)/2,(h-image.height*s)*.57,image.width*s,image.height*s)}
function strand(c,h,stretch=0){c.save();c.scale(1,1+stretch*.22);c.lineCap='round';c.lineJoin='round';c.shadowColor='#3a1b0c44';c.shadowBlur=.4;c.shadowOffsetX=.3;for(let i=0;i<18;i++){const a=strandPoint505(h,i/18),b=strandPoint505(h,(i+1)/18);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineWidth=(h.bump?.85:.72)*(1-i/20);c.strokeStyle=i<5?'#302115':'#49301e';c.stroke()}c.restore()}
function pore(c,h,pulled,tug){const radius=h.bump?1.85:.55;c.save();if(tug>0){const rise=tug*(h.bump?7:5);c.beginPath();c.moveTo(-6,1);c.bezierCurveTo(-2,0,-2,-rise,0,-rise);c.bezierCurveTo(2,-rise,3,0,6,1);c.closePath();const skin=c.createLinearGradient(-5,0,5,0);skin.addColorStop(0,'#a86140aa');skin.addColorStop(.45,h.bump?'#ce8a70':'#d79c74');skin.addColorStop(1,'#985d3c66');c.fillStyle=skin;c.fill();c.translate(0,-rise)}const grad=c.createRadialGradient(-radius*.3,-radius*.4,.1,0,0,radius*1.7);grad.addColorStop(0,h.bump?'#d99a86':'#be8861');grad.addColorStop(.48,h.bump?'#ba7563':'#a96f4d');grad.addColorStop(1,'#8c4d3200');c.fillStyle=grad;c.beginPath();c.ellipse(0,0,radius*1.7,radius,0,0,Math.PI*2);c.fill();c.fillStyle=pulled?'#59312370':'#392211';c.beginPath();c.ellipse(0,-.35,h.bump?.6:.45,.35,0,0,Math.PI*2);c.fill();c.restore()}
function tweezers(c,closed,color){c.save();c.rotate(-.25);const metal=c.createLinearGradient(-10,0,10,0);metal.addColorStop(0,color.tint);metal.addColorStop(.30,color.hex);metal.addColorStop(.52,'#fff9e8');metal.addColorStop(.72,color.hex);metal.addColorStop(1,color.tint);c.strokeStyle=metal;c.lineWidth=2;c.shadowColor=color.hex;c.shadowBlur=1.2;c.lineCap='round';const gap=4*(1-closed)+.5;for(const side of[-1,1]){c.beginPath();c.moveTo(side*gap,0);c.lineTo(side*3.6,-24);c.quadraticCurveTo(side*4,-34,0,-37);c.stroke()}c.restore()}
function drawHair(c,h,g,at,u){const last=g.events.at(-1),selected=!u.reduced&&g.phase==='pluck'&&last?.hair===h.id,age=selected?Math.max(0,at-g.phaseAt503):0,removed=g.picked.includes(h.id),pending=u.pending?.kind==='pull'&&u.pending.hair===h.id&&!removed;
 const tug=selected&&age<530?Math.sin(clamp(age/530)*Math.PI/2):0,recoil=selected&&age>=530?Math.exp(-(age-530)/90)*Math.sin((age-530)/24):0;pore(c,h,removed&&!selected,Math.max(0,tug+recoil*.3));
 if(removed&&!selected)return;
 c.save();if(selected){if(age<530)c.translate(0,-tug*(h.bump?7:5));else{const fly=(age-530)/320;c.globalAlpha=1-clamp(fly);c.translate(fly*15,-10-fly*80);c.rotate(fly*.9)}}strand(c,h,tug);
 if(selected||pending){c.save();const arrive=selected?clamp(age/160):.5;const tip=strandPoint505(h,1);c.translate(tip.x,tip.y*(1+tug*.22)-(1-arrive)*14);c.globalAlpha*=arrive;tweezers(c,selected?clamp((age-80)/140):.5,toolColor505(g));c.restore()}c.restore();
}
function tile(c,image,frame,l,asset){if(!image)return;const cell=image.width/2,[x,y,w,h]=ATLAS505[asset]?.[frame]??[0,0,cell,cell];c.drawImage(image,(frame%2)*cell+x,Math.floor(frame/2)*cell+y,w,h,l.x,l.y,l.size,l.size)}
function aura(c,w,h,age){const strength=clamp((age-600)/500)*clamp((4000-age)/1600);if(!strength)return;c.save();const glow=c.createRadialGradient(w*.5,h*.51,w*.05,w*.5,h*.55,h*.7);glow.addColorStop(0,'#ffc66300');glow.addColorStop(.5,'#f7802540');glow.addColorStop(1,'#710e12ed');c.globalAlpha=strength;c.fillStyle=glow;c.fillRect(0,0,w,h);c.restore()}
function shockwave(c,w,h,age){for(const origin of[1300,1600,1940]){const t=age-origin;if(t<0||t>1050)continue;const p=t/1050,r=24+p*w*1.15;c.save();c.globalAlpha=(1-p)*.9;c.strokeStyle=origin===1300?'#fff2bf':'#ffc66a';c.lineWidth=(1-p)*9+1;c.shadowColor='#ff9f47';c.shadowBlur=15;c.beginPath();c.ellipse(w/2,h*.7,r,r*.40,0,0,Math.PI*2);c.stroke();c.restore()}
 const t=(age-1300)/1500;if(t<0||t>1)return;c.save();for(let i=0;i<24;i++){const angle=i*2.39996,d=(30+t*w*.75)*(0.5+(i%5)/7),x=w*.5+Math.cos(angle)*d,y=h*.72+Math.sin(angle)*d*.62-t*h*.15; c.save();c.translate(x,y);c.rotate(angle+t*3);c.globalAlpha=(1-t)*.7;c.fillStyle=i%3===0?'#f7d481':i%3===1?'#7f994b':'#a87649';c.beginPath();c.moveTo(-3,-1);c.quadraticCurveTo(0,-6,6,-2);c.lineTo(2,3);c.closePath();c.fill();c.restore()}c.restore();
}
// Short, fine body fur grounds the long selectable strands in the skin.
// A stable distribution follows the sternum, areola rims and lower midline.
const undercoat505=Array.from({length:170},(_,i)=>{const a=i*2.399963,r=Math.sqrt(((i*37)%101)/101),zone=i%10;let x,y;if(zone<5){x=50+Math.cos(a)*r*5.6;y=54+Math.sin(a)*r*9}else if(zone<8){x=50+Math.cos(a)*r*4.5;y=76+Math.sin(a)*r*7}else{const side=zone===8?33.4:66.5;x=side+Math.cos(a)*(2.1+r*2.6);y=57.2+Math.sin(a)*(1.8+r*2.2)}return{x,y,id:i,bump:false,length:1.7+(i%7)*.22,bend:Math.sin(i)*.55,tilt:(x<50?-.45:.45)+Math.sin(i*1.1)*.5}});
function undercoat(c,l){c.save();c.translate(l.x,l.y);c.scale(l.size/370,l.size/370);c.globalAlpha=.43;c.strokeStyle='#3c291b';c.lineWidth=.24;c.lineCap='round';c.beginPath();for(const h of undercoat505){const x=h.x*3.7,y=h.y*3.7;c.moveTo(x,y);for(let j=1;j<=6;j++){const p=strandPoint505(h,j/6);c.lineTo(x+p.x,y+p.y)}}c.stroke();c.restore()}
function drawPinch(c,l,g,at,u,hero){const e=g.events.at(-1),spot=g.phase==='pinch'?SPOTS505[e?.spot505]:u.pending?.kind==='pinch'?SPOTS505[u.pending.hair]:null;if(!spot)return;const age=g.phase==='pinch'?Math.max(0,at-g.phaseAt503):0,t=clamp(age/850),rise=u.reduced?0:Math.sin(t*Math.PI)*l.size*.012,x=l.x+l.size*spot.x/100,y=l.y+l.size*spot.y/100,r=l.size*.025;
 // Sample the existing skin, gently stretch it, then release. No replacement art,
 // marker, glow, label or persistent change gives this spot away beforehand.
 if(rise>0&&hero){c.save();c.beginPath();c.ellipse(x,y-rise*.5,r,r+rise*.5,0,0,Math.PI*2);c.clip();const sx=(spot.x/100-.025)*hero.width,sy=(spot.y/100-.025)*hero.height;c.drawImage(hero,sx,sy,hero.width*.05,hero.height*.05,x-r,y-r-rise,2*r,2*r+rise);c.restore()}
 c.save();c.translate(x,y-rise);c.scale(l.size/370,l.size/370);c.rotate(spot.id===0?1.1:-1.1);tweezers(c,u.reduced?1:clamp(age/190)*clamp((850-age)/180),toolColor505(g));c.restore();
}
export function draw505(canvas,g,assets,at,u={}){
 const w=canvas.clientWidth||canvas.width,h=canvas.clientHeight||canvas.height,c=canvas.getContext('2d'),ratio=canvas.width/w,l=layout505(w,h,g,at,u.reduced),blast=blast505(g,at,u.reduced);
 c.setTransform(ratio,0,0,ratio,0,0);c.clearRect(0,0,w,h);c.save();if(blast?.shake)c.translate(Math.sin(blast.age*.071)*blast.shake,Math.cos(blast.age*.063)*blast.shake*.55);
 cover(c,assets.background,w,h);const shade=c.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#071d1780');shade.addColorStop(.25,'#071d1700');shade.addColorStop(1,'#071d1770');c.fillStyle=shade;c.fillRect(0,0,w,h);
 if(blast)aura(c,w,h,blast.age);
 const pose=kingPose505(g,at);c.save();c.translate(l.cx,l.cy+l.dy);c.scale(l.scale,l.scale);c.translate(-l.cx,-l.cy);
 if(blast?.scale!==undefined){c.translate(l.cx,l.y+l.size*.8);c.scale(blast.scale,blast.scale);c.translate(-l.cx,-l.y-l.size*.8)}
 c.save();c.shadowColor='#06150ba0';c.shadowBlur=12;c.shadowOffsetY=6;
 // Switch bodies only at the close-up end of the camera move. Never blend
 // differently framed faces: that produces a visible second pair of eyes.
 if(l.focus>.985&&!['drum','blast'].includes(g.phase))c.drawImage(assets.hero,l.x,l.y,l.size,l.size);
 else tile(c,assets[pose.asset],pose.frame,l,pose.asset);c.restore();
 if(pose.asset!=='rage'||pose.frame<2)undercoat(c,l);
 for(const hair of HAIRS505){if(pose.asset==='rage'&&pose.frame>=2&&hair.y<66)continue;c.save();c.translate(l.x+l.size*hair.x/100,l.y+l.size*hair.y/100);c.scale(l.size/370,l.size/370);drawHair(c,hair,g,at,u);c.restore()}
 drawPinch(c,l,g,at,u,assets.hero);
 c.restore();
 if(blast&&!blast.judging&&!u.reduced)shockwave(c,w,h,blast.age);
 c.restore();
 if(g.phase==='countdown')drawCountdown505(c,w,h,g,assets,at);
 return l;
}
export function drawCountdown505(c,w,h,g,assets,at){c.save();const shade=c.createRadialGradient(w/2,h*.48,0,w/2,h*.48,h*.7);shade.addColorStop(0,'#061e16ed');shade.addColorStop(1,'#061e1650');c.fillStyle=shade;c.fillRect(0,0,w,h);const sz=Math.min(w*.85,h*.68,360),x=(w-sz)/2,y=h*.43-sz*.5;if(assets.countdown)c.drawImage(assets.countdown,x,y,sz,sz);const write=(s,yy,size,color='#ffebb0',bold=false)=>{c.font=`${bold?'900 ':''}${size}px system-ui`;c.fillStyle=color;c.textAlign='center';c.fillText(s,w/2,yy)};const number=count505(g,at);c.shadowColor='#9c7437';c.shadowOffsetY=3;write(number,y+sz*.66,number.length>1?sz*.17:sz*.29,'#fff1bc',true);c.shadowOffsetY=0;c.restore()}
// Shared original painters: the optimized renderer reuses the exact geometry,
// colours, timing and composition instead of maintaining a second art definition.
export const painters505=Object.freeze({cover,drawHair,tile,aura,shockwave,undercoat,drawPinch});
