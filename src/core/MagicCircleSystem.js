const freeze=value=>Object.freeze(value);

export const MAGIC_CIRCLE_STATE_VERSION=4;

function safeCircleLevel(level=1){return Math.max(1,Math.min(99,Math.floor(Number(level)||1)))}
function circleLevelProgress(level=1){return(safeCircleLevel(level)-1)/98}
function roundedRate(value){return Number(Math.max(0,Number(value)||0).toFixed(4))}
function percentText(value,digits=1){
 const amount=Math.max(0,Number(value)||0)*100;
 return`${amount.toFixed(digits).replace(/\.0$/,"")}%`;
}

const circle=(id,name,glyph,tone,baseUpgrade,summary,effect,asset,{staticArt=false}={})=>{
 const assetId=asset??id,primary=`./assets/magic-circles/${assetId}.png`;
 return freeze({
  id,name,glyph,tone,baseUpgrade,summary,effect,asset:primary,
  frames:freeze(id==="none"||staticArt?[primary]:[primary,`./assets/magic-circles/${assetId}-2.png`,`./assets/magic-circles/${assetId}-3.png`])
 });
};

export const MAGIC_CIRCLES=freeze([
 circle("none","魔法陣なし","◇","plain",0,"効果なし。足元には素環ガイドだけを表示します。","none","plain"),
 circle("slot_fate","運命の三桁環","777","violet",180_000_000,"行動開始時に000〜999。000は休止、他は0.5〜3倍。","slot"),
 circle("last_life","不屈の残光","1","gold",120_000_000,"戦闘中1回、致死ダメージをHP1で耐える。","lastLife"),
 circle("reincarnation","輪廻の魔法陣","∞","rose",360_000_000,"戦闘不能時に一度だけ蘇生する。戦闘全体の蘇生上限は99回。","revive"),
 circle("mana_reversal","魔力反転陣","MP","cyan",160_000_000,"与ダメージ上昇。MP回復時、回復量に応じてHPを失う。","manaReversal"),
 circle("deep_silence","深神封殺陣","×","black",900_000_000,"深淵・十神から受ける攻撃はクリティカルにならない。","endgameNoCrit"),
 circle("aegis","半月障壁陣","50","blue",220_000_000,"戦闘開始時、最大HP50%分のシールドを得る。","shield"),
 circle("opening_rite","開戦共鳴陣","20","red",280_000_000,"戦闘開始時、味方全体の最終ダメージ・会心率+20%。","openingBuff"),
 circle("judgment20","二十刻終焉陣","XX","black",1_600_000_000,"20ターン生存すると、自分以外の敵味方を終焉へ導く。","turn20"),
 circle("blood_acceleration","血走加速陣","≫","red",420_000_000,"被弾するほど速度・連撃率・最終ダメージが増す。","rage"),
 circle("weak_critical","弱撃必殺陣","!","gold",240_000_000,"弱い攻撃ほどクリティカル率が高くなる。","weakCrit"),
 circle("sacrifice_lottery","等価滅殺陣","⇄","rose",720_000_000,"味方をランダムに1体失い、敵をランダムに1体即死させる。","sacrifice"),
 circle("inheritance","継承の葬環","†","violet",300_000_000,"この者が倒れると、生存する味方へ力を継承する。","inheritance"),
 circle("gold_power","黄金換力陣","G","gold",1_100_000_000,"所持GOLDに応じて攻撃上昇（強い逓減・Lv.1は最大+18%、Lv.99は最大+30%）。行動ごとの消費は最大10万G。","goldPower"),
 circle("random_arsenal","万象抽選陣","?","rainbow",1_800_000_000,"固有スキルを封じ、全スキルから毎行動ランダムに発動。","randomSkill"),
 circle("sole_survivor","孤王覚醒陣","Ⅰ","black",620_000_000,"最後の生存者になると全能力と連撃率が大幅上昇。","soleSurvivor"),
 circle("death_drain","断末吸魔陣","MP","violet",380_000_000,"この者が倒れると、敵全体のMPを大量に奪う。","deathDrain"),
 circle("crimson_threshold","瀕死紅蓮陣","HP","red",460_000_000,"HPが少ないほど最終ダメージが上昇する。","lowHpPower"),
 circle("death_mirror","即死返鏡陣","鏡","cyan",760_000_000,"最初に受ける即死を無効化し、使用者へ反射する。","deathMirror"),
 circle("raid_zero_sovereign","零界凍結陣","氷","blue",980_000_000,"戦闘開始時、氷晶の障壁で味方全体を守る。","shield","raid-zero-sovereign",{staticArt:true}),
 circle("raid_vajra_beast","天雷轟界陣","雷","gold",1_080_000_000,"被弾するほど雷勢が高まり、連撃と最終ダメージが増す。","rage","raid-vajra-beast",{staticArt:true})
]);

