// Called only by a fresh press or a direction change, never by the frame heartbeat.
export function feedback592(u,now=performance.now()){
 if(now-(u.feedbackAt592??-Infinity)<65)return;
 u.feedbackAt592=now;
 if(u.haptics592!==false)try{globalThis.navigator?.vibrate?.(8);}catch{}
 const a=u.audio;if(!u.sound||a?.state!=='running')return;
 try{const o=a.createOscillator(),v=a.createGain(),t=a.currentTime;
 o.type='sine';o.frequency.setValueAtTime(190,t);o.frequency.exponentialRampToValueAtTime(85,t+.018);
 v.gain.setValueAtTime(.018,t);v.gain.exponentialRampToValueAtTime(.0001,t+.022);
 o.connect(v);v.connect(a.destination);o.start(t);o.stop(t+.025);o.onended=()=>{o.disconnect();v.disconnect();};}catch{}
}
export function thumb592(x,y,rect,previous='neutral'){
 if(y<rect.top-65||y>rect.bottom+65||x<rect.left-70||x>rect.right+70)return 'neutral';
 const center=(rect.left+rect.right)/2;
 // Keep the current direction through a tiny centre band; no accidental stop.
 if(Math.abs(x-center)<9&&['left','right'].includes(previous))return previous;
 return x<center?'left':'right';
}
