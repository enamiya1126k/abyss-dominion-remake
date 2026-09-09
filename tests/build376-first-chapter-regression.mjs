import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';
import {SaveService} from '../src/services/SaveService.js';
import {HomeScreen} from '../src/ui/screens/HomeScreen.js';
const base=new URL('../../build375/',import.meta.url);
const oldHome=existsSync(new URL('src/ui/screens/HomeScreen.js',base))?(await import(new URL('src/ui/screens/HomeScreen.js',base))).HomeScreen:null;
test('10 pre-clear home renderings are identical to Build375 aside from release label',{skip:!oldHome},()=>{
 globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
 for(const floor of [1,10,50,99,100])for(const lost of [false,true]){
  const s=new SaveService().state;s.player.maxFloor=floor;s.player.currentFloor=floor;
  if(lost){s.campaign100.endings=['defeat'];s.campaign100.heroEncounters310.finalArena.lastEnding='defeat';}
  assert.equal(HomeScreen(structuredClone(s)).replaceAll('3.1.60','VERSION'),oldHome(structuredClone(s)).replaceAll('3.1.55','VERSION'),`floor ${floor}, defeat ${lost}`);
 }
});
test('campaign generation, hero stats, rewards, skills and existing online logic are unchanged',{skip:!oldHome},()=>{
 const strip=s=>s.replace(/\?v=[\w.\-]+/g,'');
 for(const file of ['src/core/Campaign100System.js','src/core/CampaignDungeonLayoutSystem.js','src/core/CampaignHeroLoadoutSystem.js','src/core/CampaignEndgameBalance.js','src/core/CampaignRewardSystem.js','src/core/CampaignHeroEncounterSystem.js','src/battle/EnemyAI.js','src/battle/SkillSystem.js','src/online/OnlinePartyClient.js'])assert.equal(strip(readFileSync(new URL('../'+file,import.meta.url),'utf8')),strip(readFileSync(new URL(file,base),'utf8')),file);
});
