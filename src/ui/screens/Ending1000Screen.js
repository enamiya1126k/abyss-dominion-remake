const CREDITS=[
 "ABYSS DOMINION",
 "",
 "Planning & Direction",
 "THE DEMON KING",
 "",
 "Game Design",
 "ABYSS PROJECT",
 "",
 "Programming",
 "ABYSS PROJECT",
 "",
 "Special Thanks",
 "すべての魔王たちへ",
 "",
 "THANK YOU FOR PLAYING"
];

export function Ending1000Screen(){
 return `<section class="ending1000" role="dialog" aria-modal="true" aria-label="1000階エンディング">
  <div class="ending1000-noise"></div>
  <div class="ending1000-vignette"></div>
  <div class="ending1000-scene ending1000-prologue">
   <small>FLOOR 1000 — CONQUERED</small>
   <p data-ending-line="1">魔王軍は、人類最後の砦を陥落させた。</p>
   <p data-ending-line="2">長き戦いは終わり、世界には静寂が訪れた。</p>
   <p data-ending-line="3">地下1000階の支配者となった魔王の名は、永遠に刻まれる。</p>
  </div>
  <div class="ending1000-scene ending1000-credits" aria-hidden="true">
   <div class="ending1000-credit-roll">${CREDITS.map(line=>line?`<p>${line}</p>`:'<span></span>').join("")}</div>
  </div>
  <div class="ending1000-scene ending1000-anomaly" aria-hidden="true">
   <p>……………………</p>
   <strong>──終わりではない。</strong>
  </div>
  <button class="ending1000-skip" type="button">SKIP</button>
 </section>`;
}
