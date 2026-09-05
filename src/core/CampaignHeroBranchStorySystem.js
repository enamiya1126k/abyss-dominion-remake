import{CAMPAIGN_MAX_FLOOR,HERO_PARTY_IDS}from"./Campaign100System.js?v=3.1.1-build319";
import{CAMPAIGN_HERO_ENCOUNTER_SCHEDULE,campaignHeroEncounterDefinition,normalizeCampaignHeroEncounterState}from"./CampaignHeroEncounterSystem.js?v=3.1.5-build324";

export const CAMPAIGN_HERO_BRANCH_STORY_VERSION=2;
export const CAMPAIGN_HERO_BRANCH_OUTCOMES=Object.freeze(["repelled","hero-victory","escaped"]);

const plainRecord=value=>Boolean(value&&typeof value==="object"&&!Array.isArray(value));
const cleanText=(value,max=160)=>typeof value==="string"?value.replace(/[\u0000-\u001f\u007f]/g,"").trim().slice(0,max):"";
const boundedInteger=(value,fallback=0,min=0,max=Number.MAX_SAFE_INTEGER)=>{const number=Number(value);return Number.isFinite(number)?Math.max(min,Math.min(max,Math.floor(number))):fallback};
const clampRate=value=>Math.max(0,Math.min(1,Number(value)||0));
const line=(speakerId,text,tone="normal",directives={})=>({speakerId,text,tone,...directives});
const portrait=(speciesId,asset=null)=>Object.freeze({type:"monster-sprite",speciesId,asset});

const CHARACTERS=Object.freeze({
 sairan:Object.freeze({id:"sairan",name:"魔王サイラーン",title:"旧世界を留める魔王",storyOnly:true,portrait:portrait("campaign_sairan","./assets/story/campaign-sairan.png?v=3.1.2-build321")}),
 lionel:Object.freeze({id:"lionel",name:"預言者リオネル",title:"最弱の器に潜む預言者",storyOnly:true,avatarPlayable:true,portrait:portrait("campaign_lionel","./assets/story/campaign-lionel.png?v=3.1.2-build321")}),
 myth_enami:Object.freeze({id:"myth_enami",name:"えなみ",title:"共感と論理の勇者",portrait:portrait("myth_enami")}),
 myth_yori:Object.freeze({id:"myth_yori",name:"より",title:"微笑む蒼拳",portrait:portrait("myth_yori")}),
 myth_hide:Object.freeze({id:"myth_hide",name:"ひで",title:"緻密なる魔導士",portrait:portrait("myth_hide")}),
 myth_rion:Object.freeze({id:"myth_rion",name:"りおん",title:"即断の商略家",portrait:portrait("myth_rion")})
});
const HERO_NAMES=Object.freeze({myth_enami:"えなみ",myth_yori:"より",myth_hide:"ひで",myth_rion:"りおん"});

