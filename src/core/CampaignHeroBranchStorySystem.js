import{CAMPAIGN_MAX_FLOOR,HERO_PARTY_IDS}from"./Campaign100System.js?v=3.1.1-build319";
import{CAMPAIGN_HERO_ENCOUNTER_SCHEDULE,campaignHeroEncounterDefinition,normalizeCampaignHeroEncounterState}from"./CampaignHeroEncounterSystem.js?v=3.1.22-build341";

export const CAMPAIGN_HERO_BRANCH_STORY_VERSION=3;
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
  line("myth_yori","フォー！！！！ ……って、ひでなら言いそうやな。完璧やん。","teasing"),
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

const PRELUDE_EXTRA={
 "myth_yori:1":[
  ["myth_hide","偵察とは観測して戻ることだ。相手を殴ることではない。復唱してください。"],
  ["myth_yori","観測して、殴って、戻る。"],
  ["myth_enami","真ん中に勝手な項目増えてるやん。あとその酒、置いていき。"],
  ["myth_yori","見送りの一杯もあかん？"],
  ["myth_rion","帰還祝いに回そう。先に飲んだら、帰ってくる理由が一個減るから。"],
  ["myth_yori","ほな預けるわ。僕がおらん間に全部飲むなよ。"],
  ["myth_hide","飲まない。合流地点を覚えているか、それだけ確認したい。"],
  ["myth_yori","覚えてる。皆が待ってるとこやろ。イージー！！"]
 ],
 "myth_hide:1":[
  ["myth_rion","ひで、待って。経路の計算は信じるけど、その袋、中身を見せて。"],
  ["myth_hide","観測器具、予備の杖、記録用紙。必要な物は揃っている。"],
  ["myth_yori","食い物ないって、さっき自分で言うてたやん。僕の分も持っていき。"],
  ["myth_hide","重量配分が変わる。だが……ありがとう。帰り道の分まであるのか。"],
  ["myth_enami","計算どおり行かへん時もあるやろ。そういう時は、帰ってきてから考えよ。"],
  ["myth_hide","観測を途中で打ち切るのは、僕の計画では……。"],
  ["myth_rion","計画に『自分を持ち帰る』って一行足して。記録だけ返ってきても困る。"],
  ["myth_hide","了解。最優先項目にします。……いいゾ〜！コレ〜！ 抜けのない計画になった。"]
 ],
 "myth_enami:1":[
  ["myth_rion","交渉役に任命するけど、相手の家計まで引き受けてこないでね。"],
  ["myth_enami","そこまでせえへん。まず、なんで戦うんか聞くだけや。"],
  ["myth_yori","前にそれ言うて、知らんおっちゃんの屋根直して帰ってきたやん。"],
  ["myth_hide","予定超過は六時間。だが帰り道の安全度は上がった。結果の評価は難しい。"],
  ["myth_enami","屋根漏れてたら、戦う理由どころちゃうやろ。話の順番があるねん。"],
  ["myth_rion","そこがえなみらしいね。じゃあ今回は、話の順番に帰還報告も入れといて。"],
  ["myth_hide","時刻になっても戻らなければ、こちらから迎えに行く。"],
  ["myth_enami","分かった。まかセロリ。……塩は持ったし、行ってくるわ。"]
 ],
 "myth_rion:1":[
  ["myth_yori","出口に値段付ける前に、自分が帰れるか確認してくれへん？"],
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
  ["myth_yori","珍しく弱気やな。僕の勝ち、信用してへん？"],
  ["myth_rion","信用してる。だから一回の売上で失くす気がないって話。"],
  ["myth_hide","今回は退路の印も置いた。勢いで全部踏み砕かないように。"],
  ["myth_yori","僕、道の印までは殴らへんで。たぶん。"],
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
  ["myth_yori","冷静に怒ってる顔、普通に怒ってる時より怖いねん。"],
  ["myth_enami","仲間を数字だけで数えられたら、言いたいことも増えるやろ。"],
  ["myth_hide","数字は僕も使う。だが、誰を守るかは計算の前に決めている。"],
  ["myth_rion","僕も値段は付けるけど、仲間を売る棚は作らないよ。"],
  ["myth_enami","うん。そこが分かってるから、一緒に来たんや。"],
  ["myth_yori","ほな、言いたいこと言うて帰ってき。続きは僕らも聞くから。"],
  ["myth_hide","帰還予定を過ぎたら連絡してください。没頭して忘れる可能性が高い。"],
  ["myth_enami","そこは否定できへんな。先に言うとく、迎えが必要になったら頼むわ。"]
 ],
 "myth_rion:2":[
  ["myth_enami","地図逆やでって言われて、まだ持ち直してへんの？"],
  ["myth_rion","今、持ち直したよ。修正が早い。これが僕の強み。"],
  ["myth_hide","誤りを認めるまでの時間は、前回より短縮されている。"],
  ["myth_yori","褒め方が帳簿みたいやな。今回は迷子の捜索代いらんとええけど。"],
  ["myth_rion","捜索が必要なら呼ぶよ。損を隠して大損にするのは、一番下手な商売だから。"],
  ["myth_enami","そっか。ほな呼ばれたら行くわ。料金の相談はあとや。"],
  ["myth_rion","身内価格ゼロじゃないの？"],
  ["myth_yori","帰ったら面白い話を一つ。それでええわ。"]
 ]
};

