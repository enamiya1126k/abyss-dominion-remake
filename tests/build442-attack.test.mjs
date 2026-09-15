import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import vm from'node:vm';
import*as circles from'../src/core/MagicCircleSystem.js';
const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const names=source.match(/import\{([^}]+)\}from["']\.\/core\/MagicCircleSystem\.js[^"']*["']/)[1].split(',');
const bindings=Object.fromEntries(names.map(name=>[name.trim(),circles[name.trim()]]));
const code=source.slice(source.indexOf('async function animateAttack('),source.indexOf('async function animateHit('));
for(const id of ['none','ch2_chain394','ch2_dream394','ch2_pair394','ch2_guard394','ch2_crown394','ch2_prism398','ch2_hex398','ch2_reserve398','aegis'])for(const skill of [false,{element:'ice',damageClass:'magic',equipmentGranted:true}])test(`real attack animation: ${id} / ${skill?'skill':'normal'}`,async()=>{
 let result,frames=[];const actor={id:'actor',speciesId:'slime',attribute:'water',magicCircleId:id};
 const el={classList:{remove(){},add(){}},offsetWidth:0};
 const c={...bindings,battle:{party:[actor],enemies:[]},SPECIES:{},setBattleAction441:(b,value)=>result=value,isEndgameUltimate:()=>false,battleSpeed:()=>1,battleTarget:()=>el,audio:{sfx(){}},setMonsterVisualFrame:(e,frame)=>frames.push(frame),wait:async()=>{}};
 vm.createContext(c);vm.runInContext(code,c);await c.animateAttack(actor.id,skill);
 assert.equal(result.circle,id==='none'?null:circles.magicCircleById(id).asset);assert.deepEqual(frames,['attack','idle']);assert.equal(result.element,skill?'ice':'water');
});
