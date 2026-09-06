from pathlib import Path


def replace_once(path, old, new):
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"expected text not found in {path}: {old[:120]!r}")
    p.write_text(text.replace(old, new, 1), encoding="utf-8")


# Lv1000へ戻す。既存の勇者戦専用1.30倍、HP1.45倍、傷引継ぎは触らない。
replace_once(
    "src/core/CampaignHeroEncounterSystem.js",
    "export const CAMPAIGN_HERO_FINAL_LEVEL=1500;",
    "export const CAMPAIGN_HERO_FINAL_LEVEL=1000;",
)

# 既存スキルIDを一切変えず、4人の16スキルを連携前提へ再調整。
Path("src/data/mythicSerialSpecies.js").write_text(
    r'''const unlock=value=>({type:"level",value});
const skill=(id,name,{level=1,mp=8,type="attack",power=1.5,target="敵単体",description="",...extra}={})=>({
  id,name,unlock:unlock(level),mp,type,power,target,description,...extra
});

function mythic({id,name,element,role,maxMp,stats,skills}){
  return Object.freeze({
    id,name,emoji:"✦",element,race:"human",role,rarity:"神話",minFloor:Number.MAX_SAFE_INTEGER,
    maxMp,captureRate:0,fieldEncounter:false,serialOnly:true,gachaExcluded:true,
    acquisition:["専用シリアルコード限定"],growth:{hp:1,atk:1,def:1,spd:1},baseStats:stats,
    rankNames:[name,`${name}・覚醒`,`${name}・神話`,`${name}・極`],skills:[skills[0]],authoredSkills:skills,
    tags:["mythicSerial","invincibleAlliance"]
  });
}

export const MYTHIC_SERIAL_SPECIES=Object.freeze({
  myth_enami:mythic({
    id:"myth_enami",name:"えなみ",element:"fire",role:"support",maxMp:155,
    stats:{hp:380,atk:195,def:215,spd:108,crit:22,evasion:23},
    skills:[
      skill("enami_world_create","メンタル！！",{mp:11,power:1.65,allEnemies:true,target:"敵全体",damageClass:"magic",effects:[{kind:"defDown",value:.22,turns:3,enemy:true},{kind:"vulnerable",value:.12,turns:3,enemy:true}],description:"敵陣全体の守りと立て直しを同時に崩し、後続の一撃が通る状況を作る。"}),
      skill("enami_spicy_casino","塩ください・777",{level:20,mp:14,type:"multiAttack",power:1.05,hits:3,defenseIgnore:.18,effects:[{kind:"healDown",value:.28,turns:3,enemy:true}],description:"三連撃で回復の起点を潰す。より・ひでの追撃前に使うほど厄介。"}),
      skill("enami_hyper_focus","まかセロリ",{level:45,mp:18,type:"buff",power:0,target:"味方全体",partyShieldRate:.25,effects:[{kind:"atkUp",value:.28,turns:3,allies:true},{kind:"defUp",value:.34,turns:3,allies:true},{kind:"spdUp",value:.12,turns:3,allies:true}],description:"味方全体へ最大HP25%分のシールドを配り、攻撃・防御・速度をまとめて底上げする。"}),
      skill("enami_genesis","おいおい！そんなもんか？！",{level:80,mp:36,power:3.6,allEnemies:true,target:"敵全体",damageClass:"magic",defenseIgnore:.2,cooldown:4,effects:[{kind:"vulnerable",value:.18,turns:2,enemy:true}],description:"敵全体を大きく削り、さらに被ダメージを増幅して勇者一行の決定打へつなぐ。"})
    ]
  }),
  myth_rion:mythic({
    id:"myth_rion",name:"りおん",element:"nature",role:"support",maxMp:165,
    stats:{hp:405,atk:180,def:220,spd:122,crit:18,evasion:24},
    skills:[
      skill("rion_talk","いこうぜ！",{mp:8,power:1.2,damageClass:"magic",effects:[{kind:"defDown",value:.24,turns:3,enemy:true},{kind:"spdDown",value:.22,turns:3,enemy:true}],description:"最速で相手の守りと行動速度を落とし、勇者一行の連携を始動させる。"}),
      skill("rion_arrange","最高やな",{level:20,mp:13,type:"buff",power:0,target:"味方全体",effects:[{kind:"atkUp",value:.26,turns:3,allies:true},{kind:"defUp",value:.22,turns:3,allies:true},{kind:"spdUp",value:.38,turns:3,allies:true}],description:"全員の行動を一気に整える。特に速度上昇が大きく、4人揃うほど手数が止まらなくなる。"}),
      skill("rion_therapy","また今度やな",{level:45,mp:18,type:"allHeal",power:0,heal:.44,target:"味方全体",cleanse:true,effects:[{kind:"spdUp",value:.15,turns:2,allies:true}],description:"味方全体を回復・浄化し、そのまま次の行動へつなげる。"}),
      skill("rion_community","今日は豪遊するぞ！",{level:80,mp:30,mpRate:.58,type:"revive",power:0,revive:.38,reviveMp:.14,target:"戦闘不能の味方1体",cooldown:5,description:"戦闘不能の仲間をHP38%・MP14%で復帰させ、崩したはずの連携を再始動させる。"})
    ]
  }),
  myth_yori:mythic({
    id:"myth_yori",name:"より",element:"water",role:"burst",maxMp:112,
    stats:{hp:410,atk:278,def:212,spd:106,crit:30,evasion:16},
    skills:[
      skill("yori_rifle","イージー！！",{mp:7,power:2.2,defenseIgnore:.32,bonusVsEffect:{kind:"defDown",multiplier:1.28},description:"防御低下中の相手へ威力が跳ね上がる単体物理。味方が崩した敵を迷わず殴り抜く。"}),
      skill("yori_beautiful","ビューティフォー！",{level:20,mp:11,type:"buff",power:0,target:"自分",effects:[{kind:"atkUp",value:.62,turns:3},{kind:"defUp",value:.18,turns:3},{kind:"spdUp",value:.18,turns:3}],description:"自身の火力と速度を引き上げ、フィニッシャーとしての圧を最大化する。"}),
      skill("yori_tetrapod","開けんかいコラァ！",{level:45,mp:20,power:2.5,allEnemies:true,target:"敵全体",defenseIgnore:.28,bonusVsEffect:{kind:"vulnerable",multiplier:1.2},noLifeSteal:true,description:"弱体化された敵陣へ防御無視の全体物理を叩き込む。"}),
      skill("yori_difficult","ディフィカルト・暴走",{level:80,mp:34,type:"multiAttack",power:1.38,hits:5,defenseIgnore:.45,bonusVsEffect:{kind:"vulnerable",multiplier:1.35},cooldown:4,description:"被ダメージ増加中の標的へ五連撃を集中させる最終打。連携後は極端に危険。"})
    ]
  }),
  myth_hide:mythic({
    id:"myth_hide",name:"ひで",element:"dark",role:"magic",maxMp:118,
    stats:{hp:440,atk:292,def:226,spd:94,crit:26,evasion:14},
    skills:[
      skill("hide_crayfish","フォー！！！！",{mp:9,power:1.55,allEnemies:true,target:"敵全体",damageClass:"magic",effects:[{kind:"accuracyDown",value:.14,turns:3,enemy:true}],description:"全体魔法で命中を崩し、相手の反撃精度を落とす。"}),
      skill("hide_hunt","待ってくださいよ〜！",{level:20,mp:12,power:1.75,damageClass:"magic",effects:[{kind:"defDown",value:.25,turns:3,enemy:true},{kind:"evasionDown",value:.18,turns:3,enemy:true}],description:"危険な相手を解析し、防御と回避を同時に崩す。"}),
      skill("hide_gourmet","いいんすか！！",{level:45,mp:18,type:"allHeal",power:0,heal:.3,target:"味方全体",effects:[{kind:"atkUp",value:.32,turns:3,allies:true},{kind:"spdUp",value:.1,turns:3,allies:true}],description:"味方全体を立て直しながら攻撃と速度を上げる。"}),
      skill("hide_master_claw","計算外・零点崩壊",{level:80,mp:36,power:3.9,allEnemies:true,target:"敵全体",damageClass:"magic",defenseIgnore:.25,bonusVsEffect:{kind:"defDown",multiplier:1.35},cooldown:4,description:"防御低下中の敵へ威力が大きく上がる全体魔法。えなみ・りおんの崩しから直結する。"})
    ]
  })
});

export const MYTHIC_SERIAL_IDS=Object.freeze(Object.keys(MYTHIC_SERIAL_SPECIES));
''',
    encoding="utf-8",
)

