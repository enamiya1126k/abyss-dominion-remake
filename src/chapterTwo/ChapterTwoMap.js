import {CHAPTER_TWO_AREAS,chapterTwoArea} from './ChapterTwoContent.js?v=3.1.58-build378';
import {generateSectionDungeon} from '../core/DungeonSectionSystem.js?v=3.1.57-build377';
import {DUNGEON_THEMES} from '../data/dungeonThemes.js';

const id=n=>`forest-${n}`;
const positions=[[0,2],[1,2],[2,2],[1,1],[2,1],[2,0]];
const links=[[0,1,'east'],[1,2,'east'],[1,3,'north'],[2,4,'north'],[3,4,'east'],[4,5,'north']];
const cache=new Map();
export function chapterTwoLayout(serial=1,area=0){
 const region=CHAPTER_TWO_AREAS[area]??CHAPTER_TWO_AREAS[0],number=Math.max(1,Number(serial)||1),key=`${area}:${number}`;if(cache.has(key))return cache.get(key);
 let seed=(number*2654435761+377+area*1789)>>>0;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const layout=generateSectionDungeon({count:6,random,attributes:area?[region.element,region.element,'water',region.element,region.element,region.element]:['nature','nature','water','nature','dark','dark'],sizeTiers:['small','standard','large','standard','large','huge'],patterns:area%2?['terraces','cavern','chambers','crescent','fork','ribbon']:['ribbon','fork','crescent','chambers','terraces','cavern'],customTopology:{nodes:region.positions.map(([gx,gy],n)=>({id:id(n),gx,gy})),edges:region.rooms.flatMap(r=>Object.entries(r.links).filter(([,n])=>n>r.id).map(([direction,n])=>({a:id(r.id),b:id(n),direction})))}});
 layout.sections.forEach((s,n)=>{s.chapterRoom=n});
 if(cache.size>=8)cache.delete(cache.keys().next().value);cache.set(key,layout);return layout;
}
export function chapterTwoSpawn(run){return {...chapterTwoLayout(run.serial,run.area??0).sections[run.room??0].center};}
export function chapterTwoPortal(run,direction){return chapterTwoLayout(run.serial,run.area??0).sectionPortals.find(p=>p.sectionId===id(run.room)&&p.direction===direction);}
export function chapterTwoTheme(room=0,area=0){
 const region=CHAPTER_TWO_AREAS[area]??CHAPTER_TWO_AREAS[0],base=DUNGEON_THEMES.jungle,asset=`assets/ui/chapter-two/${region.skin}-378.png?v=3.1.58-build378`;
 return {...base,id:`chapter-two-${region.skin}`,name:region.name,variant:room,accent:region.accent,light:region.accent,floorAsset:asset,wallAsset:asset,atlasSplit:true,architecture:area>=2,floor:'#15203018',wall:'#09091235',dark:'rgba(2,3,8,.24)',wallFace:'rgba(9,8,17,.75)',wallRim:region.accent+'88',wallJoint:'#353044',minimapFloor:area===3?'#918269':area===1?'#855044':'#635578',particle:area===0?'firefly':'dust'};
}
export function createChapterTwoWorld(run,rooms,encounters){
 const layout=chapterTwoLayout(run.serial,run.area??0),sectionId=id(run.room),sections=layout.sections;
 const reserved=new Set(layout.sectionPortals.flatMap(p=>[`${p.x},${p.y}`,`${p.arrivalX},${p.arrivalY}`]));
 const pick=(n,offset=0)=>{const section=sections[n],cells=section.cells.filter(c=>!reserved.has(`${c.x},${c.y}`)).sort((a,b)=>Math.hypot(a.x-section.center.x,a.y-section.center.y)-Math.hypot(b.x-section.center.x,b.y-section.center.y));const c=cells[Math.min(cells.length-1,offset)]??section.center;reserved.add(`${c.x},${c.y}`);return {...c,sectionId:id(n)}};
 const bosses=rooms.filter(r=>r.encounter).map(r=>({id:r.encounter,...pick(r.id),active:!run.defeated.includes(r.encounter),hidden:false,chapterEnemy:{speciesId:encounters[r.encounter].species[0],visualSpeciesId:encounters[r.encounter].authorities?.[0]??null,endgameBossId:encounters[r.encounter].authorities?.[0]??null,level:encounters[r.encounter].level}}));
 const chest={id:'forest-chest',...pick(2,18),open:run.chest,kind:'box'},spring={...pick(2,45),active:true,used:false,scale:4.5};
 return {...layout,chapterTwo:true,currentSectionId:sectionId,currentRoomId:sectionId,currentAttribute:sections[run.room].attribute,discoveredSections:run.visited.map(id),decorations:[],bosses,chests:[chest],hotSpring:spring,campaignKeys:[],enemies:[],bossDefeated:run.completed,exit:{...layout.start,active:false,locked:true},shop:null,theme:chapterTwoTheme(run.room,run.area??0)};
}
