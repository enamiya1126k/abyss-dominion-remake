// Build408: shared, synchronous battle primitives. Character traits are not enabled here.
// Adapters must settle damage/last-stand/automatic revival before submitting death events.
// Commit the returned effect plans, HP changes and this state in ONE battle checkpoint.
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const number = (v, fallback = 0) => Number.isFinite(Number(v)) ? Number(v) : fallback;
const clamp = (v, min, max) => Math.max(min, Math.min(max, number(v, min)));
const integer = (v, min, max) => Math.floor(clamp(v, min, max));
const validId = v => typeof v === 'string' && v.length > 0 && v.length <= 160;
const validSide = s => s === 'ally' || s === 'enemy';
const keyOf = (...parts) => JSON.stringify(parts);
const LIMITS = Object.freeze({receipts:4096, quotas:512, deaths:256, meters:128, sleepers:32});
const maps = Object.keys(LIMITS);

export function createAbilityState408(raw = null) {
 const state = {version:1, saturated:false, receipts:{}, quotas:{}, deaths:{}, meters:{}, sleepers:{}};
 if (!raw || raw.version !== 1) return state;
 state.saturated = raw.saturated === true;
 for (const name of maps) {
  const entries = raw[name] && typeof raw[name] === 'object' && !Array.isArray(raw[name]) ? Object.entries(raw[name]) : [];
  if (entries.length > LIMITS[name]) state.saturated = true;
  for (const [key, value] of entries.slice(0, LIMITS[name])) {
   if (key.length > 1000 || ['__proto__','constructor','prototype'].includes(key)) { state.saturated = true; continue; }
   let result;
   if (name === 'receipts' || name === 'deaths') result = value === true;
   if (name === 'meters') result = integer(value, 0, 100);
   if (name === 'quotas') result = {round:integer(value?.round,0,1e9), roundUses:integer(value?.roundUses,0,1e6), total:integer(value?.total,0,1e6)};
   if (name === 'sleepers') result = {ownerId:validId(value?.ownerId) ? value.ownerId : '', ticks:integer(value?.ticks,0,10), round:integer(value?.round,0,1e9), done:value?.done === true};
   if (result !== false) state[name][key] = result;
  }
 }
 return state;
}

export function snapshotAbilities408(battle) {
 return battle?.chapterTwoAbilities408 ? createAbilityState408(battle.chapterTwoAbilities408) : null;
}

// Legacy twin/counter ledgers keep their exact saved shape and duplicate-species rule.
export function reserveRound408(ledger, key, round) {
 const turn = Math.max(1, Math.floor(Number(round) || 1));
 if (Number(ledger[key]) >= turn) return false;
 ledger[key] = turn;
 return true;
}

function capacity(state, name, key) {
 if (state.saturated) return false;
 if (own(state[name],key) || Object.keys(state[name]).length < LIMITS[name]) return true;
 state.saturated = true; // fail closed; never discard receipts and re-enable a spent ability
 return false;
}

export function claimAbility408(state, {
 side, speciesId, abilityId, eventId, round, source = 'primary', allowedSources = ['primary'],
 perRound = 1, perBattle = 1
}) {
 if (!state || !validSide(side) || ![speciesId,abilityId,eventId].every(validId) || !allowedSources.includes(source)) return false;
 // A generated effect cannot recursively pay itself, even if an adapter accidentally allows it.
 if (['trait','followup','counter','reflection'].includes(source)) return false;
 if (!(number(perRound) > 0 && number(perBattle) > 0)) return false;
 const turn = integer(round,1,1e9), key = keyOf(side,speciesId,abilityId), receipt = keyOf(side,speciesId,abilityId,eventId);
 if (own(state.receipts,receipt) || !capacity(state,'receipts',receipt) || !capacity(state,'quotas',key)) return false;
 const previous = state.quotas[key] ?? {round:turn,roundUses:0,total:0};
 if (turn < previous.round) return false;
 const uses = turn === previous.round ? previous.roundUses : 0;
 if (uses >= perRound || previous.total >= perBattle) return false;
 state.quotas[key] = {round:turn,roundUses:uses+1,total:previous.total+1};
 state.receipts[receipt] = true;
 return true;
}

// Input units are adapter snapshots: {id, speciesId, side, hp, captured, summoned}.
// Initial-roster identity must remain stable across revival and checkpoint restore.
export function confirmedDeaths408(state, units, {settled = false} = {}) {
 if (!settled) return [];
 const result = [];
 for (const unit of [...units].sort((a,b) => keyOf(a.side,a.id).localeCompare(keyOf(b.side,b.id),'en'))) {
  if (!validId(unit.id) || !validSide(unit.side) || unit.captured || unit.summoned || unit.initialRoster !== true || !Number.isFinite(unit.hp) || unit.hp > 0) continue;
  const key = keyOf(unit.side,unit.id);
  if (own(state.deaths,key) || !capacity(state,'deaths',key)) continue;
  state.deaths[key] = true;
  result.push({id:unit.id, speciesId:unit.speciesId, side:unit.side, key});
 }
 return result;
}

