const MONSTER_SPRITE_FOLDERS=Object.freeze({
  slime:"001_slime",
  baby_slime:"002_baby_slime"
});

const VALID_FRAMES=new Set(["idle","walk1","walk2","attack","damage","down"]);

function safeFrame(frame){
  return VALID_FRAMES.has(frame)?frame:"idle";
}

function escapeHtml(value){
  return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}

export function monsterSpriteUrl(speciesId,frame="idle"){
  const folder=MONSTER_SPRITE_FOLDERS[speciesId];
  return folder?`./assets/monsters/${folder}/${safeFrame(frame)}.png`:null;
}

export function hasMonsterSprite(speciesId){
  return Boolean(MONSTER_SPRITE_FOLDERS[speciesId]);
}

export function monsterVisual(speciesId,fallbackEmoji="👹",{frame="idle",className=""}={}){
  const normalizedFrame=safeFrame(frame),url=monsterSpriteUrl(speciesId,normalizedFrame);
  const classes=["monster-visual",url?"has-pixel-sprite":"emoji-only",className].filter(Boolean).join(" ");
  const fallback=`<span class="monster-visual-fallback"${url?" hidden":""}>${escapeHtml(fallbackEmoji)}</span>`;
  if(!url)return`<span class="${classes}" data-monster-species="${escapeHtml(speciesId)}">${fallback}</span>`;
  const base=url.slice(0,url.lastIndexOf("/"));
  return`<span class="${classes}" data-monster-species="${escapeHtml(speciesId)}"><img src="${url}" alt="" draggable="false" data-monster-sprite data-sprite-base="${base}" data-frame="${normalizedFrame}" onerror="this.hidden=true;this.nextElementSibling.hidden=false">${fallback}</span>`;
}

export function setMonsterVisualFrame(root,frame="idle"){
  if(!root)return;
  const normalizedFrame=safeFrame(frame);
  const images=[];
  if(root.matches?.("[data-monster-sprite]"))images.push(root);
  images.push(...(root.querySelectorAll?.("[data-monster-sprite]")??[]));
  for(const image of images){
    const base=image.dataset.spriteBase;
    if(!base)continue;
    image.hidden=false;
    const fallback=image.nextElementSibling;
    if(fallback)fallback.hidden=true;
    image.dataset.frame=normalizedFrame;
    image.src=`${base}/${normalizedFrame}.png`;
  }
}
