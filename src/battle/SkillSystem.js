import{SPECIES}from"../data/species.js?v=2.8.0";
import{SKILLS}from"../data/skills.js?v=2.8.0";
import{endgameSkills,endgameSkillById}from"../data/endgameCharacters.js?v=2.8.0";

const UNLOCK_LEVELS=[1,5,10,20,30,45,60,80,100,130,170,220];
const ROLE_POOLS={
 tank:[
  ["堅牢打ち","attack",1.15,4,"防御","敵単体","盾の重みを乗せた一撃。"],
  ["守護の息吹","selfHeal",.24,7,"回復","自分","最大HPの24%を回復する。"],
  ["城壁崩し","attack",1.6,10,"攻撃","敵単体","防壁ごと打ち砕く強打。"],
  ["不屈の再生","selfHeal",.38,14,"回復","自分","最大HPの38%を回復する。"],
  ["反攻撃","multiAttack",.78,15,"カウンター","敵単体","耐えてから二連撃を返す。"],
  ["守護者の号砲","attack",1.9,18,"攻撃","敵単体","守護者の誇りを込めた一撃。"],
  ["深層防衛","selfHeal",.52,22,"防御","自分","最大HPの52%を回復し戦線を維持する。"],
  ["要塞突進","attack",2.25,25,"攻撃","敵単体","巨大な要塞のように突進する。"],
  ["最後の砦","selfHeal",.7,30,"回復","自分","最大HPの70%を回復する切り札。"],
  ["奈落の守護撃","attack",2.75,36,"奥義","敵単体","奈落の守護者が放つ決定打。"],
  ["絶対防衛圏","selfHeal",1,45,"超奥義","自分","HPを完全回復する。"]
 ],
 support:[
  ["励ましの光","allHeal",.12,6,"回復","味方全体","味方全体のHPを12%回復する。"],
  ["応援弾","attack",1.2,5,"攻撃","敵単体","仲間の声援を力に変える。"],
  ["癒やしの波","allHeal",.2,10,"回復","味方全体","味方全体のHPを20%回復する。"],
  ["連携の一撃","multiAttack",.72,11,"攻撃","敵単体","仲間と呼吸を合わせた二連撃。"],
  ["生命の雫","allHeal",.28,15,"回復","味方全体","味方全体のHPを28%回復する。"],
  ["希望の閃光","attack",1.8,16,"攻撃","敵単体","希望を凝縮した強い一撃。"],
  ["大治癒陣","allHeal",.38,22,"回復","味方全体","味方全体のHPを38%回復する。"],
  ["救済の連弾","multiAttack",1.0,24,"攻撃","敵単体","救済の力を込めた二連撃。"],
  ["奇跡の風","allHeal",.52,30,"回復","味方全体","味方全体のHPを52%回復する。"],
  ["聖域の裁き","attack",2.6,35,"奥義","敵単体","聖域から裁きの光を落とす。"],
  ["生命賛歌","allHeal",.75,46,"超奥義","味方全体","味方全体のHPを75%回復する。"]
 ],
 debuffer:[
  ["弱化の牙","attack",1.1,4,"デバフ","敵単体","弱点を狙う攻撃。"],
  ["毒蝕","attack",1.05,6,"継続ダメージ","敵単体","55%で3ターン毒を付与する。","poison"],
  ["侵食連撃","multiAttack",.68,9,"デバフ","敵単体","侵食する二連撃。"],
  ["腐食弾","attack",1.35,10,"継続ダメージ","敵単体","65%で3ターン毒を付与する。","poison"],
  ["暗黒穿ち","attack",1.65,14,"攻撃","敵単体","防御の隙間を穿つ。"],
  ["猛毒連鎖","multiAttack",.88,17,"継続ダメージ","敵単体","二連撃後、毒を狙う。","poison"],
  ["深層侵食","attack",1.85,20,"デバフ","敵単体","深層の力で肉体を侵す。"],
  ["死毒の刻印","attack",2.05,24,"継続ダメージ","敵単体","75%で強い毒を付与する。","poison"],
  ["崩壊連牙","multiAttack",1.15,28,"攻撃","敵単体","崩壊を招く二連撃。"],
  ["奈落汚染","attack",2.65,35,"奥義","敵単体","奈落の毒気を叩き込む。","poison"],
  ["終末侵蝕","attack",3.1,44,"超奥義","敵単体","終末級の侵蝕攻撃。","poison"]
 ],
 attacker:[
  ["強撃","attack",1.35,4,"攻撃","敵単体","力を込めた強い一撃。"],
  ["二連破","multiAttack",.78,6,"攻撃","敵単体","素早い二連撃。"],
  ["急所砕き","attack",1.7,9,"攻撃","敵単体","急所へ叩き込む。"],
  ["暴威連斬","multiAttack",.94,12,"攻撃","敵単体","荒々しい二連撃。"],
  ["破軍撃","attack",2.0,15,"攻撃","敵陣を破る重撃。"],
  ["猛襲三段","multiAttack",.78,18,"攻撃","敵単体","高速の三連撃。",null,3],
  ["深層穿断","attack",2.3,21,"攻撃","敵単体","深層の力で敵を断つ。"],
  ["覇王連撃","multiAttack",1.15,26,"攻撃","敵単体","覇気をまとった二連撃。"],
  ["滅砕撃","attack",2.75,30,"攻撃","敵単体","すべてを砕く一撃。"],
  ["奈落一閃","attack",3.15,37,"奥義","敵単体","奈落を裂く一閃。"],
  ["終焉撃","attack",3.8,48,"超奥義","敵単体","終焉を告げる最大火力。"]
 ],
 drain:[
  ["生命吸収","drain",1.15,5,"吸収","敵単体","与えたダメージの35%を吸収する。"],
  ["血牙連撃","multiAttack",.7,7,"攻撃","敵単体","血を求める二連撃。"],
  ["魂吸い","drain",1.45,10,"吸収","敵単体","与えたダメージの40%を吸収する。"],
  ["暗夜の爪","attack",1.75,12,"攻撃","敵単体","暗夜に紛れて切り裂く。"],
  ["命脈喰らい","drain",1.8,16,"吸収","敵単体","与えたダメージの45%を吸収する。"],
  ["血界連牙","multiAttack",.95,18,"攻撃","敵単体","血界から放つ二連撃。"],
  ["深淵吸命","drain",2.15,22,"吸収","敵単体","与えたダメージの50%を吸収する。"],
  ["魂魄穿ち","attack",2.5,27,"攻撃","敵単体","魂そのものを穿つ。"],
  ["不死の晩餐","drain",2.65,32,"吸収","敵単体","与えたダメージの60%を吸収する。"],
  ["奈落捕食","drain",3.0,38,"奥義","敵単体","奈落の力で生命を捕食する。"],
  ["永劫吸魂","drain",3.45,48,"超奥義","敵単体","与えたダメージの75%を吸収する。"]
 ]
};