const PRELUDE_LINES=Object.freeze({
 "myth_yori:1":Object.freeze([
  line("myth_enami","いや、4人で行く必要ある？ まず気配だけ確かめたらええやん。","normal"),
  line("myth_hide","必要ある。誰かがやられたら、その後を引き継ぐ者が要る。","serious"),
  line("myth_yori","いや！ どうせ弱いっしょ！ オレが偵察してくるわ！！","confident"),
  line("myth_rion","待って。単独行動の損失率、まだ値段にしてない。","urgent"),
  line("myth_rion","おい待て待て！！","urgent"),
  line(null,"制止を笑って振り切り、よりは一人で迷宮へ踏み込んだ。","narration")
 ]),
 "myth_hide:1":Object.freeze([
  line("myth_hide","足跡、魔力残滓、移動周期。次に現れる区画は計算できた。","serious"),
  line("myth_enami","全員で行けばええやん。計算できたなら迷わんやろ。","normal"),
  line("myth_hide","四人分の足音は相手の進路を変える。検証には一人が最適だ。","serious"),
  line("myth_yori","その計算、一番大事な前提また抜けてへん？","teasing"),
  line("myth_hide","確認済みだ。……食料以外は。","quiet"),
  line(null,"空腹という前提だけを置き忘れ、ひでは予測地点へ向かった。","narration")
 ]),
 "myth_enami:1":Object.freeze([
  line("myth_enami","向こうにも、ここを守る理由があるんやと思う。僕が先に話してくる。","gentle"),
  line("myth_yori","話すだけの顔ちゃうで。さっきから武器ぜんぶ持ってるやん。","teasing"),
  line("myth_enami","話が通じるなら使わへん。仲間を狙うなら、話は別や。","cold"),
  line("myth_hide","単独交渉の生還率は六十八%。僕らが追えば九十一%。","serious"),
  line("myth_enami","追わんでええよ。途中で別のこと気になっても、今回は戻るから。","normal"),
  line(null,"笑顔を残し、えなみは魔物の声を聞くため一人で迷宮へ入った。","narration")
 ]),
 "myth_rion:1":Object.freeze([
  line("myth_rion","正面から四人で探すより、出口を買い占めた方が早いよ。","confident"),
  line("myth_hide","迷宮の出口に所有権はない。","serious"),
  line("myth_rion","今から作る。先回りして通行料を取れば、相手から来る。最高やな。","confident"),
  line("myth_enami","目的、いつの間に金儲けになったん？","normal"),
  line("myth_rion","勇者活動も黒字なら長続きする。いこうぜ！","confident"),
  line(null,"返事を待たず、りおんは最短らしい遠回りへ駆け出した。","narration")
 ]),
 "myth_yori:2":Object.freeze([
  line("myth_yori","前は様子見やった。今度は最初から拳で聞く。","confident"),
  line("myth_enami","拳で聞くって、日本語としてもう答え決まってるやん。","normal"),
  line("myth_hide","前回の軌道は記録した。単独でも修正値を渡せる。","serious"),
  line("myth_rion","帰ってきたら戦闘記録を売ろう。負けたら企画ごと没ね。","teasing"),
  line("myth_yori","おっと〜！？ 勝つ前提で刷っといて。","confident"),
  line(null,"二度目の単独偵察は、最初から再戦の顔をしていた。","narration")
 ]),
 "myth_hide:2":Object.freeze([
  line("myth_hide","前回の誤差は式ではなく、僕の観測位置にあった。再計算する。","serious"),
  line("myth_yori","今度こそ食料も式に入れた？","teasing"),
  line("myth_hide","入れた。水も、退路も、君が勝手について来る確率も。","normal"),
  line("myth_yori","フォー！！！！ 完璧やん。","teasing"),
  line("myth_enami","それ、ついて来てほしいって言うてない？","normal"),
  line(null,"否定する前に、ひでは新しい追跡式を抱えて歩き出した。","narration")
 ]),
 "myth_enami:2":Object.freeze([
  line("myth_enami","前に聞けなかった答えがある。もう一回、僕が行く。","cold"),
  line("myth_rion","交渉なら条件を増やそう。命、情報、帰り道。全部こっちの資産だよ。","serious"),
  line("myth_enami","うん。だから今度は、仲間を値段に入れさせへん。","cold"),
  line("myth_hide","感情値が平常の三倍。単独行動には反対だ。","serious"),
  line("myth_enami","メンタル！！ 大丈夫。冷静に怒ってるだけ。","confident"),
  line(null,"穏やかな声とは逆に、迷宮の空気がえなみの足元で冷えた。","narration")
 ]),
 "myth_rion:2":Object.freeze([
  line("myth_rion","前回の逃げ道、全部地図にした。今度は先に出口で待つよ。","confident"),
  line("myth_hide","その地図、上下が逆だ。","serious"),
  line("myth_rion","逆から見れば合ってる。現地で方向ごと売り直す。","normal"),
  line("myth_yori","迷子を商売に変える速さだけは神話級やな。","teasing"),
  line("myth_rion","やったぜ！ じゃ、利益と情報を回収してくる。","confident"),
  line(null,"りおんは上下逆の地図を迷いなく掲げ、再び単独で先行した。","narration")
 ])
});

