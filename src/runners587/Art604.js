import {cannonPose604,tideTop604,frozen604} from './Threats604.js';
import {image603,sprite603} from './Art603.js';
import {centered602,image602} from './Art602.js';
import {BOSS_ATLAS603} from './BossAtlas603.js';
const assets=new Map(),ids=['cannonball','electric-wall','axe','star-ring','gun','goblin'];
const url=id=>new URL(id==='star-ring'?'../../assets/runners607/star-ring.webp':id==='gun'?'../../assets/runners603/cannon.webp':id==='goblin'?'../../assets/runners603/boss-goblin_guard.webp':'../../assets/runners604/'+id+'.webp',import.meta.url).href;
function get(id){if(assets.has(id))return assets.get(id);const image=new Image(),a={image,ready:false,error:false};assets.set(id,a);image.decoding='async';image.src=url(id);a.promise=image.decode().then(()=>a.ready=true).catch(()=>a.error=true);return a;}
export const preload604=()=>Promise.all(ids.map(id=>get(id).promise));
export const status604=()=>({ready:ids.every(id=>assets.get(id)?.ready),error:ids.some(id=>assets.get(id)?.error)});
export function image604(c,id,x,y,w,h=w,angle=0){const a=get(id);if(!a.ready)return;c.save();c.translate(x,y);c.rotate(angle);c.drawImage(a.image,-w/2,-h/2,w,h);c.restore();}
export function cannon604(c,h,state,t,reduced){
 const q=cannonPose604(h,state,t),a=get('gun');
 if(a.ready){c.save();c.translate(h.x,h.y);
  // The support stays on the ground; only the barrel rotates about its axle.
  c.drawImage(a.image,88,70,168,86,-24,-24,46,24);
  c.translate(0,-25);c.rotate(q.angle-Math.PI);c.translate(reduced?0:q.recoil,0);
  c.drawImage(a.image,0,0,256,84,-38,-13,52,22);c.restore();
 }
 if(state?.warning){const blink=reduced?.65:.55+.25*Math.sin(t/60);c.save();c.globalAlpha=blink;centered602(c,'spark',q.muzzleX,q.muzzleY,15);c.restore();}
 if(!reduced&&t-(state?.firedAt??-1e9)<140)centered602(c,'spark',q.muzzleX,q.muzzleY,28);
}
export function lightning604(c,h,q,t,reduced){
 image603(c,'tesla',h.x-22,h.y-27,44,29);
 c.save();c.translate(h.x,h.y-h.h);c.rotate(Math.PI);image603(c,'tesla',-15,-5,30,23);c.restore();
 if(q.active){c.save();c.globalAlpha=reduced?1:.88+.12*Math.sin(t/23);image604(c,'electric-wall',h.x,h.y-h.h/2,65,h.h+4);c.restore();}
 else if(q.warning){
  c.save();c.strokeStyle='#ffb64e';c.lineWidth=2;c.setLineDash([5,8]);c.beginPath();c.moveTo(h.x,h.y-28);c.lineTo(h.x,h.y-h.h+14);c.stroke();c.restore();
  centered602(c,'spark',h.x,h.y-27,15);centered602(c,'spark',h.x,h.y-h.h+12,15);
 }
}
export function water604(c,h,t,reduced){
 const y=tideTop604(h,t),bottom=h.y+27,left=h.x,right=h.x+h.w;
 // Translucent vector water conforms to the shoreline, no rectangular picture tile.
 c.save();c.beginPath();c.moveTo(left,bottom);
 for(let i=0;i<=24;i++){const x=left+h.w*i/24,edge=Math.sin(Math.PI*i/24),wave=reduced?0:Math.sin(i*.9+t/330)*2+Math.sin(i*.5-t/600)*1.5;c.lineTo(x,bottom-(bottom-y)*Math.min(1,edge*5)+wave*edge);}
 c.lineTo(right,bottom);c.closePath();const gradient=c.createLinearGradient(0,y,0,bottom);gradient.addColorStop(0,'#92f1ef94');gradient.addColorStop(.3,'#3cb6cd70');gradient.addColorStop(1,'#13769305');c.fillStyle=gradient;c.fill();
 c.strokeStyle='#c4ffff9c';c.lineWidth=1.5;c.beginPath();
 for(let i=1;i<24;i++){const x=left+h.w*i/24,edge=Math.sin(Math.PI*i/24),yy=bottom-(bottom-y)*Math.min(1,edge*5)+(reduced?0:Math.sin(i*.9+t/330)*2+Math.sin(i*.5-t/600)*1.5)*edge;i===1?c.moveTo(x,yy):c.lineTo(x,yy);}c.stroke();
 c.restore();
}
export function threatsArt604(c,g,course,left,right,t,reduced){
 const visible=(x,w=50)=>x+w>left&&x-w<right;
 for(const h of course.rollers600){if(!visible(h.right))continue;
  // Physical chute makes the origin legible even between emissions.
  image602(c,'wall',h.right-19,h.y-49,40,50);c.fillStyle='#143239';c.fillRect(h.right-22,h.y-32,23,30);centered602(c,'ice-shell',h.right-12,h.y-23,25);
 }
 for(const h of course.meteors603??[]){if(!visible(h.x))continue;const y=h.from??h.y-360,phase=((t+(h.offset??0))%h.period+h.period)%h.period;
  image602(c,'wall',h.x-29,y-22,58,24);
  if(phase<(h.warning??800)){sprite603(c,'icicle',h.x+(reduced?0:Math.sin(t/35)*1.5),y+20,17,53);c.save();c.globalAlpha=.45;centered602(c,'arrow',h.x,h.y-32,12,18,Math.PI);c.restore();}
 }
 for(const s of g.threats604?.shots??[]){if(!visible(s.x))continue;const lead=Math.min(65,Math.max(0,t-g.elapsed))/1000,x=s.x+s.vx*lead,y=s.y+s.vy*lead;
  if(s.kind==='cannon'){c.save();c.strokeStyle='#f1d3a680';c.lineWidth=4;c.beginPath();c.moveTo(x,y);c.lineTo(x-s.vx*.045,y-s.vy*.045);c.stroke();c.restore();image604(c,'cannonball',x,y,40,40,reduced?0:t/340);}
  else if(s.kind==='axe')image604(c,'axe',x,y,35,35,reduced?0:t/95);
  else if(s.kind==='icicle')sprite603(c,'icicle',x,y,20,52);
  else if(s.kind==='iceball')centered602(c,'ice-shell',x,y,46,46,reduced?0:-t/220);
  else {image604(c,'cannonball',x,y,31);centered602(c,'spark',x,y,42);}
 }
 for(const p of g.players){if(!visible(p.x)||!frozen604(p,t)||p.respawnAt)continue;
  centered602(c,'ice-shell',p.x,p.y-21,48,53);
  c.save();c.font='bold 11px sans-serif';c.textAlign='center';c.fillStyle='#0e2f47';c.fillRect(p.x-17,p.y-71,34,16);c.fillStyle='#d4fdff';c.fillText(Math.max(0,(p.frozenUntil604-t)/1000).toFixed(1)+'s',p.x,p.y-59);c.restore();
 }
}
export function axeEnemy604(c,p,t,reduced){
 const a=get('goblin');if(!a.ready)return;const q=p.throw604,age=q?t-q.start:-1,frame=q?(age<650?'idle3':'attack'):('walk'+(Math.floor(t/210)%2+1));
 const [sx,sy,sw,sh]=BOSS_ATLAS603.goblin_guard[frame],h=40,w=sw/sh*h;
 c.save();c.translate(p.x,p.y);c.scale(-p.dir,1);c.drawImage(a.image,sx,sy,sw,sh,-w/2,-h,w,h);c.restore();
 if(!q||age<650)image604(c,'axe',p.x+(q?0:p.dir*19),p.y-(q?47:23),25,25,q?-1.2:0);
 if(q&&age<650){c.save();c.fillStyle='#fff0ba';c.strokeStyle='#552719';c.font='bold 14px sans-serif';c.textAlign='center';c.lineWidth=3;c.strokeText('!',p.x,p.y-64);c.fillText('!',p.x,p.y-64);c.restore();}
}
export function health604(c,b){
 c.save();c.fillStyle='#102721';c.fillRect(-43,-92,86,14);c.strokeStyle='#d2b572';c.lineWidth=1;c.strokeRect(-43,-92,86,14);
 c.fillStyle='#49221f';c.fillRect(-39,-82,78,3);c.fillStyle=b.hp/b.maxHp>.35?'#6ddd89':'#ff735b';c.fillRect(-39,-82,78*Math.max(0,b.hp/b.maxHp),3);
 c.fillStyle='#fff4d3';c.font='bold 7px sans-serif';c.textAlign='left';c.fillText('HP',-38,-84);c.textAlign='right';c.fillText(b.hp+' / '+b.maxHp,38,-84);c.restore();
}
export function deathPose604(p,t,reduced=false){
 if(!p.respawnAt||!p.death604)return null;const d=p.death604,age=t-d.start;
 if(age<0||age>=500)return null;const seconds=age/1000;
 if(d.cause==='fall')return {x:d.x+(reduced?0:Math.max(-235,Math.min(235,d.vx??0))*seconds*.4),y:d.y+Math.max(180,d.vy??0)*seconds+675*seconds*seconds,opacity:1,angle:0};
 return {x:d.x+(reduced?0:d.dir*110*seconds),y:d.y+(reduced?0:-235*seconds+490*seconds*seconds),opacity:Math.max(0,1-Math.max(0,age-240)/260),angle:reduced?0:d.dir*age*.12};
}
