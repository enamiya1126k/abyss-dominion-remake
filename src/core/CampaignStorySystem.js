import{CAMPAIGN_MAX_FLOOR,HERO_PARTY_IDS}from"./Campaign100System.js?v=3.1.42-build362";

export const CAMPAIGN_STORY_VERSION=2;
export const CAMPAIGN_STORY_OPENING_VERSION=2;
export const CAMPAIGN_STORY_OPENING_ID="opening-prophecy";
export const CAMPAIGN_STORY_MILESTONES=Object.freeze(Array.from({length:10},(_,index)=>(index+1)*10));

export const CAMPAIGN_WORLD_LORE=Object.freeze({
 oldWorld:Object.freeze({state:"滅亡",lastSurvivorIds:Object.freeze(["sairan","lionel"])}),
 newWorld:Object.freeze({rule:"旧世界の強大な存在と覇気を異物として感知する"}),
 sairan:Object.freeze({role:"旧世界を留める楔",reason:"玉座を離れると魔王城に縫い留めた旧世界の残滓が崩れ、覇気も勇者へ即座に悟られる"}),
 lionel:Object.freeze({role:"新世界の魔物を束ねる現地指揮官",avatar:"slime",reason:"力・姿・記憶の一部を封じ、新世界が受け入れる最弱の器へ潜伏する"})
});

const HERO_ID_ALIASES=Object.freeze({
 enami:"myth_enami","えなみ":"myth_enami",myth_enami:"myth_enami",
 yori:"myth_yori","より":"myth_yori",myth_yori:"myth_yori",
 hide:"myth_hide","ひで":"myth_hide",myth_hide:"myth_hide",
 rion:"myth_rion","りおん":"myth_rion",myth_rion:"myth_rion"
});

const portrait=(speciesId,folder,asset=null)=>Object.freeze({type:"monster-sprite",speciesId,asset:asset??`./assets/monsters/${folder}/idle1.png?v=3.1.0-build310`});
export const CAMPAIGN_STORY_CHARACTERS=Object.freeze({
 sairan:Object.freeze({id:"sairan",name:"魔王サイラーン",title:"万魔の王",origin:"old-world",lastOldWorldSurvivor:true,storyOnly:true,recurringStoryCharacter:true,battleEligible:false,portrait:portrait("campaign_sairan","campaign_sairan","./assets/story/campaign-sairan.png?v=3.1.2-build321")}),
 lionel:Object.freeze({id:"lionel",name:"預言者リオネル",title:"魔界随一の預言者",origin:"old-world",lastOldWorldSurvivor:true,storyOnly:true,recurringStoryCharacter:true,battleEligible:false,avatarPlayable:true,avatarSpeciesId:"slime",portrait:portrait("campaign_lionel","campaign_lionel","./assets/story/campaign-lionel.png?v=3.1.2-build321")}),
 myth_enami:Object.freeze({id:"myth_enami",name:"えなみ",title:"共感と論理の勇者",portrait:portrait("myth_enami","myth_enami")}),
 myth_yori:Object.freeze({id:"myth_yori",name:"より",title:"微笑む蒼拳",portrait:portrait("myth_yori","myth_yori")}),
 myth_hide:Object.freeze({id:"myth_hide",name:"ひで",title:"緻密なる魔導士",portrait:portrait("myth_hide","myth_hide")}),
 myth_rion:Object.freeze({id:"myth_rion",name:"りおん",title:"即断の商略家",portrait:portrait("myth_rion","myth_rion")})
});

export const CAMPAIGN_HERO_DIALOGUE_STYLE="全員土佐弁を標準語に寄せようとして、標準語に関西弁のような響きが少し混じる。強い関西弁の否定形は使わない。";
export const CAMPAIGN_HERO_DIALOGUE_PROFILES=Object.freeze({
 myth_enami:Object.freeze({core:"相手の事情へ一度寄り添い、理不尽や矛盾を見つけると論理で逃げ道を塞ぐ",flaw:"何かへ没頭すると仲間の話が聞こえなくなる",firstPerson:"僕",background:"食品衛生管理者を持っているが知識ゼロ"}),
 myth_yori:Object.freeze({core:"普段は笑って最後まで話を聞き、酔うと敵へ一切容赦しない",flaw:"酔うと味方にも拳が向くことがある",background:"元自衛隊。テトラポッドへ落ちて死にかけたところを、ひでに助けられた"}),
 myth_hide:Object.freeze({core:"最も計算的で、状況の核心を正確に言い当てる",flaw:"作戦の一番大事な前提を一つだけ忘れる",background:"狩猟免許を持つ。テトラポッドに落ちたよりを助けた"}),
 myth_rion:Object.freeze({core:"金になる案を次々出し、思いついた瞬間に実行へ移す",flaw:"準備より行動が先に始まる",firstPerson:"オレ",background:"理学療法士の免許を持つ。足の裏の皮がめくれたとき、コンビニで水を買って洗った"})
});

export const CAMPAIGN_HERO_CATCHPHRASES=Object.freeze({
 myth_yori:Object.freeze(["イージー！！","開けんかいコラァ！","ディフィカルト","ユーアービューティフォー！！","おっと〜！？"]),
 myth_hide:Object.freeze(["フォー！！！！","いいゾ〜！コレ〜！","いやいやいや笑","待ってくださいよ〜！","いいんすか！！"]),
 myth_rion:Object.freeze(["おつかれナス","また今度やな","いこうぜ！","やったぜ！","最高やな","今日は豪遊するぞ！"]),
 myth_enami:Object.freeze(["メンタル！！","なんやコイツ","もうちょっとどこか行きたい","おいおい！そんなもんか？！","塩ください","まかセロリ"])
});

const CAMPAIGN_HERO_VOICE_LINES=Object.freeze({
 myth_yori:Object.freeze({
  spotted:Object.freeze(["おっと〜！？ 見つけたで。まずは動き、見せてもらおか。","おっと〜！？ また会ったな。今度は逃がさんで。"]),
  contact:Object.freeze(["イージー！！ ……と言いたいところやけど、まずは最後まで見せてもらう。","ディフィカルト。でも、難しい方がおもしろいやろ。"]),
  repelled:"おっと〜！？ これはディフィカルト。ええ勝負やった。",
  retreated:"おっと〜！？ 逃げるんか。次は間合い、先に塞ぐで。",
  heroVictory:"イージー！！ でも、最後までよう立ってたな。",
  finalPlayerWin:"ディフィカルト。……完敗や。ユーアービューティフォー！！",
  finalHeroesWin:"ユーアービューティフォー！！ ええ戦いやったで！"
 }),
 myth_hide:Object.freeze({
  spotted:Object.freeze(["いいゾ〜！コレ〜！ 予測地点どおりです。","フォー！！！！ 追跡計算、完全一致です。"]),
  contact:Object.freeze(["いいゾ〜！コレ〜！ 戦闘記録の誤差はゼロです。","フォー！！！！ 今回は最重要項目まで確認しました。"]),
  repelled:"いやいやいや笑。その一手は計算にないです。",
  retreated:"待ってくださいよ〜！ 逃走経路の計算がまだ終わってません。",
  heroVictory:"フォー！！！！ 計算どおりです。……今回は。",
  finalPlayerWin:"いやいやいや笑。最後の一手だけ、計算から抜けました。",
  finalHeroesWin:"フォー！！！！ いいゾ〜！コレ〜！"
 }),
 myth_rion:Object.freeze({
  spotted:Object.freeze(["いこうぜ！ 先回り成功や。","やったぜ！ 今度は出口ごと押さえた。"]),
  contact:Object.freeze(["いこうぜ！ 戦って得た情報まで、全部次の勝ちへ変える。","最高やな。情報も勝ち筋も、ここでまとめて回収するよ。"]),
  repelled:"おつかれナス。また今度やな。次はこの損失ごと回収する。",
  retreated:"また今度やな。次は逃げ道にも値段を付けとく。",
  heroVictory:"やったぜ！ この勝ち、次の作戦資金に変えるよ。",
  finalPlayerWin:"おつかれナス。また今度やな。次は勝てる案を持ってくる。",
  finalHeroesWin:"やったぜ！ 最高やな。今日は豪遊するぞ！"
 }),
 myth_enami:Object.freeze({
  spotted:Object.freeze(["なんやコイツ。まずは話、聞かせてもらおか。","また来たん。もうちょっとどこか行きたいんかと思ったわ。"]),
  contact:Object.freeze(["そっちにも理由はあるんやろ。まず聞く。でも仲間を狙うなら、話は別や。","なんやコイツ。仲間を狙って『仕方ない』では通らんで。"]),
  repelled:"なんやコイツ……強いやん。次は理屈も力も、最初から全部持ってくる。",
  retreated:"もうちょっとどこか行きたいん？ 次は話の途中で逃がさんで。",
  heroVictory:"おいおい！そんなもんか？！ ……まだ話、終わってないで。",
  finalPlayerWin:"なんやコイツ……強すぎるやろ。今回はそっちの理屈が通った。",
  finalHeroesWin:"おいおい！そんなもんか？！ もうちょっとどこか行きたい。"
 })
});

const voiceHeroId=value=>HERO_ID_ALIASES[typeof value==="string"?value.trim():""]??null;
export function campaignHeroVoiceLine(heroId,moment,{cycle=1}={}){
 const id=voiceHeroId(heroId),entry=id?CAMPAIGN_HERO_VOICE_LINES[id]?.[moment]:null;if(Array.isArray(entry)){const index=Math.max(0,Math.min(entry.length-1,Math.floor(Number(cycle)||1)-1));return entry[index]??entry[0]??""}return typeof entry==="string"?entry:""
}
export function campaignHeroFinalVoiceLines(moment,heroIds=HERO_PARTY_IDS){
 const ids=[...new Set((Array.isArray(heroIds)?heroIds:HERO_PARTY_IDS).map(voiceHeroId).filter(Boolean))];return ids.map(heroId=>({heroId,text:campaignHeroVoiceLine(heroId,moment)})).filter(entry=>entry.text)
}

export const CAMPAIGN_STORY_POLICY=Object.freeze({
 sairan:Object.freeze({storyOnly:true,recurring:true,battleEligible:false,finalBattleParticipant:false,summonEligible:false,codexEligible:false}),
 lionel:Object.freeze({storyOnly:true,recurring:true,battleEligible:false,avatarPlayable:true,avatarSpeciesId:"slime",finalBattleParticipant:false,summonEligible:false,codexEligible:false}),
 finalBattle:Object.freeze({partySize:4,heroIds:HERO_PARTY_IDS,allowSairan:false,allowLionel:false})
});

const line=(speakerId,text,tone="normal",directives={})=>Object.freeze({speakerId,text:speakerId==="myth_rion"?text.replaceAll("僕","オレ"):text,tone,...directives});
const scene=(floor,location,summary,backgroundAsset,dialogue)=>Object.freeze({
 id:`road-${String(floor).padStart(3,"0")}`,kind:"milestone",floor,day:floor/10,location,summary,
 routeProgress:floor,backgroundAsset,dialogue:Object.freeze(dialogue)
});