function archetype(species){
 const role=String(species?.role??"");
 if(["tank","guard","defense"].some(x=>role.includes(x)))return"tank";
 if(["support","healer","heal"].some(x=>role.includes(x)))return"support";
 if(["debuffer","poison","burner","controller"].some(x=>role.includes(x)))return"debuffer";
 if(["drain","vampire"].some(x=>role.includes(x)))return"drain";
 return"attacker";
}
function elementLabel(element){return({fire:"炎",water:"水",ice:"氷",earth:"土",wind:"風",lightning:"雷",thunder:"雷",dark:"闇",light:"光",poison:"毒",nature:"自然",neutral:"無"})[element]??"無"}
function generatedSkill(species,index,row){
 const[name,type,value,mp,tag,target,description,statusId,hits]=row;
 const magicRole=["magic","support","healer","controller","debuffer","poison","burner"].some(value=>String(species.role??"").includes(value));
 const skill={id:`${species.id}__skill_${index+2}`,name:index>=8?`${species.name}・${name}`:name,mp,type,description,target,tag,element:species.element??"neutral",damageClass:magicRole?"magic":"physical",cooldown:index<2?0:index<5?1:index<8?2:index<10?3:4,unlock:{type:"level",value:UNLOCK_LEVELS[index+1]}};
 if(type==="selfHeal"||type==="allHeal")skill.heal=value;else skill.power=value;
 if(type==="drain")skill.drain=index>=9?.75:index>=6?.55:.4;
 if(type==="multiAttack")skill.hits=hits??2;
 if(statusId)skill.status={id:statusId,name:statusId==="poison"?"毒":"炎上",chance:index>=7?.75:.6,turns:3,power:index>=7?.05:.03};
 return skill;
}
const GENERATED={};
for(const species of Object.values(SPECIES)){
 const baseEntry=species.skills?.[0],base=baseEntry?SKILLS[baseEntry.id]:null;
 const magicRole=["magic","support","healer","controller","debuffer","poison","burner"].some(value=>String(species.role??"").includes(value));
 const first={mp:3,type:"attack",power:1,description:"敵単体へ通常威力の攻撃。",damageClass:magicRole?"magic":"physical",...baseEntry,...base,target:base?.type==="allHeal"?"味方全体":base?.type==="selfHeal"?"自分":"敵単体",tag:base?.type?.includes("Heal")?"回復":base?.status?"継続ダメージ":"攻撃",element:species.element??"neutral",cooldown:0,unlock:{type:"level",value:1}};
 GENERATED[species.id]=[first,...ROLE_POOLS[archetype(species)].map((row,index)=>generatedSkill(species,index,row))];
}
function phase2Decorate(species,skills){
 const kind=archetype(species);
 const presets={
  tank:[
   null,
   {name:"挑発の構え",type:"stance",tag:"タンク",target:"自分",description:"2ターン挑発し、受けるダメージを35%軽減。",effects:[{kind:"taunt",turns:2},{kind:"guard",value:.35,turns:2}]},
   {name:"盾砕き",effects:[{kind:"stun",chance:.35,turns:1,enemy:true}]},
   {name:"鉄壁",type:"stance",tag:"防御",target:"自分",description:"2ターン受けるダメージを55%軽減。",effects:[{kind:"guard",value:.55,turns:2}]},
   {name:"迎撃態勢",type:"stance",tag:"カウンター",target:"自分",description:"3ターン、攻撃を受けるとATK120%で反撃。",effects:[{kind:"counter",value:1.2,turns:3}]},
   {name:"守護の号令",type:"buff",tag:"バフ",target:"味方全体",description:"味方全体のDEFを30%上げる。",effects:[{kind:"defUp",value:.30,turns:3,allies:true}]},
   {name:"不屈の要塞",type:"stance",tag:"タンク",target:"自分",description:"HPを38%回復し、2ターン挑発する。",heal:.38,effects:[{kind:"taunt",turns:2}]},
   {name:"城壁反射",type:"stance",tag:"カウンター",target:"自分",description:"2ターン被ダメージ45%軽減、ATK160%で反撃。",effects:[{kind:"guard",value:.45,turns:2},{kind:"counter",value:1.6,turns:2}]},
   {name:"全軍防衛",type:"buff",tag:"防御",target:"味方全体",description:"味方全体の被ダメージを30%軽減。",effects:[{kind:"guard",value:.30,turns:2,allies:true}]},
   {name:"最後の砦",type:"stance",tag:"タンク",target:"自分",description:"HP70%回復、3ターン挑発・被ダメージ60%軽減。",heal:.70,effects:[{kind:"taunt",turns:3},{kind:"guard",value:.60,turns:3}]},
   {name:"奈落の反城",type:"stance",tag:"カウンター",target:"自分",description:"3ターン、被ダメージ50%軽減しATK220%で反撃。",effects:[{kind:"guard",value:.50,turns:3},{kind:"counter",value:2.2,turns:3}]},
   {name:"絶対防衛圏",type:"buff",tag:"超奥義",target:"味方全体",description:"味方全体を50%回復し、3ターン被ダメージ50%軽減。",heal:.50,effects:[{kind:"guard",value:.50,turns:3,allies:true}]}
  ],
  support:[
   null,
   {name:"癒やしの光",type:"allHeal",heal:.16,tag:"回復",target:"味方全体",description:"味方全体のHPを16%回復。"},
   {name:"勇気の旋律",type:"buff",tag:"バフ",target:"味方全体",description:"味方全体のATKを25%上げる。",effects:[{kind:"atkUp",value:.25,turns:3,allies:true}]},
   {name:"再生の風",type:"buff",tag:"継続回復",target:"味方全体",description:"3ターン、味方全体を毎ターン最大HP10%回復。",effects:[{kind:"regen",value:.10,turns:3,allies:true}]},
   {name:"浄化",type:"cleanse",tag:"回復",target:"味方全体",description:"味方全体の状態異常と弱体効果を解除。"},
   {name:"加速の祝福",type:"buff",tag:"バフ",target:"味方全体",description:"味方全体のSPDを30%上げる。",effects:[{kind:"spdUp",value:.30,turns:3,allies:true}]},
   {name:"大治癒陣",type:"allHeal",heal:.34,tag:"回復",target:"味方全体",description:"味方全体のHPを34%回復。"},
   {name:"守護結界",type:"buff",tag:"防御",target:"味方全体",description:"2ターン、味方全体の被ダメージを35%軽減。",effects:[{kind:"guard",value:.35,turns:2,allies:true}]},
   {name:"魔力循環",type:"mpHeal",tag:"回復",target:"味方全体",description:"味方全体のMPを最大値の25%回復。",mpHeal:.25},
   {name:"奇跡の蘇生",type:"revive",tag:"蘇生",target:"味方単体",description:"戦闘不能の味方1体をHP40%で蘇生。",revive:.40},
   {name:"生命賛歌",type:"allHeal",heal:.65,tag:"奥義",target:"味方全体",description:"味方全体のHPを65%回復し弱体を解除。",cleanse:true},
   {name:"女神の聖域",type:"buff",tag:"超奥義",target:"味方全体",description:"全体HP80%回復、3ターン再生と被ダメージ40%軽減。",heal:.80,effects:[{kind:"regen",value:.15,turns:3,allies:true},{kind:"guard",value:.40,turns:3,allies:true}]}
  ],
  debuffer:[
   null,
   {name:"弱体の牙",effects:[{kind:"atkDown",value:.20,turns:3,enemy:true}]},
   {name:"毒蝕",status:{id:"poison",name:"毒",chance:.70,turns:3,power:.04}},
   {name:"鈍化連撃",effects:[{kind:"spdDown",value:.30,turns:3,enemy:true}]},
   {name:"腐食弾",status:{id:"poison",name:"猛毒",chance:.80,turns:4,power:.05},effects:[{kind:"defDown",value:.20,turns:3,enemy:true}]},
   {name:"破甲穿ち",effects:[{kind:"defDown",value:.35,turns:3,enemy:true}]},
   {name:"呪縛",effects:[{kind:"stun",chance:.55,turns:1,enemy:true}]},
   {name:"深層侵食",effects:[{kind:"atkDown",value:.35,turns:3,enemy:true},{kind:"defDown",value:.25,turns:3,enemy:true}]},
   {name:"死毒の刻印",status:{id:"poison",name:"死毒",chance:.90,turns:4,power:.07}},
   {name:"崩壊呪詛",effects:[{kind:"atkDown",value:.40,turns:4,enemy:true},{kind:"defDown",value:.40,turns:4,enemy:true}]},
   {name:"奈落汚染",status:{id:"poison",name:"奈落毒",chance:1,turns:5,power:.08},effects:[{kind:"spdDown",value:.45,turns:4,enemy:true}]},
   {name:"終末侵蝕",status:{id:"poison",name:"終末毒",chance:1,turns:5,power:.11},effects:[{kind:"atkDown",value:.50,turns:4,enemy:true},{kind:"defDown",value:.50,turns:4,enemy:true}]}
  ],
  attacker:[
   null,
   {name:"強撃"},
   {name:"戦意高揚",type:"buff",tag:"バフ",target:"自分",description:"3ターンATKを30%上げる。",effects:[{kind:"atkUp",value:.30,turns:3}]},
   {name:"急所砕き",critBonus:.25},
   {name:"暴威連斬"},
   {name:"捨て身",type:"buff",tag:"攻撃特化",target:"自分",description:"3ターンATK50%上昇、被ダメージ20%増加。",effects:[{kind:"atkUp",value:.50,turns:3},{kind:"vulnerable",value:.20,turns:3}]},
   {name:"猛襲三段",hits:3},
   {name:"処刑撃",execute:.30,description:"敵HP30%以下なら威力が2倍。"},
   {name:"覇王連撃",hits:3},
   {name:"殲滅波",target:"敵全体",allEnemies:true,power:1.55,description:"敵全体に155%ダメージ。"},
   {name:"奈落一閃",critBonus:.45},
   {name:"終焉撃",execute:.45,description:"敵HP45%以下なら威力が2倍。"}
  ],
  drain:[
   null,
   {name:"生命吸収",drain:.40},
   {name:"血の契約",type:"buff",tag:"バフ",target:"自分",description:"3ターンATK25%上昇、与ダメージの15%を回復。",effects:[{kind:"atkUp",value:.25,turns:3},{kind:"lifeSteal",value:.15,turns:3}]},
   {name:"魂吸い",drain:.50},
   {name:"暗夜の呪い",effects:[{kind:"atkDown",value:.25,turns:3,enemy:true}]},
   {name:"命脈喰らい",drain:.58},
   {name:"血界連牙",hits:3},
   {name:"深淵吸命",drain:.65},
   {name:"不死の再生",type:"buff",tag:"継続回復",target:"自分",description:"4ターン毎ターン最大HP15%回復。",effects:[{kind:"regen",value:.15,turns:4}]},
   {name:"魂魄穿ち",effects:[{kind:"defDown",value:.35,turns:3,enemy:true}]},
   {name:"奈落捕食",drain:.80},
   {name:"永劫吸魂",drain:1.0,description:"与えたダメージと同量を回復する。"}
  ]
 };
 const arr=presets[kind]||presets.attacker;
 return skills.map((skill,index)=>({...skill,...(arr[index]||{}),effects:(arr[index]?.effects??skill.effects??[])}));
}
for(const species of Object.values(SPECIES))GENERATED[species.id]=phase2Decorate(species,GENERATED[species.id]);
for(const species of Object.values(SPECIES)){
 if(!Array.isArray(species.authoredSkills)||!species.authoredSkills.length)continue;
 const magicRole=["magic","support","healer","controller","debuffer","poison","burner"].some(value=>String(species.role??"").includes(value));
 GENERATED[species.id]=species.authoredSkills.map((source,index)=>({
  id:`${species.id}__authored_${index+1}`,
  name:`${species.name}の技${index+1}`,
  mp:3,
  type:"attack",
  power:1,
  target:"敵単体",
  tag:"攻撃",
  element:species.element??"neutral",
  damageClass:magicRole?"magic":"physical",
  cooldown:index<2?0:index<4?2:3,
  unlock:{type:"level",value:UNLOCK_LEVELS[Math.min(index,UNLOCK_LEVELS.length-1)]},
  description:"固有能力を発動する。",
  ...source
 }));
}
const BY_ID=new Map(Object.values(GENERATED).flat().map(skill=>[skill.id,skill]));

