import {createMonster,calculatedStats} from '../models/Monster.js?v=3.1.39-build359';
import {maxMp,effectiveSkillMpCost,allLearnedSkills} from '../battle/SkillSystem.js?v=3.1.39-build359';
import {createSignatureEquipment,signatureStatBonuses,signatureSetState} from './SignatureWeaponSystem.js?v=3.1.39-build359';
import {equipmentStatMultiplier,equipmentRequiredMonsterLevel} from '../models/Equipment.js';
import {aggregateSeriesEffects} from '../data/equipmentSeries.js?v=3.1.38-build358';
import {equipmentAffixesWithSeries} from './EquipmentAffixSystem.js?v=3.1.28-build348';

export const CAMPAIGN_HERO_WEAPON_LEVEL=2000;
export const CAMPAIGN_HERO_WEAPON_PLUS=0;
export function createCampaignHeroLoadout(speciesId,level=1000){
 const monster=createMonster(speciesId,{level,rank:4,plus:0});
 const equipment=[0,1,2,3,4,5].map(index=>{const item=createSignatureEquipment(speciesId,index);item.id=`hero348:${speciesId}:weapon:${index}`;item.level=CAMPAIGN_HERO_WEAPON_LEVEL;item.plus=CAMPAIGN_HERO_WEAPON_PLUS;item.affixes=[];item.equippedBy=monster.id;return item});
 monster.equipment=Object.fromEntries(["weaponRight","weaponLeft","armorBody","armorSupport","accessoryNeck","accessoryFinger"].map((slot,i)=>[slot,equipment[i].id]));
 const state={monsters:[monster],equipment},gear={},counts={};
 for(const item of equipment){if(equipmentRequiredMonsterLevel(item)>level)throw Error('Illegal hero weapon level');for(const[k,v]of Object.entries(item.stats??{}))gear[k]=(gear[k]??0)+Math.round(v*equipmentStatMultiplier(item));counts[item.series]=(counts[item.series]??0)+1}
 monster._equipmentStats=gear;monster._seriesCounts=counts;monster._seriesEffects=aggregateSeriesEffects(counts);monster._equipmentAffixes=equipmentAffixesWithSeries(equipment,monster._seriesEffects);monster._signatureBonuses=signatureStatBonuses(state,monster);
 const stats=calculatedStats(monster),mp=maxMp(monster),signature=signatureSetState(state,monster)?.definition;monster.currentHp=stats.hp;monster.currentMp=mp;monster.maxHp=stats.hp;monster.maxMp=mp;monster.heroSignature348=signature;monster.heroSkillCosts348=Object.fromEntries(allLearnedSkills(monster).map(skill=>[skill.id,effectiveSkillMpCost(monster,skill)]));
 return{monster,equipment,stats,maxMp:mp,signature};
}
export function applyCampaignHeroLoadout(enemy){
 if(!enemy?.campaignHeroId)return enemy;
 const {monster,equipment,stats,maxMp,signature}=createCampaignHeroLoadout(enemy.campaignHeroId,enemy.level??1000);
 Object.assign(enemy,{...stats,hp:stats.hp,maxHp:stats.hp,maxMp,currentMp:maxMp,rank:monster.rank,enemyGear:equipment,equipped:true,enemyEquipmentSlots:6,enemyEquipmentLevel:CAMPAIGN_HERO_WEAPON_LEVEL,enemyEquipmentRarity:'神話',enemyMagicCircle:null,heroSignature348:signature,heroSkillCosts348:monster.heroSkillCosts348,heroLoadoutVersion348:3,bossStatusResist:0,bossPowerMultiplier:1,hiddenDamageTaken:1,hiddenStatusResist:0,hiddenProfile:{active:false},enraged:false});
 return enemy;
}