const HERO_RESULT_LINES=Object.freeze({
 myth_yori:Object.freeze({repelled:"ディフィカルト……せやけど、この拳が届いたことは忘れへん。","hero-victory":"イージー！！ でも、その一撃は前より深かったで。",escaped:"おっと〜！？ 逃げ足まで観察対象に入れとくわ。"}),
 myth_hide:Object.freeze({repelled:"いやいやいや笑。最後の一手だけ、式から抜けていました。","hero-victory":"フォー！！！！ 勝利。ただし損傷値は想定を超えています。",escaped:"待ってくださいよ〜！ 退路の再計算が終わってません。"}),
 myth_enami:Object.freeze({repelled:"なんやコイツ……強いやん。僕の負けでも、仲間には触れさせへん。","hero-victory":"おいおい！そんなもんか？！ ……でも、その理由は覚えとく。",escaped:"もうちょっとどこか行きたいん？ 次は話の途中で逃がさへんで。"}),
 myth_rion:Object.freeze({repelled:"おつかれナス。損失は出たけど、情報は残した。","hero-victory":"やったぜ！ でも修理代まで考えたら赤字やな。",escaped:"また今度やな。次は逃げ道にも値段を付けとく。"})
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
  pending.push({id,encounterId:encounter.id,heroId:encounter.heroId,part:entry.part,outcome,floor:boundedInteger(entry.floor,encounter.floor,1,CAMPAIGN_MAX_FLOOR),heroHpRate:clampRate(entry.heroHpRate),hurtPercent:boundedInteger(entry.hurtPercent,0,0,100),storyCycle:boundedInteger(entry.storyCycle,ledger.storyCycle??0,0,999),heroStoryState:cleanHeroStoryState(entry.heroStoryState)});
 }
 for(const entry of Array.isArray(source.history)?source.history:[]){const encounter=campaignHeroEncounterDefinition(entry?.encounterId),outcome=CAMPAIGN_HERO_BRANCH_OUTCOMES.includes(entry?.outcome)?entry.outcome:null;if(!encounter||!outcome)continue;const record={encounterId:encounter.id,heroId:encounter.heroId,outcome,floor:boundedInteger(entry.floor,encounter.floor,1,CAMPAIGN_MAX_FLOOR),heroHpRate:clampRate(entry.heroHpRate),hurtPercent:boundedInteger(entry.hurtPercent,0,0,100),storyCycle:boundedInteger(entry.storyCycle,ledger.storyCycle??0,0,999),heroStoryState:cleanHeroStoryState(entry.heroStoryState)};const index=history.findIndex(item=>item.encounterId===record.encounterId&&item.storyCycle===record.storyCycle);if(index>=0)history.splice(index,1);history.push(record)}
 ledger.branchStories323={version:CAMPAIGN_HERO_BRANCH_STORY_VERSION,storyCycle:boundedInteger(source.storyCycle,ledger.storyCycle??0,0,999),receipts,pending:pending.slice(-24),history:history.slice(-16)};return ledger.branchStories323
}

