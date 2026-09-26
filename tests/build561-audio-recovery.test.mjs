import test from 'node:test';
import assert from 'node:assert/strict';
import {AudioSystem} from '../src/core/AudioSystem.js';
import {environment,flush} from '../tools/build560/audio-fixture.mjs';

test('a media error clears a hung play and the next touch reloads the failed source',async()=>{
 const e=environment();try{
  const system=new AudioSystem();await system.unlock();await flush();let loads=0;
  system.current.pause();system.current.play=()=>new Promise(()=>{});system.switchTrack('home',true);assert(system.pendingPlay);
  system.current.error={code:2};system.current.emit('error');assert.equal(system.pendingPlay,null);assert.match(system.statusLabel(),/読み込みに失敗/);
  system.current.load=()=>{loads++;system.current.error=null};system.current.play=()=>{system.current.paused=false;return Promise.resolve()};
  e.release();await flush();assert.equal(loads,1);assert.equal(system.needsGesture,false);assert.equal(system.current.paused,false);assert.equal(system.current.crossOrigin,'anonymous');
 }finally{e.cleanup()}
});
test('explicit replay cancels a stuck attempt but cannot override OFF or zero music volume',async()=>{
 const e=environment();try{
  const settings={audioEnabled:true,musicVolume:.28},system=new AudioSystem(()=>settings);await system.unlock();await flush();let loads=0;
  system.current.load=()=>{loads++;system.current.error=null};system.current.pause();system.current.play=()=>new Promise(()=>{});system.switchTrack('home',true);
  system.current.play=()=>{system.current.paused=false;return Promise.resolve()};await system.retryPlayback();await flush();assert.equal(loads,1);assert.equal(system.current.paused,false);
  settings.audioEnabled=false;system.applySettings();await system.retryPlayback();assert.equal(loads,1);assert.equal(system.current.paused,true);assert.match(system.statusLabel(),/OFF/);
  settings.audioEnabled=true;settings.musicVolume=0;await system.retryPlayback();assert.equal(loads,1);assert.equal(system.current.paused,true);assert.match(system.statusLabel(),/0%/);
 }finally{e.cleanup()}
});
