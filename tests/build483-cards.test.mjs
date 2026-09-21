import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {PHOTO_CARDS483} from '../src/sugoroku/PhotoExpansion483.js';
import {CARDS463,SPECIALS463,DECK_COUNT463} from '../src/sugoroku/Catalog463.js';
import {CATALOG475,filteredCatalog475,catalogView475} from '../src/sugoroku/CardLibrary475.js';
import {CARD_CODES475} from '../src/sugoroku/CardCodes475.js';
import {photoFor468} from '../src/sugoroku/PhotoArt468.js';
import {cardBody476} from '../src/sugoroku/CardDesign476.js';
import {makeLobby463,start463,action463,settle463,botAction463,current463} from '../src/sugoroku/Engine463.js';
const newGame=(seed=1)=>{const g=makeLobby463({id:'sg463-483-1234abcd',code:'ABCDEF',partyId:'party',hostId:'p0',members:Array.from({length:4},(_,i)=>({playerId:'p'+i,name:'P'+i})),seed});start463(g,1000);return g};
const gems=g=>g.crystalReserve480+g.players.reduce((n,p)=>n+p.crystals474,0);
function give(g,p,c){const uid=Object.keys(g.cards).find(u=>g.cards[u]===c.id);for(const x of g.players)x.hand=x.hand.filter(u=>u!==uid);g.deck=g.deck.filter(u=>u!==uid);g.discard=g.discard.filter(u=>u!==uid);p.hand.push(uid);return uid}
function conserve(g){const uids=[...g.deck,...g.discard,...g.players.flatMap(p=>p.hand)];assert.equal(uids.length,DECK_COUNT463);assert.equal(new Set(uids).size,uids.length)}
function choices(g){let steps=0;while(g.pending){assert.ok(++steps<100,'choice loop');const q=g.pending,m=botAction463(g,q.playerId);assert.ok(m);action463(g,q.playerId,m,2000+steps)}}
test('64 distinct photo cards append stable B-117..B-180; all photos resolve in every card face',()=>{
 assert.equal(PHOTO_CARDS483.length,64);assert.equal(CARDS463.length,180);assert.equal(SPECIALS463.length,16);assert.equal(CATALOG475.length,196);
 assert.equal(new Set(CATALOG475.map(r=>r.code)).size,196);assert.equal(CARD_CODES475['basic:phoenix'],'B-116');assert.equal(CARD_CODES475['special:swift'],'S-016');
 const hashes=new Set();for(const [i,c] of PHOTO_CARDS483.entries()){
  assert.equal(CARD_CODES475['basic:'+c.id],`B-${117+i}`);assert.equal(c.copies,1);assert.ok(c.rankIndex466>=0);assert.equal(c.points,0);
  const photo=photoFor468(c);assert.equal(photo,c.photo483);const bytes=fs.readFileSync(new URL('../'+photo,import.meta.url));hashes.add(createHash('sha256').update(bytes).digest('hex'));
  const html=cardBody476(c,()=>'<span>fallback</span>');assert.ok(html.includes(photo));assert.match(html,/sg-photo483/);assert.doesNotMatch(html,/undefined|NaN/);
 }
 assert.equal(hashes.size,64);assert.ok(CARDS463.filter(c=>c.set).length===8);
 assert.match(catalogView475({},()=>''),/基本180種類・特殊16種類/);
 assert.equal(filteredCatalog475({catalog475:{tab:'basic',query:'B-180',limit:24}})[0].card.name,'ブルーベリーアイ');
 assert.equal(filteredCatalog475({catalog475:{tab:'basic',query:'宿毛 りおん ひで より えなみ',limit:24}}).length,1);
});
test('every new playable card and every new defense resolves through the real engine without losing cards or minting gems',()=>{
 for(const c of PHOTO_CARDS483){
  const g=newGame(483),p=g.players[0],uid=give(g,p,c),pool=gems(g);g.step='pre';
  for(const x of g.players){x.pos='30';x.trail=Array.from({length:31},(_,i)=>String(i));}
  // Give recovery effects a real discarded card to select.
  g.discard.push(g.deck.shift());
  if(c.defense){g.queue=[{type:'discard',n:1,actor:'p1',target:'p0',group:'defend-'+c.id,source:'card',harmful:true}];settle463(g);assert.equal(g.pending.kind,'defense');action463(g,'p0',{kind:'choice',value:uid},2000);}
  else {action463(g,'p0',{kind:'play',uid},2000);assert.equal(p.cardsUsed469,1);}
  choices(g);assert.equal(g.queue.length,0,c.name);conserve(g);assert.equal(gems(g),pool,c.name);
  assert.ok(g.players.every(x=>x.crystals474>=0));
 }
});
test('100 expanded-deck games finish, preserve all 405 cards and preserve the shared gem pool',()=>{
 let max=0;for(let seed=1;seed<=100;seed++){
  const g=newGame(seed),pool=gems(g);let steps=0;
  while(g.phase==='playing'){
   assert.ok(++steps<4000,`game ${seed} stalled`);const id=g.pending?.playerId??current463(g).playerId,m=botAction463(g,id);assert.ok(m,`no action in ${g.step}`);action463(g,id,m,1000+steps);conserve(g);assert.equal(gems(g),pool);
  }
  assert.ok(g.results.length);max=Math.max(max,steps);
 }
 console.log('Build483 expanded-deck simulation: 100 games; max actions',max);
});
