import{bossProfileForFloor,post9000DepthProfile}from"../core/EnemyScalingSystem.js?v=2.9.0";
import{endgameCharacter,endgameSkillById}from"../data/endgameCharacters.js?v=2.9.0";
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
 venomCloud:{label:"猛毒霧",pattern:"all",multiplier:.78,element:"poison",status:{id:"poison",name:"毒",chance:.75,turns:4,power:.045}},
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
 const maxHp=Math.max(1,Math.floor((species.baseStats.hp+source.level*8)*profile.hp*depth.hp));
 const maxEnemyMp=Math.max(8,Math.floor(((species.maxMp??18)+source.level*.32)*(boss?1.35:1)));
 const baseName=source.nameOverride??(boss?`深淵の${species.name}`:species.name),depthName=depth.active&&depth.step>0&&!source.nameOverride?`【${depth.label}】${baseName}`:baseName;
 const atk=Math.floor((species.baseStats.atk+source.level*1.4)*profile.atk*depth.atk),def=Math.floor((species.baseStats.def+source.level*.5)*profile.def*depth.def),magicRole=["magic","support","healer","controller","debuffer","poison","burner"].some(value=>String(species.role??"").includes(value));
 return{...source,speciesId:source.speciesId,name:depthName,level:source.level,hp:maxHp,maxHp,
  atk,matk:Math.max(1,Math.floor(atk*(magicRole?1.08:.72))),def,mdef:Math.max(0,Math.floor(def*(magicRole?1.08:.82))),spd:Math.floor((species.baseStats.spd+source.level*.18)*profile.spd*depth.spd),
  emoji:species.emoji??"👾",color:boss?"#bb4cff":species.baseStats.atk>12?"#df6262":"#a58f59",boss,bossTier:profile.tier,bossStatusResist:Math.min(.9,(profile.statusResist??0)+depth.statusResist),bossHealRate:profile.healRate,bossPowerMultiplier:profile.powerMultiplier,depthTier:depth.label,depthStep:depth.step,depthPressure:depth.active?Math.round(depth.step*10):0,phase:1,enraged:false,guard:false,charging:false,healed:false,
  intent:"様子を見ている",maxMp:maxEnemyMp,currentMp:Math.max(0,Math.min(maxEnemyMp,Number(source.currentMp??maxEnemyMp))),specialCooldown:0,divineBarrier:0,role:species.role??"balanced",element:species.element??"neutral"};
}
function normalSpecialAction(enemy,hpRate){
 enemy.specialCooldown=Math.max(0,(enemy.specialCooldown??0)-1);if(enemy.specialCooldown>0)return null;
 const role=String(enemy.role??""),alliesSupport=["healer","support","controller"].some(value=>role.includes(value));
 if(alliesSupport&&hpRate<.72&&Math.random()<(enemy.boss?.7:.44)){enemy.specialCooldown=2;enemy.intent=role.includes("heal")?"群体を再生する":"群勢を強化する";return role.includes("heal")?ENEMY_ACTIONS.packMend:ENEMY_ACTIONS.packRally}
 const action=({fire:ENEMY_ACTIONS.flameSweep,ice:ENEMY_ACTIONS.frostNova,water:ENEMY_ACTIONS.frostNova,poison:ENEMY_ACTIONS.venomCloud,nature:ENEMY_ACTIONS.venomCloud,lightning:ENEMY_ACTIONS.thunderChain,thunder:ENEMY_ACTIONS.thunderChain,earth:ENEMY_ACTIONS.earthRupture,wind:ENEMY_ACTIONS.galeRend,dark:ENEMY_ACTIONS.shadowCurse,light:ENEMY_ACTIONS.radiantVolley})[enemy.element];
 if(action&&Math.random()<(enemy.boss?.76:.4)){enemy.specialCooldown=enemy.boss?1:(Math.random()<.35?1:2);enemy.intent=`${SPECIAL_ACTION_INFO[action].label}を放つ`;return action}
 return null;
}
function specialAction(enemy,hpRate){
 if(!enemy.endgameBossId)return null;enemy.specialCooldown=Math.max(0,(enemy.specialCooldown??0)-1);if(enemy.divineBarrier>0)enemy.divineBarrier--;
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
 const rate=action===ENEMY_ACTIONS.heal?.14
  :action===ENEMY_ACTIONS.packRevive?.28
  :action===ENEMY_ACTIONS.packMend?.18
  :action===ENEMY_ACTIONS.packRally?.16
  :action===ENEMY_ACTIONS.dispelWave?.18
  :action===ENEMY_ACTIONS.divineBarrier?.22
  :String(action).startsWith("authority:")?.26
  :enemy.endgameBossId?.24:.19;
 return Math.max(1,Math.ceil(maximum*rate));
}
function canPay(enemy,action){return Math.max(0,Number(enemy.currentMp)||0)>=enemyActionMpCost(enemy,action)}
export function chooseEnemyAction(enemy,context={}){
 if(enemy.speciesId==="ochuki"){enemy.guard=true;enemy.intent="巨大な盾の陰で逃げ道を探す";return ENEMY_ACTIONS.guard}
 const allies=(context.allies??[enemy]).filter(Boolean),opponents=(context.opponents??[]).filter(monster=>(monster.currentHp??0)>0),hpRate=enemy.hp/enemy.maxHp,role=String(enemy.role??""),support=["healer","support","controller","debuffer","magic"].some(value=>role.includes(value));
 const fallen=allies.find(ally=>ally.hp<=0),wounded=[...allies].filter(ally=>ally.hp>0).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
 if(fallen&&support&&canPay(enemy,ENEMY_ACTIONS.packRevive)){enemy.intent="倒れた味方を再構成";return ENEMY_ACTIONS.packRevive}
 if(wounded&&wounded.hp/wounded.maxHp<.42&&support&&canPay(enemy,ENEMY_ACTIONS.packMend)){enemy.intent="負傷した群れを再生";return ENEMY_ACTIONS.packMend}
 const positiveKinds=new Set(["atkUp","defUp","spdUp","regen","taunt","guard","counter","lifeSteal"]),buffed=opponents.some(monster=>(context.battle?.allyEffects?.[monster.id]??[]).some(effect=>positiveKinds.has(effect.kind)));
 if(buffed&&support&&Math.random()<.64&&canPay(enemy,ENEMY_ACTIONS.dispelWave)){enemy.intent="味方の強化を崩す";return ENEMY_ACTIONS.dispelWave}
 if((enemy.currentMp??0)<enemy.maxMp*.24&&opponents.some(monster=>(monster.currentMp??0)>0)&&Math.random()<.72){enemy.intent="魔力を奪って立て直す";return ENEMY_ACTIONS.manaSiphon}
 const special=specialAction(enemy,hpRate);if(special&&canPay(enemy,special))return special;
 const tactical=normalSpecialAction(enemy,hpRate);if(tactical&&canPay(enemy,tactical))return tactical;
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
export function specialActionInfo(action){return authorityInfo(action)??SPECIAL_ACTION_INFO[action]??null}
