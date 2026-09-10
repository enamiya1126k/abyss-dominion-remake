import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {ENDGAME_CHARACTERS} from '../src/data/endgameCharacters.js';
import {ENDGAME_SPRITE_BOUNDS399} from '../src/data/endgameSpriteBounds399.js';
import {endgameSpriteBounds399,endgameArtFit399,ENDGAME_SPRITE_VERSION399} from '../src/ui/EndgameSprite399.js';
import {monsterVisual,monsterSpriteUrl,setMonsterVisualFrame} from '../src/ui/MonsterVisual.js';
import {MONSTER_SPRITE_FOLDERS,MONSTER_CUSTOM_SPRITE_BASES} from '../src/data/monsterCatalog.js';
import {RAID_VAJRA_SPRITE} from '../src/core/RaidPresentation.js';
const {PNG}=createRequire(import.meta.url)('pngjs');
const frames=['idle1','idle2','idle3','walk1','walk2','attack','damage','down'];
const root=new URL('../',import.meta.url);

test('all 17 characters have eight distinct real transparent PNGs inside the release bounds',()=>{
 assert.equal(Object.keys(ENDGAME_SPRITE_BOUNDS399).length,17);
 for(const id of Object.keys(ENDGAME_CHARACTERS)){
  const b=endgameSpriteBounds399(id),seen=new Set();assert.ok(b,id);
  for(const frame of frames){
   const bytes=fs.readFileSync(new URL(`assets/monsters/${MONSTER_SPRITE_FOLDERS[id]}/${frame}.png`,root));seen.add(bytes.toString('base64'));
   const im=PNG.sync.read(bytes);assert.equal(im.width,512);assert.equal(im.height,512);assert.ok(im.alpha);
   let zero=0,solid=0;for(let y=0;y<512;y++)for(let x=0;x<512;x++){const a=im.data[(y*512+x)*4+3];if(!a)zero++;if(a>=240)solid++;if(a){assert.ok(x>0&&x<511&&y>0&&y<511,`${id}/${frame} canvas edge`);assert.ok(x/512>=b.left&&x/512<b.right&&y/512>=b.top&&y/512<b.bottom,`${id}/${frame} bounds`);}}
   assert.ok(zero>1000&&solid>1000,`${id}/${frame} alpha`);
  }
  assert.equal(seen.size,8,`${id}: motion frames must not be repeated copies`);
 }
});

test('aliases and contract instances select repaired assets without changing ordinary or custom art',()=>{
 for(const id of Object.keys(ENDGAME_CHARACTERS)){
  const subject={speciesId:'slime',endgameBossId:id};
  assert.match(monsterSpriteUrl(subject),new RegExp(`/monsters/${MONSTER_SPRITE_FOLDERS[id]}/idle1.png`));
  assert.ok(monsterSpriteUrl(subject).endsWith('?v='+ENDGAME_SPRITE_VERSION399));
  const html=monsterVisual(subject,'x',{partyArt:true});assert.ok(html.includes('has-endgame-sprite399'));assert.ok(html.includes(`data-endgame-sprite399="${id}"`));
 }
 assert.ok(!monsterVisual('slime').includes('has-endgame-sprite399'));
 assert.ok(monsterSpriteUrl('slime').endsWith('?v=3.0.3-build303'));
 const custom={speciesId:'slime',endgameBossId:'ten_time',customVisualBase:'./private/test'};
 assert.ok(!monsterVisual(custom).includes('has-endgame-sprite399'));
 assert.ok(monsterSpriteUrl(custom).startsWith('./private/test-idle1.png'));
});

test('every explicit motion retains repaired cache keys and recovers from a failed image',()=>{
 for(const id of Object.keys(ENDGAME_CHARACTERS))for(const frame of [...frames,'idle','invalid']){
  const image={matches:()=>true,querySelectorAll:()=>[],hidden:true,dataset:{spriteBase:`./assets/monsters/${MONSTER_SPRITE_FOLDERS[id]}`,spriteVersion:ENDGAME_SPRITE_VERSION399,spriteFailed:'1'},nextElementSibling:{hidden:false}};
  setMonsterVisualFrame(image,frame);
  const expected=frames.includes(frame)?frame:'idle1';assert.ok(image.src.endsWith(`/${expected}.png?v=${ENDGAME_SPRITE_VERSION399}`));assert.equal(image.hidden,false);assert.equal(image.nextElementSibling.hidden,true);assert.equal(image.dataset.spriteFailed,undefined);
  assert.equal(image.dataset.animationState,['idle','invalid'].includes(frame)?'idle':'static');
 }
});

test('idle animation preserves version, skips static/offscreen art and respects reduced motion',()=>{
 const source=fs.readFileSync(new URL('../src/ui/MonsterVisual.js',import.meta.url),'utf8').replace(/^import.*;\n/gm,'').replace(/export /g,'');
 let tick,reduce=false;
 const make=(version,visible=true)=>({dataset:{spriteBase:'./assets/monsters/ten_time',spriteVersion:version,frame:'idle1',animationState:'idle'},isConnected:true,offsetParent:{},getBoundingClientRect:()=>({left:0,right:50,top:visible?0:1000,bottom:visible?50:1050})});
 const current=make(ENDGAME_SPRITE_VERSION399),ordinary=make(undefined),offscreen=make(ENDGAME_SPRITE_VERSION399,false);
 const context={endgameSpriteBounds399,ENDGAME_SPRITE_VERSION399,MONSTER_SPRITE_FOLDERS,MONSTER_CUSTOM_SPRITE_BASES,RAID_VAJRA_SPRITE,chapterTwoSprite383:()=>null,chapterTwoAtlasHtml383:()=>'',setChapterTwoAtlasFrame383(){},window:{innerHeight:800,innerWidth:400,matchMedia:()=>({get matches(){return reduce;}}),setInterval(fn){tick=fn;}},document:{querySelectorAll:()=>[current,ordinary,offscreen]}};
 vm.runInNewContext(source,context);tick();assert.ok(current.src.endsWith('/idle2.png?v='+ENDGAME_SPRITE_VERSION399));assert.ok(ordinary.src.endsWith('/idle2.png?v=3.0.3-build303'));assert.equal(offscreen.src,undefined);
 const previous=current.src;reduce=true;tick();assert.equal(current.src,previous);
});

test('all motion unions fit narrow and short battle slots without enlarging existing art',()=>{
 for(const b of Object.values(ENDGAME_SPRITE_BOUNDS399))for(const renderedSize of [64,128,256,512])for(const slotWidth of [46,80,160])for(const headroom of [30,90,220]){
  const width=renderedSize*(b.right-b.left),height=renderedSize*(b.bottom-b.top),scale=endgameArtFit399({width,height,slotWidth,headroom});
  assert.ok(scale>0&&scale<=1);assert.ok(width*scale<=slotWidth-8+1e-8);assert.ok(height*scale<=headroom+1e-8);
 }
 assert.equal(endgameSpriteBounds399('slime'),null);
});
