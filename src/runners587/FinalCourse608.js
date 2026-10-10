export function finalCourse608(){
 const c={id:'finale',name:'終焉・双魂の魔王城',en:'TWIN SOULS · FINAL CITADEL',theme:'ember',art603:'eclipse',expert603:true,final608:true,minPlayers608:2,color:'#e68b91',icon:'gear',level:'最終・協力必須',tag:'ソロ攻略不可・2〜4人',mode:'coop',height:400,ground:300,length:9600,goal:9470,duration:900000,description:'2人以上限定の最終決戦。足場の維持、離れた紋章への同時攻撃、氷の運搬、別々の番兵を倒す連携で七つの関門を突破する。魔王の結界は異なる2人の攻撃が1秒以内に重なった時だけ破れる。突破済みの関門と旗は共有。星は3つの高所寄り道。',features:['2人以上必須・七重の関門','双魂結界の魔王・全8エリア']};
 for(const k of ['grounds','platforms','walls','bridges','switches','switchAccess602','belts','winds','hazards','springs','gems','enemies','pickups','checkpoints','firebars600','swarms600','tides600','rollers600','secrets600','crushers','stars601','trials601','hints601','climbs602','saws603','pendulums603','lightning603','cannons603','meteors603','jets603','modules603','gates608'])c[k]=[];
 const names=['片翼の奈落橋','双塔の共鳴','一瞬の交差砲火','氷棺の護送','双刃の処刑台','崩界の二重奏','心拍の門','双魂魔王・最終決戦'];
 c.sections=names.map((name,i)=>({x:i*1200,name,sub:''}));
 const pad=(id,x,y,w=44,extra={})=>{const p={id:'finale-'+id,x,y,w,h:18,...extra};c.platforms.push(p);return p;};
 const cannon=(id,x,y,offset=0)=>c.cannons603.push({id:'finale-'+id,x,y,period:2600,warning:750,speed:285,range:850,offset});
 const meteor=(id,x,y)=>c.meteors603.push({id:'finale-'+id,x,y,from:y-330,period:3200,warning:950,fall:1100,offset:700});
 for(let i=0;i<7;i++){
  const a=i*1200,id='finale-gate-'+i,kind=['relay','sync','targets','ice','hunt','relay','targets'][i];
  const gate={id,kind,x:a+1080,y:300,left:{x:a+135,y:300},right:{x:a+990,y:300},route:[],window: i===6?500:750};
  c.gates608.push(gate);c.modules603.push({kind:'final-'+kind,left:a,right:a+1200});c.checkpoints.push({x:a+80,y:300});
  c.grounds.push([a,a+205,300],[a+940,a+1200,300]);
  c.pickups.push({id:'finale-power-'+i,x:a+105,y:273,kind:'fire'});
  if(kind==='ice'){
   c.grounds.push([a+205,a+315,300]);pad('ice-bridge',a+315,300,625,{trial601:id});
   gate.iceId='finale-key';gate.right={x:a+915,y:300};
   c.enemies.push({id:gate.iceId,x:a+280,y:300,min:a+245,max:a+320,speed:0,prefrozen600:true});
   meteor('ice-watch',a+630,300);c.tides600.push({id:'finale-water',x:a+420,w:310,y:300,period:6200});
  }else{
   const heights=i===1?[228,156,12,-60,12,84,156]:i===5?[228,156,84,-12,84,156,228]:[228,156,84,12,84,156,228];
   for(let j=0;j<7;j++){
    const extra={};if(kind==='relay')extra.trial601=id;
    if(j===2||j===5)extra.move={axis:'x',range:12,period:2600+j*170};
    if(j===3)extra.crumble=true;
    if(i===6&&j!==1&&j!==6)extra.phase603={period:4600,on:3600,offset:-j*650};
    const p=pad('road-'+i+'-'+j,a+240+j*100,heights[j],i===6?40:i===5?36:44,extra);gate.route.push(p.id);
   }
   if(kind==='sync'){
    gate.left={x:a+362,y:156};gate.right={x:a+862,y:156};gate.rescue608={x:a+440,y:12};
    pad('buddy-rescue',a+382,84,48,{trial601:id+'-ladder'});c.hints601.push({kind:'buddy',x:a+362,y:156});
   }
   if(kind==='targets')gate.targets=[{id:id+'-west',x:a+362,y:132},{id:id+'-east',x:a+862,y:204}];
   if(kind==='hunt'){
    gate.guards=['finale-warden-west','finale-warden-east'];
    gate.guards.forEach((id,j)=>{const x=a+(j?862:362),y=j?228:156;c.enemies.push({id,x,y,min:x-10,max:x+10,speed:18,axe604:true});});gate.window=3500;
   }
   if(i===0||i===5)cannon('battery-'+i,a+1010,300,i*173);
   if(i===1||i===4)c.pendulums603.push({id:'finale-swing-'+i,x:a+670,y:-95,length:145,period:4000,swing:.75,r:18,offset:.5});
   if(i===2||i===6)meteor('fall-'+i,a+660,170);
   if(i===5)c.firebars600.push({id:'finale-flame',x:a+562,y:-34,length:64,period:7400,offset:0});
  }
 }
 // Both roles get a safe rendezvous after each permanent seal release.
 c.grounds.push([8400,9600,300]);c.checkpoints.push({x:8480,y:300});c.pickups.push({id:'finale-power-boss',x:8510,y:273,kind:'fire'});
 for(const [j,x,y] of [[0,8660,230],[1,8790,160],[2,9180,230],[3,9050,160]])pad('arena-'+j,x,y,64);
 c.boss600={id:'finale-overlord',speciesId:'demon_lord',hp:48,maxHp:48,pattern:'fire',left:8720,right:9360,x:9220,y:300,final608:true,elite603:{warn:600,rest:760,dash:240,castSpeed:320,fan:5}};
 c.lightning603.push({id:'finale-boss-lightning',x:8990,y:300,h:165,w:20,period:4400,warning:850,on:600,offset:1500});
 c.firebars600.push({id:'finale-boss-fire',x:9120,y:210,length:55,period:8100,offset:1.5});
 pad('ice-buddy-launch',4270,228,62);c.hints601.push({kind:'buddy',x:4300,y:228});
 for(const [i,x,y] of [[0,1750,12],[1,4320,156],[2,8980,160]]){
  pad('treasure-low-'+i,x-40,y-72,38);pad('treasure-high-'+i,x+45,y-144,36,{crumble:true});
  c.stars601.push({id:'finale-star-'+i,x:x+63,y:y-174,kind:'final',slot604:i});
 }
 c.grounds.sort((a,b)=>a[0]-b[0]);return c;
}
