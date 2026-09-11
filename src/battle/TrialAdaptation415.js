import {SPECIES} from '../data/species.js';
import {endgameCharacter} from '../data/endgameCharacters.js';
// Fixed tier coefficients: never derived from the opposing boss or the player's stats.
export const TRIAL_ADAPTATION415=Object.freeze({
 projection50:Object.freeze({hp:96,atk:54,matk:54,def:48,mdef:48,spd:9}),
 projection100:Object.freeze({hp:204,atk:111,matk:111,def:104,mdef:104,spd:17}),
 manifest50:Object.freeze({hp:1024,atk:549,matk:549,def:523,mdef:523,spd:82}),
 manifest100:Object.freeze({hp:75428,atk:40506,matk:40506,def:38551,mdef:38551,spd:5953})
});
export const CHAPTER_PREPARATION415=Object.freeze({hp:28,atk:12,matk:12,def:8,mdef:8,spd:16});
const supportive415=new Set(['healer','support','tank','controller','debuffer','counter']);
export function chapterPreparationReady415(b){const units=(b?.party??[]).filter(trialEligible415);return units.length>=3&&units.some(u=>supportive415.has(SPECIES[u.speciesId]?.role))&&units.some(u=>!supportive415.has(SPECIES[u.speciesId]?.role));}
export const contextKey415=b=>b?.manualEndgameChallenge?b?.preludeChoiceId:b?.specialBattleType==='chapterTwo'?'chapterTwo':b?.specialBattleType==='campaignFinal'?'royal':b?.specialBattleType==='team'?'team':b?.specialBattleType==='gauntlet'&&b.specialTrialNumber>=91?'gauntletEnd':'tactical';
export const ROLE_PREPARATION415=Object.freeze({royal:Object.freeze({hp:24,atk:12,matk:12,def:8,mdef:8,spd:16}),team:Object.freeze({hp:10,atk:6,matk:6,def:4,mdef:4,spd:8}),gauntletEnd:Object.freeze({hp:80,atk:64,matk:64,def:24,mdef:24,spd:16})});
export function chapterRates415(tier=0,elite=0,vault=false){const bonus=elite>0?1+.5*Math.max(1,Math.min(3,elite)):vault?1.5:1;const factor=1+.30*Math.max(0,Math.min(5,Number(tier)||0));return Object.fromEntries(Object.entries(CHAPTER_PREPARATION415).map(([k,v])=>[k,(k==='def'||k==='mdef'?v:v*factor)*bonus]));}
const bindings=globalThis[Symbol.for('abyss.trialAdaptation415')]??=new WeakMap();
export function teamRates415(stage=1){const p=Math.max(0,Math.min(1,((Number(stage)||1)-40)/50));return {hp:12+18*p,atk:8+12*p,matk:8+12*p,def:6+4*p,mdef:6+4*p,spd:16+12*p};}
export function tacticalRates415(floor=1){const progress=Math.max(0,Math.min(1,((Number(floor)||1)-1)/99));return {hp:1+2*progress,atk:1+progress,matk:1+progress,def:1+.5*progress,mdef:1+.5*progress,spd:1+progress};}
export function trialTier415(b){
 if(!b||b.onlineMode||b.pvp||b.raid||b.isPvp||['online','raid','pvp'].includes(b.mode))return null;
 if(b.manualEndgameChallenge&&b.specialBattleType==='emergency')return TRIAL_ADAPTATION415[b.preludeChoiceId]??null;
 if(!chapterPreparationReady415(b))return null;
 if(b.specialBattleType==='chapterTwo')return chapterRates415(b.chapterPreparationTier415,b.chapterPreparationElite415,b.chapterPreparationVault415);
 if(contextKey415(b)==='team')return teamRates415(b.specialTeamStage);
 if(ROLE_PREPARATION415[contextKey415(b)])return ROLE_PREPARATION415[contextKey415(b)];
 return tacticalRates415(b.balanceFloor415??b.floor??1);
}
export function trialEligible415(u){return !endgameCharacter(u?.endgameBossId??u?.speciesId)&&!['abyss','tenGod'].includes(u?.endgameFaction??u?.faction);}
export function projectTrialStats415(stats,u){
 const binding=bindings.get(u);if(!binding)return stats;
 const out={...stats};for(const [field,factor]of Object.entries(binding.rates))out[field]=Math.floor((Number(stats[field])||0)*factor);return out;
}
const ratio=(hp,max)=>Math.max(0,Math.min(1,(Number(hp)||0)/Math.max(1,max)));
// Rounding a living unit back from a large trial HP scale must never turn it
// into a KO. A defeated unit remains at zero.
const normalHp415=(hp,maximum,natural)=>Number(hp)>0?Math.max(1,Math.min(natural,Math.round(natural*ratio(hp,maximum)))):0;
export function prepareTrial415(b,statsFor){
 const rates=trialTier415(b);if(!rates)return false;
 const saved=b.trialAdaptation415?.tier===contextKey415(b)?b.trialAdaptation415.units??{}:{};
 b.trialAdaptation415={version:1,tier:contextKey415(b),units:saved};
 for(const u of b.party??[]){
  if(!trialEligible415(u)||bindings.has(u))continue;
  const natural=statsFor(u),entry={rates,naturalHp:natural.hp,b,statsFor};
  const hpRatio=ratio(u.currentHp,natural.hp);bindings.set(u,entry);
  const maximum=statsFor(u).hp,old=saved[u.id];
  u.currentHp=old&&Number.isFinite(old.hp)?Math.max(0,Math.min(maximum,old.hp)):Math.round(maximum*hpRatio);
  u.maxHp=maximum;u._maxHp=maximum;
  // SaveService serializes the normal roster at normal scale. Battle HP has its
  // own checkpoint below, so boot-time equipment normalization cannot truncate it.
  Object.defineProperty(u,'toJSON',{configurable:true,enumerable:false,value(){
   const copy={...this},binding=bindings.get(this);if(!binding)return copy;
   copy.currentHp=normalHp415(this.currentHp,binding.statsFor(this).hp,binding.naturalHp);
   copy.maxHp=binding.naturalHp;copy._maxHp=binding.naturalHp;
   copy.heroShield348=0;copy.heroShieldMax378=0;return copy;
  }});
 }
 return true;
}
export function snapshotTrial415(b){
 if(!trialTier415(b)||!b.trialAdaptation415)return null;
 return {version:1,tier:contextKey415(b),units:Object.fromEntries((b.party??[]).filter(u=>bindings.has(u)).map(u=>[u.id,{hp:u.currentHp}]))};
}
export function cleanupTrial415(b){
 for(const u of b?.party??[]){const x=bindings.get(u);if(!x)continue;
  const hp=u.currentHp,previousMaximum=x.statsFor(u).hp;bindings.delete(u);delete u.toJSON;
  const maximum=x.statsFor(u).hp;u.currentHp=normalHp415(hp,previousMaximum,maximum);u.maxHp=maximum;u._maxHp=maximum;
 }
}
export function trialDescription415(id,floor=100,tier=0){
 const r=id==='tactical'?tacticalRates415(floor):id==='chapterTwo'?chapterRates415(tier):ROLE_PREPARATION415[id]??TRIAL_ADAPTATION415[id];const n=x=>x.toLocaleString('ja-JP',{maximumFractionDigits:2});return r?`${id==='chapterTwo'?'第二章の備え':id==='tactical'?'攻守支の戦術連携':ROLE_PREPARATION415[id]?'討伐の備え':'試練適応'}（通常キャラ）：HP×${n(r.hp)}／攻撃・魔力×${n(r.atk)}／防御・魔防×${n(r.def)}／速度×${n(r.spd)}。この戦闘中のみ。`:'';
}

export function battleAdaptationDescription415(b){const r=trialTier415(b);if(!r)return '';const n=x=>x.toLocaleString('ja-JP',{maximumFractionDigits:2});return `戦闘中の備え：HP×${n(r.hp)}／攻撃・魔力×${n(r.atk)}／防御・魔防×${n(r.def)}／速度×${n(r.spd)}。通常キャラに適用。HP100固定の能力は100を維持。`;}