export function normalizeCampaignHeroBranchStoryState(value){const ledger=normalizeCampaignHeroEncounterState(value);normalizeBranchState(ledger);return ledger}

function charactersFor(dialogue){return[...new Set(dialogue.map(entry=>entry.speakerId).filter(Boolean))].map(id=>CHARACTERS[id]).filter(Boolean)}
function storyScene(definition,{id,part,title,summary,dialogue,castIds=null,heroState=null,location="勇者一行・野営地",eyebrow="HEROES / SIDE STORY",routeHidden=false,variant="default"}={}){return{id,kind:"hero-branch",storyTrack:"hero-encounter",storyPart:part,encounterId:definition.id,heroId:definition.heroId,floor:definition.floor,day:definition.day,routeProgress:(definition.day-1)*10,title,summary,location,eyebrow,routeHidden,variant,castVersion:340,heroStoryState:heroState,backgroundAsset:routeHidden?"./assets/ui/battle/boss-throne.png":"./assets/ui/trials/abyss-corridor-room.png",completeLabel:part==="prelude"?"探索へ戻る":part==="party"?"物語を閉じる":"次の場面",characters:castIds?castIds.map(id=>CHARACTERS[id]).filter(Boolean):charactersFor(dialogue),dialogue};}
function historyPreludeLine(ledger,definition){
 if(definition.cycle<2)return null;const record=ledger.heroes?.[definition.heroId];if(!record)return null;
 if(record.lastOutcome==="hero-victory")return line(definition.heroId,record.remainingHpRate<1?"前は勝ってる。でも、残った傷まで勝利とは言えへん。今度は無傷で戻る。":"前は無傷で帰れた。でも同じ手が通るとは限らない。退路から確かめて行く。","serious");
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
  const departure={myth_yori:"まずオレが見てくる。無理はせえへん。帰る道もちゃんと覚えとく。",myth_hide:"足跡と魔力の周期を追う。今回は退路も、食料も確認した。一人で観測してくる。",myth_enami:"僕が先に話してくる。守ってる理由を聞きたい。戻る約束は忘れへんよ。",myth_rion:"僕が出口を先に押さえる。情報を持ち帰って、次の動きに使おう。"};
  const reactions={myth_enami:"帰りが遅かったら迎えに行く。仲間を置いていく計算はせえへんからな。",myth_yori:"おっと〜！？ まず様子見やで。戻ったら話、最後まで聞くから。",myth_hide:"合流地点と時間を決めよう。……時刻表を渡すのを忘れるところだった。",myth_rion:"帰るまでが偵察だよ。情報より人の方が替えが利かないからね。"};
  base=castIds.includes(heroId)?[line(heroId,departure[heroId],"serious"),...castIds.filter(id=>id!==heroId).map(id=>line(id,reactions[id])),line(null,`${HERO_NAMES[heroId]}は退路を確かめ、単独で迷宮へ向かった。`,"narration")]:[line(null,"先行できる勇者の足音は、もうここには残っていない。","narration")];
 }
 const dialogue=[...context.filter(entry=>!entry.speakerId||castIds.includes(entry.speakerId)),...base];
 return storyScene(definition,{id:`branch-prelude-${definition.id}`,part:"prelude",title:`${HERO_NAMES[heroId]}、単独行動`,summary:`勇者一行から${HERO_NAMES[heroId]}が一人で離れた。この会話の後から、迷宮内で遭遇する可能性が生まれる。`,dialogue,castIds,heroState,variant:context.length||castIds.length<4?"continuity":"default"})
}

