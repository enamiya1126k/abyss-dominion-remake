import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
import {AudioSystem as Fixed} from '../../src/core/AudioSystem.js';
import {environment,flush} from './audio-fixture.mjs';
const {AudioSystem:Original}=await import(pathToFileURL(process.cwd()+'/../baseline559/src/core/AudioSystem.js'));
const report={};
for(const [name,Class]of [['deployedBuild559',Original],['fixedBuild560',Fixed]]){
 report[name]={};let e=environment({resumePending:true});try{const a=new Class();a.unlock();await flush();report[name].pendingEffectResume={bgmPlayCalls:e.created.reduce((n,a)=>n+a.plays,0),unlocked:a.unlocked};}finally{e.cleanup()}
 e=environment();e.setBlocked(true);try{const a=new Class();e.document.addEventListener('pointerdown',()=>a.unlock(),{once:true,passive:true});e.document.emit('pointerdown');await flush();e.setBlocked(false);e.document.emit('pointerdown');e.release();await flush();report[name].rejectedFirstTouch={playCalls:e.created.reduce((n,a)=>n+a.plays,0),playing:!!a.current&&!a.current.paused};}finally{e.cleanup()}
 e=environment({elementPermission:true});try{const a=new Class();e.gesture(()=>a.unlock());await flush();a.scene='battle';await a.switchTrack('battle',true);report[name].perElementPermission={elements:e.created.length,playing:!!a.current&&!a.current.paused};}finally{e.cleanup()}
}
await writeFile('docs/build560/reproduction.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