export function maxMp(monster){
 const number=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback,species=SPECIES[monster.speciesId]??{},level=Math.max(1,number(monster.level,1)),rank=Math.max(1,number(monster.rank,1)),stars=Math.max(1,number(monster.stars,1)),role=String(species.role??"");
 const caster=["magic","support","healer","controller","debuffer","poison","burner"].some(value=>role.includes(value)),tank=["tank","guard","defense"].some(value=>role.includes(value));
 const base=Math.max(35,number(species.maxMp,15)+(caster?55:tank?25:38)),growth=(caster?2.4:tank?1.35:1.75)*Math.pow(level,.72),rarityBonus=(rank-1)*18+(stars-1)*5,endgame=monster.endgameFaction==="tenGod"?4:monster.endgameFaction==="abyss"?2.4:1,raw=(base+growth+rarityBonus)*endgame+number(monster._equipmentStats?.mp),pct=number(monster._equipmentAffixes?.mpPct);
 return Math.max(0,Math.floor(raw*(1+pct/100)));
}
export function effectiveSkillMpCost(monster,skill){const source=Number(monster?._equipmentAffixes?.mpCostReduction??0),reduction=Math.min(50,Number.isFinite(source)?Math.max(0,source):0),base=Number(skill?.mp??0);return Math.max(0,Math.ceil((Number.isFinite(base)?base:0)*(1-reduction/100)))}
export function allSpeciesSkills(speciesId){return GENERATED[speciesId]??[]}
export function allLearnedSkills(monster){const source=monster?.endgameBossId?endgameSkills(monster.endgameBossId):allSpeciesSkills(monster.speciesId);return source.filter(skill=>monster.level>=(skill.unlock?.value??1))}
export function normalizeSkillLoadout(monster){
 const learned=allLearnedSkills(monster),valid=new Set(learned.map(x=>x.id));
 if(!Array.isArray(monster.equippedSkills)||monster.equippedSkills.length===0){
  monster.equippedSkills=learned.slice(0,4).map(skill=>skill.id);
 }
 const saved=Array.from({length:4},(_,index)=>{
  const id=monster.equippedSkills[index];
  return valid.has(id)?id:null;
 });
 const used=new Set();
 monster.equippedSkills=saved.map(id=>{if(!id||used.has(id))return null;used.add(id);return id});
 return monster.equippedSkills;
}
export function learnedSkills(monster){const equipped=new Set(normalizeSkillLoadout(monster));return allLearnedSkills(monster).filter(skill=>equipped.has(skill.id))}
export function equipSkill(monster,skillId,slot){const learned=new Set(allLearnedSkills(monster).map(x=>x.id));if(!learned.has(skillId)||slot<0||slot>3)return false;normalizeSkillLoadout(monster);const next=Array.from({length:4},(_,index)=>monster.equippedSkills[index]??null),previous=next.indexOf(skillId);if(previous>=0)next[previous]=next[slot]??null;next[slot]=skillId;monster.equippedSkills=next;return true}

