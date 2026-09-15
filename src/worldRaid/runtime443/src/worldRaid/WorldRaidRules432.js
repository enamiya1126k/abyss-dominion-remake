// Frozen rules for newly issued version-2 tickets. Version-1 keeps runtime430.
export const RAID_CIRCLES432=Object.freeze({
 'abyss-amalga':Object.freeze({id:'reincarnation',name:'輪廻の魔法陣',effect:'revive',asset:'./assets/magic-circles/reincarnation.png',reviveHpRate:.70}),
 'zero-sovereign':Object.freeze({id:'raid_zero_sovereign',name:'零界凍結陣',effect:'shield',asset:'./assets/magic-circles/raid-zero-sovereign.png',shieldRate:1}),
 'vajra-beast':Object.freeze({id:'raid_vajra_beast',name:'天雷轟界陣',effect:'rage',asset:'./assets/magic-circles/raid-vajra-beast.png',damagePerHit:.14,maxDamageBonus:1.5,firstChainHits:2,secondChainHits:5})
});
export function sharedCircle432(campaign){
 const id=campaign.bossId??campaign.boss?.id??['abyss-amalga','zero-sovereign','vajra-beast'][(campaign.sequence-1)%3],def=RAID_CIRCLES432[id];
 const maxShield=def.effect==='shield'?Math.floor(campaign.maxHp*def.shieldRate):0;
 return {...{id:def.id,shield:maxShield,maxShield,reviveUsed:false},...campaign.circle432};
}
export function equipRaidBoss432(raid,campaign){
 const boss=raid.boss,def=RAID_CIRCLES432[boss.id];if(!def)return;
 raid.rules432=2;raid.damage432??=0;raid.performance432??={};raid.progress.contribution=raid.contribution;
 for(const actor of Object.values(raid.players)){actor.worldRaidActor432=true;actor.battleStats={...actor.stats};}
 raid.circle432={...sharedCircle432(campaign),hits:raid.circle432?.hits??0};
 Object.assign(boss,{circleId:def.id,circleEffect:def.effect,magicCircle:def.name,magicCircleName:def.name,magicCircleLevel:1,circleLevel:1,magicCircleAsset:def.asset,shield:raid.circle432.shield,maxShield:raid.circle432.maxShield});
 raid.weeklyBoss={...raid.weeklyBoss,circleId:def.id,circleName:def.name};
 for(const child of raid.minions){Object.assign(child,{circleId:'none',circleEffect:'none',magicCircle:null,magicCircleName:null,magicCircleAsset:null,magicCircleLevel:0,level:100});}
}
const blank=()=>({damage:0,taken:0,healing:0,revives:0,kills:0});
export function snapshotExtras432(raid){return raid?.rules432?{worldRaid428:structuredClone(raid.worldRaid428),rules432:raid.rules432,damage432:raid.damage432,performance432:structuredClone(raid.performance432??{}),circle432:structuredClone(raid.circle432)}:{};}
export function withWorldRaidRules432(Base,snapshot,{maxRounds=10}={}){
 return class extends Base{
  create(session,campaign,id){const r=super.create(session,campaign,id);if(r.ok)equipRaidBoss432(r.room.raid,campaign);return r;}
  _withRules432(room,fn){
   const raid=room?.raid;if(!raid?.rules432||this.processing432)return fn();
   this.processing432=true;const boss=raid.boss,def=RAID_CIRCLES432[boss.id],circle=raid.circle432,send=this.broadcast,messages=[],extra=[];
   let hp=boss.hp;this.broadcast=(r,m)=>messages.push([r,m]);
   Object.defineProperty(boss,'hp',{enumerable:true,configurable:true,get:()=>hp,set:value=>{
    const next=Math.max(0,Number(value)||0);if(next>=hp){hp=next;return;}
    const raw=hp-next,absorbed=Math.min(circle.shield??0,raw);circle.shield=Math.max(0,(circle.shield??0)-absorbed);boss.shield=circle.shield;
    hp=Math.max(0,hp-(raw-absorbed));raid.damage432+=raw;
    if(def.effect==='rage')circle.hits++;
    if(absorbed)extra.push({kind:'shieldAbsorb',actorId:this.actor432,targetId:boss.id,targetKind:'boss',value:absorbed,label:def.name});
   }});
   try{
    const result=fn();
    if(hp===0&&def.effect==='revive'&&!circle.reviveUsed){
     circle.reviveUsed=true;hp=Math.max(1,Math.floor(boss.maxHp*def.reviveHpRate));raid.progress.hp=hp;
     const survivors=Object.values(raid.players).some(p=>p.hp>0);raid.outcome=survivors?(raid.round>=maxRounds?'limit':null):'defeat';raid.phase='result';room.phase='raid';
     raid.nextRoundAt=Math.max(raid.nextRoundAt??0,this.now()+1600/(raid.speed||1));
     extra.push({kind:'revive',actorId:boss.id,targetId:boss.id,targetKind:'boss',value:hp,label:def.name,message:'ボスがHP70%で復活。復活はこのボスにつき1回。'});
    }
    raid.lastEvents=[...(raid.lastEvents??[]),...extra].slice(-48);
    return result;
   }finally{
    Object.defineProperty(boss,'hp',{enumerable:true,configurable:true,writable:true,value:hp});this.broadcast=send;this.processing432=false;
    for(const [r,m] of messages){const events=[...(m.events??[]),...extra];send(r,{...m,raid:{...snapshot(raid),...snapshotExtras432(raid)},...(events.length?{events}:{})});}
   }
  }
  action(room,...args){return this._withRules432(room,()=>super.action(room,...args));}
  setAuto(room,...args){return this._withRules432(room,()=>super.setAuto(room,...args));}
  advance(room,...args){return this._withRules432(room,()=>super.advance(room,...args));}
  _resolvePlayer(room,raid,actor,action,session,events){
   if(!raid.rules432)return super._resolvePlayer(room,raid,actor,action,session,events);
   const row=raid.performance432[actor.playerId]??=blank(),prior=Object.fromEntries(Object.values(raid.players).map(p=>[p.playerId,p.hp])),damage=raid.damage432,foes=[raid.boss,...raid.minions],before=foes.map(e=>e.hp),index=events.length;
   this.actor432=actor.playerId;try{super._resolvePlayer(room,raid,actor,action,session,events);}finally{this.actor432=null;}
   row.damage+=Math.max(0,raid.damage432-damage)+raid.minions.reduce((sum,e,i)=>sum+Math.max(0,before[i+1]-e.hp),0);
   for(const p of Object.values(raid.players)){row.healing+=Math.max(0,p.hp-prior[p.playerId]);if(prior[p.playerId]<=0&&p.hp>0)row.revives++;}
   row.kills+=foes.filter((e,i)=>before[i]>0&&e.hp<=0).length;
   // Healing over several targets is measured from the actual vitals; no UI estimates.
   for(const event of events.slice(index))if(event.kind==='signature'&&event.targetKind==='player'&&event.value>0&&String(event.label).includes('反撃'))row.damage+=event.value;
  }
  _damagePlayer(raid,source,target,value,events,label){
   if(!raid.rules432)return super._damagePlayer(raid,source,target,value,events,label);
   const bossAttack=source===raid.boss,def=RAID_CIRCLES432[raid.boss.id],hits=raid.circle432?.hits??0;
   const extra=bossAttack&&def.effect==='rage'?(hits>=def.secondChainHits?2:hits>=def.firstChainHits?1:0):0;
   const boost=bossAttack&&def.effect==='rage'?1+Math.min(def.maxDamageBonus,hits*def.damagePerHit):1;
   for(let hit=0;hit<=extra&&target.hp>0;hit++){
    const before=events.length;super._damagePlayer(raid,source,target,Math.round(value*boost),events,label);
    // The legacy raid hard-coded a death-mirror phantom for every boss. It is
    // not part of these equipped circles; undo that legacy-only side effect.
    const phantoms=events.slice(before).filter(e=>e.kind==='deathMirrorPhantom');
    for(const e of phantoms){const p=raid.players[e.targetId];if(p){p.hp=Math.min(p.maxHp,p.hp+Math.max(0,e.value??0));const owner=p.ownerPlayerId??p.playerId;if(raid.contribution[owner])raid.contribution[owner].taken=Math.max(0,(raid.contribution[owner].taken??0)-(e.value??0));}}
    for(let i=events.length-1;i>=before;i--)if(events[i].kind==='deathMirrorPhantom'||events[i].kind==='ko'&&events[i].label==='幻影捕食')events.splice(i,1);
    for(const e of events.slice(before))if(['enemyDamage','deathMirrorPhantom'].includes(e.kind)&&e.targetId){const row=raid.performance432[e.targetId]??=blank();row.taken+=Math.max(0,e.value??0);}
   }
  }
 };
}
// Apply replayed damage to one shared campaign, including one shared shield/revival.
export function applySharedImpact432(c,damage){
 c.circle432??=sharedCircle432(c);const circle=c.circle432,def=RAID_CIRCLES432[c.bossId];let left=Math.max(0,Math.floor(damage)),hpDamage=0;
 const absorbed=Math.min(left,circle.shield);circle.shield-=absorbed;left-=absorbed;
 while(left>0&&c.hp>0){const take=Math.min(c.hp,left);c.hp-=take;left-=take;hpDamage+=take;
  if(c.hp===0&&def.effect==='revive'&&!circle.reviveUsed){circle.reviveUsed=true;c.hp=Math.max(1,Math.floor(c.maxHp*def.reviveHpRate));}
 }
 return {appliedHp:hpDamage,absorbed};
}
