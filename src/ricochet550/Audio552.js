// Short tuned impacts let fast collisions remain distinct without stacking long sounds.
export function sound552(u,e){
 const a=u.audio;if(!u.sound||a?.state!=='running')return;
 const scales={burst:[146.8,293.7,440,880],burstReady:[659,988,1318],jackpotSpin:[523,659,784],pin:[523.25,659.25,783.99],wall:[1046],hit:[196],rotor:[880],bell:[1318],launch:[196,392],combo:[659,880],ready:[784,1047,1318],jackpot:[523,659,784,1047,1318],fever:[440,659,880,1320],pick:[740],treasure:[988,1318]};
 let notes=scales[e.type];if(!notes)return;if(e.type==='pin')notes=[scales.pin[e.gem??0]*(1+Math.min(4,e.mult??1)*.035)];
 if(e.type==='jackpot'&&e.tier===7)notes=[523,659,784,1047,1318,1568,2093];
 const big=['jackpot','fever','ready','burst','burstReady','jackpotSpin'].includes(e.type),volume=big?.035:e.type==='wall'||e.type==='rotor'?.008:e.type==='pin'?.013:.021;
 notes.forEach((freq,i)=>{const t=a.currentTime+i*(e.type==='jackpotSpin'?.30:big?.065:.028),o=a.createOscillator(),gain=a.createGain();o.type=e.type==='hit'||e.type==='burst'?'triangle':'sine';o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(freq*.99,t+.08);gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(volume,t+.004);gain.gain.exponentialRampToValueAtTime(.0001,t+(big?.22:.095));o.connect(gain);gain.connect(a.destination);o.start(t);o.stop(t+(big?.24:.11));o.onended=()=>{o.disconnect();gain.disconnect()};});
}
