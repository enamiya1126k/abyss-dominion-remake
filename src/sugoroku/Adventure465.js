import{BOARD463}from'./Board463.js';
export const WORLD465={width:1600,height:2400};
export const REGIONS465=[{name:'月影の樹海',hint:'木漏れ日を抜け、運命の旅へ',color:'#83c8ad'},{name:'蒼晶の洞窟',hint:'結晶の光を追って、奥深くへ',color:'#77cfff'},{name:'灰燼の火山',hint:'溶岩の橋を渡り、先を目指せ',color:'#ffb475'},{name:'星冠の王城',hint:'最後の階段。その先に王座が待つ',color:'#d1adff'}];
export const region465=n=>REGIONS465[Math.min(3,Math.floor((n?.index??0)/20))];
// Coordinates only. Node IDs, branches, effects and distance rules stay in Board463.
export const BOARD465=BOARD463.map(n=>({...n,next:[...n.next]}));
export const NODES465=Object.fromEntries(BOARD465.map(n=>[n.id,n]));
for(const n of BOARD465.filter(n=>!n.detour)){
 const row=Math.floor(n.index/8),col=row%2?7-n.index%8:n.index%8;
 n.x=320+col*132+Math.sin(row*1.6+col*.5)*26;
 n.y=155+row*230+Math.sin(col*.75+row)*38;
}
for(const rootId of [7,31,55]){
 const root=NODES465[rootId],dir=rootId===31?-1:1;
 const coords=[[125,-46],[240,25],[232,149],[112,216]];
 for(let j=0;j<4;j++){const n=NODES465[`b${rootId}-${j}`];n.x=Math.max(65,Math.min(WORLD465.width-65,root.x+coords[j][0]*dir));n.y=root.y+coords[j][1];}
}
export function path465(n,end){const mx=(n.x+end.x)/2,my=(n.y+end.y)/2;return Math.abs(n.y-end.y)<100?`M${n.x} ${n.y} Q${mx} ${my-18} ${end.x} ${end.y}`:`M${n.x} ${n.y} C${n.x+30} ${my} ${end.x-30} ${my} ${end.x} ${end.y}`;}
export const tileArt465={start:'✦',goal:'♛',draw:'▤',safe:'▥',move:'↑',back:'↓',skip:'☾',trade:'⇄',discard:'−',special:'✧',lose:'×',steal:'↝',rest:'▤',cleanse:'✺',wager:'♜',attribute:'✦',gate:'♜'};
