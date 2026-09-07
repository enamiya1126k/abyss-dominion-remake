import{CAMPAIGN_MAX_FLOOR,HERO_PARTY_IDS}from"./Campaign100System.js?v=3.1.41-build361";
import{CAMPAIGN_HERO_ENCOUNTER_SCHEDULE,campaignHeroEncounterDefinition,normalizeCampaignHeroEncounterState}from"./CampaignHeroEncounterSystem.js?v=3.1.41-build361";

export const CAMPAIGN_HERO_BRANCH_STORY_VERSION=4;
export const CAMPAIGN_HERO_BRANCH_OUTCOMES=Object.freeze(["repelled","hero-victory","escaped"]);

const plainRecord=value=>Boolean(value&&typeof value==="object"&&!Array.isArray(value));
const cleanText=(value,max=160)=>typeof value==="string"?value.replace(/[\u0000-\u001f\u007f]/g,"").trim().slice(0,max):"";
const boundedInteger=(value,fallback=0,min=0,max=Number.MAX_SAFE_INTEGER)=>{const number=Number(value);return Number.isFinite(number)?Math.max(min,Math.min(max,Math.floor(number))):fallback};
const clampRate=value=>Math.max(0,Math.min(1,Number(value)||0));
const line=(speakerId,text,tone="normal",directives={})=>({speakerId,text:speakerId==="myth_rion"?text.replaceAll("僕","オレ"):text,tone,...directives});
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

