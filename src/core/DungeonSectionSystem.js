const CARDINAL=Object.freeze([
 {id:"north",dx:0,dy:-1,opposite:"south"},
 {id:"east",dx:1,dy:0,opposite:"west"},
 {id:"south",dx:0,dy:1,opposite:"north"},
 {id:"west",dx:-1,dy:0,opposite:"east"}
]);

const pointKey=(x,y)=>`${x},${y}`;
const edgeKey=(a,b)=>[String(a),String(b)].sort().join("|");
const pick=(list,random)=>list[Math.floor(Math.max(0,Math.min(.999999,Number(random())||0))*list.length)];
const shuffle=(list,random)=>list.map(value=>({value,roll:random()})).sort((a,b)=>a.roll-b.roll).map(entry=>entry.value);

function pointFromKey(key){const[x,y]=String(key).split(",").map(Number);return{x,y}}
function normalizedPointKey(point){return typeof point==="string"?pointKey(...point.split(",").map(Number)):pointKey(Math.round(Number(point?.x)||0),Math.round(Number(point?.y)||0))}
function sectionNeighborKeys(cells,key){
 const{x,y}=pointFromKey(key);return CARDINAL.map(direction=>pointKey(x+direction.dx,y+direction.dy)).filter(next=>cells.has(next))
}

// An active floor exit is intentionally treated as a destination rather than a
// through-tile.  It therefore has to live on a cell whose removal cannot cut a
// section in two.  Tarjan's articulation-point pass lets the field generator
// prefer a real dead end while still supporting dense, irregular room shapes.
export function safeSectionExitCandidates(section,{reserved=[]}={}){
 const cells=new Set(section?.cellKeys??[]),blocked=new Set((reserved??[]).map(normalizedPointKey));
 if(!cells.size)return[];
 const discovered=new Map(),low=new Map(),parent=new Map(),articulation=new Set();let clock=0;
 const visit=current=>{
  discovered.set(current,++clock);low.set(current,clock);let children=0;
  for(const next of sectionNeighborKeys(cells,current)){
   if(!discovered.has(next)){
    parent.set(next,current);children++;visit(next);low.set(current,Math.min(low.get(current),low.get(next)));
    if(!parent.has(current)&&children>1)articulation.add(current);
    if(parent.has(current)&&low.get(next)>=discovered.get(current))articulation.add(current)
   }else if(parent.get(current)!==next)low.set(current,Math.min(low.get(current),discovered.get(next)))
  }
 };
 for(const key of cells)if(!discovered.has(key))visit(key);
 return(section?.cells??[]).filter(cell=>{const key=normalizedPointKey(cell);return!blocked.has(key)&&!articulation.has(key)}).map(cell=>({...cell,sectionId:section.id,neighborCount:sectionNeighborKeys(cells,normalizedPointKey(cell)).length}))
}

export function chooseSafeSectionExitCell(section,{reserved=[],awayFrom=[],minimumDistance=3,random=Math.random}={}){
 const candidates=safeSectionExitCandidates(section,{reserved}),distance=Math.max(0,Math.floor(Number(minimumDistance)||0)),far=candidates.filter(cell=>(awayFrom??[]).every(point=>Math.abs(cell.x-Number(point?.x))+Math.abs(cell.y-Number(point?.y))>=distance)),pool=far.length?far:candidates;
 if(!pool.length)return null;
 const minimumNeighbors=Math.min(...pool.map(cell=>cell.neighborCount)),terminal=pool.filter(cell=>cell.neighborCount===minimumNeighbors),chosen=pick(terminal,random);
 return{x:chosen.x,y:chosen.y,sectionId:section.id,neighborCount:chosen.neighborCount}
}

