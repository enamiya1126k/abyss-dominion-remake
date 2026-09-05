// Field pursuit only. Encounter results and permanent wounds remain in the ledger.
export const HERO_PURSUIT_STEPS=500;
export const HERO_ESCAPE_DISTANCE=12;
const number=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
const point=p=>({x:Math.round(number(p?.x)),y:Math.round(number(p?.y))});
const key=p=>`${p.x},${p.y}`;
export function normalizeHeroPursuit(value,{encounterId,heroId}={}){
 if(!value||typeof value!=="object"||!encounterId||value.encounterId!==encounterId||value.heroId!==heroId)return null;
 const p=point(value);
 return{version:341,encounterId,heroId,...p,rx:p.x,ry:p.y,sectionId:value.sectionId??null,
  floor:Math.max(1,Math.floor(number(value.floor,1))),state:value.state==="resolved"?"resolved":value.state==="contact"?"contact":"pursuing",
  chaseSteps:Math.max(0,Math.floor(number(value.chaseSteps))),portalTransfers:Math.max(0,Math.floor(number(value.portalTransfers))),
  playerChoice337:["fight","flee"].includes(value.playerChoice337)?value.playerChoice337:undefined,
  pendingArrival341:value.pendingArrival341===true,arrivalAnchor341:value.arrivalAnchor341?point(value.arrivalAnchor341):null,
  graceSeconds:Math.max(0,Math.min(2,number(value.graceSeconds))),revealed:true};
}
export function heroFieldRoute(world,start,goal,sectionId=world.currentSectionId){
 if(!start||!goal)return[];start=point(start);goal=point(goal);
 const walk=p=>world.tiles?.[p.y]?.[p.x]===0&&(!world.sectionByCell?.[key(p)]||String(world.sectionByCell[key(p)])===String(sectionId));
 if(!walk(start)||!walk(goal)||key(start)===key(goal))return[];
 const queue=[start],seen=new Set([key(start)]),previous=new Map();let found=false;
 for(let i=0;i<queue.length&&!found;i++)for(const [dx,dy]of[[0,1],[1,0],[0,-1],[-1,0]]){
  const p={x:queue[i].x+dx,y:queue[i].y+dy},k=key(p);if(!walk(p)||seen.has(k))continue;
  // A hero walks within the current section; portal arrival is handled separately.
  if(world.exit&&world.exit.active!==false&&!world.exit.locked&&key(p)===key(world.exit)&&k!==key(goal))continue;
  seen.add(k);previous.set(k,queue[i]);queue.push(p);if(k===key(goal)){found=true;break}
 }
 if(!found)return[];const route=[];let p=goal;
 while(key(p)!==key(start)){route.unshift(p);p=previous.get(key(p));if(!p)return[]}
 return route;
}
export function chooseHeroSpawn(world,player,{sectionId=world.currentSectionId,visible=()=>true,blocked=[]}={}){
 const origin=point(player),queue=[{...origin,d:0}],seen=new Set([key(origin)]),forbidden=new Set(blocked.map(key)),candidates=[];
 // One bounded flood fill avoids searching the whole map once per candidate.
 for(let i=0;i<queue.length;i++){
  const p=queue[i];if(p.d>=4&&!forbidden.has(key(p)))candidates.push({...p,score:(visible(p)?0:30)+Math.abs(p.d-6)});
  if(p.d>=10)continue;
  for(const[dx,dy]of[[0,1],[1,0],[0,-1],[-1,0]]){
   const next={x:p.x+dx,y:p.y+dy,d:p.d+1},k=key(next);
   if(seen.has(k)||world.tiles?.[next.y]?.[next.x]!==0||world.sectionByCell?.[k]&&String(world.sectionByCell[k])!==String(sectionId))continue;
   if(world.exit&&world.exit.active!==false&&!world.exit.locked&&k===key(world.exit))continue;
   seen.add(k);queue.push(next);
  }
 }
 candidates.sort((a,b)=>a.score-b.score||a.y-b.y||a.x-b.x);
 return candidates.length?point(candidates[0]):null;
}
export function prepareHeroArrival(pursuit,{floor,sectionId,anchor}){
 Object.assign(pursuit,{floor,sectionId,...point(anchor),rx:anchor.x,ry:anchor.y,pendingArrival341:true,arrivalAnchor341:point(anchor),state:"pursuing",graceSeconds:1,move341:null,moving341:false});
 return pursuit;
}
export function heroCanEscape(pursuit,player,route){
 return pursuit.chaseSteps>=HERO_PURSUIT_STEPS&&!pursuit.pendingArrival341&&pursuit.graceSeconds<=0&&route.length>=HERO_ESCAPE_DISTANCE&&Math.abs(pursuit.x-player.x)+Math.abs(pursuit.y-player.y)>=6;
}
export function heroInContact(pursuit,player){
 return !pursuit.pendingArrival341&&pursuit.sectionId===player.sectionId&&Math.abs(pursuit.x-player.x)+Math.abs(pursuit.y-player.y)<=1;
}
export function advanceHeroField(pursuit,{world,player,dt=0,paused=false}){
 if(paused||!pursuit||pursuit.state==="resolved")return{contact:false,moved:false};
 const destination={...player,sectionId:world.currentSectionId};
 if(pursuit.sectionId!==world.currentSectionId)return{contact:false,moved:false};
 if(pursuit.pendingArrival341){
  const anchor=pursuit.arrivalAnchor341??world.start,route=heroFieldRoute(world,anchor,player);
  if(route.length<4)return{contact:false,moved:false,arriving:true};
  Object.assign(pursuit,{...anchor,rx:anchor.x,ry:anchor.y,pendingArrival341:false,graceSeconds:1,move341:null});
 }
 if(heroInContact(pursuit,destination))return{contact:true,moved:false};
 const seconds=Math.min(.1,Math.max(0,number(dt)));pursuit.graceSeconds=Math.max(0,number(pursuit.graceSeconds)-seconds);
 if(pursuit.graceSeconds>0){pursuit.moving341=false;return{contact:false,moved:false}}
 let step=pursuit.move341;
 if(!step){
  const ahead=pursuit.heroId==="myth_rion"?player.path?.[Math.min(3,player.path.length-1)]:pursuit.heroId==="myth_yori"?player.path?.[0]:null;
  let route=heroFieldRoute(world,pursuit,ahead??player);if(!route.length&&ahead)route=heroFieldRoute(world,pursuit,player);
  if(!route.length){pursuit.moving341=false;return{contact:false,moved:false,blocked:true}}
  const next=route[0];step=pursuit.move341={fromX:pursuit.x,fromY:pursuit.y,x:next.x,y:next.y,progress:0};
 }
 const speed={myth_enami:4.8,myth_yori:6.2,myth_hide:5.8,myth_rion:5.6}[pursuit.heroId]??5.6;
 step.progress=Math.min(1,step.progress+seconds*speed);pursuit.rx=step.fromX+(step.x-step.fromX)*step.progress;pursuit.ry=step.fromY+(step.y-step.fromY)*step.progress;pursuit.moving341=true;
 let moved=false;if(step.progress>=1){pursuit.x=step.x;pursuit.y=step.y;pursuit.move341=null;moved=true}
 return{contact:heroInContact(pursuit,destination),moved};
}
export function heroScreenIndicator({screenPoint,canvasWidth,canvasHeight,cssWidth,cssHeight,top=0,bottom=0}){
 const x=screenPoint.x/Math.max(1,canvasWidth)*cssWidth,y=screenPoint.y/Math.max(1,canvasHeight)*cssHeight;
 const inside=x>=16&&x<=cssWidth-16&&y>=top+16&&y<=cssHeight-bottom-16;
 const angle=Math.atan2(y-(top+cssHeight-bottom)/2,x-cssWidth/2),directions=['→','↘','↓','↙','←','↖','↑','↗'];
 return{inside,x:Math.max(18,Math.min(cssWidth-18,x)),y:Math.max(top+18,Math.min(cssHeight-bottom-18,y)),arrow:directions[(Math.round(angle/(Math.PI/4))+8)%8]};
}
