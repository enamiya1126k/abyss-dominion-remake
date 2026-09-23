import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {receiveMotion522,motionTime522,remotePose522,followPose522,style522,class522,prop522,data522,attr522,variable522,guardControls522} from '../src/tower/Presentation522.js';
import {bindDirections520} from '../src/tower/Controls520.js';
import {makeRenderer517,resize517,paint517,follow520} from '../src/tower/Renderer517.js';
import {makeTower517,startTower517,advanceTower517,publicTower517} from '../src/tower/Rules517.js';
const frame=t=>({id:'522',startAt:0,serverAt:t,players:[{playerId:'p1',alive:true,x:t/1000,y:t/1000}]});
test('jittered and burst packets cannot rewind the presentation clock or remote motion',()=>{
 const u={};receiveMotion522(u,frame(0),0);let last=0,lastX=0;const arrivals=[[100,100],[260,200],[305,300],[495,400],[505,500],[610,600],[840,700],[850,800]];
 for(let now=0;now<=950;now+=5){while(arrivals[0]?.[0]<=now){const [received,server]=arrivals.shift();receiveMotion522(u,frame(server),received)}const at=motionTime522(u,now),p=remotePose522(u,frame(now).players[0],at);assert.ok(at>=last);assert.ok(p.x>=lastX-1e-9);if(now)assert.ok(at-last>=4.49&&at-last<=5.51);last=at;lastX=p.x}
 assert.ok(u.timeline522.frames.length<=8);assert.ok(u.timeline522.samples.length<=32);
});
test('clock resets only for a new game, shifted server start or a long resume gap',()=>{
 const u={};receiveMotion522(u,frame(100),0);motionTime522(u,100);receiveMotion522(u,frame(150),110);assert.ok(motionTime522(u,110)>=200);
 receiveMotion522(u,{...frame(200),startAt:25},120);assert.equal(motionTime522(u,120),200);
 receiveMotion522(u,frame(500),2000);assert.equal(motionTime522(u,2000),500);
 receiveMotion522(u,{...frame(0),id:'next'},2001);assert.equal(motionTime522(u,2001),0);
});
test('remote sampling uses actual snapshot spacing and authoritative death immediately',()=>{
 const u={};for(const t of[0,120,280])receiveMotion522(u,frame(t),t);
 assert.equal(remotePose522(u,frame(280).players[0],300).x,.2);
 const dead={...frame(280).players[0],alive:false};assert.equal(remotePose522(u,dead,300),dead);
});
test('position smoothing has equal response at 30, 60 and 120 Hz',()=>{
 const results=[30,60,120].map(hz=>{const p={x:0,y:0};for(let i=0;i<hz/10;i++)followPose522(p,{x:3,y:8},1/hz);return p});
 for(const p of results){assert.ok(Math.abs(p.x-results[0].x)<1e-12);assert.ok(Math.abs(p.y-results[0].y)<1e-12)}
});
test('static HUD/class/style writes are suppressed; changed values still commit',()=>{
 let writes=0;const el={style:new Proxy({setProperty(){writes++}},{set(t,k,v){writes++;t[k]=v;return true}}),classList:{toggle(){writes++}},setAttribute(){writes++},dataset:{},disabled:false};
 for(let i=0;i<120;i++){style522(el,'width','40px');class522(el,'air',false);attr522(el,'aria-pressed',false);variable522(el,'--charge','50%');prop522(el,'disabled',false);data522(el,'level','0')}
 assert.equal(writes,4);style522(el,'width','41px');class522(el,'air',true);attr522(el,'aria-pressed',true);variable522(el,'--charge','51%');assert.equal(writes,8);
});
test('native copy/select/drag suppression applies only to live controls and does not synthesize input',()=>{
 const events=new Map();guardControls522({},(_,type,fn,options)=>{assert.equal(options.passive,false);events.set(type,fn)});
 for(const fn of events.values()){let prevented=0;fn({target:{closest:()=>true},preventDefault(){prevented++}});assert.equal(prevented,1);fn({target:{closest:()=>null},preventDefault(){prevented++}});assert.equal(prevented,1)}
});
test('held directions do not force layout reads on every pointer move; resize invalidates bounds',()=>{
 let reads=0;const mk=(axis,left)=>({dataset:{twMove520:String(axis)},events:{},classList:{toggle(){}},setAttribute(){},setPointerCapture(){},getBoundingClientRect(){reads++;return{left,right:left+80,top:0,bottom:90}}});
 const buttons=[mk(-1,0),mk(1,88)],u={input:{axis:0},keys:{}},e={pointerId:1,clientX:30,clientY:30,preventDefault(){}};
 bindDirections520(buttons,u,(b,k,f)=>b.events[k]=f,()=>{},()=>true,()=>{});buttons[0].events.pointerdown(e);
 for(let i=0;i<100;i++)buttons[0].events.pointermove(e);assert.equal(reads,2);
 u.controlsLayout522=1;buttons[0].events.pointermove({...e,clientX:100});assert.equal(reads,4);assert.equal(u.input.axis,1);
 buttons[0].events.pointercancel(e);assert.equal(u.input.axis,0);
});
test('duplicate resize keeps caches and camera; actual resize and decoded art each rebuild once',async()=>{
 const {createCanvas,loadImage}=createRequire(import.meta.url)('@napi-rs/canvas'),old=globalThis.document;
 globalThis.document={createElement:()=>createCanvas(1,1)};
 try{const r=makeRenderer517(createCanvas(390,500));resize517(r,390,500,3);r.cameraY=70;const builds=r.cacheBuilds520;resize517(r,390,500,3);assert.equal(r.cameraY,70);assert.equal(r.cacheBuilds520,builds);
 const art=await loadImage(new URL('../assets/tower520/shaft.webp',import.meta.url).pathname);r.art=art;resize517(r,390,500,3);assert.equal(r.cacheBuilds520,builds+1);resize517(r,390,500,3);assert.equal(r.cacheBuilds520,builds+1);resize517(r,320,440,3);assert.equal(r.cacheBuilds520,builds+2);
 }finally{globalThis.document=old}
});
test('tall cached layers copy only viewport pixels while all 20 rows and DPR remain unchanged',()=>{
 const {createCanvas}=createRequire(import.meta.url)('@napi-rs/canvas'),old=globalThis.document;
 globalThis.document={createElement:()=>createCanvas(1,1)};
 try{const g=makeTower517({id:'522',code:'522',hostId:'p0',members:Array.from({length:4},(_,i)=>({playerId:'p'+i,choice:{speciesId:'slime'}}))});g.roleMode='p0';startTower517(g,0);advanceTower517(g,3000);
 const r=makeRenderer517(createCanvas(390,500));resize517(r,390,500,3);follow520(r,g,g.players[1],0);const draw=r.ctx.drawImage.bind(r.ctx),layers=[];r.ctx.drawImage=(...args)=>{if(args[0]===r.background||args[0]===r.settled)layers.push(args);draw(...args)};
 paint517(r,publicTower517(g),g.players,g.lastAt);assert.equal(layers.length,2);for(const args of layers){assert.equal(args.length,9);assert.ok(args[4]<=r.canvas.height);assert.ok(args[4]<r.background.height)}assert.equal(r.dpr,1.5);assert.equal(r.cell*10,366);
 }finally{globalThis.document=old}
});
