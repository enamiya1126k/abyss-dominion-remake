import{bossProfileForFloor,post9000DepthProfile}from"../core/EnemyScalingSystem.js?v=3.1.1-build311";
import{endgameCharacter,endgameSkillById}from"../data/endgameCharacters.js?v=3.1.1-build311";
import{speciesLevelStats}from"../models/Monster.js?v=3.1.1-build311";
import{floorBossActionInfo}from"../data/floorBosses.js?v=3.1.1-build311";
export const ENEMY_ACTIONS={
 attack:"attack",guard:"guard",charge:"charge",power:"power",heal:"heal",enrage:"enrage",divineBarrier:"divineBarrier",
 devour:"devour",annihilate:"annihilate",wrathBurst:"wrathBurst",mirror:"mirror",sleepMist:"sleepMist",plunder:"plunder",sovereign:"sovereign",
 inferno:"inferno",tidal:"tidal",thunderstorm:"thunderstorm",tempest:"tempest",quake:"quake",radiance:"radiance",eclipse:"eclipse",absoluteZero:"absoluteZero",timeStop:"timeStop",starfall:"starfall",
 flameSweep:"flameSweep",frostNova:"frostNova",venomCloud:"venomCloud",thunderChain:"thunderChain",earthRupture:"earthRupture",galeRend:"galeRend",shadowCurse:"shadowCurse",radiantVolley:"radiantVolley",packRally:"packRally",packMend:"packMend",packRevive:"packRevive",slimeSplitRevive:"slimeSplitRevive",dispelWave:"dispelWave",manaSiphon:"manaSiphon"
};

const BOSS_SPECIALS={
 abyss_gluttony:{action:"devour",chance:.38,cooldown:2,intent:"万象を喰らう"},
 abyss_extinction:{action:"annihilate",chance:.35,cooldown:2,intent:"命の終端を開く"},
 abyss_wrath:{action:"wrathBurst",chance:.42,cooldown:2,intent:"傷が憤怒へ変わる"},
 abyss_envy:{action:"mirror",chance:.38,cooldown:3,intent:"最も強い力を写す"},
 abyss_sloth:{action:"sleepMist",chance:.40,cooldown:3,intent:"時間が眠り始める"},
 abyss_greed:{action:"plunder",chance:.40,cooldown:3,intent:"すべての強化を所有する"},
 abyss_pride:{action:"sovereign",chance:.42,cooldown:2,intent:"絶対王域を宣言する"},
 ten_fire:{action:"inferno",chance:.46,cooldown:2,intent:"神炎が世界を覆う"},
 ten_water:{action:"tidal",chance:.42,cooldown:2,intent:"生命の大潮が満ちる"},
 ten_thunder:{action:"thunderstorm",chance:.46,cooldown:2,intent:"天雷が万象へ連鎖する"},
 ten_wind:{action:"tempest",chance:.45,cooldown:2,intent:"天地を裂く神嵐が集う"},
 ten_earth:{action:"quake",chance:.42,cooldown:2,intent:"大陸そのものが軋む"},
 ten_light:{action:"radiance",chance:.44,cooldown:2,intent:"真実の光が満ちる"},
 ten_dark:{action:"eclipse",chance:.44,cooldown:2,intent:"月蝕が命を選別する"},
 ten_ice:{action:"absoluteZero",chance:.43,cooldown:2,intent:"絶対零度が展開される"},
 ten_time:{action:"timeStop",chance:.38,cooldown:3,intent:"因果の秒針が止まる"},
 ten_space:{action:"starfall",chance:.48,cooldown:2,intent:"星界が地上へ墜ちる"}
};