export const CAMPAIGN_STORY_OPENING=Object.freeze({
 id:CAMPAIGN_STORY_OPENING_ID,kind:"opening",floor:0,day:0,location:"魔王城・玉座の間",routeProgress:0,
 backgroundAsset:"./assets/ui/battle/boss-throne.png",
 title:"滅びた世界、最弱の器",summary:"旧世界最後の生存者リオネルは、玉座を離れられないサイラーンに代わり、スライムの姿で新世界の迷宮へ潜入する。",
 dialogue:Object.freeze([
  line(null,"かつて栄えた旧世界は、名も残らぬ災厄によって滅びた。","narration"),
  line(null,"最後まで残ったのは、魔王サイラーンと預言者リオネル。ただ二人だけだった。","narration"),
  line("lionel","サイラーン様。崩壊の向こうに、新しい世界が生まれています。魔物も、人も、我らの名を知りません。","serious"),
  line("sairan","好都合だ。ならば新世界の魔物を統べ、再び軍を起こす。","command"),
  line("lionel","ですが、あの世界の法則は旧世界の強者を異物として感知します。私たちが近づけば、遠方からでも覇気を悟られます。","serious"),
  line("sairan","余の覇気程度で騒ぐとは、繊細な世界だ。","dry"),
  line(null,"サイラーンが玉座から左足をわずかに動かす。魔王城全体が、低く軋んだ。","narration"),
  line("lionel","動かないでください。今、城の西塔が三センチほど沈みました。","urgent"),
  line("sairan","立ってはいない。足を三センチ動かしただけだ。","dry"),
  line("lionel","その三センチが問題です。玉座は旧世界の残滓を新世界へ縫い留める楔。あなたが離れれば、この城は崩れます。","serious"),
  line("sairan","最強になった結果、椅子から動けぬとは聞いていないぞ。","dry"),
  line("lionel","私も、そのような注意書きを未来で見落としておりました。","quiet"),
  line("sairan","では余が一日だけ出る。残りの日は座る。","command"),
  line("lionel","日割りの問題ではございません。出た瞬間に終わります。","dry"),
  line("lionel","陛下が玉座へ残るのは、力を温存するためではありません。旧世界の最後の形を、ここへ留めるためです。"), 
  line("sairan","分かっている。立てぬ理由を毎朝読み上げなくてもよい。"), 
  line("lionel","では一つだけ。新世界の魔物は、私たちの臣下ではありません。"), 
  line("sairan","これからそうする。"), 
  line("lionel","その「これから」の間に、十日目が来るのです。"), 
  line("sairan","ならば命令以外も使え。話を聞き、力を示し、必要なら頭を下げろ。"), 
  line("lionel","陛下は下げたことがおありですか。"), 
  line("sairan","今からお前に任せる。それが王の仕事だ。"), 
  line(null,"リオネルの瞳に、まだ起きていない十日後の光景が映る。","narration"),
  line("lionel","そして十日後、西の大陸から四人の勇者が、この魔王城へ到達します。","serious"),
  line("sairan","名を。力の輪郭まで、余さず告げよ。","command"),
  line("lionel","えなみ、より、ひで、りおん。単独なら未熟。しかし四人が揃った時、玉座の楔を断つ力になります。","serious"),
  line("sairan","ならば百階の迷宮を軍へ変える。新世界の魔物を集め、選び、鍛えよ。","command"),
  line("lionel","承知しました。私が迷宮へ降り、彼らを束ねます。","resolute"),
  line("lionel","ただし、この姿と魔力のままでは勇者だけでなく、新世界そのものに発見されます。","serious"),
  line("sairan","ならば隠せ。預言者なら、自分の姿くらい欺いてみせよ。","command"),
  line("lionel","力、姿、そして記憶の一部を封じます。世界が異物と見なさぬ、最も弱い器へ。","resolute"),
  line("sairan","最も弱い器とは。","normal"),
  line("lionel","スライムです。小さく、柔らかく、誰からも警戒されません。","matter-of-fact"),
  line("sairan","……軍を率いる者が、最初に踏まれぬことだけを祈ろう。","dry"),
  line(null,"リオネルは魔法陣の中心へ立ち、自らの魔力を幾重もの封印へ沈めていく。","narration",{stageEffect:"lionel-seal"}),
  line(null,"長衣も杖も光へほどけ、床には一体の青いスライムだけが残った。","narration",{stageEffect:"lionel-slime"}),
  line("lionel","声まで軽い……。ですが、この姿なら誰にも悟られません。","quiet",{stageEffect:"lionel-slime"}),
  line("sairan","姿が変わっても名はリオネルだ。第一階から軍を率い、十日後に余へ勝利を報告せよ。","command",{stageEffect:"lionel-slime"})
 ])
});

