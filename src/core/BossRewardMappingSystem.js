import{
 FLOOR_BOSS_CATALOG,
 floorBossDefinitionById,
 floorBossDefinitionForFloor,
 milestoneBossIdsForFloor
}from"../data/floorBosses.js?v=3.0.9-build309";
import{
 ENDGAME_CHARACTERS,
 canonicalEndgameId
}from"../data/endgameCharacters.js?v=3.0.9-build309";

/*
 * build308: boss reward identity is data, never a random selection.
 *
 * A reward flow may decide whether an item is granted, but it must not decide
 * who owns that item.  This catalog is the single bridge between a defeated
 * boss, its fragment portrait and every piece of its dedicated equipment.
 * Keeping that bridge outside main.js also makes offline, online and replay
 * settlement use exactly the same identity rules.
 */

const FLOOR_PIECES=Object.freeze(["weapon","armor","accessory"]);
const ENDGAME_PIECES=Object.freeze(["weaponRight","weaponLeft","accessoryNeck","accessoryFinger","armorBody","armorSupport"]);

const freezeVisual=(speciesId,visualSpeciesId,fallback)=>Object.freeze({
 speciesId:String(speciesId??""),
 visualSpeciesId:String(visualSpeciesId??speciesId??""),
 fallback:String(fallback??"BOSS")
});

function floorBossRewardIdentity(boss){
 const actualFloor=Math.max(1,Math.floor(Number(boss.floor)||10)/10),pieces=FLOOR_PIECES.map((piece,index)=>{
  const design=piece==="weapon"?boss.dedicatedWeapon:piece==="armor"?boss.dedicatedArmor:boss.dedicatedAccessory;
  return Object.freeze({
   key:piece,
   piece,
   pieceIndex:index,
   ownerId:boss.id,
   designId:design.id,
   slot:design.slot,
   subslot:design.subslot??null,
   name:design.name,
   visualAsset:design.visualAsset??null
  });
 });
 return Object.freeze({
  id:boss.id,
  ownerId:boss.id,
  bossId:boss.id,
  kind:"floorBoss",
  faction:"floorBoss",
  floor:actualFloor,
  legacyFloor:boss.floor,
  name:boss.name,
  speciesId:boss.speciesId,
  fragmentVisual:freezeVisual(boss.speciesId,boss.visualSpeciesId,boss.name),
  equipment:Object.freeze(pieces),
  campaignEquipment:pieces[0]
 });
}

function endgameBossRewardIdentity(boss){
 const pieces=boss.gear.map((gear,index)=>Object.freeze({
  key:ENDGAME_PIECES[index],
  piece:ENDGAME_PIECES[index],
  pieceIndex:index,
  ownerId:boss.id,
  designId:`endgame-${boss.id}-${index + 1}`,
  slot:gear.slot,
  subslot:gear.subslot,
  name:gear.name,
  seriesId:boss.seriesId
 }));
 return Object.freeze({
  id:boss.id,
  ownerId:boss.id,
  bossId:boss.id,
  kind:"endgame",
  faction:boss.faction,
  floor:null,
  legacyFloor:null,
  name:boss.name,
  speciesId:boss.speciesId,
  fragmentVisual:freezeVisual(boss.speciesId,boss.id,boss.icon),
  equipment:Object.freeze(pieces),
  campaignEquipment:pieces[0]
 });
}

const identities=[
 ...FLOOR_BOSS_CATALOG.map(floorBossRewardIdentity),
 ...Object.values(ENDGAME_CHARACTERS).map(endgameBossRewardIdentity)
];

export const BOSS_REWARD_IDENTITY_CATALOG=Object.freeze(Object.fromEntries(identities.map(identity=>[identity.id,identity])));

function mappedId(value){
 const raw=String(value??"");
 if(!raw)return null;
 const canonical=canonicalEndgameId(raw);
 return BOSS_REWARD_IDENTITY_CATALOG[canonical]?canonical:null;
}

function explicitBossRewardId(source){
 if(typeof source==="string")return{present:Boolean(source),id:mappedId(source)};
 if(!source||typeof source!=="object")return{present:false,id:null};
 const strongKeys=["rewardOwnerId","campaignBossId","endgameBossId","floorBossCatalogId","bossCatalogId","bossId","signatureOwnerId","mythicOwner"];
 let present=false,invalid=false;
 const ids=new Set();
 for(const key of strongKeys){
  if(source[key]==null||source[key]==="")continue;
  present=true;
  const id=mappedId(source[key]);
  if(id)ids.add(id);else invalid=true;
 }
 // Ownership metadata is authoritative only when every supplied owner agrees.
 // A valid bossId alongside a stale/forged owner field must never silently win.
 if(present)return{present:true,id:!invalid&&ids.size===1?[...ids][0]:null};
 if(source.id!=null&&source.id!=="")return{present:true,id:mappedId(source.id)};
 return{present:false,id:null};
}

