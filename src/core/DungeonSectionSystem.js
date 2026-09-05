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

// Build318 does not roll a finished silhouette such as a ring or a symmetric
// cross.  It rolls a procedural family and then varies its axis, bends,
// offsets, pockets and erosion.  The old names are still accepted as forced
// inputs and are translated to their non-symmetric successors below.
export const SECTION_SHAPE_PATTERNS=Object.freeze(["drift","cavern","ribbon","crescent","terraces","chambers","fork","courtyard"]);

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

function weightedPattern(random,excluded=new Set()){
 // Near-even base weights keep one recognisable symbol from dominating the
 // minimap.  A small random multiplier deliberately avoids a fixed cycle.
 const entries=SECTION_SHAPE_PATTERNS.filter(id=>!excluded.has(id)).map(id=>({id,weight:.82+Math.max(0,Math.min(.999999,Number(random())||0))*.36})),pool=entries.length?entries:SECTION_SHAPE_PATTERNS.map(id=>({id,weight:1})),total=pool.reduce((sum,entry)=>sum+entry.weight,0);let roll=Math.max(0,Math.min(.999999,Number(random())||0))*total;
 for(const entry of pool){roll-=entry.weight;if(roll<0)return entry.id}
 return pool.at(-1)?.id??"drift"
}

function resolveSizeTier(value,random){return SECTION_SIZE_TIERS[String(value??"")]??weightedSizeTier(random)}
function resolvePattern(value,random){const legacy={irregular:"drift",slender:"ribbon",branched:"fork",ring:"crescent"},resolved=legacy[String(value??"")]??String(value??"");return SECTION_SHAPE_PATTERNS.includes(resolved)?resolved:weightedPattern(random)}

