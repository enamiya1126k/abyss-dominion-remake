import{bossProfileForFloor,post9000DepthProfile}from"../core/EnemyScalingSystem.js?v=2.11.2-build166";
import{endgameCharacter,endgameSkillById}from"../data/endgameCharacters.js?v=2.11.2-build166";
import{speciesLevelStats}from"../models/Monster.js?v=2.11.2-build166";
import{floorBossActionInfo}from"../data/floorBosses.js?v=2.11.21-build185";
export const ENEMY_ACTIONS={
 attack:"attack",guard:"guard",charge:"charge",power:"power",heal:"heal",enrage:"enrage",divineBarrier:"divineBarrier",
 devour:"devour",annihilate:"annihilate",wrathBurst:"wrathBurst",mirror:"mirror",sleepMist:"sleepMist",plunder:"plunder",sovereign:"sovereign",
 inferno:"inferno",tidal:"tidal",thunderstorm:"thunderstorm",tempest:"tempest",quake:"quake",radiance:"radiance",eclipse:"eclipse",absoluteZero:"absoluteZero",timeStop:"timeStop",starfall:"starfall",
 flameSweep:"flameSweep",frostNova:"frostNova",venomCloud:"venomCloud",thunderChain:"thunderChain",earthRupture:"earthRupture",galeRend:"galeRend",shadowCurse:"shadowCurse",radiantVolley:"radiantVolley",packRally:"packRally",packMend:"packMend",packRevive:"packRevive",dispelWave:"dispelWave",manaSiphon:"manaSiphon"
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
 flameSweep:{label:"灼熱薙ぎ",pattern:"all",multiplier:1.02,element:"fire",status:{id:"burn",name:"火傷",chance:.62,turns:3,power:.05}},
 frostNova:{label:"氷縛波",pattern:"all",multiplier:.9,element:"ice",status:{id:"freeze",name:"凍結",chance:.34,turns:1,power:0}},
 venomCloud:{label:"猛毒霧",pattern:"all",multiplier:.78,element:"dark",status:{id:"poison",name:"毒",chance:.75,turns:4,power:.045}},
 thunderChain:{label:"連鎖雷撃",pattern:"random3",multiplier:1.08,element:"lightning",status:{id:"paralysis",name:"麻痺",chance:.38,turns:2,power:0}},
 earthRupture:{label:"地脈断裂",pattern:"all",multiplier:1.14,element:"earth",status:{id:"stun",name:"気絶",chance:.24,turns:1,power:0}},
 galeRend:{label:"裂風連牙",pattern:"random3",multiplier:1.02,element:"wind",status:{id:"bleed",name:"出血",chance:.55,turns:3,power:.04}},
 shadowCurse:{label:"黒呪侵食",pattern:"all",multiplier:.9,element:"dark",status:{id:"curse",name:"呪い",chance:.58,turns:3,power:.04}},
 radiantVolley:{label:"光雨連射",pattern:"random3",multiplier:1.15,element:"light"},
 packRally:{label:"群勢号令",pattern:"self",multiplier:0,utility:true,effects:[{kind:"atkUp",value:.18,turns:3,allies:true},{kind:"defUp",value:.14,turns:3,allies:true}]},
 packMend:{label:"群体再生",pattern:"self",multiplier:0,utility:true,heal:.18,effects:[{kind:"regen",value:.04,turns:3,allies:true}]},
 packRevive:{label:"魂魄再結合",pattern:"self",multiplier:0,utility:true,revive:.32},
 dispelWave:{label:"強化崩し",pattern:"all",multiplier:.5,dispel:true},
 manaSiphon:{label:"魔力吸奪",pattern:"all",multiplier:.58,mpDrain:.22,element:"dark"}
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
  atk,matk,def,mdef,spd:Math.max(1,Math.floor(core.spd*profile.spd*depth.spd*Math.max(.5,Number(custom.spd)||1))),evasion:Math.min(75,Math.max(0,Number(custom.evasion??source.evasion??core.evasion)||0)),accuracy:Math.max(20,Math.min(180,Number(custom.accuracy??source.accuracy??core.accuracy)||100)),crit:Math.max(0,Math.min(.9,Number(custom.crit??source.crit)||0)),
  emoji:species.emoji??"👾",color:boss?"#bb4cff":species.baseStats.atk>12?"#df6262":"#a58f59",boss,bossTier:profile.tier,bossStatusResist:Math.min(.9,(profile.statusResist??0)+depth.statusResist),bossHealRate:profile.healRate,bossPowerMultiplier:profile.powerMultiplier,depthTier:depth.label,depthStep:depth.step,depthPressure:depth.active?Math.round(depth.step*10):0,phase:1,enraged:false,guard:false,charging:false,healed:false,
  intent:"様子を見ている",maxMp:maxEnemyMp,currentMp:Math.max(0,Math.min(maxEnemyMp,Number(source.currentMp??maxEnemyMp))),specialCooldown:0,divineBarrier:0,role:source.role??species.role??"balanced",strategicIdentity:species.strategicIdentity??null,element:source.trialElement??source.attribute??source.element??species.element??"neutral"};
}
function normalSpecialAction(enemy,hpRate){
 enemy.specialCooldown=Math.max(0,(enemy.specialCooldown??0)-1);if(enemy.specialCooldown>0)return null;
 const role=String(enemy.role??""),identity=enemy.strategicIdentity?.kind,alliesSupport=["healer","support","controller"].some(value=>role.includes(value));
 if(alliesSupport&&hpRate<.72&&Math.random()<(enemy.boss?.7:.44)){enemy.specialCooldown=2;enemy.intent=role.includes("heal")?"群体を再生する":"群勢を強化する";return role.includes("heal")?ENEMY_ACTIONS.packMend:ENEMY_ACTIONS.packRally}
 if(identity==="tank"&&Math.random()<(enemy.boss?.48:.30)){enemy.specialCooldown=2;enemy.intent="守護陣形を組む";return ENEMY_ACTIONS.packRally}
 if(identity==="control"&&Math.random()<(enemy.boss?.52:.34)){enemy.specialCooldown=2;enemy.intent="命中と強化を崩す";return Math.random()<.55?ENEMY_ACTIONS.dispelWave:ENEMY_ACTIONS.manaSiphon}
 const action=({fire:ENEMY_ACTIONS.flameSweep,ice:ENEMY_ACTIONS.frostNova,water:ENEMY_ACTIONS.frostNova,poison:ENEMY_ACTIONS.venomCloud,nature:ENEMY_ACTIONS.venomCloud,lightning:ENEMY_ACTIONS.thunderChain,thunder:ENEMY_ACTIONS.thunderChain,earth:ENEMY_ACTIONS.earthRupture,wind:ENEMY_ACTIONS.galeRend,dark:ENEMY_ACTIONS.shadowCurse,light:ENEMY_ACTIONS.radiantVolley})[enemy.element];
 if(action&&Math.random()<(enemy.boss?.76:.4)){enemy.specialCooldown=enemy.boss?1:(Math.random()<.35?1:2);enemy.intent=`${SPECIAL_ACTION_INFO[action].label}を放つ`;return action}
 return null;
}
const FLOOR_BOSS_POSITIVE_KINDS=new Set(["atkUp","defUp","spdUp","evasionUp","accuracyUp","regen","taunt","guard","counter","lifeSteal","magicToPhysical"]);
function floorBossTacticalState(enemy,context={}){
 const allies=(context.allies??[enemy]).filter(Boolean),opponents=(context.opponents??[]).filter(monster=>(monster.currentHp??0)>0),battle=context.battle??{},turn=Math.max(1,Number(battle.turn)||1);
 const buffed=opponents.some(monster=>(battle.allyEffects?.[monster.id]??[]).some(effect=>FLOOR_BOSS_POSITIVE_KINDS.has(effect.kind))),hasCircle=opponents.some(monster=>{const circle=battle.magicCircleProfiles?.[monster.id];return circle&&circle.id!=="none"}),fallen=allies.some(ally=>(ally.hp??0)<=0),wounded=allies.some(ally=>(ally.hp??0)>0&&(ally.hp/Math.max(1,ally.maxHp))<.68),statusCounts=Object.fromEntries(["poison","paralysis","burn","freeze","bleed","curse"].map(id=>[id,opponents.filter(monster=>(battle.allyAilments?.[monster.id]??[]).some(status=>status.id===id)).length])),effectCounts=Object.fromEntries(["spdDown","defDown","atkDown","accuracyDown","vulnerable"].map(kind=>[kind,opponents.filter(monster=>(battle.allyEffects?.[monster.id]??[]).some(effect=>effect.kind===kind)).length])),unpoisoned=statusCounts.poison<opponents.length,hasActiveCooldowns=opponents.some(monster=>Object.values(battle.cooldowns?.[monster.id]??{}).some(turns=>Number(turns)>0)),hasMp=opponents.some(monster=>(monster.currentMp??0)>0),lowMpCount=opponents.filter(monster=>(monster.currentMp??0)/Math.max(1,Number(monster.maxMp??monster.currentMp)||1)<=.30).length,emptyMpCount=opponents.filter(monster=>(monster.currentMp??0)<=0).length,guarded=opponents.some(monster=>Boolean(battle.guards?.[monster.id])||(battle.allyEffects?.[monster.id]??[]).some(effect=>effect.kind==="guard")),hasMark=opponents.some(monster=>Boolean(battle.floorBossTargetMarks?.[enemy.id]?.[monster.id]));
 return{allies,opponents,battle,turn,buffed,hasCircle,fallen,wounded,unpoisoned,statusCounts,effectCounts,hasActiveCooldowns,hasMp,lowMpCount,emptyMpCount,guarded,hasMark};
}
export function floorBossActionScore(enemy,actionId,context={}){
 const info=floorBossActionInfo(`floorBoss:${actionId}`);if(!info)return-Infinity;
 const ai=info.ai??{},state=floorBossTacticalState(enemy,context),uses=Math.max(0,Number(enemy.floorBossActionUses?.[actionId])||0),hpRate=enemy.hp/Math.max(1,enemy.maxHp);
	 if(Number(info.restoreArmorLayers)>0){const cap=Math.max(1,Math.floor(Number(enemy.floorBossPassive?.startingArmorLayers)||Number(info.restoreArmorLayers))),current=Math.max(0,Math.floor(Number(enemy._floorBossArmorLayers)||0));if(current>=cap)return-Infinity}
		 if(ai.once&&uses>0||ai.hpBelow!=null&&hpRate>ai.hpBelow||ai.hpAbove!=null&&hpRate<ai.hpAbove||ai.requiresFallen&&!state.fallen||ai.requiresWounded&&!state.wounded||ai.requiresFallenOrWounded&&!state.fallen&&!state.wounded||ai.requiresBuff&&!state.buffed||ai.requiresBuffOrCircle&&!state.buffed&&!state.hasCircle||ai.requiresUnpoisoned&&!state.unpoisoned||ai.requiresActiveCooldowns&&!state.hasActiveCooldowns||ai.requiresMark&&!state.hasMark||Array.isArray(ai.requiresEffects)&&!ai.requiresEffects.every(kind=>state.effectCounts[kind]>0)||Array.isArray(ai.requiresStatuses)&&!ai.requiresStatuses.every(id=>state.statusCounts[id]>0)||ai.partySizeAtLeast&&state.opponents.length<ai.partySizeAtLeast||ai.roundMin&&state.turn<ai.roundMin||info.shuffleNextRound&&enemy._floorBossShuffleNextRound||info.beginHealingChorus&&enemy._floorBossHealingChorus||info.applyPuppetLink&&enemy._floorBossPuppetLink&&Math.max(0,Number(enemy._floorBossPuppetLink.expiresTurn)||0)>=state.turn)return-Infinity;
		 let score=Number(ai.base??30);if(ai.opening)score+=state.turn<=2&&!uses?32:-18;if(enemy.floorBossLastActionId===actionId)score-=20;if(info.fillHpDrain)score+=(1-hpRate)*55;if(info.revive&&state.fallen)score+=80;if(info.revive&&!state.fallen&&Number(info.fallbackHeal)>0&&hpRate<.58)score+=32;if(info.heal&&state.wounded)score+=28;if(info.selfHeal)score+=(1-hpRate)*34;if((info.dispelOne||info.invertOneBuff)&&(state.buffed||state.hasCircle))score+=26;if(info.increaseAllyCooldowns&&state.hasActiveCooldowns)score+=22;if(info.status&&state.unpoisoned)score+=8;if(info.bonusVsStatus?.id&&state.statusCounts[info.bonusVsStatus.id]>0)score+=30;if(info.bonusVsEffect?.kind&&state.effectCounts[info.bonusVsEffect.kind]>0)score+=30;if(info.spreadAilment&&state.statusCounts[info.spreadAilment]>0&&state.statusCounts[info.spreadAilment]<state.opponents.length)score+=28;if(info.mpDrain&&state.hasMp)score+=10;if(info.hpShieldRate&&Number(enemy._floorBossHpShield)<enemy.maxHp*info.hpShieldRate*.5)score+=24;if(info.restoreArmorLayers){const cap=Math.max(1,Math.floor(Number(enemy.floorBossPassive?.startingArmorLayers)||Number(info.restoreArmorLayers)));score+=Math.max(0,cap-Math.max(0,Number(enemy._floorBossArmorLayers)||0))*14}if(info.consumeImpact)score+=Math.max(0,Number(enemy._floorBossImpactStacks)||0)*6;if(info.consumeMark&&state.hasMark)score+=32;if(info.consumeArchive)score+=Math.max(0,Number(enemy._floorBossArchiveStacks)||0)*8;if(info.consumeInversion)score+=Math.max(0,Number(enemy._floorBossInversionStacks)||0)*9;if(info.consumeDamageMemory)score+=Math.min(30,Math.max(0,Number(enemy._floorBossDamageMemory)||0)*100);if(info.consumeCooldownDebt&&state.hasActiveCooldowns)score+=24;if(info.consumePolarity)score+=Math.max(0,Number(enemy._floorBossPolarityStacks)||0)*10;if(info.consumeLifeEmber)score+=Math.min(32,Math.max(0,Number(enemy._floorBossLifeEmber)||0)/Math.max(1,enemy.maxHp)*130);if(info.consumeIceSeals)score+=Math.max(0,Number(enemy._floorBossIceSeals)||0)*11;if(enemy.floorBossDomain?.effect==="polarityOverload"&&["physical","magic"].includes(info.damageClass)&&enemy._floorBossPolarityType&&enemy._floorBossPolarityType!==info.damageClass)score+=18;if(info.consumeAilment&&state.statusCounts[info.consumeAilment]>0)score+=state.statusCounts[info.consumeAilment]*10;if(info.shatterFreeze&&state.statusCounts.freeze>0)score+=30;if(info.consumePrayerHeal)score+=Math.min(28,Math.max(0,Number(enemy._floorBossPrayerReserve)||0)/Math.max(1,enemy.maxHp)*120);if(enemy.floorBossDomain?.effect==="afterimageBurst"&&!info.utility)score+=Math.max(0,Number(enemy._floorBossAfterimages)||0)*5;if(enemy.floorBossDomain?.effect==="furnaceSprint"&&info.telegraph&&Math.max(0,Number(enemy._floorBossSprintStacks)||0)>=3)score+=28;if(enemy.floorBossDomain?.effect==="absoluteZeroLaw"&&info.telegraph&&Math.max(0,Number(enemy._floorBossZeroLaw)||0)%3===2)score+=26;if(enemy.floorBossDomain?.effect==="guardRuin"&&state.guarded&&!info.utility)score+=24;if(enemy._floorBossPowerReady&&!info.utility)score+=16;if((enemy._floorBossManaCharge||enemy._floorBossCriticalReady||enemy._floorBossStormCounterReady||enemy._floorBossShieldBrokenReady||enemy._floorBossAilmentMirrorReady||enemy._floorBossSealReady||enemy._floorBossRiposteReady||enemy._floorBossPearlReady||enemy._floorBossReflectionReady||enemy._floorBossArmorBreakReady||enemy._floorBossDuelRiposteReady)&&!info.utility)score+=18;
	 if(info.consumeToxinDoses)score+=Math.max(0,Number(enemy._floorBossToxinDoses)||0)*10;
	 if(info.networkBurst)score+=state.statusCounts.poison*8;
	 if(info.consumeSporeCells)score+=Math.max(0,Number(enemy._floorBossSporeCells)||0)*8;
	 if(info.consumeFlightStacks)score+=Math.max(0,Number(enemy._floorBossFlightStacks)||0)*7;
	 if(info.consumeBroodSacrifice)score+=Math.min(34,Math.max(0,Number(enemy._floorBossBroodSacrifice)||0)/Math.max(1,enemy.maxHp)*140);
	 if(info.manaVacuum)score+=state.lowMpCount*10+state.emptyMpCount*8;
	 if(Number(info.selfMpHealRate)>0)score+=(1-Math.max(0,Number(enemy.currentMp)||0)/Math.max(1,Number(enemy.maxMp)||1))*30;
	 if(info.deathVoltageStrike)score+=Math.max(0,Number(enemy._floorBossDeathVoltage)||0)*5;
	 if(info.consumeHealingReflection)score+=Math.min(34,Math.max(0,Number(enemy._floorBossHealingReflection)||0)*140);
	 if(info.telegraph&&enemy.floorBossDomain?.effect==="gemVelocity")score+=Math.max(0,Number(enemy._floorBossGemVelocity)||0)*5;
	 if(info.beginHealingChorus)score+=(1-hpRate)*45;
	 if(info.applyPuppetLink)score+=state.opponents.length>=2?24:-30;
	 if(info.triggerPuppetLink&&enemy._floorBossPuppetLink)score+=22;
	 if(info.consumeManaNocturne)score+=Math.min(36,Math.max(0,Number(enemy._floorBossManaNocturne)||0)*120);
	 if(info.eclipseFinale&&enemy._floorBossEclipseReady)score+=64;
 return score;
}
function chooseFloorBossSpecial(enemy,context={}){
 if(enemy.pendingFloorBossAction){const pending=enemy.pendingFloorBossAction;if(!canPay(enemy,pending)){enemy.charging=false;enemy.intent="予兆を維持しながら魔力を練る";return null}enemy.pendingFloorBossAction=null;enemy.charging=false;const info=floorBossActionInfo(pending),actionId=pending.slice(10);enemy.floorBossActionUses??={};enemy.floorBossActionUses[actionId]=(enemy.floorBossActionUses[actionId]??0)+1;enemy.floorBossLastActionId=actionId;enemy.specialCooldown=Math.max(1,Number(info?.cooldown)||2);enemy.intent=`${info?.label??"固有技"}を解放`;return pending}
 enemy.specialCooldown=Math.max(0,(enemy.specialCooldown??0)-1);if(enemy.specialCooldown>0)return null;
 const choices=enemy.floorBossActionIds.map(actionId=>({actionId,action:`floorBoss:${actionId}`,info:floorBossActionInfo(`floorBoss:${actionId}`),score:floorBossActionScore(enemy,actionId,context)})).filter(choice=>Number.isFinite(choice.score)&&canPay(enemy,choice.action)).sort((left,right)=>right.score-left.score);
 const selected=choices[0];if(!selected)return null;
 const urgent=selected.score>=72;if(!urgent&&Math.random()>.82)return null;
 if(selected.info?.telegraph){enemy.pendingFloorBossAction=selected.action;enemy.intent=`${selected.info.label}の予兆を刻む`;return ENEMY_ACTIONS.charge}
 enemy.floorBossActionUses??={};enemy.floorBossActionUses[selected.actionId]=(enemy.floorBossActionUses[selected.actionId]??0)+1;enemy.floorBossLastActionId=selected.actionId;enemy.specialCooldown=Math.max(1,Number(selected.info?.cooldown)||1);enemy.intent=`${selected.info?.label??"固有技"}を発動`;return selected.action;
}
function specialAction(enemy,hpRate,context={}){
 if((enemy.divineBarrier??0)>0)enemy.divineBarrier--;
 if(Array.isArray(enemy.floorBossActionIds)&&enemy.floorBossActionIds.length){
  return chooseFloorBossSpecial(enemy,context);
 }
 if(!enemy.endgameBossId)return null;enemy.specialCooldown=Math.max(0,(enemy.specialCooldown??0)-1);
 if(enemy.faction==="tenGod"&&hpRate<=.72&&!enemy.divineBarrierUsed){enemy.divineBarrierUsed=true;enemy.divineBarrier=2;enemy.intent="神域障壁を展開";return ENEMY_ACTIONS.divineBarrier}
 if(enemy.specialCooldown>0)return null;
 const profile=endgameCharacter(enemy.endgameBossId);
 if(profile){
  const authorities=profile.skills.slice(1),useUltimate=hpRate<=.32&&!enemy.authorityUltimateUsed||((enemy.authorityUses??0)+1)%5===0,index=useUltimate?authorities.length-1:(enemy.authorityIndex??0)%Math.max(1,authorities.length-1),skill=authorities[index];
  if(skill&&Math.random()<(enemy.faction==="tenGod"?.52:.46)){enemy.authorityIndex=(index+1)%Math.max(1,authorities.length-1);enemy.authorityUses=(enemy.authorityUses??0)+1;if(useUltimate)enemy.authorityUltimateUsed=true;enemy.specialCooldown=Math.max(1,Math.min(4,Number(skill.cooldown)||2));enemy.intent=`${skill.name}を発動`;return`authority:${skill.id}`}
  return null;
 }
 const config=BOSS_SPECIALS[enemy.endgameBossId];if(!config)return null;
 if(Math.random()<config.chance){enemy.specialCooldown=config.cooldown;enemy.intent=config.intent;return ENEMY_ACTIONS[config.action]}
 return null;
}
export function enemyActionMpCost(enemy,action){
 if(!enemy||!action||[ENEMY_ACTIONS.attack,ENEMY_ACTIONS.guard,ENEMY_ACTIONS.charge,ENEMY_ACTIONS.power,ENEMY_ACTIONS.enrage,ENEMY_ACTIONS.manaSiphon].includes(action))return 0;
 const maximum=Math.max(1,Number(enemy.maxMp)||1);
 const floorBossInfo=String(action).startsWith("floorBoss:")?floorBossActionInfo(action):null;
 const rate=floorBossInfo?.mpCostRate??(action===ENEMY_ACTIONS.heal?.14
  :action===ENEMY_ACTIONS.packRevive?.28
  :action===ENEMY_ACTIONS.packMend?.18
  :action===ENEMY_ACTIONS.packRally?.16
  :action===ENEMY_ACTIONS.dispelWave?.18
  :action===ENEMY_ACTIONS.divineBarrier?.22
  :String(action).startsWith("floorBoss:")?.22
  :String(action).startsWith("authority:")?.26
  :enemy.endgameBossId?.24:.19);
 return Math.max(1,Math.ceil(maximum*rate));
}
function canPay(enemy,action){return Math.max(0,Number(enemy.currentMp)||0)>=enemyActionMpCost(enemy,action)}
export function chooseEnemyAction(enemy,context={}){
 if(enemy.speciesId==="ochuki"){enemy.guard=true;enemy.intent="巨大な盾の陰で逃げ道を探す";return ENEMY_ACTIONS.guard}
 const allies=(context.allies??[enemy]).filter(Boolean),opponents=(context.opponents??[]).filter(monster=>(monster.currentHp??0)>0),hpRate=enemy.hp/enemy.maxHp,role=String(enemy.role??""),support=["healer","support","controller","debuffer","magic"].some(value=>role.includes(value));
 const floorBoss=Array.isArray(enemy.floorBossActionIds)&&enemy.floorBossActionIds.length,fallen=allies.find(ally=>ally.hp<=0),wounded=[...allies].filter(ally=>ally.hp>0).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
 if(floorBoss){const special=specialAction(enemy,hpRate,context);if(special&&canPay(enemy,special))return special}
 if(fallen&&support&&canPay(enemy,ENEMY_ACTIONS.packRevive)){enemy.intent="倒れた味方を再構成";return ENEMY_ACTIONS.packRevive}
 if(wounded&&wounded.hp/wounded.maxHp<.42&&support&&canPay(enemy,ENEMY_ACTIONS.packMend)){enemy.intent="負傷した群れを再生";return ENEMY_ACTIONS.packMend}
 const buffed=opponents.some(monster=>(context.battle?.allyEffects?.[monster.id]??[]).some(effect=>FLOOR_BOSS_POSITIVE_KINDS.has(effect.kind)));
 if(buffed&&support&&Math.random()<.64&&canPay(enemy,ENEMY_ACTIONS.dispelWave)){enemy.intent="味方の強化を崩す";return ENEMY_ACTIONS.dispelWave}
 if((enemy.currentMp??0)<enemy.maxMp*.24&&opponents.some(monster=>(monster.currentMp??0)>0)&&Math.random()<.72){enemy.intent="魔力を奪って立て直す";return ENEMY_ACTIONS.manaSiphon}
 if(!floorBoss){const special=specialAction(enemy,hpRate,context);if(special&&canPay(enemy,special))return special;const tactical=normalSpecialAction(enemy,hpRate);if(tactical&&canPay(enemy,tactical))return tactical}
 if(enemy.charging){enemy.charging=false;enemy.intent="強攻撃を放つ";return ENEMY_ACTIONS.power}
 if(enemy.boss&&hpRate<=.5&&!enemy.enraged){enemy.enraged=true;enemy.phase=2;enemy.intent=enemy.endgameBossId?"権能が暴走する":"狂暴化";return ENEMY_ACTIONS.enrage}
 if(hpRate<=.3&&!enemy.healed&&Math.random()<.5&&canPay(enemy,ENEMY_ACTIONS.heal)){enemy.healed=true;enemy.intent="自己回復";return ENEMY_ACTIONS.heal}
 const roll=Math.random(),guardChance=enemy.boss?.12:.18,chargeChance=enemy.boss?.25:.16;
 if(roll<guardChance){enemy.guard=true;enemy.intent="防御態勢";return ENEMY_ACTIONS.guard}
 if(roll<guardChance+chargeChance){enemy.charging=true;enemy.intent="力を溜めている";return ENEMY_ACTIONS.charge}
 enemy.intent=enemy.enraged?"狂乱攻撃":"通常攻撃";return ENEMY_ACTIONS.attack;
}
export function enemyDamageMultiplier(enemy){let mult=1;if(enemy.guard){enemy.guard=false;mult*=.48}if((enemy.divineBarrier??0)>0)mult*=.35;return mult}
export function enemyHealAmount(enemy){return Math.max(1,Math.floor(enemy.maxHp*(enemy.endgameBossId?.28:enemy.boss?(enemy.bossHealRate??.12):.16)))}
export function enemyAttackMultiplier(enemy,action){if(action===ENEMY_ACTIONS.power)return enemy.endgameBossId?2.55:enemy.boss?(enemy.bossPowerMultiplier??1.8):1.8;if(enemy.enraged)return enemy.endgameBossId?1.55:enemy.boss?1.3:1.35;return 1}
function authorityInfo(action){
 if(typeof action!=="string"||!action.startsWith("authority:"))return null;const skill=endgameSkillById(action.slice(10));if(!skill)return null;
 const utility=["buff","stance","allHeal","selfHeal","revive","cleanse","mpHeal"].includes(skill.type);
 return{...skill,label:skill.name,pattern:utility?"self":skill.allEnemies?"all":skill.execute||skill.drain?"singleWeak":"singleStrong",multiplier:Math.max(0,Number(skill.power)||0),utility,element:skill.element};
}
export function specialActionMultiplier(action){return authorityInfo(action)?.multiplier??SPECIAL_ACTION_INFO[action]?.multiplier??1}
export function specialActionInfo(action){return authorityInfo(action)??floorBossActionInfo(action)??SPECIAL_ACTION_INFO[action]??null}
