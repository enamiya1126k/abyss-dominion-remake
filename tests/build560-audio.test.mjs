import test from 'node:test';
import assert from 'node:assert/strict';
import {AudioSystem} from '../src/core/AudioSystem.js';
import {environment,flush} from '../tools/build560/audio-fixture.mjs';

test('BGM play is synchronous in a gesture even when effect-context resume never settles',async()=>{
 const e=environment({resumePending:true,elementPermission:true});try{const a=new AudioSystem();const result=e.gesture(()=>a.unlock());assert.equal(e.created[0].plays,1);await result;await flush();assert(!a.current.paused)}finally{e.cleanup()}
});
test('touch release retries a rejected first pointerdown and never requires reloading',async()=>{
 const e=environment({denyFirst:true});try{const a=new AudioSystem();await a.unlock();await flush();assert(a.needsGesture);e.release();await flush();assert(!a.current.paused);assert(!a.needsGesture);assert.equal(e.created.length,1);assert.equal(e.created[0].plays,2)}finally{e.cleanup()}
});
test('one permitted element is reused for home, exploration, battle and all boss themes',async()=>{
 const e=environment({elementPermission:true});try{const a=new AudioSystem();await e.gesture(()=>a.unlock());await flush();for(const scene of ['explore','battle','boss','elite','abyss','divine','home']){a.scene=scene;assert(await a.switchTrack(scene,true));assert(!a.current.paused)}assert.equal(e.created.length,1)}finally{e.cleanup()}
});
test('same-track rendering, taps and volume changes never rewind playback',async()=>{
 const e=environment();try{const state={musicVolume:.4},a=new AudioSystem(()=>state);await a.unlock();await flush();a.current.currentTime=47;a.setScene('home');e.release();state.musicVolume=.7;a.applySettings();await flush();assert.equal(a.current.currentTime,47);assert.equal(a.current.volume,.7);assert.equal(e.created[0].plays,1)}finally{e.cleanup()}
});
test('hidden/blurred pages stop both channels and focus restoration resumes without rewinding',async()=>{
 const e=environment();try{const a=new AudioSystem();await a.unlock();await flush();a.current.currentTime=28;e.document.visibilityState='hidden';e.document.emit('visibilitychange');assert(a.current.paused);assert.equal(a.current.volume,0);e.release();assert(a.current.paused);e.document.visibilityState='visible';e.document.emit('visibilitychange');await flush();assert(!a.current.paused);assert.equal(a.current.currentTime,28);e.document.focused=false;e.window.emit('blur');assert(a.current.paused);e.document.focused=true;e.window.emit('focus');await flush();assert(!a.current.paused)}finally{e.cleanup()}
});
test('audio OFF stays OFF across user gestures and background recovery; enabled zero BGM stays silent',async()=>{
 const e=environment();try{const state={audioEnabled:false,musicVolume:.5},a=new AudioSystem(()=>state);await a.unlock();e.release();await flush();assert.equal(e.created.length,0);state.audioEnabled=true;await a.unlock();await flush();state.audioEnabled=false;a.applySettings();e.release();e.window.emit('focus');await flush();assert(a.current.paused);state.audioEnabled=true;state.musicVolume=0;a.applySettings();await flush();assert.equal(a.current.volume,0)}finally{e.cleanup()}
});
test('a late rejection from the old scene cannot cancel the newly selected track',async()=>{
 const e=environment();try{const a=new AudioSystem();await a.unlock();await flush();let rejectOld;a.current.pause();a.current.play=()=>new Promise((_,reject)=>rejectOld=reject);const old=a.switchTrack('home',true);a.current.play=()=>{a.current.paused=false;return Promise.resolve()};a.scene='battle';await a.switchTrack('battle',true);rejectOld(Object.assign(Error('Old source aborted'),{name:'AbortError'}));await old;assert(a.current.src.includes('battle-bgm'));assert(!a.current.paused);assert.equal(a.lastError,null)}finally{e.cleanup()}
});
test('destroy/recreate removes retry listeners and leaves exactly one audio owner',async()=>{
 const e=environment();try{const a=new AudioSystem();await a.unlock();await flush();const first=a.current,b=new AudioSystem();assert(first.paused);e.release();await flush();assert(b.current&&!b.current.paused);assert.equal(e.document.listeners.get('pointerup').length,1);b.destroy();assert.equal(e.document.listeners.get('pointerup').length,0);e.release();assert(first.paused)}finally{e.cleanup()}
});
test('interruption and failed automatic foreground resume recover on the next real touch',async()=>{
 const e=environment();try{const a=new AudioSystem();await a.unlock();await flush();const play=a.current.play.bind(a.current);a.pauseForPage();a.current.play=()=>Promise.reject(Object.assign(Error('Interrupted session'),{name:'NotAllowedError'}));await a.resumeForPage();assert(a.needsGesture);a.current.play=play;e.release();await flush();assert(!a.current.paused);assert(!a.needsGesture)}finally{e.cleanup()}
});
test('rapid settings/unlock calls share one pending play request',async()=>{
 const e=environment();try{const a=new AudioSystem();await a.unlock();await flush();let resolve;a.current.pause();let calls=0;a.current.play=()=>{calls++;return new Promise(r=>resolve=r)};const pending=a.switchTrack('home',true);a.applySettings();a.unlock();e.release();assert.equal(calls,1);resolve();await pending;}finally{e.cleanup()}
});
