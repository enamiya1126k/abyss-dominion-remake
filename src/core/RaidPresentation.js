export const RAID_VAJRA_SPRITE="./assets/online/raid/vajurlion368";
export const RAID_SPARK_SPRITE="./assets/online/raid/spark-core368";
export const RAID_VAJRA_WEAPON_ART="./assets/online/raid/vajra-fang368.png";
export const RAID_VAJRA_WEAPON_DESCRIPTION="雷属性威力+20%・会心ダメージ+25%・SPD+10%。同じ武器の固定効果は両手で重複しません。";
export function raidSpriteBase(id){return id==="vajra-beast"?RAID_VAJRA_SPRITE:id==="thunder-core"?RAID_SPARK_SPRITE:null}
export function normalizeVajraRaidWeapon(item){
 if(!item||item.slot!=="weapon"||!item.raidLimited||item.weeklyRaidBossId!=="vajra-beast"||item.name!=="天雷轟断牙")return false;
 item.visualAsset=RAID_VAJRA_WEAPON_ART;
 item.weaponType="sword";item.handedness="either";
 item.signatureWeaponEffectId="raid-vajra-fang368";
 item.fixedEffects={...(item.fixedEffects??{}),thunderDamage:20,critDamage:25,spdPct:10};
 item.raidWeaponDescription=RAID_VAJRA_WEAPON_DESCRIPTION;
 item.ruleOverrides={...(item.ruleOverrides??{}),unsellable:true,raidResonance:true,weeklyRaidBossId:"vajra-beast"};
 // Preserve existing growth, rolled stats, sockets, locks and ownership.
 item.raidWeaponProfileVersion=368;
 return true;
}
