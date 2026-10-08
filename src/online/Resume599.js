// Safari may leave a dead socket marked OPEN after returning from the Home screen.
// Probe the existing authenticated connection, then reconnect without backoff if
// it fails. Never clear the resume token or restart a superseded/manual session.
export function cancelResume599(c){
 const p=c.resumeProbe599;if(!p)return;
 clearTimeout(p.timer);p.socket.removeEventListener('message',p.reply);c.resumeProbe599=null;
}
export function ensureResume599(c){
 if((!c.mounted&&!c.backgroundActive)||c.manualClose||c.supersededConnection)return;
 c._refreshResumeTokenFromStorage();
 const socket=c.ws;
 if(!socket||![0,1].includes(socket.readyState)){
  cancelResume599(c);clearTimeout(c.reconnectTimer);c.reconnectTimer=null;c.connect({reconnect:true});return;
 }
 if(c.resumeProbe599?.socket===socket)return;
 cancelResume599(c);
 const p={socket,reply:()=>{if(c.ws===socket)cancelResume599(c);},timer:null};c.resumeProbe599=p;
 socket.addEventListener('message',p.reply);
 p.timer=setTimeout(()=>{
  if(c.resumeProbe599!==p)return;cancelResume599(c);
  if(c.ws!==socket||c.manualClose||c.supersededConnection||globalThis.document?.hidden)return;
  c._handleClose(socket,{code:1006});
  clearTimeout(c.reconnectTimer);c.reconnectTimer=null;c.connect({reconnect:true});
  try{socket.close(1012,'foreground connection refresh');}catch{}
 },socket.readyState===1&&c.connectionReady?1200:3000);
 p.timer.unref?.();
 if(socket.readyState===1&&c.connectionReady)c._send('ping');
}
