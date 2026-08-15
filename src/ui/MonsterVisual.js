import{MONSTER_SPRITE_FOLDERS}from"../data/monsterCatalog.js?v=2.10.0";

const IDLE_FRAMES=Object.freeze(["idle1","idle2","idle3","idle2"]);
const VALID_FRAMES=new Set(["idle","idle1","idle2","idle3","walk1","walk2","attack","damage","down"]);
const SPRITE_ASSET_VERSION="2.8.0";

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
  return preferredId&&MONSTER_SPRITE_FOLDERS[preferredId]?preferredId:speciesId;
}

export function monsterSpriteUrl(subject,frame="idle"){
  if(typeof subject==="object"&&subject?.customVisualAsset)return String(subject.customVisualAsset);
  const visualId=monsterVisualId(subject),folder=MONSTER_SPRITE_FOLDERS[visualId];
  return folder?`./assets/monsters/${folder}/${fileFrame(frame)}.png?v=${SPRITE_ASSET_VERSION}`:null;
}

export function hasMonsterSprite(subject){
  return Boolean(typeof subject==="object"&&subject?.customVisualAsset)||Boolean(MONSTER_SPRITE_FOLDERS[monsterVisualId(subject)]);
}

export function monsterVisual(subject,fallbackEmoji="👹",{frame="idle",className=""}={}){
  const visualId=monsterVisualId(subject),requestedFrame=safeFrame(frame),normalizedFrame=fileFrame(requestedFrame),custom=Boolean(typeof subject==="object"&&subject?.customVisualAsset),url=monsterSpriteUrl(subject,normalizedFrame);
  const classes=["monster-visual",url?"has-pixel-sprite":"emoji-only",className].filter(Boolean).join(" ");
  const fallback=`<span class="monster-visual-fallback"${url?" hidden":""}>${escapeHtml(fallbackEmoji)}</span>`;
  if(!url)return`<span class="${classes}" data-monster-species="${escapeHtml(visualId)}">${fallback}</span>`;
  if(custom)return`<span class="${classes} has-custom-sprite" data-monster-species="${escapeHtml(visualId)}"><img src="${escapeHtml(url)}" alt="" draggable="false" data-monster-custom onerror="this.hidden=true;this.nextElementSibling.hidden=false">${fallback}</span>`;
  const base=url.slice(0,url.lastIndexOf("/"));
  const animationState=requestedFrame==="idle"?"idle":"static";
  return`<span class="${classes}" data-monster-species="${escapeHtml(visualId)}"><img src="${url}" alt="" draggable="false" data-monster-sprite data-sprite-base="${base}" data-frame="${normalizedFrame}" data-animation-state="${animationState}" onerror="this.dataset.spriteFailed='1';this.hidden=true;this.nextElementSibling.hidden=false">${fallback}</span>`;
}

export function setMonsterVisualFrame(root,frame="idle"){
  if(!root)return;
  const requestedFrame=safeFrame(frame),normalizedFrame=fileFrame(requestedFrame);
  const images=[];
  if(root.matches?.("[data-monster-sprite]"))images.push(root);
  images.push(...(root.querySelectorAll?.("[data-monster-sprite]")??[]));
  for(const image of images){
    const base=image.dataset.spriteBase;
    if(!base)continue;
    image.hidden=false;
    const fallback=image.nextElementSibling;
    if(fallback)fallback.hidden=true;
    delete image.dataset.spriteFailed;
    image.dataset.animationState=requestedFrame==="idle"?"idle":"static";
    image.dataset.frame=normalizedFrame;
    image.src=`${base}/${normalizedFrame}.png?v=${SPRITE_ASSET_VERSION}`;
  }
}

if(typeof window!=="undefined"&&typeof document!=="undefined"){
  let idleStep=0;
  const reducedMotion=window.matchMedia?.("(prefers-reduced-motion: reduce)");
  window.setInterval(()=>{
    if(reducedMotion?.matches)return;
    idleStep=(idleStep+1)%IDLE_FRAMES.length;
    const frame=IDLE_FRAMES[idleStep];
    for(const image of document.querySelectorAll('[data-monster-sprite][data-animation-state="idle"]')){
      if(!image.isConnected||image.dataset.spriteFailed==="1"||image.offsetParent===null)continue;
      const rect=image.getBoundingClientRect();
      if(rect.bottom<0||rect.top>window.innerHeight||rect.right<0||rect.left>window.innerWidth)continue;
      const base=image.dataset.spriteBase;
      if(!base||image.dataset.frame===frame)continue;
      image.dataset.frame=frame;
      image.src=`${base}/${frame}.png?v=${SPRITE_ASSET_VERSION}`;
    }
  },320);
}
