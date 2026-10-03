import {unlock543} from '../cart/Audio543.js';
export function stopMusic583(u){for(const item of u.musicNodes??[]){try{item.osc.stop();item.gain.disconnect();}catch{}}u.musicNodes=[];u.musicBeat=null;}
function note(u,freq,volume,duration,type='triangle'){
 const a=u.audio,o=a.createOscillator(),v=a.createGain(),now=a.currentTime;
 o.type=type;o.frequency.value=freq;v.gain.setValueAtTime(.0001,now);v.gain.linearRampToValueAtTime(volume,now+.008);v.gain.exponentialRampToValueAtTime(.0001,now+duration);
 o.connect(v);v.connect(a.destination);o.start();o.stop(now+duration+.02);
 const item={osc:o,gain:v};u.musicNodes??=[];u.musicNodes.push(item);o.onended=()=>{o.disconnect();v.disconnect();u.musicNodes=u.musicNodes.filter(x=>x!==item);};
}
export function music583(u,g,at){
 if(!u.sound||u.audio?.state!=='running'||g.phase!=='play'||g.stage!=='dance'){if(u.musicNodes?.length)stopMusic583(u);return;}
 const beat=Math.floor(Math.max(0,at-g.roundAt)/240),key=g.round+':'+beat;
 if(key===u.musicBeat)return;u.musicBeat=key;
 // An original little minor-key clockwork dance, synthesized locally (no downloads).
 const melody=[523.25,622.25,783.99,622.25,698.46,587.33,783.99,698.46,622.25,523.25,466.16,523.25,587.33,466.16,392,466.16];
 note(u,melody[beat%melody.length],.038,.16);
 if(beat%4===1)note(u,melody[beat%melody.length]*1.5,.012,.11,'sine');
 if(beat%2===0)note(u,beat%8<4?130.81:155.56,.027,.13,'sine');
}
export {unlock543 as unlock583};
