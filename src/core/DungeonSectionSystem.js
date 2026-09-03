const CARDINAL=Object.freeze([
 {id:"north",dx:0,dy:-1,opposite:"south"},
 {id:"east",dx:1,dy:0,opposite:"west"},
 {id:"south",dx:0,dy:1,opposite:"north"},
 {id:"west",dx:-1,dy:0,opposite:"east"}
]);

// The slot stays fixed so old expedition snapshots and the existing logical
// topology remain compatible.  The walkable silhouette inside that slot now
// has four genuinely different scales instead of every section expanding to
// the same outer anchors.
export const SECTION_SIZE_TIERS=Object.freeze({
 small:Object.freeze({id:"small",weight:20,minSpan:12,maxSpan:15,targetArea:118,coreRadius:2,walkers:3,minSteps:12,maxSteps:20,band:2}),
 standard:Object.freeze({id:"standard",weight:44,minSpan:18,maxSpan:22,targetArea:238,coreRadius:3,walkers:5,minSteps:22,maxSteps:34,band:3}),
 large:Object.freeze({id:"large",weight:26,minSpan:25,maxSpan:29,targetArea:382,coreRadius:4,walkers:7,minSteps:32,maxSteps:48,band:4}),
 huge:Object.freeze({id:"huge",weight:10,minSpan:31,maxSpan:35,targetArea:565,coreRadius:5,walkers:9,minSteps:44,maxSteps:66,band:5})
});

export const SECTION_SHAPE_PATTERNS=Object.freeze(["irregular","cavern","ring","slender","branched"]);

const pointKey=(x,y)=>`${x},${y}`;
const edgeKey=(a,b)=>[String(a),String(b)].sort().join("|");
const pick=(list,random)=>list[Math.floor(Math.max(0,Math.min(.999999,Number(random())||0))*list.length)];
const shuffle=(list,random)=>list.map(value=>({value,roll:random()})).sort((a,b)=>a.roll-b.roll).map(entry=>entry.value);
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const randomInteger=(min,max,random)=>min+Math.floor(Math.max(0,Math.min(.999999,Number(random())||0))*(max-min+1));

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

function weightedSizeTier(random){
 const tiers=Object.values(SECTION_SIZE_TIERS),total=tiers.reduce((sum,tier)=>sum+tier.weight,0);let roll=Math.max(0,Math.min(.999999,Number(random())||0))*total;
 for(const tier of tiers){roll-=tier.weight;if(roll<0)return tier}
 return SECTION_SIZE_TIERS.standard
}

function weightedPattern(random){
 const roll=Math.max(0,Math.min(.999999,Number(random())||0));
 return roll<.31?"irregular":roll<.52?"cavern":roll<.70?"ring":roll<.88?"slender":"branched"
}

function resolveSizeTier(value,random){return SECTION_SIZE_TIERS[String(value??"")]??weightedSizeTier(random)}
function resolvePattern(value,random){return SECTION_SHAPE_PATTERNS.includes(String(value))?String(value):weightedPattern(random)}

