import{ENDGAME_CHARACTERS,ENDGAME_LEGACY_ID_MAP,canonicalEndgameId,endgameCharacter}from"../data/endgameCharacters.js?v=2.3.1";

export const TEAM_BATTLE_UNLOCK_FLOOR=100;
export const EMERGENCY_UNLOCK_FLOOR=100;
export const WORLD_MAX_FLOOR=10000;
export const ENDGAME_TRIAL_BATTLE_COUNT=22;
export const ENDGAME_EMERGENCY_RATE=.03;
export const ENDGAME_EMERGENCY_COOLDOWN_FLOORS=10;
export const ENDGAME_BASE_STAT_MULTIPLIER=Object.freeze({abyss:10,tenGod:100});
export const MANUAL_ENDGAME_DAILY_LIMIT=3;
export const TEAM_BATTLE_DAILY_LIMIT=10;
export const GAUNTLET_DAILY_LIMIT=10;
export function endgameTrialLoopMultiplier(loop=1){return 1+(Math.max(1,Math.floor(Number(loop)||1))-1)*.5}
export function endgameFactionStatMultiplier(faction){return ENDGAME_BASE_STAT_MULTIPLIER[faction]??1}

export const WORLD_REGIONS=[
 {id:"normal",name:"通常領域",minFloor:1,maxFloor:1000,phase:0},
 {id:"unknown",name:"未知領域",minFloor:1001,maxFloor:3000,phase:1},
 {id:"abyss",name:"深淵領域",minFloor:3001,maxFloor:7000,phase:1},
 {id:"divine",name:"神域",minFloor:7001,maxFloor:10000,phase:1}
];

export function hasCleared1000(state){return Boolean(state?.flags?.gameClear1000||Number(state?.worldPhase)>=1)}
export function hasCleared10000(state){return Boolean(state?.flags?.gameClear10000)}
export function worldPhase(state){return hasCleared1000(state)?1:0}
export function worldRegionForFloor(floor){const f=Math.max(1,Math.min(WORLD_MAX_FLOOR,Number(floor)||1));return WORLD_REGIONS.find(region=>f>=region.minFloor&&f<=region.maxFloor)??WORLD_REGIONS[0]}
export function mark1000FloorCleared(state){state.flags??={};state.flags.gameClear1000=true;state.flags.deepAbyssUnlocked=true;state.worldPhase=1;return state}
export function mark10000FloorCleared(state){state.flags??={};mark1000FloorCleared(state);state.flags.gameClear10000=true;return state}

const abyss=(id,name,title,icon,speciesId,support,seriesId,signature,gearNames,extra={})=>({id,faction:"abyss",name,title,icon,speciesId,support,seriesId,signature,gearNames,...extra});
const god=(id,name,title,icon,speciesId,support,seriesId,signature,gearNames,extra={})=>({id,faction:"tenGod",name,title,icon,speciesId,support,seriesId,signature,gearNames,...extra});

