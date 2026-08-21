import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join} from "node:path";
import {inflateSync} from "node:zlib";

import {FLOOR_BOSS_CATALOG} from "../src/data/floorBosses.js?v=2.11.2-build166";
import {FLOOR_BOSS_SPRITE_FOLDERS,MONSTER_SPRITE_FOLDERS} from "../src/data/monsterCatalog.js?v=2.11.2-build166";
import {monsterSpriteUrl} from "../src/ui/MonsterVisual.js?v=2.11.2-build166";

const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const frames=["idle1","idle2","idle3","walk1","walk2","attack","damage","down"];
const firstRealm=FLOOR_BOSS_CATALOG.filter(boss=>boss.floor>=10&&boss.floor<=90);

function paeth(a,b,c){
 const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);
 return pa<=pb&&pa<=pc?a:pb<=pc?b:c;
}

function decodeRgbaPng(file){
 const source=readFileSync(file),signature=Buffer.from([137,80,78,71,13,10,26,10]);
 assert.deepEqual(source.subarray(0,8),signature,`${file}: PNG signature`);
 let offset=8,width=0,height=0,bitDepth=0,colorType=0,sawEnd=false;
 const idat=[];
 while(offset+12<=source.length){
  const length=source.readUInt32BE(offset),type=source.toString("ascii",offset+4,offset+8),dataStart=offset+8,dataEnd=dataStart+length;
  assert.ok(dataEnd+4<=source.length,`${file}: complete ${type} chunk`);
  if(type==="IHDR"){
   width=source.readUInt32BE(dataStart);height=source.readUInt32BE(dataStart+4);bitDepth=source[dataStart+8];colorType=source[dataStart+9];
  }else if(type==="IDAT")idat.push(source.subarray(dataStart,dataEnd));
  else if(type==="IEND"){sawEnd=true;break}
  offset=dataEnd+4;
 }
 assert.equal(sawEnd,true,`${file}: IEND`);assert.equal(bitDepth,8,`${file}: 8-bit`);assert.equal(colorType,6,`${file}: RGBA`);
 const packed=inflateSync(Buffer.concat(idat)),stride=width*4;
 assert.equal(packed.length,(stride+1)*height,`${file}: complete image data`);
 const pixels=Buffer.alloc(stride*height);let input=0;
 for(let y=0;y<height;y++){
  const filter=packed[input++];
  for(let x=0;x<stride;x++){
   const raw=packed[input++],left=x>=4?pixels[y*stride+x-4]:0,up=y?pixels[(y-1)*stride+x]:0,upLeft=y&&x>=4?pixels[(y-1)*stride+x-4]:0;
   const predictor=filter===0?0:filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):filter===4?paeth(left,up,upLeft):NaN;
   assert.ok(Number.isFinite(predictor),`${file}: valid filter`);pixels[y*stride+x]=(raw+predictor)&255;
  }
 }
 return{source,width,height,pixels};
}

function alphaBounds(image){
 let left=image.width,top=image.height,right=-1,bottom=-1;
 for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++)if(image.pixels[(y*image.width+x)*4+3]>=3){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y)}
 assert.ok(right>=left&&bottom>=top,"sprite contains visible pixels");
 return{left,top,right,bottom,width:right-left+1,height:bottom-top+1,centerX:(left+right)/2};
}

test("10F–90F bosses use nine dedicated visual identities",()=>{
 assert.equal(firstRealm.length,9);
 assert.deepEqual(firstRealm.map(boss=>boss.floor),[10,20,30,40,50,60,70,80,90]);
 assert.deepEqual(firstRealm.map(boss=>boss.visualSpeciesId),["floor_boss_010","floor_boss_020","floor_boss_030","floor_boss_040","floor_boss_050","floor_boss_060","floor_boss_070","floor_boss_080","floor_boss_090"]);
 assert.equal(new Set(firstRealm.map(boss=>boss.visualSpeciesId)).size,9);
 assert.equal(new Set(Object.values(FLOOR_BOSS_SPRITE_FOLDERS)).size,9);
 for(const boss of firstRealm){
  assert.equal(MONSTER_SPRITE_FOLDERS[boss.visualSpeciesId],FLOOR_BOSS_SPRITE_FOLDERS[boss.visualSpeciesId]);
  assert.match(monsterSpriteUrl({speciesId:boss.speciesId,visualSpeciesId:boss.visualSpeciesId},"idle1"),new RegExp(`${FLOOR_BOSS_SPRITE_FOLDERS[boss.visualSpeciesId]}/idle1\\.png\\?v=2\\.11\\.2-build166$`));
 }
 assert.notEqual(FLOOR_BOSS_CATALOG.find(boss=>boss.floor===110).visualSpeciesId,"floor_boss_010");
});

test("all 72 production frames are unique 512px RGBA sprites with safe margins",()=>{
 const hashes=new Set();let count=0,maxIdleCenterOffset=0,minMargin=512;
 for(const boss of firstRealm){
  const folder=FLOOR_BOSS_SPRITE_FOLDERS[boss.visualSpeciesId];
  for(const frame of frames){
   const file=join(root,"assets","monsters",folder,`${frame}.png`),image=decodeRgbaPng(file),bounds=alphaBounds(image);
   assert.equal(image.width,512);assert.equal(image.height,512);assert.ok(image.source.length>20_000,`${file}: substantial artwork`);
   const margins=[bounds.left,bounds.top,511-bounds.right,511-bounds.bottom];
   minMargin=Math.min(minMargin,...margins);assert.ok(Math.min(...margins)>=32,`${file}: 32px safe margin`);
   if(frame.startsWith("idle")){const offset=Math.abs(bounds.centerX-255.5);maxIdleCenterOffset=Math.max(maxIdleCenterOffset,offset);assert.ok(offset<=20,`${file}: centered idle pose`)}
   hashes.add(createHash("sha256").update(image.source).digest("hex"));count++;
  }
 }
 assert.equal(count,72);assert.equal(hashes.size,72);assert.equal(minMargin,32);assert.ok(maxIdleCenterOffset<=20);
});

test("runtime routes cover exploration, challenge and battle",()=>{
 const main=readFileSync(join(root,"src","main.js"),"utf8"),index=readFileSync(join(root,"index.html"),"utf8"),config=readFileSync(join(root,"src","core","config.js"),"utf8");
 assert.match(main,/visualSpeciesId:definition\.visualSpeciesId\?\?definition\.speciesId/);
 assert.match(main,/drawExplorationMonster\(world\.boss,\{speciesId:boss\.speciesId,visualSpeciesId:boss\.visualSpeciesId/);
 assert.match(index,/build166\.css\?v=2\.11\.2-build166/);assert.match(index,/ASSET_BUILD = "build166"/);
 assert.match(config,/APP_VERSION="2\.11\.2"/);
});
