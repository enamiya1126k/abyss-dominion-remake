import{normalizeCampaignHeroInvasion}from"./CampaignHeroEncounterSystem.js?v=3.1.22-build341";

export const CAMPAIGN_INVASION_INTEL_VERSION=1;

const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));
const freeze=value=>{
 if(value&&typeof value==="object"&&!Object.isFrozen(value)){Object.freeze(value);Object.values(value).forEach(freeze)}
 return value
};

// 王都門は予言が始まる直前の出発点。以後は十日間で魔王城へ至る。
export const CAMPAIGN_INVASION_ROUTE=freeze([
 {id:"capital-gate",day:0,progress:0,x:10,y:65,name:"西の大陸・王都門",shortName:"王都門",detail:"四人の勇者が遠征へ出発した、西の大陸王都の西門。"},
 {id:"harbor-city",day:1,progress:10,x:20,y:49,name:"西の大陸・港湾街",shortName:"港湾街",detail:"魔界へ渡る船と物資を整える、海辺の交易都市。"},
 {id:"departure-port",day:2,progress:20,x:29,y:29,name:"西岸・出航港",shortName:"出航港",detail:"西の大陸を離れ、黒潮海峡へ向かう船の出発点。"},
 {id:"black-current",day:3,progress:30,x:42,y:37,name:"黒潮海峡",shortName:"黒潮海峡",detail:"人界と魔界を隔てる、流れの読めない危険海域。"},
 {id:"demon-west",day:4,progress:40,x:55,y:48,name:"魔界・西岸",shortName:"魔界西岸",detail:"魔界側の上陸地点。ここから魔王領への陸路が始まる。"},
 {id:"border-fort",day:5,progress:50,x:63,y:56,name:"境界砦",shortName:"境界砦",detail:"魔王領の境を守る要塞。城へ続く主要街道の関門。"},
 {id:"seven-sins",day:6,progress:60,x:73,y:66,name:"七罪の荒野",shortName:"七罪の荒野",detail:"深淵の気配が満ちる、見通しの悪い広大な荒野。"},
 {id:"outer-domain",day:7,progress:70,x:81,y:55,name:"魔王領・外縁",shortName:"魔王領外縁",detail:"黒い尖塔が見え始める、魔王領の外周。"},
 {id:"demon-road",day:8,progress:80,x:85,y:39,name:"魔都街道",shortName:"魔都街道",detail:"魔都と魔王城を結ぶ、迎撃に適した最終街道。"},
 {id:"castle-outer",day:9,progress:90,x:86,y:25,name:"魔王城・外郭",shortName:"城外郭",detail:"城壁と防衛術式が張られた、正門前の最終防衛線。"},
 {id:"castle-gate",day:10,progress:100,x:82,y:12,name:"魔王城・正門",shortName:"魔王城",detail:"予言十日目、勇者一行が到達する決戦地点。"}
]);