export function advanceMeter408(state, context, {threshold = 3, amount = 1} = {}) {
 const key = keyOf(context.side,context.speciesId,context.abilityId);
 if (!capacity(state,'meters',key)) return null;
 if (!claimAbility408(state,context)) return null;
 const target = integer(threshold,1,100), next = (state.meters[key] ?? 0) + integer(amount,1,100);
 const released = next >= target;
 state.meters[key] = released ? 0 : next;
 return {released, charge:state.meters[key], threshold:target};
}

// Ten skipped NATURAL actions; discharge on action 11. Extras and refreshes do not count.
export function hibernationTurn408(state, {side,speciesId,ownerId,round,alive = true,blocked = false,natural = true}) {
 if (!validSide(side) || ![speciesId,ownerId].every(validId)) return {kind:'none'};
 const key = keyOf(side,speciesId,'hibernation'), turn = integer(round,1,1e9);
 let sleep = state.sleepers[key];
 if (sleep && sleep.ownerId !== ownerId) return {kind:'none'};
 if (sleep && !alive) { sleep.done = true; return {kind:'cancelled'}; }
 if (!alive || !natural || blocked || sleep?.done || (sleep && turn <= sleep.round)) return {kind:'none'};
 if (!sleep) {
  if (!capacity(state,'sleepers',key) || !claimAbility408(state,{side,speciesId,abilityId:'hibernation',eventId:`start:${ownerId}`,round:turn})) return {kind:'none'};
  sleep = state.sleepers[key] = {ownerId,ticks:0,round:0,done:false};
 }
 sleep.round = turn;
 if (sleep.ticks === 10) {sleep.done = true; return {kind:'discharge',source:'trait'};}
 sleep.ticks++;
 return {kind:'skip',remaining:10-sleep.ticks};
}

export const DEBUFF_CONVERSIONS408 = Object.freeze({
 atkDown:['atkUp',.12],defDown:['defUp',.12],spdDown:['spdUp',.12],
 accuracyDown:['accuracyUp',.12],evasionDown:['evasionUp',.12],
 vulnerable:['guard',.12],healDown:['regen',.03],mpRecoveryDown:['regen',.03],
 reviveSeal:['guard',.12],curse:['guard',.12],poison:['regen',.03],burn:['regen',.03],bleed:['regen',.03],
 sleep:['spdUp',.12],freeze:['defUp',.12],paralysis:['spdUp',.12],shock:['defUp',.12],
 stun:['guard',.12],charm:['accuracyUp',.12],confusion:['accuracyUp',.12],fear:['atkUp',.12]
});

// Call after enemy-source and hit validation, BEFORE immunity/status insertion or stun mirroring.
// No random roll, no reflection, no ally-inflicted/self-inflicted farming.
export function convertDebuff408(effect, {fromSide,toSide,landed = false} = {}) {
 if (!validSide(fromSide) || !validSide(toSide) || fromSide === toSide || !landed) return null;
 if (effect?.source === 'trait' || effect?.source === 'reflection' || effect?.unconvertible || effect?.ultimate358) return null;
 const kind = String(effect?.id ?? effect?.kind ?? '').replace(/^status:/,'');
 const conversion = DEBUFF_CONVERSIONS408[kind];
 if (!conversion) return null; // CT extension, isolation, MP loss, dispel and cost are not debuffs
 const [buff,value] = conversion;
 return {cancelOriginal:true,effect:{kind:buff,value,turns:2,sourceKey:'trait:reverse-letter',source:'trait',stack:'refresh-maximum'}};
}

// Plans describe terminal HP rules; the adapter must honour shields/invulnerability/rescue.
// Protected targets include all bosses, raid/PvP/online actors, immortals and story actors.
export function terminalDamagePlan408(target, kind, {mode = 'ordinary',attackerPower = 0} = {}) {
 const hp = Math.max(0,number(target?.hp));
 if (!target || hp <= 0 || target.captured || !['deathPact','hibernation'].includes(kind)) return null;
 const protectedTarget = mode !== 'ordinary' || Boolean(target.boss || target.raidBoss || target.storyProtected || target.instantDeathImmune || target.immortal);
 if (!protectedTarget) return {kind:'terminal',targetId:target.id,hpFloor:kind==='hibernation'?1:0,requestedDamage:Math.max(0,hp-(kind==='hibernation'?1:0)),source:'trait',ignoreDefense:true,ignoreBarrier:true,allowRescue:true,canReflect:false};
 const coefficient = kind === 'deathPact' ? 2 : 4;
 return {kind:'damage',targetId:target.id,requestedDamage:Math.max(0,Math.floor(number(attackerPower)*coefficient)),coefficient,source:'trait',ignoreDefense:false,ignoreBarrier:false,allowRescue:true,canReflect:false};
}

