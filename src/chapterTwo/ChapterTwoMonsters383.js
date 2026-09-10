import {prioritizeChapterTwoTargets393} from './ChapterTwoTargeting393.js?v=3.1.82-build402';
import {CHAPTER_TWO_PAIRS392} from '../data/chapterTwoPairs392.js?v=3.1.72-build392';
import {CHAPTER_TWO_SPECIES392} from '../data/chapterTwoSpecies392.js?v=3.1.72-build392';
import {CHAPTER_TWO_PAIRS391} from '../data/chapterTwoPairs391.js?v=3.1.71-build391';
import {CHAPTER_TWO_SPECIES391} from '../data/chapterTwoSpecies391.js?v=3.1.71-build391';
import {CHAPTER_TWO_PAIRS390} from '../data/chapterTwoPairs390.js?v=3.1.70-build390';
import {CHAPTER_TWO_SPECIES390} from '../data/chapterTwoSpecies390.js?v=3.1.70-build390';
import {CHAPTER_TWO_PAIRS389} from '../data/chapterTwoPairs389.js?v=3.1.69-build389';
import {CHAPTER_TWO_SPECIES389} from '../data/chapterTwoSpecies389.js?v=3.1.69-build389';
import {CHAPTER_TWO_PAIRS388} from '../data/chapterTwoPairs388.js?v=3.1.68-build388';
import {CHAPTER_TWO_SPECIES388} from '../data/chapterTwoSpecies388.js?v=3.1.68-build388';
import {CHAPTER_TWO_PAIRS387} from '../data/chapterTwoPairs387.js?v=3.1.67-build387';
import {CHAPTER_TWO_SPECIES387} from '../data/chapterTwoSpecies387.js?v=3.1.67-build387';
import {CHAPTER_TWO_SPECIES386} from '../data/chapterTwoSpecies386.js?v=3.1.66-build386';
import {CHAPTER_TWO_SPECIES385} from '../data/chapterTwoSpecies385.js?v=3.1.65-build385';
import {CHAPTER_TWO_SPECIES383} from '../data/chapterTwoSpecies383.js?v=3.1.72-build392';
import {CHAPTER_TWO_SPECIES384} from '../data/chapterTwoSpecies384.js?v=3.1.70-build390';
const natives={...CHAPTER_TWO_SPECIES383,...CHAPTER_TWO_SPECIES384,...CHAPTER_TWO_SPECIES385,...CHAPTER_TWO_SPECIES386,...CHAPTER_TWO_SPECIES387,...CHAPTER_TWO_SPECIES388,...CHAPTER_TWO_SPECIES389,...CHAPTER_TWO_SPECIES390,...CHAPTER_TWO_SPECIES391,...CHAPTER_TWO_SPECIES392};