const LEGACY_ENDGAME_BOSSES={
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

// Character Bible を唯一の正本とする。旧定義はセーブ移行時の名称参照だけに残す。
export const ENDGAME_BOSSES=ENDGAME_CHARACTERS;

export const ABYSS_IDS=Object.keys(ENDGAME_BOSSES).filter(id=>ENDGAME_BOSSES[id].faction==="abyss");
export const TEN_GOD_IDS=Object.keys(ENDGAME_BOSSES).filter(id=>ENDGAME_BOSSES[id].faction==="tenGod");

export function manifestationForFloor(floor){const f=Math.max(1,Number(floor)||1);if(f>=5000)return{rate:1,label:f>=10000?"真なる顕現":"完全顕現",percent:100};if(f>=3000)return{rate:.6,label:"権能解放",percent:60};return{rate:.4,label:f>=1000?"上位投影体":"投影体",percent:40}}

function migrateLegacyEndgameIds(state,e){
 const numericMaps=[e.fragments,e.craftCounts];
 const objectMaps=[e.records,e.blessings,e.preludeChoices,e.discovered,e.contracts];
 for(const[legacyId,currentId]of Object.entries(ENDGAME_LEGACY_ID_MAP)){
  for(const map of numericMaps){if(!map||map[legacyId]==null)continue;map[currentId]=(Number(map[currentId])||0)+(Number(map[legacyId])||0);delete map[legacyId]}
  for(const map of objectMaps){if(!map||map[legacyId]==null)continue;if(map[currentId]==null)map[currentId]=map[legacyId];else if(typeof map[currentId]==="object"&&typeof map[legacyId]==="object")map[currentId]={...map[legacyId],...map[currentId],contracted:Boolean(map[currentId].contracted||map[legacyId].contracted)};delete map[legacyId]}
 }
 if(e.pendingEncounter?.bossId)e.pendingEncounter.bossId=canonicalEndgameId(e.pendingEncounter.bossId);
 for(const entry of e.craftedGear??[])if(entry?.bossId)entry.bossId=canonicalEndgameId(entry.bossId);
 for(const entry of Object.values(state.endgame?.processedSpecialResults??{}))if(entry?.bossId)entry.bossId=canonicalEndgameId(entry.bossId);
 for(const monster of state.monsters??[]){if(!monster?.endgameBossId)continue;monster.endgameBossId=canonicalEndgameId(monster.endgameBossId);const boss=endgameCharacter(monster.endgameBossId);if(boss){monster.nickname=boss.name;monster.title=boss.title;monster.endgameFaction=boss.faction;monster.contractSeriesId=boss.seriesId;monster.visualSpeciesId=boss.id}}
 for(const collection of[state.equipment,state.reserveEquipment,state.bossEquipmentVault])for(const item of collection??[]){if(!item?.endgameBossId)continue;item.endgameBossId=canonicalEndgameId(item.endgameBossId);const boss=endgameCharacter(item.endgameBossId);if(boss){item.endgameFaction=boss.faction;item.series=boss.seriesId}}
 for(const holder of[state.recentEncounter,state.recentBossEncounter,...(state.recentBattleMemory?.entries??[]),...(state.activeBattle?.enemies??[])])if(holder?.endgameBossId)holder.endgameBossId=canonicalEndgameId(holder.endgameBossId);
}

export function normalizeEndgameState(state){
 state.flags??={};state.flags.gameClear1000??=false;state.worldPhase=hasCleared1000(state)?1:0;state.endgame??={};
 state.endgame.processedSpecialResults=state.endgame.processedSpecialResults&&typeof state.endgame.processedSpecialResults==="object"&&!Array.isArray(state.endgame.processedSpecialResults)?state.endgame.processedSpecialResults:{};
 state.endgame.teamBattle??={unlocked:false,stage:1,totalWins:0,totalLosses:0,dailyKey:null,dailyAttempts:0};
 state.endgame.trials??={battle:1,loop:1,cleared:[],run:null,dailyKey:null,dailyAttempts:0};
 state.endgame.trials.battle=Math.max(1,Math.min(ENDGAME_TRIAL_BATTLE_COUNT,Math.floor(Number(state.endgame.trials.battle)||1)));
 state.endgame.trials.loop=Math.max(1,Math.floor(Number(state.endgame.trials.loop)||1));
 state.endgame.trials.cleared=Array.isArray(state.endgame.trials.cleared)?Array.from(new Set(state.endgame.trials.cleared.map(Number).filter(value=>value>=1&&value<=ENDGAME_TRIAL_BATTLE_COUNT))):[];
 state.endgame.trials.run=state.endgame.trials.run&&typeof state.endgame.trials.run==="object"&&!Array.isArray(state.endgame.trials.run)?state.endgame.trials.run:null;
 state.endgame.trials.dailyKey=state.endgame.trials.dailyKey??null;
 state.endgame.trials.dailyAttempts=Math.max(0,Math.min(GAUNTLET_DAILY_LIMIT,Math.floor(Number(state.endgame.trials.dailyAttempts)||0)));
 state.endgame.emergency??={encounters:0,wins:0,losses:0,lastFloor:0,lastTriggeredFloor:0,records:{},fragments:{},craftCounts:{},craftedGear:[],blessings:{}};
 const e=state.endgame.emergency;e.records??={};e.fragments??={};e.craftCounts??={};e.craftedGear??=[];e.blessings??={};e.preludeChoices??={};e.discovered??={};e.contracts??={};e.processedFragmentResults??={};e.processedBattleResults??={};e.manualChallenges=e.manualChallenges&&typeof e.manualChallenges==="object"&&!Array.isArray(e.manualChallenges)?e.manualChallenges:{dailyKey:null,dailyAttempts:0,unlocks:{}};e.manualChallenges.unlocks=e.manualChallenges.unlocks&&typeof e.manualChallenges.unlocks==="object"&&!Array.isArray(e.manualChallenges.unlocks)?e.manualChallenges.unlocks:{};migrateLegacyEndgameIds(state,e);e.lastTriggeredFloor=Math.max(0,Math.floor(Number(e.lastTriggeredFloor)||0));e.pendingEncounter=e.pendingEncounter&&ENDGAME_BOSSES[e.pendingEncounter.bossId]?{...e.pendingEncounter,bossId:String(e.pendingEncounter.bossId),floor:Math.max(EMERGENCY_UNLOCK_FLOOR,Math.floor(Number(e.pendingEncounter.floor)||EMERGENCY_UNLOCK_FLOOR))}:null;e.rescue??={post1000Encounters:0,consecutiveLosses:0,lastResult:null};
 e.rescue.post1000Encounters=Math.max(0,Number(e.rescue.post1000Encounters)||0);e.rescue.consecutiveLosses=Math.max(0,Math.min(5,Number(e.rescue.consecutiveLosses)||0));e.rescue.lastResult=e.rescue.lastResult==="win"||e.rescue.lastResult==="loss"?e.rescue.lastResult:null;
 state.endgame.teamBattle.unlocked=Boolean(state.endgame.teamBattle.unlocked||state.player?.maxFloor>=TEAM_BATTLE_UNLOCK_FLOOR);return state.endgame
}
export function specialBattleSettlement(state,battleId){
 const key=battleId==null?null:String(battleId);if(!key)return null;
 return normalizeEndgameState(state).processedSpecialResults[key]??null
}
export function recordSpecialBattleSettlement(state,battleId,result){
 const key=battleId==null?null:String(battleId),endgame=normalizeEndgameState(state);if(!key)return{created:false,result:null};
 if(endgame.processedSpecialResults[key])return{created:false,result:endgame.processedSpecialResults[key]};
 const entry={...result,battleId:key,settledAt:result?.settledAt??new Date().toISOString()};endgame.processedSpecialResults[key]=entry;
 const keys=Object.keys(endgame.processedSpecialResults);for(const old of keys.slice(0,Math.max(0,keys.length-100)))delete endgame.processedSpecialResults[old];
 return{created:true,result:entry}
}
export function teamBattleDayKey(date=new Date()){
 try{return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"}).format(date)}
 catch(_error){const shifted=new Date(date.getTime()+9*60*60*1000);return shifted.toISOString().slice(0,10)}
}
export function dailyTeamAttempts(state,date=new Date()){
 const team=normalizeEndgameState(state).teamBattle,key=teamBattleDayKey(date);
 if(team.dailyKey!==key){team.dailyKey=key;team.dailyAttempts=0}
 team.dailyAttempts=Math.max(0,Math.min(TEAM_BATTLE_DAILY_LIMIT,Number(team.dailyAttempts)||0));
 team.remaining=Math.max(0,TEAM_BATTLE_DAILY_LIMIT-team.dailyAttempts);team.limit=TEAM_BATTLE_DAILY_LIMIT;return team
}
export function dailyGauntletAttempts(state,date=new Date()){
 const trials=normalizeEndgameState(state).trials,key=teamBattleDayKey(date);
 if(trials.dailyKey!==key){trials.dailyKey=key;trials.dailyAttempts=0}
 trials.dailyAttempts=Math.max(0,Math.min(GAUNTLET_DAILY_LIMIT,Math.floor(Number(trials.dailyAttempts)||0)));
 return{...trials,remaining:Math.max(0,GAUNTLET_DAILY_LIMIT-trials.dailyAttempts),limit:GAUNTLET_DAILY_LIMIT};
}
export function manualEndgameChallengeStatus(state,date=new Date()){
 const manual=normalizeEndgameState(state).emergency.manualChallenges,key=teamBattleDayKey(date);
 if(manual.dailyKey!==key){manual.dailyKey=key;manual.dailyAttempts=0}
 manual.dailyAttempts=Math.max(0,Math.min(MANUAL_ENDGAME_DAILY_LIMIT,Math.floor(Number(manual.dailyAttempts)||0)));
 return{...manual,remaining:Math.max(0,MANUAL_ENDGAME_DAILY_LIMIT-manual.dailyAttempts),limit:MANUAL_ENDGAME_DAILY_LIMIT};
}
export function manualEndgameTierStatus(state,bossId){
 bossId=canonicalEndgameId(bossId);const manual=manualEndgameChallengeStatus(state),highest=Math.max(1,Math.min(4,Math.floor(Number(manual.unlocks[bossId])||1)));
 return{bossId,highestUnlocked:highest,remaining:manual.remaining,limit:manual.limit,canAttempt:manual.remaining>0};
}
export function consumeManualEndgameChallenge(state,bossId,tierId){
 const status=manualEndgameTierStatus(state,bossId),tierIndex=ENDGAME_CHALLENGE_TIERS.findIndex(tier=>tier.id===tierId)+1;
 if(!status.canAttempt)return{ok:false,message:`本日の挑戦回数を使い切りました（${status.limit}/${status.limit}）`,...status};
 if(!tierIndex||tierIndex>status.highestUnlocked)return{ok:false,message:"ひとつ前の段階を倒すと解禁されます。",...status};
 const manual=normalizeEndgameState(state).emergency.manualChallenges;manual.dailyAttempts++;return{ok:true,tierIndex,...manualEndgameTierStatus(state,bossId)};
}
export function recordManualEndgameClear(state,bossId,tierId,won){
 bossId=canonicalEndgameId(bossId);const tierIndex=ENDGAME_CHALLENGE_TIERS.findIndex(tier=>tier.id===tierId)+1,manual=normalizeEndgameState(state).emergency.manualChallenges;
 if(won&&tierIndex>0)manual.unlocks[bossId]=Math.max(Number(manual.unlocks[bossId])||1,Math.min(4,tierIndex+1));
 return manualEndgameTierStatus(state,bossId);
}
function enemy(speciesId,level,extra={}){return{speciesId,level,boss:false,equipped:false,gear:null,...extra}}
export function teamBattleStageMultiplier(stage=1){
 const s=Math.max(1,Math.floor(Number(stage)||1));
 // 1〜49戦は編成を覚える助走。50戦からはエンドゲーム戦力を要求し、以後は無限に伸びる。
 const pre50=Math.pow(1.082,Math.min(49,s)-1)*(1+Math.floor(Math.min(49,s)/10)*.42);
 if(s<50)return pre50;
 return pre50*85*Math.pow(1.19,s-50)*(1+Math.floor((s-50)/10)*.8);
}
export function teamBattleRewardPreview(stage=1,floor=100){
 const s=Math.max(1,Math.floor(Number(stage)||1)),post50=s>=50?Math.pow(1.17,s-49):1,scale=Math.pow(1.145,Math.min(49,s)-1)*post50,milestone=s%50===0?60:s%10===0?14:s%5===0?4:1;
 return{goldMultiplier:Math.max(4,Math.min(1e12,Math.round(4*scale*milestone))),crystals:Math.max(1,Math.min(1e9,Math.round(Math.pow(1.105,Math.min(49,s)-1)*post50*(s%10===0?18:3)))),guaranteedRarity:s>=50?"LR":s>=40?"UR":s>=25?"SSR":s>=10?"SR":null};
}
export function createTeamBattleEncounter(state){
 const team=dailyTeamAttempts(state),stage=Math.max(1,Math.floor(team.stage||1)),base=Math.max(10,Math.round((state.player?.maxFloor||100)*(.62+stage*.045))),pools=[["goblin_guard","goblin_shaman","orc","ogre"],["skeleton_guard","skeleton_archer","wraith","zombie"],["dire_wolf","bear","harpy","wyvern"],["stone_golem","clockwork","salamander","water_spirit"],["frost_slime","frost_dragon","water_spirit","harpy"],["dark_knight","wraith","angelic_orb","ancient_dragon"]],element=["earth","dark","wind","fire","ice","light"][(stage-1)%6],multiplier=teamBattleStageMultiplier(stage);
 if(stage<50){const pool=pools[(stage-1)%pools.length];return pool.map((id,i)=>enemy(id,base+i*2,{nameOverride:`試練 ${stage}・${i+1}`,teamBattle:true,statMultiplier:multiplier*(1+i*.06),trialElement:element}))}
 const useTenGod=stage>=60&&Math.floor(stage/10)%2===0,ids=useTenGod?TEN_GOD_IDS:ABYSS_IDS,bossId=ids[(stage-50)%ids.length],boss=ENDGAME_BOSSES[bossId],level=Math.max(999,Math.round((state.player?.maxFloor||100)*1.4+(stage-50)*260)),supportIds=boss.support.slice(0,3);
 return[
  enemy(boss.speciesId,level,{boss:true,endgameBossId:boss.id,visualSpeciesId:boss.id,faction:boss.faction,nameOverride:`${boss.name}〈試練 ${stage}〉`,teamBattle:true,statMultiplier:multiplier*(useTenGod?.34:.48),trialElement:boss.element??element,uncapturable:true,bossPassive:boss.passive}),
  ...supportIds.map((id,i)=>enemy(id,Math.max(1,level-35-i*18),{nameOverride:`${boss.faction==="tenGod"?"神兵":"深淵眷属"}・${i+1}`,teamBattle:true,endgameSupport:true,statMultiplier:multiplier*(.72+i*.09),trialElement:boss.element??element,uncapturable:true}))
 ];
}

const SOLO_TRIALS=[...ABYSS_IDS,...TEN_GOD_IDS].map((bossId,index)=>({number:index+1,name:`${ENDGAME_BOSSES[bossId].name}の法廷`,bossIds:[bossId]}));
export const ENDGAME_TRIALS=Object.freeze([
 ...SOLO_TRIALS,
 {number:18,name:"三欲・侵食回廊",bossIds:["abyss_gluttony","abyss_wrath","abyss_envy"]},
 {number:19,name:"四欲・王座回廊",bossIds:["abyss_sloth","abyss_greed","abyss_lust","abyss_pride"]},
 {number:20,name:"因果境界回廊",bossIds:["ten_time","ten_space","ten_fate"]},
 {number:21,name:"生死創終回廊",bossIds:["ten_life","ten_death","ten_creation","ten_end"]},
 {number:22,name:"世界法則・最終審理",bossIds:["ten_chaos","ten_dominion","ten_divinity"]}
]);
export function endgameTrialDefinition(number){return ENDGAME_TRIALS[Math.max(1,Math.min(ENDGAME_TRIAL_BATTLE_COUNT,Math.floor(Number(number)||1)))-1]}
export function createEndgameTrialEncounter(state,number=normalizeEndgameState(state).trials.battle){
 const trial=endgameTrialDefinition(number),trials=normalizeEndgameState(state).trials,loopMultiplier=endgameTrialLoopMultiplier(trials.loop),maxFloor=Math.max(100,Number(state.player?.maxFloor)||100),level=Math.max(120,Math.min(9999,Math.round(maxFloor*.9+trial.number*8))),solo=trial.bossIds.length===1;
 const leaders=trial.bossIds.map((bossId,index)=>{const boss=ENDGAME_BOSSES[bossId],base=solo?(boss.faction==="tenGod"?5.8:4.2):(boss.faction==="tenGod"?2.7:2.15);return enemy(boss.speciesId,level+index*3,{boss:true,endgameBossId:boss.id,visualSpeciesId:boss.id,faction:boss.faction,nameOverride:`${boss.name}〈回廊 ${trials.loop}周〉`,statMultiplier:base*loopMultiplier,uncapturable:true,elementMultipliers:boss.elementMultipliers,statusProfile:boss.statusProfile,bossPassive:boss.passive})});
 if(!solo)return{trial,loop:trials.loop,enemies:leaders};
 const boss=ENDGAME_BOSSES[trial.bossIds[0]],supports=boss.support.slice(0,3).map((speciesId,index)=>enemy(speciesId,Math.max(1,level-8-index*3),{nameOverride:`${boss.faction==="tenGod"?"法則守":"深淵眷属"}・${index+1}`,statMultiplier:(boss.faction==="tenGod"?1.85:1.45)*loopMultiplier,endgameSupport:true,uncapturable:true}));
 return{trial,loop:trials.loop,enemies:[...leaders,...supports]};
}
export function recordEndgameTrialResult(state,number,won){
 const trials=normalizeEndgameState(state).trials,index=Math.max(1,Math.min(ENDGAME_TRIAL_BATTLE_COUNT,Math.floor(Number(number)||trials.battle)));
 if(!won)return{won:false,battle:trials.battle,loop:trials.loop,loopCompleted:false};
 trials.cleared=Array.from(new Set([...(trials.cleared??[]),index])).sort((a,b)=>a-b);
 const loopCompleted=index>=ENDGAME_TRIAL_BATTLE_COUNT;
 if(loopCompleted){trials.loop++;trials.battle=1;trials.cleared=[]}else trials.battle=Math.max(trials.battle,index+1);
 return{won:true,battle:trials.battle,loop:trials.loop,loopCompleted,cleared:index};
}
export function emergencyRescueStatus(state){
 const floor=Math.max(1,Number(state?.player?.currentFloor)||1),e=normalizeEndgameState(state).emergency,rescue=e.rescue,after1000=hasCleared1000(state)&&floor>1000;
 const earlyCount=after1000&&rescue.post1000Encounters<3,earlyFloor=after1000&&floor<=1250,transition=after1000&&(floor<=2000||rescue.post1000Encounters<6),losses=Math.max(0,Number(rescue.consecutiveLosses)||0);
 const active=earlyCount||earlyFloor||losses>0;
 const supportCap=earlyCount||earlyFloor?1:transition?2:3;
 return{active,after1000,earlyCount,earlyFloor,transition,losses,supportCap:losses>=2?Math.max(0,supportCap-1):supportCap,label:earlyCount||earlyFloor?"境界保護":losses?`適応補正 Lv.${losses}`:transition?"深淵適応期間":null};
}
export function shouldTriggerEmergency(state){
 const floor=Math.max(1,Math.floor(Number(state.player?.currentFloor)||1));if(floor<EMERGENCY_UNLOCK_FLOOR)return false;
 const emergency=normalizeEndgameState(state).emergency;
 if(emergency.pendingEncounter)return true;
 if(emergency.lastTriggeredFloor&&floor<emergency.lastTriggeredFloor+ENDGAME_EMERGENCY_COOLDOWN_FLOORS)return false;
 const triggered=Math.random()<ENDGAME_EMERGENCY_RATE;
 if(triggered){const bossIds=Object.keys(ENDGAME_BOSSES),bossId=bossIds[Math.floor(Math.random()*bossIds.length)];emergency.lastTriggeredFloor=floor;emergency.pendingEncounter={bossId,floor,createdAt:new Date().toISOString(),priorVitals:null}}
 return triggered
}
export function createEmergencyEncounter(state,forcedId=null){
 const floor=state.player?.currentFloor||EMERGENCY_UNLOCK_FLOOR,rescue=emergencyRescueStatus(state),baseManifestation=manifestationForFloor(floor),rate=baseManifestation.rate,manifestation={...baseManifestation},pending=normalizeEndgameState(state).emergency.pendingEncounter;
 const available=Object.values(ENDGAME_BOSSES);
 const boss=ENDGAME_BOSSES[canonicalEndgameId(forcedId??pending?.bossId)]??available[Math.floor(Math.random()*available.length)],factionBase=boss.faction==="tenGod"?7:4,leaderMultiplier=factionBase*(.65+manifestation.rate*1.75),supportMultiplier=(boss.faction==="tenGod"?2.5:1.75)*(1+manifestation.rate),level=Math.max(150,Math.min(9999,Math.round(floor*(1.15+manifestation.rate*.45)))),leader=enemy(boss.speciesId,level,{boss:true,endgameBossId:boss.id,visualSpeciesId:boss.id,faction:boss.faction,nameOverride:`${boss.name}〈${manifestation.percent}%〉`,statMultiplier:leaderMultiplier,powerRate:manifestation.rate,manifestationLabel:manifestation.label,uncapturable:true,bossPassive:boss.passive,bossResistances:boss.resistances,elementMultipliers:boss.elementMultipliers,statusProfile:boss.statusProfile}),supportIds=boss.support.slice(0,Math.max(0,rescue.supportCap)),supports=supportIds.map((id,i)=>enemy(id,Math.max(1,level-10-i*3),{nameOverride:`${boss.faction==="tenGod"?"神兵":"眷属"}・${i+1}`,statMultiplier:supportMultiplier,endgameSupport:true,uncapturable:true}));return{boss,manifestation,rescue,enemies:[leader,...supports]}
}

export function endgamePreludeOptions(boss){
 return ENDGAME_CHALLENGE_TIERS.map(tier=>({...tier,faction:boss?.faction??"abyss"}));
}
export const ENDGAME_CHALLENGE_TIERS=Object.freeze([
 {id:"projection50",title:"投影体 / 50%",form:"projection",percent:50,level:999,recommended:"Lv.999の通常装備",enemyMultiplier:.5,supportMultiplier:.5,fragmentReward:1},
 {id:"projection100",title:"投影体 / 100%",form:"projection",percent:100,level:4999,recommended:"Lv.4,999の通常装備",enemyMultiplier:1,supportMultiplier:1,fragmentReward:3},
 {id:"manifest50",title:"顕現体 / 50%",form:"manifest",percent:50,level:9999,recommended:"Lv.9,999のフル装備",enemyMultiplier:5,supportMultiplier:5,fragmentReward:5},
 {id:"manifest100",title:"顕現体 / 100%",form:"manifest",percent:100,level:99999,recommended:"Lv.99,999のフル装備",enemyMultiplier:50,supportMultiplier:50,fragmentReward:10}
]);
export function resolveEndgamePrelude(state,bossId,choiceId){
 const boss=ENDGAME_BOSSES[bossId],option=endgamePreludeOptions(boss).find(x=>x.id===choiceId)??endgamePreludeOptions(boss)[0],e=normalizeEndgameState(state).emergency;
 e.preludeChoices[bossId]??={};e.preludeChoices[bossId][option.id]=(e.preludeChoices[bossId][option.id]??0)+1;e.discovered[bossId]=true;
 return{...option,bossId,resultText:`${boss.name}――${option.title}の権能が解放された。`};
}
export function applyPreludeToEncounter(event,prelude){
 if(!event?.enemies||!prelude)return event;event.manifestation={rate:prelude.percent/100,label:prelude.form==="manifest"?"顕現体":"投影体",percent:prelude.percent};const exactLevel=Math.max(1,Math.floor(Number(prelude.level)||1));event.enemies=event.enemies.map((enemy,index)=>({...enemy,level:index===0?exactLevel:Math.max(1,exactLevel-37-index*13),nameOverride:index===0?String(enemy.nameOverride??"").replace(/〈[^〉]+〉/,`〈${prelude.title}〉`):enemy.nameOverride,statMultiplier:(enemy.statMultiplier??1)*(index===0?(prelude.enemyMultiplier??1):(prelude.supportMultiplier??1)),powerRate:prelude.percent/100,manifestationLabel:prelude.title}));return event;
}


export function endgameContractStatus(state,bossId,floor=state?.player?.currentFloor){
 const canonicalId=canonicalEndgameId(bossId),boss=ENDGAME_BOSSES[canonicalId],e=normalizeEndgameState(state).emergency,contract=e.contracts[canonicalId]??{},availableFragments=Math.max(0,Math.floor(Number(e.fragments[canonicalId])||0)),required=boss?.faction==="tenGod"?150:50,maxFloor=Math.max(Number(state?.player?.maxFloor)||1,Number(floor)||1),eligible=Boolean(boss&&maxFloor>=EMERGENCY_UNLOCK_FLOOR),contracted=Boolean(contract.contracted),canContract=eligible&&!contracted&&availableFragments>=required;
 return{bossId:canonicalId,boss,eligible,contracted,canContract,availableFragments,totalFragments:availableFragments,required,remaining:Math.max(0,required-availableFragments),attempts:Number(contract.attempts??0),contractedAt:contract.contractedAt??null,reason:contracted?"契約済み":!eligible?`${EMERGENCY_UNLOCK_FLOOR}階到達で契約機能が解放される`:availableFragments<required?`欠片が不足（${availableFragments}/${required}）`:null};
}
export function attemptEndgameContract(state,bossId,floor=state?.player?.currentFloor){
 const status=endgameContractStatus(state,bossId,floor),e=normalizeEndgameState(state).emergency;
 if(!status.boss)return{...status,attempted:false,success:false};
 bossId=status.bossId;e.contracts[bossId]??={contracted:false,attempts:0,contractedAt:null,contractedFloor:null};const contract=e.contracts[bossId];
 if(!status.canContract)return{...status,attempted:false,success:false};
 const before=Math.max(0,Math.floor(Number(e.fragments[bossId])||0));if(before<status.required)return{...endgameContractStatus(state,bossId,floor),attempted:false,success:false};
 e.fragments[bossId]=before-status.required;contract.attempts=Math.max(0,Number(contract.attempts??0))+1;contract.contracted=true;contract.contractedAt=new Date().toISOString();contract.contractedFloor=Math.max(1,Number(floor)||1);contract.spentFragments=status.required;
 return{...endgameContractStatus(state,bossId,floor),attempted:true,success:true,spent:status.required};
}

export function fragmentRequirement(craftCount=0){return[50,75,100,125,150,200][Math.min(5,Math.max(0,Number(craftCount)||0))]}
export function emergencyFragmentStatus(state,bossId){bossId=canonicalEndgameId(bossId);const e=normalizeEndgameState(state).emergency,count=e.fragments[bossId]??0,crafted=e.craftCounts[bossId]??0;return{bossId,count,crafted,required:fragmentRequirement(crafted),canCraft:count>=fragmentRequirement(crafted)}}
export function awardEmergencyFragments(state,bossId,won,resultId=null,rewardOverride=null){
 bossId=canonicalEndgameId(bossId);if(!bossId)return 0;const e=normalizeEndgameState(state).emergency,key=resultId?String(resultId):null;
 if(key&&Object.prototype.hasOwnProperty.call(e.processedFragmentResults,key))return Number(e.processedFragmentResults[key])||0;
 const hasRewardOverride=rewardOverride!==null&&rewardOverride!==undefined&&Number.isFinite(Number(rewardOverride));
 const amount=won?(hasRewardOverride?Math.max(0,Math.floor(Number(rewardOverride))):5):(Math.random()<.10?1:0);e.fragments[bossId]=(e.fragments[bossId]??0)+amount;
 const r=e.records[bossId]??={encounters:0,wins:0,losses:0,highestPower:0,firstFloor:null,firstVictoryFloor:null,bestRemainingHpPercent:100,totalFragments:0};r.totalFragments=(r.totalFragments??0)+amount;e.records[bossId]=r;
 if(key){e.processedFragmentResults[key]=amount;const keys=Object.keys(e.processedFragmentResults);for(const old of keys.slice(0,Math.max(0,keys.length-100)))delete e.processedFragmentResults[old]}
 return amount
}
function uid(){return crypto.randomUUID?.()??`${Date.now()}-${Math.random().toString(16).slice(2)}`}
function endgameGearStats(boss,gear,index){
 const god=boss.faction==="tenGod",scale=god?1.58:1,magic=boss.damageClass!=="physical";
 const templates=[magic?{matk:150,crit:14,spd:20}:{atk:165,crit:14,spd:18},{hp:480,def:110,mdef:105},{hp:620,mp:36,heal:18},{crit:16,spd:26,atk:magic?0:48,matk:magic?48:0},{hp:820,def:145,mdef:135},{mp:52,matk:110,mdef:90,heal:22}];
 return Object.fromEntries(Object.entries(templates[index]??{}).filter(([,value])=>value).map(([key,value])=>[key,Math.round(value*scale)]));
}
function endgameGearFixedEffects(boss,index){
 const god=boss.faction==="tenGod",base=[{skillPower:god?18:12},{damageReduction:god?12:8},{hpPct:god?18:12,mpPct:god?12:8},{critRate:god?12:8,critDamage:god?20:14},{statusResistance:god?20:14,guardPower:god?16:10},{healPower:god?18:12,mpCostReduction:god?10:6}][index]??{};
 if(boss.id==="abyss_gluttony"&&index===0)base.lifeSteal=20;
 if(boss.id==="abyss_wrath"&&index===0)base.critDamage=40;
 if(boss.id==="ten_fate"&&index===0)base.critRate=20;
 if(boss.id==="ten_end"&&index===1)base.burnChance=20;
 if(boss.id==="ten_life"&&index===0)base.healPower=25;
 return base;
}
export function craftEndgameEquipment(state,bossId){
 const canonicalId=canonicalEndgameId(bossId),boss=ENDGAME_BOSSES[canonicalId];if(!boss)return{ok:false,message:"対象が見つかりません。"};
 const e=normalizeEndgameState(state).emergency,status=emergencyFragmentStatus(state,canonicalId);if(!status.canCraft)return{ok:false,message:`欠片が不足しています（${status.count}/${status.required}）`};
 const gearIndex=status.crafted%boss.gear.length,gear=boss.gear[gearIndex],factionIds=boss.faction==="tenGod"?TEN_GOD_IDS:ABYSS_IDS,item={id:uid(),slot:gear.slot,name:gear.name,rarity:"LR",level:1,plus:0,stats:endgameGearStats(boss,gear,gearIndex),handedness:gear.slot==="weapon"?(gear.subslot==="weaponRight"?"right":"left"):null,ruleOverrides:{endgame:true,unsellable:true,subslot:gear.subslot},series:boss.seriesId,seriesName:`${boss.name}専用`,favorite:true,locked:true,equippedBy:null,affixes:[],fixedEffects:endgameGearFixedEffects(boss,gearIndex),fixedEffectText:gear.effectText,createdAt:new Date().toISOString(),endgameBossId:canonicalId,endgameFaction:boss.faction,iconKey:`endgame-${canonicalId}-${gearIndex+1}`,iconAtlas:`endgame-${boss.faction==="tenGod"?"ten":"abyss"}`,iconColumn:gearIndex,iconRow:Math.max(0,factionIds.indexOf(canonicalId)),signatureSkill:boss.signature};
 e.fragments[canonicalId]-=status.required;e.craftCounts[canonicalId]=status.crafted+1;e.craftedGear.push({bossId:canonicalId,itemId:item.id,slot:gear.slot,subslot:gear.subslot,at:item.createdAt});return{ok:true,item,spent:status.required,boss,gearIndex};
}
export function recordEmergencyResult(state,battle,won){const end=normalizeEndgameState(state).emergency,bossId=battle?.specialBossId,floor=state.player?.currentFloor||1,key=battle?.battleId?String(battle.battleId):null;if(key&&end.processedBattleResults[key])return false;if(key){end.processedBattleResults[key]=won?"win":"loss";const keys=Object.keys(end.processedBattleResults);for(const old of keys.slice(0,Math.max(0,keys.length-100)))delete end.processedBattleResults[old]}end.encounters++;won?end.wins++:end.losses++;end.lastFloor=floor;if(hasCleared1000(state)&&floor>1000){end.rescue.post1000Encounters++;end.rescue.consecutiveLosses=won?0:Math.min(5,end.rescue.consecutiveLosses+1);end.rescue.lastResult=won?"win":"loss";}if(bossId){const r=end.records[bossId]??={encounters:0,wins:0,losses:0,highestPower:0,firstFloor:null,firstVictoryFloor:null,bestRemainingHpPercent:100,totalFragments:0};r.encounters++;won?r.wins++:r.losses++;r.highestPower=Math.max(r.highestPower,battle.powerPercent||0);r.firstFloor??=end.lastFloor;if(won)r.firstVictoryFloor??=end.lastFloor;const leader=battle.enemies?.find(x=>x.endgameBossId===bossId),remaining=leader?.maxHp?Math.max(0,Math.round((leader.hp/leader.maxHp)*100)):won?0:100;r.bestRemainingHpPercent=Math.min(r.bestRemainingHpPercent??100,remaining);end.records[bossId]=r;if(won&&ENDGAME_BOSSES[bossId]?.faction==="tenGod")end.blessings[bossId]=true}return true}
