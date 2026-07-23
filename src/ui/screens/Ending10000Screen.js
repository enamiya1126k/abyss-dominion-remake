const CREDITS=[
 "ABYSS DOMINION REMAKE",
 "",
 "TRUE END — FLOOR 10000",
 "",
 "Planning / Game Design / Development",
 "ABYSS PROJECT",
 "",
 "Special Thanks",
 "深淵を歩き続けた、すべての魔王たちへ",
 "",
 "THE DOMINION CONTINUES",
 "",
 "THANK YOU FOR PLAYING"
];

export function Ending10000Screen(){
 return `<section class="ending10000" role="dialog" aria-modal="true" aria-label="10000階・真エンディング">
  <div class="ending10000-stars" aria-hidden="true"></div>
  <div class="ending10000-vignette" aria-hidden="true"></div>
  <div class="ending10000-scene ending10000-prologue">
   <small>FLOOR 10000 — THE FINAL BOUNDARY</small>
   <div class="ending10000-sigil">◉</div>
   <p data-true-ending-line>最後の境界を守る神は、静かに武器を下ろした。</p>
   <p data-true-ending-line>深淵も、十神も、もはや魔王を侵入者とは呼ばない。</p>
   <p data-true-ending-line>支配とは奪うことではない。歩み続け、世界の責任を背負うこと。</p>
   <p data-true-ending-line>地下10000階。ここに、真なる深淵の王が誕生した。</p>
  </div>
  <div class="ending10000-scene ending10000-dominion" aria-hidden="true">
   <small>ABYSS ACKNOWLEDGED</small>
   <strong>ABYSS DOMINION</strong>
   <p>──深淵は、あなたの領域となった。</p>
  </div>
  <div class="ending10000-scene ending10000-credits" aria-hidden="true">
   <div class="ending10000-credit-roll">${CREDITS.map(line=>line?`<p>${line}</p>`:"<span></span>").join("")}</div>
  </div>
  <button class="ending10000-skip" type="button">SKIP</button>
 </section>`;
}
