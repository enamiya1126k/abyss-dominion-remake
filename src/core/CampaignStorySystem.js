import{CAMPAIGN_MAX_FLOOR,HERO_PARTY_IDS}from"./Campaign100System.js?v=3.1.1-build311";

export const CAMPAIGN_STORY_VERSION=1;
export const CAMPAIGN_STORY_OPENING_ID="opening-prophecy";
export const CAMPAIGN_STORY_MILESTONES=Object.freeze(Array.from({length:10},(_,index)=>(index+1)*10));

const HERO_ID_ALIASES=Object.freeze({
 enami:"myth_enami","えなみ":"myth_enami",myth_enami:"myth_enami",
 yori:"myth_yori","より":"myth_yori",myth_yori:"myth_yori",
 hide:"myth_hide","ひで":"myth_hide",myth_hide:"myth_hide",
 rion:"myth_rion","りおん":"myth_rion",myth_rion:"myth_rion"
});

const portrait=(speciesId,folder,asset=null)=>Object.freeze({type:"monster-sprite",speciesId,asset:asset??`./assets/monsters/${folder}/idle1.png?v=3.1.0-build310`});
export const CAMPAIGN_STORY_CHARACTERS=Object.freeze({
 sairan:Object.freeze({id:"sairan",name:"魔王サイラーン",title:"万魔の王",storyOnly:true,recurringStoryCharacter:true,battleEligible:false,portrait:portrait("campaign_sairan","campaign_sairan","./assets/story/campaign-sairan.png?v=3.1.2-build321")}),
 lionel:Object.freeze({id:"lionel",name:"預言者リオネル",title:"魔界随一の預言者",storyOnly:true,recurringStoryCharacter:true,battleEligible:false,portrait:portrait("campaign_lionel","campaign_lionel","./assets/story/campaign-lionel.png?v=3.1.2-build321")}),
 myth_enami:Object.freeze({id:"myth_enami",name:"えなみ",title:"共感と論理の勇者",portrait:portrait("myth_enami","myth_enami")}),
 myth_yori:Object.freeze({id:"myth_yori",name:"より",title:"微笑む蒼拳",portrait:portrait("myth_yori","myth_yori")}),
 myth_hide:Object.freeze({id:"myth_hide",name:"ひで",title:"緻密なる魔導士",portrait:portrait("myth_hide","myth_hide")}),
 myth_rion:Object.freeze({id:"myth_rion",name:"りおん",title:"即断の商略家",portrait:portrait("myth_rion","myth_rion")})
});

export const CAMPAIGN_HERO_DIALOGUE_PROFILES=Object.freeze({
 myth_enami:Object.freeze({core:"相手の事情へ一度寄り添い、理不尽や矛盾を見つけると論理で逃げ道を塞ぐ",flaw:"何かへ没頭すると仲間の話が聞こえなくなる"}),
 myth_yori:Object.freeze({core:"普段は笑って最後まで話を聞き、酔うと敵へ一切容赦しない",flaw:"酔うと味方にも拳が向くことがある"}),
 myth_hide:Object.freeze({core:"最も計算的で、状況の核心を正確に言い当てる",flaw:"作戦の一番大事な前提を一つだけ忘れる"}),
 myth_rion:Object.freeze({core:"金になる案を次々出し、思いついた瞬間に実行へ移す",flaw:"準備より行動が先に始まる"})
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
  contact:Object.freeze(["イージー！！ ……と言いたいところやけど、まずは最後まで見せてもらう。","ディフィカルト。せやけど、難しい方がおもろいやろ。"]),
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
  retreated:"もうちょっとどこか行きたいん？ 次は話の途中で逃がさへんで。",
  heroVictory:"おいおい！そんなもんか？！ ……まだ話、終わってへんで。",
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
 lionel:Object.freeze({storyOnly:true,recurring:true,battleEligible:false,finalBattleParticipant:false,summonEligible:false,codexEligible:false}),
 finalBattle:Object.freeze({partySize:4,heroIds:HERO_PARTY_IDS,allowSairan:false,allowLionel:false})
});

const line=(speakerId,text,tone="normal")=>Object.freeze({speakerId,text,tone});
const scene=(floor,location,summary,backgroundAsset,dialogue)=>Object.freeze({
 id:`road-${String(floor).padStart(3,"0")}`,kind:"milestone",floor,day:floor/10,location,summary,
 routeProgress:floor,backgroundAsset,dialogue:Object.freeze(dialogue)
});