const utility=new Set(['buff','stance','allHeal','cleanse']);
export const CHAPTER_TWO_ACTIONS383=Object.freeze(Object.fromEntries(Object.values(CHAPTER_TWO_SPECIES383).flatMap(s=>s.authoredSkills.map(k=>[k.id,{...k,label:k.name,multiplier:k.power,utility:utility.has(k.type),pattern:utility.has(k.type)?'self':k.allEnemies?'all':'singleWeak',dispelOne:k.dispelEnemyBuff,hpShieldRate:k.selfShieldRate}]))));
const positive=new Set(['atkUp','defUp','spdUp','regen','guard','counter','accuracyUp','evasionUp','critUp','guaranteedHit','guaranteedCritical','lifeSteal']);
const negative=new Set(['atkDown','defDown','spdDown','evasionDown','accuracyDown','vulnerable','healDown','mpRecoveryDown','stun','reviveSeal']);
export function chooseChapterTwoAction383(enemy,{allies=[enemy],opponents=[],battle={}}={}){
 const species=natives[enemy?.speciesId];if(!species)return null;
 opponents=prioritizeChapterTwoTargets393(enemy,opponents,battle,natives);
 enemy.chapterTwoFocus382=enemy.elitePolicy393?(opponents[0]?.id??null):null;
 enemy.specialCooldown=Math.max(0,(Number(enemy.specialCooldown)||0)-1);
 if(enemy.specialCooldown>0){enemy.intent='再唱封印のため通常攻撃';return 'attack';}
 const turn=Math.max(1,Number(battle.turn)||1),cooldowns=enemy.chapterTwoCooldowns383??={},team=allies.filter(x=>x.hp>0),foes=opponents.filter(x=>x.currentHp>0),effects=battle.allyEffects??{},ownEffects=battle.enemyEffects??{},ailments=battle.allyAilments??{};
 const ready=k=>(cooldowns[k.id]??0)<=turn&&(enemy.currentMp??0)>=k.mp;
 const choose=k=>{if(!k||!ready(k))return null;cooldowns[k.id]=turn+k.cooldown+1;enemy.intent=k.name;return k.id;};
 const find=role=>species.authoredSkills.find(k=>k.ai383===role&&ready(k));
 const marked=k=>foes.find(x=>k?.bonusVsStatus&&(ailments[x.id]??x.ailments??[]).some(e=>e.id===k.bonusVsStatus.id)||k?.bonusVsEffect&&(effects[x.id]??[]).some(e=>e.kind===k.bonusVsEffect.kind));
 const revive=find('revive');
 if(revive&&(battle.reviveCount??0)<99&&allies.some(x=>x.hp<=0&&!(ownEffects[x.id]??[]).some(e=>e.kind==='reviveSeal'&&(e.turns==null||e.turns>0))))return choose(revive);
 const needsCleanse=team.some(x=>(battle.enemyStatuses?.[x.id]??[]).length||(ownEffects[x.id]??[]).some(e=>negative.has(e.kind)));
 if(needsCleanse&&find('cleanse'))return choose(find('cleanse'));
 if(team.some(x=>x.hp/x.maxHp<.62)&&find('heal'))return choose(find('heal'));
 const empowered=foes.find(x=>(effects[x.id]??[]).some(e=>positive.has(e.kind)));
 if(empowered&&find('buffStrike')){enemy.chapterTwoFocus382=empowered.id;return choose(find('buffStrike'));}
 if(foes.some(x=>(effects[x.id]??[]).some(e=>positive.has(e.kind)))&&find('dispel'))return choose(find('dispel'));
 const glassPair387=[...CHAPTER_TWO_PAIRS387,...CHAPTER_TWO_PAIRS388,...CHAPTER_TWO_PAIRS389,...CHAPTER_TWO_PAIRS390,...CHAPTER_TWO_PAIRS391,...CHAPTER_TWO_PAIRS392].find(p=>p.bonusVsEffects&&p.members.includes(enemy.speciesId)),glassSetup387=find('setup');
 if(glassPair387&&glassSetup387&&glassPair387.members.every(id=>team.some(u=>u.speciesId===id))){const unmarked=foes.find(x=>(glassSetup387.effects??[]).some(e=>e.enemy&&!(effects[x.id]??[]).some(a=>a.kind===e.kind&&a.turns>1)));if(unmarked){enemy.chapterTwoFocus382=unmarked.id;return choose(glassSetup387);}}
 const strike=find('strike'),target=marked(strike);
 if(target){enemy.chapterTwoFocus382=target.id;return choose(strike);}
 const frostSetup390=(species.chapterTwoSet390||species.chapterTwoSet392)?find('setup'):null;
 if(frostSetup390?.status&&[...CHAPTER_TWO_PAIRS390,...CHAPTER_TWO_PAIRS392].some(p=>p.members.includes(enemy.speciesId)&&p.members.every(id=>team.some(u=>u.speciesId===id)))){const unmarked=foes.find(x=>!(ailments[x.id]??x.ailments??[]).some(a=>a.id===frostSetup390.status.id));if(unmarked){enemy.chapterTwoFocus382=unmarked.id;return choose(frostSetup390);}}
 const shield=find('shield');
 if(shield&&team.length>1&&team.some(x=>(x._floorBossHpShield??0)<x.maxHp*.025&&!(ownEffects[x.id]??[]).some(e=>e.kind==='defUp'&&e.turns>1)))return choose(shield);
 const rally=find('rally');
 if(rally&&team.length>1&&!team.every(x=>(rally.effects??[]).every(e=>(ownEffects[x.id]??[]).some(a=>a.kind===e.kind&&a.turns>1))))return choose(rally);
 // New status pairs establish poison/fire before optional healing suppression.
 const pairSetup386=(species.chapterTwoSet386||species.chapterTwoSet389||species.chapterTwoSet390)?find('setup'):null;
 if(pairSetup386?.status){const unmarked=foes.find(x=>!(ailments[x.id]??x.ailments??[]).some(a=>a.id===pairSetup386.status.id));if(unmarked){enemy.chapterTwoFocus382=unmarked.id;return choose(pairSetup386);}}
 const healBlock=find('healBlock'),wounded=foes.filter(x=>!(effects[x.id]??[]).some(e=>e.kind==='healDown'&&e.turns>1)).sort((a,b)=>a.currentHp/Math.max(1,a._maxHp??a.currentHp)-b.currentHp/Math.max(1,b._maxHp??b.currentHp))[0];
 if(healBlock&&wounded){enemy.chapterTwoFocus382=wounded.id;return choose(healBlock);}
 const manaDrain=find('manaDrain'),manaTarget=foes.filter(x=>(x.currentMp??0)>0).sort((a,b)=>(b.currentMp??0)-(a.currentMp??0))[0];
 if(manaDrain&&manaTarget){enemy.chapterTwoFocus382=manaTarget.id;return choose(manaDrain);}
 const reviveBlock=find('reviveBlock'),unsealed=foes.filter(x=>!(effects[x.id]??[]).some(e=>e.kind==='reviveSeal'&&e.turns>1)).sort((a,b)=>a.currentHp-b.currentHp)[0];
 if(reviveBlock&&unsealed){enemy.chapterTwoFocus382=unsealed.id;return choose(reviveBlock);}
 const setup=find('setup');
 if(setup){const covered=x=>setup.status?(ailments[x.id]??x.ailments??[]).some(a=>a.id===setup.status.id):(setup.effects??[]).filter(e=>e.enemy).every(e=>(effects[x.id]??[]).some(a=>a.kind===e.kind&&a.turns>1));const unmarked=foes.find(x=>!covered(x));if(unmarked){enemy.chapterTwoFocus382=unmarked.id;return choose(setup);}}
 if(enemy.hp/enemy.maxHp<.5){if(find('drain'))return choose(find('drain'));if(find('stance'))return choose(find('stance'));}
 for(const role of ['strike','disrupt','fallback','drain','buffStrike'])if(find(role))return choose(find(role));
 enemy.intent='再使用と魔力を見て通常攻撃';return 'attack';
}

