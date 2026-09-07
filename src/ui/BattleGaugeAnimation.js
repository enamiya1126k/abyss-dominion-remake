// Only presentation is timed out. HP/MP and combat results are already committed.
export function runBattleGaugeAnimation({duration,isConnected,update,complete}){
 return new Promise((resolve,reject)=>{
  let done=false,frame=null,timer=null;const started=performance.now();
  const finish=()=>{if(done)return;done=true;clearTimeout(timer);if(frame!=null)cancelAnimationFrame(frame);try{complete();resolve()}catch(error){reject(error)}};
  const tick=now=>{if(done)return;try{if(!isConnected())return finish();const progress=Math.min(1,Math.max(0,(now-started)/Math.max(1,duration)));update(progress);if(progress>=1)return finish();frame=requestAnimationFrame(tick)}catch(error){done=true;clearTimeout(timer);reject(error)}};
  timer=setTimeout(finish,Math.max(1,duration)+1200);frame=requestAnimationFrame(tick);
 });
}
