import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {EXTRA_CATCHES534,LITTER_IDS534} from '../src/fishing/Catalog534.js';
import {KNOWLEDGE534,litterNote534} from '../src/fishing/Knowledge534.js';
import {CATCHES525,catch525,selectCatch525,canChain525,atlasCSS525,artFrame525} from '../src/fishing/Catches525.js';
import {matchesGuide532,guide532} from '../src/fishing/Guide532.js';
import * as R from '../src/fishing/Rules524.js';
const rng=seed=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296};
const make=()=>{const g=R.makeFishing524({id:'534',code:'534',hostId:'p0',members:[{playerId:'p0',name:'you',choice:{speciesId:'slime'}}]});R.startFishing524(g,0,534);R.advanceFishing524(g,3000);return g};
const step=(g,ms)=>{const end=g.lastAt+ms;while(g.lastAt<end&&g.phase==='play')R.advanceFishing524(g,g.lastAt+50)};
const choice=(g,id)=>{const p=g.players[0];Object.assign(p,{mode:'choice',fish:{...catch525(id),value:catch525(id).base},choiceUntil:g.elapsed+5000});return p};
test('534: every new fish and litter item is reachable, while combined litter/curio odds remain 4 percent',()=>{
 const random=rng(534),seen=new Set();let trash=0,odd=0;for(let i=0;i<60000;i++){const f=selectCatch525(i%4,random);seen.add(f.id);trash+=!!f.trash534;odd+=!!f.trash534||['boot','slipper','mossycat','bicycle'].includes(f.id)}
 assert.ok(odd/60000>.035&&odd/60000<.045);assert.ok(trash/60000>.022&&trash/60000<.032);
 for(const f of EXTRA_CATCHES534){assert.ok(seen.has(f.id),f.id);assert.ok(existsSync(new URL('../'+atlasCSS525(f).url,import.meta.url)));const uv=artFrame525(f);assert.ok(uv.x>=0&&uv.y>=0&&uv.x+uv.w<=1.001&&uv.y+uv.h<=1.001);if(f.real532)assert.ok(KNOWLEDGE534[f.id].source.url.startsWith('https://'));else assert.ok(litterNote534(f).quip)}
 console.log('LITTER534',JSON.stringify({draws:60000,combinedOddRate:odd/60000,litterRate:trash/60000,newSeen:EXTRA_CATCHES534.filter(f=>seen.has(f.id)).length}));
});
test('534: garbage cannot become bait, cannot be chained, and manual recovery pays only once',()=>{
 for(const id of LITTER_IDS534){const g=make(),p=choice(g,id);p.bait=1;p.baitItems530=[{...catch525('moonlure')}];p.rodXP531=11;
  assert.equal(canChain525(p.fish),false);assert.equal(R.continue525(g,p),false);assert.equal(R.choose524(g,p,'continue'),false);assert.equal(R.choose524(g,p,'bait'),false);assert.equal(p.mode,'choice');assert.equal(p.rodXP531,11);assert.equal(p.score,0);
  const value=p.fish.value;assert.ok(R.choose524(g,p,'keep'));assert.equal(p.score,value);assert.equal(R.choose524(g,p,'keep'),false);assert.equal(p.score,value);assert.equal(p.bait,1);assert.equal(p.baitItems530[0].id,'moonlure');assert.equal(p.rodXP531,11);assert.equal(p.mode,'rest');step(g,600);assert.equal(p.mode,'idle');
 }
});
test('534: landed trash gives a recovery choice, automatically recovers on timeout and at game end',()=>{
 for(const finish of [false,true]){const g=make(),p=choice(g,'oldtire');Object.assign(p,{mode:'landing',landedAt:g.elapsed});step(g,2100);assert.equal(p.mode,'choice');assert.equal(p.score,0);if(finish)R.finishFishing524(g);else step(g,5100);assert.equal(p.score,15);assert.equal(p.bait,0);assert.equal(p.records.filter(f=>f.id==='oldtire').length,1)}
});
test('534: bait casts and fixed reward recipes never become new trash',()=>{
 const random=rng(54);for(let i=0;i<10000;i++)assert.ok(!selectCatch525(i%4,random,{bait:true}).trash534);
 for(const [bait,id]of [['boot','hermit'],['slipper','bicycle'],['bicycle','wallet'],['moonlure','moonray']])assert.equal(selectCatch525(0,random,{previous:catch525(bait)}).id,id);
});
test('534: poison, venomous spines and injury warnings are distinct; garbage is not listed as a real animal',()=>{
 for(const id of ['spottedknifejaw','blueparrotfish','pantherpuffer','scrawledfilefish'])assert.equal(KNOWLEDGE534[id].danger,'food');
 for(const id of ['rabbitfish','stripedcatfish','velvetfish','devilstinger'])assert.equal(KNOWLEDGE534[id].danger,'spine');
 for(const id of ['needlefish','kidako'])assert.equal(KNOWLEDGE534[id].danger,'injury');
 for(const [filter,n]of [['all',152],['new',32],['real',88],['shore',24],['trash',8],['danger',14]])assert.equal(CATCHES525.filter(f=>matchesGuide532(f,filter)).length,n,filter);
 for(const id of LITTER_IDS534)assert.equal(matchesGuide532(catch525(id),'real'),false);
 const html=guide532({filter:'trash'});assert.ok(html.includes('ゴーストフィッシング'));assert.equal((html.match(/rel="noopener noreferrer"/g)??[]).length,96);
});
test('534: v7 migration preserves an active hook, accumulated XP and scheduled lord',()=>{
 const g=make(),p=g.players[0];g.rules524=7;g.theme532='deep';R.cast524(g,p,.5,.3);p.rodXP531=18;p.score=178;const fish=p.fish,lord=JSON.stringify(g.lord526);R.advanceFishing524(g,g.lastAt);assert.equal(g.rules524,8);assert.equal(p.fish,fish);assert.equal(p.score,178);assert.equal(p.rodXP531,18);assert.equal(JSON.stringify(g.lord526),lord);assert.equal(g.theme532,'deep');
});
test('534: updated art and shared modules are present in the new cache and mapped version',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),map=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports,assets=JSON.parse(readFileSync(new URL('../world-raid-offline534-assets.json',import.meta.url),'utf8'));
 for(const path of ['src/fishing/Catalog534.js','src/fishing/Knowledge534.js','src/fishing/Catches525.js','src/fishing/Rules524.js','src/fishing/View524.js']){assert.ok(assets.includes('./'+path));assert.ok(Object.entries(map).filter(([k])=>k.split('?')[0]==='./'+path).every(([,v])=>v.endsWith('3.1.213-build534')))}
 for(const name of ['shore','finds'])assert.ok(assets.includes('./assets/fishing534/'+name+'.webp'));assert.ok(html.includes('build534-fishing.css'));
});