// Repeatable, deterministic habitats. Boss identities and one-time keys stay intact.
export function installChapterTwoHabitats383(encounters){
 const native=(id,species,name,extra={})=>{if(encounters[id])encounters[id]={...encounters[id],species:species.map(key=>`ch2_${key}`),authorities:undefined,roles:undefined,name,chapterTwoNative383:true,...extra};};
 native('patrol',['kororu','balk'],'芽灯の群れ');
 native('a1_patrol',['shelza','kororu','balk'],'黒根の狩猟群');
 native('a2_patrol',['velg','shelza','kororu'],'鎖翼の狩猟群');
 native('a3_patrol',['noctia','balk','astera'],'霜鐘の聖域守');
 native('a4_patrol',['velg','noctia','astera'],'星糸の中枢衛');
 for(let area=0;area<5;area++)for(const room of [1,3,4]){
  const members=[['kororu','balk'],['shelza','kororu','balk'],['velg','shelza','kororu'],['noctia','balk','astera'],['velg','noctia','astera']][area];
  native(`roam${area}_${room}`,members,['芽灯の群れ','黒根の狩猟群','鎖翼の狩猟群','霜鐘の聖域守','星糸の中枢衛'][area]);
 }
 native('roam4_4',['ordia','velg','noctia','astera'],'境律獣と星糸の守衛',{level:4900,hp:1450000,atk:69000,def:33000,spd:15300,experience:210000,gold:260000});
}
export function chapterTwoNativeHint383(encounter){
 if(!encounter?.chapterTwoNative383)return null;
 return encounter.species.map(id=>natives[id]).filter(Boolean).map(s=>`${s.name}：${s.counter383}`).join(' ');
}
