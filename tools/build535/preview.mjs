import * as R from '../../src/sumo/Rules523.js';
import * as V from '../../src/sumo/View523.js';
import {monsterVisual} from '../../src/ui/MonsterVisual.js';
const root=document.querySelector('#app'),members=['あなた','オオカミ','ゴブリン','スケルトン'].map((name,i)=>({playerId:'p'+i,name,choice:{id:'m'+i,speciesId:['slime','wolf','goblin','skeleton'][i]},ready:true,connected:true}));
let g,playing=false,inputs=new Map();window.sent=[];
const c=window.c={root,transport:{selfId:'p0'},state:{},offset:0,error:'',roster:()=>members.map(m=>m.choice),sgSpeciesName463:id=>id,sgMonster463:id=>'<span class="sg-monster">'+monsterVisual({speciesId:id})+'</span>',ready:()=>true,connected:()=>true,
 render(){V.sumoBefore523(c);root.innerHTML=V.sumoView523(c);V.sumoAfter523(c)},refresh(){sync()},raw(op,p){sent.push({op,...p});if(op==='sumoInput523'){const prev=inputs.get('p0');inputs.set('p0',{...p,press:prev?.press||p.press,release:prev?.release||p.release,cancel:p.cancel});g.players[0].lastSeq=p.seq}return true}};
function sync(reset=false){if(reset&&c.sumoUI523){c.sumoUI523.timeline522=null;c.sumoUI523.positions={}}c.state.sumo=R.publicSumo523(g);c.state.party={id:'p',game:'sumo',hostId:'p0',members};c.state.partyResultActions490=1;c.offset=g.lastAt-Date.now();V.sumoReceive523(c)}
window.startQA=()=>{V.sumoDispose523(c);delete c.sumoUI523;g=R.makeSumo523({id:'qa535',code:'QA',partyId:'p',hostId:'p0',members});R.startSumo523(g,0,535);R.advanceSumo523(g,3000);inputs=new Map();playing=false;sync();c.render()};
window.stateQA=()=>structuredClone(g);
window.elapseQA=ms=>{const end=g.lastAt+ms;while(g.lastAt<end&&g.phase==='play')R.advanceSumo523(g,g.lastAt+R.SUMO523.step,inputs);sync()};
window.setPlayingQA=v=>playing=v;
window.sceneQA=name=>{
 startQA();const at=name==='warning'?39200:name==='collapse'?40400:24000;g.elapsed=at;g.lastAt=g.startAt+at;g.radius=R.radius523(at);g.events=[];g.crystals=g.crystals.slice(0,18);
 const places=[[-2,1.4],[2.4,0],[-1.7,-3.4],[2.9,3.7]];
 g.players.forEach((p,i)=>Object.assign(p,{x:places[i][0],y:places[i][1],power:i*16,collected:i*19,fx:i%2?-1:1,fy:0,charging:name==='charge',charge:R.chargeCap535({power:i*16})*[.3,.58,.82,1][i]}));
 g.pickups=[{id:1,type:'magnet',x:-5,y:0,born:at-800,expires:at+12000},{id:2,type:'brace',x:1.5,y:4.9,born:at-1000,expires:at+14000}];
 if(name==='charge'){g.players[1].magnetUntil=at+7000;g.players[2].anchor535=1;g.events=[{id:1,type:'chargeFull',playerId:'p3',x:2.9,y:3.7,at:at-100}];g.eventSeq=1}
 if(name==='collapse'){g.events=[{id:1,type:'collapse',from:9,to:7.65,at:40000}];g.eventSeq=1}
 sync(true);c.render();
};
window.hitQA=()=>{const [p,a]=g.players;Object.assign(p,{x:0,y:0});Object.assign(a,{x:-.8,y:0,fx:1,fy:0,charging:true,charge:R.chargeCap535(a),coolUntil:0,stunUntil:0});R.release523(g,a);R.collide523(g);sync();return{charging:p.charging,charge:p.charge,stun:p.stunUntil-g.elapsed}};
window.pickupQA=()=>{const p=g.players[0];g.pickups=[{id:3,type:'brace',x:p.x,y:p.y,born:g.elapsed,expires:g.elapsed+1000}];elapseQA(20);return p.anchor535};
window.resultQA=(draw=false)=>{sceneQA('result');g.elapsed=93500;g.lastAt=g.startAt+g.elapsed;g.players.forEach((p,i)=>Object.assign(p,{power:48-i*8,hits:18-i*3,kos:i===0?2:0,collected:82-i*11,blocks535:i===0?2:0,alive:draw?false:i===0,outAt:draw?90000:90000-i*5000}));R.finishSumo523(g,draw?'draw':'last');g.finaleUntil=g.lastAt-1;sync();c.render()};
root.addEventListener('click',e=>{const b=e.target.closest('button');if(b)V.sumoClick523(c,b)});
window.disposeQA=()=>{playing=false;V.sumoDispose523(c)};
setInterval(()=>{if(playing&&g.phase==='play')elapseQA(50)},50);
startQA();window.qaReady=true;