const BY_ID=new Map(MAGIC_CIRCLES.map(entry=>[entry.id,entry]));
export function magicCircleById(id){return BY_ID.get(id)??BY_ID.get("none")}

/**
 * Canonical player-side values for a magic circle at a given level.
 *
 * Keeping the progression contract here prevents the workshop, battle and
 * online profile from inventing different values.  Level 1 deliberately
 * preserves the pre-v4 battle values; levels 2-99 add bounded improvements.
 */
export function magicCircleLevelEffect(entryOrId,level=1){
 const entry=typeof entryOrId==="string"?magicCircleById(entryOrId):entryOrId??magicCircleById("none"),safeLevel=entry.id==="none"?0:safeCircleLevel(level),progress=entry.id==="none"?0:circleLevelProgress(safeLevel);
 const base={id:entry.id,effect:entry.effect,level:safeLevel,progress:roundedRate(progress)};
 if(entry.effect==="none")return freeze({...base,summary:"効果なし"});
 if(entry.effect==="slot"){
  const damageMin=.5,damageMax=3+.5*progress;
  return freeze({...base,damageMin,damageMax:roundedRate(damageMax),instantKillRoll:999,summary:`通常抽選 ${damageMin.toFixed(1)}〜${damageMax.toFixed(2)}倍`});
 }
 if(entry.effect==="lastLife"){
  const surviveHpRate=.25*progress;
  return freeze({...base,surviveHpRate:roundedRate(surviveHpRate),minimumHp:1,summary:surviveHpRate?`致死耐久後 HP${percentText(surviveHpRate)}で生存`:`致死耐久後 HP1で生存`});
 }
 if(entry.effect==="revive"){
  const reviveHpRate=.40+.30*progress,reviveMpRate=.25+.25*progress;
  return freeze({...base,reviveHpRate:roundedRate(reviveHpRate),reviveMpRate:roundedRate(reviveMpRate),summary:`蘇生 HP${percentText(reviveHpRate)}・MP${percentText(reviveMpRate)}`});
 }
 if(entry.effect==="manaReversal"){
  const damageMultiplier=1.12+Math.min(.18,safeLevel*.004);
  return freeze({...base,damageMultiplier:roundedRate(damageMultiplier),summary:`与ダメージ ×${damageMultiplier.toFixed(3)}`});
 }
 if(entry.effect==="endgameNoCrit"){
  const damageReductionRate=.15*progress;
  return freeze({...base,preventsCritical:true,damageReductionRate:roundedRate(damageReductionRate),summary:`深淵・十神の会心無効${damageReductionRate?`・被ダメージ${percentText(damageReductionRate)}軽減`:""}`});
 }
 if(entry.effect==="shield"){
  const shieldRate=.50+.20*progress;
  return freeze({...base,shieldRate:roundedRate(shieldRate),summary:`開戦障壁 最大HP${percentText(shieldRate)}`});
 }
 if(entry.effect==="openingBuff"){
  const damageRate=.20+.10*progress,criticalRate=.20+.10*progress;
  return freeze({...base,damageRate:roundedRate(damageRate),criticalRate:roundedRate(criticalRate),summary:`味方全体 与ダメ・会心率 +${percentText(damageRate)}`});
 }
 if(entry.effect==="turn20"){
  const triggerTurn=Math.round(20-8*progress);
  return freeze({...base,triggerTurn,summary:`終焉発動 ${triggerTurn}ターン`});
 }
 if(entry.effect==="rage"){
  const damagePerHit=.08+.02*progress,maxDamageBonus=1+.25*progress;
  return freeze({...base,damagePerHit:roundedRate(damagePerHit),maxDamageBonus:roundedRate(maxDamageBonus),firstChainHits:4,secondChainHits:9,summary:`被弾ごと与ダメ +${percentText(damagePerHit)}・最大+${percentText(maxDamageBonus)}`});
 }
 if(entry.effect==="weakCrit"){
  const criticalCeiling=.48+.12*progress;
  return freeze({...base,criticalCeiling:roundedRate(criticalCeiling),minimumCriticalBonus:.05,summary:`弱攻撃の会心補正 最大+${percentText(criticalCeiling-.10)}`});
 }
 if(entry.effect==="sacrifice"){
  const survivorShieldRate=.25*progress;
  return freeze({...base,survivorShieldRate:roundedRate(survivorShieldRate),summary:survivorShieldRate?`等価滅殺後、生存者へ最大HP${percentText(survivorShieldRate)}障壁`:`味方1体と敵1体へ即死判定`});
 }
 if(entry.effect==="inheritance"){
  const attackRate=.30+.15*progress,defenseRate=.30+.15*progress,speedRate=.20+.10*progress,turns=Math.round(5+3*progress);
  return freeze({...base,attackRate:roundedRate(attackRate),defenseRate:roundedRate(defenseRate),speedRate:roundedRate(speedRate),turns,summary:`継承 ATK・DEF+${percentText(attackRate)}／SPD+${percentText(speedRate)}・${turns}T`});
 }
 if(entry.effect==="goldPower"){
  const damageCap=.18+.12*progress;
  return freeze({...base,damageCap:roundedRate(damageCap),summary:`所持GOLD換力 最大+${percentText(damageCap)}`});
 }
 if(entry.effect==="randomSkill"){
  const randomSkillDamageRate=.25*progress;
  return freeze({...base,randomSkillDamageRate:roundedRate(randomSkillDamageRate),summary:randomSkillDamageRate?`ランダム発動スキル 与ダメ+${percentText(randomSkillDamageRate)}`:`全スキルからランダム発動`});
 }
 if(entry.effect==="soleSurvivor"){
  const damageMultiplier=2+.4*progress,damageReductionRate=.40+.15*progress;
  return freeze({...base,damageMultiplier:roundedRate(damageMultiplier),damageReductionRate:roundedRate(damageReductionRate),summary:`最後の生存者 与ダメ×${damageMultiplier.toFixed(2)}・被ダメ${percentText(damageReductionRate)}軽減`});
 }
 if(entry.effect==="deathDrain"){
  const enemyMpDrainRate=.65+.25*progress;
  return freeze({...base,enemyMpDrainRate:roundedRate(enemyMpDrainRate),summary:`戦闘不能時、敵全体MPを${percentText(enemyMpDrainRate)}減少`});
 }
 if(entry.effect==="lowHpPower"){
  const maximumDamageBonus=1.25+.35*progress;
  return freeze({...base,maximumDamageBonus:roundedRate(maximumDamageBonus),summary:`瀕死時の最大与ダメージ +${percentText(maximumDamageBonus)}`});
 }
 if(entry.effect==="deathMirror"){
  const reflectedHealRate=.30*progress;
  return freeze({...base,reflectedHealRate:roundedRate(reflectedHealRate),summary:reflectedHealRate?`即死反射後 HP${percentText(reflectedHealRate)}回復`:`最初の即死を無効化・反射`});
 }
 return freeze({...base,genericPowerRate:roundedRate(.25*progress),summary:`基礎効果 +${percentText(.25*progress)}`});
}