function sectionShape(node,index,attribute,random,slot,linkedDirections=[],forcedTier=null,forcedPattern=null){
 const baseX=3+node.gx*slot,baseY=3+node.gy*slot,cx=baseX+Math.floor(slot/2),cy=baseY+Math.floor(slot/2),cells=new Set(),tier=resolveSizeTier(forcedTier,random),pattern=resolvePattern(forcedPattern,random),span=randomInteger(tier.minSpan,tier.maxSpan,random),half=Math.floor(span/2),innerMinX=baseX+4,innerMaxX=baseX+slot-5,innerMinY=baseY+4,innerMaxY=baseY+slot-5;
 const has=(x,y)=>cells.has(pointKey(x,y));
 const carve=(x,y,radius=0)=>{for(let oy=-radius;oy<=radius;oy++)for(let ox=-radius;ox<=radius;ox++){const tx=x+ox,ty=y+oy;if(tx>=innerMinX&&ty>=innerMinY&&tx<=innerMaxX&&ty<=innerMaxY)cells.add(pointKey(tx,ty))}};
 const carveLine=(from,to,radius=0)=>{let x=Math.round(from.x),y=Math.round(from.y),horizontalFirst=Math.abs(to.x-x)>=Math.abs(to.y-y);carve(x,y,radius);while(x!==to.x||y!==to.y){if(horizontalFirst&&x!==to.x)x+=Math.sign(to.x-x);else if(y!==to.y)y+=Math.sign(to.y-y);else x+=Math.sign(to.x-x);horizontalFirst=!horizontalFirst;carve(x,y,radius)}};
 const carveDisc=(x,y,radius)=>{for(let oy=-radius;oy<=radius;oy++)for(let ox=-radius;ox<=radius;ox++)if(ox*ox+oy*oy<=radius*radius+radius*.7)carve(x+ox,y+oy)};
 const boundsX={min:clamp(cx-half,innerMinX,innerMaxX),max:clamp(cx+half,innerMinX,innerMaxX)},boundsY={min:clamp(cy-half,innerMinY,innerMaxY),max:clamp(cy+half,innerMinY,innerMaxY)};

 if(pattern==="cavern"){
  const rx=Math.max(4,half),ry=Math.max(4,half-randomInteger(0,Math.max(1,Math.floor(half*.18)),random));
  for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){
   const q=((x-cx)*(x-cx))/(rx*rx)+((y-cy)*(y-cy))/(ry*ry);
   if(q<=.76||q<=1.08&&random()>(q-.76)*1.85)carve(x,y)
  }
  carveDisc(cx,cy,tier.coreRadius)
 }else if(pattern==="ring"){
  const rx=Math.max(5,half),ry=Math.max(5,half-randomInteger(0,Math.max(1,Math.floor(half*.14)),random)),innerRx=Math.max(2,rx-tier.band),innerRy=Math.max(2,ry-tier.band);
  for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){
   const outer=((x-cx)*(x-cx))/(rx*rx)+((y-cy)*(y-cy))/(ry*ry),inner=((x-cx)*(x-cx))/(innerRx*innerRx)+((y-cy)*(y-cy))/(innerRy*innerRy);
   if(outer<=1.08&&inner>=.88)carve(x,y)
  }
  // Keep the boss/object origin usable without filling the visual ring.
  carveDisc(cx,cy,Math.max(1,Math.floor(tier.coreRadius/2)));carveLine({x:cx,y:cy},{x:cx,y:cy-ry+tier.band},0)
 }else if(pattern==="slender"){
  const horizontal=random()<.5,longRadius=Math.max(6,half),thickness=Math.max(1,Math.min(5,tier.band-1)),start=horizontal?{x:cx-longRadius,y:cy}:{x:cx,y:cy-longRadius},end=horizontal?{x:cx+longRadius,y:cy}:{x:cx,y:cy+longRadius};
  let x=start.x,y=start.y;carveDisc(x,y,thickness);
  const length=horizontal?end.x-start.x:end.y-start.y;
  for(let step=1;step<=length;step++){
   if(horizontal)x=start.x+step;else y=start.y+step;
   if(step%3===0){const drift=random()<.5?-1:1;if(horizontal)y=clamp(y+drift,cy-Math.max(2,half>>2),cy+Math.max(2,half>>2));else x=clamp(x+drift,cx-Math.max(2,half>>2),cx+Math.max(2,half>>2))}
   carveDisc(x,y,thickness)
   if(step%Math.max(4,8-tier.band)===0&&random()<.55)carveDisc(x+(horizontal?0:random()<.5?-thickness:thickness),y+(horizontal?(random()<.5?-thickness:thickness):0),thickness+1)
  }
  carveLine({x,y},{x:end.x,y:end.y},thickness);carveDisc(cx,cy,thickness+1)
 }else if(pattern==="branched"){
  carveDisc(cx,cy,tier.coreRadius);
  const branches=4+randomInteger(0,2,random),directions=shuffle(CARDINAL,random);
  for(let branch=0;branch<branches;branch++){
   const direction=directions[branch%directions.length],distance=Math.max(5,half-randomInteger(0,Math.max(1,half>>2),random)),side=randomInteger(-Math.max(1,half>>2),Math.max(1,half>>2),random),target={x:cx+direction.dx*distance+(direction.dy?side:0),y:cy+direction.dy*distance+(direction.dx?side:0)};
   carveLine({x:cx,y:cy},target,Math.max(0,tier.band-2));carveDisc(target.x,target.y,tier.coreRadius+randomInteger(0,1,random))
  }
 }else{
  carveDisc(cx,cy,tier.coreRadius);
  // Organic walkers all start in the core, so every added tile belongs to the
  // same connected component.  Cardinally biased walkers give the outline
  // readable lobes without turning it into a rectangular room.
  for(let walker=0;walker<tier.walkers;walker++){
   let x=cx,y=cy;const bias=shuffle(CARDINAL,random)[walker%CARDINAL.length],steps=randomInteger(tier.minSteps,tier.maxSteps,random);
   for(let step=0;step<steps;step++){
    const direction=random()<.42?bias:pick(CARDINAL,random);x=clamp(x+direction.dx,boundsX.min,boundsX.max);y=clamp(y+direction.dy,boundsY.min,boundsY.max);carve(x,y,random()<.34?Math.max(1,tier.band-2):0)
   }
  }
 }

 // Grow only from the existing frontier.  It gives the four tiers stable area
 // separation while preserving each pattern's large-scale silhouette.
 const areaMultiplier=pattern==="slender"?.72:pattern==="ring"?.86:pattern==="branched"?.94:1,targetArea=Math.round(tier.targetArea*areaMultiplier),growthMinX=clamp(cx-half,innerMinX,innerMaxX),growthMaxX=clamp(cx+half,innerMinX,innerMaxX),growthMinY=clamp(cy-half,innerMinY,innerMaxY),growthMaxY=clamp(cy+half,innerMinY,innerMaxY);
 const growthCells=[...cells];let growthGuard=targetArea*20;
 while(cells.size<targetArea&&growthGuard-->0){
  const origin=pointFromKey(pick(growthCells,random)),direction=pick(CARDINAL,random),x=origin.x+direction.dx,y=origin.y+direction.dy;
  if(x>=growthMinX&&x<=growthMaxX&&y>=growthMinY&&y<=growthMaxY&&!has(x,y)){carve(x,y);growthCells.push(pointKey(x,y))}
 }
 carve(cx,cy);
 // No decorative edge pixel is allowed to become an unreachable island.  In
 // particular, noisy cavern rims can otherwise leave a one-cell fragment that
 // is visible on the minimap but impossible to walk to.
 const connected=new Set([pointKey(cx,cy)]),queue=[pointKey(cx,cy)];
 for(let cursor=0;cursor<queue.length;cursor++){
  const current=pointFromKey(queue[cursor]);
  for(const direction of CARDINAL){const next=pointKey(current.x+direction.dx,current.y+direction.dy);if(cells.has(next)&&!connected.has(next)){connected.add(next);queue.push(next)}}
 }
 for(const key of cells)if(!connected.has(key))cells.delete(key);

 const directionalAnchor=(direction,used)=>{
  const candidates=[...cells].map(pointFromKey).filter(cell=>!used.has(pointKey(cell.x,cell.y))&&!has(cell.x+direction.dx,cell.y+direction.dy)&&has(cell.x-direction.dx,cell.y-direction.dy));
  candidates.sort((a,b)=>{
   const primaryA=a.x*direction.dx+a.y*direction.dy,primaryB=b.x*direction.dx+b.y*direction.dy;
   if(primaryA!==primaryB)return primaryB-primaryA;
   const perpendicularA=direction.dx?Math.abs(a.y-cy):Math.abs(a.x-cx),perpendicularB=direction.dx?Math.abs(b.y-cy):Math.abs(b.x-cx);
   return perpendicularA-perpendicularB
  });
  return candidates[0]??{x:cx,y:cy}
 };
 const usedAnchors=new Set(),anchor={};
 for(const direction of CARDINAL){
  if(linkedDirections.includes(direction.id)){
   const selected=directionalAnchor(direction,usedAnchors);anchor[direction.id]={x:selected.x,y:selected.y};usedAnchors.add(pointKey(selected.x,selected.y))
  }else{
   const parsed=[...cells].map(pointFromKey),minX=Math.min(...parsed.map(cell=>cell.x)),maxX=Math.max(...parsed.map(cell=>cell.x)),minY=Math.min(...parsed.map(cell=>cell.y)),maxY=Math.max(...parsed.map(cell=>cell.y));
   anchor[direction.id]=direction.id==="north"?{x:cx,y:minY-1}:direction.id==="east"?{x:maxX+1,y:cy}:direction.id==="south"?{x:cx,y:maxY+1}:{x:minX-1,y:cy}
  }
 }
 const parsed=[...cells].map(pointFromKey),minX=Math.min(...parsed.map(cell=>cell.x)),maxX=Math.max(...parsed.map(cell=>cell.x)),minY=Math.min(...parsed.map(cell=>cell.y)),maxY=Math.max(...parsed.map(cell=>cell.y)),walkableArea=parsed.length;
 return{id:node.id,index,gx:node.gx,gy:node.gy,attribute,sizeTier:tier.id,layoutPattern:pattern,center:{x:cx,y:cy},anchor,linkedDirections:[...linkedDirections],cells:parsed,cellKeys:[...cells],walkableArea,footprint:{w:maxX-minX+1,h:maxY-minY+1,area:walkableArea},x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1,minX,maxX,minY,maxY}
}

