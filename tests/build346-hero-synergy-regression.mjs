import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{MYTHIC_SERIAL_SPECIES}from"../src/data/mythicSerialSpecies.js";
import{CAMPAIGN_HERO_FINAL_LEVEL,CAMPAIGN_HERO_ENCOUNTER_SCHEDULE,CAMPAIGN_HERO_STAT_MULTIPLIER,CAMPAIGN_HERO_HP_MULTIPLIER}from"../src/core/CampaignHeroEncounterSystem.js";
import{HERO_RESONANCE_FOLLOWUP_POWER,heroResonanceProfile}from"../src/core/HeroResonanceSystem.js";
import{ENEMY_ACTIONS,chooseEnemyAction}from"../src/battle/EnemyAI.js";

const skillIds={
 myth_enami:["enami_world_create","enami_spicy_casino","enami_hyper_focus","enami_genesis"],
 myth_rion:["rion_talk","rion_arrange","rion_therapy","rion_community"],
 myth_yori:["yori_rifle","yori_beautiful","yori_tetrapod","yori_difficult"],
 myth_hide:["hide_crayfish","hide_hunt","hide_gourmet","hide_master_claw"]
};
const hero=(id,extra={})=>({speciesId:id,campaignHeroId:id,hp:100,maxHp:100,currentMp:999,maxMp:999,boss:true,combatRarity:"神話",level:1000,role:"support",...extra});
const player=(id="p1",extra={})=>({id,currentHp:100,maxHp:100,currentMp:100,maxMp:100,...extra});

test("勇者一行はLv1000・既存ボス補正を維持",()=>{
 assert.equal(CAMPAIGN_HERO_FINAL_LEVEL,1000);
 assert.ok(CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.every(row=>row.fixedLevel===1000));
 assert.equal(CAMPAIGN_HERO_STAT_MULTIPLIER,1.30);
 assert.equal(CAMPAIGN_HERO_HP_MULTIPLIER,1.45);
});

test("既存セーブ互換のため16スキルIDを維持",()=>{
 for(const[id,ids]of Object.entries(skillIds))assert.deepEqual(MYTHIC_SERIAL_SPECIES[id].authoredSkills.map(skill=>skill.id),ids);
});

test("4人のスキルが弱体・加速・増幅・決定打で噛み合う",()=>{
 const enami=MYTHIC_SERIAL_SPECIES.myth_enami.authoredSkills,rion=MYTHIC_SERIAL_SPECIES.myth_rion.authoredSkills,yori=MYTHIC_SERIAL_SPECIES.myth_yori.authoredSkills,hide=MYTHIC_SERIAL_SPECIES.myth_hide.authoredSkills;
 assert.ok(enami.some(skill=>skill.effects?.some(effect=>effect.kind==="vulnerable")));
 assert.ok(rion.some(skill=>skill.effects?.some(effect=>effect.kind==="spdUp"))&&rion.some(skill=>skill.effects?.some(effect=>effect.kind==="spdDown")));
 assert.ok(yori.some(skill=>["defDown","vulnerable"].includes(skill.bonusVsEffect?.kind)));
 assert.equal(MYTHIC_SERIAL_SPECIES.myth_hide.role,"magic");
 assert.ok(hide.some(skill=>skill.damageClass==="magic"&&skill.bonusVsEffect?.kind==="defDown"));
});

test("既存の双星・三位・無敵共鳴を変更しない",()=>{
 assert.equal(HERO_RESONANCE_FOLLOWUP_POWER,.70);
 assert.equal(heroResonanceProfile(2).totalActions,4);
 assert.equal(heroResonanceProfile(3).totalActions,9);
 assert.equal(heroResonanceProfile(4).totalActions,16);
 assert.equal(heroResonanceProfile(4).invincible,true);
});

test("勇者敵AIは本人の固有スキルを使用する",()=>{
 const rion=hero("myth_rion"),fallen=hero("myth_enami",{hp:0,currentMp:0});
 assert.equal(chooseEnemyAction(rion,{allies:[rion,fallen],opponents:[player()],battle:{turn:2}}),"campaignHero:rion_community");
});

test("勇者敵側は装備・魔法陣を追加しない",async()=>{
 const main=await readFile(new URL("../src/main.js",import.meta.url),"utf8");
 assert.match(main,/fixedLevel\?\?1000/);
 assert.match(main,/equipped:false,enemyGear:\[\],enemyMagicCircle:null/);
});

test("編成は旧装備6枠を残し魔法陣だけ小型化",async()=>{
 const[css,formation]=await Promise.all(["../src/Styles/build345-balance-ui.css","../src/ui/screens/FormationScreen.js"].map(path=>readFile(new URL(path,import.meta.url),"utf8")));
 assert.doesNotMatch(css,/\.formation-screen \.formation-gear-grid/);
 assert.doesNotMatch(css,/\.formation-screen \.formation-gear-slot/);
 assert.match(css,/\.formation-screen \.formation-circle-card\{[\s\S]*?width:46px/);
 assert.match(formation,/装備6枠/);
 assert.match(formation,/formation-gear-grid/);
});
