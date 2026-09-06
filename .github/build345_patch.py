from pathlib import Path
import re


def replace_once(path, old, new):
    p = Path(path)
    s = p.read_text(encoding="utf-8")
    if old not in s:
        raise SystemExit(f"missing marker in {path}: {old[:120]}")
    p.write_text(s.replace(old, new, 1), encoding="utf-8")


def regex_once(path, pattern, repl):
    p = Path(path)
    s = p.read_text(encoding="utf-8")
    out, n = re.subn(pattern, repl, s, count=1, flags=re.S)
    if n != 1:
        raise SystemExit(f"regex marker count {n} in {path}: {pattern[:100]}")
    p.write_text(out, encoding="utf-8")


# Version and Safari cache refresh.
replace_once("src/core/config.js", 'export const APP_VERSION="3.1.23";', 'export const APP_VERSION="3.1.25";')
replace_once("index.html", 'const ASSET_VERSION = "3.1.23";', 'const ASSET_VERSION = "3.1.25";')
replace_once("index.html", 'const ASSET_BUILD = "build342";', 'const ASSET_BUILD = "build345";')
index = Path("index.html")
s = index.read_text(encoding="utf-8")
marker = '  <link rel="stylesheet" href="./src/Styles/build339-party-boss-art.css?v=3.1.20-build339" />\n'
link = '  <link rel="stylesheet" href="./src/Styles/build345-balance-ui.css?v=3.1.25-build345" />\n'
if link not in s:
    if marker not in s:
        raise SystemExit("latest CSS marker missing")
    s = s.replace(marker, marker + link, 1)
index.write_text(s, encoding="utf-8")

# Cache keys for changed modules.
main_replacements = {
    'from"./core/config.js?v=3.1.23-build342";': 'from"./core/config.js?v=3.1.25-build345";',
    'from"./ui/screens/FormationScreen.js?v=3.1.19-build338";': 'from"./ui/screens/FormationScreen.js?v=3.1.25-build345";',
    'from"./ui/screens/BattleScreen.js?v=3.1.20-build339";': 'from"./ui/screens/BattleScreen.js?v=3.1.25-build345";',
    'from"./core/EnemyScalingSystem.js?v=3.1.19-build338";': 'from"./core/EnemyScalingSystem.js?v=3.1.25-build345";',
    'from"./core/CampaignStorySystem.js?v=3.1.21-build340";': 'from"./core/CampaignStorySystem.js?v=3.1.25-build345";',
    'from"./core/CampaignHeroEncounterSystem.js?v=3.1.22-build341";': 'from"./core/CampaignHeroEncounterSystem.js?v=3.1.25-build345";',
    'from"./core/CampaignHeroBranchStorySystem.js?v=3.1.22-build341";': 'from"./core/CampaignHeroBranchStorySystem.js?v=3.1.25-build345";',
}
for old, new in main_replacements.items():
    replace_once("src/main.js", old, new)
replace_once("src/ui/screens/HomeScreen.js", 'from"../../core/CampaignHeroEncounterSystem.js?v=3.1.22-build341";', 'from"../../core/CampaignHeroEncounterSystem.js?v=3.1.25-build345";')
replace_once("src/services/SaveService.js", 'from"../core/CampaignHeroEncounterSystem.js?v=3.1.22-build341";', 'from"../core/CampaignHeroEncounterSystem.js?v=3.1.25-build345";')
replace_once("src/core/CampaignHeroBranchStorySystem.js", 'from"./CampaignHeroEncounterSystem.js?v=3.1.22-build341";', 'from"./CampaignHeroEncounterSystem.js?v=3.1.25-build345";')

