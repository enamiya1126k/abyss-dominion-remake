import{monsterVisual}from"../MonsterVisual.js?v=3.1.1-build320";
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
  myth_yori:"おっと〜！？ ここが王室か。イージー……とは言わせへんで。残った全員で開けんかいコラァ！",
  myth_hide:"いやいやいや笑、玉座まで罠がゼロ。待ってくださいよ〜！ ……あ、退路の計算だけ入れ忘れました。",
  myth_rion:"ここまでの遠征費、勝った側にまとめて請求な。いこうぜ！ 勝てば今日は豪遊するぞ！",
  myth_enami:"最初に聞く。降伏する気はある？ ……ないなら、その理不尽な支配を一個ずつ論理で詰める。まかセロリ。"
 };
 for(const hero of remaining)lines.push({speaker:hero.name,text:authored[hero.id]??"ここで決着をつける。"});
 const resolve={
  myth_enami:["ここへ来るまで、魔物にも守りたいもんがあるって何回も見た。せやから、話が通じる余地だけは最後まで残しとく。","でも、仲間を傷つけてええ理由にはならへん。そこだけは、何を言われても譲る気ないで。"],
  myth_yori:["港では、帰ったら何飲むかしか考えてへんかったわ。今は、帰り道で聞きたい話の方が多い。","拳の出番は分かってる。今日は先走らへん。合図が出るまで、ちゃんと待てるからな。"],
  myth_hide:["最後の作戦を確認する。退路、残る魔力、持ち帰る情報。……帰還後の予定まで、今回は書いてきた。","計算できないから捨てる、ではない。計算できないものを守るために、僕はここまで式を直してきた。"],
  myth_rion:["遠征の帳簿を閉じようとしたら、値段の付かない項目ばかり残った。手間のかかる旅だったよ。","続きのページは空けてある。最後の一行を勝手に書かせるつもりはない。そこは、僕らの取り分だ。"]
 };
 for(let turn=0;turn<2;turn++)for(const hero of remaining)lines.push({speaker:hero.name,text:resolve[hero.id]?.[turn]??"交わした約束を、この先へ持っていく。"});
 const wounded=remaining.filter(hero=>heroState(hero).percent<100),defeated=heroes.length-remaining.length;
 if(wounded.length||defeated)lines.push({speaker:"地の文",text:`道中の戦いは消えていない。${defeated?`${defeated}人は撃破済み。`:""}${wounded.length?`${wounded.map(hero=>hero.name).join("・")}の傷も、そのまま最終戦へ持ち越される。`:""}`});
 if(remaining.length===4)lines.push({speaker:"勇者一行",text:"四人の呼吸が重なった瞬間、神話共鳴『無敵』が発動する。十神四体をも上回る圧力が王室を満たした。"});
 else if(remaining.length>1)lines.push({speaker:"勇者一行",text:`残る${remaining.length}人の共鳴が傷を力へ変える。四人の『無敵』には届かなくても、単独の勇者とは別物だ。`});
 else lines.push({speaker:remaining[0].name,text:"一人でも退かへん。四人分の約束だけは、ここまで持ってきた。"});
 lines.push({speaker:partyLead,text:"ならば始めよう。魔王軍四体対、ここまで残った勇者たち――最後の戦いだ。"});return lines
}

export function CampaignFinalFloorScreen({heroes=[],party=[],audienceCompleted=false,reincarnationCycle=0}={}){
 const remaining=heroes.filter(hero=>!heroState(hero).defeated),allRepelled=remaining.length===0,dialogue=finalAudienceDialogue({heroes,party}),initialIndex=audienceCompleted?dialogue.length-1:0;
 return`<section class="screen campaign-final-floor-screen royal-audience-screen" data-final-floor="royal-audience" data-final-dialogue-index="${initialIndex}">
  <header class="campaign-final-floor-header"><div><small>予言10日目・王室専用フィールド${reincarnationCycle?`・輪廻${reincarnationCycle}`:""}</small><h1>魔王城・謁見の王室</h1></div><span class="campaign-final-floor-progress"><small>勇者軍・残存戦力</small><b>${remaining.length}/4人</b></span></header>
  <main class="royal-audience-field">
   <div class="royal-throne" aria-hidden="true"><i></i><b>ABYSS THRONE</b></div><div class="royal-field-depth" aria-hidden="true"></div>
   <section class="royal-side royal-side-party" aria-label="魔王軍">${party.map(partyActor).join("")}</section><span class="royal-versus" aria-hidden="true">対</span><section class="royal-side royal-side-heroes" aria-label="勇者一行">${heroes.map(heroActor).join("")}</section>
   <section class="royal-dialogue" aria-live="polite"><small>FINAL AUDIENCE</small>${dialogue.map((line,index)=>`<p data-final-dialogue-line="${index}" ${index===initialIndex?"":"hidden"}><b>${escapeHtml(line.speaker)}</b><span>「${escapeHtml(line.text)}」</span></p>`).join("")}<div><button type="button" data-final-audience-next ${audienceCompleted?"hidden":""}>会話を進める</button><button type="button" data-final-floor-approach ${audienceCompleted?"":"hidden"}>${allRepelled?"予言外の結末へ":`最終決戦を開始（勇者${remaining.length}/4人）`}</button></div></section>
  </main>
  <footer class="campaign-final-floor-footer"><p>王室では通常探索・鍵・雑魚戦は発生しません。道中の傷と撃破状態を固定したまま最終戦へ移行します。</p><nav><button type="button" data-final-floor-formation>${pixelIcon("formation")} 編成</button><button type="button" data-final-floor-return>${pixelIcon("home")} 戻る</button></nav></footer>
 </section>`
}
