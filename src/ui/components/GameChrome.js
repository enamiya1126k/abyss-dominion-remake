function compact(value){
 const number=Math.max(0,Number(value)||0);
 if(number>=1_000_000_000)return`${Number((number/1_000_000_000).toFixed(number>=100_000_000_000?0:1))}B`;
 if(number>=1_000_000)return`${Number((number/1_000_000).toFixed(number>=100_000_000?0:1))}M`;
 if(number>=10_000)return`${Number((number/1_000).toFixed(number>=100_000?0:1))}K`;
 return Math.floor(number).toLocaleString();
}

export function resourceHud(state,{backId=null,title="",eyebrow="ABYSS DOMINION",settings=true}={}){
 const player=state.player??{},inventory=state.inventory??{};
 return`<header class="v2-screen-hud">
  ${backId?`<button type="button" id="${backId}" class="v2-hud-back" aria-label="戻る">←</button>`:""}
  <div class="v2-hud-title"><small>${eyebrow}</small>${title?`<h1>${title}</h1>`:""}</div>
  <div class="v2-hud-resources" aria-label="所持資源">
   <span title="現在階層"><i>🏰</i><b>${compact(player.currentFloor??1)}階</b></span>
   <span title="GOLD：${(player.gold??0).toLocaleString()}"><i>◉</i><b>${compact(player.gold)}</b></span>
   <span title="魔晶石：${(player.crystals??0).toLocaleString()}"><i>💎</i><b>${compact(player.crystals)}</b></span>
   <span title="捕獲結晶：${(inventory.captureCrystals??0).toLocaleString()}"><i>◈</i><b>${compact(inventory.captureCrystals)}</b></span>
   <span title="深淵の鍵：${(inventory.abyssKeys??0).toLocaleString()}"><i>🔑</i><b>${compact(inventory.abyssKeys)}</b></span>
   ${settings?'<button type="button" data-ui-settings aria-label="設定">⚙</button>':""}
  </div>
 </header>`;
}

const NAV_ITEMS=[
 ["explore","🏰","ダンジョン"],
 ["formation","♟","編成"],
 ["equipment","⚔","装備"],
 ["skills","✨","スキル"],
 ["inventory","🎒","持ち物"],
 ["shop","🏪","ショップ"],
 ["gacha","🔮","召喚"]
];

export function bottomNav(active){
 return`<nav class="v2-bottom-nav" aria-label="主要メニュー">
  ${NAV_ITEMS.map(([route,icon,label])=>`<button type="button" data-ui-route="${route}" class="${active===route?"active":""}" ${active===route?'aria-current="page"':""}><i>${icon}</i><b>${label}</b></button>`).join("")}
 </nav>`;
}

export function sectionTitle(title,sub=""){
 return`<div class="v2-section-title"><h2>${title}</h2>${sub?`<small>${sub}</small>`:""}</div>`;
}
