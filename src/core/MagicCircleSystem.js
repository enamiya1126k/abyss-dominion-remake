const freeze=value=>Object.freeze(value);

const circle=(id,name,glyph,tone,baseUpgrade,summary,effect,asset)=>{
 const assetId=asset??id,primary=`./assets/magic-circles/${assetId}.png`;
 return freeze({
  id,name,glyph,tone,baseUpgrade,summary,effect,asset:primary,
  frames:freeze(id==="none"?[primary]:[primary,`./assets/magic-circles/${assetId}-2.png`,`./assets/magic-circles/${assetId}-3.png`])
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
 circle("gold_power","黄金換力陣","G","gold",1_100_000_000,"所持GOLDに応じて攻撃上昇。行動ごとに少量のGOLDを消費。","goldPower"),
 circle("random_arsenal","万象抽選陣","?","rainbow",1_800_000_000,"固有スキルを封じ、全スキルから毎行動ランダムに発動。","randomSkill"),
 circle("sole_survivor","孤王覚醒陣","Ⅰ","black",620_000_000,"最後の生存者になると全能力と連撃率が大幅上昇。","soleSurvivor"),
 circle("death_drain","断末吸魔陣","MP","violet",380_000_000,"この者が倒れると、敵全体のMPを大量に奪う。","deathDrain"),
 circle("crimson_threshold","瀕死紅蓮陣","HP","red",460_000_000,"HPが少ないほど最終ダメージが上昇する。","lowHpPower"),
 circle("death_mirror","即死返鏡陣","鏡","cyan",760_000_000,"最初に受ける即死を無効化し、使用者へ反射する。","deathMirror")
]);

const BY_ID=new Map(MAGIC_CIRCLES.map(entry=>[entry.id,entry]));
export function magicCircleById(id){return BY_ID.get(id)??BY_ID.get("none")}

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

export function normalizeMagicCircleState(state){
 const source=state?.magicCircles&&typeof state.magicCircles==="object"&&!Array.isArray(state.magicCircles)?state.magicCircles:{};
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
 state.magicCircles={...source,unlocked,instances,goldSpent:Math.max(0,Math.floor(Number(source.goldSpent)||0)),version:3};
 rebuildOwnedCompatibility(state.magicCircles);

 // 出撃枠の左から優先し、各現物を必ず1人だけへ割り当てる。
 const byId=new Map((state.monsters??[]).map(monster=>[monster.id,monster]));
 const partyIds=new Set(state.party??[]),ordered=[...(state.party??[]).map(id=>byId.get(id)).filter(Boolean),...(state.monsters??[]).filter(monster=>!partyIds.has(monster.id))],assigned=new Set(),byInstance=new Map(instances.map(item=>[item.instanceId,item]));
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
 normalizeMagicCircleState(state);const instance=state.magicCircles.instances.find(item=>item.instanceId===monster?.magicCircleInstanceId),entry=magicCircleById(instance?.circleId??monster?.magicCircleId);
 return{...entry,level:entry.id==="none"?0:instance?.level??magicCircleLevel(state,entry.id),instanceId:instance?.instanceId??null};
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
export function magicCircleUpgradePrice(entryOrId,level=1){const entry=typeof entryOrId==="string"?magicCircleById(entryOrId):entryOrId;return Math.min(Number.MAX_SAFE_INTEGER,Math.max(1000,Math.round((Number(entry?.baseUpgrade)||0)*.004*Math.pow(Math.max(1,Number(level)||1)+1,1.65)/1000)*1000))}

export function magicCircleNextEffect(entryOrId,level=0){
 const entry=typeof entryOrId==="string"?magicCircleById(entryOrId):entryOrId;
 if(entry.id==="none")return"強化なし";
 const next=Math.max(1,Number(level)||1)+1,boost=Math.min(250,Math.round((next-1)*3.5));
 return`Lv.${next}：基礎効果を強化（効果量 +${boost}%相当）・発光層を追加`;
}

export function buyOrUpgradeMagicCircle(state,id){
 normalizeMagicCircleState(state);
 const exact=magicCircleInstanceById(state,id),entry=magicCircleById(exact?.circleId??id),instance=exact??state.magicCircles.instances.filter(item=>item.circleId===entry.id).sort((a,b)=>b.level-a.level)[0],level=instance?.level??0;
 if(entry.id==="none")return{ok:false,message:"魔法陣なしは強化できません。"};
 if(!isMagicCircleUnlocked(state,entry.id))return{ok:false,message:"この術式の知識は深淵ツリーで未解禁です。"};
 if(!level)return{ok:false,message:"現物を所持していません。再構築または交換で入手してください。"};
 if(level>=99)return{ok:false,message:"最大Lv.99です。"};
 const price=magicCircleUpgradePrice(entry,level),gold=Math.max(0,Number(state.player?.gold)||0);
 if(gold<price)return{ok:false,message:`GOLDが${price.toLocaleString()}G必要です`};
 state.player.gold=Math.floor(gold-price);
 instance.level=level+1;rebuildOwnedCompatibility(state.magicCircles);
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

const LR_PLUS_ENEMY_RANKS=new Set(["lr","神話","深淵","十神","abyss","tengod"]);
const MAX_LEVEL_ENEMY_RANKS=new Set(["深淵","十神","abyss","tengod"]);
const ENEMY_CIRCLE_RANK_BONUS=Object.freeze({n:0,r:1,sr:2,ssr:4,ur:6,lr:9,"神話":12});
function normalizedEnemyRank(rank){return String(rank??"N").trim().toLowerCase()}
export function enemyMagicCircleRateForFloor(floor,rank="N"){
 if(LR_PLUS_ENEMY_RANKS.has(normalizedEnemyRank(rank)))return 1;
 const f=Math.max(1,Math.floor(Number(floor)||1));
 return f>=100?1:Math.max(.035,Math.min(1,.035+(f-1)*(.965/99)));
}
export function enemyMagicCircleLevelForFloor(floor,{rank="N",random=Math.random}={}){
 const rankId=normalizedEnemyRank(rank);
 if(MAX_LEVEL_ENEMY_RANKS.has(rankId))return 99;
 const f=Math.max(1,Math.floor(Number(floor)||1));
 const roll=Math.max(0,Math.min(.999999,Number(random())||0));
 // 50Fから1000Fまでを一本の育成曲線にし、同じ階層でも個体差を残す。
 // 300FではおおむねLv.25〜45、1000FではLv.80〜99が目安。
 if(f<50)return Math.max(1,Math.min(3,1+Math.floor(roll*3)));
 const progress=Math.max(0,Math.min(1,(f-50)/950));
 const eased=Math.pow(progress,.9),center=3+eased*86,spread=3+progress*7;
 const rankBonus=(ENEMY_CIRCLE_RANK_BONUS[rankId]??0)*(.35+progress*.65);
 const variance=(roll-.5)*2*spread;
 return Math.max(1,Math.min(99,Math.round(center+rankBonus+variance)));
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

export function slotDamageMultiplier(value){
 const roll=Math.max(0,Math.min(999,Math.floor(Number(value)||0)));if(roll===0)return 0;
 return Number((.5+(roll/999)*2.5).toFixed(3));
}
