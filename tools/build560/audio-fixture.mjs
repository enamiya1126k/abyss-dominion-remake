export class Events{
 constructor(){this.listeners=new Map()}
 addEventListener(type,fn,options={}){const list=this.listeners.get(type)??[];list.push({fn,once:options?.once});this.listeners.set(type,list)}
 removeEventListener(type,fn){this.listeners.set(type,(this.listeners.get(type)??[]).filter(x=>x.fn!==fn))}
 emit(type,event={}){for(const item of [...(this.listeners.get(type)??[])]){item.fn({isTrusted:true,...event});if(item.once)this.removeEventListener(type,item.fn)}}
}
export function environment({resumePending=false,denyFirst=false,elementPermission=false}={}){
 const document=new Events(),window=new Events(),created=[],contexts=[];document.visibilityState='visible';document.focused=true;document.hasFocus=()=>document.focused;let gesture=false,denied=false,blocked=false;
 class Audio extends Events{
  constructor(src=''){super();this.src=src;this.paused=true;this.currentTime=0;this.volume=1;this.plays=0;this.permitted=false;created.push(this)}
  play(){this.plays++;if(blocked||denyFirst&&!denied||elementPermission&&!this.permitted&&!gesture){denied=true;return Promise.reject(Object.assign(Error('User gesture required'),{name:'NotAllowedError'}))}this.permitted=true;this.paused=false;return Promise.resolve()}
  pause(){this.paused=true}
 }
 class Context extends Events{
  constructor(){super();this.state='suspended';this.currentTime=0;this.destination={};contexts.push(this)}
  createGain(){return{gain:{value:0,setTargetAtTime(v){this.value=v}},connect(){}}}
  resume(){if(resumePending)return new Promise(()=>{});this.state='running';return Promise.resolve()}
  suspend(){this.state='suspended';return Promise.resolve()}
  close(){this.state='closed';return Promise.resolve()}
 }
 window.AudioContext=Context;
 Object.assign(globalThis,{window,document,Audio});
 return{document,window,created,contexts,setBlocked(value){blocked=value},gesture(fn){gesture=true;const result=fn();gesture=false;return result},release(){gesture=true;document.emit('pointerup');document.emit('touchend');gesture=false},cleanup(){window[Symbol.for('abyss-dominion.audio-owner')]?.destroy();delete globalThis.window;delete globalThis.document;delete globalThis.Audio}};
}
export const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve()};
