// Short synthesized cues only: no audio downloads, infinite sources or extra timer loop.
export function unlock513(u){if(!u.sound)return;try{const Audio=globalThis.AudioContext??globalThis.webkitAudioContext;if(!Audio)return;u.audio??=new Audio();u.audio.resume?.().catch(()=>{})}catch{}}
function tone(u,hz,duration,volume=.06,type='sine',to=hz,delay=0){const a=u.audio;if(!u.sound||a?.state!=='running')return;const t=a.currentTime+delay,o=a.createOscillator(),v=a.createGain();o.type=type;o.frequency.setValueAtTime(hz,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+duration);v.gain.setValueAtTime(.001,t);v.gain.exponentialRampToValueAtTime(volume,t+.015);v.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(v);v.connect(a.destination);u.voices??=new Set();u.voices.add(o);o.onended=()=>{o.disconnect();v.disconnect();u.voices.delete(o)};o.start(t);o.stop(t+duration+.02)}
export function cue513(u,g,f){
 const roundKey=g.id+':'+g.round;
 // The same cue key is used across the predicted zero and the authoritative lock.
 if(f.closed&&u.slam515!==roundKey){u.slam515=roundKey;stop513(u);tone(u,85,.32,.09,'triangle',24,.12);tone(u,160,.18,.04,'triangle',35,.14)}
 let key=roundKey+':'+g.phase;if(g.phase==='question')key+=':'+f.seconds;if(g.phase==='reveal')key+=':'+f.revealBeat;if(u.cue===key)return;u.cue=key;
 if(g.phase==='countdown')tone(u,240,.2);
 else if(g.phase==='question'&&f.seconds<=5&&f.seconds>0){tone(u,80,.12,.065);tone(u,f.seconds<=3?330+(3-f.seconds)*85:110,.13,f.seconds<=3?.065:.035,'sine',f.seconds<=3?220:75,.13)}
 else if(g.phase==='reveal'&&f.revealBeat==='collapse')tone(u,65,.6,.07,'triangle',25);
 else if(g.phase==='reveal'&&f.revealBeat==='magma'&&g.reveal.rows.some(r=>r.wasAlive&&!r.correct)){tone(u,150,.55,.07,'triangle',30);tone(u,210,.27,.04,'sine',45,.08);tone(u,95,.35,.05,'triangle',25,.22)}
 else if(g.phase==='reveal'&&f.revealBeat==='lift'&&f.nextFloor){tone(u,95,1.25,.027,'sine',310);tone(u,190,1.1,.014,'triangle',620,.12)}
}
export function stop513(u){for(const o of u.voices??[])try{o.stop()}catch{}u.voices?.clear()}
export function close513(u){stop513(u);u.audio?.close?.().catch(()=>{});u.audio=null;u.cue=null}
