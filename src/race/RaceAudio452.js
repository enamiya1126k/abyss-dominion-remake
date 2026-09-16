// Reuses the game's single audio context and master SFX gain. No music owner.
export class RaceAudio452{
 constructor(client){this.client=client;this.nodes=new Set();try{this.muted=sessionStorage.getItem('abyss-race-sfx452')==='off'}catch{this.muted=false}}
 engine(){return this.client.audio??globalThis[Symbol.for('abyss-dominion.audio-owner')]}
 enabled(){return !this.muted&&this.client.save.state.settings?.audioEnabled!==false}
 unlock(){if(this.enabled())this.engine()?.unlock?.()}
 toggle(){this.muted=!this.muted;try{sessionStorage.setItem('abyss-race-sfx452',this.muted?'off':'on')}catch{}if(this.muted)this.stop();else this.unlock()}
 tone(frequency,delay=.0,duration=.12,volume=.035,type='sine',end=null){const e=this.engine(),ctx=e?.context;if(!this.client.root||!this.enabled()||!ctx||ctx.state!=='running'||!e.sfxGain||e.pageIsActive?.()===false||document.visibilityState==='hidden')return;try{const start=ctx.currentTime+delay,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,start);if(end)osc.frequency.exponentialRampToValueAtTime(end,start+duration);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);osc.connect(gain);gain.connect(e.sfxGain);this.nodes.add(osc);osc.onended=()=>{this.nodes.delete(osc);osc.disconnect();gain.disconnect()};osc.start(start);osc.stop(start+duration+.03)}catch{}}
 play(kind){if(!this.enabled())return;switch(kind){
 case'parade':this.tone(523,0,.15,.025,'triangle');this.tone(784,.07,.24,.018);break;
 case'count':this.tone(440,0,.1,.045);this.tone(220,0,.13,.018,'triangle');break;
 case'start':[523,659,784,1047].forEach((f,i)=>this.tone(f,i*.08,.25,.035,'triangle'));this.tone(140,0,.23,.06,'sine',45);break;
 case'spurt':[392,523,659].forEach((f,i)=>this.tone(f,i*.075,.16,.025,'triangle'));break;
 case'step':this.tone(150,0,.07,.013,'sine',55);this.tone(180,.12,.06,.009,'sine',65);break;
 case'finish':[784,988,1175].forEach((f,i)=>this.tone(f,i*.085,.25,.025,'triangle'));break;
 case'cash':this.tone(1047,0,.09,.02);this.tone(1568,.075,.14,.012);break;
 case'reveal':this.tone(220,0,.1,.025,'triangle');break;
 case'win':[523,659,784,1047,784,1047].forEach((f,i)=>this.tone(f,i*.12,.32,.022,'triangle'));break;
 }}
 stop(){for(const node of this.nodes)try{node.stop()}catch{}this.nodes.clear()}
}
