export function ShopScreen(state){
 return`<section class="screen">
  <div class="page">
   <div class="spread"><div><div class="eyebrow">SAFE ROOM</div><h1 class="hero-title">セレクトショップ</h1></div><button id="leaveShop">探索へ</button></div>
   <div class="panel"><div class="spread"><span>所持GOLD</span><b id="shopGold">${state.player.gold}</b></div></div>
   <div class="shop-grid">
    <button data-shop="bed"><span>🛏️</span><b>ベッド</b><small>100Gで全回復</small></button>
    <button data-shop="potion"><span>🧪</span><b>回復薬</b><small>50G</small></button>
    <button data-shop="capture"><span>💎</span><b>捕獲結晶</b><small>80G</small></button>
    <button data-shop="gear"><span>⚔️</span><b>ランダム装備</b><small>180G</small></button>
   </div>
  </div>
 </section>`;
}
