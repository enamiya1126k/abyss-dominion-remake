import{dangerTile477,dangerSvg477}from'./DangerTiles477.js';
import{LANDMARKS469}from'./Landmarks469.js';
import{BOARD463}from'./Board463.js';
export const WORLD465={width:1600,height:3200};
export const REGIONS465=[{name:'月影の樹海',color:'#83c8ad'},{name:'蒼晶の洞窟',color:'#77cfff'},{name:'灰燼の火山',color:'#ffb475'},{name:'星冠の王城',color:'#d1adff'}];
// Centerline traced from the actual painted road in assets/sugoroku467/world.png.
// Coordinates are fractions of the artwork; changing the map requires tracing again.
export const ROAD467=[[.17,.053],[.177,.065],[.23,.074],[.34,.075],[.46,.079],[.59,.084],[.72,.094],[.79,.108],[.816,.122],[.80,.135],[.75,.147],[.66,.154],[.53,.157],[.40,.158],[.31,.17],[.26,.182],[.23,.198],[.225,.215],[.25,.229],[.33,.238],[.45,.246],[.55,.254],[.65,.268],[.715,.286],[.765,.31],[.785,.328],[.75,.344],[.69,.353],[.57,.357],[.45,.357],[.33,.362],[.275,.373],[.249,.391],[.228,.411],[.224,.43],[.27,.447],[.36,.457],[.47,.47],[.57,.484],[.68,.504],[.77,.523],[.825,.54],[.839,.553],[.812,.57],[.76,.585],[.66,.594],[.54,.6],[.43,.608],[.33,.62],[.287,.632],[.266,.647],[.242,.667],[.254,.681],[.295,.696],[.37,.706],[.46,.711],[.54,.719],[.63,.735],[.679,.754],[.718,.777],[.737,.797],[.739,.824],[.718,.849],[.668,.868],[.58,.886],[.50,.892]];
const points=ROAD467.map(([x,y])=>({x:x*1600,y:y*3200})),lengths=[0];
for(let i=1;i<points.length;i++)lengths.push(lengths.at(-1)+Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y));
export function roadPoint467(t){const d=t*lengths.at(-1);let i=1;while(i<lengths.length-1&&lengths[i]<d)i++;const a=points[i-1],b=points[i],f=(d-lengths[i-1])/(lengths[i]-lengths[i-1]);return{x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f}}
export const BOARD465=BOARD463.map(n=>({...n,next:[...n.next],...(!n.detour?roadPoint467(n.index/79):{})}));
for(const n of BOARD465){const m=LANDMARKS469[n.id];if(m)Object.assign(n,{x:m.x,y:m.y});}
export const NODES465=Object.fromEntries(BOARD465.map(n=>[n.id,n]));
// Spacious, individually traced side routes. IDs and game rules are unchanged.
// Move the first junction away from the temple entrance so its pawn and label fit.
Object.assign(NODES465['7'],{x:935,y:360,repositioned473:true});
export const DETOURS473={7:[[1090,210],[1150,65],[950,65],[770,125]],31:[[1500,1090],[1480,1260],[1300,1280],[1170,1210]],55:[[1340,1990],[1330,2160],[1110,2190],[1000,2070]]};
for(const [id,points]of Object.entries(DETOURS473))points.forEach(([x,y],i)=>Object.assign(NODES465[`b${id}-${i}`],{x,y,branchOrder473:i+1}));
export const region465=n=>REGIONS465[n?.y<580?0:n?.y<1170?1:n?.y<2080?2:3];
export function path465(n,end){return`M${n.x} ${n.y} L${end.x} ${end.y}`}
export const tileArt465={start:'✦',goal:'♛',draw:'＋',safe:'▥',move:'↑',back:'↓',skip:'☾',trade:'⇄',discard:'−',special:'✧',lose:'×',steal:'↝',rest:'＋',cleanse:'✺',wager:'♜',attribute:'✦',gate:'♜'};
export function tileSvg467(n,label){const landmark=['start','goal','special','gate','wager'].includes(n.kind);const r=landmark?26:20;return`<ellipse class="sg-ground-shadow467" cy="8" rx="${r+6}" ry="${r*.65}"/><ellipse class="sg-stone-top465" rx="${r}" ry="${r*.72}"/><ellipse class="sg-rune-ring467" rx="${r-4}" ry="${r*.72-4}"/>${dangerSvg477(dangerTile477(n),r)}<text class="sg-tile-icon" x="0" y="6">${n.icon&&n.kind==='crystal477'?n.icon:tileArt465[n.kind]??n.icon}</text><text class="sg-tile-number" x="${-r-4}" y="-11">${n.detour?'寄'+n.branchOrder473:n.index}</text><text class="sg-tile-effect464" x="0" y="${r*.72+19}">${label}</text>${n.fork?'<circle cx="24" cy="-17" r="9" class="sg-fork-dot"/><text x="24" y="-13" class="sg-fork-label">分</text>':''}`}

export function bridgeSvg467(a,b){const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1,nx=-dy/l*13,ny=dx/l*13,d=path465(a,b);return`<g class="sg-bridge467"><path class="sg-bridge-shadow467" d="${d}"/><path class="sg-bridge-deck467" d="${d}"/><path class="sg-bridge-stones467" d="${d}"/><path class="sg-bridge-rail467" d="M${a.x+nx} ${a.y+ny} L${b.x+nx} ${b.y+ny} M${a.x-nx} ${a.y-ny} L${b.x-nx} ${b.y-ny}"/></g>`}
