// Each layout is authored separately; no procedural or network-dependent maps.
const pad=(id,x,y,w=108,extra={})=>({id,x,y,w,h:18,...extra});
const bug=(id,x,min,max,speed=36)=>({id,x,min,max,speed,y:300});
const cp=xs=>xs.map(x=>({x,y:300}));
const common={height:400,ground:300,mode:'coop',duration:150000,walls:[],bridges:[],switches:[],belts:[],winds:[],hazards:[]};
export const EXTRA591=[
 {...common,id:'coast',name:'潮騒の浮島',en:'TIDAL ISLANDS',tag:'海を渡る冒険',color:'#8ce4df',icon:'wind',level:'はじめて',theme:'coast',length:3100,goal:3010,
  description:'波の上の足場を渡る海辺の道。火の紋章を拾って、甲虫を追い払おう。',features:['波打つ足場','火の紋章','砂浜の近道'],
  sections:[{x:0,name:'貝がらの浜辺',sub:'火の紋章を拾ったら、攻撃！'},{x:1000,name:'潮風の浮島',sub:'上下する足場に乗って、海を渡ろう'},{x:2070,name:'夕凪の灯台',sub:'仲間を待ちながら、最後の島へ'}],
  checkpoints:cp([90,830,1520,2160,2710]),grounds:[[0,670],[780,1320],[1460,2020],[2140,2590],[2700,3200]],
  platforms:[pad('co0',690,235,110,{move:{axis:'y',range:18,period:2600}}),pad('co1',1050,236),pad('co2',1340,230,100,{move:{axis:'y',range:26,period:3100}}),pad('co3',1750,232),pad('co4',2040,238,105,{move:{axis:'y',range:21,period:2900}}),pad('co5',2620,238,90)],
  springs:[{id:'co-s0',x:640,y:300},{id:'co-s1',x:1980,y:300}],gems:[{id:'co-g0',x:1090,y:200},{id:'co-g1',x:1790,y:198}],
  enemies:[bug('co-b0',460,425,525),bug('co-b1',1120,1080,1210),bug('co-b2',1810,1780,1900),bug('co-b3',2860,2820,2920)]},
 {...common,id:'frost',name:'氷晶の回廊',en:'FROSTLIGHT PASS',tag:'すべる氷の冒険',color:'#b5dfff',icon:'bridge',level:'ふつう',theme:'frost',length:3200,goal:3090,
  description:'青い氷の道と追い風の回廊。止まりたい時は反対方向を押してブレーキ。',features:['氷の床','風の紋章','動く氷晶'],
  sections:[{x:0,name:'雪明かりの入口',sub:'氷の上は、反対方向でブレーキ'},{x:1100,name:'氷柱の回廊',sub:'風の紋章で、前の敵を吹き飛ばそう'},{x:2220,name:'オーロラの門',sub:'仲間ジャンプで上の道へ'}],
  checkpoints:cp([90,890,1660,2240,2820]),grounds:[[0,730],[860,1500],[1640,2090],[2210,2680],[2800,3300]],
  platforms:[pad('fr0',390,240),pad('fr1',750,240,108),pad('fr2',1130,233),pad('fr3',1510,236,115,{move:{axis:'x',range:16,period:3000}}),pad('fr4',2110,237,100),pad('fr5',2700,237,100)],
  springs:[{id:'fr-s0',x:2040,y:300}],gems:[{id:'fr-g0',x:440,y:209},{id:'fr-g1',x:1180,y:200}],
  winds:[{x:1550,w:350,y:50,h:250,speed:25}],enemies:[bug('fr-b0',580,540,660,30),bug('fr-b1',1300,1260,1390,30),bug('fr-b2',2460,2410,2510,34)]},
 {...common,id:'crystal',name:'蛍あかりの水晶洞',en:'LANTERN CAVERNS',tag:'光る洞窟の冒険',color:'#c6b9ff',icon:'leaf',level:'ふつう',theme:'crystal',length:3340,goal:3240,
  description:'光る大バネで洞窟の上段へ。上と下、好きな道を仲間と探そう。',features:['大バネ','上下の分かれ道','水晶の足場'],
  sections:[{x:0,name:'蛍石の洞窟',sub:'大バネで上の足場へ！'},{x:1160,name:'星くずの渡り廊下',sub:'上の道にも、下の道にもお宝'},{x:2310,name:'水晶の大聖堂',sub:'光る門まで、みんなで進もう'}],
  checkpoints:cp([90,850,1600,2330,2930]),grounds:[[0,730],[840,1450],[1580,2190],[2310,2780],[2910,3400]],
  platforms:[pad('cr0',430,205),pad('cr1',570,120,125),pad('cr2',740,230,100),pad('cr3',1150,220),pad('cr4',1330,140,115),pad('cr5',1470,235,100),pad('cr6',1970,180,110),pad('cr7',2200,230,100),pad('cr8',2590,210),pad('cr9',2810,235,100)],
  springs:[{id:'cr-s0',x:320,y:300,power:650},{id:'cr-s1',x:1850,y:300,power:650}],gems:[{id:'cr-g0',x:620,y:87},{id:'cr-g1',x:1370,y:107},{id:'cr-g2',x:2020,y:147}],
  enemies:[bug('cr-b0',970,920,1050),bug('cr-b1',1700,1660,1760),bug('cr-b2',3040,3000,3130)]},
 {...common,id:'ember',name:'灰燼の魔王城',en:'EMBER CITADEL',tag:'最後の城の冒険',color:'#ffb185',icon:'gear',level:'挑戦',theme:'ember',length:3480,goal:3370,duration:180000,
  description:'燃える城の蒸気と崩れる足場を突破。敵を踏み、紋章の力で仲間の道を開こう。',features:['崩れる足場','蒸気の予告','紋章で攻撃'],
  sections:[{x:0,name:'赤銅の城門',sub:'敵の頭を踏んで、弾んで進もう'},{x:1190,name:'火花の回廊',sub:'蒸気の予告が出たら、跳んで越えよう'},{x:2400,name:'灰燼の玉座',sub:'最後の門へ。仲間と帰ろう！'}],
  checkpoints:cp([90,940,1660,2350,2960]),grounds:[[0,770],[900,1500],[1620,2160],[2300,2790],[2920,3580]],
  platforms:[pad('em0',510,238,100),pad('em1',790,241,100,{crumble:true}),pad('em2',1290,228,115),pad('em3',1520,240,90,{crumble:true}),pad('em4',1990,232,100),pad('em5',2180,240,100,{crumble:true}),pad('em6',2610,227,110),pad('em7',2810,240,100,{crumble:true})],
  walls:[{id:'em-w0',x:1120,y:215,w:34,h:85},{id:'em-w1',x:2480,y:210,w:34,h:90}],springs:[],gems:[{id:'em-g0',x:1340,y:194},{id:'em-g1',x:2660,y:194}],
  enemies:[bug('em-b0',590,550,640,36),bug('em-b1',1770,1720,1840,40),bug('em-b2',3150,3100,3210,40)],
  hazards:[{id:'em-v0',x:1360,y:300,w:48,h:50,period:3500,on:700,offset:1100},{id:'em-v1',x:2650,y:300,w:50,h:50,period:3600,on:800,offset:1900}]}
];
export function adventure591(course){
 const kinds=course.id==='frost'||course.id==='sky'?['wind','fire']:['fire','wind'];
 const pickups=course.checkpoints.map((p,i)=>({id:course.id+'-power'+i,x:p.x+(i===0?100:55),y:275,kind:kinds[i%2]}));
 return {...course,mode:'coop',duration:Math.max(150000,course.duration),pickups,
  tag:course.id==='forest'?'はじめての冒険':course.tag.replace('レース','冒険'),
  description:course.description.replace('倒れた仲間もスイッチで救助！','旗から何度でも再開。')};
}
