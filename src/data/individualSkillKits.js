// Every ordinary species receives a deterministic kit built from its own name,
// race, role, element, rarity and base-stat silhouette. The tiny identity offset
// in attack power prevents two different species from ending with an identical
// mechanical signature without materially changing balance.
const RARITY_INDEX=Object.freeze({N:0,R:1,SR:2,SSR:3,UR:4,LR:5,"神話":6,SECRET:3});
const SKILL_COUNTS=Object.freeze({N:4,R:5,SR:6,SSR:7,UR:8,LR:9,"神話":10,SECRET:7});
export const SKILL_BALANCE_VERSION=199;
const RARITY_MP_CAP=Object.freeze({N:18,R:22,SR:28,SSR:34,UR:40,LR:48,"神話":56,SECRET:36});
const UNLOCKS=Object.freeze({
 N:[1,20,80,180],R:[1,15,60,140,300],SR:[1,12,45,110,240,500],SSR:[1,10,35,90,190,400,800],
 UR:[1,8,30,70,150,320,650,1300],LR:[1,6,25,60,125,260,520,1050,2100],
 "神話":[1,5,20,50,100,210,420,850,1700,3400],SECRET:[1,10,40,100,220,480,960]
});
const ELEMENT=Object.freeze({
 fire:{label:"炎",noun:"紅蓮",status:{id:"burn",name:"炎上",chance:.58,turns:3,power:.035}},
 water:{label:"水",noun:"蒼流",status:{id:"freeze",name:"凍結",chance:.24,turns:1,power:0}},
 ice:{label:"氷",noun:"氷晶",status:{id:"freeze",name:"凍結",chance:.30,turns:1,power:0}},
 earth:{label:"土",noun:"地脈",status:{id:"stun",name:"気絶",chance:.22,turns:1,power:0}},
 wind:{label:"風",noun:"翠嵐",status:{id:"bleed",name:"出血",chance:.50,turns:3,power:.03}},
 lightning:{label:"雷",noun:"雷霆",status:{id:"paralysis",name:"麻痺",chance:.28,turns:2,power:0}},
 thunder:{label:"雷",noun:"雷霆",status:{id:"paralysis",name:"麻痺",chance:.28,turns:2,power:0}},
 light:{label:"光",noun:"聖光",status:{id:"stun",name:"眩惑",chance:.18,turns:1,power:0}},
 dark:{label:"闇",noun:"冥影",status:{id:"curse",name:"呪い",chance:.50,turns:3,power:.03}},
 poison:{label:"毒",noun:"翠毒",status:{id:"poison",name:"毒",chance:.66,turns:4,power:.04}},
 nature:{label:"自然",noun:"翠生",status:{id:"poison",name:"胞子毒",chance:.44,turns:3,power:.025}},
 neutral:{label:"無",noun:"無相",status:{id:"stun",name:"衝撃",chance:.16,turns:1,power:0}}
});
const MAGIC_ROLES=new Set(["magic","support","healer","controller","debuffer","poison","burner"]);
const TANK_ROLES=new Set(["tank","counter","bruiser"]);

export function isOffensiveSkill(skill){
 return Boolean(skill)&&(Number(skill.power)>0||Number(skill.currentHpDamage)>0||Number(skill.selfSacrificeHpDamage)>0||Number(skill.hits)>1&&skill.type==="attack");
}
function directPower(skill){return isOffensiveSkill(skill)?Math.max(0,Number(skill.power)||0)*Math.max(1,Number(skill.hits)||1)*(skill.allEnemies?1.25:1):0}
function utilityScore(skill){
 const effects=Array.isArray(skill?.effects)?skill.effects:[];
 return(Math.max(Number(skill?.heal)||0,Number(skill?.selfHeal)||0)*2.1)+(Number(skill?.mpHeal)||0)*1.5+(Number(skill?.revive)||0)*2.6+(Number(skill?.partyShieldRate)||0)*2.2+(Number(skill?.selfShieldRate)||0)*1.4+effects.length*.13+(skill?.status?.chance?Number(skill.status.chance)*.45:0);
}
export function skillProgressionScore(skill){return directPower(skill)+utilityScore(skill)}