export const CAMPAIGN_STORY_SCENES=Object.freeze([
 scene(10,"西の大陸・港湾街","第一日。四人は海を渡る支度を整えた。","./assets/ui/home-town-bg.png",[
  line("myth_rion","船と食料は確保したよ。ついでに航海日誌の予約販売も始めた。帰る前に旅費は回収できる。","confident"),
  line("myth_hide","出発まで四十二分。積載量、潮位、戦力配分まで計算済みだ。","serious"),
  line("myth_yori","さすがやな。で、船の乗船許可は取ったん？","normal"),
  line("myth_hide","……その項目は計算表にない。","quiet"),
  line("myth_rion","今、港主へ利益の三割を提示して取った。最高やな。出航できる、いこうぜ！","confident"),
  line("myth_enami","この羅針盤、北やなくて魔力の濃い方を向いてる。分解したら仕組み分かるかな。","absorbed"),
  line("myth_yori","えなみ、今までの話聞いてた？","teasing"),
  line("myth_enami","聞いてない。でも船はある、許可も取れた。なら行けるやろ。まかセロリ。","normal"),
  line("myth_yori","じゃあ出航前に一杯だけ。全員そろった祝いな。","teasing"),
  line("myth_hide","一杯が三杯になる確率は九割を超えている。酒だけ置いて乗れ。","serious")
 ]),
 scene(20,"西岸・出航港","第二日。勇者一行の船が西岸を離れる。","./assets/ui/home-town-bg.png",[
  line("myth_hide","三時間後に潮向きが変わる。北へ切れば半日縮む。計算上は最短だ。","serious"),
  line(null,"北の浅瀬では、卵を守る海蛇が船の前へ立ちはだかった。","narration"),
  line("myth_yori","すぐ殴らんでええ。あいつが何を守ってるか、まず見よか。","gentle"),
  line("myth_enami","警戒してるだけやろ。卵の横を武器持って通られたら、僕でも止めるわ。","gentle"),
  line("myth_rion","追い払うより航路の守り手になってもらおう。安全な船から通行料を取り、餌代と僕らの遠征費に分ける。","confident"),
  line("myth_hide","案は合理的だ。問題は、誰が海蛇の言葉を話せるか。","serious"),
  line("myth_enami","さっきから鳴き方を聞いてた。たぶん分かる。……今なんか別の話してた？","absorbed"),
  line("myth_yori","してたけど、今回は聞いてなくて正解やな。","teasing"),
  line("myth_enami","倒して海を荒らして、その後は誰に安全な道を聞くん？ 渡りたいんか、勝った気になりたいんか、先に決めよ。","cold"),
  line(null,"武器は下ろされ、海蛇は船を黒潮の入口まで導いた。","narration")
 ]),
 scene(30,"黒潮海峡","第三日。黒い潮の先に、魔界の空が見え始めた。","./assets/ui/battle/ice-stratum.png",[
  line("myth_enami","右の渦だけ流れが逆や。入口が呼吸してるみたいに、九十秒ごとに開いてる。","absorbed"),
  line("myth_hide","同意する。術式で船体を固定し、次の静止点へ入る。九十秒、誰も動くな。","serious"),
  line("myth_rion","ひで、錨は？","normal"),
  line("myth_hide","固定術式はある。錨は港だ。","quiet"),
  line("myth_rion","一番物理的で大事な物を忘れたね。帰還後の講演では伏せよう。","teasing"),
  line("myth_yori","難しい話長いな。波ごと殴って開けたら早いやろ。","tipsy"),
  line(null,"よりの拳が黒波を割り、船体が大きく傾いた。返す拳は、なぜかひでの肩すれすれを通った。","narration"),
  line("myth_hide","フォー！！！！ いやいやいや笑、僕は波ではない。","startled"),
  line("myth_enami","今の一撃で周期が三秒ずれた。次の波、右へ九歩。……誰か呼んだ？","absorbed"),
  line("myth_rion","やったぜ！ 結果は成功。修理代は航海日誌の特装版で回収する。もう予約ページも作ったよ。","confident")
 ]),
 scene(40,"魔界・西岸","第四日。四人は魔界へ上陸し、迷宮の気配を初めて捉えた。","./assets/ui/battle/poison-stratum.png",[
  line(null,"沿岸の兵は村を盾にして道を塞いだ。命令に逆らえば、家族が処罰されるという。","narration"),
  line("myth_yori","急がんでええ。話、最後まで聞こか。笑って帰れる道が残ってるかもしれん。","gentle"),
  line("myth_rion","最高やな。村を壊さず補給地に変える。売上は村へ七、僕らへ三。剣を抜くより、全員得をする。","confident"),
  line("myth_hide","正面は囮だ。左の崖道なら十二分で抜けられる。","serious"),
  line("myth_rion","今は逃げ道じゃなく、この兵たちを助ける話だよ。","normal"),
  line("myth_enami","家族を守りたいんやな。命令に従うしかない、そこまでは分かる。","gentle"),
  line("myth_enami","なんやコイツ。『民を守れ』と『村を焼け』が同じ命令に入ってる。守られる民はどこにおるん？ 命令が正しいんやなくて、逆らうのが怖いだけ違う？","cold"),
  line("myth_hide","論理上、反論は不可能だ。なお崖道は満潮で消えた。潮位を入れ忘れていた。","quiet"),
  line("myth_yori","賢いのに、ほんと大事なとこだけ抜けるなあ。","teasing"),
  line(null,"兵は武器を置き、村は四人へ城までの古い道を教えた。","narration")
 ]),
 scene(50,"境界砦","第五日。魔王領との境を守る砦が、四人の前に立ちはだかる。","./assets/ui/trials/abyss-corridor-room.png",[
  line("myth_rion","壊す前に僕が話す。この砦は戦後に宿と市場へ変えられる。明日から稼げる形で残した方が得だ。","confident"),
  line("myth_hide","交渉は十五分。失敗したら三層目の術式から逆流させ、十二分四十秒で開門する。","serious"),
  line("myth_enami","門番にも守りたい生活があるんやろ。まず条件を聞こ。","gentle"),
  line(null,"砦の隊長は『民を守るため、民ごと門を封じる』と宣言した。","narration"),
  line("myth_enami","民を守るために民を閉じ込める。敵を入れんために味方も出さん。勝った後、その民に何を返すん？","cold"),
  line("myth_yori","話まとまったなら一杯だけもらうわ。和平の酒は断る方が失礼やろ。","teasing"),
  line(null,"一口飲んだよりは、まだ閉じたままの城門を見上げ、笑顔で拳を構えた。","narration"),
  line("myth_yori","開けんかいコラァ！ まだこっち睨んどるやろ！","tipsy"),
  line("myth_hide","いやいやいや笑。門に視覚器官はないです。","serious"),
  line("myth_yori","お前、あいつ庇うんか？","tipsy"),
  line("myth_hide","待ってくださいよ〜！ 僕は説明しただけです！","startled"),
  line("myth_enami","より、敵は門。ひでは説明が下手な味方。順番守ろ。","teasing"),
  line("myth_rion","修理費は新しい通行料で回収する。もう料金表は作ったよ。","confident")
 ]),
 scene(60,"七罪の荒野","第六日。深淵の気配が満ちる荒野を、四人は止まらず進む。","./assets/ui/battle/abyss-reality.png",[
  line(null,"七つの石像は、それぞれが四人の欲しいものを差し出した。最後の一体は、りおんへ荒野すべての商権を示した。","narration"),
  line("myth_rion","条件は魅力的だね。契約書、今ここで全部読む。儲かる話ほど出口を先に見るんだ。","confident"),
  line("myth_hide","地中に七つ反応。六つは囮で、一つだけが本体だ。配置も術式も解析した。","serious"),
  line("myth_yori","じゃあ安心やな。薬代わりに、これ一口だけ。","teasing"),
  line("myth_enami","この文字、契約やなくて命令文や。所有者が逆になってる。おもしろいな……もう少し見せて。","absorbed"),
  line("myth_rion","えなみ、罠の話をしてる。聞こえてる？","normal"),
  line("myth_enami","聞いてない。けど、ひでの右足どけて。そこ八個目の起動板。","absorbed"),
  line("myth_hide","いいゾ〜！コレ〜！ 八個目は物理式か。……いや、最重要の前提を見落とした。","excited"),
  line(null,"酔ったよりの拳が起動板を砕き、返す肘がひでの杖まで弾き飛ばした。","narration"),
  line("myth_yori","罠と、罠を見落としたやつ。両方止めたで。","tipsy"),
  line("myth_rion","商権は断る。でも安全になった道の管理権は取る。看板はもう立てたよ。","confident"),
  line("myth_enami","その話あとで聞く。今は塩ください。","absorbed")
 ]),
 scene(70,"魔王領・外縁","第七日。魔王領の黒い尖塔が、地平線に姿を現す。","./assets/ui/battle/abyss-battle-arena.png",[
  line(null,"崩れた橋の向こうで、負傷した魔族の斥候が四人へ武器を向けた。","narration"),
  line("myth_yori","構えたままでええよ。言いたいこと、先に全部聞くから。","gentle"),
  line("myth_enami","仲間を逃がす時間が欲しいんやな。それなら僕らも待てる。","gentle"),
  line("myth_enami","でも指揮官は逃げて、負傷者だけ残した。忠誠を求めた側が先に捨てたなら、君が守ってるのは誰の誇りなん？","cold"),
  line("myth_hide","橋の残存強度なら三分で全員渡れる。手順も組んだ。","serious"),
  line("myth_rion","命綱は？","normal"),
  line("myth_hide","……ロープを港へ置いた。","quiet"),
  line("myth_yori","また一番いるやつ忘れたな。まあ、話は合ってるけど。","teasing"),
  line("myth_rion","予約販売した地図の見本布、全部ロープにする。ひで海に落としたら再発行できんし、その方が安い。","normal"),
  line("myth_enami","まかセロリ。結局コスト計算なんかい。急に感動しかけた僕の時間返して。","teasing"),
  line("myth_rion","損じゃないよ。四人そろってた方が続編を四冊売れる。最高やな。","confident")
 ]),
 scene(80,"魔都街道","第八日。十神の光が街道を覆い、魔王城への道を隠す。","./assets/ui/battle/ten-gods-domain.png",[
  line(null,"十神の声は『資格なき者を通さぬ試練』と告げ、出口のない光壁を築いた。","narration"),
  line("myth_enami","止める側にも役目はあるよな。世界を守りたい、それは分かる。","gentle"),
  line("myth_enami","でも通す条件を示さんのに『試練』はおかしい。誰も合格させる気がないなら、それは試験やなくて拒絶や。名前から直そか。","cold"),
  line("myth_hide","神域の干渉点へ誘導する。こちらは四人の声が届く距離を保つ。そこで力を重ねよう。","serious"),
  line("myth_rion","その作戦、本人たちに聞こえてるよ。","normal"),
  line("myth_hide","……神が聴覚を持つ前提を失念した。","quiet"),
  line("myth_rion","生還者向けの神域保険を思いついた。今、契約書を作ってる。","confident"),
  line("myth_hide","加入者が四人ではリスク分散が成立しない。","serious"),
  line("myth_rion","だから高く売る。もう三人分は僕が署名したよ。","confident"),
  line("myth_hide","いいんすか！！ 僕の分まで勝手に加入してるじゃないですか。","startled"),
  line("myth_yori","ユーアービューティフォー！！ 供え物の酒、ええ匂いやな。話が長いし、そろそろ神様から殴ってええか？","tipsy"),
  line("myth_enami","敵は光壁。ひでは光って見えるけど味方。そこだけ間違えんといて。","teasing")
 ]),
 scene(90,"魔王城・外郭","第九日。城壁は目前。四人の足音が、ついに魔王城へ届く。","./assets/ui/battle/boss-throne.png",[
  line("myth_hide","百階からの反応が変わった。主力は完成している。勝率六十二・四パーセント。","serious"),
  line("myth_rion","何を計算に入れた？","normal"),
  line("myth_hide","能力、属性、行動周期、こちらの疲労。魔王軍の控え戦力は……まだだ。","quiet"),
  line("myth_yori","一番多そうなとこ抜けたな。今日は酒を置いてきた。怖さをごまかしたら、相手の目を見落とす。","serious"),
  line("myth_rion","僕も怖いよ。だから帰り道にも、明日の稼ぎ方にも手を抜かない。未来がなければ金勘定もできないからね。","serious"),
  line("myth_hide","恐怖による判断低下は――いや、今日は数値にするのをやめる。僕も怖い。","quiet"),
  line("myth_yori","えなみは？","normal"),
  line("myth_enami","……城壁の術式見てた。もう一回言って。","absorbed"),
  line("myth_yori","聞いてないのかい。怖いかって。","teasing"),
  line("myth_enami","怖いよ。だから考えるのを止めん。理不尽な答えしか残ってないなら、残したやつに理由を全部聞く。最後はメンタル！！","cold"),
  line("myth_hide","待ってくださいよ〜！ 魔王軍の控え戦力を今から計算に入れます。","startled"),
  line(null,"四人は一度だけ笑い、同じ速さで城門へ歩き出した。","narration")
 ]),
 scene(100,"魔王城・正門","第十日。予言どおり、四人の勇者が魔王城へ到達した。","./assets/ui/battle/boss-throne.png",[
  line("myth_rion","扉の前までは話す。降伏するなら街の再建、仕事、流通まで僕が案を出す。勝って市場ごと焼くのは大赤字だ。","serious"),
  line("myth_yori","最後まで金の話やな。","teasing"),
  line("myth_rion","金勘定できる明日がある方がいい。誰かを代金にする儲け方は、僕も嫌いだよ。","serious"),
  line("myth_enami","向こうにも守りたいもんがある顔してる。それは分かる。話せるなら、まず全部聞く。","gentle"),
  line(null,"城門の守護者は、民を守るために民を盾とし、王命には理由が要らないと答えた。","narration"),
  line("myth_enami","民を守ると言いながら盾にする。理由はいらんと言いながら、僕らには従う理由を求める。守ってるのは国なんか、自分の立場なんか、答え決めてから剣抜いて。","cold"),
  line("myth_yori","話は最後まで聞いた。俺はシラフや。ここから先は、敵に一発も軽く打たん。","serious"),
  line("myth_hide","能力、属性、行動周期、退路まで更新済み。作戦は完全だ。","serious"),
  line("myth_rion","開始の合図は？","normal"),
  line("myth_hide","……最重要項目だけ抜けた。今だ。","quiet"),
  line("myth_rion","いこうぜ！ 全員で帰って、今日は豪遊するぞ！","confident"),
  line("myth_enami","まかセロリ。聞いてなかったけど、始まるのは分かった。","teasing"),
  line(null,"四人は互いの欠けた部分を埋めるように散開し、魔王軍との最終決戦へ踏み込んだ。","narration")
 ])
]);

