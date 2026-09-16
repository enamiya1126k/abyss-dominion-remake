import {raceSpecies451} from './RaceCatalog451.js';

// Every template has 210 points. Battle rarity, level and owned stats are never read.
const types = {
  slime:['差し','弾力ステップ',66,76,68,'芝',1.08,12000,'弾む足取りで、中盤からじわっと伸びる。'],
  beast:['逃げ','獣走ダッシュ',86,60,64,'芝',.9,1000,'鋭い飛び出しが持ち味。序盤に前へ出る。'],
  flying:['先行','追い風滑空',76,58,76,'芝',.97,6500,'軽やかな滑空で、前半の位置取りが得意。'],
  construct:['追込','不動の踏破',54,88,68,'砂',1.18,17500,'重い足取りから、持久力で終盤に伸びる。'],
  undead:['追込','不屈の脚',60,84,66,'砂',1.16,17000,'最後まで止まらない粘り強い走り。'],
  insect:['先行','六脚リズム',70,74,66,'砂',.98,7000,'足並みをそろえて、砂の上を着実に進む。'],
  plant:['差し','根気の伸び',60,82,68,'芝',1.1,13500,'力をためて、中盤以降に長く脚を使う。'],
  spirit:['差し','霊脈の加速',72,60,78,'芝',1.06,11500,'繊細なコース取りで、するりと加速する。'],
  dragon:['先行','竜の踏み込み',80,70,60,'砂',.96,7500,'力強い踏み込みで、前半から流れに乗る。'],
  goblin:['差し','すり抜け走法',72,60,78,'砂',1.08,12500,'器用な足さばきで、中盤に抜け出す。'],
  demon:['先行','豪脚突進',82,78,50,'砂',.98,8000,'力強い脚で砂を蹴り、流れを作る。'],
  reptile:['逃げ','低姿勢ダッシュ',82,62,66,'砂',.92,1200,'地面すれすれの姿勢で飛び出す。'],
  human:['先行','巧みな位置取り',68,66,76,'芝',.98,8500,'足場を見極めて、前半に好位置を狙う。'],
  mimic:['追込','箱跳び',62,76,72,'砂',1.17,17500,'脚をためて、最後に大きく跳ねる。'],
  balanced:['先行','堅実な一歩',70,70,70,'芝',1,9000,'大きな偏りがなく、落ち着いて走る。'],
};
const named = {
  slime:types.slime,
  ember_gecko:['逃げ','火花ダッシュ',84,58,68,'砂',.91,1200,'火花を散らして飛び出す、砂の短距離派。'],
  glacier_queen:['先行','氷滑走',74,62,74,'芝',.97,6800,'滑らかな足取りで、前半の好位置を狙う。'],
  goblin:['差し','すり抜け走法',72,60,78,'砂',1.08,12500,'器用な足さばきで、中盤に抜け出す。'],
  myth_rion:['逃げ','風駆け',86,54,70,'芝',.9,900,'風のように先頭へ。飛び出しが見せ場。'],
  myth_yori:['差し','イージーダッシュ',78,74,58,'砂',1.1,13000,'力を温存し、中盤から豪快に押し上げる。'],
  myth_hide:['追込','狩人の追走',66,74,70,'砂',1.17,17300,'前を狙い続け、最後の直線でひと伸び。'],
  myth_enami:['先行','冷静なコース取り',64,68,78,'芝',.98,8000,'慌てずに好位置を取る、器用な走り。'],
  ten_time:['差し','時渡り',70,70,70,'砂',1.09,14000,'一瞬の機会を捉え、中盤から加速する。'],
};
const hash = value => {let n=2166136261;for(const c of String(value))n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0};
export function raceProfile453(id){
  const sp=raceSpecies451(id)??{},family=({golem:'construct',elemental:'spirit',angel:'flying'})[sp.race]??sp.race;
  let key=Object.hasOwn(types,family)?family: /dragon|drake|wyvern/.test(id)?'dragon':/golem|clock|armor/.test(id)?'construct':/slime/.test(id)?'slime':/wolf|rat|tiger|fox/.test(id)?'beast':/bird|bat|wing/.test(id)?'flying':/skeleton|ghost|zombie/.test(id)?'undead':/water|ice|light|nature|wind/.test(sp.element??'')?'spirit':'balanced';
  const source=named[id]??types[key], [style,skill,baseSpeed,baseStamina,baseTechnique,ground,curve,skillAt,skillDescription]=source;
  const variation=named[id]?0:hash(id)%7-3;
  return {version:2,style,skill,speed:baseSpeed+variation,stamina:baseStamina-variation,technique:baseTechnique,ground,curve,skillAt,skillMs:2400,skillDescription};
}
export function activeRaceSkill453(racer,elapsed){const p=racer?.profile;return p?.version===2&&elapsed>=p.skillAt&&elapsed<p.skillAt+p.skillMs}
export const PLACE_PRIZES453=[8000,3000,1000];
export function trainingReward453(place){return {affection:place===1?8:place===2?7:place===3?6:5,expRate:place===1?.03:place===2?.025:place===3?.022:.02}}
export function trainingLabel453(reward){return `EXP ${Math.round((reward?.expRate??.02)*1000)/10}％・なつき度＋${reward?.affection??5}`}
