const OWNER=Symbol.for('abyss-dominion.audio-owner');
export function audioRecoveryPanel561(state){
 const owner=typeof window!=='undefined'?window[OWNER]:null;
 const label=owner?.statusLabel?.()??(state.settings?.audioEnabled===false?'サウンドはOFFです。':Number(state.settings?.musicVolume)===0?'BGMの音量が0%です。':'音が出ないときは、再生し直してください。');
 return `<div class="settings-tutorial-v3"><span aria-hidden="true">♫</span><div><b>BGMの再生確認</b><small data-audio-state561 role="status">${label}</small></div><button type="button" data-audio-retry561>BGMを再生し直す</button></div>`;
}
export function updateAudioStatus561(system){
 const output=typeof document!=='undefined'&&document.querySelector?.('[data-audio-state561]');
 if(output)output.textContent=system.statusLabel();
}
export function bindAudioRecovery561(system){
 if(typeof document==='undefined')return()=>{};
 const click=event=>{if(event.isTrusted===false||!event.target?.closest?.('[data-audio-retry561]'))return;system.retryPlayback();updateAudioStatus561(system);};
 document.addEventListener('click',click);
 return()=>document.removeEventListener('click',click);
}
