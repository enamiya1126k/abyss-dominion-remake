/* Original procedural score: no external audio files or third-party samples. */
const NOTE={C2:65.41,D2:73.42,E2:82.41,F2:87.31,G2:98,A2:110,B2:123.47,C3:130.81,D3:146.83,E3:164.81,F3:174.61,G3:196,A3:220,B3:246.94,C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392,A4:440,B4:493.88};
const SCENES={
 home:{tempo:440,wave:"triangle",gain:.09,notes:["C3","G3","E3","G3","D3","A3","F3","G3"]},
 explore:{tempo:360,wave:"sine",gain:.075,notes:["A2",null,"E3","C3","G2",null,"D3","E3"]},
 battle:{tempo:225,wave:"sawtooth",gain:.065,notes:["C3","C3","G3","F3","C3","A3","G3","D3"]},
 abyss:{tempo:300,wave:"sawtooth",gain:.058,notes:["C2",null,"D2","C2","A2",null,"F2","D2"]},
 divine:{tempo:330,wave:"triangle",gain:.075,notes:["C3","G3","C4","B3","E3","G3","D4","C4"]},
 victory:{tempo:240,wave:"triangle",gain:.095,notes:["C3","E3","G3","C4","G3","C4",null,null]},
 defeat:{tempo:520,wave:"sine",gain:.07,notes:["A2","F2","D2",null,"C2",null,null,null]}
};
function safeVolume(value,fallback){const number=Number(value);return Number.isFinite(number)?Math.max(0,Math.min(1,number)):fallback}
export class AudioSystem{
 constructor(settings=()=>({})){this.settings=settings;this.scene="home";this.step=0;this.context=null;this.timer=null;this.musicGain=null;this.sfxGain=null;this.unlocked=false}
 async unlock(){
  if(this.unlocked)return true;if(typeof window==="undefined")return false;const Context=window.AudioContext??window.webkitAudioContext;if(!Context)return false;
  try{this.context=new Context();this.musicGain=this.context.createGain();this.sfxGain=this.context.createGain();this.musicGain.connect(this.context.destination);this.sfxGain.connect(this.context.destination);this.unlocked=true;await this.context.resume();this.applySettings();this.startClock();return true}catch(_error){this.unlocked=false;return false}
 }
 applySettings(){const state=this.settings()??{},enabled=state.audioEnabled!==false,now=this.context?.currentTime??0;if(this.musicGain)this.musicGain.gain.setTargetAtTime(enabled?safeVolume(state.musicVolume,.28):0,now,.04);if(this.sfxGain)this.sfxGain.gain.setTargetAtTime(enabled?safeVolume(state.sfxVolume,.45):0,now,.04)}
 setScene(scene){if(!SCENES[scene])scene="home";if(this.scene!==scene){this.scene=scene;this.step=0}this.applySettings()}
 startClock(){if(this.timer)return;let last=0;this.timer=window.setInterval(()=>{if(!this.context||this.context.state!=="running"||document.hidden)return;const config=SCENES[this.scene]??SCENES.home,now=performance.now();if(now-last<config.tempo-15)return;last=now;const key=config.notes[this.step%config.notes.length];if(key)this.note(NOTE[key],Math.min(.65,config.tempo/700),config.wave,config.gain);if(["battle","abyss"].includes(this.scene)&&this.step%2===0)this.percussion(this.scene==="abyss"?.035:.05);this.step++},90)}
 note(frequency,duration=.3,wave="sine",gain=.06){if(!this.context||this.settings()?.audioEnabled===false)return;const now=this.context.currentTime,osc=this.context.createOscillator(),amp=this.context.createGain();osc.type=wave;osc.frequency.setValueAtTime(frequency,now);amp.gain.setValueAtTime(.0001,now);amp.gain.exponentialRampToValueAtTime(Math.max(.001,gain),now+.02);amp.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.connect(amp);amp.connect(this.musicGain);osc.start(now);osc.stop(now+duration+.04)}
 percussion(gain=.04){if(!this.context||this.settings()?.audioEnabled===false)return;const length=Math.floor(this.context.sampleRate*.055),buffer=this.context.createBuffer(1,length,this.context.sampleRate),data=buffer.getChannelData(0);for(let index=0;index<length;index++)data[index]=(Math.random()*2-1)*(1-index/length);const source=this.context.createBufferSource(),filter=this.context.createBiquadFilter(),amp=this.context.createGain();filter.type="lowpass";filter.frequency.value=180;amp.gain.value=gain;source.buffer=buffer;source.connect(filter);filter.connect(amp);amp.connect(this.musicGain);source.start()}
 sfx(kind="select"){
  if(!this.context||this.settings()?.audioEnabled===false)return;const table={select:[392,.08,"sine"],attack:[130.81,.12,"square"],hit:[82.41,.16,"sawtooth"],heal:[523.25,.26,"sine"],boss:[65.41,.5,"sawtooth"],victory:[659.25,.4,"triangle"],defeat:[73.42,.5,"sine"]},[frequency,duration,wave]=table[kind]??table.select,now=this.context.currentTime,osc=this.context.createOscillator(),amp=this.context.createGain();osc.type=wave;osc.frequency.setValueAtTime(frequency,now);if(kind==="hit")osc.frequency.exponentialRampToValueAtTime(Math.max(30,frequency*.45),now+duration);amp.gain.setValueAtTime(.08,now);amp.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.connect(amp);amp.connect(this.sfxGain);osc.start(now);osc.stop(now+duration+.02)
 }
}

