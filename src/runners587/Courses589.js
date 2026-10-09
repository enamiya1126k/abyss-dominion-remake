import {nightmareCourses603} from './Courses603.js';
import {expedition602} from './Courses602.js';
import {cooperativeCourse601} from './Courses601.js';
import {signatureCourse600} from './Courses600.js';
import {adventure597} from './Gimmicks597.js';
import {challenge595} from './Challenge595.js';
import {expedition594} from './Expedition594.js';
import {EXTRA591,adventure591} from './Adventures591.js';
import {COURSE587} from './Level587.js';

const platform=(id,x,y,w=105,more={})=>({id,x,y,w,h:18,...more});
const bug=(id,x,min,max,speed=38)=>({id,x,min,max,speed,y:300});
const flags=xs=>xs.map(x=>({x,y:300}));
const base={height:400,ground:300,walls:[],bridges:[],switches:[],belts:[],winds:[],hazards:[],mode:'race',duration:75000};
const CLASSIC603=[
 {...base,...COURSE587,id:'forest',name:'こもれびアドベンチャー',en:'FOREST ADVENTURE',tag:'基本のレース',color:'#a7cf86',icon:'leaf',level:'はじめて',theme:'forest',description:'森から魔王城へ。仲間ジャンプで上段ルートをつなごう。',features:['仲間ジャンプ','宝石で加速','浮遊足場']},
 {...base,id:'sky',name:'風車の空中庭園',en:'WIND GARDEN',tag:'風に乗るレース',color:'#80dceb',icon:'wind',level:'ふつう',theme:'sky',length:3300,goal:3220,
  description:'追い風と向かい風、動くベルト。風向きを読んで空を渡ろう。',features:['風のトンネル','コンベア','大ジャンプ'],
  sections:[{x:0,name:'風車の空中庭園',sub:'ベルトの流れに乗って、助走！'},{x:1220,name:'逆風の回廊',sub:'向かい風は足場でひと休み'},{x:2260,name:'天空の滑走路',sub:'追い風と大バネでラストスパート'}],
  checkpoints:flags([90,800,1350,1800,2380,2910]),grounds:[[0,560],[680,1080],[1220,1580],[1700,2140],[2260,2680],[2810,3380]],
  platforms:[platform('s0',580,220,100,{move:{axis:'y',range:22,period:3000}}),platform('s1',1110,235,105,{move:{axis:'x',range:24,period:3300}}),platform('s2',1590,202,115,{move:{axis:'y',range:25,period:3600}}),platform('s3',2170,230,105),platform('s4',2730,222,100),platform('s5',2960,242,110)],
  springs:[{id:'s-spring0',x:510,y:300,power:660},{id:'s-spring1',x:1760,y:300,power:640},{id:'s-spring2',x:2650,y:300,power:670}],
  gems:[{id:'s-gem0',x:850,y:182},{id:'s-gem1',x:1880,y:164},{id:'s-gem2',x:3010,y:209}],
  enemies:[bug('s-bug0',940,895,1000),bug('s-bug1',1940,1900,2000,44),bug('s-bug2',3100,3055,3140,48)],
  belts:[{x:220,w:260,y:300,speed:70},{x:1290,w:260,y:300,speed:-60},{x:2320,w:280,y:300,speed:90}],
  winds:[{x:540,w:620,y:60,h:240,speed:55},{x:1640,w:510,y:50,h:250,speed:-40},{x:2630,w:340,y:50,h:250,speed:45}]},
 {...base,id:'relay',name:'つながるスイッチ遺跡',en:'BRIDGE TOGETHER',tag:'全員で協力',color:'#98e8c8',icon:'bridge',level:'協力',theme:'relay',mode:'coop',duration:120000,length:2920,goal:2820,
  description:'対岸のスイッチを踏んで橋を開こう。倒れた仲間もスイッチで救助！ 全員ゴールで成功。',features:['対岸スイッチ','みんなの橋','仲間を救助'],
  sections:[{x:0,name:'つながるスイッチ遺跡',sub:'大バネで対岸へ。スイッチを踏もう！'},{x:1180,name:'二つ目の架け橋',sub:'先に渡った仲間が、みんなの道を開く'},{x:2080,name:'約束の門',sub:'３つの橋を開いて、全員でゴール！'}],
  checkpoints:flags([90,860,1160,1650,1990,2440]),grounds:[[0,580],[810,1370],[1590,2180],[2390,3000]],
  platforms:[platform('r0',300,244,110),platform('r1',440,176,100),platform('r2',1020,236,100),platform('r3',1210,176,100),platform('r4',1790,237,100),platform('r5',1930,171,100),platform('r6',2580,232,120)],
  springs:[{id:'r-spring0',x:560,y:300,power:710},{id:'r-spring1',x:1350,y:300,power:710},{id:'r-spring2',x:2160,y:300,power:710}],
  bridges:[{id:'bridge0',x:580,y:300,w:230,h:18},{id:'bridge1',x:1370,y:300,w:220,h:18},{id:'bridge2',x:2180,y:300,w:210,h:18}],
  switches:[{id:'bridge0',x:910,y:300,label:'Ⅰ'},{id:'bridge1',x:1690,y:300,label:'Ⅱ'},{id:'bridge2',x:2490,y:300,label:'Ⅲ'}],
  gems:[{id:'r-gem0',x:485,y:143},{id:'r-gem1',x:1250,y:143},{id:'r-gem2',x:1970,y:139}],enemies:[],
  walls:[{id:'r-wall0',x:1120,y:226,w:32,h:74},{id:'r-wall1',x:2020,y:204,w:32,h:96}]},
 {...base,id:'clock',name:'カチコチ時計塔',en:'CLOCKWORK KEEP',tag:'壁キックのレース',color:'#efbd85',icon:'gear',level:'挑戦',theme:'clock',duration:90000,length:3020,goal:2920,
  description:'壁を蹴って塔を越え、崩れる足場と噴き出す蒸気を抜けよう。',features:['壁キック','崩れる足場','蒸気トラップ'],
  sections:[{x:0,name:'カチコチ時計塔',sub:'壁に向かってジャンプ。触れたらもう一度！'},{x:835,name:'歯車の壁',sub:'壁を蹴って登ろう。蒸気は光ったら注意！'},{x:2150,name:'秒針の回廊',sub:'ひび割れた足場は、止まらず次へ！'}],
  checkpoints:flags([90,865,1650,2320]),grounds:[[0,720],[835,1470],[1600,2150],[2260,3100]],
  walls:[{id:'c-wall0',x:430,y:175,w:40,h:125},{id:'c-wall1',x:1080,y:155,w:40,h:145},{id:'c-wall2',x:1810,y:165,w:40,h:135},{id:'c-wall3',x:2590,y:160,w:40,h:140}],
  platforms:[platform('c0',305,244,85),platform('c1',540,231,90),platform('c2',740,250,80,{crumble:true}),platform('c3',1200,235,100),platform('c4',1490,250,95,{crumble:true}),platform('c5',1930,236,95),platform('c6',2160,249,100,{crumble:true}),platform('c7',2700,230,100)],
  springs:[],gems:[{id:'c-gem0',x:450,y:143},{id:'c-gem1',x:1100,y:123},{id:'c-gem2',x:1830,y:133},{id:'c-gem3',x:2610,y:128}],enemies:[],
  hazards:[{id:'vent0',x:950,y:300,w:56,h:59,period:3100,on:950,offset:800},{id:'vent1',x:1990,y:300,w:62,h:59,period:3300,on:950,offset:1600},{id:'vent2',x:2785,y:300,w:55,h:59,period:2900,on:850,offset:400}]}
,...EXTRA591].map(adventure591).map(expedition594).map(challenge595).map(adventure597).map(signatureCourse600).map(cooperativeCourse601).map(expedition602);
export const COURSES589=Object.freeze([...CLASSIC603,...nightmareCourses603(CLASSIC603.at(-1))]);
export const course589=value=>COURSES589.find(c=>c.id===(typeof value==='string'?value:value?.courseId))??COURSES589[0];
export const readyGate589=g=>course589(g).switches.every(s=>g.switches?.includes(s.id))&&(!course589(g).boss600||g.boss600?.hp===0);
export const hazard589=(h,elapsed)=>{const phase=((elapsed+h.offset)%h.period+h.period)%h.period;return{active:phase<h.on,warning:phase>h.period-650,phase};};
export const inHazard589=(p,course,elapsed,world={})=>course.hazards.some(h=>!(world.ventsOff?.[h.id]>world.lastAt)&&hazard589(h,elapsed).active&&p.x+10>h.x&&p.x-10<h.x+h.w&&(h.kind==='spikes'?p.y>=h.y-h.h-1:p.y>h.y-h.h)&&p.y-28<h.y);
export function configureRunners589(g,party,member,m){
 if(m.kind!=='course')return false;
 if(party.hostId!==member.playerId)throw Error('コースは部屋主が選べます');
 if(!COURSES589.some(c=>c.id===m.courseId))throw Error('表示されているコースを選んでね');
 if(g.courseId!==m.courseId){g.courseId=m.courseId;party.members.forEach(p=>p.ready=false);}
 return true;
}