# Hero party: Level 1500. Extra campaign-only pressure keeps the quartet above the 100F Ten Gods.
replace_once(
    "src/core/CampaignHeroEncounterSystem.js",
    "export const CAMPAIGN_HERO_FINAL_LEVEL=1000;",
    "export const CAMPAIGN_HERO_FINAL_LEVEL=1500;\nexport const CAMPAIGN_HERO_STAT_MULTIPLIER=1.30;\nexport const CAMPAIGN_HERO_HP_MULTIPLIER=1.45;",
)
old_import = 'import{CAMPAIGN_HERO_IDS,CAMPAIGN_HERO_PROFILES,normalizeCampaignHeroInvasion,scheduledCampaignHeroForFloor,beginCampaignHeroFieldEncounter,recordCampaignHeroWound,settleCampaignHeroEncounter,campaignRemainingHeroes,advanceCampaignRewindFloor}from"./core/CampaignHeroEncounterSystem.js?v=3.1.25-build345";'
new_import = 'import{CAMPAIGN_HERO_IDS,CAMPAIGN_HERO_PROFILES,CAMPAIGN_HERO_STAT_MULTIPLIER,CAMPAIGN_HERO_HP_MULTIPLIER,normalizeCampaignHeroInvasion,scheduledCampaignHeroForFloor,beginCampaignHeroFieldEncounter,recordCampaignHeroWound,settleCampaignHeroEncounter,campaignRemainingHeroes,advanceCampaignRewindFloor}from"./core/CampaignHeroEncounterSystem.js?v=3.1.25-build345";'
replace_once("src/main.js", old_import, new_import)
replace_once("src/main.js", 'level:CAMPAIGN_HERO_PROFILES[heroId]?.fixedLevel??1000,boss:true', 'level:CAMPAIGN_HERO_PROFILES[heroId]?.fixedLevel??1500,boss:true')
replace_once(
    "src/main.js",
    "statMultiplier:campaignReincarnationDifficultyMultiplier(save.state),fixedTrialScaling:true,carryHpRate",
    "statMultiplier:campaignReincarnationDifficultyMultiplier(save.state)*CAMPAIGN_HERO_STAT_MULTIPLIER,fixedTrialScaling:true,fixedTrialHpMultiplier:CAMPAIGN_HERO_HP_MULTIPLIER,carryHpRate",
)