// Optional camp beats extend the journey without changing battle progression.
const JOURNEY_CONVERSATIONS={
 "1": [
  [
   "myth_rion",
   "航海日誌の予約、もう入ったよ。題名は『四人の英雄、魔王城へ』。"
  ],
  [
   "myth_enami",
   "僕まだ船乗ってないのに英雄なん？"
  ],
  [
   "myth_hide",
   "現時点での実績は、港に集合したことだけだね。"
  ],
  [
   "myth_yori",
   "しかも一人遅刻したしな。"
  ],
  [
   "myth_rion",
   "オレは船の交渉。遅刻を仕事に変えたから問題ない。"
  ],
  [
   "myth_enami",
   "僕も羅針盤見てたから、研究ってことにしよ。"
  ],
  [
   "myth_hide",
   "その理屈だと集合時刻を守った僕が一番暇みたいになる。"
  ],
  [
   "myth_yori",
   "ひで、船の前で三十分ずっと時計見てたもんな。"
  ],
  [
   "myth_hide",
   "全員が僕を待っている可能性も考えた。"
  ],
  [
   "myth_rion",
   "待ってない。そこは安心して。"
  ],
  [
   "myth_hide",
   "それはそれで腹立つな。"
  ],
  [
   "myth_enami",
   "帰りの本も予約しといて。題名はまだ普通でいいから。"
  ]
 ],
 "2": [
  [
   "myth_hide",
   "海蛇が船と並走してる。案内は終わったはずだけど。"
  ],
  [
   "myth_yori",
   "えなみ、また何か食わせた？"
  ],
  [
   "myth_enami",
   "パン。卵守ってたし、お腹減ってるかなって。"
  ],
  [
   "myth_rion",
   "通行料を取る予定が、オレらから昼飯を納めてるな。"
  ],
  [
   "myth_yori",
   "見てくるわ。……ひで、袖つかむの早いな。"
  ],
  [
   "myth_hide",
   "昔テトラポッドに落ちて死にかけた人が、また端に行こうとしてるからね。"
  ],
  [
   "myth_yori",
   "あのとき助けてくれたのは、ほんとありがたかったよ。今日はここから見る。"
  ],
  [
   "myth_enami",
   "うん。その位置で見よう。パンは僕が投げるから。"
  ],
  [
   "myth_rion",
   "待って。それ、オレの昼飯。"
  ],
  [
   "myth_enami",
   "もう投げた。"
  ],
  [
   "myth_hide",
   "海蛇、感謝の鳴き声。判別できた。"
  ],
  [
   "myth_rion",
   "オレの鳴き声も判別して。まだ食べてないんよ。"
  ]
 ],
 "3": [
  [
   "myth_hide",
   "より、さっきの拳、僕の肩の横を通ったよね。"
  ],
  [
   "myth_yori",
   "ごめん。波と一緒に動いてたから。"
  ],
  [
   "myth_enami",
   "船に乗ってる全員、波と一緒に動いてるやろ。"
  ],
  [
   "myth_rion",
   "海峡ごと敵判定するのやめよう。オレも含まれる。"
  ],
  [
   "myth_yori",
   "じゃあ次は、殴る前に右って言う。"
  ],
  [
   "myth_hide",
   "右を殴るのか、右へ避けるのか、どっち？"
  ],
  [
   "myth_yori",
   "その場の感じで。"
  ],
  [
   "myth_hide",
   "一番困る答えが来た。"
  ],
  [
   "myth_enami",
   "次の波来るよ。左へ二歩。"
  ],
  [
   "myth_rion",
   "二歩で足りる？"
  ],
  [
   "myth_enami",
   "ひでは一歩。よりは動かんで。"
  ],
  [
   "myth_yori",
   "急に分かりやすい。僕の合図、廃止でいいわ。"
  ]
 ],
 "4": [
  [
   "myth_rion",
   "村から毛布もらった。四枚。代金いらないってさ。"
  ],
  [
   "myth_enami",
   "ありがとうって言った？"
  ],
  [
   "myth_rion",
   "先に領収書を頼んだ。"
  ],
  [
   "myth_yori",
   "無料に慣れてない反応やな。"
  ],
  [
   "myth_hide",
   "厚さが違う。一番厚いのを誰に渡すか、今夜の気温で計算して……。"
  ],
  [
   "myth_enami",
   "ひでにしよ。昨日寝言でずっと錨って言ってたし。"
  ],
  [
   "myth_hide",
   "そんなに？"
  ],
  [
   "myth_yori",
   "途中から僕も夢の中で錨探してたわ。"
  ],
  [
   "myth_rion",
   "オレは錨売ってた。"
  ],
  [
   "myth_hide",
   "全員の睡眠にまで忘れ物が波及してる。"
  ],
  [
   "myth_enami",
   "今日はもう道具置いて寝よう。僕もそうする。"
  ],
  [
   "myth_yori",
   "じゃあその枕の下のドライバー出して。"
  ]
 ],
 "5": [
  [
   "myth_rion",
   "砦を宿にしたら食堂もいるな。料理できる人、知ってる？"
  ],
  [
   "myth_enami",
   "僕、食品衛生管理者は持ってる。"
  ],
  [
   "myth_hide",
   "じゃあ管理の相談はできる？"
  ],
  [
   "myth_enami",
   "いや、知識ゼロ。"
  ],
  [
   "myth_yori",
   "資格だけ先に砦越えてきたんか。"
  ],
  [
   "myth_rion",
   "今、担当表に書いた名前を消した。オレ、仕事早いやろ。"
  ],
  [
   "myth_enami",
   "僕の名前消す速度だけ誇られてもな。食堂の人に聞いてくる。"
  ],
  [
   "myth_hide",
   "その前に、よりの手。門を殴った後、ずっと隠してる。"
  ],
  [
   "myth_yori",
   "門が固かった。"
  ],
  [
   "myth_rion",
   "門はだいたい固い。包帯出すから見せて。"
  ],
  [
   "myth_yori",
   "無料？"
  ],
  [
   "myth_rion",
   "無料。さっき村で習ったから、今なら言える。"
  ]
 ],
 "6": [
  [
   "myth_rion",
   "石像の契約、最後まで読んでよかった。商権もらう代わりにオレらが永遠に働くことになってた。"
  ],
  [
   "myth_hide",
   "休業日なし。従業員の追加も不可。悪い条件だね。"
  ],
  [
   "myth_enami",
   "僕には何も考えんでいい世界って言ってきた。つまらなそうやから断った。"
  ],
  [
   "myth_yori",
   "今の世界でも人の話はあんまり聞いてないけどな。"
  ],
  [
   "myth_enami",
   "聞くかどうかは僕が決めたいんよ。"
  ],
  [
   "myth_rion",
   "かなり身勝手やけど、契約よりはいい返事やな。よりは何を提示された？"
  ],
  [
   "myth_yori",
   "酒。"
  ],
  [
   "myth_hide",
   "一人だけ契約書が短そう。"
  ],
  [
   "myth_yori",
   "一人で飲めって条件やったから、いらんって言った。"
  ],
  [
   "myth_enami",
   "それは、ちょっといい話やな。"
  ],
  [
   "myth_yori",
   "あと、つまみがなかった。"
  ],
  [
   "myth_rion",
   "今の一言、航海日誌では次のページに回すわ。"
  ]
 ],
 "7": [
  [
   "myth_rion",
   "見本布、全部命綱にしたから商品がなくなった。"
  ],
  [
   "myth_hide",
   "四人と斥候が渡れた。使い道としては十分だと思う。"
  ],
  [
   "myth_yori",
   "戻ってきたらロープとして売ればいいやろ。"
  ],
  [
   "myth_rion",
   "最高やな。『英雄が渡った命綱』。今、値段上がった。"
  ],
  [
   "myth_enami",
   "また橋渡るとき売り切れてたら困るけど。"
  ],
  [
   "myth_hide",
   "なら在庫の最低本数を決めよう。"
  ],
  [
   "myth_rion",
   "分かった。一本は売らん。ひでは港に置いてこないでね。"
  ],
  [
   "myth_hide",
   "その件は、もう記録から消してほしい。"
  ],
  [
   "myth_yori",
   "ひでが忘れた物、僕らはよく覚えてるな。"
  ],
  [
   "myth_enami",
   "あの斥候、まだこっち見てる。怖がらせたかな。"
  ],
  [
   "myth_rion",
   "命綱に値段付けたとこ、聞かれたかもしれん。"
  ],
  [
   "myth_yori",
   "助けるの無料って先に言ってこい。"
  ]
 ],
 "8": [
  [
   "myth_hide",
   "光壁を抜けた。りおん、その紙は？"
  ],
  [
   "myth_rion",
   "神域保険。オレが試しに作った。"
  ],
  [
   "myth_enami",
   "ちょっと見せて。……神による損害は対象外？"
  ],
  [
   "myth_yori",
   "何が残るん。神域やぞ。"
  ],
  [
   "myth_rion",
   "例えば自分で転んだとき。"
  ],
  [
   "myth_hide",
   "神の光で足元が見えなくて転んだら？"
  ],
  [
   "myth_rion",
   "審査する。"
  ],
  [
   "myth_enami",
   "誰が？"
  ],
  [
   "myth_rion",
   "オレ。"
  ],
  [
   "myth_yori",
   "却下する顔がもう見えるわ。"
  ],
  [
   "myth_rion",
   "じゃあ廃止。皆で金出して飯にしよう。"
  ],
  [
   "myth_hide",
   "最初からそれなら、約款を三枚読まずに済んだ。"
  ]
 ],
 "9": [
  [
   "myth_rion",
   "明日終わったら何する？ 帳簿は閉じたから、金の話以外でもいいよ。"
  ],
  [
   "myth_yori",
   "飯。酒。寝る。"
  ],
  [
   "myth_hide",
   "予定が簡潔で助かる。何時から？"
  ],
  [
   "myth_enami",
   "そこは計算せんでいいやろ。僕はもうちょっとどこか行きたい。"
  ],
  [
   "myth_rion",
   "城見たあとに？ まだ歩く気あるん？"
  ],
  [
   "myth_enami",
   "海蛇の卵。そろそろかえってるかもしれんし。"
  ],
  [
   "myth_yori",
   "いいな。それは見たい。今度こそ昼飯多めに持っていこう。"
  ],
  [
   "myth_hide",
   "帰りの経路を変える。少し遠回りになるけど。"
  ],
  [
   "myth_rion",
   "別にいいよ。オレの予定、空けとく。"
  ],
  [
   "myth_enami",
   "皆、明日の話より帰りの話の方がよくしゃべるな。"
  ],
  [
   "myth_yori",
   "明日は顔見たらだいたい分かるやろ。帰りの飯は言わんと決まらん。"
  ],
  [
   "myth_hide",
   "それはそう。……だから今夜は、もう寝よう。"
  ]
 ],
 "10": [
  [
   "myth_hide",
   "最後に合図の確認を。前みたいに僕だけ開始を知らない状態は避けたい。"
  ],
  [
   "myth_rion",
   "オレが動く。そのあとえなみ。ひでが重ねて、よりが入る。"
  ],
  [
   "myth_yori",
   "入るとこ空いてなかったら？"
  ],
  [
   "myth_enami",
   "僕が空ける。開いてなかったら僕を呼んで。"
  ],
  [
   "myth_hide",
   "よりが呼ぶ前に、僕の術式もそこへ届くようにしておく。"
  ],
  [
   "myth_rion",
   "じゃあ全員の仕事、つながったな。"
  ],
  [
   "myth_yori",
   "今の説明、えなみ聞いてた？"
  ],
  [
   "myth_enami",
   "聞いてたよ。向こうの足元も見てた。左に寄ったら、もう逃げる幅ない。"
  ],
  [
   "myth_hide",
   "……本当に聞いてた。"
  ],
  [
   "myth_rion",
   "そこに驚く時間は後で。オレが先に左を押さえる。"
  ],
  [
   "myth_yori",
   "イージー！！ じゃあ、門は今日は殴らんでいいな。"
  ],
  [
   "myth_enami",
   "うん。開いた道の先だけ見て。"
  ]
 ]
};
const SMALL_PARTY_ROUTES={
 1:"港で乗船の支度を整える。積み荷より先に、帰還のための余力を確かめた。",
 2:"卵を守る海蛇を前に武器を下ろし、遠回りでも争わずに通れる航路を選んだ。",
 3:"黒潮の周期を数え、船を進める。無理に波を割らず、静まる瞬間を待った。",
 4:"家族を人質に取られた沿岸の兵から事情を聞き、村へ通じる退路を開いた。",
 5:"境界砦では閉じ込められた民の出口を先に確保し、門の封鎖を一つずつ解いた。",
 6:"七罪の荒野で、望みを差し出す石像に出会う。仲間の不在を埋めるという誘いにも、足を止めなかった。",
 7:"崩れた橋に取り残された斥候を助け、魔王領への道をつないだ。",
 8:"十神の光壁を避けて干渉点を探る。正面から力を比べず、通れる道へ戦力を集中した。",
 9:"魔王城の外郭で荷を置き、残った戦力と傷を確かめる。最後の休息を急がず取った。",
 10:"王室へ続く道が開いた。戻らない仲間の役割を確かめ、今ここにいる者で最後の布陣を組んだ。"
};
const SMALL_PARTY_MEMORIES350={
 "myth_enami": [
  "……話は聞いてるよ。塩の残りも見てる。両方、帰りまで必要やろ。",
  "分からん所で止まったら、その間に別のことが見つかった。遠回りもたまには役立つな。",
  "最後の質問は、相手の顔を見て決める。ここで一人で答えまで作っても仕方ないし。"
 ],
 "myth_yori": [
  "イージー、とはまだ言わん。見てない角がある。あそこ確かめてからでいい。",
  "余計な物まで殴ったら帰りにまた困るしな。通る分だけ空けよう。",
  "酒は後。今は相手の動き、一個も見落としたくない。"
 ],
 "myth_hide": [
  "地図、食料、水。……紙に書いたら、書き忘れた項目まで見つかると思ってた。そうでもないな。",
  "今度の計算には、途中で止まる時間も入れた。式の外で休むと、また予定がずれるから。",
  "最後の式に余白を残した。現場で分かることまで、先に埋める必要はない。"
 ],
 "myth_rion": [
  "荷物は減らせる。帰る予定まで小さくする必要はないやろ。",
  "この遠回り、帰りに商売へ使えるかもしれん。……今は地図に印だけにしとく。",
  "帰ったら帳簿を閉じる。今日は豪遊するぞ、って言うための欄だけ空けてある。"
 ]
};
function smallPartyDialogue(definition,ids,heroState){
 const fallen=HERO_PARTY_IDS.filter(id=>heroState.heroes[id].defeated),away=heroState.awayHeroIds.filter(id=>!fallen.includes(id)),name=id=>CAMPAIGN_STORY_CHARACTERS[id].name;
 if(!ids.length)return[line(null,fallen.length===4?"勇者一行の足音は、ここまで届かなかった。道中で四人全員が退けられ、予言にあった旅路だけが静かに残った。":"この場には誰もいない。単独行動中の仲間を待つ場所だけが残されていた。","narration")];
 const dialogue=[line(null,`${definition.location}。${SMALL_PARTY_ROUTES[definition.day]}`,"narration")];
 if(fallen.length)dialogue.push(line(null,`${fallen.map(name).join("と")}は道中で退けられ、ここには戻っていない。`,"narration"));
 if(away.length)dialogue.push(line(null,`${away.map(name).join("と")}は別行動中だ。合流の約束を残し、この場では${ids.length}人で判断する。`,"narration"));
 const words={
  myth_enami:["進む理由は変わらん。でも、今ここにおる仲間を削ってまで急ぐ理由もない。","相手にも守る事情があるなら聞く。そこを飛ばして勝った気には、なりたくないんよ。","……話は聞いてるで。塩の残りを数えてただけ。帰り道の分は残しとく。"],
  myth_yori:["話、最後まで聞こか。急いで殴っても、帰り道は増えんしな。","僕が前に出る。でも、後ろがついて来られる速さにする。そこは約束や。","イージー、とは言わん。でも、まだ僕の拳は届く。笑って帰る分も残ってる。"],
  myth_hide:["人数と残る傷を計算に入れ直す。以前と同じ作戦を、そのまま使うのは危険だ。","必要な確認は、足場、退路、食料。……今度は最後の項目も書きました。","計算は、誰かを切り捨てるためではない。戻れる可能性を一つでも増やすために使う。"],
  myth_rion:["替えの利かないものから守ろう。荷物も帳簿も作り直せるけど、人はそうはいかない。","今日の利益は、明日も動けること。そういう日があっても帳尻は合わせるよ。","帰ったら、この遠回りも記録に残す。都合のいい武勇伝にはしない。約束だからね。"]
 };
 for(let turn=0;turn<3;turn++)for(const id of ids)dialogue.push(line(id,words[id][turn],turn===2?"gentle":"serious"));
 for(const id of ids)dialogue.push(line(id,SMALL_PARTY_MEMORIES350[id][definition.day<=3?0:definition.day<=7?1:2],"quiet"));
 dialogue.push(line(null,ids.length===1?"一人の足音が続く。独りになっても、交わした約束までは消えなかった。":`${ids.length}人は顔を見合わせ、互いの手が届く距離で歩き出した。`,"narration"));return dialogue;
}


