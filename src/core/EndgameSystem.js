export const TEAM_BATTLE_UNLOCK_FLOOR=100;
export const EMERGENCY_UNLOCK_FLOOR=500;
export const WORLD_MAX_FLOOR=10000;

export const WORLD_REGIONS=[
 {id:"normal",name:"通常領域",minFloor:1,maxFloor:1000,phase:0},
 {id:"unknown",name:"未知領域",minFloor:1001,maxFloor:3000,phase:1},
 {id:"abyss",name:"深淵領域",minFloor:3001,maxFloor:7000,phase:1},
 {id:"divine",name:"神域",minFloor:7001,maxFloor:10000,phase:1}
];

export function hasCleared1000(state){return Boolean(state?.flags?.gameClear1000||Number(state?.worldPhase)>=1)}
export function worldPhase(state){return hasCleared1000(state)?1:0}
export function worldRegionForFloor(floor){const f=Math.max(1,Math.min(WORLD_MAX_FLOOR,Number(floor)||1));return WORLD_REGIONS.find(region=>f>=region.minFloor&&f<=region.maxFloor)??WORLD_REGIONS[0]}
export function mark1000FloorCleared(state){state.flags??={};state.flags.gameClear1000=true;state.flags.deepAbyssUnlocked=true;state.worldPhase=1;return state}

const abyss=(id,name,title,icon,speciesId,support,seriesId,signature,gearNames,extra={})=>({id,faction:"abyss",name,title,icon,speciesId,support,seriesId,signature,gearNames,...extra});
const god=(id,name,title,icon,speciesId,support,seriesId,signature,gearNames,extra={})=>({id,faction:"tenGod",name,title,icon,speciesId,support,seriesId,signature,gearNames,...extra});