function safeInstanceId(value){return/^[a-zA-Z0-9:_-]{4,120}$/.test(String(value??""))?String(value):null}
function nextInstanceId(state,circleId){
 const source=globalThis.crypto?.randomUUID?.()??`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
 let id=`mc:${circleId}:${source}`,suffix=1,used=new Set((state.magicCircles?.instances??[]).map(item=>item.instanceId));
 while(used.has(id))id=`mc:${circleId}:${source}:${suffix++}`;
 return id;
}
function rebuildOwnedCompatibility(magicCircles){
 const owned={};
 for(const item of magicCircles.instances??[])owned[item.circleId]=Math.max(owned[item.circleId]??0,item.level);
 magicCircles.owned=owned;
}

function roundedUpgradePrice(baseUpgrade,level,{coefficient,exponent}){
 const safeBase=Math.max(0,Number(baseUpgrade)||0),safeLevel=safeCircleLevel(level),raw=safeBase*coefficient*Math.pow(safeLevel+1,exponent);
 return Math.min(Number.MAX_SAFE_INTEGER,Math.max(1000,Math.round(raw/1000)*1000));
}

export function legacyMagicCircleUpgradePrice(entryOrId,level=1){
 const entry=typeof entryOrId==="string"?magicCircleById(entryOrId):entryOrId;
 return roundedUpgradePrice(entry?.baseUpgrade,level,{coefficient:.004,exponent:1.65});
}

function upgradeInvestment(instances,priceForLevel){
 let total=0;
 for(const instance of instances??[]){
  const entry=magicCircleById(instance?.circleId),level=safeCircleLevel(instance?.level);
  if(entry.id==="none")continue;
  for(let paidLevel=1;paidLevel<level;paidLevel++)total=Math.min(Number.MAX_SAFE_INTEGER,total+priceForLevel(entry,paidLevel));
 }
 return total;
}

export function normalizeMagicCircleState(state){
 const source=state?.magicCircles&&typeof state.magicCircles==="object"&&!Array.isArray(state.magicCircles)?state.magicCircles:{};
 const sourceVersion=Math.max(0,Math.floor(Number(source.version)||0));
 const legacyOwned=source.owned&&typeof source.owned==="object"&&!Array.isArray(source.owned)?source.owned:{};
 const unlocked={};
 for(const entry of MAGIC_CIRCLES){
  if(entry.id==="none")continue;
  if(source.unlocked?.[entry.id]||Number(legacyOwned[entry.id])>0)unlocked[entry.id]=true;
 }
 const instances=[],usedIds=new Set();
 if(Array.isArray(source.instances))for(const raw of source.instances){
  const circleId=magicCircleById(raw?.circleId).id;
  if(circleId==="none")continue;
  let instanceId=safeInstanceId(raw?.instanceId)??`mc:${circleId}:migrated-${instances.length+1}`;
  while(usedIds.has(instanceId))instanceId=`${instanceId}-${instances.length+1}`;
  usedIds.add(instanceId);
  instances.push({instanceId,circleId,level:Math.max(1,Math.min(99,Math.floor(Number(raw?.level)||1))),source:String(raw?.source??"inventory").slice(0,32),createdAt:Math.max(0,Math.floor(Number(raw?.createdAt)||0)),locked:Boolean(raw?.locked),favorite:Boolean(raw?.favorite)});
 }
 // v2の「種類ごとに1個」を、決定的な現物IDを持つ1個へ移行する。
 if(!instances.length)for(const entry of MAGIC_CIRCLES){
  if(entry.id==="none")continue;
  const level=Math.floor(Number(legacyOwned[entry.id])||0);if(level<=0)continue;
  const instanceId=`mc:${entry.id}:legacy`;usedIds.add(instanceId);
  instances.push({instanceId,circleId:entry.id,level:Math.min(99,level),source:"legacy",createdAt:0,locked:false,favorite:false});
 }
 let goldSpent=Math.max(0,Math.floor(Number(source.goldSpent)||0));
 const rebalanceApplied=Number(state?.magicCircleRebalance?.version)>=MAGIC_CIRCLE_STATE_VERSION;
 if(sourceVersion>0&&sourceVersion<MAGIC_CIRCLE_STATE_VERSION&&!rebalanceApplied){
  const legacyInvestment=upgradeInvestment(instances,legacyMagicCircleUpgradePrice),currentInvestment=upgradeInvestment(instances,magicCircleUpgradePrice),theoreticalRefund=Math.max(0,legacyInvestment-currentInvestment),refund=Math.min(goldSpent,theoreticalRefund);
  state.player??={};state.player.gold=Math.min(Number.MAX_SAFE_INTEGER,Math.max(0,Math.floor(Number(state.player.gold)||0))+refund);goldSpent=Math.max(0,goldSpent-refund);
  state.magicCircleRebalance={version:MAGIC_CIRCLE_STATE_VERSION,refund,appliedAt:new Date().toISOString()};
 }
 state.magicCircles={...source,unlocked,instances,goldSpent,version:MAGIC_CIRCLE_STATE_VERSION};
 rebuildOwnedCompatibility(state.magicCircles);

 // 魔法陣は出撃パーティー専用。旧版で控えへ残った装着情報もここで
 // 自動修復し、一覧へ名前だけが残り続ける状態を防ぐ。
 const byId=new Map((state.monsters??[]).map(monster=>[monster.id,monster]));
 const partyIds=new Set((state.party??[]).filter(id=>byId.has(id)));
 for(const monster of state.monsters??[])if(!partyIds.has(monster.id)){monster.magicCircleId="none";monster.magicCircleInstanceId=null}
 const ordered=[...(state.party??[]).map(id=>byId.get(id)).filter(Boolean)],assigned=new Set(),byInstance=new Map(instances.map(item=>[item.instanceId,item]));
 for(const monster of ordered){
  let instance=byInstance.get(monster.magicCircleInstanceId);
  const legacyId=monster.magicCircleId;
  if(!instance&&legacyId&&legacyId!=="none"&&legacyId!=="plain")instance=instances.find(item=>item.circleId===legacyId&&!assigned.has(item.instanceId));
  if(!instance||assigned.has(instance.instanceId)){monster.magicCircleId="none";monster.magicCircleInstanceId=null;continue}
  assigned.add(instance.instanceId);monster.magicCircleId=instance.circleId;monster.magicCircleInstanceId=instance.instanceId;
 }
 return state.magicCircles;
}

export function isMagicCircleUnlocked(state,id){normalizeMagicCircleState(state);return id==="none"||Boolean(state.magicCircles.unlocked?.[id])}
export function magicCircleInstances(state,id=null){normalizeMagicCircleState(state);return state.magicCircles.instances.filter(item=>!id||item.circleId===id)}
export function magicCircleInstanceById(state,instanceId){normalizeMagicCircleState(state);return state.magicCircles.instances.find(item=>item.instanceId===instanceId)??null}
export function createMagicCircleInstance(state,circleId,{level=1,instanceId=null,source="reward",locked=false,favorite=false}={}){
 normalizeMagicCircleState(state);const entry=magicCircleById(circleId);if(entry.id==="none")return null;
 const safeId=safeInstanceId(instanceId);if(safeId&&state.magicCircles.instances.some(item=>item.instanceId===safeId))return null;
 const item={instanceId:safeId??nextInstanceId(state,entry.id),circleId:entry.id,level:Math.max(1,Math.min(99,Math.floor(Number(level)||1))),source:String(source).slice(0,32),createdAt:Date.now(),locked:Boolean(locked),favorite:Boolean(favorite)};
 state.magicCircles.instances.push(item);rebuildOwnedCompatibility(state.magicCircles);return item;
}
export function removeMagicCircleInstance(state,instanceId){
 normalizeMagicCircleState(state);const index=state.magicCircles.instances.findIndex(item=>item.instanceId===instanceId);if(index<0)return null;
 const[item]=state.magicCircles.instances.splice(index,1);for(const monster of state.monsters??[])if(monster.magicCircleInstanceId===instanceId){monster.magicCircleId="none";monster.magicCircleInstanceId=null}rebuildOwnedCompatibility(state.magicCircles);return item;
}

export function magicCircleOwner(state,idOrInstance,{excludeMonsterId=null}={}){
 if(!idOrInstance||idOrInstance==="none")return null;normalizeMagicCircleState(state);
 const instance=state.magicCircles.instances.find(item=>item.instanceId===idOrInstance),circleId=instance?.circleId??idOrInstance;
 const assigned=new Set((state.monsters??[]).filter(monster=>monster.id!==excludeMonsterId).map(monster=>monster.magicCircleInstanceId).filter(Boolean));
 if(instance)return(state.monsters??[]).find(monster=>monster.id!==excludeMonsterId&&monster.magicCircleInstanceId===instance.instanceId)??null;
 const free=state.magicCircles.instances.some(item=>item.circleId===circleId&&!assigned.has(item.instanceId));if(free)return null;
 return(state.monsters??[]).find(monster=>monster.id!==excludeMonsterId&&monster.magicCircleId===circleId)??null;
}

export function unlockMagicCircleFromTree(state,id){
 normalizeMagicCircleState(state);const entry=magicCircleById(id);if(entry.id==="none")return{ok:false,message:"無装備は解禁不要です。"};
 const already=Boolean(state.magicCircles.unlocked[entry.id]);state.magicCircles.unlocked[entry.id]=true;
 let instance=state.magicCircles.instances.find(item=>item.circleId===entry.id)??null;if(!already&&!instance)instance=createMagicCircleInstance(state,entry.id,{level:1,source:"skillTree"});
 return{ok:true,circle:entry,level:instance?.level??0,instance,already};
}

export function equippedMagicCircle(monster,state){
 normalizeMagicCircleState(state);const instance=state.magicCircles.instances.find(item=>item.instanceId===monster?.magicCircleInstanceId),entry=magicCircleById(instance?.circleId??monster?.magicCircleId),level=entry.id==="none"?0:instance?.level??magicCircleLevel(state,entry.id);
 return{...entry,level,levelEffect:magicCircleLevelEffect(entry,level||1),instanceId:instance?.instanceId??null};
}

export function magicCircleLevel(state,idOrInstance){
 if(idOrInstance==="none")return 0;normalizeMagicCircleState(state);const exact=state.magicCircles.instances.find(item=>item.instanceId===idOrInstance);if(exact)return exact.level;
 return Math.max(0,...state.magicCircles.instances.filter(item=>item.circleId===idOrInstance).map(item=>item.level));
}

export function magicCirclePrice(state,id){
 const entry=magicCircleById(id),level=magicCircleLevel(state,id);
 if(entry.id==="none"||!level)return 0;
 return magicCircleUpgradePrice(entry,level);
}
export function magicCircleUpgradePrice(entryOrId,level=1){const entry=typeof entryOrId==="string"?magicCircleById(entryOrId):entryOrId;return roundedUpgradePrice(entry?.baseUpgrade,level,{coefficient:.0002,exponent:1.30})}

export function magicCircleLevelCapForFloor(floor=1){
 const value=Math.max(1,Math.floor(Number(floor)||1));
 if(value<20)return 1;
 if(value<40)return 3;
 if(value<60)return 6;
 if(value<80)return 10;
 if(value<100)return 15;
 if(value<200)return 25;
 if(value<500)return 40;
 if(value<1000)return 60;
 if(value<5000)return 80;
 return 99;
}

export function magicCircleProgressionStatus(state,level=1){
 const floor=Math.max(1,Math.floor(Number(state?.player?.maxFloor)||1)),cap=magicCircleLevelCapForFloor(floor),current=Math.max(1,Math.floor(Number(level)||1));
 const nextFloor=[20,40,60,80,100,200,500,1000,5000].find(value=>value>floor)??null;
 return Object.freeze({floor,cap,current,atCap:current>=cap,nextFloor});
}

export function magicCircleNextEffect(entryOrId,level=0){
 const entry=typeof entryOrId==="string"?magicCircleById(entryOrId):entryOrId;
 if(entry.id==="none")return"強化なし";
 const current=safeCircleLevel(level),next=Math.min(99,current+1);
 if(current>=99)return"最大Lv.99・強化完了";
 return`Lv.${next}：${magicCircleLevelEffect(entry,next).summary}`;
}

// GOLDを際限なく貯めても火力が発散しないよう、対数逓減とLv別の
// 明確な上限を両方設ける。所持資産の楽しさは残しつつ、Lv.1で最大
// +18%、Lv.99でも最大+30%までに限定する。
export function goldPowerDamageMultiplier(gold=0,level=1){
 const safeGold=Math.max(0,Number(gold)||0),safeLevel=Math.max(1,Math.min(99,Math.floor(Number(level)||1)));
 const cap=.18+(safeLevel-1)/98*.12;
 const progress=Math.min(1,Math.log10(1+safeGold/100_000)/4);
 return Number((1+cap*Math.max(0,progress)).toFixed(6));
}
export function goldPowerActionCost(gold=0){return Math.min(100_000,Math.max(1_000,Math.floor(Math.max(0,Number(gold)||0)*.00001)))}

export function buyOrUpgradeMagicCircle(state,id){
 normalizeMagicCircleState(state);
 // normalizeMagicCircleState は互換配列を再構築するため、この関数内では
 // 以後 normalize を呼ぶ公開ヘルパーを使わず、同じ現物IDを最後に再取得する。
 const exact=state.magicCircles.instances.find(item=>item.instanceId===id)??null,entry=magicCircleById(exact?.circleId??id),candidate=exact??state.magicCircles.instances.filter(item=>item.circleId===entry.id).sort((a,b)=>b.level-a.level)[0],instanceId=candidate?.instanceId??null,level=candidate?.level??0;
 if(entry.id==="none")return{ok:false,message:"魔法陣なしは強化できません。"};
 if(!state.magicCircles.unlocked?.[entry.id])return{ok:false,message:"この術式の知識は深淵ツリーで未解禁です。"};
 if(!level)return{ok:false,message:"現物を所持していません。再構築または交換で入手してください。"};
 if(level>=99)return{ok:false,message:"最大Lv.99です。"};
 const progression=magicCircleProgressionStatus(state,level);
 if(progression.atCap)return{ok:false,reason:"floor",message:progression.nextFloor?`${progression.nextFloor}階到達でLv.${magicCircleLevelCapForFloor(progression.nextFloor)}まで強化可能です。`:"現在の到達階層では強化上限です。",progression};
 const price=magicCircleUpgradePrice(entry,level),gold=Math.max(0,Number(state.player?.gold)||0);
 if(gold<price)return{ok:false,message:`GOLDが${price.toLocaleString()}G必要です`};
 const instance=state.magicCircles.instances.find(item=>item.instanceId===instanceId);
 if(!instance||instance.level!==level)return{ok:false,message:"強化対象が更新されました。もう一度お試しください。"};
 // Lv更新とGOLD消費を同じ確定点で行う。対象が消えた場合は1Gも引かない。
 instance.level=level+1;rebuildOwnedCompatibility(state.magicCircles);
 state.player.gold=Math.floor(gold-price);
 state.magicCircles.goldSpent+=price;
 return{ok:true,circle:entry,instance,level:level+1,price};
}

export function equipMagicCircle(state,monster,idOrInstance){
 normalizeMagicCircleState(state);
 if(!monster)return{ok:false,message:"対象が見つかりません"};
 const exact=magicCircleInstanceById(state,idOrInstance),entry=magicCircleById(exact?.circleId??idOrInstance);
 if(entry.id==="none"){monster.magicCircleId="none";monster.magicCircleInstanceId=null;return{ok:true,circle:entry,instance:null}}
 if(!isMagicCircleUnlocked(state,entry.id))return{ok:false,message:"現物は所持していますが、深淵ツリーで術式の知識が未解禁です"};
 const occupied=new Set((state.monsters??[]).filter(item=>item.id!==monster.id).map(item=>item.magicCircleInstanceId).filter(Boolean)),instance=exact??(monster.magicCircleId===entry.id?magicCircleInstanceById(state,monster.magicCircleInstanceId):null)??state.magicCircles.instances.find(item=>item.circleId===entry.id&&!occupied.has(item.instanceId));
 if(!instance)return{ok:false,message:"使用できる現物がありません。装着中の仲間から外すか、同じ種類をもう1個入手してください。"};
 const owner=magicCircleOwner(state,instance.instanceId,{excludeMonsterId:monster.id});
 if(owner)return{ok:false,owner,message:`${String(owner.nickname??"他の仲間").trim()||"他の仲間"}が装着中です。先に外してください。`};
 monster.magicCircleId=entry.id;monster.magicCircleInstanceId=instance.instanceId;
 return{ok:true,circle:entry,instance};
}

function circleMarkup(entry,{className=""}={}){
 const high=entry.level>=20?"magic-circle-high":"",slot=entry.effect==="slot"?"magic-circle-slot":"";
 const frames=(entry.frames?.length?entry.frames:[entry.asset]).map((source,index)=>`<img class="magic-circle-frame magic-circle-frame-${index+1}" src="${source}" alt="" draggable="false">`).join("");
 return`<span class="magic-circle magic-circle-${entry.tone} ${high} ${slot} ${className}" data-circle-id="${entry.id}" data-circle-level="${entry.level}" aria-hidden="true">${frames}<i class="magic-circle-ring-a"></i><i class="magic-circle-ring-b"></i><b>${entry.glyph}</b></span>`;
}

export function magicCircleMarkup(monster,state,{className=""}={}){return circleMarkup(equippedMagicCircle(monster,state),{className})}

const ENEMY_CIRCLE_RANK_BONUS=Object.freeze({n:0,r:0,sr:1,ssr:2,ur:3,lr:4,"神話":5,"深淵":8,"十神":10,abyss:8,tengod:10});
function normalizedEnemyRank(rank){return String(rank??"N").trim().toLowerCase()}
export function enemyMagicCircleRateForFloor(floor,rank="N"){
 const f=Math.max(1,Math.floor(Number(floor)||1));
 void rank;
 if(f<120)return 0;
 if(f<200)return .05+(f-120)/80*.13;
 if(f<300)return .18+(f-200)/100*.12;
 if(f<500)return .30+(f-300)/200*.18;
 if(f<750)return .48+(f-500)/250*.14;
 if(f<1000)return .62+(f-750)/250*.13;
 if(f<2000)return .75+(f-1000)/1000*.11;
 if(f<5000)return .86+(f-2000)/3000*.07;
 return Math.min(.98,.93+(f-5000)/5000*.05);
}
export function enemyMagicCircleLevelForFloor(floor,{rank="N",random=Math.random}={}){
 const rankId=normalizedEnemyRank(rank);
 const f=Math.max(1,Math.floor(Number(floor)||1));
 const roll=Math.max(0,Math.min(.999999,Number(random())||0));
 const points=[[120,1,2],[200,2,4],[300,3,7],[500,6,12],[750,10,20],[1000,16,28],[2000,25,45],[5000,45,70],[10000,70,95]];
 let lower=points[0],upper=points[points.length-1];
 for(let index=1;index<points.length;index++)if(f<=points[index][0]){lower=points[index-1];upper=points[index];break}
 const t=Math.max(0,Math.min(1,(f-lower[0])/Math.max(1,upper[0]-lower[0]))),minimum=lower[1]+(upper[1]-lower[1])*t,maximum=lower[2]+(upper[2]-lower[2])*t,rankBonus=(ENEMY_CIRCLE_RANK_BONUS[rankId]??0)*(.25+t*.35);
 return Math.max(1,Math.min(99,Math.round(minimum+(maximum-minimum)*roll+rankBonus)));
}
export function rollEnemyMagicCircle(floor,{rank="N",random=Math.random,force=false,excludeIds=[]}={}){
 const chance=force?1:enemyMagicCircleRateForFloor(floor,rank);
 if(Math.max(0,Math.min(.999999,Number(random())||0))>=chance)return null;
 const excluded=new Set(Array.isArray(excludeIds)?excludeIds:excludeIds instanceof Set?[...excludeIds]:[]),choices=MAGIC_CIRCLES.filter(entry=>entry.id!=="none"&&!excluded.has(entry.id)),roll=Math.max(0,Math.min(.999999,Number(random())||0)),entry=choices[Math.floor(roll*choices.length)]??choices[0];
 if(!entry)return null;
 const level=enemyMagicCircleLevelForFloor(floor,{rank,random});
 return{...entry,level,enemyOnly:true,chance};
}
export function enemyMagicCircleMarkup(profile,{className="enemy-battle-magic-circle"}={}){
 return profile?circleMarkup(profile,{className}):"";
}

export function slotDamageMultiplier(value,level=1){
 const roll=Math.max(0,Math.min(999,Math.floor(Number(value)||0)));if(roll===0)return 0;
 const maximum=magicCircleLevelEffect("slot_fate",level).damageMax;
 return Number((.5+(roll/999)*(maximum-.5)).toFixed(3));
}