export function generateSectionDungeon({count=4,attributes=[],random=Math.random,slot=42,sizeTiers=[],patterns=[]}={}){
 const total=Math.max(4,Math.min(6,Math.floor(Number(count)||4))),topology=logicalTopology(total,random),directionsById=new Map(topology.nodes.map(node=>[node.id,new Set()]));
 for(const edge of topology.edges){const direction=CARDINAL.find(entry=>entry.id===edge.direction)??CARDINAL[0];directionsById.get(edge.a)?.add(direction.id);directionsById.get(edge.b)?.add(direction.opposite)}
 const sections=topology.nodes.map((node,index)=>sectionShape(node,index,attributes[index]??"neutral",random,slot,[...(directionsById.get(node.id)??[])],sizeTiers[index],patterns[index]));
 const byId=Object.fromEntries(sections.map(section=>[section.id,section])),sectionByCell={};
 sections.forEach(section=>section.cellKeys.forEach(key=>{sectionByCell[key]=section.id}));
 const portals=[];
 for(const edge of topology.edges){
  const from=byId[edge.a],to=byId[edge.b],direction=CARDINAL.find(entry=>entry.id===edge.direction)??CARDINAL[0],reverse=CARDINAL.find(entry=>entry.id===direction.opposite),fromPoint=from.anchor[direction.id],toPoint=to.anchor[reverse.id];
  portals.push({id:`portal-${from.id}-${to.id}`,sectionId:from.id,targetSectionId:to.id,direction:direction.id,targetDirection:reverse.id,arrivalFacing:direction.id,x:fromPoint.x,y:fromPoint.y,arrivalX:toPoint.x-reverse.dx,arrivalY:toPoint.y-reverse.dy});
  portals.push({id:`portal-${to.id}-${from.id}`,sectionId:to.id,targetSectionId:from.id,direction:reverse.id,targetDirection:direction.id,arrivalFacing:reverse.id,x:toPoint.x,y:toPoint.y,arrivalX:fromPoint.x-direction.dx,arrivalY:fromPoint.y-direction.dy})
 }
 const maxGX=Math.max(...sections.map(section=>section.gx)),maxGY=Math.max(...sections.map(section=>section.gy)),cols=(maxGX+1)*slot+6,rows=(maxGY+1)*slot+6,tiles=Array.from({length:rows},()=>Array(cols).fill(1));
 sections.forEach(section=>section.cells.forEach(cell=>{tiles[cell.y][cell.x]=0}));
 return{cols,rows,tiles,sections,rooms:sections,sectionGraph:topology.edges,sectionPortals:portals,sectionByCell,startSectionId:sections[0].id,start:{...sections[0].center,sectionId:sections[0].id},shape:"section-dungeons",sectionScale:1.65,generationVersion:307,slot}
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
 const savedCells=Array.isArray(section.cells)&&section.cells.length?section.cells:(section.cellKeys??[]).map(pointFromKey),cells=savedCells.filter(cell=>Number.isFinite(Number(cell?.x))&&Number.isFinite(Number(cell?.y))),xs=cells.map(cell=>Number(cell.x)),ys=cells.map(cell=>Number(cell.y)),numberOr=(value,fallback)=>Number.isFinite(Number(value))?Number(value):fallback,baseX=numberOr(section.x,xs.length?Math.min(...xs):0),baseY=numberOr(section.y,ys.length?Math.min(...ys):0),derivedMinX=numberOr(section.minX,xs.length?Math.min(...xs):baseX),derivedMinY=numberOr(section.minY,ys.length?Math.min(...ys):baseY),derivedMaxX=numberOr(section.maxX,xs.length?Math.max(...xs):baseX+Math.max(1,numberOr(section.w,1))-1),derivedMaxY=numberOr(section.maxY,ys.length?Math.max(...ys):baseY+Math.max(1,numberOr(section.h,1))-1),worldCols=Math.max(1,Math.floor(numberOr(world?.cols,derivedMaxX+1))),worldRows=Math.max(1,Math.floor(numberOr(world?.rows,derivedMaxY+1))),value=Math.max(0,Math.floor(Number(padding)||0)),minX=Math.max(0,Math.floor(derivedMinX)-value),minY=Math.max(0,Math.floor(derivedMinY)-value),maxX=Math.min(worldCols-1,Math.ceil(derivedMaxX)+value),maxY=Math.min(worldRows-1,Math.ceil(derivedMaxY)+value);return{x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1,minX,minY,maxX,maxY}
}
