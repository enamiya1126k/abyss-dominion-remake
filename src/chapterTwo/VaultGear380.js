import {createEquipment} from '../models/Equipment.js';
import {EQUIPMENT_BASES} from '../data/equipment.js';
export const VAULT_WEAPONS380=[
 {name:'翠根の黎明弓',skill:'森羅の一斉射',element:'nature',power:2.5,target:'allEnemies',type:'physical'},
 {name:'黒根を断つ焔刃',skill:'侵食断ち',element:'fire',power:4.5,target:'enemy',type:'physical'},
 {name:'忘却の星杖',skill:'深淵星葬',element:'dark',power:2.8,target:'allEnemies',type:'magic'},
 {name:'天律の祈杖',skill:'黎明の祝福',element:'light',power:1.4,target:'allAllies',type:'heal'},
 {name:'自由意志の王剣',skill:'白紙の創世',element:'light',power:5,target:'enemy',type:'physical'}
];
export function vaultSkill380(item){const d=VAULT_WEAPONS380[item?.vaultArea380];return d?{id:`vault380-${item.vaultArea380}`,name:d.skill,type:d.type==='heal'?'allHeal':'attack',damageClass:d.type==='magic'?'magic':'physical',allEnemies:d.target==='allEnemies',heal:d.type==='heal'?.55:undefined,target:d.target==='allEnemies'?'敵全体':d.type==='heal'?'味方全体':'敵単体',element:d.element,power:d.power,mp:80,cost:80,cooldown:4,accuracy:100,description:`${d.target==='allEnemies'?'敵全体':d.target==='allAllies'?'味方全体':'敵単体'}に${d.type==='heal'?'大回復':'強力な一撃'}。MP80・CT4。`}:null;}
export function createVaultWeapon380(area){const d=VAULT_WEAPONS380[area],base=EQUIPMENT_BASES.weapon[(area*9)%EQUIPMENT_BASES.weapon.length],item=createEquipment('weapon',{rarity:'神話',base,affixes:[{id:'bossDamage',value:18,quality:'legendary'},{id:'mpCostReduction',value:12,quality:'legendary'},{id:d.type==='heal'?'healPower':'critDamage',value:d.type==='heal'?20:35,quality:'legendary'},{id:'arcaneEcho',value:20,quality:'legendary'}]});Object.assign(item,{name:d.name,vaultArea380:area,level:[1000,1400,2000,2800,3800][area],plus:0,locked:true,favorite:true,fixedEffectText:`宝物庫限定・装備技「${d.skill}」／伝説級オプション4枠`,obtainedMethod:'chapterTwoVault'});return item;}
