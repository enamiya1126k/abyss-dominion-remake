import {ENDGAME_CHARACTERS} from '../src/data/endgameCharacters.js';
import {createMonster,calculatedStats} from '../src/models/Monster.js';
import {maxMp,allLearnedSkills,effectiveSkillMpCost} from '../src/battle/SkillSystem.js';
import {createSignatureEquipment,signatureStatBonuses,signatureSetState} from '../src/core/SignatureWeaponSystem.js';
import {equipmentStatMultiplier} from '../src/models/Equipment.js';
import {aggregateSeriesEffects} from '../src/data/equipmentSeries.js';
import {equipmentAffixesWithSeries} from '../src/core/EquipmentAffixSystem.js';
import {createCampaignHeroLoadout} from '../src/core/CampaignHeroLoadoutSystem.js';
import {HERO_ORDER} from '../src/core/HeroAllianceSystem.js';
import {TeamBattleCoordinator} from '../online-server/src/TeamBattleCoordinator.js';
function godLoadout(boss){const monster=createMonster(boss.speciesId,{level:1000,rank:4,endgameBossId:boss.id,endgameFaction:'tenGod',isContractedEndgame:true,allowEndgameLevel:true,attribute:boss.element}),equipment=[0,1].map(i=>{const item=createSignatureEquipment(boss.id,i);item.level=2000;item.plus=100;item.affixes=[];return item});monster.equipment={weaponRight:equipment[0].id,weaponLeft:equipment[1].id};const state={monsters:[monster],equipment},gear={},counts={};for(const item of equipment){for(const[k,v]of Object.entries(item.stats??{}))gear[k]=(gear[k]??0)+Math.round(v*equipmentStatMultiplier(item));counts[item.series]=(counts[item.series]??0)+1}monster._equipmentStats=gear;monster._seriesEffects=aggregateSeriesEffects(counts);monster._equipmentAffixes=equipmentAffixesWithSeries(equipment,monster._seriesEffects);monster._signatureBonuses=signatureStatBonuses(state,monster);return{monster,stats:calculatedStats(monster),maxMp:maxMp(monster),signature:signatureSetState(state,monster).definition};}
function actor(pack,side,id){const{monster:m,stats:s}=pack;return{playerId:id,id,ownerPlayerId:id,speciesId:m.speciesId,endgameBossId:m.endgameBossId,level:1000,name:m.nickname,side,hp:s.hp,maxHp:s.hp,mp:pack.maxMp,maxMp:pack.maxMp,stats:s,attribute:m.attribute,equipmentCombatEffects:m._equipmentAffixes,signatureResonance:pack.signature,skills:allLearnedSkills(m).map(x=>({...x,mp:effectiveSkillMpCost(m,x),kind:['allHeal','revive','buff','guard','mpHeal'].includes(x.type)?x.type:x.type==='selfHeal'?'heal':'attack',hits:x.hits??1})),cooldowns:{},effects:[],metrics:{damage:0,healing:0,damageTaken:0,support:0,kos:0,guards:0},circleEffect:'none'};}
const gods=Object.values(ENDGAME_CHARACTERS).filter(x=>x.faction==='tenGod').map(godLoadout),heroes=HERO_ORDER.map(id=>createCampaignHeroLoadout(id));
let count=0,wins=0,loss=0,draw=0,maxRounds=0;const failed=[];
for(let a=0;a<7;a++)for(let c=a+1;c<8;c++)for(let d=c+1;d<9;d++)for(let e=d+1;e<10;e++){
 const players=[...heroes.map((h,i)=>actor(h,'sun','h'+i)),...[a,c,d,e].map((i,j)=>actor(gods[i],'moon','g'+j))];let seed=count+1;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296},team=new TeamBattleCoordinator({sessions:new Map(),random}),b={players:Object.fromEntries(players.map(u=>[u.id,u])),round:1,phase:'command',actions:{},score:{sun:0,moon:0},games:[],targetWins:1,game:1,series:'bo1',speed:4,damageMultiplier:1,healingMultiplier:1};
 for(let turn=1;turn<=15;turn++){b.round=turn;b.phase='command';b.actions={};team._resolve({},b);if(b.winner||b.outcome)break;for(const u of players){for(const k of Object.keys(u.cooldowns))u.cooldowns[k]=Math.max(0,u.cooldowns[k]-1);for(const x of u.effects)x.turns--;u.effects=u.effects.filter(x=>x.turns>0);u.guard=false;}}
 count++;maxRounds=Math.max(maxRounds,b.round);if(b.winner==='sun')wins++;else if(b.winner==='moon'){loss++;failed.push([a,c,d,e])}else draw++;
}
console.log(JSON.stringify({mode:'TeamBattleCoordinator actual action/round resolver, no circles, Lv1000 rank4 monster+0, 2 signature weapons Lv2000+100 empty affixes',count,wins,loss,draw,maxRounds,failed},null,2));
