const freeze=value=>Object.freeze(value);

export const MAGIC_CIRCLES=freeze([
 {id:"plain",name:"素環",glyph:"◇",tone:"plain",unlock:0,baseUpgrade:2_000_000,summary:"効果なし。純粋な力で戦う。",effect:"none"},
 {id:"slot_fate",name:"運命の三桁環",glyph:"777",tone:"violet",unlock:80_000_000,baseUpgrade:40_000_000,summary:"行動開始時に000〜999。000は休止、他は0.5〜3倍。",effect:"slot"},
 {id:"last_life",name:"不屈の残光",glyph:"1",tone:"gold",unlock:45_000_000,baseUpgrade:28_000_000,summary:"戦闘中1回、致死ダメージをHP1で耐える。",effect:"lastLife"},
 {id:"reincarnation",name:"輪廻の魔法陣",glyph:"∞",tone:"rose",unlock:160_000_000,baseUpgrade:75_000_000,summary:"戦闘不能時に一度だけ蘇生する。戦闘全体の蘇生上限は99回。",effect:"revive"},
 {id:"mana_reversal",name:"魔力反転陣",glyph:"MP",tone:"cyan",unlock:65_000_000,baseUpgrade:35_000_000,summary:"与ダメージ上昇。MP回復時、回復量に応じてHPを失う。",effect:"manaReversal"},
 {id:"deep_silence",name:"深神封殺陣",glyph:"×",tone:"black",unlock:420_000_000,baseUpgrade:180_000_000,summary:"深淵・十神から受ける攻撃はクリティカルにならない。",effect:"endgameNoCrit"},
 {id:"aegis",name:"半月障壁陣",glyph:"50",tone:"blue",unlock:95_000_000,baseUpgrade:52_000_000,summary:"戦闘開始時、最大HP50%分のシールドを得る。",effect:"shield"},
 {id:"opening_rite",name:"開戦共鳴陣",glyph:"20",tone:"red",unlock:140_000_000,baseUpgrade:70_000_000,summary:"戦闘開始時、味方全体の最終ダメージ・会心率+20%。",effect:"openingBuff"},
 {id:"judgment20",name:"二十刻終焉陣",glyph:"XX",tone:"black",unlock:1_200_000_000,baseUpgrade:480_000_000,summary:"20ターン生存すると、自分以外の敵味方を終焉へ導く。",effect:"turn20"},
 {id:"blood_acceleration",name:"血走加速陣",glyph:"≫",tone:"red",unlock:210_000_000,baseUpgrade:95_000_000,summary:"被弾するほど速度・連撃率・最終ダメージが増す。",effect:"rage"},
 {id:"weak_critical",name:"弱撃必殺陣",glyph:"!",tone:"gold",unlock:110_000_000,baseUpgrade:58_000_000,summary:"弱い攻撃ほどクリティカル率が高くなる。",effect:"weakCrit"},
 {id:"sacrifice_lottery",name:"等価滅殺陣",glyph:"⇄",tone:"rose",unlock:360_000_000,baseUpgrade:160_000_000,summary:"味方をランダムに1体失い、敵をランダムに1体即死させる。",effect:"sacrifice"},
 {id:"inheritance",name:"継承の葬環",glyph:"†",tone:"violet",unlock:125_000_000,baseUpgrade:62_000_000,summary:"この者が倒れると、生存する味方へ力を継承する。",effect:"inheritance"},
 {id:"gold_power",name:"黄金換力陣",glyph:"G",tone:"gold",unlock:550_000_000,baseUpgrade:220_000_000,summary:"所持GOLDに応じて攻撃上昇。行動ごとに少量のGOLDを消費。",effect:"goldPower"},
 {id:"random_arsenal",name:"万象抽選陣",glyph:"?",tone:"rainbow",unlock:900_000_000,baseUpgrade:350_000_000,summary:"固有スキルを封じ、全スキルから毎行動ランダムに発動。",effect:"randomSkill"},
 {id:"sole_survivor",name:"孤王覚醒陣",glyph:"Ⅰ",tone:"black",unlock:280_000_000,baseUpgrade:120_000_000,summary:"最後の生存者になると全能力と連撃率が大幅上昇。",effect:"soleSurvivor"},
 {id:"death_drain",name:"断末吸魔陣",glyph:"MP",tone:"violet",unlock:175_000_000,baseUpgrade:82_000_000,summary:"この者が倒れると、敵全体のMPを大量に奪う。",effect:"deathDrain"}
 ,{id:"crimson_threshold",name:"瀕死紅蓮陣",glyph:"HP",tone:"red",unlock:195_000_000,baseUpgrade:88_000_000,summary:"HPが少ないほど最終ダメージが上昇する。",effect:"lowHpPower"}
 ,{id:"death_mirror",name:"即死返鏡陣",glyph:"鏡",tone:"cyan",unlock:330_000_000,baseUpgrade:145_000_000,summary:"最初に受ける即死を無効化し、使用者へ反射する。",effect:"deathMirror"}
]);