export const SPECIAL_ACTION_INFO={
 devour:{label:"無限捕食",pattern:"singleWeak",multiplier:1.3,drain:.7},
 annihilate:{label:"死滅の波動",pattern:"all",multiplier:1.55},
 wrathBurst:{label:"憤怒爆砕",pattern:"all",multiplier:1.45,selfAtk:.12},
 mirror:{label:"鏡界模倣",pattern:"singleStrong",multiplier:1.7,copyAtk:true},
 sleepMist:{label:"永劫睡界",pattern:"all",multiplier:1.05,slow:.22},
 plunder:{label:"権能強奪",pattern:"all",multiplier:1.15,selfHeal:.16,selfAtk:.08},
 sovereign:{label:"絶対王域",pattern:"all",multiplier:1.6,barrier:2},
 inferno:{label:"神炎・終焉焦土",pattern:"all",multiplier:1.75},
 tidal:{label:"神海・蒼天大瀑",pattern:"all",multiplier:1.4,selfHeal:.22},
 thunderstorm:{label:"神雷・万象連鎖",pattern:"random3",multiplier:1.5},
 tempest:{label:"神嵐・天地解放",pattern:"random3",multiplier:1.65,selfSpd:.12},
 quake:{label:"神地・大陸震界",pattern:"all",multiplier:1.55,selfDef:.12},
 radiance:{label:"神光・万象浄滅",pattern:"all",multiplier:1.6},
 eclipse:{label:"神闇・無明葬界",pattern:"singleWeak",multiplier:2.05,drain:.25},
 absoluteZero:{label:"神氷・絶対零界",pattern:"all",multiplier:1.42,slow:.28},
 timeStop:{label:"神刻・因果停止",pattern:"random3",multiplier:1.8,selfSpd:.18},
 starfall:{label:"神星・天界墜落",pattern:"all",multiplier:1.9,barrier:1},
 flameSweep:{label:"灼熱薙ぎ",pattern:"all",multiplier:1.02,element:"fire",damageClass:"hybrid",status:{id:"burn",name:"火傷",chance:.62,turns:3,power:.05}},
 frostNova:{label:"氷縛波",pattern:"all",multiplier:.9,element:"ice",damageClass:"magic",status:{id:"freeze",name:"凍結",chance:.34,turns:1,power:0}},
 venomCloud:{label:"猛毒霧",pattern:"all",multiplier:.78,element:"dark",damageClass:"magic",status:{id:"poison",name:"毒",chance:.75,turns:4,power:.045}},
 thunderChain:{label:"連鎖雷撃",pattern:"random3",multiplier:1.08,element:"lightning",damageClass:"magic",status:{id:"paralysis",name:"麻痺",chance:.38,turns:2,power:0}},
 earthRupture:{label:"地脈断裂",pattern:"all",multiplier:1.14,element:"earth",damageClass:"hybrid",status:{id:"stun",name:"気絶",chance:.24,turns:1,power:0}},
 galeRend:{label:"裂風連牙",pattern:"random3",multiplier:1.02,element:"wind",damageClass:"physical",status:{id:"bleed",name:"出血",chance:.55,turns:3,power:.04}},
 shadowCurse:{label:"黒呪侵食",pattern:"all",multiplier:.9,element:"dark",damageClass:"magic",status:{id:"curse",name:"呪い",chance:.58,turns:3,power:.04}},
 radiantVolley:{label:"光雨連射",pattern:"random3",multiplier:1.15,element:"light",damageClass:"magic"},
 packRally:{label:"群勢号令",pattern:"self",multiplier:0,utility:true,effects:[{kind:"atkUp",value:.18,turns:3,allies:true},{kind:"defUp",value:.14,turns:3,allies:true}]},
 packMend:{label:"群体再生",pattern:"self",multiplier:0,utility:true,heal:.18,effects:[{kind:"regen",value:.04,turns:3,allies:true}]},
 packRevive:{label:"魂魄再結合",pattern:"self",multiplier:0,utility:true,revive:.32},
 slimeSplitRevive:{label:"分裂再生",pattern:"self",multiplier:0,utility:true,revive:.2,slimeOnly:true},
 dispelWave:{label:"強化崩し",pattern:"all",multiplier:.5,damageClass:"hybrid",dispel:true},
 manaSiphon:{label:"魔力吸奪",pattern:"all",multiplier:.58,mpDrain:.22,element:"dark",damageClass:"magic"}
};