const HERO_RESULT_LINES=Object.freeze({
 myth_yori:Object.freeze({repelled:"ディフィカルト……せやけど、この拳が届いたことは忘れへん。",heroVictory:"イージー！！ でも、その一撃は前より深かったで。",escaped:"おっと〜！？ 逃げ足まで観察対象に入れとくわ。"}),
 myth_hide:Object.freeze({repelled:"いやいやいや笑。最後の一手だけ、式から抜けていました。",heroVictory:"フォー！！！！ 勝利。ただし損傷値は想定を超えています。",escaped:"待ってくださいよ〜！ 退路の再計算が終わってません。"}),
 myth_enami:Object.freeze({repelled:"なんやコイツ……強いやん。僕の負けでも、仲間には触れさせへん。",heroVictory:"おいおい！そんなもんか？！ ……でも、その理由は覚えとく。",escaped:"もうちょっとどこか行きたいん？ 次は話の途中で逃がさへんで。"}),
 myth_rion:Object.freeze({repelled:"おつかれナス。損失は出たけど、情報は残した。",heroVictory:"やったぜ！ でも修理代まで考えたら赤字やな。",escaped:"また今度やな。次は逃げ道にも値段を付けとく。"})
});

const PARTY_RETURN_LINES=Object.freeze({
 myth_yori:Object.freeze({"hero-victory":"イージー！！ ……ただいま。思ったより骨あったわ。",escaped:"おっと〜！？ 先に逃げられた。次は出口から殴る。"}),
 myth_hide:Object.freeze({"hero-victory":"計算どおり勝った。損傷だけが、計算より大きい。",escaped:"追跡式は正しかった。相手が式の外へ逃げただけだ。"}),
 myth_enami:Object.freeze({"hero-victory":"戻ったで。話は半分だけ聞けた。残り半分は戦いながらや。",escaped:"逃げられた。向こうの理由、まだ最後まで聞けてへん。"}),
 myth_rion:Object.freeze({"hero-victory":"やったぜ！ 勝ったけど、装備の修理で利益はゼロ。",escaped:"また今度やな。出口を一つ無料にしたのが失敗やった。"})
});

function normalizeBranchState(ledger){
 const source=plainRecord(ledger.branchStories323)?ledger.branchStories323:{},receipts=[...new Set((Array.isArray(source.receipts)?source.receipts:[]).map(value=>cleanText(value,180)).filter(Boolean))].slice(-256),pending=[],history=[];
 for(const entry of Array.isArray(source.pending)?source.pending:[]){
  if(!plainRecord(entry)||!["result","report","party"].includes(entry.part))continue;const encounter=campaignHeroEncounterDefinition(entry.encounterId),outcome=CAMPAIGN_HERO_BRANCH_OUTCOMES.includes(entry.outcome)?entry.outcome:null,id=cleanText(entry.id,180);if(!encounter||!outcome||!id||receipts.includes(id)||pending.some(item=>item.id===id))continue;
  pending.push({id,encounterId:encounter.id,heroId:encounter.heroId,part:entry.part,outcome,floor:boundedInteger(entry.floor,encounter.floor,1,CAMPAIGN_MAX_FLOOR),heroHpRate:clampRate(entry.heroHpRate),hurtPercent:boundedInteger(entry.hurtPercent,0,0,100),storyCycle:boundedInteger(entry.storyCycle,ledger.storyCycle??0,0,999)});
 }
 for(const entry of Array.isArray(source.history)?source.history:[]){const encounter=campaignHeroEncounterDefinition(entry?.encounterId),outcome=CAMPAIGN_HERO_BRANCH_OUTCOMES.includes(entry?.outcome)?entry.outcome:null;if(!encounter||!outcome)continue;const record={encounterId:encounter.id,heroId:encounter.heroId,outcome,floor:boundedInteger(entry.floor,encounter.floor,1,CAMPAIGN_MAX_FLOOR),heroHpRate:clampRate(entry.heroHpRate),hurtPercent:boundedInteger(entry.hurtPercent,0,0,100),storyCycle:boundedInteger(entry.storyCycle,ledger.storyCycle??0,0,999)};const index=history.findIndex(item=>item.encounterId===record.encounterId&&item.storyCycle===record.storyCycle);if(index>=0)history.splice(index,1);history.push(record)}
 ledger.branchStories323={version:CAMPAIGN_HERO_BRANCH_STORY_VERSION,storyCycle:boundedInteger(source.storyCycle,ledger.storyCycle??0,0,999),receipts,pending:pending.slice(-24),history:history.slice(-16)};return ledger.branchStories323
}