function logicalTopology(count,random){
 const nodes=[{id:"section-0",gx:0,gy:0}],occupied=new Set(["0,0"]),edges=[];
 while(nodes.length<count){
 let placed=false;
  placeNext:for(const parent of shuffle(nodes,random))for(const direction of shuffle(CARDINAL,random)){
   const gx=parent.gx+direction.dx,gy=parent.gy+direction.dy,key=pointKey(gx,gy);if(occupied.has(key))continue;
   const node={id:`section-${nodes.length}`,gx,gy};nodes.push(node);occupied.add(key);edges.push({a:parent.id,b:node.id,direction:direction.id});placed=true;break placeNext
  }
  if(!placed)break
 }
 const known=new Set(edges.map(edge=>edgeKey(edge.a,edge.b)));
 for(const node of nodes)for(const direction of CARDINAL){
  const neighbor=nodes.find(entry=>entry.gx===node.gx+direction.dx&&entry.gy===node.gy+direction.dy);if(!neighbor||known.has(edgeKey(node.id,neighbor.id))||random()>.34)continue;
  edges.push({a:node.id,b:neighbor.id,direction:direction.id});known.add(edgeKey(node.id,neighbor.id))
 }
 const minX=Math.min(...nodes.map(node=>node.gx)),minY=Math.min(...nodes.map(node=>node.gy));
 nodes.forEach(node=>{node.gx-=minX;node.gy-=minY});return{nodes,edges}
}

function sectionShape(node,index,attribute,random,slot){
 const baseX=3+node.gx*slot,baseY=3+node.gy*slot,cx=baseX+Math.floor(slot/2),cy=baseY+Math.floor(slot/2),cells=new Set();
 const carve=(x,y,radius=0)=>{for(let oy=-radius;oy<=radius;oy++)for(let ox=-radius;ox<=radius;ox++){const tx=x+ox,ty=y+oy;if(tx>baseX+1&&ty>baseY+1&&tx<baseX+slot-2&&ty<baseY+slot-2)cells.add(pointKey(tx,ty))}};
 for(let y=cy-2;y<=cy+2;y++)for(let x=cx-2;x<=cx+2;x++)carve(x,y);
 const walkers=4+Math.floor(random()*3);
 for(let walker=0;walker<walkers;walker++){
  let x=cx,y=cy;const bias=shuffle(CARDINAL,random)[walker%CARDINAL.length],steps=15+Math.floor(random()*14);
  for(let step=0;step<steps;step++){
   const direction=random()<.38?bias:pick(CARDINAL,random);x=Math.max(baseX+3,Math.min(baseX+slot-4,x+direction.dx));y=Math.max(baseY+3,Math.min(baseY+slot-4,y+direction.dy));carve(x,y,random()<.28?1:0)
  }
 }
 const anchor={
  north:{x:cx,y:baseY+2},east:{x:baseX+slot-3,y:cy},south:{x:cx,y:baseY+slot-3},west:{x:baseX+2,y:cy}
 };
 for(const direction of CARDINAL){const destination=anchor[direction.id];let x=cx,y=cy;while(x!==destination.x||y!==destination.y){if(x!==destination.x)x+=Math.sign(destination.x-x);else y+=Math.sign(destination.y-y);carve(x,y,random()<.2?1:0)}}
 const parsed=[...cells].map(value=>{const[x,y]=value.split(",").map(Number);return{x,y}}),minX=Math.min(...parsed.map(cell=>cell.x)),maxX=Math.max(...parsed.map(cell=>cell.x)),minY=Math.min(...parsed.map(cell=>cell.y)),maxY=Math.max(...parsed.map(cell=>cell.y));
 return{id:node.id,index,gx:node.gx,gy:node.gy,attribute,center:{x:cx,y:cy},anchor,cells:parsed,cellKeys:[...cells],x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1,minX,maxX,minY,maxY}
}