# 既存EnemyAIのcampaignHeroActionだけを強化。新しいAIエンジンや状態機械は増やさない。
enemy_ai_path = Path("src/battle/EnemyAI.js")
enemy_ai = enemy_ai_path.read_text(encoding="utf-8")
ai_start = enemy_ai.index("function campaignHeroAction(enemy,context,hpRate){")
ai_end = enemy_ai.index("function teamBattleAction(enemy,context,hpRate){", ai_start)
new_ai = r'''function campaignHeroAction(enemy,context,hpRate){
 const hero=String(enemy.campaignHeroId??""),allies=(context.allies??[enemy]).filter(Boolean),opponents=(context.opponents??[]).filter(unit=>(unit.currentHp??0)>0),turn=Math.max(1,Number(context.battle?.turn)||1),wounded=allies.filter(unit=>unit.hp>0).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0],fallen=allies.find(unit=>unit.hp<=0),battle=context.battle??{};
 const positiveKinds=new Set(["atkUp","defUp","spdUp","regen","taunt","guard","counter","lifeSteal"]),negativeKinds=new Set(["atkDown","defDown","spdDown","accuracyDown","evasionDown","vulnerable","healDown","mpRecoveryDown"]);
 const buffed=opponents.some(unit=>(battle.allyEffects?.[unit.id]??[]).some(effect=>positiveKinds.has(effect.kind))),exposed=opponents.some(unit=>(battle.allyEffects?.[unit.id]??[]).some(effect=>negativeKinds.has(effect.kind))||(battle.allyAilments?.[unit.id]??[]).length>0),pressured=opponents.some(unit=>unit.currentHp/Math.max(1,unit.maxHp??unit.currentHp)<.45),livingHeroes=allies.filter(unit=>unit.hp>0).length;
 if(hero==="myth_yori"){
  enemy.campaignHeroTargetMode="weak";
  if(exposed&&(pressured||turn%2===0)){enemy.charging=false;enemy.intent="仲間が崩した標的へ『イージー！！』";return ENEMY_ACTIONS.power}
  if(enemy.charging){enemy.charging=false;enemy.intent="観察した急所へ拳を叩き込む";return ENEMY_ACTIONS.power}
  if(turn%3===0&&canPay(enemy,ENEMY_ACTIONS.galeRend)){enemy.intent="『開けんかいコラァ！』で戦列を打ち抜く";return ENEMY_ACTIONS.galeRend}
  enemy.charging=true;enemy.intent="『ディフィカルト』へ踏み込む";return ENEMY_ACTIONS.charge
 }
 if(hero==="myth_hide"){
  enemy.campaignHeroTargetMode="threat";
  if(buffed&&canPay(enemy,ENEMY_ACTIONS.dispelWave)){enemy.intent="強化の構造を解析して崩す";return ENEMY_ACTIONS.dispelWave}
  if(exposed&&canPay(enemy,ENEMY_ACTIONS.shadowCurse)){enemy.intent="崩れた標的へ『計算外・零点崩壊』を重ねる";return ENEMY_ACTIONS.shadowCurse}
  if(opponents.length>=2&&canPay(enemy,ENEMY_ACTIONS.thunderChain)){enemy.intent="『フォー！！！！』連鎖術式を放つ";return ENEMY_ACTIONS.thunderChain}
  if(canPay(enemy,ENEMY_ACTIONS.shadowCurse)){enemy.intent="最も危険な相手へ術式を固定";return ENEMY_ACTIONS.shadowCurse}
 }
 if(hero==="myth_enami"){
  enemy.campaignHeroTargetMode="threat";
  const allyUnderPressure=allies.some(unit=>unit!==enemy&&(unit.hp<=0||unit.hp/Math.max(1,unit.maxHp)<.7));
  if(fallen&&canPay(enemy,ENEMY_ACTIONS.packRevive)){enemy.intent="笑みを消し、倒れた仲間を引き戻す";return ENEMY_ACTIONS.packRevive}
  if(wounded&&wounded.hp/wounded.maxHp<.58&&canPay(enemy,ENEMY_ACTIONS.packMend)){enemy.intent="『まかセロリ』で戦線を立て直す";return ENEMY_ACTIONS.packMend}
  if(!enemy._campaignGuardedAllies&&livingHeroes>1&&canPay(enemy,ENEMY_ACTIONS.packRally)){enemy._campaignGuardedAllies=true;enemy.intent="全員を俯瞰して攻守を同期";return ENEMY_ACTIONS.packRally}
  if(buffed&&canPay(enemy,ENEMY_ACTIONS.dispelWave)){enemy.intent="『メンタル！！』で強化ごと崩す";return ENEMY_ACTIONS.dispelWave}
  if((allyUnderPressure||exposed)&&canPay(enemy,ENEMY_ACTIONS.radiantVolley)){enemy.intent="崩れた敵陣をまとめて射抜く";return ENEMY_ACTIONS.radiantVolley}
  if(canPay(enemy,ENEMY_ACTIONS.flameSweep)){enemy.intent="敵陣全体へ圧をかける";return ENEMY_ACTIONS.flameSweep}
 }
 if(hero==="myth_rion"){
  enemy.campaignHeroTargetMode="threat";
  if(fallen&&canPay(enemy,ENEMY_ACTIONS.packRevive)){enemy.intent="『今日は豪遊するぞ！』仲間を舞台へ呼び戻す";return ENEMY_ACTIONS.packRevive}
  if(wounded&&wounded.hp/wounded.maxHp<.66&&canPay(enemy,ENEMY_ACTIONS.packMend)){enemy.intent="『また今度やな』で全員を立て直す";return ENEMY_ACTIONS.packMend}
  if(!enemy._campaignRallied&&livingHeroes>1&&canPay(enemy,ENEMY_ACTIONS.packRally)){enemy._campaignRallied=true;enemy.intent="『いこうぜ！』勝ち筋を共有して全員を強化";return ENEMY_ACTIONS.packRally}
  if(buffed&&canPay(enemy,ENEMY_ACTIONS.dispelWave)){enemy.intent="相手の強みを先回りして封じる";return ENEMY_ACTIONS.dispelWave}
  if(((enemy.currentMp??0)<enemy.maxMp*.45||turn%3===0)&&opponents.some(unit=>(unit.currentMp??0)>0)&&canPay(enemy,ENEMY_ACTIONS.manaSiphon)){enemy.intent="相手の魔力をこちらの利益へ変える";return ENEMY_ACTIONS.manaSiphon}
  if(exposed&&canPay(enemy,ENEMY_ACTIONS.venomCloud)){enemy.intent="崩れた敵陣へ追撃の場を作る";return ENEMY_ACTIONS.venomCloud}
  if(canPay(enemy,ENEMY_ACTIONS.dispelWave)){enemy.intent="最大戦力の強みを封じる";return ENEMY_ACTIONS.dispelWave}
 }
 return null
}
'''
enemy_ai_path.write_text(enemy_ai[:ai_start] + new_ai + enemy_ai[ai_end:], encoding="utf-8")

