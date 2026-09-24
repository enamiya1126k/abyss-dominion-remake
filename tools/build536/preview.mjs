import * as V from '../../src/hide/View536.js';
import {signature536} from '../../src/hide/Rules536.js';
import {partyHub462,partyClick462} from '../../src/party/PartyView462.js';
import {resultClick490,resultReceive490,resultError490} from '../../src/party/PartyResults490.js';
import {monsterVisual} from '../../src/ui/MonsterVisual.js';
const root=document.querySelector('#app'),selfId=new URL(location.href).searchParams.get('self')??'p0';
const roster=['slime','wolf','goblin','skeleton'].map((speciesId,i)=>({id:'m'+i,speciesId}));
const c=window.c={root,transport:{selfId},state:{},offset:0,error:'',draft:{code:''},partyBrowse462:false,selectedGame462:'hide',roster:()=>roster,sgSpeciesName463:id=>({slime:'スライム',wolf:'ウルフ',goblin:'ゴブリン',skeleton:'スケルトン'})[id]??id,sgMonster463:id=>'<span class="sg-monster">'+monsterVisual({speciesId:id})+'</span>',displayName:()=>['えなみ','りおん','より','ひで'][Number(selfId.slice(1))],connected:()=>socket.readyState===1,ready:()=>socket.readyState===1,connectionMessage:()=>'',toast:()=>{},
 render(){V.hideBefore536(c);root.innerHTML=c.state.hide&&!c.partyBrowse462?V.hideView536(c):partyHub462(c);if(c.state.hide&&!c.partyBrowse462)V.hideAfter536(c)},refresh(){c.raw('status')},
 raw(op,p={}){if(socket.readyState!==1)return false;socket.send(JSON.stringify({op,rulesVersion:8,hideVersion536:1,minigamesVersion528:1,fishingVersion524:8,sumoVersion523:3,towerVersion517:5,quizVersion514:1,roster,...p}));return true}};
let signature='';const socket=new WebSocket(location.origin.replace('http','ws')+'/socket?self='+selfId);window.socketQA=socket;
socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.type==='hideFrame536'){V.hideFrame536(c,m);return}if(m.type==='raceError451'){resultError490(c,m);c.error=m.message;c.render();return}if(m.type!=='raceState451')return;const old=c.state.hide?.id;c.offset=m.serverNow-Date.now();c.state=m;if(old!==m.hide?.id)c.partyBrowse462=false;V.hideReceive536(c);resultReceive490(c);const next=JSON.stringify({g:signature536(m.hide),p:m.party,error:c.error});if(next!==signature){signature=next;c.render()}window.qaReady=true};
socket.onclose=()=>{c.error='再接続を確認中';};
root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(resultClick490(c,b)||V.hideClick536(c,b)||partyClick462(c,b))return});root.addEventListener('input',e=>V.hideInput536(c,e.target));root.addEventListener('keydown',e=>V.hideKey536(c,e));
window.disposeQA=()=>{V.hideDispose536(c);socket.close()};