export const CAMPAIGN_HERO_INTEL=freeze([
 {id:"myth_yori",name:"より",title:"微笑む蒼拳",role:"物理特化・瞬間火力",field:"二歩ほど観察したあと、こちらの進行方向を読んで最短距離で詰める。",combat:"自身を強化し、HPの少ない仲間を狙う。三体攻撃も持つ。",counter:"物理防御と攻撃低下を優先。観察中に距離を離す。",decisionRules:[{when:"奥義が使用可能",action:"最優先で奥義"},{when:"自身の強化が切れた",action:"物理攻撃を強化"},{when:"低HPの相手がいる",action:"単体集中攻撃"},{when:"相手が3体以上",action:"三体範囲攻撃"}]},
 {id:"myth_hide",name:"ひで",title:"緻密なる魔導士",role:"魔法攻撃・弱体・支援",field:"毎歩、最短経路を計算して直進。四歩ごとに一歩ぶん速くなる。",combat:"回復・強化と防御低下を使い分け、二体攻撃や連続魔法で崩す。",counter:"魔法防御とMP妨害が有効。直線を避け、区画移動で距離を作る。",decisionRules:[{when:"味方の平均HPが55%未満",action:"回復または強化"},{when:"高戦力の相手がいる",action:"防御低下を付与"},{when:"相手が2体以上",action:"二体範囲魔法"},{when:"崩しの好機",action:"連続魔法"}]},
 {id:"myth_enami",name:"えなみ",title:"共感と論理の勇者",role:"防護・反撃・高威力",field:"普段は六〜八マスの距離を保つが、仲間の傷が二割を超えると猛追する。",combat:"味方を守りつつ、高攻撃力の相手を狙う。範囲攻撃と大技にも注意。",counter:"勇者へ傷を付けると追跡が激化する。接触後は短期集中攻撃。",decisionRules:[{when:"味方が負傷",action:"障壁または強化"},{when:"高攻撃力の相手がいる",action:"優先して反撃"},{when:"相手が3体以上",action:"三体範囲攻撃"},{when:"奥義が使用可能",action:"高威力の決着技"}]},
 {id:"myth_rion",name:"りおん",title:"即断の商略家",role:"蘇生・回復・強化・弱体",field:"出口と進行方向を読み、三〜五マス先や分岐点へ先回りする。",combat:"蘇生、回復、強化、防御低下、MP吸収で勇者一行を立て直す。",counter:"最優先で行動を止める。出口へ直進せず、途中で進路を変える。",decisionRules:[{when:"味方が戦闘不能",action:"最優先で蘇生"},{when:"味方HPが60%未満",action:"回復または状態解除"},{when:"味方の強化がない",action:"全体強化"},{when:"相手のMPが低い",action:"MP吸収"}]}
]);

function campaignTimeline(state,ledger){
 const player=state?.player??{},rawReincarnation=state?.campaign100?.reincarnation319??{},cycle=clamp(Math.floor(rawReincarnation.cycle),0,999),reincarnationActive=cycle>0&&rawReincarnation.active!==false;
 const baseFloor=reincarnationActive?clamp(Math.floor(rawReincarnation.cycleMaxFloor||1),1,100):clamp(Math.floor(Math.max(player.currentFloor||1,player.maxFloor||1)),1,100);
 const floor=ledger.rewind?.active?clamp(Math.floor(ledger.rewind.currentFloor||81),1,100):baseFloor;
 const progress=clamp(floor-1,0,100),day=clamp(Math.ceil(floor/10),1,10),completed=Boolean(state?.campaign100?.finalCompleted||ledger.finalArena?.completed);
 return{floor,progress:completed?100:progress,day,cycle,reincarnationActive,completed}
}

function heroStatus(record={}){
 const remaining=record.defeated?0:clamp(record.remainingHpRate??1,0,1),wound=Math.round((1-remaining)*100),encounters=clamp(Math.floor(record.encounters),0,999);
 return{
  remainingHpPercent:Math.round(remaining*100),woundPercent:wound,encounters,
  status:record.defeated?"撃退済み":encounters>0?"遭遇済み":"未遭遇",
  outcome:record.defeated?"最終決戦から離脱":encounters>0?`残存HP ${Math.round(remaining*100)}%`:"戦闘情報なし"
 }
}

export function createCampaignInvasionIntelModel(state={}){
 const ledger=normalizeCampaignHeroInvasion(state),timeline=campaignTimeline(state,ledger),route=CAMPAIGN_INVASION_ROUTE.map(entry=>({...entry}));
 const currentIndex=timeline.completed?route.length-1:clamp(Math.ceil(timeline.progress/10),0,route.length-1),current=route[currentIndex],next=route[Math.min(route.length-1,currentIndex+1)];
 const heroes=CAMPAIGN_HERO_INTEL.map(profile=>({...profile,...heroStatus(ledger.heroes?.[profile.id])}));
 return{
  version:CAMPAIGN_INVASION_INTEL_VERSION,...timeline,route,currentIndex,current,next,
  remainingDays:timeline.completed||timeline.day>=10?0:Math.max(0,11-timeline.day),
  location:current.name,heroes,
  partyStatus:heroes.every(hero=>hero.status==="撃退済み")?"勇者一行を撃退":ledger.activeEncounterId?"一名と接触中":"魔王城へ進軍中"
 }
}