export const ENDGAME_BOSSES={
 abyss_gluttony:abyss("abyss_gluttony","深淵・暴食 グラトニー","万象を喰らい、飢えだけを残す者","🌑","ogre",["vampire_bat","acid_slime","wraith"],"abyssGluttony","無限捕食",{weapon:"喰界の大剣",armor:"喰界の外殻",accessory:"喰界の環"},{element:"dark",ai:"瀕死者を狙い、与えた傷を生命へ変える。",passive:"飢餓循環：HPが減るほど吸収量上昇",resistances:["毒無効","即死無効","闇耐性90%"],skills:["無限捕食","飢餓の咆哮","血肉再生","喰界崩壊"],lore:"深淵に落ちた無数の生命欲が、ひとつの胃袋として自我を得た。",encounterText:"『足りない。お前たちを喰らっても、まだ足りない。』",victoryText:"飢えは消えず、ただ次の器へ沈んでいった。",reward:"暴食の欠片・喰界シリーズ"}),
 abyss_extinction:abyss("abyss_extinction","深淵・死滅 モルス","命の終端を告げる静寂","☠️","wraith",["skeleton_guard","zombie","ghost"],"abyssExtinction","死滅の波動",{weapon:"死滅の鎌",armor:"死滅の葬衣",accessory:"死滅の刻印"},{element:"dark",ai:"全体攻撃と回復阻害で戦線を静かに崩壊させる。",passive:"終端侵食：長期戦ほど攻撃力上昇",resistances:["睡眠無効","恐怖無効","光以外耐性50%"],skills:["死滅の波動","終焉宣告","生命遮断","無音葬送"],lore:"死そのものではない。生が続く可能性を消す、世界の終止符。",encounterText:"『終わりは罰ではない。すべてに等しく訪れる救済だ。』",victoryText:"静寂が割れ、止まっていた鼓動が再び世界へ戻った。",reward:"死滅の欠片・葬界シリーズ"}),
 abyss_wrath:abyss("abyss_wrath","深淵・憤怒 ラース","傷を力へ変える紅蓮の獣","🔥","dark_knight",["orc","salamander","dark_knight"],"abyssWrath","憤怒爆砕",{weapon:"憤怒の断罪斧",armor:"憤怒の血鎧",accessory:"憤怒の心核"},{element:"fire",ai:"被弾するほど攻撃を強め、瀕死で連続猛攻へ移る。",passive:"報復本能：被ダメージごとにATK上昇",resistances:["火傷無効","怯み無効","火耐性95%"],skills:["憤怒爆砕","報復連牙","血煙突進","終怒解放"],lore:"敗者の怒号、奪われた者の憎悪、届かなかった祈りが鎧を得た。",encounterText:"『痛みを知れ。俺が積み上げたすべての痛みを。』",victoryText:"怒号は遠ざかり、赤い残火だけが地面に残った。",reward:"憤怒の欠片・血焔シリーズ"}),
 abyss_envy:abyss("abyss_envy","深淵・嫉妬 エンヴィ","他者の輝きを奪う鏡像","🪞","mimic",["ghost","mimic","angelic_orb"],"abyssEnvy","鏡界模倣",{weapon:"嫉妬の写し刃",armor:"嫉妬の鏡衣",accessory:"嫉妬の魔眼"},{element:"water",ai:"最も攻撃力の高い相手を模倣し、同じ強さで返す。",passive:"羨望反射：敵の強化を得るたびDEF上昇",resistances:["魅了無効","能力低下耐性80%","水耐性80%"],skills:["鏡界模倣","反転写像","羨望収束","偽神顕現"],lore:"自分を持てなかった影が、他者を写し続けて深淵へ至った。",encounterText:"『その力、その仲間、その未来――全部、私の方が似合う。』",victoryText:"鏡面が砕け、最後まで誰の顔でもない影が消えた。",reward:"嫉妬の欠片・鏡界シリーズ"}),
 abyss_sloth:abyss("abyss_sloth","深淵・怠惰 スロウス","時間さえ眠らせる停滞の王","💤","stone_golem",["healing_mushroom","ghost","stone_golem"],"abyssSloth","永劫睡界",{weapon:"怠惰の大槌",armor:"怠惰の眠殻",accessory:"怠惰の砂時計"},{element:"earth",ai:"守りを固め、鈍化と睡眠で行動回数を奪う。",passive:"不動王：行動しなかったターンにDEF上昇",resistances:["睡眠吸収","鈍足無効","土耐性95%"],skills:["永劫睡界","停滞結界","惰眠再生","終わらぬ一日"],lore:"進むことを諦めた世界線が凝固し、巨大な眠りとして残った。",encounterText:"『急ぐ理由などない。いずれすべては、ここで止まる。』",victoryText:"止まっていた塵が落ち、世界の時間が再び流れ始めた。",reward:"怠惰の欠片・停界シリーズ"}),
 abyss_greed:abyss("abyss_greed","深淵・強欲 グリード","価値あるすべてを所有する王","💰","goblin_shaman",["mimic","goblin_guard","clockwork"],"abyssGreed","権能強奪",{weapon:"強欲の黄金杖",armor:"強欲の宝鎧",accessory:"強欲の王冠"},{element:"light",ai:"強化を奪い、自身の攻防へ変換する。",passive:"所有権：戦闘開始時に全能力を小強化",resistances:["封印無効","奪取無効","光耐性75%"],skills:["権能強奪","黄金障壁","財宝砲撃","万物所有宣言"],lore:"欲望を満たした王が最後に欲したものは、世界そのものの所有権だった。",encounterText:"『お前の力も運命も、まだ私の蔵にない。それは不自然だ。』",victoryText:"黄金は灰へ変わり、所有者のいない静かな輝きだけが残った。",reward:"強欲の欠片・黄金王シリーズ"}),
 abyss_pride:abyss("abyss_pride","深淵・傲慢 プライド","ただ一者として頂点に立つ皇帝","👑","ancient_dragon",["gargoyle","dark_knight","angelic_orb"],"abyssPride","絶対王域",{weapon:"傲慢の皇剣",armor:"傲慢の皇装",accessory:"傲慢の天冠"},{element:"wind",ai:"障壁で弱い攻撃を拒絶し、強者だけを処刑する。",passive:"絶対者：HP70%以上で被ダメージ軽減",resistances:["全状態異常耐性70%","風耐性90%","即死無効"],skills:["絶対王域","皇帝命令","天上断罪","唯一神宣言"],lore:"誰にも頭を下げなかった皇帝が、世界より高い場所を求めて深淵を王座にした。",encounterText:"『跪け。許可なく我を見上げることすら罪である。』",victoryText:"王冠が割れ、初めて皇帝の視線が同じ高さまで落ちた。",reward:"傲慢の欠片・絶対王シリーズ"}),

 ten_fire:god("ten_fire","炎神・イグニス","十神・灼熱と再生の権能","☀️","salamander",["ember_slime","salamander","willowisp"],"godIgnis","神炎・終焉焦土",{weapon:"炎神剣イグニス",armor:"炎神の天衣",accessory:"炎神核"},{element:"fire",ai:"全体を火で覆い、燃えるほど神炎を増幅する。",passive:"不滅神火：一度だけ瀕死から再起",resistances:["火傷吸収","火耐性100%","凍結耐性60%"],skills:["神炎・終焉焦土","太陽炉心","再誕の火","天焼神剣"],lore:"文明に火を授け、同じ火で傲慢な都市を焼いた最古の神。",encounterText:"『燃え残る意志があるなら示せ。灰から立てぬ者に未来はない。』",victoryText:"神炎は消えず、小さな祝福の火となって手の中に残った。",trial:"炎の試練：回復に頼らず神炎を耐え抜く",blessing:"炎神の加護：火属性与ダメージ上昇・火傷無効",reward:"炎神の欠片・焔神シリーズ"}),
 ten_water:god("ten_water","水神・ネレイア","十神・生命と循環の権能","🌊","water_spirit",["water_spirit","frost_slime","fairy"],"godNereia","神海・蒼天大瀑",{weapon:"水神杖ネレイア",armor:"水神の羽衣",accessory:"水神珠"},{element:"water",ai:"全体攻撃と大回復を循環させ、長期戦を支配する。",passive:"生命循環：ターン終了時HP回復",resistances:["毒無効","水耐性100%","火耐性80%"],skills:["神海・蒼天大瀑","生命潮流","浄化の雨","深海圧壊"],lore:"海と血流を同じ循環として見守る、慈悲深くも容赦のない神。",encounterText:"『流れを拒む者は澱む。お前の魂は、まだ巡っているか。』",victoryText:"荒海は凪ぎ、青い一滴が新たな生命の鼓動を刻んだ。",trial:"水の試練：絶え間ない回復を上回る",blessing:"水神の加護：毎戦闘HP自動回復",reward:"水神の欠片・蒼海神シリーズ"}),
 ten_thunder:god("ten_thunder","雷神・ヴァジュラ","十神・天雷と裁定の権能","⚡","wyvern",["harpy","willowisp","clockwork"],"godVajra","神雷・万象連鎖",{weapon:"雷神槍ヴァジュラ",armor:"雷神の天鎧",accessory:"雷神核"},{element:"thunder",ai:"高速で複数を撃ち、弱った者へ雷を連鎖させる。",passive:"天雷加速：攻撃するたびSPD上昇",resistances:["感電吸収","雷耐性100%","麻痺無効"],skills:["神雷・万象連鎖","裁定雷槍","雷霆瞬歩","天罰招来"],lore:"誓約を破った王を撃ち、正しき反逆者へ雷槍を授けた裁定神。",encounterText:"『言葉は要らぬ。覚悟は、雷より速く示せ。』",victoryText:"轟音の後に静寂が訪れ、雷槍の欠片が選択を認めた。",trial:"雷の試練：連撃に耐え、短期決戦で打ち破る",blessing:"雷神の加護：速度・会心率上昇",reward:"雷神の欠片・天雷神シリーズ"}),
 ten_wind:god("ten_wind","風神・ゼフィロス","十神・自由と変革の権能","🌪️","harpy",["harpy","wyvern","fairy"],"godZephyros","神嵐・天地解放",{weapon:"風神弓ゼフィロス",armor:"風神の翔衣",accessory:"風神翼"},{element:"wind",ai:"回避と高速攻撃で翻弄し、隊列を崩す。",passive:"自由の風：一定確率で攻撃を完全回避",resistances:["鈍足無効","風耐性100%","拘束無効"],skills:["神嵐・天地解放","空裂連刃","自由飛翔","暴風眼"],lore:"停滞した時代に革命を運ぶ風。善悪ではなく、変化そのものを祝福する。",encounterText:"『進め。立ち止まる理由を、運命のせいにするな。』",victoryText:"嵐は道を開き、誰にも閉ざせない空が現れた。",trial:"風の試練：高回避を突破し攻撃を当て続ける",blessing:"風神の加護：速度・回避率上昇",reward:"風神の欠片・翔風神シリーズ"}),
 ten_earth:god("ten_earth","地神・ガイア","十神・大地と守護の権能","⛰️","stone_golem",["stone_golem","bear","mandrake"],"godGaia","神地・大陸震界",{weapon:"地神槌ガイア",armor:"地神の巨鎧",accessory:"地神核"},{element:"earth",ai:"圧倒的防御で耐え、地震による重い全体攻撃を放つ。",passive:"大地脈：受けた攻撃が弱いほどDEF上昇",resistances:["土耐性100%","怯み無効","物理耐性65%"],skills:["神地・大陸震界","岩盤障壁","地脈再生","世界柱"],lore:"すべてを支える母なる地。守る価値を失った文明には自ら終幕を与える。",encounterText:"『支える覚悟なくして、上に立つ資格はない。』",victoryText:"大地は沈黙し、揺るがぬ守護の意志だけを託した。",trial:"地の試練：鉄壁を崩し長期戦を制する",blessing:"地神の加護：防御・最大HP上昇",reward:"地神の欠片・大地神シリーズ"}),
 ten_light:god("ten_light","光神・ソル","十神・真実と浄化の権能","✨","angelic_orb",["angelic_orb","fairy","willowisp"],"godSol","神光・万象浄滅",{weapon:"光神剣ソル",armor:"光神の聖衣",accessory:"光神輪"},{element:"light",ai:"強化を浄化し、光の全体攻撃で隠れた弱点を暴く。",passive:"真実照覧：命中率と会心率が常時上昇",resistances:["暗闇無効","光耐性100%","呪い無効"],skills:["神光・万象浄滅","真実の照射","聖域展開","断罪光輪"],lore:"嘘を暴き善を照らすが、眩しすぎる真実で人を焼くこともある。",encounterText:"『隠すな。弱さも罪も、すべて光の下へ置け。』",victoryText:"強い光は和らぎ、進むべき道だけを静かに照らした。",trial:"光の試練：強化に頼らず正面から戦う",blessing:"光神の加護：命中・状態異常耐性上昇",reward:"光神の欠片・聖光神シリーズ"}),
 ten_dark:god("ten_dark","闇神・ノクス","十神・秘密と安息の権能","🌘","dark_knight",["wraith","ghost","dark_knight"],"godNox","神闇・無明葬界",{weapon:"闇神鎌ノクス",armor:"闇神の夜衣",accessory:"闇神月"},{element:"dark",ai:"単体処刑と視界阻害で、最も弱い命から消していく。",passive:"夜の帳：戦闘開始時に被ダメージ軽減",resistances:["闇耐性100%","恐怖無効","即死耐性90%"],skills:["神闇・無明葬界","月蝕断頭","夜帳結界","静寂の眠り"],lore:"光が届かぬ場所を守り、傷ついた魂に眠りを与える夜の神。",encounterText:"『闇を恐れるな。恐れるべきは、闇の中で自分を失うことだ。』",victoryText:"夜は退かず、敵ではなく静かな庇護として周囲を包んだ。",trial:"闇の試練：弱者を守りながら処刑攻撃を凌ぐ",blessing:"闇神の加護：被ダメージ軽減・瀕死時回避上昇",reward:"闇神の欠片・夜神シリーズ"}),
 ten_ice:god("ten_ice","氷神・フリム","十神・静止と保存の権能","❄️","frost_dragon",["frost_slime","frost_dragon","water_spirit"],"godFrim","神氷・絶対零界",{weapon:"氷神槍フリム",armor:"氷神の晶鎧",accessory:"氷神晶"},{element:"ice",ai:"凍結と速度低下を重ね、動けない相手を砕く。",passive:"零度支配：敵より遅いほど被ダメージ軽減",resistances:["凍結吸収","氷耐性100%","水耐性80%"],skills:["神氷・絶対零界","永久凍土","氷晶牢獄","零度粉砕"],lore:"失われるべきでない記憶を氷に保存し、時代を越えて守る神。",encounterText:"『熱はすべてを変える。変わらぬ意志があるなら、凍土で示せ。』",victoryText:"氷壁に亀裂が走り、保存されていた古い記憶が解放された。",trial:"氷の試練：鈍化と凍結を乗り越える",blessing:"氷神の加護：凍結無効・防御上昇",reward:"氷神の欠片・零氷神シリーズ"}),
 ten_time:god("ten_time","時神・クロノス","十神・因果と時間の権能","⏳","clockwork",["clockwork","ghost","angelic_orb"],"godChronos","神刻・因果停止",{weapon:"時神杖クロノス",armor:"時神の刻衣",accessory:"時神時計"},{element:"light",ai:"行動順を歪め、周期的に時を止めて一方的に攻撃する。",passive:"未来観測：初回被弾を無効化",resistances:["鈍足無効","停止無効","全属性耐性35%"],skills:["神刻・因果停止","時間逆行","未来断罪","永劫秒針"],lore:"過去を裁かず未来を選ばず、因果の整合だけを守り続ける観測者。",encounterText:"『この敗北はすでに見た。覆す可能性を、お前は持つか。』",victoryText:"止まった秒針が動き、存在しなかった勝利が現在へ刻まれた。",trial:"時の試練：行動停止を耐え、限られた手数で勝つ",blessing:"時神の加護：スキル再使用時間短縮",reward:"時神の欠片・刻神シリーズ"}),
 ten_space:god("ten_space","空神・アストラ","十神・星空と境界の権能","🌌","ancient_dragon",["wyvern","angelic_orb","ancient_dragon"],"godAstra","神星・天界墜落",{weapon:"空神剣アストラ",armor:"空神の星装",accessory:"空神冠"},{element:"wind",ai:"星を落とす全体攻撃と境界障壁を交互に用いる。",passive:"星界超越：HPが減るほど全能力上昇",resistances:["全状態異常耐性80%","風・光耐性90%","即死無効"],skills:["神星・天界墜落","境界断絶","星環障壁","宇宙創生"],lore:"世界と世界の境界を定め、空の外から侵入するものを退ける最高位の門番。",encounterText:"『ここより先は世界の外。越えるなら、ひとつの世界を背負って来い。』",victoryText:"星々が道を作り、閉ざされていた最後の境界が開いた。",trial:"空の試練：神域障壁と全体攻撃を突破する",blessing:"空神の加護：全能力上昇・状態異常耐性上昇",reward:"空神の欠片・星界神シリーズ"})
};

