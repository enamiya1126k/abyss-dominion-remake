import {cabinet555,effects555} from './Art555.js';
import {ARENA555} from './Arena555.js';
import {aura553} from './Art553.js';
import {overdrive553} from './Rush553.js';
import {pod552,sling552} from './Art552.js';
import {playerColor499} from '../party/PartyColors499.js';
export function renderer550(canvas){return{canvas,ctx:canvas.getContext('2d',{alpha:false}),width:0,height:0,positions:[],trails:new Map()};}
export function resize550(r,w,h,dpr=1){r.width=w;r.height=h;r.dpr=Math.min(2,dpr);r.canvas.width=Math.round(w*r.dpr);r.canvas.height=Math.round(h*r.dpr);r.canvas.style.width=w+'px';r.canvas.style.height=h+'px';}
export function projection550(r){const scale=Math.min((r.width-4)/(ARENA555.width+.36),(r.height-4)/(ARENA555.height+.36));return{scale,ox:r.width/2,oy:r.height/2+ARENA555.height/2*scale,camera:0};}
export function paint550(r,g,selfId,u,at){if(!r.width||!r.height)return[];const mix=Math.min(1,(performance.now()-(u.receivedAt??0))/50),players=g.players.map(p=>{const q=u.previous?.id===g.id&&u.previous?.phase===g.phase?u.previous.players.find(q=>q.seat===p.seat):null;return q?{...p,x:q.x+(p.x-q.x)*mix,y:q.y+(p.y-q.y)*mix}:p;});const self=players.find(p=>p.playerId===selfId),pr=projection550(r);r.reduced=u.reduced;r.self=self;
 if(!u.reduced&&u.impact553){const age=at-u.impact553.at;if(age>=0&&age<140){const fade=1-age/140;pr.ox+=Math.sin(age*.17)*u.impact553.strength*fade;pr.oy+=Math.cos(age*.19)*u.impact553.strength*.6*fade;}}r.projection=pr;
 const c=r.ctx;c.setTransform(r.dpr,0,0,r.dpr,0,0);c.fillStyle='#06261e';c.fillRect(0,0,r.width,r.height);c.save();c.translate(pr.ox,pr.oy);c.scale(pr.scale,-pr.scale);cabinet555(c,g,r,at);
 for(const p of players){let trail=r.trails.get(p.seat)??[];const v=Math.hypot(p.vx,p.vy),last=trail.at(-1);if(u.reduced||v<5||last&&Math.hypot(p.x-last[0],p.y-last[1])>3)trail=[];if(!u.reduced&&v>5)trail.push([p.x,p.y,at]);trail=trail.filter(q=>at-q[2]<110).slice(-8);let distance=0;for(let i=trail.length-1;i>0;i--){distance+=Math.hypot(trail[i][0]-trail[i-1][0],trail[i][1]-trail[i-1][1]);if(distance>2){trail=trail.slice(i);break;}}r.trails.set(p.seat,trail);c.save();c.lineCap='round';for(let i=1;i<trail.length;i++){c.globalAlpha=.23*i/trail.length;c.strokeStyle=overdrive553(p,at)?'#ffdd8b':playerColor499(p).hex;c.lineWidth=.1*i/trail.length;c.beginPath();c.moveTo(...trail[i-1].slice(0,2));c.lineTo(...trail[i].slice(0,2));c.stroke();}c.restore();}
 for(const p of players){aura553(c,p,at,u.reduced);pod552(c,p,playerColor499(p).hex,at,u.reduced);if(p===self){c.beginPath();c.arc(p.x,p.y,p.r*1.35,0,Math.PI*2);c.strokeStyle='#fff0b9';c.lineWidth=.045;c.stroke();}}
 if(self&&u.pull?.active)sling552(c,self,u.pull,playerColor499(self).hex);effects555(c,g,r,at);c.restore();r.positions=players.map(p=>({seat:p.seat,x:pr.ox+p.x*pr.scale,y:pr.oy-p.y*pr.scale,size:Math.max(24,pr.scale*1.26),visible:g.phase==='play'}));return r.positions;
}
