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

export function normalizeMagicCircleState(state){
 const source=state?.magicCircles&&typeof state.magicCircles==="object"&&!Array.isArray(state.magicCircles)?state.magicCircles:{};
 const owned=source.owned&&typeof source.owned==="object"&&!Array.isArray(source.owned)?source.owned:{};
 const normalized={};
 for(const entry of MAGIC_CIRCLES){
  if(entry.id==="none")continue;
  const level=Math.floor(Number(owned[entry.id])||0);
  if(level>0)normalized[entry.id]=Math.min(99,level);
 }
 // v2.5.xの「素環」は効果なしだったため、v2.6.0では無装備へ安全に移行する。
 state.magicCircles={...source,owned:normalized,goldSpent:Math.max(0,Math.floor(Number(source.goldSpent)||0)),version:2};
 for(const monster of state.monsters??[]){
  const id=monster.magicCircleId;
  if(id==="plain"||!BY_ID.has(id)||(id!=="none"&&!normalized[id]))monster.magicCircleId="none";
 }
 return state.magicCircles;
}

export function unlockMagicCircleFromTree(state,id){
 normalizeMagicCircleState(state);
 const entry=magicCircleById(id);
 if(entry.id==="none")return{ok:false,message:"無装備は解禁不要です。"};
 const already=magicCircleLevel(state,id)>0;
 if(!already)state.magicCircles.owned[id]=1;
 return{ok:true,circle:entry,level:state.magicCircles.owned[id],already};
}

export function equippedMagicCircle(monster,state){
 normalizeMagicCircleState(state);
 const entry=magicCircleById(monster?.magicCircleId);
 const level=entry.id==="none"?0:magicCircleLevel(state,entry.id);
 return{...entry,level};
}

export function magicCircleLevel(state,id){
 const owned=state?.magicCircles?.owned;
 return id==="none"?0:Math.max(0,Number(owned?.[id])||0);
}

export function magicCirclePrice(state,id){
 const entry=magicCircleById(id),level=magicCircleLevel(state,id);
 if(entry.id==="none"||!level)return 0;
 return Math.min(Number.MAX_SAFE_INTEGER,Math.round(entry.baseUpgrade*Math.pow(level+1,2.42)));
}

export function magicCircleNextEffect(entryOrId,level=0){
 const entry=typeof entryOrId==="string"?magicCircleById(entryOrId):entryOrId;
 if(entry.id==="none")return"強化なし";
 const next=Math.max(1,Number(level)||1)+1,boost=Math.min(250,Math.round((next-1)*3.5));
 return`Lv.${next}：基礎効果を強化（効果量 +${boost}%相当）・発光層を追加`;
}

export function buyOrUpgradeMagicCircle(state,id){
 normalizeMagicCircleState(state);
 const entry=magicCircleById(id),level=magicCircleLevel(state,id);
 if(entry.id==="none")return{ok:false,message:"魔法陣なしは強化できません。"};
 if(!level)return{ok:false,message:"この魔法陣は深淵ツリーで解禁してください。"};
 if(level>=99)return{ok:false,message:"最大Lv.99です。"};
 const price=magicCirclePrice(state,id),gold=Math.max(0,Number(state.player?.gold)||0);
 if(gold<price)return{ok:false,message:`GOLDが${price.toLocaleString()}G必要です`};
 state.player.gold=Math.floor(gold-price);
 state.magicCircles.owned[entry.id]=level+1;
 state.magicCircles.goldSpent+=price;
 return{ok:true,circle:entry,level:level+1,price};
}

export function equipMagicCircle(state,monster,id){
 normalizeMagicCircleState(state);
 if(!monster)return{ok:false,message:"対象が見つかりません"};
 const entry=magicCircleById(id);
 if(entry.id!=="none"&&!magicCircleLevel(state,id))return{ok:false,message:"深淵ツリーで未解禁の魔法陣です"};
 monster.magicCircleId=entry.id;
 return{ok:true,circle:entry};
}

export function magicCircleMarkup(monster,state,{className=""}={}){
 const entry=equippedMagicCircle(monster,state),high=entry.level>=20?"magic-circle-high":"",slot=entry.effect==="slot"?"magic-circle-slot":"";
 const frames=(entry.frames?.length?entry.frames:[entry.asset]).map((source,index)=>`<img class="magic-circle-frame magic-circle-frame-${index+1}" src="${source}" alt="" draggable="false">`).join("");
 return`<span class="magic-circle magic-circle-${entry.tone} ${high} ${slot} ${className}" data-circle-id="${entry.id}" data-circle-level="${entry.level}" aria-hidden="true">${frames}<i class="magic-circle-ring-a"></i><i class="magic-circle-ring-b"></i><b>${entry.glyph}</b></span>`;
}

export function slotDamageMultiplier(value){
 const roll=Math.max(0,Math.min(999,Math.floor(Number(value)||0)));if(roll===0)return 0;
 return Number((.5+(roll/999)*2.5).toFixed(3));
}