export function normalizeCampaignHeroBranchStoryState(value){const ledger=normalizeCampaignHeroEncounterState(value);normalizeBranchState(ledger);return ledger}

function charactersFor(dialogue){return[...new Set(dialogue.map(entry=>entry.speakerId).filter(Boolean))].map(id=>CHARACTERS[id]).filter(Boolean)}
function storyScene(definition,{id,part,title,summary,dialogue,castIds=null,location="勇者一行・野営地",eyebrow="HEROES / SIDE STORY",routeHidden=false,variant="default"}={}){return{id,kind:"hero-branch",storyTrack:"hero-encounter",storyPart:part,encounterId:definition.id,heroId:definition.heroId,floor:definition.floor,day:definition.day,routeProgress:(definition.day-1)*10,title,summary,location,eyebrow,routeHidden,variant,backgroundAsset:routeHidden?"./assets/ui/battle/boss-throne.png":"./assets/ui/trials/abyss-corridor-room.png",completeLabel:part==="prelude"?"探索へ戻る":part==="party"?"物語を閉じる":"次の場面",characters:castIds?castIds.map(id=>CHARACTERS[id]).filter(Boolean):charactersFor(dialogue),dialogue};}
function historyPreludeLine(ledger,definition){
 if(definition.cycle<2)return null;const record=ledger.heroes?.[definition.heroId];if(!record)return null;
 if(record.lastOutcome==="hero-victory")return line(definition.heroId,"前は勝ってる。でも、残った傷まで勝利とは言えへん。今度は無傷で戻る。","serious");
 if(record.lastOutcome==="escaped")return line(definition.heroId,"前は取り逃がした。今度は足音より先に、逃げ道を読む。","serious");
 if(record.remainingHpRate<.99)return line(definition.heroId,"前の傷はまだ残ってる。それでも、同じ相手なら僕が行く。","wounded");
 return null
}
function continuityPreludeLine(ledger,heroId){
 const fallen=HERO_PARTY_IDS.filter(id=>id!==heroId&&ledger.heroes?.[id]?.defeated),wounded=HERO_PARTY_IDS.filter(id=>id!==heroId&&!ledger.heroes?.[id]?.defeated&&(ledger.heroes?.[id]?.remainingHpRate??1)<.8);
 if(fallen.length)return line(null,`${fallen.map(id=>HERO_NAMES[id]).join("と")}が戻らない事実を抱えたまま、それでも一行は前へ進んでいた。`,"narration");
 if(wounded.length)return line(null,`${wounded.map(id=>HERO_NAMES[id]).join("と")}の傷はまだ癒えていない。次の単独行動には、その焦りも混じっていた。`,"narration");
 return null
}
function preludeScene(ledger,definition){
 const base=[...(PRELUDE_LINES[`${definition.heroId}:${definition.cycle}`]??[])],context=[continuityPreludeLine(ledger,definition.heroId),historyPreludeLine(ledger,definition)].filter(Boolean),dialogue=[...context,...base];return storyScene(definition,{id:`branch-prelude-${definition.id}`,part:"prelude",title:`${HERO_NAMES[definition.heroId]}、単独行動`,summary:`勇者一行から${HERO_NAMES[definition.heroId]}が一人で離れた。この会話の後から、迷宮内で遭遇する可能性が生まれる。`,dialogue,variant:context.length?"continuity":"default"})
}

