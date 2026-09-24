// Local QA harness: production views/rules, fixed match data and a small controller.
// Portraits are placeholders; game backgrounds, equipment art, UI and logic are real.
import * as L from '../../src/luck/Rules511.js';
import * as V from '../../src/luck/View511.js';
import * as S from '../../src/sugoroku/Engine463.js';
import * as SV from '../../src/sugoroku/View463.js';
import {CARDS463} from '../../src/sugoroku/Catalog463.js';
import * as G from '../../src/gorilla/Rules505.js';
import * as GV from '../../src/gorilla/View505.js';
const names=['あなた','ちょ','追い風オオカミ','骨までラッキー'];
const members=names.map((name,i)=>({playerId:'p'+i,name,connected:true,ready:true,color499:['orange','green','blue','pink'][i],owned:[{id:'m'+i,speciesId:['slime','goblin','wolf','skeleton'][i]}],choice:{id:'m'+i,speciesId:['slime','goblin','wolf','skeleton'][i]}}));
const root=document.querySelector('#app');let mode='luck',raw;
const c=window.c={root,state:{party:{id:'party',code:'ABC123',hostId:'p0',members},available:true,serverNow:5000,partyResultActions490:1},transport:{selfId:'p0'},offset:5000-Date.now(),ready:()=>true,connected:()=>true,roster:()=>members.map(m=>m.choice),bank:()=>null,sgSpeciesName463:id=>id,sgMonster463:id=>`<span class="sg-monster" aria-hidden="true">${{slime:'🔵',goblin:'👺',wolf:'🐺',skeleton:'💀'}[id]??'🐉'}</span>`,save:{state:{player:{gold:1000,crystals:0},settings:{audioEnabled:false},monsters:[]}},draft:{code:'ABC123'},refresh(){},raw(op,m){window.sent.push({op,m});if(m.kind==='rounds'){raw.rounds=m.rounds;sync();}return true},render(){if(mode==='luck'){V.luckBefore511(c);root.innerHTML=V.luckView511(c);V.luckAfter511(c)}else if(mode==='sugoroku'){SV.sugorokuBefore463(c);root.innerHTML=SV.sugorokuView463(c);SV.sugorokuAfter463(c)}else{GV.gorillaBefore505(c);root.innerHTML=GV.gorillaView505(c);GV.gorillaAfter505(c)}}};window.sent=[];
function sync(){c.state.luck=mode==='luck'?L.publicLuck511(raw,'p0'):null;c.state.sugoroku=mode==='sugoroku'?S.public463(raw,'p0'):null;c.state.gorilla=mode==='gorilla'?G.publicGorilla505(raw):null;c.render()}
window.show=(next='luck',phase='hand')=>{V.luckBefore511(c);GV.gorillaBefore505(c);SV.sugorokuBefore463(c);mode=next;
 if(mode==='luck'){raw=L.makeLuck511({id:'lk',code:'ABC123',partyId:'party',hostId:'p0',members});raw.rounds=16;if(phase!=='lobby'){L.startLuck511(raw,0,L.drawPlan511(n=>n-1,16));L.advanceLuck511(raw,raw.nextAt);raw.round=5;raw.phase=phase;raw.phaseAt=4000;raw.deadline=39000;raw.boxes511=[0,0,0,0];raw.items511=[null,null,null,null];raw.players.forEach((p,i)=>{p.distance=[360,8700,38000,12000][i];p.loadout=L.ITEMS511.filter(x=>x.persistent).slice(0,16-i*4).map((x,j)=>({id:x.id,round:1+j%4}));p.coils=3;p.suns=2;p.savings=600;p.wards=2;p.lastAdvance=360});}c.lkUI511={gameId:'lk',artReady:false,sound:false,search:'',limit:24};}
 if(mode==='sugoroku'){raw=S.makeLobby463({id:'sg',code:'ABC123',partyId:'party',hostId:'p0',members,seed:777});S.start463(raw,0);raw.presentation464=[];raw.step='pre';const p=raw.players[0];p.pos='7';p.trail=Array.from({length:8},(_,i)=>String(i));p.special='greed';p.greedTurns528=2;const card=CARDS463.find(c=>c.effects.some(e=>e.type==='direct'&&e.n===10));raw.cards['qa-move']=card.id;p.hand=['qa-move'];raw.pending=null;c.sgUI463={gameId:'sg',filter:'all',sort:'received',follow:true,zoom:.72,x:0,y:0,modal:phase==='card'?{kind:'card',id:card.id,uid:'qa-move'}:null,scrolls:{}};}
 if(mode==='gorilla'){raw=G.makeGorilla505({id:'gg',code:'ABC123',partyId:'party',hostId:'p0',members,seed:1});G.startGorilla505(raw,0,{badHair:29,firstSeat:0,mercyCoins504:Array(30).fill(0),trapOrder504:Array.from({length:30},(_,i)=>i)});G.advanceGorilla505(raw,4650);if(phase==='blast'){G.pinchGorilla505(raw,'p0',0,0,0,4651,()=>0);G.advanceGorilla505(raw,raw.nextAt);}c.ggUI502={gameId:'gg',sound:false};}
 c.offset=(mode==='gorilla'?raw.phaseAt503+300:5000)-Date.now();sync();window.raw=raw;return true;
};
root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(mode==='luck')V.luckClick511(c,b);if(mode==='sugoroku')SV.sugorokuClick463(c,b);if(mode==='gorilla')GV.gorillaClick505(c,b,e)});
document.addEventListener('keydown',e=>{if(mode==='luck')V.luckKey511(c,e)});
window.show();window.qaReady=true;