# General enemy balance: no player-power auto-scaling; stronger floor-based baseline and earlier enemy equipment.
replace_once(
    "src/core/EnemyScalingSystem.js",
    'export function enemyRankStatMultiplier(rank){return({N:1,R:1.015,SR:1.03,SSR:1.05,UR:1.08,LR:1.12})[rank]??1}',
    'export function enemyRankStatMultiplier(rank){return({N:1.05,R:1.08,SR:1.12,SSR:1.18,UR:1.26,LR:1.36})[rank]??1}',
)
regex_once(
    "src/core/EnemyScalingSystem.js",
    r"export function equipmentHolderRateForFloor\(floor\)\{.*?\n\}",
    """export function equipmentHolderRateForFloor(floor){
 const f=safeFloor(floor);
 if(f<8)return 0;if(f<20)return .08;if(f<50)return .20;if(f<100)return .38;if(f<200)return .52;if(f<500)return .66;
 if(f<1000)return .76;if(f<2000)return .84;if(f<5000)return .90;return .94;
}""",
)
regex_once(
    "src/core/EnemyScalingSystem.js",
    r"export function equipmentSlotsForFloor\(floor\)\{.*?\n\}",
    """export function equipmentSlotsForFloor(floor){
 const f=safeFloor(floor);
 if(f<8)return 0;if(f<20)return 1;if(f<50)return 2;if(f<100)return 3;if(f<200)return 4;if(f<500)return 5;return 6;
}""",
)
regex_once(
    "src/core/EnemyScalingSystem.js",
    r"export function enemyHiddenProfileForFloor\(floor,\{rank=\"N\",faction=null,boss=false,equipped=false,slots=null,gearLevel=null,rarity=null,roll=Math\.random\(\)\}=\{\}\)\{.*?\n\}\n\nexport function post9000DepthProfile",
    """export function enemyHiddenProfileForFloor(floor,{rank=\"N\",faction=null,boss=false,equipped=false,slots=null,gearLevel=null,rarity=null,roll=Math.random()}={}){
 const f=safeFloor(floor),pressure=Math.min(1,Math.pow(Math.min(f,100)/100,.72)),slotCount=Math.max(0,Math.min(6,Math.floor(Number(slots??equipmentSlotsForFloor(f))||0))),hasLoadout=Boolean(equipped&&slotCount>0);
 const baseCrit=Math.min(.18,.045+pressure*.035),baseStatus=Math.min(.24,pressure*.10),baseAi=Math.round(22+pressure*34);
 if(!hasLoadout)return{active:true,floor:f,slots:0,gearLevel:0,rarity:null,socketGrade:null,hp:1.18+pressure*.42,atk:1.10+pressure*.25,def:1.14+pressure*.32,spd:1+pressure*.035,damageTaken:Math.max(.86,.96-pressure*.08),crit:baseCrit,mastery:Math.floor(f*.05),ai:baseAi,statusResist:baseStatus,capturePressure:1+pressure*.08};
 const resolvedRank=faction??rank,resolvedLevel=Math.max(1,Math.floor(Number(gearLevel)||enemyEquipmentLevelForFloor(f,{rank:resolvedRank,boss}))),slotRate=slotCount/6,bossRate=boss?.06:0,factionRate=resolvedRank===\"tenGod\"?.16:resolvedRank===\"abyss\"?.10:0;
 return{
  active:true,floor:f,slots:slotCount,gearLevel:resolvedLevel,rarity:rarity??rollEnemyEquipmentRarity(f,rank,roll),socketGrade:1+Math.floor(pressure*9),socketRarity:null,affixGrade:1+Math.floor(pressure*7),mastery:Math.floor(f*.10),ai:Math.round(baseAi+slotRate*30+factionRate*60),
  hp:1.18+pressure*.42+slotRate*.22+bossRate+factionRate,atk:1.10+pressure*.25+slotRate*.16+bossRate+factionRate,def:1.14+pressure*.32+slotRate*.20+bossRate+factionRate,spd:1+pressure*.035+slotRate*.04,
  damageTaken:Math.max(.74,.96-pressure*.08-slotRate*.08-factionRate*.18),crit:Math.min(.30,baseCrit+slotRate*.04+factionRate*.08),statusResist:Math.min(.55,baseStatus+slotRate*.08+factionRate*.25),capturePressure:1+pressure*.12
 };
}

export function post9000DepthProfile""",
)

# Skill menu: top-right close button remains visible above Safari browser chrome.
battle = Path("src/ui/screens/BattleScreen.js")
s = battle.read_text(encoding="utf-8")
old = 'return `<section class="battle-skill-panel-v317"><header><span><small>SKILL COMMAND</small><b>スキルを選択</b></span><em>MP ${battleInteger(actor.currentMp)} / ${battleInteger(unitMaxMp(actor))}</em></header><div class="skill-command-list battle-skill-command-list-v317">${rows}</div><button id="closeSkillMenu" class="battle-skill-close secondary">戻る</button></section>`;'
new = 'return `<section class="battle-skill-panel-v317"><header><span><small>SKILL COMMAND</small><b>スキルを選択</b></span><em>MP ${battleInteger(actor.currentMp)} / ${battleInteger(unitMaxMp(actor))}</em><button type="button" id="closeSkillMenu" class="battle-skill-close-top" aria-label="スキル一覧を閉じる">×</button></header><div class="skill-command-list battle-skill-command-list-v317">${rows}</div></section>`;'
if old not in s:
    raise SystemExit("BattleScreen skill panel marker missing")
battle.write_text(s.replace(old, new, 1), encoding="utf-8")