export const ABYSS_IDS=Object.keys(ENDGAME_BOSSES).filter(id=>ENDGAME_BOSSES[id].faction==="abyss");
export const TEN_GOD_IDS=Object.keys(ENDGAME_BOSSES).filter(id=>ENDGAME_BOSSES[id].faction==="tenGod");

export function manifestationForFloor(floor){const f=Math.max(1,Number(floor)||1);if(f>=10000)return{rate:1,label:"真なる顕現",percent:100};if(f>=9000)return{rate:1,label:"完全神格",percent:100};if(f>=5000)return{rate:.8,label:"神格顕現",percent:80};if(f>=3000)return{rate:.6,label:"権能解放",percent:60};if(f>=1000)return{rate:.4,label:"上位投影体",percent:40};return{rate:.2,label:"投影体",percent:20}}

export function normalizeEndgameState(state){state.flags??={};state.flags.gameClear1000??=false;state.worldPhase=hasCleared1000(state)?1:0;state.endgame??={};state.endgame.teamBattle??={unlocked:false,stage:1,totalWins:0,totalLosses:0,dailyKey:null,dailyAttempts:0};state.endgame.emergency??={encounters:0,wins:0,losses:0,lastFloor:0,lastRollStep:0,records:{},fragments:{},craftCounts:{},craftedGear:[],blessings:{}};const e=state.endgame.emergency;e.records??={};e.fragments??={};e.craftCounts??={};e.craftedGear??=[];e.blessings??={};e.preludeChoices??={};e.discovered??={};e.contracts??={};e.rescue??={post1000Encounters:0,consecutiveLosses:0,lastResult:null};e.rescue.post1000Encounters=Math.max(0,Number(e.rescue.post1000Encounters)||0);e.rescue.consecutiveLosses=Math.max(0,Math.min(5,Number(e.rescue.consecutiveLosses)||0));e.rescue.lastResult=e.rescue.lastResult==="win"||e.rescue.lastResult==="loss"?e.rescue.lastResult:null;state.endgame.teamBattle.unlocked=Boolean(state.endgame.teamBattle.unlocked||state.player?.maxFloor>=TEAM_BATTLE_UNLOCK_FLOOR);return state.endgame}
export function teamBattleDayKey(date=new Date()){
 try{return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"}).format(date)}
 catch(_error){const shifted=new Date(date.getTime()+9*60*60*1000);return shifted.toISOString().slice(0,10)}
}
export function dailyTeamAttempts(state,date=new Date()){
 const team=normalizeEndgameState(state).teamBattle,key=teamBattleDayKey(date);
 if(team.dailyKey!==key){team.dailyKey=key;team.dailyAttempts=0}
 team.dailyAttempts=Math.max(0,Math.min(50,Number(team.dailyAttempts)||0));
 return team
}
function enemy(speciesId,level,extra={}){return{speciesId,level,boss:false,equipped:false,gear:null,...extra}}
export function createTeamBattleEncounter(state){const team=dailyTeamAttempts(state),stage=Math.max(1,team.stage||1),base=Math.max(10,Math.round((state.player?.maxFloor||100)*(.55+stage*.035))),pools=[["goblin_guard","goblin_shaman","orc","ogre"],["skeleton_guard","skeleton_archer","wraith","zombie"],["dire_wolf","bear","harpy","wyvern"],["stone_golem","clockwork","salamander","water_spirit"]],pool=pools[(stage-1)%pools.length];return pool.map((id,i)=>enemy(id,base+i*2,{nameOverride:`試練 ${stage}・${i+1}`,teamBattle:true,statMultiplier:1+stage*.09}))}
export function emergencyRescueStatus(state){
 const floor=Math.max(1,Number(state?.player?.currentFloor)||1),e=normalizeEndgameState(state).emergency,rescue=e.rescue,after1000=hasCleared1000(state)&&floor>1000;
 const earlyCount=after1000&&rescue.post1000Encounters<3,earlyFloor=after1000&&floor<=1250,transition=after1000&&(floor<=2000||rescue.post1000Encounters<6),losses=Math.max(0,Number(rescue.consecutiveLosses)||0);
 const active=earlyCount||earlyFloor||losses>0;
 const rateCap=(earlyCount||earlyFloor)?0.30:(transition?0.35:null);
 const supportCap=earlyCount||earlyFloor?1:transition?2:3;
 const lossReduction=Math.min(.15,losses*.05);
 const cooldown=active?(rescue.lastResult==="loss"?42:30):18;
 return{active,after1000,earlyCount,earlyFloor,transition,losses,rateCap,supportCap:losses>=2?Math.max(0,supportCap-1):supportCap,lossReduction,cooldown,label:earlyCount||earlyFloor?"境界保護":losses?`適応補正 Lv.${losses}`:transition?"深淵適応期間":null};
}
export function shouldTriggerEmergency(state,steps=0){if((state.player?.currentFloor||1)<EMERGENCY_UNLOCK_FLOOR)return false;const emergency=normalizeEndgameState(state).emergency,rescue=emergencyRescueStatus(state);if(steps-emergency.lastRollStep<rescue.cooldown)return false;emergency.lastRollStep=steps;const chance=rescue.active?0.025:0.035;return Math.random()<chance}
export function createEmergencyEncounter(state,forcedId=null){
 const floor=state.player?.currentFloor||500,rescue=emergencyRescueStatus(state),baseManifestation=manifestationForFloor(floor),rate=Math.max(.15,Math.min(baseManifestation.rate,rescue.rateCap??baseManifestation.rate)-rescue.lossReduction),manifestation={rate,label:rescue.active?(rescue.label??baseManifestation.label):baseManifestation.label,percent:Math.round(rate*100)};
 let available=Object.values(ENDGAME_BOSSES).filter(b=>hasCleared1000(state)||b.faction==="abyss");
 if(rescue.earlyCount||rescue.earlyFloor)available=available.filter(b=>b.faction==="abyss");
 else if(rescue.transition&&Math.random()>=.05)available=available.filter(b=>b.faction==="abyss");
 const boss=ENDGAME_BOSSES[forcedId]??available[Math.floor(Math.random()*available.length)],factionBase=boss.faction==="tenGod"?7:4,leaderMultiplier=factionBase*(.65+manifestation.rate*1.75),supportMultiplier=(boss.faction==="tenGod"?2.5:1.75)*(1+manifestation.rate),level=Math.max(150,Math.min(9999,Math.round(floor*(1.15+manifestation.rate*.45)))),leader=enemy(boss.speciesId,level,{boss:true,endgameBossId:boss.id,faction:boss.faction,nameOverride:`${boss.name}〈${manifestation.percent}%〉`,statMultiplier:leaderMultiplier,powerRate:manifestation.rate,manifestationLabel:manifestation.label,uncapturable:true,bossPassive:boss.passive,bossResistances:boss.resistances}),supportIds=boss.support.slice(0,Math.max(0,rescue.supportCap)),supports=supportIds.map((id,i)=>enemy(id,Math.max(1,level-10-i*3),{nameOverride:`${boss.faction==="tenGod"?"神兵":"眷属"}・${i+1}`,statMultiplier:supportMultiplier,endgameSupport:true,uncapturable:true}));return{boss,manifestation,rescue,enemies:[leader,...supports]}
}

export function endgamePreludeOptions(boss){
 const divine=boss?.faction==="tenGod";
 return[
  {id:"challenge",icon:"⚔️",title:divine?"試練を正面から受ける":"正面から威圧する",desc:"敵本体の能力を10%低下。追加報酬なし。",enemyMultiplier:.90,bonusFragments:0},
  {id:"study",icon:"👁️",title:divine?"権能を観測する":"深淵の性質を見抜く",desc:"敵は5%強化されるが、勝敗に関係なく欠片を追加獲得。",enemyMultiplier:1.05,bonusFragments:5},
  {id:"oath",icon:divine?"✨":"🩸",title:divine?"神前に誓いを立てる":"代償を差し出す",desc:"敵本体は15%低下。ただし眷属・神兵は20%強化。",enemyMultiplier:.85,supportMultiplier:1.20,bonusFragments:2}
 ];
}
export function resolveEndgamePrelude(state,bossId,choiceId){
 const boss=ENDGAME_BOSSES[bossId],option=endgamePreludeOptions(boss).find(x=>x.id===choiceId)??endgamePreludeOptions(boss)[0],e=normalizeEndgameState(state).emergency;
 e.preludeChoices[bossId]??={challenge:0,study:0,oath:0};e.preludeChoices[bossId][option.id]=(e.preludeChoices[bossId][option.id]??0)+1;e.discovered[bossId]=true;
 return{...option,bossId,resultText:option.id==="challenge"?`${boss.name}は真正面からの覚悟を認め、権能を抑えた。`:option.id==="study"?`${boss.name}の権能を観測した。危険は増したが、より多くの欠片を回収できる。`:`${boss.name}へ代償を捧げた。本体は弱まったが、配下が凶暴化した。`};
}
export function applyPreludeToEncounter(event,prelude){
 if(!event?.enemies||!prelude)return event;event.enemies=event.enemies.map((enemy,index)=>({...enemy,statMultiplier:(enemy.statMultiplier??1)*(index===0?(prelude.enemyMultiplier??1):(prelude.supportMultiplier??1))}));return event;
}


export function endgameContractStatus(state,bossId,floor=state?.player?.currentFloor){
 const boss=ENDGAME_BOSSES[bossId],e=normalizeEndgameState(state).emergency,record=e.records[bossId]??{},contract=e.contracts[bossId]??{};
 const totalFragments=Math.max(0,Number(record.totalFragments??0)),f=Math.max(1,Number(floor)||1),eligible=f>1000;
 const thresholds=boss?.faction==="tenGod"?[[500,1],[200,.10],[100,.03],[50,.01],[0,.001]]:[[500,1],[200,.20],[100,.05],[50,.02],[0,.003]];
 const rate=thresholds.find(([need])=>totalFragments>=need)?.[1]??0;
 return{bossId,boss,eligible,contracted:Boolean(contract.contracted),rate:contract.contracted?0:rate,percent:contract.contracted?0:Number((rate*100).toFixed(1)),totalFragments,attempts:Number(contract.attempts??0),contractedAt:contract.contractedAt??null,reason:contract.contracted?"契約済み":eligible?null:"1000階層未満の？？？とは契約できない"};
}
export function attemptEndgameContract(state,bossId,floor=state?.player?.currentFloor,roll=Math.random()){
 const status=endgameContractStatus(state,bossId,floor),e=normalizeEndgameState(state).emergency;
 if(!status.boss)return{...status,attempted:false,success:false};
 e.contracts[bossId]??={contracted:false,attempts:0,contractedAt:null,contractedFloor:null};const contract=e.contracts[bossId];
 if(!status.eligible||status.contracted)return{...status,attempted:false,success:false};
 contract.attempts=Math.max(0,Number(contract.attempts??0))+1;const success=Number(roll)<status.rate;
 if(success){contract.contracted=true;contract.contractedAt=new Date().toISOString();contract.contractedFloor=Math.max(1,Number(floor)||1)}
 return{...endgameContractStatus(state,bossId,floor),attempted:true,success,rolled:Number(roll)};
}

export function fragmentRequirement(craftCount=0){return[50,75,100,125,150,200][Math.min(5,Math.max(0,Number(craftCount)||0))]}
export function emergencyFragmentStatus(state,bossId){const e=normalizeEndgameState(state).emergency,count=e.fragments[bossId]??0,crafted=e.craftCounts[bossId]??0;return{count,crafted,required:fragmentRequirement(crafted),canCraft:count>=fragmentRequirement(crafted)}}
export function awardEmergencyFragments(state,bossId,won,bonus=0){if(!bossId)return 0;const e=normalizeEndgameState(state).emergency,amount=(won?20:1+Math.floor(Math.random()*3))+Math.max(0,Number(bonus)||0);e.fragments[bossId]=(e.fragments[bossId]??0)+amount;const r=e.records[bossId]??={encounters:0,wins:0,losses:0,highestPower:0,firstFloor:null,firstVictoryFloor:null,bestRemainingHpPercent:100,totalFragments:0};r.totalFragments=(r.totalFragments??0)+amount;e.records[bossId]=r;return amount}
function uid(){return crypto.randomUUID?.()??`${Date.now()}-${Math.random().toString(16).slice(2)}`}
export function craftEndgameEquipment(state,bossId){const boss=ENDGAME_BOSSES[bossId];if(!boss)return{ok:false,message:"対象が見つかりません。"};const e=normalizeEndgameState(state).emergency,status=emergencyFragmentStatus(state,bossId);if(!status.canCraft)return{ok:false,message:`欠片が不足しています（${status.count}/${status.required}）`};const slots=["weapon","armor","accessory"],slot=slots[(status.crafted)%slots.length],god=boss.faction==="tenGod",pools=slot==="weapon"?(god?[{atk:240,crit:24,spd:35},{atk:280,crit:18},{atk:220,crit:30,heal:25}]:[{atk:150,crit:16,spd:22},{atk:180,crit:10},{atk:135,crit:22,heal:16}]):slot==="armor"?(god?[{hp:1100,def:190},{hp:900,def:230,heal:35},{hp:1250,def:150,spd:25}]:[{hp:650,def:115},{hp:520,def:145,heal:22},{hp:760,def:90,spd:16}]):(god?[{atk:90,hp:450,crit:20,spd:30},{def:85,hp:600,heal:45},{atk:70,def:60,crit:28}]:[{atk:55,hp:260,crit:14,spd:18},{def:50,hp:340,heal:28},{atk:42,def:38,crit:18}]),stats={...pools[Math.floor(Math.random()*pools.length)]},item={id:uid(),slot,name:boss.gearNames[slot],rarity:"LR",level:1,plus:0,stats,handedness:slot==="weapon"?"either":null,ruleOverrides:{endgame:true,unsellable:true},series:boss.seriesId,seriesName:`${boss.name}専用`,favorite:true,locked:true,equippedBy:null,createdAt:new Date().toISOString(),endgameBossId:bossId,endgameFaction:boss.faction,signatureSkill:boss.signature};e.fragments[bossId]-=status.required;e.craftCounts[bossId]=status.crafted+1;e.craftedGear.push({bossId,itemId:item.id,slot,at:item.createdAt});return{ok:true,item,spent:status.required,boss}}
export function recordEmergencyResult(state,battle,won){const end=normalizeEndgameState(state).emergency,bossId=battle?.specialBossId,floor=state.player?.currentFloor||1;end.encounters++;won?end.wins++:end.losses++;end.lastFloor=floor;if(hasCleared1000(state)&&floor>1000){end.rescue.post1000Encounters++;end.rescue.consecutiveLosses=won?0:Math.min(5,end.rescue.consecutiveLosses+1);end.rescue.lastResult=won?"win":"loss";}if(bossId){const r=end.records[bossId]??={encounters:0,wins:0,losses:0,highestPower:0,firstFloor:null,firstVictoryFloor:null,bestRemainingHpPercent:100,totalFragments:0};r.encounters++;won?r.wins++:r.losses++;r.highestPower=Math.max(r.highestPower,battle.powerPercent||0);r.firstFloor??=end.lastFloor;if(won)r.firstVictoryFloor??=end.lastFloor;const leader=battle.enemies?.find(x=>x.endgameBossId===bossId),remaining=leader?.maxHp?Math.max(0,Math.round((leader.hp/leader.maxHp)*100)):won?0:100;r.bestRemainingHpPercent=Math.min(r.bestRemainingHpPercent??100,remaining);end.records[bossId]=r;if(won&&ENDGAME_BOSSES[bossId]?.faction==="tenGod")end.blessings[bossId]=true}}
