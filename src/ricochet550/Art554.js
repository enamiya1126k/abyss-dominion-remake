import {THEMES550} from './Catalog550.js';
import {trackTheme551} from './Rules550.js';
import {nitroActive554} from './Motor554.js';
export const asset554=name=>new URL('../../assets/ricochet554/'+name+'.png',import.meta.url).href;
const pictures=new Map(),tau=Math.PI*2;
export function image554(name){let im=pictures.get(name);if(!im){im=new Image();im.src=asset554(name);pictures.set(name,im)}return im}
// Trim explicit source bounds so neighbouring sprites never bleed into a floor pad.
export function part554(c,name,index,x,y,w,h=w){const im=image554(name);if(!im.complete||!im.naturalWidth)return false;let sx,sy,sw,sh;if(name==='race-props'){const regions=[[0,172,627,302],[635,172,609,302],[17,588,609,610],[696,614,514,574]],k=im.naturalWidth/1254;[sx,sy,sw,sh]=regions[index].map(v=>v*k);if(index<2)h*=.48;}else{sw=im.naturalWidth/3;sh=im.naturalHeight/2;sx=index%3*sw;sy=Math.floor(index/3)*sh;}c.save();c.translate(x,y);c.scale(1,-1);c.drawImage(im,sx,sy,sw,sh,-w/2,-h/2,w,h);c.restore();return true}

