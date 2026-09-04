export const HERO_RESONANCE_IDS=Object.freeze(["myth_enami","myth_rion","myth_yori","myth_hide"]);
export const HERO_MYTHIC_RARITY="神話";
export const HERO_RESONANCE_FOLLOWUP_POWER=.70;

const PROFILES=Object.freeze({
 0:Object.freeze({count:0,active:false,name:"共鳴なし",followupsPerAction:0,totalActions:0,invincible:false}),
 1:Object.freeze({count:1,active:false,name:"共鳴消失",followupsPerAction:0,totalActions:1,invincible:false}),
 2:Object.freeze({count:2,active:true,name:"双星共鳴",followupsPerAction:1,totalActions:4,invincible:false}),
 3:Object.freeze({count:3,active:true,name:"三位共鳴",followupsPerAction:2,totalActions:9,invincible:false}),
 4:Object.freeze({count:4,active:true,name:"無敵",followupsPerAction:3,totalActions:16,invincible:true})
});

export function isHeroResonanceSpecies(speciesId){return HERO_RESONANCE_IDS.includes(String(speciesId??""))}

export function heroResonanceMembers(party){
 const bySpecies=new Map();
 for(const unit of Array.isArray(party)?party:[]){
  const hp=Number(unit?.currentHp??unit?.hp??0),speciesId=String(unit?.speciesId??"");
  if(hp>0&&isHeroResonanceSpecies(speciesId)&&!bySpecies.has(speciesId))bySpecies.set(speciesId,unit);
 }
 return HERO_RESONANCE_IDS.map(id=>bySpecies.get(id)).filter(Boolean);
}

export function heroResonanceCount(party){return heroResonanceMembers(party).length}

export function heroResonanceProfile(partyOrCount){
 const count=Math.max(0,Math.min(4,Array.isArray(partyOrCount)?heroResonanceCount(partyOrCount):Math.floor(Number(partyOrCount)||0)));
 return PROFILES[count];
}

export function scaleHeroResonanceSkill(skill,power=HERO_RESONANCE_FOLLOWUP_POWER){
 if(!skill)return null;const rate=Math.max(0,Math.min(1,Number(power)||0)),scaled={...skill,mp:0,mpRate:0,resonanceFollowup:true};
 for(const key of["power","heal","selfHeal","mpHeal","partyShieldRate","selfShieldRate","hpShieldRate","revive","reviveTransferRate","barrier"])if(Number.isFinite(Number(scaled[key])))scaled[key]=Number(scaled[key])*rate;
 if(Array.isArray(skill.effects))scaled.effects=skill.effects.map(effect=>({...effect,...(Number.isFinite(Number(effect?.value))?{value:Number(effect.value)*rate}:{})}));
 if(skill.status)scaled.status={...skill.status,...(Number.isFinite(Number(skill.status.power))?{power:Number(skill.status.power)*rate}:{})};
 return scaled;
}

export function heroPersonalPressure(heroId,count){
 const strength=Math.max(0,Math.min(1,.08+Math.max(0,Math.min(4,Number(count)||0)-2)*.02)),turns=3;
 if(heroId==="myth_enami")return Object.freeze([{kind:"defDown",value:strength,turns},{kind:"vulnerable",value:strength*.65,turns}]);
 if(heroId==="myth_yori")return Object.freeze([{kind:"atkDown",value:strength,turns},{kind:"spdDown",value:strength*.8,turns}]);
 if(heroId==="myth_hide")return Object.freeze([{kind:"accuracyDown",value:strength,turns},{kind:"evasionDown",value:strength,turns}]);
 if(heroId==="myth_rion")return Object.freeze([{kind:"healDown",value:Math.min(.35,strength*1.5),turns},{kind:"mpRecoveryDown",value:Math.min(.35,strength*1.5),turns}]);
 return Object.freeze([]);
}

export const HERO_INVINCIBLE_PRESSURE=Object.freeze({
 effects:Object.freeze(["atkDown","defDown","spdDown"].map(kind=>Object.freeze({kind,value:.25,turns:3})).concat([
  Object.freeze({kind:"healDown",value:.50,turns:3}),Object.freeze({kind:"mpRecoveryDown",value:.50,turns:3})
 ])),buffTurnPenalty:1
});