export function skillProgressFor(monster,skillId){monster.skillProgress??={};const current=monster.skillProgress[skillId]??{level:1,exp:0,uses:0};current.level=Math.max(1,Math.min(10,Number(current.level??1)));current.exp=Math.max(0,Number(current.exp??0));current.uses=Math.max(0,Number(current.uses??0));current.need=current.level>=10?0:25*current.level;monster.skillProgress[skillId]=current;return current}
export function normalizeSkillProgress(monster){
 monster.skillProgress=monster.skillProgress&&typeof monster.skillProgress==="object"&&!Array.isArray(monster.skillProgress)?monster.skillProgress:{};
 const valid=new Set(allLearnedSkills(monster).map(skill=>skill.id));
 for(const skillId of Object.keys(monster.skillProgress)){
  if(!valid.has(skillId)){delete monster.skillProgress[skillId];continue}
  skillProgressFor(monster,skillId);
 }
 normalizeSkillLoadout(monster);
 return monster.skillProgress;
}
export function recordSkillUse(monster,skillId,multiplier=1){const progress=skillProgressFor(monster,skillId);progress.uses++;if(progress.level>=10)return progress;progress.exp+=Math.max(1,Math.round(10*Math.max(0,multiplier)));while(progress.level<10&&progress.exp>=25*progress.level){progress.exp-=25*progress.level;progress.level++}progress.need=progress.level>=10?0:25*progress.level;return progress}
export function skillById(id){return endgameSkillById(id)??BY_ID.get(id)??SKILLS[id]??null}
export function canUseSkill(monster,skill,cooldown=0){return Boolean(skill)&&monster.currentMp>=effectiveSkillMpCost(monster,skill)&&cooldown<=0}
export function affixOutgoingDamageMultiplier(stats,enemy,element="neutral"){
 const a=stats?._affixes??{};
 // Species data represents ice as water and thunder as lightning. Accept the
 // equipment vocabulary as aliases so neither affix becomes a displayed-only
 // stat. Water and ice bonuses therefore share the same elemental family.
 const elementKeys=element==="lightning"
  ?["thunderDamage"]
  :element==="water"||element==="ice"
   ?["waterDamage","iceDamage"]
   :[`${element}Damage`];
 const elementBonus=elementKeys.reduce((sum,key)=>sum+(Number(a[key])||0),0);
 const targetBonus=enemy?.boss||enemy?.endgameBossId?a.bossDamage??0:a.normalDamage??0,lowBonus=stats?._currentHpRatio!=null&&stats._currentHpRatio<=.35?a.lowHpDamage??0:0,fullBonus=stats?._currentHpRatio!=null&&stats._currentHpRatio>=.999?a.fullHpDamage??0:0,total=Math.max(0,Math.min(300,Number(elementBonus)+Number(targetBonus)+Number(lowBonus)+Number(fullBonus)));return 1+total/100
}
export function skillDamage(stats,enemy,skill,critical=false){const a=stats._affixes??{},magic=skill?.damageClass==="magic",attack=magic?(stats.matk??stats.atk):stats.atk,defense=magic?(enemy.mdef??enemy.def):enemy.def,base=Math.max(1,Math.floor((attack*skill.power-defense*.3)*affixOutgoingDamageMultiplier(stats,enemy,skill?.element??"neutral"))),critMult=1.65+(a.critDamage??0)/100;return critical?Math.floor(base*critMult):base}
export function skillElementLabel(skill){return elementLabel(skill?.element)}

