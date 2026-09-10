import {monsterVisual} from './MonsterVisual.js?v=3.1.82-build402';

const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

export function heroAllianceBody396(presentation){
 const intro=presentation.retrospective?'勇者一行は、すでにあなたの仲間です。共闘の記録を紹介します。':'予言を越えた4人が、新たな旅をともにする仲間になりました。';
 return `<section class="hero-alliance396"><small class="hero-alliance396-eyebrow">A NEW ALLIANCE</small><p class="hero-alliance396-lead">${intro}</p><div class="hero-alliance396-party" aria-label="共闘する勇者4人">${presentation.members.map((hero,index)=>`<figure class="hero-alliance396-hero" style="--hero-arrival396:${index*90}ms"><div class="hero-alliance396-art">${monsterVisual({speciesId:hero.speciesId},hero.name,{className:'hero-alliance396-sprite'})}</div><figcaption><small>神話</small><b>${escape(hero.name)}</b><span>${hero.owned?'仲間一覧から編成できます':'現在は未所持'}</span></figcaption></figure>`).join('')}</div><p class="hero-alliance396-note">${presentation.retrospective?'加入済みの仲間・装備はそのままです。':'未所持の勇者と、専用武器4本を受け取りました。'}<br>「編成する」から、一緒に出発する仲間を選べます。</p><button type="button" class="hero-alliance396-formation" data-hero-alliance-formation>編成する</button></section>`;
}