export function isBossFloor(floor){return floor>0&&floor%10===0}
export function createEnemyBattleState(species,source,floor){
 const boss=source.boss??isBossFloor(floor),profile=boss?bossProfileForFloor(floor):{tier:null,hp:1,atk:1,def:1,spd:1,statusResist:0,healRate:.16,powerMultiplier:1.8},depth=post9000DepthProfile(floor);
 const core=speciesLevelStats(species,source.level,{rarity:source.combatRarity??species.rarity,rank:source.rank??1,plus:0});
 const custom=source.floorBossStats??{},maxHp=Math.max(1,Math.floor(core.hp*profile.hp*depth.hp*Math.max(.5,Number(custom.hp)||1)));
 const maxEnemyMp=Math.max(8,Math.floor(((species.maxMp??18)+source.level*.32)*(boss?1.35:1)));
 const baseName=source.nameOverride??(boss?`深淵の${species.name}`:species.name),depthName=depth.active&&depth.step>0&&!source.nameOverride?`【${depth.label}】${baseName}`:baseName;
 const atk=Math.max(1,Math.floor(core.atk*profile.atk*depth.atk*Math.max(.5,Number(custom.atk)||1))),matk=Math.max(1,Math.floor(core.matk*profile.atk*depth.atk*Math.max(.5,Number(custom.matk)||1))),def=Math.max(0,Math.floor(core.def*profile.def*depth.def*Math.max(.5,Number(custom.def)||1))),mdef=Math.max(0,Math.floor(core.mdef*profile.def*depth.def*Math.max(.5,Number(custom.mdef)||1)));
 return{...source,speciesId:source.speciesId,name:depthName,level:source.level,hp:maxHp,maxHp,
  atk,matk,def,mdef,spd:Math.max(1,Math.floor(core.spd*profile.spd*depth.spd*Math.max(.5,Number(custom.spd)||1))),evasion:Math.min(75,Math.max(0,Number(source.evasion??core.evasion)||0)),accuracy:Math.max(20,Math.min(180,Number(source.accuracy??core.accuracy)||100)),
  emoji:species.emoji??"👾",color:boss?"#bb4cff":species.baseStats.atk>12?"#df6262":"#a58f59",boss,bossTier:profile.tier,bossStatusResist:Math.min(.9,(profile.statusResist??0)+depth.statusResist),bossHealRate:profile.healRate,bossPowerMultiplier:profile.powerMultiplier,depthTier:depth.label,depthStep:depth.step,depthPressure:depth.active?Math.round(depth.step*10):0,phase:1,enraged:false,guard:false,charging:false,healed:false,
  intent:"様子を見ている",maxMp:maxEnemyMp,currentMp:Math.max(0,Math.min(maxEnemyMp,Number(source.currentMp??maxEnemyMp))),specialCooldown:0,divineBarrier:0,role:source.role??species.role??"balanced",race:species.race??null,strategicIdentity:species.strategicIdentity??null,element:source.trialElement??source.attribute??source.element??species.element??"neutral"};
}
function setEnemySpecialCooldown(enemy,base){enemy.specialCooldown=Math.max(0,Math.floor(Number(base)||0))+1}
function normalSpecialAction(enemy,hpRate){
 enemy.specialCooldown=Math.max(0,(enemy.specialCooldown??0)-1);if(enemy.specialCooldown>0)return null;
 const role=String(enemy.role??""),identity=enemy.strategicIdentity?.kind,alliesSupport=["healer","support","controller"].some(value=>role.includes(value));
 if(alliesSupport&&hpRate<.72&&Math.random()<(enemy.boss?.7:.44)){setEnemySpecialCooldown(enemy,2);enemy.intent=role.includes("heal")?"群体を再生する":"群勢を強化する";return role.includes("heal")?ENEMY_ACTIONS.packMend:ENEMY_ACTIONS.packRally}
 if(identity==="tank"&&Math.random()<(enemy.boss?.48:.30)){setEnemySpecialCooldown(enemy,2);enemy.intent="守護陣形を組む";return ENEMY_ACTIONS.packRally}
 if(identity==="control"&&Math.random()<(enemy.boss?.52:.34)){setEnemySpecialCooldown(enemy,2);enemy.intent="命中と強化を崩す";return Math.random()<.55?ENEMY_ACTIONS.dispelWave:ENEMY_ACTIONS.manaSiphon}
 const action=({fire:ENEMY_ACTIONS.flameSweep,ice:ENEMY_ACTIONS.frostNova,water:ENEMY_ACTIONS.frostNova,poison:ENEMY_ACTIONS.venomCloud,nature:ENEMY_ACTIONS.venomCloud,lightning:ENEMY_ACTIONS.thunderChain,thunder:ENEMY_ACTIONS.thunderChain,earth:ENEMY_ACTIONS.earthRupture,wind:ENEMY_ACTIONS.galeRend,dark:ENEMY_ACTIONS.shadowCurse,light:ENEMY_ACTIONS.radiantVolley})[enemy.element];
 if(action&&Math.random()<(enemy.boss?.76:.4)){setEnemySpecialCooldown(enemy,enemy.boss?1:(Math.random()<.35?1:2));enemy.intent=`${SPECIAL_ACTION_INFO[action].label}を放つ`;return action}
 return null;
}
function specialAction(enemy,hpRate){
 if(Array.isArray(enemy.floorBossActionIds)&&enemy.floorBossActionIds.length){
  enemy.specialCooldown=Math.max(0,(enemy.specialCooldown??0)-1);if(enemy.specialCooldown>0)return null;
  const actions=enemy.floorBossActionIds,useUltimate=hpRate<=.35&&!enemy.floorBossUltimateUsed;
  if(Math.random()<(useUltimate?.92:.67)){
   const index=useUltimate?actions.length-1:(enemy.floorBossActionIndex??0)%Math.max(1,actions.length-1),actionId=actions[index];
   if(useUltimate)enemy.floorBossUltimateUsed=true;else enemy.floorBossActionIndex=index+1;
   setEnemySpecialCooldown(enemy,useUltimate?2:1);enemy.intent=`${floorBossActionInfo(`floorBoss:${actionId}`)?.label??"固有技"}を発動`;return`floorBoss:${actionId}`;
  }
  return null;
 }
 if(!enemy.endgameBossId)return null;enemy.specialCooldown=Math.max(0,(enemy.specialCooldown??0)-1);if(enemy.divineBarrier>0)enemy.divineBarrier--;
 if(enemy.faction==="tenGod"&&hpRate<=.72&&!enemy.divineBarrierUsed){enemy.divineBarrierUsed=true;enemy.divineBarrier=2;enemy.intent="神域障壁を展開";return ENEMY_ACTIONS.divineBarrier}
 if(enemy.specialCooldown>0)return null;
 const profile=endgameCharacter(enemy.endgameBossId);
 if(profile){
  const authorities=profile.skills.slice(1),useUltimate=hpRate<=.32&&!enemy.authorityUltimateUsed||((enemy.authorityUses??0)+1)%5===0,index=useUltimate?authorities.length-1:(enemy.authorityIndex??0)%Math.max(1,authorities.length-1),skill=authorities[index];
  if(skill&&Math.random()<(enemy.faction==="tenGod"?.52:.46)){enemy.authorityIndex=(index+1)%Math.max(1,authorities.length-1);enemy.authorityUses=(enemy.authorityUses??0)+1;if(useUltimate)enemy.authorityUltimateUsed=true;setEnemySpecialCooldown(enemy,Math.max(1,Math.min(4,Number(skill.cooldown)||2)));enemy.intent=`${skill.name}を発動`;return`authority:${skill.id}`}
  return null;
 }
 const config=BOSS_SPECIALS[enemy.endgameBossId];if(!config)return null;
 if(Math.random()<config.chance){setEnemySpecialCooldown(enemy,config.cooldown);enemy.intent=config.intent;return ENEMY_ACTIONS[config.action]}
 return null;
}
export function enemyActionMpCost(enemy,action){
 if(!enemy||!action||[ENEMY_ACTIONS.attack,ENEMY_ACTIONS.guard,ENEMY_ACTIONS.charge,ENEMY_ACTIONS.power,ENEMY_ACTIONS.enrage,ENEMY_ACTIONS.manaSiphon].includes(action))return 0;
 const maximum=Math.max(1,Number(enemy.maxMp)||1);
 const rate=action===ENEMY_ACTIONS.heal?.14
  :action===ENEMY_ACTIONS.packRevive?.28
  :action===ENEMY_ACTIONS.slimeSplitRevive?.35
  :action===ENEMY_ACTIONS.packMend?.18
  :action===ENEMY_ACTIONS.packRally?.16
  :action===ENEMY_ACTIONS.dispelWave?.18
  :action===ENEMY_ACTIONS.divineBarrier?.22
  :String(action).startsWith("floorBoss:")?.22
  :String(action).startsWith("authority:")?.26
  :enemy.endgameBossId?.24:.19;
 return Math.max(1,Math.ceil(maximum*rate));
}
function canPay(enemy,action){return Math.max(0,Number(enemy.currentMp)||0)>=enemyActionMpCost(enemy,action)}
function campaignHeroAction(enemy,context,hpRate){
 const hero=String(enemy.campaignHeroId??""),allies=(context.allies??[enemy]).filter(Boolean),opponents=(context.opponents??[]).filter(unit=>(unit.currentHp??0)>0),turn=Math.max(1,Number(context.battle?.turn)||1),wounded=allies.filter(unit=>unit.hp>0).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0],fallen=allies.find(unit=>unit.hp<=0);
 if(hero==="myth_yori"){
  enemy.campaignHeroTargetMode="weak";
  if(!enemy._campaignObserved){enemy._campaignObserved=true;enemy.guard=true;enemy.intent="間合いと呼吸を観察する";return ENEMY_ACTIONS.guard}
  if(enemy.charging){enemy.charging=false;enemy.intent="観察した急所へ拳を叩き込む";return ENEMY_ACTIONS.power}
  if(turn%3===0&&canPay(enemy,ENEMY_ACTIONS.galeRend)){enemy.intent="拳圧で戦列を打ち抜く";return ENEMY_ACTIONS.galeRend}
  enemy.charging=true;enemy.intent="渾身の一撃へ踏み込む";return ENEMY_ACTIONS.charge
 }
 if(hero==="myth_hide"){
  enemy.campaignHeroTargetMode="threat";
  const positiveKinds=new Set(["atkUp","defUp","spdUp","regen","taunt","guard","counter","lifeSteal"]),buffed=opponents.some(unit=>(context.battle?.allyEffects?.[unit.id]??[]).some(effect=>positiveKinds.has(effect.kind)));
  if(buffed&&canPay(enemy,ENEMY_ACTIONS.dispelWave)){enemy.intent="強化の構造を解析して崩す";return ENEMY_ACTIONS.dispelWave}
  if(opponents.length>=2&&canPay(enemy,ENEMY_ACTIONS.thunderChain)){enemy.intent="逃げ道を計算した連鎖術式を放つ";return ENEMY_ACTIONS.thunderChain}
  if(canPay(enemy,ENEMY_ACTIONS.shadowCurse)){enemy.intent="最も危険な相手へ術式を固定";return ENEMY_ACTIONS.shadowCurse}
 }
 if(hero==="myth_enami"){
  enemy.campaignHeroTargetMode="threat";
  const allyUnderPressure=allies.some(unit=>unit!==enemy&&(unit.hp<=0||unit.hp/Math.max(1,unit.maxHp)<.7));
  if(fallen&&canPay(enemy,ENEMY_ACTIONS.packRevive)){enemy.intent="笑みを消し、倒れた仲間を引き戻す";return ENEMY_ACTIONS.packRevive}
  if(wounded&&wounded.hp/wounded.maxHp<.55&&canPay(enemy,ENEMY_ACTIONS.packMend)){enemy.intent="仲間を守るため戦線を立て直す";return ENEMY_ACTIONS.packMend}
  if(allyUnderPressure&&canPay(enemy,ENEMY_ACTIONS.radiantVolley)){enemy.intent="仲間を傷つけた相手を広く捉える";return ENEMY_ACTIONS.radiantVolley}
  if(!enemy._campaignGuardedAllies&&allies.length>1&&canPay(enemy,ENEMY_ACTIONS.packRally)){enemy._campaignGuardedAllies=true;enemy.intent="全員を俯瞰し守りを整える";return ENEMY_ACTIONS.packRally}
 }
 if(hero==="myth_rion"){
  enemy.campaignHeroTargetMode="threat";
  if(fallen&&canPay(enemy,ENEMY_ACTIONS.packRevive)){enemy.intent="仲間を舞台へ呼び戻す";return ENEMY_ACTIONS.packRevive}
  if(wounded&&wounded.hp/wounded.maxHp<.62&&canPay(enemy,ENEMY_ACTIONS.packMend)){enemy.intent="交渉の余地を作るため全員を回復";return ENEMY_ACTIONS.packMend}
  if(!enemy._campaignRallied&&allies.length>1&&canPay(enemy,ENEMY_ACTIONS.packRally)){enemy._campaignRallied=true;enemy.intent="勝ち筋を共有し全員を強化";return ENEMY_ACTIONS.packRally}
  if((enemy.currentMp??0)<enemy.maxMp*.35&&opponents.some(unit=>(unit.currentMp??0)>0)&&canPay(enemy,ENEMY_ACTIONS.manaSiphon)){enemy.intent="相手の魔力をこちらの利益へ変える";return ENEMY_ACTIONS.manaSiphon}
  if(canPay(enemy,ENEMY_ACTIONS.dispelWave)){enemy.intent="最大戦力の強みを封じる";return ENEMY_ACTIONS.dispelWave}
 }
 return null
}
function teamBattleAction(enemy,context,hpRate){
 if(!enemy.teamBattle)return null;
 const role=String(enemy.teamBattleRole??"striker"),allies=(context.allies??[enemy]).filter(Boolean),opponents=(context.opponents??[]).filter(unit=>(unit.currentHp??0)>0),turn=Math.max(1,Number(context.battle?.turn)||1),fallen=allies.find(unit=>unit.hp<=0),wounded=[...allies].filter(unit=>unit.hp>0).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
 enemy.teamBattleTargetMode=role==="disruptor"||role==="leader"?"threat":role==="support"?"weak":"normal";
 if(role==="support"){
  if(fallen&&!enemy._teamReviveUsed&&canPay(enemy,ENEMY_ACTIONS.packRevive)){enemy._teamReviveUsed=true;enemy.intent="倒れた味方を戦線へ復帰させる";return ENEMY_ACTIONS.packRevive}
  if(wounded&&wounded.hp/wounded.maxHp<.72&&canPay(enemy,ENEMY_ACTIONS.packMend)){enemy.intent="傷の深い味方を優先して再生する";return ENEMY_ACTIONS.packMend}
  if(!enemy._teamRallied&&canPay(enemy,ENEMY_ACTIONS.packRally)){enemy._teamRallied=true;enemy.intent="四体編成の攻守を同期する";return ENEMY_ACTIONS.packRally}
 }
 if(role==="guardian"&&wounded&&wounded.hp/wounded.maxHp<.68&&!enemy._teamGuardRallied&&canPay(enemy,ENEMY_ACTIONS.packRally)){enemy._teamGuardRallied=true;enemy.guard=true;enemy.intent="負傷した味方を守る陣形へ移る";return ENEMY_ACTIONS.packRally}
 if(role==="disruptor"){
  const positiveKinds=new Set(["atkUp","defUp","spdUp","regen","taunt","guard","counter","lifeSteal"]),buffed=opponents.some(unit=>(context.battle?.allyEffects?.[unit.id]??[]).some(effect=>positiveKinds.has(effect.kind)));
  if(buffed&&canPay(enemy,ENEMY_ACTIONS.dispelWave)){enemy.intent="強化の重なった標的を解析して崩す";return ENEMY_ACTIONS.dispelWave}
  if(turn%3===0&&opponents.some(unit=>(unit.currentMp??0)>0)&&canPay(enemy,ENEMY_ACTIONS.manaSiphon)){enemy.intent="主力の魔力をまとめて奪う";return ENEMY_ACTIONS.manaSiphon}
 }
 if(role==="leader"&&hpRate<.55&&!enemy._teamLeaderRallied&&canPay(enemy,ENEMY_ACTIONS.packRally)){enemy._teamLeaderRallied=true;enemy.intent="隊列を再編し反攻を命じる";return ENEMY_ACTIONS.packRally}
 return null;
}
export function chooseEnemyAction(enemy,context={}){
 if(enemy.speciesId==="ochuki"){enemy.guard=true;enemy.intent="巨大な盾の陰で逃げ道を探す";return ENEMY_ACTIONS.guard}
 const allies=(context.allies??[enemy]).filter(Boolean),opponents=(context.opponents??[]).filter(monster=>(monster.currentHp??0)>0),hpRate=enemy.hp/enemy.maxHp,role=String(enemy.role??""),support=["healer","support","controller","debuffer","magic"].some(value=>role.includes(value)),rarity=String(enemy.combatRarity??enemy.rarity??"N"),rarityPower=({N:0,R:1,SR:2,SSR:3,UR:4,LR:5,"神話":6,"深淵":7,"十神":8})[rarity]??0,reviveRole=["healer","support"].some(value=>role.includes(value)),reviveEligible=enemy.speciesId!=="acid_slime"&&reviveRole&&(Boolean(enemy.boss)||Number(enemy.level)>=100||rarityPower>=4);
 const fallen=allies.find(ally=>ally.hp<=0),fallenSlime=allies.find(ally=>ally.hp<=0&&(ally.race==="slime"||String(ally.speciesId).includes("slime"))),wounded=[...allies].filter(ally=>ally.hp>0).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
 const heroAction=enemy.campaignHeroId?campaignHeroAction(enemy,context,hpRate):null;if(heroAction&&canPay(enemy,heroAction))return heroAction;
 const teamAction=teamBattleAction(enemy,context,hpRate);if(teamAction&&canPay(enemy,teamAction))return teamAction;
 if(enemy.speciesId==="acid_slime"&&fallenSlime&&!enemy._slimeSplitReviveUsed&&canPay(enemy,ENEMY_ACTIONS.slimeSplitRevive)){enemy._slimeSplitReviveUsed=true;enemy.intent="倒れたスライムを分裂核から再生";return ENEMY_ACTIONS.slimeSplitRevive}
 if(fallen&&reviveEligible&&canPay(enemy,ENEMY_ACTIONS.packRevive)){enemy.intent="倒れた味方を再構成";return ENEMY_ACTIONS.packRevive}
 if(wounded&&wounded.hp/wounded.maxHp<.42&&support&&canPay(enemy,ENEMY_ACTIONS.packMend)){enemy.intent="負傷した群れを再生";return ENEMY_ACTIONS.packMend}
 const positiveKinds=new Set(["atkUp","defUp","spdUp","regen","taunt","guard","counter","lifeSteal"]),buffed=opponents.some(monster=>(context.battle?.allyEffects?.[monster.id]??[]).some(effect=>positiveKinds.has(effect.kind)));
 if(buffed&&support&&Math.random()<.64&&canPay(enemy,ENEMY_ACTIONS.dispelWave)){enemy.intent="味方の強化を崩す";return ENEMY_ACTIONS.dispelWave}
 if((enemy.currentMp??0)<enemy.maxMp*.24&&opponents.some(monster=>(monster.currentMp??0)>0)&&Math.random()<.72){enemy.intent="魔力を奪って立て直す";return ENEMY_ACTIONS.manaSiphon}
 const special=specialAction(enemy,hpRate);if(special&&canPay(enemy,special))return special;
 // Dedicated floor/endgame skills already ticked the shared counter above.
 // Do not tick it a second time through the normal elemental action path.
 const dedicatedCooldown=Boolean(enemy.floorBossActionIds?.length||enemy.endgameBossId)&&enemy.specialCooldown>0;
 const tactical=dedicatedCooldown?null:normalSpecialAction(enemy,hpRate);if(tactical&&canPay(enemy,tactical))return tactical;
 if(enemy.charging){enemy.charging=false;enemy.intent="強攻撃を放つ";return ENEMY_ACTIONS.power}
 if(enemy.boss&&hpRate<=.5&&!enemy.enraged){enemy.enraged=true;enemy.phase=2;enemy.intent=enemy.endgameBossId?"権能が暴走する":"狂暴化";return ENEMY_ACTIONS.enrage}
 if(hpRate<=.3&&!enemy.healed&&Math.random()<.5&&canPay(enemy,ENEMY_ACTIONS.heal)){enemy.healed=true;enemy.intent="自己回復";return ENEMY_ACTIONS.heal}
 const roll=Math.random(),guardChance=enemy.boss?.12:.18,chargeChance=enemy.boss?.25:.16;
 if(roll<guardChance){enemy.guard=true;enemy.intent="防御態勢";return ENEMY_ACTIONS.guard}
 if(roll<guardChance+chargeChance){enemy.charging=true;enemy.intent="力を溜めている";return ENEMY_ACTIONS.charge}
 enemy.intent=enemy.enraged?"狂乱攻撃":"通常攻撃";return ENEMY_ACTIONS.attack;
}
export function enemyDamageMultiplier(enemy){let mult=1;if(enemy.guard){enemy.guard=false;mult*=.48}if((enemy.divineBarrier??0)>0)mult*=.35;return mult}
// Subtractive DEF used to collapse ordinary encounters to a hard 1 damage.
// This curve keeps DEF meaningful while making the reduction continuous.
export function enemyDamageAfterDefense(attack,defense){const offense=Math.max(1,Number(attack)||1),armor=Math.max(0,Number(defense)||0);return Math.max(1,offense*(offense+40)/(offense+armor+40))}
export function enemyHealAmount(enemy){return Math.max(1,Math.floor(enemy.maxHp*(enemy.endgameBossId?.28:enemy.boss?(enemy.bossHealRate??.12):.16)))}
export function enemyAttackMultiplier(enemy,action){if(action===ENEMY_ACTIONS.power)return enemy.endgameBossId?2.55:enemy.boss?(enemy.bossPowerMultiplier??1.8):1.8;if(enemy.enraged)return enemy.endgameBossId?1.55:enemy.boss?1.3:1.35;return 1}
function authorityInfo(action){
 if(typeof action!=="string"||!action.startsWith("authority:"))return null;const skill=endgameSkillById(action.slice(10));if(!skill)return null;
 const utility=["buff","stance","allHeal","selfHeal","revive","cleanse","mpHeal"].includes(skill.type);
 return{...skill,label:skill.name,pattern:utility?"self":skill.allEnemies?"all":skill.execute||skill.drain?"singleWeak":"singleStrong",multiplier:Math.max(0,Number(skill.power)||0),utility,element:skill.element};
}
export function specialActionMultiplier(action){return authorityInfo(action)?.multiplier??SPECIAL_ACTION_INFO[action]?.multiplier??1}
export function specialActionInfo(action){return authorityInfo(action)??floorBossActionInfo(action)??SPECIAL_ACTION_INFO[action]??null}