const BY_ID=new Map(MAGIC_CIRCLES.map(circle=>[circle.id,circle]));
export function magicCircleById(id){return BY_ID.get(id)??BY_ID.get("plain")}

export function normalizeMagicCircleState(state){
 const source=state?.magicCircles&&typeof state.magicCircles==="object"&&!Array.isArray(state.magicCircles)?state.magicCircles:{};
 const owned=source.owned&&typeof source.owned==="object"&&!Array.isArray(source.owned)?source.owned:{};
 const normalized={plain:Math.max(1,Math.floor(Number(owned.plain)||1))};
 for(const circle of MAGIC_CIRCLES){if(circle.id==="plain")continue;const level=Math.floor(Number(owned[circle.id])||0);if(level>0)normalized[circle.id]=Math.min(99,level)}
 state.magicCircles={...source,owned:normalized,goldSpent:Math.max(0,Math.floor(Number(source.goldSpent)||0))};
 for(const monster of state.monsters??[]){if(!BY_ID.has(monster.magicCircleId)||!normalized[monster.magicCircleId])monster.magicCircleId="plain"}
 return state.magicCircles;
}

export function equippedMagicCircle(monster,state){normalizeMagicCircleState(state);const circle=magicCircleById(monster?.magicCircleId);return{...circle,level:Math.max(1,state.magicCircles.owned[circle.id]||1)}}
export function magicCircleLevel(state,id){normalizeMagicCircleState(state);return Math.max(0,Number(state.magicCircles.owned[id])||0)}
export function magicCirclePrice(state,id){
 const circle=magicCircleById(id),level=magicCircleLevel(state,id);
 if(circle.id==="plain")return Math.round(circle.baseUpgrade*Math.pow(level+1,2.35));
 if(!level)return circle.unlock;
 return Math.round(circle.baseUpgrade*Math.pow(level+1,2.55));
}
export function buyOrUpgradeMagicCircle(state,id){
 normalizeMagicCircleState(state);const circle=magicCircleById(id),price=magicCirclePrice(state,id),gold=Math.max(0,Number(state.player?.gold)||0);
 if(gold<price)return{ok:false,message:`GOLDが${price.toLocaleString()}G必要です`};
 state.player.gold=Math.floor(gold-price);state.magicCircles.owned[circle.id]=Math.min(99,magicCircleLevel(state,circle.id)+1);state.magicCircles.goldSpent+=price;
 return{ok:true,circle,level:state.magicCircles.owned[circle.id],price};
}
export function equipMagicCircle(state,monster,id){normalizeMagicCircleState(state);if(!monster)return{ok:false,message:"対象が見つかりません"};if(!magicCircleLevel(state,id))return{ok:false,message:"未購入の魔法陣です"};monster.magicCircleId=id;return{ok:true,circle:magicCircleById(id)}}

export function magicCircleMarkup(monster,state,{className=""}={}){
 const circle=equippedMagicCircle(monster,state);return`<span class="magic-circle magic-circle-${circle.tone} ${className}" data-circle-id="${circle.id}" aria-hidden="true"><i></i><i></i><b>${circle.glyph}</b></span>`;
}

export function slotDamageMultiplier(value){
 const roll=Math.max(0,Math.min(999,Math.floor(Number(value)||0)));if(roll===0)return 0;
 // A jackpot is exciting without making all prior balance meaningless.
 return Number((.5+(roll/999)*2.5).toFixed(3));
}