export const CAMPAIGN_STORY_OPENING=Object.freeze({
 id:CAMPAIGN_STORY_OPENING_ID,kind:"opening",floor:0,day:0,location:"魔王城・玉座の間",routeProgress:0,
 backgroundAsset:"./assets/ui/battle/boss-throne.png",
 title:"予言の十日間",summary:"西の大陸から来る四人を迎え撃つため、百階の迷宮を制する十日間が始まる。",
 dialogue:Object.freeze([
  line(null,"魔王城。沈黙する玉座の前へ、預言者リオネルがひとつの未来を携えて現れた。","narration"),
  line("lionel","サイラーン様。十日後、西の大陸から四人の勇者がこの城へ到達します。"),
  line("sairan","名を。力の輪郭まで、余さず告げよ。","command"),
  line("lionel","えなみ、より、ひで、りおん。四人が揃った時、城門は破られると視えました。"),
  line("sairan","ならば百階の迷宮を軍へ変える。余は玉座から全軍を束ねる。十日で選び抜いた四体を、城門へ立たせよ。","command"),
  line(null,"予言を覆す軍を作るため、魔王軍は迷宮の第一階へ足を踏み入れた。","narration")
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
  line("myth_enami","聞いてへん。でも船はある、許可も取れた。なら行けるやろ。まかセロリ。","normal"),
  line("myth_yori","ほな出航前に一杯だけ。全員そろった祝いな。","teasing"),
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
  line("myth_enami","なんやコイツ。『民を守れ』と『村を焼け』が同じ命令に入ってる。守られる民はどこにおるん？ 命令が正しいんやなくて、逆らうのが怖いだけちゃう？","cold"),
  line("myth_hide","論理上、反論は不可能だ。なお崖道は満潮で消えた。潮位を入れ忘れていた。","quiet"),
  line("myth_yori","賢いのに、ほんま大事なとこだけ抜けるなあ。","teasing"),
  line(null,"兵は武器を置き、村は四人へ城までの古い道を教えた。","narration")
 ]),
 scene(50,"境界砦","第五日。魔王領との境を守る砦が、四人の前に立ちはだかる。","./assets/ui/trials/abyss-corridor-room.png",[
  line("myth_rion","壊す前に僕が話す。この砦は戦後に宿と市場へ変えられる。明日から稼げる形で残した方が得だ。","confident"),
  line("myth_hide","交渉は十五分。失敗したら三層目の術式から逆流させ、十二分四十秒で開門する。","serious"),
  line("myth_enami","門番にも守りたい生活があるんやろ。まず条件を聞こ。","gentle"),
  line(null,"砦の隊長は『民を守るため、民ごと門を封じる』と宣言した。","narration"),
  line("myth_enami","民を守るために民を閉じ込める。敵を入れへんために味方も出さへん。勝った後、その民に何を返すん？","cold"),
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
  line("myth_yori","ほな安心やな。薬代わりに、これ一口だけ。","teasing"),
  line("myth_enami","この文字、契約やなくて命令文や。所有者が逆になってる。おもろいな……もう少し見せて。","absorbed"),
  line("myth_rion","えなみ、罠の話をしてる。聞こえてる？","normal"),
  line("myth_enami","聞いてへん。けど、ひでの右足どけて。そこ八個目の起動板。","absorbed"),
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
  line("myth_rion","予約販売した地図の見本布を全部結ぶ。売り物は作り直せる。人は作り直せない。","serious"),
  line("myth_enami","まかセロリ。急にええ話するやん。儲け話より説得力あるで。","teasing"),
  line("myth_rion","損じゃないよ。四人で帰って、続編を売るための投資だ。","confident")
 ]),
 scene(80,"魔都街道","第八日。十神の光が街道を覆い、魔王城への道を隠す。","./assets/ui/battle/ten-gods-domain.png",[
  line(null,"十神の声は『資格なき者を通さぬ試練』と告げ、出口のない光壁を築いた。","narration"),
  line("myth_enami","止める側にも役目はあるよな。世界を守りたい、それは分かる。","gentle"),
  line("myth_enami","でも通す条件を示さへんのに『試練』はおかしい。誰も合格させる気がないなら、それは試験やなくて拒絶や。名前から直そか。","cold"),
  line("myth_hide","神域の干渉点へ一体ずつ誘導する。同時戦闘は避ける。完璧な分断だ。","serious"),
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
  line("myth_yori","聞いてへんのかい。怖いかって。","teasing"),
  line("myth_enami","怖いよ。せやから考えるのを止めへん。理不尽な答えしか残ってへんなら、残したやつに理由を全部聞く。最後はメンタル！！","cold"),
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
  line("myth_enami","まかセロリ。聞いてへんかったけど、始まるのは分かった。","teasing"),
  line(null,"四人は互いの欠けた部分を埋めるように散開し、魔王軍との最終決戦へ踏み込んだ。","narration")
 ])
]);