function heroStoryState(ledger){
 const heroes=Object.fromEntries(HERO_PARTY_IDS.map(id=>[id,{defeated:Boolean(ledger.heroes?.[id]?.defeated),remainingHpRate:ledger.heroes?.[id]?.remainingHpRate??1}]));
 const active=ledger.events?.[ledger.activeEncounterId],awayHeroIds=active?.status==="active"?[active.heroId??campaignHeroEncounterDefinition(ledger.activeEncounterId)?.heroId].filter(Boolean):[];
 return{heroes,awayHeroIds};
}
function cleanHeroStoryState(value){
 if(!plainRecord(value?.heroes))return null;
 return{heroes:Object.fromEntries(HERO_PARTY_IDS.map(id=>[id,{defeated:value.heroes[id]?.defeated===true,remainingHpRate:value.heroes[id]?.remainingHpRate==null?1:clampRate(value.heroes[id].remainingHpRate)}])),awayHeroIds:HERO_PARTY_IDS.filter(id=>value.awayHeroIds?.includes(id))};
}
function presentHeroes(context,returningId=null){return HERO_PARTY_IDS.filter(id=>!context.heroes[id]?.defeated&&(context.heroes[id]?.remainingHpRate??1)>0&&(!context.awayHeroIds.includes(id)||id===returningId))}

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
  line("myth_yori","その計算、一番大事な前提また抜けてない？","teasing"),
  line("myth_hide","確認済みだ。……食料以外は。","quiet"),
  line(null,"空腹という前提だけを置き忘れ、ひでは予測地点へ向かった。","narration")
 ]),
 "myth_enami:1":Object.freeze([
  line("myth_enami","向こうにも、ここを守る理由があるんやと思う。僕が先に話してくる。","gentle"),
  line("myth_yori","話すだけの顔違うで。さっきから武器ぜんぶ持ってるやん。","teasing"),
  line("myth_enami","話が通じるなら使わん。仲間を狙うなら、話は別や。","cold"),
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
  line("myth_yori","フォー！！！！ ……って、ひでなら言いそうやな。完璧やん。","teasing"),
  line("myth_enami","それ、ついて来てほしいって言ってない？","normal"),
  line(null,"否定する前に、ひでは新しい追跡式を抱えて歩き出した。","narration")
 ]),
 "myth_enami:2":Object.freeze([
  line("myth_enami","前に聞けなかった答えがある。もう一回、僕が行く。","cold"),
  line("myth_rion","交渉なら条件を増やそう。命、情報、帰り道。全部こっちの資産だよ。","serious"),
  line("myth_enami","うん。だから今度は、仲間を値段に入れさせん。","cold"),
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

const PRELUDE_EXTRA={
 "myth_yori:1":[
  ["myth_hide","偵察とは観測して戻ることだ。相手を殴ることではない。復唱してください。"],
  ["myth_yori","観測して、殴って、戻る。"],
  ["myth_enami","真ん中に勝手な項目増えてるやん。あとその酒、置いていき。"],
  ["myth_yori","見送りの一杯もあかん？"],
  ["myth_rion","帰還祝いに回そう。先に飲んだら、帰ってくる理由が一個減るから。"],
  ["myth_yori","じゃあ預けるわ。僕がおらん間に全部飲むなよ。"],
  ["myth_hide","飲まない。合流地点を覚えているか、それだけ確認したい。"],
  ["myth_yori","覚えてる。皆が待ってるとこやろ。イージー！！"]
 ],
 "myth_hide:1":[
  ["myth_rion","ひで、待って。経路の計算は信じるけど、その袋、中身を見せて。"],
  ["myth_hide","観測器具、予備の杖、記録用紙。必要な物は揃っている。"],
  ["myth_yori","食い物ないって、さっき自分で言ってたやん。僕の分も持っていき。"],
  ["myth_hide","いやいやいや笑、食料まで入ってる。計算表にない荷物が一番役立ちそうです。"],
  ["myth_enami","計算外れたら帰ってきて会議な。議題は『ひで、また何忘れた？』で。"],
  ["myth_hide","観測を途中で打ち切るのは、僕の計画では……。"],
  ["myth_rion","計画に『自分を持ち帰る』って一行足して。記録だけ返ってきても困る。"],
  ["myth_hide","了解。最優先項目にします。……いいゾ〜！コレ〜！ 抜けのない計画になった。"]
 ],
 "myth_enami:1":[
  ["myth_rion","交渉役に任命するけど、相手の家計まで引き受けてこないでね。"],
  ["myth_enami","そこまでせん。まず、なんで戦うんか聞くだけや。"],
  ["myth_yori","前にそれ言って、知らんおっちゃんの屋根直して帰ってきたやん。"],
  ["myth_hide","予定超過は六時間。だが帰り道の安全度は上がった。結果の評価は難しい。"],
  ["myth_enami","屋根漏れてたら、戦う理由どころ違うやろ。話の順番があるんよ。"],
  ["myth_rion","そこがえなみらしいね。じゃあ今回は、話の順番に帰還報告も入れといて。"],
  ["myth_hide","時刻になっても戻らなければ、こちらから迎えに行く。"],
  ["myth_enami","分かった。まかセロリ。……塩は持ったし、行ってくるわ。"]
 ],
 "myth_rion:1":[
  ["myth_yori","出口に値段付ける前に、自分が帰れるか確認してくれる？"],
  ["myth_rion","もちろん。僕が一番安い道を通る。"],
  ["myth_hide","安さと安全は別の指標だ。比較表を渡そう。"],
  ["myth_enami","その表、上下逆に持ってるで。"],
  ["myth_rion","大丈夫。先に動いて、現地で修正するのが僕の方式だから。"],
  ["myth_yori","失敗した時は、早めに呼びや。助けに行くのに請求書はいらんから。"],
  ["myth_rion","……それ、最高の条件だね。僕も皆には同じ契約で動くよ。"],
  ["myth_hide","口約束でも、今の条件は記録した。生きて戻って履行してください。"]
 ],
 "myth_yori:2":[
  ["myth_rion","再戦記録の予約は取った。でも、発売延期は何度でもできるよ。"],
  ["myth_yori","珍しく弱気やな。僕の勝ち、信用してない？"],
  ["myth_rion","信用してる。だから一回の売上で失くす気がないって話。"],
  ["myth_hide","今回は退路の印も置いた。勢いで全部踏み砕かないように。"],
  ["myth_yori","僕、道の印までは殴らんで。たぶん。"],
  ["myth_enami","たぶん外して。強い相手ほど、戻ってから相談できる方がええ。"],
  ["myth_yori","分かった。困ったら呼ぶ。……こういう約束、前より増えたな。"],
  ["myth_enami","皆がちゃんと帰ってきてるから、約束も増やせるんや。"]
 ],
 "myth_hide:2":[
  ["myth_rion","今回の持ち物、僕が確認したよ。食料も水もある。値札だけ外し忘れてた。"],
  ["myth_hide","自分の荷物へ値札を付けないでください。途中で売却する前提になります。"],
  ["myth_yori","ひでが計算しすぎて動けんくなったら、僕が迎えに行くわ。"],
  ["myth_hide","その場合の最短経路も渡しておく。君が迷う確率は無視できない。"],
  ["myth_enami","助けてもらう準備できるようになったんやな。ええ計算やん。"],
  ["myth_hide","一人で全て処理するより、戻って相談した方が精度が上がる。分かっただけです。"],
  ["myth_rion","やったぜ！ じゃあ帰還後の検討会は食事付き。経費は僕持ち。"],
  ["myth_hide","いいんすか！！ ……今の条件、ちゃんと記録しましたからね。"]
 ],
 "myth_enami:2":[
  ["myth_yori","冷静に怒ってる顔、普通に怒ってる時より怖いんよ。"],
  ["myth_enami","仲間を数字だけで数えられたら、言いたいことも増えるやろ。"],
  ["myth_hide","数字は僕も使う。だが、誰を守るかは計算の前に決めている。"],
  ["myth_rion","僕も値段は付けるけど、仲間を売る棚は作らないよ。"],
  ["myth_enami","うん。そこが分かってるから、一緒に来たんや。"],
  ["myth_yori","じゃあ、言いたいこと言って帰ってき。続きは僕らも聞くから。"],
  ["myth_hide","帰還予定を過ぎたら連絡してください。没頭して忘れる可能性が高い。"],
  ["myth_enami","そこは否定できんな。先に言うとく、迎えが必要になったら頼むわ。"]
 ],
 "myth_rion:2":[
  ["myth_enami","地図逆やでって言われて、まだ持ち直してないの？"],
  ["myth_rion","今、持ち直したよ。修正が早い。これが僕の強み。"],
  ["myth_hide","誤りを認めるまでの時間は、前回より短縮されている。"],
  ["myth_yori","褒め方が帳簿みたいやな。今回は迷子の捜索代いらんとええけど。"],
  ["myth_rion","捜索が必要なら呼ぶよ。損を隠して大損にするのは、一番下手な商売だから。"],
  ["myth_enami","そっか。じゃあ呼ばれたら行くわ。料金の相談はあとや。"],
  ["myth_rion","身内価格ゼロじゃないの？"],
  ["myth_yori","帰ったら面白い話を一つ。それでええわ。"]
 ]
};

const HERO_RESULT_LINES=Object.freeze({
 myth_yori:Object.freeze({repelled:"ディフィカルト……でも、この拳が届いたことは忘れん。","hero-victory":"イージー！！ でも、その一撃は前より深かったで。",escaped:"おっと〜！？ 逃げ足まで観察対象に入れとくわ。"}),
 myth_hide:Object.freeze({repelled:"いやいやいや笑。最後の一手だけ、式から抜けていました。","hero-victory":"フォー！！！！ 勝利。ただし損傷値は想定を超えています。",escaped:"待ってくださいよ〜！ 退路の再計算が終わってません。"}),
 myth_enami:Object.freeze({repelled:"なんやコイツ……強いやん。僕の負けでも、仲間には触れさせん。","hero-victory":"おいおい！そんなもんか？！ ……でも、その理由は覚えとく。",escaped:"もうちょっとどこか行きたいん？ 次は話の途中で逃がさんで。"}),
 myth_rion:Object.freeze({repelled:"おつかれナス。損失は出たけど、情報は残した。","hero-victory":"やったぜ！ でも修理代まで考えたら赤字やな。",escaped:"また今度やな。次は逃げ道にも値段を付けとく。"})
});

const PARTY_RETURN_LINES=Object.freeze({
 myth_yori:Object.freeze({"hero-victory":"イージー！！ ……ただいま。思ったより骨あったわ。",escaped:"おっと〜！？ 先に逃げられた。次は出口から殴る。"}),
 myth_hide:Object.freeze({"hero-victory":"計算どおり勝った。損傷だけが、計算より大きい。",escaped:"追跡式は正しかった。相手が式の外へ逃げただけだ。"}),
 myth_enami:Object.freeze({"hero-victory":"戻ったで。話は半分だけ聞けた。残り半分は戦いながらや。",escaped:"逃げられた。向こうの理由、まだ最後まで聞けてない。"}),
 myth_rion:Object.freeze({"hero-victory":"やったぜ！ 勝ったけど、装備の修理で利益はゼロ。",escaped:"また今度やな。出口を一つ無料にしたのが失敗やった。"})
});

function encounterFacts348(value={}){return {battleKnown348:value.battleKnown348===true,battled348:value.battled348===true,newHurtPercent348:boundedInteger(value.newHurtPercent348,0,0,100),priorHurtPercent348:boundedInteger(value.priorHurtPercent348,value.hurtPercent??0,0,100)}}
function normalizeBranchState(ledger){
 const source=plainRecord(ledger.branchStories323)?ledger.branchStories323:{},receipts=[...new Set((Array.isArray(source.receipts)?source.receipts:[]).map(value=>cleanText(value,180)).filter(Boolean))].slice(-256),pending=[],history=[];
 for(const entry of Array.isArray(source.pending)?source.pending:[]){
  if(!plainRecord(entry)||!["result","report","party"].includes(entry.part))continue;const encounter=campaignHeroEncounterDefinition(entry.encounterId),outcome=CAMPAIGN_HERO_BRANCH_OUTCOMES.includes(entry.outcome)?entry.outcome:null,id=cleanText(entry.id,180);if(!encounter||!outcome||!id||receipts.includes(id)||pending.some(item=>item.id===id))continue;
  pending.push({id,encounterId:encounter.id,heroId:encounter.heroId,part:entry.part,outcome,floor:boundedInteger(entry.floor,encounter.floor,1,CAMPAIGN_MAX_FLOOR),heroHpRate:clampRate(entry.heroHpRate),hurtPercent:boundedInteger(entry.hurtPercent,0,0,100),storyCycle:boundedInteger(entry.storyCycle,ledger.storyCycle??0,0,999),heroStoryState:cleanHeroStoryState(entry.heroStoryState),...encounterFacts348(entry)});
 }
 for(const entry of Array.isArray(source.history)?source.history:[]){const encounter=campaignHeroEncounterDefinition(entry?.encounterId),outcome=CAMPAIGN_HERO_BRANCH_OUTCOMES.includes(entry?.outcome)?entry.outcome:null;if(!encounter||!outcome)continue;const record={encounterId:encounter.id,heroId:encounter.heroId,outcome,floor:boundedInteger(entry.floor,encounter.floor,1,CAMPAIGN_MAX_FLOOR),heroHpRate:clampRate(entry.heroHpRate),hurtPercent:boundedInteger(entry.hurtPercent,0,0,100),storyCycle:boundedInteger(entry.storyCycle,ledger.storyCycle??0,0,999),heroStoryState:cleanHeroStoryState(entry.heroStoryState),...encounterFacts348(entry)};const index=history.findIndex(item=>item.encounterId===record.encounterId&&item.storyCycle===record.storyCycle);if(index>=0)history.splice(index,1);history.push(record)}
 ledger.branchStories323={version:CAMPAIGN_HERO_BRANCH_STORY_VERSION,storyCycle:boundedInteger(source.storyCycle,ledger.storyCycle??0,0,999),receipts,pending:pending.slice(-24),history:history.slice(-16)};return ledger.branchStories323
}

export function normalizeCampaignHeroBranchStoryState(value){const ledger=normalizeCampaignHeroEncounterState(value);normalizeBranchState(ledger);return ledger}

function charactersFor(dialogue){return[...new Set(dialogue.map(entry=>entry.speakerId).filter(Boolean))].map(id=>CHARACTERS[id]).filter(Boolean)}
function storyScene(definition,{id,part,title,summary,dialogue,castIds=null,heroState=null,location="勇者一行・野営地",eyebrow="HEROES / SIDE STORY",routeHidden=false,variant="default"}={}){return{id,storyTextVersion:351,kind:"hero-branch",storyTrack:"hero-encounter",storyPart:part,encounterId:definition.id,heroId:definition.heroId,floor:definition.floor,day:definition.day,routeProgress:(definition.day-1)*10,title,summary,location,eyebrow,routeHidden,variant,castVersion:340,heroStoryState:heroState,backgroundAsset:routeHidden?"./assets/ui/battle/boss-throne.png":"./assets/ui/trials/abyss-corridor-room.png",completeLabel:part==="prelude"?"探索へ戻る":part==="party"?"物語を閉じる":"次の場面",characters:castIds?castIds.map(id=>CHARACTERS[id]).filter(Boolean):charactersFor(dialogue),dialogue};}
function historyPreludeLine(ledger,definition){
 if(definition.cycle<2)return null;const record=ledger.heroes?.[definition.heroId];if(!record)return null;
 if(record.lastOutcome==="hero-victory")return line(definition.heroId,record.remainingHpRate<1?"前は勝ってる。でも、残った傷まで勝利とは言えん。今度は無傷で戻る。":"前は無傷で帰れた。でも同じ手が通るとは限らない。退路から確かめて行く。","serious");
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
 const heroId=definition.heroId,heroState=heroStoryState(ledger),castIds=presentHeroes(heroState,heroId),context=[continuityPreludeLine(ledger,heroId),historyPreludeLine(ledger,definition)].filter(Boolean);
 let base=[...(PRELUDE_LINES[`${heroId}:${definition.cycle}`]??[])];
 const extra=(PRELUDE_EXTRA[`${heroId}:${definition.cycle}`]??[]).map(([id,text])=>line(id,text));
 base.splice(Math.max(0,base.length-1),0,...extra);
 if(castIds.length<4){
  const departure={myth_yori:"まずオレが見てくる。無理はせん。帰る道もちゃんと覚えとく。",myth_hide:"足跡と魔力の周期を追う。今回は退路も、食料も確認した。一人で観測してくる。",myth_enami:"僕が先に話してくる。守ってる理由を聞きたい。戻る約束は忘れんよ。",myth_rion:"僕が出口を先に押さえる。情報を持ち帰って、次の動きに使おう。"};
  const reactions={myth_enami:"帰りが遅かったら迎えに行く。仲間を置いていく計算はせんからな。",myth_yori:"おっと〜！？ まず様子見やで。戻ったら話、最後まで聞くから。",myth_hide:"合流地点と時間を決めよう。……時刻表を渡すのを忘れるところだった。",myth_rion:"帰るまでが偵察だよ。情報より人の方が替えが利かないからね。"};
  base=castIds.includes(heroId)?[line(heroId,departure[heroId],"serious"),...castIds.filter(id=>id!==heroId).map(id=>line(id,reactions[id])),line(null,`${HERO_NAMES[heroId]}は退路を確かめ、単独で迷宮へ向かった。`,"narration")]:[line(null,"先行できる勇者の足音は、もうここには残っていない。","narration")];
 }
 const dialogue=[...context.filter(entry=>!entry.speakerId||castIds.includes(entry.speakerId)),...base];
 return storyScene(definition,{id:`branch-prelude-${definition.id}`,part:"prelude",title:`${HERO_NAMES[heroId]}、単独行動`,summary:`勇者一行から${HERO_NAMES[heroId]}が一人で離れた。この会話の後から、迷宮内で遭遇する可能性が生まれる。`,dialogue,castIds,heroState,variant:context.length||castIds.length<4?"continuity":"default"})
}

function woundDescription348(payload){
 const {newHurtPercent348:fresh,priorHurtPercent348:prior}=encounterFacts348(payload),total=payload.hurtPercent??0;
 if(fresh>0)return `今回、新たに${fresh}%分の損傷が加わった。${prior>0?`以前の${prior}%分と合わせ、`:""}残る損傷は${total}%。十日目まで引き継がれる。`;
 return total>0?`今回、新たな損傷は確認されていない。以前から残る${total}%の傷は、十日目まで引き継がれる。`:"今回、勇者に損傷はない。";
}
function resultScene(ledger,payload,definition){
 const id=definition.heroId,name=HERO_NAMES[id],outcome=payload.outcome,facts=encounterFacts348(payload);
 const lead=outcome==="repelled"?`${name}は魔王軍に退けられ、勇者一行への帰路を失った。`:outcome==="hero-victory"?`${name}は戦いに勝ち、帰路についた。`:facts.battled348?`交戦後、魔王軍は撤退に成功した。${name}は追跡を続けたが、決着をつけられなかった。`:!facts.battleKnown348?`追跡は途切れた。${name}は魔王軍を取り逃がした。交戦の経緯は記録に残っていない。`:`魔王軍は${name}との戦闘を避けて逃げ切った。追跡は途切れ、刃を交えることはなかった。`;
 const safeVictory={myth_yori:"イージー！！ 今回、傷は増えてない。戻って、ほんとに起きたことから報告しよか。",myth_hide:"フォー！！！！ 勝利。新たな損傷は確認されていません。帰路も確認済みです。",myth_enami:"勝ったで。でも相手の理由は、まだ聞き終わってない。戻って整理しよ。",myth_rion:"やったぜ！ 勝利の記録は回収済み。帰って報告しよう。"};
 const words=outcome==="hero-victory"&&facts.newHurtPercent348===0?safeVictory[id]:HERO_RESULT_LINES[id]?.[outcome];
 const dialogue=[line(null,lead,"narration"),line(id,words??"この結果は、次へ持ち越す。",outcome==="repelled"?"repelled":"quiet")];
 if(outcome!=="repelled")dialogue.push(line(null,woundDescription348(payload),"narration"));
 dialogue.push(line(id,outcome==="repelled"?({myth_yori:"勢いだけで行ったらダメって、言われたのにな。……次の拳は、頼んだで。",myth_hide:"記録は残す。次に読む者の退路になるように。",myth_enami:"僕が守りたかった理由まで、なかったことにはさせんよ。",myth_rion:"残した情報で、誰かが一歩先へ行けるなら……。"}[id]):"報告は、実際に起きたことから順番に。まず、戻ったことを伝えよう。","quiet"));
 return storyScene(definition,{id:payload.id,part:"result",title:outcome==="repelled"?"迷宮側の勝利":outcome==="hero-victory"?"勇者側の勝利":"追跡から離脱",summary:lead,dialogue,location:`第${payload.floor}階・遭遇地点`,eyebrow:"ENCOUNTER / RESULT",variant:outcome});
}
const DEMON_HERO_COUNSEL351={
 "myth_yori": [
  [
   "sairan",
   "よりの得意な距離へ、こちらから並んでやる必要はないな。"
  ],
  [
   "lionel",
   "はい。拳の威力だけでなく、踏み込ませる場所を考えます。笑っているから余裕がある、とも限りません。"
  ],
  [
   "sairan",
   "敵の笑顔を、こちらに都合よく翻訳するな。"
  ],
  [
   "lionel",
   "承知しました。陛下の笑顔についても、その扱いでよろしいですか。"
  ],
  [
   "sairan",
   "余の笑顔は吉報だ。敵の分まで一緒にするな。"
  ]
 ],
 "myth_hide": [
  [
   "sairan",
   "ひでの計算へ付き合うなら、向こうの紙の上で戦うことになる。"
  ],
  [
   "lionel",
   "前提を変える手を用意します。ただし、向こうが何かを忘れる前提で勝ち筋を組むのは危険です。"
  ],
  [
   "sairan",
   "敵のうっかりを待つ軍議ほど、うっかりしたものはない。"
  ],
  [
   "lionel",
   "その文は、陛下の命令書にも追記しておきます。"
  ],
  [
   "sairan",
   "追記する場所を間違えるな。余の署名の上には書くなよ。"
  ]
 ],
 "myth_enami": [
  [
   "sairan",
   "えなみは、まず言葉を使うのだったな。"
  ],
  [
   "lionel",
   "問いかけを隙と見なすより、何に注意を向けているかを読みたい相手です。"
  ],
  [
   "sairan",
   "余が話せば長くなる。それも武器になるか。"
  ],
  [
   "lionel",
   "途中で別の物を見始める可能性があります。"
  ],
  [
   "sairan",
   "……余の演説を聞かぬ敵が、一番厄介だな。"
  ]
 ],
 "myth_rion": [
  [
   "sairan",
   "りおんを追うなら、後ろ姿だけ見るな。先の出口へ目を向けろ。"
  ],
  [
   "lionel",
   "こちらの進みたい場所を、先に使う相手として扱います。足の速さだけを比べるつもりはありません。"
  ],
  [
   "sairan",
   "扉に値段を付けるという話は本気か。"
  ],
  [
   "lionel",
   "交渉の案としては、十分あり得るかと。"
  ],
  [
   "sairan",
   "城門を売り物へ数えた時点で、相手の見積もりは却下だ。"
  ]
 ]
};
function demonReportDialogue351(payload,definition){
 const facts=encounterFacts348(payload),outcome=payload.outcome,words=[];
 if(outcome==="repelled")words.push(
  ["sairan","よく退けた。だが、これは一人についての勝利だ。残った敵まで、勝手に報告書から消すな。"],
  ["lionel","はい。人数が変わった後の布陣を考えます。ここまで使った手も、次に通るとは限りません。"]
 );
 else if(outcome==="hero-victory")words.push(
  ["lionel",facts.newHurtPercent348>0?"こちらは敗れましたが、新たに残した傷の記録があります。以前の損傷とは分けて引き継ぎます。":"今回、新しい傷を残したという報告はできません。こちらの敗北と、相手の状態を分けて記します。"],
  ["sairan","負けた報告を持ってきたことは咎めぬ。勝てるつもりだった所を隠したら、その時に怒る。"],
  ["lionel","では、見積もりの甘かった箇所も添えます。長くなりますが。"],
  ["sairan","長さで勝とうとするな。次に変える箇所から読め。"]
 );
 else if(facts.battled348)words.push(
  ["lionel","交戦と撤退は記録にあります。決着をつけずに離脱できた道筋を、次の判断に使います。"],
  ["sairan","離脱を勝利の言い換えにはするな。戻れたという成果のまま、次へ使えばよい。"]
 );
 else if(facts.battleKnown348)words.push(
  ["lionel","戦闘には入りませんでした。攻撃が届いた、という武勇伝を足せる報告ではありません。"],
  ["sairan","飾りはいらぬ。戻れた道を記せ。同じ場所で次も逃げられるとは限らない。"]
 );
 else words.push(
  ["lionel","交戦の経緯は記録が足りません。分からない部分を、戦果で埋めることはできません。"],
  ["sairan","空欄のままでよい。もっともらしい一行のために、次の布陣を誤らせるな。"]
 );
 words.push(...DEMON_HERO_COUNSEL351[definition.heroId]);
 if(definition.cycle===2)words.push(
  ["lionel","二度目の段取りでは、以前の記録も並べます。同じ名でも、残る傷と仲間の数は確かめ直します。"],
  ["sairan","よい。敵の名を覚えたところで観察を終えるな。余もお前の字を読み直す。"]
 );
 else words.push(
  ["lionel","この記録は次の布陣へ回します。予言にあった影を、名前だけで終わらせないために。"],
  ["sairan","敵を知れ。知った分だけ、こちらの魔物に任せる仕事も変わる。"]
 );
 return words.map(([id,text])=>line(id,text,"normal",{stageEffect:"lionel-slime"}));
}

function reportScene(payload,definition){
 const name=HERO_NAMES[definition.heroId],outcome=payload.outcome,facts=encounterFacts348(payload);
 const report=outcome==="repelled"?`${name}を撃退しました。十日目の勇者軍から一人が欠けます。`:outcome==="hero-victory"?`先遣部隊は${name}に敗北しました。`:facts.battled348?`${name}と交戦した後、撤退に成功しました。`:!facts.battleKnown348?`${name}の追跡から離脱しました。交戦の経緯を確かめられる記録は残っていません。`:`${name}との戦闘を回避し、追跡から逃げ切りました。攻撃は加えていません。`;
 const reply=outcome==="repelled"?"よい。予言から一人を削った。残る者たちの動きも記せ。":outcome==="escaped"?"戻った者から道筋を聞け。次に生かすための報告だ。":facts.newHurtPercent348>0?"敗北は構わぬ。今回残した傷と行動の記録を、次へ引き継げ。":"新たな傷はないか。刃が届かなかった理由を記せ。次に生かす。";
 const dialogue=[line("lionel",`サイラーン様。第${payload.floor}階の報告です。${report}`,"serious",{stageEffect:"lionel-slime"})];
 if(outcome!=="repelled")dialogue.push(line("lionel",woundDescription348(payload),"serious",{stageEffect:"lionel-slime"}));
 dialogue.push(line("sairan",reply,"command",{stageEffect:"lionel-slime"}),line("lionel","承知しました。遭遇結果と損傷の記録を引き継いで布陣します。","resolute",{stageEffect:"lionel-slime"}));
 dialogue.push(...demonReportDialogue351(payload,definition));
 return storyScene(definition,{id:payload.id,part:"report",title:"玉座への進捗報告",summary:`リオネルが、${name}との遭遇結果をサイラーンへ伝える。`,dialogue,location:"魔王城・玉座の間",eyebrow:"DEMON LORD / REPORT",routeHidden:true,variant:outcome});
}
function campMemoryDialogue351(castIds,heroId,outcome){
 const has=id=>castIds.includes(id);
 if(outcome==="repelled")return [];
 if(heroId==="myth_rion"&&has("myth_enami"))return[line("myth_enami","報告の前に、地図を正しい向きに置いて。僕まで道を間違えそう。"),line("myth_rion","今直した。オレ、帰ってきてからも仕事が早いな。")];
 if(heroId==="myth_hide"&&has("myth_yori"))return[line("myth_yori","ひで、荷物を置いてから話せば？ 杖、ずっと鍋に入ってる。"),line("myth_hide","……記録に集中してた。夕食の味は計算できなくなったね。")];
 if(heroId==="myth_enami"&&has("myth_rion"))return[line("myth_rion","聞いたこと、オレが書くよ。まず何から？"),line("myth_enami","それが、帰り道で気になる看板があって。"),line("myth_rion","迷宮の話から。看板はあとでオレも見に行く。")];
 if(heroId==="myth_yori"&&has("myth_hide"))return[line("myth_hide","要点を三つにまとめて。順番は任せる。"),line("myth_yori","帰った。腹減った。水ほしい。"),line("myth_hide","……全部分かった。まず座って。")];
 return [];
}

function partyScene(ledger,payload,definition){
 const facts=encounterFacts348(payload);const heroId=definition.heroId,name=HERO_NAMES[heroId],outcome=payload.outcome,hurt=payload.hurtPercent,heroState=cleanHeroStoryState(payload.heroStoryState)??heroStoryState(ledger);
 heroState.heroes[heroId]={defeated:outcome==="repelled",remainingHpRate:outcome==="repelled"?0:payload.heroHpRate};
 heroState.awayHeroIds=heroState.awayHeroIds.filter(id=>id!==heroId);
 const castIds=presentHeroes(heroState),others=castIds.filter(id=>id!==heroId),dialogue=[];
 if(outcome==="repelled"){
  dialogue.push(line(null,`${name}は野営地へ戻らなかった。残された仲間は、途切れた足音の意味を理解した。`,"narration"));
  if(others.includes("myth_hide"))dialogue.push(line("myth_hide",`${name}の反応が消えた。捜索より先に、残った${others.length}人の生存率を計算する。`,"serious"));
  if(others.includes("myth_enami"))dialogue.push(line("myth_enami","計算だけで置いていかん。最後におった場所まで、必ず迎えに行く。","cold"));
  if(others.includes("myth_rion"))dialogue.push(line("myth_rion","損失にはしない。残した情報も意思も、全部こっちの戦力にする。","serious"));
  if(others.includes("myth_yori"))dialogue.push(line("myth_yori",castIds.length===1?"もう僕しかおらんのか。……急いで終わらせようとはせん。あいつらが残した道、最後まで歩く。":"次は一人で行かん。あいつの分まで、全員で殴りに行く。","serious"));
 }else{
  dialogue.push(line(heroId,outcome==="hero-victory"&&facts.newHurtPercent348===0?({myth_yori:"イージー！！ ……ただいま。今日は傷も増やさず戻れたよ。",myth_hide:"帰還しました。今回は新たな損傷ゼロ。確認のために二度計算しました。",myth_enami:"戻ったで。話はまだ途中やけど、新しい怪我はしてない。まず報告するわ。",myth_rion:"やったぜ！ 傷を増やさず帰還。まず報告しよう。"}[heroId]):PARTY_RETURN_LINES[heroId]?.[outcome]??"戻った。次へ進もう。",outcome==="hero-victory"?"confident":"quiet"));
  if(hurt>0){if(heroId==="myth_hide"||others.includes("myth_hide"))dialogue.push(line("myth_hide",woundDescription348(payload),"serious"));else dialogue.push(line(null,woundDescription348(payload),"narration"))}
  else if(others.includes("myth_hide"))dialogue.push(line("myth_hide",outcome==="escaped"?"待ってくださいよ〜！ 逃げ道は計算してました。……塞ぐ人の配置、忘れてました。":"いいゾ〜！コレ〜！ 無傷で帰還、計算どおりです。……帰還祝いの買い出し、忘れてました。","normal"));
  if(others.includes("myth_yori"))dialogue.push(line("myth_yori",outcome==="escaped"?"おっと〜！？ じゃあ次は僕も一緒に行くわ。帰ってこれたんやし、まず座り。":"イージー！！ ……って、僕留守番やったわ。何もしてないのに勝った顔しとこ。","gentle"));
  if(heroId!=="myth_enami"&&others.includes("myth_enami"))dialogue.push(line("myth_enami",outcome==="hero-victory"?(hurt>0?"勝った顔してるけど、傷まで無かったことにはせんで。":"無傷やん。なんやコイツ。僕の心配した時間、返して。塩で。"):(castIds.length===4?"戻ったな。次は四人で行こ。単独行動、会議で満場一致の廃止です。":"戻ったな。残ったメンバーで作戦会議。まず勝手に出発する人を議題にする。"),"gentle"));
  if(heroId!=="myth_rion"&&others.includes("myth_rion"))dialogue.push(line("myth_rion",outcome==="hero-victory"?(hurt>0?"勝利の記録は残す。残っている傷の手当ても忘れずに。":"勝利の記録は残す。無傷の帰還も、ちゃんと成果に入れるよ。"):"逃げられた経路も商品になる。次の先回りに使おう。","normal"));
 }
 const campWords=outcome==="repelled"?{
  myth_enami:["誰がいないか、席を見たら分かるな。分からん部分を、都合のいい話で埋めんようにしよう。","次に動く前は、戻れる道と合流場所を確認する。僕も例外にはせん。"],
  myth_yori:["ディフィカルト。偵察の意味を『殴って帰る』から『帰って報告する』に直すわ。","声がない分を、勢いで埋めようとはせんよ。聞く人が少なくても、起きたことから話そう。"],
  myth_hide:["人数が減った。前の作戦をそのまま使わず、今できることから組み直す。","完璧とはまだ言えない。分からん所には印を付けた。そこから確かめよう。"],
  myth_rion:["オレ、今はうまい言い換えが出てこん。荷物はそのまま置いておくよ。","次の行き先と戻る時刻、記録してから動こう。誰かの分まで、黙って決めんように。"]
 }:{
  myth_enami:["まず座って。急いで結論だけ聞くより、起きた順に聞きたい。","知らんとこは知らんままでいい。僕も一緒に考えるから。"],
  myth_yori:["顔が見えたら安心したわ。戻ってきたとこから、ちゃんと聞こう。","帰還祝いの前に水な。あと、荷物ここに置いていいよ。"],
  myth_hide:["帰還を確認。予測と違った所も教えて。次の経路を直すから。","僕の記録、略しすぎた所がある。読めんまま次の人へ渡さんように、今直す。"],
  myth_rion:[(hurt>0?"おつかれナス。情報も回収。残ってる傷の手当てもしておこう。":"おつかれナス。情報と本人、どっちも回収。トータル黒字やな。"),"今日はゆっくり飯にしよう。オレも、食べながら思い出す話がある。"]
 };
 const returnedWords={
  myth_enami:["戻ったよ。僕が見た範囲から順番に話す。",(facts.battled348?"戦った時の動き、忘れる前に記録しよう。分からん所は分けて書く。":"取り逃がした道は覚えてる。起きたことと、僕の予想は分けて話す。")],
  myth_yori:[(facts.newHurtPercent348>0?"ただいま！ イージー！！ ……いや、今回は傷も増えてもうたわ。":facts.battled348?"ただいま！ 交戦したけど、今回は傷を増やさず戻れたよ。":facts.battleKnown348?"ただいま！ おっと〜！？ 戦う前に逃げ切られてもうた。足、速すぎん？":"ただいま！ おっと〜！？ 取り逃がしてもうた。次は逃げ道から読まないかんな。"),(outcome==="hero-victory"?"イージー！！ 勝った話、順番にするわ。まず水ちょうだい。":"次は逃げ道から読まないかんな。とりあえず水、一杯だけ。")],
  myth_hide:["帰還しました。計算どおりです。……到着時刻以外は。","フォー！！！！ 記録はあります。食料の残数だけ計算してません。"],
  myth_rion:[(hurt>0?"ただいま。情報も僕も回収済み。残ってる傷の手当て、頼むね。":"ただいま。情報も僕も回収済み。今回は治療費ゼロ。"),"次の道は、この記録を見てから決めよう。オレだけで先に予約せんから。"]};
 for(let turn=0;turn<2;turn++)for(const id of castIds)dialogue.push(line(id,outcome!=="repelled"&&id===heroId?returnedWords[id][turn]:campWords[id][turn],outcome==="repelled"?"normal":"teasing"));
 if(castIds.length===1&&castIds[0]===heroId){
  const words={myth_enami:"ただいま。誰もおらん。なんやコイツ。独り言まで僕担当なん？ 塩ください。",myth_yori:"ただいま！ 誰もおらんけどイージー！！ ……返事ないとちょっと滑ったな。",myth_hide:"帰還しました。報告相手0名。フォー！！！！ ……ログだけ残します。",myth_rion:"帰還。観客0人。赤字イベントやな。また今度やな。"};
  dialogue.splice(0,dialogue.length,line(null,heroState.awayHeroIds.length?"野営地へ戻ると、別行動中の仲間の荷物が残っていた。合流まで、火を絶やさず待つ。":"野営地へ戻った。出迎える声はなく、以前の焚き火の跡だけが残っていた。","narration"),line(heroId,heroState.awayHeroIds.length?"先に戻った。報告をまとめて、ここで合流を待とう。":words[heroId],"quiet"),line(null,hurt>0?`残る損傷は${hurt}%。手当てと休息の支度を、ひとりで始めた。`:"荷物を下ろし、次の道と帰りの道を、どちらも記録に残した。","narration"));
 }
 if(outcome==="repelled"&&castIds.length===1){
  for(const entry of dialogue){entry.text=entry.text.replace("僕らが続きを持っていく","僕が続きを持っていく").replace("今ここにおる仲間を、同じように失くさんために。","残された自分まで、同じように失くさんために。");}
 }
 dialogue.push(...campMemoryDialogue351(castIds,heroId,outcome));
 const fallen=HERO_PARTY_IDS.filter(id=>heroState.heroes[id]?.defeated&&id!==heroId);if(fallen.length)dialogue.push(line(null,`会話の輪には、戻らない${fallen.map(id=>HERO_NAMES[id]).join("と")}の空白が残っていた。`,"narration"));
 if(!castIds.length)dialogue.splice(0,dialogue.length,line(null,"野営地に戻る勇者は、一人もいなかった。消えた足音を待つ者も、もういない。","narration"));
 return storyScene(definition,{id:payload.id,part:"party",title:"同じ頃、勇者一行は",summary:`第${payload.floor}階の遭遇結果は、勇者側の会話と次の判断にも残った。`,dialogue,castIds,heroState,location:"勇者一行・夜営地",eyebrow:"HEROES / SAME TIMELINE",variant:outcome})
}
function aftermathScene(ledger,payload){const definition=campaignHeroEncounterDefinition(payload.encounterId);if(!definition)return null;if(payload.part==="result")return resultScene(ledger,payload,definition);if(payload.part==="report")return reportScene(payload,definition);return partyScene(ledger,payload,definition)}

export function nextCampaignHeroBranchStoryScene(value,{floor=null}={}){
 const ledger=normalizeCampaignHeroBranchStoryState(value),branch=ledger.branchStories323,pending=branch.pending[0];if(pending)return aftermathScene(ledger,pending);
 const currentFloor=boundedInteger(floor??value?.player?.currentFloor,0,0,CAMPAIGN_MAX_FLOOR);if(!currentFloor||ledger.activeEncounterId)return null;
 for(const definition of CAMPAIGN_HERO_ENCOUNTER_SCHEDULE){const event=ledger.events?.[definition.id],hero=ledger.heroes?.[definition.heroId];if(currentFloor>=definition.floor&&currentFloor<=definition.windowEnd&&!hero?.defeated&&["scheduled","armed"].includes(event?.status)&&event?.preludeSeen!==true)return preludeScene(ledger,definition)}return null
}

export function acknowledgeCampaignHeroBranchStoryScene(value,{sceneId}={}){
 const ledger=normalizeCampaignHeroBranchStoryState(value),branch=ledger.branchStories323,id=cleanText(sceneId,180);if(!id)return{state:ledger,recorded:false,reason:"missing-scene-id"};if(branch.receipts.includes(id))return{state:ledger,recorded:false,duplicate:true};
 const prelude=CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(definition=>id===`branch-prelude-${definition.id}`);if(prelude){const event=ledger.events?.[prelude.id];if(!event)return{state:ledger,recorded:false,reason:"missing-event"};ledger.events[prelude.id]={...event,preludeSeen:true,status:event.status==="scheduled"?"armed":event.status};branch.receipts.push(id);branch.receipts=branch.receipts.slice(-256);return{state:ledger,recorded:true,sceneId:id,unlockedEncounterId:prelude.id}}
 const index=branch.pending.findIndex(entry=>entry.id===id);if(index<0)return{state:ledger,recorded:false,reason:"unknown-scene"};branch.pending.splice(index,1);branch.receipts.push(id);branch.receipts=branch.receipts.slice(-256);return{state:ledger,recorded:true,sceneId:id}
}

export function queueCampaignHeroAftermathStories(value,{encounterId,outcome,floor,heroHpRate=1,storyCycle=null}={}){
 const ledger=normalizeCampaignHeroBranchStoryState(value),branch=ledger.branchStories323,definition=campaignHeroEncounterDefinition(encounterId),canonical=CAMPAIGN_HERO_BRANCH_OUTCOMES.includes(outcome)?outcome:null;if(!definition||!canonical)return{state:ledger,queued:false,reason:"invalid-outcome"};
 const rate=clampRate(heroHpRate),payload={encounterId:definition.id,heroId:definition.heroId,outcome:canonical,floor:boundedInteger(floor,definition.floor,1,CAMPAIGN_MAX_FLOOR),heroHpRate:rate,hurtPercent:Math.round((1-rate)*100),storyCycle:boundedInteger(storyCycle,ledger.storyCycle??0,0,999),heroStoryState:heroStoryState(ledger),...encounterFacts348(ledger.events[definition.id])},entries=["result","report","party"].map(part=>({...payload,part,id:`branch-${part}-${definition.id}-${canonical}`})),existing=new Set([...branch.receipts,...branch.pending.map(entry=>entry.id)]);let added=0;
 for(const entry of entries)if(!existing.has(entry.id)){branch.pending.push(entry);existing.add(entry.id);added++}branch.pending=branch.pending.slice(-24);const historyIndex=branch.history.findIndex(entry=>entry.encounterId===payload.encounterId&&entry.storyCycle===payload.storyCycle);if(historyIndex>=0)branch.history.splice(historyIndex,1);branch.history.push({...payload});branch.history=branch.history.slice(-16);return{state:ledger,queued:added>0,added,sceneIds:entries.map(entry=>entry.id)}
}

export function campaignHeroBranchStorySceneById(value,sceneId){
 const ledger=normalizeCampaignHeroBranchStoryState(value),id=cleanText(sceneId,180),prelude=CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(definition=>id===`branch-prelude-${definition.id}`);if(prelude)return preludeScene(ledger,prelude);
 for(const definition of CAMPAIGN_HERO_ENCOUNTER_SCHEDULE)for(const outcome of CAMPAIGN_HERO_BRANCH_OUTCOMES)for(const part of["result","report","party"]){if(id!==`branch-${part}-${definition.id}-${outcome}`)continue;const event=ledger.events?.[definition.id],history=[...(ledger.branchStories323?.history??[])].reverse().find(entry=>entry.encounterId===definition.id&&entry.outcome===outcome&&entry.storyCycle===ledger.storyCycle),heroHpRate=history?.heroHpRate??event?.heroHpRate??(outcome==="repelled"?0:ledger.heroes?.[definition.heroId]?.remainingHpRate??1),payload={id,part,encounterId:definition.id,heroId:definition.heroId,outcome,floor:history?.floor??event?.resolvedFloor??definition.floor,heroHpRate,hurtPercent:history?.hurtPercent??event?.hurtPercent??Math.round((1-clampRate(heroHpRate))*100),storyCycle:history?.storyCycle??ledger.storyCycle??0,heroStoryState:history?.heroStoryState??null,...encounterFacts348(history??event??{hurtPercent:Math.round((1-heroHpRate)*100)})};return aftermathScene(ledger,payload)}return null
}