export function bossRewardIdentity(source,{floor=null}={}){
 const explicit=explicitBossRewardId(source);
 if(explicit.id)return BOSS_REWARD_IDENTITY_CATALOG[explicit.id];
 // An explicit but unknown owner must fail closed. Falling back to the floor
 // here could turn a malformed/replayed boss result into another boss's item.
 if(explicit.present)return null;
 if(floor==null)return null;
 const candidates=campaignBossRewardIdentities(floor);
 return candidates.length===1?candidates[0]:null;
}

export function bossRewardEquipmentIdentity(source,piece=null,{floor=null}={}){
 const identity=bossRewardIdentity(source,{floor});if(!identity)return null;
 if(piece==null)return identity.campaignEquipment;
 const numeric=Number(piece);
 if(Number.isInteger(numeric))return identity.equipment[numeric]??null;
 const key=String(piece);
 return identity.equipment.find(entry=>entry.key===key||entry.piece===key||entry.designId===key)??null;
}

function stableRewardPieceIndex(rewardId,count){
 const size=Math.max(0,Math.floor(Number(count)||0));if(!size)return-1;
 let hash=2166136261;
 for(const char of String(rewardId??"")){hash^=char.codePointAt(0);hash=Math.imul(hash,16777619)}
 return(hash>>>0)%size;
}

/**
 * Resolve one boss-owned reward. bossId alone selects the owner; rewardId is
 * deliberately confined to selecting one piece inside that owner's set.
 * This makes replay IDs useful for deterministic loot without allowing them
 * to redirect a reward to another boss on multi-boss floors.
 */
export function resolveBossEquipmentReward({bossId=null,rewardId="",piece=null,floor=null}={}){
 const identity=bossRewardIdentity(bossId,{floor});if(!identity)return null;
 const selected=piece==null
  ?identity.equipment[stableRewardPieceIndex(rewardId,identity.equipment.length)]??null
  :bossRewardEquipmentIdentity(identity.id,piece);
 if(!selected)return null;
 return Object.freeze({
  bossId:identity.id,
  ownerId:identity.id,
  rewardId:String(rewardId??""),
  pieceIndex:selected.pieceIndex,
  boss:identity,
  equipment:selected
 });
}

export const resolveBossRewardEquipment=resolveBossEquipmentReward;

export function bossFragmentVisualIdentity(source,{floor=null}={}){
 return bossRewardIdentity(source,{floor})?.fragmentVisual??null;
}

export function campaignBossRewardIdentities(floor,defeatedBosses=null){
 const value=Math.max(1,Math.min(100,Math.floor(Number(floor)||1))),milestones=milestoneBossIdsForFloor(value);
 const expectedIds=milestones.length?milestones.map(mappedId).filter(Boolean):[floorBossDefinitionForFloor(value)?.id].filter(Boolean);
 const expected=expectedIds.map(id=>BOSS_REWARD_IDENTITY_CATALOG[id]).filter(Boolean);
 if(defeatedBosses==null)return expected;
 const source=Array.isArray(defeatedBosses)?defeatedBosses:[defeatedBosses],defeatedIds=new Set(source.map(entry=>explicitBossRewardId(entry).id).filter(Boolean));
 return expected.filter(identity=>defeatedIds.has(identity.id));
}

export function bossRewardIdentityFromEquipment(item){
 if(!item||typeof item!=="object")return null;
 return bossRewardIdentity({
  rewardOwnerId:item.rewardOwnerId,
  endgameBossId:item.endgameBossId,
  floorBossCatalogId:item.floorBossCatalogId??item.ruleOverrides?.bossCatalogId,
  signatureOwnerId:item.signatureOwnerId??item.ruleOverrides?.signatureOwnerId,
  mythicOwner:item.ruleOverrides?.mythicOwner
 });
}

export function equipmentBelongsToBoss(item,boss,{floor=null}={}){
 const expected=bossRewardIdentity(boss,{floor}),actual=bossRewardIdentityFromEquipment(item);
 return Boolean(expected&&actual&&expected.id===actual.id);
}

export function bossRewardMappingSummary(){
 const floorBosses=identities.filter(identity=>identity.kind==="floorBoss"),endgame=identities.filter(identity=>identity.kind==="endgame");
 return Object.freeze({
  bosses:identities.length,
  floorBosses:floorBosses.length,
  abyssBosses:endgame.filter(identity=>identity.faction==="abyss").length,
  tenGodBosses:endgame.filter(identity=>identity.faction==="tenGod").length,
  equipmentPieces:identities.reduce((sum,identity)=>sum+identity.equipment.length,0)
 });
}

// Keep accidental catalog drift visible during development and tests. These
// lookups also prove every normal boss still owns the authored set used above.
for(const identity of identities){
 if(identity.kind==="floorBoss"&&!floorBossDefinitionById(identity.id))throw new Error(`Unknown floor-boss reward owner: ${identity.id}`);
 if(new Set(identity.equipment.map(piece=>piece.designId)).size!==identity.equipment.length)throw new Error(`Duplicate boss equipment mapping: ${identity.id}`);
}
