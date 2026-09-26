import {bindAudioRecovery561,updateAudioStatus561} from './AudioRecovery561.js?v=3.1.240-build561';
const TRACKS=Object.freeze({
 home:"assets/audio/main-bgm.mp3",explore:"assets/audio/dungeon-bgm.mp3",battle:"assets/audio/battle-bgm.mp3",
 boss:"assets/audio/boss-bgm.mp3",elite:"assets/audio/elite-bgm.mp3",abyss:"assets/audio/abyss-bgm.mp3",divine:"assets/audio/ten-gods-bgm.mp3",
 victory:"assets/audio/main-bgm.mp3",defeat:"assets/audio/dungeon-bgm.mp3"
});
const AUDIO_OWNER_KEY=Symbol.for("abyss-dominion.audio-owner");
const GESTURES=["pointerup","touchend","keydown"];
function safeVolume(value,fallback){const number=Number(value);return Number.isFinite(number)?Math.max(0,Math.min(1,number)):fallback}
function ignoreRejection(promise){promise?.catch?.(()=>{})}

/** One media element keeps its playback permission when scenes change. */
export class AudioSystem{
 constructor(settings=()=>({})){
  this.settings=settings;this.scene="home";this.context=null;this.sfxGain=null;this.unlocked=false;this.current=null;this.fadeToken=0;this.cache=new Map();this.suspendedByPage=false;
  this.music=null;this.trackSource=null;this.pendingPlay=null;this.needsGesture=false;this.lastError=null;this.destroyed=false;
  this.onVisibility=()=>{if(this.pageIsActive())this.resumeForPage();else this.pauseForPage()};
  this.onPageHide=()=>this.pauseForPage();this.onPageShow=()=>this.onVisibility();this.onBlur=()=>this.pauseForPage();this.onFocus=()=>this.onVisibility();this.onFreeze=()=>this.pauseForPage();
  this.onUserGesture=event=>{
   if(event?.isTrusted===false||event?.repeat||!this.pageIsActive()||this.settings()?.audioEnabled===false)return;
   if(!this.unlocked||this.needsGesture||!this.current||this.current.paused||this.context?.state!=="running")this.unlock();
  };
  this.onContextState=()=>{
   if(this.destroyed||!this.unlocked)return;
   if(this.context?.state==="running"&&this.pageIsActive()&&!this.suspendedByPage)this.switchTrack(this.scene,true);
   else if(this.context?.state==="interrupted"||this.context?.state==="suspended")this.needsGesture=true;
  };
  if(typeof window!=="undefined"){const previous=window[AUDIO_OWNER_KEY];if(previous&&previous!==this)previous.destroy?.();window[AUDIO_OWNER_KEY]=this}
  this.removeRecoveryUI=bindAudioRecovery561(this);
  if(typeof document!=="undefined"){
   document.addEventListener("visibilitychange",this.onVisibility,{passive:true});document.addEventListener("freeze",this.onFreeze,{passive:true});
   // Touch release is a playback gesture on mobile. Keep recovery available after
   // the main application's one-shot pointerdown listener has already fired.
   for(const name of GESTURES)document.addEventListener(name,this.onUserGesture,{passive:true,capture:true});
  }
  if(typeof window!=="undefined"){
   window.addEventListener("pagehide",this.onPageHide,{passive:true});window.addEventListener("beforeunload",this.onPageHide,{passive:true});
   window.addEventListener("pageshow",this.onPageShow,{passive:true});window.addEventListener("blur",this.onBlur,{passive:true});window.addEventListener("focus",this.onFocus,{passive:true});
  }
 }
 pageIsActive(){return !this.destroyed&&(typeof document==="undefined"||document.visibilityState==="visible"&&(!document.hasFocus||document.hasFocus()))}
 enabled(){return this.settings()?.audioEnabled!==false}
 track(scene){
  const src=TRACKS[scene]??TRACKS.home;
  if(!this.music){
   this.music=new Audio();this.music.crossOrigin="anonymous";this.music.loop=true;this.music.preload="metadata";this.music.playsInline=true;this.music.volume=0;
   this.onMediaError=()=>{++this.fadeToken;this.pendingPlay=null;this.needsGesture=true;this.lastError={name:"MediaError",code:this.music.error?.code??0,source:this.trackSource};updateAudioStatus561(this);};
   this.music.addEventListener("error",this.onMediaError);
   this.onMediaStatus=()=>updateAudioStatus561(this);
   for(const name of ["playing","pause","waiting","loadstart"])this.music.addEventListener(name,this.onMediaStatus);
  }
  if(this.trackSource!==src){
   this.music.pause();this.music.src=`${src}?v=2.11.2-build166`;this.trackSource=src;
   this.cache.clear();this.cache.set(src,this.music);
  }
  return this.music;
 }
 resumeContext(){
  if(!this.context||this.context.state==="closed"){
   const Context=typeof window!=="undefined"&&(window.AudioContext??window.webkitAudioContext);
   if(Context)try{
    this.context?.removeEventListener?.("statechange",this.onContextState);
    this.context=new Context();this.sfxGain=this.context.createGain();this.sfxGain.connect(this.context.destination);
    this.context.addEventListener?.("statechange",this.onContextState);
   }catch(_error){this.context=null;this.sfxGain=null}
  }
  // An interrupted effect context may leave resume() pending. BGM must not wait
  // for that independent promise, or leave the synchronous user gesture.
  if(this.context?.state!=="running")try{ignoreRejection(this.context?.resume?.())}catch(_error){}
 }
 updateGain(){
  const state=this.settings()??{},enabled=this.enabled();
  if(this.sfxGain)try{this.sfxGain.gain.setTargetAtTime(enabled?safeVolume(state.sfxVolume,.45):0,this.context?.currentTime??0,.04)}catch(_error){}
  if(this.current)this.current.volume=enabled?safeVolume(state.musicVolume,.28):0;
 }
 unlock(){
  if(typeof window==="undefined"||this.destroyed)return Promise.resolve(false);
  if(!this.enabled()){this.applySettings();return Promise.resolve(false)}
  this.unlocked=true;this.resumeContext();this.updateGain();
  // Start play() here, before any await. The returned promise never holds up the
  // settings UI, even if the OS postpones starting an audio session.
  if(this.pageIsActive())this.switchTrack(this.scene,true);
  return Promise.resolve(true);
 }
 applySettings(){
  if(this.destroyed)return;
  this.updateGain();
  if(!this.enabled())this.stopAll(false);
  else if(this.unlocked&&this.pageIsActive()&&!this.suspendedByPage)this.switchTrack(this.scene,true);
  updateAudioStatus561(this);
 }
 setScene(scene){
  if(!TRACKS[scene])scene="home";
  const changed=this.scene!==scene;this.scene=scene;
  if(!this.unlocked||!this.pageIsActive()||!this.enabled())return;
  if(changed||!this.current||this.current.paused||this.needsGesture)this.switchTrack(scene,!changed);
 }
 switchTrack(scene,immediate=false){
  if(!this.unlocked||!this.pageIsActive()||!this.enabled())return Promise.resolve(false);
  const source=TRACKS[scene]??TRACKS.home;
  if(this.pendingPlay?.source===source&&!this.music?.error)return this.pendingPlay.promise;
  const changed=this.trackSource!==source,next=this.track(scene),token=++this.fadeToken;
  this.suspendedByPage=false;this.current=next;
  // play() alone cannot recover a media element left in a network-error state.
  if(next.error)next.load();
  const target=safeVolume(this.settings()?.musicVolume,.28);
  next.volume=immediate||!changed?target:0;
  const pending={source,token,promise:null};this.pendingPlay=pending;
  let request;
  try{request=next.paused?next.play():Promise.resolve()}catch(error){request=Promise.reject(error)}
  pending.promise=Promise.resolve(request).then(async()=>{
   if(token!==this.fadeToken||!this.pageIsActive()||this.suspendedByPage||!this.enabled())return false;
   this.needsGesture=false;this.lastError=null;
   const steps=immediate||!changed?1:10;
   for(let i=1;i<=steps;i++){
    if(token!==this.fadeToken||!this.pageIsActive()||this.suspendedByPage||!this.enabled())return false;
    next.volume=safeVolume(this.settings()?.musicVolume,.28)*i/steps;
    if(steps>1)await new Promise(resolve=>setTimeout(resolve,32));
   }
   return true;
  },error=>{
   if(token===this.fadeToken&&!this.destroyed){this.needsGesture=true;this.lastError={name:error?.name??"PlaybackError",message:String(error?.message??error),source};}
   return false;
  }).finally(()=>{if(this.pendingPlay===pending)this.pendingPlay=null;updateAudioStatus561(this)});
  return pending.promise;
 }
 statusLabel(){
  if(!this.enabled())return 'サウンドはOFFです。';
  if(safeVolume(this.settings()?.musicVolume,.28)===0)return 'BGMの音量が0%です。';
  if(this.current?.error)return '音源の読み込みに失敗しました。再生し直してください。';
  if(this.lastError?.name==='NotAllowedError')return '再生ボタンを押して音楽を開始してください。';
  if(this.current&&!this.current.paused&&this.current.readyState>=3)return 'BGMを再生中です。';
  if(this.pendingPlay)return '音楽を読み込んでいます…';
  return 'BGMは停止中です。再生ボタンで再開できます。';
 }
 retryPlayback(){
  if(!this.enabled()||safeVolume(this.settings()?.musicVolume,.28)===0){updateAudioStatus561(this);return Promise.resolve(false)}
  // Explicit recovery reloads only this track, not the page or the save.
  ++this.fadeToken;this.pendingPlay=null;this.lastError=null;
  this.music?.pause();this.music?.load();
  return this.unlock();
 }
 pauseForPage(){
  this.suspendedByPage=true;++this.fadeToken;this.pendingPlay=null;
  this.cache.forEach(track=>{track.pause();track.volume=0});
  try{ignoreRejection(this.context?.suspend?.())}catch(_error){}
 }
 resumeForPage(){
  if(!this.unlocked||!this.enabled()||!this.pageIsActive())return Promise.resolve(false);
  this.resumeContext();this.updateGain();return this.switchTrack(this.scene,true);
 }
 stopAll(reset=true){
  ++this.fadeToken;this.pendingPlay=null;
  this.cache.forEach(track=>{track.pause();track.volume=0;if(reset)try{track.currentTime=0}catch(_error){}});
  if(reset)this.current=null;
 }
 destroy(){
  this.destroyed=true;this.stopAll(true);this.unlocked=false;
  this.removeRecoveryUI?.();
  if(typeof document!=="undefined"){
   document.removeEventListener("visibilitychange",this.onVisibility);document.removeEventListener("freeze",this.onFreeze);
   for(const name of GESTURES)document.removeEventListener(name,this.onUserGesture,true);
  }
  if(typeof window!=="undefined"){window.removeEventListener("pagehide",this.onPageHide);window.removeEventListener("beforeunload",this.onPageHide);window.removeEventListener("pageshow",this.onPageShow);window.removeEventListener("blur",this.onBlur);window.removeEventListener("focus",this.onFocus);if(window[AUDIO_OWNER_KEY]===this)delete window[AUDIO_OWNER_KEY]}
  this.music?.removeEventListener("error",this.onMediaError);this.context?.removeEventListener?.("statechange",this.onContextState);
  for(const name of ["playing","pause","waiting","loadstart"])this.music?.removeEventListener(name,this.onMediaStatus);
  try{ignoreRejection(this.context?.close?.())}catch(_error){}
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
