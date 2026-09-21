// Short synchronized drum impacts. No queued sounds can bleed into the results.
export function blastAudio504(c,g,at){const u=c.ggUI502;if(!u||!['drum','blast'].includes(g.phase))return;
 const age=at-(g.phase==='drum'?g.drumAt504:g.blastAt),beats=[650,980,1140,1300,1620,1940,4700];
 for(let i=0;i<beats.length;i++){if(age<beats[i]||age>beats[i]+130)continue;const key=`${g.id}:${g.phase}:${g.drumAt504??g.blastAt}:${i}`;u.blastBeats504??=new Set();if(u.blastBeats504.has(key))continue;u.blastBeats504.add(key);if(u.blastBeats504.size>32)u.blastBeats504.delete(u.blastBeats504.values().next().value);
  if(!u.sound||c.save?.state.settings?.audioEnabled===false||globalThis.document?.visibilityState==='hidden'||u.context?.state!=='running')continue;
  try{const ctx=u.context,t=ctx.currentTime,duration=i===3?.34:.20,o=ctx.createOscillator(),gain=ctx.createGain();o.type='triangle';o.frequency.setValueAtTime(i===3?135:105,t);o.frequency.exponentialRampToValueAtTime(i===3?28:40,t+duration);gain.gain.setValueAtTime(.001,t);gain.gain.exponentialRampToValueAtTime(i===3?.11:.065,t+.008);gain.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(gain);gain.connect(ctx.destination);o.start(t);o.stop(t+duration+.02);o.onended=()=>{o.disconnect();gain.disconnect()}}catch{}
 }
}
