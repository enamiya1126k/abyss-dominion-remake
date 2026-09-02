const pointFromKey=value=>{
 const[x,y]=String(value??"").split(",").map(Number);
 return Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null
};
const sectionCells=section=>{
 const source=Array.isArray(section?.cells)&&section.cells.length?section.cells:(section?.cellKeys??[]).map(pointFromKey);
 return source.filter(point=>Number.isFinite(Number(point?.x))&&Number.isFinite(Number(point?.y))).map(point=>({x:Number(point.x),y:Number(point.y)}))
};
const objectSection=(world,entry)=>entry?.sectionId??world?.sectionByCell?.[`${Math.round(Number(entry?.x)||0)},${Math.round(Number(entry?.y)||0)}`]??null;

export function buildSectionMiniMapModel(world,{discoveredSectionIds=null,currentSectionId=null}={}){
 const sections=Array.isArray(world?.sections)?world.sections:[],byId=new Map(sections.map(section=>[String(section.id),section])),visited=new Set((discoveredSectionIds??world?.discoveredSections??[world?.startSectionId]).filter(Boolean).map(String));
 if(currentSectionId??world?.currentSectionId)visited.add(String(currentSectionId??world.currentSectionId));
 const frontier=new Set();
 for(const edge of world?.sectionGraph??[]){const a=String(edge.a),b=String(edge.b);if(visited.has(a)&&!visited.has(b))frontier.add(b);if(visited.has(b)&&!visited.has(a))frontier.add(a)}
 const visible=new Set([...visited,...frontier]),modeFor=id=>visited.has(id)?"visited":frontier.has(id)?"frontier":"hidden";
 const modelSections=sections.filter(section=>visible.has(String(section.id))).map(section=>({
  id:String(section.id),index:Number(section.index)||0,attribute:section.attribute??"neutral",mode:modeFor(String(section.id)),cells:sectionCells(section),center:{x:Number(section.center?.x)||0,y:Number(section.center?.y)||0}
 }));
 const seenEdges=new Set(),edges=[];
 for(const edge of world?.sectionGraph??[]){const a=String(edge.a),b=String(edge.b),id=[a,b].sort().join("|");if(seenEdges.has(id)||!visible.has(a)||!visible.has(b)||!visited.has(a)&&!visited.has(b))continue;seenEdges.add(id);
  const forward=(world?.sectionPortals??[]).find(portal=>String(portal.sectionId)===a&&String(portal.targetSectionId)===b),reverse=(world?.sectionPortals??[]).find(portal=>String(portal.sectionId)===b&&String(portal.targetSectionId)===a),from=forward?{x:Number(forward.x),y:Number(forward.y)}:{...(byId.get(a)?.center??{x:0,y:0})},to=reverse?{x:Number(reverse.x),y:Number(reverse.y)}:{...(byId.get(b)?.center??{x:0,y:0})};
  edges.push({id,a,b,from,to,discovered:visited.has(a)&&visited.has(b)})
 }
 const markers=[],pushMarker=(kind,entry,{hidden=false}={})=>{if(!entry||hidden)return;const sectionId=String(objectSection(world,entry)??"");if(!visited.has(sectionId))return;markers.push({kind,sectionId,x:Number(entry.x)||0,y:Number(entry.y)||0})};
 for(const entry of world?.campaignKeys??[])if(!entry.collected)pushMarker("key",entry);
 for(const entry of world?.chests??[])if(!entry.open)pushMarker("chest",entry);
 if(world?.boss)pushMarker("boss",world.boss,{hidden:Boolean(world.boss.hidden)});
 if(world?.trophyChest&&!world.trophyChest.open)pushMarker("trophy",world.trophyChest);
 if(world?.hotSpring?.active&&!world.hotSpring.used)pushMarker("spring",world.hotSpring);
 if(world?.exit?.active!==false&&!world?.exit?.locked)pushMarker("exit",world.exit);
 const points=modelSections.flatMap(section=>section.cells.length?section.cells:[section.center]).concat(edges.flatMap(edge=>[edge.from,edge.to]));
 const xs=points.map(point=>Number(point.x)).filter(Number.isFinite),ys=points.map(point=>Number(point.y)).filter(Number.isFinite),bounds={minX:xs.length?Math.min(...xs):0,maxX:xs.length?Math.max(...xs):1,minY:ys.length?Math.min(...ys):0,maxY:ys.length?Math.max(...ys):1};
 return{sections:modelSections,edges,markers,visitedIds:[...visited],frontierIds:[...frontier],currentSectionId:String(currentSectionId??world?.currentSectionId??""),bounds}
}

export function fitMiniMapTransform(model,width,height,padding=8){
 const safeWidth=Math.max(1,Number(width)||1),safeHeight=Math.max(1,Number(height)||1),pad=Math.max(0,Math.min(Math.min(safeWidth,safeHeight)/3,Number(padding)||0)),bounds=model?.bounds??{minX:0,maxX:1,minY:0,maxY:1},spanX=Math.max(1,Number(bounds.maxX)-Number(bounds.minX)+1),spanY=Math.max(1,Number(bounds.maxY)-Number(bounds.minY)+1),scale=Math.max(.001,Math.min((safeWidth-pad*2)/spanX,(safeHeight-pad*2)/spanY)),drawWidth=spanX*scale,drawHeight=spanY*scale;
 return{scale,offsetX:(safeWidth-drawWidth)/2-Number(bounds.minX)*scale,offsetY:(safeHeight-drawHeight)/2-Number(bounds.minY)*scale,width:safeWidth,height:safeHeight,padding:pad}
}

export function projectMiniMapPoint(transform,point){return{x:Number(transform?.offsetX||0)+Number(point?.x||0)*Number(transform?.scale||1),y:Number(transform?.offsetY||0)+Number(point?.y||0)*Number(transform?.scale||1)}}