function resultScene(ledger,payload,definition){
 const name=HERO_NAMES[definition.heroId],hurt=payload.hurtPercent,outcome=payload.outcome,lead=outcome==="repelled"?`${name}は魔王軍に退けられ、勇者一行への帰路を失った。`:outcome==="hero-victory"?(hurt>0?`${name}は戦いに勝った。しかし刻まれた${hurt}%の傷は消えない。`:`${name}は戦いに勝ち、傷を負うことなく帰路についた。`):`追跡は途切れた。${name}は魔王軍を見失い、決着はつかなかった。`,dialogue=[line(null,lead,"narration"),line(definition.heroId,outcome==="hero-victory"&&hurt===0?({myth_yori:"イージー！！ 今日は腕も足も無事や。戻って、話の続きを聞こか。",myth_hide:"フォー！！！！ 勝利。損傷ゼロまで確認しました。……帰路も、今回は確認済みです。",myth_enami:"勝ったで。怪我もない。せやけど、勝ったことと相手の理由を知ることは別やな。",myth_rion:"やったぜ！ 今回は修理費ゼロ。帰ってからの食事を一品増やそう。"}[definition.heroId]):HERO_RESULT_LINES[definition.heroId]?.[outcome]??"この結果は、次へ持ち越す。",outcome==="repelled"?"repelled":outcome==="hero-victory"?"confident":"quiet")];
 if(outcome!=="escaped"&&hurt>0)dialogue.push(line(null,`この遭遇で残った損傷は ${hurt}%。十日目の戦いまで引き継がれる。`,"narration"));
 const parting={
  myth_enami:{repelled:"最後まで話、聞けへんかったな。……でも、僕が守りたかった理由まで、なかったことにはさせへんよ。",other:"報告は順番にしよ。戦った理由、通れた道、それから帰ってきたこと。最後のは先に言おか。"},
  myth_yori:{repelled:"勢いだけで行ったらあかんって、言われたのにな。……次の拳は、頼んだで。",other:"土産話、面白く盛ろうと思ったけどやめとくわ。聞くやつがおる時に、ちゃんとほんまの話をする。"},
  myth_hide:{repelled:"記録は残す。僕の計算が、次に読む者の退路にはなるように。……そこだけは、間違えたくない。",other:"相手の動きは記録した。僕が迷った箇所も消さない。そこを隠すと、次の計算まで間違う。"},
  myth_rion:{repelled:"最後の行、赤字だけで終わらせたくないな。残した情報で、誰かが一歩先へ行けるなら……。",other:"今日の記録、売る前に読み直そう。失敗のところを削ると、一番役に立つ部分がなくなるからね。"}
 };
 dialogue.push(line(definition.heroId,parting[definition.heroId][outcome==="repelled"?"repelled":"other"],outcome==="repelled"?"quiet":"resolute"),line(null,outcome==="repelled"?"一人の足音が途切れた。残された言葉だけが、まだ先へ続いていた。":"迷宮を離れる足取りは、来た時と同じではなかった。知ったことを抱え、帰りの道を選び直した。","narration"));
 return storyScene(definition,{id:payload.id,part:"result",title:outcome==="repelled"?"迷宮側の勝利":outcome==="hero-victory"?"勇者側の勝利":"追跡から離脱",summary:lead,dialogue,location:`第${payload.floor}階・遭遇地点`,eyebrow:"ENCOUNTER / RESULT",variant:outcome})
}
function reportScene(payload,definition){
 const name=HERO_NAMES[definition.heroId],hurt=payload.hurtPercent,outcome=payload.outcome,report=outcome==="repelled"?`${name}を途中で撃退しました。十日目の勇者軍から一人が欠けます。`:outcome==="hero-victory"?(hurt>0?`先遣部隊は${name}に敗北。ただし、相手へ${hurt}%の傷を刻みました。`:`先遣部隊は${name}に敗北。相手は無傷です。行動の記録を持ち帰りました。`):`${name}との接触を回避しました。こちらの戦力は温存されています。`,reply=outcome==="repelled"?"よい。予言から一人を削った。余が足を動かさずとも、未来は動くようだ。":outcome==="hero-victory"?(hurt>0?"敗北は構わぬ。残した傷は、十日目に働く兵だ。記録して次を放て。":"無傷か。ならば、なぜ刃が届かなかったかを記せ。次も同じ敗北を買う気はない。"):"逃げ切ったのか、逃がしたのか。……報告書には前者と書いておけ。",dialogue=[line("lionel",`サイラーン様。第${payload.floor}階の報告です。${report}`,"serious",{stageEffect:"lionel-slime"}),line("sairan",reply,"command",{stageEffect:"lionel-slime"}),line("lionel","承知しました。次の区画にも、結果を引き継いで布陣します。","resolute",{stageEffect:"lionel-slime"})];
 return storyScene(definition,{id:payload.id,part:"report",title:"玉座への進捗報告",summary:`スライムの姿を借りたリオネルが、${name}との遭遇結果をサイラーンへ伝える。`,dialogue,location:"魔王城・玉座の間",eyebrow:"DEMON LORD / REPORT",routeHidden:true,variant:outcome})
}
function partyScene(ledger,payload,definition){
 const heroId=definition.heroId,name=HERO_NAMES[heroId],outcome=payload.outcome,hurt=payload.hurtPercent,heroState=cleanHeroStoryState(payload.heroStoryState)??heroStoryState(ledger);
 heroState.heroes[heroId]={defeated:outcome==="repelled",remainingHpRate:outcome==="repelled"?0:payload.heroHpRate};
 heroState.awayHeroIds=heroState.awayHeroIds.filter(id=>id!==heroId);
 const castIds=presentHeroes(heroState),others=castIds.filter(id=>id!==heroId),dialogue=[];
 if(outcome==="repelled"){
  dialogue.push(line(null,`${name}は野営地へ戻らなかった。残された仲間は、途切れた足音の意味を理解した。`,"narration"));
  if(others.includes("myth_hide"))dialogue.push(line("myth_hide",`${name}の反応が消えた。捜索より先に、残った${others.length}人の生存率を計算する。`,"serious"));
  if(others.includes("myth_enami"))dialogue.push(line("myth_enami","計算だけで置いていかへん。最後におった場所まで、必ず迎えに行く。","cold"));
  if(others.includes("myth_rion"))dialogue.push(line("myth_rion","損失にはしない。残した情報も意思も、全部こっちの戦力にする。","serious"));
  if(others.includes("myth_yori"))dialogue.push(line("myth_yori",castIds.length===1?"もう僕しかおらんのか。……急いで終わらせようとはせえへん。あいつらが残した道、最後まで歩く。":"次は一人で行かへん。あいつの分まで、全員で殴りに行く。","serious"));
 }else{
  dialogue.push(line(heroId,outcome==="hero-victory"&&hurt===0?({myth_yori:"イージー！！ ……ただいま。今日は傷も増やさず戻れたで。",myth_hide:"帰還しました。今回は損傷ゼロ。確認のために二度計算しました。",myth_enami:"戻ったで。話はまだ途中やけど、怪我はしてへん。まず報告するわ。",myth_rion:"やったぜ！ 無傷で帰還。今日は修理代より食事代に回せるよ。"}[heroId]):PARTY_RETURN_LINES[heroId]?.[outcome]??"戻った。次へ進もう。",outcome==="hero-victory"?"confident":"quiet"));
  if(hurt>0){if(heroId==="myth_hide"||others.includes("myth_hide"))dialogue.push(line("myth_hide",`損傷は${hurt}%。勝敗に関係なく、その傷は十日目まで残る。`,"serious"));else dialogue.push(line(null,`戦いで刻まれた${hurt}%の傷は、十日目まで消えずに残る。`,"narration"))}
  else if(others.includes("myth_hide"))dialogue.push(line("myth_hide",outcome==="escaped"?"待ってくださいよ〜！ 逃げ道は計算してました。……塞ぐ人の配置、忘れてました。":"いいゾ〜！コレ〜！ 無傷で帰還、計算どおりです。……帰還祝いの買い出し、忘れてました。","normal"));
  if(others.includes("myth_yori"))dialogue.push(line("myth_yori",outcome==="escaped"?"おっと〜！？ ほな次は僕も一緒に行くわ。帰ってこれたんやし、まず座り。":"イージー！！ ……って、僕は留守番やったな。おかえり。","gentle"));
  if(heroId!=="myth_enami"&&others.includes("myth_enami"))dialogue.push(line("myth_enami",outcome==="hero-victory"?(hurt>0?"勝った顔してるけど、傷まで無かったことにはせえへんで。":"勝って、無傷で帰ったんやな。ほな今日は安心して話を聞けるわ。"):(castIds.length===4?"戻ってきたならええ。次は四人で話を終わらせる。":"戻ってきたならええ。次は残った仲間で、話を終わらせる。"),"gentle"));
  if(heroId!=="myth_rion"&&others.includes("myth_rion"))dialogue.push(line("myth_rion",outcome==="hero-victory"?"勝利の記録は残す。治療費を引いても価値はあるよ。":"逃げられた経路も商品になる。次の先回りに使おう。","normal"));
 }
 const campWords=outcome==="repelled"?{
  myth_enami:["戻らんかったことを、仕方ないの一言で終わらせたくない。次に何を守るか、僕はもう決めた。","あいつが残した話、ちゃんと覚えてる。ここから先は、僕らが続きを持っていく。"],
  myth_yori:["今日は飲まへん。聞いた声まで曖昧にしたくないから。","拳を振るう前に周りを見る。今ここにおる仲間を、同じように失くさんために。"],
  myth_hide:["計算表に空欄ができた。別の数値で埋めれば済む欄ではない。","残った戦力で作戦を組み直す。無駄に急いで、空欄を増やすことはしない。"],
  myth_rion:["帳簿には損失って書ける。でも、それで片付く話じゃないのは分かってる。","ここに残した荷物は預かる。帰り道の記録から、名前を消すつもりはないよ。"]
 }:{
  myth_enami:["報告の前に座ろ。言いたいこと、飯食いながらでも聞けるやろ。","帰ってきた顔見たら安心したわ。……塩探してただけちゃうで、今の話は聞いてた。"],
  myth_yori:["おかえりって言えるん、ええな。結果の話より先に、それ言いたかってん。","次は無理する前に呼びや。僕の拳、助けに行く分も残しとくから。"],
  myth_hide:["報告書には経路と損傷、それから帰還を記録する。最後の項目が最も重要です。","帰還祝いの準備は……いやいやいや笑、食器が一つ足りない。書類用の皿まで数えていました。"],
  myth_rion:["情報は持ち帰ってこそ価値がある。でも一番替えが利かないのは、持って帰ってきた本人だよ。","食事代は僕持ち。今日の記録は売る前に、まず皆で読む。都合の悪い失敗も、ちゃんと残そう。"]
 };
 const returnedWords={myth_enami:["戻ったで。顔見たら、言いたかった話の順番どっか行ったわ。まず座ってもええ？","待ってくれてありがとう。次も、寄り道だけで終わらせんと、ちゃんとここへ帰る。"],myth_yori:["ただいま。戻って座る場所があるん、思ってたより助かるな。","次は勢いだけで決めへん。今は聞いてほしいことがあるから、最後まで付き合ってな。"],myth_hide:["帰還しました。記録は揃っています。……ただいま、と先に言うべきでしたね。","計算が外れた箇所も報告する。一人で隠すより、次に直せる方がいい。"],myth_rion:["ただいま。情報も僕も、まとめて持ち帰ったよ。今日はそれで黒字ってことにしよう。","待ってくれてありがとう。次の先回りは、合流するところまで含めて組み直すよ。"]};
 for(let turn=0;turn<2;turn++)for(const id of castIds)dialogue.push(line(id,outcome!=="repelled"&&id===heroId?returnedWords[id][turn]:campWords[id][turn],outcome==="repelled"?"serious":"gentle"));
 if(castIds.length===1&&castIds[0]===heroId){
  const words={myth_enami:"ただいま。……聞く相手がおらんくても、戻ったって言うとく。約束したからな。",myth_yori:"ただいま。今日は大声出すの、やめとこ。まず火を起こして、報告を残すわ。",myth_hide:"帰還時刻を記録する。報告を聞く者はいない。それでも、この欄は空けない。",myth_rion:"帰還。情報も荷物も持ち帰ったよ。記録だけは、僕がちゃんと続ける。"};
  dialogue.splice(0,dialogue.length,line(null,heroState.awayHeroIds.length?"野営地へ戻ると、別行動中の仲間の荷物が残っていた。合流まで、火を絶やさず待つ。":"野営地へ戻った。出迎える声はなく、以前の焚き火の跡だけが残っていた。","narration"),line(heroId,heroState.awayHeroIds.length?"先に戻った。報告をまとめて、ここで合流を待とう。":words[heroId],"quiet"),line(null,hurt>0?`残る損傷は${hurt}%。手当てと休息の支度を、ひとりで始めた。`:"荷物を下ろし、次の道と帰りの道を、どちらも記録に残した。","narration"));
 }
 if(outcome==="repelled"&&castIds.length===1){
  for(const entry of dialogue){entry.text=entry.text.replace("僕らが続きを持っていく","僕が続きを持っていく").replace("今ここにおる仲間を、同じように失くさんために。","残された自分まで、同じように失くさんために。");}
 }
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
 const rate=clampRate(heroHpRate),payload={encounterId:definition.id,heroId:definition.heroId,outcome:canonical,floor:boundedInteger(floor,definition.floor,1,CAMPAIGN_MAX_FLOOR),heroHpRate:rate,hurtPercent:Math.round((1-rate)*100),storyCycle:boundedInteger(storyCycle,ledger.storyCycle??0,0,999),heroStoryState:heroStoryState(ledger)},entries=["result","report","party"].map(part=>({...payload,part,id:`branch-${part}-${definition.id}-${canonical}`})),existing=new Set([...branch.receipts,...branch.pending.map(entry=>entry.id)]);let added=0;
 for(const entry of entries)if(!existing.has(entry.id)){branch.pending.push(entry);existing.add(entry.id);added++}branch.pending=branch.pending.slice(-24);const historyIndex=branch.history.findIndex(entry=>entry.encounterId===payload.encounterId&&entry.storyCycle===payload.storyCycle);if(historyIndex>=0)branch.history.splice(historyIndex,1);branch.history.push({...payload});branch.history=branch.history.slice(-16);return{state:ledger,queued:added>0,added,sceneIds:entries.map(entry=>entry.id)}
}

