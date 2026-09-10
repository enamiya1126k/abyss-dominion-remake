import {endgameSpriteBounds399,ENDGAME_SPRITE_VERSION399} from './EndgameSprite399.js?v=3.1.79-build399';
import {chapterTwoSprite383,chapterTwoAtlasHtml383,setChapterTwoAtlasFrame383} from './ChapterTwoSprite383.js?v=3.1.82-build402';
import{RAID_VAJRA_SPRITE}from"../core/RaidPresentation.js?v=3.1.48-build368";
import{MONSTER_SPRITE_FOLDERS,MONSTER_CUSTOM_SPRITE_BASES}from"../data/monsterCatalog.js?v=3.0.9-build309";

const IDLE_FRAMES=Object.freeze(["idle1","idle2","idle3","idle2"]);
const VALID_FRAMES=new Set(["idle","idle1","idle2","idle3","walk1","walk2","attack","damage","down"]);
const SPRITE_ASSET_VERSION="3.0.3-build303";
let idleStep=0;

function safeFrame(frame){
  return VALID_FRAMES.has(frame)?frame:"idle";
}

function fileFrame(frame){
  return safeFrame(frame)==="idle"?"idle1":safeFrame(frame);
}

function escapeHtml(value){
  return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}

function baseSpeciesId(subject){
  return typeof subject==="string"?subject:subject?.speciesId??null;
}

export function monsterVisualId(subject){
  const speciesId=baseSpeciesId(subject);
  if(typeof subject!=="object"||!subject)return speciesId;
  const preferredId=subject.visualSpeciesId??subject.endgameBossId;
  return preferredId&&(MONSTER_SPRITE_FOLDERS[preferredId]||chapterTwoSprite383(preferredId))?preferredId:speciesId;
}

function customSpriteBase(subject){
 if(typeof subject==="object"&&subject?.weeklyRaidBossId==="vajra-beast")return RAID_VAJRA_SPRITE;
 if(typeof subject==="object"&&subject?.customVisualBase)return String(subject.customVisualBase);
 return MONSTER_CUSTOM_SPRITE_BASES[monsterVisualId(subject)]??null;
}

export function monsterSpriteUrl(subject,frame="idle"){
  const atlas=chapterTwoSprite383(subject);if(atlas)return atlas.url;
  const customBase=customSpriteBase(subject);
  if(customBase)return`${customBase}-${fileFrame(frame)}.png?v=${SPRITE_ASSET_VERSION}`;
  if(typeof subject==="object"&&subject?.customVisualAsset)return String(subject.customVisualAsset);
  const visualId=monsterVisualId(subject),folder=MONSTER_SPRITE_FOLDERS[visualId];
  return folder?`./assets/monsters/${folder}/${fileFrame(frame)}.png?v=${endgameSpriteBounds399(visualId)?ENDGAME_SPRITE_VERSION399:SPRITE_ASSET_VERSION}`:null;
}

export function hasMonsterSprite(subject){
  return Boolean(chapterTwoSprite383(subject))||Boolean(customSpriteBase(subject))||Boolean(typeof subject==="object"&&subject?.customVisualAsset)||Boolean(MONSTER_SPRITE_FOLDERS[monsterVisualId(subject)]);
}

// Floor bosses and endgame characters share the visible-pixel art layout.
export function partyMonsterArtScale(monster){
  return monster&&(monster.floorBossCatalogId||monster.floorBossId||monster.obtainedMethod==="floorBossContract"||monster.endgameBossId)?2:1;
}

