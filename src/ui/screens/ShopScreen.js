import{activeSecretRoom,CASINO_WIN_RATE,CASINO_PAYOUT_MULTIPLIER,DARK_MARKET_ITEM_LIMIT,SECRET_ROOM_RECOVERY_ITEMS}from"../../core/SecretRoomSystem.js?v=1.2.0";

function marketStatus(room){
 const remaining=(room?.offers??[]).filter(offer=>!offer.sold).length;
 const recoveryRemaining=SECRET_ROOM_RECOVERY_ITEMS.reduce((sum,item)=>sum+Math.max(0,DARK_MARKET_ITEM_LIMIT-(room?.recoveryPurchased?.[item.id]??0)),0);
 return`${remaining}点限定・回復薬 残${recoveryRemaining}`;
}

export function ShopScreen(state){
 const room=activeSecretRoom(state);
 if(!room)return`<section class="screen shop-screen secret-room-screen"><div class="page"><div class="spread"><div><div class="eyebrow">SECRET ROOM</div><h1 class="hero-title">深淵裏街</h1></div><button id="leaveShop">探索へ</button></div><div class="panel empty">部屋の記録が見つかりません。探索へ戻ってください。</div></div></section>`;
 const casino=room.casino??{};
 return`<section class="screen shop-screen secret-room-screen">
  <div class="page">
   <div class="spread secret-room-heading"><div><div class="eyebrow">SECRET ROOM・${room.floor}F</div><h1 class="hero-title">深淵裏街</h1></div><button id="leaveShop">探索へ</button></div>
   <div class="panel secret-room-wallet"><div><small>所持GOLD</small><b id="shopGold">${state.player.gold.toLocaleString()}G</b></div><span>この🚪だけの限定品</span></div>
   <div class="secret-room-grid">
    <button data-shop-menu="casino" class="secret-room-casino"><span>🎰</span><b>深淵スロット</b><small>当選 ${Math.round(CASINO_WIN_RATE*100)}%・配当 ${CASINO_PAYOUT_MULTIPLIER}倍</small><em>${casino.spins??0}回 / ${casino.wins??0}勝</em></button>
    <button data-shop-menu="inn" class="${room.rested?"used":""}"><span>🛏️</span><b>無料の宿</b><small>HP・MP・状態異常を完全回復</small><em>${room.rested?"利用済み":"この🚪で1回無料"}</em></button>
    <button data-shop-menu="market" class="secret-room-market"><span>🕶️</span><b>闇市場</b><small>SR〜神話・一点限りの裏商品</small><em>${marketStatus(room)}</em></button>
   </div>
   <p class="secret-room-note">品揃えと宿の利用状況は、この🚪を出ても維持されます。別の🚪ではすべて新しくなります。</p>
  </div>
 </section>`;
}
