import {unlock543} from '../cart/Audio543.js';
export function stopMusic583(u){
 for(const item of u.musicNodes??[]){try{item.osc.stop();item.gain.disconnect();}catch{}}
 u.musicNodes=[];u.musicBeat=null;u.musicRound=null;
}
function note(u,freq,volume,duration,delay=0,type='triangle'){
 const a=u.audio,o=a.createOscillator(),v=a.createGain(),now=a.currentTime+delay;
 o.type=type;o.frequency.value=freq;v.gain.setValueAtTime(.0001,now);v.gain.linearRampToValueAtTime(volume,now+.012);v.gain.exponentialRampToValueAtTime(.0001,now+duration);
 o.connect(v);v.connect(a.destination);o.start(now);o.stop(now+duration+.02);
 const item={osc:o,gain:v};u.musicNodes??=[];u.musicNodes.push(item);
 o.onended=()=>{o.disconnect();v.disconnect();u.musicNodes=u.musicNodes.filter(x=>x!==item);};
}
// A short audio-clock lookahead and overlapping notes avoid a false STOP during shuffle.
export function music583(u,g,at){
 if(!u.sound||u.audio?.state!=='running'||g.phase!=='play'||g.stage!=='dance'){if(u.musicNodes?.length)stopMusic583(u);return;}
 const elapsed=Math.max(0,at-g.roundAt),beat=Math.floor(elapsed/240);
 if(u.musicRound!==g.round){stopMusic583(u);u.musicRound=g.round;u.musicBeat=beat-1;}
 if(u.musicBeat<beat-1)u.musicBeat=beat-1;
 const melody=[523.25,622.25,783.99,622.25,698.46,587.33,783.99,698.46,622.25,523.25,466.16,523.25,587.33,466.16,392,466.16];
 while((u.musicBeat+1)*240<=elapsed+100){
  const n=++u.musicBeat,delay=Math.max(0,(n*240-elapsed)/1000);
  note(u,melody[n%melody.length],.033,.29,delay);
  if(n%4===1)note(u,melody[n%melody.length]*1.5,.011,.20,delay,'sine');
  if(n%2===0)note(u,n%8<4?130.81:155.56,.025,.50,delay,'sine');
 }
}
export {unlock543 as unlock583};
