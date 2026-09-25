import {RaceClient451} from '/qa/client.js';
import {raceDomSignature452} from '/qa/presentation.js';
import * as V from '../../src/hide/View536.js';
import * as P from '../../src/party/PartyView462.js';
import * as R from '../../src/party/PartyResults490.js';
const root=document.getElementById('app'),id=new URLSearchParams(location.search).get('self')??'p0',socket=new WebSocket(`ws://${location.host}/?self=${id}`);
const c=window.c={root,transport:{selfId:id},state:{},offset:0,error:'',rewardError:'',draft:{code:''},save:{state:{party:[],monsters:[],player:{gold:0,crystals:0}}},
 connected:()=>socket.readyState===1,ready:()=>socket.readyState===1,roster:()=>[{id:'m',speciesId:['slime','goblin','skeleton','wolf'][Number(id.slice(1))]}],sgSpeciesName463:id=>({slime:'スライム',goblin:'ゴブリン',wolf:'ウルフ',skeleton:'スケルトン'}[id]??id),
 raw(op,payload={}){if(socket.readyState!==1)return false;(window.sent559??=[]).push({op,...payload});socket.send(JSON.stringify({op,rulesVersion:8,hideVersion536:6,cartVersion543:7,ricochetVersion550:6,...payload}));return true},
 key:()=>null,bank:()=>null,render(){c.renderSignature452=raceDomSignature452(c);V.hideBefore536(c);root.innerHTML=c.partyBrowse462||!c.state.hide?P.partyHub462(c):V.hideView536(c);V.hideAfter536(c)},connectionMessage:()=>'',refresh(){c.raw('status')}
};
Object.setPrototypeOf(c,RaceClient451.prototype);const connectionTick=setInterval(()=>c.renderConnection(),100);
socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.type==='hideFrame536'){V.hideFrame536(c,m);return}if(m.type==='raceError451'){c.error=m.message;c.render();return}if(m.type!=='raceState451')return;c.presenceKey462=m.party?.id+':true';c.receive(m);R.resultReceive490(c);window.qaReady=true};
root.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&!b.disabled){if(R.resultClick490(c,b))return;if(V.hideClick536(c,b))return;P.partyClick462(c,b)}});root.addEventListener('input',e=>V.hideInput536(c,e.target));root.addEventListener('keydown',e=>V.hideKey536(c,e));window.dispose559=()=>{clearInterval(connectionTick);V.hideDispose536(c);socket.close()};
