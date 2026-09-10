import {CHAPTER_TWO_SPRITES392} from '../src/data/chapterTwoSprites392.js';
import {CHAPTER_TWO_SPRITES391} from '../src/data/chapterTwoSprites391.js';
import {CHAPTER_TWO_SPRITES390} from '../src/data/chapterTwoSprites390.js';
import {CHAPTER_TWO_SPRITES389} from '../src/data/chapterTwoSprites389.js';
import {CHAPTER_TWO_SPRITES388} from '../src/data/chapterTwoSprites388.js';
import {CHAPTER_TWO_SPRITES387} from '../src/data/chapterTwoSprites387.js';
import {CHAPTER_TWO_SPRITES386} from '../src/data/chapterTwoSprites386.js';
import {CHAPTER_TWO_SPRITES385} from '../src/data/chapterTwoSprites385.js';
import {CHAPTER_TWO_SPRITES384} from '../src/data/chapterTwoSprites384.js';
import {CHAPTER_TWO_SPRITES383} from '../src/data/chapterTwoSprites383.js';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {chapterTwoWorld,chapterTwoArea,chapterTwoState,chapterTwoObjective,beginChapterTwoRun} from '../src/chapterTwo/ChapterTwoSystem.js';
import {SaveService} from '../src/services/SaveService.js';
import {sectionIdAt,sectionBounds} from '../src/core/DungeonSectionSystem.js';
import {buildSectionMiniMapModel,fitMiniMapTransform,projectMiniMapPoint} from '../src/core/DungeonMiniMapSystem.js';
import {worldPresentationForFloor} from '../src/core/WorldSystem.js';
import {dungeonThemeForFloor,dungeonThemeForAttribute} from '../src/data/dungeonThemes.js';
import {monsterSpriteUrl,partyMonsterArtScale} from '../src/ui/MonsterVisual.js';
import {SPECIES} from '../src/data/species.js';
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const renderer=main.slice(main.indexOf('const explorationSpriteCache='),main.indexOf('function path(w,'));
function canvas(){let calls=0;const gradient={addColorStop(){}};const ctx=new Proxy({measureText:s=>({width:s.length*7}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get(o,k){return o[k]??((...args)=>{calls++;for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a),`${String(k)} has non-finite argument`);});}});return {width:390,height:560,getContext:()=>ctx,style:{},setAttribute(){},calls:()=>calls};}
function fixture(){
 globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};const s=new SaveService().state;s.player.maxFloor=100;s.player.currentFloor=100;s.campaign100.finalCompleted=true;chapterTwoState(s).introComplete=true;beginChapterTwoRun(s);
 const c=canvas(),mini=canvas();mini.width=mini.height=170;const context={CHAPTER_TWO_SPRITES383,CHAPTER_TWO_SPRITES384,CHAPTER_TWO_SPRITES385,CHAPTER_TWO_SPRITES386,CHAPTER_TWO_SPRITES387,CHAPTER_TWO_SPRITES388,CHAPTER_TWO_SPRITES389,CHAPTER_TWO_SPRITES390,CHAPTER_TWO_SPRITES391,CHAPTER_TWO_SPRITES392,TILE:88,performance,devicePixelRatio:1,save:{state:s},worldPresentationForFloor,dungeonThemeForFloor,dungeonThemeForAttribute,sectionBounds,sectionIdAt,buildSectionMiniMapModel,fitMiniMapTransform,projectMiniMapPoint,chapterTwoState,chapterTwoArea,chapterTwoObjective,calculatedStats:()=>({hp:100}),SPECIES,monsterSpriteUrl,partyMonsterArtScale,
 Image:class{constructor(){this.width=this.height=512;}set src(v){this.onload?.()}},document:{getElementById:id=>id==='miniMap'?mini:c,querySelector:()=>null,createElement:()=>canvas()},campaignWorldBosses:w=>w.bosses??[],campaignWorldTrophyChests:()=>[],campaignObjectSection:(w,o)=>o?.sectionId??sectionIdAt(w,o?.x,o?.y),ensureExploreDecorations:w=>w.decorations??[],explorationPartyMembers:()=>s.monsters.filter(m=>s.party.includes(m.id)),currentExplorePerformanceProfile:()=>({})};
 vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../src/ui/ChapterTwoSprite383.js',import.meta.url),'utf8').replace(/^import.*;\n/gm,'').replace(/\bexport /g,''),context);vm.runInContext(main.split('\n').filter(l=>l.startsWith('class Camera')).join('\n')+'\nglobalThis.Camera=Camera;',context);vm.runInContext(renderer,context);vm.runInContext(main.slice(main.indexOf('function drawChapterTwoFieldLabels()')),context);
 return{s,c,context};
}
test('actual first-chapter renderer and minimap draw all 30 chapter-two rooms at mobile/desktop widths',()=>{
 const {s,c,context}=fixture(),before=JSON.stringify(s.campaign100);
 for(let area=0;area<5;area++)for(const width of [320,390,768,1280])for(let room=0;room<6;room++){
  const run=s.chapterTwo376.run;run.area=area;run.room=room;run.visited=[0,1,2,3,4,5];const w=chapterTwoWorld(run),p=w.sections[room].center;c.width=width;
  const g={chapterTwo:true,world:w,player:{...p,rx:p.x,ry:p.y,path:[]},ctx:c.getContext('2d'),canvas:c,camera:new context.Camera(c),running:true,partyTrail:[],chapterTwoObjects:[]};g.camera.reset(p.x*88,p.y*88);context.game=g;
  vm.runInContext('draw();draw()',context);assert.ok(c.calls()>0);
 }
 assert.equal(JSON.stringify(s.campaign100),before);
});
