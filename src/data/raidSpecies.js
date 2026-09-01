/* build258: weekly-raid contracts are distinct species, not reskinned field monsters. */
const unlock=value=>Object.freeze({type:"level",value});
const skill=(id,name,options)=>Object.freeze({
 id,name,element:"dark",damageClass:"physical",target:"敵単体",tag:"レイド幼体固有",
 unlock:unlock(1),type:"attack",power:1,mp:3,cooldown:0,description:"",
 ...options
});

export const JUVENILE_AMALGA_SKILLS=Object.freeze([
 skill("juvenile_amalga_melting_claw","幼体融解爪",{
  type:"multiAttack",power:.62,hits:2,
  effects:Object.freeze([Object.freeze({kind:"defDown",value:.12,turns:2,enemy:true})]),
  description:"小さな融解爪で二度まとわりつき、敵の防御を削る。"
 }),
 skill("juvenile_amalga_scatter_swarm","散開・まとわり群",{
  unlock:unlock(20),mp:7,cooldown:1,power:.85,target:"敵全体",allEnemies:true,tag:"レイド幼体固有・妨害",
  effects:Object.freeze([
   Object.freeze({kind:"accuracyDown",value:.18,turns:2,enemy:true}),
   Object.freeze({kind:"spdDown",value:.15,turns:2,enemy:true})
  ]),
  description:"幼体群が戦場へ散開し、全敵の命中と速度を乱す。"
 }),
 skill("juvenile_amalga_rehatch","脱皮再孵化",{
  unlock:unlock(50),mp:9,cooldown:3,type:"selfHeal",power:0,heal:.28,target:"自分",tag:"レイド幼体固有・再孵化",cleanse:true,
  effects:Object.freeze([
   Object.freeze({kind:"evasionUp",value:.30,turns:3}),
   Object.freeze({kind:"regen",value:.08,turns:3})
  ]),
  description:"殻を脱ぎ捨ててHPを28%回復・浄化し、回避と再生を得る。"
 }),
 skill("juvenile_amalga_endless_rush","無尽幼生ラッシュ",{
  unlock:unlock(100),mp:18,cooldown:4,type:"multiAttack",power:.48,hits:4,target:"敵全体",allEnemies:true,tag:"レイド幼体固有・奥義",
  increaseEnemyCooldowns:1,
  // `poison` is the shared offline/online damage-over-time contract.  The
  // player-facing name stays unique to the juvenile while every battle mode
  // can actually resolve the damage ticks.
  status:Object.freeze({id:"poison",name:"融骸侵食",chance:.55,turns:3,power:.035}),
  description:"何度も湧く幼体群が全敵へ四連突撃し、侵食と固有技遅延を残す。"
 })
]);

const juvenileAmalga=Object.freeze({
 id:"juvenile_amalga",name:"融骸幼体アマルガ",emoji:"🐲",element:"dark",race:"dragon",role:"speed",rarity:"神話",
 minFloor:1,fieldEncounter:false,captureRate:0,gachaExcluded:true,maxMp:80,
 acquisition:Object.freeze(["週間レイド・核片交換"]),
 growth:Object.freeze({hp:1,atk:1,def:1,spd:1}),
 baseStats:Object.freeze({hp:205,atk:158,def:82,spd:118,crit:20,evasion:28,accuracy:120}),
 rankNames:Object.freeze(["融骸幼体アマルガ","融骸群体アマルガ","融骸幼王アマルガ","無尽融骸アマルガ"]),
 skills:JUVENILE_AMALGA_SKILLS,
 authoredSkills:JUVENILE_AMALGA_SKILLS
});

export const RAID_SPECIES=Object.freeze({juvenile_amalga:juvenileAmalga});
