export function TenGodContactScreen(choices){return`<section class="ten-god-contact" aria-modal="true" role="dialog">
 <div class="ten-god-contact-scan"></div><div class="ten-god-contact-halo"></div>
 <div class="ten-god-contact-content">
  <small>UNKNOWN DIVINE SIGNAL / 01</small>
  <div class="ten-god-contact-sigil">◉</div>
  <p data-ten-god-line>時間が、止まった。</p>
  <p data-ten-god-line>足音も、風も、仲間の呼吸さえ聞こえない。</p>
  <p data-ten-god-line class="ten-god-voice">『地下を支配する者よ。』</p>
  <p data-ten-god-line class="ten-god-voice">『お前は、何を終わらせるために降りている。』</p>
  <div class="ten-god-contact-choices" data-ten-god-choices>${choices.map(choice=>`<button type="button" data-ten-god-choice="${choice.id}"><b>${choice.label}</b><small>${choice.description}</small><em>${choice.reward}</em></button>`).join("")}</div>
 </div>
</section>`}