function minimumCooldown(skill,index,lastIndex){
 if(Number(skill?.revive)>0||Number(skill?.reviveTransferRate)>0)return 5;
 if(index===lastIndex||String(skill?.tag??"").includes("奥義"))return 4;
 const lasting=(skill?.status?.turns??0)>1||(skill?.effects??[]).some(effect=>(Number(effect?.turns)||0)>1);
 const party=skill?.target==="味方全体"||skill?.target==="敵全体"||skill?.allEnemies;
 return lasting||party||skill?.type==="allHeal"?Math.min(3,Math.max(1,index>=4?2:1)):0;
}
export function balanceIndividualSkillKit(species,skills,{preserveAuthored=false}={}){
 const list=(Array.isArray(skills)?skills:[]).map(skill=>({...skill,effects:Array.isArray(skill?.effects)?skill.effects.map(effect=>({...effect})):skill?.effects,status:skill?.status?{...skill.status}:skill?.status}));
 const tier=RARITY_INDEX[species?.rarity??"N"]??0,lastIndex=Math.max(0,list.length-1),cap=RARITY_MP_CAP[species?.rarity??"N"]??18;
 let previousDirect=0;
 return list.map((skill,index)=>{
  const protectedSkill=preserveAuthored||skill.equipmentGranted===true;
  const authored=skill.authoredSource===true;
  const floor=1.02+tier*.035+index*.16+(index===lastIndex?.3:0),ceiling=floor+.25+tier*.04+(index===lastIndex?.45:0);
  const direct=directPower(skill);
  if(direct>0){
   if(!protectedSkill&&!authored){
    const normalized=Math.min(direct,ceiling),required=Math.max(floor,previousDirect>0?previousDirect*1.08:floor),target=Math.max(normalized,required),scale=target/direct;
    skill.power=round(Math.max(.1,(Number(skill.power)||1)*scale),6);
   }
   const adjusted=directPower(skill);
   // A very large hand-authored opener is preserved, but does not force every
   // later generated technique into absurd numbers.
   previousDirect=Math.max(previousDirect,authored?Math.min(adjusted,Math.min(2.75,ceiling*1.6)):adjusted);
  }
  if(!protectedSkill&&!authored){
   if(skill.type==="allHeal"&&Number(skill.heal)<.12+tier*.012)skill.heal=round(.12+tier*.012,3);
   if(skill.type==="selfHeal"&&Number(skill.heal)<.16+tier*.014)skill.heal=round(.16+tier*.014,3);
  }
  if(!protectedSkill){
   skill.mp=Math.max(0,Math.min(cap,Math.round(Number(skill.mp)||0)));
   skill.playerMpCostCap=cap;
   skill.cooldown=Math.max(Math.round(Number(skill.cooldown)||0),minimumCooldown(skill,index,lastIndex));
   skill.balanceVersion=SKILL_BALANCE_VERSION;
  }
  return skill;
 });
}