# Hero dialogue: comedy-first, remove sentimental homecoming language.
branch = Path("src/core/CampaignHeroBranchStorySystem.js")
s = branch.read_text(encoding="utf-8")
replacements = {
    'line("myth_hide","重量配分が変わる。だが……ありがとう。帰り道の分まであるのか。","quiet")': 'line("myth_hide","いやいやいや笑、食料まで入ってる。計算表にない荷物が一番役立ちそうです。","normal")',
    'line("myth_enami","計算どおり行かへん時もあるやろ。そういう時は、帰ってきてから考えよ。","normal")': 'line("myth_enami","計算外れたら帰ってきて会議な。議題は『ひで、また何忘れた？』で。","teasing")',
    '"イージー！！ ……って、僕は留守番やったな。おかえり。"': '"イージー！！ ……って、僕留守番やったわ。何もしてへんのに勝った顔しとこ。"',
    '"勝って、無傷で帰ったんやな。ほな今日は安心して話を聞けるわ。"': '"無傷やん。なんやコイツ。僕の心配した時間、返して。塩で。"',
    '"戻ってきたならええ。次は四人で話を終わらせる。"': '"戻ったな。次は四人で行こ。単独行動、会議で満場一致の廃止です。"',
    '"戻ってきたならええ。次は残った仲間で、話を終わらせる。"': '"戻ったな。残ったメンバーで作戦会議。まず勝手に出発する人を議題にする。"',
}
for old, new in replacements.items():
    if old not in s:
        raise SystemExit(f"branch dialogue marker missing: {old[:80]}")
    s = s.replace(old, new, 1)
pattern = r' const campWords=outcome==="repelled"\?\{.*?\n const returnedWords=\{.*?\};\n for\(let turn=0;turn<2;turn\)for\(const id of castIds\)dialogue\.push\(line\(id,outcome!=="repelled"&&id===heroId\?returnedWords\[id\]\[turn\]:campWords\[id\]\[turn\],outcome==="repelled"\?"serious":"gentle"\)\);'
repl = ''' const campWords=outcome==="repelled"?{
  myth_enami:["なんやコイツ。人数減ったら会議まで静かになるやん。静かすぎて逆に腹立つ。","次から単独行動禁止。破ったら塩抜き。僕も困るけど、それくらいの罰で。"],
  myth_yori:["ディフィカルト。偵察の意味を『殴って帰る』から『帰って報告する』に直すわ。","一人減った分、僕が二人分しゃべる。うるさい？ 知らん、イージー！！"],
  myth_hide:["計算上、一人減ると戦力が下がります。……いやいやいや笑、今さら気づく式ではない。","次の作戦は完璧です。『大事な前提を忘れない』を一番上に書きました。"],
  myth_rion:["損失って言葉、今日は使用禁止。代わりに『単独行動保証金1000万G』でいこう。","単独行動保険を作る。加入条件は『単独行動しない』。最高やな。"]
 }:{
  myth_enami:["まず座り。感動ちゃうで、立ったまま報告されたら首しんどい。","塩ください。報告はそのあと。優先順位は明確や。"],
  myth_yori:["おっと〜！？ 生きとるやん！ ほなイージー！！","帰還祝い？ まず酒。いや水でもええ、コップ大きいやつ。"],
  myth_hide:["帰還確認。フォー！！！！ 予定より三時間遅いです。","いいゾ〜！コレ〜！ 記録は完璧。字だけ僕にも読めません。"],
  myth_rion:["おつかれナス。情報は黒字、治療費で赤字。トータル気分で黒字。","今日は豪遊するぞ！ 予算ないから水を高そうなグラスで飲もう。"]
 };
 const returnedWords={
  myth_enami:["戻ったで。まず塩ください。話はそれから。","なんやコイツ、思ったより強かった。あと帰り道でラーメン屋見つけた。"],
  myth_yori:["ただいま！ イージー！！ ……いや普通にボコられたわ。","おっと〜！？ 次は勝つ。とりあえず一杯だけ。"],
  myth_hide:["帰還しました。計算どおりです。……到着時刻以外は。","フォー！！！！ 記録はあります。食料の残数だけ計算してません。"],
  myth_rion:["ただいま。情報も僕も回収済み。治療費だけ未回収。","やったぜ！ 次は逃げ道に広告枠つけて元取るよ。"]};
 for(let turn=0;turn<2;turn++)for(const id of castIds)dialogue.push(line(id,outcome!=="repelled"&&id===heroId?returnedWords[id][turn]:campWords[id][turn],outcome==="repelled"?"normal":"teasing"));'''