const STORY_BY_ID=new Map([[CAMPAIGN_STORY_OPENING.id,CAMPAIGN_STORY_OPENING],...CAMPAIGN_STORY_SCENES.map(value=>[value.id,value])]);
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

function createStoryState(){return{version:CAMPAIGN_STORY_VERSION,openingSeen:false,seenSceneIds:[],heroContinuity:Object.fromEntries(HERO_PARTY_IDS.map(id=>[id,emptyHeroContinuity(id)])),legacyMigrationApplied:false}}
export function normalizeCampaignStoryState(state){
 if(!plainRecord(state))return createStoryState();state.campaign100=plainRecord(state.campaign100)?state.campaign100:{};const campaign=state.campaign100,source=plainRecord(campaign.story309)?campaign.story309:{},story=createStoryState();story.openingSeen=source.openingSeen===true||source.introductionSeen===true;
 story.seenSceneIds=[...new Set((Array.isArray(source.seenSceneIds)?source.seenSceneIds:Array.isArray(source.receipts)?source.receipts:[]).map(value=>typeof value==="string"?value:value?.sceneId).map(validSceneId).filter(Boolean))];if(story.seenSceneIds.includes(CAMPAIGN_STORY_OPENING_ID))story.openingSeen=true;if(story.openingSeen&&!story.seenSceneIds.includes(CAMPAIGN_STORY_OPENING_ID))story.seenSceneIds.push(CAMPAIGN_STORY_OPENING_ID);
 if(source.legacyMigrationApplied!==true){const legacyDays=[...(Array.isArray(campaign.invasionDaysSeen)?campaign.invasionDaysSeen:[]),...(Array.isArray(campaign.storyDaysSeen)?campaign.storyDaysSeen:[])].map(Number);for(const day of legacyDays)if(Number.isInteger(day)&&day>=2&&day<=10)story.seenSceneIds.push(sceneIdForFloor((day-1)*10));story.legacyMigrationApplied=true}
 story.seenSceneIds=[...new Set(story.seenSceneIds.map(validSceneId).filter(Boolean))].sort((left,right)=>(STORY_BY_ID.get(left)?.floor??-1)-(STORY_BY_ID.get(right)?.floor??-1));
 story.heroContinuity=mergeContinuitySources(source.heroContinuity,campaign.heroContinuity,campaign.heroEncounterState,campaign.heroEncounterProgress,campaign.heroEncounters,campaign.heroAmbushes,campaign.heroWounds,state.heroEncounterState,state.heroEncounterProgress,state.heroEncounters,campaign.heroEncounters310?.heroes);story.seenAt={};if(plainRecord(source.seenAt))for(const[rawId,rawTimestamp]of Object.entries(source.seenAt)){const id=validSceneId(rawId),timestamp=safeText(rawTimestamp,40);if(id&&timestamp)story.seenAt[id]=timestamp}story.version=CAMPAIGN_STORY_VERSION;campaign.story309=story;return story
}

export function recordCampaignHeroStoryOutcome(state,{heroId,speciesId,outcome,result,hp,currentHp,maxHp,damageRatio,woundRatio,repelled=false,defeated=false,at=null}={}){
 const id=canonicalHeroId(heroId??speciesId);if(!id)return{recorded:false,reason:"unknown-hero"};const story=normalizeCampaignStoryState(state),prior=story.heroContinuity[id],normalizedOutcome=safeText(outcome??result,32)||"encountered",incoming=normalizeHeroContinuityRecord({encounters:prior.encounters+1,repelledCount:prior.repelledCount+(repelled||defeated||["repelled","defeated","player-win","hero-defeat"].includes(normalizedOutcome)?1:0),currentHp:currentHp??hp,maxHp,damageRatio,woundRatio,defeated:prior.defeated||repelled||defeated,lastOutcome:normalizedOutcome,lastSeenAt:at},id);story.heroContinuity[id]=mergeHeroContinuity(prior,incoming,id);return{recorded:true,hero:{...story.heroContinuity[id]}}
}

