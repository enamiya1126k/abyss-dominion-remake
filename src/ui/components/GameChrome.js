function compact(value){
 const number=Math.max(0,Number(value)||0);
 if(number<100_000_000)return Math.floor(number).toLocaleString();
 if(number>=1_000_000_000)return`${Number((number/1_000_000_000).toFixed(number>=100_000_000_000?0:1))}B`;
 if(number>=100_000_000)return`${Number((number/1_000_000).toFixed(number>=100_000_000_000?0:1))}M`;
 return Math.floor(number).toLocaleString();
}

export function pixelIcon(name,className=""){
 return`<span class="home-pixel-icon icon-${name}${className?` ${className}`:""}" aria-hidden="true"></span>`;
}

const ITEM_ART=Object.freeze({
 gold:"gold",captureCrystals:"captureCrystals",capture:"captureCrystals",abyssKeys:"abyssKeys",key:"abyssKeys",
 potions:"potions",highPotions:"highPotions",partyPotions:"partyPotions",manaPotions:"manaPotions",highManaPotions:"highManaPotions",partyManaPotions:"partyManaPotions",fullManaPotions:"fullManaPotions",partyFullManaPotions:"partyFullManaPotions",reviveLeaves:"reviveLeaves",statusCures:"statusCures",partyStatusCures:"partyStatusCures",fullHeals:"fullHeals",partyFullHeals:"partyFullHeals"
});
export function itemIcon(id,className=""){
 const file=ITEM_ART[id]??"material";
 return`<img class="item-pixel-icon${className?` ${className}`:""}" src="assets/ui/items/${file}.png?v=2.8.0" alt="" aria-hidden="true" loading="eager" decoding="async">`;
}

export function resourceHud(state,{backId=null,title="",eyebrow="ABYSS DOMINION",settings=true,showFloor=true}={}){
 const player=state.player??{},inventory=state.inventory??{};
 return`<header class="v2-screen-hud${showFloor?"":" no-floor"}">
  ${backId?`<button type="button" id="${backId}" class="v2-hud-back" aria-label="戻る">←</button>`:""}
  <div class="v2-hud-title"><small>${eyebrow}</small>${title?`<h1>${title}</h1>`:""}</div>
  <div class="v2-hud-resources" aria-label="所持資源">
   ${showFloor?`<span title="現在階層" data-resource-help="floor" data-exact-number="${(player.currentFloor??1).toLocaleString()}階"><i>${pixelIcon("dungeon")}</i><b>${compact(player.currentFloor??1)}階</b></span>`:""}
   <span title="GOLD：${(player.gold??0).toLocaleString()}" data-resource-help="gold" data-exact-number="${(player.gold??0).toLocaleString()}G"><i>${itemIcon("gold")}</i><b id="goldHud">${compact(player.gold)}</b></span>
   <span title="魔晶石：${(player.crystals??0).toLocaleString()}" data-resource-help="crystal" data-exact-number="魔晶石 ${(player.crystals??0).toLocaleString()}"><i>${pixelIcon("crystal")}</i><b id="crystalHud">${compact(player.crystals)}</b></span>
   <span title="捕獲結晶：${(inventory.captureCrystals??0).toLocaleString()}" data-resource-help="capture" data-exact-number="捕獲結晶 ${(inventory.captureCrystals??0).toLocaleString()}"><i>${itemIcon("captureCrystals")}</i><b id="captureHud">${compact(inventory.captureCrystals)}</b></span>
   <span title="深淵の鍵：${(inventory.abyssKeys??0).toLocaleString()}" data-resource-help="key" data-exact-number="深淵の鍵 ${(inventory.abyssKeys??0).toLocaleString()}"><i>${itemIcon("abyssKeys")}</i><b id="keyHud">${compact(inventory.abyssKeys)}</b></span>
   ${settings?`<button type="button" data-ui-settings aria-label="設定">${pixelIcon("settings")}</button>`:""}
  </div>
 </header>`;
}

const NAV_ITEMS=[
 ["home","home","ホーム"],
 ["formation","formation","編成"],
 ["equipment","equipment","装備"],
 ["armory","dungeon","武器庫"],
 ["inventory","growth","持ち物"],
 ["skills","skills","スキル"]
];

export function bottomNav(active){
 return`<nav class="v2-bottom-nav" aria-label="主要メニュー">
  ${NAV_ITEMS.map(([route,icon,label])=>`<button type="button" data-ui-route="${route}" class="${active===route?"active":""}" ${active===route?'aria-current="page"':""}><i>${pixelIcon(icon)}</i><b>${label}</b></button>`).join("")}
 </nav>`;
}

export function sectionTitle(title,sub=""){
 return`<div class="v2-section-title"><h2>${title}</h2>${sub?`<small>${sub}</small>`:""}</div>`;
}
