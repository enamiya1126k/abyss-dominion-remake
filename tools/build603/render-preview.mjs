// Native Canvas visual QA. This is not a Safari/browser screenshot.
// Run from the repository root; NAPI_CANVAS may point to @napi-rs/canvas/index.js.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {makeRunners587,startRunners587} from '../../src/runners587/Rules587.js';
import {course589} from '../../src/runners587/Courses589.js';
import {board587,paint587} from '../../src/runners587/Board587.js';
import {preload595} from '../../src/runners587/Art595.js';
import {preload602,artStatus602} from '../../src/runners587/Art602.js';
import {preload603,status603} from '../../src/runners587/Art603.js';
import {preload593} from '../../src/runners587/World593.js';
import {preload600} from '../../src/runners587/Scenery600.js';
import {BOSS_ATLAS603} from '../../src/runners587/BossAtlas603.js';
const {createCanvas,Image:NativeImage,loadImage}=await import(process.env.NAPI_CANVAS||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas/index.js');
const repo=fileURLToPath(new URL('../../',import.meta.url)),pending=[];
class BrowserImage extends NativeImage{
 constructor(){super();this.style={};}
 set src(v){const loaded=this.onload;this.ready603=new Promise((resolve,reject)=>{this.onload=()=>{loaded?.();resolve();};this.onerror=reject;});pending.push(this.ready603);super.src=fs.readFileSync(fileURLToPath(new URL(v,new URL('../../index.html',import.meta.url))));}
 decode(){return this.ready603??Promise.resolve();}setAttribute(){}remove(){}
}
globalThis.Image=BrowserImage;globalThis.document={createElement:()=>{const c=createCanvas(1,1);c.style={};return c;}};
await preload602();
const canvas=createCanvas(960,1380),ctx=canvas.getContext('2d');
ctx.fillStyle='#0a1d28';ctx.fillRect(0,0,960,1380);
const scenes=[
 ['stormforge','WORLD 09 / THUNDER & DRAGON CANNONS',()=>({x:755,y:300}),1350],
 ['stormforge','WORLD 09 / PENDULUM WALL-KICK TOWER',c=>({x:c.climbs602[0].right+40,y:-30}),2700],
 ['abyssice','WORLD 10 / FALLING ICE & THE RISING TIDE',()=>({x:545,y:220}),2650],
 ['abyssice','WORLD 10 / LONG UNDERGROUND EXPEDITION',c=>({x:c.secrets600[0].entrance+1080,y:705}),4600],
 ['eclipse','WORLD 11 / PHASE BRIDGE & ORBITAL BLADES',()=>({x:520,y:160}),1600],
 ['eclipse','WORLD 11 / THE ECLIPSE LORD',c=>({x:c.boss600.x-175,y:300}),4000]
];
const actor=await loadImage(path.join(repo,'assets/runners603/boss-goblin_guard.webp')),[sx,sy,sw,sh]=BOSS_ATLAS603.goblin_guard.idle1;
for(let i=0;i<scenes.length;i++){
 const [id,title,position,elapsed]=scenes[i],g=makeRunners587({id:'preview'+i,code:'P',hostId:'p0',members:[{playerId:'p0',name:'You'},{playerId:'p1',name:'Friend'}],now:0});g.courseId=id;startRunners587(g,0);g.elapsed=elapsed;g.lastAt=g.serverAt=elapsed+3000;g.phase='play';g.stage='run';const course=course589(g);g.switches=course.switches.map(s=>s.id);
 const p=g.players[0];Object.assign(p,position(course),{vx:0,vy:0,grounded:true});g.players[1].waiting=true;
 if(i===5){Object.assign(g.boss600,{phase:'warn',phaseAt:elapsed,dir:-1});Object.assign(g.players[1],{x:p.x+85,y:240,vx:0,vy:0,waiting:false});}
 const tile=createCanvas(480,430);tile.before=()=>{};const r=board587(tile);Object.assign(r,{width:480,height:430,dpr:1,snap:true});preload593(r,course);await preload595(course,r);await preload603(course);preload600(course);await Promise.all(pending);
 paint587(r,g,{reduced:false},g.players,p,g.serverAt);await Promise.all(pending);paint587(r,g,{reduced:false},g.players,p,g.serverAt);
 const ox=i%2*480,oy=Math.floor(i/2)*460;
 ctx.save();ctx.beginPath();ctx.rect(ox,oy+30,480,430);ctx.clip();
 for(const bg of [r.scene593,r.cave602].filter(Boolean)){const travel=Math.max(0,Math.min(1,r.camera/Math.max(1,course.length-480/r.scale))),pan=-(bg.width-480)*(.12+travel*.76);ctx.globalAlpha=bg===r.cave602?r.depth602:1;ctx.drawImage(bg.image,ox+pan,oy+30,bg.width,430);}
 ctx.globalAlpha=1;ctx.drawImage(tile,ox,oy+30);
 // The production avatars are HTML. Composite existing game sprites at the same coordinates.
 for(const q of g.players.filter(q=>!q.waiting)){const h=48*r.scale,w=sw/sh*h;ctx.drawImage(actor,sx,sy,sw,sh,ox+(q.x-r.camera)*r.scale-w/2,oy+30+q.y*r.scale+r.offsetY-h,w,h);}
 ctx.restore();ctx.fillStyle='#102e37';ctx.fillRect(ox,oy,480,30);ctx.fillStyle='#f2dda2';ctx.font='bold 12px sans-serif';ctx.fillText(title,ox+12,oy+20);
 const started=performance.now();for(let f=0;f<60;f++)paint587(r,g,{reduced:false},g.players,p,g.serverAt+f*1000/60);
 console.log(id,i,'60 frames average native Canvas ms',((performance.now()-started)/60).toFixed(2),'terrain cache',r.terrain595?.size);r.disposed603=true;
 if(!r.assetsReady595||!r.scene593.ready||!status603(course).ready||!artStatus602().ready)throw Error('Asset readiness failed');
}
const output=path.resolve(process.argv[2]||'docs/build603/scene-preview.png');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,canvas.toBuffer('image/png'));
console.log('All scenes use actual game renderer and decoded assets; avatar bitmaps composited. Not a browser/Safari screenshot.');
