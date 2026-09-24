import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {CATCHES525,catch525,selectCatch525,atlasCSS525} from '../src/fishing/Catches525.js';
import {EXTRA_CATCHES533} from '../src/fishing/Catalog533.js';
import {knowledge532} from '../src/fishing/Knowledge532.js';
import {matchesGuide532} from '../src/fishing/Guide532.js';
import * as R from '../src/fishing/Rules524.js';
const rng=seed=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296};
const make=()=>{const g=R.makeFishing524({id:'533',code:'533',hostId:'p0',members:[{playerId:'p0',name:'you',choice:{speciesId:'slime'}}]});R.startFishing524(g,0,533);R.advanceFishing524(g,3000);return g};
test('533: every one of the 32 new real fish is reachable in ordinary play and has distinct art and learning notes',()=>{
 const seen=new Set(),random=rng(533);for(let i=0;i<60000;i++)seen.add(selectCatch525(i%4,random).id);
 assert.equal(EXTRA_CATCHES533.length,32);assert.equal(new Set(EXTRA_CATCHES533.map(f=>JSON.stringify(f.art525))).size,32);
 for(const f of EXTRA_CATCHES533){assert.ok(seen.has(f.id),f.id);assert.ok(f.real532&&!f.item525&&!f.exclusive525);assert.ok(existsSync(new URL('../'+atlasCSS525(f).url,import.meta.url)));const k=knowledge532(f);assert.ok(k.fact.length>12&&k.habitat);assert.equal(new URL(k.source.url).protocol,'https:')}
});
test('533: the new/deep filters expose exactly their fish, including deep fish also found in the market group',()=>{
 const fresh=CATCHES525.filter(f=>matchesGuide532(f,'new')),deep=CATCHES525.filter(f=>matchesGuide532(f,'deep'));
 assert.equal(fresh.length,32);assert.equal(deep.length,5);assert.ok(deep.some(f=>f.group532==='market'));assert.ok(deep.some(f=>f.id==='barreleye'));assert.ok(!matchesGuide532(catch525('moonray'),'real'));
});
test('533: upgrading a v6 active catch preserves weight, earned rod XP, bait and the pending boss encounter',()=>{
 const g=make(),p=g.players[0];g.rules524=6;g.theme532='ocean';R.cast524(g,p,.5,.4);p.rodXP531=17;p.score=321;p.baitItems530=[{...catch525('moonlure')}];const fish=p.fish,lord=JSON.stringify(g.lord526),bait=JSON.stringify(p.baitItems530);R.advanceFishing524(g,g.lastAt);
 assert.equal(g.rules524,8);assert.equal(g.theme532,'ocean');assert.equal(p.fish,fish);assert.equal(p.rodXP531,17);assert.equal(p.score,321);assert.equal(JSON.stringify(g.lord526),lord);assert.equal(JSON.stringify(p.baitItems530),bait);
});
test('533: all new fish can be cashed out once or used as bait with growth retained and manual aiming',()=>{
 for(const f of EXTRA_CATCHES533){const g=make(),p=g.players[0];Object.assign(p,{mode:'choice',fish:{...f,value:f.base,chainDepth525:0},choiceUntil:5000});assert.ok(R.continue525(g,p),f.id);assert.equal(p.mode,'aim');assert.equal(p.fish,null);assert.equal(p.pendingBait530.id,f.id);assert.ok(p.rodXP531>0);const xp=p.rodXP531;assert.ok(R.cast524(g,p,.5,.7));assert.ok(p.fish.kg>f.kg&&p.fish.rarity531>f.tier,f.id);Object.assign(p,{mode:'choice',choiceUntil:5000});R.choose524(g,p,'keep');const score=p.score;assert.ok(score>0);R.choose524(g,p,'keep');assert.equal(p.score,score);assert.equal(p.rodXP531,xp)}
});
test('533: new assets and modules are offline-cached and historical module aliases resolve to the current version',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),map=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports,assets=JSON.parse(readFileSync(new URL('../world-raid-offline533-assets.json',import.meta.url),'utf8'));
 for(const p of ['src/fishing/Catalog533.js','src/fishing/Knowledge533.js','src/fishing/Catches525.js','src/fishing/Renderer524.js']){assert.ok(assets.includes('./'+p));for(const [key,value]of Object.entries(map).filter(([k])=>k.split('?')[0]==='./'+p))assert.ok(value.endsWith(['src/fishing/Catches525.js','src/fishing/Renderer524.js'].includes(p)?'3.1.213-build534':'3.1.212-build533'),key)}
 for(const name of ['market','coast'])assert.ok(assets.includes('./assets/fishing533/'+name+'.webp'));
});
