export const FORMATION_BONUSES={
 beast_pack:{name:"獣群",test:p=>p.filter(x=>x.race==="beast").length>=3,effect:{atk:.08,spd:.08}},
 dragon_blood:{name:"竜脈",test:p=>p.filter(x=>x.race==="dragon").length>=2,effect:{hp:.10,atk:.10}},
 mixed_legion:{name:"混成軍",test:p=>new Set(p.map(x=>x.race)).size>=4,effect:{def:.08,crit:5}}
};
export function calculateFormationBonuses(party=[]){return Object.entries(FORMATION_BONUSES).filter(([,b])=>b.test(party)).map(([id,b])=>({id,...b}))}
