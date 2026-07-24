const MONSTER_SPRITE_FOLDERS=Object.freeze({
  slime:"001_slime",
  baby_slime:"002_baby_slime",
  cave_rat:"003_cave_rat",
  bat:"004_bat",
  caterpillar:"005_caterpillar",
  skeleton:"006_skeleton",
  goblin:"007_goblin",
  acid_slime:"008_acid_slime",
  mushroom:"009_mushroom",
  centipede:"010_centipede",
  fang_rat:"011_fang_rat",
  ember_slime:"012_ember_slime",
  skeleton_archer:"013_skeleton_archer",
  zombie:"014_zombie",
  vampire_bat:"015_vampire_bat",
  goblin_guard:"016_goblin_guard",
  thorn_bud:"017_thorn_bud",
  frost_slime:"018_frost_slime"
});

const IDLE_FRAMES=Object.freeze(["idle1","idle2","idle3","idle2"]);
const VALID_FRAMES=new Set(["idle","idle1","idle2","idle3","walk1","walk2","attack","damage","down"]);

function safeFrame(frame){
  return VALID_FRAMES.has(frame)?frame:"idle";
}

function fileFrame(frame){
  return safeFrame(frame)==="idle"?"idle1":safeFrame(frame);
}

function escapeHtml(value){
  return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}

export function monsterSpriteUrl(speciesId,frame="idle"){
  const folder=MONSTER_SPRITE_FOLDERS[speciesId];
  return folder?`./assets/monsters/${folder}/${fileFrame(frame)}.png`:null;
}

export function hasMonsterSprite(speciesId){
  return Boolean(MONSTER_SPRITE_FOLDERS[speciesId]);
}

export function monsterVisual(speciesId,fallbackEmoji="👹",{frame="idle",className=""}={}){
  const requestedFrame=safeFrame(frame),normalizedFrame=fileFrame(requestedFrame),url=monsterSpriteUrl(speciesId,normalizedFrame);
  const classes=["monster-visual",url?"has-pixel-sprite":"emoji-only",className].filter(Boolean).join(" ");
  const fallback=`<span class="monster-visual-fallback"${url?" hidden":""}>${escapeHtml(fallbackEmoji)}</span>`;
  if(!url)return`<span class="${classes}" data-monster-species="${escapeHtml(speciesId)}">${fallback}</span>`;
  const base=url.slice(0,url.lastIndexOf("/"));
  const animationState=requestedFrame==="idle"?"idle":"static";
  return`<span class="${classes}" data-monster-species="${escapeHtml(speciesId)}"><img src="${url}" alt="" draggable="false" data-monster-sprite data-sprite-base="${base}" data-frame="${normalizedFrame}" data-animation-state="${animationState}" onerror="this.dataset.spriteFailed='1';this.hidden=true;this.nextElementSibling.hidden=false">${fallback}</span>`;
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
    image.src=`${base}/${normalizedFrame}.png`;
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
      const base=image.dataset.spriteBase;
      if(!base||image.dataset.frame===frame)continue;
      image.dataset.frame=frame;
      image.src=`${base}/${frame}.png`;
    }
  },320);
}
