import{createRequire}from'node:module';import{readFileSync,writeFileSync,mkdirSync}from'node:fs';
const require=createRequire(import.meta.url),{createCanvas,Image}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas':'@napi-rs/canvas');
globalThis.Image=class extends Image{set src(v){super.src=readFileSync(new URL(v))}get src(){return super.src}};
const R=await import('../../src/sumo/Rules523.js'),V=await import('../../src/sumo/Renderer523.js');
const g=R.makeSumo523({id:'capture',members:Array.from({length:4},(_,i)=>({playerId:'p'+i,name:'P'+i,choice:{speciesId:'slime'}}))});R.startSumo523(g,0,527);g.phase='play';g.startAt=0;
const dest=new URL('../../docs/build527/',import.meta.url);mkdirSync(dest,{recursive:true});
for(const[name,elapsed]of[['field',12000],['warning',38600],['collapse',40700],['magnet',65000],['final-ring',134000]]){
 g.elapsed=elapsed;g.radius=R.radius523(elapsed);g.players.forEach((p,i)=>Object.assign(p,{x:Math.cos(i*Math.PI/2+.7)*g.radius*.43,y:Math.sin(i*Math.PI/2+.7)*g.radius*.43,power:i*12,charging:i===0,charge:1300}));g.players[0].magnetUntil=elapsed+6500;
 g.pickups=[{id:1,x:-1,y:-2,born:elapsed-300}];g.events=name==='collapse'?[{id:1,type:'collapse',at:40000,from:9,to:7.65}]:[];g.crystals=g.crystals.filter(v=>Math.hypot(v.x,v.y)<g.radius-.2);
 const canvas=createCanvas(390,610),r=V.createRenderer523(canvas);r.selfId='p0';V.resize523(r,390,610,1.5);await Promise.all([r.bg.decode(),r.texture.decode()]);for(let i=0;i<40;i++)V.paint523(r,g,g.players,elapsed-640+i*16,false);writeFileSync(new URL(name+'.png',dest),canvas.toBuffer('image/png'));console.log(name,r.bg?.complete,r.bg?.naturalWidth,r.texture?.naturalWidth,canvas.width,canvas.height);
}