# Build344/345の装備圧縮だけ撤去し、旧装備6枠のHTML/CSSをそのまま再利用。
Path("src/Styles/build345-balance-ui.css").write_text(
    r'''/* ABYSS DOMINION v3.1.26 / Build346
   Formation: pre-Build344 equipment layout stays authoritative. Only the magic circle is compact. */
.formation-screen .formation-circle-section{display:flex!important;align-items:center!important;justify-content:flex-start!important;box-sizing:border-box!important;margin:4px!important;padding:0!important;min-height:46px!important;height:46px!important;background:transparent!important;border:0!important;box-shadow:none!important;overflow:visible!important}
.formation-screen .formation-circle-section h3{display:none!important}
.formation-screen .formation-circle-card{position:relative!important;box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;width:46px!important;max-width:46px!important;height:46px!important;min-height:46px!important;padding:2px!important;overflow:hidden!important;border-radius:7px!important;border:1px solid rgba(181,137,68,.78)!important;background:radial-gradient(circle at 50% 45%,rgba(113,76,31,.16),transparent 55%),linear-gradient(180deg,#151116,#09080a)!important;box-shadow:inset 0 0 0 1px rgba(245,211,134,.08),0 2px 7px rgba(0,0,0,.24)!important;flex:0 0 46px!important}
.formation-screen .formation-circle-card>.formation-circle-art{position:relative!important;display:flex!important;align-items:center!important;justify-content:center!important;width:40px!important;height:40px!important;flex:0 0 40px!important;margin:0!important;color:#c7a25c!important;font-size:20px!important}
.formation-screen .formation-circle-card>.formation-circle-art img{display:block!important;width:38px!important;height:38px!important;max-width:38px!important;max-height:38px!important;object-fit:contain!important;filter:drop-shadow(0 0 4px rgba(159,111,43,.24))!important}
.formation-screen .formation-circle-card>.formation-circle-level{position:absolute!important;left:50%!important;bottom:2px!important;z-index:3!important;transform:translateX(-50%)!important;display:block!important;margin:0!important;padding:1px 4px!important;border:1px solid rgba(184,140,70,.48)!important;border-radius:999px!important;background:rgba(5,5,6,.86)!important;color:#f1d18f!important;font-size:7px!important;font-weight:700!important;line-height:1.05!important;white-space:nowrap!important;text-shadow:0 1px 2px #000!important;pointer-events:none!important}
.formation-screen .formation-circle-card>b,.formation-screen .formation-circle-card>small:not(.formation-circle-level),.formation-screen .formation-circle-card>i{display:none!important}
body:has(.formation-screen) .game-modal{background:rgba(3,3,5,.84)!important;-webkit-backdrop-filter:blur(4px)!important;backdrop-filter:blur(4px)!important}
body:has(.formation-screen) .game-modal-card{border:1px solid rgba(178,132,65,.9)!important;border-radius:9px!important;background:linear-gradient(180deg,rgba(27,21,17,.99),rgba(8,8,10,.995))!important;color:#f2eadb!important}
body:has(.formation-screen) .game-modal-card h2{color:#e6c681!important}
body:has(.formation-screen) .game-modal-card .game-modal-body button{border-color:rgba(150,112,61,.72)!important;background:linear-gradient(180deg,rgba(28,25,24,.96),rgba(11,10,11,.98))!important;color:#efe5d2!important}
.battle-skill-panel-v317{grid-template-rows:auto minmax(0,1fr)!important;max-height:min(39dvh,410px)!important;padding-bottom:max(8px,env(safe-area-inset-bottom))!important}
.battle-skill-panel-v317>header{position:sticky!important;top:0!important;z-index:6!important;display:grid!important;grid-template-columns:minmax(0,1fr) auto 38px!important;align-items:center!important;gap:7px!important;padding:3px 3px 8px!important;background:linear-gradient(180deg,#151310,#0b0b0d)!important}
.battle-skill-close-top{box-sizing:border-box!important;width:36px!important;height:36px!important;min-width:36px!important;min-height:36px!important;padding:0!important;border:1px solid #9c7738!important;border-radius:3px!important;background:#09090c!important;color:#f0d79b!important;font-size:22px!important;font-weight:900!important;line-height:1!important;touch-action:manipulation!important}
.skill-command-list.battle-skill-command-list-v317{min-height:0!important;max-height:none!important;overflow-y:auto!important;padding:0 2px max(12px,env(safe-area-inset-bottom)) 0!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important}
@media(max-width:520px){.formation-screen .formation-circle-section{height:44px!important;min-height:44px!important}.formation-screen .formation-circle-card{width:44px!important;max-width:44px!important;height:44px!important;min-height:44px!important;flex-basis:44px!important}.formation-screen .formation-circle-card>.formation-circle-art{width:38px!important;height:38px!important;flex-basis:38px!important}.formation-screen .formation-circle-card>.formation-circle-art img{width:36px!important;height:36px!important;max-width:36px!important;max-height:36px!important}.battle-skill-panel-v317{max-height:37dvh!important}}
@media(max-height:760px){.battle-skill-panel-v317{max-height:34dvh!important}.battle-skill-close-top{width:34px!important;height:34px!important;min-width:34px!important;min-height:34px!important}}
''',
    encoding="utf-8",
)

