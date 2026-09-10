// Build398: chapter-II build choices; definitions contain no save or battle dependencies.
const define=(key,name,glyph,tone,summary)=>Object.freeze({id:`ch2_${key}398`,name,glyph,tone,effect:`circle398_${key}`,baseUpgrade:260000000,summary,asset:`./assets/magic-circles/ch2_${key}398.svg`,frames:Object.freeze([`./assets/magic-circles/ch2_${key}398.svg`])});
export const MAGIC_CIRCLES398=Object.freeze([
 define('prism','異彩協奏陣','彩','rainbow','生存中の味方の属性が多いほど、装着者の直接攻撃を強化。同属性編成とは別の組み方を楽しむ陣。'),
 define('hex','百禍織刻陣','禍','violet','敵に残る状態異常の種類数で直接攻撃を強化。毒・火傷・睡眠などを重ね、攻撃役で刈り取る。'),
 define('reserve','澄明蓄魔陣','澄','cyan','命中直前のMPが最大値の80%以上なら直接攻撃を強化。低消費技・MP支援と組み合わせる。')
]);
export const isMagicCircle398=id=>MAGIC_CIRCLES398.some(c=>c.id===id);
export function magicCircleEffects398(id,level=1){
 const p=(Math.max(1,Math.min(99,Math.floor(Number(level)||1)))-1)/98,round=n=>Number(n.toFixed(4)),pct=n=>`${+(n*100).toFixed(1)}%`;
 if(id==='ch2_prism398'){const perExtraElement=round(.10+.05*p);return{perExtraElement,maxExtraElements:3,summary:`生存味方の属性が1種類増すごとに与ダメ +${pct(perExtraElement)}（2種類以上・最大+${pct(perExtraElement*3)}）`};}
 if(id==='ch2_hex398'){const perAilment=round(.12+.06*p);return{perAilment,maxAilments:3,summary:`敵の状態異常1種類ごとに与ダメ +${pct(perAilment)}（最大3種類・+${pct(perAilment*3)}）`};}
 if(id==='ch2_reserve398'){const damageRate=round(.30+.20*p);return{damageRate,mpThreshold:.8,summary:`命中直前のMP80%以上で与ダメ +${pct(damageRate)}（消費後のMPで判定）`};}
 return null;
}
export const AILMENTS398=Object.freeze(['poison','burn','bleed','sleep','freeze','paralysis','shock','curse','charm','confusion','fear','stun']);
// Shared by the browser and server. Direct damage only; never scales DOT, HP-copy or instant kills.
export function conditionalCircleMultiplier398(id,level,{elements=[],statuses=[],mp=0,maxMp=0,excluded=false}={}){
 const e=magicCircleEffects398(id,level);if(!e||excluded)return 1;
 if(e.perExtraElement){const count=new Set(elements.filter(x=>typeof x==='string'&&x!=='neutral'&&x!=='none'&&x!=='')).size;return 1+e.perExtraElement*Math.max(0,Math.min(e.maxExtraElements,count-1));}
 if(e.perAilment){const count=new Set(statuses.filter(s=>(s.turns??1)>0).map(s=>String(s.id??s.kind??'').replace(/^status:/,'')).filter(id=>AILMENTS398.includes(id))).size;return 1+e.perAilment*Math.min(e.maxAilments,count);}
 return Number.isFinite(mp)&&Number.isFinite(maxMp)&&maxMp>0&&mp/maxMp>=e.mpThreshold?1+e.damageRate:1;
}