const STATUS_NAMES=Object.freeze({poison:"毒",burn:"炎上",bleed:"出血",curse:"呪い",paralysis:"麻痺",freeze:"凍結",shock:"感電",sleep:"睡眠",charm:"魅了",confusion:"混乱",fear:"恐怖",petrify:"石化"});
const EFFECT_NAMES=Object.freeze({atkUp:"ATK上昇",atkDown:"ATK低下",defUp:"DEF上昇",defDown:"DEF低下",spdUp:"SPD上昇",spdDown:"SPD低下"});
function percent(value){return`${Math.round((Number(value)||0)*100)}%`}
function turnText(value){const turns=Math.max(0,Math.round(Number(value)||0));return turns?`${turns}ターン`:"即時"}

// Generate the displayed specification from the same numeric fields consumed
// by battle resolution, so UI wording cannot drift away from the real formula.
export function skillEffectDetails(skill){
 if(!skill)return[];
 const lines=[],power=Math.max(0,Number(skill.power)||0),hits=Math.max(1,Math.round(Number(skill.hits)||1));
 if(power>0){
  const attack=skill.damageClass==="magic"?"魔法ATK":"物理ATK",hitText=hits>1?` × ${hits}Hit（合計 ${percent(power*hits)}）`:"";
  lines.push(`${attack}の${percent(power)}ダメージ${hitText}`);
 }
 if(Number(skill.heal)>0)lines.push(`${skill.target==="味方全体"?"味方全体":"自分"}のHPを最大HPの${percent(skill.heal)}回復`);
 if(Number(skill.mpHeal)>0)lines.push(`${skill.target==="味方全体"?"味方全体":"対象"}のMPを最大MPの${percent(skill.mpHeal)}回復`);
 if(Number(skill.revive)>0)lines.push(`戦闘不能の味方1体をHP${percent(skill.revive)}${Number(skill.reviveMp)>0?`・MP${percent(skill.reviveMp)}`:""}で蘇生`);
 if(Number(skill.drain)>0)lines.push(`与ダメージの${percent(skill.drain)}をHP吸収`);
 if(Number(skill.selfHeal)>0)lines.push(`命中後、自分の最大HPの${percent(skill.selfHeal)}を回復`);
 if(Number(skill.mpDrain)>0)lines.push(`対象の最大MPの${percent(skill.mpDrain)}まで吸収`);
 if(Number(skill.currentHpDamage)>0)lines.push(`追加で対象の現在HPの${percent(Math.min(.25,Number(skill.currentHpDamage)))}ダメージ`);
 if(Number(skill.defenseIgnore)>0)lines.push(`対象の${skill.damageClass==="magic"?"魔法DEF":"物理DEF"}を${percent(Math.min(.9,Number(skill.defenseIgnore)))}無視`);
 if(Number(skill.execute)>0)lines.push(`対象HP${percent(skill.execute)}以下なら基礎威力2倍`);
 if(Number(skill.critBonus)>0)lines.push(`会心率 +${percent(skill.critBonus)}`);
 if(skill.guaranteedCritical)lines.push("必ず会心");
 if(skill.guaranteedHit)lines.push("必中（回避・通常ガード判定を無視）");
 if(skill.allEnemies)lines.push("敵全体が対象");
 if(skill.randomElement)lines.push("発動ごとに攻撃属性が変化");
 if(Number(skill.repeatDelay)>0)lines.push(`${turnText(skill.repeatDelay)}後に同威力の追撃`);
 if(skill.confusion)lines.push("対象を誤作動させる");
 if(skill.cleanse)lines.push("状態異常・弱体効果を解除");
 if(Number(skill.barrier)>0)lines.push(`障壁を${Math.round(Number(skill.barrier))}段階付与`);
 if(Number(skill.selfAtk)>0)lines.push(`命中後、自分のATK +${percent(skill.selfAtk)}`);
 if(Number(skill.lowHpBonus)>0)lines.push(`低HP時に威力 +${percent(skill.lowHpBonus)}`);
 const status=skill.status;
 if(status){
  const name=status.name??STATUS_NAMES[status.id]??status.id??"状態異常",chance=percent(status.chance??1),turns=turnText(status.turns);
  lines.push(`${name}：成功率${chance}・${turns}${Number(status.power)>0?`・毎ターン最大HPの${percent(status.power)}ダメージ`:""}`);
 }
 for(const effect of skill.effects??[]){
  const target=effect.allies?"味方全体":effect.enemy?"対象":"自分",turns=turnText(effect.turns);
  if(EFFECT_NAMES[effect.kind]){lines.push(`${target}の${EFFECT_NAMES[effect.kind]} ${effect.kind.endsWith("Down")?"−":"+"}${percent(effect.value)}・${turns}`);continue}
  if(effect.kind==="guard"){lines.push(`${target}の被ダメージを${percent(effect.value)}軽減・${turns}`);continue}
  if(effect.kind==="counter"){lines.push(`攻撃を受けると物理ATKの${percent(effect.value)}で反撃・${turns}`);continue}
  if(effect.kind==="regen"){lines.push(`${target}のHPを毎ターン最大HPの${percent(effect.value)}回復・${turns}`);continue}
  if(effect.kind==="lifeSteal"){lines.push(`与ダメージの${percent(effect.value)}をHP回復・${turns}`);continue}
  if(effect.kind==="vulnerable"){lines.push(`${target}の被ダメージ +${percent(effect.value)}・${turns}`);continue}
  if(effect.kind==="taunt"){lines.push(`敵の攻撃を自分へ引きつける・${turns}`);continue}
  if(effect.kind==="stun"){lines.push(`${STATUS_NAMES[effect.statusId]??"行動不能"}：成功率${percent(effect.chance??1)}・${turns}`);continue}
  lines.push(`${effect.name??effect.kind}・${turns}`);
 }
 return[...new Set(lines)];
}
export function skillEffectSummary(skill,separator=" / "){const details=skillEffectDetails(skill);return details.length?details.join(separator):(skill?.description??"特殊効果を発動")}

