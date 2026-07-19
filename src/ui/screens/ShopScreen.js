export function ShopScreen(state){
 const d=state.shop?.discount??0;
 const discountLabel=d?`本日の装備召喚 ${d}%OFF`:"本日の割引なし";
 return`<section class="screen shop-screen">
  <div class="page">
   <div class="spread"><div><div class="eyebrow">SAFE ROOM</div><h1 class="hero-title">深淵商店街</h1></div><button id="leaveShop">探索へ</button></div>
   <div class="panel"><div class="spread"><span>所持GOLD</span><b id="shopGold">${state.player.gold}</b></div><small class="muted">魔晶石 ${state.player.crystals}　／　${discountLabel}</small></div>
   <div class="shop-grid">
    <button data-shop-menu="bed"><span>🛏️</span><b>宿屋</b><small>全回復 180G</small></button>
    <button data-shop-menu="herb"><span>🌿</span><b>薬草屋</b><small>回復・状態異常アイテム</small></button>
    <button data-shop-menu="capture"><span>💎</span><b>捕獲商人</b><small>捕獲結晶 420G〜</small></button>
    <button data-shop-menu="gear"><span>🎰</span><b>装備召喚</b><small>複数ガチャ・割引あり</small></button>
   </div>
  </div>
 </section>`;
}