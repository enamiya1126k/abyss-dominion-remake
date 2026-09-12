import {ENDGAME_CHARACTERS} from '../data/endgameCharacters.js';
import {MOTHER_ID422} from './Mother422.js';

// The ten original character records remain untouched. The mother's projections
// have their own combat values, displayed in the encounter's law reference.
const gods=Object.values(ENDGAME_CHARACTERS).filter(c=>c.faction==='tenGod');
const hints=['再使用遅延・速度低下。次の行動で回復と浄化を。','全体斬撃・防御無視。物理防御と障壁を重ねよう。','大回復と障壁。回復阻害を先に入れておこう。','瀕死の仲間を狙う一撃。HPを高く保とう。','必中・確定会心の一撃。軽減と障壁で備えよう。','強化反転と混乱。状態異常への備えを。','全体弱体と支配。浄化できる仲間を残そう。','回復・再生・軽減。回復阻害と強化解除が有効。','全体終焉魔法。炎上を消し、HPと障壁を確保。','全能力強化・障壁。解除して次の一撃を弱めよう。'];
export const MOTHER_LAWS424=Object.freeze(gods.map((god,index)=>{
 const original=god.skills.filter(s=>!s.ultimate358).at(-1);
 const skill={...original,id:`mother424__${original.id}`,power:original.power*.20,
  ...(original.heal?{heal:.12}:{}),...(original.partyShieldRate?{partyShieldRate:.06}:{}),
  effects:(original.effects??[]).map(e=>({...e,...(e.kind==='regen'?{value:.03}:e.kind==='guard'?{value:.18}:['atkUp','defUp','spdUp'].includes(e.kind)?{value:.20}:{}),turns:Math.min(2,e.turns??2)})),
  ...(original.status?{status:{...original.status,turns:1}}:{}),
  mp:0,cooldown:0,sourceSkillId:original.id,motherProjection424:true};
 const utility=['buff','stance','allHeal','selfHeal','revive','cleanse','mpHeal'].includes(skill.type);
 const info={...skill,label:`原初再演・${original.name}`,pattern:utility?'self':skill.allEnemies?'all':skill.execute?'singleWeak':'singleStrong',multiplier:skill.power,utility};
 return Object.freeze({index,numeral:god.numeral,godId:god.id,godName:god.name,name:original.name,action:skill.id,info,hint:hints[index]});
}));
// A fixed score is shared by all parties and rematches. One of each law per
// ten rounds; no reloading to reroll a lethal result. The next law is visible.
export const MOTHER_SCORE424=Object.freeze([7,0,3,4,2,5,9,1,6,8]);
export function motherLaw424(round){return MOTHER_LAWS424[MOTHER_SCORE424[(Math.max(1,Math.floor(Number(round)||1))-1)%10]];}
export function motherLawAction424(action){return MOTHER_LAWS424.find(l=>l.action===action)?.info??null;}
export function motherDialEnemy424(b){return b?.specialBattleType==='mother422'?(b.enemies??[]).find(e=>e.speciesId===MOTHER_ID422&&e.motherRevision424===424&&e.hp>0):null;}
export function motherDialDue424(b){return Boolean(motherDialEnemy424(b)&&!b.resultSettled&&!b._motherDialInFlight424&&(Number(b.motherDial424?.lastRound)||0)<Math.max(1,Number(b.turn)||1));}
export function motherLawSummary424(law){const s=law.info;return [s.utility?(s.heal?'HP12%回復・浄化':'攻防・速度20%強化'): `${s.allEnemies?'全体':'単体'} ${s.damageClass==='physical'?'物理':s.damageClass==='hybrid'?'複合':'魔法'}${Math.round(s.power*100)}%`,s.partyShieldRate?'HP6%障壁':'',law.hint].filter(Boolean).join(' ／ ');}