export function monsterVisual(subject,fallbackEmoji="👹",{frame="idle",className="",partyArt=false}={}){
  const visualId=monsterVisualId(subject),requestedFrame=safeFrame(frame),normalizedFrame=requestedFrame==="idle"?IDLE_FRAMES[idleStep]:fileFrame(requestedFrame),customBase=customSpriteBase(subject),custom=Boolean(customBase||typeof subject==="object"&&subject?.customVisualAsset),url=monsterSpriteUrl(subject,normalizedFrame);
  const endgame=!custom&&Boolean(endgameSpriteBounds399(visualId));
  const enlarged=partyArt&&partyMonsterArtScale(subject)>1;
  const classes=["monster-visual",url?"has-pixel-sprite":"emoji-only",className,enlarged?"party-floor-boss-art":"",endgame?"has-endgame-sprite399":""].filter(Boolean).join(" ");
  const art=content=>enlarged?`<span class="party-monster-art-layer">${content}</span>`:content;
  const fallback=`<span class="monster-visual-fallback"${url?" hidden":""}>${escapeHtml(fallbackEmoji)}</span>`;
  if(!url)return`<span class="${classes}" data-monster-species="${escapeHtml(visualId)}">${art(fallback)}</span>`;
  if(chapterTwoSprite383(visualId))return `<span class="${classes} has-chapter-atlas383" data-source-facing="${chapterTwoSprite383(visualId).facing??'left'}" data-monster-species="${escapeHtml(visualId)}">${chapterTwoAtlasHtml383(visualId,normalizedFrame,requestedFrame==="idle"?"idle":"static")}</span>`;
  if(customBase){const animationState=requestedFrame==="idle"?"idle":"static";return`<span class="${classes} has-custom-sprite" data-monster-species="${escapeHtml(visualId)}">${art(`<img src="${escapeHtml(url)}" alt="" draggable="false" data-monster-custom data-monster-sprite data-custom-sprite-base="${escapeHtml(customBase)}" data-frame="${normalizedFrame}" data-animation-state="${animationState}" onerror="this.dataset.spriteFailed='1';this.hidden=true;this.nextElementSibling.hidden=false">${fallback}`)}</span>`}
  if(custom)return`<span class="${classes} has-custom-sprite" data-monster-species="${escapeHtml(visualId)}">${art(`<img src="${escapeHtml(url)}" alt="" draggable="false" data-monster-custom onerror="this.hidden=true;this.nextElementSibling.hidden=false">${fallback}`)}</span>`;
  const base=url.slice(0,url.lastIndexOf("/"));
  const animationState=requestedFrame==="idle"?"idle":"static";
  return`<span class="${classes}" data-monster-species="${escapeHtml(visualId)}">${art(`<img src="${url}" alt="" draggable="false" data-monster-sprite ${endgame?`data-endgame-sprite399="${escapeHtml(visualId)}" data-sprite-version="${ENDGAME_SPRITE_VERSION399}"`:""} data-sprite-base="${base}" data-frame="${normalizedFrame}" data-animation-state="${animationState}" onerror="this.dataset.spriteFailed='1';this.hidden=true;this.nextElementSibling.hidden=false">${fallback}`)}</span>`;
}

export function setMonsterVisualFrame(root,frame="idle"){
  if(!root)return;
  const requestedFrame=safeFrame(frame),normalizedFrame=fileFrame(requestedFrame);
  const images=[];
  if(root.matches?.("[data-monster-sprite]"))images.push(root);
  images.push(...(root.querySelectorAll?.("[data-monster-sprite]")??[]));
  for(const image of images){
    if(image.dataset.monsterAtlas){setChapterTwoAtlasFrame383(image,normalizedFrame,requestedFrame==="idle"?"idle":"static");continue;}
    const base=image.dataset.spriteBase??image.dataset.customSpriteBase;
    if(!base)continue;
    image.hidden=false;
    const fallback=image.nextElementSibling;
    if(fallback)fallback.hidden=true;
    delete image.dataset.spriteFailed;
    image.dataset.animationState=requestedFrame==="idle"?"idle":"static";
    image.dataset.frame=normalizedFrame;
    image.src=image.dataset.customSpriteBase?`${base}-${normalizedFrame}.png?v=${SPRITE_ASSET_VERSION}`:`${base}/${normalizedFrame}.png?v=${image.dataset.spriteVersion??SPRITE_ASSET_VERSION}`;
  }
}

if(typeof window!=="undefined"&&typeof document!=="undefined"){
  const reducedMotion=window.matchMedia?.("(prefers-reduced-motion: reduce)");
  window.setInterval(()=>{
    if(reducedMotion?.matches)return;
    idleStep=(idleStep+1)%IDLE_FRAMES.length;
    const frame=IDLE_FRAMES[idleStep];
    for(const image of document.querySelectorAll('[data-monster-sprite][data-animation-state="idle"]')){
      if(!image.isConnected||image.dataset.spriteFailed==="1"||(!image.dataset.monsterAtlas&&image.offsetParent===null))continue;
      const rect=image.getBoundingClientRect();
      if(rect.bottom<0||rect.top>window.innerHeight||rect.right<0||rect.left>window.innerWidth)continue;
      if(image.dataset.monsterAtlas){setChapterTwoAtlasFrame383(image,frame,"idle");continue;}
      const base=image.dataset.spriteBase??image.dataset.customSpriteBase;
      if(!base||image.dataset.frame===frame)continue;
      image.dataset.frame=frame;
      image.src=image.dataset.customSpriteBase?`${base}-${frame}.png?v=${SPRITE_ASSET_VERSION}`:`${base}/${frame}.png?v=${image.dataset.spriteVersion??SPRITE_ASSET_VERSION}`;
    }
  },320);
}