// The demon track shares the campaign queue and archive, but keeps its own cast.
const royalScene351=(id,floor,title,summary,dialogue,kind="demon-milestone")=>Object.freeze({
 id,kind,storyTrack:"demon",storyPart:kind==="ending"?"epilogue":"council",floor,day:Math.max(1,floor/10),routeProgress:floor,
 title,summary,location:"魔王城・玉座の間",modalTitle:"魔王軍の物語",eyebrow:kind==="ending"?"DEMON LORD / AFTER THE BATTLE":"DEMON LORD / COUNCIL",
 routeHidden:true,backgroundAsset:"./assets/ui/battle/boss-throne.png",dialogue:Object.freeze(dialogue.map(([speakerId,text])=>line(speakerId,text,speakerId?"normal":"narration",{stageEffect:"lionel-slime"})))
});
export const CAMPAIGN_DEMON_STORY_SCENES=Object.freeze([
royalScene351("demon-020",20,"最弱の指揮官","軍を集める命令と、現場の現実が初めてぶつかる。",[
 [
  null,
  "玉座の前に置かれた水鏡が、低い位置から迷宮の床を映した。"
 ],
 [
  "sairan",
  "床の報告は求めていない。軍の様子を映せ。"
 ],
 [
  "lionel",
  "私の目線です。これ以上は高くなりません。"
 ],
 [
  "sairan",
  "台に乗れ。"
 ],
 [
  "lionel",
  "登る手がございません。"
 ],
 [
  "sairan",
  "……最弱の器とは、そこまで不便なのか。"
 ],
 [
  "lionel",
  "それでも、この姿なら魔物は話を聞きます。少なくとも、私の名を聞いて伏せることはありません。"
 ],
 [
  "sairan",
  "余の名を使ってもか。"
 ],
 [
  "lionel",
  "使ってみました。反応はありませんでした。"
 ],
 [
  "sairan",
  "二度使え。"
 ],
 [
  "lionel",
  "回数の問題ではございません。ここでは私たちが、名も知られぬよそ者なのです。"
 ],
 [
  null,
  "水鏡のこちらには旧世界の王旗が垂れている。向こうの床には、その旗を掲げる場所さえない。"
 ],
 [
  "sairan",
  "ならば名は後でよい。魔物が何を欲しがるか見てこい。"
 ],
 [
  "lionel",
  "集める数より先に、ですか。"
 ],
 [
  "sairan",
  "命令を聞かぬ相手に、聞く理由を与えろ。それくらいは余もやった。"
 ],
 [
  "lionel",
  "その話、出発前に伺いたかったです。"
 ],
 [
  "sairan",
  "帰ってきてからも聞くことがある方が、急いで戻るだろう。"
 ]
]),
royalScene351("demon-040",40,"空席の軍議","新しい軍の名簿を前に、旧世界のやり方が問い直される。",[
 [
  null,
  "軍議の卓には、使われなくなった椅子が並んでいた。リオネルの報告書だけが、その一脚に置かれている。"
 ],
 [
  "sairan",
  "種族、能力、配置。字がずいぶん歪んだな。"
 ],
 [
  "lionel",
  "筆を持てませんので。"
 ],
 [
  "sairan",
  "そこも不便か。"
 ],
 [
  "lionel",
  "最近は紙の方に近づいていただいています。"
 ],
 [
  "sairan",
  "欄外の印は何だ。"
 ],
 [
  "lionel",
  "私の指示が届かなかった箇所です。戦力だけ並べても、思ったとおりには動きません。"
 ],
 [
  "sairan",
  "旧軍の配置を使えばよい。"
 ],
 [
  "lionel",
  "あの軍とは、歩幅も、見える高さも違います。同じ場所へ置いても、同じ戦いにはなりません。"
 ],
 [
  null,
  "サイラーンの指が、空いた椅子の背を向いた。命令は、口に出る直前で止まった。"
 ],
 [
  "sairan",
  "……古い名簿を重ねるな、ということか。"
 ],
 [
  "lionel",
  "はい。この世界で集める軍には、この世界の布陣が必要です。"
 ],
 [
  "sairan",
  "ならばその歪んだ字で書き続けろ。余が読めるところまで直せばよい。"
 ],
 [
  "lionel",
  "ご自分で直すおつもりは？"
 ],
 [
  "sairan",
  "筆を取ろうとして城を傾けてもよいなら。"
 ],
 [
  "lionel",
  "私が直します。余白を広く取ります。"
 ]
]),
royalScene351("demon-060",60,"預言者の空白","見えていた未来と、見えていなかった道のりについて語る。",[
 [
  "sairan",
  "百階までの道を見てきて、予言は変わったか。"
 ],
 [
  "lionel",
  "私は今、未来より足元を見ています。力と記憶を封じた代償です。"
 ],
 [
  "sairan",
  "封じる前なら、道の全てが見えていたか。"
 ],
 [
  "lionel",
  "……いいえ。見えたのは、十日目に城へ迫る四つの影。途中の選択までは。"
 ],
 [
  "sairan",
  "ならば空白は、封印のせいだけではない。"
 ],
 [
  "lionel",
  "その通りです。旧世界でも、見えた景色を理解したつもりで、見えていないものを数えませんでした。"
 ],
 [
  "sairan",
  "またあの滅びを、自分一人の報告書へ書く気か。"
 ],
 [
  "lionel",
  "預言者でありながら、防げなかったことは残ります。"
 ],
 [
  null,
  "玉座の背後には窓がない。窓のあったはずの壁を、二人はしばらく見ていた。"
 ],
 [
  "sairan",
  "命令を出したのは余だ。お前の紙一枚へ、余の名まで小さくするな。"
 ],
 [
  "lionel",
  "責任を分ける言い方としては、ずいぶん威圧的ですね。"
 ],
 [
  "sairan",
  "慣れろ。十日後も聞く。"
 ],
 [
  "lionel",
  "未来を言い当てる報告でなくても？"
 ],
 [
  "sairan",
  "今日、何を見落としたかを話せ。明日はそこから始める。"
 ],
 [
  "lionel",
  "では一件。階段を上がる所要時間が、旧来の計算の八倍でした。"
 ],
 [
  "sairan",
  "台車を用意する算段をしろ。預言者より先に紙が届く。"
 ]
]),
royalScene351("demon-080",80,"敵の席数","勇者の残存戦力を数え直し、最後の布陣を考える。",[
 [
  null,
  "卓の上に四枚の札が並ぶ。王の名でも、旧世界の将の名でもない。これまで追ってきた勇者たちの名だ。"
 ],
 [
  "sairan",
  "敵を神話と分類したのは誰だ。"
 ],
 [
  "lionel",
  "この世界の分類です。"
 ],
 [
  "sairan",
  "札の色だけ見て兵を並べたら、敗因まで同じ色に染まるな。"
 ],
 [
  "lionel",
  "一人ずつの能力表では、仲間の動きに重なる手数を数えきれません。"
 ],
 [
  "sairan",
  "強い一人を四度倒すつもりでいたら？"
 ],
 [
  "lionel",
  "最初の一人を見る間に、残りが動きます。こちらが順番を守っても、待ってはくれません。"
 ],
 [
  "sairan",
  "礼儀のない客だ。"
 ],
 [
  "lionel",
  "事前の面会申請もございません。"
 ],
 [
  "sairan",
  "そこは余もしたことがない。続けろ。"
 ],
 [
  "lionel",
  "道中の結果を含め、今の人数から数え直します。予言の四人を、そのまま現状だとは扱いません。"
 ],
 [
  "sairan",
  "よい。残った者が何を補うかまで考えろ。減った数だけ喜ぶ軍議は、もう終わりだ。"
 ],
 [
  "lionel",
  "こちらの四つの配置も、単独の点ではなく、届く距離で見ます。"
 ],
 [
  "sairan",
  "その線を引け。余の名を真ん中へ書いて済ませるな。"
 ]
]),
royalScene351("demon-100",100,"王命の続き","最終決戦を前に、玉座へ残る者と前線へ立つ者が最後の軍議を交わす。",[
 [
  null,
  "最後の軍議に、新しい命令書はなかった。十日間で書き足された地図が一枚、玉座の前へ広げられた。"
 ],
 [
  "sairan",
  "余が立てば済む、と言いたい顔だな。"
 ],
 [
  "lionel",
  "逆です。ここまで来て城を傾けられる方が困ります。"
 ],
 [
  "sairan",
  "遠慮がなくなった。"
 ],
 [
  "lionel",
  "低い目線で十日も働けば、陛下の見えない床のひびにも詳しくなります。"
 ],
 [
  "sairan",
  "軍は余を守れるか。"
 ],
 [
  "lionel",
  "そのために選び、育て、ここへ連れてきました。ただし、陛下の名前を代わりに戦わせることはできません。"
 ],
 [
  null,
  "リオネルは地図の四つの配置へ目を向けた。どこにも、旧世界の将の名は書かれていない。"
 ],
 [
  "sairan",
  "では命令を一つ足す。余に勝利を報告するまでが任務だ。"
 ],
 [
  "lionel",
  "最初にも承りました。"
 ],
 [
  "sairan",
  "最後まで聞け。勝てなかったなら、敗因を報告しろ。勝利以外を聞かぬ王の前では、帰る道まで狭くなる。"
 ],
 [
  "lionel",
  "……承知しました。今の一行は、消さずに持っていきます。"
 ],
 [
  "sairan",
  "それと、凱旋の演説は用意してある。"
 ],
 [
  "lionel",
  "何分ですか。"
 ],
 [
  "sairan",
  "二時間。"
 ],
 [
  "lionel",
  "先に敵を倒す理由が、一つ増えました。短縮の交渉はその後に。"
 ],
 [
  null,
  "水鏡が静まった。玉座から立つ者はいない。扉の向こうを託された軍だけが、最後の配置へ進んでいく。"
 ]
])
]);
export const CAMPAIGN_ENDING_STORY_SCENES=Object.freeze([
royalScene351("ending-complete",100,"新しい名簿","決着後、玉座へ最後の報告が届く。",[
 [
  null,
  "戦いの音が止み、魔王軍の四体は全て立っていた。玉座へ届いた報告書には、勝利の二文字より先に、部隊の名が並んだ。"
 ],
 [
  "lionel",
  "完全勝利です。最終戦に出た四体、全員が戦線を保ちました。"
 ],
 [
  "sairan",
  "順に読め。"
 ],
 [
  "lionel",
  "戦闘の記録からでしょうか。"
 ],
 [
  "sairan",
  "名からだ。能力表は後でよい。"
 ],
 [
  null,
  "旧世界の軍議では呼ばれなかった名を、リオネルは一つずつ読み上げた。サイラーンは、一度も先を急がせなかった。"
 ],
 [
  "lionel",
  "予言にあった十日目を越えました。この先の命令を。"
 ],
 [
  "sairan",
  "まず食わせろ。演説はその後だ。"
 ],
 [
  "lionel",
  "二時間の？"
 ],
 [
  "sairan",
  "……半刻にする。"
 ],
 [
  "lionel",
  "大幅な譲歩として記録します。"
 ],
 [
  "sairan",
  "城に余白が残ったな。"
 ],
 [
  "lionel",
  "何を置きますか。"
 ],
 [
  "sairan",
  "古い名簿では埋めるな。明日、ここへ来る者の分だ。"
 ]
],"ending"),
royalScene351("ending-narrow",100,"最後の一行","決着後、玉座へ最後の報告が届く。",[
 [
  null,
  "魔王軍が勝利した。だが、終わりの瞬間に立っていた者は、四体全てではなかった。"
 ],
 [
  "lionel",
  "辛勝です。最後に残った仲間が、戦線をつなぎました。"
 ],
 [
  "sairan",
  "倒れた者の記録は。"
 ],
 [
  "lionel",
  "残しています。どこで止まり、誰の動きへ引き継がれたかも。"
 ],
 [
  "sairan",
  "ならば勝者の名だけを大きく書くな。最後の一撃まで道を作った分も読め。"
 ],
 [
  null,
  "リオネルは、勝利と書いた行の下へ続きを足した。報告書は予定より長くなり、凱旋の支度は予定より静かになった。"
 ],
 [
  "lionel",
  "祝勝の席は、先に整えますか。"
 ],
 [
  "sairan",
  "休ませる場所が先だ。立っていた者も含めてな。"
 ],
 [
  "lionel",
  "演説を始めずに待てますか。"
 ],
 [
  "sairan",
  "椅子から動けぬ王へ、今それを聞くか。"
 ],
 [
  "lionel",
  "声だけは、ずっとお元気でしたので。"
 ],
 [
  "sairan",
  "……今夜は短くする。よく持ちこたえた。"
 ],
 [
  "lionel",
  "その一言から、先に伝えます。"
 ]
],"ending"),
royalScene351("ending-defeat",100,"敗北の報告","決着後、玉座へ最後の報告が届く。",[
 [
  null,
  "魔王軍の布陣は破られた。勝利を告げる音は鳴らず、リオネルの報告だけが玉座へ届いた。"
 ],
 [
  "lionel",
  "勇者側の勝利です。現在の部隊では、最後まで戦線を保てませんでした。"
 ],
 [
  "sairan",
  "どこで崩れた。"
 ],
 [
  "lionel",
  "動きを追い切れなくなった所から、順に整理しています。まだ、きれいな答えにはできません。"
 ],
 [
  "sairan",
  "きれいにするな。そのまま持ってこい。"
 ],
 [
  "lionel",
  "陛下の命令を、果たせませんでした。"
 ],
 [
  "sairan",
  "敗因を報告せよとも命じた。そちらは今、果たしている。"
 ],
 [
  null,
  "リオネルは顔を上げた。玉座の前で、報告書が捨てられることはなかった。"
 ],
 [
  "lionel",
  "では、編成と育成を見直します。道中に残った記録も、使えるものから。"
 ],
 [
  "sairan",
  "敵が四人なら四人の、減っているなら残った者の動きを見ろ。昨日の想定に敗北を合わせるな。"
 ],
 [
  "lionel",
  "次は、勝利の報告を。"
 ],
 [
  "sairan",
  "その前に次の布陣を寄越せ。決意だけなら、先ほど十分聞いた。"
 ],
 [
  null,
  "軍議の灯は消えない。敗北は結末として記され、次の作戦の最初の頁にもなった。"
 ]
],"ending"),
royalScene351("ending-all-preempted",100,"誰も来なかった王室","決着後、玉座へ最後の報告が届く。",[
 [
  null,
  "十日目の王室に、勇者の足音は届かなかった。四人全員が道中で退けられ、最終決戦の相手は残っていない。"
 ],
 [
  "sairan",
  "扉は開いているな。"
 ],
 [
  "lionel",
  "はい。待たせているのではありません。到達する勇者が、いないのです。"
 ],
 [
  "sairan",
  "予言は。"
 ],
 [
  "lionel",
  "道中の結果に、追い越されました。"
 ],
 [
  null,
  "卓の四枚の敵札は、すでに全て伏せられていた。王室で交わされた刃は一本もない。"
 ],
 [
  "sairan",
  "余の二時間の演説はどうなる。"
 ],
 [
  "lionel",
  "聞く敵がおりません。"
 ],
 [
  "sairan",
  "味方はいる。"
 ],
 [
  "lionel",
  "道中で働いた分まで、拘束時間を増やすおつもりですか。"
 ],
 [
  "sairan",
  "……短く書面にする。"
 ],
 [
  "lionel",
  "本日の最大の戦果として、追記いたします。"
 ],
 [
  "sairan",
  "冗談はそこまでだ。門を開く前に勝った者たちの名を、漏らすな。"
 ],
 [
  "lionel",
  "はい。戦わずに終わったこの部屋のために、どこで戦ったかも全て。"
 ]
],"ending")
]);
export function campaignEndingStoryScene(ending,{variant=null,state={}}={}){
 const key=variant==="all-preempted"||ending==="all-preempted"?"all-preempted":ending;
 return ["complete","narrow","defeat","all-preempted"].includes(key)?resolveCampaignStoryScene(`ending-${key}`,state):null;
}
function demonCouncilStatus351(heroState){
 const alive=HERO_PARTY_IDS.filter(id=>!heroState.heroes[id].defeated),names=alive.map(id=>CAMPAIGN_STORY_CHARACTERS[id].name).join("、");
 const words=alive.length===0?[
  ["lionel","現時点で残る勇者は0人。道中で全員が退けられ、四人の共鳴が王室へ届く状況ではありません。"],
  ["sairan","では、いるはずの敵を作って戦うな。ここまでの結果を確かめ、最後の報告に備えろ。"]
 ]:alive.length===4?[
  ["lionel","現時点で残る勇者は4人。誰も撃退されていません。別行動中でも、合流できる者は数に含めます。"],
  ["sairan","四人が揃う想定で組め。一人を見た記憶だけで、残りを後回しにするな。"]
 ]:[
  ["lionel",`現時点で残る勇者は${alive.length}人。${names}です。道中で退けた者が、ここで復帰することはありません。`],
  ["sairan",alive.length===1?"残る一人へ集中しろ。消えた三人を恐れて、目の前の相手を見失うな。":"減った人数に合わせて布陣を直せ。残る者同士が、どこで動きを重ねるかを見る。"]
 ];
 return words.map(([id,text])=>line(id,text,"serious",{stageEffect:"lionel-slime"}));
}