export function chooseAutoSkill(monster,battle){
 const usable=learnedSkills(monster).filter(skill=>canUseSkill(monster,skill,battle?.cooldowns?.[monster.id]?.[skill.id]??0));
 if(!usable.length)return null;
 const hp=monster.currentHp/Math.max(1,monster._maxHp??1),dead=(battle?.party??[]).some(m=>m.currentHp<=0),hurt=(battle?.party??[]).filter(m=>m.currentHp>0&&m.currentHp<(m._maxHp??Infinity)*.65).length;
 if(dead){const revive=usable.find(s=>s.type==="revive");if(revive)return revive}
 if(hurt>=2){const heal=usable.filter(s=>s.type==="allHeal").sort((a,b)=>(b.heal??0)-(a.heal??0))[0];if(heal)return heal}
 if(hp<.38){const heal=usable.find(s=>s.type==="selfHeal"||s.heal&&s.target==="自分");if(heal)return heal}
 const tactical=usable.filter(s=>["buff","stance","cleanse","mpHeal"].includes(s.type));if(tactical.length&&Math.random()<.28)return tactical[Math.floor(Math.random()*tactical.length)];
 const attacks=usable.filter(s=>!["allHeal","selfHeal","buff","stance","cleanse","revive","mpHeal"].includes(s.type));return attacks.sort((a,b)=>(b.power??0)-(a.power??0))[0]??usable[0]
}
