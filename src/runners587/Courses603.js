// Three new, independently authored 12-area routes. The original eight are never mutated.
const W=1160;
const configs=[
 {id:'stormforge',name:'雷鳴の機関城',en:'TEMPEST ENGINE',theme:'clock',color:'#c3a7ff',species:'stone_golem',pattern:'wave',hp:26,
  order:['barrage','shaft','phase','press','relay','orbits','gale','swarm','phase','shaft','barrage','boss'],
  names:['雷撃の外郭','振り子の双塔','明滅する連絡橋','二重圧縮炉','通電の架け橋','公転する歯車','逆風の煙突','機関兵の迎撃線','崩れる雷光回廊','天を穿つ縦穴','砲列の最終防壁','嵐を喰う守護者'],
  description:'振り子、移動刃、放電柱と砲列の機関城。消える足場の間合いと壁キックを連続で使い、最後は嵐の守護者へ。'},
 {id:'abyssice',name:'深海の氷獄',en:'ABYSSAL GLACIER',theme:'frost',color:'#8cdbf1',species:'stone_golem',pattern:'wave',hp:28,
  order:['tide','mountain','barrage','orbits','tide','shaft','gale','phase','swarm','relay','mountain','boss'],
  names:['凍てつく潮の入口','氷壁の登り降り','落氷の砲撃路','漂う氷輪','満ちる深海回廊','氷柱の縦穴','深海の上昇流','消えゆく氷橋','氷獄の大群','沈没聖堂の封印','吹雪の最終稜線','深海の氷獄王'],
  description:'満ちる潮、落ちる氷柱、転がる氷塊。細い稜線を登って下り、上昇流と浮遊足場を乗り継ぐ深海の長い試練。'},
 {id:'eclipse',name:'終焉の星喰い城',en:'ECLIPSE CITADEL',theme:'ember',color:'#f5a2ac',species:'demon_lord',pattern:'fire',hp:34,
  order:['phase','orbits','shaft','barrage','press','gale','swarm','mountain','relay','phase','press','boss'],
  names:['消失する星の門','重力の輪','黒曜の壁キック','降り注ぐ火球','崩壊する圧縮門','星風の昇降路','終焉の包囲網','溶岩の尖塔群','最後の協力橋','消失と回転の回廊','双門の処刑炉','星喰いの魔王'],
  description:'明滅足場、公転、落下火球と回転炎を重ねた最終試練。退避する場所を読み、仲間と旗をつなぎ、強化された魔王を倒そう。'}
];
function pad(c,id,x,y,w=78,more={}){const s={id:c.id+'-'+id,x,y,w,h:18,...more};c.platforms.push(s);return s;}
function ground(c,a,b,y=300){c.grounds.push([a,b,y]);}
function wall(c,id,x,y,w,h){c.walls.push({id:c.id+'-'+id,x,y,w,h,climb602:true});}
function cut(c,a,b){c.grounds=c.grounds.flatMap(([x,end,y=300])=>end<=a||x>=b?[[x,end,y]]:[...(x<a?[[x,a,y]]:[]),...(end>b?[[b,end,y]]:[])]);}
function spike(c,id,x,w=65,y=300){c.hazards.push({id:c.id+'-'+id,kind:'spikes',x,y,w,h:22,period:1,on:1,offset:0});}
function saw(c,id,x,y,range=55,axis='x'){c.saws603.push({id:c.id+'-'+id,x,y,range,axis,period:4200,offset:c.saws603.length*.7});}
function swing(c,id,x,y,length=165){c.pendulums603.push({id:c.id+'-'+id,x,y,length,period:5100,offset:c.pendulums603.length*1.3});}
function bolt(c,id,x,y=300,h=190){c.lightning603.push({id:c.id+'-'+id,x,y,h,w:28,period:3300,warning:650,on:800,offset:c.lightning603.length*1300});}
function cannon(c,id,x,y=300,more={}){c.cannons603.push({id:c.id+'-'+id,x,y,dir:-1,range:650,speed:310,period:3500,warning:700,offset:c.cannons603.length*1100,kind:c.theme==='frost'?'ice':'fire',...more});}
function meteor(c,id,x,y=300){c.meteors603.push({id:c.id+'-'+id,x,y,from:y-360,warning:800,fall:1100,period:3600,offset:c.meteors603.length*850,kind:c.theme==='ember'?'fire':'ice'});}
function bars(c,id,x,y=240,length=77){c.firebars600.push({id:c.id+'-'+id,x,y,length,period:8600,offset:c.firebars600.length*1.1});}
function ledges(c,a,n=6,kind='normal'){
 const ys=[250,195,135,195,245,245];
 for(let i=0;i<n;i++)pad(c,'path-'+a+'-'+i,a+240+i*125,ys[i%6],82,kind==='phase'&&i%2?{phase603:{period:5100,on:3600,offset:i*650}}:kind==='orbit'?{move:{axis:'orbit'},orbit603:{rx:22,ry:18,period:4300,offset:i*Math.PI}}:i%3===2?{crumble:true}:{});
}
function shaft(c,a,index){
 ground(c,a,a+W);const top=-140-(index%2)*30,l=a+240,r=a+420;
 wall(c,'shaft-west-'+index,l,top,40,200-top);wall(c,'shaft-east-'+index,r,top,40,300-top);
 c.climbs602.push({id:c.id+'-shaft-'+index,left:l+40,right:r,bottom:300,top,entry:{x:a+210,y:300},exit:{x:r+20,y:top},mandatory:true});
 c.checkpoints.push({x:r+20,y:top});
 const steps=[[490,top+65],[605,top+145],[720,top+225],[850,top+305],[975,245]];
 steps.forEach(([x,y],i)=>pad(c,'shaft-down-'+index+'-'+i,a+x,y,75,{crumble:i===2}));
 swing(c,'shaft-axe-'+index,a+620,top-85,195);saw(c,'shaft-blade-'+index,a+875,130,42);spike(c,'shaft-spikes-'+index,a+725,75);
}
function phaseRoad(c,a,index){
 ground(c,a,a+190);ground(c,a+1010,a+W);ledges(c,a,6,'phase');
 swing(c,'phase-axe-'+index,a+475,-35,177);saw(c,'phase-saw-'+index,a+800,205,42,'y');
 if(c.theme==='ember')bars(c,'phase-fire-'+index,a+670,165,68);else meteor(c,'phase-ice-'+index,a+650,245);
}
function orbitRoad(c,a,index){
 ground(c,a,a+205);ground(c,a+1010,a+W);ledges(c,a,6,'orbit');
 cannon(c,'orbit-cannon-'+index,a+1060,300,{shotHeight:82});meteor(c,'orbit-meteor-'+index,a+475,230);saw(c,'orbit-blade-'+index,a+740,170,40,'y');
}
function presses(c,a,index){
 ground(c,a,a+W);
 for(let i=0;i<2;i++){const x=a+240+i*410,pitX=x+108;cut(c,pitX,pitX+88);ground(c,pitX,pitX+88,360);c.crushers.push({id:c.id+'-press-'+index+'-'+i,x,w:228,y:300,offset:i*2550,pitX,pitW:88,pitY:360});}
 swing(c,'press-axe-'+index,a+585,75,180);
 c.hazards.push({id:c.id+'-press-vent-'+index,x:a+953,y:300,w:105,h:85,period:4400,on:1150,offset:0});
}
function barrage(c,a,index){
 ground(c,a,a+360);ground(c,a+560,a+W);pad(c,'barrage-gap-'+index,a+409,247,86,{crumble:true});
 pad(c,'cannon-perch-'+index,a+700,220,86);cannon(c,'cannon-upper-'+index,a+744,220,{range:500});cannon(c,'cannon-lower-'+index,a+1070);
 for(let i=0;i<3;i++)meteor(c,'barrage-meteor-'+index+'-'+i,a+610+i*150,300);
 if(c.theme==='clock')for(const x of [230,870])bolt(c,'barrage-bolt-'+index+'-'+x,a+x);
 else if(c.theme==='ember')bars(c,'barrage-fire-'+index,a+900,245,78);
 else c.rollers600.push({id:c.id+'-barrage-roll-'+index,left:a+590,right:a+1030,y:300,period:5900});
 // Three independently breakable boxes, all one-hit; no broad shared stack collider.
 for(let i=0;i<3;i++)c.walls.push({id:c.id+'-crate-'+index+'-'+i,x:a+920,y:300-(i+1)*34,w:34,h:34,box:true,breakable:true});
}
function tideRoad(c,a,index){
 ground(c,a,a+W);
 for(let i=0;i<2;i++)c.tides600.push({id:c.id+'-tide-'+index+'-'+i,x:a+215+i*400,w:320,y:300,period:7500,offset:i*3200});
 for(let i=0;i<7;i++)pad(c,'reef-'+index+'-'+i,a+210+i*120,230-(i%3)*35,76,i%3===1?{move:{axis:'y',range:15,period:4100}}:{});
 for(let i=0;i<3;i++)meteor(c,'reef-ice-'+index+'-'+i,a+370+i*240,240);
 saw(c,'reef-blade-'+index,a+800,190,38,'y');
}
function mountain(c,a,index){
 ground(c,a,a+125);ground(c,a+1070,a+W);
 for(let i=0;i<13;i++){const y=300-Math.min(i,12-i)*72;pad(c,'ridge-'+index+'-'+i,a+145+i*70,y,64,{crumble:i%4===2&&i!==6});if(i===6)c.checkpoints.push({x:a+145+i*70+32,y});}
 for(let i=0;i<3;i++)meteor(c,'ridge-meteor-'+index+'-'+i,a+395+i*145,60-i*12);
 if(c.theme==='ember'){bars(c,'ridge-flame-'+index,a+560,-150,90);bars(c,'ridge-flame2-'+index,a+845,116,70);}else saw(c,'ridge-saw-'+index,a+720,-18,40,'y');
}
function gale(c,a,index){
 ground(c,a,a+180);ground(c,a+1000,a+W);
 const heights=[230,160,90,20,-50,20,90,160,230];
 heights.forEach((y,i)=>pad(c,'gale-'+index+'-'+i,a+190+i*95,y,70,i===4?{move:{axis:'y',range:18,period:4300}}:{}));
 c.jets603.push({id:c.id+'-jet-'+index,x:a+210,w:110,y:330,h:490,period:5300,on:3850,speed:360,kind:c.theme==='frost'?'water':'wind'});
 c.winds.push({x:a+500,y:-150,w:370,h:480,speed:-35});swing(c,'gale-axe-'+index,a+655,-130,165);saw(c,'gale-saw-'+index,a+905,180,45);meteor(c,'gale-ice-'+index,a+480,0);
}
function swarm(c,a,index){
 ground(c,a,a+W);c.swarms600.push({id:c.id+'-swarm-'+index,trigger:a+185,min:a+230,max:a+1040,y:300,count:20,interval:850});
 for(let i=0;i<3;i++)pad(c,'swarm-roof-'+index+'-'+i,a+310+i*250,225-(i%2)*55,100,{crumble:i===1});
 for(let i=0;i<2;i++)meteor(c,'swarm-meteor-'+index+'-'+i,a+415+i*385,235);
 if(c.theme==='clock')bolt(c,'swarm-bolt-'+index,a+810);else if(c.theme==='ember')bars(c,'swarm-fire-'+index,a+865,240,78);else c.rollers600.push({id:c.id+'-swarm-roll-'+index,left:a+270,right:a+1040,y:300,period:6200});
}
function relay(c,a,index){
 ground(c,a,a+220);ground(c,a+475,a+780);ground(c,a+1010,a+W);
 for(const [i,left,right] of [[0,220,475],[1,780,1010]]){const id=c.id+'-bridge-'+index+'-'+i;c.bridges.push({id,x:a+left,y:300,w:right-left,h:18});c.switches.push({id,x:a+right+43,y:300});c.springs.push({id:id+'-spring',x:a+left-28,y:300,power:735});}
 swing(c,'relay-axe-'+index,a+635,70,165);meteor(c,'relay-meteor-'+index,a+695,300);saw(c,'relay-saw-'+index,a+580,275,35);
}
function arena(c,a,index,spec){
 ground(c,a,c.length);const left=a+270,right=c.goal-90;
 c.boss600={id:c.id+'-boss603',speciesId:spec.species,maxHp:spec.hp,hp:spec.hp,pattern:spec.pattern,left,right,x:right-130,y:300,elite603:{warn:720,rest:820,dash:190,castSpeed:275,fan:5}};
 c.checkpoints.push({x:left-90,y:300});
 pad(c,'boss-west',left+130,240,85);pad(c,'boss-east',right-175,235,85);
 if(c.theme==='clock'){bolt(c,'boss-bolt-west',left+230,300,175);bolt(c,'boss-bolt-east',right-250,300,175);swing(c,'boss-axe',left+420,55,175);}
 else if(c.theme==='frost'){meteor(c,'boss-fall-west',left+230);meteor(c,'boss-fall-east',right-225);c.tides600.push({id:c.id+'-boss-tide',x:left+280,w:230,y:300,period:10000});}
 else {bars(c,'boss-orbit-west',left+245,248,65);bars(c,'boss-orbit-east',right-245,245,65);meteor(c,'boss-fall',left+430);}
}
const builders={shaft,phase:phaseRoad,orbits:orbitRoad,press:presses,barrage,tide:tideRoad,mountain,gale,swarm,relay,boss:arena};
function treasures(c,spec){
 // A deliberate upper detour above a safe area boundary; optional wind/buddy shortcut.
 const a=spec.order.indexOf('relay')*W;pad(c,'star-rise-a',a+25,240,65);pad(c,'star-rise-b',a+120,166,65);pad(c,'star-rise-c',a+225,92,65);pad(c,'star-rise-d',a+330,18,78);
 c.stars601.push({id:c.id+'-star1',x:a+369,y:-12,kind:'summit'});
 // Side expedition, visible only after looking below the first hollow bridge.
 const index=spec.order.indexOf('phase'),e=index*W+480,left=e-125,right=e+1910,floor=790;
 c.secrets600.push({id:c.id+'-secret603',left,right,entrance:e,floor,large602:true,exit:e+1830});c.hints601.push({kind:'secret',x:e-85,y:320,subtle602:true});
 const points=[[-80,620,255],[245,700,270],[575,770,275],[920,705,290],[1275,760,270],[1605,760,270]];
 points.forEach(([x,y,w],i)=>pad(c,'secret-floor-'+i,e+x,y,w,{secret602:true}));
 for(const [i,x,y] of [[0,170,660],[1,855,735],[2,1220,745],[3,1540,760]])pad(c,'secret-link-'+i,e+x,y,70,{crumble:i%2===0,secret602:true});
 c.stars601.push({id:c.id+'-star2',x:e+1380,y:727,kind:'secret'});
 c.enemies.push({id:c.id+'-secret-guard',x:e+970,y:705,min:e+944,max:e+1178,speed:75,advance:true});
 const west=e+1680,east=e+1825;wall(c,'secret-west',west,355,36,315);wall(c,'secret-east',east,300,36,460);
 cut(c,west+36,east+36);pad(c,'secret-cap',west+36,300,east-west);
 c.climbs602.push({id:c.id+'-secret-exit',left:west+36,right:east,bottom:760,top:300,entry:{x:west+65,y:760},exit:{x:east+18,y:300},mandatory:false});
 // The two seal pads are on stable ground across an area boundary, never a timed trap.
 const x=10*W,id=c.id+'-duet603';c.trials601.push({id,pads:[{x:x-60,y:300},{x:x+75,y:300}],reward:{x:x+5,y:215}});
 c.stars601.push({id:c.id+'-star3',x:x+5,y:215,trial:id,kind:'duet'});pad(c,'duet-star',x-35,244,80,{trial601:id});
}
export function nightmareCourses603(ember){return configs.map((spec,ci)=>{
 const c={id:spec.id,name:spec.name,en:spec.en,theme:spec.theme,art603:spec.id,expert603:true,color:spec.color,icon:'gear',level:['極難関Ⅰ','極難関Ⅱ','極難関Ⅲ'][ci],tag:'全12エリアの極難関',mode:'coop',height:400,ground:300,length:ember.length*2,goal:ember.goal*2,duration:720000,description:spec.description+' 全長は魔王城の２倍。３つの星と旗は全員共通。１人でも通常ルートを攻略でき、２人以上なら協力の星を集められる。',features:['全12エリア・距離２倍',ci===0?'刃・雷・壁キック':ci===1?'潮・落氷・上昇流':'消失足場・複合攻撃']};
 for(const k of ['grounds','platforms','walls','bridges','switches','switchAccess602','belts','winds','hazards','springs','gems','enemies','pickups','checkpoints','firebars600','swarms600','tides600','rollers600','secrets600','crushers','stars601','trials601','hints601','climbs602','saws603','pendulums603','lightning603','cannons603','meteors603','jets603'])c[k]=[];
 c.sections=spec.names.map((name,i)=>({x:i*W,name,sub:''}));c.modules603=[];
 spec.order.forEach((kind,i)=>{const a=i*W;c.modules603.push({kind,left:a,right:i===11?c.length:a+W});c.checkpoints.push({x:a+(i?70:90),y:300});builders[kind](c,a,i,spec);c.pickups.push({id:c.id+'-rune-'+i,x:a+115,y:273,kind:i===11?'fire':['fire','wind','ice','thunder','stone','water'][i%6]});if(i%2===1)c.gems.push({id:c.id+'-boost-'+i,x:a+155,y:268});});
 treasures(c,spec);c.grounds.sort((a,b)=>a[0]-b[0]);c.checkpoints.sort((a,b)=>a.x-b.x);
 return c;
});}