const STORY_BY_ID=new Map([[CAMPAIGN_STORY_OPENING.id,CAMPAIGN_STORY_OPENING],...[...CAMPAIGN_STORY_SCENES,...CAMPAIGN_DEMON_STORY_SCENES,...CAMPAIGN_ENDING_STORY_SCENES].map(value=>[value.id,value])]);
const plainRecord=value=>Boolean(value&&typeof value==="object"&&!Array.isArray(value));
const boundedInteger=(value,fallback=0,min=0,max=Number.MAX_SAFE_INTEGER)=>{const number=Number(value);return Number.isFinite(number)?Math.max(min,Math.min(max,Math.floor(number))):fallback};
const safeText=(value,max=120)=>typeof value==="string"?value.replace(/[\u0000-\u001f\u007f]/g,"").slice(0,max):"";
const canonicalHeroId=value=>HERO_ID_ALIASES[safeText(value,40)]??null;
const sceneIdForFloor=floor=>`road-${String(floor).padStart(3,"0")}`;
const validSceneId=value=>STORY_BY_ID.has(value)?value:null;

function emptyHeroContinuity(heroId){return{heroId,encounters:0,repelledCount:0,damageRatio:0,currentHp:null,maxHp:null,defeated:false,lastOutcome:null,lastSeenAt:null}}
function normalizeHeroContinuityRecord(value,heroId){
 const source=plainRecord(value)?value:{},result={...emptyHeroContinuity(heroId)};result.encounters=boundedInteger(source.encounters??source.encounterCount,0,0,999);result.repelledCount=boundedInteger(source.repelledCount??source.repels??source.defeats,0,0,99);result.defeated=source.defeated===true||source.repelled===true||result.repelledCount>0;
 const hp=Number(source.currentHp??source.hp),maxHp=Number(source.maxHp??source.hpMax),remainingHpRate=Number(source.remainingHpRate??source.lowestHpRate??source.minHpRate??source.hpRate);if(Number.isFinite(hp)&&Number.isFinite(maxHp)&&maxHp>0){result.currentHp=Math.max(0,Math.floor(hp));result.maxHp=Math.max(1,Math.floor(maxHp));result.damageRatio=Math.max(0,Math.min(1,1-result.currentHp/result.maxHp))}else if(Number.isFinite(remainingHpRate))result.damageRatio=Math.max(0,Math.min(1,1-remainingHpRate));else result.damageRatio=Math.max(0,Math.min(1,Number(source.damageRatio??source.woundRatio??source.damagePercent/100)||0));
 const outcome=safeText(source.lastOutcome??source.outcome??source.result,32);result.lastOutcome=outcome||null;result.lastSeenAt=safeText(source.lastSeenAt??source.at,40)||null;if(["repelled","defeated","player-win","hero-defeat"].includes(outcome)){result.repelledCount=Math.max(1,result.repelledCount);result.defeated=true}return result
}
function mergeHeroContinuity(current,incoming,heroId){
 const left=normalizeHeroContinuityRecord(current,heroId),right=normalizeHeroContinuityRecord(incoming,heroId),useRightVitals=right.maxHp!=null&&(left.maxHp==null||right.damageRatio>=left.damageRatio);return{heroId,encounters:Math.max(left.encounters,right.encounters),repelledCount:Math.max(left.repelledCount,right.repelledCount),damageRatio:Math.max(left.damageRatio,right.damageRatio),currentHp:useRightVitals?right.currentHp:left.currentHp,maxHp:useRightVitals?right.maxHp:left.maxHp,defeated:left.defeated||right.defeated,lastOutcome:right.lastOutcome??left.lastOutcome,lastSeenAt:right.lastSeenAt??left.lastSeenAt}
}
function continuityFromSource(value){
 const result=Object.fromEntries(HERO_PARTY_IDS.map(id=>[id,emptyHeroContinuity(id)]));
 const consume=(entry,hintedId=null)=>{if(!plainRecord(entry))return;const heroId=canonicalHeroId(entry.heroId??entry.speciesId??entry.id??hintedId);if(!heroId)return;const existing=result[heroId],normalized=normalizeHeroContinuityRecord(entry,heroId);if(Array.isArray(value)){normalized.encounters=Math.max(1,normalized.encounters);if(["repelled","defeated","player-win","hero-defeat"].includes(normalized.lastOutcome))normalized.repelledCount=Math.max(1,normalized.repelledCount)}result[heroId]=mergeHeroContinuity(existing,normalized,heroId)};
 if(Array.isArray(value)){const counted={},repelled={};for(const entry of value){const heroId=canonicalHeroId(entry?.heroId??entry?.speciesId??entry?.id),outcome=safeText(entry?.lastOutcome??entry?.outcome??entry?.result,32);if(heroId){counted[heroId]=(counted[heroId]??0)+1;if(entry?.repelled===true||entry?.defeated===true||["repelled","defeated","player-win","hero-defeat"].includes(outcome))repelled[heroId]=(repelled[heroId]??0)+1}consume(entry)}for(const[id,count]of Object.entries(counted))result[id].encounters=Math.max(result[id].encounters,count);for(const[id,count]of Object.entries(repelled))result[id].repelledCount=Math.max(result[id].repelledCount,count)}else if(plainRecord(value)){for(const[key,entry]of Object.entries(value))consume(entry,key)}return result
}
function mergeContinuitySources(...sources){const result=Object.fromEntries(HERO_PARTY_IDS.map(id=>[id,emptyHeroContinuity(id)]));for(const source of sources){const normalized=continuityFromSource(source);for(const heroId of HERO_PARTY_IDS)result[heroId]=mergeHeroContinuity(result[heroId],normalized[heroId],heroId)}return result}