function sectionShape(node,index,attribute,random,slot,linkedDirections=[],forcedTier=null,forcedPattern=null){
 const baseX=3+node.gx*slot,baseY=3+node.gy*slot,cx=baseX+Math.floor(slot/2),cy=baseY+Math.floor(slot/2),cells=new Set(),tier=resolveSizeTier(forcedTier,random),pattern=resolvePattern(forcedPattern,random),span=randomInteger(tier.minSpan,tier.maxSpan,random),half=Math.floor(span/2),innerMinX=baseX+4,innerMaxX=baseX+slot-5,innerMinY=baseY+4,innerMaxY=baseY+slot-5;
 let origin={x:cx,y:cy},growthAccept=()=>true;
 const has=(x,y)=>cells.has(pointKey(x,y));
 const carve=(x,y,radius=0)=>{for(let oy=-radius;oy<=radius;oy++)for(let ox=-radius;ox<=radius;ox++){const tx=Math.round(x+ox),ty=Math.round(y+oy);if(tx>=innerMinX&&ty>=innerMinY&&tx<=innerMaxX&&ty<=innerMaxY)cells.add(pointKey(tx,ty))}};
 const carveLine=(from,to,radius=0)=>{let x=Math.round(from.x),y=Math.round(from.y),tx=Math.round(to.x),ty=Math.round(to.y),horizontalFirst=Math.abs(tx-x)>=Math.abs(ty-y);carve(x,y,radius);while(x!==tx||y!==ty){if(horizontalFirst&&x!==tx)x+=Math.sign(tx-x);else if(y!==ty)y+=Math.sign(ty-y);else x+=Math.sign(tx-x);horizontalFirst=!horizontalFirst;carve(x,y,radius)}};
 const carveDisc=(x,y,radius)=>{for(let oy=-radius;oy<=radius;oy++)for(let ox=-radius;ox<=radius;ox++)if(ox*ox+oy*oy<=radius*radius+radius*.7)carve(x+ox,y+oy)};
 const boundsX={min:clamp(cx-half,innerMinX,innerMaxX),max:clamp(cx+half,innerMinX,innerMaxX)},boundsY={min:clamp(cy-half,innerMinY,innerMaxY),max:clamp(cy+half,innerMinY,innerMaxY)};

 if(pattern==="cavern"){
  const wide=random()<.5,rx=Math.max(4,half-randomInteger(0,2,random)),ry=Math.max(4,half-randomInteger(0,2,random)),sx=wide?1:random()<.5?.72:1.18,sy=wide?random()<.5?.72:1.18:1,phase=random()*Math.PI*2;
  for(let y=cy-half;y<=cy+half;y++)for(let x=cx-half;x<=cx+half;x++){
   const dx=(x-cx)/(rx*sx),dy=(y-cy)/(ry*sy),angle=Math.atan2(dy,dx),edge=.88+.1*Math.sin(angle*3+phase)+.06*Math.sin(angle*5-phase),q=dx*dx+dy*dy;
   if(q<=edge||q<=edge+.13&&random()>.54)carve(x,y)
  }
  carveDisc(cx,cy,tier.coreRadius)
 }else if(pattern==="ribbon"){
  const horizontal=random()<.5,thickness=Math.max(1,Math.min(4,tier.band-1)),long=Math.max(6,half),bend=Math.max(2,Math.floor(half*.45)),points=horizontal?[{x:cx-long,y:cy+randomInteger(-bend,bend,random)},{x:cx-Math.floor(long*.35),y:cy+randomInteger(-bend,bend,random)},{x:cx+Math.floor(long*.35),y:cy+randomInteger(-bend,bend,random)},{x:cx+long,y:cy+randomInteger(-bend,bend,random)}]:[{x:cx+randomInteger(-bend,bend,random),y:cy-long},{x:cx+randomInteger(-bend,bend,random),y:cy-Math.floor(long*.35)},{x:cx+randomInteger(-bend,bend,random),y:cy+Math.floor(long*.35)},{x:cx+randomInteger(-bend,bend,random),y:cy+long}];
  for(let i=1;i<points.length;i++){carveLine(points[i-1],points[i],thickness);if(random()<.72)carveDisc(points[i].x,points[i].y,thickness+randomInteger(1,2,random))}
  origin={x:Math.round(points[1].x),y:Math.round(points[1].y)};carveDisc(origin.x,origin.y,thickness+1)
 }else if(pattern==="crescent"){
  const direction=pick(CARDINAL,random),rx=Math.max(5,half),ry=Math.max(5,half-randomInteger(0,Math.max(1,half>>2),random)),cutRadius=Math.max(3,Math.floor(Math.min(rx,ry)*(.56+random()*.12))),cutX=cx+direction.dx*Math.floor(rx*.42),cutY=cy+direction.dy*Math.floor(ry*.42);
  growthAccept=(x,y)=>(x-cutX)*(x-cutX)+(y-cutY)*(y-cutY)>cutRadius*cutRadius;
  for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){const outer=((x-cx)*(x-cx))/(rx*rx)+((y-cy)*(y-cy))/(ry*ry);if(outer<=1.05&&growthAccept(x,y))carve(x,y)}
  origin={x:clamp(cx-direction.dx*Math.floor(rx*.34),innerMinX,innerMaxX),y:clamp(cy-direction.dy*Math.floor(ry*.34),innerMinY,innerMaxY)};carveDisc(origin.x,origin.y,Math.max(1,tier.band-2))
 }else if(pattern==="terraces"){
  const horizontal=random()<.5,levels=3+randomInteger(0,1,random),step=Math.max(3,Math.floor(span/(levels+1))),centers=[];
  for(let i=0;i<levels;i++){const along=Math.round((i-(levels-1)/2)*step),side=randomInteger(-Math.max(2,half>>2),Math.max(2,half>>2),random),point=horizontal?{x:cx+along,y:cy+side}:{x:cx+side,y:cy+along},radius=Math.max(2,tier.coreRadius+randomInteger(-1,1,random));centers.push(point);carveDisc(point.x,point.y,radius);if(i)carveLine(centers[i-1],point,Math.max(1,tier.band-2))}
  origin={x:Math.round(centers[Math.floor(centers.length/2)].x),y:Math.round(centers[Math.floor(centers.length/2)].y)}
 }else if(pattern==="chambers"){
  const count=3+randomInteger(0,2,random),centers=[{x:cx+randomInteger(-2,2,random),y:cy+randomInteger(-2,2,random)}];carveDisc(centers[0].x,centers[0].y,tier.coreRadius+1);
  for(let i=1;i<count;i++){const prior=centers[i-1],direction=pick(CARDINAL,random),distance=Math.max(4,Math.floor(half*.55)+randomInteger(-1,2,random)),side=randomInteger(-Math.max(1,half>>3),Math.max(1,half>>3),random),point={x:clamp(prior.x+direction.dx*distance+(direction.dy?side:0),boundsX.min,boundsX.max),y:clamp(prior.y+direction.dy*distance+(direction.dx?side:0),boundsY.min,boundsY.max)};centers.push(point);carveLine(prior,point,Math.max(0,tier.band-3));carveDisc(point.x,point.y,tier.coreRadius+randomInteger(0,2,random))}
  origin={...centers[0]}
 }else if(pattern==="fork"){
  const hub={x:cx+randomInteger(-Math.max(1,half>>3),Math.max(1,half>>3),random),y:cy+randomInteger(-Math.max(1,half>>3),Math.max(1,half>>3),random)},directions=shuffle(CARDINAL,random),branchCount=2+randomInteger(0,1,random);origin={...hub};carveDisc(hub.x,hub.y,tier.coreRadius);
  for(let branch=0;branch<branchCount;branch++){const direction=directions[branch],distance=Math.max(5,half-randomInteger(0,Math.max(1,half>>2),random)),side=randomInteger(-Math.max(2,half>>2),Math.max(2,half>>2),random),target={x:hub.x+direction.dx*distance+(direction.dy?side:0),y:hub.y+direction.dy*distance+(direction.dx?side:0)};carveLine(hub,target,Math.max(0,tier.band-2));carveDisc(target.x,target.y,tier.coreRadius+randomInteger(0,1,random))}
 }else if(pattern==="courtyard"){
  const opening=pick(CARDINAL,random),outer=Math.max(5,half),inner=Math.max(2,outer-Math.max(3,tier.band+1));growthAccept=(x,y)=>Math.abs(x-cx)>=inner||Math.abs(y-cy)>=inner||x*opening.dx+y*opening.dy>(cx*opening.dx+cy*opening.dy)+inner-1;
  for(let y=cy-outer;y<=cy+outer;y++)for(let x=cx-outer;x<=cx+outer;x++){const rim=Math.max(Math.abs(x-cx),Math.abs(y-cy));if(rim<=outer&&rim>=inner&&!(x*opening.dx+y*opening.dy>(cx*opening.dx+cy*opening.dy)+inner-2&&Math.abs(x*opening.dy-y*opening.dx-(cx*opening.dy-cy*opening.dx))<Math.max(2,tier.band)))carve(x,y)}
  origin={x:clamp(cx-opening.dx*(inner+1),innerMinX,innerMaxX),y:clamp(cy-opening.dy*(inner+1),innerMinY,innerMaxY)};carveDisc(origin.x,origin.y,Math.max(1,tier.band-2))
 }else{
  carveDisc(cx,cy,tier.coreRadius);const axis=pick(CARDINAL,random);
  for(let walker=0;walker<tier.walkers;walker++){let x=cx+randomInteger(-1,1,random),y=cy+randomInteger(-1,1,random),steps=randomInteger(tier.minSteps,tier.maxSteps,random);for(let step=0;step<steps;step++){const direction=random()<.34?axis:pick(CARDINAL,random);x=clamp(x+direction.dx,boundsX.min,boundsX.max);y=clamp(y+direction.dy,boundsY.min,boundsY.max);carve(x,y,random()<.3?Math.max(1,tier.band-2):0)}}
 }

 const areaMultiplier={ribbon:.62,crescent:.67,terraces:.72,chambers:.76,fork:.7,courtyard:.58}[pattern]??.92,targetArea=Math.round(tier.targetArea*areaMultiplier),growthMinX=clamp(cx-half,innerMinX,innerMaxX),growthMaxX=clamp(cx+half,innerMinX,innerMaxX),growthMinY=clamp(cy-half,innerMinY,innerMaxY),growthMaxY=clamp(cy+half,innerMinY,innerMaxY),growthCells=[...cells];let growthGuard=targetArea*16;
 while(cells.size<targetArea&&growthCells.length&&growthGuard-->0){const from=pointFromKey(pick(growthCells,random)),direction=pick(CARDINAL,random),x=from.x+direction.dx,y=from.y+direction.dy;if(x>=growthMinX&&x<=growthMaxX&&y>=growthMinY&&y<=growthMaxY&&growthAccept(x,y)&&!has(x,y)){carve(x,y);growthCells.push(pointKey(x,y))}}
 carve(origin.x,origin.y);
 const startKey=pointKey(origin.x,origin.y),connected=new Set([startKey]),queue=[startKey];for(let cursor=0;cursor<queue.length;cursor++){const current=pointFromKey(queue[cursor]);for(const direction of CARDINAL){const next=pointKey(current.x+direction.dx,current.y+direction.dy);if(cells.has(next)&&!connected.has(next)){connected.add(next);queue.push(next)}}}for(const key of cells)if(!connected.has(key))cells.delete(key);

 const directionalAnchor=(direction,used)=>{const candidates=[...cells].map(pointFromKey).filter(cell=>!used.has(pointKey(cell.x,cell.y))&&!has(cell.x+direction.dx,cell.y+direction.dy)&&has(cell.x-direction.dx,cell.y-direction.dy));candidates.sort((a,b)=>{const primaryA=a.x*direction.dx+a.y*direction.dy,primaryB=b.x*direction.dx+b.y*direction.dy;if(primaryA!==primaryB)return primaryB-primaryA;const perpendicularA=direction.dx?Math.abs(a.y-origin.y):Math.abs(a.x-origin.x),perpendicularB=direction.dx?Math.abs(b.y-origin.y):Math.abs(b.x-origin.x);return perpendicularA-perpendicularB});return candidates[0]??{...origin}};
 const usedAnchors=new Set(),anchor={};for(const direction of CARDINAL){if(linkedDirections.includes(direction.id)){const selected=directionalAnchor(direction,usedAnchors);anchor[direction.id]={x:selected.x,y:selected.y};usedAnchors.add(pointKey(selected.x,selected.y))}else{const parsed=[...cells].map(pointFromKey),minX=Math.min(...parsed.map(cell=>cell.x)),maxX=Math.max(...parsed.map(cell=>cell.x)),minY=Math.min(...parsed.map(cell=>cell.y)),maxY=Math.max(...parsed.map(cell=>cell.y));anchor[direction.id]=direction.id==="north"?{x:origin.x,y:minY-1}:direction.id==="east"?{x:maxX+1,y:origin.y}:direction.id==="south"?{x:origin.x,y:maxY+1}:{x:minX-1,y:origin.y}}}
 const parsed=[...cells].map(pointFromKey),minX=Math.min(...parsed.map(cell=>cell.x)),maxX=Math.max(...parsed.map(cell=>cell.x)),minY=Math.min(...parsed.map(cell=>cell.y)),maxY=Math.max(...parsed.map(cell=>cell.y)),walkableArea=parsed.length;
 return{id:node.id,index,gx:node.gx,gy:node.gy,attribute,sizeTier:tier.id,layoutPattern:pattern,center:{...origin},anchor,linkedDirections:[...linkedDirections],cells:parsed,cellKeys:[...cells],walkableArea,footprint:{w:maxX-minX+1,h:maxY-minY+1,area:walkableArea},x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1,minX,maxX,minY,maxY}
}

