import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{MYTHIC_SERIAL_SPECIES}from"../src/data/mythicSerialSpecies.js";
import{HERO_RESONANCE_IDS,HERO_RESONANCE_FOLLOWUP_POWER,HERO_INVINCIBLE_PRESSURE,heroPersonalPressure,heroResonanceProfile,scaleHeroResonanceSkill}from"../src/core/HeroResonanceSystem.js";

const alive=count=>HERO_RESONANCE_IDS.slice(0,count).map((speciesId,index)=>({id:`h${index}`,speciesId,currentHp:1}));

test("四勇者は全員が神話ランク",()=>{for(const id of HERO_RESONANCE_IDS){assert.equal(MYTHIC_SERIAL_SPECIES[id].rarity,"神話");assert.equal(MYTHIC_SERIAL_SPECIES[id].rankNames.some(name=>name.includes("LR")),false)}});

test("生存人数nに対して1ラウンド最大n²回発動",()=>{for(const count of[1,2,3,4]){const profile=heroResonanceProfile(alive(count));assert.equal(profile.totalActions,count*count);assert.equal(profile.followupsPerAction,count-1)}assert.equal(heroResonanceProfile(alive(4)).invincible,true);assert.equal(heroResonanceProfile(alive(3)).invincible,false)});

test("同一勇者の重複は共鳴人数に数えない",()=>{assert.equal(heroResonanceProfile([...alive(2),{speciesId:HERO_RESONANCE_IDS[0],currentHp:99}]).count,2)});

test("追撃はMP無料・威力70%で元スキルを破壊しない",()=>{const original={id:"x",mp:40,power:3,heal:.4,cooldown:5,effects:[{kind:"defDown",value:.2}]},scaled=scaleHeroResonanceSkill(original);assert.equal(HERO_RESONANCE_FOLLOWUP_POWER,.7);assert.equal(scaled.mp,0);assert.ok(Math.abs(scaled.power-2.1)<1e-12);assert.ok(Math.abs(scaled.heal-.28)<1e-12);assert.ok(Math.abs(scaled.effects[0].value-.14)<1e-12);assert.equal(scaled.cooldown,5);assert.equal(original.mp,40)});

test("個人圧と四人無敵圧を保持",()=>{assert.deepEqual(heroPersonalPressure("myth_enami",4).map(row=>row.kind),["defDown","vulnerable"]);assert.deepEqual(heroPersonalPressure("myth_yori",4).map(row=>row.kind),["atkDown","spdDown"]);assert.deepEqual(heroPersonalPressure("myth_hide",4).map(row=>row.kind),["accuracyDown","evasionDown"]);assert.deepEqual(heroPersonalPressure("myth_rion",4).map(row=>row.kind),["healDown","mpRecoveryDown"]);assert.equal(HERO_INVINCIBLE_PRESSURE.effects.find(row=>row.kind==="atkDown").value,.25);assert.equal(HERO_INVINCIBLE_PRESSURE.effects.find(row=>row.kind==="healDown").value,.5);assert.equal(HERO_INVINCIBLE_PRESSURE.buffTurnPenalty,1)});

test("オフライン・オンライン・移行処理へ接続済み",async()=>{const[main,room,save,serial,screen,config]=await Promise.all(["../src/main.js","../online-server/src/RoomStore.js","../src/services/SaveService.js","../src/core/SerialCodeSystem.js","../src/ui/screens/BattleScreen.js","../src/core/config.js"].map(path=>readFile(new URL(path,import.meta.url),"utf8")));assert.match(main,/setSkillCooldown\(battle,member\.id,skill\)/);assert.match(main,/scaleHeroResonanceSkill/);assert.match(main,/battle\._invincibleAllianceRunning/);assert.match(room,/_triggerHeroResonance/);assert.match(room,/resonanceFollowup:true/);assert.match(save,/from<77/);assert.match(save,/summonRarity="神話"/);assert.match(serial,/神話限定/);assert.match(screen,/最大\$\{heroResonance\.totalActions\}回発動/);assert.match(config,/SAVE_SCHEMA_VERSION=77/)});
