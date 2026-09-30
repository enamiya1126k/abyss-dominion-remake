import {sound552} from './Audio552.js';
// Short bounded voices; long matches do not accumulate connected audio nodes.
function tone(a,freq,at,length,volume,type='sine',end=freq){
 const o=a.createOscillator(),gain=a.createGain();o.type=type;o.frequency.setValueAtTime(freq,at);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),at+length);
 gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.005);gain.gain.exponentialRampToValueAtTime(.0001,at+length);
 o.connect(gain);gain.connect(a.destination);o.start(at);o.stop(at+length+.02);o.onended=()=>{o.disconnect();gain.disconnect();};
}
export function sound565(u,e){
 const a=u.audio;if(!u.sound||a?.state!=='running')return;
 const now=a.currentTime;
 if(e.type==='goal'){
  tone(a,145,now,.26,.13,'sine',38);tone(a,210,now,.14,.04,'triangle',70);
  const notes=e.value===2?[392,523,659,784,1047,1318]:[523,659,784,1047];
  notes.forEach((f,i)=>{tone(a,f,now+.055+i*.068,.3,.032,'triangle',f*1.006);tone(a,f*2,now+.055+i*.068,.14,.009);});
  tone(a,1047,now+.45,.5,.022);return;
 }
 if(e.type==='pass'){
  const pitch=660*Math.pow(2,Math.min(e.charge??1,24)/24);tone(a,pitch,now,.12,.027,'sine',pitch*1.13);tone(a,pitch*1.5,now+.065,.19,.018);return;
 }
 if(['gemHit','wall','rotor','hit'].includes(e.type)){
  if(now-(u.lastImpact565??-10)<.045)return;u.lastImpact565=now;
  tone(a,e.type==='gemHit'?1100:460,now,.045,e.type==='gemHit'?.034:.013,'triangle',180);return;
 }
 sound552(u,{...e,type:e.type==='final'?'ready':e.type==='gem'?'treasure':e.type});
}