function normalizedOccupancy(section,resolution=5){
 const cells=section?.cells??[],minX=Math.min(...cells.map(cell=>cell.x)),maxX=Math.max(...cells.map(cell=>cell.x)),minY=Math.min(...cells.map(cell=>cell.y)),maxY=Math.max(...cells.map(cell=>cell.y)),width=Math.max(1,maxX-minX+1),height=Math.max(1,maxY-minY+1),bins=Array(resolution*resolution).fill(0);
 for(const cell of cells){const x=Math.min(resolution-1,Math.floor((cell.x-minX)/width*resolution)),y=Math.min(resolution-1,Math.floor((cell.y-minY)/height*resolution));bins[y*resolution+x]++}
 return bins.map(value=>value?"1":"0").join("")
}

export function sectionShapeSignature(section){
 const width=Math.max(1,Number(section?.w)||Number(section?.footprint?.w)||1),height=Math.max(1,Number(section?.h)||Number(section?.footprint?.h)||1),area=Math.max(1,Number(section?.walkableArea)||Number(section?.footprint?.area)||1),aspect=Math.log2(width/height),fill=area/(width*height);
 return[section?.layoutPattern??"unknown",section?.sizeTier??"unknown",aspect.toFixed(2),fill.toFixed(2),normalizedOccupancy(section)].join("|")
}