function resultScene(ledger,payload,definition){
 const name=HERO_NAMES[definition.heroId],hurt=payload.hurtPercent,outcome=payload.outcome,lead=outcome==="repelled"?`${name}は魔王軍に退けられ、勇者一行への帰路を失った。`:outcome==="hero-victory"?`${name}は戦いに勝った。しかし刻まれた${hurt}%の傷は消えない。`:`追跡は途切れた。${name}は魔王軍を見失い、戦闘には至らなかった。`,dialogue=[line(null,lead,"narration"),line(definition.heroId,HERO_RESULT_LINES[definition.heroId]?.[outcome]??"この結果は、次へ持ち越す。",outcome==="repelled"?"repelled":outcome==="hero-victory"?"confident":"quiet")];
 if(outcome!=="escaped"&&hurt>0)dialogue.push(line(null,`この遭遇で残った損傷は ${hurt}%。十日目の戦いまで引き継がれる。`,"narration"));
 return storyScene(definition,{id:payload.id,part:"result",title:outcome==="repelled"?"迷宮側の勝利":outcome==="hero-victory"?"勇者側の勝利":"追跡から離脱",summary:lead,dialogue,location:`第${payload.floor}階・遭遇地点`,eyebrow:"ENCOUNTER / RESULT",variant:outcome})
}
function reportScene(payload,definition){
 const name=HERO_NAMES[definition.heroId],hurt=payload.hurtPercent,outcome=payload.outcome,report=outcome==="repelled"?`${name}を途中で撃退しました。十日目の勇者軍から一人が欠けます。`:outcome==="hero-victory"?`先遣部隊は${name}に敗北。ただし、相手へ${hurt}%の傷を刻みました。`:`${name}との接触を回避しました。こちらの戦力は温存されています。`,reply=outcome==="repelled"?"よい。予言から一人を削った。余が足を動かさずとも、未来は動くようだ。":outcome==="hero-victory"?"敗北は構わぬ。残した傷は、十日目に働く兵だ。記録して次を放て。":"逃げ切ったのか、逃がしたのか。……報告書には前者と書いておけ。",dialogue=[line("lionel",`サイラーン様。第${payload.floor}階の報告です。${report}`,"serious",{stageEffect:"lionel-slime"}),line("sairan",reply,"command",{stageEffect:"lionel-slime"}),line("lionel","承知しました。次の区画にも、結果を引き継いで布陣します。","resolute",{stageEffect:"lionel-slime"})];
 return storyScene(definition,{id:payload.id,part:"report",title:"玉座への進捗報告",summary:`スライムの姿を借りたリオネルが、${name}との遭遇結果をサイラーンへ伝える。`,dialogue,location:"魔王城・玉座の間",eyebrow:"DEMON LORD / REPORT",routeHidden:true,variant:outcome})
}
function partyScene(ledger,payload,definition){
 const heroId=definition.heroId,name=HERO_NAMES[heroId],outcome=payload.outcome,hurt=payload.hurtPercent,others=HERO_PARTY_IDS.filter(id=>id!==heroId&&!ledger.heroes?.[id]?.defeated),castIds=HERO_PARTY_IDS.filter(id=>!ledger.heroes?.[id]?.defeated&&(outcome!=="repelled"||id!==heroId)),dialogue=[];
 if(outcome==="repelled"){
  dialogue.push(line(null,`${name}は野営地へ戻らなかった。残された仲間は、途切れた足音の意味を理解した。`,"narration"));
  if(others.includes("myth_hide"))dialogue.push(line("myth_hide",`${name}の反応が消えた。捜索より先に、残った${others.length}人の生存率を計算する。`,"serious"));
  if(others.includes("myth_enami"))dialogue.push(line("myth_enami","計算だけで置いていかへん。最後におった場所まで、必ず迎えに行く。","cold"));
  if(others.includes("myth_rion"))dialogue.push(line("myth_rion","損失にはしない。残した情報も意思も、全部こっちの戦力にする。","serious"));
  if(others.includes("myth_yori"))dialogue.push(line("myth_yori","次は一人で行かへん。あいつの分まで、全員で殴りに行く。","serious"));
 }else{
  dialogue.push(line(heroId,PARTY_RETURN_LINES[heroId]?.[outcome]??"戻った。次へ進もう。",outcome==="hero-victory"?"confident":"quiet"));
  if(hurt>0){if(heroId==="myth_hide"||others.includes("myth_hide"))dialogue.push(line("myth_hide",`損傷は${hurt}%。勝敗に関係なく、その傷は十日目まで残る。`,"serious"));else dialogue.push(line(null,`戦いで刻まれた${hurt}%の傷は、十日目まで消えずに残る。`,"narration"))}
  else if(others.includes("myth_hide"))dialogue.push(line("myth_hide",outcome==="escaped"?"待ってくださいよ〜！ 逃げ道は計算してました。……塞ぐ人の配置、忘れてました。":"いいゾ〜！コレ〜！ 無傷で帰還、計算どおりです。……帰還祝いの買い出し、忘れてました。","normal"));
  if(others.includes("myth_yori"))dialogue.push(line("myth_yori",outcome==="escaped"?"おっと〜！？ ほな次は僕も一緒に行くわ。帰ってこれたんやし、まず座り。":"イージー！！ ……って、僕は留守番やったな。おかえり。","gentle"));
  if(heroId!=="myth_enami"&&others.includes("myth_enami"))dialogue.push(line("myth_enami",outcome==="hero-victory"?"勝った顔してるけど、傷まで無かったことにはせえへんで。":(castIds.length===4?"戻ってきたならええ。次は四人で話を終わらせる。":"戻ってきたならええ。次は残った仲間で、話を終わらせる。"),"gentle"));
  if(heroId!=="myth_rion"&&others.includes("myth_rion"))dialogue.push(line("myth_rion",outcome==="hero-victory"?"勝利の記録は残す。治療費を引いても価値はあるよ。":"逃げられた経路も商品になる。次の先回りに使おう。","normal"));
 }
 const fallen=HERO_PARTY_IDS.filter(id=>ledger.heroes?.[id]?.defeated&&id!==heroId);if(fallen.length)dialogue.push(line(null,`会話の輪には、戻らない${fallen.map(id=>HERO_NAMES[id]).join("と")}の空白が残っていた。`,"narration"));
 return storyScene(definition,{id:payload.id,part:"party",title:"同じ頃、勇者一行は",summary:`第${payload.floor}階の遭遇結果は、勇者側の会話と次の判断にも残った。`,dialogue,castIds,location:"勇者一行・夜営地",eyebrow:"HEROES / SAME TIMELINE",variant:outcome})
}
function aftermathScene(ledger,payload){const definition=campaignHeroEncounterDefinition(payload.encounterId);if(!definition)return null;if(payload.part==="result")return resultScene(ledger,payload,definition);if(payload.part==="report")return reportScene(payload,definition);return partyScene(ledger,payload,definition)}