function inferredClearedFloor(state,explicitFloor){
 if(Number.isFinite(Number(explicitFloor)))return boundedInteger(explicitFloor,0,0,CAMPAIGN_MAX_FLOOR);if(!plainRecord(state))return 0;const campaign=plainRecord(state.campaign100)?state.campaign100:{},floorEntries=plainRecord(campaign.floors)?campaign.floors:{},cleared=Math.max(0,...Object.entries(floorEntries).filter(([,entry])=>plainRecord(entry)&&(entry.cleared===true||entry.bossDefeated===true)).map(([floor])=>boundedInteger(floor,0,0,CAMPAIGN_MAX_FLOOR))),advanced=Math.max(0,boundedInteger(state.player?.maxFloor,1,1,CAMPAIGN_MAX_FLOOR)-1);return campaign.finalUnlocked===true?CAMPAIGN_MAX_FLOOR:Math.max(cleared,advanced)
}

export function pendingCampaignStoryScenes(state,{clearedFloor,includeOpening=true}={}){
 const story=normalizeCampaignStoryState(state),seen=new Set(story.seenSceneIds),eligibleFloor=inferredClearedFloor(state,clearedFloor),pending=[];if(includeOpening&&!story.openingSeen&&!seen.has(CAMPAIGN_STORY_OPENING_ID))pending.push(CAMPAIGN_STORY_OPENING);for(const entry of CAMPAIGN_STORY_SCENES)if(entry.floor<=eligibleFloor&&!seen.has(entry.id))pending.push(entry);return pending
}
export function nextCampaignStoryScene(state,options={}){const next=pendingCampaignStoryScenes(state,options)[0];return next?resolveCampaignStoryScene(next.id,state):null}

const HERO_WOUND_LINES=Object.freeze({
 myth_yori:Object.freeze({
  wounded:Object.freeze({early:"さっきの一撃、悪くなかった。間合いはもう見た。次はこっちの拳が届く。",mid:"この傷か。動きは十分見せてもろた。次はきっちり拳を届かせる。",late:"城門までなら、この傷でも持つ。残りの間合いは、全部この拳で詰める。"}),
  repelled:Object.freeze({early:"一回下がっただけや。動きは覚えた。次は同じ止め方、通らんで。",mid:"あそこで引いた分、癖は全部見えた。次は俺の拳が先に届く。",late:"ここまで来たんや。一度の負けで止まる距離やない。最後は拳を届かせる。"})
 }),
 myth_hide:Object.freeze({
  wounded:Object.freeze({early:"傷の原因は把握した。術式を一段ずらす。同じ攻撃は二度受けない。",mid:"損傷は想定内だ。敵の周期へ補正式を入れた。敵の命中率は下がる。",late:"傷を含めて再計算した。城門までの作戦精度に影響はない。"}),
  repelled:Object.freeze({early:"敗因は数値に落とした。次は最初の一手から修正する。",mid:"退いた地点まで解析済みだ。次は逆算して、こちらから術式を重ねる。",late:"失敗記録は完成した。最終戦へ同じ誤差は持ち込まない。"})
 }),
 myth_enami:Object.freeze({
  wounded:Object.freeze({early:"この傷はええよ。でも次、誰かの方へ向けたら、その時は笑ってられへん。",mid:"僕の傷だけならまだ笑える。仲間へ同じことしたら、そこで終わりやけど。",late:"ここまで来たら傷は数えへんよ。守る相手だけ、見失わんかったらええ。"}),
  repelled:Object.freeze({early:"逃がしてもろたとは思わんで。仲間を巻き込んだ分、次はきっちり返す。",mid:"一回止められたくらいで、全体の流れは変わらんよ。次は僕が変える。",late:"まだ笑ってられる。でも城門で仲間に触れたら、次は笑って終わらせへん。"})
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
  repelled:Object.freeze({early:line("myth_rion","計算は間違ってなかった。前提が一個なかっただけ。次は僕らがそこを埋める。","serious"),mid:line("myth_yori","ひでの答えは合ってた。肝心な式だけ、置いてきたみたいやけどな。","teasing"),late:line("myth_enami","抜けた一個は僕らで足す。ひでの計算、無駄にはせえへん。","cold")})
 }),
 myth_enami:Object.freeze({
  wounded:Object.freeze({early:line("myth_yori","人の話は聞かんのに、敵の事情だけはよう聞くな。傷の話も聞け。","teasing"),mid:line("myth_hide","論点を三つに分けた。えなみは聞かずに四つ目を見つける。","serious"),late:line("myth_rion","没頭するのは止めない。でも戻ってくる場所だけは忘れないで。","gentle")}),
  repelled:Object.freeze({early:line("myth_yori","えなみが残した問いには、まだ誰も答えてへん。俺らが聞きに行く。","serious"),mid:line("myth_rion","相手の矛盾は全部記録した。次の交渉で、一つずつ逃げ道を閉じる。","serious"),late:line("myth_hide","彼の論証は完成している。残った僕らが、最後の結論を示す。","cold")})
 }),
 myth_rion:Object.freeze({
  wounded:Object.freeze({early:line("myth_hide","交渉材料を増やすために傷を作るな。費用対効果が悪い。","serious"),mid:line("myth_yori","治るまで座っとき。思いついても、今日は俺らが先に動く。","gentle"),late:line("myth_enami","損得はあとでええ。りおんまで代金に入れたら、その計算は間違いや。","cold")}),
  repelled:Object.freeze({early:line("myth_hide","撤退前に次の案を三つ残していった。行動だけは最後まで速い。","serious"),mid:line("myth_enami","人を代金にせん儲け方、ちゃんと覚えてる。あとは僕らが続ける。","gentle"),late:line("myth_yori","帰ったらまた金の話聞いたる。せやから今は、俺らが勝って帰る。","serious")})
 })
});
function rotatingFocus(candidates,day){if(!candidates.length)return null;const offset=Math.max(0,boundedInteger(day,1,1,10)-1)%candidates.length;return candidates[offset]}
function continuityVariant(story,day=1){const heroes=HERO_PARTY_IDS.map(id=>story.heroContinuity[id]??emptyHeroContinuity(id)),repelled=heroes.filter(hero=>hero.defeated||hero.repelledCount>0).sort((a,b)=>b.repelledCount-a.repelledCount||b.damageRatio-a.damageRatio),wounded=heroes.filter(hero=>hero.damageRatio>=.08).sort((a,b)=>b.damageRatio-a.damageRatio);if(repelled.length){const top=repelled[0].repelledCount,candidates=repelled.filter(hero=>hero.repelledCount===top);return{variant:"repelled",focus:rotatingFocus(candidates,day)}}if(wounded.length)return{variant:"wounded",focus:rotatingFocus(wounded,day)};return{variant:"default",focus:null}}
export function resolveCampaignStoryScene(sceneId,state){
 const id=validSceneId(sceneId),definition=id?STORY_BY_ID.get(id):null;if(!definition)return null;const story=normalizeCampaignStoryState(state),condition=definition.kind==="milestone"?continuityVariant(story,definition.day):{variant:"default",focus:null},dialogue=definition.dialogue.map(entry=>({...entry}));if(condition.focus){const band=definition.day<=3?"early":definition.day<=7?"mid":"late",text=HERO_WOUND_LINES[condition.focus.heroId]?.[condition.variant]?.[band],reaction=HERO_WOUND_REACTIONS[condition.focus.heroId]?.[condition.variant]?.[band];if(text)dialogue.push({speakerId:condition.focus.heroId,text,tone:condition.variant,continuity:true});if(reaction)dialogue.push({...reaction,continuity:true,reactionToHeroId:condition.focus.heroId})}return{...definition,dialogue,variant:condition.variant,focusHeroId:condition.focus?.heroId??null,characters:[...new Set(dialogue.map(entry=>entry.speakerId).filter(Boolean))].map(characterId=>CAMPAIGN_STORY_CHARACTERS[characterId]).filter(Boolean),heroContinuity:Object.fromEntries(HERO_PARTY_IDS.map(heroId=>[heroId,{...story.heroContinuity[heroId]}]))}
}

