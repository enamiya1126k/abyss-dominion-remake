import {generateSectionDungeon} from '../core/DungeonSectionSystem.js?v=3.1.57-build377';
import {DUNGEON_THEMES} from '../data/dungeonThemes.js';

const id=n=>`forest-${n}`;
const positions=[[0,2],[1,2],[2,2],[1,1],[2,1],[2,0]];
const links=[[0,1,'east'],[1,2,'east'],[1,3,'north'],[2,4,'north'],[3,4,'east'],[4,5,'north']];
const cache=new Map();
export function chapterTwoLayout(serial=1){
 const key=Math.max(1,Number(serial)||1);if(cache.has(key))return cache.get(key);
 let seed=(key*2654435761+377)>>>0;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const layout=generateSectionDungeon({count:6,random,attributes:['nature','nature','water','nature','dark','dark'],sizeTiers:['small','standard','large','standard','large','huge'],patterns:['ribbon','fork','crescent','chambers','terraces','cavern'],customTopology:{nodes:positions.map(([gx,gy],n)=>({id:id(n),gx,gy})),edges:links.map(([a,b,direction])=>({a:id(a),b:id(b),direction}))}});
 layout.sections.forEach((s,n)=>{s.chapterRoom=n});
 if(cache.size>=8)cache.delete(cache.keys().next().value);cache.set(key,layout);return layout;
}
export function chapterTwoSpawn(run){return {...chapterTwoLayout(run.serial).sections[run.room??0].center};}
export function chapterTwoPortal(run,direction){return chapterTwoLayout(run.serial).sectionPortals.find(p=>p.sectionId===id(run.room)&&p.direction===direction);}
export function chapterTwoTheme(room=0){
 const water=room===2,deep=room>=4,base=DUNGEON_THEMES.jungle;
 return {...base,name:water?'月映りの水辺':deep?'黒根の侵食域':'境界の森',variant:room,accent:water?'#8ee6ee':deep?'#bd8ed1':'#96dba2',light:water?'#a5f4ed':deep?'#d4a6d5':'#b8f2aa',floor:water?'#194b5733':deep?'#45213c38':'#243e2524',wall:deep?'#1e0c223d':base.wall,minimapFloor:water?'#397b80':deep?'#685069':'#45734b',particle:water?'mote':'firefly'};
}
export function createChapterTwoWorld(run,rooms,encounters){
 const layout=chapterTwoLayout(run.serial),sectionId=id(run.room),sections=layout.sections;
 const reserved=new Set(layout.sectionPortals.flatMap(p=>[`${p.x},${p.y}`,`${p.arrivalX},${p.arrivalY}`]));
 const pick=(n,offset=0)=>{const section=sections[n],cells=section.cells.filter(c=>!reserved.has(`${c.x},${c.y}`)).sort((a,b)=>Math.hypot(a.x-section.center.x,a.y-section.center.y)-Math.hypot(b.x-section.center.x,b.y-section.center.y));const c=cells[Math.min(cells.length-1,offset)]??section.center;reserved.add(`${c.x},${c.y}`);return {...c,sectionId:id(n)}};
 const bosses=rooms.filter(r=>r.encounter).map(r=>({id:r.encounter,...pick(r.id),active:!run.defeated.includes(r.encounter),hidden:false,chapterEnemy:{speciesId:encounters[r.encounter].species[0],level:encounters[r.encounter].level}}));
 const chest={id:'forest-chest',...pick(2,18),open:run.chest,kind:'box'},spring={...pick(2,45),active:true,used:false,scale:4.5};
 return {...layout,chapterTwo:true,currentSectionId:sectionId,currentRoomId:sectionId,currentAttribute:sections[run.room].attribute,discoveredSections:run.visited.map(id),decorations:[],bosses,chests:[chest],hotSpring:spring,campaignKeys:[],enemies:[],bossDefeated:run.completed,exit:{...layout.start,active:false,locked:true},shop:null,theme:chapterTwoTheme(run.room)};
}