function createStoryState(){return{version:CAMPAIGN_STORY_VERSION,openingVersion:0,openingSeen:false,seenSceneIds:[],heroContinuity:Object.fromEntries(HERO_PARTY_IDS.map(id=>[id,emptyHeroContinuity(id)])),legacyMigrationApplied:false}}
export function normalizeCampaignStoryState(state){
 if(!plainRecord(state))return createStoryState();state.campaign100=plainRecord(state.campaign100)?state.campaign100:{};const campaign=state.campaign100,source=plainRecord(campaign.story309)?campaign.story309:{},story=createStoryState();
 story.seenSceneIds=[...new Set((Array.isArray(source.seenSceneIds)?source.seenSceneIds:Array.isArray(source.receipts)?source.receipts:[]).map(value=>typeof value==="string"?value:value?.sceneId).map(validSceneId).filter(Boolean))];const legacyOpeningSeen=source.openingSeen===true||source.introductionSeen===true||story.seenSceneIds.includes(CAMPAIGN_STORY_OPENING_ID);story.openingVersion=boundedInteger(source.openingVersion??(legacyOpeningSeen?1:0),0,0,CAMPAIGN_STORY_OPENING_VERSION);story.openingSeen=story.openingVersion>=CAMPAIGN_STORY_OPENING_VERSION;if(legacyOpeningSeen&&!story.seenSceneIds.includes(CAMPAIGN_STORY_OPENING_ID))story.seenSceneIds.push(CAMPAIGN_STORY_OPENING_ID);
 if(source.legacyMigrationApplied!==true){const legacyDays=[...(Array.isArray(campaign.invasionDaysSeen)?campaign.invasionDaysSeen:[]),...(Array.isArray(campaign.storyDaysSeen)?campaign.storyDaysSeen:[])].map(Number);for(const day of legacyDays)if(Number.isInteger(day)&&day>=2&&day<=10)story.seenSceneIds.push(sceneIdForFloor((day-1)*10));story.legacyMigrationApplied=true}
 story.seenSceneIds=[...new Set(story.seenSceneIds.map(validSceneId).filter(Boolean))].sort((left,right)=>(STORY_BY_ID.get(left)?.floor??-1)-(STORY_BY_ID.get(right)?.floor??-1));
 if(campaign.reincarnation319?.active&&campaign.reincarnation319.cycle>0){const limit=inferredClearedFloor(state);story.seenSceneIds=story.seenSceneIds.filter(id=>id===CAMPAIGN_STORY_OPENING_ID||(STORY_BY_ID.get(id)?.floor??0)<=limit);}
 story.heroContinuity=mergeContinuitySources(source.heroContinuity,campaign.heroContinuity,campaign.heroEncounterState,campaign.heroEncounterProgress,campaign.heroEncounters,campaign.heroAmbushes,campaign.heroWounds,state.heroEncounterState,state.heroEncounterProgress,state.heroEncounters,campaign.heroEncounters310?.heroes);story.seenAt={};if(plainRecord(source.seenAt))for(const[rawId,rawTimestamp]of Object.entries(source.seenAt)){const id=validSceneId(rawId),timestamp=safeText(rawTimestamp,40);if(id&&timestamp)story.seenAt[id]=timestamp}story.version=CAMPAIGN_STORY_VERSION;campaign.story309=story;return story
}

export function recordCampaignHeroStoryOutcome(state,{heroId,speciesId,outcome,result,hp,currentHp,maxHp,damageRatio,woundRatio,repelled=false,defeated=false,at=null}={}){
 const id=canonicalHeroId(heroId??speciesId);if(!id)return{recorded:false,reason:"unknown-hero"};const story=normalizeCampaignStoryState(state),prior=story.heroContinuity[id],normalizedOutcome=safeText(outcome??result,32)||"encountered",incoming=normalizeHeroContinuityRecord({encounters:prior.encounters+1,repelledCount:prior.repelledCount+(repelled||defeated||["repelled","defeated","player-win","hero-defeat"].includes(normalizedOutcome)?1:0),currentHp:currentHp??hp,maxHp,damageRatio,woundRatio,defeated:prior.defeated||repelled||defeated,lastOutcome:normalizedOutcome,lastSeenAt:at},id);story.heroContinuity[id]=mergeHeroContinuity(prior,incoming,id);return{recorded:true,hero:{...story.heroContinuity[id]}}
}

function inferredClearedFloor(state,explicitFloor){
 if(explicitFloor!=null&&Number.isFinite(Number(explicitFloor)))return boundedInteger(state?.campaign100?.reincarnation319?.cycle>0?Math.min(Number(explicitFloor),(state.campaign100.finalUnlocked?100:Math.max(0,(Number(state.campaign100.reincarnation319.cycleMaxFloor)||1)-1))):explicitFloor,0,0,CAMPAIGN_MAX_FLOOR);if(!plainRecord(state))return 0;const campaign=plainRecord(state.campaign100)?state.campaign100:{},floorEntries=plainRecord(campaign.floors)?campaign.floors:{},cleared=Math.max(0,...Object.entries(floorEntries).filter(([,entry])=>plainRecord(entry)&&(entry.cleared===true||entry.bossDefeated===true)).map(([floor])=>boundedInteger(floor,0,0,CAMPAIGN_MAX_FLOOR))),advanced=Math.max(0,boundedInteger(campaign.reincarnation319?.cycle>0?campaign.reincarnation319.cycleMaxFloor:state.player?.maxFloor,1,1,CAMPAIGN_MAX_FLOOR)-1);return campaign.finalUnlocked===true?CAMPAIGN_MAX_FLOOR:Math.max(cleared,advanced)
}

export function pendingCampaignStoryScenes(state,{clearedFloor,includeOpening=true}={}){
 const story=normalizeCampaignStoryState(state),seen=new Set(story.seenSceneIds),eligibleFloor=inferredClearedFloor(state,clearedFloor),pending=[];if(includeOpening&&story.openingVersion<CAMPAIGN_STORY_OPENING_VERSION)pending.push(CAMPAIGN_STORY_OPENING);for(const entry of [...CAMPAIGN_STORY_SCENES,...CAMPAIGN_DEMON_STORY_SCENES].sort((a,b)=>a.floor-b.floor))if(entry.floor<=eligibleFloor&&!seen.has(entry.id))pending.push(entry);return pending
}
export function nextCampaignStoryScene(state,options={}){const next=pendingCampaignStoryScenes(state,options)[0];return next?resolveCampaignStoryScene(next.id,state):null}

