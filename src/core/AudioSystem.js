const TRACKS=Object.freeze({
 home:"assets/audio/main-bgm.mp3",explore:"assets/audio/dungeon-bgm.mp3",battle:"assets/audio/battle-bgm.mp3",
 boss:"assets/audio/boss-bgm.mp3",elite:"assets/audio/elite-bgm.mp3",abyss:"assets/audio/abyss-bgm.mp3",divine:"assets/audio/ten-gods-bgm.mp3",
 victory:"assets/audio/main-bgm.mp3",defeat:"assets/audio/dungeon-bgm.mp3"
});
function safeVolume(value,fallback){const number=Number(value);return Number.isFinite(number)?Math.max(0,Math.min(1,number)):fallback}

/** One owner for every BGM track. A hidden/unfocused document is always silent. */
export class AudioSystem{
 constructor(settings=()=>({})){
  this.settings=settings;this.scene="home";this.context=null;this.sfxGain=null;this.unlocked=false;this.current=null;this.fadeToken=0;this.cache=new Map();this.suspendedByPage=false;
  this.onVisibility=()=>{if(this.pageIsActive())this.resumeForPage();else this.pauseForPage()};
  if(typeof document!=="undefined")document.addEventListener("visibilitychange",this.onVisibility,{passive:true});
  if(typeof window!=="undefined"){
   window.addEventListener("pagehide",()=>this.pauseForPage(),{passive:true});
   window.addEventListener("pageshow",()=>this.onVisibility(),{passive:true});
   window.addEventListener("blur",()=>this.pauseForPage(),{passive:true});
   window.addEventListener("focus",()=>this.onVisibility(),{passive:true});
  }
 }
 pageIsActive(){return typeof document==="undefined"||document.visibilityState==="visible"&&(!document.hasFocus||document.hasFocus())}
 track(scene){
  const src=TRACKS[scene]??TRACKS.home;
  if(this.cache.has(src))return this.cache.get(src);
  const audio=new Audio(`${src}?v=2.9.0`);audio.loop=true;audio.preload="metadata";audio.playsInline=true;audio.volume=0;
  this.cache.set(src,audio);return audio;
 }
 async unlock(){
  if(typeof window==="undefined")return false;
  if(!this.context){const Context=window.AudioContext??window.webkitAudioContext;if(Context){try{this.context=new Context();this.sfxGain=this.context.createGain();this.sfxGain.connect(this.context.destination)}catch(_error){this.context=null}}}
  try{await this.context?.resume?.()}catch(_error){}
  this.unlocked=true;this.applySettings();if(this.pageIsActive())await this.switchTrack(this.scene,true);return true;
 }
 applySettings(){
  const state=this.settings()??{},enabled=state.audioEnabled!==false,volume=enabled?safeVolume(state.musicVolume,.28):0;
  if(this.sfxGain){const now=this.context?.currentTime??0;this.sfxGain.gain.setTargetAtTime(enabled?safeVolume(state.sfxVolume,.45):0,now,.04)}
  if(this.current)this.current.volume=volume;
  if(!enabled)this.stopAll(false);else if(this.unlocked&&this.pageIsActive()&&!this.suspendedByPage)this.switchTrack(this.scene,true);
 }
 setScene(scene){
  if(!TRACKS[scene])scene="home";
  const changed=this.scene!==scene;this.scene=scene;
  if(!this.unlocked||!this.pageIsActive()||this.settings()?.audioEnabled===false)return;
  if(changed||!this.current||this.current.paused)this.switchTrack(scene,!changed);
 }
 async switchTrack(scene,immediate=false){
  if(!this.unlocked||!this.pageIsActive()||this.settings()?.audioEnabled===false)return;
  this.suspendedByPage=false;
  const next=this.track(scene),target=safeVolume(this.settings()?.musicVolume,.28),previous=this.current,token=++this.fadeToken;
  this.cache.forEach(track=>{if(track!==previous&&track!==next){track.pause();track.currentTime=0}});
  if(previous===next){this.current=next;next.volume=target;try{if(next.paused)await next.play()}catch(_error){}return}
  this.current=next;next.volume=0;try{next.currentTime=0;await next.play()}catch(_error){return}
  const steps=immediate?1:10,delay=immediate?0:32;
  for(let i=1;i<=steps;i++){
   if(token!==this.fadeToken||!this.pageIsActive())return;
   next.volume=Math.min(1,target*i/steps);if(previous)previous.volume=Math.max(0,target*(1-i/steps));
   if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
  }
  if(previous){previous.pause();previous.currentTime=0}
 }
 pauseForPage(){
  this.suspendedByPage=true;++this.fadeToken;this.cache.forEach(track=>track.pause());
  try{this.context?.suspend?.()}catch(_error){}
 }
 async resumeForPage(){
  if(!this.suspendedByPage||!this.unlocked||this.settings()?.audioEnabled===false||!this.pageIsActive())return;
  this.suspendedByPage=false;try{await this.context?.resume?.()}catch(_error){}await this.switchTrack(this.scene,true);
 }
 stopAll(reset=true){
  ++this.fadeToken;this.cache.forEach(track=>{track.pause();track.volume=0;if(reset)track.currentTime=0});if(reset)this.current=null;
 }
 sfx(kind="select"){
  if(!this.pageIsActive()||!this.context||!this.sfxGain||this.settings()?.audioEnabled===false)return;
  const now=this.context.currentTime;
  if(kind==="abyssReveal"||kind==="divineReveal"){
   const divine=kind==="divineReveal",frequencies=divine?[65.41,261.63,392,523.25]:[65.41,73.42,98,130.81];
   frequencies.forEach((frequency,index)=>{const osc=this.context.createOscillator(),amp=this.context.createGain(),start=now+index*.075,duration=divine?1.05:.82;osc.type=divine?(index?"triangle":"sine"):(index%2?"sawtooth":"square");osc.frequency.setValueAtTime(frequency,start);osc.frequency.exponentialRampToValueAtTime(divine?frequency*1.5:Math.max(28,frequency*.52),start+duration);amp.gain.setValueAtTime(.0001,start);amp.gain.exponentialRampToValueAtTime(divine?.075:.062,start+.035);amp.gain.exponentialRampToValueAtTime(.0001,start+duration);osc.connect(amp);amp.connect(this.sfxGain);osc.start(start);osc.stop(start+duration+.03)});return;
  }
  const table={select:[392,.08,"sine"],attack:[130.81,.12,"square"],hit:[82.41,.16,"sawtooth"],heal:[523.25,.26,"sine"],boss:[65.41,.5,"sawtooth"],victory:[659.25,.4,"triangle"],defeat:[73.42,.5,"sine"]},[frequency,duration,wave]=table[kind]??table.select,osc=this.context.createOscillator(),amp=this.context.createGain();osc.type=wave;osc.frequency.setValueAtTime(frequency,now);if(kind==="hit")osc.frequency.exponentialRampToValueAtTime(Math.max(30,frequency*.45),now+duration);amp.gain.setValueAtTime(.08,now);amp.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.connect(amp);amp.connect(this.sfxGain);osc.start(now);osc.stop(now+duration+.02);
 }
}
