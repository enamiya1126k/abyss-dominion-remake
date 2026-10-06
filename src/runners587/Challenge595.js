// Deterministic challenges shared by server and client. No random death traps.
export function challenge595(course){
 const start=course.length-3600,gap=[start+215,start+450],id=s=>course.id+'-trial-'+s;
 const grounds=course.grounds.flatMap(([a,b])=>a<gap[0]&&b>gap[1]?[[a,gap[0]],[gap[1],b]]:[[a,b]]);
 const walls=course.walls.filter(w=>!w.id.endsWith('barrier0'));
 const platforms=course.platforms.filter(p=>!p.id.endsWith('step0')).map(p=>p.move?{...p,x:p.x+8,w:Math.max(58,p.w-16),move:{...p.move,period:p.move.period*.88}}:{...p});
 platforms.push({id:id('pit'),x:gap[0]+87,y:246,w:62,h:18,move:{axis:'y',range:16,period:2100}});
 const second=grounds.find(([a])=>a>gap[1]);
 if(second){const x=(second[0]+second[1])/2+40;walls.push({id:id('barrier'),x,y:194,w:38,h:106,breakable:true});platforms.push({id:id('barrier-step'),x:x-108,y:244,w:78,h:18});}
 const enemies=course.enemies.filter(e=>e.flying||!((e.max??e.x)>gap[0]-18&&(e.min??e.x)<gap[1]+18)).map(e=>({...e,speed:Math.min(120,e.speed*1.4)}));
 const pickups=course.pickups.map(p=>p.id.endsWith('long-power0')?{...p,kind:'wind'}:p.id.endsWith('long-power1')?{...p,kind:'fire'}:p);
 const hazards=[...course.hazards],checkpoints=[];
 for(const cp of course.checkpoints)if(!checkpoints.length||cp.x-checkpoints.at(-1).x>=850)checkpoints.push(cp);
 const protectedAt=x=>[...course.checkpoints,...course.pickups,...course.springs,...course.switches].some(p=>Math.abs(p.x-x)<95)||walls.some(w=>x>w.x-110&&x<w.x+w.w+110)||hazards.some(h=>x>h.x-95&&x<h.x+h.w+95);
 // Readable jump windows, with clear run-up and landing zones on solid ground.
 for(const [a,b]of grounds){for(let x=Math.max(370,a+160);x+82<b-85;x+=235){if(protectedAt(x+41))continue;hazards.push({id:id('spike'+hazards.length),kind:'spikes',x,y:300,w:82,h:23,period:1,on:1,offset:0});}}
 // Flying guards stop the high route being a free pass; every one is stompable.
 for(let i=0;i<course.sections.length;i++){
  const section=course.sections[i],next=course.sections[i+1]?.x??course.goal;
  const ledge=platforms.find(p=>p.x>section.x+210&&p.x<next-100&&!p.crumble&&!p.move);
  const x=ledge?ledge.x+ledge.w/2:section.x+400,y=ledge?ledge.y-35:228;
  enemies.push({id:id('bat'+i),flying:true,x,min:x-65,max:x+65,y,speed:62+i*6,bob:13,period:1800+i*150});
 }
 enemies.push({id:id('pit-bat'),flying:true,x:gap[0]+122,min:gap[0]+62,max:gap[1]-40,y:200,speed:74,bob:12,period:1700});
 return {...course,grounds,platforms,walls,enemies,hazards,checkpoints,pickups,
  duration:['forest','ember'].includes(course.id)?240000:210000,
  level:course.id==='forest'?'難しい':course.id==='ember'?'最難関':'上級',tag:'残りハートで挑む６エリア',
  description:course.description+' トゲ・空中の守備隊・細い昇降足場を突破。ハート０で救助待ち、全滅で再挑戦。',
  features:['６エリア・高難度','火で突破／風で空中回避'],
  sections:course.sections.map((s,i)=>({...s,sub:i===0?'トゲを跳び越え、空中の敵は踏むか撃とう':i===3?'深い穴は昇降足場へ。風なら２段ジャンプ！':s.sub}))};
}
