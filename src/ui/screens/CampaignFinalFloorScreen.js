import{ExploreScreen}from"./ExploreScreen.js?v=3.1.43-build363";
import{monsterVisual}from"../MonsterVisual.js?v=3.1.38-build358";
import{pixelIcon}from"../components/GameChrome.js?v=3.1.1-build320";

const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[character]);

function heroState(hero){const rate=Math.max(0,Math.min(1,Number.isFinite(Number(hero.remainingHpRate))?Number(hero.remainingHpRate):1));return{rate,percent:rate>0?Math.max(1,Math.round(rate*100)):0,defeated:hero.defeated===true||rate<=0}}

function partyActor(monster,index){
 const name=monster?.name??monster?.nickname??`魔王軍${index+1}`;
 return`<article class="royal-party-actor" data-royal-party="${index}"><span>${monsterVisual(monster,name,{className:"royal-party-visual"})}</span><small>${escapeHtml(name)}</small></article>`
}

function heroActor(hero){
 const status=heroState(hero);
 return`<article class="royal-hero-actor ${status.defeated?"is-defeated":status.percent<100?"is-wounded":""}" data-royal-hero="${escapeHtml(hero.id)}"><span>${monsterVisual({speciesId:hero.id,visualSpeciesId:hero.id},hero.name,{frame:status.defeated?"down":"idle",className:"royal-hero-visual"})}</span><small><b>神話</b>${escapeHtml(hero.name)}<em>${status.defeated?"道中撃破":`HP ${status.percent}%`}</em></small></article>`
}

export function finalAudienceDialogue({heroes=[],party=[]}={}){
 const remaining=heroes.filter(hero=>!heroState(hero).defeated),partyLead=party[0]?.name??party[0]?.nickname??"魔王";
 const lines=[{speaker:"地の文",text:"百階の扉が閉じる。黒い回廊の先、王室には玉座と二つの陣営だけが残った。"},{speaker:partyLead,text:"ここが終点だ。城門ではない。この王室で、予言ごと決着をつける。"}];
 if(!remaining.length)return[...lines,{speaker:"地の文",text:"返事はない。勇者四人は道中ですでに退けられ、王室へ辿り着いた者はいなかった。"},{speaker:"リオネルの予言",text:"戦わずして十日目は終わる。これは敗北でも勝利でもなく、予言の外側にある完全制圧だ。"}];
 const authored={
  myth_yori:"おっと〜！？ ここが王室か。イージー……とは言わせんで。残った全員で開けんかいコラァ！",
  myth_hide:"玉座までの道を確認した。初めて見る術式は、分かったふりをせず確かめる。……僕の見落としは、声に出して教えて。",
  myth_rion:"ここまでの遠征費、勝った側にまとめて請求な。いこうぜ！ 勝てば今日は豪遊するぞ！",
  myth_enami:"最初に聞く。降伏する気はある？ ……ないなら、その理不尽な支配を一個ずつ論理で詰める。まかセロリ。"
 };
 for(const hero of remaining)lines.push({speaker:hero.name,text:authored[hero.id]??"ここで決着をつける。"});
 const resolve={
  myth_enami:["ここへ来るまで、魔物にも守りたいもんがあるって何回も見た。だから、話が通じる余地だけは最後まで残しとく。","でも、仲間を傷つけてええ理由にはならん。そこだけは、何を言われても譲る気ないで。"],
  myth_yori:["港では、帰ったら何飲むかしか考えてなかったわ。今は、帰り道で聞きたい話の方が多い。","拳の出番は分かってる。今日は先走らん。今、全員がどこを見てるか分かったから。"],
  myth_hide:["最後の作戦を確認する。退路、残る魔力、持ち帰る情報。……帰還後の予定まで、今回は書いてきた。","計算できないから捨てる、ではない。計算できないものを守るために、僕はここまで式を直してきた。"],
  myth_rion:["遠征の帳簿を閉じようとしたら、値段の付かない項目ばかり残った。手間のかかる旅だったよ。","続きのページは空けてある。最後の一行を勝手に書かせるつもりはない。そこは、オレらの取り分や。"]
 };
 for(let turn=0;turn<2;turn++)for(const hero of remaining)lines.push({speaker:hero.name,text:resolve[hero.id]?.[turn]??"交わした約束を、この先へ持っていく。"});
 const wounded=remaining.filter(hero=>heroState(hero).percent<100),defeated=heroes.length-remaining.length;
 if(wounded.length||defeated)lines.push({speaker:"地の文",text:`道中の戦いは消えていない。${defeated?`${defeated}人は撃破済み。`:""}${wounded.length?`${wounded.map(hero=>hero.name).join("・")}の傷も、そのまま最終戦へ持ち越される。`:""}`});
 if(remaining.length===4)lines.push({speaker:"勇者一行",text:"りおんの合図にえなみが道を開き、ひでの術式へよりの拳が重なる。四勇共鳴――一人を見ている間に、残る三人が次の手を終えている。神話の四人が、王室を逃げ場のない間合いに変えた。"});
 else if(remaining.length>1)lines.push({speaker:"勇者一行",text:`残る${remaining.length}人が呼吸を合わせた。欠けた仲間の役割は戻らない。それでも、互いの動きへ次の一手を重ねていく。`});
 else lines.push({speaker:remaining[0].name,text:"一人でも退かん。四人分の約束だけは、ここまで持ってきた。"});
 lines.push({speaker:partyLead,text:"ならば始めよう。魔王軍四体対、ここまで残った勇者たち――最後の戦いだ。"});return lines
}

export function CampaignFinalFloorScreen({heroes=[],party=[],state,room}={}){
 const remaining=heroes.filter(hero=>!heroState(hero).defeated).length;
 const hint=room.phase==='cleared'?'玉座で「決戦の記憶」や輪廻を選べます':room.phase==='victory'?'玉座へ進み、守り抜いた世界の結末を見届けよう':room.phase==='ready'?'準備ができたら、勇者に触れて最終決戦へ':'絨毯の先へ進み、王室で待つ者と対面しよう';
 return ExploreScreen(state,{title:'魔王城-王室',party,className:'royal-explore-360',stageContentHtml:'<canvas id="royalCanvas" tabindex="0" aria-label="王室。床をタップで移動、ドラッグでカメラ移動"></canvas><div class="royal-location-seal"><small>THE LAST THRESHOLD</small><b>魔王城-王室</b></div>',stageToolsHtml:'',autoToggleHtml:'',miniMapHtml:'',navHtml:`<button data-royal-formation>${pixelIcon('formation')}編成</button><button data-royal-equipment>${pixelIcon('equipment')}装備</button><button data-royal-center>${pixelIcon('event')}現在地</button><button data-royal-exit>${pixelIcon('rest')}拠点へ</button>`})+`<aside class="royal-objective-360" role="status">${hint}<span>${room.phase==='cleared'?'予言を越えた世界':`勇者 ${remaining}/4人`}</span></aside>`;
}