function line(c,points,color,width){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke()}
function text(c,value,x,y,size,color='#fff0bb'){const scale=size/32;c.save();c.translate(x,y);c.scale(scale,-scale);c.textAlign='center';c.textBaseline='middle';c.font='800 32px "Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif';c.strokeStyle='#082620';c.lineWidth=.04/scale;c.strokeText(value,0,0);c.fillStyle=color;c.fillText(value,0,0);c.restore()}
export function road554(c,r,g,pr,at){
 const low=pr.camera-(r.height-pr.oy)/pr.scale-3,high=pr.camera+pr.oy/pr.scale+3,im=image554('foundry-road'),roadWidth=18.62,tile=27.93;
 c.fillStyle='#163330';c.fillRect(-8,low,16,high-low);
 if(im.complete&&im.naturalWidth)for(let i=Math.floor(low/tile);i*tile<high;i++){c.save();c.translate(-roadWidth/2,i*tile+tile);c.scale(1,-1);c.drawImage(im,0,0,roadWidth,tile+.018);c.restore();}
 for(const x of [-6,6]){line(c,[[x,low],[x,high]],'#5f4727',.06);line(c,[[x-.035,low],[x-.035,high]],'#d9b971',.025)}
 for(let y=Math.floor(low/3)*3;y<high;y+=3)for(const x of [-5.86,5.86]){const section=trackTheme551(y),colors=['#edc67d','#8aebdc','#ffb076','#95dcac'];c.fillStyle=colors[section];c.globalAlpha=.6;c.fillRect(x-.035,y,.07,.23);c.globalAlpha=1;}
 for(let y=Math.ceil(low/20)*20;y<high;y+=20)if(y>0){c.save();c.translate(-6.5,y);c.rotate(Math.PI/2);text(c,`${y*10}m`,0,0,.25,'#e1ce9a');c.restore();}
 if(low<2&&high>1)for(let i=0;i<12;i++)for(let j=0;j<2;j++){c.fillStyle=(i+j)%2?'#f0dfb8b0':'#091c19a0';c.fillRect(-6+i,.5+j*.3,1,.3)}
 for(const b of g.layout.belts??[]){if(b.to<low||b.from>high)continue;part554(c,'race-props',0,b.x,(b.from+b.to)/2,b.w*1.12,5.5);if(!r.reduced){const t=(at/600)%1;c.globalAlpha=.27*(1-t);line(c,[[b.x-b.w*.4,b.from+t*(b.to-b.from)],[b.x+b.w*.4,b.from+t*(b.to-b.from)]],'#a5ffe7',.08);c.globalAlpha=1}}
 for(const b of g.layout.posts??[])if(b.y>low&&b.y<high)part554(c,'race-props',2,b.x,b.y,b.r*2.4);
 for(const b of g.layout.pickups??[])if(b.claimed==null&&b.y>low&&b.y<high){c.save();if(!r.reduced){c.shadowColor='#ffce71';c.shadowBlur=5/pr.scale}part554(c,'race-props',3,b.x,b.y,1.05);c.restore();}
 for(const b of g.layout.gates??[]){if(b.y+2<low||b.y-2>high)continue;const spent=r.self?.passedGates554?.includes(b.id);for(const side of [-1,1]){const kind=side<0?b.left:b.left==='safe'?'wild':'safe',x=side*b.x;c.save();c.globalAlpha=spent?.5:1;part554(c,'race-props',kind==='safe'?0:1,x,b.y,b.w*1.14);text(c,kind==='safe'?'安定加速':'暴発ギア',x,b.y+1.35,.3,kind==='safe'?'#a6ffdc':'#ffe091');text(c,spent?'通過済み':kind==='safe'?'加速＋充填':'６で大暴発',x,b.y-1.35,.23,kind==='safe'?'#9aded0':'#eac78c');c.restore();}
  line(c,[[-5.35,b.y-1.85],[5.35,b.y-1.85]],'#cdb77b35',.035);
 }
}
function flame(c,x,y,length,color){c.save();c.translate(x,y);const gradient=c.createLinearGradient(0,0,0,-length);gradient.addColorStop(0,'#ffefaf');gradient.addColorStop(.3,color);gradient.addColorStop(1,'#f0782100');c.beginPath();c.moveTo(-.13,0);c.bezierCurveTo(-.23,-length*.35,-.06,-length*.8,0,-length);c.bezierCurveTo(.08,-length*.75,.24,-length*.35,.13,0);c.fillStyle=gradient;c.fill();c.restore()}
export function kart554(c,p,g,at,color,reduced){
 const hot=nitroActive554(p,at)||at<(p.hotUntil554??0),v=Math.hypot(p.vx,p.vy),parts=p.parts??{},angle=Math.max(-.65,Math.min(.65,Math.atan2(p.vx,Math.abs(p.vy)+4)*.7));
 c.save();c.translate(p.x,p.y);c.rotate(-angle);c.fillStyle='#00161388';c.beginPath();c.ellipse(.04,-.1,.76,.76,0,0,tau);c.fill();
 if(hot){const halo=c.createRadialGradient(0,0,.3,0,0,1.2);halo.addColorStop(0,'#ffc86a44');halo.addColorStop(1,'#ffc86a00');c.fillStyle=halo;c.fillRect(-1.3,-1.3,2.6,2.6)}
 if(v>4&&(hot||parts.rocket||parts.coil))for(const x of [-.42,.42])flame(c,x,-.58,(hot?1.5:.65)+(reduced?0:.15*Math.sin(at/65+x)),hot?'#ffa445':'#90ebd2');
 part554(c,'kart-modules',0,0,0,2.1);
 if(parts.wheels||parts.spring)part554(c,'kart-modules',4,0,-.25,1.65+Math.min(4,(parts.wheels??0)+(parts.spring??0))*.045,1.65);
 if(parts.armor||parts.bumper)part554(c,'kart-modules',1,0,.58,1.65+Math.min(4,(parts.armor??0)+(parts.bumper??0))*.05,1.28);
 if(parts.rocket||parts.coil)part554(c,'kart-modules',2,0,-.54,1.42,1.1);
 if(parts.engine||parts.bank)part554(c,'kart-modules',3,0,-.36,.85+Math.min(4,(parts.engine??0)+(parts.bank??0))*.06,.85);
 if(parts.cell)part554(c,'kart-modules',5,.57,.05,.52,.65);
 if(parts.turbo){for(const x of [-.55,.55]){c.fillStyle=hot?'#fff0aa':'#bf8f55';c.fillRect(x-.065,.5,.13,.14)}}
 // The selected RPG character remains a separate upright cockpit layer above the car.
 line(c,[[-.48,.39],[.48,.39]],color,.065);
 if(p.nitro554>=100&&!hot){c.strokeStyle='#ffda8a';c.lineWidth=.035;c.beginPath();c.arc(0,0,.9,0,tau);c.stroke();}
 c.restore();
 if(parts.hook){const ahead=g.players.filter(q=>q!==p&&q.y>p.y&&q.y-p.y<5&&Math.abs(q.x-p.x)<2).sort((a,b)=>a.y-b.y)[0];if(ahead){c.save();c.setLineDash([.12,.12]);line(c,[[p.x,p.y+.5],[ahead.x,ahead.y-.5]],'#c1edcf77',.04);c.restore()}}
}
export function motorSling554(c,p,pull,color){if(!pull?.active)return;const a=pull.angle,length=.95+pull.power*1.5;c.save();c.translate(p.x,p.y);c.rotate(-a);for(const x of [-.22,.22]){line(c,[[x,-.12],[x*.6,-length]],'#09201c',.095);line(c,[[x,-.12],[x*.6,-length]],'#d8ae64',.04)}const sheen=c.createLinearGradient(0,-length-.12,0,-length+.12);sheen.addColorStop(0,'#f8d897');sheen.addColorStop(.5,'#784829');sheen.addColorStop(1,'#d9b575');c.fillStyle=sheen;c.beginPath();c.roundRect(-.4,-length-.11,.8,.22,.07);c.fill();line(c,[[-.2,.73],[0,.98+pull.power*.22],[.2,.73]],pull.power>.92?'#ffeab0':color,.065);c.restore();}
export function sparks554(c,g,r,at){for(const e of g.events){const age=at-e.at;if(age<0||age>550||e.x==null)continue;const strong=e.type==='nitro'||e.type==='gate'&&e.die===6;if(!r.reduced&&['wall','hit','nitro','gate','boost'].includes(e.type)){const t=age/550,n=strong?15:5;c.globalAlpha=(1-t)*(strong?.9:.5);for(let k=0;k<n;k++){const a=k*tau/n+e.id,len=.2+t*(strong?2.2:.7);line(c,[[e.x+Math.cos(a)*len,e.y+Math.sin(a)*len],[e.x+Math.cos(a)*(len+.16),e.y+Math.sin(a)*(len+.16)]],k%2?'#ffb560':'#fff1b9',strong?.045:.025)}}}c.globalAlpha=1;}
export function speedVeil554(c,r,p,at,reduced){if(reduced||!p)return;const v=Math.hypot(p.vx,p.vy),hot=nitroActive554(p,at);if(v<26&&!hot)return;const alpha=Math.min(.24,(v-20)/220)+(hot?.06:0);c.save();c.lineWidth=1;for(let k=0;k<8;k++){const x=k%2?r.width-4-(k%4)*5:4+(k%4)*5,y=(at*(.12+v*.004)+k*91)%r.height;c.strokeStyle=hot?`rgba(255,206,118,${alpha})`:`rgba(169,229,211,${alpha})`;c.beginPath();c.moveTo(x,y);c.lineTo(x,y+20+v*.35);c.stroke()}c.restore();}
export function motorHud554(){return `<div class="rc-dashboard554"><div><small>SCRAP ENGINE</small><strong data-rc-gpspeed>0<small> m/s</small></strong></div><div class="rc-gate-guide554"><span data-rc-gpnext>NEXT GATE</span><b data-rc-gplanes>安定 ←　→ 暴発</b></div><div class="rc-gear554"><small>MY MACHINE</small><b data-rc-gptier>Lv.0</b></div></div>`}
export function motorMeter554(){return `<div class="rc-nitro554" data-rc-nitro role="meter" aria-label="スクラップターボ" aria-valuemin="0" aria-valuemax="100" aria-valuenow="20"><i class="rc-motor-icon554"></i><b data-rc-nitrolabel>接触でターボ</b><span><i data-rc-nitrofill></i></span><strong data-rc-nitrovalue>20%</strong></div>`}
