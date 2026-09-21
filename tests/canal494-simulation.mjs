import{makeCanal489,startCanal489,advanceCanal489,inputCanal489}from'../src/canal/Rules489.js';
import{remaining494}from'../src/canal/Scene494.js';
export function run(seed,mode,n=1){const g=makeCanal489({id:'test',code:'A',hostId:'p0',members:Array.from({length:n},(_,i)=>({playerId:'p'+i,name:'P'+i,choice:{id:'m',speciesId:'wolf'}})),now:0,seed});g.rules494=1;startCanal489(g,0);const views=Array.from({length:n},(_,i)=>({lane:i,free:g.startAt+1000,next:0}));
 for(let at=g.startAt;at<=g.endAt&&g.phase!=='result';at+=100){advanceCanal489(g,at,()=>mode!=='auto');if(mode==='idle'||mode==='auto')continue;
 for(const p of g.players.filter(p=>!p.ai)){const v=views[p.seat];if(at<v.free||at<v.next)continue;const candidates=g.enemies.slice().sort((a,b)=>remaining494(a,at)-remaining494(b,at));const local=candidates.find(e=>e.lane===v.lane),other=candidates.find(e=>e.lane!==v.lane);let e=local;
 if(mode!=='own'&&other&&(!e||remaining494(other,at)<2000&&remaining494(e,at)>3500)){v.lane=other.lane;v.free=at+(mode==='casual'?1100:600);continue}
 if(e){inputCanal489(g,p,{seq:p.lastSeq+1,lane:e.lane,held:false,pulse:true,burst:false,targetId:e.id},at);v.next=at+(mode==='casual'?850:mode==='own'?600:450)}
 if(mode!=='own'&&g.netEnergy>=18&&g.enemies.length>=7)inputCanal489(g,p,{seq:p.lastSeq+1,lane:v.lane,held:false,pulse:false,burst:true},at);
 }}return{hp:g.hp,win:g.success,caught:g.captured,you:g.players[0].captured,mega:g.megaCount,breaches:g.breaches,ended:+((g.finishedAt-g.startAt)/1000).toFixed(1)};}