s, n = re.subn(pattern, repl, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit(f"camp/return dialogue block marker count={n}")
solo_old = 'const words={myth_enami:"ただいま。……聞く相手がおらんくても、戻ったって言うとく。約束したからな。",myth_yori:"ただいま。今日は大声出すの、やめとこ。まず火を起こして、報告を残すわ。",myth_hide:"帰還時刻を記録する。報告を聞く者はいない。それでも、この欄は空けない。",myth_rion:"帰還。情報も荷物も持ち帰ったよ。記録だけは、僕がちゃんと続ける。"};'
solo_new = 'const words={myth_enami:"ただいま。誰もおらん。なんやコイツ。独り言まで僕担当なん？ 塩ください。",myth_yori:"ただいま！ 誰もおらんけどイージー！！ ……返事ないとちょっと滑ったな。",myth_hide:"帰還しました。報告相手0名。フォー！！！！ ……ログだけ残します。",myth_rion:"帰還。観客0人。赤字イベントやな。また今度やな。"};'
if solo_old not in s:
    raise SystemExit("solo aftermath marker missing")
s = s.replace(solo_old, solo_new, 1)
branch.write_text(s, encoding="utf-8")

# A few main-story earnest lines converted to dry banter.
story = Path("src/core/CampaignStorySystem.js")
s = story.read_text(encoding="utf-8")
story_replacements = {
    'line("myth_rion","予約販売した地図の見本布を全部結ぶ。売り物は作り直せる。人は作り直せない。","serious")': 'line("myth_rion","予約販売した地図の見本布、全部ロープにする。ひで海に落としたら再発行できへんし、その方が安い。","normal")',
    'line("myth_enami","まかセロリ。急にええ話するやん。儲け話より説得力あるで。","teasing")': 'line("myth_enami","まかセロリ。結局コスト計算なんかい。急に感動しかけた僕の時間返して。","teasing")',
    'line("myth_rion","損じゃないよ。四人で帰って、続編を売るための投資だ。","confident")': 'line("myth_rion","損じゃないよ。四人そろってた方が続編を四冊売れる。最高やな。","confident")',
}
for old, new in story_replacements.items():
    if old not in s:
        raise SystemExit(f"story dialogue marker missing: {old[:80]}")
    s = s.replace(old, new, 1)
story.write_text(s, encoding="utf-8")

# Cumulative Build344 formation change.
formation = Path("src/ui/screens/FormationScreen.js")
s = formation.read_text(encoding="utf-8")
old = '''   <button type="button" class="formation-circle-card ${circle.id==="none"?"empty":""}" data-formation-circle="${monster.id}" aria-label="${circleLabel}を装備管理で開く">
    <span>${circle.id==="none"?"◇":`<img src="${circle.asset}" alt="">`}</span><b>${circle.name}</b><small>${circle.level?`Lv.${circle.level}・`:""}タップで変更</small><i>›</i>
   </button>'''
new = '''   <button type="button" class="formation-circle-card ${circle.id==="none"?"empty":""}" data-formation-circle="${monster.id}" aria-label="${circleLabel}を装備管理で開く">
    <span class="formation-circle-art">${circle.id==="none"?"◇":`<img src="${circle.asset}" alt="">`}</span>${circle.level?`<small class="formation-circle-level">Lv.${circle.level}</small>`:""}<i aria-hidden="true">›</i>
   </button>'''
if old not in s:
    raise SystemExit("formation circle marker missing")
formation.write_text(s.replace(old, new, 1), encoding="utf-8")

css = r'''/* ABYSS DOMINION v3.1.25 / Build345 */
.formation-screen .formation-loadout{max-height:none!important;height:auto!important;overflow:visible!important;padding:6px!important;margin:5px 4px 4px!important}
.formation-screen .formation-loadout>summary{min-height:0!important;margin:0 0 5px!important;padding:0!important;pointer-events:none;list-style:none;font-size:11px!important;line-height:1.15!important}
.formation-screen .formation-loadout>summary small{display:none!important}
.formation-screen .formation-gear-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:repeat(3,42px)!important;gap:4px!important;height:auto!important;max-height:none!important;overflow:visible!important}
.formation-screen .formation-gear-slot{box-sizing:border-box!important;min-width:0!important;width:100%!important;min-height:42px!important;height:42px!important;padding:4px 3px!important;overflow:hidden!important;border-radius:3px!important;line-height:1.05!important}
.formation-screen .formation-gear-slot small,.formation-screen .formation-gear-slot b,.formation-screen .formation-gear-slot em{display:block!important;min-width:0!important;max-width:100%!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
.formation-screen .formation-gear-slot small{font-size:8px!important}.formation-screen .formation-gear-slot b{font-size:9px!important;margin-top:2px!important}.formation-screen .formation-gear-slot em{font-size:7px!important;margin-top:2px!important;opacity:.76!important}.formation-screen .formation-gear-slot .equipment-socket-summary{display:none!important}
.formation-screen .formation-circle-section{box-sizing:border-box!important;margin:4px!important;padding:5px!important;min-height:0!important;height:auto!important;background:linear-gradient(180deg,rgba(13,11,14,.98),rgba(7,6,8,.99))!important;border:1px solid rgba(151,112,58,.62)!important}
.formation-screen .formation-circle-section h3{margin:0 0 3px!important;font-size:10px!important;line-height:1.1!important;color:#dfc48c!important}
.formation-screen .formation-circle-card{position:relative!important;box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:72px!important;min-height:72px!important;padding:4px 20px 4px 4px!important;overflow:hidden!important;border-radius:7px!important;border:1px solid rgba(181,137,68,.78)!important;background:radial-gradient(circle at 50% 45%,rgba(113,76,31,.16),transparent 55%),linear-gradient(180deg,#151116,#09080a)!important}
.formation-screen .formation-circle-card>.formation-circle-art{position:relative!important;display:flex!important;align-items:center!important;justify-content:center!important;width:64px!important;height:64px!important;flex:0 0 64px!important;margin:0 auto!important;color:#c7a25c!important;font-size:28px!important}
.formation-screen .formation-circle-card>.formation-circle-art img{display:block!important;width:62px!important;height:62px!important;max-width:62px!important;max-height:62px!important;object-fit:contain!important}
.formation-screen .formation-circle-card>.formation-circle-level{position:absolute!important;left:50%!important;bottom:4px!important;z-index:3!important;transform:translateX(-50%)!important;display:block!important;margin:0!important;padding:1px 5px 2px!important;border:1px solid rgba(184,140,70,.54)!important;border-radius:999px!important;background:rgba(5,5,6,.82)!important;color:#f1d18f!important;font-size:9px!important;font-weight:700!important;line-height:1.15!important;white-space:nowrap!important;text-shadow:0 1px 2px #000!important}
.formation-screen .formation-circle-card>b,.formation-screen .formation-circle-card>small:not(.formation-circle-level){display:none!important}.formation-screen .formation-circle-card>i{position:absolute!important;right:7px!important;top:50%!important;transform:translateY(-50%)!important;color:#d7b469!important;font-size:22px!important}
body:has(.formation-screen) .game-modal{background:rgba(3,3,5,.84)!important;-webkit-backdrop-filter:blur(4px)!important;backdrop-filter:blur(4px)!important}
body:has(.formation-screen) .game-modal-card{border:1px solid rgba(178,132,65,.9)!important;border-radius:9px!important;background:linear-gradient(180deg,rgba(27,21,17,.99),rgba(8,8,10,.995))!important;color:#f2eadb!important}
body:has(.formation-screen) .game-modal-card h2{color:#e6c681!important}body:has(.formation-screen) .game-modal-card .game-modal-body button{border-color:rgba(150,112,61,.72)!important;background:linear-gradient(180deg,rgba(28,25,24,.96),rgba(11,10,11,.98))!important;color:#efe5d2!important}
.battle-skill-panel-v317{grid-template-rows:auto minmax(0,1fr)!important;max-height:min(39dvh,410px)!important;padding-bottom:max(8px,env(safe-area-inset-bottom))!important}
.battle-skill-panel-v317>header{position:sticky!important;top:0!important;z-index:6!important;display:grid!important;grid-template-columns:minmax(0,1fr) auto 38px!important;align-items:center!important;gap:7px!important;padding:3px 3px 8px!important;background:linear-gradient(180deg,#151310,#0b0b0d)!important}
.battle-skill-close-top{box-sizing:border-box!important;width:36px!important;height:36px!important;min-width:36px!important;min-height:36px!important;padding:0!important;border:1px solid #9c7738!important;border-radius:3px!important;background:#09090c!important;color:#f0d79b!important;font-size:22px!important;font-weight:900!important;line-height:1!important;touch-action:manipulation!important}
.skill-command-list.battle-skill-command-list-v317{min-height:0!important;max-height:none!important;overflow-y:auto!important;padding:0 2px max(12px,env(safe-area-inset-bottom)) 0!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important}
@media(max-width:520px){.formation-screen .formation-gear-grid{grid-template-rows:repeat(3,40px)!important}.formation-screen .formation-gear-slot{height:40px!important;min-height:40px!important}.formation-screen .formation-circle-card{height:68px!important;min-height:68px!important}.formation-screen .formation-circle-card>.formation-circle-art{width:60px!important;height:60px!important;flex-basis:60px!important}.formation-screen .formation-circle-card>.formation-circle-art img{width:58px!important;height:58px!important;max-width:58px!important;max-height:58px!important}.battle-skill-panel-v317{max-height:37dvh!important}}
@media(max-height:760px){.battle-skill-panel-v317{max-height:34dvh!important}.battle-skill-close-top{width:34px!important;height:34px!important;min-width:34px!important;min-height:34px!important}}
'''
Path("src/Styles/build345-balance-ui.css").write_text(css, encoding="utf-8")

readme = '''ABYSS DOMINION v3.1.25 / Build345 差し替え

今回の修正
- 勇者一行4人（えなみ・より・ひで・りおん）を遭遇戦／最終決戦ともLv.1500へ強化
- 勇者戦専用で全能力1.30倍、HP1.45倍。100階の十神4体より上の最終壁を狙った調整
- 既存の4人「無敵」共鳴、固有AI、傷の永久引継ぎは維持
- 通常敵の階層ベース補正、装備率、装備枠を強化。プレイヤー戦力への自動追従は行わない
- 勇者戦のスキル一覧に上部固定の×を追加し、iPhone Safariでも確実に閉じられるよう修正
- 勇者4人の帰還／戦後会話を感動寄りから笑い・口癖・ツッコミ中心へ変更
- Build344の編成UI（装備6枠常時表示／魔法陣画像＋Lv／黒金モーダル）も累積収録

オンライン接続認証・オンラインサーバーURL・セーブ形式は変更していません。

差し替え方法
ZIPの中身をGitHub Desktop管理中の abyss-dominion-remake フォルダ直下へ上書きしてください。
'''
Path("README_BUILD345_HERO_BALANCE.txt").write_text(readme, encoding="utf-8")
