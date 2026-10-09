import {phase603,platform603} from './Hazards603.js';
import {crusherSurface601} from './Gimmicks597.js';
import {crumble600} from './Terrain600.js';
// Original forest course; every course uses the same geometry resolver below.
export const COURSE587=Object.freeze({length:4920,goal:4820,height:400,ground:300,
 sections:[{x:0,name:'こもれびの森',sub:'走って、跳んで、踏んで！'},{x:1650,name:'浮遊遺跡',sub:'動く足場とバネを乗り継ごう'},{x:3250,name:'魔王城への道',sub:'あと少し！ 最後の連続ジャンプ'}],
 checkpoints:[{x:90,y:300},{x:1240,y:300},{x:1650,y:300},{x:2640,y:300},{x:3250,y:300},{x:3920,y:300}],
 grounds:[[0,650],[745,1080],[1200,1630],[1630,1990],[2110,2470],[2595,2850],[2980,3350],[3475,3750],[3885,4220],[4355,5000]],
 platforms:[
  {id:'ledge0',x:265,y:246,w:125,h:18},{id:'ledge1',x:425,y:190,w:125,h:18},
  {id:'high0',x:580,y:136,w:115,h:18},
  {id:'ledge2',x:1250,y:246,w:120,h:18},{id:'ledge3',x:1430,y:210,w:115,h:18},
  {id:'float0',x:1800,y:232,w:105,h:20,move:{axis:'x',range:75,period:3600}},
  {id:'float1',x:1980,y:206,w:105,h:20,move:{axis:'y',range:24,period:3200}},
  {id:'float2',x:2310,y:211,w:110,h:20,move:{axis:'x',range:65,period:4000}},
  {id:'ledge4',x:2610,y:244,w:100,h:18},{id:'ledge5',x:2720,y:198,w:85,h:18},
  {id:'ledge6',x:3020,y:226,w:110,h:18},
  {id:'ledge7',x:3540,y:244,w:100,h:18},{id:'ledge8',x:3660,y:198,w:85,h:18},
  {id:'float3',x:4090,y:213,w:105,h:20,move:{axis:'x',range:65,period:3100}},
  {id:'ledge9',x:4470,y:244,w:100,h:18}
 ],
 springs:[{id:'spring0',x:1875,y:300},{id:'spring1',x:3005,y:300},{id:'spring2',x:4420,y:300}],
 gems:[{id:'gem0',x:630,y:108},{id:'gem1',x:1470,y:179},{id:'gem2',x:2010,y:145},{id:'gem3',x:2760,y:168},{id:'gem4',x:3700,y:168},{id:'gem5',x:4520,y:214}],
 enemies:[{id:'bug0',x:350,min:310,max:390,y:300,speed:32},{id:'bug1',x:855,min:805,max:900,y:300,speed:37},{id:'bug2',x:1400,min:1340,max:1465,y:300,speed:45},{id:'bug3',x:2250,min:2240,max:2290,y:300,speed:40},{id:'bug4',x:3150,min:3130,max:3190,y:300,speed:49},{id:'bug5',x:3590,min:3550,max:3620,y:300,speed:50},{id:'bug6',x:4060,min:4040,max:4120,y:300,speed:54},{id:'bug7',x:4650,min:4590,max:4720,y:300,speed:60}]
});
export const section587=(x,course=COURSE587)=>course.sections.filter(s=>s.x<=x).at(-1)??course.sections[0];
const geometry591=new WeakMap();
const frames591=new WeakMap();
export function surfaces587(elapsed=0,course=COURSE587,world={}){
 let fixed=geometry591.get(course);
 if(!fixed){fixed={ground:course.grounds.map(([x,end,y=300],i)=>({id:'ground'+i,x,y,w:end-x,h:160,ground:true})),
  still:course.platforms.filter(p=>!p.move&&!p.crumble&&!p.phase603).map(p=>({...p,oneWay:true})),
  moving:course.platforms.filter(p=>p.move||p.crumble||p.phase603).map(p=>({...p,oneWay:true})),
  walls:[...(course.walls??[]).map(p=>({...p,wall:true})),...(course.hazards??[]).filter(h=>h.kind==='spikes').map(h=>({id:h.id,x:h.x,y:h.y-h.h,w:h.w,h:h.h,wall:true,spike:true})),...(course.springs??[]).map(s=>({id:s.id,x:s.x-23,y:s.y-28,w:46,h:28,wall:true,spring:true,power:s.power}))],bridges:(course.bridges??[]).map(p=>({...p,bridge:true}))};geometry591.set(course,fixed);}
 let cache=frames591.get(world);if(!cache){cache=new Map();frames591.set(world,cache);}
 const key=course.id+':'+elapsed+':'+(world.switches??[]).join(',')+':'+Object.entries(world.crumbles??{}).join(',')+':'+(world.broken??[]).join(',')+':'+Object.entries(world.coop601??{}).filter(([,q])=>q.open).map(([id])=>id).join(',')+':'+(world.enemies??[]).filter(e=>e.ice&&!e.defeated).map(e=>e.id+':'+e.ice.x+':'+e.ice.y+':'+e.ice.vx).join(',');
 if(cache.has(key))return cache.get(key);

 const fallen=p=>p.crumble&&crumble600(world?.crumbles?.[p.id],elapsed).absent;
 const result=[...fixed.ground,...fixed.still.filter(p=>!p.trial601||world.coop601?.[p.trial601]?.open),
  ...fixed.moving.filter(p=>!fallen(p)&&phase603(p,elapsed).solid).map(p=>{const a=crumble600(world?.crumbles?.[p.id],elapsed);return {...p,...platform603(p,elapsed),...(p.crumble&&a.falling?{y:p.y+a.fall,falling600:true}:{})};}),
  ...fixed.walls.filter(p=>!world.broken?.includes(p.id)),
  ...(course.crushers??[]).map(h=>crusherSurface601(h,elapsed)),
  ...fixed.bridges.filter(p=>world?.switches?.includes(p.id)),
  ...(world.enemies??[]).filter(e=>e.ice&&!e.defeated).map(e=>{const q=enemyAt587(e,elapsed);return {id:'ice:'+e.id,x:q.x-22,y:q.y-39,w:44,h:39,oneWay:true,ice:true,move:{axis:'x'}};})];
 if(cache.size>24)cache.clear();cache.set(key,result);return result;
}
export function enemyAt587(spec,elapsed){
 if(spec.ice){const q=spec.ice,dt=Math.max(-.025,Math.min(.15,(elapsed-q.at)/1000));return {...spec,x:q.x+q.vx*dt,y:q.y+q.vy*dt,dir:Math.sign(q.vx)||q.dir||1};}
 elapsed-=spec.motionOffset??0;const width=Math.max(1,spec.max-spec.min),offset=Math.max(0,Math.min(width,spec.x-spec.min)),travel=((spec.advance?width*2-offset:offset)+elapsed/1000*spec.speed)%(width*2);
 return {...spec,y:spec.y+(spec.flying?Math.sin(elapsed/(spec.period??1800)*Math.PI*2)*(spec.bob??12):0),x:spec.min+(travel<=width?travel:width*2-travel),dir:travel<=width?1:-1};
}