function hash(text){let value=2166136261;for(const char of String(text)){value^=char.charCodeAt(0);value=Math.imul(value,16777619)}return value>>>0}
function round(value,digits=3){const scale=10**digits;return Math.round(value*scale)/scale}
function effect(kind,value,turns,extra={}){return{kind,value,turns,...extra}}
function identityName(species,suffix){return`${species.name}・${suffix}`}
function baseSkill(species,index,suffix,source={}){
 const rarity=species.rarity??"N",unlock=(UNLOCKS[rarity]??UNLOCKS.N)[index]??1,rarityIndex=RARITY_INDEX[rarity]??0,magic=MAGIC_ROLES.has(String(species.role??"")),element=species.element??"neutral";
 return{id:`${species.id}__identity_${index+1}`,name:identityName(species,suffix),mp:index===0?3:Math.min(56,4+index*3+rarityIndex*2),type:"attack",power:1,target:"敵単体",tag:"固有",element,damageClass:magic?"magic":"physical",cooldown:index<2?0:index<4?1:index<7?2:index<9?3:4,unlock:{type:"level",value:unlock},description:"種族固有の戦技を発動する。",...source};
}
function openingAttack(species,seed,tier,element){
 const base=1.04+tier*.035+(seed%19)/1000+(seed%100000)/100000000;
 const highCrit=["speed","assassin","critical","ambush","ranged"].includes(species.role);
 return baseSkill(species,0,`${element.noun}の刻`,{power:round(base,6),tag:`${element.label}撃`,description:`${species.name}だけが扱う${element.label}属性の基礎戦技。`,critBonus:highCrit?.08:0});
}
function raceTechnique(species,seed,tier){
 const race=species.race??"spirit",rate=.16+tier*.018+(seed%5)*.01;
 const defs={
  slime:["粘体再編",{type:"stance",target:"自分",tag:"再生",power:0,heal:.12+tier*.015,effects:[effect("guard",rate,2)],description:"身体を組み替え、傷と衝撃を同時に受け流す。"}],
  beast:["狩猟本能",{type:"buff",target:"自分",tag:"強化",power:0,effects:[effect("atkUp",rate,3),effect("spdUp",rate*.75,3)],description:"獲物へ狙いを定め、攻撃と速度を高める。"}],
  flying:["逆風滑空",{type:"stance",target:"自分",tag:"回避転換",power:0,effects:[effect("spdDown",.18+tier*.01,3),effect("evasionUp",.24+tier*.025,3)],description:"速度を落として軌道を読み、回避率を大きく上げる。"}],
  insect:["甲殻換装",{type:"stance",target:"自分",tag:"反撃",power:0,effects:[effect("defUp",rate,3),effect("counter",.75+tier*.08,3)],description:"甲殻を戦闘形態へ変え、受けた攻撃へ反撃する。"}],
  goblin:["戦利品崩し",{type:"attack",power:1.02+tier*.04,tag:"解除",dispelEnemyBuff:true,description:"敵が蓄えた強化をひとつ見抜いて奪い取る。"}],
  plant:["根脈循環",{type:"buff",target:"味方全体",tag:"再生",power:0,effects:[effect("regen",.07+tier*.008,3,{allies:true})],description:"根を仲間へつなぎ、全体を継続回復する。"}],
  undead:["冥命返還",{type:"attack",power:0,tag:"自決",selfSacrificeHpDamage:1,guaranteedHit:true,description:"自決し、発動時の現在HPと同量を敵単体へ与える。"}],
  demon:["魔血転炉",{type:"buff",target:"自分",tag:"攻撃変換",power:0,effects:[effect("magicToPhysical",1,3)],description:"魔法ATKを0にし、その値を物理ATKへ加算する。"}],
  elemental:["精素循環",{type:"mpHeal",target:"味方全体",tag:"MP回復",power:0,mpHeal:.12+tier*.012,description:"周囲の精素を巡らせ、味方全体のMPを回復する。"}],
  golem:["不動の肩代わり",{type:"stance",target:"自分",tag:"かばう",power:0,effects:[effect("taunt",0,2),effect("guard",.30+tier*.025,2)],description:"敵の攻撃を引き受け、受けるダメージを軽減する。"}],
  dragon:["竜圧咆哮",{type:"attack",power:.96+tier*.05,allEnemies:true,target:"敵全体",tag:"全体弱体",effects:[effect("atkDown",rate,3,{enemy:true})],description:"竜圧を全敵へ浴びせ、攻撃力を下げる。"}],
  spirit:["霊体偏移",{type:"stance",target:"自分",tag:"回避転換",power:0,effects:[effect("spdDown",.15+tier*.01,3),effect("evasionUp",.27+tier*.022,3)],description:"動きを遅らせて実体を薄め、回避率を上げる。"}],
  construct:["動力転換",{type:"buff",target:"自分",tag:"攻撃変換",power:0,effects:[effect("magicToPhysical",1,3)],description:"魔法出力を停止し、同量を物理ATKへ転送する。"}],
  reptile:["脱皮再生",{type:"selfHeal",target:"自分",tag:"回復・浄化",power:0,heal:.18+tier*.018,cleanse:true,description:"古い皮と状態異常を脱ぎ捨て、HPを回復する。"}],
  human:["戦術指揮",{type:"buff",target:"味方全体",tag:"全体支援",power:0,effects:[effect("atkUp",rate,3,{allies:true}),effect("defUp",rate*.8,3,{allies:true})],description:"状況判断を共有し、味方全体の攻防を高める。"}]
 };
 const [name,data]=defs[race]??defs.spirit;return baseSkill(species,1,name,data);
}
function roleTechnique(species,seed,tier){
 const role=species.role??"balanced",r=.18+tier*.018+(seed%7)*.006;
 const builders={
  tank:()=>["守護陣",{type:"stance",power:0,target:"自分",tag:"肩代わり",effects:[effect("taunt",0,2),effect("guard",.34+tier*.025,2)],partyShieldRate:.05+tier*.008,description:"味方をかばいながら全体へ小さな障壁を張る。"}],
  controller:()=>["術式断ち",{power:.82+tier*.04,tag:"魔法陣破壊",removeEnemyMagicCircle:true,effects:[effect("spdDown",r,3,{enemy:true})],description:"敵の魔法陣をひとつランダムに消し、速度も奪う。"}],
  support:()=>["共鳴鼓舞",{type:"buff",power:0,target:"味方全体",tag:"全体支援",effects:[effect("atkUp",r,3,{allies:true}),effect("evasionUp",r*.65,3,{allies:true})],description:"味方全体の攻撃と回避を支援する。"}],
  burst:()=>["一点崩壊",{power:1.48+tier*.09,tag:"高火力",critBonus:.16+tier*.015,cooldown:2,description:"一点へ力を収束する高会心の大技。"}],
  bruiser:()=>["耐命強襲",{type:"drain",power:1.16+tier*.065,tag:"吸収",drain:.22+tier*.025,effects:[effect("guard",.12+tier*.012,2)],description:"攻めながら生命を奪い、反撃にも備える。"}],
  magic:()=>["広域術式",{power:.82+tier*.055,allEnemies:true,target:"敵全体",tag:"全体魔法",damageClass:"magic",description:"固有術式を展開し、敵全体を攻撃する。"}],
  speed:()=>["静速見切り",{type:"stance",power:0,target:"自分",tag:"回避転換",effects:[effect("spdDown",.22,2),effect("evasionUp",.34+tier*.02,2),effect("accuracyUp",r,2)],description:"速度をあえて落とし、回避と命中へ集中する。"}],
  balanced:()=>["均衡転陣",{type:"buff",power:0,target:"自分",tag:"万能強化",effects:[effect("atkUp",r,3),effect("defUp",r,3),effect("spdUp",r*.55,3)],description:"攻防速の均衡を整える。"}],
  assassin:()=>["影縫い",{power:1.10+tier*.055,tag:"処刑",execute:.22+tier*.018,critBonus:.18,description:"瀕死の敵へ威力が跳ね上がる暗殺技。"}],
  healer:()=>["命脈治癒",{type:"allHeal",power:0,target:"味方全体",tag:"全体回復",heal:.16+tier*.018,description:"味方全体の生命力を回復する。"}],
  debuffer:()=>["強化解呪",{power:.86+tier*.045,tag:"解除・弱体",dispelEnemyBuff:true,effects:[effect("defDown",r,3,{enemy:true})],description:"敵の強化をひとつ消し、防御も下げる。"}],
  poison:()=>["侵蝕胞子",{power:.92+tier*.04,tag:"継続ダメージ",status:{id:"poison",name:"猛毒",chance:.68+tier*.025,turns:4,power:.04+tier*.004},description:"長く残る毒を植え付ける。"}],
  burner:()=>["灼熱連鎖",{power:.94+tier*.05,allEnemies:true,target:"敵全体",tag:"炎上",status:{id:"burn",name:"炎上",chance:.60+tier*.025,turns:3,power:.04+tier*.004},description:"炎を連鎖させ敵全体を炎上させる。"}],
  critical:()=>["確断",{power:1.24+tier*.065,tag:"会心",critBonus:.30+tier*.02,description:"急所だけを狙う研ぎ澄まされた一撃。"}],
  drain:()=>["魂脈吸収",{type:"drain",power:1.10+tier*.055,tag:"吸収",drain:.38+tier*.035,description:"与えたダメージを生命へ変える。"}],
  ambush:()=>["潜影奇襲",{power:1.20+tier*.06,tag:"奇襲",critBonus:.22,guaranteedHit:true,effects:[effect("evasionUp",r,2)],description:"必中の奇襲後、身を隠して回避を上げる。"}],
  counter:()=>["迎撃陣",{type:"stance",power:0,target:"自分",tag:"反撃",effects:[effect("guard",.24+tier*.02,3),effect("counter",1.0+tier*.1,3)],description:"守りながら強い反撃を返す。"}],
  ranged:()=>["遠見射線",{power:1.08+tier*.05,tag:"必中",guaranteedHit:true,effects:[effect("accuracyUp",r,3)],description:"距離を測り、回避を許さない一射を放つ。"}]
 };
 const [name,data]=(builders[role]??builders.balanced)();return baseSkill(species,2,name,data);
}
function elementalTechnique(species,seed,tier,element){
 const attack=1.12+tier*.06+(seed%9)*.008,status={...element.status,chance:Math.min(.95,element.status.chance+tier*.025),power:(element.status.power??0)+tier*.002};
 return baseSkill(species,3,`${element.noun}共鳴`,{power:attack,hits:seed%3===0?2:1,tag:`${element.label}・状態`,status,description:`${element.label}属性を深く共鳴させ、固有の状態変化を狙う。`});
}
function advancedTechnique(species,index,seed,tier){
 const selector=(seed+index*3)%7,role=species.role??"balanced";
 if(selector===0)return baseSkill(species,index,"陣喰らい",{power:.88+tier*.05,tag:"魔法陣破壊",removeEnemyMagicCircle:true,description:"敵側の魔法陣をひとつランダムに破壊する。"});
 if(selector===1)return baseSkill(species,index,"無強帰し",{power:1.02+tier*.05,tag:"強化解除",dispelEnemyBuff:true,description:"敵の強化効果をひとつランダムに消す。"});
 if(selector===2){
  if(["undead","demon"].includes(species.race))return baseSkill(species,index,"命滅返し",{power:0,tag:"自決",selfSacrificeHpDamage:1,guaranteedHit:true,description:"自決し、その時点のHPと同量を敵単体へ与える。"});
  return baseSkill(species,index,"命脈収束",{type:"selfHeal",power:0,target:"自分",tag:"自己回復",heal:.18+tier*.018,effects:[effect("defUp",.14+tier*.012,2)],description:"生命力を収束し、自身を回復して防御を上げる。"});
 }
 if(selector===3){
  if(["construct","golem","demon"].includes(species.race))return baseSkill(species,index,"零魔換装",{type:"buff",power:0,target:"自分",tag:"攻撃変換",effects:[effect("magicToPhysical",1,4)],description:"魔法ATKを0にし、その全量を物理ATKへ上乗せする。"});
  return baseSkill(species,index,"攻勢転換",{type:"buff",power:0,target:"自分",tag:"攻撃特化",effects:[effect("atkUp",.25+tier*.02,3),effect("vulnerable",.12,3)],description:"守りを削る代わりに攻撃力を高める。"});
 }
 if(selector===4){
  if(["healer","support"].includes(role)&&tier>=2)return baseSkill(species,index,"帰命灯",{type:"revive",power:0,target:"味方単体",tag:"蘇生",revive:.28+tier*.025,reviveMp:.12,description:"戦闘不能の味方1体を蘇生する。"});
  return baseSkill(species,index,"再起律",{type:"mpHeal",power:0,target:"味方全体",tag:"MP回復",mpHeal:.12+tier*.012,description:"味方全体へ再行動のための魔力を渡す。"});
 }
 if(selector===5){
  if(TANK_ROLES.has(role))return baseSkill(species,index,"代受王域",{type:"stance",power:0,target:"自分",tag:"肩代わり",effects:[effect("taunt",0,3),effect("guard",.38+tier*.025,3),effect("counter",.8+tier*.08,3)],partyShieldRate:.07+tier*.009,description:"攻撃を肩代わりし、軽減・反撃・全体障壁を同時に展開する。"});
  return baseSkill(species,index,"護陣波",{type:"buff",power:0,target:"味方全体",tag:"全体防護",partyShieldRate:.06+tier*.009,effects:[effect("defUp",.17+tier*.015,3,{allies:true})],description:"味方全体へ障壁と防御上昇を与える。"});
 }
 if(selector===6)return baseSkill(species,index,"緩急幻歩",{type:"stance",power:0,target:"自分",tag:"速度交換",effects:[effect("spdDown",.25,3),effect("evasionUp",.38+tier*.02,3)],description:"SPDを下げる代わりに回避率を大幅に上げる。"});
 return baseSkill(species,index,"逆境循環",{type:"buff",power:0,target:"味方全体",tag:"支援",heal:.08+tier*.008,effects:[effect("defUp",.16+tier*.018,3,{allies:true}),effect("regen",.04+tier*.005,3,{allies:true})],description:"味方全体を小回復し、防御と再生を与える。"});
}
function ultimateTechnique(species,index,seed,tier,element){
 const support=["healer","support"].includes(species.role),role=species.role??"balanced",all=seed%3===0;
 if(support)return baseSkill(species,index,`${element.noun}大救界`,{type:"allHeal",power:0,target:"味方全体",tag:"奥義・救済",heal:.34+tier*.035,cleanse:true,revive:tier>=4?.22+tier*.015:0,effects:[effect("guard",.16+tier*.018,2,{allies:true})],description:"全体回復・浄化・防護を束ねた救済奥義。"});
 if(role==="tank")return baseSkill(species,index,`${element.noun}守護王`,{type:"stance",power:0,target:"自分",tag:"奥義・守護",heal:.24+tier*.025,partyShieldRate:.10+tier*.012,effects:[effect("taunt",0,3),effect("guard",.44+tier*.025,3),effect("counter",1.15+tier*.12,3)],description:"傷を癒やし、全攻撃を肩代わりする守護奥義。"});
 if(role==="counter")return baseSkill(species,index,`${element.noun}報復界`,{type:"stance",power:0,target:"自分",tag:"奥義・反撃",effects:[effect("guard",.28+tier*.02,3),effect("counter",1.55+tier*.14,3)],description:"被害を抑えながら、強烈な反撃で攻勢へ転じる。"});
 if(role==="bruiser")return baseSkill(species,index,`${element.noun}喰命撃`,{type:"drain",power:1.62+tier*.15,drain:.48+tier*.035,target:"敵単体",tag:"奥義・吸収",effects:[effect("guard",.18+tier*.015,2)],description:"敵の生命を奪い、攻めながら戦線を維持する。"});
 return baseSkill(species,index,`${element.noun}終式`,{power:1.72+tier*.17+(seed%11)*.012,allEnemies:all,target:all?"敵全体":"敵単体",tag:"奥義",defenseIgnore:.10+tier*.035,critBonus:.12+tier*.018,cooldown:4,description:`${species.name}が研ぎ澄ました固有の最終攻撃。`});
}

