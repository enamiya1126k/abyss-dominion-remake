import * as V from '../../src/cart/View543.js';
const root=document.querySelector('#app'),selfId=new URL(location.href).searchParams.get('self')??'p0';
const socket=new WebSocket(location.origin.replace('http','ws')+'/socket?self='+selfId);
const c=window.c={root,transport:{selfId},state:{},offset:0,error:'',connected:()=>socket.readyState===1,ready:()=>socket.readyState===1,refresh(){},
 raw(op,p){if(socket.readyState!==1)return false;(window.sent547??=[]).push({op,...p});socket.send(JSON.stringify({op,cartVersion543:4,...p}));return true},
 render(){V.cartBefore543(c);root.innerHTML=V.cartView543(c);V.cartAfter543(c)}
};
socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.type==='cartFrame543'){V.cartFrame543(c,m);return}if(m.type!=='raceState451')return;c.offset=m.serverNow-Date.now();const old=c.state.cart;c.state=m;V.cartReceive543(c);if(!old||old.id!==m.cart.id||old.phase!==m.cart.phase)c.render();window.qaReady=true};
root.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&!b.disabled)V.cartClick543(c,b)});root.addEventListener('keydown',e=>V.cartKey543(c,e));
window.dispose547=()=>{V.cartDispose543(c);socket.close()};