export function campaignHeroBranchStorySceneById(value,sceneId){
 const ledger=normalizeCampaignHeroBranchStoryState(value),id=cleanText(sceneId,180),prelude=CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(definition=>id===`branch-prelude-${definition.id}`);if(prelude)return preludeScene(ledger,prelude);
 for(const definition of CAMPAIGN_HERO_ENCOUNTER_SCHEDULE)for(const outcome of CAMPAIGN_HERO_BRANCH_OUTCOMES)for(const part of["result","report","party"]){if(id!==`branch-${part}-${definition.id}-${outcome}`)continue;const event=ledger.events?.[definition.id],history=[...(ledger.branchStories323?.history??[])].reverse().find(entry=>entry.encounterId===definition.id&&entry.outcome===outcome&&entry.storyCycle===ledger.storyCycle),heroHpRate=history?.heroHpRate??event?.heroHpRate??(outcome==="repelled"?0:ledger.heroes?.[definition.heroId]?.remainingHpRate??1),payload={id,part,encounterId:definition.id,heroId:definition.heroId,outcome,floor:history?.floor??event?.resolvedFloor??definition.floor,heroHpRate,hurtPercent:history?.hurtPercent??event?.hurtPercent??Math.round((1-clampRate(heroHpRate))*100),storyCycle:history?.storyCycle??ledger.storyCycle??0,heroStoryState:history?.heroStoryState??null};return aftermathScene(ledger,payload)}return null
}
