// Fixed, authored second halves. Jump distances stay in world units; no stretching.
const tails = {
 forest: {rank:1, names:['深緑の見張り道','木もれ日の空中路','森の最終関門'], ground:[[-80,560],[725,1140],[1320,1720],[1900,2310],[2510,2970],[3170,3680]]},
 sky: {rank:2, names:['風車の防衛線','風乗りの大空洞','天空の連続渡り'], ground:[[-80,500],[690,1120],[1325,1740],[1930,2290],[2500,2910],[3110,3680]]},
 relay: {rank:2, names:['遺跡の守備隊','もう一つの架け橋','守護者の参道'], ground:[[-80,610],[785,1190],[1370,1790],[1980,2340],[2530,2970],[3160,3680]]},
 clock: {rank:3, names:['歯車の警備区画','崩落する振り子橋','最上階の防衛線'], ground:[[-80,590],[770,1180],[1380,1770],[1940,2350],[2560,2970],[3160,3680]]},
 coast: {rank:2, names:['海賊の見張り島','潮風の高架橋','荒波の灯台道'], ground:[[-80,570],[755,1150],[1330,1790],[1975,2370],[2560,2940],[3140,3680]]},
 frost: {rank:3, names:['氷壁の守備隊','氷晶の上り道','吹雪の連続回廊'], ground:[[-80,550],[745,1160],[1350,1750],[1950,2360],[2550,2920],[3120,3680]]},
 crystal: {rank:3, names:['水晶の見張り道','星明かりの上段路','大聖堂の最後の試練'], ground:[[-80,600],[790,1200],[1390,1790],[1990,2350],[2550,2980],[3180,3680]]},
 ember: {rank:4, names:['魔王軍の防衛線','溶岩の連続足場','玉座への最終関門'], ground:[[-80,530],[730,1140],[1350,1760],[1970,2350],[2560,2950],[3160,3680]]}
};
export function expedition594(course) {
 const spec=tails[course.id],start=course.length,id=s=>course.id+'-long-'+s;
 const grounds=course.grounds.map(p=>[...p]);
 grounds[grounds.length-1][1]=start+spec.ground[0][1];
 grounds.push(...spec.ground.slice(1).map(([a,b])=>[start+a,start+b]));
 const platforms=[...course.platforms],walls=[...course.walls],bridges=[...course.bridges],switches=[...course.switches],springs=[...course.springs],winds=[...course.winds],belts=[...course.belts],hazards=[...course.hazards],enemies=[...course.enemies],gems=[...course.gems];
 const checkpoints=[...course.checkpoints,...spec.ground.map(([a],i)=>({x:start+(i? a+65:90),y:300}))];
 const pickups=[...course.pickups,...spec.ground.map(([a],i)=>({id:id('power'+i),x:start+(i?a+112:155),y:275,kind:i%2?'wind':'fire'}))];
 const pad=(label,x,y,w=90,extra={})=>platforms.push({id:id(label),x:start+x,y,w,h:18,...extra});
 for(let i=0;i<spec.ground.length;i++){
  const [a,b]=spec.ground[i],safeStart=Math.max(100,a),count=[2,2,3,2,3,3][i];
  for(let j=0;j<count;j++){
   const x=start+safeStart+150+j*66;
   enemies.push({id:id('guard'+i+'-'+j),x,min:x-22,max:Math.min(start+b-32,x+26),y:300,speed:40+spec.rank*5+i*3+j*4});
  }
  if(i<5){
   const next=spec.ground[i+1][0],crumble=['clock','ember'].includes(course.id)&&i>1;
   pad('gap'+i,b+40,247-(i%2)*10,Math.max(66,92-spec.rank*4),crumble?{crumble:true}:{move:{axis:course.id==='coast'||course.id==='frost'?'y':'x',range:i>1?20:12,period:2600-i*130+spec.rank*110}});
   if(course.id==='relay'&&(i===1||i===3)){
    const bridge=id('bridge'+i);bridges.push({id:bridge,x:start+b,y:300,w:next-b,h:18});
    switches.push({id:bridge,x:start+next+48,y:300,label:i===1?'Ⅳ':'Ⅴ'});
    springs.push({id:id('spring'+i),x:start+b-25,y:300,power:710});
   }
  }
 }
 // Fire clears these shared barriers. The step / wall kick remains a normal route.
 for(const [n,x] of [[0,430],[1,spec.ground[5][0]+325]]){
  walls.push({id:id('barrier'+n),x:start+x,y:194,w:38,h:106,breakable:true});
  pad('step'+n,x-108,244,78);
 }
 // Wind's extra jump reaches a high route above the guard pack, with real supplies.
 for(const i of [1,4]){
  const [a,b]=spec.ground[i];pad('high'+i,a+163,142,b-a-185);
  gems.push({id:id('supply'+i),x:start+a+230,y:116});
 }
 gems.push({id:id('supply3'),x:start+spec.ground[3][0]+305,y:276});
 if(['sky','frost'].includes(course.id)){
  winds.push({x:start+1200,w:650,y:35,h:265,speed:course.id==='sky'?-32:28});
  belts.push({x:start+spec.ground[3][0]+160,w:150,y:300,speed:course.id==='sky'?65:-40});
 }
 if(['clock','ember','crystal'].includes(course.id))for(const i of [2,4]){
  const x=start+spec.ground[i][0]+175;
  hazards.push({id:id('vent'+i),x,y:300,w:54,h:58,period:3200-spec.rank*90,on:800+spec.rank*60,offset:i*370});
  pad('vent-route'+i,spec.ground[i][0]+95,221,155);
 }
 const description={
  forest:'森の奥へ続く６エリア。敵の集団は火で突破し、風の２段ジャンプで上の補給路へ。',
  sky:'逆風と細い浮遊足場が続く６エリア。風の２段ジャンプで空中の失敗を立て直そう。',
  relay:'全５つの橋をつなぐ長い遺跡。先行役がスイッチを踏み、火の攻撃で仲間の道を開こう。',
  clock:'後半は崩れる足場と蒸気が連続。上の補給路で立て直して、最上階を目指そう。',
  coast:'荒波の島々まで続く長い航路。動く足場と敵の集団を紋章で突破しよう。',
  frost:'氷と逆向きベルトで助走を乱される長い回廊。風の２段ジャンプが落下を救う。',
  crystal:'上段の補給路と蒸気の下道に分かれる洞窟。風で高く跳び、宝石で回復と補給。',
  ember:'６エリアの最難関。敵の密集・崩落・蒸気が重なる後半を、火と風を使い分けて越えよう。'
 };
 return {...course,length:start+3600,goal:start+3500,duration:course.id==='forest'||course.id==='ember'?300000:240000,
  level:spec.rank===1?'ふつう':spec.rank===2?'難しい':spec.rank===3?'上級':'最難関',
  tag:'６エリアのロング冒険',description:description[course.id],features:['全６エリア',course.id==='relay'?'５つの協力スイッチ':'火で突破・風で上段へ'],
  sections:[...course.sections.map((s,i)=>i===2?{...s,sub:'まだ冒険は続く。紋章を集めて先へ！'}:s),...spec.names.map((name,i)=>({x:start+i*1200,name,sub:['火は３体まで貫通。木の障害物も壊せる！','風を持って、空中でもう一度ジャンプ！','宝石で回復・弾を補給。最後の連続ジャンプ！'][i]}))],
  grounds,platforms,walls,bridges,switches,springs,winds,belts,hazards,enemies,gems,checkpoints,pickups};
}