export function shapeSignatureSimilarity(left,right){
 const a=String(left??"").split("|"),b=String(right??"").split("|");if(a.length<5||b.length<5)return 0;const aspect=Math.max(0,1-Math.abs(Number(a[2])-Number(b[2]))/1.4),fill=Math.max(0,1-Math.abs(Number(a[3])-Number(b[3]))/.55),gridA=a[4],gridB=b[4];let union=0,intersection=0;for(let index=0;index<Math.max(gridA.length,gridB.length);index++){const occupiedA=gridA[index]==="1",occupiedB=gridB[index]==="1";if(occupiedA||occupiedB)union++;if(occupiedA&&occupiedB)intersection++}const silhouette=union?intersection/union:0;return(a[0]===b[0] ? .22 : 0)+(a[1]===b[1] ? .06 : 0)+aspect*.18+fill*.14+silhouette*.4
}

export function generateSectionDungeon({count=4,attributes=[],random=Math.random,slot=42,sizeTiers=[],patterns=[],recentSignatures=[]}={}){
 const total=Math.max(4,Math.min(6,Math.floor(Number(count)||4))),topology=logicalTopology(total,random),directionsById=new Map(topology.nodes.map(node=>[node.id,new Set()]));
 for(const edge of topology.edges){const direction=CARDINAL.find(entry=>entry.id===edge.direction)??CARDINAL[0];directionsById.get(edge.a)?.add(direction.id);directionsById.get(edge.b)?.add(direction.opposite)}
 // Shape candidates are generated once when entering a floor.  Comparing only
 // 5x5 occupancy fingerprints is cheap, while it prevents a run of visually
 // equivalent rooms even when their raw tile coordinates differ.
 const memory=(Array.isArray(recentSignatures)?recentSignatures:[]).map(String).filter(signature=>signature.split("|").length>=5).slice(-12),sections=[];
 for(const[nodeIndex,node]of topology.nodes.entries()){
  const linked=[...(directionsById.get(node.id)??[])],forcedPattern=patterns[nodeIndex],forcedTier=sizeTiers[nodeIndex],candidateCount=forcedPattern?1:5,excludedFamilies=new Set(memory.slice(-2).map(signature=>signature.split("|")[0])),candidates=[];
  for(let candidateIndex=0;candidateIndex<candidateCount;candidateIndex++){const pattern=forcedPattern??weightedPattern(random,excludedFamilies),tier=forcedTier??weightedSizeTier(random).id,section=sectionShape(node,nodeIndex,attributes[nodeIndex]??"neutral",random,slot,linked,tier,pattern),signature=sectionShapeSignature(section),similarity=memory.length?Math.max(...memory.slice(-8).map(previous=>shapeSignatureSimilarity(signature,previous))):0,frequency=memory.slice(-12).filter(previous=>previous.split("|")[0]===section.layoutPattern).length;candidates.push({section,signature,score:similarity+frequency*.028+random()*.018})}
  candidates.sort((a,b)=>a.score-b.score);const selected=candidates[0];selected.section.shapeSignature=selected.signature;selected.section.noveltyScore=Number(Math.max(0,Math.min(1,1-selected.score)).toFixed(3));sections.push(selected.section);memory.push(selected.signature)
 }
 const byId=Object.fromEntries(sections.map(section=>[section.id,section])),sectionByCell={};
 sections.forEach(section=>section.cellKeys.forEach(key=>{sectionByCell[key]=section.id}));
 const portals=[];
 for(const edge of topology.edges){
  const from=byId[edge.a],to=byId[edge.b],direction=CARDINAL.find(entry=>entry.id===edge.direction)??CARDINAL[0],reverse=CARDINAL.find(entry=>entry.id===direction.opposite),fromPoint=from.anchor[direction.id],toPoint=to.anchor[reverse.id];
  const passageDepth=3+randomInteger(0,2,random),passageSeed=randomInteger(1,997,random);
  portals.push({id:`portal-${from.id}-${to.id}`,sectionId:from.id,targetSectionId:to.id,direction:direction.id,targetDirection:reverse.id,arrivalFacing:direction.id,x:fromPoint.x,y:fromPoint.y,arrivalX:toPoint.x-reverse.dx,arrivalY:toPoint.y-reverse.dy,passageDepth,passageSeed});
  portals.push({id:`portal-${to.id}-${from.id}`,sectionId:to.id,targetSectionId:from.id,direction:reverse.id,targetDirection:direction.id,arrivalFacing:reverse.id,x:toPoint.x,y:toPoint.y,arrivalX:fromPoint.x-direction.dx,arrivalY:fromPoint.y-direction.dy,passageDepth,passageSeed})
 }
 const maxGX=Math.max(...sections.map(section=>section.gx)),maxGY=Math.max(...sections.map(section=>section.gy)),cols=(maxGX+1)*slot+6,rows=(maxGY+1)*slot+6,tiles=Array.from({length:rows},()=>Array(cols).fill(1));
 sections.forEach(section=>section.cells.forEach(cell=>{tiles[cell.y][cell.x]=0}));
 return{cols,rows,tiles,sections,rooms:sections,sectionGraph:topology.edges,sectionPortals:portals,sectionByCell,startSectionId:sections[0].id,start:{...sections[0].center,sectionId:sections[0].id},shape:"section-dungeons",shapeSignatures:sections.map(section=>section.shapeSignature),sectionScale:1.65,generationVersion:318,slot}
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

export function portalTapDestination(world,target,currentSectionId=world?.currentSectionId){
 if(!world||!target||!Number.isInteger(target.x)||!Number.isInteger(target.y)||world.tiles?.[target.y]?.[target.x]===0)return null;
 const directionById={north:{dx:0,dy:-1},east:{dx:1,dy:0},south:{dx:0,dy:1},west:{dx:-1,dy:0}},matches=[];
 for(const portal of world.sectionPortals??[]){
  if(portal.sectionId!==currentSectionId)continue;
  const direction=directionById[portal.direction];if(!direction)continue;
  const offsetX=target.x-portal.x,offsetY=target.y-portal.y,forward=offsetX*direction.dx+offsetY*direction.dy,lateral=Math.abs(offsetX*direction.dy-offsetY*direction.dx),depth=Math.ceil(Math.max(3.15,Math.min(4.35,Number(portal.passageDepth)||3.8))+.35);
  if(forward>=1&&forward<=depth&&lateral<=1)matches.push({portal,score:forward*4+lateral})
 }
 matches.sort((left,right)=>left.score-right.score);const portal=matches[0]?.portal;return portal?{x:portal.x,y:portal.y}:null
}

export function sectionBounds(world,sectionId,padding=1){
 const section=(world?.sections??[]).find(entry=>entry.id===sectionId)??(world?.sections??[])[0];if(!section)return{x:0,y:0,w:Number(world?.cols)||1,h:Number(world?.rows)||1,minX:0,minY:0,maxX:(Number(world?.cols)||1)-1,maxY:(Number(world?.rows)||1)-1};
 const savedCells=Array.isArray(section.cells)&&section.cells.length?section.cells:(section.cellKeys??[]).map(pointFromKey),cells=savedCells.filter(cell=>Number.isFinite(Number(cell?.x))&&Number.isFinite(Number(cell?.y))),xs=cells.map(cell=>Number(cell.x)),ys=cells.map(cell=>Number(cell.y)),numberOr=(value,fallback)=>Number.isFinite(Number(value))?Number(value):fallback,baseX=numberOr(section.x,xs.length?Math.min(...xs):0),baseY=numberOr(section.y,ys.length?Math.min(...ys):0),derivedMinX=numberOr(section.minX,xs.length?Math.min(...xs):baseX),derivedMinY=numberOr(section.minY,ys.length?Math.min(...ys):baseY),derivedMaxX=numberOr(section.maxX,xs.length?Math.max(...xs):baseX+Math.max(1,numberOr(section.w,1))-1),derivedMaxY=numberOr(section.maxY,ys.length?Math.max(...ys):baseY+Math.max(1,numberOr(section.h,1))-1),worldCols=Math.max(1,Math.floor(numberOr(world?.cols,derivedMaxX+1))),worldRows=Math.max(1,Math.floor(numberOr(world?.rows,derivedMaxY+1))),value=Math.max(0,Math.floor(Number(padding)||0)),minX=Math.max(0,Math.floor(derivedMinX)-value),minY=Math.max(0,Math.floor(derivedMinY)-value),maxX=Math.min(worldCols-1,Math.ceil(derivedMaxX)+value),maxY=Math.min(worldRows-1,Math.ceil(derivedMaxY)+value);return{x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1,minX,minY,maxX,maxY}
}
