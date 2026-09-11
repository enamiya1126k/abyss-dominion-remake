import {SPECIES} from '../../src/data/species.js';import {eligibleCampaignEncounterSpecies} from '../../src/core/EncounterPoolSystem.js';import {monster} from './native-harness.mjs';import {calculatedStats} from '../../src/models/Monster.js';import {EQUIPMENT_BASES} from '../../src/data/equipment.js';import {createEquipment,equipmentStatMultiplier} from '../../src/models/Equipment.js';import {maxMp} from '../../src/battle/SkillSystem.js';
export const LATE_TEAMS415=[
 ['ch2_ryune','ch2_rose','ch2_aure','ch2_noelle'],
 ['ch2_calista','ch2_solenne','ch2_mirea','ch2_viola'],
 ['ch2_seria','ch2_carmia','ch2_lumea','ch2_fiora'],
 ['ch2_shion','ch2_suiren','ch2_lunaria','ch2_solaria'],
 ['ch2_meliora','ch2_elyselle','ch2_noctelle','ch2_auriane'],
 ['ch2_dracia','ch2_rucie','ch2_mirea','ch2_viola'],
 ['ch2_kagura','ch2_sayo','ch2_ferne','ch2_clarisse'],
 ['ch2_nevia','ch2_elmina','ch2_aure','ch2_noelle'],
 ['ch2_rostia','ch2_althea','ch2_eirene','ch2_iridelle'],
 ['ch2_celes','ch2_lumina','ch2_lyriet','ch2_rosette'],
 ['ch2_morina','ch2_elmize','ch2_rikka','ch2_rinne'],
 ['ch2_nemesia','ch2_everia','ch2_ferne','ch2_clarisse'],
 ['ch2_seria','ch2_carmia','ch2_aure','ch2_noelle'],
 ['ch2_seria','ch2_carmia','ch2_ferne','ch2_clarisse'],
 ['ch2_nevia','ch2_elmina','ch2_dracia','ch2_rucie'],
 ['ch2_mirea','ch2_viola','ch2_lumea','ch2_velg'],
 ['ch2_aure','ch2_noelle','ch2_lumea','ch2_senela'],
 ['ch2_nemesia','ch2_everia','ch2_senela','ch2_velg'],
 ['primordial_phoenix','earth_sovereign','time_dragon','celestial_kirin'],
 ['forest_cernunnos','genesis_golem','dark_sovereign','death_lord'],
 ['celestial_pegasus','world_serpent','frost_sovereign','chaos_king']
];
export function campaignTeams415(floor){
 const pool=eligibleCampaignEncounterSpecies(Object.values(SPECIES),Math.max(1,floor-1));const tiers=['N','R','SR','SSR','UR','LR'];
 const sorted=pool.filter(s=>tiers.includes(s.rarity)).sort((a,b)=>tiers.indexOf(b.rarity)-tiers.indexOf(a.rarity)||(b.minFloor??0)-(a.minFloor??0)||a.id.localeCompare(b.id));
 const used=new Set();return Array.from({length:6},(_,i)=>{
 const team=[];for(const roles of [['healer','support'],['tank','counter'],['magic','controller','debuffer','poison'],['bruiser','burst','critical','speed','assassin','balanced','drain']]){
  const options=sorted.filter(s=>roles.includes(s.role)&&!team.includes(s.id));const s=options.find(s=>!used.has(s.id))??options[i%options.length]??sorted.find(s=>!team.includes(s.id));team.push(s.id);used.add(s.id);
 }return team;});
}
export function gearParty415(ids,level,{floor=100,campaign=false}={}){
 const rarity=!campaign?'LR':floor<4?'R':floor<10?'SR':floor<31?'SSR':floor<61?'UR':'LR';
 return ids.map(id=>{const m=monster(id,level,false),stats={};const names=[['weapon','炎刃'],['weapon','星詠みの杖'],['armor','魔布のローブ'],['armor','守護者の外套'],['accessory','旅人の指輪'],['accessory','生命の首飾り']];
 m._benchmarkGear415=names.map(([slot,name])=>{const item=createEquipment(slot,{rarity,base:EQUIPMENT_BASES[slot].find(x=>x.name===name),affixes:[],series:null});item.level=level;item.plus=campaign?0:10;for(const[k,v]of Object.entries(item.stats))stats[k]=(stats[k]??0)+Math.round(v*equipmentStatMultiplier(item));return {name,rarity,level,plus:item.plus};});m._equipmentStats=stats;m._equipmentAffixes={};m.maxHp=calculatedStats(m).hp;m.currentHp=m.maxHp;m.maxMp=maxMp(m);m.currentMp=m.maxMp;return m;});
}
