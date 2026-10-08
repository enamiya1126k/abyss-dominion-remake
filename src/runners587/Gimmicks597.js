import {crumble600} from './Terrain600.js';
// Authored course upgrades and shared deterministic timing (server + client).
export const ELEMENTS597={fire:{name:'火',color:'#ffb16a',cooldown:620,hits:3},wind:{name:'風',color:'#9af7da',cooldown:480,hits:1},ice:{name:'氷',color:'#a4dcff',cooldown:470,hits:1},thunder:{name:'雷',color:'#ffe879',cooldown:650,hits:3},stone:{name:'土',color:'#dab88b',cooldown:700,hits:2},water:{name:'水',color:'#64cffa',cooldown:390,hits:2}};
export function crusherAt597(h,elapsed){const p=((elapsed+h.offset)%6000+6000)%6000;const f=p<1400?0:p<3400?(p-1400)/2000:p<4100?1:p<5600?1-(p-4100)/1500:0;return {bottom:208+f*98,closing:p>=1400&&p<3400,f};}
export const crumbleAt597=crumble600;
export function adventure597(course){
 const walls=course.walls.flatMap(w=>!w.breakable?[w]:Array.from({length:Math.ceil(w.h/w.w)},(_,i)=>({...w,id:w.id+'-box'+i,y:w.y+i*w.h/Math.ceil(w.h/w.w),h:w.h/Math.ceil(w.h/w.w),box:true})));
 const grounds=course.grounds.map(g=>[...g]),crushers=[];let platforms=course.platforms.map(p=>({...p})),hazards=course.hazards.map(h=>({...h}));
 const candidates=grounds.filter(([a,b])=>a>700&&b-a>=390&&b<course.goal-350);
 const selected=candidates.length?[candidates[Math.min(1,candidates.length-1)]]:[];
 for(const [i,segment]of selected.entries()){
  const [a,b]=segment,x=a+45,w=Math.min(320,b-a-90),pitX=x+w*.62,pitW=86;
  crushers.push({id:course.id+'-press'+i,x,w,y:300,offset:0,pitX,pitW,pitY:350});
  const index=grounds.indexOf(segment);grounds.splice(index,1,[a,pitX],[pitX,pitX+pitW,350],[pitX+pitW,b]);
  platforms=platforms.filter(p=>p.x+p.w<x-20||p.x>x+w+20);hazards=hazards.filter(h=>h.x+h.w<x-20||h.x>x+w+20);
 }
 const available=grounds.filter(([a,b,y])=>!y&&b-a>390&&a>course.length*.45&&b<course.goal-250&&!crushers.some(c=>a<c.x+c.w&&b>c.x));
 for(const [i,[a,b]] of available.slice(0,2).entries()){
  const x=a+75,w=Math.min(270,b-a-125);
  hazards=hazards.filter(h=>h.x+h.w<x-15||h.x>x+w+15);
  hazards.push({id:course.id+'-steam-run'+i,x,y:300,w,h:94,wide:true,period:4600,on:1350,offset:i*1700});
  platforms=platforms.filter(p=>p.x+p.w<x-15||p.x>x+w+15);
 }
 const enemies=course.enemies.filter(e=>e.flying||!crushers.some(c=>e.x>c.x-80&&e.x<c.x+c.w+80)).map(e=>{
  if(e.flying)return {...e};const s=grounds.find(([a,b,y])=>!y&&e.x>a&&e.x<b);return s?{...e,advance:true,min:s[0]+18,max:s[1]-18,x:Math.min(s[1]-18,e.x),speed:Math.min(115,e.speed+15)}:{...e};
 });
 for(const p of platforms.filter(p=>p.w>=105&&!p.move&&!p.crumble).filter((_,i)=>i%3===0))enemies.push({id:p.id+'-guard597',x:p.x+p.w-16,min:p.x+14,max:p.x+p.w-14,y:p.y,speed:53,advance:true});
 const types=Object.keys(ELEMENTS597),pickups=course.pickups.map((p,i)=>({...p,kind:p.kind==='wind'&&p.id.endsWith('long-power0')?'wind':types[i%types.length]}));
 // Every course offers all six forms; pickups near challenge entrances are on solid ground.
 for(let i=0;i<6;i++){const [a,b,y=300]=grounds[Math.min(grounds.length-1,1+i*Math.max(1,Math.floor((grounds.length-2)/6)))];pickups.push({id:course.id+'-form597-'+i,kind:types[i],x:a+Math.min(90,(b-a)/3),y:y-27});}
 for(const w of walls.filter(w=>w.box&&w.id.endsWith('-box2')))pickups.push({id:w.id+'-fire',kind:'fire',x:w.x-85,y:273});
 const checkpoints=course.checkpoints.map(p=>{const floor=grounds.find(([a,b])=>p.x>=a&&p.x<=b);return {...p,y:floor?.[2]??300};});
 return {...course,grounds,platforms,walls,hazards,crushers,enemies,pickups,checkpoints,tag:'何度でも挑戦・ミス数勝負',description:'６属性を切り替え、崩落・蒸気・迫る天井を突破。復活も攻撃も無制限。全員のゴールを目指し、ミスの少なさで競おう。',features:['６属性・弾数無制限','ミス数で競う冒険'],sections:course.sections.map(s=>({...s,sub:''}))};
}
