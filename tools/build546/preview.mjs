// Visual fixture: the unmodified production cart view/input and actual renderer.
// A local Rules543 match replaces the transport so no online room is touched.
import * as V from '../../src/cart/View543.js';
import * as R from '../../src/cart/Rules543.js';
const names=['あなた','押すなよゴブ','より','おさきに骨さん'];
const species=['slime','goblin','wolf','skeleton'];
const colors=['orange','blue','green','pink'];
const root=document.querySelector('#app');
const members=names.map((name,i)=>({playerId:'p'+i,name,color499:colors[i],choice:{id:'m'+i,speciesId:species[i]}}));
let g=R.makeCart543({id:'visual546',code:'VISUAL',hostId:'p0',now:Date.now(),members});
R.startCart543(g,Date.now(),546);
const c=window.c={root,transport:{selfId:'p0'},state:{cart:g},offset:0,error:'',connected:()=>true,ready:()=>true,refresh(){},
 raw(op,p){if(op!=='cartInput543')return false;const me=g.players[0];R.input543(g,me,p.action,g.elapsed,p.angle);V.cartReceive543(c);return true},
 render(){V.cartBefore543(c);root.innerHTML=V.cartView543(c);V.cartAfter543(c)}
};
root.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&!b.disabled)V.cartClick543(c,b)});
root.addEventListener('keydown',e=>V.cartKey543(c,e));
window.scene546=(round=2,zoom=false,ready=false)=>{
 g.round=round;g.phase='play';g.elapsed=5300;g.serverAt=Date.now();g.multiplier=round===5?2:1;g.events=[];
 for(const [i,p] of g.players.entries())Object.assign(p,{x:[0,-1.7,1.2,.2][i],y:ready?1.1:zoom?[28,23,21,18][i]:[25.5,14,10,4][i],vx:0,vy:i?1.8:0,launched:!ready,fallenAt:null,chargeAt:null,power:.55,ai:false,lastHitAt:-9999,bodyAngle545:0,color499:colors[i]});
 c.render();return g;
};
window.scene546(Number(new URL(location.href).searchParams.get('round'))||2);
let running=false,clock=performance.now();
window.run546=value=>{running=value;clock=performance.now()};
const tick=now=>{if(running&&now-clock>=25){g.elapsed+=25;g.serverAt=Date.now();R.physics543(g);clock=now}requestAnimationFrame(tick)};requestAnimationFrame(tick);
window.qaReady=true;
