import test from 'node:test';
import assert from 'node:assert/strict';
import {presence599} from '../../src/runners587/Resume599.js';
import {ensureResume599,cancelResume599} from '../../src/online/Resume599.js';
import {room} from './wire-fixture.mjs';
function client(f){let connected=true,calls=0,drop=false;const c={transport:{selfId:'p0',ws:{}},state:{runners:null},runnersUI587:{seq:0},connected:()=>connected,ready:()=>connected,raw:(op,m)=>{calls++;return drop?true:f.dispatch('p0',{op,...m});}};const snapshot=()=>c.state.runners=f.a.snapshot(f.c,f.saved(),'p0');snapshot();return{c,snapshot,get calls(){return calls;},connect:v=>connected=v,drop:v=>drop=v};}
test('foreground resume sent before reconnection is retried after connection and keeps position and form',()=>{
 const f=room();f.start();const g=f.g(),p=g.players[0];g.players.forEach(p=>p.paused=true);Object.assign(p,{x:140,y:300,weapon:'ice',deaths:3});f.tick(50);const x=p.x,y=p.y,time=g.elapsed,cx=client(f);cx.connect(false);
 assert.equal(presence599(cx.c,false,{force:true,now:10}),false);assert.equal(cx.calls,0);f.tick(500);assert.equal(g.elapsed,time);
 cx.connect(true);cx.snapshot();presence599(cx.c,undefined,{now:20});assert.equal(cx.calls,1);f.tick(25);cx.snapshot();presence599(cx.c,undefined,{now:45});assert.equal(p.paused,false);assert.equal(p.waiting,false);assert.equal(p.x,x);assert.equal(p.y,y);assert.equal(p.weapon,'ice');assert.equal(p.deaths,3);assert.equal(cx.c.runnersUI587.presencePending599,null);
});
test('an accepted but lost resume request is retried after 250ms, then acknowledged once applied',()=>{
 const f=room();f.start();f.g().players.forEach(p=>p.paused=true);f.tick(25);const cx=client(f);cx.drop(true);presence599(cx.c,false,{force:true,now:0});assert.equal(cx.calls,1);
 presence599(cx.c,undefined,{now:249});assert.equal(cx.calls,1);cx.drop(false);presence599(cx.c,undefined,{now:250});assert.equal(cx.calls,2);
 cx.snapshot();assert(cx.c.state.runners.players[0].lastSeq>cx.c.state.runners.players[0].processedSeq);presence599(cx.c,undefined,{now:251});assert(cx.c.runnersUI587.presencePending599,'queued is not applied');
 f.tick(25);cx.snapshot();presence599(cx.c,undefined,{now:275});assert.equal(cx.c.runnersUI587.presencePending599,null);assert(!f.g().players[0].waiting);
});
test('pause is acknowledged even when every player is suspended',()=>{
 const f=room();f.start();f.g().players.slice(1).forEach(p=>p.paused=true);const cx=client(f);presence599(cx.c,true,{force:true,now:0});f.tick(25);cx.snapshot();presence599(cx.c,undefined,{now:25});assert.equal(cx.c.runnersUI587.presencePending599,null);assert.equal(cx.calls,1);assert(f.g().players[0].paused);
});
function transport(){
 class Socket extends EventTarget{readyState=1;closed=false;close(){this.closed=true;this.readyState=3;}}
 const original=new Socket(),c={ws:original,connectionReady:true,backgroundActive:true,manualClose:false,supersededConnection:false,token:'keep-existing-token',probes:0,connections:0,closes:0,_refreshResumeTokenFromStorage(){},_send(type){assert.equal(type,'ping');this.probes++;return true;},_handleClose(s){assert.equal(s,this.ws);this.ws=null;this.connectionReady=false;this.closes++;},connect({reconnect}){assert(reconnect);this.connections++;this.ws=new Socket();this.ws.readyState=0;}};
 return {c,original};
}
test('healthy OPEN socket is probed once and reused without reconnecting',t=>{
 t.mock.timers.enable({apis:['setTimeout']});const {c,original}=transport();ensureResume599(c);ensureResume599(c);assert.equal(c.probes,1);original.dispatchEvent(new Event('message'));t.mock.timers.tick(1500);assert.equal(c.connections,0);assert.equal(c.resumeProbe599,null);assert.equal(c.ws,original);
});
test('dead OPEN socket reconnects after 1.2s instead of waiting for the old heartbeat/backoff',t=>{
 t.mock.timers.enable({apis:['setTimeout']});const {c,original}=transport();ensureResume599(c);t.mock.timers.tick(1199);assert.equal(c.connections,0);t.mock.timers.tick(1);assert.equal(c.connections,1);assert.equal(c.closes,1);assert(original.closed);assert.notEqual(c.ws,original);assert.equal(c.token,'keep-existing-token');
});
test('closed socket reconnects immediately and a stalled handshake has a bounded retry',t=>{
 t.mock.timers.enable({apis:['setTimeout']});const {c,original}=transport();original.readyState=3;ensureResume599(c);assert.equal(c.connections,1);ensureResume599(c);t.mock.timers.tick(2999);assert.equal(c.connections,1);t.mock.timers.tick(1);assert.equal(c.connections,2);
});
test('manual exit or a superseded session never reconnects automatically',t=>{
 t.mock.timers.enable({apis:['setTimeout']});for(const flag of ['manualClose','supersededConnection']){const {c}=transport();c[flag]=true;ensureResume599(c);t.mock.timers.tick(5000);assert.equal(c.connections,0);assert.equal(c.probes,0);cancelResume599(c);}
});