function authoredTechnique(species,index,source,generated){
 const legacyId=source?.id;
 return{...generated,...source,id:`${species.id}__identity_${index+1}`,name:source?.name??generated.name,authoredSource:true,authoredUnlock:source?.unlock?{...source.unlock}:null,legacySkillIds:legacyId?[legacyId]:[],unlock:source?.unlock?{...source.unlock}:generated.unlock,effects:Array.isArray(source?.effects)?source.effects.map(effect=>({...effect})):generated.effects,status:source?.status?{...source.status}:generated.status};
}
export function buildIndividualSkillKit(species,{legacySkill=null,authoredSkills=null}={}){
 const rarity=species.rarity??"N",tier=RARITY_INDEX[rarity]??0,count=SKILL_COUNTS[rarity]??4,seed=hash(species.id),element=ELEMENT[species.element]??ELEMENT.neutral;
 const skills=[openingAttack(species,seed,tier,element),raceTechnique(species,seed,tier),roleTechnique(species,seed,tier),elementalTechnique(species,seed,tier,element)];
 while(skills.length<count-1)skills.push(advancedTechnique(species,skills.length,seed,tier));
 if(skills.length<count)skills.push(ultimateTechnique(species,skills.length,seed,tier,element));
 const authored=Array.isArray(authoredSkills)&&authoredSkills.length?authoredSkills:legacySkill?[legacySkill]:[];
 for(let index=0;index<Math.min(authored.length,skills.length);index++)skills[index]=authoredTechnique(species,index,authored[index],skills[index]);
 const offensive=skills.filter(isOffensiveSkill).length;
 if(offensive<2){
  const replaceIndex=skills.findIndex((skill,index)=>index>0&&!skill.authoredSource&&!isOffensiveSkill(skill));
  if(replaceIndex>=0)skills[replaceIndex]=baseSkill(species,replaceIndex,`${element.noun}応戦`,{power:1.08+tier*.045+replaceIndex*.08,tag:`${element.label}・応戦`,description:"支援だけに偏らず、自ら戦線を支える固有攻撃。"});
 }
 return skills.slice(0,count).map((skill,index)=>({...skill,unlock:skill.authoredUnlock??{type:"level",value:(UNLOCKS[rarity]??UNLOCKS.N)[index]??1}}));
}

export function expectedSkillCount(rarity){return SKILL_COUNTS[rarity]??4}