# 変更モジュールを確実に新規ロードさせる。オンラインURLやセーブschemaは変更しない。
replace_once("src/data/species.js", "./mythicSerialSpecies.js?v=3.1.1-build314", "./mythicSerialSpecies.js?v=3.1.26-build346")
replace_once("src/battle/SkillSystem.js", "../data/species.js?v=3.0.9-build309", "../data/species.js?v=3.1.26-build346")
replace_once("src/models/Monster.js", "../data/species.js?v=3.1.1-build311", "../data/species.js?v=3.1.26-build346")
replace_once("src/main.js", "./data/species.js?v=3.1.1-build314", "./data/species.js?v=3.1.26-build346")
replace_once("src/main.js", "./battle/SkillSystem.js?v=3.1.1-build311", "./battle/SkillSystem.js?v=3.1.26-build346")
replace_once("src/main.js", "./models/Monster.js?v=3.1.1-build311", "./models/Monster.js?v=3.1.26-build346")
replace_once("src/main.js", "./battle/EnemyAI.js?v=3.1.1-build316", "./battle/EnemyAI.js?v=3.1.26-build346")
replace_once("src/main.js", "./core/CampaignHeroEncounterSystem.js?v=3.1.25-build345", "./core/CampaignHeroEncounterSystem.js?v=3.1.26-build346")
replace_once("src/main.js", "fixedLevel??1500", "fixedLevel??1000")
replace_once("src/ui/screens/HomeScreen.js", "../../core/CampaignHeroEncounterSystem.js?v=3.1.25-build345", "../../core/CampaignHeroEncounterSystem.js?v=3.1.26-build346")
replace_once("src/services/SaveService.js", "../core/CampaignHeroEncounterSystem.js?v=3.1.25-build345", "../core/CampaignHeroEncounterSystem.js?v=3.1.26-build346")
replace_once("index.html", "./src/Styles/build345-balance-ui.css?v=3.1.25-build345", "./src/Styles/build345-balance-ui.css?v=3.1.26-build346")
replace_once("index.html", 'const ASSET_VERSION = "3.1.25";', 'const ASSET_VERSION = "3.1.26";')
replace_once("index.html", 'const ASSET_BUILD = "build345";', 'const ASSET_BUILD = "build346";')

