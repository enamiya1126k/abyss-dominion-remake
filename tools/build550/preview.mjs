import * as V from '../../src/ricochet550/View550.js';
import * as P from '../../src/party/PartyView462.js';
import * as R from '../../src/party/PartyResults490.js';
const root=document.getElementById('app'),id=new URLSearchParams(location.search).get('self')??'p0',socket=new WebSocket(`ws://${location.host}/?self=${id}`);
const c=window.c={root,transport:{selfId:id},state:{},offset:0,error:'',draft:{code:''},save:{state:{party:[],monsters:[]}},
 connected:()=>socket.readyState===1,ready:()=>socket.readyState===1,roster:()=>['slime','goblin','wolf','skeleton'].map((speciesId,i)=>({id:'m'+i,speciesId})),sgSpeciesName463:id=>({slime:'スライム',goblin:'ゴブリン',wolf:'ウルフ',skeleton:'スケルトン'}[id]??id),
 raw(op,payload={}){if(socket.readyState!==1)return false;(window.sent550??=[]).push({op,...payload});socket.send(JSON.stringify({op,rulesVersion:8,ricochetVersion550:1,cartVersion543:5,...payload}));return true},
 render(){V.ricochetBefore550(c);root.innerHTML=c.partyBrowse462||!c.state.ricochet?P.partyHub462(c):V.ricochetView550(c);V.ricochetAfter550(c)},connectionMessage:()=>'',refresh(){}
};
socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.type==='ricochetFrame550'){V.ricochetFrame550(c,m);return}if(m.type==='raceError451'){c.error=m.message;c.render();return}if(m.type!=='raceState451')return;const old=c.state.ricochet;c.offset=m.serverNow-Date.now();c.state=m;V.ricochetReceive550(c);R.resultReceive490(c);if(old?.id!==m.ricochet?.id)c.partyBrowse462=false;c.render();window.qaReady=true};
root.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&!b.disabled){if(R.resultClick490(c,b))return;if(V.ricochetClick550(c,b))return;P.partyClick462(c,b)}});root.addEventListener('input',e=>V.ricochetInput550(c,e.target));root.addEventListener('keydown',e=>V.ricochetKey550(c,e));window.dispose550=()=>{V.ricochetDispose550(c);socket.close()};
