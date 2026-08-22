import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";

const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>readFileSync(join(root,file),"utf8");
const css=read("src/Styles/build202.css"),main=read("src/main.js"),audioSource=read("src/core/AudioSystem.js"),index=read("index.html"),config=read("src/core/config.js");

assert.match(css,/\.battle-screen\.side-battle-v2 \.side-unit-sprite\{bottom:60px!important\}/);
assert.match(css,/\.floor-boss-enemy \.side-unit-sprite\{bottom:60px!important\}/);
assert.match(css,/\.formation-slot-4\{transform:translateY\(4%\)!important\}/);
assert.match(css,/padding-bottom:20px!important/);
assert.match(css,/\.side-unit-card\{bottom:10px!important\}/);
assert.match(main,/if\(!battle\)audio\.setScene\(\["explore","gauntlet"\]\.includes\(screen\)\?"explore":"home"\)/);
assert.match(audioSource,/Symbol\.for\("abyss-dominion\.audio-owner"\)/);
assert.match(audioSource,/if\(track!==next\)\{track\.pause\(\);track\.volume=0;track\.currentTime=0\}/);
assert.match(audioSource,/document\.addEventListener\("freeze",this\.onFreeze/);
assert.match(index,/build202\.css\?v=2\.11\.37-build202/);
assert.match(index,/const ASSET_BUILD = "build20[23]"/);
assert.match(config,/APP_VERSION="2\.11\.(?:37|38)"/);

class FakeEvents{
 constructor(){this.listeners=new Map()}
 addEventListener(type,listener){const list=this.listeners.get(type)??new Set();list.add(listener);this.listeners.set(type,list)}
 removeEventListener(type,listener){this.listeners.get(type)?.delete(listener)}
 dispatch(type){for(const listener of this.listeners.get(type)??[])listener({type})}
}
class FakeAudio{
 static instances=[];
 constructor(src){this.src=src;this.paused=true;this.volume=0;this.currentTime=0;FakeAudio.instances.push(this)}
 play(){this.paused=false;return Promise.resolve()}
 pause(){this.paused=true}
}

const fakeDocument=new FakeEvents();fakeDocument.visibilityState="visible";fakeDocument.hasFocus=()=>true;
const fakeWindow=new FakeEvents();
globalThis.document=fakeDocument;globalThis.window=fakeWindow;globalThis.Audio=FakeAudio;
const {AudioSystem}=await import(`../src/core/AudioSystem.js?build202-test=${Date.now()}`);
const settings=()=>({audioEnabled:true,musicVolume:.28,sfxVolume:.45});
const first=new AudioSystem(settings);first.unlocked=true;
await first.switchTrack("home",true);await first.switchTrack("battle",true);
assert.equal(FakeAudio.instances.filter(track=>!track.paused).length,1,"only the active BGM may play");
assert.match(FakeAudio.instances.find(track=>!track.paused)?.src??"",/battle-bgm\.mp3/);
fakeDocument.visibilityState="hidden";fakeDocument.dispatch("visibilitychange");
assert.equal(FakeAudio.instances.filter(track=>!track.paused).length,0,"hidden Safari page must be silent");
fakeDocument.visibilityState="visible";await first.resumeForPage();
assert.equal(FakeAudio.instances.filter(track=>!track.paused).length,1,"returning to the page resumes only the current scene");
const second=new AudioSystem(settings);
assert.equal(FakeAudio.instances.filter(track=>!track.paused).length,0,"a replacement owner must silence the old owner");
second.destroy();

console.log("build202 battle layout/audio regression: PASS (safe inset + single BGM owner)");