export function selectPactTarget408(owner, targets, killerId = null) {
 if (!validSide(owner?.side)) return null;
 const eligible = targets.filter(t => validSide(t.side) && t.side !== owner.side && t.hp > 0 && !t.captured && validId(t.id));
 const killer = eligible.find(t => t.id === killerId);
 return killer ?? eligible.sort((a,b) => number(b.threat)-number(a.threat) || a.id.localeCompare(b.id,'en'))[0] ?? null;
}

export function absorbDeath408(state, owner, death, {round = 1,alive = true} = {}) {
 if (!alive || !death?.key || !validSide(owner?.side) || !validId(owner?.speciesId) || !validId(owner?.id) || !own(state.deaths,death.key) || (owner.id === death.id && owner.side === death.side)) return null;
 const key = keyOf(owner.side,owner.speciesId,'death-absorb');
 if (!capacity(state,'meters',key)) return null;
 if (!claimAbility408(state,{side:owner.side,speciesId:owner.speciesId,abilityId:'death-absorb',eventId:`death:${death.side}:${death.id}`,round,source:'death',allowedSources:['death'],perRound:3,perBattle:3})) return null;
 const stacks = Math.min(3,(state.meters[key] ?? 0)+1);
 state.meters[key] = stacks;
 return {stacks,multiplier:2**stacks,source:'trait'};
}

// Pure projection from immutable battle-entry stats: .25 -> .5 -> 1 -> 2 at three deaths.
// Speed is not exponentially scaled; HP growth never refills missing HP.
export function deathGrowthStats408(entryStats, stacks, currentHp) {
 const scale = .25 * 2**integer(stacks,0,3), stats = {...entryStats};
 for (const field of ['hp','atk','matk','def','mdef']) stats[field] = Math.max(1,Math.floor(number(entryStats[field],1)*scale));
 stats.spd = Math.max(1,Math.floor(number(entryStats.spd,1)*.8));
 return {stats,currentHp:Math.min(Math.max(0,number(currentHp)),stats.hp),scale};
}

export function deathGrowthStacks408(state, owner) {
 return integer(state?.meters?.[keyOf(owner?.side,owner?.speciesId,'death-absorb')],0,3);
}

// Use unmodified calculated stats as input, never this function's previous result.
// fixedMaxHp is also reapplied after later HP modifiers by the final-stat adapter.
export function traitStats408(calculated, definition) {
 const stats = {...calculated};
 for (const field of ['hp','atk','matk','def','mdef','spd']) {
  const factor = clamp(definition?.entryMultipliers?.[field] ?? 1,0,10);
  stats[field] = Math.max(1,Math.floor(number(calculated?.[field],1)*factor));
 }
 if (number(definition?.fixedMaxHp) > 0) stats.hp = Math.max(1,Math.floor(number(definition.fixedMaxHp)));
 return stats;
}

// One named source, max replacement (never additive), final entry max HP fixed before buffs.
export function paperShield408(maxHp) {
 const cap = Math.max(0,Math.floor(number(maxHp)*.08));
 return {amount:cap,turns:2,sourceKey:'trait:paper-shield',stack:'refresh-maximum'};
}

// Pure transaction shell. Reducers may mutate ONLY the supplied state and return data plans.
// No async HP effects: the caller commits state and all plans atomically before checkpointing.
// Nested reactions belong in the next explicit batch; generated effects must not become primaries.
export function reduceAbilityBatch408(previous, events, reducer) {
 if (!Array.isArray(events) || events.length > 32) return {ok:false,reason:'event-budget'};
 const state = createAbilityState408(previous), plans = [];
 for (const event of events) {
  if (!validId(event?.id)) return {ok:false,reason:'invalid-event'};
  const receipt = keyOf('batch-event',event.id);
  if (own(state.receipts,receipt)) continue;
  if (!capacity(state,'receipts',receipt)) return {ok:false,reason:'state-budget'};
  state.receipts[receipt] = true;
  const result = reducer(state,event);
  if (!Array.isArray(result)) return {ok:false,reason:'synchronous-plans-required'};
  plans.push(...result);
  if (plans.length > 128) return {ok:false,reason:'plan-budget'};
 }
 return {ok:true,state,plans};
}
