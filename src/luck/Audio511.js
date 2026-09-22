// Short synthesized cues; nodes disconnect on completion. No repeating audio timer.
export function sound511(c,kind){const u=c.lkUI511;if(!u?.sound||u.reduced||c.save?.state.settings?.audioEnabled===false||globalThis.document?.visibilityState==='hidden')return;
 try{const Audio=globalThis.AudioContext??globalThis.webkitAudioContext;if(!Audio)return;u.audio??=new Audio();const ctx=u.audio;if(ctx.state!=='running'){ctx.resume().catch(()=>{});return}
 const notes={roll:[190,260,340],land:[620,400],jackpot:[523,659,784,1047,1319],finish:[523,659,784,1047],open:[330,440,660],launch:[90,180,360,720],count:[600],attack:[440,220],hit:[100,60],guard:[620,930],reflect:[400,800,1200],settle:[520,780],pick:[480,720]}[kind]??[440];
 for(let i=0;i<notes.length;i++){const t=ctx.currentTime+i*.09,o=ctx.createOscillator(),v=ctx.createGain(),launch=kind==='launch',impact=kind==='hit';o.type=impact?'sawtooth':launch||kind==='attack'?'triangle':'sine';o.frequency.setValueAtTime(notes[i],t);o.frequency.exponentialRampToValueAtTime(notes[i]*(impact ? .35 : launch?1.7:1),t+.16);v.gain.setValueAtTime(impact ? .025 : .035,t);v.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(v);v.connect(ctx.destination);o.start(t);o.stop(t+.22);o.onended=()=>{o.disconnect();v.disconnect()}}
 }catch{}
}