const HERO_WOUND_LINES=Object.freeze({
 myth_yori:Object.freeze({
  wounded:Object.freeze({early:"前から残るこの傷、まだ覚えてる。相手の動きを確かめてから、次の間合いを決める。",mid:"この傷か。動きは十分見せてもらった。次はきっちり拳を届かせる。",late:"城門までなら、この傷でも持つ。残りの間合いは、全部この拳で詰める。"}),
  repelled:Object.freeze({early:"一回下がっただけや。動きは覚えた。次は同じ止め方、通らんで。",mid:"あそこで引いた分、癖は全部見えた。次は俺の拳が先に届く。",late:"ここまで来たんや。一度の負けで止まる距離やない。最後は拳を届かせる。"})
 }),
 myth_hide:Object.freeze({
  wounded:Object.freeze({early:"傷の原因は把握した。術式を一段ずらす。同じ攻撃は二度受けない。",mid:"残っている傷も計算に入れる。平気なふりをして、前と同じ動きを前提にはせん。",late:"傷を含めて再計算した。城門までの作戦精度に影響はない。"}),
  repelled:Object.freeze({early:"敗因は数値に落とした。次は最初の一手から修正する。",mid:"退いた地点まで解析済みだ。次は逆算して、こちらから術式を重ねる。",late:"失敗記録は完成した。最終戦へ同じ誤差は持ち込まない。"})
 }),
 myth_enami:Object.freeze({
  wounded:Object.freeze({early:"この傷はええよ。でも次、誰かの方へ向けたら、その時は笑ってられん。",mid:"僕の傷だけならまだ笑える。仲間へ同じことしたら、そこで終わりやけど。",late:"ここまで来たら傷は数えんよ。守る相手だけ、見失わんかったらええ。"}),
  repelled:Object.freeze({early:"逃がしてもらったとは思わんで。仲間を巻き込んだ分、次はきっちり返す。",mid:"一回止められたくらいで、全体の流れは変わらんよ。次は僕が変える。",late:"まだ笑ってられる。でも城門で仲間に触れたら、次は笑って終わらせん。"})
 }),
 myth_rion:Object.freeze({
  wounded:Object.freeze({early:"僕の傷は計算に入れた。全員で帰る条件は、まだ崩れてないよ。",mid:"治療と進路を組み直した。僕を含めて、誰も置いていかない。",late:"この傷込みで最終収支は勝ちにする。四人で帰る条件は変えないよ。"}),
  repelled:Object.freeze({early:"撤退は損失じゃない。情報は持ち帰った。次は、この四人が勝つ条件で話を始める。",mid:"退いた分まで次の段取りへ入れた。同じ場所で、同じ交渉はしない。",late:"ここまでの損失は全部回収する。ただし、誰かを代金にする勝ち方は選ばない。"})
 })
});
const HERO_WOUND_REACTIONS=Object.freeze({
 myth_yori:Object.freeze({
  wounded:Object.freeze({early:line("myth_hide","打撃速度は落ちていない。むしろ少し上がっている。酒だけは飲ませるな。","serious"),mid:line("myth_rion","治療費は僕が出す。酒代まで経費に入れたら、そこだけは却下するよ。","teasing"),late:line("myth_enami","痛いなら言いや。黙って笑われる方が、こっちは困る。","gentle")}),
  repelled:Object.freeze({early:line("myth_enami","よりが黙って見てた分は、僕らが聞いてる。次はその情報ごと返す。","cold"),mid:line("myth_hide","観察記録は受け取った。重要な一行だけ酒でにじんでいるが、復元可能だ。","serious"),late:line("myth_rion","よりの分まで全員で帰る。酒代だけは本人へ請求する。","serious")})
 }),
 myth_hide:Object.freeze({
  wounded:Object.freeze({early:line("myth_yori","全部分かった顔してるけど、回復薬は持ってきたん？","teasing"),mid:line("myth_enami","分析はええから傷見せ。自分のことになると大事なとこ抜けてるで。","gentle"),late:line("myth_rion","作戦の精度は信じる。でも忘れ物チェックは僕が引き取るよ。","serious")}),
  repelled:Object.freeze({early:line("myth_rion","計算は間違ってなかった。前提が一個なかっただけ。次は僕らがそこを埋める。","serious"),mid:line("myth_yori","ひでの答えは合ってた。肝心な式だけ、置いてきたみたいやけどな。","teasing"),late:line("myth_enami","抜けた一個は僕らで足す。ひでの計算、無駄にはせん。","cold")})
 }),
 myth_enami:Object.freeze({
  wounded:Object.freeze({early:line("myth_yori","人の話は聞かんのに、敵の事情だけはよう聞くな。傷の話も聞け。","teasing"),mid:line("myth_hide","論点を三つに分けた。えなみは聞かずに四つ目を見つける。","serious"),late:line("myth_rion","没頭するのは止めない。でも戻ってくる場所だけは忘れないで。","gentle")}),
  repelled:Object.freeze({early:line("myth_yori","えなみが残した問いには、まだ誰も答えてない。俺らが聞きに行く。","serious"),mid:line("myth_rion","相手の矛盾は全部記録した。次の交渉で、一つずつ逃げ道を閉じる。","serious"),late:line("myth_hide","彼の論証は完成している。残った僕らが、最後の結論を示す。","cold")})
 }),
 myth_rion:Object.freeze({
  wounded:Object.freeze({early:line("myth_hide","交渉材料を増やすために傷を作るな。費用対効果が悪い。","serious"),mid:line("myth_yori","治るまで座っとき。思いついても、今日は俺らが先に動く。","gentle"),late:line("myth_enami","損得はあとでええ。りおんまで代金に入れたら、その計算は間違いや。","cold")}),
  repelled:Object.freeze({early:line("myth_hide","撤退前に次の案を三つ残していった。行動だけは最後まで速い。","serious"),mid:line("myth_enami","人を代金にせん儲け方、ちゃんと覚えてる。あとは僕らが続ける。","gentle"),late:line("myth_yori","帰ったらまた金の話聞いたる。だから今は、俺らが勝って帰る。","serious")})
 })
});
function rotatingFocus(candidates,day){if(!candidates.length)return null;const offset=Math.max(0,boundedInteger(day,1,1,10)-1)%candidates.length;return candidates[offset]}
function continuityVariant(story,day=1){const heroes=HERO_PARTY_IDS.map(id=>story.heroContinuity[id]??emptyHeroContinuity(id)),repelled=heroes.filter(hero=>hero.defeated||hero.repelledCount>0).sort((a,b)=>b.repelledCount-a.repelledCount||b.damageRatio-a.damageRatio),wounded=heroes.filter(hero=>hero.damageRatio>=.08).sort((a,b)=>b.damageRatio-a.damageRatio);if(repelled.length){const top=repelled[0].repelledCount,candidates=repelled.filter(hero=>hero.repelledCount===top);return{variant:"repelled",focus:rotatingFocus(candidates,day)}}if(wounded.length)return{variant:"wounded",focus:rotatingFocus(wounded,day)};return{variant:"default",focus:null}}
export function resolveCampaignStoryScene(sceneId,state){
 const id=validSceneId(sceneId),definition=id?STORY_BY_ID.get(id):null;if(!definition)return null;
 const story=normalizeCampaignStoryState(state),ledger=state?.campaign100?.heroEncounters310,active=ledger?.events?.[ledger.activeEncounterId];
 const heroState={heroes:Object.fromEntries(HERO_PARTY_IDS.map(heroId=>{const record=story.heroContinuity[heroId];return[heroId,{...record,defeated:record.defeated||record.damageRatio>=1,remainingHpRate:Math.max(0,1-record.damageRatio)}]})),awayHeroIds:active?.status==="active"?[active.heroId].filter(Boolean):[]};
 const castIds=definition.kind==="opening"||definition.storyTrack==="demon"?["lionel","sairan"]:HERO_PARTY_IDS.filter(heroId=>!heroState.heroes[heroId].defeated&&!heroState.awayHeroIds.includes(heroId));
 const condition=definition.kind==="milestone"?continuityVariant(story,definition.day):{variant:"default",focus:null};
 let dialogue=definition.dialogue.map(entry=>({...entry})),summary=definition.summary;
 if(definition.kind==="demon-milestone"&&definition.floor>=80)dialogue.splice(definition.floor===80?10:6,0,...demonCouncilStatus351(heroState));
 if(definition.kind==="milestone"){
  if(castIds.length<4){dialogue=smallPartyDialogue(definition,castIds,heroState);summary=castIds.length?`第${definition.day}日。${definition.location}で、今ここにいる${castIds.length}人が先へ進む方法を選ぶ。`:"勇者たちが歩むはずだった道に、静けさが残っている。"}
  else{const extra=(JOURNEY_CONVERSATIONS[definition.day]??[]).map(([speakerId,text])=>({...line(speakerId,text)}));const at=dialogue.at(-1)?.speakerId==null?dialogue.length-1:dialogue.length;dialogue.splice(at,0,...extra)}
 }
 if(condition.focus&&condition.variant==="wounded"&&castIds.includes(condition.focus.heroId)){
  const band=definition.day<=3?"early":definition.day<=7?"mid":"late",text=HERO_WOUND_LINES[condition.focus.heroId]?.wounded?.[band],reaction=HERO_WOUND_REACTIONS[condition.focus.heroId]?.wounded?.[band];
  if(text)dialogue.push({speakerId:condition.focus.heroId,text:castIds.length===4?text:text.replaceAll("四人で帰る","仲間と帰る"),tone:"wounded",continuity:true});
  if(reaction&&castIds.includes(reaction.speakerId))dialogue.push({...reaction,continuity:true,reactionToHeroId:condition.focus.heroId});
 }
 dialogue=dialogue.map(entry=>entry.speakerId==="myth_rion"?{...entry,text:entry.text.replaceAll("僕","オレ")}:entry);
 return{...definition,storyTextVersion:351,summary,dialogue,variant:condition.variant,focusHeroId:condition.focus?.heroId??null,castVersion:340,heroStoryState:heroState,characters:castIds.map(characterId=>CAMPAIGN_STORY_CHARACTERS[characterId]).filter(Boolean),heroContinuity:Object.fromEntries(HERO_PARTY_IDS.map(heroId=>[heroId,{...heroState.heroes[heroId]}]))}
}

export function acknowledgeCampaignStoryScene(state,sceneId,{seenAt=null}={}){
 const id=validSceneId(sceneId);if(!id)return{recorded:false,reason:"unknown-scene"};const story=normalizeCampaignStoryState(state),alreadySeen=id===CAMPAIGN_STORY_OPENING_ID?story.openingVersion>=CAMPAIGN_STORY_OPENING_VERSION:story.seenSceneIds.includes(id);if(!story.seenSceneIds.includes(id))story.seenSceneIds.push(id);if(id===CAMPAIGN_STORY_OPENING_ID){story.openingVersion=CAMPAIGN_STORY_OPENING_VERSION;story.openingSeen=true}story.seenSceneIds=[...new Set(story.seenSceneIds)].sort((left,right)=>(STORY_BY_ID.get(left)?.floor??-1)-(STORY_BY_ID.get(right)?.floor??-1));const timestamp=safeText(seenAt,40);if(timestamp){story.seenAt=plainRecord(story.seenAt)?story.seenAt:{};story.seenAt[id]=timestamp}return{recorded:!alreadySeen,sceneId:id,seenSceneIds:[...story.seenSceneIds]}
}

export function campaignStorySceneByFloor(floor,state){const value=boundedInteger(floor,0,0,CAMPAIGN_MAX_FLOOR),id=value===0?CAMPAIGN_STORY_OPENING_ID:CAMPAIGN_STORY_MILESTONES.includes(value)?sceneIdForFloor(value):null;return id?resolveCampaignStoryScene(id,state):null}