export function nextCampaignHeroBranchStoryScene(value,{floor=null}={}){
 const ledger=normalizeCampaignHeroBranchStoryState(value),branch=ledger.branchStories323,pending=branch.pending[0];if(pending)return aftermathScene(ledger,pending);
 const currentFloor=boundedInteger(floor??value?.player?.currentFloor,0,0,CAMPAIGN_MAX_FLOOR);if(!currentFloor)return null;
 for(const definition of CAMPAIGN_HERO_ENCOUNTER_SCHEDULE){const event=ledger.events?.[definition.id],hero=ledger.heroes?.[definition.heroId];if(currentFloor>=definition.floor&&currentFloor<=definition.windowEnd&&!hero?.defeated&&["scheduled","armed"].includes(event?.status)&&event?.preludeSeen!==true)return preludeScene(ledger,definition)}return null
}

export function acknowledgeCampaignHeroBranchStoryScene(value,{sceneId}={}){
 const ledger=normalizeCampaignHeroBranchStoryState(value),branch=ledger.branchStories323,id=cleanText(sceneId,180);if(!id)return{state:ledger,recorded:false,reason:"missing-scene-id"};if(branch.receipts.includes(id))return{state:ledger,recorded:false,duplicate:true};
 const prelude=CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(definition=>id===`branch-prelude-${definition.id}`);if(prelude){const event=ledger.events?.[prelude.id];if(!event)return{state:ledger,recorded:false,reason:"missing-event"};ledger.events[prelude.id]={...event,preludeSeen:true,status:event.status==="scheduled"?"armed":event.status};branch.receipts.push(id);branch.receipts=branch.receipts.slice(-256);return{state:ledger,recorded:true,sceneId:id,unlockedEncounterId:prelude.id}}
 const index=branch.pending.findIndex(entry=>entry.id===id);if(index<0)return{state:ledger,recorded:false,reason:"unknown-scene"};branch.pending.splice(index,1);branch.receipts.push(id);branch.receipts=branch.receipts.slice(-256);return{state:ledger,recorded:true,sceneId:id}
}