Path("tests/build346-hero-synergy-regression.mjs").write_text(
    r'''import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{MYTHIC_SERIAL_SPECIES}from"../src/data/mythicSerialSpecies.js";
import{CAMPAIGN_HERO_FINAL_LEVEL,CAMPAIGN_HERO_ENCOUNTER_SCHEDULE,CAMPAIGN_HERO_STAT_MULTIPLIER,CAMPAIGN_HERO_HP_MULTIPLIER}from"../src/core/CampaignHeroEncounterSystem.js";
import{HERO_RESONANCE_FOLLOWUP_POWER,heroResonanceProfile}from"../src/core/HeroResonanceSystem.js";
import{ENEMY_ACTIONS,chooseEnemyAction}from"../src/battle/EnemyAI.js";

const skillIds={
 myth_enami:["enami_world_create","enami_spicy_casino","enami_hyper_focus","enami_genesis"],
 myth_rion:["rion_talk","rion_arrange","rion_therapy","rion_community"],
 myth_yori:["yori_rifle","yori_beautiful","yori_tetrapod","yori_difficult"],
 myth_hide:["hide_crayfish","hide_hunt","hide_gourmet","hide_master_claw"]
};
const hero=(id,extra={})=>({speciesId:id,campaignHeroId:id,hp:100,maxHp:100,currentMp:999,maxMp:999,boss:true,combatRarity:"神話",level:1000,role:"support",...extra});
const player=(id="p1",extra={})=>({id,currentHp:100,maxHp:100,currentMp:100,maxMp:100,...extra});

test("勇者一行はLv1000・既存ボス補正を維持",()=>{
 assert.equal(CAMPAIGN_HERO_FINAL_LEVEL,1000);
 assert.ok(CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.every(row=>row.fixedLevel===1000));
 assert.equal(CAMPAIGN_HERO_STAT_MULTIPLIER,1.30);
 assert.equal(CAMPAIGN_HERO_HP_MULTIPLIER,1.45);
});

test("既存セーブ互換のため16スキルIDを維持",()=>{
 for(const[id,ids]of Object.entries(skillIds))assert.deepEqual(MYTHIC_SERIAL_SPECIES[id].authoredSkills.map(skill=>skill.id),ids);
});

test("4人のスキルが弱体・加速・増幅・決定打で噛み合う",()=>{
 const enami=MYTHIC_SERIAL_SPECIES.myth_enami.authoredSkills,rion=MYTHIC_SERIAL_SPECIES.myth_rion.authoredSkills,yori=MYTHIC_SERIAL_SPECIES.myth_yori.authoredSkills,hide=MYTHIC_SERIAL_SPECIES.myth_hide.authoredSkills;
 assert.ok(enami.some(skill=>skill.effects?.some(effect=>effect.kind==="vulnerable")));
 assert.ok(rion.some(skill=>skill.effects?.some(effect=>effect.kind==="spdUp"))&&rion.some(skill=>skill.effects?.some(effect=>effect.kind==="spdDown")));
 assert.ok(yori.some(skill=>["defDown","vulnerable"].includes(skill.bonusVsEffect?.kind)));
 assert.equal(MYTHIC_SERIAL_SPECIES.myth_hide.role,"magic");
 assert.ok(hide.some(skill=>skill.damageClass==="magic"&&skill.bonusVsEffect?.kind==="defDown"));
});

test("既存の双星・三位・無敵共鳴を変更しない",()=>{
 assert.equal(HERO_RESONANCE_FOLLOWUP_POWER,.70);
 assert.equal(heroResonanceProfile(2).totalActions,4);
 assert.equal(heroResonanceProfile(3).totalActions,9);
 assert.equal(heroResonanceProfile(4).totalActions,16);
 assert.equal(heroResonanceProfile(4).invincible,true);
});

test("勇者敵AIは既存actionだけで仲間の状態を利用する",()=>{
 const target=player("p1"),battle={turn:2,allyEffects:{p1:[{kind:"defDown",value:.2}]},allyAilments:{}};
 const yori=hero("myth_yori",{role:"physical-striker"});
 assert.equal(chooseEnemyAction(yori,{allies:[yori],opponents:[target],battle}),ENEMY_ACTIONS.power);
 const rion=hero("myth_rion",{role:"support-controller"}),fallen=hero("myth_enami",{hp:0,currentMp:0});
 assert.equal(chooseEnemyAction(rion,{allies:[rion,fallen],opponents:[target],battle}),ENEMY_ACTIONS.packRevive);
 const hide=hero("myth_hide",{role:"magic-tactician"}),buffBattle={turn:2,allyEffects:{p1:[{kind:"atkUp",value:.2}]},allyAilments:{}};
 assert.equal(chooseEnemyAction(hide,{allies:[hide],opponents:[target],battle:buffBattle}),ENEMY_ACTIONS.dispelWave);
});

test("勇者敵側は装備・魔法陣を追加しない",async()=>{
 const main=await readFile(new URL("../src/main.js",import.meta.url),"utf8");
 assert.match(main,/fixedLevel\?\?1000/);
 assert.match(main,/equipped:false,enemyGear:\[\],enemyMagicCircle:null/);
});

test("編成は旧装備6枠を残し魔法陣だけ小型化",async()=>{
 const[css,formation]=await Promise.all(["../src/Styles/build345-balance-ui.css","../src/ui/screens/FormationScreen.js"].map(path=>readFile(new URL(path,import.meta.url),"utf8")));
 assert.doesNotMatch(css,/\.formation-screen \.formation-gear-grid/);
 assert.doesNotMatch(css,/\.formation-screen \.formation-gear-slot/);
 assert.match(css,/\.formation-screen \.formation-circle-card\{[\s\S]*?width:46px/);
 assert.match(formation,/装備6枠/);
 assert.match(formation,/formation-gear-grid/);
});
''',
    encoding="utf-8",
)

Path("BUILD346_README.txt").write_text(
    """ABYSS DOMINION Build346\n\n"
    "- 勇者一行をLv1000固定へ変更。既存の能力1.30倍 / HP1.45倍 / 傷引継ぎは維持\n"
    "- えなみ・りおん・より・ひでの全16スキルを、4人で連携した時に強くなる構成へ再調整\n"
    "- 既存の双星共鳴 / 三位共鳴 / 無敵、スキルID、セーブ互換を維持\n"
    "- 勇者敵AIは既存actionの優先順位だけを強化し、新しいAIエンジンは追加しない\n"
    "- 編成の装備6枠はBuild344/345の圧縮CSSを撤去し、以前の表示へ回帰\n"
    "- 魔法陣は装備欄を圧迫しない小型表示のみ\n"
    "- 勇者敵側の装備 / 魔法陣は追加なし\n"
    "- オンライン設定、報酬処理、セーブschemaは変更なし\n"
    """,
    encoding="utf-8",
)