export function generateSectionDungeon({count=4,attributes=[],random=Math.random,slot=27}={}){
 const total=Math.max(4,Math.min(6,Math.floor(Number(count)||4))),topology=logicalTopology(total,random),sections=topology.nodes.map((node,index)=>sectionShape(node,index,attributes[index]??"neutral",random,slot));
 const byId=Object.fromEntries(sections.map(section=>[section.id,section])),sectionByCell={};
 sections.forEach(section=>section.cellKeys.forEach(key=>{sectionByCell[key]=section.id}));
 const portals=[];
 for(const edge of topology.edges){
  const from=byId[edge.a],to=byId[edge.b],direction=CARDINAL.find(entry=>entry.id===edge.direction)??CARDINAL[0],reverse=CARDINAL.find(entry=>entry.id===direction.opposite),fromPoint=from.anchor[direction.id],toPoint=to.anchor[reverse.id];
  portals.push({id:`portal-${from.id}-${to.id}`,sectionId:from.id,targetSectionId:to.id,direction:direction.id,x:fromPoint.x,y:fromPoint.y,arrivalX:toPoint.x-reverse.dx,arrivalY:toPoint.y-reverse.dy});
  portals.push({id:`portal-${to.id}-${from.id}`,sectionId:to.id,targetSectionId:from.id,direction:reverse.id,x:toPoint.x,y:toPoint.y,arrivalX:fromPoint.x-direction.dx,arrivalY:fromPoint.y-direction.dy})
 }
 const maxGX=Math.max(...sections.map(section=>section.gx)),maxGY=Math.max(...sections.map(section=>section.gy)),cols=(maxGX+1)*slot+6,rows=(maxGY+1)*slot+6,tiles=Array.from({length:rows},()=>Array(cols).fill(1));
 sections.forEach(section=>section.cells.forEach(cell=>{tiles[cell.y][cell.x]=0}));
 return{cols,rows,tiles,sections,rooms:sections,sectionGraph:topology.edges,sectionPortals:portals,sectionByCell,startSectionId:sections[0].id,start:{...sections[0].center,sectionId:sections[0].id},shape:"section-dungeons"}
}

export function sectionIdAt(world,x,y){return world?.sectionByCell?.[pointKey(Math.round(Number(x)||0),Math.round(Number(y)||0))]??world?.currentSectionId??world?.startSectionId??null}

export function sectionRoute(world,fromId,toId){
 const start=String(fromId??""),goal=String(toId??"");if(!start||!goal)return[];if(start===goal)return[start];
 const queue=[start],seen=new Set(queue),previous=new Map();
 for(let cursor=0;cursor<queue.length;cursor++){
  const current=queue[cursor];for(const edge of world?.sectionGraph??[]){const next=edge.a===current?edge.b:edge.b===current?edge.a:null;if(!next||seen.has(next))continue;seen.add(next);previous.set(next,current);queue.push(next)}
 }
 if(!seen.has(goal))return[];const result=[];let current=goal;while(current){result.unshift(current);if(current===start)break;current=previous.get(current)}return result
}

export function portalTowardSection(world,fromId,toId){
 const route=sectionRoute(world,fromId,toId);if(route.length<2)return null;return(world?.sectionPortals??[]).find(portal=>portal.sectionId===route[0]&&portal.targetSectionId===route[1])??null
}

export function sectionBounds(world,sectionId,padding=1){
 const section=(world?.sections??[]).find(entry=>entry.id===sectionId)??(world?.sections??[])[0];if(!section)return{x:0,y:0,w:Number(world?.cols)||1,h:Number(world?.rows)||1,minX:0,minY:0,maxX:(Number(world?.cols)||1)-1,maxY:(Number(world?.rows)||1)-1};
 const value=Math.max(0,Math.floor(Number(padding)||0)),minX=Math.max(0,section.minX-value),minY=Math.max(0,section.minY-value),maxX=Math.min((Number(world?.cols)||1)-1,section.maxX+value),maxY=Math.min((Number(world?.rows)||1)-1,section.maxY+value);return{x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1,minX,minY,maxX,maxY}
}