export function queueCampaignHeroAftermathStories(value,{encounterId,outcome,floor,heroHpRate=1,storyCycle=null}={}){
 const ledger=normalizeCampaignHeroBranchStoryState(value),branch=ledger.branchStories323,definition=campaignHeroEncounterDefinition(encounterId),canonical=CAMPAIGN_HERO_BRANCH_OUTCOMES.includes(outcome)?outcome:null;if(!definition||!canonical)return{state:ledger,queued:false,reason:"invalid-outcome"};
 const rate=clampRate(heroHpRate),payload={encounterId:definition.id,heroId:definition.heroId,outcome:canonical,floor:boundedInteger(floor,definition.floor,1,CAMPAIGN_MAX_FLOOR),heroHpRate:rate,hurtPercent:Math.round((1-rate)*100),storyCycle:boundedInteger(storyCycle,ledger.storyCycle??0,0,999)},entries=["result","report","party"].map(part=>({...payload,part,id:`branch-${part}-${definition.id}-${canonical}`})),existing=new Set([...branch.receipts,...branch.pending.map(entry=>entry.id)]);let added=0;
 for(const entry of entries)if(!existing.has(entry.id)){branch.pending.push(entry);existing.add(entry.id);added++}branch.pending=branch.pending.slice(-24);const historyIndex=branch.history.findIndex(entry=>entry.encounterId===payload.encounterId&&entry.storyCycle===payload.storyCycle);if(historyIndex>=0)branch.history.splice(historyIndex,1);branch.history.push({...payload});branch.history=branch.history.slice(-16);return{state:ledger,queued:added>0,added,sceneIds:entries.map(entry=>entry.id)}
}

export function campaignHeroBranchStorySceneById(value,sceneId){
 const ledger=normalizeCampaignHeroBranchStoryState(value),id=cleanText(sceneId,180),prelude=CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(definition=>id===`branch-prelude-${definition.id}`);if(prelude)return preludeScene(ledger,prelude);
 for(const definition of CAMPAIGN_HERO_ENCOUNTER_SCHEDULE)for(const outcome of CAMPAIGN_HERO_BRANCH_OUTCOMES)for(const part of["result","report","party"]){if(id!==`branch-${part}-${definition.id}-${outcome}`)continue;const event=ledger.events?.[definition.id],history=[...(ledger.branchStories323?.history??[])].reverse().find(entry=>entry.encounterId===definition.id&&entry.outcome===outcome),heroHpRate=history?.heroHpRate??event?.heroHpRate??(outcome==="repelled"?0:ledger.heroes?.[definition.heroId]?.remainingHpRate??1),payload={id,part,encounterId:definition.id,heroId:definition.heroId,outcome,floor:history?.floor??event?.resolvedFloor??definition.floor,heroHpRate,hurtPercent:history?.hurtPercent??event?.hurtPercent??Math.round((1-clampRate(heroHpRate))*100),storyCycle:history?.storyCycle??ledger.storyCycle??0};return aftermathScene(ledger,payload)}return null
}