export function acknowledgeCampaignStoryScene(state,sceneId,{seenAt=null}={}){
 const id=validSceneId(sceneId);if(!id)return{recorded:false,reason:"unknown-scene"};const story=normalizeCampaignStoryState(state),alreadySeen=id===CAMPAIGN_STORY_OPENING_ID?story.openingSeen||story.seenSceneIds.includes(id):story.seenSceneIds.includes(id);if(!alreadySeen)story.seenSceneIds.push(id);if(id===CAMPAIGN_STORY_OPENING_ID)story.openingSeen=true;story.seenSceneIds=[...new Set(story.seenSceneIds)].sort((left,right)=>(STORY_BY_ID.get(left)?.floor??-1)-(STORY_BY_ID.get(right)?.floor??-1));const timestamp=safeText(seenAt,40);if(timestamp){story.seenAt=plainRecord(story.seenAt)?story.seenAt:{};story.seenAt[id]=timestamp}return{recorded:!alreadySeen,sceneId:id,seenSceneIds:[...story.seenSceneIds]}
}

export function campaignStorySceneByFloor(floor,state){const value=boundedInteger(floor,0,0,CAMPAIGN_MAX_FLOOR),id=value===0?CAMPAIGN_STORY_OPENING_ID:CAMPAIGN_STORY_MILESTONES.includes(value)?sceneIdForFloor(value):null;return id?resolveCampaignStoryScene(id,state):null}
